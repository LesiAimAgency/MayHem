<section class="max-w-[1440px] w-full mx-auto px-9 pb-5">
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="text-[15px] font-bold text-[#051650]">
      Nhập mã cổ phiếu bạn muốn xem chi tiết
    </div>

    <div class="flex items-center gap-4 w-full sm:w-auto">
      <form method="GET" action="{{ route('reports.factsheet') }}" class="flex items-center gap-4 w-full sm:w-auto">
        <div class="relative w-full sm:w-[296.5px]">
          <select name="ticker" id="stockSelector" 
                  class="w-full h-[32px] bg-white border border-[#818181] rounded-[8px] px-3 text-xs text-[#323232] appearance-none focus:outline-none focus:ring-1 focus:ring-[#051650] cursor-pointer pr-8 shadow-sm">
            @foreach($companies as $comp)
              <option value="{{ $comp->short_name }}" {{ $comp->short_name === $selectedTicker ? 'selected' : '' }}>
                {{ $comp->short_name }} - {{ $comp->company_name }}
              </option>
            @endforeach
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#818181]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>

        <button type="submit" id="viewDetailBtn"
                class="w-[108px] h-[30px] rounded-full bg-[#051650] text-white hover:bg-[#0E2168] transition-colors text-[11px] font-bold tracking-wide flex items-center justify-center shadow-sm">
          XEM CHI TIẾT
        </button>
      </form>
    </div>
  </div>
</section>
