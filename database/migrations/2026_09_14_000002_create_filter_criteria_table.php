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
        if (!Schema::hasTable('filter_criteria')) {
            Schema::create('filter_criteria', function (Blueprint $table) {
                $table->string('id', 100)->primary(); // e.g., 'crit_cir_under_60_latest'
                $table->string('category', 100)->default('Chuẩn hóa');
                $table->string('industry', 50)->default('NGAN_HANG')->index();
                $table->string('name', 255);
                $table->string('field', 255)->index();
                $table->string('mode', 50)->default('threshold'); // threshold, industry_avg_lower, industry_avg_higher, compare_fields
                $table->string('operator', 10)->nullable(); // <=, >=, <, >, =
                $table->decimal('value', 20, 4)->nullable();
                $table->string('display_value', 100)->nullable();
                $table->string('compare_with_field', 255)->nullable();
                $table->string('time_scope', 50)->default('latest'); // latest, 10y_consecutive, 3y_consecutive
                $table->boolean('is_custom')->default(false);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filter_criteria');
    }
};
