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

    it('dovrebbe risolvere correttamente le immagini dei distintivi di Traccia (PV)', () => {
      const scopro = resolveDistintivoBadge('I Traccia - Scopro');
      expect(scopro?.src).toBe('img/passi/traccia-scopro.jpg');
      expect(scopro?.type).toBe('PV');

      const conosco = resolveDistintivoBadge('Traccia Conosco');
      expect(conosco?.src).toBe('img/passi/traccia-conosco.jpg');

      const condivido = resolveDistintivoBadge('III Traccia');
      expect(condivido?.src).toBe('img/passi/traccia-condivido.jpg');

      const interiorizzo = resolveDistintivoBadge('Traccia Interiorizzo');
      expect(interiorizzo?.src).toBe('img/passi/traccia-interiorizzo.jpg');
    });

    it('dovrebbe risolvere correttamente le Specialità di Pattuglia (PO) e Distintivi Associativi/Reparto', () => {
      const astuzia = resolveDistintivoBadge('Spec. Pattuglia Astuzia al Campo');
      expect(astuzia?.src).toBe('img/specialita/specialita-ptg-astuzia.jpg');
      expect(astuzia?.type).toBe('PO');

      const cooperazione = resolveDistintivoBadge('Cooperazione scout');
      expect(cooperazione?.src).toBe('img/specialita/specialita-ptg-cooperazione.jpg');

      const cngei = resolveDistintivoBadge('Distintivo CNGEI');
      expect(cngei?.src).toBe('img/passi/CNGEI.png');
      expect(cngei?.type).toBe('Distintivo');

      const fis = resolveDistintivoBadge('Distintivo F.I.S.');
      expect(fis?.src).toBe('img/passi/fis.jpg');
      expect(fis?.type).toBe('Distintivo');

      const wosm = resolveDistintivoBadge('Distintivo WOSM');
      expect(wosm?.src).toBe('img/passi/wosm.jpg');

      const wagggs = resolveDistintivoBadge('Distintivo WAGGGS');
      expect(wagggs?.src).toBe('img/passi/wagggs.jpg');

      const specialista = resolveDistintivoBadge('Specialista');
      expect(specialista?.src).toBe('img/passi/specialista.png');

      const barretta = resolveDistintivoBadge('Barretta d\'Incarico');
      expect(barretta?.src).toBe('img/passi/barretta incarico.png');

      const nautico = resolveDistintivoBadge('Scout Nautico');
      expect(nautico?.src).toBe('img/passi/scout-nautico.jpg');

      const spilletta = resolveDistintivoBadge('Spilletta dell\'Impegno');
      expect(spilletta?.src).toBe('img/passi/spilletta-impegno.jpg');
    });

    it('dovrebbe includere nel catalogo ufficiale tutti i distintivi PO, PV e Associativi con i prezzi ufficiali dell\'eshop CNGEI', () => {
      expect(OFFICIAL_DISTINTIVI_CATALOG.length).toBeGreaterThanOrEqual(80);
      const pvBadges = OFFICIAL_DISTINTIVI_CATALOG.filter(b => b.tipo === 'PV');
      const poBadges = OFFICIAL_DISTINTIVI_CATALOG.filter(b => b.tipo === 'PO');
      const distBadges = OFFICIAL_DISTINTIVI_CATALOG.filter(b => b.tipo === 'Distintivo');

      expect(pvBadges.length).toBe(9); // 5 passi/promessa + 4 tracce
      expect(poBadges.length).toBe(65); // 57 specialita + 4 ambiti + 4 specialita di pattuglia
      expect(distBadges.length).toBe(8); // CNGEI, FIS, WOSM, WAGGGS, barretta, specialista, nautico, spilletta

      // Verifica prezzi ufficiali
      const promessa = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome === 'Promessa');
      expect(promessa?.prezzoDefault).toBe(1.20);

      const passo1 = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome === 'Passo I');
      expect(passo1?.prezzoDefault).toBe(1.20);

      const scopro = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome.includes('Scopro'));
      expect(scopro?.prezzoDefault).toBe(1.50);

      const cucina = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome === 'Cucina');
      expect(cucina?.prezzoDefault).toBe(1.00);

      const pionierismo = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome === 'Pionierismo');
      expect(pionierismo?.prezzoDefault).toBe(1.00);

      const specPtg = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome.includes('Astuzia'));
      expect(specPtg?.prezzoDefault).toBe(2.00);

      const fisBadge = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome.includes('F.I.S.'));
      expect(fisBadge?.prezzoDefault).toBe(1.50);

      const spillettaBadge = OFFICIAL_DISTINTIVI_CATALOG.find(b => b.nome.includes('Spilletta'));
      expect(spillettaBadge?.prezzoDefault).toBe(4.00);

      // Ogni elemento del catalogo deve avere un'immagine valida (.png o .jpg)
      OFFICIAL_DISTINTIVI_CATALOG.forEach(badge => {
        expect(badge.img).toMatch(/\.(png|jpg|jpeg|webp)$/);
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
