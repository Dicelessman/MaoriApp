import { describe, it, expect } from 'vitest';
import {
  getUpcomingActivities,
  getPendingPaymentsByActivity,
  getUpcomingBirthdays
} from '../js/utils/utils.js';

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
});
