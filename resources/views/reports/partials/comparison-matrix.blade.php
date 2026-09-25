<div id="compareTableView" class="bg-white rounded-xl shadow-sm border border-[#051650] overflow-hidden">
  @php
    $cMap = isset($companies) ? $companies->keyBy('short_name') : collect();
    $rawYears = $comparison['years'] ?? [$comparison['year'] ?? 2025];
    // Chỉ hiển thị các năm có số liệu thực tế, ẩn triệt để các cột năm chưa có dữ liệu (2015 - 2017)
    $years = array_values(array_filter($rawYears, function($yr) use ($comparison) {
      foreach ($comparison['matrix'] ?? [] as $m) {
        foreach ($comparison['tickers'] ?? [] as $t) {
          $v = $m['values'][$t][$yr] ?? null;
          if ($v !== null && $v !== '') return true;
        }
      }
      return false;
    }));
    if (empty($years)) {
      $years = $rawYears;
    }
  @endphp

  {{-- Header Toolbar with Scroll buttons & Stats --}}


  {{-- Scroll Container with Custom Scrollbar and Grab-to-Scroll --}}
  <div id="comparisonScrollContainer" class="overflow-x-auto custom-scrollbar select-none cursor-grab">
    <table id="comparisonMatrixTable" class="w-full text-left text-xs border-separate border-spacing-0">

      {{-- ===== HEADER (Hiển thị toàn bộ các năm đã lọc) ===== --}}
      <thead class="text-[#051650] font-bold text-[11px] uppercase border-b border-[#818181]">
        <tr class="h-[46px]">
          <th rowspan="2" class="col-sticky-stt px-2 text-center border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">STT</th>
          <th rowspan="2" class="col-sticky-type px-2 text-center border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">Loại</th>
          <th rowspan="2" class="col-sticky-name px-3.5 text-left border-r border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">Chỉ Tiêu Tài Chính</th>
          <th rowspan="2" class="col-sticky-unit px-2 text-center border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">ĐVT</th>
          @foreach($comparison['tickers'] as $t)
            <th colspan="{{ count($years) }}" class="px-3 py-1.5 text-center border-l-2 border-[#C8997D] border-b border-[#D7D7D7]/70 bg-[#F8F3EC]">
              <div class="flex flex-col items-center justify-center">
                <span class="text-[13px] font-black tracking-wider text-[#051650] font-sans">{{ $t }}</span>
              </div>
            </th>
          @endforeach
        </tr>
        <tr class="h-[28px] bg-[#F8F3EC]">
          @foreach($comparison['tickers'] as $t)
            @foreach($years as $yIdx => $yr)
              <th class="px-2.5 py-1 text-right font-mono font-bold text-[11px] text-[#051650] border-b border-[#D7D7D7]/70 bg-[#F8F3EC] min-w-[78px] {{ $yIdx === 0 ? 'border-l-2 border-[#C8997D]' : 'border-l border-[#D7D7D7]/40' }} {{ $loop->last ? 'bg-gray-100/60 font-black' : '' }}">
                {{ $yr }}
              </th>
            @endforeach
          @endforeach
        </tr>
      </thead>

      {{-- ===== BODY ===== --}}
      <tbody class="text-[12px]">

        @php
          if (!function_exists('fmtVal')) {
            function fmtVal($val, $unit) {
              if ($val === null || !is_numeric($val)) return null;
              $v = (float)$val;
              if ($unit === 'VND/CP') {
                return number_format($v, 0);
              }
              if ($unit === 'Tỷ VND') {
                return (abs($v - round($v)) < 0.001) ? number_format($v, 0) : number_format($v, 2);
              }
              if ($unit === '%' || $unit === 'Lần') {
                return number_format($v, 2);
              }
              return (abs($v - round($v)) < 0.001) ? number_format($v, 0) : number_format($v, 2);
            }
          }
        @endphp

        @foreach($comparison['matrix'] as $m)
          <tr class="comparison-row group transition-colors {{ ($loop->index % 2 === 1) ? 'bg-[#FAFAFA]' : 'bg-white' }}"
              data-type="{{ $m['type'] }}"
              data-key="{{ $m['key'] }}"
              data-name="{{ mb_strtolower($m['name']) }}">
            {{-- STT --}}
            <td class="col-sticky-stt px-2 py-2 text-center text-[#818181] font-semibold border-r border-b border-[#D7D7D7]/50">{{ $m['stt'] }}</td>

            {{-- Loại badge --}}
            <td class="col-sticky-type px-2 py-2 text-center border-r border-b border-[#D7D7D7]/50">
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
            <td class="col-sticky-unit px-2 py-2 text-center text-[#818181] text-[11px] border-b border-[#D7D7D7]/50">{{ $m['unit'] }}</td>

            {{-- Multi-year columns per ticker --}}
            @foreach($comparison['tickers'] as $t)
              @foreach($years as $yIdx => $yr)
                @php
                  $tickerVals = $m['values'][$t] ?? null;
                  $val = is_array($tickerVals) ? ($tickerVals[$yr] ?? ($tickerVals[(string)$yr] ?? null)) : $tickerVals;
                  $fmt = fmtVal($val, $m['unit']);
                  $isFirstYr = ($yIdx === 0);
                  $isLastYr = ($yIdx === count($years) - 1);
                @endphp
                <td class="px-2.5 py-2 text-right font-mono text-[12px] border-b border-[#D7D7D7]/40 {{ $isFirstYr ? 'border-l-2 border-[#C8997D]' : 'border-l border-[#D7D7D7]/30' }} {{ $isLastYr && count($years) > 1 ? 'bg-gray-50/40' : '' }} text-[#323232] group-hover:bg-[#F8F3EC]/40 transition-colors">
                  @if($fmt !== null)
                    {{ $fmt }}
                  @else
                    <span class="text-[#D7D7D7]">-</span>
                  @endif
                </td>
              @endforeach
            @endforeach

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
    cursor: grab;
  }

  #comparisonScrollContainer.is-dragging {
    cursor: grabbing !important;
    user-select: none !important;
  }

  #comparisonScrollContainer.is-dragging * {
    cursor: grabbing !important;
    user-select: none !important;
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
  window.initComparisonMatrixScroll = function() {
    const slider = document.getElementById('comparisonScrollContainer');
    if (!slider) return;

    const btnLeft = document.getElementById('btnScrollTableLeft');
    const btnRight = document.getElementById('btnScrollTableRight');

    if (btnLeft) {
      btnLeft.onclick = (e) => {
        e.preventDefault();
        slider.scrollBy({ left: -600, behavior: 'smooth' });
      };
    }
    if (btnRight) {
      btnRight.onclick = (e) => {
        e.preventDefault();
        slider.scrollBy({ left: 600, behavior: 'smooth' });
      };
    }

    // Check scroll offset to toggle is-scrolled class
    const updateScrollState = () => {
      if (slider.scrollLeft > 5) {
        slider.classList.add('is-scrolled');
      } else {
        slider.classList.remove('is-scrolled');
      }
    };

    slider.onscroll = updateScrollState;
    updateScrollState();

    // Mouse drag-to-scroll
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.onmousedown = (e) => {
      // Don't drag if clicking buttons, links, or inputs
      if (e.target.closest('button, a, input, select')) return;
      isDown = true;
      slider.classList.add('is-dragging');
      slider.classList.remove('cursor-grab');
      document.body.classList.add('select-none');
      startX = e.pageX;
      scrollLeft = slider.scrollLeft;
      e.preventDefault();
    };

    window.onmouseup = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('is-dragging');
      slider.classList.add('cursor-grab');
      document.body.classList.remove('select-none');
    };

    window.onmousemove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX;
      const walk = (x - startX) * 2; // Smooth 2x drag speed
      slider.scrollLeft = scrollLeft - walk;
    };

    // Wheel horizontal scrolling: vertical wheel scrolling turns into horizontal scrolling
    slider.onwheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        if (!e.ctrlKey) {
          slider.scrollLeft += e.deltaY * 1.5;
          e.preventDefault();
        }
      }
    };
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initComparisonMatrixScroll);
  } else {
    window.initComparisonMatrixScroll();
  }
</script>
