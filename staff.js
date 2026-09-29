// staff.js - Logica specifica per la pagina Staff

// Sovrascrive la funzione renderCurrentPage
UI.renderCurrentPage = function() {
  this.renderStaff();
  this.setupStaffEventListeners();
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
      await DATA.addStaff({ nome, cognome, email }, this.currentUser);
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
    renderItem: (member) => `
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${member.id}" data-item-id="${member.id}">
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">${member.nome} ${member.cognome}</h4>
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
    `
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




