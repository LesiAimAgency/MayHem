<!-- Stock & Industry Selector Bar (Chuẩn 100% lọc.svg / Frame 67.svg) -->
<section class="w-full max-w-[1440px] mx-auto px-4 sm:px-9  mb-6 select-none">
  <div class="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 h-auto lg:h-[59px] relative">
    
    <!-- Left Group: Nhóm ngành (296.5px) + Khoảng cách (36.5px) + Mã Cổ Phiếu (308.5px) -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 lg:gap-[36.5px] w-full lg:w-auto">
      
      <!-- 1. Nhóm ngành: rộng 296.5px, cao 28.5px, viền 0.5px #818181, bo góc 7.75px -->
      <div class="w-full sm:w-[296.5px] relative" id="industrySelectorContainer">
        <label class="block text-[13px] font-bold text-[#051650] leading-none mb-[9px]">Nhóm ngành</label>
        <div class="relative w-full sm:w-[296.5px] h-[28.5px]">
          <input type="text" id="industryInput" readonly
                 value="Nhập hoặc chọn nhóm ngành"
                 data-selected="ngan-hang"
                 class="w-full h-[28.5px] bg-white border-[0.5px] border-[#818181] rounded-[7.75px] pl-3 pr-8 text-[12px] text-[#818181] font-normal placeholder-[#818181] focus:outline-none cursor-pointer"
                 placeholder="Nhập hoặc chọn nhóm ngành">
          <button type="button" id="toggleIndustryDropdownBtn"
                  class="absolute right-0 top-0 h-full w-8 flex items-center justify-center cursor-pointer text-[#818181]">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#818181" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Industry Dropdown Menu -->
        <div id="industryDropdownMenu"
             class="hidden absolute left-0 top-full mt-1.5 w-full bg-white border border-[#D7D7D7] rounded-xl shadow-xl z-40 py-1.5 max-h-[260px] overflow-y-auto">
          @php
            $allSectors = (isset($sectors) && $sectors instanceof \Illuminate\Support\Collection && $sectors->isNotEmpty())
              ? $sectors
              : \App\Models\MhSector::all();
          @endphp
          @foreach($allSectors as $sec)
            @php
              $sCode = $sec->sector_code ?? ($sec['code'] ?? 'BANK');
              $sName = $sec->sector_name ?? ($sec['name'] ?? 'Ngân hàng');
              $isBank = strtoupper($sCode) === 'BANK' || strtolower($sCode) === 'ngan-hang';
            @endphp
            <button type="button"
                    class="industry-option-item w-full text-left px-3.5 py-2 text-xs text-[#051650] hover:bg-[#F8F3EC] transition-colors flex items-center justify-between {{ $isBank ? 'font-bold bg-[#F8F3EC]/50' : '' }}"
                    data-code="{{ strtolower($sCode) }}"
                    data-name="{{ $sName }}">
              <span>{{ $sName }}</span>
              @if($isBank)
                <span class="text-[10px] text-[#2F9E44] bg-[#EBFBEE] px-1.5 py-0.5 rounded font-bold">28 mã</span>
              @else
                <span class="text-[10px] text-[#818181] italic">Đang cập nhật</span>
              @endif
            </button>
          @endforeach
        </div>
      </div>

      <!-- 2. Mã Cổ Phiếu: rộng 308.5px, cao 28.5px, viền 0.5px #818181, bo góc 7.75px -->
      <div class="w-full sm:w-[308.5px] relative" id="stockSelectorContainer">
        <label class="block text-[13px] font-bold text-[#051650] leading-none mb-[9px]">Mã Cổ Phiếu</label>
        <div class="relative w-full sm:w-[308.5px] h-[28.5px]">
          <input type="text" id="stockSearchInput"
                 value="{{ $selectedTicker ? ($selectedTicker . ' - ' . ($factsheet['company']['company_name'] ?? '')) : '' }}"
                 data-selected-ticker="{{ $selectedTicker ?? 'ABB' }}"
                 class="w-full h-[28.5px] bg-white border-[0.5px] border-[#818181] rounded-[7.75px] pl-3 pr-8 text-[12px] text-[#051650] font-medium placeholder-[#818181] focus:outline-none cursor-text truncate"
                 placeholder="Nhập hoặc chọn mã cổ phiếu"
                 autocomplete="off">
          
          <!-- Clear Button -->
          <button type="button" id="clearStockSearchBtn"
                  class="hidden absolute right-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#D7D7D7] hover:bg-[#818181] text-white text-[9px] flex items-center justify-center transition-colors cursor-pointer">
            &times;
          </button>

          <!-- Toggle Chevron Icon -->
          <button type="button" id="toggleStockDropdownBtn"
                  class="absolute right-0 top-0 h-full w-8 flex items-center justify-center cursor-pointer text-[#818181]">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#818181" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Stock Dropdown Menu with 28 banks -->
        <div id="stockDropdownMenu"
             class="hidden absolute left-0 top-full mt-1.5 w-full bg-white border border-[#D7D7D7] rounded-xl shadow-xl z-40 py-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div id="stockListWrapper" class="divide-y divide-[#F1F3F5]">
            @foreach($companies as $comp)
              <button type="button"
                      class="stock-option-item w-full text-left px-3.5 py-2 hover:bg-[#F8F3EC] transition-colors flex items-center justify-between group cursor-pointer {{ ($comp->short_name === ($selectedTicker ?? 'ABB')) ? 'bg-[#F8F3EC]/70 font-bold' : '' }}"
                      data-ticker="{{ $comp->short_name }}"
                      data-name="{{ $comp->company_name }}">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-bold text-[#051650] text-xs font-mono group-hover:text-[#C8997D]">{{ $comp->short_name }}</span>
                  <span class="text-[11px] text-[#495057] truncate max-w-[190px]">{{ $comp->company_name }}</span>
                </div>
                @if($comp->short_name === ($selectedTicker ?? 'ABB'))
                  <span class="w-2 h-2 rounded-full bg-[#051650]"></span>
                @endif
              </button>
            @endforeach
          </div>
          <!-- Empty state when searching -->
          <div id="stockSearchEmpty" class="hidden px-4 py-3 text-center text-xs text-[#818181] italic">
            Không tìm thấy mã cổ phiếu phù hợp.
          </div>
        </div>
      </div>

    </div>

    <!-- Right Side: Nút CHỈNH SỬA DỮ LIỆU (rộng 154px, cao 25px, bo tròn 12.5px, màu #051650, chữ trắng) -->
    <div class="flex items-center lg:self-center lg:my-auto">
      <button type="button" id="btnOpenEditModal"
              class="w-[154px] h-[25px] rounded-[12.5px] bg-[#051650] text-white text-[10px] font-bold tracking-wider uppercase flex items-center justify-center cursor-pointer hover:bg-[#0E2168] active:scale-95 transition-all shadow-xs">
        CHỈNH SỬA DỮ LIỆU
      </button>
    </div>

  </div>
</section>
