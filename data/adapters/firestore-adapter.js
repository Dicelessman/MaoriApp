// @ts-nocheck
/**
 * FirestoreAdapter - Adattatore per dati remoti su Firebase
 * @module data/adapters/firestore-adapter
 */
// @ts-ignore
import { db, auth, messaging, collection, doc, getDocs, addDoc, setDoc, deleteDoc, getDoc, query, limit, startAfter, orderBy, where, Timestamp } from '../../core/firebase.js';
import { COLLECTIONS } from '../../utils/constants.js';
export class FirestoreAdapter {
    db;
    auth;
    messaging;
    cols;
    constructor() {
        this.db = db;
        this.auth = auth;
        this.messaging = messaging;
        this.cols = {
            scouts: collection(db, COLLECTIONS.SCOUTS),
            staff: collection(db, COLLECTIONS.STAFF),
            activities: collection(db, COLLECTIONS.ACTIVITIES),
            presences: collection(db, COLLECTIONS.PRESENCES),
            auditLogs: collection(db, COLLECTIONS.AUDIT_LOGS)
        };
    }
    async loadAll(options = {}) {
        const { useSelect = false, pageSize = null } = options;
        const timers = { start: (typeof performance !== 'undefined' ? performance.now() : Date.now()) };
        const timed = async (label, promise) => {
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
        try {
            console.info('[Perf] Firestore loadAll ms:', timers);
        }
        catch { }
        return {
            scouts: scoutsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            staff: staffSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            activities: actsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            presences: presSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        };
    }
    /**
     * Carica dati paginati da una collezione
     */
    async loadCollectionPaginated(collectionName, options = {}) {
        const { pageSize = 50, orderByField = null, orderDirection = 'asc', startAfterDoc = null, selectFields = null } = options;
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
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
        return { docs, lastDoc, hasMore: snapshot.docs.length === pageSize };
    }
    /**
     * Query con filtri e limiti
     */
    async queryCollection(collectionName, filters = {}, options = {}) {
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
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async addAuditLog(action, collection, documentId, changes, userId, userEmail) {
        try {
            await addDoc(this.cols.auditLogs, {
                action,
                collection,
                documentId,
                changes,
                userId,
                userEmail,
                timestamp: new Date()
            });
        }
        catch (error) {
            console.warn('Attenzione: salvataggio audit log fallito (permessi insufficienti? Core operazione OK).', error.code || error);
        }
    }
    // Activities
    async addActivity({ tipo, data, descrizione, costo }, currentUser) {
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
        if (currentUser) {
            await this.addAuditLog('create', 'activities', ref.id, { tipo, data: dataTimestamp, descrizione, costo: costoNum }, currentUser.uid, currentUser.email);
        }
        return ref.id;
    }
    async updateActivity({ id, tipo, data, descrizione, costo }, currentUser) {
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
        if (currentUser) {
            await this.addAuditLog('update', 'activities', id, { tipo, data: dataTimestamp, descrizione, costo: costoNum }, currentUser.uid, currentUser.email);
        }
    }
    async deleteActivity(id, currentUser) {
        await deleteDoc(doc(this.db, 'activities', id));
        if (currentUser) {
            await this.addAuditLog('delete', 'activities', id, {}, currentUser.uid, currentUser.email);
        }
    }
    // Staff
    async addStaff({ nome, cognome, email }, currentUser) {
        const ref = await addDoc(this.cols.staff, { nome, cognome, email });
        if (currentUser) {
            await this.addAuditLog('create', 'staff', ref.id, { nome, cognome, email }, currentUser.uid, currentUser.email);
        }
        return ref.id;
    }
    async updateStaff({ id, nome, cognome, email }, currentUser) {
        await setDoc(doc(this.db, 'staff', id), { nome, cognome, email }, { merge: true });
        if (currentUser) {
            await this.addAuditLog('update', 'staff', id, { nome, cognome, email }, currentUser.uid, currentUser.email);
        }
    }
    async deleteStaff(id, currentUser) {
        await deleteDoc(doc(this.db, 'staff', id));
        if (currentUser) {
            await this.addAuditLog('delete', 'staff', id, {}, currentUser.uid, currentUser.email);
        }
    }
    // Scouts
    async addScout({ nome, cognome }, currentUser) {
        const ref = await addDoc(this.cols.scouts, { nome, cognome });
        if (currentUser) {
            await this.addAuditLog('create', 'scouts', ref.id, { nome, cognome }, currentUser.uid, currentUser.email);
        }
        return ref.id;
    }
    async updateScout({ id, nome, cognome, ...rest }, currentUser) {
        await setDoc(doc(this.db, 'scouts', id), { nome, cognome, ...rest }, { merge: true });
        if (currentUser) {
            await this.addAuditLog('update', 'scouts', id, { nome, cognome, ...rest }, currentUser.uid, currentUser.email);
        }
    }
    async deleteScout(id, currentUser) {
        await deleteDoc(doc(this.db, 'scouts', id));
        if (currentUser) {
            await this.addAuditLog('delete', 'scouts', id, {}, currentUser.uid, currentUser.email);
        }
    }
    // Presences
    async updatePresence({ field, value, scoutId, activityId }, currentUser) {
        const presenceRef = doc(this.db, 'presences', `${scoutId}_${activityId}`);
        const presenceSnap = await getDoc(presenceRef);
        if (presenceSnap.exists()) {
            await setDoc(presenceRef, { [field]: value }, { merge: true });
        }
        else {
            await setDoc(presenceRef, {
                esploratoreId: scoutId,
                attivitaId: activityId,
                [field]: value
            });
        }
        if (currentUser) {
            await this.addAuditLog('update', 'presences', `${scoutId}_${activityId}`, { field, value, scoutId, activityId }, currentUser.uid, currentUser.email);
        }
    }
}
//# sourceMappingURL=firestore-adapter.js.map