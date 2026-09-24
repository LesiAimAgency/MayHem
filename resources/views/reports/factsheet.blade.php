@extends('layouts.app')

@section('title', 'MAYHEM - Báo Cáo Đơn Lẻ | Tra Cứu BCTC Ngân Hàng ' . ($factsheet['company']['short_name'] ?? 'BAB'))
@section('meta_description', 'Báo cáo tài chính chi tiết theo từng mã cổ phiếu, ma trận chỉ tiêu tài chính đa niên độ ngân hàng ' . ($factsheet['company']['short_name'] ?? 'BAB') . '.')

@section('content')

  <!-- Greeting Hero with 3 Quick Action Cards -->
  @include('partials.greeting-hero', ['activeCard' => 'factsheet'])

  <!-- Stock Selector Bar -->
  @include('reports.partials.factsheet-selector')

  <!-- Main Financial Content Container -->
  <main class="max-w-[1440px] w-full mx-auto px-9 pb-12 flex-1 space-y-4">
    
    <!-- Bank Title & KPI Snapshot Cards -->
    @include('reports.partials.factsheet-header')

    <!-- Data Controls Toolbar (Search, Filter Type, Export CSV, Compare) -->
    @include('reports.partials.factsheet-toolbar')

    <!-- 16 Indicators Financial Table -->
    @include('reports.partials.factsheet-table')

  </main>

@endsection

@push('scripts')
<script>
  // Search and filter client interactions on table rows
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('metricSearchInput');
    const rows = document.querySelectorAll('.metric-row');
    const filterBtns = document.querySelectorAll('.metric-filter-btn');

    let currentFilter = 'ALL';

    function applyFilter() {
      const query = (searchInput?.value || '').toLowerCase().trim();
      let visibleCount = 0;
      rows.forEach(row => {
        const type = row.getAttribute('data-type');
        const name = (row.getAttribute('data-name') || '').toLowerCase();
        const matchesQuery = !query || name.includes(query);
        const matchesType = (currentFilter === 'ALL') || (type === currentFilter);
        const show = matchesQuery && matchesType;
        row.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      const counter = document.getElementById('visibleMetricsCount');
      if (counter) counter.textContent = visibleCount;
      // Also update total shown in footer
      const totalEl = document.querySelector('#visibleMetricsCount + span');
      // no-op: total is static from PHP
    }

    searchInput?.addEventListener('input', applyFilter);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-[#051650]', 'text-white');
          // Restore original type-specific color
          const f = b.getAttribute('data-filter');
          if (f === 'FILL') {
            b.classList.add('bg-[#EBFBEE]', 'text-[#2F9E44]');
          } else if (f === 'TÍNH') {
            b.classList.add('bg-[#E7F0FD]', 'text-[#1971C2]');
          } else {
            b.classList.add('bg-[#F1F3F5]', 'text-[#495057]');
          }
        });
        // Activate clicked button
        btn.classList.add('bg-[#051650]', 'text-white');
        btn.classList.remove('bg-[#EBFBEE]', 'text-[#2F9E44]', 'bg-[#E7F0FD]', 'text-[#1971C2]', 'bg-[#F1F3F5]', 'text-[#495057]');
        currentFilter = btn.getAttribute('data-filter');
        applyFilter();
      });
    });
  });
</script>
@endpush
