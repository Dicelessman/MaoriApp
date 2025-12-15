// preferenze.js - Logica per gestione preferenze utente

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function() {
  this.renderPreferencesPage();
};

UI.renderPreferencesPage = function() {
  const prefs = this.loadUserPreferences();
  
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

