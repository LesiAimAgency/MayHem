/**
 * assets/js/components/audit-history-modal.js
 * Data Versioning & Audit History Modal with Rollback capabilities.
 * Rule: Zero emoji. Clean SVGs only.
 */

import { dataVersioning } from '../core/data-versioning.js';
import { formatNumber } from '../core/formatter.js';
import { showToast } from '../core/helpers.js';
import { auth } from '../core/auth.js';

export function renderAuditHistoryModal(container, options = {}) {
  const {
    onRollback = () => {},
    onResetBaseline = () => {},
    onOpenEdit = () => {},
    onClose = () => {}
  } = options;

  let logEntries = dataVersioning.getAuditLog();

  const renderContent = () => {
    container.innerHTML = `
      <div id="auditModalBackdrop" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 bg-slate-950/80">
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-base font-bold text-slate-100">Lịch Sử Phiên Bản & Kiểm Toán Dữ Liệu (Audit Log)</h2>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-semibold">${logEntries.length} thao tác</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">Quyền Phục Hồi: Super Admin & Editor</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Lưu vết mọi thao tác chỉnh sửa số liệu kiểm toán. Super Admin có quyền xem và phục hồi (rollback) về giá trị gốc nếu có sai sót.</p>
            </div>

            <div class="flex items-center gap-2">
              <button id="btnOpenEditFromAudit" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>Chỉnh Sửa Số Liệu Mới</span>
              </button>
              <button id="btnCloseAuditModal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm">
                Đóng
              </button>
            </div>
          </div>

          <!-- Table of Edit Records -->
          <div class="p-6 overflow-y-auto flex-1">
            ${logEntries.length === 0 ? `
              <div class="p-12 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-3">
                <svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>Chưa có thao tác chỉnh sửa số liệu kiểm toán nào. Bạn có thể bấm nút <strong>"Chỉnh Sửa Số Liệu Mới"</strong> ở góc phải để thực hiện điều chỉnh.</span>
              </div>
            ` : `
              <div class="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-800/80 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                    <tr>
                      <th class="py-3 px-3.5">Thời gian</th>
                      <th class="py-3 px-3">Tài khoản</th>
                      <th class="py-3 px-3">Mã NH</th>
                      <th class="py-3 px-3">Chỉ tiêu</th>
                      <th class="py-3 px-2">Năm</th>
                      <th class="py-3 px-3 text-right">Giá trị trước</th>
                      <th class="py-3 px-3 text-right">Giá trị điều chỉnh</th>
                      <th class="py-3 px-3">Ghi chú</th>
                      <th class="py-3 px-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800 text-slate-300 font-mono">
                    ${logEntries.map((e, idx) => {
                      const isRollbackAction = (e.action === 'ROLLBACK' || e.userRole === 'Rollback' || String(e.id).startsWith('rollback_'));
                      const canRevert = (e.oldValue !== null && e.oldValue !== undefined && !isRollbackAction);

                      return `
                        <tr class="hover:bg-slate-800/40 ${idx === 0 ? 'bg-blue-950/20' : ''}">
                          <td class="py-2.5 px-3.5 text-slate-400 font-sans text-[11px] whitespace-nowrap">${e.formattedTime || e.timestamp}</td>
                          <td class="py-2.5 px-3 whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] ${isRollbackAction ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}">${e.userRole || 'Auditor'}</span>
                          </td>
                          <td class="py-2.5 px-3 font-bold text-blue-400">${e.bank}</td>
                          <td class="py-2.5 px-3 font-sans text-slate-200 max-w-[200px] truncate" title="${e.field}">${e.field}</td>
                          <td class="py-2.5 px-2 font-bold text-slate-200">${e.year}</td>
                          <td class="py-2.5 px-3 text-right text-rose-400 font-bold">${e.oldValue !== null && e.oldValue !== undefined ? formatNumber(e.oldValue) : '--'}</td>
                          <td class="py-2.5 px-3 text-right text-emerald-400 font-bold">${e.newValue !== null && e.newValue !== undefined ? formatNumber(e.newValue) : '--'}</td>
                          <td class="py-2.5 px-3 font-sans text-slate-400 text-[11px] max-w-[150px] truncate" title="${e.note || ''}">${e.note || '-'}</td>
                          <td class="py-2.5 px-3 text-center whitespace-nowrap">
                            ${canRevert ? `
                              <button type="button" class="btn-rollback-item px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-sans text-[11px] font-bold transition shadow-2xs cursor-pointer flex items-center gap-1 mx-auto" data-entry-id="${e.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                                <span>Phục hồi</span>
                              </button>
                            ` : `
                              <span class="text-[10px] text-slate-600 font-sans">Đã lưu vết</span>
                            `}
                          </td>
                        </tr>
                      `;
                    }).join('')}
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

    // Bind listeners
    const backdrop = container.querySelector('#auditModalBackdrop');
    const btnClose = container.querySelector('#btnCloseAuditModal');
    const btnConfirmClose = container.querySelector('#btnConfirmCloseAudit');
    const btnReset = container.querySelector('#btnRestoreBaseline');
    const btnOpenEdit = container.querySelector('#btnOpenEditFromAudit');

    const closeHandler = () => {
      container.innerHTML = '';
      onClose();
    };

    btnClose?.addEventListener('click', closeHandler);
    btnConfirmClose?.addEventListener('click', closeHandler);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) closeHandler();
    });

    btnOpenEdit?.addEventListener('click', () => {
      closeHandler();
      onOpenEdit();
    });

    btnReset?.addEventListener('click', () => {
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
          if (confirm(`Xác nhận phục hồi số liệu:\nChỉ tiêu: [${entry.field}]\nNgân hàng: [${entry.bank}] (Năm ${entry.year})\nGiá trị hiện tại: ${entry.newValue}\n=> Phục hồi về giá trị cũ: ${entry.oldValue}?`)) {
            onRollback(entry);
            // Refresh log entries list in place
            logEntries = dataVersioning.getAuditLog();
            renderContent();
          }
        }
      });
    });
  };

  renderContent();

  // Background fetch remote audit logs from backend and update view if new entries found
  dataVersioning.fetchRemoteAuditLogs().then(updatedLogs => {
    if (updatedLogs && updatedLogs.length > logEntries.length) {
      logEntries = updatedLogs;
      renderContent();
    }
  }).catch(() => {});
}
