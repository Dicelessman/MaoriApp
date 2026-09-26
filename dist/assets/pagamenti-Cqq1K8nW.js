import{U as m,D as P,c as A,d as E,i as U}from"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";window.UI=m;window.DATA=P;m.renderCurrentPage=function(){this.renderPaymentsPerActivity()};m.setupPaymentsScoutYearFilter=function(){const s=this.qs("#paymentScoutYearFilter"),d=this.qs("#currentYearBadge"),o=(typeof this.getCurrentScoutYear=="function"?this.getCurrentScoutYear():A())||"2025/2026";if(d&&(d.textContent=o),this.paymentScoutYearFilter||(this.paymentScoutYearFilter=o),s){const c=this.state?.activities||[],n=(this.getAllScoutYears||E)(c);s.innerHTML="",n.forEach(i=>{const l=document.createElement("option");l.value=i,l.textContent=i===o?`${i} (In corso)`:i,i===this.paymentScoutYearFilter&&(l.selected=!0),s.appendChild(l)});const r=document.createElement("option");r.value="all",r.textContent="Tutti gli anni",this.paymentScoutYearFilter==="all"&&(r.selected=!0),s.appendChild(r),s._bound||(s._bound=!0,s.addEventListener("change",i=>{this.paymentScoutYearFilter=i.target.value,this.renderPaymentsPerActivity()}))}};m.renderPaymentsPerActivity=function(){const s=this.qs("#paymentsList");if(!s)return;this.setupPaymentsScoutYearFilter();const d=(typeof this.getCurrentScoutYear=="function"?this.getCurrentScoutYear():A())||"2025/2026",o=this.paymentScoutYearFilter||d,c=(this.state?.scouts||[]).filter(t=>!t.archived),p=(this.state?.activities||[]).slice();let n=typeof this.getDedupedPresences=="function"?this.getDedupedPresences():[];(!n||n.length===0)&&(n=this.state?.presences||[]);const r=t=>t&&t.toDate?t.toDate():t instanceof Date?t:new Date(t),i=t=>o==="all"?!0:(this.isActivityInScoutYear||U)(t,o),l=p.filter(i).filter(t=>parseFloat(t.costo||"0")>0);l.sort((t,g)=>r(g.data)-r(t.data));const x=this.qs("#paymentSummaryKpis");if(l.length===0){x&&(x.innerHTML="");const t=o==="all"?"qualsiasi anno":`l'anno scout ${o}`;s.innerHTML=`
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
        <div class="text-4xl mb-3">💳</div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Nessuna attività con quota</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Non ci sono attività con quota di partecipazione registrate per ${t}.
        </p>
      </div>
    `;return}const $=!!(this.currentUser&&this.selectedStaffId)?"":"disabled";let C=0,S=0,h=0;const I=l.map(t=>{const g=parseFloat(t.costo||"0")||0,f=c.map(a=>{const e=n.find(F=>F.esploratoreId===a.id&&F.attivitaId===t.id),u=e?.stato||"NR",y=u==="Presente";return{scout:a,paid:!!e?.pagato,method:e?.tipoPagamento||null,stato:u,eligibleForPayment:y,presence:e}}).filter(a=>a.eligibleForPayment),v=f.filter(a=>a.paid).sort((a,e)=>{const u=(a.scout.nome||"").trim().toLowerCase(),y=(e.scout.nome||"").trim().toLowerCase();return u.localeCompare(y,"it")}),k=f.filter(a=>!a.paid).sort((a,e)=>{const u=(a.scout.nome||"").trim().toLowerCase(),y=(e.scout.nome||"").trim().toLowerCase();return u.localeCompare(y,"it")}),b=g*f.length,w=v.length*g,D=k.length*g;C+=b,S+=w,h+=D;const Y=r(t.data),T=isNaN(Y)?"":Y.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}),L=v.map(a=>{const e=a.presence||{pagato:!1,tipoPagamento:null};return`
        <li class="flex justify-between items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${a.scout.nome} ${a.scout.cognome}</span>
          <select class="payment-select text-xs font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-green-500 shadow-sm" ${$}
            onchange="UI.updatePaymentCombined({value:this.value, scoutId:'${a.scout.id}', activityId:'${t.id}'})">
            <option value="" ${e.pagato?"":"selected"}>Non Pagato</option>
            <option value="Contanti" ${e.pagato&&e.tipoPagamento==="Contanti"?"selected":""}>Contanti</option>
            <option value="Satispay" ${e.pagato&&e.tipoPagamento==="Satispay"?"selected":""}>Satispay</option>
            <option value="Bonifico" ${e.pagato&&e.tipoPagamento==="Bonifico"?"selected":""}>Bonifico</option>
          </select>
        </li>`}).join(""),N=k.map(a=>{const e=a.presence||{pagato:!1,tipoPagamento:null};return`
        <li class="flex justify-between items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${a.scout.nome} ${a.scout.cognome}</span>
          <select class="payment-select text-xs font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-green-500 shadow-sm" ${$}
            onchange="UI.updatePaymentCombined({value:this.value, scoutId:'${a.scout.id}', activityId:'${t.id}'})">
            <option value="" ${e.pagato?"":"selected"}>Non Pagato</option>
            <option value="Contanti" ${e.pagato&&e.tipoPagamento==="Contanti"?"selected":""}>Contanti</option>
            <option value="Satispay" ${e.pagato&&e.tipoPagamento==="Satispay"?"selected":""}>Satispay</option>
            <option value="Bonifico" ${e.pagato&&e.tipoPagamento==="Bonifico"?"selected":""}>Bonifico</option>
          </select>
        </li>`}).join(""),B=b>0?Math.round(w/b*100):0;return`
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition hover:shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">${t.tipo}${t.descrizione?" — "+t.descrizione:""}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                ${B}% incassato
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${T} • Quota: € ${g.toFixed(2)}/persona</p>
          </div>
          <div class="flex items-center gap-4 text-right">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Incasso atteso</p>
              <p class="text-base font-bold text-gray-700 dark:text-gray-300">€ ${b.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Totale incassato</p>
              <p class="text-base font-bold text-emerald-600 dark:text-emerald-400">€ ${w.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mt-4">
          <div class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3.5 border border-gray-100 dark:border-gray-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center justify-between">
              <span>Hanno pagato</span>
              <span class="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[11px]">${v.length}</span>
            </h4>
            <ul class="space-y-0.5">
              ${L||'<li class="text-xs text-gray-400 py-1">Nessun pagamento registrato</li>'}
            </ul>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3.5 border border-gray-100 dark:border-gray-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2 flex items-center justify-between">
              <span>Da saldare</span>
              <span class="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full text-[11px]">${k.length}</span>
            </h4>
            <ul class="space-y-0.5">
              ${N||'<li class="text-xs text-emerald-600 dark:text-emerald-400 py-1">Tutti i presenti sono in regola! 🎉</li>'}
            </ul>
          </div>
        </div>
      </div>
    `}).join("");x&&(x.innerHTML=`
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Attività con Quota</span>
        <div class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">${l.length}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Incasso Atteso</span>
        <div class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">€ ${C.toFixed(2)}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Totale Incassato</span>
        <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">€ ${S.toFixed(2)}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Da Riscuotere</span>
        <div class="text-xl font-bold ${h>0?"text-rose-600 dark:text-rose-400":"text-gray-400"} mt-1">€ ${h.toFixed(2)}</div>
      </div>
    `),s.innerHTML=I};typeof m.updatePaymentCombined!="function"&&(m.updatePaymentCombined=async function({value:s,scoutId:d,activityId:o}){if(!this.currentUser){this.showToast("Devi essere autenticato per modificare i pagamenti.",{type:"error"});return}const c=!!s,p=s||null;try{await P.updatePresence({field:"pagato",value:c,scoutId:d,activityId:o},this.currentUser),c&&await P.updatePresence({field:"tipoPagamento",value:p,scoutId:d,activityId:o},this.currentUser);const n=`${d}_${o}`;if(this.presenceIndex){let r=this.presenceIndex.get(n);r&&(r.pagato=c,r.tipoPagamento=p,this.presenceIndex.set(n,r))}if(this.state&&Array.isArray(this.state.presences)){const r=this.state.presences.find(i=>i.esploratoreId===d&&i.attivitaId===o);r&&(r.pagato=c,r.tipoPagamento=p)}this.showToast(c?`Pagamento registrato (${p})`:"Pagamento rimosso",{type:"success",duration:2e3}),this.renderPaymentsPerActivity()}catch(n){console.error("Errore updatePaymentCombined:",n),this.showToast("Errore salvataggio pagamento: "+(n.message||""),{type:"error"})}});
