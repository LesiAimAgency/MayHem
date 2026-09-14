/**
 * assets/js/components/financial-table.js
 * Renders the multi-year financial matrix table with sticky columns and sorting (Light Mode).
 * Rule: Zero mock data. Presentation only. Zero emoji.
 */

import { formatValue } from '../core/formatter.js';

export function renderFinancialTable(container, options = {}) {
  const {
    records = [],
    years = [],
    fieldMetaMap = {},
    showFormula = false,
    sortYear = null,
    sortAsc = false,
    topBannerHtml = '',
    onSort = () => {}
  } = options;

  if (records.length === 0) {
    container.innerHTML = `
      ${topBannerHtml}
      <div class="financial-table-wrapper rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
        </div>
        <p class="text-sm font-bold text-slate-700">Không tìm thấy bản ghi nào khớp với tiêu chí lọc.</p>
        <p class="text-xs text-slate-500 mt-1">Không có ngân hàng hoặc chỉ tiêu nào thỏa mãn điều kiện hiện tại. Hãy nới lỏng hoặc điều chỉnh lại các điều kiện lọc tài chính.</p>
      </div>
    `;
    return;
  }

  let tableHtml = `
    ${topBannerHtml}
    <div class="financial-table-wrapper rounded-xl border border-slate-200 bg-white shadow-xs">
      <table class="financial-table">
        <thead>
          <tr>
            <th class="col-sticky-loai">Loại</th>
            <th class="col-sticky-bank">Mã NH</th>
            <th class="col-sticky-field">Chỉ tiêu tài chính</th>
            ${showFormula ? `<th class="col-sticky-formula">Công thức đối chiếu</th>` : ''}
            ${years.map(y => {
              const isSorted = sortYear === y;
              const sortIndicator = isSorted ? (sortAsc ? ' ↑' : ' ↓') : '';
              return `
                <th class="sortable" data-year="${y}" title="Bấm để sắp xếp theo năm ${y}">
                  ${y}${sortIndicator}
                </th>
              `;
            }).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  records.forEach(item => {
    const meta = fieldMetaMap[item.field] || { type: 'number', is_calc: false };
    const rowClass = item.is_calc ? 'row-tinh' : 'row-fill';

    const loaiBadge = item.is_calc
      ? `<span class="badge-loai-tinh">Tính</span>`
      : `<span class="badge-loai-fill">Fill</span>`;

    const fieldHtml = item.is_calc
      ? `<span>${item.field}</span> <span class="inline-block ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono text-blue-700 bg-blue-100 border border-blue-200 font-bold" title="${item.formula_desc || ''}">fx</span>`
      : `<span>${item.field}</span>`;

    tableHtml += `
      <tr class="${rowClass}">
        <td class="col-sticky-loai">${loaiBadge}</td>
        <td class="col-sticky-bank"><span class="badge-bank-code font-bold text-blue-700">${item.bank}</span></td>
        <td class="col-sticky-field" title="${item.field}">${fieldHtml}</td>
        ${showFormula ? `<td class="col-sticky-formula" title="${item.formula_desc || ''}">${item.formula_code || '-'}</td>` : ''}
        ${years.map(y => {
          const val = item.values ? item.values[y] : null;
          return `<td>${formatValue(val, meta)}</td>`;
        }).join('')}
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHtml;

  // Attach sort listeners
  container.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const y = th.getAttribute('data-year');
      onSort(y);
    });
  });
}
