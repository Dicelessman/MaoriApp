import{n as O,f as q,a as H}from"./date-picker-B0jTovoo.js";/* empty css              */import"./shared-6ETycm_Z.js";import{c as z}from"./cngei-service-DZdKacRO.js";import{r as j,c as F,a as G,s as Y}from"./cngei-progressioni-B6r5KadV.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";import"./cngei-sync-Dll_EPIb.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const t=new URLSearchParams(location.search),a=t.get("id");if(!a){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=a,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(l=>{const h=this.qs(`#${l}`);h&&(h.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());const e=(this.state.allScouts||this.state.scouts||[]).find(l=>l.id===a);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const i=(l,h)=>{const f=this.qs(l);f&&(f.value=h??"")};i("#anag_nome",e.nome),i("#anag_cognome",e.cognome),i("#anag_dob",this.toYyyyMmDd(e.anag_dob)),i("#anag_sesso",e.anag_sesso),i("#anag_cf",e.anag_cf),i("#anag_indirizzo",e.anag_indirizzo),i("#anag_citta",e.anag_citta),i("#anag_email",e.anag_email),i("#anag_telefono",e.anag_telefono),i("#ct_g1_nome",e.ct_g1_nome),i("#ct_g1_tel",e.ct_g1_tel),i("#ct_g1_email",e.ct_g1_email),i("#ct_g2_nome",e.ct_g2_nome),i("#ct_g2_tel",e.ct_g2_tel),i("#ct_g2_email",e.ct_g2_email),i("#san_gruppo",e.san_gruppo),i("#san_allergie",e.san_allergie),i("#san_intolleranze",e.san_intolleranze),i("#san_patologie",e.san_patologie),i("#san_farmaci",e.san_farmaci),i("#san_vaccinazioni",e.san_vaccinazioni),i("#ct_med_nome",e.ct_med_nome),i("#ct_med_tel",e.ct_med_tel),i("#san_cert",e.san_cert),i("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),i("#san_altro",e.san_altro);const o=this.qs("#san_disabilita");if(o){o.checked=!!e.san_disabilita;const l=this.qs("#san_disabilita_note_wrapper");l&&l.classList.toggle("hidden",!e.san_disabilita)}i("#san_disabilita_note",e.san_disabilita_note),i("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const s=this.qs(`input[name="pv_vcp_cp"][value="${e.pv_vcp_cp}"]`);s&&(s.checked=!0),i("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),i("#pv_giglio_note",e.pv_giglio_note),i("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const l=["io","al","mt"];["1","2","3"].forEach(f=>{l.forEach(v=>{const y=this.qs(`#pv_sfida_${v}_${f}_text`);y&&this.autoResizeTextarea(y)})})},200),i("#pv_note",e.pv_note),i("#pv_traccia1_note",e.pv_traccia1_note),i("#pv_traccia2_note",e.pv_traccia2_note),i("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(h=>{const f=this.qs(`#${h}`);f&&this.autoResizeTextarea(f)})},250),i("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),i("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),i("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),i("#ev_note",e.ev_note);const n=l=>{if(!l)return"";const h=this.toJsDate(l);return isNaN(h.getTime())?"":h.getFullYear().toString()};i("#doc_quota1",n(e.doc_quota1)),i("#doc_quota2",n(e.doc_quota2)),i("#doc_quota3",n(e.doc_quota3)),i("#doc_quota4",n(e.doc_quota4));const d=(l,h)=>{const f=this.qs(l);f&&(f.checked=!!h)};d("#doc_iscr",e.doc_iscr),d("#doc_priv",e.doc_priv),d("#doc_san",e.doc_san),d("#doc_liberatoria",e.doc_liberatoria),i("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const c=this.qs("#san_cert_scadenza");if(c&&!c._bound){c._bound=!0;const l=()=>this.updateMedicalStatusBadge(this.currentScout);c.addEventListener("input",l),c.addEventListener("change",l),this.qs("#doc_priv")?.addEventListener("change",l),this.qs("#doc_san")?.addEventListener("change",l)}const r=this.qs("#sendWhatsAppReminderBtn");r&&!r._bound&&(r._bound=!0,r.addEventListener("click",()=>{const l=this.currentScout||{},h=this.qs("#san_cert_scadenza")?.value||"",f=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...l,san_cert_scadenza:h,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,v=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||l.ct_g1_tel||l.anag_telefono||"",y=`${this.qs("#anag_nome")?.value||l.nome||""} ${this.qs("#anag_cognome")?.value||l.cognome||""}`.trim(),x=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:y,scadenzaStr:f?.formattedDate||h,telGenitore:v,certStatus:f?.certStatus||"expiring",missingDocs:f?.missingDocuments||[]}):null;x&&x.url&&window.open(x.url,"_blank")}));const g=this.qs("#scoutForm");g&&!g._bound&&(g._bound=!0,g.addEventListener("submit",async l=>{if(l.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const h=g.querySelector('button[type="submit"]'),f=h?.textContent;this.setButtonLoading(h,!0,f);try{const v=this.collectForm();await DATA.updateScout(a,v,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.showToast("Scheda salvata")}catch(v){console.error("Errore salvataggio scheda:",v),this.showToast("Errore durante il salvataggio: "+(v.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(h,!1,f)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const p=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",p),this.qs("#printMedicalSectionBtn")?.addEventListener("click",p),this.qs("#san_disabilita")?.addEventListener("change",l=>{const h=this.qs("#san_disabilita_note_wrapper");h&&h.classList.toggle("hidden",!l.target.checked)}),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),["1","2","3"].forEach(l=>{const h=e[`cngei_traccia${l}_id`],f=this.qs(`.traccia-header[data-traccia="${l}"]`);if(f){const v=f.querySelector(".cngei-traccia-badge");if(v&&v.remove(),h){const y=document.createElement("span");y.className="cngei-traccia-badge inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs ml-2",y.title="Convalidata su Portale CNGEI",y.textContent="✓ CNGEI";const x=f.querySelector("h4");x&&x.appendChild(y)}}}),document.querySelectorAll(".openCngeiProgModalBtn").forEach(l=>{l._bound||(l._bound=!0,l.addEventListener("click",()=>this.openCngeiProgressioniModal()))});const m=this.qs("#closeCngeiProgModalBtn");m&&!m._bound&&(m._bound=!0,m.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const S=this.qs("#cancelCngeiProgModalBtn");S&&!S._bound&&(S._bound=!0,S.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const _=this.qs("#cngeiProgSelectAllBtn");_&&!_._bound&&(_._bound=!0,_.addEventListener("click",()=>{const l=document.querySelectorAll(".cngei-prog-chk"),h=Array.from(l).some(f=>!f.checked);l.forEach(f=>{f.checked=h})}));const b=this.qs("#confirmSendProgBtn");b&&!b._bound&&(b._bound=!0,b.addEventListener("click",()=>this.sendSelectedProgressioniToCngei())),(t.get("readonly")==="1"||this.getUserRole?.().ruolo==="esploratore")&&this.applyReadOnlyMode(),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.applyReadOnlyMode=function(){const t=this.qs("#scoutForm");t&&t.querySelectorAll("input, select, textarea, button").forEach(n=>{n.tagName==="BUTTON"?!n.classList.contains("tab-nav-btn")&&n.id!=="printScoutBtn"&&n.id!=="printMedicalBtn"&&(n.disabled=!0,n.style.display="none"):(n.disabled=!0,n.setAttribute("readonly","true"),n.classList.add("bg-gray-100","cursor-not-allowed","opacity-80"))});const a=document.querySelector('button[form="scoutForm"]');a&&(a.style.display="none");const e=document.querySelector('a[href="esploratori.html"]');e&&(e.style.display="none");const i=this.qs("#managePattuglieBtn");i&&(i.style.display="none");const o=this.qs("#addSpecialitaBtn");if(o&&(o.style.display="none"),document.querySelectorAll(".openCngeiProgModalBtn").forEach(s=>{s.style.display="none"}),!this.qs("#readonlyBanner")){const s=this.qs("#scoutHeaderContainer");if(s){const n=document.createElement("div");n.id="readonlyBanner",n.className="mt-3 p-2.5 bg-blue-900/60 border border-blue-500/40 rounded-lg text-blue-200 text-xs flex items-center gap-2",n.innerHTML="<span>ℹ️</span> <span>Sei in modalità <strong>visualizzazione</strong> della tua scheda personale (sola lettura).</span>",s.appendChild(n)}}};UI.openCngeiProgressioniModal=async function(){const t=this.currentScout;if(!t)return;const a=this.qs("#cngeiProgressioniModal");if(!a)return;const e=this.qs("#cngeiProgScoutName");if(e){const r=`${t.nome||""} ${t.cognome||""}`.trim()||"Esploratore";e.textContent=`Esploratore: ${r}${t.tesseraCngei?` (Tessera #${t.tesseraCngei})`:""}`}const i=this.qs("#cngeiProgNoIdWarning"),o=this.qs("#confirmSendProgBtn");t.idCngei?(i?.classList.add("hidden"),o&&(o.disabled=!1)):(i?.classList.remove("hidden"),o&&(o.disabled=!0));const s=this.qs("#cngeiProgPendingList"),n=this.qs("#cngeiProgSyncedList"),d=this.qs("#cngeiProgPendingCount"),c=this.qs("#cngeiProgSyncedCount");s&&(s.innerHTML='<div class="text-sm text-slate-500 py-3 text-center">Caricamento progressioni da portale CNGEI...</div>'),n&&(n.innerHTML=""),a.classList.remove("hidden");try{const r=await z.getProgressioniTypes(),g=this.collectSpecialita(),p={...t,specialita:g,pv_traccia1:{done:!!this.qs("#pv_traccia1_chk")?.checked,data:this.qs("#pv_traccia1_dt")?.value||t.pv_traccia1?.data},pv_traccia2:{done:!!this.qs("#pv_traccia2_chk")?.checked,data:this.qs("#pv_traccia2_dt")?.value||t.pv_traccia2?.data},pv_traccia3:{done:!!this.qs("#pv_traccia3_chk")?.checked,data:this.qs("#pv_traccia3_dt")?.value||t.pv_traccia3?.data}};if(t.idCngei)try{const _=await z.getPersona(t.idCngei);if(_?.brevetti&&Array.isArray(_.brevetti)){const{changed:b}=j(p,_.brevetti);if(b){t.specialita=p.specialita,p.cngei_traccia1_id&&(t.cngei_traccia1_id=p.cngei_traccia1_id),p.cngei_traccia2_id&&(t.cngei_traccia2_id=p.cngei_traccia2_id),p.cngei_traccia3_id&&(t.cngei_traccia3_id=p.cngei_traccia3_id),await DATA.updateScout(t.id,t,this.currentUser);try{this.showToast("Progressioni già registrate su CNGEI allineate!",{type:"info",duration:2500})}catch{}}}}catch(_){console.warn("Avviso recupero dati persona CNGEI:",_)}const m=F(p,r),S=G(p,r);d&&(d.textContent=m.length),c&&(c.textContent=S.length),m.length===0?(s&&(s.innerHTML='<div class="text-sm text-slate-500 py-4 text-center">Nessuna progressione o specialità conseguita in attesa di invio.</div>'),o&&(o.disabled=!0)):(o&&t.idCngei&&(o.disabled=!1),s&&(s.innerHTML=m.map((_,b)=>`
          <label class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="cngei-prog-chk w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-index="${b}" checked />
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${_.category.includes("PO")?"bg-amber-100 text-amber-800 border border-amber-200":"bg-blue-100 text-blue-800 border border-blue-200"}">${_.category}</span>
                  <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${_.name}</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">Conseguita il: <strong>${_.obtainedAt}</strong></div>
              </div>
            </div>
            <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-right">
              ✓ Pronto per invio
            </div>
          </label>
        `).join(""))),S.length===0?n&&(n.innerHTML='<div class="text-center py-2 text-slate-400">Nessuna progressione ancora registrata a portale.</div>'):n&&(n.innerHTML=S.map(_=>`
          <div class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-emerald-600">✓</span>
              <span>${_.name} (${_.category})</span>
            </span>
            <span class="text-slate-400 text-[11px]">${_.obtainedAt}</span>
          </div>
        `).join("")),this._pendingProgressioniData=m}catch(r){console.error("Errore recupero tipi progressione CNGEI:",r),s&&(s.innerHTML=`<div class="text-sm text-rose-500 py-3 text-center">Errore connessione CNGEI: ${r.message||"Errore di rete"}</div>`)}};UI.sendSelectedProgressioniToCngei=async function(){const t=this.currentScout;if(!t||!t.idCngei){this.showToast("Esploratore non associato a un ID del portale CNGEI.",{type:"error"});return}const a=Array.from(document.querySelectorAll(".cngei-prog-chk:checked"));if(a.length===0){this.showToast("Nessuna progressione selezionata da inviare.",{type:"info"});return}const e=this.qs("#confirmSendProgBtn"),i=e?.innerHTML;this.setButtonLoading(e,!0,"Invio in corso...");try{let o=0;const s=[],n=Array.isArray(t.specialita)?[...t.specialita]:[];for(const d of a){const c=parseInt(d.dataset.index,10),r=this._pendingProgressioniData?.[c];if(r)try{const p=(await Y(t.idCngei,r.typeId,r.obtainedAt,z))?.id||"synced_"+Date.now();r.indexInArray!==void 0&&n[r.indexInArray]?n[r.indexInArray].idProgressioneCngei=p:r.tracciaKey==="pv_traccia1"?t.cngei_traccia1_id=p:r.tracciaKey==="pv_traccia2"?t.cngei_traccia2_id=p:r.tracciaKey==="pv_traccia3"&&(t.cngei_traccia3_id=p),o++}catch(g){console.error(`Errore invio ${r.name}:`,g),s.push(`${r.name}: ${g.message}`)}}t.specialita=n,await DATA.updateScout(t.id,t,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),s.length>0?this.showToast(`Inviate ${o} progressioni. Errori su: ${s.join(", ")}`,{type:"warning",duration:5e3}):this.showToast(`Sincronizzazione completata (${o} progressioni convalidate su CNGEI)!`),this.closeModal("cngeiProgressioniModal"),await this.renderScoutPage()}catch(o){console.error("Errore sincronizzazione progressioni:",o),this.showToast("Errore durante la sincronizzazione: "+(o.message||"Errore server"),{type:"error"})}finally{this.setButtonLoading(e,!1,i)}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const a=["io","al","mt"];["1","2","3"].forEach(i=>{a.forEach(o=>{const s=`#pv_sfida_${o}_${i}`,n=this.qs(s);if(!n)return;const d=o.toUpperCase(),c=t[i]?.[d]||[];n.innerHTML='<option value="">Seleziona sfida...</option>',c.forEach(r=>{const g=document.createElement("option");g.value=r.code,g.textContent=r.code,n.appendChild(g)}),n.addEventListener("change",()=>{const r=n.value,g=this.qs(`#pv_sfida_${o}_${i}_text`);if(g){const p=c.find(m=>m.code===r);g.value=p?p.text:"",this.autoResizeTextarea(g)}})})})};UI.loadChallengeData=function(t){const a=["io","al","mt"];["1","2","3"].forEach(i=>{a.forEach(o=>{const s=`pv_sfida_${o}_${i}`,n=`pv_sfida_${o}_${i}_data`,d=`pv_sfida_${o}_${i}_text`;let c=t[s],r=t[n];if(!c){const m={io:"io",al:"re",mt:"im"},S={io:"IO",al:"AL",mt:"MT"},_=m[o],b=`pv_sfida_${_}_${i}`,u=t[b];if(u&&typeof u=="string")c=u.replace("-RE-","-AL-").replace("-IM-","-MT-"),r||(r=t[`${b}_data`]);else for(let l=1;l<=4;l++){const h=t[`pv_${_}_${i}${l}`];if(h&&h.done){c=`${i}-${S[o]}-${l}`,!r&&h.data&&(r=h.data);break}}}const g=this.qs(`#pv_sfida_${o}_${i}`),p=this.qs(`#${n}`);this.qs(`#${d}`),g&&c&&(g.value=c,g.dispatchEvent(new Event("change")),setTimeout(()=>{const m=this.qs(`#${d}`);m&&this.autoResizeTextarea(m)},100)),p&&r&&(p.value=this.toYyyyMmDd(r))})})};UI.loadSpecialita=function(t){const a=this.qs("#specialitaContainer");a&&(a.innerHTML="",t.forEach((e,i)=>this.addSpecialita(e,i)))};UI.applySpecialitaColors=function(t,a){if(!t)return;const e="white",i="gray",o=(a?.sfondo_colore||e).toLowerCase(),s=(a?.bordo_colore||i).toLowerCase();t.classList.add("specialita-card"),t.setAttribute("data-sfondo",o),t.setAttribute("data-bordo",s),o==="yellow"?(t.classList.add("specialita-sfondo-yellow"),t.classList.remove("specialita-sfondo-green")):o==="green"?(t.classList.add("specialita-sfondo-green"),t.classList.remove("specialita-sfondo-yellow")):t.classList.remove("specialita-sfondo-yellow","specialita-sfondo-green"),t.style.backgroundColor=a?.sfondo_colore||e,t.style.border=`3px solid ${a?.bordo_colore||i}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,a=null){const e=this.qs("#specialitaContainer");if(!e)return;const i=a!==null?a:e.children.length,o=`sp_${i}`,s=await this.loadSpecialitaList(),n=t?.nome?O(t.nome):"",d=t?.nome&&s?s.find(u=>u.nome===t.nome||u.nome===n):null,c=d?.nome||t?.nome&&String(t.nome).trim()||"",r=c?q(c):"",g=d?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],p=document.createElement("div");p.className="rounded-lg overflow-hidden",p.dataset.idProgressioneCngei=t?.idProgressioneCngei||"",this.applySpecialitaColors(p,d||(t&&(t.sfondo_colore||t.bordo_colore)?t:null)),p.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${i}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <img id="${o}_badge" src="${r?`img/specialita/${r}.png`:""}" alt="Distintivo Specialità" class="w-8 h-8 object-contain rounded-full shadow-sm bg-white p-0.5 border border-gray-200" style="${r?"":"display:none;"}" onerror="this.style.display='none';" />
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
            <img id="${o}_select_badge" src="${r?`img/specialita/${r}.png`:""}" alt="Distintivo Specialità" class="w-10 h-10 object-contain rounded-full shadow-sm bg-white p-1 border border-gray-200 shrink-0" style="${r?"":"display:none;"}" onerror="this.style.display='none';" />
            <select id="${o}_nome" class="input flex-1">
              <option value="">Seleziona specialità...</option>
              ${s.map(u=>`<option value="${u.nome}" ${t?.nome===u.nome||n===u.nome?"selected":""}>${u.nome} (${u.categoria||(u.sfondo_colore==="green"?"Verdi":"Gialle")}${u.ambito?" - "+u.ambito:""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${g.map((u,l)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${u.nome}</label>
                <input id="${o}_${u.id}_data" type="date" class="input" value="${t?.[`${u.id}_data`]?this.toYyyyMmDd(t[`${u.id}_data`]):""}" />
              </div>
              <textarea id="${o}_${u.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${u.text||""}</textarea>
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
  `,e.appendChild(p),setTimeout(()=>{g.forEach(l=>{const h=p.querySelector(`#${o}_${l.id}_text`);h&&this.autoResizeTextarea(h)});const u=p.querySelector(`#${o}_note`);u&&this.autoResizeTextarea(u)},50),p.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{p.remove(),this.renumberSpecialita()});const m=p.querySelector(`#${o}_nome`),S=p.querySelector(`#${o}_title`),_=p.querySelector(`#${o}_badge`),b=p.querySelector(`#${o}_select_badge`);m&&S&&m.addEventListener("change",async()=>{const u=m.value||"";S.textContent=u||"Specialità";const l=u?q(u):"";_&&(l?(_.src=`img/specialita/${l}.png`,_.style.display=""):_.style.display="none"),b&&(l?(b.src=`img/specialita/${l}.png`,b.style.display=""):b.style.display="none");const f=(await this.loadSpecialitaList()).find(v=>v.nome===u);this.applySpecialitaColors(p,f),f&&f.prove&&f.prove.forEach(v=>{const y=p.querySelector(`#${o}_${v.id}_data`);if(y){let w=y.previousElementSibling;for(;w&&w.tagName!=="LABEL";)w=w.previousElementSibling;w&&w.tagName==="LABEL"&&(w.textContent=v.nome)}const x=p.querySelector(`#${o}_${v.id}_text`);x&&(x.value=v.text||"",this.autoResizeTextarea(x))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((a,e)=>{const i=a.querySelector(".removeSpecialitaBtn"),o=a.querySelector(".specialita-header");i&&(i.dataset.index=e),o&&(o.dataset.specialita=e)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const e=Array.from(t.children).map(s=>{const n=s.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",d=g=>{const p=this.qs(`#${n}${g}`);if(!p)return null;const m=p.value?.trim()||"";return m===""?null:m},c=g=>!!this.qs(`#${n}${g}`)?.checked,r={nome:d("_nome")||"",ottenuta:!!this.qs(`#${n}_ott_chk`)?.checked,brevetto:c("_brevetto"),distintivo:c("_distintivo"),data:d("_data"),p1_data:d("_p1_data"),p2_data:d("_p2_data"),p3_data:d("_p3_data"),cr_text:d("_cr_text")||"",cr_data:d("_cr_data"),note:d("_note")||"",idProgressioneCngei:s.dataset.idProgressioneCngei||null};return r._hasData=!!(r.nome.trim()&&(r.ottenuta||r.brevetto||r.distintivo||r.data||r.p1_data||r.p2_data||r.p3_data||r.cr_data||r.cr_text&&r.cr_text.trim()||r.note&&r.note.trim())),r}).filter(s=>s.nome&&s.nome.trim()),i=new Map,o=[];return e.forEach(s=>{const n=s.nome.trim().toLowerCase(),d=i.get(n);if(!d)i.set(n,s),o.push(s);else if(s._hasData&&!d._hasData){const c=o.indexOf(d);c!==-1&&(o[c]=s,i.set(n,s))}else s._hasData,d._hasData}),o.map(({_hasData:s,...n})=>n)};UI.setCheckDate=function(t,a){const e=a?.data?this.toYyyyMmDd(a.data):this.toYyyyMmDd(a),i=a?.done??(a&&typeof a=="object"?!1:!!a),o=a?.brevetto??!1,s=a?.distintivo??!1,n=this.qs(`#${t}_chk`),d=this.qs(`#${t}_dt`),c=this.qs(`#${t}_brevetto`),r=this.qs(`#${t}_distintivo`);n&&(n.checked=!!i),d&&(d.value=e||""),c&&(c.checked=!!o),r&&(r.checked=!!s)};UI.setPair=function(t,a){const e=this.qs(`${t}_dt`),i=this.qs(`${t}_tx`);e&&(e.value=this.toYyyyMmDd(a?.data||a)||""),i&&(i.value=a?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const a=this.toJsDate(t);return isNaN(a)?"":a.toISOString().split("T")[0]};UI.collectForm=function(){const t=c=>this.qs(c)?.value?.trim()||"",a=c=>this.qs(c)?.value||"",e=c=>!!this.qs(c)?.checked,i=c=>({data:t(`${c}_dt`)||null,testo:t(`${c}_tx`)||""}),o=c=>({done:e(`#${c}_chk`),data:t(`#${c}_dt`)||null,brevetto:e(`#${c}_brevetto`),distintivo:e(`#${c}_distintivo`)}),s={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:a("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:a("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:a("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_allergie:t("#san_allergie"),san_intolleranze:t("#san_intolleranze"),san_patologie:t("#san_patologie"),san_disabilita:!!this.qs("#san_disabilita")?.checked,san_disabilita_note:t("#san_disabilita_note"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),ct_med_nome:t("#ct_med_nome"),ct_med_tel:t("#ct_med_tel"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:i("#ev_ce1"),ev_ce2:i("#ev_ce2"),ev_ce3:i("#ev_ce3"),ev_ce4:i("#ev_ce4"),ev_ccp:i("#ev_ccp"),ev_tc1:i("#ev_tc1"),ev_tc2:i("#ev_tc2"),ev_tc3:i("#ev_tc3"),ev_tc4:i("#ev_tc4"),ev_jam:i("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:o("pv_traccia1"),pv_traccia2:o("pv_traccia2"),pv_traccia3:o("pv_traccia3"),doc_quota1:(()=>{const c=t("#doc_quota1");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota2:(()=>{const c=t("#doc_quota2");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota3:(()=>{const c=t("#doc_quota3");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota4:(()=>{const c=t("#doc_quota4");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},n=["io","al","mt"];return["1","2","3"].forEach(c=>{n.forEach(r=>{const g=`pv_sfida_${r}_${c}`,p=`pv_sfida_${r}_${c}_data`;s[g]=t(`#pv_sfida_${r}_${c}`),s[p]=t(`#pv_sfida_${r}_${c}_data`)||null})}),this.currentScout?.idCngei&&(s.idCngei=this.currentScout.idCngei),this.currentScout?.tesseraCngei&&(s.tesseraCngei=this.currentScout.tesseraCngei),this.currentScout?.cngei_traccia1_id&&(s.cngei_traccia1_id=this.currentScout.cngei_traccia1_id),this.currentScout?.cngei_traccia2_id&&(s.cngei_traccia2_id=this.currentScout.cngei_traccia2_id),this.currentScout?.cngei_traccia3_id&&(s.cngei_traccia3_id=this.currentScout.cngei_traccia3_id),s};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const a=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(e=>{const i=document.createElement("option");i.value=e,i.textContent=e,t.appendChild(i)}),a&&this.pattuglie.includes(a)&&(t.value=a)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((a,e)=>{const i=document.createElement("div");i.className="flex items-center justify-between p-2 bg-gray-50 rounded border",i.innerHTML=`
      <input type="text" value="${a}" class="input flex-1 mr-2" data-index="${e}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${e})">
        🗑️
      </button>
    `,t.appendChild(i)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),a=t.value.trim();if(!a){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(a)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(a),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),a=[];if(t.forEach(o=>{const s=o.value.trim();s&&!a.includes(s)&&a.push(s)}),a.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const e=this.qs("#savePattugliaBtn"),i=e.textContent;e.textContent="Salvataggio...",e.disabled=!0;try{this.pattuglie=a,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(o){console.error("Errore salvataggio pattuglie:",o),this.showToast("Errore salvataggio: "+o.message,{type:"error"})}finally{e.textContent=i,e.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",a=>{const e=a.target.closest(".traccia-header");if(!e)return;if(console.log("Click su header traccia:",e.dataset.traccia),a.target.type==="checkbox"||a.target.type==="date"){console.log("Click su input, ignorato");return}const i=e.dataset.traccia;console.log("Toggling traccia:",i),this.toggleTracciaSection(i)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const a=document.querySelector(`.traccia-header[data-traccia="${t}"]`),e=a?.nextElementSibling,i=a?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!a,content:!!e,icon:!!i}),!a||!e||!i){console.error("Elementi non trovati per traccia:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione..."),e.classList.remove("expanded"),i.classList.remove("rotated")):(console.log("Espandendo sezione..."),e.classList.add("expanded"),i.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",i.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",a=>{const e=a.target.closest(".specialita-header");if(!e)return;if(console.log("Click su header specialità:",e.dataset.specialita),a.target.type==="checkbox"||a.target.type==="date"||a.target.tagName==="SELECT"||a.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const i=e.dataset.specialita;console.log("Toggling specialità:",i),this.toggleSpecialitaSection(i)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const a=document.querySelector(`.specialita-header[data-specialita="${t}"]`),e=a?.nextElementSibling,i=a?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!a,content:!!e,icon:!!i}),!a||!e||!i){console.error("Elementi non trovati per specialità:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione specialità..."),e.classList.remove("expanded"),i.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),e.classList.add("expanded"),i.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",i.className)};UI.currentTab="anagrafici";UI.switchTab=function(t,a=!0){if(t||(t="anagrafici"),t=t.toLowerCase().replace("#","").replace("section-",""),document.getElementById(`section-${t}`)||(console.warn(`[Tabs] Sezione section-${t} non trovata, fallback ad anagrafici`),t="anagrafici"),this.currentTab=t,document.querySelectorAll('section[id^="section-"]').forEach(s=>{s.id===`section-${t}`?(s.classList.remove("hidden"),s.classList.add("active"),s.querySelectorAll("textarea").forEach(n=>{typeof this.autoResizeTextarea=="function"&&this.autoResizeTextarea(n)})):(s.classList.add("hidden"),s.classList.remove("active"))}),document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(s=>{(s.dataset.tab||s.getAttribute("href")||"").toLowerCase().replace("#","").replace("section-","")===t?s.classList.add("active"):s.classList.remove("active")}),a&&window.history&&window.history.replaceState)try{history.replaceState(null,"",`#${t}`)}catch{}};UI.initSectionNavigation=function(){document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(i=>{i._tabBound||(i._tabBound=!0,i.addEventListener("click",o=>{o.preventDefault();const s=(i.dataset.tab||i.getAttribute("href")||"").replace("#","").replace("section-","");this.switchTab(s)}))}),document.querySelectorAll("[data-tab-nav]").forEach(i=>{i._tabNavBound||(i._tabNavBound=!0,i.addEventListener("click",o=>{o.preventDefault();const s=i.dataset.tabNav;if(s){this.switchTab(s);const n=document.getElementById("scoutHeaderContainer")||document.getElementById("scoutHeader");n&&typeof n.scrollIntoView=="function"&&n.scrollIntoView({behavior:"smooth",block:"start"})}}))});const a=document.getElementById("scrollTopBtn");a&&!a._bound&&(a._bound=!0,a.addEventListener("click",i=>{i.preventDefault(),typeof window.scrollTo=="function"&&window.scrollTo({top:0,behavior:"smooth"})}));const e=(window.location.hash||"").replace("#","").replace("section-","");e&&document.getElementById(`section-${e}`)?this.switchTab(e,!1):this.switchTab(this.currentTab||"anagrafici",!1),window._scoutTabHashBound||(window._scoutTabHashBound=!0,window.addEventListener("hashchange",()=>{const i=(window.location.hash||"").replace("#","").replace("section-","");i&&document.getElementById(`section-${i}`)&&this.switchTab(i,!1)}))};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},200)});UI.generateScoutSentieroHtml=H;UI._printHtmlInArea=async function(t,a){let e=this.qs?this.qs("#printArea"):document.getElementById("printArea");e||(e=document.createElement("div"),e.id="printArea",e.style.display="none",document.body.appendChild(e)),e.innerHTML=t,e.style.display="block";const i=document.getElementById("app");let o="";i&&(o=i.getAttribute("style")||"",i.style.setProperty("display","none","important"));const s=document.title;document.title=a||s;const n=Array.from(e.querySelectorAll("img"));n.length>0&&(await Promise.all(n.map(r=>r.complete&&r.naturalWidth>0?typeof r.decode=="function"?r.decode().catch(()=>{}):Promise.resolve():new Promise(g=>{let p=!1;const m=()=>{p||(p=!0,typeof r.decode=="function"?r.decode().then(g).catch(g):g())};r.addEventListener("load",m,{once:!0}),r.addEventListener("error",()=>{p||(p=!0,g())},{once:!0}),setTimeout(m,2e3)}))),await new Promise(r=>setTimeout(r,120))),window.print();let d=!1;const c=()=>{d||(d=!0,document.title=s,e.style.display="none",e.innerHTML="",i&&(o?i.setAttribute("style",o):i.removeAttribute("style")))};typeof window<"u"&&("onafterprint"in window||typeof window.addEventListener=="function")?(window.addEventListener("afterprint",c,{once:!0}),setTimeout(c,6e4)):setTimeout(c,2e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.scouts||[]).find(d=>d.id===t);if(!a){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=this.collectForm(),i={...a,specialita:a.specialita||[],nome:e.nome||a.nome,cognome:e.cognome||a.cognome},o=await this.loadChallenges(),s=await this.loadSpecialitaList(),n=this.generateScoutSentieroHtml(i,o,s);this._printHtmlInArea(n,`Il Sentiero di ${i.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.allScouts||this.state.scouts||[]).find(i=>i.id===t);if(!a){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.generateScoutSentieroHtml(a,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(e,`Il Sentiero di ${a.nome||""}`)}catch(a){this.hideLoadingOverlay(),console.error("Errore stampa singola:",a),this.showToast("Errore stampa: "+a.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,a){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.state.allScouts||this.state.scouts||[],i=[];if(t.forEach((o,s)=>{const n=e.find(c=>c.id===o);if(!n)return;let d=this.generateScoutSentieroHtml(n,this.challengesData,this.specialitaListData);s<t.length-1&&(d+='<div style="page-break-after: always;"></div>'),i.push(d)}),i.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(i.join(`
`),a||"Schede Sentiero Reparto")}catch(e){this.hideLoadingOverlay(),console.error("Errore stampa batch:",e),this.showToast("Errore stampa: "+e.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const a=this.qs("#san_cert_status_badge");if(!a)return;const e=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),i=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,o=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,s={...t||{},san_cert_scadenza:e,doc_priv:i,doc_san:o},n=this.getScoutMedicalStatus?this.getScoutMedicalStatus(s):null;n&&(a.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${n.badgeClass}`,a.textContent=`🩺 ${n.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const a=t||{},e=`${a.nome||""} ${a.cognome||""}`.trim()||"Esploratore",i=a.pv_pattuglia||"Reparto",o=a.cp_vcp||"Esploratore",s=a.anag_dob||a.dataNascita;let n="Non indicata",d="";if(s){const C=this.toJsDate?this.toJsDate(s):new Date(s);if(!isNaN(C.getTime())){n=C.toLocaleDateString("it-IT");const U=Date.now()-C.getTime(),R=new Date(U),L=Math.abs(R.getUTCFullYear()-1970);L>=0&&L<100&&(d=` (${L} anni)`)}}const c=a.anag_pob||"-",r=a.anag_cf?a.anag_cf.toUpperCase():"-",g=a.anag_indirizzo||"-",p=a.ct_g1_nome||"Genitore 1",m=a.ct_g1_rel?` (${a.ct_g1_rel})`:"",S=a.ct_g1_tel||a.anag_telefono||"Non specificato",_=a.ct_g2_nome||"Genitore 2",b=a.ct_g2_rel?` (${a.ct_g2_rel})`:"",u=a.ct_g2_tel||"-",l=a.ct_med_nome||"-",h=a.ct_med_tel||"-",f=a.san_gruppo||"N.D.",v=(a.san_allergie||"").trim(),y=(a.san_intolleranze||"").trim(),x=(a.san_patologie||"").trim(),w=!!a.san_disabilita,P=(a.san_disabilita_note||"").trim(),E=(a.san_farmaci||"").trim(),A=(a.san_vaccinazioni||"").trim(),k=a.san_cert_scadenza?this.toJsDate?this.toJsDate(a.san_cert_scadenza).toLocaleDateString("it-IT"):a.san_cert_scadenza:"Non specificata",I=(a.san_cert||"").trim(),T=(a.san_altro||"").trim(),$=this.getScoutMedicalStatus?this.getScoutMedicalStatus(a):null,M=$?$.statusLabel:a.san_cert_scadenza?"Registrato":"Mancante",D=$&&$.color==="green"?"#16a34a":$&&$.color==="yellow"?"#d97706":"#dc2626",B=!!a.doc_priv,N=!!a.doc_san;return`
    <div class="medical-sheet-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 18px 22px; color: #111827; background: #ffffff; box-sizing: border-box; line-height: 1.35; font-size: 12px;">
      
      <!-- INTESTAZIONE SCHEDA -->
      <div style="border-bottom: 2.5px solid #b91c1c; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #b91c1c;">
            ⚜️ CNGEI • Reparto Maori • Cartellina Sanitaria Campo
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
            <strong>Nato il:</strong> ${n}${d} &nbsp;•&nbsp; <strong>A:</strong> ${c}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${r}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${g}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${p}${m}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${S}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${_}${b}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${u}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${l}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 1px;">
              📞 ${h}
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
            ${f}
          </div>
        </div>

        <!-- Allergie -->
        <div style="border: 1.5px solid ${v?"#ef4444":"#e5e7eb"}; background: ${v?"#fef2f2":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${v?"#b91c1c":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>⚠️ Allergie (Farmaci/Cibo/Insetti)</span>
            ${v?'<span style="color:#dc2626; font-weight:900;">ATTENZIONE</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${v?"700":"400"}; color: ${v?"#991b1b":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${v||"Nessuna allergia nota segnalata."}
          </div>
        </div>

        <!-- Intolleranze e Dieta -->
        <div style="border: 1.5px solid ${y?"#f59e0b":"#e5e7eb"}; background: ${y?"#fffbeb":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${y?"#b45309":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>🍽️ Intolleranze & Dieta</span>
            ${y?'<span style="color:#d97706; font-weight:800;">DIETA SPECIFICA</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${y?"700":"400"}; color: ${y?"#92400e":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${y||"Nessuna esigenza alimentare specifica."}
          </div>
          </div>
        </div>
      </div>

      <!-- PATOLOGIE CRONICHE & BSE/DISABILITÀ -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- Patologie croniche -->
        <div style="border: 1.5px solid ${x?"#7c3aed":"#e5e7eb"}; background: ${x?"#f5f3ff":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${x?"#6d28d9":"#4b5563"}; margin-bottom: 4px;">
            🩺 Patologie Croniche
          </div>
          <div style="font-size: 11px; font-weight: ${x?"600":"400"}; color: ${x?"#4c1d95":"#6b7280"}; min-height: 36px;">
            ${x||"Nessuna patologia cronica segnalata."}
          </div>
        </div>

        <!-- BSE / Disabilità -->
        <div style="border: 2px solid ${w?"#2563eb":"#e5e7eb"}; background: ${w?"#eff6ff":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${w?"#1d4ed8":"#4b5563"}; display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>♿ Bisogni Speciali / BSE</span>
            ${w?'<span style="color:#1d4ed8; font-weight:900;">PRESENTE</span>':""}
          </div>
          <div style="font-size: 11px; font-weight: ${w?"600":"400"}; color: ${w?"#1e3a8a":"#6b7280"}; min-height: 36px;">
            ${w?P||"Presenti bisogni speciali — vedi capi reparto per dettagli.":"Nessun bisogno speciale segnalato."}
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
          <div style="font-size: 11px; color: ${E?"#0f172a":"#64748b"}; font-weight: ${E?"600":"400"}; min-height: 36px;">
            ${E||"Nessuna terapia farmacologica continuativa indicata."}
          </div>
        </div>

        <!-- Vaccinazioni & Antitetanica -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
            💉 Vaccinazioni & Richiamo Antitetanica
          </div>
          <div style="font-size: 11px; color: #0f172a; min-height: 36px;">
            ${A||"Regolari secondo calendario vaccinale nazionale."}
          </div>
        </div>
      </div>

      <!-- CERTIFICATO MEDICO & DOCUMENTAZIONE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Certificato Medico Non Agonistico</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span style="font-weight: 800; font-size: 12px; color: ${D};">
              ● ${M}
            </span>
            <span style="color: #475569;">(Scadenza: <strong>${k}</strong>)</span>
          </div>
          ${I?`<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${I}</div>`:""}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Consensi e Altre Indicazioni</div>
          <div style="display: flex; gap: 12px; margin-top: 2px; font-size: 11px;">
            <span>Privacy: <strong>${B?"✅ Depositata":"❌ Mancante"}</strong></span>
            <span>Scheda Firmata: <strong>${N?"✅ Depositata":"❌ Mancante"}</strong></span>
          </div>
          ${T?`<div style="font-size: 10px; color: #475569; margin-top: 2px;">Altro: ${T}</div>`:""}
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
        `),o.document.close())}}catch(a){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",a),this.showToast?.("Errore stampa: "+a.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,a="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).filter(s=>!s.archived),i=t&&t.length>0?t.map(s=>e.find(n=>n.id===s)).filter(Boolean):e.slice().sort((s,n)=>{const d=s.pv_pattuglia||"",c=n.pv_pattuglia||"";if(d!==c)return d.localeCompare(c,"it");const r=s.cognome||"",g=n.cognome||"";return r.localeCompare(g,"it")});if(i.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const o=i.map((s,n)=>{let d=this.generateScoutMedicalSheetHtml(s);return n<i.length-1&&(d+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),d});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(o.join(`
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
