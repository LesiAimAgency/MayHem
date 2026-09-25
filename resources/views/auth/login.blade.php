<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đăng Nhập • MayHem Financial Analytics</title>
  <meta name="description" content="Cổng đăng nhập hệ thống phân tích BCTC và sàng lọc cổ phiếu ngân hàng MayHem.">
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <!-- Google Fonts: Be Vietnam Pro & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              navy: '#051650',
              slate: '#222D5E',
              gold: '#C8997D',
              goldHover: '#B68569'
            },
            app: {
              bg: '#F2F2F2',
              surface: '#FFFFFF',
              warm: '#F8F3EC',
              gray: '#F3F3F3'
            }
          },
          fontFamily: {
            sans: ['"Be Vietnam Pro"', '"Inter"', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Be Vietnam Pro', 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-[#F2F2F2] text-[#323232] min-h-screen flex flex-col justify-between font-sans antialiased">

  <!-- Minimal Header -->
  <header class="w-full bg-[#F2F2F2] border-b border-[#D7D7D7]/50">
    <div class="max-w-[1440px] mx-auto px-9 h-[80px] flex items-center justify-between">
      <!-- Logo MAYHEM -->
      <a href="/" class="flex items-center group select-none shrink-0" title="MAYHEM - Trang chủ">
      <img src="{{ asset('assets/images/Logo.svg') }}"
           alt="MAYHEM"
           width="239"
           height="60"
           class="w-[239px] h-[60px] object-contain transition-transform group-hover:scale-[1.02] block">
    </a>

      <!-- Security Status Badge -->
      <div class="flex items-center gap-2 text-xs text-[#818181]">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-medium text-[#051650]">Hệ Thống Phân Tích BCTC Live Database</span>
      </div>
    </div>
  </header>

  <!-- Main Login Card Container -->
  <main class="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
    <div class="w-full max-w-md flex flex-col gap-6">

      <!-- Login Form Card -->
      <div class="bg-white border border-[#D7D7D7]/80 rounded-2xl p-7 sm:p-8 shadow-sm relative overflow-hidden">
        
        <!-- Subtle Top Border Brand Accent -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#051650] via-[#C8997D] to-[#051650]"></div>

        <div class="text-center mb-6 pt-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F8F3EC] border border-[#C8997D]/50 text-[#051650] mb-3 shadow-xs">
            <svg class="w-6 h-6 text-[#051650]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-[#051650]">Đăng Nhập MayHem</h1>
          <p class="text-xs text-[#818181] mt-1">Nền tảng phân tích tài chính & sàng lọc cổ phiếu ngân hàng</p>
        </div>

        <!-- Alert Error Message Box -->
        <div id="loginAlertBox" class="hidden mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span id="loginAlertText">Email hoặc mật khẩu không chính xác.</span>
        </div>

        <!-- Form -->
        <form id="loginForm" class="space-y-4">
          <div>
            <label for="inpEmail" class="block text-xs font-semibold text-[#051650] mb-1.5">Email tài khoản *</label>
            <input type="email" id="inpEmail" required autocomplete="email" placeholder="admin@mayhem.vn" 
                   class="w-full bg-[#F8F9FA] border border-[#D7D7D7] text-[#323232] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#051650] focus:ring-1 focus:ring-[#051650] focus:bg-white transition" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="inpPassword" class="block text-xs font-semibold text-[#051650]">Mật khẩu *</label>
              <span class="text-[10px] text-[#818181]">Mã hóa Bcrypt</span>
            </div>
            <input type="password" id="inpPassword" required autocomplete="current-password" placeholder="••••••••" 
                   class="w-full bg-[#F8F9FA] border border-[#D7D7D7] text-[#323232] text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#051650] focus:ring-1 focus:ring-[#051650] focus:bg-white transition" />
          </div>

          <div class="flex items-center justify-between pt-1 text-xs">
            <label class="flex items-center gap-2 cursor-pointer text-[#818181] select-none">
              <input type="checkbox" id="chkRemember" checked class="w-4 h-4 rounded border-[#D7D7D7] text-[#051650] focus:ring-0 accent-[#051650]" />
              <span>Ghi nhớ phiên làm việc</span>
            </label>
            <a href="#" class="text-[11px] text-[#051650] hover:underline font-medium">Quên mật khẩu?</a>
          </div>

          <button type="submit" id="btnLoginSubmit" 
                  class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#051650] hover:bg-[#0E2168] text-white font-bold text-xs shadow-sm transition active:scale-[0.99] disabled:opacity-50">
            <span id="btnSubmitText">ĐĂNG NHẬP VÀO HỆ THỐNG</span>
            <svg id="btnSubmitIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>

        <!-- 1-Click Quick Fill Demo Accounts -->
        <div class="mt-6 pt-5 border-t border-[#E9ECEF]">
          <span class="block text-[11px] font-bold text-[#818181] uppercase tracking-wider mb-2.5 text-center">
            Chọn nhanh tài khoản thử nghiệm (1-Click Login):
          </span>
          
          <div class="grid grid-cols-3 gap-2">
            <!-- Role 1: Admin -->
            <button type="button" class="btn-quick-fill text-left p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#F8F3EC] border border-[#E9ECEF] hover:border-[#C8997D] transition flex flex-col gap-1 group" 
                    data-email="admin@mayhem.vn" data-pass="admin123">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-[#051650]">Admin</span>
                <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </div>
              <span class="text-[9px] text-[#818181] truncate">admin@mayhem.vn</span>
              <span class="text-[9px] text-red-600 font-semibold">Toàn quyền</span>
            </button>

            <!-- Role 2: Editor -->
            <button type="button" class="btn-quick-fill text-left p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#F8F3EC] border border-[#E9ECEF] hover:border-[#C8997D] transition flex flex-col gap-1 group" 
                    data-email="editor@mayhem.vn" data-pass="editor123">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-[#051650]">Editor</span>
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </div>
              <span class="text-[9px] text-[#818181] truncate">editor@mayhem.vn</span>
              <span class="text-[9px] text-blue-600 font-semibold">Kiểm toán</span>
            </button>

            <!-- Role 3: Staff -->
            <button type="button" class="btn-quick-fill text-left p-2.5 rounded-xl bg-[#F8F9FA] hover:bg-[#F8F3EC] border border-[#E9ECEF] hover:border-[#C8997D] transition flex flex-col gap-1 group" 
                    data-email="staff@mayhem.vn" data-pass="staff123">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-[#051650]">Staff</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <span class="text-[9px] text-[#818181] truncate">staff@mayhem.vn</span>
              <span class="text-[9px] text-emerald-600 font-semibold">Chuyên viên</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Security Guarantees Footer -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#818181] text-center">
        <div class="p-2 rounded-lg bg-white border border-[#D7D7D7]/70 shadow-xs">
          <span class="text-[#051650] font-bold block">RBAC 3 Cấp</span>
          <span>Phân quyền bảo mật</span>
        </div>
        <div class="p-2 rounded-lg bg-white border border-[#D7D7D7]/70 shadow-xs">
          <span class="text-[#051650] font-bold block">Bcrypt Auth</span>
          <span>Mã hóa một chiều</span>
        </div>
        <div class="p-2 rounded-lg bg-white border border-[#D7D7D7]/70 shadow-xs">
          <span class="text-[#051650] font-bold block">28 Ngân Hàng</span>
          <span>BCTC 2018 - 2025</span>
        </div>
        <div class="p-2 rounded-lg bg-white border border-[#D7D7D7]/70 shadow-xs">
          <span class="text-[#051650] font-bold block">Live Database</span>
          <span>Đồng bộ thời gian thực</span>
        </div>
      </div>

    </div>
  </main>

  <!-- Minimal Footer -->
  <footer class="w-full bg-white border-t border-[#D7D7D7]/60 py-4 mt-auto">
    <div class="max-w-[1440px] mx-auto px-9 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#818181]">
      <div>
        <strong class="text-[#051650]">MAYHEM FINANCIAL</strong> &copy; 2026. All rights reserved.
      </div>
      <div class="flex items-center gap-4">
        <a href="{{ route('reports.overview') }}" class="hover:text-[#051650]">Báo Cáo Tổng Hợp</a>
        <span>&bull;</span>
        <a href="{{ route('reports.factsheet') }}" class="hover:text-[#051650]">Báo Cáo Đơn Lẻ</a>
        <span>&bull;</span>
        <a href="{{ route('reports.comparison') }}" class="hover:text-[#051650]">So Sánh</a>
      </div>
    </div>
  </footer>

  <!-- Self-Contained Login Logic Script (Zero external file dependencies) -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const loginForm = document.getElementById('loginForm');
      const inpEmail = document.getElementById('inpEmail');
      const inpPassword = document.getElementById('inpPassword');
      const btnSubmit = document.getElementById('btnLoginSubmit');
      const btnText = document.getElementById('btnSubmitText');
      const alertBox = document.getElementById('loginAlertBox');
      const alertText = document.getElementById('loginAlertText');

      // Quick fill button handlers: fill credentials and submit automatically
      document.querySelectorAll('.btn-quick-fill').forEach(btn => {
        btn.addEventListener('click', () => {
          inpEmail.value = btn.getAttribute('data-email');
          inpPassword.value = btn.getAttribute('data-pass');
          loginForm.requestSubmit();
        });
      });

      // Form submission handler
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertBox.classList.add('hidden');

        const email = inpEmail.value.trim();
        const password = inpPassword.value;

        btnSubmit.disabled = true;
        btnText.textContent = 'Đang xác thực bảo mật...';

        try {
          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (res.ok && data.success) {
            btnText.textContent = 'Đăng nhập thành công! Đang chuyển hướng...';
            btnSubmit.classList.remove('bg-[#051650]', 'hover:bg-[#0E2168]');
            btnSubmit.classList.add('bg-emerald-600');

            // Set cookie for browser session
            if (data.token) {
              document.cookie = `mayhem_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
            }

            setTimeout(() => {
              window.location.href = data.redirect || "{{ route('reports.overview') }}";
            }, 300);
          } else {
            alertText.textContent = data.message || 'Email hoặc mật khẩu không chính xác.';
            alertBox.classList.remove('hidden');
            btnSubmit.disabled = false;
            btnText.textContent = 'ĐĂNG NHẬP VÀO HỆ THỐNG';
          }
        } catch (err) {
          alertText.textContent = 'Lỗi kết nối máy chủ: ' + err.message;
          alertBox.classList.remove('hidden');
          btnSubmit.disabled = false;
          btnText.textContent = 'ĐĂNG NHẬP VÀO HỆ THỐNG';
        }
      });
    });
  </script>

</body>
</html>
