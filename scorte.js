// scorte.js - Logica per la gestione scorte, inventario e preventivo di riordino con liste separate
import { DATA } from './js/data/data-facade.js';
import { UI } from './js/ui/ui.js';

if (typeof window !== 'undefined') {
  window.DATA = DATA;
  window.UI = UI;
}

UI.renderCurrentPage = function () {
  this.initScorte();
};

UI._scorteState = {
  items: [],
  lists: ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'],
  activeList: (typeof localStorage !== 'undefined' && localStorage.getItem('scorte-active-list')) || 'all',
  search: '',
  category: '',
  status: 'all', // 'all', 'reorder', 'ok'
  sort: 'categoria_nome',
  parsedImportItems: [],
  bound: false
};

UI.initScorte = async function () {
  try {
    this.showLoadingOverlay ? this.showLoadingOverlay('Caricamento scorte e liste...') : null;
    const [items, lists] = await Promise.all([
      DATA.getScorte(),
      DATA.getListeScorte()
    ]);
    this._scorteState.items = items || [];
    this._scorteState.lists = lists && lists.length > 0 ? lists : ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
  } catch (err) {
    console.error('Errore caricamento scorte:', err);
    this._scorteState.items = [];
    this._scorteState.lists = ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
  } finally {
    this.hideLoadingOverlay ? this.hideLoadingOverlay() : null;
  }

  this.setupScorteControls();
  this.renderListeTabs();
  this.renderScorte();
};

UI.setupScorteControls = function () {
  const searchInput = document.getElementById('scorteSearchInput');
  const catFilter = document.getElementById('scorteCategoryFilter');
  const statusFilter = document.getElementById('scorteStatusFilter');
  const sortSelect = document.getElementById('scorteSortSelect');
  const resetBtn = document.getElementById('resetScorteFiltersBtn');
  const addBtn = document.getElementById('addMaterialBtn');
  const importBtn = document.getElementById('importMaterialsBtn');
  const openPreventivoBtn = document.getElementById('openPreventivoRiordinoBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const printBtn = document.getElementById('printBtn');
  const sottoScortaCard = document.getElementById('kpiSottoScortaCard');

  // Popola categorie
  this.populateCategoryFilter();

  if (this._scorteState.bound) return;
  this._scorteState.bound = true;

  if (searchInput) {
    let t;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        this._scorteState.search = e.target.value.trim().toLowerCase();
        this.renderScorte();
      }, 150);
    });
  }

  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      this._scorteState.category = e.target.value;
      this.renderScorte();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      this._scorteState.status = e.target.value;
      this.renderScorte();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      this._scorteState.sort = e.target.value;
      this.renderScorte();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      this._scorteState.search = '';
      this._scorteState.category = '';
      this._scorteState.status = 'all';
      this._scorteState.sort = 'categoria_nome';

      if (searchInput) searchInput.value = '';
      if (catFilter) catFilter.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'categoria_nome';

      this.renderScorte();
      this.showToast('Filtri azzerati', { type: 'info' });
    });
  }

  if (sottoScortaCard) {
    sottoScortaCard.addEventListener('click', () => {
      this._scorteState.status = 'reorder';
      if (statusFilter) statusFilter.value = 'reorder';
      this.renderScorte();
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      this.openMaterialModal();
    });
  }

  if (importBtn) {
    importBtn.addEventListener('click', () => {
      this.openImportModal();
    });
  }

  if (openPreventivoBtn) {
    openPreventivoBtn.addEventListener('click', () => {
      this.openPreventivoRiordinoModal();
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      this.exportScorteCsv();
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  this.setupListManagementEvents();
  this.setupMaterialModalEvents();
  this.setupImportModalEvents();
  this.setupPreventivoModalEvents();
};

// ==================== Gestione Liste Separate ====================
UI.renderListeTabs = function () {
  const container = document.getElementById('listeTabsContainer');
  if (!container) return;

  const items = this._scorteState.items || [];
  const lists = this._scorteState.lists || [];
  const activeList = this._scorteState.activeList;

  // Calcola statistiche per ogni lista
  const listStats = {};
  lists.forEach(l => {
    listStats[l] = { total: 0, reorder: 0 };
  });

  let allTotal = 0;
  let allReorder = 0;

  items.forEach(i => {
    const listName = (i.lista || 'Generale').trim();
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    const isReorder = min > q;

    allTotal++;
    if (isReorder) allReorder++;

    if (!listStats[listName]) {
      listStats[listName] = { total: 0, reorder: 0 };
    }
    listStats[listName].total++;
    if (isReorder) listStats[listName].reorder++;
  });

  // Include any extra lists found in items
  const allKnownLists = Array.from(new Set([...lists, ...Object.keys(listStats)])).filter(Boolean);

  let html = '';

  // Tab: Tutte le Liste
  const isAllActive = activeList === 'all';
  html += `
    <button type="button" data-list="all" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
      isAllActive
        ? 'bg-green-700 text-white shadow-sm ring-2 ring-green-600'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
    }">
      <span>Tutte le Liste</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] ${
        isAllActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
      }">${allTotal}</span>
      ${allReorder > 0 ? `<span class="text-[10px]" title="${allReorder} articoli sotto scorta">⚠️</span>` : ''}
    </button>
  `;

  // Tab per ogni lista specifica (es. Campo Estivo, Uniformi, Distintivi, ecc.)
  allKnownLists.forEach(l => {
    const isActive = activeList === l;
    const stats = listStats[l] || { total: 0, reorder: 0 };
    html += `
      <button type="button" data-list="${l}" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
        isActive
          ? 'bg-green-700 text-white shadow-sm ring-2 ring-green-600'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
      }">
        <span>${l}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] ${
          isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
        }">${stats.total}</span>
        ${stats.reorder > 0 ? `<span class="text-[10px] ${isActive ? 'text-amber-200' : 'text-amber-600'}" title="${stats.reorder} da riordinare">⚠️ ${stats.reorder}</span>` : ''}
      </button>
    `;
  });

  container.innerHTML = html;

  // Click listeners sui tab
  container.querySelectorAll('.list-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetList = btn.getAttribute('data-list');
      this.switchActiveList(targetList);
    });
  });

  // Aggiorna visibilità azioni lista attiva
  const actionsEl = document.getElementById('activeListActions');
  if (actionsEl) {
    if (activeList !== 'all' && activeList !== 'Generale') {
      actionsEl.classList.remove('hidden');
    } else {
      actionsEl.classList.add('hidden');
    }
  }
};

UI.switchActiveList = function (listName) {
  this._scorteState.activeList = listName;
  try {
    localStorage.setItem('scorte-active-list', listName);
  } catch {}

  this.renderListeTabs();
  this.populateCategoryFilter();
  this.renderScorte();
};

UI.setupListManagementEvents = function () {
  const addBtn = document.getElementById('addListaBtn');
  const renameBtn = document.getElementById('renameActiveListBtn');
  const deleteBtn = document.getElementById('deleteActiveListBtn');

  const modal = document.getElementById('listModal');
  const closeBtn = document.getElementById('closeListModalBtn');
  const cancelBtn = document.getElementById('cancelListBtn');
  const form = document.getElementById('listForm');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      this.openListModal();
    });
  }

  if (renameBtn) {
    renameBtn.addEventListener('click', () => {
      const active = this._scorteState.activeList;
      if (active && active !== 'all') {
        this.openListModal(active);
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      const active = this._scorteState.activeList;
      if (active && active !== 'all') {
        this.deleteActiveList(active);
      }
    });
  }

  if (closeBtn) closeBtn.onclick = () => modal?.classList.add('hidden');
  if (cancelBtn) cancelBtn.onclick = () => modal?.classList.add('hidden');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.saveListForm();
    };
  }
};

UI.openListModal = function (oldName = '') {
  const modal = document.getElementById('listModal');
  const title = document.getElementById('listModalTitle');
  const input = document.getElementById('listNameInput');
  const oldInput = document.getElementById('listOldName');

  if (!modal) return;

  if (oldName) {
    if (title) title.textContent = `Rinomina Lista "${oldName}"`;
    if (input) input.value = oldName;
    if (oldInput) oldInput.value = oldName;
  } else {
    if (title) title.textContent = 'Nuova Lista Materiali';
    if (input) input.value = '';
    if (oldInput) oldInput.value = '';
  }

  modal.classList.remove('hidden');
  input?.focus();
};

UI.saveListForm = async function () {
  const modal = document.getElementById('listModal');
  const input = document.getElementById('listNameInput');
  const oldInput = document.getElementById('listOldName');
  const newName = input?.value.trim();
  const oldName = oldInput?.value.trim();

  if (!newName) {
    this.showToast('Inserisci il nome della lista', { type: 'error' });
    return;
  }

  try {
    if (oldName) {
      // Rinomina
      await DATA.renameListaScorta(oldName, newName, this.currentUser);
      this.showToast(`Lista rinominata in "${newName}"`);
    } else {
      // Nuova
      await DATA.addListaScorta(newName, this.currentUser);
      this.showToast(`Nuova lista "${newName}" creata con successo!`);
    }

    modal?.classList.add('hidden');
    this._scorteState.lists = await DATA.getListeScorte();
    this._scorteState.items = await DATA.getScorte();
    this._scorteState.activeList = newName;
    try {
      localStorage.setItem('scorte-active-list', newName);
    } catch {}

    this.renderListeTabs();
    this.populateCategoryFilter();
    this.renderScorte();
  } catch (err) {
    console.error('Errore salvataggio lista:', err);
    this.showToast('Errore durante il salvataggio della lista', { type: 'error' });
  }
};

UI.deleteActiveList = function (listName) {
  if (!listName || listName === 'all' || listName === 'Generale') return;

  const count = (this._scorteState.items || []).filter(i => (i.lista || 'Generale') === listName).length;
  const message = count > 0
    ? `Sei sicuro di voler eliminare la lista "${listName}"? I suoi ${count} articoli NON verranno cancellati ma spostati nella lista "Generale".`
    : `Sei sicuro di voler eliminare la lista "${listName}"?`;

  this.showConfirmModal({
    title: `Elimina Lista "${listName}"`,
    message,
    confirmText: 'Elimina Lista',
    cancelText: 'Annulla',
    onConfirm: async () => {
      try {
        await DATA.deleteListaScorta(listName, this.currentUser);
        this.showToast(`Lista "${listName}" eliminata`);

        this._scorteState.lists = await DATA.getListeScorte();
        this._scorteState.items = await DATA.getScorte();
        this._scorteState.activeList = 'all';
        try {
          localStorage.setItem('scorte-active-list', 'all');
        } catch {}

        this.renderListeTabs();
        this.populateCategoryFilter();
        this.renderScorte();
      } catch (err) {
        console.error('Errore eliminazione lista:', err);
        this.showToast('Errore durante l\'eliminazione della lista', { type: 'error' });
      }
    }
  });
};

UI.populateCategoryFilter = function () {
  const catFilter = document.getElementById('scorteCategoryFilter');
  if (!catFilter) return;

  const activeList = this._scorteState.activeList;
  let items = this._scorteState.items || [];
  if (activeList !== 'all') {
    items = items.filter(i => (i.lista || 'Generale') === activeList);
  }

  const currentVal = this._scorteState.category;
  const categories = Array.from(new Set(
    items.map(i => (i.categoria || 'Generale').trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  catFilter.innerHTML = '<option value="">Tutte le categorie</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
  catFilter.value = currentVal;
};

UI.renderScorte = function () {
  const allItems = this._scorteState.items || [];
  const activeList = this._scorteState.activeList;

  // Filtra per lista attiva
  const listItems = activeList === 'all'
    ? allItems
    : allItems.filter(i => (i.lista || 'Generale') === activeList);

  // Calcola metriche per le KPI cards
  const totalItems = listItems.length;
  const categories = new Set(listItems.map(i => (i.categoria || 'Generale').trim()));
  
  let toRestockCount = 0;
  let toRestockUnitsCount = 0;
  let totalRestockCost = 0;
  let latestDate = null;

  listItems.forEach(item => {
    const q = Number(item.quantita) || 0;
    const min = Number(item.quantitaMinima) || 0;
    const price = Number(item.prezzoUnitario) || 0;
    const diff = Math.max(0, min - q);

    if (diff > 0) {
      toRestockCount++;
      toRestockUnitsCount += diff;
      totalRestockCost += (diff * price);
    }

    if (item.dataControllo) {
      const d = new Date(item.dataControllo);
      if (!isNaN(d) && (!latestDate || d > latestDate)) {
        latestDate = d;
      }
    }
  });

  // Aggiorna KPI Cards
  const kpiTotal = document.getElementById('kpiTotalItems');
  const kpiTotalLabel = document.getElementById('kpiTotalItemsLabel');
  const kpiCategories = document.getElementById('kpiCategoriesCount');
  const kpiToRestock = document.getElementById('kpiToRestockItems');
  const kpiUnits = document.getElementById('kpiToRestockUnits');
  const kpiCost = document.getElementById('kpiRestockTotalCost');
  const kpiCostLabel = document.getElementById('kpiRestockCostLabel');
  const kpiCostSub = document.getElementById('kpiRestockCostSub');
  const kpiDate = document.getElementById('kpiInventoryDate');

  if (kpiTotalLabel) {
    kpiTotalLabel.textContent = activeList === 'all' 
      ? 'Totale Articoli a Catalogo' 
      : `Articoli in "${activeList}"`;
  }
  if (kpiTotal) kpiTotal.textContent = String(totalItems);
  if (kpiCategories) kpiCategories.textContent = `${categories.size} categorie in questa lista`;
  if (kpiToRestock) kpiToRestock.textContent = String(toRestockCount);
  if (kpiUnits) kpiUnits.textContent = `${toRestockUnitsCount} unità mancanti per l'obiettivo`;
  
  if (kpiCostLabel) {
    kpiCostLabel.textContent = activeList === 'all'
      ? 'Preventivo Spesa Totale'
      : `Preventivo "${activeList}"`;
  }
  if (kpiCost) {
    kpiCost.textContent = `€ ${totalRestockCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (kpiCostSub) {
    kpiCostSub.textContent = activeList === 'all'
      ? 'Spesa stimata totale di riordino'
      : `Spesa stimata per ordine ${activeList}`;
  }

  if (kpiDate) {
    kpiDate.textContent = latestDate 
      ? latestDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Filtra
  let filtered = [...listItems];

  if (this._scorteState.search) {
    const q = this._scorteState.search;
    filtered = filtered.filter(i => 
      (i.nome || '').toLowerCase().includes(q) ||
      (i.note || '').toLowerCase().includes(q) ||
      (i.categoria || '').toLowerCase().includes(q) ||
      (i.lista || '').toLowerCase().includes(q)
    );
  }

  if (this._scorteState.category) {
    filtered = filtered.filter(i => (i.categoria || 'Generale').trim() === this._scorteState.category);
  }

  if (this._scorteState.status === 'reorder') {
    filtered = filtered.filter(i => (Number(i.quantitaMinima) || 0) > (Number(i.quantita) || 0));
  } else if (this._scorteState.status === 'ok') {
    filtered = filtered.filter(i => (Number(i.quantitaMinima) || 0) <= (Number(i.quantita) || 0));
  }

  // Ordina
  const sort = this._scorteState.sort;
  filtered.sort((a, b) => {
    const nomeA = (a.nome || '').trim();
    const nomeB = (b.nome || '').trim();
    const catA = (a.categoria || 'Generale').trim();
    const catB = (b.categoria || 'Generale').trim();
    const qA = Number(a.quantita) || 0;
    const qB = Number(b.quantita) || 0;
    const diffA = Math.max(0, (Number(a.quantitaMinima) || 0) - qA);
    const diffB = Math.max(0, (Number(b.quantitaMinima) || 0) - qB);
    const costA = diffA * (Number(a.prezzoUnitario) || 0);
    const costB = diffB * (Number(b.prezzoUnitario) || 0);

    if (sort === 'categoria_nome') {
      const cmpCat = catA.localeCompare(catB, 'it');
      return cmpCat !== 0 ? cmpCat : nomeA.localeCompare(nomeB, 'it');
    }
    if (sort === 'nome_asc') return nomeA.localeCompare(nomeB, 'it');
    if (sort === 'nome_desc') return nomeB.localeCompare(nomeA, 'it');
    if (sort === 'quantita_asc') return qA - qB || nomeA.localeCompare(nomeB, 'it');
    if (sort === 'quantita_desc') return qB - qA || nomeA.localeCompare(nomeB, 'it');
    if (sort === 'da_riordinare_desc') return diffB - diffA || costB - costA;
    if (sort === 'costo_riordino_desc') return costB - costA || diffB - diffA;
    return 0;
  });

  // Aggiorna riepilogo
  const summaryEl = document.getElementById('scorteFilterSummary');
  if (summaryEl) {
    const listInfo = activeList === 'all' ? 'Tutte le liste' : `Lista: "${activeList}"`;
    summaryEl.textContent = `[${listInfo}] Visualizzati: ${filtered.length} di ${totalItems} articoli (${toRestockCount} sotto scorta)`;
  }

  // Renderizza tabella
  const tbody = document.getElementById('scorteTableBody');
  const tfoot = document.getElementById('scorteTableFoot');
  if (!tbody) return;

  if (filtered.length === 0) {
    const emptyMsg = totalItems === 0 && activeList !== 'all'
      ? `Nessun articolo presente nella lista "${activeList}". Clicca su "+ Nuovo Articolo" o "Importa Lista" per aggiungerne.`
      : 'Nessun articolo trovato con i filtri selezionati.';

    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          ${emptyMsg}
        </td>
      </tr>
    `;
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  let tableTotalDaRiordinare = 0;
  let tableTotalPreventivo = 0;

  tbody.innerHTML = filtered.map(item => {
    const q = Number(item.quantita) || 0;
    const min = Number(item.quantitaMinima) || 0;
    const price = Number(item.prezzoUnitario) || 0;
    const unita = item.unitaMisura || 'pz';
    const diff = Math.max(0, min - q);
    const costoRiordino = diff * price;
    const itemLista = (item.lista || 'Generale').trim();

    tableTotalDaRiordinare += diff;
    tableTotalPreventivo += costoRiordino;

    const isSottoScorta = diff > 0;
    const statusBadge = isSottoScorta
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
           ⚠️ +${diff} ${unita}
         </span>`
      : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
           ✓ In scorta
         </span>`;

    const rowBg = isSottoScorta ? 'bg-amber-50/30 dark:bg-amber-950/10' : '';

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${rowBg}" data-id="${item.id}">
        <!-- Nome & Note -->
        <td class="p-3">
          <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>${item.nome}</span>
          </div>
          ${item.note ? `<div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5" title="${item.note}">📝 ${item.note}</div>` : ''}
        </td>

        <!-- Lista -->
        <td class="p-3 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            📑 ${itemLista}
          </span>
        </td>

        <!-- Categoria -->
        <td class="p-3 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            🏷️ ${item.categoria || 'Generale'}
          </span>
        </td>

        <!-- Quantità Attuale con pulsanti rapidi + e - -->
        <td class="p-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
            <button type="button" class="btn-qty-minus text-gray-500 hover:text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${item.id}" title="Diminuisci scorta">-</button>
            <span class="font-bold text-sm w-8 text-center text-gray-800 dark:text-gray-200">${q}</span>
            <button type="button" class="btn-qty-plus text-gray-500 hover:text-green-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${item.id}" title="Aumenta scorta">+</button>
            <span class="text-xs text-gray-400 ml-0.5">${unita}</span>
          </div>
        </td>

        <!-- Scorta Minima -->
        <td class="p-3 text-center whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
          ${min} <span class="text-xs text-gray-400">${unita}</span>
        </td>

        <!-- Da Riordinare -->
        <td class="p-3 text-center whitespace-nowrap">
          ${statusBadge}
        </td>

        <!-- Prezzo Unitario -->
        <td class="p-3 text-right whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
          € ${price.toFixed(2)}
        </td>

        <!-- Preventivo Riordino -->
        <td class="p-3 text-right whitespace-nowrap font-mono font-bold ${isSottoScorta ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400'}">
          € ${costoRiordino.toFixed(2)}
        </td>

        <!-- Data Controllo -->
        <td class="p-3 text-center whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
          ${item.dataControllo ? new Date(item.dataControllo).toLocaleDateString('it-IT') : '-'}
        </td>

        <!-- Azioni -->
        <td class="p-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <button type="button" class="btn-edit-item p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors" data-id="${item.id}" title="Modifica articolo">
              ✏️
            </button>
            <button type="button" class="btn-delete-item p-1 text-red-600 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors" data-id="${item.id}" title="Elimina articolo">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Riga Totali Tabella
  if (tfoot) {
    const listLabel = activeList === 'all' ? 'Tutte le liste' : `Lista "${activeList}"`;
    tfoot.innerHTML = `
      <tr>
        <td colspan="5" class="p-3 text-right text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
          Totale Preventivo Riordino (${listLabel}):
        </td>
        <td class="p-3 text-center text-amber-700 dark:text-amber-300 font-extrabold">
          ${tableTotalDaRiordinare > 0 ? `+${tableTotalDaRiordinare} unità` : '0'}
        </td>
        <td></td>
        <td class="p-3 text-right font-mono font-extrabold text-green-700 dark:text-green-300 text-base">
          € ${tableTotalPreventivo.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td colspan="2"></td>
      </tr>
    `;
  }

  // Collega eventi inline (+, -, modifica, elimina)
  tbody.querySelectorAll('.btn-qty-plus').forEach(b => {
    b.addEventListener('click', () => {
      this.adjustItemQuantity(b.getAttribute('data-id'), 1);
    });
  });

  tbody.querySelectorAll('.btn-qty-minus').forEach(b => {
    b.addEventListener('click', () => {
      this.adjustItemQuantity(b.getAttribute('data-id'), -1);
    });
  });

  tbody.querySelectorAll('.btn-edit-item').forEach(b => {
    b.addEventListener('click', () => {
      this.openMaterialModal(b.getAttribute('data-id'));
    });
  });

  tbody.querySelectorAll('.btn-delete-item').forEach(b => {
    b.addEventListener('click', () => {
      this.deleteMaterial(b.getAttribute('data-id'));
    });
  });
};

UI.adjustItemQuantity = async function (id, delta) {
  const item = (this._scorteState.items || []).find(i => i.id === id);
  if (!item) return;

  const currentQ = Number(item.quantita) || 0;
  const newQ = Math.max(0, currentQ + delta);
  if (newQ === currentQ) return;

  const todayStr = new Date().toISOString().split('T')[0];

  try {
    await DATA.updateScorta(id, {
      quantita: newQ,
      dataControllo: todayStr
    }, this.currentUser);

    item.quantita = newQ;
    item.dataControllo = todayStr;

    this.renderListeTabs();
    this.renderScorte();
  } catch (err) {
    console.error('Errore aggiornamento rapido quantità:', err);
    this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
  }
};

// ==================== Modal Articolo (Aggiungi / Modifica) ====================
UI.setupMaterialModalEvents = function () {
  const modal = document.getElementById('materialModal');
  const closeBtn = document.getElementById('closeMaterialModalBtn');
  const cancelBtn = document.getElementById('cancelMaterialBtn');
  const form = document.getElementById('materialForm');

  if (closeBtn) closeBtn.onclick = () => modal?.classList.add('hidden');
  if (cancelBtn) cancelBtn.onclick = () => modal?.classList.add('hidden');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.saveMaterialForm();
    };
  }
};

UI.openMaterialModal = function (id = null) {
  const modal = document.getElementById('materialModal');
  const title = document.getElementById('materialModalTitle');
  const idInput = document.getElementById('materialId');
  const nomeInput = document.getElementById('materialNome');
  const listaInput = document.getElementById('materialLista');
  const listeDataList = document.getElementById('listeScorteDataList');
  const catInput = document.getElementById('materialCategoria');
  const unitaSelect = document.getElementById('materialUnita');
  const qInput = document.getElementById('materialQuantita');
  const qMinInput = document.getElementById('materialQuantitaMinima');
  const prezzoInput = document.getElementById('materialPrezzo');
  const dataInput = document.getElementById('materialDataControllo');
  const noteInput = document.getElementById('materialNote');

  if (!modal) return;

  const todayStr = new Date().toISOString().split('T')[0];

  // Popola datalist con tutte le liste note
  if (listeDataList) {
    const lists = this._scorteState.lists || ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
    listeDataList.innerHTML = lists.map(l => `<option value="${l}"></option>`).join('');
  }

  const defaultList = this._scorteState.activeList !== 'all'
    ? this._scorteState.activeList
    : 'Generale';

  if (id) {
    const item = (this._scorteState.items || []).find(i => i.id === id);
    if (!item) return;
    if (title) title.textContent = 'Modifica Articolo Scorte';
    if (idInput) idInput.value = item.id;
    if (nomeInput) nomeInput.value = item.nome || '';
    if (listaInput) listaInput.value = item.lista || defaultList;
    if (catInput) catInput.value = item.categoria || 'Generale';
    if (unitaSelect) unitaSelect.value = item.unitaMisura || 'pz';
    if (qInput) qInput.value = item.quantita !== undefined ? item.quantita : 0;
    if (qMinInput) qMinInput.value = item.quantitaMinima !== undefined ? item.quantitaMinima : 0;
    if (prezzoInput) prezzoInput.value = item.prezzoUnitario !== undefined ? item.prezzoUnitario : 0;
    if (dataInput) dataInput.value = item.dataControllo || todayStr;
    if (noteInput) noteInput.value = item.note || '';
  } else {
    if (title) title.textContent = 'Nuovo Articolo Scorte';
    if (idInput) idInput.value = '';
    if (nomeInput) nomeInput.value = '';
    if (listaInput) listaInput.value = defaultList;
    if (catInput) catInput.value = this._scorteState.category || 'Campeggio';
    if (unitaSelect) unitaSelect.value = 'pz';
    if (qInput) qInput.value = '0';
    if (qMinInput) qMinInput.value = '10';
    if (prezzoInput) prezzoInput.value = '0.00';
    if (dataInput) dataInput.value = todayStr;
    if (noteInput) noteInput.value = '';
  }

  modal.classList.remove('hidden');
  nomeInput?.focus();
};

UI.saveMaterialForm = async function () {
  const modal = document.getElementById('materialModal');
  const id = document.getElementById('materialId')?.value;
  const nome = document.getElementById('materialNome')?.value.trim();
  const lista = document.getElementById('materialLista')?.value.trim() || 'Generale';
  const categoria = document.getElementById('materialCategoria')?.value.trim() || 'Generale';
  const unitaMisura = document.getElementById('materialUnita')?.value || 'pz';
  const quantita = Number(document.getElementById('materialQuantita')?.value) || 0;
  const quantitaMinima = Number(document.getElementById('materialQuantitaMinima')?.value) || 0;
  const prezzoUnitario = Number(document.getElementById('materialPrezzo')?.value) || 0;
  const dataControllo = document.getElementById('materialDataControllo')?.value || new Date().toISOString().split('T')[0];
  const note = document.getElementById('materialNote')?.value.trim();

  if (!nome) {
    this.showToast('Il nome dell\'articolo è obbligatorio', { type: 'error' });
    return;
  }

  const payload = {
    nome,
    lista,
    categoria,
    unitaMisura,
    quantita,
    quantitaMinima,
    prezzoUnitario,
    dataControllo,
    note
  };

  try {
    // Se la lista è nuova, aggiungila alla lista delle liste conosciute
    if (lista && !this._scorteState.lists.includes(lista)) {
      await DATA.addListaScorta(lista, this.currentUser);
      this._scorteState.lists.push(lista);
    }

    if (id) {
      await DATA.updateScorta(id, payload, this.currentUser);
      this.showToast(`Articolo "${nome}" aggiornato con successo`);
    } else {
      await DATA.addScorta(payload, this.currentUser);
      this.showToast(`Articolo "${nome}" aggiunto alla lista "${lista}"`);
    }

    modal?.classList.add('hidden');
    this._scorteState.items = await DATA.getScorte();
    this._scorteState.lists = await DATA.getListeScorte();

    this.renderListeTabs();
    this.populateCategoryFilter();
    this.renderScorte();
  } catch (err) {
    console.error('Errore salvataggio scorta:', err);
    this.showToast('Errore durante il salvataggio', { type: 'error' });
  }
};

UI.deleteMaterial = function (id) {
  const item = (this._scorteState.items || []).find(i => i.id === id);
  if (!item) return;

  const message = `Sei sicuro di voler eliminare l'articolo "${item.nome}" (${item.categoria || 'Generale'} - Lista: ${item.lista || 'Generale'}) dall'inventario scorte?`;

  this.showConfirmModal({
    title: 'Conferma Eliminazione Articolo',
    message,
    confirmText: 'Elimina Articolo',
    cancelText: 'Annulla',
    onConfirm: async () => {
      try {
        await DATA.deleteScorta(id, this.currentUser);
        this.showToast(`Articolo "${item.nome}" eliminato`);
        this._scorteState.items = await DATA.getScorte();
        this.renderListeTabs();
        this.populateCategoryFilter();
        this.renderScorte();
      } catch (err) {
        console.error('Errore cancellazione scorta:', err);
        this.showToast('Errore durante l\'eliminazione', { type: 'error' });
      }
    }
  });
};

// ==================== Modal Importazione CSV / Testo ====================
UI.setupImportModalEvents = function () {
  const modal = document.getElementById('importModal');
  const closeBtn = document.getElementById('closeImportModalBtn');
  const cancelBtn = document.getElementById('cancelImportBtn');
  const fileInput = document.getElementById('importFileInput');
  const parseBtn = document.getElementById('parseImportBtn');
  const confirmBtn = document.getElementById('confirmImportBtn');

  if (closeBtn) closeBtn.onclick = () => modal?.classList.add('hidden');
  if (cancelBtn) cancelBtn.onclick = () => modal?.classList.add('hidden');

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        const textarea = document.getElementById('importTextarea');
        if (textarea && typeof text === 'string') {
          textarea.value = text;
          UI.processImportText(text);
        }
      };
      reader.readAsText(file);
    });
  }

  if (parseBtn) {
    parseBtn.onclick = () => {
      const textarea = document.getElementById('importTextarea');
      const text = textarea?.value || '';
      UI.processImportText(text);
    };
  }

  if (confirmBtn) {
    confirmBtn.onclick = () => {
      UI.confirmImport();
    };
  }
};

UI.openImportModal = function () {
  const modal = document.getElementById('importModal');
  const preview = document.getElementById('importPreviewContainer');
  const confirmBtn = document.getElementById('confirmImportBtn');
  const textarea = document.getElementById('importTextarea');
  const fileInput = document.getElementById('importFileInput');
  const targetListSelect = document.getElementById('importTargetList');

  if (!modal) return;

  if (textarea) textarea.value = '';
  if (fileInput) fileInput.value = '';
  if (preview) preview.classList.add('hidden');
  if (confirmBtn) confirmBtn.disabled = true;
  this._scorteState.parsedImportItems = [];

  // Popola selettore lista destinazione
  if (targetListSelect) {
    const lists = this._scorteState.lists || ['Campo Estivo', 'Uniformi', 'Distintivi', 'Generale'];
    const active = this._scorteState.activeList;
    let options = '<option value="auto">Usa colonna Lista dal file (o lista attiva)</option>';
    lists.forEach(l => {
      const sel = active === l ? 'selected' : '';
      options += `<option value="${l}" ${sel}>${l}</option>`;
    });
    targetListSelect.innerHTML = options;
  }

  modal.classList.remove('hidden');
};

UI.processImportText = function (rawText) {
  if (!rawText || !rawText.trim()) {
    this.showToast('Inserisci o seleziona dei dati da importare', { type: 'warning' });
    return;
  }

  const targetListSelect = document.getElementById('importTargetList');
  const forcedList = targetListSelect && targetListSelect.value !== 'auto' ? targetListSelect.value : null;
  const activeDefaultList = this._scorteState.activeList !== 'all' ? this._scorteState.activeList : 'Generale';

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsedItems = [];
  const todayStr = new Date().toISOString().split('T')[0];

  lines.forEach((line, idx) => {
    // Riconosce intestazioni
    const lower = line.toLowerCase();
    if (idx === 0 && (lower.includes('nome') || lower.includes('categoria') || lower.includes('quantit'))) {
      return;
    }

    let item = null;

    if (line.includes(',') || line.includes(';')) {
      // CSV standard
      const delim = line.includes(';') ? ';' : ',';
      const parts = line.split(delim).map(p => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 1 && parts[0]) {
        item = {
          nome: parts[0],
          categoria: parts[1] || 'Generale',
          quantita: Number(parts[2]) || 0,
          quantitaMinima: Number(parts[3]) || 0,
          prezzoUnitario: Number(parts[4]) || 0,
          unitaMisura: parts[5] || 'pz',
          note: parts[6] || '',
          lista: forcedList || parts[7] || activeDefaultList,
          dataControllo: todayStr
        };
      }
    } else if (line.includes('-')) {
      // Formato testuale con trattini: Nome - Categoria - Quantità
      const parts = line.split('-').map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        item = {
          nome: parts[0],
          categoria: parts[1] || 'Generale',
          quantita: Number(parts[2]) || 0,
          quantitaMinima: Number(parts[3]) || 10,
          prezzoUnitario: 0,
          unitaMisura: 'pz',
          note: '',
          lista: forcedList || activeDefaultList,
          dataControllo: todayStr
        };
      }
    } else {
      // Singolo nome
      item = {
        nome: line,
        categoria: 'Generale',
        quantita: 0,
        quantitaMinima: 10,
        prezzoUnitario: 0,
        unitaMisura: 'pz',
        note: '',
        lista: forcedList || activeDefaultList,
        dataControllo: todayStr
      };
    }

    if (item && item.nome) {
      parsedItems.push(item);
    }
  });

  this._scorteState.parsedImportItems = parsedItems;

  const previewContainer = document.getElementById('importPreviewContainer');
  const countEl = document.getElementById('importParsedCount');
  const tbody = document.getElementById('importPreviewTableBody');
  const confirmBtn = document.getElementById('confirmImportBtn');

  if (parsedItems.length === 0) {
    this.showToast('Nessun dato valido riconosciuto', { type: 'warning' });
    if (confirmBtn) confirmBtn.disabled = true;
    if (previewContainer) previewContainer.classList.add('hidden');
    return;
  }

  if (previewContainer) previewContainer.classList.remove('hidden');
  if (countEl) countEl.textContent = String(parsedItems.length);
  if (confirmBtn) confirmBtn.disabled = false;

  if (tbody) {
    tbody.innerHTML = parsedItems.slice(0, 50).map(i => `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td class="p-2 font-medium">${i.nome}</td>
        <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${i.lista}</span></td>
        <td class="p-2">${i.categoria}</td>
        <td class="p-2 text-center">${i.quantita} ${i.unitaMisura}</td>
        <td class="p-2 text-center">${i.quantitaMinima}</td>
        <td class="p-2 text-right">€ ${Number(i.prezzoUnitario).toFixed(2)}</td>
      </tr>
    `).join('');
  }

  this.showToast(`${parsedItems.length} articoli riconosciuti. Verifica e conferma l'importazione.`);
};

UI.confirmImport = async function () {
  const parsedItems = this._scorteState.parsedImportItems || [];
  if (parsedItems.length === 0) return;

  const modeRadio = document.querySelector('input[name="importMode"]:checked');
  const replaceExisting = modeRadio?.value === 'replace';

  try {
    await DATA.importScorteBatch(parsedItems, replaceExisting, this.currentUser);
    this.showToast(`Importazione completata con successo (${parsedItems.length} articoli)`, { type: 'success' });
    document.getElementById('importModal')?.classList.add('hidden');

    this._scorteState.items = await DATA.getScorte();
    this._scorteState.lists = await DATA.getListeScorte();

    this.renderListeTabs();
    this.populateCategoryFilter();
    this.renderScorte();
  } catch (err) {
    console.error('Errore importazione scorte:', err);
    this.showToast('Errore durante l\'importazione', { type: 'error' });
  }
};

// ==================== Modal Preventivo Riordino Dettagliato ====================
UI.setupPreventivoModalEvents = function () {
  const modal = document.getElementById('preventivoRiordinoModal');
  const closeBtn = document.getElementById('closePreventivoModalBtn');
  const closeFooterBtn = document.getElementById('closePreventivoModalFooterBtn');
  const exportBtn = document.getElementById('exportRiordinoCsvBtn');
  const printBtn = document.getElementById('printRiordinoBtn');

  if (closeBtn) closeBtn.onclick = () => modal?.classList.add('hidden');
  if (closeFooterBtn) closeFooterBtn.onclick = () => modal?.classList.add('hidden');

  if (exportBtn) {
    exportBtn.onclick = () => {
      UI.exportRiordinoCsv();
    };
  }

  if (printBtn) {
    printBtn.onclick = () => {
      window.print();
    };
  }
};

UI.openPreventivoRiordinoModal = function () {
  const modal = document.getElementById('preventivoRiordinoModal');
  const allItems = this._scorteState.items || [];
  const activeList = this._scorteState.activeList;

  // Filtra per lista attiva (se non "all")
  const candidateItems = activeList === 'all'
    ? allItems
    : allItems.filter(i => (i.lista || 'Generale') === activeList);

  // Filtra solo gli articoli che richiedono riordino
  const toReorder = candidateItems.filter(i => {
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    return min > q;
  });

  const titleEl = document.getElementById('modalPreventivoTitle');
  const badgeEl = document.getElementById('modalPreventivoListBadge');
  const subtitleEl = document.getElementById('modalPreventivoSubtitle');
  const totalAmountEl = document.getElementById('modalPreventivoTotalAmount');
  const statsEl = document.getElementById('modalPreventivoStats');
  const categoriesEl = document.getElementById('modalPreventivoCategories');
  const tbody = document.getElementById('modalPreventivoTableBody');

  if (titleEl) {
    titleEl.textContent = activeList === 'all'
      ? 'Preventivo e Lista di Riordino Completo'
      : `Preventivo e Riordino: ${activeList}`;
  }

  if (badgeEl) {
    if (activeList !== 'all') {
      badgeEl.textContent = `Lista: ${activeList}`;
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.textContent = 'Tutte le Liste';
      badgeEl.classList.remove('hidden');
    }
  }

  if (subtitleEl) {
    subtitleEl.textContent = activeList === 'all'
      ? 'Elenco di tutti gli articoli con scorte inferiori alla soglia minima prefissata'
      : `Elenco specifico degli articoli da ordinare per "${activeList}" (esclusi gli altri materiali)`;
  }

  let totalCost = 0;
  let totalUnits = 0;
  const categoryTotals = {};

  toReorder.forEach(i => {
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    const price = Number(i.prezzoUnitario) || 0;
    const diff = min - q;
    const cost = diff * price;

    totalCost += cost;
    totalUnits += diff;

    const cat = (i.categoria || 'Generale').trim();
    if (!categoryTotals[cat]) categoryTotals[cat] = { cost: 0, units: 0, items: 0 };
    categoryTotals[cat].cost += cost;
    categoryTotals[cat].units += diff;
    categoryTotals[cat].items += 1;
  });

  if (totalAmountEl) {
    totalAmountEl.textContent = `€ ${totalCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (statsEl) {
    const listScope = activeList === 'all' ? 'in totale' : `per ${activeList}`;
    statsEl.textContent = `${toReorder.length} articoli da riordinare (${totalUnits} unità totali) ${listScope}`;
  }

  // Ripartizione categorie
  if (categoriesEl) {
    const catList = Object.entries(categoryTotals);
    if (catList.length === 0) {
      categoriesEl.innerHTML = '<p class="text-green-700 dark:text-green-400 font-medium">Tutti gli articoli di questa lista sono in scorta sufficiente! Nessun riordino necessario.</p>';
    } else {
      categoriesEl.innerHTML = catList.map(([cat, data]) => `
        <div class="bg-white dark:bg-gray-700 p-3 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div class="font-bold text-gray-800 dark:text-gray-100 truncate">${cat}</div>
          <div class="text-amber-800 dark:text-amber-300 font-extrabold text-sm mt-0.5">€ ${data.cost.toFixed(2)}</div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400">${data.items} articoli (${data.units} unità)</div>
        </div>
      `).join('');
    }
  }

  // Tabella
  if (tbody) {
    if (toReorder.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="p-8 text-center text-green-700 dark:text-green-400 font-medium">
            🎉 Nessun articolo da riordinare per ${activeList === 'all' ? 'l\'intero inventario' : `la lista "${activeList}"`}! Le scorte sono tutte al di sopra della soglia minima.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = toReorder.map(i => {
        const q = Number(i.quantita) || 0;
        const min = Number(i.quantitaMinima) || 0;
        const price = Number(i.prezzoUnitario) || 0;
        const diff = min - q;
        const cost = diff * price;
        const unita = i.unitaMisura || 'pz';
        const itemLista = (i.lista || 'Generale').trim();

        return `
          <tr class="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
            <td class="p-2.5 font-bold text-gray-800 dark:text-gray-100">${i.nome}</td>
            <td class="p-2.5 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${itemLista}</span></td>
            <td class="p-2.5">${i.categoria || 'Generale'}</td>
            <td class="p-2.5 text-center">${q} ${unita}</td>
            <td class="p-2.5 text-center">${min} ${unita}</td>
            <td class="p-2.5 text-center font-bold text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 rounded">
              +${diff} ${unita}
            </td>
            <td class="p-2.5 text-right font-mono">€ ${price.toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-bold text-amber-900 dark:text-amber-200">€ ${cost.toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }
  }

  modal?.classList.remove('hidden');
};

// ==================== Esportazione CSV ====================
UI.exportScorteCsv = function () {
  const activeList = this._scorteState.activeList;
  let items = this._scorteState.items || [];
  if (activeList !== 'all') {
    items = items.filter(i => (i.lista || 'Generale') === activeList);
  }

  if (items.length === 0) {
    this.showToast('Nessun articolo da esportare', { type: 'warning' });
    return;
  }

  const header = ['Nome', 'Lista', 'Categoria', 'Quantita', 'ScortaMinima', 'Unita', 'PrezzoUnitario', 'DaRiordinare', 'PreventivoRiordino', 'DataControllo', 'Note'];
  const rows = [header.join(',')];

  items.forEach(i => {
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    const price = Number(i.prezzoUnitario) || 0;
    const diff = Math.max(0, min - q);
    const cost = diff * price;

    const row = [
      `"${(i.nome || '').replace(/"/g, '""')}"`,
      `"${(i.lista || 'Generale').replace(/"/g, '""')}"`,
      `"${(i.categoria || 'Generale').replace(/"/g, '""')}"`,
      q,
      min,
      `"${i.unitaMisura || 'pz'}"`,
      price.toFixed(2),
      diff,
      cost.toFixed(2),
      `"${i.dataControllo || ''}"`,
      `"${(i.note || '').replace(/"/g, '""')}"`
    ];
    rows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileSuffix = activeList !== 'all' ? activeList.replace(/\s+/g, '_') : 'Tutte';
  link.setAttribute('download', `Inventario_${fileSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.showToast(`Inventario (${fileSuffix}) esportato in formato CSV`);
};

UI.exportRiordinoCsv = function () {
  const activeList = this._scorteState.activeList;
  let items = this._scorteState.items || [];
  if (activeList !== 'all') {
    items = items.filter(i => (i.lista || 'Generale') === activeList);
  }

  const toReorder = items.filter(i => (Number(i.quantitaMinima) || 0) > (Number(i.quantita) || 0));

  if (toReorder.length === 0) {
    this.showToast('Nessun articolo da riordinare in questa lista', { type: 'info' });
    return;
  }

  const header = ['Articolo', 'Lista', 'Categoria', 'QuantitaAttuale', 'ScortaObiettivo', 'QuantitaDaOrdinare', 'Unita', 'PrezzoUnitario', 'CostoTotale', 'Note'];
  const rows = [header.join(',')];

  let totalCost = 0;
  toReorder.forEach(i => {
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    const price = Number(i.prezzoUnitario) || 0;
    const diff = min - q;
    const cost = diff * price;
    totalCost += cost;

    const row = [
      `"${(i.nome || '').replace(/"/g, '""')}"`,
      `"${(i.lista || 'Generale').replace(/"/g, '""')}"`,
      `"${(i.categoria || 'Generale').replace(/"/g, '""')}"`,
      q,
      min,
      diff,
      `"${i.unitaMisura || 'pz'}"`,
      price.toFixed(2),
      cost.toFixed(2),
      `"${(i.note || '').replace(/"/g, '""')}"`
    ];
    rows.push(row.join(','));
  });

  const listScope = activeList !== 'all' ? `TOTALE PREVENTIVO (${activeList})` : 'TOTALE PREVENTIVO';
  rows.push([`"${listScope}"`, '""', '""', '""', '""', '""', '""', '""', totalCost.toFixed(2), '""'].join(','));

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileSuffix = activeList !== 'all' ? activeList.replace(/\s+/g, '_') : 'Tutte';
  link.setAttribute('download', `Ordine_Riordino_${fileSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.showToast(`Lista riordino (${fileSuffix}) esportata in formato CSV`);
};
