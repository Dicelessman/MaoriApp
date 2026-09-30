import{U as T}from"./date-picker-DsbPVXqx.js";/* empty css              */import"./shared-zcgZaTD4.js";import{c as _}from"./cngei-service-DZdKacRO.js";import{r as D,c as N,a as L,s as M}from"./cngei-progressioni-B6r5KadV.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";import"./cngei-sync-Dll_EPIb.js";const C=typeof window<"u"&&window.UI?window.UI:T;C.toJsDate=function(t){if(!t)return null;if(t instanceof Date)return t;if(t&&t.toDate)return t.toDate();const s=new Date(t);return isNaN(s.getTime())?null:s};C.getAnnoEsploratore=function(t){if(!t)return null;const s=this.toJsDate(t);if(!s)return null;const r=new Date;let x=r.getFullYear()-s.getFullYear();const g=r.getMonth()-s.getMonth();return(g<0||g===0&&r.getDate()<s.getDate())&&x--,x};C.getAnnoScout=function(t){const s=this.getAnnoEsploratore(t);return s===null?null:s>=11&&s<=12?"I°":s===13?"II°":s===14?"III°":s===15?"IV°":null};C.getCurrentScoutYearSmart=function(){const t=typeof this.getCurrentScoutYear=="function"?this.getCurrentScoutYear():null,s=this.state.activities||[];if(s.length===0)return t||"2025/2026";if(t&&s.some(g=>this.isActivityInScoutYear?this.isActivityInScoutYear(g,t):!1))return t;const x=(typeof this.getAllScoutYears=="function"?this.getAllScoutYears(s):[]).filter(g=>g!=="all"&&s.some(c=>this.isActivityInScoutYear?this.isActivityInScoutYear(c,g):!1));return x.length>0?x[0]:t||"2025/2026"};C.setupStatsScoutYearSelector=function(){const t=document.getElementById("statsScoutYearSelect");if(!t)return;const s=this.getCurrentScoutYearSmart(),r=typeof this.getAllScoutYears=="function"?this.getAllScoutYears(this.state.activities):[s];r.includes(s)||r.unshift(s),this.selectedStatsScoutYear||(this.selectedStatsScoutYear=s),t.innerHTML="",r.forEach(c=>{const e=c===s?`${c} (In corso)`:`${c} (Archiviato)`,i=document.createElement("option");i.value=c,i.textContent=e,c===this.selectedStatsScoutYear&&(i.selected=!0),t.appendChild(i)});const x=document.createElement("option");x.value="all",x.textContent="Tutti gli anni (Globale)",this.selectedStatsScoutYear==="all"&&(x.selected=!0),t.appendChild(x);const g=document.getElementById("statsArchiveBadge");if(g){const c=this.selectedStatsScoutYear!=="all"&&this.selectedStatsScoutYear!==s;g.classList.toggle("hidden",!c)}t._bound||(t._bound=!0,t.addEventListener("change",async c=>{this.selectedStatsScoutYear=c.target.value,this.setSelectedScoutYear&&c.target.value!=="all"&&await this.setSelectedScoutYear(c.target.value),this.renderCurrentPage()}))};C._charts=C._charts||{scout:null,activity:null};C._destroyCharts=function(){try{this._charts.scout&&(this._charts.scout.destroy(),this._charts.scout=null)}catch{}try{this._charts.activity&&(this._charts.activity.destroy(),this._charts.activity=null)}catch{}};C.renderCurrentPage=function(){this.setupStatsScoutYearSelector(),this.renderDashboardCharts(),this.renderAttendanceGrid(),this.renderTotaleEsploratoriWidget(),this.renderProgressioniWidget(),this.renderComposizionePattuglia(),this.renderPattuglieTable(),this.renderRiepilogoSpecialita(),this.setupRepartoProgressioniEvents()};C.renderDashboardCharts=function(){const t=this.state.scouts||[],s=this.state.activities||[],r=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],x=document.getElementById("scoutPresenceChart"),g=document.getElementById("activityPresenceChart");if(!x||!g)return;this._destroyCharts();const c=this.getCurrentScoutYearSmart(),l=this.selectedStatsScoutYear||c,e=l==="all",i=a=>this.toJsDate(a)||new Date(a),b=[...s].filter(a=>e||(this.isActivityInScoutYear?this.isActivityInScoutYear(a,l):!0)).sort((a,y)=>i(a.data)-i(y.data)),u=new Date;u.setHours(0,0,0,0);let p=null;b.forEach(a=>{const y=i(a.data),$=new Date(y);$.setHours(0,0,0,0),p===null&&$>=u&&(p=a.id)});const d=b.filter(a=>{const y=i(a.data),$=new Date(y);return $.setHours(0,0,0,0),$<u}).map(a=>a.id);let f=p?[...d,p]:d;f.length===0&&b.length>0&&(f=b.map(a=>a.id));const m=t.map(a=>{const y=f.filter(P=>{const A=r.find(B=>B.esploratoreId===a.id&&B.attivitaId===P);return A&&(A.stato==="Presente"||A.stato==="Assente")}),$=y.length,w=r.filter(P=>P.esploratoreId===a.id&&P.stato==="Presente"&&y.includes(P.attivitaId)).length,E=$?Math.round(w/$*100):0;return{name:`${a.nome||""} ${a.cognome||""}`.trim()||"Esploratore",perc:E,presentCount:w,totalActsConsidered:$}});m.sort((a,y)=>y.perc-a.perc);const n=m.map(a=>a.name),h=m.map(a=>a.perc),S=h.map(a=>a>=75?"#16a34a":a>=60?"#eab308":"#dc2626"),k=b.map(a=>{const y=i(a.data),$=isNaN(y)?"":y.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"});return`${a.tipo}: ${a.descrizione||""}
${$}`}),I=b.map(a=>r.filter(y=>y.attivitaId===a.id&&y.stato==="Presente").length),o=window.ChartDataLabels;window.Chart&&o&&window.Chart.register(o);const v={responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:8,right:12,bottom:8,left:12}},plugins:{legend:{display:!1},datalabels:{color:"#fff",formatter:a=>a>0?typeof a=="number"&&a<=100?a.toFixed(1)+"%":a:"",anchor:"end",align:"end",offset:-5,font:{weight:"bold"}}},elements:{bar:{borderRadius:4,maxBarThickness:28}}};this._charts.scout=new window.Chart(x.getContext("2d"),{type:"bar",data:{labels:n,datasets:[{label:"Presenze",data:h,backgroundColor:S}]},options:{...v,indexAxis:"y",scales:{x:{beginAtZero:!0,max:100,ticks:{callback:a=>a+"%"}},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...v.plugins,tooltip:{callbacks:{label:function(a){const y=m[a.dataIndex];return` ${y.perc}% (${y.presentCount} / ${y.totalActsConsidered} attività)`}}}}}}),this._charts.activity=new window.Chart(g.getContext("2d"),{type:"bar",data:{labels:k,datasets:[{label:"Presenze",data:I,backgroundColor:"#16a34a"}]},options:{...v,indexAxis:"y",scales:{x:{beginAtZero:!0,max:Math.max(1,t.length)},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...v.plugins,datalabels:{...v.plugins.datalabels,formatter:a=>a>0?`${a} / ${t.length}`:""}}}})};C.renderAttendanceGrid=function(){const t=document.getElementById("attendanceGrid");if(!t)return;const s=this.state.scouts||[],r=this.state.activities||[],x=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[];if(s.length===0){t.innerHTML='<p class="text-gray-500 italic p-4">Nessun esploratore registrato.</p>';return}const g=n=>this.toJsDate(n)||new Date(n),c=this.getCurrentScoutYearSmart(),l=this.selectedStatsScoutYear||c,e=l==="all",i=[...r].filter(n=>e||(this.isActivityInScoutYear?this.isActivityInScoutYear(n,l):!0)).sort((n,h)=>g(n.data)-g(h.data));if(i.length===0){t.innerHTML=`<p class="text-gray-500 italic p-4">Nessuna attività registrata per l'anno scout ${l}.</p>`;return}const b=new Date;b.setHours(0,0,0,0);const u=i.filter(n=>{const h=new Date(g(n.data));h.setHours(0,0,0,0);const S=x.some(k=>k.attivitaId===n.id&&(k.stato==="Presente"||k.stato==="Assente"));return h<=b||S}),p=u.length>0?u:i,d=p.map(n=>n.id),f=[...s].map(n=>{const h=d.filter(o=>{const v=x.find(a=>a.esploratoreId===n.id&&a.attivitaId===o);return v&&(v.stato==="Presente"||v.stato==="Assente")}),S=h.length,k=x.filter(o=>o.esploratoreId===n.id&&o.stato==="Presente"&&h.includes(o.attivitaId)).length,I=S?Math.round(k/S*100):0;return{...n,perc:I}}).sort((n,h)=>h.perc-n.perc);let m='<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';m+='<thead><tr class="bg-gray-100 dark:bg-gray-700/60">',m+='<th class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 w-44 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>',p.forEach(n=>{const h=g(n.data),S=isNaN(h)?"":h.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"});m+=`<th class="p-1.5 border border-gray-200 dark:border-gray-700 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[65px]" title="${n.tipo}: ${n.descrizione||""}">${S}</th>`}),m+="</tr></thead><tbody>",f.forEach(n=>{const h=`${n.nome||""} ${n.cognome||""}`.trim()||"Esploratore",S=n.id?`<a href="scout2.html?id=${encodeURIComponent(n.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline">${h}</a>`:h;m+=`<tr><td class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium text-gray-800 dark:text-gray-200 shadow-[1px_0_0_0_#e5e7eb]">${S}</td>`,p.forEach(k=>{const I=x.find(a=>a.esploratoreId===n.id&&a.attivitaId===k.id);let o="bg-white dark:bg-gray-700",v="Dato non inserito";I&&(I.stato==="Presente"?(o="bg-green-500",v="Presente"):I.stato==="Assente"?(o="bg-red-500",v="Assente"):I.stato.toLowerCase()==="x"||I.stato==="NR"||I.stato.toLowerCase()==="giustificato"?(o="bg-gray-400",v="Non tenuto a esserci / Giustificato"):(o="bg-gray-400",v=I.stato)),m+=`<td class="p-1.5 border border-gray-200 dark:border-gray-700 text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${o}" title="${v}"></div>
               </td>`}),m+="</tr>"}),m+="</tbody></table></div>",m+=`
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div> Dato mancante</div>
    </div>
  `,t.innerHTML=m};C.renderTotaleEsploratoriWidget=function(){const t=document.getElementById("totaleEsploratoriWidget");if(!t)return;const s=this.state.scouts||[],r=s.length;if(r===0){t.innerHTML='<p class="text-gray-500 italic">Nessun esploratore registrato.</p>';return}const x=s.filter(m=>m.anag_sesso?.toLowerCase()?.trim()==="maschio").length,g=s.filter(m=>m.anag_sesso?.toLowerCase()?.trim()==="femmina").length,c=r-x-g,l=Math.round(x/r*100),e=Math.round(g/r*100),i=c>0?Math.round(c/r*100):0,b={"I°":0,"II°":0,"III°":0,"IV°":0,Altro:0},u=[];s.forEach(m=>{const n=this.getAnnoScout(m.anag_dob);n&&b[n]!==void 0?b[n]++:b.Altro++;const h=this.getAnnoEsploratore(m.anag_dob);h!==null&&u.push(h)});const p=u.length>0?(u.reduce((m,n)=>m+n,0)/u.length).toFixed(1):"—",d=u.length>0?Math.min(...u):null,f=u.length>0?Math.max(...u):null;t.innerHTML=`
    <div class="space-y-5">
      <!-- 1. Conteggi principali con sesso evidenziato -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Totale Esploratori Card -->
        <div class="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <p class="text-green-100 text-xs font-bold uppercase tracking-wider">Censiti in Reparto</p>
            <p class="text-4xl font-extrabold mt-1">${r}</p>
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
              <p class="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">${x}</p>
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
              <p class="text-3xl font-extrabold text-pink-900 dark:text-pink-100 mt-1">${g}</p>
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
            <span>♂</span> Maschi: ${x} (${l}%)
          </span>
          ${c>0?`<span class="text-gray-500 dark:text-gray-400">Non reg.: ${c} (${i}%)</span>`:""}
          <span class="text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <span>♀</span> Femmine: ${g} (${e}%)
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
            Età media: <strong class="text-gray-800 dark:text-gray-100">${p} anni</strong>
            ${d&&f?` · Range: ${d}-${f} anni`:""}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">I° Anno (11-12)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["I°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["I°"]/r*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">II° Anno (13)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["II°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["II°"]/r*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">III° Anno (14)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["III°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["III°"]/r*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">IV° Anno (15)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${b["IV°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(b["IV°"]/r*100)}%</span>
          </div>
        </div>
      </div>
    </div>
  `};C.renderProgressioniWidget=function(){const t=document.getElementById("progressioniWidget");if(!t)return;const s=this.state.scouts||[],r=this.getCurrentScoutYearSmart(),x=this.selectedStatsScoutYear||r,g=x==="all",c=this.getScoutYearDateRange?this.getScoutYearDateRange(x):null,l=g?"Tutti gli anni (Globale)":`Anno Scout ${x}`,e={1:0,2:0,3:0};s.forEach(p=>{[1,2,3].forEach(d=>{const f=p[`pv_traccia${d}`];if(f&&f.done)if(g)e[d]++;else if(f.data){const m=this.toJsDate(f.data);m&&c&&m>=c.start&&m<=c.end&&e[d]++}else x===r&&e[d]++})});const i=e[1]+e[2]+e[3];let b=0;s.forEach(p=>{p.specialita&&Array.isArray(p.specialita)&&p.specialita.forEach(d=>{if(d.ottenuta)if(g)b++;else if(d.data){const f=this.toJsDate(d.data);f&&c&&f>=c.start&&f<=c.end&&b++}else x===r&&b++})});const u=i+b;t.innerHTML=`
    <div class="space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Progressioni Conquistate</span>
          <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            ${u} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">traguardi ottenuti</span>
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
  `};C.renderComposizionePattuglia=function(){const t=document.getElementById("totaliStats");if(!t)return;const s=this.state.scouts||[],r={};s.forEach(c=>{const l=c.pv_pattuglia||"Non assegnata";r[l]||(r[l]={m:0,f:0,altro:0,tot:0});const e=c.anag_sesso?.toLowerCase()?.trim();r[l].tot++,e==="maschio"?r[l].m++:e==="femmina"?r[l].f++:r[l].altro++});const g=Object.keys(r).sort((c,l)=>c==="Non assegnata"?1:l==="Non assegnata"?-1:c.localeCompare(l)).map(c=>{const l=r[c];let e="Non definita",i="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";return l.tot===0?e="Vuota":l.m>0&&l.f===0&&l.altro===0?(e="♂ Maschile",i="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"):l.f>0&&l.m===0&&l.altro===0?(e="♀ Femminile",i="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700"):l.m>0&&l.f>0&&(e="⚥ Mista",i="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700"),`
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
        <tbody>${g||'<tr><td colspan="3" class="p-4 text-center text-gray-500">Nessuna pattuglia trovata</td></tr>'}</tbody>
      </table>
    </div>
  `};C.renderPattuglieTable=function(t){t&&(this._pattuglieTableScouts=t);const s=this._pattuglieTableScouts||this.state.scouts||[];this._pattuglieSortState||(this._pattuglieSortState={field:"nome",direction:"asc"});const r={};s.forEach(u=>{const p=u.pv_pattuglia||"Non assegnata";r[p]||(r[p]=[]);const d=this.getAnnoScout(u.anag_dob);let f="-";u.pv_traccia3?.done?f="3":u.pv_traccia2?.done?f="2":u.pv_traccia1?.done&&(f="1");let m=0;const n=[],h=[];u.specialita&&Array.isArray(u.specialita)&&u.specialita.forEach(k=>{k.nome&&(k.ottenuta||k.brevetto||k.consegnata||k.data?(m++,n.push(k.nome.trim())):h.push(k.nome.trim()))});const S=u.pv_vcp_cp||"";r[p].push({id:u.id,nome:`${u.nome||""} ${u.cognome||""}`.trim()||"Nome non disponibile",annoScout:d||"N/A",cpVcp:S,passo:f,numSpecialita:m,specialitaNames:n,specialitaDaOttenere:h})});const x=this._pattuglieSortState.field,g=this._pattuglieSortState.direction;Object.keys(r).forEach(u=>{r[u].sort((p,d)=>{let f=0;if(x==="nome")f=p.nome.localeCompare(d.nome);else if(x==="annoScout"){const m={"I°":1,"II°":2,"III°":3,"IV°":4,"N/A":5},n=m[p.annoScout]||5,h=m[d.annoScout]||5;f=n-h,f===0&&(f=p.nome.localeCompare(d.nome))}return g==="asc"?f:-f})});const c=Object.keys(r).sort((u,p)=>u==="Non assegnata"?1:p==="Non assegnata"?-1:u.localeCompare(p)),l=document.getElementById("sortNomeIcon"),e=document.getElementById("sortAnnoScoutIcon");l&&(l.textContent=x==="nome"?g==="asc"?"↑":"↓":"↕"),e&&(e.textContent=x==="annoScout"?g==="asc"?"↑":"↓":"↕");const i=document.getElementById("pattuglieTableBody");if(!i)return;let b="";if(c.forEach(u=>{const p=r[u];p.forEach((d,f)=>{const m=d.id?`<a href="scout2.html?id=${encodeURIComponent(d.id)}" class="text-green-700 dark:text-green-400 font-semibold hover:underline">${d.nome}</a>`:`<span class="text-gray-800 dark:text-gray-200">${d.nome}</span>`,n=d.numSpecialita>0?`
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60" title="${d.numSpecialita} specialità conquistate">
                ${d.numSpecialita}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">${d.numSpecialita===1,"specialità"}</span>
            </div>
            <div class="flex flex-wrap items-center">
              ${d.specialitaNames.map(S=>`<span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-[11px] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-normal mr-1 mb-1">${S}</span>`).join("")}
            </div>
          </div>
        `:'<span class="text-xs text-gray-400 dark:text-gray-500 italic">0</span>',h=d.specialitaDaOttenere?.length>0?`
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60" title="${d.specialitaDaOttenere.length} specialità in lavorazione">
                ${d.specialitaDaOttenere.length}
              </span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">in lavorazione</span>
            </div>
            <div class="flex flex-wrap items-center">
              ${d.specialitaDaOttenere.map(S=>`<span class="inline-block px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-900/40 text-[11px] text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700 font-normal mr-1 mb-1">${S}</span>`).join("")}
            </div>
          </div>
        `:'<span class="text-xs text-gray-400 dark:text-gray-500 italic">—</span>';b+=`
        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
          ${f===0?`<td class="p-2.5 font-semibold text-gray-800 dark:text-gray-100 align-top" rowspan="${p.length}">${u}</td>`:""}
          <td class="p-2.5 align-top">${m}</td>
          <td class="p-2.5 align-top text-gray-600 dark:text-gray-300">${d.annoScout}</td>
          <td class="p-2.5 align-top text-gray-600 dark:text-gray-300 font-medium">${d.cpVcp}</td>
          <td class="p-2.5 align-top text-gray-600 dark:text-gray-300">${d.passo}</td>
          <td class="p-2.5 align-top">${n}</td>
          <td class="p-2.5 align-top">${h}</td>
        </tr>
      `})}),i.innerHTML=b||'<tr><td colspan="7" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>',!this._pattuglieSortListenersAdded){const u=document.getElementById("sortNome"),p=document.getElementById("sortAnnoScout");u&&u.addEventListener("click",()=>{this._pattuglieSortState.field==="nome"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="nome",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),p&&p.addEventListener("click",()=>{this._pattuglieSortState.field==="annoScout"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="annoScout",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),this._pattuglieSortListenersAdded=!0}};C.renderRiepilogoSpecialita=function(){const t=document.getElementById("tempiSpecialitaStats");if(!t)return;const s=this.state.scouts||[],r={};s.forEach(e=>{e.specialita&&Array.isArray(e.specialita)&&e.specialita.forEach(i=>{i.ottenuta&&i.nome&&(r[i.nome]=(r[i.nome]||0)+1)})});const x=Object.entries(r).sort((e,i)=>i[1]-e[1]).slice(0,5),g=s.filter(e=>!e.specialita||!Array.isArray(e.specialita)?!0:e.specialita.filter(i=>i.ottenuta).length===0),c=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🏅</span> Top 5 Specialità Conquistate
      </div>
      ${x.length>0?`<ol class="space-y-2">
            ${x.map(([e,i],b)=>`
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
        <span class="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full text-xs">${g.length}</span>
      </div>
      ${g.length>0?`<ul class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-700">
            ${g.map(e=>{const i=`${e.nome||""} ${e.cognome||""}`.trim()||"Esploratore",b=e.pv_pattuglia?`(${e.pv_pattuglia})`:"";return`<li class="pt-1 flex items-center justify-between">
                <a href="scout2.html?id=${encodeURIComponent(e.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline font-medium">${i}</a>
                <span class="text-gray-400 text-[10px]">${b}</span>
              </li>`}).join("")}
          </ul>`:'<div class="text-xs text-green-600 dark:text-green-400 font-medium">Tutti gli esploratori hanno almeno una specialità! 🎉</div>'}
    </div>
  `;t.innerHTML=c+l};C.setupRepartoProgressioniEvents=function(){const t=document.getElementById("btnExportCngeiProgressioniReparto");t&&!t._bound&&(t._bound=!0,t.addEventListener("click",()=>this.openCngeiRepartoProgressioniModal()));const s=document.getElementById("closeRepartoProgModalBtn");s&&!s._bound&&(s._bound=!0,s.addEventListener("click",()=>this.closeModal("cngeiRepartoProgressioniModal")));const r=document.getElementById("cancelRepartoProgModalBtn");r&&!r._bound&&(r._bound=!0,r.addEventListener("click",()=>this.closeModal("cngeiRepartoProgressioniModal")));const x=document.getElementById("tabPendingProgBtn"),g=document.getElementById("tabSyncedProgBtn"),c=document.getElementById("repartoProgPendingContainer"),l=document.getElementById("repartoProgSyncedContainer");x&&g&&!x._bound&&(x._bound=!0,g._bound=!0,x.addEventListener("click",()=>{x.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition",g.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition",c?.classList.remove("hidden"),l?.classList.add("hidden")}),g.addEventListener("click",()=>{g.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition",x.className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition",l?.classList.remove("hidden"),c?.classList.add("hidden")}));const e=document.getElementById("repartoProgSelectAllBtn");e&&!e._bound&&(e._bound=!0,e.addEventListener("click",()=>{const u=Array.from(document.querySelectorAll(".reparto-prog-chk:not(:disabled)")),p=u.some(d=>!d.checked);u.forEach(d=>d.checked=p),this.updateRepartoProgSendButtonState()}));const i=document.getElementById("repartoProgExportCsvBtn");i&&!i._bound&&(i._bound=!0,i.addEventListener("click",()=>{const u=[...(this._repartoPendingProgData||[]).map(p=>({...p,isSynced:!1})),...(this._repartoSyncedProgData||[]).map(p=>({...p,isSynced:!0}))];this.exportRepartoProgressioniCsv(u)}));const b=document.getElementById("confirmSendRepartoProgBtn");b&&!b._bound&&(b._bound=!0,b.addEventListener("click",()=>this.sendSelectedRepartoProgressioniToCngei()))};C.updateRepartoProgSendButtonState=function(){const t=document.getElementById("confirmSendRepartoProgBtn"),s=document.getElementById("confirmSendRepartoProgBtnText"),r=document.querySelectorAll(".reparto-prog-chk:checked").length;t&&(t.disabled=r===0),s&&(s.textContent=r>0?`Invia ${r} Progressioni Selezionate a CNGEI`:"Invia Progressioni a CNGEI")};C.openCngeiRepartoProgressioniModal=async function(){this.openModal("cngeiRepartoProgressioniModal");const t=document.getElementById("repartoProgPendingContainer"),s=document.getElementById("repartoProgSyncedContainer"),r=document.getElementById("repartoProgTotalCount"),x=document.getElementById("repartoProgBreakdown"),g=document.getElementById("repartoProgScoutsCount"),c=document.getElementById("repartoProgSyncedCount"),l=document.getElementById("repartoProgWarningBanner"),e=document.getElementById("confirmSendRepartoProgBtn");t&&(t.innerHTML='<div class="text-sm text-slate-400 py-6 text-center">Riconciliazione con il portale CNGEI...</div>'),s&&(s.innerHTML=""),e&&(e.disabled=!0);try{const i=await _.getProgressioniTypes();let b=this.state?.scouts||[];const u=b.filter(o=>o.idCngei);if(u.length>0){const o=await Promise.allSettled(u.map(async a=>{try{const y=await _.getPersona(a.idCngei),$=y?.brevetti||y?.progressioni||[];if($.length===0)return null;const{scout:w,changed:E}=D({...a},$);return E&&typeof DATA<"u"&&DATA.updateScout?(await DATA.updateScout(a.id,w,this.currentUser),{id:a.id,updated:w}):null}catch(y){return console.warn(`Riconciliazione CNGEI fallita per ${a.nome} ${a.cognome}:`,y.message),null}})),v=new Map;o.forEach(a=>{a.status==="fulfilled"&&a.value&&v.set(a.value.id,a.value.updated)}),v.size>0&&(b=b.map(a=>v.has(a.id)?v.get(a.id):a),this.state&&(this.state={...this.state,scouts:b}))}t&&(t.innerHTML='<div class="text-sm text-slate-400 py-6 text-center">Calcolo progressioni...</div>');const p=[],d=[];let f=0;b.forEach(o=>{const v=N(o,i),a=L(o,i);!o.idCngei&&v.length>0&&f++,v.forEach(y=>{p.push({...y,scoutId:o.id,scoutName:`${o.nome||""} ${o.cognome||""}`.trim()||"Esploratore",pattuglia:o.pv_pattuglia||"Non assegnata",idCngei:o.idCngei||null,scout:o})}),a.forEach(y=>{d.push({...y,scoutId:o.id,scoutName:`${o.nome||""} ${o.cognome||""}`.trim()||"Esploratore",pattuglia:o.pv_pattuglia||"Non assegnata",idCngei:o.idCngei||null,scout:o})})});const m=(o,v)=>{const a=(o.pattuglia||"").localeCompare(v.pattuglia||"");return a!==0?a:(o.scoutName||"").localeCompare(v.scoutName||"")};p.sort(m),d.sort(m),this._repartoPendingProgData=p,this._repartoSyncedProgData=d;const n=p.filter(o=>o.category.includes("PO")).length,h=p.filter(o=>o.category.includes("PV")).length,S=new Set(p.map(o=>o.scoutId)).size;r&&(r.textContent=p.length),x&&(x.textContent=`${n} PO (Specialità) • ${h} PV (Tracce)`),g&&(g.textContent=S),c&&(c.textContent=d.length);const k=document.getElementById("tabPendingCount"),I=document.getElementById("tabSyncedCount");k&&(k.textContent=p.length),I&&(I.textContent=d.length),l&&l.classList.toggle("hidden",f===0),p.length===0?(t&&(t.innerHTML=`
          <div class="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <span class="text-3xl">🎉</span>
            <div class="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Tutte le progressioni sono già convalidate su CNGEI!</div>
            <div class="text-xs text-slate-400 mt-0.5">Non ci sono attualmente specialità o tracce completate in attesa di invio.</div>
          </div>
        `),e&&(e.disabled=!0)):(t&&(t.innerHTML=p.map((o,v)=>`
          <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer ${o.idCngei?"":"opacity-70 bg-amber-50/40 dark:bg-amber-950/20"}">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="reparto-prog-chk w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-index="${v}" ${o.idCngei?"checked":"disabled"} />
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${o.scoutName}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">${o.pattuglia}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${o.category.includes("PO")?"bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300":"bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300"}">
                    ${o.category}
                  </span>
                </div>
                <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Progressione: <strong class="text-slate-900 dark:text-slate-100">${o.name}</strong></span>
                  <span>•</span>
                  <span>Data: <strong>${o.obtainedAt}</strong></span>
                </div>
              </div>
            </div>
            <div class="text-right shrink-0">
              ${o.idCngei?'<span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">✓ Pronto</span>':`<span class="text-[11px] font-semibold text-amber-600 dark:text-amber-400" title="Associa l'esploratore nella pagina Esploratori">⚠️ Manca ID</span>`}
            </div>
          </label>
        `).join(""),t.querySelectorAll(".reparto-prog-chk").forEach(o=>{o.addEventListener("change",()=>this.updateRepartoProgSendButtonState())})),this.updateRepartoProgSendButtonState()),s&&(d.length===0?s.innerHTML='<div class="text-center py-6 text-sm text-slate-400">Nessuna progressione ancora registrata su CNGEI.</div>':s.innerHTML=d.map(o=>`
          <div class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div class="flex items-center gap-2.5">
              <span class="text-emerald-600 font-bold">✓</span>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-medium text-sm text-slate-800 dark:text-slate-200">${o.scoutName}</span>
                  <span class="text-[11px] text-slate-400">(${o.pattuglia})</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${o.category.includes("PO")?"bg-amber-100/70 text-amber-800":"bg-blue-100/70 text-blue-800"}">${o.category}</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  <strong>${o.name}</strong> • Conseguita: ${o.obtainedAt}
                </div>
              </div>
            </div>
            <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              ${o.cngeiId?`ID: ${String(o.cngeiId).slice(0,10)}...`:"convalidata"}
            </span>
          </div>
        `).join(""))}catch(i){console.error("Errore recupero tipi progressione CNGEI per reparto:",i),t&&(t.innerHTML=`<div class="text-sm text-rose-500 py-6 text-center">Errore connessione CNGEI: ${i.message||"Errore di rete"}</div>`)}};C.sendSelectedRepartoProgressioniToCngei=async function(){const t=Array.from(document.querySelectorAll(".reparto-prog-chk:checked"));if(t.length===0){this.showToast("Nessuna progressione selezionata da inviare.",{type:"info"});return}const s=document.getElementById("confirmSendRepartoProgBtn"),r=document.getElementById("confirmSendRepartoProgBtnText"),x=r?r.textContent:"Invia Progressioni Selezionate a CNGEI",g=document.getElementById("repartoProgProgressContainer"),c=document.getElementById("repartoProgProgressBar"),l=document.getElementById("repartoProgProgressLabel"),e=document.getElementById("repartoProgProgressPct");g&&g.classList.remove("hidden"),s&&(s.disabled=!0);try{let i=0;const b=[],u=new Map,p=t.length;for(let d=0;d<p;d++){const f=t[d],m=parseInt(f.dataset.index,10),n=this._repartoPendingProgData?.[m];if(!n||!n.idCngei)continue;const h=Math.round((d+1)/p*100);l&&(l.textContent=`Invio ${d+1} di ${p}: ${n.name} (${n.scoutName})...`),e&&(e.textContent=`${h}%`),c&&(c.style.width=`${h}%`);try{const k=(await M(n.idCngei,n.typeId,n.obtainedAt,_))?.id||"synced_"+Date.now();let I=u.get(n.scoutId)||n.scout;n.category.includes("PO")&&n.indexInArray!==void 0?Array.isArray(I.specialita)&&I.specialita[n.indexInArray]&&(I.specialita[n.indexInArray].idProgressioneCngei=k):n.tracciaKey==="pv_traccia1"?I.cngei_traccia1_id=k:n.tracciaKey==="pv_traccia2"?I.cngei_traccia2_id=k:n.tracciaKey==="pv_traccia3"&&(I.cngei_traccia3_id=k),u.set(n.scoutId,I),i++}catch(S){console.error(`Errore invio ${n.name} per ${n.scoutName}:`,S),b.push(`${n.scoutName} (${n.name}): ${S.message}`)}}if(typeof DATA<"u"&&DATA.updateScout){for(const[d,f]of u.entries())await DATA.updateScout(d,f,this.currentUser);this.state=await DATA.loadAll(),typeof this.rebuildPresenceIndex=="function"&&this.rebuildPresenceIndex()}b.length>0?this.showToast(`Sincronizzazione parziale: inviate ${i} progressioni. Errori su: ${b.join(", ")}`,{type:"warning",duration:6e3}):this.showToast(`Sincronizzazione completata! ${i} progressioni convalidate con successo su CNGEI.`,{type:"success",duration:4e3}),this.renderPattuglieTable(),await this.openCngeiRepartoProgressioniModal()}catch(i){console.error("Errore durante export cumulativo:",i),this.showToast("Errore durante l'export cumulativo: "+(i.message||"Errore di rete"),{type:"error"})}finally{s&&(s.disabled=!1),r&&(r.textContent=x),g&&g.classList.add("hidden")}};C.exportRepartoProgressioniCsv=function(t){if(!t||t.length===0){this.showToast("Nessuna progressione disponibile da esportare in CSV.",{type:"info"});return}const s=["Esploratore","Pattuglia","ID Portale CNGEI","Categoria","Tipo","Progressione","Data Conseguimento","Stato Convalida","ID Progressione CNGEI"],r=t.map(e=>[`"${(e.scoutName||"").replace(/"/g,'""')}"`,`"${(e.pattuglia||"").replace(/"/g,'""')}"`,`"${e.idCngei||""}"`,`"${(e.category||"").replace(/"/g,'""')}"`,e.category?.includes("PO")?"PO":"PV",`"${(e.name||"").replace(/"/g,'""')}"`,e.obtainedAt||"",e.isSynced?"Convalidata a Portale":"In attesa di invio",`"${e.cngeiId||e.idProgressioneCngei||""}"`]),x="\uFEFF"+[s.join(","),...r.map(e=>e.join(","))].join(`\r
`),g=new Blob([x],{type:"text/csv;charset=utf-8;"}),c=URL.createObjectURL(g),l=document.createElement("a");l.href=c,l.download=`progressioni_reparto_cngei_${new Date().toISOString().split("T")[0]}.csv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(c),this.showToast("Report CSV progressioni scaricato con successo!")};
