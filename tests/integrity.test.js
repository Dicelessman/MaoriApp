import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkDataIntegrity } from '../js/utils/validation.js';

describe('Data Integrity and Maintenance (Fase 4)', () => {
  const sampleScouts = [
    { id: 's1', nome: 'Marco', cognome: 'Rossi', pv_pattuglia: 'Aquile' },
    { id: 's2', nome: 'Giulia', cognome: 'Bianchi', pv_pattuglia: 'Lupi' },
    { id: 's3', nome: 'Luca', cognome: 'Verdi', pv_pattuglia: 'Aquile' }
  ];

  const sampleActivities = [
    { id: 'a1', tipo: 'Riunione', data: '2026-09-01T15:00:00Z', descrizione: 'Apertura anno' },
    { id: 'a2', tipo: 'Uscita', data: '2026-09-15T08:00:00Z', descrizione: 'Uscita autunnale' }
  ];

  const samplePresences = [
    { id: 'p1', esploratoreId: 's1', attivitaId: 'a1', stato: 'Presente' },
    { id: 'p2', esploratoreId: 's2', attivitaId: 'a1', stato: 'Assente' },
    { id: 'p3', esploratoreId: 's3', attivitaId: 'a2', stato: 'Presente' }
  ];

  const sampleStaff = [
    { id: 'm1', nome: 'Capo', cognome: 'Uno', email: 'capo1@scout.it' },
    { id: 'm2', nome: 'Capo', cognome: 'Due', email: 'capo2@scout.it' }
  ];

  it('should return isValid true when state has no inconsistencies', () => {
    const state = {
      scouts: sampleScouts,
      activities: sampleActivities,
      presences: samplePresences,
      staff: sampleStaff
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(true);
    expect(result.summary.totalIssues).toBe(0);
    expect(result.summary.totalOrphanPresences).toBe(0);
    expect(result.summary.duplicateScouts.length).toBe(0);
    expect(result.summary.duplicateStaffEmails.length).toBe(0);
    expect(result.summary.invalidDateActivities.length).toBe(0);
  });

  it('should handle null or empty state gracefully', () => {
    const result = checkDataIntegrity(null);
    expect(result.isValid).toBe(true);
    expect(result.summary.totalIssues).toBe(0);
  });

  it('should detect orphan presences when scout does not exist', () => {
    const state = {
      scouts: sampleScouts,
      activities: sampleActivities,
      presences: [
        ...samplePresences,
        { id: 'p_orphan1', esploratoreId: 'non_existent_scout', attivitaId: 'a1', stato: 'Presente' }
      ],
      staff: sampleStaff
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(false);
    expect(result.summary.totalOrphanPresences).toBe(1);
    expect(result.summary.orphanPresencesNoScout.length).toBe(1);
    expect(result.summary.orphanPresencesNoScout[0].id).toBe('p_orphan1');
  });

  it('should detect orphan presences when activity does not exist', () => {
    const state = {
      scouts: sampleScouts,
      activities: sampleActivities,
      presences: [
        ...samplePresences,
        { id: 'p_orphan2', esploratoreId: 's1', attivitaId: 'deleted_activity_id', stato: 'Presente' }
      ],
      staff: sampleStaff
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(false);
    expect(result.summary.totalOrphanPresences).toBe(1);
    expect(result.summary.orphanPresencesNoActivity.length).toBe(1);
    expect(result.summary.orphanPresencesNoActivity[0].id).toBe('p_orphan2');
  });

  it('should count compound orphan presences correctly without duplicate counts', () => {
    const state = {
      scouts: sampleScouts,
      activities: sampleActivities,
      presences: [
        { id: 'p_orphan_both', esploratoreId: 'ghost_scout', attivitaId: 'ghost_activity', stato: 'NR' }
      ],
      staff: sampleStaff
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(false);
    // Even though both scout and activity are missing, unique orphan count should be 1
    expect(result.summary.totalOrphanPresences).toBe(1);
    expect(result.summary.orphanPresencesNoScout.length).toBe(1);
    expect(result.summary.orphanPresencesNoActivity.length).toBe(1);
  });

  it('should detect duplicate scouts with identical case-insensitive names', () => {
    const state = {
      scouts: [
        ...sampleScouts,
        { id: 's4', nome: 'marco ', cognome: ' rossi', pv_pattuglia: 'Lupi' }
      ],
      activities: sampleActivities,
      presences: samplePresences,
      staff: sampleStaff
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(false);
    expect(result.summary.duplicateScouts.length).toBe(1);
    expect(result.summary.duplicateScouts[0].count).toBe(2);
  });

  it('should detect duplicate staff emails case-insensitively', () => {
    const state = {
      scouts: sampleScouts,
      activities: sampleActivities,
      presences: samplePresences,
      staff: [
        ...sampleStaff,
        { id: 'm3', nome: 'Altro', cognome: 'Capo', email: 'CAPO1@scout.it' }
      ]
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(false);
    expect(result.summary.duplicateStaffEmails.length).toBe(1);
    expect(result.summary.duplicateStaffEmails[0].email).toBe('capo1@scout.it');
  });

  it('should detect activities with invalid dates', () => {
    const state = {
      scouts: sampleScouts,
      activities: [
        ...sampleActivities,
        { id: 'a3', tipo: 'Campo', data: 'data_invalida_123', descrizione: 'Campo estivo' },
        { id: 'a4', tipo: 'Uscita', data: null, descrizione: 'Senza data' }
      ],
      presences: samplePresences,
      staff: sampleStaff
    };

    const result = checkDataIntegrity(state);
    expect(result.isValid).toBe(false);
    expect(result.summary.invalidDateActivities.length).toBe(2);
    expect(result.summary.invalidDateActivities.map(a => a.id)).toEqual(['a3', 'a4']);
  });

  describe('Error Tracking & Storage Buffer Logic', () => {
    let mockStorage = {};
    beforeEach(() => {
      mockStorage = {};
      global.localStorage = {
        getItem: vi.fn(k => mockStorage[k] || null),
        setItem: vi.fn((k, v) => { mockStorage[k] = v; }),
        removeItem: vi.fn(k => { delete mockStorage[k]; })
      };
    });

    it('should store and trim errors buffer up to 10 entries', () => {
      const reportError = (error, context = {}) => {
        const errorInfo = {
          timestamp: new Date().toISOString(),
          message: error?.message || String(error),
          context
        };
        const raw = localStorage.getItem('app-recent-errors');
        const errors = raw ? JSON.parse(raw) : [];
        errors.unshift(errorInfo);
        if (errors.length > 10) errors.length = 10;
        localStorage.setItem('app-recent-errors', JSON.stringify(errors));
        return errorInfo;
      };

      for (let i = 0; i < 15; i++) {
        reportError(new Error(`Test error ${i}`));
      }

      const stored = JSON.parse(localStorage.getItem('app-recent-errors'));
      expect(stored.length).toBe(10);
      expect(stored[0].message).toBe('Test error 14');
      expect(stored[9].message).toBe('Test error 5');
    });
  });

  describe('Orphan Presences Cleaning Logic', () => {
    it('should filter out orphan presences correctly', () => {
      const state = {
        scouts: [{ id: 's1', nome: 'A', cognome: 'B' }],
        activities: [{ id: 'a1', tipo: 'Riunione', data: '2026-09-01' }],
        presences: [
          { id: 'p_valid', esploratoreId: 's1', attivitaId: 'a1' },
          { id: 'p_orphan_scout', esploratoreId: 's_ghost', attivitaId: 'a1' },
          { id: 'p_orphan_act', esploratoreId: 's1', attivitaId: 'a_ghost' }
        ]
      };

      const report = checkDataIntegrity(state);
      const { orphanPresencesNoScout, orphanPresencesNoActivity } = report.summary;
      const orphanIds = new Set([
        ...orphanPresencesNoScout.map(p => p.id || `${p.esploratoreId}_${p.attivitaId}`),
        ...orphanPresencesNoActivity.map(p => p.id || `${p.esploratoreId}_${p.attivitaId}`)
      ]);

      const cleaned = state.presences.filter(p => !orphanIds.has(p.id));
      expect(cleaned.length).toBe(1);
      expect(cleaned[0].id).toBe('p_valid');
    });
  });
});
