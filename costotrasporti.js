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

    // Calculate scouts present or 'Assente' but maybe we assume 'Presente'?
    // Usually for cost planning we care about who comes.
    // Let's count 'Presente' in presences. If future, maybe all active scouts?
    // User said: "recuperare il numero degli esploratori partecipanti".
    // If activity is in future, maybe presenze are not set yet.
    // Fallback: If no presences marked 'Presente', maybe default to 0 and warn?
    // checking presences

    const presences = this.state.presences || [];
    const activityPresences = presences.filter(p => p.attivitaId === this.selectedActivityId && p.stato === 'Presente');

    if (activityPresences.length > 0) {
        this.scoutsCount = activityPresences.length;
    } else {
        // If no presences, maybe use all active scouts as default? 
        // Or simpler: just 0 and let user know. 
        // Given the context of "Planning", usually presences are taken BEFORE or assumed.
        // Let's assume 0 if nothing marked.
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

    // We need current counts to calculate per-leg details for display
    const totalPassengers = this.scoutsCount + this.staffCount;

    this.legs.forEach(leg => {
        const details = this.calculateLegCost(leg, totalPassengers);

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${leg.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
        ${leg.convention ? '<span class="text-green-600 font-bold">✓ Si</span>' : '<span class="text-gray-400">No</span>'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">€ ${leg.cost.toFixed(2)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
        ${details.freeTickets} <span class="text-xs text-gray-500">(Gratis)</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
        ${details.payingPassengers}
        ${details.discountApplied ? '<span class="text-xs text-green-600 block">(-20%)</span>' : ''}
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

UI.calculateLegCost = function (leg, totalPassengers) {
    let freeTickets = 0;
    let discountApplied = false;
    let unitCost = leg.cost;

    if (leg.convention && totalPassengers >= 10) {
        discountApplied = true;
        unitCost = leg.cost * 0.80; // 20% discount

        // Calculate free tickets: "2 gratis oltre i primi 10... a ogni soglia di 10"
        // Logic decided: For every group of 10 AFTER the first 10, the first 2 are free.
        // i.e., Passengers 11, 12 are free. 13-20 pay. 21, 22 free. 23-30 pay.

        // We iterate from 11 up to totalPassengers
        if (totalPassengers > 10) {
            for (let i = 11; i <= totalPassengers; i++) {
                // Position in the block of 10 (0-9)
                const posInTen = (i - 11) % 10;
                if (posInTen < 2) {
                    freeTickets++;
                }
            }
        }
    }

    const payingPassengers = Math.max(0, totalPassengers - freeTickets);
    const totalCost = payingPassengers * unitCost;

    return {
        freeTickets,
        payingPassengers,
        discountApplied,
        totalCost,
        unitCost
    };
};

UI.recalculate = function () {
    const totalPassengers = this.scoutsCount + this.staffCount;
    let tripTotal = 0;

    this.legs.forEach(leg => {
        const details = this.calculateLegCost(leg, totalPassengers);
        tripTotal += details.totalCost;
    });

    // Cost per scout is tripTotal / scoutsCount
    // If scoutsCount is 0, avoid division by zero
    let perScout = 0;
    if (this.scoutsCount > 0) {
        perScout = tripTotal / this.scoutsCount;
    }

    this.qs('#totalTripCost').textContent = `€ ${tripTotal.toFixed(2)}`;

    // Format huge numbers if 0 scouts
    if (this.scoutsCount === 0 && tripTotal > 0) {
        this.qs('#costPerScout').textContent = "---";
    } else {
        this.qs('#costPerScout').textContent = `€ ${perScout.toFixed(2)}`;
    }
};
