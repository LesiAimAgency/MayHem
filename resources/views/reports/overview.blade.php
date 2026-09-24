@extends('layouts.app')

@section('title', 'MAYHEM - Báo Cáo Tổng Hợp | Lọc & Sàng Lọc Cổ Phiếu')
@section('meta_description', 'Báo cáo tổng hợp sàng lọc cổ phiếu ngân hàng theo 15 tiêu chí tài chính, ngành nghề và mã cổ phiếu.')

@section('content')

  <!-- Greeting Hero with 3 Quick Action Cards -->
  @include('partials.greeting-hero', ['activeCard' => 'overview'])

  <!-- ========================================================================
       MAIN SCREENER CONTAINER
       ======================================================================== -->
  <main class="max-w-[1440px] w-full mx-auto px-9 pb-12 flex-1" id="loc-du-lieu">
    <div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/60 p-8 space-y-7">

      <!-- SECTION 1: BỘ LỌC NGÀNH HÀNG -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-[15px] font-bold text-[#051650]">Ngành hàng</h2>
          
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs text-[#323232]">
          @foreach($sectors as $idx => $sector)
            <label class="flex items-center gap-2 cursor-pointer select-none group">
              <input type="radio" name="industry-radio" value="{{ $sector->sector_code }}" data-sector-id="{{ $sector->id }}" data-industry-radio {{ $idx === 0 ? 'checked' : '' }}
                class="w-[18px] h-[18px] accent-[#051650] border-[#323232] focus:ring-0 cursor-pointer">
              <span class="text-[12px] font-medium group-has-[:checked]:text-[#051650] group-has-[:checked]:font-bold">{{ $sector->sector_name }}</span>
            </label>
          @endforeach
        </div>
      </div>

      <!-- SECTION 2: MÃ CỔ PHIẾU (Search & Drop Zone) -->
      <div class="pt-4 flex flex-col lg:flex-row items-start justify-between gap-6">

        <!-- Left Column: Search & Select Multi -->
        <div class="w-full lg:w-[296.5px] space-y-2">
          <div class="flex items-center justify-between">
            <h2 class="text-[15px] font-bold text-[#051650]">Mã Cổ Phiếu</h2>
          </div>
          <div id="stockSelectSearchContainer" class="relative">
            <div class="relative">
              <input type="text" id="stockSearchInput"
                class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 pr-16 text-xs text-[#323232] placeholder-[#818181] focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-text"
                placeholder="Nhập hoặc chọn Mã CP" autocomplete="off">
              <button type="button" id="clearStockSearchInputBtn"
                class="hidden absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#D7D7D7] hover:bg-[#818181] text-white text-[10px] flex items-center justify-center transition-colors">&times;</button>
              <button type="button" id="toggleStockDropdownBtn"
                class="absolute right-0 top-0 h-full px-2.5 text-[#818181] hover:text-[#051650] flex items-center justify-center transition-colors">
                <svg id="stockChevronIcon" class="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <!-- Dropdown Menu -->
            <div id="stockDropdownMenu"
              class="hidden absolute z-30 top-[36px] left-0 w-full max-h-[260px] overflow-y-auto bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg">
              <!-- Rendered dynamically by flow-engine.js from window.BANKS_DATA -->
            </div>
          </div>
          <!-- Selected count badge + Select All button -->
          <div class="flex items-center justify-between">
            <p class="text-[11px] text-[#818181]">Đã chọn: <span id="selectedStocksCount" class="font-bold text-[#051650]">00 mã</span></p>
            <button type="button" id="selectAllStocksBtn"
              class="text-[11px] font-medium text-[#051650] hover:text-[#C8997D] underline underline-offset-2 transition-colors">
              Chọn tất cả
            </button>
          </div>
        </div>

        <!-- Right Column: Drop Zone -->
        <div id="stockChipsContainer" class="w-full lg:w-[885px] bg-[#F3F3F3] rounded-xl p-4 min-h-[80px] relative transition-colors duration-200">
          <div id="stockChipsDragContainer" class="flex flex-wrap gap-2 min-h-[27px]">
            <div id="dropzoneEmptyNotice" class="w-full py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-[#818181] select-none">
              <svg class="w-5 h-5 text-[#C8997D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-[12px]">Chọn mã từ ô tìm kiếm bên trái để hiển thị tại đây</span>
            </div>
          </div>
          <button type="button" id="clearAllSelectedStocksBtn"
            class="hidden absolute top-2 right-3 text-[10px] text-[#818181] hover:text-[#FE0000] transition-colors font-medium">
            Xóa tất cả ×
          </button>
        </div>

      </div>

      <!-- SECTION 3: 15 TIÊU CHÍ CHỌN ĐIỀU KIỆN -->
      <div class="pt-4 space-y-5">
        <!-- Row 1: 4 Cột -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[36px] gap-y-4">
          <!-- 1. CIR -->
          <div class="space-y-1.5" data-criteria-dropdown-container="cir">
            <label class="block text-[13px] font-bold text-[#051650]">Tỷ lệ chi phí/ thu nhập (CIR)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" id="cirDropdownContainer" data-criteria-container="cir">
              <button type="button" id="cirDropdownBtn" data-criteria-btn="cir" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span id="cirSelectedText" data-criteria-selected-text="cir" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div id="cirDropdownMenu" data-criteria-menu="cir" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="cir" name="cir_condition[]" value="under_60_latest" data-label="Dưới 60% ở năm gần nhất" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Dưới 60% ở năm gần nhất</span>
                  </label>
                  <div class="space-y-1.5" data-criteria-group="cir_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="cir_avg" data-metric="cir" data-label="Dưới Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Dưới Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="cir_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="cir_avg_period" value="under_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="cir_avg_period" value="under_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. CPKH / TOI -->
          <div class="space-y-1.5" data-criteria-dropdown-container="cpkh">
            <label class="block text-[13px] font-bold text-[#051650]">CPKH/ Tổng thu nhập hoạt động</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="cpkh">
              <button type="button" data-criteria-btn="cpkh" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="cpkh" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="cpkh" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="cpkh" name="cpkh_condition[]" value="under_10_latest" data-label="Dưới 10% ở năm gần nhất" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Dưới 10% ở năm gần nhất</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. BLVH -->
          <div class="space-y-1.5" data-criteria-dropdown-container="blvh">
            <label class="block text-[13px] font-bold text-[#051650]">Biên lãi vận hành (trước DPRR)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="blvh">
              <button type="button" data-criteria-btn="blvh" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="blvh" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="blvh" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="blvh" name="blvh_condition[]" value="above_avg_10y" data-label="Cao hơn trung bình ngành trong liên tiếp 10 năm" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Cao hơn trung bình ngành trong liên tiếp 10 năm</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. BLNTT -->
          <div class="space-y-1.5" data-criteria-dropdown-container="blntt">
            <label class="block text-[13px] font-bold text-[#051650]">Biên lợi nhuận trước thuế</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="blntt">
              <button type="button" data-criteria-btn="blntt" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="blntt" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="blntt" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="blntt" name="blntt_condition[]" value="above_avg_10y" data-label="Cao hơn trung bình ngành trong liên tiếp 10 năm" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Cao hơn trung bình ngành trong liên tiếp 10 năm</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: 4 Cột -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[36px] gap-y-4">
          <!-- 5. BLNST -->
          <div class="space-y-1.5" data-criteria-dropdown-container="blnst">
            <label class="block text-[13px] font-bold text-[#051650]">Biên Lợi nhuận ST của CĐ cty mẹ</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="blnst">
              <button type="button" data-criteria-btn="blnst" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="blnst" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="blnst" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="blnst_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="blnst_avg" data-metric="blnst" data-label="Cao hơn Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Cao hơn Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="blnst_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="blnst_avg_period" value="above_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="blnst_avg_period" value="above_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 6. TTLR -->
          <div class="space-y-1.5" data-criteria-dropdown-container="ttlr">
            <label class="block text-[13px] font-bold text-[#051650]">Tăng trưởng lãi ròng sau CĐ thiểu số</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="ttlr">
              <button type="button" data-criteria-btn="ttlr" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="ttlr" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="ttlr" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="ttlr" name="ttlr_condition[]" value="positive_10y" data-label="Luôn là số dương liên tiếp 10 năm" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Luôn là số dương liên tiếp 10 năm</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. ROA -->
          <div class="space-y-1.5" data-criteria-dropdown-container="roa">
            <label class="block text-[13px] font-bold text-[#051650]">Tỷ suất sinh lời trên Tổng Tài Sản (ROA)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="roa">
              <button type="button" data-criteria-btn="roa" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="roa" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="roa" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="roa" name="roa_condition[]" value="from_1pct" data-label="Từ 1% trở lên ở năm gần nhất" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Từ 1% trở lên ở năm gần nhất</span>
                  </label>
                  <div class="space-y-1.5" data-criteria-group="roa_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="roa_avg" data-metric="roa" data-label="Cao hơn Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Cao hơn Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="roa_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="roa_avg_period" value="above_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="roa_avg_period" value="above_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 8. DE -->
          <div class="space-y-1.5" data-criteria-dropdown-container="de">
            <label class="block text-[13px] font-bold text-[#051650]">Debt/Equity</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="de">
              <button type="button" data-criteria-btn="de" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="de" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="de" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="de_under_10">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="de_under_10" data-metric="de" data-label="Dưới 10" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Dưới 10</span>
                    </label>
                    <div data-criteria-sub="de_under_10" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="de_under_10_period" value="under_10_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="de_under_10_period" value="under_10_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                  <div class="space-y-1.5" data-criteria-group="de_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="de_avg" data-metric="de" data-label="Dưới Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Dưới Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="de_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="de_avg_period" value="under_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="de_avg_period" value="under_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: 4 Cột -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[36px] gap-y-4">
          <!-- 9. ROE -->
          <div class="space-y-1.5" data-criteria-dropdown-container="roe">
            <label class="block text-[13px] font-bold text-[#051650]">Tỷ suất sinh lời trên Vốn CSH (ROE)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="roe">
              <button type="button" data-criteria-btn="roe" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="roe" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="roe" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="roe_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="roe_avg" data-metric="roe" data-label="Cao hơn Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Cao hơn Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="roe_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="roe_avg_period" value="above_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="roe_avg_period" value="above_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="roe" name="roe_condition[]" value="from_15pct_10y" data-label="Từ 15% trở lên liên tiếp 10 năm" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Từ 15% trở lên liên tiếp 10 năm</span>
                  </label>
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="roe" name="roe_condition[]" value="from_20pct_10y" data-label="Từ 20% trở lên liên tiếp 10 năm" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Từ 20% trở lên liên tiếp 10 năm</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 10. CFO -->
          <div class="space-y-1.5" data-criteria-dropdown-container="cfo">
            <label class="block text-[13px] font-bold text-[#051650]">Lưu chuyển tiền thuần từ HĐKD</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="cfo">
              <button type="button" data-criteria-btn="cfo" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="cfo" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="cfo" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <label class="flex items-center cursor-pointer select-none">
                    <input type="checkbox" data-criteria-cb="cfo" name="cfo_condition[]" value="greater_than_parent_npat_10y" data-label="Lớn hơn LNST của CĐ mẹ liên tiếp 10 năm" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                    <span class="ml-2.5 text-xs text-[#323232]">Lớn hơn "Lợi nhuận sau thuế của cổ đông công ty mẹ" liên tiếp 10 năm</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 11. CASA -->
          <div class="space-y-1.5" data-criteria-dropdown-container="casa">
            <label class="block text-[13px] font-bold text-[#051650]">Tỷ lệ tiền gửi không kỳ hạn (CASA)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="casa">
              <button type="button" data-criteria-btn="casa" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="casa" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="casa" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="casa_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="casa_avg" data-metric="casa" data-label="Cao hơn Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Cao hơn Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="casa_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="casa_avg_period" value="above_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="casa_avg_period" value="above_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 12. NPL -->
          <div class="space-y-1.5" data-criteria-dropdown-container="npl">
            <label class="block text-[13px] font-bold text-[#051650]">Tỷ lệ nợ xấu (NPL) cuối năm</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="npl">
              <button type="button" data-criteria-btn="npl" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="npl" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="npl" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="npl_avg">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="npl_avg" data-metric="npl" data-label="Dưới Trung Bình Ngành" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Dưới Trung Bình Ngành</span>
                    </label>
                    <div data-criteria-sub="npl_avg" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="npl_avg_period" value="under_avg_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="npl_avg_period" value="under_avg_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 4: 3 Cột -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[36px] gap-y-4">
          <!-- 13. NIM -->
          <div class="space-y-1.5" data-criteria-dropdown-container="nim">
            <label class="block text-[13px] font-bold text-[#051650]">Biên lãi thuần (NIM)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="nim">
              <button type="button" data-criteria-btn="nim" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="nim" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="nim" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="nim_3pct">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="nim_3pct" data-metric="nim" data-label="Trên 3%" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Trên 3%</span>
                    </label>
                    <div data-criteria-sub="nim_3pct" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="nim_3pct_period" value="above_3pct_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="nim_3pct_period" value="above_3pct_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 14. CAR -->
          <div class="space-y-1.5" data-criteria-dropdown-container="car">
            <label class="block text-[13px] font-bold text-[#051650]">Hệ số an toàn vốn (CAR)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="car">
              <button type="button" data-criteria-btn="car" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="car" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="car" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="car_10pct">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="car_10pct" data-metric="car" data-label="Trên 10%" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Trên 10%</span>
                    </label>
                    <div data-criteria-sub="car_10pct" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="car_10pct_period" value="above_10pct_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="car_10pct_period" value="above_10pct_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                  <div class="space-y-1.5" data-criteria-group="car_12pct">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="car_12pct" data-metric="car" data-label="Trên 12%" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Trên 12%</span>
                    </label>
                    <div data-criteria-sub="car_12pct" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="car_12pct_period" value="above_12pct_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="car_12pct_period" value="above_12pct_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 15. LLR -->
          <div class="space-y-1.5" data-criteria-dropdown-container="llr">
            <label class="block text-[13px] font-bold text-[#051650]">Tỷ lệ bao phủ nợ xấu (LLR Coverage)</label>
            <div class="relative w-full text-[#323232] text-xs font-sans" data-criteria-container="llr">
              <button type="button" data-criteria-btn="llr" class="w-full h-[32px] bg-white border border-[#D7D7D7] rounded-[8px] px-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer">
                <span data-criteria-selected-text="llr" class="text-[#818181] truncate">Nhập hoặc chọn điều kiện</span>
                <svg class="w-3.5 h-3.5 text-[#818181] shrink-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              <div data-criteria-menu="llr" class="hidden absolute top-full left-0 mt-1 w-max min-w-[280px] max-w-[340px] bg-white border border-[#D7D7D7] rounded-[8px] shadow-lg z-50">
                 
                <div class="border-t border-[#F0F0F0]"></div>
                <div class="p-3 space-y-3">
                  <div class="space-y-1.5" data-criteria-group="llr_50pct">
                    <label class="flex items-center cursor-pointer select-none">
                      <input type="checkbox" data-criteria-parent="llr_50pct" data-metric="llr" data-label="Trên 50%" class="w-4 h-4 text-[#051650] border-[#D7D7D7] rounded focus:ring-0 cursor-pointer accent-[#051650]">
                      <span class="ml-2.5 text-xs text-[#323232]">Trên 50%</span>
                    </label>
                    <div data-criteria-sub="llr_50pct" class="hidden pt-1 flex items-center gap-5 text-xs text-[#323232] select-none pl-1">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="llr_50pct_period" value="above_50pct_latest" data-label="Ở năm gần nhất" checked class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Ở năm gần nhất</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="llr_50pct_period" value="above_50pct_10y" data-label="Liên tiếp 10 năm" class="w-3.5 h-3.5 text-[#051650] cursor-pointer accent-[#051650]">
                        <span class="text-xs text-[#323232]">Liên tiếp 10 năm</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="hidden lg:block"></div>
        </div>
      </div>

      <!-- SECTION 4: THANH KẾT QUẢ & NÚT XEM CHI TIẾT -->
      <div class="pt-6 border-t border-[#D7D7D7]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-[14px] font-bold text-[#051650] flex items-center gap-2 min-h-[24px]">
          <span id="filterCountSummary">Có 00 mã cổ phiếu thoả điều kiện</span>
        </div>

        <div class="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button type="button" id="toggleDetailsBtn"
            class="w-[142.5px] h-[32.5px] rounded-full border border-[#051650] text-[#051650] hover:bg-[#051650] hover:text-white transition-colors text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
            <span>XEM CHI TIẾT</span>
            <svg class="w-3.5 h-3.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <button type="button" id="applyComparisonBtn"
            class="w-[80px] h-[28px] rounded-full bg-[#051650] text-white hover:bg-[#0E2168] transition-colors text-[11px] font-bold flex items-center justify-center shadow-sm">
            ÁP DỤNG
          </button>
        </div>
      </div>

      <!-- SECTION 5: DETAILS PANEL (Hidden 100% by default, opens only on XEM CHI TIẾT click) -->
      <div id="detailsPanel" class="hidden flex flex-col lg:flex-row items-start justify-between gap-[36px] pt-4">

        <!-- Left: Bảng Doanh Nghiệp -->
        <div class="w-full lg:w-[851px] h-auto lg:h-[249px] rounded-[12px] border border-[#051650] overflow-hidden flex flex-col justify-between bg-white">
          <div class="w-full h-full overflow-y-auto flex flex-col">
            <table class="w-full text-left text-xs table-fixed border-collapse">
              <thead class="bg-white text-[#051650] font-bold text-[11px] uppercase border-b border-[#818181] sticky top-0 z-10">
                <tr class="h-[46px]">
                  <th scope="col" class="w-[8%] px-2 text-center font-bold">STT</th>
                  <th scope="col" class="w-[38%] px-4 text-left font-bold">TÊN CÔNG TY</th>
                  <th scope="col" class="w-[14%] px-2 text-center font-bold">MÃ CP</th>
                  <th scope="col" class="w-[40%] px-6 text-right font-bold whitespace-nowrap">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody id="companyTableBody" class="divide-y divide-[#D7D7D7] text-[12px]">
                <tr>
                  <td colspan="4" class="py-10 text-center text-[#818181] text-xs italic">
                    Vui lòng chọn mã cổ phiếu vào khung để tiến hành lọc
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Khối Bảng So Sánh Chips -->
        <div class="w-full lg:w-[408px] h-auto lg:h-[249px] bg-[#F3F3F3] rounded-[12px] p-4 flex flex-col justify-between">
          <div id="comparisonBoxChips" class="grid grid-cols-6 gap-2 overflow-y-auto max-h-[190px]">
          </div>
          <p class="text-[10px] text-[#818181] text-center italic mt-2">Dải cổ phiếu so sánh đối chiếu đa chiều</p>
        </div>

      </div>

    </div>
  </main>

@endsection

@push('scripts')
  <script>
    // Live database companies injected for client-side search, filtering and chip selection
    window.BANKS_DATA = @json($banksData);
    window.SECTOR_AVERAGES = @json($sectorAverages);
    window.ANNUAL_AVERAGES = @json($annualAverages);
  </script>
  <script src="{{ asset('assets/js/flow-engine.js') }}?v={{ time() }}"></script>
@endpush
