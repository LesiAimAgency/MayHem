/**
 * assets/js/core/data-loader.js
 * Asynchronous data loading with IndexedDB Segmented Storage, ETag 304 Validation,
 * and Progressive Loading (Summary Chunk < 80KB vs Full 10y History).
 * Rule: Zero mock data. Real dataset only.
 */

import { idbCache } from './indexeddb-cache.js';

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.LARAVEL_API_BASE) {
    return window.LARAVEL_API_BASE.replace(/\/+$/, '') + '/api/v1/financial-reports/matrix';
  }
  return '/api/v1/financial-reports/matrix';
};

const PRIMARY_DATA_PATH = './BaoCaoTaiChinh_NganHang_30ChiTieu.json';
const BACKUP_DATA_PATH = './assets/data/BaoCaoTaiChinh_NganHang_30ChiTieu.json';

/**
 * Load financial dataset with segmented storage and progressive loading
 * @param {string} industry - 'NGAN_HANG' | 'BAT_DONG_SAN' | 'CHUNG_KHOAN' | 'THEP'
 * @param {object} options - { horizon: 'summary' | 'full', forceRefresh: boolean }
 * @returns {Promise<{ data: any, source: string, horizon: string, industry: string }>}
 */
export async function loadFinancialData(industry = 'NGAN_HANG', options = {}) {
  const horizon = options.horizon || 'full';
  const forceRefresh = Boolean(options.forceRefresh);
  const cacheKey = `${industry}_${horizon}`;

  let cachedRecord = null;
  if (!forceRefresh) {
    try {
      cachedRecord = await idbCache.getChunk(cacheKey);
      // Fast path: if cache is very recent (< 30s) and not forcing refresh, return immediately
      if (cachedRecord && cachedRecord.data && (Date.now() - cachedRecord.updatedAt < 30000)) {
        return {
          data: cachedRecord.data,
          source: 'indexeddb_hot_cache',
          horizon,
          industry,
          isSummary: (horizon === 'summary')
        };
      }
    } catch (e) {
      console.warn('[DataLoader] IndexedDB read error:', e);
    }
  }

  // 2. Fetch from Laravel Backend API with ETag and Segmented Query
  try {
    const url = `${getApiBase()}?industry=${encodeURIComponent(industry)}&horizon=${encodeURIComponent(horizon)}`;
    const headers = { 'Accept': 'application/json' };

    if (cachedRecord && cachedRecord.etag && !forceRefresh) {
      headers['If-None-Match'] = cachedRecord.etag;
    }

    const apiRes = await fetch(url, { headers });

    // Handle HTTP 304 Not Modified -> Zero network payload!
    if (apiRes.status === 304 && cachedRecord && cachedRecord.data) {
      return {
        data: cachedRecord.data,
        source: 'indexeddb_etag_304',
        horizon,
        industry,
        isSummary: (horizon === 'summary')
      };
    }

    if (apiRes.ok) {
      const jsonRes = await apiRes.json();
      const dataset = jsonRes.data || jsonRes;
      const etag = apiRes.headers.get('ETag') || '';

      if (isValidDataset(dataset)) {
        await idbCache.setChunk(cacheKey, dataset, etag, industry);
        return {
          data: dataset,
          source: 'laravel_mamp_api',
          horizon,
          industry,
          isSummary: (horizon === 'summary')
        };
      }
    }
  } catch (err) {
    console.warn('[DataLoader] Backend API fetch error:', err.message);
  }

  // Fallback to local cache if network failed
  if (cachedRecord && cachedRecord.data) {
    return {
      data: cachedRecord.data,
      source: 'indexeddb_offline_fallback',
      horizon,
      industry,
      isSummary: (horizon === 'summary')
    };
  }

  // 3. Fallback to static primary relative path
  try {
    const response = await fetch(PRIMARY_DATA_PATH);
    if (response.ok) {
      const data = await response.json();
      if (isValidDataset(data)) {
        await idbCache.setChunk(cacheKey, data, 'static_primary', industry);
        return { data, source: PRIMARY_DATA_PATH, horizon, industry, isSummary: false };
      }
    }
  } catch (err) {
    // Continue to backup
  }

  // 4. Fallback to backup path
  try {
    const responseBackup = await fetch(BACKUP_DATA_PATH);
    if (responseBackup.ok) {
      const data = await responseBackup.json();
      if (isValidDataset(data)) {
        await idbCache.setChunk(cacheKey, data, 'static_backup', industry);
        return { data, source: BACKUP_DATA_PATH, horizon, industry, isSummary: false };
      }
    }
  } catch (err) {
    // Fallback error
  }

  throw new Error(`Không thể tải dữ liệu báo cáo cho ngành ${industry}.`);
}

export function parseUploadedJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!isValidDataset(parsed)) {
      throw new Error('Không thể đọc dữ liệu báo cáo. Cấu trúc file JSON không đúng.');
    }
    return parsed;
  } catch (err) {
    throw new Error('Không thể đọc dữ liệu báo cáo: ' + err.message);
  }
}

export function isValidDataset(data) {
  if (!data || typeof data !== 'object') return false;
  return Boolean(data.metadata || data.table || data.banks);
}

/**
 * Invalidate cached chunks for an industry (e.g. after post-audit adjustment)
 * @param {string} [industry] 
 */
export async function invalidateFinancialCache(industry = null) {
  try {
    await idbCache.clear(industry);
    return true;
  } catch (e) {
    return false;
  }
}
