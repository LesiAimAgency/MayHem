<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FilterIndustryConfig;

class FilterIndustryConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configs = [
            [
                'id' => 'NGAN_HANG',
                'name' => 'Ngành: Ngân Hàng',
                'short_name' => 'Ngân Hàng',
                'code_prefix' => 'NH',
                'item_label' => 'Ngân hàng',
                'item_count_label' => '29 ngân hàng',
                'tickers' => [
                    'VCB', 'BID', 'CTG', 'TCB', 'VPB', 'MBB', 'ACB', 'SHB', 'HDB', 'VIB',
                    'LPB', 'MSB', 'SSB', 'OCB', 'EIB', 'TPB', 'STB', 'BAB', 'BVB', 'NAB',
                    'KLB', 'PGB', 'SGB', 'VBB', 'NVB', 'ABB', 'CBB', 'GPB', 'OceanBank'
                ],
                'quick_tickers' => ['VCB', 'BID', 'CTG', 'TCB', 'VPB', 'MBB', 'ACB'],
                'fields' => [
                    'Tổng thu nhập hoạt động (TOI)',
                    'Tăng trưởng TOI',
                    'Chi phí vận hành (SG & A)',
                    'Tỷ lệ Chi phí / Thu nhập (CIR)',
                    'Tăng tưởng CPVH',
                    'Lợi nhuận thuần từ hoạt động kinh doanh trước chi phí dự phòng rủi ro tín dụng',
                    'Biên lãi vận hành (trước DPRR)',
                    'Chi phí dự phòng rủi ro tín dụng',
                    'Tổng lợi nhuận trước thuế (PBT)',
                    'Biên lợi nhuận trước thuế',
                    'Lợi nhuận sau thuế thu nhập doanh nghiệp',
                    'Biên lợi nhuận sau thuế thu nhập doanh nghiệp',
                    'Lợi nhuận sau thuế của cổ đông công ty mẹ',
                    'Biên Lợi nhuận ST của CĐ công ty mẹ',
                    'Tăng trưởng lãi ròng sau CĐ thiểu số',
                    'Lãi cơ bản trên cổ phiếu (EPS)',
                    'Chi Khấu hao TSCĐ',
                    'CPKH/Tổng thu nhập hoạt động',
                    'Biên lãi thuần (NIM)',
                    'Chi phí vốn bình quân',
                    'Thay đổi tỷ lệ chi phí vốn',
                    'Tỷ lệ nợ xấu (NPL) cuối năm',
                    'Tỷ lệ tiền gửi không kỳ hạn (CASA)',
                    'Tổng tài sản',
                    'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
                    'Cổ tức trả cổ đông, lợi nhuận đã chia',
                    'Lưu chuyển tiền thuần từ/(sử dụng vào) hoạt động tài chính',
                    'Nợ nghi ngờ',
                    'Thay đổi tỷ lệ nợ nghi ngờ',
                    'Nợ xấu có khả năng mất vốn',
                    'Thay đổi tỷ lệ nợ xấu có khả năng mất vốn',
                    'Tỷ lệ bao phủ nợ xấu (LLR Coverage)',
                    'Tổng nợ phải trả',
                    'Hệ số an toàn vốn (CAR)',
                    'Vốn chủ sở hữu',
                    'Debt/Equity',
                    'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                    'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                    'Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác (CapEx)',
                    'Chỉ số tự tài trợ',
                    'Chỉ số P/E cơ bản',
                    'Chỉ số P/B',
                    'Lợi nhuận sau thuế chưa phân phối',
                    'Vốn hóa thị trường',
                    'Owner Earnings',
                    'Tăng trưởng OE'
                ],
                'sort_order' => 1,
                'is_active' => true
            ],
            [
                'id' => 'BAT_DONG_SAN',
                'name' => 'Ngành: Bất Động Sản',
                'short_name' => 'Bất Động Sản',
                'code_prefix' => 'BĐS',
                'item_label' => 'Doanh nghiệp BĐS',
                'item_count_label' => '20 doanh nghiệp BĐS',
                'tickers' => [
                    'VHM', 'NVL', 'PDR', 'KDH', 'DXG', 'NLG', 'DIG', 'KBC', 'BCM', 'VRE',
                    'VIC', 'HDG', 'CEO', 'ITA', 'DXS', 'KOS', 'AGG', 'TCH', 'IJC', 'KHG'
                ],
                'quick_tickers' => ['VHM', 'NVL', 'PDR', 'KDH', 'DXG', 'NLG', 'DIG'],
                'fields' => [
                    'Doanh thu thuần về bán hàng và cung cấp dịch vụ',
                    'Giá vốn hàng bán',
                    'Lợi nhuận gộp về bán hàng và cung cấp dịch vụ',
                    'Biên lợi nhuận gộp',
                    'Doanh thu hoạt động tài chính',
                    'Chi phí tài chính',
                    'Trong đó: Chi phí lãi vay',
                    'Chi phí bán hàng',
                    'Chi phí quản lý doanh nghiệp',
                    'Lợi nhuận thuần từ hoạt động kinh doanh',
                    'Tổng lợi nhuận kế toán trước thuế',
                    'Lợi nhuận sau thuế thu nhập doanh nghiệp',
                    'Lợi nhuận sau thuế của cổ đông công ty mẹ',
                    'Biên Lợi nhuận ST của CĐ công ty mẹ',
                    'Lãi cơ bản trên cổ phiếu (EPS)',
                    'Tiền và các khoản tương đương tiền',
                    'Các khoản đầu tư tài chính ngắn hạn',
                    'Các khoản phải thu ngắn hạn',
                    'Hàng tồn kho',
                    'Hàng tồn kho/Tổng tài sản',
                    'Tài sản dở dang dài hạn',
                    'Tổng tài sản',
                    'Nợ phải trả',
                    'Nợ ngắn hạn',
                    'Người mua trả tiền trước ngắn hạn',
                    'Vay và nợ thuê tài chính ngắn hạn',
                    'Vay và nợ thuê tài chính dài hạn',
                    'Tổng nợ vay (Ngắn + Dài hạn)',
                    'Vốn chủ sở hữu',
                    'Vốn góp của chủ sở hữu',
                    'Debt/Equity',
                    'Nợ vay/Vốn CSH',
                    'Lưu chuyển tiền thuần từ hoạt động kinh doanh (CFO)',
                    'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                    'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                    'Chỉ số P/E cơ bản',
                    'Chỉ số P/B'
                ],
                'sort_order' => 2,
                'is_active' => true
            ],
            [
                'id' => 'CHUNG_KHOAN',
                'name' => 'Ngành: Chứng Khoán',
                'short_name' => 'Chứng Khoán',
                'code_prefix' => 'CK',
                'item_label' => 'Công ty chứng khoán',
                'item_count_label' => '20 công ty chứng khoán',
                'tickers' => [
                    'SSI', 'VND', 'VCI', 'HCM', 'SHS', 'MBS', 'FTS', 'BSI', 'CTS', 'AGR',
                    'BVS', 'VIX', 'ORS', 'VDS', 'TVS', 'EVS', 'PSI', 'WSS', 'IVS', 'APG'
                ],
                'quick_tickers' => ['SSI', 'VND', 'VCI', 'HCM', 'SHS', 'MBS', 'VIX'],
                'fields' => [
                    'Doanh thu hoạt động',
                    'Lãi từ các TSTC ghi nhận thông qua L/L (FVTPL)',
                    'Lãi từ các khoản đầu tư nắm giữ đến ngày đáo hạn (HTM)',
                    'Lãi từ các khoản cho vay và phải thu (Margin)',
                    'Doanh thu nghiệp vụ môi giới chứng khoán',
                    'Chi phí hoạt động',
                    'Lỗ các tài sản tài chính FVTPL',
                    'Chi phí nghiệp vụ môi giới chứng khoán',
                    'Chi phí quản lý công ty chứng khoán',
                    'Tỷ lệ Chi phí / Thu nhập (CIR)',
                    'Tổng lợi nhuận kế toán trước thuế (PBT)',
                    'Lợi nhuận sau thuế của cổ đông công ty mẹ',
                    'Biên Lợi nhuận ST của CĐ công ty mẹ',
                    'Lãi cơ bản trên cổ phiếu (EPS)',
                    'Tài sản tài chính ghi nhận thông qua L/L (FVTPL)',
                    'Các khoản cho vay ký quỹ (Margin)',
                    'Dư nợ cho vay giao dịch ký quỹ (Margin)',
                    'Tổng tài sản',
                    'Vốn chủ sở hữu',
                    'Vốn đầu tư của chủ sở hữu',
                    'Debt/Equity',
                    'Tỷ lệ Dư nợ Margin/Vốn CSH',
                    'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
                    'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                    'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                    'Chỉ số P/E cơ bản',
                    'Chỉ số P/B'
                ],
                'sort_order' => 3,
                'is_active' => true
            ],
            [
                'id' => 'THEP',
                'name' => 'Ngành: Thép & VLXD',
                'short_name' => 'Thép & VLXD',
                'code_prefix' => 'Thép',
                'item_label' => 'Doanh nghiệp Thép',
                'item_count_label' => '10 doanh nghiệp Thép',
                'tickers' => ['HPG', 'NKG', 'HSG', 'TLH', 'POM', 'VGS', 'SMC', 'TVN', 'VIS', 'TIS'],
                'quick_tickers' => ['HPG', 'NKG', 'HSG', 'TLH', 'POM', 'VGS', 'SMC'],
                'fields' => [
                    'Doanh thu thuần về bán hàng và cung cấp dịch vụ',
                    'Giá vốn hàng bán',
                    'Lợi nhuận gộp về bán hàng và cung cấp dịch vụ',
                    'Biên lợi nhuận gộp',
                    'Doanh thu hoạt động tài chính',
                    'Chi phí tài chính',
                    'Trong đó: Chi phí lãi vay',
                    'Chi phí bán hàng',
                    'Chi phí quản lý doanh nghiệp',
                    'Tổng lợi nhuận kế toán trước thuế',
                    'Lợi nhuận sau thuế của cổ đông công ty mẹ',
                    'Biên Lợi nhuận ST của CĐ công ty mẹ',
                    'Lãi cơ bản trên cổ phiếu (EPS)',
                    'Tiền và tương đương tiền',
                    'Phải thu ngắn hạn khách hàng',
                    'Hàng tồn kho',
                    'Dự phòng giảm giá hàng tồn kho',
                    'Tài sản cố định hữu hình',
                    'Tổng tài sản',
                    'Nợ phải trả',
                    'Nợ vay tài chính ngắn hạn',
                    'Nợ vay tài chính dài hạn',
                    'Tổng nợ vay tài chính',
                    'Vốn chủ sở hữu',
                    'Vốn đầu tư của chủ sở hữu',
                    'Debt/Equity',
                    'Nợ vay/Vốn CSH',
                    'Vòng quay hàng tồn kho',
                    'Lưu chuyển tiền thuần từ hoạt động kinh doanh (CFO)',
                    'Tỷ suất sinh lời trên Vốn CSH (ROE)',
                    'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
                    'Chỉ số P/E cơ bản',
                    'Chỉ số P/B'
                ],
                'sort_order' => 4,
                'is_active' => true
            ]
        ];

        foreach ($configs as $cfg) {
            FilterIndustryConfig::updateOrCreate(
                ['id' => $cfg['id']],
                $cfg
            );
        }
    }
}
