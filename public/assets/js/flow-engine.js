/**
 * MAYHEM FINANCIAL ANALYTICS - END-TO-END FLOW ENGINE
 * Quản lý trạng thái và luồng chuyển đổi giữa Frame 1 & Frame 2.
 * Tuân thủ nghiêm ngặt .antigravity/rules:
 * - Security Mandate 3: Universal Output Encoding (escapeHtml)
 * - Zero Inline Styles
 * - Vanilla JavaScript chuẩn
 */

// Universal Output Encoding to prevent XSS (Security Mandate 3)
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Lấy danh sách ngân hàng từ Live Database (window.BANKS_DATA) hoặc fallback MOCK_BANKS
 */
function getBanksList() {
  if (typeof window.BANKS_DATA !== 'undefined' && Array.isArray(window.BANKS_DATA) && window.BANKS_DATA.length > 0) {
    return window.BANKS_DATA;
  }
  if (typeof MOCK_BANKS !== 'undefined' && Array.isArray(MOCK_BANKS) && MOCK_BANKS.length > 0) {
    return MOCK_BANKS;
  }
  return [];
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isFrame3 = path.includes('wireframe-3.html') || path.includes('so-sanh') || (!path.includes('tong-hop') && !path.includes('don-le') && document.getElementById('comparisonMatrixTable') !== null);
  const isFrame2 = !isFrame3 && (path.includes('wireframe-2.html') || path.includes('don-le') || document.getElementById('liveFinancialTable') !== null);
  const isFrame1 = !isFrame3 && !isFrame2 && (path.includes('wireframe-1.html') || path.includes('tong-hop') || path === '/' || document.getElementById('loc-du-lieu') !== null);

  if (isFrame1) {
    initFrame1Flow();
  } else if (isFrame2) {
    initFrame2Flow();
  } else if (isFrame3) {
    initFrame3Flow();
  }
});

// ============================================================================
// FRAME 1: BÁO CÁO TỔNG HỢP (FILTER & SCREENING FLOW WITH DRAG & DROP & SELECT-SEARCH)
// ============================================================================

// Trạng thái mã cổ phiếu đang được chọn (Ban đầu rỗng - khi người dùng đưa mã cổ phiếu vào mới có dữ liệu save vào)
let selectedStocks = [];
// Danh sách các ngân hàng đã được sàng lọc thoả mãn điều kiện
let currentFilteredBanks = [];

function saveSelectedStocksToStorage() {
  try {
    if (selectedStocks && selectedStocks.length > 0) {
      localStorage.setItem('mayhem_selected_stocks', JSON.stringify(selectedStocks));

    } else {
      localStorage.removeItem('mayhem_selected_stocks');

    }
  } catch (e) {

  }
}

function loadSelectedStocksFromStorage() {
  try {
    const saved = localStorage.getItem('mayhem_selected_stocks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const allBanks = getBanksList();
        if (allBanks.length > 0) {
          const validTickers = allBanks.map(b => b.ticker);
          const filtered = parsed.filter(t => typeof t === 'string' && validTickers.includes(t));
          return filtered.length > 0 ? filtered : parsed;
        }
        return parsed.filter(t => typeof t === 'string');
      }
    }
  } catch (e) {
    console.warn('[CACHE] Lỗi đọc cache mã cổ phiếu:', e);
  }
  return [];
}

// Từ điển nhãn hiển thị cho 15 tiêu chí tài chính
const CRITERIA_METRIC_LABELS = {
  cir: 'CIR',
  cpkh: 'CPKH/TOI',
  blvh: 'Biên lãi VH',
  blntt: 'Biên LN trước thuế',
  blnst: 'BLNST CĐ mẹ',
  ttlr: 'Tăng trưởng lãi ròng',
  roa: 'ROA',
  de: 'Debt/Equity',
  roe: 'ROE',
  cfo: 'CFO (Lưu chuyển tiền)',
  casa: 'CASA',
  npl: 'NPL (Nợ xấu)',
  nim: 'NIM',
  car: 'CAR',
  llr: 'LLR Coverage'
};

// Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu / có dấu
function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function initFrame1Flow() {
  console.log('[FLOW] Initializing Frame 1 Flow Engine (Multi-Select + Drag & Drop)');

  // Khôi phục danh sách mã cổ phiếu đã chọn từ Cache (localStorage)
  selectedStocks = loadSelectedStocksFromStorage();
  if (selectedStocks.length > 0) {
    console.log('[CACHE] 📦 Đã khôi phục danh sách mã cổ phiếu từ cache:', selectedStocks);
  }

  const countSummary = document.getElementById('filterCountSummary');
  const toggleBtn = document.getElementById('toggleDetailsBtn');
  const detailsPanel = document.getElementById('detailsPanel');
  const industryRadios = document.querySelectorAll('[data-industry-radio]');
  const applyComparisonBtn = document.getElementById('applyComparisonBtn');

  // 1. Khởi tạo Component Select-Search Mã Cổ Phiếu (Multi-Select)
  initStockSelectSearch();

  // 2. Khởi tạo Khối Thẻ Xám Drop Zone + Drag-Out-to-Remove
  initStockDropzone();

  // 3. Khởi tạo Bộ Lọc 15 Tiêu Chí Tài Chính & Thanh Active Criteria
  initCriteriaFiltering();

  // 4. Lắng nghe radio ngành nghề (single-select)
  industryRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      runFilterLogic();
    });
  });

  // 5. Nút mở/đóng bảng kết quả chi tiết
  if (toggleBtn && detailsPanel) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = detailsPanel.classList.contains('hidden');
      if (isHidden) {
        detailsPanel.classList.remove('hidden');
        const textSpan = toggleBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'ẨN CHI TIẾT';
        const svg = toggleBtn.querySelector('svg');
        if (svg) svg.classList.add('rotate-180');
      } else {
        detailsPanel.classList.add('hidden');
        const textSpan = toggleBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'XEM CHI TIẾT';
        const svg = toggleBtn.querySelector('svg');
        if (svg) svg.classList.remove('rotate-180');
      }
    });
  }

  // 6. Nút Áp dụng so sánh -> Chuyển sang so-sanh
  if (applyComparisonBtn) {
    applyComparisonBtn.addEventListener('click', () => {
      // 1. Ưu tiên các mã được tích chọn checkbox trong bảng kết quả lọc
      const selectedBoxes = document.querySelectorAll('[data-compare-checkbox]:checked');
      let tickers = Array.from(selectedBoxes).map(cb => cb.getAttribute('data-compare-checkbox')).filter(Boolean);

      // 2. Nếu không tích chọn checkbox nào, lấy đúng toàn bộ danh sách mã ĐÃ LỌC RA thoả điều kiện
      if (tickers.length === 0 && Array.isArray(currentFilteredBanks) && currentFilteredBanks.length > 0) {
        tickers = currentFilteredBanks.map(b => b.ticker).filter(Boolean);
      }

      // 3. Nếu vẫn rỗng, kiểm tra các mã đang được render trong bảng kết quả lọc
      if (tickers.length === 0) {
        const renderedCheckboxes = document.querySelectorAll('[data-compare-checkbox]');
        tickers = Array.from(renderedCheckboxes).map(cb => cb.getAttribute('data-compare-checkbox')).filter(Boolean);
      }

      // 4. Nếu không có mã nào thoả mãn bộ lọc
      if (tickers.length === 0) {
        alert('Không có mã cổ phiếu nào thoả mãn bộ lọc để áp dụng so sánh. Vui lòng kiểm tra lại điều kiện lọc.');
        return;
      }

      // Tối đa 6 mã để hiển thị tối ưu trên bảng so sánh
      if (tickers.length > 6) {
        tickers = tickers.slice(0, 6);
      }

      window.location.href = `/so-sanh?tickers=${encodeURIComponent(tickers.join(','))}&mode=latest`;
    });
  }

  // Chạy render ban đầu (sẽ hiển thị ngay các chip đã lưu trong cache nếu có)
  renderSelectedStockChips();
  updateActiveCriteriaBar();
  runFilterLogic();
}

// ----------------------------------------------------------------------------
// COMPONENT 1: SELECT-SEARCH CHO MÃ CỔ PHIẾU (MULTI-SELECT)
// ----------------------------------------------------------------------------
function initStockSelectSearch() {
  const searchInput = document.getElementById('stockSearchInput');
  const dropdownMenu = document.getElementById('stockDropdownMenu');
  const toggleBtn = document.getElementById('toggleStockDropdownBtn');
  const clearInputBtn = document.getElementById('clearStockSearchInputBtn');
  const chevronIcon = document.getElementById('stockChevronIcon');

  if (!searchInput || !dropdownMenu) return;

  // Render danh sách ngân hàng trong dropdown
  function renderDropdownItems(filterKeyword = '') {
    const banksList = getBanksList();
    if (banksList.length === 0) return;

    const query = removeVietnameseTones(filterKeyword.trim());
    const matchedBanks = banksList.filter(bank => {
      if (!query) return true;
      const t = removeVietnameseTones(bank.ticker);
      const n = removeVietnameseTones(bank.name);
      return t.includes(query) || n.includes(query);
    });

    dropdownMenu.innerHTML = '';

    if (matchedBanks.length === 0) {
      dropdownMenu.innerHTML = `
        <div class="px-4 py-3 text-center text-xs text-[#818181] italic">
          Không tìm thấy mã hoặc ngân hàng phù hợp với "${escapeHtml(filterKeyword)}"
        </div>
      `;
      return;
    }

    matchedBanks.forEach(bank => {
      const isSelected = selectedStocks.includes(bank.ticker);
      const item = document.createElement('div');
      item.className = `px-3.5 py-2.5 flex items-center justify-between text-xs cursor-pointer hover:bg-[#F8F3EC] transition-colors group ${isSelected ? 'bg-[#F8F3EC]/50 font-semibold' : ''}`;
      item.setAttribute('data-bank-ticker', bank.ticker);

      // Click để toggle mã (thêm/bỏ)
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedStocks.includes(bank.ticker)) {
          // Đã chọn rồi → bỏ chọn
          selectedStocks = selectedStocks.filter(t => t !== bank.ticker);
        } else {
          // Chưa chọn → thêm vào
          selectedStocks.push(bank.ticker);
        }
        saveSelectedStocksToStorage();
        renderSelectedStockChips();
        renderDropdownItems(searchInput.value);
        runFilterLogic();
        searchInput.focus();
      });

      item.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-[42px] h-[22px] rounded bg-[#051650] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
            ${escapeHtml(bank.ticker)}
          </span>
          <div class="min-w-0">
            <p class="font-medium text-[#051650] truncate">${escapeHtml(bank.name)}</p>

          </div>
        </div>
        <div class="shrink-0 flex items-center gap-1.5">
          ${isSelected
          ? `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                 <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                 Đã chọn
               </span>`
          : `<span class="text-[11px] text-[#051650] opacity-0 group-hover:opacity-100 font-bold transition-opacity">+ Thêm</span>`
        }
        </div>
      `;

      dropdownMenu.appendChild(item);
    });
  }

  function openDropdown() {
    renderDropdownItems(searchInput.value);
    dropdownMenu.classList.remove('hidden');
    if (chevronIcon) chevronIcon.classList.add('rotate-180');
  }

  function closeDropdown() {
    dropdownMenu.classList.add('hidden');
    if (chevronIcon) chevronIcon.classList.remove('rotate-180');
  }

  // Sự kiện gõ tìm kiếm
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (clearInputBtn) {
      if (val.length > 0) clearInputBtn.classList.remove('hidden');
      else clearInputBtn.classList.add('hidden');
    }
    openDropdown();
  });

  searchInput.addEventListener('focus', () => {
    openDropdown();
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdownMenu.classList.contains('hidden')) {
        openDropdown();
        searchInput.focus();
      } else {
        closeDropdown();
      }
    });
  }

  if (clearInputBtn) {
    clearInputBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      clearInputBtn.classList.add('hidden');
      renderDropdownItems('');
      searchInput.focus();
    });
  }

  // Bấm ra ngoài để đóng dropdown
  document.addEventListener('click', (e) => {
    const container = document.getElementById('stockSelectSearchContainer');
    if (container && !container.contains(e.target)) {
      closeDropdown();
    }
  });

  // Điều hướng bằng bàn phím
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown();
    } else if (e.key === 'Enter') {
      const firstItem = dropdownMenu.querySelector('[data-bank-ticker]');
      if (firstItem) {
        const ticker = firstItem.getAttribute('data-bank-ticker');
        if (!selectedStocks.includes(ticker)) {
          selectedStocks.push(ticker);
        } else {
          selectedStocks = selectedStocks.filter(t => t !== ticker);
        }
        saveSelectedStocksToStorage();
        renderSelectedStockChips();
        searchInput.value = '';
        if (clearInputBtn) clearInputBtn.classList.add('hidden');
        renderDropdownItems('');
        runFilterLogic();
      }
    }
  });

  // Render danh sách ngân hàng ban đầu sẵn sàng
  renderDropdownItems('');
  window.refreshStockDropdown = function () {
    renderDropdownItems(searchInput.value || '');
  };
}

// ----------------------------------------------------------------------------
// COMPONENT 2: KHỐI THẺ XÁM DROP ZONE - DRAG OUT TO REMOVE
// ----------------------------------------------------------------------------
function initStockDropzone() {
  const chipsContainer = document.getElementById('stockChipsContainer');
  const dragContainer = document.getElementById('stockChipsDragContainer');
  const clearAllBtn = document.getElementById('clearAllSelectedStocksBtn');

  // Nút xoá tất cả mã đã chọn
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      selectedStocks = [];
      saveSelectedStocksToStorage();
      renderSelectedStockChips();
      if (window.refreshStockDropdown) window.refreshStockDropdown();
      runFilterLogic();
    });
  }

  // Nút Chọn tất cả (Đưa toàn bộ mã cổ phiếu vào khung Dropzone)
  const selectAllBtn = document.getElementById('selectAllStocksBtn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      const banksList = getBanksList();
      if (banksList.length === 0) return;

      selectedStocks = banksList.map(b => b.ticker);

      saveSelectedStocksToStorage();
      renderSelectedStockChips();
      if (window.refreshStockDropdown) window.refreshStockDropdown();
      runFilterLogic();
    });
  }

  // Cho phép drop vào vùng container (để giữ chip trong container khi thả lên vùng trống)
  if (chipsContainer) {
    chipsContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    chipsContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      // Đánh dấu rằng chip đã được thả TRONG container
      const fromIndexStr = e.dataTransfer.getData('chip-index');
      if (fromIndexStr !== '') {
        const fromIndex = parseInt(fromIndexStr, 10);
        if (dragContainer) {
          const draggedEl = dragContainer.querySelector(`[data-chip-index="${fromIndex}"]`);
          if (draggedEl) draggedEl._droppedInside = true;
        }
      }
    });
  }

  // Lắng nghe global dragend trên document để phát hiện kéo ra ngoài container
  // Khi dragend xảy ra ngoài vùng stockChipsContainer → xóa chip đó
  document.addEventListener('dragend', (e) => {
    const draggedTicker = e.target.getAttribute && e.target.getAttribute('data-chip-ticker');
    if (!draggedTicker) return;

    // Nếu chip đã được drop vào trong container (qua sự kiện drop) thì không xóa
    if (e.target._droppedInside) {
      e.target._droppedInside = false;
      return;
    }

    // Kiểm tra vị trí chuột có nằm trong container không
    if (chipsContainer) {
      const rect = chipsContainer.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Nếu thả NGOÀI container → xóa chip
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        selectedStocks = selectedStocks.filter(t => t !== draggedTicker);
        saveSelectedStocksToStorage();
        renderSelectedStockChips();
        runFilterLogic();
      }
    }
  });
}

/**
 * Gỡ bỏ một mã khỏi danh sách chọn
 */
window.removeSelectedStock = function (ticker) {
  selectedStocks = selectedStocks.filter(t => t !== ticker);
  saveSelectedStocksToStorage();
  renderSelectedStockChips();
  if (window.refreshStockDropdown) window.refreshStockDropdown();
  runFilterLogic();
};

/**
 * Render lại toàn bộ các Chip trong khối xám (Chỉ mã đã chọn mới hiển thị)
 * Kích thước chuẩn Figma: 52x27px, rx=4px (rounded)
 * - Kéo TRONG container → sắp xếp lại (swap)
 * - Kéo RA NGOÀI container → xóa chip
 */
function renderSelectedStockChips() {
  const container = document.getElementById('stockChipsDragContainer');
  const countBadge = document.getElementById('selectedStocksCount');
  const clearAllBtn = document.getElementById('clearAllSelectedStocksBtn');

  if (!container) return;

  // Cập nhật số lượng
  if (countBadge) {
    countBadge.textContent = `${selectedStocks.length} mã`;
  }

  // Nút xoá tất cả
  if (clearAllBtn) {
    if (selectedStocks.length > 0) clearAllBtn.classList.remove('hidden');
    else clearAllBtn.classList.add('hidden');
  }

  // Đồng bộ text nút Chọn tất cả
  // (không cần - nút chỉ select all, text luôn cố định)

  // Xoá các chip cũ
  container.innerHTML = '';

  if (selectedStocks.length === 0) {
    container.innerHTML = `
      <div id="dropzoneEmptyNotice" class="w-full py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-[#818181] select-none">
        <svg class="w-5 h-5 text-[#C8997D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="text-[12px]">Chọn mã từ ô tìm kiếm bên trái để hiển thị tại đây</span>
      </div>
    `;
    return;
  }

  // Render từng chip được chọn với kích thước chuẩn 52x27px, rx=4px
  selectedStocks.forEach((ticker, index) => {
    const chip = document.createElement('div');
    chip.className = 'h-[27px] min-w-[52px] px-2 rounded bg-white text-[#051650] text-[11px] font-bold border border-[#051650] hover:bg-[#F8F3EC] flex items-center justify-center gap-1 transition-all select-none cursor-grab active:cursor-grabbing';
    chip.setAttribute('draggable', 'true');
    chip.setAttribute('data-chip-index', index);
    chip.setAttribute('data-chip-ticker', ticker);
    chip.title = `${ticker} — Kéo để sắp xếp lại, kéo ra ngoài để xóa, hoặc bấm × để gỡ bỏ`;

    chip.innerHTML = `
      <span class="pointer-events-none">${escapeHtml(ticker)}</span>
      <button type="button" class="w-3 h-3 rounded-full hover:bg-red-100 hover:text-[#FE0000] text-[#818181] flex items-center justify-center transition-colors text-[10px] leading-none" 
              onclick="event.stopPropagation(); removeSelectedStock('${escapeHtml(ticker)}')">&times;</button>
    `;

    // === DRAG & DROP: Sắp xếp trong container + Kéo ra ngoài để xóa ===
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', ticker);
      e.dataTransfer.setData('chip-index', String(index));
      e.dataTransfer.effectAllowed = 'move';
      chip._droppedInside = false;
      // Delay adding opacity for smoother visual
      requestAnimationFrame(() => {
        chip.classList.add('opacity-30', 'scale-90');
      });
    });

    chip.addEventListener('dragend', () => {
      chip.classList.remove('opacity-30', 'scale-90');
      // Xóa highlight từ tất cả chips
      container.querySelectorAll('[data-chip-ticker]').forEach(el => {
        el.classList.remove('border-dashed', 'border-[#C8997D]', 'border-2', 'bg-[#F8F3EC]');
      });
    });

    chip.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      chip.classList.add('border-dashed', 'border-[#C8997D]', 'border-2', 'bg-[#F8F3EC]');
    });

    chip.addEventListener('dragleave', () => {
      chip.classList.remove('border-dashed', 'border-[#C8997D]', 'border-2', 'bg-[#F8F3EC]');
    });

    chip.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      chip.classList.remove('border-dashed', 'border-[#C8997D]', 'border-2', 'bg-[#F8F3EC]');

      const fromIndexStr = e.dataTransfer.getData('chip-index');
      if (fromIndexStr !== '') {
        const fromIndex = parseInt(fromIndexStr, 10);
        if (!isNaN(fromIndex) && fromIndex !== index) {
          // Hoán đổi vị trí
          const movedItem = selectedStocks.splice(fromIndex, 1)[0];
          selectedStocks.splice(index, 0, movedItem);

          // Đánh dấu đã drop trong container
          const draggedEl = container.querySelector(`[data-chip-index="${fromIndex}"]`);
          if (draggedEl) draggedEl._droppedInside = true;

          saveSelectedStocksToStorage();
          renderSelectedStockChips();
          runFilterLogic();
        }
      }
    });

    container.appendChild(chip);
  });
}


// Helper lấy tất cả các điều kiện đang được chọn của một tiêu chí (gồm standalone checkbox và parent checkbox + sub checkboxes / radios)
function getActiveConditionsForMetric(metric) {
  const container = document.querySelector(`[data-criteria-container="${metric}"]`);
  if (!container) return [];
  const conditions = [];

  // 1. Standalone checkboxes
  const standaloneChecked = container.querySelectorAll(`input[data-criteria-cb="${metric}"]:checked`);
  standaloneChecked.forEach(cb => {
    conditions.push({
      type: 'standalone',
      metric: metric,
      condition: cb.value,
      label: cb.getAttribute('data-label') || cb.parentElement.textContent.trim(),
      element: cb
    });
  });

  // 2. Parent checkboxes with sub-checkboxes or sub-radios
  const parentChecked = container.querySelectorAll(`input[data-criteria-parent][data-metric="${metric}"]:checked`);
  parentChecked.forEach(parentCb => {
    const groupId = parentCb.getAttribute('data-criteria-parent');
    const parentLabel = parentCb.getAttribute('data-label') || parentCb.parentElement.textContent.trim();
    const subDiv = container.querySelector(`[data-criteria-sub="${groupId}"]`);
    if (!subDiv) return;

    // Check for sub-checkboxes
    const checkedSubCbs = subDiv.querySelectorAll('input[type="checkbox"]:checked');
    if (checkedSubCbs.length > 0) {
      checkedSubCbs.forEach(subCb => {
        const subLabel = subCb.getAttribute('data-label') || subCb.parentElement.textContent.trim();
        conditions.push({
          type: 'sub_checkbox',
          groupId: groupId,
          metric: metric,
          condition: subCb.value,
          label: `${parentLabel} (${subLabel})`,
          element: subCb,
          parent: parentCb
        });
      });
    } else {
      // Check for sub-radios (fallback)
      const activeRadio = subDiv.querySelector('input[type="radio"]:checked');
      if (activeRadio) {
        const radioLabel = activeRadio.getAttribute('data-label') || activeRadio.parentElement.textContent.trim();
        conditions.push({
          type: 'group',
          groupId: groupId,
          metric: metric,
          condition: activeRadio.value,
          label: `${parentLabel} (${radioLabel})`,
          element: parentCb,
          radio: activeRadio
        });
      }
    }
  });

  return conditions;
}

// Helper lấy toàn bộ điều kiện đang được chọn trên tất cả 15 tiêu chí
function getAllActiveConditions() {
  let all = [];
  document.querySelectorAll('[data-criteria-container]').forEach(container => {
    const metric = container.getAttribute('data-criteria-container');
    const conditions = getActiveConditionsForMetric(metric);
    all = all.concat(conditions);
  });
  return all;
}

// ----------------------------------------------------------------------------
// COMPONENT 3: CHỌN NHIỀU TIÊU CHÍ (15 CRITERIA & ACTIVE PILLS BAR)
// ----------------------------------------------------------------------------
function initCriteriaFiltering() {
  const criteriaContainers = document.querySelectorAll('[data-criteria-container]');

  criteriaContainers.forEach(container => {
    const metric = container.getAttribute('data-criteria-container');
    const btn = container.querySelector(`[data-criteria-btn="${metric}"]`);
    const menu = container.querySelector(`[data-criteria-menu="${metric}"]`);
    const checkboxes = container.querySelectorAll(`input[data-criteria-cb="${metric}"]`);
    const parentCheckboxes = container.querySelectorAll(`input[data-criteria-parent][data-metric="${metric}"]`);
    const subCheckboxes = container.querySelectorAll(`[data-criteria-sub] input[type="checkbox"]`);
    const radioInputs = container.querySelectorAll(`[data-criteria-sub] input[type="radio"]`);
    const chevron = btn ? btn.querySelector('svg') : null;

    if (!btn || !menu) return;

    // Toggle menu
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = menu.classList.contains('hidden');
      closeAllCriteriaMenus();
      if (isHidden) {
        menu.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
      }
    });

    // Standalone Checkbox changes (cho phép chọn nhiều điều kiện đồng thời)
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateCriteriaButtonState(metric);
        updateActiveCriteriaBar();
        runFilterLogic();
      });
    });

    // Parent Checkbox changes (toggle sub-options)
    parentCheckboxes.forEach(parentCb => {
      parentCb.addEventListener('change', () => {
        const groupId = parentCb.getAttribute('data-criteria-parent');
        const subDiv = container.querySelector(`[data-criteria-sub="${groupId}"]`);

        if (parentCb.checked) {
          if (subDiv) {
            subDiv.classList.remove('hidden');
            const subCbs = subDiv.querySelectorAll('input[type="checkbox"]');
            if (subCbs.length > 0) {
              const checkedSub = subDiv.querySelectorAll('input[type="checkbox"]:checked');
              if (checkedSub.length === 0) {
                // Tự động check tất cả sub-checkboxes khi bật parent
                subCbs.forEach(scb => { scb.checked = true; });
              }
            } else {
              const checkedRadio = subDiv.querySelector('input[type="radio"]:checked');
              if (!checkedRadio) {
                const firstRadio = subDiv.querySelector('input[type="radio"]');
                if (firstRadio) firstRadio.checked = true;
              }
            }
          }
        } else {
          if (subDiv) {
            subDiv.classList.add('hidden');
            subDiv.querySelectorAll('input[type="checkbox"]').forEach(scb => {
              scb.checked = false;
            });
          }
        }

        updateCriteriaButtonState(metric);
        updateActiveCriteriaBar();
        runFilterLogic();
      });
    });

    // Sub-checkboxes changes (hỗ trợ nhiều option con)
    subCheckboxes.forEach(subCb => {
      subCb.addEventListener('change', () => {
        const subDiv = subCb.closest('[data-criteria-sub]');
        if (subDiv) {
          const groupId = subDiv.getAttribute('data-criteria-sub');
          const parentCb = container.querySelector(`input[data-criteria-parent="${groupId}"]`);
          if (parentCb) {
            const anyChecked = subDiv.querySelectorAll('input[type="checkbox"]:checked').length > 0;
            if (anyChecked) {
              parentCb.checked = true;
              subDiv.classList.remove('hidden');
            } else {
              parentCb.checked = false;
              subDiv.classList.add('hidden');
            }
          }
        }
        updateCriteriaButtonState(metric);
        updateActiveCriteriaBar();
        runFilterLogic();
      });
    });

    // Radio input changes (fallback)
    radioInputs.forEach(radio => {
      radio.addEventListener('change', () => {
        const subDiv = radio.closest('[data-criteria-sub]');
        if (subDiv) {
          const groupId = subDiv.getAttribute('data-criteria-sub');
          const parentCb = container.querySelector(`input[data-criteria-parent="${groupId}"]`);
          if (parentCb && !parentCb.checked) {
            parentCb.checked = true;
            subDiv.classList.remove('hidden');
          }
        }
        updateCriteriaButtonState(metric);
        updateActiveCriteriaBar();
        runFilterLogic();
      });
    });
  });

  // Đóng dropdown khi click ra ngoài
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-criteria-container]')) {
      closeAllCriteriaMenus();
    }
  });

  // Nút xoá tất cả điều kiện
  const clearAllBtn = document.getElementById('clearAllCriteriaFilterBtn');
  const resetAllBtn = document.getElementById('resetAllCriteriaBtn');
  if (clearAllBtn) clearAllBtn.addEventListener('click', resetAllCriteria);
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetAllCriteria);
}

function closeAllCriteriaMenus() {
  document.querySelectorAll('[data-criteria-menu]').forEach(menu => {
    menu.classList.add('hidden');
  });
  document.querySelectorAll('[data-criteria-btn] svg').forEach(svg => {
    svg.classList.remove('rotate-180');
  });
}
window.closeAllCriteriaMenus = closeAllCriteriaMenus;

function updateCriteriaButtonState(metric) {
  const container = document.querySelector(`[data-criteria-container="${metric}"]`);
  if (!container) return;

  const btn = container.querySelector(`[data-criteria-btn="${metric}"]`);
  const textSpan = container.querySelector(`[data-criteria-selected-text="${metric}"]`);
  if (!btn || !textSpan) return;

  const activeConditions = getActiveConditionsForMetric(metric);

  if (activeConditions.length === 0) {
    textSpan.textContent = 'Nhập hoặc chọn điều kiện';
    textSpan.classList.add('text-[#818181]');
    textSpan.classList.remove('text-[#051650]', 'font-semibold');
    btn.classList.remove('border-[#051650]', 'bg-[#F8F3EC]/30', 'ring-1', 'ring-[#051650]');
    btn.classList.add('border-[#D7D7D7]', 'bg-white');
  } else if (activeConditions.length === 1) {
    textSpan.textContent = activeConditions[0].label;
    textSpan.classList.remove('text-[#818181]');
    textSpan.classList.add('text-[#051650]', 'font-semibold');
    btn.classList.add('border-[#051650]', 'bg-[#F8F3EC]/30', 'ring-1', 'ring-[#051650]');
    btn.classList.remove('border-[#D7D7D7]', 'bg-white');
  } else {
    textSpan.textContent = `${activeConditions[0].label} (+${activeConditions.length - 1})`;
    textSpan.classList.remove('text-[#818181]');
    textSpan.classList.add('text-[#051650]', 'font-semibold');
    btn.classList.add('border-[#051650]', 'bg-[#F8F3EC]/30', 'ring-1', 'ring-[#051650]');
    btn.classList.remove('border-[#D7D7D7]', 'bg-white');
  }
}

/**
 * Đặt lại toàn bộ 15 tiêu chí về mặc định
 */
function resetAllCriteria() {
  document.querySelectorAll('input[data-criteria-cb]').forEach(cb => {
    cb.checked = false;
  });
  document.querySelectorAll('input[data-criteria-parent]').forEach(parentCb => {
    parentCb.checked = false;
  });
  document.querySelectorAll('[data-criteria-sub] input[type="checkbox"]').forEach(subCb => {
    subCb.checked = false;
  });
  document.querySelectorAll('[data-criteria-sub]').forEach(subDiv => {
    subDiv.classList.add('hidden');
  });
  document.querySelectorAll('[data-criteria-container]').forEach(container => {
    const metric = container.getAttribute('data-criteria-container');
    updateCriteriaButtonState(metric);
  });
  closeAllCriteriaMenus();
  updateActiveCriteriaBar();
  runFilterLogic();
}

/**
 * Cập nhật thanh hiển thị các tiêu chí đang được chọn (Active Criteria Pills Bar)
 */
function updateActiveCriteriaBar() {
  const bar = document.getElementById('activeCriteriaBar');
  const list = document.getElementById('activeCriteriaPillsList');
  const countBadge = document.getElementById('activeCriteriaCountBadge');
  if (!bar || !list) return;

  list.innerHTML = '';
  let activeCount = 0;

  const allActive = getAllActiveConditions();
  allActive.forEach(cond => {
    activeCount++;
    const label = CRITERIA_METRIC_LABELS[cond.metric] || cond.metric.toUpperCase();

    const pill = document.createElement('div');
    pill.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#051650] text-white text-[11px] font-medium shadow-2xs animate-fadeIn';

    let removeFunc = '';
    if (cond.type === 'sub_checkbox') {
      removeFunc = `uncheckCriteriaSubCheckbox('${escapeHtml(cond.groupId)}', '${escapeHtml(cond.condition)}')`;
    } else if (cond.type === 'group') {
      removeFunc = `uncheckCriteriaParent('${escapeHtml(cond.groupId)}')`;
    } else {
      removeFunc = `uncheckCriteriaOption('${escapeHtml(cond.metric)}', '${escapeHtml(cond.condition)}')`;
    }

    pill.innerHTML = `
      <span><strong class="text-[#C8997D]">${escapeHtml(label)}:</strong> ${escapeHtml(cond.label)}</span>
      <button type="button" class="w-3.5 h-3.5 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white font-bold text-[11px] leading-none" 
              title="Bỏ chọn điều kiện này" onclick="${removeFunc}">&times;</button>
    `;
    list.appendChild(pill);
  });

  if (countBadge) countBadge.textContent = activeCount;
  if (activeCount > 0) bar.classList.remove('hidden');
  else bar.classList.add('hidden');
}

window.uncheckCriteriaOption = function (metric, value) {
  const cb = document.querySelector(`input[data-criteria-cb="${metric}"][value="${value}"]`);
  if (cb) {
    cb.checked = false;
    updateCriteriaButtonState(metric);
    updateActiveCriteriaBar();
    runFilterLogic();
  }
};

window.uncheckCriteriaParent = function (groupId) {
  const parentCb = document.querySelector(`input[data-criteria-parent="${groupId}"]`);
  if (parentCb) {
    parentCb.checked = false;
    const subDiv = document.querySelector(`[data-criteria-sub="${groupId}"]`);
    if (subDiv) {
      subDiv.classList.add('hidden');
      subDiv.querySelectorAll('input[type="checkbox"]').forEach(scb => {
        scb.checked = false;
      });
    }
    const metric = parentCb.getAttribute('data-metric');
    updateCriteriaButtonState(metric);
    updateActiveCriteriaBar();
    runFilterLogic();
  }
};

window.uncheckCriteriaSubCheckbox = function (groupId, value) {
  const subDiv = document.querySelector(`[data-criteria-sub="${groupId}"]`);
  const parentCb = document.querySelector(`input[data-criteria-parent="${groupId}"]`);
  if (subDiv) {
    const subCb = subDiv.querySelector(`input[value="${value}"]`);
    if (subCb) subCb.checked = false;
    const remainingChecked = subDiv.querySelectorAll('input[type="checkbox"]:checked').length;
    if (remainingChecked === 0 && parentCb) {
      parentCb.checked = false;
      subDiv.classList.add('hidden');
    }
    const metric = parentCb ? parentCb.getAttribute('data-metric') : null;
    if (metric) updateCriteriaButtonState(metric);
    updateActiveCriteriaBar();
    runFilterLogic();
  }
};

/**
 * Tính mức trung bình từ toàn bộ dữ liệu (fill) 8 năm của danh sách ngân hàng được chọn
 */
function calculate10YearAverages(banks) {
  const targetBanks = (banks && banks.length > 0) ? banks : getBanksList();
  const metricKeys = ['cir', 'cpkh_toi', 'blvh', 'blntt', 'blnst', 'ttlr', 'roa', 'debt_equity', 'roe', 'cfo', 'casa', 'npl', 'nim', 'car', 'llr'];
  const result = {};

  metricKeys.forEach(key => {
    const vals = [];
    targetBanks.forEach(b => {
      const hList = b.history || [];
      hList.forEach(h => {
        if (h[key] !== null && h[key] !== undefined && typeof h[key] === 'number' && !isNaN(h[key])) {
          vals.push(h[key]);
        }
      });
    });

    if (vals.length > 0) {
      const sum = vals.reduce((acc, v) => acc + v, 0);
      result[key] = +(sum / vals.length).toFixed(2);
      result[`${key}_count`] = vals.length;
    } else {
      result[key] = null;
      result[`${key}_count`] = 0;
    }
  });

  return result;
}

/**
 * Kiểm tra 1 điều kiện cụ thể của 1 tiêu chí đối với ngân hàng
 */
function evaluateCondition(bank, metric, condition) {
  const metricKeyMap = {
    cpkh: 'cpkh_toi',
    de: 'debt_equity'
  };
  const key = metricKeyMap[metric] || metric;
  const history = bank.history || [];

  // Năm hiện tại - 1 (năm tài chính gần nhất chuẩn hóa)
  const targetYear = new Date().getFullYear() - 1;
  const targetHistory = history.find(h => h.year === targetYear);

  // Lấy giá trị của ngân hàng ở năm (năm hiện tại - 1), fallback về bank[key] nếu không tìm thấy trong history
  const getLatestVal = (field) => {
    if (targetHistory && targetHistory[field] !== undefined && targetHistory[field] !== null) {
      return targetHistory[field];
    }
    return (bank[field] !== undefined && bank[field] !== null) ? bank[field] : null;
  };

  // Trung bình ngành: Ưu tiên lấy từ toàn bộ dữ liệu 8 năm của các ngân hàng đã chọn
  const sectorAvg = (window.SELECTED_10Y_AVERAGES && window.SELECTED_10Y_AVERAGES[key] !== undefined && window.SELECTED_10Y_AVERAGES[key] !== null)
    ? window.SELECTED_10Y_AVERAGES[key]
    : ((window.ANNUAL_AVERAGES && window.ANNUAL_AVERAGES[targetYear] && window.ANNUAL_AVERAGES[targetYear][key] !== undefined)
      ? window.ANNUAL_AVERAGES[targetYear][key]
      : ((window.SECTOR_AVERAGES && window.SECTOR_AVERAGES[key] !== undefined) ? window.SECTOR_AVERAGES[key] : null));

  // Debug: log giá trị đang được đánh giá
  if (!window._evalDebugShown) window._evalDebugShown = {};
  const debugKey = `${bank.ticker}_${metric}_${condition}`;
  if (!window._evalDebugShown[debugKey]) {
    const fieldVal = getLatestVal(key);
    const countSample = window.SELECTED_10Y_AVERAGES ? window.SELECTED_10Y_AVERAGES[`${key}_count`] : null;
    console.log(
      `    [EVAL] ${bank.ticker} | ${metric}:${condition}`,
      `| year=${targetYear} val=${fieldVal}`,
      sectorAvg !== null ? `| TB 8 năm(${countSample ? countSample + ' mẫu' : 'nhóm'})=${sectorAvg}` : '',
      `| history=${history.length}yr`
    );
    window._evalDebugShown[debugKey] = true;
  }

  // Helper kiểm tra bóc từng năm trong lịch sử so với số trung bình đã tính (thỏa hết tất cả các năm mới đạt)
  const check10yVsAvg = (field, isUnder) => {
    if (history.length === 0 || sectorAvg === null) return false;
    return history.every(h => {
      const val = h[field];
      if (val === null || val === undefined || typeof val !== 'number') return false;
      return isUnder ? val < sectorAvg : val > sectorAvg;
    });
  };

  switch (metric) {
    case 'cir':
      if (condition === 'under_60_latest') {
        const val = getLatestVal('cir');
        return val !== null && val < 60;
      }
      if (condition === 'under_avg_latest') {
        const val = getLatestVal('cir');
        return val !== null && sectorAvg !== null && val < sectorAvg;
      }
      if (condition === 'under_avg_10y') {
        return check10yVsAvg('cir', true);
      }
      break;

    case 'cpkh':
      if (condition === 'under_10_latest') {
        const val = getLatestVal('cpkh_toi');
        return val !== null && val < 10;
      }
      break;

    case 'blvh':
      if (condition === 'above_avg_10y') {
        return check10yVsAvg('blvh', false);
      }
      break;

    case 'blntt':
      if (condition === 'above_avg_10y') {
        return check10yVsAvg('blntt', false);
      }
      break;

    case 'blnst':
      if (condition === 'above_avg_latest') {
        const val = getLatestVal('blnst');
        return val !== null && sectorAvg !== null && val > sectorAvg;
      }
      if (condition === 'above_avg_10y') {
        return check10yVsAvg('blnst', false);
      }
      break;

    case 'ttlr':
      if (condition === 'positive_10y') {
        const validYears = history.filter(h => h.ttlr !== null && h.ttlr !== undefined && typeof h.ttlr === 'number');
        if (validYears.length === 0) return false;
        return validYears.every(h => h.ttlr > 0);
      }
      break;

    case 'roa':
      if (condition === 'above_avg_latest') {
        const val = getLatestVal('roa');
        return val !== null && sectorAvg !== null && val > sectorAvg;
      }
      if (condition === 'above_avg_10y') {
        return check10yVsAvg('roa', false);
      }
      if (condition === 'from_1pct') {
        const val = getLatestVal('roa');
        return val !== null && val >= 1.0;
      }
      break;

    case 'de':
      if (condition === 'under_10' || condition === 'under_10_latest') {
        const val = getLatestVal('debt_equity');
        return val !== null && val < 10;
      }
      if (condition === 'under_10_10y') {
        const validYears = history.filter(h => h.debt_equity !== null && h.debt_equity !== undefined && typeof h.debt_equity === 'number');
        if (validYears.length === 0) return false;
        return validYears.every(h => h.debt_equity < 10);
      }
      if (condition === 'under_avg_latest') {
        const val = getLatestVal('debt_equity');
        return val !== null && sectorAvg !== null && val < sectorAvg;
      }
      if (condition === 'under_avg_10y') {
        return check10yVsAvg('debt_equity', true);
      }
      break;

    case 'roe':
      if (condition === 'above_avg_latest') {
        const val = getLatestVal('roe');
        return val !== null && sectorAvg !== null && val > sectorAvg;
      }
      if (condition === 'above_avg_10y') {
        return check10yVsAvg('roe', false);
      }
      if (condition === 'from_15pct_10y') {
        if (history.length === 0) return false;
        return history.every(h => h.roe !== null && h.roe >= 15);
      }
      if (condition === 'from_20pct_10y') {
        if (history.length === 0) return false;
        return history.every(h => h.roe !== null && h.roe >= 20);
      }
      break;

    case 'cfo':
      if (condition === 'greater_than_parent_npat_10y') {
        const validYears = history.filter(h =>
          h.cfo !== null && h.cfo !== undefined && typeof h.cfo === 'number' &&
          h.parent_npat !== null && h.parent_npat !== undefined && typeof h.parent_npat === 'number'
        );
        if (validYears.length === 0) return false;
        return validYears.every(h => h.cfo > h.parent_npat);
      }
      break;

    case 'casa':
      if (condition === 'above_avg_latest') {
        const val = getLatestVal('casa');
        return val !== null && sectorAvg !== null && val > sectorAvg;
      }
      if (condition === 'above_avg_10y') {
        return check10yVsAvg('casa', false);
      }
      break;

    case 'npl':
      if (condition === 'under_avg_latest') {
        const val = getLatestVal('npl');
        return val !== null && sectorAvg !== null && val < sectorAvg;
      }
      if (condition === 'under_avg_10y') {
        return check10yVsAvg('npl', true);
      }
      break;

    case 'nim':
      if (condition === 'above_3pct_latest') {
        const val = getLatestVal('nim');
        return val !== null && val > 3.0;
      }
      if (condition === 'above_3pct_10y') {
        if (history.length === 0) return false;
        return history.every(h => h.nim !== null && h.nim > 3.0);
      }
      break;

    case 'car':
      if (condition === 'above_10pct_latest') {
        const val = getLatestVal('car');
        return val !== null && val > 10.0;
      }
      if (condition === 'above_10pct_10y') {
        if (history.length === 0) return false;
        return history.every(h => h.car !== null && h.car > 10.0);
      }
      if (condition === 'above_12pct_latest') {
        const val = getLatestVal('car');
        return val !== null && val > 12.0;
      }
      if (condition === 'above_12pct_10y') {
        if (history.length === 0) return false;
        return history.every(h => h.car !== null && h.car > 12.0);
      }
      break;

    case 'llr':
      if (condition === 'above_50pct_latest') {
        const val = getLatestVal('llr');
        return val !== null && val > 50.0;
      }
      if (condition === 'above_50pct_10y') {
        if (history.length === 0) return false;
        return history.every(h => h.llr !== null && h.llr > 50.0);
      }
      break;
  }
  // Điều kiện không xác định → loại bỏ (không pass)
  return false;
}

// ----------------------------------------------------------------------------
// LOGIC SÀNG LỌC ĐA TIÊU CHÍ (15 CHỈ TIÊU & MÃ CỔ PHIẾU ĐÃ CHỌN)
// ----------------------------------------------------------------------------
function runFilterLogic() {
  const banksList = getBanksList();

  // ── GIAI ĐOẠN 1: Kiểm tra nguồn dữ liệu ──────────────────────────────────
  console.group('%c[FILTER] ══ CHẠY BỘ LỌC ══', 'color:#051650;font-weight:bold;font-size:13px');
  console.log('[FILTER] 📦 BANKS_DATA tổng:', banksList.length, 'ngân hàng');
  console.log('[FILTER] 📡 SECTOR_AVERAGES:', window.SECTOR_AVERAGES);
  console.log('[FILTER] 📅 ANNUAL_AVERAGES (năm):', Object.keys(window.ANNUAL_AVERAGES || {}));

  if (banksList.length === 0) {
    console.warn('[FILTER] ⚠️ BANKS_DATA rỗng — không có dữ liệu!');
    console.groupEnd();
    return;
  }

  const countSummary = document.getElementById('filterCountSummary');

  // Quy tắc: Bắt buộc phải có mã cổ phiếu thì bộ lọc mới hoạt động được
  if (!selectedStocks || selectedStocks.length === 0) {
    console.warn('[FILTER] ⚠️ Chưa chọn mã cổ phiếu — bộ lọc chưa hoạt động');
    console.groupEnd();
    if (countSummary) countSummary.textContent = 'Có 00 mã cổ phiếu thoả điều kiện';
    currentFilteredBanks = [];
    renderCompanyTable([]);
    return;
  }

  // ── GIAI ĐOẠN 2: Danh sách mã đã chọn ────────────────────────────────────
  console.log('[FILTER] ✅ Mã đã chọn:', selectedStocks);

  // Lấy danh sách tất cả các điều kiện đang được chọn
  const activeConditions = getAllActiveConditions();
  const hasCriteriaFilters = activeConditions.length > 0;

  // ── GIAI ĐOẠN 3: Điều kiện lọc đang bật ──────────────────────────────────
  console.group('[FILTER] 🎯 Điều kiện đang bật (' + activeConditions.length + ' điều kiện)');
  activeConditions.forEach((cond, i) => {
    console.log(
      `  [${i + 1}] ${cond.type.toUpperCase()} | metric: ${cond.metric} | condition: ${cond.condition} | label: ${cond.label}`
    );
  });
  console.groupEnd();

  const standaloneConditions = [];
  const subConditionsByGroup = {};

  activeConditions.forEach(cond => {
    if (cond.type === 'sub_checkbox') {
      if (!subConditionsByGroup[cond.groupId]) subConditionsByGroup[cond.groupId] = [];
      subConditionsByGroup[cond.groupId].push(cond);
    } else {
      standaloneConditions.push(cond);
    }
  });

  console.log('[FILTER] AND conditions (standalone/radio):', standaloneConditions.map(c => `${c.metric}:${c.condition}`));
  console.log('[FILTER] OR groups (sub-checkbox):', subConditionsByGroup);

  // ── GIAI ĐOẠN 4: Lọc theo mã đã chọn & Tính TB 8 năm của nhóm ──────────
  const allBanks = getBanksList();
  const selectedBanks = allBanks.filter(bank => selectedStocks.includes(bank.ticker));
  console.log('[FILTER] 🏦 Ngân hàng trong pool lọc:', selectedBanks.map(b => b.ticker));

  // Tính trung bình toàn bộ 8 năm của các ngân hàng đã chọn
  window.SELECTED_10Y_AVERAGES = calculate10YearAverages(selectedBanks);
  console.log('[FILTER] 📊 Mức trung bình 8 năm của các ngân hàng đã chọn:', window.SELECTED_10Y_AVERAGES);

  // ── GIAI ĐOẠN 5: Đánh giá từng ngân hàng ────────────────────────────────
  console.group('[FILTER] 🔍 Đánh giá từng ngân hàng');

  let filtered = selectedBanks.filter(bank => {
    if (!hasCriteriaFilters) {
      console.log(`  ✅ ${bank.ticker} — Không có điều kiện → PASS`);
      return true;
    }

    let failReason = null;

    // 1. AND: Standalone + radio
    for (const cond of standaloneConditions) {
      const result = evaluateCondition(bank, cond.metric, cond.condition);
      console.log(
        `  ${result ? '✅' : '❌'} ${bank.ticker} | ${cond.metric}:${cond.condition}`,
        `| Giá trị: ${bank[cond.metric] ?? bank['debt_equity'] ?? bank['cpkh_toi'] ?? 'N/A'}`
      );
      if (!result) {
        failReason = `${cond.metric}:${cond.condition}`;
        break;
      }
    }

    if (failReason) {
      console.log(`  ❌ ${bank.ticker} → LOẠI vì: ${failReason}`);
      return false;
    }

    // 2. OR: Sub-checkbox groups
    for (const groupId in subConditionsByGroup) {
      const conds = subConditionsByGroup[groupId];
      const passedAny = conds.some(cond => {
        const result = evaluateCondition(bank, cond.metric, cond.condition);
        console.log(
          `  ${result ? '✅' : '  '} ${bank.ticker} | OR-group[${groupId}] | ${cond.condition}`
        );
        return result;
      });
      if (!passedAny) {
        console.log(`  ❌ ${bank.ticker} → LOẠI vì OR-group không pass: ${groupId}`);
        return false;
      }
    }

    console.log(`  ✅ ${bank.ticker} → PASS tất cả điều kiện`);
    return true;
  });

  console.groupEnd();

  // ── GIAI ĐOẠN 6: Kết quả cuối ────────────────────────────────────────────
  console.log(
    `[FILTER] 🏁 KẾT QUẢ: ${filtered.length}/${selectedBanks.length} ngân hàng thoả điều kiện:`,
    filtered.map(b => b.ticker)
  );

  // Hiển thị chi tiết số liệu tính toán và trung bình ngành để người dùng so sánh tổng quan
  if (selectedBanks.length > 0 && hasCriteriaFilters) {
    const targetYear = new Date().getFullYear() - 1;

    // 1. Bảng so sánh tổng quan bằng console.table
    console.group(`[FILTER] 📊 BẢNG SO SÁNH SỐ LIỆU TÍNH TOÁN & TRUNG BÌNH 10 NĂM CỦA CÁC MÃ ĐÃ CHỌN`);
    const comparisonTableData = selectedBanks.map(bank => {
      const isPass = filtered.some(b => b.ticker === bank.ticker);
      const row = {
        'Mã CP': bank.ticker,
        'Tên Ngân Hàng': bank.name,
        'Kết quả': isPass ? '✅ ĐẠT' : '❌ LOẠI'
      };

      activeConditions.forEach(cond => {
        const key = { cpkh: 'cpkh_toi', de: 'debt_equity' }[cond.metric] || cond.metric;
        const hRecord = bank.history ? bank.history.find(h => h.year === targetYear) : null;
        const bankVal = (hRecord && hRecord[key] !== undefined && hRecord[key] !== null)
          ? hRecord[key]
          : (bank[key] ?? null);

        const secAvg = (window.SELECTED_10Y_AVERAGES && window.SELECTED_10Y_AVERAGES[key] !== undefined && window.SELECTED_10Y_AVERAGES[key] !== null)
          ? window.SELECTED_10Y_AVERAGES[key]
          : ((window.ANNUAL_AVERAGES && window.ANNUAL_AVERAGES[targetYear] && window.ANNUAL_AVERAGES[targetYear][key] !== undefined)
            ? window.ANNUAL_AVERAGES[targetYear][key]
            : (window.SECTOR_AVERAGES?.[key] ?? null));

        const countSample = window.SELECTED_10Y_AVERAGES ? window.SELECTED_10Y_AVERAGES[`${key}_count`] : 0;
        const label = CRITERIA_METRIC_LABELS[cond.metric] || cond.metric.toUpperCase();
        const headerName = `${label} [field: ${key}]`;

        if (cond.condition.includes('avg_latest')) {
          row[headerName] = `Giá trị: ${bankVal !== null ? bankVal + '%' : 'N/A'} | TB 8 năm (${selectedBanks.length} mã, ${countSample} mẫu): ${secAvg !== null ? secAvg + '%' : 'N/A'}`;
        } else if (cond.condition.includes('avg_10y')) {
          const isUnder = cond.condition.startsWith('under');
          const hList = bank.history || [];
          const passYears = hList.filter(h => {
            const v = h[key];
            return v !== null && v !== undefined && typeof v === 'number' && (isUnder ? v < secAvg : v > secAvg);
          }).length;
          const totalYears = hList.length;
          const allPass = totalYears > 0 && passYears === totalYears;
          row[headerName] = `${allPass ? '✅ ĐẠT' : '❌ LOẠI'} (${passYears}/${totalYears} năm ${isUnder ? '<' : '>'} TB: ${secAvg}%)`;
        } else if (cond.condition === 'positive_10y') {
          const validYears = (bank.history || []).filter(h => h.ttlr !== null && h.ttlr !== undefined && typeof h.ttlr === 'number');
          const posYears = validYears.filter(h => h.ttlr > 0).length;
          const allPos = validYears.length > 0 && posYears === validYears.length;
          row[headerName] = `${allPos ? '✅ ĐẠT' : '❌ LOẠI'} (${posYears}/${validYears.length} năm dương | 2025: ${bankVal !== null ? bankVal + '%' : 'N/A'})`;
        } else if (cond.metric === 'cfo' && cond.condition === 'greater_than_parent_npat_10y') {
          const validYears = (bank.history || []).filter(h =>
            h.cfo !== null && h.cfo !== undefined && typeof h.cfo === 'number' &&
            h.parent_npat !== null && h.parent_npat !== undefined && typeof h.parent_npat === 'number'
          );
          const passYears = validYears.filter(h => h.cfo > h.parent_npat).length;
          const allPass = validYears.length > 0 && passYears === validYears.length;
          const latestCfo = (hRecord && hRecord.cfo !== undefined && hRecord.cfo !== null) ? hRecord.cfo : (bank.cfo ?? null);
          const latestNpat = (hRecord && hRecord.parent_npat !== undefined && hRecord.parent_npat !== null) ? hRecord.parent_npat : (bank.parent_npat ?? null);
          row[headerName] = `${allPass ? '✅ ĐẠT' : '❌ LOẠI'} (${passYears}/${validYears.length} năm CFO > LNST | ${targetYear}: ${latestCfo !== null ? Math.round(latestCfo) : 'N/A'} > ${latestNpat !== null ? Math.round(latestNpat) : 'N/A'})`;
        } else if (cond.metric === 'roa' && cond.condition === 'from_1pct') {
          const pass = bankVal !== null && bankVal >= 1.0;
          row[headerName] = `${pass ? '✅ ĐẠT' : '❌ LOẠI'} (ROA ${targetYear}: ${bankVal !== null ? bankVal + '%' : 'N/A'} >= 1%)`;
        } else if (cond.metric === 'de' && (cond.condition === 'under_10' || cond.condition === 'under_10_latest')) {
          const pass = bankVal !== null && bankVal < 10;
          row[headerName] = `${pass ? '✅ ĐẠT' : '❌ LOẠI'} (D/E ${targetYear}: ${bankVal !== null ? bankVal : 'N/A'} < 10)`;
        } else if (cond.metric === 'de' && cond.condition === 'under_10_10y') {
          const validYears = (bank.history || []).filter(h => h.debt_equity !== null && h.debt_equity !== undefined && typeof h.debt_equity === 'number');
          const passYears = validYears.filter(h => h.debt_equity < 10).length;
          const allPass = validYears.length > 0 && passYears === validYears.length;
          row[headerName] = `${allPass ? '✅ ĐẠT' : '❌ LOẠI'} (${passYears}/${validYears.length} năm D/E < 10 | ${targetYear}: ${bankVal !== null ? bankVal : 'N/A'})`;
        } else {
          row[headerName] = `Giá trị ${targetYear}: ${bankVal !== null ? bankVal : 'N/A'}`;
        }
      });

      return row;
    });

    console.table(comparisonTableData);

    // 2. Chi tiết từng ngân hàng ĐẠT
    if (filtered.length > 0) {
      console.group(`[FILTER] 🏆 Chi tiết các ngân hàng ĐẠT (${filtered.length} mã):`);
      filtered.forEach(bank => {
        console.group(`  🏦 ${bank.ticker} - ${bank.name}`);
        activeConditions.forEach(cond => {
          const key = { cpkh: 'cpkh_toi', de: 'debt_equity' }[cond.metric] || cond.metric;
          const hRecord = bank.history ? bank.history.find(h => h.year === targetYear) : null;
          const bankVal = (hRecord && hRecord[key] !== undefined && hRecord[key] !== null)
            ? hRecord[key]
            : (bank[key] ?? null);
          const secAvg = (window.SELECTED_10Y_AVERAGES && window.SELECTED_10Y_AVERAGES[key] !== undefined && window.SELECTED_10Y_AVERAGES[key] !== null)
            ? window.SELECTED_10Y_AVERAGES[key]
            : ((window.ANNUAL_AVERAGES && window.ANNUAL_AVERAGES[targetYear] && window.ANNUAL_AVERAGES[targetYear][key] !== undefined)
              ? window.ANNUAL_AVERAGES[targetYear][key]
              : (window.SECTOR_AVERAGES?.[key] ?? null));
          const countSample = window.SELECTED_10Y_AVERAGES ? window.SELECTED_10Y_AVERAGES[`${key}_count`] : 0;
          const label = CRITERIA_METRIC_LABELS[cond.metric] || cond.metric.toUpperCase();

          if (cond.condition === 'positive_10y') {
            const validYears = (bank.history || []).filter(h => h.ttlr !== null && h.ttlr !== undefined && typeof h.ttlr === 'number');
            const yearsDetail = validYears.map(h => `${h.year}: +${h.ttlr}%`).join(', ');
            console.log(
              `    • ${label} (field: "${key}") [LUÔN LÀ SỐ DƯƠNG]:`,
              `Tất cả ${validYears.length}/${validYears.length} năm có dữ liệu đều dương: [${yearsDetail}]`
            );
          } else if (cond.condition.includes('avg_10y')) {
            const isUnder = cond.condition.startsWith('under');
            const yearsDetail = (bank.history || []).map(h => `${h.year}: ${h[key] ?? 'N/A'}`).join(', ');
            console.log(
              `    • ${label} (field: "${key}") [LIÊN TIẾP 10 NĂM]:`,
              `TB đã tính = ${secAvg}% | Thỏa hết tất cả các năm (${isUnder ? '<' : '>'} ${secAvg}%): [${yearsDetail}]`
            );
          } else if (cond.metric === 'cfo' && cond.condition === 'greater_than_parent_npat_10y') {
            const validYears = (bank.history || []).filter(h =>
              h.cfo !== null && h.cfo !== undefined && typeof h.cfo === 'number' &&
              h.parent_npat !== null && h.parent_npat !== undefined && typeof h.parent_npat === 'number'
            );
            const yearsDetail = validYears.map(h => `${h.year}: CFO (${Math.round(h.cfo)}) > LNST (${Math.round(h.parent_npat)}) ✅`).join(', ');
            console.log(
              `    • ${label} (field: "cfo" vs "parent_npat") [LIÊN TIẾP 10 NĂM]:`,
              `Thỏa tất cả ${validYears.length}/${validYears.length} năm CFO > LNST CĐ mẹ: [${yearsDetail}]`
            );
          } else if (cond.metric === 'roa' && cond.condition === 'from_1pct') {
            console.log(
              `    • ${label} (field: "roa") [TỪ 1% TRỞ LÊN Ở NĂM GẦN NHẤT]:`,
              `ROA năm ${targetYear} = ${bankVal}% >= 1% ✅`
            );
          } else if (cond.metric === 'de' && (cond.condition === 'under_10' || cond.condition === 'under_10_latest')) {
            console.log(
              `    • ${label} (field: "debt_equity") [DƯỚI 10 Ở NĂM GẦN NHẤT]:`,
              `D/E năm ${targetYear} = ${bankVal} < 10 ✅`
            );
          } else if (cond.metric === 'de' && cond.condition === 'under_10_10y') {
            const validYears = (bank.history || []).filter(h => h.debt_equity !== null && h.debt_equity !== undefined && typeof h.debt_equity === 'number');
            const yearsDetail = validYears.map(h => `${h.year}: ${h.debt_equity}`).join(', ');
            console.log(
              `    • ${label} (field: "debt_equity") [DƯỚI 10 LIÊN TIẾP 10 NĂM]:`,
              `Tất cả ${validYears.length}/${validYears.length} năm đều < 10: [${yearsDetail}] ✅`
            );
          } else {
            console.log(
              `    • ${label} (field: "${key}"):`,
              `Giá trị năm ${targetYear} = ${bankVal !== null ? bankVal : 'N/A'}`,
              secAvg !== null ? `| TB 8 năm (${selectedBanks.length} mã đã chọn, ${countSample} bản ghi) = ${secAvg}` : '',
              `| Điều kiện: "${cond.label || cond.condition}"`
            );
          }
        });
        console.groupEnd();
      });
      console.groupEnd();
    }

    // 3. Chi tiết các ngân hàng KHÔNG ĐẠT (nếu có)
    const failedBanks = selectedBanks.filter(b => !filtered.some(f => f.ticker === b.ticker));
    if (failedBanks.length > 0) {
      console.group(`[FILTER] ⚠️ Chi tiết các ngân hàng KHÔNG ĐẠT (${failedBanks.length} mã):`);
      failedBanks.forEach(bank => {
        console.group(`  🏦 ${bank.ticker} - ${bank.name}`);
        activeConditions.forEach(cond => {
          const key = { cpkh: 'cpkh_toi', de: 'debt_equity' }[cond.metric] || cond.metric;
          const hRecord = bank.history ? bank.history.find(h => h.year === targetYear) : null;
          const bankVal = (hRecord && hRecord[key] !== undefined && hRecord[key] !== null)
            ? hRecord[key]
            : (bank[key] ?? null);
          const secAvg = (window.SELECTED_10Y_AVERAGES && window.SELECTED_10Y_AVERAGES[key] !== undefined && window.SELECTED_10Y_AVERAGES[key] !== null)
            ? window.SELECTED_10Y_AVERAGES[key]
            : ((window.ANNUAL_AVERAGES && window.ANNUAL_AVERAGES[targetYear] && window.ANNUAL_AVERAGES[targetYear][key] !== undefined)
              ? window.ANNUAL_AVERAGES[targetYear][key]
              : (window.SECTOR_AVERAGES?.[key] ?? null));
          const countSample = window.SELECTED_10Y_AVERAGES ? window.SELECTED_10Y_AVERAGES[`${key}_count`] : 0;
          const label = CRITERIA_METRIC_LABELS[cond.metric] || cond.metric.toUpperCase();
          const pass = evaluateCondition(bank, cond.metric, cond.condition);

          if (cond.condition === 'positive_10y') {
            const validYears = (bank.history || []).filter(h => h.ttlr !== null && h.ttlr !== undefined && typeof h.ttlr === 'number');
            const negYears = validYears.filter(h => h.ttlr <= 0).map(h => `${h.year}: ${h.ttlr}%`);
            console.log(
              `    ❌ ${label} (field: "${key}") [LUÔN LÀ SỐ DƯƠNG]: Không thỏa vì các năm sau bị âm/không dương: ${negYears.join(', ')}`
            );
          } else if (cond.condition.includes('avg_10y')) {
            const isUnder = cond.condition.startsWith('under');
            const failedYears = (bank.history || []).filter(h => {
              const v = h[key];
              return v === null || v === undefined || (isUnder ? v >= secAvg : v <= secAvg);
            }).map(h => `${h.year} (${h[key] ?? 'null'})`);
            console.log(
              `    ❌ ${label} (field: "${key}") [LIÊN TIẾP 10 NĂM]: Không thỏa vì các năm sau vi phạm so với TB ${secAvg}%: ${failedYears.join(', ')}`
            );
          } else if (cond.metric === 'cfo' && cond.condition === 'greater_than_parent_npat_10y') {
            const validYears = (bank.history || []).filter(h =>
              h.cfo !== null && h.cfo !== undefined && typeof h.cfo === 'number' &&
              h.parent_npat !== null && h.parent_npat !== undefined && typeof h.parent_npat === 'number'
            );
            const failedYears = validYears.filter(h => h.cfo <= h.parent_npat).map(h => `${h.year} (CFO: ${Math.round(h.cfo)} <= LNST: ${Math.round(h.parent_npat)})`);
            const passCount = validYears.filter(h => h.cfo > h.parent_npat).length;
            console.log(
              `    ❌ ${label} (field: "cfo" vs "parent_npat") [LIÊN TIẾP 10 NĂM]: Không thỏa (${passCount}/${validYears.length} năm đạt), các năm sau vi phạm CFO <= LNST: ${failedYears.join(', ')}`
            );
          } else if (cond.metric === 'roa' && cond.condition === 'from_1pct') {
            console.log(
              `    ❌ ${label} (field: "roa") [TỪ 1% TRỞ LÊN Ở NĂM GẦN NHẤT]: Không thỏa vì ROA năm ${targetYear} = ${bankVal !== null ? bankVal + '%' : 'N/A'} < 1%`
            );
          } else if (cond.metric === 'de' && (cond.condition === 'under_10' || cond.condition === 'under_10_latest')) {
            console.log(
              `    ❌ ${label} (field: "debt_equity") [DƯỚI 10 Ở NĂM GẦN NHẤT]: Không thỏa vì D/E năm ${targetYear} = ${bankVal !== null ? bankVal : 'N/A'} >= 10`
            );
          } else if (cond.metric === 'de' && cond.condition === 'under_10_10y') {
            const validYears = (bank.history || []).filter(h => h.debt_equity !== null && h.debt_equity !== undefined && typeof h.debt_equity === 'number');
            const failedYears = validYears.filter(h => h.debt_equity >= 10).map(h => `${h.year}: ${h.debt_equity}`);
            const passCount = validYears.filter(h => h.debt_equity < 10).length;
            console.log(
              `    ❌ ${label} (field: "debt_equity") [DƯỚI 10 LIÊN TIẾP 10 NĂM]: Không thỏa (${passCount}/${validYears.length} năm đạt), các năm sau vi phạm D/E >= 10: ${failedYears.join(', ')}`
            );
          } else {
            console.log(
              `    ${pass ? '✅' : '❌'} ${label} (field: "${key}"):`,
              `Giá trị năm ${targetYear} = ${bankVal !== null ? bankVal : 'N/A'}`,
              secAvg !== null ? `| TB 8 năm (${selectedBanks.length} mã đã chọn, ${countSample} bản ghi) = ${secAvg}` : '',
              `| ${pass ? 'Đạt' : 'Không đạt'}: "${cond.label || cond.condition}"`
            );
          }
        });
        console.groupEnd();
      });
      console.groupEnd();
    }

    console.groupEnd(); // End BẢNG SO SÁNH
  }

  console.groupEnd(); // ══ KẾT THÚC BỘ LỌC ══

  // Lưu danh sách kết quả
  currentFilteredBanks = filtered;

  if (countSummary) {
    const num = filtered.length < 10 ? `0${filtered.length}` : `${filtered.length}`;
    countSummary.textContent = `Có ${num} mã cổ phiếu thoả điều kiện`;
  }

  renderCompanyTable(filtered);
}

/**
 * Render bảng doanh nghiệp thoả mãn điều kiện (Section 5 Left - 100% Figma spec)
 */
function renderCompanyTable(banks) {
  const tbody = document.getElementById('companyTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (!banks || banks.length === 0) {
    const hasCriteriaFilters = getAllActiveConditions().length > 0;
    const hasSelectedStocks = selectedStocks && selectedStocks.length > 0;

    let msg = 'Vui lòng chọn mã cổ phiếu vào khung để tiến hành lọc';
    if (!hasSelectedStocks) {
      msg = 'Vui lòng chọn mã cổ phiếu vào khung để tiến hành lọc';
    } else if (hasCriteriaFilters) {
      msg = 'Không có mã cổ phiếu nào trong danh sách đã chọn thoả mãn các điều kiện lọc';
    } else {
      msg = 'Không có dữ liệu phù hợp';
    }

    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-10 text-center text-[#818181] text-xs italic">
          ${escapeHtml(msg)}
        </td>
      </tr>
    `;
    return;
  }

  banks.forEach((bank, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'h-[46px] hover:bg-[#F8F3EC]/30 transition-colors group';

    tr.innerHTML = `
      <td class="px-2 text-center text-[#818181] font-semibold">${idx + 1}</td>
      <td class="px-4 font-medium text-[#051650] truncate">
          ${escapeHtml(bank.name)}
      </td>
      <td class="px-2 text-center font-bold text-[#051650]">
        ${escapeHtml(bank.ticker)}
      </td>
      <td class="px-6 text-right whitespace-nowrap">
        <div class="inline-flex items-center justify-end gap-6">
          <a href="/don-le?ticker=${encodeURIComponent(bank.ticker)}" 
             class="text-[12px] font-medium text-[#051650] hover:text-[#C8997D] hover:underline"
             title="Xem báo cáo tài chính chi tiết">
            Xem chi tiết
          </a>
          <label class="inline-flex items-center gap-2 cursor-pointer select-none" title="Thêm vào bảng so sánh đối chiếu">
            <input type="checkbox" 
                   data-compare-checkbox="${escapeHtml(bank.ticker)}" 
                   data-company-name="${escapeHtml(bank.name)}" 
                   class="w-4 h-4 rounded text-[#051650] border-[#323232] cursor-pointer accent-[#051650]"
                   onchange="handleCompareToggle(this, '${escapeHtml(bank.ticker)}')">
            <span class="text-[12px] text-[#051650]">So sánh</span>
          </label>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Xử lý checkbox thêm/bớt mã vào bảng so sánh
 */
function handleCompareToggle(checkbox, ticker) {
  const comparisonBox = document.getElementById('comparisonBoxChips');
  if (!comparisonBox) return;

  if (checkbox.checked) {
    // Kiểm tra xem đã có chip chưa
    const existing = comparisonBox.querySelector(`[data-comp-chip="${ticker}"]`);
    if (!existing) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.setAttribute('data-comp-chip', ticker);
      chip.className = 'h-[27px] rounded bg-white text-[#051650] text-[11px] font-bold border border-[#051650] hover:bg-[#F8F3EC] flex items-center justify-center transition-colors px-1';
      chip.textContent = ticker;
      chip.title = `Mã ${ticker} trong bảng so sánh (Bấm để loại bỏ)`;
      chip.onclick = () => {
        checkbox.checked = false;
        chip.remove();
      };
      comparisonBox.prepend(chip);
    }
  } else {
    const existing = comparisonBox.querySelector(`[data-comp-chip="${ticker}"]`);
    if (existing) existing.remove();
  }
}

// ============================================================================
// FRAME 2: BÁO CÁO ĐƠN LẺ (SINGLE STOCK FINANCIAL REPORT FLOW - LIVE GRID)
// ============================================================================
let currentFrame2Ticker = 'BAB';
let currentMetricFilter = 'ALL'; // 'ALL' | 'FILL' | 'TÍNH'
let currentSearchKeyword = '';

function initFrame2Flow() {
  console.log('[FLOW] Initializing Frame 2 Flow Engine (Live CSS/HTML Financial Grid)');

  // Đọc query param ?ticker=...
  const urlParams = new URLSearchParams(window.location.search);
  let ticker = urlParams.get('ticker') || 'BAB';
  currentFrame2Ticker = ticker.toUpperCase();

  const stockSelector = document.getElementById('stockSelector');
  const viewDetailBtn = document.getElementById('viewDetailBtn');
  const metricSearchInput = document.getElementById('metricSearchInput');
  const filterButtonGroup = document.getElementById('filterButtonGroup');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const toggleReferenceDrawerBtn = document.getElementById('toggleReferenceDrawerBtn');
  const closeReferenceDrawerBtn = document.getElementById('closeReferenceDrawerBtn');
  const referenceDrawer = document.getElementById('referenceDrawer');

  // Thiết lập giá trị cho ô chọn mã cổ phiếu
  if (stockSelector) {
    stockSelector.value = currentFrame2Ticker;
    stockSelector.addEventListener('change', (e) => {
      currentFrame2Ticker = e.target.value.toUpperCase();
      updateFinancialReportView(currentFrame2Ticker);
    });
  }

  // Nút "XEM CHI TIẾT" trong thanh tìm kiếm
  if (viewDetailBtn) {
    viewDetailBtn.addEventListener('click', () => {
      const selectedTicker = stockSelector ? stockSelector.value.toUpperCase() : currentFrame2Ticker;
      currentFrame2Ticker = selectedTicker;
      updateFinancialReportView(selectedTicker);
    });
  }

  // Ô tìm kiếm nhanh chỉ tiêu
  if (metricSearchInput) {
    metricSearchInput.addEventListener('input', (e) => {
      currentSearchKeyword = e.target.value.trim().toLowerCase();
      renderFinancialTableRows();
    });
  }

  // Bộ nút lọc: Tất cả | FILL | TÍNH
  if (filterButtonGroup) {
    const filterBtns = filterButtonGroup.querySelectorAll('.metric-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterType = btn.getAttribute('data-filter');
        currentMetricFilter = filterType;

        // Cập nhật trạng thái active của buttons
        filterBtns.forEach(b => {
          b.className = 'metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium text-[#495057] bg-[#F1F3F5] hover:bg-[#E9ECEF] transition-all';
        });
        if (filterType === 'ALL') {
          btn.className = 'metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#051650] text-white shadow-xs';
        } else if (filterType === 'FILL') {
          btn.className = 'metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#495057] text-white shadow-xs';
        } else if (filterType === 'TÍNH') {
          btn.className = 'metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#1971C2] text-white shadow-xs flex items-center gap-1';
        }

        renderFinancialTableRows();
      });
    });
  }

  // Nút xuất file CSV
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      exportFinancialTableToCSV(currentFrame2Ticker);
    });
  }

  // Nút toggle drawer bản vẽ đối chiếu
  if (toggleReferenceDrawerBtn && referenceDrawer) {
    toggleReferenceDrawerBtn.addEventListener('click', () => {
      const isHidden = referenceDrawer.classList.contains('hidden');
      if (isHidden) {
        referenceDrawer.classList.remove('hidden');
        referenceDrawer.scrollIntoView({ behavior: 'smooth' });
      } else {
        referenceDrawer.classList.add('hidden');
      }
    });
  }

  if (closeReferenceDrawerBtn && referenceDrawer) {
    closeReferenceDrawerBtn.addEventListener('click', () => {
      referenceDrawer.classList.add('hidden');
    });
  }

  // Khởi tạo Modal Công thức
  initFormulaModal();

  // Cập nhật giao diện lần đầu với mã được chọn
  updateFinancialReportView(currentFrame2Ticker);
}

/**
 * Cập nhật giao diện Báo cáo tài chính chi tiết của mã ngân hàng được chỉ định
 */
function updateFinancialReportView(ticker) {
  if (typeof getFinancialStatement !== 'function') return;

  const data = getFinancialStatement(ticker);

  // Cập nhật tiêu đề & badge
  const bankHeaderTitle = document.getElementById('bankHeaderTitle');
  const bankTickerBadge = document.getElementById('bankTickerBadge');
  if (bankHeaderTitle) bankHeaderTitle.textContent = `${data.name} - Báo Cáo Kết Quả Hoạt Động Kinh Doanh`;
  if (bankTickerBadge) bankTickerBadge.textContent = ticker;

  // Cập nhật URL trình duyệt (không reload trang)
  const newUrl = `${window.location.pathname}?ticker=${encodeURIComponent(ticker)}`;
  window.history.replaceState({ ticker }, '', newUrl);

  // Cập nhật các KPI Snapshot trên đầu bảng
  updateKpiSnapshot(data);

  // Render các hàng số liệu trong Bảng
  renderFinancialTableRows();
}

/**
 * Cập nhật 4 thẻ KPI tóm tắt trọng yếu
 */
function updateKpiSnapshot(data) {
  const kpiTOI = document.getElementById('kpiTOI');
  const kpiTOIGrowth = document.getElementById('kpiTOIGrowth');
  const kpiCIR = document.getElementById('kpiCIR');
  const kpiPBT = document.getElementById('kpiPBT');
  const kpiPBTGrowth = document.getElementById('kpiPBTGrowth');
  const kpiNPAT = document.getElementById('kpiNPAT');
  const kpiNPATGrowth = document.getElementById('kpiNPATGrowth');

  const toiRow = data.rows.find(r => r.id === 1);
  const toiGrowthRow = data.rows.find(r => r.id === 2);
  const cirRow = data.rows.find(r => r.id === 4);
  const pbtRow = data.rows.find(r => r.id === 9);
  const npatRow = data.rows.find(r => r.id === 11);
  const npatGrowthRow = data.rows.find(r => r.id === 15);

  if (kpiTOI && toiRow) kpiTOI.textContent = toiRow.values[toiRow.values.length - 1];
  if (kpiTOIGrowth && toiGrowthRow) kpiTOIGrowth.textContent = `${toiGrowthRow.values[toiGrowthRow.values.length - 1]} YoY`;
  if (kpiCIR && cirRow) kpiCIR.textContent = cirRow.values[cirRow.values.length - 1];
  if (kpiPBT && pbtRow) kpiPBT.textContent = pbtRow.values[pbtRow.values.length - 1];
  if (kpiNPAT && npatRow) kpiNPAT.textContent = npatRow.values[npatRow.values.length - 1];
  if (kpiNPATGrowth && npatGrowthRow) kpiNPATGrowth.textContent = `${npatGrowthRow.values[npatGrowthRow.values.length - 1]} YoY`;
}

/**
 * Render các hàng số liệu của BCTC vào tbody dựa trên bộ lọc và từ khóa tìm kiếm
 */
function renderFinancialTableRows() {
  if (typeof getFinancialStatement !== 'function') return;

  const data = getFinancialStatement(currentFrame2Ticker);
  const tbody = document.getElementById('financialTableBody');
  const metricCounterText = document.getElementById('metricCounterText');
  if (!tbody) return;

  tbody.innerHTML = '';

  // Lọc dữ liệu theo loại và từ khóa tìm kiếm
  const filteredRows = data.rows.filter(row => {
    // Lọc theo loại
    if (currentMetricFilter !== 'ALL' && row.type !== currentMetricFilter) {
      return false;
    }
    // Lọc theo từ khóa
    if (currentSearchKeyword) {
      const matchName = row.name.toLowerCase().includes(currentSearchKeyword);
      const matchType = row.type.toLowerCase().includes(currentSearchKeyword);
      const matchFormula = (row.formula || '').toLowerCase().includes(currentSearchKeyword);
      return matchName || matchType || matchFormula;
    }
    return true;
  });

  if (metricCounterText) {
    metricCounterText.textContent = `Hiển thị ${filteredRows.length} / ${data.rows.length} chỉ tiêu`;
  }

  if (filteredRows.length === 0) {
    const emptyTr = document.createElement('tr');
    emptyTr.innerHTML = `
      <td colspan="11" class="px-6 py-12 text-center text-[#818181]">
        <div class="flex flex-col items-center justify-center gap-2">
          <svg class="w-8 h-8 text-[#818181]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="font-semibold text-xs">Không tìm thấy chỉ tiêu nào phù hợp với bộ lọc</p>
          <button type="button" class="text-xs text-blue-600 underline font-bold mt-1" onclick="resetMetricFilters()">
            Đặt lại bộ lọc tìm kiếm
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(emptyTr);
    return;
  }

  filteredRows.forEach((row, idx) => {
    const tr = document.createElement('tr');

    // Highlight background theo loại dòng trọng yếu
    if (row.isTOI) {
      tr.className = 'bg-blue-50/50 font-bold hover:bg-blue-100/50 transition-colors text-[#051650] border-y border-blue-200/80';
    } else if (row.isPBT) {
      tr.className = 'bg-[#F8F3EC]/70 font-bold hover:bg-[#F8F3EC] transition-colors text-[#051650] border-y border-[#C8997D]/50';
    } else if (row.isNPAT) {
      tr.className = 'bg-emerald-50/50 font-bold hover:bg-emerald-100/60 transition-colors text-emerald-950 border-y border-emerald-300';
    } else {
      tr.className = idx % 2 === 1 ? 'bg-[#FAFAFA] hover:bg-[#F1F5F9]/60 transition-colors' : 'bg-white hover:bg-[#F1F5F9]/60 transition-colors';
    }

    const typeBadge = row.type === 'TÍNH'
      ? `<span class="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7F0FD] text-[#1971C2] border border-[#D0EBFF]">TÍNH</span>`
      : `<span class="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F1F3F5] text-[#495057] border border-[#DEE2E6]">FILL</span>`;

    const fxIcon = row.type === 'TÍNH'
      ? `<span class="inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[9.5px] font-bold font-mono bg-[#EBF3FC] text-[#228BE6] border border-[#D0EBFF]" title="Chỉ tiêu tính toán bằng công thức toán học">fx</span>`
      : '';

    let yearTds = '';
    row.values.forEach((val, i) => {
      const isLastYear = i === row.values.length - 1;
      const isNegative = val.startsWith('-') || val.includes('(');
      const isDash = val === '-';

      let textClass = 'text-[#212529]';
      if (isNegative) {
        textClass = 'text-[#FA5252] font-semibold';
      } else if (isDash) {
        textClass = 'text-[#818181] font-semibold';
      } else if (row.isTOI || row.isPBT || row.isNPAT) {
        textClass = 'text-[#051650] font-bold';
      }

      const lastColStyle = isLastYear ? 'border-l border-[#E9ECEF] bg-gray-50/70 font-semibold' : '';

      yearTds += `<td class="px-3.5 py-3 text-right font-mono text-[12px] ${textClass} ${lastColStyle}">${escapeHtml(val)}</td>`;
    });

    const safeFormula = escapeHtml(row.formula || 'Chỉ tiêu được ghi nhận trực tiếp từ Báo cáo tài chính kiểm toán (FILL)');

    tr.innerHTML = `
      <td class="px-3 py-3 text-center">
        <button type="button" 
                title="Xem chi tiết công thức toán học" 
                class="w-6 h-6 inline-flex items-center justify-center text-[#818181] hover:text-[#051650] hover:bg-[#F1F3F5] rounded transition-colors" 
                onclick="handleInspectFormula(${row.id}, '${escapeHtml(row.name)}', '${safeFormula}', '${row.type}')">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
      </td>
      <td class="px-3 py-3 text-center">${typeBadge}</td>
      <td class="px-3 py-3 text-center">
        <span class="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#EBF3FC] text-[#1C7ED6] border border-[#D0EBFF]">
          ${escapeHtml(currentFrame2Ticker)}
        </span>
      </td>
      <td class="px-4 py-3 font-medium text-[#212529]">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="${(row.isTOI || row.isPBT || row.isNPAT) ? 'font-bold text-[#051650]' : ''}">${escapeHtml(row.name)}</span>
          ${fxIcon}
        </div>
      </td>
      ${yearTds}
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Đặt lại tất cả bộ lọc tìm kiếm
 */
function resetMetricFilters() {
  currentMetricFilter = 'ALL';
  currentSearchKeyword = '';
  const input = document.getElementById('metricSearchInput');
  if (input) input.value = '';

  const filterButtonGroup = document.getElementById('filterButtonGroup');
  if (filterButtonGroup) {
    const filterBtns = filterButtonGroup.querySelectorAll('.metric-filter-btn');
    filterBtns.forEach(b => {
      b.className = 'metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium text-[#495057] bg-[#F1F3F5] hover:bg-[#E9ECEF] transition-all';
    });
    if (filterBtns[0]) {
      filterBtns[0].className = 'metric-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-[#051650] text-white shadow-xs';
    }
  }

  renderFinancialTableRows();
}

/**
 * Khởi tạo modal công thức
 */
function initFormulaModal() {
  const modal = document.getElementById('metricFormulaModal');
  const closeBtn1 = document.getElementById('closeFormulaModalBtn');
  const closeBtn2 = document.getElementById('closeFormulaModalBtn2');
  const copyBtn = document.getElementById('copyFormulaBtn');

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
  };

  if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const formulaEl = document.getElementById('modalMetricFormula');
      if (!formulaEl) return;
      navigator.clipboard.writeText(formulaEl.textContent).then(() => {
        copyBtn.innerHTML = `
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>Đã sao chép!</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            <span>Sao chép công thức</span>
          `;
        }, 2000);
      });
    });
  }
}

/**
 * Hiển thị chi tiết công thức toán học trong modal
 */
function handleInspectFormula(id, name, formula, type) {
  const modal = document.getElementById('metricFormulaModal');
  const nameEl = document.getElementById('modalMetricName');
  const formulaEl = document.getElementById('modalMetricFormula');

  if (nameEl) nameEl.textContent = `${name} (Mã chỉ tiêu: #${id} • Loại: ${type})`;
  if (formulaEl) formulaEl.textContent = formula;

  if (modal) modal.classList.remove('hidden');
}

/**
 * Xuất dữ liệu BCTC của mã ngân hàng hiện tại sang định dạng CSV
 */
function exportFinancialTableToCSV(ticker) {
  if (typeof getFinancialStatement !== 'function') return;

  const data = getFinancialStatement(ticker);
  const headers = ['STT', 'LOẠI', 'MÃ NH', 'CHỈ TIÊU TÀI CHÍNH', ...data.years, 'CÔNG THỨC'];

  const csvRows = [headers.join(',')];

  data.rows.forEach((row, idx) => {
    const cleanValues = row.values.map(v => `"${v.replace(/"/g, '""')}"`);
    const line = [
      idx + 1,
      `"${row.type}"`,
      `"${ticker}"`,
      `"${row.name.replace(/"/g, '""')}"`,
      ...cleanValues,
      `"${(row.formula || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(line.join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\n'); // Add BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `BCTC_${ticker}_2015_2021.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// FRAME 3: BÁO CÁO ĐỐI CHIẾU SO SÁNH ĐA CHIỀU (MULTI-STOCK COMPARISON FLOW)
// ============================================================================
let currentComparisonTickers = ['ACB', 'ABB', 'VCB'];

function initFrame3Flow() {
  console.log('[FLOW] Initializing Frame 3 Comparison Flow Engine');

  // Đọc danh sách tickers từ URL (?tickers=ACB,ABB hoặc mặc định)
  const urlParams = new URLSearchParams(window.location.search);
  const tickersQuery = urlParams.get('tickers');
  if (tickersQuery) {
    const list = tickersQuery.split(',').map(t => t.trim().toUpperCase()).filter(Boolean);
    if (list.length > 0) {
      currentComparisonTickers = list;
    }
  }

  // Khởi tạo các phần tử giao diện
  const addSelector = document.getElementById('addCompareSelector');
  const resetBtn = document.getElementById('resetCompareBtn');
  const toggleModeBtn = document.getElementById('toggleCompareModeBtn');
  const compareTableView = document.getElementById('compareTableView');
  const compareVisualView = document.getElementById('compareVisualView');
  const compareModeBtnText = document.getElementById('compareModeBtnText');

  if (addSelector) {
    addSelector.addEventListener('change', (e) => {
      const ticker = e.target.value;
      if (ticker && !currentComparisonTickers.includes(ticker)) {
        if (currentComparisonTickers.length >= 6) {
          alert('Tối đa so sánh 6 mã ngân hàng cùng lúc để đảm bảo độ rộng hiển thị tối ưu.');
        } else {
          currentComparisonTickers.push(ticker);
          updateComparisonState();
        }
      }
      addSelector.value = '';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentComparisonTickers = ['ACB', 'ABB', 'VCB'];
      updateComparisonState();
    });
  }

  if (toggleModeBtn && compareTableView && compareVisualView) {
    toggleModeBtn.addEventListener('click', () => {
      const isTableVisible = !compareTableView.classList.contains('hidden');
      if (isTableVisible) {
        compareTableView.classList.add('hidden');
        compareVisualView.classList.remove('hidden');
        if (compareModeBtnText) compareModeBtnText.textContent = 'Xem Bảng Ma Trận Đối Chiếu';
      } else {
        compareTableView.classList.remove('hidden');
        compareVisualView.classList.add('hidden');
        if (compareModeBtnText) compareModeBtnText.textContent = 'Xem Biểu Đồ So Sánh Trực Quan';
      }
    });
  }

  // Render lần đầu
  updateComparisonState();
}

/**
 * Cập nhật trạng thái và vẽ lại bảng ma trận so sánh
 */
function updateComparisonState() {
  // Cập nhật URL mà không reload trang
  const newUrl = `${window.location.pathname}?tickers=${encodeURIComponent(currentComparisonTickers.join(','))}`;
  window.history.replaceState({ tickers: currentComparisonTickers }, '', newUrl);

  renderActiveComparedChips();
  renderComparisonMatrixTable();
  renderVisualComparisonBars();
}

/**
 * Render dải chip các mã đang được chọn so sánh
 */
function renderActiveComparedChips() {
  const container = document.getElementById('activeComparedChips');
  const badge = document.getElementById('comparedCountBadge');
  if (!container) return;

  container.innerHTML = '';
  if (badge) {
    badge.textContent = `${currentComparisonTickers.length} mã`;
  }

  currentComparisonTickers.forEach(ticker => {
    const banksList = getBanksList(); const bank = banksList.find(b => b.ticker === ticker);
    const bankName = bank ? bank.name : ticker;

    const chip = document.createElement('div');
    chip.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#051650] text-white text-xs font-bold shadow-sm transition-transform hover:scale-105';
    chip.innerHTML = `
      <span>${escapeHtml(ticker)}</span>
      <span class="text-[10px] text-gray-300 font-normal hidden sm:inline truncate max-w-[120px]">${escapeHtml(bankName)}</span>
      <button type="button" class="ml-1 text-gray-300 hover:text-white text-sm font-bold leading-none p-0.5" title="Loại bỏ mã ${escapeHtml(ticker)}">&times;</button>
    `;

    chip.querySelector('button').addEventListener('click', () => {
      if (currentComparisonTickers.length <= 1) {
        alert('Cần giữ lại ít nhất 1 mã để so sánh.');
        return;
      }
      currentComparisonTickers = currentComparisonTickers.filter(t => t !== ticker);
      updateComparisonState();
    });

    container.appendChild(chip);
  });
}

/**
 * Render bảng ma trận đối chiếu chỉ tiêu tài chính
 */
function renderComparisonMatrixTable() {
  const thead = document.getElementById('comparisonTableHead');
  const tbody = document.getElementById('comparisonTableBody');
  if (!thead || !tbody) return;

  const banksList = getBanksList(); const banks = currentComparisonTickers.map(t => banksList.find(b => b.ticker === t)).filter(Boolean);

  // 1. Render Thead
  let thTickers = '';
  banks.forEach(bank => {
    thTickers += `
      <th scope="col" class="px-4 py-3 text-right font-bold min-w-[140px]">
        <div class="flex flex-col items-end">
          <span class="text-[13px] font-black text-[#051650]">${escapeHtml(bank.ticker)}</span>
          <span class="text-[10px] text-[#818181] font-normal truncate max-w-[150px]" title="${escapeHtml(bank.name)}">${escapeHtml(bank.name)}</span>
        </div>
      </th>
    `;
  });

  thead.innerHTML = `
    <tr>
      <th scope="col" class="col-sticky-stt px-2 py-3 text-center font-bold border-r border-b border-[#D7D7D7]/70">STT</th>
      <th scope="col" class="col-sticky-type px-3 py-3 text-left font-bold border-r border-b border-[#D7D7D7]/70">NHÓM</th>
      <th scope="col" class="col-sticky-name px-4 py-3 text-left font-bold border-r border-b border-[#D7D7D7]/70">CHỈ TIÊU TÀI CHÍNH</th>
      <th scope="col" class="col-sticky-unit px-2 py-3 text-center font-bold border-b border-[#D7D7D7]/70">ĐƠN VỊ</th>
      ${thTickers}
    </tr>
  `;

  // 2. Định nghĩa danh sách chỉ tiêu so sánh
  const METRIC_ROWS = [
    // Nhóm 1: HIỆU QUẢ HOẠT ĐỘNG
    { id: 1, group: 'HIỆU QUẢ HOẠT ĐỘNG', name: 'Biên lãi thuần (NIM)', unit: '%', key: 'nim', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 2, group: 'HIỆU QUẢ HOẠT ĐỘNG', name: 'Tỷ lệ chi phí / thu nhập (CIR)', unit: '%', key: 'cir', higherIsBetter: false, format: (v) => `${v.toFixed(2)}%` },
    { id: 3, group: 'HIỆU QUẢ HOẠT ĐỘNG', name: 'Biên lãi vận hành (trước DPRR)', unit: '%', key: 'blvh', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 4, group: 'HIỆU QUẢ HOẠT ĐỘNG', name: 'Biên lợi nhuận trước thuế', unit: '%', key: 'blntt', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 5, group: 'HIỆU QUẢ HOẠT ĐỘNG', name: 'Biên lợi nhuận sau thuế (BLNST)', unit: '%', key: 'blnst', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },

    // Nhóm 2: KHẢ NĂNG SINH LỜI
    { id: 6, group: 'KHẢ NĂNG SINH LỜI', name: 'Tỷ suất sinh lời trên Vốn CSH (ROE)', unit: '%', key: 'roe', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 7, group: 'KHẢ NĂNG SINH LỜI', name: 'Tỷ suất sinh lời trên Tổng Tài Sản (ROA)', unit: '%', key: 'roa', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 8, group: 'KHẢ NĂNG SINH LỜI', name: 'Tăng trưởng lãi ròng sau CĐTS', unit: '%', key: 'ttlr', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },

    // Nhóm 3: CHẤT LƯỢNG TÀI SẢN & AN TOÀN VỐN
    { id: 9, group: 'CHẤT LƯỢNG TÀI SẢN', name: 'Tỷ lệ tiền gửi không kỳ hạn (CASA)', unit: '%', key: 'casa', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 10, group: 'CHẤT LƯỢNG TÀI SẢN', name: 'Tỷ lệ nợ xấu (NPL)', unit: '%', key: 'npl', higherIsBetter: false, format: (v) => `${v.toFixed(2)}%` },
    { id: 11, group: 'CHẤT LƯỢNG TÀI SẢN', name: 'Tỷ lệ bao phủ nợ xấu (LLR Coverage)', unit: '%', key: 'llr', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 12, group: 'AN TOÀN VỐN & ĐÒN BẨY', name: 'Hệ số an toàn vốn (CAR)', unit: '%', key: 'car', higherIsBetter: true, format: (v) => `${v.toFixed(2)}%` },
    { id: 13, group: 'AN TOÀN VỐN & ĐÒN BẨY', name: 'Đòn bẩy tài chính (Debt/Equity)', unit: 'Lần', key: 'debt_equity', higherIsBetter: false, format: (v) => `${v.toFixed(2)}` },
    { id: 14, group: 'AN TOÀN VỐN & ĐÒN BẨY', name: 'Lưu chuyển tiền thuần HĐKD (CFO)', unit: 'Tỷ VND', key: 'cfo', higherIsBetter: true, format: (v) => `${v.toLocaleString('vi-VN')} Tỷ` }
  ];

  tbody.innerHTML = '';
  let currentGroup = '';

  METRIC_ROWS.forEach(metric => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-[#F8F3EC]/30 transition-colors group';

    // Tìm giá trị tốt nhất trong các ngân hàng
    let bestVal = null;
    banks.forEach(b => {
      const val = b[metric.key];
      if (val !== undefined) {
        if (bestVal === null) {
          bestVal = val;
        } else if (metric.higherIsBetter && val > bestVal) {
          bestVal = val;
        } else if (!metric.higherIsBetter && val < bestVal) {
          bestVal = val;
        }
      }
    });

    let bankTds = '';
    banks.forEach(b => {
      const val = b[metric.key];
      const isBest = val !== undefined && val === bestVal;
      const displayVal = val !== undefined ? metric.format(val) : '—';

      const bestBadge = isBest ? `<span class="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300 text-xs shadow-xs">${displayVal}</span>` : `<span class="font-medium text-[#051650]">${displayVal}</span>`;

      bankTds += `
        <td class="px-4 py-2.5 text-right font-mono border-l border-b border-[#D7D7D7]/40">
          ${bestBadge}
        </td>
      `;
    });

    const isFirstInGroup = metric.group !== currentGroup;
    currentGroup = metric.group;

    tr.innerHTML = `
      <td class="col-sticky-stt px-2 py-2.5 text-center text-[#818181] font-semibold border-r border-b border-[#D7D7D7]/50">${metric.id}</td>
      <td class="col-sticky-type px-3 py-2.5 font-bold text-[11px] text-[#051650] tracking-wide border-r border-b border-[#D7D7D7]/50">
        ${isFirstInGroup ? `<span class="px-2 py-0.5 rounded bg-gray-100 text-[#051650] uppercase text-[10px] font-extrabold">${escapeHtml(metric.group)}</span>` : ''}
      </td>
      <td class="col-sticky-name px-4 py-2.5 font-medium text-[#051650] border-r border-b border-[#D7D7D7]/50">
        ${escapeHtml(metric.name)}
      </td>
      <td class="col-sticky-unit px-2 py-2.5 text-center text-[#818181] text-[11px] font-mono border-b border-[#D7D7D7]/50">
        ${escapeHtml(metric.unit)}
      </td>
      ${bankTds}
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Render thanh so sánh trực quan cho 4 chỉ số cốt lõi
 */
function renderVisualComparisonBars() {
  const banksList = getBanksList(); const banks = currentComparisonTickers.map(t => banksList.find(b => b.ticker === t)).filter(Boolean);

  function renderMetricBars(containerId, key, formatFn, maxVal) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    banks.forEach(b => {
      const val = b[key] || 0;
      const pct = Math.min(100, Math.max(8, (val / maxVal) * 100));

      const row = document.createElement('div');
      row.className = 'space-y-1';
      row.innerHTML = `
        <div class="flex items-center justify-between text-xs font-semibold">
          <span class="text-[#051650] flex items-center gap-1.5 font-bold">
            <span class="px-1.5 py-0.5 rounded bg-[#051650] text-white text-[10px]">${escapeHtml(b.ticker)}</span>
            <span>${escapeHtml(b.name)}</span>
          </span>
          <span class="font-mono text-[#051650] font-bold">${formatFn(val)}</span>
        </div>
        <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
          <div class="h-full rounded-full bg-gradient-to-r from-[#C8997D] to-[#051650] transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  renderMetricBars('visualBarRoe', 'roe', (v) => `${v.toFixed(2)}%`, 30);
  renderMetricBars('visualBarNim', 'nim', (v) => `${v.toFixed(2)}%`, 6);
  renderMetricBars('visualBarCasa', 'casa', (v) => `${v.toFixed(2)}%`, 45);
  renderMetricBars('visualBarNpl', 'npl', (v) => `${v.toFixed(2)}%`, 3.5);
}
