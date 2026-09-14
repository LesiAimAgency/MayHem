<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\FinancialReportJSON;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    /**
     * Test 1: Unauthenticated request to sensitive endpoints must return 401 Unauthorized.
     */
    public function test_unauthenticated_request_is_blocked_with_401(): void
    {
        $user = User::create([
            'name' => 'Target User',
            'email' => 'target@mayhem.vn',
            'password' => bcrypt('password'),
            'role' => 'staff'
        ]);

        $response = $this->putJson("/api/v1/auth/users/{$user->id}/role", [
            'role' => 'admin'
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'status' => 'unauthorized'
            ]);
    }

    /**
     * Test 2: Privilege Escalation Attack.
     * Staff (Level 3) tries to change another user's role to Super Admin -> Must return 403 Forbidden.
     */
    public function test_staff_cannot_escalate_privileges_blocked_with_403(): void
    {
        $user = User::create([
            'name' => 'Staff User Target',
            'email' => 'target2@mayhem.vn',
            'password' => bcrypt('password'),
            'role' => 'staff'
        ]);

        $staffToken = 'mayhem_test_staff_token';
        Cache::put("mayhem_token_{$staffToken}", [
            'id' => 99,
            'name' => 'Chuyên Viên Phân Tích',
            'email' => 'staff@mayhem.vn',
            'role' => 'staff'
        ], now()->addHour());

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$staffToken}"
        ])->putJson("/api/v1/auth/users/{$user->id}/role", [
            'role' => 'admin'
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'status' => 'forbidden'
            ]);
    }

    /**
     * Test 3: Server-side Export Gating.
     * Staff (Level 3) tries to export data -> Must return 403 Forbidden.
     */
    public function test_staff_cannot_export_excel_server_side_gating(): void
    {
        $staffToken = 'mayhem_test_staff_token_export';
        Cache::put("mayhem_token_{$staffToken}", [
            'id' => 3,
            'name' => 'Chuyên Viên Phân Tích',
            'email' => 'staff@mayhem.vn',
            'role' => 'staff'
        ], now()->addHour());

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$staffToken}"
        ])->getJson('/api/v1/financial-reports/export-excel');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'status' => 'forbidden'
            ]);
    }

    /**
     * Test 4: Server-side Export Allowed for Editor & Admin.
     */
    public function test_editor_and_admin_can_export_excel(): void
    {
        $editorToken = 'mayhem_test_editor_token_export';
        Cache::put("mayhem_token_{$editorToken}", [
            'id' => 2,
            'name' => 'Kiểm Toán Viên Trưởng',
            'email' => 'editor@mayhem.vn',
            'role' => 'editor'
        ], now()->addHour());

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$editorToken}"
        ])->getJson('/api/v1/financial-reports/export-excel');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success'
            ]);
    }

    /**
     * Test 5: Audit Log Non-Repudiation (Spoofing Prevention).
     * Attacker injects user_role: 'Super Admin' in request body, but server forces token actor.
     */
    public function test_audit_log_spoofing_prevention_forces_token_actor(): void
    {
        FinancialReportJSON::create([
            'ticker' => 'VCB',
            'report_year' => 2024,
            'raw_data' => [
                ['Chỉ tiêu' => 'Tổng tài sản', 'values' => ['2024' => 1000000]]
            ]
        ]);

        $staffToken = 'mayhem_test_staff_token_spoof';
        Cache::put("mayhem_token_{$staffToken}", [
            'id' => 3,
            'name' => 'Kẻ Giả Mạo Staff',
            'email' => 'staff@mayhem.vn',
            'role' => 'staff'
        ], now()->addHour());

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$staffToken}"
        ])->postJson('/api/v1/financial-reports/update', [
            'bank' => 'VCB',
            'field' => 'Tổng tài sản',
            'year' => '2024',
            'value' => 999999,
            'user_role' => 'Super Admin' // Attacker spoof attempt
        ]);

        $response->assertStatus(200);

        // Verify the logged actor is from server token, not spoofed request body
        $auditLogId = $response->json('audit_log_id');
        $log = AuditLog::where('log_id', $auditLogId)->first();
        
        $this->assertNotNull($log);
        $this->assertStringContainsString('Kẻ Giả Mạo Staff', $log->user_role);
        $this->assertStringContainsString('STAFF', $log->user_role);
        $this->assertNotEquals('Super Admin', $log->user_role);
    }

    /**
     * Test 6: Insecure Snapshot Restore Prevention (HMAC Checksum).
     * Tampered snapshot payload must be rejected with 422 Unprocessable Entity.
     */
    public function test_tampered_snapshot_restore_is_rejected_with_422(): void
    {
        $adminToken = 'mayhem_test_admin_token_restore';
        Cache::put("mayhem_token_{$adminToken}", [
            'id' => 1,
            'name' => 'MayHem Super Admin',
            'email' => 'admin@mayhem.vn',
            'role' => 'admin'
        ], now()->addHour());

        $tamperedPayload = [
            'backup_timestamp' => now()->toIso8601String(),
            'checksum_meta' => [
                'industry' => 'NGAN_HANG',
                'dataset_hash' => 'fake_hash_123',
                'timestamp' => now()->toIso8601String(),
            ],
            'security_checksum' => 'tampered_or_invalid_hmac_signature',
            'dataset' => ['corrupted' => true]
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}"
        ])->postJson('/api/v1/backup/restore', $tamperedPayload);

        $response->assertStatus(422)
            ->assertJson([
                'status' => 'error'
            ]);
    }

    /**
     * Test 7: Rate Limiting on Login (Brute-Force Protection).
     * Exceeding 10 login attempts within 1 minute returns HTTP 429 Too Many Requests.
     */
    public function test_login_endpoint_brute_force_is_throttled_with_429(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'admin@mayhem.vn',
                'password' => 'wrong_password_' . $i
            ]);
        }

        // 11th request must be throttled
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@mayhem.vn',
            'password' => 'wrong_password_11'
        ]);

        $response->assertStatus(429);
    }
}
