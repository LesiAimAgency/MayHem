<div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/60 p-8 space-y-6">

  <!-- SECTION 1: BỘ LỌC NGÀNH HÀNG -->
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-[15px] font-bold text-[#051650]">Ngành hàng</h2>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs text-[#323232]">
      @php
        $displaySectors = (isset($sectors) && $sectors instanceof \Illuminate\Support\Collection && $sectors->isNotEmpty())
          ? $sectors
          : \App\Models\MhSector::all();
      @endphp
      @foreach($displaySectors as $idx => $sec)
        @php
          $sCode = is_object($sec) ? ($sec->sector_code ?? $sec->code ?? 'ngan-hang') : ($sec['code'] ?? 'ngan-hang');
          $sName = is_object($sec) ? ($sec->sector_name ?? $sec->name ?? '') : ($sec['name'] ?? '');
          $isChecked = ($sCode === 'ngan-hang' || $idx === 0);
        @endphp
        <label class="flex items-center gap-2 cursor-pointer select-none group">
          <input type="radio" name="compare-industry-radio" value="{{ $sCode }}" {{ $isChecked ? 'checked' : '' }}
            class="w-[18px] h-[18px] accent-[#051650] border-[#323232] focus:ring-0 cursor-pointer">
          <span class="text-[12px] font-medium group-has-[:checked]:text-[#051650] group-has-[:checked]:font-bold">{{ $sName }}</span>
        </label>
      @endforeach
    </div>
  </div>

  <!-- SECTION 2: MÃ CỔ PHIẾU (Search & Dropzone) -->
  <div class="pt-2 flex flex-col lg:flex-row items-start justify-between gap-6">

    <!-- Left Column: Search & Select Multi -->
    <div class="w-full lg:w-[296.5px] space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-[15px] font-bold text-[#051650]">Mã Cổ Phiếu</h2>
      </div>
      <div id="compareStockSearchContainer" class="relative">
        <div class="relative">
          <input type="text" id="compareStockSearchInput"
            class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 pr-16 text-xs text-[#323232] placeholder-[#818181] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-text"
            placeholder="Nhập hoặc chọn Mã CP" autocomplete="off">
          <button type="button" id="clearCompareStockSearchBtn"
            class="hidden absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D7D7D7] hover:bg-[#818181] text-white text-[10px] flex items-center justify-center transition-colors">&times;</button>
          <button type="button" id="toggleCompareStockDropdownBtn"
            class="absolute right-0 top-0 h-full px-2.5 text-[#818181] hover:text-[#051650] flex items-center justify-center transition-colors">
            <svg id="compareStockChevronIcon" class="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <!-- Dropdown Menu -->
        <div id="compareStockDropdownMenu"
          class="hidden absolute z-30 top-[36px] left-0 w-full max-h-[260px] overflow-y-auto bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg">
          @foreach($companies as $c)
            <div class="compare-dropdown-item px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors {{ in_array($c->short_name, $selectedTickers) ? 'bg-[#F8F3EC]/70 font-semibold' : '' }}"
                 data-ticker="{{ $c->short_name }}"
                 data-name="{{ $c->company_name }}">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#051650]">{{ $c->short_name }}</span>
                <span class="text-[#818181] text-[11px] truncate max-w-[150px]">{{ $c->company_name }}</span>
              </div>
              <span class="compare-item-check text-[#051650] {{ in_array($c->short_name, $selectedTickers) ? '' : 'hidden' }}">&#10003;</span>
            </div>
          @endforeach
        </div>
      </div>
      <!-- Selected count badge + Select All button -->
      <div class="flex items-center justify-between">
        <p class="text-[11px] text-[#818181]">Đã chọn: <span id="compareSelectedStocksCount" class="font-bold text-[#051650]">{{ count($selectedTickers) }} mã</span></p>
        <button type="button" id="compareSelectAllBtn"
          class="text-[11px] font-medium text-[#051650] hover:text-[#C8997D] underline underline-offset-2 transition-colors">
          Chọn tất cả
        </button>
      </div>
    </div>

    <!-- Right Column: Drop Zone Chips (Figma style 52x27px rx=4px) -->
    <div id="compareChipsContainer" class="w-full lg:flex-1 bg-[#F3F3F3] border-2 border-transparent rounded-xl p-4 min-h-[80px] relative transition-all duration-200">
      <div id="compareChipsList" class="flex flex-wrap gap-2 min-h-[27px]">
        @foreach($selectedTickers as $t)
          @php
            $cItem = $companies->firstWhere('short_name', $t);
            $cFullName = $cItem ? $cItem->company_name : $t;
          @endphp
          <div class="compare-stock-chip h-[27px] min-w-[52px] px-2.5 bg-white border border-[#D7D7D7] rounded-[4px] text-xs font-bold text-[#051650] flex items-center justify-center gap-1.5 shadow-2xs hover:border-[#051650] transition-all select-none group cursor-grab active:cursor-grabbing"
               draggable="true"
               data-ticker="{{ $t }}"
               title="{{ $cFullName }} (Kéo ra ngoài để xóa, kéo đổi vị trí)">
            <span>{{ $t }}</span>
            <button type="button" class="compare-chip-remove text-[#818181] hover:text-red-500 font-bold text-xs leading-none p-0.5" title="Xóa {{ $t }}">&times;</button>
          </div>
        @endforeach
        <div id="compareDropzoneEmptyNotice" class="{{ count($selectedTickers) === 0 ? '' : 'hidden' }} w-full py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-[#818181] select-none">
          <svg class="w-5 h-5 text-[#C8997D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span class="text-[12px]">Chọn hoặc kéo thả mã từ danh sách bên trái vào đây</span>
        </div>
      </div>
      <div class="flex items-center justify-between mt-2 pt-1 border-t border-[#E5E5E5]/60 text-[10px] text-[#818181]">
        
        <button type="button" id="compareClearAllChipsBtn"
          class="{{ count($selectedTickers) > 0 ? '' : 'hidden' }} text-[#818181] hover:text-[#FE0000] transition-colors font-medium">
          Xóa tất cả &times;
        </button>
      </div>
    </div>

  </div>

  <!-- SECTION 3: THỜI GIAN XEM (Từ năm & Đến năm) -->
  <div class="pt-2 flex flex-col lg:flex-row items-start lg:items-center gap-6">
    <div class="w-full lg:w-[296.5px] shrink-0">
      <h2 class="text-[15px] font-bold text-[#051650]">Thời gian xem</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full max-w-[620px]">
      <!-- Từ năm -->
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-[#051650]">Từ năm</label>
        <div class="relative w-full text-[#323232] text-xs font-sans">
          <select id="compareFromYear" class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 pr-8 text-xs text-[#323232] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer appearance-none">
            @foreach($allYears as $yr)
              <option value="{{ $yr }}" {{ $yr == $fromYear ? 'selected' : '' }}>{{ $yr }}</option>
            @endforeach
          </select>
          <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#818181]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>

      <!-- Đến năm -->
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-[#051650]">Đến năm</label>
        <div class="relative w-full text-[#323232] text-xs font-sans">
          <select id="compareToYear" class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 pr-8 text-xs text-[#323232] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer appearance-none">
            @foreach($allYears as $yr)
              <option value="{{ $yr }}" {{ $yr == $toYear ? 'selected' : '' }}>{{ $yr }}</option>
            @endforeach
          </select>
          <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#818181]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: TIÊU CHÍ (Chỉ tiêu & Điều kiện) -->
  <div class="pt-2 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative z-50">
    <div class="w-full lg:w-[296.5px] shrink-0">
      <h2 class="text-[15px] font-bold text-[#051650]">Tiêu chí</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1 w-full max-w-[620px]">
      <!-- Dữ liệu lọc -->
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-[#051650]">Dữ liệu lọc</label>
        <div id="compareFillSearchContainer" class="relative w-full text-[#323232] text-xs font-sans">
          <div class="relative">
            <input type="text" id="compareMetricFilterFill"
              class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 pr-8 text-xs text-[#323232] placeholder-[#818181] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-text"
              placeholder="Tất cả dữ liệu lọc (30)" autocomplete="off">
            <button type="button" id="toggleCompareFillDropdownBtn"
              class="absolute right-0 top-0 h-full px-2.5 text-[#818181] hover:text-[#051650] flex items-center justify-center transition-colors">
              <svg id="compareFillChevronIcon" class="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <!-- Dropdown Menu -->
          <div id="compareFillDropdownMenu"
            class="hidden absolute z-50 top-[36px] left-0 w-full max-h-[260px] overflow-y-auto bg-[#FAF8F5] border border-[#D7D7D7] rounded-[8px] shadow-lg">
            <div class="compare-fill-item px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors bg-[#F8F3EC]/70 font-semibold" data-name="Tất cả dữ liệu lọc">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#051650]">Tất cả dữ liệu lọc (30)</span>
              </div>
              <svg class="w-3 h-3 text-[#C8997D] check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            @foreach($comparison['matrix'] as $m)
              @if($m['type'] === 'FILL')
                <div class="compare-fill-item px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors" data-name="{{ $m['name'] }}">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#051650]">{{ $m['name'] }}</span>
                  </div>
                  <svg class="w-3 h-3 text-[#C8997D] check-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              @endif
            @endforeach
          </div>
        </div>
      </div>

      <!-- Dữ liệu tính -->
      <div class="space-y-1.5">
        <label class="block text-[13px] font-bold text-[#051650]">Dữ liệu tính</label>
        <div id="compareTinhSearchContainer" class="relative w-full text-[#323232] text-xs font-sans">
          <div class="relative">
            <input type="text" id="compareMetricFilterTinh"
              class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 pr-8 text-xs text-[#323232] placeholder-[#818181] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-text"
              placeholder="Tất cả dữ liệu tính (17)" autocomplete="off">
            <button type="button" id="toggleCompareTinhDropdownBtn"
              class="absolute right-0 top-0 h-full px-2.5 text-[#818181] hover:text-[#051650] flex items-center justify-center transition-colors">
              <svg id="compareTinhChevronIcon" class="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <!-- Dropdown Menu -->
          <div id="compareTinhDropdownMenu"
            class="hidden absolute z-50 top-[36px] left-0 w-full max-h-[260px] overflow-y-auto bg-[#FAF8F5] border border-[#D7D7D7] rounded-[8px] shadow-lg">
            <div class="compare-tinh-item px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors bg-[#F8F3EC]/70 font-semibold" data-name="Tất cả dữ liệu tính">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#051650]">Tất cả dữ liệu tính (17)</span>
              </div>
              <svg class="w-3 h-3 text-[#C8997D] check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            @foreach($comparison['matrix'] as $m)
              @if($m['type'] === 'TÍNH')
                <div class="compare-tinh-item px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors" data-name="{{ $m['name'] }}">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#051650]">{{ $m['name'] }}</span>
                  </div>
                  <svg class="w-3 h-3 text-[#C8997D] check-icon hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
              @endif
            @endforeach
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 5: ACTION BUTTON (SO SÁNH NH) -->
  <div class="flex justify-center pt-2">
    
  </div>

</div>
