/**
 * Scadenze Controller - Gestione e visualizzazione delle scadenze dell'anno scout
 * @module scadenze
 */

import { DATA } from './js/data/data-facade.js';
import { UI } from './js/ui/ui.js';
import {
    getAllScoutYearDeadlines,
    getCurrentScoutYear,
    getAllScoutYears,
    toJsDate,
    generateWhatsAppReminderUrl
} from './js/utils/utils.js';

class ScadenzeController {
    constructor() {
        this.selectedYear = null;
        this.allDeadlines = [];
        this.customDeadlines = [];
        this.currentFilterCat = 'all';
        this.currentFilterStatus = 'all';
        this.currentSort = 'date-asc';
        this.searchQuery = '';
        this.editingDeadlineId = null;
    }

    async init() {
        console.log('ScadenzeController: Inizializzazione...');

        // Attendi che UI sia pronto
        if (window.UI && typeof window.UI.getSelectedScoutYear === 'function') {
            this.selectedYear = window.UI.getSelectedScoutYear();
        } else {
            this.selectedYear = getCurrentScoutYear();
        }

        // Collega a UI.renderCurrentPage per caricamento dopo login/demo
        UI.renderCurrentPage = () => {
            this.loadData();
        };

        this.setupDOM();
        this.setupEvents();

        if (UI.currentUser) {
            await this.loadData();
        }
    }

    setupDOM() {
        // Popola il selettore dell'anno scout
        const yearSelect = document.getElementById('scoutYearSelect');
        if (yearSelect) {
            const currentYear = getCurrentScoutYear();
            const years = getAllScoutYears ? getAllScoutYears(UI?.state?.activities || [], currentYear) : [currentYear];
            yearSelect.innerHTML = years.map(y => `<option value="${y}" ${y === this.selectedYear ? 'selected' : ''}>${y}</option>`).join('');
        }
    }

    setupEvents() {
        // Cambio anno scout
        const yearSelect = document.getElementById('scoutYearSelect');
        if (yearSelect) {
            yearSelect.addEventListener('change', async (e) => {
                this.selectedYear = e.target.value;
                if (window.UI && typeof window.UI.setSelectedScoutYear === 'function') {
                    await window.UI.setSelectedScoutYear(this.selectedYear);
                }
                await this.loadData();
            });
        }

        // Ricerca testuale con debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let debounceTimer = null;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchQuery = (e.target.value || '').trim().toLowerCase();
                    this.renderList();
                }, 200);
            });
        }

        // Filtro stato
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilterStatus = e.target.value;
                this.renderList();
            });
        }

        // Ordinamento
        const sortOrder = document.getElementById('sortOrder');
        if (sortOrder) {
            sortOrder.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderList();
            });
        }

        // Tabs categoria
        const catTabs = document.querySelectorAll('.cat-tab');
        catTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                catTabs.forEach(t => {
                    t.classList.remove('bg-green-600', 'text-white', 'shadow-sm');
                    t.classList.add('text-gray-600', 'dark:text-gray-300');
                });
                tab.classList.remove('text-gray-600', 'dark:text-gray-300');
                tab.classList.add('bg-green-600', 'text-white', 'shadow-sm');

                this.currentFilterCat = tab.getAttribute('data-cat') || 'all';
                this.renderList();
            });
        });

        // Apertura modale nuova scadenza
        const addBtn = document.getElementById('addCustomDeadlineBtn');
        const emptyAddBtn = document.getElementById('emptyAddBtn');
        if (addBtn) addBtn.addEventListener('click', () => this.openDeadlineModal());
        if (emptyAddBtn) emptyAddBtn.addEventListener('click', () => this.openDeadlineModal());

        // Chiusura modale
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelModalBtn = document.getElementById('cancelModalBtn');
        const modal = document.getElementById('customDeadlineModal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeDeadlineModal());
        if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => this.closeDeadlineModal());
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeDeadlineModal();
            });
        }

        // Invio form modale
        const form = document.getElementById('customDeadlineForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSaveDeadline();
            });
        }
    }

    async loadData() {
        const container = document.getElementById('deadlinesListContainer');
        if (container) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-400 dark:text-gray-500">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                    <p>Caricamento scadenze per l'anno scout ${this.selectedYear}...</p>
                </div>
            `;
        }

        try {
            // Carica o riusa i dati generali
            let state = (UI.state && UI.state.activities && UI.state.activities.length > 0)
                ? UI.state
                : null;

            if (!state) {
                try {
                    state = await DATA.loadAll();
                } catch (loadErr) {
                    console.warn('DATA.loadAll fallback to UI.state:', loadErr);
                    state = UI.state || { activities: [], presences: [], scouts: [] };
                }
            }

            // Carica scadenze personalizzate con graceful fallback
            try {
                this.customDeadlines = await DATA.getCustomDeadlines();
            } catch (cdErr) {
                console.warn('DATA.getCustomDeadlines fallback to empty:', cdErr);
                this.customDeadlines = [];
            }

            // Calcola tutte le scadenze aggregate per l'anno scout
            this.allDeadlines = getAllScoutYearDeadlines({
                scoutYear: this.selectedYear,
                activities: state.activities || [],
                presences: state.presences || [],
                scouts: state.scouts || [],
                customDeadlines: this.customDeadlines || [],
                refDate: new Date()
            });

            this.updateMetrics();
            this.renderList();
        } catch (error) {
            console.error('Errore nel caricamento scadenze:', error);
            if (container) {
                container.innerHTML = `
                    <div class="p-6 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 text-center">
                        <p class="font-bold">Si è verificato un errore nel caricamento delle scadenze.</p>
                        <p class="text-xs mt-1">${error.message || error}</p>
                    </div>
                `;
            }
        }
    }

    updateMetrics() {
        // 1. Imminenti (entro 15 giorni non completate o oggi)
        const imminent = this.allDeadlines.filter(d => !d.completata && d.daysUntil >= 0 && d.daysUntil <= 15);
        const overdue = this.allDeadlines.filter(d => !d.completata && d.daysUntil < 0);
        const metricImminentEl = document.getElementById('metricImminentCount');
        const metricOverdueEl = document.getElementById('metricOverdueCount');
        if (metricImminentEl) metricImminentEl.textContent = imminent.length;
        if (metricOverdueEl) {
            metricOverdueEl.textContent = overdue.length > 0 ? `(${overdue.length} scadute)` : '';
        }

        // 2. Attività in programma
        const upcomingActs = this.allDeadlines.filter(d => d.type === 'activity' && d.daysUntil >= 0);
        const metricUpcomingActivitiesEl = document.getElementById('metricUpcomingActivities');
        if (metricUpcomingActivitiesEl) metricUpcomingActivitiesEl.textContent = upcomingActs.length;

        // 3. Quote da saldare
        const paymentItems = this.allDeadlines.filter(d => d.type === 'payment' && !d.completata);
        const totalPending = paymentItems.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const metricPendingDuesAmountEl = document.getElementById('metricPendingDuesAmount');
        const metricPendingDuesCountEl = document.getElementById('metricPendingDuesCount');
        if (metricPendingDuesAmountEl) metricPendingDuesAmountEl.textContent = `€${Math.round(totalPending)}`;
        if (metricPendingDuesCountEl) {
            metricPendingDuesCountEl.textContent = paymentItems.length > 0 ? `su ${paymentItems.length} attività` : 'tutto in regola';
        }

        // 4. Scadenze personalizzate
        const customs = this.allDeadlines.filter(d => d.isCustom);
        const activeCustoms = customs.filter(c => !c.completata);
        const completedCustoms = customs.filter(c => c.completata);
        const metricCustomActiveEl = document.getElementById('metricCustomActiveCount');
        const metricCustomCompletedEl = document.getElementById('metricCustomCompletedCount');
        if (metricCustomActiveEl) metricCustomActiveEl.textContent = activeCustoms.length;
        if (metricCustomCompletedEl) {
            metricCustomCompletedEl.textContent = completedCustoms.length > 0 ? `(${completedCustoms.length} completate)` : '';
        }

        // 5. Certificati e Documenti Sanitari
        const medAlerts = this.allDeadlines.filter(d => d.type === 'medical' && (d.status === 'scaduta' || d.status === 'imminente'));
        const metricMedicalAlertsEl = document.getElementById('metricMedicalAlerts');
        if (metricMedicalAlertsEl) {
            metricMedicalAlertsEl.textContent = medAlerts.length > 0
                ? `🩺 ${medAlerts.length} ${medAlerts.length === 1 ? 'certificato da rinnovare' : 'certificati da rinnovare'}`
                : '🩺 Certificati in regola';
        }

        // Conteggi per i tab
        const countAllEl = document.getElementById('countTabAll');
        const countMedicalEl = document.getElementById('countTabMedical');
        const countActivityEl = document.getElementById('countTabActivity');
        const countPaymentEl = document.getElementById('countTabPayment');
        const countBirthdayEl = document.getElementById('countTabBirthday');
        const countCustomEl = document.getElementById('countTabCustom');

        if (countAllEl) countAllEl.textContent = this.allDeadlines.length;
        if (countMedicalEl) countMedicalEl.textContent = this.allDeadlines.filter(d => d.type === 'medical').length;
        if (countActivityEl) countActivityEl.textContent = this.allDeadlines.filter(d => d.type === 'activity').length;
        if (countPaymentEl) countPaymentEl.textContent = this.allDeadlines.filter(d => d.type === 'payment').length;
        if (countBirthdayEl) countBirthdayEl.textContent = this.allDeadlines.filter(d => d.type === 'birthday').length;
        if (countCustomEl) countCustomEl.textContent = customs.length;
    }

    getFilteredAndSortedDeadlines() {
        let items = [...this.allDeadlines];

        // 1. Filtro Categoria
        if (this.currentFilterCat !== 'all') {
            items = items.filter(d => d.type === this.currentFilterCat);
        }

        // 2. Filtro Stato
        if (this.currentFilterStatus === 'imminent') {
            items = items.filter(d => !d.completata && d.daysUntil >= 0 && d.daysUntil <= 15);
        } else if (this.currentFilterStatus === 'future') {
            items = items.filter(d => !d.completata && d.daysUntil >= 0);
        } else if (this.currentFilterStatus === 'overdue') {
            items = items.filter(d => !d.completata && d.daysUntil < 0);
        } else if (this.currentFilterStatus === 'completed') {
            items = items.filter(d => d.completata);
        }

        // 3. Ricerca testuale
        if (this.searchQuery) {
            const q = this.searchQuery;
            items = items.filter(d =>
                (d.titolo && d.titolo.toLowerCase().includes(q)) ||
                (d.descrizione && d.descrizione.toLowerCase().includes(q)) ||
                (d.categoria && d.categoria.toLowerCase().includes(q))
            );
        }

        // 4. Ordinamento
        items.sort((a, b) => {
            if (this.currentSort === 'date-desc') {
                return b.dataScadenza.localeCompare(a.dataScadenza);
            }
            if (this.currentSort === 'title-asc') {
                return a.titolo.localeCompare(b.titolo);
            }
            // Predefinito: date-asc
            return a.dataScadenza.localeCompare(b.dataScadenza);
        });

        return items;
    }

    renderList() {
        const container = document.getElementById('deadlinesListContainer');
        const emptyState = document.getElementById('emptyStateContainer');
        if (!container) return;

        const items = this.getFilteredAndSortedDeadlines();

        if (items.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        container.innerHTML = items.map(item => this.renderDeadlineCard(item)).join('');

        // Collega eventi alle card
        this.bindCardEvents(container);
    }

    renderDeadlineCard(item) {
        // Configurazione visuale per tipologia
        let borderClass = 'border-l-4 border-gray-300 dark:border-gray-700';
        let bgClass = 'bg-white dark:bg-gray-800';
        let typeIcon = '⏰';

        if (item.type === 'activity') {
            borderClass = 'border-l-4 border-blue-500';
            bgClass = 'bg-blue-50/10 dark:bg-blue-950/10';
            typeIcon = '📅';
        } else if (item.type === 'payment') {
            borderClass = 'border-l-4 border-amber-500';
            bgClass = 'bg-amber-50/10 dark:bg-amber-950/10';
            typeIcon = '💶';
        } else if (item.type === 'birthday') {
            borderClass = 'border-l-4 border-purple-500';
            bgClass = 'bg-purple-50/10 dark:bg-purple-950/10';
            typeIcon = '🎂';
        } else if (item.type === 'custom') {
            borderClass = 'border-l-4 border-emerald-500';
            bgClass = 'bg-emerald-50/10 dark:bg-emerald-950/10';
            typeIcon = '📝';
        } else if (item.type === 'medical') {
            borderClass = item.status === 'scaduta' ? 'border-l-4 border-rose-500' : 'border-l-4 border-amber-500';
            bgClass = item.status === 'scaduta' ? 'bg-rose-50/15 dark:bg-rose-950/20' : 'bg-amber-50/15 dark:bg-amber-950/20';
            typeIcon = '🩺';
        }

        // Data formattata in italiano
        const d = toJsDate(item.dataScadenza);
        const formattedDate = d ? d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : item.dataScadenza;

        // Badge temporale
        let countdownBadge = '';
        if (item.completata) {
            countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">✓ Completata</span>`;
        } else if (item.daysUntil === 0) {
            countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 animate-pulse">🔥 OGGI</span>`;
        } else if (item.daysUntil === 1) {
            countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">⏳ Domani</span>`;
        } else if (item.daysUntil > 1 && item.daysUntil <= 7) {
            countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">⚠️ Tra ${item.daysUntil} giorni</span>`;
        } else if (item.daysUntil > 7) {
            countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Tra ${item.daysUntil} giorni</span>`;
        } else {
            // daysUntil < 0
            if (item.type === 'activity' || item.type === 'birthday') {
                countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Passata</span>`;
            } else {
                countdownBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Scaduta da ${Math.abs(item.daysUntil)} gg</span>`;
            }
        }

        // Priorità (per custom)
        let priorityPill = '';
        if (item.isCustom && item.priorita) {
            const pColors = {
                'Alta': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
                'Media': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                'Bassa': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            };
            priorityPill = `<span class="text-[11px] font-semibold px-2 py-0.5 rounded ${pColors[item.priorita] || 'bg-gray-100 text-gray-700'}">${item.priorita}</span>`;
        }

        // Azioni
        let actionsHtml = '';
        if (item.isCustom) {
            actionsHtml = `
                <div class="flex items-center gap-2">
                    <button data-action="toggle-complete" data-id="${item.id}" class="text-xs px-2.5 py-1 rounded-lg border transition ${item.completata ? 'border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800' : 'border-green-300 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'} font-medium">
                        ${item.completata ? '↩️ Riapri' : '✓ Fatto'}
                    </button>
                    <button data-action="edit-custom" data-id="${item.id}" class="p-1.5 text-gray-500 hover:text-green-600 dark:hover:text-green-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Modifica scadenza">
                        ✏️
                    </button>
                    <button data-action="delete-custom" data-id="${item.id}" class="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" title="Elimina scadenza">
                        🗑️
                    </button>
                </div>
            `;
        } else if (item.type === 'medical') {
            const wa = generateWhatsAppReminderUrl({
                scoutNome: item.scout ? `${item.scout.nome || ''} ${item.scout.cognome || ''}`.trim() : item.titolo,
                scadenzaStr: item.medStatus?.formattedDate || item.dataScadenza,
                telGenitore: item.scout?.ct_g1_tel || item.scout?.anag_telefono || '',
                certStatus: item.medStatus?.certStatus || (item.daysUntil < 0 ? 'expired' : 'expiring'),
                missingDocs: item.medStatus?.missingDocuments || []
            });

            actionsHtml = `
                <div class="flex items-center gap-2">
                    <a href="${wa.url}" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition inline-flex items-center gap-1 shadow-sm" title="Invia promemoria WhatsApp al genitore">
                        <span>💬</span> <span>WhatsApp</span>
                    </a>
                    <a href="${item.url || 'scout2.html?id=' + item.scoutId}" class="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition inline-flex items-center gap-1">
                        <span>Scheda</span> <span>&rarr;</span>
                    </a>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-gray-400 uppercase tracking-wider hidden sm:inline">Rilevata automaticamente</span>
                    <a href="${item.url || '#'}" class="text-xs font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition inline-flex items-center gap-1">
                        <span>Vai</span> <span>&rarr;</span>
                    </a>
                </div>
            `;
        }

        return `
            <div class="${borderClass} ${bgClass} p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${item.completata ? 'opacity-70' : ''}">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                    <div class="text-2xl mt-0.5 select-none">${typeIcon}</div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <span class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">${item.categoria}</span>
                            ${priorityPill}
                            ${countdownBadge}
                        </div>
                        <h3 class="text-base font-bold text-gray-900 dark:text-white truncate ${item.completata ? 'line-through text-gray-500 dark:text-gray-400' : ''}">
                            ${item.titolo}
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            ${item.descrizione}
                        </p>
                    </div>
                </div>

                <div class="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-700 gap-2 shrink-0">
                    <div class="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        📅 ${formattedDate}
                    </div>
                    <div>
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    bindCardEvents(container) {
        // Toggle completata
        container.querySelectorAll('[data-action="toggle-complete"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                await this.handleToggleComplete(id);
            });
        });

        // Modifica
        container.querySelectorAll('[data-action="edit-custom"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.openDeadlineModal(id);
            });
        });

        // Elimina
        container.querySelectorAll('[data-action="delete-custom"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                await this.handleDeleteDeadline(id);
            });
        });
    }

    openDeadlineModal(deadlineId = null) {
        const modal = document.getElementById('customDeadlineModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('customDeadlineForm');
        if (!modal || !form) return;

        this.editingDeadlineId = deadlineId;

        if (deadlineId) {
            // Modifica
            const item = this.customDeadlines.find(d => String(d.id) === String(deadlineId));
            if (!item) return;

            if (modalTitle) modalTitle.innerHTML = `<span>✏️</span> <span>Modifica Scadenza</span>`;
            document.getElementById('customDeadlineId').value = item.id;
            document.getElementById('deadlineTitle').value = item.titolo || '';
            document.getElementById('deadlineDate').value = item.dataScadenza || '';
            document.getElementById('deadlineCategory').value = item.categoria || 'Iscrizioni & Quote';
            document.getElementById('deadlineNotes').value = item.note || '';
            document.getElementById('deadlineCompleted').checked = Boolean(item.completata);

            const p = item.priorita || 'Media';
            const radio = form.querySelector(`input[name="deadlinePriority"][value="${p}"]`);
            if (radio) radio.checked = true;
        } else {
            // Nuova scadenza
            if (modalTitle) modalTitle.innerHTML = `<span>⏰</span> <span>Nuova Scadenza</span>`;
            form.reset();
            document.getElementById('customDeadlineId').value = '';
            // Data predefinita: oggi in formato YYYY-MM-DD
            document.getElementById('deadlineDate').value = new Date().toISOString().split('T')[0];
            const radioMedia = form.querySelector('input[name="deadlinePriority"][value="Media"]');
            if (radioMedia) radioMedia.checked = true;
        }

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => document.getElementById('deadlineTitle')?.focus(), 50);
    }

    closeDeadlineModal() {
        const modal = document.getElementById('customDeadlineModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        }
        this.editingDeadlineId = null;
    }

    async handleSaveDeadline() {
        const titleInput = document.getElementById('deadlineTitle');
        const dateInput = document.getElementById('deadlineDate');
        const categoryInput = document.getElementById('deadlineCategory');
        const notesInput = document.getElementById('deadlineNotes');
        const completedInput = document.getElementById('deadlineCompleted');
        const priorityInput = document.querySelector('input[name="deadlinePriority"]:checked');
        const saveBtn = document.getElementById('saveDeadlineBtn');

        const titolo = (titleInput?.value || '').trim();
        const dataScadenza = dateInput?.value || '';
        const categoria = categoryInput?.value || 'Altro';
        const note = (notesInput?.value || '').trim();
        const completata = Boolean(completedInput?.checked);
        const priorita = priorityInput?.value || 'Media';

        if (!titolo || !dataScadenza) {
            if (window.UI?.showToast) {
                window.UI.showToast('Compila il titolo e la data di scadenza.', { type: 'error' });
            }
            return;
        }

        const originalBtnText = saveBtn?.textContent;
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Salvataggio...';
        }

        try {
            const payload = {
                titolo,
                dataScadenza,
                categoria,
                note,
                completata,
                priorita,
                annoScout: this.selectedYear
            };

            const user = UI.currentUser;

            if (this.editingDeadlineId) {
                await DATA.updateCustomDeadline(this.editingDeadlineId, payload, user);
                if (window.UI?.showToast) window.UI.showToast('Scadenza modificata con successo.');
            } else {
                await DATA.addCustomDeadline(payload, user);
                if (window.UI?.showToast) window.UI.showToast('Nuova scadenza creata con successo.');
            }

            this.closeDeadlineModal();
            await this.loadData();
        } catch (error) {
            console.error('Errore durante il salvataggio della scadenza:', error);
            if (window.UI?.showToast) {
                window.UI.showToast('Errore durante il salvataggio: ' + error.message, { type: 'error' });
            }
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = originalBtnText;
            }
        }
    }

    async handleToggleComplete(id) {
        const item = this.customDeadlines.find(d => String(d.id) === String(id));
        if (!item) return;

        const newStatus = !item.completata;

        // Aggiornamento ottimistico locale
        item.completata = newStatus;
        this.allDeadlines.forEach(d => {
            if (String(d.id) === String(id)) {
                d.completata = newStatus;
                d.status = newStatus ? 'completata' : (d.daysUntil < 0 ? 'scaduta' : (d.daysUntil === 0 ? 'oggi' : (d.daysUntil <= 7 ? 'imminente' : 'futura')));
            }
        });
        this.updateMetrics();
        this.renderList();

        try {
            await DATA.updateCustomDeadline(id, { completata: newStatus }, UI.currentUser);
            if (window.UI?.showToast) {
                window.UI.showToast(newStatus ? 'Scadenza contrassegnata come completata!' : 'Scadenza riaperta.');
            }
        } catch (error) {
            console.error('Errore durante l\'aggiornamento dello stato:', error);
            // Rollback
            item.completata = !newStatus;
            await this.loadData();
        }
    }

    async handleDeleteDeadline(id) {
        const item = this.customDeadlines.find(d => String(d.id) === String(id));
        const title = item ? item.titolo : 'questa scadenza';

        const doDelete = async () => {
            try {
                await DATA.deleteCustomDeadline(id, UI.currentUser);
                if (window.UI?.showToast) window.UI.showToast('Scadenza eliminata con successo.');
                await this.loadData();
            } catch (error) {
                console.error('Errore durante l\'eliminazione della scadenza:', error);
                if (window.UI?.showToast) {
                    window.UI.showToast('Errore durante l\'eliminazione: ' + error.message, { type: 'error' });
                }
            }
        };

        if (window.UI?.showConfirmModal) {
            window.UI.showConfirmModal({
                title: 'Elimina Scadenza',
                message: `Sei sicuro di voler eliminare definitivamente "${title}"?`,
                confirmText: 'Elimina',
                cancelText: 'Annulla',
                onConfirm: doDelete
            });
        } else if (confirm(`Sei sicuro di voler eliminare definitivamente "${title}"?`)) {
            await doDelete();
        }
    }
}

// Istanzia e avvia controller
const scadenzeController = new ScadenzeController();

document.addEventListener('DOMContentLoaded', () => {
    scadenzeController.init();
});

export { scadenzeController };
