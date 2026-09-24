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

    // Inventory / Scorte
    async getScorte(): Promise<any[]> {
        try {
            const snap = await getDocs(collection(this.db, 'scorte'));
            if (snap.empty) {
                const testItems = [
                    {
                        nome: 'Picchetti tenda a V (20 cm)',
                        categoria: 'Campeggio',
                        quantita: 24,
                        quantitaMinima: 50,
                        unitaMisura: 'pz',
                        prezzoUnitario: 1.20,
                        dataControllo: new Date().toISOString().split('T')[0],
                        note: 'Per squadriglie, cassa verde'
                    },
                    {
                        nome: 'Cordino canapa 6mm (matassa 50m)',
                        categoria: 'Pionieristica',
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
                return newSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
            return snap.docs.map((d: any) => ({
                id: d.id,
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
}
