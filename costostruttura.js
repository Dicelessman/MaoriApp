/**
 * costostruttura.js - Logic for structure cost calculation
 */

UI.renderCurrentPage = async function () {
    this.initStructureCalculator();
};

UI.initStructureCalculator = async function () {
    // State
    this.structureData = {
        scouts: 0,
        staff: 0,
        nights: 0,
        days: 0,
        baseRate: 0,
        baseType: 'person_night',
        baseTotalOverride: null, // If user manually edits result
        utilities: {
            elec: { start: 0, end: 0, rate: 0 },
            gas: { start: 0, end: 0, rate: 0 }
        },
        utilitiesTotalOverride: null,
        extras: [],
        extrasTotalOverride: null
    };

    // Elements
    const els = {
        activitySelect: this.qs('#selectActivity'),
        staffInput: this.qs('#staffCount'),
        scoutsDisplay: this.qs('#scoutsCountDisplay'),
        nightsInput: this.qs('#nightsCount'),
        daysInput: this.qs('#daysCount'),

        baseType: this.qs('#baseCostType'),
        baseRate: this.qs('#baseCostRate'),
        baseTotal: this.qs('#baseCostTotal'),

        elecStart: this.qs('#elecStart'),
        elecEnd: this.qs('#elecEnd'),
        elecRate: this.qs('#elecRate'),
        gasStart: this.qs('#gasStart'),
        gasEnd: this.qs('#gasEnd'),
        gasRate: this.qs('#gasRate'),
        utilitiesTotal: this.qs('#utilitiesTotal'),

        newExtraDesc: this.qs('#newExtraDesc'),
        newExtraCost: this.qs('#newExtraCost'),
        addExtraBtn: this.qs('#addExtraBtn'),
        extrasList: this.qs('#extraCostsList'),
        extrasTotal: this.qs('#extrasTotal'),

        summaryScouts: this.qs('#summaryScouts'),
        grandTotal: this.qs('#grandTotal'),
        perPersonTotal: this.qs('#perPersonTotal'),
    };
    this.els = els;

    await this.populateActivitySelect(els.activitySelect);

    // Event Listeners

    // Config inputs
    els.activitySelect.addEventListener('change', (e) => {
        this.updateScoutsCountFromActivity(e.target.value);
        this.recalculate();
    });

    ['staffCount', 'nightsCount', 'daysCount'].forEach(id => {
        this.qs(`#${id}`).addEventListener('input', (e) => {
            const key = id.replace('Count', ''); // staff, nights, days
            this.structureData[key] = parseFloat(e.target.value) || 0;
            this.recalculate();
        });
    });

    // Base Cost
    els.baseType.addEventListener('change', (e) => {
        this.structureData.baseType = e.target.value;
        this.structureData.baseTotalOverride = null; // Reset override on type change
        this.recalculate();
    });
    els.baseRate.addEventListener('input', (e) => {
        this.structureData.baseRate = parseFloat(e.target.value) || 0;
        this.structureData.baseTotalOverride = null;
        this.recalculate();
    });
    els.baseTotal.addEventListener('change', (e) => {
        // User manually edited the total
        this.structureData.baseTotalOverride = parseFloat(e.target.value) || 0;
        this.recalculate();
    });

    // Utilities
    ['elec', 'gas'].forEach(type => {
        ['Start', 'End', 'Rate'].forEach(field => {
            const el = this.qs(`#${type}${field}`);
            el.addEventListener('input', (e) => {
                this.structureData.utilities[type][field.toLowerCase()] = parseFloat(e.target.value) || 0;
                this.structureData.utilitiesTotalOverride = null;
                this.recalculate();
            });
        });
    });
    els.utilitiesTotal.addEventListener('change', (e) => {
        this.structureData.utilitiesTotalOverride = parseFloat(e.target.value) || 0;
        this.recalculate();
    });

    // Extras
    els.addExtraBtn.addEventListener('click', () => this.addExtra());
    els.extrasTotal.addEventListener('change', (e) => {
        this.structureData.extrasTotalOverride = parseFloat(e.target.value) || 0;
        this.recalculate();
    });

};

UI.populateActivitySelect = async function (selectElement) {
    const activities = this.state.activities || [];
    const sorted = [...activities].sort((a, b) => new Date(b.data) - new Date(a.data));

    selectElement.innerHTML = '<option value="">Seleziona un\'attività...</option>';
    sorted.forEach(act => {
        const dateStr = new Date(act.data).toLocaleDateString('it-IT');
        const opt = document.createElement('option');
        opt.value = act.id;
        opt.textContent = `${dateStr} - ${act.tipo} - ${act.descrizione || ''}`;
        selectElement.appendChild(opt);
    });
};

UI.updateScoutsCountFromActivity = function (actId) {
    if (!actId) {
        this.structureData.scouts = 0;
    } else {
        const presences = this.state.presences || [];
        const activityPresences = presences.filter(p => p.attivitaId === actId && p.stato === 'Presente');
        this.structureData.scouts = activityPresences.length; // Default to 0 if none
    }

    // Update display
    this.els.scoutsDisplay.value = this.structureData.scouts;
    this.els.summaryScouts.textContent = this.structureData.scouts;
};

UI.addExtra = function () {
    const desc = this.els.newExtraDesc.value.trim();
    const cost = parseFloat(this.els.newExtraCost.value);

    if (!desc || isNaN(cost)) {
        this.showToast('Inserisci descrizione e costo', { type: 'error' });
        return;
    }

    this.structureData.extras.push({ id: Date.now(), desc, cost });
    this.structureData.extrasTotalOverride = null; // Reset override

    this.els.newExtraDesc.value = '';
    this.els.newExtraCost.value = '';

    this.renderExtras();
    this.recalculate();
};

UI.removeExtra = function (id) {
    this.structureData.extras = this.structureData.extras.filter(x => x.id !== id);
    this.structureData.extrasTotalOverride = null;
    this.renderExtras();
    this.recalculate();
};

UI.renderExtras = function () {
    this.els.extrasList.innerHTML = '';
    this.structureData.extras.forEach(extra => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center bg-white p-2 rounded border border-gray-200 text-sm';
        div.innerHTML = `
            <span>${extra.desc}</span>
            <div class="flex items-center gap-2">
                <span class="font-bold">€ ${extra.cost.toFixed(2)}</span>
                <button class="text-red-500 hover:text-red-700 font-bold px-1 scale-125" data-id="${extra.id}">×</button>
            </div>
        `;
        div.querySelector('button').addEventListener('click', () => this.removeExtra(extra.id));
        this.els.extrasList.appendChild(div);
    });
};

UI.recalculate = function () {
    const d = this.structureData;
    const totalPeople = d.scouts + d.staff;

    // --- Base Cost ---
    // LOGIC: Staff are included in the 'totalPeople' count for generating the base cost (if per-person).
    // They generally don't pay internally, so the total cost is divided only by d.scouts later.
    let calcBase = 0;
    if (d.baseType === 'person_night') {
        calcBase = totalPeople * d.nights * d.baseRate;
    } else if (d.baseType === 'person_day') {
        calcBase = totalPeople * d.days * d.baseRate;
    } else if (d.baseType === 'person_flat') {
        calcBase = totalPeople * d.baseRate;
    } else if (d.baseType === 'group_flat') {
        calcBase = d.baseRate;
    }

    const finalBase = d.baseTotalOverride !== null ? d.baseTotalOverride : calcBase;

    // Update input if not focused (avoid fighting user input)
    if (document.activeElement !== this.els.baseTotal) {
        this.els.baseTotal.value = finalBase.toFixed(2);
    }

    // --- Utilities ---
    let calcUtil = 0;
    const elecDiff = Math.max(0, d.utilities.elec.end - d.utilities.elec.start);
    const gasDiff = Math.max(0, d.utilities.gas.end - d.utilities.gas.start);

    calcUtil += (elecDiff * d.utilities.elec.rate);
    calcUtil += (gasDiff * d.utilities.gas.rate);

    const finalUtil = d.utilitiesTotalOverride !== null ? d.utilitiesTotalOverride : calcUtil;

    if (document.activeElement !== this.els.utilitiesTotal) {
        this.els.utilitiesTotal.value = finalUtil.toFixed(2);
    }

    // --- Extras ---
    let calcExtras = d.extras.reduce((sum, item) => sum + item.cost, 0);
    const finalExtras = d.extrasTotalOverride !== null ? d.extrasTotalOverride : calcExtras;

    if (document.activeElement !== this.els.extrasTotal) {
        this.els.extrasTotal.value = finalExtras.toFixed(2);
    }

    // --- Grand Total ---
    const grandTotal = finalBase + finalUtil + finalExtras;
    this.els.grandTotal.textContent = `€ ${grandTotal.toFixed(2)}`;

    // --- Per Person ---
    // User Cost Logic: Structure costs (Base + Utils + Extra) are generally divided among Scouts.
    // Staff are NOT included in the divisor, so the cost falls on Scouts.
    let perPerson = 0;
    if (d.scouts > 0) {
        perPerson = grandTotal / d.scouts;
        this.els.perPersonTotal.textContent = `€ ${perPerson.toFixed(2)}`;
    } else {
        this.els.perPersonTotal.textContent = "---";
    }
};
