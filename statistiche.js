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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Anno scout corrente: dal 1 settembre dell'anno passato (o corrente)
  const anniScoutStart = new Date(today);
  if (today.getMonth() < 8) { // prima di settembre → anno scout iniziato l'anno precedente
    anniScoutStart.setFullYear(today.getFullYear() - 1);
  }
  anniScoutStart.setMonth(8); // settembre
  anniScoutStart.setDate(1);
  anniScoutStart.setHours(0, 0, 0, 0);

  // Attività svolte nell'anno scout corrente (passate)
  const anniScoutActivities = activities.filter(a => {
    const activityDate = this.toJsDate(a.data);
    if (!activityDate) return false;
    return activityDate >= anniScoutStart && activityDate <= today;
  });

  // KPI 1: Totale esploratori con breakown M/F
  const totalScouts = scouts.length;
  const maschi = scouts.filter(s => s.anag_sesso?.toLowerCase() === 'maschio').length;
  const femmine = scouts.filter(s => s.anag_sesso?.toLowerCase() === 'femmina').length;

  // KPI 2: % presenza media anno scout (solo attività svolte con presenze registrate)
  let totalPresentiAnno = 0;
  let totalPossibiliAnno = 0;
  scouts.forEach(scout => {
    anniScoutActivities.forEach(activity => {
      const presence = presences.find(p =>
        p.esploratoreId === scout.id && p.attivitaId === activity.id
      );
      if (presence && (presence.stato === 'Presente' || presence.stato === 'Assente')) {
        totalPossibiliAnno++;
        if (presence.stato === 'Presente') totalPresentiAnno++;
      }
    });
  });
  const avgPresenzaAnno = totalPossibiliAnno > 0
    ? Math.round((totalPresentiAnno / totalPossibiliAnno) * 100)
    : null;

  // KPI 3: Esploratori con >= 3 assenze nell'anno scout
  const scoutsConAssenze = scouts.filter(scout => {
    let assenze = 0;
    anniScoutActivities.forEach(activity => {
      const presence = presences.find(p =>
        p.esploratoreId === scout.id && p.attivitaId === activity.id
      );
      if (presence && presence.stato === 'Assente') assenze++;
    });
    return assenze >= 3;
  }).length;

  // KPI 4: Specialità ottenute nell'anno scout corrente
  let specialitaAnno = 0;
  scouts.forEach(scout => {
    if (scout.specialita && Array.isArray(scout.specialita)) {
      scout.specialita.forEach(sp => {
        if (sp.ottenuta && sp.data) {
          const dataOttenuta = this.toJsDate(sp.data);
          if (dataOttenuta && dataOttenuta >= anniScoutStart && dataOttenuta <= today) {
            specialitaAnno++;
          }
        }
      });
    }
  });

  const annoScoutLabel = `${anniScoutStart.getFullYear()}/${String(anniScoutStart.getFullYear() + 1).slice(-2)}`;

  kpiContainer.innerHTML = `
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm font-medium mb-1">Totale Esploratori</p>
          <p class="text-3xl font-bold">${totalScouts}</p>
          <p class="text-blue-100 text-xs mt-1">M: ${maschi} · F: ${femmine}</p>
        </div>
        <div class="text-4xl opacity-80">👥</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-sm font-medium mb-1">Presenza Media</p>
          <p class="text-3xl font-bold">${avgPresenzaAnno !== null ? avgPresenzaAnno + '%' : '—'}</p>
          <p class="text-green-100 text-xs mt-1">Anno scout ${annoScoutLabel}</p>
        </div>
        <div class="text-4xl opacity-80">📊</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-red-100 text-sm font-medium mb-1">Esp. con ≥3 Assenze</p>
          <p class="text-3xl font-bold">${scoutsConAssenze}</p>
          <p class="text-red-100 text-xs mt-1">Anno scout ${annoScoutLabel}</p>
        </div>
        <div class="text-4xl opacity-80">⚠️</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-sm font-medium mb-1">Specialità Ottenute</p>
          <p class="text-3xl font-bold">${specialitaAnno}</p>
          <p class="text-purple-100 text-xs mt-1">Anno scout ${annoScoutLabel}</p>
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
  
  // Tabella M/F per pattuglia
  const totaliEl = document.getElementById('totaliStats');
  if (totaliEl) {
    const pattugliaMF = {};
    scouts.forEach(scout => {
      const patt = scout.pv_pattuglia || 'Non assegnata';
      if (!pattugliaMF[patt]) pattugliaMF[patt] = { m: 0, f: 0, altro: 0, tot: 0 };
      const sesso = scout.anag_sesso?.toLowerCase();
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
      const altroCell = d.altro > 0 ? ` <span class="text-gray-400 text-xs">(+${d.altro})</span>` : '';
      return `<tr class="border-b">
        <td class="p-2 font-semibold">${p}</td>
        <td class="p-2 text-center">${d.tot}</td>
        <td class="p-2 text-center text-blue-600">${d.m}</td>
        <td class="p-2 text-center text-pink-500">${d.f}${altroCell}</td>
      </tr>`;
    }).join('');

    totaliEl.innerHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b bg-gray-100">
              <th class="text-left p-2">Pattuglia</th>
              <th class="text-center p-2">Tot</th>
              <th class="text-center p-2 text-blue-600">M</th>
              <th class="text-center p-2 text-pink-500">F</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
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
  
  // Progressi anno scout corrente
  const today2 = new Date();
  today2.setHours(0, 0, 0, 0);
  const annoScoutStartPassi = new Date(today2);
  if (today2.getMonth() < 8) annoScoutStartPassi.setFullYear(today2.getFullYear() - 1);
  annoScoutStartPassi.setMonth(8);
  annoScoutStartPassi.setDate(1);
  annoScoutStartPassi.setHours(0, 0, 0, 0);

  const annoScoutLabelPassi = `${annoScoutStartPassi.getFullYear()}/${String(annoScoutStartPassi.getFullYear() + 1).slice(-2)}`;

  // Esploratori che hanno superato un passo quest'anno
  let passaggioAnno = { 1: 0, 2: 0, 3: 0 };
  scouts.forEach(scout => {
    [1, 2, 3].forEach(passo => {
      const traccia = scout[`pv_traccia${passo}`];
      if (traccia?.done && traccia?.data) {
        const dataTraccia = this.toJsDate(traccia.data);
        if (dataTraccia && dataTraccia >= annoScoutStartPassi && dataTraccia <= today2) {
          passaggioAnno[passo]++;
        }
      }
    });
  });

  // Sfide completate quest'anno per passo
  const sfideAnnoByPasso = { 1: 0, 2: 0, 3: 0 };
  const direzAnno = ['io', 'al', 'mt'];
  scouts.forEach(scout => {
    [1, 2, 3].forEach(passo => {
      direzAnno.forEach(dir => {
        const dataKey = `pv_sfida_${dir}_${passo}_data`;
        if (scout[dataKey]) {
          const dataSfida = this.toJsDate(scout[dataKey]);
          if (dataSfida && dataSfida >= annoScoutStartPassi && dataSfida <= today2) {
            sfideAnnoByPasso[passo]++;
          }
        }
      });
    });
  });

  const totSfideAnno = sfideAnnoByPasso[1] + sfideAnnoByPasso[2] + sfideAnnoByPasso[3];

  const tempiPassiStatsEl = document.getElementById('tempiPassiStats');
  if (tempiPassiStatsEl) {
    const totPassaggi = passaggioAnno[1] + passaggioAnno[2] + passaggioAnno[3];
    tempiPassiStatsEl.innerHTML = `
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500 mb-1">Passi superati</div>
        <div class="text-2xl font-bold text-blue-600">${totPassaggi}</div>
        <div class="text-xs text-gray-400 mt-1">Anno scout ${annoScoutLabelPassi}</div>
        <div class="text-xs text-gray-500 mt-2">
          Passo 1: ${passaggioAnno[1]} &nbsp;|&nbsp;
          Passo 2: ${passaggioAnno[2]} &nbsp;|&nbsp;
          Passo 3: ${passaggioAnno[3]}
        </div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500 mb-1">Sfide completate</div>
        <div class="text-2xl font-bold text-green-600">${totSfideAnno}</div>
        <div class="text-xs text-gray-400 mt-1">Anno scout ${annoScoutLabelPassi}</div>
        <div class="text-xs text-gray-500 mt-2">
          Passo 1: ${sfideAnnoByPasso[1]} &nbsp;|&nbsp;
          Passo 2: ${sfideAnnoByPasso[2]} &nbsp;|&nbsp;
          Passo 3: ${sfideAnnoByPasso[3]}
        </div>
      </div>
    `;
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

  const tempiSpecialitaStatsEl = document.getElementById('tempiSpecialitaStats');
  if (tempiSpecialitaStatsEl) {
    const top5Html = top5.length > 0
      ? `<div class="bg-white p-4 rounded border">
          <div class="text-sm font-semibold text-gray-700 mb-2">🏅 Top 5 Specialità</div>
          <ol class="space-y-1">
            ${top5.map(([nome, n], i) => `
              <li class="flex justify-between text-sm">
                <span>${i + 1}. ${nome}</span>
                <span class="font-bold text-purple-600">${n}</span>
              </li>`).join('')}
          </ol>
        </div>`
      : '';

    const senzaHtml = `<div class="bg-white p-4 rounded border">
      <div class="text-sm font-semibold text-gray-700 mb-2">Senza specialità <span class="font-bold text-red-500">${senzaSpecialita.length}</span></div>
      ${senzaSpecialita.length > 0
        ? `<ul class="text-xs text-gray-500 space-y-0.5 max-h-40 overflow-y-auto">${senzaSpecialita.map(s => `<li>${s.nome || ''} ${s.cognome || ''}</li>`).join('')}</ul>`
        : '<div class="text-xs text-green-600">Tutti hanno almeno una specialità! 🎉</div>'}
    </div>`;

    tempiSpecialitaStatsEl.innerHTML = top5Html + senzaHtml;
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


