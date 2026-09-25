<div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/70 overflow-hidden">
  
  <!-- Table Filter & Search Controls Header -->
    <!-- Filter Buttons (Tất cả / FILL / TÍNH) -->
  <!-- <div class="px-6 py-3.5 bg-[#FAFBFD] border-b border-[#E9ECEF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
    <div class="flex items-center gap-2 w-full sm:w-auto">
      <div class="relative w-full sm:w-[260px]">
        <input type="text" id="metricSearchInput"
               placeholder="Tìm chỉ tiêu tài chính..."
               class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-lg pl-8 pr-3 text-xs text-[#051650] placeholder-[#818181] focus:outline-none focus:border-[#051650] focus:ring-1 focus:ring-[#051650]">
        <svg class="w-3.5 h-3.5 text-[#818181] absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

   
    <div class="flex items-center gap-1.5 self-end sm:self-center">
      <button type="button" class="metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#051650] text-white cursor-pointer" data-filter="ALL">
        Tất cả ({{ count($factsheet['all_metrics']) }})
      </button> 
       <button type="button" class="metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#EBFBEE] text-[#2F9E44] hover:opacity-90 cursor-pointer" data-filter="FILL">
        FILL (30)
      </button>
      <button type="button" class="metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#E7F0FD] text-[#1971C2] hover:opacity-90 cursor-pointer" data-filter="TÍNH">
        TÍNH (17)
      </button>
    </div>
  </div> -->

  <!-- Table Body -->
  <div class="overflow-x-auto custom-scrollbar">
    <table class="w-full text-left text-xs border-collapse min-w-[1020px]" id="liveFinancialTable">
      <thead class="bg-[#F8F9FA] text-[#051650] font-bold text-[11px] uppercase tracking-wider border-b border-[#D7D7D7] sticky top-0 z-10">
        <tr>
          <th scope="col" class="px-3 py-3.5 text-center w-12 text-[#818181]">STT</th>
          <th scope="col" class="px-3 py-3.5 text-center w-16">LOẠI</th>
          <th scope="col" class="px-3 py-3.5 text-center w-20">MÃ NH</th>
          <th scope="col" class="px-4 py-3.5 min-w-[280px]">CHỈ TIÊU TÀI CHÍNH</th>
          <th scope="col" class="px-3 py-3.5 text-center w-24">ĐVT</th>
          @foreach($factsheet['years'] as $year)
            <th scope="col" class="px-3.5 py-3.5 text-right font-mono {{ $loop->last ? 'text-[#051650] font-black bg-gray-100/60 border-l border-[#E9ECEF]' : '' }}">
              {{ $year }}
            </th>
          @endforeach
        </tr>
      </thead>
      <tbody id="financialTableBody" class="divide-y divide-[#E9ECEF] text-xs">

        @foreach($factsheet['all_metrics'] as $idx => $metric)
          @php
            $isFill = $metric['type'] === 'FILL';
            $isTinh = $metric['type'] === 'TÍNH';
          @endphp
          <tr class="hover:bg-[#F8F3EC]/40 transition-colors metric-row"
              data-type="{{ $metric['type'] }}"
              data-name="{{ $metric['name'] }}"
              data-key="{{ $metric['key'] }}">
            <td class="px-3 py-3 text-center text-[#818181] font-semibold">{{ $metric['stt'] }}</td>
            <td class="px-3 py-3 text-center">
              @if($isTinh)
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7F0FD] text-[#1971C2] border border-[#D0EBFF]">TÍNH</span>
              @else
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBFBEE] text-[#2F9E44] border border-[#B2F2BB]">FILL</span>
              @endif
            </td>
            <td class="px-3 py-3 text-center font-bold text-[#051650]">{{ $factsheet['company']['short_name'] }}</td>
            <td class="px-4 py-3 font-semibold text-[#051650]">
              <div class="flex items-center gap-2">
                <span>{{ $metric['name'] }}</span>
                @if(!empty($metric['formula']))
                  <button type="button"
                          onclick="showFormulaModal('{{ addslashes($metric['name']) }}', '{{ addslashes($metric['formula']) }}', '{{ $metric['unit'] }}')"
                          class="text-[#C8997D] hover:text-[#051650] transition-colors text-[10px] font-mono font-bold px-1 rounded bg-[#F8F3EC] cursor-pointer"
                          title="Xem công thức: {{ $metric['formula'] }}">
                    fx
                  </button>
                @endif
              </div>
            </td>
            <td class="px-3 py-3 text-center text-[#818181]">{{ $metric['unit'] }}</td>
            @foreach($factsheet['years'] as $year)
              @php
                $val = $metric['values'][$year] ?? null;
                $isNegative = is_numeric($val) && $val < 0;
              @endphp
              <td class="px-3.5 py-3 text-right font-mono {{ $loop->last ? 'bg-gray-100/30 font-bold border-l border-[#E9ECEF]' : '' }} {{ $isNegative ? 'text-red-600' : '' }}">
                @if($val !== null)
                  @if($metric['unit'] === '%')
                    {{ ($val > 0 && str_contains($metric['name'], 'Tăng trưởng') ? '+' : '') . number_format($val, 2) }}%
                  @elseif($metric['unit'] === 'Lần')
                    {{ number_format($val, 2) }}
                  @elseif($metric['unit'] === 'VND/CP')
                    {{ number_format($val, 0) }}
                  @else
                    {{ number_format($val, 2) }}
                  @endif
                @else
                  <span class="text-[#ADB5BD]">-</span>
                @endif
              </td>
            @endforeach
            
          </tr>
        @endforeach

      </tbody>
    </table>
  </div>

  <!-- Table Footer Status -->
  <div class="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E9ECEF] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#818181]">
    <div class="flex items-center gap-4 flex-wrap">
      <span class="font-semibold text-[#051650]">
        Hiển thị <span id="visibleMetricsCount">{{ count($factsheet['all_metrics']) }}</span> / {{ count($factsheet['all_metrics']) }} chỉ tiêu tài chính
      </span>
      <span class="text-[#D7D7D7]">|</span>
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-[#E7F0FD] border border-[#1971C2]"></span> TÍNH – 17 chỉ tiêu công thức đối chiếu chuẩn</span>
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-[#EBFBEE] border border-[#2F9E44]"></span> FILL – 30 chỉ tiêu trích xuất từ BCTC</span>
    </div>
  </div>
</div>

<!-- Modal xem công thức tài chính đối chiếu -->
<div id="formulaDetailModal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
  <div class="bg-white rounded-2xl shadow-xl border border-[#D7D7D7] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
    <div class="bg-[#051650] text-white px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-[#C8997D]">
          fx
        </div>
        <div>
          <h3 id="modalIndicatorName" class="font-bold text-sm leading-tight text-white">Tên chỉ tiêu</h3>
          <p class="text-[10px] text-white/70">Công thức đối chiếu chuẩn</p>
        </div>
      </div>
      <button type="button" onclick="closeFormulaModal()" class="text-white/70 hover:text-white text-lg font-bold p-1 cursor-pointer">&times;</button>
    </div>

    <div class="p-6 space-y-4">
      <div>
        <label class="text-[11px] font-bold text-[#818181] uppercase tracking-wider block mb-1">Công thức toán học</label>
        <div id="modalFormulaText" class="p-3 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF] font-mono text-sm text-[#051650] font-bold break-words">
          Công thức
        </div>
      </div>

      <div class="flex items-center justify-between text-xs pt-2 border-t border-[#F0F0F0]">
        <span class="text-[#818181]">Đơn vị tính: <strong id="modalIndicatorUnit" class="text-[#051650]">%</strong></span>
        <span class="text-[#818181]">Loại: <strong class="text-[#1971C2]">TÍNH (Calculated)</strong></span>
      </div>
    </div>

    <div class="px-6 py-3.5 bg-[#F8F9FA] border-t border-[#E9ECEF] flex justify-end">
      <button type="button" onclick="closeFormulaModal()"
              class="px-4 py-2 rounded-lg bg-[#051650] text-white font-bold text-xs hover:bg-[#0E2168] transition-colors shadow-sm cursor-pointer">
        Đóng
      </button>
    </div>
  </div>
</div>

<script>
  function showFormulaModal(name, formula, unit) {
    document.getElementById('modalIndicatorName').textContent = name;
    document.getElementById('modalFormulaText').textContent = formula;
    document.getElementById('modalIndicatorUnit').textContent = unit || '%';
    document.getElementById('formulaDetailModal').classList.remove('hidden');
  }

  function closeFormulaModal() {
    document.getElementById('formulaDetailModal').classList.add('hidden');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFormulaModal();
  });
</script>
