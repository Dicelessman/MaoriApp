// calendario.js - Logica specifica per la pagina Calendario

UI.renderCurrentPage = function() {
  this.renderCalendarList();
  this.setupCalendarEvents();
};

UI.setupCalendarEvents = function() {
  const form = this.qs('#addActivityForm');
  if (form && !form._bound) {
    form._bound = true;
    
    // Setup validazione real-time
    const validActivityTypes = ['Riunione', 'Attività lunga', 'Uscita', 'Campo'];
    this.setupFormValidation(form, {
      activityTipo: {
        required: true,
        validator: (value) => validActivityTypes.includes(value) || 'Tipo attività non valido',
        requiredMessage: 'Seleziona un tipo attività'
      },
      activityData: {
        required: true,
        validator: (value) => {
          if (!value) return 'La data è obbligatoria';
          const date = new Date(value);
          if (isNaN(date.getTime())) return 'Data non valida';
          return true;
        },
        requiredMessage: 'La data è obbligatoria'
      },
      activityDescrizione: {
        required: true,
        minLength: 1,
        maxLength: 500,
        requiredMessage: 'La descrizione è obbligatoria'
      },
      activityCosto: {
        required: false,
        validator: (value) => {
          if (!value || value.trim() === '') return true; // Opzionale
          const num = Number(value);
          if (isNaN(num) || num < 0) return 'Il costo deve essere un numero positivo';
          return true;
        }
      }
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.currentUser) { 
        this.showToast('Devi essere loggato per aggiungere attività.', { type: 'error' }); 
        return; 
      }
      
      // Validazione form completa
      const validation = this.validateForm(form, {
        activityTipo: {
          required: true,
          validator: (value) => validActivityTypes.includes(value) || 'Tipo attività non valido'
        },
        activityData: {
          required: true,
          validator: (value) => {
            if (!value) return 'La data è obbligatoria';
            const date = new Date(value);
            return isNaN(date.getTime()) ? 'Data non valida' : true;
          }
        },
        activityDescrizione: { required: true, minLength: 1, maxLength: 500 },
        activityCosto: {
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
        const input = form.querySelector(`#${firstErrorField}`);
        if (input) input.focus();
        return;
      }
      
      const tipo = this.qs('#activityTipo').value;
      const dataValue = this.qs('#activityData').value;
      const data = new Date(dataValue);
      const descrizione = this.qs('#activityDescrizione').value.trim();
      const costo = this.qs('#activityCosto').value || '0';
      
      // Validazione range date
      const dateValidation = this.validateActivityDateRange(data);
      if (!dateValidation.valid) {
        this.showToast(dateValidation.warning, { type: 'error' });
        this.qs('#activityData').focus();
        return;
      }
      if (dateValidation.warning) {
        // Warning non blocca, ma informa
        this.showToast(dateValidation.warning, { type: 'warning', duration: 3000 });
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      this.setButtonLoading(submitBtn, true, originalText);
      try {
        await DATA.addActivity({ tipo, data, descrizione, costo }, this.currentUser);
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderCalendarList();
        form.reset();
        this.showToast('Attività aggiunta con successo');
        
        // Reset classi validazione
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
        console.error('Errore aggiunta attività:', error);
        this.showToast('Errore durante l\'aggiunta: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
      } finally {
        this.setButtonLoading(submitBtn, false, originalText);
      }
    });
  }
};

UI.renderCalendarList = function() {
  const list = this.qs('#calendarList');
  if (!list) return;
  list.innerHTML = '';

  const activities = (this.state.activities || []).slice().sort((a, b) => this.toJsDate(a.data) - this.toJsDate(b.data));
  if (!activities.length) {
    list.innerHTML = '<p class="text-gray-500">Nessuna attività pianificata.</p>';
    return;
  }

  const today = new Date(); today.setHours(0,0,0,0);
  let nextActivityId = null;
  for (const a of activities) {
    const d = this.toJsDate(a.data); const dd = new Date(d); dd.setHours(0,0,0,0);
    if (dd >= today) { nextActivityId = a.id; break; }
  }

  activities.forEach(a => {
    const d = this.toJsDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const isNext = a.id === nextActivityId;
    const costoLabel = parseFloat(a.costo || '0') > 0 ? ` — Costo: € ${a.costo}` : '';
    const bgClass = isNext ? 'bg-green-50 border-l-4 border-green-500' : 'bg-white';
    const textClass = isNext ? 'text-green-800' : 'text-green-700';
    list.insertAdjacentHTML('beforeend', `
      <div class="p-4 ${bgClass} rounded-lg shadow-sm flex items-start justify-between gap-4">
        <div>
          <p class="font-medium text-lg ${textClass}">${a.tipo} — ${ds}${isNext ? ' (Prossima)' : ''}</p>
          <p class="text-gray-700">${a.descrizione}${costoLabel}</p>
        </div>
        <div class="flex gap-2">
          <button aria-label="Modifica attività" class="p-2 text-gray-500 hover:text-green-600 rounded-full" onclick="UI.openEditActivityModal('${a.id}')" ${UI.currentUser ? '' : 'disabled'}>✏️</button>
          <button aria-label="Elimina attività" class="p-2 text-gray-500 hover:text-red-600 rounded-full" onclick="UI.confirmDeleteActivity('${a.id}')" ${UI.currentUser ? '' : 'disabled'}>🗑️</button>
        </div>
      </div>
    `);
  });
};



