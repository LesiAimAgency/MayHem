/**
 * assets/js/components/header.js
 * Header Bar with MayHem Admin System integration, industry selector, RBAC status, View navigation tabs, and actions.
 * Rule: Zero emoji. Clean SVGs only.
 */

import { ICONS, showToast, escapeHtml } from '../core/helpers.js';
import { auth, ROLES_META, ROLE_SUPERADMIN, ROLE_EDITOR_EXPORT, ROLE_EDITOR_NO_EXPORT } from '../core/auth.js';
import { INDUSTRY_CONFIGS, onIndustryConfigsUpdated } from './filters.js';

export function populateHeaderIndustryDropdown(selectElement, currentIndustry = 'NGAN_HANG') {
  if (!selectElement) return;
  const entries = Object.values(INDUSTRY_CONFIGS);
  if (entries.length === 0) return;
  selectElement.innerHTML = entries.map(ind => {
    const isSel = ind.id === currentIndustry;
    const tickerSummary = ind.quickTickers && ind.quickTickers.length > 0
      ? `(${ind.quickTickers.slice(0, 3).join(', ')}...)`
      : `(${(ind.tickers || []).length} mã)`;
    return `<option value="${ind.id}" ${isSel ? 'selected' : ''}>${escapeHtml(ind.name)} ${escapeHtml(tickerSummary)}</option>`;
  }).join('');
}

export function renderHeader(container, handlers = {}) {
  const isLoggedIn = auth.isLoggedIn();
  const currentUser = auth.getUser();
  const currentRole = auth.getCurrentRole();
  const roleMeta = auth.getRoleMeta() || { shortLabel: 'Khóa', badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30' };
  const canExport = auth.canExport();

  container.innerHTML = `
    <div class="flex flex-col gap-3 w-full">
      
      <!-- Top Row: Branding, Industry, MayHem Admin Trigger, Actions -->
      <div class="flex items-center justify-between flex-wrap gap-3 w-full">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800 flex items-center justify-center shadow-md shadow-blue-500/15 text-white flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Báo Cáo Tài Chính Doanh Nghiệp</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">MayHem Admin</span>
              </h1>
              <!-- Industry Badge / Selector -->
              <select id="headerIndustrySelector" class="text-xs px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold outline-none cursor-pointer transition">
                <!-- Dynamically populated from Database -->
              </select>
            </div>
            <p class="text-[11px] text-slate-500">Hệ thống phân tích, đối chiếu báo cáo tài chính & kiểm soát phân quyền chuyên sâu</p>
          </div>
        </div>

        <!-- Right: Status, MayHem Admin Trigger, Export -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Data Status Badge -->
          <div id="headerStatusBadge" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            ${ICONS.STATUS_DOT}
            <span id="headerStatusText">Đang khởi tạo...</span>
          </div>

          <!-- Soft Refresh Button -->
          <button id="btnSoftRefreshData" type="button" class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition shadow-2xs" title="Làm mới dữ liệu mới nhất">
            <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Làm mới</span>
          </button>

          <!-- Edit Metric Button -->
          <button id="btnOpenEditMetricModal" type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-2xs" title="Chỉnh sửa số liệu báo cáo tài chính theo ngân hàng, chỉ tiêu và năm">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span>Chỉnh Sửa Số Liệu</span>
          </button>

          <!-- MayHem Admin System Trigger Button (Open Right Drawer) -->
          <button id="btnOpenMayHemAdmin" type="button" class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
            isLoggedIn 
              ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
          }">
            <svg class="w-4 h-4 ${isLoggedIn ? 'text-emerald-600' : 'text-white'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>${isLoggedIn ? (currentUser?.name || 'Admin System') : 'Đăng Nhập Quản Trị MayHem'}</span>
            ${isLoggedIn ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${roleMeta.badgeClass}">${roleMeta.shortLabel}</span>` : ''}
          </button>

          <!-- Export Excel/CSV Button (RBAC Guarded) -->
          <button id="btnExportCSV" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
            canExport 
              ? 'bg-blue-600 hover:bg-blue-500 text-white' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          } shadow-2xs transition" title="${
            !isLoggedIn 
              ? 'Cần đăng nhập hệ thống MayHem để tải dữ liệu' 
              : (canExport ? 'Tải dữ liệu ra file Excel' : 'Tài khoản Cấp 3 (Staff) bị khóa tính năng tải file theo quy chế')
          }">
            ${ICONS.DOWNLOAD}
            <span>${canExport ? 'Xuất Excel' : 'Xuất Excel (Khóa)'}</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs Row -->
      <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white transition shadow-2xs" data-tab="matrix">
            Bảng Ma Trận (Tổng hợp)
          </button>
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs" data-tab="single">
            Báo Cáo Đơn Lẻ
          </button>
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs" data-tab="compare">
            So Sánh Nhiều Ngân Hàng
          </button>
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition shadow-2xs" data-tab="filter_builder">
            Lọc Điều Kiện (NH)
          </button>
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs" data-tab="backup">
            Sao Lưu Dữ Liệu
          </button>
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs" data-tab="audit">
            Lịch Sử Kiểm Toán
          </button>
          <button type="button" class="nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs" data-tab="annual">
            Cập Nhật Năm Mới
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button id="btnToggleChart" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition">
            ${ICONS.CHART}
            <span id="lblToggleChart">Mở Biểu đồ So sánh</span>
          </button>

          <button id="btnToggleFormulaDrawer" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition shadow-2xs">
            ${ICONS.FORMULA}
            <span>16 Công thức</span>
          </button>
        </div>
      </div>

    </div>
  `;

  // Attach handlers
  const btnOpenMayHemAdmin = container.querySelector('#btnOpenMayHemAdmin');
  const btnExportCSV = container.querySelector('#btnExportCSV');
  const btnToggleChart = container.querySelector('#btnToggleChart');
  const btnToggleFormula = container.querySelector('#btnToggleFormulaDrawer');

  const headerIndustrySelector = container.querySelector('#headerIndustrySelector');

  if (headerIndustrySelector) {
    populateHeaderIndustryDropdown(headerIndustrySelector, handlers.currentIndustry || 'NGAN_HANG');

    if (handlers.onIndustryChange) {
      headerIndustrySelector.addEventListener('change', (e) => {
        handlers.onIndustryChange(e.target.value);
      });
    }

    onIndustryConfigsUpdated((configs) => {
      const currentVal = headerIndustrySelector.value || handlers.currentIndustry || 'NGAN_HANG';
      populateHeaderIndustryDropdown(headerIndustrySelector, currentVal);
    });
  }

  if (btnOpenMayHemAdmin && handlers.onOpenAdminDrawer) {
    btnOpenMayHemAdmin.addEventListener('click', handlers.onOpenAdminDrawer);
  }

  const btnSoftRefreshData = container.querySelector('#btnSoftRefreshData');
  if (btnSoftRefreshData && handlers.onRefreshData) {
    btnSoftRefreshData.addEventListener('click', handlers.onRefreshData);
  }

  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', async (e) => {
      if (!auth.isLoggedIn()) {
        showToast('Vui lòng đăng nhập Hệ thống Quản trị MayHem bên phải để xuất dữ liệu.', 'error');
        if (handlers.onOpenAdminDrawer) handlers.onOpenAdminDrawer();
        return;
      }
      if (!auth.canExport()) {
        showToast('Tài khoản của bạn chỉ có quyền xem và sửa dữ liệu. Không được tải dữ liệu (Phân quyền Cấp 3).', 'error');
        return;
      }

      // Server-side Gate Verification: verify token and role against backend endpoint
      try {
        const res = await fetch('/api/v1/financial-reports/export-excel', {
          headers: auth.getAuthHeaders()
        });
        if (!res.ok) {
          const errData = await res.json();
          showToast(errData.message || 'Lỗi bảo mật (403 Forbidden): Máy chủ từ chối cấp quyền tải dữ liệu!', 'error');
          return;
        }
      } catch (netErr) {
        console.warn('Export pre-check network warning:', netErr);
      }

      if (handlers.onExportCSV) handlers.onExportCSV(e);
    });
  }

  if (handlers.onToggleChart) {
    btnToggleChart.addEventListener('click', handlers.onToggleChart);
  }
  if (handlers.onToggleFormulaDrawer) {
    btnToggleFormula.addEventListener('click', handlers.onToggleFormulaDrawer);
  }

  const btnOpenEditMetric = container.querySelector('#btnOpenEditMetricModal');
  if (btnOpenEditMetric && handlers.onOpenEditMetricModal) {
    btnOpenEditMetric.addEventListener('click', handlers.onOpenEditMetricModal);
  }

  // Navigation tab clicks
  container.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      container.querySelectorAll('.nav-tab-btn').forEach(b => {
        b.className = 'nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs';
      });
      btn.className = 'nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white transition shadow-2xs';

      if (handlers.onNavTabChange) {
        handlers.onNavTabChange(targetTab);
      }
    });
  });
}

export function updateHeaderStatus(status, text) {
  const badge = document.getElementById('headerStatusBadge');
  const label = document.getElementById('headerStatusText');
  if (!badge || !label) return;

  label.textContent = text;
  if (status === 'success') {
    badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    badge.innerHTML = `${ICONS.STATUS_DOT} <span>${text}</span>`;
  } else if (status === 'loading') {
    badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20';
    badge.innerHTML = `${ICONS.STATUS_DOT_LOADING} <span>${text}</span>`;
  } else {
    badge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20';
    badge.innerHTML = `${ICONS.STATUS_DOT_ERROR} <span>${text}</span>`;
  }
}
