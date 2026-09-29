import{U as N}from"./date-picker-4UQZC6Oi.js";/* empty css              */import"./shared-CWcRGm4L.js";import{c as _}from"./cngei-service-DZdKacRO.js";import{c as T,a as L,s as D}from"./cngei-progressioni-DygIf-W3.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";import"./cngei-sync-DwYf0NUJ.js";const k=typeof window<"u"&&window.UI?window.UI:N;k.toJsDate=function(t){if(!t)return null;if(t instanceof Date)return t;if(t&&t.toDate)return t.toDate();const r=new Date(t);return isNaN(r.getTime())?null:r};k.getAnnoEsploratore=function(t){if(!t)return null;const r=this.toJsDate(t);if(!r)return null;const a=new Date;let g=a.getFullYear()-r.getFullYear();const p=a.getMonth()-r.getMonth();return(p<0||p===0&&a.getDate()<r.getDate())&&g--,g};k.getAnnoScout=function(t){const r=this.getAnnoEsploratore(t);return r===null?null:r>=11&&r<=12?"I°":r===13?"II°":r===14?"III°":r===15?"IV°":null};k.getCurrentScoutYearSmart=function(){const t=typeof this.getCurrentScoutYear=="function"?this.getCurrentScoutYear():null,r=this.state.activities||[];if(r.length===0)return t||"2025/2026";if(t&&r.some(p=>this.isActivityInScoutYear?this.isActivityInScoutYear(p,t):!1))return t;const g=(typeof this.getAllScoutYears=="function"?this.getAllScoutYears(r):[]).filter(p=>p!=="all"&&r.some(c=>this.isActivityInScoutYear?this.isActivityInScoutYear(c,p):!1));return g.length>0?g[0]:t||"2025/2026"};k.setupStatsScoutYearSelector=function(){const t=document.getElementById("statsScoutYearSelect");if(!t)return;const r=this.getCurrentScoutYearSmart(),a=typeof this.getAllScoutYears=="function"?this.getAllScoutYears(this.state.activities):[r];a.includes(r)||a.unshift(r),this.selectedStatsScoutYear||(this.selectedStatsScoutYear=r),t.innerHTML="",a.forEach(c=>{const e=c===r?`${c} (In corso)`:`${c} (Archiviato)`,i=document.createElement("option");i.value=c,i.textContent=e,c===this.selectedStatsScoutYear&&(i.selected=!0),t.appendChild(i)});const g=document.createElement("option");g.value="all",g.textContent="Tutti gli anni (Globale)",this.selectedStatsScoutYear==="all"&&(g.selected=!0),t.appendChild(g);const p=document.getElementById("statsArchiveBadge");if(p){const c=this.selectedStatsScoutYear!=="all"&&this.selectedStatsScoutYear!==r;p.classList.toggle("hidden",!c)}t._bound||(t._bound=!0,t.addEventListener("change",async c=>{this.selectedStatsScoutYear=c.target.value,this.setSelectedScoutYear&&c.target.value!=="all"&&await this.setSelectedScoutYear(c.target.value),this.renderCurrentPage()}))};k._charts=k._charts||{scout:null,activity:null};k._destroyCharts=function(){try{this._charts.scout&&(this._charts.scout.destroy(),this._charts.scout=null)}catch{}try{this._charts.activity&&(this._charts.activity.destroy(),this._charts.activity=null)}catch{}};k.renderCurrentPage=function(){this.setupStatsScoutYearSelector(),this.renderDashboardCharts(),this.renderAttendanceGrid(),this.renderTotaleEsploratoriWidget(),this.renderProgressioniWidget(),this.renderComposizionePattuglia(),this.renderPattuglieTable(),this.renderRiepilogoSpecialita(),this.setupRepartoProgressioniEvents()};k.renderDashboardCharts=function(){const t=this.state.scouts||[],r=this.state.activities||[],a=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],g=document.getElementById("scoutPresenceChart"),p=document.getElementById("activityPresenceChart");if(!g||!p)return;this._destroyCharts();const c=this.getCurrentScoutYearSmart(),l=this.selectedStatsScoutYear||c,e=l==="all",i=d=>this.toJsDate(d)||new Date(d),b=[...r].filter(d=>e||(this.isActivityInScoutYear?this.isActivityInScoutYear(d,l):!0)).sort((d,I)=>i(d.data)-i(I.data)),o=new Date;o.setHours(0,0,0,0);let u=null;b.forEach(d=>{const I=i(d.data),$=new Date(I);$.setHours(0,0,0,0),u===null&&$>=o&&(u=d.id)});const x=b.filter(d=>{const I=i(d.data),$=new Date(I);return $.setHours(0,0,0,0),$<o}).map(d=>d.id);let f=u?[...x,u]:x;f.length===0&&b.length>0&&(f=b.map(d=>d.id));const m=t.map(d=>{const I=f.filter(w=>{const P=a.find(A=>A.esploratoreId===d.id&&A.attivitaId===w);return P&&(P.stato==="Presente"||P.stato==="Assente")}),$=I.length,E=a.filter(w=>w.esploratoreId===d.id&&w.stato==="Presente"&&I.includes(w.attivitaId)).length,B=$?Math.round(E/$*100):0;return{name:`${d.nome||""} ${d.cognome||""}`.trim()||"Esploratore",perc:B,presentCount:E,totalActsConsidered:$}});m.sort((d,I)=>I.perc-d.perc);const s=m.map(d=>d.name),h=m.map(d=>d.perc),v=h.map(d=>d>=75?"#16a34a":d>=60?"#eab308":"#dc2626"),C=b.map(d=>{const I=i(d.data),$=isNaN(I)?"":I.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"});return`${d.tipo}: ${d.descrizione||""}
${$}`}),n=b.map(d=>a.filter(I=>I.attivitaId===d.id&&I.stato==="Presente").length),y=window.ChartDataLabels;window.Chart&&y&&window.Chart.register(y);const S={responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:8,right:12,bottom:8,left:12}},plugins:{legend:{display:!1},datalabels:{color:"#fff",formatter:d=>d>0?typeof d=="number"&&d<=100?d.toFixed(1)+"%":d:"",anchor:"end",align:"end",offset:-5,font:{weight:"bold"}}},elements:{bar:{borderRadius:4,maxBarThickness:28}}};this._charts.scout=new window.Chart(g.getContext("2d"),{type:"bar",data:{labels:s,datasets:[{label:"Presenze",data:h,backgroundColor:v}]},options:{...S,indexAxis:"y",scales:{x:{beginAtZero:!0,max:100,ticks:{callback:d=>d+"%"}},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...S.plugins,tooltip:{callbacks:{label:function(d){const I=m[d.dataIndex];return` ${I.perc}% (${I.presentCount} / ${I.totalActsConsidered} attività)`}}}}}}),this._charts.activity=new window.Chart(p.getContext("2d"),{type:"bar",data:{labels:C,datasets:[{label:"Presenze",data:n,backgroundColor:"#16a34a"}]},options:{...S,indexAxis:"y",scales:{x:{beginAtZero:!0,max:Math.max(1,t.length)},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...S.plugins,datalabels:{...S.plugins.datalabels,formatter:d=>d>0?`${d} / ${t.length}`:""}}}})};k.renderAttendanceGrid=function(){const t=document.getElementById("attendanceGrid");if(!t)return;const r=this.state.scouts||[],a=this.state.activities||[],g=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[];if(r.length===0){t.innerHTML='<p class="text-gray-500 italic p-4">Nessun esploratore registrato.</p>';return}const p=s=>this.toJsDate(s)||new Date(s),c=this.getCurrentScoutYearSmart(),l=this.selectedStatsScoutYear||c,e=l==="all",i=[...a].filter(s=>e||(this.isActivityInScoutYear?this.isActivityInScoutYear(s,l):!0)).sort((s,h)=>p(s.data)-p(h.data));if(i.length===0){t.innerHTML=`<p class="text-gray-500 italic p-4">Nessuna attività registrata per l'anno scout ${l}.</p>`;return}const b=new Date;b.setHours(0,0,0,0);const o=i.filter(s=>{const h=new Date(p(s.data));h.setHours(0,0,0,0);const v=g.some(C=>C.attivitaId===s.id&&(C.stato==="Presente"||C.stato==="Assente"));return h<=b||v}),u=o.length>0?o:i,x=u.map(s=>s.id),f=[...r].map(s=>{const h=x.filter(y=>{const S=g.find(d=>d.esploratoreId===s.id&&d.attivitaId===y);return S&&(S.stato==="Presente"||S.stato==="Assente")}),v=h.length,C=g.filter(y=>y.esploratoreId===s.id&&y.stato==="Presente"&&h.includes(y.attivitaId)).length,n=v?Math.round(C/v*100):0;return{...s,perc:n}}).sort((s,h)=>h.perc-s.perc);let m='<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';m+='<thead><tr class="bg-gray-100 dark:bg-gray-700/60">',m+='<th class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 w-44 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>',u.forEach(s=>{const h=p(s.data),v=isNaN(h)?"":h.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"});m+=`<th class="p-1.5 border border-gray-200 dark:border-gray-700 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[65px]" title="${s.tipo}: ${s.descrizione||""}">${v}</th>`}),m+="</tr></thead><tbody>",f.forEach(s=>{const h=`${s.nome||""} ${s.cognome||""}`.trim()||"Esploratore",v=s.id?`<a href="scout2.html?id=${encodeURIComponent(s.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline">${h}</a>`:h;m+=`<tr><td class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium text-gray-800 dark:text-gray-200 shadow-[1px_0_0_0_#e5e7eb]">${v}</td>`,u.forEach(C=>{const n=g.find(d=>d.esploratoreId===s.id&&d.attivitaId===C.id);let y="bg-white dark:bg-gray-700",S="Dato non inserito";n&&(n.stato==="Presente"?(y="bg-green-500",S="Presente"):n.stato==="Assente"?(y="bg-red-500",S="Assente"):n.stato.toLowerCase()==="x"||n.stato==="NR"||n.stato.toLowerCase()==="giustificato"?(y="bg-gray-400",S="Non tenuto a esserci / Giustificato"):(y="bg-gray-400",S=n.stato)),m+=`<td class="p-1.5 border border-gray-200 dark:border-gray-700 text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${y}" title="${S}"></div>
               </td>`}),m+="</tr>"}),m+="</tbody></table></div>",m+=`
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div> Dato mancante</div>
    </div>
  `,t.innerHTML=m};k.renderTotaleEsploratoriWidget=function(){const t=document.getElementById("totaleEsploratoriWidget");if(!t)return;const r=this.state.scouts||[],a=r.length;if(a===0){t.innerHTML='<p class="text-gray-500 italic">Nessun esploratore registrato.</p>';return}const g=r.filter(m=>m.anag_sesso?.toLowerCase()?.trim()==="maschio").length,p=r.filter(m=>m.anag_sesso?.toLowerCase()?.trim()==="femmina").length,c=a-g-p,l=Math.round(g/a*100),e=Math.round(p/a*100),i=c>0?Math.round(c/a*100):0,b={"I°":0,"II°":0,"III°":0,"IV°":0,Altro:0},o=[];r.forEach(m=>{const s=this.getAnnoScout(m.anag_dob);s&&b[s]!==void 0?b[s]++:b.Altro++;const h=this.getAnnoEsploratore(m.anag_dob);h!==null&&o.push(h)});const u=o.length>0?(o.reduce((m,s)=>m+s,0)/o.length).toFixed(1):"—",x=o.length>0?Math.min(...o):null,f=o.length>0?Math.max(...o):null;t.innerHTML=`
    <div class="space-y-5">
      <!-- 1. Conteggi principali con sesso evidenziato -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Totale Esploratori Card -->
        <div class="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p class="text-green-100 text-xs font-bold uppercase tracking-wider">Censiti in Reparto</p>
            <p class="text-4xl font-extrabold mt-1">${a}</p>
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
              <p class="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">${g}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
              ${l}%
            </span>
          </div>
          <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style="width: ${l}%"></div>
          </div>
        </div>

        <!-- Femmine Card -->
        <div class="bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 p-5 rounded-xl shadow-xs">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 flex items-center gap-1.5">
                <span>♀</span> Femmine
              </span>
              <p class="text-3xl font-extrabold text-pink-900 dark:text-pink-100 mt-1">${p}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700">
              ${e}%
            </span>
          </div>
          <div class="w-full bg-pink-200 dark:bg-pink-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-pink-500 h-2.5 rounded-full transition-all duration-500" style="width: ${e}%"></div>
          </div>
        </div>
      </div>

      <!-- 2. Barra di bilanciamento di genere -->
      <div class="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs font-bold mb-2">
          <span class="text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <span>♂</span> Maschi: ${g} (${l}%)
          </span>
          ${c>0?`<span class="text-gray-500 dark:text-gray-400">Non reg.: ${c} (${i}%)</span>`:""}
          <span class="text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <span>♀</span> Femmine: ${p} (${e}%)
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
          <div class="bg-blue-600 h-3 transition-all duration-500" style="width: ${l}%" title="Maschi ${l}%"></div>
          ${c>0?`<div class="bg-gray-400 h-3 transition-all duration-500" style="width: ${i}%" title="Non reg. ${i}%"></div>`:""}
          <div class="bg-pink-500 h-3 transition-all duration-500" style="width: ${e}%" title="Femmine ${e}%"></div>
        </div>
      </div>

      <!-- 3. Distribuzione per Anno Scout & Età -->
      <div class="bg-white dark:bg-gray-800/80 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>📅</span> Distribuzione per Anno Scout (Progressione per Età)
          </h4>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            Età media: <strong class="text-gray-800 dark:text-gray-100">${u} anni</strong>
            ${x&&f?` · Range: ${x}-${f} anni`:""}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">I° Anno (11-12)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["I°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["I°"]/a*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">II° Anno (13)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["II°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["II°"]/a*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">III° Anno (14)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["III°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["III°"]/a*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">IV° Anno (15)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["IV°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["IV°"]/a*100)}%</span>
          </div>
        </div>
      </div>
    </div>
  `};k.renderProgressioniWidget=function(){const t=document.getElementById("progressioniWidget");if(!t)return;const r=this.state.scouts||[],a=this.getCurrentScoutYearSmart(),g=this.selectedStatsScoutYear||a,p=g==="all",c=this.getScoutYearDateRange?this.getScoutYearDateRange(g):null,l=p?"Tutti gli anni (Globale)":`Anno Scout ${g}`,e={1:0,2:0,3:0};r.forEach(u=>{[1,2,3].forEach(x=>{const f=u[`pv_traccia${x}`];if(f&&f.done)if(p)e[x]++;else if(f.data){const m=this.toJsDate(f.data);m&&c&&m>=c.start&&m<=c.end&&e[x]++}else g===a&&e[x]++})});const i=e[1]+e[2]+e[3];let b=0;r.forEach(u=>{u.specialita&&Array.isArray(u.specialita)&&u.specialita.forEach(x=>{if(x.ottenuta)if(p)b++;else if(x.data){const f=this.toJsDate(x.data);f&&c&&f>=c.start&&f<=c.end&&b++}else g===a&&b++})});const o=i+b;t.innerHTML=`
    <div class="space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Progressioni Conquistate</span>
          <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            ${o} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">traguardi ottenuti</span>
          </h4>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
          📅 ${l}
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
                <p class="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">${i}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Progressione Verticale
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 text-center">
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">I° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${e[1]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">II° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${e[2]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">III° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${e[3]}</span>
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
                <p class="text-2xl font-extrabold text-purple-900 dark:text-purple-100">${b}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
              Progressione Orizzontale
            </span>
          </div>
          <div class="mt-4 pt-3 border-t border-purple-200/60 dark:border-purple-800/60">
            <p class="text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
              <span>Brevetti e competenze conquistate</span>
              <span class="font-bold text-purple-900 dark:text-purple-100">${b} specialità</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `};k.renderComposizionePattuglia=function(){const t=document.getElementById("totaliStats");if(!t)return;const r=this.state.scouts||[],a={};r.forEach(c=>{const l=c.pv_pattuglia||"Non assegnata";a[l]||(a[l]={m:0,f:0,altro:0,tot:0});const e=c.anag_sesso?.toLowerCase()?.trim();a[l].tot++,e==="maschio"?a[l].m++:e==="femmina"?a[l].f++:a[l].altro++});const p=Object.keys(a).sort((c,l)=>c==="Non assegnata"?1:l==="Non assegnata"?-1:c.localeCompare(l)).map(c=>{const l=a[c];let e="Non definita",i="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";return l.tot===0?e="Vuota":l.m>0&&l.f===0&&l.altro===0?(e="♂ Maschile",i="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"):l.f>0&&l.m===0&&l.altro===0?(e="♀ Femminile",i="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700"):l.m>0&&l.f>0&&(e="⚥ Mista",i="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700"),`
      <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">${c}</td>
        <td class="p-3 text-center font-bold text-gray-700 dark:text-gray-200">${l.tot}</td>
        <td class="p-3 text-center">
          <span class="inline-block px-3 py-1 text-xs font-bold rounded-full ${i}">${e}</span>
        </td>
      </tr>
    `}).join("");t.innerHTML=`
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b bg-gray-100 dark:bg-gray-700/60">
            <th class="text-left p-2.5 font-semibold text-gray-700 dark:text-gray-200">Pattuglia</th>
            <th class="text-center p-2.5 font-semibold text-gray-700 dark:text-gray-200">Totale Esploratori</th>
            <th class="text-center p-2.5 font-semibold text-gray-700 dark:text-gray-200">Identificativo Genere</th>
          </tr>
        </thead>
        <tbody>${p||'<tr><td colspan="3" class="p-4 text-center text-gray-500">Nessuna pattuglia trovata</td></tr>'}</tbody>
      </table>
    </div>
  `};k.renderPattuglieTable=function(t){t&&(this._pattuglieTableScouts=t);const r=this._pattuglieTableScouts||this.state.scouts||[];this._pattuglieSortState||(this._pattuglieSortState={field:"nome",direction:"asc"});const a={};r.forEach(o=>{const u=o.pv_pattuglia||"Non assegnata";a[u]||(a[u]=[]);const x=this.getAnnoScout(o.anag_dob);let f="-";o.pv_traccia3?.done?f="3":o.pv_traccia2?.done?f="2":o.pv_traccia1?.done&&(f="1");let m=0;const s=[];o.specialita&&Array.isArray(o.specialita)&&o.specialita.forEach(v=>{v.ottenuta&&v.nome&&(m++,s.push(v.nome.trim()))});const h=o.pv_vcp_cp||"";a[u].push({id:o.id,nome:`${o.nome||""} ${o.cognome||""}`.trim()||"Nome non disponibile",annoScout:x||"N/A",cpVcp:h,passo:f,numSpecialita:m,specialitaNames:s})});const g=this._pattuglieSortState.field,p=this._pattuglieSortState.direction;Object.keys(a).forEach(o=>{a[o].sort((u,x)=>{let f=0;if(g==="nome")f=u.nome.localeCompare(x.nome);else if(g==="annoScout"){const m={"I°":1,"II°":2,"III°":3,"IV°":4,"N/A":5},s=m[u.annoScout]||5,h=m[x.annoScout]||5;f=s-h,f===0&&(f=u.nome.localeCompare(x.nome))}return p==="asc"?f:-f})});const c=Object.keys(a).sort((o,u)=>o==="Non assegnata"?1:u==="Non assegnata"?-1:o.localeCompare(u)),l=document.getElementById("sortNomeIcon"),e=document.getElementById("sortAnnoScoutIcon");l&&(l.textContent=g==="nome"?p==="asc"?"↑":"↓":"↕"),e&&(e.textContent=g==="annoScout"?p==="asc"?"↑":"↓":"↕");const i=document.getElementById("pattuglieTableBody");if(!i)return;let b="";if(c.forEach(o=>{const u=a[o];u.forEach((x,f)=>{const m=x.id?`<a href="scout2.html?id=${encodeURIComponent(x.id)}" class="text-green-700 dark:text-green-400 font-semibold hover:underline">${x.nome}</a>`:`<span class="text-gray-800 dark:text-gray-200">${x.nome}</span>`,s=x.numSpecialita>0?`
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60" title="${x.numSpecialita} specialità conquistate">
                ${x.numSpecialita}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">${x.numSpecialita===1,"specialità"}</span>
            </div>
            <div class="flex flex-wrap items-center">
              ${x.specialitaNames.map(h=>`<span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-[11px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-normal mr-1 mb-1">${h}</span>`).join("")}
            </div>
          </div>
        `:'<span class="text-xs text-gray-400 dark:text-gray-500 italic">0</span>';b+=`
        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
          ${f===0?`<td class="p-2.5 font-semibold text-gray-800 dark:text-gray-100 align-top" rowspan="${u.length}">${o}</td>`:""}
          <td class="p-2.5 align-top">${m}</td>
          <td class="p-2.5 align-top text-gray-600 dark:text-gray-300">${x.annoScout}</td>
          <td class="p-2.5 align-top text-gray-600 dark:text-gray-300 font-medium">${x.cpVcp}</td>
          <td class="p-2.5 align-top text-gray-600 dark:text-gray-300">${x.passo}</td>
          <td class="p-2.5 align-top">${s}</td>
        </tr>
      `})}),i.innerHTML=b||'<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>',!this._pattuglieSortListenersAdded){const o=document.getElementById("sortNome"),u=document.getElementById("sortAnnoScout");o&&o.addEventListener("click",()=>{this._pattuglieSortState.field==="nome"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="nome",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),u&&u.addEventListener("click",()=>{this._pattuglieSortState.field==="annoScout"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="annoScout",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),this._pattuglieSortListenersAdded=!0}};k.renderRiepilogoSpecialita=function(){const t=document.getElementById("tempiSpecialitaStats");if(!t)return;const r=this.state.scouts||[],a={};r.forEach(e=>{e.specialita&&Array.isArray(e.specialita)&&e.specialita.forEach(i=>{i.ottenuta&&i.nome&&(a[i.nome]=(a[i.nome]||0)+1)})});const g=Object.entries(a).sort((e,i)=>i[1]-e[1]).slice(0,5),p=r.filter(e=>!e.specialita||!Array.isArray(e.specialita)?!0:e.specialita.filter(i=>i.ottenuta).length===0),c=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🏅</span> Top 5 Specialità Conquistate
      </div>
      ${g.length>0?`<ol class="space-y-2">
            ${g.map(([e,i],b)=>`
              <li class="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span class="text-gray-700 dark:text-gray-300 font-medium">${b+1}. ${e}</span>
                <span class="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full text-xs">${i}</span>
              </li>`).join("")}
          </ol>`:'<p class="text-xs text-gray-500 italic">Nessuna specialità registrata.</p>'}
    </div>
  `,l=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
        <span class="flex items-center gap-2"><span>🎯</span> Senza specialità</span>
        <span class="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full text-xs">${p.length}</span>
      </div>
      ${p.length>0?`<ul class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-700">
            ${p.map(e=>{const i=`${e.nome||""} ${e.cognome||""}`.trim()||"Esploratore",b=e.pv_pattuglia?`(${e.pv_pattuglia})`:"";return`<li class="pt-1 flex items-center justify-between">
                <a href="scout2.html?id=${encodeURIComponent(e.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline font-medium">${i}</a>
                <span class="text-gray-400 text-[10px]">${b}</span>
              </li>`}).join("")}
          </ul>`:'<div class="text-xs text-green-600 dark:text-green-400 font-medium">Tutti gli esploratori hanno almeno una specialità! 🎉</div>'}
    </div>
  `;t.innerHTML=c+l};k.setupRepartoProgressioniEvents=function(){const t=document.getElementById("btnExportCngeiProgressioniReparto");t&&!t._bound&&(t._bound=!0,t.addEventListener("click",()=>this.openCngeiRepartoProgressioniModal()));const r=document.getElementById("closeRepartoProgModalBtn");r&&!r._bound&&(r._bound=!0,r.addEventListener("click",()=>this.closeModal("cngeiRepartoProgressioniModal")));const a=document.getElementById("cancelRepartoProgModalBtn");a&&!a._bound&&(a._bound=!0,a.addEventListener("click",()=>this.closeModal("cngeiRepartoProgressioniModal")));const g=document.getElementById("tabPendingProgBtn"),p=document.getElementById("tabSyncedProgBtn"),c=document.getElementById("repartoProgPendingContainer"),l=document.getElementById("repartoProgSyncedContainer");g&&p&&!g._bound&&(g._bound=!0,p._bound=!0,g.addEventListener("click",()=>{g.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition",p.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition",c?.classList.remove("hidden"),l?.classList.add("hidden")}),p.addEventListener("click",()=>{p.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition",g.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition",l?.classList.remove("hidden"),c?.classList.add("hidden")}));const e=document.getElementById("repartoProgSelectAllBtn");e&&!e._bound&&(e._bound=!0,e.addEventListener("click",()=>{const o=Array.from(document.querySelectorAll(".reparto-prog-chk:not(:disabled)")),u=o.some(x=>!x.checked);o.forEach(x=>x.checked=u),this.updateRepartoProgSendButtonState()}));const i=document.getElementById("repartoProgExportCsvBtn");i&&!i._bound&&(i._bound=!0,i.addEventListener("click",()=>{const o=[...(this._repartoPendingProgData||[]).map(u=>({...u,isSynced:!1})),...(this._repartoSyncedProgData||[]).map(u=>({...u,isSynced:!0}))];this.exportRepartoProgressioniCsv(o)}));const b=document.getElementById("confirmSendRepartoProgBtn");b&&!b._bound&&(b._bound=!0,b.addEventListener("click",()=>this.sendSelectedRepartoProgressioniToCngei()))};k.updateRepartoProgSendButtonState=function(){const t=document.getElementById("confirmSendRepartoProgBtn"),r=document.getElementById("confirmSendRepartoProgBtnText"),a=document.querySelectorAll(".reparto-prog-chk:checked").length;t&&(t.disabled=a===0),r&&(r.textContent=a>0?`Invia ${a} Progressioni Selezionate a CNGEI`:"Invia Progressioni a CNGEI")};k.openCngeiRepartoProgressioniModal=async function(){this.openModal("cngeiRepartoProgressioniModal");const t=document.getElementById("repartoProgPendingContainer"),r=document.getElementById("repartoProgSyncedContainer"),a=document.getElementById("repartoProgTotalCount"),g=document.getElementById("repartoProgBreakdown"),p=document.getElementById("repartoProgScoutsCount"),c=document.getElementById("repartoProgSyncedCount"),l=document.getElementById("repartoProgWarningBanner"),e=document.getElementById("confirmSendRepartoProgBtn");t&&(t.innerHTML='<div class="text-sm text-slate-400 py-6 text-center">Caricamento progressioni dal portale CNGEI...</div>'),r&&(r.innerHTML=""),e&&(e.disabled=!0);try{const i=await _.getProgressioniTypes(),b=this.state?.scouts||[],o=[],u=[];let x=0;b.forEach(n=>{const y=T(n,i),S=L(n,i);!n.idCngei&&y.length>0&&x++,y.forEach(d=>{o.push({...d,scoutId:n.id,scoutName:`${n.nome||""} ${n.cognome||""}`.trim()||"Esploratore",pattuglia:n.pv_pattuglia||"Non assegnata",idCngei:n.idCngei||null,scout:n})}),S.forEach(d=>{u.push({...d,scoutId:n.id,scoutName:`${n.nome||""} ${n.cognome||""}`.trim()||"Esploratore",pattuglia:n.pv_pattuglia||"Non assegnata",idCngei:n.idCngei||null,scout:n})})});const f=(n,y)=>{const S=(n.pattuglia||"").localeCompare(y.pattuglia||"");return S!==0?S:(n.scoutName||"").localeCompare(y.scoutName||"")};o.sort(f),u.sort(f),this._repartoPendingProgData=o,this._repartoSyncedProgData=u;const m=o.filter(n=>n.category.includes("PO")).length,s=o.filter(n=>n.category.includes("PV")).length,h=new Set(o.map(n=>n.scoutId)).size;a&&(a.textContent=o.length),g&&(g.textContent=`${m} PO (Specialità) • ${s} PV (Tracce)`),p&&(p.textContent=h),c&&(c.textContent=u.length);const v=document.getElementById("tabPendingCount"),C=document.getElementById("tabSyncedCount");v&&(v.textContent=o.length),C&&(C.textContent=u.length),l&&l.classList.toggle("hidden",x===0),o.length===0?(t&&(t.innerHTML=`
          <div class="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <span class="text-3xl">🎉</span>
            <div class="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Tutte le progressioni sono già convalidate su CNGEI!</div>
            <div class="text-xs text-slate-400 mt-0.5">Non ci sono attualmente specialità o tracce completate in attesa di invio.</div>
          </div>
        `),e&&(e.disabled=!0)):(t&&(t.innerHTML=o.map((n,y)=>`
          <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer ${n.idCngei?"":"opacity-70 bg-amber-50/40 dark:bg-amber-950/20"}">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="reparto-prog-chk w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-index="${y}" ${n.idCngei?"checked":"disabled"} />
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${n.scoutName}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">${n.pattuglia}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${n.category.includes("PO")?"bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300":"bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300"}">
                    ${n.category}
                  </span>
                </div>
                <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Progressione: <strong class="text-slate-900 dark:text-slate-100">${n.name}</strong></span>
                  <span>•</span>
                  <span>Data: <strong>${n.obtainedAt}</strong></span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              ${n.idCngei?'<span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Pronto</span>':`<span class="text-[11px] font-semibold text-amber-600 dark:text-amber-400" title="Associa l'esploratore nella pagina Esploratori">⚠️ Manca ID</span>`}
            </div>
          </label>
        `).join(""),t.querySelectorAll(".reparto-prog-chk").forEach(n=>{n.addEventListener("change",()=>this.updateRepartoProgSendButtonState())})),this.updateRepartoProgSendButtonState()),r&&(u.length===0?r.innerHTML='<div class="text-center py-6 text-sm text-slate-400">Nessuna progressione ancora registrata su CNGEI.</div>':r.innerHTML=u.map(n=>`
          <div class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div class="flex items-center gap-2.5">
              <span class="text-emerald-600 font-bold">✓</span>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-sm text-slate-800 dark:text-slate-200">${n.scoutName}</span>
                  <span class="text-[11px] text-slate-400">(${n.pattuglia})</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${n.category.includes("PO")?"bg-amber-100/70 text-amber-800":"bg-blue-100/70 text-blue-800"}">${n.category}</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  <strong>${n.name}</strong> • Conseguita: ${n.obtainedAt}
                </div>
              </div>
            </div>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              ${n.cngeiId?`ID: ${String(n.cngeiId).slice(0,10)}...`:"convalidata"}
            </span>
          </div>
        `).join(""))}catch(i){console.error("Errore recupero tipi progressione CNGEI per reparto:",i),t&&(t.innerHTML=`<div class="text-sm text-rose-500 py-6 text-center">Errore connessione CNGEI: ${i.message||"Errore di rete"}</div>`)}};k.sendSelectedRepartoProgressioniToCngei=async function(){const t=Array.from(document.querySelectorAll(".reparto-prog-chk:checked"));if(t.length===0){this.showToast("Nessuna progressione selezionata da inviare.",{type:"info"});return}const r=document.getElementById("confirmSendRepartoProgBtn"),a=document.getElementById("confirmSendRepartoProgBtnText"),g=a?a.textContent:"Invia Progressioni Selezionate a CNGEI",p=document.getElementById("repartoProgProgressContainer"),c=document.getElementById("repartoProgProgressBar"),l=document.getElementById("repartoProgProgressLabel"),e=document.getElementById("repartoProgProgressPct");p&&p.classList.remove("hidden"),r&&(r.disabled=!0);try{let i=0;const b=[],o=new Map,u=t.length;for(let x=0;x<u;x++){const f=t[x],m=parseInt(f.dataset.index,10),s=this._repartoPendingProgData?.[m];if(!s||!s.idCngei)continue;const h=Math.round((x+1)/u*100);l&&(l.textContent=`Invio ${x+1} di ${u}: ${s.name} (${s.scoutName})...`),e&&(e.textContent=`${h}%`),c&&(c.style.width=`${h}%`);try{const C=(await D(s.idCngei,s.typeId,s.obtainedAt,_))?.id||"synced_"+Date.now();let n=o.get(s.scoutId)||s.scout;s.category.includes("PO")&&s.indexInArray!==void 0?Array.isArray(n.specialita)&&n.specialita[s.indexInArray]&&(n.specialita[s.indexInArray].idProgressioneCngei=C):s.tracciaKey==="pv_traccia1"?n.cngei_traccia1_id=C:s.tracciaKey==="pv_traccia2"?n.cngei_traccia2_id=C:s.tracciaKey==="pv_traccia3"&&(n.cngei_traccia3_id=C),o.set(s.scoutId,n),i++}catch(v){console.error(`Errore invio ${s.name} per ${s.scoutName}:`,v),b.push(`${s.scoutName} (${s.name}): ${v.message}`)}}if(typeof DATA<"u"&&DATA.updateScout){for(const[x,f]of o.entries())await DATA.updateScout(x,f,this.currentUser);this.state=await DATA.loadAll(),typeof this.rebuildPresenceIndex=="function"&&this.rebuildPresenceIndex()}b.length>0?this.showToast(`Sincronizzazione parziale: inviate ${i} progressioni. Errori su: ${b.join(", ")}`,{type:"warning",duration:6e3}):this.showToast(`Sincronizzazione completata! ${i} progressioni convalidate con successo su CNGEI.`,{type:"success",duration:4e3}),this.renderPattuglieTable(),await this.openCngeiRepartoProgressioniModal()}catch(i){console.error("Errore durante export cumulativo:",i),this.showToast("Errore durante l'export cumulativo: "+(i.message||"Errore di rete"),{type:"error"})}finally{r&&(r.disabled=!1),a&&(a.textContent=g),p&&p.classList.add("hidden")}};k.exportRepartoProgressioniCsv=function(t){if(!t||t.length===0){this.showToast("Nessuna progressione disponibile da esportare in CSV.",{type:"info"});return}const r=["Esploratore","Pattuglia","ID Portale CNGEI","Categoria","Tipo","Progressione","Data Conseguimento","Stato Convalida","ID Progressione CNGEI"],a=t.map(e=>[`"${(e.scoutName||"").replace(/"/g,'""')}"`,`"${(e.pattuglia||"").replace(/"/g,'""')}"`,`"${e.idCngei||""}"`,`"${(e.category||"").replace(/"/g,'""')}"`,e.category?.includes("PO")?"PO":"PV",`"${(e.name||"").replace(/"/g,'""')}"`,e.obtainedAt||"",e.isSynced?"Convalidata a Portale":"In attesa di invio",`"${e.cngeiId||e.idProgressioneCngei||""}"`]),g="\uFEFF"+[r.join(","),...a.map(e=>e.join(","))].join(`\r
`),p=new Blob([g],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(p),l=document.createElement("a");l.href=c,l.download=`progressioni_reparto_cngei_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(c),this.showToast("Report CSV progressioni scaricato con successo!")};
