/**
 * Data Facade - Layer di astrazione per accesso ai dati
 * @module data/data-facade
 */

import { LocalAdapter } from './adapters/local-adapter.js';
import { FirestoreAdapter } from './adapters/firestore-adapter.js';
import { COLLECTIONS } from '../utils/constants.ts';

class CacheManager {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minuti
    }

    get(key, allowStale = false) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        const isExpired = now > entry.expires;

        if (!isExpired) {
            return entry.value;
        }

        if (allowStale) {
            entry.needsRefresh = true;
            return entry.value;
        }

        this.cache.delete(key);
        return null;
    }

    set(key, value, ttl = null) {
        const expires = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, {
            value,
            expires,
            needsRefresh: false,
            timestamp: Date.now()
        });
    }

    invalidate(key = null) {
        if (key === null) {
            this.cache.clear();
        } else {
            this.cache.delete(key);
        }
    }

    needsRefresh(key) {
        const entry = this.cache.get(key);
        return entry ? (entry.needsRefresh || Date.now() > entry.expires) : true;
    }
}

export const DATA = {
    adapter: new LocalAdapter(),
    cache: new CacheManager(),

    useFirestore() {
        this.adapter = new FirestoreAdapter();
        this.cache.invalidate();
    },

    async loadAll(forceRefresh = false) {
        const cacheKey = 'loadAll';

        if (this.adapter instanceof LocalAdapter) {
            return await this.adapter.loadAll();
        }

        if (!forceRefresh) {
            const cached = this.cache.get(cacheKey, true);
            if (cached && !this.cache.needsRefresh(cacheKey)) {
                try { console.info('[Cache] loadAll HIT (fresh)'); } catch { }
                return cached;
            }

            if (cached && this.cache.needsRefresh(cacheKey)) {
                try { console.info('[Cache] loadAll HIT (stale, revalidating...)'); } catch { }
                this.adapter.loadAll().then(fresh => {
                    this.cache.set(cacheKey, fresh);
                    try { console.info('[Cache] loadAll REVALIDATED'); } catch { }
                }).catch(err => {
                    console.warn('[Cache] Background refresh failed:', err);
                });
                return cached;
            }
        }

        try { console.info('[Cache] loadAll MISS, fetching from Firestore...'); } catch { }
        const data = await this.adapter.loadAll();
        this.cache.set(cacheKey, data);
        return data;
    },

    _invalidateCache() {
        this.cache.invalidate('loadAll');
        try { console.info('[Cache] Invalidated after write operation'); } catch { }
    },

    async addActivity(p, currentUser) {
        const result = await this.adapter.addActivity(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async updateActivity(p, currentUser) {
        const result = await this.adapter.updateActivity(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async deleteActivity(id, currentUser) {
        const result = await this.adapter.deleteActivity(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async addStaff(p, currentUser) {
        const result = await this.adapter.addStaff(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async updateStaff(p, currentUser) {
        const result = await this.adapter.updateStaff(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async deleteStaff(id, currentUser) {
        const result = await this.adapter.deleteStaff(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async addScout(p, currentUser) {
        const result = await this.adapter.addScout(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async updateScout(id, p, currentUser) {
        const result = await this.adapter.updateScout({ id, ...p }, currentUser);
        this._invalidateCache();
        return result;
    },

    async deleteScout(id, currentUser) {
        const result = await this.adapter.deleteScout(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async updatePresence(p, currentUser) {
        const result = await this.adapter.updatePresence(p, currentUser);
        this._invalidateCache();
        return result;
    },
};
