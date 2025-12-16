// calendario.js - Logica specifica per la pagina Calendario

UI.renderCurrentPage = function() {
  // Verifica vista corrente (mese o lista)
  const viewMode = localStorage.getItem('calendarViewMode') || 'list';
  if (viewMode === 'month') {
    this.renderMonthlyCalendar();
  } else {
    this.renderCalendarList();
  }
  this.setupCalendarEvents();
  this.setupCalendarViewToggle();
};

UI.initActivityTemplatesUI = async function() {
  const select = this.qs('#activityTemplateSelect');
  const applyBtn = this.qs('#applyActivityTemplateBtn');
  const saveBtn = this.qs('#saveActivityTemplateBtn');
  const tipoInput = this.qs('#activityTipo');
  const descrInput = this.qs('#activityDescrizione');
  const costoInput = this.qs('#activityCosto');

  if (!select || !applyBtn || !saveBtn || !tipoInput || !descrInput || !costoInput) return;
  if (!this.currentUser) return;

  // Carica template e popola select
  const templates = await this.loadActivityTemplates();
  select.innerHTML = '<option value=\"\">Nessun template</option>' + 
    templates.map(t => `<option value=\"${t.id}\">${this.escapeHtml(t.name)}</option>`).join('');

  // Applica template selezionato
  applyBtn.addEventListener('click', () => {
    const id = select.value;
    if (!id) {
      this.showToast('Seleziona un template prima di applicare.', { type: 'info' });
      return;
    }
    const tmpl = (this._activityTemplates || []).find(t => t.id === id);
    if (!tmpl) {
      this.showToast('Template non trovato.', { type: 'error' });
      return;
    }
    tipoInput.value = tmpl.tipo || 'Riunione';
    descrInput.value = tmpl.descrizione || '';
    costoInput.value = tmpl.costo != null ? String(tmpl.costo) : '';
    this.showToast('Template applicato.', { type: 'success', duration: 1500 });
  });

  // Salva template dai valori correnti del form
  saveBtn.addEventListener('click', async () => {
    if (!this.currentUser) {
      this.showToast('Devi essere loggato per salvare un template.', { type: 'error' });
      return;
    }
    const tipo = tipoInput.value;
    const descrizione = descrInput.value.trim();
    const costo = costoInput.value ? Number(costoInput.value) : 0;

    if (!descrizione) {
      this.showToast('Inserisci una descrizione per salvare un template.', { type: 'error' });
      descrInput.focus();
      return;
    }

    await this.saveActivityTemplate({ tipo, descrizione, costo });
    // Ricarica select
    const templatesUpdated = this._activityTemplates || await this.loadActivityTemplates();
    select.innerHTML = '<option value=\"\">Nessun template</option>' + 
      templatesUpdated.map(t => `<option value=\"${t.id}\">${this.escapeHtml(t.name)}</option>`).join('');
  });
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
    
    // Inizializza UI template attività (solo se utente loggato)
    if (this.currentUser) {
      this.initActivityTemplatesUI();
    }

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
      const costoValue = this.qs('#activityCosto').value || '0';
      const costo = costoValue ? Number(costoValue) : 0;
      
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
    const canDrag = this.currentUser ? '' : 'data-drag-disabled';
    list.insertAdjacentHTML('beforeend', `
      <div class="p-4 ${bgClass} rounded-lg shadow-sm flex items-start justify-between gap-4 swipeable-item drag-item" data-id="${a.id}" data-item-id="${a.id}" ${canDrag}>
        <div class="flex items-center gap-2 flex-1">
          ${this.currentUser ? '<span class="drag-handle text-gray-400 cursor-grab select-none text-xl" draggable="true">☰</span>' : ''}
          <div class="flex-1">
            <p class="font-medium text-lg ${textClass}">${a.tipo} — ${ds}${isNext ? ' (Prossima)' : ''}</p>
            <p class="text-gray-700">${a.descrizione}${costoLabel}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <a href="attivita.html?id=${a.id}" aria-label="Apri dettaglio attività" class="p-2 text-gray-500 hover:text-blue-600 rounded-full" title="Apri dettaglio attività">📄</a>
          <button aria-label="Modifica attività" class="p-2 text-gray-500 hover:text-green-600 rounded-full" onclick="UI.openEditActivityModal('${a.id}')" ${UI.currentUser ? '' : 'disabled'}>✏️</button>
          <button aria-label="Elimina attività" class="p-2 text-gray-500 hover:text-red-600 rounded-full" onclick="UI.confirmDeleteActivity('${a.id}')" ${UI.currentUser ? '' : 'disabled'}>🗑️</button>
        </div>
      </div>
    `);
  });
  
  // Setup drag & drop per riordinare attività (solo se utente loggato)
  if (this.currentUser) {
    const preferences = this.loadUserPreferences();
    const savedOrder = preferences?.activityOrder || null;
    
    // Se c'è un ordine salvato, riordina le attività
    if (savedOrder && savedOrder.length === activities.length) {
      const orderMap = new Map(savedOrder.map((id, idx) => [id, idx]));
      const items = Array.from(list.querySelectorAll('.drag-item'));
      items.sort((a, b) => {
        const idA = a.getAttribute('data-id');
        const idB = b.getAttribute('data-id');
        const orderA = orderMap.get(idA) ?? 999;
        const orderB = orderMap.get(idB) ?? 999;
        return orderA - orderB;
      });
      items.forEach(item => list.appendChild(item));
    }
    
    this.setupDragAndDrop(
      list,
      '.drag-item',
      async (newOrder) => {
        // Salva nuovo ordine nelle preferenze
        const prefs = this.loadUserPreferences();
        prefs.activityOrder = newOrder;
        await this.saveUserPreferences(prefs);
        this.showToast('Ordine attività salvato', { type: 'success', duration: 2000 });
      },
      {
        handle: '.drag-handle',
        disabled: '[data-drag-disabled]'
      }
    );
  }
  
  // Setup swipe delete e pull-to-refresh per calendario
  if ('ontouchstart' in window) {
    if (this.currentUser) {
      this.setupSwipeDelete(list, (activityId) => {
        this.confirmDeleteActivity(activityId);
      }, '.swipeable-item', 'data-id');
    }
    
    // Setup long press per menu contestuale attività
    const items = list.querySelectorAll('.swipeable-item');
    items.forEach(item => {
      const activityId = item.getAttribute('data-id');
      const activity = this.state.activities?.find(a => a.id === activityId);
      if (!activity) return;
      
      this.setupLongPress(item, (element, e) => {
        const actions = [
          {
            label: `Apri dettagli attività`,
            icon: '📄',
            action: () => {
              window.location.href = `attivita.html?id=${activityId}`;
            }
          },
          {
            label: 'Copia descrizione',
            icon: '📋',
            action: async () => {
              const text = `${activity.tipo} — ${activity.descrizione}`;
              try {
                await navigator.clipboard.writeText(text);
                this.showToast('Copiato', { type: 'success', duration: 1500 });
              } catch (err) {
                console.error('Errore copia:', err);
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
                this.openEditActivityModal(activityId);
              }
            },
            {
              label: 'Elimina',
              icon: '🗑️',
              danger: true,
              action: () => {
                this.confirmDeleteActivity(activityId);
              }
            }
          );
        }
        
        this.showContextMenu(element, actions);
      });
    });
    
    const scrollContainer = list.parentElement;
    if (scrollContainer) {
      this.setupPullToRefresh(scrollContainer, async () => {
        this.showLoadingOverlay('Aggiornamento calendario...');
        try {
          this.state = await DATA.loadAll();
          this.rebuildPresenceIndex();
          this.renderCalendarList();
          this.showToast('Calendario aggiornato', { type: 'success' });
        } catch (error) {
          console.error('Errore refresh:', error);
          this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
        } finally {
          this.hideLoadingOverlay();
        }
      });
    }
  }
};

// ============== Vista Calendario Mensile ==============

/**
 * Setup toggle vista calendario/lista
 */
UI.setupCalendarViewToggle = function() {
  const toggle = this.qs('#calendarViewToggle');
  const toggleText = this.qs('#calendarViewToggleText');
  const monthlyView = this.qs('#monthlyCalendarView');
  const listView = this.qs('#listCalendarView');
  
  if (!toggle || !toggleText || !monthlyView || !listView) {
    console.warn('Elementi per toggle vista calendario non trovati', {
      toggle: !!toggle,
      toggleText: !!toggleText,
      monthlyView: !!monthlyView,
      listView: !!listView
    });
    return;
  }
  
  // Evita di aggiungere l'event listener più volte
  if (toggle._bound) {
    console.log('Toggle già configurato, skip');
    return;
  }
  toggle._bound = true;
  
  // Salva riferimento a this per uso nel callback
  const self = this;
  
  // Carica vista salvata
  const viewMode = localStorage.getItem('calendarViewMode') || 'list';
  if (viewMode === 'month') {
    monthlyView.classList.remove('hidden');
    listView.classList.add('hidden');
    toggleText.textContent = '📋 Vista Lista';
  } else {
    monthlyView.classList.add('hidden');
    listView.classList.remove('hidden');
    toggleText.textContent = '📅 Vista Calendario';
  }
  
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle click rilevato');
    
    const currentMode = monthlyView.classList.contains('hidden') ? 'list' : 'month';
    const newMode = currentMode === 'list' ? 'month' : 'list';
    
    console.log('Cambio vista da', currentMode, 'a', newMode);
    localStorage.setItem('calendarViewMode', newMode);
    
    if (newMode === 'month') {
      monthlyView.classList.remove('hidden');
      listView.classList.add('hidden');
      toggleText.textContent = '📋 Vista Lista';
      self.renderMonthlyCalendar();
    } else {
      monthlyView.classList.add('hidden');
      listView.classList.remove('hidden');
      toggleText.textContent = '📅 Vista Calendario';
      self.renderCalendarList();
    }
  });
  
  console.log('Event listener toggle configurato');
};

/**
 * Renderizza calendario mensile
 */
UI.renderMonthlyCalendar = function() {
  const grid = this.qs('#calendarGrid');
  const monthYearEl = this.qs('#currentMonthYear');
  const prevBtn = this.qs('#prevMonthBtn');
  const nextBtn = this.qs('#nextMonthBtn');
  
  if (!grid || !monthYearEl) return;
  
  // Carica mese corrente o salvato
  let currentMonth;
  const savedMonthKey = localStorage.getItem('calendarCurrentMonth');
  if (savedMonthKey) {
    // Prova a parse come formato "YYYY-MM" oppure come ISO string
    if (/^\d{4}-\d{2}$/.test(savedMonthKey)) {
      // Formato YYYY-MM (anno-mese)
      const [year, month] = savedMonthKey.split('-').map(Number);
      currentMonth = new Date(year, month - 1, 1); // month è 1-based, quindi sottraiamo 1
    } else {
      // Formato ISO string legacy - convertiamo a YYYY-MM per evitare problemi di fuso orario
      const savedDate = new Date(savedMonthKey);
      if (!isNaN(savedDate.getTime())) {
        currentMonth = new Date(savedDate.getFullYear(), savedDate.getMonth(), 1);
      } else {
        currentMonth = new Date();
        currentMonth.setDate(1);
      }
    }
  } else {
    currentMonth = new Date();
    currentMonth.setDate(1);
  }
  currentMonth.setHours(0, 0, 0, 0);
  this._calendarCurrentMonth = currentMonth;
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Aggiorna header
  monthYearEl.textContent = currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  
  // Navigazione mesi
  if (prevBtn && !prevBtn._bound) {
    prevBtn._bound = true;
    prevBtn.addEventListener('click', () => {
      const newMonth = new Date(this._calendarCurrentMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      newMonth.setDate(1);
      newMonth.setHours(0, 0, 0, 0);
      this._calendarCurrentMonth = newMonth;
      // Salva come formato YYYY-MM per evitare problemi di fuso orario
      const year = newMonth.getFullYear();
      const month = String(newMonth.getMonth() + 1).padStart(2, '0');
      localStorage.setItem('calendarCurrentMonth', `${year}-${month}`);
      this.renderMonthlyCalendar();
    });
  }
  
  if (nextBtn && !nextBtn._bound) {
    nextBtn._bound = true;
    nextBtn.addEventListener('click', () => {
      const newMonth = new Date(this._calendarCurrentMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      newMonth.setDate(1);
      newMonth.setHours(0, 0, 0, 0);
      this._calendarCurrentMonth = newMonth;
      // Salva come formato YYYY-MM per evitare problemi di fuso orario
      const year = newMonth.getFullYear();
      const month = String(newMonth.getMonth() + 1).padStart(2, '0');
      localStorage.setItem('calendarCurrentMonth', `${year}-${month}`);
      this.renderMonthlyCalendar();
    });
  }
  
  // Calcola primo giorno del mese e giorno della settimana
  // Usiamo currentMonth direttamente per evitare problemi con la conversione
  const firstDay = new Date(year, month, 1);
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // getDay() restituisce 0=domenica, 1=lunedì, ..., 6=sabato
  // Convertiamo in scala settimana lavorativa italiana: 0=lunedì, 1=martedì, ..., 6=domenica
  // Formula: (getDay() + 6) % 7 trasforma 0->6, 1->0, 2->1, ..., 6->5
  const jsDayOfWeek = firstDay.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
  const startingDayOfWeek = (jsDayOfWeek + 6) % 7; // 0=Lun, 1=Mar, ..., 6=Dom
  
  // Rimuovi celle giorni esistenti (mantieni headers)
  const existingCells = grid.querySelectorAll('.calendar-day-cell');
  existingCells.forEach(cell => cell.remove());
  
  // Aggiungi celle vuote per giorni prima del primo giorno del mese
  for (let i = 0; i < startingDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'p-2 min-h-[80px] bg-gray-50 dark:bg-gray-800';
    grid.appendChild(emptyCell);
  }
  
  // Colori per tipo attività (con supporto dark mode)
  const activityTypeColors = {
    'Riunione': 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200',
    'Attività lunga': 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200',
    'Uscita': 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200',
    'Campo': 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200'
  };
  
  // Raggruppa attività per giorno
  const activities = (this.state.activities || []).slice();
  const activitiesByDate = new Map();
  
  activities.forEach(a => {
    const d = this.toJsDate(a.data);
    if (isNaN(d)) return;
    const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
    if (!activitiesByDate.has(dateKey)) {
      activitiesByDate.set(dateKey, []);
    }
    activitiesByDate.get(dateKey).push(a);
  });
  
  // Aggiungi celle per ogni giorno del mese
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const dateKey = cellDate.toISOString().split('T')[0];
    const dayActivities = activitiesByDate.get(dateKey) || [];
    const isToday = cellDate.getTime() === today.getTime();
    const isPast = cellDate < today;
    
    const cell = document.createElement('div');
    cell.className = `calendar-day-cell p-2 min-h-[80px] border border-gray-200 dark:border-gray-700 ${isToday ? 'bg-green-50 dark:bg-green-900 border-green-400 dark:border-green-600' : isPast ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'} ${!isPast ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}`;
    
    // Numero giorno
    const dayNumber = document.createElement('div');
    dayNumber.className = `text-sm font-semibold mb-1 ${isToday ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`;
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);
    
    // Attività del giorno (max 3 visibili)
    if (dayActivities.length > 0) {
      const activitiesList = document.createElement('div');
      activitiesList.className = 'space-y-1';
      
      dayActivities.slice(0, 3).forEach(activity => {
        const activityEl = document.createElement('div');
        activityEl.className = `text-xs p-1 rounded border ${activityTypeColors[activity.tipo] || 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'} truncate`;
        activityEl.textContent = activity.tipo;
        activityEl.title = `${activity.tipo}: ${activity.descrizione}`;
        activityEl.addEventListener('click', (e) => {
          e.stopPropagation();
          window.location.href = `attivita.html?id=${activity.id}`;
        });
        activitiesList.appendChild(activityEl);
      });
      
      if (dayActivities.length > 3) {
        const moreEl = document.createElement('div');
        moreEl.className = 'text-xs text-gray-500 dark:text-gray-400 italic';
        moreEl.textContent = `+${dayActivities.length - 3} altre`;
        activitiesList.appendChild(moreEl);
      }
      
      cell.appendChild(activitiesList);
    }
    
    // Click su cella per aggiungere attività (solo per giorni futuri o oggi)
    if (!isPast) {
      cell.addEventListener('click', () => {
        // Imposta data nel form e mostra form
        const dateInput = this.qs('#activityData');
        if (dateInput) {
          dateInput.value = dateKey;
          // Scrolla al form
          const formSection = dateInput.closest('section');
          if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            dateInput.focus();
          }
        }
      });
    }
    
    grid.appendChild(cell);
  }
  
  // Aggiungi celle vuote per completare la griglia (ultima riga)
  const totalCells = startingDayOfWeek + daysInMonth;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'p-2 min-h-[80px] bg-gray-50 dark:bg-gray-800';
      grid.appendChild(emptyCell);
    }
  }
};

