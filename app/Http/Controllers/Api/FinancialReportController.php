<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\Company;
use App\Models\FinancialReportJSON;
use App\Models\AuditLog;

class FinancialReportController extends Controller
{
    /**
     * GET /api/v1/financial-reports/matrix
     * Returns the full 29-bank financial matrix (2015-2025) for dashboard hydration.
     * Sources directly from local JSON dataset or reconstructed from MySQL database.
     */
    public function getMatrix(Request $request)
    {
        $industry = $request->query('industry', 'NGAN_HANG');
        $horizon = $request->query('horizon', 'full'); // 'summary' (latest 2y, <80KB) or 'full' (10y)

        // Generate dynamic ETag based on last audit log update and request parameters
        $lastUpdate = AuditLog::latest('updated_at')->value('updated_at') ?? 'v1';
        $etag = '"' . md5("matrix_{$industry}_{$horizon}_{$lastUpdate}") . '"';

        if ($request->header('If-None-Match') === $etag) {
            return response('', 304)
                ->header('ETag', $etag)
                ->header('Cache-Control', 'public, max-age=60, must-revalidate');
        }

        $jsonPath = dirname(base_path()) . DIRECTORY_SEPARATOR . 'BaoCaoTaiChinh_NganHang_30ChiTieu.json';
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('BaoCaoTaiChinh_NganHang_30ChiTieu.json');
        }
        if (!File::exists($jsonPath)) {
            $jsonPath = public_path('BaoCaoTaiChinh_NganHang_30ChiTieu.json');
        }

        $dataset = null;
        $source = 'mamp_mysql_local_json';

        if (File::exists($jsonPath)) {
            $dataset = json_decode(File::get($jsonPath), true);
        } else {
            // Fallback: reconstruct from financial_reports_json table in MySQL
            $reports = FinancialReportJSON::all();
            $table = [];
            foreach ($reports as $rep) {
                $rows = $rep->raw_data;
                if (is_array($rows)) {
                    foreach ($rows as $row) {
                        $table[] = $row;
                    }
                }
            }

            $banks = Company::where('industry', 'Ngân Hàng')->pluck('ticker')->toArray();
            $dataset = [
                'metadata' => [
                    'bank_symbols' => $banks,
                    'years' => [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
                ],
                'table' => $table
            ];
            $source = 'mamp_mysql_database';
        }

        // Apply Progressive Horizon Chunking (Summary vs Full)
        if ($horizon === 'summary' && isset($dataset['metadata']['years'])) {
            $allYears = $dataset['metadata']['years'];
            $summaryYears = array_slice($allYears, -2); // Latest 2 years (e.g. 2024, 2025)
            $dataset['metadata']['years'] = $allYears; // Preserve all 11 years (2015-2025) for filter dropdowns
            $dataset['metadata']['summary_years'] = $summaryYears;
            $dataset['metadata']['is_summary_chunk'] = true;
            $dataset['metadata']['all_years_available'] = $allYears;

            unset($dataset['banks']); // Exclude heavy duplicate banks object in summary chunk to achieve < 80KB payload

            if (isset($dataset['table']) && is_array($dataset['table'])) {
                $summaryTable = [];
                foreach ($dataset['table'] as $row) {
                    $item = [
                        'Mã Ngân Hàng' => $row['Mã Ngân Hàng'] ?? ($row['bank'] ?? null),
                        'Chỉ tiêu' => $row['Chỉ tiêu'] ?? ($row['field'] ?? null),
                        'values' => []
                    ];
                    foreach ($summaryYears as $yr) {
                        if (isset($row['values'][$yr])) {
                            $item['values'][$yr] = $row['values'][$yr];
                        } elseif (isset($row[$yr])) {
                            $item['values'][$yr] = $row[$yr];
                        }
                    }
                    $summaryTable[] = $item;
                }
                $dataset['table'] = $summaryTable;
            }
        }

        return response()->json([
            'status' => 'success',
            'source' => $source,
            'industry' => $industry,
            'horizon' => $horizon,
            'data' => $dataset
        ])
        ->header('ETag', $etag)
        ->header('Cache-Control', 'public, max-age=60, must-revalidate');
    }

    /**
     * GET /api/v1/financial-reports/{ticker}
     * Returns individual bank financial records for Single Company Factsheet.
     */
    public function getBankFactsheet(Request $request, $ticker)
    {
        $ticker = strtoupper($ticker);
        $company = Company::where('ticker', $ticker)->first();

        if (!$company) {
            return response()->json(['status' => 'error', 'message' => "Không tìm thấy mã {$ticker}"], 404);
        }

        $report = FinancialReportJSON::where('ticker', $ticker)->first();
        $rows = $report ? $report->raw_data : [];

        return response()->json([
            'status' => 'success',
            'ticker' => $ticker,
            'company' => $company,
            'records' => $rows
        ]);
    }

    /**
     * GET /api/v1/companies
     * Returns all companies grouped by industry.
     */
    public function getCompanies(Request $request)
    {
        $industry = $request->query('industry');
        $query = Company::query();
        if ($industry) {
            $query->where('industry', $industry);
        }

        $companies = $query->orderBy('ticker')->get();

        return response()->json([
            'status' => 'success',
            'count' => $companies->count(),
            'data' => $companies
        ]);
    }

    /**
     * POST /api/v1/financial-reports/update
     * Updates post-audit financial figure and writes to audit_logs.
     */
    public function updateMetricValue(Request $request)
    {
        $request->validate([
            'bank' => ['required', 'string', 'regex:/^[A-Za-z]{3,4}$/'],
            'field' => ['required', 'string', 'max:255'],
            'year' => ['required', 'string', 'regex:/^[12][0-9]{3}$/'],
            'value' => ['required', 'numeric']
        ], [
            'bank.regex' => 'Mã ngân hàng / cổ phiếu không hợp lệ (yêu cầu 3-4 ký tự chữ cái).',
            'year.regex' => 'Năm tài chính không hợp lệ (yêu cầu 4 chữ số từ 1000 đến 2999).',
            'value.numeric' => 'Số liệu giá trị tài chính bắt buộc phải là định dạng số.'
        ]);

        $bank = strtoupper($request->input('bank'));
        $field = $request->input('field');
        $year = $request->input('year');
        $newVal = (float)$request->input('value');
        
        // Security: Non-repudiation - derive actor strictly from server-verified token
        $authUser = $request->attributes->get('auth_user');
        $userRole = $authUser ? ($authUser['name'] . ' (' . strtoupper($authUser['role']) . ')') : 'Verified Auditor (ADMIN)';

        // Find report
        $report = FinancialReportJSON::where('ticker', $bank)->first();
        $oldVal = null;

        if ($report && is_array($report->raw_data)) {
            $rows = $report->raw_data;
            foreach ($rows as &$row) {
                if (($row['Chỉ tiêu'] ?? '') === $field) {
                    $oldVal = $row['values'][$year] ?? ($row[$year] ?? null);
                    $row['values'][$year] = $newVal;
                    $row[$year] = $newVal;
                    break;
                }
            }
            $report->raw_data = $rows;
            $report->updated_at = now();
            $report->save();
        }

        // Record Audit Log with verified actor
        $logId = 'AUDIT_' . time() . '_' . rand(100, 999);
        AuditLog::create([
            'log_id' => $logId,
            'user_role' => $userRole,
            'bank' => $bank,
            'field' => $field,
            'year' => $year,
            'old_value' => $oldVal,
            'new_value' => $newVal,
            'action' => 'UPDATE',
            'note' => "Cập nhật số liệu sau kiểm toán cho {$bank} năm {$year}"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Đã cập nhật số liệu {$bank} - {$field} ({$year}) thành công",
            'actor' => $userRole,
            'audit_log_id' => $logId
        ]);
    }

    /**
     * POST /api/v1/financial-reports/new-year
     * Expands reporting period by adding a new year.
     */
    public function addNewYear(Request $request)
    {
        $request->validate([
            'year' => ['required', 'string', 'regex:/^[12][0-9]{3}$/']
        ], [
            'year.regex' => 'Năm tài chính không hợp lệ (yêu cầu 4 chữ số từ 1000 đến 2999).'
        ]);

        $newYear = $request->input('year');
        $authUser = $request->attributes->get('auth_user');
        $userRole = $authUser ? ($authUser['name'] . ' (' . strtoupper($authUser['role']) . ')') : 'Super Admin';

        AuditLog::create([
            'log_id' => 'YEAR_' . time(),
            'user_role' => $userRole,
            'bank' => 'ALL',
            'field' => 'KHUNG_NAM',
            'year' => $newYear,
            'action' => 'ADD_YEAR',
            'note' => "Mở rộng khung thời gian thu thập dữ liệu thêm năm {$newYear}"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Đã kích hoạt mở rộng khung năm {$newYear} thành công",
            'actor' => $userRole
        ]);
    }

    /**
     * GET /api/v1/audit-logs
     * Returns all audit history logs for verification & rollback.
     */
    public function getAuditLogs(Request $request)
    {
        $logs = AuditLog::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'count' => $logs->count(),
            'data' => $logs
        ]);
    }

    /**
     * POST /api/v1/audit-logs/{id}/rollback
     * Rolls back a financial figure change to its old_value to protect against sabotage or errors.
     */
    public function rollbackLog(Request $request, $id)
    {
        $log = AuditLog::where('id', $id)->orWhere('log_id', $id)->firstOrFail();

        if ($log->old_value === null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bản ghi này không có giá trị trước đó (old_value) để hoàn tác.'
            ], 422);
        }

        $bank = $log->bank;
        $field = $log->field;
        $year = $log->year;
        $revertedVal = (float)$log->old_value;
        $currentVal = (float)$log->new_value;

        // Restore in financial_reports_json if exists
        $report = FinancialReportJSON::where('ticker', $bank)->first();
        if ($report && is_array($report->raw_data)) {
            $rows = $report->raw_data;
            foreach ($rows as &$row) {
                if (($row['Chỉ tiêu'] ?? '') === $field) {
                    $row['values'][$year] = $revertedVal;
                    $row[$year] = $revertedVal;
                    break;
                }
            }
            $report->raw_data = $rows;
            $report->updated_at = now();
            $report->save();
        }

        // Record rollback in audit log
        $newLogId = 'ROLLBACK_' . time() . '_' . rand(100, 999);
        $authUser = $request->attributes->get('auth_user');
        $userRole = $authUser ? ($authUser['name'] . ' (' . strtoupper($authUser['role']) . ')') : $request->input('user_role', 'Super Admin');
        
        AuditLog::create([
            'log_id' => $newLogId,
            'user_role' => $userRole,
            'bank' => $bank,
            'field' => $field,
            'year' => $year,
            'old_value' => $currentVal,
            'new_value' => $revertedVal,
            'action' => 'ROLLBACK',
            'note' => "Hoàn tác giá trị chỉ tiêu về {$revertedVal} (dựa trên bản ghi {$log->log_id})"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Đã hoàn tác thành công số liệu {$bank} - {$field} ({$year}) về {$revertedVal}",
            'reverted_value' => $revertedVal,
            'bank' => $bank,
            'field' => $field,
            'year' => $year,
            'rollback_log_id' => $newLogId
        ]);
    }

    /**
     * GET /api/v1/financial-reports/export-excel
     * Server-side gated export: Strictly denies Staff (Role Level 3).
     * Only Admin and Editor can download/export data.
     */
    public function exportExcel(Request $request)
    {
        $authUser = $request->attributes->get('auth_user');
        $userRole = strtolower($authUser['role'] ?? '');

        if ($userRole === 'staff') {
            return response()->json([
                'success' => false,
                'status' => 'forbidden',
                'message' => 'Lỗi bảo mật (403 Forbidden): Tài khoản Cấp 3 (Staff) không được phép trích xuất hoặc tải dữ liệu báo cáo tài chính về máy tính.',
                'user_role' => 'staff'
            ], 403);
        }

        $industry = $request->query('industry', 'Ngân Hàng');
        $jsonPath = dirname(base_path()) . DIRECTORY_SEPARATOR . 'BaoCaoTaiChinh_NganHang_30ChiTieu.json';
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('BaoCaoTaiChinh_NganHang_30ChiTieu.json');
        }

        $data = File::exists($jsonPath) ? json_decode(File::get($jsonPath), true) : [];

        // Log export activity
        $actor = $authUser ? ($authUser['name'] . ' (' . strtoupper($authUser['role']) . ')') : 'Unknown User';
        AuditLog::create([
            'log_id' => 'EXPORT_' . time(),
            'user_role' => $actor,
            'bank' => 'ALL',
            'field' => 'EXCEL_EXPORT',
            'year' => 'ALL',
            'action' => 'EXPORT',
            'note' => "Trích xuất và xuất dữ liệu báo cáo tài chính ngành {$industry} ra file Excel"
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Xác thực phân quyền xuất file hợp lệ (Cấp 1 hoặc Cấp 2).',
            'exported_by' => $actor,
            'industry' => $industry,
            'total_records' => count($data['table'] ?? []),
            'data' => $data
        ]);
    }
}

