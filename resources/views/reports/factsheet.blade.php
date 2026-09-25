@extends('layouts.app')

@section('title', 'MAYHEM - Báo Cáo Đơn Lẻ | Tra Cứu BCTC Ngân Hàng ' . ($factsheet['company']['short_name'] ?? 'ABB'))
@section('meta_description', 'Báo cáo tài chính chi tiết theo từng mã cổ phiếu, ma trận chỉ tiêu tài chính đa niên độ ngân hàng ' . ($factsheet['company']['short_name'] ?? 'ABB') . '.')

@section('content')

  <!-- Greeting Hero with 3 Quick Action Cards -->
  @include('partials.greeting-hero', ['activeCard' => 'factsheet'])

  <!-- Stock & Industry Selector Bar (Chuẩn lọc.svg) -->
  @include('reports.partials.factsheet-selector')

  <!-- Main Financial Content Container -->
  <main class="max-w-[1440px] w-full mx-auto px-4 sm:px-9  pb-12 flex-1 space-y-4">
    
    <!-- Toast Notification -->
    <div id="factsheetToast" class="fixed bottom-5 right-5 z-50 hidden max-w-md bg-[#051650] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
      <div id="toastIcon" class="w-6 h-6 rounded-full bg-[#2F9E44] flex items-center justify-center shrink-0">
        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p id="toastMessage" class="text-xs font-semibold leading-snug">Thông báo</p>
    </div>

    <!-- AJAX Content Wrapper with Smooth Loading Overlay -->
    <div id="factsheetContentWrapper" class="relative transition-all duration-200 space-y-4">
      
      <!-- Loading indicator overlay -->
      <div id="factsheetLoadingOverlay" class="hidden absolute inset-0 bg-white/75 backdrop-blur-xs z-30 flex items-center justify-center rounded-xl transition-opacity duration-200 min-h-[300px]">
        <div class="flex items-center gap-3 px-5 py-3 rounded-xl bg-white shadow-xl border border-[#D7D7D7]">
          <svg class="animate-spin h-5 w-5 text-[#051650]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span id="loadingOverlayText" class="text-xs font-bold text-[#051650]">Đang tải dữ liệu BCTC...</span>
        </div>
      </div>

      <!-- Financial Table Wrapper (Clean Read-Only View) -->
      <div id="factsheetTableWrapper">
        @include('reports.partials.factsheet-table')
      </div>
    </div>

  </main>

  <!-- Modal Chỉnh Sửa Dữ Liệu BCTC Wrapper -->
  <div id="factsheetEditModalWrapper">
    @include('reports.partials.factsheet-edit-modal')
  </div>

@endsection

@push('scripts')
<script>
  document.addEventListener('DOMContentLoaded', () => {
    let currentTicker = '{{ $selectedTicker ?? "ABB" }}';
    let currentFilter = 'ALL';
    let isFactsheetLoading = false;

    // Toast helper
    function showToast(message, isSuccess = true) {
      const toast = document.getElementById('factsheetToast');
      const toastMsg = document.getElementById('toastMessage');
      const toastIcon = document.getElementById('toastIcon');
      if (!toast || !toastMsg) return;

      toastMsg.textContent = message;
      if (toastIcon) {
        toastIcon.className = `w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isSuccess ? 'bg-[#2F9E44]' : 'bg-[#E03131]'}`;
      }

      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 4000);
    }

    // -------------------------------------------------------------
    // 1. SELECTOR DROPDOWNS INTERACTION (Nhóm ngành + Mã Cổ Phiếu)
    // -------------------------------------------------------------
    const industryInput = document.getElementById('industryInput');
    const toggleIndustryBtn = document.getElementById('toggleIndustryDropdownBtn');
    const industryMenu = document.getElementById('industryDropdownMenu');
    const industryChevron = document.getElementById('industryChevronIcon');
    const industryOptions = document.querySelectorAll('.industry-option-item');

    const stockInput = document.getElementById('stockSearchInput');
    const toggleStockBtn = document.getElementById('toggleStockDropdownBtn');
    const clearStockBtn = document.getElementById('clearStockSearchBtn');
    const stockMenu = document.getElementById('stockDropdownMenu');
    const stockChevron = document.getElementById('stockChevronIcon');
    const stockOptions = document.querySelectorAll('.stock-option-item');
    const stockEmpty = document.getElementById('stockSearchEmpty');

    function toggleIndustryMenu(show) {
      if (!industryMenu) return;
      const isVisible = !industryMenu.classList.contains('hidden');
      const willShow = show !== undefined ? show : !isVisible;
      if (willShow) {
        industryMenu.classList.remove('hidden');
        if (industryChevron) industryChevron.classList.add('rotate-180');
        toggleStockMenu(false);
      } else {
        industryMenu.classList.add('hidden');
        if (industryChevron) industryChevron.classList.remove('rotate-180');
      }
    }

    industryInput?.addEventListener('click', () => toggleIndustryMenu());
    toggleIndustryBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleIndustryMenu();
    });

    industryOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const code = opt.getAttribute('data-code');
        const name = opt.getAttribute('data-name');
        if (industryInput) {
          industryInput.value = name;
          industryInput.setAttribute('data-selected', code);
        }
        toggleIndustryMenu(false);

        // if (code !== 'ngan-hang') {
        //   showToast(`Nhóm ngành ${name} hiện chưa có dữ liệu BCTC trong database (chỉ có dữ liệu 28 ngân hàng).`, false);
        // }
      });
    });

    function toggleStockMenu(show) {
      if (!stockMenu) return;
      const isVisible = !stockMenu.classList.contains('hidden');
      const willShow = show !== undefined ? show : !isVisible;
      if (willShow) {
        stockMenu.classList.remove('hidden');
        if (stockChevron) stockChevron.classList.add('rotate-180');
        toggleIndustryMenu(false);
      } else {
        stockMenu.classList.add('hidden');
        if (stockChevron) stockChevron.classList.remove('rotate-180');
      }
    }

    toggleStockBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleStockMenu();
    });

    stockInput?.addEventListener('focus', () => {
      toggleStockMenu(true);
      if (clearStockBtn && stockInput.value.trim() !== '') {
        clearStockBtn.classList.remove('hidden');
      }
    });

    stockInput?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (clearStockBtn) {
        clearStockBtn.classList.toggle('hidden', query === '');
      }
      toggleStockMenu(true);

      let matchCount = 0;
      stockOptions.forEach(item => {
        const ticker = (item.getAttribute('data-ticker') || '').toLowerCase();
        const compName = (item.getAttribute('data-name') || '').toLowerCase();
        const matches = ticker.includes(query) || compName.includes(query);
        item.style.display = matches ? '' : 'none';
        if (matches) matchCount++;
      });

      if (stockEmpty) {
        stockEmpty.classList.toggle('hidden', matchCount > 0);
      }
    });

    clearStockBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (stockInput) {
        stockInput.value = '';
        stockInput.focus();
        clearStockBtn.classList.add('hidden');
        stockOptions.forEach(item => item.style.display = '');
        if (stockEmpty) stockEmpty.classList.add('hidden');
        toggleStockMenu(true);
      }
    });

    stockOptions.forEach(item => {
      item.addEventListener('click', () => {
        const ticker = item.getAttribute('data-ticker');
        const name = item.getAttribute('data-name');
        if (stockInput) {
          stockInput.value = `${ticker} - ${name}`;
          stockInput.setAttribute('data-selected-ticker', ticker);
        }
        toggleStockMenu(false);

        stockOptions.forEach(o => o.classList.remove('bg-[#F8F3EC]/70', 'font-bold'));
        item.classList.add('bg-[#F8F3EC]/70', 'font-bold');

        if (ticker !== currentTicker) {
          loadFactsheetAjax(ticker);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#industrySelectorContainer')) {
        toggleIndustryMenu(false);
      }
      if (!e.target.closest('#stockSelectorContainer')) {
        toggleStockMenu(false);
      }
    });


    // -------------------------------------------------------------
    // 2. MAIN TABLE FILTER INTERACTIONS (Search & All / FILL / TÍNH)
    // -------------------------------------------------------------
    function bindTableInteractions() {
      const searchInput = document.getElementById('metricSearchInput');
      const rows = document.querySelectorAll('.metric-row');
      const filterBtns = document.querySelectorAll('.metric-filter-btn');

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
      }

      searchInput?.addEventListener('input', applyFilter);

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => {
            b.classList.remove('bg-[#051650]', 'text-white');
            const f = b.getAttribute('data-filter');
            if (f === 'FILL') {
              b.classList.add('bg-[#EBFBEE]', 'text-[#2F9E44]');
            } else if (f === 'TÍNH') {
              b.classList.add('bg-[#E7F0FD]', 'text-[#1971C2]');
            } else {
              b.classList.add('bg-[#F1F3F5]', 'text-[#495057]');
            }
          });
          btn.classList.add('bg-[#051650]', 'text-white');
          btn.classList.remove('bg-[#EBFBEE]', 'text-[#2F9E44]', 'bg-[#E7F0FD]', 'text-[#1971C2]', 'bg-[#F1F3F5]', 'text-[#495057]');
          currentFilter = btn.getAttribute('data-filter');
          applyFilter();
        });
      });
    }


    // -------------------------------------------------------------
    // 3. MODAL EDIT FINANCIAL DATA (Chuẩn 100% lọc.svg)
    // -------------------------------------------------------------
    window.modalModifiedValues = window.modalModifiedValues || {};

    function bindModalInteractions() {
      const modal = document.getElementById('editFinancialDataModal');
      const btnOpen = document.getElementById('btnOpenEditModal');
      const btnClose = document.getElementById('btnCloseEditModal');
      const btnSubmit = document.getElementById('btnSubmitModalSave');
      const yearPills = document.querySelectorAll('.modal-year-pill');
      const metricInputs = document.querySelectorAll('.modal-metric-input');
      const modalStockSelect = document.getElementById('modalStockSelect');
      const modalSectorSelect = document.getElementById('modalSectorSelect');

      // Initialize active year from global or default 2023 (năm có dữ liệu chuẩn)
      let activeYear = window.modalActiveYear || 2023;

      // Update fields for a given year
      function renderYearFields(year) {
        activeYear = year;
        window.modalActiveYear = year;

        // Update pills UI
        yearPills.forEach(pill => {
          const py = parseInt(pill.getAttribute('data-year'));
          if (py === year) {
            pill.className = 'modal-year-pill min-w-[67px] sm:min-w-[70px] h-[27px] rounded-[4px] text-[12px] flex items-center justify-center cursor-pointer transition-all bg-[#051650] text-white font-bold shadow-xs';
          } else {
            pill.className = 'modal-year-pill min-w-[67px] sm:min-w-[70px] h-[27px] rounded-[4px] text-[12px] flex items-center justify-center cursor-pointer transition-all bg-white text-[#051650] font-normal hover:bg-gray-100 shadow-2xs';
          }
        });

        // Update input values
        metricInputs.forEach(input => {
          const key = input.getAttribute('data-key');
          const box = input.closest('.modal-input-box');
          const dbVal = window.modalMetricsData?.[key]?.[year];
          const dbFormatted = (dbVal !== undefined && dbVal !== null) ? String(dbVal) : '';
          
          input.dataset.old = dbFormatted;
          input.placeholder = dbFormatted !== '' ? dbFormatted : '-';

          // Check if user has an uncommitted modification for this year & key
          if (window.modalModifiedValues[year] && window.modalModifiedValues[year][key] !== undefined) {
            input.value = window.modalModifiedValues[year][key];
            if (box) {
              box.classList.add('border-[#2F9E44]', 'bg-[#EBFBEE]/30', 'ring-1', 'ring-[#2F9E44]');
              box.classList.remove('border-[#818181]');
            }
          } else {
            input.value = dbFormatted;
            if (box) {
              box.classList.remove('border-[#2F9E44]', 'bg-[#EBFBEE]/30', 'ring-1', 'ring-[#2F9E44]');
              box.classList.add('border-[#818181]');
            }
          }
        });
      }

      // Open Modal
      btnOpen?.addEventListener('click', () => {
        if (modal) {
          modal.classList.remove('hidden');
          renderYearFields(window.modalActiveYear || 2023);
        }
      });

      // Close Modal
      function closeModal() {
        if (!modal) return;
        window.modalModifiedValues = {};
        renderYearFields(activeYear);
        modal.classList.add('hidden');
      }

      btnClose?.addEventListener('click', closeModal);

      // Close when clicking directly on backdrop
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });

      // Switch Year Pills
      yearPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const y = parseInt(pill.getAttribute('data-year'));
          renderYearFields(y);
        });
      });

      // Input changes handling: Chỉ đánh dấu và lưu ô mà người dùng thực sự nhập
      metricInputs.forEach(input => {
        input.addEventListener('input', () => {
          const key = input.getAttribute('data-key');
          const oldVal = (input.dataset.old || '').trim();
          const newVal = input.value.trim();
          const box = input.closest('.modal-input-box');

          window.modalModifiedValues[activeYear] = window.modalModifiedValues[activeYear] || {};
          
          if (newVal !== oldVal) {
            window.modalModifiedValues[activeYear][key] = newVal;
            if (box) {
              box.classList.add('border-[#2F9E44]', 'bg-[#EBFBEE]/30', 'ring-1', 'ring-[#2F9E44]');
              box.classList.remove('border-[#818181]');
            }
          } else {
            delete window.modalModifiedValues[activeYear][key];
            if (box) {
              box.classList.remove('border-[#2F9E44]', 'bg-[#EBFBEE]/30', 'ring-1', 'ring-[#2F9E44]');
              box.classList.add('border-[#818181]');
            }
          }
        });
      });

      // Stock Dropdown inside modal
      modalStockSelect?.addEventListener('change', (e) => {
        const newTicker = e.target.value;
        if (newTicker && newTicker !== currentTicker) {
          loadFactsheetAjax(newTicker);
        }
      });

      // Sector Dropdown inside modal
      modalSectorSelect?.addEventListener('change', (e) => {
        // Sector change handler
      });

      // Submit modal changes (Nút LƯU DỮ LIỆU)
      btnSubmit?.addEventListener('click', async () => {
        // Collect all updates from modified values
        const updates = [];
        for (const y in window.modalModifiedValues) {
          for (const k in window.modalModifiedValues[y]) {
            const v = window.modalModifiedValues[y][k];
            const clean = String(v ?? '').replace(/,/g, '').trim();
            const parsedVal = (clean !== '' && !isNaN(clean)) ? parseFloat(clean) : null;
            updates.push({
              key: k,
              year: parseInt(y),
              value: parsedVal
            });
          }
        }

        if (updates.length === 0) {
          showToast('Không có dữ liệu nào thay đổi.');
          closeModal();
          return;
        }

        // Ticker target for updates
        const targetTicker = document.getElementById('modalStockSelect')?.value 
          || window.modalCurrentTicker 
          || currentTicker 
          || 'ABB';

        const saveSpinner = document.getElementById('btnSaveSpinner');
        const saveText = document.getElementById('btnSaveText');

        if (btnSubmit) btnSubmit.disabled = true;
        if (saveSpinner) saveSpinner.classList.remove('hidden');
        if (saveText) saveText.textContent = 'ĐANG LƯU...';

        try {
          const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
          const res = await fetch('/don-le/update-metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken || '',
              'X-Requested-With': 'XMLHttpRequest',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              ticker: targetTicker,
              updates: updates
            })
          });

          let data = null;
          try {
            data = await res.json();
          } catch (_) {}

          if (!res.ok || !data || data.status !== 'success') {
            const errMsg = data?.message || `Lỗi máy chủ (${res.status}): Cập nhật thất bại.`;
            throw new Error(errMsg);
          }

          // Update table HTML with recalculated TÍNH metrics
          const tableWrapper = document.getElementById('factsheetTableWrapper');
          if (tableWrapper && data.table_html) {
            tableWrapper.innerHTML = data.table_html;
          }

          // Update modal HTML with newly saved values
          const modalWrapper = document.getElementById('factsheetEditModalWrapper');
          if (modalWrapper && data.edit_modal_html) {
            modalWrapper.innerHTML = data.edit_modal_html;
          }

          // Synchronize memory cache of metrics data
          if (data.factsheet?.all_metrics) {
            const newMap = {};
            data.factsheet.all_metrics.forEach(m => {
              if (m.key) newMap[m.key] = m.values || {};
            });
            window.modalMetricsData = newMap;
          }
          window.modalCurrentTicker = targetTicker;
          currentTicker = targetTicker;

          // Clear modified memory
          window.modalModifiedValues = {};

          // Re-bind interactions
          bindTableInteractions();
          bindModalInteractions();

          // Close modal
          closeModal();

          showToast(`Đã lưu thành công ${updates.length} chỉ tiêu! Toàn bộ các chỉ tiêu TÍNH đã được tự động tính toán lại theo số liệu mới.`);
        } catch (err) {
          console.error('Save failed:', err);
          showToast('Có lỗi xảy ra khi lưu: ' + err.message, false);
        } finally {
          if (btnSubmit) btnSubmit.disabled = false;
          if (saveSpinner) saveSpinner.classList.add('hidden');
          if (saveText) saveText.textContent = 'LƯU DỮ LIỆU';
        }
      });
    }


    // -------------------------------------------------------------
    // 4. AJAX LOAD FACTSHEET (Khi chuyển mã cổ phiếu)
    // -------------------------------------------------------------
    async function loadFactsheetAjax(ticker, updateHistory = true) {
      if (!ticker || isFactsheetLoading) return;
      isFactsheetLoading = true;
      currentTicker = ticker;

      const overlay = document.getElementById('factsheetLoadingOverlay');
      const overlayText = document.getElementById('loadingOverlayText');
      const wrapper = document.getElementById('factsheetContentWrapper');
      if (overlay) overlay.classList.remove('hidden');
      if (overlayText) overlayText.textContent = `Đang tải báo cáo tài chính ${ticker}...`;
      if (wrapper) wrapper.classList.add('opacity-60', 'pointer-events-none');

      try {
        const fetchUrl = new URL(`/don-le/${encodeURIComponent(ticker)}`, window.location.origin);
        fetchUrl.searchParams.set('ajax', '1');

        const res = await fetch(fetchUrl.toString(), {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          }
        });

        if (!res.ok) throw new Error('Network response error');
        const data = await res.json();

        if (data.status === 'success') {
          // Update Table HTML
          const tableWrapper = document.getElementById('factsheetTableWrapper');
          if (tableWrapper && data.table_html) {
            tableWrapper.innerHTML = data.table_html;
          }

          // Update Modal HTML for the new stock
          const modalWrapper = document.getElementById('factsheetEditModalWrapper');
          if (modalWrapper && data.edit_modal_html) {
            modalWrapper.innerHTML = data.edit_modal_html;
          }

          // Update Document Title
          document.title = `MAYHEM - Báo Cáo Đơn Lẻ | Tra Cứu BCTC Ngân Hàng ${data.selectedTicker}`;

          // Update Stock Input Text
          if (stockInput && data.factsheet && data.factsheet.company) {
            stockInput.value = `${data.selectedTicker} - ${data.factsheet.company.company_name}`;
            stockInput.setAttribute('data-selected-ticker', data.selectedTicker);
          }

          // Update Browser URL without reload
          if (updateHistory) {
            const cleanUrl = `/don-le/${encodeURIComponent(data.selectedTicker)}`;
            window.history.pushState({ ticker: data.selectedTicker }, '', cleanUrl);
          }

          // Reset filter & Bind interactions
          currentFilter = 'ALL';
          bindTableInteractions();
          bindModalInteractions();
        }
      } catch (err) {
        console.error('AJAX factsheet load failed, falling back:', err);
        window.location.href = `/don-le/${encodeURIComponent(ticker)}`;
      } finally {
        isFactsheetLoading = false;
        if (overlay) overlay.classList.add('hidden');
        if (wrapper) wrapper.classList.remove('opacity-60', 'pointer-events-none');
      }
    }

    // Initial binding
    bindTableInteractions();
    bindModalInteractions();

    // Handle Browser Back / Forward buttons
    window.addEventListener('popstate', (e) => {
      const match = window.location.pathname.match(/\/don-le\/?([^\/]*)/);
      const urlTicker = (match && match[1]) ? match[1] : new URLSearchParams(window.location.search).get('ticker');
      if (urlTicker && urlTicker !== currentTicker) {
        loadFactsheetAjax(urlTicker, false);
      }
    });

    // Escape closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('editFinancialDataModal');
        if (modal && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
        }
      }
    });
  });
</script>
@endpush
