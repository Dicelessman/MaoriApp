import { describe, it, expect, vi } from 'vitest';
import {
  prepareMeetingPayload,
  prepareAttendancePayload,
  syncActivityToCngei
} from '../js/services/cngei-meeting-sync.js';

describe('CNGEI Meeting & Attendance Sync (Passo 4)', () => {
  const compagineId = '3f8af8e5-2011-4269-b071-18b240f1b672';

  it('prepareMeetingPayload dovrebbe formattare correttamente titolo, date ISO e compagine', () => {
    const activity = {
      id: 'a1',
      tipo: 'Uscita',
      descrizione: 'Passaggi e inizio anno',
      data: '2026-10-03',
      dataFine: '2026-10-04'
    };

    const payload = prepareMeetingPayload(activity, compagineId);

    expect(payload.idCompagine).toBe(compagineId);
    expect(payload.title).toBe('Uscita — Passaggi e inizio anno');
    expect(payload.description).toBe('Passaggi e inizio anno');
    expect(payload.adultOnly).toBe(false);
    expect(payload.startDateTime).toContain('2026-10-03');
    expect(payload.endDateTime).toContain('2026-10-04');
  });

  it('prepareAttendancePayload dovrebbe mappare le presenze solo per gli esploratori collegati a idCngei', () => {
    const activityId = 'a1';
    const scouts = [
      { id: 's1', nome: 'Nora', cognome: 'Peyrachia', idCngei: 'cngei-uuid-nora' },
      { id: 's2', nome: 'Leo', cognome: 'Ferrari', idCngei: 'cngei-uuid-leo' },
      { id: 's3', nome: 'Mario', cognome: 'Rossi' } // senza idCngei
    ];
    const presences = [
      { esploratoreId: 's1', attivitaId: 'a1', stato: 'Presente' },
      { esploratoreId: 's2', attivitaId: 'a1', stato: 'Assente' },
      { esploratoreId: 's3', attivitaId: 'a1', stato: 'Presente' }
    ];

    const result = prepareAttendancePayload(activityId, presences, scouts);

    expect(result.presentIds).toEqual(['cngei-uuid-nora']);
    expect(result.absentIds).toEqual(['cngei-uuid-leo']);
    expect(result.unlinkedScouts).toHaveLength(1);
    expect(result.unlinkedScouts[0].nome).toBe('Mario');
  });

  it('syncActivityToCngei dovrebbe creare il meeting e registrare le presenze via PATCH', async () => {
    const activity = {
      id: 'a1',
      tipo: 'Riunione',
      descrizione: 'Tecnica scout',
      data: '2026-10-10'
    };
    const scouts = [
      { id: 's1', nome: 'Nora', cognome: 'Peyrachia', idCngei: 'cngei-uuid-nora' }
    ];
    const presences = [
      { esploratoreId: 's1', attivitaId: 'a1', stato: 'Presente' }
    ];

    const mockService = {
      getMeetings: vi.fn().mockResolvedValue([]),
      createMeeting: vi.fn().mockResolvedValue({ id: 'm-created-uuid' }),
      setMeetingAttendance: vi.fn().mockResolvedValue({ success: true })
    };

    const res = await syncActivityToCngei(activity, presences, scouts, compagineId, mockService);

    expect(mockService.createMeeting).toHaveBeenCalled();
    expect(mockService.setMeetingAttendance).toHaveBeenCalledWith('m-created-uuid', ['cngei-uuid-nora'], []);
    expect(res.meetingId).toBe('m-created-uuid');
    expect(res.presentCount).toBe(1);
    expect(res.absentCount).toBe(0);
  });

  it('syncActivityToCngei dovrebbe aggiornare un meeting già esistente senza ricrearlo', async () => {
    const activity = {
      id: 'a1',
      idMeetingCngei: 'm-existing-uuid',
      tipo: 'Riunione',
      descrizione: 'Verifica',
      data: '2026-10-10'
    };
    const scouts = [
      { id: 's1', nome: 'Nora', cognome: 'Peyrachia', idCngei: 'cngei-uuid-nora' }
    ];
    const presences = [
      { esploratoreId: 's1', attivitaId: 'a1', stato: 'Assente' }
    ];

    const mockService = {
      getMeetings: vi.fn(),
      createMeeting: vi.fn(),
      setMeetingAttendance: vi.fn().mockResolvedValue({ success: true })
    };

    const res = await syncActivityToCngei(activity, presences, scouts, compagineId, mockService);

    expect(mockService.createMeeting).not.toHaveBeenCalled();
    expect(mockService.setMeetingAttendance).toHaveBeenCalledWith('m-existing-uuid', [], ['cngei-uuid-nora']);
    expect(res.meetingId).toBe('m-existing-uuid');
    expect(res.absentCount).toBe(1);
  });
});
