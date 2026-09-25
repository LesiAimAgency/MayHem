<!-- Modal Chỉnh Sửa Dữ Liệu BCTC (FILL) & Tự Động Tính Lại (TÍNH) - Chuẩn 100% lọc.svg (1368x1087) -->
<div id="editFinancialDataModal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto select-none transition-all duration-150">
  
  @php
    $companyName = $factsheet['company']['company_name'] ?? 'Ngân hàng TMCP Á Châu';
    $companyTicker = $factsheet['company']['short_name'] ?? ($selectedTicker ?? 'ACB');
    
    // Lấy chính xác các năm có số liệu báo cáo trong database (từ năm 2016 trở đi)
    $modalYears = !empty($factsheet['years']) ? array_values(array_filter($factsheet['years'], fn($y) => (int)$y >= 2016)) : [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    
    // Mặc định chọn năm gần nhất có dữ liệu (2023 hoặc năm cuối)
    $activeYear = in_array(2023, $modalYears) ? 2023 : (end($modalYears) ?: 2023);

    // Chuẩn bị map dữ liệu và metadata (đơn vị tính, loại chỉ tiêu, tên) trực tiếp từ database
    $metricsMap = [];
    $metricMetaMap = [];
    if (!empty($factsheet['all_metrics'])) {
      foreach ($factsheet['all_metrics'] as $m) {
        $k = $m['key'] ?? '';
        if ($k) {
          $metricsMap[$k] = $m['values'] ?? [];
          $metricMetaMap[$k] = [
            'name' => $m['name'] ?? '',
            'unit' => $m['unit'] ?? '',
            'type' => $m['type'] ?? '',
          ];
        }
      }
    }

    // Danh sách 30 chỉ tiêu đúng chuẩn tên, key, loại (FILL/TÍNH) và đơn vị tính (ĐVT) gốc từ database
    $modal30Fields = [
      // Hàng 1
      ['key' => 'toi', 'name' => 'Tổng thu nhập hoạt động (TOI)', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'growth_toi', 'name' => 'Tăng trưởng TOI', 'type' => 'TÍNH', 'unit' => '%'],
      ['key' => 'cir', 'name' => 'Tỷ lệ Chi phí / Thu nhập (CIR)', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'net_op_profit_pre_provision', 'name' => 'LNT từ HĐKD trước chi phí DPRR', 'type' => 'FILL', 'unit' => 'Tỷ VND'],

      // Hàng 2
      ['key' => 'provision_credit_losses', 'name' => 'Chi phí dự phòng rủi ro tín dụng', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'pbt', 'name' => 'Tổng lợi nhuận trước thuế (PBT)', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'npat', 'name' => 'LNST thu nhập doanh nghiệp', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'parent_npat', 'name' => 'LNST của cổ đông công ty mẹ', 'type' => 'FILL', 'unit' => 'Tỷ VND'],

      // Hàng 3
      ['key' => 'eps', 'name' => 'Lãi cơ bản trên cổ phiếu (EPS)', 'type' => 'FILL', 'unit' => 'VND/CP'],
      ['key' => 'depreciation', 'name' => 'Chi Khấu hao TSCĐ', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'nim', 'name' => 'Biên lãi thuần (NIM)', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'cost_of_funds', 'name' => 'Chi phí vốn bình quân', 'type' => 'FILL', 'unit' => '%'],

      // Hàng 4
      ['key' => 'npl_ratio', 'name' => 'Tỷ lệ nợ xấu (NPL) cuối năm', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'casa_ratio', 'name' => 'Tỷ lệ tiền gửi không kỳ hạn (CASA)', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'total_assets', 'name' => 'Tổng tài sản', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'cfo', 'name' => 'Lưu chuyển tiền thuần từ HĐKD', 'type' => 'FILL', 'unit' => 'Tỷ VND'],

      // Hàng 5
      ['key' => 'dividends_paid', 'name' => 'Cổ tức trả CĐ lợi nhuận đã chia', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'cff', 'name' => 'LCTT từ hoạt động tài chính', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'doubtful_debt', 'name' => 'Nợ nghi ngờ', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'loss_debt', 'name' => 'Nợ xấu có khả năng mất vốn', 'type' => 'FILL', 'unit' => 'Tỷ VND'],

      // Hàng 6
      ['key' => 'llr_coverage', 'name' => 'Tỷ lệ bao phủ nợ xấu', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'total_liabilities', 'name' => 'Tổng nợ phải trả', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'car_ratio', 'name' => 'Hệ số an toàn vốn (CAR)', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'owners_equity', 'name' => 'Vốn chủ sở hữu', 'type' => 'FILL', 'unit' => 'Tỷ VND'],

      // Hàng 7
      ['key' => 'roa', 'name' => 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'roe', 'name' => 'Tỷ suất sinh lời trên Vốn CSH (ROE)', 'type' => 'FILL', 'unit' => '%'],
      ['key' => 'capex', 'name' => 'CAPEX', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
      ['key' => 'pe_ratio', 'name' => 'Chỉ số P/E cơ bản', 'type' => 'FILL', 'unit' => 'Lần'],

      // Hàng 8 (Chỉ có 2 cột đầu, cột 3 trống, cột 4 là nút Lưu)
      ['key' => 'pb_ratio', 'name' => 'Chỉ số P/B', 'type' => 'FILL', 'unit' => 'Lần'],
      ['key' => 'retained_earnings', 'name' => 'Lợi nhuận sau thuế chưa phân phối', 'type' => 'FILL', 'unit' => 'Tỷ VND'],
    ];
  @endphp

  <!-- Modal Dialog Container (1368px x 1087px chuẩn lọc.svg) -->
  <div class="relative w-full max-w-[1368px] min-h-[960px] bg-[#F2F2F2] rounded-2xl shadow-2xl p-6 sm:p-9 flex flex-col justify-between overflow-x-hidden my-auto border border-[#D7D7D7]/60 animate-in zoom-in-95 duration-150">
    
    <!-- Top-Right Close Button: x: 1326.5, y: 24.5, w: 25, h: 25, rx: 12.5, stroke: black -->
    <button type="button" id="btnCloseEditModal"
            class="absolute top-6 right-6 w-[25px] h-[25px] rounded-full border border-black flex items-center justify-center text-black hover:bg-black/10 transition-colors cursor-pointer select-none leading-none text-xs font-bold"
            title="Đóng modal">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L9 9M9 1L1 9" stroke="black" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- Top Header: Subtitle, Title (Left) + 2 Selectors (Right) -->
    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pr-10">
      
      <!-- Left Titles -->
      <div class="flex flex-col justify-center">
        <p class="text-[13px] sm:text-[14px] text-[#4A5568] font-normal leading-tight mb-1 font-sans">
          Chỉnh sửa dữ liệu Báo Cáo Tài Chính
        </p>
        <h1 class="text-[24px] sm:text-[32px] font-black tracking-tight text-[#051650] uppercase leading-none font-sans" id="modalCompanyTitle">
          {{ strtoupper($companyName) }}
        </h1>
      </div>

      <!-- Right Selectors: Nhóm ngành (296.5px) + Mã cổ phiếu (332.5px) -->
      <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 lg:gap-6">
        
        <!-- Nhóm ngành -->
        <div class="relative w-full sm:w-[296.5px]">
          <label class="block text-[13px] text-[#051650] font-normal mb-1.5 font-sans">Nhóm ngành</label>
          <div class="relative w-full h-[28.5px]">
            <select id="modalSectorSelect"
                    class="w-full h-[28.5px] bg-white border border-[#818181] rounded-[7.75px] px-3 pr-8 text-[12px] text-[#051650] font-normal focus:outline-none appearance-none cursor-pointer">
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
                <option value="{{ strtolower($sCode) }}" {{ $isBank ? 'selected' : '' }}>
                  {{ $sName }}
                </option>
              @endforeach
            </select>
            <div class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#818181]">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#818181" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Nhập mã cổ phiếu bạn muốn xem chi tiết -->
        <div class="relative w-full sm:w-[332.5px]">
          <label class="block text-[13px] text-[#051650] font-normal mb-1.5 font-sans">Nhập mã cổ phiếu bạn muốn xem chi tiết</label>
          <div class="relative w-full h-[28.5px]">
            <select id="modalStockSelect"
                    class="w-full h-[28.5px] bg-white border border-[#818181] rounded-[7.75px] px-3 pr-8 text-[12px] text-[#051650] font-normal focus:outline-none appearance-none cursor-pointer truncate">
              @foreach($companies ?? [] as $comp)
                <option value="{{ $comp->short_name }}" {{ $comp->short_name === $companyTicker ? 'selected' : '' }}>
                  {{ $comp->company_name }} - {{ $comp->short_name }}
                </option>
              @endforeach
            </select>
            <div class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#818181]">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#818181" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Year Filter Bar: "Năm tài chính" + 14 Year Pills (2012 -> 2025) -->
    <div class="mt-6 mb-5">
      <div class="text-[13px] text-[#051650] font-normal mb-2 font-sans">Năm tài chính</div>
      <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1" id="modalYearTabs">
        @foreach($modalYears as $y)
          <button type="button"
                  class="modal-year-pill min-w-[67px] sm:min-w-[70px] h-[27px] rounded-[4px] text-[12px] flex items-center justify-center cursor-pointer transition-all {{ $y === $activeYear ? 'bg-[#051650] text-white font-bold shadow-xs' : 'bg-white text-[#051650] font-normal hover:bg-gray-100 shadow-2xs' }}"
                  data-year="{{ $y }}">
            {{ $y }}
          </button>
        @endforeach
      </div>
    </div>

    <!-- 30 Form Fields (4 columns x 8 rows chuẩn lọc.svg) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5 lg:gap-y-6 flex-1" id="modalFieldsGrid">
      @foreach($modal30Fields as $index => $field)
        @php
          $k = $field['key'];
          $val = $metricsMap[$k][$activeYear] ?? null;
          $formattedVal = $val !== null ? (string)$val : '';
          $unit = $metricMetaMap[$k]['unit'] ?? $field['unit'];
          $type = $metricMetaMap[$k]['type'] ?? $field['type'];
          $name = $field['name'];
        @endphp
        <div class="flex flex-col justify-end">
          <label for="modal_input_{{ $k }}" class="text-[13px] font-bold text-[#051650] mb-1.5 truncate font-sans cursor-pointer" title="{{ $name }} ({{ $unit }})">
            {{ $name }}
          </label>
          <div class="relative flex items-center bg-transparent border border-[#818181] rounded-[7.75px] h-[27.5px] px-2.5 transition-all focus-within:border-[#051650] focus-within:ring-1 focus-within:ring-[#051650] modal-input-box" data-key="{{ $k }}">
            <input type="text"
                   id="modal_input_{{ $k }}"
                   name="{{ $name }}"
                   class="modal-metric-input w-full bg-transparent text-[13px] font-mono text-[#051650] focus:outline-none placeholder-[#818181] text-left"
                   data-key="{{ $k }}"
                   data-name="{{ $name }}"
                   data-unit="{{ $unit }}"
                   data-type="{{ $type }}"
                   data-old="{{ $formattedVal }}"
                   value="{{ $formattedVal }}"
                   placeholder="-"
                   title="{{ $name }}"
                   autocomplete="off" />
            <span class="metric-unit-text text-[10px] text-[#818181] shrink-0 ml-1.5 font-medium select-none" data-key="{{ $k }}">
              {{ $unit }}
            </span>
          </div>
        </div>
      @endforeach

      <!-- Empty Slot for Row 8 Col 3 -->
      <div class="hidden lg:block"></div>

      <!-- Button LƯU DỮ LIỆU for Row 8 Col 4 (x: 1178, y: 1007, w: 154, h: 40, rx: 20, fill: #051650) -->
      <div class="flex items-end justify-end">
        <button type="button" id="btnSubmitModalSave"
                class="w-[154px] h-[40px] rounded-[20px] bg-[#051650] text-white text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0E2168] active:scale-95 transition-all shadow-md ml-auto cursor-pointer select-none">
          <svg id="btnSaveSpinner" class="hidden animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span id="btnSaveText">LƯU DỮ LIỆU</span>
        </button>
      </div>

    </div>

  </div>

</div>

<!-- Data Dictionary Embed for Instant Client-Side Switching & Calculation -->
<script>
  window.modalMetricsData = @json($metricsMap);
  window.modalCurrentTicker = '{{ $companyTicker }}';
  window.modalActiveYear = {{ $activeYear }};
</script>
