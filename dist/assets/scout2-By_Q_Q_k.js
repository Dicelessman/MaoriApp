import{n as U,f as T,a as N}from"./date-picker-BjXxsVKQ.js";import"./shared-CmCf5JfY.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const a=new URLSearchParams(location.search).get("id");if(!a){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=a,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(c=>{const p=this.qs(`#${c}`);p&&(p.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());const e=(this.state.allScouts||this.state.scouts||[]).find(c=>c.id===a);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const i=(c,p)=>{const u=this.qs(c);u&&(u.value=p??"")};i("#anag_nome",e.nome),i("#anag_cognome",e.cognome),i("#anag_dob",this.toYyyyMmDd(e.anag_dob)),i("#anag_sesso",e.anag_sesso),i("#anag_cf",e.anag_cf),i("#anag_indirizzo",e.anag_indirizzo),i("#anag_citta",e.anag_citta),i("#anag_email",e.anag_email),i("#anag_telefono",e.anag_telefono),i("#ct_g1_nome",e.ct_g1_nome),i("#ct_g1_tel",e.ct_g1_tel),i("#ct_g1_email",e.ct_g1_email),i("#ct_g2_nome",e.ct_g2_nome),i("#ct_g2_tel",e.ct_g2_tel),i("#ct_g2_email",e.ct_g2_email),i("#san_gruppo",e.san_gruppo),i("#san_intolleranze",e.san_intolleranze),i("#san_allergie",e.san_allergie),i("#san_farmaci",e.san_farmaci),i("#san_vaccinazioni",e.san_vaccinazioni),i("#san_cert",e.san_cert),i("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),i("#san_altro",e.san_altro),i("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const o=this.qs(`input[name="pv_vcp_cp"][value="${e.pv_vcp_cp}"]`);o&&(o.checked=!0),i("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),i("#pv_giglio_note",e.pv_giglio_note),i("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const c=["io","al","mt"];["1","2","3"].forEach(u=>{c.forEach(f=>{const m=this.qs(`#pv_sfida_${f}_${u}_text`);m&&this.autoResizeTextarea(m)})})},200),i("#pv_note",e.pv_note),i("#pv_traccia1_note",e.pv_traccia1_note),i("#pv_traccia2_note",e.pv_traccia2_note),i("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(p=>{const u=this.qs(`#${p}`);u&&this.autoResizeTextarea(u)})},250),i("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),i("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),i("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),i("#ev_note",e.ev_note);const n=c=>{if(!c)return"";const p=this.toJsDate(c);return isNaN(p.getTime())?"":p.getFullYear().toString()};i("#doc_quota1",n(e.doc_quota1)),i("#doc_quota2",n(e.doc_quota2)),i("#doc_quota3",n(e.doc_quota3)),i("#doc_quota4",n(e.doc_quota4));const l=(c,p)=>{const u=this.qs(c);u&&(u.checked=!!p)};l("#doc_iscr",e.doc_iscr),l("#doc_priv",e.doc_priv),l("#doc_san",e.doc_san),l("#doc_liberatoria",e.doc_liberatoria),i("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const d=this.qs("#san_cert_scadenza");if(d&&!d._bound){d._bound=!0;const c=()=>this.updateMedicalStatusBadge(this.currentScout);d.addEventListener("input",c),d.addEventListener("change",c),this.qs("#doc_priv")?.addEventListener("change",c),this.qs("#doc_san")?.addEventListener("change",c)}const s=this.qs("#sendWhatsAppReminderBtn");s&&!s._bound&&(s._bound=!0,s.addEventListener("click",()=>{const c=this.currentScout||{},p=this.qs("#san_cert_scadenza")?.value||"",u=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...c,san_cert_scadenza:p,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,f=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||c.ct_g1_tel||c.anag_telefono||"",m=`${this.qs("#anag_nome")?.value||c.nome||""} ${this.qs("#anag_cognome")?.value||c.cognome||""}`.trim(),g=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:m,scadenzaStr:u?.formattedDate||p,telGenitore:f,certStatus:u?.certStatus||"expiring",missingDocs:u?.missingDocuments||[]}):null;g&&g.url&&window.open(g.url,"_blank")}));const r=this.qs("#scoutForm");r&&!r._bound&&(r._bound=!0,r.addEventListener("submit",async c=>{if(c.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const p=r.querySelector('button[type="submit"]'),u=p?.textContent;this.setButtonLoading(p,!0,u);try{const f=this.collectForm();await DATA.updateScout(a,f,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.showToast("Scheda salvata")}catch(f){console.error("Errore salvataggio scheda:",f),this.showToast("Errore durante il salvataggio: "+(f.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(p,!1,u)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const h=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",h),this.qs("#printMedicalSectionBtn")?.addEventListener("click",h),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const a=["io","al","mt"];["1","2","3"].forEach(i=>{a.forEach(o=>{const n=`#pv_sfida_${o}_${i}`,l=this.qs(n);if(!l)return;const d=o.toUpperCase(),s=t[i]?.[d]||[];l.innerHTML='<option value="">Seleziona sfida...</option>',s.forEach(r=>{const h=document.createElement("option");h.value=r.code,h.textContent=r.code,l.appendChild(h)}),l.addEventListener("change",()=>{const r=l.value,h=this.qs(`#pv_sfida_${o}_${i}_text`);if(h){const c=s.find(p=>p.code===r);h.value=c?c.text:"",this.autoResizeTextarea(h)}})})})};UI.loadChallengeData=function(t){const a=["io","al","mt"];["1","2","3"].forEach(i=>{a.forEach(o=>{const n=`pv_sfida_${o}_${i}`,l=`pv_sfida_${o}_${i}_data`,d=`pv_sfida_${o}_${i}_text`;let s=t[n],r=t[l];if(!s){const p={io:"io",al:"re",mt:"im"},u={io:"IO",al:"AL",mt:"MT"},f=p[o],m=`pv_sfida_${f}_${i}`,g=t[m];if(g&&typeof g=="string")s=g.replace("-RE-","-AL-").replace("-IM-","-MT-"),r||(r=t[`${m}_data`]);else for(let _=1;_<=4;_++){const y=t[`pv_${f}_${i}${_}`];if(y&&y.done){s=`${i}-${u[o]}-${_}`,!r&&y.data&&(r=y.data);break}}}const h=this.qs(`#pv_sfida_${o}_${i}`),c=this.qs(`#${l}`);this.qs(`#${d}`),h&&s&&(h.value=s,h.dispatchEvent(new Event("change")),setTimeout(()=>{const p=this.qs(`#${d}`);p&&this.autoResizeTextarea(p)},100)),c&&r&&(c.value=this.toYyyyMmDd(r))})})};UI.loadSpecialita=function(t){const a=this.qs("#specialitaContainer");a&&(a.innerHTML="",t.forEach((e,i)=>this.addSpecialita(e,i)))};UI.applySpecialitaColors=function(t,a){if(!t)return;const e="white",i="gray",o=a?.sfondo_colore||e,n=a?.bordo_colore||i;t.style.backgroundColor=o,t.style.border=`3px solid ${n}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,a=null){const e=this.qs("#specialitaContainer");if(!e)return;const i=a!==null?a:e.children.length,o=`sp_${i}`,n=await this.loadSpecialitaList(),l=t?.nome?U(t.nome):"",d=t?.nome&&n?n.find(g=>g.nome===t.nome||g.nome===l):null,s=d?.nome||t?.nome&&String(t.nome).trim()||"",r=s?T(s):"",h=d?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],c=document.createElement("div");c.className="rounded-lg overflow-hidden",this.applySpecialitaColors(c,d),c.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${i}">
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
              ${n.map(g=>`<option value="${g.nome}" ${t?.nome===g.nome||l===g.nome?"selected":""}>${g.nome} (${g.categoria||(g.sfondo_colore==="green"?"Verdi":"Gialle")}${g.ambito?" - "+g.ambito:""})</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${h.map((g,_)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${g.nome}</label>
                <input id="${o}_${g.id}_data" type="date" class="input" value="${t?.[`${g.id}_data`]?this.toYyyyMmDd(t[`${g.id}_data`]):""}" />
              </div>
              <textarea id="${o}_${g.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${g.text||""}</textarea>
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
  `,e.appendChild(c),setTimeout(()=>{h.forEach(_=>{const y=c.querySelector(`#${o}_${_.id}_text`);y&&this.autoResizeTextarea(y)});const g=c.querySelector(`#${o}_note`);g&&this.autoResizeTextarea(g)},50),c.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{c.remove(),this.renumberSpecialita()});const p=c.querySelector(`#${o}_nome`),u=c.querySelector(`#${o}_title`),f=c.querySelector(`#${o}_badge`),m=c.querySelector(`#${o}_select_badge`);p&&u&&p.addEventListener("change",async()=>{const g=p.value||"";u.textContent=g||"Specialità";const _=g?T(g):"";f&&(_?(f.src=`img/specialita/${_}.png`,f.style.display=""):f.style.display="none"),m&&(_?(m.src=`img/specialita/${_}.png`,m.style.display=""):m.style.display="none");const $=(await this.loadSpecialitaList()).find(v=>v.nome===g);this.applySpecialitaColors(c,$),$&&$.prove&&$.prove.forEach(v=>{const x=c.querySelector(`#${o}_${v.id}_data`);if(x){let b=x.previousElementSibling;for(;b&&b.tagName!=="LABEL";)b=b.previousElementSibling;b&&b.tagName==="LABEL"&&(b.textContent=v.nome)}const S=c.querySelector(`#${o}_${v.id}_text`);S&&(S.value=v.text||"",this.autoResizeTextarea(S))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((a,e)=>{const i=a.querySelector(".removeSpecialitaBtn"),o=a.querySelector(".specialita-header");i&&(i.dataset.index=e),o&&(o.dataset.specialita=e)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const e=Array.from(t.children).map(n=>{const l=n.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",d=h=>{const c=this.qs(`#${l}${h}`);if(!c)return null;const p=c.value?.trim()||"";return p===""?null:p},s=h=>!!this.qs(`#${l}${h}`)?.checked,r={nome:d("_nome")||"",ottenuta:!!this.qs(`#${l}_ott_chk`)?.checked,brevetto:s("_brevetto"),distintivo:s("_distintivo"),data:d("_data"),p1_data:d("_p1_data"),p2_data:d("_p2_data"),p3_data:d("_p3_data"),cr_text:d("_cr_text")||"",cr_data:d("_cr_data"),note:d("_note")||""};return r._hasData=!!(r.nome.trim()&&(r.ottenuta||r.brevetto||r.distintivo||r.data||r.p1_data||r.p2_data||r.p3_data||r.cr_data||r.cr_text&&r.cr_text.trim()||r.note&&r.note.trim())),r}).filter(n=>n.nome&&n.nome.trim()),i=new Map,o=[];return e.forEach(n=>{const l=n.nome.trim().toLowerCase(),d=i.get(l);if(!d)i.set(l,n),o.push(n);else if(n._hasData&&!d._hasData){const s=o.indexOf(d);s!==-1&&(o[s]=n,i.set(l,n))}else n._hasData,d._hasData}),o.map(({_hasData:n,...l})=>l)};UI.setCheckDate=function(t,a){const e=a?.data?this.toYyyyMmDd(a.data):this.toYyyyMmDd(a),i=a?.done??(a&&typeof a=="object"?!1:!!a),o=a?.brevetto??!1,n=a?.distintivo??!1,l=this.qs(`#${t}_chk`),d=this.qs(`#${t}_dt`),s=this.qs(`#${t}_brevetto`),r=this.qs(`#${t}_distintivo`);l&&(l.checked=!!i),d&&(d.value=e||""),s&&(s.checked=!!o),r&&(r.checked=!!n)};UI.setPair=function(t,a){const e=this.qs(`${t}_dt`),i=this.qs(`${t}_tx`);e&&(e.value=this.toYyyyMmDd(a?.data||a)||""),i&&(i.value=a?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const a=this.toJsDate(t);return isNaN(a)?"":a.toISOString().split("T")[0]};UI.collectForm=function(){const t=s=>this.qs(s)?.value?.trim()||"",a=s=>this.qs(s)?.value||"",e=s=>!!this.qs(s)?.checked,i=s=>({data:t(`${s}_dt`)||null,testo:t(`${s}_tx`)||""}),o=s=>({done:e(`#${s}_chk`),data:t(`#${s}_dt`)||null,brevetto:e(`#${s}_brevetto`),distintivo:e(`#${s}_distintivo`)}),n={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:a("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:a("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:a("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_intolleranze:t("#san_intolleranze"),san_allergie:t("#san_allergie"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:i("#ev_ce1"),ev_ce2:i("#ev_ce2"),ev_ce3:i("#ev_ce3"),ev_ce4:i("#ev_ce4"),ev_ccp:i("#ev_ccp"),ev_tc1:i("#ev_tc1"),ev_tc2:i("#ev_tc2"),ev_tc3:i("#ev_tc3"),ev_tc4:i("#ev_tc4"),ev_jam:i("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:o("pv_traccia1"),pv_traccia2:o("pv_traccia2"),pv_traccia3:o("pv_traccia3"),doc_quota1:(()=>{const s=t("#doc_quota1");return s&&s.trim()!==""?`${s}-01-01`:null})(),doc_quota2:(()=>{const s=t("#doc_quota2");return s&&s.trim()!==""?`${s}-01-01`:null})(),doc_quota3:(()=>{const s=t("#doc_quota3");return s&&s.trim()!==""?`${s}-01-01`:null})(),doc_quota4:(()=>{const s=t("#doc_quota4");return s&&s.trim()!==""?`${s}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},l=["io","al","mt"];return["1","2","3"].forEach(s=>{l.forEach(r=>{const h=`pv_sfida_${r}_${s}`,c=`pv_sfida_${r}_${s}_data`;n[h]=t(`#pv_sfida_${r}_${s}`),n[c]=t(`#pv_sfida_${r}_${s}_data`)||null})}),n};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const a=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(e=>{const i=document.createElement("option");i.value=e,i.textContent=e,t.appendChild(i)}),a&&this.pattuglie.includes(a)&&(t.value=a)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((a,e)=>{const i=document.createElement("div");i.className="flex items-center justify-between p-2 bg-gray-50 rounded border",i.innerHTML=`
      <input type="text" value="${a}" class="input flex-1 mr-2" data-index="${e}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${e})">
        🗑️
      </button>
    `,t.appendChild(i)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),a=t.value.trim();if(!a){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(a)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(a),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),a=[];if(t.forEach(o=>{const n=o.value.trim();n&&!a.includes(n)&&a.push(n)}),a.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const e=this.qs("#savePattugliaBtn"),i=e.textContent;e.textContent="Salvataggio...",e.disabled=!0;try{this.pattuglie=a,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(o){console.error("Errore salvataggio pattuglie:",o),this.showToast("Errore salvataggio: "+o.message,{type:"error"})}finally{e.textContent=i,e.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",a=>{const e=a.target.closest(".traccia-header");if(!e)return;if(console.log("Click su header traccia:",e.dataset.traccia),a.target.type==="checkbox"||a.target.type==="date"){console.log("Click su input, ignorato");return}const i=e.dataset.traccia;console.log("Toggling traccia:",i),this.toggleTracciaSection(i)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const a=document.querySelector(`.traccia-header[data-traccia="${t}"]`),e=a?.nextElementSibling,i=a?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!a,content:!!e,icon:!!i}),!a||!e||!i){console.error("Elementi non trovati per traccia:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione..."),e.classList.remove("expanded"),i.classList.remove("rotated")):(console.log("Espandendo sezione..."),e.classList.add("expanded"),i.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",i.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",a=>{const e=a.target.closest(".specialita-header");if(!e)return;if(console.log("Click su header specialità:",e.dataset.specialita),a.target.type==="checkbox"||a.target.type==="date"||a.target.tagName==="SELECT"||a.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const i=e.dataset.specialita;console.log("Toggling specialità:",i),this.toggleSpecialitaSection(i)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const a=document.querySelector(`.specialita-header[data-specialita="${t}"]`),e=a?.nextElementSibling,i=a?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!a,content:!!e,icon:!!i}),!a||!e||!i){console.error("Elementi non trovati per specialità:",t);return}const o=e.classList.contains("expanded");console.log("Stato attuale - espanso:",o),o?(console.log("Contraendo sezione specialità..."),e.classList.remove("expanded"),i.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),e.classList.add("expanded"),i.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",i.className)};UI.initSectionNavigation=function(){const t=document.querySelectorAll(".section-nav-link"),a=document.querySelectorAll('section[id^="section-"]'),e=()=>{const o=window.scrollY+150;a.forEach(n=>{const l=n.offsetTop,d=n.offsetHeight,s=n.id;if(o>=l&&o<l+d){t.forEach(h=>{h.classList.remove("bg-green-100","text-green-700","font-semibold"),document.documentElement.dataset.theme==="dark"&&h.classList.remove("bg-green-800","text-green-300")});const r=document.querySelector(`a[href="#${s}"]`);r&&(r.classList.add("bg-green-100","text-green-700","font-semibold"),document.documentElement.dataset.theme==="dark"&&(r.classList.add("bg-green-800","text-green-300"),r.classList.remove("bg-green-100","text-green-700")))}})};let i;window.addEventListener("scroll",()=>{clearTimeout(i),i=setTimeout(e,50)}),e(),t.forEach(o=>{o.addEventListener("click",n=>{n.preventDefault();const l=o.getAttribute("href").substring(1),d=document.getElementById(l);if(d){const s=d.offsetTop-80;window.scrollTo({top:s,behavior:"smooth"})}})})};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},500)});UI.generateScoutSentieroHtml=N;UI._printHtmlInArea=async function(t,a){let e=this.qs?this.qs("#printArea"):document.getElementById("printArea");e||(e=document.createElement("div"),e.id="printArea",e.style.display="none",document.body.appendChild(e)),e.innerHTML=t,e.style.display="block";const i=document.getElementById("app");let o="";i&&(o=i.getAttribute("style")||"",i.style.setProperty("display","none","important"));const n=document.title;document.title=a||n;const l=Array.from(e.querySelectorAll("img"));l.length>0&&(await Promise.all(l.map(r=>r.complete&&r.naturalWidth>0?typeof r.decode=="function"?r.decode().catch(()=>{}):Promise.resolve():new Promise(h=>{let c=!1;const p=()=>{c||(c=!0,typeof r.decode=="function"?r.decode().then(h).catch(h):h())};r.addEventListener("load",p,{once:!0}),r.addEventListener("error",()=>{c||(c=!0,h())},{once:!0}),setTimeout(p,2e3)}))),await new Promise(r=>setTimeout(r,120))),window.print();let d=!1;const s=()=>{d||(d=!0,document.title=n,e.style.display="none",e.innerHTML="",i&&(o?i.setAttribute("style",o):i.removeAttribute("style")))};typeof window<"u"&&("onafterprint"in window||typeof window.addEventListener=="function")?(window.addEventListener("afterprint",s,{once:!0}),setTimeout(s,6e4)):setTimeout(s,2e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.scouts||[]).find(d=>d.id===t);if(!a){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=this.collectForm(),i={...a,specialita:a.specialita||[],nome:e.nome||a.nome,cognome:e.cognome||a.cognome},o=await this.loadChallenges(),n=await this.loadSpecialitaList(),l=this.generateScoutSentieroHtml(i,o,n);this._printHtmlInArea(l,`Il Sentiero di ${i.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.allScouts||this.state.scouts||[]).find(i=>i.id===t);if(!a){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.generateScoutSentieroHtml(a,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(e,`Il Sentiero di ${a.nome||""}`)}catch(a){this.hideLoadingOverlay(),console.error("Errore stampa singola:",a),this.showToast("Errore stampa: "+a.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,a){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.state.allScouts||this.state.scouts||[],i=[];if(t.forEach((o,n)=>{const l=e.find(s=>s.id===o);if(!l)return;let d=this.generateScoutSentieroHtml(l,this.challengesData,this.specialitaListData);n<t.length-1&&(d+='<div style="page-break-after: always;"></div>'),i.push(d)}),i.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(i.join(`
`),a||"Schede Sentiero Reparto")}catch(e){this.hideLoadingOverlay(),console.error("Errore stampa batch:",e),this.showToast("Errore stampa: "+e.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const a=this.qs("#san_cert_status_badge");if(!a)return;const e=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),i=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,o=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,n={...t||{},san_cert_scadenza:e,doc_priv:i,doc_san:o},l=this.getScoutMedicalStatus?this.getScoutMedicalStatus(n):null;l&&(a.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${l.badgeClass}`,a.textContent=`🩺 ${l.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const a=t||{},e=`${a.nome||""} ${a.cognome||""}`.trim()||"Esploratore",i=a.pv_pattuglia||"Reparto",o=a.cp_vcp||"Esploratore",n=a.anag_dob||a.dataNascita;let l="Non indicata",d="";if(n){const z=this.toJsDate?this.toJsDate(n):new Date(n);if(!isNaN(z.getTime())){l=z.toLocaleDateString("it-IT");const k=Date.now()-z.getTime(),M=new Date(k),E=Math.abs(M.getUTCFullYear()-1970);E>=0&&E<100&&(d=` (${E} anni)`)}}const s=a.anag_pob||"-",r=a.anag_cf?a.anag_cf.toUpperCase():"-",h=a.anag_indirizzo||"-",c=a.ct_g1_nome||"Genitore 1",p=a.ct_g1_rel?` (${a.ct_g1_rel})`:"",u=a.ct_g1_tel||a.anag_telefono||"Non specificato",f=a.ct_g2_nome||"Genitore 2",m=a.ct_g2_rel?` (${a.ct_g2_rel})`:"",g=a.ct_g2_tel||"-",_=a.ct_med_nome||"-",y=a.ct_med_tel||"-",$=a.san_gruppo||"N.D.",v=(a.san_intolleranze||"").trim(),x=(a.san_allergie||"").trim(),S=(a.san_farmaci||"").trim(),b=(a.san_vaccinazioni||"").trim(),C=a.san_cert_scadenza?this.toJsDate?this.toJsDate(a.san_cert_scadenza).toLocaleDateString("it-IT"):a.san_cert_scadenza:"Non specificata",L=(a.san_cert||"").trim(),I=(a.san_altro||"").trim(),w=this.getScoutMedicalStatus?this.getScoutMedicalStatus(a):null,q=w?w.statusLabel:a.san_cert_scadenza?"Registrato":"Mancante",A=w&&w.color==="green"?"#16a34a":w&&w.color==="yellow"?"#d97706":"#dc2626",P=!!a.doc_priv,D=!!a.doc_san;return`
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
            <strong>Nato il:</strong> ${l}${d} &nbsp;•&nbsp; <strong>A:</strong> ${s}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${r}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${h}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${c}${p}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${u}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${f}${m}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${g}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${_}</div>
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
            ${$}
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
            <span>Scheda Firmata: <strong>${D?"✅ Depositata":"❌ Mancante"}</strong></span>
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
  `};UI.printScoutMedicalSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const a=(this.state.scouts||[]).find(n=>n.id===t);if(!a){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=typeof this.collectForm=="function"?this.collectForm():{},i={...a,...e,nome:e.nome||a.nome,cognome:e.cognome||a.cognome},o=this.generateScoutMedicalSheetHtml(i);this._printHtmlInArea(o,`Scheda Sanitaria - ${i.nome||""} ${i.cognome||""}`)}catch(t){console.error("Errore generazione scheda sanitaria:",t),this.showToast("Errore durante la generazione della scheda sanitaria: "+t.message,{type:"error",duration:4e3})}};UI.printMedicalSingle=async function(t){try{if(!t){this.showToast?.("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay?.("Preparazione scheda sanitaria..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).find(o=>o.id===t);if(!e){this.hideLoadingOverlay?.(),this.showToast?.("Esploratore non trovato",{type:"error"});return}const i=this.generateScoutMedicalSheetHtml(e);if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(i,`Scheda Sanitaria - ${e.nome||""} ${e.cognome||""}`);else{const o=window.open("","_blank");o&&(o.document.write(`
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
        `),o.document.close())}}catch(a){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",a),this.showToast?.("Errore stampa: "+a.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,a="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).filter(n=>!n.archived),i=t&&t.length>0?t.map(n=>e.find(l=>l.id===n)).filter(Boolean):e.slice().sort((n,l)=>{const d=n.pv_pattuglia||"",s=l.pv_pattuglia||"";if(d!==s)return d.localeCompare(s,"it");const r=n.cognome||"",h=l.cognome||"";return r.localeCompare(h,"it")});if(i.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const o=i.map((n,l)=>{let d=this.generateScoutMedicalSheetHtml(n);return l<i.length-1&&(d+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),d});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(o.join(`
`),a);else{const n=window.open("","_blank");n&&(n.document.write(`
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
        `),n.document.close())}}catch(e){this.hideLoadingOverlay?.(),console.error("Errore stampa batch schede sanitarie:",e),this.showToast?.("Errore stampa cartellina: "+e.message,{type:"error",duration:4e3})}};
