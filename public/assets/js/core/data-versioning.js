/**
 * assets/js/core/data-versioning.js
 * Manages Data Audit Log, Versioning, Rollback, and Backup/Restore Snapshots.
 * Rule: Zero emoji.
 */

import { auth } from './auth.js';

const AUDIT_STORAGE_KEY = 'financial_audit_log_records';
const BASELINE_CACHE_KEY = 'financial_dataset_baseline_copy';

class DataVersioningManager {
  constructor() {
    this.auditLog = this.loadAuditLog();
    this.baselineJson = null;
    this.currentData = null;
    this.changeListeners = [];
  }

  setBaseline(originalJson) {
    if (originalJson) {
      if (!this.baselineJson) {
        try {
          this.baselineJson = JSON.parse(JSON.stringify(originalJson));
        } catch (e) {
          this.baselineJson = originalJson;
        }
      }
      try {
        sessionStorage.setItem(BASELINE_CACHE_KEY, JSON.stringify(originalJson));
      } catch (e) {}
    }
  }

  getBaseline() {
    if (this.baselineJson) return this.baselineJson;
    try {
      const cached = sessionStorage.getItem(BASELINE_CACHE_KEY);
      if (cached) {
        this.baselineJson = JSON.parse(cached);
        return this.baselineJson;
      }
    } catch (e) {}
    return null;
  }

  loadAuditLog() {
    try {
      const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
      const list = saved ? JSON.parse(saved) : [];
      return this.sanitizeLog(list);
    } catch (e) {
      return [];
    }
  }

  sanitizeLog(list) {
    if (!Array.isArray(list)) return [];
    return list;
  }

  saveAuditLog() {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.auditLog));
    } catch (e) {}
    this.notifyListeners();
  }

  recordChange({ bank, field, year, oldValue, newValue, userRole = 'Editor', note = '', action = 'UPDATE' }) {
    const entry = {
      id: 'edit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString('vi-VN'),
      userRole,
      bank,
      field,
      year: String(year),
      oldValue,
      newValue,
      note,
      action,
      rolledBack: (action === 'ROLLBACK' || bank === 'ALL'),
      isReverted: (action === 'ROLLBACK' || bank === 'ALL')
    };

    this.auditLog.unshift(entry);
    if (this.auditLog.length > 500) {
      this.auditLog = this.auditLog.slice(0, 500);
    }
    this.saveAuditLog();
    return entry;
  }

  recordEdit({ bank, field, year, oldVal, newVal, oldValue, newValue, userRole, note }) {
    return this.recordChange({
      bank,
      field,
      year: String(year),
      oldValue: (oldValue !== undefined) ? oldValue : (oldVal !== undefined ? oldVal : null),
      newValue: (newValue !== undefined) ? newValue : (newVal !== undefined ? newVal : null),
      userRole: userRole || auth.getUser()?.name || auth.getRoleMeta().name,
      note: note || 'Cập nhật số liệu sau kiểm toán',
      action: 'UPDATE'
    });
  }

  async fetchRemoteAuditLogs() {
    try {
      const res = await fetch('/api/v1/audit-logs', {
        headers: { 'Accept': 'application/json', ...auth.getAuthHeaders() }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          json.data.forEach(item => {
            const exists = this.auditLog.some(e => e.id === item.log_id || e.id === String(item.id) || (e.bank === item.bank && e.field === item.field && String(e.year) === String(item.year) && Math.abs(new Date(e.timestamp) - new Date(item.created_at)) < 2000));
            if (!exists && item.bank && item.field) {
              const isRollback = (item.action === 'ROLLBACK' || item.action === 'ROLLED_BACK');
              this.auditLog.push({
                id: item.log_id || ('audit_' + item.id),
                dbId: item.id,
                log_id: item.log_id,
                timestamp: item.created_at || new Date().toISOString(),
                formattedTime: item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
                userRole: item.user_role || 'Verified Auditor',
                bank: item.bank,
                field: item.field,
                year: String(item.year),
                oldValue: item.old_value !== null && item.old_value !== undefined ? Number(item.old_value) : null,
                newValue: item.new_value !== null && item.new_value !== undefined ? Number(item.new_value) : null,
                action: item.action || 'UPDATE',
                rolledBack: isRollback,
                isReverted: isRollback,
                note: item.note || ''
              });
            }
          });
          this.sanitizeLog(this.auditLog);
          this.auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          this.saveAuditLog();
        }
      }
    } catch (e) {
      console.warn('[AuditLog] Remote audit logs unreachable:', e.message);
    }
    return this.auditLog;
  }

  getAuditLog() {
    return this.auditLog;
  }

  clearAuditLog() {
    this.auditLog = [];
    this.saveAuditLog();
  }

  async clearRemoteAuditLogs() {
    try {
      const res = await fetch('/api/v1/audit-logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...auth.getAuthHeaders()
        }
      });
      if (res.ok) {
        this.clearAuditLog();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, message: errData.message || 'Không có quyền xóa nhật ký kiểm toán (yêu cầu Quản Trị Viên).' };
      }
    } catch (e) {
      this.clearAuditLog();
      return { success: true };
    }
  }

  async deleteRemoteAuditLog(id) {
    try {
      const res = await fetch(`/api/v1/audit-logs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...auth.getAuthHeaders()
        }
      });
      if (res.ok) {
        this.auditLog = this.auditLog.filter(e => e.id !== id && e.log_id !== id && String(e.dbId) !== String(id));
        this.saveAuditLog();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, message: errData.message || 'Không có quyền xóa bản ghi kiểm toán này.' };
      }
    } catch (e) {
      this.auditLog = this.auditLog.filter(e => e.id !== id && e.log_id !== id);
      this.saveAuditLog();
      return { success: true };
    }
  }

  rollbackEntry(entryId, allRecords = []) {
    const idx = this.auditLog.findIndex(e => e.id === entryId || e.log_id === entryId);
    if (idx === -1) return null;

    const entry = this.auditLog[idx];
    const targetVal = (entry.oldValue !== null && entry.oldValue !== undefined) 
      ? entry.oldValue 
      : (entry.old_value !== null && entry.old_value !== undefined ? entry.old_value : entry.newValue);

    if (targetVal === null || targetVal === undefined) {
      return null;
    }

    // 1. Revert in memory records
    const rec = allRecords.find(r => r.bank === entry.bank && r.field === entry.field);
    const prevLive = (rec && rec.values) ? rec.values[entry.year] : (rec ? rec[entry.year] : entry.newValue);
    if (rec && rec.values) {
      rec.values[entry.year] = targetVal;
      rec[entry.year] = targetVal;
    }

    // 2. Record a rollback action in audit log
    const rollbackLog = {
      id: 'rollback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleString('vi-VN'),
      userRole: auth.getUser()?.name || auth.getRoleMeta().name || 'Super Admin',
      bank: entry.bank,
      field: entry.field,
      year: String(entry.year),
      oldValue: prevLive,
      newValue: targetVal,
      action: 'ROLLBACK',
      note: `Phục hồi về giá trị trước kiểm toán (${targetVal})`
    };

    this.auditLog.unshift(rollbackLog);
    this.saveAuditLog();

    // Call remote API in background to sync with MySQL if entry has valid server ID
    const targetId = entry.log_id || entry.dbId || (typeof entry.id === 'number' ? entry.id : null);
    if (targetId) {
      try {
        fetch(`/api/v1/audit-logs/${targetId}/rollback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...auth.getAuthHeaders() },
          body: JSON.stringify({ user_role: auth.getUser()?.role || 'Super Admin' })
        }).catch(() => {});
      } catch (e) {}
    }

    return rollbackLog;
  }

  resetToBaseline(allRecords = []) {
    const baseline = this.getBaseline();
    if (!baseline || !baseline.table) return false;

    // Reset table records
    baseline.table.forEach(baseRow => {
      const bBank = baseRow['Ngân hàng'] || baseRow['Mã Ngân Hàng'] || baseRow['bank'];
      const bField = baseRow['Chỉ tiêu'] || baseRow['field'];
      const live = allRecords.find(r => r.bank === bBank && r.field === bField);
      if (live && live.values && baseRow.values) {
        live.values = { ...baseRow.values };
      }
    });

    // Mark all prior edits as superseded / rolled back
    this.auditLog.forEach(e => {
      e.rolledBack = true;
      e.isReverted = true;
    });

    this.recordChange({
      bank: 'ALL',
      field: 'TAT_CA_CHI_TIEU',
      year: 'ALL',
      oldValue: null,
      newValue: null,
      userRole: auth.getUser()?.name || 'Super Admin',
      action: 'RESET_BASELINE',
      note: 'Khôi phục toàn bộ ma trận số liệu về nguyên bản ban đầu (Reset Baseline)'
    });

    return true;
  }

  createBackupSnapshot(fullDataset, customFilters = []) {
    const snapshot = {
      backup_version: '2.0',
      created_at: new Date().toISOString(),
      created_by_role: 'ADMIN',
      description: 'Bản sao lưu toàn vẹn dữ liệu BCTC 29 Ngân Hàng, bộ lọc động và lịch sử kiểm toán',
      metadata: fullDataset.metadata || {},
      banks: fullDataset.banks || {},
      table: fullDataset.table || [],
      custom_filters: customFilters,
      audit_log: this.auditLog
    };
    return snapshot;
  }

  downloadBackupFile(snapshot, filename = null) {
    const name = filename || `Backup_BCTC_NganHang_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  parseAndValidateBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || (!parsed.table && !parsed.banks)) {
        throw new Error('File backup không đúng định dạng hoặc thiếu cấu trúc bảng dữ liệu.');
      }
      return parsed;
    } catch (err) {
      throw new Error('Lỗi phân tích file backup: ' + err.message);
    }
  }

  onChange(fn) {
    this.changeListeners.push(fn);
  }

  notifyListeners() {
    this.changeListeners.forEach(fn => fn(this.auditLog));
  }
}

export const dataVersioning = new DataVersioningManager();
