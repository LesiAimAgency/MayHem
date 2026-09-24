<?php

namespace App\Services;

use App\Models\MhCompany;
use App\Models\MhFinancialReport;
use Illuminate\Support\Collection;

class FinancialMetricService
{
    /**
     * 17 Chỉ tiêu tài chính đối chiếu chuẩn (TÍNH)
     */
    public const CORE_16_INDICATORS = [
        'growth_toi' => [
            'stt' => 2,
            'name' => 'Tăng trưởng TOI',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(TOI năm nay - TOI năm trước) / |TOI năm trước|',
        ],
        'sga' => [
            'stt' => 3,
            'name' => 'Chi phí vận hành (SG & A)',
            'unit' => 'Tỷ VND',
            'type' => 'TÍNH',
            'formula' => 'Lợi nhuận thuần HĐKD trước DPRR - Tổng thu nhập hoạt động (TOI)',
        ],
        'growth_cpvh' => [
            'stt' => 5,
            'name' => 'Tăng trưởng CPVH',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(|CPVH năm nay| - |CPVH năm trước|) / |CPVH năm trước|',
        ],
        'operating_margin' => [
            'stt' => 7,
            'name' => 'Biên lãi vận hành (trước DPRR)',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => 'Lợi nhuận thuần HĐKD trước DPRR / Tổng thu nhập hoạt động (TOI)',
        ],
        'pbt_margin' => [
            'stt' => 10,
            'name' => 'Biên lợi nhuận trước thuế',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => 'Tổng lợi nhuận trước thuế (PBT) / Tổng thu nhập hoạt động (TOI)',
        ],
        'growth_pbt' => [
            'stt' => 11,
            'name' => 'Tăng trưởng PBT',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(PBT năm nay - PBT năm trước) / |PBT năm trước|',
        ],
        'npat_margin' => [
            'stt' => 13,
            'name' => 'Biên lợi nhuận sau thuế thu nhập doanh nghiệp',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => 'Lợi nhuận sau thuế TNDN (NPAT) / Tổng thu nhập hoạt động (TOI)',
        ],
        'parent_npat_margin' => [
            'stt' => 15,
            'name' => 'Biên Lợi nhuận ST của CĐ công ty mẹ',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => 'Lợi nhuận sau thuế CĐ công ty mẹ / Tổng thu nhập hoạt động (TOI)',
        ],
        'growth_parent_npat' => [
            'stt' => 16,
            'name' => 'Tăng trưởng lãi ròng sau CĐ thiểu số',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(LNST CĐ mẹ năm nay - LNST CĐ mẹ năm trước) / |LNST CĐ mẹ năm trước|',
        ],
        'depreciation_toi' => [
            'stt' => 19,
            'name' => 'CPKH/Tổng thu nhập hoạt động',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => 'Chi Khấu hao TSCĐ / Tổng thu nhập hoạt động (TOI)',
        ],
        'cof_change' => [
            'stt' => 22,
            'name' => 'Thay đổi tỷ lệ chi phí vốn',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(|Chi phí vốn bình quân năm nay| - |Chi phí vốn bình quân năm trước|) / |Chi phí vốn bình quân năm trước|',
        ],
        'doubtful_debt_change' => [
            'stt' => 30,
            'name' => 'Thay đổi tỷ lệ nợ nghi ngờ',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(Nợ nghi ngờ năm nay - Nợ nghi ngờ năm trước) / |Nợ nghi ngờ năm trước|',
        ],
        'loss_debt_change' => [
            'stt' => 32,
            'name' => 'Thay đổi tỷ lệ nợ xấu có khả năng mất vốn',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(Nợ xấu mất vốn năm nay - Nợ xấu mất vốn năm trước) / |Nợ xấu mất vốn năm trước|',
        ],
        'debt_equity' => [
            'stt' => 37,
            'name' => 'Debt/Equity',
            'unit' => 'Lần',
            'type' => 'TÍNH',
            'formula' => 'Tổng nợ phải trả / Vốn chủ sở hữu',
        ],
        'self_financing' => [
            'stt' => 41,
            'name' => 'Chỉ số tự tài trợ',
            'unit' => 'Lần',
            'type' => 'TÍNH',
            'formula' => 'Lưu chuyển tiền thuần từ HĐKD / (|Chi Khấu hao TSCĐ| + |Cổ tức trả cổ đông|)',
        ],
        'owner_earnings' => [
            'stt' => 46,
            'name' => 'Owner Earnings',
            'unit' => 'Tỷ VND',
            'type' => 'TÍNH',
            'formula' => 'Lợi nhuận ST CĐ mẹ + Chi Khấu hao TSCĐ - |Chi phí vốn (CapEx)|',
        ],
        'growth_oe' => [
            'stt' => 47,
            'name' => 'Tăng trưởng OE',
            'unit' => '%',
            'type' => 'TÍNH',
            'formula' => '(Owner Earnings năm nay - Owner Earnings năm trước) / |Owner Earnings năm trước|',
        ],
    ];

    /**
     * 30 Chỉ tiêu trích xuất cơ bản từ Database (FILL)
     */
    public const BASE_30_METRICS = [
        'toi' => ['stt' => 1, 'name' => 'Tổng thu nhập hoạt động (TOI)', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'cir' => ['stt' => 4, 'name' => 'Tỷ lệ Chi phí / Thu nhập (CIR)', 'unit' => '%', 'type' => 'FILL'],
        'net_op_profit_pre_provision' => ['stt' => 6, 'name' => 'Lợi nhuận thuần từ hoạt động kinh doanh trước chi phí dự phòng rủi ro tín dụng', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'provision_credit_losses' => ['stt' => 8, 'name' => 'Chi phí dự phòng rủi ro tín dụng', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'pbt' => ['stt' => 9, 'name' => 'Tổng lợi nhuận trước thuế (PBT)', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'npat' => ['stt' => 12, 'name' => 'Lợi nhuận sau thuế thu nhập doanh nghiệp', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'parent_npat' => ['stt' => 14, 'name' => 'Lợi nhuận sau thuế của cổ đông công ty mẹ', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'eps' => ['stt' => 17, 'name' => 'Lãi cơ bản trên cổ phiếu (EPS)', 'unit' => 'VND/CP', 'type' => 'FILL'],
        'depreciation' => ['stt' => 18, 'name' => 'Chi Khấu hao TSCĐ', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'nim' => ['stt' => 20, 'name' => 'Biên lãi thuần (NIM)', 'unit' => '%', 'type' => 'FILL'],
        'cost_of_funds' => ['stt' => 21, 'name' => 'Chi phí vốn bình quân', 'unit' => '%', 'type' => 'FILL'],
        'npl_ratio' => ['stt' => 23, 'name' => 'Tỷ lệ nợ xấu (NPL) cuối năm', 'unit' => '%', 'type' => 'FILL'],
        'casa_ratio' => ['stt' => 24, 'name' => 'Tỷ lệ tiền gửi không kỳ hạn (CASA)', 'unit' => '%', 'type' => 'FILL'],
        'total_assets' => ['stt' => 25, 'name' => 'Tổng tài sản', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'cfo' => ['stt' => 26, 'name' => 'Lưu chuyển tiền thuần từ hoạt động kinh doanh', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'dividends_paid' => ['stt' => 27, 'name' => 'Cổ tức trả cổ đông, lợi nhuận đã chia', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'cff' => ['stt' => 28, 'name' => 'Lưu chuyển tiền thuần từ/(sử dụng vào) hoạt động tài chính', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'doubtful_debt' => ['stt' => 29, 'name' => 'Nợ nghi ngờ', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'loss_debt' => ['stt' => 31, 'name' => 'Nợ xấu có khả năng mất vốn', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'llr_coverage' => ['stt' => 33, 'name' => 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)', 'unit' => '%', 'type' => 'FILL'],
        'total_liabilities' => ['stt' => 34, 'name' => 'Tổng nợ phải trả', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'car_ratio' => ['stt' => 35, 'name' => 'Hệ số an toàn vốn (CAR)', 'unit' => '%', 'type' => 'FILL'],
        'owners_equity' => ['stt' => 36, 'name' => 'Vốn chủ sở hữu', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'roa' => ['stt' => 38, 'name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)', 'unit' => '%', 'type' => 'FILL'],
        'roe' => ['stt' => 39, 'name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)', 'unit' => '%', 'type' => 'FILL'],
        'capex' => ['stt' => 40, 'name' => 'Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác (CapEx)', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'pe_ratio' => ['stt' => 42, 'name' => 'Chỉ số P/E cơ bản', 'unit' => 'Lần', 'type' => 'FILL'],
        'pb_ratio' => ['stt' => 43, 'name' => 'Chỉ số P/B', 'unit' => 'Lần', 'type' => 'FILL'],
        'retained_earnings' => ['stt' => 44, 'name' => 'Lợi nhuận sau thuế chưa phân phối', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
        'market_cap' => ['stt' => 45, 'name' => 'Vốn hóa thị trường', 'unit' => 'Tỷ VND', 'type' => 'FILL'],
    ];

    /**
     * 47 Chỉ tiêu chuẩn kết hợp cả TÍNH và FILL theo thứ tự đối chiếu
     */
    public const MASTER_47_METRICS = [
        1 => ['key' => 'toi', 'name' => 'Tổng thu nhập hoạt động (TOI)', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        2 => ['key' => 'growth_toi', 'name' => 'Tăng trưởng TOI', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(TOI năm nay - TOI năm trước) / |TOI năm trước|'],
        3 => ['key' => 'sga', 'name' => 'Chi phí vận hành (SG & A)', 'type' => 'TÍNH', 'unit' => 'Tỷ VND', 'formula' => 'Lợi nhuận thuần HĐKD trước DPRR - Tổng thu nhập hoạt động (TOI)'],
        4 => ['key' => 'cir', 'name' => 'Tỷ lệ Chi phí / Thu nhập (CIR)', 'type' => 'FILL', 'unit' => '%'],
        5 => ['key' => 'growth_cpvh', 'name' => 'Tăng trưởng CPVH', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(|CPVH năm nay| - |CPVH năm trước|) / |CPVH năm trước|'],
        6 => ['key' => 'net_op_profit_pre_provision', 'name' => 'Lợi nhuận thuần từ hoạt động kinh doanh trước chi phí dự phòng rủi ro tín dụng', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        7 => ['key' => 'operating_margin', 'name' => 'Biên lãi vận hành (trước DPRR)', 'type' => 'TÍNH', 'unit' => '%', 'formula' => 'Lợi nhuận thuần HĐKD trước DPRR / Tổng thu nhập hoạt động (TOI)'],
        8 => ['key' => 'provision_credit_losses', 'name' => 'Chi phí dự phòng rủi ro tín dụng', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        9 => ['key' => 'pbt', 'name' => 'Tổng lợi nhuận trước thuế (PBT)', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        10 => ['key' => 'pbt_margin', 'name' => 'Biên lợi nhuận trước thuế', 'type' => 'TÍNH', 'unit' => '%', 'formula' => 'Tổng lợi nhuận trước thuế (PBT) / Tổng thu nhập hoạt động (TOI)'],
        11 => ['key' => 'growth_pbt', 'name' => 'Tăng trưởng PBT', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(PBT năm nay - PBT năm trước) / |PBT năm trước|'],
        12 => ['key' => 'npat', 'name' => 'Lợi nhuận sau thuế thu nhập doanh nghiệp', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        13 => ['key' => 'npat_margin', 'name' => 'Biên lợi nhuận sau thuế thu nhập doanh nghiệp', 'type' => 'TÍNH', 'unit' => '%', 'formula' => 'Lợi nhuận sau thuế TNDN (NPAT) / Tổng thu nhập hoạt động (TOI)'],
        14 => ['key' => 'parent_npat', 'name' => 'Lợi nhuận sau thuế của cổ đông công ty mẹ', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        15 => ['key' => 'parent_npat_margin', 'name' => 'Biên Lợi nhuận ST của CĐ công ty mẹ', 'type' => 'TÍNH', 'unit' => '%', 'formula' => 'Lợi nhuận sau thuế CĐ công ty mẹ / Tổng thu nhập hoạt động (TOI)'],
        16 => ['key' => 'growth_parent_npat', 'name' => 'Tăng trưởng lãi ròng sau CĐ thiểu số', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(LNST CĐ mẹ năm nay - LNST CĐ mẹ năm trước) / |LNST CĐ mẹ năm trước|'],
        17 => ['key' => 'eps', 'name' => 'Lãi cơ bản trên cổ phiếu (EPS)', 'type' => 'FILL', 'unit' => 'VND/CP'],
        18 => ['key' => 'depreciation', 'name' => 'Chi Khấu hao TSCĐ', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        19 => ['key' => 'depreciation_toi', 'name' => 'CPKH/Tổng thu nhập hoạt động', 'type' => 'TÍNH', 'unit' => '%', 'formula' => 'Chi Khấu hao TSCĐ / Tổng thu nhập hoạt động (TOI)'],
        20 => ['key' => 'nim', 'name' => 'Biên lãi thuần (NIM)', 'type' => 'FILL', 'unit' => '%'],
        21 => ['key' => 'cost_of_funds', 'name' => 'Chi phí vốn bình quân', 'type' => 'FILL', 'unit' => '%'],
        22 => ['key' => 'cof_change', 'name' => 'Thay đổi tỷ lệ chi phí vốn', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(|Chi phí vốn bình quân năm nay| - |Chi phí vốn bình quân năm trước|) / |Chi phí vốn bình quân năm trước|'],
        23 => ['key' => 'npl_ratio', 'name' => 'Tỷ lệ nợ xấu (NPL) cuối năm', 'type' => 'FILL', 'unit' => '%'],
        24 => ['key' => 'casa_ratio', 'name' => 'Tỷ lệ tiền gửi không kỳ hạn (CASA)', 'type' => 'FILL', 'unit' => '%'],
        25 => ['key' => 'total_assets', 'name' => 'Tổng tài sản', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        26 => ['key' => 'cfo', 'name' => 'Lưu chuyển tiền thuần từ hoạt động kinh doanh', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        27 => ['key' => 'dividends_paid', 'name' => 'Cổ tức trả cổ đông, lợi nhuận đã chia', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        28 => ['key' => 'cff', 'name' => 'Lưu chuyển tiền thuần từ/(sử dụng vào) hoạt động tài chính', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        29 => ['key' => 'doubtful_debt', 'name' => 'Nợ nghi ngờ', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        30 => ['key' => 'doubtful_debt_change', 'name' => 'Thay đổi tỷ lệ nợ nghi ngờ', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(Nợ nghi ngờ năm nay - Nợ nghi ngờ năm trước) / |Nợ nghi ngờ năm trước|'],
        31 => ['key' => 'loss_debt', 'name' => 'Nợ xấu có khả năng mất vốn', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        32 => ['key' => 'loss_debt_change', 'name' => 'Thay đổi tỷ lệ nợ xấu có khả năng mất vốn', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(Nợ xấu mất vốn năm nay - Nợ xấu mất vốn năm trước) / |Nợ xấu mất vốn năm trước|'],
        33 => ['key' => 'llr_coverage', 'name' => 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)', 'type' => 'FILL', 'unit' => '%'],
        34 => ['key' => 'total_liabilities', 'name' => 'Tổng nợ phải trả', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        35 => ['key' => 'car_ratio', 'name' => 'Hệ số an toàn vốn (CAR)', 'type' => 'FILL', 'unit' => '%'],
        36 => ['key' => 'owners_equity', 'name' => 'Vốn chủ sở hữu', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        37 => ['key' => 'debt_equity', 'name' => 'Debt/Equity', 'type' => 'TÍNH', 'unit' => 'Lần', 'formula' => 'Tổng nợ phải trả / Vốn chủ sở hữu'],
        38 => ['key' => 'roa', 'name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)', 'type' => 'FILL', 'unit' => '%'],
        39 => ['key' => 'roe', 'name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)', 'type' => 'FILL', 'unit' => '%'],
        40 => ['key' => 'capex', 'name' => 'Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác (CapEx)', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        41 => ['key' => 'self_financing', 'name' => 'Chỉ số tự tài trợ', 'type' => 'TÍNH', 'unit' => 'Lần', 'formula' => 'Lưu chuyển tiền thuần từ HĐKD / (|Chi Khấu hao TSCĐ| + |Cổ tức trả cổ đông, lợi nhuận đã chia|)'],
        42 => ['key' => 'pe_ratio', 'name' => 'Chỉ số P/E cơ bản', 'type' => 'FILL', 'unit' => 'Lần'],
        43 => ['key' => 'pb_ratio', 'name' => 'Chỉ số P/B', 'type' => 'FILL', 'unit' => 'Lần'],
        44 => ['key' => 'retained_earnings', 'name' => 'Lợi nhuận sau thuế chưa phân phối', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        45 => ['key' => 'market_cap', 'name' => 'Vốn hóa thị trường', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
        46 => ['key' => 'owner_earnings', 'name' => 'Owner Earnings', 'type' => 'TÍNH', 'unit' => 'Tỷ VND', 'formula' => 'Lợi nhuận ST CĐ mẹ + Chi Khấu hao TSCĐ - |CapEx|'],
        47 => ['key' => 'growth_oe', 'name' => 'Tăng trưởng OE', 'type' => 'TÍNH', 'unit' => '%', 'formula' => '(Owner Earnings năm nay - Owner Earnings năm trước) / |Owner Earnings năm trước|'],
    ];

    /**
     * Tính toán toàn bộ 16 chỉ tiêu và 30 trường thô cho 1 ngân hàng, lưu vào database
     */
    public function calculateAndStoreBankMetrics(string $ticker): int
    {
        $reports = MhFinancialReport::where('short_name', $ticker)
            ->orderBy('report_year', 'asc')
            ->get();

        if ($reports->isEmpty()) {
            return 0;
        }

        $calculatedHistory = [];

        for ($i = 0; $i < count($reports); $i++) {
            $curr = $reports[$i];
            $prev = $i > 0 ? $reports[$i - 1] : null;

            $rawCurr = $curr->calculated_data['raw_metrics'] ?? [];
            $api = $curr->api_data ?? [];
            $inc = $api['income_statement'] ?? [];
            $bs = $api['balance_sheet'] ?? [];
            $cf = $api['cash_flow'] ?? [];
            $rat = $api['ratios'] ?? [];

            // 1. TOI (Tổng thu nhập hoạt động)
            $toi = $rawCurr['toi'] ?? ($inc['total_operating_income'] ?? ($inc['IS_TOTAL_OPERATING_INCOME'] ?? ($inc['toi'] ?? null)));
            if ($toi === null && isset($inc['net_interest_income'])) {
                $toi = ($inc['net_interest_income'] ?? 0) + ($inc['net_fee_and_commission_income'] ?? 0) + ($inc['other_income'] ?? 0);
            }
            if ($toi !== null && abs($toi) > 1e6) { $toi = round($toi / 1e9, 2); }
            $prevToi = $i > 0 ? ($calculatedHistory[$i - 1]['toi'] ?? null) : null;

            // 2. Lợi nhuận thuần HĐKD trước DPRR (net_op_profit_pre_provision)
            $opProfit = $rawCurr['net_op_profit_pre_provision'] ?? ($inc['net_operating_profit_before_provision'] ?? ($inc['net_operating_profit_before_allowance_for_credit_loss'] ?? ($inc['IS_OPERATING_PROFIT_BEFORE_PROVISION_FOR_CREDIT_LOSSES'] ?? ($inc['ppop'] ?? null))));
            if ($opProfit !== null && abs($opProfit) > 1e6) { $opProfit = round($opProfit / 1e9, 2); }
            $prevOpProfit = $i > 0 ? ($calculatedHistory[$i - 1]['op_profit'] ?? null) : null;

            // 3. Chi phí vận hành CPVH (SG & A) = OpProfit - TOI
            $cpvh = ($opProfit !== null && $toi !== null) ? round($opProfit - $toi, 2) : ($curr->calculated_data['indicators']['sga'] ?? null);
            $prevCpvh = $i > 0 ? ($calculatedHistory[$i - 1]['cpvh'] ?? null) : null;

            // 4. PBT, NPAT & Parent NPAT
            $pbt = $rawCurr['pbt'] ?? ($inc['net_profit_before_tax'] ?? ($inc['net_accounting_profit_loss_before_tax'] ?? ($inc['IS_PROFIT_BEFORE_TAX'] ?? ($inc['pbt'] ?? null))));
            if ($pbt !== null && abs($pbt) > 1e6) { $pbt = round($pbt / 1e9, 2); }
            $prevPbt = $i > 0 ? ($calculatedHistory[$i - 1]['pbt'] ?? null) : null;

            $npat = $rawCurr['npat'] ?? ($inc['net_profit_after_tax'] ?? ($inc['net_profit_loss_after_tax'] ?? ($inc['IS_NET_PROFIT_AFTER_TAX'] ?? ($inc['npat'] ?? null))));
            if ($npat !== null && abs($npat) > 1e6) { $npat = round($npat / 1e9, 2); }

            $parentNpat = $rawCurr['parent_npat'] ?? ($inc['attributable_to_parent_company'] ?? ($inc['IS_PROFIT_AFTER_TAX_FOR_SHAREHOLDERS_OF_PARENT_COMPANY'] ?? ($inc['parent_npat'] ?? $npat)));
            if ($parentNpat !== null && abs($parentNpat) > 1e6) { $parentNpat = round($parentNpat / 1e9, 2); }
            $prevParentNpat = $i > 0 ? ($calculatedHistory[$i - 1]['parent_npat'] ?? null) : null;

            // 5. Khấu hao TSCĐ (Depreciation)
            $deprec = $rawCurr['depreciation'] ?? abs($cf['depreciation'] ?? ($bs['accumulated_depreciation'] ?? 0));
            if ($deprec == 0) {
                $deprec = abs($cf['payments_on_disposal_of_fixed_assets'] ?? 0);
                if ($deprec == 0 && isset($bs['tangible_fixed_assets'])) {
                    $deprec = round(($bs['tangible_fixed_assets'] ?? 0) * 0.08);
                }
            }
            if ($deprec !== null && abs($deprec) > 1e6) { $deprec = round($deprec / 1e9, 2); }

            // 6. Chi phí vốn bình quân (Cost of Funds COF)
            $rawCof = $rawCurr['cost_of_funds'] ?? ($rat['cost_of_funds'] ?? ($rat['cost_of_funding_earning_assets_cof'] ?? ($rat['RT_BANK_COF'] ?? null)));
            $cof = null;
            if ($rawCof !== null && (float)$rawCof != 0) {
                $f = (float)$rawCof;
                $cof = abs($f) < 1.0 ? round(abs($f) * 100, 2) : round(abs($f), 2);
            } else {
                // Fallback tính toán từ BCTC: abs(Chi phí trả lãi) / (Tiền gửi + Giấy tờ có giá + Vay TCTD) * 100
                $ie = abs($inc['interest_and_similar_expenses'] ?? ($inc['IS_INTEREST_AND_SIMILAR_EXPENSES'] ?? 0));
                $dep = abs($bs['deposits_from_customers'] ?? ($bs['BS_DEPOSITS_FROM_CUSTOMERS'] ?? 0));
                $valPapers = abs($bs['valuable_papers_issued'] ?? ($bs['BS_VALUABLE_PAPERS_ISSUED'] ?? 0));
                $borrowings = abs($bs['borrowings_from_the_sbv_and_other_credit_institutions'] ?? ($bs['BS_BORROWINGS_FROM_THE_SBV_AND_OTHER_CREDIT_INSTITUTIONS'] ?? 0));
                $funding = $dep + $valPapers + $borrowings;
                if ($funding > 0 && $ie > 0) {
                    $cof = round(($ie / $funding) * 100, 2);
                }
            }
            $prevCof = $i > 0 ? ($calculatedHistory[$i - 1]['cost_of_funds'] ?? null) : null;

            // 7. Nợ nghi ngờ & Nợ xấu mất vốn
            $doubtfulDebt = $rawCurr['doubtful_debt'] ?? abs($bs['doubtful_debt'] ?? ($bs['provision_for_losses_on_debt_buying'] ?? 0));
            if ($doubtfulDebt == 0 && isset($bs['loans_and_advances_to_customers'])) {
                $doubtfulDebt = round(($bs['loans_and_advances_to_customers'] ?? 0) * 0.008);
            }
            if ($doubtfulDebt !== null && abs($doubtfulDebt) > 1e6) { $doubtfulDebt = round($doubtfulDebt / 1e9, 2); }
            $prevDoubtfulDebt = $i > 0 ? ($calculatedHistory[$i - 1]['doubtful_debt'] ?? null) : null;

            $lossDebt = $rawCurr['loss_debt'] ?? abs($bs['loss_debt'] ?? ($bs['less_provision_for_losses_on_loans_and_advances_to_customers'] ?? 0));
            if ($lossDebt !== null && abs($lossDebt) > 1e6) { $lossDebt = round($lossDebt / 1e9, 2); }
            $prevLossDebt = $i > 0 ? ($calculatedHistory[$i - 1]['loss_debt'] ?? null) : null;

            // 8. Total Liabilities & Equity & Total Assets
            $totalAssets = $rawCurr['total_assets'] ?? ($bs['total_assets'] ?? ($bs['BS_TOTAL_ASSETS'] ?? null));
            if ($totalAssets !== null && abs($totalAssets) > 1e11) { $totalAssets = round($totalAssets / 1e9, 2); }

            $equity = $rawCurr['owners_equity'] ?? ($bs['owners_equity'] ?? ($bs['BS_EQUITY'] ?? null));
            if ($equity !== null && abs($equity) > 1e11) { $equity = round($equity / 1e9, 2); }

            $totalLiab = $rawCurr['total_liabilities'] ?? ($bs['total_liabilities'] ?? ($bs['BS_TOTAL_LIABILITIES'] ?? null));
            if ($totalLiab !== null && abs($totalLiab) > 1e11) { $totalLiab = round($totalLiab / 1e9, 2); }
            // Đẳng thức kế toán: Tổng nợ phải trả = Tổng tài sản - Vốn chủ sở hữu
            if (($totalLiab === null || $totalLiab == 0) && $totalAssets > 0 && $equity > 0) {
                $totalLiab = round($totalAssets - $equity, 2);
            }

            $cfo = $rawCurr['cfo'] ?? ($cf['net_cash_from_operating_activities'] ?? ($cf['CF_NET_CASH_FLOWS_FROM_OPERATING_ACTIVITIES'] ?? null));
            if ($cfo !== null && abs($cfo) > 1e11) { $cfo = round($cfo / 1e9, 2); }

            $dividends = $rawCurr['dividends_paid'] ?? abs($cf['dividends_paid'] ?? ($cf['CF_DIVIDENDS_PAID'] ?? 0));
            if ($dividends !== null && abs($dividends) > 1e11) { $dividends = round($dividends / 1e9, 2); }

            $capex = $rawCurr['capex'] ?? abs($cf['capex'] ?? ($cf['CF_PAYMENTS_FOR_FIXED_ASSETS'] ?? ($cf['purchases_of_fixed_assets_and_other_long_term_assets'] ?? ($cf['CF_PURCHASES_OF_FIXED_ASSETS'] ?? 0))));
            if ($capex !== null && abs($capex) > 1e11) { $capex = round($capex / 1e9, 2); }

            $cff = $rawCurr['cff'] ?? ($cf['net_cash_from_financing_activities'] ?? ($cf['CF_NET_CASH_FLOWS_FROM_FINANCING_ACTIVITIES'] ?? null));
            if ($cff !== null && abs($cff) > 1e11) { $cff = round($cff / 1e9, 2); }

            // --- 17 CÔNG THỨC CHUẨN ĐỐI CHIẾU ---
            $growthToi = ($prevToi && $prevToi != 0 && $toi !== null) ? round((($toi - $prevToi) / abs($prevToi)) * 100, 2) : null;
            $sga = $cpvh !== null ? round($cpvh, 2) : null;
            $growthCpvh = ($prevCpvh && $prevCpvh != 0 && $cpvh !== null) ? round(((abs($cpvh) - abs($prevCpvh)) / abs($prevCpvh)) * 100, 2) : null;
            $opMargin = ($toi && $toi != 0 && $opProfit !== null) ? round(($opProfit / $toi) * 100, 2) : null;
            $pbtMargin = ($toi && $toi != 0 && $pbt !== null) ? round(($pbt / $toi) * 100, 2) : null;
            $growthPbt = ($prevPbt && $prevPbt != 0 && $pbt !== null) ? round((($pbt - $prevPbt) / abs($prevPbt)) * 100, 2) : null;
            $npatMargin = ($toi && $toi != 0 && $npat !== null) ? round(($npat / $toi) * 100, 2) : null;
            $parentNpatMargin = ($toi && $toi != 0 && $parentNpat !== null) ? round(($parentNpat / $toi) * 100, 2) : null;
            $growthParentNpat = ($prevParentNpat && $prevParentNpat != 0 && $parentNpat !== null) ? round((($parentNpat - $prevParentNpat) / abs($prevParentNpat)) * 100, 2) : null;
            $deprecToi = ($toi && $toi != 0 && $deprec !== null) ? round(($deprec / $toi) * 100, 2) : null;
            $cofChange = ($prevCof && $prevCof != 0 && $cof !== null) ? round((($cof - $prevCof) / $prevCof) * 100, 2) : null;
            $doubtfulChange = ($prevDoubtfulDebt && $prevDoubtfulDebt != 0 && $doubtfulDebt !== null) ? round((($doubtfulDebt - $prevDoubtfulDebt) / abs($prevDoubtfulDebt)) * 100, 2) : null;
            $lossDebtChange = ($prevLossDebt && $prevLossDebt != 0 && $lossDebt !== null) ? round((($lossDebt - $prevLossDebt) / abs($prevLossDebt)) * 100, 2) : null;
            $debtEquity = ($equity && $equity > 0 && $totalLiab !== null) ? round($totalLiab / $equity, 2) : null;
            $selfFinancingDenom = abs($deprec ?? 0) + abs($dividends ?? 0);
            $selfFinancing = ($selfFinancingDenom > 0 && $cfo !== null) ? round($cfo / $selfFinancingDenom, 2) : null;
            $oe = ($parentNpat !== null) ? round($parentNpat + ($deprec ?? 0) - abs($capex ?? 0), 2) : null;

            // Tăng trưởng OE
            $prevOe = $i > 0 ? ($calculatedHistory[$i - 1]['oe'] ?? null) : null;
            $oeGrowth = ($prevOe !== null && $prevOe != 0 && $oe !== null) ? round((($oe - $prevOe) / abs($prevOe)) * 100, 2) : null;

            $indicators = [
                'growth_toi' => $growthToi,
                'sga' => $sga,
                'growth_cpvh' => $growthCpvh,
                'operating_margin' => $opMargin,
                'pbt_margin' => $pbtMargin,
                'growth_pbt' => $growthPbt,
                'npat_margin' => $npatMargin,
                'parent_npat_margin' => $parentNpatMargin,
                'growth_parent_npat' => $growthParentNpat,
                'depreciation_toi' => $deprecToi,
                'cof_change' => $cofChange,
                'doubtful_debt_change' => $doubtfulChange,
                'loss_debt_change' => $lossDebtChange,
                'debt_equity' => $debtEquity,
                'self_financing' => $selfFinancing,
                'owner_earnings' => $oe,
                'growth_oe' => $oeGrowth,
            ];

            // Chuẩn hóa tỷ lệ CIR và LLR
            $rawCir = $rawCurr['cir'] ?? (isset($rat['cost_income_ratio_cir']) ? (float)$rat['cost_income_ratio_cir'] : (isset($rat['cir']) ? (float)$rat['cir'] : (isset($rat['RT_BANK_CIR']) ? (float)$rat['RT_BANK_CIR'] * 100 : null)));
            $cirVal = $rawCir !== null ? round(abs($rawCir), 2) : null;

            $rawLlr = $rawCurr['llr_coverage'] ?? ($rat['llr_coverage'] ?? ($rat['npl_coverage'] ?? ($rat['RT_BANK_NPL_COVERAGE'] ?? ($rat['provisions_for_loan_losses'] ?? null))));
            $llrVal = null;
            if ($rawLlr !== null) {
                $f = (float)$rawLlr;
                $llrVal = (abs($f) > 0 && abs($f) < 10.0) ? round(abs($f) * 100, 2) : round(abs($f), 2);
            }

            // Provision credit losses
            $provLoss = $rawCurr['provision_credit_losses'] ?? (isset($inc['provision_for_credit_losses']) ? $inc['provision_for_credit_losses'] : (isset($inc['IS_PROVISION_FOR_CREDIT_LOSSES']) ? $inc['IS_PROVISION_FOR_CREDIT_LOSSES'] : null));
            if ($provLoss !== null && abs($provLoss) > 1e6) { $provLoss = round($provLoss / 1e9, 2); }

            $rawMetrics = [
                'toi' => $toi,
                'cir' => $cirVal,
                'net_op_profit_pre_provision' => $opProfit,
                'provision_credit_losses' => $provLoss,
                'pbt' => $pbt,
                'npat' => $npat,
                'parent_npat' => $parentNpat,
                'eps' => $rawCurr['eps'] ?? ($inc['eps'] ?? ($inc['eps_basic_vnd'] ?? ($inc['IS_BASIC_EARNINGS_PER_SHARE'] ?? ($rat['trailing_eps'] ?? ($rat['eps'] ?? null))))),
                'depreciation' => $deprec !== null ? round($deprec, 2) : null,
                'nim' => $rawCurr['nim'] ?? (isset($rat['net_interest_margin_nim']) ? round((float)$rat['net_interest_margin_nim'], 2) : (isset($rat['nim']) ? round((float)$rat['nim'], 2) : (isset($rat['RT_BANK_NIM']) ? round((float)$rat['RT_BANK_NIM'] * 100, 2) : null))),
                'cost_of_funds' => $cof,
                'npl_ratio' => $rawCurr['npl_ratio'] ?? (isset($rat['loan_loss_provision_ratio']) ? round((float)$rat['loan_loss_provision_ratio'], 2) : (isset($rat['npl_ratio']) ? round((float)$rat['npl_ratio'], 2) : (isset($rat['RT_BANK_NPL']) ? round((float)$rat['RT_BANK_NPL'] * 100, 2) : null))),
                'casa_ratio' => $rawCurr['casa_ratio'] ?? ((function() use ($rat) {
                    $val = $rat['casa_ratio'] ?? ($rat['casa'] ?? ($rat['RT_BANK_CASA'] ?? null));
                    if ($val !== null) {
                        $f = (float)$val;
                        return abs($f) < 1.0 ? round($f * 100, 2) : round($f, 2);
                    }
                    return null;
                })()),
                'total_assets' => $totalAssets,
                'cfo' => $cfo,
                'dividends_paid' => $dividends,
                'cff' => $cff !== null ? (abs($cff) > 1e11 ? round($cff / 1e9, 2) : round($cff, 2)) : null,
                'doubtful_debt' => $doubtfulDebt,
                'loss_debt' => $lossDebt,
                'llr_coverage' => $llrVal,
                'total_liabilities' => $totalLiab,
                'car_ratio' => $rawCurr['car_ratio'] ?? ((function() use ($rat) {
                    $val = $rat['car_ratio'] ?? ($rat['car'] ?? ($rat['capital_adequacy_ratio'] ?? ($rat['RT_BANK_CAR'] ?? null)));
                    if ($val !== null) {
                        $f = (float)$val;
                        return abs($f) < 1.0 ? round($f * 100, 2) : round($f, 2);
                    }
                    return null;
                })()),
                'owners_equity' => $equity,
                'roa' => $rawCurr['roa'] ?? (isset($rat['roa']) ? round((float)$rat['roa'], 2) : (isset($rat['RT_PRT_ROA']) ? round((float)$rat['RT_PRT_ROA'] * 100, 2) : null)),
                'roe' => $rawCurr['roe'] ?? (isset($rat['roe']) ? round((float)$rat['roe'], 2) : (isset($rat['RT_PRT_ROE']) ? round((float)$rat['RT_PRT_ROE'] * 100, 2) : null)),
                'capex' => $capex,
                'pe_ratio' => $rawCurr['pe_ratio'] ?? (isset($rat['pe_ratio']) ? round((float)$rat['pe_ratio'], 2) : (isset($rat['RT_VALUE_PE']) ? round((float)$rat['RT_VALUE_PE'], 2) : null)),
                'pb_ratio' => $rawCurr['pb_ratio'] ?? (isset($rat['pb_ratio']) ? round((float)$rat['pb_ratio'], 2) : (isset($rat['RT_VALUE_PB']) ? round((float)$rat['RT_VALUE_PB'], 2) : null)),
                'retained_earnings' => (function() use ($rawCurr, $bs) {
                    $v = $rawCurr['retained_earnings'] ?? ($bs['retained_earnings'] ?? ($bs['BS_RETAINED_EARNINGS'] ?? null));
                    if ($v !== null && abs($v) > 1e11) return round($v / 1e9, 2);
                    return $v !== null ? round((float)$v, 2) : null;
                })(),
                'market_cap' => (function() use ($rawCurr, $rat, $curr) {
                    $v = $rawCurr['market_cap'] ?? ($rat['market_cap'] ?? ($rat['RT_VALUE_MARKET_CAP'] ?? ($curr->calculated_data['market_cap_vnd'] ?? null)));
                    if ($v !== null && abs($v) > 1e11) return round($v / 1e9, 2);
                    return $v !== null ? round((float)$v, 2) : null;
                })(),
            ];

            // Lưu lịch sử để tính cho năm kế tiếp
            $calculatedHistory[$i] = [
                'toi' => $toi,
                'op_profit' => $opProfit,
                'cpvh' => $cpvh,
                'pbt' => $pbt,
                'parent_npat' => $parentNpat,
                'cost_of_funds' => $cof,
                'doubtful_debt' => $doubtfulDebt,
                'loss_debt' => $lossDebt,
                'oe' => $oe,
            ];

            // 47 Chỉ tiêu định dạng tiếng Việt chuẩn để rà soát trực tiếp trong Database
            $masterMetrics = [];
            $fillVi = [];
            $tinhVi = [];

            foreach (self::MASTER_47_METRICS as $stt => $meta) {
                $key = $meta['key'];
                $val = ($meta['type'] === 'TÍNH') ? ($indicators[$key] ?? null) : ($rawMetrics[$key] ?? null);

                $item = [
                    'stt' => $stt,
                    'loai' => $meta['type'],
                    'ten_chi_tieu' => $meta['name'],
                    'key' => $key,
                    'dvt' => $meta['unit'],
                    'gia_tri' => $val,
                ];
                if ($meta['type'] === 'TÍNH' && isset($meta['formula'])) {
                    $item['cong_thuc'] = $meta['formula'];
                    $tinhVi[$meta['name']] = $val;
                } else {
                    $fillVi[$meta['name']] = $val;
                }

                $masterMetrics[$stt] = $item;
            }

            // Bảng 30 chỉ tiêu FILL với key chuẩn (vnstock standard keys)
            $fill30Vi = [];
            foreach (self::BASE_30_METRICS as $k => $meta) {
                $fill30Vi[$k] = $rawMetrics[$k] ?? null;
            }

            // Clean database: Giữ lại api_data nguồn tinh gọn ĐÚNG 30 CHỈ TIÊU cho ngân hàng, loại bỏ 7 trường dư thừa
            $cleanApi = [
                'fill_30_vi' => $fill30Vi,
                'income_statement' => [
                    'total_operating_income' => $rawMetrics['toi'] !== null ? $rawMetrics['toi'] * 1e9 : null,
                    'net_operating_profit_before_provision' => $rawMetrics['net_op_profit_pre_provision'] !== null ? $rawMetrics['net_op_profit_pre_provision'] * 1e9 : null,
                    'provision_for_credit_losses' => $rawMetrics['provision_credit_losses'] !== null ? $rawMetrics['provision_credit_losses'] * 1e9 : null,
                    'net_profit_before_tax' => $rawMetrics['pbt'] !== null ? $rawMetrics['pbt'] * 1e9 : null,
                    'net_profit_after_tax' => $rawMetrics['npat'] !== null ? $rawMetrics['npat'] * 1e9 : null,
                    'attributable_to_parent_company' => $rawMetrics['parent_npat'] !== null ? $rawMetrics['parent_npat'] * 1e9 : null,
                    'eps' => $rawMetrics['eps'],
                ],
                'balance_sheet' => [
                    'total_assets' => $rawMetrics['total_assets'] !== null ? $rawMetrics['total_assets'] * 1e9 : null,
                    'total_liabilities' => $rawMetrics['total_liabilities'] !== null ? $rawMetrics['total_liabilities'] * 1e9 : null,
                    'owners_equity' => $rawMetrics['owners_equity'] !== null ? $rawMetrics['owners_equity'] * 1e9 : null,
                    'doubtful_debt' => $rawMetrics['doubtful_debt'] !== null ? $rawMetrics['doubtful_debt'] * 1e9 : null,
                    'loss_debt' => $rawMetrics['loss_debt'] !== null ? $rawMetrics['loss_debt'] * 1e9 : null,
                    'retained_earnings' => $rawMetrics['retained_earnings'] !== null ? $rawMetrics['retained_earnings'] * 1e9 : null,
                ],
                'cash_flow' => [
                    'net_cash_from_operating_activities' => $rawMetrics['cfo'] !== null ? $rawMetrics['cfo'] * 1e9 : null,
                    'dividends_paid' => $rawMetrics['dividends_paid'] !== null ? $rawMetrics['dividends_paid'] * 1e9 : null,
                    'net_cash_from_financing_activities' => $rawMetrics['cff'] !== null ? $rawMetrics['cff'] * 1e9 : null,
                    'capex' => $rawMetrics['capex'] !== null ? $rawMetrics['capex'] * 1e9 : null,
                    'depreciation' => $rawMetrics['depreciation'] !== null ? $rawMetrics['depreciation'] * 1e9 : null,
                ],
                'ratios' => [
                    'cir' => $rawMetrics['cir'],
                    'nim' => $rawMetrics['nim'],
                    'cost_of_funds' => $rawMetrics['cost_of_funds'],
                    'npl_ratio' => $rawMetrics['npl_ratio'],
                    'casa_ratio' => $rawMetrics['casa_ratio'],
                    'llr_coverage' => $rawMetrics['llr_coverage'],
                    'car_ratio' => $rawMetrics['car_ratio'],
                    'roa' => $rawMetrics['roa'],
                    'roe' => $rawMetrics['roe'],
                    'pe_ratio' => $rawMetrics['pe_ratio'],
                    'pb_ratio' => $rawMetrics['pb_ratio'],
                    'market_cap' => $rawMetrics['market_cap'] !== null ? $rawMetrics['market_cap'] * 1e9 : null,
                ]
            ];

            // Cập nhật vào DB với cấu trúc sạch sẽ và key chuẩn vnstock
            $curr->api_data = $cleanApi;
            $curr->calculated_data = [
                'master_metrics' => array_values($masterMetrics),
                'fill_metrics_vi' => $fillVi,
                'tinh_metrics_vi' => $tinhVi,
                'indicators' => $indicators,
                'raw_metrics' => $rawMetrics,
                'calculated_at' => now()->toIso8601String(),
            ];
            $curr->save();
        }

        return count($reports);
    }

    /**
     * Batch recalculate for all active banks
     */
    public function calculateAndStoreAllBanks(): array
    {
        $companies = MhCompany::active()->orderBy('short_name', 'asc')->get();
        $stats = [
            'total_banks' => $companies->count(),
            'total_reports_updated' => 0,
            'details' => [],
        ];

        foreach ($companies as $comp) {
            $updated = $this->calculateAndStoreBankMetrics($comp->short_name);
            $stats['total_reports_updated'] += $updated;
            $stats['details'][$comp->short_name] = $updated;
        }

        return $stats;
    }

    /**
     * Get multi-year factsheet for a single bank (Báo Cáo Đơn Lẻ)
     */
    public function getBankFactsheet(string $ticker): array
    {
        $company = MhCompany::with('sector')->where('short_name', $ticker)->firstOrFail();

        $reports = MhFinancialReport::where('short_name', $ticker)
            ->orderBy('report_year', 'asc')
            ->get();

        // Nếu chưa được tính toán hoặc thiếu indicators thì tính toán ngay
        $needsRecalc = $reports->contains(function ($r) {
            return empty($r->calculated_data['indicators']) || !isset($r->calculated_data['indicators']['growth_pbt']);
        });

        if ($needsRecalc) {
            $this->calculateAndStoreBankMetrics($ticker);
            $reports = MhFinancialReport::where('short_name', $ticker)
                ->orderBy('report_year', 'asc')
                ->get();
        }

        $years = $reports->pluck('report_year')->unique()->values()->toArray();

        // 1. Build 47 Master Metrics (kết hợp cả TÍNH và FILL theo thứ tự đối chiếu chuẩn)
        $allMetricRows = [];
        foreach (self::MASTER_47_METRICS as $stt => $meta) {
            $rowValues = [];
            foreach ($reports as $rep) {
                if ($meta['type'] === 'TÍNH') {
                    $rowValues[$rep->report_year] = $rep->calculated_data['indicators'][$meta['key']] ?? null;
                } else {
                    $rowValues[$rep->report_year] = $rep->calculated_data['raw_metrics'][$meta['key']] ?? null;
                }
            }

            $allMetricRows[] = [
                'stt' => $stt,
                'key' => $meta['key'],
                'name' => $meta['name'],
                'unit' => $meta['unit'],
                'type' => $meta['type'],
                'formula' => $meta['formula'] ?? null,
                'ticker' => $ticker,
                'values' => $rowValues,
            ];
        }

        // 2. Build 17 Core Indicators Matrix (TÍNH riêng để backward compatible)
        $indicatorRows = [];
        foreach (self::CORE_16_INDICATORS as $key => $meta) {
            $rowValues = [];
            foreach ($reports as $rep) {
                $rowValues[$rep->report_year] = $rep->calculated_data['indicators'][$key] ?? null;
            }

            $indicatorRows[] = [
                'stt' => $meta['stt'],
                'key' => $key,
                'name' => $meta['name'],
                'unit' => $meta['unit'],
                'type' => $meta['type'],
                'formula' => $meta['formula'],
                'ticker' => $ticker,
                'values' => $rowValues,
            ];
        }

        // 3. Build 30 Base Metrics Matrix (FILL riêng để backward compatible)
        $rawRows = [];
        foreach (self::BASE_30_METRICS as $key => $meta) {
            $rowValues = [];
            foreach ($reports as $rep) {
                $rowValues[$rep->report_year] = $rep->calculated_data['raw_metrics'][$key] ?? null;
            }

            $rawRows[] = [
                'stt' => $meta['stt'],
                'key' => $key,
                'name' => $meta['name'],
                'unit' => $meta['unit'],
                'type' => $meta['type'],
                'ticker' => $ticker,
                'values' => $rowValues,
            ];
        }

        // 4. Extract KPI snapshots for latest year
        $latestReport = $reports->last();
        $prevReport = count($reports) >= 2 ? $reports->get(count($reports) - 2) : null;

        $latestInd = $latestReport ? ($latestReport->calculated_data['indicators'] ?? []) : [];
        $latestRaw = $latestReport ? ($latestReport->calculated_data['raw_metrics'] ?? []) : [];
        $prevRaw = $prevReport ? ($prevReport->calculated_data['raw_metrics'] ?? []) : [];

        $kpis = [
            'toi' => [
                'year' => $latestReport?->report_year,
                'value' => $latestRaw['toi'] ?? null,
                'growth' => $latestInd['growth_toi'] ?? null,
            ],
            'cir' => [
                'year' => $latestReport?->report_year,
                'value' => $latestRaw['cir'] ?? null,
            ],
            'pbt' => [
                'year' => $latestReport?->report_year,
                'value' => $latestRaw['pbt'] ?? null,
                'growth' => ($prevRaw['pbt'] ?? null) && $prevRaw['pbt'] > 0
                    ? round((($latestRaw['pbt'] - $prevRaw['pbt']) / $prevRaw['pbt']) * 100, 2)
                    : null,
            ],
            'npat' => [
                'year' => $latestReport?->report_year,
                'value' => $latestRaw['npat'] ?? null,
                'growth' => $latestInd['growth_parent_npat'] ?? null,
            ],
        ];

        return [
            'company' => [
                'short_name' => $company->short_name,
                'company_name' => $company->company_name,
                'exchange' => $company->exchange ?? 'HOSE',
                'sector' => $company->sector?->sector_name ?? 'Ngân hàng',
                'is_active' => $company->is_active,
            ],
            'years' => $years,
            'kpis' => $kpis,
            'all_metrics' => $allMetricRows,
            'indicators' => $indicatorRows,
            'raw_metrics' => $rawRows,
        ];
    }

    /**
     * Backward compatible extractMetrics for Screener & Comparison
     */
    public function extractMetrics(MhFinancialReport $report, ?MhFinancialReport $prevReport = null): array
    {
        $calc = $report->calculated_data ?? [];
        $ind = $calc['indicators'] ?? [];
        $raw = $calc['raw_metrics'] ?? [];

        return [
            'ticker' => $report->short_name,
            'year' => $report->report_year,
            'cir' => $raw['cir'] ?? null,
            'cpkh_toi' => $ind['depreciation_toi'] ?? null,
            'blvh' => $ind['operating_margin'] ?? null,
            'blntt' => $ind['pbt_margin'] ?? null,
            'blnst' => $ind['npat_margin'] ?? null,
            'ttlr' => $ind['growth_parent_npat'] ?? null,
            'roa' => $raw['roa'] ?? null,
            'debt_equity' => $ind['debt_equity'] ?? null,
            'roe' => $raw['roe'] ?? null,
            'cfo' => $raw['cfo'] ?? null,
            'casa' => $raw['casa_ratio'] ?? null,
            'npl' => $raw['npl_ratio'] ?? null,
            'nim' => $raw['nim'] ?? null,
            'cost_of_funds' => $raw['cost_of_funds'] ?? null,
            'cof_change' => $ind['cof_change'] ?? null,
            'car' => $raw['car_ratio'] ?? null,
            'llr' => $raw['llr_coverage'] ?? null,
            'toi' => $raw['toi'] ?? null,
            'pbt' => $raw['pbt'] ?? null,
            'npat' => $raw['npat'] ?? null,
        ];
    }


    /**
     * Get comparison matrix between selected banks (Wireframe 3)
     * Supports mode='latest' (single year) and mode='10years' (last 10 years)
     */
    public function getComparison(array $tickers, ?int $year = null, string $mode = 'latest'): array
    {
        if (empty($tickers)) {
            $tickers = ['ACB', 'ABB', 'VCB'];
        }

        $companies = MhCompany::whereIn('short_name', $tickers)->get()->keyBy('short_name');

        // Lấy năm mới nhất từ DB (global, không chỉ theo tickers được chọn)
        $globalMaxYear = (int) (MhFinancialReport::max('report_year') ?? date('Y'));
        // Năm mới nhất có dữ liệu cho các tickers được chọn
        $tickerMaxYear = (int) (MhFinancialReport::whereIn('short_name', $tickers)->max('report_year') ?? $globalMaxYear);
        if (!$year) {
            $year = $tickerMaxYear;
        }

        // Năm đầu tiên có trong DB
        $globalMinYear = (int) (MhFinancialReport::min('report_year') ?? 2016);

        // Xác định danh sách năm cần lấy
        if ($mode === '10years') {
            $years = range(max($year - 9, $globalMinYear), $year); // 10 năm gần nhất
        } else {
            $years = [$year]; // Chỉ năm gần nhất
        }

        // Load tất cả reports cần thiết một lần
        $allReports = MhFinancialReport::whereIn('short_name', $tickers)
            ->whereIn('report_year', $years)
            ->get()
            ->groupBy(fn($r) => $r->short_name . '_' . $r->report_year);

        // Hàm helper: build flat metric map từ 1 report
        $buildFlatMap = function (?object $rep) use ($tickers): array {
            if (!$rep) return [];
            $calc = $rep->calculated_data ?? [];
            if (empty($calc['indicators'])) {
                $this->calculateAndStoreBankMetrics($rep->short_name);
                $rep->refresh();
                $calc = $rep->calculated_data ?? [];
            }
            $ind = $calc['indicators'] ?? [];
            $raw = $calc['raw_metrics'] ?? [];
            $flatMap = [];
            foreach (self::MASTER_47_METRICS as $meta) {
                $k = $meta['key'];
                $flatMap[$k] = ($meta['type'] === 'TÍNH') ? ($ind[$k] ?? null) : ($raw[$k] ?? null);
            }
            return $flatMap;
        };

        // Chỉ số nào thấp hơn là tốt hơn
        $lowerIsBetter = ['cir', 'npl_ratio', 'cost_of_funds', 'cof_change', 'doubtful_debt_change', 'loss_debt_change', 'debt_equity'];

        if ($mode === '10years') {
            // dataByTicker[ticker][year] = flatMap
            $dataByTicker = [];
            foreach ($tickers as $ticker) {
                foreach ($years as $yr) {
                    $key = $ticker . '_' . $yr;
                    $rep = $allReports->get($key)?->first();
                    $dataByTicker[$ticker][$yr] = $buildFlatMap($rep);
                }
            }

            // Build matrix: values[ticker][year] = value
            $matrix = [];
            foreach (self::MASTER_47_METRICS as $stt => $meta) {
                $metricKey = $meta['key'];
                $rowValues = [];
                // Best: per-year, per-ticker
                $bestCells = []; // year => ticker
                foreach ($years as $yr) {
                    $bestValYr = null;
                    $bestTickerYr = null;
                    $isLower = in_array($metricKey, $lowerIsBetter);
                    foreach ($tickers as $ticker) {
                        $val = $dataByTicker[$ticker][$yr][$metricKey] ?? null;
                        $rowValues[$ticker][$yr] = $val;
                        if ($val !== null && is_numeric($val)) {
                            if ($isLower) {
                                if ($bestValYr === null || $val < $bestValYr) { $bestValYr = $val; $bestTickerYr = $ticker; }
                            } else {
                                if ($bestValYr === null || $val > $bestValYr) { $bestValYr = $val; $bestTickerYr = $ticker; }
                            }
                        }
                    }
                    $bestCells[$yr] = $bestTickerYr;
                }
                $matrix[] = [
                    'stt'        => $stt,
                    'key'        => $metricKey,
                    'name'       => $meta['name'],
                    'unit'       => $meta['unit'],
                    'type'       => $meta['type'],
                    'formula'    => $meta['formula'] ?? null,
                    'best_cells' => $bestCells, // [year => bestTicker]
                    'values'     => $rowValues, // [ticker][year] => value
                ];
            }

            // Charts: dùng năm mới nhất
            $charts = ['roe' => [], 'nim' => [], 'casa' => [], 'npl' => []];
            foreach ($tickers as $ticker) {
                $d = $dataByTicker[$ticker][$year] ?? [];
                $charts['roe'][]  = ['ticker' => $ticker, 'value' => $d['roe'] ?? null];
                $charts['nim'][]  = ['ticker' => $ticker, 'value' => $d['nim'] ?? null];
                $charts['casa'][] = ['ticker' => $ticker, 'value' => $d['casa_ratio'] ?? null];
                $charts['npl'][]  = ['ticker' => $ticker, 'value' => $d['npl_ratio'] ?? null];
            }

            return [
                'year'    => $year,
                'years'   => $years,
                'mode'    => '10years',
                'tickers' => $tickers,
                'companies' => $companies->toArray(),
                'matrix'  => $matrix,
                'charts'  => $charts,
            ];
        }

        // ---- Mode: latest (single year) ----
        $dataByTicker = [];
        foreach ($tickers as $ticker) {
            $key = $ticker . '_' . $year;
            $rep = $allReports->get($key)?->first();
            if (!$rep) {
                // Fallback: lấy năm gần nhất của ticker đó
                $rep = MhFinancialReport::where('short_name', $ticker)->orderBy('report_year', 'desc')->first();
            }
            $dataByTicker[$ticker] = $buildFlatMap($rep);
        }

        $matrix = [];
        foreach (self::MASTER_47_METRICS as $stt => $meta) {
            $metricKey = $meta['key'];
            $rowValues = [];
            $bestTicker = null;
            $bestVal = null;
            $isLower = in_array($metricKey, $lowerIsBetter);
            foreach ($tickers as $ticker) {
                $val = $dataByTicker[$ticker][$metricKey] ?? null;
                $rowValues[$ticker] = $val;
                if ($val !== null && is_numeric($val)) {
                    if ($isLower) {
                        if ($bestVal === null || $val < $bestVal) { $bestVal = $val; $bestTicker = $ticker; }
                    } else {
                        if ($bestVal === null || $val > $bestVal) { $bestVal = $val; $bestTicker = $ticker; }
                    }
                }
            }
            $matrix[] = [
                'stt'         => $stt,
                'key'         => $metricKey,
                'name'        => $meta['name'],
                'unit'        => $meta['unit'],
                'type'        => $meta['type'],
                'formula'     => $meta['formula'] ?? null,
                'best_ticker' => $bestTicker,
                'values'      => $rowValues,
            ];
        }

        $charts = ['roe' => [], 'nim' => [], 'casa' => [], 'npl' => []];
        foreach ($tickers as $ticker) {
            $d = $dataByTicker[$ticker] ?? [];
            $charts['roe'][]  = ['ticker' => $ticker, 'value' => $d['roe'] ?? null];
            $charts['nim'][]  = ['ticker' => $ticker, 'value' => $d['nim'] ?? null];
            $charts['casa'][] = ['ticker' => $ticker, 'value' => $d['casa_ratio'] ?? null];
            $charts['npl'][]  = ['ticker' => $ticker, 'value' => $d['npl_ratio'] ?? null];
        }

        return [
            'year'    => $year,
            'years'   => [$year],
            'mode'    => 'latest',
            'tickers' => $tickers,
            'companies' => $companies->toArray(),
            'matrix'  => $matrix,
            'charts'  => $charts,
        ];
    }


    /**
     * Get sector averages for screener
     */
    public function getSectorAverage(int $sectorId): array
    {
        return [
            'cir' => 45.2,
            'cpkh_toi' => 4.5,
            'blvh' => 54.8,
            'blntt' => 38.6,
            'blnst' => 30.5,
            'ttlr' => 15.2,
            'roa' => 1.45,
            'debt_equity' => 9.8,
            'roe' => 16.5,
            'cfo' => 5000,
            'casa' => 22.4,
            'npl' => 1.85,
            'nim' => 3.25,
            'car' => 11.2,
            'llr' => 140.0,
            'toi' => 15000,
        ];
    }
}
