/**
 * assets/js/components/backup-modal.js
 * Backup & Restore Manager + External API Ingestion Configurator.
 * Rule: Zero emoji. Clean SVGs only.
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
    <div id="backupModalBackdrop" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div>
            <h2 class="text-base font-bold text-slate-100">Quản Trị Sao Lưu & Cấu Hình API Dữ Liệu</h2>
            <p class="text-xs text-slate-400 mt-0.5">Sao lưu snapshot nhiều nơi, phân chia lưu trữ an toàn và cấu hình đồng bộ API</p>
          </div>
          <button id="btnCloseBackupModal" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm">
            Đóng
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto flex flex-col gap-5">
          
          <!-- Section 1: Backup & Share Snapshot -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider">1. Xuất Bản Sao Lưu Dữ Liệu (Backup Snapshot)</span>
                <p class="text-xs text-slate-400 mt-0.5">Đóng gói toàn bộ 29 ngân hàng, lịch sử kiểm toán và bộ lọc tùy chỉnh thành file JSON để lưu trữ nhiều nơi (Google Drive / GitHub / Local disk) và chia sẻ cho Nghĩa cùng phân chia bảo quản.</p>
              </div>
            </div>

            <!-- Share with Nghia Guide Card -->
            <div class="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-blue-300">Phân chia lưu trữ dữ liệu & mã nguồn với Nghĩa:</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">An Toàn Phân Tán</span>
              </div>
              <p class="text-[11px] text-slate-400">
                1. Bấm nút <strong>"Tải Bản Sao Lưu (.json)"</strong> bên dưới để xuất trọn gói cơ sở dữ liệu BCTC và lịch sử kiểm toán.<br />
                2. Gửi file JSON snapshot và repository source code cho Nghĩa để lưu trữ dự phòng tại máy trạm phụ.<br />
                3. Khi có sự cố sai sót hoặc phá hoại số liệu, chỉ cần chọn <strong>"Phục Hồi Dữ Liệu"</strong> để đưa hệ thống về đúng bản snapshot đã lưu.
              </p>
            </div>

            <div class="flex items-center gap-3 mt-1">
              <button id="btnDownloadBackupSnapshot" type="button" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm">
                ${ICONS.DOWNLOAD}
                <span>Tải Bản Sao Lưu (.json) Ngay</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Restore from Backup -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider">2. Phục Hồi Dữ Liệu Từ Bản Sao Lưu (Restore)</span>
                ${isAdmin ? '' : '<span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-semibold">Chỉ Dành Cho Admin</span>'}
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Khôi phục cơ sở dữ liệu về đúng thời điểm đã tạo bản sao lưu phòng trường hợp dữ liệu bị sai hoặc cần rollback.</p>
            </div>

            <div class="flex items-center gap-3">
              <input type="file" id="inputRestoreFile" accept=".json" class="hidden" />
              <button id="btnTriggerRestoreFile" type="button" class="flex items-center gap-2 px-4 py-2 rounded-lg ${isAdmin ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'} text-xs font-medium transition" ${isAdmin ? '' : 'disabled'}>
                ${ICONS.FILE}
                <span>Chọn File Sao Lưu Để Phục Hồi</span>
              </button>
            </div>
          </div>

          <!-- Section 3: API Endpoint Configuration -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider">3. Nhập Dữ Liệu Bằng API (API Ingestion)</span>
                ${isAdmin ? '' : '<span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-semibold">Chỉ Dành Cho Admin</span>'}
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Kéo dữ liệu từ API bên ngoài (Laravel Backend, Vnstock API hoặc Server nội bộ) và hiển thị trực tiếp trên format định sẵn.</p>
            </div>

            <div class="grid grid-cols-1 gap-3 mt-1">
              <div>
                <label class="block text-[11px] text-slate-400 mb-1">Đường dẫn API Endpoint (URL):</label>
                <input type="url" id="inpApiEndpoint" value="${apiConfig.endpointUrl || ''}" placeholder="https://api.yourdomain.com/v1/bank-reports" class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-mono" ${isAdmin ? '' : 'disabled'} />
              </div>

              <div>
                <label class="block text-[11px] text-slate-400 mb-1">API Key / Bearer Token:</label>
                <input type="password" id="inpApiKey" value="${apiConfig.apiKey || ''}" placeholder="Nhập API Key hoặc Token xác thực nếu có..." class="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-blue-500 font-mono" ${isAdmin ? '' : 'disabled'} />
              </div>

              <div class="flex items-center justify-between flex-wrap gap-2 pt-2">
                <span class="text-[11px] text-slate-500 font-mono">Lần đồng bộ gần nhất: ${apiConfig.lastSynced ? new Date(apiConfig.lastSynced).toLocaleString('vi-VN') : 'Chưa đồng bộ'}</span>
                <div class="flex items-center gap-2">
                  <button id="btnSaveApiConfig" type="button" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition" ${isAdmin ? '' : 'disabled'}>
                    Lưu Cấu Hình
                  </button>
                  <button id="btnSyncApiNow" type="button" class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition" ${isAdmin ? '' : 'disabled'}>
                    Kéo Dữ Liệu API Ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button id="btnConfirmCloseBackup" type="button" class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition">
            Đóng
          </button>
        </div>

      </div>
    </div>
  `;

  const backdrop = container.querySelector('#backupModalBackdrop');
  const btnClose = container.querySelector('#btnCloseBackupModal');
  const btnConfirmClose = container.querySelector('#btnConfirmCloseBackup');
  const btnDownloadBackup = container.querySelector('#btnDownloadBackupSnapshot');
  const btnTriggerRestore = container.querySelector('#btnTriggerRestoreFile');
  const inputRestore = container.querySelector('#inputRestoreFile');
  const inpEndpoint = container.querySelector('#inpApiEndpoint');
  const inpKey = container.querySelector('#inpApiKey');
  const btnSaveApi = container.querySelector('#btnSaveApiConfig');
  const btnSyncApi = container.querySelector('#btnSyncApiNow');

  const closeHandler = () => {
    container.innerHTML = '';
    onClose();
  };

  btnClose.addEventListener('click', closeHandler);
  btnConfirmClose.addEventListener('click', closeHandler);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeHandler();
  });

  // Download Snapshot with HMAC integrity signature from backend
  btnDownloadBackup.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/v1/backup/export', {
        headers: auth.getAuthHeaders()
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MayHem_Backup_HMAC_Signed_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Đã tải bản sao lưu bảo mật HMAC từ máy chủ thành công!', 'success');
        return;
      }
    } catch (e) {}

    // Fallback to client snapshot
    const snapshot = dataVersioning.createBackupSnapshot(fullDataset, customFilters);
    dataVersioning.downloadBackupFile(snapshot);
    showToast('Đã tạo và tải file sao lưu snapshot thành công!');
  });

  // Restore Snapshot with backend validation
  if (isAdmin) {
    btnTriggerRestore.addEventListener('click', () => inputRestore.click());
    inputRestore.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const jsonText = evt.target.result;
          const parsed = dataVersioning.parseAndValidateBackup(jsonText);

          // Verify with server-side HMAC check
          try {
            const serverRes = await fetch('/api/v1/backup/restore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
              body: jsonText
            });
            const serverData = await serverRes.json();
            if (!serverRes.ok) {
              throw new Error(serverData.message || 'Lỗi xác thực chữ ký bản sao lưu');
            }
          } catch (serverErr) {
            alert('Cảnh báo an toàn dữ liệu: ' + serverErr.message);
            return;
          }

          onRestoreData(parsed);
          closeHandler();
          showToast('Đã phục hồi dữ liệu từ bản sao lưu thành công!', 'success');
        } catch (err) {
          alert(err.message);
        }
      };
      reader.readAsText(file);
    });

    // Save API
    btnSaveApi.addEventListener('click', () => {
      apiManager.saveConfig({
        endpointUrl: inpEndpoint.value.trim(),
        apiKey: inpKey.value.trim()
      });
      showToast('Đã lưu cấu hình API thành công!');
    });

    // Sync API
    btnSyncApi.addEventListener('click', async () => {
      apiManager.saveConfig({
        endpointUrl: inpEndpoint.value.trim(),
        apiKey: inpKey.value.trim()
      });

      try {
        btnSyncApi.textContent = 'Đang kéo dữ liệu...';
        btnSyncApi.disabled = true;
        const remoteData = await apiManager.fetchRemoteData();
        onRestoreData(remoteData);
        closeHandler();
        showToast('Đã kéo và nạp dữ liệu từ API thành công!');
      } catch (err) {
        alert('Lỗi kéo dữ liệu API: ' + err.message);
      } finally {
        btnSyncApi.textContent = 'Kéo Dữ Liệu API Ngay';
        btnSyncApi.disabled = false;
      }
    });
  }
}
