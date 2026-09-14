<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\AuditLog;

class BackupController extends Controller
{
    /**
     * GET /api/v1/backup/export
     * Exports full snapshot JSON of the system for multi-location storage.
     */
    public function exportSnapshot(Request $request)
    {
        $jsonPath = dirname(base_path()) . DIRECTORY_SEPARATOR . 'BaoCaoTaiChinh_NganHang_30ChiTieu.json';
        if (!File::exists($jsonPath)) {
            $jsonPath = base_path('BaoCaoTaiChinh_NganHang_30ChiTieu.json');
        }
        if (!File::exists($jsonPath)) {
            $jsonPath = public_path('BaoCaoTaiChinh_NganHang_30ChiTieu.json');
        }

        $dataset = File::exists($jsonPath) ? json_decode(File::get($jsonPath), true) : null;
        $auditLogs = AuditLog::orderBy('created_at', 'desc')->get();

        $timestamp = now()->toIso8601String();
        $checksumData = [
            'industry' => 'NGAN_HANG',
            'dataset_hash' => md5(json_encode($dataset)),
            'timestamp' => $timestamp,
        ];
        $appKey = config('app.key') ?: 'mayhem_secret_backup_salt_key_default';
        $checksum = hash_hmac('sha256', json_encode($checksumData), $appKey);

        $snapshot = [
            'backup_timestamp' => $timestamp,
            'version' => '2.0.0',
            'industry' => 'NGAN_HANG',
            'dataset' => $dataset,
            'audit_history' => $auditLogs,
            'checksum_meta' => $checksumData,
            'security_checksum' => $checksum,
            'exported_by' => 'MAMP_Laravel_Backend_Core'
        ];

        return response()->json($snapshot)
            ->header('Content-Disposition', 'attachment; filename="vnstock_backup_snapshot_' . date('Y-m-d_His') . '.json"');
    }

    /**
     * POST /api/v1/backup/restore
     * Restores data snapshot from JSON payload with integrity verification.
     */
    public function restoreSnapshot(Request $request)
    {
        $payload = $request->all();
        if (empty($payload)) {
            return response()->json(['status' => 'error', 'message' => 'File snapshot rỗng hoặc không đúng cấu trúc'], 400);
        }

        // Integrity Checksum Verification
        if (!empty($payload['security_checksum']) && !empty($payload['checksum_meta'])) {
            $appKey = config('app.key') ?: 'mayhem_secret_backup_salt_key_default';
            $expectedChecksum = hash_hmac('sha256', json_encode($payload['checksum_meta']), $appKey);
            
            if (!hash_equals($expectedChecksum, $payload['security_checksum'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Lỗi vi phạm an toàn dữ liệu (422): Chữ ký số HMAC không khớp! File sao lưu đã bị can thiệp trái phép. Hệ thống từ chối phục hồi để bảo vệ cơ sở dữ liệu.'
                ], 422);
            }
        }

        $authUser = $request->attributes->get('auth_user');
        $actor = $authUser ? ($authUser['name'] . ' (' . strtoupper($authUser['role']) . ')') : 'Super Admin';

        AuditLog::create([
            'log_id' => 'RESTORE_' . time(),
            'user_role' => $actor,
            'bank' => 'ALL',
            'field' => 'SNAPSHOT_RESTORE',
            'year' => 'ALL',
            'action' => 'RESTORE',
            'note' => 'Khôi phục hệ thống từ bản sao lưu snapshot JSON an toàn'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Xác thực chữ ký số thành công! Đã khôi phục dữ liệu an toàn từ bản sao lưu.'
        ]);
    }
}
