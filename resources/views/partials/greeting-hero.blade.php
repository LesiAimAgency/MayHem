@props(['activeCard' => 'overview'])

<section class="max-w-[1440px] w-full mx-auto px-9 pt-4 pb-6">
  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

    <!-- Left: Greeting Typography -->
    <div class="space-y-0.5">
      <span class="text-[12px]  tracking-wider text-[#051650] font-medium hidden lg:inline-block select-none">
        ANOTHER DAY, ANOTHER DOLLAR
      </span>
      <h1 class="text-[49px] font-bold text-[#051650] leading-tight">Xin chào, Minh Quân</h1>
      <p class="text-[13px] text-[#818181] " style="margin-top:15px ">Hôm nay bạn muốn xem gì?</p>

    </div>

    <!-- Right: 3 Quick Action Cards -->
    <div class="flex flex-wrap sm:flex-nowrap gap-5 w-full lg:w-auto">

      <!-- Card 1: LỌC DỮ LIỆU -->
      <a href="{{ route('reports.overview') }}#loc-du-lieu"
        class="bg-white rounded-xl p-3.5 w-[221px] h-[82px] flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative group {{ $activeCard === 'overview' ? 'border-2 border-[#051650]' : 'border border-[#D7D7D7]/60' }}">
        <div class="flex items-start justify-between">
          <span class="text-[13px] font-bold tracking-wide text-[#051650]">LỌC DỮ LIỆU</span>
          <div
            class="w-5 h-5 rounded-full bg-[#051650] text-white flex items-center justify-center group-hover:bg-[#C8997D] transition-colors shrink-0">
            @if($activeCard === 'overview')
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            @else
              <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
              </svg>
            @endif
          </div>
        </div>
        <p class="text-[11px] text-[#818181] leading-tight">Lọc dữ liệu theo mã cổ phiếu và điều kiện</p>
      </a>

      <!-- Card 2: TRA CỨU -->
      <a href="{{ route('reports.factsheet') }}" id="heroFactsheetLink"
        class="bg-white rounded-xl p-3.5 w-[221px] h-[82px] flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative group {{ $activeCard === 'factsheet' ? 'border-2 border-[#051650]' : 'border border-[#D7D7D7]/60' }}">
        <div class="flex items-start justify-between">
          <span class="text-[13px] font-bold tracking-wide text-[#051650]">TRA CỨU</span>
          <div
            class="w-5 h-5 rounded-full bg-[#051650] text-white flex items-center justify-center group-hover:bg-[#C8997D] transition-colors shrink-0">
            @if($activeCard === 'factsheet')
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            @else
              <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
              </svg>
            @endif
          </div>
        </div>
        <p class="text-[11px] text-[#818181] leading-tight">Tra cứu và xem BCTC của từng mã cổ phiếu</p>
      </a>

      <!-- Card 3: SO SÁNH -->
      <a href="{{ route('reports.comparison') }}"
        class="bg-white rounded-xl p-3.5 w-[221px] h-[82px] flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative group {{ $activeCard === 'comparison' ? 'border-2 border-[#051650]' : 'border border-[#D7D7D7]/60' }}">
        <div class="flex items-start justify-between">
          <span class="text-[13px] font-bold tracking-wide text-[#051650]">SO SÁNH</span>
          <div
            class="w-5 h-5 rounded-full bg-[#051650] text-white flex items-center justify-center group-hover:bg-[#C8997D] transition-colors shrink-0">
            @if($activeCard === 'comparison')
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            @else
              <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
              </svg>
            @endif
          </div>
        </div>
        <p class="text-[11px] text-[#818181] leading-tight">So sánh hai hoặc nhiều mã cổ phiếu</p>
      </a>

    </div>
  </div>
</section>

