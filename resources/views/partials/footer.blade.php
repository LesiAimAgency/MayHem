<footer class="w-full bg-white border-t border-[#D7D7D7]/60 py-6 mt-auto">
  <div class="max-w-[1440px] mx-auto px-9 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#818181]">
    <div class="flex items-center gap-2">
      <span class="font-bold text-[#051650]">MAYHEM FINANCIAL</span>
      <span>&copy; 2026. All rights reserved.</span>
    </div>
    <div class="flex items-center gap-4">
      <a href="{{ route('reports.overview') }}" class="{{ request()->routeIs('reports.overview') ? 'text-[#051650] font-semibold' : 'hover:text-[#051650] transition-colors' }}">
        Báo Cáo Tổng Hợp
      </a>
      <span class="text-[#D7D7D7]">|</span>
      <a href="{{ route('reports.factsheet') }}" class="{{ request()->routeIs('reports.factsheet') ? 'text-[#051650] font-semibold' : 'hover:text-[#051650] transition-colors' }}">
        Báo Cáo Đơn Lẻ
      </a>
      <span class="text-[#D7D7D7]">|</span>
      <a href="{{ route('reports.comparison') }}" class="{{ request()->routeIs('reports.comparison') ? 'text-[#051650] font-semibold' : 'hover:text-[#051650] transition-colors' }}">
        SO SÁNH
      </a>
      <span class="text-[#D7D7D7]">|</span>
      <a href="{{ route('users.index') }}" class="{{ request()->routeIs('users.index') ? 'text-[#051650] font-semibold' : 'hover:text-[#051650] transition-colors' }}">
        Quản Trị Người Dùng
      </a>
    </div>
  </div>
</footer>
