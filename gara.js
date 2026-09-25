// gara.js - Gestione della Gara di Reparto, tabellone classifica e categorie personalizzabili

// Data Proxy per compatibilità con ambienti browser e test Node.js
const DATA = new Proxy({}, {
    get(target, prop) {
        const facade = (typeof window !== 'undefined' && window.DATA) || (typeof globalThis !== 'undefined' && globalThis.DATA);
        if (facade && typeof facade[prop] === 'function') {
            return facade[prop].bind(facade);
        }
        if (facade && prop in facade) {
            return facade[prop];
        }
        return undefined;
    }
});

// Assicura l'oggetto globale UI
const UI = (typeof window !== 'undefined' && window.UI) ? window.UI : (typeof globalThis !== 'undefined' && globalThis.UI ? globalThis.UI : {});
if (typeof window !== 'undefined') window.UI = UI;
if (typeof globalThis !== 'undefined') globalThis.UI = UI;

// Stato locale per Gara di Reparto
UI.garaState = {
    selectedYear: null,
    categories: [],
    punti: [],
    patrols: [],
    activities: [],
    filterSquadriglia: 'all',
    filterCategoria: 'all',
    searchQuery: ''
};

// ============================================================
// Inizializzazione della Pagina
// ============================================================
UI.initGaraPage = async function () {
    try {
        if (typeof this.showLoadingOverlay === 'function') {
            this.showLoadingOverlay('Caricamento Gara di Reparto...');
        }

        // Anno scout iniziale
        const currentYear = typeof this.getCurrentScoutYear === 'function' ? this.getCurrentScoutYear() : '2025/2026';
        if (!this.garaState.selectedYear) {
            this.garaState.selectedYear = currentYear;
        }

        // Carica dati di base dell'applicazione
        if (!this.state || !this.state.activities || this.state.activities.length === 0) {
            this.state = await DATA.loadAll();
        }

        // Carica Squadriglie
        let patrols = await DATA.getPatrols();
        if (!patrols || patrols.length === 0) {
            patrols = ['Aironi', 'Marmotte'];
        }
        this.garaState.patrols = patrols;
        this.garaState.activities = this.state.activities || [];

        // Inizializza selettore Anno Scout
        this.initGaraScoutYearSelector();

        // Carica dati Gara per l'anno scout selezionato
        await this.loadGaraDataForYear(this.garaState.selectedYear);

        // Setup Event Listeners
        this.setupGaraEventListeners();

        // Renderizza la pagina
        this.renderGaraDashboard();

        if (typeof this.hideLoadingOverlay === 'function') {
            this.hideLoadingOverlay();
        }
    } catch (e) {
        console.error('Errore inizializzazione Gara di Reparto:', e);
        if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
        if (typeof this.showToast === 'function') {
            this.showToast('Errore durante il caricamento dei dati di gara: ' + e.message, { type: 'error' });
        }
    }
};

// ============================================================
// Caricamento Dati Gara per Anno
// ============================================================
UI.loadGaraDataForYear = async function (annoScout) {
    this.garaState.selectedYear = annoScout;
    const [cats, punti] = await Promise.all([
        DATA.getGaraCategories(annoScout),
        DATA.getGaraPunti(annoScout)
    ]);
    this.garaState.categories = cats || [];
    this.garaState.punti = punti || [];
};

// ============================================================
// Setup Selettore Anno Scout
// ============================================================
UI.initGaraScoutYearSelector = function () {
    const sel = this.qs ? this.qs('#scoutYearSelect') : document.querySelector('#scoutYearSelect');
    if (!sel) return;

    let years = typeof this.getAllScoutYears === 'function' ? this.getAllScoutYears(this.garaState.activities) : ['2025/2026', '2024/2025'];
    if (!years.includes(this.garaState.selectedYear)) {
        years.unshift(this.garaState.selectedYear);
    }

    sel.innerHTML = years.map(y => `
        <option value="${y}" ${y === this.garaState.selectedYear ? 'selected' : ''}>
            ${y}
        </option>
    `).join('');
};

// ============================================================
// Calcolo Statistiche e Classifica
// ============================================================
UI.calculateGaraLeaderboard = function () {
    const patrols = this.garaState.patrols || [];
    const punti = this.garaState.punti || [];
    const categories = this.garaState.categories || [];

    // Mappa per ogni squadriglia
    const rankingMap = {};
    patrols.forEach(p => {
        rankingMap[p] = {
            squadriglia: p,
            totalePunti: 0,
            assegnazioniCount: 0,
            puntiPerCategoria: {},
            ultimoPunteggioData: null
        };
        categories.forEach(c => {
            rankingMap[p].puntiPerCategoria[c.id] = 0;
        });
    });

    punti.forEach(entry => {
        const sq = entry.squadriglia;
        if (!rankingMap[sq]) {
            rankingMap[sq] = {
                squadriglia: sq,
                totalePunti: 0,
                assegnazioniCount: 0,
                puntiPerCategoria: {},
                ultimoPunteggioData: null
            };
        }
        const pts = Number(entry.punti) || 0;
        rankingMap[sq].totalePunti += pts;
        rankingMap[sq].assegnazioniCount += 1;
        if (entry.categoriaId) {
            rankingMap[sq].puntiPerCategoria[entry.categoriaId] = (rankingMap[sq].puntiPerCategoria[entry.categoriaId] || 0) + pts;
        }
        if (entry.data && (!rankingMap[sq].ultimoPunteggioData || entry.data > rankingMap[sq].ultimoPunteggioData)) {
            rankingMap[sq].ultimoPunteggioData = entry.data;
        }
    });

    // Ordina per punti decrescenti
    const sorted = Object.values(rankingMap).sort((a, b) => {
        if (b.totalePunti !== a.totalePunti) {
            return b.totalePunti - a.totalePunti;
        }
        return a.squadriglia.localeCompare(b.squadriglia, 'it');
    });

    return sorted;
};

// ============================================================
// Render Principale della Dashboard
// ============================================================
UI.renderGaraDashboard = function () {
    const leaderboard = this.calculateGaraLeaderboard();
    const punti = this.garaState.punti || [];
    const categories = this.garaState.categories || [];

    // 1. Metric Cards
    this.renderGaraMetrics(leaderboard, punti, categories);

    // 2. Podium (Top 3)
    this.renderGaraPodium(leaderboard);

    // 3. Complete Ranking List with Progress Bars & Category Badges
    this.renderGaraRankingList(leaderboard, categories);

    // 4. Historical Points Table
    this.renderGaraHistoryTable();

    // 5. Aggiorna Dropdowns nei Filtri e Modali
    this.updateGaraDropdowns();
};

// ============================================================
// Render Metriche di Riepilogo
// ============================================================
UI.renderGaraMetrics = function (leaderboard, punti, categories) {
    const leader = leaderboard[0];
    const leaderPatrolEl = this.qs('#statLeaderPatrol');
    const leaderPointsEl = this.qs('#statLeaderPoints');
    if (leaderPatrolEl && leaderPointsEl) {
        if (leader && leader.totalePunti > 0) {
            leaderPatrolEl.textContent = `Sq. ${leader.squadriglia}`;
            leaderPointsEl.textContent = `${leader.totalePunti} punti conquistati`;
        } else {
            leaderPatrolEl.textContent = 'Parità / In attesa';
            leaderPointsEl.textContent = '0 punti';
        }
    }

    const totalPointsEl = this.qs('#statTotalPoints');
    const totalAssignmentsEl = this.qs('#statTotalAssignments');
    if (totalPointsEl && totalAssignmentsEl) {
        const total = punti.reduce((acc, p) => acc + (Number(p.punti) || 0), 0);
        totalPointsEl.textContent = total;
        totalAssignmentsEl.textContent = `${punti.length} assegnazioni totali`;
    }

    const patrolCountEl = this.qs('#statPatrolCount');
    if (patrolCountEl) {
        patrolCountEl.textContent = (this.garaState.patrols || []).length;
    }

    const topCategoryEl = this.qs('#statTopCategory');
    const topCategoryPointsEl = this.qs('#statTopCategoryPoints');
    if (topCategoryEl && topCategoryPointsEl) {
        // Trova la categoria con più punti totali assegnati
        const catTotals = {};
        punti.forEach(p => {
            if (p.categoriaId) {
                catTotals[p.categoriaId] = (catTotals[p.categoriaId] || 0) + (Number(p.punti) || 0);
            }
        });
        let bestCatId = null;
        let maxCatPts = -Infinity;
        Object.entries(catTotals).forEach(([id, sum]) => {
            if (sum > maxCatPts) {
                maxCatPts = sum;
                bestCatId = id;
            }
        });

        if (bestCatId) {
            const catObj = categories.find(c => c.id === bestCatId);
            const icon = catObj?.icona || '⭐';
            const name = catObj?.nome || 'Attività';
            topCategoryEl.textContent = `${icon} ${name}`;
            topCategoryPointsEl.textContent = `${maxCatPts} punti accumulati`;
        } else {
            topCategoryEl.textContent = '-';
            topCategoryPointsEl.textContent = '0 punti';
        }
    }
};

// ============================================================
// Render Podio (1°, 2°, 3° Posto)
// ============================================================
UI.renderGaraPodium = function (leaderboard) {
    const container = this.qs('#podiumContainer');
    if (!container) return;

    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = `
            <div class="col-span-3 text-center py-6 text-gray-500 text-sm">
                Nessuna squadriglia registrata nella gara di reparto.
            </div>
        `;
        return;
    }

    const first = leaderboard[0];
    const second = leaderboard.length > 1 ? leaderboard[1] : null;
    const third = leaderboard.length > 2 ? leaderboard[2] : null;

    // Configurazione visiva dei gradini del podio (2° a sinistra, 1° al centro più alto, 3° a destra)
    const podiumItems = [
        {
            pos: 2,
            medal: '🥈',
            label: '2° Posto',
            titleColor: 'text-slate-700 dark:text-slate-200',
            bgColor: 'bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-750 border-slate-300 dark:border-slate-600',
            badgeBg: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
            data: second,
            orderClass: 'order-2 md:order-1'
        },
        {
            pos: 1,
            medal: '🥇',
            label: '1° Posto - Campioni',
            titleColor: 'text-amber-800 dark:text-amber-200',
            bgColor: 'bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 dark:from-amber-900/60 dark:via-amber-800/40 dark:to-amber-950 border-amber-300 dark:border-amber-600 shadow-md',
            badgeBg: 'bg-amber-300 text-amber-900 font-extrabold dark:bg-amber-700 dark:text-amber-100',
            data: first,
            orderClass: 'order-1 md:order-2 md:-translate-y-2'
        },
        {
            pos: 3,
            medal: '🥉',
            label: '3° Posto',
            titleColor: 'text-amber-900 dark:text-amber-400',
            bgColor: 'bg-gradient-to-t from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-orange-900/20 border-orange-200 dark:border-orange-800',
            badgeBg: 'bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-200',
            data: third,
            orderClass: 'order-3 md:order-3'
        }
    ];

    container.innerHTML = podiumItems.map(item => {
        if (!item.data) {
            return `
                <div class="${item.orderClass} rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-4 text-center text-gray-400 text-xs">
                    <span class="text-xl">${item.medal}</span>
                    <div class="mt-1">${item.label}</div>
                    <div class="text-[11px] text-gray-400 mt-2">Nessuna Sq.</div>
                </div>
            `;
        }

        const sq = item.data;
        return `
            <div class="${item.orderClass} ${item.bgColor} rounded-2xl p-4 sm:p-5 border transition-transform hover:scale-[1.01] flex flex-col items-center text-center">
                <span class="text-3xl sm:text-4xl drop-shadow-sm mb-1">${item.medal}</span>
                <span class="text-[11px] font-bold uppercase tracking-wider ${item.badgeBg} px-2.5 py-0.5 rounded-full mb-2">
                    ${item.label}
                </span>
                <h4 class="text-xl sm:text-2xl font-black ${item.titleColor} tracking-tight">
                    Sq. ${sq.squadriglia}
                </h4>
                <div class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                    ${sq.totalePunti} <span class="text-xs font-semibold text-gray-500 uppercase">punti</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span>${sq.assegnazioniCount} eventi</span>
                    <span>•</span>
                    <button type="button" onclick="UI.quickAddPointsToPatrol('${sq.squadriglia}')" class="text-green-700 dark:text-green-400 hover:underline font-semibold cursor-pointer">
                        + Punti
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

// ============================================================
// Render Classifica Dettagliata con Barre e Categorie
// ============================================================
UI.renderGaraRankingList = function (leaderboard, categories) {
    const listContainer = this.qs('#patrolRankingList');
    if (!listContainer) return;

    if (!leaderboard || leaderboard.length === 0) {
        listContainer.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">Nessun dato di classifica presente.</div>';
        return;
    }

    const topPoints = Math.max(1, leaderboard[0].totalePunti);

    listContainer.innerHTML = leaderboard.map((sq, index) => {
        const rank = index + 1;
        const percentage = Math.max(5, Math.round((sq.totalePunti / topPoints) * 100));
        const distacco = index === 0 ? 'Leader' : `-${leaderboard[0].totalePunti - sq.totalePunti} pt`;

        // Genera pillole di punteggio per categoria per squadriglia
        const categoryPillsHtml = categories.map(cat => {
            const pts = sq.puntiPerCategoria[cat.id] || 0;
            if (pts === 0) return '';
            return `
                <span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-medium" title="${cat.nome}: ${pts} pt">
                    <span>${cat.icona || '⭐'}</span>
                    <span>${pts}</span>
                </span>
            `;
        }).filter(Boolean).join('');

        return `
            <div class="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <span class="flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${rank === 1 ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' : rank === 2 ? 'bg-slate-300 text-slate-900' : rank === 3 ? 'bg-orange-300 text-orange-950' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}">
                            ${rank}°
                        </span>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-base text-gray-900 dark:text-gray-100">Squadriglia ${sq.squadriglia}</span>
                                <span class="text-xs px-2 py-0.5 rounded-full font-medium ${index === 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}">
                                    ${distacco}
                                </span>
                            </div>
                            <div class="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                <span>${sq.assegnazioniCount} volte a punteggio</span>
                                ${sq.ultimoPunteggioData ? `<span>• Ultimo: ${sq.ultimoPunteggioData}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 justify-between sm:justify-end">
                        <div class="text-right">
                            <span class="text-2xl font-black text-gray-900 dark:text-white">${sq.totalePunti}</span>
                            <span class="text-xs text-gray-500 font-semibold block -mt-1">Punti</span>
                        </div>
                        <button type="button" onclick="UI.quickAddPointsToPatrol('${sq.squadriglia}')" class="btn-secondary text-xs px-2.5 py-1.5 font-semibold text-green-700 dark:text-green-400 hover:bg-green-50">
                            + Punti
                        </button>
                    </div>
                </div>

                <!-- Barra di progressione visuale -->
                <div class="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 mt-3 overflow-hidden">
                    <div class="h-2.5 rounded-full ${rank === 1 ? 'bg-amber-400' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-orange-400' : 'bg-green-600'} transition-all duration-500" style="width: ${percentage}%"></div>
                </div>

                <!-- Breakdown Categorie -->
                ${categoryPillsHtml ? `
                    <div class="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span class="text-[11px] font-semibold text-gray-400 mr-1">Categorie:</span>
                        ${categoryPillsHtml}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
};

// ============================================================
// Render Tabella Storico Punti
// ============================================================
UI.renderGaraHistoryTable = function () {
    const tbody = this.qs('#puntiHistoryTableBody');
    if (!tbody) return;

    let list = (this.garaState.punti || []).slice();

    // Filtra per Squadriglia
    if (this.garaState.filterSquadriglia && this.garaState.filterSquadriglia !== 'all') {
        list = list.filter(p => p.squadriglia === this.garaState.filterSquadriglia);
    }

    // Filtra per Categoria
    if (this.garaState.filterCategoria && this.garaState.filterCategoria !== 'all') {
        list = list.filter(p => p.categoriaId === this.garaState.filterCategoria);
    }

    // Filtra per Query Testuale
    if (this.garaState.searchQuery && this.garaState.searchQuery.trim() !== '') {
        const q = this.garaState.searchQuery.toLowerCase().trim();
        list = list.filter(p =>
            (p.attivitaNome && p.attivitaNome.toLowerCase().includes(q)) ||
            (p.motivazione && p.motivazione.toLowerCase().includes(q)) ||
            (p.squadriglia && p.squadriglia.toLowerCase().includes(q)) ||
            (p.categoriaNome && p.categoriaNome.toLowerCase().includes(q))
        );
    }

    // Ordina per data decrescente
    list.sort((a, b) => {
        const dateA = a.data || '';
        const dateB = b.data || '';
        return dateB.localeCompare(dateA);
    });

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="py-8 text-center text-gray-400 text-sm">
                    Nessuna assegnazione punti corrisponde ai filtri selezionati.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map(entry => {
        const isPositive = (Number(entry.punti) || 0) >= 0;
        const ptsSign = isPositive ? `+${entry.punti}` : `${entry.punti}`;
        const ptsBadgeClass = isPositive
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold'
            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold';

        const catObj = this.garaState.categories.find(c => c.id === entry.categoriaId);
        const icon = catObj?.icona || '⭐';

        return `
            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-750/40 transition-colors">
                <td class="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    ${entry.data || '-'}
                </td>
                <td class="py-3 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    Sq. ${entry.squadriglia}
                </td>
                <td class="py-3 px-4 text-gray-700 dark:text-gray-300 text-xs">
                    ${entry.attivitaNome || '<span class="text-gray-400">Riunione</span>'}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
                        <span>${icon}</span>
                        <span>${entry.categoriaNome || catObj?.nome || 'Attività'}</span>
                    </span>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs ${ptsBadgeClass}">
                        ${ptsSign}
                    </span>
                </td>
                <td class="py-3 px-4 text-xs text-gray-600 dark:text-gray-300 max-w-xs break-words">
                    ${entry.motivazione || '-'}
                </td>
                <td class="py-3 px-4 text-[11px] text-gray-400 whitespace-nowrap">
                    ${entry.assegnatoDa || 'staff'}
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                    <button type="button" onclick="UI.deletePuntiEntry('${entry.id}')" class="p-1 text-red-600 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors" title="Elimina assegnazione">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
};

// ============================================================
// Aggiorna Dropdowns e Filtri
// ============================================================
UI.updateGaraDropdowns = function () {
    const patrols = this.garaState.patrols || [];
    const categories = this.garaState.categories || [];
    const activities = this.garaState.activities || [];

    // 1. Filtro Squadriglia nello storico
    const filterSq = this.qs('#filterSquadrigliaSelect');
    if (filterSq) {
        const curVal = filterSq.value;
        filterSq.innerHTML = `<option value="all">Tutte le Sq.</option>` +
            patrols.map(p => `<option value="${p}">${p}</option>`).join('');
        if (curVal && (curVal === 'all' || patrols.includes(curVal))) {
            filterSq.value = curVal;
        }
    }

    // 2. Filtro Categoria nello storico
    const filterCat = this.qs('#filterCategoriaSelect');
    if (filterCat) {
        const curVal = filterCat.value;
        filterCat.innerHTML = `<option value="all">Tutte le categorie</option>` +
            categories.map(c => `<option value="${c.id}">${c.icona || '⭐'} ${c.nome}</option>`).join('');
        if (curVal) filterCat.value = curVal;
    }

    // 3. Modale Assegna Punti - Squadriglia
    const modalSq = this.qs('#assegnaSquadrigliaSelect');
    if (modalSq) {
        modalSq.innerHTML = patrols.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    // 4. Modale Assegna Punti - Categorie
    const modalCat = this.qs('#assegnaCategoriaSelect');
    if (modalCat) {
        modalCat.innerHTML = categories.map(c => `
            <option value="${c.id}" data-punti="${c.puntiDefault || 10}">
                ${c.icona || '⭐'} ${c.nome} (+${c.puntiDefault || 10} pt)
            </option>
        `).join('');
    }

    // 5. Modale Assegna Punti - Attività da Calendario
    const modalAct = this.qs('#assegnaAttivitaSelect');
    if (modalAct) {
        modalAct.innerHTML = `<option value="">Nessuna / Riunione Ordinaria</option>` +
            activities.map(a => {
                const dateStr = a.data ? (typeof a.data === 'string' ? a.data.split('T')[0] : (a.data.toISOString ? a.data.toISOString().split('T')[0] : '')) : '';
                return `<option value="${a.id}" data-nome="${a.descrizione || a.tipo || ''}">
                    ${a.descrizione || a.tipo || 'Attività'} (${dateStr})
                </option>`;
            }).join('');
    }
};

// ============================================================
// Setup Event Listeners
// ============================================================
UI.setupGaraEventListeners = function () {
    // Cambio Anno Scout
    const yearSelect = this.qs('#scoutYearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', async (e) => {
            const newYear = e.target.value;
            this.showLoadingOverlay?.('Aggiornamento anno scout...');
            await this.loadGaraDataForYear(newYear);
            this.renderGaraDashboard();
            this.hideLoadingOverlay?.();
        });
    }

    // Filtri Storico
    const filterSq = this.qs('#filterSquadrigliaSelect');
    if (filterSq) {
        filterSq.addEventListener('change', (e) => {
            this.garaState.filterSquadriglia = e.target.value;
            this.renderGaraHistoryTable();
        });
    }

    const filterCat = this.qs('#filterCategoriaSelect');
    if (filterCat) {
        filterCat.addEventListener('change', (e) => {
            this.garaState.filterCategoria = e.target.value;
            this.renderGaraHistoryTable();
        });
    }

    const filterSearch = this.qs('#filterHistorySearch');
    if (filterSearch) {
        filterSearch.addEventListener('input', (e) => {
            this.garaState.searchQuery = e.target.value;
            this.renderGaraHistoryTable();
        });
    }

    // Apri Modale Assegna Punti
    const openAssegnaBtn = this.qs('#openAssegnaPuntiBtn');
    if (openAssegnaBtn) {
        openAssegnaBtn.addEventListener('click', () => {
            this.openAssegnaPuntiModal();
        });
    }

    // Chiudi Modale Assegna Punti
    this.qs('#closeAssegnaPuntiModal')?.addEventListener('click', () => this.closeAssegnaPuntiModal());
    this.qs('#cancelAssegnaPuntiBtn')?.addEventListener('click', () => this.closeAssegnaPuntiModal());

    // Switch Target: Singola Squadriglia vs Tutte
    const targetRadios = this.qsa ? this.qsa('input[name="targetSqType"]') : document.querySelectorAll('input[name="targetSqType"]');
    targetRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const container = this.qs('#singleSqContainer');
            if (container) {
                if (e.target.value === 'all') {
                    container.classList.add('hidden');
                } else {
                    container.classList.remove('hidden');
                }
            }
        });
    });

    // Cambio Categoria in Modale -> auto-popola punti di default
    const modalCatSelect = this.qs('#assegnaCategoriaSelect');
    if (modalCatSelect) {
        modalCatSelect.addEventListener('change', () => {
            const opt = modalCatSelect.selectedOptions[0];
            const defPts = opt ? opt.getAttribute('data-punti') : null;
            const ptsInput = this.qs('#assegnaPuntiInput');
            if (ptsInput && defPts) {
                ptsInput.value = defPts;
            }
        });
    }

    // Submit Form Assegnazione Punti
    const assegnaForm = this.qs('#assegnaPuntiForm');
    if (assegnaForm) {
        assegnaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitAssegnaPunti();
        });
    }

    // Gestione Categorie Modale
    const openCatsBtn = this.qs('#openGestioneCategorieBtn');
    if (openCatsBtn) {
        openCatsBtn.addEventListener('click', () => {
            this.openGestioneCategorieModal();
        });
    }
    this.qs('#closeGestioneCategorieModal')?.addEventListener('click', () => this.closeGestioneCategorieModal());
    this.qs('#doneGestioneCategorieBtn')?.addEventListener('click', () => this.closeGestioneCategorieModal());

    // Submit Nuova Categoria
    const newCatForm = this.qs('#newCategoryForm');
    if (newCatForm) {
        newCatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitNewCategory();
        });
    }

    // Esporta CSV
    const exportBtn = this.qs('#exportGaraBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            this.exportGaraCsv();
        });
    }
};

// ============================================================
// Modale Assegnazione Punti - Azioni
// ============================================================
UI.openAssegnaPuntiModal = function (defaultSquadriglia = null) {
    const modal = this.qs('#modalAssegnaPunti');
    if (!modal) return;

    // Reset form
    const form = this.qs('#assegnaPuntiForm');
    if (form) form.reset();

    // Data default = oggi
    const dataInput = this.qs('#assegnaDataInput');
    if (dataInput) {
        dataInput.value = new Date().toISOString().split('T')[0];
    }

    // Seleziona prima categoria e imposta punti default
    const catSelect = this.qs('#assegnaCategoriaSelect');
    if (catSelect && catSelect.options.length > 0) {
        const defPts = catSelect.options[0].getAttribute('data-punti') || '10';
        const ptsInput = this.qs('#assegnaPuntiInput');
        if (ptsInput) ptsInput.value = defPts;
    }

    // Se è specificata una squadriglia di default
    if (defaultSquadriglia) {
        const sqSelect = this.qs('#assegnaSquadrigliaSelect');
        if (sqSelect) sqSelect.value = defaultSquadriglia;
    }

    // Mostra selettore singola sq
    const singleContainer = this.qs('#singleSqContainer');
    if (singleContainer) singleContainer.classList.remove('hidden');

    modal.classList.remove('hidden');
};

UI.quickAddPointsToPatrol = function (patrolName) {
    this.openAssegnaPuntiModal(patrolName);
};

UI.closeAssegnaPuntiModal = function () {
    const modal = this.qs('#modalAssegnaPunti');
    if (modal) modal.classList.add('hidden');
};

UI.submitAssegnaPunti = async function () {
    try {
        const targetType = (this.qs('input[name="targetSqType"]:checked')?.value) || 'single';
        const catSelect = this.qs('#assegnaCategoriaSelect');
        const categoriaId = catSelect?.value;
        const categoriaNome = catSelect?.selectedOptions[0]?.textContent?.trim() || '';
        const punti = Number(this.qs('#assegnaPuntiInput')?.value);
        const data = this.qs('#assegnaDataInput')?.value || new Date().toISOString().split('T')[0];
        const motivazione = (this.qs('#assegnaMotivazioneInput')?.value || '').trim();

        // Attività
        const actSelect = this.qs('#assegnaAttivitaSelect');
        const customActName = (this.qs('#assegnaAttivitaNomeCustom')?.value || '').trim();
        const attivitaId = actSelect?.value || null;
        let attivitaNome = customActName;
        if (!attivitaNome && actSelect && actSelect.value) {
            attivitaNome = actSelect.selectedOptions[0]?.getAttribute('data-nome') || '';
        }

        if (isNaN(punti)) {
            this.showToast('Inserisci un punteggio valido.', { type: 'warning' });
            return;
        }

        let targets = [];
        if (targetType === 'all') {
            targets = this.garaState.patrols || [];
        } else {
            const sq = this.qs('#assegnaSquadrigliaSelect')?.value;
            if (!sq) {
                this.showToast('Seleziona una squadriglia.', { type: 'warning' });
                return;
            }
            targets = [sq];
        }

        this.showLoadingOverlay?.('Salvataggio punteggi...');

        const entries = targets.map(sq => ({
            squadriglia: sq,
            attivitaId,
            attivitaNome,
            categoriaId,
            categoriaNome,
            punti,
            motivazione,
            data,
            annoScout: this.garaState.selectedYear
        }));

        await DATA.addGaraPunti(entries, this.currentUser);

        // Ricarica dati e aggiorna interfaccia
        await this.loadGaraDataForYear(this.garaState.selectedYear);
        this.renderGaraDashboard();

        this.closeAssegnaPuntiModal();
        this.hideLoadingOverlay?.();

        const toastMsg = targets.length > 1
            ? `Assegnati ${punti} punti a tutte le ${targets.length} squadriglie!`
            : `Assegnati ${punti} punti alla Sq. ${targets[0]}!`;
        this.showToast(toastMsg, { type: 'success' });
    } catch (e) {
        console.error('Errore salvataggio punteggi:', e);
        this.hideLoadingOverlay?.();
        this.showToast('Errore durante il salvataggio: ' + e.message, { type: 'error' });
    }
};

// ============================================================
// Eliminazione Assegnazione Punti
// ============================================================
UI.deletePuntiEntry = async function (id) {
    if (!id) return;
    const confirmed = confirm('Sei sicuro di voler eliminare questa assegnazione di punti?');
    if (!confirmed) return;

    try {
        this.showLoadingOverlay?.('Eliminazione...');
        await DATA.deleteGaraPunti(id, this.currentUser);
        await this.loadGaraDataForYear(this.garaState.selectedYear);
        this.renderGaraDashboard();
        this.hideLoadingOverlay?.();
        this.showToast('Punteggio eliminato con successo', { type: 'info' });
    } catch (e) {
        console.error('Errore eliminazione punteggio:', e);
        this.hideLoadingOverlay?.();
        this.showToast('Errore durante l\'eliminazione: ' + e.message, { type: 'error' });
    }
};

// ============================================================
// Modale Gestione Categorie - Azioni
// ============================================================
UI.openGestioneCategorieModal = function () {
    const modal = this.qs('#modalGestioneCategorie');
    if (!modal) return;
    this.renderCategorieList();
    modal.classList.remove('hidden');
};

UI.closeGestioneCategorieModal = function () {
    const modal = this.qs('#modalGestioneCategorie');
    if (modal) modal.classList.add('hidden');
};

UI.renderCategorieList = function () {
    const container = this.qs('#categorieListContainer');
    if (!container) return;

    const cats = this.garaState.categories || [];
    if (cats.length === 0) {
        container.innerHTML = '<div class="text-xs text-gray-400 py-3 text-center">Nessuna categoria definita.</div>';
        return;
    }

    container.innerHTML = cats.map(cat => `
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div class="flex items-center gap-3">
                <span class="text-2xl">${cat.icona || '🏆'}</span>
                <div>
                    <div class="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span>${cat.nome}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                            +${cat.puntiDefault || 10} pt def.
                        </span>
                    </div>
                    ${cat.descrizione ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${cat.descrizione}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="UI.deleteCategory('${cat.id}')" class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors text-xs" title="Elimina categoria">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
};

UI.submitNewCategory = async function () {
    try {
        const icona = (this.qs('#newCatIcon')?.value || '🎯').trim();
        const nome = (this.qs('#newCatNome')?.value || '').trim();
        const puntiDefault = Number(this.qs('#newCatPunti')?.value) || 10;
        const descrizione = (this.qs('#newCatDescrizione')?.value || '').trim();

        if (!nome) {
            this.showToast('Inserisci il nome della categoria.', { type: 'warning' });
            return;
        }

        this.showLoadingOverlay?.('Aggiunta categoria...');
        await DATA.addGaraCategory({
            nome,
            icona,
            puntiDefault,
            descrizione,
            annoScout: this.garaState.selectedYear
        }, this.currentUser);

        await this.loadGaraDataForYear(this.garaState.selectedYear);
        this.renderCategorieList();
        this.updateGaraDropdowns();

        const form = this.qs('#newCategoryForm');
        if (form) form.reset();
        if (this.qs('#newCatIcon')) this.qs('#newCatIcon').value = '🎯';
        if (this.qs('#newCatPunti')) this.qs('#newCatPunti').value = '15';

        this.hideLoadingOverlay?.();
        this.showToast('Nuova categoria aggiunta!', { type: 'success' });
    } catch (e) {
        console.error('Errore aggiunta categoria:', e);
        this.hideLoadingOverlay?.();
        this.showToast('Errore aggiunta categoria: ' + e.message, { type: 'error' });
    }
};

UI.deleteCategory = async function (id) {
    if (!id) return;
    const confirmed = confirm('Eliminare questa categoria di punteggio?');
    if (!confirmed) return;

    try {
        this.showLoadingOverlay?.('Eliminazione...');
        await DATA.deleteGaraCategory(id, this.currentUser);
        await this.loadGaraDataForYear(this.garaState.selectedYear);
        this.renderCategorieList();
        this.updateGaraDropdowns();
        this.hideLoadingOverlay?.();
        this.showToast('Categoria eliminata', { type: 'info' });
    } catch (e) {
        console.error('Errore eliminazione categoria:', e);
        this.hideLoadingOverlay?.();
        this.showToast('Errore: ' + e.message, { type: 'error' });
    }
};

// ============================================================
// Esportazione CSV Classifica e Storico
// ============================================================
UI.exportGaraCsv = function () {
    const leaderboard = this.calculateGaraLeaderboard();
    const punti = this.garaState.punti || [];
    const year = this.garaState.selectedYear || 'reparto';

    let csv = `GARA DI REPARTO - CLASSIFICA ANNO SCOUT ${year}\n`;
    csv += `Posizione;Squadriglia;Punti Totali;Eventi Registrati\n`;
    leaderboard.forEach((sq, i) => {
        csv += `${i + 1};${sq.squadriglia};${sq.totalePunti};${sq.assegnazioniCount}\n`;
    });

    csv += `\nSTORICO ASSEGNAZIONI PUNTI\n`;
    csv += `Data;Squadriglia;Attivita;Categoria;Punti;Motivazione;Assegnato Da\n`;
    punti.forEach(p => {
        const safeMotivazione = (p.motivazione || '').replace(/"/g, '""');
        csv += `${p.data || ''};${p.squadriglia || ''};"${p.attivitaNome || ''}";"${p.categoriaNome || ''}";${p.punti || 0};"${safeMotivazione}";"${p.assegnatoDa || ''}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gara_Reparto_${year.replace('/', '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('Classifica e storico esportati in CSV!', { type: 'success' });
};

// ============================================================
// Auto-start al caricamento del DOM
// ============================================================
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        UI.initGaraPage();
    });
}
