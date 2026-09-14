/**
 * assets/js/components/single-company-report.js
 * Single Company Financial Factsheet & Executive Report View.
 * Rule: Zero mock data. 100% real data. Zero emoji.
 */

import { formatValue, formatNumber, formatPercent } from '../core/formatter.js';
import { exportToCSV, showToast, ICONS, getBankDisplayName, getBankFullName, getBankTradeName } from '../core/helpers.js';
import { auth } from '../core/auth.js';

export function renderSingleCompanyReport(container, options = {}) {
  const {
    banks = [],
    years = [],
    allRecords = [],
    fieldMetaMap = {},
    selectedBank = 'VCB',
    onSelectBank = () => {},
    onBackToMain = () => {}
  } = options;

  const currentBank = banks.includes(selectedBank) ? selectedBank : (banks[0] || 'VCB');
  const bankRecords = allRecords.filter(r => r.bank === currentBank);
  const latestYear = years[years.length - 1] || '2025';

  const getVal = (fieldName, year = latestYear) => {
    const rec = bankRecords.find(r => r.field === fieldName);
    return rec && rec.values ? rec.values[year] : null;
  };

  const toi = getVal('Tổng thu nhập hoạt động (TOI)');
  const pbt = getVal('Tổng lợi nhuận trước thuế (PBT)');
  const npat = getVal('Lợi nhuận sau thuế của cổ đông công ty mẹ');
  const roe = getVal('Tỷ suất sinh lời trên Vốn CSH (ROE)');
  const roa = getVal('Tỷ suất sinh lời trên Tổng Tài Sản (ROA)');
  const nim = getVal('Biên lãi thuần (NIM)');
  const npl = getVal('Tỷ lệ nợ xấu (NPL) cuối năm');
  const car = getVal('Hệ số an toàn vốn (CAR)');
  const assets = getVal('Tổng tài sản');
  const toiGrowth = getVal('Tăng trưởng TOI');
  const npatGrowth = getVal('Tăng trưởng lãi ròng sau CĐ thiểu số');

  container.innerHTML = `
    <div class="flex flex-col gap-5 w-full">
      
      <!-- Factsheet Control Bar -->
      <div class="flex items-center justify-between flex-wrap gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div class="flex items-center gap-3">
          <button id="btnBackFromSingle" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Về Bảng Tổng Hợp</span>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-400">Chọn Ngân Hàng:</span>
            <select id="selSingleBank" class="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono font-bold rounded-lg px-3 py-1.5 outline-none focus:border-blue-500">
              ${banks.map(b => `<option value="${b}" ${b === currentBank ? 'selected' : ''}>${getBankDisplayName(b)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="btnExportSingleExcel" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium ${auth.canExport() ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'} transition shadow-sm">
            ${ICONS.DOWNLOAD}
            <span>Tải Báo Cáo Excel (${currentBank})</span>
          </button>
        </div>
      </div>

      <!-- Bank Profile Header Card -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-md flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-mono font-extrabold text-2xl text-blue-400 shadow-inner">
            ${currentBank}
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h2 class="text-xl font-bold text-white tracking-tight">${currentBank} - ${getBankFullName(currentBank)}</h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">BCTC Kiểm Toán</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Tên thương mại: <span class="text-blue-400 font-semibold">${getBankTradeName(currentBank)}</span> | Chuỗi số liệu tài chính liên tục ${years[0]} - ${years[years.length - 1]}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 font-mono text-right">
          <div>
            <span class="block text-[11px] text-slate-500 uppercase">Tổng Tài Sản (${latestYear})</span>
            <span class="text-base font-bold text-slate-100">${formatValue(assets, { type: 'number' })} Tr.đ</span>
          </div>
        </div>
      </div>

      <!-- Core KPI Cards Row -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[11px] font-medium text-slate-400">TOI (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-blue-400 mt-1">${formatValue(toi, { type: 'number' })}</div>
          <span class="text-[11px] text-slate-500">Tăng trưởng: ${formatValue(toiGrowth, { type: 'percent' })}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[11px] font-medium text-slate-400">LNST CĐ Mẹ (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-emerald-400 mt-1">${formatValue(npat, { type: 'number' })}</div>
          <span class="text-[11px] text-slate-500">Tăng trưởng: ${formatValue(npatGrowth, { type: 'percent' })}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[11px] font-medium text-slate-400">ROE (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-purple-400 mt-1">${formatValue(roe, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">ROA: ${formatValue(roa, { type: 'percent' })}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[11px] font-medium text-slate-400">Biên NIM (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-cyan-400 mt-1">${formatValue(nim, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">Biên lãi thuần</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[11px] font-medium text-slate-400">Tỷ lệ Nợ Xấu NPL</span>
          <div class="text-lg font-bold font-mono text-amber-400 mt-1">${formatValue(npl, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">Cuối năm ${latestYear}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[11px] font-medium text-slate-400">An Toàn Vốn CAR</span>
          <div class="text-lg font-bold font-mono text-indigo-400 mt-1">${formatValue(car, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">Chuẩn Basel II</span>
        </div>
      </div>

      <!-- Single Bank Time-Series Table -->
      <div class="financial-table-wrapper rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
        <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Chuỗi Chỉ Tiêu Tài Chính Toàn Diện Của ${currentBank} (${bankRecords.length} chỉ tiêu)</h3>
          <span class="text-xs text-slate-400">30 Chỉ tiêu gốc + 16 Chỉ tiêu đối chiếu</span>
        </div>

        <table class="financial-table">
          <thead>
            <tr>
              <th class="col-sticky-loai">Loại</th>
              <th class="col-sticky-field" style="left: var(--w-col-loai);">Chỉ tiêu tài chính</th>
              <th class="col-sticky-formula">Công thức / Diễn giải</th>
              ${years.map(y => `<th>${y}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${bankRecords.map(item => {
              const meta = fieldMetaMap[item.field] || { type: 'number' };
              const rowClass = item.is_calc ? 'row-tinh' : 'row-fill';
              const loaiBadge = item.is_calc
                ? `<span class="badge-loai-tinh">Tính</span>`
                : `<span class="badge-loai-fill">Fill</span>`;

              return `
                <tr class="${rowClass}">
                  <td class="col-sticky-loai">${loaiBadge}</td>
                  <td class="col-sticky-field" style="left: var(--w-col-loai);">${item.field}</td>
                  <td class="col-sticky-formula" title="${item.formula_desc || ''}">${item.formula_code || '-'}</td>
                  ${years.map(y => {
                    const val = item.values ? item.values[y] : null;
                    return `<td>${formatValue(val, meta)}</td>`;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

    </div>
  `;

  // Attach handlers
  const selBank = container.querySelector('#selSingleBank');
  const btnBack = container.querySelector('#btnBackFromSingle');
  const btnExport = container.querySelector('#btnExportSingleExcel');

  selBank.addEventListener('change', () => {
    onSelectBank(selBank.value);
  });

  btnBack.addEventListener('click', onBackToMain);

  btnExport.addEventListener('click', () => {
    if (!auth.canExport()) {
      showToast('Tài khoản của bạn (Cấp 3) không có quyền tải file dữ liệu.');
      return;
    }

    const headers = ['Loại', 'Mã NH', 'Chỉ tiêu', 'Công thức', ...years];
    const rows = bankRecords.map(r => [
      r.loai,
      r.bank,
      r.field,
      r.formula_code || '',
      ...years.map(y => r.values ? (r.values[y] !== null ? r.values[y] : '') : '')
    ]);

    const filename = `BaoCao_TaiChinh_${currentBank}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(filename, headers, rows);
    showToast(`Đã xuất thành công báo cáo của ${currentBank}!`);
  });
}
