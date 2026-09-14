/**
 * assets/js/components/audit-history-modal.js
 * Data Versioning & Audit History Modal with Rollback capabilities.
 * Rule: Zero emoji. Clean SVGs only.
 */

import { dataVersioning } from '../core/data-versioning.js';
import { formatNumber } from '../core/formatter.js';
import { showToast } from '../core/helpers.js';

export function renderAuditHistoryModal(container, options = {}) {
  const {
    onRollback = () => {},
    onResetBaseline = () => {},
    onClose = () => {}
  } = options;

  const logEntries = dataVersioning.getAuditLog();

  container.innerHTML = `
    <div id="auditModalBackdrop" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <div class="flex items-center gap-2.5">
              <h2 class="text-base font-bold text-slate-100">Lịch Sử Phiên Bản & Kiểm Toán Dữ Liệu (Audit Log)</h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">${logEntries.length} thao tác</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Lưu vết mọi thay đổi số liệu, bảo vệ phòng hờ nhập sai hoặc cố tình phá hoại</p>
          </div>
          <button id="btnCloseAuditModal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm">
            Đóng
          </button>
        </div>

        <!-- Table of Edit Records -->
        <div class="p-6 overflow-y-auto flex-1">
          ${logEntries.length === 0 ? `
            <div class="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Chưa có thao tác chỉnh sửa dữ liệu nào được ghi nhận. Dữ liệu hiện đang ở trạng thái gốc ban đầu.
            </div>
          ` : `
            <div class="border border-slate-800 rounded-xl overflow-hidden">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-800/80 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                  <tr>
                    <th class="py-3 px-3.5">Thời gian</th>
                    <th class="py-3 px-3">Tài khoản</th>
                    <th class="py-3 px-3">Mã NH</th>
                    <th class="py-3 px-3">Chỉ tiêu</th>
                    <th class="py-3 px-2">Năm</th>
                    <th class="py-3 px-3 text-right">Giá trị cũ</th>
                    <th class="py-3 px-3 text-right">Giá trị mới</th>
                    <th class="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800 text-slate-300 font-mono">
                  ${logEntries.map(e => `
                    <tr class="hover:bg-slate-800/40">
                      <td class="py-2.5 px-3.5 text-slate-400 font-sans text-[11px]">${e.formattedTime}</td>
                      <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">${e.userRole}</span></td>
                      <td class="py-2.5 px-3 font-bold text-blue-400">${e.bank}</td>
                      <td class="py-2.5 px-3 font-sans text-slate-300">${e.field}</td>
                      <td class="py-2.5 px-2 font-bold text-slate-200">${e.year}</td>
                      <td class="py-2.5 px-3 text-right text-rose-400">${formatNumber(e.oldValue)}</td>
                      <td class="py-2.5 px-3 text-right text-emerald-400">${formatNumber(e.newValue)}</td>
                      <td class="py-2.5 px-3 text-center">
                        <button type="button" class="btn-rollback-item px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/40 font-sans text-[11px] transition" data-entry-id="${e.id}">
                          Hoàn tác
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-3">
          <button id="btnRestoreBaseline" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Khôi phục dữ liệu gốc ban đầu</span>
          </button>

          <button id="btnConfirmCloseAudit" type="button" class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
            Đóng
          </button>
        </div>

      </div>
    </div>
  `;

  const backdrop = container.querySelector('#auditModalBackdrop');
  const btnClose = container.querySelector('#btnCloseAuditModal');
  const btnConfirmClose = container.querySelector('#btnConfirmCloseAudit');
  const btnReset = container.querySelector('#btnRestoreBaseline');

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose.addEventListener('click', closeHandler);
  btnConfirmClose.addEventListener('click', closeHandler);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });

  btnReset.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn hủy bỏ mọi chỉnh sửa và đưa toàn bộ cơ sở dữ liệu về lại file gốc?')) {
      onResetBaseline();
      closeHandler();
    }
  });

  container.querySelectorAll('.btn-rollback-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-entry-id');
      const entry = logEntries.find(x => x.id === id);
      if (entry) {
        if (confirm(`Bạn có muốn hoàn tác chỉ tiêu [${entry.field}] năm ${entry.year} của ngân hàng [${entry.bank}] về giá trị cũ: ${entry.oldValue}?`)) {
          onRollback(entry);
          closeHandler();
        }
      }
    });
  });
}
