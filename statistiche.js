// statistiche.js - Logica per la pagina Statistiche

// Cache per i dati JSON
UI.specialitaListData = null;

// Carica specialita.json
UI.loadSpecialitaList = async function() {
  if (this.specialitaListData) return this.specialitaListData;
  try {
    const response = await fetch('specialita.json');
    this.specialitaListData = await response.json();
    return this.specialitaListData;
  } catch (e) {
    console.error('Errore caricamento specialita.json:', e);
    return [];
  }
};

// Funzione helper per convertire date
UI.toJsDate = function(x) {
  if (!x) return null;
  if (x instanceof Date) return x;
  if (x && x.toDate) return x.toDate();
  const d = new Date(x);
  return isNaN(d.getTime()) ? null : d;
};

// Funzione helper per calcolare differenza in giorni
UI.daysBetween = function(date1, date2) {
  if (!date1 || !date2) return null;
  const d1 = this.toJsDate(date1);
  const d2 = this.toJsDate(date2);
  if (!d1 || !d2) return null;
  const diff = Math.abs(d2 - d1);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

// Funzione helper per calcolare l'anno dell'esploratore
UI.getAnnoEsploratore = function(dob) {
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

// Funzione helper per calcolare l'anno scout in base all'età
UI.getAnnoScout = function(dob) {
  const age = this.getAnnoEsploratore(dob);
  if (age === null) return null;
  
  if (age >= 11 && age <= 12) return 'I°';
  if (age === 13) return 'II°';
  if (age === 14) return 'III°';
  if (age === 15) return 'IV°';
  return null; // Fuori dal range degli esploratori
};

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function() {
  this.renderStatistiche();
};

// Funzione principale per renderizzare le statistiche
UI.renderStatistiche = async function() {
  // Registra ChartDataLabels se disponibile
  if (window.Chart && window.ChartDataLabels) {
    window.Chart.register(window.ChartDataLabels);
  }
  
  // Ricarica sempre i dati per avere statistiche aggiornate
  this.state = await DATA.loadAll();
  this.rebuildPresenceIndex();
  
  // Carica lista specialità
  await this.loadSpecialitaList();
  
  const scouts = this.state.scouts || [];
  
  // Renderizza KPI cards
  this.renderKPICards(scouts);
  
  // Calcola statistiche composizione
  this.renderComposizioneStats(scouts);
  
  // Calcola statistiche passi
  this.renderPassiStats(scouts);
  
  // Calcola statistiche specialità
  await this.renderSpecialitaStats(scouts);
  
  // Renderizza tabella pattuglie
  this.renderPattuglieTable(scouts);
  
  // Setup report presenze avanzati
  this.renderPresenceReport();
};

// ============== KPI Cards ==============
UI.renderKPICards = function(scouts) {
  const kpiContainer = document.getElementById('kpiCards');
  if (!kpiContainer) return;
  
  const activities = this.state.activities || [];
  const presences = this.getDedupedPresences();
  
  // Calcola totale esploratori
  const totalScouts = scouts.length;
  
  // Calcola presenza media (ultimi 3 mesi)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const recentActivities = activities.filter(a => {
    const activityDate = this.toJsDate(a.data);
    if (!activityDate) return false;
    return activityDate >= threeMonthsAgo && activityDate <= today;
  });
  
  let totalPresences = 0;
  let totalPossiblePresences = 0;
  
  scouts.forEach(scout => {
    recentActivities.forEach(activity => {
      const presence = presences.find(p => 
        p.esploratoreId === scout.id && p.attivitaId === activity.id
      );
      totalPossiblePresences++;
      if (presence && presence.stato === 'Presente') {
        totalPresences++;
      }
    });
  });
  
  const avgPresence = totalPossiblePresences > 0 
    ? Math.round((totalPresences / totalPossiblePresences) * 100) 
    : 0;
  
  // Calcola totale attività
  const totalActivities = activities.length;
  const pastActivities = activities.filter(a => {
    const activityDate = this.toJsDate(a.data);
    if (!activityDate) return false;
    return activityDate < today;
  }).length;
  const upcomingActivities = totalActivities - pastActivities;
  
  // Calcola esploratori attivi (presenti almeno una volta negli ultimi 3 mesi)
  const activeScoutsSet = new Set();
  scouts.forEach(scout => {
    const hasPresence = recentActivities.some(activity => {
      const presence = presences.find(p => 
        p.esploratoreId === scout.id && p.attivitaId === activity.id && p.stato === 'Presente'
      );
      return !!presence;
    });
    if (hasPresence) {
      activeScoutsSet.add(scout.id);
    }
  });
  const activeScouts = activeScoutsSet.size;
  
  // Calcola pattuglie attive
  const activePattuglieSet = new Set();
  scouts.forEach(scout => {
    if (activeScoutsSet.has(scout.id) && scout.pv_pattuglia) {
      activePattuglieSet.add(scout.pv_pattuglia);
    }
  });
  const activePattuglie = activePattuglieSet.size;
  
  // Renderizza KPI cards
  kpiContainer.innerHTML = `
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm font-medium mb-1">Totale Esploratori</p>
          <p class="text-3xl font-bold">${totalScouts}</p>
        </div>
        <div class="text-4xl opacity-80">👥</div>
      </div>
    </div>
    
    <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-sm font-medium mb-1">Presenza Media</p>
          <p class="text-3xl font-bold">${avgPresence}%</p>
          <p class="text-green-100 text-xs mt-1">Ultimi 3 mesi</p>
        </div>
        <div class="text-4xl opacity-80">📊</div>
      </div>
    </div>
    
    <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-sm font-medium mb-1">Attività Totali</p>
          <p class="text-3xl font-bold">${totalActivities}</p>
          <p class="text-purple-100 text-xs mt-1">${upcomingActivities} prossime</p>
        </div>
        <div class="text-4xl opacity-80">📅</div>
      </div>
    </div>
    
    <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-orange-100 text-sm font-medium mb-1">Esploratori Attivi</p>
          <p class="text-3xl font-bold">${activeScouts}</p>
          <p class="text-orange-100 text-xs mt-1">${activePattuglie} pattuglie</p>
        </div>
        <div class="text-4xl opacity-80">⭐</div>
      </div>
    </div>
  `;
};

// ============== Composizione del Reparto ==============
UI.renderComposizioneStats = function(scouts) {
  // Statistiche per sesso
  const sessoStats = { 
    maschio: 0, 
    femmina: 0, 
    'non binario': 0, 
    'non registrato': 0 
  };
  scouts.forEach(scout => {
    const sesso = scout.anag_sesso ? scout.anag_sesso.toLowerCase().trim() : 'non registrato';
    if (sessoStats.hasOwnProperty(sesso)) {
      sessoStats[sesso]++;
    } else {
      sessoStats['non registrato']++;
    }
  });
  
  // Grafico per sesso
  const ctxSesso = document.getElementById('sessoChart');
  if (ctxSesso) {
    this._destroyChart('sessoChart');
    const labels = ['Maschio', 'Femmina', 'Non binario', 'Non registrato'];
    const data = [
      sessoStats.maschio, 
      sessoStats.femmina, 
      sessoStats['non binario'], 
      sessoStats['non registrato']
    ];
    const chart = new Chart(ctxSesso, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#3b82f6', '#ec4899', '#a855f7', '#9ca3af']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          datalabels: {
            color: '#fff',
            formatter: (v, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const perc = total > 0 ? Math.round((v / total) * 100) : 0;
              return perc + '%';
            }
          }
        }
      },
      plugins: [window.ChartDataLabels]
    });
    this._charts = this._charts || {};
    this._charts.sessoChart = chart;
  }
  
  // Testo statistiche sesso
  const sessoStatsEl = document.getElementById('sessoStats');
  if (sessoStatsEl) {
    const total = scouts.length;
    const totalConSesso = sessoStats.maschio + sessoStats.femmina + sessoStats['non binario'];
    sessoStatsEl.innerHTML = `
      <div>Maschio: ${sessoStats.maschio} (${total > 0 ? Math.round((sessoStats.maschio / total) * 100) : 0}%)</div>
      <div>Femmina: ${sessoStats.femmina} (${total > 0 ? Math.round((sessoStats.femmina / total) * 100) : 0}%)</div>
      <div>Non binario: ${sessoStats['non binario']} (${total > 0 ? Math.round((sessoStats['non binario'] / total) * 100) : 0}%)</div>
      ${sessoStats['non registrato'] > 0 ? `<div>Non registrato: ${sessoStats['non registrato']} (${total > 0 ? Math.round((sessoStats['non registrato'] / total) * 100) : 0}%)</div>` : ''}
    `;
  }
  
  // Statistiche per anno
  const annoStats = {};
  scouts.forEach(scout => {
    const anno = this.getAnnoEsploratore(scout.anag_dob);
    if (anno !== null) {
      annoStats[anno] = (annoStats[anno] || 0) + 1;
    }
  });
  
  const anniSorted = Object.keys(annoStats).sort((a, b) => parseInt(a) - parseInt(b));
  
  // Grafico per anno
  const ctxAnno = document.getElementById('annoChart');
  if (ctxAnno) {
    this._destroyChart('annoChart');
    const chart = new Chart(ctxAnno, {
      type: 'bar',
      data: {
        labels: anniSorted.map(a => `${a} anni`),
        datasets: [{
          label: 'Numero esploratori',
          data: anniSorted.map(a => annoStats[a]),
          backgroundColor: '#16a34a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#fff',
            anchor: 'end',
            align: 'end'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      },
      plugins: [window.ChartDataLabels]
    });
    this._charts = this._charts || {};
    this._charts.annoChart = chart;
  }
  
  // Testo statistiche anno
  const annoStatsEl = document.getElementById('annoStats');
  if (annoStatsEl) {
    const total = scouts.length;
    const avgAnno = anniSorted.length > 0 
      ? (anniSorted.reduce((sum, a) => sum + (parseInt(a) * annoStats[a]), 0) / total).toFixed(1)
      : 0;
    annoStatsEl.innerHTML = `
      <div>Età media: ${avgAnno} anni</div>
      <div>Range: ${anniSorted.length > 0 ? `${anniSorted[0]}-${anniSorted[anniSorted.length - 1]} anni` : 'N/A'}</div>
    `;
  }
  
  // Totali
  const totaliEl = document.getElementById('totaliStats');
  if (totaliEl) {
    const pattuglie = {};
    scouts.forEach(scout => {
      const patt = scout.pv_pattuglia || 'Non assegnata';
      pattuglie[patt] = (pattuglie[patt] || 0) + 1;
    });
    
    totaliEl.innerHTML = `
      <div class="bg-white p-4 rounded border">
        <div class="text-2xl font-bold text-gray-700">${scouts.length}</div>
        <div class="text-sm text-gray-600">Totale Esploratori</div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-2xl font-bold text-gray-700">${Object.keys(pattuglie).length}</div>
        <div class="text-sm text-gray-600">Pattuglie</div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-2xl font-bold text-gray-700">${sessoStats.maschio + sessoStats.femmina + sessoStats['non binario']}</div>
        <div class="text-sm text-gray-600">Con sesso identificato</div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-2xl font-bold text-gray-700">${scouts.filter(s => s.anag_dob).length}</div>
        <div class="text-sm text-gray-600">Con data nascita</div>
      </div>
    `;
  }
};

// ============== Passi ==============
UI.renderPassiStats = function(scouts) {
  // Divisione esploratori per Passo
  const passiEsploratori = { 0: 0, 1: 0, 2: 0, 3: 0 };
  scouts.forEach(scout => {
    let passo = 0;
    if (scout.pv_traccia3?.done) passo = 3;
    else if (scout.pv_traccia2?.done) passo = 2;
    else if (scout.pv_traccia1?.done) passo = 1;
    passiEsploratori[passo]++;
  });
  
  // Grafico esploratori per passo
  const ctxPassiEsploratori = document.getElementById('passiEsploratoriChart');
  if (ctxPassiEsploratori) {
    this._destroyChart('passiEsploratoriChart');
    const chart = new Chart(ctxPassiEsploratori, {
      type: 'pie',
      data: {
        labels: ['Nessun Passo', 'Passo 1', 'Passo 2', 'Passo 3'],
        datasets: [{
          data: [passiEsploratori[0], passiEsploratori[1], passiEsploratori[2], passiEsploratori[3]],
          backgroundColor: ['#9ca3af', '#3b82f6', '#16a34a', '#eab308']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          datalabels: {
            color: '#fff',
            formatter: (v, ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const perc = total > 0 ? Math.round((v / total) * 100) : 0;
              return perc + '%';
            }
          }
        }
      },
      plugins: [window.ChartDataLabels]
    });
    this._charts = this._charts || {};
    this._charts.passiEsploratoriChart = chart;
  }
  
  // Testo statistiche passi esploratori
  const passiEsploratoriStatsEl = document.getElementById('passiEsploratoriStats');
  if (passiEsploratoriStatsEl) {
    const total = scouts.length;
    passiEsploratoriStatsEl.innerHTML = `
      <div>Nessun Passo: ${passiEsploratori[0]} (${total > 0 ? Math.round((passiEsploratori[0] / total) * 100) : 0}%)</div>
      <div>Passo 1: ${passiEsploratori[1]} (${total > 0 ? Math.round((passiEsploratori[1] / total) * 100) : 0}%)</div>
      <div>Passo 2: ${passiEsploratori[2]} (${total > 0 ? Math.round((passiEsploratori[2] / total) * 100) : 0}%)</div>
      <div>Passo 3: ${passiEsploratori[3]} (${total > 0 ? Math.round((passiEsploratori[3] / total) * 100) : 0}%)</div>
    `;
  }
  
  // Divisione sfide per Passo
  const passiSfide = { 1: 0, 2: 0, 3: 0 };
  const direzioni = ['io', 'al', 'mt'];
  scouts.forEach(scout => {
    [1, 2, 3].forEach(passo => {
      direzioni.forEach(dir => {
        const dataKey = `pv_sfida_${dir}_${passo}_data`;
        if (scout[dataKey]) {
          passiSfide[passo]++;
        }
      });
    });
  });
  
  // Grafico sfide per passo
  const ctxPassiSfide = document.getElementById('passiSfideChart');
  if (ctxPassiSfide) {
    this._destroyChart('passiSfideChart');
    const chart = new Chart(ctxPassiSfide, {
      type: 'bar',
      data: {
        labels: ['Passo 1', 'Passo 2', 'Passo 3'],
        datasets: [{
          label: 'Sfide completate',
          data: [passiSfide[1], passiSfide[2], passiSfide[3]],
          backgroundColor: ['#3b82f6', '#16a34a', '#eab308']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#fff',
            anchor: 'end',
            align: 'end'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      },
      plugins: [window.ChartDataLabels]
    });
    this._charts = this._charts || {};
    this._charts.passiSfideChart = chart;
  }
  
  // Testo statistiche sfide
  const passiSfideStatsEl = document.getElementById('passiSfideStats');
  if (passiSfideStatsEl) {
    const total = passiSfide[1] + passiSfide[2] + passiSfide[3];
    passiSfideStatsEl.innerHTML = `
      <div>Passo 1: ${passiSfide[1]} sfide</div>
      <div>Passo 2: ${passiSfide[2]} sfide</div>
      <div>Passo 3: ${passiSfide[3]} sfide</div>
      <div class="font-semibold mt-2">Totale: ${total} sfide</div>
    `;
  }
  
  // Tempi medi
  const tempiPassi = [];
  
  // Tempo medio per raggiungere il Passo successivo
  scouts.forEach(scout => {
    const traccia1 = scout.pv_traccia1?.data;
    const traccia2 = scout.pv_traccia2?.data;
    const traccia3 = scout.pv_traccia3?.data;
    
    if (traccia1 && traccia2) {
      const giorni = this.daysBetween(traccia1, traccia2);
      if (giorni !== null) tempiPassi.push({ tipo: 'Passo 1 → 2', giorni });
    }
    if (traccia2 && traccia3) {
      const giorni = this.daysBetween(traccia2, traccia3);
      if (giorni !== null) tempiPassi.push({ tipo: 'Passo 2 → 3', giorni });
    }
  });
  
  // Tempo medio per superare una sfida (stesso passo)
  const tempiSfide = [];
  scouts.forEach(scout => {
    [1, 2, 3].forEach(passo => {
      const sfide = [];
      direzioni.forEach(dir => {
        const dataKey = `pv_sfida_${dir}_${passo}_data`;
        if (scout[dataKey]) {
          sfide.push({ data: scout[dataKey], dir, passo });
        }
      });
      // Ordina per data
      sfide.sort((a, b) => {
        const d1 = this.toJsDate(a.data);
        const d2 = this.toJsDate(b.data);
        if (!d1 || !d2) return 0;
        return d1 - d2;
      });
      // Calcola differenze tra sfide consecutive
      for (let i = 1; i < sfide.length; i++) {
        const giorni = this.daysBetween(sfide[i-1].data, sfide[i].data);
        if (giorni !== null) {
          tempiSfide.push({ tipo: `Passo ${passo}`, giorni });
        }
      }
    });
  });
  
  // Calcola medie
  const avgPasso12 = tempiPassi.filter(t => t.tipo === 'Passo 1 → 2').length > 0
    ? Math.round(tempiPassi.filter(t => t.tipo === 'Passo 1 → 2').reduce((sum, t) => sum + t.giorni, 0) / tempiPassi.filter(t => t.tipo === 'Passo 1 → 2').length)
    : null;
  const avgPasso23 = tempiPassi.filter(t => t.tipo === 'Passo 2 → 3').length > 0
    ? Math.round(tempiPassi.filter(t => t.tipo === 'Passo 2 → 3').reduce((sum, t) => sum + t.giorni, 0) / tempiPassi.filter(t => t.tipo === 'Passo 2 → 3').length)
    : null;
  
  const avgSfideByPasso = {};
  [1, 2, 3].forEach(passo => {
    const sfidePasso = tempiSfide.filter(t => t.tipo === `Passo ${passo}`);
    if (sfidePasso.length > 0) {
      avgSfideByPasso[passo] = Math.round(sfidePasso.reduce((sum, t) => sum + t.giorni, 0) / sfidePasso.length);
    }
  });
  
  // Renderizza tempi medi
  const tempiPassiStatsEl = document.getElementById('tempiPassiStats');
  if (tempiPassiStatsEl) {
    let html = '';
    if (avgPasso12 !== null) {
      html += `
        <div class="bg-white p-4 rounded border">
          <div class="text-lg font-semibold text-gray-700">Passo 1 → 2</div>
          <div class="text-2xl font-bold text-blue-600">${avgPasso12} giorni</div>
          <div class="text-sm text-gray-600">${tempiPassi.filter(t => t.tipo === 'Passo 1 → 2').length} transizioni</div>
        </div>
      `;
    }
    if (avgPasso23 !== null) {
      html += `
        <div class="bg-white p-4 rounded border">
          <div class="text-lg font-semibold text-gray-700">Passo 2 → 3</div>
          <div class="text-2xl font-bold text-green-600">${avgPasso23} giorni</div>
          <div class="text-sm text-gray-600">${tempiPassi.filter(t => t.tipo === 'Passo 2 → 3').length} transizioni</div>
        </div>
      `;
    }
    Object.keys(avgSfideByPasso).forEach(passo => {
      html += `
        <div class="bg-white p-4 rounded border">
          <div class="text-lg font-semibold text-gray-700">Tempo medio sfide Passo ${passo}</div>
          <div class="text-2xl font-bold text-yellow-600">${avgSfideByPasso[passo]} giorni</div>
          <div class="text-sm text-gray-600">${tempiSfide.filter(t => t.tipo === `Passo ${passo}`).length} intervalli</div>
        </div>
      `;
    });
    tempiPassiStatsEl.innerHTML = html || '<div class="text-gray-500">Dati insufficienti per calcolare i tempi medi</div>';
  }
};

// ============== Specialità ==============
UI.renderSpecialitaStats = async function(scouts) {
  const specialitaList = await this.loadSpecialitaList();
  
  // Totale specialità per anno e pattuglia
  const specialitaByAnnoPattuglia = {};
  scouts.forEach(scout => {
    const anno = this.getAnnoEsploratore(scout.anag_dob);
    const pattuglia = scout.pv_pattuglia || 'Non assegnata';
    const key = `${anno || 'N/A'}_${pattuglia}`;
    
    if (!specialitaByAnnoPattuglia[key]) {
      specialitaByAnnoPattuglia[key] = { anno: anno || 'N/A', pattuglia, count: 0 };
    }
    
    if (scout.specialita && Array.isArray(scout.specialita)) {
      specialitaByAnnoPattuglia[key].count += scout.specialita.filter(s => s.ottenuta).length;
    }
  });
  
  // Renderizza tabella
  const specialitaAnnoPattugliaBody = document.getElementById('specialitaAnnoPattugliaBody');
  if (specialitaAnnoPattugliaBody) {
    const entries = Object.values(specialitaByAnnoPattuglia).sort((a, b) => {
      if (a.anno === 'N/A') return 1;
      if (b.anno === 'N/A') return -1;
      return parseInt(a.anno) - parseInt(b.anno);
    });
    
    specialitaAnnoPattugliaBody.innerHTML = entries.map(entry => `
      <tr class="border-b">
        <td class="p-2">${entry.anno}</td>
        <td class="p-2">${entry.pattuglia}</td>
        <td class="p-2 text-right font-semibold">${entry.count}</td>
      </tr>
    `).join('');
  }
  
  // Distribuzione per colori
  const coloriSfondo = {};
  const coloriBordo = {};
  
  scouts.forEach(scout => {
    if (scout.specialita && Array.isArray(scout.specialita)) {
      scout.specialita.forEach(sp => {
        if (sp.ottenuta && sp.nome) {
          const spec = specialitaList.find(s => s.nome === sp.nome);
          if (spec) {
            const sfondo = spec.sfondo_colore || 'unknown';
            const bordo = spec.bordo_colore || 'unknown';
            coloriSfondo[sfondo] = (coloriSfondo[sfondo] || 0) + 1;
            coloriBordo[bordo] = (coloriBordo[bordo] || 0) + 1;
          }
        }
      });
    }
  });
  
  // Grafico colori sfondo
  const ctxColoreSfondo = document.getElementById('specialitaColoreSfondoChart');
  if (ctxColoreSfondo) {
    this._destroyChart('specialitaColoreSfondoChart');
    const labels = Object.keys(coloriSfondo);
    const data = Object.values(coloriSfondo);
    const colors = labels.map(c => {
      const colorMap = { blue: '#3b82f6', green: '#16a34a', yellow: '#eab308', red: '#dc2626', unknown: '#9ca3af' };
      return colorMap[c] || '#9ca3af';
    });
    
    const chart = new Chart(ctxColoreSfondo, {
      type: 'bar',
      data: {
        labels: labels.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [{
          label: 'Specialità',
          data: data,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#fff',
            anchor: 'end',
            align: 'end'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      },
      plugins: [window.ChartDataLabels]
    });
    this._charts = this._charts || {};
    this._charts.specialitaColoreSfondoChart = chart;
  }
  
  // Grafico colori bordo
  const ctxColoreBordo = document.getElementById('specialitaColoreBordoChart');
  if (ctxColoreBordo) {
    this._destroyChart('specialitaColoreBordoChart');
    const labels = Object.keys(coloriBordo);
    const data = Object.values(coloriBordo);
    const colors = labels.map(c => {
      const colorMap = { blue: '#3b82f6', green: '#16a34a', yellow: '#eab308', red: '#dc2626', unknown: '#9ca3af' };
      return colorMap[c] || '#9ca3af';
    });
    
    const chart = new Chart(ctxColoreBordo, {
      type: 'bar',
      data: {
        labels: labels.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        datasets: [{
          label: 'Specialità',
          data: data,
          backgroundColor: colors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: '#fff',
            anchor: 'end',
            align: 'end'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      },
      plugins: [window.ChartDataLabels]
    });
    this._charts = this._charts || {};
    this._charts.specialitaColoreBordoChart = chart;
  }
  
  // Tempi medi specialità
  const tempiProve = [];
  const tempiSpecialita = [];
  
  scouts.forEach(scout => {
    if (scout.specialita && Array.isArray(scout.specialita)) {
      scout.specialita.forEach(sp => {
        if (sp.ottenuta && sp.data) {
          // Tempo per superare una prova (differenza tra prove consecutive)
          const prove = [
            { data: sp.p1_data, nome: 'Prova 1' },
            { data: sp.p2_data, nome: 'Prova 2' },
            { data: sp.p3_data, nome: 'Prova 3' }
          ].filter(p => p.data);
          
          prove.sort((a, b) => {
            const d1 = this.toJsDate(a.data);
            const d2 = this.toJsDate(b.data);
            if (!d1 || !d2) return 0;
            return d1 - d2;
          });
          
          for (let i = 1; i < prove.length; i++) {
            const giorni = this.daysBetween(prove[i-1].data, prove[i].data);
            if (giorni !== null) {
              tempiProve.push(giorni);
            }
          }
          
          // Tempo per ottenere una specialità (dalla prima prova alla data ottenuta)
          if (prove.length > 0 && sp.data) {
            const giorni = this.daysBetween(prove[0].data, sp.data);
            if (giorni !== null) {
              tempiSpecialita.push(giorni);
            }
          }
        }
      });
    }
  });
  
  const avgTempoProve = tempiProve.length > 0
    ? Math.round(tempiProve.reduce((sum, t) => sum + t, 0) / tempiProve.length)
    : null;
  const avgTempoSpecialita = tempiSpecialita.length > 0
    ? Math.round(tempiSpecialita.reduce((sum, t) => sum + t, 0) / tempiSpecialita.length)
    : null;
  
  // Renderizza tempi medi specialità
  const tempiSpecialitaStatsEl = document.getElementById('tempiSpecialitaStats');
  if (tempiSpecialitaStatsEl) {
    let html = '';
    if (avgTempoProve !== null) {
      html += `
        <div class="bg-white p-4 rounded border">
          <div class="text-lg font-semibold text-gray-700">Tempo medio per superare una prova</div>
          <div class="text-2xl font-bold text-blue-600">${avgTempoProve} giorni</div>
          <div class="text-sm text-gray-600">${tempiProve.length} intervalli calcolati</div>
        </div>
      `;
    }
    if (avgTempoSpecialita !== null) {
      html += `
        <div class="bg-white p-4 rounded border">
          <div class="text-lg font-semibold text-gray-700">Tempo medio per ottenere una specialità</div>
          <div class="text-2xl font-bold text-green-600">${avgTempoSpecialita} giorni</div>
          <div class="text-sm text-gray-600">${tempiSpecialita.length} specialità calcolate</div>
        </div>
      `;
    }
    tempiSpecialitaStatsEl.innerHTML = html || '<div class="text-gray-500">Dati insufficienti per calcolare i tempi medi</div>';
  }
};

// ============== Tabella Pattuglie ==============
UI.renderPattuglieTable = function(scouts) {
  // Salva scouts nello stato per accesso dagli event listeners
  if (scouts) {
    this._pattuglieTableScouts = scouts;
  } else {
    scouts = this._pattuglieTableScouts || [];
  }
  
  // Inizializza lo stato di ordinamento se non esiste
  if (!this._pattuglieSortState) {
    this._pattuglieSortState = { field: 'nome', direction: 'asc' };
  }
  
  // Raggruppa esploratori per pattuglia
  const pattuglieMap = {};
  
  scouts.forEach(scout => {
    const pattuglia = scout.pv_pattuglia || 'Non assegnata';
    if (!pattuglieMap[pattuglia]) {
      pattuglieMap[pattuglia] = [];
    }
    
    const annoScout = this.getAnnoScout(scout.anag_dob);
    
    // Calcola il passo raggiunto
    let passo = '-';
    if (scout.pv_traccia3?.done) passo = '3';
    else if (scout.pv_traccia2?.done) passo = '2';
    else if (scout.pv_traccia1?.done) passo = '1';
    
    // Calcola numero specialità raggiunte
    let numSpecialita = 0;
    if (scout.specialita && Array.isArray(scout.specialita)) {
      numSpecialita = scout.specialita.filter(s => s.ottenuta).length;
    }
    
    // CP/VCP
    const cpVcp = scout.pv_vcp_cp || '';
    
    pattuglieMap[pattuglia].push({
      nome: `${scout.nome || ''} ${scout.cognome || ''}`.trim() || 'Nome non disponibile',
      annoScout: annoScout || 'N/A',
      cpVcp: cpVcp,
      passo: passo,
      numSpecialita: numSpecialita
    });
  });
  
  // Ordina gli esploratori all'interno di ogni pattuglia
  const sortField = this._pattuglieSortState.field;
  const sortDir = this._pattuglieSortState.direction;
  
  Object.keys(pattuglieMap).forEach(pattuglia => {
    pattuglieMap[pattuglia].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'nome') {
        comparison = a.nome.localeCompare(b.nome);
      } else if (sortField === 'annoScout') {
        // Ordina per anno scout: I°, II°, III°, IV°, N/A
        const order = { 'I°': 1, 'II°': 2, 'III°': 3, 'IV°': 4, 'N/A': 5 };
        const aOrder = order[a.annoScout] || 5;
        const bOrder = order[b.annoScout] || 5;
        comparison = aOrder - bOrder;
        // Se stesso anno scout, ordina per nome
        if (comparison === 0) {
          comparison = a.nome.localeCompare(b.nome);
        }
      }
      
      return sortDir === 'asc' ? comparison : -comparison;
    });
  });
  
  // Ordina le pattuglie per nome
  const pattuglieSorted = Object.keys(pattuglieMap).sort((a, b) => {
    // "Non assegnata" va alla fine
    if (a === 'Non assegnata') return 1;
    if (b === 'Non assegnata') return -1;
    return a.localeCompare(b);
  });
  
  // Aggiorna icone di ordinamento
  const sortNomeIcon = document.getElementById('sortNomeIcon');
  const sortAnnoScoutIcon = document.getElementById('sortAnnoScoutIcon');
  if (sortNomeIcon) {
    if (sortField === 'nome') {
      sortNomeIcon.textContent = sortDir === 'asc' ? '↑' : '↓';
    } else {
      sortNomeIcon.textContent = '↕';
    }
  }
  if (sortAnnoScoutIcon) {
    if (sortField === 'annoScout') {
      sortAnnoScoutIcon.textContent = sortDir === 'asc' ? '↑' : '↓';
    } else {
      sortAnnoScoutIcon.textContent = '↕';
    }
  }
  
  // Renderizza la tabella
  const tbody = document.getElementById('pattuglieTableBody');
  if (!tbody) return;
  
  let html = '';
  pattuglieSorted.forEach(pattuglia => {
    const esploratori = pattuglieMap[pattuglia];
    esploratori.forEach((esploratore, index) => {
      html += `
        <tr class="border-b hover:bg-gray-50">
          ${index === 0 ? `<td class="p-2 font-semibold" rowspan="${esploratori.length}">${pattuglia}</td>` : ''}
          <td class="p-2">${esploratore.nome}</td>
          <td class="p-2">${esploratore.annoScout}</td>
          <td class="p-2">${esploratore.cpVcp}</td>
          <td class="p-2">${esploratore.passo}</td>
          <td class="p-2">${esploratore.numSpecialita}</td>
        </tr>
      `;
    });
  });
  
  tbody.innerHTML = html || '<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>';
  
  // Aggiungi event listeners per l'ordinamento (solo se non già aggiunti)
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

// Funzione helper per distruggere un grafico
UI._destroyChart = function(chartId) {
  if (!this._charts) return;
  try {
    if (this._charts[chartId]) {
      this._charts[chartId].destroy();
      this._charts[chartId] = null;
    }
  } catch (e) {
    console.error('Errore distruzione grafico:', e);
  }
};

// ============== Report Presenze Avanzati ==============
UI.renderPresenceReport = function() {
  // Setup event listeners per i filtri
  const periodSelect = document.getElementById('presenceReportPeriod');
  const customDateRange = document.getElementById('customDateRange');
  const customDateRangeEnd = document.getElementById('customDateRangeEnd');
  const generateBtn = document.getElementById('generatePresenceReport');
  const printBtn = document.getElementById('printPresenceReport');
  const exportBtn = document.getElementById('exportPresenceReportCSV');
  const resultsDiv = document.getElementById('presenceReportResults');
  
  if (!periodSelect || !generateBtn) return;
  
  // Popola pattuglie
  const pattugliaSelect = document.getElementById('presenceReportPattuglia');
  if (pattugliaSelect) {
    const scouts = this.state.scouts || [];
    const pattuglie = [...new Set(scouts.map(s => s.pv_pattuglia).filter(Boolean))].sort();
    pattuglie.forEach(p => {
      const option = document.createElement('option');
      option.value = p;
      option.textContent = p;
      pattugliaSelect.appendChild(option);
    });
  }
  
  // Mostra/nascondi date custom
  periodSelect.addEventListener('change', () => {
    const isCustom = periodSelect.value === 'custom';
    if (customDateRange) customDateRange.style.display = isCustom ? 'block' : 'none';
    if (customDateRangeEnd) customDateRangeEnd.style.display = isCustom ? 'block' : 'none';
  });
  
  // Genera report
  generateBtn.addEventListener('click', () => {
    this.generatePresenceReport();
  });
  
  // Print/PDF
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
  
  // Export CSV
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      this.exportPresenceReportCSV();
    });
  }
};

UI.generatePresenceReport = function() {
  const period = document.getElementById('presenceReportPeriod')?.value || 'current-month';
  const pattuglia = document.getElementById('presenceReportPattuglia')?.value || '';
  const startDateInput = document.getElementById('presenceReportStartDate');
  const endDateInput = document.getElementById('presenceReportEndDate');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate, endDate;
  
  // Calcola date in base al periodo
  switch (period) {
    case 'current-month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case 'last-month':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case 'last-3-months':
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      endDate = today;
      break;
    case 'current-year':
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
      break;
    case 'last-year':
      startDate = new Date(today.getFullYear() - 1, 0, 1);
      endDate = new Date(today.getFullYear() - 1, 11, 31);
      break;
    case 'custom':
      if (!startDateInput || !endDateInput) return;
      startDate = new Date(startDateInput.value);
      endDate = new Date(endDateInput.value);
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = today;
  }
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  // Filtra attività nel periodo
  const activities = (this.state.activities || []).filter(a => {
    const activityDate = this.toJsDate(a.data);
    if (!activityDate) return false;
    return activityDate >= startDate && activityDate <= endDate;
  }).sort((a, b) => this.toJsDate(a.data) - this.toJsDate(b.data));
  
  // Filtra scouts per pattuglia
  let scouts = this.state.scouts || [];
  if (pattuglia) {
    scouts = scouts.filter(s => s.pv_pattuglia === pattuglia);
  }
  
  // Calcola statistiche
  const presences = this.getDedupedPresences();
  const stats = {
    byScout: {},
    byActivity: {},
    trend: []
  };
  
  activities.forEach(activity => {
    const activityDate = this.toJsDate(activity.data);
    const dateKey = activityDate ? activityDate.toLocaleDateString('it-IT') : '';
    
    stats.byActivity[activity.id] = {
      activity,
      date: dateKey,
      presenti: 0,
      assenti: 0,
      totale: 0
    };
    
    stats.trend.push({
      date: activityDate || new Date(),
      dateKey,
      presenti: 0,
      assenti: 0
    });
  });
  
  scouts.forEach(scout => {
    stats.byScout[scout.id] = {
      scout,
      presenti: 0,
      assenti: 0,
      totale: 0
    };
    
    activities.forEach((activity, idx) => {
      const presence = presences.find(p => p.esploratoreId === scout.id && p.attivitaId === activity.id);
      
      if (presence) {
        if (presence.stato === 'Presente') {
          stats.byScout[scout.id].presenti++;
          stats.byActivity[activity.id].presenti++;
          if (stats.trend[idx]) stats.trend[idx].presenti++;
        } else if (presence.stato === 'Assente') {
          stats.byScout[scout.id].assenti++;
          stats.byActivity[activity.id].assenti++;
          if (stats.trend[idx]) stats.trend[idx].assenti++;
        }
        
        if (presence.stato === 'Presente' || presence.stato === 'Assente') {
          stats.byScout[scout.id].totale++;
          stats.byActivity[activity.id].totale++;
        }
      }
    });
  });
  
  // Renderizza risultati
  this.renderPresenceReportResults(stats, startDate, endDate);
  
  // Salva stats per export
  this._currentPresenceReportStats = stats;
  this._currentPresenceReportDates = { startDate, endDate };
};

UI.renderPresenceReportResults = function(stats, startDate, endDate) {
  const resultsDiv = document.getElementById('presenceReportResults');
  const printBtn = document.getElementById('printPresenceReport');
  const exportBtn = document.getElementById('exportPresenceReportCSV');
  
  if (!resultsDiv) return;
  
  resultsDiv.style.display = 'block';
  if (printBtn) printBtn.style.display = 'inline-block';
  if (exportBtn) exportBtn.style.display = 'inline-block';
  
  // Trend Chart
  const ctxTrend = document.getElementById('presenceTrendChart');
  if (ctxTrend) {
    this._destroyChart('presenceTrendChart');
    const chart = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: stats.trend.map(t => t.dateKey),
        datasets: [
          {
            label: 'Presenti',
            data: stats.trend.map(t => t.presenti),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            tension: 0.4
          },
          {
            label: 'Assenti',
            data: stats.trend.map(t => t.assenti),
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
    this._charts = this._charts || {};
    this._charts.presenceTrendChart = chart;
  }
  
  // Confronto periodi (mese corrente vs precedente)
  const comparisonDiv = document.getElementById('periodComparison');
  if (comparisonDiv) {
    const currentPeriod = stats.trend.reduce((acc, t) => ({
      presenti: acc.presenti + t.presenti,
      assenti: acc.assenti + t.assenti
    }), { presenti: 0, assenti: 0 });
    
    const totalCurrent = currentPeriod.presenti + currentPeriod.assenti;
    const percCurrent = totalCurrent > 0 ? Math.round((currentPeriod.presenti / totalCurrent) * 100) : 0;
    
    // Calcola periodo precedente (stesso range di giorni ma periodo precedente)
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - daysDiff - 1);
    const prevEndDate = new Date(startDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const prevActivities = (this.state.activities || []).filter(a => {
      const activityDate = this.toJsDate(a.data);
      if (!activityDate) return false;
      return activityDate >= prevStartDate && activityDate <= prevEndDate;
    });
    
    const prevPresences = this.getDedupedPresences();
    const prevStats = prevActivities.reduce((acc, activity) => {
      const presences = prevPresences.filter(p => p.attivitaId === activity.id);
      const presenti = presences.filter(p => p.stato === 'Presente').length;
      const assenti = presences.filter(p => p.stato === 'Assente').length;
      return {
        presenti: acc.presenti + presenti,
        assenti: acc.assenti + assenti
      };
    }, { presenti: 0, assenti: 0 });
    
    const totalPrev = prevStats.presenti + prevStats.assenti;
    const percPrev = totalPrev > 0 ? Math.round((prevStats.presenti / totalPrev) * 100) : 0;
    
    const diff = percCurrent - percPrev;
    
    comparisonDiv.innerHTML = `
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-600 mb-2">Periodo Corrente</div>
        <div class="text-2xl font-bold text-gray-700">${percCurrent}%</div>
        <div class="text-sm text-gray-500">${currentPeriod.presenti} presenti / ${totalCurrent} totali</div>
        <div class="text-xs text-gray-400 mt-1">${startDate.toLocaleDateString('it-IT')} - ${endDate.toLocaleDateString('it-IT')}</div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-600 mb-2">Periodo Precedente</div>
        <div class="text-2xl font-bold text-gray-700">${percPrev}%</div>
        <div class="text-sm text-gray-500">${prevStats.presenti} presenti / ${totalPrev} totali</div>
        <div class="text-xs text-gray-400 mt-1">${prevStartDate.toLocaleDateString('it-IT')} - ${prevEndDate.toLocaleDateString('it-IT')}</div>
      </div>
      <div class="bg-white p-4 rounded border col-span-2">
        <div class="text-sm text-gray-600 mb-2">Differenza</div>
        <div class="text-2xl font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}">
          ${diff >= 0 ? '+' : ''}${diff}%
        </div>
        <div class="text-sm text-gray-500">${diff >= 0 ? 'Miglioramento' : 'Peggioramento'} rispetto al periodo precedente</div>
      </div>
    `;
  }
  
  // Tabella dettaglio
  const tableBody = document.getElementById('presenceReportTableBody');
  if (tableBody) {
    const scoutStats = Object.values(stats.byScout)
      .map(s => ({
        ...s,
        percentuale: s.totale > 0 ? Math.round((s.presenti / s.totale) * 100) : 0
      }))
      .sort((a, b) => b.percentuale - a.percentuale);
    
    tableBody.innerHTML = scoutStats.map(s => `
      <tr class="border-b hover:bg-gray-50">
        <td class="p-2">${s.scout.nome} ${s.scout.cognome}</td>
        <td class="p-2">${s.scout.pv_pattuglia || 'N/A'}</td>
        <td class="p-2 text-right">${s.presenti}</td>
        <td class="p-2 text-right">${s.assenti}</td>
        <td class="p-2 text-right">${s.totale}</td>
        <td class="p-2 text-right font-semibold ${s.percentuale >= 75 ? 'text-green-600' : s.percentuale >= 60 ? 'text-yellow-600' : 'text-red-600'}">
          ${s.percentuale}%
        </td>
      </tr>
    `).join('');
  }
};

UI.exportPresenceReportCSV = function() {
  if (!this._currentPresenceReportStats) {
    this.showToast('Genera prima un report', { type: 'error' });
    return;
  }
  
  const stats = this._currentPresenceReportStats;
  const { startDate, endDate } = this._currentPresenceReportDates;
  
  const headers = ['Esploratore', 'Pattuglia', 'Presenze', 'Assenze', 'Totale', '% Presenze'];
  const rows = Object.values(stats.byScout)
    .map(s => {
      const perc = s.totale > 0 ? Math.round((s.presenti / s.totale) * 100) : 0;
      return [
        `${s.scout.nome} ${s.scout.cognome}`,
        s.scout.pv_pattuglia || 'N/A',
        s.presenti,
        s.assenti,
        s.totale,
        perc
      ];
    })
    .sort((a, b) => b[5] - a[5]);
  
  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${v}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `report-presenze-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  this.showToast('Report esportato con successo', { type: 'success' });
};


