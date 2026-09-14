/**
 * assets/js/components/calculation-table.js
 * Renders the 16 Financial Formula Reference Drawer/Modal.
 * Rule: Zero emoji.
 */

import { CALC_METRICS_META, CALC_FIELDS_LIST } from '../calculations/financial-calculations.js';

export function renderCalculationModal(container, onClose = () => {}) {
  const keys = CALC_FIELDS_LIST;

  container.innerHTML = `
    <div id="formulaModalBackdrop" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div>
            <h2 class="text-base font-bold text-slate-800">Bảng Đối Chiếu 16 Chỉ Tiêu Tính Toán Chuyên Sâu</h2>
            <p class="text-xs text-slate-500 mt-0.5">Quy chuẩn công thức và phương pháp tính toán độc lập bằng JavaScript</p>
          </div>
          <button id="btnCloseFormulaModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition text-sm">
            ✕ Đóng
          </button>
        </div>

        <!-- Body Table -->
        <div class="p-6 overflow-y-auto">
          <div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 text-slate-600 uppercase text-[11px] tracking-wider font-bold">
                <tr>
                  <th class="py-3 px-4 border-b border-slate-200">STT</th>
                  <th class="py-3 px-4 border-b border-slate-200">Tên chỉ tiêu</th>
                  <th class="py-3 px-4 border-b border-slate-200">Đơn vị</th>
                  <th class="py-3 px-4 border-b border-slate-200">Mã công thức</th>
                  <th class="py-3 px-4 border-b border-slate-200">Diễn giải phương pháp tính</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-slate-700">
                ${keys.map((k, idx) => {
                  const m = CALC_METRICS_META[k];
                  return `
                    <tr class="hover:bg-blue-50/40 transition">
                      <td class="py-2.5 px-4 font-mono text-slate-500">${idx + 1}</td>
                      <td class="py-2.5 px-4 font-bold text-purple-700">${k}</td>
                      <td class="py-2.5 px-4 text-slate-500">${m.unit}</td>
                      <td class="py-2.5 px-4 font-mono text-blue-700 font-semibold">${m.formula_code}</td>
                      <td class="py-2.5 px-4 text-slate-600 leading-relaxed">${m.formula_desc}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống bảo toàn giá trị gốc, xử lý an toàn mẫu số 0 và giá trị rỗng.</span>
          <button id="btnConfirmCloseFormulaModal" class="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium text-xs transition shadow-2xs">
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  `;

  const btnClose = container.querySelector('#btnCloseFormulaModal');
  const btnConfirm = container.querySelector('#btnConfirmCloseFormulaModal');
  const backdrop = container.querySelector('#formulaModalBackdrop');

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose.addEventListener('click', closeHandler);
  btnConfirm.addEventListener('click', closeHandler);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });
}
