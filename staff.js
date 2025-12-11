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
          <p class="text-sm text-gray-600">${member.email || ''}</p>
          <p class="text-sm text-gray-600">ID: ${member.id}</p>
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




