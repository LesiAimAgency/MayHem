/**
 * assets/js/core/indexeddb-cache.js
 * High-performance, quota-free IndexedDB storage layer for multi-industry financial datasets.
 * - Replaces restrictive 5MB sessionStorage/localStorage with 100MB+ IndexedDB store.
 * - Supports segmented storage by {industry}_{horizon}_{version}.
 * - Integrates ETag and timestamping for conditional 304 validation.
 * Rule: Zero dependencies. Clean async/await Promise wrapper. Zero emoji.
 */

const DB_NAME = 'MayHemFinancialDB';
const DB_VERSION = 1;
const STORE_NAME = 'financial_chunks';

class IndexedDbCache {
  constructor() {
    this.dbPromise = null;
  }

  getDb() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
          store.createIndex('industry', 'industry', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return this.dbPromise;
  }

  /**
   * Get cached chunk by key
   * @param {string} cacheKey - e.g. "NGAN_HANG_summary"
   * @returns {Promise<{ data: any, etag: string, updatedAt: number } | null>}
   */
  async getChunk(cacheKey) {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(cacheKey);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] getChunk fallback:', e.message);
      return null;
    }
  }

  /**
   * Save chunk to IndexedDB
   * @param {string} cacheKey 
   * @param {any} data 
   * @param {string} etag 
   * @param {string} industry 
   */
  async setChunk(cacheKey, data, etag = '', industry = 'NGAN_HANG') {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const record = {
          cacheKey,
          industry,
          data,
          etag,
          updatedAt: Date.now()
        };
        const req = store.put(record);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('[IndexedDB] setChunk error:', e.message);
      return false;
    }
  }

  /**
   * Delete specific chunk
   * @param {string} cacheKey 
   */
  async deleteChunk(cacheKey) {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(cacheKey);

        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return false;
    }
  }

  /**
   * Clear all cached chunks for an industry or entire database
   * @param {string} [industry] 
   */
  async clear(industry = null) {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        if (!industry) {
          const req = store.clear();
          req.onsuccess = () => resolve(true);
          req.onerror = () => reject(req.error);
        } else {
          const idx = store.index('industry');
          const req = idx.openCursor(IDBKeyRange.only(industry));
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve(true);
            }
          };
          req.onerror = () => reject(req.error);
        }
      });
    } catch (e) {
      return false;
    }
  }
}

export const idbCache = new IndexedDbCache();
