// presenze.js - Logica specifica per la pagina Presenze

// Aspetta che UI sia disponibile (caricato da shared.js)
(function () {
  const init = () => {
    const ui = typeof window !== 'undefined' ? window.UI : (typeof UI !== 'undefined' ? UI : null);
    if (ui) {
      // Sovrascrive la funzione renderCurrentPage
      ui.renderCurrentPage = function () {
        this.renderPresenceTable();
      };
    } else {
      // Aspetta ancora che shared.js finisca di caricare
      setTimeout(init, 10);
    }
  };
  init();
})();

// UI.setupPresenceEventListeners = function() {
// Event listeners specifici per le presenze (mobile nav)
//const prev = this.qs('#mobileActivityPrev');
//const next = this.qs('#mobileActivityNext');
//const picker = this.qs('#mobileActivityPicker');
//if (prev) prev.addEventListener('click', () => {
//if (!picker) return;
//const idx = Math.max(0, picker.selectedIndex - 1);
//picker.selectedIndex = idx;
//UI.scrollToActivityIndex(idx);
//});
//if (next) next.addEventListener('click', () => {
//if (!picker) return;
//const max = Math.max(0, (picker.options.length || 1) - 1);
//const idx = Math.min(max, picker.selectedIndex + 1);
//picker.selectedIndex = idx;
//UI.scrollToActivityIndex(idx);
//});
//if (picker && !picker._bound) {
//picker._bound = true;
//picker.addEventListener('change', () => UI.scrollToActivityIndex(picker.selectedIndex));
//}

// Toggle Oggi/Prossima
//const jumpBtn = this.qs('#jumpToggle');
//if (jumpBtn && !jumpBtn._bound) {
//jumpBtn._bound = true;
//jumpBtn.addEventListener('click', () => {
//const acts = UI.getActivitiesSorted();
//if (!acts.length) return;
//const { todayIndex, nextIndex } = UI._getTodayAndNextIndexes(acts);
// Se il bottone dice "Vai a Prossima" -> vai a nextIndex, altrimenti vai a todayIndex
//const target = jumpBtn.dataset.mode === 'next' ? todayIndex : nextIndex;
//if (target >= 0) {
//UI.scrollToActivityIndex(target);
//const picker = UI.qs('#mobileActivityPicker');
//if (picker) picker.selectedIndex = target;
//}
// toggle label e mode
//if (jumpBtn.dataset.mode === 'next') {
//jumpBtn.textContent = 'Vai a Prossima';
//jumpBtn.dataset.mode = 'today';
//} else {
//jumpBtn.textContent = 'Vai a Oggi';
//jumpBtn.dataset.mode = 'next';
//}
//});
//}
//};

UI._getTodayAndNextIndexes = function (acts) {
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let todayIndex = -1; let nextIndex = -1;
  acts.forEach((a, idx) => {
    const d = toDate(a.data); const dd = new Date(d); dd.setHours(0, 0, 0, 0);
    if (dd.getTime() === today.getTime()) todayIndex = idx;
    if (nextIndex === -1 && dd >= today) nextIndex = idx;
  });
  return { todayIndex, nextIndex };
};

UI.getActivitiesSorted = function () {
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  return [...(this.state.activities || [])].sort((a, b) => toDate(a.data) - toDate(b.data));
};

UI.getPresence = function (scoutId, activityId) {
  const key = `${scoutId}_${activityId}`;
  return this.presenceIndex?.get(key) || null;
};

UI.getDedupedPresences = function () {
  return Array.from(this.presenceIndex?.values() || []);
};

UI.formatDisplayDate = function (value) {
  const d = value && value.toDate ? value.toDate() : new Date(value);
  if (isNaN(d)) return '';
  const giorni = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const giorno = giorni[d.getDay()];
  const data = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
  return `${giorno} ${data}`;
};

UI._scoutSortDir = UI._scoutSortDir || 'asc';
UI._presenceTableScrollLeft = UI._presenceTableScrollLeft || 0;

UI.scrollToActivityIndex = function (index) {
  const container = this.qs('#presenceTableContainer');
  const thDates = this.qs('#tableHeaderDates');
  if (!container || !thDates) return;
  // +1 per saltare la prima colonna "Esploratore"
  const targetTh = thDates.children[index + 1];
  if (!targetTh) return;
  const left = targetTh.offsetLeft - 16; // piccolo padding
  container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
};

UI.presenceFilters = UI.presenceFilters || {
  search: '',
  patrol: '',
  condition: 'all',
  activityType: 'all',
  period: 'all'
};

UI.setupPresenceFilters = function () {
  const searchInput = this.qs('#presenceSearchInput');
  const patrolFilter = this.qs('#presencePatrolFilter');
  const conditionFilter = this.qs('#presenceConditionFilter');
  const activityTypeFilter = this.qs('#presenceActivityTypeFilter');
  const periodFilter = this.qs('#presencePeriodFilter');
  const resetBtn = this.qs('#presenceResetFiltersBtn');

  // Popola selettore pattuglie dinamicamente
  if (patrolFilter) {
    const currentVal = this.presenceFilters.patrol || '';
    const patrols = Array.from(new Set(
      (this.state.scouts || [])
        .map(s => (s.pv_pattuglia || '').trim())
        .filter(p => p.length > 0)
    )).sort((a, b) => a.localeCompare(b));

    const existingValues = Array.from(patrolFilter.options).map(o => o.value);
    const neededValues = ['', ...patrols];
    const isDifferent = existingValues.length !== neededValues.length ||
      !existingValues.every((v, i) => v === neededValues[i]);

    if (isDifferent) {
      patrolFilter.innerHTML = '<option value="">Tutte le pattuglie</option>' +
        patrols.map(p => `<option value="${p}">${p}</option>`).join('');
      patrolFilter.value = currentVal;
    }
  }

  if (this._presenceFiltersBound) return;
  this._presenceFiltersBound = true;

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.presenceFilters.search = e.target.value.trim().toLowerCase();
        this.renderPresenceTable();
      }, 150);
    });
  }

  if (patrolFilter) {
    patrolFilter.addEventListener('change', (e) => {
      this.presenceFilters.patrol = e.target.value;
      this.renderPresenceTable();
    });
  }

  if (conditionFilter) {
    conditionFilter.addEventListener('change', (e) => {
      this.presenceFilters.condition = e.target.value;
      this.renderPresenceTable();
    });
  }

  if (activityTypeFilter) {
    activityTypeFilter.addEventListener('change', (e) => {
      this.presenceFilters.activityType = e.target.value;
      this.renderPresenceTable();
    });
  }

  if (periodFilter) {
    periodFilter.addEventListener('change', (e) => {
      this.presenceFilters.period = e.target.value;
      this.renderPresenceTable();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      this.presenceFilters = {
        search: '',
        patrol: '',
        condition: 'all',
        activityType: 'all',
        period: 'all'
      };
      if (searchInput) searchInput.value = '';
      if (patrolFilter) patrolFilter.value = '';
      if (conditionFilter) conditionFilter.value = 'all';
      if (activityTypeFilter) activityTypeFilter.value = 'all';
      if (periodFilter) periodFilter.value = 'all';
      this.renderPresenceTable();
      this.showToast('Filtri azzerati', { type: 'info' });
    });
  }
};

UI.getFilteredActivities = function (acts) {
  const filter = this.presenceFilters || {};
  let list = [...acts];

  if (filter.activityType && filter.activityType !== 'all') {
    list = list.filter(a => a.tipo === filter.activityType);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filter.period === 'past') {
    list = list.filter(a => {
      const d = this.toJsDate(a.data);
      const dd = new Date(d); dd.setHours(0, 0, 0, 0);
      return dd < today;
    });
  } else if (filter.period === 'future') {
    list = list.filter(a => {
      const d = this.toJsDate(a.data);
      const dd = new Date(d); dd.setHours(0, 0, 0, 0);
      return dd >= today;
    });
  } else if (filter.period === 'last10') {
    list = list.slice(-10);
  }

  return list;
};

UI.getFilteredScouts = function (scouts, nextActivityId) {
  const filter = this.presenceFilters || {};
  let list = [...scouts];

  if (filter.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(s => {
      const full = `${s.nome || ''} ${s.cognome || ''}`.toLowerCase();
      const patrol = (s.pv_pattuglia || '').toLowerCase();
      return full.includes(q) || patrol.includes(q);
    });
  }

  if (filter.patrol) {
    list = list.filter(s => (s.pv_pattuglia || '').trim().toLowerCase() === filter.patrol.toLowerCase());
  }

  if (filter.condition && filter.condition !== 'all') {
    const allPresences = this.getDedupedPresences();
    const acts = this.getActivitiesSorted();

    if (filter.condition === 'with_absences') {
      list = list.filter(s => {
        return allPresences.some(p => p.esploratoreId === s.id && p.stato === 'Assente');
      });
    } else if (filter.condition === 'with_debt') {
      list = list.filter(s => {
        return allPresences.some(p => {
          if (p.esploratoreId !== s.id) return false;
          if (p.stato !== 'Presente' || p.pagato) return false;
          const act = acts.find(a => a.id === p.attivitaId);
          return act && parseFloat(act.costo || '0') > 0;
        });
      });
    } else if (filter.condition === 'next_present') {
      if (!nextActivityId) {
        list = [];
      } else {
        list = list.filter(s => {
          const pr = this.getPresence(s.id, nextActivityId);
          return pr && pr.stato === 'Presente';
        });
      }
    } else if (filter.condition === 'next_absent') {
      if (!nextActivityId) {
        list = [];
      } else {
        list = list.filter(s => {
          const pr = this.getPresence(s.id, nextActivityId);
          return pr && pr.stato === 'Assente';
        });
      }
    }
  }

  return list;
};

UI.renderPresenceTable = function () {
  const body = this.qs('#presenceTableBody');
  const thDates = this.qs('#tableHeaderDates');
  const thNames = this.qs('#tableHeaderNames');
  if (!body || !thDates || !thNames) return;

  // Setup filtri
  this.setupPresenceFilters();

  body.innerHTML = '';
  // Checkbox "Seleziona tutti" nell'header
  const selectAllChecked = this.batchSelection?.isSelectAll ? 'checked' : '';
  thDates.innerHTML = `<th id="thScoutName" rowspan="2" class="cursor-pointer select-none sticky left-0 !bg-green-800 !text-white !p-4 !border-r !border-white/50 text-left" title="Ordina per Esploratore">
    <div class="flex items-center gap-2">
      <input type="checkbox" id="selectAllCheckbox" class="w-4 h-4 cursor-pointer" ${selectAllChecked} title="Seleziona tutti gli esploratori visibili">
      <span>Esploratore</span>
    </div>
  </th>`;
  thNames.innerHTML = '';

  // Inizializza selezione batch se non esiste
  if (!this.batchSelection) {
    this.batchSelection = {
      selectedScoutIds: new Set(),
      selectedActivityId: null,
      isSelectAll: false
    };
  }

  // Setup checkbox "Seleziona tutti"
  const selectAllCheckbox = this.qs('#selectAllCheckbox');
  if (selectAllCheckbox && !selectAllCheckbox._bound) {
    selectAllCheckbox._bound = true;
    selectAllCheckbox.addEventListener('change', (e) => {
      this.toggleSelectAll(e.target.checked);
    });
  }

  const allScouts = this.state.scouts || [];
  const totalScouts = allScouts.length;
  const acts = this.getActivitiesSorted();
  const displayedActs = this.getFilteredActivities(acts);
  this._lastRenderedActs = displayedActs;

  // Calcola la prossima attività (>= oggi)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextActivityId = null;
  let nextActivityIndex = -1;
  acts.forEach((a, idx) => {
    const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
    const aday = new Date(ad); aday.setHours(0, 0, 0, 0);
    if (nextActivityId === null && aday >= today) { nextActivityId = a.id; nextActivityIndex = idx; }
  });

  // Header colonne per le attività visualizzate
  displayedActs.forEach(a => {
    const allPresences = this.getDedupedPresences();
    const activityPresences = allPresences.filter(p => p.attivitaId === a.id);

    // Check type for stats exclusion
    const isExcludedType = ['Evento Adulti', 'Riunione Adulti', 'Eventi con esterni'].includes(a.tipo);
    const expectedCount = isExcludedType ? 0 : activityPresences.filter(p => p.stato !== 'X').length;

    const presentCount = activityPresences.filter(p => p.stato === 'Presente').length;
    const perc = expectedCount ? Math.round((presentCount / expectedCount) * 100) : 0;

    let displayDate = this.formatDisplayDate(a.data);

    const isNext = a.id === nextActivityId;

    // Gestione date range
    if (a.dataFine) {
      const dStart = this.toJsDate(a.data);
      const dEnd = this.toJsDate(a.dataFine);
      if (!isNaN(dStart) && !isNaN(dEnd) && dEnd.getTime() > dStart.getTime()) {
        const fmt = d => d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        displayDate = `${fmt(dStart)} - ${fmt(dEnd)}`;
      }
    }

    // Use enhanced colors
    const colors = UI.getActivityTypeColor ? UI.getActivityTypeColor(a.tipo) : { headerBg: 'bg-green-800', headerText: 'bg-green-900' };
    const thDateClasses = isNext ? colors.headerText : colors.headerBg;
    const baseHeaderClass = colors.headerBg || 'bg-green-800';
    const nextHeaderClass = colors.headerText || 'bg-green-900';
    const finalHeaderClass = isNext ? nextHeaderClass : baseHeaderClass;
    const nextColClass = isNext ? ' next-col' : '';

    thDates.insertAdjacentHTML('beforeend', `<th class="p-2 border-b-2 border-gray-200 ${finalHeaderClass}${nextColClass} text-white font-semibold sticky top-0 border-r border-white/40"><a href="#" data-activity-id="${a.id}" class="activity-header-link text-white hover:underline cursor-pointer" title="Apri dettaglio attività">${displayDate}${isNext ? ' <span class=\"text-xs\">(Prossima)</span>' : ''}</a></th>`);
    thNames.insertAdjacentHTML('beforeend', `<th class="p-2 border-b-2 border-gray-200 ${finalHeaderClass} text-white font-semibold sticky top-0 border-r border-white/40"><a href="#" data-activity-id="${a.id}" class="activity-header-link text-white hover:underline cursor-pointer" title="Apri dettaglio attività">${a.tipo}</a><div class="text-xs font-normal text-white/90">${perc}% (${presentCount}/${expectedCount})</div></th>`);
  });

  // Event listeners per i link delle intestazioni
  const headerLinks = document.querySelectorAll('.activity-header-link');
  headerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const activityId = link.getAttribute('data-activity-id');
      if (activityId) {
        this.showActivityDetailModal(activityId);
      }
    });
  });

  // Sort handler su intestazione Esploratore
  const thScout = this.qs('#thScoutName');
  if (thScout && !thScout._sortBound) {
    thScout._sortBound = true;
    thScout.addEventListener('click', () => {
      this._scoutSortDir = this._scoutSortDir === 'asc' ? 'desc' : 'asc';
      this.renderPresenceTable();
    });
  }

  // Filtra e ordina gli esploratori
  let sortedScouts = this.getFilteredScouts(allScouts, nextActivityId);
  sortedScouts.sort((a, b) => {
    const an = `${a.cognome || ''} ${a.nome || ''}`.toLowerCase();
    const bn = `${b.cognome || ''} ${b.nome || ''}`.toLowerCase();
    return an.localeCompare(bn);
  });
  if (this._scoutSortDir === 'desc') sortedScouts.reverse();
  this._lastRenderedScouts = sortedScouts;

  // Aggiorna riepilogo conteggio filtri
  const summaryEl = this.qs('#presenceFilterSummary');
  if (summaryEl) {
    summaryEl.textContent = `Visualizzati: ${sortedScouts.length} di ${totalScouts} esploratori, ${displayedActs.length} di ${acts.length} attività`;
  }

  // Verifica se tutti i visualizzati sono selezionati
  if (selectAllCheckbox) {
    const allChecked = sortedScouts.length > 0 && sortedScouts.every(s => this.batchSelection.selectedScoutIds.has(s.id));
    selectAllCheckbox.checked = allChecked;
    this.batchSelection.isSelectAll = allChecked;
  }

  // Caso nessun esploratore trovato con i filtri
  if (sortedScouts.length === 0) {
    const colSpan = Math.max(1, displayedActs.length + 1);
    body.innerHTML = `<tr><td colspan="${colSpan}" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-800">Nessun esploratore corrisponde ai filtri impostati.</td></tr>`;
    return;
  }

  // Render righe per ciascun esploratore
  sortedScouts.forEach(s => {
    // Calcola il set di attività considerate: tutte le già svolte (< oggi) + la prossima in programma
    const pastIds = acts.filter(a => {
      const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
      const aday = new Date(ad); aday.setHours(0, 0, 0, 0);
      return aday < today;
    }).map(a => a.id);
    const consideredIds = nextActivityId ? [...pastIds, nextActivityId] : pastIds;

    const allPresences = this.getDedupedPresences();
    const validActIds = consideredIds.filter(aid => {
      const actObject = acts.find(act => act.id === aid);
      if (!actObject) return false;

      const isExcludedType = ['Evento Adulti', 'Riunione Adulti', 'Eventi con esterni'].includes(actObject.tipo);
      if (isExcludedType) return false;

      const pr = allPresences.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = allPresences.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    const perc = totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
    const isSelected = this.batchSelection?.selectedScoutIds?.has(s.id) || false;
    const checkedAttr = isSelected ? 'checked' : '';
    const patrolBadge = s.pv_pattuglia ? `<span class="text-[10px] uppercase font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded ml-1.5">${s.pv_pattuglia}</span>` : '';

    let row = `<tr data-scout-id="${s.id}" class="${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}">
      <td class=\"p-4 border-r-2 border-gray-200 bg-gray-50 dark:bg-gray-800 font-semibold text-left sticky left-0\">
        <div class="flex items-center gap-2">
          <input type="checkbox" class="batch-checkbox w-4 h-4 cursor-pointer" data-scout-id="${s.id}" ${checkedAttr} title="Seleziona esploratore">
          <span>${s.nome} ${s.cognome}</span>
          ${patrolBadge}
        </div>
        <div class=\"text-xs font-normal text-gray-500 dark:text-gray-400 ml-6\">${presentCount} / ${totalActsConsidered} (${perc}%)</div>
      </td>`;

    displayedActs.forEach(a => {
      const presence = this.getPresence(s.id, a.id) || { stato: 'NR', pagato: false, tipoPagamento: null };
      const disabled = (this.selectedStaffId && this.currentUser) ? '' : 'disabled';
      const needsPayment = parseFloat(a.costo || '0') > 0;
      const isNext = a.id === nextActivityId;
      const cellClass = isNext ? ' next-col' : '';

      row += `<td class=\"p-2 border-r border-b border-gray-200${cellClass}\">
        <div class=\"flex flex-col items-center gap-1\">
          <select class=\"presence-select\" data-selected=\"${presence.stato}\" ${disabled}
            onchange=\"UI.updatePresenceCell({field:'stato', value:this.value, scoutId:'${s.id}', activityId:'${a.id}'})\">
            <option value=\"Presente\" ${presence.stato === 'Presente' ? 'selected' : ''}>P</option>
            <option value=\"Assente\" ${presence.stato === 'Assente' ? 'selected' : ''}>A</option>
            <option value=\"NR\" ${presence.stato === 'NR' ? 'selected' : ''}>NR</option>
            <option value=\"X\" ${presence.stato === 'X' ? 'selected' : ''}>X</option>
          </select>
          ${needsPayment ? `
          <div class=\"payment-section\">
            <select class=\"payment-select mt-1\" data-selected=\"${presence.pagato ? (presence.tipoPagamento || 'Pagato') : ''}\" ${disabled}
              onchange=\"UI.updatePaymentCombined({value:this.value, scoutId:'${s.id}', activityId:'${a.id}'})\">
              <option value=\"\" ${!presence.pagato ? 'selected' : ''}>Non Pagato</option>
              <option value=\"Contanti\" ${(presence.pagato && presence.tipoPagamento === 'Contanti') ? 'selected' : ''}>Contanti</option>
              <option value=\"Satispay\" ${(presence.pagato && presence.tipoPagamento === 'Satispay') ? 'selected' : ''}>Satispay</option>
              <option value=\"Bonifico\" ${(presence.pagato && presence.tipoPagamento === 'Bonifico') ? 'selected' : ''}>Bonifico</option>
            </select>
          </div>` : ''}
        </div>
      </td>`;
    });

    row += `</tr>`;
    body.insertAdjacentHTML('beforeend', row);
  });

  // Setup checkbox individuali dopo rendering
  body.querySelectorAll('.batch-checkbox').forEach(checkbox => {
    if (!checkbox._bound) {
      checkbox._bound = true;
      checkbox.addEventListener('change', (e) => {
        const scoutId = e.target.getAttribute('data-scout-id');
        this.toggleBatchSelection(scoutId, e.target.checked);
      });
    }
  });

  // Setup barra azioni batch
  this.setupBatchOperations();

  // Setup pulsanti di navigazione colonne dopo che la tabella è stata renderizzata
  setTimeout(() => {
    this.setupColumnNavigation();
    // Scroll automatico alla prossima attività dopo il setup
    setTimeout(() => {
      if (this._scrollToNextActivity) {
        this._scrollToNextActivity();
      }
    }, 50);
  }, 100);
};

// Setup pulsanti di navigazione colonne
UI.setupColumnNavigation = function () {
  const container = this.qs('#presenceTableContainer');
  const prevBtn = this.qs('#scrollPrevBtn');
  const nextBtn = this.qs('#scrollNextBtn');
  const nextActivityBtn = this.qs('#scrollToNextActivityBtn');

  if (!container) return;

  // Rimuovi listener esistenti se presenti (per evitare duplicati)
  if (prevBtn && prevBtn._bound) {
    prevBtn.removeEventListener('click', prevBtn._clickHandler);
  }
  if (nextBtn && nextBtn._bound) {
    nextBtn.removeEventListener('click', nextBtn._clickHandler);
  }
  if (nextActivityBtn && nextActivityBtn._bound) {
    nextActivityBtn.removeEventListener('click', nextActivityBtn._clickHandler);
  }

  // Pulsante precedente
  if (prevBtn) {
    prevBtn._clickHandler = () => {
      const table = container.querySelector('.presence-table');
      if (!table) return;

      // Trova tutte le colonne (th) tranne la prima (sticky)
      const headers = table.querySelectorAll('thead th:not(.sticky)');
      if (headers.length === 0) return;

      // Calcola la posizione attuale dello scroll
      const currentScroll = container.scrollLeft;
      const containerWidth = container.clientWidth;

      // Trova la colonna più vicina a sinistra rispetto alla posizione corrente
      let targetCol = null;
      let minDistance = Infinity;

      headers.forEach((th, index) => {
        const colLeft = th.offsetLeft;
        const colRight = colLeft + th.offsetWidth;

        // Se la colonna è completamente a sinistra della vista corrente
        if (colRight < currentScroll) {
          const distance = currentScroll - colRight;
          if (distance < minDistance) {
            minDistance = distance;
            targetCol = th;
          }
        }
      });

      if (targetCol) {
        // Scrolla per mostrare la colonna precedente
        const targetScroll = Math.max(0, targetCol.offsetLeft - 20);
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      } else {
        // Se non c'è una colonna precedente, vai all'inizio
        container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };
    prevBtn.addEventListener('click', prevBtn._clickHandler);
    prevBtn._bound = true;
  }

  // Helper per larghezza colonna sticky
  const getStickyWidth = () => {
    const stickyTh = container.querySelector('th.sticky.left-0');
    return stickyTh ? stickyTh.offsetWidth : 0;
  };

  // Pulsante successivo
  if (nextBtn) {
    nextBtn._clickHandler = () => {
      const table = container.querySelector('.presence-table');
      if (!table) return;

      const headers = table.querySelectorAll('thead th:not(.sticky)');
      if (headers.length === 0) return;

      const currentScroll = container.scrollLeft;
      const containerWidth = container.clientWidth;
      // Il punto "visibile" a destra deve considerare che a sinistra c'è la colonna sticky che copre
      // In realtà scrollLeft sposta tutto sotto la sticky. Quindi quello che vediamo inizia da scrollLeft + stickyWidth
      // Ma quando clicchiamo "next", vogliamo scrollare in avanti.

      const stickyWidth = getStickyWidth();
      const visibleRight = currentScroll + containerWidth;

      // Trova la prima colonna che è parzialmente o completamente a destra della vista corrente
      let targetCol = null;

      headers.forEach((th) => {
        const colLeft = th.offsetLeft;
        // Consideriamo una colonna "a destra" se il suo inizio è oltre l'area visibile attuale
        if (colLeft > visibleRight - 50) {
          if (!targetCol || colLeft < targetCol.offsetLeft) {
            targetCol = th;
          }
        }
      });

      if (targetCol) {
        // Scrolla in modo che targetCol sia subito dopo la sticky
        const targetScroll = Math.max(0, targetCol.offsetLeft - stickyWidth);
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      } else {
        container.scrollTo({ left: table.scrollWidth, behavior: 'smooth' });
      }
    };
    nextBtn.addEventListener('click', nextBtn._clickHandler);
    nextBtn._bound = true;
  }

  // Funzione per scrollare alla prossima attività (riutilizzabile)
  const scrollToNextActivity = () => {
    const table = container.querySelector('.presence-table');
    if (!table) return;

    const stickyWidth = getStickyWidth();

    // Trova la colonna con classe "next-col" (prossima attività)
    const nextCol = table.querySelector('thead th.next-col, tbody td.next-col');
    if (nextCol) {
      // Offset per non farla finire sotto la sticky
      const targetScroll = Math.max(0, nextCol.offsetLeft - stickyWidth);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    } else {
      // Se non trova la classe next-col, cerca l'ultima colonna
      const headers = table.querySelectorAll('thead th:not(.sticky)');
      if (headers.length > 0) {
        const lastHeader = headers[headers.length - 1];
        const targetScroll = Math.max(0, lastHeader.offsetLeft - stickyWidth);
        container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }
  };

  // Pulsante "Prossima" - va alla colonna della prossima attività
  if (nextActivityBtn) {
    nextActivityBtn._clickHandler = scrollToNextActivity;
    nextActivityBtn.addEventListener('click', nextActivityBtn._clickHandler);
    nextActivityBtn._bound = true;
  }

  // Espone la funzione per uso esterno
  this._scrollToNextActivity = scrollToNextActivity;
};

UI.showActivityDetailModal = function (activityId) {
  const activity = (this.state.activities || []).find(a => a.id === activityId);
  if (!activity) return;

  // Header
  const d = this.toJsDate(activity.data);
  const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const titleEl = this.qs('#activityDetailTitle');
  const metaEl = this.qs('#activityDetailMeta');
  if (titleEl) titleEl.textContent = `${activity.tipo || 'Attività'}${activity.descrizione ? ' — ' + activity.descrizione : ''}`;
  if (metaEl) metaEl.textContent = `${ds}${activity.costo ? ` — Costo: €${activity.costo}` : ''}`;

  // Prepara indici
  const presenze = this.getDedupedPresences().filter(p => p.attivitaId === activityId);

  // Utility: format DOB
  const fmtDob = (s) => {
    const raw = s?.anag_dob;
    if (!raw) return '';
    const date = this.toJsDate(raw);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('it-IT');
  };

  // Separa presenti/assenti
  const presenti = [];
  const assenti = [];
  const pagamenti = [];

  (this.state.scouts || []).forEach(s => {
    const p = presenze.find(x => x.esploratoreId === s.id);
    const nome = `${s.nome || ''} ${s.cognome || ''}`.trim();
    const dob = fmtDob(s);
    if (p && p.stato === 'Presente') {
      presenti.push({ nome, dob });
    } else if (p && p.stato === 'Assente') {
      assenti.push({ nome, dob });
    }
    if (p && p.pagato) {
      pagamenti.push({ nome, metodo: p.tipoPagamento || 'Pagato' });
    }
  });

  // Render liste e contatori
  const mkLi = (t) => `<li>${t}</li>`;
  const presentiList = this.qs('#presentiModalList');
  const assentiList = this.qs('#assentiModalList');
  const pagamentiList = this.qs('#pagamentiModalList');
  const presentiCount = this.qs('#presentiModalCount');
  const assentiCount = this.qs('#assentiModalCount');
  const pagamentiCount = this.qs('#pagamentiModalCount');

  if (presentiList) presentiList.innerHTML = presenti
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map(x => mkLi(`${x.nome}${x.dob ? ' — ' + x.dob : ''}`)).join('');
  if (presentiCount) presentiCount.textContent = `${presenti.length} elementi`;

  if (assentiList) assentiList.innerHTML = assenti
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map(x => mkLi(`${x.nome}${x.dob ? ' — ' + x.dob : ''}`)).join('');
  if (assentiCount) assentiCount.textContent = `${assenti.length} elementi`;

  if (pagamentiList) pagamentiList.innerHTML = pagamenti
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map(x => mkLi(`${x.nome} — ${x.metodo}`)).join('');
  if (pagamentiCount) pagamentiCount.textContent = `${pagamenti.length} pagamenti`;

  // Bottoni copia
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      UI.showToast('Copiato negli appunti', { duration: 1500 });
    } catch (e) {
      console.error('Clipboard error:', e);
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      UI.showToast('Copiato negli appunti', { duration: 1500 });
    }
  };

  const copyPresentiBtn = this.qs('#copyPresentiModalBtn');
  const copyAssentiBtn = this.qs('#copyAssentiModalBtn');
  const copyPagamentiBtn = this.qs('#copyPagamentiModalBtn');

  const joinLines = (arr, mapFn) => arr
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map(mapFn)
    .join('\n');

  if (copyPresentiBtn) {
    copyPresentiBtn.onclick = () => {
      const txt = joinLines(presenti, x => `${x.nome}${x.dob ? ' — ' + x.dob : ''}`);
      copy(txt);
    };
  }
  if (copyAssentiBtn) {
    copyAssentiBtn.onclick = () => {
      const txt = joinLines(assenti, x => `${x.nome}${x.dob ? ' — ' + x.dob : ''}`);
      copy(txt);
    };
  }
  if (copyPagamentiBtn) {
    copyPagamentiBtn.onclick = () => {
      const txt = joinLines(pagamenti, x => `${x.nome} — ${x.metodo}`);
      copy(txt);
    };
  }

  // Mostra il modale
  this.showModal('activityDetailModal');

  // Setup commenti per il modale
  this.setupCommentsForTarget('activity', activityId, {
    listSelector: '#activityModalCommentsList',
    formSelector: '#activityModalCommentForm',
    textareaSelector: '#activityModalCommentText',
    charCountSelector: '#activityModalCommentCharCount'
  });

  // Chiudi modale quando si clicca sul backdrop
  const modal = this.qs('#activityDetailModal');
  if (modal && !modal._backdropBound) {
    modal._backdropBound = true;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal('activityDetailModal');
      }
    });
  }
};

// ============== Batch Operations ==============

// Implementazione funzioni mancanti per gestione presenze singole

/**
 * Aggiorna una singola cella presenza (stato)
 */
UI.updatePresenceCell = async function ({ field, value, scoutId, activityId }) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato.', { type: 'error' });
    return;
  }

  try {
    // Aggiorna DB
    await DATA.updatePresence({ field, value, scoutId, activityId }, this.currentUser);

    // Aggiorna stato locale (ricaricando o ottimisticamente)
    // Aggiorniamo l'indice locale manualmente per calcoli rapidi
    const key = `${scoutId}_${activityId}`;
    let p = this.presenceIndex.get(key);
    if (!p) {
      // Se è nuovo record fittizio
      p = {
        id: key,
        esploratoreId: scoutId,
        attivitaId: activityId,
        stato: 'NR',
        pagato: false,
        tipoPagamento: null
      };
    }
    p[field] = value;
    this.presenceIndex.set(key, p);

    // Se vogliamo essere sicuri di avere i dati freschi (incluso ID generato se era nuovo doc)
    // una reload in background è utile, ma non bloccante.
    // DATA.loadAll().then(s => { this.state = s; this.rebuildPresenceIndex(); });

  } catch (error) {
    console.error('Errore updatePresenceCell:', error);
    this.showToast('Errore salvataggio', { type: 'error' });
  }
};

/**
 * Aggiorna pagamento (combinato pagato + tipo)
 */
UI.updatePaymentCombined = async function ({ value, scoutId, activityId }) {
  if (!this.currentUser) return;

  const pagato = !!value; // se value non è vuoto, è pagato
  const tipoPagamento = value || null;

  try {
    await DATA.updatePresence({ field: 'pagato', value: pagato, scoutId, activityId }, this.currentUser);
    if (pagato) {
      await DATA.updatePresence({ field: 'tipoPagamento', value: tipoPagamento, scoutId, activityId }, this.currentUser);
    }

    // Aggiorna indice locale
    const key = `${scoutId}_${activityId}`;
    let p = this.presenceIndex.get(key);
    if (p) {
      p.pagato = pagato;
      p.tipoPagamento = tipoPagamento;
      this.presenceIndex.set(key, p);
    }

  } catch (error) {
    console.error('Errore updatePaymentCombined:', error);
    this.showToast('Errore salvataggio pagamento', { type: 'error' });
  }
};

/**
 * Inizializza sistema batch operations
 */
UI.setupBatchOperations = function () {
  if (!this.batchSelection) {
    this.batchSelection = {
      selectedScoutIds: new Set(),
      selectedActivityId: null,
      isSelectAll: false
    };
  }

  // Popola select attività
  this.updateBatchActivitySelect();

  // Setup event listeners per barra azioni
  this.setupBatchActionButtons();

  // Aggiorna barra azioni
  this.updateBatchActionBar();
};

/**
 * Popola select attività per batch operations
 */
UI.updateBatchActivitySelect = function () {
  const select = this.qs('#batchActivitySelect');
  if (!select) return;

  const acts = this.getActivitiesSorted();
  select.innerHTML = '<option value="">Seleziona attività...</option>' +
    acts.map(a => {
      const d = this.toJsDate(a.data);
      const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return `<option value="${a.id}">${ds} - ${a.tipo}</option>`;
    }).join('');

  if (this.batchSelection.selectedActivityId) {
    select.value = this.batchSelection.selectedActivityId;
  }

  // Listener per cambio attività
  if (!select._bound) {
    select._bound = true;
    select.addEventListener('change', (e) => {
      this.batchSelection.selectedActivityId = e.target.value || null;
      this.updateBatchActionBar();
    });
  }
},

  /**
   * Setup pulsanti azioni batch
   */
  UI.setupBatchActionButtons = function () {
    const markPresentBtn = this.qs('#batchMarkPresentBtn');
    const markAbsentBtn = this.qs('#batchMarkAbsentBtn');
    const applyPaymentBtn = this.qs('#batchApplyPaymentBtn');
    const exportBtn = this.qs('#batchExportBtn');
    const clearBtn = this.qs('#batchClearBtn');
    const cancelBtn = this.qs('#batchCancelBtn');

    if (markPresentBtn && !markPresentBtn._bound) {
      markPresentBtn._bound = true;
      markPresentBtn.addEventListener('click', () => this.executeBatchAction('markPresent'));
    }

    if (markAbsentBtn && !markAbsentBtn._bound) {
      markAbsentBtn._bound = true;
      markAbsentBtn.addEventListener('click', () => this.executeBatchAction('markAbsent'));
    }

    if (applyPaymentBtn && !applyPaymentBtn._bound) {
      applyPaymentBtn._bound = true;
      applyPaymentBtn.addEventListener('click', () => this.executeBatchAction('applyPayment'));
    }

    if (exportBtn && !exportBtn._bound) {
      exportBtn._bound = true;
      exportBtn.addEventListener('click', () => this.executeBatchAction('export'));
    }

    if (clearBtn && !clearBtn._bound) {
      clearBtn._bound = true;
      clearBtn.addEventListener('click', () => this.clearBatchSelection());
    }

    if (cancelBtn && !cancelBtn._bound) {
      cancelBtn._bound = true;
      cancelBtn.addEventListener('click', () => {
        if (this._batchOperationCancelled) {
          this._batchOperationCancelled = true;
          this.hideBatchProgress();
        }
      });
    }
  },

  /**
   * Toggle selezione singolo esploratore
   */
  UI.toggleBatchSelection = function (scoutId, checked) {
    if (!this.batchSelection) {
      this.batchSelection = {
        selectedScoutIds: new Set(),
        selectedActivityId: null,
        isSelectAll: false
      };
    }

    if (checked) {
      this.batchSelection.selectedScoutIds.add(scoutId);
    } else {
      this.batchSelection.selectedScoutIds.delete(scoutId);
      this.batchSelection.isSelectAll = false;
    }

    // Aggiorna UI checkbox nella riga
    const row = this.qs(`tr[data-scout-id="${scoutId}"]`);
    if (row) {
      if (checked) {
        row.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
      } else {
        row.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
      }
    }

    // Aggiorna checkbox "seleziona tutti" rispetto agli esploratori visualizzati
    const selectAllCheckbox = this.qs('#selectAllCheckbox');
    if (selectAllCheckbox) {
      const displayedScouts = this._lastRenderedScouts || this.state.scouts || [];
      const allDisplayedSelected = displayedScouts.length > 0 && displayedScouts.every(s => this.batchSelection.selectedScoutIds.has(s.id));
      selectAllCheckbox.checked = allDisplayedSelected;
      this.batchSelection.isSelectAll = allDisplayedSelected;
    }

    this.updateBatchActionBar();
  },

  /**
   * Toggle selezione tutti (opera solo sugli esploratori visibili dai filtri)
   */
  UI.toggleSelectAll = function (checked) {
    if (!this.batchSelection) {
      this.batchSelection = {
        selectedScoutIds: new Set(),
        selectedActivityId: null,
        isSelectAll: false
      };
    }

    this.batchSelection.isSelectAll = checked;
    const targetScouts = this._lastRenderedScouts || this.state.scouts || [];

    if (checked) {
      // Seleziona tutti gli esploratori visibili
      targetScouts.forEach(s => {
        this.batchSelection.selectedScoutIds.add(s.id);
        const row = this.qs(`tr[data-scout-id="${s.id}"]`);
        if (row) {
          row.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
          const checkbox = row.querySelector('.batch-checkbox');
          if (checkbox) checkbox.checked = true;
        }
      });
    } else {
      // Deseleziona gli esploratori visibili
      targetScouts.forEach(s => {
        this.batchSelection.selectedScoutIds.delete(s.id);
        const row = this.qs(`tr[data-scout-id="${s.id}"]`);
        if (row) {
          row.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
          const checkbox = row.querySelector('.batch-checkbox');
          if (checkbox) checkbox.checked = false;
        }
      });
    }

    this.updateBatchActionBar();
  },

  /**
   * Pulisce selezione batch
   */
  UI.clearBatchSelection = function () {
    if (this.batchSelection) {
      this.batchSelection.selectedScoutIds.clear();
      this.batchSelection.isSelectAll = false;
    }

    // Aggiorna UI
    const selectAllCheckbox = this.qs('#selectAllCheckbox');
    if (selectAllCheckbox) selectAllCheckbox.checked = false;

    this.qs('#presenceTableBody')?.querySelectorAll('tr[data-scout-id]').forEach(row => {
      row.classList.remove('bg-blue-50', 'dark:bg-blue-900/20');
      const checkbox = row.querySelector('.batch-checkbox');
      if (checkbox) checkbox.checked = false;
    });

    this.updateBatchActionBar();
  },

  /**
   * Aggiorna barra azioni batch
   */
  UI.updateBatchActionBar = function () {
    const bar = this.qs('#batchActionBar');
    const countSpan = this.qs('#batchSelectionCount');
    const markPresentBtn = this.qs('#batchMarkPresentBtn');
    const markAbsentBtn = this.qs('#batchMarkAbsentBtn');
    const applyPaymentBtn = this.qs('#batchApplyPaymentBtn');

    if (!bar || !countSpan) return;

    const count = this.batchSelection?.selectedScoutIds?.size || 0;
    const hasSelection = count > 0;
    const hasActivity = !!this.batchSelection?.selectedActivityId;

    // Mostra/nascondi barra
    if (hasSelection) {
      bar.classList.remove('hidden');
      countSpan.textContent = count;
    } else {
      bar.classList.add('hidden');
    }

    // Abilita/disabilita pulsanti che richiedono attività
    if (markPresentBtn) markPresentBtn.disabled = !hasSelection || !hasActivity;
    if (markAbsentBtn) markAbsentBtn.disabled = !hasSelection || !hasActivity;
    if (applyPaymentBtn) {
      // Verifica se l'attività selezionata ha un costo
      if (hasActivity) {
        const activity = (this.state.activities || []).find(a => a.id === this.batchSelection.selectedActivityId);
        applyPaymentBtn.disabled = !hasSelection || !activity || parseFloat(activity.costo || '0') <= 0;
      } else {
        applyPaymentBtn.disabled = true;
      }
    }
  },

  /**
   * Esegue azione batch
   */
  UI.executeBatchAction = async function (action) {
    if (!this.currentUser) {
      this.showToast('Devi essere loggato per eseguire operazioni batch', { type: 'error' });
      return;
    }

    const selectedIds = Array.from(this.batchSelection?.selectedScoutIds || []);
    if (selectedIds.length === 0) {
      this.showToast('Seleziona almeno un esploratore', { type: 'error' });
      return;
    }

    const activityId = this.batchSelection?.selectedActivityId;
    if (!activityId && action !== 'export') {
      this.showToast('Seleziona un\'attività', { type: 'error' });
      return;
    }

    this._batchOperationCancelled = false;
    this.showBatchProgress(0, `Inizio operazione batch: ${action}...`);

    try {
      switch (action) {
        case 'markPresent':
          await this.batchMarkPresent(selectedIds, activityId);
          break;
        case 'markAbsent':
          await this.batchMarkAbsent(selectedIds, activityId);
          break;
        case 'applyPayment':
          await this.batchApplyPayment(selectedIds, activityId);
          break;
        case 'export':
          await this.batchExport(selectedIds);
          break;
      }

      if (!this._batchOperationCancelled) {
        this.showToast(`Operazione completata su ${selectedIds.length} esploratore/i`, { type: 'success' });
        // Ricarica dati
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderPresenceTable();
      }
    } catch (error) {
      console.error('Errore operazione batch:', error);
      this.showToast('Errore durante operazione batch: ' + (error.message || 'Errore sconosciuto'), { type: 'error' });
    } finally {
      this.hideBatchProgress();
    }
  },

  /**
   * Segna presenti in batch
   */
  UI.batchMarkPresent = async function (scoutIds, activityId) {
    const total = scoutIds.length;
    for (let i = 0; i < total; i++) {
      if (this._batchOperationCancelled) break;

      const scoutId = scoutIds[i];
      await DATA.updatePresence({ field: 'stato', value: 'Presente', scoutId, activityId }, this.currentUser);

      this.showBatchProgress(Math.round(((i + 1) / total) * 100), `Segnato presente: ${i + 1}/${total}`);
      // Piccolo delay per non sovraccaricare Firestore
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  },

  /**
   * Segna assenti in batch
   */
  UI.batchMarkAbsent = async function (scoutIds, activityId) {
    const total = scoutIds.length;
    for (let i = 0; i < total; i++) {
      if (this._batchOperationCancelled) break;

      const scoutId = scoutIds[i];
      await DATA.updatePresence({ field: 'stato', value: 'Assente', scoutId, activityId }, this.currentUser);

      this.showBatchProgress(Math.round(((i + 1) / total) * 100), `Segnato assente: ${i + 1}/${total}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  },

  /**
   * Applica pagamento in batch
   */
  UI.batchApplyPayment = async function (scoutIds, activityId) {
    // Chiedi tipo pagamento
    const paymentType = await this.promptPaymentType();
    if (!paymentType) return;

    const total = scoutIds.length;
    for (let i = 0; i < total; i++) {
      if (this._batchOperationCancelled) break;

      const scoutId = scoutIds[i];
      await DATA.updatePresence({ field: 'pagato', value: true, scoutId, activityId }, this.currentUser);
      await DATA.updatePresence({ field: 'tipoPagamento', value: paymentType, scoutId, activityId }, this.currentUser);

      this.showBatchProgress(Math.round(((i + 1) / total) * 100), `Pagamento applicato: ${i + 1}/${total}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  },

  /**
   * Prompt tipo pagamento (usa modale invece di prompt)
   */
  UI.promptPaymentType = async function () {
    return new Promise((resolve) => {
      const types = ['Contanti', 'Satispay', 'Bonifico'];
      // Usa confirmModal per scegliere tipo pagamento
      this.showConfirmModal({
        title: 'Scegli Tipo Pagamento',
        message: 'Seleziona il tipo di pagamento da applicare:',
        confirmText: 'Contanti',
        cancelText: 'Annulla',
        onConfirm: () => resolve('Contanti'),
        onCancel: () => {
          // Mostra altri due bottoni per Satispay e Bonifico
          // Per semplicità, risolviamo con Contanti di default
          // In futuro si può migliorare con modale custom
          resolve(null);
        },
        customButtons: [
          { text: 'Satispay', action: () => resolve('Satispay'), class: 'btn-secondary' },
          { text: 'Bonifico', action: () => resolve('Bonifico'), class: 'btn-secondary' }
        ]
      });
      // Per ora, usiamo un approccio semplificato: chiediamo con modale custom
      // Creiamo modale temporaneo
      const modalId = 'batchPaymentTypeModal';
      const existing = this.qs(`#${modalId}`);
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal show';
      modal.innerHTML = `
        <div class="modal-content max-w-sm mx-auto">
          <h4 class="text-xl font-semibold text-gray-700 mb-4">Scegli Tipo Pagamento</h4>
          <div class="space-y-2">
            <button class="w-full btn-primary" data-type="Contanti">💵 Contanti</button>
            <button class="w-full btn-secondary" data-type="Satispay">📱 Satispay</button>
            <button class="w-full btn-secondary" data-type="Bonifico">🏦 Bonifico</button>
            <button class="w-full btn-secondary mt-4" data-type="cancel">Annulla</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
          resolve(null);
        }
        const button = e.target.closest('button[data-type]');
        if (button) {
          const type = button.getAttribute('data-type');
          modal.remove();
          resolve(type === 'cancel' ? null : type);
        }
      });
    });
  },

  /**
   * Esporta selezionati in CSV
   */
  UI.batchExport = async function (scoutIds) {
    const selectedScouts = (this.state.scouts || []).filter(s => scoutIds.includes(s.id));
    // Esporta CSV per gli esploratori selezionati
    this.exportSelectedScoutsToCSV(selectedScouts);
  };

  /**
   * Apre il modale di esportazione avanzata presenze
   */
  UI.openExportModal = function () {
    const filteredScouts = this._lastRenderedScouts || this.state.scouts || [];
    const totalScouts = (this.state.scouts || []).length;
    const selectedCount = this.batchSelection?.selectedScoutIds?.size || 0;
    const filteredActs = this._lastRenderedActs || this.getActivitiesSorted() || [];
    const totalActs = (this.state.activities || []).length;

    const flScout = this.qs('#exportScopeFilteredLabel');
    if (flScout) flScout.textContent = `Esploratori visibili dai filtri attivi (${filteredScouts.length})`;
    const allScout = this.qs('#exportScopeAllLabel');
    if (allScout) allScout.textContent = `Tutti gli esploratori (${totalScouts})`;
    const selScout = this.qs('#exportScopeSelectedLabel');
    if (selScout) selScout.textContent = `Solo esploratori selezionati con checkbox (${selectedCount})`;
    
    const selRadio = this.qs('#exportScopeSelectedRadio');
    if (selRadio) {
      selRadio.disabled = selectedCount === 0;
      if (selectedCount > 0) {
        selRadio.checked = true;
      }
    }

    const flAct = this.qs('#exportActsScopeFilteredLabel');
    if (flAct) flAct.textContent = `Attività visibili dai filtri attivi (${filteredActs.length})`;
    const allAct = this.qs('#exportActsScopeAllLabel');
    if (allAct) allAct.textContent = `Tutte le attività dell'anno (${totalActs})`;

    this.showModal('exportPresenzeModal');
  };

  /**
   * Esegue l'esportazione avanzata secondo le opzioni scelte nel modale
   */
  UI.executeAdvancedPresenzeExport = function () {
    const format = this.qs('input[name="exportFormat"]:checked')?.value || 'excel';
    const scoutsScope = this.qs('input[name="exportScoutsScope"]:checked')?.value || 'filtered';
    const actsScope = this.qs('input[name="exportActsScope"]:checked')?.value || 'filtered';
    const includePatrol = this.qs('#exportColPatrol')?.checked ?? true;
    const includeStats = this.qs('#exportColStats')?.checked ?? true;
    const includePayments = this.qs('#exportColPayments')?.checked ?? false;
    const verboseStatus = this.qs('#exportVerboseStatus')?.checked ?? false;

    // Risoluzione esploratori da esportare
    let targetScouts = [];
    if (scoutsScope === 'selected') {
      const selIds = this.batchSelection?.selectedScoutIds || new Set();
      targetScouts = (this.state.scouts || []).filter(s => selIds.has(s.id));
    } else if (scoutsScope === 'filtered') {
      targetScouts = this._lastRenderedScouts || this.state.scouts || [];
    } else {
      targetScouts = this.state.scouts || [];
    }

    if (targetScouts.length === 0) {
      this.showToast('Nessun esploratore selezionato per l\'esportazione', { type: 'error' });
      return;
    }

    // Ordina alfabeticamente per cognome e nome
    targetScouts = [...targetScouts].sort((a, b) => {
      const an = `${a.cognome || ''} ${a.nome || ''}`.toLowerCase();
      const bn = `${b.cognome || ''} ${b.nome || ''}`.toLowerCase();
      return an.localeCompare(bn);
    });

    // Risoluzione attività da esportare
    let targetActs = [];
    if (actsScope === 'filtered') {
      targetActs = this._lastRenderedActs || this.getActivitiesSorted();
    } else {
      targetActs = this.getActivitiesSorted();
    }

    const delimiter = format === 'excel' ? ';' : ',';

    // Intestazioni
    const headers = ['Cognome Nome'];
    if (includePatrol) headers.push('Pattuglia');
    if (includeStats) {
      headers.push('Presenze Effettive', 'Assenze', '% Presenza');
    }

    targetActs.forEach(a => {
      const d = this.toJsDate(a.data);
      const dateStr = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      headers.push(`${a.tipo} (${dateStr})`);
    });

    const allPresences = this.getDedupedPresences();

    // Costruzione righe
    const rows = targetScouts.map(s => {
      const row = [`${s.cognome || ''} ${s.nome || ''}`.trim()];
      if (includePatrol) row.push(s.pv_pattuglia || '');

      // Calcolo statistiche scout sulle attività considerate
      const scoutPresences = allPresences.filter(p => p.esploratoreId === s.id);
      let presCount = 0;
      let absCount = 0;
      let expectedCount = 0;

      targetActs.forEach(act => {
        const isExcludedType = ['Evento Adulti', 'Riunione Adulti', 'Eventi con esterni'].includes(act.tipo);
        if (isExcludedType) return;
        const p = scoutPresences.find(pr => pr.attivitaId === act.id);
        if (!p) return;
        if (p.stato === 'Presente') {
          presCount++;
          expectedCount++;
        } else if (p.stato === 'Assente') {
          absCount++;
          expectedCount++;
        }
      });

      const perc = expectedCount > 0 ? Math.round((presCount / expectedCount) * 100) : 0;
      if (includeStats) {
        row.push(presCount, absCount, `${perc}%`);
      }

      // Valori presenze per colonna attività
      targetActs.forEach(act => {
        const p = this.getPresence(s.id, act.id);
        if (!p || p.stato === 'NR' || !p.stato) {
          row.push('');
        } else if (p.stato === 'X') {
          row.push(verboseStatus ? 'Non Previsto' : 'X');
        } else {
          let text = p.stato === 'Presente' ? (verboseStatus ? 'Presente' : 'P') : (verboseStatus ? 'Assente' : 'A');
          if (includePayments && parseFloat(act.costo || '0') > 0) {
            if (p.pagato) {
              text += ` [Pagato${p.tipoPagamento ? ' - ' + p.tipoPagamento : ''}]`;
            } else {
              text += ` [Da saldare € ${act.costo}]`;
            }
          }
          row.push(text);
        }
      });

      return row;
    });

    const escapeCell = cell => {
      const str = cell == null ? '' : String(cell);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const csvContent = [headers, ...rows]
      .map(r => r.map(escapeCell).join(delimiter))
      .join('\r\n');

    // Prepend BOM per Excel
    const fileData = format === 'excel' ? '\uFEFF' + csvContent : csvContent;
    const blob = new Blob([fileData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `registro_presenze_${todayStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.closeModal('exportPresenzeModal');
    this.showToast(`Registro esportato per ${targetScouts.length} esploratori e ${targetActs.length} attività!`, { type: 'success' });
  };

  /**
   * Esporta CSV per esploratori selezionati (con formato Excel compatibile)
   */
  UI.exportSelectedScoutsToCSV = function (selectedScouts) {
    if (!selectedScouts || selectedScouts.length === 0) {
      this.showToast('Nessun esploratore selezionato', { type: 'error' });
      return;
    }

    const acts = this._lastRenderedActs || this.getActivitiesSorted();
    const headers = ['Esploratore', 'Pattuglia', ...acts.map(a => {
      const d = this.toJsDate(a.data);
      return isNaN(d) ? a.tipo : `${a.tipo} (${d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })})`;
    })];

    const rows = selectedScouts.map(s => {
      const scoutName = `${s.cognome || ''} ${s.nome || ''}`.trim();
      const patrol = s.pv_pattuglia || '';
      const presences = acts.map(a => {
        const p = this.getPresence(s.id, a.id);
        if (!p || p.stato === 'NR') return '';
        if (p.stato === 'X') return 'X';
        return p.stato === 'Presente' ? 'P' : 'A';
      });
      return [scoutName, patrol, ...presences];
    });

    const delimiter = ';';
    const escapeCell = cell => `"${String(cell == null ? '' : cell).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map(row => row.map(escapeCell).join(delimiter)).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `presenze_selezionate_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast(`CSV esportato per ${selectedScouts.length} esploratore/i`, { type: 'success' });
  };

  /**
   * Mostra progress indicator batch
   */
  UI.showBatchProgress = function (percent, message) {
    const indicator = this.qs('#batchProgressIndicator');
    const progressBar = this.qs('#batchProgressBar');
    const progressMessage = this.qs('#batchProgressMessage');

    if (indicator) indicator.classList.remove('hidden');
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressMessage) progressMessage.textContent = message || 'Elaborazione in corso...';
  };

  /**
   * Nasconde progress indicator batch
   */
  UI.hideBatchProgress = function () {
    const indicator = this.qs('#batchProgressIndicator');
    if (indicator) indicator.classList.add('hidden');
    this._batchOperationCancelled = false;
  };

/**
 * Esporta tutte le presenze in CSV o apre il modale
 */
UI.exportToCSV = function () {
  this.openExportModal();
};

// Inizializza la pagina presenze
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pagina Presenze caricata');
});
