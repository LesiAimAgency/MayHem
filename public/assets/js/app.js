/**
 * assets/js/app.js
 * Application Entry Point.
 * Rule: Clean modular bootstrap. Zero inline business logic. Zero emoji.
 */

import { loadFinancialData, parseUploadedJSON } from './core/data-loader.js';
import { updateHeaderStatus } from './components/header.js';
import { DashboardApp } from './pages/dashboard.js';
import { showToast } from './core/helpers.js';
import { auth } from './core/auth.js';

let appInstance = null;

async function bootstrap() {
  // Authentication Guard: Auto-route to login if not authenticated
  if (!auth.isLoggedIn()) {
    window.location.replace('/login');
    return;
  }

  // Ensure token cookie is synced
  if (auth.getToken()) {
    try {
      document.cookie = `mayhem_token=${auth.getToken()}; path=/; max-age=604800; SameSite=Lax`;
    } catch (e) {}
  }

  const bannerNotice = document.getElementById('directFileNoticeBanner');
  const btnDirectUpload = document.getElementById('btnDirectUpload');
  const fileDirectInput = document.getElementById('fileDirectInput');

  // Register drag-and-drop on window
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json')) {
        handleFileRead(file);
      }
    }
  });

  if (btnDirectUpload && fileDirectInput) {
    btnDirectUpload.addEventListener('click', () => fileDirectInput.click());
    fileDirectInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFileRead(file);
    });
  }

  function handleFileRead(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseUploadedJSON(e.target.result);
        if (bannerNotice) bannerNotice.classList.add('hidden');
        appInstance = new DashboardApp(parsed);
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsText(file);
  }

  try {
    updateHeaderStatus('loading', 'Đang nạp dữ liệu tài chính...');
    
    // Load full 10-year financial dataset directly (served in < 5ms via IndexedDB cache with ETag 304)
    const result = await loadFinancialData('NGAN_HANG', { horizon: 'full' });
    if (bannerNotice) bannerNotice.classList.add('hidden');
    appInstance = new DashboardApp(result.data, {
      isSummaryChunk: false,
      currentIndustry: 'NGAN_HANG'
    });
  } catch (err) {
    console.warn('Tự động nạp thất bại:', err.message);
    updateHeaderStatus('error', 'Chờ nạp file dữ liệu');
    if (bannerNotice) bannerNotice.classList.remove('hidden');
    showToast('Vui lòng chọn file JSON để nạp dữ liệu trực tiếp.');
  }
}

// Boot application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
