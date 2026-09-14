/**
 * assets/js/components/filters.js
 * Multi-Industry Financial Filter Controls:
 * - Dynamic Industry Support: NGAN_HANG, BAT_DONG_SAN, CHUNG_KHOAN, THEP
 * - 1. MAIN STANDARD FILTERS ROW (Khung thời gian, Loại, Mã cổ phiếu/NH, Chỉ tiêu, Datalist Search)
 * - Dynamic Quick Chips per Industry & Multi-Select Checkbox Drawer
 * - Inline Condition Creator ("+ Thêm Điều Kiện Lọc")
 * - Per-Industry Filter Persistence ("Lưu Bộ Lọc Ngành" & "Đặt lại mặc định")
 * - Interactive Screener Panel with 32+ Standardized Benchmark Criteria per Industry
 * Rule: Zero emoji. Clean SVGs only.
 */

import { ICONS, debounce, showToast, escapeHtml, getCompanyDisplayName, getCompanyFullName, getCompanyTradeName } from '../core/helpers.js';
import { CALC_FIELDS_LIST, MASTER_FIELD_ORDER } from '../calculations/financial-calculations.js';
import { BENCHMARK_CRITERIA_CATALOG, onCriteriaUpdated } from './custom-filter-builder.js';
import { auth, ROLE_SUPERADMIN } from '../core/auth.js';
import { renderIndustryAdminModal } from './industry-admin-modal.js';

// -------------------------------------------------------------
// DYNAMIC DATABASE-DRIVEN INDUSTRY CONFIGURATIONS STORE
// -------------------------------------------------------------
export const DEFAULT_BASELINE_INDUSTRY_CONFIGS = {
  NGAN_HANG: {
    id: 'NGAN_HANG',
    name: 'Ngành: Ngân Hàng',
    shortName: 'Ngân Hàng',
    codePrefix: 'NH',
    itemLabel: 'Ngân hàng',
    itemCountLabel: '29 ngân hàng',
    tickers: [
      'VCB', 'BID', 'CTG', 'TCB', 'VPB', 'MBB', 'ACB', 'SHB', 'HDB', 'VIB',
      'LPB', 'MSB', 'SSB', 'OCB', 'EIB', 'TPB', 'STB', 'BAB', 'BVB', 'NAB',
      'KLB', 'PGB', 'SGB', 'VBB', 'NVB', 'ABB', 'CBB', 'GPB', 'OceanBank'
    ],
    quickTickers: ['VCB', 'BID', 'CTG', 'TCB', 'VPB', 'MBB', 'ACB'],
    fields: MASTER_FIELD_ORDER
  },

  BAT_DONG_SAN: {
    id: 'BAT_DONG_SAN',
    name: 'Ngành: Bất Động Sản',
    shortName: 'Bất Động Sản',
    codePrefix: 'BĐS',
    itemLabel: 'Doanh nghiệp BĐS',
    itemCountLabel: '20 doanh nghiệp BĐS',
    tickers: [
      'VHM', 'NVL', 'PDR', 'KDH', 'DXG', 'NLG', 'DIG', 'KBC', 'BCM', 'VRE',
      'VIC', 'HDG', 'CEO', 'ITA', 'DXS', 'KOS', 'AGG', 'TCH', 'IJC', 'KHG'
    ],
    quickTickers: ['VHM', 'NVL', 'PDR', 'KDH', 'DXG', 'NLG', 'DIG'],
    fields: [
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
    ]
  },

  CHUNG_KHOAN: {
    id: 'CHUNG_KHOAN',
    name: 'Ngành: Chứng Khoán',
    shortName: 'Chứng Khoán',
    codePrefix: 'CK',
    itemLabel: 'Công ty chứng khoán',
    itemCountLabel: '20 công ty chứng khoán',
    tickers: [
      'SSI', 'VND', 'VCI', 'HCM', 'SHS', 'MBS', 'FTS', 'BSI', 'CTS', 'AGR',
      'BVS', 'VIX', 'ORS', 'VDS', 'TVS', 'EVS', 'PSI', 'WSS', 'IVS', 'APG'
    ],
    quickTickers: ['SSI', 'VND', 'VCI', 'HCM', 'SHS', 'MBS', 'VIX'],
    fields: [
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
    ]
  },

  THEP: {
    id: 'THEP',
    name: 'Ngành: Thép & VLXD',
    shortName: 'Thép & VLXD',
    codePrefix: 'Thép',
    itemLabel: 'Doanh nghiệp Thép',
    itemCountLabel: '10 doanh nghiệp Thép',
    tickers: ['HPG', 'NKG', 'HSG', 'TLH', 'POM', 'VGS', 'SMC', 'TVN', 'VIS', 'TIS'],
    quickTickers: ['HPG', 'NKG', 'HSG', 'TLH', 'POM', 'VGS', 'SMC'],
    fields: [
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
    ]
  }
};

export const INDUSTRY_CONFIGS = {};
export const INDUSTRY_LISTENERS = new Set();
const STORAGE_INDUSTRY_CACHE_KEY = 'mayhem_industry_configs_db_v2';

export function onIndustryConfigsUpdated(cb) {
  if (typeof cb === 'function') INDUSTRY_LISTENERS.add(cb);
}

export function notifyIndustryConfigsUpdated() {
  INDUSTRY_LISTENERS.forEach(cb => {
    try { cb(INDUSTRY_CONFIGS); } catch (e) { console.error(e); }
  });
}

/**
 * Fetches latest industry configurations dynamically from MySQL via REST API
 */
export async function fetchIndustryConfigsFromBackend() {
  if (typeof fetch !== 'function') return INDUSTRY_CONFIGS;
  try {
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? ''
      : 'http://127.0.0.1:8000';
    const res = await fetch(`${baseUrl}/api/v1/screener/industries`);
    if (!res.ok) return INDUSTRY_CONFIGS;
    const json = await res.json();
    if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      for (const k of Object.keys(INDUSTRY_CONFIGS)) delete INDUSTRY_CONFIGS[k];
      json.data.forEach(item => {
        INDUSTRY_CONFIGS[item.id] = {
          id: item.id,
          name: item.name,
          shortName: item.short_name,
          codePrefix: item.code_prefix,
          itemLabel: item.item_label,
          itemCountLabel: item.item_count_label || `${(item.tickers || []).length} mã`,
          tickers: Array.isArray(item.tickers) ? item.tickers : [],
          quickTickers: Array.isArray(item.quick_tickers) ? item.quick_tickers : [],
          fields: Array.isArray(item.fields) ? item.fields : [],
          sortOrder: item.sort_order
        };
      });

      try {
        localStorage.setItem(STORAGE_INDUSTRY_CACHE_KEY, JSON.stringify(INDUSTRY_CONFIGS));
      } catch (e) { }

      notifyIndustryConfigsUpdated();
      return INDUSTRY_CONFIGS;
    }
  } catch (err) {
    console.warn('[Industry API] Failed to fetch industry configs from backend, using cache:', err.message);
  }
  return INDUSTRY_CONFIGS;
}

/**
 * Loads industry configurations from cache or baseline fallback, then triggers async sync with MySQL
 */
export function loadIndustryConfigs() {
  // 1. Try loading from localStorage cache
  try {
    const rawCache = localStorage.getItem(STORAGE_INDUSTRY_CACHE_KEY);
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        for (const k of Object.keys(INDUSTRY_CONFIGS)) delete INDUSTRY_CONFIGS[k];
        Object.assign(INDUSTRY_CONFIGS, parsed);
      }
    }
  } catch (e) { }

  // 2. Fallback to baseline if empty
  if (Object.keys(INDUSTRY_CONFIGS).length === 0) {
    Object.assign(INDUSTRY_CONFIGS, DEFAULT_BASELINE_INDUSTRY_CONFIGS);
  }

  // 3. Trigger async backend sync
  if (typeof fetch === 'function') {
    fetchIndustryConfigsFromBackend();
  }

  return INDUSTRY_CONFIGS;
}

// Initial Boot of Industry Configurations Store
loadIndustryConfigs();

/**
 * Dynamic harmonious color palette generator for arbitrary category names from Database
 */
export function getCategoryBadgeClass(categoryName) {
  const predefined = {
    'Khả Năng Sinh Lời & NIM': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Hiệu Quả Vận Hành & Chi Phí (CIR)': 'bg-blue-100 text-blue-800 border-blue-200',
    'Chất Lượng Tài Sản & An Toàn Vốn': 'bg-rose-100 text-rose-800 border-rose-200',
    'Thanh Khoản, Nợ Vay & Dòng Tiền': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cơ Cấu Vốn & An Toàn Nợ Vay BĐS': 'bg-rose-100 text-rose-800 border-rose-200',
    'Hàng Tồn Kho & Tiềm Năng Bán Hàng': 'bg-amber-100 text-amber-800 border-amber-200',
    'Hiệu Quả Sinh Lời & Định Giá': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Quy Mô Margin & Tăng Trưởng Hoạt Động': 'bg-blue-100 text-blue-800 border-blue-200',
    'Hiệu Quả Vận Hành & CIR CTCK': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Sinh Lời Vốn CSH & Định Giá': 'bg-purple-100 text-purple-800 border-purple-200',
    'Biên Lợi Nhuận Gộp & Hiệu Quả Chu Kỳ': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Quản Trị Tồn Kho & Dòng Tiền CFO': 'bg-blue-100 text-blue-800 border-blue-200',
    'Đòn Bẩy Tài Chính & Định Giá Thép': 'bg-rose-100 text-rose-800 border-rose-200'
  };
  if (predefined[categoryName]) return predefined[categoryName];

  const palette = [
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200'
  ];
  let hash = 0;
  const str = String(categoryName || '');
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

export function renderFilters(container, options = {}, onFilterChange = () => { }) {
  let currentIndustry = options.industry || 'NGAN_HANG';
  let config = INDUSTRY_CONFIGS[currentIndustry] || INDUSTRY_CONFIGS.NGAN_HANG;

  const {
    years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
    filterBuilderInstance = null,
    onOpenFilterBuilder = () => { },
    onApplyCustomFilter = () => { }
  } = options;

  // Ensure full 11-year span (2015 -> 2025) is always available
  const FULL_SYSTEM_YEARS = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];
  let availableYears = (years && years.length >= 5) ? years.map(y => String(y)) : FULL_SYSTEM_YEARS;

  // Local state
  let selectedTickers = new Set(config.tickers);
  let selectedFields = new Set(config.fields);
  let isCheckboxPanelOpen = false;
  let isInlineBuilderOpen = false;
  let activeTab = 'banks'; // 'banks' (tickers) or 'fields'

  // Screener state: Set of active criterion IDs
  const activeCriteriaIds = new Set();
  let customInlineCriteria = []; // User-added custom criteria [{ id, name, field, operator, value, timeScope, displayValue }]
  let isScreenerExpanded = localStorage.getItem('mayhem_screener_expanded') !== 'false';
  let activePresetName = null;

  // Key for per-industry persistence
  const getStorageKey = (ind) => `mayhem_filter_config_${ind}`;

  // Helper to get active condition objects
  const getActiveConditionObjects = () => {
    const fromCatalog = Array.from(activeCriteriaIds).map(id => {
      const item = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === id);
      return item ? { ...item, enabled: true } : null;
    }).filter(Boolean);

    const fromInline = customInlineCriteria.filter(c => activeCriteriaIds.has(c.id));
    return [...fromCatalog, ...fromInline];
  };

  // Restore saved config for industry if present
  const loadSavedConfig = (ind) => {
    try {
      const raw = localStorage.getItem(getStorageKey(ind));
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read saved filter config:', e);
    }
    return null;
  };

  container.innerHTML = `
    <div class="flex flex-col gap-3.5">
      <!-- 1. MAIN STANDARD FILTERS ROW -->
      <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col gap-3.5">
        
        <!-- Top Industry Notice Badge -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span id="lblFilterIndustryTitle" class="text-xs font-bold text-slate-800">
              Bộ Lọc Chuẩn Ngành: <span class="text-blue-700 font-extrabold uppercase">${config.name}</span>
            </span>
            <span id="badgeIndustryTickerCount" class="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ${config.tickers.length} mã
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span id="lblSavedStatusNotice" class="text-[11px] text-slate-400 font-medium"></span>
            <button id="btnOpenIndustryAdminModal" type="button" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg transition shadow-2xs active:scale-95" title="Chỉnh sửa mã cổ phiếu, chỉ tiêu hoặc thêm ngành mới vào Database">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>Quản Trị Ngành & Bộ Lọc (DB)</span>
            </button>
            <button id="btnSaveIndustryFilter" type="button" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition shadow-2xs active:scale-95" title="Lưu cấu hình lọc hiện tại riêng cho nhóm ngành này">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
              <span>Lưu Bộ Lọc Ngành</span>
            </button>
            <button id="btnResetIndustryFilter" type="button" class="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition" title="Đặt lại về mặc định ngành">
              ${ICONS.RESET}
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        <!-- 5 Dropdowns & Inputs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <!-- Filter Khung thời gian -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Khung thời gian</label>
            <div class="grid grid-cols-2 gap-1.5">
              <select id="filterStartYear" class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-2 outline-none focus:bg-white focus:border-blue-500 font-mono">
                ${availableYears.map((y, idx) => `
                  <option value="${y}" ${idx === 0 ? 'selected' : ''}>${y}</option>
                `).join('')}
              </select>
              <select id="filterEndYear" class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-2 outline-none focus:bg-white focus:border-blue-500 font-mono">
                ${availableYears.map((y, idx, arr) => `
                  <option value="${y}" ${idx === arr.length - 1 ? 'selected' : ''}>${y}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Filter Loại -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Loại chỉ tiêu</label>
            <select id="filterLoai" class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
              <option value="ALL">Tất cả chỉ tiêu</option>
              <option value="Fill">Fill - Chỉ tiêu gốc BCTC</option>
              <option value="Tính">Tính - Chỉ tiêu đối chiếu</option>
            </select>
          </div>

          <!-- Filter Mã cổ phiếu / Ngân hàng đơn lẻ -->
          <div>
            <label id="lblFilterBank" class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Mã cổ phiếu / NH đơn lẻ</label>
            <select id="filterBank" class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
              <!-- Dynamically populated -->
            </select>
          </div>

          <!-- Filter Chỉ tiêu đơn lẻ -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Chỉ tiêu tài chính</label>
            <select id="filterField" class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition">
              <!-- Dynamically populated -->
            </select>
          </div>

          <!-- Search Input with HTML5 Datalist -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Tìm kiếm (Datalist)</label>
            <div class="relative">
              <input type="text" id="filterSearch" list="searchDatalist" autocomplete="off" placeholder="Gõ mã CP hoặc chỉ tiêu..." class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg pl-9 pr-3 py-2 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-slate-400" />
              <div class="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                ${ICONS.SEARCH}
              </div>
              <datalist id="searchDatalist">
                <!-- Dynamically populated -->
              </datalist>
            </div>
          </div>
        </div>

        <!-- Action Bar: Multi-Select Toggle, Quick Chips, Inline Builder Trigger -->
        <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200">
          <div class="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            <!-- Multi-select Datalist Toggle -->
            <button id="btnToggleCheckboxDatalist" type="button" class="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition" title="Bấm để chọn danh sách mã / chỉ tiêu cụ thể">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              <span id="lblMultiSelectTitle">Chọn Nhiều Mã:</span>
              <span id="badgeSelectedBankCount" class="font-mono text-[11px] font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200"></span>
            </button>

            <span class="text-slate-400 ml-1">Mã nhanh:</span>
            <div id="quickChipsContainer" class="flex items-center gap-1.5 flex-wrap">
              <!-- Dynamically populated for current industry -->
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <!-- Inline Filter Creator Trigger Button -->
            <button id="btnOpenInlineBuilder" type="button" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition shadow-2xs active:scale-95" title="Thêm tiêu chí lọc số học tùy chọn vào bộ lọc">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span> Thêm Điều Kiện Lọc</span>
            </button>

            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none ml-1">
              <input type="checkbox" id="chkShowFormula" class="rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
              <span>Hiện cột công thức</span>
            </label>
          </div>
        </div>

        <!-- COLLAPSIBLE INLINE FILTER BUILDER PANEL -->
        <div id="inlineFilterBuilderContainer" class="hidden p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/50 to-white border border-indigo-200 shadow-sm flex flex-col gap-2.5 transition-all">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span class="text-xs font-bold text-slate-800" id="lblInlineBuilderTitle">
                Tạo & Thêm Điều Kiện Lọc Mới Cho Ngành:
              </span>
            </div>
            <button id="btnCloseInlineBuilder" type="button" class="text-slate-400 hover:text-slate-600 text-xs p-1" title="Đóng bảng tạo điều kiện">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
            <!-- Select Field -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-[11px] font-semibold text-slate-600">Chỉ tiêu tài chính</label>
                <label class="inline-flex items-center gap-1 cursor-pointer text-[10px] text-indigo-600 hover:text-indigo-800 select-none" title="Chỉ hiển thị 15 chỉ tiêu tài chính cốt lõi để lọc nhanh">
                  <input type="checkbox" id="cbInlineOnlyCoreFields" class="rounded text-indigo-600 focus:ring-0 h-3 w-3" checked />
                  <span>Chỉ 15 chỉ tiêu cốt lõi</span>
                </label>
              </div>
              <select id="inlineCritField" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500 font-medium">
                <!-- Dynamically populated -->
              </select>
            </div>

            <!-- Operator & Value -->
            <div class="grid grid-cols-2 gap-1.5">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Toán tử</label>
                <select id="inlineCritOp" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500 font-bold">
                  <option value=">=">&gt;= (Lớn hơn / bằng)</option>
                  <option value=">">&gt; (Lớn hơn)</option>
                  <option value="<=">&lt;= (Nhỏ hơn / bằng)</option>
                  <option value="<">&lt; (Nhỏ hơn)</option>
                  <option value="=">= (Bằng)</option>
                  <option value="industry_avg_higher">&gt; TB Ngành</option>
                  <option value="industry_avg_lower">&lt; TB Ngành</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Ngưỡng giá trị</label>
                <input type="number" step="any" id="inlineCritVal" placeholder="VD: 0.15 (15%)" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2 py-2 outline-none focus:border-indigo-500 font-mono" />
              </div>
            </div>

            <!-- Time Scope -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-600 mb-1">Khung thời gian áp dụng</label>
              <select id="inlineCritScope" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-indigo-500">
                <option value="latest">Năm gần nhất (2024 / 2025)</option>
                <option value="10y_consecutive">Liên tiếp 10 năm</option>
              </select>
            </div>

            <!-- Add Button -->
            <div class="flex items-center gap-2">
              <button id="btnAddInlineCriterion" type="button" class="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Thêm Vào Bộ Lọc</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ACTIVE CUSTOM CONDITIONS CHIPS BAR -->
        <div id="activeConditionsChipsBar" class="hidden flex items-center justify-between flex-wrap gap-2 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-indigo-900 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span id="lblActiveConditionsCount">Đang lọc 0 điều kiện tùy chọn:</span>
            </span>
            <div id="activeConditionsList" class="flex items-center gap-1.5 flex-wrap">
              <!-- Active condition badges with [x] -->
            </div>
          </div>
          <button id="btnClearAllCustomConditions" type="button" class="text-rose-600 hover:text-rose-800 text-[11px] font-semibold hover:underline">
            Xóa tất cả điều kiện
          </button>
        </div>

        <!-- Expandable Datalist Multi-select Checkbox Panel -->
        <div id="datalistCheckboxPanel" class="hidden mt-1 p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col gap-3">
          <div class="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <button id="tabBtnBanks" type="button" class="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white transition">
                Mã cổ phiếu (${config.tickers.length})
              </button>
              <button id="tabBtnFields" type="button" class="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition">
                Chỉ tiêu (${config.fields.length})
              </button>
            </div>

            <div class="flex items-center gap-2 text-xs">
              <button id="btnSelectAll" type="button" class="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition">
                Chọn tất cả
              </button>
              <button id="btnDeselectAll" type="button" class="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition">
                Bỏ chọn tất cả
              </button>
              <button id="btnSelectTopGroup" type="button" class="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition font-medium">
                Top Đầu Ngành
              </button>
            </div>
          </div>

          <div id="tabContentBanks" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            <!-- Dynamically populated -->
          </div>

          <div id="tabContentFields" class="hidden flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            <div id="tabFieldsGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>

      <!-- 2. DASHBOARD SCREENER & CRITERIA CHECKBOX PANEL -->
      <div id="dashboardScreenerPanel" class="rounded-xl bg-white border border-blue-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300">
        <!-- Panel Header -->
        <div class="p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white border-b border-blue-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3 flex-wrap">
            <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-bold text-slate-800">Bộ Lọc Điều Kiện Tài Chính (Tích Chọn Trực Tiếp)</h3>
                <span id="badgeScreenerStatus" class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
                  <!-- Dynamically populated -->
                </span>
              </div>
              <p id="lblScreenerSubdesc" class="text-[11px] text-slate-500 mt-0.5">
                Tích chọn bộ lọc mẫu đã lưu hoặc từng tiêu chí bên dưới để lọc tự động trên Bảng Ma Trận
              </p>
            </div>
          </div>

          <!-- Top Actions -->
          <div class="flex items-center gap-2 flex-wrap">
            <button id="btnClearAllScreenerCriteria" type="button" class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition active:scale-95" title="Bỏ tích toàn bộ tiêu chí">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span id="lblClearScreenerText">Bỏ chọn tiêu chí</span>
            </button>

            <button id="btnToggleScreenerBody" type="button" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition" title="Thu gọn hoặc mở rộng bảng tiêu chí">
              <span id="lblToggleScreenerText">${isScreenerExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
              <svg id="iconToggleScreenerChevron" class="w-3.5 h-3.5 transition-transform duration-200 ${isScreenerExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
        </div>

        <!-- Matching Companies Live Bar -->
        <div id="screenerMatchingBanksBar" class="hidden px-4 py-2.5 bg-blue-600 text-white text-xs flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span id="lblMatchingBarTitle">Doanh nghiệp thỏa mãn:</span>
            </span>
            <div id="screenerMatchingBadgesContainer" class="flex items-center gap-1.5 flex-wrap">
              <!-- Dynamically populated -->
            </div>
          </div>
          <span id="screenerCriteriaCountNote" class="text-[11px] text-blue-100 font-mono">
            Đang thỏa mãn 0 tiêu chí
          </span>
        </div>

        <!-- Screener Body (Collapsible) -->
        <div id="screenerBodyContainer" class="${isScreenerExpanded ? '' : 'hidden'} p-4 flex flex-col gap-4">
          
          <!-- SECTION 1: BỘ LỌC ĐÃ LƯU & MẪU CHUẨN (PRESETS) -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>1. Cấu Hình Bộ Lọc Mẫu Chuẩn & Đã Lưu:</span>
              </span>
              <span class="text-[11px] text-slate-400">Tích chọn để áp dụng ngay bộ tiêu chí chuẩn</span>
            </div>

            <!-- Presets & Saved Filters Checkbox Grid -->
            <div id="presetsCheckboxGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <!-- Dynamically rendered by renderPresetsGrid() -->
            </div>
          </div>

          <!-- SECTION 2: DANH MỤC TIÊU CHÍ CHUẨN HÓA CỦA NGÀNH -->
          <div class="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span id="lblCriteriaSectionTitle">2. Thiết Lập Tiêu Chí Chuẩn Hóa Của Ngành:</span>
              </span>
              <span class="text-[11px] text-slate-500 font-medium">Bảng ma trận tự động lọc các mã thỏa mãn đồng thời</span>
            </div>

            <div id="criteriaGroupsGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <!-- Dynamically rendered by renderCriteriaGrid() -->
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Attach Elements
  const lblFilterIndustryTitle = container.querySelector('#lblFilterIndustryTitle');
  const badgeIndustryTickerCount = container.querySelector('#badgeIndustryTickerCount');
  const lblSavedStatusNotice = container.querySelector('#lblSavedStatusNotice');
  const btnOpenIndustryAdmin = container.querySelector('#btnOpenIndustryAdminModal');
  const btnSaveIndustry = container.querySelector('#btnSaveIndustryFilter');
  const btnResetIndustry = container.querySelector('#btnResetIndustryFilter');

  if (btnOpenIndustryAdmin) {
    btnOpenIndustryAdmin.addEventListener('click', () => {
      let modalContainer = document.getElementById('industryAdminModalContainer');
      if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'industryAdminModalContainer';
        modalContainer.style.position = 'relative';
        modalContainer.style.zIndex = '99999';
        document.body.appendChild(modalContainer);
      }
      renderIndustryAdminModal(modalContainer, {
        industryConfigs: INDUSTRY_CONFIGS,
        currentIndustry,
        onIndustrySaved: async (indId, savedData) => {
          await fetchIndustryConfigsFromBackend();
          setIndustry(indId);
        },
        onIndustryDeleted: async (indId) => {
          await fetchIndustryConfigsFromBackend();
          const remaining = Object.keys(INDUSTRY_CONFIGS)[0] || 'NGAN_HANG';
          setIndustry(remaining);
        },
        onResetDefaults: async () => {
          await fetchIndustryConfigsFromBackend();
          setIndustry('NGAN_HANG');
        }
      });
    });
  }

  const selStartYear = container.querySelector('#filterStartYear');
  const selEndYear = container.querySelector('#filterEndYear');
  const selLoai = container.querySelector('#filterLoai');
  const selBank = container.querySelector('#filterBank');
  const selField = container.querySelector('#filterField');
  const inpSearch = container.querySelector('#filterSearch');
  const chkFormula = container.querySelector('#chkShowFormula');
  const searchDatalist = container.querySelector('#searchDatalist');

  const btnToggleCheckbox = container.querySelector('#btnToggleCheckboxDatalist');
  const datalistPanel = container.querySelector('#datalistCheckboxPanel');
  const badgeBankCount = container.querySelector('#badgeSelectedBankCount');
  const quickChipsContainer = container.querySelector('#quickChipsContainer');

  const tabBtnBanks = container.querySelector('#tabBtnBanks');
  const tabBtnFields = container.querySelector('#tabBtnFields');
  const tabContentBanks = container.querySelector('#tabContentBanks');
  const tabContentFields = container.querySelector('#tabContentFields');
  const tabFieldsGrid = container.querySelector('#tabFieldsGrid');
  const btnSelectAll = container.querySelector('#btnSelectAll');
  const btnDeselectAll = container.querySelector('#btnDeselectAll');
  const btnSelectTopGroup = container.querySelector('#btnSelectTopGroup');

  // Inline Filter Builder Elements
  const btnOpenInlineBuilder = container.querySelector('#btnOpenInlineBuilder');
  const inlineFilterBuilderContainer = container.querySelector('#inlineFilterBuilderContainer');
  const btnCloseInlineBuilder = container.querySelector('#btnCloseInlineBuilder');
  const cbInlineOnlyCoreFields = container.querySelector('#cbInlineOnlyCoreFields');
  const inlineCritField = container.querySelector('#inlineCritField');
  const inlineCritOp = container.querySelector('#inlineCritOp');
  const inlineCritVal = container.querySelector('#inlineCritVal');
  const inlineCritScope = container.querySelector('#inlineCritScope');
  const btnAddInlineCriterion = container.querySelector('#btnAddInlineCriterion');
  const lblInlineBuilderTitle = container.querySelector('#lblInlineBuilderTitle');

  // Active Conditions Bar Elements
  const activeConditionsChipsBar = container.querySelector('#activeConditionsChipsBar');
  const activeConditionsList = container.querySelector('#activeConditionsList');
  const lblActiveConditionsCount = container.querySelector('#lblActiveConditionsCount');
  const btnClearAllCustomConditions = container.querySelector('#btnClearAllCustomConditions');

  // Screener Elements
  const badgeScreenerStatus = container.querySelector('#badgeScreenerStatus');
  const screenerMatchingBanksBar = container.querySelector('#screenerMatchingBanksBar');
  const screenerMatchingBadgesContainer = container.querySelector('#screenerMatchingBadgesContainer');
  const screenerCriteriaCountNote = container.querySelector('#screenerCriteriaCountNote');
  const presetsCheckboxGrid = container.querySelector('#presetsCheckboxGrid');
  const criteriaGroupsGrid = container.querySelector('#criteriaGroupsGrid');
  const btnClearScreener = container.querySelector('#btnClearAllScreenerCriteria');
  const btnToggleScreener = container.querySelector('#btnToggleScreenerBody');
  const screenerBody = container.querySelector('#screenerBodyContainer');
  const lblToggleText = container.querySelector('#lblToggleScreenerText');
  const iconToggleChevron = container.querySelector('#iconToggleScreenerChevron');
  const lblScreenerSubdesc = container.querySelector('#lblScreenerSubdesc');

  // -------------------------------------------------------------
  // POPULATE CONTROLS BASED ON CURRENT INDUSTRY
  // -------------------------------------------------------------
  const populateIndustryControls = () => {
    config = INDUSTRY_CONFIGS[currentIndustry] || INDUSTRY_CONFIGS.NGAN_HANG;

    // 1. Update Title & Header Notice
    lblFilterIndustryTitle.innerHTML = `Bộ Lọc Chuẩn Ngành: <span class="text-blue-700 font-extrabold uppercase">${config.name}</span>`;
    badgeIndustryTickerCount.textContent = `${config.tickers.length} mã`;
    const savedConfig = loadSavedConfig(currentIndustry);
    lblSavedStatusNotice.textContent = savedConfig ? `(Đã lưu cấu hình ${new Date(savedConfig.savedAt).toLocaleDateString('vi-VN')})` : '';

    // 2. Populate Ticker Select `#filterBank`
    selBank.innerHTML = `
      <option value="ALL">Tất cả (${config.tickers.length} ${config.itemLabel.toLowerCase()})</option>
      ${config.tickers.map(code => {
      return `<option value="${code}">${getCompanyDisplayName(code)}</option>`;
    }).join('')}
    `;

    // 3. Populate Field Select `#filterField` & Inline Field Select `#inlineCritField`
    selField.innerHTML = `
      <option value="ALL">Tất cả chỉ tiêu (${config.fields.length} chỉ tiêu)</option>
      ${config.fields.map((f, idx) => {
      const isCalc = CALC_FIELDS_LIST.includes(f);
      const prefix = isCalc ? '[Tính]' : '[Fill]';
      return `<option value="${f}">${idx + 1}. ${prefix} ${f}</option>`;
    }).join('')}
    `;

    // 15 Chỉ tiêu tài chính cốt lõi từ danh mục chuẩn hóa của ngành
    const catalogFields = [...new Set(
      BENCHMARK_CRITERIA_CATALOG
        .filter(c => c.industry === config.id || c.industry === 'ALL')
        .map(c => c.field)
        .filter(Boolean)
    )];

    const populateInlineFieldSelect = (onlyCore = true) => {
      if (onlyCore && catalogFields.length > 0) {
        inlineCritField.innerHTML = catalogFields.map((f, idx) => {
          return `<option value="${f}">${idx + 1}. ${f}</option>`;
        }).join('');
      } else {
        const otherFields = config.fields.filter(f => !catalogFields.includes(f));
        let html = '';
        if (catalogFields.length > 0) {
          html += `<optgroup label="⭐ 15 Chỉ tiêu tài chính cốt lõi (${catalogFields.length})">`;
          html += catalogFields.map((f, idx) => `<option value="${f}">${idx + 1}. ${f}</option>`).join('');
          html += `</optgroup>`;
        }
        if (otherFields.length > 0) {
          html += `<optgroup label="📋 Khoản mục báo cáo tài chính khác (${otherFields.length})">`;
          html += otherFields.map((f, idx) => `<option value="${f}">${catalogFields.length + idx + 1}. ${f}</option>`).join('');
          html += `</optgroup>`;
        }
        inlineCritField.innerHTML = html;
      }
    };

    populateInlineFieldSelect(cbInlineOnlyCoreFields ? cbInlineOnlyCoreFields.checked : true);

    if (cbInlineOnlyCoreFields) {
      cbInlineOnlyCoreFields.onchange = () => {
        populateInlineFieldSelect(cbInlineOnlyCoreFields.checked);
      };
    }

    lblInlineBuilderTitle.textContent = `Tạo & Thêm Điều Kiện Lọc Mới Cho Ngành ${config.shortName}:`;

    // 4. Populate Search Datalist
    searchDatalist.innerHTML = `
      ${config.tickers.map(code => `<option value="${code}">${getCompanyDisplayName(code)}</option>`).join('')}
      ${config.fields.map(f => `<option value="${f}">${f}</option>`).join('')}
    `;

    // 5. Populate Quick Chips
    quickChipsContainer.innerHTML = config.quickTickers.map(code => `
      <button type="button" class="quick-bank-chip px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[11px] transition font-semibold" data-bank="${code}">
        ${code}
      </button>
    `).join('') + `
      <button type="button" class="quick-loai-chip px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] transition font-semibold" data-loai="Tính">
        Chỉ tiêu tính
      </button>
    `;

    // Attach Quick Chip Listeners
    quickChipsContainer.querySelectorAll('.quick-bank-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const b = btn.getAttribute('data-bank');
        selBank.value = b;
        selectedTickers.clear();
        selectedTickers.add(b);
        syncMultiSelectCheckboxes();
        badgeBankCount.textContent = `1/${config.tickers.length} mã`;
        triggerChange();
      });
    });

    quickChipsContainer.querySelectorAll('.quick-loai-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        selLoai.value = btn.getAttribute('data-loai');
        triggerChange();
      });
    });

    // 6. Populate Multi-Select Drawer Tabs & Content
    tabBtnBanks.textContent = `${config.codePrefix} (${config.tickers.length})`;
    tabBtnFields.textContent = `Chỉ tiêu (${config.fields.length})`;
    btnSelectTopGroup.textContent = `Top ${config.shortName} (${config.quickTickers.slice(0, 4).join(', ')})`;

    tabContentBanks.innerHTML = config.tickers.map(code => `
      <label class="flex items-center gap-1.5 p-1.5 rounded-md bg-white hover:bg-blue-50 cursor-pointer text-xs select-none border border-slate-200 transition" title="${getCompanyFullName(code)} (${getCompanyTradeName(code)})">
        <input type="checkbox" class="cb-bank rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 shrink-0" value="${code}" ${selectedTickers.has(code) ? 'checked' : ''} />
        <span class="font-mono font-bold text-slate-800">${code}</span>
        <span class="text-[11px] text-slate-500 truncate" title="${getCompanyFullName(code)}">${getCompanyTradeName(code)}</span>
      </label>
    `).join('');

    tabFieldsGrid.innerHTML = config.fields.map((f, idx) => {
      const isCalc = CALC_FIELDS_LIST.includes(f);
      const borderClass = isCalc ? 'border-purple-200 hover:bg-purple-50' : 'border-slate-200 hover:bg-slate-50';
      const textClass = isCalc ? 'text-purple-900 font-semibold' : 'text-slate-800';
      const badgeClass = isCalc ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200';
      const prefix = isCalc ? 'Tính' : 'Fill';
      return `
        <label class="flex items-center gap-2 p-1.5 rounded bg-white cursor-pointer text-xs select-none border ${borderClass} transition">
          <input type="checkbox" class="cb-field rounded bg-white border-slate-300 ${isCalc ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'} h-3.5 w-3.5 shrink-0" value="${f}" ${selectedFields.has(f) ? 'checked' : ''} />
          <span class="px-1 py-0.2 rounded text-[9px] font-bold uppercase border ${badgeClass}">${prefix}</span>
          <span class="${textClass} truncate" title="${idx + 1}. ${f}">${idx + 1}. ${f}</span>
        </label>
      `;
    }).join('');

    attachMultiSelectCheckboxes();

    // 7. Update Screener Header & Descriptions
    badgeBankCount.textContent = `${selectedTickers.size}/${config.tickers.length} mã`;
    badgeScreenerStatus.textContent = `Tất cả ${config.tickers.length}/${config.tickers.length} mã (${config.shortName})`;
    lblScreenerSubdesc.textContent = `Tích chọn bộ lọc mẫu đã lưu hoặc từng tiêu chí bên dưới để lọc tự động ${config.itemCountLabel} trên Bảng Ma Trận`;

    // 8. Render Screener Presets & Criteria Groups
    renderPresetsGrid();
    renderCriteriaGrid();
    renderActiveConditionsBar();
  };

  // -------------------------------------------------------------
  // MULTI-SELECT CHECKBOXES EVENT BINDING
  // -------------------------------------------------------------
  const attachMultiSelectCheckboxes = () => {
    tabContentBanks.querySelectorAll('.cb-bank').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedTickers.add(cb.value);
        } else {
          selectedTickers.delete(cb.value);
        }
        badgeBankCount.textContent = `${selectedTickers.size}/${config.tickers.length} mã`;
        triggerChange();
      });
    });

    tabFieldsGrid.querySelectorAll('.cb-field').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          selectedFields.add(cb.value);
        } else {
          selectedFields.delete(cb.value);
        }
        triggerChange();
      });
    });
  };

  const syncMultiSelectCheckboxes = () => {
    tabContentBanks.querySelectorAll('.cb-bank').forEach(cb => {
      cb.checked = selectedTickers.has(cb.value);
    });
  };

  // -------------------------------------------------------------
  // SCREENER EVALUATION & REACTIVE LOGIC
  // -------------------------------------------------------------
  const evaluateAndApplyScreener = () => {
    const activeConds = getActiveConditionObjects();

    if (activeConds.length === 0) {
      badgeScreenerStatus.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs';
      badgeScreenerStatus.textContent = `Tất cả ${config.tickers.length}/${config.tickers.length} mã (${config.shortName})`;
      screenerMatchingBanksBar.classList.add('hidden');
      screenerMatchingBadgesContainer.innerHTML = '';

      container.querySelectorAll('.cb-screener-preset').forEach(cb => { cb.checked = false; });
      renderActiveConditionsBar();
      onApplyCustomFilter(config.tickers.slice(), [], null);
      return;
    }

    // Evaluate matching companies
    let matchingTickers = config.tickers.slice();
    if (filterBuilderInstance && typeof filterBuilderInstance.getMatchingBanksForConditions === 'function') {
      matchingTickers = filterBuilderInstance.getMatchingBanksForConditions(activeConds, matchingTickers);
    }

    // Update UI Badges & Live Bar
    badgeScreenerStatus.className = 'px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-600 text-white shadow-2xs animate-pulse';
    badgeScreenerStatus.textContent = `Sàng lọc được: ${matchingTickers.length}/${config.tickers.length} mã (${activeConds.length} tiêu chí)`;

    screenerMatchingBanksBar.classList.remove('hidden');
    screenerMatchingBadgesContainer.innerHTML = matchingTickers.length > 0
      ? matchingTickers.map(b => `<span class="px-2 py-0.5 rounded bg-white text-blue-900 font-mono font-bold text-xs shadow-2xs" title="${getCompanyFullName(b)}">${b}</span>`).join('')
      : `<span class="italic text-amber-200">Không có doanh nghiệp nào thỏa mãn toàn bộ tiêu chí đã chọn.</span>`;

    screenerCriteriaCountNote.textContent = `Đang áp dụng ${activeConds.length} tiêu chí • ${matchingTickers.length} mã đạt chuẩn`;

    syncPresetCheckboxes();
    renderActiveConditionsBar();
    onApplyCustomFilter(matchingTickers, activeConds, activePresetName);
  };

  const syncPresetCheckboxes = () => {
    container.querySelectorAll('.cb-screener-preset').forEach(cb => {
      const fId = cb.getAttribute('data-filter-id');
      const targetFilter = filterBuilderInstance && Array.isArray(filterBuilderInstance.managedFilters)
        ? filterBuilderInstance.managedFilters.find(f => String(f.id) === String(fId))
        : null;
      if (targetFilter && Array.isArray(targetFilter.conditions) && targetFilter.conditions.length > 0) {
        const isAllActive = targetFilter.conditions.every((c, idx) => {
          const catalogItem = typeof c === 'string'
            ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c)
            : (c.id ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c.id) : null);
          const expectedId = catalogItem ? catalogItem.id : ((c && c.id) ? String(c.id) : `custom_filter_${fId}_cond_${idx}`);
          return activeCriteriaIds.has(expectedId);
        });
        cb.checked = isAllActive;
      } else {
        cb.checked = false;
      }
    });
  };

  // -------------------------------------------------------------
  // RENDER PRESETS & SAVED FILTERS GRID
  // -------------------------------------------------------------
  const renderPresetsGrid = () => {
    // 100% dynamic loading from backend managedFilters - zero hardcoded presets
    const filtersList = (filterBuilderInstance && Array.isArray(filterBuilderInstance.managedFilters))
      ? filterBuilderInstance.managedFilters.filter(f => f.industry === currentIndustry || !f.industry)
      : [];

    const allPresets = filtersList.map(f => {
      const rawConds = Array.isArray(f.conditions) ? f.conditions : [];
      return {
        id: `filter_${f.id}`,
        rawId: f.id,
        name: f.name,
        desc: `${rawConds.length} tiêu chí tài chính`,
        badge: f.is_preset ? 'Mẫu Chuẩn' : 'Tự Lưu',
        conditions: rawConds,
        isPreset: Boolean(f.is_preset)
      };
    });

    if (allPresets.length === 0) {
      presetsCheckboxGrid.innerHTML = `
        <div class="col-span-full p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50">
          Chưa có bộ lọc mẫu nào cho nhóm ngành này. Bạn có thể bấm "Thêm Điều Kiện Lọc" để tự lưu bộ lọc mới.
        </div>
      `;
      return;
    }

    presetsCheckboxGrid.innerHTML = allPresets.map(p => `
      <div class="group relative p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition shadow-2xs flex flex-col justify-between gap-1.5" data-filter-card-id="${p.rawId}">
        <label class="flex items-start gap-2.5 cursor-pointer select-none">
          <input type="checkbox" class="cb-screener-preset rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5 shrink-0" data-filter-id="${p.rawId}" data-preset-name="${escapeHtml(p.name)}" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <span class="text-xs font-bold text-slate-800 group-hover:text-blue-900 truncate" title="${escapeHtml(p.name)}">
                ${escapeHtml(p.name)}
              </span>
              <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${p.isPreset ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'}">
                ${p.badge}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5 truncate" title="${escapeHtml(p.desc)}">${escapeHtml(p.desc)}</p>
          </div>
        </label>

        <div class="flex items-center justify-end pt-1 border-t border-slate-200/60">
          <button type="button" class="btn-delete-saved-filter text-[10px] text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1 font-medium transition active:scale-95" data-id="${p.rawId}" data-name="${escapeHtml(p.name)}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </div>
    `).join('');
  };

  // Attach Event Delegation for presetsCheckboxGrid
  if (presetsCheckboxGrid) {
    // 1. Preset Checkbox Change Delegation
    presetsCheckboxGrid.addEventListener('change', (e) => {
      const cb = e.target.closest('.cb-screener-preset');
      if (!cb) return;

      const fId = cb.getAttribute('data-filter-id');
      const pName = cb.getAttribute('data-preset-name');
      const filtersList = (filterBuilderInstance && Array.isArray(filterBuilderInstance.managedFilters))
        ? filterBuilderInstance.managedFilters
        : [];
      const targetFilter = filtersList.find(p => String(p.id) === String(fId));
      if (!targetFilter) return;

      const conds = Array.isArray(targetFilter.conditions) ? targetFilter.conditions : [];
      if (cb.checked) {
        activePresetName = pName;
        conds.forEach((c, idx) => {
          const catalogItem = typeof c === 'string'
            ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c)
            : (c.id ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c.id) : null);

          if (catalogItem) {
            activeCriteriaIds.add(catalogItem.id);
          } else {
            const inlineId = (c && c.id) ? String(c.id) : `custom_filter_${fId}_cond_${idx}`;
            const inlineObj = {
              id: inlineId,
              name: (c && c.name) ? c.name : `${c.field || 'Chỉ tiêu'} ${c.operator || '>='} ${c.displayValue || c.value}`,
              field: c.field,
              operator: c.operator || '>=',
              value: c.value,
              displayValue: c.displayValue || (c.value !== undefined ? String(c.value) : ''),
              timeScope: c.timeScope || 'latest',
              year: c.year || null,
              mode: c.mode || 'threshold',
              enabled: true
            };
            const existingIdx = customInlineCriteria.findIndex(x => x.id === inlineId);
            if (existingIdx >= 0) {
              customInlineCriteria[existingIdx] = inlineObj;
            } else {
              customInlineCriteria.push(inlineObj);
            }
            activeCriteriaIds.add(inlineId);
          }
        });
      } else {
        conds.forEach((c, idx) => {
          const catalogItem = typeof c === 'string'
            ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c)
            : (c.id ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c.id) : null);

          if (catalogItem) {
            activeCriteriaIds.delete(catalogItem.id);
          } else {
            const inlineId = (c && c.id) ? String(c.id) : `custom_filter_${fId}_cond_${idx}`;
            activeCriteriaIds.delete(inlineId);
            customInlineCriteria = customInlineCriteria.filter(x => x.id !== inlineId);
          }
        });
        if (activePresetName === pName) activePresetName = null;
      }

      // Sync individual criteria checkboxes in UI
      criteriaGroupsGrid.querySelectorAll('.cb-screener-criterion').forEach(critCb => {
        const cid = critCb.getAttribute('data-crit-id');
        critCb.checked = activeCriteriaIds.has(cid);
      });
      syncCriterionChipStyles();

      evaluateAndApplyScreener();
    });

    // 2. Delete Saved Filter Delegation
    presetsCheckboxGrid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-delete-saved-filter');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const fId = btn.getAttribute('data-id');
      const fName = btn.getAttribute('data-name');
      if (!confirm(`Bạn có chắc chắn muốn xóa bộ lọc "${fName}"?`)) return;

      // Optimistic visual feedback: fade card immediately
      const card = btn.closest('[data-filter-card-id]') || btn.closest('.group');
      if (card) {
        card.style.opacity = '0.3';
        card.style.pointerEvents = 'none';
      }

      try {
        // 1. Clear from active preset if this was active
        if (activePresetName === fName) activePresetName = null;

        // 2. Direct API call to delete from MySQL
        try {
          await fetch(`/api/v1/screener/filters/${encodeURIComponent(fId)}?name=${encodeURIComponent(fName)}`, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              ...auth.getAuthHeaders()
            }
          });
        } catch (netErr) {
          console.warn('[deleteFilter] Backend API warning:', netErr);
        }

        // 3. Sync with filterBuilderInstance if present
        if (filterBuilderInstance) {
          if (Array.isArray(filterBuilderInstance.managedFilters)) {
            filterBuilderInstance.managedFilters = filterBuilderInstance.managedFilters.filter(x => String(x.id) !== String(fId));
          }
          try {
            localStorage.setItem('mayhem_managed_filters', JSON.stringify(filterBuilderInstance.managedFilters || []));
          } catch (e) {}
          if (typeof filterBuilderInstance.fetchManagedFilters === 'function') {
            await filterBuilderInstance.fetchManagedFilters();
          }
        }

        // 4. Remove from local fallback
        try {
          const saved = localStorage.getItem('mayhem_managed_filters');
          if (saved) {
            const list = JSON.parse(saved).filter(x => String(x.id) !== String(fId));
            localStorage.setItem('mayhem_managed_filters', JSON.stringify(list));
          }
        } catch (e) {}

        renderPresetsGrid();
        evaluateAndApplyScreener();
        showToast(`Đã xóa bộ lọc "${fName}" thành công!`, 'success');
      } catch (err) {
        console.error('[deleteFilter] Error:', err);
        if (card) {
          card.style.opacity = '1';
          card.style.pointerEvents = '';
        }
        showToast(`Không thể xóa bộ lọc: ${err.message}`, 'error');
      }
    });
  }

  // Helper: Synchronize visual styles of condition chips and field cards
  const syncCriterionChipStyles = () => {
    criteriaGroupsGrid.querySelectorAll('.cb-screener-criterion').forEach(cb => {
      const isChecked = activeCriteriaIds.has(cb.getAttribute('data-crit-id'));
      cb.checked = isChecked;
      const label = cb.closest('.btn-condition-chip');
      if (label) {
        const dot = label.querySelector('.chip-dot');
        const scopeBadge = label.querySelector('.chip-scope');
        if (isChecked) {
          label.className = 'btn-condition-chip cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition select-none bg-indigo-600 text-white border-indigo-600 shadow-2xs active:scale-95';
          if (dot) dot.className = 'chip-dot w-1.5 h-1.5 rounded-full bg-white';
          if (scopeBadge) scopeBadge.className = 'chip-scope text-[9px] px-1 py-0.2 rounded font-semibold bg-indigo-500 text-indigo-100';
        } else {
          label.className = 'btn-condition-chip cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition select-none bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 active:scale-95';
          if (dot) dot.className = 'chip-dot w-1.5 h-1.5 rounded-full bg-slate-400';
          if (scopeBadge) scopeBadge.className = 'chip-scope text-[9px] px-1 py-0.2 rounded font-semibold bg-slate-200 text-slate-600';
        }
      }
    });

    // Update field cards active counters and subtle border styling
    criteriaGroupsGrid.querySelectorAll('.field-param-card').forEach(card => {
      const fieldCrits = card.querySelectorAll('.cb-screener-criterion');
      let activeCount = 0;
      fieldCrits.forEach(c => {
        if (activeCriteriaIds.has(c.getAttribute('data-crit-id'))) activeCount++;
      });
      const badge = card.querySelector('.field-active-badge');
      if (badge) {
        if (activeCount > 0) {
          badge.textContent = `${activeCount} đang chọn`;
          badge.className = 'field-active-badge text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200';
          card.classList.add('border-indigo-300', 'bg-indigo-50/20');
          card.classList.remove('border-slate-200');
        } else {
          badge.textContent = `${fieldCrits.length} ĐK`;
          badge.className = 'field-active-badge text-[10px] text-slate-400 font-mono';
          card.classList.remove('border-indigo-300', 'bg-indigo-50/20');
          card.classList.add('border-slate-200');
        }
      }
    });
  };

  // -------------------------------------------------------------
  // RENDER CRITERIA GROUPS GRID (GOM NHÓM THEO 15 THÔNG SỐ CẦN XÉT)
  // -------------------------------------------------------------
  const renderCriteriaGrid = () => {
    // 1. Lọc danh mục tiêu chí theo ngành hiện tại hoặc dùng chung (ALL)
    const industryCriteria = BENCHMARK_CRITERIA_CATALOG.filter(c =>
      c.industry === currentIndustry || c.industry === 'ALL'
    );

    // 2. Gom nhóm tiêu chí động theo trường category (Database-driven)
    const grouped = new Map();
    industryCriteria.forEach(crit => {
      const cat = (crit.category && crit.category.trim()) ? crit.category.trim() : 'Tiêu Chí Khác';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(crit);
    });

    // 3. Thứ tự ưu tiên hiển thị chuẩn hóa của các nhóm tiêu chí
    const canonicalOrder = [
      'Khả Năng Sinh Lời & NIM',
      'Hiệu Quả Vận Hành & Chi Phí (CIR)',
      'Chất Lượng Tài Sản & An Toàn Vốn',
      'Thanh Khoản, Nợ Vay & Dòng Tiền',
      'Cơ Cấu Vốn & An Toàn Nợ Vay BĐS',
      'Hàng Tồn Kho & Tiềm Năng Bán Hàng',
      'Hiệu Quả Sinh Lời & Định Giá',
      'Quy Mô Margin & Tăng Trưởng Hoạt Động',
      'Hiệu Quả Vận Hành & CIR CTCK',
      'Sinh Lời Vốn CSH & Định Giá',
      'Biên Lợi Nhuận Gộp & Hiệu Quả Chu Kỳ',
      'Quản Trị Tồn Kho & Dòng Tiền CFO',
      'Đòn Bẩy Tài Chính & Định Giá Thép'
    ];

    const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
      const idxA = canonicalOrder.indexOf(a);
      const idxB = canonicalOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    if (sortedCategories.length === 0) {
      criteriaGroupsGrid.innerHTML = `
        <div class="col-span-full p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50">
          Chưa có tiêu chí chuẩn hóa nào cho nhóm ngành này. Bạn có thể mở "Tùy Biến Bộ Lọc" để thêm tiêu chí mới.
        </div>
      `;
      return;
    }

    criteriaGroupsGrid.innerHTML = sortedCategories.map(cat => {
      const crits = grouped.get(cat) || [];
      const badgeClass = getCategoryBadgeClass(cat);

      // Gom nhóm theo Thông số tài chính (Field) - Giúp không bị trùng lặp tên thông số
      const fieldMap = new Map();
      crits.forEach(c => {
        const f = c.field || c.name;
        if (!fieldMap.has(f)) fieldMap.set(f, []);
        fieldMap.get(f).push(c);
      });

      return `
        <div class="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col gap-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
            <span class="text-xs font-bold text-slate-800">${escapeHtml(cat)}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${badgeClass}">${fieldMap.size} thông số • ${crits.length} ĐK</span>
          </div>

          <div class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            ${Array.from(fieldMap.entries()).map(([fieldName, fieldCrits]) => {
              let activeCountForField = 0;
              fieldCrits.forEach(c => {
                if (activeCriteriaIds.has(c.id)) activeCountForField++;
              });
              const isFieldActive = activeCountForField > 0;

              return `
                <div class="field-param-card p-2 rounded-xl bg-white border ${isFieldActive ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200'} hover:border-indigo-200 transition flex flex-col gap-1.5 shadow-2xs">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-xs text-slate-800 truncate" title="${escapeHtml(fieldName)}">
                      ${escapeHtml(fieldName)}
                    </span>
                    <span class="field-active-badge ${isFieldActive ? 'text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200' : 'text-[10px] text-slate-400 font-mono'}">
                      ${isFieldActive ? `${activeCountForField} đang chọn` : `${fieldCrits.length} ĐK`}
                    </span>
                  </div>

                  <!-- Conditions pills / chips -->
                  <div class="flex flex-wrap gap-1">
                    ${fieldCrits.map(c => {
                      const isChecked = activeCriteriaIds.has(c.id);
                      const is10y = c.timeScope === '10y_consecutive';
                      const scopeBadge = is10y ? '10N' : '1N';
                      let valDisplay = c.displayValue || c.operator || '';
                      if (c.mode === 'industry_avg_lower' && (!valDisplay || valDisplay === '-')) valDisplay = '< TB';
                      if (c.mode === 'industry_avg_higher' && (!valDisplay || valDisplay === '-')) valDisplay = '> TB';

                      return `
                        <label class="btn-condition-chip cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition select-none active:scale-95 ${
                          isChecked 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }" title="${escapeHtml(c.name)}">
                          <input type="checkbox" class="cb-screener-criterion hidden" data-crit-id="${escapeHtml(c.id)}" ${isChecked ? 'checked' : ''} />
                          <span class="chip-dot w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-white' : 'bg-slate-400'}"></span>
                          <span class="font-bold font-mono">${escapeHtml(valDisplay)}</span>
                          <span class="chip-scope text-[9px] px-1 py-0.2 rounded font-semibold ${
                            isChecked ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-200 text-slate-600'
                          }">${scopeBadge}</span>
                        </label>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Gắn sự kiện click checkbox tiêu chí
    criteriaGroupsGrid.querySelectorAll('.cb-screener-criterion').forEach(cb => {
      cb.addEventListener('change', () => {
        const critId = cb.getAttribute('data-crit-id');
        if (cb.checked) {
          activeCriteriaIds.add(critId);
        } else {
          activeCriteriaIds.delete(critId);
        }
        syncCriterionChipStyles();
        evaluateAndApplyScreener();
      });
    });
  };

  // -------------------------------------------------------------
  // RENDER ACTIVE CUSTOM CONDITIONS BAR
  // -------------------------------------------------------------
  const renderActiveConditionsBar = () => {
    const activeObjects = getActiveConditionObjects();
    if (activeObjects.length === 0) {
      activeConditionsChipsBar.classList.add('hidden');
      activeConditionsList.innerHTML = '';
      return;
    }

    activeConditionsChipsBar.classList.remove('hidden');
    lblActiveConditionsCount.textContent = `Đang lọc ${activeObjects.length} điều kiện tùy chọn:`;

    activeConditionsList.innerHTML = activeObjects.map(c => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-indigo-900 border border-indigo-200 shadow-2xs">
        <span class="font-semibold">${escapeHtml(c.field)}</span>
        <span class="font-mono text-indigo-600 font-bold">${escapeHtml(c.operator || '>')} ${escapeHtml(c.displayValue || c.value)}</span>
        <button type="button" class="btn-remove-active-cond ml-1 text-slate-400 hover:text-rose-600 rounded" data-cond-id="${escapeHtml(c.id)}" title="Xóa điều kiện này">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </span>
    `).join('');

    // Attach remove listeners
    activeConditionsList.querySelectorAll('.btn-remove-active-cond').forEach(btn => {
      btn.addEventListener('click', () => {
        const condId = btn.getAttribute('data-cond-id');
        activeCriteriaIds.delete(condId);
        customInlineCriteria = customInlineCriteria.filter(c => c.id !== condId);

        // Uncheck matching criterion checkbox if visible
        criteriaGroupsGrid.querySelectorAll(`.cb-screener-criterion[data-crit-id="${condId}"]`).forEach(cb => {
          cb.checked = false;
        });
        syncCriterionChipStyles();

        evaluateAndApplyScreener();
        showToast('Đã xóa điều kiện lọc.', 'info');
      });
    });
  };

  // -------------------------------------------------------------
  // INLINE FILTER CREATOR EVENT LISTENERS
  // -------------------------------------------------------------
  btnOpenInlineBuilder.addEventListener('click', () => {
    isInlineBuilderOpen = !isInlineBuilderOpen;
    inlineFilterBuilderContainer.classList.toggle('hidden', !isInlineBuilderOpen);
    if (isInlineBuilderOpen) {
      inlineCritVal.focus();
    }
  });

  btnCloseInlineBuilder.addEventListener('click', () => {
    isInlineBuilderOpen = false;
    inlineFilterBuilderContainer.classList.add('hidden');
  });

  btnAddInlineCriterion.addEventListener('click', () => {
    const field = inlineCritField.value;
    const op = inlineCritOp.value;
    const rawVal = inlineCritVal.value.trim();
    const scope = inlineCritScope.value;

    if (!field) {
      showToast('Vui lòng chọn chỉ tiêu tài chính.', 'error');
      return;
    }

    const isAvg = op.startsWith('industry_avg_');
    if (!isAvg && rawVal === '') {
      showToast('Vui lòng nhập ngưỡng giá trị số học.', 'error');
      inlineCritVal.focus();
      return;
    }

    const val = isAvg ? null : Number(rawVal);
    const displayVal = isAvg
      ? (op === 'industry_avg_higher' ? '> TB Ngành' : '< TB Ngành')
      : (val <= 1 && val >= -1 ? `${(val * 100).toFixed(1)}%` : String(val));

    const newId = `inline_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newCond = {
      id: newId,
      name: `${field} ${isAvg ? displayVal : op + ' ' + displayVal} (${scope === 'latest' ? 'Gần nhất' : '10 năm'})`,
      field,
      operator: isAvg ? (op === 'industry_avg_higher' ? '>' : '<') : op,
      mode: isAvg ? op : 'threshold',
      value: val,
      displayValue: displayVal,
      timeScope: scope,
      enabled: true
    };

    customInlineCriteria.push(newCond);
    activeCriteriaIds.add(newId);

    // Reset inline inputs
    inlineCritVal.value = '';
    isInlineBuilderOpen = false;
    inlineFilterBuilderContainer.classList.add('hidden');

    evaluateAndApplyScreener();
    showToast(`Đã thêm điều kiện lọc: "${newCond.name}"`, 'success');
  });

  btnClearAllCustomConditions.addEventListener('click', () => {
    activeCriteriaIds.clear();
    customInlineCriteria = [];
    activePresetName = null;

    criteriaGroupsGrid.querySelectorAll('.cb-screener-criterion').forEach(cb => { cb.checked = false; });
    container.querySelectorAll('.cb-screener-preset').forEach(cb => { cb.checked = false; });
    syncCriterionChipStyles();

    evaluateAndApplyScreener();
    showToast('Đã xóa toàn bộ điều kiện lọc tùy chọn.', 'info');
  });

  // -------------------------------------------------------------
  // PER-INDUSTRY PERSISTENCE (SAVE & RESTORE)
  // -------------------------------------------------------------
  const saveCurrentIndustryConfig = () => {
    const configToSave = {
      industry: currentIndustry,
      savedAt: new Date().toISOString(),
      startYear: selStartYear ? selStartYear.value : null,
      endYear: selEndYear ? selEndYear.value : null,
      loai: selLoai ? selLoai.value : 'ALL',
      selectedTickers: Array.from(selectedTickers),
      selectedFields: Array.from(selectedFields),
      activeCriteriaIds: Array.from(activeCriteriaIds),
      customInlineCriteria: customInlineCriteria
    };

    localStorage.setItem(getStorageKey(currentIndustry), JSON.stringify(configToSave));
    lblSavedStatusNotice.textContent = `(Đã lưu ${new Date().toLocaleTimeString('vi-VN')})`;
    showToast(`Đã lưu cấu hình bộ lọc riêng cho nhóm ngành "${config.name}" thành công!`, 'success');

    // Also sync to backend API if authenticated
    if (auth.isLoggedIn()) {
      fetch('/api/v1/screener/save-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify({
          name: `Bộ Lọc Ngành ${config.shortName}`,
          industry: currentIndustry,
          conditions: getActiveConditionObjects()
        })
      }).catch(() => { });
    }
  };

  btnSaveIndustry.addEventListener('click', saveCurrentIndustryConfig);

  btnResetIndustry.addEventListener('click', () => {
    localStorage.removeItem(getStorageKey(currentIndustry));
    selectedTickers = new Set(config.tickers);
    selectedFields = new Set(config.fields);
    activeCriteriaIds.clear();
    customInlineCriteria = [];
    activePresetName = null;

    if (selStartYear && availableYears.length) selStartYear.value = availableYears[0] || '2015';
    if (selEndYear && availableYears.length) selEndYear.value = availableYears[availableYears.length - 1] || '2025';
    selLoai.value = 'ALL';
    selBank.value = 'ALL';
    selField.value = 'ALL';
    inpSearch.value = '';
    chkFormula.checked = false;

    populateIndustryControls();
    evaluateAndApplyScreener();
    triggerChange();
    showToast(`Đã đặt lại bộ lọc ngành "${config.name}" về mặc định ban đầu.`, 'info');
  });

  // -------------------------------------------------------------
  // TRIGGER ON FILTER CHANGE
  // -------------------------------------------------------------
  const triggerChange = () => {
    let startY = selStartYear ? selStartYear.value : null;
    let endY = selEndYear ? selEndYear.value : null;
    if (startY && endY && Number(startY) > Number(endY)) {
      selEndYear.value = startY;
      endY = startY;
    }

    onFilterChange({
      industry: currentIndustry,
      startYear: startY,
      endYear: endY,
      loai: selLoai.value,
      bank: selBank.value,
      field: selField.value,
      search: inpSearch.value.trim(),
      showFormula: chkFormula.checked,
      selectedBanks: Array.from(selectedTickers),
      selectedFields: Array.from(selectedFields)
    });
  };

  // Standard inputs listeners
  if (selStartYear) selStartYear.addEventListener('change', triggerChange);
  if (selEndYear) selEndYear.addEventListener('change', triggerChange);
  selLoai.addEventListener('change', triggerChange);

  selBank.addEventListener('change', () => {
    if (selBank.value !== 'ALL') {
      selectedTickers.clear();
      selectedTickers.add(selBank.value);
      syncMultiSelectCheckboxes();
      badgeBankCount.textContent = `1/${config.tickers.length} mã`;
    } else {
      config.tickers.forEach(b => selectedTickers.add(b));
      syncMultiSelectCheckboxes();
      badgeBankCount.textContent = `${config.tickers.length}/${config.tickers.length} mã`;
    }
    triggerChange();
  });

  selField.addEventListener('change', () => {
    if (selField.value !== 'ALL') {
      selectedFields.clear();
      selectedFields.add(selField.value);
    } else {
      config.fields.forEach(f => selectedFields.add(f));
    }
    tabFieldsGrid.querySelectorAll('.cb-field').forEach(cb => {
      cb.checked = selectedFields.has(cb.value);
    });
    triggerChange();
  });

  inpSearch.addEventListener('input', debounce(triggerChange, 150));
  chkFormula.addEventListener('change', triggerChange);

  // Toggle Checkbox Panel
  if (btnToggleCheckbox) {
    btnToggleCheckbox.addEventListener('click', () => {
      isCheckboxPanelOpen = !isCheckboxPanelOpen;
      datalistPanel.classList.toggle('hidden', !isCheckboxPanelOpen);
    });
  }

  // Switch Tabs for Datalist
  tabBtnBanks.addEventListener('click', () => {
    activeTab = 'banks';
    tabBtnBanks.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white transition';
    tabBtnFields.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition';
    tabContentBanks.classList.remove('hidden');
    tabContentFields.classList.add('hidden');
    btnSelectTopGroup.classList.remove('hidden');
  });

  tabBtnFields.addEventListener('click', () => {
    activeTab = 'fields';
    tabBtnFields.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white transition';
    tabBtnBanks.className = 'px-3 py-1 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition';
    tabContentFields.classList.remove('hidden');
    tabContentBanks.classList.add('hidden');
    btnSelectTopGroup.classList.add('hidden');
  });

  btnSelectAll.addEventListener('click', () => {
    if (activeTab === 'banks') {
      config.tickers.forEach(b => selectedTickers.add(b));
      syncMultiSelectCheckboxes();
      badgeBankCount.textContent = `${config.tickers.length}/${config.tickers.length} mã`;
    } else {
      config.fields.forEach(f => selectedFields.add(f));
      tabFieldsGrid.querySelectorAll('.cb-field').forEach(cb => { cb.checked = true; });
    }
    triggerChange();
  });

  btnDeselectAll.addEventListener('click', () => {
    if (activeTab === 'banks') {
      selectedTickers.clear();
      syncMultiSelectCheckboxes();
      badgeBankCount.textContent = `0/${config.tickers.length} mã`;
    } else {
      selectedFields.clear();
      tabFieldsGrid.querySelectorAll('.cb-field').forEach(cb => { cb.checked = false; });
    }
    triggerChange();
  });

  btnSelectTopGroup.addEventListener('click', () => {
    const topTickers = config.quickTickers.slice(0, 4);
    selectedTickers.clear();
    topTickers.forEach(b => selectedTickers.add(b));
    syncMultiSelectCheckboxes();
    badgeBankCount.textContent = `${topTickers.length}/${config.tickers.length} mã`;
    triggerChange();
  });

  // Screener Top Buttons
  btnClearScreener.addEventListener('click', () => {
    activeCriteriaIds.clear();
    customInlineCriteria = [];
    activePresetName = null;

    criteriaGroupsGrid.querySelectorAll('.cb-screener-criterion').forEach(cb => { cb.checked = false; });
    container.querySelectorAll('.cb-screener-preset').forEach(cb => { cb.checked = false; });
    syncCriterionChipStyles();

    evaluateAndApplyScreener();
    showToast(`Đã xóa toàn bộ tiêu chí lọc, hiển thị lại toàn bộ ${config.tickers.length} mã.`, 'info');
  });

  btnToggleScreener.addEventListener('click', () => {
    isScreenerExpanded = !isScreenerExpanded;
    screenerBody.classList.toggle('hidden', !isScreenerExpanded);
    lblToggleText.textContent = isScreenerExpanded ? 'Thu gọn' : 'Mở rộng';
    iconToggleChevron.classList.toggle('rotate-180', isScreenerExpanded);
    localStorage.setItem('mayhem_screener_expanded', String(isScreenerExpanded));
  });

  // -------------------------------------------------------------
  // INITIALIZE / SET INDUSTRY CONTROLLER METHOD
  // -------------------------------------------------------------
  const setIndustry = (newIndustry) => {
    if (!INDUSTRY_CONFIGS[newIndustry]) {
      console.warn('Unknown industry:', newIndustry);
      return;
    }

    currentIndustry = newIndustry;
    config = INDUSTRY_CONFIGS[newIndustry];

    // Check if saved config exists for this industry
    const saved = loadSavedConfig(newIndustry);
    if (saved) {
      selectedTickers = new Set(saved.selectedTickers || config.tickers);
      selectedFields = new Set(saved.selectedFields || config.fields);
      activeCriteriaIds.clear();
      (saved.activeCriteriaIds || []).forEach(id => activeCriteriaIds.add(id));
      customInlineCriteria = saved.customInlineCriteria || [];

      if (selStartYear && saved.startYear) selStartYear.value = saved.startYear;
      if (selEndYear && saved.endYear) selEndYear.value = saved.endYear;
      if (selLoai && saved.loai) selLoai.value = saved.loai;
    } else {
      selectedTickers = new Set(config.tickers);
      selectedFields = new Set(config.fields);
      activeCriteriaIds.clear();
      customInlineCriteria = [];
    }

    populateIndustryControls();
    evaluateAndApplyScreener();
    triggerChange();
  };

  // Initial population
  const savedInit = loadSavedConfig(currentIndustry);
  if (savedInit) {
    selectedTickers = new Set(savedInit.selectedTickers || config.tickers);
    selectedFields = new Set(savedInit.selectedFields || config.fields);
    (savedInit.activeCriteriaIds || []).forEach(id => activeCriteriaIds.add(id));
    customInlineCriteria = savedInit.customInlineCriteria || [];
  }

  populateIndustryControls();
  evaluateAndApplyScreener();

  // If filterBuilderInstance exists, re-render presets after it finishes fetching
  if (filterBuilderInstance) {
    filterBuilderInstance.onManagedFiltersUpdated = () => {
      renderPresetsGrid();
      evaluateAndApplyScreener();
    };
    filterBuilderInstance.fetchManagedFilters().then(() => {
      renderPresetsGrid();
    }).catch(() => { });
  }

  // Lắng nghe sự kiện cập nhật danh mục tiêu chí (Thêm / Sửa / Reset từ Super Admin)
  onCriteriaUpdated(() => {
    renderCriteriaGrid();
    evaluateAndApplyScreener();
  });

  // Lắng nghe sự kiện cập nhật cấu hình ngành từ Database
  onIndustryConfigsUpdated(() => {
    config = INDUSTRY_CONFIGS[currentIndustry] || Object.values(INDUSTRY_CONFIGS)[0] || DEFAULT_BASELINE_INDUSTRY_CONFIGS.NGAN_HANG;
    if (config) {
      populateIndustryControls();
      evaluateAndApplyScreener();
    }
  });

  const updateYears = (newYears) => {
    if (!newYears || newYears.length === 0) return;
    availableYears = (newYears.length >= 5 ? newYears : FULL_SYSTEM_YEARS).map(y => String(y));
    if (selStartYear && selEndYear) {
      const curStart = selStartYear.value;
      const curEnd = selEndYear.value;
      selStartYear.innerHTML = availableYears.map((y, idx) => `
        <option value="${y}" ${y === curStart || (idx === 0 && !curStart) ? 'selected' : ''}>${y}</option>
      `).join('');
      selEndYear.innerHTML = availableYears.map((y, idx, arr) => `
        <option value="${y}" ${y === curEnd || (idx === arr.length - 1 && !curEnd) ? 'selected' : ''}>${y}</option>
      `).join('');
    }
  };

  // Return component controller API
  return {
    setIndustry,
    updateYears,
    renderPresetsGrid,
    getIndustry: () => currentIndustry,
    getFilterState: () => ({
      industry: currentIndustry,
      startYear: selStartYear ? selStartYear.value : null,
      endYear: selEndYear ? selEndYear.value : null,
      loai: selLoai.value,
      bank: selBank.value,
      field: selField.value,
      search: inpSearch.value.trim(),
      showFormula: chkFormula.checked,
      selectedBanks: Array.from(selectedTickers),
      selectedFields: Array.from(selectedFields),
      activeCriteria: getActiveConditionObjects()
    }),
    saveCurrentConfig: saveCurrentIndustryConfig
  };
}
