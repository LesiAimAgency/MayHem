/**
 * assets/js/components/backup-modal.js
 * Backup & Restore Manager + External API Ingestion Configurator.
 * Rule: Zero emoji. Clean SVGs only. 100% Clean Light Mode.
 */

import { dataVersioning } from '../core/data-versioning.js';
import { apiManager } from '../core/api-manager.js';
import { auth } from '../core/auth.js';
import { showToast, ICONS } from '../core/helpers.js';

export function renderBackupModal(container, options = {}) {
  const {
    fullDataset = {},
    customFilters = [],
    onRestoreData = () => {},
    onClose = () => {}
  } = options;

  const apiConfig = apiManager.loadConfig();
  const isAdmin = auth.canBackup();

  container.innerHTML = `
    <div id="backupModalBackdrop" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 class="text-base font-bold text-slate-900">Quản Trị Sao Lưu & Cấu Hình Dữ Liệu</h2>
            <p class="text-xs text-slate-500 mt-0.5">Sao lưu snapshot nhiều nơi, phân chia lưu trữ an toàn và cấu hình đồng bộ dữ liệu</p>
          </div>
          <button id="btnCloseBackupModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-sm cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex flex-col gap-5 bg-slate-50/50">
          
          <!-- Section 1: Backup & Share Snapshot -->
          <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Xuất Bản Sao Lưu Dữ Liệu (Backup Snapshot)</span>
                <p class="text-xs text-slate-500 mt-0.5">Đóng gói toàn bộ 29 ngân hàng, lịch sử kiểm toán và bộ lọc tùy chỉnh thành file dữ liệu để lưu trữ dự phòng nhiều nơi an toàn.</p>
              </div>
            </div>

            <!-- Storage Guide Card -->
            <div class="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700 space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-blue-900">Quy trình phân chia lưu trữ dữ liệu an toàn:</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 border border-blue-200 font-semibold">Bảo Toàn Dữ Liệu</span>
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed">
                1. Bấm nút <strong>"Tải Bản Sao Lưu (.json)"</strong> bên dưới để xuất trọn gói cơ sở dữ liệu BCTC và lịch sử kiểm toán.<br />
                2. Lưu trữ file sao lưu tại máy trạm phụ hoặc ổ cứng ngoài để đảm bảo an toàn phân tán.<br />
                3. Khi cần khôi phục lại dữ liệu gốc, chỉ cần chọn <strong>"Phục Hồi Dữ Liệu"</strong> để nạp lại bản đã lưu.
              </p>
            </div>

            <div class="flex items-center gap-3 mt-1">
              <button id="btnDownloadBackupSnapshot" type="button" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer">
                ${ICONS.DOWNLOAD}
                <span>Tải Bản Sao Lưu (.json) Ngay</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Restore from Backup -->
          <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Phục Hồi Dữ Liệu Từ Bản Sao Lưu (Restore)</span>
                ${isAdmin ? '' : '<span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Chỉ Dành Cho Quản Trị Viên</span>'}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Khôi phục cơ sở dữ liệu về đúng thời điểm đã tạo bản sao lưu phòng trường hợp dữ liệu bị sai hoặc cần hoàn tác.</p>
            </div>

            <div class="flex items-center gap-3">
              <input type="file" id="inputRestoreFile" accept=".json" class="hidden" />
              <button id="btnTriggerRestoreFile" type="button" class="flex items-center gap-2 px-4 py-2 rounded-lg ${isAdmin ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'} text-xs font-semibold transition" ${isAdmin ? '' : 'disabled'}>
                ${ICONS.FILE}
                <span>Chọn File Sao Lưu Để Phục Hồi</span>
              </button>
            </div>
          </div>

          <!-- Section 3: API Endpoint Configuration -->
          <div class="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Nhập Dữ Liệu Từ Máy Chủ Khác</span>
                ${isAdmin ? '' : '<span class="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Chỉ Dành Cho Quản Trị Viên</span>'}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Đồng bộ số liệu từ máy chủ nội bộ hoặc nguồn cấp dữ liệu khác và chuẩn hóa trực tiếp vào bảng báo cáo.</p>
            </div>

            <div class="grid grid-cols-1 gap-3 mt-1">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Đường dẫn nguồn dữ liệu (URL):</label>
                <input type="url" id="inpApiEndpoint" value="${apiConfig.endpointUrl || ''}" placeholder="https://api.yourdomain.com/v1/bank-reports" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600 font-mono shadow-2xs" ${isAdmin ? '' : 'disabled'} />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Mã khóa xác thực (nếu có):</label>
                <input type="password" id="inpApiKey" value="${apiConfig.apiKey || ''}" placeholder="Nhập khóa xác thực nếu nguồn dữ liệu yêu cầu..." class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-600 font-mono shadow-2xs" ${isAdmin ? '' : 'disabled'} />
              </div>

              <div class="flex items-center justify-between flex-wrap gap-2 pt-2">
                <span class="text-[11px] text-slate-500 font-mono">Lần đồng bộ gần nhất: ${apiConfig.lastSynced ? new Date(apiConfig.lastSynced).toLocaleString('vi-VN') : 'Chưa đồng bộ'}</span>
                <div class="flex items-center gap-2">
                  <button id="btnSaveApiConfig" type="button" class="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs transition cursor-pointer" ${isAdmin ? '' : 'disabled'}>
                    Lưu Cấu Hình
                  </button>
                  <button id="btnSyncApiNow" type="button" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-2xs cursor-pointer" ${isAdmin ? '' : 'disabled'}>
                    Đồng Bộ Số Liệu Ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-end">
          <button id="btnConfirmCloseBackup" type="button" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer">
            Đóng
          </button>
        </div>

      </div>
    </div>
  `;

  const backdrop = container.querySelector('#backupModalBackdrop');
  const btnClose = container.querySelector('#btnCloseBackupModal');
  const btnConfirmClose = container.querySelector('#btnConfirmCloseBackup');
  const btnDownload = container.querySelector('#btnDownloadBackupSnapshot');
  const btnRestoreTrigger = container.querySelector('#btnTriggerRestoreFile');
  const inputRestore = container.querySelector('#inputRestoreFile');

  const inpEndpoint = container.querySelector('#inpApiEndpoint');
  const inpKey = container.querySelector('#inpApiKey');
  const btnSaveConfig = container.querySelector('#btnSaveApiConfig');
  const btnSyncNow = container.querySelector('#btnSyncApiNow');

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose?.addEventListener('click', closeHandler);
  btnConfirmClose?.addEventListener('click', closeHandler);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });

  // Export Snapshot
  btnDownload?.addEventListener('click', () => {
    const snapshot = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      dataset: fullDataset,
      auditLog: dataVersioning.getAuditLog(),
      customFilters: customFilters
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MayHem_Financial_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Đã xuất thành công bản sao lưu dữ liệu toàn diện!', 'success');
  });

  // Restore Trigger
  btnRestoreTrigger?.addEventListener('click', () => {
    if (!isAdmin) {
      showToast('Tài khoản của bạn không có quyền phục hồi dữ liệu.', 'error');
      return;
    }
    inputRestore.click();
  });

  inputRestore?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.dataset && !parsed.metadata) {
          throw new Error('Định dạng file sao lưu không hợp lệ.');
        }

        const dataToRestore = parsed.dataset || parsed;
        if (parsed.auditLog && Array.isArray(parsed.auditLog)) {
          localStorage.setItem('mayhem_audit_log_v1', JSON.stringify(parsed.auditLog));
        }

        onRestoreData(dataToRestore);
        closeHandler();
      } catch (err) {
        showToast('Lỗi đọc file sao lưu: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  });

  // Save API config
  btnSaveConfig?.addEventListener('click', () => {
    if (!isAdmin) return;
    const url = inpEndpoint.value.trim();
    const key = inpKey.value.trim();

    apiManager.saveConfig({
      endpointUrl: url,
      apiKey: key,
      lastSynced: apiConfig.lastSynced
    });

    showToast('Đã lưu cấu hình đồng bộ dữ liệu!', 'success');
  });

  // Sync API Now
  btnSyncNow?.addEventListener('click', async () => {
    if (!isAdmin) return;
    const url = inpEndpoint.value.trim();
    if (!url) {
      showToast('Vui lòng nhập đường dẫn URL nguồn dữ liệu.', 'error');
      return;
    }

    btnSyncNow.disabled = true;
    btnSyncNow.textContent = 'Đang đồng bộ...';

    const result = await apiManager.fetchFromExternalEndpoint({
      endpointUrl: url,
      apiKey: inpKey.value.trim()
    });

    btnSyncNow.disabled = false;
    btnSyncNow.textContent = 'Đồng Bộ Số Liệu Ngay';

    if (result.success) {
      showToast('Đồng bộ số liệu từ máy chủ thành công!', 'success');
      onRestoreData(result.data);
      closeHandler();
    } else {
      showToast('Đồng bộ thất bại: ' + result.error, 'error');
    }
  });
}
