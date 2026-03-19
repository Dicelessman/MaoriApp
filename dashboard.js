// dashboard.js - Logica specifica per la pagina Dashboard

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function () {
  this.renderDashboardCharts();
  if (this.renderAttendanceGrid) {
    this.renderAttendanceGrid();
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

  // Dati per grafico Presenza per Esploratore (percentuale presenze - stessa logica di presenze.html)
  const dedup = presences;
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  const sortedActivities = [...activities].sort((a, b) => toDate(a.data) - toDate(b.data));

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

  const scoutLabels = scouts.map(s => `${s.nome} ${s.cognome}`);
  const scoutPerc = scouts.map(s => {
    // Calcola il set di attività considerate: tutte le già svolte (< oggi) + la prossima in programma
    const pastIds = sortedActivities.filter(a => {
      const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
      const aday = new Date(ad);
      aday.setHours(0, 0, 0, 0);
      return aday < today;
    }).map(a => a.id);
    const consideredIds = nextActivityId ? [...pastIds, nextActivityId] : pastIds;

    // Considera solo le attività dove lo stato è "Presente" o "Assente" (esclude NR e X)
    const validActIds = consideredIds.filter(aid => {
      const pr = dedup.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = dedup.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    return totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
  });

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
        label: 'Presenza %',
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

  let html = '<div class="overflow-x-auto"><table class="w-full text-sm text-left border-collapse min-w-max">';
  html += '<thead><tr class="bg-gray-100">';
  html += '<th class="p-2 border font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 w-48 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>';

  pastActivities.forEach(a => {
    const d = toDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    html += `<th class="p-2 border text-center text-xs font-normal text-gray-600 truncate max-w-[80px]" title="${a.tipo}: ${a.descrizione || ''}">${ds}</th>`;
  });
  html += '</tr></thead><tbody>';

  scouts.forEach(s => {
    html += `<tr><td class="p-2 border whitespace-nowrap sticky left-0 bg-white z-10 font-medium text-gray-800 shadow-[1px_0_0_0_#e5e7eb]">${s.nome} ${s.cognome}</td>`;

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

      html += `<td class="p-2 border text-center">
                 <div class="w-6 h-6 mx-auto rounded-sm flex items-center justify-center text-white text-xs font-bold ${colorClass}" title="${tooltip}">
                   ${symbol}
                 </div>
               </td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Aggiungi la legenda
  html += `
    <div class="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
      <div class="flex items-center gap-1"><div class="w-4 h-4 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1"><div class="w-4 h-4 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1"><div class="w-4 h-4 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1"><div class="w-4 h-4 rounded-sm bg-white border border-gray-300"></div> Dato mancante</div>
    </div>
  `;

  container.innerHTML = html;
};

