/**
 * FirestoreAdapter - Adattatore per dati remoti su Firebase
 * @module data/adapters/firestore-adapter
 */
export declare class FirestoreAdapter {
    private db;
    private auth;
    private messaging;
    private cols;
    constructor();
    loadAll(options?: any): Promise<{
        scouts: any;
        staff: any;
        activities: any;
        presences: any;
    }>;
    /**
     * Carica dati paginati da una collezione
     */
    loadCollectionPaginated(collectionName: string, options?: any): Promise<{
        docs: any;
        lastDoc: any;
        hasMore: boolean;
    }>;
    /**
     * Query con filtri e limiti
     */
    queryCollection(collectionName: string, filters?: any, options?: any): Promise<any>;
    addAuditLog(action: string, collection: string, documentId: string, changes: any, userId: string, userEmail: string): Promise<void>;
    addActivity({ tipo, data, descrizione, costo }: any, currentUser: any): Promise<any>;
    updateActivity({ id, tipo, data, descrizione, costo }: any, currentUser: any): Promise<void>;
    deleteActivity(id: string, currentUser: any): Promise<void>;
    addStaff({ nome, cognome, email }: any, currentUser: any): Promise<any>;
    updateStaff({ id, nome, cognome, email }: any, currentUser: any): Promise<void>;
    deleteStaff(id: string, currentUser: any): Promise<void>;
    addScout({ nome, cognome }: any, currentUser: any): Promise<any>;
    updateScout({ id, nome, cognome, ...rest }: any, currentUser: any): Promise<void>;
    deleteScout(id: string, currentUser: any): Promise<void>;
    updatePresence({ field, value, scoutId, activityId }: any, currentUser: any): Promise<void>;
}
//# sourceMappingURL=firestore-adapter.d.ts.map