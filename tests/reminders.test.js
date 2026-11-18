import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../js/core/firebase.js', () => ({
  db: {},
  auth: {},
  messaging: null,
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  Timestamp: { now: () => new Date(), fromDate: (d) => d },
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
  getToken: vi.fn(),
  onMessage: vi.fn()
}));

import {
  getUpcomingActivities,
  getPendingPaymentsByActivity,
  getUpcomingBirthdays
} from '../js/utils/utils.js';
import { UI } from '../js/ui/ui.js';
import { DATA } from '../js/data/data-facade.js';

describe('Reminders Utilities', () => {
  describe('getUpcomingActivities', () => {
    const baseDate = new Date('2025-05-10T10:00:00Z');

    const activities = [
      { id: 'a1', descrizione: 'Attività passata', data: '2025-05-08' },
      { id: 'a2', descrizione: 'Attività oggi', data: '2025-05-10' },
      { id: 'a3', descrizione: 'Attività domani', data: '2025-05-11' },
      { id: 'a4', descrizione: 'Attività tra 3 giorni', data: '2025-05-13' },
      { id: 'a5', descrizione: 'Attività tra 5 giorni', data: '2025-05-15' },
    ];

    it('restituisce solo le attività comprese nei 3 giorni successivi', () => {
      const upcoming = getUpcomingActivities(activities, 3, baseDate);
      expect(upcoming.map(a => a.id)).toEqual(['a2', 'a3', 'a4']);
    });

    it('ordina le attività imminenti cronologicamente', () => {
      const shuffled = [activities[3], activities[1], activities[2]];
      const upcoming = getUpcomingActivities(shuffled, 3, baseDate);
      expect(upcoming.map(a => a.id)).toEqual(['a2', 'a3', 'a4']);
    });

    it('gestisce input vuoti o non validi', () => {
      expect(getUpcomingActivities(null, 3, baseDate)).toEqual([]);
      expect(getUpcomingActivities([], 3, baseDate)).toEqual([]);
      expect(getUpcomingActivities([{ id: 'bad', data: null }], 3, baseDate)).toEqual([]);
    });
  });

  describe('getPendingPaymentsByActivity', () => {
    const activities = [
      { id: 'act1', descrizione: 'Uscita a pagamento', costo: '15' },
      { id: 'act2', descrizione: 'Riunione gratuita', costo: '0' },
      { id: 'act3', descrizione: 'San Giorgio', costo: '20' },
    ];

    const presences = [
      // act1: 2 presenti non pagati, 1 presente pagato, 1 assente non pagato
      { esploratoreId: 's1', attivitaId: 'act1', stato: 'Presente', pagato: false },
      { esploratoreId: 's2', attivitaId: 'act1', stato: 'Presente', pagato: false },
      { esploratoreId: 's3', attivitaId: 'act1', stato: 'Presente', pagato: true },
      { esploratoreId: 's4', attivitaId: 'act1', stato: 'Assente', pagato: false },

      // act2: costo 0 -> da ignorare anche se non pagato
      { esploratoreId: 's1', attivitaId: 'act2', stato: 'Presente', pagato: false },

      // act3: tutti pagati
      { esploratoreId: 's1', attivitaId: 'act3', stato: 'Presente', pagato: true },
    ];

    it('rileva correttamente le quote non pagate per attività a pagamento', () => {
      const pending = getPendingPaymentsByActivity(activities, presences);
      expect(pending).toHaveLength(1);
      expect(pending[0].activity.id).toBe('act1');
      expect(pending[0].pendingCount).toBe(2);
      expect(pending[0].totalAmount).toBe(30);
    });

    it('ignora attività con costo zero', () => {
      const freeOnly = [{ id: 'free', descrizione: 'Gratis', costo: '0' }];
      const pres = [{ esploratoreId: 's1', attivitaId: 'free', stato: 'Presente', pagato: false }];
      expect(getPendingPaymentsByActivity(freeOnly, pres)).toEqual([]);
    });

    it('gestisce input non array con grazia', () => {
      expect(getPendingPaymentsByActivity(null, null)).toEqual([]);
      expect(getPendingPaymentsByActivity([], [])).toEqual([]);
    });
  });

  describe('getUpcomingBirthdays', () => {
    const baseDate = new Date('2025-04-10T12:00:00Z');

    const scouts = [
      { id: 's1', nome: 'Marco', cognome: 'Rossi', anag_dob: '2012-04-10' }, // Oggi
      { id: 's2', nome: 'Lucia', cognome: 'Verdi', anag_dob: '2011-04-12' }, // Tra 2 giorni
      { id: 's3', nome: 'Anna', cognome: 'Bianchi', anag_dob: '2010-04-13' }, // Tra 3 giorni
      { id: 's4', nome: 'Paolo', cognome: 'Neri', anag_dob: '2012-04-20' }, // Tra 10 giorni
      { id: 's5', nome: 'Archivio', cognome: 'Test', anag_dob: '2012-04-11', archived: true }, // Archiviato
    ];

    it('trova i compleanni nei prossimi 3 giorni escludendo gli archiviati', () => {
      const bdays = getUpcomingBirthdays(scouts, 3, baseDate);
      expect(bdays).toHaveLength(3);
      expect(bdays[0].scout.nome).toBe('Marco');
      expect(bdays[0].daysUntil).toBe(0);
      expect(bdays[0].turningAge).toBe(13);

      expect(bdays[1].scout.nome).toBe('Lucia');
      expect(bdays[1].daysUntil).toBe(2);
      expect(bdays[1].turningAge).toBe(14);
    });

    it('gestisce il cambio di anno per compleanni a inizio gennaio', () => {
      const yearEnd = new Date('2025-12-30T10:00:00Z');
      const scoutsYearEnd = [
        { id: 'sNewYear', nome: 'Gennaio', cognome: 'Test', anag_dob: '2013-01-01' }
      ];
      const bdays = getUpcomingBirthdays(scoutsYearEnd, 3, yearEnd);
      expect(bdays).toHaveLength(1);
      expect(bdays[0].daysUntil).toBe(2);
      expect(bdays[0].turningAge).toBe(13); // Compie 13 nel 2026
    });
  });

  describe('UI Reminders & Push Notifications', () => {
    const origNotification = globalThis.Notification;
    const origServiceWorker = navigator.serviceWorker;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-18T10:00:00Z'));
      localStorage.clear();
      DATA.useLocal();
      UI.currentUser = { uid: 'user_test_1', email: 'staff@maori.it' };
      UI.state = {
        activities: [
          { id: 'act_soon', tipo: 'Uscita', descrizione: 'Uscita d\'Autunno', data: '2026-11-20', costo: 15 }
        ],
        scouts: [
          { id: 's1', nome: 'Luca', cognome: 'Bianchi', anag_dob: '2012-11-19' }
        ],
        presences: [
          { esploratoreId: 's1', attivitaId: 'act_soon', stato: 'Presente', pagato: false }
        ]
      };
      localStorage.setItem('app-preferences', JSON.stringify({
        theme: 'light',
        notifications: {
          enabled: true,
          activityReminders: true,
          paymentReminders: true,
          birthdayReminders: true,
          deadlineReminders: true
        }
      }));
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
      globalThis.Notification = origNotification;
      Object.defineProperty(navigator, 'serviceWorker', {
        value: origServiceWorker,
        configurable: true
      });
    });

    it('checkDeadlineReminders genera promemoria solo per scadenze non completate entro 3 giorni', async () => {
      vi.spyOn(DATA, 'getCustomDeadlines').mockResolvedValue([
        { id: 'd1', titolo: 'Prenota pulmino', dataScadenza: '2026-11-20', completata: false, categoria: 'Logistica' },
        { id: 'd2', titolo: 'Già completata', dataScadenza: '2026-11-19', completata: true, categoria: 'Generale' },
        { id: 'd3', titolo: 'Lontana', dataScadenza: '2026-11-30', completata: false, categoria: 'Generale' }
      ]);

      const count = await UI.checkDeadlineReminders();
      expect(count).toBe(1);

      const notes = await UI.loadInAppNotifications();
      expect(notes).toHaveLength(1);
      expect(notes[0].type).toBe('deadline_reminder');
      expect(notes[0].title).toContain('Prenota pulmino');
      expect(notes[0].url).toBe('scadenze.html');
    });

    it('dispatchBrowserPushNotification invia la notifica tramite Service Worker quando abilitato e autorizzato', async () => {
      const showNotification = vi.fn().mockResolvedValue(undefined);
      globalThis.Notification = vi.fn();
      globalThis.Notification.permission = 'granted';
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistration: vi.fn().mockResolvedValue({ showNotification })
        },
        configurable: true
      });

      const sent = await UI.dispatchBrowserPushNotification({
        title: 'Test Push',
        body: 'Messaggio di test',
        url: 'scadenze.html',
        tag: 'test_tag'
      });

      expect(sent).toBe(true);
      expect(showNotification).toHaveBeenCalledWith('Test Push', expect.objectContaining({
        body: 'Messaggio di test',
        tag: 'test_tag',
        data: { url: 'scadenze.html' }
      }));
    });

    it('runAllRemindersCheck verifica attività, quote, compleanni e scadenze insieme', async () => {
      vi.spyOn(DATA, 'getCustomDeadlines').mockResolvedValue([
        { id: 'd_today', titolo: 'Consegna modulo', dataScadenza: '2026-11-18', completata: false }
      ]);

      const showNotification = vi.fn().mockResolvedValue(undefined);
      globalThis.Notification = vi.fn();
      globalThis.Notification.permission = 'granted';
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistration: vi.fn().mockResolvedValue({ showNotification })
        },
        configurable: true
      });

      const res = await UI.runAllRemindersCheck(true);

      expect(res).toEqual({
        activities: 1,
        payments: 1,
        birthdays: 1,
        deadlines: 1,
        total: 4
      });
      expect(showNotification).toHaveBeenCalledTimes(4);

      const storedNotes = await UI.loadInAppNotifications();
      expect(storedNotes).toHaveLength(4);
    });

    it('checkDeadlineReminders rispetta preavvisoGiorni personalizzato e controlla certificati medici in scadenza', async () => {
      vi.spyOn(DATA, 'getCustomDeadlines').mockResolvedValue([
        { id: 'd10', titolo: 'Iscrizione Campo', dataScadenza: '2026-11-28', completata: false, preavvisoGiorni: 10, categoria: 'Iscrizioni' },
        { id: 'd_far', titolo: 'Troppo Lontana', dataScadenza: '2026-12-20', completata: false, preavvisoGiorni: 5, categoria: 'Altro' }
      ]);
      UI.state.scouts = [
        { id: 's1', nome: 'Luca', cognome: 'Bianchi', anag_dob: '2012-11-19', san_cert_scadenza: '2026-11-22' },
        { id: 's_ok', nome: 'Anna', cognome: 'Verdi', anag_dob: '2012-01-10', san_cert_scadenza: '2027-03-01' }
      ];

      const showNotification = vi.fn().mockResolvedValue(undefined);
      globalThis.Notification = vi.fn();
      globalThis.Notification.permission = 'granted';
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistration: vi.fn().mockResolvedValue({ showNotification })
        },
        configurable: true
      });

      const count = await UI.checkDeadlineReminders();
      expect(count).toBe(2);
      expect(showNotification).toHaveBeenCalledTimes(2);

      const notes = await UI.loadInAppNotifications();
      expect(notes.map(n => n.title)).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Iscrizione Campo'),
          expect.stringContaining('Certificato Medico: Luca Bianchi')
        ])
      );
    });

    it('checkDeadlineReminders genera notifica per scadenza superata con notificaScaduta', async () => {
      vi.spyOn(DATA, 'getCustomDeadlines').mockResolvedValue([
        { id: 'd_past', titolo: 'Saldo Affitto', dataScadenza: '2026-11-15', completata: false, notificaScaduta: true, categoria: 'Pagamenti' }
      ]);

      const count = await UI.checkDeadlineReminders();
      expect(count).toBe(1);

      const notes = await UI.loadInAppNotifications();
      expect(notes[0].title).toContain('Scadenza superata: Saldo Affitto');
      expect(notes[0].body).toContain('Scaduta da 3 giorni');
    });

    it('triggerSingleDeadlinePush invia subito notifica push browser e salva notifica in-app', async () => {
      localStorage.setItem('app-preferences', JSON.stringify({
        theme: 'light',
        notifications: { enabled: false, deadlineReminders: true }
      }));

      const showNotification = vi.fn().mockResolvedValue(undefined);
      globalThis.Notification = vi.fn();
      globalThis.Notification.permission = 'default';
      globalThis.Notification.requestPermission = vi.fn().mockImplementation(async () => {
        globalThis.Notification.permission = 'granted';
        return 'granted';
      });
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistration: vi.fn().mockResolvedValue({ showNotification })
        },
        configurable: true
      });

      const sent = await UI.triggerSingleDeadlinePush({
        id: 'single_1',
        titolo: 'Riunione Capi',
        dataScadenza: '2026-11-25',
        daysUntil: 7,
        categoria: 'Staff'
      });

      expect(sent).toBe(true);
      expect(globalThis.Notification.requestPermission).toHaveBeenCalled();
      expect(showNotification).toHaveBeenCalledTimes(1);
      expect(showNotification).toHaveBeenCalledWith('⏰ Riunione Capi', expect.objectContaining({
        data: { url: 'scadenze.html' }
      }));

      const updatedPrefs = UI.loadUserPreferences();
      expect(updatedPrefs.notifications.enabled).toBe(true);

      const stored = await UI.loadInAppNotifications();
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe('⏰ Riunione Capi');
    });
  });
});
