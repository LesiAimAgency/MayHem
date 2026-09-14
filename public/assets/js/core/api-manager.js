/**
 * assets/js/core/api-manager.js
 * API Configuration and Ingestion Manager.
 * Rule: Zero emoji.
 */

const API_CONFIG_KEY = 'financial_api_endpoint_config';

export class ApiManager {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(API_CONFIG_KEY);
      return saved ? JSON.parse(saved) : {
        endpointUrl: '',
        apiKey: '',
        autoSync: false,
        lastSynced: null
      };
    } catch (e) {
      return { endpointUrl: '', apiKey: '', autoSync: false, lastSynced: null };
    }
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(API_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {}
  }

  async fetchRemoteData() {
    if (!this.config.endpointUrl) {
      throw new Error('Chưa cấu hình đường dẫn API endpoint.');
    }

    const headers = {
      'Accept': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      headers['X-API-Key'] = this.config.apiKey;
    }

    const res = await fetch(this.config.endpointUrl, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      throw new Error(`Kết nối API thất bại (HTTP ${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    if (!data || (!data.table && !data.banks)) {
      throw new Error('Dữ liệu API trả về không đúng định dạng chuẩn.');
    }

    this.saveConfig({ lastSynced: new Date().toISOString() });
    return data;
  }
}

export const apiManager = new ApiManager();
