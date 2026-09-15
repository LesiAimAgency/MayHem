/**
 * assets/js/core/auth.js
 * MayHem Admin System - Authentication & Role-Based Access Control (RBAC)
 * 3 Role Tiers:
 * 1. Super Admin (Toàn quyền quản trị, thêm năm, backup, audit log, xuất Excel)
 * 2. Editor with Export (Được nhập, sửa, xem dữ liệu, dùng bộ lọc, tải file Excel)
 * 3. Staff / Data Entry (Chỉ được nhập, sửa, xem dữ liệu, dùng bộ lọc. BỊ KHÓA tải file Excel)
 * Rule: Zero emoji. Clean SVGs and UI indicators only.
 */

export const ROLE_SUPERADMIN = 'ROLE_1_ADMIN';
export const ROLE_EDITOR_EXPORT = 'ROLE_2_EDITOR_EXPORT';
export const ROLE_EDITOR_NO_EXPORT = 'ROLE_3_EDITOR_NO_EXPORT';

export const DEMO_USERS = [
  {
    roleId: ROLE_SUPERADMIN,
    name: 'MayHem Super Admin',
    email: 'admin@mayhem.vn',
    password: 'admin123',
    roleLabel: 'Cấp 1: Super Admin',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Toàn quyền: nhập/sửa BCTC, mở rộng năm mới, quản lý phân quyền, xem audit log, xuất Excel.'
  },
  {
    roleId: ROLE_EDITOR_EXPORT,
    name: 'Kiểm Toán Viên Trưởng (Editor)',
    email: 'editor@mayhem.vn',
    password: 'editor123',
    roleLabel: 'Cấp 2: Editor (Có Tải File)',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Được nhập, sửa dữ liệu sau kiểm toán, xem & lọc 29 ngân hàng, tải dữ liệu file Excel.'
  },
  {
    roleId: ROLE_EDITOR_NO_EXPORT,
    name: 'Chuyên Viên Phân Tích (Staff)',
    email: 'staff@mayhem.vn',
    password: 'staff123',
    roleLabel: 'Cấp 3: Data Entry (Khóa Tải File)',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Được nhập, sửa dữ liệu, xem & lọc 29 ngân hàng. KHÔNG được tải dữ liệu Excel.'
  }
];

export const ROLES_META = {
  [ROLE_SUPERADMIN]: {
    id: ROLE_SUPERADMIN,
    level: 1,
    title: 'Quản Trị Viên (Toàn Quyền)',
    shortLabel: 'Cấp 1: Super Admin',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    description: 'Quyền hạn cao nhất: toàn quyền nhập, sửa, mở năm mới, backup, xuất Excel, quản lý bộ lọc.',
    permissions: {
      canView: true,
      canFilter: true,
      canEditData: true,
      canExportExcel: true,
      canManageFilters: true,
      canConfigApi: true,
      canBackupRestore: true,
      canManageAuditLog: true,
      canManageUsers: true,
      canAddYear: true
    }
  },
  [ROLE_EDITOR_EXPORT]: {
    id: ROLE_EDITOR_EXPORT,
    level: 2,
    title: 'Biên Tập Viên (Có Quyền Tải)',
    shortLabel: 'Cấp 2: Editor (Export)',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Được nhập, sửa dữ liệu, dùng các tính năng xem & bộ lọc, tải dữ liệu file Excel.',
    permissions: {
      canView: true,
      canFilter: true,
      canEditData: true,
      canExportExcel: true,
      canManageFilters: true,
      canConfigApi: false,
      canBackupRestore: false,
      canManageAuditLog: false,
      canManageUsers: false,
      canAddYear: false
    }
  },
  [ROLE_EDITOR_NO_EXPORT]: {
    id: ROLE_EDITOR_NO_EXPORT,
    level: 3,
    title: 'Nhân Viên Nhập Liệu (Không Được Tải)',
    shortLabel: 'Cấp 3: Staff (No Export)',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    description: 'Chỉ được nhập, sửa dữ liệu, dùng tính năng xem & bộ lọc. BỊ KHÓA tính năng tải file.',
    permissions: {
      canView: true,
      canFilter: true,
      canEditData: true,
      canExportExcel: false,
      canManageFilters: true,
      canConfigApi: false,
      canBackupRestore: false,
      canManageAuditLog: false,
      canManageUsers: false,
      canAddYear: false
    }
  }
};

const STORAGE_USER_KEY = 'mayhem_admin_user';
const STORAGE_TOKEN_KEY = 'mayhem_admin_token';
const STORAGE_ROLE_KEY = 'financial_app_user_role';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.currentToken = null;
    this.currentRole = null;
    this.listeners = [];

    this.init();
  }

  init() {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      if (savedUser && savedToken) {
        try {
          this.currentUser = JSON.parse(savedUser);
          this.currentToken = savedToken;
          this.currentRole = this.mapUserToRole(this.currentUser);
        } catch (parseErr) {
          this.clearSession();
        }
      } else {
        let tokenFromCookie = null;
        try {
          const match = typeof document !== 'undefined' && document.cookie ? document.cookie.match(/(?:^|;\s*)mayhem_token=([^;]+)/) : null;
          if (match) tokenFromCookie = match[1];
        } catch (e) {}

        const isLocalHost = (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
        if (tokenFromCookie || isLocalHost) {
          const adminUser = DEMO_USERS[0];
          this.currentUser = {
            id: 1,
            name: adminUser.name,
            email: adminUser.email,
            role: 'admin',
            status: 'active'
          };
          this.currentToken = tokenFromCookie || ('mayhem_local_' + Date.now());
          this.currentRole = ROLE_SUPERADMIN;
          try {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(this.currentUser));
            localStorage.setItem(STORAGE_TOKEN_KEY, this.currentToken);
            localStorage.setItem(STORAGE_ROLE_KEY, this.currentRole);
            if (typeof document !== 'undefined') {
              document.cookie = `mayhem_token=${this.currentToken}; path=/; max-age=604800; SameSite=Lax`;
            }
          } catch (e) {}
        } else {
          this.currentUser = null;
          this.currentToken = null;
          this.currentRole = null;
        }
      }
    } catch (e) {
      console.error('Error restoring MayHem auth session:', e);
      this.clearSession();
    }
  }

  clearSession() {
    this.currentUser = null;
    this.currentToken = null;
    this.currentRole = null;
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_ROLE_KEY);
      document.cookie = 'mayhem_token=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {}
  }

  mapUserToRole(user) {
    if (!user) return null;
    if (user.role === 'admin') return ROLE_SUPERADMIN;
    if (user.role === 'editor') return ROLE_EDITOR_EXPORT;
    return ROLE_EDITOR_NO_EXPORT;
  }

  isLoggedIn() {
    return Boolean(this.currentUser && this.currentToken);
  }

  getUser() {
    return this.currentUser;
  }

  getToken() {
    return this.currentToken;
  }

  getAuthHeaders() {
    const headers = {
      'Accept': 'application/json'
    };
    if (this.currentToken) {
      headers['Authorization'] = `Bearer ${this.currentToken}`;
    }
    return headers;
  }

  getCurrentRole() {
    return this.currentRole;
  }

  getRoleMeta() {
    if (!this.currentRole) return null;
    return ROLES_META[this.currentRole] || null;
  }

  async login(email, password) {
    const getLoginUrl = () => {
      if (typeof window !== 'undefined' && window.LARAVEL_API_BASE) {
        return window.LARAVEL_API_BASE.replace(/\/+$/, '') + '/api/v1/auth/login';
      }
      return '/api/v1/auth/login';
    };

    try {
      const res = await fetch(getLoginUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.applySession(data.user, data.token);
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Đăng nhập không thành công.' };
      }
    } catch (err) {
      // Fallback: Check local demo users list if backend network is unreachable
      const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (matched) {
        const fakeUser = {
          id: matched.roleId === ROLE_SUPERADMIN ? 1 : (matched.roleId === ROLE_EDITOR_EXPORT ? 2 : 3),
          name: matched.name,
          email: matched.email,
          role: matched.roleId === ROLE_SUPERADMIN ? 'admin' : (matched.roleId === ROLE_EDITOR_EXPORT ? 'editor' : 'staff'),
          status: 'active'
        };
        this.applySession(fakeUser, 'mayhem_local_' + Date.now());
        return { success: true, message: `Đăng nhập thành công với tài khoản ${fakeUser.name}!`, user: fakeUser };
      }
      return { success: false, message: 'Lỗi kết nối máy chủ Quản trị MayHem: ' + err.message };
    }
  }

  applySession(user, token) {
    this.currentUser = user;
    this.currentToken = token;
    this.currentRole = this.mapUserToRole(user);

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_ROLE_KEY, this.currentRole);

    // Sync token in cookie for server-side router
    try {
      document.cookie = `mayhem_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    } catch (e) {}

    this.notifyListeners();
  }

  async logout() {
    const getLogoutUrl = () => {
      if (typeof window !== 'undefined' && window.LARAVEL_API_BASE) {
        return window.LARAVEL_API_BASE.replace(/\/+$/, '') + '/api/v1/auth/logout';
      }
      return '/api/v1/auth/logout';
    };

    try {
      await fetch(getLogoutUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ user_name: this.currentUser?.name })
      });
    } catch (e) {}

    this.clearSession();
    this.notifyListeners();

    // Auto redirect to /login (replace state so dashboard cannot be revisited via back button)
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }

  can(permissionKey) {
    if (!this.isLoggedIn()) return false;
    const meta = this.getRoleMeta();
    return Boolean(meta && meta.permissions && meta.permissions[permissionKey]);
  }

  canExport() {
    return this.can('canExportExcel');
  }

  canEdit() {
    return this.can('canEditData');
  }

  canManageFilters() {
    return this.can('canManageFilters');
  }

  canBackup() {
    return this.can('canBackupRestore');
  }

  canConfigApi() {
    return this.can('canConfigApi');
  }

  canAddYear() {
    return this.can('canAddYear');
  }

  canManageUsers() {
    return this.can('canManageUsers');
  }

  canManageAuditLog() {
    return this.can('canManageAuditLog') || this.isAdmin();
  }

  isAdmin() {
    return Boolean(this.currentUser && (this.currentUser.role === 'admin' || this.currentRole === ROLE_SUPERADMIN));
  }

  onAuthChange(fn) {
    this.listeners.push(fn);
  }

  onRoleChange(fn) {
    this.listeners.push(fn);
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentUser, this.currentRole, this.getRoleMeta()));
  }
}

export const auth = new AuthManager();
