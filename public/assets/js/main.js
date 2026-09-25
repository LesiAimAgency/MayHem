/**
 * MAYHEM FINANCIAL ANALYTICS - CLIENT-SIDE INTERACTIVITY
 * Complies with .antigravity/rules/security_rules.md:
 * - Security Mandate 3: Universal Output Encoding (escapeHtml)
 * - Strict Input Validation
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

document.addEventListener('DOMContentLoaded', () => {
  initStockChips();
  initComparisonDrawer();
  initFilterControls();
  initTableInteractions();
});

/**
 * 1. Stock Chip Selectors (Mã Cổ Phiếu)
 */
function initStockChips() {
  const chips = document.querySelectorAll('[data-stock-chip]');
  if (chips.length === 0) return;

  // Stock search input filtering (Chip toggle interaction is managed by flow-engine.js)
  const stockSearchInput = document.getElementById('stockSearchInput');
  if (stockSearchInput) {
    stockSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toUpperCase();
      chips.forEach(chip => {
        const code = chip.getAttribute('data-stock-chip');
        if (!query || code.includes(query)) {
          chip.classList.remove('hidden');
        } else {
          chip.classList.add('hidden');
        }
      });
    });
  }
}

/**
 * 2. Comparison Drawer & Action Button
 */
function initComparisonDrawer() {
  const compareCheckboxes = document.querySelectorAll('[data-compare-checkbox]');
  const comparisonListContainer = document.getElementById('comparisonListContainer');
  const applyBtn = document.getElementById('applyComparisonBtn');

  compareCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const stockCode = cb.getAttribute('data-compare-checkbox');
      const companyName = cb.getAttribute('data-company-name') || stockCode;
      
      if (cb.checked) {
        addStockToComparison(stockCode, companyName);
      } else {
        removeStockFromComparison(stockCode);
      }
    });
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const count = document.querySelectorAll('#comparisonListContainer [data-compared-stock]').length;
      alert(`Đã áp dụng so sánh cho ${count} mã cổ phiếu được chọn!`);
    });
  }
}

function addStockToComparison(stockCode, companyName) {
  const container = document.getElementById('comparisonListContainer');
  if (!container) return;

  // Check if exists
  if (container.querySelector(`[data-compared-stock="${stockCode}"]`)) return;

  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-2 rounded-lg bg-white border border-[#D7D7D7] card-hover';
  item.setAttribute('data-compared-stock', escapeHtml(stockCode));
  item.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 rounded bg-[#F8F3EC] text-[#051650] text-xs font-bold">${escapeHtml(stockCode)}</span>
      <span class="text-xs text-[#323232] truncate max-w-[130px]">${escapeHtml(companyName)}</span>
    </div>
    <button type="button" class="text-xs text-[#818181] hover:text-[#FE0000] p-1 transition-colors" onclick="removeComparedStock('${escapeHtml(stockCode)}')">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  `;
  container.appendChild(item);
  updateComparisonCount();
}

function removeStockFromComparison(stockCode) {
  const container = document.getElementById('comparisonListContainer');
  if (!container) return;

  const item = container.querySelector(`[data-compared-stock="${stockCode}"]`);
  if (item) item.remove();

  // Uncheck corresponding table checkbox
  const cb = document.querySelector(`[data-compare-checkbox="${stockCode}"]`);
  if (cb) cb.checked = false;

  updateComparisonCount();
}

window.removeComparedStock = function(stockCode) {
  removeStockFromComparison(stockCode);
};

function updateComparisonCount() {
  const countBadge = document.getElementById('comparisonCountBadge');
  const items = document.querySelectorAll('#comparisonListContainer [data-compared-stock]');
  if (countBadge) {
    countBadge.textContent = items.length;
  }
}

/**
 * 3. Filter Controls & Criteria Grid
 */
function initFilterControls() {
  const industryCheckboxes = document.querySelectorAll('[data-industry-checkbox]');
  industryCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateFilterSummary);
  });

  // Toggle detail results button
  const toggleDetailsBtn = document.getElementById('toggleDetailsBtn');
  const detailsPanel = document.getElementById('detailsPanel');
  if (toggleDetailsBtn && detailsPanel) {
    toggleDetailsBtn.addEventListener('click', () => {
      const isHidden = detailsPanel.classList.contains('hidden');
      if (isHidden) {
        detailsPanel.classList.remove('hidden');
        toggleDetailsBtn.innerHTML = `ẨN CHI TIẾT <svg class="w-4 h-4 ml-1 inline rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
      } else {
        detailsPanel.classList.add('hidden');
        toggleDetailsBtn.innerHTML = `XEM CHI TIẾT <svg class="w-4 h-4 ml-1 inline transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
      }
    });
  }
}

function updateFilterSummary() {
  const selectedIndustries = document.querySelectorAll('[data-industry-checkbox]:checked').length;
  const selectedStocks = document.querySelectorAll('[data-stock-chip].bg-\\[\\#F8F3EC\\]').length;
  const summaryEl = document.getElementById('filterCountSummary');
  if (summaryEl) {
    // Simulated dynamic match
    let matchCount = 3;
    if (selectedIndustries > 0 || selectedStocks > 0) {
      matchCount = Math.max(1, (selectedIndustries * 2 + selectedStocks) % 15 || 3);
    }
    summaryEl.textContent = `Có 0${matchCount} mã cổ phiếu thoả điều kiện`;
  }
}

/**
 * 4. Table Interactions & Edit Actions
 */
function initTableInteractions() {
  // Row hover highlights and edit buttons
  const editButtons = document.querySelectorAll('[data-edit-row]');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rowId = btn.getAttribute('data-edit-row');
      alert(`Mở hộp thoại chỉnh sửa cho chỉ tiêu hàng #${rowId}`);
    });
  });
}
