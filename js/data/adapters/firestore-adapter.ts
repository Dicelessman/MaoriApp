// @ts-nocheck
/**
 * FirestoreAdapter - Adattatore per dati remoti su Firebase
 * @module data/adapters/firestore-adapter
 */

// @ts-ignore
import {
    db, auth, messaging,
    collection, doc, getDocs, addDoc, setDoc, deleteDoc, updateDoc,
    onSnapshot, getDoc, query, limit, startAfter, orderBy, where, Timestamp
} from '../../core/firebase.js';
import { COLLECTIONS } from '../../utils/constants.js';

export class FirestoreAdapter {
    private db: any;
    private auth: any;
    private messaging: any;
    private cols: { [key: string]: any };

    constructor() {
        this.db = db;
        this.auth = auth;
        this.messaging = messaging as any;
        this.cols = {
            scouts: collection(db, COLLECTIONS.SCOUTS),
            staff: collection(db, COLLECTIONS.STAFF),
            activities: collection(db, COLLECTIONS.ACTIVITIES),
            presences: collection(db, COLLECTIONS.PRESENCES)
        };
    }

    async loadAll(options: any = {}) {
        const { useSelect = false, pageSize = null } = options;
        const timers: any = { start: (typeof performance !== 'undefined' ? performance.now() : Date.now()) };
        const timed = async (label: string, promise: Promise<any>) => {
            const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            const res = await promise;
            const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            timers[label] = Math.round(t1 - t0);
            return res;
        };

        // Query ottimizzate: usa .select() solo per campi necessari se richiesto
        // Nota: per ora manteniamo tutti i campi per retrocompatibilità
        const [scoutsSnap, staffSnap, actsSnap, presSnap] = await Promise.all([
            timed('scouts', getDocs(this.cols.scouts)),
            timed('staff', getDocs(this.cols.staff)),
            timed('activities', getDocs(this.cols.activities)),
            timed('presences', getDocs(this.cols.presences))
        ]);
        const tEnd = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        timers.total = Math.round(tEnd - timers.start);
        try { console.info('[Perf] Firestore loadAll ms:', timers); } catch { }

        return {
            scouts: scoutsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
            staff: staffSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
            activities: actsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
            presences: presSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        };
    }

    /**
     * Carica dati paginati da una collezione
     */
    async loadCollectionPaginated(collectionName: string, options: any = {}) {
        const {
            pageSize = 50,
            orderByField = null,
            orderDirection = 'asc',
            startAfterDoc = null,
            selectFields = null
        } = options;

        let q = query(this.cols[collectionName]);

        // Ordina se richiesto
        if (orderByField) {
            q = query(q, orderBy(orderByField, orderDirection));
        }

        // Pagina
        if (pageSize) {
            q = query(q, limit(pageSize));
        }

        // Continua da documento specifico
        if (startAfterDoc) {
            q = query(q, startAfter(startAfterDoc));
        }

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

        return { docs, lastDoc, hasMore: snapshot.docs.length === pageSize };
    }

    /**
     * Query con filtri e limiti
     */
    async queryCollection(collectionName: string, filters: any = {}, options: any = {}) {
        let q = query(this.cols[collectionName]);

        // Applica filtri
        Object.entries(filters).forEach(([field, value]) => {
            q = query(q, where(field, '==', value));
        });

        // Ordinamento
        if (options.orderBy) {
            q = query(q, orderBy(options.orderBy, options.orderDirection || 'asc'));
        }

        // Limite
        if (options.limit) {
            q = query(q, limit(options.limit));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    }



    // Activities
    async addActivity({ tipo, data, dataFine, descrizione, costo }: any, currentUser: any) {
        // Converti data a Timestamp se è un Date object
        const dataTimestamp = data instanceof Date ? Timestamp.fromDate(data) : data;
        const dataFineTimestamp = dataFine instanceof Date ? Timestamp.fromDate(dataFine) : (dataFine || null);

        // Converti costo a numero (se è stringa o undefined/null)
        const costoNum = costo !== undefined && costo !== null && costo !== '' ? Number(costo) : 0;

        const ref = await addDoc(this.cols.activities, {
            tipo,
            data: dataTimestamp,
            dataFine: dataFineTimestamp,
            descrizione,
            costo: costoNum
        });
        return ref.id;
    }

    async updateActivity({ id, tipo, data, dataFine, descrizione, costo }: any, currentUser: any) {
        // Converti data a Timestamp se è un Date object
        const dataTimestamp = data instanceof Date ? Timestamp.fromDate(data) : data;
        const dataFineTimestamp = dataFine instanceof Date ? Timestamp.fromDate(dataFine) : (dataFine || null);

        // Converti costo a numero (se è stringa o undefined/null)
        const costoNum = costo !== undefined && costo !== null && costo !== '' ? Number(costo) : 0;

        await setDoc(doc(this.db, 'activities', id), {
            tipo,
            data: dataTimestamp,
            dataFine: dataFineTimestamp,
            descrizione,
            costo: costoNum
        }, { merge: true });
    }

    async deleteActivity(id: string, currentUser: any) {
        await deleteDoc(doc(this.db, 'activities', id));
    }

    // Staff
    async addStaff({ nome, cognome, email }: any, currentUser: any) {
        const ref = await addDoc(this.cols.staff, { nome, cognome, email });
        return ref.id;
    }

    async updateStaff({ id, nome, cognome, email, ruolo }: any, currentUser: any) {
        await setDoc(doc(this.db, 'staff', id), { nome, cognome, email, ruolo }, { merge: true });
    }

    async deleteStaff(id: string, currentUser: any) {
        await deleteDoc(doc(this.db, 'staff', id));
    }

    // Scouts
    async addScout({ nome, cognome }: any, currentUser: any) {
        const ref = await addDoc(this.cols.scouts, { nome, cognome });
        return ref.id;
    }

    async updateScout({ id, ...data }: any, currentUser: any) {
        await setDoc(doc(this.db, 'scouts', id), data, { merge: true });
    }

    async deleteScout(id: string, currentUser: any) {
        await deleteDoc(doc(this.db, 'scouts', id));
    }

    // Presences
    async updatePresence({ field, value, scoutId, activityId }: any, currentUser: any) {
        const presenceRef = doc(this.db, 'presences', `${scoutId}_${activityId}`);
        const presenceSnap = await getDoc(presenceRef);

        if (presenceSnap.exists()) {
            await setDoc(presenceRef, { [field]: value }, { merge: true });
        } else {
            await setDoc(presenceRef, {
                esploratoreId: scoutId,
                attivitaId: activityId,
                [field]: value
            });
        }
    }

    async deletePresence(presenceKey: string, currentUser?: any) {
        await deleteDoc(doc(this.db, 'presences', presenceKey));
    }

    // Budgets
    async getBudgetByActivity(activityId: string) {
        const docRef = doc(this.db, 'budgets', activityId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return { activityId, ...snap.data() };
        }
        return null;
    }

    async saveBudget(budget: any, currentUser: any) {
        await setDoc(doc(this.db, 'budgets', budget.activityId), budget, { merge: true });
    }

    // Configuration
    async getPatrols() {
        const docRef = doc(this.db, 'configuration', 'pattuglie');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            return snap.data().list || [];
        }
        return ["Aironi", "Marmotte"]; // Default
    }

    async savePatrols(list: any, currentUser: any) {
        await setDoc(doc(this.db, 'configuration', 'pattuglie'), { list }, { merge: true });
    }

    // Deadlines / Scadenze
    async getCustomDeadlines() {
        try {
            const snap = await getDocs(collection(this.db, 'scadenze'));
            return snap.docs.map((d: any) => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt,
                updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate() : d.data().updatedAt
            }));
        } catch (error) {
            console.error('Error fetching custom deadlines from Firestore:', error);
            return [];
        }
    }

    async addCustomDeadline(deadline: any, currentUser: any) {
        const payload = {
            ...deadline,
            completata: Boolean(deadline.completata),
            createdAt: Timestamp.now(),
            createdBy: currentUser?.email || currentUser?.uid || 'user'
        };
        const ref = await addDoc(collection(this.db, 'scadenze'), payload);
        return ref.id;
    }

    async updateCustomDeadline(id: string, deadline: any, currentUser: any) {
        const payload = {
            ...deadline,
            updatedAt: Timestamp.now()
        };
        await setDoc(doc(this.db, 'scadenze', id), payload, { merge: true });
    }

    async deleteCustomDeadline(id: string, currentUser: any) {
        await deleteDoc(doc(this.db, 'scadenze', id));
    }

    // Inventory / Scorte & Liste
    async getListeScorte(): Promise<string[]> {
        try {
            const snap = await getDocs(collection(this.db, 'liste_scorte'));
            if (snap.empty) {
                const defaults = ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
                for (const nome of defaults) {
                    await this.addListaScorta(nome, { email: 'system' });
                }
                return defaults;
            }
            const names = snap.docs.map((d: any) => d.data().nome).filter(Boolean);
            if (!names.includes('Generale')) names.push('Generale');
            return names;
        } catch (error) {
            console.error('Error fetching liste_scorte from Firestore:', error);
            return ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
        }
    }

    async addListaScorta(nome: string, currentUser?: any): Promise<string> {
        const cleanName = (nome || '').trim();
        if (!cleanName) return '';
        try {
            const snap = await getDocs(collection(this.db, 'liste_scorte'));
            const exists = snap.docs.some((d: any) => d.data().nome?.toLowerCase() === cleanName.toLowerCase());
            if (!exists) {
                await addDoc(collection(this.db, 'liste_scorte'), {
                    nome: cleanName,
                    createdAt: Timestamp.now(),
                    createdBy: currentUser?.email || 'user'
                });
            }
            return cleanName;
        } catch (error) {
            console.error('Error adding lista_scorta:', error);
            return cleanName;
        }
    }

    async deleteListaScorta(nome: string, currentUser?: any): Promise<void> {
        const cleanName = (nome || '').trim();
        if (!cleanName) return;
        try {
            const snap = await getDocs(collection(this.db, 'liste_scorte'));
            for (const d of snap.docs) {
                if (d.data().nome === cleanName) {
                    await deleteDoc(d.ref);
                }
            }
            const scorteSnap = await getDocs(collection(this.db, 'scorte'));
            for (const d of scorteSnap.docs) {
                if (d.data().lista === cleanName) {
                    await setDoc(d.ref, { lista: 'Generale', updatedAt: Timestamp.now() }, { merge: true });
                }
            }
        } catch (error) {
            console.error('Error deleting lista_scorta:', error);
        }
    }

    async renameListaScorta(oldName: string, newName: string, currentUser?: any): Promise<void> {
        const oldClean = (oldName || '').trim();
        const newClean = (newName || '').trim();
        if (!oldClean || !newClean) return;
        try {
            const snap = await getDocs(collection(this.db, 'liste_scorte'));
            for (const d of snap.docs) {
                if (d.data().nome === oldClean) {
                    await setDoc(d.ref, { nome: newClean, updatedAt: Timestamp.now() }, { merge: true });
                }
            }
            const scorteSnap = await getDocs(collection(this.db, 'scorte'));
            for (const d of scorteSnap.docs) {
                if (d.data().lista === oldClean) {
                    await setDoc(d.ref, { lista: newClean, updatedAt: Timestamp.now() }, { merge: true });
                }
            }
        } catch (error) {
            console.error('Error renaming lista_scorta:', error);
        }
    }

    // Inventory / Scorte
    async getScorte(): Promise<any[]> {
        try {
            const snap = await getDocs(collection(this.db, 'scorte'));
            if (snap.empty) {
                const testItems = [
                    {
                        nome: 'Picchetti tenda a V (20 cm)',
                        categoria: 'Campeggio',
                        lista: 'Campo Estivo',
                        quantita: 24,
                        quantitaMinima: 50,
                        unitaMisura: 'pz',
                        prezzoUnitario: 1.20,
                        dataControllo: new Date().toISOString().split('T')[0],
                        note: 'Per pattuglie, cassa verde'
                    },
                    {
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
                ];
                for (const item of testItems) {
                    await this.addScorta(item, { email: 'system' });
                }
                const newSnap = await getDocs(collection(this.db, 'scorte'));
                return newSnap.docs.map(d => ({ id: d.id, lista: d.data().lista || 'Generale', ...d.data() }));
            }
            return snap.docs.map((d: any) => ({
                id: d.id,
                lista: d.data().lista || 'Generale',
                ...d.data(),
                createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt,
                updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate() : d.data().updatedAt
            }));
        } catch (error) {
            console.error('Error fetching scorte from Firestore:', error);
            return [];
        }
    }

    async addScorta(item: any, currentUser?: any): Promise<string> {
        const payload = {
            nome: (item.nome || '').trim(),
            categoria: (item.categoria || 'Generale').trim(),
            lista: (item.lista || 'Generale').trim(),
            quantita: Number(item.quantita) || 0,
            quantitaMinima: Number(item.quantitaMinima) || 0,
            unitaMisura: (item.unitaMisura || 'pz').trim(),
            prezzoUnitario: Number(item.prezzoUnitario) || 0,
            dataControllo: item.dataControllo || new Date().toISOString().split('T')[0],
            note: (item.note || '').trim(),
            createdAt: Timestamp.now(),
            createdBy: currentUser?.email || currentUser?.uid || 'user'
        };
        const ref = await addDoc(collection(this.db, 'scorte'), payload);
        return ref.id;
    }

    async updateScorta(id: string, updates: any, currentUser?: any): Promise<void> {
        const payload: any = {
            ...updates,
            updatedAt: Timestamp.now()
        };
        if (payload.lista !== undefined) payload.lista = (payload.lista || 'Generale').trim();
        if (payload.quantita !== undefined) payload.quantita = Number(payload.quantita);
        if (payload.quantitaMinima !== undefined) payload.quantitaMinima = Number(payload.quantitaMinima);
        if (payload.prezzoUnitario !== undefined) payload.prezzoUnitario = Number(payload.prezzoUnitario);

        await setDoc(doc(this.db, 'scorte', id), payload, { merge: true });
    }

    async deleteScorta(id: string, currentUser?: any): Promise<void> {
        await deleteDoc(doc(this.db, 'scorte', id));
    }

    async importScorteBatch(items: any[], replaceExisting: boolean = false, currentUser?: any): Promise<number> {
        if (replaceExisting) {
            const snap = await getDocs(collection(this.db, 'scorte'));
            for (const d of snap.docs) {
                await deleteDoc(d.ref);
            }
        }
        let count = 0;
        for (const item of items) {
            await this.addScorta(item, currentUser);
            count++;
        }
        return count;
    }

    // ============================================================
    // Gara di Reparto - Categorie
    // ============================================================
    async getGaraCategories(annoScout: string | null = null): Promise<any[]> {
        try {
            const snap = await getDocs(collection(this.db, 'gara_categories'));
            if (snap.empty) {
                const defaultCats = [
                    { nome: 'Puntualità & Presenze', descrizione: 'Presenza puntuale in uniforme alle riunioni e uscite', icona: '⏰', puntiDefault: 10, annoScout: 'all', attiva: true },
                    { nome: 'Uniforme & Tenuta', descrizione: 'Uniforme completa e fazzolettone in ordine', icona: '👔', puntiDefault: 5, annoScout: 'all', attiva: true },
                    { nome: 'Angolo & Cassa di Ptg.', descrizione: 'Cura e pulizia angolo di pattuglia e cassa materiali', icona: '⛺', puntiDefault: 15, annoScout: 'all', attiva: true },
                    { nome: 'Animazione & Fuoco', descrizione: 'Bans, canti, sketch e partecipazione al fuoco serale', icona: '🔥', puntiDefault: 15, annoScout: 'all', attiva: true },
                    { nome: 'Cucina & Cambusa', descrizione: 'Menù, pulizia, puntualità dei pasti e gestione scorte', icona: '🍳', puntiDefault: 20, annoScout: 'all', attiva: true },
                    { nome: 'Giochi & Grandi Giochi', descrizione: 'Vittoria o piazzamento nelle sfide e tornei di reparto', icona: '🎯', puntiDefault: 20, annoScout: 'all', attiva: true },
                    { nome: 'Impresa di Pattuglia', descrizione: 'Ideazione, progettazione e realizzazione dell\'impresa', icona: '🛠️', puntiDefault: 50, annoScout: 'all', attiva: true },
                    { nome: 'Spirito di Pattuglia & Stile', descrizione: 'Stile scout, lealtà, allegria e spirito di servizio', icona: '⚜️', puntiDefault: 10, annoScout: 'all', attiva: true }
                ];
                for (const cat of defaultCats) {
                    await this.addGaraCategory(cat, { email: 'system' });
                }
                const newSnap = await getDocs(collection(this.db, 'gara_categories'));
                const list = newSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
                if (!annoScout || annoScout === 'all') return list;
                return list.filter((c: any) => !c.annoScout || c.annoScout === 'all' || c.annoScout === annoScout);
            }
            const list = snap.docs.map((d: any) => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt,
                updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate() : d.data().updatedAt
            }));
            if (!annoScout || annoScout === 'all') return list;
            return list.filter((c: any) => !c.annoScout || c.annoScout === 'all' || c.annoScout === annoScout);
        } catch (e) {
            console.error('Error fetching gara_categories from Firestore:', e);
            return [];
        }
    }

    async addGaraCategory(category: any, currentUser?: any): Promise<string> {
        const payload = {
            nome: (category.nome || '').trim(),
            descrizione: (category.descrizione || '').trim(),
            icona: (category.icona || '🏆').trim(),
            puntiDefault: Number(category.puntiDefault) || 10,
            annoScout: (category.annoScout || 'all').trim(),
            attiva: category.attiva !== undefined ? !!category.attiva : true,
            createdAt: Timestamp.now(),
            createdBy: currentUser?.email || currentUser?.uid || 'user'
        };
        const ref = await addDoc(collection(this.db, 'gara_categories'), payload);
        return ref.id;
    }

    async updateGaraCategory(id: string, updates: any, currentUser?: any): Promise<void> {
        const payload = {
            ...updates,
            updatedAt: Timestamp.now()
        };
        if (payload.puntiDefault !== undefined) payload.puntiDefault = Number(payload.puntiDefault);
        await setDoc(doc(this.db, 'gara_categories', id), payload, { merge: true });
    }

    async deleteGaraCategory(id: string, currentUser?: any): Promise<void> {
        await deleteDoc(doc(this.db, 'gara_categories', id));
    }

    // ============================================================
    // Gara di Reparto - Punti
    // ============================================================
    async getGaraPunti(annoScout: string | null = null): Promise<any[]> {
        try {
            const snap = await getDocs(collection(this.db, 'gara_punti'));
            const list = snap.docs.map((d: any) => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt,
                updatedAt: d.data().updatedAt?.toDate ? d.data().updatedAt.toDate() : d.data().updatedAt
            }));
            if (!annoScout || annoScout === 'all') return list;
            return list.filter((p: any) => !p.annoScout || p.annoScout === annoScout);
        } catch (e) {
            console.error('Error fetching gara_punti from Firestore:', e);
            return [];
        }
    }

    async addGaraPunti(entryOrArray: any, currentUser?: any): Promise<string | string[]> {
        const entries = Array.isArray(entryOrArray) ? entryOrArray : [entryOrArray];
        const createdIds: string[] = [];
        for (const entry of entries) {
            const ptgName = (entry.pattuglia || entry.squadriglia || '').trim();
            const payload = {
                pattuglia: ptgName,
                squadriglia: ptgName,
                attivitaId: entry.attivitaId || null,
                attivitaNome: (entry.attivitaNome || '').trim(),
                categoriaId: entry.categoriaId || '',
                categoriaNome: (entry.categoriaNome || '').trim(),
                punti: Number(entry.punti) || 0,
                motivazione: (entry.motivazione || '').trim(),
                data: entry.data || new Date().toISOString().split('T')[0],
                annoScout: (entry.annoScout || '').trim(),
                assegnatoDa: currentUser?.email || 'staff',
                createdAt: Timestamp.now()
            };
            const ref = await addDoc(collection(this.db, 'gara_punti'), payload);
            createdIds.push(ref.id);
        }
        return Array.isArray(entryOrArray) ? createdIds : createdIds[0];
    }

    async updateGaraPunti(id: string, updates: any, currentUser?: any): Promise<void> {
        const payload = {
            ...updates,
            updatedAt: Timestamp.now()
        };
        if (payload.punti !== undefined) payload.punti = Number(payload.punti);
        await setDoc(doc(this.db, 'gara_punti', id), payload, { merge: true });
    }

    async deleteGaraPunti(id: string, currentUser?: any): Promise<void> {
        await deleteDoc(doc(this.db, 'gara_punti', id));
    }
}
