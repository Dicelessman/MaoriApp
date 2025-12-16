/**
 * LocalAdapter - Adattatore per dati locali (offline/dev)
 * @module data/adapters/local-adapter
 */
export class LocalAdapter {
    state;
    constructor() {
        const saved = JSON.parse(localStorage.getItem('presenziario-state') || '{}');
        this.state = {
            scouts: saved.scouts || [
                { id: 's1', nome: 'Mario', cognome: 'Rossi' },
                { id: 's2', nome: 'Luisa', cognome: 'Bianchi' },
                { id: 's3', nome: 'Andrea', cognome: 'Verdi' }
            ],
            staff: saved.staff || [
                { id: 'st1', nome: 'Giulia', cognome: 'Esposito' },
                { id: 'st2', nome: 'Marco', cognome: 'Gallo' }
            ],
            activities: saved.activities || [
                { id: 'a1', tipo: 'Uscita', data: new Date('2024-08-18'), descrizione: 'Uscita al lago', costo: '10' },
                { id: 'a2', tipo: 'Riunione', data: new Date('2024-08-25'), descrizione: 'Riunione settimanale', costo: '0' },
                { id: 'a3', tipo: 'Attività lunga', data: new Date('2024-09-01'), descrizione: 'Escursione in montagna', costo: '5' },
                { id: 'a4', tipo: 'Campo', data: new Date('2024-07-15'), descrizione: 'Campo Estivo', costo: '150' }
            ],
            presences: saved.presences || [
                { esploratoreId: 's1', attivitaId: 'a1', stato: 'Presente', pagato: true, tipoPagamento: 'Contanti' },
                { esploratoreId: 's2', attivitaId: 'a1', stato: 'Assente', pagato: false, tipoPagamento: null },
                { esploratoreId: 's3', attivitaId: 'a1', stato: 'Presente', pagato: true, tipoPagamento: 'Bonifico' }
            ]
        };
        // Restore dates
        this.state.activities.forEach(a => {
            if (typeof a.data === 'string')
                a.data = new Date(a.data);
        });
    }
    persist() {
        localStorage.setItem('presenziario-state', JSON.stringify(this.state));
    }
    async loadAll() {
        return this.state;
    }
    // Activities
    async addActivity({ tipo, data, descrizione, costo }, currentUser) {
        const id = 'a' + (Math.random().toString(36).slice(2, 8));
        this.state.activities.push({ id, tipo, data, descrizione, costo });
        this.persist();
        console.log('LocalAdapter: addActivity', { tipo, data, descrizione, costo, id, currentUser: currentUser?.email });
        return id;
    }
    async updateActivity({ id, tipo, data, descrizione, costo }, currentUser) {
        const a = this.state.activities.find(x => x.id === id);
        if (a) {
            a.tipo = tipo;
            a.data = data;
            a.descrizione = descrizione;
            a.costo = costo;
            this.persist();
        }
        console.log('LocalAdapter: updateActivity', { id, tipo, data, descrizione, costo, currentUser: currentUser?.email });
    }
    async deleteActivity(id, currentUser) {
        this.state.activities = this.state.activities.filter(a => a.id !== id);
        this.state.presences = this.state.presences.filter(p => p.attivitaId !== id);
        this.persist();
        console.log('LocalAdapter: deleteActivity', { id, currentUser: currentUser?.email });
    }
    // Staff
    async addStaff({ nome, cognome, email }, currentUser) {
        const id = 'st' + (Math.random().toString(36).slice(2, 8));
        this.state.staff.push({ id, nome, cognome, email });
        this.persist();
        console.log('LocalAdapter: addStaff', { nome, cognome, email, id, currentUser: currentUser?.email });
        return id;
    }
    async updateStaff({ id, nome, cognome, email }, currentUser) {
        const m = this.state.staff.find(s => s.id === id);
        if (m) {
            m.nome = nome;
            m.cognome = cognome;
            m.email = email;
            this.persist();
        }
        console.log('LocalAdapter: updateStaff', { id, nome, cognome, email, currentUser: currentUser?.email });
    }
    async deleteStaff(id, currentUser) {
        this.state.staff = this.state.staff.filter(s => s.id !== id);
        this.persist();
        console.log('LocalAdapter: deleteStaff', { id, currentUser: currentUser?.email });
    }
    // Scouts
    async addScout({ nome, cognome }, currentUser) {
        const id = 's' + (Math.random().toString(36).slice(2, 8));
        this.state.scouts.push({ id, nome, cognome });
        this.state.activities.forEach(a => this.state.presences.push({ esploratoreId: id, attivitaId: a.id, stato: 'NR', pagato: false, tipoPagamento: null }));
        this.persist();
        console.log('LocalAdapter: addScout', { nome, cognome, id, currentUser: currentUser?.email });
        return id;
    }
    async updateScout({ id, nome, cognome, ...rest }, currentUser) {
        const s = this.state.scouts.find(x => x.id === id);
        if (s) {
            // Unisci tutti i campi passati
            Object.assign(s, { nome, cognome });
            // Se sono stati passati altri campi nel payload originale, includili
            Object.assign(s, rest);
            this.persist();
        }
        console.log('LocalAdapter: updateScout', { id, currentUser: currentUser?.email });
    }
    async deleteScout(id, currentUser) {
        this.state.scouts = this.state.scouts.filter(s => s.id !== id);
        this.state.presences = this.state.presences.filter(p => p.esploratoreId !== id);
        this.persist();
        console.log('LocalAdapter: deleteScout', { id, currentUser: currentUser?.email });
    }
    // Presences 
    async updatePresence({ field, value, scoutId, activityId }, currentUser) {
        const p = this.state.presences.find(x => x.esploratoreId === scoutId && x.attivitaId === activityId);
        if (!p)
            return;
        p[field] = value;
        if (field === 'pagato' && !value)
            p.tipoPagamento = null;
        this.persist();
        console.log('LocalAdapter: updatePresence', { field, value, scoutId, activityId, currentUser: currentUser?.email });
    }
}
