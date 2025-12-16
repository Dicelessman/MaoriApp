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
    async addActivity({ tipo, data, descrizione, costo }: any, currentUser: any) {
        // Converti data a Timestamp se è un Date object
        const dataTimestamp = data instanceof Date ? Timestamp.fromDate(data) : data;
        // Converti costo a numero (se è stringa o undefined/null)
        const costoNum = costo !== undefined && costo !== null && costo !== '' ? Number(costo) : 0;

        const ref = await addDoc(this.cols.activities, {
            tipo,
            data: dataTimestamp,
            descrizione,
            costo: costoNum
        });
        return ref.id;
    }

    async updateActivity({ id, tipo, data, descrizione, costo }: any, currentUser: any) {
        // Converti data a Timestamp se è un Date object
        const dataTimestamp = data instanceof Date ? Timestamp.fromDate(data) : data;
        // Converti costo a numero (se è stringa o undefined/null)
        const costoNum = costo !== undefined && costo !== null && costo !== '' ? Number(costo) : 0;

        await setDoc(doc(this.db, 'activities', id), {
            tipo,
            data: dataTimestamp,
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

    async updateStaff({ id, nome, cognome, email }: any, currentUser: any) {
        await setDoc(doc(this.db, 'staff', id), { nome, cognome, email }, { merge: true });
    }

    async deleteStaff(id: string, currentUser: any) {
        await deleteDoc(doc(this.db, 'staff', id));
    }

    // Scouts
    async addScout({ nome, cognome }: any, currentUser: any) {
        const ref = await addDoc(this.cols.scouts, { nome, cognome });
        return ref.id;
    }

    async updateScout({ id, nome, cognome, ...rest }: any, currentUser: any) {
        await setDoc(doc(this.db, 'scouts', id), { nome, cognome, ...rest }, { merge: true });
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
}
