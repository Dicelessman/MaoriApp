import"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.toJsDate=function(n){if(!n)return null;if(n instanceof Date)return n;if(n&&n.toDate)return n.toDate();const l=new Date(n);return isNaN(l.getTime())?null:l};UI.getAnnoEsploratore=function(n){if(!n)return null;const l=this.toJsDate(n);if(!l)return null;const a=new Date;let u=a.getFullYear()-l.getFullYear();const g=a.getMonth()-l.getMonth();return(g<0||g===0&&a.getDate()<l.getDate())&&u--,u};UI.getAnnoScout=function(n){const l=this.getAnnoEsploratore(n);return l===null?null:l>=11&&l<=12?"I°":l===13?"II°":l===14?"III°":l===15?"IV°":null};UI.setupStatsScoutYearSelector=function(){const n=document.getElementById("statsScoutYearSelect");if(!n)return;const l=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",a=this.getAllScoutYears?this.getAllScoutYears(this.state.activities):[l];this.selectedStatsScoutYear||(this.selectedStatsScoutYear=this.getSelectedScoutYear?this.getSelectedScoutYear():l),n.innerHTML="",a.forEach(o=>{const t=o===l?`${o} (In corso)`:`${o} (Archiviato)`,i=document.createElement("option");i.value=o,i.textContent=t,o===this.selectedStatsScoutYear&&(i.selected=!0),n.appendChild(i)});const u=document.createElement("option");u.value="all",u.textContent="Tutti gli anni (Globale)",this.selectedStatsScoutYear==="all"&&(u.selected=!0),n.appendChild(u);const g=document.getElementById("statsArchiveBadge");if(g){const o=this.selectedStatsScoutYear!=="all"&&this.selectedStatsScoutYear!==l;g.classList.toggle("hidden",!o)}n._bound||(n._bound=!0,n.addEventListener("change",async o=>{this.selectedStatsScoutYear=o.target.value,this.setSelectedScoutYear&&o.target.value!=="all"&&await this.setSelectedScoutYear(o.target.value),this.renderCurrentPage()}))};UI._charts=UI._charts||{scout:null,activity:null};UI._destroyCharts=function(){try{this._charts.scout&&(this._charts.scout.destroy(),this._charts.scout=null)}catch{}try{this._charts.activity&&(this._charts.activity.destroy(),this._charts.activity=null)}catch{}};UI.renderCurrentPage=function(){this.setupStatsScoutYearSelector(),this.renderDashboardCharts(),this.renderAttendanceGrid(),this.renderTotaleEsploratoriWidget(),this.renderProgressioniWidget(),this.renderComposizionePattuglia(),this.renderPattuglieTable(),this.renderRiepilogoSpecialita()};UI.renderDashboardCharts=function(){const n=this.state.scouts||[],l=this.state.activities||[],a=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],u=document.getElementById("scoutPresenceChart"),g=document.getElementById("activityPresenceChart");if(!u||!g)return;this._destroyCharts();const o=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),c=o==="all",t=s=>this.toJsDate(s)||new Date(s),i=[...l].filter(s=>c||(this.isActivityInScoutYear?this.isActivityInScoutYear(s,o):!0)).sort((s,f)=>t(s.data)-t(f.data)),x=new Date;x.setHours(0,0,0,0);let d=null;i.forEach(s=>{const f=t(s.data),v=new Date(f);v.setHours(0,0,0,0),d===null&&v>=x&&(d=s.id)});const p=i.filter(s=>{const f=t(s.data),v=new Date(f);return v.setHours(0,0,0,0),v<x}).map(s=>s.id),e=d?[...p,d]:p,r=n.map(s=>{const f=e.filter(w=>{const $=a.find(C=>C.esploratoreId===s.id&&C.attivitaId===w);return $&&($.stato==="Presente"||$.stato==="Assente")}),v=f.length,A=a.filter(w=>w.esploratoreId===s.id&&w.stato==="Presente"&&f.includes(w.attivitaId)).length,_=v?Math.round(A/v*100):0;return{name:`${s.nome||""} ${s.cognome||""}`.trim()||"Esploratore",perc:_,presentCount:A,totalActsConsidered:v}});r.sort((s,f)=>f.perc-s.perc);const b=r.map(s=>s.name),h=r.map(s=>s.perc),m=h.map(s=>s>=75?"#16a34a":s>=60?"#eab308":"#dc2626"),y=i.map(s=>{const f=t(s.data),v=isNaN(f)?"":f.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"});return`${s.tipo}: ${s.descrizione||""}
${v}`}),k=i.map(s=>a.filter(f=>f.attivitaId===s.id&&f.stato==="Presente").length),S=window.ChartDataLabels;window.Chart&&S&&window.Chart.register(S);const I={responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:8,right:12,bottom:8,left:12}},plugins:{legend:{display:!1},datalabels:{color:"#fff",formatter:s=>s>0?typeof s=="number"&&s<=100?s.toFixed(1)+"%":s:"",anchor:"end",align:"end",offset:-5,font:{weight:"bold"}}},elements:{bar:{borderRadius:4,maxBarThickness:28}}};this._charts.scout=new window.Chart(u.getContext("2d"),{type:"bar",data:{labels:b,datasets:[{label:"Presenze",data:h,backgroundColor:m}]},options:{...I,indexAxis:"y",scales:{x:{beginAtZero:!0,max:100,ticks:{callback:s=>s+"%"}},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...I.plugins,tooltip:{callbacks:{label:function(s){const f=r[s.dataIndex];return` ${f.perc}% (${f.presentCount} / ${f.totalActsConsidered} attività)`}}}}}}),this._charts.activity=new window.Chart(g.getContext("2d"),{type:"bar",data:{labels:y,datasets:[{label:"Presenze",data:k,backgroundColor:"#16a34a"}]},options:{...I,indexAxis:"y",scales:{x:{beginAtZero:!0,max:Math.max(1,n.length)},y:{ticks:{autoSkip:!1,maxTicksLimit:25}}},plugins:{...I.plugins,datalabels:{...I.plugins.datalabels,formatter:s=>s>0?`${s} / ${n.length}`:""}}}})};UI.renderAttendanceGrid=function(){const n=document.getElementById("attendanceGrid");if(!n)return;const l=this.state.scouts||[],a=this.state.activities||[],u=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[];if(l.length===0){n.innerHTML='<p class="text-gray-500 italic p-4">Nessun esploratore registrato.</p>';return}const g=e=>this.toJsDate(e)||new Date(e),o=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),c=o==="all",t=new Date;t.setHours(0,0,0,0);const i=[...a].filter(e=>c||(this.isActivityInScoutYear?this.isActivityInScoutYear(e,o):!0)).filter(e=>{const r=new Date(g(e.data));return r.setHours(0,0,0,0),r<=t}).sort((e,r)=>g(e.data)-g(r.data));if(i.length===0){n.innerHTML='<p class="text-gray-500 italic p-4">Nessuna attività registrata per il periodo selezionato.</p>';return}const x=i.map(e=>e.id),d=[...l].map(e=>{const r=x.filter(y=>{const k=u.find(S=>S.esploratoreId===e.id&&S.attivitaId===y);return k&&(k.stato==="Presente"||k.stato==="Assente")}),b=r.length,h=u.filter(y=>y.esploratoreId===e.id&&y.stato==="Presente"&&r.includes(y.attivitaId)).length,m=b?Math.round(h/b*100):0;return{...e,perc:m}}).sort((e,r)=>r.perc-e.perc);let p='<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';p+='<thead><tr class="bg-gray-100 dark:bg-gray-700/60">',p+='<th class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 w-44 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>',i.forEach(e=>{const r=g(e.data),b=isNaN(r)?"":r.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"});p+=`<th class="p-1.5 border border-gray-200 dark:border-gray-700 text-center text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[65px]" title="${e.tipo}: ${e.descrizione||""}">${b}</th>`}),p+="</tr></thead><tbody>",d.forEach(e=>{const r=`${e.nome||""} ${e.cognome||""}`.trim()||"Esploratore",b=e.id?`<a href="scout2.html?id=${encodeURIComponent(e.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline">${r}</a>`:r;p+=`<tr><td class="p-1.5 px-2.5 border border-gray-200 dark:border-gray-700 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 font-medium text-gray-800 dark:text-gray-200 shadow-[1px_0_0_0_#e5e7eb]">${b}</td>`,i.forEach(h=>{const m=u.find(S=>S.esploratoreId===e.id&&S.attivitaId===h.id);let y="bg-white dark:bg-gray-700",k="Dato non inserito";m&&(m.stato==="Presente"?(y="bg-green-500",k="Presente"):m.stato==="Assente"?(y="bg-red-500",k="Assente"):m.stato.toLowerCase()==="x"||m.stato==="NR"||m.stato.toLowerCase()==="giustificato"?(y="bg-gray-400",k="Non tenuto a esserci / Giustificato"):(y="bg-gray-400",k=m.stato)),p+=`<td class="p-1.5 border border-gray-200 dark:border-gray-700 text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${y}" title="${k}"></div>
               </td>`}),p+="</tr>"}),p+="</tbody></table></div>",p+=`
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"></div> Dato mancante</div>
    </div>
  `,n.innerHTML=p};UI.renderTotaleEsploratoriWidget=function(){const n=document.getElementById("totaleEsploratoriWidget");if(!n)return;const l=this.state.scouts||[],a=l.length;if(a===0){n.innerHTML='<p class="text-gray-500 italic">Nessun esploratore registrato.</p>';return}const u=l.filter(b=>b.anag_sesso?.toLowerCase()?.trim()==="maschio").length,g=l.filter(b=>b.anag_sesso?.toLowerCase()?.trim()==="femmina").length,o=a-u-g,c=Math.round(u/a*100),t=Math.round(g/a*100),i=o>0?Math.round(o/a*100):0,x={"I°":0,"II°":0,"III°":0,"IV°":0,Altro:0},d=[];l.forEach(b=>{const h=this.getAnnoScout(b.anag_dob);h&&x[h]!==void 0?x[h]++:x.Altro++;const m=this.getAnnoEsploratore(b.anag_dob);m!==null&&d.push(m)});const p=d.length>0?(d.reduce((b,h)=>b+h,0)/d.length).toFixed(1):"—",e=d.length>0?Math.min(...d):null,r=d.length>0?Math.max(...d):null;n.innerHTML=`
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
              <p class="text-3xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">${u}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
              ${c}%
            </span>
          </div>
          <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style="width: ${c}%"></div>
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
              ${t}%
            </span>
          </div>
          <div class="w-full bg-pink-200 dark:bg-pink-800 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-pink-500 h-2.5 rounded-full transition-all duration-500" style="width: ${t}%"></div>
          </div>
        </div>
      </div>

      <!-- 2. Barra di bilanciamento di genere -->
      <div class="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-xs font-bold mb-2">
          <span class="text-blue-700 dark:text-blue-400 flex items-center gap-1">
            <span>♂</span> Maschi: ${u} (${c}%)
          </span>
          ${o>0?`<span class="text-gray-500 dark:text-gray-400">Non reg.: ${o} (${i}%)</span>`:""}
          <span class="text-pink-600 dark:text-pink-400 flex items-center gap-1">
            <span>♀</span> Femmine: ${g} (${t}%)
          </span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
          <div class="bg-blue-600 h-3 transition-all duration-500" style="width: ${c}%" title="Maschi ${c}%"></div>
          ${o>0?`<div class="bg-gray-400 h-3 transition-all duration-500" style="width: ${i}%" title="Non reg. ${i}%"></div>`:""}
          <div class="bg-pink-500 h-3 transition-all duration-500" style="width: ${t}%" title="Femmine ${t}%"></div>
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
            ${e&&r?` · Range: ${e}-${r} anni`:""}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">I° Anno (11-12)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${x["I°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(x["I°"]/a*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">II° Anno (13)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${x["II°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(x["II°"]/a*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">III° Anno (14)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${x["III°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(x["III°"]/a*100)}%</span>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700 text-center">
            <span class="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase tracking-wide">IV° Anno (15)</span>
            <span class="text-xl font-black text-gray-800 dark:text-gray-100 mt-1 block">${x["IV°"]}</span>
            <span class="text-[11px] text-gray-500 dark:text-gray-400">${Math.round(x["IV°"]/a*100)}%</span>
          </div>
        </div>
      </div>
    </div>
  `};UI.renderProgressioniWidget=function(){const n=document.getElementById("progressioniWidget");if(!n)return;const l=this.state.scouts||[],a=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),u=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",g=a==="all",o=this.getScoutYearDateRange?this.getScoutYearDateRange(a):null,c=g?"Tutti gli anni (Globale)":`Anno Scout ${a}`,t={1:0,2:0,3:0};l.forEach(p=>{[1,2,3].forEach(e=>{const r=p[`pv_traccia${e}`];if(r&&r.done)if(g)t[e]++;else if(r.data){const b=this.toJsDate(r.data);b&&o&&b>=o.start&&b<=o.end&&t[e]++}else a===u&&t[e]++})});const i=t[1]+t[2]+t[3];let x=0;l.forEach(p=>{p.specialita&&Array.isArray(p.specialita)&&p.specialita.forEach(e=>{if(e.ottenuta)if(g)x++;else if(e.data){const r=this.toJsDate(e.data);r&&o&&r>=o.start&&r<=o.end&&x++}else a===u&&x++})});const d=i+x;n.innerHTML=`
    <div class="space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">Progressioni Conquistate</span>
          <h4 class="text-2xl font-black text-gray-900 dark:text-gray-100 mt-0.5">
            ${d} <span class="text-sm font-normal text-gray-500 dark:text-gray-400">traguardi ottenuti</span>
          </h4>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
          📅 ${c}
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
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${t[1]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">II° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${t[2]}</span>
            </div>
            <div class="bg-white/80 dark:bg-gray-800/80 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400 block">III° Passo</span>
              <span class="text-base font-extrabold text-emerald-700 dark:text-emerald-300">${t[3]}</span>
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
                <p class="text-2xl font-extrabold text-purple-900 dark:text-purple-100">${x}</p>
              </div>
            </div>
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
              Progressione Orizzontale
            </span>
          </div>
          <div class="mt-4 pt-3 border-t border-purple-200/60 dark:border-purple-800/60">
            <p class="text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
              <span>Brevetti e competenze conquistate</span>
              <span class="font-bold text-purple-900 dark:text-purple-100">${x} specialità</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `};UI.renderComposizionePattuglia=function(){const n=document.getElementById("totaliStats");if(!n)return;const l=this.state.scouts||[],a={};l.forEach(o=>{const c=o.pv_pattuglia||"Non assegnata";a[c]||(a[c]={m:0,f:0,altro:0,tot:0});const t=o.anag_sesso?.toLowerCase()?.trim();a[c].tot++,t==="maschio"?a[c].m++:t==="femmina"?a[c].f++:a[c].altro++});const g=Object.keys(a).sort((o,c)=>o==="Non assegnata"?1:c==="Non assegnata"?-1:o.localeCompare(c)).map(o=>{const c=a[o];let t="Non definita",i="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";return c.tot===0?t="Vuota":c.m>0&&c.f===0&&c.altro===0?(t="♂ Maschile",i="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"):c.f>0&&c.m===0&&c.altro===0?(t="♀ Femminile",i="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border border-pink-200 dark:border-pink-700"):c.m>0&&c.f>0&&(t="⚥ Mista",i="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700"),`
      <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">${o}</td>
        <td class="p-3 text-center font-bold text-gray-700 dark:text-gray-200">${c.tot}</td>
        <td class="p-3 text-center">
          <span class="inline-block px-3 py-1 text-xs font-bold rounded-full ${i}">${t}</span>
        </td>
      </tr>
    `}).join("");n.innerHTML=`
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
  `};UI.renderPattuglieTable=function(n){n&&(this._pattuglieTableScouts=n);const l=this._pattuglieTableScouts||this.state.scouts||[];this._pattuglieSortState||(this._pattuglieSortState={field:"nome",direction:"asc"});const a={};l.forEach(d=>{const p=d.pv_pattuglia||"Non assegnata";a[p]||(a[p]=[]);const e=this.getAnnoScout(d.anag_dob);let r="-";d.pv_traccia3?.done?r="3":d.pv_traccia2?.done?r="2":d.pv_traccia1?.done&&(r="1");let b=0;d.specialita&&Array.isArray(d.specialita)&&(b=d.specialita.filter(m=>m.ottenuta).length);const h=d.pv_vcp_cp||"";a[p].push({id:d.id,nome:`${d.nome||""} ${d.cognome||""}`.trim()||"Nome non disponibile",annoScout:e||"N/A",cpVcp:h,passo:r,numSpecialita:b})});const u=this._pattuglieSortState.field,g=this._pattuglieSortState.direction;Object.keys(a).forEach(d=>{a[d].sort((p,e)=>{let r=0;if(u==="nome")r=p.nome.localeCompare(e.nome);else if(u==="annoScout"){const b={"I°":1,"II°":2,"III°":3,"IV°":4,"N/A":5},h=b[p.annoScout]||5,m=b[e.annoScout]||5;r=h-m,r===0&&(r=p.nome.localeCompare(e.nome))}return g==="asc"?r:-r})});const o=Object.keys(a).sort((d,p)=>d==="Non assegnata"?1:p==="Non assegnata"?-1:d.localeCompare(p)),c=document.getElementById("sortNomeIcon"),t=document.getElementById("sortAnnoScoutIcon");c&&(c.textContent=u==="nome"?g==="asc"?"↑":"↓":"↕"),t&&(t.textContent=u==="annoScout"?g==="asc"?"↑":"↓":"↕");const i=document.getElementById("pattuglieTableBody");if(!i)return;let x="";if(o.forEach(d=>{const p=a[d];p.forEach((e,r)=>{const b=e.id?`<a href="scout2.html?id=${encodeURIComponent(e.id)}" class="text-green-700 dark:text-green-400 font-semibold hover:underline">${e.nome}</a>`:`<span class="text-gray-800 dark:text-gray-200">${e.nome}</span>`;x+=`
        <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
          ${r===0?`<td class="p-2.5 font-semibold text-gray-800 dark:text-gray-100 align-top" rowspan="${p.length}">${d}</td>`:""}
          <td class="p-2.5">${b}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300">${e.annoScout}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300 font-medium">${e.cpVcp}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300">${e.passo}</td>
          <td class="p-2.5 text-gray-600 dark:text-gray-300 font-medium">${e.numSpecialita}</td>
        </tr>
      `})}),i.innerHTML=x||'<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>',!this._pattuglieSortListenersAdded){const d=document.getElementById("sortNome"),p=document.getElementById("sortAnnoScout");d&&d.addEventListener("click",()=>{this._pattuglieSortState.field==="nome"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="nome",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),p&&p.addEventListener("click",()=>{this._pattuglieSortState.field==="annoScout"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="annoScout",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),this._pattuglieSortListenersAdded=!0}};UI.renderRiepilogoSpecialita=function(){const n=document.getElementById("tempiSpecialitaStats");if(!n)return;const l=this.state.scouts||[],a={};l.forEach(t=>{t.specialita&&Array.isArray(t.specialita)&&t.specialita.forEach(i=>{i.ottenuta&&i.nome&&(a[i.nome]=(a[i.nome]||0)+1)})});const u=Object.entries(a).sort((t,i)=>i[1]-t[1]).slice(0,5),g=l.filter(t=>!t.specialita||!Array.isArray(t.specialita)?!0:t.specialita.filter(i=>i.ottenuta).length===0),o=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
        <span>🏅</span> Top 5 Specialità Conquistate
      </div>
      ${u.length>0?`<ol class="space-y-2">
            ${u.map(([t,i],x)=>`
              <li class="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span class="text-gray-700 dark:text-gray-300 font-medium">${x+1}. ${t}</span>
                <span class="font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full text-xs">${i}</span>
              </li>`).join("")}
          </ol>`:'<p class="text-xs text-gray-500 italic">Nessuna specialità registrata.</p>'}
    </div>
  `,c=`
    <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
      <div class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
        <span class="flex items-center gap-2"><span>🎯</span> Senza specialità</span>
        <span class="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full text-xs">${g.length}</span>
      </div>
      ${g.length>0?`<ul class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-700">
            ${g.map(t=>{const i=`${t.nome||""} ${t.cognome||""}`.trim()||"Esploratore",x=t.pv_pattuglia?`(${t.pv_pattuglia})`:"";return`<li class="pt-1 flex items-center justify-between">
                <a href="scout2.html?id=${encodeURIComponent(t.id)}" class="hover:text-green-600 dark:hover:text-green-400 hover:underline font-medium">${i}</a>
                <span class="text-gray-400 text-[10px]">${x}</span>
              </li>`}).join("")}
          </ul>`:'<div class="text-xs text-green-600 dark:text-green-400 font-medium">Tutti gli esploratori hanno almeno una specialità! 🎉</div>'}
    </div>
  `;n.innerHTML=o+c};
