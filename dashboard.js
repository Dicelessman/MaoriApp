// dashboard.js - Logica specifica per la pagina Dashboard

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function () {
  this.renderNextActivityWidget();
  this.renderDashboardCharts();
  if (this.renderAttendanceGrid) {
    this.renderAttendanceGrid();
  }
};

UI.renderNextActivityWidget = function () {
  const container = document.getElementById('nextActivityContainer');
  if (!container) return;

  const activities = this.state.activities || [];
  const scouts = this.state.scouts || [];
  const presences = this.state.presences || [];

  const upcomingInfo = this.findUpcomingActivity ? this.findUpcomingActivity(activities) : null;
  if (!upcomingInfo || !upcomingInfo.activity) {
    container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-2xl mb-3">
          📅
        </div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">Nessuna attività programmata</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          Non sono presenti attività future nel calendario del reparto. Aggiungi la prossima riunione o uscita per sbloccare il monitoraggio presenze, quote e conformità medica.
        </p>
        <div class="mt-4">
          <a href="calendario.html" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800 shadow-sm transition">
            <span>➕</span>
            <span>Pianifica Nuova Attività</span>
          </a>
        </div>
      </div>
    `;
    return;
  }

  const { activity, isFuture, isPast, isToday, isTomorrow, diffDays, countdownText, badgeText, badgeClass } = upcomingInfo;
  const kpis = this.computeActivityDashboardKPIs ? this.computeActivityDashboardKPIs(activity, scouts, presences) : null;
  if (!kpis) return;

  const typeIcons = {
    'Riunione': '⏰',
    'Attività lunga': '🌲',
    'Uscita': '🥾',
    'Campo': '🏕️',
    'Evento Adulti': '⚜️',
    'Riunione Adulti': '📋',
    'Eventi con esterni': '🌟'
  };
  const icon = typeIcons[activity.tipo] || '📅';

  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  const actStart = toDate(activity.data);
  const dateFormatted = !isNaN(actStart.getTime())
    ? actStart.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data non definita';
  const dateStr = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const costNumber = Number(activity.costo) || 0;
  const costBadge = costNumber > 0
    ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300">Quota: € ${costNumber.toFixed(2)}</span>`
    : `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Gratuita</span>`;

  const attPerc = kpis.attendancePercentage;
  const attBarColor = attPerc >= 70 ? 'bg-emerald-600' : (attPerc >= 40 ? 'bg-amber-500' : 'bg-gray-400');

  const payPerc = kpis.paymentPercentage;
  const payBarColor = payPerc >= 80 ? 'bg-emerald-600' : (payPerc >= 50 ? 'bg-amber-500' : 'bg-rose-500');

  let medicalSectionHtml = '';
  if (!kpis.isSafetyCompliant && kpis.medicalAlerts.length > 0) {
    const alerts = kpis.medicalAlerts;
    medicalSectionHtml = `
      <div class="mt-5 p-4 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm animate-fade-in">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">⚠️</span>
            <div>
              <h4 class="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                Allarme Sicurezza Sanitaria (${alerts.length} partecipant${alerts.length === 1 ? 'e' : 'i'} non in regola)
              </h4>
              <p class="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Alcuni esploratori confermati presenti non hanno il certificato medico valido o i consensi necessari per questa data.
              </p>
            </div>
          </div>
          <button type="button" id="toggleMedicalAlertListBtn" class="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer flex-shrink-0">
            Mostra dettagli ▼
          </button>
        </div>

        <div id="medicalAlertListDetails" class="mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/60 divide-y divide-rose-100 dark:divide-rose-900/40">
          ${alerts.map(a => {
            const s = a.scout;
            const nomeCompleto = `${s.nome || ''} ${s.cognome || ''}`.trim() || 'Esploratore';
            const pattuglia = s.pv_pattuglia ? `(${s.pv_pattuglia})` : '';
            const missingText = a.missingDocuments.join(', ');
            return `
              <div class="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span class="font-bold text-gray-800 dark:text-gray-100">${nomeCompleto}</span>
                  <span class="text-gray-500 dark:text-gray-400 ml-1">${pattuglia}</span>
                  <div class="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    <span class="font-medium">${a.label}</span>: ${missingText}
                  </div>
                </div>
                <button type="button" onclick="UI.sendMedicalWhatsAppReminder('${s.id}')"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-xs transition cursor-pointer">
                  <span>💬</span>
                  <span>WhatsApp Genitore</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else if (kpis.presentCount > 0) {
    medicalSectionHtml = `
      <div class="mt-5 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium shadow-xs">
        <div class="flex items-center gap-2">
          <span class="text-base">🛡️</span>
          <span><strong>Sicurezza Sanitaria OK:</strong> Tutti i ${kpis.presentCount} esploratori presenti hanno certificato medico e documenti in regola.</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">CONFORME</span>
      </div>
    `;
  } else {
    medicalSectionHtml = `
      <div class="mt-5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span class="text-base">📋</span>
        <span>Nessun esploratore ancora segnato come presente. Registra le presenze per verificare la conformità medica.</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 border-2 border-green-600/30 dark:border-green-500/30 rounded-2xl p-5 sm:p-6 shadow-md transition relative overflow-hidden">
      <!-- Header Widget -->
      <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 flex items-center gap-1">
              <span>${icon}</span>
              <span>${activity.tipo}</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}">
              ${badgeText}
            </span>
            ${costBadge}
          </div>
          <h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white pt-1">
            ${activity.descrizione || activity.tipo}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>${dateStr}</span>
            ${activity.dataFine ? `<span class="text-gray-400">• Fine: ${toDate(activity.dataFine).toLocaleDateString('it-IT')}</span>` : ''}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <a href="presenze.html" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-green-700 text-white hover:bg-green-800 shadow-sm transition flex items-center gap-1.5">
            <span>✍️</span>
            <span>Gestisci Presenze</span>
          </a>
        </div>
      </div>

      <!-- Indicatori Operativi & Finanziari -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <!-- KPI 1: Presenze Confermate -->
        <div class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <span>👥</span>
              <span>Presenze Confermate</span>
            </span>
            <span class="text-xs font-extrabold text-gray-800 dark:text-gray-100">
              ${kpis.presentCount} / ${kpis.totalActiveScouts} (${attPerc}%)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
            <div class="${attBarColor} h-2.5 rounded-full transition-all duration-500" style="width: ${attPerc}%"></div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              ✓ ${kpis.presentCount} Presenti
            </span>
            <span class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
              ✗ ${kpis.absentCount} Assenti
            </span>
            <span class="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              ⏳ ${kpis.unrecordedCount} Da registrare
            </span>
          </div>
        </div>

        <!-- KPI 2: Quote Saldate -->
        <div class="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <span>💰</span>
              <span>Quote di Partecipazione</span>
            </span>
            ${kpis.isPaidActivity ? `
              <span class="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                € ${kpis.totalCollected.toFixed(2)} / € ${kpis.totalExpected.toFixed(2)} (${payPerc}%)
              </span>
            ` : `
              <span class="text-xs font-semibold text-gray-500">Gratuita</span>
            `}
          </div>

          ${kpis.isPaidActivity ? `
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
              <div class="${payBarColor} h-2.5 rounded-full transition-all duration-500" style="width: ${payPerc}%"></div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  ✓ ${kpis.paidCount} Saldati
                </span>
                <span class="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  ⏳ ${kpis.unpaidCount} In sospeso
                </span>
              </div>
              ${kpis.totalPending > 0 ? `
                <a href="pagamenti.html" class="text-green-700 dark:text-green-400 hover:underline text-[11px] font-bold">
                  Sollecita € ${kpis.totalPending.toFixed(2)} →
                </a>
              ` : `
                <span class="text-emerald-700 dark:text-emerald-400 text-[11px]">Tutto saldato! 🎉</span>
              `}
            </div>
          ` : `
            <div class="py-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Nessuna quota richiesta per questa attività di reparto.
            </div>
          `}
        </div>
      </div>

      <!-- Sezione Alert Sanitario -->
      ${medicalSectionHtml}
    </div>
  `;

  const toggleBtn = document.getElementById('toggleMedicalAlertListBtn');
  const detailsList = document.getElementById('medicalAlertListDetails');
  if (toggleBtn && detailsList) {
    let isOpen = true;
    toggleBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      detailsList.style.display = isOpen ? 'block' : 'none';
      toggleBtn.textContent = isOpen ? 'Nascondi ▲' : 'Mostra dettagli ▼';
    });
  }
};


UI._charts = UI._charts || { scout: null, activity: null };

UI._destroyCharts = function () {
  try { if (this._charts.scout) { this._charts.scout.destroy(); this._charts.scout = null; } } catch { }
  try { if (this._charts.activity) { this._charts.activity.destroy(); this._charts.activity = null; } } catch { }
};

UI.renderDashboardCharts = function () {
  const scouts = this.state.scouts || [];
  const activities = this.state.activities || [];
  const presences = this.state.presences || [];

  const ctxScout = document.getElementById('scoutPresenceChart');
  const ctxActivity = document.getElementById('activityPresenceChart');
  if (!ctxScout || !ctxActivity) return;

  this._destroyCharts();

  // Dati per grafico Presenza per Esploratore (percentuale presenze - solo anno scout in corso)
  const dedup = presences;
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  const currentScoutYear = this.getCurrentScoutYear ? this.getCurrentScoutYear() : '2025/2026';
  const sortedActivities = [...activities]
    .filter(a => this.isActivityInScoutYear ? this.isActivityInScoutYear(a, currentScoutYear) : true)
    .sort((a, b) => toDate(a.data) - toDate(b.data));

  // Calcola la prossima attività (>= oggi)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextActivityId = null;
  sortedActivities.forEach(a => {
    const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
    const aday = new Date(ad);
    aday.setHours(0, 0, 0, 0);
    if (nextActivityId === null && aday >= today) {
      nextActivityId = a.id;
    }
  });

  const pastIds = sortedActivities.filter(a => {
    const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
    const aday = new Date(ad);
    aday.setHours(0, 0, 0, 0);
    return aday < today;
  }).map(a => a.id);
  const consideredIds = nextActivityId ? [...pastIds, nextActivityId] : pastIds;

  const scoutStats = scouts.map(s => {
    const validActIds = consideredIds.filter(aid => {
      const pr = dedup.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = dedup.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    const perc = totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
    return { name: `${s.nome} ${s.cognome}`, perc, presentCount, totalActsConsidered };
  });

  // Ordina per percentuale decrescente
  scoutStats.sort((a, b) => b.perc - a.perc);

  const scoutLabels = scoutStats.map(s => s.name);
  const scoutPerc = scoutStats.map(s => s.perc);

  // Colori per le barre in base alla percentuale
  const scoutColors = scoutPerc.map(perc => {
    if (perc >= 75) return '#16a34a'; // verde
    if (perc >= 60) return '#eab308'; // giallo
    return '#dc2626'; // rosso
  });

  // Dati per grafico Presenze per Attività (conteggio presenti) ordinati per data
  const actLabels = sortedActivities.map(a => {
    const d = toDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
    return `${a.tipo}: ${a.descrizione || ''}\n${ds}`;
  });
  const actData = sortedActivities.map(a => dedup.filter(p => p.attivitaId === a.id && p.stato === 'Presente').length);

  // Datalabels
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

  // Grafico Scout
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
        y: { ticks: { autoSkip: false, maxTicksLimit: 20 } }
      },
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          callbacks: {
            label: function(context) {
              const stat = scoutStats[context.dataIndex];
              return ` ${stat.presentCount} / ${stat.totalActsConsidered}`;
            }
          }
        }
      }
    }
  });

  // Grafico Attività
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
        y: { ticks: { autoSkip: false, maxTicksLimit: 20 } }
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

UI.renderAttendanceGrid = function () {
  const container = document.getElementById('attendanceGrid');
  if (!container) return;

  const scouts = this.state.scouts || [];
  const activities = this.state.activities || [];
  const presences = this.state.presences || [];

  if (scouts.length === 0 || activities.length === 0) {
    container.innerHTML = '<p class="text-gray-500 italic">Dati non sufficienti per mostrare la griglia.</p>';
    return;
  }

  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);

  // Filtra per mostrare solo le attività passate o di oggi
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pastActivities = [...activities]
    .filter(a => {
      const aday = new Date(toDate(a.data));
      aday.setHours(0, 0, 0, 0);
      return aday <= today;
    })
    .sort((a, b) => toDate(a.data) - toDate(b.data));

  if (pastActivities.length === 0) {
    container.innerHTML = '<p class="text-gray-500 italic">Nessuna attività passata registrata.</p>';
    return;
  }

  const pastIds = pastActivities.map(a => a.id);
  const sortedScouts = [...scouts].map(s => {
    const validActIds = pastIds.filter(aid => {
      const pr = presences.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = presences.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    const perc = totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
    return { ...s, perc };
  }).sort((a, b) => b.perc - a.perc);

  let html = '<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';
  html += '<thead><tr class="bg-gray-100">';
  html += '<th class="p-1 px-2 border font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 w-36 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>';

  pastActivities.forEach(a => {
    const d = toDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    html += `<th class="p-1 border text-center text-[10px] font-normal text-gray-600 truncate max-w-[60px]" title="${a.tipo}: ${a.descrizione || ''}">${ds}</th>`;
  });
  html += '</tr></thead><tbody>';

  sortedScouts.forEach(s => {
    html += `<tr><td class="p-1 px-2 border whitespace-nowrap sticky left-0 bg-white z-10 font-medium text-gray-800 shadow-[1px_0_0_0_#e5e7eb]">${s.nome} ${s.cognome}</td>`;

    pastActivities.forEach(a => {
      const pr = presences.find(p => p.esploratoreId === s.id && p.attivitaId === a.id);
      let colorClass = 'bg-white';
      let symbol = '';
      let tooltip = 'Dato mancante o non inserito';

      if (pr) {
        if (pr.stato === 'Presente') {
          colorClass = 'bg-green-500';
          symbol = 'P';
          tooltip = 'Presente';
        } else if (pr.stato === 'Assente') {
          colorClass = 'bg-red-500';
          symbol = 'A';
          tooltip = 'Assente';
        } else if (pr.stato.toLowerCase() === 'x' || pr.stato === 'NR' || pr.stato.toLowerCase() === 'giustificato') {
          colorClass = 'bg-gray-400';
          symbol = 'X';
          tooltip = 'Non tenuto a esserci / Giustificato / NR';
        } else {
          colorClass = 'bg-gray-400';
          symbol = pr.stato.charAt(0).toUpperCase();
          tooltip = pr.stato;
        }
      }

      html += `<td class="p-1 border text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${colorClass}" title="${tooltip}"></div>
               </td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Aggiungi la legenda
  html += `
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600">
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-white border border-gray-300"></div> Dato mancante</div>
    </div>
  `;

  container.innerHTML = html;
};

