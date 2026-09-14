<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bảng Quản Trị & Đối Chiếu Báo Cáo Tài Chính 29 Ngân Hàng Việt Nam - Laravel</title>
  
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
          },
          colors: {
            navy: {
              800: '#0f182b',
              900: '#0a101d',
              950: '#070b14'
            }
          }
        }
      }
    };
  </script>

  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- External Stylesheets -->
  <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}" />
  <link rel="stylesheet" href="{{ asset('assets/css/components.css') }}" />

  <script>
    window.LARAVEL_API_BASE = "{{ url('/') }}";
    // Immediate pre-flight client auth guard: redirect immediately if unauthenticated
    (function() {
      try {
        const token = localStorage.getItem('mayhem_admin_token');
        const user = localStorage.getItem('mayhem_admin_user');
        if (!token || !user) {
          window.location.replace('/login');
        }
      } catch (e) {
        window.location.replace('/login');
      }
    })();
  </script>
</head>
<body class="bg-slate-100 text-slate-800 min-h-screen flex flex-col font-sans antialiased">

  <!-- Header Bar -->
  <header id="app-header" class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-2xs">
    <!-- Rendered dynamically by assets/js/components/header.js -->
  </header>

  <!-- Direct File Protocol Notice Banner (Fallback for file:/// openings) -->
  <div id="directFileNoticeBanner" class="hidden bg-blue-50 border-b border-blue-200 px-4 py-2.5 text-xs text-blue-900">
    <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
        <span>Đang mở trực tiếp: Vui lòng chọn file <strong>BaoCaoTaiChinh_NganHang_30ChiTieu.json</strong> để nạp dữ liệu tức thì.</span>
      </div>
      <input type="file" id="fileDirectInput" accept=".json" class="hidden" />
      <button id="btnDirectUpload" type="button" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition">
        Chọn file JSON ngay
      </button>
    </div>
  </div>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-5 flex flex-col gap-5">
    
    <!-- Section 2: Visual Chart (Collapsible) -->
    <section id="chart-section" aria-label="Biểu đồ trực quan">
      <!-- Rendered dynamically by assets/js/components/charts.js -->
    </section>

    <!-- Section 3: Filter & Search Controls -->
    <section id="filter-section" aria-label="Bộ lọc dữ liệu">
      <!-- Rendered dynamically by assets/js/components/filters.js -->
    </section>

    <!-- Section 4: Main Financial Matrix Table -->
    <section id="table-section" aria-label="Bảng dữ liệu tài chính">
      <!-- Rendered dynamically by assets/js/components/financial-table.js -->
    </section>

  </main>

  <!-- Formula Documentation Modal / Drawer Container -->
  <div id="formula-modal-container">
    <!-- Rendered dynamically on click by assets/js/components/calculation-table.js -->
  </div>

  <!-- Admin System MayHem Drawer Container (Right Side) -->
  <div id="admin-drawer-container">
    <!-- Rendered dynamically by assets/js/components/admin-drawer.js -->
  </div>

  <!-- Global Toast Notification -->
  <div id="toastNotification">
    <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
    <span id="toastMessageText">Thông báo hệ thống</span>
  </div>



  <!-- Application Entry Point -->
  <script type="module" src="{{ asset('assets/js/app.js') }}"></script>
</body>
</html>
