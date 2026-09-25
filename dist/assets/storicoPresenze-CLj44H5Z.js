import{D as T,U as v}from"./date-picker-DdNAYcTb.js";import"./shared-Dm_IxfHL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";typeof window<"u"&&(window.DATA=T,window.UI=v);v.renderCurrentPage=function(){this.initStoricoPresenze()};v._storicoState={selectedYear:"",search:"",patrol:"",attendanceLevel:"all",sort:"perc_desc",isGridVisible:!1,bound:!1};v.initStoricoPresenze=function(){const s=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",m=this.getAllScoutYears?this.getAllScoutYears(this.state.activities):[s],d=m.filter(g=>g!==s);this._storicoState.selectedYear||(this._storicoState.selectedYear=d.length>0?d[0]:s),this.setupStoricoControls(m,s),this.renderStoricoPresenze()};v.setupStoricoControls=function(s,m){const d=document.getElementById("storicoScoutYearSelect"),g=document.getElementById("storicoSearchInput"),a=document.getElementById("storicoPatrolFilter"),i=document.getElementById("storicoAttendanceFilter"),o=document.getElementById("storicoSortSelect"),e=document.getElementById("resetStoricoFiltersBtn"),l=document.getElementById("printStoricoBtn"),p=document.getElementById("exportStoricoCsvBtn"),u=document.getElementById("toggleHistoricalGridBtn"),x=document.getElementById("closeScoutDetailModalBtn");if(d){d.innerHTML="",s.forEach(n=>{const t=n===m?`${n} (In corso)`:`${n} (Archivio)`,c=document.createElement("option");c.value=n,c.textContent=t,n===this._storicoState.selectedYear&&(c.selected=!0),d.appendChild(c)});const r=document.createElement("option");r.value="all",r.textContent="📊 Tutti gli Anni (Confronto Storico)",this._storicoState.selectedYear==="all"&&(r.selected=!0),d.appendChild(r),d.value=this._storicoState.selectedYear}if(a){const r=this.state.scouts||[],n=Array.from(new Set(r.map(t=>(t.pv_pattuglia||"").trim()).filter(Boolean))).sort((t,c)=>t.localeCompare(c)),f=this._storicoState.patrol;a.innerHTML='<option value="">Tutte le pattuglie</option>'+n.map(t=>`<option value="${t}">${t}</option>`).join(""),a.value=f}if(!this._storicoState.bound){if(this._storicoState.bound=!0,d&&d.addEventListener("change",r=>{this._storicoState.selectedYear=r.target.value,this.renderStoricoPresenze()}),g){let r;g.addEventListener("input",n=>{clearTimeout(r),r=setTimeout(()=>{this._storicoState.search=n.target.value.trim().toLowerCase(),this.renderStoricoPresenze()},150)})}a&&a.addEventListener("change",r=>{this._storicoState.patrol=r.target.value,this.renderStoricoPresenze()}),i&&i.addEventListener("change",r=>{this._storicoState.attendanceLevel=r.target.value,this.renderStoricoPresenze()}),o&&o.addEventListener("change",r=>{this._storicoState.sort=r.target.value,this.renderStoricoPresenze()}),e&&e.addEventListener("click",()=>{const r=s.filter(n=>n!==m);this._storicoState.selectedYear=r.length>0?r[0]:m,this._storicoState.search="",this._storicoState.patrol="",this._storicoState.attendanceLevel="all",this._storicoState.sort="perc_desc",d&&(d.value=this._storicoState.selectedYear),g&&(g.value=""),a&&(a.value=""),i&&(i.value="all"),o&&(o.value="perc_desc"),this.renderStoricoPresenze(),this.showToast("Filtri ripristinati",{type:"info"})}),l&&l.addEventListener("click",()=>{this.printStoricoReport()}),p&&p.addEventListener("click",()=>{this.exportStoricoCsv()}),u&&u.addEventListener("click",()=>{this._storicoState.isGridVisible=!this._storicoState.isGridVisible;const r=document.getElementById("historicalGridContainer"),n=document.getElementById("gridToggleIcon"),f=document.getElementById("gridToggleText");r&&r.classList.toggle("hidden",!this._storicoState.isGridVisible),n&&(n.textContent=this._storicoState.isGridVisible?"🙈":"👁️"),f&&(f.textContent=this._storicoState.isGridVisible?"Nascondi Registro Tabellare":"Mostra Registro Tabellare")}),x&&x.addEventListener("click",()=>{const r=document.getElementById("scoutDetailModal");r&&r.classList.add("hidden")})}};v.renderStoricoPresenze=function(){const s=this._storicoState.selectedYear,m=s==="all",d=document.getElementById("multiYearComparisonSection"),g=document.getElementById("singleYearStatsSection"),a=document.getElementById("patrolStatsSection"),i=document.getElementById("historicalGridSection");if(document.getElementById("storicoKpisSection"),m){d&&d.classList.remove("hidden"),g&&g.classList.add("hidden"),a&&a.classList.add("hidden"),i&&i.classList.add("hidden"),this.renderMultiYearComparison();return}d&&d.classList.add("hidden"),g&&g.classList.remove("hidden"),a&&a.classList.remove("hidden"),i&&i.classList.remove("hidden");const o=document.getElementById("singleYearTableTitle"),e=document.getElementById("singleYearTableSubtitle");o&&(o.textContent=`Statistiche Presenze Esploratori · Anno Scout ${s}`),e&&(e.textContent=`Dati ufficiali storici delle presenze relative all'anno scout ${s}`);const l=(this.state.activities||[]).filter(t=>this.isActivityInScoutYear?this.isActivityInScoutYear(t,s):!0).sort((t,c)=>this.toJsDate(t.data)-this.toJsDate(c.data)),p=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],u=this.state.scouts||[],x=u.map(t=>{let c=0,h=0,b=0,y=0,S=0;const k=[];l.forEach(P=>{const $=p.find(A=>A.esploratoreId===t.id&&A.attivitaId===P.id),w=$?$.stato:"NR",E=parseFloat(P.costo||"0"),B=$?$.pagato:!1;w==="Presente"?(c++,E>0&&(B?y+=E:S+=E)):w==="Assente"?h++:b++,k.push({activity:P,presence:$||{stato:"NR",pagato:!1},stato:w})});const C=c+h,I=C>0?Math.round(c/C*100):0,_=(t.nome?`${t.nome} ${t.cognome||""}`:t.anag_nome?`${t.anag_nome} ${t.anag_cognome||""}`:t.id).trim();return{scout:t,nomeCompleto:_,patrol:(t.pv_pattuglia||"").trim(),totalActivities:l.length,presenti:c,assenti:h,nr:b,totalValid:C,perc:I,totalPaid:y,totalToPay:S,scoutPresences:k}});let r=x;if(this._storicoState.search){const t=this._storicoState.search;r=r.filter(c=>c.nomeCompleto.toLowerCase().includes(t))}this._storicoState.patrol&&(r=r.filter(t=>t.patrol===this._storicoState.patrol)),this._storicoState.attendanceLevel!=="all"&&(this._storicoState.attendanceLevel==="high"?r=r.filter(t=>t.perc>=75):this._storicoState.attendanceLevel==="medium"?r=r.filter(t=>t.perc>=50&&t.perc<75):this._storicoState.attendanceLevel==="low"&&(r=r.filter(t=>t.perc<50)));const n=this._storicoState.sort||"perc_desc";r.sort((t,c)=>{if(n==="perc_desc")return c.perc-t.perc||c.presenti-t.presenti;if(n==="perc_asc")return t.perc-c.perc||t.presenti-c.presenti;if(n==="presenti_desc")return c.presenti-t.presenti||c.perc-t.perc;if(n==="cognome_asc"){const h=(t.scout.cognome||"").trim().localeCompare((c.scout.cognome||"").trim(),"it");return h!==0?h:t.nomeCompleto.localeCompare(c.nomeCompleto,"it")}if(n==="cognome_desc"){const h=(c.scout.cognome||"").trim().localeCompare((t.scout.cognome||"").trim(),"it");return h!==0?h:c.nomeCompleto.localeCompare(t.nomeCompleto,"it")}if(n==="nome_asc")return t.nomeCompleto.localeCompare(c.nomeCompleto,"it");if(n==="pattuglia_asc"){if(!t.patrol&&c.patrol)return 1;if(t.patrol&&!c.patrol)return-1;const h=t.patrol.localeCompare(c.patrol,"it");return h!==0?h:t.nomeCompleto.localeCompare(c.nomeCompleto,"it")}return 0});const f=document.getElementById("storicoFilterSummary");f&&(f.textContent=`Visualizzati: ${r.length} di ${u.length} esploratori, ${l.length} attività (Anno Scout ${s})`),this.renderStoricoKPICards(x,l,s),this.renderStoricoTable(r,l),this.renderStoricoPatrolStats(x,l),this.renderHistoricalGrid(l,u,p)};v.renderStoricoKPICards=function(s,m,d){const g=document.getElementById("storicoKpiCards");if(!g)return;const a=m.length,i=s.length;let o=0,e=0;s.forEach(n=>{o+=n.presenti,e+=n.totalValid});const l=e>0?Math.round(o/e*100):0,p={};s.forEach(n=>{n.patrol&&(p[n.patrol]||(p[n.patrol]={presenti:0,valid:0,scouts:0}),p[n.patrol].presenti+=n.presenti,p[n.patrol].valid+=n.totalValid,p[n.patrol].scouts++)});let u="Nessuna",x=-1;Object.entries(p).forEach(([n,f])=>{const t=f.valid>0?Math.round(f.presenti/f.valid*100):0;t>x&&(x=t,u=n)});const r=s.filter(n=>n.perc>=75).length;g.innerHTML=`
    <div class="bg-gradient-to-br from-green-600 to-green-700 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-xs font-semibold uppercase tracking-wider mb-1">Presenza Media Reparto</p>
          <p class="text-3xl font-extrabold">${l}%</p>
          <p class="text-green-100 text-xs mt-1">${o} presenze su ${e} totali</p>
        </div>
        <div class="text-3xl opacity-80">📊</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">Attività Svolte</p>
          <p class="text-3xl font-extrabold">${a}</p>
          <p class="text-blue-100 text-xs mt-1">Anno Scout ${d}</p>
        </div>
        <div class="text-3xl opacity-80">📅</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-xs font-semibold uppercase tracking-wider mb-1">Esploratori Partecipanti</p>
          <p class="text-3xl font-extrabold">${i}</p>
          <p class="text-purple-100 text-xs mt-1">${r} con presenza ≥ 75%</p>
        </div>
        <div class="text-3xl opacity-80">👥</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-xl shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-amber-100 text-xs font-semibold uppercase tracking-wider mb-1">Miglior Pattuglia</p>
          <p class="text-2xl font-extrabold truncate max-w-[170px]" title="${u}">${u}</p>
          <p class="text-amber-100 text-xs mt-1">${x>=0?`${x}% presenze medie`:"Dati non disponibili"}</p>
        </div>
        <div class="text-3xl opacity-80">🏆</div>
      </div>
    </div>
  `};v.renderStoricoTable=function(s,m){const d=document.getElementById("storicoTableBody");if(!d)return;if(s.length===0){d.innerHTML=`
      <tr>
        <td colspan="10" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          Nessun esploratore trovato con i filtri selezionati per quest'anno scout.
        </td>
      </tr>
    `;return}d.innerHTML=s.map(a=>{const i=a.scout,o=a.patrol?`<span class="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">${a.patrol}</span>`:'<span class="text-gray-400 text-xs italic">-</span>';let e="",l="bg-green-600";a.perc>=75?(e='<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">Ottima</span>',l="bg-green-600"):a.perc>=50?(e='<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">Media</span>',l="bg-yellow-500"):(e='<span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">Bassa</span>',l="bg-red-500");const p=a.totalToPay>0?`<span class="text-xs font-semibold text-red-600 dark:text-red-400" title="Quote da saldare">€${a.totalToPay} sospesi</span>`:'<span class="text-xs text-green-600 dark:text-green-400 font-medium" title="Tutte le quote saldate">In regola</span>';return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
        <td class="p-3 font-semibold text-gray-800 dark:text-gray-100">
          <div class="flex items-center gap-2">
            <span>${a.nomeCompleto}</span>
          </div>
        </td>
        <td class="p-3">${o}</td>
        <td class="p-3 text-center text-gray-700 dark:text-gray-300">${a.totalActivities}</td>
        <td class="p-3 text-center font-bold text-green-700 dark:text-green-400">${a.presenti}</td>
        <td class="p-3 text-center font-bold text-red-600 dark:text-red-400">${a.assenti}</td>
        <td class="p-3 text-center text-gray-500 dark:text-gray-400">${a.nr}</td>
        <td class="p-3">
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs min-w-[36px]">${a.perc}%</span>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div class="${l} h-2 rounded-full" style="width: ${a.perc}%"></div>
            </div>
          </div>
        </td>
        <td class="p-3 text-center">${e}</td>
        <td class="p-3 text-center">${p}</td>
        <td class="p-3 text-center">
          <button type="button" class="view-scout-detail-btn px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold cursor-pointer shadow-sm transition-all"
            data-scout-id="${i.id}">
            🔍 Dettagli
          </button>
        </td>
      </tr>
    `}).join(""),d.querySelectorAll(".view-scout-detail-btn").forEach(a=>{a.onclick=()=>{const i=a.getAttribute("data-scout-id"),o=s.find(e=>e.scout.id===i);o&&v.openScoutHistoricalModal(o)}})};v.openScoutHistoricalModal=function(s){const m=document.getElementById("scoutDetailModal"),d=document.getElementById("scoutDetailModalTitle"),g=document.getElementById("scoutDetailModalSubtitle"),a=document.getElementById("scoutDetailModalContent");if(!m||!a)return;const i=this._storicoState.selectedYear;if(d&&(d.textContent=`${s.nomeCompleto} · Anno Scout ${i}`),g){const o=s.patrol?`Pattuglia ${s.patrol} · `:"";g.textContent=`${o}${s.presenti} Presente, ${s.assenti} Assente (${s.perc}% presenza)`}a.innerHTML=`
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl text-center">
      <div>
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Attività Totali</p>
        <p class="text-xl font-bold text-gray-800 dark:text-gray-100">${s.totalActivities}</p>
      </div>
      <div>
        <p class="text-xs text-green-600 dark:text-green-400 font-medium">Presenze (P)</p>
        <p class="text-xl font-bold text-green-600 dark:text-green-400">${s.presenti}</p>
      </div>
      <div>
        <p class="text-xs text-red-600 dark:text-red-400 font-medium">Assenze (A)</p>
        <p class="text-xl font-bold text-red-600 dark:text-red-400">${s.assenti}</p>
      </div>
      <div>
        <p class="text-xs text-blue-600 dark:text-blue-400 font-medium">% Presenza</p>
        <p class="text-xl font-bold text-blue-600 dark:text-blue-400">${s.perc}%</p>
      </div>
    </div>

    <h4 class="font-bold text-sm text-gray-800 dark:text-gray-100 pt-2">Registro Attività Svolte</h4>
    <div class="max-h-[350px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
      ${s.scoutPresences.map(o=>{const e=this.toJsDate(o.activity.data),l=isNaN(e)?"":e.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}),p=o.activity.tipo||"Attività",u=o.activity.descrizione||"";let x="";return o.stato==="Presente"?x='<span class="px-2 py-0.5 text-xs font-bold rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">P - Presente</span>':o.stato==="Assente"?x='<span class="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">A - Assente</span>':o.stato==="X"?x='<span class="px-2 py-0.5 text-xs font-bold rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">X - Escluso</span>':x='<span class="px-2 py-0.5 text-xs font-bold rounded bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">NR - Non Reg.</span>',`
          <div class="p-3 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-700/20">
            <div>
              <div class="font-bold text-gray-800 dark:text-gray-100">${p}${u?` - ${u}`:""}</div>
              <div class="text-gray-400 mt-0.5">📅 ${l}</div>
            </div>
            <div>${x}</div>
          </div>
        `}).join("")}
    </div>
  `,m.classList.remove("hidden")};v.renderStoricoPatrolStats=function(s,m){const d=document.getElementById("patrolStatsContainer");if(!d)return;const g={};s.forEach(i=>{const o=i.patrol||"Senza Pattuglia";g[o]||(g[o]={name:o,scoutsCount:0,presenti:0,assenti:0,valid:0}),g[o].scoutsCount++,g[o].presenti+=i.presenti,g[o].assenti+=i.assenti,g[o].valid+=i.totalValid});const a=Object.values(g).sort((i,o)=>{const e=i.valid>0?i.presenti/i.valid:0;return(o.valid>0?o.presenti/o.valid:0)-e});if(a.length===0){d.innerHTML=`<p class="text-gray-500 text-sm">Nessuna pattuglia registrata per quest'anno scout.</p>`;return}d.innerHTML=a.map(i=>{const o=i.valid>0?Math.round(i.presenti/i.valid*100):0,e=o>=75?"bg-green-600":o>=50?"bg-yellow-500":"bg-red-500";return`
      <div class="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 shadow-sm flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-bold text-gray-800 dark:text-gray-100 text-sm truncate" title="${i.name}">⚜️ ${i.name}</h4>
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${i.scoutsCount} esploratori</span>
        </div>
        <div>
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-gray-500 dark:text-gray-400 font-medium">Presenza Media</span>
            <span class="font-bold text-sm text-gray-800 dark:text-gray-100">${o}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden mb-2">
            <div class="${e} h-2 rounded-full" style="width: ${o}%"></div>
          </div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400 flex justify-between">
            <span>P: <strong class="text-green-600 dark:text-green-400">${i.presenti}</strong></span>
            <span>A: <strong class="text-red-600 dark:text-red-400">${i.assenti}</strong></span>
          </div>
        </div>
      </div>
    `}).join("")};v.renderHistoricalGrid=function(s,m,d){const g=document.getElementById("historicalGridDatesHeader"),a=document.getElementById("historicalGridTypesHeader"),i=document.getElementById("historicalGridBody");if(!g||!a||!i)return;g.innerHTML='<th class="p-2 border border-green-700 text-left sticky left-0 bg-green-800 z-10 min-w-[180px]">Esploratore</th>',a.innerHTML='<th class="p-2 border border-green-800 text-left sticky left-0 bg-green-900 z-10 text-[10px]">Pattuglia / Attività</th>',s.forEach(e=>{const l=this.toJsDate(e.data),p=isNaN(l)?"":l.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"});g.insertAdjacentHTML("beforeend",`<th class="p-2 border border-green-700 text-center min-w-[65px] whitespace-nowrap">${p}</th>`),a.insertAdjacentHTML("beforeend",`<th class="p-1 border border-green-800 text-center truncate max-w-[80px]" title="${e.tipo}">${e.tipo||""}</th>`)});const o=[...m].sort((e,l)=>{const p=(e.cognome||"").trim().localeCompare((l.cognome||"").trim(),"it");return p!==0?p:(e.nome||"").localeCompare(l.nome||"","it")});i.innerHTML=o.map(e=>{const l=`${e.nome||""} ${e.cognome||""}`.trim()||e.id,p=e.pv_pattuglia?`<span class="text-[10px] text-gray-500 ml-1">(${e.pv_pattuglia})</span>`:"";let u=`<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
      <td class="p-2 font-medium border border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 whitespace-nowrap">
        ${l}${p}
      </td>`;return s.forEach(x=>{const r=d.find(t=>t.esploratoreId===e.id&&t.attivitaId===x.id),n=r?r.stato:"NR";let f='<span class="text-gray-400 font-light">NR</span>';n==="Presente"?f='<span class="font-bold text-green-700 dark:text-green-400">P</span>':n==="Assente"?f='<span class="font-bold text-red-600 dark:text-red-400">A</span>':n==="X"&&(f='<span class="font-medium text-gray-500">X</span>'),u+=`<td class="p-2 border border-gray-200 dark:border-gray-700 text-center">${f}</td>`}),u+="</tr>",u}).join("")};v.renderMultiYearComparison=function(){const s=document.getElementById("multiYearTableBody");if(!s)return;const m=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",d=this.getAllScoutYears?this.getAllScoutYears(this.state.activities):[m],g=this.state.activities||[],a=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],i=this.state.scouts||[],o=d.map(e=>{const l=g.filter(c=>this.isActivityInScoutYear?this.isActivityInScoutYear(c,e):!0);let p=0,u=0;const x={};l.forEach(c=>{a.filter(b=>b.attivitaId===c.id).forEach(b=>{if(b.stato==="Presente"){p++;const y=i.find(S=>S.id===b.esploratoreId);y&&y.pv_pattuglia&&(x[y.pv_pattuglia]=(x[y.pv_pattuglia]||0)+1)}else b.stato==="Assente"&&u++})});const r=p+u,n=r>0?Math.round(p/r*100):0;let f="Nessuna",t=0;return Object.entries(x).forEach(([c,h])=>{h>t&&(t=h,f=c)}),{year:e,isCurrent:e===m,totalActs:l.length,totalPresenti:p,totalAssenti:u,avgPerc:n,bestPatrol:f}});s.innerHTML=o.map(e=>{const l=e.isCurrent?'<span class="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">In corso</span>':'<span class="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Archivio</span>';return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
        <td class="p-3 font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <span>📅 ${e.year}</span>
          ${l}
        </td>
        <td class="p-3 text-right font-medium text-gray-700 dark:text-gray-300">${e.totalActs}</td>
        <td class="p-3 text-right font-bold text-green-700 dark:text-green-400">${e.totalPresenti}</td>
        <td class="p-3 text-right font-bold text-red-600 dark:text-red-400">${e.totalAssenti}</td>
        <td class="p-3 text-right font-extrabold text-blue-700 dark:text-blue-400">${e.avgPerc}%</td>
        <td class="p-3 font-semibold text-amber-700 dark:text-amber-400">⚜️ ${e.bestPatrol}</td>
        <td class="p-3 text-center">
          <button type="button" class="select-year-btn px-3 py-1 text-xs font-semibold rounded-lg bg-green-50 hover:bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 cursor-pointer shadow-sm"
            data-year="${e.year}">
            Apri Dettaglio
          </button>
        </td>
      </tr>
    `}).join(""),s.querySelectorAll(".select-year-btn").forEach(e=>{e.onclick=()=>{const l=e.getAttribute("data-year");this._storicoState.selectedYear=l;const p=document.getElementById("storicoScoutYearSelect");p&&(p.value=l),this.renderStoricoPresenze()}})};v.exportStoricoCsv=function(){const s=this._storicoState.selectedYear;if(s==="all"){this.showToast("Seleziona un anno scout specifico per esportare il file CSV.",{type:"warning"});return}const m=(this.state.activities||[]).filter(u=>this.isActivityInScoutYear?this.isActivityInScoutYear(u,s):!0).sort((u,x)=>this.toJsDate(u.data)-this.toJsDate(x.data)),d=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],g=this.state.scouts||[],a=["Nome","Cognome","Pattuglia","Presenze","Assenze","NR","% Presenza"];m.forEach(u=>{const x=this.toJsDate(u.data),r=isNaN(x)?"":x.toLocaleDateString("it-IT");a.push(`"${u.tipo||"Attività"} (${r})"`)});const i=[a.join(",")];g.forEach(u=>{let x=0,r=0,n=0;const f=[];m.forEach(b=>{const y=d.find(k=>k.esploratoreId===u.id&&k.attivitaId===b.id),S=y?y.stato:"NR";S==="Presente"?x++:S==="Assente"?r++:n++,f.push(S)});const t=x+r,c=t>0?Math.round(x/t*100):0,h=[`"${u.nome||""}"`,`"${u.cognome||""}"`,`"${u.pv_pattuglia||""}"`,x,r,n,`${c}%`,...f.map(b=>`"${b}"`)];i.push(h.join(","))});const o="\uFEFF"+i.join(`\r
`),e=new Blob([o],{type:"text/csv;charset=utf-8;"}),l=URL.createObjectURL(e),p=document.createElement("a");p.setAttribute("href",l),p.setAttribute("download",`Storico_Presenze_${s.replace("/","-")}.csv`),document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(l),this.showToast(`CSV Anno Scout ${s} esportato con successo`)};v.printStoricoReport=function(){window.print()};
