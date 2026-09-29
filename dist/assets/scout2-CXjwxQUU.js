import{n as U,f as T,a as R}from"./date-picker-4UQZC6Oi.js";/* empty css              */import"./shared-CWcRGm4L.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const i=new URLSearchParams(location.search).get("id");if(!i){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=i,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(l=>{const p=this.qs(`#${l}`);p&&(p.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());const e=(this.state.allScouts||this.state.scouts||[]).find(l=>l.id===i);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const a=(l,p)=>{const u=this.qs(l);u&&(u.value=p??"")};a("#anag_nome",e.nome),a("#anag_cognome",e.cognome),a("#anag_dob",this.toYyyyMmDd(e.anag_dob)),a("#anag_sesso",e.anag_sesso),a("#anag_cf",e.anag_cf),a("#anag_indirizzo",e.anag_indirizzo),a("#anag_citta",e.anag_citta),a("#anag_email",e.anag_email),a("#anag_telefono",e.anag_telefono),a("#ct_g1_nome",e.ct_g1_nome),a("#ct_g1_tel",e.ct_g1_tel),a("#ct_g1_email",e.ct_g1_email),a("#ct_g2_nome",e.ct_g2_nome),a("#ct_g2_tel",e.ct_g2_tel),a("#ct_g2_email",e.ct_g2_email),a("#san_gruppo",e.san_gruppo),a("#san_intolleranze",e.san_intolleranze),a("#san_allergie",e.san_allergie),a("#san_farmaci",e.san_farmaci),a("#san_vaccinazioni",e.san_vaccinazioni),a("#san_cert",e.san_cert),a("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),a("#san_altro",e.san_altro),a("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const o=this.qs(`input[name="pv_vcp_cp"][value="${e.pv_vcp_cp}"]`);o&&(o.checked=!0),a("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),a("#pv_giglio_note",e.pv_giglio_note),a("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const l=["io","al","mt"];["1","2","3"].forEach(u=>{l.forEach(f=>{const _=this.qs(`#pv_sfida_${f}_${u}_text`);_&&this.autoResizeTextarea(_)})})},200),a("#pv_note",e.pv_note),a("#pv_traccia1_note",e.pv_traccia1_note),a("#pv_traccia2_note",e.pv_traccia2_note),a("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(p=>{const u=this.qs(`#${p}`);u&&this.autoResizeTextarea(u)})},250),a("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),a("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),a("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),a("#ev_note",e.ev_note);const s=l=>{if(!l)return"";const p=this.toJsDate(l);return isNaN(p.getTime())?"":p.getFullYear().toString()};a("#doc_quota1",s(e.doc_quota1)),a("#doc_quota2",s(e.doc_quota2)),a("#doc_quota3",s(e.doc_quota3)),a("#doc_quota4",s(e.doc_quota4));const c=(l,p)=>{const u=this.qs(l);u&&(u.checked=!!p)};c("#doc_iscr",e.doc_iscr),c("#doc_priv",e.doc_priv),c("#doc_san",e.doc_san),c("#doc_liberatoria",e.doc_liberatoria),a("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const d=this.qs("#san_cert_scadenza");if(d&&!d._bound){d._bound=!0;const l=()=>this.updateMedicalStatusBadge(this.currentScout);d.addEventListener("input",l),d.addEventListener("change",l),this.qs("#doc_priv")?.addEventListener("change",l),this.qs("#doc_san")?.addEventListener("change",l)}const n=this.qs("#sendWhatsAppReminderBtn");n&&!n._bound&&(n._bound=!0,n.addEventListener("click",()=>{const l=this.currentScout||{},p=this.qs("#san_cert_scadenza")?.value||"",u=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...l,san_cert_scadenza:p,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,f=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||l.ct_g1_tel||l.anag_telefono||"",_=`${this.qs("#anag_nome")?.value||l.nome||""} ${this.qs("#anag_cognome")?.value||l.cognome||""}`.trim(),h=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:_,scadenzaStr:u?.formattedDate||p,telGenitore:f,certStatus:u?.certStatus||"expiring",missingDocs:u?.missingDocuments||[]}):null;h&&h.url&&window.open(h.url,"_blank")}));const r=this.qs("#scoutForm");r&&!r._bound&&(r._bound=!0,r.addEventListener("submit",async l=>{if(l.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const p=r.querySelector('button[type="submit"]'),u=p?.textContent;this.setButtonLoading(p,!0,u);try{const f=this.collectForm();await DATA.updateScout(i,f,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.showToast("Scheda salvata")}catch(f){console.error("Errore salvataggio scheda:",f),this.showToast("Errore durante il salvataggio: "+(f.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(p,!1,u)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const g=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",g),this.qs("#printMedicalSectionBtn")?.addEventListener("click",g),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const i=["io","al","mt"];["1","2","3"].forEach(a=>{i.forEach(o=>{const s=`#pv_sfida_${o}_${a}`,c=this.qs(s);if(!c)return;const d=o.toUpperCase(),n=t[a]?.[d]||[];c.innerHTML='<option value="">Seleziona sfida...</option>',n.forEach(r=>{const g=document.createElement("option");g.value=r.code,g.textContent=r.code,c.appendChild(g)}),c.addEventListener("change",()=>{const r=c.value,g=this.qs(`#pv_sfida_${o}_${a}_text`);if(g){const l=n.find(p=>p.code===r);g.value=l?l.text:"",this.autoResizeTextarea(g)}})})})};UI.loadChallengeData=function(t){const i=["io","al","mt"];["1","2","3"].forEach(a=>{i.forEach(o=>{const s=`pv_sfida_${o}_${a}`,c=`pv_sfida_${o}_${a}_data`,d=`pv_sfida_${o}_${a}_text`;let n=t[s],r=t[c];if(!n){const p={io:"io",al:"re",mt:"im"},u={io:"IO",al:"AL",mt:"MT"},f=p[o],_=`pv_sfida_${f}_${a}`,h=t[_];if(h&&typeof h=="string")n=h.replace("-RE-","-AL-").replace("-IM-","-MT-"),r||(r=t[`${_}_data`]);else for(let m=1;m<=4;m++){const y=t[`pv_${f}_${a}${m}`];if(y&&y.done){n=`${a}-${u[o]}-${m}`,!r&&y.data&&(r=y.data);break}}}const g=this.qs(`#pv_sfida_${o}_${a}`),l=this.qs(`#${c}`);this.qs(`#${d}`),g&&n&&(g.value=n,g.dispatchEvent(new Event("change")),setTimeout(()=>{const p=this.qs(`#${d}`);p&&this.autoResizeTextarea(p)},100)),l&&r&&(l.value=this.toYyyyMmDd(r))})})};UI.loadSpecialita=function(t){const i=this.qs("#specialitaContainer");i&&(i.innerHTML="",t.forEach((e,a)=>this.addSpecialita(e,a)))};UI.applySpecialitaColors=function(t,i){if(!t)return;const e="white",a="gray",o=(i?.sfondo_colore||e).toLowerCase(),s=(i?.bordo_colore||a).toLowerCase();t.classList.add("specialita-card"),t.setAttribute("data-sfondo",o),t.setAttribute("data-bordo",s),o==="yellow"?(t.classList.add("specialita-sfondo-yellow"),t.classList.remove("specialita-sfondo-green")):o==="green"?(t.classList.add("specialita-sfondo-green"),t.classList.remove("specialita-sfondo-yellow")):t.classList.remove("specialita-sfondo-yellow","specialita-sfondo-green"),t.style.backgroundColor=i?.sfondo_colore||e,t.style.border=`3px solid ${i?.bordo_colore||a}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,i=null){const e=this.qs("#specialitaContainer");if(!e)return;const a=i!==null?i:e.children.length,o=`sp_${a}`,s=await this.loadSpecialitaList(),c=t?.nome?U(t.nome):"",d=t?.nome&&s?s.find(h=>h.nome===t.nome||h.nome===c):null,n=d?.nome||t?.nome&&String(t.nome).trim()||"",r=n?T(n):"",g=d?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],l=document.createElement("div");l.className="rounded-lg overflow-hidden",this.applySpecialitaColors(l,d||(t&&(t.sfondo_colore||t.bordo_colore)?t:null)),l.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${a}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <img id="${o}_badge" src="${r?`img/specialita/${r}.png`:""}" alt="Distintivo Specialità" class="w-8 h-8 object-contain rounded-full shadow-sm bg-white p-0.5 border border-gray-200" style="${r?"":"display:none;"}" onerror="this.style.display='none';" />
            <h4 class="font-semibold text-lg"><span id="${o}_title">${d?.nome||t?.nome&&String(t.nome).trim()||"Specialità"}</span></h4>
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
          <button type="button" class="removeSpecialitaBtn text-red-600 hover:text-red-800" data-index="${a}">🗑️</button>
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
              ${s.map(h=>`<option value="${h.nome}" ${t?.nome===h.nome||c===h.nome?"selected":""}>${h.nome} (${h.categoria||(h.sfondo_colore==="green"?"Verdi":"Gialle")}${h.ambito?" - "+h.ambito:""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${g.map((h,m)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${h.nome}</label>
                <input id="${o}_${h.id}_data" type="date" class="input" value="${t?.[`${h.id}_data`]?this.toYyyyMmDd(t[`${h.id}_data`]):""}" />
              </div>
              <textarea id="${o}_${h.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${h.text||""}</textarea>
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
  `,e.appendChild(l),setTimeout(()=>{g.forEach(m=>{const y=l.querySelector(`#${o}_${m.id}_text`);y&&this.autoResizeTextarea(y)});const h=l.querySelector(`#${o}_note`);h&&this.autoResizeTextarea(h)},50),l.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{l.remove(),this.renumberSpecialita()});const p=l.querySelector(`#${o}_nome`),u=l.querySelector(`#${o}_title`),f=l.querySelector(`#${o}_badge`),_=l.querySelector(`#${o}_select_badge`);p&&u&&p.addEventListener("change",async()=>{const h=p.value||"";u.textContent=h||"Specialità";const m=h?T(h):"";f&&(m?(f.src=`img/specialita/${m}.png`,f.style.display=""):f.style.display="none"),_&&(m?(_.src=`img/specialita/${m}.png`,_.style.display=""):_.style.display="none");const w=(await this.loadSpecialitaList()).find(v=>v.nome===h);this.applySpecialitaColors(l,w),w&&w.prove&&w.prove.forEach(v=>{const x=l.querySelector(`#${o}_${v.id}_data`);if(x){let b=x.previousElementSibling;for(;b&&b.tagName!=="LABEL";)b=b.previousElementSibling;b&&b.tagName==="LABEL"&&(b.textContent=v.nome)}const S=l.querySelector(`#${o}_${v.id}_text`);S&&(S.value=v.text||"",this.autoResizeTextarea(S))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((i,e)=>{const a=i.querySelector(".removeSpecialitaBtn"),o=i.querySelector(".specialita-header");a&&(a.dataset.index=e),o&&(o.dataset.specialita=e)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const e=Array.from(t.children).map(s=>{const c=s.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",d=g=>{const l=this.qs(`#${c}${g}`);if(!l)return null;const p=l.value?.trim()||"";return p===""?null:p},n=g=>!!this.qs(`#${c}${g}`)?.checked,r={nome:d("_nome")||"",ottenuta:!!this.qs(`#${c}_ott_chk`)?.checked,brevetto:n("_brevetto"),distintivo:n("_distintivo"),data:d("_data"),p1_data:d("_p1_data"),p2_data:d("_p2_data"),p3_data:d("_p3_data"),cr_text:d("_cr_text")||"",cr_data:d("_cr_data"),note:d("_note")||""};return r._hasData=!!(r.nome.trim()&&(r.ottenuta||r.brevetto||r.distintivo||r.data||r.p1_data||r.p2_data||r.p3_data||r.cr_data||r.cr_text&&r.cr_text.trim()||r.note&&r.note.trim())),r}).filter(s=>s.nome&&s.nome.trim()),a=new Map,o=[];return e.forEach(s=>{const c=s.nome.trim().toLowerCase(),d=a.get(c);if(!d)a.set(c,s),o.push(s);else if(s._hasData&&!d._hasData){const n=o.indexOf(d);n!==-1&&(o[n]=s,a.set(c,s))}else s._hasData,d._hasData}),o.map(({_hasData:s,...c})=>c)};UI.setCheckDate=function(t,i){const e=i?.data?this.toYyyyMmDd(i.data):this.toYyyyMmDd(i),a=i?.done??(i&&typeof i=="object"?!1:!!i),o=i?.brevetto??!1,s=i?.distintivo??!1,c=this.qs(`#${t}_chk`),d=this.qs(`#${t}_dt`),n=this.qs(`#${t}_brevetto`),r=this.qs(`#${t}_distintivo`);c&&(c.checked=!!a),d&&(d.value=e||""),n&&(n.checked=!!o),r&&(r.checked=!!s)};UI.setPair=function(t,i){const e=this.qs(`${t}_dt`),a=this.qs(`${t}_tx`);e&&(e.value=this.toYyyyMmDd(i?.data||i)||""),a&&(a.value=i?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const i=this.toJsDate(t);return isNaN(i)?"":i.toISOString().split("T")[0]};UI.collectForm=function(){const t=n=>this.qs(n)?.value?.trim()||"",i=n=>this.qs(n)?.value||"",e=n=>!!this.qs(n)?.checked,a=n=>({data:t(`${n}_dt`)||null,testo:t(`${n}_tx`)||""}),o=n=>({done:e(`#${n}_chk`),data:t(`#${n}_dt`)||null,brevetto:e(`#${n}_brevetto`),distintivo:e(`#${n}_distintivo`)}),s={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:i("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:i("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:i("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_intolleranze:t("#san_intolleranze"),san_allergie:t("#san_allergie"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:a("#ev_ce1"),ev_ce2:a("#ev_ce2"),ev_ce3:a("#ev_ce3"),ev_ce4:a("#ev_ce4"),ev_ccp:a("#ev_ccp"),ev_tc1:a("#ev_tc1"),ev_tc2:a("#ev_tc2"),ev_tc3:a("#ev_tc3"),ev_tc4:a("#ev_tc4"),ev_jam:a("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:o("pv_traccia1"),pv_traccia2:o("pv_traccia2"),pv_traccia3:o("pv_traccia3"),doc_quota1:(()=>{const n=t("#doc_quota1");return n&&n.trim()!==""?`${n}-01-01`:null})(),doc_quota2:(()=>{const n=t("#doc_quota2");return n&&n.trim()!==""?`${n}-01-01`:null})(),doc_quota3:(()=>{const n=t("#doc_quota3");return n&&n.trim()!==""?`${n}-01-01`:null})(),doc_quota4:(()=>{const n=t("#doc_quota4");return n&&n.trim()!==""?`${n}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},c=["io","al","mt"];return["1","2","3"].forEach(n=>{c.forEach(r=>{const g=`pv_sfida_${r}_${n}`,l=`pv_sfida_${r}_${n}_data`;s[g]=t(`#pv_sfida_${r}_${n}`),s[l]=t(`#pv_sfida_${r}_${n}_data`)||null})}),s};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const i=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(e=>{const a=document.createElement("option");a.value=e,a.textContent=e,t.appendChild(a)}),i&&this.pattuglie.includes(i)&&(t.value=i)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((i,e)=>{const a=document.createElement("div");a.className="flex items-center justify-between p-2 bg-gray-50 rounded border",a.innerHTML=`
      <input type="text" value="${i}" class="input flex-1 mr-2" data-index="${e}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${e})">
        🗑️
      </button>
    `,t.appendChild(a)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),i=t.value.trim();if(!i){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(i)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(i),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),i=[];if(t.forEach(o=>{const s=o.value.trim();s&&!i.includes(s)&&i.push(s)}),i.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const e=this.qs("#savePattugliaBtn"),a=e.textContent;e.textContent="Salvataggio...",e.disabled=!0;try{this.pattuglie=i,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(o){console.error("Errore salvataggio pattuglie:",o),this.showToast("Errore salvataggio: "+o.message,{type:"error"})}finally{e.textContent=a,e.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",i=>{const e=i.target.closest(".traccia-header");if(!e)return;if(console.log("Click su header traccia:",e.dataset.traccia),i.target.type==="checkbox"||i.target.type==="date"){console.log("Click su input, ignorato");return}const a=e.dataset.traccia;console.log("Toggling traccia:",a),this.toggleTracciaSection(a)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const i=document.querySelector(`.traccia-header[data-traccia="${t}"]`),e=i?.nextElementSibling,a=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!e,icon:!!a}),!i||!e||!a){console.error("Elementi non trovati per traccia:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione..."),e.classList.remove("expanded"),a.classList.remove("rotated")):(console.log("Espandendo sezione..."),e.classList.add("expanded"),a.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",a.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",i=>{const e=i.target.closest(".specialita-header");if(!e)return;if(console.log("Click su header specialità:",e.dataset.specialita),i.target.type==="checkbox"||i.target.type==="date"||i.target.tagName==="SELECT"||i.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const a=e.dataset.specialita;console.log("Toggling specialità:",a),this.toggleSpecialitaSection(a)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const i=document.querySelector(`.specialita-header[data-specialita="${t}"]`),e=i?.nextElementSibling,a=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!e,icon:!!a}),!i||!e||!a){console.error("Elementi non trovati per specialità:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione specialità..."),e.classList.remove("expanded"),a.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),e.classList.add("expanded"),a.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",a.className)};UI.currentTab="anagrafici";UI.switchTab=function(t,i=!0){if(t||(t="anagrafici"),t=t.toLowerCase().replace("#","").replace("section-",""),document.getElementById(`section-${t}`)||(console.warn(`[Tabs] Sezione section-${t} non trovata, fallback ad anagrafici`),t="anagrafici"),this.currentTab=t,document.querySelectorAll('section[id^="section-"]').forEach(s=>{s.id===`section-${t}`?(s.classList.remove("hidden"),s.classList.add("active"),s.querySelectorAll("textarea").forEach(c=>{typeof this.autoResizeTextarea=="function"&&this.autoResizeTextarea(c)})):(s.classList.add("hidden"),s.classList.remove("active"))}),document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(s=>{(s.dataset.tab||s.getAttribute("href")||"").toLowerCase().replace("#","").replace("section-","")===t?s.classList.add("active"):s.classList.remove("active")}),i&&window.history&&window.history.replaceState)try{history.replaceState(null,"",`#${t}`)}catch{}};UI.initSectionNavigation=function(){document.querySelectorAll(".tab-nav-btn, .section-nav-link").forEach(a=>{a._tabBound||(a._tabBound=!0,a.addEventListener("click",o=>{o.preventDefault();const s=(a.dataset.tab||a.getAttribute("href")||"").replace("#","").replace("section-","");this.switchTab(s)}))}),document.querySelectorAll("[data-tab-nav]").forEach(a=>{a._tabNavBound||(a._tabNavBound=!0,a.addEventListener("click",o=>{o.preventDefault();const s=a.dataset.tabNav;if(s){this.switchTab(s);const c=document.getElementById("scoutHeaderContainer")||document.getElementById("scoutHeader");c&&typeof c.scrollIntoView=="function"&&c.scrollIntoView({behavior:"smooth",block:"start"})}}))});const i=document.getElementById("scrollTopBtn");i&&!i._bound&&(i._bound=!0,i.addEventListener("click",a=>{a.preventDefault(),typeof window.scrollTo=="function"&&window.scrollTo({top:0,behavior:"smooth"})}));const e=(window.location.hash||"").replace("#","").replace("section-","");e&&document.getElementById(`section-${e}`)?this.switchTab(e,!1):this.switchTab(this.currentTab||"anagrafici",!1),window._scoutTabHashBound||(window._scoutTabHashBound=!0,window.addEventListener("hashchange",()=>{const a=(window.location.hash||"").replace("#","").replace("section-","");a&&document.getElementById(`section-${a}`)&&this.switchTab(a,!1)}))};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},200)});UI.generateScoutSentieroHtml=R;UI._printHtmlInArea=async function(t,i){let e=this.qs?this.qs("#printArea"):document.getElementById("printArea");e||(e=document.createElement("div"),e.id="printArea",e.style.display="none",document.body.appendChild(e)),e.innerHTML=t,e.style.display="block";const a=document.getElementById("app");let o="";a&&(o=a.getAttribute("style")||"",a.style.setProperty("display","none","important"));const s=document.title;document.title=i||s;const c=Array.from(e.querySelectorAll("img"));c.length>0&&(await Promise.all(c.map(r=>r.complete&&r.naturalWidth>0?typeof r.decode=="function"?r.decode().catch(()=>{}):Promise.resolve():new Promise(g=>{let l=!1;const p=()=>{l||(l=!0,typeof r.decode=="function"?r.decode().then(g).catch(g):g())};r.addEventListener("load",p,{once:!0}),r.addEventListener("error",()=>{l||(l=!0,g())},{once:!0}),setTimeout(p,2e3)}))),await new Promise(r=>setTimeout(r,120))),window.print();let d=!1;const n=()=>{d||(d=!0,document.title=s,e.style.display="none",e.innerHTML="",a&&(o?a.setAttribute("style",o):a.removeAttribute("style")))};typeof window<"u"&&("onafterprint"in window||typeof window.addEventListener=="function")?(window.addEventListener("afterprint",n,{once:!0}),setTimeout(n,6e4)):setTimeout(n,2e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(d=>d.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=this.collectForm(),a={...i,specialita:i.specialita||[],nome:e.nome||i.nome,cognome:e.cognome||i.cognome},o=await this.loadChallenges(),s=await this.loadSpecialitaList(),c=this.generateScoutSentieroHtml(a,o,s);this._printHtmlInArea(c,`Il Sentiero di ${a.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.allScouts||this.state.scouts||[]).find(a=>a.id===t);if(!i){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.generateScoutSentieroHtml(i,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(e,`Il Sentiero di ${i.nome||""}`)}catch(i){this.hideLoadingOverlay(),console.error("Errore stampa singola:",i),this.showToast("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,i){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.state.allScouts||this.state.scouts||[],a=[];if(t.forEach((o,s)=>{const c=e.find(n=>n.id===o);if(!c)return;let d=this.generateScoutSentieroHtml(c,this.challengesData,this.specialitaListData);s<t.length-1&&(d+='<div style="page-break-after: always;"></div>'),a.push(d)}),a.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(a.join(`
`),i||"Schede Sentiero Reparto")}catch(e){this.hideLoadingOverlay(),console.error("Errore stampa batch:",e),this.showToast("Errore stampa: "+e.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const i=this.qs("#san_cert_status_badge");if(!i)return;const e=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),a=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,o=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,s={...t||{},san_cert_scadenza:e,doc_priv:a,doc_san:o},c=this.getScoutMedicalStatus?this.getScoutMedicalStatus(s):null;c&&(i.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${c.badgeClass}`,i.textContent=`🩺 ${c.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const i=t||{},e=`${i.nome||""} ${i.cognome||""}`.trim()||"Esploratore",a=i.pv_pattuglia||"Reparto",o=i.cp_vcp||"Esploratore",s=i.anag_dob||i.dataNascita;let c="Non indicata",d="";if(s){const z=this.toJsDate?this.toJsDate(s):new Date(s);if(!isNaN(z.getTime())){c=z.toLocaleDateString("it-IT");const D=Date.now()-z.getTime(),M=new Date(D),E=Math.abs(M.getUTCFullYear()-1970);E>=0&&E<100&&(d=` (${E} anni)`)}}const n=i.anag_pob||"-",r=i.anag_cf?i.anag_cf.toUpperCase():"-",g=i.anag_indirizzo||"-",l=i.ct_g1_nome||"Genitore 1",p=i.ct_g1_rel?` (${i.ct_g1_rel})`:"",u=i.ct_g1_tel||i.anag_telefono||"Non specificato",f=i.ct_g2_nome||"Genitore 2",_=i.ct_g2_rel?` (${i.ct_g2_rel})`:"",h=i.ct_g2_tel||"-",m=i.ct_med_nome||"-",y=i.ct_med_tel||"-",w=i.san_gruppo||"N.D.",v=(i.san_intolleranze||"").trim(),x=(i.san_allergie||"").trim(),S=(i.san_farmaci||"").trim(),b=(i.san_vaccinazioni||"").trim(),C=i.san_cert_scadenza?this.toJsDate?this.toJsDate(i.san_cert_scadenza).toLocaleDateString("it-IT"):i.san_cert_scadenza:"Non specificata",L=(i.san_cert||"").trim(),I=(i.san_altro||"").trim(),$=this.getScoutMedicalStatus?this.getScoutMedicalStatus(i):null,q=$?$.statusLabel:i.san_cert_scadenza?"Registrato":"Mancante",A=$&&$.color==="green"?"#16a34a":$&&$.color==="yellow"?"#d97706":"#dc2626",P=!!i.doc_priv,k=!!i.doc_san;return`
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
            <strong>Nato il:</strong> ${c}${d} &nbsp;•&nbsp; <strong>A:</strong> ${n}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${r}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${g}
          </div>
        </div>

        <div style="text-align: right; border-left: 1.5px solid #e5e7eb; padding-left: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Pattuglia & Ruolo</div>
          <div style="font-size: 16px; font-weight: 800; color: #15803d;">
            Ptg. ${a}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${l}${p}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${u}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${f}${_}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${h}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${m}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 1px;">
              📞 ${y}
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
            ${w}
          </div>
        </div>

        <!-- Allergie -->
        <div style="border: 1.5px solid ${x?"#ef4444":"#e5e7eb"}; background: ${x?"#fef2f2":"#ffffff"}; border-radius: 8px; padding: 8px 12px;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${x?"#b91c1c":"#4b5563"}; display: flex; items-center; justify-content: space-between;">
            <span>⚠️ Allergie (Farmaci/Cibo/Insetti)</span>
            ${x?'<span style="color:#dc2626; font-weight:900;">ATTENZIONE</span>':""}
          </div>
          <div style="font-size: 12px; font-weight: ${x?"700":"400"}; color: ${x?"#991b1b":"#6b7280"}; margin-top: 4px; min-height: 38px;">
            ${x||"Nessuna allergia nota segnalata."}
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
          <div style="font-size: 11px; color: ${S?"#0f172a":"#64748b"}; font-weight: ${S?"600":"400"}; min-height: 36px;">
            ${S||"Nessuna terapia farmacologica continuativa indicata."}
          </div>
        </div>

        <!-- Vaccinazioni & Antitetanica -->
        <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
          <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
            💉 Vaccinazioni & Richiamo Antitetanica
          </div>
          <div style="font-size: 11px; color: #0f172a; min-height: 36px;">
            ${b||"Regolari secondo calendario vaccinale nazionale."}
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
            <span style="color: #475569;">(Scadenza: <strong>${C}</strong>)</span>
          </div>
          ${L?`<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${L}</div>`:""}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Consensi e Altre Indicazioni</div>
          <div style="display: flex; gap: 12px; margin-top: 2px; font-size: 11px;">
            <span>Privacy: <strong>${P?"✅ Depositata":"❌ Mancante"}</strong></span>
            <span>Scheda Firmata: <strong>${k?"✅ Depositata":"❌ Mancante"}</strong></span>
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
  `};UI.printScoutMedicalSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(s=>s.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=typeof this.collectForm=="function"?this.collectForm():{},a={...i,...e,nome:e.nome||i.nome,cognome:e.cognome||i.cognome},o=this.generateScoutMedicalSheetHtml(a);this._printHtmlInArea(o,`Scheda Sanitaria - ${a.nome||""} ${a.cognome||""}`)}catch(t){console.error("Errore generazione scheda sanitaria:",t),this.showToast("Errore durante la generazione della scheda sanitaria: "+t.message,{type:"error",duration:4e3})}};UI.printMedicalSingle=async function(t){try{if(!t){this.showToast?.("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay?.("Preparazione scheda sanitaria..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).find(o=>o.id===t);if(!e){this.hideLoadingOverlay?.(),this.showToast?.("Esploratore non trovato",{type:"error"});return}const a=this.generateScoutMedicalSheetHtml(e);if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(a,`Scheda Sanitaria - ${e.nome||""} ${e.cognome||""}`);else{const o=window.open("","_blank");o&&(o.document.write(`
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
              ${a}
            </body>
          </html>
        `),o.document.close())}}catch(i){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",i),this.showToast?.("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,i="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).filter(s=>!s.archived),a=t&&t.length>0?t.map(s=>e.find(c=>c.id===s)).filter(Boolean):e.slice().sort((s,c)=>{const d=s.pv_pattuglia||"",n=c.pv_pattuglia||"";if(d!==n)return d.localeCompare(n,"it");const r=s.cognome||"",g=c.cognome||"";return r.localeCompare(g,"it")});if(a.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const o=a.map((s,c)=>{let d=this.generateScoutMedicalSheetHtml(s);return c<a.length-1&&(d+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),d});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(o.join(`
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
              ${o.join(`
`)}
            </body>
          </html>
        `),s.document.close())}}catch(e){this.hideLoadingOverlay?.(),console.error("Errore stampa batch schede sanitarie:",e),this.showToast?.("Errore stampa cartellina: "+e.message,{type:"error",duration:4e3})}};
