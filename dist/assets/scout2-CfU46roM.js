import"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.challengesData=null;UI.specialitaListData=null;UI._jsonLoadPromises={};UI.loadChallenges=async function(){if(this.challengesData)return this.challengesData;if(this._jsonLoadPromises.challenges)return await this._jsonLoadPromises.challenges;try{return this._jsonLoadPromises.challenges=fetch("challenges.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.challengesData=t,delete this._jsonLoadPromises.challenges;try{console.info("[Cache] challenges.json loaded")}catch{}return t}),await this._jsonLoadPromises.challenges}catch(t){return console.error("Errore caricamento challenges.json:",t),delete this._jsonLoadPromises.challenges,{}}};UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;if(this._jsonLoadPromises.specialita)return await this._jsonLoadPromises.specialita;try{return this._jsonLoadPromises.specialita=fetch("specialita.json").then(t=>{if(!t.ok)throw new Error(`HTTP ${t.status}`);return t.json()}).then(t=>{this.specialitaListData=t,delete this._jsonLoadPromises.specialita;try{console.info("[Cache] specialita.json loaded")}catch{}return t}),await this._jsonLoadPromises.specialita}catch(t){return console.error("Errore caricamento specialita.json:",t),delete this._jsonLoadPromises.specialita,[]}};UI.autoResizeTextarea=function(t){t&&(t.style.height="auto",t.style.height=t.scrollHeight+"px")};UI.renderCurrentPage=function(){this.renderScoutPage()};UI.renderScoutPage=async function(){if(this._isRenderingScoutPage){console.log("[Scout2] Render già in corso, skip");return}this._isRenderingScoutPage=!0;try{const i=new URLSearchParams(location.search).get("id");if(!i){this.qs("#scoutTitle").textContent="Scheda Esploratore — ID mancante";return}this.qs("#scoutId").value=i,["doc_quota1","doc_quota2","doc_quota3","doc_quota4"].forEach(c=>{const h=this.qs(`#${c}`);h&&(h.min="2022")}),await this.loadChallenges(),await this.loadSpecialitaList(),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll(),this.rebuildPresenceIndex());const e=(this.state.allScouts||this.state.scouts||[]).find(c=>c.id===i);if(!e){this.qs("#scoutTitle").textContent="Scheda Esploratore — non trovato";return}this.qs("#scoutTitle").textContent=`${e.nome||""} ${e.cognome||""}`.trim();const a=(c,h)=>{const r=this.qs(c);r&&(r.value=h??"")};a("#anag_nome",e.nome),a("#anag_cognome",e.cognome),a("#anag_dob",this.toYyyyMmDd(e.anag_dob)),a("#anag_sesso",e.anag_sesso),a("#anag_cf",e.anag_cf),a("#anag_indirizzo",e.anag_indirizzo),a("#anag_citta",e.anag_citta),a("#anag_email",e.anag_email),a("#anag_telefono",e.anag_telefono),a("#ct_g1_nome",e.ct_g1_nome),a("#ct_g1_tel",e.ct_g1_tel),a("#ct_g1_email",e.ct_g1_email),a("#ct_g2_nome",e.ct_g2_nome),a("#ct_g2_tel",e.ct_g2_tel),a("#ct_g2_email",e.ct_g2_email),a("#san_gruppo",e.san_gruppo),a("#san_intolleranze",e.san_intolleranze),a("#san_allergie",e.san_allergie),a("#san_farmaci",e.san_farmaci),a("#san_vaccinazioni",e.san_vaccinazioni),a("#san_cert",e.san_cert),a("#san_cert_scadenza",this.toYyyyMmDd(e.san_cert_scadenza)),a("#san_altro",e.san_altro),a("#pv_promessa",this.toYyyyMmDd(e.pv_promessa));const s=this.qs(`input[name="pv_vcp_cp"][value="${e.pv_vcp_cp}"]`);s&&(s.checked=!0),a("#pv_giglio_data",this.toYyyyMmDd(e.pv_giglio_data)),a("#pv_giglio_note",e.pv_giglio_note),a("#pv_pattuglia",e.pv_pattuglia),this.setCheckDate("pv_traccia1",e.pv_traccia1),this.setCheckDate("pv_traccia2",e.pv_traccia2),this.setCheckDate("pv_traccia3",e.pv_traccia3),this.populateChallengeDropdowns(),this.loadChallengeData(e),setTimeout(()=>{const c=["io","al","mt"];["1","2","3"].forEach(r=>{c.forEach(u=>{const v=this.qs(`#pv_sfida_${u}_${r}_text`);v&&this.autoResizeTextarea(v)})})},200),a("#pv_note",e.pv_note),a("#pv_traccia1_note",e.pv_traccia1_note),a("#pv_traccia2_note",e.pv_traccia2_note),a("#pv_traccia3_note",e.pv_traccia3_note),setTimeout(()=>{["pv_note","pv_traccia1_note","pv_traccia2_note","pv_traccia3_note","ev_note","doc_note"].forEach(h=>{const r=this.qs(`#${h}`);r&&this.autoResizeTextarea(r)})},250),a("#pv_sfida_bianca_1",e.pv_sfida_bianca_1),a("#pv_sfida_bianca_2",e.pv_sfida_bianca_2),a("#pv_sfida_bianca_3",e.pv_sfida_bianca_3),this.loadSpecialita(e.specialita||[]),this.setPair("#ev_ce1",e.ev_ce1),this.setPair("#ev_ce2",e.ev_ce2),this.setPair("#ev_ce3",e.ev_ce3),this.setPair("#ev_ce4",e.ev_ce4),this.setPair("#ev_ccp",e.ev_ccp),this.setPair("#ev_tc1",e.ev_tc1),this.setPair("#ev_tc2",e.ev_tc2),this.setPair("#ev_tc3",e.ev_tc3),this.setPair("#ev_tc4",e.ev_tc4),this.setPair("#ev_jam",e.ev_jam),a("#ev_note",e.ev_note);const n=c=>{if(!c)return"";const h=this.toJsDate(c);return isNaN(h.getTime())?"":h.getFullYear().toString()};a("#doc_quota1",n(e.doc_quota1)),a("#doc_quota2",n(e.doc_quota2)),a("#doc_quota3",n(e.doc_quota3)),a("#doc_quota4",n(e.doc_quota4));const d=(c,h)=>{const r=this.qs(c);r&&(r.checked=!!h)};d("#doc_iscr",e.doc_iscr),d("#doc_priv",e.doc_priv),d("#doc_san",e.doc_san),d("#doc_liberatoria",e.doc_liberatoria),a("#doc_note",e.doc_note),this.currentScout=e,this.updateMedicalStatusBadge(e);const p=this.qs("#san_cert_scadenza");if(p&&!p._bound){p._bound=!0;const c=()=>this.updateMedicalStatusBadge(this.currentScout);p.addEventListener("input",c),p.addEventListener("change",c),this.qs("#doc_priv")?.addEventListener("change",c),this.qs("#doc_san")?.addEventListener("change",c)}const o=this.qs("#sendWhatsAppReminderBtn");o&&!o._bound&&(o._bound=!0,o.addEventListener("click",()=>{const c=this.currentScout||{},h=this.qs("#san_cert_scadenza")?.value||"",r=this.getScoutMedicalStatus?this.getScoutMedicalStatus({...c,san_cert_scadenza:h,doc_priv:this.qs("#doc_priv")?.checked,doc_san:this.qs("#doc_san")?.checked}):null,u=this.qs("#ct_g1_tel")?.value||this.qs("#anag_telefono")?.value||c.ct_g1_tel||c.anag_telefono||"",v=`${this.qs("#anag_nome")?.value||c.nome||""} ${this.qs("#anag_cognome")?.value||c.cognome||""}`.trim(),m=this.generateWhatsAppReminderUrl?this.generateWhatsAppReminderUrl({scoutNome:v,scadenzaStr:r?.formattedDate||h,telGenitore:u,certStatus:r?.certStatus||"expiring",missingDocs:r?.missingDocuments||[]}):null;m&&m.url&&window.open(m.url,"_blank")}));const l=this.qs("#scoutForm");l&&!l._bound&&(l._bound=!0,l.addEventListener("submit",async c=>{if(c.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per salvare.",{type:"error"});return}const h=l.querySelector('button[type="submit"]'),r=h?.textContent;this.setButtonLoading(h,!0,r);try{const u=this.collectForm();await DATA.updateScout(i,u,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.showToast("Scheda salvata")}catch(u){console.error("Errore salvataggio scheda:",u),this.showToast("Errore durante il salvataggio: "+(u.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(h,!1,r)}}),this.qs("#btnAnnulla")?.addEventListener("click",()=>history.back()),this.qs("#addSpecialitaBtn")?.addEventListener("click",()=>this.addSpecialita())),this.qs("#printScoutBtn")?.addEventListener("click",async()=>{await UI.printScoutSheet()});const g=async()=>{await UI.printScoutMedicalSheet()};this.qs("#printMedicalBtn")?.addEventListener("click",g),this.qs("#printMedicalSectionBtn")?.addEventListener("click",g),this.initPattugliaManagement(),this.initTracciaSections(),this.initSpecialitaSections(),setTimeout(()=>{this.initSectionNavigation&&this.initSectionNavigation()},100)}finally{this._isRenderingScoutPage=!1}};UI.populateChallengeDropdowns=function(){const t=this.challengesData;if(!t)return;const i=["io","al","mt"];["1","2","3"].forEach(a=>{i.forEach(s=>{const n=`#pv_sfida_${s}_${a}`,d=this.qs(n);if(!d)return;const p=s.toUpperCase(),o=t[a]?.[p]||[];d.innerHTML='<option value="">Seleziona sfida...</option>',o.forEach(l=>{const g=document.createElement("option");g.value=l.code,g.textContent=l.code,d.appendChild(g)}),d.addEventListener("change",()=>{const l=d.value,g=this.qs(`#pv_sfida_${s}_${a}_text`);if(g){const c=o.find(h=>h.code===l);g.value=c?c.text:"",this.autoResizeTextarea(g)}})})})};UI.loadChallengeData=function(t){const i=["io","al","mt"];["1","2","3"].forEach(a=>{i.forEach(s=>{const n=`pv_sfida_${s}_${a}`,d=`pv_sfida_${s}_${a}_data`,p=`pv_sfida_${s}_${a}_text`;let o=t[n],l=t[d];if(!o){const h={io:"io",al:"re",mt:"im"},r={io:"IO",al:"AL",mt:"MT"},u=h[s],v=`pv_sfida_${u}_${a}`,m=t[v];if(m&&typeof m=="string")o=m.replace("-RE-","-AL-").replace("-IM-","-MT-"),l||(l=t[`${v}_data`]);else for(let f=1;f<=4;f++){const _=t[`pv_${u}_${a}${f}`];if(_&&_.done){o=`${a}-${r[s]}-${f}`,!l&&_.data&&(l=_.data);break}}}const g=this.qs(`#pv_sfida_${s}_${a}`),c=this.qs(`#${d}`);this.qs(`#${p}`),g&&o&&(g.value=o,g.dispatchEvent(new Event("change")),setTimeout(()=>{const h=this.qs(`#${p}`);h&&this.autoResizeTextarea(h)},100)),c&&l&&(c.value=this.toYyyyMmDd(l))})})};UI.loadSpecialita=function(t){const i=this.qs("#specialitaContainer");i&&(i.innerHTML="",t.forEach((e,a)=>this.addSpecialita(e,a)))};UI.applySpecialitaColors=function(t,i){if(!t)return;const e="white",a="gray",s=i?.sfondo_colore||e,n=i?.bordo_colore||a;t.style.backgroundColor=s,t.style.border=`3px solid ${n}`,t.style.borderRadius="0.5rem",t.style.overflow="hidden"};UI.addSpecialita=async function(t=null,i=null){const e=this.qs("#specialitaContainer");if(!e)return;const a=i!==null?i:e.children.length,s=`sp_${a}`,n=await this.loadSpecialitaList(),d=t?.nome?n.find(c=>c.nome===t.nome):null,p=d?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}],o=document.createElement("div");o.className="rounded-lg overflow-hidden",this.applySpecialitaColors(o,d),o.innerHTML=`
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${a}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h4 class="font-semibold text-lg"><span id="${s}_title">${t?.nome&&String(t.nome).trim()||"Specialità"}</span></h4>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${s}_ott_chk" ${t?.ottenuta?"checked":""} />
            <span>Ottenuta</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${s}_brevetto" ${t?.brevetto?"checked":""} />
            <span>Brevetto</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${s}_distintivo" ${t?.distintivo?"checked":""} />
            <span>Distintivo</span>
          </label>
          <input id="${s}_data" type="date" class="input" value="${t?.data?this.toYyyyMmDd(t.data):""}" placeholder="Data" />
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
          <label class="block text-sm">Specialità</label>
          <select id="${s}_nome" class="input">
            <option value="">Seleziona specialità...</option>
            ${n.map(c=>`<option value="${c.nome}" ${t?.nome===c.nome?"selected":""}>${c.nome}</option>`).join("")}
          </select>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${p.map((c,h)=>`
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${c.nome}</label>
                <input id="${s}_${c.id}_data" type="date" class="input" value="${t?.[`${c.id}_data`]?this.toYyyyMmDd(t[`${c.id}_data`]):""}" />
              </div>
              <textarea id="${s}_${c.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${c.text||""}</textarea>
            </div>
          `).join("")}
        </div>
        <div class="md:col-span-2 grid grid-cols-2 gap-2">
          <label class="block text-sm">Prova CR</label>
          <input id="${s}_cr_text" type="text" class="input" value="${t?.cr_text||""}" placeholder="Testo prova CR" />
          <label class="block text-sm">Data Prova CR</label>
          <input id="${s}_cr_data" type="date" class="input" value="${t?.cr_data?this.toYyyyMmDd(t.cr_data):""}" />
        </div>
        <div class="md:col-span-2"><label class="block text-sm">Note</label><textarea id="${s}_note" class="textarea textarea-auto-resize">${t?.note||""}</textarea></div>
      </div>
    </div>
  `,e.appendChild(o),setTimeout(()=>{p.forEach(h=>{const r=o.querySelector(`#${s}_${h.id}_text`);r&&this.autoResizeTextarea(r)});const c=o.querySelector(`#${s}_note`);c&&this.autoResizeTextarea(c)},50),o.querySelector(".removeSpecialitaBtn")?.addEventListener("click",()=>{o.remove(),this.renumberSpecialita()});const l=o.querySelector(`#${s}_nome`),g=o.querySelector(`#${s}_title`);l&&g&&l.addEventListener("change",async()=>{const c=l.value||"";g.textContent=c||"Specialità";const r=(await this.loadSpecialitaList()).find(u=>u.nome===c);this.applySpecialitaColors(o,r),r&&r.prove&&r.prove.forEach(u=>{const v=o.querySelector(`#${s}_${u.id}_data`);if(v){let f=v.previousElementSibling;for(;f&&f.tagName!=="LABEL";)f=f.previousElementSibling;f&&f.tagName==="LABEL"&&(f.textContent=u.nome)}const m=o.querySelector(`#${s}_${u.id}_text`);m&&(m.value=u.text||"",this.autoResizeTextarea(m))})})};UI.renumberSpecialita=function(){const t=this.qs("#specialitaContainer");t&&Array.from(t.children).forEach((i,e)=>{const a=i.querySelector(".removeSpecialitaBtn"),s=i.querySelector(".specialita-header");a&&(a.dataset.index=e),s&&(s.dataset.specialita=e)})};UI.collectSpecialita=function(){const t=this.qs("#specialitaContainer");if(!t)return[];const e=Array.from(t.children).map(n=>{const d=n.querySelector('select[id$="_nome"]')?.id.replace("_nome","")||"",p=g=>{const c=this.qs(`#${d}${g}`);if(!c)return null;const h=c.value?.trim()||"";return h===""?null:h},o=g=>!!this.qs(`#${d}${g}`)?.checked,l={nome:p("_nome")||"",ottenuta:!!this.qs(`#${d}_ott_chk`)?.checked,brevetto:o("_brevetto"),distintivo:o("_distintivo"),data:p("_data"),p1_data:p("_p1_data"),p2_data:p("_p2_data"),p3_data:p("_p3_data"),cr_text:p("_cr_text")||"",cr_data:p("_cr_data"),note:p("_note")||""};return l._hasData=!!(l.nome.trim()&&(l.ottenuta||l.brevetto||l.distintivo||l.data||l.p1_data||l.p2_data||l.p3_data||l.cr_data||l.cr_text&&l.cr_text.trim()||l.note&&l.note.trim())),l}).filter(n=>n.nome&&n.nome.trim()),a=new Map,s=[];return e.forEach(n=>{const d=n.nome.trim().toLowerCase(),p=a.get(d);if(!p)a.set(d,n),s.push(n);else if(n._hasData&&!p._hasData){const o=s.indexOf(p);o!==-1&&(s[o]=n,a.set(d,n))}else n._hasData,p._hasData}),s.map(({_hasData:n,...d})=>d)};UI.setCheckDate=function(t,i){const e=i?.data?this.toYyyyMmDd(i.data):this.toYyyyMmDd(i),a=i?.done??(i&&typeof i=="object"?!1:!!i),s=i?.brevetto??!1,n=i?.distintivo??!1,d=this.qs(`#${t}_chk`),p=this.qs(`#${t}_dt`),o=this.qs(`#${t}_brevetto`),l=this.qs(`#${t}_distintivo`);d&&(d.checked=!!a),p&&(p.value=e||""),o&&(o.checked=!!s),l&&(l.checked=!!n)};UI.setPair=function(t,i){const e=this.qs(`${t}_dt`),a=this.qs(`${t}_tx`);e&&(e.value=this.toYyyyMmDd(i?.data||i)||""),a&&(a.value=i?.testo||"")};UI.toYyyyMmDd=function(t){if(!t)return"";const i=this.toJsDate(t);return isNaN(i)?"":i.toISOString().split("T")[0]};UI.collectForm=function(){const t=o=>this.qs(o)?.value?.trim()||"",i=o=>this.qs(o)?.value||"",e=o=>!!this.qs(o)?.checked,a=o=>({data:t(`${o}_dt`)||null,testo:t(`${o}_tx`)||""}),s=o=>({done:e(`#${o}_chk`),data:t(`#${o}_dt`)||null,brevetto:e(`#${o}_brevetto`),distintivo:e(`#${o}_distintivo`)}),n={nome:t("#anag_nome"),cognome:t("#anag_cognome"),anag_dob:t("#anag_dob")||null,anag_sesso:t("#anag_sesso"),anag_cf:t("#anag_cf"),anag_indirizzo:t("#anag_indirizzo"),anag_citta:t("#anag_citta"),anag_email:t("#anag_email"),anag_telefono:i("#anag_telefono")||"",ct_g1_nome:t("#ct_g1_nome"),ct_g1_tel:i("#ct_g1_tel")||"",ct_g1_email:t("#ct_g1_email"),ct_g2_nome:t("#ct_g2_nome"),ct_g2_tel:i("#ct_g2_tel")||"",ct_g2_email:t("#ct_g2_email"),san_gruppo:t("#san_gruppo"),san_intolleranze:t("#san_intolleranze"),san_allergie:t("#san_allergie"),san_farmaci:t("#san_farmaci"),san_vaccinazioni:t("#san_vaccinazioni"),san_cert:t("#san_cert"),san_cert_scadenza:t("#san_cert_scadenza")||null,san_altro:t("#san_altro"),pv_promessa:t("#pv_promessa")||null,pv_vcp_cp:this.qs('input[name="pv_vcp_cp"]:checked')?.value||"",pv_giglio_data:t("#pv_giglio_data")||null,pv_giglio_note:t("#pv_giglio_note"),pv_pattuglia:t("#pv_pattuglia"),pv_note:t("#pv_note"),pv_traccia1_note:t("#pv_traccia1_note"),pv_traccia2_note:t("#pv_traccia2_note"),pv_traccia3_note:t("#pv_traccia3_note"),pv_sfida_bianca_1:t("#pv_sfida_bianca_1"),pv_sfida_bianca_2:t("#pv_sfida_bianca_2"),pv_sfida_bianca_3:t("#pv_sfida_bianca_3"),specialita:this.collectSpecialita(),ev_ce1:a("#ev_ce1"),ev_ce2:a("#ev_ce2"),ev_ce3:a("#ev_ce3"),ev_ce4:a("#ev_ce4"),ev_ccp:a("#ev_ccp"),ev_tc1:a("#ev_tc1"),ev_tc2:a("#ev_tc2"),ev_tc3:a("#ev_tc3"),ev_tc4:a("#ev_tc4"),ev_jam:a("#ev_jam"),ev_note:t("#ev_note"),pv_traccia1:s("pv_traccia1"),pv_traccia2:s("pv_traccia2"),pv_traccia3:s("pv_traccia3"),doc_quota1:(()=>{const o=t("#doc_quota1");return o&&o.trim()!==""?`${o}-01-01`:null})(),doc_quota2:(()=>{const o=t("#doc_quota2");return o&&o.trim()!==""?`${o}-01-01`:null})(),doc_quota3:(()=>{const o=t("#doc_quota3");return o&&o.trim()!==""?`${o}-01-01`:null})(),doc_quota4:(()=>{const o=t("#doc_quota4");return o&&o.trim()!==""?`${o}-01-01`:null})(),doc_iscr:this.qs("#doc_iscr")?.checked?!0:null,doc_priv:this.qs("#doc_priv")?.checked?!0:null,doc_san:this.qs("#doc_san")?.checked?!0:null,doc_liberatoria:this.qs("#doc_liberatoria")?.checked?!0:null,doc_note:t("#doc_note")},d=["io","al","mt"];return["1","2","3"].forEach(o=>{d.forEach(l=>{const g=`pv_sfida_${l}_${o}`,c=`pv_sfida_${l}_${o}_data`;n[g]=t(`#pv_sfida_${l}_${o}`),n[c]=t(`#pv_sfida_${l}_${o}_data`)||null})}),n};UI.initPattugliaManagement=async function(){console.log("Inizializzazione gestione pattuglie...");try{this.pattuglie=await DATA.getPatrols()}catch(t){console.warn("Errore caricamento pattuglie, uso default:",t),this.pattuglie=["Aironi","Marmotte"]}this.updatePattugliaSelect(),this.qs("#managePattugliaBtn")?.addEventListener("click",()=>this.openPattugliaModal()),this.qs("#closePattugliaModal")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#cancelPattugliaBtn")?.addEventListener("click",()=>this.closePattugliaModal()),this.qs("#savePattugliaBtn")?.addEventListener("click",()=>this.savePattuglie()),this.qs("#addPattugliaBtn")?.addEventListener("click",()=>this.addPattuglia()),this.qs("#pattugliaModal")?.addEventListener("click",t=>{t.target.id==="pattugliaModal"&&this.closePattugliaModal()})};UI.updatePattugliaSelect=function(){const t=this.qs("#pv_pattuglia");if(!t)return;const i=t.value;t.innerHTML='<option value="">Seleziona pattuglia...</option>',this.pattuglie.forEach(e=>{const a=document.createElement("option");a.value=e,a.textContent=e,t.appendChild(a)}),i&&this.pattuglie.includes(i)&&(t.value=i)};UI.openPattugliaModal=function(){console.log("Apertura modal pattuglie..."),this.renderPattugliaList();const t=this.qs("#pattugliaModal");console.log("Modal trovato:",t),t&&(t.classList.add("show"),console.log("Classe show aggiunta"))};UI.closePattugliaModal=function(){this.qs("#pattugliaModal").classList.remove("show"),this.qs("#newPattugliaInput").value=""};UI.renderPattugliaList=function(){const t=this.qs("#pattugliaList");t&&(t.innerHTML="",this.pattuglie.forEach((i,e)=>{const a=document.createElement("div");a.className="flex items-center justify-between p-2 bg-gray-50 rounded border",a.innerHTML=`
      <input type="text" value="${i}" class="input flex-1 mr-2" data-index="${e}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${e})">
        🗑️
      </button>
    `,t.appendChild(a)}))};UI.addPattuglia=function(){const t=this.qs("#newPattugliaInput"),i=t.value.trim();if(!i){this.showToast("Inserisci un nome per la pattuglia",{type:"warning"});return}if(this.pattuglie.includes(i)){this.showToast("Questa pattuglia esiste già",{type:"warning"});return}this.pattuglie.push(i),this.renderPattugliaList(),t.value=""};UI.removePattuglia=function(t){if(this.pattuglie.length<=1){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}this.showConfirmModal({title:"Rimuovi pattuglia",message:"Sei sicuro di voler rimuovere questa pattuglia?",confirmText:"Rimuovi",cancelText:"Annulla",onConfirm:()=>{this.pattuglie.splice(t,1),this.renderPattugliaList()}})};UI.savePattuglie=async function(){const t=this.qs("#pattugliaList").querySelectorAll('input[type="text"]'),i=[];if(t.forEach(s=>{const n=s.value.trim();n&&!i.includes(n)&&i.push(n)}),i.length===0){this.showToast("Deve rimanere almeno una pattuglia",{type:"warning"});return}const e=this.qs("#savePattugliaBtn"),a=e.textContent;e.textContent="Salvataggio...",e.disabled=!0;try{this.pattuglie=i,await DATA.savePatrols(this.pattuglie,this.currentUser),this.updatePattugliaSelect(),this.closePattugliaModal(),this.showToast("Pattuglie salvate con successo!")}catch(s){console.error("Errore salvataggio pattuglie:",s),this.showToast("Errore salvataggio: "+s.message,{type:"error"})}finally{e.textContent=a,e.disabled=!1}};UI.initTracciaSections=function(){if(console.log("Inizializzazione sezioni tracce espandibili..."),this._tracciaSectionsInitialized){console.log("Sezioni tracce già inizializzate");return}(document.querySelector("#scoutForm")||document.body).addEventListener("click",i=>{const e=i.target.closest(".traccia-header");if(!e)return;if(console.log("Click su header traccia:",e.dataset.traccia),i.target.type==="checkbox"||i.target.type==="date"){console.log("Click su input, ignorato");return}const a=e.dataset.traccia;console.log("Toggling traccia:",a),this.toggleTracciaSection(a)}),this._tracciaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni tracce")};UI.toggleTracciaSection=function(t){console.log("toggleTracciaSection chiamata per traccia:",t);const i=document.querySelector(`.traccia-header[data-traccia="${t}"]`),e=i?.nextElementSibling,a=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!e,icon:!!a}),!i||!e||!a){console.error("Elementi non trovati per traccia:",t);return}const s=e.classList.contains("expanded");console.log("Stato attuale - espanso:",s),s?(console.log("Contraendo sezione..."),e.classList.remove("expanded"),a.classList.remove("rotated")):(console.log("Espandendo sezione..."),e.classList.add("expanded"),a.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",a.className)};UI.initSpecialitaSections=function(){if(console.log("Inizializzazione sezioni specialità espandibili..."),this._specialitaSectionsInitialized){console.log("Sezioni specialità già inizializzate");return}(document.querySelector("#specialitaContainer")||document.body).addEventListener("click",i=>{const e=i.target.closest(".specialita-header");if(!e)return;if(console.log("Click su header specialità:",e.dataset.specialita),i.target.type==="checkbox"||i.target.type==="date"||i.target.tagName==="SELECT"||i.target.classList.contains("removeSpecialitaBtn")){console.log("Click su input/button, ignorato");return}const a=e.dataset.specialita;console.log("Toggling specialità:",a),this.toggleSpecialitaSection(a)}),this._specialitaSectionsInitialized=!0,console.log("Event delegation configurato per sezioni specialità")};UI.toggleSpecialitaSection=function(t){console.log("toggleSpecialitaSection chiamata per specialità:",t);const i=document.querySelector(`.specialita-header[data-specialita="${t}"]`),e=i?.nextElementSibling,a=i?.querySelector(".expand-icon");if(console.log("Elementi trovati:",{header:!!i,content:!!e,icon:!!a}),!i||!e||!a){console.error("Elementi non trovati per specialità:",t);return}const s=e.classList.contains("expanded");console.log("Stato attuale - espanso:",s),s?(console.log("Contraendo sezione specialità..."),e.classList.remove("expanded"),a.classList.remove("rotated")):(console.log("Espandendo sezione specialità..."),e.classList.add("expanded"),a.classList.add("rotated")),console.log("Classi finali content:",e.className),console.log("Classi finali icon:",a.className)};UI.initSectionNavigation=function(){const t=document.querySelectorAll(".section-nav-link"),i=document.querySelectorAll('section[id^="section-"]'),e=()=>{const s=window.scrollY+150;i.forEach(n=>{const d=n.offsetTop,p=n.offsetHeight,o=n.id;if(s>=d&&s<d+p){t.forEach(g=>{g.classList.remove("bg-green-100","text-green-700","font-semibold"),document.documentElement.dataset.theme==="dark"&&g.classList.remove("bg-green-800","text-green-300")});const l=document.querySelector(`a[href="#${o}"]`);l&&(l.classList.add("bg-green-100","text-green-700","font-semibold"),document.documentElement.dataset.theme==="dark"&&(l.classList.add("bg-green-800","text-green-300"),l.classList.remove("bg-green-100","text-green-700")))}})};let a;window.addEventListener("scroll",()=>{clearTimeout(a),a=setTimeout(e,50)}),e(),t.forEach(s=>{s.addEventListener("click",n=>{n.preventDefault();const d=s.getAttribute("href").substring(1),p=document.getElementById(d);if(p){const o=p.offsetTop-80;window.scrollTo({top:o,behavior:"smooth"})}})})};document.addEventListener("DOMContentLoaded",()=>{console.log("Scheda Esploratore (scout2) caricata"),setTimeout(()=>{typeof UI<"u"&&UI.initSectionNavigation&&UI.initSectionNavigation()},500)});UI.generateScoutSentieroHtml=function(t,i,e){const a=r=>{if(!r)return"";let u;return r&&typeof r.toDate=="function"?u=r.toDate():r instanceof Date?u=r:u=new Date(r),isNaN(u)?"":u.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"})},s=r=>r?"☑":"☐",n=(r,u,v)=>{if(!v||!i)return"";const m=u.toUpperCase(),_=(i[r]?.[m]||[]).find(x=>x.code===v);return _?_.text:""},d={io:"IO",al:"Gli Altri",mt:"La Mia Traccia"};let p=0,o=1;t.pv_traccia3?.done?(p=3,o=null):t.pv_traccia2?.done?(p=2,o=3):t.pv_traccia1?.done?(p=1,o=2):(p=0,o=1);let l="";!t.pv_promessa&&p===0?l="la Promessa":o===1?l="il primo Passo":o===2?l="il secondo Passo":o===3&&(l="il terzo Passo");let g=`
      <div class="print-section">
        <div class="print-title">Il sentiero di ${t.nome||""}</div>
      </div>
      
      <!-- Progressione Verticale e Sfide nello stesso container -->
      <div class="print-section print-box">
        <div class="print-subtitle">PROGRESSIONE VERTICALE</div>
        <div style="margin-top: 8px; margin-bottom: 12px;">
          ${l?`<div>→ Stai camminando verso ${l}</div>`:""}
        </div>
        
        <div class="print-subtitle" style="margin-top: 16px; margin-bottom: 8px;">SFIDE DA SUPERARE PER RAGGIUNGERE IL PROSSIMO PASSO</div>
        <div style="margin-top: 8px;">
    `;if(o){const r=["io","al","mt"];let u=!1;r.forEach(m=>{const f=t[`pv_sfida_${m}_${o}`],_=t[`pv_sfida_${m}_${o}_data`];if(f){u=!0;const x=n(o,m,f);g+=`
            <div style="margin-bottom: 8px; padding: 6px; border: 1px solid #ddd; border-radius: 3px;">
              <div style="display: flex; align-items: start; gap: 6px;">
                <div style="min-width: 24px; font-size: 14px;">${s(_)}</div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">${d[m]} - ${f}</div>
                  <div style="font-size: 11px; color: #555; line-height: 1.3;">${x}</div>
                  ${_?`<div style="font-size: 10px; color: #666; margin-top: 2px;">Data: ${a(_)}</div>`:""}
                </div>
              </div>
            </div>
          `}});const v=t[`pv_sfida_bianca_${o}`];v&&(u=!0,g+=`
          <div style="margin-bottom: 8px; padding: 6px; border: 1px solid #ddd; border-radius: 3px;">
            <div style="display: flex; align-items: start; gap: 6px;">
              <div style="min-width: 24px; font-size: 14px;">☐</div>
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Sfida bianca</div>
                <div style="font-size: 11px; color: #555; line-height: 1.3;">${v}</div>
              </div>
            </div>
          </div>
        `),u||(g+='<div style="color: #666; font-style: italic; font-size: 12px;">Nessuna sfida selezionata per il prossimo passo</div>')}g+=`
        </div>
      </div>
    `;const c=(t.specialita||[]).filter(r=>r.nome&&r.ottenuta),h=(t.specialita||[]).filter(r=>r.nome&&!r.ottenuta);return(c.length>0||h.length>0)&&(g+=`
        <div class="print-section print-box">
      `,c.length>0&&(g+=`
          <div class="print-subtitle">SPECIALITA' CHE HAI GIA' OTTENUTO</div>
          <div style="margin-top: 8px; margin-bottom: 12px;">
            <div style="font-size: 13px; line-height: 1.4;">${c.map(r=>r.nome).join(", ")}</div>
            ${c.some(r=>r.note)?`
              <div style="margin-top: 6px; padding: 6px; background: #f9f9f9; border-radius: 3px; font-size: 11px;">
                ${c.filter(r=>r.note).map(r=>`<div style="margin-bottom: 3px;"><strong>${r.nome}:</strong> ${r.note}</div>`).join("")}
              </div>
            `:""}
          </div>
        `),h.length>0&&(g+=`
          <div class="print-subtitle" style="margin-top: ${c.length>0?"16px":"0"}; margin-bottom: 8px;">SPECIALITA' CHE VUOI OTTENERE</div>
          <div style="margin-top: 8px;">
        `,h.forEach((r,u)=>{const m=e.find(f=>f.nome===r.nome)?.prove||[{nome:"Prova 1",id:"p1"},{nome:"Prova 2",id:"p2"},{nome:"Prova 3",id:"p3"}];g+=`
            <div style="margin-bottom: ${u<h.length-1?"14px":"4px"}; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">${r.nome}</div>
          `,m.forEach(f=>{const _=`${f.id}_data`,x=r[_],y=x!=null&&x!=="";g+=`
              <div style="margin-bottom: 5px; padding: 4px; background: #f9f9f9; border-radius: 2px;">
                <div style="display: flex; align-items: start; gap: 6px;">
                  <div style="min-width: 22px; font-size: 13px; padding-top: 1px;">${s(y)}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 500; font-size: 12px;">${f.nome}</div>
                    ${f.text?`<div style="font-size: 10px; color: #666; margin-top: 1px; line-height: 1.3;">${f.text}</div>`:""}
                    ${y?`<div style="font-size: 10px; color: #666; margin-top: 1px;">Data: ${a(x)}</div>`:""}
                  </div>
                </div>
              </div>
            `}),(r.cr_text||r.cr_data)&&(g+=`
              <div style="margin-bottom: 5px; padding: 4px; background: #f9f9f9; border-radius: 2px;">
                <div style="display: flex; align-items: start; gap: 6px;">
                  <div style="min-width: 22px; font-size: 13px; padding-top: 1px;">${s(r.cr_data)}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 500; font-size: 12px;">Prova CR</div>
                    ${r.cr_text?`<div style="font-size: 10px; color: #666; margin-top: 1px; line-height: 1.3;">${r.cr_text}</div>`:""}
                    ${r.cr_data?`<div style="font-size: 10px; color: #666; margin-top: 1px;">Data: ${a(r.cr_data)}</div>`:""}
                  </div>
                </div>
              </div>
            `),r.note&&(g+=`
              <div style="margin-top: 6px; padding: 6px; background: #fff; border-left: 2px solid #16a34a; border-radius: 2px;">
                <div style="font-weight: 500; font-size: 11px; margin-bottom: 2px;">Note:</div>
                <div style="font-size: 11px; color: #555; line-height: 1.3;">${r.note}</div>
              </div>
            `),g+="</div>"}),g+=`
          </div>
        `),g+=`
        </div>
      `),g};UI._printHtmlInArea=function(t,i){const e=this.qs("#printArea");if(!e){console.error("PrintArea non trovato");return}e.innerHTML=t,e.style.display="block";const a=document.getElementById("app");let s="";a&&(s=a.getAttribute("style")||"",a.style.setProperty("display","none","important"));const n=document.title;document.title=i||n,window.print(),setTimeout(()=>{document.title=n,e.style.display="none",e.innerHTML="",a&&(s?a.setAttribute("style",s):a.removeAttribute("style"))},1e3)};UI.printScoutSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(p=>p.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=this.collectForm(),a={...i,specialita:i.specialita||[],nome:e.nome||i.nome,cognome:e.cognome||i.cognome},s=await this.loadChallenges(),n=await this.loadSpecialitaList(),d=this.generateScoutSentieroHtml(a,s,n);this._printHtmlInArea(d,`Il Sentiero di ${a.nome||""}`)}catch(t){console.error("Errore generazione stampa:",t),this.showToast("Errore durante la generazione della stampa: "+t.message,{type:"error",duration:4e3})}};UI.printSentieroSingle=async function(t){try{if(!t){this.showToast("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay("Preparazione stampa..."),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.allScouts||this.state.scouts||[]).find(a=>a.id===t);if(!i){this.showToast("Esploratore non trovato",{type:"error"});return}this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.generateScoutSentieroHtml(i,this.challengesData,this.specialitaListData);this.hideLoadingOverlay(),this._printHtmlInArea(e,`Il Sentiero di ${i.nome||""}`)}catch(i){this.hideLoadingOverlay(),console.error("Errore stampa singola:",i),this.showToast("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printSentieroBatch=async function(t,i){try{if(!t||t.length===0){this.showToast("Nessun esploratore selezionato",{type:"warning"});return}this.showLoadingOverlay(`Preparazione ${t.length} schede...`),(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll()),this.challengesData||await this.loadChallenges(),this.specialitaListData||await this.loadSpecialitaList();const e=this.state.allScouts||this.state.scouts||[],a=[];if(t.forEach((s,n)=>{const d=e.find(o=>o.id===s);if(!d)return;let p=this.generateScoutSentieroHtml(d,this.challengesData,this.specialitaListData);n<t.length-1&&(p+='<div style="page-break-after: always;"></div>'),a.push(p)}),a.length===0){this.showToast("Nessun esploratore trovato",{type:"warning"}),this.hideLoadingOverlay();return}this.hideLoadingOverlay(),this._printHtmlInArea(a.join(`
`),i||"Schede Sentiero Reparto")}catch(e){this.hideLoadingOverlay(),console.error("Errore stampa batch:",e),this.showToast("Errore stampa: "+e.message,{type:"error",duration:4e3})}};UI.updateMedicalStatusBadge=function(t){const i=this.qs("#san_cert_status_badge");if(!i)return;const e=this.qs("#san_cert_scadenza")?.value||(t?t.san_cert_scadenza:null),a=this.qs("#doc_priv")?this.qs("#doc_priv").checked:t?t.doc_priv:!1,s=this.qs("#doc_san")?this.qs("#doc_san").checked:t?t.doc_san:!1,n={...t||{},san_cert_scadenza:e,doc_priv:a,doc_san:s},d=this.getScoutMedicalStatus?this.getScoutMedicalStatus(n):null;d&&(i.className=`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${d.badgeClass}`,i.textContent=`🩺 ${d.statusLabel}`)};UI.generateScoutMedicalSheetHtml=function(t){const i=t||{},e=`${i.nome||""} ${i.cognome||""}`.trim()||"Esploratore",a=i.pv_pattuglia||"Reparto",s=i.cp_vcp||"Esploratore",n=i.anag_dob||i.dataNascita;let d="Non indicata",p="";if(n){const z=this.toJsDate?this.toJsDate(n):new Date(n);if(!isNaN(z.getTime())){d=z.toLocaleDateString("it-IT");const D=Date.now()-z.getTime(),k=new Date(D),w=Math.abs(k.getUTCFullYear()-1970);w>=0&&w<100&&(p=` (${w} anni)`)}}const o=i.anag_pob||"-",l=i.anag_cf?i.anag_cf.toUpperCase():"-",g=i.anag_indirizzo||"-",c=i.ct_g1_nome||"Genitore 1",h=i.ct_g1_rel?` (${i.ct_g1_rel})`:"",r=i.ct_g1_tel||i.anag_telefono||"Non specificato",u=i.ct_g2_nome||"Genitore 2",v=i.ct_g2_rel?` (${i.ct_g2_rel})`:"",m=i.ct_g2_tel||"-",f=i.ct_med_nome||"-",_=i.ct_med_tel||"-",x=i.san_gruppo||"N.D.",y=(i.san_intolleranze||"").trim(),b=(i.san_allergie||"").trim(),$=(i.san_farmaci||"").trim(),L=(i.san_vaccinazioni||"").trim(),T=i.san_cert_scadenza?this.toJsDate?this.toJsDate(i.san_cert_scadenza).toLocaleDateString("it-IT"):i.san_cert_scadenza:"Non specificata",E=(i.san_cert||"").trim(),I=(i.san_altro||"").trim(),S=this.getScoutMedicalStatus?this.getScoutMedicalStatus(i):null,C=S?S.statusLabel:i.san_cert_scadenza?"Registrato":"Mancante",A=S&&S.color==="green"?"#16a34a":S&&S.color==="yellow"?"#d97706":"#dc2626",P=!!i.doc_priv,q=!!i.doc_san;return`
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
            <strong>Nato il:</strong> ${d}${p} &nbsp;•&nbsp; <strong>A:</strong> ${o}
          </div>
          <div style="font-size: 11px; color: #374151; margin-top: 2px;">
            <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${l}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${g}
          </div>
        </div>

        <div style="text-align: right; border-left: 1.5px solid #e5e7eb; padding-left: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Pattuglia & Ruolo</div>
          <div style="font-size: 16px; font-weight: 800; color: #15803d;">
            Ptg. ${a}
          </div>
          <span style="display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px;">
            ${s}
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
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${c}${h}</div>
            <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
              📞 ${r}
            </div>
          </div>
          <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
            <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${u}${v}</div>
            <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
              📞 ${m}
            </div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
            <div style="font-weight: 700; color: #0f172a;">${f}</div>
            <div style="font-size: 11px; color: #475569; margin-top: 1px;">
              📞 ${_}
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
            ${x}
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
            ${L||"Regolari secondo calendario vaccinale nazionale."}
          </div>
        </div>
      </div>

      <!-- CERTIFICATO MEDICO & DOCUMENTAZIONE -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Certificato Medico Non Agonistico</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <span style="font-weight: 800; font-size: 12px; color: ${A};">
              ● ${C}
            </span>
            <span style="color: #475569;">(Scadenza: <strong>${T}</strong>)</span>
          </div>
          ${E?`<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${E}</div>`:""}
        </div>

        <div>
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Consensi e Altre Indicazioni</div>
          <div style="display: flex; gap: 12px; margin-top: 2px; font-size: 11px;">
            <span>Privacy: <strong>${P?"✅ Depositata":"❌ Mancante"}</strong></span>
            <span>Scheda Firmata: <strong>${q?"✅ Depositata":"❌ Mancante"}</strong></span>
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
  `};UI.printScoutMedicalSheet=async function(){try{const t=this.qs("#scoutId")?.value;if(!t){alert("ID esploratore non trovato");return}(!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const i=(this.state.scouts||[]).find(n=>n.id===t);if(!i){this.showToast("Esploratore non trovato nel database",{type:"error"});return}const e=typeof this.collectForm=="function"?this.collectForm():{},a={...i,...e,nome:e.nome||i.nome,cognome:e.cognome||i.cognome},s=this.generateScoutMedicalSheetHtml(a);this._printHtmlInArea(s,`Scheda Sanitaria - ${a.nome||""} ${a.cognome||""}`)}catch(t){console.error("Errore generazione scheda sanitaria:",t),this.showToast("Errore durante la generazione della scheda sanitaria: "+t.message,{type:"error",duration:4e3})}};UI.printMedicalSingle=async function(t){try{if(!t){this.showToast?.("ID esploratore mancante",{type:"error"});return}this.showLoadingOverlay?.("Preparazione scheda sanitaria..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).find(s=>s.id===t);if(!e){this.hideLoadingOverlay?.(),this.showToast?.("Esploratore non trovato",{type:"error"});return}const a=this.generateScoutMedicalSheetHtml(e);if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(a,`Scheda Sanitaria - ${e.nome||""} ${e.cognome||""}`);else{const s=window.open("","_blank");s&&(s.document.write(`
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
        `),s.document.close())}}catch(i){this.hideLoadingOverlay?.(),console.error("Errore stampa scheda medica singola:",i),this.showToast?.("Errore stampa: "+i.message,{type:"error",duration:4e3})}};UI.printMedicalBatch=async function(t=null,i="Cartellina Sanitaria Campo"){try{this.showLoadingOverlay?.("Preparazione cartellina sanitaria campo..."),(!this.state||!this.state.scouts||this.state.scouts.length===0)&&(this.state=await DATA.loadAll());const e=(this.state.allScouts||this.state.scouts||[]).filter(n=>!n.archived),a=t&&t.length>0?t.map(n=>e.find(d=>d.id===n)).filter(Boolean):e.slice().sort((n,d)=>{const p=n.pv_pattuglia||"",o=d.pv_pattuglia||"";if(p!==o)return p.localeCompare(o,"it");const l=n.cognome||"",g=d.cognome||"";return l.localeCompare(g,"it")});if(a.length===0){this.hideLoadingOverlay?.(),this.showToast?.("Nessun esploratore disponibile per la stampa",{type:"warning"});return}const s=a.map((n,d)=>{let p=this.generateScoutMedicalSheetHtml(n);return d<a.length-1&&(p+='<div style="page-break-after: always; height: 0; line-height: 0;"></div>'),p});if(this.hideLoadingOverlay?.(),typeof this._printHtmlInArea=="function")this._printHtmlInArea(s.join(`
`),i);else{const n=window.open("","_blank");n&&(n.document.write(`
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
              ${s.join(`
`)}
            </body>
          </html>
        `),n.document.close())}}catch(e){this.hideLoadingOverlay?.(),console.error("Errore stampa batch schede sanitarie:",e),this.showToast?.("Errore stampa cartellina: "+e.message,{type:"error",duration:4e3})}};
