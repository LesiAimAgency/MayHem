/**
 * assets/js/components/criteria-baseline.js
 * Default System Baseline Criteria Seed (Offline fallback & initial state)
 * All criteria are normalized and maintained dynamically in MySQL (filter_criteria table).
 */

export const DEFAULT_BASELINE_CRITERIA = [
  // ====================================================================
  // 1. NGÂN HÀNG (BANKING) - 32 TIÊU CHÍ CHUẨN HÓA
  // ====================================================================
  {
    id: 'crit_cir_under_60_latest',
    category: 'Hiệu Quả Vận Hành & Chi Phí (CIR)',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ Chi phí / Thu nhập (CIR) dưới 60% ở năm gần nhất',
    field: 'Tỷ lệ Chi phí / Thu nhập (CIR)',
    mode: 'threshold',
    operator: '<=',
    value: 0.60,
    displayValue: '60%',
    timeScope: 'latest'
  },
  {
    id: 'crit_cir_under_avg_latest',
    category: 'Hiệu Quả Vận Hành & Chi Phí (CIR)',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ Chi phí / Thu nhập (CIR) dưới trung bình ngành ở năm gần nhất',
    field: 'Tỷ lệ Chi phí / Thu nhập (CIR)',
    mode: 'industry_avg_lower',
    displayValue: '< TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_cir_under_avg_10y',
    category: 'Hiệu Quả Vận Hành & Chi Phí (CIR)',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ Chi phí / Thu nhập (CIR) dưới trung bình ngành liên tiếp 10 năm',
    field: 'Tỷ lệ Chi phí / Thu nhập (CIR)',
    mode: 'industry_avg_lower',
    displayValue: '< TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_cpkh_under_10_latest',
    category: 'Hiệu Quả Vận Hành & Chi Phí (CIR)',
    industry: 'NGAN_HANG',
    name: 'CPKH/Tổng thu nhập hoạt động dưới 10% ở năm gần nhất',
    field: 'CPKH/Tổng thu nhập hoạt động',
    mode: 'threshold',
    operator: '<=',
    value: 0.10,
    displayValue: '10%',
    timeScope: 'latest'
  },
  {
    id: 'crit_op_margin_above_avg_10y',
    category: 'Hiệu Quả Vận Hành & Chi Phí (CIR)',
    industry: 'NGAN_HANG',
    name: 'Biên lãi vận hành (trước DPRR) cao hơn trung bình ngành trong liên tiếp 10 năm',
    field: 'Biên lãi vận hành (trước DPRR)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_pbt_margin_above_avg_10y',
    category: 'Hiệu Quả Vận Hành & Chi Phí (CIR)',
    industry: 'NGAN_HANG',
    name: 'Biên lợi nhuận trước thuế cao hơn trung bình ngành trong liên tiếp 10 năm',
    field: 'Biên lợi nhuận trước thuế',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_npat_margin_above_avg_latest',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Biên Lợi nhuận ST của CĐ công ty mẹ cao hơn trung bình ngành ở năm gần nhất',
    field: 'Biên Lợi nhuận ST của CĐ công ty mẹ',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_npat_margin_above_avg_10y',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Biên Lợi nhuận ST của CĐ công ty mẹ cao hơn trung bình ngành liên tiếp 10 năm',
    field: 'Biên Lợi nhuận ST của CĐ công ty mẹ',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_growth_npat_positive_10y',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Tăng trưởng lãi ròng sau CĐ thiểu số luôn là số dương liên tiếp 10 năm',
    field: 'Tăng trưởng lãi ròng sau CĐ thiểu số',
    mode: 'threshold',
    operator: '>',
    value: 0,
    displayValue: '> 0 (Dương)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_roa_above_avg_latest',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA) cao hơn trung bình ngành ở năm gần nhất',
    field: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_roa_above_avg_10y',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA) cao hơn trung bình ngành liên tiếp 10 năm',
    field: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_roa_above_1pct',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA) từ 1% trở lên ở năm gần nhất',
    field: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)',
    mode: 'threshold',
    operator: '>=',
    value: 0.01,
    displayValue: '1.0%',
    timeScope: 'latest'
  },
  {
    id: 'crit_de_under_10',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Debt/Equity dưới 10 ở năm gần nhất',
    field: 'Debt/Equity',
    mode: 'threshold',
    operator: '<=',
    value: 10,
    displayValue: '10.0',
    timeScope: 'latest'
  },
  {
    id: 'crit_de_under_avg_latest',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Debt/Equity thấp hơn trung bình ngành ở năm gần nhất',
    field: 'Debt/Equity',
    mode: 'industry_avg_lower',
    displayValue: '< TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_de_under_avg_10y',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Debt/Equity thấp hơn trung bình ngành liên tiếp 10 năm',
    field: 'Debt/Equity',
    mode: 'industry_avg_lower',
    displayValue: '< TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_roe_above_avg_latest',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Vốn CSH (ROE) cao hơn trung bình ngành ở năm gần nhất',
    field: 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_roe_above_avg_10y',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Vốn CSH (ROE) cao hơn trung bình ngành liên tiếp 10 năm',
    field: 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_roe_15_10y',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Vốn CSH (ROE) đạt tối thiểu 15% liên tiếp 10 năm',
    field: 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
    mode: 'threshold',
    operator: '>=',
    value: 0.15,
    displayValue: '15.0%',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_roe_20_10y',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Tỷ suất sinh lời trên Vốn CSH (ROE) đạt tối thiểu 20% liên tiếp 10 năm',
    field: 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
    mode: 'threshold',
    operator: '>=',
    value: 0.20,
    displayValue: '20.0%',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_cfo_gt_npat_10y',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Lưu chuyển tiền thuần từ HĐKD lớn hơn LNST của CĐ công ty mẹ liên tiếp 10 năm',
    field: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh',
    mode: 'compare_fields',
    compareWithField: 'Lợi nhuận sau thuế của cổ đông công ty mẹ',
    operator: '>',
    displayValue: '> LNST CĐ mẹ',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_casa_above_avg_latest',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ tiền gửi không kỳ hạn (CASA) cao hơn trung bình ngành ở năm gần nhất',
    field: 'Tỷ lệ tiền gửi không kỳ hạn (CASA)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_casa_above_avg_10y',
    category: 'Thanh Khoản, Nợ Vay & Dòng Tiền',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ tiền gửi không kỳ hạn (CASA) cao hơn trung bình ngành liên tiếp 10 năm',
    field: 'Tỷ lệ tiền gửi không kỳ hạn (CASA)',
    mode: 'industry_avg_higher',
    displayValue: '> TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_npl_under_avg_latest',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ nợ xấu (NPL) cuối năm dưới trung bình ngành ở năm gần nhất',
    field: 'Tỷ lệ nợ xấu (NPL) cuối năm',
    mode: 'industry_avg_lower',
    displayValue: '< TB Ngành',
    timeScope: 'latest'
  },
  {
    id: 'crit_npl_under_avg_10y',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ nợ xấu (NPL) cuối năm dưới trung bình ngành liên tiếp 10 năm',
    field: 'Tỷ lệ nợ xấu (NPL) cuối năm',
    mode: 'industry_avg_lower',
    displayValue: '< TB Ngành (10 năm)',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_nim_above_3_latest',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Biên lãi thuần (NIM) trên 3% năm gần nhất',
    field: 'Biên lãi thuần (NIM)',
    mode: 'threshold',
    operator: '>=',
    value: 0.03,
    displayValue: '3.0%',
    timeScope: 'latest'
  },
  {
    id: 'crit_nim_above_3_10y',
    category: 'Khả Năng Sinh Lời & NIM',
    industry: 'NGAN_HANG',
    name: 'Biên lãi thuần (NIM) trên 3% liên tiếp 10 năm',
    field: 'Biên lãi thuần (NIM)',
    mode: 'threshold',
    operator: '>=',
    value: 0.03,
    displayValue: '3.0%',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_car_above_10_latest',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Hệ số an toàn vốn (CAR) trên 10% năm gần nhất',
    field: 'Hệ số an toàn vốn (CAR)',
    mode: 'threshold',
    operator: '>=',
    value: 0.10,
    displayValue: '10%',
    timeScope: 'latest'
  },
  {
    id: 'crit_car_above_10_10y',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Hệ số an toàn vốn (CAR) trên 10% liên tiếp 10 năm',
    field: 'Hệ số an toàn vốn (CAR)',
    mode: 'threshold',
    operator: '>=',
    value: 0.10,
    displayValue: '10%',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_car_above_12_latest',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Hệ số an toàn vốn (CAR) trên 12% năm gần nhất',
    field: 'Hệ số an toàn vốn (CAR)',
    mode: 'threshold',
    operator: '>=',
    value: 0.12,
    displayValue: '12%',
    timeScope: 'latest'
  },
  {
    id: 'crit_car_above_12_10y',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Hệ số an toàn vốn (CAR) trên 12% liên tiếp 10 năm',
    field: 'Hệ số an toàn vốn (CAR)',
    mode: 'threshold',
    operator: '>=',
    value: 0.12,
    displayValue: '12%',
    timeScope: '10y_consecutive'
  },
  {
    id: 'crit_llr_above_50_latest',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ bao phủ nợ xấu (LLR Coverage) trên 50% ở năm gần nhất',
    field: 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)',
    mode: 'threshold',
    operator: '>=',
    value: 0.50,
    displayValue: '50%',
    timeScope: 'latest'
  },
  {
    id: 'crit_llr_above_50_10y',
    category: 'Chất Lượng Tài Sản & An Toàn Vốn',
    industry: 'NGAN_HANG',
    name: 'Tỷ lệ bao phủ nợ xấu (LLR Coverage) trên 50% liên tiếp 10 năm',
    field: 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)',
    mode: 'threshold',
    displayValue: '50%',
    timeScope: '10y_consecutive'
  }
];

