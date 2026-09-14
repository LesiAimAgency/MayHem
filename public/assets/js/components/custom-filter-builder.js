/**
 * assets/js/components/custom-filter-builder.js
 * Dynamic Filter Builder & Benchmark Criteria Registry:
 * - Dynamic Criteria Catalog: Replaces hardcoded arrays with a reactive, extensible store.
 * - Always allows adding new criteria ("luôn có thể add dữ liệu").
 * - Role-based authorization: Only highest role (Super Admin / ROLE_SUPERADMIN) can "fix lại" / edit / override / delete system criteria.
 * - LocalStorage + Backend API persistence for custom criteria & overrides.
 * Rule: Zero mock data. Clean SVGs only.
 */

import { ICONS, showToast, escapeHtml } from '../core/helpers.js';
import { auth, ROLE_SUPERADMIN } from '../core/auth.js';
import { CALC_FIELDS_LIST } from '../calculations/financial-calculations.js';

import { DEFAULT_BASELINE_CRITERIA } from './criteria-baseline.js';
import { INDUSTRY_CONFIGS } from './filters.js';

const STORAGE_PRESETS_KEY = 'financial_custom_filter_presets';
const STORAGE_CRITERIA_CACHE_KEY = 'mayhem_criteria_db_cache_v2';
const STORAGE_CUSTOM_CRITERIA_KEY = 'mayhem_custom_criteria_catalog_v1';
const STORAGE_CRITERIA_OVERRIDES_KEY = 'mayhem_criteria_overrides_v1';

// -------------------------------------------------------------
// DYNAMIC CRITERIA CATALOG STORE & SUPER ADMIN PRIVILEGES
// -------------------------------------------------------------
export const BENCHMARK_CRITERIA_CATALOG = [];
export const CRITERIA_LISTENERS = new Set();

export function onCriteriaUpdated(cb) {
  if (typeof cb === 'function') CRITERIA_LISTENERS.add(cb);
}

export function notifyCriteriaUpdated() {
  CRITERIA_LISTENERS.forEach(cb => {
    try { cb(BENCHMARK_CRITERIA_CATALOG); } catch (e) { console.error(e); }
  });
}

export function isSuperAdmin() {
  if (!auth.isLoggedIn()) return false;
  const user = auth.getUser();
  const role = auth.getCurrentRole();
  return (role === ROLE_SUPERADMIN || user?.role === 'admin' || auth.canManageUsers());
}

/**
 * Synchronizes criteria mutations directly to backend MySQL database
 */
export async function syncCriterionToBackend(method, endpoint, payload) {
  if (typeof fetch !== 'function') return null;
  try {
    const token = (typeof auth !== 'undefined' && auth && auth.getToken()) || '';
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? ''
      : 'http://127.0.0.1:8000';
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders()
      },
      body: payload ? JSON.stringify(payload) : undefined
    });
    return await res.json();
  } catch (err) {
    console.warn(`[Criteria API] Sync ${method} ${endpoint} failed:`, err.message);
    return null;
  }
}

/**
 * Fetches latest criteria catalog from MySQL via REST API
 */
export async function fetchCriteriaFromBackend(industry = null) {
  if (typeof fetch !== 'function') return null;
  try {
    const baseUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? ''
      : 'http://127.0.0.1:8000';
    const url = industry && industry !== 'ALL'
      ? `${baseUrl}/api/v1/screener/criteria?industry=${encodeURIComponent(industry)}`
      : `${baseUrl}/api/v1/screener/criteria`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      const mapped = json.data.map(item => ({
        id: item.id,
        category: item.category,
        industry: item.industry,
        name: item.name,
        field: item.field,
        mode: item.mode,
        operator: item.operator,
        value: item.value !== null && item.value !== undefined ? Number(item.value) : null,
        displayValue: item.display_value || (item.value !== null && item.value !== undefined ? String(item.value) : ''),
        compareWithField: item.compare_with_field,
        timeScope: item.time_scope,
        isCustom: Boolean(item.is_custom),
        sortOrder: item.sort_order,
        isModified: false
      }));

      BENCHMARK_CRITERIA_CATALOG.length = 0;
      BENCHMARK_CRITERIA_CATALOG.push(...mapped);

      try {
        localStorage.setItem(STORAGE_CRITERIA_CACHE_KEY, JSON.stringify(mapped));
      } catch (e) {}

      notifyCriteriaUpdated();
      return BENCHMARK_CRITERIA_CATALOG;
    }
  } catch (err) {
    console.warn('[Criteria API] Failed to fetch criteria from backend, using local cache:', err.message);
  }
  return null;
}

/**
 * Loads criteria catalog from cache / fallback seed, then syncs with MySQL
 */
export function loadCriteriaCatalog() {
  BENCHMARK_CRITERIA_CATALOG.length = 0;
  let loaded = false;

  // 1. Try loading from localStorage cache
  try {
    const rawCache = localStorage.getItem(STORAGE_CRITERIA_CACHE_KEY);
    if (rawCache) {
      const cached = JSON.parse(rawCache);
      if (Array.isArray(cached) && cached.length > 0) {
        BENCHMARK_CRITERIA_CATALOG.push(...cached);
        loaded = true;
      }
    }
  } catch (e) {}

  // 2. Fallback to initial normalized baseline
  if (!loaded) {
    DEFAULT_BASELINE_CRITERIA.forEach(item => {
      BENCHMARK_CRITERIA_CATALOG.push({ ...item, isCustom: false, isModified: false });
    });
    try {
      localStorage.setItem(STORAGE_CRITERIA_CACHE_KEY, JSON.stringify(BENCHMARK_CRITERIA_CATALOG));
    } catch (e) {}
  }

  // 3. Trigger async fetch from backend to keep in sync with MySQL
  if (typeof fetch === 'function') {
    fetchCriteriaFromBackend();
  }

  return BENCHMARK_CRITERIA_CATALOG;
}

export function addCriterionToCatalog(criterionData) {
  if (!isSuperAdmin()) {
    showToast('Chỉ Quản trị viên cấp cao nhất (Super Admin) mới có quyền thêm tiêu chí vào hệ thống.', 'error');
    return { success: false, message: 'Unauthorized' };
  }

  if (!criterionData || !criterionData.field) {
    showToast('Vui lòng chọn chỉ tiêu tài chính hợp lệ.', 'error');
    return { success: false, message: 'Invalid field' };
  }

  const id = criterionData.id || `crit_custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const newCriterion = {
    id,
    name: criterionData.name || `${criterionData.field} ${criterionData.operator || '>='} ${criterionData.displayValue || criterionData.value}`,
    category: criterionData.category || 'Tùy biến hệ thống',
    industry: criterionData.industry || 'ALL',
    field: criterionData.field,
    mode: criterionData.mode || 'threshold',
    operator: criterionData.operator || '>=',
    value: criterionData.value !== undefined ? Number(criterionData.value) : 0,
    displayValue: criterionData.displayValue || String(criterionData.value || ''),
    timeScope: criterionData.timeScope || 'latest',
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  BENCHMARK_CRITERIA_CATALOG.push(newCriterion);

  try {
    localStorage.setItem(STORAGE_CRITERIA_CACHE_KEY, JSON.stringify(BENCHMARK_CRITERIA_CATALOG));
  } catch (e) {}

  syncCriterionToBackend('POST', '/api/v1/screener/criteria', {
    id: newCriterion.id,
    name: newCriterion.name,
    field: newCriterion.field,
    category: newCriterion.category,
    industry: newCriterion.industry,
    mode: newCriterion.mode,
    operator: newCriterion.operator,
    value: newCriterion.value,
    display_value: newCriterion.displayValue,
    time_scope: newCriterion.timeScope,
    is_custom: true
  });

  notifyCriteriaUpdated();
  showToast(`Đã thêm tiêu chí "${newCriterion.name}" vào danh mục hệ thống thành công!`, 'success');
  return { success: true, criterion: newCriterion };
}

export function updateCriterionInCatalog(id, updates) {
  if (!isSuperAdmin()) {
    showToast('Chỉ Quản trị viên cấp cao nhất (Super Admin) mới có quyền sửa/fix lại tiêu chí hệ thống.', 'error');
    return { success: false, message: 'Unauthorized' };
  }

  const target = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === id);
  if (!target) {
    showToast('Không tìm thấy tiêu chí cần chỉnh sửa.', 'error');
    return { success: false, message: 'Not found' };
  }

  Object.assign(target, updates, { isModified: true, updatedAt: new Date().toISOString() });

  try {
    localStorage.setItem(STORAGE_CRITERIA_CACHE_KEY, JSON.stringify(BENCHMARK_CRITERIA_CATALOG));
  } catch (e) {}

  syncCriterionToBackend('PUT', `/api/v1/screener/criteria/${encodeURIComponent(id)}`, {
    name: target.name,
    field: target.field,
    category: target.category,
    industry: target.industry,
    mode: target.mode,
    operator: target.operator,
    value: target.value,
    display_value: target.displayValue,
    compare_with_field: target.compareWithField,
    time_scope: target.timeScope
  });

  notifyCriteriaUpdated();
  showToast(`Đã fix và cập nhật tiêu chí "${updates.name || target.name}" thành công!`, 'success');
  return { success: true, criterion: target };
}

export function deleteCriterionFromCatalog(id) {
  if (!isSuperAdmin()) {
    showToast('Chỉ Quản trị viên cấp cao nhất (Super Admin) mới có quyền xóa tiêu chí hệ thống.', 'error');
    return { success: false, message: 'Unauthorized' };
  }

  const idx = BENCHMARK_CRITERIA_CATALOG.findIndex(c => c.id === id);
  if (idx === -1) return { success: false, message: 'Not found' };

  const targetName = BENCHMARK_CRITERIA_CATALOG[idx].name;
  BENCHMARK_CRITERIA_CATALOG.splice(idx, 1);

  try {
    localStorage.setItem(STORAGE_CRITERIA_CACHE_KEY, JSON.stringify(BENCHMARK_CRITERIA_CATALOG));
  } catch (e) {}

  syncCriterionToBackend('DELETE', `/api/v1/screener/criteria/${encodeURIComponent(id)}`);

  notifyCriteriaUpdated();
  showToast(`Đã xóa tiêu chí "${targetName}" khỏi danh mục!`, 'info');
  return { success: true };
}

export function resetCriteriaCatalog() {
  if (!isSuperAdmin()) {
    showToast('Chỉ Quản trị viên cấp cao nhất (Super Admin) mới có quyền đặt lại danh mục tiêu chí.', 'error');
    return { success: false, message: 'Unauthorized' };
  }

  localStorage.removeItem(STORAGE_CRITERIA_CACHE_KEY);
  localStorage.removeItem(STORAGE_CUSTOM_CRITERIA_KEY);
  localStorage.removeItem(STORAGE_CRITERIA_OVERRIDES_KEY);

  // Restore in-memory immediately with baseline
  BENCHMARK_CRITERIA_CATALOG.length = 0;
  DEFAULT_BASELINE_CRITERIA.forEach(item => {
    BENCHMARK_CRITERIA_CATALOG.push({ ...item, isCustom: false, isModified: false });
  });

  // Call backend reset API
  syncCriterionToBackend('POST', '/api/v1/screener/criteria/reset').then(res => {
    if (res && res.status === 'success' && Array.isArray(res.data)) {
      BENCHMARK_CRITERIA_CATALOG.length = 0;
      const mapped = res.data.map(item => ({
        id: item.id,
        category: item.category,
        industry: item.industry,
        name: item.name,
        field: item.field,
        mode: item.mode,
        operator: item.operator,
        value: item.value !== null && item.value !== undefined ? Number(item.value) : null,
        displayValue: item.display_value || (item.value !== null && item.value !== undefined ? String(item.value) : ''),
        compareWithField: item.compare_with_field,
        timeScope: item.time_scope,
        isCustom: false,
        sortOrder: item.sort_order,
        isModified: false
      }));
      BENCHMARK_CRITERIA_CATALOG.push(...mapped);
      try {
        localStorage.setItem(STORAGE_CRITERIA_CACHE_KEY, JSON.stringify(mapped));
      } catch (e) {}
      notifyCriteriaUpdated();
    }
  });

  notifyCriteriaUpdated();
  showToast('Đã khôi phục toàn bộ danh mục tiêu chí chuẩn hóa về mặc định ban đầu!', 'success');
  return { success: true };
}

// Initial Boot of Criteria Catalog
loadCriteriaCatalog();

// -------------------------------------------------------------
// CUSTOM FILTER BUILDER CONTROLLER CLASS
// -------------------------------------------------------------
export class CustomFilterBuilder {
  constructor(options = {}) {
    this.allRecords = options.allRecords || [];
    this.years = options.years || [];
    this.banks = options.banks || [];
    this.rawFields = options.rawFields || [];
    this.fieldMetaMap = options.fieldMetaMap || {};
    this.onApplyFilter = options.onApplyFilter || (() => { });
    this.currentIndustry = options.industry || 'NGAN_HANG';

    this.allFieldNames = [...CALC_FIELDS_LIST, ...this.rawFields.map(f => f.name)];

    // Cache industry averages
    this.industryAverages = {};
    this.calculateIndustryAverages();

    // Clean dynamic initial conditions (zero hardcoded ticks)
    this.conditions = Array.isArray(options.initialConditions)
      ? options.initialConditions.map(c => ({ ...c }))
      : [];

    this.catalogOverrides = {};
    this.managedFilters = [];
    this.editingFilterId = null;
    this.editingFilterName = '';

    this.loadPresets();
    this.fetchManagedFilters();

    onCriteriaUpdated(() => {
      if (typeof this.onManagedFiltersUpdated === 'function') {
        this.onManagedFiltersUpdated();
      }
    });
  }

  isPercentField(fieldName) {
    if (!fieldName) return false;
    const meta = this.fieldMetaMap ? this.fieldMetaMap[fieldName] : null;
    if (meta && meta.type === 'percent') return true;
    const lower = String(fieldName).toLowerCase();
    return (
      lower.includes('tỷ lệ') ||
      lower.includes('tỷ suất') ||
      lower.includes('biên ') ||
      lower.includes('cir') ||
      lower.includes('nim') ||
      lower.includes('roa') ||
      lower.includes('roe') ||
      lower.includes('car') ||
      lower.includes('casa') ||
      lower.includes('npl')
    );
  }

  parseValueInput(rawInput, fieldName, currentOp = '<=') {
    if (!rawInput) return null;
    let str = String(rawInput).trim();
    let op = currentOp || '<=';

    if (str.startsWith('>=')) { op = '>='; str = str.slice(2).trim(); }
    else if (str.startsWith('<=')) { op = '<='; str = str.slice(2).trim(); }
    else if (str.startsWith('>')) { op = '>'; str = str.slice(1).trim(); }
    else if (str.startsWith('<')) { op = '<'; str = str.slice(1).trim(); }
    else if (str.startsWith('=')) { op = '='; str = str.slice(1).trim(); }

    const isPct = str.includes('%') || this.isPercentField(fieldName);
    let numStr = str.replace(/%/g, '').replace(/,/g, '').trim();
    let val = parseFloat(numStr);
    if (isNaN(val)) return null;

    let numericValue = val;
    let displayValue = '';

    if (isPct) {
      if (val > 1 || str.includes('%')) {
        numericValue = val / 100;
      } else {
        numericValue = val;
      }
      displayValue = `${(numericValue * 100).toFixed(1)}%`;
    } else {
      numericValue = val;
      displayValue = val.toLocaleString('vi-VN');
    }

    return { operator: op, numericValue, displayValue };
  }

  async fetchManagedFilters() {
    try {
      const token = (typeof auth !== 'undefined' && auth && auth.getToken()) || '';
      const headers = { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch('/api/v1/screener/filters', { headers });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          this.managedFilters = json.data;
          try {
            localStorage.setItem('mayhem_managed_filters', JSON.stringify(this.managedFilters));
          } catch (e) { }
          this.loadPresets();
          return this.managedFilters;
        }
      }
    } catch (e) {
      // Fallback to local storage
    }

    try {
      const saved = localStorage.getItem('mayhem_managed_filters');
      this.managedFilters = saved ? JSON.parse(saved) : [];
      this.loadPresets();
      return this.managedFilters;
    } catch (e) {
      this.managedFilters = [];
      this.presets = [];
      return [];
    }
  }

  async saveFilter(name) {
    const payload = {
      name,
      industry: this.currentIndustry,
      conditions: this.conditions
    };

    try {
      const token = auth.getToken();
      if (token) {
        const res = await fetch('/api/v1/screener/filters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await this.fetchManagedFilters();
          return { status: 'success' };
        }
      }
    } catch (e) { }

    const newFilter = {
      id: Date.now(),
      name,
      industry: this.currentIndustry,
      conditions: [...this.conditions]
    };
    this.managedFilters.push(newFilter);
    try {
      localStorage.setItem('mayhem_managed_filters', JSON.stringify(this.managedFilters));
    } catch (e) { }
    this.loadPresets();
    return { status: 'success' };
  }

  async updateFilter(id, name) {
    const payload = {
      name,
      conditions: this.conditions
    };

    try {
      const token = auth.getToken();
      if (token) {
        const res = await fetch(`/api/v1/screener/filters/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await this.fetchManagedFilters();
          return { status: 'success' };
        }
      }
    } catch (e) { }

    const idx = this.managedFilters.findIndex(f => f.id === id);
    if (idx >= 0) {
      this.managedFilters[idx].name = name;
      this.managedFilters[idx].conditions = this.conditions;
      try {
        localStorage.setItem('mayhem_managed_filters', JSON.stringify(this.managedFilters));
      } catch (e) { }
      return { status: 'success' };
    }
    return null;
  }

  async deleteFilter(id) {
    const filterId = Number(id) || id;
    try {
      const headers = { 
        'Accept': 'application/json',
        ...auth.getAuthHeaders()
      };

      const res = await fetch(`/api/v1/screener/filters/${filterId}`, {
        method: 'DELETE',
        headers
      });

      this.managedFilters = this.managedFilters.filter(f => String(f.id) !== String(id));
      try {
        localStorage.setItem('mayhem_managed_filters', JSON.stringify(this.managedFilters));
      } catch (e) { }
      await this.fetchManagedFilters();
      return { status: 'success' };
    } catch (e) {
      console.warn('[deleteFilter] Network error:', e);
      this.managedFilters = this.managedFilters.filter(f => String(f.id) !== String(id));
      try {
        localStorage.setItem('mayhem_managed_filters', JSON.stringify(this.managedFilters));
      } catch (err) { }
      return { status: 'success' };
    }
  }

  calculateIndustryAverages() {
    this.allFieldNames.forEach(fieldName => {
      this.industryAverages[fieldName] = {};
      this.years.forEach(y => {
        const vals = [];
        this.banks.forEach(b => {
          const rec = this.allRecords.find(r => r.bank === b && r.field === fieldName);
          if (rec && rec.values && rec.values[y] !== null && rec.values[y] !== undefined && !isNaN(rec.values[y])) {
            let val = Number(rec.values[y]);
            if (fieldName.includes('CIR')) val = Math.abs(val);
            vals.push(val);
          }
        });

        if (vals.length > 0) {
          this.industryAverages[fieldName][y] = vals.reduce((a, b) => a + b, 0) / vals.length;
        } else {
          this.industryAverages[fieldName][y] = null;
        }
      });
    });
  }

  getRecordValue(bank, field, year) {
    const rec = this.allRecords.find(r => r.bank === bank && r.field === field);
    if (!rec || !rec.values) return null;
    let val = rec.values[year];
    if (val === null || val === undefined || isNaN(val)) return null;
    val = Number(val);
    if (field.includes('CIR')) val = Math.abs(val);
    return val;
  }

  loadPresets() {
    // 100% dynamic - derive presets from DB managedFilters without any hardcoded arrays
    if (Array.isArray(this.managedFilters)) {
      this.presets = this.managedFilters.filter(f => Boolean(f.is_preset) && (f.industry === this.currentIndustry || !f.industry));
    } else {
      this.presets = [];
    }
  }

  getTenConsecutiveYears() {
    if (this.years.length <= 10) return this.years.slice();
    const idx2024 = this.years.indexOf('2024');
    if (idx2024 >= 9) {
      return this.years.slice(idx2024 - 9, idx2024 + 1);
    }
    return this.years.slice(-10);
  }

  getLatestYear() {
    if (this.years.includes('2024')) return '2024';
    return this.years[this.years.length - 1] || '2024';
  }

  checkSingleCondition(bankCode, cond) {
    const latestYear = cond.year || this.getLatestYear();
    const tenYears = this.getTenConsecutiveYears();
    const yearsToCheck = (cond.timeScope === '10y_consecutive') ? tenYears : [latestYear];

    for (const yr of yearsToCheck) {
      const val = this.getRecordValue(bankCode, cond.field, yr);
      if (val === null) {
        if (cond.timeScope === '10y_consecutive') continue;
        return false;
      }

      if (cond.mode === 'industry_avg_higher') {
        const avg = this.industryAverages[cond.field] ? this.industryAverages[cond.field][yr] : null;
        if (avg !== null && val <= avg) return false;
      } else if (cond.mode === 'industry_avg_lower') {
        const avg = this.industryAverages[cond.field] ? this.industryAverages[cond.field][yr] : null;
        if (avg !== null && val >= avg) return false;
      } else if (cond.mode === 'compare_fields') {
        const compareVal = this.getRecordValue(bankCode, cond.compareWithField, yr);
        if (compareVal === null) continue;
        if (cond.operator === '>' && !(val > compareVal)) return false;
        if (cond.operator === '>=' && !(val >= compareVal)) return false;
      } else {
        const target = Number(cond.value);
        switch (cond.operator) {
          case '>': if (!(val > target)) return false; break;
          case '>=': if (!(val >= target)) return false; break;
          case '<': if (!(val < target)) return false; break;
          case '<=': if (!(val <= target)) return false; break;
          case '=': if (Math.abs(val - target) >= 0.0001) return false; break;
          default: break;
        }
      }
    }

    return true;
  }

  getMatchingBanks() {
    return this.getMatchingBanksForConditions(this.conditions.filter(c => c && c.enabled));
  }

  getMatchingBanksForConditions(conditions = [], targetList = null) {
    const active = conditions.filter(c => c && c.enabled !== false);
    const candidateList = targetList || this.banks;
    if (active.length === 0) {
      return candidateList.slice();
    }

    const matching = [];
    candidateList.forEach(code => {
      let passedAll = true;
      for (const cond of active) {
        if (!this.checkSingleCondition(code, cond)) {
          passedAll = false;
          break;
        }
      }
      if (passedAll) {
        matching.push(code);
      }
    });

    return matching;
  }

  renderModal(container, onClose = () => { }) {
    const matchingBanks = this.getMatchingBanks();
    const isSuper = isSuperAdmin();

    const industryLabel = INDUSTRY_CONFIGS[this.currentIndustry]?.name || this.currentIndustry;

    container.innerHTML = `
      <div id="filterBuilderBackdrop" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/95 flex-wrap gap-3">
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2 class="text-base font-bold text-slate-900">Quản Trị Bộ Lọc & Danh Mục Tiêu Chí Tài Chính</h2>
                <span class="text-xs px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono font-bold">
                  Ngành: ${industryLabel}
                </span>
                ${isSuper ? `
                  <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span>Quyền Super Admin: Được Sửa & Thêm Tiêu Chí</span>
                  </span>
                ` : `
                  <span class="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    Chế độ Sử dụng & Áp dụng
                  </span>
                `}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Thêm, xóa, sửa bộ lọc động; Super Admin có quyền thêm mới và fix lại tiêu chí chuẩn hóa</p>
            </div>
            <button id="btnCloseFilterBuilder" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition text-sm font-semibold">
              ✕ Đóng
            </button>
          </div>

          <!-- Body Content -->
          <div class="p-6 overflow-y-auto flex flex-col gap-5">

            <!-- Section A: Quản Trị Bộ Lọc Đã Lưu (CRUD) -->
            <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col gap-3">
              <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Danh sách bộ lọc đã lưu (${this.managedFilters.length} bộ lọc):</span>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                  <input type="text" id="inpSaveFilterName" placeholder="Tên bộ lọc muốn lưu..." value="${this.editingFilterName || ''}" class="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 w-52 sm:w-64 font-medium" />
                  
                  ${this.editingFilterId ? `
                    <button id="btnUpdateCurrentFilter" type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-2xs">
                      Cập nhật thay đổi
                    </button>
                    <button id="btnCancelEditFilter" type="button" class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 transition">
                      Hủy
                    </button>
                  ` : `
                    <button id="btnSaveCurrentFilter" type="button" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-2xs">
                      + Lưu bộ lọc này
                    </button>
                  `}
                </div>
              </div>

              <!-- Filter Cards Carousel / Grid -->
              ${this.managedFilters.length === 0 ? `
                <div class="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-lg bg-white">
                  Chưa có bộ lọc tùy chỉnh nào được lưu cho ngành ${industryLabel}. Hãy thiết lập các tiêu chí bên dưới và bấm <strong>"Lưu bộ lọc này"</strong>.
                </div>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  ${this.managedFilters.map(f => {
                    const condCount = Array.isArray(f.conditions) ? f.conditions.length : 0;
                    const isEditing = (this.editingFilterId === f.id);
                    return `
                      <div class="p-3 rounded-lg border flex flex-col justify-between gap-2 transition ${isEditing ? 'bg-blue-50 border-blue-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'}">
                        <div>
                          <div class="flex items-center justify-between gap-2">
                            <span class="font-bold text-xs text-slate-800 line-clamp-1">${escapeHtml(f.name)}</span>
                            <span class="text-[10px] px-1.5 py-0.5 rounded font-mono ${f.is_preset ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}">${condCount} tiêu chí</span>
                          </div>
                          <p class="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            ${Array.isArray(f.conditions) ? f.conditions.map(c => escapeHtml(c.name || c.field)).slice(0, 2).join(', ') : 'Đặc thù ngành'}
                          </p>
                        </div>

                        <div class="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                          <button type="button" class="btn-apply-managed-filter px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition shadow-2xs" data-filter-id="${escapeHtml(f.id)}">
                            Áp dụng
                          </button>
                          <div class="flex items-center gap-1">
                            <button type="button" class="btn-edit-managed-filter px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition font-medium border border-slate-200" data-filter-id="${escapeHtml(f.id)}">
                              Sửa
                            </button>
                            <button type="button" class="btn-delete-managed-filter px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] transition font-medium border border-rose-200" data-filter-id="${escapeHtml(f.id)}">
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>

            <!-- Section B: Bộ lọc mẫu khuyến nghị -->
            <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200">
              <span class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Bộ lọc mẫu khuyến nghị (Presets):</span>
              <div class="flex items-center gap-2 flex-wrap">
                ${this.presets.map((preset, idx) => `
                  <button type="button" class="btn-preset-chip px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition shadow-2xs" data-preset-idx="${idx}">
                    ${escapeHtml(preset.name)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Section C: DYNAMIC BENCHMARK CRITERIA REGISTRY -->
            <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col gap-3">
              <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span class="text-xs font-bold text-blue-700 uppercase tracking-wider">Danh mục tiêu chí chuẩn hóa (${BENCHMARK_CRITERIA_CATALOG.length} tiêu chí):</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">Tùy chỉnh toán tử, số liệu trên từng thẻ hoặc Super Admin có thể sửa trực tiếp cấu hình gốc</p>
                </div>

                <!-- Super Admin Toolbar -->
                <div class="flex items-center gap-2 flex-wrap">
                  <button id="btnOpenAddCriteriaModal" type="button" class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-2xs active:scale-95" title="Thêm tiêu chí mới vào danh mục hệ thống">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span>+ Thêm Tiêu Chí Mới</span>
                  </button>

                  ${isSuper ? `
                    <button id="btnResetAllCriteria" type="button" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition" title="Khôi phục danh mục về trạng thái gốc của hệ thống">
                      <span>Đặt lại tiêu chí gốc</span>
                    </button>
                  ` : ''}
                </div>
              </div>

              <div id="catalogGridContainer" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                ${this.renderCatalogGridHtml()}
              </div>
            </div>

            <!-- Section D: Custom Add Condition Form (Tự định nghĩa theo buổi làm việc) -->
            <div class="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col gap-3">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Tự định nghĩa thêm điều kiện tùy biến:</span>
              <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <!-- Field -->
                <div class="sm:col-span-5">
                  <label class="block text-[11px] text-slate-600 mb-1 font-medium">Chỉ tiêu tài chính</label>
                  <select id="builderField" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-blue-500">
                    ${this.allFieldNames.map(f => `<option value="${f}">${f}</option>`).join('')}
                  </select>
                </div>

                <!-- Operator -->
                <div class="sm:col-span-2">
                  <label class="block text-[11px] text-slate-600 mb-1 font-medium">Toán tử</label>
                  <select id="builderOperator" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-blue-500 font-mono font-bold">
                    <option value=">=">&gt;= (Lớn hơn hoặc bằng)</option>
                    <option value=">">&gt; (Lớn hơn)</option>
                    <option value="<=">&lt;= (Nhỏ hơn hoặc bằng)</option>
                    <option value="<">&lt; (Nhỏ hơn)</option>
                    <option value="=">= (Bằng)</option>
                  </select>
                </div>

                <!-- Target Value -->
                <div class="sm:col-span-3">
                  <label class="block text-[11px] text-slate-600 mb-1 font-medium">Giá trị ngưỡng (Nhập: &lt;10%, &gt;10%, 15%...)</label>
                  <input type="text" id="builderTargetVal" placeholder="VD: <10% hoặc >10%" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-blue-500 font-mono font-bold" />
                </div>

                <!-- Year -->
                <div class="sm:col-span-2">
                  <label class="block text-[11px] text-slate-600 mb-1 font-medium">Năm đánh giá</label>
                  <select id="builderYear" class="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-2 outline-none focus:border-blue-500 font-mono">
                    <option value="latest" selected>Năm gần nhất</option>
                    <option value="10y_consecutive">10 năm liên tiếp</option>
                    ${this.years.map(y => `<option value="${y}">${y}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="flex justify-end mt-1">
                <button id="btnAddCondition" type="button" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-2xs">
                  Thêm điều kiện này
                </button>
              </div>
            </div>

            <!-- Section E: Conditions List -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <div>
                  <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Danh sách điều kiện đang kích hoạt (${this.conditions.length}):</span>
                  <span class="text-[11px] text-slate-500 ml-2">Chỉnh sửa trực tiếp toán tử và số liệu bên dưới</span>
                </div>
                <button id="btnClearAllConditions" type="button" class="text-xs text-rose-600 hover:text-rose-700 font-medium transition">
                  Xóa tất cả điều kiện
                </button>
              </div>

              <div id="conditionsListContainer" class="flex flex-col gap-2">
                ${this.renderConditionsListHtml()}
              </div>
            </div>

            <!-- Section F: Matching Companies Result Box -->
            <div class="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col gap-2.5">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <span class="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Mã thỏa mãn toàn bộ tiêu chí (${matchingBanks.length}/${this.banks.length}):
                </span>
                <span class="text-xs text-blue-700">Điều kiện logic: AND (Thỏa mãn đồng thời mọi tiêu chí)</span>
              </div>

              <div id="matchingBanksContainer" class="flex items-center gap-2 flex-wrap min-h-8">
                ${matchingBanks.length > 0
                  ? matchingBanks.map(b => `<span class="px-2.5 py-1 rounded bg-white text-blue-700 border border-blue-300 font-mono font-bold text-xs shadow-2xs">${b}</span>`).join('')
                  : `<span class="text-xs text-slate-500">Không có mã nào thỏa mãn toàn bộ tiêu chí trên.</span>`
                }
              </div>
            </div>

          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
            <span class="text-xs text-slate-500">Áp dụng bộ lọc sẽ lọc dữ liệu hiển thị trên Bảng Ma Trận theo đúng danh sách mã thỏa mãn.</span>
            <div class="flex items-center gap-2.5">
              <button id="btnCancelFilterBuilder" type="button" class="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 transition">
                Đóng
              </button>
              <button id="btnApplyFilterBuilder" type="button" class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm">
                Áp dụng bộ lọc (${matchingBanks.length} mã)
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- SUPER ADMIN FIX / EDIT CRITERIA MODAL OVERLAY -->
      <div id="modalFixCriteriaOverlay" class="hidden fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" style="z-index: 99999;">
        <div class="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
              <h3 id="lblFixModalTitle" class="text-sm font-bold text-slate-900">Sửa / Fix Tiêu Chí Danh Mục (Super Admin)</h3>
            </div>
            <button id="btnCloseFixModal" type="button" class="text-slate-400 hover:text-slate-600 text-sm">✕</button>
          </div>

          <form id="formFixCriteria" class="flex flex-col gap-3 text-xs">
            <input type="hidden" id="editCritId" />
            
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Tên hiển thị tiêu chí</label>
              <input type="text" id="editCritName" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-medium" />
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Chỉ tiêu tài chính</label>
                <select id="editCritField" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500">
                  ${this.allFieldNames.map(f => `<option value="${f}">${f}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nhóm danh mục</label>
                <input type="text" id="editCritCategory" placeholder="VD: Khả năng sinh lời" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Áp dụng cho Ngành</label>
                <select id="editCritIndustry" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-medium">
                  <option value="ALL">Tất cả các ngành (ALL)</option>
                  ${Object.values(INDUSTRY_CONFIGS).map(ind => `<option value="${ind.id}">${escapeHtml(ind.name)}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Kiểu đánh giá (Mode)</label>
                <select id="editCritMode" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500">
                  <option value="threshold">Ngưỡng cố định (Số / %)</option>
                  <option value="industry_avg_higher">&gt; Trung bình ngành</option>
                  <option value="industry_avg_lower">&lt; Trung bình ngành</option>
                </select>
              </div>
            </div>

            <div id="rowEditThresholdControls" class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Toán tử mặc định</label>
                <select id="editCritOp" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-mono font-bold">
                  <option value=">=">&gt;= (Lớn hơn / bằng)</option>
                  <option value=">">&gt; (Lớn hơn)</option>
                  <option value="<=">&lt;= (Nhỏ hơn / bằng)</option>
                  <option value="<">&lt; (Nhỏ hơn)</option>
                  <option value="=">= (Bằng)</option>
                </select>
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Ngưỡng số học mặc định</label>
                <input type="number" step="any" id="editCritVal" placeholder="VD: 0.15 cho 15%" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-mono" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Nhãn hiển thị (VD: 15%, &gt; TB)</label>
                <input type="text" id="editCritDisplayVal" placeholder="VD: 15.0%" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-mono" />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 mb-1">Khung thời gian</label>
                <select id="editCritScope" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 outline-none focus:bg-white focus:border-blue-500">
                  <option value="latest">Năm gần nhất</option>
                  <option value="10y_consecutive">10 năm liên tiếp</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
              <button type="button" id="btnDeleteCriteriaItem" class="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                <span>Xóa tiêu chí</span>
              </button>

              <div class="flex items-center gap-2">
                <button type="button" id="btnCancelFixModal" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Hủy</button>
                <button type="submit" id="btnSaveFixCriteria" class="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs">Lưu Thay Đổi (Fix)</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachEvents(container, onClose);
  }

  renderCatalogGridHtml() {
    const isSuper = isSuperAdmin();
    // Filter criteria relevant to current industry or global
    const relevantCriteria = BENCHMARK_CRITERIA_CATALOG.filter(crit => {
      if (!crit.industry || crit.industry === 'ALL') return true;
      return crit.industry === this.currentIndustry;
    });

    return relevantCriteria.map(item => {
      const isAdded = this.conditions.some(c => c && c.id === item.id);
      const activeCond = this.conditions.find(c => c && c.id === item.id);
      const override = this.catalogOverrides[item.id] || {};

      const currentOp = activeCond ? activeCond.operator : (override.operator || item.operator || '<=');
      const currentDisplayVal = activeCond ? activeCond.displayValue : (override.displayValue || item.displayValue || '');
      const currentMode = activeCond ? activeCond.mode : (override.mode || item.mode);
      const scopeLabel = item.timeScope === '10y_consecutive' ? '10 năm liên tiếp' : 'Năm gần nhất';

      const safeId = escapeHtml(item.id);
      const safeName = escapeHtml(item.name || item.field);
      const safeField = escapeHtml(item.field);
      const safeCategory = escapeHtml(item.category || 'Chuẩn hóa');
      const safeScope = escapeHtml(scopeLabel);
      const safeDisplayVal = escapeHtml(currentDisplayVal);
      const safeItemDisplayVal = escapeHtml(item.displayValue || '');

      return `
        <div class="catalog-card p-2.5 rounded-lg border text-xs flex flex-col justify-between gap-2 transition ${isAdded ? 'bg-blue-50/90 border-blue-400 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'}" data-crit-id="${safeId}">
          <!-- Top: Field Name & Badges -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col flex-1 min-w-0">
              <span class="font-bold text-slate-800 truncate" title="${safeName}">${safeName}</span>
              <span class="text-[10px] text-slate-500 font-mono truncate">${safeField} • ${safeCategory} • ${safeScope}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              ${item.isCustom ? `
                <span class="text-[9px] px-1 rounded font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Tự thêm</span>
              ` : ''}
              ${item.isModified ? `
                <span class="text-[9px] px-1 rounded font-bold bg-amber-100 text-amber-700 border border-amber-200">Đã fix</span>
              ` : ''}
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${isAdded ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                ${isAdded ? 'Đang lọc' : 'Mẫu'}
              </span>
            </div>
          </div>

          <!-- Bottom: Editable Controls + Add Button -->
          <div class="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
            ${item.mode === 'threshold' ? `
              <div class="flex items-center gap-1 flex-1 min-w-0">
                <select class="catalog-op-select bg-slate-50 border border-slate-300 text-blue-700 text-[11px] rounded px-1.5 py-1 font-mono font-bold outline-none focus:border-blue-500 cursor-pointer shrink-0" data-crit-id="${safeId}" title="Chọn toán tử so sánh">
                  <option value="<=" ${currentOp === '<=' ? 'selected' : ''}>&lt;=</option>
                  <option value="<" ${currentOp === '<' ? 'selected' : ''}>&lt;</option>
                  <option value=">=" ${currentOp === '>=' ? 'selected' : ''}>&gt;=</option>
                  <option value=">" ${currentOp === '>' ? 'selected' : ''}>&gt;</option>
                  <option value="=" ${currentOp === '=' ? 'selected' : ''}>=</option>
                </select>
                <input type="text" class="catalog-val-input bg-slate-50 border border-slate-300 text-slate-800 text-[11px] rounded px-2 py-1 w-20 font-mono font-bold outline-none focus:border-blue-500" data-crit-id="${safeId}" value="${safeDisplayVal}" placeholder="VD: <10%" title="Nhập số liệu hoặc kèm toán tử" />
              </div>
            ` : (item.mode === 'industry_avg_higher' || item.mode === 'industry_avg_lower') ? `
              <div class="flex items-center gap-1 flex-1 min-w-0">
                <select class="catalog-benchmark-select bg-purple-50 border border-purple-200 text-purple-700 text-[11px] rounded px-1.5 py-1 font-mono font-bold outline-none focus:border-purple-500 cursor-pointer" data-crit-id="${safeId}">
                  <option value="industry_avg_higher" ${currentMode === 'industry_avg_higher' ? 'selected' : ''}>&gt; TB Ngành</option>
                  <option value="industry_avg_lower" ${currentMode === 'industry_avg_lower' ? 'selected' : ''}>&lt; TB Ngành</option>
                </select>
              </div>
            ` : `
              <div class="text-[11px] text-slate-500 font-mono flex-1 truncate">
                ${safeItemDisplayVal}
              </div>
            `}

            <div class="flex items-center gap-1 shrink-0">
              <!-- Super Admin Fix Button -->
              ${isSuper ? `
                <button type="button" class="btn-fix-criteria p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 transition" data-crit-id="${safeId}" title="Fix / Chỉnh sửa cấu hình tiêu chí (Super Admin)">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
              ` : ''}

              <button type="button" class="btn-catalog-toggle px-2.5 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${isAdded ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'}" data-crit-id="${safeId}">
                ${isAdded ? '✓ Đã thêm' : '+ Thêm'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderConditionsListHtml() {
    if (this.conditions.length === 0) {
      return `<div class="p-4 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">Chưa có điều kiện lọc nào được kích hoạt. Hãy chọn từ danh mục chuẩn hóa hoặc tự định nghĩa ở trên.</div>`;
    }

    return this.conditions.map(cond => {
      const dynamicName = (cond.mode === 'threshold')
        ? `${cond.field} ${cond.operator || '>='} ${cond.displayValue}`
        : (cond.mode === 'industry_avg_higher')
          ? `${cond.field} > TB Ngành`
          : (cond.mode === 'industry_avg_lower')
            ? `${cond.field} < TB Ngành`
            : (cond.name || `${cond.field} ${cond.displayValue}`);

      const safeCondId = escapeHtml(cond.id);
      const safeField = escapeHtml(cond.field);
      const safeCategory = escapeHtml(cond.category || 'Tùy biến');
      const safeDynamicName = escapeHtml(dynamicName);
      const safeDisplayVal = escapeHtml(cond.displayValue || '');

      return `
        <div class="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs gap-3 flex-wrap lg:flex-nowrap shadow-2xs" data-cond-id="${safeCondId}">
          <div class="flex items-center gap-2.5 flex-1 min-w-[260px]">
            <input type="checkbox" class="cond-toggle rounded bg-white border-slate-300 text-blue-600 h-4 w-4 cursor-pointer shrink-0" data-cond-id="${safeCondId}" ${cond.enabled ? 'checked' : ''} title="Bật/tắt tiêu chí này" />
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-slate-800 truncate">${safeField}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono shrink-0">${safeCategory}</span>
              </div>
              <span class="text-[11px] text-blue-600 font-mono font-medium truncate">${safeDynamicName}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            ${cond.mode === 'threshold' ? `
              <select class="cond-op-select bg-slate-50 border border-slate-300 text-blue-700 text-xs rounded px-2 py-1 font-mono font-bold outline-none focus:border-blue-500 cursor-pointer" data-cond-id="${safeCondId}">
                <option value="<=" ${cond.operator === '<=' ? 'selected' : ''}>&lt;=</option>
                <option value="<" ${cond.operator === '<' ? 'selected' : ''}>&lt;</option>
                <option value=">=" ${cond.operator === '>=' ? 'selected' : ''}>&gt;=</option>
                <option value=">" ${cond.operator === '>' ? 'selected' : ''}>&gt;</option>
                <option value="=" ${cond.operator === '=' ? 'selected' : ''}>=</option>
              </select>
              <input type="text" class="cond-val-input bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded px-2.5 py-1 w-24 font-mono font-bold outline-none focus:border-blue-500" data-cond-id="${safeCondId}" value="${safeDisplayVal}" placeholder="VD: <10%" />
            ` : (cond.mode === 'industry_avg_higher' || cond.mode === 'industry_avg_lower') ? `
              <select class="cond-benchmark-select bg-purple-50 border border-purple-200 text-purple-700 text-xs rounded px-2 py-1 font-mono font-bold outline-none focus:border-purple-500 cursor-pointer" data-cond-id="${safeCondId}">
                <option value="industry_avg_higher" ${cond.mode === 'industry_avg_higher' ? 'selected' : ''}>&gt; TB Ngành</option>
                <option value="industry_avg_lower" ${cond.mode === 'industry_avg_lower' ? 'selected' : ''}>&lt; TB Ngành</option>
              </select>
            ` : `
              <span class="text-xs font-mono text-slate-700 px-2 py-1 rounded bg-slate-100 border border-slate-200">${safeDisplayVal}</span>
            `}

            <select class="cond-time-select bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded px-2 py-1 font-mono outline-none focus:border-blue-500 cursor-pointer" data-cond-id="${safeCondId}">
              <option value="latest" ${cond.timeScope === 'latest' || (!cond.timeScope && !cond.year) ? 'selected' : ''}>Năm gần nhất</option>
              <option value="10y_consecutive" ${cond.timeScope === '10y_consecutive' ? 'selected' : ''}>10 năm liên tiếp</option>
              ${this.years.map(y => `<option value="${y}" ${cond.year === y ? 'selected' : ''}>Năm ${y}</option>`).join('')}
            </select>

            <button type="button" class="btn-delete-cond text-rose-600 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 border border-rose-200/60 transition" data-cond-id="${safeCondId}" title="Xóa điều kiện">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  attachEvents(container, onClose) {
    const backdrop = container.querySelector('#filterBuilderBackdrop');
    const btnClose = container.querySelector('#btnCloseFilterBuilder');
    const btnCancel = container.querySelector('#btnCancelFilterBuilder');
    const btnAdd = container.querySelector('#btnAddCondition');
    const btnClear = container.querySelector('#btnClearAllConditions');
    const btnApply = container.querySelector('#btnApplyFilterBuilder');

    const selField = container.querySelector('#builderField');
    const selOp = container.querySelector('#builderOperator');
    const inpVal = container.querySelector('#builderTargetVal');
    const selYear = container.querySelector('#builderYear');

    const inpSaveName = container.querySelector('#inpSaveFilterName');
    const btnSaveFilter = container.querySelector('#btnSaveCurrentFilter');
    const btnUpdateFilter = container.querySelector('#btnUpdateCurrentFilter');
    const btnCancelEdit = container.querySelector('#btnCancelEditFilter');

    // Super Admin Modal elements
    const modalFix = container.querySelector('#modalFixCriteriaOverlay');
    const btnCloseFixModal = container.querySelector('#btnCloseFixModal');
    const btnCancelFixModal = container.querySelector('#btnCancelFixModal');
    const formFix = container.querySelector('#formFixCriteria');
    const lblFixModalTitle = container.querySelector('#lblFixModalTitle');
    const editCritId = container.querySelector('#editCritId');
    const editCritName = container.querySelector('#editCritName');
    const editCritField = container.querySelector('#editCritField');
    const editCritCategory = container.querySelector('#editCritCategory');
    const editCritIndustry = container.querySelector('#editCritIndustry');
    const editCritMode = container.querySelector('#editCritMode');
    const editCritOp = container.querySelector('#editCritOp');
    const editCritVal = container.querySelector('#editCritVal');
    const editCritDisplayVal = container.querySelector('#editCritDisplayVal');
    const editCritScope = container.querySelector('#editCritScope');
    const btnDeleteCriteriaItem = container.querySelector('#btnDeleteCriteriaItem');
    const btnOpenAddCriteria = container.querySelector('#btnOpenAddCriteriaModal');
    const btnResetAllCriteria = container.querySelector('#btnResetAllCriteria');

    const rowEditThresholdControls = container.querySelector('#rowEditThresholdControls');
    const toggleModeControls = (mode) => {
      if (!rowEditThresholdControls) return;
      if (mode === 'threshold') {
        rowEditThresholdControls.classList.remove('hidden');
        if (editCritDisplayVal && (!editCritDisplayVal.value || editCritDisplayVal.value.includes('TB Ngành'))) {
          editCritDisplayVal.value = editCritVal.value ? String(editCritVal.value) : '';
        }
      } else {
        rowEditThresholdControls.classList.add('hidden');
        if (editCritDisplayVal) {
          editCritDisplayVal.value = (mode === 'industry_avg_higher') ? '> TB Ngành' : '< TB Ngành';
        }
      }
    };

    if (editCritMode) {
      editCritMode.addEventListener('change', () => {
        toggleModeControls(editCritMode.value);
      });
    }

    let isCreatingNewCriteria = false;

    const openFixCriteriaModal = (critId = null) => {
      if (!isSuperAdmin()) {
        showToast('Chỉ Quản trị viên cấp cao nhất (Super Admin) mới có quyền sửa/fix tiêu chí hệ thống.', 'error');
        return;
      }

      if (critId) {
        // Edit existing
        const crit = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === critId);
        if (!crit) return;

        isCreatingNewCriteria = false;
        lblFixModalTitle.textContent = `Sửa / Fix Tiêu Chí: ${crit.name}`;
        editCritId.value = crit.id;
        editCritName.value = crit.name;
        editCritField.value = crit.field;
        editCritCategory.value = crit.category || '';
        editCritIndustry.value = crit.industry || 'ALL';
        editCritMode.value = crit.mode || 'threshold';
        editCritOp.value = crit.operator || '>=';
        editCritVal.value = (crit.value !== undefined) ? crit.value : '';
        editCritDisplayVal.value = crit.displayValue || '';
        editCritScope.value = crit.timeScope || 'latest';
        toggleModeControls(editCritMode.value);
        btnDeleteCriteriaItem.classList.remove('hidden');
      } else {
        // Create new
        isCreatingNewCriteria = true;
        lblFixModalTitle.textContent = 'Thêm Tiêu Chí Mới Vào Danh Mục Hệ Thống (Super Admin)';
        editCritId.value = '';
        editCritName.value = '';
        editCritField.value = selField ? selField.value : this.allFieldNames[0];
        editCritCategory.value = 'Tiêu chí tùy biến';
        editCritIndustry.value = this.currentIndustry || 'ALL';
        editCritMode.value = 'threshold';
        editCritOp.value = '>=';
        editCritVal.value = '';
        editCritDisplayVal.value = '';
        editCritScope.value = 'latest';
        toggleModeControls('threshold');
        btnDeleteCriteriaItem.classList.add('hidden');
      }

      modalFix.classList.remove('hidden');
    };

    const closeFixModal = () => {
      modalFix.classList.add('hidden');
    };

    if (btnCloseFixModal) btnCloseFixModal.addEventListener('click', closeFixModal);
    if (btnCancelFixModal) btnCancelFixModal.addEventListener('click', closeFixModal);

    if (btnOpenAddCriteria) {
      btnOpenAddCriteria.addEventListener('click', () => {
        openFixCriteriaModal(null);
      });
    }

    if (btnResetAllCriteria) {
      btnResetAllCriteria.addEventListener('click', () => {
        if (!confirm('Bạn có chắc chắn muốn đặt lại toàn bộ danh mục tiêu chí về mặc định ban đầu không?')) return;
        resetCriteriaCatalog();
        updateUI();
      });
    }

    if (formFix) {
      formFix.addEventListener('submit', (e) => {
        e.preventDefault();
        const cid = editCritId.value;
        const name = editCritName.value.trim();
        const field = editCritField.value;
        const category = editCritCategory.value.trim();
        const industry = editCritIndustry.value;
        const mode = editCritMode.value;
        const op = editCritOp.value;
        const val = editCritVal.value !== '' ? Number(editCritVal.value) : 0;
        const disp = editCritDisplayVal.value.trim() || String(val);
        const scope = editCritScope.value;

        if (isCreatingNewCriteria) {
          const res = addCriterionToCatalog({
            name,
            field,
            category,
            industry,
            mode,
            operator: op,
            value: val,
            displayValue: disp,
            timeScope: scope
          });
          if (res.success) {
            closeFixModal();
            updateUI();
          }
        } else {
          const res = updateCriterionInCatalog(cid, {
            name,
            field,
            category,
            industry,
            mode,
            operator: op,
            value: val,
            displayValue: disp,
            timeScope: scope
          });
          if (res.success) {
            closeFixModal();
            updateUI();
          }
        }
      });
    }

    if (btnDeleteCriteriaItem) {
      btnDeleteCriteriaItem.addEventListener('click', () => {
        const cid = editCritId.value;
        if (!cid) return;
        if (!confirm('Bạn có chắc chắn muốn xóa tiêu chí này khỏi danh mục hệ thống?')) return;

        const res = deleteCriterionFromCatalog(cid);
        if (res.success) {
          closeFixModal();
          updateUI();
        }
      });
    }

    const updateUI = () => {
      const listContainer = container.querySelector('#conditionsListContainer');
      const catalogContainer = container.querySelector('#catalogGridContainer');
      const matchContainer = container.querySelector('#matchingBanksContainer');
      const matching = this.getMatchingBanks();

      if (listContainer) listContainer.innerHTML = this.renderConditionsListHtml();
      if (catalogContainer) catalogContainer.innerHTML = this.renderCatalogGridHtml();

      if (matchContainer) {
        matchContainer.innerHTML = matching.length > 0
          ? matching.map(b => `<span class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs shadow-2xs">${b}</span>`).join('')
          : `<span class="text-xs text-slate-500">Không có mã nào thỏa mãn toàn bộ tiêu chí trên.</span>`;
      }
      if (btnApply) {
        btnApply.textContent = `Áp dụng bộ lọc (${matching.length} mã)`;
      }

      this.attachDynamicListeners(container, updateUI, openFixCriteriaModal);
    };

    const closeHandler = () => {
      container.innerHTML = '';
      onClose();
    };

    btnClose.addEventListener('click', closeHandler);
    btnCancel.addEventListener('click', closeHandler);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeHandler();
    });

    // Save New Filter
    if (btnSaveFilter && inpSaveName) {
      btnSaveFilter.addEventListener('click', async () => {
        const name = inpSaveName.value.trim();
        if (!name) {
          alert('Vui lòng nhập tên cho bộ lọc!');
          return;
        }
        if (this.conditions.length === 0) {
          alert('Vui lòng thêm ít nhất 1 điều kiện trước khi lưu bộ lọc!');
          return;
        }
        const res = await this.saveFilter(name);
        if (res && res.status === 'success') {
          showToast(`Đã lưu bộ lọc '${name}' thành công!`, 'success');
          this.editingFilterId = null;
          this.editingFilterName = '';
          this.renderModal(container, onClose);
        } else {
          showToast('Lưu bộ lọc thất bại, vui lòng thử lại.', 'error');
        }
      });
    }

    // Update Existing Filter
    if (btnUpdateFilter && inpSaveName) {
      btnUpdateFilter.addEventListener('click', async () => {
        const name = inpSaveName.value.trim();
        if (!name) {
          alert('Vui lòng nhập tên cho bộ lọc!');
          return;
        }
        const res = await this.updateFilter(this.editingFilterId, name);
        if (res && res.status === 'success') {
          showToast(`Đã cập nhật bộ lọc '${name}' thành công!`, 'success');
          this.editingFilterId = null;
          this.editingFilterName = '';
          this.renderModal(container, onClose);
        } else {
          showToast('Cập nhật bộ lọc thất bại.', 'error');
        }
      });
    }

    // Cancel Edit
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => {
        this.editingFilterId = null;
        this.editingFilterName = '';
        this.renderModal(container, onClose);
      });
    }

    // Apply Managed Filter from list
    container.querySelectorAll('.btn-apply-managed-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const fId = Number(btn.getAttribute('data-filter-id')) || btn.getAttribute('data-filter-id');
        const f = this.managedFilters.find(x => String(x.id) === String(fId));
        if (f && Array.isArray(f.conditions)) {
          this.conditions = f.conditions.map((c, cIdx) => {
            const catalogItem = typeof c === 'string'
              ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c)
              : (c && c.id ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c.id) : null);
            if (catalogItem) {
              return { ...catalogItem, enabled: true };
            }
            if (c && typeof c === 'object') {
              return {
                id: c.id || `filter_cond_${fId}_${cIdx}`,
                name: c.name || `${c.field || 'Chỉ tiêu'} ${c.operator || '>='} ${c.displayValue || c.value}`,
                field: c.field,
                operator: c.operator || '>=',
                value: c.value,
                displayValue: c.displayValue || (c.value !== undefined ? String(c.value) : ''),
                timeScope: c.timeScope || 'latest',
                year: c.year || null,
                mode: c.mode || 'threshold',
                enabled: true
              };
            }
            return null;
          }).filter(Boolean);
          showToast(`Đã nạp tiêu chí của bộ lọc: ${f.name}`, 'info');
          updateUI();
        }
      });
    });

    // Edit Managed Filter from list
    container.querySelectorAll('.btn-edit-managed-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const fId = Number(btn.getAttribute('data-filter-id')) || btn.getAttribute('data-filter-id');
        const f = this.managedFilters.find(x => String(x.id) === String(fId));
        if (f) {
          this.editingFilterId = f.id;
          this.editingFilterName = f.name;
          if (Array.isArray(f.conditions)) {
            this.conditions = f.conditions.map(c => ({ ...c, enabled: true }));
          }
          this.renderModal(container, onClose);
          showToast(`Đang chỉnh sửa bộ lọc: ${f.name}. Hãy sửa các tiêu chí rồi bấm 'Cập nhật thay đổi'.`, 'info');
        }
      });
    });

    // Delete Managed Filter from list
    container.querySelectorAll('.btn-delete-managed-filter').forEach(btn => {
      btn.addEventListener('click', async () => {
        const fId = Number(btn.getAttribute('data-filter-id')) || btn.getAttribute('data-filter-id');
        const f = this.managedFilters.find(x => String(x.id) === String(fId));
        const filterName = f ? f.name : `ID: ${fId}`;
        if (!confirm(`Bạn có chắc chắn muốn xóa bộ lọc "${filterName}" không?`)) return;

        const res = await this.deleteFilter(fId);
        if (res && res.status === 'success') {
          showToast(`Đã xóa bộ lọc '${filterName}' thành công!`, 'success');
          if (String(this.editingFilterId) === String(fId)) {
            this.editingFilterId = null;
            this.editingFilterName = '';
          }
          await this.fetchManagedFilters();
          this.renderModal(container, onClose);
          if (typeof this.onManagedFiltersUpdated === 'function') {
            this.onManagedFiltersUpdated();
          }
        } else {
          showToast(res?.message || 'Xóa bộ lọc thất bại.', 'error');
        }
      });
    });

    // Add Custom Condition
    btnAdd.addEventListener('click', () => {
      const rawText = inpVal.value.trim();
      if (!rawText) {
        alert('Vui lòng nhập giá trị ngưỡng lọc (Ví dụ: <10%, >10% hoặc 15%)!');
        return;
      }

      const parsed = this.parseValueInput(rawText, selField.value, selOp.value);
      if (!parsed) {
        alert('Giá trị nhập vào không hợp lệ!');
        return;
      }

      const yrVal = selYear.value;
      const is10y = (yrVal === '10y_consecutive');

      this.conditions.push({
        id: 'cond_' + Date.now(),
        name: `${selField.value} ${parsed.operator} ${parsed.displayValue}`,
        field: selField.value,
        operator: parsed.operator,
        value: parsed.numericValue,
        displayValue: parsed.displayValue,
        timeScope: is10y ? '10y_consecutive' : (yrVal === 'latest' ? 'latest' : 'single_year'),
        year: (is10y || yrVal === 'latest') ? null : yrVal,
        enabled: true,
        mode: 'threshold'
      });

      inpVal.value = '';
      updateUI();
    });

    // Clear All
    btnClear.addEventListener('click', () => {
      this.conditions = [];
      updateUI();
    });

    // Preset chips
    container.querySelectorAll('.btn-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = Number(chip.getAttribute('data-preset-idx'));
        const p = this.presets[idx];
        if (p) {
          const rawConds = Array.isArray(p.conditions) ? p.conditions : (Array.isArray(p.conditionIds) ? p.conditionIds : []);
          this.conditions = rawConds.map((c, cIdx) => {
            const catalogItem = typeof c === 'string'
              ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c)
              : (c && c.id ? BENCHMARK_CRITERIA_CATALOG.find(cat => cat.id === c.id) : null);
            if (catalogItem) {
              return { ...catalogItem, enabled: true };
            }
            if (c && typeof c === 'object') {
              return {
                id: c.id || `preset_cond_${p.id || idx}_${cIdx}`,
                name: c.name || `${c.field || 'Chỉ tiêu'} ${c.operator || '>='} ${c.displayValue || c.value}`,
                field: c.field,
                operator: c.operator || '>=',
                value: c.value,
                displayValue: c.displayValue || (c.value !== undefined ? String(c.value) : ''),
                timeScope: c.timeScope || 'latest',
                year: c.year || null,
                mode: c.mode || 'threshold',
                enabled: true
              };
            }
            return null;
          }).filter(Boolean);
          showToast(`Đã nạp tiêu chí bộ lọc mẫu: ${p.name}`, 'info');
          updateUI();
        }
      });
    });

    // Apply Filter to main dashboard
    btnApply.addEventListener('click', () => {
      const matching = this.getMatchingBanks();
      this.onApplyFilter(matching, this.conditions);
      closeHandler();
    });

    this.attachDynamicListeners(container, updateUI, openFixCriteriaModal);
  }

  attachDynamicListeners(container, updateUI, openFixCriteriaModal = () => {}) {
    const refreshMatchingDisplay = () => {
      const matchContainer = container.querySelector('#matchingBanksContainer');
      const btnApply = container.querySelector('#btnApplyFilterBuilder');
      const matching = this.getMatchingBanks();
      if (matchContainer) {
        matchContainer.innerHTML = matching.length > 0
          ? matching.map(b => `<span class="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs shadow-2xs">${escapeHtml(b)}</span>`).join('')
          : `<span class="text-xs text-slate-500">Không có mã nào thỏa mãn toàn bộ tiêu chí trên.</span>`;
      }
      if (btnApply) {
        btnApply.textContent = `Áp dụng bộ lọc (${matching.length} mã)`;
      }
    };

    // Toggles
    container.querySelectorAll('.cond-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-cond-id');
        const c = this.conditions.find(x => x.id === id);
        if (c) {
          c.enabled = chk.checked;
          updateUI();
        }
      });
    });

    // Deletes
    container.querySelectorAll('.btn-delete-cond').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-cond-id');
        this.conditions = this.conditions.filter(x => x.id !== id);
        updateUI();
      });
    });

    // Super Admin Fix Criteria Buttons on Cards
    container.querySelectorAll('.btn-fix-criteria').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-crit-id');
        openFixCriteriaModal(cid);
      });
    });

    // Active Condition Operator Select
    container.querySelectorAll('.cond-op-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-cond-id');
        const c = this.conditions.find(x => x.id === id);
        if (c) {
          c.operator = sel.value;
          c.name = `${c.field} ${c.operator} ${c.displayValue}`;
          if (this.catalogOverrides[c.id]) {
            this.catalogOverrides[c.id].operator = sel.value;
          }
          updateUI();
        }
      });
    });

    // Active Condition Value Input
    container.querySelectorAll('.cond-val-input').forEach(inp => {
      const handleValChange = (e, isFinal = false) => {
        const id = inp.getAttribute('data-cond-id');
        const c = this.conditions.find(x => x.id === id);
        if (!c) return;

        const parsed = this.parseValueInput(inp.value, c.field, c.operator);
        if (parsed) {
          c.operator = parsed.operator;
          c.value = parsed.numericValue;
          c.displayValue = isFinal ? parsed.displayValue : inp.value;
          c.name = `${c.field} ${c.operator} ${parsed.displayValue}`;

          const row = inp.closest('[data-cond-id]');
          if (row) {
            const opSel = row.querySelector('.cond-op-select');
            if (opSel && opSel.value !== c.operator) opSel.value = c.operator;
          }

          if (this.catalogOverrides[c.id]) {
            this.catalogOverrides[c.id].operator = c.operator;
            this.catalogOverrides[c.id].value = c.value;
            this.catalogOverrides[c.id].displayValue = parsed.displayValue;
          }

          refreshMatchingDisplay();
          if (isFinal) updateUI();
        }
      };

      inp.addEventListener('input', (e) => handleValChange(e, false));
      inp.addEventListener('change', (e) => handleValChange(e, true));
      inp.addEventListener('blur', (e) => handleValChange(e, true));
    });

    // Active Condition Benchmark Select
    container.querySelectorAll('.cond-benchmark-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-cond-id');
        const c = this.conditions.find(x => x.id === id);
        if (c) {
          c.mode = sel.value;
          c.displayValue = (sel.value === 'industry_avg_higher') ? '> TB Ngành' : '< TB Ngành';
          c.name = `${c.field} ${c.displayValue}`;
          if (this.catalogOverrides[c.id]) {
            this.catalogOverrides[c.id].mode = sel.value;
            this.catalogOverrides[c.id].displayValue = c.displayValue;
          }
          updateUI();
        }
      });
    });

    // Active Condition Time Scope Select
    container.querySelectorAll('.cond-time-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-cond-id');
        const c = this.conditions.find(x => x.id === id);
        if (c) {
          const val = sel.value;
          if (val === '10y_consecutive') {
            c.timeScope = '10y_consecutive';
            c.year = null;
          } else if (val === 'latest') {
            c.timeScope = 'latest';
            c.year = null;
          } else {
            c.timeScope = 'single_year';
            c.year = val;
          }
          updateUI();
        }
      });
    });

    // Catalog item toggle button (+ Thêm / ✓ Đã thêm)
    container.querySelectorAll('.btn-catalog-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-crit-id');
        const existingIdx = this.conditions.findIndex(c => c && c.id === cId);
        if (existingIdx >= 0) {
          this.conditions.splice(existingIdx, 1);
        } else {
          const item = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === cId);
          if (item) {
            const override = this.catalogOverrides[cId] || {};
            const op = override.operator || item.operator || '<=';
            const val = (override.value !== undefined) ? override.value : item.value;
            const disp = override.displayValue || item.displayValue;
            const mode = override.mode || item.mode;

            this.conditions.push({
              ...item,
              operator: op,
              value: val,
              displayValue: disp,
              mode: mode,
              name: (mode === 'threshold') ? `${item.field} ${op} ${disp}` : item.name,
              enabled: true
            });
          }
        }
        updateUI();
      });
    });

    // Catalog operator select
    container.querySelectorAll('.catalog-op-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const cId = sel.getAttribute('data-crit-id');
        if (!this.catalogOverrides[cId]) this.catalogOverrides[cId] = {};
        this.catalogOverrides[cId].operator = sel.value;

        const c = this.conditions.find(x => x.id === cId);
        if (c) {
          c.operator = sel.value;
          c.name = `${c.field} ${c.operator} ${c.displayValue}`;
          updateUI();
        }
      });
    });

    // Catalog value input
    container.querySelectorAll('.catalog-val-input').forEach(inp => {
      const handleCatalogValChange = (e, isFinal = false) => {
        const cId = inp.getAttribute('data-crit-id');
        const item = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === cId);
        if (!item) return;

        const currentOp = (this.catalogOverrides[cId] && this.catalogOverrides[cId].operator) || item.operator || '<=';
        const parsed = this.parseValueInput(inp.value, item.field, currentOp);
        if (parsed) {
          if (!this.catalogOverrides[cId]) this.catalogOverrides[cId] = {};
          this.catalogOverrides[cId].operator = parsed.operator;
          this.catalogOverrides[cId].value = parsed.numericValue;
          this.catalogOverrides[cId].displayValue = isFinal ? parsed.displayValue : inp.value;

          const card = inp.closest('[data-crit-id]');
          if (card) {
            const opSel = card.querySelector('.catalog-op-select');
            if (opSel && opSel.value !== parsed.operator) opSel.value = parsed.operator;
          }

          const c = this.conditions.find(x => x.id === cId);
          if (c) {
            c.operator = parsed.operator;
            c.value = parsed.numericValue;
            c.displayValue = isFinal ? parsed.displayValue : inp.value;
            c.name = `${c.field} ${c.operator} ${parsed.displayValue}`;
            refreshMatchingDisplay();
            if (isFinal) updateUI();
          }
        }
      };

      inp.addEventListener('input', (e) => handleCatalogValChange(e, false));
      inp.addEventListener('change', (e) => handleCatalogValChange(e, true));
      inp.addEventListener('blur', (e) => handleCatalogValChange(e, true));
    });

    // Catalog benchmark select
    container.querySelectorAll('.catalog-benchmark-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const cId = sel.getAttribute('data-crit-id');
        if (!this.catalogOverrides[cId]) this.catalogOverrides[cId] = {};
        this.catalogOverrides[cId].mode = sel.value;
        this.catalogOverrides[cId].displayValue = (sel.value === 'industry_avg_higher') ? '> TB Ngành' : '< TB Ngành';

        const c = this.conditions.find(x => x.id === cId);
        if (c) {
          c.mode = sel.value;
          c.displayValue = this.catalogOverrides[cId].displayValue;
          c.name = `${c.field} ${c.displayValue}`;
          updateUI();
        }
      });
    });
  }
}
