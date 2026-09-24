<div id="compareVisualView" class="hidden space-y-6">

  @php
    // Group metrics for visual display
    $groupDefs = [
      'Thu Nhập & Tăng Trưởng'   => ['toi','growth_toi','net_op_profit_pre_provision','provision_credit_losses','pbt','growth_pbt','npat','parent_npat'],
      'Chi Phí & Hiệu Quả Vận Hành' => ['cir','sga','growth_cpvh','depreciation','depreciation_toi'],
      'Biên Lợi Nhuận'            => ['operating_margin','pbt_margin','npat_margin','parent_npat_margin','growth_parent_npat','eps'],
      'Lãi Suất & Nguồn Vốn'     => ['nim','cost_of_funds','cof_change','casa_ratio'],
      'Chất Lượng Tài Sản'        => ['npl_ratio','llr_coverage','doubtful_debt','doubtful_debt_change','loss_debt','loss_debt_change'],
      'Hiệu Quả Sinh Lời'         => ['roa','roe','cfo'],
      'Cấu Trúc Vốn & Quy Mô'    => ['total_assets','total_liabilities','owners_equity','car_ratio','debt_equity','retained_earnings'],
      'Dòng Tiền & Định Giá'      => ['dividends_paid','cff','capex','self_financing','owner_earnings','growth_oe','pe_ratio','pb_ratio','market_cap'],
    ];
    $lowerBetter = ['cir','npl_ratio','cost_of_funds','cof_change','doubtful_debt_change','loss_debt_change','debt_equity','provision_credit_losses','growth_cpvh'];

    // Build lookup: key => matrix row
    $matrixByKey = [];
    foreach ($comparison['matrix'] as $m) { $matrixByKey[$m['key']] = $m; }

    // Color palette per ticker index
    $barColors = ['bg-[#051650]','bg-[#C8997D]','bg-emerald-600','bg-blue-600','bg-violet-600','bg-rose-600'];
    $textColors = ['text-[#051650]','text-[#C8997D]','text-emerald-700','text-blue-700','text-violet-700','text-rose-700'];
  @endphp

  @foreach($groupDefs as $groupName => $groupKeys)
    @php
      // Only render group if at least 1 metric has data
      $hasData = false;
      foreach ($groupKeys as $gk) {
        if (isset($matrixByKey[$gk])) { $hasData = true; break; }
      }
    @endphp
    @if($hasData)
    <div class="space-y-3">
      {{-- Group header --}}
      <div class="flex items-center gap-3">
        <h3 class="text-[13px] font-black text-[#051650] uppercase tracking-wide">{{ $groupName }}</h3>
        <div class="flex-1 h-px bg-[#D7D7D7]"></div>
      </div>

      {{-- Metrics grid --}}
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        @foreach($groupKeys as $gk)
          @if(isset($matrixByKey[$gk]))
            @php
              $m = $matrixByKey[$gk];
              $isLower = in_array($gk, $lowerBetter);
              $direction = $isLower ? 'Càng thấp càng tốt' : 'Càng cao càng tốt';
              $dirColor  = $isLower ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

              // For latest mode: values = [ticker => val]
              // For 10years mode: values = [ticker => [year => val]] → use latest year
              $barData = [];
              foreach ($comparison['tickers'] as $ti => $t) {
                if ($comparison['mode'] === '10years') {
                  $v = $m['values'][$t][$comparison['year']] ?? null;
                } else {
                  $v = $m['values'][$t] ?? null;
                }
                $barData[] = ['ticker' => $t, 'value' => $v, 'color_idx' => $ti];
              }

              // Find max absolute value for bar scaling
              $maxAbs = 0.001;
              foreach ($barData as $bd) {
                if ($bd['value'] !== null && is_numeric($bd['value'])) {
                  $maxAbs = max($maxAbs, abs((float)$bd['value']));
                }
              }

              // Best ticker in this metric
              $bestTicker = null;
              if ($comparison['mode'] === '10years') {
                $bestTicker = $m['best_cells'][$comparison['year']] ?? null;
              } else {
                $bestTicker = $m['best_ticker'] ?? null;
              }
            @endphp
            <div class="bg-white rounded-xl border border-[#D7D7D7]/60 p-4 shadow-sm hover:shadow-md transition-shadow space-y-3">
              {{-- Card header --}}
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-[11px] font-black text-[#051650] leading-tight">{{ $m['name'] }}</div>
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded {{ $m['type'] === 'TÍNH' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200' }}">{{ $m['type'] }}</span>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded {{ $dirColor }}">{{ $direction }}</span>
                  </div>
                </div>
                <span class="text-[10px] text-[#818181] shrink-0">{{ $m['unit'] }}</span>
              </div>

              {{-- Bar chart per ticker --}}
              <div class="space-y-2">
                @foreach($barData as $bd)
                  @php
                    $v = $bd['value'];
                    $isBest = $bd['ticker'] === $bestTicker && $v !== null;
                    $ci = $bd['color_idx'];
                    $barW = ($v !== null && is_numeric($v)) ? min(100, max(4, (abs((float)$v) / $maxAbs) * 100)) : 0;
                    // Format value
                    if ($v !== null && is_numeric($v)) {
                      $fv = (float)$v;
                      if ($m['unit'] === '%')       $fStr = number_format($fv, 2) . '%';
                      elseif ($m['unit'] === 'Tỷ VND') $fStr = number_format($fv, 0) . ' tỷ';
                      elseif ($m['unit'] === 'Lần')  $fStr = number_format($fv, 2) . 'x';
                      elseif ($m['unit'] === 'VND/CP') $fStr = number_format($fv, 0);
                      else $fStr = $v;
                    } else { $fStr = null; }
                    $colors = [$barColors[$ci % count($barColors)]];
                  @endphp
                  <div class="space-y-0.5">
                    <div class="flex justify-between items-center text-[10px]">
                      <span class="{{ $isBest ? 'font-black text-emerald-700' : 'font-semibold text-[#323232]' }}">
                        {{ $bd['ticker'] }}
                        @if($isBest)<span class="text-emerald-600">★</span>@endif
                      </span>
                      <span class="font-mono {{ $isBest ? 'font-black text-emerald-700' : '' }}">
                        {{ $fStr ?? 'N/A' }}
                      </span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      @if($v !== null && $barW > 0)
                        <div class="{{ $isBest ? 'bg-emerald-500' : $barColors[$ci % count($barColors)] }} h-2 rounded-full transition-all duration-500"
                             style="width: {{ $barW }}%"></div>
                      @else
                        <div class="bg-gray-200 h-2 rounded-full" style="width: 100%; opacity: 0.3"></div>
                      @endif
                    </div>
                  </div>
                @endforeach
              </div>

              {{-- Formula hint --}}
              @if(!empty($m['formula']))
                <div class="text-[9px] text-[#818181] truncate border-t border-[#F0F0F0] pt-1.5" title="{{ $m['formula'] }}">= {{ $m['formula'] }}</div>
              @endif
            </div>
          @endif
        @endforeach
      </div>
    </div>
    @endif
  @endforeach

</div>
