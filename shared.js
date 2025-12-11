// shared.js - Codice condiviso tra tutte le pagine

// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, doc, getDocs, addDoc, setDoc, deleteDoc, onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
  }

  async loadAll() {
    const timers = { start: (typeof performance !== 'undefined' ? performance.now() : Date.now()) };
    const timed = async (label, promise) => {
      const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const res = await promise;
      const t1 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      timers[label] = Math.round(t1 - t0);
      return res;
    };
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
    const ref = await addDoc(this.cols.activities, { tipo, data, descrizione, costo });
    if (currentUser) {
      await this.addAuditLog('create', 'activities', ref.id, { tipo, data, descrizione, costo }, currentUser.uid, currentUser.email);
    }
    return ref.id;
  }

  async updateActivity({ id, tipo, data, descrizione, costo }, currentUser) {
    await setDoc(doc(this.db, 'activities', id), { tipo, data, descrizione, costo }, { merge: true });
    if (currentUser) {
      await this.addAuditLog('update', 'activities', id, { tipo, data, descrizione, costo }, currentUser.uid, currentUser.email);
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

// Data Facade
const DATA = {
  adapter: new LocalAdapter(),
  useFirestore() { this.adapter = new FirestoreAdapter(); },
  async loadAll() { return await this.adapter.loadAll(); },
  async addActivity(p, currentUser) { return await this.adapter.addActivity(p, currentUser); },
  async updateActivity(p, currentUser) { return await this.adapter.updateActivity(p, currentUser); },
  async deleteActivity(id, currentUser) { return await this.adapter.deleteActivity(id, currentUser); },
  async addStaff(p, currentUser) { return await this.adapter.addStaff(p, currentUser); },
  async updateStaff(p, currentUser) { return await this.adapter.updateStaff(p, currentUser); },
  async deleteStaff(id, currentUser) { return await this.adapter.deleteStaff(id, currentUser); },
  async addScout(p, currentUser) { return await this.adapter.addScout(p, currentUser); },
  async updateScout(id, p, currentUser) { return await this.adapter.updateScout({ id, ...p }, currentUser); },
  async deleteScout(id, currentUser) { return await this.adapter.deleteScout(id, currentUser); },
  async updatePresence(p, currentUser) { return await this.adapter.updatePresence(p, currentUser); },
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
        navLinks.classList.toggle('active');
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

    // Edit Scout Form
    const editScoutForm = this.qs('#editScoutForm');
    if (editScoutForm && !editScoutForm._bound) {
      editScoutForm._bound = true;
      editScoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per modificare esploratori.', { type: 'error' }); 
          return; 
        }
        const submitBtn = editScoutForm.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        this.setButtonLoading(submitBtn, true, originalText);
        try {
          const id = this.qs('#editScoutId').value;
          const nome = this.qs('#editScoutNome').value.trim();
          const cognome = this.qs('#editScoutCognome').value.trim();
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
      editActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.currentUser) { 
          this.showToast('Devi essere loggato per modificare attività.', { type: 'error' }); 
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
        const originalText = confirmDeleteActivityButton.textContent;
        this.setButtonLoading(confirmDeleteActivityButton, true, originalText);
        try {
          await DATA.deleteActivity(this.activityToDeleteId, this.currentUser);
          this.activityToDeleteId = null;
          this.closeModal('confirmDeleteActivityModal');
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCurrentPage();
          this.showToast('Attività eliminata con successo');
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

  async renderInBatches({ container, items, renderItem, batchSize = 100 }) {
    if (!container) return;
    if (!Array.isArray(items) || items.length === 0) { container.innerHTML = ''; return; }
    if (items.length <= batchSize) {
      container.innerHTML = items.map(renderItem).join('');
      return;
    }
    container.innerHTML = '';
    for (let i = 0; i < items.length; i += batchSize) {
      const slice = items.slice(i, i + batchSize);
      container.insertAdjacentHTML('beforeend', slice.map(renderItem).join(''));
      // Rilascia il thread UI
      // eslint-disable-next-line no-await-in-loop
      await new Promise(requestAnimationFrame);
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
