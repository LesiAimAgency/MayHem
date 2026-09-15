<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BankFactsheetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_get_bank_factsheet_with_existing_ticker()
    {
        $response = $this->getJson('/api/v1/financial-reports/VCB');
        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'ticker' => 'VCB'
        ]);
        $data = $response->json();
        $this->assertNotEmpty($data['records']);
        $this->assertArrayHasKey('company', $data);
    }

    public function test_get_bank_factsheet_with_tcb()
    {
        $response = $this->getJson('/api/v1/financial-reports/TCB');
        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'success',
            'ticker' => 'TCB'
        ]);
        $data = $response->json();
        $this->assertNotEmpty($data['records']);
    }

    public function test_get_bank_factsheet_invalid_ticker()
    {
        $response = $this->getJson('/api/v1/financial-reports/UNKNOWNXYZ');
        $response->assertStatus(404);
    }

    public function test_update_metric_value_creates_audit_log_and_can_rollback()
    {
        $adminToken = 'mayhem_test_admin_token_audit';
        Cache::put("mayhem_token_{$adminToken}", [
            'id' => 1,
            'name' => 'Super Admin Test',
            'email' => 'admin@mayhem.vn',
            'role' => 'admin'
        ], now()->addHour());

        // 1. Perform audit edit
        $updateRes = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}"
        ])->postJson('/api/v1/financial-reports/update', [
            'bank' => 'TCB',
            'field' => 'Tổng tài sản',
            'year' => '2024',
            'value' => 888888
        ]);

        $updateRes->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'bank' => 'TCB',
                'field' => 'Tổng tài sản',
                'year' => '2024',
                'new_value' => 888888
            ]);

        $auditLogId = $updateRes->json('audit_log_id');
        $this->assertNotEmpty($auditLogId);

        // Verify audit log exists in DB
        $log = AuditLog::where('log_id', $auditLogId)->first();
        $this->assertNotNull($log);
        $this->assertEquals(888888, $log->new_value);

        // 2. Query audit logs list
        $logsRes = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}"
        ])->getJson('/api/v1/audit-logs');

        $logsRes->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, $logsRes->json('count'));

        // 3. Rollback
        $rollbackRes = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}"
        ])->postJson("/api/v1/audit-logs/{$auditLogId}/rollback");

        $rollbackRes->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'bank' => 'TCB',
                'field' => 'Tổng tài sản'
            ]);
    }
}
