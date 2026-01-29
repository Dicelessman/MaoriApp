/**
 * costotrasporti.js - Logica per il calcolo dei costi di trasporto
 */

UI.renderCurrentPage = async function () {
    this.initTransportCalculator();
};

UI.initTransportCalculator = async function () {
    // Config
    this.selectedActivityId = null;
    this.scoutsCount = 0;
    this.staffCount = 0;
    this.legs = [];

    // DOM Elements
    const activitySelect = this.qs('#selectActivity');
    const staffInput = this.qs('#staffCount');
    const addLegForm = this.qs('#addLegForm');

    // Load Activities
    await this.populateActivitySelect(activitySelect);

    // Listeners
    activitySelect.addEventListener('change', (e) => {
        this.selectedActivityId = e.target.value;
        this.updateScountsCount();
        this.recalculate();
    });

    staffInput.addEventListener('input', (e) => {
        this.staffCount = parseInt(e.target.value) || 0;
        this.updateCountsDisplay();
        this.recalculate();
    });

    addLegForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addLeg();
    });
};

UI.populateActivitySelect = async function (selectElement) {
    const activities = this.state.activities || [];
    // Filter for relevant activities (e.g., Uscita, Campo, or future/recent)
    // For now, sorting by date descending
    const sorted = [...activities].sort((a, b) => {
        const da = new Date(a.data);
        const db = new Date(b.data);
        return db - da;
    });

    selectElement.innerHTML = '<option value="">Seleziona un\'attività...</option>';
    sorted.forEach(act => {
        const dateStr = new Date(act.data).toLocaleDateString('it-IT');
        const opt = document.createElement('option');
        opt.value = act.id;
        opt.textContent = `${dateStr} - ${act.tipo} - ${act.descrizione || ''}`;
        selectElement.appendChild(opt);
    });
};

UI.updateScountsCount = function () {
    if (!this.selectedActivityId) {
        this.scoutsCount = 0;
        this.updateCountsDisplay();
        return;
    }

    const presences = this.state.presences || [];
    const activityPresences = presences.filter(p => p.attivitaId === this.selectedActivityId && p.stato === 'Presente');

    if (activityPresences.length > 0) {
        this.scoutsCount = activityPresences.length;
    } else {
        this.scoutsCount = 0;
        this.showToast('Nessun esploratore segnato come Presente per questa attività.', { type: 'info' });
    }

    this.updateCountsDisplay();
};

UI.updateCountsDisplay = function () {
    const total = this.scoutsCount + this.staffCount;
    this.qs('#scoutsCountDisplay').textContent = this.scoutsCount;
    this.qs('#staffCountDisplay').textContent = this.staffCount;
    this.qs('#totalPassengersDisplay').textContent = total;
};

UI.addLeg = function () {
    const name = this.qs('#legName').value.trim();
    const cost = parseFloat(this.qs('#legCost').value);
    const convention = this.qs('#legConvention').checked;

    if (!name || isNaN(cost)) {
        this.showToast('Inserisci dati validi per la tratta', { type: 'error' });
        return;
    }

    this.legs.push({ id: Date.now(), name, cost, convention });
    this.qs('#addLegForm').reset();
    this.renderLegs();
    this.recalculate();
};

UI.removeLeg = function (id) {
    this.legs = this.legs.filter(l => l.id !== id);
    this.renderLegs();
    this.recalculate();
};

UI.renderLegs = function () {
    const tbody = this.qs('#legsTableBody');
    tbody.innerHTML = '';

    if (this.legs.length === 0) {
        tbody.innerHTML = `
      <tr id="emptyLegsRow">
        <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">Nessuna tratta aggiunta</td>
      </tr>`;
        return;
    }

    this.legs.forEach(leg => {
        const details = this.calculateLegCost(leg, this.scoutsCount, this.staffCount);

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${leg.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
        ${leg.convention ? '<span class="text-green-600 font-bold">✓ Si</span>' : '<span class="text-gray-400">No</span>'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">€ ${details.unitCost.toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
        ${details.freeStaff} Staff <span class="text-xs text-gray-500">(Gratis)</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
        ${this.scoutsCount + details.payingStaff}
        <span class="text-xs text-gray-500 block">(${this.scoutsCount} E + ${details.payingStaff} S)</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">€ ${details.totalCost.toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
        <button class="text-red-600 hover:text-red-900 delete-leg-btn" data-id="${leg.id}">Elimina</button>
      </td>
    `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.delete-leg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            this.removeLeg(parseInt(btn.dataset.id));
        });
    });
};

UI.calculateLegCost = function (leg, scoutsCount, staffCount) {
    const totalPassengers = scoutsCount + staffCount;
    let freeStaff = 0;
    let discountApplied = false;
    let unitCost = leg.cost;

    // 1. Convention Applicability (Total Passengers >= 10)
    // "passeggeri >=10 tutti i biglietti vengono scontanti del 20%"
    if (leg.convention && totalPassengers >= 10) {
        discountApplied = true;
        unitCost = leg.cost * 0.80; // 20% discount

        // 2. Free Staff Calculation (Based on SCOUTS count)
        // "esploratori >=10, fino a 2 staff massimo non pagaono il biglietto"
        // "esploratori >=20, fino a 4 staff..." -> 2 free staff for every 10 scouts
        const maxFreeStaff = Math.floor(scoutsCount / 10) * 2;

        // The actual free tickets are limited by the number of staff present
        freeStaff = Math.min(staffCount, maxFreeStaff);
    }

    // "Staff... generano il costo del proprio biglietto... ma non contribuiscono"
    // "Esploratori... pagano la loro quota e si distribuiscono quella dello staff"

    // Costs
    const payingStaff = staffCount - freeStaff;

    // Scout cost: All scouts generate a cost (discounted if applicable)
    const scoutsCost = scoutsCount * unitCost;

    // Staff cost: Only non-free staff generate a cost
    const staffCost = payingStaff * unitCost;

    const totalCost = scoutsCost + staffCost;

    return {
        freeStaff,
        payingStaff,
        discountApplied,
        totalCost,
        unitCost,
        scoutsCost,
        staffCost
    };
};

UI.recalculate = function () {
    let tripTotal = 0;

    this.legs.forEach(leg => {
        // Pass specific counts, not just total
        const details = this.calculateLegCost(leg, this.scoutsCount, this.staffCount);
        tripTotal += details.totalCost;
    });

    // Cost per scout is tripTotal / scoutsCount
    // "Il costo... ricade sugli esploratori"
    let perScout = 0;
    if (this.scoutsCount > 0) {
        perScout = tripTotal / this.scoutsCount;
    }

    this.qs('#totalTripCost').textContent = `€ ${tripTotal.toFixed(2)}`;

    if (this.scoutsCount === 0 && tripTotal > 0) {
        this.qs('#costPerScout').textContent = "---";
    } else {
        this.qs('#costPerScout').textContent = `€ ${perScout.toFixed(2)}`;
    }
};
