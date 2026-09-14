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
        // 1. Companies table
        if (!Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table) {
                $table->string('ticker', 10)->primary();
                $table->string('company_name', 255)->nullable();
                $table->string('exchange', 50)->nullable();
                $table->string('industry', 255)->default('Ngân Hàng');
                $table->boolean('is_active')->default(true);
                $table->timestamp('updated_at')->nullable();
            });
        }

        // 2. Financial Reports JSON table (stores chunked records per bank and year)
        if (!Schema::hasTable('financial_reports_json')) {
            Schema::create('financial_reports_json', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('ticker', 10)->index();
                $table->integer('report_year')->index();
                $table->string('report_period', 10)->default('YEAR')->index();
                $table->json('raw_data')->nullable();
                $table->timestamp('updated_at')->nullable();
                $table->unique(['ticker', 'report_year', 'report_period'], '_json_ticker_period_uc');
            });
        }

        // 3. Financial Metrics table (structured columns for fast filtering)
        if (!Schema::hasTable('financial_metrics')) {
            Schema::create('financial_metrics', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('ticker', 10)->index();
                $table->integer('report_year')->index();
                $table->string('report_period', 10)->default('YEAR')->index();
                $table->decimal('roe', 15, 4)->nullable();
                $table->decimal('roa', 15, 4)->nullable();
                $table->decimal('nim', 15, 4)->nullable();
                $table->decimal('npl', 15, 4)->nullable();
                $table->decimal('car', 15, 4)->nullable();
                $table->decimal('cir', 15, 4)->nullable();
                $table->decimal('casa', 15, 4)->nullable();
                $table->decimal('pe', 15, 4)->nullable();
                $table->decimal('pb', 15, 4)->nullable();
                $table->decimal('revenue', 20, 2)->nullable();
                $table->decimal('net_profit', 20, 2)->nullable();
                $table->unique(['ticker', 'report_year', 'report_period'], '_metric_ticker_period_uc');
            });
        }

        // 4. Audit Logs table (tracks all post-audit adjustments and additions)
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->string('log_id', 50)->unique();
                $table->string('user_role', 50)->default('Admin');
                $table->string('bank', 10)->index();
                $table->string('field', 255)->index();
                $table->string('year', 10)->index();
                $table->decimal('old_value', 20, 4)->nullable();
                $table->decimal('new_value', 20, 4)->nullable();
                $table->string('action', 50)->default('UPDATE');
                $table->text('note')->nullable();
                $table->timestamps();
            });
        }

        // 5. Custom Filters table (saves custom criteria and 32 preset rules)
        if (!Schema::hasTable('custom_filters')) {
            Schema::create('custom_filters', function (Blueprint $table) {
                $table->id();
                $table->string('name', 255);
                $table->string('industry', 100)->default('NGAN_HANG');
                $table->json('conditions');
                $table->boolean('is_preset')->default(false);
                $table->timestamps();
            });
        }

        // 6. Financial Matrix Snapshots table (stores metadata and snapshots)
        if (!Schema::hasTable('financial_matrix_snapshots')) {
            Schema::create('financial_matrix_snapshots', function (Blueprint $table) {
                $table->id();
                $table->string('version_tag', 50)->unique();
                $table->string('industry', 100)->default('NGAN_HANG');
                $table->json('raw_dataset');
                $table->integer('bank_count')->default(29);
                $table->integer('start_year')->default(2015);
                $table->integer('end_year')->default(2025);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_matrix_snapshots');
        Schema::dropIfExists('custom_filters');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('financial_metrics');
        Schema::dropIfExists('financial_reports_json');
        Schema::dropIfExists('companies');
    }
};
