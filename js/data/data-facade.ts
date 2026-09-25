/**
 * Data Facade - Layer di astrazione per accesso ai dati
 * @module data/data-facade
 */

import { LocalAdapter } from './adapters/local-adapter.js';
import { FirestoreAdapter } from './adapters/firestore-adapter.js';
import { COLLECTIONS } from '../utils/constants.js';

interface CacheEntry<T> {
    value: T;
    expires: number;
    needsRefresh: boolean;
    timestamp: number;
}

class CacheManager {
    private cache: Map<string, CacheEntry<any>>;
    private defaultTTL: number;

    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minuti
    }

    get<T = any>(key: string, allowStale: boolean = false): T | null {
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

    set<T>(key: string, value: T, ttl: number | null = null): void {
        const expires = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, {
            value,
            expires,
            needsRefresh: false,
            timestamp: Date.now()
        });
    }

    invalidate(key: string | null = null): void {
        if (key === null) {
            this.cache.clear();
        } else {
            this.cache.delete(key);
        }
    }

    needsRefresh(key: string): boolean {
        const entry = this.cache.get(key);
        return entry ? (entry.needsRefresh || Date.now() > entry.expires) : true;
    }
}

// Define a common interface for Adapters
interface DataAdapter {
    loadAll(): Promise<any>;
    addActivity(p: any, currentUser: any): Promise<any>;
    updateActivity(p: any, currentUser: any): Promise<void>;
    deleteActivity(id: string, currentUser: any): Promise<void>;
    addStaff(p: any, currentUser: any): Promise<any>;
    updateStaff(p: any, currentUser: any): Promise<void>;
    deleteStaff(id: string, currentUser: any): Promise<void>;
    addScout(p: any, currentUser: any): Promise<any>;
    updateScout(p: any, currentUser: any): Promise<void>;
    deleteScout(id: string, currentUser: any): Promise<void>;
    updatePresence(p: any, currentUser: any): Promise<void>;
    getBudgetByActivity(activityId: string): Promise<any>;
    saveBudget(budget: any, currentUser: any): Promise<any>;
    getPatrols(): Promise<any>;
    savePatrols(list: any, currentUser: any): Promise<any>;
    getAuditLogs?(limitCount?: number): Promise<any[]>;
}

export const DATA = {
    adapter: new LocalAdapter() as any as DataAdapter, // Force cast until adapters are typed
    cache: new CacheManager(),

    useFirestore() {
        this.adapter = new FirestoreAdapter() as any as DataAdapter;
        this.cache.invalidate();
    },

    async loadAll(forceRefresh: boolean = false): Promise<any> {
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
        
        // Filter out archived scouts from the main list
        if (data.scouts) {
            data.allScouts = [...data.scouts]; // Keep a copy of all scouts
            data.scouts = data.scouts.filter((s: any) => !s.archived);
        }
        
        this.cache.set(cacheKey, data);
        return data;
    },

    async loadArchived(): Promise<any[]> {
        const allData = await this.loadAll();
        if (allData.allScouts) {
            return allData.allScouts.filter((s: any) => s.archived === true);
        }
        return [];
    },

    _invalidateCache() {
        this.cache.invalidate('loadAll');
        try { console.info('[Cache] Invalidated after write operation'); } catch { }
    },

    async addActivity(p: any, currentUser: any) {
        const result = await this.adapter.addActivity(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async updateActivity(p: any, currentUser: any) {
        const result = await this.adapter.updateActivity(p, currentUser);
        const cached = this.cache.get<any>('loadAll', true);
        if (cached && Array.isArray(cached.activities)) {
            const idx = cached.activities.findIndex((a: any) => a.id === p.id);
            if (idx >= 0) {
                cached.activities[idx] = { ...cached.activities[idx], ...p };
            }
        } else {
            this._invalidateCache();
        }
        return result;
    },

    async deleteActivity(id: string, currentUser: any) {
        const result = await this.adapter.deleteActivity(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async addStaff(p: any, currentUser: any) {
        const result = await this.adapter.addStaff(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async updateStaff(p: any, currentUser: any) {
        const result = await this.adapter.updateStaff(p, currentUser);
        const cached = this.cache.get<any>('loadAll', true);
        if (cached && Array.isArray(cached.staff)) {
            const idx = cached.staff.findIndex((s: any) => s.id === p.id);
            if (idx >= 0) {
                cached.staff[idx] = { ...cached.staff[idx], ...p };
            }
        } else {
            this._invalidateCache();
        }
        return result;
    },

    async deleteStaff(id: string, currentUser: any) {
        const result = await this.adapter.deleteStaff(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async addScout(p: any, currentUser: any) {
        const result = await this.adapter.addScout(p, currentUser);
        this._invalidateCache();
        return result;
    },

    async updateScout(id: string, p: any, currentUser: any) {
        const result = await this.adapter.updateScout({ id, ...p }, currentUser);
        const cached = this.cache.get<any>('loadAll', true);
        if (cached && Array.isArray(cached.scouts)) {
            const idx = cached.scouts.findIndex((s: any) => s.id === id);
            if (idx >= 0) {
                cached.scouts[idx] = { ...cached.scouts[idx], ...p };
            }
            if (Array.isArray(cached.allScouts)) {
                const aIdx = cached.allScouts.findIndex((s: any) => s.id === id);
                if (aIdx >= 0) {
                    cached.allScouts[aIdx] = { ...cached.allScouts[aIdx], ...p };
                }
            }
        } else {
            this._invalidateCache();
        }
        return result;
    },

    async deleteScout(id: string, currentUser: any) {
        const result = await this.adapter.deleteScout(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async updatePresence(p: any, currentUser: any) {
        const result = await this.adapter.updatePresence(p, currentUser);
        const cached = this.cache.get<any>('loadAll', true);
        if (cached && Array.isArray(cached.presences)) {
            const { field, value, scoutId, activityId } = p;
            const existing = cached.presences.find((item: any) =>
                item.esploratoreId === scoutId && item.attivitaId === activityId
            );
            if (existing) {
                existing[field] = value;
                if (field === 'pagato' && !value) existing.tipoPagamento = null;
            } else {
                cached.presences.push({
                    esploratoreId: scoutId,
                    attivitaId: activityId,
                    [field]: value
                });
            }
        } else {
            this._invalidateCache();
        }
        return result;
    },

    async deletePresence(id: string, currentUser?: any) {
        const result = await (this.adapter as any).deletePresence(id, currentUser);
        this._invalidateCache();
        return result;
    },

    async getBudgetByActivity(activityId: string) {
        return await this.adapter.getBudgetByActivity(activityId);
    },

    async saveBudget(budget: any, currentUser: any) {
        return await this.adapter.saveBudget(budget, currentUser);
    },

    async getPatrols() {
        const cacheKey = 'patrols';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        const data = await this.adapter.getPatrols();
        this.cache.set(cacheKey, data);
        return data;
    },

    async savePatrols(list: any, currentUser: any) {
        const result = await this.adapter.savePatrols(list, currentUser);
        this.cache.invalidate('patrols');
        return result;
    },

    // Custom Deadlines / Scadenze
    async getCustomDeadlines() {
        const cacheKey = 'customDeadlines';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        const data = await (this.adapter as any).getCustomDeadlines();
        this.cache.set(cacheKey, data, 2 * 60 * 1000);
        return data;
    },

    async addCustomDeadline(deadline: any, currentUser: any) {
        const result = await (this.adapter as any).addCustomDeadline(deadline, currentUser);
        this.cache.invalidate('customDeadlines');
        return result;
    },

    async updateCustomDeadline(id: string, deadline: any, currentUser: any) {
        const result = await (this.adapter as any).updateCustomDeadline(id, deadline, currentUser);
        this.cache.invalidate('customDeadlines');
        return result;
    },

    async deleteCustomDeadline(id: string, currentUser: any) {
        const result = await (this.adapter as any).deleteCustomDeadline(id, currentUser);
        this.cache.invalidate('customDeadlines');
        return result;
    },

    // Inventory / Scorte & Liste
    async getListeScorte(): Promise<string[]> {
        const cacheKey = 'liste_scorte';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        const data = await (this.adapter as any).getListeScorte();
        this.cache.set(cacheKey, data, 5 * 60 * 1000);
        return data;
    },

    async addListaScorta(nome: string, currentUser?: any): Promise<string> {
        const result = await (this.adapter as any).addListaScorta(nome, currentUser);
        this.cache.invalidate('liste_scorte');
        return result;
    },

    async deleteListaScorta(nome: string, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).deleteListaScorta(nome, currentUser);
        this.cache.invalidate('liste_scorte');
        this.cache.invalidate('scorte');
        return result;
    },

    async renameListaScorta(oldName: string, newName: string, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).renameListaScorta(oldName, newName, currentUser);
        this.cache.invalidate('liste_scorte');
        this.cache.invalidate('scorte');
        return result;
    },

    async getScorte(): Promise<any[]> {
        const cacheKey = 'scorte';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        const data = await (this.adapter as any).getScorte();
        this.cache.set(cacheKey, data, 2 * 60 * 1000);
        return data;
    },

    async addScorta(item: any, currentUser?: any): Promise<string> {
        const result = await (this.adapter as any).addScorta(item, currentUser);
        this.cache.invalidate('scorte');
        return result;
    },

    async updateScorta(id: string, updates: any, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).updateScorta(id, updates, currentUser);
        this.cache.invalidate('scorte');
        return result;
    },

    async deleteScorta(id: string, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).deleteScorta(id, currentUser);
        this.cache.invalidate('scorte');
        return result;
    },

    async importScorteBatch(items: any[], replaceExisting: boolean = false, currentUser?: any): Promise<number> {
        const result = await (this.adapter as any).importScorteBatch(items, replaceExisting, currentUser);
        this.cache.invalidate('scorte');
        return result;
    },

    // Gara di Reparto - Categorie
    async getGaraCategories(annoScout: string | null = null): Promise<any[]> {
        const cacheKey = `gara_categories_${annoScout || 'all'}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        const data = await (this.adapter as any).getGaraCategories(annoScout);
        this.cache.set(cacheKey, data, 5 * 60 * 1000);
        return data;
    },

    async addGaraCategory(category: any, currentUser?: any): Promise<string> {
        const result = await (this.adapter as any).addGaraCategory(category, currentUser);
        this.cache.invalidate();
        return result;
    },

    async updateGaraCategory(id: string, updates: any, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).updateGaraCategory(id, updates, currentUser);
        this.cache.invalidate();
        return result;
    },

    async deleteGaraCategory(id: string, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).deleteGaraCategory(id, currentUser);
        this.cache.invalidate();
        return result;
    },

    // Gara di Reparto - Punti
    async getGaraPunti(annoScout: string | null = null): Promise<any[]> {
        const cacheKey = `gara_punti_${annoScout || 'all'}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        const data = await (this.adapter as any).getGaraPunti(annoScout);
        this.cache.set(cacheKey, data, 2 * 60 * 1000);
        return data;
    },

    async addGaraPunti(entryOrArray: any, currentUser?: any): Promise<string | string[]> {
        const result = await (this.adapter as any).addGaraPunti(entryOrArray, currentUser);
        this.cache.invalidate();
        return result;
    },

    async updateGaraPunti(id: string, updates: any, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).updateGaraPunti(id, updates, currentUser);
        this.cache.invalidate();
        return result;
    },

    async deleteGaraPunti(id: string, currentUser?: any): Promise<void> {
        const result = await (this.adapter as any).deleteGaraPunti(id, currentUser);
        this.cache.invalidate();
        return result;
    },

    // Log di Audit
    async getAuditLogs(limitCount: number = 100): Promise<any[]> {
        if (typeof (this.adapter as any).getAuditLogs === 'function') {
            return await (this.adapter as any).getAuditLogs(limitCount);
        }
        return [];
    }
};
