/**
 * LocalAdapter - Adattatore per dati locali (offline/dev)
 * @module data/adapters/local-adapter
 */
interface Scout {
    id: string;
    nome: string;
    cognome: string;
    [key: string]: any;
}
interface Staff {
    id: string;
    nome: string;
    cognome: string;
    email?: string;
}
interface Activity {
    id: string;
    tipo: string;
    data: Date | any;
    descrizione?: string;
    costo?: string | number;
}
interface Presence {
    esploratoreId: string;
    attivitaId: string;
    stato: string;
    pagato: boolean;
    tipoPagamento: string | null;
    [key: string]: any;
}
interface LocalState {
    scouts: Scout[];
    staff: Staff[];
    activities: Activity[];
    presences: Presence[];
}
export declare class LocalAdapter {
    private state;
    constructor();
    persist(): void;
    loadAll(): Promise<LocalState>;
    addActivity({ tipo, data, descrizione, costo }: any, currentUser: any): Promise<string>;
    updateActivity({ id, tipo, data, descrizione, costo }: any, currentUser: any): Promise<void>;
    deleteActivity(id: string, currentUser: any): Promise<void>;
    addStaff({ nome, cognome, email }: any, currentUser: any): Promise<string>;
    updateStaff({ id, nome, cognome, email }: any, currentUser: any): Promise<void>;
    deleteStaff(id: string, currentUser: any): Promise<void>;
    addScout({ nome, cognome }: any, currentUser: any): Promise<string>;
    updateScout({ id, nome, cognome, ...rest }: any, currentUser: any): Promise<void>;
    deleteScout(id: string, currentUser: any): Promise<void>;
    updatePresence({ field, value, scoutId, activityId }: any, currentUser: any): Promise<void>;
}
export {};
//# sourceMappingURL=local-adapter.d.ts.map