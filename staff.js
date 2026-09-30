// staff.js - Logica specifica per la pagina Staff

// Sovrascrive la funzione renderCurrentPage
UI.renderCurrentPage = function() {
  this.renderStaff();
  this.setupStaffEventListeners();
  this.initAccessRequestsSection();
};

UI.setupStaffEventListeners = function() {
  // Event listener per form aggiunta staff (una sola volta)
  const form = this.qs('#addStaffForm');
  if (!form || form._bound) return;
  form._bound = true;
  
  // Setup validazione real-time
  this.setupFormValidation(form, {
    staffNome: {
      required: true,
      minLength: 1,
      maxLength: 100,
      requiredMessage: 'Il nome è obbligatorio'
    },
    staffCognome: {
      required: true,
      minLength: 1,
      maxLength: 100,
      requiredMessage: 'Il cognome è obbligatorio'
    },
    staffEmail: {
      required: true,
      type: 'email',
      requiredMessage: 'L\'email è obbligatoria'
    }
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!this.currentUser) {
      this.showToast('Devi essere loggato per aggiungere staff.', { type: 'error' });
      return;
    }
    
    // Validazione form completa
    const validation = this.validateForm(form, {
      staffNome: { required: true, minLength: 1, maxLength: 100 },
      staffCognome: { required: true, minLength: 1, maxLength: 100 },
      staffEmail: { required: true, type: 'email' }
    });
    
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      this.showToast(firstError, { type: 'error' });
      // Focus sul primo campo con errore
      const firstErrorField = Object.keys(validation.errors)[0];
      const input = form.querySelector(`#${firstErrorField}`);
      if (input) input.focus();
      return;
    }
    
    const nome = this.qs('#staffNome').value.trim();
    const cognome = this.qs('#staffCognome').value.trim();
    const email = this.qs('#staffEmail').value.trim().toLowerCase();
    const ruolo = this.qs('#staffRuolo')?.value || 'CR';
    
    // Check duplicati email
    if (this.checkDuplicateStaffEmail(email)) {
      this.showToast('Un membro staff con questa email esiste già', { type: 'error' });
      this.qs('#staffEmail').focus();
      return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    this.setButtonLoading(submitBtn, true, originalText);
    try {
      await DATA.addStaff({ nome, cognome, email, ruolo }, this.currentUser);
      this.state = await DATA.loadAll();
      this.rebuildPresenceIndex();
      this.renderStaff();
      this.showToast('Staff aggiunto con successo');

      // Reset form
      form.reset();
      // Rimuovi classi validazione
      form.querySelectorAll('.valid, .invalid').forEach(el => {
        el.classList.remove('valid', 'invalid');
      });
      form.querySelectorAll('.has-error, .is-valid').forEach(el => {
        el.classList.remove('has-error', 'is-valid');
      });
      form.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
      });
    } catch (error) {
      console.error('Errore aggiunta staff:', error);
      this.showToast('Errore durante l\'aggiunta: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
    } finally {
      this.setButtonLoading(submitBtn, false, originalText);
    }
  });
};

UI.renderStaff = function() {
  const list = this.qs('#staffList');
  if (!list) return;

  const sortedStaff = [...(this.state.staff || [])].sort((a, b) =>
    a.nome.localeCompare(b.nome) || a.cognome.localeCompare(b.cognome)
  );

  this.renderInBatches({
    container: list,
    items: sortedStaff,
    batchSize: 200,
    onComplete: () => {
      // Setup swipe delete dopo il rendering
      if (this.currentUser && 'ontouchstart' in window) {
        this.setupSwipeDelete(list, (staffId) => {
          this.confirmDeleteStaff(staffId);
        }, '.swipeable-item', 'data-id');
      }
      
      // Setup long press per menu contestuale
      if ('ontouchstart' in window) {
        const items = list.querySelectorAll('.swipeable-item');
        items.forEach(item => {
          const staffId = item.getAttribute('data-id');
          const member = this.state.staff?.find(s => s.id === staffId);
          if (!member) return;
          
          this.setupLongPress(item, (element, e) => {
            const actions = [
              {
                label: `Copia nome`,
                icon: '📋',
                action: async () => {
                  const nome = `${member.nome} ${member.cognome}`.trim();
                  try {
                    await navigator.clipboard.writeText(nome);
                    this.showToast('Nome copiato', { type: 'success', duration: 1500 });
                  } catch (err) {
                    console.error('Errore copia:', err);
                  }
                }
              },
              {
                label: 'Copia email',
                icon: '📧',
                action: async () => {
                  if (member.email) {
                    try {
                      await navigator.clipboard.writeText(member.email);
                      this.showToast('Email copiata', { type: 'success', duration: 1500 });
                    } catch (err) {
                      console.error('Errore copia:', err);
                    }
                  }
                }
              }
            ];
            
            if (this.currentUser) {
              actions.push(
                {
                  label: 'Modifica',
                  icon: '✏️',
                  action: () => {
                    this.openEditStaffModal(staffId);
                  }
                },
                {
                  label: 'Elimina',
                  icon: '🗑️',
                  danger: true,
                  action: () => {
                    this.confirmDeleteStaff(staffId);
                  }
                }
              );
            }
            
            this.showContextMenu(element, actions);
          });
        });
      }
      
      // Setup pull-to-refresh
      if ('ontouchstart' in window) {
        const scrollContainer = list.closest('.bg-gray-50') || list.parentElement;
        if (scrollContainer) {
          this.setupPullToRefresh(scrollContainer, async () => {
            this.showLoadingOverlay('Aggiornamento dati...');
            try {
              this.state = await DATA.loadAll();
              this.rebuildPresenceIndex();
              this.renderStaff();
              this.showToast('Dati aggiornati', { type: 'success' });
            } catch (error) {
              console.error('Errore refresh:', error);
              this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
            } finally {
              this.hideLoadingOverlay();
            }
          });
        }
      }
    },
    renderItem: (member) => {
      const ruoloBadgeColor = {
        'CR':   'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'VCR':  'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'SiSR': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        'RiS':  'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        'Esploratore': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
      }[member.ruolo] || 'bg-gray-100 text-gray-600';
      const ruoloLabel = member.ruolo || '—';
      return `
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${member.id}" data-item-id="${member.id}">
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-medium text-gray-900">${member.nome} ${member.cognome}</h4>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${ruoloBadgeColor}">${ruoloLabel}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm text-gray-600">${member.email || ''}</span>
            ${member.email ? `
              <button 
                type="button" 
                class="btn-contact-action btn-contact-email !w-6 !h-6 !p-0 rounded text-xs shadow-none" 
                data-contact-action="email" 
                data-value="${member.email}" 
                title="Invia email a ${member.nome}"
                aria-label="Invia email"
              >
                <svg class="!w-3 !h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
              </button>` : ''}
          </div>
          <p class="text-xs text-gray-400 mt-0.5">ID: ${member.id}</p>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="UI.openEditStaffModal('${member.id}')" 
            class="p-2 text-gray-500 hover:text-green-600 rounded-full"
            ${this.currentUser ? '' : 'disabled'}
          >
            ✏️
          </button>
          <button 
            onclick="UI.confirmDeleteStaff('${member.id}')" 
            class="p-2 text-gray-500 hover:text-red-600 rounded-full"
            ${this.currentUser ? '' : 'disabled'}
          >
            🗑️
          </button>
        </div>
      </div>
    `;
    }
  });
};

UI.openEditStaffModal = function(id) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per modificare staff.', { type: 'error' });
    return;
  }

  const member = (this.state.staff || []).find(s => s.id === id);
  if (!member) return;

  this.qs('#editStaffId').value = member.id;
  this.qs('#editStaffNome').value = member.nome || '';
  this.qs('#editStaffCognome').value = member.cognome || '';
  this.qs('#editStaffEmail').value = member.email || '';
  const ruoloSel = this.qs('#editStaffRuolo');
  if (ruoloSel) ruoloSel.value = member.ruolo || 'CR';

  this.showModal('editStaffModal');
};

UI.confirmDeleteStaff = function(id) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per eliminare staff.', { type: 'error' });
    return;
  }

  const member = (this.state.staff || []).find(s => s.id === id);
  if (!member) return;

  this.staffToDeleteId = id;
  const span = this.qs('#staffNameToDelete');
  if (span) span.textContent = `${member.nome} ${member.cognome}`;
  this.showModal('confirmDeleteStaffModal');
};

// Inizializza la pagina staff
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pagina Staff caricata');
});

// ── Utenti Registrati & Richieste di Accesso (solo CR/VCR) ──────────────────

const ADMIN_ROLES_STAFF = ['CR', 'VCR'];

/**
 * Inizializza la sezione utenti registrati / richieste di accesso.
 * Visibile solo agli amministratori (CR/VCR). Mostra avviso per non admin.
 */
UI.initAccessRequestsSection = function() {
  const section = document.getElementById('accessRequestsSection');
  if (!section) return;

  // Determina se l'utente loggato è admin
  const userEmail = this.currentUser?.email?.toLowerCase();
  const staffMember = userEmail
    ? (this.state?.staff || []).find(s => s.email && s.email.toLowerCase() === userEmail)
    : null;
  const userRole = staffMember?.ruolo || (userEmail === 'demo@scoutmaori.it' ? 'CR' : '');
  const isAdmin = ADMIN_ROLES_STAFF.some(r => userRole.includes(r));

  const authNotice = document.getElementById('accessRequestsAuthNotice');
  const adminContent = document.getElementById('accessRequestsAdminContent');

  section.classList.remove('hidden');

  if (!isAdmin) {
    if (authNotice) authNotice.classList.remove('hidden');
    if (adminContent) adminContent.classList.add('hidden');
    return;
  }

  if (authNotice) authNotice.classList.add('hidden');
  if (adminContent) adminContent.classList.remove('hidden');
  this.loadAccessRequests();
};

UI.loadAccessRequests = async function() {
  const list = document.getElementById('accessRequestsList');
  const badge = document.getElementById('accessRequestsBadge');
  if (!list) return;

  list.innerHTML = '<p class="text-sm text-gray-500 italic py-2">Caricamento elenco utenti e richieste...</p>';
  try {
    const requests = await DATA.getAccessRequests();
    this._accessRequests = Array.isArray(requests) ? requests : [];

    // Aggiorna contatori filtri
    const pendingCount = this._accessRequests.filter(r => r.status === 'pending').length;
    const approvedCount = this._accessRequests.filter(r => r.status === 'approved').length;
    const rejectedCount = this._accessRequests.filter(r => r.status === 'rejected').length;

    const elAll = document.getElementById('countReqAll');
    const elPend = document.getElementById('countReqPending');
    const elApp = document.getElementById('countReqApproved');
    const elRej = document.getElementById('countReqRejected');
    if (elAll) elAll.textContent = `(${this._accessRequests.length})`;
    if (elPend) elPend.textContent = `(${pendingCount})`;
    if (elApp) elApp.textContent = `(${approvedCount})`;
    if (elRej) elRej.textContent = `(${rejectedCount})`;

    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = `${pendingCount} in attesa`;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    this.renderAccessRequests();
  } catch (err) {
    console.error('Errore caricamento richieste accesso:', err);
    list.innerHTML = '<p class="text-sm text-red-500">Errore nel caricamento delle richieste.</p>';
  }
};

UI.filterAccessRequests = function(filter) {
  this._accessRequestsFilter = filter;
  const buttons = document.querySelectorAll('.access-filter-btn');
  buttons.forEach(btn => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('bg-green-600', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('bg-white', !isActive);
    btn.classList.toggle('text-gray-700', !isActive);
  });
  this.renderAccessRequests();
};

UI.searchAccessRequests = function(term) {
  this._accessRequestsSearch = (term || '').trim().toLowerCase();
  this.renderAccessRequests();
};

UI.renderAccessRequests = function(requestsParam) {
  const list = document.getElementById('accessRequestsList');
  if (!list) return;

  const allRequests = requestsParam || this._accessRequests || [];
  const filter = this._accessRequestsFilter || 'all';
  const search = this._accessRequestsSearch || '';

  const filtered = allRequests.filter(req => {
    if (filter === 'pending' && req.status !== 'pending') return false;
    if (filter === 'approved' && req.status !== 'approved') return false;
    if (filter === 'rejected' && req.status !== 'rejected') return false;
    if (search) {
      const full = `${req.nome || ''} ${req.cognome || ''} ${req.email || ''}`.toLowerCase();
      if (!full.includes(search)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="bg-white p-6 rounded-lg text-center border border-gray-200 text-gray-500 text-sm">
      Nessun utente o richiesta trovata${filter !== 'all' ? ` con filtro "${filter}"` : ''}${search ? ` per "${search}"` : ''}.
    </div>`;
    return;
  }

  // Ordine: pending prima, poi approvati, poi rifiutati; per data decrescente
  const sorted = [...filtered].sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2 };
    const oa = order[a.status] ?? 1;
    const ob = order[b.status] ?? 1;
    if (oa !== ob) return oa - ob;
    const da = a.createdAt instanceof Date ? a.createdAt : (a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0));
    const db_ = b.createdAt instanceof Date ? b.createdAt : (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0));
    return db_ - da;
  });

  const statusConfig = {
    pending:  { label: 'In attesa di approvazione', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300', icon: '⏳' },
    approved: { label: 'Approvato / Registrato', badge: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300', icon: '✅' },
    rejected: { label: 'Rifiutato', badge: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300', icon: '❌' },
  };

  const roleBadgeStyle = {
    'CR': 'bg-green-100 text-green-800 border-green-200',
    'VCR': 'bg-blue-100 text-blue-800 border-blue-200',
    'SiSR': 'bg-amber-100 text-amber-800 border-amber-200',
    'RiS': 'bg-purple-100 text-purple-800 border-purple-200',
    'Esploratore': 'bg-teal-100 text-teal-800 border-teal-200'
  };

  list.innerHTML = sorted.map(req => {
    const cfg = statusConfig[req.status] || statusConfig.pending;
    const roleStyle = roleBadgeStyle[req.ruoloRichiesto] || 'bg-gray-100 text-gray-700 border-gray-200';
    const dateObj = req.createdAt instanceof Date ? req.createdAt : (req.createdAt?.toDate ? req.createdAt.toDate() : (req.createdAt ? new Date(req.createdAt) : null));
    const dateStr = dateObj ? dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    const actionsHtml = req.status === 'pending' ? `
      <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
        <button
          type="button"
          class="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          onclick="UI.approveAccessRequest('${req.id}')"
          aria-label="Approva richiesta di ${req.nome} ${req.cognome}"
        >
          <span>✅</span> Approva Ruolo
        </button>
        <button
          type="button"
          class="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
          onclick="UI.rejectAccessRequest('${req.id}')"
          aria-label="Rifiuta richiesta di ${req.nome} ${req.cognome}"
        >
          <span>❌</span> Rifiuta
        </button>
      </div>` : '';

    const metaHtml = req.status === 'approved'
      ? `<span class="text-xs text-gray-500 mt-1 block">Convalidato: ${req.approvedBy ? `da ${req.approvedBy}` : 'Accesso immediato automatico'}</span>`
      : (req.status === 'rejected'
          ? `<span class="text-xs text-red-600 mt-1 block font-medium">Rifiutato: ${req.rejectedBy ? `da ${req.rejectedBy}` : ''}${req.rejectReason ? ` — Motivo: "${req.rejectReason}"` : ''}</span>`
          : '');

    const initials = `${(req.nome || '?')[0]}${(req.cognome || '')[0] || ''}`.toUpperCase();

    return `
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-gray-200">
            ${initials}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-gray-900 text-base leading-tight">${req.nome} ${req.cognome}</h4>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}">${cfg.icon} ${cfg.label}</span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleStyle}">Ruolo: ${req.ruoloRichiesto || 'Esploratore'}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-sm text-gray-600">${req.email || ''}</span>
              ${req.email ? `
                <button 
                  type="button" 
                  class="btn-contact-action btn-contact-email !w-5 !h-5 !p-0 rounded text-xs shadow-none" 
                  data-contact-action="email" 
                  data-value="${req.email}" 
                  title="Invia email a ${req.nome}"
                  aria-label="Invia email"
                >
                  <svg class="!w-3 !h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
                </button>` : ''}
            </div>
            <div class="text-xs text-gray-400 mt-1">Registrato il: ${dateStr}</div>
            ${metaHtml}
          </div>
        </div>
      </div>
      ${actionsHtml}
    </div>`;
  }).join('');
};

UI.approveAccessRequest = async function(requestId) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato come Admin.', { type: 'error' });
    return;
  }
  const req = (this._accessRequests || []).find(r => r.id === requestId);
  const name = req ? `${req.nome} ${req.cognome}` : 'l\'utente';
  this.showConfirmModal({
    title: 'Approva Richiesta di Accesso',
    message: `Confermi l'approvazione per ${name} con ruolo "${req?.ruoloRichiesto || 'CR'}"? Verrà aggiunto allo Staff con i relativi permessi.`,
    confirmText: 'Approva e Abilita',
    onConfirm: async () => {
      try {
        await DATA.approveAccessRequest(requestId, this.currentUser);
        this.state = await DATA.loadAll();
        this.renderStaff();
        await this.loadAccessRequests();
        this.showToast(`Richiesta di ${name} approvata! Membro staff aggiunto.`, { type: 'success', duration: 4000 });
      } catch (err) {
        console.error('Errore approvazione:', err);
        this.showToast('Errore durante l\'approvazione: ' + (err.message || ''), { type: 'error' });
      }
    }
  });
};

UI.rejectAccessRequest = async function(requestId) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato come Admin.', { type: 'error' });
    return;
  }
  const req = (this._accessRequests || []).find(r => r.id === requestId);
  const name = req ? `${req.nome} ${req.cognome}` : 'l\'utente';
  const reason = window.prompt(`Motivo del rifiuto per la richiesta di ${name} (opzionale):`);
  if (reason === null) return; // annullato
  try {
    await DATA.rejectAccessRequest(requestId, reason || '', this.currentUser);
    await this.loadAccessRequests();
    this.showToast(`Richiesta di ${name} rifiutata.`, { type: 'info', duration: 3000 });
  } catch (err) {
    console.error('Errore rifiuto:', err);
    this.showToast('Errore durante il rifiuto: ' + (err.message || ''), { type: 'error' });
  }
};

// Se lo stato è già caricato al momento dell'importazione di staff.js, renderizza
if (typeof window !== 'undefined' && window.UI && UI.state && UI.state.staff) {
  UI.renderCurrentPage();
}





