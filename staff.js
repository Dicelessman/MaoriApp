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
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.currentUser) {
        this.showToast('Devi essere loggato per aggiungere staff.', { type: 'error' });
        return;
      }
      
      // Validazione input
      const nome = this.qs('#staffNome').value.trim();
      const cognome = this.qs('#staffCognome').value.trim();
      const email = this.qs('#staffEmail').value.trim();
      
      // Validazione base (può essere estesa con validation.js quando disponibile)
      const isValidEmail = (email) => {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      };
      
      if (!nome || nome.length === 0) {
        this.showToast('Il nome è obbligatorio', { type: 'error' });
        this.qs('#staffNome').focus();
        return;
      }
      if (!cognome || cognome.length === 0) {
        this.showToast('Il cognome è obbligatorio', { type: 'error' });
        this.qs('#staffCognome').focus();
        return;
      }
      if (!email || !isValidEmail(email)) {
        this.showToast('Email non valida', { type: 'error' });
        this.qs('#staffEmail').focus();
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      this.setButtonLoading(submitBtn, true, originalText);
      try {
        await DATA.addStaff({ nome, cognome, email: email.toLowerCase() }, this.currentUser);
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderStaff();
        this.showToast('Staff aggiunto con successo');

        // Reset form
        form.reset();
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
    renderItem: (member) => `
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
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




