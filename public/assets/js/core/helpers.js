/**
 * assets/js/core/helpers.js
 * Utility helper functions: numeric parsing, export, notifications, SVG icons.
 * Strict Rule: ZERO EMOJI.
 */

export function toNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

/**
 * Escapes unsafe HTML characters to prevent XSS vulnerabilities (Security Mandate 3)
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showToast(message, duration = 3000) {
  const toast = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastMessageText');
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add('show');

  if (window._toastTimeout) {
    clearTimeout(window._toastTimeout);
  }
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

export function exportToCSV(filename, headers, rows) {
  const csvContent = [];
  csvContent.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  rows.forEach(row => {
    csvContent.push(row.map(val => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(','));
  });

  const blob = new Blob(['\uFEFF' + csvContent.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function debounce(fn, delay = 200) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Official dictionary of 29 Vietnamese commercial banks
 * Clear separation: Ticker (Mã) vs Full Legal Name (Tên đầy đủ) vs Short Name (Tên thương mại)
 */
export const VIETNAMESE_BANKS = {
  'ABB': { ticker: 'ABB', name: 'Ngân hàng TMCP An Bình', shortName: 'ABBank', exchange: 'UPCOM' },
  'ACB': { ticker: 'ACB', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', exchange: 'HOSE' },
  'BAB': { ticker: 'BAB', name: 'Ngân hàng TMCP Bắc Á', shortName: 'Bac A Bank', exchange: 'HNX' },
  'BID': { ticker: 'BID', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV', exchange: 'HOSE' },
  'BVB': { ticker: 'BVB', name: 'Ngân hàng TMCP Bản Việt', shortName: 'BVBank', exchange: 'UPCOM' },
  'CTG': { ticker: 'CTG', name: 'Ngân hàng TMCP Công Thương Việt Nam', shortName: 'VietinBank', exchange: 'HOSE' },
  'EIB': { ticker: 'EIB', name: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam', shortName: 'Eximbank', exchange: 'HOSE' },
  'HDB': { ticker: 'HDB', name: 'Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank', exchange: 'HOSE' },
  'KLB': { ticker: 'KLB', name: 'Ngân hàng TMCP Kiên Long', shortName: 'Kienlongbank', exchange: 'UPCOM' },
  'LPB': { ticker: 'LPB', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', shortName: 'LPBank', exchange: 'HOSE' },
  'MBB': { ticker: 'MBB', name: 'Ngân hàng TMCP Quân Đội', shortName: 'MBBank', exchange: 'HOSE' },
  'MSB': { ticker: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', shortName: 'MSB', exchange: 'HOSE' },
  'NAB': { ticker: 'NAB', name: 'Ngân hàng TMCP Nam Á', shortName: 'Nam A Bank', exchange: 'HOSE' },
  'NVB': { ticker: 'NVB', name: 'Ngân hàng TMCP Quốc Dân', shortName: 'NCB', exchange: 'HNX' },
  'OCB': { ticker: 'OCB', name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB', exchange: 'HOSE' },
  'PCB': { ticker: 'PCB', name: 'Ngân hàng TMCP Public Bank Việt Nam', shortName: 'PublicBank', exchange: 'OTC' },
  'PGB': { ticker: 'PGB', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển', shortName: 'PGBank', exchange: 'UPCOM' },
  'SCB': { ticker: 'SCB', name: 'Ngân hàng TMCP Sài Gòn', shortName: 'SCB', exchange: 'OTC' },
  'SGB': { ticker: 'SGB', name: 'Ngân hàng TMCP Sài Gòn Công Thương', shortName: 'Saigonbank', exchange: 'UPCOM' },
  'SHB': { ticker: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB', exchange: 'HOSE' },
  'SSB': { ticker: 'SSB', name: 'Ngân hàng TMCP Đông Nam Á', shortName: 'SeABank', exchange: 'HOSE' },
  'STB': { ticker: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', exchange: 'HOSE' },
  'TCB': { ticker: 'TCB', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', shortName: 'Techcombank', exchange: 'HOSE' },
  'TPB': { ticker: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', exchange: 'HOSE' },
  'VAB': { ticker: 'VAB', name: 'Ngân hàng TMCP Việt Á', shortName: 'VietABank', exchange: 'UPCOM' },
  'VBB': { ticker: 'VBB', name: 'Ngân hàng TMCP Việt Nam Thương Tín', shortName: 'VietBank', exchange: 'UPCOM' },
  'VCB': { ticker: 'VCB', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', shortName: 'Vietcombank', exchange: 'HOSE' },
  'VIB': { ticker: 'VIB', name: 'Ngân hàng TMCP Quốc Tế Việt Nam', shortName: 'VIB', exchange: 'HOSE' },
  'VPB': { ticker: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', exchange: 'HOSE' }
};

/**
 * Standard dictionary of leading Vietnamese companies across BĐS, Chứng Khoán, Thép
 */
export const VIETNAMESE_COMPANIES = {
  // Bất Động Sản
  'VHM': { ticker: 'VHM', name: 'CTCP Vinhomes', shortName: 'Vinhomes', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'NVL': { ticker: 'NVL', name: 'CTCP Tập đoàn Đầu tư Địa ốc No Va', shortName: 'Novaland', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'PDR': { ticker: 'PDR', name: 'CTCP Phát triển Bất động sản Phát Đạt', shortName: 'Phát Đạt', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'KDH': { ticker: 'KDH', name: 'CTCP Đầu tư và Kinh doanh Nhà Khang Điền', shortName: 'Khang Điền', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'DIG': { ticker: 'DIG', name: 'Tổng CTCP Đầu tư Phát triển Xây dựng', shortName: 'DIC Corp', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'DXG': { ticker: 'DXG', name: 'CTCP Tập đoàn Đất Xanh', shortName: 'Đất Xanh', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'NLG': { ticker: 'NLG', name: 'CTCP Đầu tư Nam Long', shortName: 'Nam Long', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'VRE': { ticker: 'VRE', name: 'CTCP Vincom Retail', shortName: 'Vincom Retail', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'CEO': { ticker: 'CEO', name: 'CTCP Tập đoàn C.E.O', shortName: 'CEO Group', exchange: 'HNX', industry: 'BAT_DONG_SAN' },
  'HDC': { ticker: 'HDC', name: 'CTCP Phát triển nhà Bà Rịa - Vũng Tàu', shortName: 'HODECO', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'KBC': { ticker: 'KBC', name: 'Tổng Công ty Phát triển Đô thị Kinh Bắc', shortName: 'Kinh Bắc', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'SZC': { ticker: 'SZC', name: 'CTCP Sonadezi Châu Đức', shortName: 'Sonadezi', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'BCM': { ticker: 'BCM', name: 'Tổng Công ty Đầu tư và Phát triển Công nghiệp', shortName: 'Becamex IDC', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'IDC': { ticker: 'IDC', name: 'Tổng Công ty IDICO - CTCP', shortName: 'IDICO', exchange: 'HNX', industry: 'BAT_DONG_SAN' },
  'AGG': { ticker: 'AGG', name: 'CTCP Đầu tư và Phát triển Bất động sản An Gia', shortName: 'An Gia', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'SCR': { ticker: 'SCR', name: 'CTCP Địa ốc Sài Gòn Thương Tín', shortName: 'TTC Land', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'TCH': { ticker: 'TCH', name: 'CTCP Đầu tư Dịch vụ Tài chính Hoàng Huy', shortName: 'Hoàng Huy', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'DXS': { ticker: 'DXS', name: 'CTCP Dịch vụ Bất động sản Đất Xanh', shortName: 'Dat Xanh Services', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'NTL': { ticker: 'NTL', name: 'CTCP Phát triển Đô thị Từ Liêm', shortName: 'Lideco', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },
  'IJC': { ticker: 'IJC', name: 'CTCP Phát triển Hạ tầng Kỹ thuật', shortName: 'Becamex IJC', exchange: 'HOSE', industry: 'BAT_DONG_SAN' },

  // Chứng Khoán
  'SSI': { ticker: 'SSI', name: 'CTCP Chứng khoán SSI', shortName: 'SSI', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'VND': { ticker: 'VND', name: 'CTCP Chứng khoán VNDIRECT', shortName: 'VNDIRECT', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'VCI': { ticker: 'VCI', name: 'CTCP Chứng khoán Vietcap', shortName: 'Vietcap', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'HCM': { ticker: 'HCM', name: 'CTCP Chứng khoán TP.Hồ Chí Minh', shortName: 'HSC', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'SHS': { ticker: 'SHS', name: 'CTCP Chứng khoán Sài Gòn - Hà Nội', shortName: 'SHS', exchange: 'HNX', industry: 'CHUNG_KHOAN' },
  'MBS': { ticker: 'MBS', name: 'CTCP Chứng khoán MB', shortName: 'MBS', exchange: 'HNX', industry: 'CHUNG_KHOAN' },
  'FTS': { ticker: 'FTS', name: 'CTCP Chứng khoán FPT', shortName: 'FPTS', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'BSI': { ticker: 'BSI', name: 'CTCP Chứng khoán BIDV', shortName: 'BSC', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'CTS': { ticker: 'CTS', name: 'CTCP Chứng khoán Ngân hàng TMCP Công Thương Việt Nam', shortName: 'VietinBank Securities', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'AGR': { ticker: 'AGR', name: 'CTCP Chứng khoán Agribank', shortName: 'Agriseco', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'VDS': { ticker: 'VDS', name: 'CTCP Chứng khoán Rồng Việt', shortName: 'VDSC', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'ORS': { ticker: 'ORS', name: 'CTCP Chứng khoán Tiên Phong', shortName: 'TPS', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'TVS': { ticker: 'TVS', name: 'CTCP Chứng khoán Thiên Việt', shortName: 'TVS', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'EVS': { ticker: 'EVS', name: 'CTCP Chứng khoán Everest', shortName: 'EVS', exchange: 'HNX', industry: 'CHUNG_KHOAN' },
  'APG': { ticker: 'APG', name: 'CTCP Chứng khoán APG', shortName: 'APG', exchange: 'HOSE', industry: 'CHUNG_KHOAN' },
  'WSS': { ticker: 'WSS', name: 'CTCP Chứng khoán Phố Wall', shortName: 'WSS', exchange: 'HNX', industry: 'CHUNG_KHOAN' },
  'IVS': { ticker: 'IVS', name: 'CTCP Chứng khoán Guotai Junan (Việt Nam)', shortName: 'IVS', exchange: 'HNX', industry: 'CHUNG_KHOAN' },
  'PSI': { ticker: 'PSI', name: 'CTCP Chứng khoán Dầu khí', shortName: 'PSI', exchange: 'HNX', industry: 'CHUNG_KHOAN' },
  'BMS': { ticker: 'BMS', name: 'CTCP Chứng khoán Bảo Minh', shortName: 'BMS', exchange: 'UPCOM', industry: 'CHUNG_KHOAN' },
  'SBS': { ticker: 'SBS', name: 'CTCP Chứng khoán SBS', shortName: 'SBS', exchange: 'UPCOM', industry: 'CHUNG_KHOAN' },

  // Thép & Vật Liệu Xây Dựng
  'HPG': { ticker: 'HPG', name: 'CTCP Tập đoàn Hòa Phát', shortName: 'Hòa Phát', exchange: 'HOSE', industry: 'THEP' },
  'NKG': { ticker: 'NKG', name: 'CTCP Thép Nam Kim', shortName: 'Thép Nam Kim', exchange: 'HOSE', industry: 'THEP' },
  'HSG': { ticker: 'HSG', name: 'CTCP Tập đoàn Hoa Sen', shortName: 'Hoa Sen', exchange: 'HOSE', industry: 'THEP' },
  'VGS': { ticker: 'VGS', name: 'CTCP Ống thép Việt Đức VG PIPE', shortName: 'Việt Đức', exchange: 'HNX', industry: 'THEP' },
  'TLH': { ticker: 'TLH', name: 'CTCP Tập đoàn Thép Tiến Lên', shortName: 'Tiến Lên', exchange: 'HOSE', industry: 'THEP' },
  'POM': { ticker: 'POM', name: 'CTCP Thép Pomina', shortName: 'Pomina', exchange: 'UPCOM', industry: 'THEP' },
  'SMC': { ticker: 'SMC', name: 'CTCP Đầu tư Thương mại SMC', shortName: 'SMC', exchange: 'HOSE', industry: 'THEP' },
  'TVN': { ticker: 'TVN', name: 'Tổng Công ty Thép Việt Nam - CTCP', shortName: 'VNSTEEL', exchange: 'UPCOM', industry: 'THEP' },
  'VIS': { ticker: 'VIS', name: 'CTCP Thép Việt Ý', shortName: 'Việt Ý', exchange: 'HOSE', industry: 'THEP' },
  'DTL': { ticker: 'DTL', name: 'CTCP Đại Thiên Lộc', shortName: 'Đại Thiên Lộc', exchange: 'HOSE', industry: 'THEP' }
};

export function getCompanyFullName(ticker) {
  return VIETNAMESE_BANKS[ticker]?.name || VIETNAMESE_COMPANIES[ticker]?.name || `Doanh nghiệp ${ticker}`;
}
export const getBankFullName = getCompanyFullName;

export function getCompanyTradeName(ticker) {
  return VIETNAMESE_BANKS[ticker]?.shortName || VIETNAMESE_COMPANIES[ticker]?.shortName || ticker;
}
export const getBankTradeName = getCompanyTradeName;

export function getCompanyDisplayName(ticker) {
  const item = VIETNAMESE_BANKS[ticker] || VIETNAMESE_COMPANIES[ticker];
  if (item) {
    return `${item.ticker} - ${item.name} (${item.shortName})`;
  }
  return ticker;
}
export const getBankDisplayName = getCompanyDisplayName;

/**
 * Standard Clean SVG Icons (Replacing any Unicode/Emoji symbols)
 */
export const ICONS = {
  SEARCH: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>`,
  DOWNLOAD: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>`,
  CHART: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>`,
  TABLE: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
  FILE: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
  FORMULA: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
  RESET: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
  CHECK: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  INFO: `<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  STATUS_DOT: `<span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>`,
  STATUS_DOT_LOADING: `<span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>`,
  STATUS_DOT_ERROR: `<span class="inline-block w-2 h-2 rounded-full bg-rose-500"></span>`
};
