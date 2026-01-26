// preferenze.js - Logica per gestione preferenze utente

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function () {
  this.renderPreferencesPage();
};

UI.renderPreferencesPage = function () {
  const prefs = this.loadUserPreferences();

  // Configurazione Unità
  const unitType = document.getElementById('unitType');
  const unitName = document.getElementById('unitName');
  const unitPreview = document.getElementById('unitPreview');

  if (unitType && unitName && unitPreview) {
    // Carica valori salvati
    unitType.value = localStorage.getItem('unitType') || 'Reparto';
    unitName.value = localStorage.getItem('unitName') || 'Maori';

    // Aggiorna anteprima
    const updatePreview = () => {
      const type = unitType.value;
      const name = unitName.value.trim() || 'Maori';
      unitPreview.textContent = `${type} ${name}`;
    };

    updatePreview();

    // Event listeners per aggiornamento anteprima in tempo reale
    unitType.addEventListener('change', updatePreview);
    unitName.addEventListener('input', updatePreview);

    // Salva quando l'utente modifica
    unitType.addEventListener('change', () => {
      localStorage.setItem('unitType', unitType.value);
      this.updateUnitName();
      this.showToast('Tipo unità aggiornato', { type: 'success', duration: 1500 });
    });

    unitName.addEventListener('blur', () => {
      const name = unitName.value.trim();
      if (name) {
        localStorage.setItem('unitName', name);
        this.updateUnitName();
        this.showToast('Nome unità aggiornato', { type: 'success', duration: 1500 });
      }
    });
  }

  // Tema
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = prefs.theme || 'auto';
    themeSelect.addEventListener('change', (e) => {
      const newTheme = e.target.value;
      this.applyTheme(newTheme);
      const updatedPrefs = { ...prefs, theme: newTheme };
      this.saveUserPreferences(updatedPrefs);
      this.showToast('Tema aggiornato', { type: 'success' });
    });
  }

  // Notifiche
  const notificationsEnabled = document.getElementById('notificationsEnabled');
  const notificationPermissionStatus = document.getElementById('notificationPermissionStatus');
  const notificationActivityReminders = document.getElementById('notificationActivityReminders');
  const notificationPaymentReminders = document.getElementById('notificationPaymentReminders');
  const notificationImportantChanges = document.getElementById('notificationImportantChanges');
  const notificationBirthdayReminders = document.getElementById('notificationBirthdayReminders');

  // Aggiorna stato permessi
  const updateNotificationPermissionStatus = () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      if (permission === 'granted') {
        notificationPermissionStatus.textContent = 'Permessi concessi';
        notificationPermissionStatus.className = 'text-xs text-green-600 mt-1';
      } else if (permission === 'denied') {
        notificationPermissionStatus.textContent = 'Permessi negati (modifica nelle impostazioni browser)';
        notificationPermissionStatus.className = 'text-xs text-red-600 mt-1';
      } else {
        notificationPermissionStatus.textContent = 'Permessi non richiesti';
        notificationPermissionStatus.className = 'text-xs text-yellow-600 mt-1';
      }
    } else {
      notificationPermissionStatus.textContent = 'Notifiche non supportate dal browser';
      notificationPermissionStatus.className = 'text-xs text-gray-400 mt-1';
    }
  };

  updateNotificationPermissionStatus();

  // Checkbox notifiche abilitate
  if (notificationsEnabled) {
    notificationsEnabled.checked = prefs.notifications?.enabled || false;
    notificationsEnabled.addEventListener('change', async (e) => {
      const enabled = e.target.checked;

      if (enabled) {
        // Richiedi permesso
        if ('Notification' in window) {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              e.target.checked = false;
              this.showToast('Permessi notifiche negati', { type: 'error' });
              updateNotificationPermissionStatus();
              return;
            }
          } else if (Notification.permission === 'denied') {
            e.target.checked = false;
            this.showToast('Permessi notifiche negati. Modifica nelle impostazioni del browser.', { type: 'error' });
            updateNotificationPermissionStatus();
            return;
          }
        }

        // Inizializza FCM se non già fatto
        try {
          await this.initializeFCM();
        } catch (error) {
          console.error('Errore inizializzazione FCM:', error);
          this.showToast('Errore inizializzazione notifiche', { type: 'error' });
        }
      }

      // Aggiorna preferenze
      const updatedPrefs = {
        ...prefs,
        notifications: {
          ...prefs.notifications,
          enabled: enabled
        }
      };

      // Abilita/disabilita checkbox figli
      [notificationActivityReminders, notificationPaymentReminders,
        notificationImportantChanges, notificationBirthdayReminders].forEach(cb => {
          if (cb) cb.disabled = !enabled;
        });

      await this.saveUserPreferences(updatedPrefs);
      updateNotificationPermissionStatus();
      this.showToast(enabled ? 'Notifiche abilitate' : 'Notifiche disabilitate', { type: 'success' });
    });

    // Inizializza stato checkbox figli
    const notificationsEnabledState = prefs.notifications?.enabled || false;
    [notificationActivityReminders, notificationPaymentReminders,
      notificationImportantChanges, notificationBirthdayReminders].forEach(cb => {
        if (cb) cb.disabled = !notificationsEnabledState;
      });
  }

  // Checkbox singole notifiche
  if (notificationActivityReminders) {
    notificationActivityReminders.checked = prefs.notifications?.activityReminders ?? true;
    notificationActivityReminders.addEventListener('change', async (e) => {
      const updatedPrefs = {
        ...prefs,
        notifications: {
          ...prefs.notifications,
          activityReminders: e.target.checked
        }
      };
      await this.saveUserPreferences(updatedPrefs);
    });
  }

  if (notificationPaymentReminders) {
    notificationPaymentReminders.checked = prefs.notifications?.paymentReminders ?? true;
    notificationPaymentReminders.addEventListener('change', async (e) => {
      const updatedPrefs = {
        ...prefs,
        notifications: {
          ...prefs.notifications,
          paymentReminders: e.target.checked
        }
      };
      await this.saveUserPreferences(updatedPrefs);
    });
  }

  if (notificationImportantChanges) {
    notificationImportantChanges.checked = prefs.notifications?.importantChanges ?? true;
    notificationImportantChanges.addEventListener('change', async (e) => {
      const updatedPrefs = {
        ...prefs,
        notifications: {
          ...prefs.notifications,
          importantChanges: e.target.checked
        }
      };
      await this.saveUserPreferences(updatedPrefs);
    });
  }

  if (notificationBirthdayReminders) {
    notificationBirthdayReminders.checked = prefs.notifications?.birthdayReminders ?? true;
    notificationBirthdayReminders.addEventListener('change', async (e) => {
      const updatedPrefs = {
        ...prefs,
        notifications: {
          ...prefs.notifications,
          birthdayReminders: e.target.checked
        }
      };
      await this.saveUserPreferences(updatedPrefs);
    });
  }

  // Vista predefinita
  const defaultViewSelect = document.getElementById('defaultViewSelect');
  if (defaultViewSelect) {
    defaultViewSelect.value = prefs.defaultView || '';
    defaultViewSelect.addEventListener('change', async (e) => {
      const updatedPrefs = { ...prefs, defaultView: e.target.value || null };
      await this.saveUserPreferences(updatedPrefs);
      this.showToast('Vista predefinita aggiornata', { type: 'success' });
    });
  }

  // Ordinamento attività
  const activityOrderSelect = document.getElementById('activityOrderSelect');
  if (activityOrderSelect) {
    activityOrderSelect.value = prefs.activityOrder || '';
    activityOrderSelect.addEventListener('change', async (e) => {
      const updatedPrefs = { ...prefs, activityOrder: e.target.value || null };
      await this.saveUserPreferences(updatedPrefs);
      this.showToast('Ordinamento aggiornato', { type: 'success' });
    });
  }

  // Shortcuts configurazione
  const shortcutsEnabled = document.getElementById('shortcutsEnabled');
  const shortcutsConfigContainer = document.getElementById('shortcutsConfigContainer');
  const resetShortcutsBtn = document.getElementById('resetShortcutsBtn');

  const shortcutsConfig = [
    { id: 'save', label: 'Salva form attivo', default: { key: 's', ctrl: true, meta: true, enabled: true } },
    { id: 'search', label: 'Focus su campo ricerca', default: { key: '/', ctrl: false, meta: false, enabled: true } },
    { id: 'escape', label: 'Chiudi modale aperta', default: { key: 'Escape', ctrl: false, meta: false, enabled: true } },
    { id: 'help', label: 'Mostra guida shortcuts', default: { key: '?', ctrl: false, meta: false, enabled: true } }
  ];

  // Render configurazione shortcuts
  const renderShortcutsConfig = () => {
    const config = this.getShortcutsConfig();
    const shortcuts = config.shortcuts || {};

    if (shortcutsConfigContainer) {
      shortcutsConfigContainer.innerHTML = shortcutsConfig.map(sc => {
        const shortcut = shortcuts[sc.id] || sc.default;
        const formatted = this.formatShortcut(shortcut);

        return `
          <div class="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">${sc.label}</label>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" data-shortcut-id="${sc.id}" data-shortcut-enabled class="sr-only peer" ${shortcut.enabled ? 'checked' : ''}>
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button"
                data-shortcut-id="${sc.id}"
                data-shortcut-key-capture
                class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${!shortcut.enabled ? 'opacity-50 cursor-not-allowed' : ''}"
                ${!shortcut.enabled ? 'disabled' : ''}
                title="Clicca e premi una combinazione di tasti"
              >
                ${formatted}
              </button>
              <button 
                type="button"
                data-shortcut-id="${sc.id}"
                data-shortcut-reset
                class="px-2 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Ripristina default"
              >
                🔄
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Setup event listeners per ogni shortcut
      shortcutsConfigContainer.querySelectorAll('[data-shortcut-enabled]').forEach(cb => {
        cb.addEventListener('change', async (e) => {
          const shortcutId = e.target.dataset.shortcutId;
          const enabled = e.target.checked;
          const currentPrefs = this.loadUserPreferences();
          if (!currentPrefs.shortcuts) currentPrefs.shortcuts = {};
          if (!currentPrefs.shortcuts[shortcutId]) {
            currentPrefs.shortcuts[shortcutId] = shortcutsConfig.find(s => s.id === shortcutId).default;
          }
          currentPrefs.shortcuts[shortcutId].enabled = enabled;
          await this.saveUserPreferences(currentPrefs);

          // Rendi/Disabilita il pulsante di cattura
          const captureBtn = shortcutsConfigContainer.querySelector(`[data-shortcut-id="${shortcutId}"][data-shortcut-key-capture]`);
          const resetBtn = shortcutsConfigContainer.querySelector(`[data-shortcut-id="${shortcutId}"][data-shortcut-reset]`);
          if (captureBtn) {
            captureBtn.disabled = !enabled;
            captureBtn.classList.toggle('opacity-50', !enabled);
            captureBtn.classList.toggle('cursor-not-allowed', !enabled);
          }

          // Ricarica configurazione shortcuts
          this.setupKeyboardShortcuts();
          this.showToast(`Scorciatoia ${enabled ? 'abilitata' : 'disabilitata'}`, { type: 'success', duration: 1500 });
        });
      });

      // Setup key capture
      let capturingKey = null;
      shortcutsConfigContainer.querySelectorAll('[data-shortcut-key-capture]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          capturingKey = btn.dataset.shortcutId;
          btn.textContent = 'Premi una combinazione di tasti...';
          btn.classList.add('ring-2', 'ring-green-500');

          const handler = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const shortcut = {
              key: e.key,
              ctrl: e.ctrlKey,
              meta: e.metaKey,
              alt: e.altKey,
              shift: e.shiftKey,
              enabled: true
            };

            // Verifica conflitti con altri shortcuts
            const currentPrefs = this.loadUserPreferences();
            const shortcuts = currentPrefs.shortcuts || {};
            let hasConflict = false;

            for (const [id, existing] of Object.entries(shortcuts)) {
              if (id === capturingKey || !existing.enabled) continue;
              if (existing.key === shortcut.key &&
                existing.ctrl === shortcut.ctrl &&
                existing.meta === shortcut.meta &&
                existing.alt === shortcut.alt) {
                hasConflict = true;
                break;
              }
            }

            if (hasConflict) {
              this.showToast('Questa combinazione è già in uso!', { type: 'error' });
              btn.textContent = this.formatShortcut(shortcuts[capturingKey] || shortcutsConfig.find(s => s.id === capturingKey).default);
            } else {
              if (!currentPrefs.shortcuts) currentPrefs.shortcuts = {};
              currentPrefs.shortcuts[capturingKey] = shortcut;
              await this.saveUserPreferences(currentPrefs);
              btn.textContent = this.formatShortcut(shortcut);
              this.showToast('Scorciatoia aggiornata', { type: 'success', duration: 1500 });

              // Ricarica configurazione shortcuts
              this.setupKeyboardShortcuts();
            }

            btn.classList.remove('ring-2', 'ring-green-500');
            capturingKey = null;
            document.removeEventListener('keydown', handler, true);
          };

          document.addEventListener('keydown', handler, true);
        });
      });

      // Setup reset individuale
      shortcutsConfigContainer.querySelectorAll('[data-shortcut-reset]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const shortcutId = btn.dataset.shortcutId;
          const currentPrefs = this.loadUserPreferences();
          if (!currentPrefs.shortcuts) currentPrefs.shortcuts = {};
          currentPrefs.shortcuts[shortcutId] = { ...shortcutsConfig.find(s => s.id === shortcutId).default };
          await this.saveUserPreferences(currentPrefs);
          renderShortcutsConfig();
          this.setupKeyboardShortcuts();
          this.showToast('Scorciatoia ripristinata', { type: 'success', duration: 1500 });
        });
      });
    }
  };

  // Setup toggle shortcuts enabled
  if (shortcutsEnabled) {
    const config = this.getShortcutsConfig();
    shortcutsEnabled.checked = config.enabled !== false;
    shortcutsEnabled.addEventListener('change', async (e) => {
      const currentPrefs = this.loadUserPreferences();
      currentPrefs.shortcutsEnabled = e.target.checked;
      await this.saveUserPreferences(currentPrefs);
      this.setupKeyboardShortcuts();
      this.showToast(`Scorciatoie ${e.target.checked ? 'abilitate' : 'disabilitate'}`, { type: 'success' });
    });
  }

  // Setup Export/Import
  this.setupExportImport();

  // Setup reset shortcuts
  if (resetShortcutsBtn) {
    resetShortcutsBtn.addEventListener('click', async () => {
      const confirmed = await this.showConfirmModal(
        'Ripristina Scorciatoie',
        'Sei sicuro di voler ripristinare tutte le scorciatoie ai valori predefiniti?',
        { confirmText: 'Ripristina', cancelText: 'Annulla' }
      );

      if (confirmed) {
        const currentPrefs = this.loadUserPreferences();
        currentPrefs.shortcuts = {};
        shortcutsConfig.forEach(sc => {
          if (!currentPrefs.shortcuts) currentPrefs.shortcuts = {};
          currentPrefs.shortcuts[sc.id] = { ...sc.default };
        });
        await this.saveUserPreferences(currentPrefs);
        renderShortcutsConfig();
        this.setupKeyboardShortcuts();
        this.showToast('Scorciatoie ripristinate', { type: 'success' });
      }
    });
  }

  // Render configurazione shortcuts
  renderShortcutsConfig();

  // Sincronizza preferenze
  const syncPreferencesBtn = document.getElementById('syncPreferencesBtn');
  if (syncPreferencesBtn) {
    syncPreferencesBtn.addEventListener('click', async () => {
      syncPreferencesBtn.disabled = true;
      syncPreferencesBtn.textContent = '⏳ Sincronizzazione...';

      try {
        await this.syncUserPreferences();
        const updatedPrefs = this.loadUserPreferences();
        this.renderPreferencesPage(); // Ricarica
        this.showToast('Preferenze sincronizzate', { type: 'success' });
      } catch (error) {
        console.error('Errore sincronizzazione:', error);
        this.showToast('Errore sincronizzazione preferenze', { type: 'error' });
      } finally {
        syncPreferencesBtn.disabled = false;
        syncPreferencesBtn.textContent = '🔄 Sincronizza Preferenze';
      }
    });
  }

  // Salva preferenze
  const savePreferencesBtn = document.getElementById('savePreferencesBtn');
  if (savePreferencesBtn) {
    savePreferencesBtn.addEventListener('click', async () => {
      const currentPrefs = this.loadUserPreferences();
      await this.saveUserPreferences(currentPrefs);
      this.showToast('Preferenze salvate con successo', { type: 'success' });
    });
  }

  // Ripristina default
  const resetPreferencesBtn = document.getElementById('resetPreferencesBtn');
  if (resetPreferencesBtn) {
    resetPreferencesBtn.addEventListener('click', async () => {
      const confirmed = await this.showConfirmModal(
        'Ripristina Preferenze',
        'Sei sicuro di voler ripristinare tutte le preferenze ai valori predefiniti? Questa azione non può essere annullata.',
        { confirmText: 'Ripristina', cancelText: 'Annulla' }
      );

      if (confirmed) {
        const defaultPrefs = {
          theme: 'auto',
          activityOrder: null,
          defaultView: null,
          savedFilters: {},
          notifications: {
            activityReminders: true,
            paymentReminders: true,
            importantChanges: true,
            birthdayReminders: true,
            enabled: false
          },
          shortcuts: {
            save: { key: 's', ctrl: true, meta: true, enabled: true },
            search: { key: '/', ctrl: false, meta: false, enabled: true },
            escape: { key: 'Escape', ctrl: false, meta: false, enabled: true },
            help: { key: '?', ctrl: false, meta: false, enabled: true }
          },
          shortcutsEnabled: true
        };

        await this.saveUserPreferences(defaultPrefs);
        this.applyTheme('auto');
        this.renderPreferencesPage(); // Ricarica
        this.showToast('Preferenze ripristinate', { type: 'success' });
      }
    });
  }
};
// Helper per shortcuts
UI.getShortcutsConfig = function () {
  const defaultShortcuts = {
    save: { key: 's', ctrl: true, meta: true, enabled: true },
    search: { key: '/', ctrl: false, meta: false, enabled: true },
    escape: { key: 'Escape', ctrl: false, meta: false, enabled: true },
    help: { key: '?', ctrl: false, meta: false, enabled: true }
  };

  const prefs = this.loadUserPreferences();
  const shortcuts = prefs.shortcuts || {};
  // Merge defaults
  const merged = { ...defaultShortcuts };
  for (const [k, v] of Object.entries(shortcuts)) {
    if (v && typeof v === 'object') merged[k] = v;
  }

  return {
    enabled: prefs.shortcutsEnabled !== false,
    shortcuts: merged
  };
};

UI.formatShortcut = function (sc) {
  if (!sc) return '';
  const parts = [];
  if (sc.ctrl) parts.push('Ctrl');
  if (sc.meta) parts.push('Cmd'); // Meta usually Cmd on Mac, Win on Windows
  if (sc.alt) parts.push('Alt');
  if (sc.shift) parts.push('Shift');
  if (sc.key === ' ') parts.push('Space');
  else parts.push(sc.key === 'Control' ? 'Ctrl' : (sc.key === ' ' ? 'Space' : sc.key.toUpperCase()));
  return parts.join('+');
};

UI.setupKeyboardShortcuts = function () {
  // Remove previous listener if exists (needs reference to remove, simpler to just add unique one or check flag)
  // Here we just add one global listener that checks config dynamically
  if (this._shortcutsInitialized) return;
  this._shortcutsInitialized = true;

  document.addEventListener('keydown', (e) => {
    // Ignore if input/textarea focused (unless escape/ctrl+s)
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

    const config = this.getShortcutsConfig();
    if (!config.enabled) return;

    const checkCtx = (sc) => {
      return sc.key.toLowerCase() === e.key.toLowerCase() &&
        !!sc.ctrl === e.ctrlKey &&
        !!sc.meta === e.metaKey &&
        !!sc.alt === e.altKey &&
        !!sc.shift === e.shiftKey;
    };

    const sc = config.shortcuts;

    // Save (Ctrl+S) - allow in inputs
    if (sc.save.enabled && checkCtx(sc.save)) {
      e.preventDefault();
      const activeForm = document.querySelector('form.active, form:not([style*="display: none"])');
      // Simple heuristic to find "main" form
      const mainForm = document.querySelector('form');
      const submitBtn = (activeForm || mainForm)?.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
      return;
    }

    // Escape (Esc) - allow in inputs
    if (sc.escape.enabled && checkCtx(sc.escape)) {
      // Close topmost modal
      const modals = document.querySelectorAll('.modal.show');
      if (modals.length > 0) {
        const top = modals[modals.length - 1];
        this.closeModal(top.id);
        e.preventDefault();
        return;
      }
    }

    if (isInput) return; // Ignore others active inputs

    // Search (/)
    if (sc.search.enabled && checkCtx(sc.search)) {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="search"], #searchInput');
      if (searchInput) {
        searchInput.focus();
        // Select all text
        searchInput.select();
      }
    }

    // Help (?)
    if (sc.help.enabled && checkCtx(sc.help)) {
      e.preventDefault();
      this.showToast('Scorciatoie: Ctrl+S Salva, / Cerca, Esc Chiudi');
    }
  });
};


// Setup Export/Import handlers
UI.setupExportImport = function () {
  // Export JSON
  const exportJSONBtn = document.getElementById('exportJSONBtn');
  if (exportJSONBtn) {
    exportJSONBtn.addEventListener('click', () => {
      this.downloadJSONExport();
    });
  }

  // Export Presences CSV
  const exportPresencesCSVBtn = document.getElementById('exportPresencesCSVBtn');
  if (exportPresencesCSVBtn) {
    exportPresencesCSVBtn.addEventListener('click', () => {
      this.downloadPresencesCSV();
    });
  }

  // Export Activities CSV
  const exportActivitiesCSVBtn = document.getElementById('exportActivitiesCSVBtn');
  if (exportActivitiesCSVBtn) {
    exportActivitiesCSVBtn.addEventListener('click', () => {
      this.downloadActivitiesCSV();
    });
  }

  // Export Excel
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', () => {
      this.downloadExcelExport();
    });
  }



  // Import Anagrafica CSV Especiale
  const importAnagraficaCsvInput = document.getElementById('importAnagraficaCsvInput');
  if (importAnagraficaCsvInput) {
    importAnagraficaCsvInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      await this.handleAnagraficaCSVImport(file);
      e.target.value = ''; // Reset
    });
  }
};

/**
 * Gestisce l'importazione specifica del CSV anagrafica
 */
UI.handleAnagraficaCSVImport = async function (file) {
  const logContainer = document.getElementById('importLogContainer');
  const logContent = document.getElementById('importLogContent');

  if (logContainer) logContainer.classList.remove('hidden');
  if (logContent) logContent.textContent = 'Inizio lettura file...\n';

  const appendLog = (msg) => {
    if (logContent) {
      logContent.textContent += msg + '\n';
      logContent.scrollTop = logContent.scrollHeight;
    }
    console.log('[CSV Import] ' + msg);
  };

  try {
    const text = await file.text();
    const rows = this.parseCSV(text);

    appendLog(`File letto: ${rows.length} righe trovate.`);

    if (rows.length < 2) {
      appendLog('Errore: Il file sembra vuoto o manca l\'intestazione.');
      return;
    }

    // Mappatura colonne (basata su "generated (4).csv")
    // "tessera","id","codiceFiscale","dataNascita","indirizzo","via","comune","nomeAnagrafico","cognome","sesso","genitore1","emailGenitore1","telefonoGenitore1","genitore2","emailGenitore2","telefonoGenitore2"
    const header = rows[0];
    const getIdx = (colName) => header.findIndex(h => h.toLowerCase() === colName.toLowerCase());

    const mapIndices = {
      tessera: getIdx('tessera'),
      nome: getIdx('nomeAnagrafico'), // Note: CSV header says 'nomeAnagrafico'
      cognome: getIdx('cognome'),
      cf: getIdx('codiceFiscale'),
      dob: getIdx('dataNascita'), // YYYY-MM-DD
      indirizzo: getIdx('via'), // Preferisco 'via' a 'indirizzo' completo
      citta: getIdx('comune'),
      sesso: getIdx('sesso'),
      g1_nome: getIdx('genitore1'),
      g1_email: getIdx('emailGenitore1'),
      g1_tel: getIdx('telefonoGenitore1'),
      g2_nome: getIdx('genitore2'),
      g2_email: getIdx('emailGenitore2'),
      g2_tel: getIdx('telefonoGenitore2')
    };

    // Validation check
    if (mapIndices.nome === -1 || mapIndices.cognome === -1) {
      appendLog('Errore Crudale: Colonne "nomeAnagrafico" e "cognome" non trovate nel CSV.');
      // Fallback try "nome" instead of "nomeAnagrafico" just in case
      mapIndices.nome = getIdx('nome');
      if (mapIndices.nome === -1) return;
    }

    appendLog('Caricamento esploratori esistenti...');
    this.showLoadingOverlay('Analisi CSV in corso...');

    // Force refresh to get all scouts including archived ones? No, usually import is for active ones mostly, 
    // but let's load all to be sure.
    const allData = await DATA.loadAll(true);
    const scouts = allData.allScouts || allData.scouts || [];

    appendLog(`Database caricato: ${scouts.length} esploratori totali.`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Start processing rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue; // Skip empty rows

      const rawNome = row[mapIndices.nome] || '';
      const rawCognome = row[mapIndices.cognome] || '';

      if (!rawNome && !rawCognome) {
        skipCount++;
        continue;
      }

      // Normalize for matching
      const norm = s => s.trim().toLowerCase();
      const searchNome = norm(rawNome);
      const searchCognome = norm(rawCognome);

      // Find match
      const match = scouts.find(s =>
        norm(s.nome) === searchNome && norm(s.cognome) === searchCognome
      );

      if (match) {
        // Prepare update payload
        const updates = {};

        const val = (idx) => {
          const v = row[idx];
          return (v && v.trim()) ? v.trim() : null;
        };

        // Mappa i campi solo se presenti nel CSV (sovrascrive solo se c'è valore nel CSV)
        // Se nel CSV è vuoto, non cancella il dato esistente (policy conservativa)

        const csv_cf = val(mapIndices.cf);
        if (csv_cf) updates.anag_cf = csv_cf;

        const csv_dob = val(mapIndices.dob); // Check format? CSV seems YYYY-MM-DD
        if (csv_dob) updates.anag_dob = csv_dob; // Firestore adapter handles string dates fine usually or we convert?
        // Adapter usually expects Date object or Timestamp. Let's ensure consistency.

        const csv_sex = val(mapIndices.sesso);
        if (csv_sex) {
          const sexMap = { 'M': 'maschio', 'F': 'femmina', 'm': 'maschio', 'f': 'femmina' };
          updates.anag_sesso = sexMap[csv_sex] || csv_sex.toLowerCase();
        }

        const csv_via = val(mapIndices.indirizzo);
        if (csv_via) updates.anag_indirizzo = csv_via;

        const csv_citta = val(mapIndices.citta);
        if (csv_citta) updates.anag_citta = csv_citta;

        // Genitori
        const g1n = val(mapIndices.g1_nome);
        if (g1n) updates.ct_g1_nome = g1n;
        const g1e = val(mapIndices.g1_email);
        if (g1e) updates.ct_g1_email = g1e;
        const g1t = val(mapIndices.g1_tel);
        if (g1t) updates.ct_g1_tel = g1t;

        const g2n = val(mapIndices.g2_nome);
        if (g2n) updates.ct_g2_nome = g2n;
        const g2e = val(mapIndices.g2_email);
        if (g2e) updates.ct_g2_email = g2e;
        const g2t = val(mapIndices.g2_tel);
        if (g2t) updates.ct_g2_tel = g2t;

        // Censimento (Tessera) - magari salviamo in un campo note o custom? 
        // Non vedo campo censimento esplicito nel model scout2.js, metto in note se serve?
        // Per ora ignoro se non richiesto.

        if (Object.keys(updates).length > 0) {
          try {
            await DATA.updateScout(match.id, updates, this.currentUser);
            appendLog(`✅ Aggiornato: ${rawNome} ${rawCognome}`);
            updatedCount++;
          } catch (e) {
            appendLog(`❌ Errore aggiornamento ${rawNome} ${rawCognome}: ${e.message}`);
            errorCount++;
          }
        } else {
          appendLog(`⏭️ Nessun nuovo dato per: ${rawNome} ${rawCognome}`);
          skipCount++;
        }

      } else {
        appendLog(`⚠️ Non trovato: ${rawNome} ${rawCognome}`);
        notFoundCount++;
      }
    }

    appendLog('-----------------------------------');
    appendLog(`COMPLETATO: ${updatedCount} aggiornati, ${notFoundCount} non trovati, ${errorCount} errori.`);

    this.showToast(`Import completato: ${updatedCount} aggiornati`);

  } catch (err) {
    appendLog('ERRORE FATALE: ' + err.message);
    console.error(err);
    this.showToast('Errore import CSV', { type: 'error' });
  } finally {
    this.hideLoadingOverlay();
  }
};

/**
 * Parsa una stringa CSV gestendo i doppi apici
 */
UI.parseCSV = function (str) {
  const arr = [];
  let quote = false;
  let col = 0;
  let row = 0;
  let c = 0;

  for (; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';

    if (cc === '"' && quote && nc === '"') {
      arr[row][col] += cc; ++c; continue;
    }
    if (cc === '"') {
      quote = !quote; continue;
    }
    if (cc === ',' && !quote) {
      ++col; continue;
    }
    if (cc === '\r' && nc === '\n' && !quote) {
      ++row; col = 0; ++c; continue;
    }
    if (cc === '\n' && !quote) {
      ++row; col = 0; continue;
    }
    if (cc === '\r' && !quote) {
      ++row; col = 0; continue;
    }

    arr[row][col] += cc;
  }
  return arr;
};

