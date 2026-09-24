// scorte.js - Logica per la gestione scorte, inventario e preventivo di riordino
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
  search: '',
  category: '',
  status: 'all', // 'all', 'reorder', 'ok'
  sort: 'categoria_nome',
  parsedImportItems: [],
  bound: false
};

UI.initScorte = async function () {
  try {
    this.showLoadingOverlay ? this.showLoadingOverlay('Caricamento scorte...') : null;
    this._scorteState.items = await DATA.getScorte();
  } catch (err) {
    console.error('Errore caricamento scorte:', err);
    this._scorteState.items = [];
  } finally {
    this.hideLoadingOverlay ? this.hideLoadingOverlay() : null;
  }

  this.setupScorteControls();
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

  this.setupMaterialModalEvents();
  this.setupImportModalEvents();
  this.setupPreventivoModalEvents();
};

UI.populateCategoryFilter = function () {
  const catFilter = document.getElementById('scorteCategoryFilter');
  if (!catFilter) return;

  const currentVal = this._scorteState.category;
  const categories = Array.from(new Set(
    (this._scorteState.items || [])
      .map(i => (i.categoria || 'Generale').trim())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  catFilter.innerHTML = '<option value="">Tutte le categorie</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
  catFilter.value = currentVal;
};

UI.renderScorte = function () {
  const items = this._scorteState.items || [];

  // Calcola metriche generali per le KPI cards
  const totalItems = items.length;
  const categories = new Set(items.map(i => (i.categoria || 'Generale').trim()));
  
  let toRestockCount = 0;
  let toRestockUnitsCount = 0;
  let totalRestockCost = 0;
  let latestDate = null;

  items.forEach(item => {
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
  const kpiCategories = document.getElementById('kpiCategoriesCount');
  const kpiToRestock = document.getElementById('kpiToRestockItems');
  const kpiUnits = document.getElementById('kpiToRestockUnits');
  const kpiCost = document.getElementById('kpiRestockTotalCost');
  const kpiDate = document.getElementById('kpiInventoryDate');

  if (kpiTotal) kpiTotal.textContent = String(totalItems);
  if (kpiCategories) kpiCategories.textContent = `${categories.size} categorie gestite`;
  if (kpiToRestock) kpiToRestock.textContent = String(toRestockCount);
  if (kpiUnits) kpiUnits.textContent = `${toRestockUnitsCount} unità totali mancanti`;
  if (kpiCost) kpiCost.textContent = `€ ${totalRestockCost.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (kpiDate) {
    kpiDate.textContent = latestDate 
      ? latestDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Filtra
  let filtered = [...items];

  if (this._scorteState.search) {
    const q = this._scorteState.search;
    filtered = filtered.filter(i => 
      (i.nome || '').toLowerCase().includes(q) ||
      (i.note || '').toLowerCase().includes(q) ||
      (i.categoria || '').toLowerCase().includes(q)
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
    summaryEl.textContent = `Visualizzati: ${filtered.length} di ${totalItems} articoli (${toRestockCount} da riordinare)`;
  }

  // Renderizza tabella
  const tbody = document.getElementById('scorteTableBody');
  const tfoot = document.getElementById('scorteTableFoot');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          Nessun articolo trovato con i filtri selezionati.
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

    tableTotalDaRiordinare += diff;
    tableTotalPreventivo += costoRiordino;

    const isDepleted = diff > 0;
    const rowClass = isDepleted ? 'bg-amber-50/60 dark:bg-amber-950/20' : '';

    // Badge da riordinare
    let diffBadge = '';
    if (isDepleted) {
      diffBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
        ⚠️ +${diff} ${unita}
      </span>`;
    } else {
      diffBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
        ✓ In scorta
      </span>`;
    }

    // Data Formattata
    let dataStr = '-';
    if (item.dataControllo) {
      const d = new Date(item.dataControllo);
      if (!isNaN(d)) dataStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    const noteHtml = item.note ? `<div class="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-xs mt-0.5" title="${item.note}">📌 ${item.note}</div>` : '';

    return `
      <tr class="${rowClass} hover:bg-gray-100/60 dark:hover:bg-gray-700/30 transition-colors">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">
          <div class="font-medium text-gray-900 dark:text-gray-100">${item.nome}</div>
          ${noteHtml}
        </td>
        <td class="p-3">
          <span class="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
            ${item.categoria || 'Generale'}
          </span>
        </td>
        <td class="p-3 text-center">
          <div class="inline-flex items-center gap-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 shadow-sm">
            <button type="button" class="btn-adjust-qty text-gray-500 hover:text-red-600 font-bold px-1.5 cursor-pointer" data-id="${item.id}" data-delta="-1" title="Diminuisci scorta">-</button>
            <span class="font-bold text-sm min-w-[28px] text-center ${isDepleted ? 'text-amber-700 dark:text-amber-400' : 'text-gray-800 dark:text-gray-100'}">${q}</span>
            <span class="text-[11px] text-gray-400">${unita}</span>
            <button type="button" class="btn-adjust-qty text-gray-500 hover:text-green-600 font-bold px-1.5 cursor-pointer" data-id="${item.id}" data-delta="1" title="Aumenta scorta">+</button>
          </div>
        </td>
        <td class="p-3 text-center font-medium text-gray-600 dark:text-gray-300">
          ${min} <span class="text-xs text-gray-400">${unita}</span>
        </td>
        <td class="p-3 text-center">
          ${diffBadge}
        </td>
        <td class="p-3 text-right text-gray-600 dark:text-gray-300 font-mono">
          € ${price.toFixed(2)}
        </td>
        <td class="p-3 text-right font-mono font-bold ${costoRiordino > 0 ? 'text-amber-800 dark:text-amber-300' : 'text-gray-400'}">
          € ${costoRiordino.toFixed(2)}
        </td>
        <td class="p-3 text-center text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          ${dataStr}
        </td>
        <td class="p-3 text-center whitespace-nowrap">
          <button type="button" class="btn-edit-material p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors cursor-pointer" data-id="${item.id}" title="Modifica articolo">
            ✏️
          </button>
          <button type="button" class="btn-delete-material p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer ml-1" data-id="${item.id}" title="Elimina articolo">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr>
        <td colspan="4" class="p-3 text-right uppercase tracking-wider text-xs text-gray-500 dark:text-gray-400">Totale Riordino Articoli Mostrati:</td>
        <td class="p-3 text-center font-extrabold text-amber-700 dark:text-amber-400">${tableTotalDaRiordinare} unità</td>
        <td></td>
        <td class="p-3 text-right font-mono text-base font-extrabold text-green-700 dark:text-green-400">€ ${tableTotalPreventivo.toFixed(2)}</td>
        <td colspan="2"></td>
      </tr>
    `;
  }

  // Event listeners pulsanti riga
  tbody.querySelectorAll('.btn-adjust-qty').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      await UI.adjustMaterialQuantity(id, delta);
    };
  });

  tbody.querySelectorAll('.btn-edit-material').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      UI.openMaterialModal(id);
    };
  });

  tbody.querySelectorAll('.btn-delete-material').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      UI.deleteMaterial(id);
    };
  });
};

UI.adjustMaterialQuantity = async function (id, delta) {
  const item = (this._scorteState.items || []).find(i => i.id === id);
  if (!item) return;

  const currentQ = Number(item.quantita) || 0;
  const newQ = Math.max(0, currentQ + delta);
  if (newQ === currentQ) return;

  item.quantita = newQ;
  item.dataControllo = new Date().toISOString().split('T')[0];

  try {
    await DATA.updateScorta(id, { quantita: newQ, dataControllo: item.dataControllo }, this.currentUser);
    this.renderScorte();
  } catch (err) {
    console.error('Errore aggiornamento quantità:', err);
    this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
  }
};

// ==================== Modal Aggiungi / Modifica ====================
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
      await UI.saveMaterialForm();
    };
  }
};

UI.openMaterialModal = function (id = null) {
  const modal = document.getElementById('materialModal');
  const title = document.getElementById('materialModalTitle');
  const idInput = document.getElementById('materialId');
  const nomeInput = document.getElementById('materialNome');
  const catInput = document.getElementById('materialCategoria');
  const unitaSelect = document.getElementById('materialUnita');
  const qInput = document.getElementById('materialQuantita');
  const qMinInput = document.getElementById('materialQuantitaMinima');
  const prezzoInput = document.getElementById('materialPrezzo');
  const dataInput = document.getElementById('materialDataControllo');
  const noteInput = document.getElementById('materialNote');

  if (!modal) return;

  const todayStr = new Date().toISOString().split('T')[0];

  if (id) {
    const item = (this._scorteState.items || []).find(i => i.id === id);
    if (!item) return;
    if (title) title.textContent = 'Modifica Articolo Scorte';
    if (idInput) idInput.value = item.id;
    if (nomeInput) nomeInput.value = item.nome || '';
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
    categoria,
    unitaMisura,
    quantita,
    quantitaMinima,
    prezzoUnitario,
    dataControllo,
    note
  };

  try {
    if (id) {
      await DATA.updateScorta(id, payload, this.currentUser);
      this.showToast(`Articolo "${nome}" aggiornato con successo`);
    } else {
      await DATA.addScorta(payload, this.currentUser);
      this.showToast(`Articolo "${nome}" aggiunto alle scorte`);
    }

    modal?.classList.add('hidden');
    this._scorteState.items = await DATA.getScorte();
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

  const message = `Sei sicuro di voler eliminare l'articolo "${item.nome}" (${item.categoria || 'Generale'}) dall'inventario scorte?`;

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
    confirmBtn.onclick = async () => {
      await UI.confirmImport();
    };
  }
};

UI.openImportModal = function () {
  const modal = document.getElementById('importModal');
  const fileInput = document.getElementById('importFileInput');
  const textarea = document.getElementById('importTextarea');
  const preview = document.getElementById('importPreviewContainer');
  const confirmBtn = document.getElementById('confirmImportBtn');

  if (fileInput) fileInput.value = '';
  if (textarea) textarea.value = '';
  if (preview) preview.classList.add('hidden');
  if (confirmBtn) confirmBtn.disabled = true;

  this._scorteState.parsedImportItems = [];
  modal?.classList.remove('hidden');
};

UI.processImportText = function (rawText) {
  if (!rawText || !rawText.trim()) {
    this.showToast('Nessun testo o file inserito per l\'importazione', { type: 'warning' });
    return;
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const parsedItems = [];

  lines.forEach((line, index) => {
    // Salta intestazioni se presenti
    if (index === 0 && (line.toLowerCase().startsWith('nome') || line.toLowerCase().startsWith('"nome'))) {
      return;
    }

    // Identifica separatore principale: virgola, punto e virgola, tab, pipe o trattino
    let sep = ',';
    if (line.includes(';')) sep = ';';
    else if (line.includes('\t')) sep = '\t';
    else if (line.includes('|')) sep = '|';
    else if (line.includes(' - ')) sep = ' - ';

    const parts = line.split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length === 0 || !parts[0]) return;

    const nome = parts[0];
    const categoria = parts[1] || 'Generale';
    const quantita = Number(parts[2]) >= 0 ? Number(parts[2]) : 0;
    const quantitaMinima = Number(parts[3]) >= 0 ? Number(parts[3]) : 10;
    const prezzoUnitario = Number(parts[4]) >= 0 ? Number(parts[4]) : 0;
    const unitaMisura = parts[5] || 'pz';
    const note = parts[6] || '';

    parsedItems.push({
      nome,
      categoria,
      quantita,
      quantitaMinima,
      prezzoUnitario,
      unitaMisura,
      note,
      dataControllo: new Date().toISOString().split('T')[0]
    });
  });

  this._scorteState.parsedImportItems = parsedItems;

  const previewContainer = document.getElementById('importPreviewContainer');
  const countEl = document.getElementById('importParsedCount');
  const tbody = document.getElementById('importPreviewTableBody');
  const confirmBtn = document.getElementById('confirmImportBtn');

  if (parsedItems.length === 0) {
    this.showToast('Nessun articolo valido riconosciuto dal testo inserito', { type: 'error' });
    if (previewContainer) previewContainer.classList.add('hidden');
    if (confirmBtn) confirmBtn.disabled = true;
    return;
  }

  if (countEl) countEl.textContent = String(parsedItems.length);
  if (confirmBtn) confirmBtn.disabled = false;
  if (previewContainer) previewContainer.classList.remove('hidden');

  if (tbody) {
    tbody.innerHTML = parsedItems.map(p => `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
        <td class="p-2 font-medium">${p.nome}</td>
        <td class="p-2">${p.categoria}</td>
        <td class="p-2 text-center">${p.quantita} ${p.unitaMisura}</td>
        <td class="p-2 text-center">${p.quantitaMinima} ${p.unitaMisura}</td>
        <td class="p-2 text-right">€ ${p.prezzoUnitario.toFixed(2)}</td>
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
  const items = this._scorteState.items || [];

  // Filtra solo gli articoli che richiedono riordino
  const toReorder = items.filter(i => {
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    return min > q;
  });

  const totalAmountEl = document.getElementById('modalPreventivoTotalAmount');
  const statsEl = document.getElementById('modalPreventivoStats');
  const categoriesEl = document.getElementById('modalPreventivoCategories');
  const tbody = document.getElementById('modalPreventivoTableBody');

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
    statsEl.textContent = `${toReorder.length} articoli da riordinare (${totalUnits} unità totali)`;
  }

  // Ripartizione categorie
  if (categoriesEl) {
    const catList = Object.entries(categoryTotals);
    if (catList.length === 0) {
      categoriesEl.innerHTML = '<p class="text-green-700 dark:text-green-400 font-medium">Tutti gli articoli sono in scorta sufficiente! Nessun riordino necessario.</p>';
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
          <td colspan="7" class="p-8 text-center text-green-700 dark:text-green-400 font-medium">
            🎉 Nessun articolo da riordinare! L'inventario è al completo secondo le scorte minime impostate.
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

        return `
          <tr class="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
            <td class="p-2.5 font-bold text-gray-800 dark:text-gray-100">${i.nome}</td>
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
  const items = this._scorteState.items || [];
  if (items.length === 0) {
    this.showToast('Nessun articolo da esportare', { type: 'warning' });
    return;
  }

  const header = ['Nome', 'Categoria', 'Quantita', 'ScortaMinima', 'Unita', 'PrezzoUnitario', 'DaRiordinare', 'PreventivoRiordino', 'DataControllo', 'Note'];
  const rows = [header.join(',')];

  items.forEach(i => {
    const q = Number(i.quantita) || 0;
    const min = Number(i.quantitaMinima) || 0;
    const price = Number(i.prezzoUnitario) || 0;
    const diff = Math.max(0, min - q);
    const cost = diff * price;

    const row = [
      `"${(i.nome || '').replace(/"/g, '""')}"`,
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
  link.setAttribute('download', `Inventario_Scorte_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.showToast('Inventario scorte esportato in formato CSV');
};

UI.exportRiordinoCsv = function () {
  const items = this._scorteState.items || [];
  const toReorder = items.filter(i => (Number(i.quantitaMinima) || 0) > (Number(i.quantita) || 0));

  if (toReorder.length === 0) {
    this.showToast('Nessun articolo da riordinare', { type: 'info' });
    return;
  }

  const header = ['Articolo', 'Categoria', 'QuantitaAttuale', 'ScortaObiettivo', 'QuantitaDaOrdinare', 'Unita', 'PrezzoUnitario', 'CostoTotale', 'Note'];
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

  rows.push(['"TOTALE PREVENTIVO"', '""', '""', '""', '""', '""', '""', totalCost.toFixed(2), '""'].join(','));

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Ordine_Riordino_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.showToast('Lista riordino esportata in formato CSV');
};
