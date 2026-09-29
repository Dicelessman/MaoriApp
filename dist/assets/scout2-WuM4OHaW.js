import{n as U,f as T,a as B}from"./date-picker-OzOI86qq.js";/* empty css              */import"./shared-CZWINqpE.js";import{c as L}from"./cngei-service-DZdKacRO.js";import{r as R,c as O,a as j,s as H}from"./cngei-progressioni-DygIf-W3.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";import"./cngei-sync-DwYf0NUJ.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const a=new URLSearchParams(location.search).get("id");if(!a){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=a,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(g=>{const l=this.qs(`#${g}`);l&&(l.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());const e=(this.state.allScouts||this.state.scouts||[]).find(g=>g.id===a);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const i=(g,l)=>{const h=this.qs(g);h&&(h.value=l??"")};i("#anag_nome",e.nome),i("#anag_cognome",e.cognome),i("#anag_dob",this.toYyyyMmDd(e.anag_dob)),i("#anag_sesso",e.anag_sesso),i("#anag_cf",e.anag_cf),i("#anag_indirizzo",e.anag_indirizzo),i("#anag_citta",e.anag_citta),i("#anag_email",e.anag_email),i("#anag_telefono",e.anag_telefono),i("#ct_g1_nome",e.ct_g1_nome),i("#ct_g1_tel",e.ct_g1_tel),i("#ct_g1_email",e.ct_g1_email),i("#ct_g2_nome",e.ct_g2_nome),i("#ct_g2_tel",e.ct_g2_tel),i("#ct_g2_email",e.ct_g2_email),i("#san_gruppo",e.san_gruppo),i("#san_intolleranze",e.san_intolleranze),i("#san_allergie",e.san_allergie),i("#san_farmaci",e.san_farmaci),i("#san_vaccinazioni",e.san_vaccinazioni),i("#san_cert",e.san_cert),i("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),i("#san_altro",e.san_altro),i("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const o=this.qs(`input[name="pv_vcp_cp"][value="${e.pv_vcp_cp}"]`);o&&(o.checked=!0),i("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),i("#pv_giglio_note",e.pv_giglio_note),i("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const g=["io","al","mt"];["1","2","3"].forEach(h=>{g.forEach(m=>{const y=this.qs(`#pv_sfida_${m}_${h}_text`);y&&this.autoResizeTextarea(y)})})},200),i("#pv_note",e.pv_note),i("#pv_traccia1_note",e.pv_traccia1_note),i("#pv_traccia2_note",e.pv_traccia2_note),i("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(l=>{const h=this.qs(`#${l}`);h&&this.autoResizeTextarea(h)})},250),i("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),i("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),i("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),i("#ev_note",e.ev_note);const s=g=>{if(!g)return"";const l=this.toJsDate(g);return isNaN(l.getTime())?"":l.getFullYear().toString()};i("#doc_quota1",s(e.doc_quota1)),i("#doc_quota2",s(e.doc_quota2)),i("#doc_quota3",s(e.doc_quota3)),i("#doc_quota4",s(e.doc_quota4));const c=(g,l)=>{const h=this.qs(g);h&&(h.checked=!!l)};c("#doc_iscr",e.doc_iscr),c("#doc_priv",e.doc_priv),c("#doc_san",e.doc_san),c("#doc_liberatoria",e.doc_liberatoria),i("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const d=this.qs("#san_cert_scadenza");if(d&&!d._bound){d._bound=!0;const g=()=>this.updateMedicalStatusBadge(this.currentScout);d.addEventListener("input",g),d.addEventListener("change",g),this.qs("#doc_priv")?.addEventListener("change",g),this.qs("#doc_san")?.addEventListener("change",g)}const r=this.qs("#sendWhatsAppReminderBtn");r&&!r._bound&&(r._bound=!0,r.addEventListener("click",()=>{const g=this.currentScout||{},l=this.qs("#san_cert_scadenza")?.value||"",h=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...g,san_cert_scadenza:l,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,m=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||g.ct_g1_tel||g.anag_telefono||"",y=`${this.qs("#anag_nome")?.value||g.nome||""} ${this.qs("#anag_cognome")?.value||g.cognome||""}`.trim(),v=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:y,scadenzaStr:h?.formattedDate||l,telGenitore:m,certStatus:h?.certStatus||"expiring",missingDocs:h?.missingDocuments||[]}):null;v&&v.url&&window.open(v.url,"_blank")}));const n=this.qs("#scoutForm");n&&!n._bound&&(n._bound=!0,n.addEventListener("submit",async g=>{if(g.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const l=n.querySelector('button[type="submit"]'),h=l?.textContent;this.setButtonLoading(l,!0,h);try{const m=this.collectForm();await DATA.updateScout(a,m,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.showToast("Scheda salvata")}catch(m){console.error("Errore salvataggio scheda:",m),this.showToast("Errore durante il salvataggio: "+(m.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(l,!1,h)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const u=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",u),this.qs("#printMedicalSectionBtn")?.addEventListener("click",u),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),["1","2","3"].forEach(g=>{const l=e[`cngei_traccia${g}_id`],h=this.qs(`.traccia-header[data-traccia="${g}"]`);if(h){const m=h.querySelector(".cngei-traccia-badge");if(m&&m.remove(),l){const y=document.createElement("span");y.className="cngei-traccia-badge inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs ml-2",y.title="Convalidata su Portale CNGEI",y.textContent="✓ CNGEI";const v=h.querySelector("h4");v&&v.appendChild(y)}}}),document.querySelectorAll(".openCngeiProgModalBtn").forEach(g=>{g._bound||(g._bound=!0,g.addEventListener("click",()=>this.openCngeiProgressioniModal()))});const p=this.qs("#closeCngeiProgModalBtn");p&&!p._bound&&(p._bound=!0,p.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const _=this.qs("#cancelCngeiProgModalBtn");_&&!_._bound&&(_._bound=!0,_.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const x=this.qs("#cngeiProgSelectAllBtn");x&&!x._bound&&(x._bound=!0,x.addEventListener("click",()=>{const g=document.querySelectorAll(".cngei-prog-chk"),l=Array.from(g).some(h=>!h.checked);g.forEach(h=>{h.checked=l})}));const f=this.qs("#confirmSendProgBtn");f&&!f._bound&&(f._bound=!0,f.addEventListener("click",()=>this.sendSelectedProgressioniToCngei())),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.openCngeiProgressioniModal=async function(){const t=this.currentScout;if(!t)return;const a=this.qs("#cngeiProgressioniModal");if(!a)return;const e=this.qs("#cngeiProgScoutName");if(e){const n=`${t.nome||""} ${t.cognome||""}`.trim()||"Esploratore";e.textContent=`Esploratore: ${n}${t.tesseraCngei?` (Tessera #${t.tesseraCngei})`:""}`}const i=this.qs("#cngeiProgNoIdWarning"),o=this.qs("#confirmSendProgBtn");t.idCngei?(i?.classList.add("hidden"),o&&(o.disabled=!1)):(i?.classList.remove("hidden"),o&&(o.disabled=!0));const s=this.qs("#cngeiProgPendingList"),c=this.qs("#cngeiProgSyncedList"),d=this.qs("#cngeiProgPendingCount"),r=this.qs("#cngeiProgSyncedCount");s&&(s.innerHTML='<div class="text-sm text-slate-500 py-3 text-center">Caricamento progressioni da portale CNGEI...</div>'),c&&(c.innerHTML=""),a.classList.remove("hidden");try{const n=await L.getProgressioniTypes(),u=this.collectSpecialita(),p={...t,specialita:u,pv_traccia1:{done:!!this.qs("#pv_traccia1_chk")?.checked,data:this.qs("#pv_traccia1_dt")?.value||t.pv_traccia1?.data},pv_traccia2:{done:!!this.qs("#pv_traccia2_chk")?.checked,data:this.qs("#pv_traccia2_dt")?.value||t.pv_traccia2?.data},pv_traccia3:{done:!!this.qs("#pv_traccia3_chk")?.checked,data:this.qs("#pv_traccia3_dt")?.value||t.pv_traccia3?.data}};if(t.idCngei)try{const f=await L.getPersona(t.idCngei);if(f?.brevetti&&Array.isArray(f.brevetti)){const{changed:g}=R(p,f.brevetti);if(g){t.specialita=p.specialita,p.cngei_traccia1_id&&(t.cngei_traccia1_id=p.cngei_traccia1_id),p.cngei_traccia2_id&&(t.cngei_traccia2_id=p.cngei_traccia2_id),p.cngei_traccia3_id&&(t.cngei_traccia3_id=p.cngei_traccia3_id),await DATA.updateScout(t.id,t,this.currentUser);try{this.showToast("Progressioni già registrate su CNGEI allineate!",{type:"info",duration:2500})}catch{}}}}catch(f){console.warn("Avviso recupero dati persona CNGEI:",f)}const _=O(p,n),x=j(p,n);d&&(d.textContent=_.length),r&&(r.textContent=x.length),_.length===0?(s&&(s.innerHTML='<div class="text-sm text-slate-500 py-4 text-center">Nessuna progressione o specialità conseguita in attesa di invio.</div>'),o&&(o.disabled=!0)):(o&&t.idCngei&&(o.disabled=!1),s&&(s.innerHTML=_.map((f,g)=>`
          <label class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="cngei-prog-chk w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-index="${g}" checked />
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${f.category.includes("PO")?"bg-amber-100 text-amber-800 border border-amber-200":"bg-blue-100 text-blue-800 border border-blue-200"}">${f.category}</span>
                  <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${f.name}</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">Conseguita il: <strong>${f.obtainedAt}</strong></div>
              </div>
            </div>
            <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-right">
              ✓ Pronto per invio
            </div>
          </label>
        `).join(""))),x.length===0?c&&(c.innerHTML='<div class="text-center py-2 text-slate-400">Nessuna progressione ancora registrata a portale.</div>'):c&&(c.innerHTML=x.map(f=>`
          <div class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-emerald-600">✓</span>
              <span>${f.name} (${f.category})</span>
            </span>
            <span class="text-slate-400 text-[11px]">${f.obtainedAt}</span>
          </div>
        `).join("")),this._pendingProgressioniData=_}catch(n){console.error("Errore recupero tipi progressione CNGEI:",n),s&&(s.innerHTML=`<div class="text-sm text-rose-500 py-3 text-center">Errore connessione CNGEI: ${n.message||"Errore di rete"}</div>`)}};UI.sendSelectedProgressioniToCngei=async function(){const t=this.currentScout;if(!t||!t.idCngei){this.showToast("Esploratore non associato a un ID del portale CNGEI.",{type:"error"});return}const a=Array.from(document.querySelectorAll(".cngei-prog-chk:checked"));if(a.length===0){this.showToast("Nessuna progressione selezionata da inviare.",{type:"info"});return}const e=this.qs("#confirmSendProgBtn"),i=e?.innerHTML;this.setButtonLoading(e,!0,"Invio in corso...");try{let o=0;const s=[],c=Array.isArray(t.specialita)?[...t.specialita]:[];for(const d of a){const r=parseInt(d.dataset.index,10),n=this._pendingProgressioniData?.[r];if(n)try{const p=(await H(t.idCngei,n.typeId,n.obtainedAt,L))?.id||"synced_"+Date.now();n.indexInArray!==void 0&&c[n.indexInArray]?c[n.indexInArray].idProgressioneCngei=p:n.tracciaKey==="pv_traccia1"?t.cngei_traccia1_id=p:n.tracciaKey==="pv_traccia2"?t.cngei_traccia2_id=p:n.tracciaKey==="pv_traccia3"&&(t.cngei_traccia3_id=p),o++}catch(u){console.error(`Errore invio ${n.name}:`,u),s.push(`${n.name}: ${u.message}`)}}t.specialita=c,await DATA.updateScout(t.id,t,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),s.length>0?this.showToast(`Inviate ${o} progressioni. Errori su: ${s.join(", ")}`,{type:"warning",duration:5e3}):this.showToast(`Sincronizzazione completata (${o} progressioni convalidate su CNGEI)!`),this.closeModal("cngeiProgressioniModal"),await this.renderScoutPage()}catch(o){console.error("Errore sincronizzazione progressioni:",o),this.showToast("Errore durante la sincronizzazione: "+(o.message||"Errore server"),{type:"error"})}finally{this.setButtonLoading(e,!1,i)}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const a=["io","al","mt"];["1","2","3"].forEach(i=>{a.forEach(o=>{const s=`#pv_sfida_${o}_${i}`,c=this.qs(s);if(!c)return;const d=o.toUpperCase(),r=t[i]?.[d]||[];c.innerHTML='<option value="">Seleziona sfida...</option>',r.forEach(n=>{const u=document.createElement("option");u.value=n.code,u.textContent=n.code,c.appendChild(u)}),c.addEventListener("change",()=>{const n=c.value,u=this.qs(`#pv_sfida_${o}_${i}_text`);if(u){const p=r.find(_=>_.code===n);u.value=p?p.text:"",this.autoResizeTextarea(u)}})})})};UI.loadChallengeData=function(t){const a=["io","al","mt"];["1","2","3"].forEach(i=>{a.forEach(o=>{const s=`pv_sfida_${o}_${i}`,c=`pv_sfida_${o}_${i}_data`,d=`pv_sfida_${o}_${i}_text`;let r=t[s],n=t[c];if(!r){const _={io:"io",al:"re",mt:"im"},x={io:"IO",al:"AL",mt:"MT"},f=_[o],g=`pv_sfida_${f}_${i}`,l=t[g];if(l&&typeof l=="string")r=l.replace("-RE-","-AL-").replace("-IM-","-MT-"),n||(n=t[`${g}_data`]);else for(let h=1;h<=4;h++){const m=t[`pv_${f}_${i}${h}`];if(m&&m.done){r=`${i}-${x[o]}-${h}`,!n&&m.data&&(n=m.data);break}}}const u=this.qs(`#pv_sfida_${o}_${i}`),p=this.qs(`#${c}`);this.qs(`#${d}`),u&&r&&(u.value=r,u.dispatchEvent(new Event("change")),setTimeout(()=>{const _=this.qs(`#${d}`);_&&this.autoResizeTextarea(_)},100)),p&&n&&(p.value=this.toYyyyMmDd(n))})})};UI.loadSpecialita=function(t){const a=this.qs("#specialitaContainer");a&&(a.innerHTML="",t.forEach((e,i)=>this.addSpecialita(e,i)))};UI.applySpecialitaColors=function(t,a){if(!t)return;const e="white",i="gray",o=(a?.sfondo_colore||e).toLowerCase(),s=(a?.bordo_colore||i).toLowerCase();t.classList.add("specialita-card"),t.setAttribute("data-sfondo",o),t.setAttribute("data-bordo",s),o==="yellow"?(t.classList.add("specialita-sfondo-yellow"),t.classList.remove("specialita-sfondo-green")):o==="green"?(t.classList.add("specialita-sfondo-green"),t.classList.remove("specialita-sfondo-yellow")):t.classList.remove("specialita-sfondo-yellow","specialita-sfondo-green"),t.style.backgroundColor=a?.sfondo_colore||e,t.style.border=`3px solid ${a?.bordo_colore||i}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,a=null){const e=this.qs("#specialitaContainer");if(!e)return;const i=a!==null?a:e.children.length,o=`sp_${i}`,s=await this.loadSpecialitaList(),c=t?.nome?U(t.nome):"",d=t?.nome&&s?s.find(l=>l.nome===t.nome||l.nome===c):null,r=d?.nome||t?.nome&&String(t.nome).trim()||"",n=r?T(r):"",u=d?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],p=document.createElement("div");p.className="rounded-lg overflow-hidden",p.dataset.idProgressioneCngei=t?.idProgressioneCngei||"",this.applySpecialitaColors(p,d||(t&&(t.sfondo_colore||t.bordo_colore)?t:null)),p.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${i}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <img id="${o}_badge" src="${n?`img/specialita/${n}.png`:""}" alt="Distintivo Specialità" class="w-8 h-8 object-contain rounded-full shadow-sm bg-white p-0.5 border border-gray-200" style="${n?"":"display:none;"}" onerror="this.style.display='none';" />
            <h4 class="font-semibold text-lg flex items-center gap-2">
              <span id="${o}_title">${d?.nome||t?.nome&&String(t.nome).trim()||"Specialità"}</span>
              ${t?.idProgressioneCngei?'<span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs" title="Sincronizzata con portale CNGEI">✓ CNGEI</span>':""}
            </h4>
          </div>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${o}_ott_chk" ${t?.ottenuta?"checked":""} />
            <span>Ottenuta</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${o}_brevetto" ${t?.brevetto?"checked":""} />
            <span>Brevetto</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${o}_distintivo" ${t?.distintivo?"checked":""} />
            <span>Distintivo</span>
          </label>
          <input id="${o}_data" type="date" class="input" value="${t?.data?this.toYyyyMmDd(t.data):""}" placeholder="Data" />
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="removeSpecialitaBtn text-red-600 hover:text-red-800" data-index="${i}">🗑️</button>
          <span class="expand-icon text-xl">▼</span>
        </div>
      </div>
    </div>
    <!-- Contenuto espandibile -->
    <div class="specialita-content p-4 pt-0 space-y-2">
      <div class="grid md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Specialità</label>
          <div class="flex items-center gap-3">
            <img id="${o}_select_badge" src="${n?`img/specialita/${n}.png`:""}" alt="Distintivo Specialità" class="w-10 h-10 object-contain rounded-full shadow-sm bg-white p-1 border border-gray-200 shrink-0" style="${n?"":"display:none;"}" onerror="this.style.display='none';" />
            <select id="${o}_nome" class="input flex-1">
              <option value="">Seleziona specialità...</option>
              ${s.map(l=>`<option value="${l.nome}" ${t?.nome===l.nome||c===l.nome?"selected":""}>${l.nome} (${l.categoria||(l.sfondo_colore==="green"?"Verdi":"Gialle")}${l.ambito?" - "+l.ambito:""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${u.map((l,h)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${l.nome}</label>
                <input id="${o}_${l.id}_data" type="date" class="input" value="${t?.[`${l.id}_data`]?this.toYyyyMmDd(t[`${l.id}_data`]):""}" />
              </div>
              <textarea id="${o}_${l.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${l.text||""}</textarea>
            </div>
          `).join("")}
        </div>
        <div class="md:col-span-2 grid grid-cols-2 gap-2">
          <label class="block text-sm">Prova CR</label>
          <input id="${o}_cr_text" type="text" class="input" value="${t?.cr_text||""}" placeholder="Testo prova CR" />
          <label class="block text-sm">Data Prova CR</label>
          <input id="${o}_cr_data" type="date" class="input" value="${t?.cr_data?this.toYyyyMmDd(t.cr_data):""}" />
        </div>
        <div class="md:col-span-2"><label class="block text-sm">Note</label><textarea id="${o}_note" class="textarea textarea-auto-resize">${t?.note||""}</textarea></div>
      </div>
    </div>
  `,e.appendChild(p),setTimeout(()=>{u.forEach(h=>{const m=p.querySelector(`#${o}_${h.id}_text`);m&&this.autoResizeTextarea(m)});const l=p.querySelector(`#${o}_note`);l&&this.autoResizeTextarea(l)},50),p.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{p.remove(),this.renumberSpecialita()});const _=p.querySelector(`#${o}_nome`),x=p.querySelector(`#${o}_title`),f=p.querySelector(`#${o}_badge`),g=p.querySelector(`#${o}_select_badge`);_&&x&&_.addEventListener("change",async()=>{const l=_.value||"";x.textContent=l||"Specialità";const h=l?T(l):"";f&&(h?(f.src=`img/specialita/${h}.png`,f.style.display=""):f.style.display="none"),g&&(h?(g.src=`img/specialita/${h}.png`,g.style.display=""):g.style.display="none");const y=(await this.loadSpecialitaList()).find(v=>v.nome===l);this.applySpecialitaColors(p,y),y&&y.prove&&y.prove.forEach(v=>{const b=p.querySelector(`#${o}_${v.id}_data`);if(b){let S=b.previousElementSibling;for(;S&&S.tagName!=="LABEL";)S=S.previousElementSibling;S&&S.tagName==="LABEL"&&(S.textContent=v.nome)}const w=p.querySelector(`#${o}_${v.id}_text`);w&&(w.value=v.text||"",this.autoResizeTextarea(w))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((a,e)=>{const i=a.querySelector(".removeSpecialitaBtn"),o=a.querySelector(".specialita-header");i&&(i.dataset.index=e),o&&(o.dataset.specialita=e)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const e=Array.from(t.children).map(s=>{const c=s.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",d=u=>{const p=this.qs(`#${c}${u}`);if(!p)return null;const _=p.value?.trim()||"";return _===""?null:_},r=u=>!!this.qs(`#${c}${u}`)?.checked,n={nome:d("_nome")||"",ottenuta:!!this.qs(`#${c}_ott_chk`)?.checked,brevetto:r("_brevetto"),distintivo:r("_distintivo"),data:d("_data"),p1_data:d("_p1_data"),p2_data:d("_p2_data"),p3_data:d("_p3_data"),cr_text:d("_cr_text")||"",cr_data:d("_cr_data"),note:d("_note")||"",idProgressioneCngei:s.dataset.idProgressioneCngei||null};return n._hasData=!!(n.nome.trim()&&(n.ottenuta||n.brevetto||n.distintivo||n.data||n.p1_data||n.p2_data||n.p3_data||n.cr_data||n.cr_text&&n.cr_text.trim()||n.note&&n.note.trim())),n}).filter(s=>s.nome&&s.nome.trim()),i=new Map,o=[];return e.forEach(s=>{const c=s.nome.trim().toLowerCase(),d=i.get(c);if(!d)i.set(c,s),o.push(s);else if(s._hasData&&!d._hasData){const r=o.indexOf(d);r!==-1&&(o[r]=s,i.set(c,s))}else s._hasData,d._hasData}),o.map(({_hasData:s,...c})=>c)};UI.setCheckDate=function(t,a){const e=a?.data?this.toYyyyMmDd(a.data):this.toYyyyMmDd(a),i=a?.done??(a&&typeof a=="object"?!1:!!a),o=a?.brevetto??!1,s=a?.distintivo??!1,c=this.qs(`#${t}_chk`),d=this.qs(`#${t}_dt`),r=this.qs(`#${t}_brevetto`),n=this.qs(`#${t}_distintivo`);c&&(c.checked=!!i),d&&(d.value=e||""),r&&(r.checked=!!o),n&&(n.checked=!!s)};UI.setPair=function(t,a){const e=this.qs(`${t}_dt`),i=this.qs(`${t}_tx`);e&&(e.value=this.toYyyyMmDd(a?.data||a)||""),i&&(i.value=a?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const a=this.toJsDate(t);return isNaN(a)?"":a.toISOString().split("T")[0]};UI.collectForm=function(){const t=r=>this.qs(r)?.value?.trim()||"",a=r=>this.qs(r)?.value||"",e=r=>!!this.qs(r)?.checked,i=r=>({data:t(`${r}_dt`)||null,testo:t(`${r}_tx`)||""}),o=r=>({done:e(`#${r}_chk`),data:t(`#${r}_dt`)||null,brevetto:e(`#${r}_brevetto`),distintivo:e(`#${r}_distintivo`)}),s={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:a("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:a("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:a("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_intolleranze:t("#san_intolleranze"),san_allergie:t("#san_allergie"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:i("#ev_ce1"),ev_ce2:i("#ev_ce2"),ev_ce3:i("#ev_ce3"),ev_ce4:i("#ev_ce4"),ev_ccp:i("#ev_ccp"),ev_tc1:i("#ev_tc1"),ev_tc2:i("#ev_tc2"),ev_tc3:i("#ev_tc3"),ev_tc4:i("#ev_tc4"),ev_jam:i("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:o("pv_traccia1"),pv_traccia2:o("pv_traccia2"),pv_traccia3:o("pv_traccia3"),doc_quota1:(()=>{const r=t("#doc_quota1");return r&&r.trim()!==""?`${r}-01-01`:null})(),doc_quota2:(()=>{const r=t("#doc_quota2");return r&&r.trim()!==""?`${r}-01-01`:null})(),doc_quota3:(()=>{const r=t("#doc_quota3");return r&&r.trim()!==""?`${r}-01-01`:null})(),doc_quota4:(()=>{const r=t("#doc_quota4");return r&&r.trim()!==""?`${r}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},c=["io","al","mt"];return["1","2","3"].forEach(r=>{c.forEach(n=>{const u=`pv_sfida_${n}_${r}`,p=`pv_sfida_${n}_${r}_data`;s[u]=t(`#pv_sfida_${n}_${r}`),s[p]=t(`#pv_sfida_${n}_${r}_data`)||null})}),this.currentScout?.idCngei&&(s.idCngei=this.currentScout.idCngei),this.currentScout?.tesseraCngei&&(s.tesseraCngei=this.currentScout.tesseraCngei),this.currentScout?.cngei_traccia1_id&&(s.cngei_traccia1_id=this.currentScout.cngei_traccia1_id),this.currentScout?.cngei_traccia2_id&&(s.cngei_traccia2_id=this.currentScout.cngei_traccia2_id),this.currentScout?.cngei_traccia3_id&&(s.cngei_traccia3_id=this.currentScout.cngei_traccia3_id),s};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const a=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(e=>{const i=document.createElement("option");i.value=e,i.textContent=e,t.appendChild(i)}),a&&this.pattuglie.includes(a)&&(t.value=a)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((a,e)=>{const i=document.createElement("div");i.className="flex items-center justify-between p-2 bg-gray-50 rounded border",i.innerHTML=`
      <input type="text" value="${a}" class="input flex-1 mr-2" data-index="${e}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${e})">
        🗑️
      </button>
    `,t.appendChild(i)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),a=t.value.trim();if(!a){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(a)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(a),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),a=[];if(t.forEach(o=>{const s=o.value.trim();s&&!a.includes(s)&&a.push(s)}),a.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const e=this.qs("#savePattugliaBtn"),i=e.textContent;e.textContent="Salvataggio...",e.disabled=!0;try{this.pattuglie=a,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(o){console.error("Errore salvataggio pattuglie:",o),this.showToast("Errore salvataggio: "+o.message,{type:"error"})}finally{e.textContent=i,e.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",a=>{const e=a.target.closest(".traccia-header");if(!e)return;if(console.log("Click su header traccia:",e.dataset.traccia),a.target.type==="checkbox"||a.target.type==="date"){console.log("Click su input, ignorato");return}const i=e.dataset.traccia;console.log("Toggling traccia:",i),this.toggleTracciaSection(i)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const a=document.querySelector(`.traccia-header[data-traccia="${t}"]`),e=a?.nextElementSibling,i=a?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!a,content:!!e,icon:!!i}),!a||!e||!i){console.error("Elementi non trovati per traccia:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione..."),e.classList.remove("expanded"),i.classList.remove("rotated")):(console.log("Espandendo sezione..."),e.classList.add("expanded"),i.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",i.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",a=>{const e=a.target.closest(".specialita-header");if(!e)return;if(console.log("Click su header specialità:",e.dataset.specialita),a.target.type==="checkbox"||a.target.type==="date"||a.target.tagName==="SELECT"||a.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const i=e.dataset.specialita;console.log("Toggling specialità:",i),this.toggleSpecialitaSection(i)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const a=document.querySelector(`.specialita-header[data-specialita="${t}"]`),e=a?.nextElementSibling,i=a?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!a,content:!!e,icon:!!i}),!a||!e||!i){console.error("Elementi non trovati per specialità:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione specialità..."),e.classList.remove("expanded"),i.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),e.classList.add("expanded"),i.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",i.className)};UI.currentTab="anagrafici";UI.switchTab=function(t,a=!0){if(t||(t="anagrafici"),t=t.toLowerCase().replace("#","").replace("section-",""),document.getElementById(`section-${t}`)||(console.warn(`[Tabs] Sezione section-${t} non trovata, fallback ad anagrafici`),t="anagrafici"),this.currentTab=t,document.querySelectorAll('section[id^="section-"]').forEach(s=>{s.id===`section-${t}`?(s.classList.remove("hidden"),s.classList.add("active"),s.querySelectorAll("textarea").forEach(c=>{typeof this.autoResizeTextarea=="function"&&this.autoResizeTextarea(c)})):(s.classList.add("hidden"),s.classList.remove("active"))}),document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(s=>{(s.dataset.tab||s.getAttribute("href")||"").toLowerCase().replace("#","").replace("section-","")===t?s.classList.add("active"):s.classList.remove("active")}),a&&window.history&&window.history.replaceState)try{history.replaceState(null,"",`#${t}`)}catch{}};UI.initSectionNavigation=function(){document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(i=>{i._tabBound||(i._tabBound=!0,i.addEventListener("click",o=>{o.preventDefault();const s=(i.dataset.tab||i.getAttribute("href")||"").replace("#","").replace("section-","");this.switchTab(s)}))}),document.querySelectorAll("[data-tab-nav]").forEach(i=>{i._tabNavBound||(i._tabNavBound=!0,i.addEventListener("click",o=>{o.preventDefault();const s=i.dataset.tabNav;if(s){this.switchTab(s);const c=document.getElementById("scoutHeaderContainer")||document.getElementById("scoutHeader");c&&typeof c.scrollIntoView=="function"&&c.scrollIntoView({behavior:"smooth",block:"start"})}}))});const a=document.getElementById("scrollTopBtn");a&&!a._bound&&(a._bound=!0,a.addEventListener("click",i=>{i.preventDefault(),typeof window.scrollTo=="function"&&window.scrollTo({top:0,behavior:"smooth"})}));const e=(window.location.hash||"").replace("#","").replace("section-","");e&&document.getElementById(`section-${e}`)?this.switchTab(e,!1):this.switchTab(this.currentTab||"anagrafici",!1),window._scoutTabHashBound||(window._scoutTabHashBound=!0,window.addEventListener("hashchange",()=>{const i=(window.location.hash||"").replace("#","").replace("section-","");i&&document.getElementById(`section-${i}`)&&this.switchTab(i,!1)}))};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},200)});UI.generateScoutSentieroHtml=B;UI._printHtmlInArea=async function(t,a){let e=this.qs?this.qs("#printArea"):document.getElementById("printArea");e||(e=document.createElement("div"),e.id="printArea",e.style.display="none",document.body.appendChild(e)),e.innerHTML=t,e.style.display="block";const i=document.getElementById("app");let o="";i&&(o=i.getAttribute("style")||"",i.style.setProperty("display","none","important"));const s=document.title;document.title=a||s;const c=Array.from(e.querySelectorAll("img"));c.length>0&&(await Promise.all(c.map(n=>n.complete&&n.naturalWidth>0?typeof n.decode=="function"?n.decode().catch(()=>{}):Promise.resolve():new Promise(u=>{let p=!1;const _=()=>{p||(p=!0,typeof n.decode=="function"?n.decode().then(u).catch(u):u())};n.addEventListener("load",_,{once:!0}),n.addEventListener("error",()=>{p||(p=!0,u())},{once:!0}),setTimeout(_,2e3)}))),await new Promise(n=>setTimeout(n,120))),window.print();let d=!1;const r=()=>{d||(d=!0,document.title=s,e.style.display="none",e.innerHTML="",i&&(o?i.setAttribute("style",o):i.removeAttribute("style")))};typeof window<"u"&&("onafterprint"in window||typeof window.addEventListener=="function")?(window.addEventListener("afterprint",r,{once:!0}),setTimeout(r,6e4)):setTimeout(r,2e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.scouts||[]).find(d=>d.id===t);if(!a){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=this.collectForm(),i={...a,specialita:a.specialita||[],nome:e.nome||a.nome,cognome:e.cognome||a.cognome},o=await this.loadChallenges(),s=await this.loadSpecialitaList(),c=this.generateScoutSentieroHtml(i,o,s);this._printHtmlInArea(c,`Il Sentiero di ${i.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.allScouts||this.state.scouts||[]).find(i=>i.id===t);if(!a){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.generateScoutSentieroHtml(a,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(e,`Il Sentiero di ${a.nome||""}`)}catch(a){this.hideLoadingOverlay(),console.error("Errore stampa singola:",a),this.showToast("Errore stampa: "+a.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,a){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.state.allScouts||this.state.scouts||[],i=[];if(t.forEach((o,s)=>{const c=e.find(r=>r.id===o);if(!c)return;let d=this.generateScoutSentieroHtml(c,this.challengesData,this.specialitaListData);s<t.length-1&&(d+='<div style="page-break-after: always;"></div>'),i.push(d)}),i.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(i.join(`
`),a||"Schede Sentiero Reparto")}catch(e){this.hideLoadingOverlay(),console.error("Errore stampa batch:",e),this.showToast("Errore stampa: "+e.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const a=this.qs("#san_cert_status_badge");if(!a)return;const e=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),i=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,o=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,s={...t||{},san_cert_scadenza:e,doc_priv:i,doc_san:o},c=this.getScoutMedicalStatus?this.getScoutMedicalStatus(s):null;c&&(a.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${c.badgeClass}`,a.textContent=`🩺 ${c.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const a=t||{},e=`${a.nome||""} ${a.cognome||""}`.trim()||"Esploratore",i=a.pv_pattuglia||"Reparto",o=a.cp_vcp||"Esploratore",s=a.anag_dob||a.dataNascita;let c="Non indicata",d="";if(s){const E=this.toJsDate?this.toJsDate(s):new Date(s);if(!isNaN(E.getTime())){c=E.toLocaleDateString("it-IT");const D=Date.now()-E.getTime(),N=new Date(D),C=Math.abs(N.getUTCFullYear()-1970);C>=0&&C<100&&(d=` (${C} anni)`)}}const r=a.anag_pob||"-",n=a.anag_cf?a.anag_cf.toUpperCase():"-",u=a.anag_indirizzo||"-",p=a.ct_g1_nome||"Genitore 1",_=a.ct_g1_rel?` (${a.ct_g1_rel})`:"",x=a.ct_g1_tel||a.anag_telefono||"Non specificato",f=a.ct_g2_nome||"Genitore 2",g=a.ct_g2_rel?` (${a.ct_g2_rel})`:"",l=a.ct_g2_tel||"-",h=a.ct_med_nome||"-",m=a.ct_med_tel||"-",y=a.san_gruppo||"N.D.",v=(a.san_intolleranze||"").trim(),b=(a.san_allergie||"").trim(),w=(a.san_farmaci||"").trim(),S=(a.san_vaccinazioni||"").trim(),P=a.san_cert_scadenza?this.toJsDate?this.toJsDate(a.san_cert_scadenza).toLocaleDateString("it-IT"):a.san_cert_scadenza:"Non specificata",z=(a.san_cert||"").trim(),I=(a.san_altro||"").trim(),$=this.getScoutMedicalStatus?this.getScoutMedicalStatus(a):null,q=$?$.statusLabel:a.san_cert_scadenza?"Registrato":"Mancante",A=$&&$.color==="green"?"#16a34a":$&&$.color==="yellow"?"#d97706":"#dc2626",k=!!a.doc_priv,M=!!a.doc_san;return`
    <div class="medical-sheet-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 18px 22px; color: #111827; background: #ffffff; box-sizing: border-box; line-height: 1.35; font-size: 12px;">
      
      <!-- INTESTAZIONE SCHEDA -->
      <div style="border-bottom: 2.5px solid #b91c1c; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #b91c1c;">
            ⚜️ AGESCI • Reparto Maori • Cartellina Sanitaria Campo
          </div>
          <h1 style="font-size: 22px; font-weight: 900; margin: 2px 0 0 0; color: #111827; text-transform: uppercase; letter-spacing: -0.5px;">
            Scheda Sanitaria & di Emergenza
          </h1>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; font-size: 11px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #f87171; text-transform: uppercase;">
            Riservato Capi Campo
          </span>
          <div style="font-size: 10px; color: #4b5563; font-weight: 600; margin-top: 3px;">
            Anno Scout ${this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026"}
          </div>
        </div>
      </div>

      <!-- DATI ESPLORATORE & PATTUGLIA -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Esploratore / Guida</div>
          <div style="font-size: 18px; font-weight: 900; color: #111827; text-transform: uppercase;">
            ${e}
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #374151;">
            <strong>Nato il:</strong> ${c}${d} &nbsp;•&nbsp; <strong>A:</strong> ${r}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${n}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${u}
          </div>
        </div>

        <div style="text-align: right; border-left: 1.5px solid #e5e7eb; padding-left: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Pattuglia & Ruolo</div>
          <div style="font-size: 16px; font-weight: 800; color: #15803d;">
            Ptg. ${i}
          </div>
          <span style="display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px;">
            ${o}
          </span>
        </div>
      </div>

      <!-- RECAPITI DI EMERGENZA (CONTATTI) -->
      <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
        <div style="background: #f1f5f9; padding: 6px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155; border-bottom: 1.5px solid #cbd5e1; display: flex; align-items: center; gap: 6px;">
          <span>🚨</span> Recapiti Telefonici di Emergenza (Genitori / Tutori)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 10px 12px; font-size: 11px;">
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Primo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${p}${_}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${x}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${f}${g}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${l}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${h}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 1px;">
              📞 ${m}
            </div>
          </div>
        </div>
      </div>

      <!-- ALLARMI MEDICI PRIMARI: GRUPPO SANGUIGNO, ALLERGIE, INTOLLERANZE -->
      <div style="display: grid; grid-template-columns: 120px 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- Gruppo Sanguigno -->
        <div style="border: 2px solid #b91c1c; border-radius: 8px; background: #fff5f5; padding: 8px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #991b1b;">Gruppo Sangue</div>
          <div style="font-size: 26px; font-weight: 900; color: #b91c1c; line-height: 1.1; margin-top: 2px;">
            ${y}
          </div>
        </div>

        <!-- Allergie -->
        <div style="border: 1.5px solid ${b?"#ef4444":"#e5e7eb"}; background: ${b?"#fef2f2":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${b?"#b91c1c":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>⚠️ Allergie (Farmaci/Cibo/Insetti)</span>
            ${b?'<span style="color:#dc2626; font-weight:900;">ATTENZIONE</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${b?"700":"400"}; color: ${b?"#991b1b":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${b||"Nessuna allergia nota segnalata."}
          </div>
        </div>

        <!-- Intolleranze e Dieta -->
        <div style="border: 1.5px solid ${v?"#f59e0b":"#e5e7eb"}; background: ${v?"#fffbeb":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${v?"#b45309":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>🍽️ Intolleranze & Dieta</span>
            ${v?'<span style="color:#d97706; font-weight:800;">DIETA SPECIFICA</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${v?"700":"400"}; color: ${v?"#92400e":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${v||"Nessuna esigenza alimentare specifica."}
          </div>
        </div>
      </div>

      <!-- TERAPIE FARMACOLOGICHE IN CORSO & VACCINAZIONI -->
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- Farmaci -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
            💊 Terapie Farmacologiche in Corso & Modalità Assunzione
          </div>
          <div style="font-size: 11px; color: ${w?"#0f172a":"#64748b"}; font-weight: ${w?"600":"400"}; min-height: 36px;">
            ${w||"Nessuna terapia farmacologica continuativa indicata."}
          </div>
        </div>

        <!-- Vaccinazioni & Antitetanica -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
            💉 Vaccinazioni & Richiamo Antitetanica
          </div>
          <div style="font-size: 11px; color: #0f172a; min-height: 36px;">
            ${S||"Regolari secondo calendario vaccinale nazionale."}
          </div>
        </div>
      </div>

      <!-- CERTIFICATO MEDICO & DOCUMENTAZIONE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Certificato Medico Non Agonistico</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span style="font-weight: 800; font-size: 12px; color: ${A};">
              ● ${q}
            </span>
            <span style="color: #475569;">(Scadenza: <strong>${P}</strong>)</span>
          </div>
          ${z?`<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${z}</div>`:""}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Consensi e Altre Indicazioni</div>
          <div style="display: flex; gap: 12px; margin-top: 2px; font-size: 11px;">
            <span>Privacy: <strong>${k?"✅ Depositata":"❌ Mancante"}</strong></span>
            <span>Scheda Firmata: <strong>${M?"✅ Depositata":"❌ Mancante"}</strong></span>
          </div>
          ${I?`<div style="font-size: 10px; color: #475569; margin-top: 2px;">Altro: ${I}</div>`:""}
        </div>
      </div>

      <!-- DIARIO SOMMINISTRAZIONE FARMACI AL CAMPO (GRIGLIA COMPILABILE A MANO) -->
      <div style="border: 1.5px solid #94a3b8; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
        <div style="background: #f1f5f9; padding: 4px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #94a3b8; display: flex; justify-content: space-between;">
          <span>📋 Registro Somministrazioni Farmaci / Interventi Sanitari al Campo (A cura dei Capi)</span>
          <span style="font-weight: normal; color: #64748b;">Compilare ad ogni evento</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; color: #475569;">
              <th style="padding: 4px 6px; text-align: left; width: 85px; border-right: 1px solid #e2e8f0;">Data e Ora</th>
              <th style="padding: 4px 6px; text-align: left; width: 140px; border-right: 1px solid #e2e8f0;">Sintomo / Malessere</th>
              <th style="padding: 4px 6px; text-align: left; border-right: 1px solid #e2e8f0;">Farmaco somministrato & Dosaggio</th>
              <th style="padding: 4px 6px; text-align: left; width: 100px; border-right: 1px solid #e2e8f0;">Capo Resp.</th>
              <th style="padding: 4px 6px; text-align: left; width: 70px;">Firma</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0; height: 22px;">
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0; height: 22px;">
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td></td>
            </tr>
            <tr style="height: 22px;">
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td style="border-right: 1px solid #e2e8f0;"></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FOOTER FIRME -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #475569;">
        <div>
          <div>Firma del Genitore / Esercente potestà:</div>
          <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-top: 2px;"></div>
        </div>
        <div style="text-align: right;">
          <div>Firma del Capo Reparto / Capocampo:</div>
          <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-top: 2px;"></div>
        </div>
      </div>

    </div>
  `};UI.printScoutMedicalSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.scouts||[]).find(s=>s.id===t);if(!a){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=typeof this.collectForm=="function"?this.collectForm():{},i={...a,...e,nome:e.nome||a.nome,cognome:e.cognome||a.cognome},o=this.generateScoutMedicalSheetHtml(i);this._printHtmlInArea(o,`Scheda Sanitaria - ${i.nome||""} ${i.cognome||""}`)}catch(t){console.error("Errore generazione scheda sanitaria:",t),this.showToast("Errore durante la generazione della scheda sanitaria: "+t.message,{type:"error",duration:4e3})}};UI.printMedicalSingle=async function(t){try{if(!t){this.showToast?.("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay?.("Preparazione scheda sanitaria..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).find(o=>o.id===t);if(!e){this.hideLoadingOverlay?.(),this.showToast?.("Esploratore non trovato",{type:"error"});return}const i=this.generateScoutMedicalSheetHtml(e);if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(i,`Scheda Sanitaria - ${e.nome||""} ${e.cognome||""}`);else{const o=window.open("","_blank");o&&(o.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Scheda Sanitaria - ${e.nome||""} ${e.cognome||""}</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${i}
            </body>
          </html>
        `),o.document.close())}}catch(a){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",a),this.showToast?.("Errore stampa: "+a.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,a="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).filter(s=>!s.archived),i=t&&t.length>0?t.map(s=>e.find(c=>c.id===s)).filter(Boolean):e.slice().sort((s,c)=>{const d=s.pv_pattuglia||"",r=c.pv_pattuglia||"";if(d!==r)return d.localeCompare(r,"it");const n=s.cognome||"",u=c.cognome||"";return n.localeCompare(u,"it")});if(i.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const o=i.map((s,c)=>{let d=this.generateScoutMedicalSheetHtml(s);return c<i.length-1&&(d+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),d});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(o.join(`
`),a);else{const s=window.open("","_blank");s&&(s.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${a}</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${o.join(`
`)}
            </body>
          </html>
        `),s.document.close())}}catch(e){this.hideLoadingOverlay?.(),console.error("Errore stampa batch schede sanitarie:",e),this.showToast?.("Errore stampa cartellina: "+e.message,{type:"error",duration:4e3})}};
