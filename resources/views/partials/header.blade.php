<header class="w-full bg-[#F2F2F2]">
  <div class="max-w-[1440px] mx-auto px-9 h-[84px] flex items-center justify-between">

    <!-- Left: Logo MAYHEM -->
    <a href="{{ route('reports.overview') }}" class="flex items-center group select-none shrink-0" title="MAYHEM - Trang chủ">
      <img src="{{ asset('assets/images/Logo.svg') }}"
           alt="MAYHEM"
           width="239"
           height="60"
           class="w-[239px] h-[60px] object-contain transition-transform group-hover:scale-[1.02] block">
    </a>

    <!-- Center: Navigation Tabs -->
    <nav class="hidden md:flex items-center gap-3">
      <!-- Tab 1: BÁO CÁO TỔNG HỢP -->
      <a href="{{ route('reports.overview') }}"
        class="h-[36px] px-6 rounded-full text-[13px] uppercase transition-all flex items-center justify-center {{ request()->routeIs('reports.overview') ? 'font-bold shadow-sm bg-white text-[#051650]' : 'font-semibold text-[#818181] hover:text-[#051650]' }}">
        BÁO CÁO TỔNG HỢP
      </a>

      <!-- Tab 2: BÁO CÁO ĐƠN LẺ -->
      <a href="{{ route('reports.factsheet') }}" id="navFactsheetLink"
        class="h-[36px] px-6 rounded-full text-[13px] uppercase transition-all flex items-center justify-center {{ request()->routeIs('reports.factsheet') ? 'font-bold shadow-sm bg-white text-[#051650]' : 'font-semibold text-[#818181] hover:text-[#051650]' }}">
        BÁO CÁO ĐƠN LẺ
      </a>

      @if(request()->routeIs('reports.comparison'))
        <!-- Tab 3: SO SÁNH (Hiển thị active khi ở trang so sánh) -->
        <a href="{{ route('reports.comparison') }}"
          class="h-[36px] px-6 rounded-full text-[13px] uppercase transition-all flex items-center justify-center font-bold shadow-sm bg-white text-[#051650]">
          SO SÁNH
        </a>
      @endif
    </nav>

    <!-- Right: Slogan, User Profile & Actions -->
    <div class="flex items-center gap-4">
      

      @php
        $authUser = auth()->user();
        $userRole = strtolower($authUser->role ?? 'admin');
        $initials = 'MH';
        if ($authUser && $authUser->name) {
            $words = explode(' ', trim($authUser->name));
            if (count($words) >= 2) {
                $initials = mb_strtoupper(mb_substr($words[0], 0, 1) . mb_substr(end($words), 0, 1));
            } else {
                $initials = mb_strtoupper(mb_substr($words[0], 0, 2));
            }
        }
        $roleLabel = match($userRole) {
            'admin' => 'Admin',
            'editor' => 'Editor',
            'staff' => 'Staff',
            default => ucfirst($userRole)
        };
      @endphp

      <!-- User Info & Actions -->
      <div class="flex items-center gap-2.5">
        

        <!-- User Chip -->
        <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#D7D7D7]/80 shadow-xs select-none" title="{{ $authUser->name ?? 'Người dùng' }} ({{ $authUser->email ?? '' }})">
          <div class="w-7 h-7 rounded-full bg-[#051650] text-white font-bold flex items-center justify-center text-[11px] shadow-xs">
            {{ $initials }}
          </div>
          <div class="flex flex-col text-left pr-1">
            <span class="text-[11px] font-bold text-[#051650] leading-none truncate max-w-[120px] hidden sm:inline">
              {{ $authUser->name ?? 'Người dùng' }}
            </span>
          </div>
        </div>

        <!-- Logout Button -->
        <a href="{{ route('logout') }}" title="Đăng xuất khỏi hệ thống"
           class="w-8 h-8 rounded-full bg-white border border-[#D7D7D7] text-[#818181] hover:text-red-600 hover:border-red-300 hover:bg-red-50 flex items-center justify-center transition shadow-xs">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </a>
      </div>
    </div>

  </div>
</header>

