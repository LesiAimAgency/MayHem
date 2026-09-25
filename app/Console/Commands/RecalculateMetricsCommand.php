<?php

namespace App\Console\Commands;

use App\Services\FinancialMetricService;
use Illuminate\Console\Command;

class RecalculateMetricsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mayhem:recalculate-metrics {ticker? : Specific bank ticker to recalculate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tính toán 16 chỉ tiêu tài chính và lưu vào cột calculated_data cho tất cả ngân hàng';

    /**
     * Execute the console command.
     */
    public function handle(FinancialMetricService $metricService): int
    {
        $ticker = $this->argument('ticker');

        if ($ticker) {
            $ticker = strtoupper($ticker);
            $this->info("Đang tính toán lại chỉ tiêu cho ngân hàng {$ticker}...");
            $count = $metricService->calculateAndStoreBankMetrics($ticker);
            $this->info("Hoàn tất! Đã cập nhật {$count} bản báo cáo tài chính cho {$ticker}.");
            return Command::SUCCESS;
        }

        $this->info("Bắt đầu tính toán toàn diện 16 chỉ tiêu tài chính cho toàn bộ 28 ngân hàng...");
        $stats = $metricService->calculateAndStoreAllBanks();

        $this->table(
            ['Mã Ngân Hàng', 'Số Năm BCTC Đã Tính & Lưu'],
            collect($stats['details'])->map(fn ($cnt, $t) => [$t, $cnt])->toArray()
        );

        $this->info("Thành công! Đã tính toán và lưu {$stats['total_reports_updated']} bản ghi vào bảng mh_financial_reports.");
        return Command::SUCCESS;
    }
}
