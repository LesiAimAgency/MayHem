<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Đăng Nhập • Hệ Thống Quản Trị BCTC MayHem</title>

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    };
  </script>

  <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}" />
  <link rel="stylesheet" href="{{ asset('assets/css/components.css') }}" />

  <script>
    window.LARAVEL_API_BASE = "{{ url('/') }}";
  </script>
</head>
<body class="bg-[#070b14] text-slate-100 min-h-screen flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">

  <!-- Top Ambient Glow -->
  <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none"></div>

  <!-- Header -->
  <header class="relative z-10 px-6 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/20">
        M
      </div>
      <div>
        <h1 class="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
          MayHem Financial Admin
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">V2.0 Core</span>
        </h1>
        <p class="text-[11px] text-slate-400">Cổng Đăng Nhập & Phân Quyền Báo Cáo Tài Chính 29 Ngân Hàng</p>
      </div>
    </div>

    <div class="flex items-center gap-2 text-xs text-slate-400 font-mono">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Hệ thống bảo mật RBAC</span>
    </div>
  </header>

  <!-- Main Login Card Container -->
  <main class="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
    <div class="w-full max-w-xl flex flex-col gap-6">

      <!-- Login Form Card -->
      <div class="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        <!-- Subtle Top Border Highlight -->
        <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 class="text-lg font-bold text-slate-100">Đăng Nhập Quản Trị MayHem</h2>
          <p class="text-xs text-slate-400 mt-1">Truy cập để quản lý ma trận BCTC, trích xuất dữ liệu và quản trị bộ lọc ngành</p>
        </div>

        <!-- Alert Error Message Box -->
        <div id="loginAlertBox" class="hidden mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <svg class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span id="loginAlertText">Tên đăng nhập hoặc mật khẩu không chính xác.</span>
        </div>

        <!-- Form -->
        <form id="loginForm" class="space-y-4">
          <div>
            <label for="inpEmail" class="block text-xs font-semibold text-slate-300 mb-1.5">Email tài khoản:</label>
            <div class="relative">
              <input type="email" id="inpEmail" required autocomplete="email" placeholder="admin@mayhem.vn" class="w-full bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono" />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="inpPassword" class="block text-xs font-semibold text-slate-300">Mật khẩu:</label>
              <span class="text-[11px] text-slate-500 font-mono">Được mã hóa Bcrypt</span>
            </div>
            <div class="relative">
              <input type="password" id="inpPassword" required autocomplete="current-password" placeholder="••••••••" class="w-full bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono" />
            </div>
          </div>

          <div class="flex items-center justify-between pt-1 text-xs">
            <label class="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
              <input type="checkbox" id="chkRemember" checked class="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0" />
              <span>Ghi nhớ phiên làm việc (7 ngày)</span>
            </label>
            <span class="text-[11px] text-slate-500">Rate limit: 10 req/phút</span>
          </div>

          <button type="submit" id="btnLoginSubmit" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition active:scale-[0.99] disabled:opacity-50">
            <span id="btnSubmitText">Đăng Nhập Vào Hệ Thống</span>
            <svg id="btnSubmitIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </form>

        <!-- Quick 1-Click Demo Accounts -->
        <div class="mt-6 pt-5 border-t border-slate-800/80">
          <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">Hoặc chọn nhanh tài khoản thử nghiệm (1-Click Login):</span>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <!-- Role 1: Admin -->
            <button type="button" class="btn-quick-fill text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 transition flex flex-col gap-1 group" data-email="admin@mayhem.vn" data-pass="admin123">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-rose-300">Cấp 1: Admin</span>
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono truncate">admin@mayhem.vn</span>
              <span class="text-[9px] text-slate-500">Toàn quyền, mở năm, backup</span>
            </button>

            <!-- Role 2: Editor -->
            <button type="button" class="btn-quick-fill text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 transition flex flex-col gap-1 group" data-email="editor@mayhem.vn" data-pass="editor123">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-blue-300">Cấp 2: Editor</span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono truncate">editor@mayhem.vn</span>
              <span class="text-[9px] text-slate-500">Sửa BCTC, ĐƯỢC tải Excel</span>
            </button>

            <!-- Role 3: Staff -->
            <button type="button" class="btn-quick-fill text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition flex flex-col gap-1 group" data-email="staff@mayhem.vn" data-pass="staff123">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-amber-300">Cấp 3: Staff</span>
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono truncate">staff@mayhem.vn</span>
              <span class="text-[9px] text-slate-500">Xem & lọc, KHÓA xuất file</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Security Guarantees Footer -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 text-center">
        <div class="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <span class="text-slate-300 font-semibold block">RBAC 3 Cấp</span>
          <span>Phân quyền chặt chẽ</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <span class="text-slate-300 font-semibold block">Server Token</span>
          <span>Xác thực tại máy chủ</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <span class="text-slate-300 font-semibold block">Rate Limiting</span>
          <span>Chống Brute Force</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-950/40 border border-slate-800/50">
          <span class="text-slate-300 font-semibold block">Chữ Ký HMAC</span>
          <span>Bảo vệ bản sao lưu</span>
        </div>
      </div>

    </div>
  </main>



  <!-- Login Logic Script -->
  <script type="module">
    import { auth } from '{{ asset("assets/js/core/auth.js") }}';

    const loginForm = document.getElementById('loginForm');
    const inpEmail = document.getElementById('inpEmail');
    const inpPassword = document.getElementById('inpPassword');
    const btnSubmit = document.getElementById('btnLoginSubmit');
    const btnText = document.getElementById('btnSubmitText');
    const alertBox = document.getElementById('loginAlertBox');
    const alertText = document.getElementById('loginAlertText');

    // Quick fill handlers
    document.querySelectorAll('.btn-quick-fill').forEach(btn => {
      btn.addEventListener('click', () => {
        inpEmail.value = btn.getAttribute('data-email');
        inpPassword.value = btn.getAttribute('data-pass');
        inpEmail.focus();
      });
    });

    // Submit handler
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.classList.add('hidden');

      const email = inpEmail.value.trim();
      const password = inpPassword.value;

      btnSubmit.disabled = true;
      btnText.textContent = 'Đang xác thực bảo mật...';

      try {
        const res = await auth.login(email, password);
        if (res.success) {
          btnText.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';
          btnSubmit.classList.remove('bg-blue-600', 'hover:bg-blue-500');
          btnSubmit.classList.add('bg-emerald-600');

          // Sync token cookie for server-side router guard
          const token = auth.getToken();
          if (token) {
            document.cookie = `mayhem_token=${token}; path=/; max-age=604800; SameSite=Lax`;
          }

          setTimeout(() => {
            window.location.href = '/';
          }, 400);
        } else {
          alertText.textContent = res.message || 'Email hoặc mật khẩu không chính xác.';
          alertBox.classList.remove('hidden');
          btnSubmit.disabled = false;
          btnText.textContent = 'Đăng Nhập Vào Hệ Thống';
        }
      } catch (err) {
        alertText.textContent = 'Lỗi kết nối máy chủ quản trị: ' + err.message;
        alertBox.classList.remove('hidden');
        btnSubmit.disabled = false;
        btnText.textContent = 'Đăng Nhập Vào Hệ Thống';
      }
    });
  </script>

</body>
</html>
