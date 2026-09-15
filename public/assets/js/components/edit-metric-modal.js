/**
 * assets/js/components/edit-metric-modal.js
 * Dedicated Modal for Editing Financial Figures:
 * Allows user to select Bank, Financial Indicator, Year, view current value, and save new value.
 * Features: Clean Light Mode, Zero dev jargon, Zero emoji.
 */

import { auth } from '../core/auth.js';
import { showToast, getBankDisplayName, getBankTradeName } from '../core/helpers.js';
import { formatValue } from '../core/formatter.js';

export function renderEditMetricModal(container, options = {}) {
  const {
    banks = [],
    years = [],
    allRecords = [],
    fieldMetaMap = {},
    initialBank = 'VCB',
    initialField = '',
    initialYear = '',
    onSave = async () => {},
    onOpenAuditLog = () => {},
    onClose = () => {}
  } = options;

  const currentBank = banks.includes(initialBank) ? initialBank : (banks[0] || 'VCB');
  const currentYear = years.includes(initialYear) ? initialYear : (years[years.length - 1] || '2025');

  // Extract all unique fields
  const fieldNames = Object.keys(fieldMetaMap);
  const rawFieldNames = fieldNames.filter(f => !fieldMetaMap[f]?.is_calc);
  const calcFieldNames = fieldNames.filter(f => fieldMetaMap[f]?.is_calc);

  const selectedField = (initialField && fieldNames.includes(initialField))
    ? initialField
    : (rawFieldNames[0] || fieldNames[0] || 'Tổng tài sản');

  // Helper to get system value
  const getSystemValue = (bankCode, yr, fName) => {
    const rec = allRecords.find(r => r.bank === bankCode && r.field === fName);
    if (rec && rec.values && rec.values[yr] !== undefined && rec.values[yr] !== null) {
      return rec.values[yr];
    }
    return null;
  };

  container.innerHTML = `
    <div id="editMetricBackdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div class="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 flex flex-col gap-5 text-slate-800">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Chỉnh Sửa Số Liệu Tài Chính</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">Hiệu Chỉnh BCTC</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Chọn ngân hàng, chỉ tiêu và năm tài chính để điều chỉnh số liệu và ghi nhận lịch sử kiểm toán</p>
            </div>
          </div>
          <button id="btnCloseEditModal" type="button" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
          
          <!-- Selectors: Bank, Indicator, Year -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Bank Selector -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Ngân Hàng:</label>
              <select id="editSelBank" class="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-2 outline-none focus:border-blue-600 focus:bg-white transition cursor-pointer">
                ${banks.map(b => `<option value="${b}" ${b === currentBank ? 'selected' : ''}>${getBankDisplayName(b)}</option>`).join('')}
              </select>
            </div>

            <!-- Indicator Selector -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1">Chỉ Tiêu Tài Chính:</label>
              <select id="editSelField" class="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-blue-600 focus:bg-white transition cursor-pointer">
                <optgroup label="Chỉ tiêu nhập gốc (Fill)">
                  ${rawFieldNames.map(f => `<option value="${f}" ${f === selectedField ? 'selected' : ''}>${f}</option>`).join('')}
                </optgroup>
                <optgroup label="Chỉ tiêu tính toán (Công thức fx)">
                  ${calcFieldNames.map(f => `<option value="${f}" ${f === selectedField ? 'selected' : ''}>${f} (fx)</option>`).join('')}
                </optgroup>
              </select>
            </div>
          </div>

          <!-- Quick Year Selector Bar (Horizontal pills showing figures of all years for this indicator) -->
          <div class="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center justify-between text-xs text-slate-600">
              <span class="font-semibold flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Chọn Năm Cần Chỉnh Sửa:
              </span>
              <span class="text-[11px] text-slate-500">Bấm trực tiếp vào năm để chuyển đổi nhanh</span>
            </div>
            
            <div id="editYearPillsContainer" class="flex items-center gap-1.5 overflow-x-auto py-1">
              <!-- Dynamically populated year chips -->
            </div>
          </div>

          <!-- Current Value vs New Value Display Card -->
          <div class="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col gap-3">
            <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span class="text-slate-600 font-medium">Giá trị hiện tại trong hệ thống:</span>
              <span id="lblEditCurrentVal" class="font-mono font-bold text-blue-700 text-sm px-2.5 py-0.5 bg-white border border-blue-200 rounded-md shadow-2xs">--</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-2 border-t border-blue-100">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">
                  Giá trị mới cần cập nhật:
                  <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <input type="text" id="inpEditNewValue" placeholder="Nhập giá trị mới (VD: 85200 hoặc 15.5)" class="w-full bg-white border border-slate-300 text-slate-900 text-xs font-mono font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs" />
                  <button id="btnCopyCurrentVal" type="button" class="absolute right-1.5 top-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition" title="Sao chép giá trị hiện tại để chỉnh sửa">
                    Lấy số cũ
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Ghi chú điều chỉnh:</label>
                <input type="text" id="inpEditNote" placeholder="VD: Điều chỉnh sau kiểm toán, số liệu cập nhật" value="Hiệu chỉnh số liệu BCTC" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600 shadow-2xs" />
              </div>
            </div>
          </div>

          <!-- Formula / Meta Note -->
          <div id="boxEditFieldMeta" class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span id="lblEditFieldDesc">Loại chỉ tiêu: Số liệu nhập gốc</span>
            <span id="lblEditFieldUnit" class="font-mono text-slate-500 font-semibold">Tỷ VNĐ</span>
          </div>

        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <button id="btnEditViewAuditLog" type="button" class="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Mở Lịch Sử Kiểm Toán</span>
          </button>

          <div class="flex items-center gap-2">
            <button id="btnCancelEditModal" type="button" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition">
              Đóng
            </button>
            <button id="btnSaveEditValue" type="button" class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  // DOM Elements
  const backdrop = container.querySelector('#editMetricBackdrop');
  const btnClose = container.querySelector('#btnCloseEditModal');
  const btnCancel = container.querySelector('#btnCancelEditModal');
  const btnViewAudit = container.querySelector('#btnEditViewAuditLog');
  const btnSave = container.querySelector('#btnSaveEditValue');
  const btnCopyCurrent = container.querySelector('#btnCopyCurrentVal');

  const selBank = container.querySelector('#editSelBank');
  const selField = container.querySelector('#editSelField');
  const pillsContainer = container.querySelector('#editYearPillsContainer');
  const lblCurrentVal = container.querySelector('#lblEditCurrentVal');
  const inpNewVal = container.querySelector('#inpEditNewValue');
  const inpNote = container.querySelector('#inpEditNote');
  const lblDesc = container.querySelector('#lblEditFieldDesc');
  const lblUnit = container.querySelector('#lblEditFieldUnit');

  let activeYear = currentYear;

  // Refresh Year Pills & Current Value
  const refreshUI = () => {
    const b = selBank.value;
    const f = selField.value;
    const meta = fieldMetaMap[f] || { type: 'number', is_calc: false };

    // Update meta box
    if (meta.is_calc) {
      lblDesc.innerHTML = `<span class="font-semibold text-blue-700">Chỉ tiêu tính toán (fx):</span> ${meta.formula_desc || meta.formula_code || 'Tự động tính từ các chỉ tiêu thành phần'}`;
    } else {
      lblDesc.innerHTML = `<span class="font-semibold text-slate-700">Chỉ tiêu nhập gốc:</span> Số liệu trích xuất từ Báo cáo tài chính`;
    }
    lblUnit.textContent = meta.type === 'percent' ? 'Đơn vị: %' : 'Đơn vị: Tỷ VNĐ';

    // Render Year Pills
    pillsContainer.innerHTML = years.map(y => {
      const isSel = (y === activeYear);
      const val = getSystemValue(b, y, f);
      const formattedShort = val !== null && val !== undefined ? formatValue(val, meta) : '-';
      return `
        <button type="button" 
          class="year-chip px-3 py-1.5 rounded-lg text-xs font-mono transition flex flex-col items-center flex-shrink-0 cursor-pointer ${
            isSel 
              ? 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-300' 
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }" 
          data-year="${y}">
          <span class="text-[10px] ${isSel ? 'text-blue-100' : 'text-slate-500'}">${y}</span>
          <span class="text-xs font-bold ${isSel ? 'text-white' : 'text-slate-900'}">${formattedShort}</span>
        </button>
      `;
    }).join('');

    // Attach pill click
    pillsContainer.querySelectorAll('.year-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeYear = btn.getAttribute('data-year');
        refreshUI();
      });
    });

    // Update current value label
    const curVal = getSystemValue(b, activeYear, f);
    if (curVal !== null && curVal !== undefined) {
      lblCurrentVal.textContent = `${formatValue(curVal, meta)} (${meta.type === 'percent' ? '%' : 'Tỷ VNĐ'})`;
      lblCurrentVal.setAttribute('data-raw', curVal);
    } else {
      lblCurrentVal.textContent = 'Chưa có số liệu (Trống)';
      lblCurrentVal.setAttribute('data-raw', '');
    }
  };

  // Listeners
  selBank?.addEventListener('change', refreshUI);
  selField?.addEventListener('change', refreshUI);

  btnCopyCurrent?.addEventListener('click', () => {
    const raw = lblCurrentVal.getAttribute('data-raw');
    if (raw !== '') {
      inpNewVal.value = raw;
      inpNewVal.focus();
    }
  });

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose?.addEventListener('click', closeHandler);
  btnCancel?.addEventListener('click', closeHandler);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });

  btnViewAudit?.addEventListener('click', () => {
    closeHandler();
    onOpenAuditLog();
  });

  btnSave?.addEventListener('click', async () => {
    const raw = inpNewVal.value.trim().replace(/,/g, '');
    if (!raw || isNaN(Number(raw))) {
      alert('Vui lòng nhập giá trị số hợp lệ!');
      inpNewVal.focus();
      return;
    }

    const valNumber = Number(raw);
    const note = inpNote.value.trim() || 'Hiệu chỉnh số liệu BCTC';

    btnSave.disabled = true;
    btnSave.textContent = 'Đang lưu...';

    try {
      await onSave({
        bank: selBank.value,
        field: selField.value,
        year: activeYear,
        newValue: valNumber,
        note
      });

      closeHandler();
    } catch (err) {
      alert('Lỗi lưu số liệu: ' + err.message);
      btnSave.disabled = false;
      btnSave.textContent = 'Lưu Thay Đổi';
    }
  });

  // Initial render
  refreshUI();
}
