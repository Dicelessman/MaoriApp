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
    data: Date | any; // allow any for serialization convenience
    dataFine?: Date | any;
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
    budgets: any[];
    patrols: string[];
    scadenze: any[];
    scorte: any[];
    listeScorte?: string[];
}

export class LocalAdapter {
    private state: LocalState;

    constructor() {
        const saved = JSON.parse(localStorage.getItem('presenziario-state') || '{}');
        const now = new Date();
        const past1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        const past2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const next1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        const next2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);

        const dateValido = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()).toISOString().split('T')[0];
        const dateInScadenza = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15).toISOString().split('T')[0];
        const dateScaduto = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 20).toISOString().split('T')[0];

        this.state = {
            scouts: saved.scouts || [
                {
                    id: 's1',
                    nome: 'Mario',
                    cognome: 'Rossi',
                    pv_pattuglia: 'Aironi',
                    anag_telefono: '3331234567',
                    ct_g1_nome: 'Giuseppe Rossi',
                    ct_g1_tel: '3331234567',
                    san_cert_scadenza: dateValido,
                    doc_priv: true,
                    doc_san: true
                },
                {
                    id: 's2',
                    nome: 'Luisa',
                    cognome: 'Bianchi',
                    pv_pattuglia: 'Marmotte',
                    anag_telefono: '3339876543',
                    ct_g1_nome: 'Elena Bianchi',
                    ct_g1_tel: '3339876543',
                    san_cert_scadenza: dateInScadenza,
                    doc_priv: true,
                    doc_san: true
                },
                {
                    id: 's3',
                    nome: 'Andrea',
                    cognome: 'Verdi',
                    pv_pattuglia: 'Aironi',
                    anag_telefono: '3334567890',
                    ct_g1_nome: 'Paolo Verdi',
                    ct_g1_tel: '3334567890',
                    san_cert_scadenza: dateScaduto,
                    doc_priv: false,
                    doc_san: false
                }
            ],
            staff: saved.staff || [
                { id: 'st1', nome: 'Giulia', cognome: 'Esposito' },
                { id: 'st2', nome: 'Marco', cognome: 'Gallo' }
            ],
            activities: saved.activities || [
                { id: 'a1', tipo: 'Uscita', data: past1, descrizione: 'Uscita al lago', costo: '10' },
                { id: 'a2', tipo: 'Riunione', data: past2, descrizione: 'Riunione settimanale', costo: '0' },
                { id: 'a3', tipo: 'Attività lunga', data: next1, descrizione: 'Escursione in montagna', costo: '5' },
                { id: 'a4', tipo: 'Campo', data: next2, descrizione: 'Campo Estivo', costo: '150' }
            ],
            presences: saved.presences || [
                { esploratoreId: 's1', attivitaId: 'a1', stato: 'Presente', pagato: true, tipoPagamento: 'Contanti' },
                { esploratoreId: 's2', attivitaId: 'a1', stato: 'Assente', pagato: false, tipoPagamento: null },
                { esploratoreId: 's3', attivitaId: 'a1', stato: 'Presente', pagato: true, tipoPagamento: 'Bonifico' },
                { esploratoreId: 's1', attivitaId: 'a2', stato: 'Presente', pagato: false, tipoPagamento: null },
                { esploratoreId: 's2', attivitaId: 'a2', stato: 'Presente', pagato: false, tipoPagamento: null },
                { esploratoreId: 's3', attivitaId: 'a2', stato: 'Assente', pagato: false, tipoPagamento: null },
                { esploratoreId: 's1', attivitaId: 'a3', stato: 'Presente', pagato: true, tipoPagamento: 'Contanti' },
                { esploratoreId: 's2', attivitaId: 'a3', stato: 'NR', pagato: false, tipoPagamento: null },
                { esploratoreId: 's3', attivitaId: 'a3', stato: 'Assente', pagato: false, tipoPagamento: null },
                { esploratoreId: 's1', attivitaId: 'a4', stato: 'NR', pagato: false, tipoPagamento: null },
                { esploratoreId: 's2', attivitaId: 'a4', stato: 'NR', pagato: false, tipoPagamento: null },
                { esploratoreId: 's3', attivitaId: 'a4', stato: 'NR', pagato: false, tipoPagamento: null }
            ],
            budgets: saved.budgets || [],
            patrols: saved.patrols || ["Aironi", "Marmotte"],
            scadenze: saved.scadenze || [],
            scorte: saved.scorte || [
                {
                    id: 'sc_test_1',
                    nome: 'Picchetti tenda a V (20 cm)',
                    categoria: 'Campeggio',
                    lista: 'Campo Estivo',
                    quantita: 24,
                    quantitaMinima: 50,
                    unitaMisura: 'pz',
                    prezzoUnitario: 1.20,
                    dataControllo: new Date().toISOString().split('T')[0],
                    note: 'Per squadriglie, cassa verde'
                },
                {
                    id: 'sc_test_2',
                    nome: 'Cordino canapa 6mm (matassa 50m)',
                    categoria: 'Pionieristica',
                    lista: 'Campo Estivo',
                    quantita: 4,
                    quantitaMinima: 10,
                    unitaMisura: 'rotoli',
                    prezzoUnitario: 8.50,
                    dataControllo: new Date().toISOString().split('T')[0],
                    note: 'Costruzioni campo e legature'
                },
                {
                    id: 'sc_test_3',
                    nome: 'Disinfettante spray 250ml',
                    categoria: 'Pronto Soccorso',
                    lista: 'Generale',
                    quantita: 5,
                    quantitaMinima: 5,
                    unitaMisura: 'pz',
                    prezzoUnitario: 4.80,
                    dataControllo: new Date().toISOString().split('T')[0],
                    note: 'Cassetta medica reparto'
                }
            ],
            listeScorte: saved.listeScorte || [
                'Campo Estivo',
                'Uniformi',
                'Distintivi',
                'Generale'
            ]
        };
        // Restore dates
        this.state.activities.forEach(a => {
            if (typeof a.data === 'string') a.data = new Date(a.data);
        });
    }

    persist() {
        localStorage.setItem('presenziario-state', JSON.stringify(this.state));
    }

    async loadAll() {
        return this.state;
    }

    // Activities
    async addActivity({ tipo, data, dataFine, descrizione, costo }: any, currentUser: any) {
        const id = 'a' + (Math.random().toString(36).slice(2, 8));
        this.state.activities.push({ id, tipo, data, dataFine, descrizione, costo });
        this.persist();
        console.log('LocalAdapter: addActivity', { tipo, data, dataFine, descrizione, costo, id, currentUser: currentUser?.email });
        return id;
    }

    async updateActivity({ id, tipo, data, dataFine, descrizione, costo }: any, currentUser: any) {
        const a: any = this.state.activities.find(x => x.id === id);
        if (a) { a.tipo = tipo; a.data = data; a.dataFine = dataFine; a.descrizione = descrizione; a.costo = costo; this.persist(); }
        console.log('LocalAdapter: updateActivity', { id, tipo, data, dataFine, descrizione, costo, currentUser: currentUser?.email });
    }

    async deleteActivity(id: string, currentUser: any) {
        this.state.activities = this.state.activities.filter(a => a.id !== id);
        this.state.presences = this.state.presences.filter(p => p.attivitaId !== id);
        this.persist();
        console.log('LocalAdapter: deleteActivity', { id, currentUser: currentUser?.email });
    }

    // Staff
    async addStaff({ nome, cognome, email }: any, currentUser: any) {
        const id = 'st' + (Math.random().toString(36).slice(2, 8));
        this.state.staff.push({ id, nome, cognome, email });
        this.persist();
        console.log('LocalAdapter: addStaff', { nome, cognome, email, id, currentUser: currentUser?.email });
        return id;
    }

    async updateStaff({ id, nome, cognome, email, ruolo }: any, currentUser: any) {
        const m = this.state.staff.find(s => s.id === id);
        if (m) { m.nome = nome; m.cognome = cognome; m.email = email; (m as any).ruolo = ruolo; this.persist(); }
        console.log('LocalAdapter: updateStaff', { id, nome, cognome, email, ruolo, currentUser: currentUser?.email });
    }

    async deleteStaff(id: string, currentUser: any) {
        this.state.staff = this.state.staff.filter(s => s.id !== id);
        this.persist();
        console.log('LocalAdapter: deleteStaff', { id, currentUser: currentUser?.email });
    }

    // Scouts
    async addScout({ nome, cognome }: any, currentUser: any) {
        const id = 's' + (Math.random().toString(36).slice(2, 8));
        this.state.scouts.push({ id, nome, cognome });
        this.state.activities.forEach(a => this.state.presences.push({ esploratoreId: id, attivitaId: a.id, stato: 'NR', pagato: false, tipoPagamento: null }));
        this.persist();
        console.log('LocalAdapter: addScout', { nome, cognome, id, currentUser: currentUser?.email });
        return id;
    }

    async updateScout({ id, nome, cognome, ...rest }: any, currentUser: any) {
        const s: any = this.state.scouts.find(x => x.id === id);
        if (s) {
            // Unisci tutti i campi passati
            Object.assign(s, { nome, cognome });
            // Se sono stati passati altri campi nel payload originale, includili
            Object.assign(s, rest);
            this.persist();
        }
        console.log('LocalAdapter: updateScout', { id, currentUser: currentUser?.email });
    }

    async deleteScout(id: string, currentUser: any) {
        this.state.scouts = this.state.scouts.filter(s => s.id !== id);
        this.state.presences = this.state.presences.filter(p => p.esploratoreId !== id);
        this.persist();
        console.log('LocalAdapter: deleteScout', { id, currentUser: currentUser?.email });
    }

    // Presences 
    async updatePresence({ field, value, scoutId, activityId }: any, currentUser: any) {
        const p = this.state.presences.find(x => x.esploratoreId === scoutId && x.attivitaId === activityId);
        if (!p) return;
        p[field] = value;
        if (field === 'pagato' && !value) p.tipoPagamento = null;
        this.persist();
        console.log('LocalAdapter: updatePresence', { field, value, scoutId, activityId, currentUser: currentUser?.email });
    }

    async deletePresence(presenceKey: string, currentUser?: any) {
        this.state.presences = this.state.presences.filter(p => (p.id !== presenceKey && `${p.esploratoreId}_${p.attivitaId}` !== presenceKey));
        this.persist();
        console.log('LocalAdapter: deletePresence', { presenceKey, currentUser: currentUser?.email });
    }

    // Budgets
    async getBudgetByActivity(activityId: string) {
        return this.state.budgets.find(b => b.activityId === activityId) || null;
    }

    async saveBudget(budget: any, currentUser: any) {
        const index = this.state.budgets.findIndex(b => b.activityId === budget.activityId);
        if (index >= 0) {
            this.state.budgets[index] = budget;
        } else {
            this.state.budgets.push(budget);
        }
        this.persist();
        console.log('LocalAdapter: saveBudget', { activityId: budget.activityId, currentUser: currentUser?.email });
    }

    // Configuration
    async getPatrols() {
        return this.state.patrols;
    }

    async savePatrols(list: any, currentUser: any) {
        this.state.patrols = list;
        this.persist();
        console.log('LocalAdapter: savePatrols', { count: list.length, currentUser: currentUser?.email });
    }

    // Deadlines / Scadenze
    async getCustomDeadlines() {
        return this.state.scadenze || [];
    }

    async addCustomDeadline(deadline: any, currentUser: any) {
        const id = 'd_' + Math.random().toString(36).slice(2, 10);
        const item = {
            id,
            ...deadline,
            completata: Boolean(deadline.completata),
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.email || 'user'
        };
        if (!this.state.scadenze) this.state.scadenze = [];
        this.state.scadenze.push(item);
        this.persist();
        console.log('LocalAdapter: addCustomDeadline', { id, currentUser: currentUser?.email });
        return id;
    }

    async updateCustomDeadline(id: string, deadline: any, currentUser: any) {
        if (!this.state.scadenze) this.state.scadenze = [];
        const index = this.state.scadenze.findIndex(d => d.id === id);
        if (index >= 0) {
            this.state.scadenze[index] = {
                ...this.state.scadenze[index],
                ...deadline,
                updatedAt: new Date().toISOString()
            };
            this.persist();
            console.log('LocalAdapter: updateCustomDeadline', { id, currentUser: currentUser?.email });
        }
    }

    async deleteCustomDeadline(id: string, currentUser: any) {
        if (!this.state.scadenze) return;
        this.state.scadenze = this.state.scadenze.filter(d => d.id !== id);
        this.persist();
        console.log('LocalAdapter: deleteCustomDeadline', { id, currentUser: currentUser?.email });
    }

    // Inventory / Scorte
    // Inventory / Scorte & Liste
    async getListeScorte(): Promise<string[]> {
        if (!this.state.listeScorte || !Array.isArray(this.state.listeScorte) || this.state.listeScorte.length === 0) {
            this.state.listeScorte = ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
            this.persist();
        }
        return [...this.state.listeScorte];
    }

    async addListaScorta(nome: string, currentUser?: any): Promise<string> {
        const cleanName = (nome || '').trim();
        if (!cleanName) return '';
        if (!this.state.listeScorte) this.state.listeScorte = [];
        if (!this.state.listeScorte.includes(cleanName)) {
            this.state.listeScorte.push(cleanName);
            this.persist();
        }
        console.log('LocalAdapter: addListaScorta', { nome: cleanName, currentUser: currentUser?.email });
        return cleanName;
    }

    async deleteListaScorta(nome: string, currentUser?: any): Promise<void> {
        const cleanName = (nome || '').trim();
        if (!cleanName || !this.state.listeScorte) return;
        this.state.listeScorte = this.state.listeScorte.filter(l => l !== cleanName);
        if (this.state.scorte) {
            this.state.scorte.forEach(s => {
                if ((s.lista || 'Generale') === cleanName) {
                    s.lista = 'Generale';
                }
            });
        }
        this.persist();
        console.log('LocalAdapter: deleteListaScorta', { nome: cleanName, currentUser: currentUser?.email });
    }

    async renameListaScorta(oldName: string, newName: string, currentUser?: any): Promise<void> {
        const oldClean = (oldName || '').trim();
        const newClean = (newName || '').trim();
        if (!oldClean || !newClean || !this.state.listeScorte) return;

        const idx = this.state.listeScorte.indexOf(oldClean);
        if (idx >= 0) {
            this.state.listeScorte[idx] = newClean;
        } else if (!this.state.listeScorte.includes(newClean)) {
            this.state.listeScorte.push(newClean);
        }

        if (this.state.scorte) {
            this.state.scorte.forEach(s => {
                if ((s.lista || 'Generale') === oldClean) {
                    s.lista = newClean;
                }
            });
        }
        this.persist();
        console.log('LocalAdapter: renameListaScorta', { oldName: oldClean, newName: newClean, currentUser: currentUser?.email });
    }

    async getScorte(): Promise<any[]> {
        return this.state.scorte || [];
    }

    async addScorta(item: any, currentUser?: any): Promise<string> {
        const id = 'sc_' + Math.random().toString(36).slice(2, 10);
        const record = {
            id,
            nome: (item.nome || '').trim(),
            categoria: (item.categoria || 'Generale').trim(),
            lista: (item.lista || 'Generale').trim(),
            quantita: Number(item.quantita) || 0,
            quantitaMinima: Number(item.quantitaMinima) || 0,
            unitaMisura: (item.unitaMisura || 'pz').trim(),
            prezzoUnitario: Number(item.prezzoUnitario) || 0,
            dataControllo: item.dataControllo || new Date().toISOString().split('T')[0],
            note: (item.note || '').trim(),
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.email || 'user'
        };
        if (!this.state.scorte) this.state.scorte = [];
        this.state.scorte.push(record);
        this.persist();
        console.log('LocalAdapter: addScorta', { id, currentUser: currentUser?.email });
        return id;
    }

    async updateScorta(id: string, updates: any, currentUser?: any): Promise<void> {
        if (!this.state.scorte) this.state.scorte = [];
        const index = this.state.scorte.findIndex(s => s.id === id);
        if (index >= 0) {
            this.state.scorte[index] = {
                ...this.state.scorte[index],
                ...updates,
                lista: updates.lista !== undefined ? updates.lista.trim() : (this.state.scorte[index].lista || 'Generale'),
                quantita: updates.quantita !== undefined ? Number(updates.quantita) : this.state.scorte[index].quantita,
                quantitaMinima: updates.quantitaMinima !== undefined ? Number(updates.quantitaMinima) : this.state.scorte[index].quantitaMinima,
                prezzoUnitario: updates.prezzoUnitario !== undefined ? Number(updates.prezzoUnitario) : this.state.scorte[index].prezzoUnitario,
                updatedAt: new Date().toISOString()
            };
            this.persist();
            console.log('LocalAdapter: updateScorta', { id, currentUser: currentUser?.email });
        }
    }

    async deleteScorta(id: string, currentUser?: any): Promise<void> {
        if (!this.state.scorte) return;
        this.state.scorte = this.state.scorte.filter(s => s.id !== id);
        this.persist();
        console.log('LocalAdapter: deleteScorta', { id, currentUser: currentUser?.email });
    }

    async importScorteBatch(items: any[], replaceExisting: boolean = false, currentUser?: any): Promise<number> {
        if (!this.state.scorte || replaceExisting) this.state.scorte = [];
        const now = new Date().toISOString();
        const dateStr = now.split('T')[0];

        const records = items.map(item => ({
            id: 'sc_' + Math.random().toString(36).slice(2, 10),
            nome: (item.nome || '').trim(),
            categoria: (item.categoria || 'Generale').trim(),
            lista: (item.lista || 'Generale').trim(),
            quantita: Number(item.quantita) || 0,
            quantitaMinima: Number(item.quantitaMinima) || 0,
            unitaMisura: (item.unitaMisura || 'pz').trim(),
            prezzoUnitario: Number(item.prezzoUnitario) || 0,
            dataControllo: item.dataControllo || dateStr,
            note: (item.note || '').trim(),
            createdAt: now,
            createdBy: currentUser?.email || 'user'
        }));

        this.state.scorte.push(...records);
        this.persist();
        console.log('LocalAdapter: importScorteBatch', { count: records.length, replace: replaceExisting });
        return records.length;
    }
}
