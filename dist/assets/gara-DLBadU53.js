import"./date-picker-DdNAYcTb.js";import"./shared-Dm_IxfHL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";const x=new Proxy({},{get(t,i){const s=typeof window<"u"&&window.DATA||typeof globalThis<"u"&&globalThis.DATA;if(s&&typeof s[i]=="function")return s[i].bind(s);if(s&&i in s)return s[i]}}),c=typeof window<"u"&&window.UI?window.UI:typeof globalThis<"u"&&globalThis.UI?globalThis.UI:{};typeof window<"u"&&(window.UI=c);typeof globalThis<"u"&&(globalThis.UI=c);const p=t=>{if(t==null)return"";const i=String(t),s=typeof document<"u"?document.createElement("div"):null;return s?(s.textContent=i,s.innerHTML):i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")};c.garaState={selectedYear:null,categories:[],punti:[],patrols:[],activities:[],filterPattuglia:"all",filterSquadriglia:"all",filterCategoria:"all",searchQuery:""};c.initGaraPage=async function(){try{typeof this.showLoadingOverlay=="function"&&this.showLoadingOverlay("Caricamento Gara di Reparto...");const t=typeof this.getCurrentScoutYear=="function"?this.getCurrentScoutYear():"2025/2026";this.garaState.selectedYear||(this.garaState.selectedYear=t),(!this.state||!this.state.activities||this.state.activities.length===0)&&(this.state=await x.loadAll());let i=await x.getPatrols();(!i||i.length===0)&&(i=["Aironi","Marmotte"]),this.garaState.patrols=i,this.garaState.activities=this.state.activities||[],this.initGaraScoutYearSelector(),await this.loadGaraDataForYear(this.garaState.selectedYear),this.setupGaraEventListeners(),this.renderGaraDashboard(),typeof this.hideLoadingOverlay=="function"&&this.hideLoadingOverlay()}catch(t){console.error("Errore inizializzazione Gara di Reparto:",t),typeof this.hideLoadingOverlay=="function"&&this.hideLoadingOverlay(),typeof this.showToast=="function"&&this.showToast("Errore durante il caricamento dei dati di gara: "+t.message,{type:"error"})}};c.loadGaraDataForYear=async function(t){this.garaState.selectedYear=t;const[i,s]=await Promise.all([x.getGaraCategories(t),x.getGaraPunti(t)]);this.garaState.categories=i||[],this.garaState.punti=s||[]};c.initGaraScoutYearSelector=function(){const t=this.qs?this.qs("#scoutYearSelect"):document.querySelector("#scoutYearSelect");if(!t)return;let i=typeof this.getAllScoutYears=="function"?this.getAllScoutYears(this.garaState.activities):["2025/2026","2024/2025"];i.includes(this.garaState.selectedYear)||i.unshift(this.garaState.selectedYear),t.innerHTML=i.map(s=>`
        <option value="${s}" ${s===this.garaState.selectedYear?"selected":""}>
            ${s}
        </option>
    `).join("")};c.calculateGaraLeaderboard=function(){const t=this.garaState.patrols||[],i=this.garaState.punti||[],s=this.garaState.categories||[],e={};return t.forEach(o=>{e[o]={pattuglia:o,squadriglia:o,totalePunti:0,assegnazioniCount:0,puntiPerCategoria:{},ultimoPunteggioData:null},s.forEach(a=>{e[o].puntiPerCategoria[a.id]=0})}),i.forEach(o=>{const a=o.pattuglia||o.squadriglia;if(!a)return;e[a]||(e[a]={pattuglia:a,squadriglia:a,totalePunti:0,assegnazioniCount:0,puntiPerCategoria:{},ultimoPunteggioData:null});const l=Number(o.punti)||0;e[a].totalePunti+=l,e[a].assegnazioniCount+=1,o.categoriaId&&(e[a].puntiPerCategoria[o.categoriaId]=(e[a].puntiPerCategoria[o.categoriaId]||0)+l),o.data&&(!e[a].ultimoPunteggioData||o.data>e[a].ultimoPunteggioData)&&(e[a].ultimoPunteggioData=o.data)}),Object.values(e).sort((o,a)=>{if(a.totalePunti!==o.totalePunti)return a.totalePunti-o.totalePunti;const l=o.pattuglia||o.squadriglia||"",r=a.pattuglia||a.squadriglia||"";return l.localeCompare(r,"it")})};c.renderGaraDashboard=function(){const t=this.calculateGaraLeaderboard(),i=this.garaState.punti||[],s=this.garaState.categories||[];this.renderGaraMetrics(t,i,s),this.renderGaraPodium(t),this.renderGaraRankingList(t,s),this.renderGaraHistoryTable(),this.updateGaraDropdowns()};c.renderGaraMetrics=function(t,i,s){const e=t[0],n=this.qs("#statLeaderPatrol"),o=this.qs("#statLeaderPoints");n&&o&&(e&&e.totalePunti>0?(n.textContent=`Ptg. ${e.pattuglia||e.squadriglia}`,o.textContent=`${e.totalePunti} punti conquistati`):(n.textContent="Parità / In attesa",o.textContent="0 punti"));const a=this.qs("#statTotalPoints"),l=this.qs("#statTotalAssignments");if(a&&l){const d=i.reduce((u,m)=>u+(Number(m.punti)||0),0);a.textContent=d,l.textContent=`${i.length} assegnazioni totali`}const r=this.qs("#statPatrolCount");r&&(r.textContent=(this.garaState.patrols||[]).length);const g=this.qs("#statTopCategory"),h=this.qs("#statTopCategoryPoints");if(g&&h){const d={};i.forEach(f=>{f.categoriaId&&(d[f.categoriaId]=(d[f.categoriaId]||0)+(Number(f.punti)||0))});let u=null,m=-1/0;if(Object.entries(d).forEach(([f,v])=>{v>m&&(m=v,u=f)}),u){const f=s.find(y=>y.id===u),v=f?.icona||"⭐",b=f?.nome||"Attività";g.textContent=`${v} ${b}`,h.textContent=`${m} punti accumulati`}else g.textContent="-",h.textContent="0 punti"}};c.renderGaraPodium=function(t){const i=this.qs("#podiumContainer");if(!i)return;if(!t||t.length===0){i.innerHTML=`
            <div class="col-span-3 text-center py-6 text-gray-500 text-sm">
                Nessuna pattuglia registrata nella gara di reparto.
            </div>
        `;return}const s=t[0],e=t.length>1?t[1]:null,n=t.length>2?t[2]:null,o=[{pos:2,medal:"🥈",label:"2° Posto",titleColor:"text-slate-700 dark:text-slate-200",bgColor:"bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-750 border-slate-300 dark:border-slate-600",badgeBg:"bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",data:e,orderClass:"order-2 md:order-1"},{pos:1,medal:"🥇",label:"1° Posto - Campioni",titleColor:"text-amber-800 dark:text-amber-200",bgColor:"bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 dark:from-amber-900/60 dark:via-amber-800/40 dark:to-amber-950 border-amber-300 dark:border-amber-600 shadow-md",badgeBg:"bg-amber-300 text-amber-900 font-extrabold dark:bg-amber-700 dark:text-amber-100",data:s,orderClass:"order-1 md:order-2 md:-translate-y-2"},{pos:3,medal:"🥉",label:"3° Posto",titleColor:"text-amber-900 dark:text-amber-400",bgColor:"bg-gradient-to-t from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-orange-900/20 border-orange-200 dark:border-orange-800",badgeBg:"bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-200",data:n,orderClass:"order-3 md:order-3"}];i.innerHTML=o.map(a=>{if(!a.data)return`
                <div class="${a.orderClass} rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-4 text-center text-gray-400 text-xs">
                    <span class="text-xl">${a.medal}</span>
                    <div class="mt-1">${a.label}</div>
                    <div class="text-[11px] text-gray-400 mt-2">Nessuna Ptg.</div>
                </div>
            `;const l=a.data,r=l.pattuglia||l.squadriglia;return`
            <div class="${a.orderClass} ${a.bgColor} rounded-2xl p-4 sm:p-5 border transition-transform hover:scale-[1.01] flex flex-col items-center text-center">
                <span class="text-3xl sm:text-4xl drop-shadow-sm mb-1">${a.medal}</span>
                <span class="text-[11px] font-bold uppercase tracking-wider ${a.badgeBg} px-2.5 py-0.5 rounded-full mb-2">
                    ${a.label}
                </span>
                <h4 class="text-xl sm:text-2xl font-black ${a.titleColor} tracking-tight">
                    Ptg. ${p(r)}
                </h4>
                <div class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
                    ${l.totalePunti} <span class="text-xs font-semibold text-gray-500 uppercase">punti</span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span>${l.assegnazioniCount} eventi</span>
                    <span>•</span>
                    <button type="button" onclick="UI.quickAddPointsToPatrol('${p(r)}')" class="text-green-700 dark:text-green-400 hover:underline font-semibold cursor-pointer">
                        + Punti
                    </button>
                </div>
            </div>
        `}).join("")};c.renderGaraRankingList=function(t,i){const s=this.qs("#patrolRankingList");if(!s)return;if(!t||t.length===0){s.innerHTML='<div class="p-6 text-center text-gray-400 text-sm">Nessun dato di classifica presente.</div>';return}const e=Math.max(1,t[0].totalePunti);s.innerHTML=t.map((n,o)=>{const a=o+1,l=Math.max(5,Math.round(n.totalePunti/e*100)),r=o===0?"Leader":`-${t[0].totalePunti-n.totalePunti} pt`,g=i.map(d=>{const u=n.puntiPerCategoria[d.id]||0;return u===0?"":`
                <span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 font-medium" title="${p(d.nome)}: ${u} pt">
                    <span>${p(d.icona||"⭐")}</span>
                    <span>${u}</span>
                </span>
            `}).filter(Boolean).join(""),h=n.pattuglia||n.squadriglia;return`
            <div class="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <span class="flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${a===1?"bg-amber-400 text-amber-950 ring-2 ring-amber-300":a===2?"bg-slate-300 text-slate-900":a===3?"bg-orange-300 text-orange-950":"bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}">
                            ${a}°
                        </span>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-base text-gray-900 dark:text-gray-100">Pattuglia ${p(h)}</span>
                                <span class="text-xs px-2 py-0.5 rounded-full font-medium ${o===0?"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300":"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}">
                                    ${r}
                                </span>
                            </div>
                            <div class="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                <span>${n.assegnazioniCount} volte a punteggio</span>
                                ${n.ultimoPunteggioData?`<span>• Ultimo: ${n.ultimoPunteggioData}</span>`:""}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 justify-between sm:justify-end">
                        <div class="text-right">
                            <span class="text-2xl font-black text-gray-900 dark:text-white">${n.totalePunti}</span>
                            <span class="text-xs text-gray-500 font-semibold block -mt-1">Punti</span>
                        </div>
                        <button type="button" onclick="UI.quickAddPointsToPatrol('${h}')" class="btn-secondary text-xs px-2.5 py-1.5 font-semibold text-green-700 dark:text-green-400 hover:bg-green-50">
                            + Punti
                        </button>
                    </div>
                </div>

                <!-- Barra di progressione visuale -->
                <div class="w-full bg-gray-100 dark:bg-gray-700/50 rounded-full h-2.5 mt-3 overflow-hidden">
                    <div class="h-2.5 rounded-full ${a===1?"bg-amber-400":a===2?"bg-slate-400":a===3?"bg-orange-400":"bg-green-600"} transition-all duration-500" style="width: ${l}%"></div>
                </div>

                <!-- Breakdown Categorie -->
                ${g?`
                    <div class="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span class="text-[11px] font-semibold text-gray-400 mr-1">Categorie:</span>
                        ${g}
                    </div>
                `:""}
            </div>
        `}).join("")};c.renderGaraHistoryTable=function(){const t=this.qs("#puntiHistoryTableBody");if(!t)return;let i=(this.garaState.punti||[]).slice();const s=this.garaState.filterPattuglia||this.garaState.filterSquadriglia;if(s&&s!=="all"&&(i=i.filter(e=>(e.pattuglia||e.squadriglia)===s)),this.garaState.filterCategoria&&this.garaState.filterCategoria!=="all"&&(i=i.filter(e=>e.categoriaId===this.garaState.filterCategoria)),this.garaState.searchQuery&&this.garaState.searchQuery.trim()!==""){const e=this.garaState.searchQuery.toLowerCase().trim();i=i.filter(n=>n.attivitaNome&&n.attivitaNome.toLowerCase().includes(e)||n.motivazione&&n.motivazione.toLowerCase().includes(e)||(n.pattuglia||n.squadriglia)&&(n.pattuglia||n.squadriglia).toLowerCase().includes(e)||n.categoriaNome&&n.categoriaNome.toLowerCase().includes(e))}if(i.sort((e,n)=>{const o=e.data||"";return(n.data||"").localeCompare(o)}),i.length===0){t.innerHTML=`
            <tr>
                <td colspan="8" class="py-8 text-center text-gray-400 text-sm">
                    Nessuna assegnazione punti corrisponde ai filtri selezionati.
                </td>
            </tr>
        `;return}t.innerHTML=i.map(e=>{const n=(Number(e.punti)||0)>=0,o=n?`+${e.punti}`:`${e.punti}`,a=n?"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold":"bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-extrabold",l=this.garaState.categories.find(h=>h.id===e.categoriaId),r=l?.icona||"⭐",g=e.pattuglia||e.squadriglia;return`
            <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-750/40 transition-colors">
                <td class="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    ${p(e.data||"-")}
                </td>
                <td class="py-3 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    Ptg. ${p(g)}
                </td>
                <td class="py-3 px-4 text-gray-700 dark:text-gray-300 text-xs">
                    ${p(e.attivitaNome||"Riunione")}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-800 dark:text-gray-200">
                        <span>${p(r)}</span>
                        <span>${p(e.categoriaNome||l?.nome||"Attività")}</span>
                    </span>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs ${a}">
                        ${o}
                    </span>
                </td>
                <td class="py-3 px-4 text-xs text-gray-600 dark:text-gray-300 max-w-xs break-words">
                    ${p(e.motivazione||"-")}
                </td>
                <td class="py-3 px-4 text-[11px] text-gray-400 whitespace-nowrap">
                    ${p(e.assegnatoDa||"staff")}
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                    <button type="button" onclick="UI.deletePuntiEntry('${p(e.id)}')" class="p-1 text-red-600 hover:text-red-800 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors" title="Elimina assegnazione">
                        🗑️
                    </button>
                </td>
            </tr>
        `}).join("")};c.updateGaraDropdowns=function(){const t=this.garaState.patrols||[],i=this.garaState.categories||[],s=this.garaState.activities||[],e=this.qs("#filterPattugliaSelect")||this.qs("#filterSquadrigliaSelect");if(e){const r=e.value;e.innerHTML='<option value="all">Tutte le Ptg.</option>'+t.map(g=>`<option value="${g}">${g}</option>`).join(""),r&&(r==="all"||t.includes(r))&&(e.value=r)}const n=this.qs("#filterCategoriaSelect");if(n){const r=n.value;n.innerHTML='<option value="all">Tutte le categorie</option>'+i.map(g=>`<option value="${g.id}">${g.icona||"⭐"} ${g.nome}</option>`).join(""),r&&(n.value=r)}const o=this.qs("#assegnaPattugliaSelect")||this.qs("#assegnaSquadrigliaSelect");o&&(o.innerHTML=t.map(r=>`<option value="${r}">${r}</option>`).join(""));const a=this.qs("#assegnaCategoriaSelect");a&&(a.innerHTML=i.map(r=>`
            <option value="${r.id}" data-punti="${r.puntiDefault||10}">
                ${r.icona||"⭐"} ${r.nome} (+${r.puntiDefault||10} pt)
            </option>
        `).join(""));const l=this.qs("#assegnaAttivitaSelect");l&&(l.innerHTML='<option value="">Nessuna / Riunione Ordinaria</option>'+s.map(r=>{const g=r.data?typeof r.data=="string"?r.data.split("T")[0]:r.data.toISOString?r.data.toISOString().split("T")[0]:"":"";return`<option value="${r.id}" data-nome="${r.descrizione||r.tipo||""}">
                    ${r.descrizione||r.tipo||"Attività"} (${g})
                </option>`}).join(""))};c.setupGaraEventListeners=function(){const t=this.qs("#scoutYearSelect");t&&t.addEventListener("change",async d=>{const u=d.target.value;this.showLoadingOverlay?.("Aggiornamento anno scout..."),await this.loadGaraDataForYear(u),this.renderGaraDashboard(),this.hideLoadingOverlay?.()});const i=this.qs("#filterPattugliaSelect")||this.qs("#filterSquadrigliaSelect");i&&i.addEventListener("change",d=>{this.garaState.filterPattuglia=d.target.value,this.garaState.filterSquadriglia=d.target.value,this.renderGaraHistoryTable()});const s=this.qs("#filterCategoriaSelect");s&&s.addEventListener("change",d=>{this.garaState.filterCategoria=d.target.value,this.renderGaraHistoryTable()});const e=this.qs("#filterHistorySearch");e&&e.addEventListener("input",d=>{this.garaState.searchQuery=d.target.value,this.renderGaraHistoryTable()});const n=this.qs("#openAssegnaPuntiBtn");n&&n.addEventListener("click",()=>{this.openAssegnaPuntiModal()}),this.qs("#closeAssegnaPuntiModal")?.addEventListener("click",()=>this.closeAssegnaPuntiModal()),this.qs("#cancelAssegnaPuntiBtn")?.addEventListener("click",()=>this.closeAssegnaPuntiModal()),(this.qsa?this.qsa('input[name="targetSqType"]'):document.querySelectorAll('input[name="targetSqType"]')).forEach(d=>{d.addEventListener("change",u=>{const m=this.qs("#singleSqContainer");m&&(u.target.value==="all"?m.classList.add("hidden"):m.classList.remove("hidden"))})});const a=this.qs("#assegnaCategoriaSelect");a&&a.addEventListener("change",()=>{const d=a.selectedOptions[0],u=d?d.getAttribute("data-punti"):null,m=this.qs("#assegnaPuntiInput");m&&u&&(m.value=u)});const l=this.qs("#assegnaPuntiForm");l&&l.addEventListener("submit",async d=>{d.preventDefault(),await this.submitAssegnaPunti()});const r=this.qs("#openGestioneCategorieBtn");r&&r.addEventListener("click",()=>{this.openGestioneCategorieModal()}),this.qs("#closeGestioneCategorieModal")?.addEventListener("click",()=>this.closeGestioneCategorieModal()),this.qs("#doneGestioneCategorieBtn")?.addEventListener("click",()=>this.closeGestioneCategorieModal());const g=this.qs("#newCategoryForm");g&&g.addEventListener("submit",async d=>{d.preventDefault(),await this.submitNewCategory()});const h=this.qs("#exportGaraBtn");h&&h.addEventListener("click",()=>{this.exportGaraCsv()})};c.openAssegnaPuntiModal=function(t=null){const i=this.qs("#modalAssegnaPunti");if(!i)return;const s=this.qs("#assegnaPuntiForm");s&&s.reset();const e=this.qs("#assegnaDataInput");e&&(e.value=new Date().toISOString().split("T")[0]);const n=this.qs("#assegnaCategoriaSelect");if(n&&n.options.length>0){const a=n.options[0].getAttribute("data-punti")||"10",l=this.qs("#assegnaPuntiInput");l&&(l.value=a)}if(t){const a=this.qs("#assegnaPattugliaSelect")||this.qs("#assegnaSquadrigliaSelect");a&&(a.value=t)}const o=this.qs("#singleSqContainer");o&&o.classList.remove("hidden"),i.classList.remove("hidden")};c.quickAddPointsToPatrol=function(t){this.openAssegnaPuntiModal(t)};c.closeAssegnaPuntiModal=function(){const t=this.qs("#modalAssegnaPunti");t&&t.classList.add("hidden")};c.submitAssegnaPunti=async function(){try{const t=this.qs('input[name="targetSqType"]:checked')?.value||"single",i=this.qs("#assegnaCategoriaSelect"),s=i?.value,e=i?.selectedOptions[0]?.textContent?.trim()||"",n=Number(this.qs("#assegnaPuntiInput")?.value),o=this.qs("#assegnaDataInput")?.value||new Date().toISOString().split("T")[0],a=(this.qs("#assegnaMotivazioneInput")?.value||"").trim(),l=this.qs("#assegnaAttivitaSelect"),r=(this.qs("#assegnaAttivitaNomeCustom")?.value||"").trim(),g=l?.value||null;let h=r;if(!h&&l&&l.value&&(h=l.selectedOptions[0]?.getAttribute("data-nome")||""),isNaN(n)){this.showToast("Inserisci un punteggio valido.",{type:"warning"});return}let d=[];if(t==="all")d=this.garaState.patrols||[];else{const f=(this.qs("#assegnaPattugliaSelect")||this.qs("#assegnaSquadrigliaSelect"))?.value;if(!f){this.showToast("Seleziona una pattuglia.",{type:"warning"});return}d=[f]}this.showLoadingOverlay?.("Salvataggio punteggi...");const u=d.map(f=>({pattuglia:f,squadriglia:f,attivitaId:g,attivitaNome:h,categoriaId:s,categoriaNome:e,punti:n,motivazione:a,data:o,annoScout:this.garaState.selectedYear}));await x.addGaraPunti(u,this.currentUser),await this.loadGaraDataForYear(this.garaState.selectedYear),this.renderGaraDashboard(),this.closeAssegnaPuntiModal(),this.hideLoadingOverlay?.();const m=d.length>1?`Assegnati ${n} punti a tutte le ${d.length} pattuglie!`:`Assegnati ${n} punti alla Ptg. ${d[0]}!`;this.showToast(m,{type:"success"})}catch(t){console.error("Errore salvataggio punteggi:",t),this.hideLoadingOverlay?.(),this.showToast("Errore durante il salvataggio: "+t.message,{type:"error"})}};c.deletePuntiEntry=async function(t){if(!(!t||!confirm("Sei sicuro di voler eliminare questa assegnazione di punti?")))try{this.showLoadingOverlay?.("Eliminazione..."),await x.deleteGaraPunti(t,this.currentUser),await this.loadGaraDataForYear(this.garaState.selectedYear),this.renderGaraDashboard(),this.hideLoadingOverlay?.(),this.showToast("Punteggio eliminato con successo",{type:"info"})}catch(s){console.error("Errore eliminazione punteggio:",s),this.hideLoadingOverlay?.(),this.showToast("Errore durante l'eliminazione: "+s.message,{type:"error"})}};c.openGestioneCategorieModal=function(){const t=this.qs("#modalGestioneCategorie");t&&(this.renderCategorieList(),t.classList.remove("hidden"))};c.closeGestioneCategorieModal=function(){const t=this.qs("#modalGestioneCategorie");t&&t.classList.add("hidden")};c.renderCategorieList=function(){const t=this.qs("#categorieListContainer");if(!t)return;const i=this.garaState.categories||[];if(i.length===0){t.innerHTML='<div class="text-xs text-gray-400 py-3 text-center">Nessuna categoria definita.</div>';return}t.innerHTML=i.map(s=>`
        <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div class="flex items-center gap-3">
                <span class="text-2xl">${p(s.icona||"🏆")}</span>
                <div>
                    <div class="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span>${p(s.nome)}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                            +${Number(s.puntiDefault)||10} pt def.
                        </span>
                    </div>
                    ${s.descrizione?`<p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${p(s.descrizione)}</p>`:""}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button type="button" onclick="UI.deleteCategory('${p(s.id)}')" class="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors text-xs" title="Elimina categoria">
                    🗑️
                </button>
            </div>
        </div>
    `).join("")};c.submitNewCategory=async function(){try{const t=(this.qs("#newCatIcon")?.value||"🎯").trim(),i=(this.qs("#newCatNome")?.value||"").trim(),s=Number(this.qs("#newCatPunti")?.value)||10,e=(this.qs("#newCatDescrizione")?.value||"").trim();if(!i){this.showToast("Inserisci il nome della categoria.",{type:"warning"});return}this.showLoadingOverlay?.("Aggiunta categoria..."),await x.addGaraCategory({nome:i,icona:t,puntiDefault:s,descrizione:e,annoScout:this.garaState.selectedYear},this.currentUser),await this.loadGaraDataForYear(this.garaState.selectedYear),this.renderCategorieList(),this.updateGaraDropdowns();const n=this.qs("#newCategoryForm");n&&n.reset(),this.qs("#newCatIcon")&&(this.qs("#newCatIcon").value="🎯"),this.qs("#newCatPunti")&&(this.qs("#newCatPunti").value="15"),this.hideLoadingOverlay?.(),this.showToast("Nuova categoria aggiunta!",{type:"success"})}catch(t){console.error("Errore aggiunta categoria:",t),this.hideLoadingOverlay?.(),this.showToast("Errore aggiunta categoria: "+t.message,{type:"error"})}};c.deleteCategory=async function(t){if(!(!t||!confirm("Eliminare questa categoria di punteggio?")))try{this.showLoadingOverlay?.("Eliminazione..."),await x.deleteGaraCategory(t,this.currentUser),await this.loadGaraDataForYear(this.garaState.selectedYear),this.renderCategorieList(),this.updateGaraDropdowns(),this.hideLoadingOverlay?.(),this.showToast("Categoria eliminata",{type:"info"})}catch(s){console.error("Errore eliminazione categoria:",s),this.hideLoadingOverlay?.(),this.showToast("Errore: "+s.message,{type:"error"})}};c.exportGaraCsv=function(){const t=this.calculateGaraLeaderboard(),i=this.garaState.punti||[],s=this.garaState.selectedYear||"reparto";let e=`GARA DI REPARTO - CLASSIFICA ANNO SCOUT ${s}
`;e+=`Posizione;Pattuglia;Punti Totali;Eventi Registrati
`,t.forEach((l,r)=>{e+=`${r+1};${l.pattuglia||l.squadriglia};${l.totalePunti};${l.assegnazioniCount}
`}),e+=`
STORICO ASSEGNAZIONI PUNTI
`,e+=`Data;Pattuglia;Attivita;Categoria;Punti;Motivazione;Assegnato Da
`,i.forEach(l=>{const r=(l.motivazione||"").replace(/"/g,'""');e+=`${l.data||""};${l.pattuglia||l.squadriglia||""};"${l.attivitaNome||""}";"${l.categoriaNome||""}";${l.punti||0};"${r}";"${l.assegnatoDa||""}"
`});const n=new Blob(["\uFEFF"+e],{type:"text/csv;charset=utf-8;"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`Gara_Reparto_${s.replace("/","-")}.csv`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(o),this.showToast("Classifica e storico esportati in CSV!",{type:"success"})};typeof document<"u"&&document.addEventListener("DOMContentLoaded",()=>{c.initGaraPage()});
