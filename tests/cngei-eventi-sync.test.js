import { describe, it, expect } from 'vitest';
import {
  classifyCngeiEventType,
  findMatchingExistingActivity,
  prepareEventActivityPayload,
  filterAndSortCngeiEvents
} from '../js/services/cngei-eventi-sync.js';

describe('CNGEI Eventi Sync (Passo 6)', () => {
  const mockEvents = [
    {
      id: 'ev-camp-2027',
      nome: 'Campo Nazionale 2027 - Preiscrizione Reparti',
      descrizione: 'Iscrizione reparti al campo',
      inizioEvento: '2027-08-02',
      fineEvento: '2027-08-13',
      tipo: 'ADULTI'
    },
    {
      id: 'ev-jam-2027',
      nome: 'Jamboree 2027- Esplo/Rover',
      descrizione: 'Jamboree mondiale',
      inizioEvento: '2027-07-29',
      fineEvento: '2027-08-09',
      tipo: 'GIOVANI'
    },
    {
      id: 'ev-setup-2026',
      nome: 'Officine Setup 2026',
      descrizione: 'Formazione quadri',
      inizioEvento: '2026-10-15',
      fineEvento: '2026-10-17',
      tipo: 'ADULTI'
    }
  ];

  it('classifyCngeiEventType assegna il tipo MaoriApp appropriato', () => {
    expect(classifyCngeiEventType(mockEvents[0])).toBe('Campo');
    expect(classifyCngeiEventType(mockEvents[1])).toBe('Campo');
    expect(classifyCngeiEventType(mockEvents[2])).toBe('Evento Adulti');
    expect(classifyCngeiEventType({ nome: 'Uscita di sezione', tipo: 'GIOVANI' })).toBe('Uscita');
  });

  it('findMatchingExistingActivity rileva attività già importate tramite idEventoCngei o nome+data', () => {
    const existing = [
      { id: 'a1', idEventoCngei: 'ev-camp-2027', data: '2027-08-02', descrizione: 'Campo Nazionale' },
      { id: 'a2', data: '2026-10-15', descrizione: 'Officine Setup 2026' }
    ];

    const match1 = findMatchingExistingActivity(mockEvents[0], existing);
    expect(match1?.id).toBe('a1');

    const match2 = findMatchingExistingActivity(mockEvents[2], existing);
    expect(match2?.id).toBe('a2');

    const match3 = findMatchingExistingActivity(mockEvents[1], existing);
    expect(match3).toBeNull();
  });

  it('prepareEventActivityPayload crea un payload coerente con le attività del calendario', () => {
    const payload = prepareEventActivityPayload(mockEvents[1]);
    expect(payload.tipo).toBe('Campo');
    expect(payload.data).toBe('2027-07-29');
    expect(payload.dataFine).toBe('2027-08-09');
    expect(payload.descrizione).toBe('Jamboree 2027- Esplo/Rover');
    expect(payload.costo).toBe(0);
    expect(payload.idEventoCngei).toBe('ev-jam-2027');
    expect(payload.note).toBe('Jamboree mondiale');
  });

  it('filterAndSortCngeiEvents ordina cronologicamente e filtra per tipo', () => {
    const sorted = filterAndSortCngeiEvents(mockEvents);
    expect(sorted[0].id).toBe('ev-setup-2026'); // 2026 first
    expect(sorted[1].id).toBe('ev-jam-2027');

    const onlyGiovani = filterAndSortCngeiEvents(mockEvents, { tipoFilter: 'GIOVANI' });
    expect(onlyGiovani).toHaveLength(1);
    expect(onlyGiovani[0].id).toBe('ev-jam-2027');
  });
});
