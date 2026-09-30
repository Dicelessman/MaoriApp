import{n as O,f as q,a as H}from"./date-picker-PD1igq5W.js";/* empty css              */import"./shared-ascq1xWz.js";import{c as z}from"./cngei-service-DZdKacRO.js";import{r as j,c as F,a as G,s as Y}from"./cngei-progressioni-B6r5KadV.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";import"./cngei-sync-Dll_EPIb.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const t=new URLSearchParams(location.search);let i=t.get("id");const o=typeof this.getUserRole=="function"?this.getUserRole():null;if(o&&o.ruolo==="esploratore"&&o.record){const l=o.record.id;if(l&&i!==l){console.warn(`[RBAC scout2] Accesso negato per esploratore a scheda ${i}. Reindirizzamento a ${l}`),location.replace(`scout2.html?id=${l}&readonly=1`);return}const f=this.qs("#mainSidebar")||document.getElementById("mainSidebar");f&&(f.style.display="none");const g=this.qs("#sidebarToggle")||document.getElementById("sidebarToggle");g&&(g.style.display="none")}if(!i){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=i,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(l=>{const f=this.qs(`#${l}`);f&&(f.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());const e=(this.state.allScouts||this.state.scouts||[]).find(l=>l.id===i);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const a=(l,f)=>{const g=this.qs(l);g&&(g.value=f??"")};a("#anag_nome",e.nome),a("#anag_cognome",e.cognome),a("#anag_dob",this.toYyyyMmDd(e.anag_dob)),a("#anag_sesso",e.anag_sesso),a("#anag_cf",e.anag_cf),a("#anag_indirizzo",e.anag_indirizzo),a("#anag_citta",e.anag_citta),a("#anag_email",e.anag_email),a("#anag_telefono",e.anag_telefono),a("#ct_g1_nome",e.ct_g1_nome),a("#ct_g1_tel",e.ct_g1_tel),a("#ct_g1_email",e.ct_g1_email),a("#ct_g2_nome",e.ct_g2_nome),a("#ct_g2_tel",e.ct_g2_tel),a("#ct_g2_email",e.ct_g2_email),a("#san_gruppo",e.san_gruppo),a("#san_allergie",e.san_allergie),a("#san_intolleranze",e.san_intolleranze),a("#san_patologie",e.san_patologie),a("#san_farmaci",e.san_farmaci),a("#san_vaccinazioni",e.san_vaccinazioni),a("#ct_med_nome",e.ct_med_nome),a("#ct_med_tel",e.ct_med_tel),a("#san_cert",e.san_cert),a("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),a("#san_altro",e.san_altro);const s=this.qs("#san_disabilita");if(s){s.checked=!!e.san_disabilita;const l=this.qs("#san_disabilita_note_wrapper");l&&l.classList.toggle("hidden",!e.san_disabilita)}a("#san_disabilita_note",e.san_disabilita_note),a("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const n=this.qs(`input[name="pv_vcp_cp"][value="${e.pv_vcp_cp}"]`);n&&(n.checked=!0),a("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),a("#pv_giglio_note",e.pv_giglio_note),a("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const l=["io","al","mt"];["1","2","3"].forEach(g=>{l.forEach(v=>{const b=this.qs(`#pv_sfida_${v}_${g}_text`);b&&this.autoResizeTextarea(b)})})},200),a("#pv_note",e.pv_note),a("#pv_traccia1_note",e.pv_traccia1_note),a("#pv_traccia2_note",e.pv_traccia2_note),a("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(f=>{const g=this.qs(`#${f}`);g&&this.autoResizeTextarea(g)})},250),a("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),a("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),a("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),a("#ev_note",e.ev_note);const p=l=>{if(!l)return"";const f=this.toJsDate(l);return isNaN(f.getTime())?"":f.getFullYear().toString()};a("#doc_quota1",p(e.doc_quota1)),a("#doc_quota2",p(e.doc_quota2)),a("#doc_quota3",p(e.doc_quota3)),a("#doc_quota4",p(e.doc_quota4));const c=(l,f)=>{const g=this.qs(l);g&&(g.checked=!!f)};c("#doc_iscr",e.doc_iscr),c("#doc_priv",e.doc_priv),c("#doc_san",e.doc_san),c("#doc_liberatoria",e.doc_liberatoria),a("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const r=this.qs("#san_cert_scadenza");if(r&&!r._bound){r._bound=!0;const l=()=>this.updateMedicalStatusBadge(this.currentScout);r.addEventListener("input",l),r.addEventListener("change",l),this.qs("#doc_priv")?.addEventListener("change",l),this.qs("#doc_san")?.addEventListener("change",l)}const h=this.qs("#sendWhatsAppReminderBtn");h&&!h._bound&&(h._bound=!0,h.addEventListener("click",()=>{const l=this.currentScout||{},f=this.qs("#san_cert_scadenza")?.value||"",g=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...l,san_cert_scadenza:f,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,v=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||l.ct_g1_tel||l.anag_telefono||"",b=`${this.qs("#anag_nome")?.value||l.nome||""} ${this.qs("#anag_cognome")?.value||l.cognome||""}`.trim(),y=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:b,scadenzaStr:g?.formattedDate||f,telGenitore:v,certStatus:g?.certStatus||"expiring",missingDocs:g?.missingDocuments||[]}):null;y&&y.url&&window.open(y.url,"_blank")}));const d=this.qs("#scoutForm");d&&!d._bound&&(d._bound=!0,d.addEventListener("submit",async l=>{if(l.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const f=d.querySelector('button[type="submit"]'),g=f?.textContent;this.setButtonLoading(f,!0,g);try{const v=this.collectForm();await DATA.updateScout(i,v,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.showToast("Scheda salvata")}catch(v){console.error("Errore salvataggio scheda:",v),this.showToast("Errore durante il salvataggio: "+(v.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(f,!1,g)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const _=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",_),this.qs("#printMedicalSectionBtn")?.addEventListener("click",_),this.qs("#san_disabilita")?.addEventListener("change",l=>{const f=this.qs("#san_disabilita_note_wrapper");f&&f.classList.toggle("hidden",!l.target.checked)}),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),["1","2","3"].forEach(l=>{const f=e[`cngei_traccia${l}_id`],g=this.qs(`.traccia-header[data-traccia="${l}"]`);if(g){const v=g.querySelector(".cngei-traccia-badge");if(v&&v.remove(),f){const b=document.createElement("span");b.className="cngei-traccia-badge inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-700 shadow-xs ml-2",b.title="Convalidata su Portale CNGEI",b.textContent="✓ CNGEI";const y=g.querySelector("h4");y&&y.appendChild(b)}}}),document.querySelectorAll(".openCngeiProgModalBtn").forEach(l=>{l._bound||(l._bound=!0,l.addEventListener("click",()=>this.openCngeiProgressioniModal()))});const S=this.qs("#closeCngeiProgModalBtn");S&&!S._bound&&(S._bound=!0,S.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const m=this.qs("#cancelCngeiProgModalBtn");m&&!m._bound&&(m._bound=!0,m.addEventListener("click",()=>this.closeModal("cngeiProgressioniModal")));const x=this.qs("#cngeiProgSelectAllBtn");x&&!x._bound&&(x._bound=!0,x.addEventListener("click",()=>{const l=document.querySelectorAll(".cngei-prog-chk"),f=Array.from(l).some(g=>!g.checked);l.forEach(g=>{g.checked=f})}));const u=this.qs("#confirmSendProgBtn");u&&!u._bound&&(u._bound=!0,u.addEventListener("click",()=>this.sendSelectedProgressioniToCngei())),(t.get("readonly")==="1"||this.getUserRole?.().ruolo==="esploratore")&&this.applyReadOnlyMode(),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.applyReadOnlyMode=function(){const t=this.qs("#scoutForm");t&&t.querySelectorAll("input, select, textarea, button").forEach(n=>{n.tagName==="BUTTON"?!n.classList.contains("tab-nav-btn")&&n.id!=="printScoutBtn"&&n.id!=="printMedicalBtn"&&(n.disabled=!0,n.style.display="none"):(n.disabled=!0,n.setAttribute("readonly","true"),n.classList.add("bg-gray-100","cursor-not-allowed","opacity-80"))});const i=document.querySelector('button[form="scoutForm"]');i&&(i.style.display="none");const o=document.querySelector('a[href="esploratori.html"]');o&&(o.style.display="none");const e=this.qs("#managePattuglieBtn");e&&(e.style.display="none");const a=this.qs("#addSpecialitaBtn");if(a&&(a.style.display="none"),document.querySelectorAll(".openCngeiProgModalBtn").forEach(s=>{s.style.display="none"}),!this.qs("#readonlyBanner")){const s=this.qs("#scoutHeaderContainer");if(s){const n=document.createElement("div");n.id="readonlyBanner",n.className="mt-3 p-2.5 bg-blue-900/60 border border-blue-500/40 rounded-lg text-blue-200 text-xs flex items-center gap-2",n.innerHTML="<span>ℹ️</span> <span>Sei in modalità <strong>visualizzazione</strong> della tua scheda personale (sola lettura).</span>",s.appendChild(n)}}};UI.openCngeiProgressioniModal=async function(){const t=this.currentScout;if(!t)return;const i=this.qs("#cngeiProgressioniModal");if(!i)return;const o=this.qs("#cngeiProgScoutName");if(o){const r=`${t.nome||""} ${t.cognome||""}`.trim()||"Esploratore";o.textContent=`Esploratore: ${r}${t.tesseraCngei?` (Tessera #${t.tesseraCngei})`:""}`}const e=this.qs("#cngeiProgNoIdWarning"),a=this.qs("#confirmSendProgBtn");t.idCngei?(e?.classList.add("hidden"),a&&(a.disabled=!1)):(e?.classList.remove("hidden"),a&&(a.disabled=!0));const s=this.qs("#cngeiProgPendingList"),n=this.qs("#cngeiProgSyncedList"),p=this.qs("#cngeiProgPendingCount"),c=this.qs("#cngeiProgSyncedCount");s&&(s.innerHTML='<div class="text-sm text-slate-500 py-3 text-center">Caricamento progressioni da portale CNGEI...</div>'),n&&(n.innerHTML=""),i.classList.remove("hidden");try{const r=await z.getProgressioniTypes(),h=this.collectSpecialita(),d={...t,specialita:h,pv_traccia1:{done:!!this.qs("#pv_traccia1_chk")?.checked,data:this.qs("#pv_traccia1_dt")?.value||t.pv_traccia1?.data},pv_traccia2:{done:!!this.qs("#pv_traccia2_chk")?.checked,data:this.qs("#pv_traccia2_dt")?.value||t.pv_traccia2?.data},pv_traccia3:{done:!!this.qs("#pv_traccia3_chk")?.checked,data:this.qs("#pv_traccia3_dt")?.value||t.pv_traccia3?.data}};if(t.idCngei)try{const m=await z.getPersona(t.idCngei);if(m?.brevetti&&Array.isArray(m.brevetti)){const{changed:x}=j(d,m.brevetti);if(x){t.specialita=d.specialita,d.cngei_traccia1_id&&(t.cngei_traccia1_id=d.cngei_traccia1_id),d.cngei_traccia2_id&&(t.cngei_traccia2_id=d.cngei_traccia2_id),d.cngei_traccia3_id&&(t.cngei_traccia3_id=d.cngei_traccia3_id),await DATA.updateScout(t.id,t,this.currentUser);try{this.showToast("Progressioni già registrate su CNGEI allineate!",{type:"info",duration:2500})}catch{}}}}catch(m){console.warn("Avviso recupero dati persona CNGEI:",m)}const _=F(d,r),S=G(d,r);p&&(p.textContent=_.length),c&&(c.textContent=S.length),_.length===0?(s&&(s.innerHTML='<div class="text-sm text-slate-500 py-4 text-center">Nessuna progressione o specialità conseguita in attesa di invio.</div>'),a&&(a.disabled=!0)):(a&&t.idCngei&&(a.disabled=!1),s&&(s.innerHTML=_.map((m,x)=>`
          <label class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <input type="checkbox" class="cngei-prog-chk w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" data-index="${x}" checked />
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${m.category.includes("PO")?"bg-amber-100 text-amber-800 border border-amber-200":"bg-blue-100 text-blue-800 border border-blue-200"}">${m.category}</span>
                  <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${m.name}</span>
                </div>
                <div class="text-xs text-slate-500 mt-0.5">Conseguita il: <strong>${m.obtainedAt}</strong></div>
              </div>
            </div>
            <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-right">
              ✓ Pronto per invio
            </div>
          </label>
        `).join(""))),S.length===0?n&&(n.innerHTML='<div class="text-center py-2 text-slate-400">Nessuna progressione ancora registrata a portale.</div>'):n&&(n.innerHTML=S.map(m=>`
          <div class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
            <span class="flex items-center gap-1.5 font-medium">
              <span class="text-emerald-600">✓</span>
              <span>${m.name} (${m.category})</span>
            </span>
            <span class="text-slate-400 text-[11px]">${m.obtainedAt}</span>
          </div>
        `).join("")),this._pendingProgressioniData=_}catch(r){console.error("Errore recupero tipi progressione CNGEI:",r),s&&(s.innerHTML=`<div class="text-sm text-rose-500 py-3 text-center">Errore connessione CNGEI: ${r.message||"Errore di rete"}</div>`)}};UI.sendSelectedProgressioniToCngei=async function(){const t=this.currentScout;if(!t||!t.idCngei){this.showToast("Esploratore non associato a un ID del portale CNGEI.",{type:"error"});return}const i=Array.from(document.querySelectorAll(".cngei-prog-chk:checked"));if(i.length===0){this.showToast("Nessuna progressione selezionata da inviare.",{type:"info"});return}const o=this.qs("#confirmSendProgBtn"),e=o?.innerHTML;this.setButtonLoading(o,!0,"Invio in corso...");try{let a=0;const s=[],n=Array.isArray(t.specialita)?[...t.specialita]:[];for(const p of i){const c=parseInt(p.dataset.index,10),r=this._pendingProgressioniData?.[c];if(r)try{const d=(await Y(t.idCngei,r.typeId,r.obtainedAt,z))?.id||"synced_"+Date.now();r.indexInArray!==void 0&&n[r.indexInArray]?n[r.indexInArray].idProgressioneCngei=d:r.tracciaKey==="pv_traccia1"?t.cngei_traccia1_id=d:r.tracciaKey==="pv_traccia2"?t.cngei_traccia2_id=d:r.tracciaKey==="pv_traccia3"&&(t.cngei_traccia3_id=d),a++}catch(h){console.error(`Errore invio ${r.name}:`,h),s.push(`${r.name}: ${h.message}`)}}t.specialita=n,await DATA.updateScout(t.id,t,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),s.length>0?this.showToast(`Inviate ${a} progressioni. Errori su: ${s.join(", ")}`,{type:"warning",duration:5e3}):this.showToast(`Sincronizzazione completata (${a} progressioni convalidate su CNGEI)!`),this.closeModal("cngeiProgressioniModal"),await this.renderScoutPage()}catch(a){console.error("Errore sincronizzazione progressioni:",a),this.showToast("Errore durante la sincronizzazione: "+(a.message||"Errore server"),{type:"error"})}finally{this.setButtonLoading(o,!1,e)}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const i=["io","al","mt"];["1","2","3"].forEach(e=>{i.forEach(a=>{const s=`#pv_sfida_${a}_${e}`,n=this.qs(s);if(!n)return;const p=a.toUpperCase(),c=t[e]?.[p]||[];n.innerHTML='<option value="">Seleziona sfida...</option>',c.forEach(r=>{const h=document.createElement("option");h.value=r.code,h.textContent=r.code,n.appendChild(h)}),n.addEventListener("change",()=>{const r=n.value,h=this.qs(`#pv_sfida_${a}_${e}_text`);if(h){const d=c.find(_=>_.code===r);h.value=d?d.text:"",this.autoResizeTextarea(h)}})})})};UI.loadChallengeData=function(t){const i=["io","al","mt"];["1","2","3"].forEach(e=>{i.forEach(a=>{const s=`pv_sfida_${a}_${e}`,n=`pv_sfida_${a}_${e}_data`,p=`pv_sfida_${a}_${e}_text`;let c=t[s],r=t[n];if(!c){const _={io:"io",al:"re",mt:"im"},S={io:"IO",al:"AL",mt:"MT"},m=_[a],x=`pv_sfida_${m}_${e}`,u=t[x];if(u&&typeof u=="string")c=u.replace("-RE-","-AL-").replace("-IM-","-MT-"),r||(r=t[`${x}_data`]);else for(let w=1;w<=4;w++){const l=t[`pv_${m}_${e}${w}`];if(l&&l.done){c=`${e}-${S[a]}-${w}`,!r&&l.data&&(r=l.data);break}}}const h=this.qs(`#pv_sfida_${a}_${e}`),d=this.qs(`#${n}`);this.qs(`#${p}`),h&&c&&(h.value=c,h.dispatchEvent(new Event("change")),setTimeout(()=>{const _=this.qs(`#${p}`);_&&this.autoResizeTextarea(_)},100)),d&&r&&(d.value=this.toYyyyMmDd(r))})})};UI.loadSpecialita=function(t){const i=this.qs("#specialitaContainer");i&&(i.innerHTML="",t.forEach((o,e)=>this.addSpecialita(o,e)))};UI.applySpecialitaColors=function(t,i){if(!t)return;const o="white",e="gray",a=(i?.sfondo_colore||o).toLowerCase(),s=(i?.bordo_colore||e).toLowerCase();t.classList.add("specialita-card"),t.setAttribute("data-sfondo",a),t.setAttribute("data-bordo",s),a==="yellow"?(t.classList.add("specialita-sfondo-yellow"),t.classList.remove("specialita-sfondo-green")):a==="green"?(t.classList.add("specialita-sfondo-green"),t.classList.remove("specialita-sfondo-yellow")):t.classList.remove("specialita-sfondo-yellow","specialita-sfondo-green"),t.style.backgroundColor=i?.sfondo_colore||o,t.style.border=`3px solid ${i?.bordo_colore||e}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,i=null){const o=this.qs("#specialitaContainer");if(!o)return;const e=i!==null?i:o.children.length,a=`sp_${e}`,s=await this.loadSpecialitaList(),n=t?.nome?O(t.nome):"",p=t?.nome&&s?s.find(u=>u.nome===t.nome||u.nome===n):null,c=p?.nome||t?.nome&&String(t.nome).trim()||"",r=c?q(c):"",h=p?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],d=document.createElement("div");d.className="rounded-lg overflow-hidden",d.dataset.idProgressioneCngei=t?.idProgressioneCngei||"",this.applySpecialitaColors(d,p||(t&&(t.sfondo_colore||t.bordo_colore)?t:null)),d.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${e}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <img id="${a}_badge" src="${r?`img/specialita/${r}.png`:""}" alt="Distintivo Specialità" class="w-8 h-8 object-contain rounded-full shadow-sm bg-white p-0.5 border border-gray-200" style="${r?"":"display:none;"}" onerror="this.style.display='none';" />
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
            <img id="${a}_select_badge" src="${r?`img/specialita/${r}.png`:""}" alt="Distintivo Specialità" class="w-10 h-10 object-contain rounded-full shadow-sm bg-white p-1 border border-gray-200 shrink-0" style="${r?"":"display:none;"}" onerror="this.style.display='none';" />
            <select id="${a}_nome" class="input flex-1">
              <option value="">Seleziona specialità...</option>
              ${s.map(u=>`<option value="${u.nome}" ${t?.nome===u.nome||n===u.nome?"selected":""}>${u.nome} (${u.categoria||(u.sfondo_colore==="green"?"Verdi":"Gialle")}${u.ambito?" - "+u.ambito:""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${h.map((u,w)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${u.nome}</label>
                <input id="${a}_${u.id}_data" type="date" class="input" value="${t?.[`${u.id}_data`]?this.toYyyyMmDd(t[`${u.id}_data`]):""}" />
              </div>
              <textarea id="${a}_${u.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${u.text||""}</textarea>
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
  `,o.appendChild(d),setTimeout(()=>{h.forEach(w=>{const l=d.querySelector(`#${a}_${w.id}_text`);l&&this.autoResizeTextarea(l)});const u=d.querySelector(`#${a}_note`);u&&this.autoResizeTextarea(u)},50),d.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{d.remove(),this.renumberSpecialita()});const _=d.querySelector(`#${a}_nome`),S=d.querySelector(`#${a}_title`),m=d.querySelector(`#${a}_badge`),x=d.querySelector(`#${a}_select_badge`);_&&S&&_.addEventListener("change",async()=>{const u=_.value||"";S.textContent=u||"Specialità";const w=u?q(u):"";m&&(w?(m.src=`img/specialita/${w}.png`,m.style.display=""):m.style.display="none"),x&&(w?(x.src=`img/specialita/${w}.png`,x.style.display=""):x.style.display="none");const f=(await this.loadSpecialitaList()).find(g=>g.nome===u);this.applySpecialitaColors(d,f),f&&f.prove&&f.prove.forEach(g=>{const v=d.querySelector(`#${a}_${g.id}_data`);if(v){let y=v.previousElementSibling;for(;y&&y.tagName!=="LABEL";)y=y.previousElementSibling;y&&y.tagName==="LABEL"&&(y.textContent=g.nome)}const b=d.querySelector(`#${a}_${g.id}_text`);b&&(b.value=g.text||"",this.autoResizeTextarea(b))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((i,o)=>{const e=i.querySelector(".removeSpecialitaBtn"),a=i.querySelector(".specialita-header");e&&(e.dataset.index=o),a&&(a.dataset.specialita=o)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const o=Array.from(t.children).map(s=>{const n=s.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",p=h=>{const d=this.qs(`#${n}${h}`);if(!d)return null;const _=d.value?.trim()||"";return _===""?null:_},c=h=>!!this.qs(`#${n}${h}`)?.checked,r={nome:p("_nome")||"",ottenuta:!!this.qs(`#${n}_ott_chk`)?.checked,brevetto:c("_brevetto"),distintivo:c("_distintivo"),data:p("_data"),p1_data:p("_p1_data"),p2_data:p("_p2_data"),p3_data:p("_p3_data"),cr_text:p("_cr_text")||"",cr_data:p("_cr_data"),note:p("_note")||"",idProgressioneCngei:s.dataset.idProgressioneCngei||null};return r._hasData=!!(r.nome.trim()&&(r.ottenuta||r.brevetto||r.distintivo||r.data||r.p1_data||r.p2_data||r.p3_data||r.cr_data||r.cr_text&&r.cr_text.trim()||r.note&&r.note.trim())),r}).filter(s=>s.nome&&s.nome.trim()),e=new Map,a=[];return o.forEach(s=>{const n=s.nome.trim().toLowerCase(),p=e.get(n);if(!p)e.set(n,s),a.push(s);else if(s._hasData&&!p._hasData){const c=a.indexOf(p);c!==-1&&(a[c]=s,e.set(n,s))}else s._hasData,p._hasData}),a.map(({_hasData:s,...n})=>n)};UI.setCheckDate=function(t,i){const o=i?.data?this.toYyyyMmDd(i.data):this.toYyyyMmDd(i),e=i?.done??(i&&typeof i=="object"?!1:!!i),a=i?.brevetto??!1,s=i?.distintivo??!1,n=this.qs(`#${t}_chk`),p=this.qs(`#${t}_dt`),c=this.qs(`#${t}_brevetto`),r=this.qs(`#${t}_distintivo`);n&&(n.checked=!!e),p&&(p.value=o||""),c&&(c.checked=!!a),r&&(r.checked=!!s)};UI.setPair=function(t,i){const o=this.qs(`${t}_dt`),e=this.qs(`${t}_tx`);o&&(o.value=this.toYyyyMmDd(i?.data||i)||""),e&&(e.value=i?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const i=this.toJsDate(t);return isNaN(i)?"":i.toISOString().split("T")[0]};UI.collectForm=function(){const t=c=>this.qs(c)?.value?.trim()||"",i=c=>this.qs(c)?.value||"",o=c=>!!this.qs(c)?.checked,e=c=>({data:t(`${c}_dt`)||null,testo:t(`${c}_tx`)||""}),a=c=>({done:o(`#${c}_chk`),data:t(`#${c}_dt`)||null,brevetto:o(`#${c}_brevetto`),distintivo:o(`#${c}_distintivo`)}),s={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:i("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:i("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:i("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_allergie:t("#san_allergie"),san_intolleranze:t("#san_intolleranze"),san_patologie:t("#san_patologie"),san_disabilita:!!this.qs("#san_disabilita")?.checked,san_disabilita_note:t("#san_disabilita_note"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),ct_med_nome:t("#ct_med_nome"),ct_med_tel:t("#ct_med_tel"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:e("#ev_ce1"),ev_ce2:e("#ev_ce2"),ev_ce3:e("#ev_ce3"),ev_ce4:e("#ev_ce4"),ev_ccp:e("#ev_ccp"),ev_tc1:e("#ev_tc1"),ev_tc2:e("#ev_tc2"),ev_tc3:e("#ev_tc3"),ev_tc4:e("#ev_tc4"),ev_jam:e("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:a("pv_traccia1"),pv_traccia2:a("pv_traccia2"),pv_traccia3:a("pv_traccia3"),doc_quota1:(()=>{const c=t("#doc_quota1");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota2:(()=>{const c=t("#doc_quota2");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota3:(()=>{const c=t("#doc_quota3");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_quota4:(()=>{const c=t("#doc_quota4");return c&&c.trim()!==""?`${c}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},n=["io","al","mt"];return["1","2","3"].forEach(c=>{n.forEach(r=>{const h=`pv_sfida_${r}_${c}`,d=`pv_sfida_${r}_${c}_data`;s[h]=t(`#pv_sfida_${r}_${c}`),s[d]=t(`#pv_sfida_${r}_${c}_data`)||null})}),this.currentScout?.idCngei&&(s.idCngei=this.currentScout.idCngei),this.currentScout?.tesseraCngei&&(s.tesseraCngei=this.currentScout.tesseraCngei),this.currentScout?.cngei_traccia1_id&&(s.cngei_traccia1_id=this.currentScout.cngei_traccia1_id),this.currentScout?.cngei_traccia2_id&&(s.cngei_traccia2_id=this.currentScout.cngei_traccia2_id),this.currentScout?.cngei_traccia3_id&&(s.cngei_traccia3_id=this.currentScout.cngei_traccia3_id),s};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const i=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(o=>{const e=document.createElement("option");e.value=o,e.textContent=o,t.appendChild(e)}),i&&this.pattuglie.includes(i)&&(t.value=i)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((i,o)=>{const e=document.createElement("div");e.className="flex items-center justify-between p-2 bg-gray-50 rounded border",e.innerHTML=`
      <input type="text" value="${i}" class="input flex-1 mr-2" data-index="${o}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${o})">
        🗑️
      </button>
    `,t.appendChild(e)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),i=t.value.trim();if(!i){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(i)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(i),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),i=[];if(t.forEach(a=>{const s=a.value.trim();s&&!i.includes(s)&&i.push(s)}),i.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const o=this.qs("#savePattugliaBtn"),e=o.textContent;o.textContent="Salvataggio...",o.disabled=!0;try{this.pattuglie=i,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(a){console.error("Errore salvataggio pattuglie:",a),this.showToast("Errore salvataggio: "+a.message,{type:"error"})}finally{o.textContent=e,o.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",i=>{const o=i.target.closest(".traccia-header");if(!o)return;if(console.log("Click su header traccia:",o.dataset.traccia),i.target.type==="checkbox"||i.target.type==="date"){console.log("Click su input, ignorato");return}const e=o.dataset.traccia;console.log("Toggling traccia:",e),this.toggleTracciaSection(e)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const i=document.querySelector(`.traccia-header[data-traccia="${t}"]`),o=i?.nextElementSibling,e=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!o,icon:!!e}),!i||!o||!e){console.error("Elementi non trovati per traccia:",t);return}const a=o.classList.contains("expanded");console.log("Stato attuale - espanso:",a),a?(console.log("Contraendo sezione..."),o.classList.remove("expanded"),e.classList.remove("rotated")):(console.log("Espandendo sezione..."),o.classList.add("expanded"),e.classList.add("rotated")),console.log("Classi finali content:",o.className),console.log("Classi finali icon:",e.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",i=>{const o=i.target.closest(".specialita-header");if(!o)return;if(console.log("Click su header specialità:",o.dataset.specialita),i.target.type==="checkbox"||i.target.type==="date"||i.target.tagName==="SELECT"||i.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const e=o.dataset.specialita;console.log("Toggling specialità:",e),this.toggleSpecialitaSection(e)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const i=document.querySelector(`.specialita-header[data-specialita="${t}"]`),o=i?.nextElementSibling,e=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!o,icon:!!e}),!i||!o||!e){console.error("Elementi non trovati per specialità:",t);return}const a=o.classList.contains("expanded");console.log("Stato attuale - espanso:",a),a?(console.log("Contraendo sezione specialità..."),o.classList.remove("expanded"),e.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),o.classList.add("expanded"),e.classList.add("rotated")),console.log("Classi finali content:",o.className),console.log("Classi finali icon:",e.className)};UI.currentTab="anagrafici";UI.switchTab=function(t,i=!0){if(t||(t="anagrafici"),t=t.toLowerCase().replace("#","").replace("section-",""),document.getElementById(`section-${t}`)||(console.warn(`[Tabs] Sezione section-${t} non trovata, fallback ad anagrafici`),t="anagrafici"),this.currentTab=t,document.querySelectorAll('section[id^="section-"]').forEach(s=>{s.id===`section-${t}`?(s.classList.remove("hidden"),s.classList.add("active"),s.querySelectorAll("textarea").forEach(n=>{typeof this.autoResizeTextarea=="function"&&this.autoResizeTextarea(n)})):(s.classList.add("hidden"),s.classList.remove("active"))}),document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(s=>{(s.dataset.tab||s.getAttribute("href")||"").toLowerCase().replace("#","").replace("section-","")===t?s.classList.add("active"):s.classList.remove("active")}),i&&window.history&&window.history.replaceState)try{history.replaceState(null,"",`#${t}`)}catch{}};UI.initSectionNavigation=function(){document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(e=>{e._tabBound||(e._tabBound=!0,e.addEventListener("click",a=>{a.preventDefault();const s=(e.dataset.tab||e.getAttribute("href")||"").replace("#","").replace("section-","");this.switchTab(s)}))}),document.querySelectorAll("[data-tab-nav]").forEach(e=>{e._tabNavBound||(e._tabNavBound=!0,e.addEventListener("click",a=>{a.preventDefault();const s=e.dataset.tabNav;if(s){this.switchTab(s);const n=document.getElementById("scoutHeaderContainer")||document.getElementById("scoutHeader");n&&typeof n.scrollIntoView=="function"&&n.scrollIntoView({behavior:"smooth",block:"start"})}}))});const i=document.getElementById("scrollTopBtn");i&&!i._bound&&(i._bound=!0,i.addEventListener("click",e=>{e.preventDefault(),typeof window.scrollTo=="function"&&window.scrollTo({top:0,behavior:"smooth"})}));const o=(window.location.hash||"").replace("#","").replace("section-","");o&&document.getElementById(`section-${o}`)?this.switchTab(o,!1):this.switchTab(this.currentTab||"anagrafici",!1),window._scoutTabHashBound||(window._scoutTabHashBound=!0,window.addEventListener("hashchange",()=>{const e=(window.location.hash||"").replace("#","").replace("section-","");e&&document.getElementById(`section-${e}`)&&this.switchTab(e,!1)}))};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},200)});UI.generateScoutSentieroHtml=H;UI._printHtmlInArea=async function(t,i){let o=this.qs?this.qs("#printArea"):document.getElementById("printArea");o||(o=document.createElement("div"),o.id="printArea",o.style.display="none",document.body.appendChild(o)),o.innerHTML=t,o.style.display="block";const e=document.getElementById("app");let a="";e&&(a=e.getAttribute("style")||"",e.style.setProperty("display","none","important"));const s=document.title;document.title=i||s;const n=Array.from(o.querySelectorAll("img"));n.length>0&&(await Promise.all(n.map(r=>r.complete&&r.naturalWidth>0?typeof r.decode=="function"?r.decode().catch(()=>{}):Promise.resolve():new Promise(h=>{let d=!1;const _=()=>{d||(d=!0,typeof r.decode=="function"?r.decode().then(h).catch(h):h())};r.addEventListener("load",_,{once:!0}),r.addEventListener("error",()=>{d||(d=!0,h())},{once:!0}),setTimeout(_,2e3)}))),await new Promise(r=>setTimeout(r,120))),window.print();let p=!1;const c=()=>{p||(p=!0,document.title=s,o.style.display="none",o.innerHTML="",e&&(a?e.setAttribute("style",a):e.removeAttribute("style")))};typeof window<"u"&&("onafterprint"in window||typeof window.addEventListener=="function")?(window.addEventListener("afterprint",c,{once:!0}),setTimeout(c,6e4)):setTimeout(c,2e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(p=>p.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const o=this.collectForm(),e={...i,specialita:i.specialita||[],nome:o.nome||i.nome,cognome:o.cognome||i.cognome},a=await this.loadChallenges(),s=await this.loadSpecialitaList(),n=this.generateScoutSentieroHtml(e,a,s);this._printHtmlInArea(n,`Il Sentiero di ${e.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.allScouts||this.state.scouts||[]).find(e=>e.id===t);if(!i){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const o=this.generateScoutSentieroHtml(i,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(o,`Il Sentiero di ${i.nome||""}`)}catch(i){this.hideLoadingOverlay(),console.error("Errore stampa singola:",i),this.showToast("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,i){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const o=this.state.allScouts||this.state.scouts||[],e=[];if(t.forEach((a,s)=>{const n=o.find(c=>c.id===a);if(!n)return;let p=this.generateScoutSentieroHtml(n,this.challengesData,this.specialitaListData);s<t.length-1&&(p+='<div style="page-break-after: always;"></div>'),e.push(p)}),e.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(e.join(`
`),i||"Schede Sentiero Reparto")}catch(o){this.hideLoadingOverlay(),console.error("Errore stampa batch:",o),this.showToast("Errore stampa: "+o.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const i=this.qs("#san_cert_status_badge");if(!i)return;const o=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),e=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,a=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,s={...t||{},san_cert_scadenza:o,doc_priv:e,doc_san:a},n=this.getScoutMedicalStatus?this.getScoutMedicalStatus(s):null;n&&(i.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${n.badgeClass}`,i.textContent=`🩺 ${n.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const i=t||{},o=`${i.nome||""} ${i.cognome||""}`.trim()||"Esploratore",e=i.pv_pattuglia||"Reparto",a=i.cp_vcp||"Esploratore",s=i.anag_dob||i.dataNascita;let n="Non indicata",p="";if(s){const C=this.toJsDate?this.toJsDate(s):new Date(s);if(!isNaN(C.getTime())){n=C.toLocaleDateString("it-IT");const U=Date.now()-C.getTime(),R=new Date(U),L=Math.abs(R.getUTCFullYear()-1970);L>=0&&L<100&&(p=` (${L} anni)`)}}const c=i.anag_pob||"-",r=i.anag_cf?i.anag_cf.toUpperCase():"-",h=i.anag_indirizzo||"-",d=i.ct_g1_nome||"Genitore 1",_=i.ct_g1_rel?` (${i.ct_g1_rel})`:"",S=i.ct_g1_tel||i.anag_telefono||"Non specificato",m=i.ct_g2_nome||"Genitore 2",x=i.ct_g2_rel?` (${i.ct_g2_rel})`:"",u=i.ct_g2_tel||"-",w=i.ct_med_nome||"-",l=i.ct_med_tel||"-",f=i.san_gruppo||"N.D.",g=(i.san_allergie||"").trim(),v=(i.san_intolleranze||"").trim(),b=(i.san_patologie||"").trim(),y=!!i.san_disabilita,P=(i.san_disabilita_note||"").trim(),E=(i.san_farmaci||"").trim(),A=(i.san_vaccinazioni||"").trim(),k=i.san_cert_scadenza?this.toJsDate?this.toJsDate(i.san_cert_scadenza).toLocaleDateString("it-IT"):i.san_cert_scadenza:"Non specificata",I=(i.san_cert||"").trim(),T=(i.san_altro||"").trim(),$=this.getScoutMedicalStatus?this.getScoutMedicalStatus(i):null,M=$?$.statusLabel:i.san_cert_scadenza?"Registrato":"Mancante",D=$&&$.color==="green"?"#16a34a":$&&$.color==="yellow"?"#d97706":"#dc2626",B=!!i.doc_priv,N=!!i.doc_san;return`
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
            <strong>Nato il:</strong> ${n}${p} &nbsp;•&nbsp; <strong>A:</strong> ${c}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${r}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${h}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${d}${_}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${S}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${m}${x}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${u}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${w}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 1px;">
              📞 ${l}
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
        <div style="border: 1.5px solid ${g?"#ef4444":"#e5e7eb"}; background: ${g?"#fef2f2":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${g?"#b91c1c":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>⚠️ Allergie (Farmaci/Cibo/Insetti)</span>
            ${g?'<span style="color:#dc2626; font-weight:900;">ATTENZIONE</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${g?"700":"400"}; color: ${g?"#991b1b":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${g||"Nessuna allergia nota segnalata."}
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
      </div>

      <!-- PATOLOGIE CRONICHE & BSE/DISABILITÀ -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <!-- Patologie croniche -->
        <div style="border: 1.5px solid ${b?"#7c3aed":"#e5e7eb"}; background: ${b?"#f5f3ff":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${b?"#6d28d9":"#4b5563"}; margin-bottom: 4px;">
            🩺 Patologie Croniche
          </div>
          <div style="font-size: 11px; font-weight: ${b?"600":"400"}; color: ${b?"#4c1d95":"#6b7280"}; min-height: 36px;">
            ${b||"Nessuna patologia cronica segnalata."}
          </div>
        </div>

        <!-- BSE / Disabilità -->
        <div style="border: 2px solid ${y?"#2563eb":"#e5e7eb"}; background: ${y?"#eff6ff":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${y?"#1d4ed8":"#4b5563"}; display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>♿ Bisogni Speciali / BSE</span>
            ${y?'<span style="color:#1d4ed8; font-weight:900;">PRESENTE</span>':""}
          </div>
          <div style="font-size: 11px; font-weight: ${y?"600":"400"}; color: ${y?"#1e3a8a":"#6b7280"}; min-height: 36px;">
            ${y?P||"Presenti bisogni speciali — vedi capi reparto per dettagli.":"Nessun bisogno speciale segnalato."}
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
        `),a.document.close())}}catch(i){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",i),this.showToast?.("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,i="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const o=(this.state.allScouts||this.state.scouts||[]).filter(s=>!s.archived),e=t&&t.length>0?t.map(s=>o.find(n=>n.id===s)).filter(Boolean):o.slice().sort((s,n)=>{const p=s.pv_pattuglia||"",c=n.pv_pattuglia||"";if(p!==c)return p.localeCompare(c,"it");const r=s.cognome||"",h=n.cognome||"";return r.localeCompare(h,"it")});if(e.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const a=e.map((s,n)=>{let p=this.generateScoutMedicalSheetHtml(s);return n<e.length-1&&(p+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),p});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(a.join(`
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
        `),s.document.close())}}catch(o){this.hideLoadingOverlay?.(),console.error("Errore stampa batch schede sanitarie:",o),this.showToast?.("Errore stampa cartellina: "+o.message,{type:"error",duration:4e3})}};
