/**
 * assets/js/components/company-comparison.js
 * Multi-Company Comparative Analysis Report & Chart View.
 * Rule: Zero mock data. 100% real data. Zero emoji.
 */

import { formatValue } from '../core/formatter.js';
import { exportToCSV, showToast, ICONS, getBankFullName, getBankTradeName } from '../core/helpers.js';
import { auth } from '../core/auth.js';
import { CALC_FIELDS_LIST } from '../calculations/financial-calculations.js';

let compChartInstance = null;

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48'
];

export function renderCompanyComparison(container, options = {}) {
  const {
    banks = [],
    years = [],
    allRecords = [],
    fieldMetaMap = {},
    rawFields = [],
    selectedBanks = ['VCB', 'BID', 'CTG', 'TCB'],
    selectedField = 'Tăng trưởng TOI',
    onBackToMain = () => {}
  } = options;

  let currentBanks = [...selectedBanks];
  let currentField = selectedField;
  const allFields = [...CALC_FIELDS_LIST, ...rawFields.map(f => f.name)];

  function renderInner() {
    const meta = fieldMetaMap[currentField] || { type: 'number' };

    container.innerHTML = `
      <div class="flex flex-col gap-5 w-full">
        
        <!-- Controls Bar -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3 flex-wrap">
            <button id="btnBackFromComp" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              <span>Về Bảng Tổng Hợp</span>
            </button>

            <!-- Field Selector -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-400">Chọn Chỉ Tiêu So Sánh:</span>
              <select id="selCompField" class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 max-w-xs">
                ${allFields.map(f => `<option value="${f}" ${f === currentField ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button id="btnExportCompExcel" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium ${auth.canExport() ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'} transition shadow-sm">
              ${ICONS.DOWNLOAD}
              <span>Tải Báo Cáo So Sánh (Excel)</span>
            </button>
          </div>
        </div>

        <!-- Bank Checkbox Selection Bar -->
        <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Chọn các ngân hàng so sánh (${currentBanks.length}/${banks.length}):
            </span>
            <div class="flex items-center gap-2 text-xs">
              <button id="btnCompSelectBig4" type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition">
                Top Big 4 (VCB, BID, CTG, MBB)
              </button>
              <button id="btnCompSelectTMCP" type="button" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition">
                Top TMCP (TCB, VPB, ACB)
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            ${banks.map(b => `
              <label class="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono cursor-pointer hover:bg-slate-800 transition select-none" title="${getBankFullName(b)} (${getBankTradeName(b)})">
                <input type="checkbox" class="cb-comp-bank rounded bg-slate-800 border-slate-700 text-blue-600 h-3.5 w-3.5" value="${b}" ${currentBanks.includes(b) ? 'checked' : ''} />
                <span class="${currentBanks.includes(b) ? 'text-blue-400 font-bold' : 'text-slate-400'}">${b}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Comparative Chart Section -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Biểu Đồ So Sánh: ${currentField} Qua Các Năm</h3>
            <span class="text-[11px] text-slate-400 font-mono">${currentBanks.join(', ')}</span>
          </div>
          <div class="chart-container-inner" style="height: 340px;">
            <canvas id="compChartCanvas"></canvas>
          </div>
        </div>

        <!-- Comparative Table -->
        <div class="financial-table-wrapper rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
          <div class="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Bảng Đối Chiếu Ngang: ${currentField}</h3>
            <span class="text-xs text-slate-400 font-mono">Đơn vị: ${meta.unit || ''}</span>
          </div>

          <table class="financial-table">
            <thead>
              <tr>
                <th class="col-sticky-bank" style="left: 0;">Mã NH</th>
                ${years.map(y => `<th>${y}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${currentBanks.map(b => {
                const rec = allRecords.find(r => r.bank === b && r.field === currentField);
                return `
                  <tr class="row-fill">
                    <td class="col-sticky-bank" style="left: 0;"><span class="badge-bank-code">${b}</span></td>
                    ${years.map(y => {
                      const val = rec && rec.values ? rec.values[y] : null;
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

    attachEvents();
    renderChart();
  }

  function renderChart() {
    const canvas = container.querySelector('#compChartCanvas');
    if (!canvas || typeof Chart === 'undefined') return;

    if (compChartInstance) {
      compChartInstance.destroy();
    }

    const datasets = currentBanks.map((b, i) => {
      const rec = allRecords.find(r => r.bank === b && r.field === currentField);
      const color = PALETTE[i % PALETTE.length];
      return {
        label: b,
        data: years.map(y => rec && rec.values ? rec.values[y] : null),
        borderColor: color,
        backgroundColor: color,
        tension: 0.3,
        pointRadius: 3.5,
        borderWidth: 2
      };
    });

    compChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: years,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#cbd5e1', font: { family: 'Inter', size: 11 } } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  function attachEvents() {
    const btnBack = container.querySelector('#btnBackFromComp');
    const selField = container.querySelector('#selCompField');
    const btnExport = container.querySelector('#btnExportCompExcel');
    const btnBig4 = container.querySelector('#btnCompSelectBig4');
    const btnTMCP = container.querySelector('#btnCompSelectTMCP');

    btnBack.addEventListener('click', onBackToMain);

    selField.addEventListener('change', () => {
      currentField = selField.value;
      renderInner();
    });

    container.querySelectorAll('.cb-comp-bank').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          if (!currentBanks.includes(cb.value)) currentBanks.push(cb.value);
        } else {
          currentBanks = currentBanks.filter(x => x !== cb.value);
        }
        renderInner();
      });
    });

    btnBig4.addEventListener('click', () => {
      currentBanks = ['VCB', 'BID', 'CTG', 'MBB'];
      renderInner();
    });

    btnTMCP.addEventListener('click', () => {
      currentBanks = ['TCB', 'VPB', 'ACB', 'HDB', 'VIB'];
      renderInner();
    });

    btnExport.addEventListener('click', () => {
      if (!auth.canExport()) {
        showToast('Tài khoản của bạn (Cấp 3) không có quyền tải file dữ liệu.');
        return;
      }

      const headers = ['Mã NH', 'Chỉ tiêu', ...years];
      const rows = currentBanks.map(b => {
        const rec = allRecords.find(r => r.bank === b && r.field === currentField);
        return [
          b,
          currentField,
          ...years.map(y => rec && rec.values ? (rec.values[y] !== null ? rec.values[y] : '') : '')
        ];
      });

      const filename = `SoSanh_${currentField}_${currentBanks.join('_')}_${new Date().toISOString().slice(0, 10)}.csv`;
      exportToCSV(filename, headers, rows);
      showToast('Đã xuất thành công file Excel so sánh!');
    });
  }

  renderInner();
}
