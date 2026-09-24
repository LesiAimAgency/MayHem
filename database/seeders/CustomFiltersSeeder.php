<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomFiltersSeeder extends Seeder
{
    public function run(): void
    {
        $filters = [
            // 1. CIR
            [
                'metric_key' => 'cir',
                'metric_name' => 'Tỷ lệ Chi phí / Thu nhập (CIR)',
                'label' => 'Dưới 60% ở năm gần nhất',
                'code' => 'under_60_latest',
                'operator' => '<',
                'value' => 60.0,
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'cir',
                'metric_name' => 'Tỷ lệ Chi phí / Thu nhập (CIR)',
                'label' => 'Dưới trung bình những MCP đã chọn ở năm gần nhất',
                'code' => 'under_avg_latest',
                'operator' => '<',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'cir',
                'metric_name' => 'Tỷ lệ Chi phí / Thu nhập (CIR)',
                'label' => 'Dưới trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'under_avg_10y',
                'operator' => '<',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 2. CPKH
            [
                'metric_key' => 'cpkh',
                'metric_name' => 'CPKH/Tổng thu nhập hoạt động',
                'label' => 'Dưới 10% ở năm gần nhất',
                'code' => 'under_10_latest',
                'operator' => '<',
                'value' => 10.0,
                'timeframe' => 'latest',
            ],

            // 3. BLVH
            [
                'metric_key' => 'blvh',
                'metric_name' => 'Biên lãi vận hành (trước DPRR)',
                'label' => 'Cao hơn trung bình những MCP đã chọn trong liên tiếp 10 năm',
                'code' => 'above_avg_10y',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 4. BLNTT
            [
                'metric_key' => 'blntt',
                'metric_name' => 'Biên lợi nhuận trước thuế',
                'label' => 'Cao hơn trung bình những MCP đã chọn trong liên tiếp 10 năm',
                'code' => 'above_avg_10y',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 5. BLNST
            [
                'metric_key' => 'blnst',
                'metric_name' => 'Biên Lợi nhuận ST của CĐ công ty mẹ',
                'label' => 'Cao hơn trung bình những MCP đã chọn ở năm gần nhất',
                'code' => 'above_avg_latest',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'blnst',
                'metric_name' => 'Biên Lợi nhuận ST của CĐ công ty mẹ',
                'label' => 'Cao hơn trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'above_avg_10y',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 6. TTLR
            [
                'metric_key' => 'ttlr',
                'metric_name' => 'Tăng trưởng lãi ròng sau CĐ thiểu số',
                'label' => 'Luôn là số dương liên tiếp 10 năm',
                'code' => 'positive_10y',
                'operator' => '>',
                'value' => 0.0,
                'timeframe' => '10y',
            ],

            // 7. ROA
            [
                'metric_key' => 'roa',
                'metric_name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                'label' => 'Cao hơn trung bình những MCP đã chọn ở năm gần nhất',
                'code' => 'above_avg_latest',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'roa',
                'metric_name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                'label' => 'Cao hơn trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'above_avg_10y',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => '10y',
            ],
            [
                'metric_key' => 'roa',
                'metric_name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                'label' => 'Từ 1% trở lên',
                'code' => 'from_1pct',
                'operator' => '>=',
                'value' => 1.0,
                'timeframe' => 'latest',
            ],

            // 8. Debt/Equity
            [
                'metric_key' => 'de',
                'metric_name' => 'Debt/Equity',
                'label' => 'Dưới 10',
                'code' => 'under_10',
                'operator' => '<',
                'value' => 10.0,
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'de',
                'metric_name' => 'Debt/Equity',
                'label' => 'Dưới trung bình những MCP đã chọn ở năm gần nhất',
                'code' => 'under_avg_latest',
                'operator' => '<',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'de',
                'metric_name' => 'Debt/Equity',
                'label' => 'Dưới trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'under_avg_10y',
                'operator' => '<',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 9. ROE
            [
                'metric_key' => 'roe',
                'metric_name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                'label' => 'Cao hơn trung bình những MCP đã chọn năm gần nhất',
                'code' => 'above_avg_latest',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'roe',
                'metric_name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                'label' => 'Cao hơn trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'above_avg_10y',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => '10y',
            ],
            [
                'metric_key' => 'roe',
                'metric_name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                'label' => 'Từ 15% trở lên liên tiếp 10 năm',
                'code' => 'from_15pct_10y',
                'operator' => '>=',
                'value' => 15.0,
                'timeframe' => '10y',
            ],
            [
                'metric_key' => 'roe',
                'metric_name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                'label' => 'Từ 20% trở lên liên tiếp 10 năm',
                'code' => 'from_20pct_10y',
                'operator' => '>=',
                'value' => 20.0,
                'timeframe' => '10y',
            ],

            // 10. CFO
            [
                'metric_key' => 'cfo',
                'metric_name' => 'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
                'label' => 'Lớn hơn "Lợi nhuận sau thuế của cổ đông công ty mẹ" liên tiếp 10 năm',
                'code' => 'greater_than_parent_npat_10y',
                'operator' => '>',
                'value' => 'parent_npat',
                'timeframe' => '10y',
            ],

            // 11. CASA
            [
                'metric_key' => 'casa',
                'metric_name' => 'Tỷ lệ tiền gửi không kỳ hạn (CASA)',
                'label' => 'Cao hơn trung bình những MCP đã chọn ở năm gần nhất',
                'code' => 'above_avg_latest',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'casa',
                'metric_name' => 'Tỷ lệ tiền gửi không kỳ hạn (CASA)',
                'label' => 'Cao hơn trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'above_avg_10y',
                'operator' => '>',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 12. NPL
            [
                'metric_key' => 'npl',
                'metric_name' => 'Tỷ lệ nợ xấu (NPL) cuối năm',
                'label' => 'Dưới trung bình những MCP đã chọn ở năm gần nhất',
                'code' => 'under_avg_latest',
                'operator' => '<',
                'value' => 'avg',
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'npl',
                'metric_name' => 'Tỷ lệ nợ xấu (NPL) cuối năm',
                'label' => 'Dưới trung bình những MCP đã chọn liên tiếp 10 năm',
                'code' => 'under_avg_10y',
                'operator' => '<',
                'value' => 'avg',
                'timeframe' => '10y',
            ],

            // 13. NIM
            [
                'metric_key' => 'nim',
                'metric_name' => 'Biên lãi thuần (NIM)',
                'label' => 'Trên 3% năm gần nhất',
                'code' => 'above_3pct_latest',
                'operator' => '>',
                'value' => 3.0,
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'nim',
                'metric_name' => 'Biên lãi thuần (NIM)',
                'label' => 'Trên 3% liên tiếp 10 năm',
                'code' => 'above_3pct_10y',
                'operator' => '>',
                'value' => 3.0,
                'timeframe' => '10y',
            ],

            // 14. CAR
            [
                'metric_key' => 'car',
                'metric_name' => 'Hệ số an toàn vốn (CAR)',
                'label' => 'Trên 10% năm gần nhất',
                'code' => 'above_10pct_latest',
                'operator' => '>',
                'value' => 10.0,
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'car',
                'metric_name' => 'Hệ số an toàn vốn (CAR)',
                'label' => 'Trên 10% liên tiếp 10 năm',
                'code' => 'above_10pct_10y',
                'operator' => '>',
                'value' => 10.0,
                'timeframe' => '10y',
            ],
            [
                'metric_key' => 'car',
                'metric_name' => 'Hệ số an toàn vốn (CAR)',
                'label' => 'Trên 12% năm gần nhất',
                'code' => 'above_12pct_latest',
                'operator' => '>',
                'value' => 12.0,
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'car',
                'metric_name' => 'Hệ số an toàn vốn (CAR)',
                'label' => 'Trên 12% liên tiếp 10 năm',
                'code' => 'above_12pct_10y',
                'operator' => '>',
                'value' => 12.0,
                'timeframe' => '10y',
            ],

            // 15. LLR
            [
                'metric_key' => 'llr',
                'metric_name' => 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)',
                'label' => 'Trên 50% ở năm gần nhất',
                'code' => 'above_50pct_latest',
                'operator' => '>',
                'value' => 50.0,
                'timeframe' => 'latest',
            ],
            [
                'metric_key' => 'llr',
                'metric_name' => 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)',
                'label' => 'Trên 50% liên tiếp 10 năm',
                'code' => 'above_50pct_10y',
                'operator' => '>',
                'value' => 50.0,
                'timeframe' => '10y',
            ],
        ];

        DB::table('mh_custom_filters')->truncate();

        $now = now();
        $records = [];
        foreach ($filters as $f) {
            $records[] = [
                'sector_id' => 1,
                'filter_name' => "{$f['metric_name']}\t{$f['label']}",
                'filter_logic' => json_encode([
                    'metric_key' => $f['metric_key'],
                    'metric_name' => $f['metric_name'],
                    'condition_label' => $f['label'],
                    'code' => $f['code'],
                    'operator' => $f['operator'],
                    'value' => $f['value'],
                    'timeframe' => $f['timeframe'],
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('mh_custom_filters')->insert($records);
    }
}
