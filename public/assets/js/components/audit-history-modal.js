/**
 * assets/js/components/audit-history-modal.js
 * Data Versioning & Audit History Modal with In-App Rollback Confirmation Modals.
 * Rule: Zero emoji. Clean SVGs only. 100% Clean Light Mode. NO native alert/confirm.
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
      <div id="auditModalBackdrop" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 relative">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-white">
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2 class="text-base font-bold text-slate-900">Lịch Sử Phiên Bản & Kiểm Toán Dữ Liệu (Audit Log)</h2>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">${logEntries.length} thao tác</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Quyền Phục Hồi: Quản Trị & Biên Tập</span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Lưu vết mọi thao tác chỉnh sửa số liệu kiểm toán. Quản trị viên có quyền xem và phục hồi (rollback) về giá trị gốc nếu có sai sót.</p>
            </div>

            <div class="flex items-center gap-2">
              <button id="btnOpenEditFromAudit" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-2xs cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                <span>Chỉnh Sửa Số Liệu Mới</span>
              </button>
              <button id="btnCloseAuditModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-sm cursor-pointer" title="Đóng">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <!-- Table of Edit Records -->
          <div class="p-6 overflow-y-auto flex-1 bg-slate-50/50">
            ${logEntries.length === 0 ? `
              <div class="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl flex flex-col items-center gap-3 bg-white shadow-2xs">
                <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>Chưa có thao tác chỉnh sửa số liệu nào. Bạn có thể bấm nút <strong>"Chỉnh Sửa Số Liệu Mới"</strong> ở trên để thực hiện điều chỉnh.</span>
              </div>
            ` : `
              <div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider font-bold border-b border-slate-200">
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
                  <tbody class="divide-y divide-slate-100 text-slate-700 font-mono">
                    ${logEntries.map((e, idx) => {
                      const isRollbackAction = (e.action === 'ROLLBACK' || e.userRole === 'Rollback' || String(e.id).startsWith('rollback_'));
                      const isBaselineReset = (e.bank === 'ALL' || e.field === 'TAT_CA_CHI_TIEU' || e.action === 'RESET_BASELINE');
                      const isAlreadyReverted = Boolean(e.rolledBack === true || e.isReverted === true || e.action === 'ROLLED_BACK');
                      const canRevert = (e.oldValue !== null && e.oldValue !== undefined && !isRollbackAction && !isAlreadyReverted && !isBaselineReset);

                      return `
                        <tr class="hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-blue-50/40' : ''}">
                          <td class="py-2.5 px-3.5 text-slate-500 font-sans text-[11px] whitespace-nowrap">${e.formattedTime || e.timestamp}</td>
                          <td class="py-2.5 px-3 whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${isBaselineReset ? 'bg-rose-50 text-rose-800 border border-rose-200' : (isRollbackAction ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200')}">${e.userRole || 'Auditor'}</span>
                          </td>
                          <td class="py-2.5 px-3 font-bold ${isBaselineReset ? 'text-rose-700' : 'text-blue-700'}">
                            ${isBaselineReset ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200">TẤT CẢ NH</span>' : e.bank}
                          </td>
                          <td class="py-2.5 px-3 font-sans font-medium text-slate-900 max-w-[200px] truncate" title="${e.field}">
                            ${isBaselineReset ? '<span class="font-bold text-rose-700">Khôi phục dữ liệu gốc ban đầu</span>' : e.field}
                          </td>
                          <td class="py-2.5 px-2 font-bold text-slate-800">
                            ${isBaselineReset ? '<span class="text-slate-500 font-normal">Toàn bộ</span>' : e.year}
                          </td>
                          <td class="py-2.5 px-3 text-right text-rose-600 font-bold">
                            ${isBaselineReset ? '--' : (e.oldValue !== null && e.oldValue !== undefined ? formatNumber(e.oldValue) : '--')}
                          </td>
                          <td class="py-2.5 px-3 text-right text-emerald-600 font-bold">
                            ${isBaselineReset ? '--' : (e.newValue !== null && e.newValue !== undefined ? formatNumber(e.newValue) : '--')}
                          </td>
                          <td class="py-2.5 px-3 font-sans text-slate-600 text-[11px] max-w-[150px] truncate" title="${e.note || ''}">${e.note || '-'}</td>
                          <td class="py-2.5 px-3 text-center whitespace-nowrap">
                            ${canRevert ? `
                              <button type="button" class="btn-rollback-item px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-sans text-[11px] font-bold transition shadow-2xs cursor-pointer flex items-center gap-1 mx-auto" data-entry-id="${e.id}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                                <span>Phục hồi</span>
                              </button>
                            ` : isAlreadyReverted ? `
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                <span>Đã phục hồi</span>
                              </span>
                            ` : isBaselineReset ? `
                              <span class="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-rose-50 text-rose-700 border border-rose-200">Reset Baseline</span>
                            ` : isRollbackAction ? `
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Bản ghi hoàn tác
                              </span>
                            ` : `
                              <span class="text-[10px] text-slate-400 font-sans">Đã lưu vết</span>
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
          <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
            <button id="btnRestoreBaseline" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Khôi phục dữ liệu gốc ban đầu</span>
            </button>

            <button id="btnConfirmCloseAudit" type="button" class="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer">
              Đóng
            </button>
          </div>

          <!-- In-App Confirmation Sub-Modal (Zero native browser alert/confirm) -->
          <div id="auditConfirmSubModal" class="hidden absolute inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
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
    const subModalContainer = container.querySelector('#auditConfirmSubModal');

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

    // 1. Reset Baseline with In-App Confirmation Modal (NO native confirm)
    btnReset?.addEventListener('click', () => {
      if (!subModalContainer) return;

      subModalContainer.innerHTML = `
        <div class="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 animate-scale-up">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-rose-700">Khôi Phục Dữ Liệu Gốc Ban Đầu</h3>
              <p class="text-xs text-slate-500">Hoàn tác toàn bộ thay đổi về bản gốc 29 ngân hàng</p>
            </div>
          </div>
          
          <div class="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 leading-relaxed mb-5">
            <p class="font-bold mb-1">CẢNH BÁO QUAN TRỌNG:</p>
            <p>Thao tác này sẽ hủy bỏ toàn bộ <strong>${logEntries.length} thao tác</strong> hiệu chỉnh số liệu và đưa toàn bộ cơ sở dữ liệu BCTC của 29 ngân hàng về nguyên bản gốc ban đầu.</p>
          </div>

          <div class="flex items-center justify-end gap-2.5">
            <button id="btnCancelSubModal" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer">
              Hủy Bỏ
            </button>
            <button id="btnExecuteResetSubModal" type="button" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition cursor-pointer flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Xác Nhận Khôi Phục Tất Cả</span>
            </button>
          </div>
        </div>
      `;
      subModalContainer.classList.remove('hidden');

      const btnCancel = subModalContainer.querySelector('#btnCancelSubModal');
      const btnExec = subModalContainer.querySelector('#btnExecuteResetSubModal');

      btnCancel?.addEventListener('click', () => {
        subModalContainer.classList.add('hidden');
        subModalContainer.innerHTML = '';
      });

      btnExec?.addEventListener('click', async () => {
        btnExec.disabled = true;
        btnExec.innerHTML = `
          <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>Đang khôi phục...</span>
        `;
        try {
          await onResetBaseline();
        } finally {
          logEntries = dataVersioning.getAuditLog();
          subModalContainer.classList.add('hidden');
          subModalContainer.innerHTML = '';
          renderContent();
        }
      });
    });

    // 2. Individual Rollback with In-App Confirmation Modal (NO native confirm)
    container.querySelectorAll('.btn-rollback-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-entry-id');
        const entry = logEntries.find(x => String(x.id) === String(id));
        if (!entry || !subModalContainer) return;

        subModalContainer.innerHTML = `
          <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 animate-scale-up">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Xác Nhận Phục Hồi Số Liệu</h3>
                <p class="text-xs text-slate-500">Hoàn tác giá trị về trạng thái trước khi hiệu chỉnh</p>
              </div>
            </div>
            
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5 text-xs mb-5">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Ngân hàng:</span>
                <span class="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${entry.bank}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Năm tài chính:</span>
                <span class="font-bold text-slate-800">${entry.year}</span>
              </div>
              <div class="flex items-start justify-between gap-2">
                <span class="text-slate-500">Chỉ tiêu:</span>
                <span class="font-medium text-slate-900 text-right max-w-[220px]">${entry.field}</span>
              </div>
              <div class="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span class="text-slate-500">Giá trị hiện tại:</span>
                <span class="font-mono font-bold text-rose-600">${formatNumber(entry.newValue)}</span>
              </div>
              <div class="flex items-center justify-between bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                <span class="text-emerald-800 font-semibold">Giá trị sẽ phục hồi:</span>
                <span class="font-mono font-bold text-emerald-700 text-sm">${formatNumber(entry.oldValue)}</span>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5">
              <button id="btnCancelSubModal" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer">
                Hủy Bỏ
              </button>
              <button id="btnExecuteRollbackSubModal" type="button" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition cursor-pointer flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span>Xác Nhận Phục Hồi</span>
              </button>
            </div>
          </div>
        `;
        subModalContainer.classList.remove('hidden');

        const btnCancel = subModalContainer.querySelector('#btnCancelSubModal');
        const btnExec = subModalContainer.querySelector('#btnExecuteRollbackSubModal');

        btnCancel?.addEventListener('click', () => {
          subModalContainer.classList.add('hidden');
          subModalContainer.innerHTML = '';
        });

        btnExec?.addEventListener('click', async () => {
          btnExec.disabled = true;
          btnExec.innerHTML = `
            <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Đang phục hồi...</span>
          `;
          try {
            await onRollback(entry);
          } finally {
            logEntries = dataVersioning.getAuditLog();
            subModalContainer.classList.add('hidden');
            subModalContainer.innerHTML = '';
            renderContent();
          }
        });
      });
    });
  };

  renderContent();
}
