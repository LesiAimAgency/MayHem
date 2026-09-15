/**
 * assets/js/components/single-company-report.js
 * Single Company Financial Factsheet & Executive Report View.
 * Rule: Zero mock data. 100% real data. Zero emoji. 100% Clean Light Mode.
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
    isLoading = false,
    onSelectBank = () => {},
    onBackToMain = () => {},
    onOpenEditMetric = () => {}
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
    <div class="flex flex-col gap-5 w-full ${isLoading ? 'opacity-75 transition-opacity' : 'transition-opacity'}">
      
      <!-- Factsheet Control Bar -->
      <div class="flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3 flex-wrap">
            <button id="btnBackFromSingle" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Về Bảng Tổng Hợp</span>
            </button>

            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-600">Chọn Ngân Hàng:</span>
              <select id="selSingleBank" class="bg-white border border-slate-300 text-slate-800 text-xs font-mono font-bold rounded-lg px-3 py-1.5 outline-none focus:border-blue-600 shadow-2xs cursor-pointer">
                ${banks.map(b => `<option value="${b}" ${b === currentBank ? 'selected="selected"' : ''}>${getBankDisplayName(b)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Edit Metric Button for this bank -->
            <button id="btnEditSingleBankMetric" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-2xs cursor-pointer" title="Chỉnh sửa số liệu báo cáo tài chính của ${currentBank}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Chỉnh Sửa Số Liệu</span>
            </button>

            <button id="btnExportSingleExcel" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold ${auth.canExport() ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'} transition">
              ${ICONS.DOWNLOAD}
              <span>Tải Báo Cáo Excel (${currentBank})</span>
            </button>
          </div>
        </div>

        <!-- Interactive Quick Bank Selection Chips -->
        <div class="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-slate-100">
          <span class="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Bấm chọn ngân hàng:
          </span>
          ${banks.map(b => {
            const isSel = (b === currentBank);
            return `
              <button type="button" 
                class="single-bank-chip px-2.5 py-1 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                  isSel 
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }" 
                data-bank="${b}"
                ${isSel ? 'aria-pressed="true"' : 'aria-pressed="false"'}>
                ${b}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Bank Profile Header Card -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50/50 border border-blue-200 shadow-2xs flex items-center justify-between flex-wrap gap-4 text-slate-800">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-white border border-blue-200 flex items-center justify-center font-mono font-extrabold text-2xl text-blue-700 shadow-xs">
            ${currentBank}
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h2 class="text-xl font-bold text-slate-900 tracking-tight">${currentBank} - ${getBankFullName(currentBank)}</h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">BCTC Kiểm Toán</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Tên thương mại: <span class="text-blue-700 font-bold">${getBankTradeName(currentBank)}</span> | Chuỗi số liệu tài chính liên tục ${years[0]} - ${years[years.length - 1]}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 font-mono text-right">
          <div>
            <span class="block text-[11px] text-slate-500 uppercase font-semibold">Tổng Tài Sản (${latestYear})</span>
            <span class="text-lg font-extrabold text-slate-900">${formatValue(assets, { type: 'number' })} Tr.đ</span>
          </div>
        </div>
      </div>

      <!-- Core KPI Cards Row -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition">
          <span class="text-[11px] font-semibold text-slate-500">TOI (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-blue-700 mt-1">${formatValue(toi, { type: 'number' })}</div>
          <span class="text-[11px] text-slate-500">Tăng trưởng: ${formatValue(toiGrowth, { type: 'percent' })}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
          <span class="text-[11px] font-semibold text-slate-500">LNST CĐ Mẹ (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-emerald-700 mt-1">${formatValue(npat, { type: 'number' })}</div>
          <span class="text-[11px] text-slate-500">Tăng trưởng: ${formatValue(npatGrowth, { type: 'percent' })}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-purple-300 transition">
          <span class="text-[11px] font-semibold text-slate-500">ROE (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-purple-700 mt-1">${formatValue(roe, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">ROA: ${formatValue(roa, { type: 'percent' })}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-cyan-300 transition">
          <span class="text-[11px] font-semibold text-slate-500">Biên NIM (${latestYear})</span>
          <div class="text-lg font-bold font-mono text-cyan-700 mt-1">${formatValue(nim, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">Biên lãi thuần</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-amber-300 transition">
          <span class="text-[11px] font-semibold text-slate-500">Tỷ lệ Nợ Xấu NPL</span>
          <div class="text-lg font-bold font-mono text-amber-700 mt-1">${formatValue(npl, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">Cuối năm ${latestYear}</span>
        </div>

        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-300 transition">
          <span class="text-[11px] font-semibold text-slate-500">An Toàn Vốn CAR</span>
          <div class="text-lg font-bold font-mono text-indigo-700 mt-1">${formatValue(car, { type: 'percent' })}</div>
          <span class="text-[11px] text-slate-500">Chuẩn Basel II</span>
        </div>
      </div>

      <!-- Single Bank Time-Series Table -->
      <div class="financial-table-wrapper rounded-xl border border-slate-200 bg-white shadow-xs">
        <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Chuỗi Chỉ Tiêu Tài Chính Toàn Diện Của ${currentBank} (${bankRecords.length} chỉ tiêu)</h3>
          <span class="text-xs text-slate-500">Bấm biểu tượng bút chì để chỉnh sửa nhanh chỉ tiêu tương ứng</span>
        </div>

        <table class="financial-table">
          <thead>
            <tr>
              <th class="w-10 text-center">Sửa</th>
              <th class="col-sticky-loai">Loại</th>
              <th class="col-sticky-field" style="left: calc(var(--w-col-loai) + 40px);">Chỉ tiêu tài chính</th>
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
                  <td class="w-10 text-center">
                    <button type="button" class="btn-single-row-edit p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition cursor-pointer" data-field="${item.field}" title="Chỉnh sửa chỉ tiêu ${item.field}">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                  </td>
                  <td class="col-sticky-loai">${loaiBadge}</td>
                  <td class="col-sticky-field" style="left: calc(var(--w-col-loai) + 40px);">${item.field}</td>
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
  const btnEditSingle = container.querySelector('#btnEditSingleBankMetric');

  if (selBank) {
    selBank.addEventListener('change', () => {
      onSelectBank(selBank.value);
    });
  }

  // Bind quick bank chips click
  container.querySelectorAll('.single-bank-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const bCode = chip.getAttribute('data-bank');
      if (bCode) {
        if (selBank) selBank.value = bCode;
        onSelectBank(bCode);
      }
    });
  });

  if (btnBack) btnBack.addEventListener('click', onBackToMain);

  // Edit single bank metric button
  if (btnEditSingle) {
    btnEditSingle.addEventListener('click', () => {
      onOpenEditMetric({ bank: currentBank });
    });
  }

  // Row quick edit buttons
  container.querySelectorAll('.btn-single-row-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.getAttribute('data-field');
      onOpenEditMetric({ bank: currentBank, field: f });
    });
  });

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
