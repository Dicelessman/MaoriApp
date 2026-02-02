/**
 * costocambusa.js - Logic for galley/food budget calculation
 */

UI.renderCurrentPage = async function () {
    this.initGalleyCalculator();
};

UI.initGalleyCalculator = async function () {
    // State
    this.galleyData = {
        scouts: 0,
        staff: 0,
        mode: 'meal', // 'meal' or 'day'
        quantity: 0, // meals count or days count
        rate: 0,     // cost per meal or cost per day

        competitionActive: false,
        competitionBudget: 0,
        mealsPerDay: 3 // Default for day mode deduction logic
    };

    // Elements
    const els = {
        activitySelect: this.qs('#selectActivity'),
        staffInput: this.qs('#staffCount'),
        scoutsDisplay: this.qs('#scoutsCountDisplay'),
        summaryScouts: this.qs('#summaryScouts'),

        modeRadios: document.querySelectorAll('input[name="calcMode"]'),
        quantityLabel: this.qs('#quantityLabel'),
        quantityInput: this.qs('#quantityInput'),
        rateLabel: this.qs('#rateLabel'),
        rateInput: this.qs('#rateInput'),

        compCheckbox: this.qs('#cookingCompActive'),
        compInputs: this.qs('#cookingCompInputs'),
        compBudget: this.qs('#cookingCompBudget'),

        mealsPerDayContainer: this.qs('#mealsPerDayContainer'),
        mealsPerDay: this.qs('#mealsPerDay'),

        foodSubtotal: this.qs('#foodSubtotal'),
        deductionDisplay: this.qs('#deductionDisplay'),
        deductionAmount: this.qs('#deductionAmount'),
        garaAddDisplay: this.qs('#garaAddDisplay'),
        garaAddAmount: this.qs('#garaAddAmount'),

        grandTotal: this.qs('#grandTotal'),
        perPersonTotal: this.qs('#perPersonTotal'),
    };
    this.els = els;

    await this.populateActivitySelect(els.activitySelect);

    // Event Listeners

    // Config
    els.activitySelect.addEventListener('change', (e) => {
        this.updateScoutsCountFromActivity(e.target.value);
        this.recalculateGalley();
    });
    els.staffInput.addEventListener('input', (e) => {
        this.galleyData.staff = parseFloat(e.target.value) || 0;
        this.recalculateGalley();
    });

    // Mode Switching
    els.modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            this.galleyData.mode = e.target.value;
            this.updateModeUI();
            this.recalculateGalley();
        });
    });

    // Inputs
    els.quantityInput.addEventListener('input', (e) => {
        this.galleyData.quantity = parseFloat(e.target.value) || 0;
        this.recalculateGalley();
    });
    els.rateInput.addEventListener('input', (e) => {
        this.galleyData.rate = parseFloat(e.target.value) || 0;
        this.recalculateGalley();
    });

    // Competition
    els.compCheckbox.addEventListener('change', (e) => {
        this.galleyData.competitionActive = e.target.checked;
        if (e.target.checked) {
            els.compInputs.classList.remove('hidden');
        } else {
            els.compInputs.classList.add('hidden');
        }
        this.updateModeUI(); // Check visibility of mealsPerDay
        this.recalculateGalley();
    });
    els.compBudget.addEventListener('input', (e) => {
        this.galleyData.competitionBudget = parseFloat(e.target.value) || 0;
        this.recalculateGalley();
    });

    // Meals Per Day Helper
    els.mealsPerDay.addEventListener('input', (e) => {
        this.galleyData.mealsPerDay = parseFloat(e.target.value) || 3;
        this.recalculateGalley();
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
        this.galleyData.scouts = 0;
    } else {
        const presences = this.state.presences || [];
        const activityPresences = presences.filter(p => p.attivitaId === actId && p.stato === 'Presente');
        this.galleyData.scouts = activityPresences.length;
    }

    // Update display
    this.els.scoutsDisplay.value = this.galleyData.scouts;
    this.els.summaryScouts.textContent = this.galleyData.scouts;
};

UI.updateModeUI = function () {
    const mode = this.galleyData.mode;
    if (mode === 'meal') {
        this.els.quantityLabel.textContent = 'Numero Pasti';
        this.els.rateLabel.textContent = 'Costo per Pasto (€)';
        this.els.mealsPerDayContainer.classList.add('hidden');
    } else {
        this.els.quantityLabel.textContent = 'Numero Giorni';
        this.els.rateLabel.textContent = 'Costo per Giorno (€)';
        // Show "Meals per day" only if competition is active (needed for deduction)
        if (this.galleyData.competitionActive) {
            this.els.mealsPerDayContainer.classList.remove('hidden');
        } else {
            this.els.mealsPerDayContainer.classList.add('hidden');
        }
    }
};

UI.recalculateGalley = function () {
    const d = this.galleyData;
    const totalPeople = d.scouts + d.staff;

    // 1. Calculate Standard Full Cost
    // Everyone eats, so total cost is based on totalPeople
    let standardCost = d.quantity * d.rate * totalPeople;

    // 2. Handle Competition Deduction & Addition
    let deduction = 0;

    if (d.competitionActive && totalPeople > 0) { // Only deduct if there are people
        if (d.mode === 'meal') {
            // Deduct 1 meal for everyone
            // Value of 1 meal = rate
            deduction = d.rate * totalPeople;
        } else {
            // Day mode
            // Deduct 1 meal based on (DailyRate / MealsPerDay)
            const mealValue = d.rate / Math.max(1, d.mealsPerDay);
            deduction = mealValue * totalPeople;
        }
    }

    // Cap deduction at standardCost (cannot have negative food cost)
    deduction = Math.min(deduction, standardCost);

    // 3. Final Totals
    const finalFoodCost = standardCost - deduction;
    const totalInternalBudget = finalFoodCost + (d.competitionActive ? d.competitionBudget : 0);

    // UI Updates
    this.els.foodSubtotal.textContent = `€ ${standardCost.toFixed(2)}`;

    if (d.competitionActive) {
        this.els.deductionDisplay.classList.remove('hidden');
        this.els.deductionAmount.textContent = `- € ${deduction.toFixed(2)}`;

        this.els.garaAddDisplay.classList.remove('hidden');
        this.els.garaAddAmount.textContent = `+ € ${d.competitionBudget.toFixed(2)}`;
    } else {
        this.els.deductionDisplay.classList.add('hidden');
        this.els.garaAddDisplay.classList.add('hidden');
    }

    this.els.grandTotal.textContent = `€ ${totalInternalBudget.toFixed(2)}`;

    // Per Scout (Staff cost shared)
    let perScout = 0;
    if (d.scouts > 0) {
        perScout = totalInternalBudget / d.scouts;
        this.els.perPersonTotal.textContent = `€ ${perScout.toFixed(2)}`;
    } else {
        this.els.perPersonTotal.textContent = "---";
    }
};
