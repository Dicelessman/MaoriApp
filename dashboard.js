// dashboard.js - Logica unificata per Dashboard & Statistiche

// Helper conversione data
UI.toJsDate = function (x) {
  if (!x) return null;
  if (x instanceof Date) return x;
  if (x && x.toDate) return x.toDate();
  const d = new Date(x);
  return isNaN(d.getTime()) ? null : d;
};

// Helper calcolo età
UI.getAnnoEsploratore = function (dob) {
  if (!dob) return null;
  const birthDate = this.toJsDate(dob);
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper calcolo anno scout in base all'età
UI.getAnnoScout = function (dob) {
  const age = this.getAnnoEsploratore(dob);
  if (age === null) return null;
  if (age >= 11 && age <= 12) return 'I°';
  if (age === 13) return 'II°';
  if (age === 14) return 'III°';
  if (age === 15) return 'IV°';
  return null;
};

// Helper per determinare l'anno scout in corso (priorità all'anno calcolato, o al più recente con attività)
UI.getCurrentScoutYearSmart = function () {
  const calculatedCurrent = typeof this.getCurrentScoutYear === 'function' ? this.getCurrentScoutYear() : null;
  const activities = this.state.activities || [];

  if (activities.length === 0) {
    return calculatedCurrent || '2025/2026';
  }

  // Se l'anno scout calcolato ha attività, usalo sicuramente
  if (calculatedCurrent && activities.some(a => this.isActivityInScoutYear ? this.isActivityInScoutYear(a, calculatedCurrent) : false)) {
    return calculatedCurrent;
  }

  // Altrimenti controlla se l'anno scout calcolato è '2025/2026' o '2026/2027'
  const allYears = typeof this.getAllScoutYears === 'function' ? this.getAllScoutYears(activities) : [];
  const yearsWithActs = allYears.filter(y => y !== 'all' && activities.some(a => this.isActivityInScoutYear ? this.isActivityInScoutYear(a, y) : false));

  if (yearsWithActs.length > 0) {
    return yearsWithActs[0]; // l'anno più recente che ha attività registrate
  }

  return calculatedCurrent || '2025/2026';
};

// Helper gestione selettore Anno Scout
UI.setupStatsScoutYearSelector = function () {
  const select = document.getElementById('statsScoutYearSelect');
  if (!select) return;

  const currentScoutYear = this.getCurrentScoutYearSmart();
  const allYears = typeof this.getAllScoutYears === 'function' ? this.getAllScoutYears(this.state.activities) : [currentScoutYear];

  // Assicura che l'anno corrente sia in cima alla lista
  if (!allYears.includes(currentScoutYear)) {
    allYears.unshift(currentScoutYear);
  }

  // Punta SEMPRE di default all'anno scout in corso
  if (!this.selectedStatsScoutYear) {
    this.selectedStatsScoutYear = currentScoutYear;
  }

  select.innerHTML = '';
  allYears.forEach(year => {
    const isCurrent = year === currentScoutYear;
    const label = isCurrent ? `${year} (In corso)` : `${year} (Archiviato)`;
    const opt = document.createElement('option');
    opt.value = year;
    opt.textContent = label;
    if (year === this.selectedStatsScoutYear) opt.selected = true;
    select.appendChild(opt);
  });

  const allOpt = document.createElement('option');
  allOpt.value = 'all';
  allOpt.textContent = 'Tutti gli anni (Globale)';
  if (this.selectedStatsScoutYear === 'all') allOpt.selected = true;
  select.appendChild(allOpt);

  const archiveBadge = document.getElementById('statsArchiveBadge');
  if (archiveBadge) {
    const isArchive = this.selectedStatsScoutYear !== 'all' && this.selectedStatsScoutYear !== currentScoutYear;
    archiveBadge.classList.toggle('hidden', !isArchive);
  }

  if (!select._bound) {
    select._bound = true;
    select.addEventListener('change', async (e) => {
      this.selectedStatsScoutYear = e.target.value;
      if (this.setSelectedScoutYear && e.target.value !== 'all') {
        await this.setSelectedScoutYear(e.target.value);
      }
      this.renderCurrentPage();
    });
  }
};

// Gestione distruzione grafici
UI._charts = UI._charts || { scout: null, activity: null };
UI._destroyCharts = function () {
  try { if (this._charts.scout) { this._charts.scout.destroy(); this._charts.scout = null; } } catch { }
  try { if (this._charts.activity) { this._charts.activity.destroy(); this._charts.activity = null; } } catch { }
};

// Funzione principale di rendering della pagina Dashboard
UI.renderCurrentPage = function () {
  this.setupStatsScoutYearSelector();
  this.renderDashboardCharts();
  this.renderAttendanceGrid();
  this.renderTotaleEsploratoriWidget();
  this.renderProgressioniWidget();
  this.renderComposizionePattuglia();
  this.renderPattuglieTable();
  this.renderRiepilogoSpecialita();
};


// 1. Presenza per Esploratore & 2. Presenza per Attività
UI.renderDashboardCharts = function () {
  const scouts = this.state.scouts || [];
  const activities = this.state.activities || [];
  const presences = this.getDedupedPresences ? this.getDedupedPresences() : (this.state.presences || []);

  const ctxScout = document.getElementById('scoutPresenceChart');
  const ctxActivity = document.getElementById('activityPresenceChart');
  if (!ctxScout || !ctxActivity) return;

  this._destroyCharts();

  const currentScoutYear = this.getCurrentScoutYearSmart();
  const selectedYear = this.selectedStatsScoutYear || currentScoutYear;
  const isAll = selectedYear === 'all';
  const toDate = (v) => this.toJsDate(v) || new Date(v);

  const sortedActivities = [...activities]
    .filter(a => isAll || (this.isActivityInScoutYear ? this.isActivityInScoutYear(a, selectedYear) : true))
    .sort((a, b) => toDate(a.data) - toDate(b.data));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextActivityId = null;
  sortedActivities.forEach(a => {
    const ad = toDate(a.data);
    const aday = new Date(ad);
    aday.setHours(0, 0, 0, 0);
    if (nextActivityId === null && aday >= today) {
      nextActivityId = a.id;
    }
  });

  const pastIds = sortedActivities.filter(a => {
    const ad = toDate(a.data);
    const aday = new Date(ad);
    aday.setHours(0, 0, 0, 0);
    return aday < today;
  }).map(a => a.id);

  let consideredIds = nextActivityId ? [...pastIds, nextActivityId] : pastIds;
  if (consideredIds.length === 0 && sortedActivities.length > 0) {
    consideredIds = sortedActivities.map(a => a.id);
  }

  const scoutStats = scouts.map(s => {
    const validActIds = consideredIds.filter(aid => {
      const pr = presences.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = presences.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    const perc = totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
    const name = `${s.nome || ''} ${s.cognome || ''}`.trim() || 'Esploratore';
    return { name, perc, presentCount, totalActsConsidered };
  });

  // Ordina per percentuale decrescente
  scoutStats.sort((a, b) => b.perc - a.perc);

  const scoutLabels = scoutStats.map(s => s.name);
  const scoutPerc = scoutStats.map(s => s.perc);
  const scoutColors = scoutPerc.map(perc => {
    if (perc >= 75) return '#16a34a'; // verde
    if (perc >= 60) return '#eab308'; // giallo
    return '#dc2626'; // rosso
  });

  // Dati per grafico Presenze per Attività
  const actLabels = sortedActivities.map(a => {
    const d = toDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${a.tipo}: ${a.descrizione || ''}\n${ds}`;
  });
  const actData = sortedActivities.map(a => presences.filter(p => p.attivitaId === a.id && p.stato === 'Presente').length);

  // Plugin ChartDataLabels
  const ChartDataLabels = window.ChartDataLabels;
  if (window.Chart && ChartDataLabels) {
    window.Chart.register(ChartDataLabels);
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 12, bottom: 8, left: 12 } },
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        formatter: v => v > 0 ? (typeof v === 'number' && v <= 100 ? v.toFixed(1) + '%' : v) : '',
        anchor: 'end', align: 'end', offset: -5, font: { weight: 'bold' }
      }
    },
    elements: { bar: { borderRadius: 4, maxBarThickness: 28 } }
  };

  // 1. Grafico Presenza per Esploratore
  this._charts.scout = new window.Chart(ctxScout.getContext('2d'), {
    type: 'bar',
    data: {
      labels: scoutLabels,
      datasets: [{
        label: 'Presenze',
        data: scoutPerc,
        backgroundColor: scoutColors
      }]
    },
    options: {
      ...commonOptions,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } },
        y: { ticks: { autoSkip: false, maxTicksLimit: 25 } }
      },
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          callbacks: {
            label: function (context) {
              const stat = scoutStats[context.dataIndex];
              return ` ${stat.perc}% (${stat.presentCount} / ${stat.totalActsConsidered} attività)`;
            }
          }
        }
      }
    }
  });

  // 2. Grafico Presenza per Attività
  this._charts.activity = new window.Chart(ctxActivity.getContext('2d'), {
    type: 'bar',
    data: {
      labels: actLabels,
      datasets: [{ label: 'Presenze', data: actData, backgroundColor: '#16a34a' }]
    },
    options: {
      ...commonOptions,
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, max: Math.max(1, scouts.length) },
        y: { ticks: { autoSkip: false, maxTicksLimit: 25 } }
      },
      plugins: {
        ...commonOptions.plugins,
        datalabels: {
          ...commonOptions.plugins.datalabels,
          formatter: v => v > 0 ? `${v} / ${scouts.length}` : ''
        }
      }
    }
  });
};


// 3. Dettaglio Presenze
UI.renderAttendanceGrid = function () {
  const container = document.getElementById('attendanceGrid');
  if (!container) return;

  const scouts = this.state.scouts || [];
  const activities = this.state.activities || [];
  const presences = this.getDedupedPresences ? this.getDedupedPresences() : (this.state.presences || []);

  if (scouts.length === 0) {
    container.innerHTML = '<p class="text-gray-500 italic p-4">Nessun esploratore registrato.</p>';
    return;
  }

  const toDate = (v) => this.toJsDate(v) || new Date(v);
  const currentScoutYear = this.getCurrentScoutYearSmart();
  const selectedYear = this.selectedStatsScoutYear || currentScoutYear;
  const isAll = selectedYear === 'all';

  // Tutte le attività dell'anno scout selezionato
  const yearActivities = [...activities]
    .filter(a => isAll || (this.isActivityInScoutYear ? this.isActivityInScoutYear(a, selectedYear) : true))
    .sort((a, b) => toDate(a.data) - toDate(b.data));

  if (yearActivities.length === 0) {
    container.innerHTML = `<p class="text-gray-500 italic p-4">Nessuna attività registrata per l'anno scout ${selectedYear}.</p>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mostra le attività passate/odierne, oppure quelle che hanno già presenze registrate
  const pastOrRecordedActivities = yearActivities.filter(a => {
    const aday = new Date(toDate(a.data));
    aday.setHours(0, 0, 0, 0);
    const hasPresences = presences.some(p => p.attivitaId === a.id && (p.stato === 'Presente' || p.stato === 'Assente'));
    return aday <= today || hasPresences;
  });

  // Se ci sono attività passate/registrate usa quelle, altrimenti mostra tutte le attività dell'anno
  const activitiesToShow = pastOrRecordedActivities.length > 0 ? pastOrRecordedActivities : yearActivities;

  const actIds = activitiesToShow.map(a => a.id);
  const sortedScouts = [...scouts].map(s => {
    const validActIds = actIds.filter(aid => {
      const pr = presences.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = presences.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    const perc = totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
    return { ...s, perc };
  }).sort((a, b) => b.perc - a.perc);

  let html = '<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';
  html += '<thead><tr class="bg-gray-100 dark:bg-gray-700/60">';
  html += '<th class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 w-44 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>';

  activitiesToShow.forEach(a => {
    const d = toDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    html += `<th class="p-1.5 border border-gray-200 dark:border-gray-700 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[65px]" title="${a.tipo}: ${a.descrizione || ''}">${ds}</th>`;
  });
  html += '</tr></thead><tbody>';

  sortedScouts.forEach(s => {
    const scoutName = `${s.nome || ''} ${s.cognome || ''}`.trim() || 'Esploratore';
    const linkName = s.id
      ? `<a href="scout2.html?id=${encodeURIComponent(s.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline">${scoutName}</a>`
      : scoutName;

    html += `<tr><td class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium text-gray-800 dark:text-gray-200 shadow-[1px_0_0_0_#e5e7eb]">${linkName}</td>`;

    activitiesToShow.forEach(a => {
      const pr = presences.find(p => p.esploratoreId === s.id && p.attivitaId === a.id);
      let colorClass = 'bg-white dark:bg-gray-700';
      let tooltip = 'Dato non inserito';

      if (pr) {
        if (pr.stato === 'Presente') {
          colorClass = 'bg-green-500';
          tooltip = 'Presente';
        } else if (pr.stato === 'Assente') {
          colorClass = 'bg-red-500';
          tooltip = 'Assente';
        } else if (pr.stato.toLowerCase() === 'x' || pr.stato === 'NR' || pr.stato.toLowerCase() === 'giustificato') {
          colorClass = 'bg-gray-400';
          tooltip = 'Non tenuto a esserci / Giustificato';
        } else {
          colorClass = 'bg-gray-400';
          tooltip = pr.stato;
        }
      }

      html += `<td class="p-1.5 border border-gray-200 dark:border-gray-700 text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${colorClass}" title="${tooltip}"></div>
               </td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Legenda
  html += `
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div> Dato mancante</div>
    </div>
  `;

  container.innerHTML = html;
};


// 4. Totale Esploratori (con distribuzione sesso marcata e distribuzione per anno inglobata)
UI.renderTotaleEsploratoriWidget = function () {
  const container = document.getElementById('totaleEsploratoriWidget');
  if (!container) return;

  const scouts = this.state.scouts || [];
  const totalScouts = scouts.length;

  if (totalScouts === 0) {
    container.innerHTML = '<p class="text-gray-500 italic">Nessun esploratore registrato.</p>';
    return;
  }

  // Statistiche Sesso
  const maschi = scouts.filter(s => s.anag_sesso?.toLowerCase()?.trim() === 'maschio').length;
  const femmine = scouts.filter(s => s.anag_sesso?.toLowerCase()?.trim() === 'femmina').length;
  const altro = totalScouts - maschi - femmine;

  const mPerc = Math.round((maschi / totalScouts) * 100);
  const fPerc = Math.round((femmine / totalScouts) * 100);
  const altroPerc = altro > 0 ? Math.round((altro / totalScouts) * 100) : 0;

  // Statistiche per Anno Scout (I°, II°, III°, IV°) ed Età
  const anniScoutCounts = { 'I°': 0, 'II°': 0, 'III°': 0, 'IV°': 0, 'Altro': 0 };
  const ages = [];

  scouts.forEach(s => {
    const annoScout = this.getAnnoScout(s.anag_dob);
    if (annoScout && anniScoutCounts[annoScout] !== undefined) {
      anniScoutCounts[annoScout]++;
    } else {
      anniScoutCounts['Altro']++;
    }

    const age = this.getAnnoEsploratore(s.anag_dob);
    if (age !== null) ages.push(age);
  });

  const avgAge = ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '—';
  const minAge = ages.length > 0 ? Math.min(...ages) : null;
  const maxAge = ages.length > 0 ? Math.max(...ages) : null;

  container.innerHTML = `
    <div class="space-y-5">
      <!-- 1. Conteggi principali con sesso evidenziato -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Totale Esploratori Card -->
        <div class="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p class="text-green-100 text-xs font-bold uppercase tracking-wider">Censiti in Reparto</p>
            <p class="text-4xl font-extrabold mt-1">${totalScouts}</p>
            <p class="text-green-200 text-xs mt-1">Totale esploratori attivi</p>
          </div>
          <div class="text-4xl opacity-85">👥</div>
        </div>

        <!-- Maschi Card -->
        <div class="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 rounded-xl shadow-xs">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <span>♂</span> Maschi
              </span>
              <p class="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">${maschi}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
              ${mPerc}%
            </span>
          </div>
          <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style="width: ${mPerc}%"></div>
          </div>
        </div>

        <!-- Femmine Card -->
        <div class="bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 p-5 rounded-xl shadow-xs">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                <span>♀</span> Femmine
              </span>
              <p class="text-3xl font-extrabold text-pink-900 dark:text-pink-100 mt-1">${femmine}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700">
              ${fPerc}%
            </span>
          </div>
          <div class="w-full bg-pink-200 dark:bg-pink-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-pink-500 h-2.5 rounded-full transition-all duration-500" style="width: ${fPerc}%"></div>
          </div>
        </div>
      </div>

      <!-- 2. Barra di bilanciamento di genere -->
      <div class="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs font-bold mb-2">
          <span class="text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <span>♂</span> Maschi: ${maschi} (${mPerc}%)
          </span>
          ${altro > 0 ? `<span class="text-gray-500 dark:text-gray-400">Non reg.: ${altro} (${altroPerc}%)</span>` : ''}
          <span class="text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <span>♀</span> Femmine: ${femmine} (${fPerc}%)
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
          <div class="bg-blue-600 h-3 transition-all duration-500" style="width: ${mPerc}%" title="Maschi ${mPerc}%"></div>
          ${altro > 0 ? `<div class="bg-gray-400 h-3 transition-all duration-500" style="width: ${altroPerc}%" title="Non reg. ${altroPerc}%"></div>` : ''}
          <div class="bg-pink-500 h-3 transition-all duration-500" style="width: ${fPerc}%" title="Femmine ${fPerc}%"></div>
        </div>
      </div>

      <!-- 3. Distribuzione per Anno Scout & Età -->
      <div class="bg-white dark:bg-gray-800/80 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>📅</span> Distribuzione per Anno Scout (Progressione per Età)
          </h4>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            Età media: <strong class="text-gray-800 dark:text-gray-100">${avgAge} anni</strong>
            ${minAge && maxAge ? ` · Range: ${minAge}-${maxAge} anni` : ''}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">I° Anno (11-12)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${anniScoutCounts['I°']}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round((anniScoutCounts['I°'] / totalScouts) * 100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">II° Anno (13)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${anniScoutCounts['II°']}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round((anniScoutCounts['II°'] / totalScouts) * 100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">III° Anno (14)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${anniScoutCounts['III°']}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round((anniScoutCounts['III°'] / totalScouts) * 100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">IV° Anno (15)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${anniScoutCounts['IV°']}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round((anniScoutCounts['IV°'] / totalScouts) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  `;
};


// 5. Progressioni (Passi e Specialità ottenuti nell'anno)
UI.renderProgressioniWidget = function () {
  const container = document.getElementById('progressioniWidget');
  if (!container) return;

  const scouts = this.state.scouts || [];
  const currentScoutYear = this.getCurrentScoutYearSmart();
  const selectedYear = this.selectedStatsScoutYear || currentScoutYear;
  const isAll = selectedYear === 'all';
  const range = this.getScoutYearDateRange ? this.getScoutYearDateRange(selectedYear) : null;
  const annoScoutLabel = isAll ? 'Tutti gli anni (Globale)' : `Anno Scout ${selectedYear}`;

  // Calcola Passi ottenuti nell'anno selezionato
  const passaggi = { 1: 0, 2: 0, 3: 0 };
  scouts.forEach(scout => {
    [1, 2, 3].forEach(passo => {
      const tr = scout[`pv_traccia${passo}`];
      if (tr && tr.done) {
        if (isAll) {
          passaggi[passo]++;
        } else if (tr.data) {
          const dt = this.toJsDate(tr.data);
          if (dt && range && dt >= range.start && dt <= range.end) {
            passaggi[passo]++;
          }
        } else if (selectedYear === currentScoutYear) {
          passaggi[passo]++;
        }
      }
    });
  });

  const totPassi = passaggi[1] + passaggi[2] + passaggi[3];

  // Calcola Specialità ottenute nell'anno selezionato
  let specialitaCount = 0;
  scouts.forEach(scout => {
    if (scout.specialita && Array.isArray(scout.specialita)) {
      scout.specialita.forEach(sp => {
        if (sp.ottenuta) {
          if (isAll) {
            specialitaCount++;
          } else if (sp.data) {
            const dt = this.toJsDate(sp.data);
            if (dt && range && dt >= range.start && dt <= range.end) {
              specialitaCount++;
            }
          } else if (selectedYear === currentScoutYear) {
            specialitaCount++;
          }
        }
      });
    }
  });

  const totProgressioni = totPassi + specialitaCount;

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Progressioni Conquistate</span>
          <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            ${totProgressioni} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">traguardi ottenuti</span>
          </h4>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
          📅 ${annoScoutLabel}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Passi Superati -->
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 p-5 rounded-xl shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">👣</span>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Passi Superati</span>
                <p class="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">${totPassi}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Progressione Verticale
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 text-center">
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">I° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${passaggi[1]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">II° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${passaggi[2]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">III° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${passaggi[3]}</span>
            </div>
          </div>
        </div>

        <!-- Card Specialità Ottenute -->
        <div class="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 p-5 rounded-xl shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">⭐</span>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">Specialità Ottenute</span>
                <p class="text-2xl font-extrabold text-purple-900 dark:text-purple-100">${specialitaCount}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
              Progressione Orizzontale
            </span>
          </div>
          <div class="mt-4 pt-3 border-t border-purple-200/60 dark:border-purple-800/60">
            <p class="text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
              <span>Brevetti e competenze conquistate</span>
              <span class="font-bold text-purple-900 dark:text-purple-100">${specialitaCount} specialità</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};


// 6. Composizione per Pattuglia (M/F)
UI.renderComposizionePattuglia = function () {
  const container = document.getElementById('totaliStats');
  if (!container) return;

  const scouts = this.state.scouts || [];
  const pattugliaMF = {};

  scouts.forEach(scout => {
    const patt = scout.pv_pattuglia || 'Non assegnata';
    if (!pattugliaMF[patt]) pattugliaMF[patt] = { m: 0, f: 0, altro: 0, tot: 0 };
    const sesso = scout.anag_sesso?.toLowerCase()?.trim();
    pattugliaMF[patt].tot++;
    if (sesso === 'maschio') pattugliaMF[patt].m++;
    else if (sesso === 'femmina') pattugliaMF[patt].f++;
    else pattugliaMF[patt].altro++;
  });

  const pattuglieOrd = Object.keys(pattugliaMF).sort((a, b) => {
    if (a === 'Non assegnata') return 1;
    if (b === 'Non assegnata') return -1;
    return a.localeCompare(b);
  });

  const rows = pattuglieOrd.map(p => {
    const d = pattugliaMF[p];

    let genereLabel = 'Non definita';
    let genereClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

    if (d.tot === 0) {
      genereLabel = 'Vuota';
    } else if (d.m > 0 && d.f === 0 && d.altro === 0) {
      genereLabel = '♂ Maschile';
      genereClass = 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700';
    } else if (d.f > 0 && d.m === 0 && d.altro === 0) {
      genereLabel = '♀ Femminile';
      genereClass = 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700';
    } else if (d.m > 0 && d.f > 0) {
      genereLabel = '⚥ Mista';
      genereClass = 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700';
    }

    return `
      <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">${p}</td>
        <td class="p-3 text-center font-bold text-gray-700 dark:text-gray-200">${d.tot}</td>
        <td class="p-3 text-center">
          <span class="inline-block px-3 py-1 text-xs font-bold rounded-full ${genereClass}">${genereLabel}</span>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b bg-gray-100 dark:bg-gray-700/60">
            <th class="text-left p-2.5 font-semibold text-gray-700 dark:text-gray-200">Pattuglia</th>
            <th class="text-center p-2.5 font-semibold text-gray-700 dark:text-gray-200">Totale Esploratori</th>
            <th class="text-center p-2.5 font-semibold text-gray-700 dark:text-gray-200">Identificativo Genere</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="3" class="p-4 text-center text-gray-500">Nessuna pattuglia trovata</td></tr>'}</tbody>
      </table>
    </div>
  `;
};


// 7. Esploratori per Pattuglia
UI.renderPattuglieTable = function (scoutsInput) {
  if (scoutsInput) {
    this._pattuglieTableScouts = scoutsInput;
  }
  const scouts = this._pattuglieTableScouts || this.state.scouts || [];

  if (!this._pattuglieSortState) {
    this._pattuglieSortState = { field: 'nome', direction: 'asc' };
  }

  const pattuglieMap = {};
  scouts.forEach(scout => {
    const pattuglia = scout.pv_pattuglia || 'Non assegnata';
    if (!pattuglieMap[pattuglia]) {
      pattuglieMap[pattuglia] = [];
    }

    const annoScout = this.getAnnoScout(scout.anag_dob);

    let passo = '-';
    if (scout.pv_traccia3?.done) passo = '3';
    else if (scout.pv_traccia2?.done) passo = '2';
    else if (scout.pv_traccia1?.done) passo = '1';

    let numSpecialita = 0;
    if (scout.specialita && Array.isArray(scout.specialita)) {
      numSpecialita = scout.specialita.filter(s => s.ottenuta).length;
    }

    const cpVcp = scout.pv_vcp_cp || '';

    pattuglieMap[pattuglia].push({
      id: scout.id,
      nome: `${scout.nome || ''} ${scout.cognome || ''}`.trim() || 'Nome non disponibile',
      annoScout: annoScout || 'N/A',
      cpVcp: cpVcp,
      passo: passo,
      numSpecialita: numSpecialita
    });
  });

  const sortField = this._pattuglieSortState.field;
  const sortDir = this._pattuglieSortState.direction;

  Object.keys(pattuglieMap).forEach(pattuglia => {
    pattuglieMap[pattuglia].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'nome') {
        comparison = a.nome.localeCompare(b.nome);
      } else if (sortField === 'annoScout') {
        const order = { 'I°': 1, 'II°': 2, 'III°': 3, 'IV°': 4, 'N/A': 5 };
        const aOrder = order[a.annoScout] || 5;
        const bOrder = order[b.annoScout] || 5;
        comparison = aOrder - bOrder;
        if (comparison === 0) {
          comparison = a.nome.localeCompare(b.nome);
        }
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  });

  const pattuglieSorted = Object.keys(pattuglieMap).sort((a, b) => {
    if (a === 'Non assegnata') return 1;
    if (b === 'Non assegnata') return -1;
    return a.localeCompare(b);
  });

  const sortNomeIcon = document.getElementById('sortNomeIcon');
  const sortAnnoScoutIcon = document.getElementById('sortAnnoScoutIcon');
  if (sortNomeIcon) {
    sortNomeIcon.textContent = sortField === 'nome' ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
  }
  if (sortAnnoScoutIcon) {
    sortAnnoScoutIcon.textContent = sortField === 'annoScout' ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
  }

  const tbody = document.getElementById('pattuglieTableBody');
  if (!tbody) return;

  let html = '';
  pattuglieSorted.forEach(pattuglia => {
    const esploratori = pattuglieMap[pattuglia];
    esploratori.forEach((esp, index) => {
      const link = esp.id
        ? `<a href="scout2.html?id=${encodeURIComponent(esp.id)}" class="text-green-700 dark:text-green-400 font-semibold hover:underline">${esp.nome}</a>`
        : `<span class="text-gray-800 dark:text-gray-200">${esp.nome}</span>`;

      html += `
        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
          ${index === 0 ? `<td class="p-2.5 font-semibold text-gray-800 dark:text-gray-100 align-top" rowspan="${esploratori.length}">${pattuglia}</td>` : ''}
          <td class="p-2.5">${link}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300">${esp.annoScout}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300 font-medium">${esp.cpVcp}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300">${esp.passo}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300 font-medium">${esp.numSpecialita}</td>
        </tr>
      `;
    });
  });

  tbody.innerHTML = html || '<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>';

  if (!this._pattuglieSortListenersAdded) {
    const sortNome = document.getElementById('sortNome');
    const sortAnnoScout = document.getElementById('sortAnnoScout');

    if (sortNome) {
      sortNome.addEventListener('click', () => {
        if (this._pattuglieSortState.field === 'nome') {
          this._pattuglieSortState.direction = this._pattuglieSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
          this._pattuglieSortState.field = 'nome';
          this._pattuglieSortState.direction = 'asc';
        }
        this.renderPattuglieTable();
      });
    }

    if (sortAnnoScout) {
      sortAnnoScout.addEventListener('click', () => {
        if (this._pattuglieSortState.field === 'annoScout') {
          this._pattuglieSortState.direction = this._pattuglieSortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
          this._pattuglieSortState.field = 'annoScout';
          this._pattuglieSortState.direction = 'asc';
        }
        this.renderPattuglieTable();
      });
    }

    this._pattuglieSortListenersAdded = true;
  }
};


// 8. Riepilogo Specialità
UI.renderRiepilogoSpecialita = function () {
  const container = document.getElementById('tempiSpecialitaStats');
  if (!container) return;

  const scouts = this.state.scouts || [];

  // Top 5 specialità più ottenute
  const specialitaCount = {};
  scouts.forEach(scout => {
    if (scout.specialita && Array.isArray(scout.specialita)) {
      scout.specialita.forEach(sp => {
        if (sp.ottenuta && sp.nome) {
          specialitaCount[sp.nome] = (specialitaCount[sp.nome] || 0) + 1;
        }
      });
    }
  });

  const top5 = Object.entries(specialitaCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Esploratori senza specialità
  const senzaSpecialita = scouts.filter(scout => {
    if (!scout.specialita || !Array.isArray(scout.specialita)) return true;
    return scout.specialita.filter(sp => sp.ottenuta).length === 0;
  });

  const top5Html = `
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🏅</span> Top 5 Specialità Conquistate
      </div>
      ${top5.length > 0
        ? `<ol class="space-y-2">
            ${top5.map(([nome, n], i) => `
              <li class="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span class="text-gray-700 dark:text-gray-300 font-medium">${i + 1}. ${nome}</span>
                <span class="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full text-xs">${n}</span>
              </li>`).join('')}
          </ol>`
        : '<p class="text-xs text-gray-500 italic">Nessuna specialità registrata.</p>'
      }
    </div>
  `;

  const senzaHtml = `
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
        <span class="flex items-center gap-2"><span>🎯</span> Senza specialità</span>
        <span class="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full text-xs">${senzaSpecialita.length}</span>
      </div>
      ${senzaSpecialita.length > 0
        ? `<ul class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-700">
            ${senzaSpecialita.map(s => {
              const name = `${s.nome || ''} ${s.cognome || ''}`.trim() || 'Esploratore';
              const patt = s.pv_pattuglia ? `(${s.pv_pattuglia})` : '';
              return `<li class="pt-1 flex items-center justify-between">
                <a href="scout2.html?id=${encodeURIComponent(s.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline font-medium">${name}</a>
                <span class="text-gray-400 text-[10px]">${patt}</span>
              </li>`;
            }).join('')}
          </ul>`
        : '<div class="text-xs text-green-600 dark:text-green-400 font-medium">Tutti gli esploratori hanno almeno una specialità! 🎉</div>'
      }
    </div>
  `;

  container.innerHTML = top5Html + senzaHtml;
};
