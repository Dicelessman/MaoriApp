import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CngeiService } from '../js/services/cngei-service.js';

describe('CNGEI Service & Proxy Client', () => {
  let service;
  let originalFetch;

  beforeEach(() => {
    service = new CngeiService('/api/cngei');
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('dovrebbe istanziare correttamente il servizio con il baseURL del proxy', () => {
    expect(service.baseUrl).toBe('/api/cngei');
  });

  it('checkConnection dovrebbe recuperare e aggregare profilo utente e gruppo/reparto', async () => {
    const mockMe = {
      alias: 'Dave',
      avatar: 'https://example.com/avatar.jpg',
      brevetti: [{ id: 'b1', idTipo: 'WB_CR', tipo: 'Wood Badge Capi Reparto' }]
    };

    const mockGruppi = [
      {
        id: 'g-123',
        numero: 4,
        idSezione: 's-123',
        sezione: { id: 's-123', nome: 'TORINO' },
        unita: [{ id: 'u-rep', tipo: 'REPARTO' }]
      }
    ];

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/persona/me')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify(mockMe))
        });
      }
      if (url.includes('/gruppo')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify(mockGruppi))
        });
      }
      return Promise.reject(new Error('Unknown url: ' + url));
    });

    const status = await service.checkConnection(true);

    expect(status.connected).toBe(true);
    expect(status.user.alias).toBe('Dave');
    expect(status.user.wbcr).toBe(true);
    expect(status.sezione).toBe('TORINO');
    expect(status.gruppo).toBe('Gruppo 4');
    expect(status.unita).toBe('Reparto 4');
    expect(status.idUnita).toBe('u-rep');
  });

  it('checkConnection dovrebbe gestire gli errori restituendo connected: false senza crashare', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error or server down'));

    const status = await service.checkConnection(true);

    expect(status.connected).toBe(false);
    expect(status.error).toContain('Network error');
  });

  it('getMembers dovrebbe mappare correttamente le persone in esploratori e contatti genitori', async () => {
    const mockPersone = [
      {
        id: 'p-1',
        tessera: '12345',
        nome: 'Nora',
        cognome: 'Rossi',
        codiceFiscale: 'RSSNRA13H41D205L',
        dataNascita: '2013-06-01',
        telefono: '3331112233',
        email: 'nora@scout.it',
        nomeGenitore1: 'Mario',
        cognomeGenitore1: 'Rossi',
        telefonoGenitore1: '3401234567',
        emailGenitore1: 'mario@test.it',
        nomeGenitore2: 'Anna',
        cognomeGenitore2: 'Verdi',
        telefonoGenitore2: '3479876543',
        emailGenitore2: 'anna@test.it',
        privacyConsentGranted: true,
        imageRightsConsentGranted: true,
        medicalConsentGranted: true,
        hasSingleParentAttachment: false,
        hasPowerOfAttorney: false,
        incarichiCorrenti: [{ idTipoIncarico: 'E' }]
      }
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(mockPersone))
    });

    const members = await service.getMembers();

    expect(members).toHaveLength(1);
    const m = members[0];
    expect(m.idCngei).toBe('p-1');
    expect(m.nome).toBe('Nora');
    expect(m.isEsploratore).toBe(true);
    expect(m.isStaff).toBe(false);
    expect(m.genitore1.telefono).toBe('3401234567');
    expect(m.consensi.privacy).toBe(true);
    expect(m.consensi.immagini).toBe(true);
  });

  it('setMeetingAttendance dovrebbe inviare PATCH con presentIds e absentIds', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ success: true }))
    });

    await service.setMeetingAttendance('m-1', ['p-1', 'p-2'], ['p-3']);

    expect(global.fetch).toHaveBeenCalledWith('/api/cngei/meetings/m-1/attendance', {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        presentIds: ['p-1', 'p-2'],
        absentIds: ['p-3']
      })
    });
  });

  it('createProgressione dovrebbe inviare POST con idPersona, idProgressioneType e obtainedAt', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      text: () => Promise.resolve('')
    });

    await service.createProgressione('p-1', 'type-po-1', '2026-09-29');

    expect(global.fetch).toHaveBeenCalledWith('/api/cngei/progressioni', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idPersona: 'p-1',
        idProgressioneType: 'type-po-1',
        obtainedAt: '2026-09-29'
      })
    });
  });

  it('createProgressione dovrebbe lanciare un errore se mancano parametri', async () => {
    await expect(service.createProgressione('', 'type', '2026-09-29')).rejects.toThrow();
  });
});
