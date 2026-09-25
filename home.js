// home.js - Logica specifica per la Home Page del Reparto Scout Maori
import { UI as uiInstance } from './js/ui/ui.js';
import { escapeHtml, toJsDate, getAllScoutYearDeadlines } from './js/utils/utils.js';

const UI = (typeof window !== 'undefined' && window.UI) ? window.UI : uiInstance;

// Predefiniti per link esterni utili
const DEFAULT_EXTERNAL_LINKS = [
  {
    id: 'link_gdrive',
    title: 'Google Drive di Reparto',
    url: 'https://drive.google.com',
    icon: '📁',
    description: 'Cartella condivisa staff: circolari, schede uscite, canzonieri e verbali'
  },
  {
    id: 'link_cngei',
    title: 'Portale CNGEI Nazionale',
    url: 'https://cngei.it',
    icon: '⚜️',
    description: 'Sito ufficiale dell\'Associazione, regolamenti e modulistica nazionale'
  },
  {
    id: 'link_meteo',
    title: 'Meteo & Previsioni Uscite',
    url: 'https://www.3bmeteo.com',
    icon: '⛅',
    description: 'Previsioni meteo, temperature e allerte per uscite e bivacchi'
  },
  {
    id: 'link_scoutwiki',
    title: 'ScoutWiki & Tecniche Scout',
    url: 'https://it.scoutwiki.org',
    icon: '🧭',
    description: 'Manuali e schede pratiche di pionieristica, topografia, nodi e trappeur'
  }
];

// Helper per i colori del tipo di attività (conforme a calendario.html)
function getActivityColors(tipo) {
  switch (tipo) {
    case 'Evento Adulti':
      return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-800 dark:text-purple-100', border: 'border-purple-500', pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200' };
    case 'Riunione Adulti':
      return { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-800 dark:text-slate-100', border: 'border-slate-500', pill: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' };
    case 'Eventi con esterni':
      return { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-800 dark:text-amber-100', border: 'border-amber-500', pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' };
    case 'Uscita':
      return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-800 dark:text-blue-100', border: 'border-blue-500', pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' };
    case 'Campo':
      return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-100', border: 'border-red-500', pill: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' };
    default:
      return { bg: 'bg-emerald-50/70 dark:bg-emerald-950/20', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-500', pill: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' };
  }
}

// Icone per tipologie di attività
function getActivityIcon(tipo) {
  const icons = {
    'Riunione': '⏰',
    'Attività lunga': '🌲',
    'Uscita': '🥾',
    'Campo': '🏕️',
    'Evento Adulti': '⚜️',
    'Riunione Adulti': '📋',
    'Eventi con esterni': '🌟'
  };
  return icons[tipo] || '📅';
}

UI.renderCurrentPage = function () {
  this.renderHomeHero();
  this.renderNextActivityWidgetHome();
  this.renderUpcomingNextTwoActivities();
  this.renderUpcomingDeadlinesWidget();
  this.renderExternalLinksWidget();
  this.setupExternalLinksModal();
};

/**
 * 1. Hero Banner della Home con benvenuto, data e info gruppo
 */
UI.renderHomeHero = function () {
  const container = document.getElementById('homeHeroBanner');
  if (!container) return;

  const now = new Date();
  const currentScoutYear = this.getCurrentScoutYear ? this.getCurrentScoutYear() : '2025/2026';
  
  // Saluto orario scout
  const hour = now.getHours();
  const greeting = hour < 13 ? 'Buon risveglio e Buona Caccia!' : (hour < 18 ? 'Buon pomeriggio e Buona Caccia!' : 'Buona serata e Buona Caccia!');

  const formattedDate = now.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dateStr = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const unitType = (typeof localStorage !== 'undefined' && localStorage.getItem('unitType')) || 'Reparto';
  const unitName = (typeof localStorage !== 'undefined' && localStorage.getItem('unitName')) || 'Maori';

  container.innerHTML = `
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 text-white p-5 sm:p-7 shadow-lg">
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-green-100 border border-white/30">
              ⚜️ ${unitType} ${unitName}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
              Anno Scout ${currentScoutYear}
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ${greeting}
          </h2>
          <p class="text-xs sm:text-sm text-green-100/90 mt-1 flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>${dateStr}</span>
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <a href="calendario.html" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-white text-green-800 hover:bg-green-50 transition shadow-sm flex items-center gap-1.5">
            <span>📅</span>
            <span>Calendario</span>
          </a>
          <a href="presenze.html" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white border border-white/20 transition shadow-sm flex items-center gap-1.5">
            <span>✍️</span>
            <span>Presenze</span>
          </a>
        </div>
      </div>
    </div>
  `;
};

/**
 * 2. Widget "Prossima Attività"
 * Fedele all'allegato 1.jpg (da dashboard.html), ma ESCLUDENDO le scadenze documenti/sanitarie.
 */
UI.renderNextActivityWidgetHome = function () {
  const container = document.getElementById('homeNextActivityContainer');
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
          Non sono presenti attività future nel calendario del reparto. Aggiungi la prossima riunione o uscita per visualizzare presenze e quote.
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

  const { activity, badgeText, badgeClass } = upcomingInfo;
  const kpis = this.computeActivityDashboardKPIs ? this.computeActivityDashboardKPIs(activity, scouts, presences) : null;
  if (!kpis) return;

  const icon = getActivityIcon(activity.tipo);
  const actStart = toJsDate(activity.data);
  const dateFormatted = !isNaN(actStart.getTime())
    ? actStart.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Data non definita';
  const dateStr = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);

  const costNumber = Number(activity.costo) || 0;
  const costBadge = costNumber > 0
    ? `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300">Quota: € ${costNumber.toFixed(2)}</span>`
    : `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Gratuita</span>`;

  const attPerc = kpis.attendancePercentage;
  const attBarColor = attPerc >= 70 ? 'bg-amber-500' : (attPerc >= 40 ? 'bg-amber-500' : 'bg-gray-400');
  const payPerc = kpis.paymentPercentage;
  const payBarColor = payPerc >= 80 ? 'bg-emerald-600' : (payPerc >= 50 ? 'bg-amber-500' : 'bg-rose-500');

  container.innerHTML = `
    <div class="bg-white dark:bg-gray-800 border-2 border-green-600/30 dark:border-green-500/30 rounded-2xl p-5 sm:p-6 shadow-md transition relative overflow-hidden">
      <!-- Header Widget Prossima Attività -->
      <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 flex items-center gap-1">
              <span>${icon}</span>
              <span>${escapeHtml((activity.tipo || '').toUpperCase())}</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}">
              ${escapeHtml(badgeText)}
            </span>
            ${costBadge}
          </div>
          <h3 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white pt-1">
            ${escapeHtml(activity.descrizione || activity.tipo)}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>${escapeHtml(dateStr)}</span>
            ${activity.dataFine ? `<span class="text-gray-400">• Fine: ${toJsDate(activity.dataFine).toLocaleDateString('it-IT')}</span>` : ''}
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
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Gratuita</span>
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
            </div>
          ` : `
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Nessuna quota richiesta per questa attività di reparto.
            </p>
          `}
        </div>
      </div>
    </div>
  `;
};

/**
 * 3. Due attività oltre la prossima (Stile Calendario)
 */
UI.renderUpcomingNextTwoActivities = function () {
  const container = document.getElementById('homeFollowingActivitiesContainer');
  if (!container) return;

  const activities = (this.state.activities || []).slice();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Ordina per data crescente
  const validActs = activities
    .map(a => {
      const start = toJsDate(a.data);
      const end = a.dataFine ? toJsDate(a.dataFine) : start;
      return { raw: a, start, end };
    })
    .filter(a => a.start && !isNaN(a.start.getTime()))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Trova le attività future
  const upcomingActs = validActs.filter(a => {
    const end = a.end || a.start;
    return end >= today;
  });

  // Salta la prima (che è quella già mostrata nel widget principale)
  const followingTwo = upcomingActs.slice(1, 3);

  if (followingTwo.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <span class="text-2xl block mb-1">📅</span>
        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">Nessuna ulteriore attività programmata</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Pianifica le prossime riunioni o uscite nel calendario di reparto.</p>
        <div class="mt-3">
          <a href="calendario.html" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 transition">
            <span>➕</span> Aggiungi al Calendario
          </a>
        </div>
      </div>
    `;
    return;
  }

  let html = '';
  followingTwo.forEach(item => {
    const a = item.raw;
    const colors = getActivityColors(a.tipo);
    const d = item.start;
    const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' });
    let fullDateStr = dateStr;

    if (a.dataFine) {
      const dFine = toJsDate(a.dataFine);
      if (!isNaN(dFine.getTime())) {
        fullDateStr = `${dateStr} — ${dFine.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
      }
    }

    const costoLabel = parseFloat(a.costo || '0') > 0 ? ` • Costo: € ${a.costo}` : '';

    html += `
      <div class="p-4 ${colors.bg} border-l-4 ${colors.border} rounded-xl shadow-xs flex items-start justify-between gap-3 transition-all hover:shadow-md mb-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${colors.pill}">
              ${getActivityIcon(a.tipo)} ${escapeHtml(a.tipo)}
            </span>
          </div>
          <p class="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
            📅 ${escapeHtml(fullDateStr)}
          </p>
          <p class="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
            ${escapeHtml(a.descrizione || a.tipo)}${escapeHtml(costoLabel)}
          </p>
        </div>
        <div class="flex-shrink-0">
          <a href="attivita.html?id=${encodeURIComponent(a.id)}" aria-label="Apri dettagli attività" class="p-2 text-gray-500 hover:text-green-700 dark:hover:text-green-400 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors inline-block" title="Dettagli attività">
            📄
          </a>
        </div>
      </div>
    `;
  });

  // Se c'è solo un'attività successiva oltre alla prossima, aggiunge un card di invito
  if (followingTwo.length === 1) {
    html += `
      <div class="p-3.5 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Solo 1 attività successiva in calendario</span>
        <a href="calendario.html" class="text-xs font-bold text-green-700 dark:text-green-400 hover:underline">
          + Aggiungi
        </a>
      </div>
    `;
  }

  container.innerHTML = html;
};

/**
 * 4. Finestra inline per le prossime 5 scadenze
 */
UI.renderUpcomingDeadlinesWidget = function () {
  const container = document.getElementById('homeDeadlinesContainer');
  if (!container) return;

  const scoutYear = this.getCurrentScoutYear ? this.getCurrentScoutYear() : '2025/2026';
  const customDeadlines = this.state.scadenze || [];

  let allDeadlines = [];
  try {
    allDeadlines = getAllScoutYearDeadlines({
      scoutYear,
      activities: this.state.activities || [],
      presences: this.state.presences || [],
      scouts: this.state.scouts || [],
      customDeadlines,
      refDate: new Date()
    });
  } catch (e) {
    console.warn('Errore calcolo scadenze in Home:', e);
  }

  // Filtra per scadenze attive (non completate)
  const active = allDeadlines.filter(d => !d.completata);

  // Ordina per urgenza: scadute e oggi prima, poi imminenti e future
  active.sort((a, b) => {
    return a.dataScadenza.localeCompare(b.dataScadenza);
  });

  const next5 = active.slice(0, 5);

  if (next5.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <span class="text-2xl block mb-1">🎉</span>
        <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">Nessuna scadenza in sospeso</p>
        <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Tutte le scadenze e adempimenti risultano completati.</p>
        <div class="mt-3">
          <a href="scadenze.html" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 transition">
            Gestisci Scadenze ➔
          </a>
        </div>
      </div>
    `;
    return;
  }

  let html = '<div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">';

  next5.forEach(item => {
    // Configurazione visuale per tipologia
    let borderClass = 'border-l-4 border-gray-300 dark:border-gray-700';
    let bgClass = 'bg-white dark:bg-gray-800';
    let typeIcon = '⏰';

    if (item.type === 'activity') {
      borderClass = 'border-l-4 border-blue-500';
      bgClass = 'bg-blue-50/20 dark:bg-blue-950/20';
      typeIcon = '📅';
    } else if (item.type === 'payment') {
      borderClass = 'border-l-4 border-amber-500';
      bgClass = 'bg-amber-50/20 dark:bg-amber-950/20';
      typeIcon = '💶';
    } else if (item.type === 'birthday') {
      borderClass = 'border-l-4 border-purple-500';
      bgClass = 'bg-purple-50/20 dark:bg-purple-950/20';
      typeIcon = '🎂';
    } else if (item.type === 'custom') {
      borderClass = 'border-l-4 border-emerald-500';
      bgClass = 'bg-emerald-50/20 dark:bg-emerald-950/20';
      typeIcon = '📝';
    } else if (item.type === 'medical') {
      borderClass = item.status === 'scaduta' ? 'border-l-4 border-rose-500' : 'border-l-4 border-amber-500';
      bgClass = item.status === 'scaduta' ? 'bg-rose-50/20 dark:bg-rose-950/30' : 'bg-amber-50/20 dark:bg-amber-950/30';
      typeIcon = '🩺';
    }

    const d = toJsDate(item.dataScadenza);
    const dateFormatted = d ? d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) : item.dataScadenza;

    let countdownBadge = '';
    if (item.daysUntil === 0) {
      countdownBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 animate-pulse">🔥 OGGI</span>`;
    } else if (item.daysUntil === 1) {
      countdownBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">⏳ Domani</span>`;
    } else if (item.daysUntil > 1 && item.daysUntil <= 7) {
      countdownBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Tra ${item.daysUntil} gg</span>`;
    } else if (item.daysUntil > 7) {
      countdownBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Tra ${item.daysUntil} gg</span>`;
    } else {
      countdownBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Scaduta da ${Math.abs(item.daysUntil)} gg</span>`;
    }

    const targetUrl = item.url || 'scadenze.html';

    html += `
      <a href="${escapeHtml(targetUrl)}" class="block p-3 ${bgClass} ${borderClass} rounded-xl shadow-2xs hover:shadow-xs transition border border-gray-200/60 dark:border-gray-700/60 group">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-base flex-shrink-0">${typeIcon}</span>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                ${escapeHtml(item.titolo)}
              </h4>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                ${escapeHtml(item.descrizione || item.categoria)}
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            ${countdownBadge}
            <span class="text-[10px] text-gray-400 font-medium">📅 ${escapeHtml(dateFormatted)}</span>
          </div>
        </div>
      </a>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
};

/**
 * 5. Link esterni configurabili
 */
UI.getExternalLinks = function () {
  try {
    const prefs = this.loadUserPreferences ? this.loadUserPreferences() : {};
    if (Array.isArray(prefs.externalLinks) && prefs.externalLinks.length > 0) {
      return prefs.externalLinks;
    }
    const local = localStorage.getItem('maori_external_links');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Errore lettura externalLinks:', e);
  }
  return DEFAULT_EXTERNAL_LINKS;
};

UI.saveExternalLinks = async function (links) {
  try {
    localStorage.setItem('maori_external_links', JSON.stringify(links));
    if (this.loadUserPreferences && this.saveUserPreferences) {
      const prefs = this.loadUserPreferences();
      prefs.externalLinks = links;
      await this.saveUserPreferences(prefs);
    }
  } catch (e) {
    console.error('Errore salvataggio externalLinks:', e);
  }
};

UI.renderExternalLinksWidget = function () {
  const container = document.getElementById('homeExternalLinksContainer');
  if (!container) return;

  const links = this.getExternalLinks();

  if (!links || links.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <p class="text-xs text-gray-500 dark:text-gray-400">Nessun link configurato.</p>
        <button type="button" onclick="UI.openExternalLinkModal()" class="mt-2 text-xs font-semibold text-green-700 dark:text-green-400 underline">
          + Aggiungi il primo link
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = links.map(link => `
    <div class="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
            ${escapeHtml(link.icon || '🔗')}
          </span>
          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button type="button" onclick="UI.openExternalLinkModal('${escapeHtml(link.id)}')" 
              class="p-1 text-gray-400 hover:text-green-700 dark:hover:text-green-400 rounded transition" 
              title="Modifica link">
              ✏️
            </button>
            <button type="button" onclick="UI.deleteExternalLink('${escapeHtml(link.id)}')" 
              class="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition" 
              title="Elimina link">
              🗑️
            </button>
          </div>
        </div>
        <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug">
          ${escapeHtml(link.title)}
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          ${escapeHtml(link.description || '')}
        </p>
      </div>

      <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span class="text-[10px] text-gray-400 truncate max-w-[140px]">
          ${escapeHtml(link.url.replace(/^https?:\/\//, ''))}
        </span>
        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-xs transition">
          <span>Apri</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  `).join('');
};

/**
 * Gestione Modale per Aggiunta / Modifica Link Esterni
 */
UI.setupExternalLinksModal = function () {
  const form = document.getElementById('homeLinkModalForm');
  if (!form || form._bound) return;
  form._bound = true;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('homeLinkId');
    const titleInput = document.getElementById('homeLinkTitle');
    const urlInput = document.getElementById('homeLinkUrl');
    const iconInput = document.getElementById('homeLinkIcon');
    const descInput = document.getElementById('homeLinkDesc');

    const id = idInput?.value?.trim();
    const title = titleInput?.value?.trim();
    let url = urlInput?.value?.trim();
    const icon = iconInput?.value?.trim() || '🔗';
    const description = descInput?.value?.trim() || '';

    if (!title || !url) {
      UI.showToast('Titolo e URL sono obbligatori', { type: 'error' });
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const links = UI.getExternalLinks().slice();

    if (id) {
      // Modifica esistente
      const idx = links.findIndex(l => l.id === id);
      if (idx >= 0) {
        links[idx] = { id, title, url, icon, description };
      }
    } else {
      // Nuovo link
      const newId = 'link_' + Date.now().toString(36);
      links.push({ id: newId, title, url, icon, description });
    }

    await UI.saveExternalLinks(links);
    UI.closeModal('homeLinkModal');
    UI.renderExternalLinksWidget();
    UI.showToast(id ? 'Link aggiornato' : 'Link aggiunto con successo', { type: 'success' });
  });
};

UI.openExternalLinkModal = function (linkId = null) {
  const modal = document.getElementById('homeLinkModal');
  if (!modal) return;

  const idInput = document.getElementById('homeLinkId');
  const titleInput = document.getElementById('homeLinkTitle');
  const urlInput = document.getElementById('homeLinkUrl');
  const iconInput = document.getElementById('homeLinkIcon');
  const descInput = document.getElementById('homeLinkDesc');
  const titleHeader = document.getElementById('homeLinkModalTitle');

  if (linkId) {
    const link = this.getExternalLinks().find(l => l.id === linkId);
    if (link) {
      if (titleHeader) titleHeader.textContent = 'Modifica Link Esterno';
      if (idInput) idInput.value = link.id;
      if (titleInput) titleInput.value = link.title;
      if (urlInput) urlInput.value = link.url;
      if (iconInput) iconInput.value = link.icon || '🔗';
      if (descInput) descInput.value = link.description || '';
    }
  } else {
    if (titleHeader) titleHeader.textContent = 'Aggiungi Link Esterno';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (urlInput) urlInput.value = '';
    if (iconInput) iconInput.value = '🔗';
    if (descInput) descInput.value = '';
  }

  this.showModal('homeLinkModal');
  if (titleInput) titleInput.focus();
};

UI.deleteExternalLink = async function (linkId) {
  const link = this.getExternalLinks().find(l => l.id === linkId);
  const title = link ? link.title : 'questo link';

  const confirmed = await new Promise(resolve => {
    if (typeof this.showConfirmModal === 'function') {
      this.showConfirmModal({
        title: 'Elimina link esterno',
        message: `Sei sicuro di voler rimuovere "${title}" dai link rapidi?`,
        confirmText: 'Elimina',
        cancelText: 'Annulla',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    } else {
      resolve(confirm(`Rimuovere "${title}" dai link rapidi?`));
    }
  });

  if (!confirmed) return;

  const links = this.getExternalLinks().filter(l => l.id !== linkId);
  await this.saveExternalLinks(links);
  this.renderExternalLinksWidget();
  this.showToast('Link rimosso', { type: 'info' });
};

UI.setupHomeEventListeners = function () {
  const addBtn = document.getElementById('addExternalLinkBtn');
  if (addBtn && !addBtn._bound) {
    addBtn._bound = true;
    addBtn.addEventListener('click', () => {
      this.openExternalLinkModal();
    });
  }

  const resetBtn = document.getElementById('resetExternalLinksBtn');
  if (resetBtn && !resetBtn._bound) {
    resetBtn._bound = true;
    resetBtn.addEventListener('click', async () => {
      const confirmed = await new Promise(resolve => {
        if (typeof this.showConfirmModal === 'function') {
          this.showConfirmModal({
            title: 'Ripristina link predefiniti',
            message: 'Vuoi ripristinare i link esterni consigliati di default?',
            confirmText: 'Ripristina',
            cancelText: 'Annulla',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        } else {
          resolve(confirm('Ripristinare i link predefiniti?'));
        }
      });
      if (confirmed) {
        await this.saveExternalLinks(DEFAULT_EXTERNAL_LINKS);
        this.renderExternalLinksWidget();
        this.showToast('Link predefiniti ripristinati', { type: 'success' });
      }
    });
  }
};
