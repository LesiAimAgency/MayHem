<div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/70 p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
  
  <!-- Search & Filter Chips -->
  <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
    <div class="relative w-full sm:w-64">
      <input type="text" 
             id="metricSearchInput" 
             placeholder="Tìm kiếm chỉ tiêu (CIR, ROE, NIM...)" 
             class="w-full h-8 pl-8 pr-3 text-xs bg-[#F8F9FA] border border-[#D7D7D7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#051650] focus:bg-white transition-colors">
      <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#818181]">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>
    </div>

    <!-- Filter Buttons -->
    <div class="flex items-center gap-1.5 w-full sm:w-auto" id="filterButtonGroup">
      <button type="button" data-filter="ALL"
              class="metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-[#051650] text-white shadow-xs transition-colors">
        Tất cả ({{ count($factsheet['all_metrics']) }})
      </button>
      <button type="button" data-filter="FILL"
              class="metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-[#EBFBEE] text-[#2F9E44] border border-[#B2F2BB] hover:bg-[#2F9E44] hover:text-white shadow-xs transition-colors">
        FILL (30)
      </button>
      <button type="button" data-filter="TÍNH"
              class="metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E7F0FD] text-[#1971C2] border border-[#D0EBFF] hover:bg-[#1971C2] hover:text-white shadow-xs transition-colors">
        TÍNH (17)
      </button>
    </div>
  </div>

  <!-- Action Buttons (Export CSV, Compare in Frame 3) -->
  <div class="flex items-center gap-2 w-full md:w-auto justify-end">
    <a href="{{ url('/api/v1/financial-reports/' . $selectedTicker . '/export-csv') }}" 
       class="px-3.5 py-1.5 rounded-lg bg-white border border-[#D7D7D7] text-[#051650] hover:bg-[#F8F3EC] hover:border-[#C8997D] transition-colors text-xs font-bold flex items-center gap-1.5 shadow-xs">
      <svg class="w-3.5 h-3.5 text-[#051650]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      <span>Xuất BCTC (CSV)</span>
    </a>

    <a href="{{ route('reports.comparison', ['tickers' => $selectedTicker . ',VCB,ACB']) }}" 
       class="px-3.5 py-1.5 rounded-lg bg-[#F8F3EC] border border-[#C8997D]/70 text-[#051650] hover:bg-[#051650] hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 shadow-xs">
      <span>Đối Chiếu So Sánh &rarr;</span>
    </a>
  </div>

</div>
