/**
 * Test per Flusso Registrazione Utenti e Richieste di Accesso
 * - Ruolo di default Esploratore (accesso immediato)
 * - Ruoli CR e VCR soggetti ad approvazione Admin
 * - Approvazione e rifiuto richieste
 * - Visualizzazione ed elenchi su staff
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';

describe('Flusso Registrazione Utenti & Richieste di Accesso', () => {
  let adapter;
  let mockLocalStorage;

  beforeEach(() => {
    mockLocalStorage = {};
    global.localStorage = {
      getItem: vi.fn((key) => mockLocalStorage[key] || null),
      setItem: vi.fn((key, value) => { mockLocalStorage[key] = value; }),
      removeItem: vi.fn((key) => { delete mockLocalStorage[key]; }),
      clear: vi.fn(() => { mockLocalStorage = {}; })
    };
    adapter = new LocalAdapter();
  });

  describe('Creazione Account & Ruoli', () => {
    it('dovrebbe registrare un nuovo utente con ruolo di default "Esploratore" come auto-approvato e aggiungerlo subito allo staff', async () => {
      const initialStaffCount = adapter.state.staff.length;

      const reqId = await adapter.addAccessRequest({
        nome: 'Marco',
        cognome: 'Verdi',
        email: 'marco.verdi@scout.it',
        ruoloRichiesto: 'Esploratore',
        uid: 'uid_test_esploratore'
      });

      expect(reqId).toBeDefined();

      const requests = await adapter.getAccessRequests();
      const createdReq = requests.find(r => r.id === reqId);
      expect(createdReq).toBeDefined();
      expect(createdReq.status).toBe('approved');
      expect(createdReq.ruoloRichiesto).toBe('Esploratore');

      // Verifica che sia stato aggiunto immediatamente a staff
      expect(adapter.state.staff.length).toBe(initialStaffCount + 1);
      const newStaff = adapter.state.staff.find(s => s.email === 'marco.verdi@scout.it');
      expect(newStaff).toBeDefined();
      expect(newStaff.ruolo).toBe('Esploratore');
      expect(newStaff.autoApproved).toBe(true);
    });

    it('dovrebbe impostare status "pending" per registrazioni con ruolo CR (soggetto ad approvazione Admin)', async () => {
      const initialStaffCount = adapter.state.staff.length;

      const reqId = await adapter.addAccessRequest({
        nome: 'Paolo',
        cognome: 'Rossi',
        email: 'paolo.cr@scout.it',
        ruoloRichiesto: 'CR',
        uid: 'uid_test_cr'
      });

      const requests = await adapter.getAccessRequests();
      const createdReq = requests.find(r => r.id === reqId);
      expect(createdReq).toBeDefined();
      expect(createdReq.status).toBe('pending');
      expect(createdReq.ruoloRichiesto).toBe('CR');

      // NON deve essere aggiunto subito allo staff
      const staffMember = adapter.state.staff.find(s => s.email === 'paolo.cr@scout.it');
      expect(staffMember).toBeUndefined();
      expect(adapter.state.staff.length).toBe(initialStaffCount);
    });

    it('dovrebbe impostare status "pending" per registrazioni con ruolo VCR (soggetto ad approvazione Admin)', async () => {
      const initialStaffCount = adapter.state.staff.length;

      const reqId = await adapter.addAccessRequest({
        nome: 'Anna',
        cognome: 'Bianchi',
        email: 'anna.vcr@scout.it',
        ruoloRichiesto: 'VCR',
        uid: 'uid_test_vcr'
      });

      const requests = await adapter.getAccessRequests();
      const createdReq = requests.find(r => r.id === reqId);
      expect(createdReq.status).toBe('pending');
      expect(createdReq.ruoloRichiesto).toBe('VCR');
      expect(adapter.state.staff.length).toBe(initialStaffCount);
    });
  });

  describe('Approvazione e Rifiuto da parte degli Admin', () => {
    it('un admin deve poter approvare una richiesta pending: crea profilo staff e aggiorna status', async () => {
      const reqId = await adapter.addAccessRequest({
        nome: 'Giorgio',
        cognome: 'Neri',
        email: 'giorgio.cr@scout.it',
        ruoloRichiesto: 'CR',
        uid: 'uid_giorgio'
      });

      const adminUser = { email: 'admin@scoutmaori.it', uid: 'admin_123' };
      await adapter.approveAccessRequest(reqId, adminUser);

      // Verifica status richiesta
      const requests = await adapter.getAccessRequests();
      const req = requests.find(r => r.id === reqId);
      expect(req.status).toBe('approved');
      expect(req.approvedBy).toBe('admin@scoutmaori.it');

      // Verifica che ora sia in staff
      const staffMember = adapter.state.staff.find(s => s.email === 'giorgio.cr@scout.it');
      expect(staffMember).toBeDefined();
      expect(staffMember.nome).toBe('Giorgio');
      expect(staffMember.cognome).toBe('Neri');
      expect(staffMember.ruolo).toBe('CR');
    });

    it('un admin deve poter rifiutare una richiesta pending con motivazione opzionale', async () => {
      const reqId = await adapter.addAccessRequest({
        nome: 'Sconosciuto',
        cognome: 'Utente',
        email: 'fake@scout.it',
        ruoloRichiesto: 'CR',
        uid: 'uid_fake'
      });

      const adminUser = { email: 'admin@scoutmaori.it' };
      await adapter.rejectAccessRequest(reqId, 'Email non riconosciuta nella Sezione', adminUser);

      const requests = await adapter.getAccessRequests();
      const req = requests.find(r => r.id === reqId);
      expect(req.status).toBe('rejected');
      expect(req.rejectedBy).toBe('admin@scoutmaori.it');
      expect(req.rejectReason).toBe('Email non riconosciuta nella Sezione');

      // Non deve essere stato inserito in staff
      const staffMember = adapter.state.staff.find(s => s.email === 'fake@scout.it');
      expect(staffMember).toBeUndefined();
    });

    it('lancia errore se si approva o rifiuta una richiesta inesistente', async () => {
      await expect(adapter.approveAccessRequest('non_existent_id')).rejects.toThrow('Richiesta non trovata');
      await expect(adapter.rejectAccessRequest('non_existent_id', 'motivo')).rejects.toThrow('Richiesta non trovata');
    });
  });

  describe('Ordinamento e Filtri per elenco staff.html', () => {
    it('l\'elenco richieste deve contenere elementi pending e approvati', async () => {
      const requests = await adapter.getAccessRequests();
      expect(Array.isArray(requests)).toBe(true);
      expect(requests.length).toBeGreaterThanOrEqual(2);

      const hasPending = requests.some(r => r.status === 'pending');
      const hasApproved = requests.some(r => r.status === 'approved');
      expect(hasPending).toBe(true);
      expect(hasApproved).toBe(true);
    });
  });
});
