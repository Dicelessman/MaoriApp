import{n as j,f as A,a as H,r as P}from"./date-picker-BMAihnvk.js";/* empty css              */import"./shared-AVwAl92F.js";import{c as z}from"./cngei-service-DZdKacRO.js";import{r as F,c as G,a as Y,s as W}from"./cngei-progressioni-B6r5KadV.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";import"./cngei-sync-Dll_EPIb.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const t=new URLSearchParams(location.search);let i=t.get("id");const o=typeof this.getUserRole=="function"?this.getUserRole():null;if(o&&o.ruolo==="esploratore"&&o.record){const l=o.record.id;if(l&&i!==l){console.warn(`[RBAC scout2] Accesso negato per esploratore a scheda ${i}. Reindirizzamento a ${l}`),location.replace(`scout2.html?id=${l}&readonly=1`);return}const u=this.qs("#mainSidebar")||document.getElementById("mainSidebar");u&&(u.style.display="none");const h=this.qs("#sidebarToggle")||document.getElementById("sidebarToggle");h&&(h.style.display="none")}if(!i){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=i,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(l=>{const u=this.qs(`#${l}`);u&&(u.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());let e=(this.state.allScouts||this.state.scouts||[]).find(l=>l.id===i);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const a=(l,u)=>{const h=this.qs(l);h&&(h.value=u??"")};a("#anag_nome",e.nome),a("#anag_cognome",e.cognome),a("#anag_dob",this.toYyyyMmDd(e.anag_dob)),a("#anag_sesso",e.anag_sesso),a("#anag_cf",e.anag_cf),a("#anag_indirizzo",e.anag_indirizzo),a("#anag_citta",e.anag_citta),a("#anag_email",e.anag_email),a("#anag_telefono",e.anag_telefono),a("#ct_g1_nome",e.ct_g1_nome),a("#ct_g1_tel",e.ct_g1_tel),a("#ct_g1_email",e.ct_g1_email),a("#ct_g2_nome",e.ct_g2_nome),a("#ct_g2_tel",e.ct_g2_tel),a("#ct_g2_email",e.ct_g2_email),a("#san_gruppo",e.san_gruppo),a("#san_allergie",e.san_allergie),a("#san_intolleranze",e.san_intolleranze),a("#san_patologie",e.san_patologie),a("#san_farmaci",e.san_farmaci),a("#san_vaccinazioni",e.san_vaccinazioni),a("#ct_med_nome",e.ct_med_nome),a("#ct_med_tel",e.ct_med_tel),a("#san_cert",e.san_cert),a("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),a("#san_altro",e.san_altro);const s=this.qs("#san_disabilita");if(s){s.checked=!!e.san_disabilita;const l=this.qs("#san_disabilita_note_wrapper");l&&l.classList.toggle("hidden",!e.san_disabilita)}a("#san_disabilita_note",e.san_disabilita_note),a("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const r=e.pv_vcp_cp||"",p=this.qs(`input[name="pv_vcp_cp"][value="${r}"]`);if(p)p.checked=!0;else{const l=this.qs('input[name="pv_vcp_cp"][value=""]');l&&(l.checked=!0)}document.querySelectorAll('input[name="pv_vcp_cp"]').forEach(l=>{if(!l._deselectBound){l._deselectBound=!0;let u=!1;l.addEventListener("mousedown",()=>{u=l.checked}),l.addEventListener("click",()=>{if(u&&l.value!==""){l.checked=!1;const h=this.qs('input[name="pv_vcp_cp"][value=""]');h&&(h.checked=!0)}})}}),a("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),a("#pv_giglio_note",e.pv_giglio_note),a("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const l=["io","al","mt"];["1","2","3"].forEach(h=>{l.forEach(_=>{const w=this.qs(`#pv_sfida_${_}_${h}_text`);w&&this.autoResizeTextarea(w)})})},200),a("#pv_note",e.pv_note),a("#pv_traccia1_note",e.pv_traccia1_note),a("#pv_traccia2_note",e.pv_traccia2_note),a("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(u=>{const h=this.qs(`#${u}`);h&&this.autoResizeTextarea(h)})},250),a("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),a("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),a("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),a("#ev_note",e.ev_note);const n=l=>{if(!l)return"";const u=this.toJsDate(l);return isNaN(u.getTime())?"":u.getFullYear().toString()};a("#doc_quota1",n(e.doc_quota1)),a("#doc_quota2",n(e.doc_quota2)),a("#doc_quota3",n(e.doc_quota3)),a("#doc_quota4",n(e.doc_quota4));const g=(l,u)=>{const h=this.qs(l);h&&(h.checked=!!u)};g("#doc_iscr",e.doc_iscr),g("#doc_priv",e.doc_priv),g("#doc_san",e.doc_san),g("#doc_liberatoria",e.doc_liberatoria),a("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const d=this.qs("#san_cert_scadenza");if(d&&!d._bound){d._bound=!0;const l=()=>this.updateMedicalStatusBadge(this.currentScout);d.addEventListener("input",l),d.addEventListener("change",l),this.qs("#doc_priv")?.addEventListener("change",l),this.qs("#doc_san")?.addEventListener("change",l)}const m=this.qs("#sendWhatsAppReminderBtn");m&&!m._bound&&(m._bound=!0,m.addEventListener("click",()=>{const l=this.currentScout||{},u=this.qs("#san_cert_scadenza")?.value||"",h=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...l,san_cert_scadenza:u,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,_=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||l.ct_g1_tel||l.anag_telefono||"",w=`${this.qs("#anag_nome")?.value||l.nome||""} ${this.qs("#anag_cognome")?.value||l.cognome||""}`.trim(),$=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:w,scadenzaStr:h?.formattedDate||u,telGenitore:_,certStatus:h?.certStatus||"expiring",missingDocs:h?.missingDocuments||[]}):null;$&&$.url&&window.open($.url,"_blank")}));const y=this.qs("#scoutForm");y&&!y._bound&&(y._bound=!0,y.addEventListener("submit",async l=>{if(l.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const u=y.querySelector('button[type="submit"]'),h=u?.textContent;this.setButtonLoading(u,!0,h);try{const _=this.collectForm();await DATA.updateScout(i,_,this.currentUser),await this.syncDeliveredBadgesWithScorte(e,_),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),e=(this.state.allScouts||this.state.scouts||[]).find(w=>w.id===i)||e,this.currentScout=e,this.showToast("Scheda salvata")}catch(_){console.error("Errore salvataggio scheda:",_),this.showToast("Errore durante il salvataggio: "+(_.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(u,!1,h)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const v=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",v),this.qs("#printMedicalSectionBtn")?.addEventListener("click",v),this.qs("#san_disabilita")?.addEventListener("change",l=>{const u=this.qs("#san_disabilita_note_wrapper");u&&u.classList.toggle("hidden",!l.target.checked)}),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),["1","2","3"].forEach(l=>{const u=e[`cngei_traccia${l}_id`],h=this.qs(`.traccia-header[data-traccia="${l}"]`);if(h){const _=h.querySelector(".cngei-traccia-badge");if(_&&_.remove(),u){const w=document.createElement("span");w.className="cngei-traccia-badge inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs ml-2",w.title="Convalidata su Portale CNGEI",w.textContent="✓ CNGEI";const $=h.querySelector("h4");$&&$.appendChild(w)}}}),document.querySelectorAll(".openCngeiProgModalBtn").forEach(l=>{l._bound||(l._bound=!0,l.addEventListener("click",()=>this.openCngeiProgressioniModal()))});const x=this.qs("#closeCngeiProgModalBtn");x&&!x._bound&&(x._bound=!0,x.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const f=this.qs("#cancelCngeiProgModalBtn");f&&!f._bound&&(f._bound=!0,f.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const b=this.qs("#cngeiProgSelectAllBtn");b&&!b._bound&&(b._bound=!0,b.addEventListener("click",()=>{const l=document.querySelectorAll(".cngei-prog-chk"),u=Array.from(l).some(h=>!h.checked);l.forEach(h=>{h.checked=u})}));const S=this.qs("#confirmSendProgBtn");S&&!S._bound&&(S._bound=!0,S.addEventListener("click",()=>this.sendSelectedProgressioniToCngei())),(t.get("readonly")==="1"||this.getUserRole?.().ruolo==="esploratore")&&this.applyReadOnlyMode(),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.applyReadOnlyMode=function(){const t=this.qs("#scoutForm");t&&t.querySelectorAll("input, select, textarea, button").forEach(r=>{r.tagName==="BUTTON"?!r.classList.contains("tab-nav-btn")&&r.id!=="printScoutBtn"&&r.id!=="printMedicalBtn"&&(r.disabled=!0,r.style.display="none"):(r.disabled=!0,r.setAttribute("readonly","true"),r.classList.add("bg-gray-100","cursor-not-allowed","opacity-80"))});const i=document.querySelector('button[form="scoutForm"]');i&&(i.style.display="none");const o=document.querySelector('a[href="esploratori.html"]');o&&(o.style.display="none");const e=this.qs("#managePattuglieBtn");e&&(e.style.display="none");const a=this.qs("#addSpecialitaBtn");if(a&&(a.style.display="none"),document.querySelectorAll(".openCngeiProgModalBtn").forEach(s=>{s.style.display="none"}),!this.qs("#readonlyBanner")){const s=this.qs("#scoutHeaderContainer");if(s){const r=document.createElement("div");r.id="readonlyBanner",r.className="mt-3 p-2.5 bg-blue-900/60 border border-blue-500/40 rounded-lg text-blue-200 text-xs flex items-center gap-2",r.innerHTML="<span>ℹ️</span> <span>Sei in modalità <strong>visualizzazione</strong> della tua scheda personale (sola lettura).</span>",s.appendChild(r)}}};UI.openCngeiProgressioniModal=async function(){const t=this.currentScout;if(!t)return;const i=this.qs("#cngeiProgressioniModal");if(!i)return;const o=this.qs("#cngeiProgScoutName");if(o){const n=`${t.nome||""} ${t.cognome||""}`.trim()||"Esploratore";o.textContent=`Esploratore: ${n}${t.tesseraCngei?` (Tessera #${t.tesseraCngei})`:""}`}const e=this.qs("#cngeiProgNoIdWarning"),a=this.qs("#confirmSendProgBtn");t.idCngei?(e?.classList.add("hidden"),a&&(a.disabled=!1)):(e?.classList.remove("hidden"),a&&(a.disabled=!0));const s=this.qs("#cngeiProgPendingList"),r=this.qs("#cngeiProgSyncedList"),p=this.qs("#cngeiProgPendingCount"),c=this.qs("#cngeiProgSyncedCount");s&&(s.innerHTML='<div class="text-sm text-slate-500 py-3 text-center">Caricamento progressioni da portale CNGEI...</div>'),r&&(r.innerHTML=""),i.classList.remove("hidden");try{const n=await z.getProgressioniTypes(),g=this.collectSpecialita(),d={...t,specialita:g,pv_traccia1:{done:!!this.qs("#pv_traccia1_chk")?.checked,data:this.qs("#pv_traccia1_dt")?.value||t.pv_traccia1?.data},pv_traccia2:{done:!!this.qs("#pv_traccia2_chk")?.checked,data:this.qs("#pv_traccia2_dt")?.value||t.pv_traccia2?.data},pv_traccia3:{done:!!this.qs("#pv_traccia3_chk")?.checked,data:this.qs("#pv_traccia3_dt")?.value||t.pv_traccia3?.data}};if(t.idCngei)try{const v=await z.getPersona(t.idCngei);if(v?.brevetti&&Array.isArray(v.brevetti)){const{changed:x}=F(d,v.brevetti);if(x){t.specialita=d.specialita,d.cngei_traccia1_id&&(t.cngei_traccia1_id=d.cngei_traccia1_id),d.cngei_traccia2_id&&(t.cngei_traccia2_id=d.cngei_traccia2_id),d.cngei_traccia3_id&&(t.cngei_traccia3_id=d.cngei_traccia3_id),await DATA.updateScout(t.id,t,this.currentUser);try{this.showToast("Progressioni già registrate su CNGEI allineate!",{type:"info",duration:2500})}catch{}}}}catch(v){console.warn("Avviso recupero dati persona CNGEI:",v)}const m=G(d,n),y=Y(d,n);p&&(p.textContent=m.length),c&&(c.textContent=y.length),m.length===0?(s&&(s.innerHTML='<div class="text-sm text-slate-500 py-4 text-center">Nessuna progressione o specialità conseguita in attesa di invio.</div>'),a&&(a.disabled=!0)):(a&&t.idCngei&&(a.disabled=!1),s&&(s.innerHTML=m.map((v,x)=>`
          <label class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="cngei-prog-chk w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-index="${x}" checked />
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${v.category.includes("PO")?"bg-amber-100 text-amber-800 border border-amber-200":"bg-blue-100 text-blue-800 border border-blue-200"}">${v.category}</span>
                  <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${v.name}</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">Conseguita il: <strong>${v.obtainedAt}</strong></div>
              </div>
            </div>
            <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-right">
              ✓ Pronto per invio
            </div>
          </label>
        `).join(""))),y.length===0?r&&(r.innerHTML='<div class="text-center py-2 text-slate-400">Nessuna progressione ancora registrata a portale.</div>'):r&&(r.innerHTML=y.map(v=>`
          <div class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-emerald-600">✓</span>
              <span>${v.name} (${v.category})</span>
            </span>
            <span class="text-slate-400 text-[11px]">${v.obtainedAt}</span>
          </div>
        `).join("")),this._pendingProgressioniData=m}catch(n){console.error("Errore recupero tipi progressione CNGEI:",n),s&&(s.innerHTML=`<div class="text-sm text-rose-500 py-3 text-center">Errore connessione CNGEI: ${n.message||"Errore di rete"}</div>`)}};UI.sendSelectedProgressioniToCngei=async function(){const t=this.currentScout;if(!t||!t.idCngei){this.showToast("Esploratore non associato a un ID del portale CNGEI.",{type:"error"});return}const i=Array.from(document.querySelectorAll(".cngei-prog-chk:checked"));if(i.length===0){this.showToast("Nessuna progressione selezionata da inviare.",{type:"info"});return}const o=this.qs("#confirmSendProgBtn"),e=o?.innerHTML;this.setButtonLoading(o,!0,"Invio in corso...");try{let a=0;const s=[],r=Array.isArray(t.specialita)?[...t.specialita]:[];for(const p of i){const c=parseInt(p.dataset.index,10),n=this._pendingProgressioniData?.[c];if(n)try{const d=(await W(t.idCngei,n.typeId,n.obtainedAt,z))?.id||"synced_"+Date.now();n.indexInArray!==void 0&&r[n.indexInArray]?r[n.indexInArray].idProgressioneCngei=d:n.tracciaKey==="pv_traccia1"?t.cngei_traccia1_id=d:n.tracciaKey==="pv_traccia2"?t.cngei_traccia2_id=d:n.tracciaKey==="pv_traccia3"&&(t.cngei_traccia3_id=d),a++}catch(g){console.error(`Errore invio ${n.name}:`,g),s.push(`${n.name}: ${g.message}`)}}t.specialita=r,await DATA.updateScout(t.id,t,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),s.length>0?this.showToast(`Inviate ${a} progressioni. Errori su: ${s.join(", ")}`,{type:"warning",duration:5e3}):this.showToast(`Sincronizzazione completata (${a} progressioni convalidate su CNGEI)!`),this.closeModal("cngeiProgressioniModal"),await this.renderScoutPage()}catch(a){console.error("Errore sincronizzazione progressioni:",a),this.showToast("Errore durante la sincronizzazione: "+(a.message||"Errore server"),{type:"error"})}finally{this.setButtonLoading(o,!1,e)}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const i=["io","al","mt"];["1","2","3"].forEach(e=>{i.forEach(a=>{const s=`#pv_sfida_${a}_${e}`,r=this.qs(s);if(!r)return;const p=a.toUpperCase(),c=t[e]?.[p]||[];r.innerHTML='<option value="">Seleziona sfida...</option>',c.forEach(n=>{const g=document.createElement("option");g.value=n.code,g.textContent=n.code,r.appendChild(g)}),r.addEventListener("change",()=>{const n=r.value,g=this.qs(`#pv_sfida_${a}_${e}_text`);if(g){const d=c.find(m=>m.code===n);g.value=d?d.text:"",this.autoResizeTextarea(g)}})})})};UI.loadChallengeData=function(t){const i=["io","al","mt"];["1","2","3"].forEach(e=>{i.forEach(a=>{const s=`pv_sfida_${a}_${e}`,r=`pv_sfida_${a}_${e}_data`,p=`pv_sfida_${a}_${e}_text`;let c=t[s],n=t[r];if(!c){const m={io:"io",al:"re",mt:"im"},y={io:"IO",al:"AL",mt:"MT"},v=m[a],x=`pv_sfida_${v}_${e}`,f=t[x];if(f&&typeof f=="string")c=f.replace("-RE-","-AL-").replace("-IM-","-MT-"),n||(n=t[`${x}_data`]);else for(let b=1;b<=4;b++){const S=t[`pv_${v}_${e}${b}`];if(S&&S.done){c=`${e}-${y[a]}-${b}`,!n&&S.data&&(n=S.data);break}}}const g=this.qs(`#pv_sfida_${a}_${e}`),d=this.qs(`#${r}`);this.qs(`#${p}`),g&&c&&(g.value=c,g.dispatchEvent(new Event("change")),setTimeout(()=>{const m=this.qs(`#${p}`);m&&this.autoResizeTextarea(m)},100)),d&&n&&(d.value=this.toYyyyMmDd(n))})})};UI.loadSpecialita=function(t){const i=this.qs("#specialitaContainer");i&&(i.innerHTML="",t.forEach((o,e)=>this.addSpecialita(o,e)))};UI.applySpecialitaColors=function(t,i){if(!t)return;const o="white",e="gray",a=(i?.sfondo_colore||o).toLowerCase(),s=(i?.bordo_colore||e).toLowerCase();t.classList.add("specialita-card"),t.setAttribute("data-sfondo",a),t.setAttribute("data-bordo",s),a==="yellow"?(t.classList.add("specialita-sfondo-yellow"),t.classList.remove("specialita-sfondo-green")):a==="green"?(t.classList.add("specialita-sfondo-green"),t.classList.remove("specialita-sfondo-yellow")):t.classList.remove("specialita-sfondo-yellow","specialita-sfondo-green"),t.style.backgroundColor=i?.sfondo_colore||o,t.style.border=`3px solid ${i?.bordo_colore||e}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,i=null){const o=this.qs("#specialitaContainer");if(!o)return;const e=i!==null?i:o.children.length,a=`sp_${e}`,s=await this.loadSpecialitaList(),r=t?.nome?j(t.nome):"",p=t?.nome&&s?s.find(f=>f.nome===t.nome||f.nome===r):null,c=p?.nome||t?.nome&&String(t.nome).trim()||"",n=c?A(c):"",g=p?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],d=document.createElement("div");d.className="rounded-lg overflow-hidden",d.dataset.idProgressioneCngei=t?.idProgressioneCngei||"",this.applySpecialitaColors(d,p||(t&&(t.sfondo_colore||t.bordo_colore)?t:null)),d.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${e}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <img id="${a}_badge" src="${n?`img/specialita/${n}.png`:""}" alt="Distintivo Specialità" class="w-8 h-8 object-contain rounded-full shadow-sm bg-white p-0.5 border border-gray-200" style="${n?"":"display:none;"}" onerror="this.style.display='none';" />
            <h4 class="font-semibold text-lg flex items-center gap-2">
              <span id="${a}_title">${p?.nome||t?.nome&&String(t.nome).trim()||"Specialità"}</span>
              ${t?.idProgressioneCngei?'<span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs" title="Sincronizzata con portale CNGEI">✓ CNGEI</span>':""}
            </h4>
          </div>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${a}_ott_chk" ${t?.ottenuta?"checked":""} />
            <span>Ottenuta</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${a}_brevetto" ${t?.brevetto?"checked":""} />
            <span>Brevetto</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${a}_distintivo" ${t?.distintivo?"checked":""} />
            <span>Distintivo</span>
          </label>
          <input id="${a}_data" type="date" class="input" value="${t?.data?this.toYyyyMmDd(t.data):""}" placeholder="Data" />
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="removeSpecialitaBtn text-red-600 hover:text-red-800" data-index="${e}">🗑️</button>
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
            <img id="${a}_select_badge" src="${n?`img/specialita/${n}.png`:""}" alt="Distintivo Specialità" class="w-10 h-10 object-contain rounded-full shadow-sm bg-white p-1 border border-gray-200 shrink-0" style="${n?"":"display:none;"}" onerror="this.style.display='none';" />
            <select id="${a}_nome" class="input flex-1">
              <option value="">Seleziona specialità...</option>
              ${s.map(f=>`<option value="${f.nome}" ${t?.nome===f.nome||r===f.nome?"selected":""}>${f.nome} (${f.categoria||(f.sfondo_colore==="green"?"Verdi":"Gialle")}${f.ambito?" - "+f.ambito:""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${g.map((f,b)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${f.nome}</label>
                <input id="${a}_${f.id}_data" type="date" class="input" value="${t?.[`${f.id}_data`]?this.toYyyyMmDd(t[`${f.id}_data`]):""}" />
              </div>
              <textarea id="${a}_${f.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${f.text||""}</textarea>
            </div>
          `).join("")}
        </div>
        <div class="md:col-span-2 grid grid-cols-2 gap-2">
          <label class="block text-sm">Prova CR</label>
          <input id="${a}_cr_text" type="text" class="input" value="${t?.cr_text||""}" placeholder="Testo prova CR" />
          <label class="block text-sm">Data Prova CR</label>
          <input id="${a}_cr_data" type="date" class="input" value="${t?.cr_data?this.toYyyyMmDd(t.cr_data):""}" />
        </div>
        <div class="md:col-span-2"><label class="block text-sm">Note</label><textarea id="${a}_note" class="textarea textarea-auto-resize">${t?.note||""}</textarea></div>
      </div>
    </div>
  `,o.appendChild(d),setTimeout(()=>{g.forEach(b=>{const S=d.querySelector(`#${a}_${b.id}_text`);S&&this.autoResizeTextarea(S)});const f=d.querySelector(`#${a}_note`);f&&this.autoResizeTextarea(f)},50),d.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{d.remove(),this.renumberSpecialita()});const m=d.querySelector(`#${a}_nome`),y=d.querySelector(`#${a}_title`),v=d.querySelector(`#${a}_badge`),x=d.querySelector(`#${a}_select_badge`);m&&y&&m.addEventListener("change",async()=>{const f=m.value||"";y.textContent=f||"Specialità";const b=f?A(f):"";v&&(b?(v.src=`img/specialita/${b}.png`,v.style.display=""):v.style.display="none"),x&&(b?(x.src=`img/specialita/${b}.png`,x.style.display=""):x.style.display="none");const E=(await this.loadSpecialitaList()).find(l=>l.nome===f);this.applySpecialitaColors(d,E),E&&E.prove&&E.prove.forEach(l=>{const u=d.querySelector(`#${a}_${l.id}_data`);if(u){let _=u.previousElementSibling;for(;_&&_.tagName!=="LABEL";)_=_.previousElementSibling;_&&_.tagName==="LABEL"&&(_.textContent=l.nome)}const h=d.querySelector(`#${a}_${l.id}_text`);h&&(h.value=l.text||"",this.autoResizeTextarea(h))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((i,o)=>{const e=i.querySelector(".removeSpecialitaBtn"),a=i.querySelector(".specialita-header");e&&(e.dataset.index=o),a&&(a.dataset.specialita=o)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const o=Array.from(t.children).map(s=>{const r=s.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",p=g=>{const d=this.qs(`#${r}${g}`);if(!d)return null;const m=d.value?.trim()||"";return m===""?null:m},c=g=>!!this.qs(`#${r}${g}`)?.checked,n={nome:p("_nome")||"",ottenuta:!!this.qs(`#${r}_ott_chk`)?.checked,brevetto:c("_brevetto"),distintivo:c("_distintivo"),data:p("_data"),p1_data:p("_p1_data"),p2_data:p("_p2_data"),p3_data:p("_p3_data"),cr_text:p("_cr_text")||"",cr_data:p("_cr_data"),note:p("_note")||"",idProgressioneCngei:s.dataset.idProgressioneCngei||null};return n._hasData=!!(n.nome.trim()&&(n.ottenuta||n.brevetto||n.distintivo||n.data||n.p1_data||n.p2_data||n.p3_data||n.cr_data||n.cr_text&&n.cr_text.trim()||n.note&&n.note.trim())),n}).filter(s=>s.nome&&s.nome.trim()),e=new Map,a=[];return o.forEach(s=>{const r=s.nome.trim().toLowerCase(),p=e.get(r);if(!p)e.set(r,s),a.push(s);else if(s._hasData&&!p._hasData){const c=a.indexOf(p);c!==-1&&(a[c]=s,e.set(r,s))}else s._hasData,p._hasData}),a.map(({_hasData:s,...r})=>r)};UI.setCheckDate=function(t,i){const o=i?.data?this.toYyyyMmDd(i.data):this.toYyyyMmDd(i),e=i?.done??(i&&typeof i=="object"?!1:!!i),a=i?.brevetto??!1,s=i?.distintivo??!1,r=this.qs(`#${t}_chk`),p=this.qs(`#${t}_dt`),c=this.qs(`#${t}_brevetto`),n=this.qs(`#${t}_distintivo`);r&&(r.checked=!!e),p&&(p.value=o||""),c&&(c.checked=!!a),n&&(n.checked=!!s)};UI.setPair=function(t,i){const o=this.qs(`${t}_dt`),e=this.qs(`${t}_tx`);o&&(o.value=this.toYyyyMmDd(i?.data||i)||""),e&&(e.value=i?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const i=this.toJsDate(t);return isNaN(i)?"":i.toISOString().split("T")[0]};UI.collectForm=function(){const t=c=>this.qs(c)?.value?.trim()||"",i=c=>this.qs(c)?.value||"",o=c=>!!this.qs(c)?.checked,e=c=>({data:t(`${c}_dt`)||null,testo:t(`${c}_tx`)||""}),a=c=>({done:o(`#${c}_chk`),data:t(`#${c}_dt`)||null,brevetto:o(`#${c}_brevetto`),distintivo:o(`#${c}_distintivo`)}),s={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:i("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:i("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:i("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_allergie:t("#san_allergie"),san_intolleranze:t("#san_intolleranze"),san_patologie:t("#san_patologie"),san_disabilita:!!this.qs("#san_disabilita")?.checked,san_disabilita_note:t("#san_disabilita_note"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),ct_med_nome:t("#ct_med_nome"),ct_med_tel:t("#ct_med_tel"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:e("#ev_ce1"),ev_ce2:e("#ev_ce2"),ev_ce3:e("#ev_ce3"),ev_ce4:e("#ev_ce4"),ev_ccp:e("#ev_ccp"),ev_tc1:e("#ev_tc1"),ev_tc2:e("#ev_tc2"),ev_tc3:e("#ev_tc3"),ev_tc4:e("#ev_tc4"),ev_jam:e("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:a("pv_traccia1"),pv_traccia2:a("pv_traccia2"),pv_traccia3:a("pv_traccia3"),doc_quota1:(()=>{const c=t("#doc_quota1");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota2:(()=>{const c=t("#doc_quota2");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota3:(()=>{const c=t("#doc_quota3");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota4:(()=>{const c=t("#doc_quota4");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},r=["io","al","mt"];return["1","2","3"].forEach(c=>{r.forEach(n=>{const g=`pv_sfida_${n}_${c}`,d=`pv_sfida_${n}_${c}_data`;s[g]=t(`#pv_sfida_${n}_${c}`),s[d]=t(`#pv_sfida_${n}_${c}_data`)||null})}),this.currentScout?.idCngei&&(s.idCngei=this.currentScout.idCngei),this.currentScout?.tesseraCngei&&(s.tesseraCngei=this.currentScout.tesseraCngei),this.currentScout?.cngei_traccia1_id&&(s.cngei_traccia1_id=this.currentScout.cngei_traccia1_id),this.currentScout?.cngei_traccia2_id&&(s.cngei_traccia2_id=this.currentScout.cngei_traccia2_id),this.currentScout?.cngei_traccia3_id&&(s.cngei_traccia3_id=this.currentScout.cngei_traccia3_id),s};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const i=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(o=>{const e=document.createElement("option");e.value=o,e.textContent=o,t.appendChild(e)}),i&&this.pattuglie.includes(i)&&(t.value=i)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((i,o)=>{const e=document.createElement("div");e.className="flex items-center justify-between p-2 bg-gray-50 rounded border",e.innerHTML=`
      <input type="text" value="${i}" class="input flex-1 mr-2" data-index="${o}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${o})">
        🗑️
      </button>
    `,t.appendChild(e)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),i=t.value.trim();if(!i){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(i)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(i),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),i=[];if(t.forEach(a=>{const s=a.value.trim();s&&!i.includes(s)&&i.push(s)}),i.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const o=this.qs("#savePattugliaBtn"),e=o.textContent;o.textContent="Salvataggio...",o.disabled=!0;try{this.pattuglie=i,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(a){console.error("Errore salvataggio pattuglie:",a),this.showToast("Errore salvataggio: "+a.message,{type:"error"})}finally{o.textContent=e,o.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",i=>{const o=i.target.closest(".traccia-header");if(!o)return;if(console.log("Click su header traccia:",o.dataset.traccia),i.target.type==="checkbox"||i.target.type==="date"){console.log("Click su input, ignorato");return}const e=o.dataset.traccia;console.log("Toggling traccia:",e),this.toggleTracciaSection(e)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const i=document.querySelector(`.traccia-header[data-traccia="${t}"]`),o=i?.nextElementSibling,e=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!o,icon:!!e}),!i||!o||!e){console.error("Elementi non trovati per traccia:",t);return}const a=o.classList.contains("expanded");console.log("Stato attuale - espanso:",a),a?(console.log("Contraendo sezione..."),o.classList.remove("expanded"),e.classList.remove("rotated")):(console.log("Espandendo sezione..."),o.classList.add("expanded"),e.classList.add("rotated")),console.log("Classi finali content:",o.className),console.log("Classi finali icon:",e.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",i=>{const o=i.target.closest(".specialita-header");if(!o)return;if(console.log("Click su header specialità:",o.dataset.specialita),i.target.type==="checkbox"||i.target.type==="date"||i.target.tagName==="SELECT"||i.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const e=o.dataset.specialita;console.log("Toggling specialità:",e),this.toggleSpecialitaSection(e)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const i=document.querySelector(`.specialita-header[data-specialita="${t}"]`),o=i?.nextElementSibling,e=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!o,icon:!!e}),!i||!o||!e){console.error("Elementi non trovati per specialità:",t);return}const a=o.classList.contains("expanded");console.log("Stato attuale - espanso:",a),a?(console.log("Contraendo sezione specialità..."),o.classList.remove("expanded"),e.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),o.classList.add("expanded"),e.classList.add("rotated")),console.log("Classi finali content:",o.className),console.log("Classi finali icon:",e.className)};UI.currentTab="anagrafici";UI.switchTab=function(t,i=!0){if(t||(t="anagrafici"),t=t.toLowerCase().replace("#","").replace("section-",""),document.getElementById(`section-${t}`)||(console.warn(`[Tabs] Sezione section-${t} non trovata, fallback ad anagrafici`),t="anagrafici"),this.currentTab=t,document.querySelectorAll('section[id^="section-"]').forEach(s=>{s.id===`section-${t}`?(s.classList.remove("hidden"),s.classList.add("active"),s.querySelectorAll("textarea").forEach(r=>{typeof this.autoResizeTextarea=="function"&&this.autoResizeTextarea(r)})):(s.classList.add("hidden"),s.classList.remove("active"))}),document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(s=>{(s.dataset.tab||s.getAttribute("href")||"").toLowerCase().replace("#","").replace("section-","")===t?s.classList.add("active"):s.classList.remove("active")}),i&&window.history&&window.history.replaceState)try{history.replaceState(null,"",`#${t}`)}catch{}};UI.initSectionNavigation=function(){document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(e=>{e._tabBound||(e._tabBound=!0,e.addEventListener("click",a=>{a.preventDefault();const s=(e.dataset.tab||e.getAttribute("href")||"").replace("#","").replace("section-","");this.switchTab(s)}))}),document.querySelectorAll("[data-tab-nav]").forEach(e=>{e._tabNavBound||(e._tabNavBound=!0,e.addEventListener("click",a=>{a.preventDefault();const s=e.dataset.tabNav;if(s){this.switchTab(s);const r=document.getElementById("scoutHeaderContainer")||document.getElementById("scoutHeader");r&&typeof r.scrollIntoView=="function"&&r.scrollIntoView({behavior:"smooth",block:"start"})}}))});const i=document.getElementById("scrollTopBtn");i&&!i._bound&&(i._bound=!0,i.addEventListener("click",e=>{e.preventDefault(),typeof window.scrollTo=="function"&&window.scrollTo({top:0,behavior:"smooth"})}));const o=(window.location.hash||"").replace("#","").replace("section-","");o&&document.getElementById(`section-${o}`)?this.switchTab(o,!1):this.switchTab(this.currentTab||"anagrafici",!1),window._scoutTabHashBound||(window._scoutTabHashBound=!0,window.addEventListener("hashchange",()=>{const e=(window.location.hash||"").replace("#","").replace("section-","");e&&document.getElementById(`section-${e}`)&&this.switchTab(e,!1)}))};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},200)});UI.generateScoutSentieroHtml=H;UI._printHtmlInArea=async function(t,i){let o=this.qs?this.qs("#printArea"):document.getElementById("printArea");o||(o=document.createElement("div"),o.id="printArea",o.style.display="none",document.body.appendChild(o)),o.innerHTML=t,o.style.display="block";const e=document.getElementById("app");let a="";e&&(a=e.getAttribute("style")||"",e.style.setProperty("display","none","important"));const s=document.title;document.title=i||s;const r=Array.from(o.querySelectorAll("img"));r.length>0&&(await Promise.all(r.map(n=>n.complete&&n.naturalWidth>0?typeof n.decode=="function"?n.decode().catch(()=>{}):Promise.resolve():new Promise(g=>{let d=!1;const m=()=>{d||(d=!0,typeof n.decode=="function"?n.decode().then(g).catch(g):g())};n.addEventListener("load",m,{once:!0}),n.addEventListener("error",()=>{d||(d=!0,g())},{once:!0}),setTimeout(m,2e3)}))),await new Promise(n=>setTimeout(n,120))),window.print();let p=!1;const c=()=>{p||(p=!0,document.title=s,o.style.display="none",o.innerHTML="",e&&(a?e.setAttribute("style",a):e.removeAttribute("style")))};typeof window<"u"&&("onafterprint"in window||typeof window.addEventListener=="function")?(window.addEventListener("afterprint",c,{once:!0}),setTimeout(c,6e4)):setTimeout(c,2e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(p=>p.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const o=this.collectForm(),e={...i,specialita:i.specialita||[],nome:o.nome||i.nome,cognome:o.cognome||i.cognome},a=await this.loadChallenges(),s=await this.loadSpecialitaList(),r=this.generateScoutSentieroHtml(e,a,s);this._printHtmlInArea(r,`Il Sentiero di ${e.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.allScouts||this.state.scouts||[]).find(e=>e.id===t);if(!i){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const o=this.generateScoutSentieroHtml(i,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(o,`Il Sentiero di ${i.nome||""}`)}catch(i){this.hideLoadingOverlay(),console.error("Errore stampa singola:",i),this.showToast("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,i){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const o=this.state.allScouts||this.state.scouts||[],e=[];if(t.forEach((a,s)=>{const r=o.find(c=>c.id===a);if(!r)return;let p=this.generateScoutSentieroHtml(r,this.challengesData,this.specialitaListData);s<t.length-1&&(p+='<div style="page-break-after: always;"></div>'),e.push(p)}),e.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(e.join(`
`),i||"Schede Sentiero Reparto")}catch(o){this.hideLoadingOverlay(),console.error("Errore stampa batch:",o),this.showToast("Errore stampa: "+o.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const i=this.qs("#san_cert_status_badge");if(!i)return;const o=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),e=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,a=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,s={...t||{},san_cert_scadenza:o,doc_priv:e,doc_san:a},r=this.getScoutMedicalStatus?this.getScoutMedicalStatus(s):null;r&&(i.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${r.badgeClass}`,i.textContent=`🩺 ${r.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const i=t||{},o=`${i.nome||""} ${i.cognome||""}`.trim()||"Esploratore",e=i.pv_pattuglia||"Reparto",a=i.cp_vcp||"Esploratore",s=i.anag_dob||i.dataNascita;let r="Non indicata",p="";if(s){const L=this.toJsDate?this.toJsDate(s):new Date(s);if(!isNaN(L.getTime())){r=L.toLocaleDateString("it-IT");const R=Date.now()-L.getTime(),O=new Date(R),T=Math.abs(O.getUTCFullYear()-1970);T>=0&&T<100&&(p=` (${T} anni)`)}}const c=i.anag_pob||"-",n=i.anag_cf?i.anag_cf.toUpperCase():"-",g=i.anag_indirizzo||"-",d=i.ct_g1_nome||"Genitore 1",m=i.ct_g1_rel?` (${i.ct_g1_rel})`:"",y=i.ct_g1_tel||i.anag_telefono||"Non specificato",v=i.ct_g2_nome||"Genitore 2",x=i.ct_g2_rel?` (${i.ct_g2_rel})`:"",f=i.ct_g2_tel||"-",b=i.ct_med_nome||"-",S=i.ct_med_tel||"-",E=i.san_gruppo||"N.D.",l=(i.san_allergie||"").trim(),u=(i.san_intolleranze||"").trim(),h=(i.san_patologie||"").trim(),_=!!i.san_disabilita,w=(i.san_disabilita_note||"").trim(),$=(i.san_farmaci||"").trim(),k=(i.san_vaccinazioni||"").trim(),D=i.san_cert_scadenza?this.toJsDate?this.toJsDate(i.san_cert_scadenza).toLocaleDateString("it-IT"):i.san_cert_scadenza:"Non specificata",I=(i.san_cert||"").trim(),q=(i.san_altro||"").trim(),C=this.getScoutMedicalStatus?this.getScoutMedicalStatus(i):null,M=C?C.statusLabel:i.san_cert_scadenza?"Registrato":"Mancante",B=C&&C.color==="green"?"#16a34a":C&&C.color==="yellow"?"#d97706":"#dc2626",N=!!i.doc_priv,U=!!i.doc_san;return`
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
            ${o}
          </div>
          <div style="margin-top: 4px; font-size: 11px; color: #374151;">
            <strong>Nato il:</strong> ${r}${p} &nbsp;•&nbsp; <strong>A:</strong> ${c}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${n}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${g}
          </div>
        </div>

        <div style="text-align: right; border-left: 1.5px solid #e5e7eb; padding-left: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Pattuglia & Ruolo</div>
          <div style="font-size: 16px; font-weight: 800; color: #15803d;">
            Ptg. ${e}
          </div>
          <span style="display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px;">
            ${a}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${d}${m}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${y}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${v}${x}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${f}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${b}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 1px;">
              📞 ${S}
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
            ${E}
          </div>
        </div>

        <!-- Allergie -->
        <div style="border: 1.5px solid ${l?"#ef4444":"#e5e7eb"}; background: ${l?"#fef2f2":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${l?"#b91c1c":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>⚠️ Allergie (Farmaci/Cibo/Insetti)</span>
            ${l?'<span style="color:#dc2626; font-weight:900;">ATTENZIONE</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${l?"700":"400"}; color: ${l?"#991b1b":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${l||"Nessuna allergia nota segnalata."}
          </div>
        </div>

        <!-- Intolleranze e Dieta -->
        <div style="border: 1.5px solid ${u?"#f59e0b":"#e5e7eb"}; background: ${u?"#fffbeb":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${u?"#b45309":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>🍽️ Intolleranze & Dieta</span>
            ${u?'<span style="color:#d97706; font-weight:800;">DIETA SPECIFICA</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${u?"700":"400"}; color: ${u?"#92400e":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${u||"Nessuna esigenza alimentare specifica."}
          </div>
          </div>
        </div>
      </div>

      <!-- PATOLOGIE CRONICHE & BSE/DISABILITÀ -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- Patologie croniche -->
        <div style="border: 1.5px solid ${h?"#7c3aed":"#e5e7eb"}; background: ${h?"#f5f3ff":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${h?"#6d28d9":"#4b5563"}; margin-bottom: 4px;">
            🩺 Patologie Croniche
          </div>
          <div style="font-size: 11px; font-weight: ${h?"600":"400"}; color: ${h?"#4c1d95":"#6b7280"}; min-height: 36px;">
            ${h||"Nessuna patologia cronica segnalata."}
          </div>
        </div>

        <!-- BSE / Disabilità -->
        <div style="border: 2px solid ${_?"#2563eb":"#e5e7eb"}; background: ${_?"#eff6ff":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${_?"#1d4ed8":"#4b5563"}; display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>♿ Bisogni Speciali / BSE</span>
            ${_?'<span style="color:#1d4ed8; font-weight:900;">PRESENTE</span>':""}
          </div>
          <div style="font-size: 11px; font-weight: ${_?"600":"400"}; color: ${_?"#1e3a8a":"#6b7280"}; min-height: 36px;">
            ${_?w||"Presenti bisogni speciali — vedi capi reparto per dettagli.":"Nessun bisogno speciale segnalato."}
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
          <div style="font-size: 11px; color: ${$?"#0f172a":"#64748b"}; font-weight: ${$?"600":"400"}; min-height: 36px;">
            ${$||"Nessuna terapia farmacologica continuativa indicata."}
          </div>
        </div>

        <!-- Vaccinazioni & Antitetanica -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
            💉 Vaccinazioni & Richiamo Antitetanica
          </div>
          <div style="font-size: 11px; color: #0f172a; min-height: 36px;">
            ${k||"Regolari secondo calendario vaccinale nazionale."}
          </div>
        </div>
      </div>

      <!-- CERTIFICATO MEDICO & DOCUMENTAZIONE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Certificato Medico Non Agonistico</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span style="font-weight: 800; font-size: 12px; color: ${B};">
              ● ${M}
            </span>
            <span style="color: #475569;">(Scadenza: <strong>${D}</strong>)</span>
          </div>
          ${I?`<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${I}</div>`:""}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Consensi e Altre Indicazioni</div>
          <div style="display: flex; gap: 12px; margin-top: 2px; font-size: 11px;">
            <span>Privacy: <strong>${N?"✅ Depositata":"❌ Mancante"}</strong></span>
            <span>Scheda Firmata: <strong>${U?"✅ Depositata":"❌ Mancante"}</strong></span>
          </div>
          ${q?`<div style="font-size: 10px; color: #475569; margin-top: 2px;">Altro: ${q}</div>`:""}
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
  `};UI.printScoutMedicalSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(s=>s.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const o=typeof this.collectForm=="function"?this.collectForm():{},e={...i,...o,nome:o.nome||i.nome,cognome:o.cognome||i.cognome},a=this.generateScoutMedicalSheetHtml(e);this._printHtmlInArea(a,`Scheda Sanitaria - ${e.nome||""} ${e.cognome||""}`)}catch(t){console.error("Errore generazione scheda sanitaria:",t),this.showToast("Errore durante la generazione della scheda sanitaria: "+t.message,{type:"error",duration:4e3})}};UI.printMedicalSingle=async function(t){try{if(!t){this.showToast?.("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay?.("Preparazione scheda sanitaria..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const o=(this.state.allScouts||this.state.scouts||[]).find(a=>a.id===t);if(!o){this.hideLoadingOverlay?.(),this.showToast?.("Esploratore non trovato",{type:"error"});return}const e=this.generateScoutMedicalSheetHtml(o);if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(e,`Scheda Sanitaria - ${o.nome||""} ${o.cognome||""}`);else{const a=window.open("","_blank");a&&(a.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Scheda Sanitaria - ${o.nome||""} ${o.cognome||""}</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${e}
            </body>
          </html>
        `),a.document.close())}}catch(i){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",i),this.showToast?.("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,i="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const o=(this.state.allScouts||this.state.scouts||[]).filter(s=>!s.archived),e=t&&t.length>0?t.map(s=>o.find(r=>r.id===s)).filter(Boolean):o.slice().sort((s,r)=>{const p=s.pv_pattuglia||"",c=r.pv_pattuglia||"";if(p!==c)return p.localeCompare(c,"it");const n=s.cognome||"",g=r.cognome||"";return n.localeCompare(g,"it")});if(e.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const a=e.map((s,r)=>{let p=this.generateScoutMedicalSheetHtml(s);return r<e.length-1&&(p+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),p});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(a.join(`
`),i);else{const s=window.open("","_blank");s&&(s.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${i}</title>
              <style>
                @page { size: A4 portrait; margin: 10mm; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              ${a.join(`
`)}
            </body>
          </html>
        `),s.document.close())}}catch(o){this.hideLoadingOverlay?.(),console.error("Errore stampa batch schede sanitarie:",o),this.showToast?.("Errore stampa cartellina: "+o.message,{type:"error",duration:4e3})}};UI.syncDeliveredBadgesWithScorte=async function(t,i){if(!i||typeof DATA>"u"||!DATA.getScorte||!DATA.updateScorta)return[];const o=[];!t?.pv_promessa&&i.pv_promessa&&o.push("Promessa"),!t?.pv_giglio_data&&i.pv_giglio_data&&o.push("Giglio e Trifoglio"),!t?.pv_traccia1?.ottenuto&&i.pv_traccia1?.ottenuto&&o.push("1 Traccia"),!t?.pv_traccia2?.ottenuto&&i.pv_traccia2?.ottenuto&&o.push("2 Traccia"),!t?.pv_traccia3?.ottenuto&&i.pv_traccia3?.ottenuto&&o.push("3 Traccia");const e=Array.isArray(t?.specialita)?t.specialita:[];if((Array.isArray(i.specialita)?i.specialita:[]).forEach(s=>{if(!s||typeof s!="object"||!s.nome||!!!(s.distintivo||s.ottenuta))return;const p=s.nome.trim().toLowerCase(),c=e.find(g=>(typeof g=="object"?g?.nome||"":String(g||"")).trim().toLowerCase()===p);c&&typeof c=="object"&&(c.distintivo||c.ottenuta)||o.push(s.nome.trim())}),o.length===0)return[];try{const s=await DATA.getScorte(),r=[];for(const p of o){const c=P(p),n=p.toLowerCase(),g=(s||[]).find(d=>{if(!d||!d.nome)return!1;const m=P(d.nome,d.lista,d.categoria);if(c&&m&&c.src===m.src)return!0;const y=d.nome.trim().toLowerCase();return y===n||!c&&y.includes(n)});if(g&&(Number(g.quantita)||0)>0){const d=Math.max(0,(Number(g.quantita)||0)-1);g.quantita=d,await DATA.updateScorta(g.id,{quantita:d},this.currentUser),r.push({id:g.id,nome:g.nome,newQty:d,minQty:Number(g.quantitaMinima)||0})}}if(r.length>0&&this.showToast){const p=r.map(n=>`${n.nome} (rimasti ${n.newQty})`).join(", "),c=r.some(n=>n.newQty<n.minQty);this.showToast(c?`Scorte scalate (-1): ${p}. Attenzione: sotto scorta minima!`:`Scorte aggiornate (-1): ${p}`,{type:c?"warning":"info",duration:4500})}return r}catch(s){return console.warn("Errore aggiornamento automatico scorte distintivi:",s),[]}};
