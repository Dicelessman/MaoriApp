import{U as E,t as f,e as d,g as $}from"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";const g=typeof window<"u"&&window.UI?window.UI:E,k=[{id:"link_gdrive",title:"Google Drive di Reparto",url:"https://drive.google.com",icon:"📁",description:"Cartella condivisa staff: circolari, schede uscite, canzonieri e verbali"},{id:"link_cngei",title:"Portale CNGEI Nazionale",url:"https://cngei.it",icon:"⚜️",description:"Sito ufficiale dell'Associazione, regolamenti e modulistica nazionale"},{id:"link_meteo",title:"Meteo & Previsioni Uscite",url:"https://www.3bmeteo.com",icon:"⛅",description:"Previsioni meteo, temperature e allerte per uscite e bivacchi"},{id:"link_scoutwiki",title:"ScoutWiki & Tecniche Scout",url:"https://it.scoutwiki.org",icon:"🧭",description:"Manuali e schede pratiche di pionieristica, topografia, nodi e trappeur"}];function I(r){switch(r){case"Evento Adulti":return{bg:"bg-purple-50 dark:bg-purple-900/20",text:"text-purple-800 dark:text-purple-100",border:"border-purple-500",pill:"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200"};case"Riunione Adulti":return{bg:"bg-slate-50 dark:bg-slate-800/50",text:"text-slate-800 dark:text-slate-100",border:"border-slate-500",pill:"bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"};case"Eventi con esterni":return{bg:"bg-amber-50 dark:bg-amber-900/20",text:"text-amber-800 dark:text-amber-100",border:"border-amber-500",pill:"bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"};case"Uscita":return{bg:"bg-blue-50 dark:bg-blue-900/20",text:"text-blue-800 dark:text-blue-100",border:"border-blue-500",pill:"bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"};case"Campo":return{bg:"bg-red-50 dark:bg-red-900/20",text:"text-red-800 dark:text-red-100",border:"border-red-500",pill:"bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"};default:return{bg:"bg-emerald-50/70 dark:bg-emerald-950/20",text:"text-emerald-800 dark:text-emerald-200",border:"border-emerald-500",pill:"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"}}}function v(r){return{Riunione:"⏰","Attività lunga":"🌲",Uscita:"🥾",Campo:"🏕️","Evento Adulti":"⚜️","Riunione Adulti":"📋","Eventi con esterni":"🌟"}[r]||"📅"}g.renderCurrentPage=function(){this.renderHomeHero(),this.renderNextActivityWidgetHome(),this.renderUpcomingNextTwoActivities(),this.renderUpcomingDeadlinesWidget(),this.renderExternalLinksWidget(),this.setupExternalLinksModal()};g.renderHomeHero=function(){const r=document.getElementById("homeHeroBanner");if(!r)return;const n=new Date,i=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",o=n.getHours(),l=o<13?"Buon sentiero!":o<18?"Buon pomeriggio e Buona Caccia!":"Buona serata e Buona Caccia!",a=n.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),c=a.charAt(0).toUpperCase()+a.slice(1),e=typeof localStorage<"u"&&localStorage.getItem("unitType")||"Reparto",t=typeof localStorage<"u"&&localStorage.getItem("unitName")||"Maori";r.innerHTML=`
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 text-white p-5 sm:p-7 shadow-lg">
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-green-100 border border-white/30">
              ⚜️ ${e} ${t}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
              Anno Scout ${i}
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ${l}
          </h2>
          <p class="text-xs sm:text-sm text-green-100/90 mt-1 flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>${c}</span>
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
  `};g.renderNextActivityWidgetHome=function(){const r=document.getElementById("homeNextActivityContainer");if(!r)return;const n=this.state.activities||[],i=this.state.scouts||[],o=this.state.presences||[],l=this.findUpcomingActivity?this.findUpcomingActivity(n):null;if(!l||!l.activity){r.innerHTML=`
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
    `;return}const{activity:a,badgeText:c,badgeClass:e}=l,t=this.computeActivityDashboardKPIs?this.computeActivityDashboardKPIs(a,i,o):null;if(!t)return;const s=v(a.tipo),x=f(a.data),u=isNaN(x.getTime())?"Data non definita":x.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),b=u.charAt(0).toUpperCase()+u.slice(1),p=Number(a.costo)||0,m=p>0?`<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300">Quota: € ${p.toFixed(2)}</span>`:'<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Gratuita</span>',y=t.attendancePercentage,w=y>=70||y>=40?"bg-amber-500":"bg-gray-400",h=t.paymentPercentage,L=h>=80?"bg-emerald-600":h>=50?"bg-amber-500":"bg-rose-500";r.innerHTML=`
    <div class="bg-white dark:bg-gray-800 border-2 border-green-600/30 dark:border-green-500/30 rounded-2xl p-5 sm:p-6 shadow-md transition relative overflow-hidden">
      <!-- Header Widget Prossima Attività -->
      <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 flex items-center gap-1">
              <span>${s}</span>
              <span>${d((a.tipo||"").toUpperCase())}</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${e}">
              ${d(c)}
            </span>
            ${m}
          </div>
          <h3 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white pt-1">
            ${d(a.descrizione||a.tipo)}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>${d(b)}</span>
            ${a.dataFine?`<span class="text-gray-400">• Fine: ${f(a.dataFine).toLocaleDateString("it-IT")}</span>`:""}
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
              ${t.presentCount} / ${t.totalActiveScouts} (${y}%)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
            <div class="${w} h-2.5 rounded-full transition-all duration-500" style="width: ${y}%"></div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              ✓ ${t.presentCount} Presenti
            </span>
            <span class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
              ✗ ${t.absentCount} Assenti
            </span>
            <span class="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              ⏳ ${t.unrecordedCount} Da registrare
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
            ${t.isPaidActivity?`
              <span class="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                € ${t.totalCollected.toFixed(2)} / € ${t.totalExpected.toFixed(2)} (${h}%)
              </span>
            `:`
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Gratuita</span>
            `}
          </div>

          ${t.isPaidActivity?`
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
              <div class="${L} h-2.5 rounded-full transition-all duration-500" style="width: ${h}%"></div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  ✓ ${t.paidCount} Saldati
                </span>
                <span class="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  ⏳ ${t.unpaidCount} In sospeso
                </span>
              </div>
            </div>
          `:`
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Nessuna quota richiesta per questa attività di reparto.
            </p>
          `}
        </div>
      </div>
    </div>
  `};g.renderUpcomingNextTwoActivities=function(){const r=document.getElementById("homeFollowingActivitiesContainer");if(!r)return;const n=(this.state.activities||[]).slice(),i=new Date;i.setHours(0,0,0,0);const a=n.map(e=>{const t=f(e.data),s=e.dataFine?f(e.dataFine):t;return{raw:e,start:t,end:s}}).filter(e=>e.start&&!isNaN(e.start.getTime())).sort((e,t)=>e.start.getTime()-t.start.getTime()).filter(e=>(e.end||e.start)>=i).slice(1,3);if(a.length===0){r.innerHTML=`
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
    `;return}let c="";a.forEach(e=>{const t=e.raw,s=I(t.tipo),u=e.start.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"});let b=u;if(t.dataFine){const m=f(t.dataFine);isNaN(m.getTime())||(b=`${u} — ${m.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"})}`)}const p=parseFloat(t.costo||"0")>0?` • Costo: € ${t.costo}`:"";c+=`
      <div class="p-4 ${s.bg} border-l-4 ${s.border} rounded-xl shadow-xs flex items-start justify-between gap-3 transition-all hover:shadow-md mb-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${s.pill}">
              ${v(t.tipo)} ${d(t.tipo)}
            </span>
          </div>
          <p class="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
            📅 ${d(b)}
          </p>
          <p class="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
            ${d(t.descrizione||t.tipo)}${d(p)}
          </p>
        </div>
        <div class="flex-shrink-0">
          <a href="attivita.html?id=${encodeURIComponent(t.id)}" aria-label="Apri dettagli attività" class="p-2 text-gray-500 hover:text-green-700 dark:hover:text-green-400 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors inline-block" title="Dettagli attività">
            📄
          </a>
        </div>
      </div>
    `}),a.length===1&&(c+=`
      <div class="p-3.5 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">Solo 1 attività successiva in calendario</span>
        <a href="calendario.html" class="text-xs font-bold text-green-700 dark:text-green-400 hover:underline">
          + Aggiungi
        </a>
      </div>
    `),r.innerHTML=c};g.renderUpcomingDeadlinesWidget=function(){const r=document.getElementById("homeDeadlinesContainer");if(!r)return;const n=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",i=this.state.scadenze||[];let o=[];try{o=$({scoutYear:n,activities:this.state.activities||[],presences:this.state.presences||[],scouts:this.state.scouts||[],customDeadlines:i,refDate:new Date})}catch(e){console.warn("Errore calcolo scadenze in Home:",e)}const l=o.filter(e=>!e.completata);l.sort((e,t)=>e.dataScadenza.localeCompare(t.dataScadenza));const a=l.slice(0,5);if(a.length===0){r.innerHTML=`
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
    `;return}let c='<div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">';a.forEach(e=>{let t="border-l-4 border-gray-300 dark:border-gray-700",s="bg-white dark:bg-gray-800",x="⏰";e.type==="activity"?(t="border-l-4 border-blue-500",s="bg-blue-50/20 dark:bg-blue-950/20",x="📅"):e.type==="payment"?(t="border-l-4 border-amber-500",s="bg-amber-50/20 dark:bg-amber-950/20",x="💶"):e.type==="birthday"?(t="border-l-4 border-purple-500",s="bg-purple-50/20 dark:bg-purple-950/20",x="🎂"):e.type==="custom"?(t="border-l-4 border-emerald-500",s="bg-emerald-50/20 dark:bg-emerald-950/20",x="📝"):e.type==="medical"&&(t=e.status==="scaduta"?"border-l-4 border-rose-500":"border-l-4 border-amber-500",s=e.status==="scaduta"?"bg-rose-50/20 dark:bg-rose-950/30":"bg-amber-50/20 dark:bg-amber-950/30",x="🩺");const u=f(e.dataScadenza),b=u?u.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"}):e.dataScadenza;let p="";e.daysUntil===0?p='<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 animate-pulse">🔥 OGGI</span>':e.daysUntil===1?p='<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">⏳ Domani</span>':e.daysUntil>1&&e.daysUntil<=7?p=`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Tra ${e.daysUntil} gg</span>`:e.daysUntil>7?p=`<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">Tra ${e.daysUntil} gg</span>`:p=`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Scaduta da ${Math.abs(e.daysUntil)} gg</span>`;const m=e.url||"scadenze.html";c+=`
      <a href="${d(m)}" class="block p-3 ${s} ${t} rounded-xl shadow-2xs hover:shadow-xs transition border border-gray-200/60 dark:border-gray-700/60 group">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-base flex-shrink-0">${x}</span>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                ${d(e.titolo)}
              </h4>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                ${d(e.descrizione||e.categoria)}
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            ${p}
            <span class="text-[10px] text-gray-400 font-medium">📅 ${d(b)}</span>
          </div>
        </div>
      </a>
    `}),c+="</div>",r.innerHTML=c};g.getExternalLinks=function(){try{const r=this.loadUserPreferences?this.loadUserPreferences():{};if(Array.isArray(r.externalLinks)&&r.externalLinks.length>0)return r.externalLinks;const n=localStorage.getItem("maori_external_links");if(n){const i=JSON.parse(n);if(Array.isArray(i)&&i.length>0)return i}}catch(r){console.warn("Errore lettura externalLinks:",r)}return k};g.saveExternalLinks=async function(r){try{if(localStorage.setItem("maori_external_links",JSON.stringify(r)),this.loadUserPreferences&&this.saveUserPreferences){const n=this.loadUserPreferences();n.externalLinks=r,await this.saveUserPreferences(n)}}catch(n){console.error("Errore salvataggio externalLinks:",n)}};g.renderExternalLinksWidget=function(){const r=document.getElementById("homeExternalLinksContainer");if(!r)return;const n=this.getExternalLinks();if(!n||n.length===0){r.innerHTML=`
      <div class="col-span-full p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <p class="text-xs text-gray-500 dark:text-gray-400">Nessun link configurato.</p>
        <button type="button" onclick="UI.openExternalLinkModal()" class="mt-2 text-xs font-semibold text-green-700 dark:text-green-400 underline">
          + Aggiungi il primo link
        </button>
      </div>
    `;return}r.innerHTML=n.map(i=>`
    <div class="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
            ${d(i.icon||"🔗")}
          </span>
          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button type="button" onclick="UI.openExternalLinkModal('${d(i.id)}')" 
              class="p-1 text-gray-400 hover:text-green-700 dark:hover:text-green-400 rounded transition" 
              title="Modifica link">
              ✏️
            </button>
            <button type="button" onclick="UI.deleteExternalLink('${d(i.id)}')" 
              class="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition" 
              title="Elimina link">
              🗑️
            </button>
          </div>
        </div>
        <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug">
          ${d(i.title)}
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          ${d(i.description||"")}
        </p>
      </div>

      <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span class="text-[10px] text-gray-400 truncate max-w-[140px]">
          ${d(i.url.replace(/^https?:\/\//,""))}
        </span>
        <a href="${d(i.url)}" target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-xs transition">
          <span>Apri</span>
          <span>↗</span>
        </a>
      </div>
    </div>
  `).join("")};g.setupExternalLinksModal=function(){const r=document.getElementById("homeLinkModalForm");!r||r._bound||(r._bound=!0,r.addEventListener("submit",async n=>{n.preventDefault();const i=document.getElementById("homeLinkId"),o=document.getElementById("homeLinkTitle"),l=document.getElementById("homeLinkUrl"),a=document.getElementById("homeLinkIcon"),c=document.getElementById("homeLinkDesc"),e=i?.value?.trim(),t=o?.value?.trim();let s=l?.value?.trim();const x=a?.value?.trim()||"🔗",u=c?.value?.trim()||"";if(!t||!s){g.showToast("Titolo e URL sono obbligatori",{type:"error"});return}!s.startsWith("http://")&&!s.startsWith("https://")&&(s="https://"+s);const b=g.getExternalLinks().slice();if(e){const p=b.findIndex(m=>m.id===e);p>=0&&(b[p]={id:e,title:t,url:s,icon:x,description:u})}else{const p="link_"+Date.now().toString(36);b.push({id:p,title:t,url:s,icon:x,description:u})}await g.saveExternalLinks(b),g.closeModal("homeLinkModal"),g.renderExternalLinksWidget(),g.showToast(e?"Link aggiornato":"Link aggiunto con successo",{type:"success"})}))};g.openExternalLinkModal=function(r=null){if(!document.getElementById("homeLinkModal"))return;const i=document.getElementById("homeLinkId"),o=document.getElementById("homeLinkTitle"),l=document.getElementById("homeLinkUrl"),a=document.getElementById("homeLinkIcon"),c=document.getElementById("homeLinkDesc"),e=document.getElementById("homeLinkModalTitle");if(r){const t=this.getExternalLinks().find(s=>s.id===r);t&&(e&&(e.textContent="Modifica Link Esterno"),i&&(i.value=t.id),o&&(o.value=t.title),l&&(l.value=t.url),a&&(a.value=t.icon||"🔗"),c&&(c.value=t.description||""))}else e&&(e.textContent="Aggiungi Link Esterno"),i&&(i.value=""),o&&(o.value=""),l&&(l.value=""),a&&(a.value="🔗"),c&&(c.value="");this.showModal("homeLinkModal"),o&&o.focus()};g.deleteExternalLink=async function(r){const n=this.getExternalLinks().find(a=>a.id===r),i=n?n.title:"questo link";if(!await new Promise(a=>{typeof this.showConfirmModal=="function"?this.showConfirmModal({title:"Elimina link esterno",message:`Sei sicuro di voler rimuovere "${i}" dai link rapidi?`,confirmText:"Elimina",cancelText:"Annulla",onConfirm:()=>a(!0),onCancel:()=>a(!1)}):a(confirm(`Rimuovere "${i}" dai link rapidi?`))}))return;const l=this.getExternalLinks().filter(a=>a.id!==r);await this.saveExternalLinks(l),this.renderExternalLinksWidget(),this.showToast("Link rimosso",{type:"info"})};g.setupHomeEventListeners=function(){const r=document.getElementById("addExternalLinkBtn");r&&!r._bound&&(r._bound=!0,r.addEventListener("click",()=>{this.openExternalLinkModal()}));const n=document.getElementById("resetExternalLinksBtn");n&&!n._bound&&(n._bound=!0,n.addEventListener("click",async()=>{await new Promise(o=>{typeof this.showConfirmModal=="function"?this.showConfirmModal({title:"Ripristina link predefiniti",message:"Vuoi ripristinare i link esterni consigliati di default?",confirmText:"Ripristina",cancelText:"Annulla",onConfirm:()=>o(!0),onCancel:()=>o(!1)}):o(confirm("Ripristinare i link predefiniti?"))})&&(await this.saveExternalLinks(k),this.renderExternalLinksWidget(),this.showToast("Link predefiniti ripristinati",{type:"success"}))}))};
