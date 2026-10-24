/**
 * Tests for Badges (Distintivi PO & PV) integration in Scorte & Materiali inventory page
 * @module tests/distintivi-scorte
 */

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

vi.mock('../js/data/adapters/firestore-adapter.js', () => ({
  FirestoreAdapter: class {
    getScorte = vi.fn().mockResolvedValue([]);
    getListeScorte = vi.fn().mockResolvedValue(['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale']);
    importScorteBatch = vi.fn().mockResolvedValue({ success: true });
    addScorta = vi.fn().mockResolvedValue('new_id');
    updateScorta = vi.fn().mockResolvedValue(true);
  }
}));

import {
  resolveDistintivoBadge,
  OFFICIAL_SPECIALITA_SLUGS,
  OFFICIAL_DISTINTIVI_CATALOG
} from '../js/utils/utils.js';
import '../scorte.js';

describe('Distintivi PO & PV in Scorte & Materiali', () => {

  describe('Risoluzione Immagini Distintivi PO e PV (resolveDistintivoBadge)', () => {
    it('dovrebbe risolvere correttamente le immagini dei distintivi di Progressione Verticale (PV)', () => {
      // Promessa
      const promessa = resolveDistintivoBadge('Promessa');
      expect(promessa).not.toBeNull();
      expect(promessa?.src).toBe('img/passi/promessa.png');
      expect(promessa?.type).toBe('PV');

      const distPromessa = resolveDistintivoBadge('Distintivo della Promessa');
      expect(distPromessa?.src).toBe('img/passi/promessa.png');
      expect(distPromessa?.type).toBe('PV');

      // Giglio e Trifoglio
      const giglio = resolveDistintivoBadge('Giglio e Trifoglio');
      expect(giglio?.src).toBe('img/passi/giglio-trifoglio.png');
      expect(giglio?.type).toBe('PV');

      const distGiglio = resolveDistintivoBadge('Distintivo Giglio');
      expect(distGiglio?.src).toBe('img/passi/giglio-trifoglio.png');

      // Passi
      const passo1 = resolveDistintivoBadge('Passo I');
      expect(passo1?.src).toBe('img/passi/passo1.png');
      expect(passo1?.type).toBe('PV');

      const distPasso1 = resolveDistintivoBadge('Distintivo 1° Passo');
      expect(distPasso1?.src).toBe('img/passi/passo1.png');

      const passo2 = resolveDistintivoBadge('Passo II');
      expect(passo2?.src).toBe('img/passi/passo2.png');
      expect(passo2?.type).toBe('PV');

      const distPasso2 = resolveDistintivoBadge('Distintivo Passo 2');
      expect(distPasso2?.src).toBe('img/passi/passo2.png');

      const passo3 = resolveDistintivoBadge('Passo III');
      expect(passo3?.src).toBe('img/passi/passo3.png');
      expect(passo3?.type).toBe('PV');

      const distPasso3 = resolveDistintivoBadge('Distintivo Terzo Passo');
      expect(distPasso3?.src).toBe('img/passi/passo3.png');
    });

    it('dovrebbe risolvere correttamente le immagini dei distintivi di Specialità (PO)', () => {
      const cucina = resolveDistintivoBadge('Cucina');
      expect(cucina?.src).toBe('img/specialita/cucina.png');
      expect(cucina?.type).toBe('PO');

      const distCucina = resolveDistintivoBadge('Distintivo Cucina');
      expect(distCucina?.src).toBe('img/specialita/cucina.png');

      const specCucina = resolveDistintivoBadge('Specialità Cucina');
      expect(specCucina?.src).toBe('img/specialita/cucina.png');

      const pionierismo = resolveDistintivoBadge('Distintivo Specialità Pionierismo');
      expect(pionierismo?.src).toBe('img/specialita/pionierismo.png');
      expect(pionierismo?.type).toBe('PO');

      const astronomia = resolveDistintivoBadge('Distintivo Astronomia');
      expect(astronomia?.src).toBe('img/specialita/astronomo.png');

      const faidate = resolveDistintivoBadge('Fai da Te');
      expect(faidate?.src).toBe('img/specialita/faidate.png');

      const hebertismo = resolveDistintivoBadge('Hebertismo');
      expect(hebertismo?.src).toBe('img/specialita/herbertismo.png');

      const benessere = resolveDistintivoBadge('Benessere');
      expect(benessere?.src).toBe('img/specialita/wellbeing.png');
    });

    it('dovrebbe restituire null per materiali generici non correlati a distintivi', () => {
      expect(resolveDistintivoBadge('Picchetti tenda a V')).toBeNull();
      expect(resolveDistintivoBadge('Cordino 6mm canapa')).toBeNull();
      expect(resolveDistintivoBadge('Disinfettante spray 250ml')).toBeNull();
      expect(resolveDistintivoBadge('Telo occhiellato 4x5m')).toBeNull();
      expect(resolveDistintivoBadge('')).toBeNull();
      expect(resolveDistintivoBadge(null)).toBeNull();
    });

    it('dovrebbe includere nel catalogo ufficiale tutti i distintivi PO e PV', () => {
      expect(OFFICIAL_DISTINTIVI_CATALOG.length).toBeGreaterThanOrEqual(64);
      const pvBadges = OFFICIAL_DISTINTIVI_CATALOG.filter(b => b.tipo === 'PV');
      const poBadges = OFFICIAL_DISTINTIVI_CATALOG.filter(b => b.tipo === 'PO');

      expect(pvBadges.length).toBe(5);
      expect(poBadges.length).toBe(61); // 57 specialita + 4 ambiti

      // Ogni elemento del catalogo deve avere un'immagine valida
      OFFICIAL_DISTINTIVI_CATALOG.forEach(badge => {
        expect(badge.img).toMatch(/\.png$/);
        expect(badge.nome).toBeTruthy();
        expect(badge.prezzoDefault).toBeGreaterThan(0);
      });
    });
  });

  describe('Integrazione UI e Rendering Lista Distintivi in scorte.js', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="listeTabsContainer"></div>
        <div id="activeListActions">
          <button id="initOfficialDistintiviBtn" class="hidden"></button>
        </div>
        <table>
          <tbody id="scorteTableBody"></tbody>
          <tfoot id="scorteTableFoot"></tfoot>
        </table>
        <span id="kpiTotalItemsLabel"></span>
        <span id="kpiTotalItems"></span>
        <span id="kpiCategoriesCount"></span>
        <span id="kpiToRestockItems"></span>
        <span id="kpiToRestockUnits"></span>
        <span id="kpiRestockCostLabel"></span>
        <span id="kpiRestockTotalCost"></span>
        <span id="kpiRestockCostSub"></span>
        <span id="kpiInventoryDate"></span>
        <div id="scorteFilterSummary"></div>

        <!-- Material Modal Preview -->
        <div id="materialModal" class="hidden">
          <input id="materialNome" />
          <input id="materialLista" />
          <input id="materialCategoria" />
          <input id="materialPrezzo" />
          <div id="materialBadgePreviewContainer" class="hidden">
            <img id="materialBadgePreviewImg" src="" />
            <span id="materialBadgePreviewLabel"></span>
            <span id="materialBadgePreviewType"></span>
          </div>
        </div>
      `;

      UI._scorteState = {
        items: [
          {
            id: 'dist_1',
            nome: 'Passo I',
            categoria: 'Progressione Verticale',
            lista: 'Distintivi',
            quantita: 4,
            quantitaMinima: 10,
            prezzoUnitario: 2.50
          },
          {
            id: 'dist_2',
            nome: 'Specialità Cucina',
            categoria: 'Specialità Verdi',
            lista: 'Distintivi',
            quantita: 1,
            quantitaMinima: 5,
            prezzoUnitario: 2.50
          },
          {
            id: 'gen_1',
            nome: 'Picchetti tenda',
            categoria: 'Campeggio',
            lista: 'Campo Estivo',
            quantita: 20,
            quantitaMinima: 50,
            prezzoUnitario: 1.20
          }
        ],
        lists: ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'],
        activeList: 'Distintivi',
        search: '',
        category: '',
        status: 'all',
        sort: 'categoria_nome'
      };
    });

    it('dovrebbe renderizzare l\'immagine corrispondente del distintivo PV nella tabella principale', () => {
      UI.renderScorte();

      const tbody = document.getElementById('scorteTableBody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(2); // Solo i due distintivi poiché activeList === 'Distintivi'

      const passoRow = rows[0];
      expect(passoRow.textContent).toContain('Passo I');
      const imgPasso = passoRow.querySelector('img');
      expect(imgPasso).not.toBeNull();
      expect(imgPasso?.getAttribute('src')).toBe('img/passi/passo1.png');
      expect(passoRow.textContent).toContain('PV');
    });

    it('dovrebbe renderizzare l\'immagine corrispondente del distintivo PO nella tabella principale', () => {
      UI.renderScorte();

      const tbody = document.getElementById('scorteTableBody');
      const rows = tbody.querySelectorAll('tr');

      const cucinaRow = rows[1];
      expect(cucinaRow.textContent).toContain('Specialità Cucina');
      const imgCucina = cucinaRow.querySelector('img');
      expect(imgCucina).not.toBeNull();
      expect(imgCucina?.getAttribute('src')).toBe('img/specialita/cucina.png');
      expect(cucinaRow.textContent).toContain('PO');
    });

    it('dovrebbe aggiornare l\'anteprima dinamica del distintivo durante l\'inserimento nel modal', () => {
      const nomeInput = document.getElementById('materialNome');
      const container = document.getElementById('materialBadgePreviewContainer');
      const img = document.getElementById('materialBadgePreviewImg');
      const label = document.getElementById('materialBadgePreviewLabel');
      const type = document.getElementById('materialBadgePreviewType');

      // Inserisci Promessa
      nomeInput.value = 'Distintivo Promessa';
      UI.updateMaterialBadgePreview();

      expect(container.classList.contains('hidden')).toBe(false);
      expect(img.getAttribute('src')).toBe('img/passi/promessa.png');
      expect(label.textContent).toBe('Promessa');
      expect(type.textContent).toContain('PV');

      // Cambia in Pionierismo
      nomeInput.value = 'Pionierismo';
      UI.updateMaterialBadgePreview();

      expect(container.classList.contains('hidden')).toBe(false);
      expect(img.getAttribute('src')).toBe('img/specialita/pionierismo.png');
      expect(label.textContent).toBe('Pionierismo');
      expect(type.textContent).toContain('PO');

      // Nome generico non distintivo
      nomeInput.value = 'Corda da roccia';
      UI.updateMaterialBadgePreview();
      expect(container.classList.contains('hidden')).toBe(true);
    });
  });
});
