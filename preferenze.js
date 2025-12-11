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
          }
        };
        
        await this.saveUserPreferences(defaultPrefs);
        this.applyTheme('auto');
        this.renderPreferencesPage(); // Ricarica
        this.showToast('Preferenze ripristinate', { type: 'success' });
      }
    });
  }
};

