<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('filter_industry_configs')) {
            Schema::create('filter_industry_configs', function (Blueprint $table) {
                $table->string('id', 50)->primary(); // e.g., 'NGAN_HANG', 'BAT_DONG_SAN', 'CHUNG_KHOAN', 'THEP'
                $table->string('name', 255);          // e.g., 'Ngành: Ngân Hàng'
                $table->string('short_name', 100);    // e.g., 'Ngân Hàng'
                $table->string('code_prefix', 20);    // e.g., 'NH', 'BĐS', 'CK', 'Thép'
                $table->string('item_label', 100);    // e.g., 'Ngân hàng', 'Doanh nghiệp BĐS'
                $table->string('item_count_label', 100)->nullable(); // e.g., '29 ngân hàng'
                $table->json('tickers');              // Array of tickers: ['VCB', 'BID', ...]
                $table->json('quick_tickers')->nullable(); // Array of quick chips: ['VCB', 'BID', ...]
                $table->json('fields');               // Array of financial fields/indicators
                $table->integer('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filter_industry_configs');
    }
};
