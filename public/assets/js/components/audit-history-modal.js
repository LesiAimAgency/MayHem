/**
 * assets/js/components/audit-history-modal.js
 * Data Versioning & Audit History Modal with In-App Rollback Confirmation Modals.
 * Expansive Responsive Layout with calibrated column widths, sticky headers, and real-time search/filter.
 */

import { dataVersioning } from '../core/data-versioning.js';
import { formatNumber } from '../core/formatter.js';
import { showToast } from '../core/helpers.js';
import { auth } from '../core/auth.js';

export function renderAuditHistoryModal(container, options = {}) {
  const {
    allRecords = [],
    onRollback = () => {},
    onResetBaseline = () => {},
    onOpenEdit = () => {},
    onClose = () => {}
  } = options;

  let logEntries = dataVersioning.getAuditLog();
  let currentSearch = '';
  let filterStatus = 'ALL'; // 'ALL' | 'CAN_REVERT' | 'APPLIED'

  const getComputedEntryState = (e) => {
    const isRollbackAction = (e.action === 'ROLLBACK' || e.userRole === 'Rollback' || String(e.id).startsWith('rollback_'));
    const isBaselineReset = (e.bank === 'ALL' || e.field === 'TAT_CA_CHI_TIEU' || e.action === 'RESET_BASELINE');

    // Live comparison with active data in allRecords
    const rec = allRecords.find(r => r.bank === e.bank && r.field === e.field);
    const currentLiveVal = (rec && rec.values) ? rec.values[e.year] : (rec ? rec[e.year] : null);

    // Target value to restore: prefer oldValue, fallback to old_value
    const targetRestoreVal = (e.oldValue !== null && e.oldValue !== undefined) 
      ? e.oldValue 
      : (e.old_value !== null && e.old_value !== undefined ? e.old_value : null);

    // Check if live table already matches target restore value
    const isAlreadyApplied = (currentLiveVal !== null && targetRestoreVal !== null && Math.abs(Number(currentLiveVal) - Number(targetRestoreVal)) < 0.0001);
    const canRevert = (!isBaselineReset && targetRestoreVal !== null && !isAlreadyApplied);

    return {
      isRollbackAction,
      isBaselineReset,
      currentLiveVal,
      targetRestoreVal,
      isAlreadyApplied,
      canRevert
    };
  };

  const getFilteredEntries = () => {
    const query = currentSearch.trim().toLowerCase();
    return logEntries.filter(e => {
      const state = getComputedEntryState(e);

      // Search filter
      if (query) {
        const matchBank = e.bank && e.bank.toLowerCase().includes(query);
        const matchField = e.field && e.field.toLowerCase().includes(query);
        const matchYear = e.year && String(e.year).toLowerCase().includes(query);
        const matchNote = e.note && e.note.toLowerCase().includes(query);
        const matchRole = e.userRole && e.userRole.toLowerCase().includes(query);
        if (!matchBank && !matchField && !matchYear && !matchNote && !matchRole) {
          return false;
        }
      }

      // Status filter
      if (filterStatus === 'CAN_REVERT') {
        return state.canRevert;
      }
      if (filterStatus === 'APPLIED') {
        return state.isAlreadyApplied;
      }

      return true;
    });
  };

  const renderContent = () => {
    const displayEntries = getFilteredEntries();
    const canManageLogs = auth.canManageAuditLog();
    
    // Counts for tabs
    let countCanRevert = 0;
    let countApplied = 0;
    logEntries.forEach(e => {
      const s = getComputedEntryState(e);
      if (s.canRevert) countCanRevert++;
      if (s.isAlreadyApplied) countApplied++;
    });

    container.innerHTML = `
      <div id="auditModalBackdrop" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
        <div class="bg-white border border-slate-200 rounded-2xl w-[96vw] max-w-[1550px] 2xl:max-w-[1680px] h-[92vh] max-h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 relative">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-200 bg-white flex flex-col gap-3 shrink-0">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div class="flex items-center gap-3 flex-wrap">
                <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div class="flex items-center gap-2.5 flex-wrap">
                    <h2 class="text-base font-bold text-slate-900">Lịch Sử Phiên Bản & Kiểm Toán Dữ Liệu (Audit Log)</h2>
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">${logEntries.length} thao tác</span>
                    <span class="text-[10px] px-2.5 py-0.5 rounded-md ${canManageLogs ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'} font-semibold">
                      ${canManageLogs ? 'Quyền Hạn: Quản Trị Viên (Toàn Quyền & Xóa Log)' : 'Quyền Hạn: Biên Tập Viên (Chỉ Xem & Phục Hồi)'}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">Lưu vết mọi thao tác chỉnh sửa số liệu kiểm toán. Quản trị viên có quyền xem, phục hồi và dọn dẹp nhật ký.</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <!-- Nút Xóa Log: Chỉ role Quản Trị mới xóa được -->
                ${canManageLogs ? `
                  <button id="btnClearAuditLogs" type="button" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition shadow-2xs cursor-pointer" title="Chỉ Quản Trị Viên mới có quyền xóa nhật ký kiểm toán">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    <span>Xóa Log</span>
                  </button>
                ` : `
                  <button type="button" disabled class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60" title="Chỉ Quản Trị Viên (Super Admin) mới có quyền xóa nhật ký kiểm toán">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    <span>Xóa Log (Chỉ Quản Trị)</span>
                  </button>
                `}

                <button id="btnOpenEditFromAudit" type="button" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-2xs cursor-pointer">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <span>Chỉnh Sửa Số Liệu Mới</span>
                </button>
                <button id="btnCloseAuditModal" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-sm cursor-pointer" title="Đóng">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- Search and Filter Toolbar -->
            <div class="flex items-center justify-between flex-wrap gap-3 pt-2.5 border-t border-slate-100">
              <div class="flex items-center gap-2.5 flex-wrap">
                <!-- Search input -->
                <div class="relative w-72 sm:w-80">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </span>
                  <input type="text" id="auditSearchInput" value="${currentSearch}" placeholder="Tìm theo mã NH, chỉ tiêu, năm, ghi chú..." class="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition" />
                  ${currentSearch ? `
                    <button id="btnClearSearch" type="button" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  ` : ''}
                </div>

                <!-- Filter Status Tabs -->
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button type="button" class="audit-filter-btn px-3 py-1 rounded-md font-semibold transition cursor-pointer ${filterStatus === 'ALL' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}" data-filter="ALL">
                    Tất cả (${logEntries.length})
                  </button>
                  <button type="button" class="audit-filter-btn px-3 py-1 rounded-md font-semibold transition cursor-pointer ${filterStatus === 'CAN_REVERT' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}" data-filter="CAN_REVERT">
                    Có thể phục hồi (${countCanRevert})
                  </button>
                  <button type="button" class="audit-filter-btn px-3 py-1 rounded-md font-semibold transition cursor-pointer ${filterStatus === 'APPLIED' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}" data-filter="APPLIED">
                    Đang áp dụng (${countApplied})
                  </button>
                </div>
              </div>

              <div class="text-xs text-slate-500 font-medium">
                Hiển thị <span class="font-bold text-slate-800">${displayEntries.length}</span> / ${logEntries.length} thao tác
              </div>
            </div>
          </div>

          <!-- Table of Edit Records -->
          <div class="overflow-auto flex-1 bg-slate-50/50 p-4 sm:p-6">
            ${displayEntries.length === 0 ? `
              <div class="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl flex flex-col items-center gap-3 bg-white shadow-2xs">
                <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>${currentSearch || filterStatus !== 'ALL' ? 'Không tìm thấy bản ghi kiểm toán nào phù hợp với bộ lọc.' : 'Chưa có thao tác chỉnh sửa số liệu nào.'}</span>
              </div>
            ` : `
              <div class="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white min-w-[1260px]">
                <table class="w-full text-left text-xs border-collapse table-fixed">
                  <colgroup>
                    <col style="width: 145px;"> <!-- Thời gian -->
                    <col style="width: 125px;"> <!-- Tài khoản -->
                    <col style="width: 80px;">  <!-- Mã NH -->
                    <col style="width: 320px;"> <!-- Chỉ tiêu -->
                    <col style="width: 70px;">  <!-- Năm -->
                    <col style="width: 130px;"> <!-- Giá trị trước -->
                    <col style="width: 130px;"> <!-- Giá trị điều chỉnh -->
                    <col style="width: 220px;"> <!-- Ghi chú -->
                    <col style="width: 150px;"> <!-- Hành động -->
                  </colgroup>
                  <thead class="sticky top-0 z-10 bg-slate-100 text-slate-700 uppercase text-[11px] tracking-wider font-bold border-b border-slate-200 shadow-2xs">
                    <tr>
                      <th class="py-3.5 px-3.5 text-left">Thời gian</th>
                      <th class="py-3.5 px-3 text-left">Tài khoản</th>
                      <th class="py-3.5 px-3 text-center">Mã NH</th>
                      <th class="py-3.5 px-3 text-left">Chỉ tiêu tài chính</th>
                      <th class="py-3.5 px-2 text-center">Năm</th>
                      <th class="py-3.5 px-3 text-right">Giá trị trước</th>
                      <th class="py-3.5 px-3 text-right">Giá trị điều chỉnh</th>
                      <th class="py-3.5 px-3 text-left">Ghi chú</th>
                      <th class="py-3.5 px-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    ${displayEntries.map((e, idx) => {
                      const {
                        isRollbackAction,
                        isBaselineReset,
                        currentLiveVal,
                        targetRestoreVal,
                        isAlreadyApplied,
                        canRevert
                      } = getComputedEntryState(e);

                      return `
                        <tr class="hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-blue-50/30' : ''}">
                          <!-- Thời gian -->
                          <td class="py-2.5 px-3.5 text-slate-500 font-sans text-[11px] whitespace-nowrap">
                            ${e.formattedTime || e.timestamp}
                          </td>

                          <!-- Tài khoản -->
                          <td class="py-2.5 px-3 whitespace-nowrap">
                            <span class="px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${isBaselineReset ? 'bg-rose-50 text-rose-800 border border-rose-200' : (isRollbackAction ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200')}">
                              ${e.userRole || 'Auditor'}
                            </span>
                          </td>

                          <!-- Mã NH -->
                          <td class="py-2.5 px-3 text-center font-bold ${isBaselineReset ? 'text-rose-700' : 'text-blue-700'}">
                            ${isBaselineReset ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200">TẤT CẢ NH</span>' : e.bank}
                          </td>

                          <!-- Chỉ tiêu -->
                          <td class="py-2.5 px-3 font-sans font-medium text-slate-900 leading-snug break-words" title="${e.field}">
                            ${isBaselineReset ? '<span class="font-bold text-rose-700">Khôi phục dữ liệu gốc ban đầu</span>' : e.field}
                          </td>

                          <!-- Năm -->
                          <td class="py-2.5 px-2 text-center font-bold text-slate-800">
                            ${isBaselineReset ? '<span class="text-slate-500 font-normal text-[11px]">Toàn bộ</span>' : e.year}
                          </td>

                          <!-- Giá trị trước -->
                          <td class="py-2.5 px-3 text-right text-rose-600 font-mono font-bold whitespace-nowrap">
                            ${isBaselineReset ? '--' : (e.oldValue !== null && e.oldValue !== undefined ? formatNumber(e.oldValue) : (e.old_value !== null && e.old_value !== undefined ? formatNumber(e.old_value) : '--'))}
                          </td>

                          <!-- Giá trị điều chỉnh -->
                          <td class="py-2.5 px-3 text-right text-emerald-600 font-mono font-bold whitespace-nowrap">
                            ${isBaselineReset ? '--' : (e.newValue !== null && e.newValue !== undefined ? formatNumber(e.newValue) : (e.new_value !== null && e.new_value !== undefined ? formatNumber(e.new_value) : '--'))}
                          </td>

                          <!-- Ghi chú -->
                          <td class="py-2.5 px-3 font-sans text-slate-600 text-[11px] leading-snug break-words" title="${e.note || ''}">
                            ${e.note || '-'}
                          </td>

                          <!-- Hành động -->
                          <td class="py-2.5 px-3 text-center whitespace-nowrap">
                            <div class="inline-flex items-center justify-center gap-1.5">
                              ${canRevert ? `
                                <button type="button" class="btn-rollback-item px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-sans text-[11px] font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1" data-entry-id="${e.id}" title="Khôi phục về giá trị: ${formatNumber(targetRestoreVal)}">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                                  <span>Phục hồi</span>
                                </button>
                              ` : isAlreadyApplied ? `
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Số liệu hiện tại trên bảng đã trùng khớp với giá trị lịch sử này">
                                  <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                                  <span>Đang áp dụng</span>
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

                              ${canManageLogs ? `
                                <button type="button" class="btn-delete-single-log p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer" data-entry-id="${e.id}" title="Xóa bản ghi này (Chỉ Quản Trị)">
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              ` : ''}
                            </div>
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
          <div class="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3 shrink-0">
            <div class="flex items-center gap-2 flex-wrap">
              <button id="btnRestoreBaseline" type="button" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer shadow-2xs">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Khôi phục dữ liệu gốc ban đầu (Toàn bộ 29 ngân hàng)</span>
              </button>

              ${canManageLogs ? `
                <button id="btnFooterClearAuditLogs" type="button" class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-100/70 border border-rose-200 transition cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span>Xóa Toàn Bộ Nhật Ký Log</span>
                </button>
              ` : ''}
            </div>

            <button id="btnConfirmCloseAudit" type="button" class="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer">
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
    const btnClearLogs = container.querySelector('#btnClearAuditLogs');
    const btnFooterClearLogs = container.querySelector('#btnFooterClearAuditLogs');
    const btnOpenEdit = container.querySelector('#btnOpenEditFromAudit');
    const subModalContainer = container.querySelector('#auditConfirmSubModal');
    const searchInput = container.querySelector('#auditSearchInput');
    const btnClearSearch = container.querySelector('#btnClearSearch');

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

    // Search and filter listeners
    searchInput?.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderContent();
      const updatedInput = container.querySelector('#auditSearchInput');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.selectionStart = updatedInput.selectionEnd = updatedInput.value.length;
      }
    });

    btnClearSearch?.addEventListener('click', () => {
      currentSearch = '';
      renderContent();
    });

    container.querySelectorAll('.audit-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterStatus = btn.getAttribute('data-filter');
        renderContent();
      });
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
            <p>Thao tác này sẽ đặt lại toàn bộ cơ sở dữ liệu và 16 chỉ số tính toán của 29 ngân hàng về nguyên bản gốc ban đầu.</p>
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

    // 2. Clear All Audit Logs (Quản Trị only)
    const triggerClearAllModal = () => {
      if (!subModalContainer || !canManageLogs) return;

      subModalContainer.innerHTML = `
        <div class="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 animate-scale-up">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-rose-700">Xác Nhận Xóa Toàn Bộ Nhật Ký</h3>
              <p class="text-xs text-slate-500">Chỉ Quản Trị Viên (Super Admin) mới có quyền</p>
            </div>
          </div>
          
          <div class="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 leading-relaxed mb-5">
            <p class="font-bold mb-1">CẢNH BÁO XÓA DỮ LIỆU:</p>
            <p>Thao tác này sẽ xóa sạch <strong>${logEntries.length} bản ghi</strong> lịch sử kiểm toán trong cơ sở dữ liệu và bộ nhớ máy chủ. Không thể hoàn tác sau khi thực hiện.</p>
          </div>

          <div class="flex items-center justify-end gap-2.5">
            <button id="btnCancelClearSubModal" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer">
              Hủy Bỏ
            </button>
            <button id="btnExecClearSubModal" type="button" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition cursor-pointer flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Xác Nhận Xóa Sạch Log</span>
            </button>
          </div>
        </div>
      `;
      subModalContainer.classList.remove('hidden');

      const btnCancel = subModalContainer.querySelector('#btnCancelClearSubModal');
      const btnExec = subModalContainer.querySelector('#btnExecClearSubModal');

      btnCancel?.addEventListener('click', () => {
        subModalContainer.classList.add('hidden');
        subModalContainer.innerHTML = '';
      });

      btnExec?.addEventListener('click', async () => {
        btnExec.disabled = true;
        btnExec.innerHTML = `
          <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>Đang xóa...</span>
        `;
        try {
          const res = await dataVersioning.clearRemoteAuditLogs();
          if (res.success) {
            showToast('Đã xóa toàn bộ nhật ký kiểm toán thành công.', 'success');
          } else {
            showToast(res.message || 'Không thể xóa nhật ký kiểm toán.', 'error');
          }
        } catch (err) {
          showToast('Lỗi khi xóa nhật ký: ' + err.message, 'error');
        } finally {
          logEntries = dataVersioning.getAuditLog();
          subModalContainer.classList.add('hidden');
          subModalContainer.innerHTML = '';
          renderContent();
        }
      });
    };

    btnClearLogs?.addEventListener('click', triggerClearAllModal);
    btnFooterClearLogs?.addEventListener('click', triggerClearAllModal);

    // 3. Delete Single Audit Log Record (Quản Trị only)
    container.querySelectorAll('.btn-delete-single-log').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-entry-id');
        const entry = logEntries.find(x => String(x.id) === String(id));
        if (!entry || !subModalContainer || !canManageLogs) return;

        subModalContainer.innerHTML = `
          <div class="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 animate-scale-up">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-rose-700">Xóa Bản Ghi Kiểm Toán</h3>
                <p class="text-xs text-slate-500">${entry.bank} - ${entry.field} (${entry.year})</p>
              </div>
            </div>
            
            <p class="text-xs text-slate-600 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa bản ghi thao tác này khỏi nhật ký kiểm toán? Thao tác này chỉ Quản Trị Viên mới có quyền thực hiện.
            </p>

            <div class="flex items-center justify-end gap-2.5">
              <button id="btnCancelSingleDelete" type="button" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer">
                Hủy Bỏ
              </button>
              <button id="btnExecSingleDelete" type="button" class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition cursor-pointer flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        `;
        subModalContainer.classList.remove('hidden');

        subModalContainer.querySelector('#btnCancelSingleDelete')?.addEventListener('click', () => {
          subModalContainer.classList.add('hidden');
          subModalContainer.innerHTML = '';
        });

        subModalContainer.querySelector('#btnExecSingleDelete')?.addEventListener('click', async () => {
          try {
            await dataVersioning.deleteRemoteAuditLog(id);
            showToast('Đã xóa bản ghi kiểm toán thành công.', 'success');
          } catch (err) {
            showToast('Lỗi khi xóa bản ghi: ' + err.message, 'error');
          } finally {
            logEntries = dataVersioning.getAuditLog();
            subModalContainer.classList.add('hidden');
            subModalContainer.innerHTML = '';
            renderContent();
          }
        });
      });
    });

    // 4. Individual Rollback with In-App Confirmation Modal (Dynamic Live-Value)
    container.querySelectorAll('.btn-rollback-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-entry-id');
        const entry = logEntries.find(x => String(x.id) === String(id));
        if (!entry || !subModalContainer) return;

        const { currentLiveVal, targetRestoreVal } = getComputedEntryState(entry);
        const targetVal = targetRestoreVal !== null ? targetRestoreVal : entry.newValue;

        subModalContainer.innerHTML = `
          <div class="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 animate-scale-up">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Xác Nhận Phục Hồi Số Liệu</h3>
                <p class="text-xs text-slate-500">Hoàn tác số liệu về giá trị trước kiểm toán</p>
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
                <span class="font-mono font-bold text-rose-600">${formatNumber(currentLiveVal)}</span>
              </div>
              <div class="flex items-center justify-between bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                <span class="text-emerald-800 font-semibold">Giá trị sẽ phục hồi:</span>
                <span class="font-mono font-bold text-emerald-700 text-sm">${formatNumber(targetVal)}</span>
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

