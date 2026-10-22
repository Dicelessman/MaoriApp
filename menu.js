/**
 * Menù & Cambusa - Controller e logica UI
 * @module menu
 */

import { DATA } from './js/data/data-facade.js';
import { UI } from './js/ui/ui.js';
import {
    ALLERGENI_COMUNI,
    DIETE_COMUNI,
    TIPI_PASTO,
    normalizzaUnita,
    formattaQuantitaPerSpesa,
    scalaRicetta,
    calcolaSommaNutrizionale,
    generaListaSpesa,
    generaListaStrumenti,
    verificaAllarmiAllergeni
} from './js/utils/menu-utils.js';
import { NutritionService } from './js/services/nutrition-service.js';
import { RICETTE_BASE } from './js/data/ricette-base.js';

// Stato globale del controller Menù
const MenuState = {
    ricette: [],
    menus: [],
    scorte: [],
    scouts: [],
    activities: [],
    currentMenu: null,
    currentTab: 'ricette', // 'ricette' | 'planner' | 'liste'
    filterSearch: '',
    filterCategory: 'all',
    filterDiet: 'all'
};

// Hook per il caricamento e rendering quando UI.init autentica l'utente
UI.renderCurrentPage = async function () {
    await loadData();
    renderCheckboxes();
    renderCurrentTab();
    updateTopStats();
};

// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', async () => {
    try {
        setupEventListeners();
        await loadData();
        renderCheckboxes();
        renderCurrentTab();
        updateTopStats();
    } catch (err) {
        console.error('Errore inizializzazione Menù & Cambusa:', err);
    }
});

/**
 * Carica i dati necessari dalla Facade con fallback robusto
 */
async function loadData() {
    try {
        MenuState.ricette = await DATA.getRicette();
    } catch (e) {
        console.warn('Avviso: impossibile leggere ricette da Firestore:', e);
        MenuState.ricette = [];
    }
    // Fallback a ricette base locali se archivio vuoto o offline
    if (!Array.isArray(MenuState.ricette) || MenuState.ricette.length === 0) {
        MenuState.ricette = [...RICETTE_BASE];
    }

    try {
        MenuState.menus = await DATA.getMenus();
    } catch (e) {
        console.warn('Avviso: impossibile leggere menù da Firestore:', e);
        MenuState.menus = [];
    }

    try {
        MenuState.scorte = await DATA.getScorte();
    } catch (e) {
        console.warn('Avviso: impossibile leggere scorte:', e);
        MenuState.scorte = [];
    }

    try {
        MenuState.activities = UI.state?.activities || (await DATA.getActivities?.()) || [];
    } catch (e) {
        console.warn('Avviso: impossibile leggere attività:', e);
        MenuState.activities = [];
    }

    try {
        MenuState.scouts = UI.state?.scouts || (await DATA.getScouts?.()) || [];
    } catch (e) {
        console.warn('Avviso: impossibile leggere esploratori:', e);
        MenuState.scouts = [];
    }

    // Se esiste almeno un menù salvato, mantienilo o seleziona il primo, altrimenti inizializza una bozza vuota
    if (MenuState.menus && MenuState.menus.length > 0) {
        if (!MenuState.currentMenu || !MenuState.currentMenu.id) {
            MenuState.currentMenu = MenuState.menus[0];
        }
    } else if (!MenuState.currentMenu) {
        MenuState.currentMenu = createDefaultMenu();
    }
}

/**
 * Crea una struttura di Menù vuoto per Uscita (2 giorni di default)
 */
function createDefaultMenu() {
    return {
        id: null,
        titolo: 'Nuovo Menù Uscita',
        attivitaId: '',
        attivitaNome: '',
        dataInizio: new Date().toISOString().split('T')[0],
        dataFine: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        partecipantiDefault: 20,
        giorni: [
            {
                giornoIndex: 1,
                titolo: 'Giorno 1 (Sabato)',
                pasti: [
                    { tipo: 'Pranzo', ricette: [] },
                    { tipo: 'Merenda', ricette: [] },
                    { tipo: 'Cena', ricette: [] }
                ]
            },
            {
                giornoIndex: 2,
                titolo: 'Giorno 2 (Domenica)',
                pasti: [
                    { tipo: 'Colazione', ricette: [] },
                    { tipo: 'Pranzo', ricette: [] }
                ]
            }
        ],
        totaliNutrizionali: {},
        costoTotaleStimato: 0,
        stato: 'bozza'
    };
}

/**
 * Configura i listener per tab, bottoni e form
 */
function setupEventListeners() {
    // Navigazione Tab
    const tabRicette = document.getElementById('tabBtnRicette');
    const tabPlanner = document.getElementById('tabBtnPlanner');
    const tabListe = document.getElementById('tabBtnListe');

    tabRicette?.addEventListener('click', () => switchTab('ricette'));
    tabPlanner?.addEventListener('click', () => switchTab('planner'));
    tabListe?.addEventListener('click', () => switchTab('liste'));

    // Filtri Ricettario
    document.getElementById('recipeSearchInput')?.addEventListener('input', (e) => {
        MenuState.filterSearch = e.target.value.toLowerCase().trim();
        renderRecipesGrid();
    });
    document.getElementById('recipeCategoryFilter')?.addEventListener('change', (e) => {
        MenuState.filterCategory = e.target.value;
        renderRecipesGrid();
    });
    document.getElementById('recipeDietFilter')?.addEventListener('change', (e) => {
        MenuState.filterDiet = e.target.value;
        renderRecipesGrid();
    });

    // Modale Nuova Ricetta
    document.getElementById('openNewRecipeBtn')?.addEventListener('click', () => openRecipeModal());
    document.getElementById('emptyStateNewRecipeBtn')?.addEventListener('click', () => openRecipeModal());
    document.getElementById('closeRecipeModalBtn')?.addEventListener('click', () => closeRecipeModal());
    document.getElementById('cancelRecipeModalBtn')?.addEventListener('click', () => closeRecipeModal());
    document.getElementById('recipeForm')?.addEventListener('submit', handleSaveRecipe);

    // Righe dinamiche modale ricetta
    document.getElementById('addIngredientRowBtn')?.addEventListener('click', () => addIngredientRow());
    document.getElementById('addStepRowBtn')?.addEventListener('click', () => addStepRow());
    document.getElementById('addToolRowBtn')?.addEventListener('click', () => addToolRow());
    document.getElementById('calcNutritionFromIngredientsBtn')?.addEventListener('click', handleCalcNutritionFromIngredients);

    // Modale Importa da URL
    document.getElementById('openImportRecipeBtn')?.addEventListener('click', () => openImportModal());
    document.getElementById('closeImportModalBtn')?.addEventListener('click', () => closeImportModal());
    document.getElementById('cancelImportBtn')?.addEventListener('click', () => closeImportModal());
    document.getElementById('startImportBtn')?.addEventListener('click', handleImportRecipeFromUrl);

    // Controlli Planner Menù
    document.getElementById('currentMenuSelect')?.addEventListener('change', handleMenuSelectChange);
    document.getElementById('menuActivitySelect')?.addEventListener('change', handleActivitySelectChange);
    document.getElementById('menuParticipantsInput')?.addEventListener('change', handleParticipantsChange);
    document.getElementById('decrementParticipantsBtn')?.addEventListener('click', () => adjustParticipants(-1));
    document.getElementById('incrementParticipantsBtn')?.addEventListener('click', () => adjustParticipants(1));
    document.getElementById('newMenuBtn')?.addEventListener('click', handleCreateNewMenu);
    document.getElementById('saveMenuBtn')?.addEventListener('click', handleSaveCurrentMenu);
    document.getElementById('confirmAndGenerateListsBtn')?.addEventListener('click', handleConfirmMenuAndGenerateLists);
    document.getElementById('addDayBtn')?.addEventListener('click', handleAddDay);

    // Azioni Liste Spesa & Strumenti
    document.getElementById('sendToPreventivoBtn')?.addEventListener('click', handleSendToPreventivo);
    document.getElementById('copyWhatsAppShoppingBtn')?.addEventListener('click', handleCopyWhatsAppShopping);
    document.getElementById('printShoppingBtn')?.addEventListener('click', handlePrintShoppingList);
    document.getElementById('copyToolsBtn')?.addEventListener('click', handleCopyToolsList);
}

/**
 * Cambio Tab dell'interfaccia
 */
function switchTab(tabId) {
    MenuState.currentTab = tabId;

    const tabs = [
        { id: 'ricette', btn: 'tabBtnRicette', content: 'tabContentRicette' },
        { id: 'planner', btn: 'tabBtnPlanner', content: 'tabContentPlanner' },
        { id: 'liste', btn: 'tabBtnListe', content: 'tabContentListe' }
    ];

    tabs.forEach(t => {
        const btn = document.getElementById(t.btn);
        const content = document.getElementById(t.content);
        if (t.id === tabId) {
            btn?.classList.add('border-green-600', 'text-green-700', 'dark:text-green-400');
            btn?.classList.remove('border-transparent', 'text-gray-500');
            content?.classList.remove('hidden');
        } else {
            btn?.classList.remove('border-green-600', 'text-green-700', 'dark:text-green-400');
            btn?.classList.add('border-transparent', 'text-gray-500');
            content?.classList.add('hidden');
        }
    });

    renderCurrentTab();
}

function renderCurrentTab() {
    if (MenuState.currentTab === 'ricette') {
        renderRecipesGrid();
    } else if (MenuState.currentTab === 'planner') {
        renderPlanner();
    } else if (MenuState.currentTab === 'liste') {
        renderLists();
    }
}

/**
 * Aggiorna i riquadri riassuntivi in cima alla pagina
 */
function updateTopStats() {
    const totalRec = MenuState.ricette.length;
    const totalMen = MenuState.menus.length;
    const estimatedCost = MenuState.currentMenu?.costoTotaleStimato || 0;

    const elRec = document.getElementById('statTotalRecipes');
    const elMen = document.getElementById('statTotalMenus');
    const elCost = document.getElementById('statEstimatedCost');

    if (elRec) elRec.textContent = totalRec;
    if (elMen) elMen.textContent = totalMen;
    if (elCost) elCost.textContent = `${estimatedCost.toFixed(2).replace('.', ',')} €`;

    DATA.getAlimenti().then(alimenti => {
        const elFoods = document.getElementById('statTotalFoods');
        if (elFoods) elFoods.textContent = alimenti.length;
    }).catch(() => {});
}

/* ==========================================================================
   TAB 1: RICETTARIO DI REPARTO
   ========================================================================== */

function renderRecipesGrid() {
    const grid = document.getElementById('recipesGrid');
    const emptyState = document.getElementById('recipesEmptyState');
    if (!grid) return;

    let list = [...MenuState.ricette];

    // Filtro Ricerca
    if (MenuState.filterSearch) {
        list = list.filter(r => {
            const nome = (r.nome || '').toLowerCase();
            const desc = (r.descrizione || '').toLowerCase();
            const ingr = (r.ingredienti || []).map(i => i.nome.toLowerCase()).join(' ');
            return nome.includes(MenuState.filterSearch) || desc.includes(MenuState.filterSearch) || ingr.includes(MenuState.filterSearch);
        });
    }

    // Filtro Categoria
    if (MenuState.filterCategory !== 'all') {
        list = list.filter(r => r.categoria === MenuState.filterCategory);
    }

    // Filtro Dieta
    if (MenuState.filterDiet !== 'all') {
        list = list.filter(r => (r.diete || []).includes(MenuState.filterDiet));
    }

    if (list.length === 0) {
        grid.innerHTML = '';
        emptyState?.classList.remove('hidden');
        return;
    }

    emptyState?.classList.add('hidden');

    grid.innerHTML = list.map(recipe => {
        const porz = recipe.porzioniBase || 4;
        const kcal = recipe.nutrizione?.perPorzione?.kcal || 0;
        const prot = recipe.nutrizione?.perPorzione?.proteine || 0;
        const carb = recipe.nutrizione?.perPorzione?.carboidrati || 0;
        const fat = recipe.nutrizione?.perPorzione?.grassi || 0;

        const allergeniBadges = (recipe.allergeni || []).map(allId => {
            const allObj = ALLERGENI_COMUNI.find(a => a.id === allId);
            const icon = allObj?.icon || '⚠️';
            const label = allObj?.label || allId;
            return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300" title="Contiene ${label}">${icon} ${label}</span>`;
        }).join('');

        const dieteBadges = (recipe.diete || []).slice(0, 3).map(dietId => {
            const dietObj = DIETE_COMUNI.find(d => d.id === dietId);
            const label = dietObj?.label || dietId;
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">${label}</span>`;
        }).join('');

        const storicoCount = (recipe.storicoManuale || []).length;
        const storicoBadge = storicoCount > 0
            ? `<span class="text-[11px] text-gray-500 dark:text-gray-400" title="Preparata in ${storicoCount} attività passate">⛺ Preparata ${storicoCount} ${storicoCount === 1 ? 'volta' : 'volte'}</span>`
            : '';

        return `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                <div class="p-5 space-y-3">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300">
                                ${recipe.categoria || 'Pasto'}
                            </span>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">
                                ${escapeHtml(recipe.nome)}
                            </h3>
                        </div>
                        <div class="text-right text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div>⏱️ ${(recipe.tempoPreparazione || 0) + (recipe.tempoCottura || 0)} min</div>
                            <div>👥 ${porz} porz. base</div>
                        </div>
                    </div>

                    ${recipe.descrizione ? `<p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">${escapeHtml(recipe.descrizione)}</p>` : ''}

                    <!-- Allergeni & Dieta -->
                    <div class="flex flex-wrap gap-1.5 pt-1">
                        ${allergeniBadges || '<span class="text-[11px] text-gray-400 dark:text-gray-500">Nessun allergene dichiarato</span>'}
                    </div>
                    ${dieteBadges ? `<div class="flex flex-wrap gap-1 pt-0.5">${dieteBadges}</div>` : ''}

                    <!-- Macroni e Nutrizione -->
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60 grid grid-cols-4 gap-1 text-center text-xs">
                        <div>
                            <div class="font-extrabold text-gray-900 dark:text-white">${kcal}</div>
                            <div class="text-[10px] text-gray-500">Kcal/porz</div>
                        </div>
                        <div>
                            <div class="font-bold text-blue-600 dark:text-blue-400">${prot}g</div>
                            <div class="text-[10px] text-gray-500">Proteine</div>
                        </div>
                        <div>
                            <div class="font-bold text-amber-600 dark:text-amber-400">${carb}g</div>
                            <div class="text-[10px] text-gray-500">Carbo</div>
                        </div>
                        <div>
                            <div class="font-bold text-rose-600 dark:text-rose-400">${fat}g</div>
                            <div class="text-[10px] text-gray-500">Grassi</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                        <span>🥕 ${(recipe.ingredienti || []).length} ingredienti</span>
                        ${storicoBadge}
                    </div>
                </div>

                <!-- Footer Card con Bottoni -->
                <div class="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                    <button type="button" class="btn-edit-recipe text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" data-recipe-id="${recipe.id}">
                        ✏️ Dettagli
                    </button>
                    <div class="flex items-center gap-1.5">
                        <button type="button" class="btn-add-to-menu text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-1" data-recipe-id="${recipe.id}">
                            ➕ Al Menù
                        </button>
                        <button type="button" class="btn-delete-recipe text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg" data-recipe-id="${recipe.id}" title="Elimina ricetta">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Listener bottoni card
    grid.querySelectorAll('.btn-edit-recipe').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-recipe-id');
            const recipe = MenuState.ricette.find(r => r.id === id);
            if (recipe) openRecipeModal(recipe);
        });
    });

    grid.querySelectorAll('.btn-add-to-menu').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-recipe-id');
            handleAddRecipeToActiveMenu(id);
        });
    });

    grid.querySelectorAll('.btn-delete-recipe').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-recipe-id');
            const recipe = MenuState.ricette.find(r => r.id === id);
            if (!recipe) return;
            UI.showConfirmModal({
                title: 'Elimina Ricetta',
                message: `Sei sicuro di voler eliminare la ricetta "${recipe.nome}"? L'azione non può essere annullata.`,
                confirmText: 'Elimina',
                onConfirm: async () => {
                    await DATA.deleteRicetta(id, UI.currentUser);
                    MenuState.ricette = await DATA.getRicette();
                    renderRecipesGrid();
                    updateTopStats();
                    UI.showToast(`Ricetta "${recipe.nome}" eliminata`, { type: 'success' });
                }
            });
        });
    });
}

/**
 * Aggiunge una ricetta al primo pasto disponibile del menù attivo
 */
function handleAddRecipeToActiveMenu(recipeId) {
    const recipe = MenuState.ricette.find(r => r.id === recipeId);
    if (!recipe) return;

    if (!MenuState.currentMenu || !MenuState.currentMenu.giorni?.length) {
        UI.showToast('Crea prima un menù nel Pianificatore', { type: 'warning' });
        return;
    }

    // Trova un pasto corrispondente alla categoria della ricetta nel primo giorno, altrimenti il primo pasto
    const day = MenuState.currentMenu.giorni[0];
    let targetMeal = day.pasti.find(p => p.tipo.toLowerCase() === (recipe.categoria || '').toLowerCase());
    if (!targetMeal && day.pasti.length > 0) {
        targetMeal = day.pasti[0];
    }

    if (!targetMeal) {
        UI.showToast('Nessun pasto configurato nel menù attivo', { type: 'warning' });
        return;
    }

    if (!targetMeal.ricette) targetMeal.ricette = [];
    const participants = MenuState.currentMenu.partecipantiDefault || 20;
    const scaled = scalaRicetta(recipe, participants);
    targetMeal.ricette.push(scaled);

    UI.showToast(`Ricetta "${recipe.nome}" aggiunta a ${targetMeal.tipo} (${day.titolo})`, { type: 'success' });
    switchTab('planner');
}

/* ==========================================================================
   TAB 2: PIANIFICATORE MENÙ & LIVE NUTRITION
   ========================================================================== */

function renderPlanner() {
    renderMenuDropdowns();
    renderMenuDays();
    renderAllergenAlerts();
}

function renderMenuDropdowns() {
    const menuSelect = document.getElementById('currentMenuSelect');
    const actSelect = document.getElementById('menuActivitySelect');
    const partInput = document.getElementById('menuParticipantsInput');

    if (menuSelect) {
        menuSelect.innerHTML = MenuState.menus.map(m => `
            <option value="${m.id}" ${MenuState.currentMenu?.id === m.id ? 'selected' : ''}>
                ${escapeHtml(m.titolo || 'Menù senza titolo')} (${m.dataInizio || 'N.D.'})
            </option>
        `).join('') + `<option value="new_draft" ${!MenuState.currentMenu?.id ? 'selected' : ''}>+ [Nuova Bozza Menù]</option>`;
    }

    if (actSelect) {
        actSelect.innerHTML = `<option value="">Nessuna (Menù generico)</option>` +
            MenuState.activities.map(a => {
                const dateStr = a.data ? new Date(a.data).toLocaleDateString('it-IT') : '';
                return `<option value="${a.id}" ${MenuState.currentMenu?.attivitaId === a.id ? 'selected' : ''}>
                    ${escapeHtml(a.descrizione || a.titolo || 'Attività')} ${dateStr ? `(${dateStr})` : ''}
                </option>`;
            }).join('');
    }

    if (partInput && MenuState.currentMenu) {
        partInput.value = MenuState.currentMenu.partecipantiDefault || 20;
    }
}

function handleMenuSelectChange(e) {
    const val = e.target.value;
    if (val === 'new_draft') {
        handleCreateNewMenu();
    } else {
        const found = MenuState.menus.find(m => m.id === val);
        if (found) {
            MenuState.currentMenu = found;
            renderPlanner();
            updateTopStats();
        }
    }
}

function handleActivitySelectChange(e) {
    if (!MenuState.currentMenu) return;
    const actId = e.target.value;
    const act = MenuState.activities.find(a => a.id === actId);
    MenuState.currentMenu.attivitaId = actId || null;
    MenuState.currentMenu.attivitaNome = act ? (act.descrizione || act.titolo || '') : '';
    renderAllergenAlerts();
}

function handleParticipantsChange(e) {
    const val = Math.max(1, parseInt(e.target.value, 10) || 20);
    adjustParticipantsTo(val);
}

function adjustParticipants(delta) {
    if (!MenuState.currentMenu) return;
    const current = MenuState.currentMenu.partecipantiDefault || 20;
    adjustParticipantsTo(Math.max(1, current + delta));
}

function adjustParticipantsTo(val) {
    if (!MenuState.currentMenu) return;
    MenuState.currentMenu.partecipantiDefault = val;
    const partInput = document.getElementById('menuParticipantsInput');
    if (partInput) partInput.value = val;

    // Ri-scala tutte le ricette presenti nel menù
    (MenuState.currentMenu.giorni || []).forEach(day => {
        (day.pasti || []).forEach(pasto => {
            if (Array.isArray(pasto.ricette)) {
                pasto.ricette = pasto.ricette.map(r => {
                    const original = MenuState.ricette.find(x => x.id === r.id) || r;
                    return scalaRicetta(original, val);
                });
            }
        });
    });

    renderMenuDays();
    UI.showToast(`Partecipanti aggiornati a ${val}: ingredienti riscalati`, { type: 'info', duration: 2500 });
}

function handleCreateNewMenu() {
    MenuState.currentMenu = createDefaultMenu();
    renderPlanner();
    UI.showToast('Nuova bozza di Menù creata', { type: 'info' });
}

function handleAddDay() {
    if (!MenuState.currentMenu) return;
    if (!MenuState.currentMenu.giorni) MenuState.currentMenu.giorni = [];
    const nextIdx = MenuState.currentMenu.giorni.length + 1;
    MenuState.currentMenu.giorni.push({
        giornoIndex: nextIdx,
        titolo: `Giorno ${nextIdx}`,
        pasti: [
            { tipo: 'Colazione', ricette: [] },
            { tipo: 'Pranzo', ricette: [] },
            { tipo: 'Cena', ricette: [] }
        ]
    });
    renderMenuDays();
}

function renderMenuDays() {
    const container = document.getElementById('menuDaysContainer');
    if (!container || !MenuState.currentMenu) return;

    const giorni = MenuState.currentMenu.giorni || [];

    if (giorni.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                Nessun giorno nel menù. Fai clic su "Aggiungi Giorno al Menù" in basso.
            </div>
        `;
        return;
    }

    container.innerHTML = giorni.map((day, dayIndex) => {
        // Calcola somma nutrizionale per l'intero giorno
        const tutteRicetteGiorno = [];
        (day.pasti || []).forEach(p => {
            (p.ricette || []).forEach(r => tutteRicetteGiorno.push(r));
        });
        const sommaDay = calcolaSommaNutrizionale(tutteRicetteGiorno);
        const participants = MenuState.currentMenu.partecipantiDefault || 20;
        const kcalPerPersona = Math.round(sommaDay.kcal / participants);

        return `
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden" data-day-index="${dayIndex}">
                <!-- Header Giorno -->
                <div class="p-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">📅</span>
                        <input type="text" value="${escapeHtml(day.titolo)}" class="day-title-input font-bold text-base bg-transparent border-b border-dashed border-gray-400 focus:outline-none dark:text-white" data-day-index="${dayIndex}" />
                    </div>

                    <!-- Macro Totali Giornalieri -->
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        <span class="px-2.5 py-1 rounded-md font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            ${sommaDay.kcal} kcal tot (${kcalPerPersona} kcal/persona)
                        </span>
                        <span class="px-2 py-1 rounded-md font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            P: ${sommaDay.proteine}g · C: ${sommaDay.carboidrati}g · G: ${sommaDay.grassi}g
                        </span>
                        <button type="button" class="btn-remove-day text-xs text-red-500 hover:text-red-700 p-1" data-day-index="${dayIndex}" title="Elimina Giorno">
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Griglia Pasti del Giorno -->
                <div class="p-4 sm:p-5 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${(day.pasti || []).map((pasto, pastoIndex) => renderMealCard(pasto, dayIndex, pastoIndex)).join('')}
                    </div>

                    <!-- Aggiungi tipo pasto extra al giorno -->
                    <div class="pt-2 flex items-center gap-2">
                        <select class="add-meal-select text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" data-day-index="${dayIndex}">
                            <option value="">+ Aggiungi pasto (Merenda, Spuntino, Gara di Cucina...)</option>
                            ${TIPI_PASTO.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Listener interazioni Planner
    container.querySelectorAll('.day-title-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-day-index'), 10);
            MenuState.currentMenu.giorni[idx].titolo = e.target.value.trim();
        });
    });

    container.querySelectorAll('.btn-remove-day').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
            MenuState.currentMenu.giorni.splice(idx, 1);
            renderMenuDays();
        });
    });

    container.querySelectorAll('.add-meal-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const mealType = e.target.value;
            if (!mealType) return;
            const dayIdx = parseInt(e.target.getAttribute('data-day-index'), 10);
            MenuState.currentMenu.giorni[dayIdx].pasti.push({ tipo: mealType, ricette: [] });
            renderMenuDays();
        });
    });

    container.querySelectorAll('.btn-add-recipe-to-meal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dayIdx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
            const mealIdx = parseInt(e.currentTarget.getAttribute('data-meal-index'), 10);
            openRecipePickerModal(dayIdx, mealIdx);
        });
    });

    container.querySelectorAll('.btn-remove-recipe-from-meal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const dayIdx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
            const mealIdx = parseInt(e.currentTarget.getAttribute('data-meal-index'), 10);
            const recIdx = parseInt(e.currentTarget.getAttribute('data-recipe-index'), 10);
            MenuState.currentMenu.giorni[dayIdx].pasti[mealIdx].ricette.splice(recIdx, 1);
            renderMenuDays();
            renderAllergenAlerts();
        });
    });
}

function renderMealCard(pasto, dayIndex, pastoIndex) {
    const ricette = pasto.ricette || [];
    const sommaPasto = calcolaSommaNutrizionale(ricette);

    return `
        <div class="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/80 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
            <div>
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <span class="text-xs font-extrabold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        🍳 ${pasto.tipo}
                    </span>
                    <span class="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        ${sommaPasto.kcal} kcal
                    </span>
                </div>

                <!-- Lista ricette del pasto -->
                <div class="space-y-2">
                    ${ricette.map((rec, recIndex) => `
                        <div class="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs flex items-center justify-between gap-2 shadow-xs">
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white">${escapeHtml(rec.nome)}</div>
                                <div class="text-[10px] text-gray-500">
                                    ${rec.totaleNutrizione?.kcal || 0} kcal · P: ${rec.totaleNutrizione?.proteine || 0}g · C: ${rec.totaleNutrizione?.carboidrati || 0}g
                                </div>
                            </div>
                            <button type="button" class="btn-remove-recipe-from-meal text-red-500 hover:text-red-700 p-1"
                                data-day-index="${dayIndex}" data-meal-index="${pastoIndex}" data-recipe-index="${recIndex}" title="Rimuovi ricetta dal pasto">
                                ✕
                            </button>
                        </div>
                    `).join('')}

                    ${ricette.length === 0 ? `<div class="text-xs text-gray-400 italic text-center py-2">Nessuna ricetta selezionata</div>` : ''}
                </div>
            </div>

            <!-- Bottone Aggiungi Ricetta al Pasto -->
            <button type="button" class="btn-add-recipe-to-meal w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-900/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 transition-colors flex items-center justify-center gap-1"
                data-day-index="${dayIndex}" data-meal-index="${pastoIndex}">
                ➕ Aggiungi Ricetta
            </button>
        </div>
    `;
}

/**
 * Modale leggero per scegliere una ricetta da associare a un pasto
 */
function openRecipePickerModal(dayIdx, mealIdx) {
    const picker = document.createElement('div');
    picker.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60';
    picker.id = 'recipePickerModal';

    picker.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <h3 class="font-bold text-base text-gray-900 dark:text-white">Seleziona Ricetta da aggiungere</h3>
                <button type="button" class="btn-close-picker text-xl text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <input type="text" id="pickerSearch" placeholder="Cerca ricetta..."
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none" />
            <div id="pickerList" class="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                ${MenuState.ricette.map(r => `
                    <div class="picker-item py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between text-xs" data-id="${r.id}">
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">${escapeHtml(r.nome)}</div>
                            <div class="text-[10px] text-gray-500">${r.categoria} · ${r.nutrizione?.perPorzione?.kcal || 0} kcal/porz</div>
                        </div>
                        <span class="text-green-600 font-bold">Scegli ➔</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(picker);

    const close = () => picker.remove();
    picker.querySelector('.btn-close-picker')?.addEventListener('click', close);
    picker.addEventListener('click', (e) => { if (e.target === picker) close(); });

    const searchInput = picker.querySelector('#pickerSearch');
    searchInput?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        picker.querySelectorAll('.picker-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(q) ? 'flex' : 'none';
        });
    });

    picker.querySelectorAll('.picker-item').forEach(item => {
        item.addEventListener('click', () => {
            const rId = item.getAttribute('data-id');
            const recipe = MenuState.ricette.find(r => r.id === rId);
            if (recipe) {
                const participants = MenuState.currentMenu.partecipantiDefault || 20;
                const scaled = scalaRicetta(recipe, participants);
                MenuState.currentMenu.giorni[dayIdx].pasti[mealIdx].ricette.push(scaled);
                renderMenuDays();
                renderAllergenAlerts();
            }
            close();
        });
    });
}

/**
 * Controlla se ci sono partecipanti dell'attività corrente a rischio allergeni
 */
function renderAllergenAlerts() {
    const banner = document.getElementById('allergenAlertBanner');
    const content = document.getElementById('allergenAlertContent');
    if (!banner || !content) return;

    if (!MenuState.currentMenu || !MenuState.currentMenu.attivitaId) {
        banner.classList.add('hidden');
        return;
    }

    // Raccoglie tutte le ricette inserite nel menù
    const allRecipes = [];
    (MenuState.currentMenu.giorni || []).forEach(d => {
        (d.pasti || []).forEach(p => {
            (p.ricette || []).forEach(r => allRecipes.push(r));
        });
    });

    if (allRecipes.length === 0) {
        banner.classList.add('hidden');
        return;
    }

    const alerts = verificaAllarmiAllergeni(allRecipes, MenuState.scouts);

    if (alerts.length === 0) {
        banner.classList.add('hidden');
        return;
    }

    banner.classList.remove('hidden');
    content.innerHTML = alerts.map(a => `
        <div class="flex items-start gap-1.5">
            <span class="font-bold text-amber-900 dark:text-amber-100">• ${escapeHtml(a.nome)}:</span>
            <span>Allergia/Intolleranza a <strong>${escapeHtml(a.allergiaLabel)}</strong> presente in: <em>${escapeHtml(a.ricetteIncongruenti.join(', '))}</em></span>
        </div>
    `).join('');
}

/**
 * Salva il menù corrente su Facade / LocalAdapter
 */
async function handleSaveCurrentMenu() {
    if (!MenuState.currentMenu) return;

    try {
        const id = await DATA.saveMenu(MenuState.currentMenu, UI.currentUser);
        MenuState.currentMenu.id = id;
        MenuState.menus = await DATA.getMenus();
        renderMenuDropdowns();
        updateTopStats();
        UI.showToast('Menù salvato con successo!', { type: 'success' });
    } catch (err) {
        console.error('Errore salvataggio menù:', err);
        UI.showToast('Errore durante il salvataggio del menù: ' + err.message, { type: 'error' });
    }
}

/**
 * Conferma Menù e genera liste spesa e strumenti passando al Tab 3
 */
async function handleConfirmMenuAndGenerateLists() {
    await handleSaveCurrentMenu();
    switchTab('liste');
}

/* ==========================================================================
   TAB 3: LISTE SPESA & STRUMENTI
   ========================================================================== */

function renderLists() {
    const titleEl = document.getElementById('listeMenuTitle');
    const subtitleEl = document.getElementById('listeMenuSubtitle');
    if (titleEl && MenuState.currentMenu) {
        titleEl.textContent = `Liste: ${MenuState.currentMenu.titolo || 'Menù'}`;
    }
    if (subtitleEl && MenuState.currentMenu) {
        subtitleEl.textContent = `Fabbisogno calcolato per ${MenuState.currentMenu.partecipantiDefault || 20} partecipanti`;
    }

    // Estrai tutti i pasti con le rispettive ricette dal menù corrente
    const pastiList = [];
    (MenuState.currentMenu?.giorni || []).forEach(day => {
        (day.pasti || []).forEach(p => {
            pastiList.push({ tipo: p.tipo, ricette: p.ricette || [] });
        });
    });

    // 1. Genera lista della spesa con confronto Scorte
    const spesaResult = generaListaSpesa(pastiList, MenuState.scorte);
    MenuState.currentMenu.listaSpesaGenerata = spesaResult;
    MenuState.currentMenu.costoTotaleStimato = spesaResult.costoTotaleStimato;

    renderShoppingTable(spesaResult);

    // 2. Genera lista strumenti di cucina
    const strumentiList = generaListaStrumenti(pastiList);
    MenuState.currentMenu.listaStrumentiGenerata = strumentiList;

    renderToolsList(strumentiList);

    // Aggiorna badge costi
    const costBadge = document.getElementById('shoppingCostBadge');
    if (costBadge) {
        costBadge.textContent = `Totale: ${spesaResult.costoTotaleStimato.toFixed(2).replace('.', ',')} €`;
    }
    updateTopStats();
}

function renderShoppingTable(spesaResult) {
    const tbody = document.getElementById('shoppingListTbody');
    const emptyMsg = document.getElementById('shoppingEmptyMessage');
    const scorteContainer = document.getElementById('scortePresentiContainer');
    const scorteCountBadge = document.getElementById('scorteCountBadge');
    if (!tbody) return;

    const itemsToBuy = spesaResult.daAcquistare || [];
    const itemsInStock = spesaResult.inScorteSufficienti || [];

    if (itemsToBuy.length === 0) {
        tbody.innerHTML = '';
        emptyMsg?.classList.remove('hidden');
    } else {
        emptyMsg?.classList.add('hidden');
        tbody.innerHTML = itemsToBuy.map(item => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="p-3 text-center">
                    <input type="checkbox" class="rounded text-green-600 focus:ring-green-500 cursor-pointer" />
                </td>
                <td class="p-3 font-semibold text-gray-900 dark:text-white">
                    <div>${escapeHtml(item.nome)}</div>
                    <div class="text-[11px] text-gray-500 font-normal">
                        ${item.categoriaSpesa} · <span class="text-blue-600 dark:text-blue-400 font-medium">${item.ricetteLabel}</span>
                    </div>
                </td>
                <td class="p-3 text-right text-gray-600 dark:text-gray-300">
                    ${item.formattedTotale}
                </td>
                <td class="p-3 text-right text-amber-700 dark:text-amber-400 font-medium">
                    ${item.quantitaInScorte > 0 ? item.formattedInScorte : '-'}
                </td>
                <td class="p-3 text-right font-bold text-gray-900 dark:text-white">
                    ${item.formattedDaComprare}
                </td>
                <td class="p-3 text-right font-semibold text-green-700 dark:text-green-400">
                    ${item.costoStimato > 0 ? `${item.costoStimato.toFixed(2).replace('.', ',')} €` : '-'}
                </td>
            </tr>
        `).join('');
    }

    // Sezione scorte presenti
    if (scorteContainer) {
        if (scorteCountBadge) scorteCountBadge.textContent = `${itemsInStock.length} articoli`;
        if (itemsInStock.length === 0) {
            scorteContainer.innerHTML = `<div class="text-gray-500 italic col-span-2">Nessun ingrediente coperto interamente da scorte</div>`;
        } else {
            scorteContainer.innerHTML = itemsInStock.map(item => `
                <div class="p-2.5 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                        <div class="font-bold text-emerald-900 dark:text-emerald-200">${escapeHtml(item.nome)}</div>
                        <div class="text-[10px] text-emerald-700 dark:text-emerald-400">${item.ricetteLabel}</div>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                            ${item.formattedInScorte} in scorte
                        </span>
                    </div>
                </div>
            `).join('');
        }
    }
}

function renderToolsList(strumentiList) {
    const container = document.getElementById('toolsListContainer');
    const emptyMsg = document.getElementById('toolsEmptyMessage');
    if (!container) return;

    if (strumentiList.length === 0) {
        container.innerHTML = '';
        emptyMsg?.classList.remove('hidden');
        return;
    }

    emptyMsg?.classList.add('hidden');
    container.innerHTML = strumentiList.map(st => `
        <div class="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center justify-between text-xs hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-2">
                <input type="checkbox" class="rounded text-green-600 cursor-pointer" />
                <div>
                    <div class="font-bold text-gray-900 dark:text-white">${escapeHtml(st.nome)}</div>
                    <div class="text-[10px] text-gray-500">${st.ricetteLabel}</div>
                </div>
            </div>
            <span class="px-2 py-0.5 rounded-md font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                q.tà ${st.quantita}
            </span>
        </div>
    `).join('');
}

/**
 * Invia la stima economica della spesa al Preventivo dell'Attività
 */
async function handleSendToPreventivo() {
    if (!MenuState.currentMenu) return;
    const actId = MenuState.currentMenu.attivitaId;
    if (!actId) {
        UI.showToast('Collega prima il Menù ad un\'Attività nel Pianificatore per inviare il preventivo', { type: 'warning' });
        return;
    }

    const estimatedCost = MenuState.currentMenu.costoTotaleStimato || 0;
    if (estimatedCost <= 0) {
        UI.showToast('Nessun costo da inviare al preventivo', { type: 'info' });
        return;
    }

    try {
        // Cerca eventuale budget esistente per l'attività
        let budget = null;
        if (typeof DATA.getBudgetByActivity === 'function') {
            budget = await DATA.getBudgetByActivity(actId);
        }

        const cambusaEntry = {
            id: 'cambusa_' + (MenuState.currentMenu.id || 'curr'),
            descrizione: `Viveri & Spesa Cambusa (${MenuState.currentMenu.titolo || 'Menù'})`,
            categoria: 'Cambusa',
            importo: estimatedCost,
            tipo: 'uscita',
            note: `Generato automaticamente dal Menù per ${MenuState.currentMenu.partecipantiDefault || 20} partecipanti`,
            data: new Date().toISOString().split('T')[0]
        };

        let updatedVoci = [];
        if (budget && Array.isArray(budget.voci)) {
            // Sostituisci o aggiungi voce cambusa
            updatedVoci = budget.voci.filter(v => v.categoria !== 'Cambusa');
            updatedVoci.push(cambusaEntry);
        } else {
            updatedVoci = [cambusaEntry];
        }

        if (typeof DATA.saveBudget === 'function') {
            await DATA.saveBudget({
                id: budget?.id || null,
                attivitaId: actId,
                voci: updatedVoci,
                totaleSpesaCambusa: estimatedCost,
                updatedAt: new Date().toISOString()
            }, UI.currentUser);
        }

        UI.showToast(`Stima cambusa di ${estimatedCost.toFixed(2).replace('.', ',')} € inviata al Preventivo!`, { type: 'success' });
    } catch (err) {
        console.error('Errore invio a preventivo:', err);
        UI.showToast('Errore durante l\'invio al preventivo: ' + err.message, { type: 'error' });
    }
}

/**
 * Formatta e copia la lista della spesa per WhatsApp
 */
function handleCopyWhatsAppShopping() {
    const spesa = MenuState.currentMenu?.listaSpesaGenerata;
    if (!spesa) return;

    let text = `🛒 *LISTA DELLA SPESA CAMBUSA*\n`;
    text += `*Menù:* ${MenuState.currentMenu.titolo || 'Uscita'}\n`;
    text += `*Partecipanti:* ${MenuState.currentMenu.partecipantiDefault || 20}\n`;
    text += `*Stima Costo:* ${spesa.costoTotaleStimato.toFixed(2).replace('.', ',')} €\n\n`;

    text += `*DA ACQUISTARE:*\n`;
    spesa.daAcquistare.forEach(item => {
        text += `• ${item.nome}: *${item.formattedDaComprare}* (${item.ricetteLabel})\n`;
    });

    if (spesa.inScorteSufficienti.length > 0) {
        text += `\n*DISPONIBILE IN SCORTE (NON comprare):*\n`;
        spesa.inScorteSufficienti.forEach(item => {
            text += `✅ ${item.nome}: ${item.formattedInScorte}\n`;
        });
    }

    navigator.clipboard.writeText(text).then(() => {
        UI.showToast('Lista della spesa copiata negli appunti!', { type: 'success' });
    }).catch(() => {
        UI.showToast('Impossibile copiare negli appunti', { type: 'error' });
    });
}

/**
 * Copia elenco strumenti negli appunti
 */
function handleCopyToolsList() {
    const strumenti = MenuState.currentMenu?.listaStrumentiGenerata || [];
    if (strumenti.length === 0) return;

    let text = `🍳 *ATTREZZATURA E STRUMENTI DI CUCINA*\n`;
    text += `*Menù:* ${MenuState.currentMenu.titolo || 'Uscita'}\n\n`;
    strumenti.forEach(st => {
        text += `• ${st.nome}: q.tà ${st.quantita} (${st.ricetteLabel})\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        UI.showToast('Elenco strumenti copiato negli appunti!', { type: 'success' });
    }).catch(() => {
        UI.showToast('Impossibile copiare negli appunti', { type: 'error' });
    });
}

/**
 * Stampa pulita A4 della Lista della Spesa
 */
function handlePrintShoppingList() {
    const printArea = document.getElementById('printArea');
    const spesa = MenuState.currentMenu?.listaSpesaGenerata;
    if (!printArea || !spesa) return;

    let html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">LISTA DELLA SPESA - CAMBUSA SCOUT</h1>
            <div style="font-size: 13px; color: #555; margin-bottom: 16px;">
                Menù: <strong>${escapeHtml(MenuState.currentMenu.titolo || 'Uscita')}</strong> |
                Partecipanti: <strong>${MenuState.currentMenu.partecipantiDefault || 20}</strong> |
                Data: ${new Date().toLocaleDateString('it-IT')} |
                Stima Costo: <strong>${spesa.costoTotaleStimato.toFixed(2).replace('.', ',')} €</strong>
            </div>

            <h3 style="font-size: 15px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">ARTICOLI DA COMPRARE</h3>
            <table class="print-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">[ ]</th>
                        <th>Ingrediente</th>
                        <th>Categoria</th>
                        <th style="text-align: right;">Fabbisogno</th>
                        <th style="text-align: right;">In Scorte</th>
                        <th style="text-align: right;">DA COMPRARE</th>
                        <th style="text-align: right;">Stima Costo</th>
                    </tr>
                </thead>
                <tbody>
                    ${spesa.daAcquistare.map(item => `
                        <tr>
                            <td style="text-align: center;">[ ]</td>
                            <td><strong>${escapeHtml(item.nome)}</strong> <span style="font-size: 10px; color: #666;">(${item.ricetteLabel})</span></td>
                            <td>${escapeHtml(item.categoriaSpesa)}</td>
                            <td style="text-align: right;">${item.formattedTotale}</td>
                            <td style="text-align: right;">${item.quantitaInScorte > 0 ? item.formattedInScorte : '-'}</td>
                            <td style="text-align: right;"><strong>${item.formattedDaComprare}</strong></td>
                            <td style="text-align: right;">${item.costoStimato > 0 ? `${item.costoStimato.toFixed(2).replace('.', ',')} €` : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            ${spesa.inScorteSufficienti.length > 0 ? `
                <h3 style="font-size: 14px; font-weight: bold; margin-top: 24px; margin-bottom: 6px; color: #166534;">
                    GIÀ IN SCORTE (NON DA COMPRARE)
                </h3>
                <ul style="font-size: 12px; line-height: 1.6; margin-top: 4px;">
                    ${spesa.inScorteSufficienti.map(i => `
                        <li>✓ <strong>${escapeHtml(i.nome)}</strong>: ${i.formattedInScorte} presenti (${i.ricetteLabel})</li>
                    `).join('')}
                </ul>
            ` : ''}
        </div>
    `;

    printArea.innerHTML = html;
    window.print();
}

/* ==========================================================================
   MODALE RICETTA (CREAZIONE / MODIFICA A MANO)
   ========================================================================== */

function openRecipeModal(recipe = null) {
    const modal = document.getElementById('recipeModal');
    const title = document.getElementById('recipeModalTitle');
    const form = document.getElementById('recipeForm');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('recipeIngredientsRows').innerHTML = '';
    document.getElementById('recipeStepsRows').innerHTML = '';
    document.getElementById('recipeToolsRows').innerHTML = '';

    if (recipe) {
        if (title) title.innerHTML = `<span>✏️</span> Modifica Ricetta: ${escapeHtml(recipe.nome)}`;
        document.getElementById('recipeIdInput').value = recipe.id || '';
        document.getElementById('recipeNomeInput').value = recipe.nome || '';
        document.getElementById('recipeCategoriaInput').value = recipe.categoria || 'Pranzo';
        document.getElementById('recipeDescrizioneInput').value = recipe.descrizione || '';
        document.getElementById('recipePorzioniBaseInput').value = recipe.porzioniBase || 4;
        document.getElementById('recipeTempoPrepInput').value = recipe.tempoPreparazione || 15;
        document.getElementById('recipeTempoCotturaInput').value = recipe.tempoCottura || 20;
        document.getElementById('recipeDifficoltaInput').value = recipe.difficolta || 'Facile';
        document.getElementById('recipeNoteAlimentariInput').value = recipe.noteAlimentari || '';

        // Allergeni Checkboxes
        (recipe.allergeni || []).forEach(allId => {
            const cb = document.getElementById(`all_cb_${allId}`);
            if (cb) cb.checked = true;
        });

        // Dieta Checkboxes
        (recipe.diete || []).forEach(dietId => {
            const cb = document.getElementById(`diet_cb_${dietId}`);
            if (cb) cb.checked = true;
        });

        // Ingredienti
        (recipe.ingredienti || []).forEach(ing => addIngredientRow(ing));

        // Passaggi
        (recipe.passaggi || []).forEach(step => addStepRow(step));

        // Strumenti
        (recipe.strumenti || []).forEach(tool => addToolRow(tool));

        // Nutrizione
        const nut = recipe.nutrizione?.perPorzione || {};
        document.getElementById('nutrKcalPorz').value = nut.kcal || '';
        document.getElementById('nutrProtPorz').value = nut.proteine || '';
        document.getElementById('nutrCarbPorz').value = nut.carboidrati || '';
        document.getElementById('nutrFatPorz').value = nut.grassi || '';

        // Storico
        const histContainer = document.getElementById('recipeHistoryContainer');
        if (histContainer) {
            if ((recipe.storicoManuale || []).length > 0) {
                histContainer.innerHTML = recipe.storicoManuale.map(h => `
                    <div>• <strong>${h.data || ''}</strong>: ${escapeHtml(h.note || 'Preparata')}</div>
                `).join('');
            } else {
                histContainer.textContent = 'Nessuna attività registrata in precedenza.';
            }
        }
    } else {
        if (title) title.innerHTML = `<span>➕</span> Nuova Ricetta Scout`;
        document.getElementById('recipeIdInput').value = '';
        addIngredientRow();
        addStepRow();
        addToolRow();
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function renderCheckboxes() {
    const allContainer = document.getElementById('recipeAllergeniCheckboxes');
    const dietContainer = document.getElementById('recipeDieteCheckboxes');

    if (allContainer) {
        allContainer.innerHTML = ALLERGENI_COMUNI.map(all => `
            <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="all_cb_${all.id}" value="${all.id}" class="rounded text-amber-600 focus:ring-amber-500" />
                <span>${all.icon} ${all.label}</span>
            </label>
        `).join('');
    }

    if (dietContainer) {
        dietContainer.innerHTML = DIETE_COMUNI.map(diet => `
            <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="diet_cb_${diet.id}" value="${diet.id}" class="rounded text-green-600 focus:ring-green-500" />
                <span>${diet.icon} ${diet.label}</span>
            </label>
        `).join('');
    }
}

function addIngredientRow(data = {}) {
    const container = document.getElementById('recipeIngredientsRows');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'ingredient-row flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-xs';
    row.innerHTML = `
        <input type="text" placeholder="Nome ingrediente *" value="${escapeHtml(data.nome || '')}" required
            class="ing-nome flex-1 min-w-[140px] px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white" />
        <input type="number" step="0.1" placeholder="Qtà" value="${data.quantita ?? ''}" required
            class="ing-qta w-16 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-right" />
        <select class="ing-unita px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white">
            <option value="g" ${data.unita === 'g' ? 'selected' : ''}>g</option>
            <option value="kg" ${data.unita === 'kg' ? 'selected' : ''}>kg</option>
            <option value="ml" ${data.unita === 'ml' ? 'selected' : ''}>ml</option>
            <option value="l" ${data.unita === 'l' ? 'selected' : ''}>l</option>
            <option value="pz" ${data.unita === 'pz' ? 'selected' : ''}>pz</option>
            <option value="cucchiai" ${data.unita === 'cucchiai' ? 'selected' : ''}>cucchiai</option>
        </select>
        <input type="number" step="0.1" placeholder="€/kg" value="${data.costoStimatoKg ?? ''}" title="Prezzo stimato al kg"
            class="ing-costo w-16 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-right" />
        <label class="flex items-center gap-1 text-[11px] text-gray-500" title="Riscala quantità in base al numero di partecipanti">
            <input type="checkbox" class="ing-scalabile rounded" ${data.scalabile !== false ? 'checked' : ''} />
            Scalabile
        </label>
        <button type="button" class="btn-remove-row text-red-500 hover:text-red-700 font-bold p-1">✕</button>
    `;

    row.querySelector('.btn-remove-row')?.addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function addStepRow(text = '') {
    const container = document.getElementById('recipeStepsRows');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'step-row flex items-start gap-2';
    row.innerHTML = `
        <span class="text-xs font-bold text-gray-400 pt-2 step-num">${container.children.length + 1}.</span>
        <textarea rows="1" placeholder="Descrivi il passaggio..." required
            class="step-text flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none">${escapeHtml(text)}</textarea>
        <button type="button" class="btn-remove-row text-red-500 hover:text-red-700 font-bold p-1 pt-1.5">✕</button>
    `;
    row.querySelector('.btn-remove-row')?.addEventListener('click', () => {
        row.remove();
        updateStepNumbers();
    });
    container.appendChild(row);
}

function updateStepNumbers() {
    const container = document.getElementById('recipeStepsRows');
    if (!container) return;
    Array.from(container.children).forEach((child, i) => {
        const num = child.querySelector('.step-num');
        if (num) num.textContent = `${i + 1}.`;
    });
}

function addToolRow(data = {}) {
    const container = document.getElementById('recipeToolsRows');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'tool-row flex items-center gap-2';
    row.innerHTML = `
        <input type="text" placeholder="Strumento (es. Pentola grande 10L)" value="${escapeHtml(data.nome || '')}" required
            class="tool-nome flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" />
        <input type="number" min="1" value="${data.quantita || 1}" required
            class="tool-qta w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-right" />
        <button type="button" class="btn-remove-row text-red-500 hover:text-red-700 font-bold p-1">✕</button>
    `;
    row.querySelector('.btn-remove-row')?.addEventListener('click', () => row.remove());
    container.appendChild(row);
}

/**
 * Calcola automaticamente le calorie e i macronutrienti stimati a partire dal database alimenti
 */
async function handleCalcNutritionFromIngredients() {
    const allAlimenti = await DATA.getAlimenti();
    const rows = document.querySelectorAll('#recipeIngredientsRows .ingredient-row');
    const porzioni = Number(document.getElementById('recipePorzioniBaseInput').value) || 4;

    let totKcal = 0, totProt = 0, totCarb = 0, totFat = 0;

    rows.forEach(r => {
        const nome = r.querySelector('.ing-nome')?.value.toLowerCase().trim() || '';
        const qta = Number(r.querySelector('.ing-qta')?.value) || 0;
        const unita = r.querySelector('.ing-unita')?.value || 'g';

        const match = allAlimenti.find(a => (a.nome || '').toLowerCase().includes(nome) || nome.includes((a.nome || '').toLowerCase()));
        if (match && match.nutrizione100g) {
            const norm = normalizzaUnita(qta, unita);
            const factor = norm.quantitaNorm / 100;
            totKcal += (match.nutrizione100g.kcal || 0) * factor;
            totProt += (match.nutrizione100g.proteine || 0) * factor;
            totCarb += (match.nutrizione100g.carboidrati || 0) * factor;
            totFat += (match.nutrizione100g.grassi || 0) * factor;
        }
    });

    document.getElementById('nutrKcalPorz').value = Math.round(totKcal / porzioni) || 0;
    document.getElementById('nutrProtPorz').value = Math.round((totProt / porzioni) * 10) / 10 || 0;
    document.getElementById('nutrCarbPorz').value = Math.round((totCarb / porzioni) * 10) / 10 || 0;
    document.getElementById('nutrFatPorz').value = Math.round((totFat / porzioni) * 10) / 10 || 0;

    UI.showToast('Valori nutrizionali calcolati con successo dagli alimenti!', { type: 'success' });
}

/**
 * Salvataggio form ricetta
 */
async function handleSaveRecipe(e) {
    e.preventDefault();

    const id = document.getElementById('recipeIdInput').value || null;
    const nome = document.getElementById('recipeNomeInput').value.trim();
    const categoria = document.getElementById('recipeCategoriaInput').value;
    const descrizione = document.getElementById('recipeDescrizioneInput').value.trim();
    const porzioniBase = Number(document.getElementById('recipePorzioniBaseInput').value) || 4;
    const tempoPreparazione = Number(document.getElementById('recipeTempoPrepInput').value) || 0;
    const tempoCottura = Number(document.getElementById('recipeTempoCotturaInput').value) || 0;
    const difficolta = document.getElementById('recipeDifficoltaInput').value;
    const noteAlimentari = document.getElementById('recipeNoteAlimentariInput').value.trim();

    // Raccoglie allergeni
    const allergeni = [];
    ALLERGENI_COMUNI.forEach(all => {
        const cb = document.getElementById(`all_cb_${all.id}`);
        if (cb && cb.checked) allergeni.push(all.id);
    });

    // Raccoglie diete
    const diete = [];
    DIETE_COMUNI.forEach(diet => {
        const cb = document.getElementById(`diet_cb_${diet.id}`);
        if (cb && cb.checked) diete.push(diet.id);
    });

    // Raccoglie ingredienti
    const ingredienti = [];
    document.querySelectorAll('#recipeIngredientsRows .ingredient-row').forEach(row => {
        const ingNome = row.querySelector('.ing-nome')?.value.trim();
        const ingQta = Number(row.querySelector('.ing-qta')?.value) || 0;
        const ingUnita = row.querySelector('.ing-unita')?.value || 'g';
        const ingCosto = Number(row.querySelector('.ing-costo')?.value) || 0;
        const ingScalabile = row.querySelector('.ing-scalabile')?.checked ?? true;
        if (ingNome) {
            ingredienti.push({
                nome: ingNome,
                quantita: ingQta,
                unita: ingUnita,
                costoStimatoKg: ingCosto,
                scalabile: ingScalabile
            });
        }
    });

    // Raccoglie passaggi
    const passaggi = [];
    document.querySelectorAll('#recipeStepsRows .step-text').forEach(t => {
        const s = t.value.trim();
        if (s) passaggi.push(s);
    });

    // Raccoglie strumenti
    const strumenti = [];
    document.querySelectorAll('#recipeToolsRows .tool-row').forEach(row => {
        const tNome = row.querySelector('.tool-nome')?.value.trim();
        const tQta = Number(row.querySelector('.tool-qta')?.value) || 1;
        if (tNome) strumenti.push({ nome: tNome, quantita: tQta });
    });

    const nutrizione = {
        origine: 'manuale',
        perPorzione: {
            kcal: Number(document.getElementById('nutrKcalPorz').value) || 0,
            proteine: Number(document.getElementById('nutrProtPorz').value) || 0,
            carboidrati: Number(document.getElementById('nutrCarbPorz').value) || 0,
            grassi: Number(document.getElementById('nutrFatPorz').value) || 0
        }
    };

    const recipeData = {
        id,
        nome,
        categoria,
        descrizione,
        porzioniBase,
        tempoPreparazione,
        tempoCottura,
        difficolta,
        metodoCottura: ['Fornellone'],
        allergeni,
        diete,
        noteAlimentari,
        ingredienti,
        passaggi,
        strumenti,
        nutrizione
    };

    try {
        if (id) {
            await DATA.updateRicetta(id, recipeData, UI.currentUser);
            UI.showToast(`Ricetta "${nome}" modificata!`, { type: 'success' });
        } else {
            await DATA.addRicetta(recipeData, UI.currentUser);
            UI.showToast(`Ricetta "${nome}" salvata con successo!`, { type: 'success' });
        }
        MenuState.ricette = await DATA.getRicette();
        closeRecipeModal();
        renderRecipesGrid();
        updateTopStats();
    } catch (err) {
        console.error('Errore salvataggio ricetta:', err);
        UI.showToast('Errore durante il salvataggio: ' + err.message, { type: 'error' });
    }
}

/* ==========================================================================
   MODALE IMPORTA DA URL
   ========================================================================== */

function openImportModal() {
    const modal = document.getElementById('importRecipeModal');
    const msg = document.getElementById('importStatusMessage');
    const urlInput = document.getElementById('importUrlInput');
    if (!modal) return;

    if (urlInput) urlInput.value = '';
    if (msg) {
        msg.className = 'hidden';
        msg.textContent = '';
    }
    modal.classList.remove('hidden');
}

function closeImportModal() {
    const modal = document.getElementById('importRecipeModal');
    if (modal) modal.classList.add('hidden');
}

async function handleImportRecipeFromUrl() {
    const urlInput = document.getElementById('importUrlInput');
    const msg = document.getElementById('importStatusMessage');
    const btn = document.getElementById('startImportBtn');
    const url = urlInput?.value.trim();

    if (!url) {
        UI.showToast('Inserisci un URL valido', { type: 'warning' });
        return;
    }

    if (btn) btn.disabled = true;
    if (msg) {
        msg.className = 'text-xs p-3 rounded-lg bg-blue-50 text-blue-700 block';
        msg.textContent = 'Analisi della pagina e lettura degli ingredienti in corso...';
    }

    try {
        const importedRecipe = await NutritionService.importFromUrl(url);
        closeImportModal();
        openRecipeModal(importedRecipe);
        UI.showToast(`Ricetta "${importedRecipe.nome}" importata! Controlla e salva.`, { type: 'success', duration: 4000 });
    } catch (err) {
        console.error('Errore import:', err);
        if (msg) {
            msg.className = 'text-xs p-3 rounded-lg bg-red-50 text-red-700 block';
            msg.textContent = 'Errore importazione: ' + err.message;
        }
        UI.showToast('Impossibile importare: ' + err.message, { type: 'error' });
    } finally {
        if (btn) btn.disabled = false;
    }
}

/**
 * Funzione di utilità per escaping HTML
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
