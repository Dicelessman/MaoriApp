import"./date-picker-DCxebrIQ.js";/* empty css              */import"./shared-CJH5clA-.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderStaff(),this.setupStaffEventListeners(),this.initAccessRequestsSection()};UI.setupStaffEventListeners=function(){const o=this.qs("#addStaffForm");!o||o._bound||(o._bound=!0,this.setupFormValidation(o,{staffNome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il nome è obbligatorio"},staffCognome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il cognome è obbligatorio"},staffEmail:{required:!0,type:"email",requiredMessage:"L'email è obbligatoria"}}),o.addEventListener("submit",async a=>{if(a.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per aggiungere staff.",{type:"error"});return}const e=this.validateForm(o,{staffNome:{required:!0,minLength:1,maxLength:100},staffCognome:{required:!0,minLength:1,maxLength:100},staffEmail:{required:!0,type:"email"}});if(!e.valid){const t=Object.values(e.errors)[0];this.showToast(t,{type:"error"});const n=Object.keys(e.errors)[0],u=o.querySelector(`#${n}`);u&&u.focus();return}const s=this.qs("#staffNome").value.trim(),r=this.qs("#staffCognome").value.trim(),i=this.qs("#staffEmail").value.trim().toLowerCase(),c=this.qs("#staffRuolo")?.value||"CR";if(this.checkDuplicateStaffEmail(i)){this.showToast("Un membro staff con questa email esiste già",{type:"error"}),this.qs("#staffEmail").focus();return}const l=o.querySelector('button[type="submit"]'),d=l?.textContent;this.setButtonLoading(l,!0,d);try{await DATA.addStaff({nome:s,cognome:r,email:i,ruolo:c},this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Staff aggiunto con successo"),o.reset(),o.querySelectorAll(".valid, .invalid").forEach(t=>{t.classList.remove("valid","invalid")}),o.querySelectorAll(".has-error, .is-valid").forEach(t=>{t.classList.remove("has-error","is-valid")}),o.querySelectorAll(".field-error").forEach(t=>{t.textContent=""})}catch(t){console.error("Errore aggiunta staff:",t),this.showToast("Errore durante l'aggiunta: "+(t.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(l,!1,d)}}))};UI.renderStaff=function(){const o=this.qs("#staffList");if(!o)return;const a=[...this.state.staff||[]].sort((e,s)=>e.nome.localeCompare(s.nome)||e.cognome.localeCompare(s.cognome));this.renderInBatches({container:o,items:a,batchSize:200,onComplete:()=>{if(this.currentUser&&"ontouchstart"in window&&this.setupSwipeDelete(o,e=>{this.confirmDeleteStaff(e)},".swipeable-item","data-id"),"ontouchstart"in window&&o.querySelectorAll(".swipeable-item").forEach(s=>{const r=s.getAttribute("data-id"),i=this.state.staff?.find(c=>c.id===r);i&&this.setupLongPress(s,(c,l)=>{const d=[{label:"Copia nome",icon:"📋",action:async()=>{const t=`${i.nome} ${i.cognome}`.trim();try{await navigator.clipboard.writeText(t),this.showToast("Nome copiato",{type:"success",duration:1500})}catch(n){console.error("Errore copia:",n)}}},{label:"Copia email",icon:"📧",action:async()=>{if(i.email)try{await navigator.clipboard.writeText(i.email),this.showToast("Email copiata",{type:"success",duration:1500})}catch(t){console.error("Errore copia:",t)}}}];this.currentUser&&d.push({label:"Modifica",icon:"✏️",action:()=>{this.openEditStaffModal(r)}},{label:"Elimina",icon:"🗑️",danger:!0,action:()=>{this.confirmDeleteStaff(r)}}),this.showContextMenu(c,d)})}),"ontouchstart"in window){const e=o.closest(".bg-gray-50")||o.parentElement;e&&this.setupPullToRefresh(e,async()=>{this.showLoadingOverlay("Aggiornamento dati...");try{this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Dati aggiornati",{type:"success"})}catch(s){console.error("Errore refresh:",s),this.showToast("Errore durante l'aggiornamento",{type:"error"})}finally{this.hideLoadingOverlay()}})}},renderItem:e=>{const s={CR:"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",VCR:"bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",SiSR:"bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",RiS:"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",Esploratore:"bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300"}[e.ruolo]||"bg-gray-100 text-gray-600",r=e.ruolo||"—";return`
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${e.id}" data-item-id="${e.id}">
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-medium text-gray-900">${e.nome} ${e.cognome}</h4>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${s}">${r}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm text-gray-600">${e.email||""}</span>
            ${e.email?`
              <button 
                type="button" 
                class="btn-contact-action btn-contact-email !w-6 !h-6 !p-0 rounded text-xs shadow-none" 
                data-contact-action="email" 
                data-value="${e.email}" 
                title="Invia email a ${e.nome}"
                aria-label="Invia email"
              >
                <svg class="!w-3 !h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
              </button>`:""}
          </div>
          <p class="text-xs text-gray-400 mt-0.5">ID: ${e.id}</p>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="UI.openEditStaffModal('${e.id}')" 
            class="p-2 text-gray-500 hover:text-green-600 rounded-full"
            ${this.currentUser?"":"disabled"}
          >
            ✏️
          </button>
          <button 
            onclick="UI.confirmDeleteStaff('${e.id}')" 
            class="p-2 text-gray-500 hover:text-red-600 rounded-full"
            ${this.currentUser?"":"disabled"}
          >
            🗑️
          </button>
        </div>
      </div>
    `}})};UI.openEditStaffModal=function(o){if(!this.currentUser){this.showToast("Devi essere loggato per modificare staff.",{type:"error"});return}const a=(this.state.staff||[]).find(s=>s.id===o);if(!a)return;this.qs("#editStaffId").value=a.id,this.qs("#editStaffNome").value=a.nome||"",this.qs("#editStaffCognome").value=a.cognome||"",this.qs("#editStaffEmail").value=a.email||"";const e=this.qs("#editStaffRuolo");e&&(e.value=a.ruolo||"CR"),this.showModal("editStaffModal")};UI.confirmDeleteStaff=function(o){if(!this.currentUser){this.showToast("Devi essere loggato per eliminare staff.",{type:"error"});return}const a=(this.state.staff||[]).find(s=>s.id===o);if(!a)return;this.staffToDeleteId=o;const e=this.qs("#staffNameToDelete");e&&(e.textContent=`${a.nome} ${a.cognome}`),this.showModal("confirmDeleteStaffModal")};document.addEventListener("DOMContentLoaded",()=>{console.log("Pagina Staff caricata")});UI.initAccessRequestsSection=function(){const o=document.getElementById("accessRequestsSection");if(!o)return;const a=typeof this.getUserRole=="function"?this.getUserRole():{ruolo:null},e=a.ruolo==="CR"||a.ruolo==="VCR",s=document.getElementById("accessRequestsAuthNotice"),r=document.getElementById("accessRequestsAdminContent"),i=document.querySelector("#addStaffForm")?.closest(".bg-white, .rounded-xl, .shadow-sm")||document.querySelector("#addStaffForm");if(i&&(i.style.display=e?"":"none"),o.classList.remove("hidden"),!e){s&&s.classList.remove("hidden"),r&&r.classList.add("hidden");return}s&&s.classList.add("hidden"),r&&r.classList.remove("hidden"),this.loadAccessRequests(),this.detectAndMigrateLegacyEsploratori()};UI.loadAccessRequests=async function(){const o=document.getElementById("accessRequestsList"),a=document.getElementById("accessRequestsBadge");if(o){o.innerHTML='<p class="text-sm text-gray-500 italic py-2">Caricamento elenco utenti e richieste...</p>';try{let e=await DATA.getAccessRequests();(!e||e.length===0)&&(e=this.state?.accessRequests||[]),this._accessRequests=Array.isArray(e)?e:[];const s=this._accessRequests.filter(n=>n.status==="pending").length,r=this._accessRequests.filter(n=>n.status==="approved").length,i=this._accessRequests.filter(n=>n.status==="rejected").length,c=document.getElementById("countReqAll"),l=document.getElementById("countReqPending"),d=document.getElementById("countReqApproved"),t=document.getElementById("countReqRejected");c&&(c.textContent=`(${this._accessRequests.length})`),l&&(l.textContent=`(${s})`),d&&(d.textContent=`(${r})`),t&&(t.textContent=`(${i})`),a&&(s>0?(a.textContent=`${s} in attesa`,a.classList.remove("hidden")):a.classList.add("hidden")),this.renderAccessRequests()}catch(e){console.error("Errore caricamento richieste accesso:",e),o.innerHTML='<p class="text-sm text-red-500">Errore nel caricamento delle richieste.</p>'}}};UI.filterAccessRequests=function(o){this._accessRequestsFilter=o,document.querySelectorAll(".access-filter-btn").forEach(e=>{const s=e.dataset.filter===o;e.classList.toggle("bg-green-600",s),e.classList.toggle("text-white",s),e.classList.toggle("bg-white",!s),e.classList.toggle("text-gray-700",!s)}),this.renderAccessRequests()};UI.searchAccessRequests=function(o){this._accessRequestsSearch=(o||"").trim().toLowerCase(),this.renderAccessRequests()};UI.renderAccessRequests=function(o){const a=document.getElementById("accessRequestsList");if(!a)return;const e=o||this._accessRequests||[],s=this._accessRequestsFilter||"all",r=this._accessRequestsSearch||"",i=e.filter(t=>!(s==="pending"&&t.status!=="pending"||s==="approved"&&t.status!=="approved"||s==="rejected"&&t.status!=="rejected"||r&&!`${t.nome||""} ${t.cognome||""} ${t.email||""}`.toLowerCase().includes(r)));if(i.length===0){a.innerHTML=`<div class="bg-white p-6 rounded-lg text-center border border-gray-200 text-gray-500 text-sm">
      Nessun utente o richiesta trovata${s!=="all"?` con filtro "${s}"`:""}${r?` per "${r}"`:""}.
    </div>`;return}const c=[...i].sort((t,n)=>{const u={pending:0,approved:1,rejected:2},f=u[t.status]??1,g=u[n.status]??1;if(f!==g)return f-g;const m=t.createdAt instanceof Date?t.createdAt:t.createdAt?.toDate?t.createdAt.toDate():new Date(t.createdAt||0);return(n.createdAt instanceof Date?n.createdAt:n.createdAt?.toDate?n.createdAt.toDate():new Date(n.createdAt||0))-m}),l={pending:{label:"In attesa di approvazione",badge:"bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300",icon:"⏳"},approved:{label:"Approvato / Registrato",badge:"bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300",icon:"✅"},rejected:{label:"Rifiutato",badge:"bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300",icon:"❌"}},d={CR:"bg-green-100 text-green-800 border-green-200",VCR:"bg-blue-100 text-blue-800 border-blue-200",SiSR:"bg-amber-100 text-amber-800 border-amber-200",RiS:"bg-purple-100 text-purple-800 border-purple-200",Esploratore:"bg-teal-100 text-teal-800 border-teal-200"};a.innerHTML=c.map(t=>{const n=l[t.status]||l.pending,u=d[t.ruoloRichiesto]||"bg-gray-100 text-gray-700 border-gray-200",f=t.createdAt instanceof Date?t.createdAt:t.createdAt?.toDate?t.createdAt.toDate():t.createdAt?new Date(t.createdAt):null,g=f?f.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—",m=t.status==="pending"?`
      <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
        <button
          type="button"
          class="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          onclick="UI.approveAccessRequest('${t.id}')"
          aria-label="Approva richiesta di ${t.nome} ${t.cognome}"
        >
          <span>✅</span> Approva Ruolo
        </button>
        <button
          type="button"
          class="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
          onclick="UI.rejectAccessRequest('${t.id}')"
          aria-label="Rifiuta richiesta di ${t.nome} ${t.cognome}"
        >
          <span>❌</span> Rifiuta
        </button>
      </div>`:"",h=t.status==="approved"?`<span class="text-xs text-gray-500 mt-1 block">Convalidato: ${t.approvedBy?`da ${t.approvedBy}`:"Accesso immediato automatico"}</span>`:t.status==="rejected"?`<span class="text-xs text-red-600 mt-1 block font-medium">Rifiutato: ${t.rejectedBy?`da ${t.rejectedBy}`:""}${t.rejectReason?` — Motivo: "${t.rejectReason}"`:""}</span>`:"";return`
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-gray-200">
            ${`${(t.nome||"?")[0]}${(t.cognome||"")[0]||""}`.toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-gray-900 text-base leading-tight">${t.nome} ${t.cognome}</h4>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${n.badge}">${n.icon} ${n.label}</span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${u}">Ruolo: ${t.ruoloRichiesto||"Esploratore"}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-sm text-gray-600">${t.email||""}</span>
              ${t.email?`
                <button 
                  type="button" 
                  class="btn-contact-action btn-contact-email !w-5 !h-5 !p-0 rounded text-xs shadow-none" 
                  data-contact-action="email" 
                  data-value="${t.email}" 
                  title="Invia email a ${t.nome}"
                  aria-label="Invia email"
                >
                  <svg class="!w-3 !h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
                </button>`:""}
            </div>
            <div class="text-xs text-gray-400 mt-1">Registrato il: ${g}</div>
            ${h}
          </div>
        </div>
      </div>
      ${m}
    </div>`}).join("")};UI.approveAccessRequest=async function(o){if(!this.currentUser){this.showToast("Devi essere loggato come Admin.",{type:"error"});return}const a=(this._accessRequests||[]).find(s=>s.id===o),e=a?`${a.nome} ${a.cognome}`:"l'utente";this.showConfirmModal({title:"Approva Richiesta di Accesso",message:`Confermi l'approvazione per ${e} con ruolo "${a?.ruoloRichiesto||"CR"}"? Verrà aggiunto allo Staff con i relativi permessi.`,confirmText:"Approva e Abilita",onConfirm:async()=>{try{await DATA.approveAccessRequest(o,this.currentUser),this.state=await DATA.loadAll(),this.renderStaff(),await this.loadAccessRequests(),this.showToast(`Richiesta di ${e} approvata! Membro staff aggiunto.`,{type:"success",duration:4e3})}catch(s){console.error("Errore approvazione:",s),this.showToast("Errore durante l'approvazione: "+(s.message||""),{type:"error"})}}})};UI.rejectAccessRequest=async function(o){if(!this.currentUser){this.showToast("Devi essere loggato come Admin.",{type:"error"});return}const a=(this._accessRequests||[]).find(r=>r.id===o),e=a?`${a.nome} ${a.cognome}`:"l'utente",s=window.prompt(`Motivo del rifiuto per la richiesta di ${e} (opzionale):`);if(s!==null)try{await DATA.rejectAccessRequest(o,s||"",this.currentUser),await this.loadAccessRequests(),this.showToast(`Richiesta di ${e} rifiutata.`,{type:"info",duration:3e3})}catch(r){console.error("Errore rifiuto:",r),this.showToast("Errore durante il rifiuto: "+(r.message||""),{type:"error"})}};typeof window<"u"&&window.UI&&UI.state&&UI.state.staff&&UI.renderCurrentPage();UI.detectAndMigrateLegacyEsploratori=async function(){const o=typeof this.getUserRole=="function"?this.getUserRole():{ruolo:null};if(o.ruolo!=="CR"&&o.ruolo!=="VCR")return;const a=(this.state.staff||[]).filter(i=>{const c=(i.ruolo||"").toLowerCase().trim();return c.includes("esplorator")||c.includes("ragazzo")||c.includes("scout")});if(a.length===0)return;const e=document.getElementById("legacyMigrationBanner"),s=document.getElementById("legacyMigrationCount"),r=document.getElementById("legacyMigrationList");e&&(e.style.display="",s&&(s.textContent=a.length),r&&(r.innerHTML=a.map(i=>`<li class="text-xs text-amber-800">• ${i.nome||""} ${i.cognome||""} &lt;${i.email||""}&gt;</li>`).join("")))};UI.runLegacyEsploratoriMigration=async function(){const o=typeof this.getUserRole=="function"?this.getUserRole():{ruolo:null};if(o.ruolo!=="CR"&&o.ruolo!=="VCR"){this.showToast("Solo CR o VCR possono eseguire la migrazione.",{type:"error"});return}const a=(this.state.staff||[]).filter(e=>{const s=(e.ruolo||"").toLowerCase().trim();return s.includes("esplorator")||s.includes("ragazzo")||s.includes("scout")});if(a.length===0){this.showToast("Nessun esploratore legacy da migrare.",{type:"info"});return}this.showConfirmModal({title:"Migrazione Esploratori",message:`Spostare ${a.length} esploratore/i dalla collezione staff a scouts?`,confirmText:"Migra",onConfirm:async()=>{let e=0,s=0;for(const i of a)try{await DATA.addScout({nome:i.nome,cognome:i.cognome,anag_email:i.email||"",uid:i.uid||null,migrationSource:"staff_legacy"},this.currentUser),await DATA.deleteStaff(i.id,this.currentUser),e++}catch(c){console.error("[Migration] Error migrating:",i.email,c),s++}this.state=await DATA.loadAll(!0),this.renderCurrentPage();const r=document.getElementById("legacyMigrationBanner");r&&(r.style.display="none"),this.showToast(`Migrazione completata: ${e} migrati${s>0?`, ${s} errori`:""}.`,{type:e>0?"success":"error",duration:5e3})}})};
