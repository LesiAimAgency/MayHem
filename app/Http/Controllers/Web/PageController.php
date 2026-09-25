<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MhCompany;
use App\Models\MhCustomFilter;
use App\Models\MhSector;
use App\Models\User;
use App\Services\FinancialMetricService;
use App\Services\ScreenerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class PageController extends Controller
{
    public function __construct(
        protected FinancialMetricService $metricService,
        protected ScreenerService $screenerService
    ) {}

    /**
     * Báo Cáo Tổng Hợp (Overview Screener)
     */
    public function overview(Request $request): View
    {
        $sectors = MhSector::all();
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();

        // Fetch custom filters from mh_custom_filters table
        $customFilters = MhCustomFilter::where('sector_id', 1)->get();

        // Initial screener results: 28 companies matching by default (all active banks)
        $screenerResult = [
            'total_companies' => $companies->count(),
            'matched_companies' => $companies,
            'matched_count' => $companies->count(), // 28 active banks by default
            'sector_averages' => [],
        ];

        $activeYears = $this->metricService->getActiveYears();
        $allReports = \App\Models\MhFinancialReport::whereIn('short_name', $companies->pluck('short_name'))
            ->whereIn('report_year', $activeYears)
            ->orderBy('report_year', 'asc')
            ->get()
            ->groupBy('short_name');

        // Pre-formatted banks data with real metrics from database
        $banksData = $companies->map(function ($c) use ($allReports) {
            $companyReports = $allReports->get($c->short_name) ?? collect();
            $history = [];

            foreach ($companyReports as $r) {
                $raw = $r->calculated_data['raw_metrics'] ?? [];
                $ind = $r->calculated_data['indicators'] ?? [];

                $llr = $raw['llr_coverage'] ?? null;
                if ($llr !== null && $llr > 0 && $llr < 10) {
                    $llr = round($llr * 100, 2);
                }

                $depr = $raw['depreciation'] ?? null;
                $toi = $raw['toi'] ?? null;
                $totalLiab = $raw['total_liabilities'] ?? null;
                $ownersEq = $raw['owners_equity'] ?? null;

                $history[] = [
                    'year' => (int) $r->report_year,
                    'cir' => $raw['cir'] ?? null,
                    'cpkh_toi' => $ind['depreciation_toi'] ?? (($depr && $toi) ? round(($depr / $toi) * 100, 2) : null),
                    'blvh' => $ind['operating_margin'] ?? null,
                    'blntt' => $ind['pbt_margin'] ?? null,
                    'blnst' => $ind['parent_npat_margin'] ?? null,
                    'ttlr' => $ind['growth_parent_npat'] ?? null,
                    'roa' => $raw['roa'] ?? null,
                    'debt_equity' => $ind['debt_equity'] ?? (($totalLiab && $ownersEq) ? round($totalLiab / $ownersEq, 2) : null),
                    'roe' => $raw['roe'] ?? null,
                    'cfo' => $raw['cfo'] ?? null,
                    'parent_npat' => $raw['parent_npat'] ?? null,
                    'casa' => $raw['casa_ratio'] ?? null,
                    'npl' => $raw['npl_ratio'] ?? null,
                    'nim' => $raw['nim'] ?? null,
                    'car' => $raw['car_ratio'] ?? null,
                    'llr' => $llr,
                ];
            }

            // Ưu tiên lấy số liệu năm hiện tại - 1 làm năm gần nhất
            $targetYear = (int) date('Y') - 1;
            $targetRecord = null;
            foreach ($history as $h) {
                if ($h['year'] === $targetYear) {
                    $targetRecord = $h;
                    break;
                }
            }
            $latest = $targetRecord ?? (!empty($history) ? end($history) : []);

            return array_merge([
                'ticker' => $c->short_name,
                'name' => $c->company_name,
                'exchange' => $c->exchange ?? 'HOSE',
                'industry' => 'ngan-hang',
                'history' => $history,
            ], $latest);
        })->values();

        // Calculate industry averages for latest year and historical years
        $metricKeys = ['cir', 'cpkh_toi', 'blvh', 'blntt', 'blnst', 'ttlr', 'roa', 'debt_equity', 'roe', 'cfo', 'casa', 'npl', 'nim', 'car', 'llr'];
        $sectorAverages = [];
        foreach ($metricKeys as $key) {
            $vals = $banksData->pluck($key)->filter(fn($v) => $v !== null && is_numeric($v));
            $sectorAverages[$key] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
        }

        $activeYears = $this->metricService->getActiveYears();
        $maxReportYear = !empty($activeYears) ? max($activeYears) : (int) (\App\Models\MhFinancialReport::max('report_year') ?? (int) date('Y'));
        $minReportYear = !empty($activeYears) ? min($activeYears) : 2018;

        $annualAverages = [];
        for ($year = $minReportYear; $year <= $maxReportYear; $year++) {
            foreach ($metricKeys as $key) {
                $vals = $banksData->map(function($b) use ($year, $key) {
                    foreach ($b['history'] as $h) {
                        if ($h['year'] == $year && isset($h[$key]) && is_numeric($h[$key])) {
                            return $h[$key];
                        }
                    }
                    return null;
                })->filter(fn($v) => $v !== null);
                $annualAverages[$year][$key] = $vals->count() > 0 ? round($vals->avg(), 2) : 0;
            }
        }

        return view('reports.overview', [
            'sectors' => $sectors,
            'companies' => $companies,
            'banksData' => $banksData,
            'customFilters' => $customFilters,
            'sectorAverages' => $sectorAverages,
            'annualAverages' => $annualAverages,
            'screenerResult' => $screenerResult,
        ]);
    }

    /**
     * Báo Cáo Đơn Lẻ (Factsheet)
     */
    public function factsheet(Request $request, ?string $ticker = null): View|JsonResponse
    {
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();
        $defaultTicker = $companies->first()?->short_name ?? 'ABB';

        // Resolve ticker from query param, cookie, session, or default
        $resolvedTicker = $ticker 
            ?? $request->input('ticker') 
            ?? $request->cookie('mayhem_selected_ticker') 
            ?? session('mayhem_selected_ticker') 
            ?? $defaultTicker;

        $resolvedTicker = strtoupper($resolvedTicker);

        if (!$companies->contains('short_name', $resolvedTicker)) {
            $resolvedTicker = $defaultTicker;
        }

        session(['mayhem_selected_ticker' => $resolvedTicker]);
        cookie()->queue('mayhem_selected_ticker', $resolvedTicker, 60 * 24 * 30);

        $factsheet = $this->metricService->getBankFactsheet($resolvedTicker);
        $sectors = MhSector::all();

        if ($request->ajax() || $request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->input('ajax') == '1') {
            return response()->json([
                'status' => 'success',
                'selectedTicker' => $resolvedTicker,
                'factsheet' => $factsheet,
                'sectors' => $sectors,
                'table_html' => view('reports.partials.factsheet-table', [
                    'factsheet' => $factsheet,
                ])->render(),
                'edit_modal_html' => view('reports.partials.factsheet-edit-modal', [
                    'factsheet' => $factsheet,
                    'companies' => $companies,
                    'sectors' => $sectors,
                    'selectedTicker' => $resolvedTicker,
                ])->render(),
            ]);
        }

        return view('reports.factsheet', [
            'sectors' => $sectors,
            'companies' => $companies,
            'selectedTicker' => $resolvedTicker,
            'factsheet' => $factsheet,
        ]);
    }

    /**
     * Cập nhật số liệu tài chính FILL và tự động tính toán lại các chỉ tiêu TÍNH
     */
    public function updateMetrics(Request $request): JsonResponse
    {
        try {
            $ticker = strtoupper($request->input('ticker', $request->json('ticker', '')));
            $updates = $request->input('updates', $request->json('updates', []));

            if (empty($ticker) || empty($updates) || !is_array($updates)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu cập nhật không hợp lệ hoặc thiếu mã cổ phiếu.',
                ], 422);
            }

            $factsheet = $this->metricService->batchUpdateMetrics($ticker, $updates);
            $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();
            $sectors = MhSector::all();

            return response()->json([
                'status' => 'success',
                'message' => 'Đã lưu thay đổi và tự động tính toán lại các chỉ tiêu TÍNH thành công!',
                'selectedTicker' => $ticker,
                'factsheet' => $factsheet,
                'table_html' => view('reports.partials.factsheet-table', [
                    'factsheet' => $factsheet,
                ])->render(),
                'edit_modal_html' => view('reports.partials.factsheet-edit-modal', [
                    'factsheet' => $factsheet,
                    'companies' => $companies,
                    'sectors' => $sectors,
                    'selectedTicker' => $ticker,
                ])->render(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Update metrics failed: ' . $e->getMessage(), [
                'ticker' => $request->input('ticker'),
                'exception' => $e,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi máy chủ khi cập nhật: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Báo Cáo So Sánh (Comparison)
     */
    public function comparison(Request $request): View|JsonResponse
    {
        $sectors = MhSector::all();
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();
        $tickersInput = $request->input('tickers', 'ACB,ABB,VCB');
        $tickers = array_filter(array_map('trim', explode(',', $tickersInput)));

        if (empty($tickers)) {
            $tickers = ['ACB', 'ABB', 'VCB'];
        }

        $activeYears = $this->metricService->getActiveYears();
        $minActiveYear = !empty($activeYears) ? min($activeYears) : 2018;
        $maxActiveYear = !empty($activeYears) ? max($activeYears) : (int) date('Y');

        // Chỉ hiển thị đúng các năm ACTIVE có dữ liệu thực tế (2018 -> 2025)
        $allYears = $activeYears;

        // Chỉ cho phép chọn từ các năm ACTIVE có dữ liệu thực tế
        $reqFrom = $request->input('from_year');
        $reqTo = $request->input('to_year');

        $fromYear = ($request->filled('from_year') && in_array((int)$reqFrom, $activeYears))
            ? (int)$reqFrom
            : $minActiveYear;

        $toYear = ($request->filled('to_year') && in_array((int)$reqTo, $activeYears))
            ? (int)$reqTo
            : $maxActiveYear;

        if ($fromYear > $toYear) {
            [$fromYear, $toYear] = [$toYear, $fromYear];
        }
        $mode = ($fromYear !== $toYear) ? '10years' : 'latest';

        $comparison = $this->metricService->getComparison($tickers, $toYear, $mode, $fromYear, $toYear);

        if ($request->ajax() || $request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest' || $request->input('ajax') == '1') {
            return response()->json([
                'status' => 'success',
                'tickers' => $tickers,
                'from_year' => $fromYear,
                'to_year' => $toYear,
                'active_years' => $activeYears,
                'mode' => $comparison['mode'],
                'year' => $comparison['year'],
                'years' => $comparison['years'],
                'matrix_html' => view('reports.partials.comparison-matrix', [
                    'comparison' => $comparison,
                    'companies' => $companies,
                    'activeYears' => $activeYears,
                ])->render(),
                'charts_html' => view('reports.partials.comparison-charts', [
                    'comparison' => $comparison,
                ])->render(),
            ]);
        }

        return view('reports.comparison', [
            'sectors'         => $sectors,
            'companies'       => $companies,
            'selectedTickers' => $tickers,
            'comparison'      => $comparison,
            'mode'            => $comparison['mode'],
            'allYears'        => $allYears,
            'activeYears'     => $activeYears,
            'fromYear'        => $fromYear,
            'toYear'          => $toYear,
        ]);
    }

    /**
     * Backward-compatibility aliases
     */
    public function wireframe1(Request $request): View { return $this->overview($request); }
    public function wireframe2(Request $request, ?string $ticker = null): View { return $this->factsheet($request, $ticker); }
    public function wireframe3(Request $request): View { return $this->comparison($request); }

    /**
     * Users Management Page
     */
    public function users(Request $request): View
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $adminCount = User::where('role', 'admin')->count();

        return view('users.index', [
            'users' => $users,
            'totalUsers' => $totalUsers,
            'activeUsers' => $activeUsers,
            'adminCount' => $adminCount,
        ]);
    }
}
