/**
 * assets/js/components/annual-update-modal.js
 * Workflow dialog for Annual Data Update:
 * - Adding a new reporting year (e.g. 2026)
 * - Adjusting/Auditing prior year figures (e.g. 2025 post-audit changes)
 * Rule: Zero emoji. Clean SVGs only.
 */

import { auth } from '../core/auth.js';
import { showToast, getBankTradeName } from '../core/helpers.js';
import { CALC_FIELDS_LIST } from '../calculations/financial-calculations.js';

export function renderAnnualUpdateModal(container, options = {}) {
  const {
    banks = [],
    years = [],
    rawFields = [],
    onAddNewYear = () => {},
    onUpdateMetricValue = () => {}
  } = options;

  const latestYear = Number(years[years.length - 1]) || 2025;
  const nextYearCandidate = latestYear + 1;
  const priorYearCandidate = latestYear;

  container.innerHTML = `
    <div id="annualUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm hidden animate-fade-in">
      <div class="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-6 text-slate-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white tracking-tight">Cập Nhật Số Liệu Định Kỳ BCTC</h3>
              <p class="text-xs text-slate-400 mt-0.5">Quy trình mở rộng niên độ mới hoặc hiệu chỉnh số liệu sau kiểm toán</p>
            </div>
          </div>
          <button id="btnCloseAnnualModal" type="button" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="flex flex-col gap-6 max-h-[75vh] overflow-y-auto pr-1">
          
          <!-- Section 1: Add New Year (Level 1 Admin Only) -->
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Bước 1: Mở rộng thêm niên độ mới (Năm ${nextYearCandidate})</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Super Admin Only</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Khởi tạo cột năm tài chính mới cho toàn bộ 29 ngân hàng với giá trị ban đầu (0) để bắt đầu nhập liệu BCTC mới.</p>
            </div>

            <div class="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-700/50">
              <div class="text-xs font-mono text-slate-300">
                Năm chuẩn bị khởi tạo: <span class="text-blue-400 font-bold">${nextYearCandidate}</span> (Sau năm ${latestYear})
              </div>
              <button id="btnInitNewYear" type="button" class="px-4 py-2 rounded-lg text-xs font-semibold ${auth.canAddYear() ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' : 'bg-slate-700 text-slate-500 cursor-not-allowed'} transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Mở Rộng Thêm Năm ${nextYearCandidate}</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Update Prior Year Figure (Admin & Editor) -->
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col gap-4">
            <div>
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bước 2: Cập nhật & Điều chỉnh số liệu sau kiểm toán (Ví dụ: Năm ${priorYearCandidate})</span>
              <p class="text-xs text-slate-400 mt-0.5">Số liệu năm trước thường có thay đổi sau khi phát hành BCTC kiểm toán chính thức. Chọn ngân hàng và chỉ tiêu để cập nhật số mới.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Mã Ngân Hàng:</label>
                <select id="selAuditBank" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono">
                  ${banks.map(b => `<option value="${b}">${b} - ${getBankTradeName(b)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Năm cần điều chỉnh:</label>
                <select id="selAuditYear" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono">
                  ${years.map(y => `<option value="${y}" ${y === priorYearCandidate ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Chỉ tiêu:</label>
                <select id="selAuditField" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2">
                  ${rawFields.map(f => `<option value="${f.name}">${f.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end mt-1">
              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Giá trị số liệu kiểm toán mới:</label>
                <input type="text" id="inpAuditNewValue" placeholder="VD: 75500 hoặc 12.5" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-mono" />
              </div>

              <button id="btnSaveAuditValue" type="button" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">
                Ghi Nhận & Tính Lại Dữ Liệu
              </button>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button id="btnConfirmCloseAnnual" type="button" class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
            Hoàn Tất
          </button>
        </div>

      </div>
    </div>
  `;

  const backdrop = container.querySelector('#annualModalBackdrop');
  const btnClose = container.querySelector('#btnCloseAnnualModal');
  const btnConfirmClose = container.querySelector('#btnConfirmCloseAnnual');
  const btnAddYear = container.querySelector('#btnConfirmAddYear');
  const inpYear = container.querySelector('#inpNewYearValue');

  const selBank = container.querySelector('#selAuditBank');
  const selYear = container.querySelector('#selAuditYear');
  const selField = container.querySelector('#selAuditField');
  const inpVal = container.querySelector('#inpAuditNewValue');
  const btnSaveVal = container.querySelector('#btnSaveAuditValue');

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose.addEventListener('click', closeHandler);
  btnConfirmClose.addEventListener('click', closeHandler);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });

  btnAddYear.addEventListener('click', () => {
    const yStr = String(inpYear.value).trim();
    if (!yStr || isNaN(Number(yStr))) {
      alert('Năm không hợp lệ!');
      return;
    }
    if (years.includes(yStr)) {
      alert(`Năm ${yStr} đã tồn tại trong hệ thống!`);
      return;
    }
    onAddNewYear(yStr);
    closeHandler();
    showToast(`Đã thêm thành công năm ${yStr} vào báo cáo!`);
  });

  btnSaveVal.addEventListener('click', () => {
    const rawVal = inpVal.value.trim();
    if (!rawVal || isNaN(Number(rawVal))) {
      alert('Vui lòng nhập giá trị số hợp lệ!');
      return;
    }

    onUpdateValue({
      bank: selBank.value,
      year: selYear.value,
      field: selField.value,
      newValue: Number(rawVal),
      note: 'Cập nhật số liệu sau kiểm toán'
    });

    inpVal.value = '';
    showToast(`Đã ghi nhận điều chỉnh số liệu kiểm toán cho ${selBank.value}!`);
  });
}
