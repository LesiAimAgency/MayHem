@extends('layouts.app')

@section('title', 'MAYHEM - Báo Cáo So Sánh | Đối Chiếu Doanh Nghiệp Đa Chiều')
@section('meta_description', 'Bảng đối chiếu so sánh chỉ số tài chính đa chiều giữa các ngân hàng thương mại Việt Nam.')

@section('content')

  <!-- Greeting Hero with 3 Quick Action Cards -->
  @include('partials.greeting-hero', ['activeCard' => 'comparison'])

  <!-- Comparison Selection & Chips Bar -->
  @include('reports.partials.comparison-selector')

  <!-- Main Comparison Container -->
  <main class="max-w-[1440px] w-full mx-auto px-9 pb-12 flex-1 space-y-4">
    
    <!-- Table Header & View Mode Switcher -->
    <div class="bg-white rounded-xl shadow-sm border border-[#D7D7D7]/60 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-[17px] font-bold text-[#051650] leading-tight flex items-center gap-2">
          <span>Bảng Đối Chiếu Chỉ Số Tài Chính Đa Ngân Hàng</span>
          <span class="text-xs font-normal text-[#818181]">(Chỉ số tốt nhất được tô xanh đậm)</span>
        </h2>
        <p class="text-xs text-[#818181] mt-0.5">
          Nguồn số liệu: BCTC kiểm toán thực tế trong Database &bull; Đã chuẩn hóa qua MayHem Analytics
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button type="button" id="toggleCompareModeBtn" 
                class="px-4 py-2 rounded-lg bg-[#F8F3EC] border border-[#C8997D] text-[#051650] hover:bg-[#051650] hover:text-white transition-colors text-xs font-bold flex items-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          <span id="compareModeBtnText">Xem Biểu Đồ So Sánh Trực Quan</span>
        </button>
      </div>
    </div>

    <!-- View 1: Main Matrix Table -->
    @include('reports.partials.comparison-matrix')

    <!-- View 2: Visual Comparison Cards & Bars -->
    @include('reports.partials.comparison-charts')

  </main>

@endsection

@push('scripts')
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Toggle table view vs visual chart view
    const toggleBtn = document.getElementById('toggleCompareModeBtn');
    const tableView = document.getElementById('compareTableView');
    const visualView = document.getElementById('compareVisualView');
    const btnText = document.getElementById('compareModeBtnText');

    toggleBtn?.addEventListener('click', () => {
      const isVisual = !visualView.classList.contains('hidden');
      if (isVisual) {
        visualView.classList.add('hidden');
        tableView.classList.remove('hidden');
        btnText.textContent = 'Xem Biểu Đồ So Sánh Trực Quan';
      } else {
        tableView.classList.add('hidden');
        visualView.classList.remove('hidden');
        btnText.textContent = 'Xem Bảng Ma Trận Chi Tiết';
      }
    });

    // Add ticker to comparison
    const addSelector = document.getElementById('addCompareSelector');
    addSelector?.addEventListener('change', () => {
      const newTicker = addSelector.value;
      if (!newTicker) return;
      const currentUrl = new URL(window.location.href);
      const currentTickers = (currentUrl.searchParams.get('tickers') || 'ACB,ABB,VCB').split(',').map(s => s.trim()).filter(Boolean);
      if (!currentTickers.includes(newTicker)) {
        currentTickers.push(newTicker);
        currentUrl.searchParams.set('tickers', currentTickers.join(','));
        window.location.href = currentUrl.toString();
      }
    });

    // Remove ticker button
    document.querySelectorAll('.remove-ticker-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetTicker = btn.getAttribute('data-ticker');
        const currentUrl = new URL(window.location.href);
        let currentTickers = (currentUrl.searchParams.get('tickers') || 'ACB,ABB,VCB').split(',').map(s => s.trim()).filter(Boolean);
        currentTickers = currentTickers.filter(t => t !== targetTicker);
        if (currentTickers.length === 0) currentTickers = ['ACB'];
        currentUrl.searchParams.set('tickers', currentTickers.join(','));
        window.location.href = currentUrl.toString();
      });
    });
  });
</script>
@endpush
