import"./date-picker-DdNAYcTb.js";import"./shared-Dm_IxfHL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderNextActivityWidget(),this.renderDashboardCharts(),this.renderAttendanceGrid&&this.renderAttendanceGrid()};UI.renderNextActivityWidget=function(){const p=document.getElementById("nextActivityContainer");if(!p)return;const k=this.state.activities||[],$=this.state.scouts||[],m=this.state.presences||[],x=this.findUpcomingActivity?this.findUpcomingActivity(k):null;if(!x||!x.activity){p.innerHTML=`
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-2xl mb-3">
          📅
        </div>
        <h3 class="text-base font-bold text-gray-800 dark:text-gray-100">Nessuna attività programmata</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          Non sono presenti attività future nel calendario del reparto. Aggiungi la prossima riunione o uscita per sbloccare il monitoraggio presenze, quote e conformità medica.
        </p>
        <div class="mt-4">
          <a href="calendario.html" class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800 shadow-sm transition">
            <span>➕</span>
            <span>Pianifica Nuova Attività</span>
          </a>
        </div>
      </div>
    `;return}const{activity:i,isFuture:u,isPast:P,isToday:f,isTomorrow:d,diffDays:a,countdownText:r,badgeText:n,badgeClass:c}=x,e=this.computeActivityDashboardKPIs?this.computeActivityDashboardKPIs(i,$,m):null;if(!e)return;const y={Riunione:"⏰","Attività lunga":"🌲",Uscita:"🥾",Campo:"🏕️","Evento Adulti":"⚜️","Riunione Adulti":"📋","Eventi con esterni":"🌟"}[i.tipo]||"📅",h=l=>l&&l.toDate?l.toDate():new Date(l),S=h(i.data),I=isNaN(S.getTime())?"Data non definita":S.toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),v=I.charAt(0).toUpperCase()+I.slice(1),t=Number(i.costo)||0,s=t>0?`<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300">Quota: € ${t.toFixed(2)}</span>`:'<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Gratuita</span>',o=e.attendancePercentage,L=o>=70?"bg-emerald-600":o>=40?"bg-amber-500":"bg-gray-400",A=e.paymentPercentage,w=A>=80?"bg-emerald-600":A>=50?"bg-amber-500":"bg-rose-500";let b="";if(!e.isSafetyCompliant&&e.medicalAlerts.length>0){const l=e.medicalAlerts;b=`
      <div class="mt-5 p-4 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm animate-fade-in">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">⚠️</span>
            <div>
              <h4 class="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                Allarme Sicurezza Sanitaria (${l.length} partecipant${l.length===1?"e":"i"} non in regola)
              </h4>
              <p class="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Alcuni esploratori confermati presenti non hanno il certificato medico valido o i consensi necessari per questa data.
              </p>
            </div>
          </div>
          <button type="button" id="toggleMedicalAlertListBtn" class="text-xs font-semibold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer flex-shrink-0">
            Mostra dettagli ▼
          </button>
        </div>

        <div id="medicalAlertListDetails" class="mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/60 divide-y divide-rose-100 dark:divide-rose-900/40">
          ${l.map(N=>{const D=N.scout,z=`${D.nome||""} ${D.cognome||""}`.trim()||"Esploratore",T=D.pv_pattuglia?`(${D.pv_pattuglia})`:"",E=N.missingDocuments.join(", ");return`
              <div class="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span class="font-bold text-gray-800 dark:text-gray-100">${z}</span>
                  <span class="text-gray-500 dark:text-gray-400 ml-1">${T}</span>
                  <div class="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                    <span class="font-medium">${N.label}</span>: ${E}
                  </div>
                </div>
                <button type="button" onclick="UI.sendMedicalWhatsAppReminder('${D.id}')"
                  class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-xs transition cursor-pointer">
                  <span>💬</span>
                  <span>WhatsApp Genitore</span>
                </button>
              </div>
            `}).join("")}
        </div>
      </div>
    `}else e.presentCount>0?b=`
      <div class="mt-5 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium shadow-xs">
        <div class="flex items-center gap-2">
          <span class="text-base">🛡️</span>
          <span><strong>Sicurezza Sanitaria OK:</strong> Tutti i ${e.presentCount} esploratori presenti hanno certificato medico e documenti in regola.</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">CONFORME</span>
      </div>
    `:b=`
      <div class="mt-5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span class="text-base">📋</span>
        <span>Nessun esploratore ancora segnato come presente. Registra le presenze per verificare la conformità medica.</span>
      </div>
    `;p.innerHTML=`
    <div class="bg-white dark:bg-gray-800 border-2 border-green-600/30 dark:border-green-500/30 rounded-2xl p-5 sm:p-6 shadow-md transition relative overflow-hidden">
      <!-- Header Widget -->
      <div class="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 flex items-center gap-1">
              <span>${y}</span>
              <span>${i.tipo}</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${c}">
              ${n}
            </span>
            ${s}
          </div>
          <h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white pt-1">
            ${i.descrizione||i.tipo}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
            <span>📅</span>
            <span>${v}</span>
            ${i.dataFine?`<span class="text-gray-400">• Fine: ${h(i.dataFine).toLocaleDateString("it-IT")}</span>`:""}
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
              ${e.presentCount} / ${e.totalActiveScouts} (${o}%)
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
            <div class="${L} h-2.5 rounded-full transition-all duration-500" style="width: ${o}%"></div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
              ✓ ${e.presentCount} Presenti
            </span>
            <span class="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
              ✗ ${e.absentCount} Assenti
            </span>
            <span class="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              ⏳ ${e.unrecordedCount} Da registrare
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
            ${e.isPaidActivity?`
              <span class="text-xs font-extrabold text-gray-800 dark:text-gray-100">
                € ${e.totalCollected.toFixed(2)} / € ${e.totalExpected.toFixed(2)} (${A}%)
              </span>
            `:`
              <span class="text-xs font-semibold text-gray-500">Gratuita</span>
            `}
          </div>

          ${e.isPaidActivity?`
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-3">
              <div class="${w} h-2.5 rounded-full transition-all duration-500" style="width: ${A}%"></div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  ✓ ${e.paidCount} Saldati
                </span>
                <span class="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                  ⏳ ${e.unpaidCount} In sospeso
                </span>
              </div>
              ${e.totalPending>0?`
                <a href="pagamenti.html" class="text-green-700 dark:text-green-400 hover:underline text-[11px] font-bold">
                  Sollecita € ${e.totalPending.toFixed(2)} →
                </a>
              `:`
                <span class="text-emerald-700 dark:text-emerald-400 text-[11px]">Tutto saldato! 🎉</span>
              `}
            </div>
          `:`
            <div class="py-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Nessuna quota richiesta per questa attività di reparto.
            </div>
          `}
        </div>
      </div>

      <!-- Sezione Alert Sanitario -->
      ${b}
    </div>
  `;const C=document.getElementById("toggleMedicalAlertListBtn"),_=document.getElementById("medicalAlertListDetails");if(C&&_){let l=!0;C.addEventListener("click",()=>{l=!l,_.style.display=l?"block":"none",C.textContent=l?"Nascondi ▲":"Mostra dettagli ▼"})}};UI._charts=UI._charts||{scout:null,activity:null};UI._destroyCharts=function(){try{this._charts.scout&&(this._charts.scout.destroy(),this._charts.scout=null)}catch{}try{this._charts.activity&&(this._charts.activity.destroy(),this._charts.activity=null)}catch{}};UI.renderDashboardCharts=function(){const p=this.state.scouts||[],k=this.state.activities||[],$=this.state.presences||[],m=document.getElementById("scoutPresenceChart"),x=document.getElementById("activityPresenceChart");if(!m||!x)return;this._destroyCharts();const i=$,u=t=>t&&t.toDate?t.toDate():new Date(t),P=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",f=[...k].filter(t=>this.isActivityInScoutYear?this.isActivityInScoutYear(t,P):!0).sort((t,s)=>u(t.data)-u(s.data)),d=new Date;d.setHours(0,0,0,0);let a=null;f.forEach(t=>{const s=t.data&&t.data.toDate?t.data.toDate():new Date(t.data),o=new Date(s);o.setHours(0,0,0,0),a===null&&o>=d&&(a=t.id)});const r=f.filter(t=>{const s=t.data&&t.data.toDate?t.data.toDate():new Date(t.data),o=new Date(s);return o.setHours(0,0,0,0),o<d}).map(t=>t.id),n=a?[...r,a]:r,c=p.map(t=>{const s=n.filter(w=>{const b=i.find(C=>C.esploratoreId===t.id&&C.attivitaId===w);return b&&(b.stato==="Presente"||b.stato==="Assente")}),o=s.length,L=i.filter(w=>w.esploratoreId===t.id&&w.stato==="Presente"&&s.includes(w.attivitaId)).length,A=o?Math.round(L/o*100):0;return{name:`${t.nome} ${t.cognome}`,perc:A,presentCount:L,totalActsConsidered:o}});c.sort((t,s)=>s.perc-t.perc);const e=c.map(t=>t.name),g=c.map(t=>t.perc),y=g.map(t=>t>=75?"#16a34a":t>=60?"#eab308":"#dc2626"),h=f.map(t=>{const s=u(t.data),o=isNaN(s)?"":s.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"2-digit"});return`${t.tipo}: ${t.descrizione||""}
${o}`}),S=f.map(t=>i.filter(s=>s.attivitaId===t.id&&s.stato==="Presente").length),I=window.ChartDataLabels;window.Chart&&I&&window.Chart.register(I);const v={responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:8,right:12,bottom:8,left:12}},plugins:{legend:{display:!1},datalabels:{color:"#fff",formatter:t=>t>0?typeof t=="number"&&t<=100?t.toFixed(1)+"%":t:"",anchor:"end",align:"end",offset:-5,font:{weight:"bold"}}},elements:{bar:{borderRadius:4,maxBarThickness:28}}};this._charts.scout=new window.Chart(m.getContext("2d"),{type:"bar",data:{labels:e,datasets:[{label:"Presenze",data:g,backgroundColor:y}]},options:{...v,indexAxis:"y",scales:{x:{beginAtZero:!0,max:100,ticks:{callback:t=>t+"%"}},y:{ticks:{autoSkip:!1,maxTicksLimit:20}}},plugins:{...v.plugins,tooltip:{callbacks:{label:function(t){const s=c[t.dataIndex];return` ${s.presentCount} / ${s.totalActsConsidered}`}}}}}}),this._charts.activity=new window.Chart(x.getContext("2d"),{type:"bar",data:{labels:h,datasets:[{label:"Presenze",data:S,backgroundColor:"#16a34a"}]},options:{...v,indexAxis:"y",scales:{x:{beginAtZero:!0,max:Math.max(1,p.length)},y:{ticks:{autoSkip:!1,maxTicksLimit:20}}},plugins:{...v.plugins,datalabels:{...v.plugins.datalabels,formatter:t=>t>0?`${t} / ${p.length}`:""}}}})};UI.renderAttendanceGrid=function(){const p=document.getElementById("attendanceGrid");if(!p)return;const k=this.state.scouts||[],$=this.state.activities||[],m=this.state.presences||[];if(k.length===0||$.length===0){p.innerHTML='<p class="text-gray-500 italic">Dati non sufficienti per mostrare la griglia.</p>';return}const x=a=>a&&a.toDate?a.toDate():new Date(a),i=new Date;i.setHours(0,0,0,0);const u=[...$].filter(a=>{const r=new Date(x(a.data));return r.setHours(0,0,0,0),r<=i}).sort((a,r)=>x(a.data)-x(r.data));if(u.length===0){p.innerHTML='<p class="text-gray-500 italic">Nessuna attività passata registrata.</p>';return}const P=u.map(a=>a.id),f=[...k].map(a=>{const r=P.filter(g=>{const y=m.find(h=>h.esploratoreId===a.id&&h.attivitaId===g);return y&&(y.stato==="Presente"||y.stato==="Assente")}),n=r.length,c=m.filter(g=>g.esploratoreId===a.id&&g.stato==="Presente"&&r.includes(g.attivitaId)).length,e=n?Math.round(c/n*100):0;return{...a,perc:e}}).sort((a,r)=>r.perc-a.perc);let d='<div class="overflow-x-auto"><table class="w-full text-xs text-left border-collapse min-w-max">';d+='<thead><tr class="bg-gray-100">',d+='<th class="p-1 px-2 border font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10 w-36 shadow-[1px_0_0_0_#e5e7eb]">Esploratore</th>',u.forEach(a=>{const r=x(a.data),n=isNaN(r)?"":r.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"});d+=`<th class="p-1 border text-center text-[10px] font-normal text-gray-600 truncate max-w-[60px]" title="${a.tipo}: ${a.descrizione||""}">${n}</th>`}),d+="</tr></thead><tbody>",f.forEach(a=>{d+=`<tr><td class="p-1 px-2 border whitespace-nowrap sticky left-0 bg-white z-10 font-medium text-gray-800 shadow-[1px_0_0_0_#e5e7eb]">${a.nome} ${a.cognome}</td>`,u.forEach(r=>{const n=m.find(g=>g.esploratoreId===a.id&&g.attivitaId===r.id);let c="bg-white",e="Dato mancante o non inserito";n&&(n.stato==="Presente"?(c="bg-green-500",e="Presente"):n.stato==="Assente"?(c="bg-red-500",e="Assente"):n.stato.toLowerCase()==="x"||n.stato==="NR"||n.stato.toLowerCase()==="giustificato"?(c="bg-gray-400",e="Non tenuto a esserci / Giustificato / NR"):(c="bg-gray-400",n.stato.charAt(0).toUpperCase(),e=n.stato)),d+=`<td class="p-1 border text-center">
                 <div class="w-3.5 h-3.5 mx-auto rounded-sm ${c}" title="${e}"></div>
               </td>`}),d+="</tr>"}),d+="</tbody></table></div>",d+=`
    <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-600">
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-green-500"></div> Presente</div>
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-red-500"></div> Assente</div>
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-gray-400"></div> Non tenuto (X)</div>
      <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-sm bg-white border border-gray-300"></div> Dato mancante</div>
    </div>
  `,p.innerHTML=d};
