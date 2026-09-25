<section class="max-w-[1440px] w-full mx-auto px-9 pb-5">
  <div class="bg-white rounded-xl border border-[#D7D7D7]/60 p-4 shadow-sm flex flex-col gap-3">

    {{-- Row 1: Chips + Add --}}
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      
      {{-- Left: Active Compared Chips --}}
      <div class="flex-1 space-y-2">
        <div class="text-[13px] font-bold text-[#051650] flex items-center gap-2">
          <span>Các mã đang đưa vào so sánh đối chiếu:</span>
          <span id="comparedCountBadge" class="px-2 py-0.5 rounded bg-[#F8F3EC] text-[#051650] text-xs font-bold border border-[#C8997D]">
            {{ count($comparison['tickers']) }} mã &bull; Ngành: Ngân hàng
            @if($comparison['mode'] === '10years')
              &bull; Liên tiếp {{ count($comparison['years']) }} năm ({{ $comparison['years'][0] }}–{{ end($comparison['years']) }})
            @else
              &bull; Năm {{ $comparison['year'] }}
            @endif
          </span>
        </div>
        <div id="activeComparedChips" class="flex flex-wrap items-center gap-2">
          @foreach($comparison['tickers'] as $t)
            <div class="h-[28px] px-3 rounded-full bg-[#051650] text-white text-xs font-bold flex items-center gap-2 shadow-xs">
              <span>{{ $t }}</span>
              <button type="button" class="remove-ticker-btn text-[#C8997D] hover:text-white font-bold" data-ticker="{{ $t }}">&times;</button>
            </div>
          @endforeach
        </div>
      </div>

      {{-- Right: Add Stock Dropdown & Reset Button --}}
      <div class="flex items-center gap-3 w-full lg:w-auto justify-end shrink-0">
        <x-stock-selector 
            id="addCompareSelector"
            name="add_ticker"
            :companies="$companies"
            :exclude="$comparison['tickers']"
            placeholder="+ Thêm mã vào bảng..."
            mode="action"
            width="w-full sm:w-[250px]"
        />

        <a href="{{ route('reports.comparison', ['tickers' => 'ACB,ABB,VCB']) }}" id="resetCompareBtn"
           class="h-[32px] px-4 rounded-lg border border-[#818181] text-[#051650] hover:bg-gray-100 transition-colors text-[11px] font-bold shadow-sm flex items-center justify-center shrink-0">
          Đặt lại
        </a>
      </div>
    </div>

    {{-- Row 2: Year Range Mode Selector --}}
    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#D7D7D7]/60 pt-3">
      <span class="text-[12px] font-bold text-[#051650]">Phạm vi năm:</span>

      {{-- Radio: Năm gần nhất --}}
      <label class="flex items-center gap-2 cursor-pointer group">
        <input type="radio" name="yearMode" id="modeLatest" value="latest"
               class="accent-[#051650] w-3.5 h-3.5 cursor-pointer"
               {{ ($comparison['mode'] ?? 'latest') === 'latest' ? 'checked' : '' }}>
        <span class="text-[12px] text-[#323232] group-hover:text-[#051650] font-medium">Năm gần nhất
          <span class="text-[#818181] font-normal">({{ $comparison['year'] }})</span>
        </span>
      </label>

      {{-- Radio: Liên tiếp 8 năm --}}
      <label class="flex items-center gap-2 cursor-pointer group">
        <input type="radio" name="yearMode" id="mode10years" value="10years"
               class="accent-[#051650] w-3.5 h-3.5 cursor-pointer"
               {{ ($comparison['mode'] ?? 'latest') === '10years' ? 'checked' : '' }}>
        <span class="text-[12px] text-[#323232] group-hover:text-[#051650] font-medium">Liên tiếp 10 năm
          @if($comparison['mode'] === '10years')
            <span class="text-[#818181] font-normal">({{ $comparison['years'][0] }}–{{ end($comparison['years']) }})</span>
          @endif
        </span>
      </label>
    </div>

  </div>
</section>
