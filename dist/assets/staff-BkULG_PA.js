import"./date-picker-PD1igq5W.js";/* empty css              */import"./shared-ascq1xWz.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderStaff(),this.setupStaffEventListeners(),this.initAccessRequestsSection()};UI.setupStaffEventListeners=function(){const s=this.qs("#addStaffForm");!s||s._bound||(s._bound=!0,this.setupFormValidation(s,{staffNome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il nome è obbligatorio"},staffCognome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il cognome è obbligatorio"},staffEmail:{required:!0,type:"email",requiredMessage:"L'email è obbligatoria"}}),s.addEventListener("submit",async o=>{if(o.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per aggiungere staff.",{type:"error"});return}const t=this.validateForm(s,{staffNome:{required:!0,minLength:1,maxLength:100},staffCognome:{required:!0,minLength:1,maxLength:100},staffEmail:{required:!0,type:"email"}});if(!t.valid){const e=Object.values(t.errors)[0];this.showToast(e,{type:"error"});const i=Object.keys(t.errors)[0],u=s.querySelector(`#${i}`);u&&u.focus();return}const a=this.qs("#staffNome").value.trim(),r=this.qs("#staffCognome").value.trim(),n=this.qs("#staffEmail").value.trim().toLowerCase(),c=this.qs("#staffRuolo")?.value||"CR";if(this.checkDuplicateStaffEmail(n)){this.showToast("Un membro staff con questa email esiste già",{type:"error"}),this.qs("#staffEmail").focus();return}const l=s.querySelector('button[type="submit"]'),d=l?.textContent;this.setButtonLoading(l,!0,d);try{await DATA.addStaff({nome:a,cognome:r,email:n,ruolo:c},this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Staff aggiunto con successo"),s.reset(),s.querySelectorAll(".valid, .invalid").forEach(e=>{e.classList.remove("valid","invalid")}),s.querySelectorAll(".has-error, .is-valid").forEach(e=>{e.classList.remove("has-error","is-valid")}),s.querySelectorAll(".field-error").forEach(e=>{e.textContent=""})}catch(e){console.error("Errore aggiunta staff:",e),this.showToast("Errore durante l'aggiunta: "+(e.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(l,!1,d)}}))};UI.renderStaff=function(){const s=this.qs("#staffList");if(!s)return;const o=[...this.state.staff||[]].sort((t,a)=>t.nome.localeCompare(a.nome)||t.cognome.localeCompare(a.cognome));this.renderInBatches({container:s,items:o,batchSize:200,onComplete:()=>{if(this.currentUser&&"ontouchstart"in window&&this.setupSwipeDelete(s,t=>{this.confirmDeleteStaff(t)},".swipeable-item","data-id"),"ontouchstart"in window&&s.querySelectorAll(".swipeable-item").forEach(a=>{const r=a.getAttribute("data-id"),n=this.state.staff?.find(c=>c.id===r);n&&this.setupLongPress(a,(c,l)=>{const d=[{label:"Copia nome",icon:"📋",action:async()=>{const e=`${n.nome} ${n.cognome}`.trim();try{await navigator.clipboard.writeText(e),this.showToast("Nome copiato",{type:"success",duration:1500})}catch(i){console.error("Errore copia:",i)}}},{label:"Copia email",icon:"📧",action:async()=>{if(n.email)try{await navigator.clipboard.writeText(n.email),this.showToast("Email copiata",{type:"success",duration:1500})}catch(e){console.error("Errore copia:",e)}}}];this.currentUser&&d.push({label:"Modifica",icon:"✏️",action:()=>{this.openEditStaffModal(r)}},{label:"Elimina",icon:"🗑️",danger:!0,action:()=>{this.confirmDeleteStaff(r)}}),this.showContextMenu(c,d)})}),"ontouchstart"in window){const t=s.closest(".bg-gray-50")||s.parentElement;t&&this.setupPullToRefresh(t,async()=>{this.showLoadingOverlay("Aggiornamento dati...");try{this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Dati aggiornati",{type:"success"})}catch(a){console.error("Errore refresh:",a),this.showToast("Errore durante l'aggiornamento",{type:"error"})}finally{this.hideLoadingOverlay()}})}},renderItem:t=>{const a={CR:"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",VCR:"bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",SiSR:"bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",RiS:"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",Esploratore:"bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300"}[t.ruolo]||"bg-gray-100 text-gray-600",r=t.ruolo||"—";return`
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${t.id}" data-item-id="${t.id}">
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-medium text-gray-900">${t.nome} ${t.cognome}</h4>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${a}">${r}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm text-gray-600">${t.email||""}</span>
            ${t.email?`
              <button 
                type="button" 
                class="btn-contact-action btn-contact-email !w-6 !h-6 !p-0 rounded text-xs shadow-none" 
                data-contact-action="email" 
                data-value="${t.email}" 
                title="Invia email a ${t.nome}"
                aria-label="Invia email"
              >
                <svg class="!w-3 !h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
              </button>`:""}
          </div>
          <p class="text-xs text-gray-400 mt-0.5">ID: ${t.id}</p>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="UI.openEditStaffModal('${t.id}')" 
            class="p-2 text-gray-500 hover:text-green-600 rounded-full"
            ${this.currentUser?"":"disabled"}
          >
            ✏️
          </button>
          <button 
            onclick="UI.confirmDeleteStaff('${t.id}')" 
            class="p-2 text-gray-500 hover:text-red-600 rounded-full"
            ${this.currentUser?"":"disabled"}
          >
            🗑️
          </button>
        </div>
      </div>
    `}})};UI.openEditStaffModal=function(s){if(!this.currentUser){this.showToast("Devi essere loggato per modificare staff.",{type:"error"});return}const o=(this.state.staff||[]).find(a=>a.id===s);if(!o)return;this.qs("#editStaffId").value=o.id,this.qs("#editStaffNome").value=o.nome||"",this.qs("#editStaffCognome").value=o.cognome||"",this.qs("#editStaffEmail").value=o.email||"";const t=this.qs("#editStaffRuolo");t&&(t.value=o.ruolo||"CR"),this.showModal("editStaffModal")};UI.confirmDeleteStaff=function(s){if(!this.currentUser){this.showToast("Devi essere loggato per eliminare staff.",{type:"error"});return}const o=(this.state.staff||[]).find(a=>a.id===s);if(!o)return;this.staffToDeleteId=s;const t=this.qs("#staffNameToDelete");t&&(t.textContent=`${o.nome} ${o.cognome}`),this.showModal("confirmDeleteStaffModal")};document.addEventListener("DOMContentLoaded",()=>{console.log("Pagina Staff caricata")});const p=["CR","VCR"];UI.initAccessRequestsSection=function(){const s=document.getElementById("accessRequestsSection");if(!s)return;const o=this.currentUser?.email?.toLowerCase(),a=(o?(this.state?.staff||[]).find(l=>l.email&&l.email.toLowerCase()===o):null)?.ruolo||(o==="demo@scoutmaori.it"?"CR":""),r=p.some(l=>a.includes(l)),n=document.getElementById("accessRequestsAuthNotice"),c=document.getElementById("accessRequestsAdminContent");if(s.classList.remove("hidden"),!r){n&&n.classList.remove("hidden"),c&&c.classList.add("hidden");return}n&&n.classList.add("hidden"),c&&c.classList.remove("hidden"),this.loadAccessRequests()};UI.loadAccessRequests=async function(){const s=document.getElementById("accessRequestsList"),o=document.getElementById("accessRequestsBadge");if(s){s.innerHTML='<p class="text-sm text-gray-500 italic py-2">Caricamento elenco utenti e richieste...</p>';try{const t=await DATA.getAccessRequests();this._accessRequests=Array.isArray(t)?t:[];const a=this._accessRequests.filter(i=>i.status==="pending").length,r=this._accessRequests.filter(i=>i.status==="approved").length,n=this._accessRequests.filter(i=>i.status==="rejected").length,c=document.getElementById("countReqAll"),l=document.getElementById("countReqPending"),d=document.getElementById("countReqApproved"),e=document.getElementById("countReqRejected");c&&(c.textContent=`(${this._accessRequests.length})`),l&&(l.textContent=`(${a})`),d&&(d.textContent=`(${r})`),e&&(e.textContent=`(${n})`),o&&(a>0?(o.textContent=`${a} in attesa`,o.classList.remove("hidden")):o.classList.add("hidden")),this.renderAccessRequests()}catch(t){console.error("Errore caricamento richieste accesso:",t),s.innerHTML='<p class="text-sm text-red-500">Errore nel caricamento delle richieste.</p>'}}};UI.filterAccessRequests=function(s){this._accessRequestsFilter=s,document.querySelectorAll(".access-filter-btn").forEach(t=>{const a=t.dataset.filter===s;t.classList.toggle("bg-green-600",a),t.classList.toggle("text-white",a),t.classList.toggle("bg-white",!a),t.classList.toggle("text-gray-700",!a)}),this.renderAccessRequests()};UI.searchAccessRequests=function(s){this._accessRequestsSearch=(s||"").trim().toLowerCase(),this.renderAccessRequests()};UI.renderAccessRequests=function(s){const o=document.getElementById("accessRequestsList");if(!o)return;const t=s||this._accessRequests||[],a=this._accessRequestsFilter||"all",r=this._accessRequestsSearch||"",n=t.filter(e=>!(a==="pending"&&e.status!=="pending"||a==="approved"&&e.status!=="approved"||a==="rejected"&&e.status!=="rejected"||r&&!`${e.nome||""} ${e.cognome||""} ${e.email||""}`.toLowerCase().includes(r)));if(n.length===0){o.innerHTML=`<div class="bg-white p-6 rounded-lg text-center border border-gray-200 text-gray-500 text-sm">
      Nessun utente o richiesta trovata${a!=="all"?` con filtro "${a}"`:""}${r?` per "${r}"`:""}.
    </div>`;return}const c=[...n].sort((e,i)=>{const u={pending:0,approved:1,rejected:2},f=u[e.status]??1,m=u[i.status]??1;if(f!==m)return f-m;const g=e.createdAt instanceof Date?e.createdAt:e.createdAt?.toDate?e.createdAt.toDate():new Date(e.createdAt||0);return(i.createdAt instanceof Date?i.createdAt:i.createdAt?.toDate?i.createdAt.toDate():new Date(i.createdAt||0))-g}),l={pending:{label:"In attesa di approvazione",badge:"bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300",icon:"⏳"},approved:{label:"Approvato / Registrato",badge:"bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300",icon:"✅"},rejected:{label:"Rifiutato",badge:"bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300",icon:"❌"}},d={CR:"bg-green-100 text-green-800 border-green-200",VCR:"bg-blue-100 text-blue-800 border-blue-200",SiSR:"bg-amber-100 text-amber-800 border-amber-200",RiS:"bg-purple-100 text-purple-800 border-purple-200",Esploratore:"bg-teal-100 text-teal-800 border-teal-200"};o.innerHTML=c.map(e=>{const i=l[e.status]||l.pending,u=d[e.ruoloRichiesto]||"bg-gray-100 text-gray-700 border-gray-200",f=e.createdAt instanceof Date?e.createdAt:e.createdAt?.toDate?e.createdAt.toDate():e.createdAt?new Date(e.createdAt):null,m=f?f.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—",g=e.status==="pending"?`
      <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
        <button
          type="button"
          class="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          onclick="UI.approveAccessRequest('${e.id}')"
          aria-label="Approva richiesta di ${e.nome} ${e.cognome}"
        >
          <span>✅</span> Approva Ruolo
        </button>
        <button
          type="button"
          class="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
          onclick="UI.rejectAccessRequest('${e.id}')"
          aria-label="Rifiuta richiesta di ${e.nome} ${e.cognome}"
        >
          <span>❌</span> Rifiuta
        </button>
      </div>`:"",h=e.status==="approved"?`<span class="text-xs text-gray-500 mt-1 block">Convalidato: ${e.approvedBy?`da ${e.approvedBy}`:"Accesso immediato automatico"}</span>`:e.status==="rejected"?`<span class="text-xs text-red-600 mt-1 block font-medium">Rifiutato: ${e.rejectedBy?`da ${e.rejectedBy}`:""}${e.rejectReason?` — Motivo: "${e.rejectReason}"`:""}</span>`:"";return`
    <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-gray-200">
            ${`${(e.nome||"?")[0]}${(e.cognome||"")[0]||""}`.toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="font-bold text-gray-900 text-base leading-tight">${e.nome} ${e.cognome}</h4>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${i.badge}">${i.icon} ${i.label}</span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${u}">Ruolo: ${e.ruoloRichiesto||"Esploratore"}</span>
            </div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-sm text-gray-600">${e.email||""}</span>
              ${e.email?`
                <button 
                  type="button" 
                  class="btn-contact-action btn-contact-email !w-5 !h-5 !p-0 rounded text-xs shadow-none" 
                  data-contact-action="email" 
                  data-value="${e.email}" 
                  title="Invia email a ${e.nome}"
                  aria-label="Invia email"
                >
                  <svg class="!w-3 !h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"/></svg>
                </button>`:""}
            </div>
            <div class="text-xs text-gray-400 mt-1">Registrato il: ${m}</div>
            ${h}
          </div>
        </div>
      </div>
      ${g}
    </div>`}).join("")};UI.approveAccessRequest=async function(s){if(!this.currentUser){this.showToast("Devi essere loggato come Admin.",{type:"error"});return}const o=(this._accessRequests||[]).find(a=>a.id===s),t=o?`${o.nome} ${o.cognome}`:"l'utente";this.showConfirmModal({title:"Approva Richiesta di Accesso",message:`Confermi l'approvazione per ${t} con ruolo "${o?.ruoloRichiesto||"CR"}"? Verrà aggiunto allo Staff con i relativi permessi.`,confirmText:"Approva e Abilita",onConfirm:async()=>{try{await DATA.approveAccessRequest(s,this.currentUser),this.state=await DATA.loadAll(),this.renderStaff(),await this.loadAccessRequests(),this.showToast(`Richiesta di ${t} approvata! Membro staff aggiunto.`,{type:"success",duration:4e3})}catch(a){console.error("Errore approvazione:",a),this.showToast("Errore durante l'approvazione: "+(a.message||""),{type:"error"})}}})};UI.rejectAccessRequest=async function(s){if(!this.currentUser){this.showToast("Devi essere loggato come Admin.",{type:"error"});return}const o=(this._accessRequests||[]).find(r=>r.id===s),t=o?`${o.nome} ${o.cognome}`:"l'utente",a=window.prompt(`Motivo del rifiuto per la richiesta di ${t} (opzionale):`);if(a!==null)try{await DATA.rejectAccessRequest(s,a||"",this.currentUser),await this.loadAccessRequests(),this.showToast(`Richiesta di ${t} rifiutata.`,{type:"info",duration:3e3})}catch(r){console.error("Errore rifiuto:",r),this.showToast("Errore durante il rifiuto: "+(r.message||""),{type:"error"})}};typeof window<"u"&&window.UI&&UI.state&&UI.state.staff&&UI.renderCurrentPage();
