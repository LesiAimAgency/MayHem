<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\FilterIndustryConfig;
use Illuminate\Support\Facades\Cache;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Database\Seeders\FilterIndustryConfigSeeder;

class FilterIndustryConfigTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->seed(FilterIndustryConfigSeeder::class);
    }
    private function authenticateAs(string $role): string
    {
        $token = 'test_token_' . $role . '_' . uniqid();
        Cache::put("mayhem_token_{$token}", [
            'id' => 1,
            'name' => "Test {$role}",
            'email' => "{$role}@mayhem.vn",
            'role' => $role
        ], 3600);
        return $token;
    }

    public function test_guest_can_fetch_industry_configs_from_database(): void
    {
        $response = $this->getJson('/api/v1/screener/industries');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'count',
            'data' => [
                '*' => ['id', 'name', 'short_name', 'code_prefix', 'tickers', 'quick_tickers', 'fields']
            ]
        ]);

        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains('NGAN_HANG', $ids);
        $this->assertContains('BAT_DONG_SAN', $ids);
        $this->assertContains('CHUNG_KHOAN', $ids);
        $this->assertContains('THEP', $ids);
    }

    public function test_unauthenticated_cannot_create_or_modify_industry(): void
    {
        $postRes = $this->postJson('/api/v1/screener/industries', [
            'id' => 'BAN_LE',
            'name' => 'Ngành Bán Lẻ',
            'short_name' => 'Bán Lẻ',
            'tickers' => ['MWG', 'FRT', 'PNJ'],
            'fields' => ['Doanh thu thuần', 'Lợi nhuận gộp']
        ]);
        $postRes->assertStatus(401);

        $putRes = $this->putJson('/api/v1/screener/industries/BAT_DONG_SAN', [
            'name' => 'Bất Động Sản Cập Nhật'
        ]);
        $putRes->assertStatus(401);
    }

    public function test_staff_cannot_create_or_modify_industry_blocked_403(): void
    {
        $token = $this->authenticateAs('staff');

        $postRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/screener/industries', [
                'id' => 'BAN_LE',
                'name' => 'Ngành Bán Lẻ',
                'short_name' => 'Bán Lẻ',
                'tickers' => ['MWG', 'FRT', 'PNJ'],
                'fields' => ['Doanh thu thuần', 'Lợi nhuận gộp']
            ]);
        $postRes->assertStatus(403);

        $putRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/screener/industries/BAT_DONG_SAN', [
                'name' => 'Bất Động Sản Cập Nhật'
            ]);
        $putRes->assertStatus(403);
    }

    public function test_admin_and_editor_can_update_industry_tickers_and_fields(): void
    {
        $token = $this->authenticateAs('editor');

        $putRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson('/api/v1/screener/industries/THEP', [
                'tickers' => ['HPG', 'NKG', 'HSG', 'TLH', 'POM', 'VGS', 'SMC', 'TVN', 'VIS', 'TIS', 'NEW_TICKER'],
                'quick_tickers' => ['HPG', 'NKG', 'HSG', 'NEW_TICKER']
            ]);

        $putRes->assertStatus(200);
        $putRes->assertJsonFragment([
            'status' => 'success'
        ]);

        $thep = FilterIndustryConfig::find('THEP');
        $this->assertContains('NEW_TICKER', $thep->tickers);
        $this->assertContains('NEW_TICKER', $thep->quick_tickers);
    }

    public function test_admin_can_create_new_industry_and_reset(): void
    {
        $token = $this->authenticateAs('admin');

        $postRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/screener/industries', [
                'id' => 'BAN_LE',
                'name' => 'Ngành: Bán Lẻ & Tiêu Dùng',
                'short_name' => 'Bán Lẻ',
                'code_prefix' => 'BL',
                'item_label' => 'Doanh nghiệp bán lẻ',
                'tickers' => ['MWG', 'FRT', 'PNJ', 'DGW'],
                'quick_tickers' => ['MWG', 'FRT'],
                'fields' => ['Doanh thu thuần', 'Giá vốn hàng bán', 'Lợi nhuận gộp', 'Biên lợi nhuận gộp']
            ]);

        $postRes->assertStatus(201);
        $this->assertDatabaseHas('filter_industry_configs', ['id' => 'BAN_LE']);

        // Delete newly created industry
        $delRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson('/api/v1/screener/industries/BAN_LE');
        $delRes->assertStatus(200);
        $this->assertDatabaseMissing('filter_industry_configs', ['id' => 'BAN_LE']);

        // Reset to original 4 industries
        $resetRes = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/screener/industries/reset');
        $resetRes->assertStatus(200);
    }
}
