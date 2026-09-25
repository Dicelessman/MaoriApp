/**
 * preventivo.js - Master Budget Calculator
 */
const UI = (typeof window !== 'undefined' && window.UI) ? window.UI : (typeof globalThis !== 'undefined' && globalThis.UI) ? globalThis.UI : {};
const DATA = new Proxy({}, {
    get(target, prop) {
        const source = (typeof window !== 'undefined' && window.DATA) || (typeof globalThis !== 'undefined' && globalThis.DATA) || {};
        const val = source[prop];
        return typeof val === 'function' ? val.bind(source) : val;
    }
});

if (typeof window !== 'undefined') {
    window.UI = UI;
    window.DATA = DATA;
}
if (typeof globalThis !== 'undefined') {
    globalThis.UI = UI;
    globalThis.DATA = DATA;
}

UI.qs = UI.qs || ((sel) => document.querySelector(sel));
UI.showToast = UI.showToast || ((msg) => console.log(msg));
UI.toJsDate = UI.toJsDate || ((d) => d ? new Date(d) : new Date());

UI.renderCurrentPage = async function () {
    this.initBudgetCalculator();
};

UI.initBudgetCalculator = async function () {
    // STATE
    this.budgetState = {
        activityId: null,
        scoutsCount: 0,
        staffCount: 0,

        transport: { legs: [] },
        structure: {
            nights: 0, days: 0, rateType: 'person_night', rate: 0,
            elecStart: 0, elecEnd: 0, elecRate: 0,
            gasStart: 0, gasEnd: 0, gasRate: 0
        },
        galley: { mode: 'meal', qty: 0, rate: 0, compActive: false, compBudget: 0 },
        various: [], // { id, category, desc, cost }

        proposedQuota: 0
    };

    // DOM - Bindings
    const els = {
        selectActivity: this.qs('#selectActivity'),
        scoutsCount: this.qs('#scoutsCount'),
        staffCount: this.qs('#staffCount'),
        totalParticipants: this.qs('#totalParticipantsDisplay'),
        saveBtn: this.qs('#saveBudgetBtn'),

        // Modules Sections
        transportLegs: this.qs('#transportLegsList'),
        addLegBtn: this.qs('#addLegBtn'),

        // Structure
        structNights: this.qs('#structNights'),
        structDays: this.qs('#structDays'),
        structRateType: this.qs('#structRateType'),
        structRate: this.qs('#structRate'),

        elecStart: this.qs('#elecStart'),
        elecEnd: this.qs('#elecEnd'),
        elecRate: this.qs('#elecRate'),

        gasStart: this.qs('#gasStart'),
        gasEnd: this.qs('#gasEnd'),
        gasRate: this.qs('#gasRate'),

        // Galley
        galleyMode: document.querySelectorAll('input[name="galleyMode"]'),
        galleyQty: this.qs('#galleyQty'),
        galleyRate: this.qs('#galleyRate'),
        compActive: this.qs('#compActive'),
        compBudget: this.qs('#compBudget'),
        galleyQtyLabel: this.qs('#galleyQtyLabel'),
        galleyRateLabel: this.qs('#galleyRateLabel'),

        // Various & Scorte
        variousList: this.qs('#variousItemsList'),
        addVarBtn: this.qs('#addVarBtn'),
        openImportScorteBtn: this.qs('#openImportScorteBtn'),
        clearScorteItemsBtn: this.qs('#clearScorteItemsBtn'),

        // Scorte Modal Elements
        importScorteModal: this.qs('#importScorteModal'),
        closeImportScorteModalBtn: this.qs('#closeImportScorteModalBtn'),
        cancelImportScorteBtn: this.qs('#cancelImportScorteBtn'),
        confirmImportScorteBtn: this.qs('#confirmImportScorteBtn'),
        confirmImportScorteBtnText: this.qs('#confirmImportScorteBtnText'),
        importScorteListSelect: this.qs('#importScorteListSelect'),
        importScorteSearchInput: this.qs('#importScorteSearchInput'),
        importScorteReorderOnlyToggle: this.qs('#importScorteReorderOnlyToggle'),
        importScorteSelectAllBtn: this.qs('#importScorteSelectAllBtn'),
        importScorteDeselectAllBtn: this.qs('#importScorteDeselectAllBtn'),
        importScorteTableCheckAll: this.qs('#importScorteTableCheckAll'),
        importScorteTableBody: this.qs('#importScorteTableBody'),
        importScorteSelectedCountBadge: this.qs('#importScorteSelectedCountBadge'),
        importScorteTotalCostBadge: this.qs('#importScorteTotalCostBadge'),
        importScorteQuotaImpactBadge: this.qs('#importScorteQuotaImpactBadge'),
        importScorteScoutsCountHint: this.qs('#importScorteScoutsCountHint'),

        // Totals
        sumTransport: this.qs('#sumTransport'),
        sumStructure: this.qs('#sumStructure'),
        sumGalley: this.qs('#sumGalley'),
        sumVarious: this.qs('#sumVarious'),
        finalTotalCost: this.qs('#finalTotalCost'),
        finalCostPerScout: this.qs('#finalCostPerScout'),

        transportTotalBadge: this.qs('#transportTotalBadge'),
        structureTotalBadge: this.qs('#structureTotalBadge'),
        galleyTotalBadge: this.qs('#galleyTotalBadge'),
        variousTotalBadge: this.qs('#variousTotalBadge'),

        // Simulation & Quota
        proposedQuota: this.qs('#proposedQuota'),
        marginDisplay: this.qs('#marginDisplay'),
        simTable: this.qs('#simulationTableBody'),
        applyBreakEvenQuotaBtn: this.qs('#applyBreakEvenQuotaBtn'),
        exactCostPerScoutText: this.qs('#exactCostPerScoutText')
    };
    this.els = els;

    await this.populateActivitySelect(els.selectActivity);

    // --- EVENT LISTENERS ---

    // 1. General Config
    els.selectActivity?.addEventListener('change', async (e) => {
        const id = e.target.value;
        this.budgetState.activityId = id;

        // Load existing budget if present
        const savedBudget = DATA.getBudgetByActivity ? await DATA.getBudgetByActivity(id) : null;
        if (savedBudget) {
            this.budgetState = { ...this.budgetState, ...savedBudget }; // Merge

            // Backwards compatibility for old 'diff' format if loading old budget
            if (savedBudget.structure) {
                if (savedBudget.structure.elecDiff && !savedBudget.structure.elecEnd) {
                    this.budgetState.structure.elecStart = 0;
                    this.budgetState.structure.elecEnd = savedBudget.structure.elecDiff;
                }
                if (savedBudget.structure.gasDiff && !savedBudget.structure.gasEnd) {
                    this.budgetState.structure.gasStart = 0;
                    this.budgetState.structure.gasEnd = savedBudget.structure.gasDiff;
                }
            }

            this.showToast('Preventivo salvato caricato');
        } else {
            // Reset crucial parts if new activity selected without budget
            // Check real scout count from presences
            this.updateScoutsCountFromActivity(id);
        }
        this.renderAll();
    });

    els.scoutsCount?.addEventListener('input', (e) => {
        this.budgetState.scoutsCount = parseInt(e.target.value) || 0;
        this.renderAll();
    });
    els.staffCount?.addEventListener('input', (e) => {
        this.budgetState.staffCount = parseInt(e.target.value) || 0;
        this.renderAll();
    });

    els.saveBtn?.addEventListener('click', async () => {
        if (!this.budgetState.activityId) {
            this.showToast('Seleziona un\'attività prima di salvare', { type: 'error' });
            return;
        }
        if (DATA.saveBudget) {
            await DATA.saveBudget(this.budgetState, this.currentUser);
        }
        this.showToast('Preventivo salvato correttamente', { type: 'success' });
    });

    // Print
    this.qs('#printBudgetBtn')?.addEventListener('click', () => {
        // Expand all details for printing
        document.querySelectorAll('details').forEach(el => el.setAttribute('open', 'true'));
        setTimeout(() => window.print(), 500);
    });

    // 2. Transport
    els.addLegBtn?.addEventListener('click', () => {
        const name = this.qs('#newLegName')?.value;
        const cost = parseFloat(this.qs('#newLegCost')?.value);
        const convention = this.qs('#newLegConvention')?.checked;
        if (name && cost) {
            this.budgetState.transport.legs.push({ id: Date.now(), name, cost, convention });
            if (this.qs('#newLegName')) this.qs('#newLegName').value = '';
            if (this.qs('#newLegCost')) this.qs('#newLegCost').value = '';
            this.renderAll();
        }
    });

    // 3. Structure
    ['structNights', 'structDays', 'structRate', 'elecStart', 'elecEnd', 'elecRate', 'gasStart', 'gasEnd', 'gasRate'].forEach(id => {
        els[id]?.addEventListener('input', (e) => {
            this.budgetState.structure[id.replace('struct', '').toLowerCase()] = parseFloat(e.target.value) || 0; // mapping loose key names

            const val = parseFloat(e.target.value) || 0;
            if (id === 'structNights') this.budgetState.structure.nights = val;
            if (id === 'structDays') this.budgetState.structure.days = val;
            if (id === 'structRate') this.budgetState.structure.rate = val;

            if (id === 'elecStart') this.budgetState.structure.elecStart = val;
            if (id === 'elecEnd') this.budgetState.structure.elecEnd = val;
            if (id === 'elecRate') this.budgetState.structure.elecRate = val;

            if (id === 'gasStart') this.budgetState.structure.gasStart = val;
            if (id === 'gasEnd') this.budgetState.structure.gasEnd = val;
            if (id === 'gasRate') this.budgetState.structure.gasRate = val;

            this.renderAll();
        });
    });
    els.structRateType?.addEventListener('change', (e) => {
        this.budgetState.structure.rateType = e.target.value;
        this.renderAll();
    });

    // 4. Galley
    els.galleyMode?.forEach(r => r.addEventListener('change', (e) => {
        this.budgetState.galley.mode = e.target.value;
        this.renderAll();
    }));
    ['galleyQty', 'galleyRate', 'compBudget'].forEach(id => {
        els[id]?.addEventListener('input', (e) => {
            if (id === 'galleyQty') this.budgetState.galley.qty = parseFloat(e.target.value) || 0;
            if (id === 'galleyRate') this.budgetState.galley.rate = parseFloat(e.target.value) || 0;
            if (id === 'compBudget') this.budgetState.galley.compBudget = parseFloat(e.target.value) || 0;
            this.renderAll();
        });
    });
    els.compActive?.addEventListener('change', (e) => {
        this.budgetState.galley.compActive = e.target.checked;
        this.renderAll();
    });

    // 5. Various
    els.addVarBtn?.addEventListener('click', () => {
        const category = this.qs('#newVarCat')?.value;
        const desc = this.qs('#newVarDesc')?.value;
        const cost = parseFloat(this.qs('#newVarCost')?.value);
        if (desc && cost) {
            this.budgetState.various.push({ id: Date.now(), category, desc, cost });
            if (this.qs('#newVarDesc')) this.qs('#newVarDesc').value = '';
            if (this.qs('#newVarCost')) this.qs('#newVarCost').value = '';
            this.renderAll();
        }
    });

    // 6. Quota
    els.proposedQuota?.addEventListener('input', (e) => {
        this.budgetState.proposedQuota = parseFloat(e.target.value) || 0;
        this.renderAll();
    });

    // 7. Scorte & Quota Actions
    if (els.openImportScorteBtn) {
        els.openImportScorteBtn.addEventListener('click', () => this.openImportScorteModal());
    }
    if (els.clearScorteItemsBtn) {
        els.clearScorteItemsBtn.addEventListener('click', () => this.clearImportedScorteItems());
    }
    if (els.closeImportScorteModalBtn) {
        els.closeImportScorteModalBtn.addEventListener('click', () => this.closeImportScorteModal());
    }
    if (els.cancelImportScorteBtn) {
        els.cancelImportScorteBtn.addEventListener('click', () => this.closeImportScorteModal());
    }
    if (els.confirmImportScorteBtn) {
        els.confirmImportScorteBtn.addEventListener('click', () => this.confirmImportScorte());
    }
    if (els.applyBreakEvenQuotaBtn) {
        els.applyBreakEvenQuotaBtn.addEventListener('click', () => this.applyBreakEvenQuota());
    }
    if (els.importScorteListSelect) {
        els.importScorteListSelect.addEventListener('change', (e) => {
            if (this._scorteImportState) {
                this._scorteImportState.selectedList = e.target.value;
                this.renderImportScorteTable();
            }
        });
    }
    if (els.importScorteSearchInput) {
        els.importScorteSearchInput.addEventListener('input', (e) => {
            if (this._scorteImportState) {
                this._scorteImportState.search = e.target.value.toLowerCase().trim();
                this.renderImportScorteTable();
            }
        });
    }
    if (els.importScorteReorderOnlyToggle) {
        els.importScorteReorderOnlyToggle.addEventListener('change', (e) => {
            if (this._scorteImportState) {
                this._scorteImportState.reorderOnly = e.target.checked;
                this.renderImportScorteTable();
            }
        });
    }
    if (els.importScorteSelectAllBtn) {
        els.importScorteSelectAllBtn.addEventListener('click', () => this.toggleAllImportScorte(true));
    }
    if (els.importScorteDeselectAllBtn) {
        els.importScorteDeselectAllBtn.addEventListener('click', () => this.toggleAllImportScorte(false));
    }
    if (els.importScorteTableCheckAll) {
        els.importScorteTableCheckAll.addEventListener('change', (e) => this.toggleAllImportScorte(e.target.checked));
    }
    document.querySelectorAll('input[name="importScorteGrouped"]').forEach(r => {
        r.addEventListener('change', (e) => {
            if (this._scorteImportState) {
                this._scorteImportState.mode = e.target.value;
            }
        });
    });
};

UI.populateActivitySelect = async function (selectElement) {
    const activities = this.state.activities || [];
    const sorted = [...activities].sort((a, b) => this.toJsDate(b.data) - this.toJsDate(a.data));
    selectElement.innerHTML = '<option value="">Seleziona un\'attività...</option>';
    sorted.forEach(act => {
        const dateObj = this.toJsDate(act.data);
        const dateStr = isNaN(dateObj) ? '???' : dateObj.toLocaleDateString('it-IT');
        selectElement.innerHTML += `<option value="${act.id}">${dateStr} - ${act.tipo} - ${act.descrizione || ''}</option>`;
    });
};

UI.updateScoutsCountFromActivity = function (actId) {
    if (!actId) {
        this.budgetState.scoutsCount = 0;
    } else {
        const presences = this.state.presences || [];
        const activityPresences = presences.filter(p => p.attivitaId === actId && p.stato === 'Presente');
        this.budgetState.scoutsCount = activityPresences.length;
    }
};

UI.removeTransportLeg = function (id) {
    this.budgetState.transport.legs = this.budgetState.transport.legs.filter(l => l.id !== id);
    this.renderAll();
};
UI.removeVarItem = function (id) {
    this.budgetState.various = this.budgetState.various.filter(i => i.id !== id);
    this.renderAll();
};
UI.updateVarItemCost = function (id, newCost) {
    const item = this.budgetState.various.find(i => i.id === id);
    if (item) {
        item.cost = parseFloat(newCost) || 0;
        this.renderAll();
    }
};

// --- CORE LOGIC & RENDERING ---

UI.renderAll = function () {
    const { scoutsCount, staffCount, transport, structure, galley, various, proposedQuota } = this.budgetState;

    // Update Inputs (Two-way binding sync for inputs that might change programmatically)
    this.els.scoutsCount.value = scoutsCount;
    this.els.staffCount.value = staffCount;
    this.els.totalParticipants.textContent = scoutsCount + staffCount;

    this.els.structNights.value = structure.nights;
    this.els.structDays.value = structure.days;
    this.els.structRateType.value = structure.rateType;
    this.els.structRate.value = structure.rate;

    this.els.elecStart.value = structure.elecStart;
    this.els.elecEnd.value = structure.elecEnd;
    this.els.elecRate.value = structure.elecRate;

    this.els.gasStart.value = structure.gasStart;
    this.els.gasEnd.value = structure.gasEnd;
    this.els.gasRate.value = structure.gasRate;

    this.els.galleyQty.value = galley.qty;
    this.els.galleyRate.value = galley.rate;
    this.els.compActive.checked = galley.compActive;
    this.els.compBudget.value = galley.compBudget;
    this.els.compBudget.disabled = !galley.compActive;

    // Update Galley Labels
    if (galley.mode === 'meal') {
        this.els.galleyQtyLabel.textContent = 'Num. Pasti';
        this.els.galleyRateLabel.textContent = 'Costo Pasto';
    } else {
        this.els.galleyQtyLabel.textContent = 'Num. Giorni';
        this.els.galleyRateLabel.textContent = 'Costo Giorno';
    }
    this.els.galleyMode.forEach(r => { if (r.value === galley.mode) r.checked = true; });

    // 1. Calculate Costs (Current Scenario)
    const costs = this.calculateCosts(scoutsCount);

    // 2. Render Lists
    this.renderTransportLegs(costs.transportDetails);
    this.renderVariousItems();

    // 3. Render Badges & Totals
    this.els.transportTotalBadge.textContent = '€ ' + costs.totalTransport.toFixed(2);
    this.els.structureTotalBadge.textContent = '€ ' + costs.totalStructure.toFixed(2);
    this.els.galleyTotalBadge.textContent = '€ ' + costs.totalGalley.toFixed(2);
    this.els.variousTotalBadge.textContent = '€ ' + costs.totalVarious.toFixed(2);

    this.els.sumTransport.textContent = '€ ' + costs.totalTransport.toFixed(2);
    this.els.sumStructure.textContent = '€ ' + costs.totalStructure.toFixed(2);
    this.els.sumGalley.textContent = '€ ' + costs.totalGalley.toFixed(2);
    this.els.sumVarious.textContent = '€ ' + costs.totalVarious.toFixed(2);

    this.els.finalTotalCost.textContent = '€ ' + costs.grandTotal.toFixed(2);
    this.els.finalCostPerScout.textContent = (scoutsCount > 0) ? '€ ' + (costs.grandTotal / scoutsCount).toFixed(2) : '---';
    if (this.els.exactCostPerScoutText) {
        this.els.exactCostPerScoutText.textContent = (scoutsCount > 0) ? '€ ' + (costs.grandTotal / scoutsCount).toFixed(2) : '€ 0.00';
    }

    // 4. Margin
    const costPerScout = (scoutsCount > 0) ? (costs.grandTotal / scoutsCount) : 0;
    const margin = proposedQuota - costPerScout;
    const marginEl = this.els.marginDisplay;
    marginEl.textContent = '€ ' + margin.toFixed(2);
    if (margin >= 0) {
        marginEl.className = 'font-bold text-lg text-green-600';
    } else {
        marginEl.className = 'font-bold text-lg text-red-600';
    }

    // 5. Simulation
    this.renderSimulation(costs.grandTotal, scoutsCount);
};

UI.calculateCosts = function (currentScouts) {
    const { staffCount, transport, structure, galley, various } = this.budgetState;
    const totalPax = currentScouts + staffCount;

    // A. Transport Logic
    let totalTransport = 0;
    const transportDetails = transport.legs.map(leg => {
        const sc = parseInt(currentScouts) || 0;
        const st = parseInt(staffCount) || 0;
        const totalPax = sc + st;

        let unitCost = parseFloat(leg.cost) || 0;
        let discountApplied = false;
        let freeStaff = 0;

        // Convention logic duplicates from costotrasporti.js
        if (leg.convention && totalPax >= 10) {
            unitCost *= 0.8;
            discountApplied = true;
            const maxFree = Math.floor(sc / 10) * 2;
            freeStaff = Math.min(st, maxFree);
        }

        const payingStaff = Math.max(0, st - freeStaff);
        const legTotal = (sc * unitCost) + (payingStaff * unitCost);
        totalTransport += legTotal;
        return { ...leg, legTotal, discountApplied, freeStaff, payingStaff };
    });

    // B. Structure
    const s = structure;
    let baseStruct = 0;
    // Variable vs Fixed Structure
    if (s.rateType === 'person_night') baseStruct = (totalPax * s.nights * s.rate);
    if (s.rateType === 'person_day') baseStruct = (totalPax * s.days * s.rate);
    if (s.rateType === 'person_flat') baseStruct = (totalPax * s.rate);
    if (s.rateType === 'group_flat') baseStruct = s.rate; // Fixed Cost

    const elecDiff = Math.max(0, s.elecEnd - s.elecStart);
    const gasDiff = Math.max(0, s.gasEnd - s.gasStart);
    const utils = (elecDiff * s.elecRate) + (gasDiff * s.gasRate);
    const totalStructure = baseStruct + utils;

    // C. Galley
    const g = galley;
    let foodBase = g.qty * g.rate * totalPax; // Variable
    let compCost = g.compActive ? (parseFloat(g.compBudget) || 0) : 0;
    const totalGalley = foodBase + compCost;

    // D. Various
    // Assume fixed costs (Materials, Rent) unless specified?
    // "Biglietti" is variable. "Imprevisti" fixed?
    // Simply sum all.
    const totalVarious = various.reduce((acc, i) => acc + (parseFloat(i.cost) || 0), 0);

    return { totalTransport, totalStructure, totalGalley, totalVarious, grandTotal: totalTransport + totalStructure + totalGalley + totalVarious, transportDetails };
};

UI.renderTransportLegs = function (legsWithDetails) {
    const list = this.qs('#transportLegsList');
    list.innerHTML = '';
    legsWithDetails.forEach(l => {
        list.innerHTML += `
            <div class="flex justify-between items-center text-sm p-2 bg-gray-100 rounded">
                <span>${l.name} (${l.convention ? 'Conv.' : 'No'})</span>
                <div class="flex items-center gap-2">
                    <span class="font-bold">€ ${l.legTotal.toFixed(2)}</span>
                    <button class="text-red-500 font-bold px-1" onclick="UI.removeTransportLeg(${l.id})">×</button>
                </div>
            </div>`;
    });
};

UI.renderVariousItems = function () {
    const list = this.qs('#variousItemsList');
    const items = this.budgetState.various;
    list.innerHTML = '';

    const hasScorteItems = items.some(i => i.fromScorte || (i.desc || '').startsWith('[Scorte:'));
    if (this.els.clearScorteItemsBtn) {
        if (hasScorteItems) {
            this.els.clearScorteItemsBtn.classList.remove('hidden');
        } else {
            this.els.clearScorteItemsBtn.classList.add('hidden');
        }
    }

    if (items.length === 0) {
        list.innerHTML = `<p class="text-xs text-gray-400 italic py-1">Nessuna voce presente. Aggiungi spese manuali o clicca su "Importa da Scorte".</p>`;
        return;
    }

    items.forEach(i => {
        const isFromScorte = i.fromScorte || (i.desc || '').startsWith('[Scorte:');
        const borderClass = isFromScorte
            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
            : 'border-gray-400 bg-gray-100 dark:bg-gray-700/50';
        const scorteBadge = isFromScorte
            ? `<span class="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">📦 ${i.scorteList ? i.scorteList : 'SCORTE'}</span>`
            : '';

        list.innerHTML += `
            <div class="flex justify-between items-center text-sm p-2 rounded border-l-4 ${borderClass}">
                <div class="flex-1 pr-2">
                   <div class="flex items-center gap-1.5 mb-0.5">
                       ${scorteBadge}
                       <span class="block font-bold text-xs uppercase text-gray-500 dark:text-gray-400">${i.category}</span>
                   </div>
                   <span class="text-gray-800 dark:text-gray-200 text-xs sm:text-sm">${i.desc}</span>
                </div>
                <div class="flex items-center gap-1">
                    <span class="font-bold text-gray-500">€</span>
                    <input type="number" step="0.01" class="w-20 p-1 border rounded text-right font-bold focus:ring-1 focus:ring-green-500 outline-none dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm" value="${Number(i.cost).toFixed(2)}" onchange="UI.updateVarItemCost(${i.id}, this.value)" title="Modifica costo">
                    <button class="text-red-500 hover:text-red-700 font-bold px-2 ml-1" onclick="UI.removeVarItem(${i.id})" title="Rimuovi voce">×</button>
                </div>
            </div>`;
    });
};

UI.renderSimulation = function (currentTotal, currentScouts) {
    const body = this.els.simTable;
    if (!body) return;
    body.innerHTML = '';

    const quota = this.budgetState.proposedQuota;

    // Scenarios: 0 (Current), -2, -4, -6
    const scenarios = [0, 2, 4, 6];

    scenarios.forEach(drop => {
        const simScouts = Math.max(0, currentScouts - drop);
        const costs = this.calculateCosts(simScouts); // Re-run logic with fewer scouts
        const revenue = simScouts * quota;
        const balance = revenue - costs.grandTotal;

        const balanceClass = balance >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold';

        body.innerHTML += `
            <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="p-2 text-left">
                    <span class="font-medium">Meno ${drop}</span>
                    <span class="text-xs text-gray-400 block">${simScouts} Espl.</span>
                </td>
                <td class="p-2 text-right">€ ${costs.grandTotal.toFixed(2)}</td>
                <td class="p-2 text-right">€ ${revenue.toFixed(2)}</td>
                <td class="p-2 text-right ${balanceClass}">€ ${balance.toFixed(2)}</td>
            </tr>
        `;
    });
};

// ==================== Collegamento Scorte -> Preventivo ====================

UI.openImportScorteModal = async function () {
    try {
        if (this.showLoadingOverlay) this.showLoadingOverlay('Caricamento scorte...');
        const [items, lists] = await Promise.all([
            DATA.getScorte(),
            DATA.getListeScorte()
        ]);

        const allItems = items || [];
        const allLists = lists && lists.length > 0 ? lists : ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];

        // Determine default thematic list based on selected activity
        let defaultList = 'Campo Estivo';
        if (this.budgetState.activityId) {
            const act = (this.state.activities || []).find(a => a.id === this.budgetState.activityId);
            if (act) {
                const text = `${act.tipo || ''} ${act.descrizione || ''}`.toLowerCase();
                const matchedList = allLists.find(l => text.includes(l.toLowerCase()));
                if (matchedList) {
                    defaultList = matchedList;
                }
            }
        }
        if (!allLists.includes(defaultList) && allLists.length > 0) {
            defaultList = allLists[0];
        }

        this._scorteImportState = {
            items: allItems,
            lists: allLists,
            selectedList: defaultList,
            reorderOnly: true,
            search: '',
            mode: 'detailed',
            selectedIds: new Set(),
            quantities: {}
        };

        // Populate initial quantities & pre-check under-stock items
        allItems.forEach(i => {
            const q = Number(i.quantita) || 0;
            const min = Number(i.quantitaMinima) || 0;
            const diff = Math.max(0, min - q);
            this._scorteImportState.quantities[i.id] = diff > 0 ? diff : 1;
            if (diff > 0) {
                this._scorteImportState.selectedIds.add(i.id);
            }
        });

        // Populate Select
        if (this.els.importScorteListSelect) {
            const opts = [
                ...allLists.map(l => `<option value="${l}">${l}</option>`),
                `<option value="all">Tutte le Liste</option>`
            ];
            this.els.importScorteListSelect.innerHTML = opts.join('');
            this.els.importScorteListSelect.value = defaultList;
        }

        if (this.els.importScorteSearchInput) this.els.importScorteSearchInput.value = '';
        if (this.els.importScorteReorderOnlyToggle) this.els.importScorteReorderOnlyToggle.checked = true;

        this.renderImportScorteTable();
        this.els.importScorteModal?.classList.remove('hidden');
    } catch (err) {
        console.error('Errore caricamento scorte per preventivo:', err);
        this.showToast('Errore durante il caricamento delle scorte', { type: 'error' });
    } finally {
        if (this.hideLoadingOverlay) this.hideLoadingOverlay();
    }
};

UI.closeImportScorteModal = function () {
    this.els.importScorteModal?.classList.add('hidden');
};

UI.renderImportScorteTable = function () {
    if (!this._scorteImportState) return;
    const { items, selectedList, reorderOnly, search, selectedIds, quantities } = this._scorteImportState;

    // Filter by list
    let filtered = selectedList === 'all'
        ? [...items]
        : items.filter(i => (i.lista || 'Generale') === selectedList);

    // Filter by reorderOnly
    if (reorderOnly) {
        filtered = filtered.filter(i => (Number(i.quantitaMinima) || 0) > (Number(i.quantita) || 0));
    }

    // Filter by search
    if (search) {
        filtered = filtered.filter(i =>
            (i.nome || '').toLowerCase().includes(search) ||
            (i.categoria || '').toLowerCase().includes(search) ||
            (i.note || '').toLowerCase().includes(search)
        );
    }

    const tbody = this.els.importScorteTableBody;
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="p-6 text-center text-gray-500 dark:text-gray-400">
                    Nessun materiale trovato per la lista "${selectedList}" con i filtri attuali.
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = filtered.map(i => {
            const isChecked = selectedIds.has(i.id);
            const q = Number(i.quantita) || 0;
            const min = Number(i.quantitaMinima) || 0;
            const price = Number(i.prezzoUnitario) || 0;
            const diff = Math.max(0, min - q);
            const qtyNeeded = quantities[i.id] !== undefined ? quantities[i.id] : (diff > 0 ? diff : 1);
            const unita = i.unitaMisura || 'pz';
            const itemTotal = qtyNeeded * price;

            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${isChecked ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}" data-item-id="${i.id}">
                    <td class="p-2.5 text-center">
                        <input type="checkbox" class="import-item-checkbox rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-id="${i.id}" ${isChecked ? 'checked' : ''}>
                    </td>
                    <td class="p-2.5 font-bold text-gray-800 dark:text-gray-100">
                        <span>${i.nome}</span>
                        ${i.note ? `<div class="text-[11px] text-gray-400 font-normal truncate max-w-xs">${i.note}</div>` : ''}
                    </td>
                    <td class="p-2.5 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            ${i.lista || 'Generale'}
                        </span>
                    </td>
                    <td class="p-2.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        ${i.categoria || 'Generale'}
                    </td>
                    <td class="p-2.5 text-center whitespace-nowrap">
                        <span class="font-bold ${diff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}">${q}</span>
                        <span class="text-gray-400">/ ${min} ${unita}</span>
                        ${diff > 0 ? `<span class="block text-[10px] text-amber-600 dark:text-amber-400 font-bold">(-${diff})</span>` : ''}
                    </td>
                    <td class="p-2.5 text-right font-mono whitespace-nowrap text-gray-700 dark:text-gray-300">
                        € ${price.toFixed(2)}
                    </td>
                    <td class="p-2.5 text-center whitespace-nowrap">
                        <div class="inline-flex items-center gap-1">
                            <input type="number" min="1" step="1" value="${qtyNeeded}" data-id="${i.id}"
                                class="import-item-qty w-16 p-1 border border-gray-300 dark:border-gray-600 rounded text-center font-bold text-sm dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-emerald-500">
                            <span class="text-xs text-gray-400">${unita}</span>
                        </div>
                    </td>
                    <td class="p-2.5 text-right font-mono font-bold whitespace-nowrap text-emerald-700 dark:text-emerald-300">
                        € ${itemTotal.toFixed(2)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Attach row events
    tbody.querySelectorAll('.import-item-checkbox').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (e.target.checked) {
                selectedIds.add(id);
            } else {
                selectedIds.delete(id);
            }
            this.updateImportScorteSummary(filtered);
        });
    });

    tbody.querySelectorAll('.import-item-qty').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.getAttribute('data-id');
            const val = Math.max(1, parseInt(e.target.value) || 1);
            quantities[id] = val;
            this.updateImportScorteSummary(filtered);
        });
    });

    this.updateImportScorteSummary(filtered);
};

UI.toggleAllImportScorte = function (selectAll) {
    if (!this._scorteImportState) return;
    const { items, selectedList, reorderOnly, search, selectedIds } = this._scorteImportState;

    let filtered = selectedList === 'all' ? [...items] : items.filter(i => (i.lista || 'Generale') === selectedList);
    if (reorderOnly) filtered = filtered.filter(i => (Number(i.quantitaMinima) || 0) > (Number(i.quantita) || 0));
    if (search) filtered = filtered.filter(i => (i.nome || '').toLowerCase().includes(search) || (i.categoria || '').toLowerCase().includes(search));

    filtered.forEach(i => {
        if (selectAll) selectedIds.add(i.id);
        else selectedIds.delete(i.id);
    });

    this.renderImportScorteTable();
};

UI.updateImportScorteSummary = function (filteredItems = null) {
    if (!this._scorteImportState) return;
    const { items, selectedIds, quantities } = this._scorteImportState;

    const activeListItems = filteredItems || items;
    let totalCost = 0;
    let selectedCount = 0;

    activeListItems.forEach(i => {
        if (selectedIds.has(i.id)) {
            selectedCount++;
            const qty = quantities[i.id] !== undefined ? quantities[i.id] : Math.max(1, (Number(i.quantitaMinima) || 0) - (Number(i.quantita) || 0));
            const price = Number(i.prezzoUnitario) || 0;
            totalCost += (qty * price);
        }
    });

    const scouts = parseInt(this.budgetState.scoutsCount) || 0;
    const perScout = scouts > 0 ? (totalCost / scouts) : 0;

    if (this.els.importScorteSelectedCountBadge) {
        this.els.importScorteSelectedCountBadge.textContent = `${selectedCount} articoli`;
    }
    if (this.els.importScorteTotalCostBadge) {
        this.els.importScorteTotalCostBadge.textContent = `€ ${totalCost.toFixed(2)}`;
    }
    if (this.els.importScorteQuotaImpactBadge) {
        this.els.importScorteQuotaImpactBadge.textContent = scouts > 0
            ? `+ € ${perScout.toFixed(2)} / ragazzo`
            : `€ ${totalCost.toFixed(2)} tot (0 esploratori)`;
    }
    if (this.els.importScorteScoutsCountHint) {
        this.els.importScorteScoutsCountHint.textContent = scouts > 0
            ? `(calcolato su ${scouts} esploratori partecipanti)`
            : `(imposta numero esploratori nella Configurazione Base)`;
    }
    if (this.els.confirmImportScorteBtnText) {
        this.els.confirmImportScorteBtnText.textContent = selectedCount > 0
            ? `Importa ${selectedCount} materiali nel Preventivo (€ ${totalCost.toFixed(2)})`
            : `Seleziona almeno un articolo`;
    }
    if (this.els.confirmImportScorteBtn) {
        this.els.confirmImportScorteBtn.disabled = selectedCount === 0;
    }
};

UI.confirmImportScorte = function () {
    if (!this._scorteImportState) return;
    const { items, selectedIds, quantities, mode, selectedList } = this._scorteImportState;

    const selectedItems = items.filter(i => selectedIds.has(i.id));
    if (selectedItems.length === 0) {
        this.showToast('Nessun articolo selezionato', { type: 'warning' });
        return;
    }

    let totalCost = 0;
    const listLabel = selectedList === 'all' ? 'Inventario' : selectedList;

    if (mode === 'grouped') {
        selectedItems.forEach(i => {
            const qty = quantities[i.id] !== undefined ? quantities[i.id] : Math.max(1, (Number(i.quantitaMinima) || 0) - (Number(i.quantita) || 0));
            totalCost += qty * (Number(i.prezzoUnitario) || 0);
        });

        this.budgetState.various.push({
            id: Date.now(),
            category: 'Materiale',
            desc: `[Scorte: ${listLabel}] Materiali necessari (${selectedItems.length} articoli)`,
            cost: Number(totalCost.toFixed(2)),
            fromScorte: true,
            scorteList: listLabel,
            itemsCount: selectedItems.length
        });
    } else {
        selectedItems.forEach((i, idx) => {
            const qty = quantities[i.id] !== undefined ? quantities[i.id] : Math.max(1, (Number(i.quantitaMinima) || 0) - (Number(i.quantita) || 0));
            const price = Number(i.prezzoUnitario) || 0;
            const lineCost = Number((qty * price).toFixed(2));
            totalCost += lineCost;

            this.budgetState.various.push({
                id: Date.now() + idx + Math.random(),
                category: 'Materiale',
                desc: `[Scorte: ${i.lista || listLabel}] ${i.nome} (x${qty} ${i.unitaMisura || 'pz'})`,
                cost: lineCost,
                fromScorte: true,
                scorteId: i.id,
                scorteList: i.lista || listLabel
            });
        });
    }

    this.closeImportScorteModal();
    this.renderAll();

    const scouts = parseInt(this.budgetState.scoutsCount) || 0;
    const perScout = scouts > 0 ? (totalCost / scouts) : 0;
    const perScoutMsg = scouts > 0 ? ` (+€ ${perScout.toFixed(2)}/ragazzo)` : '';

    this.showToast(`Importati ${selectedItems.length} articoli da scorte per € ${totalCost.toFixed(2)}${perScoutMsg}`, { type: 'success' });
};

UI.clearImportedScorteItems = function () {
    const prevCount = this.budgetState.various.length;
    this.budgetState.various = this.budgetState.various.filter(i => !i.fromScorte && !(i.desc || '').startsWith('[Scorte:'));
    const removedCount = prevCount - this.budgetState.various.length;

    this.renderAll();
    this.showToast(`Rimossi ${removedCount} materiali importati da scorte dal preventivo`, { type: 'info' });
};

UI.applyBreakEvenQuota = function () {
    const scouts = parseInt(this.budgetState.scoutsCount) || 0;
    if (scouts <= 0) {
        this.showToast('Imposta prima il numero di esploratori partecipanti', { type: 'warning' });
        return;
    }

    const costs = this.calculateCosts(scouts);
    const breakEven = Math.round((costs.grandTotal / scouts) * 100) / 100;

    this.budgetState.proposedQuota = breakEven;
    if (this.els.proposedQuota) this.els.proposedQuota.value = breakEven.toFixed(2);
    this.renderAll();
    this.showToast(`Quota proposta aggiornata a € ${breakEven.toFixed(2)} (copertura completa)`, { type: 'success' });
};

export { UI };
