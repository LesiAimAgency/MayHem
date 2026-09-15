/**
 * assets/js/components/admin-drawer.js
 * MayHem Admin System - Right Slide-over Management & Authentication Panel.
 * Rule: Zero emoji. Clean SVGs only.
 */

import { auth, DEMO_USERS, ROLE_SUPERADMIN, ROLE_EDITOR_EXPORT, ROLE_EDITOR_NO_EXPORT } from '../core/auth.js';
import { showToast } from '../core/helpers.js';

let isDrawerOpen = false;

export function initAdminDrawer(container, callbacks = {}) {
  renderDrawer(container, callbacks);

  // Subscribe to auth changes
  auth.onAuthChange(() => {
    renderDrawer(container, callbacks);
  });
}

export function openAdminDrawer() {
  const backdrop = document.getElementById('mayhemAdminBackdrop');
  const panel = document.getElementById('mayhemAdminPanel');
  if (backdrop && panel) {
    backdrop.classList.remove('hidden');
    // Force browser reflow
    void backdrop.offsetWidth;
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
    isDrawerOpen = true;
  }
}

export function closeAdminDrawer() {
  const backdrop = document.getElementById('mayhemAdminBackdrop');
  const panel = document.getElementById('mayhemAdminPanel');
  if (backdrop && panel) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      isDrawerOpen = false;
    }, 300);
  }
}

function renderDrawer(container, callbacks) {
  const isLoggedIn = auth.isLoggedIn();
  const currentUser = auth.getUser();
  const currentRole = auth.getCurrentRole();
  const roleMeta = auth.getRoleMeta();

  container.innerHTML = `
    <!-- Slide-over Backdrop -->
    <div id="mayhemAdminBackdrop" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300">
      <div class="absolute inset-0" id="mayhemAdminBackdropClick"></div>
      
      <!-- Slide-over Drawer (Right Side) -->
      <aside id="mayhemAdminPanel" class="absolute inset-y-0 right-0 max-w-full w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out font-sans overflow-hidden text-slate-800">
        
        <!-- Header: Branding & Close Button -->
        <div class="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-center justify-between gap-3 text-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-black tracking-wider text-white uppercase">ADMIN SYSTEM MAYHEM</h2>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">RBAC</span>
              </div>
              <p class="text-[11px] text-slate-300">Hệ thống Quản trị, Bảo mật & Phân quyền Báo Cáo Tài Chính</p>
            </div>
          </div>
          
          <button id="btnCloseMayHemDrawer" type="button" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Body Content -->
        <div class="flex-1 overflow-y-auto p-5 space-y-6">
          ${isLoggedIn ? renderLoggedInState(currentUser, roleMeta) : renderLoginFormState()}
        </div>

        <!-- Footer Bar -->
        <div class="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${isLoggedIn ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}"></span>
            <span>Trạng thái: <strong>${isLoggedIn ? 'Đã xác thực bảo mật' : 'Chưa đăng nhập'}</strong></span>
          </span>
          <span class="font-mono text-[11px] text-slate-400">MAMP v8.2 • vnstock_db</span>
        </div>

      </aside>
    </div>
  `;

  // Attach Event Handlers
  attachDrawerEvents(container, callbacks);
}

function renderLoginFormState() {
  return `
    <!-- Security Notice Card -->
    <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-3">
      <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      <div>
        <strong class="font-bold block text-red-800">Yêu Cầu Xác Thực Quản Trị</strong>
        <span>Dữ liệu báo cáo tài chính 29 Ngân hàng được bảo mật. Bạn cần đăng nhập để truy cập số liệu, sử dụng bộ lọc và các công cụ xuất báo cáo.</span>
      </div>
    </div>

    <!-- Login Form -->
    <form id="formMayHemLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1.5">Email tài khoản</label>
        <div class="relative">
          <input type="email" id="inputMayHemEmail" required placeholder="admin@mayhem.vn" value="admin@mayhem.vn" class="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-mono" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
        <div class="relative">
          <input type="password" id="inputMayHemPassword" required placeholder="••••••••" value="admin123" class="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-mono" />
        </div>
      </div>

      <button type="submit" id="btnSubmitLogin" class="w-full py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
        <span>Đăng Nhập Quản Trị MayHem</span>
      </button>
    </form>

    <!-- One-Click Demo Accounts -->
    <div class="pt-4 border-t border-slate-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Đăng Nhập Nhanh (3 Cấp Phân Quyền)</span>
        <span class="text-[10px] text-slate-500">Bấm để đăng nhập ngay</span>
      </div>

      <div class="space-y-2.5">
        ${DEMO_USERS.map(u => `
          <button type="button" class="btn-demo-quick-login w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition text-left flex items-center justify-between gap-3 group shadow-2xs" data-email="${u.email}" data-pass="${u.password}">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-800">${u.name}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.badgeClass}">${u.roleLabel}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${u.description}</p>
            </div>
            <svg class="w-4 h-4 text-slate-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLoggedInState(user, roleMeta) {
  const isSuperAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const canExport = auth.canExport();

  return `
    <!-- User Profile Card -->
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/20 flex-shrink-0">
          ${(user?.name || 'AD').substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-800">${user?.name || 'Quản Trị Viên'}</h3>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${roleMeta?.badgeClass || 'bg-slate-200 text-slate-700'}">
              ${roleMeta?.shortLabel || 'Admin'}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-mono mt-0.5">${user?.email || 'admin@mayhem.vn'}</p>
        </div>
      </div>
      <button id="btnMayHemLogout" type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 transition">
        Đăng Xuất
      </button>
    </div>

    <!-- Active Token / Session Badge -->
    <div class="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
      <span class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Phiên đăng nhập MayHem đang kích hoạt</span>
      </span>
      <span class="font-mono text-[11px] text-emerald-700 font-semibold">MySQL Live</span>
    </div>

    <!-- Permission Matrix (Quyền hạn theo tài khoản) -->
    <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
      <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>Ma Trận Phân Quyền Thực Tế</span>
        <span class="text-[10px] text-slate-500 font-normal">Chính sách 3 cấp</span>
      </h4>
      <div class="space-y-2 text-xs">
        <div class="flex items-center justify-between py-1 border-b border-slate-200">
          <span class="text-slate-700">1. Xem báo cáo & dùng bộ lọc 29 NH</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ĐƯỢC PHÉP</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-200">
          <span class="text-slate-700">2. Nhập & Sửa dữ liệu sau kiểm toán</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ĐƯỢC PHÉP</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-200">
          <span class="text-slate-700">3. Tải dữ liệu về file Excel</span>
          ${canExport ? `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ĐƯỢC PHÉP</span>
          ` : `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">BỊ KHÓA (Cấp 3)</span>
          `}
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-200">
          <span class="text-slate-700">4. Mở rộng năm báo cáo mới (2026+)</span>
          ${isSuperAdmin ? `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ĐƯỢC PHÉP</span>
          ` : `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">CHỈ ADMIN</span>
          `}
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-slate-700">5. Quản trị phân quyền tài khoản</span>
          ${isSuperAdmin ? `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">ĐƯỢC PHÉP</span>
          ` : `
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">CHỈ ADMIN</span>
          `}
        </div>
      </div>
    </div>

    <!-- Quick Admin Action Hub -->
    <div>
      <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
        Trung Tâm Tác Vụ Quản Trị
      </h4>
      <div class="grid grid-cols-2 gap-2.5">
        <button type="button" id="btnAdminQuickAudit" class="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col gap-1 group shadow-2xs">
          <svg class="w-5 h-5 text-indigo-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          <span class="text-xs font-bold text-slate-800 mt-1">Lịch Sử Kiểm Toán</span>
          <span class="text-[10px] text-slate-500">Xem vết chỉnh sửa</span>
        </button>

        <button type="button" id="btnAdminQuickAddYear" class="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col gap-1 group shadow-2xs ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}" ${!isSuperAdmin ? 'disabled title="Chỉ Super Admin mới có quyền mở năm mới"' : ''}>
          <svg class="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span class="text-xs font-bold text-slate-800 mt-1">Mở Rộng Năm 2026+</span>
          <span class="text-[10px] text-slate-500">${isSuperAdmin ? 'Tạo khung năm mới' : 'Khóa (Cần Admin)'}</span>
        </button>

        <button type="button" id="btnAdminQuickBackup" class="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col gap-1 group shadow-2xs">
          <svg class="w-5 h-5 text-blue-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          <span class="text-xs font-bold text-slate-800 mt-1">Sao Lưu Snapshot</span>
          <span class="text-[10px] text-slate-500">Xuất & khôi phục JSON</span>
        </button>

        <button type="button" id="btnAdminQuickFilter" class="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-left transition flex flex-col gap-1 group shadow-2xs">
          <svg class="w-5 h-5 text-purple-600 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          <span class="text-xs font-bold text-slate-800 mt-1">Bộ Lọc 32 Tiêu Chí</span>
          <span class="text-[10px] text-slate-500">Lọc điều kiện chuẩn</span>
        </button>
      </div>
    </div>

    <!-- User Management Section (Super Admin Only) -->
    ${isSuperAdmin ? `
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Quản Trị Người Dùng & Phân Quyền (3 Cấp)</h4>
          </div>
          <button id="btnToggleAddUserForm" type="button" class="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer">
            + Tạo tài khoản
          </button>
        </div>

        <!-- Add User Form (Collapsible) -->
        <form id="formAddMayHemUser" class="hidden p-3 rounded-lg bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div class="grid grid-cols-1 gap-2">
            <input type="text" id="newUserName" required placeholder="Họ và tên..." class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 focus:bg-white" />
            <input type="email" id="newUserEmail" required placeholder="Email đăng nhập..." class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 focus:bg-white" />
            <input type="password" id="newUserPass" required placeholder="Mật khẩu..." class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 focus:bg-white font-mono" />
            <select id="newUserRole" class="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 focus:bg-white">
              <option value="staff">Cấp 3: Staff (Nhập/sửa dữ liệu - KHÓA TẢI EXCEL)</option>
              <option value="editor">Cấp 2: Editor (Nhập/sửa dữ liệu - ĐƯỢC TẢI EXCEL)</option>
              <option value="admin">Cấp 1: Super Admin (Toàn quyền quản trị cao nhất)</option>
            </select>
          </div>
          <div class="flex justify-end gap-2 pt-1">
            <button id="btnCancelAddUser" type="button" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer">Hủy</button>
            <button type="submit" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-2xs cursor-pointer">Lưu tài khoản</button>
          </div>
        </form>

        <!-- Dynamic User List Container -->
        <div id="adminUserListContainer" class="space-y-2 text-xs">
          <div class="p-2 text-center text-slate-500 text-[11px]">Đang tải danh sách người dùng...</div>
        </div>
      </div>
    ` : ''}

    <!-- Quick Switch Account (Chuyển vai trò thử nghiệm) -->
    <div class="pt-4 border-t border-slate-200">
      <div class="flex items-center justify-between mb-2.5">
        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Chuyển Đổi Vai Trò Nhanh</span>
        <span class="text-[10px] text-slate-500">Thử nghiệm kiểm soát phân quyền</span>
      </div>
      <div class="space-y-2">
        ${DEMO_USERS.map(u => `
          <button type="button" class="btn-demo-quick-login w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border ${u.email === user?.email ? 'border-red-500 bg-red-50/50' : 'border-slate-200'} transition text-left flex items-center justify-between cursor-pointer" data-email="${u.email}" data-pass="${u.password}">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-800">${u.name}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${u.badgeClass}">${u.roleLabel}</span>
            </div>
            ${u.email === user?.email ? '<span class="text-[11px] font-bold text-red-600">Đang chọn</span>' : '<span class="text-[11px] text-slate-500 hover:text-slate-800">Đổi vai trò</span>'}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function attachDrawerEvents(container, callbacks) {
  // Close buttons
  const btnClose = container.querySelector('#btnCloseMayHemDrawer');
  const backdropClick = container.querySelector('#mayhemAdminBackdropClick');
  if (btnClose) btnClose.addEventListener('click', closeAdminDrawer);
  if (backdropClick) backdropClick.addEventListener('click', closeAdminDrawer);

  // Login Form submit
  const formLogin = container.querySelector('#formMayHemLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#inputMayHemEmail').value.trim();
      const password = container.querySelector('#inputMayHemPassword').value;
      const btnSubmit = container.querySelector('#btnSubmitLogin');

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span><span>Đang xác thực...</span>`;
      }

      const res = await auth.login(email, password);
      if (res.success) {
        showToast(res.message, 'success');
        if (callbacks.onLoginSuccess) callbacks.onLoginSuccess(res.user);
        closeAdminDrawer();
      } else {
        showToast(res.message, 'error');
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = `<span>Đăng Nhập Quản Trị MayHem</span>`;
        }
      }
    });
  }

  // Quick 1-Click Demo Login buttons
  container.querySelectorAll('.btn-demo-quick-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.getAttribute('data-email');
      const pass = btn.getAttribute('data-pass');
      
      btn.classList.add('opacity-50');
      const res = await auth.login(email, pass);
      if (res.success) {
        showToast(res.message, 'success');
        if (callbacks.onLoginSuccess) callbacks.onLoginSuccess(res.user);
        closeAdminDrawer();
      } else {
        showToast(res.message, 'error');
        btn.classList.remove('opacity-50');
      }
    });
  });

  // Logout button
  const btnLogout = container.querySelector('#btnMayHemLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      await auth.logout();
      showToast('Đã đăng xuất khỏi Hệ thống Quản trị MayHem. Dữ liệu đã được khóa.', 'info');
      if (callbacks.onLogout) callbacks.onLogout();
      renderDrawer(container, callbacks);
    });
  }

  // Quick Action Hub Buttons
  const btnAdminQuickAudit = container.querySelector('#btnAdminQuickAudit');
  if (btnAdminQuickAudit && callbacks.onOpenAudit) {
    btnAdminQuickAudit.addEventListener('click', () => {
      closeAdminDrawer();
      callbacks.onOpenAudit();
    });
  }

  const btnAdminQuickAddYear = container.querySelector('#btnAdminQuickAddYear');
  if (btnAdminQuickAddYear && callbacks.onOpenAddYear) {
    btnAdminQuickAddYear.addEventListener('click', () => {
      if (!auth.can('canAddYear')) {
        showToast('Chỉ Quản trị viên cấp 1 (Super Admin) mới có quyền mở rộng năm mới.', 'error');
        return;
      }
      closeAdminDrawer();
      callbacks.onOpenAddYear();
    });
  }

  const btnAdminQuickBackup = container.querySelector('#btnAdminQuickBackup');
  if (btnAdminQuickBackup && callbacks.onOpenBackup) {
    btnAdminQuickBackup.addEventListener('click', () => {
      closeAdminDrawer();
      callbacks.onOpenBackup();
    });
  }

  const btnAdminQuickFilter = container.querySelector('#btnAdminQuickFilter');
  if (btnAdminQuickFilter && callbacks.onOpenFilterBuilder) {
    btnAdminQuickFilter.addEventListener('click', () => {
      closeAdminDrawer();
      callbacks.onOpenFilterBuilder();
    });
  }

  // Super Admin: User Management Handlers
  const userListContainer = container.querySelector('#adminUserListContainer');
  const formAddUser = container.querySelector('#formAddMayHemUser');
  const btnToggleAdd = container.querySelector('#btnToggleAddUserForm');
  const btnCancelAdd = container.querySelector('#btnCancelAddUser');

  if (btnToggleAdd && formAddUser) {
    btnToggleAdd.addEventListener('click', () => {
      formAddUser.classList.toggle('hidden');
    });
  }
  if (btnCancelAdd && formAddUser) {
    btnCancelAdd.addEventListener('click', () => {
      formAddUser.classList.add('hidden');
    });
  }

  const loadUsersList = async () => {
    if (!userListContainer) return;
    try {
      const res = await fetch('/api/v1/auth/users', {
        headers: auth.getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        const users = json.data || [];
        userListContainer.innerHTML = users.map(u => `
          <div class="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-slate-800 text-xs">${u.name}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  u.role === 'editor' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }">${u.role === 'admin' ? 'Cấp 1: Admin' : u.role === 'editor' ? 'Cấp 2: Editor (Export)' : 'Cấp 3: Staff (No Export)'}</span>
              </div>
              <span class="text-[11px] text-slate-500 font-mono">${u.email}</span>
            </div>
            <div class="flex items-center gap-1">
              <select class="sel-user-role-change bg-slate-50 border border-slate-300 text-slate-800 text-[10px] rounded px-1.5 py-1 outline-none font-semibold cursor-pointer" data-user-id="${u.id}">
                <option value="staff" ${u.role === 'staff' ? 'selected' : ''}>Cấp 3 (Staff)</option>
                <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Cấp 2 (Editor)</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Cấp 1 (Admin)</option>
              </select>
              ${u.id > 1 ? `
                <button type="button" class="btn-delete-user text-rose-500 hover:text-rose-700 p-1 text-xs transition cursor-pointer" data-user-id="${u.id}" title="Xóa tài khoản">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              ` : ''}
            </div>
          </div>
        `).join('');

        // Attach role change
        userListContainer.querySelectorAll('.sel-user-role-change').forEach(sel => {
          sel.addEventListener('change', async () => {
            const uId = sel.getAttribute('data-user-id');
            const newRole = sel.value;
            try {
              const r = await fetch(`/api/v1/auth/users/${uId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
                body: JSON.stringify({ role: newRole })
              });
              const d = await r.json();
              if (d.success) {
                showToast(`Đã đổi vai trò sang ${newRole}!`, 'success');
                loadUsersList();
              } else {
                showToast(d.message || 'Lỗi phân quyền', 'error');
              }
            } catch (e) {
              showToast('Lỗi cập nhật vai trò', 'error');
            }
          });
        });

        // Attach delete user
        userListContainer.querySelectorAll('.btn-delete-user').forEach(btn => {
          btn.addEventListener('click', async () => {
            const uId = btn.getAttribute('data-user-id');
            if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
            try {
              const r = await fetch(`/api/v1/auth/users/${uId}`, {
                method: 'DELETE',
                headers: auth.getAuthHeaders()
              });
              const d = await r.json();
              if (d.success) {
                showToast(d.message, 'success');
                loadUsersList();
              } else {
                showToast(d.message || 'Lỗi xóa người dùng', 'error');
              }
            } catch (e) {
              showToast('Lỗi xóa người dùng', 'error');
            }
          });
        });
      }
    } catch (e) {
      if (userListContainer) userListContainer.innerHTML = '<div class="p-2 text-slate-500 text-center">Không thể nạp danh sách user.</div>';
    }
  };

  if (userListContainer) {
    loadUsersList();
  }

  // Create User submit
  if (formAddUser) {
    formAddUser.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = container.querySelector('#newUserName').value.trim();
      const email = container.querySelector('#newUserEmail').value.trim();
      const password = container.querySelector('#newUserPass').value;
      const role = container.querySelector('#newUserRole').value;

      try {
        const res = await fetch('/api/v1/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
          body: JSON.stringify({ name, email, password, role })
        });
        const d = await res.json();
        if (d.success) {
          showToast(`Đã tạo tài khoản ${name} (${role}) thành công!`, 'success');
          formAddUser.reset();
          formAddUser.classList.add('hidden');
          loadUsersList();
        } else {
          showToast(d.message || 'Lỗi tạo tài khoản', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối máy chủ', 'error');
      }
    });
  }
}
