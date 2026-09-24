// storico-presenze.js - Logica per l'archivio storico e statistiche presenze degli anni precedenti
import { DATA } from './js/data/data-facade.js';
import { UI } from './js/ui/ui.js';

if (typeof window !== 'undefined') {
  window.DATA = DATA;
  window.UI = UI;
}

UI.renderCurrentPage = function () {
  this.initStoricoPresenze();
};

UI._storicoState = {
  selectedYear: '',
  search: '',
  patrol: '',
  attendanceLevel: 'all',
  sort: 'perc_desc',
  isGridVisible: false,
  bound: false
};

UI.initStoricoPresenze = function () {
  const currentScoutYear = this.getCurrentScoutYear ? this.getCurrentScoutYear() : '2025/2026';
  const allYears = this.getAllScoutYears ? this.getAllScoutYears(this.state.activities) : [currentScoutYear];

  // Identifica gli anni precedenti (archiviati)
  const previousYears = allYears.filter(y => y !== currentScoutYear);

  // Seleziona di default il più recente anno precedente, o l'anno in corso se unico
  if (!this._storicoState.selectedYear) {
    this._storicoState.selectedYear = previousYears.length > 0 ? previousYears[0] : currentScoutYear;
  }

  this.setupStoricoControls(allYears, currentScoutYear);
  this.renderStoricoPresenze();
};

UI.setupStoricoControls = function (allYears, currentScoutYear) {
  const yearSelect = document.getElementById('storicoScoutYearSelect');
  const searchInput = document.getElementById('storicoSearchInput');
  const patrolFilter = document.getElementById('storicoPatrolFilter');
  const attendanceFilter = document.getElementById('storicoAttendanceFilter');
  const sortSelect = document.getElementById('storicoSortSelect');
  const resetBtn = document.getElementById('resetStoricoFiltersBtn');
  const printBtn = document.getElementById('printStoricoBtn');
  const exportCsvBtn = document.getElementById('exportStoricoCsvBtn');
  const gridToggleBtn = document.getElementById('toggleHistoricalGridBtn');
  const modalCloseBtn = document.getElementById('closeScoutDetailModalBtn');

  // Popola selettore anni scout
  if (yearSelect) {
    yearSelect.innerHTML = '';
    allYears.forEach(year => {
      const isCurrent = year === currentScoutYear;
      const label = isCurrent ? `${year} (In corso)` : `${year} (Archivio)`;
      const opt = document.createElement('option');
      opt.value = year;
      opt.textContent = label;
      if (year === this._storicoState.selectedYear) opt.selected = true;
      yearSelect.appendChild(opt);
    });

    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = '📊 Tutti gli Anni (Confronto Storico)';
    if (this._storicoState.selectedYear === 'all') allOpt.selected = true;
    yearSelect.appendChild(allOpt);

    yearSelect.value = this._storicoState.selectedYear;
  }

  // Popola pattuglie
  if (patrolFilter) {
    const scouts = this.state.scouts || [];
    const patrols = Array.from(new Set(
      scouts.map(s => (s.pv_pattuglia || '').trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    const cur = this._storicoState.patrol;
    patrolFilter.innerHTML = '<option value="">Tutte le pattuglie</option>' +
      patrols.map(p => `<option value="${p}">${p}</option>`).join('');
    patrolFilter.value = cur;
  }

  if (this._storicoState.bound) return;
  this._storicoState.bound = true;

  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      this._storicoState.selectedYear = e.target.value;
      this.renderStoricoPresenze();
    });
  }

  if (searchInput) {
    let t;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        this._storicoState.search = e.target.value.trim().toLowerCase();
        this.renderStoricoPresenze();
      }, 150);
    });
  }

  if (patrolFilter) {
    patrolFilter.addEventListener('change', (e) => {
      this._storicoState.patrol = e.target.value;
      this.renderStoricoPresenze();
    });
  }

  if (attendanceFilter) {
    attendanceFilter.addEventListener('change', (e) => {
      this._storicoState.attendanceLevel = e.target.value;
      this.renderStoricoPresenze();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      this._storicoState.sort = e.target.value;
      this.renderStoricoPresenze();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const previousYears = allYears.filter(y => y !== currentScoutYear);
      this._storicoState.selectedYear = previousYears.length > 0 ? previousYears[0] : currentScoutYear;
      this._storicoState.search = '';
      this._storicoState.patrol = '';
      this._storicoState.attendanceLevel = 'all';
      this._storicoState.sort = 'perc_desc';

      if (yearSelect) yearSelect.value = this._storicoState.selectedYear;
      if (searchInput) searchInput.value = '';
      if (patrolFilter) patrolFilter.value = '';
      if (attendanceFilter) attendanceFilter.value = 'all';
      if (sortSelect) sortSelect.value = 'perc_desc';

      this.renderStoricoPresenze();
      this.showToast('Filtri ripristinati', { type: 'info' });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      this.printStoricoReport();
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      this.exportStoricoCsv();
    });
  }

  if (gridToggleBtn) {
    gridToggleBtn.addEventListener('click', () => {
      this._storicoState.isGridVisible = !this._storicoState.isGridVisible;
      const grid = document.getElementById('historicalGridContainer');
      const icon = document.getElementById('gridToggleIcon');
      const text = document.getElementById('gridToggleText');
      if (grid) grid.classList.toggle('hidden', !this._storicoState.isGridVisible);
      if (icon) icon.textContent = this._storicoState.isGridVisible ? '🙈' : '👁️';
      if (text) text.textContent = this._storicoState.isGridVisible ? 'Nascondi Registro Tabellare' : 'Mostra Registro Tabellare';
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      const modal = document.getElementById('scoutDetailModal');
      if (modal) modal.classList.add('hidden');
    });
  }
};

UI.renderStoricoPresenze = function () {
  const selectedYear = this._storicoState.selectedYear;
  const isMultiYear = selectedYear === 'all';

  const multiYearSec = document.getElementById('multiYearComparisonSection');
  const singleYearSec = document.getElementById('singleYearStatsSection');
  const patrolSec = document.getElementById('patrolStatsSection');
  const gridSec = document.getElementById('historicalGridSection');
  const kpiSec = document.getElementById('storicoKpisSection');

  if (isMultiYear) {
    if (multiYearSec) multiYearSec.classList.remove('hidden');
    if (singleYearSec) singleYearSec.classList.add('hidden');
    if (patrolSec) patrolSec.classList.add('hidden');
    if (gridSec) gridSec.classList.add('hidden');
    this.renderMultiYearComparison();
    return;
  }

  if (multiYearSec) multiYearSec.classList.add('hidden');
  if (singleYearSec) singleYearSec.classList.remove('hidden');
  if (patrolSec) patrolSec.classList.remove('hidden');
  if (gridSec) gridSec.classList.remove('hidden');

  // Titoli
  const singleYearTableTitle = document.getElementById('singleYearTableTitle');
  const singleYearTableSubtitle = document.getElementById('singleYearTableSubtitle');
  if (singleYearTableTitle) {
    singleYearTableTitle.textContent = `Statistiche Presenze Esploratori · Anno Scout ${selectedYear}`;
  }
  if (singleYearTableSubtitle) {
    singleYearTableSubtitle.textContent = `Dati ufficiali storici delle presenze relative all'anno scout ${selectedYear}`;
  }

  // Calcola dati dell'anno selezionato
  const activities = (this.state.activities || []).filter(a => {
    return this.isActivityInScoutYear ? this.isActivityInScoutYear(a, selectedYear) : true;
  }).sort((a, b) => this.toJsDate(a.data) - this.toJsDate(b.data));

  const allPresences = this.getDedupedPresences ? this.getDedupedPresences() : (this.state.presences || []);
  const allScouts = this.state.scouts || [];

  // Calcola statistiche per ciascun esploratore
  const scoutStats = allScouts.map(scout => {
    let presenti = 0;
    let assenti = 0;
    let nr = 0;
    let totalPaid = 0;
    let totalToPay = 0;

    const scoutPresences = [];

    activities.forEach(act => {
      const p = allPresences.find(x => x.esploratoreId === scout.id && x.attivitaId === act.id);
      const stato = p ? p.stato : 'NR';
      const cost = parseFloat(act.costo || '0');
      const isPaid = p ? p.pagato : false;

      if (stato === 'Presente') {
        presenti++;
        if (cost > 0) {
          if (isPaid) totalPaid += cost;
          else totalToPay += cost;
        }
      } else if (stato === 'Assente') {
        assenti++;
      } else {
        nr++;
      }

      scoutPresences.push({
        activity: act,
        presence: p || { stato: 'NR', pagato: false },
        stato
      });
    });

    const totalValid = presenti + assenti;
    const perc = totalValid > 0 ? Math.round((presenti / totalValid) * 100) : 0;
    const nomeCompleto = (scout.nome ? `${scout.nome} ${scout.cognome || ''}` : (scout.anag_nome ? `${scout.anag_nome} ${scout.anag_cognome || ''}` : scout.id)).trim();

    return {
      scout,
      nomeCompleto,
      patrol: (scout.pv_pattuglia || '').trim(),
      totalActivities: activities.length,
      presenti,
      assenti,
      nr,
      totalValid,
      perc,
      totalPaid,
      totalToPay,
      scoutPresences
    };
  });

  // Filtra
  let filtered = scoutStats;

  if (this._storicoState.search) {
    const q = this._storicoState.search;
    filtered = filtered.filter(s => s.nomeCompleto.toLowerCase().includes(q));
  }

  if (this._storicoState.patrol) {
    filtered = filtered.filter(s => s.patrol === this._storicoState.patrol);
  }

  if (this._storicoState.attendanceLevel !== 'all') {
    if (this._storicoState.attendanceLevel === 'high') {
      filtered = filtered.filter(s => s.perc >= 75);
    } else if (this._storicoState.attendanceLevel === 'medium') {
      filtered = filtered.filter(s => s.perc >= 50 && s.perc < 75);
    } else if (this._storicoState.attendanceLevel === 'low') {
      filtered = filtered.filter(s => s.perc < 50);
    }
  }

  // Ordina
  const sort = this._storicoState.sort || 'perc_desc';
  filtered.sort((a, b) => {
    if (sort === 'perc_desc') return b.perc - a.perc || b.presenti - a.presenti;
    if (sort === 'perc_asc') return a.perc - b.perc || a.presenti - b.presenti;
    if (sort === 'presenti_desc') return b.presenti - a.presenti || b.perc - a.perc;
    if (sort === 'cognome_asc') {
      const cA = (a.scout.cognome || '').trim().localeCompare((b.scout.cognome || '').trim(), 'it');
      return cA !== 0 ? cA : a.nomeCompleto.localeCompare(b.nomeCompleto, 'it');
    }
    if (sort === 'cognome_desc') {
      const cA = (b.scout.cognome || '').trim().localeCompare((a.scout.cognome || '').trim(), 'it');
      return cA !== 0 ? cA : b.nomeCompleto.localeCompare(a.nomeCompleto, 'it');
    }
    if (sort === 'nome_asc') return a.nomeCompleto.localeCompare(b.nomeCompleto, 'it');
    if (sort === 'pattuglia_asc') {
      if (!a.patrol && b.patrol) return 1;
      if (a.patrol && !b.patrol) return -1;
      const cmp = a.patrol.localeCompare(b.patrol, 'it');
      return cmp !== 0 ? cmp : a.nomeCompleto.localeCompare(b.nomeCompleto, 'it');
    }
    return 0;
  });

  // Aggiorna riepilogo
  const summaryEl = document.getElementById('storicoFilterSummary');
  if (summaryEl) {
    summaryEl.textContent = `Visualizzati: ${filtered.length} di ${allScouts.length} esploratori, ${activities.length} attività (Anno Scout ${selectedYear})`;
  }

  // Renderizza KPI Cards
  this.renderStoricoKPICards(scoutStats, activities, selectedYear);

  // Renderizza Tabella Esploratori
  this.renderStoricoTable(filtered, activities);

  // Renderizza Statistiche Pattuglie
  this.renderStoricoPatrolStats(scoutStats, activities);

  // Renderizza Griglia Storica Completa
  this.renderHistoricalGrid(activities, allScouts, allPresences);
};

UI.renderStoricoKPICards = function (scoutStats, activities, selectedYear) {
  const container = document.getElementById('storicoKpiCards');
  if (!container) return;

  const totalActs = activities.length;
  const totalScouts = scoutStats.length;

  // Calcola % presenza globale
  let totalPresenti = 0;
  let totalPossibili = 0;
  scoutStats.forEach(s => {
    totalPresenti += s.presenti;
    totalPossibili += s.totalValid;
  });
  const avgPerc = totalPossibili > 0 ? Math.round((totalPresenti / totalPossibili) * 100) : 0;

  // Pattuglia più costante
  const patrolGroups = {};
  scoutStats.forEach(s => {
    if (!s.patrol) return;
    if (!patrolGroups[s.patrol]) patrolGroups[s.patrol] = { presenti: 0, valid: 0, scouts: 0 };
    patrolGroups[s.patrol].presenti += s.presenti;
    patrolGroups[s.patrol].valid += s.totalValid;
    patrolGroups[s.patrol].scouts++;
  });

  let bestPatrol = 'Nessuna';
  let bestPatrolPerc = -1;
  Object.entries(patrolGroups).forEach(([patrol, data]) => {
    const p = data.valid > 0 ? Math.round((data.presenti / data.valid) * 100) : 0;
    if (p > bestPatrolPerc) {
      bestPatrolPerc = p;
      bestPatrol = patrol;
    }
  });

  // Esploratori con presenza >= 75%
  const highAttendanceCount = scoutStats.filter(s => s.perc >= 75).length;

  container.innerHTML = `
    <div class="bg-gradient-to-br from-green-600 to-green-700 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-xs font-semibold uppercase tracking-wider mb-1">Presenza Media Reparto</p>
          <p class="text-3xl font-extrabold">${avgPerc}%</p>
          <p class="text-green-100 text-xs mt-1">${totalPresenti} presenze su ${totalPossibili} totali</p>
        </div>
        <div class="text-3xl opacity-80">📊</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Attività Svolte</p>
          <p class="text-3xl font-extrabold">${totalActs}</p>
          <p class="text-blue-100 text-xs mt-1">Anno Scout ${selectedYear}</p>
        </div>
        <div class="text-3xl opacity-80">📅</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-xs font-semibold uppercase tracking-wider mb-1">Esploratori Partecipanti</p>
          <p class="text-3xl font-extrabold">${totalScouts}</p>
          <p class="text-purple-100 text-xs mt-1">${highAttendanceCount} con presenza ≥ 75%</p>
        </div>
        <div class="text-3xl opacity-80">👥</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-amber-100 text-xs font-semibold uppercase tracking-wider mb-1">Miglior Pattuglia</p>
          <p class="text-2xl font-extrabold truncate max-w-[170px]" title="${bestPatrol}">${bestPatrol}</p>
          <p class="text-amber-100 text-xs mt-1">${bestPatrolPerc >= 0 ? `${bestPatrolPerc}% presenze medie` : 'Dati non disponibili'}</p>
        </div>
        <div class="text-3xl opacity-80">🏆</div>
      </div>
    </div>
  `;
};

UI.renderStoricoTable = function (scoutStatsList, activities) {
  const body = document.getElementById('storicoTableBody');
  if (!body) return;

  if (scoutStatsList.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="10" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          Nessun esploratore trovato con i filtri selezionati per quest'anno scout.
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = scoutStatsList.map(item => {
    const s = item.scout;
    const patrolBadge = item.patrol
      ? `<span class="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">${item.patrol}</span>`
      : '<span class="text-gray-400 text-xs italic">-</span>';

    // Badge fascia
    let levelBadge = '';
    let barColor = 'bg-green-600';
    if (item.perc >= 75) {
      levelBadge = '<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Ottima</span>';
      barColor = 'bg-green-600';
    } else if (item.perc >= 50) {
      levelBadge = '<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Media</span>';
      barColor = 'bg-yellow-500';
    } else {
      levelBadge = '<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">Bassa</span>';
      barColor = 'bg-red-500';
    }

    // Quote
    const quoteHtml = item.totalToPay > 0
      ? `<span class="text-xs font-semibold text-red-600 dark:text-red-400" title="Quote da saldare">€${item.totalToPay} sospesi</span>`
      : `<span class="text-xs text-green-600 dark:text-green-400 font-medium" title="Tutte le quote saldate">In regola</span>`;

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">
          <div class="flex items-center gap-2">
            <span>${item.nomeCompleto}</span>
          </div>
        </td>
        <td class="p-3">${patrolBadge}</td>
        <td class="p-3 text-center text-gray-700 dark:text-gray-300">${item.totalActivities}</td>
        <td class="p-3 text-center font-bold text-green-700 dark:text-green-400">${item.presenti}</td>
        <td class="p-3 text-center font-bold text-red-600 dark:text-red-400">${item.assenti}</td>
        <td class="p-3 text-center text-gray-500 dark:text-gray-400">${item.nr}</td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs min-w-[36px]">${item.perc}%</span>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div class="${barColor} h-2 rounded-full" style="width: ${item.perc}%"></div>
            </div>
          </div>
        </td>
        <td class="p-3 text-center">${levelBadge}</td>
        <td class="p-3 text-center">${quoteHtml}</td>
        <td class="p-3 text-center">
          <button type="button" class="view-scout-detail-btn px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold cursor-pointer shadow-sm transition-all"
            data-scout-id="${s.id}">
            🔍 Dettagli
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Event listeners per pulsanti dettaglio
  const detailBtns = body.querySelectorAll('.view-scout-detail-btn');
  detailBtns.forEach(btn => {
    btn.onclick = () => {
      const scoutId = btn.getAttribute('data-scout-id');
      const item = scoutStatsList.find(x => x.scout.id === scoutId);
      if (item) UI.openScoutHistoricalModal(item);
    };
  });
};

UI.openScoutHistoricalModal = function (item) {
  const modal = document.getElementById('scoutDetailModal');
  const title = document.getElementById('scoutDetailModalTitle');
  const subtitle = document.getElementById('scoutDetailModalSubtitle');
  const content = document.getElementById('scoutDetailModalContent');
  if (!modal || !content) return;

  const selectedYear = this._storicoState.selectedYear;
  if (title) title.textContent = `${item.nomeCompleto} · Anno Scout ${selectedYear}`;
  if (subtitle) {
    const patrolStr = item.patrol ? `Pattuglia ${item.patrol} · ` : '';
    subtitle.textContent = `${patrolStr}${item.presenti} Presente, ${item.assenti} Assente (${item.perc}% presenza)`;
  }

  content.innerHTML = `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl text-center">
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Attività Totali</p>
        <p class="text-xl font-bold text-gray-800 dark:text-gray-100">${item.totalActivities}</p>
      </div>
      <div>
        <p class="text-xs text-green-600 dark:text-green-400 font-medium">Presenze (P)</p>
        <p class="text-xl font-bold text-green-600 dark:text-green-400">${item.presenti}</p>
      </div>
      <div>
        <p class="text-xs text-red-600 dark:text-red-400 font-medium">Assenze (A)</p>
        <p class="text-xl font-bold text-red-600 dark:text-red-400">${item.assenti}</p>
      </div>
      <div>
        <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">% Presenza</p>
        <p class="text-xl font-bold text-blue-600 dark:text-blue-400">${item.perc}%</p>
      </div>
    </div>

    <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100 pt-2">Registro Attività Svolte</h4>
    <div class="max-h-[350px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
      ${item.scoutPresences.map(sp => {
        const d = this.toJsDate(sp.activity.data);
        const dateStr = !isNaN(d) ? d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
        const tipo = sp.activity.tipo || 'Attività';
        const desc = sp.activity.descrizione || '';
        
        let statoBadge = '';
        if (sp.stato === 'Presente') {
          statoBadge = '<span class="px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">P - Presente</span>';
        } else if (sp.stato === 'Assente') {
          statoBadge = '<span class="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">A - Assente</span>';
        } else if (sp.stato === 'X') {
          statoBadge = '<span class="px-2 py-0.5 text-xs font-bold rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">X - Escluso</span>';
        } else {
          statoBadge = '<span class="px-2 py-0.5 text-xs font-bold rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">NR - Non Reg.</span>';
        }

        return `
          <div class="p-3 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-700/20">
            <div>
              <div class="font-bold text-gray-800 dark:text-gray-100">${tipo}${desc ? ` - ${desc}` : ''}</div>
              <div class="text-gray-400 mt-0.5">📅 ${dateStr}</div>
            </div>
            <div>${statoBadge}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  modal.classList.remove('hidden');
};

UI.renderStoricoPatrolStats = function (scoutStatsList, activities) {
  const container = document.getElementById('patrolStatsContainer');
  if (!container) return;

  const patrolMap = {};
  scoutStatsList.forEach(s => {
    const p = s.patrol || 'Senza Pattuglia';
    if (!patrolMap[p]) {
      patrolMap[p] = {
        name: p,
        scoutsCount: 0,
        presenti: 0,
        assenti: 0,
        valid: 0
      };
    }
    patrolMap[p].scoutsCount++;
    patrolMap[p].presenti += s.presenti;
    patrolMap[p].assenti += s.assenti;
    patrolMap[p].valid += s.totalValid;
  });

  const list = Object.values(patrolMap).sort((a, b) => {
    const perA = a.valid > 0 ? (a.presenti / a.valid) : 0;
    const perB = b.valid > 0 ? (b.presenti / b.valid) : 0;
    return perB - perA;
  });

  if (list.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-sm">Nessuna pattuglia registrata per quest'anno scout.</p>`;
    return;
  }

  container.innerHTML = list.map(p => {
    const perc = p.valid > 0 ? Math.round((p.presenti / p.valid) * 100) : 0;
    const barColor = perc >= 75 ? 'bg-green-600' : perc >= 50 ? 'bg-yellow-500' : 'bg-red-500';

    return `
      <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-bold text-gray-800 dark:text-gray-100 text-sm truncate" title="${p.name}">⚜️ ${p.name}</h4>
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${p.scoutsCount} esploratori</span>
        </div>
        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-gray-500 dark:text-gray-400 font-medium">Presenza Media</span>
            <span class="font-bold text-sm text-gray-800 dark:text-gray-100">${perc}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden mb-2">
            <div class="${barColor} h-2 rounded-full" style="width: ${perc}%"></div>
          </div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400 flex justify-between">
            <span>P: <strong class="text-green-600 dark:text-green-400">${p.presenti}</strong></span>
            <span>A: <strong class="text-red-600 dark:text-red-400">${p.assenti}</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

UI.renderHistoricalGrid = function (activities, scouts, presences) {
  const datesHeader = document.getElementById('historicalGridDatesHeader');
  const typesHeader = document.getElementById('historicalGridTypesHeader');
  const gridBody = document.getElementById('historicalGridBody');
  if (!datesHeader || !typesHeader || !gridBody) return;

  datesHeader.innerHTML = `<th class="p-2 border border-green-700 text-left sticky left-0 bg-green-800 z-10 min-w-[180px]">Esploratore</th>`;
  typesHeader.innerHTML = `<th class="p-2 border border-green-800 text-left sticky left-0 bg-green-900 z-10 text-[10px]">Pattuglia / Attività</th>`;

  activities.forEach(a => {
    const d = this.toJsDate(a.data);
    const dateStr = !isNaN(d) ? d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : '';
    datesHeader.insertAdjacentHTML('beforeend', `<th class="p-2 border border-green-700 text-center min-w-[65px] whitespace-nowrap">${dateStr}</th>`);
    typesHeader.insertAdjacentHTML('beforeend', `<th class="p-1 border border-green-800 text-center truncate max-w-[80px]" title="${a.tipo}">${a.tipo || ''}</th>`);
  });

  const sortedScouts = [...scouts].sort((a, b) => {
    const ac = (a.cognome || '').trim().localeCompare((b.cognome || '').trim(), 'it');
    return ac !== 0 ? ac : (a.nome || '').localeCompare(b.nome || '', 'it');
  });

  gridBody.innerHTML = sortedScouts.map(scout => {
    const nomeCompleto = `${scout.nome || ''} ${scout.cognome || ''}`.trim() || scout.id;
    const patrolStr = scout.pv_pattuglia ? `<span class="text-[10px] text-gray-500 ml-1">(${scout.pv_pattuglia})</span>` : '';

    let row = `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td class="p-2 font-medium border border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 whitespace-nowrap">
        ${nomeCompleto}${patrolStr}
      </td>`;

    activities.forEach(a => {
      const p = presences.find(x => x.esploratoreId === scout.id && x.attivitaId === a.id);
      const stato = p ? p.stato : 'NR';

      let cellBadge = '<span class="text-gray-400 font-light">NR</span>';
      if (stato === 'Presente') {
        cellBadge = '<span class="font-bold text-green-700 dark:text-green-400">P</span>';
      } else if (stato === 'Assente') {
        cellBadge = '<span class="font-bold text-red-600 dark:text-red-400">A</span>';
      } else if (stato === 'X') {
        cellBadge = '<span class="font-medium text-gray-500">X</span>';
      }

      row += `<td class="p-2 border border-gray-200 dark:border-gray-700 text-center">${cellBadge}</td>`;
    });

    row += '</tr>';
    return row;
  }).join('');
};

UI.renderMultiYearComparison = function () {
  const tableBody = document.getElementById('multiYearTableBody');
  if (!tableBody) return;

  const currentScoutYear = this.getCurrentScoutYear ? this.getCurrentScoutYear() : '2025/2026';
  const allYears = this.getAllScoutYears ? this.getAllScoutYears(this.state.activities) : [currentScoutYear];
  const allActivities = this.state.activities || [];
  const allPresences = this.getDedupedPresences ? this.getDedupedPresences() : (this.state.presences || []);
  const allScouts = this.state.scouts || [];

  const comparisonData = allYears.map(year => {
    const yearActs = allActivities.filter(a => this.isActivityInScoutYear ? this.isActivityInScoutYear(a, year) : true);
    
    let totalPresenti = 0;
    let totalAssenti = 0;
    const patrolPresenti = {};

    yearActs.forEach(act => {
      const actPresences = allPresences.filter(p => p.attivitaId === act.id);
      actPresences.forEach(p => {
        if (p.stato === 'Presente') {
          totalPresenti++;
          const scout = allScouts.find(s => s.id === p.esploratoreId);
          if (scout && scout.pv_pattuglia) {
            patrolPresenti[scout.pv_pattuglia] = (patrolPresenti[scout.pv_pattuglia] || 0) + 1;
          }
        } else if (p.stato === 'Assente') {
          totalAssenti++;
        }
      });
    });

    const totalValid = totalPresenti + totalAssenti;
    const avgPerc = totalValid > 0 ? Math.round((totalPresenti / totalValid) * 100) : 0;

    let bestPatrol = 'Nessuna';
    let maxPatrolCount = 0;
    Object.entries(patrolPresenti).forEach(([p, count]) => {
      if (count > maxPatrolCount) {
        maxPatrolCount = count;
        bestPatrol = p;
      }
    });

    return {
      year,
      isCurrent: year === currentScoutYear,
      totalActs: yearActs.length,
      totalPresenti,
      totalAssenti,
      avgPerc,
      bestPatrol
    };
  });

  tableBody.innerHTML = comparisonData.map(item => {
    const currentTag = item.isCurrent
      ? '<span class="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">In corso</span>'
      : '<span class="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Archivio</span>';

    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
        <td class="p-3 font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <span>📅 ${item.year}</span>
          ${currentTag}
        </td>
        <td class="p-3 text-right font-medium text-gray-700 dark:text-gray-300">${item.totalActs}</td>
        <td class="p-3 text-right font-bold text-green-700 dark:text-green-400">${item.totalPresenti}</td>
        <td class="p-3 text-right font-bold text-red-600 dark:text-red-400">${item.totalAssenti}</td>
        <td class="p-3 text-right font-extrabold text-blue-700 dark:text-blue-400">${item.avgPerc}%</td>
        <td class="p-3 font-semibold text-amber-700 dark:text-amber-400">⚜️ ${item.bestPatrol}</td>
        <td class="p-3 text-center">
          <button type="button" class="select-year-btn px-3 py-1 text-xs font-semibold rounded-lg bg-green-50 hover:bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 cursor-pointer shadow-sm"
            data-year="${item.year}">
            Apri Dettaglio
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.querySelectorAll('.select-year-btn').forEach(btn => {
    btn.onclick = () => {
      const year = btn.getAttribute('data-year');
      this._storicoState.selectedYear = year;
      const select = document.getElementById('storicoScoutYearSelect');
      if (select) select.value = year;
      this.renderStoricoPresenze();
    };
  });
};

UI.exportStoricoCsv = function () {
  const selectedYear = this._storicoState.selectedYear;
  if (selectedYear === 'all') {
    this.showToast('Seleziona un anno scout specifico per esportare il file CSV.', { type: 'warning' });
    return;
  }

  const activities = (this.state.activities || []).filter(a => {
    return this.isActivityInScoutYear ? this.isActivityInScoutYear(a, selectedYear) : true;
  }).sort((a, b) => this.toJsDate(a.data) - this.toJsDate(b.data));

  const allPresences = this.getDedupedPresences ? this.getDedupedPresences() : (this.state.presences || []);
  const allScouts = this.state.scouts || [];

  // Header CSV
  const header = ['Nome', 'Cognome', 'Pattuglia', 'Presenze', 'Assenze', 'NR', '% Presenza'];
  activities.forEach(a => {
    const d = this.toJsDate(a.data);
    const dStr = !isNaN(d) ? d.toLocaleDateString('it-IT') : '';
    header.push(`"${a.tipo || 'Attività'} (${dStr})"`);
  });

  const rows = [header.join(',')];

  allScouts.forEach(s => {
    let presCount = 0;
    let assCount = 0;
    let nrCount = 0;
    const actCells = [];

    activities.forEach(a => {
      const p = allPresences.find(x => x.esploratoreId === s.id && x.attivitaId === a.id);
      const stato = p ? p.stato : 'NR';
      if (stato === 'Presente') presCount++;
      else if (stato === 'Assente') assCount++;
      else nrCount++;
      actCells.push(stato);
    });

    const totValid = presCount + assCount;
    const perc = totValid > 0 ? Math.round((presCount / totValid) * 100) : 0;

    const row = [
      `"${s.nome || ''}"`,
      `"${s.cognome || ''}"`,
      `"${s.pv_pattuglia || ''}"`,
      presCount,
      assCount,
      nrCount,
      `${perc}%`,
      ...actCells.map(c => `"${c}"`)
    ];
    rows.push(row.join(','));
  });

  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Storico_Presenze_${selectedYear.replace('/', '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  this.showToast(`CSV Anno Scout ${selectedYear} esportato con successo`);
};

UI.printStoricoReport = function () {
  window.print();
};
