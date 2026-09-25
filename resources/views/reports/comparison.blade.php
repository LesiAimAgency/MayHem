@extends('layouts.app')

@section('title', 'MAYHEM - Báo Cáo So Sánh | Đối Chiếu Doanh Nghiệp Đa Chiều')
@section('meta_description', 'Bảng đối chiếu so sánh chỉ số tài chính đa chiều giữa các ngân hàng thương mại Việt Nam.')

@section('content')

  <!-- Greeting Hero with 3 Quick Action Cards -->
  @include('partials.greeting-hero', ['activeCard' => 'comparison'])

  <!-- Main Comparison Container -->
  <main class="max-w-[1440px] w-full mx-auto px-9 pb-12 flex-1 space-y-6">

    <!-- Comparison Filter Card (Wireframe 4 & Overview Style) -->
    <div id="comparisonFilterWrapper">
      @include('reports.partials.comparison-filter')
    </div>

    <!-- Comparison Content Wrapper with Smooth Loading Overlay -->
    <div id="comparisonContentWrapper" class="relative transition-all duration-200">
      <!-- Loading indicator overlay -->
      <div id="comparisonLoadingOverlay" class="hidden absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center rounded-xl transition-opacity duration-200 min-h-[300px]">
        <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white shadow-lg border border-[#D7D7D7]">
          <svg class="animate-spin h-5 w-5 text-[#051650]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span class="text-xs font-bold text-[#051650]">Đang tải dữ liệu đối chiếu...</span>
        </div>
      </div>

      <!-- View 1: Main Matrix Table -->
      <div id="compareTableWrapper">
        @include('reports.partials.comparison-matrix')
      </div>

      <!-- View 2: Visual Comparison Cards & Bars -->
      <div id="compareVisualWrapper">
        @include('reports.partials.comparison-charts')
      </div>
    </div>

  </main>

@endsection

@push('scripts')
<script>
  document.addEventListener('DOMContentLoaded', () => {
    let isComparisonLoading = false;
    let selectedTickers = @json($selectedTickers);
    const allCompanies = @json($companies->map(fn($c) => ['ticker' => $c->short_name, 'name' => $c->company_name]));

    // Helper: bỏ dấu tiếng Việt để tìm kiếm
    function removeVietnameseTones(str) {
      if (!str) return '';
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
      str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
      str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
      str = str.replace(/Đ/g, 'D');
      return str.toLowerCase();
    }

    // ------------------------------------------------------------------------
    // Stock Search & Chips Dropzone (with Drag & Drop support)
    // ------------------------------------------------------------------------
    const stockSearchInput = document.getElementById('compareStockSearchInput');
    const stockDropdownMenu = document.getElementById('compareStockDropdownMenu');
    const toggleStockDropdownBtn = document.getElementById('toggleCompareStockDropdownBtn');
    const clearStockSearchBtn = document.getElementById('clearCompareStockSearchBtn');
    const chipsContainer = document.getElementById('compareChipsContainer');
    const chipsList = document.getElementById('compareChipsList');
    const selectedCountBadge = document.getElementById('compareSelectedStocksCount');
    const selectAllBtn = document.getElementById('compareSelectAllBtn');
    const clearAllChipsBtn = document.getElementById('compareClearAllChipsBtn');
    const dropzoneEmptyNotice = document.getElementById('compareDropzoneEmptyNotice');

    let draggedTicker = null;
    let dragSourceType = null; // 'chip' | 'dropdown'
    let isDraggingChip = false;

    function renderStockChips() {
      if (!chipsList) return;

      chipsList.innerHTML = '';

      if (selectedTickers.length === 0) {
        if (dropzoneEmptyNotice) dropzoneEmptyNotice.classList.remove('hidden');
        if (clearAllChipsBtn) clearAllChipsBtn.classList.add('hidden');
        if (selectedCountBadge) selectedCountBadge.textContent = '00 mã';
        return;
      }

      if (dropzoneEmptyNotice) dropzoneEmptyNotice.classList.add('hidden');
      if (clearAllChipsBtn) clearAllChipsBtn.classList.remove('hidden');
      if (selectedCountBadge) selectedCountBadge.textContent = `${selectedTickers.length < 10 ? '0' : ''}${selectedTickers.length} mã`;

      selectedTickers.forEach(ticker => {
        const comp = allCompanies.find(c => c.ticker === ticker);
        const fullName = comp ? comp.name : ticker;

        const chip = document.createElement('div');
        chip.className = 'compare-stock-chip h-[27px] min-w-[52px] px-2.5 bg-white border border-[#D7D7D7] rounded-[4px] text-xs font-bold text-[#051650] flex items-center justify-center gap-1.5 shadow-2xs hover:border-[#051650] transition-all select-none group cursor-grab active:cursor-grabbing';
        chip.setAttribute('draggable', 'true');
        chip.setAttribute('data-ticker', ticker);
        chip.setAttribute('title', `${fullName} (Kéo ra ngoài để xóa, kéo đổi vị trí)`);
        chip.innerHTML = `
          <span>${ticker}</span>
          <button type="button" class="compare-chip-remove text-[#818181] hover:text-red-500 font-bold text-xs leading-none p-0.5" title="Xóa ${ticker}">&times;</button>
        `;

        // Click X to remove
        chip.querySelector('.compare-chip-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          removeTicker(ticker);
        });

        // HTML5 Drag & Drop handlers for Chip
        chip.addEventListener('dragstart', (e) => {
          draggedTicker = ticker;
          dragSourceType = 'chip';
          isDraggingChip = true;
          e.dataTransfer.setData('text/plain', ticker);
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => {
            chip.classList.add('opacity-40', 'scale-95', 'border-red-400', 'bg-red-50');
            chipsContainer?.classList.add('border-dashed', 'border-[#051650]/40', 'bg-[#ECECEC]');
          }, 0);
        });

        chip.addEventListener('dragend', (e) => {
          chip.classList.remove('opacity-40', 'scale-95', 'border-red-400', 'bg-red-50');
          chipsContainer?.classList.remove('border-dashed', 'border-[#051650]/40', 'bg-[#ECECEC]', 'border-red-400/60');

          if (isDraggingChip && draggedTicker) {
            const rect = chipsContainer?.getBoundingClientRect();
            if (rect) {
              // Check if released outside container (with tolerance)
              const isOutside = (
                e.clientX < rect.left - 5 ||
                e.clientX > rect.right + 5 ||
                e.clientY < rect.top - 5 ||
                e.clientY > rect.bottom + 5
              );
              if (isOutside) {
                removeTicker(draggedTicker);
              }
            }
          }
          isDraggingChip = false;
          draggedTicker = null;
          dragSourceType = null;
        });

        // Reorder support
        chip.addEventListener('dragover', (e) => {
          if (isDraggingChip) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            chip.classList.add('border-[#051650]', 'scale-105');
          }
        });

        chip.addEventListener('dragleave', () => {
          chip.classList.remove('border-[#051650]', 'scale-105');
        });

        chip.addEventListener('drop', (e) => {
          chip.classList.remove('border-[#051650]', 'scale-105');
          if (isDraggingChip && draggedTicker && draggedTicker !== ticker) {
            e.preventDefault();
            e.stopPropagation();
            const fromIdx = selectedTickers.indexOf(draggedTicker);
            const toIdx = selectedTickers.indexOf(ticker);
            if (fromIdx !== -1 && toIdx !== -1) {
              selectedTickers.splice(fromIdx, 1);
              selectedTickers.splice(toIdx, 0, draggedTicker);
              renderStockChips();
              triggerComparisonSubmit();
            }
          }
        });

        chipsList.appendChild(chip);
      });

      updateDropdownCheckmarks();
    }

    // Dropzone container events (drag item from left search list into dropzone)
    chipsContainer?.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (dragSourceType === 'dropdown') {
        e.dataTransfer.dropEffect = 'copy';
        chipsContainer.classList.add('border-dashed', 'border-[#C8997D]', 'bg-[#F8F3EC]/50');
      } else if (isDraggingChip) {
        e.dataTransfer.dropEffect = 'move';
      }
    });

    chipsContainer?.addEventListener('dragleave', (e) => {
      if (!chipsContainer.contains(e.relatedTarget)) {
        chipsContainer.classList.remove('border-[#C8997D]', 'bg-[#F8F3EC]/50');
      }
    });

    chipsContainer?.addEventListener('drop', (e) => {
      e.preventDefault();
      chipsContainer.classList.remove('border-[#C8997D]', 'bg-[#F8F3EC]/50');
      if (dragSourceType === 'dropdown' && draggedTicker) {
        addTicker(draggedTicker);
      }
    });

    function updateDropdownCheckmarks() {
      if (!stockDropdownMenu) return;
      stockDropdownMenu.querySelectorAll('.compare-dropdown-item').forEach(item => {
        const t = item.getAttribute('data-ticker');
        const check = item.querySelector('.compare-item-check');
        const isSelected = selectedTickers.includes(t);
        if (isSelected) {
          item.classList.add('bg-[#F8F3EC]/70', 'font-semibold');
          if (check) check.classList.remove('hidden');
        } else {
          item.classList.remove('bg-[#F8F3EC]/70', 'font-semibold');
          if (check) check.classList.add('hidden');
        }
      });
    }

    function addTicker(ticker) {
      if (!selectedTickers.includes(ticker)) {
        selectedTickers.push(ticker);
        renderStockChips();
        triggerComparisonSubmit();
      }
    }

    function removeTicker(ticker) {
      selectedTickers = selectedTickers.filter(t => t !== ticker);
      renderStockChips();
      triggerComparisonSubmit();
    }

    // Filter dropdown items
    function filterDropdownItems(keyword = '') {
      if (!stockDropdownMenu) return;
      const q = removeVietnameseTones(keyword.trim());
      const items = stockDropdownMenu.querySelectorAll('.compare-dropdown-item');
      let matchCount = 0;

      items.forEach(item => {
        const t = (item.getAttribute('data-ticker') || '').toLowerCase();
        const n = removeVietnameseTones(item.getAttribute('data-name') || '');
        const match = !q || t.includes(q) || n.includes(q);
        item.style.display = match ? 'flex' : 'none';
        if (match) matchCount++;
      });
    }

    // Toggle dropdown
    function openDropdown() {
      if (!stockDropdownMenu) return;
      stockDropdownMenu.classList.remove('hidden');
      if (toggleStockDropdownBtn) toggleStockDropdownBtn.querySelector('svg')?.classList.add('rotate-180');
    }
    function closeDropdown() {
      if (!stockDropdownMenu) return;
      stockDropdownMenu.classList.add('hidden');
      if (toggleStockDropdownBtn) toggleStockDropdownBtn.querySelector('svg')?.classList.remove('rotate-180');
    }

    stockSearchInput?.addEventListener('focus', openDropdown);
    stockSearchInput?.addEventListener('input', (e) => {
      openDropdown();
      const val = e.target.value;
      if (clearStockSearchBtn) {
        if (val) clearStockSearchBtn.classList.remove('hidden');
        else clearStockSearchBtn.classList.add('hidden');
      }
      filterDropdownItems(val);
    });

    clearStockSearchBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (stockSearchInput) {
        stockSearchInput.value = '';
        stockSearchInput.focus();
      }
      clearStockSearchBtn.classList.add('hidden');
      filterDropdownItems('');
    });

    toggleStockDropdownBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (stockDropdownMenu?.classList.contains('hidden')) {
        openDropdown();
      } else {
        closeDropdown();
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      const container = document.getElementById('compareStockSearchContainer');
      if (container && !container.contains(e.target)) {
        closeDropdown();
      }
    });

    // Dropdown item click & drag to container
    stockDropdownMenu?.querySelectorAll('.compare-dropdown-item').forEach(item => {
      item.setAttribute('draggable', 'true');
      item.addEventListener('dragstart', (e) => {
        const t = item.getAttribute('data-ticker');
        if (t) {
          draggedTicker = t;
          dragSourceType = 'dropdown';
          e.dataTransfer.setData('text/plain', t);
          e.dataTransfer.effectAllowed = 'copy';
        }
      });
      item.addEventListener('dragend', () => {
        draggedTicker = null;
        dragSourceType = null;
      });

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = item.getAttribute('data-ticker');
        if (!t) return;
        if (selectedTickers.includes(t)) {
          removeTicker(t);
        } else {
          addTicker(t);
        }
      });
    });

    // Select all tickers
    selectAllBtn?.addEventListener('click', () => {
      selectedTickers = allCompanies.map(c => c.ticker);
      renderStockChips();
      triggerComparisonSubmit();
    });

    // Clear all chips
    clearAllChipsBtn?.addEventListener('click', () => {
      selectedTickers = [];
      renderStockChips();
      triggerComparisonSubmit();
    });

    // ------------------------------------------------------------------------
    // Live Matrix Table Filtering (Dữ liệu lọc & Dữ liệu tính)
    // ------------------------------------------------------------------------
    const filterFillInput = document.getElementById('compareMetricFilterFill');
    const filterFillDropdown = document.getElementById('compareFillDropdownMenu');
    const filterFillBtn = document.getElementById('toggleCompareFillDropdownBtn');
    
    const filterTinhInput = document.getElementById('compareMetricFilterTinh');
    const filterTinhDropdown = document.getElementById('compareTinhDropdownMenu');
    const filterTinhBtn = document.getElementById('toggleCompareTinhDropdownBtn');

    let currentFillValue = 'Tất cả dữ liệu lọc';
    let currentTinhValue = 'Tất cả dữ liệu tính';

    function updateMatrixRows() {
      const isAllFill = currentFillValue.toLowerCase().includes('tất cả');
      const isAllTinh = currentTinhValue.toLowerCase().includes('tất cả');

      const rows = document.querySelectorAll('#comparisonMatrixTable tbody tr.comparison-row');

      rows.forEach(row => {
        const name = row.getAttribute('data-name');
        const type = row.getAttribute('data-type');
        
        let show = true;

        if (!isAllFill && !isAllTinh) {
          show = (name === currentFillValue.toLowerCase() && type === 'FILL') || (name === currentTinhValue.toLowerCase() && type === 'TÍNH');
        } else if (!isAllFill) {
          show = (name === currentFillValue.toLowerCase() && type === 'FILL');
        } else if (!isAllTinh) {
          show = (name === currentTinhValue.toLowerCase() && type === 'TÍNH');
        } else {
          show = true; // both are all
        }

        row.style.display = show ? '' : 'none';
      });
    }

    function setupCustomDropdown(inputEl, dropdownEl, btnEl, type) {
      if (!inputEl || !dropdownEl || !btnEl) return;
      
      const items = dropdownEl.querySelectorAll(type === 'FILL' ? '.compare-fill-item' : '.compare-tinh-item');

      function openMenu() {
        dropdownEl.classList.remove('hidden');
        btnEl.querySelector('svg').classList.add('rotate-180');
      }

      function closeMenu() {
        dropdownEl.classList.add('hidden');
        btnEl.querySelector('svg').classList.remove('rotate-180');
      }

      function selectItem(name) {
        if (type === 'FILL') {
          currentFillValue = name;
          if (!name.toLowerCase().includes('tất cả')) currentTinhValue = 'Tất cả dữ liệu tính';
          inputEl.value = name;
          if (filterTinhInput) filterTinhInput.value = 'Tất cả dữ liệu tính (17)';
        } else {
          currentTinhValue = name;
          if (!name.toLowerCase().includes('tất cả')) currentFillValue = 'Tất cả dữ liệu lọc';
          inputEl.value = name;
          if (filterFillInput) filterFillInput.value = 'Tất cả dữ liệu lọc (30)';
        }
        
        // Update styling
        document.querySelectorAll('.compare-fill-item, .compare-tinh-item').forEach(el => {
          el.classList.remove('bg-[#F8F3EC]/70', 'font-semibold');
          el.querySelector('.check-icon')?.classList.add('hidden');
          
          const itemName = el.getAttribute('data-name');
          const isAll = itemName.toLowerCase().includes('tất cả');

          if (type === 'FILL' && el.classList.contains('compare-fill-item') && itemName === currentFillValue) {
            el.classList.add('bg-[#F8F3EC]/70', 'font-semibold');
            el.querySelector('.check-icon')?.classList.remove('hidden');
          } else if (type === 'TÍNH' && el.classList.contains('compare-tinh-item') && itemName === currentTinhValue) {
            el.classList.add('bg-[#F8F3EC]/70', 'font-semibold');
            el.querySelector('.check-icon')?.classList.remove('hidden');
          } else if (type === 'FILL' && el.classList.contains('compare-tinh-item') && isAll) {
             el.classList.add('bg-[#F8F3EC]/70', 'font-semibold');
             el.querySelector('.check-icon')?.classList.remove('hidden');
          } else if (type === 'TÍNH' && el.classList.contains('compare-fill-item') && isAll) {
             el.classList.add('bg-[#F8F3EC]/70', 'font-semibold');
             el.querySelector('.check-icon')?.classList.remove('hidden');
          } else if (currentFillValue.toLowerCase().includes('tất cả') && currentTinhValue.toLowerCase().includes('tất cả') && isAll) {
             el.classList.add('bg-[#F8F3EC]/70', 'font-semibold');
             el.querySelector('.check-icon')?.classList.remove('hidden');
          }
        });

        closeMenu();
        updateMatrixRows();
      }

      btnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownEl.classList.contains('hidden')) {
          openMenu();
        } else {
          closeMenu();
        }
      });

      inputEl.addEventListener('focus', () => {
        openMenu();
        inputEl.value = ''; // clear for search
      });

      inputEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openMenu();
        if (inputEl.value !== '') {
          inputEl.value = ''; // clear for search if clicked again
        }
      });

      inputEl.addEventListener('blur', () => {
        // give time for click on dropdown
        setTimeout(() => {
          inputEl.value = type === 'FILL' ? 
            (currentFillValue.toLowerCase().includes('tất cả') ? 'Tất cả dữ liệu lọc (30)' : currentFillValue) : 
            (currentTinhValue.toLowerCase().includes('tất cả') ? 'Tất cả dữ liệu tính (17)' : currentTinhValue);
        }, 200);
      });

      inputEl.addEventListener('input', (e) => {
        openMenu();
        const search = e.target.value.toLowerCase();
        items.forEach(el => {
          const n = el.getAttribute('data-name').toLowerCase();
          if (n.includes(search)) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        });
      });

      items.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectItem(el.getAttribute('data-name'));
        });
      });

      document.addEventListener('click', (e) => {
        const containerId = type === 'FILL' ? 'compareFillSearchContainer' : 'compareTinhSearchContainer';
        const container = document.getElementById(containerId);
        if (container && !container.contains(e.target)) {
          closeMenu();
        }
      });
    }

    setupCustomDropdown(filterFillInput, filterFillDropdown, filterFillBtn, 'FILL');
    setupCustomDropdown(filterTinhInput, filterTinhDropdown, filterTinhBtn, 'TÍNH');

    // ------------------------------------------------------------------------
    // Live AJAX Comparison Loader
    // ------------------------------------------------------------------------
    const fromYearSelect = document.getElementById('compareFromYear');
    const toYearSelect = document.getElementById('compareToYear');
    const submitBtn = document.getElementById('btnCompareSubmit');

    function triggerComparisonSubmit(updateHistory = true) {
      const activeTickers = selectedTickers.length > 0 ? selectedTickers : ['ACB', 'ABB', 'VCB'];
      let fromYear = fromYearSelect?.value;
      let toYear = toYearSelect?.value;

      // Bảo vệ: Nếu chọn nhầm năm không active/không có dữ liệu, tự động chuyển về năm active gần nhất
      const fromOpt = fromYearSelect?.querySelector(`option[value="${fromYear}"]`);
      if (fromOpt && fromOpt.disabled) {
        const firstActive = fromYearSelect.querySelector('option:not([disabled])');
        if (firstActive) {
          fromYear = firstActive.value;
          fromYearSelect.value = fromYear;
        }
      }
      const toOpt = toYearSelect?.querySelector(`option[value="${toYear}"]`);
      if (toOpt && toOpt.disabled) {
        const activeOpts = toYearSelect.querySelectorAll('option:not([disabled])');
        if (activeOpts.length > 0) {
          toYear = activeOpts[activeOpts.length - 1].value;
          toYearSelect.value = toYear;
        }
      }

      if (fromYear && toYear && parseInt(fromYear) > parseInt(toYear)) {
        // Swap if fromYear > toYear
        const tmp = fromYear;
        fromYear = toYear;
        toYear = tmp;
        if (fromYearSelect) fromYearSelect.value = fromYear;
        if (toYearSelect) toYearSelect.value = toYear;
      }

      const params = new URLSearchParams();
      params.set('tickers', activeTickers.join(','));
      if (fromYear) params.set('from_year', fromYear);
      if (toYear) params.set('to_year', toYear);

      const url = `/so-sanh?${params.toString()}`;
      loadComparisonAjax(url, updateHistory);
    }

    fromYearSelect?.addEventListener('change', () => triggerComparisonSubmit());
    toYearSelect?.addEventListener('change', () => triggerComparisonSubmit());
    submitBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      triggerComparisonSubmit();
    });

    async function loadComparisonAjax(targetUrl, updateHistory = true) {
      if (isComparisonLoading) return;
      isComparisonLoading = true;

      const overlay = document.getElementById('comparisonLoadingOverlay');
      const content = document.getElementById('comparisonContentWrapper');
      if (overlay) overlay.classList.remove('hidden');
      if (content) content.classList.add('opacity-60', 'pointer-events-none');

      try {
        const fetchUrl = new URL(targetUrl, window.location.origin);
        fetchUrl.searchParams.set('ajax', '1');

        const res = await fetch(fetchUrl.toString(), {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          }
        });

        if (!res.ok) throw new Error('Network error');
        const data = await res.json();

        if (data.status === 'success') {
          // Update Matrix Table
          const tableWrapper = document.getElementById('compareTableWrapper');
          if (tableWrapper && data.matrix_html) {
            tableWrapper.innerHTML = data.matrix_html;
            if (typeof window.initComparisonMatrixScroll === 'function') {
              window.initComparisonMatrixScroll();
            }
          }

          // Update Charts
          const visualWrapper = document.getElementById('compareVisualWrapper');
          if (visualWrapper && data.charts_html) {
            visualWrapper.innerHTML = data.charts_html;
          }

          // Update Browser URL without full reload
          if (updateHistory) {
            const cleanUrl = new URL(targetUrl, window.location.origin);
            cleanUrl.searchParams.delete('ajax');
            window.history.pushState({ tickers: data.tickers, mode: data.mode }, '', cleanUrl.toString());
          }

          // Re-apply realtime filters on the newly rendered rows
          applyMatrixRowFilters();
        }
      } catch (err) {
        console.error('AJAX comparison failed, falling back:', err);
        window.location.href = targetUrl;
      } finally {
        isComparisonLoading = false;
        if (overlay) overlay.classList.add('hidden');
        if (content) content.classList.remove('opacity-60', 'pointer-events-none');
      }
    }

    // Initial state setup
    renderStockChips();
    applyMatrixRowFilters();
    if (typeof window.initComparisonMatrixScroll === 'function') {
      window.initComparisonMatrixScroll();
    }

    // Browser back/forward navigation
    window.addEventListener('popstate', () => {
      loadComparisonAjax(window.location.href, false);
    });
  });
</script>
@endpush
