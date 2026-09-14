<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomFilterSeeder extends Seeder
{
    /**
     * Seed standardized banking filter presets into custom_filters table.
     */
    public function run(): void
    {
        $presets = [
            [
                'name' => 'Bộ Lọc Tinh Hoa Toàn Diện (ROE > TB, ROA >= 1%, NIM > 3%, NPL < TB)',
                'industry' => 'NGAN_HANG',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_roe_above_avg_latest',
                        'name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE) cao hơn trung bình ngành năm gần nhất',
                        'field' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                        'mode' => 'industry_avg_higher',
                        'displayValue' => '> TB Ngành',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_roa_above_1pct',
                        'name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA) từ 1% trở lên ở năm gần nhất',
                        'field' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 0.01,
                        'displayValue' => '1.0%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_nim_above_3_latest',
                        'name' => 'Biên lãi thuần (NIM) trên 3% năm gần nhất',
                        'field' => 'Biên lãi thuần (NIM)',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 0.03,
                        'displayValue' => '3.0%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_npl_under_avg_latest',
                        'name' => 'Tỷ lệ nợ xấu (NPL) cuối năm dưới trung bình ngành ở năm gần nhất',
                        'field' => 'Tỷ lệ nợ xấu (NPL) cuối năm',
                        'mode' => 'industry_avg_lower',
                        'displayValue' => '< TB Ngành',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Bền Vững 10 Năm (ROE > TB Ngành & Biên Lãi Vận Hành > TB Ngành 10 năm)',
                'industry' => 'NGAN_HANG',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_roe_above_avg_10y',
                        'name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE) cao hơn trung bình ngành liên tiếp 10 năm',
                        'field' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                        'mode' => 'industry_avg_higher',
                        'displayValue' => '> TB Ngành (10 năm)',
                        'timeScope' => '10y_consecutive',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_op_margin_above_avg_10y',
                        'name' => 'Biên lãi vận hành (trước DPRR) cao hơn trung bình ngành trong liên tiếp 10 năm',
                        'field' => 'Biên lãi vận hành (trước DPRR)',
                        'mode' => 'industry_avg_higher',
                        'displayValue' => '> TB Ngành (10 năm)',
                        'timeScope' => '10y_consecutive',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'An Toàn Vốn & Nợ Xấu (CAR >= 10% & NPL < TB Ngành)',
                'industry' => 'NGAN_HANG',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_car_above_10_latest',
                        'name' => 'Hệ số an toàn vốn (CAR) trên 10% năm gần nhất',
                        'field' => 'Hệ số an toàn vốn (CAR)',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 0.10,
                        'displayValue' => '10%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_npl_under_avg_latest',
                        'name' => 'Tỷ lệ nợ xấu (NPL) cuối năm dưới trung bình ngành ở năm gần nhất',
                        'field' => 'Tỷ lệ nợ xấu (NPL) cuối năm',
                        'mode' => 'industry_avg_lower',
                        'displayValue' => '< TB Ngành',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Hiệu Quả Vận Hành (CIR < 60% & CIR < TB Ngành)',
                'industry' => 'NGAN_HANG',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_cir_under_60_latest',
                        'name' => 'Tỷ lệ Chi phí / Thu nhập (CIR) dưới 60% ở năm gần nhất',
                        'field' => 'Tỷ lệ Chi phí / Thu nhập (CIR)',
                        'mode' => 'threshold',
                        'operator' => '<=',
                        'value' => 0.60,
                        'displayValue' => '60%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_cir_under_avg_latest',
                        'name' => 'Tỷ lệ Chi phí / Thu nhập (CIR) dưới trung bình ngành ở năm gần nhất',
                        'field' => 'Tỷ lệ Chi phí / Thu nhập (CIR)',
                        'mode' => 'industry_avg_lower',
                        'displayValue' => '< TB Ngành',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            // --- Bất Động Sản ---
            [
                'name' => 'BĐS An Toàn Tài Chính (Nợ/VCSH <= 1.5 & ICR >= 2.0)',
                'industry' => 'BAT_DONG_SAN',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_bds_de_safe',
                        'name' => 'Nợ vay / Vốn CSH dưới 1.5 lần',
                        'field' => 'Nợ vay/Vốn CSH',
                        'mode' => 'threshold',
                        'operator' => '<=',
                        'value' => 1.5,
                        'displayValue' => '1.5 lần',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_bds_icr_good',
                        'name' => 'Hệ số chi trả lãi vay (ICR) từ 2.0 trở lên',
                        'field' => 'Khả năng thanh toán lãi vay (ICR)',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 2.0,
                        'displayValue' => '2.0 lần',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Dòng Tiền & Bán Hàng Tốt (CFO > 0 & Vòng Quay HTK >= 0.5)',
                'industry' => 'BAT_DONG_SAN',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_bds_cfo_pos',
                        'name' => 'Dòng tiền từ hoạt động kinh doanh (CFO) dương',
                        'field' => 'Lưu chuyển tiền thuần từ hoạt động kinh doanh (CFO)',
                        'mode' => 'threshold',
                        'operator' => '>',
                        'value' => 0,
                        'displayValue' => '> 0 Tr.đ',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_bds_inv_turnover',
                        'name' => 'Vòng quay tồn kho đạt chuẩn bán hàng',
                        'field' => 'Vòng quay hàng tồn kho',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 0.5,
                        'displayValue' => '0.5 vòng',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            // --- Chứng Khoán ---
            [
                'name' => 'Top Cho Vay Ký Quỹ & Tự Doanh Tốt (Margin/VCSH >= 1.0)',
                'industry' => 'CHUNG_KHOAN',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_ck_margin_strong',
                        'name' => 'Tỷ lệ dư nợ cho vay margin / Vốn CSH trên 100%',
                        'field' => 'Dư nợ cho vay ký quỹ/Vốn CSH',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 1.0,
                        'displayValue' => '100%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_ck_roe_high',
                        'name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE) đạt tối thiểu 15%',
                        'field' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 0.15,
                        'displayValue' => '15%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ],
            // --- Thép ---
            [
                'name' => 'Thép Đầu Ngành Hiệu Quả Cao (Biên Lãi Gộp >= 12% & ROE >= 12%)',
                'industry' => 'THEP',
                'is_preset' => true,
                'conditions' => json_encode([
                    [
                        'id' => 'crit_thep_gross_margin',
                        'name' => 'Biên lợi nhuận gộp trên 12% ở năm gần nhất',
                        'field' => 'Biên lợi nhuận gộp',
                        'mode' => 'threshold',
                        'operator' => '>=',
                        'value' => 0.12,
                        'displayValue' => '12%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ],
                    [
                        'id' => 'crit_thep_npat_growth',
                        'name' => 'Lợi nhuận sau thuế tăng trưởng dương',
                        'field' => 'Tăng trưởng lợi nhuận sau thuế',
                        'mode' => 'threshold',
                        'operator' => '>',
                        'value' => 0,
                        'displayValue' => '> 0%',
                        'timeScope' => 'latest',
                        'enabled' => true
                    ]
                ], JSON_UNESCAPED_UNICODE),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($presets as $p) {
            DB::table('custom_filters')->updateOrInsert(
                ['name' => $p['name']],
                $p
            );
        }
    }
}
