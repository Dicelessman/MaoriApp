// shared.js - Codice condiviso tra tutte le pagine

// Import utility e validazione (se disponibili come moduli, altrimenti inline)
// Per retrocompatibilità, le funzioni sono anche disponibili inline se i moduli non sono caricati

// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, doc, getDocs, addDoc, setDoc, deleteDoc, updateDoc, onSnapshot, getDoc, query, limit, startAfter, orderBy, where, Timestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";

// ============== Data Layer ==============
class LocalAdapter {
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
    if (a) { a.tipo = tipo; a.data = data; a.descrizione = descrizione; a.costo = costo; this.persist(); }
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
    if (m) { m.nome = nome; m.cognome = cognome; m.email = email; this.persist(); }
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

  async updateScout({ id, nome, cognome }, currentUser) {
    const s = this.state.scouts.find(x => x.id === id);
    if (s) {
      // Unisci tutti i campi passati
      Object.assign(s, { nome, cognome });
      // Se sono stati passati altri campi nel payload originale, includili
      // Nota: la funzione è invocata con un oggetto già unito in DATA.updateScout
      for (const [k, v] of Object.entries(arguments[0] || {})) {
        if (k !== 'id') s[k] = v;
      }
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
    if (!p) return;
    p[field] = value;
    if (field === 'pagato' && !value) p.tipoPagamento = null;
    this.persist();
    console.log('LocalAdapter: updatePresence', { field, value, scoutId, activityId, currentUser: currentUser?.email });
  }
}

class FirestoreAdapter {
  constructor() {
    // Leggi configurazione Firebase da window.__FIREBASE_CONFIG__
    // (caricata da config.js generato durante il build)
    // Fallback ai valori hardcoded per compatibilità locale (se config.js non è presente)
    const firebaseConfig = (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) || {
      apiKey: "AIzaSyAoa8Rrlplr001PitiFrqBkrbEWL3TWrL4",
      authDomain: "presenziariomaori.firebaseapp.com",
      projectId: "presenziariomaori",
      storageBucket: "presenziariomaori.firebasestorage.app",
      messagingSenderId: "556210165397",
      appId: "1:556210165397:web:4f434e78fb97f02d116d9c"
    };
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.cols = {
      scouts: collection(this.db, 'scouts'),
      staff: collection(this.db, 'staff'),
      activities: collection(this.db, 'activities'),
      presences: collection(this.db, 'presences'),
      auditLogs: collection(this.db, 'auditLogs'),
    };
    this.auth = getAuth(this.app);
    
    // Initialize FCM only in browser and if service worker is supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        this.messaging = getMessaging(this.app);
      } catch (e) {
        console.warn('FCM initialization failed:', e);
        this.messaging = null;
      }
    }
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
    // Ma possiamo ottimizzare in futuro se necessario
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
      scouts: scoutsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      staff: staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      activities: actsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      presences: presSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }
  
  /**
   * Carica dati paginati da una collezione
   * @param {string} collectionName - Nome collezione
   * @param {Object} options - Opzioni query
   * @param {number} options.pageSize - Numero documenti per pagina
   * @param {string} options.orderByField - Campo per ordinamento
   * @param {string} options.orderDirection - Direzione ordinamento ('asc' | 'desc')
   * @param {any} options.startAfterDoc - Documento dopo cui iniziare (per paginazione)
   * @param {Array} options.selectFields - Campi da selezionare (non disponibile nel web SDK, ignorato)
   * @returns {Promise<{docs: Array, lastDoc: any}>}
   */
  async loadCollectionPaginated(collectionName, options = {}) {
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
    
    // Nota: .select() non è disponibile nel web SDK di Firestore
    // La limitazione dei campi è disponibile solo nell'Admin SDK (server-side)
    // Per il web SDK, tutti i campi vengono trasferiti (ma la cache di Firestore aiuta)
    // if (selectFields && Array.isArray(selectFields) && selectFields.length > 0) {
    //   q = query(q, select(...selectFields));
    // }
    
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return { docs, lastDoc, hasMore: snapshot.docs.length === pageSize };
  }
  
  /**
   * Query con filtri e limiti
   * @param {string} collectionName - Nome collezione
   * @param {Object} filters - Filtri {field: value}
   * @param {Object} options - Opzioni aggiuntive
   * @returns {Promise<Array>}
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
    
    // Nota: .select() non è disponibile nel web SDK di Firestore
    // La limitazione dei campi è disponibile solo nell'Admin SDK (server-side)
    // Per il web SDK, tutti i campi vengono trasferiti (ma la cache di Firestore aiuta)
    // if (options.select && Array.isArray(options.select) && options.select.length > 0) {
    //   q = query(q, select(...options.select));
    // }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    } catch (error) {
      console.error('Errore nel salvataggio audit log:', error);
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

  async updateScout({ id, nome, cognome }, currentUser) {
    await setDoc(doc(this.db, 'scouts', id), { nome, cognome, ...arguments[0] }, { merge: true });
    if (currentUser) {
      await this.addAuditLog('update', 'scouts', id, arguments[0], currentUser.uid, currentUser.email);
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
    } else {
      await setDoc(presenceRef, {
        esploratoreId: scoutId,
        attivitaId: activityId,
        [field]: value
      });
    }

    if (currentUser) {
      await this.addAuditLog(
        'update',
        'presences',
        `${scoutId}_${activityId}`,
        { field, value, scoutId, activityId },
        currentUser.uid,
        currentUser.email
      );
    }
  }
}

// ============== Cache Manager ==============
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minuti
  }

  get(key, allowStale = false) {
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

  set(key, value, ttl = null) {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      value,
      expires,
      needsRefresh: false,
      timestamp: Date.now()
    });
  }

  invalidate(key = null) {
    if (key === null) {
      this.cache.clear();
    } else {
      this.cache.delete(key);
    }
  }

  needsRefresh(key) {
    const entry = this.cache.get(key);
    return entry ? (entry.needsRefresh || Date.now() > entry.expires) : true;
  }
}

// Data Facade con cache
const DATA = {
  adapter: new LocalAdapter(),
  cache: new CacheManager(),
  
  useFirestore() { 
    this.adapter = new FirestoreAdapter();
    this.cache.invalidate();
  },
  
  async loadAll(forceRefresh = false) {
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
    this.cache.set(cacheKey, data);
    return data;
  },
  
  _invalidateCache() {
    this.cache.invalidate('loadAll');
    try { console.info('[Cache] Invalidated after write operation'); } catch { }
  },
  
  async addActivity(p, currentUser) {
    const result = await this.adapter.addActivity(p, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async updateActivity(p, currentUser) {
    const result = await this.adapter.updateActivity(p, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async deleteActivity(id, currentUser) {
    const result = await this.adapter.deleteActivity(id, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async addStaff(p, currentUser) {
    const result = await this.adapter.addStaff(p, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async updateStaff(p, currentUser) {
    const result = await this.adapter.updateStaff(p, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async deleteStaff(id, currentUser) {
    const result = await this.adapter.deleteStaff(id, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async addScout(p, currentUser) {
    const result = await this.adapter.addScout(p, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async updateScout(id, p, currentUser) {
    const result = await this.adapter.updateScout({ id, ...p }, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async deleteScout(id, currentUser) {
    const result = await this.adapter.deleteScout(id, currentUser);
    this._invalidateCache();
    return result;
  },
  
  async updatePresence(p, currentUser) {
    const result = await this.adapter.updatePresence(p, currentUser);
    this._invalidateCache();
    return result;
  },
};

// UI condiviso
const UI = {
  appVersion: 'v3',
  selectedStaffId: null,
  staffToDeleteId: null,
  scoutToDeleteId: null,
  activityToDeleteId: null,
  state: { scouts: [], staff: [], activities: [], presences: [] },
  currentUser: null,

  qs(selector) { return document.querySelector(selector); },
  qsa(selector) { return document.querySelectorAll(selector); },

  // Notifiche non bloccanti
  showToast(message, opts = {}) {
    const { type = 'success', duration = 2500 } = opts || {};
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.right = '1rem';
      container.style.bottom = '1rem';
      container.style.zIndex = '2000';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '.5rem';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }
    const bg = type === 'error' ? '#dc2626' : (type === 'info' ? '#374151' : (type === 'warning' ? '#eab308' : '#16a34a'));
    
    // Icone SVG
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="currentColor"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 11C9.44772 11 9 10.5523 9 10V6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6V10C11 10.5523 10.5523 11 10 11ZM10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15Z" fill="currentColor"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15ZM10 11C9.44772 11 9 10.5523 9 10V6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6V10C11 10.5523 10.5523 11 10 11Z" fill="currentColor"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L2 18H18L10 2ZM10 8C10.5523 8 11 8.44772 11 9V13C11 13.5523 10.5523 14 10 14C9.44772 14 9 13.5523 9 13V9C9 8.44772 9.44772 8 10 8ZM10 16C9.44772 16 9 15.5523 9 15C9 14.4477 9.44772 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16Z" fill="currentColor"/></svg>'
    };
    
    const toast = document.createElement('div');
    toast.style.background = bg;
    toast.style.color = 'white';
    toast.style.padding = '.75rem 1rem';
    toast.style.borderRadius = '.5rem';
    toast.style.boxShadow = '0 6px 18px rgba(0,0,0,.16)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(6px)';
    toast.style.transition = 'opacity .2s ease, transform .2s ease';
    toast.style.pointerEvents = 'auto';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '.75rem';
    toast.style.minWidth = '280px';
    toast.innerHTML = `
      <span style="display: flex; align-items: center; flex-shrink: 0;">
        ${icons[type] || icons.success}
      </span>
      <span style="flex: 1;">${message}</span>
    `;
    container.appendChild(toast);
    // animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    // auto dismiss
    const remove = () => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      setTimeout(() => toast.remove(), 200);
    };
    setTimeout(remove, Math.max(1000, duration));
    // click to dismiss
    toast.addEventListener('click', remove);
  },

  // ============== Loading States System ==============
  showLoadingOverlay(message = 'Caricamento...') {
    let overlay = document.getElementById('loading-overlay');
    if (overlay) {
      const msgEl = overlay.querySelector('.loading-message');
      if (msgEl) msgEl.textContent = message;
      overlay.style.display = 'flex';
      return;
    }
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.webkitBackdropFilter = 'blur(4px)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '1rem';
    overlay.innerHTML = `
      <div class="loading-spinner" style="
        width: 48px;
        height: 48px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <div class="loading-message" style="
        color: white;
        font-size: 1rem;
        font-weight: 500;
      ">${message}</div>
    `;
    if (!document.getElementById('loading-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'loading-spinner-style';
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }
    document.body.appendChild(overlay);
  },

  hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  },

  setButtonLoading(button, isLoading, originalText = null) {
    if (!button) return;
    if (isLoading) {
      button._originalText = originalText || button.textContent;
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
      button.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <span style="
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid currentColor;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          "></span>
          ${button._originalText}
        </span>
      `;
    } else {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = '';
      button.textContent = button._originalText || originalText || '';
      delete button._originalText;
    }
  },

  createSkeletonLoader(type, count = 1, options = {}) {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      if (type === 'table-row') {
        const colCount = options.cols || 4;
        const cols = Array(colCount).fill(0).map(() => 
          `<td class="p-4"><div class="skeleton skeleton-text short"></div></td>`
        ).join('');
        skeletons.push(`<tr class="skeleton-row"><td class="p-4 sticky left-0 bg-white"><div class="skeleton skeleton-text"></div></td>${cols}</tr>`);
      } else if (type === 'card') {
        skeletons.push(`
          <div class="skeleton bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4" style="height: ${options.height || 120}px;">
            <div class="skeleton skeleton-text mb-2"></div>
            <div class="skeleton skeleton-text short mb-2"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
          </div>
        `);
      } else if (type === 'list-item') {
        skeletons.push(`
          <div class="skeleton bg-white p-3 rounded border mb-2" style="height: ${options.height || 60}px;">
            <div class="skeleton skeleton-text"></div>
          </div>
        `);
      }
    }
    return skeletons.join('');
  },


  async init() {
    try {
      // Setup tema (dark mode) - deve essere PRIMA per evitare flash
      this.setupTheme();
      
      DATA.useFirestore();
      console.log('UI.init: Initializing...');
      this.logNetworkInfo();

      // Carica header e modali condivisi
      await this.loadSharedComponents();

      // Prefetch pagine usate spesso
      try {
        const links = [
          'presenze.html', 'dashboard.html', 'calendario.html', 'esploratori.html', 'staff.html', 'audit-logs.html'
        ];
        links.forEach(href => {
          const l = document.createElement('link');
          l.rel = 'prefetch';
          l.href = href;
          document.head.appendChild(l);
        });
      } catch { }

      // Nascondi la modale login fino a quando lo stato auth non è noto
      const loginModal = this.qs('#loginModal');
      if (loginModal) loginModal.classList.remove('show');

      // Wiring eventi condivisi (serve anche per il login form)
      this.setupEventListeners();

      // Inizializza Firebase Auth
      // Imposta persistenza locale della sessione sull'istanza corretta
      try { await setPersistence(DATA.adapter.auth, browserLocalPersistence); } catch (e) { console.warn('Auth persistence set failed:', e); }

      onAuthStateChanged(DATA.adapter.auth, async (user) => {
        this.currentUser = user;
        if (user) {
          const emailEl = this.qs('#loggedInUserEmail');
          if (emailEl) { emailEl.textContent = ''; try { emailEl.style.display = 'none'; } catch { } }
          this.qs('#logoutButton').style.display = 'block';
          this.closeModal('loginModal');
          this.showLoadingOverlay('Caricamento dati...');
          try {
            const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            this.state = await DATA.loadAll();
            const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            try { console.info('[Perf] DATA.loadAll total ms:', Math.round(t1 - t0)); } catch { }
            this.rebuildPresenceIndex();
            // Sincronizza preferenze utente
            await this.syncUserPreferences();
            // Inizializza FCM e controlla notifiche
            if (this.loadUserPreferences().notifications.enabled !== false) {
              await this.initializeFCM();
            }
            // Controlla notifiche attività, pagamenti e compleanni (dopo un breve delay)
            setTimeout(() => {
              this.checkActivityReminders();
              this.checkPaymentReminders();
              this.checkBirthdayReminders();
            }, 3000);
            // Selezione staff: auto-seleziona se email corrisponde, altrimenti apri modale
            const match = (this.state.staff || []).find(s => (s.email || '').toLowerCase() === (user.email || '').toLowerCase());
            if (match) {
              this.selectStaff(match.id);
            } else {
              this.renderStaffSelectionList();
              this.showModal('staffSelectionModal');
            }
            const r0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            this.renderCurrentPage();
            const r1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            try { console.info('[Perf] renderCurrentPage ms:', Math.round(r1 - r0)); } catch { }
          } finally {
            this.hideLoadingOverlay();
          }
        } else {
          const emailEl = this.qs('#loggedInUserEmail');
          if (emailEl) { emailEl.textContent = ''; try { emailEl.style.display = 'none'; } catch { } }
          this.qs('#logoutButton').style.display = 'none';
          this.showModal('loginModal');
        }
      });

      // Install prompt A2HS discreto
      this.setupInstallPrompt();
      // Avvia una sonda di connettività non bloccante
      this.runConnectivityProbe();
      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();

    } catch (error) {
      console.error('UI.init error:', error);
    }
  },

  async loadSharedComponents() {
    try {
      // Carica header condiviso
      const headerResponse = await fetch('shared.html');
      const headerHtml = await headerResponse.text();
      this.qs('#shared-header').innerHTML = headerHtml;

      // Carica modali condivisi
      const modalsResponse = await fetch('modals.html');
      const modalsHtml = await modalsResponse.text();
      this.qs('#shared-modals').innerHTML = modalsHtml;
    } catch (error) {
      console.error('Errore nel caricamento componenti condivisi:', error);
    }
  },

  setupEventListeners() {
    // Event listeners condivisi
    const logoutBtn = this.qs('#logoutButton');
    if (logoutBtn) logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(DATA.adapter.auth);
      } catch (error) {
        console.error('Logout error:', error);
      }
    });

    // Hamburger menu
    const hamburgerIcon = this.qs('.hamburger-icon');
    const navLinks = this.qs('.nav-links');
    if (hamburgerIcon && navLinks) {
      hamburgerIcon.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        hamburgerIcon.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        hamburgerIcon.setAttribute('aria-label', isActive ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione');
      });
      // Chiudi menu quando si clicca fuori
      document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !hamburgerIcon.contains(e.target) && 
            !navLinks.contains(e.target)) {
          navLinks.classList.remove('active');
          hamburgerIcon.setAttribute('aria-expanded', 'false');
          hamburgerIcon.setAttribute('aria-label', 'Apri menu di navigazione');
        }
      });
    }

    // Login form
    const loginForm = this.qs('#loginForm');
    if (loginForm && !loginForm._bound) {
      loginForm._bound = true;
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = this.qs('#loginEmail').value.trim();
        const password = this.qs('#loginPassword').value;
        const loginError = this.qs('#loginError');
        loginError.textContent = '';
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        this.setButtonLoading(submitBtn, true, originalText);
        console.log('Tentativo login per:', email);
        try {
          await signInWithEmailAndPassword(DATA.adapter.auth, email, password);
          console.log('Login riuscito per:', email);
        } catch (error) {
          console.error('Login error:', error.code, error.message);
          let msg = 'Accesso non riuscito.';
          switch (error.code) {
            case 'auth/invalid-email': msg = 'Email non valida.'; break;
            case 'auth/user-disabled': msg = 'Utente disabilitato.'; break;
            case 'auth/user-not-found': msg = 'Utente non trovato.'; break;
            case 'auth/wrong-password': msg = 'Password errata.'; break;
            case 'auth/too-many-requests': msg = 'Troppi tentativi, riprova più tardi.'; break;
          }
          loginError.textContent = msg;
          this.showToast(msg, { type: 'error' });
        } finally {
          this.setButtonLoading(submitBtn, false, originalText);
        }
      });
    }

      // Modali event listeners
      this.setupModalEventListeners();
      
      // Setup notifiche in-app (se loggato)
      if (this.currentUser?.uid) {
        this.setupInAppNotifications();
      }
  },

  // ============== Dark Mode / Theme Management ==============
  
  /**
   * Rileva preferenza tema sistema
   * @returns {string} 'dark' o 'light'
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },
  
  /**
   * Ottiene tema corrente (da localStorage o sistema)
   * @returns {string} 'dark' o 'light'
   */
  getCurrentTheme() {
    try {
      const saved = localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {
      console.warn('Errore lettura tema da localStorage:', e);
    }
    // Fallback a preferenza sistema
    return this.getSystemTheme();
  },
  
  /**
   * Applica tema alla pagina
   * @param {string} theme - 'dark' o 'light'
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Aggiorna icona toggle
    const toggle = this.qs('#themeToggle');
    if (toggle) {
      const icon = toggle.querySelector('.theme-toggle-icon');
      if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura');
        toggle.title = theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura';
      }
    }
  },
  
  /**
   * Salva preferenza tema
   * @param {string} theme - 'dark' o 'light'
   */
  saveTheme(theme) {
    try {
      localStorage.setItem('app-theme', theme);
    } catch (e) {
      console.warn('Errore salvataggio tema in localStorage:', e);
    }
  },
  
  /**
   * Toggle tema dark/light
   */
  toggleTheme() {
    const current = this.getCurrentTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
    this.showToast(`Modalità ${newTheme === 'dark' ? 'scura' : 'chiara'} attivata`, { type: 'success', duration: 1500 });
  },
  
  /**
   * Setup tema e listener per cambi sistema
   */
  setupTheme() {
    // Applica tema corrente al caricamento
    const theme = this.getCurrentTheme();
    this.applyTheme(theme);
    
    // Listener per cambi preferenza sistema (se non salvato)
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        const saved = localStorage.getItem('app-theme');
        // Se non c'è preferenza salvata, ascolta cambi sistema
        if (!saved) {
          mediaQuery.addEventListener('change', (e) => {
            const systemTheme = e.matches ? 'dark' : 'light';
            this.applyTheme(systemTheme);
          });
        }
      } catch (e) {
        console.warn('Errore setup listener tema:', e);
      }
    }
    
    // Setup toggle button
    const toggle = this.qs('#themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleTheme());
    }
  },

  // ============== Dark Mode / Theme Management ==============
  
  /**
   * Rileva preferenza tema sistema
   * @returns {string} 'dark' o 'light'
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },
  
  /**
   * Ottiene tema corrente (da localStorage o sistema)
   * @returns {string} 'dark' o 'light'
   */
  getCurrentTheme() {
    try {
      const saved = localStorage.getItem('app-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (e) {
      console.warn('Errore lettura tema da localStorage:', e);
    }
    // Fallback a preferenza sistema
    return this.getSystemTheme();
  },
  
  /**
   * Applica tema alla pagina
   * @param {string} theme - 'dark' o 'light'
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Aggiorna icona toggle (può non esistere ancora, verrà aggiornato dopo loadSharedComponents)
    setTimeout(() => {
      const toggle = this.qs('#themeToggle');
      if (toggle) {
        const icon = toggle.querySelector('.theme-toggle-icon');
        if (icon) {
          icon.textContent = theme === 'dark' ? '☀️' : '🌙';
          toggle.setAttribute('aria-label', theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura');
          toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
          toggle.title = theme === 'dark' ? 'Attiva modalità chiara' : 'Attiva modalità scura';
        }
      }
    }, 50);
  },
  
  /**
   * Salva preferenza tema
   * @param {string} theme - 'dark' o 'light'
   */
  saveTheme(theme) {
    try {
      localStorage.setItem('app-theme', theme);
      // Salva anche nelle preferenze utente (se sistema già inizializzato)
      if (this.loadUserPreferences) {
        const prefs = this.loadUserPreferences();
        prefs.theme = theme;
        this.saveUserPreferences(prefs);
      }
    } catch (e) {
      console.warn('Errore salvataggio tema in localStorage:', e);
    }
  },
  
  /**
   * Toggle tema dark/light
   */
  toggleTheme() {
    const current = this.getCurrentTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
    this.showToast(`Modalità ${newTheme === 'dark' ? 'scura' : 'chiara'} attivata`, { type: 'success', duration: 1500 });
  },
  
  /**
   * Setup tema e listener per cambi sistema
   */
  setupTheme() {
    // Applica tema corrente al caricamento
    const theme = this.getCurrentTheme();
    this.applyTheme(theme);
    
    // Listener per cambi preferenza sistema (se non salvato)
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        const saved = localStorage.getItem('app-theme');
        // Se non c'è preferenza salvata, ascolta cambi sistema
        if (!saved) {
          mediaQuery.addEventListener('change', (e) => {
            const systemTheme = e.matches ? 'dark' : 'light';
            this.applyTheme(systemTheme);
          });
        }
      } catch (e) {
        console.warn('Errore setup listener tema:', e);
      }
    }
    
    // Setup toggle button dopo caricamento componenti
    setTimeout(() => {
      const toggle = this.qs('#themeToggle');
      if (toggle && !toggle._bound) {
        toggle._bound = true;
        toggle.addEventListener('click', () => this.toggleTheme());
      }
    }, 200);
  },

  // ============== User Preferences Management ==============
  
  /**
   * Carica preferenze utente da Firestore o localStorage
   * @returns {Object} Oggetto con le preferenze
   */
  loadUserPreferences() {
    try {
      // Prova prima da localStorage (veloce)
      const local = localStorage.getItem('app-preferences');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {
          console.warn('Errore parsing preferenze locali:', e);
        }
      }
    } catch (e) {
      console.warn('Errore lettura preferenze da localStorage:', e);
    }
    
    // Preferenze di default
    return {
      theme: this.getCurrentTheme(),
      activityOrder: null,
      defaultView: null,
      savedFilters: {},
      notifications: {
        activityReminders: true,
        paymentReminders: true,
        importantChanges: true,
        birthdayReminders: true,
        enabled: false // Richiede permesso utente
      },
      shortcuts: {
        save: { key: 's', ctrl: true, meta: true, enabled: true },
        search: { key: '/', ctrl: false, meta: false, enabled: true },
        escape: { key: 'Escape', ctrl: false, meta: false, enabled: true },
        help: { key: '?', ctrl: false, meta: false, enabled: true }
      },
      shortcutsEnabled: true
    };
  },
  
  /**
   * Salva preferenze utente in Firestore (se loggato) o localStorage
   * @param {Object} preferences - Oggetto con le preferenze
   */
  async saveUserPreferences(preferences) {
    try {
      // Salva sempre in localStorage per accesso veloce
      localStorage.setItem('app-preferences', JSON.stringify(preferences));
      
      // Se utente loggato, salva anche in Firestore
      if (this.currentUser?.uid) {
        try {
          const userPrefsRef = doc(DATA.adapter.db, 'user-preferences', this.currentUser.uid);
          await setDoc(userPrefsRef, {
            ...preferences,
            updatedAt: new Date(),
            userId: this.currentUser.uid,
            userEmail: this.currentUser.email
          }, { merge: true });
        } catch (error) {
          console.warn('Errore salvataggio preferenze su Firestore:', error);
          // Non bloccare se Firestore fallisce, localStorage è già salvato
        }
      }
    } catch (e) {
      console.error('Errore salvataggio preferenze:', e);
      throw e;
    }
  },
  
  /**
   * Sincronizza preferenze da Firestore (se loggato)
   */
  async syncUserPreferences() {
    if (!this.currentUser?.uid) return;
    
    try {
      const userPrefsRef = doc(DATA.adapter.db, 'user-preferences', this.currentUser.uid);
      const userPrefsSnap = await getDoc(userPrefsRef);
      
      if (userPrefsSnap.exists()) {
        const firestorePrefs = userPrefsSnap.data();
        // Merge con preferenze locali (locali hanno priorità se più recenti)
        const localPrefs = this.loadUserPreferences();
        const merged = { ...firestorePrefs, ...localPrefs };
        // Rimuovi metadati Firestore
        delete merged.updatedAt;
        delete merged.userId;
        delete merged.userEmail;
        
        // Applica preferenze
        if (merged.theme) {
          this.applyTheme(merged.theme);
        }
        
        // Salva merged
        localStorage.setItem('app-preferences', JSON.stringify(merged));
      }
    } catch (error) {
      console.warn('Errore sincronizzazione preferenze da Firestore:', error);
    }
  },

  // ============== Activity Templates ==============
  /**
   * Carica template attività per l'utente corrente
   * @returns {Promise<Array>} Array di template { id, name, tipo, descrizione, costo }
   */
  async loadActivityTemplates() {
    if (!this.currentUser?.uid) return [];
    
    try {
      const templatesRef = collection(DATA.adapter.db, 'activity-templates');
      const q = query(
        templatesRef,
        where('userId', '==', this.currentUser.uid),
        orderBy('name', 'asc')
      );
      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || data.descrizione || 'Template attività',
          tipo: data.tipo || 'Riunione',
          descrizione: data.descrizione || '',
          costo: data.costo ?? 0
        };
      });
      // Mantiene in memoria per riutilizzo rapido
      this._activityTemplates = templates;
      return templates;
    } catch (error) {
      console.error('Errore caricamento template attività:', error);
      return [];
    }
  },

  /**
   * Salva un nuovo template attività per l'utente corrente
   * @param {Object} activity - { tipo, descrizione, costo }
   */
  async saveActivityTemplate(activity) {
    if (!this.currentUser?.uid) {
      this.showToast('Devi essere loggato per salvare un template.', { type: 'error' });
      return;
    }
    const { tipo, descrizione, costo } = activity || {};
    const name = descrizione && descrizione.trim() ? descrizione.trim() : `${tipo || 'Attività'} (${new Date().toLocaleDateString('it-IT')})`;
    
    try {
      const templatesRef = collection(DATA.adapter.db, 'activity-templates');
      await addDoc(templatesRef, {
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        name,
        tipo: tipo || 'Riunione',
        descrizione: descrizione || '',
        costo: typeof costo === 'number' ? costo : Number(costo || 0),
        createdAt: Timestamp.now()
      });
      this.showToast('Template attività salvato', { type: 'success', duration: 2000 });
      await this.loadActivityTemplates();
    } catch (error) {
      console.error('Errore salvataggio template attività:', error);
      this.showToast('Errore nel salvataggio del template', { type: 'error' });
    }
  },

  // ============== Commenti e Annotazioni ==============
  /**
   * Carica commenti per un target (activity, presence, scout)
   * @param {string} targetType - 'activity' | 'presence' | 'scout'
   * @param {string} targetId
   * @returns {Promise<Array>} Array di commenti
   */
  async loadComments(targetType, targetId) {
    if (!this.currentUser?.uid || !targetType || !targetId) return [];
    try {
      const commentsRef = collection(DATA.adapter.db, 'comments');
      const q = query(
        commentsRef,
        where('targetType', '==', targetType),
        where('targetId', '==', targetId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Errore caricamento commenti:', error);
      return [];
    }
  },

  /**
   * Salva un commento per un target
   * @param {string} targetType
   * @param {string} targetId
   * @param {string} text
   */
  async addComment(targetType, targetId, text) {
    if (!this.currentUser?.uid) {
      this.showToast('Devi essere loggato per aggiungere commenti.', { type: 'error' });
      return;
    }
    const trimmed = (text || '').trim();
    if (!trimmed) {
      this.showToast('Il commento non può essere vuoto.', { type: 'error' });
      return;
    }
    try {
      const commentsRef = collection(DATA.adapter.db, 'comments');
      await addDoc(commentsRef, {
        targetType,
        targetId,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        text: trimmed,
        timestamp: Timestamp.now()
      });
      this.showToast('Commento aggiunto', { type: 'success', duration: 1500 });
    } catch (error) {
      console.error('Errore salvataggio commento:', error);
      this.showToast('Errore nel salvataggio del commento', { type: 'error' });
    }
  },

  /**
   * Renderizza lista commenti in un container
   */
  renderCommentsList(comments, container) {
    if (!container) return;
    if (!comments || comments.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-500">Nessun commento ancora. Scrivi il primo!</p>';
      return;
    }
    const rows = comments.map(c => {
      const dateStr = c.timestamp
        ? c.timestamp.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';
      const author = this.escapeHtml(c.userEmail || '');
      const text = this.escapeHtml(c.text || '');
      return `
        <div class="border-b border-gray-200 dark:border-gray-700 last:border-0 py-2">
          <div class="flex justify-between items-baseline gap-2">
            <span class="text-xs text-gray-500 dark:text-gray-400 truncate">${author}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">${dateStr}</span>
          </div>
          <p class="text-sm text-gray-800 dark:text-gray-100 mt-1 whitespace-pre-wrap break-words">${text}</p>
        </div>
      `;
    }).join('');
    container.innerHTML = rows;
  },

  /**
   * Setup commenti per un target generico (activity, presence, scout)
   * selectors: { listSelector, formSelector, textareaSelector }
   */
  async setupCommentsForTarget(targetType, targetId, selectors) {
    const list = this.qs(selectors.listSelector);
    const form = this.qs(selectors.formSelector);
    const textarea = this.qs(selectors.textareaSelector);
    if (!list || !form || !textarea) return;

    const loadAndRender = async () => {
      const comments = await this.loadComments(targetType, targetId);
      this.renderCommentsList(comments, list);
    };

    // Carica inizialmente
    await loadAndRender();

    // Gestione submit
    if (!form._bound) {
      form._bound = true;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.addComment(targetType, targetId, textarea.value);
        textarea.value = '';
        await loadAndRender();
      });
    }
  },

  // ============== Firebase Cloud Messaging (Push Notifications) ==============
  
  /**
   * Inizializza Firebase Cloud Messaging e richiede permessi
   */
  async initializeFCM() {
    // Verifica supporto
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.log('Push notifications non supportate da questo browser');
      return null;
    }
    
    if (!DATA.adapter.messaging) {
      console.warn('FCM non disponibile');
      return null;
    }
    
    try {
      // Registra service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
      
      // Richiedi permessi
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Ottieni token FCM
        const vapidKey = this.getVapidKey();
        if (!vapidKey) {
          console.warn('VAPID key non configurata - vedi FCM_SETUP.md');
          return null;
        }
        
        const token = await getToken(DATA.adapter.messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log('FCM Token ottenuto:', token);
          await this.saveFCMToken(token);
          
          // Aggiorna preferenze
          const prefs = this.loadUserPreferences();
          prefs.notifications.enabled = true;
          await this.saveUserPreferences(prefs);
          
          // Setup listener per messaggi in foreground
          onMessage(DATA.adapter.messaging, (payload) => {
            console.log('Messaggio ricevuto in foreground:', payload);
            this.handleForegroundNotification(payload);
          });
          
          return token;
        }
      } else {
        console.log('Permessi notifiche negati:', permission);
        const prefs = this.loadUserPreferences();
        prefs.notifications.enabled = false;
        await this.saveUserPreferences(prefs);
      }
    } catch (error) {
      console.error('Errore inizializzazione FCM:', error);
    }
    
    return null;
  },
  
  /**
   * Ottiene VAPID key per FCM (da configurazione o default)
   * IMPORTANTE: Configura questa funzione con la VAPID key da Firebase Console
   * Vedi FCM_SETUP.md per istruzioni dettagliate
   */
  getVapidKey() {
    // VAPID key configurata da Firebase Console
    return 'BBKeE0VbFbvT_BWU78Ddtbt1EhP6-vHYTI_WwQsrBOiki5RvsyBTwkI4X6HFEW0GaVf018JNosFE1eVdb6b62N0';
  },
  
  /**
   * Salva token FCM in Firestore per l'utente corrente
   */
  async saveFCMToken(token) {
    if (!this.currentUser?.uid) return;
    
    try {
      const tokenRef = doc(DATA.adapter.db, 'fcm-tokens', this.currentUser.uid);
      await setDoc(tokenRef, {
        token: token,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        updatedAt: new Date(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      }, { merge: true });
      
      console.log('FCM token salvato in Firestore');
    } catch (error) {
      console.error('Errore salvataggio FCM token:', error);
    }
  },
  
  /**
   * Gestisce notifiche in foreground (quando app è aperta)
   */
  async handleForegroundNotification(payload) {
    const notificationTitle = payload.notification?.title || payload.data?.title || 'Notifica Scout Maori';
    const notificationBody = payload.notification?.body || payload.data?.body || 'Nuova notifica';
    const notificationOptions = {
      body: notificationBody,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.data?.tag || 'default',
      data: payload.data || {}
    };
    
    // Salva come notifica in-app
    await this.saveInAppNotification({
      type: payload.data?.type || 'info',
      title: notificationTitle,
      body: notificationBody,
      url: payload.data?.url || null,
      notificationType: payload.data?.notificationType || 'info'
    });
    
    // Usa Notification API per mostrare notifica anche in foreground
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(notificationTitle, notificationOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Naviga alla pagina se specificata
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };
      
      // Chiudi automaticamente dopo 5 secondi
      setTimeout(() => notification.close(), 5000);
    } else {
      // Fallback: mostra toast se notifiche non disponibili
      this.showToast(notificationTitle + ': ' + notificationBody, {
        type: 'info',
        duration: 5000
      });
    }
  },
  
  /**
   * Controlla attività imminenti e invia notifiche se necessario
   */
  async checkActivityReminders() {
    const prefs = this.loadUserPreferences();
    if (!prefs.notifications.enabled || !prefs.notifications.activityReminders) {
      return;
    }
    
    if (!this.currentUser?.uid) return;
    
    try {
      const activities = this.state.activities || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const upcomingActivities = activities.filter(a => {
        const activityDate = this.toJsDate(a.data);
        if (!activityDate) return false;
        const aday = new Date(activityDate);
        aday.setHours(0, 0, 0, 0);
        return aday >= today && aday <= threeDaysFromNow;
      }).sort((a, b) => this.toJsDate(a.data) - this.toJsDate(b.data));
      
      if (upcomingActivities.length > 0) {
        // Controlla se abbiamo già notificato per queste attività
        const lastCheck = localStorage.getItem('lastActivityReminderCheck');
        const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
        
        // Notifica solo se non abbiamo già controllato oggi
        if (!lastCheckDate || lastCheckDate.toDateString() !== today.toDateString()) {
          const nearest = upcomingActivities[0];
          const activityDate = this.toJsDate(nearest.data);
          const daysUntil = Math.ceil((activityDate - today) / (1000 * 60 * 60 * 24));
          
          // Mostra notifica solo se siamo entro 3 giorni
          if (daysUntil <= 3 && daysUntil >= 0) {
            const message = daysUntil === 0 
              ? `Oggi: ${nearest.tipo} - ${nearest.descrizione}`
              : daysUntil === 1
              ? `Domani: ${nearest.tipo} - ${nearest.descrizione}`
              : `Tra ${daysUntil} giorni: ${nearest.tipo} - ${nearest.descrizione}`;
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Attività Imminente', {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: `activity-${nearest.id}`,
                data: { url: `/calendario.html` }
              });
            }
            
            // Salva anche come notifica in-app
            await this.saveInAppNotification({
              type: 'activity',
              title: 'Attività Imminente',
              body: message,
              url: '/calendario.html',
              notificationType: 'activity'
            });
            
            localStorage.setItem('lastActivityReminderCheck', today.toISOString());
          }
        }
      }
    } catch (error) {
      console.error('Errore controllo attività imminenti:', error);
    }
  },
  
  /**
   * Controlla compleanni esploratori e invia notifiche se necessario
   */
  async checkBirthdayReminders() {
    const prefs = this.loadUserPreferences();
    if (!prefs.notifications.enabled || !prefs.notifications.birthdayReminders) {
      return;
    }
    
    if (!this.currentUser?.uid) return;
    
    try {
      const scouts = this.state.scouts || [];
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();
      
      // Trova esploratori con compleanno oggi
      const birthdaysToday = scouts.filter(scout => {
        if (!scout.anag_dob) return false;
        
        const birthDate = this.toJsDate(scout.anag_dob);
        if (!birthDate) return false;
        
        // Confronta mese e giorno (ignora anno)
        return birthDate.getMonth() === todayMonth && birthDate.getDate() === todayDate;
      });
      
      if (birthdaysToday.length > 0) {
        // Controlla se abbiamo già notificato oggi
        const lastCheck = localStorage.getItem('lastBirthdayReminderCheck');
        const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
        
        // Notifica solo se non abbiamo già controllato oggi
        if (!lastCheckDate || lastCheckDate.toDateString() !== today.toDateString()) {
          const names = birthdaysToday.map(s => `${s.nome} ${s.cognome}`.trim()).join(', ');
          const message = birthdaysToday.length === 1
            ? `Oggi è il compleanno di ${names}! 🎉`
            : `Oggi sono i compleanni di: ${names}! 🎉`;
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🎂 Compleanni Oggi', {
              body: message,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: `birthday-${today.toISOString().split('T')[0]}`,
              data: { url: '/esploratori.html' }
            });
          }
          
          // Salva anche come notifica in-app
          await this.saveInAppNotification({
            type: 'birthday',
            title: '🎂 Compleanni Oggi',
            body: message,
            url: '/esploratori.html',
            notificationType: 'birthday'
          });
          
          localStorage.setItem('lastBirthdayReminderCheck', today.toISOString());
        }
      }
    } catch (error) {
      console.error('Errore controllo compleanni:', error);
    }
  },
  
  /**
   * Controlla pagamenti mancanti e invia notifiche se necessario
   */
  async checkPaymentReminders() {
    const prefs = this.loadUserPreferences();
    if (!prefs.notifications.enabled || !prefs.notifications.paymentReminders) {
      return;
    }
    
    if (!this.currentUser?.uid) return;
    
    try {
      const activities = (this.state.activities || []).filter(a => parseFloat(a.costo || '0') > 0);
      const presences = this.getDedupedPresences();
      
      const unpaidActivities = activities.filter(activity => {
        const activityDate = this.toJsDate(activity.data);
        if (!activityDate) return false;
        
        // Solo attività passate
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (activityDate >= today) return false;
        
        // Verifica se ci sono pagamenti mancanti
        const activityPresences = presences.filter(p => p.attivitaId === activity.id && p.stato === 'Presente');
        const unpaidCount = activityPresences.filter(p => !p.pagato).length;
        
        return unpaidCount > 0;
      });
      
      if (unpaidActivities.length > 0) {
        const lastCheck = localStorage.getItem('lastPaymentReminderCheck');
        const lastCheckDate = lastCheck ? new Date(lastCheck) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Notifica solo una volta al giorno
        if (!lastCheckDate || lastCheckDate.toDateString() !== today.toDateString()) {
          const totalUnpaid = unpaidActivities.reduce((sum, activity) => {
            const activityPresences = presences.filter(p => p.attivitaId === activity.id && p.stato === 'Presente');
            return sum + activityPresences.filter(p => !p.pagato).length;
          }, 0);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pagamenti Mancanti', {
              body: `${totalUnpaid} pagamento/i da registrare per ${unpaidActivities.length} attività`,
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              tag: 'payment-reminder',
              data: { url: '/pagamenti.html' }
            });
          }
          
          // Salva anche come notifica in-app
          await this.saveInAppNotification({
            type: 'payment',
            title: 'Pagamenti Mancanti',
            body: `${totalUnpaid} pagamento/i da registrare per ${unpaidActivities.length} attività`,
            url: '/pagamenti.html',
            notificationType: 'payment'
          });
          
          localStorage.setItem('lastPaymentReminderCheck', today.toISOString());
        }
      }
    } catch (error) {
      console.error('Errore controllo pagamenti mancanti:', error);
    }
  },
  
  /**
   * Invia notifica per modifiche importanti
   */
  notifyImportantChange({ type, title, body, url }) {
    const prefs = this.loadUserPreferences();
    if (!prefs.notifications.enabled || !prefs.notifications.importantChanges) {
      return;
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `important-${type}`,
        requireInteraction: true,
        data: { url: url || '/' }
      });
    }
    
    // Salva anche come notifica in-app
    this.saveInAppNotification({ type, title, body, url, notificationType: 'important' });
  },

  // ============== Notifiche In-App ==============
  
  /**
   * Salva una notifica in-app in Firestore
   * @param {Object} notification - Oggetto notifica { type, title, body, url, notificationType }
   */
  async saveInAppNotification({ type, title, body, url, notificationType = 'info' }) {
    if (!this.currentUser?.uid) return;
    
    try {
      const notificationsRef = collection(DATA.adapter.db, 'in-app-notifications');
      await addDoc(notificationsRef, {
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        type: notificationType || type || 'info',
        title: title || 'Notifica',
        body: body || '',
        url: url || null,
        read: false,
        createdAt: Timestamp.now()
      });
      
      // Aggiorna badge
      this.updateNotificationsBadge();
    } catch (error) {
      console.error('Errore salvataggio notifica in-app:', error);
    }
  },
  
  /**
   * Carica notifiche in-app da Firestore
   * @returns {Promise<Array>} Array di notifiche
   */
  async loadInAppNotifications(limitCount = 50) {
    if (!this.currentUser?.uid) return [];
    
    try {
      const notificationsRef = collection(DATA.adapter.db, 'in-app-notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', this.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Errore caricamento notifiche in-app:', error);
      return [];
    }
  },
  
  /**
   * Segna una notifica come letta
   * @param {string} notificationId - ID della notifica
   */
  async markNotificationAsRead(notificationId) {
    if (!this.currentUser?.uid || !notificationId) return;
    
    try {
      const notificationRef = doc(DATA.adapter.db, 'in-app-notifications', notificationId);
      await setDoc(notificationRef, { read: true }, { merge: true });
      
      // Aggiorna badge e lista
      this.updateNotificationsBadge();
      this.renderNotificationsList();
    } catch (error) {
      console.error('Errore aggiornamento notifica:', error);
    }
  },
  
  /**
   * Segna tutte le notifiche come lette
   */
  async markAllNotificationsAsRead() {
    if (!this.currentUser?.uid) return;
    
    try {
      const notifications = await this.loadInAppNotifications(100);
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      const batch = unreadIds.map(id => {
        const notificationRef = doc(DATA.adapter.db, 'in-app-notifications', id);
        return setDoc(notificationRef, { read: true }, { merge: true });
      });
      
      await Promise.all(batch);
      
      // Aggiorna badge e lista
      this.updateNotificationsBadge();
      this.renderNotificationsList();
      this.showToast('Tutte le notifiche sono state segnate come lette', { type: 'success' });
    } catch (error) {
      console.error('Errore aggiornamento notifiche:', error);
      this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
    }
  },
  
  /**
   * Aggiorna badge conteggio notifiche non lette
   */
  async updateNotificationsBadge() {
    if (!this.currentUser?.uid) return;
    
    try {
      const notifications = await this.loadInAppNotifications(100);
      const unreadCount = notifications.filter(n => !n.read).length;
      
      const badge = this.qs('#notificationsBadge');
      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Errore aggiornamento badge notifiche:', error);
    }
  },
  
  /**
   * Renderizza lista notifiche nel dropdown
   */
  async renderNotificationsList() {
    const container = this.qs('#notificationsList');
    const empty = this.qs('#notificationsEmpty');
    if (!container || !empty) return;
    
    try {
      const notifications = await this.loadInAppNotifications(20);
      
      if (notifications.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      
      empty.style.display = 'none';
      
      container.innerHTML = notifications.map(n => {
        const timeAgo = this.formatTimeAgo(n.createdAt);
        const icon = {
          'activity': '📅',
          'payment': '💳',
          'important': '⚠️',
          'birthday': '🎂',
          'info': 'ℹ️'
        }[n.type] || '🔔';
        
        return `
          <div class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}" 
               data-notification-id="${n.id}" 
               role="menuitem"
               ${n.url ? `onclick="window.location.href='${n.url}'; UI.markNotificationAsRead('${n.id}')"` : `onclick="UI.markNotificationAsRead('${n.id}')"`}>
            <div class="flex items-start gap-3">
              <span class="text-2xl flex-shrink-0">${icon}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 ${!n.read ? 'font-bold' : ''}">${this.escapeHtml(n.title)}</p>
                  ${!n.read ? '<span class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>' : ''}
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${this.escapeHtml(n.body)}</p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${timeAgo}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Errore rendering notifiche:', error);
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Errore nel caricamento notifiche</div>';
    }
  },
  
  /**
   * Formatta tempo relativo (es: "2 minuti fa", "1 ora fa")
   */
  formatTimeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - (date instanceof Date ? date : new Date(date));
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Adesso';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuto' : 'minuti'} fa`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'ora' : 'ore'} fa`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'giorno' : 'giorni'} fa`;
    
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  },
  
  /**
   * Setup notifiche in-app (bell icon e dropdown)
   */
  setupInAppNotifications() {
    if (!this.currentUser?.uid) {
      const container = this.qs('#notificationsContainer');
      if (container) container.style.display = 'none';
      return;
    }
    
    // Mostra container notifiche
    const container = this.qs('#notificationsContainer');
    if (container) container.style.display = 'block';
    
    // Setup bell button
    const bell = this.qs('#notificationsBell');
    const dropdown = this.qs('#notificationsDropdown');
    const markAllReadBtn = this.qs('#markAllReadBtn');
    
    if (bell && dropdown) {
      // Toggle dropdown
      bell.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display !== 'none';
        
        if (isOpen) {
          dropdown.style.display = 'none';
          bell.setAttribute('aria-expanded', 'false');
        } else {
          dropdown.style.display = 'block';
          bell.setAttribute('aria-expanded', 'true');
          this.renderNotificationsList();
        }
      });
      
      // Chiudi dropdown quando si clicca fuori
      document.addEventListener('click', (e) => {
        if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
          bell.setAttribute('aria-expanded', 'false');
        }
      });
    }
    
    // Setup mark all as read
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.markAllNotificationsAsRead();
      });
    }
    
    // Carica badge iniziale
    this.updateNotificationsBadge();
    
    // Setup listener real-time per nuove notifiche (opzionale, può essere costoso)
    // Si potrebbe usare onSnapshot per aggiornamenti in tempo reale
  },

  // ============== Keyboard Shortcuts ==============
  
  /**
   * Ottiene shortcuts configurati dalle preferenze utente
   * @returns {Object} Oggetto con shortcuts configurati
   */
  getShortcutsConfig() {
    const prefs = this.loadUserPreferences();
    if (!prefs.shortcutsEnabled) {
      return { enabled: false };
    }
    // Merge con default per assicurare che tutti gli shortcuts esistano
    const defaultShortcuts = {
      save: { key: 's', ctrl: true, meta: true, enabled: true },
      search: { key: '/', ctrl: false, meta: false, enabled: true },
      escape: { key: 'Escape', ctrl: false, meta: false, enabled: true },
      help: { key: '?', ctrl: false, meta: false, enabled: true }
    };
    return {
      enabled: true,
      shortcuts: { ...defaultShortcuts, ...(prefs.shortcuts || {}) }
    };
  },
  
  /**
   * Verifica se un evento tastiera corrisponde a uno shortcut configurato
   * @param {KeyboardEvent} e - Evento tastiera
   * @param {Object} shortcut - Configurazione shortcut
   * @returns {boolean}
   */
  matchesShortcut(e, shortcut) {
    if (!shortcut.enabled) return false;
    if (e.key !== shortcut.key) return false;
    if (shortcut.ctrl && !e.ctrlKey) return false;
    if (shortcut.meta && !e.metaKey) return false;
    if (!shortcut.ctrl && e.ctrlKey) return false;
    if (!shortcut.meta && e.metaKey) return false;
    if (e.altKey && !shortcut.alt) return false;
    return true;
  },
  
  /**
   * Setup keyboard shortcuts globali (con configurazione personalizzabile)
   */
  setupKeyboardShortcuts() {
    // Rimuovi listener esistente se presente
    if (this._shortcutsHandler) {
      document.removeEventListener('keydown', this._shortcutsHandler);
    }
    
    // Prevenzione attivazione shortcuts quando si digita in input/textarea
    const isEditable = (el) => {
      if (!el) return false;
      const tagName = el.tagName.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || el.isContentEditable;
    };
    
    // Handler principale
    this._shortcutsHandler = (e) => {
      const config = this.getShortcutsConfig();
      if (!config.enabled) return;
      
      const shortcuts = config.shortcuts;
      
      // Ignora se si sta digitando in un campo (tranne Escape)
      if (isEditable(e.target)) {
        if (shortcuts.escape && this.matchesShortcut(e, shortcuts.escape)) {
          this.handleEscapeKey();
        }
        return;
      }
      
      // Ctrl/Cmd + S: Salva
      if (shortcuts.save && this.matchesShortcut(e, shortcuts.save)) {
        e.preventDefault();
        this.handleSaveShortcut();
        return;
      }
      
      // / : Focus su ricerca
      if (shortcuts.search && this.matchesShortcut(e, shortcuts.search)) {
        e.preventDefault();
        this.handleSearchShortcut();
        return;
      }
      
      // Esc: Chiudi modale
      if (shortcuts.escape && this.matchesShortcut(e, shortcuts.escape)) {
        this.handleEscapeKey();
        return;
      }
      
      // ? : Mostra help shortcuts
      if (shortcuts.help && this.matchesShortcut(e, shortcuts.help)) {
        e.preventDefault();
        this.showKeyboardShortcutsHelp();
        return;
      }
    };
    
    document.addEventListener('keydown', this._shortcutsHandler);
  },
  
  /**
   * Gestisce shortcut Ctrl+S (salva)
   */
  handleSaveShortcut() {
    // Cerca form attivo nella pagina
    const activeForm = document.querySelector('form:focus-within, form .input:focus, form input:focus, form textarea:focus');
    if (activeForm && activeForm.querySelector('button[type="submit"]')) {
      const submitBtn = activeForm.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.click();
        this.showToast('Salvato (Ctrl+S)', { type: 'success', duration: 1500 });
      }
    } else {
      // Se non c'è form attivo, cerca il primo form submit nella pagina corrente
      const form = document.querySelector('form button[type="submit"]:not([disabled])');
      if (form) {
        form.focus();
        this.showToast('Form disponibile - premi Ctrl+S per salvare', { type: 'info', duration: 2000 });
      }
    }
  },
  
  /**
   * Gestisce shortcut / (ricerca)
   */
  handleSearchShortcut() {
    // Cerca campo ricerca nella pagina
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="Cerca"], input[placeholder*="cerca"], input[id*="search"], input[id*="Search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    } else {
      this.showToast('Campo ricerca non disponibile in questa pagina', { type: 'info', duration: 2000 });
    }
  },
  
  /**
   * Gestisce shortcut Esc
   */
  handleEscapeKey() {
    // Chiudi modale aperto
    const openModal = document.querySelector('.modal.show');
    if (openModal) {
      const modalId = openModal.id;
      this.closeModal(modalId);
      this.showToast('Modale chiusa (Esc)', { type: 'info', duration: 1000 });
    }
  },
  
  /**
   * Formatta shortcut per visualizzazione
   * @param {Object} shortcut - Configurazione shortcut
   * @returns {string} Stringa formattata (es: "Ctrl + S")
   */
  formatShortcut(shortcut) {
    if (!shortcut || !shortcut.enabled) return 'Disabilitato';
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.meta) parts.push('Cmd');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.key) {
      // Formatta chiavi speciali
      const keyMap = {
        'Escape': 'Esc',
        ' ': 'Spazio',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→'
      };
      parts.push(keyMap[shortcut.key] || shortcut.key);
    }
    return parts.join(' + ');
  },
  
  /**
   * Mostra modal con lista shortcuts disponibili (con configurazione personalizzata)
   */
  showKeyboardShortcutsHelp() {
    const config = this.getShortcutsConfig();
    if (!config.enabled) {
      this.showToast('Scorciatoie tastiera disabilitate', { type: 'info' });
      return;
    }
    
    const shortcutsList = [
      { id: 'save', desc: 'Salva form attivo', shortcut: config.shortcuts.save },
      { id: 'search', desc: 'Focus su campo ricerca', shortcut: config.shortcuts.search },
      { id: 'escape', desc: 'Chiudi modale aperta', shortcut: config.shortcuts.escape },
      { id: 'help', desc: 'Mostra questa guida shortcuts', shortcut: config.shortcuts.help }
    ];
    
    const helpHtml = `
      <div class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">⌨️ Scorciatoie Tastiera</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Puoi personalizzare queste scorciatoie nelle preferenze.</p>
        <div class="space-y-2">
          ${shortcutsList.map(s => `
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span class="text-gray-700 dark:text-gray-300">${s.desc}</span>
              <kbd class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono text-gray-800 dark:text-gray-200">${this.formatShortcut(s.shortcut)}</kbd>
            </div>
          `).join('')}
        </div>
        <div class="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
          <a href="preferenze.html" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">⚙️ Configura scorciatoie nelle preferenze</a>
        </div>
      </div>
    `;
    
    // Crea modale temporanea per help
    let helpModal = document.getElementById('keyboardShortcutsHelpModal');
    if (!helpModal) {
      helpModal = document.createElement('div');
      helpModal.id = 'keyboardShortcutsHelpModal';
      helpModal.className = 'modal';
      helpModal.innerHTML = `
        <div class="modal-content max-w-md mx-auto">
          ${helpHtml}
          <div class="mt-4 flex justify-end">
            <button onclick="UI.closeModal('keyboardShortcutsHelpModal')" class="btn-primary" aria-label="Chiudi modale scorciatoie">Chiudi</button>
          </div>
        </div>
      `;
      document.body.appendChild(helpModal);
    } else {
      // Aggiorna contenuto se modale già esiste
      helpModal.querySelector('.modal-content').innerHTML = `
        ${helpHtml}
        <div class="mt-4 flex justify-end">
          <button onclick="UI.closeModal('keyboardShortcutsHelpModal')" class="btn-primary" aria-label="Chiudi modale scorciatoie">Chiudi</button>
        </div>
      `;
    }
    this.showModal('keyboardShortcutsHelpModal');
  },

  setupInstallPrompt() {
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // Mostra un piccolo banner non invasivo nell'header
      const header = this.qs('#shared-header');
      if (!header || header._installShown) return;
      header._installShown = true;
      const bar = document.createElement('div');
      bar.style.background = '#e8f5e9';
      bar.style.borderTop = '1px solid #c8e6c9';
      bar.style.padding = '8px 12px';
      bar.style.display = 'flex';
      bar.style.justifyContent = 'space-between';
      bar.style.alignItems = 'center';
      bar.innerHTML = `
        <span class="text-sm text-green-800">Aggiungi l'app alla schermata Home per un accesso rapido.</span>
        <div class="flex gap-2">
          <button id="installAppBtn" class="btn-primary py-1 px-3 text-sm">Aggiungi</button>
          <button id="dismissInstallBtn" class="btn-secondary py-1 px-3 text-sm">Chiudi</button>
        </div>
      `;
      header.appendChild(bar);
      this.qs('#dismissInstallBtn')?.addEventListener('click', () => bar.remove());
      this.qs('#installAppBtn')?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try { await deferredPrompt.userChoice; } catch { }
        deferredPrompt = null;
        bar.remove();
      });
    });
  },

  setupModalEventListeners() {
    // Confirm Delete Staff
    const confirmDeleteStaffButton = this.qs('#confirmDeleteStaffButton');
    if (confirmDeleteStaffButton && !confirmDeleteStaffButton._bound) {
      confirmDeleteStaffButton._bound = true;
      confirmDeleteStaffButton.addEventListener('click', async () => {
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per eliminare staff.', { type: 'error' }); 
          return; 
        }
        if (!this.staffToDeleteId) return;
        await DATA.deleteStaff(this.staffToDeleteId, this.currentUser);
        this.staffToDeleteId = null;
        this.closeModal('confirmDeleteStaffModal');
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderCurrentPage();
        this.showToast('Staff eliminato con successo');
      });
    }

    // Edit Staff Form
    const editStaffForm = this.qs('#editStaffForm');
    if (editStaffForm && !editStaffForm._bound) {
      editStaffForm._bound = true;
      
      // Setup validazione real-time
      this.setupFormValidation(editStaffForm, {
        editStaffNome: {
          required: true,
          minLength: 1,
          maxLength: 100,
          requiredMessage: 'Il nome è obbligatorio'
        },
        editStaffCognome: {
          required: true,
          minLength: 1,
          maxLength: 100,
          requiredMessage: 'Il cognome è obbligatorio'
        },
        editStaffEmail: {
          required: true,
          type: 'email',
          requiredMessage: 'L\'email è obbligatoria'
        }
      });
      
      editStaffForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per modificare staff.', { type: 'error' }); 
          return; 
        }
        
        // Validazione form completa
        const validation = this.validateForm(editStaffForm, {
          editStaffNome: { required: true, minLength: 1, maxLength: 100 },
          editStaffCognome: { required: true, minLength: 1, maxLength: 100 },
          editStaffEmail: { required: true, type: 'email' }
        });
        
        if (!validation.valid) {
          const firstError = Object.values(validation.errors)[0];
          this.showToast(firstError, { type: 'error' });
          const firstErrorField = Object.keys(validation.errors)[0];
          const input = editStaffForm.querySelector(`#${firstErrorField}`);
          if (input) input.focus();
          return;
        }
        
        const id = this.qs('#editStaffId').value;
        const nome = this.qs('#editStaffNome').value.trim();
        const cognome = this.qs('#editStaffCognome').value.trim();
        const email = this.qs('#editStaffEmail').value.trim().toLowerCase();
        
        // Check duplicati email (escludendo lo staff corrente)
        if (this.checkDuplicateStaffEmail(email, id)) {
          this.showToast('Un altro membro staff con questa email esiste già', { type: 'error' });
          this.qs('#editStaffEmail').focus();
          return;
        }
        
        const submitBtn = editStaffForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        this.setButtonLoading(submitBtn, true, originalText);
        try {
          await DATA.updateStaff(id, { id, nome, cognome, email }, this.currentUser);
          this.closeModal('editStaffModal');
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCurrentPage();
          this.showToast('Staff modificato con successo');
        } catch (error) {
          console.error('Errore modifica staff:', error);
          this.showToast('Errore durante la modifica: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
        } finally {
          this.setButtonLoading(submitBtn, false, originalText);
        }
      });
    }

    // Edit Scout Form
    const editScoutForm = this.qs('#editScoutForm');
    if (editScoutForm && !editScoutForm._bound) {
      editScoutForm._bound = true;
      
      // Setup validazione real-time
      this.setupFormValidation(editScoutForm, {
        editScoutNome: {
          required: true,
          minLength: 1,
          maxLength: 100,
          requiredMessage: 'Il nome è obbligatorio'
        },
        editScoutCognome: {
          required: true,
          minLength: 1,
          maxLength: 100,
          requiredMessage: 'Il cognome è obbligatorio'
        }
      });
      
      editScoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per modificare esploratori.', { type: 'error' }); 
          return; 
        }
        
        // Validazione form completa
        const validation = this.validateForm(editScoutForm, {
          editScoutNome: { required: true, minLength: 1, maxLength: 100 },
          editScoutCognome: { required: true, minLength: 1, maxLength: 100 }
        });
        
        if (!validation.valid) {
          const firstError = Object.values(validation.errors)[0];
          this.showToast(firstError, { type: 'error' });
          const firstErrorField = Object.keys(validation.errors)[0];
          const input = editScoutForm.querySelector(`#${firstErrorField}`);
          if (input) input.focus();
          return;
        }
        
        const id = this.qs('#editScoutId').value;
        const nome = this.qs('#editScoutNome').value.trim();
        const cognome = this.qs('#editScoutCognome').value.trim();
        
        // Check duplicati scout (escludendo lo scout corrente)
        if (this.checkDuplicateScout(nome, cognome, id)) {
          this.showToast('Un esploratore con lo stesso nome e cognome esiste già', { type: 'error' });
          this.qs('#editScoutNome').focus();
          return;
        }
        
        const submitBtn = editScoutForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        this.setButtonLoading(submitBtn, true, originalText);
        try {
          await DATA.updateScout(id, { id, nome, cognome }, this.currentUser);
          this.closeModal('editScoutModal');
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCurrentPage();
          this.showToast('Esploratore modificato con successo');
        } catch (error) {
          console.error('Errore modifica esploratore:', error);
          this.showToast('Errore durante la modifica: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
        } finally {
          this.setButtonLoading(submitBtn, false, originalText);
        }
      });
    }

    // Confirm Delete Scout
    const confirmDeleteScoutButton = this.qs('#confirmDeleteScoutButton');
    if (confirmDeleteScoutButton && !confirmDeleteScoutButton._bound) {
      confirmDeleteScoutButton._bound = true;
      confirmDeleteScoutButton.addEventListener('click', async () => {
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per eliminare esploratori.', { type: 'error' }); 
          return; 
        }
        if (!this.scoutToDeleteId) return;
        
        // Check integrità referenziale
        const presencesCount = this.countPresencesForScout(this.scoutToDeleteId);
        if (presencesCount > 0) {
          const scout = this.state.scouts.find(s => s.id === this.scoutToDeleteId);
          const scoutName = scout ? `${scout.nome} ${scout.cognome}` : 'questo esploratore';
          const confirmed = await new Promise((resolve) => {
            this.showConfirmModal({
              title: 'Conferma Eliminazione',
              message: `L'esploratore ${scoutName} ha ${presencesCount} presenze registrate. Tutte le presenze verranno eliminate. Vuoi continuare?`,
              confirmText: 'Elimina tutto',
              cancelText: 'Annulla',
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false)
            });
          });
          if (!confirmed) return;
        }
        
        const originalText = confirmDeleteScoutButton.textContent;
        this.setButtonLoading(confirmDeleteScoutButton, true, originalText);
        try {
          await DATA.deleteScout(this.scoutToDeleteId, this.currentUser);
          this.scoutToDeleteId = null;
          this.closeModal('confirmDeleteScoutModal');
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCurrentPage();
          this.showToast('Esploratore eliminato con successo');
        } catch (error) {
          console.error('Errore eliminazione esploratore:', error);
          this.showToast('Errore durante l\'eliminazione: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
        } finally {
          this.setButtonLoading(confirmDeleteScoutButton, false, originalText);
        }
      });
    }

    // Edit Activity Form
    const editActivityForm = this.qs('#editActivityForm');
    if (editActivityForm && !editActivityForm._bound) {
      editActivityForm._bound = true;
      
      // Setup validazione real-time
      const validActivityTypes = ['Riunione', 'Attività lunga', 'Uscita', 'Campo'];
      this.setupFormValidation(editActivityForm, {
        editActivityTipo: {
          required: true,
          validator: (value) => validActivityTypes.includes(value) || 'Tipo attività non valido',
          requiredMessage: 'Seleziona un tipo attività'
        },
        editActivityData: {
          required: true,
          validator: (value) => {
            if (!value) return 'La data è obbligatoria';
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'Data non valida';
            return true;
          },
          requiredMessage: 'La data è obbligatoria'
        },
        editActivityDescrizione: {
          required: true,
          minLength: 1,
          maxLength: 500,
          requiredMessage: 'La descrizione è obbligatoria'
        },
        editActivityCosto: {
          required: false,
          validator: (value) => {
            if (!value || value.trim() === '') return true; // Opzionale
            const num = Number(value);
            if (isNaN(num) || num < 0) return 'Il costo deve essere un numero positivo';
            return true;
          }
        }
      });
      
      editActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per modificare attività.', { type: 'error' }); 
          return; 
        }
        
        // Validazione form completa
        const validation = this.validateForm(editActivityForm, {
          editActivityTipo: {
            required: true,
            validator: (value) => validActivityTypes.includes(value) || 'Tipo attività non valido'
          },
          editActivityData: {
            required: true,
            validator: (value) => {
              if (!value) return 'La data è obbligatoria';
              const date = new Date(value);
              return isNaN(date.getTime()) ? 'Data non valida' : true;
            }
          },
          editActivityDescrizione: { required: true, minLength: 1, maxLength: 500 },
          editActivityCosto: {
            required: false,
            validator: (value) => {
              if (!value || value.trim() === '') return true;
              const num = Number(value);
              return (isNaN(num) || num < 0) ? 'Il costo deve essere un numero positivo' : true;
            }
          }
        });
        
        if (!validation.valid) {
          const firstError = Object.values(validation.errors)[0];
          this.showToast(firstError, { type: 'error' });
          const firstErrorField = Object.keys(validation.errors)[0];
          const input = editActivityForm.querySelector(`#${firstErrorField}`);
          if (input) input.focus();
          return;
        }
        
        const submitBtn = editActivityForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        this.setButtonLoading(submitBtn, true, originalText);
        try {
          const id = this.qs('#editActivityId').value;
          const tipo = this.qs('#editActivityTipo').value;
          const data = new Date(this.qs('#editActivityData').value);
          const descrizione = this.qs('#editActivityDescrizione').value.trim();
          const costo = this.qs('#editActivityCosto').value || '0';
          await DATA.updateActivity({ id, tipo, data, descrizione, costo }, this.currentUser);
          this.closeModal('editActivityModal');
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCurrentPage();
          this.showToast('Attività modificata con successo');
        } catch (error) {
          console.error('Errore modifica attività:', error);
          this.showToast('Errore durante la modifica: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
        } finally {
          this.setButtonLoading(submitBtn, false, originalText);
        }
      });
    }

    // Confirm Delete Activity
    const confirmDeleteActivityButton = this.qs('#confirmDeleteActivityButton');
    if (confirmDeleteActivityButton && !confirmDeleteActivityButton._bound) {
      confirmDeleteActivityButton._bound = true;
      confirmDeleteActivityButton.addEventListener('click', async () => {
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per eliminare attività.', { type: 'error' }); 
          return; 
        }
        if (!this.activityToDeleteId) return;
        
        // Check integrità referenziale
        const presencesCount = this.countPresencesForActivity(this.activityToDeleteId);
        if (presencesCount > 0) {
          const activity = this.state.activities.find(a => a.id === this.activityToDeleteId);
          const activityDesc = activity ? activity.descrizione : 'questa attività';
          const confirmed = await new Promise((resolve) => {
            this.showConfirmModal({
              title: 'Conferma Eliminazione',
              message: `L'attività "${activityDesc}" ha ${presencesCount} presenze registrate. Tutte le presenze verranno eliminate. Vuoi continuare?`,
              confirmText: 'Elimina tutto',
              cancelText: 'Annulla',
              onConfirm: () => resolve(true),
              onCancel: () => resolve(false)
            });
          });
          if (!confirmed) return;
        }
        
        const originalText = confirmDeleteActivityButton.textContent;
        this.setButtonLoading(confirmDeleteActivityButton, true, originalText);
        try {
          const activity = this.state.activities.find(a => a.id === this.activityToDeleteId);
          await DATA.deleteActivity(this.activityToDeleteId, this.currentUser);
          this.activityToDeleteId = null;
          this.closeModal('confirmDeleteActivityModal');
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCurrentPage();
          this.showToast('Attività eliminata con successo');
          
          // Notifica importante: attività cancellata
          this.notifyImportantChange({
            type: 'activity_deleted',
            title: 'Attività Cancellata',
            body: activity ? `${activity.tipo} del ${this.toJsDate(activity.data)?.toLocaleDateString('it-IT') || ''} è stata cancellata` : 'Un\'attività è stata cancellata',
            url: '/calendario.html'
          });
        } catch (error) {
          console.error('Errore eliminazione attività:', error);
          this.showToast('Errore durante l\'eliminazione: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
        } finally {
          this.setButtonLoading(confirmDeleteActivityButton, false, originalText);
        }
      });
    }
  },

  renderStaffSelectionList() {
    const container = this.qs('#staffListForSelection');
    if (!container) return;
    container.innerHTML = '';
    if (!this.state.staff || !this.state.staff.length) {
      container.innerHTML = '<p class="text-gray-500">Nessun membro staff disponibile.</p>';
      return;
    }
    this.state.staff.forEach(member => {
      const btn = document.createElement('button');
      btn.className = 'w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg';
      btn.textContent = `${member.nome} ${member.cognome}${member.email ? ' — ' + member.email : ''}`;
      btn.addEventListener('click', () => this.selectStaff(member.id));
      container.appendChild(btn);
    });
  },

  selectStaff(id) {
    this.selectedStaffId = id;
    const m = (this.state.staff || []).find(s => s.id === id);
    const label = this.qs('#selectedStaffName');
    if (label) label.textContent = m ? `${m.nome} ${m.cognome}` : 'Nessuno';
    this.closeModal('staffSelectionModal');
    // Rirender per abilitare le select nelle tabelle
    this.renderCurrentPage();
  },

  // renderCurrentPage() {
  // Questa funzione sarà sovrascritta da ogni pagina specifica
  // console.log('Rendering current page...');
  //},

  // Funzioni condivise per modali, rendering, etc.
  showModal(modalId) {
    const modal = this.qs(`#${modalId}`);
    if (modal) {
      modal.classList.add('show');
    }
  },

  closeModal(modalId) {
    const modal = this.qs(`#${modalId}`);
    if (modal) {
      modal.classList.remove('show');
    }
  },

  showConfirmModal({ title, message, confirmText = 'Conferma', cancelText = 'Annulla', onConfirm, onCancel }) {
    const modal = this.qs('#confirmModal');
    if (!modal) {
      console.error('Modale conferma non trovato');
      return;
    }
    const titleEl = this.qs('#confirmModalTitle');
    const messageEl = this.qs('#confirmModalMessage');
    const confirmBtn = this.qs('#confirmModalConfirm');
    const cancelBtn = this.qs('#confirmModalCancel');
    if (titleEl) titleEl.textContent = title || 'Conferma';
    if (messageEl) messageEl.textContent = message || 'Sei sicuro?';
    if (confirmBtn) confirmBtn.textContent = confirmText;
    if (cancelBtn) cancelBtn.textContent = cancelText;
    // Rimuovi event listener precedenti
    const newConfirmBtn = confirmBtn?.cloneNode(true);
    const newCancelBtn = cancelBtn?.cloneNode(true);
    if (confirmBtn && newConfirmBtn) {
      confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);
    }
    if (cancelBtn && newCancelBtn) {
      cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
    }
    // Aggiungi nuovi event listener
    const finalConfirmBtn = this.qs('#confirmModalConfirm');
    const finalCancelBtn = this.qs('#confirmModalCancel');
    if (finalConfirmBtn) {
      finalConfirmBtn.addEventListener('click', () => {
        this.closeModal('confirmModal');
        if (onConfirm) onConfirm();
      });
    }
    if (finalCancelBtn) {
      finalCancelBtn.addEventListener('click', () => {
        this.closeModal('confirmModal');
        if (onCancel) onCancel();
      });
    }
    // Chiudi cliccando fuori
    const closeOnOutside = (e) => {
      if (e.target === modal) {
        this.closeModal('confirmModal');
        modal.removeEventListener('click', closeOnOutside);
        if (onCancel) onCancel();
      }
    };
    modal.addEventListener('click', closeOnOutside);
    this.showModal('confirmModal');
  },

  // Funzioni di utilità per sicurezza
  escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  },

  // ============== Data Integrity Checks ==============
  
  /**
   * Verifica se uno scout esiste
   * @param {string} scoutId - ID dello scout
   * @returns {boolean}
   */
  checkScoutExists(scoutId) {
    if (!scoutId || !this.state?.scouts) return false;
    return this.state.scouts.some(s => s.id === scoutId);
  },
  
  /**
   * Verifica se un'attività esiste
   * @param {string} activityId - ID dell'attività
   * @returns {boolean}
   */
  checkActivityExists(activityId) {
    if (!activityId || !this.state?.activities) return false;
    return this.state.activities.some(a => a.id === activityId);
  },
  
  /**
   * Verifica se una presenza ha riferimenti validi
   * @param {object} presence - Oggetto presenza
   * @returns {object} { valid: boolean, errors: string[] }
   */
  validatePresenceIntegrity(presence) {
    const errors = [];
    
    if (!presence.esploratoreId || !this.checkScoutExists(presence.esploratoreId)) {
      errors.push('Esploratore non valido o non trovato');
    }
    
    if (!presence.attivitaId || !this.checkActivityExists(presence.attivitaId)) {
      errors.push('Attività non valida o non trovata');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  /**
   * Verifica se ci sono presenze collegate a uno scout
   * @param {string} scoutId - ID dello scout
   * @returns {number} Numero di presenze collegate
   */
  countPresencesForScout(scoutId) {
    if (!scoutId || !this.state?.presences) return 0;
    return this.state.presences.filter(p => p.esploratoreId === scoutId).length;
  },
  
  /**
   * Verifica se ci sono presenze collegate a un'attività
   * @param {string} activityId - ID dell'attività
   * @returns {number} Numero di presenze collegate
   */
  countPresencesForActivity(activityId) {
    if (!activityId || !this.state?.presences) return 0;
    return this.state.presences.filter(p => p.attivitaId === activityId).length;
  },
  
  /**
   * Verifica duplicati email staff
   * @param {string} email - Email da verificare
   * @param {string} excludeId - ID staff da escludere (per edit)
   * @returns {boolean} true se email già esiste
   */
  checkDuplicateStaffEmail(email, excludeId = null) {
    if (!email || !this.state?.staff) return false;
    const normalizedEmail = email.toLowerCase().trim();
    return this.state.staff.some(s => {
      if (excludeId && s.id === excludeId) return false;
      return s.email && s.email.toLowerCase().trim() === normalizedEmail;
    });
  },
  
  /**
   * Verifica duplicati scout (stesso nome e cognome)
   * @param {string} nome - Nome
   * @param {string} cognome - Cognome
   * @param {string} excludeId - ID scout da escludere (per edit)
   * @returns {boolean} true se duplicato
   */
  checkDuplicateScout(nome, cognome, excludeId = null) {
    if (!nome || !cognome || !this.state?.scouts) return false;
    const normalizedNome = nome.trim().toLowerCase();
    const normalizedCognome = cognome.trim().toLowerCase();
    return this.state.scouts.some(s => {
      if (excludeId && s.id === excludeId) return false;
      return s.nome && s.cognome &&
        s.nome.trim().toLowerCase() === normalizedNome &&
        s.cognome.trim().toLowerCase() === normalizedCognome;
    });
  },
  
  /**
   * Valida range date per attività
   * @param {Date} data - Data attività
   * @returns {object} { valid: boolean, warning: string|null }
   */
  validateActivityDateRange(data) {
    if (!data || isNaN(data.getTime())) {
      return { valid: false, warning: 'Data non valida' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityDate = new Date(data);
    activityDate.setHours(0, 0, 0, 0);
    
    // Warning se data nel passato lontano (>1 anno fa)
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (activityDate < oneYearAgo) {
      return { valid: true, warning: 'La data è più di un anno fa' };
    }
    
    // Warning se data nel futuro lontano (>2 anni)
    const twoYearsFromNow = new Date(today);
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    
    if (activityDate > twoYearsFromNow) {
      return { valid: true, warning: 'La data è più di 2 anni nel futuro' };
    }
    
    return { valid: true, warning: null };
  },

  // ============== Export/Import Data ==============
  
  /**
   * Esporta tutto lo stato dell'app in JSON
   * @returns {object} Oggetto JSON con tutti i dati
   */
  exportAllData() {
    if (!this.state) {
      throw new Error('Nessun dato disponibile per l\'export');
    }
    
    const exportData = {
      version: this.appVersion || 'v3',
      exportDate: new Date().toISOString(),
      data: {
        scouts: this.state.scouts || [],
        staff: this.state.staff || [],
        activities: this.state.activities || [],
        presences: this.state.presences || []
      },
      metadata: {
        scoutsCount: (this.state.scouts || []).length,
        staffCount: (this.state.staff || []).length,
        activitiesCount: (this.state.activities || []).length,
        presencesCount: (this.state.presences || []).length
      }
    };
    
    return exportData;
  },
  
  /**
   * Scarica file JSON con export completo
   */
  downloadJSONExport() {
    try {
      const exportData = this.exportAllData();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `maori-app-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Export JSON completato', { type: 'success' });
    } catch (error) {
      console.error('Errore export JSON:', error);
      this.showToast('Errore durante l\'export: ' + (error.message || 'Errore sconosciuto'), { type: 'error' });
    }
  },
  
  /**
   * Esporta presenze in formato CSV
   * @returns {string} Stringa CSV
   */
  exportPresencesToCSV() {
    if (!this.state || !this.state.presences || this.state.presences.length === 0) {
      throw new Error('Nessuna presenza disponibile per l\'export');
    }
    
    // Header CSV
    const headers = ['Esploratore ID', 'Esploratore Nome', 'Esploratore Cognome', 'Attività ID', 'Attività Tipo', 'Attività Data', 'Attività Descrizione', 'Stato', 'Pagato', 'Tipo Pagamento'];
    const rows = [headers.join(',')];
    
    // Dati
    const presences = this.state.presences || [];
    const scoutsMap = new Map((this.state.scouts || []).map(s => [s.id, s]));
    const activitiesMap = new Map((this.state.activities || []).map(a => [a.id, a]));
    
    presences.forEach(p => {
      const scout = scoutsMap.get(p.esploratoreId);
      const activity = activitiesMap.get(p.attivitaId);
      const activityDate = activity?.data ? 
        (activity.data.toDate ? activity.data.toDate().toLocaleDateString('it-IT') : new Date(activity.data).toLocaleDateString('it-IT')) : '';
      
      const row = [
        p.esploratoreId || '',
        scout?.nome || '',
        scout?.cognome || '',
        p.attivitaId || '',
        activity?.tipo || '',
        activityDate,
        (activity?.descrizione || '').replace(/,/g, ';'), // Sostituisce virgole per CSV
        p.stato || '',
        p.pagato ? 'Sì' : 'No',
        p.tipoPagamento || ''
      ];
      rows.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')); // Escape per CSV
    });
    
    return rows.join('\n');
  },
  
  /**
   * Esporta attività in formato CSV
   * @returns {string} Stringa CSV
   */
  exportActivitiesToCSV() {
    if (!this.state || !this.state.activities || this.state.activities.length === 0) {
      throw new Error('Nessuna attività disponibile per l\'export');
    }
    
    const headers = ['ID', 'Tipo', 'Data', 'Descrizione', 'Costo'];
    const rows = [headers.join(',')];
    
    (this.state.activities || []).forEach(a => {
      const dateStr = a.data ? 
        (a.data.toDate ? a.data.toDate().toLocaleDateString('it-IT') : new Date(a.data).toLocaleDateString('it-IT')) : '';
      
      const row = [
        a.id || '',
        a.tipo || '',
        dateStr,
        (a.descrizione || '').replace(/,/g, ';'),
        a.costo || '0'
      ];
      rows.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    });
    
    return rows.join('\n');
  },
  
  /**
   * Scarica CSV per presenze
   */
  downloadPresencesCSV() {
    try {
      const csvContent = this.exportPresencesToCSV();
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM per Excel
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `maori-presenze-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Export CSV presenze completato', { type: 'success' });
    } catch (error) {
      console.error('Errore export CSV presenze:', error);
      this.showToast('Errore durante l\'export: ' + (error.message || 'Errore sconosciuto'), { type: 'error' });
    }
  },
  
  /**
   * Scarica CSV per attività
   */
  downloadActivitiesCSV() {
    try {
      const csvContent = this.exportActivitiesToCSV();
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `maori-attivita-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Export CSV attività completato', { type: 'success' });
    } catch (error) {
      console.error('Errore export CSV attività:', error);
      this.showToast('Errore durante l\'export: ' + (error.message || 'Errore sconosciuto'), { type: 'error' });
    }
  },
  
  /**
   * Importa dati da JSON
   * @param {object} importData - Dati da importare
   * @param {object} options - Opzioni import
   * @returns {object} Risultato import
   */
  async importJSONData(importData, options = { merge: false, validate: true }) {
    if (!importData || !importData.data) {
      throw new Error('Formato file non valido: dati mancanti');
    }
    
    const data = importData.data;
    const errors = [];
    const warnings = [];
    const imported = {
      scouts: 0,
      staff: 0,
      activities: 0,
      presences: 0
    };
    
    // Validazione base
    if (options.validate) {
      if (!Array.isArray(data.scouts) || !Array.isArray(data.staff) || 
          !Array.isArray(data.activities) || !Array.isArray(data.presences)) {
        throw new Error('Formato dati non valido: array mancanti');
      }
    }
    
    if (!this.currentUser) {
      throw new Error('Devi essere loggato per importare dati');
    }
    
    try {
      // Import scouts
      if (data.scouts && Array.isArray(data.scouts)) {
        for (const scout of data.scouts) {
          try {
            if (!scout.id || !scout.nome || !scout.cognome) {
              warnings.push(`Scout non valido saltato: ${scout.nome || 'N/A'} ${scout.cognome || 'N/A'}`);
              continue;
            }
            
            // Check duplicati se merge = false
            if (!options.merge && this.checkScoutExists(scout.id)) {
              warnings.push(`Scout ${scout.nome} ${scout.cognome} già esistente, saltato`);
              continue;
            }
            
            await DATA.addScout({ nome: scout.nome, cognome: scout.cognome }, this.currentUser);
            imported.scouts++;
          } catch (error) {
            errors.push(`Errore import scout ${scout.nome} ${scout.cognome}: ${error.message}`);
          }
        }
      }
      
      // Import staff
      if (data.staff && Array.isArray(data.staff)) {
        for (const member of data.staff) {
          try {
            if (!member.nome || !member.cognome || !member.email) {
              warnings.push(`Staff non valido saltato: ${member.nome || 'N/A'} ${member.cognome || 'N/A'}`);
              continue;
            }
            
            if (this.checkDuplicateStaffEmail(member.email)) {
              warnings.push(`Staff con email ${member.email} già esistente, saltato`);
              continue;
            }
            
            await DATA.addStaff({ nome: member.nome, cognome: member.cognome, email: member.email }, this.currentUser);
            imported.staff++;
          } catch (error) {
            errors.push(`Errore import staff ${member.nome} ${member.cognome}: ${error.message}`);
          }
        }
      }
      
      // Import activities
      if (data.activities && Array.isArray(data.activities)) {
        for (const activity of data.activities) {
          try {
            if (!activity.tipo || !activity.data || !activity.descrizione) {
              warnings.push(`Attività non valida saltata: ${activity.descrizione || 'N/A'}`);
              continue;
            }
            
            const activityDate = activity.data?.toDate ? activity.data.toDate() : new Date(activity.data);
            await DATA.addActivity({
              tipo: activity.tipo,
              data: activityDate,
              descrizione: activity.descrizione,
              costo: activity.costo || '0'
            }, this.currentUser);
            imported.activities++;
          } catch (error) {
            errors.push(`Errore import attività ${activity.descrizione}: ${error.message}`);
          }
        }
      }
      
      // Ricarica stato dopo import
      this.state = await DATA.loadAll();
      this.rebuildPresenceIndex();
      
      return {
        success: errors.length === 0,
        imported,
        errors,
        warnings
      };
    } catch (error) {
      throw new Error(`Errore durante l'import: ${error.message}`);
    }
  },
  
  /**
   * Gestisce upload file JSON per import
   * @param {File} file - File JSON da importare
   * @param {object} options - Opzioni import
   */
  async handleJSONImport(file, options = { merge: false, validate: true }) {
    if (!file || file.type !== 'application/json') {
      throw new Error('File non valido: seleziona un file JSON');
    }
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      const confirmed = await new Promise((resolve) => {
        const data = importData.data || {};
        const counts = {
          scouts: (data.scouts || []).length,
          staff: (data.staff || []).length,
          activities: (data.activities || []).length,
          presences: (data.presences || []).length
        };
        
        this.showConfirmModal({
          title: 'Conferma Import',
          message: `Importare ${counts.scouts} esploratori, ${counts.staff} staff, ${counts.activities} attività, ${counts.presences} presenze?`,
          confirmText: 'Importa',
          cancelText: 'Annulla',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        });
      });
      
      if (!confirmed) return;
      
      const result = await this.importJSONData(importData, options);
      
      if (result.success) {
        this.showToast(`Import completato: ${result.imported.scouts} esploratori, ${result.imported.staff} staff, ${result.imported.activities} attività importati`, { type: 'success', duration: 5000 });
        if (result.warnings.length > 0) {
          console.warn('Avvisi import:', result.warnings);
        }
        this.renderCurrentPage();
      } else {
        this.showToast(`Import completato con errori. ${result.errors.length} errori, ${result.warnings.length} avvisi`, { type: 'warning', duration: 5000 });
        console.error('Errori import:', result.errors);
        this.renderCurrentPage();
      }
    } catch (error) {
      console.error('Errore import:', error);
      this.showToast('Errore durante l\'import: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
    }
  },

  // ============== Mobile Gesture Support ==============
  
  /**
   * Setup swipe gestures per delete su liste mobile
   * @param {HTMLElement} container - Container della lista
   * @param {Function} onDelete - Callback quando viene eseguito swipe delete (riceve itemId)
   * @param {string} itemSelector - Selettore per gli item della lista (default: '> div')
   * @param {string} itemIdAttr - Attributo data-* che contiene l'ID dell'item (default: 'data-id')
   */
  setupSwipeDelete(container, onDelete, itemSelector = '> div', itemIdAttr = 'data-id') {
    if (!container || typeof onDelete !== 'function') return;
    
    // Solo su dispositivi touch
    if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let currentElement = null;
    let swipeThreshold = 80; // Pixel minimi per trigger delete
    let deleteThreshold = 150; // Pixel per eliminare direttamente (senza conferma)
    
    const handleTouchStart = (e) => {
      const item = e.target.closest(itemSelector);
      if (!item || item.hasAttribute('data-swipe-disabled')) return;
      
      // Ignora se si tocca un link o un button
      if (e.target.closest('a, button')) return;
      
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      currentElement = item;
      
      // Reset eventuali trasformazioni precedenti
      item.style.transition = 'transform 0.2s ease-out';
    };
    
    const handleTouchMove = (e) => {
      if (!currentElement) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Se movimento principalmente verticale, non fare swipe
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }
      
      // Solo swipe verso sinistra (negative deltaX)
      if (deltaX < 0) {
        e.preventDefault();
        const swipeAmount = Math.max(deltaX, -deleteThreshold * 1.5);
        currentElement.style.transform = `translateX(${swipeAmount}px)`;
        
        // Cambia colore background in base alla distanza
        if (Math.abs(swipeAmount) >= deleteThreshold) {
          currentElement.style.backgroundColor = 'rgba(220, 38, 38, 0.2)'; // rosso chiaro
        } else if (Math.abs(swipeAmount) >= swipeThreshold) {
          currentElement.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'; // rosso molto chiaro
        } else {
          currentElement.style.backgroundColor = '';
        }
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!currentElement) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Se movimento principalmente verticale, reset
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        resetElement(currentElement);
        currentElement = null;
        return;
      }
      
      // Solo swipe verso sinistra
      if (deltaX < 0 && Math.abs(deltaX) >= swipeThreshold) {
        const itemId = currentElement.getAttribute(itemIdAttr) || 
                      currentElement.id ||
                      currentElement.querySelector('[data-item-id]')?.getAttribute('data-item-id');
        
        if (itemId) {
          // Se swipe molto lungo, elimina direttamente
          if (Math.abs(deltaX) >= deleteThreshold) {
            onDelete(itemId);
            resetElement(currentElement);
          } else {
            // Mostra animazione e poi conferma
            currentElement.style.transform = 'translateX(-100px)';
            currentElement.style.opacity = '0.5';
            setTimeout(() => {
              onDelete(itemId);
              resetElement(currentElement);
            }, 200);
          }
        } else {
          resetElement(currentElement);
        }
      } else {
        // Reset se swipe non sufficiente
        resetElement(currentElement);
      }
      
      currentElement = null;
    };
    
    const resetElement = (element) => {
      if (!element) return;
      element.style.transform = '';
      element.style.backgroundColor = '';
      element.style.opacity = '';
      element.style.transition = '';
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  },
  
  /**
   * Setup long press gesture per azioni contestuali
   * @param {HTMLElement|NodeList} elements - Elementi su cui abilitare long press
   * @param {Function|Object} handler - Callback quando viene eseguito long press, oppure oggetto con azioni
   * @param {number} duration - Durata in ms per triggerare long press (default: 500ms)
   */
  setupLongPress(elements, handler, duration = 500) {
    if (!elements || !handler) return;
    
    // Solo su dispositivi touch
    if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    
    // Converte a array se necessario
    const elementsArray = elements instanceof NodeList ? Array.from(elements) : 
                         Array.isArray(elements) ? elements : 
                         [elements];
    
    let pressTimer = null;
    let hasMoved = false;
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e, element) => {
      // Ignora se si tocca un link o un button (hanno già azioni native)
      if (e.target.closest('a, button, input, select, textarea')) return;
      
      hasMoved = false;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      
      // Vibrazione leggera feedback (se supportata)
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      pressTimer = setTimeout(() => {
        if (!hasMoved) {
          // Vibrazione più forte per conferma
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
          
          // Preveni default (menu contestuale browser)
          e.preventDefault();
          
          // Esegui handler
          if (typeof handler === 'function') {
            handler(element, e);
          } else if (typeof handler === 'object' && handler.showMenu) {
            handler.showMenu(element, e);
          }
        }
        pressTimer = null;
      }, duration);
    };
    
    const handleTouchMove = (e) => {
      if (pressTimer) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        
        // Se movimento > 10px, annulla long press
        if (deltaX > 10 || deltaY > 10) {
          hasMoved = true;
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      }
    };
    
    const handleTouchEnd = (e) => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    
    elementsArray.forEach(element => {
      if (!element || element.hasAttribute('data-longpress-disabled')) return;
      
      element.addEventListener('touchstart', (e) => handleTouchStart(e, element), { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
      element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    });
  },
  
  /**
   * Mostra menu contestuale mobile-friendly
   * @param {HTMLElement} targetElement - Elemento che ha triggerato il long press
   * @param {Array} actions - Array di azioni {label, icon, action, danger}
   * @param {Object} position - Posizione {x, y} dove mostrare il menu
   */
  showContextMenu(targetElement, actions = [], position = null) {
    if (!actions || actions.length === 0) return;
    
    // Rimuovi menu esistente se presente
    const existingMenu = document.getElementById('contextMenu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    // Calcola posizione
    let x = position?.x || 0;
    let y = position?.y || 0;
    
    if (!position && targetElement) {
      const rect = targetElement.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    
    // Crea menu
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 10000;
      min-width: 200px;
      padding: 8px;
      animation: fadeIn 0.15s ease-out;
    `;
    
    actions.forEach((action, index) => {
      const button = document.createElement('button');
      button.className = `w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        action.danger ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
      }`;
      button.innerHTML = `
        <span style="font-size: 1.2em;">${action.icon || '⚡'}</span>
        <span>${action.label}</span>
      `;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof action.action === 'function') {
          action.action(targetElement, e);
        }
        menu.remove();
      });
      menu.appendChild(button);
      
      if (index < actions.length - 1) {
        const divider = document.createElement('hr');
        divider.style.cssText = 'border: none; border-top: 1px solid var(--border); margin: 4px 0;';
        menu.appendChild(divider);
      }
    });
    
    document.body.appendChild(menu);
    
    // Chiudi menu al click fuori o scroll
    const closeMenu = (e) => {
      if (menu && !menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
        document.removeEventListener('touchstart', closeMenu);
        document.removeEventListener('scroll', closeMenu, true);
      }
    };
    
    // Delay per evitare chiusura immediata
    setTimeout(() => {
      document.addEventListener('click', closeMenu);
      document.addEventListener('touchstart', closeMenu);
      document.addEventListener('scroll', closeMenu, true);
    }, 100);
  },

  /**
   * Setup drag & drop per riordinare elementi in una lista
   * @param {HTMLElement} container - Container della lista
   * @param {string} itemSelector - Selettore per gli item (default: '> *')
   * @param {Function} onReorder - Callback quando viene riordinato (riceve array di IDs)
   * @param {Object} options - Opzioni aggiuntive { handle: selector per drag handle, disabled: selettore elementi non draggable }
   */
  setupDragAndDrop(container, itemSelector = '> *', onReorder, options = {}) {
    if (!container || typeof onReorder !== 'function') return;
    
    const { handle, disabled } = options;
    let draggedElement = null;
    let placeholder = null;
    let dragOverElement = null;
    
    const createPlaceholder = () => {
      const ph = document.createElement('div');
      ph.className = 'drag-placeholder';
      ph.style.cssText = `
        height: 60px;
        background: var(--brand);
        opacity: 0.3;
        border-radius: 8px;
        border: 2px dashed var(--brand-strong);
        margin: 4px 0;
        transition: all 0.2s ease;
      `;
      return ph;
    };
    
    const handleDragStart = (e) => {
      const item = e.target.closest(itemSelector);
      if (!item || item.closest(disabled)) return;
      
      // Se c'è un handle, verifica che il drag sia iniziato da lì
      if (handle && !e.target.closest(handle)) {
        // Cerca handle nel container
        const handleEl = item.querySelector(handle);
        if (!handleEl || !handleEl.contains(e.target)) {
          return;
        }
      }
      
      draggedElement = item;
      item.style.opacity = '0.5';
      item.style.cursor = 'grabbing';
      
      placeholder = createPlaceholder();
      item.parentNode.insertBefore(placeholder, item.nextSibling);
      
      // DataTransfer per browser compatibility
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', item.innerHTML);
      }
      
      // Aggiungi classe globale
      document.body.classList.add('dragging');
    };
    
    const handleDragOver = (e) => {
      if (!draggedElement) return;
      e.preventDefault();
      
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      
      const item = e.target.closest(itemSelector);
      if (!item || item === draggedElement || item === placeholder) return;
      
      const rect = item.getBoundingClientRect();
      const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
      
      dragOverElement = item;
      
      if (next) {
        item.parentNode.insertBefore(placeholder, item.nextSibling);
      } else {
        item.parentNode.insertBefore(placeholder, item);
      }
    };
    
    const handleDragEnd = (e) => {
      if (!draggedElement) return;
      
      draggedElement.style.opacity = '';
      draggedElement.style.cursor = '';
      document.body.classList.remove('dragging');
      
      if (placeholder && placeholder.parentNode) {
        if (draggedElement.parentNode === placeholder.parentNode) {
          // Inserisci elemento nella nuova posizione
          placeholder.parentNode.insertBefore(draggedElement, placeholder);
        }
        placeholder.remove();
      }
      
      // Ottieni nuovo ordine
      const items = Array.from(container.querySelectorAll(itemSelector));
      const order = items
        .map(el => el.getAttribute('data-id') || el.id)
        .filter(id => id);
      
      if (order.length > 0) {
        onReorder(order);
      }
      
      draggedElement = null;
      placeholder = null;
      dragOverElement = null;
    };
    
    // Aggiungi drag handle se specificato
    container.querySelectorAll(itemSelector).forEach(item => {
      if (item.closest(disabled)) return;
      
      item.draggable = true;
      item.style.cursor = handle ? 'default' : 'grab';
      
      if (handle) {
        const handleEl = item.querySelector(handle);
        if (handleEl) {
          handleEl.style.cursor = 'grab';
          handleEl.draggable = true;
          handleEl.addEventListener('dragstart', handleDragStart);
        }
      } else {
        item.addEventListener('dragstart', handleDragStart);
      }
      
      item.addEventListener('dragover', handleDragOver);
      item.addEventListener('dragend', handleDragEnd);
    });
    
    // Aggiungi listener per nuovi elementi (per quando la lista viene ri-renderizzata)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.matches && node.matches(itemSelector)) {
            if (node.closest(disabled)) return;
            
            node.draggable = true;
            node.style.cursor = handle ? 'default' : 'grab';
            
            if (handle) {
              const handleEl = node.querySelector(handle);
              if (handleEl) {
                handleEl.style.cursor = 'grab';
                handleEl.draggable = true;
                handleEl.addEventListener('dragstart', handleDragStart);
              }
            } else {
              node.addEventListener('dragstart', handleDragStart);
            }
            
            node.addEventListener('dragover', handleDragOver);
            node.addEventListener('dragend', handleDragEnd);
          }
        });
      });
    });
    
    observer.observe(container, { childList: true, subtree: true });
  },

  /**
   * Setup pull-to-refresh per liste
   * @param {HTMLElement} container - Container scrollabile
   * @param {Function} onRefresh - Callback quando viene triggerato refresh
   */
  setupPullToRefresh(container, onRefresh) {
    if (!container || typeof onRefresh !== 'function') return;
    
    // Solo su dispositivi touch
    if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    
    let touchStartY = 0;
    let isPulling = false;
    let pullDistance = 0;
    let refreshIndicator = null;
    
    // Crea indicatore refresh se non esiste
    const createRefreshIndicator = () => {
      if (refreshIndicator) return refreshIndicator;
      refreshIndicator = document.createElement('div');
      refreshIndicator.id = 'pullToRefreshIndicator';
      refreshIndicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--brand);
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        transition: top 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
      `;
      refreshIndicator.innerHTML = '🔄 Rilascia per aggiornare';
      document.body.appendChild(refreshIndicator);
      return refreshIndicator;
    };
    
    const handleTouchStart = (e) => {
      // Solo se siamo in cima al container
      if (container.scrollTop > 10) return;
      
      touchStartY = e.touches[0].clientY;
      isPulling = false;
      pullDistance = 0;
    };
    
    const handleTouchMove = (e) => {
      if (touchStartY === 0) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;
      
      // Solo se scroll verso il basso dalla cima
      if (deltaY > 0 && container.scrollTop === 0) {
        isPulling = true;
        pullDistance = Math.min(deltaY, 100); // Max 100px
        
        // Mostra indicatore
        const indicator = createRefreshIndicator();
        const indicatorTop = Math.min(pullDistance - 60, 20);
        indicator.style.top = `${indicatorTop}px`;
        
        // Ruota icona in base alla distanza
        if (pullDistance >= 80) {
          indicator.innerHTML = '🔄 Rilascia per aggiornare';
          indicator.style.background = 'var(--brand-strong)';
        } else {
          indicator.innerHTML = '⬇️ Trascina per aggiornare';
          indicator.style.background = 'var(--brand)';
        }
        
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e) => {
      if (!isPulling) {
        touchStartY = 0;
        return;
      }
      
      if (pullDistance >= 80 && refreshIndicator) {
        // Trigger refresh
        refreshIndicator.innerHTML = '🔄 Aggiornamento...';
        refreshIndicator.style.background = 'var(--brand)';
        
        // Chiama callback
        if (typeof onRefresh === 'function') {
          Promise.resolve(onRefresh()).then(() => {
            // Nascondi indicatore dopo refresh
            setTimeout(() => {
              if (refreshIndicator) {
                refreshIndicator.style.top = '-60px';
              }
            }, 500);
          }).catch((error) => {
            console.error('Errore durante refresh:', error);
            if (refreshIndicator) {
              refreshIndicator.innerHTML = '❌ Errore aggiornamento';
              refreshIndicator.style.background = '#dc2626';
              setTimeout(() => {
                refreshIndicator.style.top = '-60px';
              }, 2000);
            }
          });
        }
      } else {
        // Nascondi indicatore se non abbastanza pull
        if (refreshIndicator) {
          refreshIndicator.style.top = '-60px';
        }
      }
      
      touchStartY = 0;
      isPulling = false;
      pullDistance = 0;
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  },

  // ============== Form Validation Real-time ==============
  
  /**
   * Inizializza validazione real-time per un form
   * @param {HTMLFormElement} form - Form da validare
   * @param {object} rules - Regole di validazione per campo
   */
  setupFormValidation(form, rules) {
    if (!form || !rules) return;
    
    // Per ogni campo con regole, aggiungi validazione
    Object.keys(rules).forEach(fieldId => {
      const input = form.querySelector(`#${fieldId}`);
      if (!input) return;
      
      const rule = rules[fieldId];
      const fieldGroup = input.closest('.field-group') || input.parentElement;
      
      // Crea elemento per messaggi errore se non esiste
      let errorEl = fieldGroup.querySelector('.field-error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        input.parentElement.appendChild(errorEl);
      }
      
      // Validazione real-time su input/blur
      const validateField = () => {
        const value = input.value.trim();
        const validation = this.validateFieldValue(value, rule);
        
        // Rimuovi classi precedenti
        input.classList.remove('valid', 'invalid');
        fieldGroup?.classList.remove('has-error', 'is-valid');
        
        if (validation.valid) {
          input.classList.add('valid');
          fieldGroup?.classList.add('is-valid');
          if (errorEl) errorEl.textContent = '';
        } else {
          input.classList.add('invalid');
          fieldGroup?.classList.add('has-error');
          if (errorEl) errorEl.textContent = validation.error || '';
        }
        
        return validation.valid;
      };
      
      // Debounce per evitare troppe validazioni durante typing
      let timeout;
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(validateField, 300);
      });
      
      input.addEventListener('blur', validateField);
      
      // Validazione iniziale se campo già valorizzato
      if (input.value) {
        setTimeout(validateField, 100);
      }
    });
  },
  
  /**
   * Valida un valore campo secondo una regola
   * @param {*} value - Valore da validare
   * @param {object} rule - Regola di validazione
   * @returns {object} { valid: boolean, error: string }
   */
  validateFieldValue(value, rule) {
    // Required
    if (rule.required && (!value || value.trim() === '')) {
      return { valid: false, error: rule.requiredMessage || 'Campo obbligatorio' };
    }
    
    // Se campo vuoto e non required, valido
    if (!value || value.trim() === '') {
      return { valid: true, error: '' };
    }
    
    // Email
    if (rule.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return { valid: false, error: 'Email non valida' };
      }
    }
    
    // Length
    if (rule.minLength && value.length < rule.minLength) {
      return { valid: false, error: `Minimo ${rule.minLength} caratteri` };
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return { valid: false, error: `Massimo ${rule.maxLength} caratteri` };
    }
    
    // Pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      return { valid: false, error: rule.patternMessage || 'Formato non valido' };
    }
    
    // Custom validator
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value);
      if (typeof result === 'string') {
        return { valid: false, error: result };
      }
      if (result === false) {
        return { valid: false, error: rule.customMessage || 'Valore non valido' };
      }
    }
    
    return { valid: true, error: '' };
  },
  
  /**
   * Valida intero form
   * @param {HTMLFormElement} form - Form da validare
   * @param {object} rules - Regole di validazione
   * @returns {object} { valid: boolean, errors: object }
   */
  validateForm(form, rules) {
    if (!form || !rules) return { valid: true, errors: {} };
    
    const errors = {};
    let allValid = true;
    
    Object.keys(rules).forEach(fieldId => {
      const input = form.querySelector(`#${fieldId}`);
      if (!input) return;
      
      const value = input.value.trim();
      const rule = rules[fieldId];
      const validation = this.validateFieldValue(value, rule);
      
      if (!validation.valid) {
        errors[fieldId] = validation.error;
        allValid = false;
        
        // Aggiorna UI
        input.classList.add('invalid');
        const fieldGroup = input.closest('.field-group') || input.parentElement;
        fieldGroup?.classList.add('has-error');
        
        let errorEl = fieldGroup?.querySelector('.field-error');
        if (!errorEl && fieldGroup) {
          errorEl = document.createElement('span');
          errorEl.className = 'field-error';
          input.parentElement.appendChild(errorEl);
        }
        if (errorEl) errorEl.textContent = validation.error;
      } else {
        input.classList.add('valid');
        const fieldGroup = input.closest('.field-group') || input.parentElement;
        fieldGroup?.classList.add('is-valid');
      }
    });
    
    return { valid: allValid, errors };
  },

  // Rate limiting migliorato per operazioni frequenti
  _operationQueue: new Map(),
  _operationTimestamps: new Map(),
  
  /**
   * Rate limiter per operazioni: blocca se troppe operazioni in breve tempo
   * @param {string} key - Chiave univoca per il tipo di operazione
   * @param {number} maxOps - Numero massimo operazioni
   * @param {number} windowMs - Finestra temporale in ms
   * @returns {boolean} true se operazione permessa
   */
  checkRateLimit(key, maxOps = 10, windowMs = 1000) {
    const now = Date.now();
    const timestamps = this._operationTimestamps.get(key) || [];
    
    // Rimuovi timestamp fuori dalla finestra
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= maxOps) {
      try { console.warn(`[RateLimit] ${key} blocked: ${validTimestamps.length}/${maxOps} in ${windowMs}ms`); } catch { }
      return false;
    }
    
    validTimestamps.push(now);
    this._operationTimestamps.set(key, validTimestamps);
    return true;
  },
  
  /**
   * Debounce con rate limiting per operazioni write
   * @param {string} key - Chiave univoca
   * @param {Function} fn - Funzione da eseguire
   * @param {number} delay - Delay in ms
   * @param {number} maxOps - Max operazioni per finestra
   * @param {number} windowMs - Finestra temporale
   */
  debounceWithRateLimit(key, fn, delay = 300, maxOps = 10, windowMs = 1000) {
    // Cancella timeout precedente
    const existing = this._operationQueue.get(key);
    if (existing) clearTimeout(existing.timeout);
    
    // Controlla rate limit
    if (!this.checkRateLimit(key, maxOps, windowMs)) {
      try { console.warn(`[RateLimit] Operation ${key} rate limited`); } catch { }
      return Promise.reject(new Error('Troppe operazioni, riprova tra poco'));
    }
    
    // Crea nuovo timeout
    const timeout = setTimeout(() => {
      fn();
      this._operationQueue.delete(key);
    }, delay);
    
    this._operationQueue.set(key, { timeout, fn });
  },

  // Funzioni di utilità
  logNetworkInfo() {
    try {
      const nav = navigator;
      const c = nav && nav.connection ? nav.connection : null;
      if (c) {
        console.info('[Net] connection', {
          effectiveType: c.effectiveType,
          rtt: c.rtt,
          downlink: c.downlink,
          saveData: c.saveData
        });
      }
    } catch { }
  },

  updateConnectionStatus(isOnline) {
    const statusEl = this.qs('#connectionStatus');
    const statusText = this.qs('#connectionStatusText');
    if (statusEl && statusText) {
      if (isOnline === false) {
        statusEl.classList.remove('hidden', 'bg-green-800/50');
        statusEl.classList.add('bg-yellow-600/80');
        statusText.textContent = 'Offline';
        statusEl.title = 'Modalità offline - alcune funzionalità potrebbero non essere disponibili';
      } else {
        statusEl.classList.remove('hidden', 'bg-yellow-600/80');
        statusEl.classList.add('bg-green-800/50');
        statusText.textContent = 'Online';
        statusEl.title = 'Connesso';
      }
    }
  },

  async runConnectivityProbe() {
    try {
      // Aggiorna status basato su navigator.onLine
      this.updateConnectionStatus(navigator.onLine);
      
      // Listener per cambiamenti di stato online/offline
      window.addEventListener('online', () => {
        this.updateConnectionStatus(true);
        this.showToast('Connessione ristabilita', { type: 'success', duration: 2000 });
      });
      window.addEventListener('offline', () => {
        this.updateConnectionStatus(false);
        this.showToast('Modalità offline attiva', { type: 'warning', duration: 3000 });
      });

      const t = async (label, url) => {
        const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        try {
          const res = await fetch(url, { cache: 'no-store' });
          const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          console.info('[Net] probe', label, Math.round(t1 - t0) + 'ms', res.status);
          this.updateConnectionStatus(true);
        } catch (e) {
          const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          console.warn('[Net] probe FAILED', label, Math.round(t1 - t0) + 'ms', String(e));
          // Solo se navigator.onLine è false, mostra offline
          if (!navigator.onLine) {
            this.updateConnectionStatus(false);
          }
        }
      };
      // Stesso dominio (indicativo di lentezza locale/SW)
      t('same-origin manifest', 'manifest.json');
      // Firebase Auth JS (CDN) - test di connettività esterna
      t('firebase-auth.js', 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
      // Nota: generate_204 rimosso perché non supporta CORS e genera errori
    } catch { }
  },

  async renderInBatches({ container, items, renderItem, batchSize = 100, onComplete }) {
    if (!container) return;
    if (!Array.isArray(items) || items.length === 0) { 
      container.innerHTML = ''; 
      if (onComplete) onComplete();
      return; 
    }
    
    // Se > 100 elementi, usa virtualizzazione
    if (items.length > 100) {
      return this.renderVirtualizedList({ container, items, renderItem, onComplete });
    }
    
    if (items.length <= batchSize) {
      container.innerHTML = items.map(renderItem).join('');
      if (onComplete) onComplete();
      return;
    }
    container.innerHTML = '';
    
    // Ottimizzazione: usa requestIdleCallback se disponibile per non bloccare UI
    const scheduleNext = () => {
      return new Promise(resolve => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve(), { timeout: 100 });
        } else {
          requestAnimationFrame(() => resolve());
        }
      });
    };
    
    for (let i = 0; i < items.length; i += batchSize) {
      const slice = items.slice(i, i + batchSize);
      container.insertAdjacentHTML('beforeend', slice.map(renderItem).join(''));
      await scheduleNext();
    }
    
    // Chiama callback onComplete se fornita
    if (onComplete) onComplete();
  },

  /**
   * Renderizza lista virtualizzata (solo elementi visibili)
   * @param {Object} options - Opzioni rendering
   * @param {HTMLElement} options.container - Container della lista
   * @param {Array} options.items - Array elementi da renderizzare
   * @param {Function} options.renderItem - Funzione per renderizzare un singolo elemento
   * @param {Function} options.onComplete - Callback chiamata dopo rendering
   * @param {number} options.itemHeight - Altezza stimata item in px (default: 80)
   * @param {number} options.overscan - Numero elementi da renderizzare fuori viewport (default: 5)
   */
  renderVirtualizedList({ container, items, renderItem, onComplete, itemHeight = 80, overscan = 5 }) {
    if (!container) return;
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '';
      if (onComplete) onComplete();
      return;
    }

    // Crea wrapper per virtualizzazione
    const virtualId = `virtual-${container.id || 'list'}`;
    let virtualWrapper = document.getElementById(virtualId);
    
    if (!virtualWrapper) {
      virtualWrapper = document.createElement('div');
      virtualWrapper.id = virtualId;
      virtualWrapper.className = 'virtual-list-wrapper';
      virtualWrapper.style.position = 'relative';
      virtualWrapper.style.overflow = 'auto';
      virtualWrapper.style.height = '100%';
      
      // Sostituisci container originale
      container.parentNode?.insertBefore(virtualWrapper, container);
      container.style.display = 'none';
    }
    
    // Calcola altezza totale
    const totalHeight = items.length * itemHeight;
    
    // Crea placeholder per altezza totale
    let placeholder = virtualWrapper.querySelector('.virtual-list-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'virtual-list-placeholder';
      placeholder.style.height = `${totalHeight}px`;
      placeholder.style.position = 'relative';
      virtualWrapper.appendChild(placeholder);
    } else {
      placeholder.style.height = `${totalHeight}px`;
    }
    
    // Container per elementi visibili
    let visibleContainer = virtualWrapper.querySelector('.virtual-list-visible');
    if (!visibleContainer) {
      visibleContainer = document.createElement('div');
      visibleContainer.className = 'virtual-list-visible';
      visibleContainer.style.position = 'absolute';
      visibleContainer.style.top = '0';
      visibleContainer.style.left = '0';
      visibleContainer.style.right = '0';
      virtualWrapper.appendChild(visibleContainer);
    }
    
    // Funzione per renderizzare elementi visibili
    const renderVisible = () => {
      const scrollTop = virtualWrapper.scrollTop || 0;
      const viewportHeight = virtualWrapper.clientHeight || container.parentElement?.clientHeight || 600;
      
      // Calcola range visibile
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);
      
      // Renderizza solo elementi visibili
      const visibleItems = items.slice(startIndex, endIndex + 1);
      const offsetTop = startIndex * itemHeight;
      
      visibleContainer.style.transform = `translateY(${offsetTop}px)`;
      visibleContainer.innerHTML = visibleItems.map((item, idx) => {
        const actualIndex = startIndex + idx;
        return `<div class="virtual-list-item" data-index="${actualIndex}" style="height: ${itemHeight}px;">${renderItem(item, actualIndex)}</div>`;
      }).join('');
    };
    
    // Renderizza iniziale
    renderVisible();
    
    // Throttle scroll per performance
    let scrollTimeout;
    virtualWrapper.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(renderVisible, 16); // ~60fps
    }, { passive: true });
    
    // Resize observer per viewport changes
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        renderVisible();
      });
      resizeObserver.observe(virtualWrapper);
    }
    
    // Chiama onComplete dopo rendering iniziale
    if (onComplete) {
      requestAnimationFrame(() => {
        onComplete();
      });
    }
  },

  toJsDate(firestoreDate) {
    if (firestoreDate && firestoreDate.toDate) {
      return firestoreDate.toDate();
    }
    return new Date(firestoreDate);
  },

  rebuildPresenceIndex() {
    // Ricostruisce l'indice delle presenze per ottimizzare le ricerche
    this.presenceIndex = new Map();
    this.state.presences.forEach(p => {
      const key = `${p.esploratoreId}_${p.attivitaId}`;
      this.presenceIndex.set(key, p);
    });
  },

  // Presenze deduplicate disponibili ovunque (non solo in presenze.js)
  getDedupedPresences() {
    if (this.presenceIndex && this.presenceIndex.size > 0) {
      return Array.from(this.presenceIndex.values());
    }
    return Array.isArray(this.state.presences) ? this.state.presences : [];
  },

  // Funzioni per audit logs
  async loadAuditLogs() {
    if (DATA.adapter.constructor.name === 'FirestoreAdapter') {
      try {
        const auditSnap = await getDocs(DATA.adapter.cols.auditLogs);
        return auditSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Errore nel caricamento audit logs:', error);
        return [];
      }
    } else {
      return [];
    }
  },

  // Aggiornamenti presenze con refresh stato e dashboard
  async updatePresenceCell({ field, value, scoutId, activityId }) {
    if (!this.currentUser) { 
      this.showToast('Devi essere loggato per modificare le presenze.', { type: 'error' }); 
      return; 
    }
    if (!this.selectedStaffId) { 
      this.showToast('Seleziona uno Staff per abilitare le modifiche.', { type: 'warning' }); 
      return; 
    }
    // Trova la cella e aggiungi feedback visivo
    const cellSelector = `[data-scout-id="${scoutId}"][data-activity-id="${activityId}"]`;
    const cell = document.querySelector(cellSelector)?.closest('td');
    const originalBg = cell?.style.backgroundColor;
    if (cell) {
      cell.style.transition = 'background-color 0.3s ease';
      cell.style.backgroundColor = '#dbeafe'; // blue-100
    }
    try {
      await DATA.updatePresence({ field, value, scoutId, activityId }, this.currentUser);
      this.state = await DATA.loadAll();
      this.rebuildPresenceIndex();
      // Aggiorna UI corrente
      this.renderCurrentPage();
      // Se siamo in dashboard, aggiorna i grafici se esiste la funzione
      if (typeof this.renderDashboardCharts === 'function') {
        try { this.renderDashboardCharts(); } catch { }
      }
      // Aggiorna anche la sezione pagamenti per attività se presente
      if (typeof this.renderPaymentsPerActivity === 'function') {
        try { this.renderPaymentsPerActivity(); } catch { }
      }
      // Ripristina colore dopo breve delay per permettere il rendering
      setTimeout(() => {
        if (cell) {
          cell.style.backgroundColor = originalBg || '';
          setTimeout(() => {
            if (cell) cell.style.transition = '';
          }, 300);
        }
      }, 100);
    } catch (error) {
      console.error('Errore aggiornamento presenza:', error);
      this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
      if (cell) {
        cell.style.backgroundColor = originalBg || '';
      }
    }
  },

  async updatePaymentCombined({ value, scoutId, activityId }) {
    if (!this.currentUser) { 
      this.showToast('Devi essere loggato per modificare i pagamenti.', { type: 'error' }); 
      return; 
    }
    if (!this.selectedStaffId) { 
      this.showToast('Seleziona uno Staff per abilitare le modifiche.', { type: 'warning' }); 
      return; 
    }
    
    // Rate limiting per operazioni frequenti (max 15 operazioni al secondo)
    const rateLimitKey = `updatePayment_${scoutId}_${activityId}`;
    if (!this.checkRateLimit(rateLimitKey, 15, 1000)) {
      this.showToast('Troppe modifiche rapide, attendi un momento', { type: 'warning', duration: 2000 });
      return;
    }
    
    // Trova la select e aggiungi feedback visivo
    const selectElement = document.querySelector(`select[onchange*="'${scoutId}'"][onchange*="'${activityId}'"]`);
    const cell = selectElement?.closest('td') || selectElement?.closest('li')?.closest('div');
    const originalBg = cell?.style.backgroundColor;
    if (cell) {
      cell.style.transition = 'background-color 0.3s ease';
      cell.style.backgroundColor = '#dbeafe'; // blue-100
    }
    try {
      if (!value) {
        await DATA.updatePresence({ field: 'pagato', value: false, scoutId, activityId }, this.currentUser);
        await DATA.updatePresence({ field: 'tipoPagamento', value: null, scoutId, activityId }, this.currentUser);
      } else {
        await DATA.updatePresence({ field: 'pagato', value: true, scoutId, activityId }, this.currentUser);
        await DATA.updatePresence({ field: 'tipoPagamento', value, scoutId, activityId }, this.currentUser);
      }
      this.state = await DATA.loadAll();
      this.rebuildPresenceIndex();
      this.renderCurrentPage();
      if (typeof this.renderDashboardCharts === 'function') {
        try { this.renderDashboardCharts(); } catch { }
      }
      if (typeof this.renderPaymentsPerActivity === 'function') {
        try { this.renderPaymentsPerActivity(); } catch { }
      }
      // Ripristina colore dopo breve delay
      setTimeout(() => {
        if (cell) {
          cell.style.backgroundColor = originalBg || '';
          setTimeout(() => {
            if (cell) cell.style.transition = '';
          }, 300);
        }
      }, 100);
    } catch (error) {
      console.error('Errore aggiornamento pagamento:', error);
      this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
      if (cell) {
        cell.style.backgroundColor = originalBg || '';
      }
    }
  },

  // Helpers Calendario: apertura modali modifica/elimina attivita
  openEditActivityModal(id) {
    if (!this.currentUser) { 
      this.showToast('Devi essere loggato per modificare attività.', { type: 'error' }); 
      return; 
    }
    const a = (this.state.activities || []).find(x => x.id === id);
    if (!a) return;
    const d = this.toJsDate(a.data);
    const yyyyMmDd = isNaN(d) ? '' : d.toISOString().split('T')[0];
    const tipoEl = this.qs('#editActivityTipo');
    const dataEl = this.qs('#editActivityData');
    const descEl = this.qs('#editActivityDescrizione');
    const costoEl = this.qs('#editActivityCosto');
    const idEl = this.qs('#editActivityId');
    if (idEl) idEl.value = a.id;
    if (tipoEl) tipoEl.value = a.tipo;
    if (dataEl) dataEl.value = yyyyMmDd;
    if (descEl) descEl.value = a.descrizione || '';
    if (costoEl) costoEl.value = a.costo || '';
    this.showModal('editActivityModal');
  },

  confirmDeleteActivity(id) {
    if (!this.currentUser) { 
      this.showToast('Devi essere loggato per eliminare attività.', { type: 'error' }); 
      return; 
    }
    const a = (this.state.activities || []).find(x => x.id === id);
    if (!a) return;
    this.activityToDeleteId = id;
    const d = this.toJsDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT');
    const infoEl = this.qs('#activityInfoToDelete');
    if (infoEl) infoEl.textContent = `${a.tipo} — ${ds}${a.descrizione ? ' — ' + a.descrizione : ''}`;
    this.showModal('confirmDeleteActivityModal');
  },
};

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
});

// Esporta per uso nelle pagine specifiche
window.UI = UI;
window.DATA = DATA;
