/**
 * assets/js/components/industry-admin-modal.js
 * Database-driven Industry Filter Configurations Management Modal
 * Allows Super Admin and Editors to:
 * - View default tickers of each industry (read-only reference)
 * - Select and configure the 32 standardized benchmark criteria with interactive Operator buttons (<, <=, =, >=, >, < TB, > TB), time scope & numeric benchmark thresholds
 * - Save criteria and field definitions directly into MySQL database (filter_criteria & filter_industry_configs)
 * - Reset configurations to system defaults
 * Rule: Zero mock data. Zero emoji. Clean SVGs only.
 */

import { ICONS, showToast, escapeHtml } from '../core/helpers.js';
import { auth, ROLE_SUPERADMIN } from '../core/auth.js';
import { BENCHMARK_CRITERIA_CATALOG, notifyCriteriaUpdated, fetchCriteriaFromBackend } from './custom-filter-builder.js';

export function renderIndustryAdminModal(container, options = {}) {
  const {
    industryConfigs = {},
    currentIndustry = 'NGAN_HANG',
    onIndustrySaved = () => {},
    onResetDefaults = () => {}
  } = options;

  let selectedIndId = currentIndustry;
  if (!industryConfigs[selectedIndId]) {
    selectedIndId = Object.keys(industryConfigs)[0] || 'NGAN_HANG';
  }

  const isSuper = auth.isLoggedIn() && (auth.getCurrentRole() === ROLE_SUPERADMIN || auth.canManageUsers());

  // In-memory working state
  let currentTickers = [];
  let currentQuickTickers = [];
  let currentFields = [];
  let currentCriteria = [];
  let activeOp = '>=';
  let editingCriterionId = null;

  container.innerHTML = `
    <div id="industryAdminModalBackdrop" class="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn" style="z-index: 99999;">
      <div class="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800" style="z-index: 100000;">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/95 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-base font-bold text-slate-900">Quản Trị Tiêu Chí Tài Chính & Bộ Lọc (Database MySQL)</h2>
                <span class="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Database-Driven
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Thiết lập điều kiện lọc số liệu (&lt;, &le;, =, &ge;, &gt;, &lt; TB, &gt; TB) cho danh mục tiêu chí tài chính lưu trên máy chủ</p>
            </div>
          </div>
          <button id="btnCloseIndustryModal" type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition text-sm font-semibold">
            ✕ Đóng
          </button>
        </div>

        <!-- Body Content -->
        <div class="p-6 overflow-y-auto flex flex-col gap-5 flex-1">
          
          <!-- Industry Selector Bar -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Chọn nhóm ngành cần cấu hình:</label>
              <select id="selEditIndustryTarget" class="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-bold outline-none focus:border-indigo-500 shadow-2xs">
                ${Object.values(industryConfigs).map(ind => `
                  <option value="${ind.id}" ${ind.id === selectedIndId ? 'selected' : ''}>${escapeHtml(ind.name)} (${(ind.tickers || []).length} mã)</option>
                `).join('')}
              </select>
            </div>

            <div class="flex items-center gap-2">
              <span id="badgeCurrentSummary" class="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                0 tiêu chí • 0 mã cổ phiếu
              </span>
              ${isSuper ? `
                <button id="btnResetIndustryDefaults" type="button" class="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition" title="Khôi phục danh mục tiêu chí chuẩn hóa về mặc định 32 tiêu chí hệ thống">
                  Đặt lại mặc định
                </button>
              ` : ''}
            </div>
          </div>

          <!-- ======================================================= -->
          <!-- SECTION 1: DEFAULT TICKERS (READ-ONLY DISPLAY) -->
          <!-- ======================================================= -->
          <div class="p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col gap-2.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Danh Sách Mã Cổ Phiếu Mặc Định Của Ngành
                </h3>
                <span id="lblCountEditTickers" class="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  0 mã
                </span>
              </div>
              <span class="text-[11px] text-slate-500">Mã có viền vàng là mã chọn nhanh mặc định trên thanh lọc</span>
            </div>

            <!-- Tickers Badges Grid -->
            <div id="containerTickerChips" class="flex flex-wrap gap-1.5 p-2.5 bg-white rounded-xl border border-slate-200 min-h-[50px] max-h-[110px] overflow-y-auto">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- ======================================================= -->
          <!-- SECTION 2: STANDARDIZED BENCHMARK CRITERIA (32 TIÊU CHÍ) -->
          <!-- (Nhóm Danh Mục Bỏ Luôn Theo Yêu Cầu) -->
          <!-- ======================================================= -->
          <div class="p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col gap-3.5">
            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Danh Mục Tiêu Chí Tài Chính Chuẩn Hóa Của Ngành
                </h3>
                <span id="lblCountEditCriteria" class="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  0 tiêu chí
                </span>
              </div>
              <span class="text-[11px] text-slate-500">Chọn chỉ tiêu, toán tử (&lt;, &le;, =, &ge;, &gt;, &lt; TB, &gt; TB), chu kỳ &amp; số liệu rồi bấm "+ Lưu"</span>
            </div>

            <!-- Action Bar: 1. Field Dropdown + 2. Operator Buttons + 3. Time Scope + 4. Value + Save -->
            <div class="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs flex flex-col gap-3">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end text-xs">
                
                <!-- 1. Select Financial Field (Cols 5) -->
                <div class="md:col-span-5 flex flex-col gap-1">
                  <label class="font-semibold text-slate-700">1. Chọn Chỉ Tiêu Tài Chính</label>
                  <select id="selFinancialField" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-medium text-xs">
                    <!-- Populated dynamically -->
                  </select>
                  <!-- Custom field input (hidden by default, shown if adding custom) -->
                  <input type="text" id="inpCustomFieldName" placeholder="Nhập tên chỉ tiêu tài chính mới..." class="hidden w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-medium mt-1 text-xs" />
                </div>

                <!-- 2. Operator Buttons (<, <=, =, >=, >, < TB, > TB) (Cols 3) -->
                <div class="md:col-span-3 flex flex-col gap-1">
                  <label class="font-semibold text-slate-700">2. Toán Tử So Sánh</label>
                  <div class="flex items-center gap-0.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition text-slate-600 hover:bg-white" data-op="<">&lt;</button>
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition text-slate-600 hover:bg-white" data-op="<=">&le;</button>
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition text-slate-600 hover:bg-white" data-op="=">=</button>
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition bg-indigo-600 text-white shadow-2xs" data-op=">=">&ge;</button>
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition text-slate-600 hover:bg-white" data-op=">">&gt;</button>
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[10px] font-bold transition text-slate-600 hover:bg-white" data-op="< TB" title="Dưới trung bình ngành">&lt;TB</button>
                    <button type="button" class="btn-op-select flex-1 py-1 rounded text-[10px] font-bold transition text-slate-600 hover:bg-white" data-op="> TB" title="Cao hơn trung bình ngành">&gt;TB</button>
                  </div>
                </div>

                <!-- 3. Time Scope (Cols 2) -->
                <div class="md:col-span-2 flex flex-col gap-1">
                  <label class="font-semibold text-slate-700">3. Chu Kỳ</label>
                  <select id="selTimeScope" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-medium text-xs">
                    <option value="latest">Năm gần nhất</option>
                    <option value="10y_consecutive">10 năm liên tiếp</option>
                    <option value="3y_consecutive">3 năm liên tiếp</option>
                    <option value="5y_consecutive">5 năm liên tiếp</option>
                  </select>
                </div>

                <!-- 4. Threshold Number & Add / Update Button (Cols 2) -->
                <div class="md:col-span-2 flex items-center gap-1.5">
                  <div class="flex-1 flex flex-col gap-1">
                    <label class="font-semibold text-slate-700">4. Số Liệu</label>
                    <input type="text" id="inpFieldVal" placeholder="60%, 15%..." class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:bg-white focus:border-indigo-500 font-mono font-bold text-xs" />
                  </div>
                  <div class="flex flex-col gap-1 self-end">
                    <button type="button" id="btnAddFieldCondition" class="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs active:scale-95 transition flex-shrink-0" title="Thêm hoặc cập nhật tiêu chí">
                      + Lưu
                    </button>
                    <button type="button" id="btnCancelEditCrit" class="hidden px-2 py-0.5 rounded text-[10px] text-slate-500 hover:text-slate-700 hover:underline text-center">
                      Hủy
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Table of configured criteria (3 Clean Columns, NO CATEGORY COLUMN) -->
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span class="w-6/12">Tiêu Chí Tài Chính Của Ngành</span>
                <span class="w-4/12 text-center">Toán Tử, Ngưỡng & Chu Kỳ</span>
                <span class="w-2/12 text-right">Thao Tác</span>
              </div>

              <div id="containerCriteriaList" class="max-h-[300px] overflow-y-auto divide-y divide-slate-100 text-xs">
                <!-- Rendered dynamically -->
              </div>
            </div>

          </div>

          <!-- Footer Action Buttons -->
          <div class="flex items-center justify-end pt-3 border-t border-slate-200 mt-2 gap-2.5">
            <button type="button" id="btnCancelEditInd" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs">
              Đóng
            </button>
            <button type="button" id="btnSaveIndustryAll" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>Lưu Toàn Bộ Vào Database (PUT)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `;

  // Attach Elements
  const backdrop = container.querySelector('#industryAdminModalBackdrop');
  const btnClose = container.querySelector('#btnCloseIndustryModal');
  const btnCancelEdit = container.querySelector('#btnCancelEditInd');
  const selEditTarget = container.querySelector('#selEditIndustryTarget');
  const badgeCurrentSummary = container.querySelector('#badgeCurrentSummary');
  const lblCountEditTickers = container.querySelector('#lblCountEditTickers');
  const lblCountEditCriteria = container.querySelector('#lblCountEditCriteria');
  const btnResetDefaults = container.querySelector('#btnResetIndustryDefaults');
  const btnSaveIndustryAll = container.querySelector('#btnSaveIndustryAll');

  const containerTickerChips = container.querySelector('#containerTickerChips');
  const selFinancialField = container.querySelector('#selFinancialField');
  const inpCustomFieldName = container.querySelector('#inpCustomFieldName');
  const selTimeScope = container.querySelector('#selTimeScope');
  const inpFieldVal = container.querySelector('#inpFieldVal');
  const btnAddFieldCondition = container.querySelector('#btnAddFieldCondition');
  const btnCancelEditCrit = container.querySelector('#btnCancelEditCrit');
  const containerCriteriaList = container.querySelector('#containerCriteriaList');
  const btnOps = container.querySelectorAll('.btn-op-select');

  // Render Tickers (Read-only reference)
  const renderTickerChips = () => {
    lblCountEditTickers.textContent = `${currentTickers.length} mã (${currentQuickTickers.length} mã chọn nhanh)`;
    if (badgeCurrentSummary) {
      badgeCurrentSummary.textContent = `${currentCriteria.length} tiêu chí • ${currentTickers.length} mã cổ phiếu`;
    }

    if (currentTickers.length === 0) {
      containerTickerChips.innerHTML = `
        <div class="text-xs text-slate-400 py-2 w-full text-center">
          Chưa có mã cổ phiếu nào cho ngành này.
        </div>
      `;
      return;
    }

    containerTickerChips.innerHTML = currentTickers.map(ticker => {
      const isQuick = currentQuickTickers.includes(ticker);
      return `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          isQuick 
            ? 'bg-amber-50 text-amber-900 border border-amber-300' 
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }">
          ${isQuick ? `<span class="text-amber-500 font-bold" title="Mã chọn nhanh">★</span>` : ''}
          <span>${escapeHtml(ticker)}</span>
        </span>
      `;
    }).join('');
  };

  // Populate Field Select Dropdown
  const populateFieldSelect = () => {
    const criteriaFields = [...new Set(currentCriteria.map(c => c.field).filter(Boolean))];
    const otherFields = currentFields.filter(f => !criteriaFields.includes(f));

    let optionsHtml = '';
    if (criteriaFields.length > 0) {
      optionsHtml += `<optgroup label="Chỉ tiêu đang có tiêu chí (${criteriaFields.length})">`;
      optionsHtml += criteriaFields.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('');
      optionsHtml += `</optgroup>`;
    }
    if (otherFields.length > 0) {
      optionsHtml += `<optgroup label="Chỉ tiêu báo cáo khác (${otherFields.length})">`;
      optionsHtml += otherFields.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('');
      optionsHtml += `</optgroup>`;
    }

    selFinancialField.innerHTML = `
      ${optionsHtml}
      <option value="__NEW_CUSTOM_FIELD__">+ Nhập chỉ tiêu tài chính mới...</option>
    `;
    inpCustomFieldName.classList.add('hidden');
    inpCustomFieldName.value = '';
  };

  selFinancialField.addEventListener('change', () => {
    if (selFinancialField.value === '__NEW_CUSTOM_FIELD__') {
      inpCustomFieldName.classList.remove('hidden');
      inpCustomFieldName.focus();
    } else {
      inpCustomFieldName.classList.add('hidden');
      if (!editingCriterionId) {
        const crit = currentCriteria.find(c => c.field === selFinancialField.value);
        if (crit) {
          const mode = crit.mode || 'threshold';
          if (mode === 'industry_avg_lower') activeOp = '< TB';
          else if (mode === 'industry_avg_higher') activeOp = '> TB';
          else activeOp = crit.operator || '>=';
          updateOpButtons();
          selTimeScope.value = crit.time_scope || crit.timeScope || 'latest';
          inpFieldVal.value = crit.display_value || (crit.value !== null && crit.value !== undefined ? String(crit.value) : '');
        } else {
          inpFieldVal.value = '';
        }
      }
    }
  });

  // Cancel editing mode
  const cancelEditCriterion = () => {
    editingCriterionId = null;
    btnAddFieldCondition.innerHTML = '+ Lưu';
    btnAddFieldCondition.className = 'px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs active:scale-95 transition flex-shrink-0';
    btnCancelEditCrit.classList.add('hidden');
    inpFieldVal.value = '';
    renderCriteriaTable();
  };

  btnCancelEditCrit.addEventListener('click', cancelEditCriterion);

  // Render Criteria Table (Grouped by 15 Financial Parameters / Thông Số Cần Xét)
  const renderCriteriaTable = () => {
    const fieldMap = new Map();
    currentCriteria.forEach(c => {
      const f = c.field || c.name;
      if (!fieldMap.has(f)) fieldMap.set(f, []);
      fieldMap.get(f).push(c);
    });

    const uniqueFieldCount = fieldMap.size;
    lblCountEditCriteria.textContent = `${uniqueFieldCount} thông số • ${currentCriteria.length} điều kiện`;
    if (badgeCurrentSummary) {
      badgeCurrentSummary.textContent = `${uniqueFieldCount} thông số • ${currentCriteria.length} điều kiện • ${currentTickers.length} mã cổ phiếu`;
    }

    populateFieldSelect();

    if (currentCriteria.length === 0) {
      containerCriteriaList.innerHTML = `
        <div class="p-8 text-center text-xs text-slate-400">
          Chưa có tiêu chí sàng lọc nào trong danh mục ngành. Hãy chọn chỉ tiêu bên trên và bấm "+ Lưu".
        </div>
      `;
      return;
    }

    containerCriteriaList.innerHTML = Array.from(fieldMap.entries()).map(([fieldName, fieldCrits], fIdx) => {
      return `
        <div class="p-3 bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-200 last:border-b-0 flex flex-col gap-2">
          <!-- Parameter Group Header -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold font-mono flex items-center justify-center flex-shrink-0">${fIdx + 1}</span>
              <span class="font-bold text-xs text-slate-900 truncate" title="${escapeHtml(fieldName)}">${escapeHtml(fieldName)}</span>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                ${fieldCrits.length} điều kiện
              </span>
              <button type="button" class="btn-quick-add-cond text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline font-medium" data-field="${escapeHtml(fieldName)}">
                + Thêm ĐK
              </button>
            </div>
          </div>

          <!-- Conditions List under this Parameter -->
          <div class="flex flex-col gap-1.5 pl-7">
            ${fieldCrits.map(crit => {
              const mode = crit.mode || 'threshold';
              let opDisplay = crit.operator || '>=';
              let valDisplay = crit.display_value || crit.displayValue || (crit.value !== null && crit.value !== undefined ? String(crit.value) : '-');

              if (mode === 'industry_avg_lower') {
                opDisplay = '< TB';
                if (!valDisplay || valDisplay === '-') valDisplay = 'TB Ngành';
              } else if (mode === 'industry_avg_higher') {
                opDisplay = '> TB';
                if (!valDisplay || valDisplay === '-') valDisplay = 'TB Ngành';
              } else if (mode === 'compare_fields') {
                opDisplay = crit.operator || '>';
                const compField = crit.compare_with_field || crit.compareWithField;
                if (compField) {
                  valDisplay = '> ' + compField;
                }
              }

              const timeScope = crit.time_scope || crit.timeScope || 'latest';
              const is10y = timeScope === '10y_consecutive';
              const scopeLabel = is10y ? '10 năm' : 'Gần nhất';

              let opBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              if (opDisplay === '< TB' || opDisplay === '<' || opDisplay === '<=') {
                opBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              } else if (opDisplay === '> TB' || opDisplay === '>' || opDisplay === '>=') {
                opBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              }

              const scopeBadgeColor = is10y 
                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200';

              const isEditingThis = editingCriterionId === crit.id;

              return `
                <div class="p-2 rounded-lg bg-white border ${isEditingThis ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs' : 'border-slate-200'} flex items-center justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-slate-700 truncate" title="${escapeHtml(crit.name)}">${escapeHtml(crit.name)}</p>
                  </div>
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${opBadgeColor}">${escapeHtml(opDisplay)}</span>
                    <span class="font-mono font-bold text-slate-800 text-xs">${escapeHtml(valDisplay)}</span>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold border ${scopeBadgeColor}">${escapeHtml(scopeLabel)}</span>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button type="button" class="btn-edit-crit px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-medium text-xs transition" data-id="${escapeHtml(crit.id)}">
                      Sửa
                    </button>
                    <button type="button" class="btn-remove-crit text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded p-1 transition" data-id="${escapeHtml(crit.id)}" title="Xóa điều kiện này">
                      ✕
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Quick add condition to field button
    containerCriteriaList.querySelectorAll('.btn-quick-add-cond').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = btn.dataset.field;
        selFinancialField.value = f;
        inpCustomFieldName.classList.add('hidden');
        inpFieldVal.value = '';
        inpFieldVal.focus();
      });
    });

    // Attach listeners for Edit and Remove
    containerCriteriaList.querySelectorAll('.btn-edit-crit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const crit = currentCriteria.find(c => c.id === id);
        if (!crit) return;

        editingCriterionId = crit.id;
        selFinancialField.value = crit.field || '';
        inpCustomFieldName.classList.add('hidden');
        selTimeScope.value = crit.time_scope || crit.timeScope || 'latest';

        const mode = crit.mode || 'threshold';
        if (mode === 'industry_avg_lower') {
          activeOp = '< TB';
        } else if (mode === 'industry_avg_higher') {
          activeOp = '> TB';
        } else {
          activeOp = crit.operator || '>=';
        }
        updateOpButtons();

        inpFieldVal.value = crit.display_value || crit.displayValue || (crit.value !== null && crit.value !== undefined ? String(crit.value) : '');

        btnAddFieldCondition.innerHTML = `
          <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>Cập Nhật</span>
        `;
        btnAddFieldCondition.className = 'px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs active:scale-95 transition flex-shrink-0';
        btnCancelEditCrit.classList.remove('hidden');

        renderCriteriaTable();
        inpFieldVal.focus();
      });
    });

    containerCriteriaList.querySelectorAll('.btn-remove-crit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const crit = currentCriteria.find(c => c.id === id);
        currentCriteria = currentCriteria.filter(c => c.id !== id);
        if (editingCriterionId === id) {
          cancelEditCriterion();
        }
        renderCriteriaTable();
        showToast(`Đã xóa tiêu chí "${crit ? crit.name : id}" khỏi danh mục. Nhớ bấm "Lưu Toàn Bộ Vào Database".`, 'info');
      });
    });
  };

  // Update Operator Buttons active visual state
  const updateOpButtons = () => {
    btnOps.forEach(btn => {
      const op = btn.dataset.op;
      if (op === activeOp) {
        btn.className = 'btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition bg-indigo-600 text-white shadow-2xs';
      } else {
        btn.className = 'btn-op-select flex-1 py-1 rounded text-[11px] font-bold transition text-slate-600 hover:bg-white';
      }
    });
  };

  btnOps.forEach(btn => {
    btn.addEventListener('click', () => {
      activeOp = btn.dataset.op;
      updateOpButtons();
      if (activeOp === '< TB') {
        inpFieldVal.placeholder = '< TB Ngành';
        if (!inpFieldVal.value) inpFieldVal.value = '< TB Ngành';
      } else if (activeOp === '> TB') {
        inpFieldVal.placeholder = '> TB Ngành';
        if (!inpFieldVal.value) inpFieldVal.value = '> TB Ngành';
      } else {
        inpFieldVal.placeholder = '60%, 15%...';
        if (inpFieldVal.value.includes('TB Ngành')) inpFieldVal.value = '';
      }
    });
  });

  // Populate data when selecting target industry
  const populateEditForm = async (indId) => {
    const cfg = industryConfigs[indId];
    if (!cfg) return;

    selectedIndId = indId;
    currentTickers = [...(cfg.tickers || [])];
    currentQuickTickers = [...(cfg.quickTickers || [])];
    currentFields = [...(cfg.fields || [])];

    // Fetch criteria from backend or use existing catalog
    currentCriteria = [];
    try {
      const res = await fetch(`/api/v1/screener/criteria?industry=${encodeURIComponent(indId)}`, {
        headers: { 'Accept': 'application/json', ...auth.getAuthHeaders() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.data)) {
          currentCriteria = json.data;
        }
      }
    } catch (e) {
      currentCriteria = BENCHMARK_CRITERIA_CATALOG.filter(c => c.industry === indId || c.industry === 'ALL');
    }

    renderTickerChips();
    renderCriteriaTable();
  };

  populateEditForm(selectedIndId);

  // Switch Target Industry
  selEditTarget.addEventListener('change', (e) => {
    populateEditForm(e.target.value);
  });

  // Add / Update Criterion
  btnAddFieldCondition.addEventListener('click', () => {
    let field = selFinancialField.value.trim();
    if (field === '__NEW_CUSTOM_FIELD__') {
      field = inpCustomFieldName.value.trim();
    }

    if (!field) {
      showToast('Vui lòng chọn hoặc nhập tên chỉ tiêu tài chính.', 'error');
      if (selFinancialField.value === '__NEW_CUSTOM_FIELD__') {
        inpCustomFieldName.focus();
      } else {
        selFinancialField.focus();
      }
      return;
    }

    const op = activeOp;
    const timeScope = selTimeScope.value;
    const valRaw = inpFieldVal.value.trim();
    const numVal = parseFloat(valRaw.replace(/[^0-9.-]/g, ''));

    let mode = 'threshold';
    let operator = op;
    let value = !isNaN(numVal) ? numVal : null;
    let displayValue = valRaw;

    if (op === '< TB') {
      mode = 'industry_avg_lower';
      operator = null;
      value = null;
      displayValue = valRaw || (timeScope === '10y_consecutive' ? '< TB Ngành (10 năm)' : '< TB Ngành');
    } else if (op === '> TB') {
      mode = 'industry_avg_higher';
      operator = null;
      value = null;
      displayValue = valRaw || (timeScope === '10y_consecutive' ? '> TB Ngành (10 năm)' : '> TB Ngành');
    }

    // 1. Add to fields array if not present
    if (!currentFields.includes(field)) {
      currentFields.push(field);
    }

    const scopeText = timeScope === '10y_consecutive' ? 'liên tiếp 10 năm' : 'ở năm gần nhất';
    let generatedName = `${field} ${op} ${displayValue || '0'} ${scopeText}`;
    if (op === '< TB') {
      generatedName = `${field} dưới trung bình ngành ${scopeText}`;
    } else if (op === '> TB') {
      generatedName = `${field} cao hơn trung bình ngành ${scopeText}`;
    }

    if (editingCriterionId) {
      const idx = currentCriteria.findIndex(c => c.id === editingCriterionId);
      if (idx >= 0) {
        currentCriteria[idx] = {
          ...currentCriteria[idx],
          name: generatedName,
          field: field,
          mode: mode,
          operator: operator,
          value: value,
          display_value: displayValue,
          displayValue: displayValue,
          time_scope: timeScope,
          timeScope: timeScope,
          is_custom: true
        };
        showToast(`Đã cập nhật tiêu chí: ${generatedName}.`, 'success');
      }
      cancelEditCriterion();
    } else {
      const newCrit = {
        id: `crit_${selectedIndId.toLowerCase()}_${Date.now()}`,
        name: generatedName,
        field: field,
        category: 'Chỉ tiêu tài chính',
        industry: selectedIndId,
        mode: mode,
        operator: operator,
        value: value,
        display_value: displayValue,
        displayValue: displayValue,
        time_scope: timeScope,
        timeScope: timeScope,
        is_custom: true,
        sort_order: currentCriteria.length + 1
      };
      currentCriteria.push(newCrit);
      showToast(`Đã thêm tiêu chí: ${generatedName}. Nhớ bấm "Lưu Toàn Bộ Vào Database".`, 'success');
      inpFieldVal.value = '';
    }

    renderCriteriaTable();
  });

  // Close handlers
  const closeModal = () => { container.innerHTML = ''; };
  btnClose.addEventListener('click', closeModal);
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Submit Save All to Database (PUT)
  btnSaveIndustryAll.addEventListener('click', async () => {
    if (currentCriteria.length === 0) {
      showToast('Vui lòng có ít nhất 1 tiêu chí tài chính trong danh mục ngành.', 'error');
      return;
    }

    const cfg = industryConfigs[selectedIndId] || {};
    const payload = {
      name: cfg.name || `Ngành: ${selectedIndId}`,
      short_name: cfg.shortName || selectedIndId,
      code_prefix: cfg.codePrefix || selectedIndId,
      item_label: cfg.itemLabel || 'Doanh nghiệp',
      tickers: currentTickers,
      quick_tickers: currentQuickTickers,
      fields: currentFields,
      criteria: currentCriteria
    };

    btnSaveIndustryAll.disabled = true;
    btnSaveIndustryAll.innerHTML = `
      <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      <span>Đang lưu vào Database...</span>
    `;

    try {
      const res = await fetch(`/api/v1/screener/industries/${encodeURIComponent(selectedIndId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...auth.getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(`Đã lưu cấu hình ngành "${payload.name}" và ${currentCriteria.length} tiêu chí vào Database thành công!`, 'success');
        
        // Synchronize criteria catalog in memory
        try {
          await fetchCriteriaFromBackend(selectedIndId);
          notifyCriteriaUpdated();
        } catch (e) {}

        closeModal();
        onIndustrySaved(selectedIndId, json.data);
      } else {
        showToast(json.message || 'Không thể lưu cấu hình ngành.', 'error');
      }
    } catch (err) {
      showToast(`Lỗi kết nối máy chủ: ${err.message}`, 'error');
    } finally {
      btnSaveIndustryAll.disabled = false;
      btnSaveIndustryAll.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>Lưu Toàn Bộ Vào Database (PUT)</span>
      `;
    }
  });

  // Reset to Defaults (Super Admin)
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', async () => {
      if (!confirm('Bạn có chắc chắn muốn đặt lại danh mục tiêu chí chuẩn hóa về mặc định 32 tiêu chí hệ thống?')) {
        return;
      }

      try {
        const res = await fetch('/api/v1/screener/criteria/reset', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            ...auth.getAuthHeaders()
          }
        });

        const json = await res.json();
        if (res.ok && json.status === 'success') {
          showToast('Đã khôi phục toàn bộ danh mục tiêu chí chuẩn hóa về mặc định 32 tiêu chí thành công!', 'success');
          await populateEditForm(selectedIndId);
          try {
            await fetchCriteriaFromBackend(selectedIndId);
            notifyCriteriaUpdated();
          } catch (e) {}
          onResetDefaults(json.data);
        } else {
          showToast(json.message || 'Khôi phục thất bại.', 'error');
        }
      } catch (err) {
        showToast(`Lỗi kết nối: ${err.message}`, 'error');
      }
    });
  }
}
