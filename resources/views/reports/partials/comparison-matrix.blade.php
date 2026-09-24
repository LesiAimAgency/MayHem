<div id="compareTableView" class="bg-white rounded-xl shadow-sm border border-[#051650] overflow-hidden">
  {{-- Scroll Container with Custom Scrollbar and Grab-to-Scroll --}}
  <div id="comparisonScrollContainer" class="overflow-x-auto custom-scrollbar select-none">
    <table id="comparisonMatrixTable" class="w-full text-left text-xs border-separate border-spacing-0">

      @php
        $cMap = isset($companies) ? $companies->keyBy('short_name') : collect();
      @endphp

      {{-- ===== HEADER ===== --}}
      <thead class="text-[#051650] font-bold text-[11px] uppercase border-b border-[#818181]">

        @if($comparison['mode'] === '10years')
          {{-- Row 1: STT | Loại | Chỉ Tiêu | ĐVT | [BID colspan=N] | [CTG colspan=N] | ... --}}
          <tr class="h-[42px]">
            <th rowspan="2" class="col-sticky-stt px-2 text-center border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">STT</th>
            <th rowspan="2" class="col-sticky-type px-2 text-center border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">Loại</th>
            <th rowspan="2" class="col-sticky-name px-3.5 text-left border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">Chỉ Tiêu Tài Chính</th>
            <th rowspan="2" class="col-sticky-unit px-2 text-center border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">ĐVT</th>
            @foreach($comparison['tickers'] as $t)
              @php
                $cName = $cMap[$t]->company_name ?? $t;
              @endphp
              <th colspan="{{ count($comparison['years']) }}"
                  class="px-3 py-1.5 text-center border-l-2 border-[#C8997D] bg-[#051650] text-white border-b border-[#051650] font-bold tracking-wider">
                <div class="flex items-center justify-center gap-1.5">
                  <span class="text-[13px] font-black font-sans">{{ $t }}</span>
                  @if(!empty($cMap[$t]->company_name))
                    <span class="text-[9.5px] text-[#C8997D] font-normal font-sans hidden sm:inline truncate max-w-[140px]" title="{{ $cName }}">
                      &bull; {{ $cName }}
                    </span>
                  @endif
                </div>
              </th>
            @endforeach
          </tr>
          {{-- Row 2: Years sub-headers --}}
          <tr class="h-[34px]">
            @foreach($comparison['tickers'] as $tIdx => $t)
              @foreach($comparison['years'] as $yrIdx => $yr)
                @php
                  $isBankStart = ($yrIdx === 0 && $tIdx > 0);
                  $isLatestYr = ($yr === $comparison['year']);
                @endphp
                <th class="px-2 text-center font-semibold min-w-[76px] border-b border-[#D7D7D7]/60
                  {{ $isBankStart ? 'border-l-2 border-[#C8997D]' : 'border-l border-[#D7D7D7]/60' }}
                  {{ $isLatestYr ? 'bg-[#F8F3EC] text-[#051650] font-bold' : 'bg-[#FAFAFA] text-[#818181]' }}">
                  {{ $yr }}
                </th>
              @endforeach
            @endforeach
          </tr>

        @else
          {{-- Single year header (Latest mode) --}}
          <tr class="h-[50px]">
            <th class="col-sticky-stt px-2 text-center border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">STT</th>
            <th class="col-sticky-type px-2 text-center border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">Loại</th>
            <th class="col-sticky-name px-3.5 text-left border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">Chỉ Tiêu Tài Chính</th>
            <th class="col-sticky-unit px-2 text-center border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">ĐVT</th>
            @foreach($comparison['tickers'] as $t)
              @php
                $cName = $cMap[$t]->company_name ?? $t;
              @endphp
              <th class="px-4 py-2 text-right min-w-[140px] border-l-2 border-[#C8997D] border-b border-[#051650] bg-[#f8f3ec] text-white">
                <div class="flex flex-col items-end justify-center">
                  <span class="text-[13px] font-black tracking-wider text-[#051650] font-sans">{{ $t }}</span>
                  <span class="text-[10px] text-[#051650] font-normal truncate max-w-[160px] font-sans" title="{{ $cName }}">
                    {{ $cName }}
                  </span>
                </div>
              </th>
            @endforeach
          </tr>
        @endif

      </thead>

      {{-- ===== BODY ===== --}}
      <tbody class="text-[12px]">

        @php
          function fmtVal($val, $unit) {
            if ($val === null || !is_numeric($val)) return null;
            $v = (float)$val;
            if ($unit === '%')       return number_format($v, 2) . '%';
            if ($unit === 'Tỷ VND')  return number_format($v, 0) . ' tỷ';
            if ($unit === 'Lần')     return number_format($v, 2) . 'x';
            if ($unit === 'VND/CP')  return number_format($v, 0);
            return $val;
          }
        @endphp

        @foreach($comparison['matrix'] as $m)
          <tr class="group transition-colors {{ ($loop->index % 2 === 1) ? 'bg-[#FAFAFA]' : 'bg-white' }}">
            {{-- STT --}}
            <td class="col-sticky-stt px-2 py-2.5 text-center text-[#818181] font-semibold border-r border-b border-[#D7D7D7]/50">{{ $m['stt'] }}</td>

            {{-- Loại badge --}}
            <td class="col-sticky-type px-2 py-2.5 text-center border-r border-b border-[#D7D7D7]/50">
              @if($m['type'] === 'TÍNH')
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">TÍNH</span>
              @else
                <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">FILL</span>
              @endif
            </td>

            {{-- Tên chỉ tiêu --}}
            <td class="col-sticky-name px-3.5 py-2 font-semibold text-[#051650] border-r border-b border-[#D7D7D7]/50">
              <span class="block leading-snug line-clamp-2 text-[12px]" title="{{ $m['name'] }}">{{ $m['name'] }}</span>
            
            </td>

            {{-- ĐVT --}}
            <td class="col-sticky-unit px-2 py-2.5 text-center text-[#818181] text-[11px] border-b border-[#D7D7D7]/50">{{ $m['unit'] }}</td>

            @if($comparison['mode'] === '10years')
              {{-- Multi-year mode: ticker → year → value --}}
              @foreach($comparison['tickers'] as $tIdx => $t)
                @foreach($comparison['years'] as $yrIdx => $yr)
                  @php
                    $val = $m['values'][$t][$yr] ?? null;
                    $isBest = isset($m['best_cells'][$yr]) && $m['best_cells'][$yr] === $t;
                    $fmt = fmtVal($val, $m['unit']);
                    $isLatestYr = $yr === $comparison['year'];
                    $isBankStart = ($yrIdx === 0 && $tIdx > 0);
                  @endphp
                  <td class="px-2.5 py-2.5 text-right font-mono text-[11.5px] border-b border-[#D7D7D7]/40
                    {{ $isBankStart ? 'border-l-2 border-[#C8997D]/70' : 'border-l border-[#D7D7D7]/40' }}
                    {{ $isBest ? 'text-emerald-700 font-black bg-emerald-50/70' : ($isLatestYr ? 'text-[#051650]' : 'text-[#818181]') }}
                    group-hover:bg-[#F8F3EC]/40 transition-colors">
                    @if($fmt !== null)
                      {{ $fmt }}
                      @if($isBest)<span class="text-[9px] text-emerald-600 font-bold ml-0.5">★</span>@endif
                    @else
                      <span class="text-[#D7D7D7]">-</span>
                    @endif
                  </td>
                @endforeach
              @endforeach

            @else
              {{-- Single year mode: ticker → value --}}
              @foreach($comparison['tickers'] as $t)
                @php
                  $val = $m['values'][$t] ?? null;
                  $isBest = !empty($m['best_ticker']) && $t === $m['best_ticker'];
                  $fmt = fmtVal($val, $m['unit']);
                @endphp
                <td class="px-4 py-2.5 text-right font-mono text-[12px] border-l border-b border-[#D7D7D7]/40
                  {{ $isBest ? 'text-emerald-700 font-black bg-emerald-50/60' : 'text-[#323232]' }}
                  group-hover:bg-[#F8F3EC]/40 transition-colors">
                  @if($fmt !== null)
                    {{ $fmt }}
                    @if($isBest)<span class="text-[10px] text-emerald-600 font-bold ml-0.5">★</span>@endif
                  @else
                    <span class="text-[#D7D7D7]">-</span>
                  @endif
                </td>
              @endforeach
            @endif

          </tr>
        @endforeach

      </tbody>
    </table>
  </div>
</div>

{{-- Sticky Matrix Styles --}}
<style>
  #comparisonScrollContainer {
    position: relative;
    overflow-x: auto;
  }

  #comparisonMatrixTable {
    border-collapse: separate !important;
    border-spacing: 0 !important;
  }

  /* 4 Sticky Left Columns */
  .col-sticky-stt {
    position: sticky !important;
    left: 0px !important;
    width: 48px !important;
    min-width: 48px !important;
    max-width: 48px !important;
  }

  .col-sticky-type {
    position: sticky !important;
    left: 48px !important;
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;
  }

  .col-sticky-name {
    position: sticky !important;
    left: 104px !important;
    width: 270px !important;
    min-width: 270px !important;
    max-width: 270px !important;
  }

  .col-sticky-unit {
    position: sticky !important;
    left: 374px !important;
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;
    border-right: 1px solid #D7D7D7 !important;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }

  /* When scrolled horizontally: activate golden border & subtle depth shadow */
  #comparisonScrollContainer.is-scrolled .col-sticky-unit {
    border-right: 2px solid #C8997D !important;
    box-shadow: 4px 0 10px -2px rgba(5, 22, 80, 0.16) !important;
  }

  /* Header sticky cells have z-index 30 */
  #comparisonMatrixTable thead th.col-sticky-stt,
  #comparisonMatrixTable thead th.col-sticky-type,
  #comparisonMatrixTable thead th.col-sticky-name,
  #comparisonMatrixTable thead th.col-sticky-unit {
    z-index: 30 !important;
    background-color: #F8F3EC !important;
  }

  /* Body sticky cells z-index 15 */
  #comparisonMatrixTable tbody td.col-sticky-stt,
  #comparisonMatrixTable tbody td.col-sticky-type,
  #comparisonMatrixTable tbody td.col-sticky-name,
  #comparisonMatrixTable tbody td.col-sticky-unit {
    z-index: 15 !important;
  }

  /* Row backgrounds for sticky cells (prevent data scrolling under from showing through) */
  #comparisonMatrixTable tbody tr:nth-child(odd) td.col-sticky-stt,
  #comparisonMatrixTable tbody tr:nth-child(odd) td.col-sticky-type,
  #comparisonMatrixTable tbody tr:nth-child(odd) td.col-sticky-name,
  #comparisonMatrixTable tbody tr:nth-child(odd) td.col-sticky-unit {
    background-color: #FFFFFF;
  }

  #comparisonMatrixTable tbody tr:nth-child(even) td.col-sticky-stt,
  #comparisonMatrixTable tbody tr:nth-child(even) td.col-sticky-type,
  #comparisonMatrixTable tbody tr:nth-child(even) td.col-sticky-name,
  #comparisonMatrixTable tbody tr:nth-child(even) td.col-sticky-unit {
    background-color: #FAFAFA;
  }

  /* Row hover background on sticky cells */
  #comparisonMatrixTable tbody tr:hover td.col-sticky-stt,
  #comparisonMatrixTable tbody tr:hover td.col-sticky-type,
  #comparisonMatrixTable tbody tr:hover td.col-sticky-name,
  #comparisonMatrixTable tbody tr:hover td.col-sticky-unit {
    background-color: #F5EFE6 !important;
  }
</style>

{{-- Horizontal Scroll & Drag Handler --}}
<script>
  (function() {
    const slider = document.getElementById('comparisonScrollContainer');
    if (!slider) return;

    // Check scroll offset to toggle is-scrolled class
    const updateScrollState = () => {
      if (slider.scrollLeft > 5) {
        slider.classList.add('is-scrolled');
      } else {
        slider.classList.remove('is-scrolled');
      }
    };

    slider.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();

    // Mouse drag-to-scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, a, input, select')) return;
      isDown = true;
      slider.classList.add('cursor-grabbing');
      slider.classList.remove('cursor-grab');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('cursor-grabbing');
    });

    slider.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('cursor-grabbing');
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    });
  })();
</script>
