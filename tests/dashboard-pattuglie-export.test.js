import { describe, it, expect, beforeEach, vi } from 'vitest';

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

import { UI } from '../js/ui/ui.js';
import { cngeiService } from '../js/services/cngei-service.js';
import '../dashboard.js';

describe('Dashboard - Esploratori per Pattuglia & Export CNGEI PO/PV', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="pattuglieTable">
        <table>
          <tbody id="pattuglieTableBody"></tbody>
        </table>
      </div>
      <button id="btnExportCngeiProgressioniReparto"></button>
      <div id="cngeiRepartoProgressioniModal" class="modal hidden">
        <button id="closeRepartoProgModalBtn"></button>
        <button id="cancelRepartoProgModalBtn"></button>
        <button id="tabPendingProgBtn"></button>
        <button id="tabSyncedProgBtn"></button>
        <span id="tabPendingCount"></span>
        <span id="tabSyncedCount"></span>
        <button id="repartoProgSelectAllBtn"></button>
        <button id="repartoProgExportCsvBtn"></button>
        <div id="repartoProgPendingContainer"></div>
        <div id="repartoProgSyncedContainer" class="hidden"></div>
        <div id="repartoProgTotalCount"></div>
        <div id="repartoProgBreakdown"></div>
        <div id="repartoProgScoutsCount"></div>
        <div id="repartoProgSyncedCount"></div>
        <div id="repartoProgWarningBanner" class="hidden"></div>
        <div id="repartoProgProgressContainer" class="hidden">
          <span id="repartoProgProgressLabel"></span>
          <span id="repartoProgProgressPct"></span>
          <div id="repartoProgProgressBar"></div>
        </div>
        <button id="confirmSendRepartoProgBtn"></button>
        <span id="confirmSendRepartoProgBtnText"></span>
      </div>
    `;

    UI.state = {
      scouts: [
        {
          id: 's1',
          nome: 'Mario',
          cognome: 'Rossi',
          pv_pattuglia: 'Aquile',
          idCngei: 'cngei-mario',
          specialita: [
            { nome: 'Fuochismo', ottenuta: true, data: '2025-04-10' },
            { nome: 'Campismo', ottenuta: true, data: '2025-05-12' }
          ],
          pv_traccia1: { done: true, data: '2025-02-15' }
        },
        {
          id: 's2',
          nome: 'Lucia',
          cognome: 'Bianchi',
          pv_pattuglia: 'Lupi',
          idCngei: null, // Senza ID CNGEI
          specialita: [
            { nome: 'Nuoto', ottenuta: false, data: '' }
          ]
        }
      ]
    };
  });

  it('UI.renderPattuglieTable dovrebbe mostrare sia il conteggio che i nomi delle specialità conquistate', () => {
    UI.renderPattuglieTable();

    const tbody = document.getElementById('pattuglieTableBody');
    expect(tbody).not.toBeNull();
    const html = tbody.innerHTML;

    // Mario ha 2 specialità conquistate: Fuochismo e Campismo
    expect(html).toContain('Mario Rossi');
    expect(html).toContain('Fuochismo');
    expect(html).toContain('Campismo');
    expect(html).toContain('2'); // count badge

    // Lucia ha 0 specialità conquistate
    expect(html).toContain('Lucia Bianchi');
    expect(html).toContain('0');
  });

  it('UI.setupRepartoProgressioniEvents e UI.openCngeiRepartoProgressioniModal dovrebbero caricare le progressioni PO e PV', async () => {
    vi.spyOn(cngeiService, 'getProgressioniTypes').mockResolvedValue([
      { id: 'type-fuochismo', name: 'Fuochismo', branca: 'E', kind: 'PO' },
      { id: 'type-campismo', name: 'Campismo', branca: 'E', kind: 'PO' },
      { id: 'type-traccia-1', name: 'Traccia 1', branca: 'E', kind: 'PV' }
    ]);

    UI.setupRepartoProgressioniEvents();
    await UI.openCngeiRepartoProgressioniModal();

    const totalCountEl = document.getElementById('repartoProgTotalCount');
    const breakdownEl = document.getElementById('repartoProgBreakdown');
    const pendingContainer = document.getElementById('repartoProgPendingContainer');

    // Mario ha Fuochismo, Campismo e Traccia 1 da inviare = 3 progressioni
    expect(totalCountEl.textContent).toBe('3');
    expect(breakdownEl.textContent).toContain('2 PO (Specialità) • 1 PV (Tracce)');
    expect(pendingContainer.innerHTML).toContain('Fuochismo');
    expect(pendingContainer.innerHTML).toContain('Campismo');
    expect(pendingContainer.innerHTML).toContain('Traccia 1');
    expect(pendingContainer.innerHTML).toContain('Aquile');
  });

  it('UI.exportRepartoProgressioniCsv dovrebbe generare correttamente un file CSV con PO e PV', () => {
    const items = [
      {
        scoutName: 'Mario Rossi',
        pattuglia: 'Aquile',
        idCngei: 'cngei-mario',
        category: 'Specialità (PO)',
        name: 'Fuochismo',
        obtainedAt: '2025-04-10',
        isSynced: false
      },
      {
        scoutName: 'Mario Rossi',
        pattuglia: 'Aquile',
        idCngei: 'cngei-mario',
        category: 'Traccia (PV)',
        name: 'Traccia 1',
        obtainedAt: '2025-02-15',
        isSynced: true,
        cngeiId: 'pv-id-123'
      }
    ];

    const createObjectURLSpy = vi.fn().mockReturnValue('blob:mock-csv-url');
    const revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    UI.showToast = vi.fn();

    UI.exportRepartoProgressioniCsv(items);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
    expect(UI.showToast).toHaveBeenCalledWith(expect.stringContaining('CSV'));
  });
});
