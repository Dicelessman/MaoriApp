// calendario.js - Logica specifica per la pagina Calendario

UI.renderCurrentPage = function () {
  this.renderCalendarList();
  this.setupCalendarEvents();
  // removed setupCalendarViewToggle
  this.setupCalendarExport();
};

UI.getActivityTypeColor = function (type) {
  switch (type) {
    case 'Evento Adulti':
      return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-100', border: 'border-purple-500', headerBg: 'bg-purple-800', headerText: 'bg-purple-900' };
    case 'Riunione Adulti':
      return { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-500', headerBg: 'bg-slate-800', headerText: 'bg-slate-900' };
    case 'Eventi con esterni':
      return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-800 dark:text-amber-100', border: 'border-amber-500', headerBg: 'bg-amber-800', headerText: 'bg-amber-900' };
    case 'Uscita':
      return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-100', border: 'border-blue-500', headerBg: 'bg-blue-800', headerText: 'bg-blue-900' };
    case 'Campo':
      return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-100', border: 'border-red-500', headerBg: 'bg-red-800', headerText: 'bg-red-900' };
    default: // Riunione, Attività lunga, etc.
      return { bg: 'bg-white dark:bg-gray-800', text: 'text-green-700 dark:text-gray-300', border: 'border-green-500', headerBg: 'bg-green-800', headerText: 'bg-green-900' };
  }
};

UI.initActivityTemplatesUI = async function () {
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

UI.setupCalendarEvents = function () {
  const form = this.qs('#addActivityForm');

  // Helper per mostrare/nascondere Data Fine
  const toggleEndDate = (startEl, endEl, typeEl) => {
    if (!startEl || !endEl || !typeEl) return;
    // Data Fine sempre visibile e opzionale
    const container = endEl.parentElement;
    if (container) {
      container.style.display = 'block';
      container.classList.remove('hidden');
    } else {
      endEl.style.display = 'block';
      endEl.classList.remove('hidden');
    }
  };

  if (form && !form._bound) {
    form._bound = true;

    const typeInput = this.qs('#activityTipo');
    const dataInput = this.qs('#activityData');

    // Create End Date input dynamically if not exists or select if exists
    // Simplest way is adding it in HTML, but here we assume we can inject or it matches existing HTML structure.
    // Let's inject it after Start Date if not present in HTML, but user asked to "add a feature", likely expects changes to code.
    // We'll rely on existing HTML having #activityDataFine or we insert it.
    // NOTE: HTML is not fully visible, assuming standard form structure. 
    // SAFEST: check if exists, otherwise assume user needs to add it manually or I add it via innerHTML if I had access to HTML file, 
    // but I am editing JS. I will check via querySelector.

    // Add event listener for type change
    if (typeInput) {
      typeInput.addEventListener('change', () => {
        toggleEndDate(dataInput, this.qs('#activityDataFine'), typeInput);
      });
      // Initial definition may need to wait for HTML update?
      // Let's assume HTML file has 'activityDataFine' OR we add it later in HTML task.
      // I will assume I need to handle it gracefully here.
    }

    // Setup validazione real-time
    const validActivityTypes = ['Riunione', 'Attività lunga', 'Uscita', 'Campo', 'Evento Adulti', 'Riunione Adulti', 'Eventi con esterni'];

    const validationRules = {
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
    };

    // Add validation for Data Fine? Only if visible/required.
    // Dynamic validation is tricky with this setup, usually done in submit.

    this.setupFormValidation(form, validationRules);

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
      const validation = this.validateForm(form, validationRules); // Using same rules object

      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        this.showToast(firstError, { type: 'error' });
        const firstErrorField = Object.keys(validation.errors)[0];
        const input = form.querySelector(`#${firstErrorField}`);
        if (input) input.focus();
        return;
      }

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
      const dataFineValue = this.qs('#activityDataFine')?.value || null;
      const dataFine = dataFineValue ? new Date(dataFineValue) : null;
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

      if (dataFine && dataFine < data) {
        this.showToast('La data di fine non può essere precedente alla data di inizio', { type: 'error' });
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
        await DATA.addActivity({ tipo, data, dataFine, descrizione, costo }, this.currentUser);
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderCalendarList();
        form.reset();
        // Reset manuale data fine se necessario
        const df = this.qs('#activityDataFine');
        if (df) { df.value = ''; df.parentElement.style.display = 'none'; }

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

  // Edit Activity Form
  const editForm = this.qs('#editActivityForm');

  const toggleEditEndDate = (startEl, endEl, typeEl) => {
    if (!startEl || !endEl || !typeEl) return;
    // Data Fine sempre visibile e opzionale
    const container = endEl.parentElement;
    if (container) {
      container.style.display = 'block';
      container.classList.remove('hidden');
    } else {
      endEl.style.display = 'block';
      endEl.classList.remove('hidden');
    }
  };

  if (editForm && !editForm._bound) {
    editForm._bound = true;

    const typeInput = this.qs('#editActivityTipo');
    const dataInput = this.qs('#editActivityData');
    const dataFineInput = this.qs('#editActivityDataFine');

    // Attach listener if elements exist
    if (typeInput && dataFineInput) {
      typeInput.addEventListener('change', () => {
        toggleEditEndDate(dataInput, dataFineInput, typeInput);
      });
    }

    // Use same validation logic as add form if possible, or simple check
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.currentUser) return;

      const id = this.qs('#editActivityId').value;
      const tipo = this.qs('#editActivityTipo').value;
      const dataValue = this.qs('#editActivityData').value;
      const data = new Date(dataValue);
      const dataFineValue = this.qs('#editActivityDataFine')?.value || null;
      const dataFine = dataFineValue ? new Date(dataFineValue) : null;
      const descrizione = this.qs('#editActivityDescrizione').value.trim();
      const costoValue = this.qs('#editActivityCosto').value;
      const costo = costoValue ? Number(costoValue) : 0;

      // Basic validation
      if (!id || !tipo || !descrizione || isNaN(data.getTime())) {
        this.showToast('Compila tutti i campi obbligatori', { type: 'error' });
        return;
      }

      if (dataFine && dataFine < data) {
        this.showToast('La data di fine non può essere precedente alla data di inizio', { type: 'error' });
        return;
      }

      const submitBtn = editForm.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      this.setButtonLoading(submitBtn, true, originalText);

      try {
        await DATA.updateActivity({ id, tipo, data, dataFine, descrizione, costo }, this.currentUser);
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderCalendarList();
        this.closeModal('editActivityModal');
        this.showToast('Attività modificata');
      } catch (error) {
        console.error('Errore modifica attività:', error);
        this.showToast('Errore durante la modifica: ' + error.message, { type: 'error' });
      } finally {
        this.setButtonLoading(submitBtn, false, originalText);
      }
    });
  }

  // Delete Activity Confirmation
  const confirmDeleteBtn = this.qs('#confirmDeleteActivityBtn');
  if (confirmDeleteBtn && !confirmDeleteBtn._bound) {
    confirmDeleteBtn._bound = true;
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!this.activityToDeleteId || !this.currentUser) return;

      const originalText = confirmDeleteBtn.textContent;
      this.setButtonLoading(confirmDeleteBtn, true, originalText);

      try {
        await DATA.deleteActivity(this.activityToDeleteId, this.currentUser);
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderCalendarList();
        this.closeModal('confirmDeleteActivityModal');
        this.showToast('Attività eliminata');
      } catch (error) {
        console.error('Errore eliminazione attività:', error);
        this.showToast('Errore eliminazione: ' + error.message, { type: 'error' });
      } finally {
        this.setButtonLoading(confirmDeleteBtn, false, originalText);
        this.activityToDeleteId = null;
      }
    });
  }
};

UI.renderCalendarList = function () {
  const list = this.qs('#calendarList');
  if (!list) return;
  list.innerHTML = '';

  const activities = (this.state.activities || []).slice().sort((a, b) => this.toJsDate(a.data) - this.toJsDate(b.data));
  if (!activities.length) {
    list.innerHTML = '<p class="text-gray-500">Nessuna attività pianificata.</p>';
    return;
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let nextActivityId = null;
  for (const a of activities) {
    const d = this.toJsDate(a.data); const dd = new Date(d); dd.setHours(0, 0, 0, 0);
    // Anche se oggi è "in corso" (es. campo iniziato ieri), lo consideriamo next se finisce >= oggi? 
    // Per ora logica semplice: start >= today.
    // Miglioriamento per multi-day: se start <= today <= end, è "in corso".
    const dEnd = a.dataFine ? this.toJsDate(a.dataFine) : dd;
    if (dEnd >= today) { nextActivityId = a.id; break; }
  }

  activities.forEach(a => {
    const d = this.toJsDate(a.data);
    const dateStr = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
    let fullDateStr = dateStr;

    // Gestione Data Fine (Range)
    if (a.dataFine) {
      const dFine = this.toJsDate(a.dataFine);
      if (!isNaN(dFine)) {
        const dateFineStr = dFine.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
        fullDateStr = `${dateStr} — ${dateFineStr}`;
      }
    }

    const isNext = a.id === nextActivityId;
    const costoLabel = parseFloat(a.costo || '0') > 0 ? ` — Costo: € ${a.costo}` : '';

    // Get colors
    const colors = this.getActivityTypeColor(a.tipo);
    const bgClass = isNext ?
      `bg-white dark:bg-gray-800 border-l-4 ${colors.border} shadow-md` : // Highlight next differently? Or override bg?
      // Let's use the colored bg for all, but maybe highlight "Next" with a border or shadow
      // The user asked for "different background color for each activity type".
      (isNext ? `${colors.bg} border-l-4 ${colors.border} ring-2 ring-green-500/30` : `${colors.bg}`);

    // Simplified logic: Apply type color always. "Next" gets extra emphasis.
    const finalBgClass = colors.bg;
    const finalTextClass = colors.text;
    const borderClass = isNext ? `border-l-4 ${colors.border}` : '';
    const nextLabel = isNext ? ' <span class="text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-1 rounded ml-2">Prossima</span>' : '';

    const canDrag = this.currentUser ? '' : 'data-drag-disabled';

    list.insertAdjacentHTML('beforeend', `
      <div class="p-4 ${finalBgClass} ${borderClass} rounded-lg shadow-sm flex items-start justify-between gap-4 swipeable-item drag-item mb-3 transition-all hover:shadow-md" data-id="${a.id}" data-item-id="${a.id}" ${canDrag}>
        <div class="flex items-center gap-2 flex-1">
          ${this.currentUser ? '<span class="drag-handle text-gray-400 cursor-grab select-none text-xl opacity-50 hover:opacity-100" draggable="true">☰</span>' : ''}
          <div class="flex-1">
            <div class="flex items-center flex-wrap">
                <h3 class="font-bold text-lg ${finalTextClass}">${a.tipo}</h3>
                ${nextLabel}
            </div>
            <p class="font-medium text-gray-900 dark:text-gray-100 mt-1">📅 ${fullDateStr}</p>
            <p class="text-gray-700 dark:text-gray-300 mt-1">${a.descrizione}${costoLabel}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <a href="attivita.html?id=${a.id}" aria-label="Apri dettaglio" class="p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors" title="Dettagli">📄</a>
          <button aria-label="Modifica" class="p-2 text-gray-500 hover:text-green-600 rounded-full transition-colors" onclick="UI.openEditActivityModal('${a.id}')" ${UI.currentUser ? '' : 'disabled'}>✏️</button>
          <button aria-label="Elimina" class="p-2 text-gray-500 hover:text-red-600 rounded-full transition-colors" onclick="UI.confirmDeleteActivity('${a.id}')" ${UI.currentUser ? '' : 'disabled'}>🗑️</button>
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


UI.openEditActivityModal = function (id) {
  const activity = (this.state.activities || []).find(a => a.id === id);
  if (!activity) {
    this.showToast('Attività non trovata', { type: 'error' });
    return;
  }

  const form = this.qs('#editActivityForm');
  if (!form) return;

  const typeInput = this.qs('#editActivityTipo');
  if (typeInput) {
    // Se il tipo non è tra le opzioni, aggiungilo dinamicamente per assicurare che venga mostrato
    const options = Array.from(typeInput.options).map(o => o.value);
    if (activity.tipo && !options.includes(activity.tipo)) {
      const newOption = document.createElement('option');
      newOption.value = activity.tipo;
      newOption.textContent = activity.tipo;
      typeInput.appendChild(newOption);
    }
    typeInput.value = activity.tipo;
  }

  this.qs('#editActivityId').value = activity.id;

  // Convert/Format date for input type="date"
  const dateObj = this.toJsDate(activity.data);
  const dateStr = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : '';
  const dataInput = this.qs('#editActivityData');
  if (dataInput) dataInput.value = dateStr;

  // Data fine
  const dateFineObj = activity.dataFine ? this.toJsDate(activity.dataFine) : null;
  const dateFineStr = (dateFineObj && !isNaN(dateFineObj)) ? dateFineObj.toISOString().split('T')[0] : '';
  const dataFineInput = this.qs('#editActivityDataFine');
  if (dataFineInput) {
    dataFineInput.value = dateFineStr;

    // Trigger visibility logic force update
    const multiDayTypes = ['Uscita', 'Campo', 'Evento Adulti', 'Eventi con esterni'];

    // Use activity.tipo directly to avoid DOM update lags (though synchronous)
    const typeValue = activity.tipo || (typeInput ? typeInput.value : ''); // Fallback to typeInput.value if activity.tipo is missing
    const isMultiDay = multiDayTypes.includes(typeValue);
    const hasDataFine = !!dateFineStr;

    // console.log('EditModal Visibility:', { type: typeValue, isMultiDay, hasDataFine });

    const elToShow = dataFineInput.parentElement || dataFineInput;
    // Forza visibilità sempre
    elToShow.style.display = 'block';
    elToShow.classList.remove('hidden');
  }

  this.qs('#editActivityDescrizione').value = activity.descrizione;
  this.qs('#editActivityCosto').value = activity.costo || 0;

  this.showModal('editActivityModal');
};

UI.confirmDeleteActivity = function (id) {
  this.activityToDeleteId = id;
  const activity = (this.state.activities || []).find(a => a.id === id);
  const label = activity ? `${activity.tipo} del ${this.toJsDate(activity.data).toLocaleDateString()}` : 'questa attività';

  const infoEl = this.qs('#activityInfoToDelete');
  if (infoEl) infoEl.textContent = label;

  this.showModal('confirmDeleteActivityModal');
};


/**
 * Setup export calendario .ics
 */
UI.setupCalendarExport = function () {
  const exportBtn = this.qs('#exportCalendarICSBtn');
  if (!exportBtn) return;

  if (exportBtn._bound) return;
  exportBtn._bound = true;

  exportBtn.addEventListener('click', () => {
    this.downloadCalendarICS();
  });
};

/**
 * Helpers Mancanti
 */
UI.loadActivityTemplates = async function () {
  try {
    if (!this.currentUser) return [];
    // Potremmo salvarli su Firestore o LocalStorage. Per ora LocalStorage per semplicità.
    const key = `activity_templates_${this.currentUser.uid}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Errore caricamento template:', e);
    return [];
  }
};

UI.saveActivityTemplate = async function (template) {
  try {
    if (!this.currentUser) return;
    const key = `activity_templates_${this.currentUser.uid}`;
    const current = await this.loadActivityTemplates();

    // Check if duplicate name or content?? Simple add for now
    const newTemplate = {
      id: Date.now().toString(),
      name: `${template.tipo} - ${template.descrizione}`,
      ...template
    };

    current.push(newTemplate);
    localStorage.setItem(key, JSON.stringify(current));
    this.showToast('Template salvato locale', { type: 'success' });
    this._activityTemplates = current; // Aggiorna cache locale
  } catch (e) {
    console.error('Errore salvataggio template:', e);
    this.showToast('Errore nel salvare il template', { type: 'error' });
  }
};

UI.validateActivityDateRange = function (date) {
  if (!date || isNaN(date.getTime())) {
    return { valid: false, warning: 'Data non valida' };
  }

  // Esempio: Warning se data è nel passato di oltre 1 anno o nel futuro di oltre 2 anni
  const now = new Date();
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(now.getFullYear() - 1);
  const twoYearsFuture = new Date(); twoYearsFuture.setFullYear(now.getFullYear() + 2);

  if (date < oneYearAgo) {
    return { valid: true, warning: 'Attenzione: La data è nel passato remoto (più di 1 anno fa).' };
  }
  if (date > twoYearsFuture) {
    return { valid: true, warning: 'Attenzione: La data è molto lontana nel futuro.' };
  }

  return { valid: true };
};


