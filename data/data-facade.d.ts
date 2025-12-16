/**
 * Data Facade - Layer di astrazione per accesso ai dati
 * @module data/data-facade
 */
declare class CacheManager {
    private cache;
    private defaultTTL;
    constructor();
    get<T>(key: string, allowStale?: boolean): T | null;
    set<T>(key: string, value: T, ttl?: number | null): void;
    invalidate(key?: string | null): void;
    needsRefresh(key: string): boolean;
}
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
}
export declare const DATA: {
    adapter: DataAdapter;
    cache: CacheManager;
    useFirestore(): void;
    loadAll(forceRefresh?: boolean): Promise<any>;
    _invalidateCache(): void;
    addActivity(p: any, currentUser: any): Promise<any>;
    updateActivity(p: any, currentUser: any): Promise<void>;
    deleteActivity(id: string, currentUser: any): Promise<void>;
    addStaff(p: any, currentUser: any): Promise<any>;
    updateStaff(p: any, currentUser: any): Promise<void>;
    deleteStaff(id: string, currentUser: any): Promise<void>;
    addScout(p: any, currentUser: any): Promise<any>;
    updateScout(id: string, p: any, currentUser: any): Promise<void>;
    deleteScout(id: string, currentUser: any): Promise<void>;
    updatePresence(p: any, currentUser: any): Promise<void>;
};
export {};
//# sourceMappingURL=data-facade.d.ts.map