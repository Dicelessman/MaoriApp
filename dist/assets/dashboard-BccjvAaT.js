import"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.toJsDate=function(e){if(!e)return null;if(e instanceof Date)return e;if(e&&e.toDate)return e.toDate();const s=new Date(e);return isNaN(s.getTime())?null:s};UI.getAnnoEsploratore=function(e){if(!e)return null;const s=this.toJsDate(e);if(!s)return null;const r=new Date;let c=r.getFullYear()-s.getFullYear();const p=r.getMonth()-s.getMonth();return(p<0||p===0&&r.getDate()<s.getDate())&&c--,c};UI.getAnnoScout=function(e){const s=this.getAnnoEsploratore(e);return s===null?null:s>=11&&s<=12?"I°":s===13?"II°":s===14?"III°":s===15?"IV°":null};UI.getCurrentScoutYearSmart=function(){const e=typeof this.getCurrentScoutYear=="function"?this.getCurrentScoutYear():null,s=this.state.activities||[];if(s.length===0)return e||"2025/2026";if(e&&s.some(p=>this.isActivityInScoutYear?this.isActivityInScoutYear(p,e):!1))return e;const c=(typeof this.getAllScoutYears=="function"?this.getAllScoutYears(s):[]).filter(p=>p!=="all"&&s.some(n=>this.isActivityInScoutYear?this.isActivityInScoutYear(n,p):!1));return c.length>0?c[0]:e||"2025/2026"};UI.setupStatsScoutYearSelector=function(){const e=document.getElementById("statsScoutYearSelect");if(!e)return;const s=this.getCurrentScoutYearSmart(),r=typeof this.getAllScoutYears=="function"?this.getAllScoutYears(this.state.activities):[s];r.includes(s)||r.unshift(s),this.selectedStatsScoutYear||(this.selectedStatsScoutYear=s),e.innerHTML="",r.forEach(n=>{const a=n===s?`${n} (In corso)`:`${n} (Archiviato)`,o=document.createElement("option");o.value=n,o.textContent=a,n===this.selectedStatsScoutYear&&(o.selected=!0),e.appendChild(o)});const c=document.createElement("option");c.value="all",c.textContent="Tutti gli anni (Globale)",this.selectedStatsScoutYear==="all"&&(c.selected=!0),e.appendChild(c);const p=document.getElementById("statsArchiveBadge");if(p){const n=this.selectedStatsScoutYear!=="all"&&this.selectedStatsScoutYear!==s;p.classList.toggle("hidden",!n)}e._bound||(e._bound=!0,e.addEventListener("change",async n=>{this.selectedStatsScoutYear=n.target.value,this.setSelectedScoutYear&&n.target.value!=="all"&&await this.setSelectedScoutYear(n.target.value),this.renderCurrentPage()}))};UI._charts=UI._charts||{scout:null,activity:null};UI._destroyCharts=function(){try{this._charts.scout&&(this._charts.scout.destroy(),this._charts.scout=null)}catch{}try{this._charts.activity&&(this._charts.activity.destroy(),this._charts.activity=null)}catch{}};UI.renderCurrentPage=function(){this.setupStatsScoutYearSelector(),this.renderDashboardCharts(),this.renderAttendanceGrid(),this.renderTotaleEsploratoriWidget(),this.renderProgressioniWidget(),this.renderComposizionePattuglia(),this.renderPattuglieTable(),this.renderRiepilogoSpecialita()};UI.renderDashboardCharts=function(){const e=this.state.scouts||[],s=this.state.activities||[],r=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],c=document.getElementById("scoutPresenceChart"),p=document.getElementById("activityPresenceChart");if(!c||!p)return;this._destroyCharts();const n=this.getCurrentScoutYearSmart(),i=this.selectedStatsScoutYear||n,a=i==="all",o=t=>this.toJsDate(t)||new Date(t),u=[...s].filter(t=>a||(this.isActivityInScoutYear?this.isActivityInScoutYear(t,i):!0)).sort((t,h)=>o(t.data)-o(h.data)),d=new Date;d.setHours(0,0,0,0);let x=null;u.forEach(t=>{const h=o(t.data),S=new Date(h);S.setHours(0,0,0,0),x===null&&S>=d&&(x=t.id)});const b=u.filter(t=>{const h=o(t.data),S=new Date(h);return S.setHours(0,0,0,0),S<d}).map(t=>t.id);let f=x?[...b,x]:b;f.length===0&&u.length>0&&(f=u.map(t=>t.id));const g=e.map(t=>{const h=f.filter($=>{const A=r.find(_=>_.esploratoreId===t.id&&_.attivitaId===$);return A&&(A.stato==="Presente"||A.stato==="Assente")}),S=h.length,C=r.filter($=>$.esploratoreId===t.id&&$.stato==="Presente"&&h.includes($.attivitaId)).length,E=S?Math.round(C/S*100):0;return{name:`${t.nome||""} ${t.cognome||""}`.trim()||"Esploratore",perc:E,presentCount:C,totalActsConsidered:S}});g.sort((t,h)=>h.perc-t.perc);const l=g.map(t=>t.name),m=g.map(t=>t.perc),I=m.map(t=>t>=75?"#16a34a":t>=60?"#eab308":"#dc2626"),w=u.map(t=>{const h=o(t.data),S=isNaN(h)?"":h.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"});return`${t.tipo}: ${t.descrizione||""}
${S}`}),v=u.map(t=>r.filter(h=>h.attivitaId===t.id&&h.stato==="Presente").length),k=window.ChartDataLabels;window.Chart&&k&&window.Chart.register(k);const y={responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:8,right:12,bottom:8,left:12}},plugins:{legend:{display:!1},datalabels:{color:"#fff",formatter:t=>t>0?typeof t=="number"&&t<=100?t.toFixed(1)+"%":t:"",anchor:"end",align:"end",offset:-5,font:{weight:"bold"}}},elements:{bar:{borderRadius:4,maxBarThickness:28}}};this._charts.scout=new window.Chart(c.getContext("2d"),{type:"bar",data:{labels:l,datasets:[{label:"Presenze",data:m,backgroundColor:I}]},options:{...y,indexAxis:"y",scales:{x:{beginAtZero:!0,max:100,ticks:{callback:t=>t+"%"}},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...y.plugins,tooltip:{callbacks:{label:function(t){const h=g[t.dataIndex];return` ${h.perc}% (${h.presentCount} / ${h.totalActsConsidered} attività)`}}}}}}),this._charts.activity=new window.Chart(p.getContext("2d"),{type:"bar",data:{labels:w,datasets:[{label:"Presenze",data:v,backgroundColor:"#16a34a"}]},options:{...y,indexAxis:"y",scales:{x:{beginAtZero:!0,max:Math.max(1,e.length)},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...y.plugins,datalabels:{...y.plugins.datalabels,formatter:t=>t>0?`${t} / ${e.length}`:""}}}})};UI.renderAttendanceGrid=function(){const e=document.getElementById("attendanceGrid");if(!e)return;const s=this.state.scouts||[],r=this.state.activities||[],c=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[];if(s.length===0){e.innerHTML='<p class="text-gray-500 italic p-4">Nessun esploratore registrato.</p>';return}const p=l=>this.toJsDate(l)||new Date(l),n=this.getCurrentScoutYearSmart(),i=this.selectedStatsScoutYear||n,a=i==="all",o=[...r].filter(l=>a||(this.isActivityInScoutYear?this.isActivityInScoutYear(l,i):!0)).sort((l,m)=>p(l.data)-p(m.data));if(o.length===0){e.innerHTML=`<p class="text-gray-500 italic p-4">Nessuna attività registrata per l'anno scout ${i}.</p>`;return}const u=new Date;u.setHours(0,0,0,0);const d=o.filter(l=>{const m=new Date(p(l.data));m.setHours(0,0,0,0);const I=c.some(w=>w.attivitaId===l.id&&(w.stato==="Presente"||w.stato==="Assente"));return m<=u||I}),x=d.length>0?d:o,b=x.map(l=>l.id),f=[...s].map(l=>{const m=b.filter(k=>{const y=c.find(t=>t.esploratoreId===l.id&&t.attivitaId===k);return y&&(y.stato==="Presente"||y.stato==="Assente")}),I=m.length,w=c.filter(k=>k.esploratoreId===l.id&&k.stato==="Presente"&&m.includes(k.attivitaId)).length,v=I?Math.round(w/I*100):0;return{...l,perc:v}}).sort((l,m)=>m.perc-l.perc);let g='<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';g+='<thead><tr class="bg-gray-100 dark:bg-gray-700/60">',g+='<th class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 w-44 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>',x.forEach(l=>{const m=p(l.data),I=isNaN(m)?"":m.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"});g+=`<th class="p-1.5 border border-gray-200 dark:border-gray-700 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[65px]" title="${l.tipo}: ${l.descrizione||""}">${I}</th>`}),g+="</tr></thead><tbody>",f.forEach(l=>{const m=`${l.nome||""} ${l.cognome||""}`.trim()||"Esploratore",I=l.id?`<a href="scout2.html?id=${encodeURIComponent(l.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline">${m}</a>`:m;g+=`<tr><td class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium text-gray-800 dark:text-gray-200 shadow-[1px_0_0_0_#e5e7eb]">${I}</td>`,x.forEach(w=>{const v=c.find(t=>t.esploratoreId===l.id&&t.attivitaId===w.id);let k="bg-white dark:bg-gray-700",y="Dato non inserito";v&&(v.stato==="Presente"?(k="bg-green-500",y="Presente"):v.stato==="Assente"?(k="bg-red-500",y="Assente"):v.stato.toLowerCase()==="x"||v.stato==="NR"||v.stato.toLowerCase()==="giustificato"?(k="bg-gray-400",y="Non tenuto a esserci / Giustificato"):(k="bg-gray-400",y=v.stato)),g+=`<td class="p-1.5 border border-gray-200 dark:border-gray-700 text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${k}" title="${y}"></div>
               </td>`}),g+="</tr>"}),g+="</tbody></table></div>",g+=`
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div> Dato mancante</div>
    </div>
  `,e.innerHTML=g};UI.renderTotaleEsploratoriWidget=function(){const e=document.getElementById("totaleEsploratoriWidget");if(!e)return;const s=this.state.scouts||[],r=s.length;if(r===0){e.innerHTML='<p class="text-gray-500 italic">Nessun esploratore registrato.</p>';return}const c=s.filter(g=>g.anag_sesso?.toLowerCase()?.trim()==="maschio").length,p=s.filter(g=>g.anag_sesso?.toLowerCase()?.trim()==="femmina").length,n=r-c-p,i=Math.round(c/r*100),a=Math.round(p/r*100),o=n>0?Math.round(n/r*100):0,u={"I°":0,"II°":0,"III°":0,"IV°":0,Altro:0},d=[];s.forEach(g=>{const l=this.getAnnoScout(g.anag_dob);l&&u[l]!==void 0?u[l]++:u.Altro++;const m=this.getAnnoEsploratore(g.anag_dob);m!==null&&d.push(m)});const x=d.length>0?(d.reduce((g,l)=>g+l,0)/d.length).toFixed(1):"—",b=d.length>0?Math.min(...d):null,f=d.length>0?Math.max(...d):null;e.innerHTML=`
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
              <p class="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">${c}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
              ${i}%
            </span>
          </div>
          <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style="width: ${i}%"></div>
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
              ${a}%
            </span>
          </div>
          <div class="w-full bg-pink-200 dark:bg-pink-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-pink-500 h-2.5 rounded-full transition-all duration-500" style="width: ${a}%"></div>
          </div>
        </div>
      </div>

      <!-- 2. Barra di bilanciamento di genere -->
      <div class="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs font-bold mb-2">
          <span class="text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <span>♂</span> Maschi: ${c} (${i}%)
          </span>
          ${n>0?`<span class="text-gray-500 dark:text-gray-400">Non reg.: ${n} (${o}%)</span>`:""}
          <span class="text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <span>♀</span> Femmine: ${p} (${a}%)
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
          <div class="bg-blue-600 h-3 transition-all duration-500" style="width: ${i}%" title="Maschi ${i}%"></div>
          ${n>0?`<div class="bg-gray-400 h-3 transition-all duration-500" style="width: ${o}%" title="Non reg. ${o}%"></div>`:""}
          <div class="bg-pink-500 h-3 transition-all duration-500" style="width: ${a}%" title="Femmine ${a}%"></div>
        </div>
      </div>

      <!-- 3. Distribuzione per Anno Scout & Età -->
      <div class="bg-white dark:bg-gray-800/80 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>📅</span> Distribuzione per Anno Scout (Progressione per Età)
          </h4>
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            Età media: <strong class="text-gray-800 dark:text-gray-100">${x} anni</strong>
            ${b&&f?` · Range: ${b}-${f} anni`:""}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">I° Anno (11-12)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${u["I°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(u["I°"]/r*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">II° Anno (13)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${u["II°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(u["II°"]/r*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">III° Anno (14)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${u["III°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(u["III°"]/r*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">IV° Anno (15)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${u["IV°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(u["IV°"]/r*100)}%</span>
          </div>
        </div>
      </div>
    </div>
  `};UI.renderProgressioniWidget=function(){const e=document.getElementById("progressioniWidget");if(!e)return;const s=this.state.scouts||[],r=this.getCurrentScoutYearSmart(),c=this.selectedStatsScoutYear||r,p=c==="all",n=this.getScoutYearDateRange?this.getScoutYearDateRange(c):null,i=p?"Tutti gli anni (Globale)":`Anno Scout ${c}`,a={1:0,2:0,3:0};s.forEach(x=>{[1,2,3].forEach(b=>{const f=x[`pv_traccia${b}`];if(f&&f.done)if(p)a[b]++;else if(f.data){const g=this.toJsDate(f.data);g&&n&&g>=n.start&&g<=n.end&&a[b]++}else c===r&&a[b]++})});const o=a[1]+a[2]+a[3];let u=0;s.forEach(x=>{x.specialita&&Array.isArray(x.specialita)&&x.specialita.forEach(b=>{if(b.ottenuta)if(p)u++;else if(b.data){const f=this.toJsDate(b.data);f&&n&&f>=n.start&&f<=n.end&&u++}else c===r&&u++})});const d=o+u;e.innerHTML=`
    <div class="space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Progressioni Conquistate</span>
          <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            ${d} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">traguardi ottenuti</span>
          </h4>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
          📅 ${i}
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
                <p class="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100">${o}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Progressione Verticale
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 text-center">
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">I° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${a[1]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">II° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${a[2]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">III° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${a[3]}</span>
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
                <p class="text-2xl font-extrabold text-purple-900 dark:text-purple-100">${u}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
              Progressione Orizzontale
            </span>
          </div>
          <div class="mt-4 pt-3 border-t border-purple-200/60 dark:border-purple-800/60">
            <p class="text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
              <span>Brevetti e competenze conquistate</span>
              <span class="font-bold text-purple-900 dark:text-purple-100">${u} specialità</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `};UI.renderComposizionePattuglia=function(){const e=document.getElementById("totaliStats");if(!e)return;const s=this.state.scouts||[],r={};s.forEach(n=>{const i=n.pv_pattuglia||"Non assegnata";r[i]||(r[i]={m:0,f:0,altro:0,tot:0});const a=n.anag_sesso?.toLowerCase()?.trim();r[i].tot++,a==="maschio"?r[i].m++:a==="femmina"?r[i].f++:r[i].altro++});const p=Object.keys(r).sort((n,i)=>n==="Non assegnata"?1:i==="Non assegnata"?-1:n.localeCompare(i)).map(n=>{const i=r[n];let a="Non definita",o="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";return i.tot===0?a="Vuota":i.m>0&&i.f===0&&i.altro===0?(a="♂ Maschile",o="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"):i.f>0&&i.m===0&&i.altro===0?(a="♀ Femminile",o="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700"):i.m>0&&i.f>0&&(a="⚥ Mista",o="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700"),`
      <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">${n}</td>
        <td class="p-3 text-center font-bold text-gray-700 dark:text-gray-200">${i.tot}</td>
        <td class="p-3 text-center">
          <span class="inline-block px-3 py-1 text-xs font-bold rounded-full ${o}">${a}</span>
        </td>
      </tr>
    `}).join("");e.innerHTML=`
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
  `};UI.renderPattuglieTable=function(e){e&&(this._pattuglieTableScouts=e);const s=this._pattuglieTableScouts||this.state.scouts||[];this._pattuglieSortState||(this._pattuglieSortState={field:"nome",direction:"asc"});const r={};s.forEach(d=>{const x=d.pv_pattuglia||"Non assegnata";r[x]||(r[x]=[]);const b=this.getAnnoScout(d.anag_dob);let f="-";d.pv_traccia3?.done?f="3":d.pv_traccia2?.done?f="2":d.pv_traccia1?.done&&(f="1");let g=0;d.specialita&&Array.isArray(d.specialita)&&(g=d.specialita.filter(m=>m.ottenuta).length);const l=d.pv_vcp_cp||"";r[x].push({id:d.id,nome:`${d.nome||""} ${d.cognome||""}`.trim()||"Nome non disponibile",annoScout:b||"N/A",cpVcp:l,passo:f,numSpecialita:g})});const c=this._pattuglieSortState.field,p=this._pattuglieSortState.direction;Object.keys(r).forEach(d=>{r[d].sort((x,b)=>{let f=0;if(c==="nome")f=x.nome.localeCompare(b.nome);else if(c==="annoScout"){const g={"I°":1,"II°":2,"III°":3,"IV°":4,"N/A":5},l=g[x.annoScout]||5,m=g[b.annoScout]||5;f=l-m,f===0&&(f=x.nome.localeCompare(b.nome))}return p==="asc"?f:-f})});const n=Object.keys(r).sort((d,x)=>d==="Non assegnata"?1:x==="Non assegnata"?-1:d.localeCompare(x)),i=document.getElementById("sortNomeIcon"),a=document.getElementById("sortAnnoScoutIcon");i&&(i.textContent=c==="nome"?p==="asc"?"↑":"↓":"↕"),a&&(a.textContent=c==="annoScout"?p==="asc"?"↑":"↓":"↕");const o=document.getElementById("pattuglieTableBody");if(!o)return;let u="";if(n.forEach(d=>{const x=r[d];x.forEach((b,f)=>{const g=b.id?`<a href="scout2.html?id=${encodeURIComponent(b.id)}" class="text-green-700 dark:text-green-400 font-semibold hover:underline">${b.nome}</a>`:`<span class="text-gray-800 dark:text-gray-200">${b.nome}</span>`;u+=`
        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
          ${f===0?`<td class="p-2.5 font-semibold text-gray-800 dark:text-gray-100 align-top" rowspan="${x.length}">${d}</td>`:""}
          <td class="p-2.5">${g}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300">${b.annoScout}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300 font-medium">${b.cpVcp}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300">${b.passo}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300 font-medium">${b.numSpecialita}</td>
        </tr>
      `})}),o.innerHTML=u||'<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>',!this._pattuglieSortListenersAdded){const d=document.getElementById("sortNome"),x=document.getElementById("sortAnnoScout");d&&d.addEventListener("click",()=>{this._pattuglieSortState.field==="nome"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="nome",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),x&&x.addEventListener("click",()=>{this._pattuglieSortState.field==="annoScout"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="annoScout",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),this._pattuglieSortListenersAdded=!0}};UI.renderRiepilogoSpecialita=function(){const e=document.getElementById("tempiSpecialitaStats");if(!e)return;const s=this.state.scouts||[],r={};s.forEach(a=>{a.specialita&&Array.isArray(a.specialita)&&a.specialita.forEach(o=>{o.ottenuta&&o.nome&&(r[o.nome]=(r[o.nome]||0)+1)})});const c=Object.entries(r).sort((a,o)=>o[1]-a[1]).slice(0,5),p=s.filter(a=>!a.specialita||!Array.isArray(a.specialita)?!0:a.specialita.filter(o=>o.ottenuta).length===0),n=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🏅</span> Top 5 Specialità Conquistate
      </div>
      ${c.length>0?`<ol class="space-y-2">
            ${c.map(([a,o],u)=>`
              <li class="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span class="text-gray-700 dark:text-gray-300 font-medium">${u+1}. ${a}</span>
                <span class="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full text-xs">${o}</span>
              </li>`).join("")}
          </ol>`:'<p class="text-xs text-gray-500 italic">Nessuna specialità registrata.</p>'}
    </div>
  `,i=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
        <span class="flex items-center gap-2"><span>🎯</span> Senza specialità</span>
        <span class="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full text-xs">${p.length}</span>
      </div>
      ${p.length>0?`<ul class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-700">
            ${p.map(a=>{const o=`${a.nome||""} ${a.cognome||""}`.trim()||"Esploratore",u=a.pv_pattuglia?`(${a.pv_pattuglia})`:"";return`<li class="pt-1 flex items-center justify-between">
                <a href="scout2.html?id=${encodeURIComponent(a.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline font-medium">${o}</a>
                <span class="text-gray-400 text-[10px]">${u}</span>
              </li>`}).join("")}
          </ul>`:'<div class="text-xs text-green-600 dark:text-green-400 font-medium">Tutti gli esploratori hanno almeno una specialità! 🎉</div>'}
    </div>
  `;e.innerHTML=n+i};
