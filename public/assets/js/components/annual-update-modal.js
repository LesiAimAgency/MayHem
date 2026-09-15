/**
 * assets/js/components/annual-update-modal.js
 * Workflow dialog for Annual Data Update:
 * - Adding a new reporting year (e.g. 2026)
 * - Adjusting/Auditing prior year figures (e.g. 2025 post-audit changes)
 * Rule: Zero emoji. Clean SVGs only.
 */

import { auth } from '../core/auth.js';
import { showToast, getBankTradeName } from '../core/helpers.js';
import { formatValue } from '../core/formatter.js';

export function renderAnnualUpdateModal(container, options = {}) {
  const {
    banks = [],
    years = [],
    rawFields = [],
    allRecords = [],
    onAddNewYear = () => {},
    onUpdateValue = () => {},
    onOpenAuditLog = () => {},
    onClose = () => {}
  } = options;

  const latestYear = Number(years[years.length - 1]) || 2025;
  const nextYearCandidate = latestYear + 1;
  const priorYearCandidate = String(latestYear);

  // Helper to get current value in system
  const getCurrentSystemValue = (bankCode, yr, fieldName) => {
    const rec = allRecords.find(r => r.bank === bankCode && r.field === fieldName);
    if (rec && rec.values && rec.values[yr] !== undefined && rec.values[yr] !== null) {
      return rec.values[yr];
    }
    return null;
  };

  container.innerHTML = `
    <div id="annualModalBackdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
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
                <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Bước 1: Mở rộng thêm niên độ mới</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">Super Admin Only</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Khởi tạo cột năm tài chính mới cho toàn bộ 29 ngân hàng để bắt đầu nhập liệu BCTC mới.</p>
            </div>

            <div class="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-700/50">
              <div class="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span>Năm khởi tạo:</span>
                <input type="number" id="inpNewYearValue" value="${nextYearCandidate}" class="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 w-24 outline-none focus:border-blue-500" />
              </div>
              <button id="btnConfirmAddYear" type="button" class="px-4 py-2 rounded-lg text-xs font-semibold ${auth.canAddYear() ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' : 'bg-slate-700 text-slate-500 cursor-not-allowed'} transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Mở Rộng Thêm Năm</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Update Prior Year Figure (Admin & Editor) -->
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bước 2: Cập nhật & Điều chỉnh số liệu sau kiểm toán</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Lưu vết Audit Log</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Số liệu thường có thay đổi sau khi phát hành BCTC kiểm toán chính thức. Mọi thao tác sửa đổi sẽ được ghi nhận vào Nhật Ký Kiểm Toán (Audit Log) để Super Admin có thể kiểm soát và phục hồi khi cần.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Mã Ngân Hàng:</label>
                <select id="selAuditBank" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono outline-none focus:border-blue-500">
                  ${banks.map(b => `<option value="${b}">${b} - ${getBankTradeName(b)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Năm cần điều chỉnh:</label>
                <select id="selAuditYear" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono outline-none focus:border-blue-500">
                  ${years.map(y => `<option value="${y}" ${String(y) === priorYearCandidate ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Chỉ tiêu tài chính:</label>
                <select id="selAuditField" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-blue-500">
                  ${rawFields.map(f => `<option value="${f.name}">${f.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Live Current Value Preview Box -->
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span class="text-slate-400">Giá trị hiện tại trong hệ thống:</span>
              <span id="lblCurrentAuditVal" class="font-mono font-bold text-blue-400 text-sm">--</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Giá trị kiểm toán mới:</label>
                <input type="text" id="inpAuditNewValue" placeholder="VD: 75500 hoặc 12.5" class="w-full bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 outline-none focus:border-emerald-500 font-mono" />
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Ghi chú kiểm toán:</label>
                <input type="text" id="inpAuditNote" placeholder="VD: Điều chỉnh sau kiểm toán KPMG" value="Điều chỉnh sau kiểm toán" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
              </div>
            </div>

            <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-800">
              <span class="text-[11px] text-slate-500">Sau khi lưu, hệ thống sẽ tự động mở trang Nhật Ký Kiểm Toán (Audit Log) để đối chiếu.</span>
              <button id="btnSaveAuditValue" type="button" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Ghi Nhận & Xem Nhật Ký Kiểm Toán</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-2">
          <button id="btnJumpToAuditLog" type="button" class="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>Mở trang Nhật Ký & Lịch Sử Kiểm Toán</span>
          </button>

          <button id="btnConfirmCloseAnnual" type="button" class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
            Đóng
          </button>
        </div>

      </div>
    </div>
  `;

  const backdrop = container.querySelector('#annualModalBackdrop');
  const btnClose = container.querySelector('#btnCloseAnnualModal');
  const btnConfirmClose = container.querySelector('#btnConfirmCloseAnnual');
  const btnJumpAudit = container.querySelector('#btnJumpToAuditLog');

  const btnAddYear = container.querySelector('#btnConfirmAddYear');
  const inpYear = container.querySelector('#inpNewYearValue');

  const selBank = container.querySelector('#selAuditBank');
  const selYear = container.querySelector('#selAuditYear');
  const selField = container.querySelector('#selAuditField');
  const inpVal = container.querySelector('#inpAuditNewValue');
  const inpNote = container.querySelector('#inpAuditNote');
  const btnSaveVal = container.querySelector('#btnSaveAuditValue');
  const lblCurrentVal = container.querySelector('#lblCurrentAuditVal');

  const updateCurrentValuePreview = () => {
    if (!lblCurrentVal || !selBank || !selYear || !selField) return;
    const curVal = getCurrentSystemValue(selBank.value, selYear.value, selField.value);
    if (curVal !== null && curVal !== undefined) {
      lblCurrentVal.textContent = formatValue(curVal, { type: 'number' });
    } else {
      lblCurrentVal.textContent = 'Chưa có số liệu (Trống)';
    }
  };

  // Initial preview
  updateCurrentValuePreview();

  // Listeners for preview changes
  selBank?.addEventListener('change', updateCurrentValuePreview);
  selYear?.addEventListener('change', updateCurrentValuePreview);
  selField?.addEventListener('change', updateCurrentValuePreview);

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose?.addEventListener('click', closeHandler);
  btnConfirmClose?.addEventListener('click', closeHandler);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });

  if (btnJumpAudit) {
    btnJumpAudit.addEventListener('click', () => {
      closeHandler();
      onOpenAuditLog();
    });
  }

  if (btnAddYear && inpYear) {
    btnAddYear.addEventListener('click', () => {
      const yStr = String(inpYear.value).trim();
      if (!yStr || isNaN(Number(yStr)) || Number(yStr) < 1900 || Number(yStr) > 2100) {
        alert('Năm không hợp lệ! Vui lòng nhập năm có 4 chữ số.');
        return;
      }
      if (years.includes(yStr)) {
        alert(`Năm ${yStr} đã tồn tại trong hệ thống!`);
        return;
      }
      onAddNewYear(yStr);
      closeHandler();
      showToast(`Đã thêm thành công năm ${yStr} vào báo cáo!`, 'success');
    });
  }

  if (btnSaveVal && inpVal) {
    btnSaveVal.addEventListener('click', async () => {
      const rawVal = inpVal.value.trim().replace(/,/g, '');
      if (!rawVal || isNaN(Number(rawVal))) {
        alert('Vui lòng nhập giá trị số hợp lệ!');
        return;
      }

      const note = inpNote ? inpNote.value.trim() : 'Cập nhật số liệu sau kiểm toán';

      btnSaveVal.disabled = true;
      btnSaveVal.textContent = 'Đang lưu...';

      try {
        await onUpdateValue({
          bank: selBank.value,
          year: selYear.value,
          field: selField.value,
          newValue: Number(rawVal),
          note
        });

        closeHandler();
        onOpenAuditLog();
      } catch (err) {
        alert('Lỗi lưu số liệu: ' + err.message);
        btnSaveVal.disabled = false;
        btnSaveVal.textContent = 'Ghi Nhận & Xem Nhật Ký Kiểm Toán';
      }
    });
  }
}
