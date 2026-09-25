/**
 * Tests for integration between Scorte (Inventory) and Preventivo Attività / Campo
 * @module tests/preventivo-scorte
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';
import { UI } from '../preventivo.js';

describe('Collegamento Scorte -> Preventivo Uscita/Campo', () => {
    let adapter;

    beforeEach(() => {
        localStorage.clear();
        adapter = new LocalAdapter();
        globalThis.DATA = adapter;

        // Setup mock DOM elements for preventivo
        document.body.innerHTML = `
            <select id="selectActivity"></select>
            <input type="number" id="scoutsCount" value="20">
            <input type="number" id="staffCount" value="4">
            <span id="totalParticipantsDisplay">24</span>
            <button id="printBudgetBtn"></button>
            <button id="saveBudgetBtn"></button>
            <div id="transportLegsList"></div>
            <button id="addLegBtn"></button>
            <input type="number" id="structNights" value="0">
            <input type="number" id="structDays" value="0">
            <select id="structRateType"><option value="person_night">person_night</option></select>
            <input type="number" id="structRate" value="0">
            <input type="number" id="elecStart" value="0">
            <input type="number" id="elecEnd" value="0">
            <input type="number" id="elecRate" value="0">
            <input type="number" id="gasStart" value="0">
            <input type="number" id="gasEnd" value="0">
            <input type="number" id="gasRate" value="0">
            <input type="radio" name="galleyMode" value="meal" checked>
            <input type="radio" name="galleyMode" value="day">
            <input type="number" id="galleyQty" value="0">
            <input type="number" id="galleyRate" value="0">
            <input type="checkbox" id="compActive">
            <input type="number" id="compBudget" value="0">
            <span id="galleyQtyLabel"></span>
            <span id="galleyRateLabel"></span>
            <div id="variousItemsList"></div>
            <button id="addVarBtn"></button>
            <select id="newVarCat"><option value="Materiale">Materiale</option></select>
            <input type="text" id="newVarDesc">
            <input type="number" id="newVarCost">
            <button id="openImportScorteBtn"></button>
            <button id="clearScorteItemsBtn" class="hidden"></button>
            <span id="sumTransport"></span>
            <span id="sumStructure"></span>
            <span id="sumGalley"></span>
            <span id="sumVarious"></span>
            <span id="finalTotalCost"></span>
            <span id="finalCostPerScout"></span>
            <span id="transportTotalBadge"></span>
            <span id="structureTotalBadge"></span>
            <span id="galleyTotalBadge"></span>
            <span id="variousTotalBadge"></span>
            <input type="number" id="proposedQuota" value="0">
            <span id="marginDisplay"></span>
            <table><tbody id="simulationTableBody"></tbody></table>
            <button id="applyBreakEvenQuotaBtn"></button>
            <span id="exactCostPerScoutText"></span>

            <!-- Modal Scorte -->
            <div id="importScorteModal" class="hidden">
                <select id="importScorteListSelect"></select>
                <input type="text" id="importScorteSearchInput">
                <input type="checkbox" id="importScorteReorderOnlyToggle" checked>
                <button id="importScorteSelectAllBtn"></button>
                <button id="importScorteDeselectAllBtn"></button>
                <input type="checkbox" id="importScorteTableCheckAll">
                <table><tbody id="importScorteTableBody"></tbody></table>
                <span id="importScorteSelectedCountBadge"></span>
                <span id="importScorteTotalCostBadge"></span>
                <span id="importScorteQuotaImpactBadge"></span>
                <span id="importScorteScoutsCountHint"></span>
                <input type="radio" name="importScorteGrouped" value="detailed" checked>
                <input type="radio" name="importScorteGrouped" value="grouped">
                <button id="closeImportScorteModalBtn"></button>
                <button id="cancelImportScorteBtn"></button>
                <button id="confirmImportScorteBtn"><span id="confirmImportScorteBtnText"></span></button>
            </div>
        `;

        UI.state = {
            activities: [
                { id: 'act_campo_estivo_1', tipo: 'Campo Estivo', descrizione: 'Campo Estivo Val Venosta 2026', data: '2026-08-01' },
                { id: 'act_uscita_1', tipo: 'Uscita', descrizione: 'Uscita di Apertura', data: '2026-10-10' }
            ],
            scouts: [],
            staff: []
        };

        UI.initBudgetCalculator();

        UI.budgetState.activityId = 'act_campo_estivo_1';
        UI.budgetState.scoutsCount = 20;
        UI.budgetState.staffCount = 4;
        UI.els.scoutsCount.value = '20';
        UI.els.staffCount.value = '4';
    });

    it('dovrebbe inizializzare e collegare i bottoni e gli elementi per l\'importazione da scorte', () => {
        expect(UI.els.openImportScorteBtn).toBeDefined();
        expect(UI.els.clearScorteItemsBtn).toBeDefined();
        expect(UI.els.importScorteModal).toBeDefined();
        expect(UI.els.importScorteListSelect).toBeDefined();
    });

    it('dovrebbe aprire la modale scorte e selezionare la lista tematica "Campo Estivo" in base all\'attività', async () => {
        await UI.openImportScorteModal();

        expect(document.getElementById('importScorteModal').classList.contains('hidden')).toBe(false);
        expect(UI._scorteImportState).toBeDefined();
        expect(UI._scorteImportState.selectedList).toBe('Campo Estivo');
        expect(UI._scorteImportState.lists).toContain('Campo Estivo');
        expect(UI._scorteImportState.items.length).toBeGreaterThan(0);
    });

    it('dovrebbe pre-selezionare solo gli articoli sotto scorta calcolando la quantità mancante e il costo', async () => {
        await UI.openImportScorteModal();

        // Nelle scorte di default:
        // Picchetti: quantita 24, quantitaMinima 50, diff = 26, prezzo = 1.20 => costo = 31.20
        // Cordino: quantita 4, quantitaMinima 10, diff = 6, prezzo = 8.50 => costo = 51.00
        // Totale Campo Estivo da riordinare = 31.20 + 51.00 = 82.20
        const picchetti = UI._scorteImportState.items.find(i => i.nome.includes('Picchetti'));
        const cordino = UI._scorteImportState.items.find(i => i.nome.includes('Cordino'));

        expect(UI._scorteImportState.selectedIds.has(picchetti.id)).toBe(true);
        expect(UI._scorteImportState.selectedIds.has(cordino.id)).toBe(true);
        expect(UI._scorteImportState.quantities[picchetti.id]).toBe(26);
        expect(UI._scorteImportState.quantities[cordino.id]).toBe(6);

        // Disinfettante ha quantita 5, min 5 -> non sotto scorta, non pre-selezionato
        const disinfettante = UI._scorteImportState.items.find(i => i.nome.includes('Disinfettante'));
        expect(UI._scorteImportState.selectedIds.has(disinfettante.id)).toBe(false);
    });

    it('dovrebbe calcolare correttamente l\'impatto sulla quota per ragazzo (costo totale / numero esploratori)', async () => {
        await UI.openImportScorteModal();

        // 82.20 € divisi per 20 esploratori = 4.11 € / ragazzo
        const badge = document.getElementById('importScorteQuotaImpactBadge');
        expect(badge.textContent).toContain('4.11');

        const totalBadge = document.getElementById('importScorteTotalCostBadge');
        expect(totalBadge.textContent).toContain('82.20');
    });

    it('dovrebbe importare gli articoli nel preventivo in modalità dettagliata (una voce per ciascun articolo)', async () => {
        await UI.openImportScorteModal();
        UI._scorteImportState.mode = 'detailed';

        UI.confirmImportScorte();

        // La modale deve chiudersi
        expect(document.getElementById('importScorteModal').classList.contains('hidden')).toBe(true);

        // In various devono esserci 2 voci per Campo Estivo
        expect(UI.budgetState.various.length).toBe(2);
        const imported = UI.budgetState.various.filter(v => v.fromScorte);
        expect(imported.length).toBe(2);

        expect(imported.some(v => v.desc.includes('Picchetti') && v.cost === 31.20)).toBe(true);
        expect(imported.some(v => v.desc.includes('Cordino') && v.cost === 51.00)).toBe(true);

        // Verifica aggiornamento totali preventivo
        const costs = UI.calculateCosts(20);
        expect(costs.totalVarious).toBeCloseTo(82.20, 2);
        expect(costs.grandTotal).toBeCloseTo(82.20, 2);
        expect(costs.grandTotal / 20).toBeCloseTo(4.11, 2);
    });

    it('dovrebbe importare gli articoli nel preventivo in modalità voce unica raggruppata', async () => {
        await UI.openImportScorteModal();
        UI._scorteImportState.mode = 'grouped';

        UI.confirmImportScorte();

        expect(UI.budgetState.various.length).toBe(1);
        const groupedItem = UI.budgetState.various[0];
        expect(groupedItem.fromScorte).toBe(true);
        expect(groupedItem.category).toBe('Materiale');
        expect(groupedItem.desc).toContain('Campo Estivo');
        expect(groupedItem.desc).toContain('2 articoli');
        expect(groupedItem.cost).toBeCloseTo(82.20, 2);
    });

    it('dovrebbe permettere di rimuovere con un click tutti i materiali importati da scorte', async () => {
        // Aggiungi una spesa varia manuale
        UI.budgetState.various.push({ id: 100, category: 'Biglietti', desc: 'Ingresso Parco', cost: 50.00 });

        await UI.openImportScorteModal();
        UI.confirmImportScorte();

        expect(UI.budgetState.various.length).toBe(3); // 1 manuale + 2 da scorte

        // Rimuovi solo quelli da scorte
        UI.clearImportedScorteItems();

        expect(UI.budgetState.various.length).toBe(1);
        expect(UI.budgetState.various[0].desc).toBe('Ingresso Parco');
        expect(UI.budgetState.various[0].cost).toBe(50.00);
    });

    it('dovrebbe permettere di applicare la quota a pareggio che copre esattamente i costi', async () => {
        await UI.openImportScorteModal();
        UI.confirmImportScorte();

        // 82.20 € / 20 = 4.11 €
        UI.applyBreakEvenQuota();

        expect(UI.budgetState.proposedQuota).toBe(4.11);
        expect(document.getElementById('proposedQuota').value).toBe('4.11');

        const marginEl = document.getElementById('marginDisplay');
        expect(marginEl.textContent).toBe('€ 0.00');
    });

    it('dovrebbe permettere di filtrare per un\'altra lista tematica come "Uniformi"', async () => {
        // Aggiungi un articolo a Uniformi con scorta insufficiente
        await adapter.addScorta({
            nome: 'Distintivo Squadriglia Lupi',
            categoria: 'Distintivi',
            lista: 'Uniformi',
            quantita: 2,
            quantitaMinima: 10,
            prezzoUnitario: 1.50
        });

        await UI.openImportScorteModal();

        // Cambia lista su Uniformi
        UI._scorteImportState.selectedList = 'Uniformi';
        UI.renderImportScorteTable();

        expect(UI._scorteImportState.selectedList).toBe('Uniformi');
        const rows = document.getElementById('importScorteTableBody').querySelectorAll('tr');
        expect(rows.length).toBe(1);
        expect(rows[0].textContent).toContain('Distintivo Squadriglia Lupi');
    });
});
