/**
 * preventivo.js - Master Budget Calculator
 */

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

        // Various
        variousList: this.qs('#variousItemsList'),
        addVarBtn: this.qs('#addVarBtn'),

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

        // Simulation
        proposedQuota: this.qs('#proposedQuota'),
        marginDisplay: this.qs('#marginDisplay'),
        simTable: this.qs('#simulationTableBody')
    };
    this.els = els;

    await this.populateActivitySelect(els.selectActivity);

    // --- EVENT LISTENERS ---

    // 1. General Config
    els.selectActivity.addEventListener('change', async (e) => {
        const id = e.target.value;
        this.budgetState.activityId = id;

        // Load existing budget if present
        const savedBudget = await DATA.getBudgetByActivity(id);
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

    els.scoutsCount.addEventListener('input', (e) => {
        this.budgetState.scoutsCount = parseInt(e.target.value) || 0;
        this.renderAll();
    });
    els.staffCount.addEventListener('input', (e) => {
        this.budgetState.staffCount = parseInt(e.target.value) || 0;
        this.renderAll();
    });

    els.saveBtn.addEventListener('click', async () => {
        if (!this.budgetState.activityId) {
            this.showToast('Seleziona un\'attività prima di salvare', { type: 'error' });
            return;
        }
        await DATA.saveBudget(this.budgetState, this.currentUser);
        this.showToast('Preventivo salvato correttamente', { type: 'success' });
    });

    // Print
    this.qs('#printBudgetBtn').addEventListener('click', () => {
        // Expand all details for printing
        document.querySelectorAll('details').forEach(el => el.setAttribute('open', 'true'));
        setTimeout(() => window.print(), 100);
    });

    // 2. Transport
    els.addLegBtn.addEventListener('click', () => {
        const name = this.qs('#newLegName').value;
        const cost = parseFloat(this.qs('#newLegCost').value);
        const convention = this.qs('#newLegConvention').checked;
        if (name && cost) {
            this.budgetState.transport.legs.push({ id: Date.now(), name, cost, convention });
            this.qs('#newLegName').value = '';
            this.qs('#newLegCost').value = '';
            this.renderAll();
        }
    });

    // 3. Structure
    ['structNights', 'structDays', 'structRate', 'elecStart', 'elecEnd', 'elecRate', 'gasStart', 'gasEnd', 'gasRate'].forEach(id => {
        els[id].addEventListener('input', (e) => {
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
    els.structRateType.addEventListener('change', (e) => {
        this.budgetState.structure.rateType = e.target.value;
        this.renderAll();
    });

    // 4. Galley
    els.galleyMode.forEach(r => r.addEventListener('change', (e) => {
        this.budgetState.galley.mode = e.target.value;
        this.renderAll();
    }));
    ['galleyQty', 'galleyRate', 'compBudget'].forEach(id => {
        els[id].addEventListener('input', (e) => {
            if (id === 'galleyQty') this.budgetState.galley.qty = parseFloat(e.target.value) || 0;
            if (id === 'galleyRate') this.budgetState.galley.rate = parseFloat(e.target.value) || 0;
            if (id === 'compBudget') this.budgetState.galley.compBudget = parseFloat(e.target.value) || 0;
            this.renderAll();
        });
    });
    els.compActive.addEventListener('change', (e) => {
        this.budgetState.galley.compActive = e.target.checked;
        this.renderAll();
    });

    // 5. Various
    els.addVarBtn.addEventListener('click', () => {
        const category = this.qs('#newVarCat').value;
        const desc = this.qs('#newVarDesc').value;
        const cost = parseFloat(this.qs('#newVarCost').value);
        if (desc && cost) {
            this.budgetState.various.push({ id: Date.now(), category, desc, cost });
            this.qs('#newVarDesc').value = '';
            this.qs('#newVarCost').value = '';
            this.renderAll();
        }
    });

    // 6. Quota
    els.proposedQuota.addEventListener('input', (e) => {
        this.budgetState.proposedQuota = parseFloat(e.target.value) || 0;
        this.renderAll();
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
    let deduction = 0;
    if (g.compActive && totalPax > 0) {
        if (g.mode === 'meal') deduction = g.rate * totalPax;
        else deduction = (g.rate / 3) * totalPax; // rough estimate
    }
    const totalGalley = Math.max(0, foodBase - deduction) + (g.compActive ? g.compBudget : 0);

    // D. Various
    // Assume fixed costs (Materials, Rent) unless specified?
    // "Biglietti" is variable. "Imprevisti" fixed?
    // Simply sum all.
    const totalVarious = various.reduce((acc, i) => acc + i.cost, 0);

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
    items.forEach(i => {
        list.innerHTML += `
            <div class="flex justify-between items-center text-sm p-2 bg-gray-100 rounded border-l-4 border-gray-400">
                <div>
                   <span class="block font-bold text-xs uppercase text-gray-500">${i.category}</span>
                   <span>${i.desc}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-bold">€ ${i.cost.toFixed(2)}</span>
                    <button class="text-red-500 font-bold px-1" onclick="UI.removeVarItem(${i.id})">×</button>
                </div>
            </div>`;
    });
};

UI.renderSimulation = function (currentTotal, currentScouts) {
    const body = this.els.simTable;
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
