/**
 * assets/js/pages/dashboard.js
 * Dashboard page coordinator: manages application state, filtering, sorting, CSV export,
 * and 12 Enterprise capabilities (RBAC, Single Report, Comparison, Filter Builder,
 * Backup/API, Audit History, Annual Updates, Horizon Slicing).
 * Rule: Zero mock data. Zero inline business logic. Zero emoji.
 */

import { showToast, exportToCSV } from '../core/helpers.js';
import { parseUploadedJSON } from '../core/data-loader.js';
import { mapFinancialData } from '../core/data-mapper.js';
import { generateAllFinancialRecords } from '../calculations/financial-calculations.js';
import { auth, ROLE_SUPERADMIN } from '../core/auth.js';
import { dataVersioning } from '../core/data-versioning.js';
import { apiManager } from '../core/api-manager.js';

import { renderHeader, updateHeaderStatus } from '../components/header.js';
import { renderOverview, updateOverviewCounts } from '../components/overview.js';
import { renderFilters, INDUSTRY_CONFIGS } from '../components/filters.js';
import { renderFinancialTable } from '../components/financial-table.js';
import { renderCalculationModal } from '../components/calculation-table.js';
import { renderChartSection, updateChartData, toggleChartVisibility } from '../components/charts.js';

import { renderSingleCompanyReport } from '../components/single-company-report.js';
import { renderCompanyComparison } from '../components/company-comparison.js';
import { CustomFilterBuilder } from '../components/custom-filter-builder.js';
import { renderBackupModal } from '../components/backup-modal.js';
import { renderAuditHistoryModal } from '../components/audit-history-modal.js';
import { renderAnnualUpdateModal } from '../components/annual-update-modal.js';
import { renderEditMetricModal } from '../components/edit-metric-modal.js';
import { initAdminDrawer, openAdminDrawer } from '../components/admin-drawer.js';

export class DashboardApp {
  constructor(rawJsonData, options = {}) {
    this.rawJson = rawJsonData;
    this.options = options;
    this.isSummaryChunk = Boolean(options.isSummaryChunk);
    this.currentIndustry = options.currentIndustry || 'NGAN_HANG';
    this.mappedData = null;
    this.allRecords = [];
    this.currentFilteredRecords = [];
    this.fieldMetaMap = {};

    this.activeTab = 'matrix'; // 'matrix' | 'single' | 'compare' | 'filter_builder' | 'backup' | 'audit' | 'annual'
    this.selectedSingleBank = 'VCB';
    this.isLoadingSingle = false;
    this.filterBuilderInstance = null;

    // Custom Financial Filter state
    this.customFilterActive = false;
    this.customFilterMatchingBanks = [];
    this.customFilterConditions = [];

    this.filterState = {
      startYear: null,
      endYear: null,
      loai: 'ALL',
      bank: 'ALL',
      field: 'ALL',
      search: '',
      showFormula: false,
      selectedBanks: [],
      selectedFields: []
    };

    this.sortState = {
      year: null,
      asc: false
    };

    // DOM containers
    this.containerHeader = document.getElementById('app-header');
    this.containerOverview = document.getElementById('overview-section');
    this.containerFilters = document.getElementById('filter-section');
    this.containerCharts = document.getElementById('chart-section');
    this.containerTable = document.getElementById('table-section');
    this.containerFormulaModal = document.getElementById('formula-modal-container');
    this.containerAdminDrawer = document.getElementById('admin-drawer-container');

    this.init();
  }

  init() {
    this.processData(this.rawJson);

    // Initialize Right-Side MayHem Admin Drawer
    if (this.containerAdminDrawer) {
      initAdminDrawer(this.containerAdminDrawer, {
        onLoginSuccess: (user) => {
          this.renderAll();
          showToast(`Chào mừng ${user.name} đã đăng nhập thành công vào Hệ thống Quản trị MayHem!`, 'success');
        },
        onLogout: () => {
          this.renderAll();
        },
        onOpenAudit: () => this.switchTab('audit'),
        onOpenAddYear: () => this.switchTab('annual'),
        onOpenBackup: () => this.switchTab('backup'),
        onOpenFilterBuilder: () => this.switchTab('filter_builder')
      });
    }

    this.renderAll();
    updateHeaderStatus('success', `Đã nạp ${this.allRecords.length} dòng dữ liệu (${this.mappedData.banks.length} ngân hàng)`);

    // Auto open Admin System drawer on the right if not logged in
    if (!auth.isLoggedIn()) {
      setTimeout(() => openAdminDrawer(), 500);
      showToast('Dữ liệu đang được bảo mật. Vui lòng đăng nhập Quản trị MayHem bên phải.', 'info');
    } else {
      showToast(`Hệ thống sẵn sàng: 29 ngân hàng, giai đoạn ${this.mappedData.years[0]} - ${this.mappedData.years[this.mappedData.years.length - 1]}`);
    }
  }

  processData(jsonData) {
    this.rawJson = jsonData;
    if (!dataVersioning.getBaseline()) {
      dataVersioning.setBaseline(jsonData);
    }
    this.mappedData = mapFinancialData(jsonData);
    const { allRecords, fieldMetaMap } = generateAllFinancialRecords(this.mappedData);
    this.allRecords = allRecords;
    this.fieldMetaMap = fieldMetaMap;

    // Set default years range if not set
    if (!this.filterState.startYear) {
      this.filterState.startYear = this.mappedData.years[0];
    }
    if (!this.filterState.endYear) {
      this.filterState.endYear = this.mappedData.years[this.mappedData.years.length - 1];
    }

    this.currentFilteredRecords = [...allRecords];

    // Initialize custom filter builder instance
    this.filterBuilderInstance = new CustomFilterBuilder({
      allRecords: this.allRecords,
      years: this.mappedData.years,
      banks: this.mappedData.banks,
      rawFields: this.mappedData.rawFields,
      fieldMetaMap: this.fieldMetaMap,
      industry: this.currentIndustry || 'NGAN_HANG',
      onApplyFilter: (matchingBanks, conditions) => {
        this.customFilterActive = true;
        this.customFilterMatchingBanks = [...matchingBanks];
        this.customFilterConditions = [...conditions];
        this.filterState.selectedBanks = [...matchingBanks];
        showToast(`Đã áp dụng bộ lọc: Sàng lọc được ${matchingBanks.length} ngân hàng thỏa mãn.`);
        this.switchTab('matrix');
        this.applyFilterAndSort();
      }
    });
  }

  getEffectiveYears() {
    const allY = this.mappedData.years;
    const start = this.filterState.startYear || allY[0];
    const end = this.filterState.endYear || allY[allY.length - 1];
    return allY.filter(y => y >= start && y <= end);
  }

  renderAll() {
    // 1. Render Header
    renderHeader(this.containerHeader, {
      onOpenAdminDrawer: () => {
        openAdminDrawer();
      },
      onOpenEditMetricModal: () => {
        this.openEditMetricModal();
      },
      onRefreshData: () => {
        this.refreshData();
      },
      onIndustryChange: (newIndustry) => {
        this.currentIndustry = newIndustry;
        if (this.filterBuilderInstance) {
          this.filterBuilderInstance.currentIndustry = newIndustry;
          this.filterBuilderInstance.fetchManagedFilters();
        }
        if (this.filtersInstance && typeof this.filtersInstance.setIndustry === 'function') {
          this.filtersInstance.setIndustry(newIndustry);
        }
        showToast(`Đã chuyển sang Ngành: ${newIndustry}. Giao diện bộ lọc đã cập nhật theo ngành!`, 'info');
      },
      onToggleChart: () => {
        toggleChartVisibility(this.currentFilteredRecords, this.getEffectiveYears(), this.filterState);
      },
      onToggleFormulaDrawer: () => {
        renderCalculationModal(this.containerFormulaModal);
      },
      onExportCSV: () => {
        this.exportCSV();
      },
      onUploadJSON: (file) => {
        this.handleFileUpload(file);
      },
      onRoleChange: (newRole) => {
        showToast(`Đã chuyển sang ${auth.getRoleMeta().name}`);
        // Re-render header to refresh export button state
        this.renderAll();
      },
      onNavTabChange: (tab) => {
        this.switchTab(tab);
      }
    });

    // 2. Overview Section disabled per user request
    if (this.containerOverview) {
      this.containerOverview.innerHTML = '';
      this.containerOverview.style.display = 'none';
    }

    // 3. Render Filters with Industry configuration support
    this.filtersInstance = renderFilters(this.containerFilters, {
      industry: this.currentIndustry || 'NGAN_HANG',
      banks: this.mappedData.banks,
      rawFields: this.mappedData.rawFields,
      years: this.mappedData.years,
      filterBuilderInstance: this.filterBuilderInstance,
      onOpenFilterBuilder: () => {
        this.switchTab('filter_builder');
      },
      onApplyCustomFilter: (matchingBanks, conditions, filterName) => {
        if (conditions && conditions.length > 0) {
          this.customFilterActive = true;
          this.customFilterMatchingBanks = [...matchingBanks];
          this.customFilterConditions = [...conditions];
        } else {
          this.customFilterActive = false;
          this.customFilterMatchingBanks = [];
          this.customFilterConditions = [];
        }
        this.applyFilterAndSort();
      }
    }, (newFilters) => {
      this.filterState = { ...this.filterState, ...newFilters };
      if (newFilters.industry) this.currentIndustry = newFilters.industry;
      this.applyFilterAndSort();
    });

    // 4. Render Chart Section
    renderChartSection(this.containerCharts);

    // 5. Render Active View Content
    this.renderCurrentView();
  }

  switchTab(tab) {
    this.activeTab = tab;

    // Control visibility of default matrix widgets
    const isMatrix = (tab === 'matrix');
    if (this.containerOverview) this.containerOverview.style.display = 'none';
    if (this.containerCharts) this.containerCharts.style.display = isMatrix ? 'block' : 'none';
    if (this.containerFilters) this.containerFilters.style.display = isMatrix ? 'block' : 'none';

    // Synchronize navigation button active classes in header
    const navButtons = this.containerHeader.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      const bTab = btn.getAttribute('data-tab');
      if (bTab === tab) {
        btn.className = 'nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white transition shadow-sm';
      } else {
        btn.className = 'nav-tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-2xs';
      }
    });

    this.renderCurrentView();

    // When switching to Single Report tab, trigger background sync for the selected bank
    if (tab === 'single') {
      this.loadSingleBankData(this.selectedSingleBank).then(() => {
        if (this.activeTab === 'single') {
          this.renderCurrentView();
        }
      });
    }
  }

  async loadSingleBankData(bankCode) {
    if (!bankCode) return;
    this.isLoadingSingle = true;
    updateHeaderStatus('loading', `Đang tải số liệu BCTC ${bankCode}...`);

    try {
      const apiBase = (typeof window !== 'undefined' && window.LARAVEL_API_BASE)
        ? window.LARAVEL_API_BASE.replace(/\/+$/, '')
        : '';
      const url = `${apiBase}/api/v1/financial-reports/${encodeURIComponent(bankCode)}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.records) && json.records.length > 0) {
          const years = (json.years || this.mappedData.years).map(y => String(y));

          if (!this.mappedData.bankFinancials[bankCode]) {
            this.mappedData.bankFinancials[bankCode] = {};
          }
          years.forEach(y => {
            if (!this.mappedData.bankFinancials[bankCode][y]) {
              this.mappedData.bankFinancials[bankCode][y] = {};
            }
          });

          json.records.forEach(row => {
            const f = row['Chỉ tiêu'] || row.field;
            const vals = row.values || {};
            if (f) {
              years.forEach(y => {
                const rawVal = (vals[y] !== undefined) ? vals[y] : row[y];
                if (rawVal !== undefined) {
                  this.mappedData.bankFinancials[bankCode][y][f] = (rawVal === null || rawVal === '') ? null : Number(rawVal);
                }
              });
            }
          });

          // Re-generate all 46 metrics for accuracy across all tabs & single factsheet
          const { allRecords, fieldMetaMap } = generateAllFinancialRecords(this.mappedData);
          this.allRecords = allRecords;
          this.fieldMetaMap = fieldMetaMap;
          this.currentFilteredRecords = [...allRecords];

          updateHeaderStatus('success', `Đã đồng bộ số liệu ${bankCode} (${json.total_indicators || json.records.length} chỉ tiêu)`);
          showToast(`Đã nạp thành công số liệu BCTC ${bankCode}!`, 'success');
        }
      } else {
        console.warn(`Không thể nạp factsheet cho mã ${bankCode}: HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(`Lỗi khi nạp factsheet cho mã ${bankCode}:`, err);
    } finally {
      this.isLoadingSingle = false;
    }
  }

  async updateMetricValue(payload) {
    const { bank, field, year, newValue, note = 'Cập nhật số liệu sau kiểm toán' } = payload;
    const yStr = String(year);

    // 1. Update in allRecords
    const rec = this.allRecords.find(r => r.bank === bank && r.field === field);
    let oldVal = null;
    if (rec && rec.values) {
      oldVal = rec.values[yStr];
      rec.values[yStr] = newValue;
      rec[yStr] = newValue;
    }

    // 2. Update in mappedData.bankFinancials
    if (this.mappedData && this.mappedData.bankFinancials && this.mappedData.bankFinancials[bank]) {
      if (!this.mappedData.bankFinancials[bank][yStr]) {
        this.mappedData.bankFinancials[bank][yStr] = {};
      }
      this.mappedData.bankFinancials[bank][yStr][field] = newValue;
    }

    // 3. Record in local dataVersioning audit log
    const auditEntry = dataVersioning.recordChange({
      bank,
      field,
      year: yStr,
      oldValue: oldVal,
      newValue,
      userRole: auth.getUser()?.name || auth.getRoleMeta().name || 'Super Admin',
      note
    });

    // 4. Re-calculate all 46 metrics for matrix & single factsheet
    const { allRecords, fieldMetaMap } = generateAllFinancialRecords(this.mappedData);
    this.allRecords = allRecords;
    this.fieldMetaMap = fieldMetaMap;
    this.currentFilteredRecords = [...allRecords];

    // 5. Call Backend API with Auth Token
    try {
      const res = await fetch('/api/v1/financial-reports/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
        body: JSON.stringify({
          bank,
          field,
          year: yStr,
          value: newValue
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.audit_log_id && auditEntry) {
          auditEntry.log_id = json.audit_log_id;
          dataVersioning.saveAuditLog();
        }
      }
    } catch (e) {
      console.warn('[Audit] Không thể đồng bộ thay đổi về máy chủ:', e.message);
    }

    this.applyFilterAndSort();
    showToast(`Đã cập nhật ${bank} - ${field} (${yStr}) = ${newValue}. Đã lưu vết vào Nhật Ký Kiểm Toán!`, 'success');
  }

  openEditMetricModal(options = {}) {
    this.containerFormulaModal.innerHTML = '';
    renderEditMetricModal(this.containerFormulaModal, {
      banks: this.mappedData.banks,
      years: this.mappedData.years,
      allRecords: this.allRecords,
      fieldMetaMap: this.fieldMetaMap,
      initialBank: options.bank || this.selectedSingleBank || (this.mappedData.banks[0] || 'VCB'),
      initialField: options.field || '',
      initialYear: options.year || this.filterState.endYear || (this.mappedData.years[this.mappedData.years.length - 1] || '2025'),
      onSave: async (payload) => {
        await this.updateMetricValue(payload);
        this.renderCurrentView();
      },
      onOpenAuditLog: () => {
        this.switchTab('audit');
      },
      onClose: () => {}
    });
  }

  async rollbackMetricValue(entry) {
    if (!entry || entry.oldValue === null || entry.oldValue === undefined) {
      showToast('Bản ghi này không có giá trị cũ để phục hồi.', 'error');
      return;
    }

    const { bank, field, year, oldValue, newValue } = entry;
    const yStr = String(year);

    // 1. Revert in allRecords
    const rec = this.allRecords.find(r => r.bank === bank && r.field === field);
    if (rec && rec.values) {
      rec.values[yStr] = oldValue;
      rec[yStr] = oldValue;
    }

    // 2. Revert in mappedData.bankFinancials
    if (this.mappedData && this.mappedData.bankFinancials && this.mappedData.bankFinancials[bank]) {
      if (!this.mappedData.bankFinancials[bank][yStr]) {
        this.mappedData.bankFinancials[bank][yStr] = {};
      }
      this.mappedData.bankFinancials[bank][yStr][field] = oldValue;
    }

    // 3. Rollback in dataVersioning
    dataVersioning.rollbackEntry(entry.id || entry.log_id, this.allRecords);

    // 4. Re-calculate all 46 metrics
    const { allRecords, fieldMetaMap } = generateAllFinancialRecords(this.mappedData);
    this.allRecords = allRecords;
    this.fieldMetaMap = fieldMetaMap;
    this.currentFilteredRecords = [...allRecords];

    // 5. Sync rollback to Backend API asynchronously in background (do not block UI)
    fetch('/api/v1/financial-reports/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
      body: JSON.stringify({
        bank,
        field,
        year: yStr,
        value: oldValue,
        is_rollback: true,
        action: 'ROLLBACK'
      })
    }).catch(e => {
      console.warn('[Rollback] Không thể đồng bộ phục hồi về máy chủ:', e.message);
    });

    this.applyFilterAndSort();

    // Re-render underlying views only if not currently in audit modal to prevent tearing
    if (this.activeTab === 'matrix') {
      this.renderTableComponent();
    } else if (this.activeTab === 'single') {
      this.renderCurrentView();
    }

    showToast(`Đã phục hồi thành công số liệu ${bank} - ${field} (${yStr}) về ${oldValue}!`, 'success');
  }

  hydrateFullHistory(fullDataset) {
    if (!fullDataset || !fullDataset.metadata) return;
    this.rawJson = fullDataset;
    this.mappedData = mapFinancialData(fullDataset);
    const { allRecords, fieldMetaMap } = generateAllFinancialRecords(this.mappedData);
    this.allRecords = allRecords;
    this.fieldMetaMap = fieldMetaMap;
    this.isSummaryChunk = false;

    if (!this.filterState.startYear || this.filterState.startYear > this.mappedData.years[0]) {
      this.filterState.startYear = this.mappedData.years[0];
    }
    this.filterState.endYear = this.mappedData.years[this.mappedData.years.length - 1];

    this.currentFilteredRecords = [...allRecords];
    if (this.filtersInstance && typeof this.filtersInstance.updateYears === 'function') {
      this.filtersInstance.updateYears(this.mappedData.years);
    }
    this.applyFilterAndSort();
    updateHeaderStatus('success', `Đã đồng bộ toàn bộ 10 năm (${this.allRecords.length} dòng dữ liệu, ${this.mappedData.banks.length} mã)`);
  }

  async refreshData() {
    updateHeaderStatus('loading', 'Đang làm mới số liệu...');
    try {
      const { loadFinancialData } = await import('../core/data-loader.js');
      const result = await loadFinancialData(this.currentIndustry || 'NGAN_HANG', { horizon: 'full', forceRefresh: true });
      this.hydrateFullHistory(result.data);
      showToast('Đã làm mới số liệu tài chính mới nhất từ server thành công!', 'success');
    } catch (e) {
      showToast('Làm mới số liệu thất bại: ' + e.message, 'error');
      updateHeaderStatus('error', 'Lỗi làm mới');
    }
  }

  renderCurrentView() {
    const effectiveYears = this.getEffectiveYears();

    switch (this.activeTab) {
      case 'matrix':
        this.renderTableComponent();
        break;

      case 'single':
        renderSingleCompanyReport(this.containerTable, {
          banks: this.mappedData.banks,
          years: effectiveYears,
          allRecords: this.allRecords,
          fieldMetaMap: this.fieldMetaMap,
          selectedBank: this.selectedSingleBank,
          isLoading: this.isLoadingSingle,
          onOpenEditMetric: (opts) => {
            this.openEditMetricModal(opts);
          },
          onSelectBank: async (b) => {
            if (this.selectedSingleBank === b && !this.isLoadingSingle) return;
            this.selectedSingleBank = b;
            this.isLoadingSingle = true;
            this.renderCurrentView(); // Immediate UI feedback with selected bank and loading badge

            await this.loadSingleBankData(b);
            if (this.activeTab === 'single') {
              this.renderCurrentView();
            }
          },
          onBackToMain: () => {
            this.switchTab('matrix');
          }
        });
        break;

      case 'compare':
        renderCompanyComparison(this.containerTable, {
          banks: this.mappedData.banks,
          years: effectiveYears,
          allRecords: this.allRecords,
          fieldMetaMap: this.fieldMetaMap,
          rawFields: this.mappedData.rawFields,
          selectedBanks: ['VCB', 'BID', 'CTG', 'TCB', 'VPB', 'MBB'],
          selectedField: 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
          onBackToMain: () => {
            this.switchTab('matrix');
          }
        });
        break;

      case 'filter_builder':
        this.containerFormulaModal.innerHTML = '';
        this.filterBuilderInstance.renderModal(this.containerFormulaModal, () => {
          this.switchTab('matrix');
        });
        break;

      case 'backup':
        this.containerFormulaModal.innerHTML = '';
        renderBackupModal(this.containerFormulaModal, {
          fullDataset: this.rawJson,
          customFilters: this.filterBuilderInstance ? this.filterBuilderInstance.conditions : [],
          onRestoreData: (restoredJson) => {
            this.processData(restoredJson);
            this.renderAll();
            showToast('Đã khôi phục dữ liệu từ bản sao lưu thành công!');
          },
          onClose: () => {
            this.switchTab('matrix');
          }
        });
        break;

      case 'audit':
        this.containerFormulaModal.innerHTML = '';
        renderAuditHistoryModal(this.containerFormulaModal, {
          onRollback: async (entry) => {
            await this.rollbackMetricValue(entry);
          },
          onResetBaseline: () => {
            const baseline = dataVersioning.getBaseline() || this.rawJson;
            if (baseline) {
              const freshCopy = JSON.parse(JSON.stringify(baseline));
              this.processData(freshCopy);
              dataVersioning.recordChange({
                bank: 'ALL',
                field: 'TAT_CA_CHI_TIEU',
                year: 'ALL',
                oldValue: null,
                newValue: null,
                userRole: auth.getUser()?.name || 'Super Admin',
                note: 'Khôi phục toàn bộ dữ liệu 29 ngân hàng về nguyên bản gốc ban đầu (Reset Baseline)'
              });
              this.applyFilterAndSort();
              showToast('Đã phục hồi toàn bộ dữ liệu 29 ngân hàng về trạng thái gốc ban đầu!', 'success');
            } else {
              showToast('Không tìm thấy dữ liệu gốc để phục hồi.', 'error');
            }
          },
          onOpenEdit: () => {
            this.openEditMetricModal();
          },
          onClose: () => {
            this.switchTab('matrix');
          }
        });
        break;

      case 'annual':
        this.containerFormulaModal.innerHTML = '';
        renderAnnualUpdateModal(this.containerFormulaModal, {
          banks: this.mappedData.banks,
          years: this.mappedData.years,
          rawFields: this.mappedData.rawFields,
          allRecords: this.allRecords,
          onAddNewYear: async (newYear) => {
            if (!this.mappedData.years.includes(newYear)) {
              this.mappedData.years.push(newYear);
              this.filterState.endYear = newYear;
              // Add blank entries in allRecords for the new year
              this.allRecords.forEach(r => {
                if (r.values) r.values[newYear] = null;
              });
              dataVersioning.recordChange({
                bank: 'ALL',
                field: 'KHUNG_NAM',
                year: newYear,
                oldValue: null,
                newValue: newYear,
                userRole: auth.getUser()?.name || 'Super Admin',
                note: `Mở rộng niên độ thêm năm ${newYear}`
              });
              
              // Call Backend API with Auth Token
              try {
                await fetch('/api/v1/financial-reports/new-year', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
                  body: JSON.stringify({ year: newYear })
                });
              } catch (e) {}

              this.renderAll();
              showToast(`Đã mở rộng khung năm thêm năm ${newYear} thành công!`, 'success');
            }
          },
          onUpdateValue: async (payload) => {
            await this.updateMetricValue(payload);
          },
          onOpenAuditLog: () => {
            this.switchTab('audit');
          },
          onClose: () => {
            this.switchTab('matrix');
          }
        });
        break;

      default:
        this.renderTableComponent();
    }
  }

  renderTableComponent() {
    if (!auth.isLoggedIn()) {
      this.containerTable.innerHTML = `
        <div class="py-14 px-6 text-center max-w-xl mx-auto rounded-2xl bg-white border border-rose-200 shadow-sm my-8 flex flex-col items-center gap-4 text-slate-800">
          <div class="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">Admin System MayHem</span>
            <h3 class="text-lg sm:text-xl font-bold text-slate-900 mt-2">Dữ Liệu Báo Cáo Tài Chính Đang Bị Khóa</h3>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Hệ thống yêu cầu đăng nhập tài khoản Quản trị MayHem ở bảng bên phải để xác thực phân quyền xem, lọc và xuất dữ liệu 29 ngân hàng.
            </p>
          </div>
          <button id="btnTableUnlockMayHem" type="button" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-2xs transition flex items-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
            <span>Mở Bảng Đăng Nhập Quản Trị MayHem (Bên Phải)</span>
          </button>
        </div>
      `;
      const btnUnlock = this.containerTable.querySelector('#btnTableUnlockMayHem');
      if (btnUnlock) btnUnlock.addEventListener('click', () => openAdminDrawer());
      return;
    }

    const effectiveYears = this.getEffectiveYears();

    if (this.currentFilteredRecords.length === 0 && this.currentIndustry !== 'NGAN_HANG') {
      const config = INDUSTRY_CONFIGS[this.currentIndustry];
      const indName = config ? `${config.name} (${(config.tickers || []).length} mã: ${(config.quickTickers || []).join(', ')})` : this.currentIndustry;
      this.containerTable.innerHTML = `
        <div class="py-12 px-6 text-center max-w-2xl mx-auto rounded-2xl bg-white border border-blue-200 shadow-sm my-6 flex flex-col items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              Cấu Hình Bộ Lọc Ngành Sẵn Sàng
            </span>
            <h3 class="text-base sm:text-lg font-bold text-slate-900 mt-2">
              Đang áp dụng bộ lọc nhóm ngành: ${indName}
            </h3>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Giao diện bộ lọc (mã cổ phiếu, chỉ tiêu tài chính, tiêu chí chuẩn hóa) đã được đồng bộ riêng cho ngành này. Bạn có thể lưu cấu hình bộ lọc, tạo thêm điều kiện lọc tùy chọn hoặc nạp file dữ liệu báo cáo tài chính của ngành qua nút "Cập Nhật Năm Mới / Nạp File".
            </p>
          </div>
          <button id="btnSwitchBackToBank" type="button" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            <span>Quay lại Xem Dữ Liệu Báo Cáo 29 Ngân Hàng</span>
          </button>
        </div>
      `;
      const btnBack = this.containerTable.querySelector('#btnSwitchBackToBank');
      if (btnBack) {
        btnBack.addEventListener('click', () => {
          const headerSel = document.getElementById('headerIndustrySelector');
          if (headerSel) {
            headerSel.value = 'NGAN_HANG';
            headerSel.dispatchEvent(new Event('change'));
          }
        });
      }
      return;
    }

    // Render active custom filter banner when filter is active
    let bannerHtml = '';
    if (this.customFilterActive) {
      bannerHtml = `
        <div id="activeCustomFilterBanner" class="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-slate-800 shadow-2xs flex items-center justify-between flex-wrap gap-3 mb-4">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span class="text-xs font-bold text-slate-900">
              Đang áp dụng Bộ lọc tài chính: 
              <span class="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs ml-1 font-bold">${this.customFilterMatchingBanks.length}/${this.mappedData.banks.length} ngân hàng thỏa mãn</span>
            </span>
            <div class="flex items-center gap-1.5 flex-wrap">
              ${this.customFilterMatchingBanks.length > 0 
                ? this.customFilterMatchingBanks.map(b => `<span class="px-2 py-0.5 rounded bg-white text-blue-700 border border-blue-200 font-mono font-bold text-xs shadow-2xs">${b}</span>`).join('')
                : `<span class="text-xs text-amber-700 font-medium italic">Không có ngân hàng nào thỏa mãn điều kiện lọc.</span>`
              }
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button id="btnEditActiveFilter" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 transition shadow-2xs flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              <span>Sửa tiêu chí</span>
            </button>
            <button id="btnClearActiveFilter" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-2xs flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span>Bỏ lọc (Hiện tất cả ${this.mappedData.banks.length} NH)</span>
            </button>
          </div>
        </div>
      `;
    }

    renderFinancialTable(this.containerTable, {
      records: this.currentFilteredRecords,
      years: effectiveYears,
      fieldMetaMap: this.fieldMetaMap,
      showFormula: this.filterState.showFormula,
      sortYear: this.sortState.year,
      sortAsc: this.sortState.asc,
      topBannerHtml: bannerHtml,
      onSort: (year) => {
        this.handleSort(year);
      },
      onEditMetric: (opts) => {
        this.openEditMetricModal(opts);
      }
    });

    const btnEdit = this.containerTable.querySelector('#btnEditActiveFilter');
    const btnClear = this.containerTable.querySelector('#btnClearActiveFilter');
    if (btnEdit) btnEdit.addEventListener('click', () => this.switchTab('filter_builder'));
    if (btnClear) btnClear.addEventListener('click', () => {
      this.customFilterActive = false;
      this.customFilterMatchingBanks = [];
      this.applyFilterAndSort();
      showToast('Đã bỏ bộ lọc, hiển thị lại toàn bộ 29 ngân hàng.', 'info');
    });
  }

  applyFilterAndSort() {
    const { loai, bank, field, search, selectedBanks, selectedFields } = this.filterState;
    const query = (search || '').toLowerCase().trim();

    let filtered = this.allRecords.filter(item => {
      // Filter by Loại
      if (loai !== 'ALL' && item.loai !== loai) return false;

      // Filter by Custom Banking Filter if active
      if (this.customFilterActive) {
        if (!this.customFilterMatchingBanks.includes(item.bank)) return false;
      } else {
        // Filter by Bank: use multi-select checkboxes if active
        if (selectedBanks && selectedBanks.length > 0 && selectedBanks.length < this.mappedData.banks.length) {
          if (!selectedBanks.includes(item.bank)) return false;
        } else if (bank !== 'ALL' && item.bank !== bank) {
          return false;
        }
      }

      // Filter by Field: use multi-select checkboxes if active
      const totalFieldsCount = Object.keys(this.fieldMetaMap).length;
      if (selectedFields && selectedFields.length > 0 && selectedFields.length < totalFieldsCount) {
        if (!selectedFields.includes(item.field)) return false;
      } else if (field !== 'ALL' && item.field !== field) {
        return false;
      }

      // Filter by Search Query
      if (query) {
        const matchBank = item.bank.toLowerCase().includes(query);
        const matchField = item.field.toLowerCase().includes(query);
        const matchFormula = (item.formula_code || '').toLowerCase().includes(query);
        if (!matchBank && !matchField && !matchFormula) return false;
      }
      return true;
    });

    // Apply Sorting if active
    if (this.sortState.year) {
      const y = this.sortState.year;
      const isAsc = this.sortState.asc;
      filtered.sort((a, b) => {
        const vA = a.values ? a.values[y] : null;
        const vB = b.values ? b.values[y] : null;
        if (vA === null || vA === undefined) return 1;
        if (vB === null || vB === undefined) return -1;
        return isAsc ? (vA - vB) : (vB - vA);
      });
    }

    this.currentFilteredRecords = filtered;

    if (this.activeTab === 'matrix') {
      this.renderTableComponent();
    }

    // Update Overview & Chart
    updateOverviewCounts(this.currentFilteredRecords.length, this.getFilterStatusDescription());
    updateChartData(this.currentFilteredRecords, this.getEffectiveYears(), this.filterState);
  }

  handleSort(year) {
    if (this.sortState.year === year) {
      this.sortState.asc = !this.sortState.asc;
    } else {
      this.sortState.year = year;
      this.sortState.asc = false; // default descending for financial metrics
    }
    showToast(`Đã sắp xếp theo năm ${year} (${this.sortState.asc ? 'Tăng dần' : 'Giảm dần'})`);
    this.applyFilterAndSort();
  }

  getFilterStatusDescription() {
    const { loai, bank, field, search, selectedBanks, selectedFields, startYear, endYear } = this.filterState;
    const parts = [];

    if (this.customFilterActive) {
      parts.push(`Bộ lọc tài chính: ${this.customFilterMatchingBanks.length}/${this.mappedData.banks.length} NH`);
    }

    if (startYear && endYear && (startYear !== this.mappedData.years[0] || endYear !== this.mappedData.years[this.mappedData.years.length - 1])) {
      parts.push(`Năm: ${startYear} - ${endYear}`);
    }

    if (loai !== 'ALL') parts.push(`Loại: ${loai}`);

    if (!this.customFilterActive) {
      if (selectedBanks && selectedBanks.length > 0 && selectedBanks.length < this.mappedData.banks.length) {
        parts.push(`Chọn ${selectedBanks.length} NH`);
      } else if (bank !== 'ALL') {
        parts.push(`NH: ${bank}`);
      }
    }

    const totalFieldsCount = Object.keys(this.fieldMetaMap).length;
    if (selectedFields && selectedFields.length > 0 && selectedFields.length < totalFieldsCount) {
      parts.push(`Chọn ${selectedFields.length} chỉ tiêu`);
    } else if (field !== 'ALL') {
      parts.push(`Chỉ tiêu: ${field}`);
    }

    if (search) parts.push(`Từ khóa: "${search}"`);

    if (parts.length === 0) return `Hiển thị toàn bộ ${totalFieldsCount || 46} chỉ tiêu báo cáo`;
    return parts.join(' | ');
  }

  exportCSV() {
    if (!auth.isLoggedIn()) {
      showToast('Vui lòng đăng nhập Hệ thống Quản trị MayHem bên phải để tải dữ liệu.', 'error');
      openAdminDrawer();
      return;
    }

    if (!auth.canExport()) {
      showToast('Tài khoản của bạn chỉ có quyền xem và sửa dữ liệu. Không được tải dữ liệu (Chính sách phân quyền Cấp 3).', 'error');
      return;
    }

    if (!this.currentFilteredRecords || this.currentFilteredRecords.length === 0) {
      showToast('Không có dữ liệu để xuất Excel.');
      return;
    }

    const effectiveYears = this.getEffectiveYears();
    const headers = ['Loại', 'Mã Ngân Hàng', 'Chỉ tiêu tài chính', 'Công thức đối chiếu', ...effectiveYears];
    const rows = this.currentFilteredRecords.map(item => {
      const row = [
        item.loai,
        item.bank,
        item.field,
        item.formula_code || ''
      ];
      effectiveYears.forEach(y => {
        const val = item.values ? item.values[y] : null;
        row.push(val !== null && val !== undefined ? val : '');
      });
      return row;
    });

    const bankSuffix = this.filterState.bank !== 'ALL' ? `_${this.filterState.bank}` : '_AllBanks';
    const filename = `BaoCao_TaiChinh_NganHang${bankSuffix}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCSV(filename, headers, rows);
    showToast('Đã xuất thành công file Excel / CSV UTF-8!');
  }

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseUploadedJSON(e.target.result);
        this.processData(parsed);
        this.renderAll();
        showToast(`Đã nạp file ${file.name} thành công!`);
      } catch (err) {
        showToast(err.message);
      }
    };
    reader.readAsText(file);
  }
}
