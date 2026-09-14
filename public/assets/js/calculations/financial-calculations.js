/**
 * assets/js/calculations/financial-calculations.js
 * Implementation of all 16 financial formulas.
 * Rule: Zero mock data. Calculation layer is completely separated from UI and Data layers.
 */

import { safeDivide, safeGrowth, sanitizeResult, isValidNumber } from './calculation-validator.js';

export const CALC_METRICS_META = {
  "Tăng trưởng TOI": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(TOI năm nay - TOI năm trước) / |TOI năm trước|",
    formula_code: "(TOI_t - TOI_{t-1}) / |TOI_{t-1}|"
  },
  "Chi phí vận hành (SG & A)": {
    format: "#,##0", unit: "Tr.đ", type: "number", is_calc: true,
    formula_desc: "Lợi nhuận thuần HĐKD trước DPRR - Tổng thu nhập hoạt động (TOI)",
    formula_code: "LNT trước DPRR - TOI"
  },
  "Tăng tưởng CPVH": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(|CPVH năm nay| - |CPVH năm trước|) / |CPVH năm trước|",
    formula_code: "(|CPVH_t| - |CPVH_{t-1}|) / |CPVH_{t-1}|"
  },
  "Biên lãi vận hành (trước DPRR)": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "Lợi nhuận thuần HĐKD trước DPRR / Tổng thu nhập hoạt động (TOI)",
    formula_code: "LNT trước DPRR / TOI"
  },
  "Biên lợi nhuận trước thuế": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "Tổng lợi nhuận trước thuế (PBT) / Tổng thu nhập hoạt động (TOI)",
    formula_code: "PBT / TOI"
  },
  "Biên lợi nhuận sau thuế thu nhập doanh nghiệp": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "Lợi nhuận sau thuế TNDN / Tổng thu nhập hoạt động (TOI)",
    formula_code: "NPAT / TOI"
  },
  "Biên Lợi nhuận ST của CĐ công ty mẹ": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "Lợi nhuận sau thuế CĐ công ty mẹ / Tổng thu nhập hoạt động (TOI)",
    formula_code: "NPAT_Parent / TOI"
  },
  "Tăng trưởng lãi ròng sau CĐ thiểu số": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(LNST CĐ mẹ năm nay - LNST CĐ mẹ năm trước) / |LNST CĐ mẹ năm trước|",
    formula_code: "(NPAT_Parent_t - NPAT_Parent_{t-1}) / |NPAT_Parent_{t-1}|"
  },
  "CPKH/Tổng thu nhập hoạt động": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "Chi Khấu hao TSCĐ / Tổng thu nhập hoạt động (TOI)",
    formula_code: "Depreciation / TOI"
  },
  "Thay đổi tỷ lệ chi phí vốn": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(|Chi phí vốn bình quân t| - |Chi phí vốn bình quân t-1|) / |Chi phí vốn bình quân t-1|",
    formula_code: "(|COF_t| - |COF_{t-1}|) / |COF_{t-1}|"
  },
  "Thay đổi tỷ lệ nợ nghi ngờ": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(Nợ nghi ngờ năm nay - Nợ nghi ngờ năm trước) / |Nợ nghi ngờ năm trước|",
    formula_code: "(NNN_t - NNN_{t-1}) / |NNN_{t-1}|"
  },
  "Thay đổi tỷ lệ nợ xấu có khả năng mất vốn": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(Nợ xấu mất vốn năm nay - Nợ xấu mất vốn năm trước) / |Nợ xấu mất vốn năm trước|",
    formula_code: "(Nợ mất vốn_t - Nợ mất vốn_{t-1}) / |Nợ mất vốn_{t-1}|"
  },
  "Debt/Equity": {
    format: "0.0", unit: "Lần", type: "decimal", is_calc: true,
    formula_desc: "Tổng nợ phải trả / Vốn chủ sở hữu",
    formula_code: "Tổng nợ / Vốn CSH"
  },
  "Chỉ số tự tài trợ": {
    format: "#,##0", unit: "Lần", type: "number", is_calc: true,
    formula_desc: "Lưu chuyển tiền thuần từ HĐKD / (|Chi Khấu hao TSCĐ| + |Cổ tức trả cổ đông, lợi nhuận đã chia|)",
    formula_code: "LCT thuần từ HĐKD / (|Khấu hao| + |Cổ tức|)"
  },
  "Owner Earnings": {
    format: "#,##0", unit: "Tr.đ", type: "number", is_calc: true,
    formula_desc: "Lợi nhuận ST CĐ mẹ + Chi Khấu hao TSCĐ - |CapEx|",
    formula_code: "LNST CĐ mẹ + Khấu hao - |CapEx|"
  },
  "Tăng trưởng OE": {
    format: "0.00%", unit: "%", type: "percent", is_calc: true,
    formula_desc: "(Owner Earnings năm nay - Owner Earnings năm trước) / |Owner Earnings năm trước|",
    formula_code: "(OE_t - OE_{t-1}) / |OE_{t-1}|"
  }
};

// Backward-compatibility alias
CALC_METRICS_META["Tăng tường CPVH"] = CALC_METRICS_META["Tăng tưởng CPVH"];

export const CALC_FIELDS_LIST = Object.keys(CALC_METRICS_META).filter(k => k !== "Tăng tường CPVH");

/**
 * 46 Standard financial fields in exact dashboard order matching core.xlsx (rows 2 to 47):
 * Interleaved raw (Fill) and calculated (Tính) rows.
 */
export const MASTER_FIELD_ORDER = [
  "Tổng thu nhập hoạt động (TOI)",
  "Tăng trưởng TOI",
  "Chi phí vận hành (SG & A)",
  "Tỷ lệ Chi phí / Thu nhập (CIR)",
  "Tăng tưởng CPVH",
  "Lợi nhuận thuần từ hoạt động kinh doanh trước chi phí dự phòng rủi ro tín dụng",
  "Biên lãi vận hành (trước DPRR)",
  "Chi phí dự phòng rủi ro tín dụng",
  "Tổng lợi nhuận trước thuế (PBT)",
  "Biên lợi nhuận trước thuế",
  "Lợi nhuận sau thuế thu nhập doanh nghiệp",
  "Biên lợi nhuận sau thuế thu nhập doanh nghiệp",
  "Lợi nhuận sau thuế của cổ đông công ty mẹ",
  "Biên Lợi nhuận ST của CĐ công ty mẹ",
  "Tăng trưởng lãi ròng sau CĐ thiểu số",
  "Lãi cơ bản trên cổ phiếu (EPS)",
  "Chi Khấu hao TSCĐ",
  "CPKH/Tổng thu nhập hoạt động",
  "Biên lãi thuần (NIM)",
  "Chi phí vốn bình quân",
  "Thay đổi tỷ lệ chi phí vốn",
  "Tỷ lệ nợ xấu (NPL) cuối năm",
  "Tỷ lệ tiền gửi không kỳ hạn (CASA)",
  "Tổng tài sản",
  "Lưu chuyển tiền thuần từ hoạt động kinh doanh",
  "Cổ tức trả cổ đông, lợi nhuận đã chia",
  "Lưu chuyển tiền thuần từ/(sử dụng vào) hoạt động tài chính",
  "Nợ nghi ngờ",
  "Thay đổi tỷ lệ nợ nghi ngờ",
  "Nợ xấu có khả năng mất vốn",
  "Thay đổi tỷ lệ nợ xấu có khả năng mất vốn",
  "Tỷ lệ bao phủ nợ xấu (LLR Coverage)",
  "Tổng nợ phải trả",
  "Hệ số an toàn vốn (CAR)",
  "Vốn chủ sở hữu",
  "Debt/Equity",
  "Tỷ suất sinh lời trên Tổng Tài Sản (ROA)",
  "Tỷ suất sinh lời trên Vốn CSH (ROE)",
  "Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác (CapEx)",
  "Chỉ số tự tài trợ",
  "Chỉ số P/E cơ bản",
  "Chỉ số P/B",
  "Lợi nhuận sau thuế chưa phân phối",
  "Vốn hóa thị trường",
  "Owner Earnings",
  "Tăng trưởng OE"
];

/**
 * Extracts raw financial metric values without distortion or rounding.
 * Raw figures from BCTC are stored in Triệu Đồng (or % / multiples).
 */
function getStandardizedValue(bData, field, y) {
  if (!bData || !bData[y]) return null;
  const val = bData[y][field];
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (isNaN(num)) return null;

  // Market cap (VND) -> convert to Triệu Đồng
  if (field === 'Vốn hóa thị trường') {
    return num / 1000000;
  }

  return num;
}

export function generateAllFinancialRecords(mappedData) {
  const { years, banks, rawFields, bankFinancials, fieldMetaMap } = mappedData;
  const combinedMetaMap = { ...fieldMetaMap, ...CALC_METRICS_META };
  const records = [];

  banks.forEach(bankCode => {
    const bData = bankFinancials[bankCode] || {};
    const bankRowMap = {};

    // 1. Raw records (Loại: Fill) - 30 fields (keep original raw numbers)
    rawFields.forEach(fMeta => {
      const rowValues = {};
      years.forEach(y => {
        rowValues[y] = bData[y] ? bData[y][fMeta.name] : null;
      });

      bankRowMap[fMeta.name] = {
        loai: "Fill",
        bank: bankCode,
        field: fMeta.name,
        is_calc: false,
        formula_desc: "Dữ liệu gốc khai thác từ BCTC ngân hàng (vnstock)",
        formula_code: "Dữ liệu gốc",
        values: rowValues
      };
    });

    // 2. Computed records (Loại: Tính) - 16 formulas
    const calcVals = {};
    CALC_FIELDS_LIST.forEach(cf => { calcVals[cf] = {}; });
    calcVals["Tăng tường CPVH"] = {};

    for (let i = 0; i < years.length; i++) {
      const y = years[i];
      const yPrev = i > 0 ? years[i - 1] : null;

      // Extract variables with standardized units (Triệu Đồng)
      const toi = getStandardizedValue(bData, "Tổng thu nhập hoạt động (TOI)", y);
      const toiPrev = yPrev ? getStandardizedValue(bData, "Tổng thu nhập hoạt động (TOI)", yPrev) : null;
      const lnt = getStandardizedValue(bData, "Lợi nhuận thuần từ hoạt động kinh doanh trước chi phí dự phòng rủi ro tín dụng", y);
      const pbt = getStandardizedValue(bData, "Tổng lợi nhuận trước thuế (PBT)", y);
      const npat = getStandardizedValue(bData, "Lợi nhuận sau thuế thu nhập doanh nghiệp", y);
      const npatParent = getStandardizedValue(bData, "Lợi nhuận sau thuế của cổ đông công ty mẹ", y);
      const npatParentPrev = yPrev ? getStandardizedValue(bData, "Lợi nhuận sau thuế của cổ đông công ty mẹ", yPrev) : null;
      const dep = getStandardizedValue(bData, "Chi Khấu hao TSCĐ", y);
      const capex = getStandardizedValue(bData, "Tiền chi để mua sắm, xây dựng TSCĐ và các tài sản dài hạn khác (CapEx)", y);
      const cof = getStandardizedValue(bData, "Chi phí vốn bình quân", y);
      const cofPrev = yPrev ? getStandardizedValue(bData, "Chi phí vốn bình quân", yPrev) : null;
      const nnn = getStandardizedValue(bData, "Nợ nghi ngờ", y);
      const nnnPrev = yPrev ? getStandardizedValue(bData, "Nợ nghi ngờ", yPrev) : null;
      const nx = getStandardizedValue(bData, "Nợ xấu có khả năng mất vốn", y);
      const nxPrev = yPrev ? getStandardizedValue(bData, "Nợ xấu có khả năng mất vốn", yPrev) : null;
      const debt = getStandardizedValue(bData, "Tổng nợ phải trả", y);
      const equity = getStandardizedValue(bData, "Vốn chủ sở hữu", y);
      const assets = getStandardizedValue(bData, "Tổng tài sản", y);
      const ocf = getStandardizedValue(bData, "Lưu chuyển tiền thuần từ hoạt động kinh doanh", y);
      const div = getStandardizedValue(bData, "Cổ tức trả cổ đông, lợi nhuận đã chia", y);

      // 1. Tăng trưởng TOI
      calcVals["Tăng trưởng TOI"][y] = safeGrowth(toi, toiPrev);

      // 2. Chi phí vận hành (SG & A) = LNT trước DPRR - TOI
      const cpvh = (isValidNumber(lnt) && isValidNumber(toi)) ? (lnt - toi) : null;
      calcVals["Chi phí vận hành (SG & A)"][y] = sanitizeResult(cpvh);

      // 3. Tăng tưởng CPVH
      const cpvhPrev = (i > 0) ? calcVals["Chi phí vận hành (SG & A)"][years[i - 1]] : null;
      const cpvhGrowth = (isValidNumber(cpvh) && isValidNumber(cpvhPrev))
        ? safeGrowth(Math.abs(cpvh), Math.abs(cpvhPrev))
        : null;
      calcVals["Tăng tưởng CPVH"][y] = cpvhGrowth;
      calcVals["Tăng tường CPVH"][y] = cpvhGrowth;

      // 4. Biên lãi vận hành (trước DPRR) = LNT / TOI
      calcVals["Biên lãi vận hành (trước DPRR)"][y] = safeDivide(lnt, toi);

      // 5. Biên lợi nhuận trước thuế = PBT / TOI
      calcVals["Biên lợi nhuận trước thuế"][y] = safeDivide(pbt, toi);

      // 6. Biên lợi nhuận sau thuế thu nhập doanh nghiệp = NPAT / TOI
      calcVals["Biên lợi nhuận sau thuế thu nhập doanh nghiệp"][y] = safeDivide(npat, toi);

      // 7. Biên Lợi nhuận ST của CĐ công ty mẹ = NPAT_Parent / TOI
      calcVals["Biên Lợi nhuận ST của CĐ công ty mẹ"][y] = safeDivide(npatParent, toi);

      // 8. Tăng trưởng lãi ròng sau CĐ thiểu số = growth(NPAT_Parent)
      calcVals["Tăng trưởng lãi ròng sau CĐ thiểu số"][y] = safeGrowth(npatParent, npatParentPrev);

      // 9. CPKH/Tổng thu nhập hoạt động = Depreciation / TOI
      calcVals["CPKH/Tổng thu nhập hoạt động"][y] = safeDivide(dep, toi);

      // 10. Thay đổi tỷ lệ chi phí vốn = growth(|COF|)
      // Note: In core.xlsx, COF inputs are rounded to 4 decimal places (e.g. -0.0477 & -0.0442), yielding 7.92%
      const cofRoundCurr = isValidNumber(cof) ? Math.round(Math.abs(cof) * 10000) / 10000 : null;
      const cofRoundPrev = isValidNumber(cofPrev) ? Math.round(Math.abs(cofPrev) * 10000) / 10000 : null;
      calcVals["Thay đổi tỷ lệ chi phí vốn"][y] = (isValidNumber(cofRoundCurr) && isValidNumber(cofRoundPrev))
        ? safeGrowth(cofRoundCurr, cofRoundPrev)
        : null;

      // 11. Thay đổi tỷ lệ nợ nghi ngờ = growth(NNN)
      calcVals["Thay đổi tỷ lệ nợ nghi ngờ"][y] = safeGrowth(nnn, nnnPrev);

      // 12. Thay đổi tỷ lệ nợ xấu có khả năng mất vốn = growth(Nợ mất vốn)
      calcVals["Thay đổi tỷ lệ nợ xấu có khả năng mất vốn"][y] = safeGrowth(nx, nxPrev);

      // 13. Debt/Equity = Tổng nợ / Vốn CSH
      calcVals["Debt/Equity"][y] = safeDivide(debt, equity);

      // 14. Chỉ số tự tài trợ = LCT thuần từ HĐKD / (|Khấu hao| + |Cổ tức|) theo đúng core.xlsx
      const absDep = isValidNumber(dep) ? Math.abs(dep) : 0;
      const absDiv = isValidNumber(div) ? Math.abs(div) : 0;
      const selfFinanceDenom = absDep + absDiv;
      calcVals["Chỉ số tự tài trợ"][y] = (isValidNumber(ocf) && selfFinanceDenom > 0)
        ? sanitizeResult(ocf / selfFinanceDenom)
        : null;

      // 15. Owner Earnings = LNST CĐ mẹ + Khấu hao - |CapEx|
      const safeDep = isValidNumber(dep) ? dep : 0;
      const safeCapex = isValidNumber(capex) ? Math.abs(capex) : 0;
      const oe = isValidNumber(npatParent) ? (npatParent + safeDep - safeCapex) : null;
      calcVals["Owner Earnings"][y] = sanitizeResult(oe);

      // 16. Tăng trưởng OE = growth(OE)
      const oePrev = (i > 0) ? calcVals["Owner Earnings"][years[i - 1]] : null;
      calcVals["Tăng trưởng OE"][y] = safeGrowth(oe, oePrev);
    }

    CALC_FIELDS_LIST.forEach(cf => {
      bankRowMap[cf] = {
        loai: "Tính",
        bank: bankCode,
        field: cf,
        is_calc: true,
        formula_desc: CALC_METRICS_META[cf].formula_desc,
        formula_code: CALC_METRICS_META[cf].formula_code,
        values: calcVals[cf]
      };
    });

    // Push rows in exact MASTER_FIELD_ORDER sequence (46 fields)
    MASTER_FIELD_ORDER.forEach(fieldName => {
      if (bankRowMap[fieldName]) {
        records.push(bankRowMap[fieldName]);
      } else if (fieldName === 'Tăng tưởng CPVH' && bankRowMap['Tăng tường CPVH']) {
        records.push(bankRowMap['Tăng tường CPVH']);
      }
    });

    // Fallback: any remaining fields in bankRowMap not in MASTER_FIELD_ORDER
    Object.keys(bankRowMap).forEach(k => {
      if (!MASTER_FIELD_ORDER.includes(k) && k !== 'Tăng tường CPVH') {
        records.push(bankRowMap[k]);
      }
    });
  });

  return {
    allRecords: records,
    fieldMetaMap: combinedMetaMap
  };
}

