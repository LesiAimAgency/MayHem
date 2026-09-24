<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', 'MAYHEM - Nền Tảng Phân Tích BCTC & Sàng Lọc Cổ Phiếu')</title>
  <meta name="description" content="@yield('meta_description', 'MAYHEM Financial Platform - Nền tảng phân tích BCTC và sàng lọc cổ phiếu ngân hàng chuyên sâu.')">
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
    .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #051650; }
  </style>
  @stack('styles')
</head>

<body class="bg-[#F2F2F2] text-[#323232] min-h-screen flex flex-col font-sans antialiased">

  <!-- HEADER -->
  @include('partials.header')

  <!-- MAIN VIEW CONTENT -->
  <div class="flex-1 flex flex-col">
    @if(session('error'))
      <div class="max-w-[1440px] mx-auto px-9 mt-4 w-full">
        <div class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="font-medium">{{ session('error') }}</span>
          </div>
          <button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-700 text-base leading-none">&times;</button>
        </div>
      </div>
    @endif
    @if(session('success'))
      <div class="max-w-[1440px] mx-auto px-9 mt-4 w-full">
        <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="font-medium">{{ session('success') }}</span>
          </div>
          <button onclick="this.parentElement.remove()" class="text-emerald-400 hover:text-emerald-700 text-base leading-none">&times;</button>
        </div>
      </div>
    @endif
    @yield('content')
  </div>

  <!-- FOOTER -->
  @include('partials.footer')

  @stack('scripts')
</body>
</html>
