import"./date-picker-BTKzc1qv.js";/* empty css              */import"./shared-BrQJEBhv.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderStaff(),this.setupStaffEventListeners()};UI.setupStaffEventListeners=function(){const e=this.qs("#addStaffForm");!e||e._bound||(e._bound=!0,this.setupFormValidation(e,{staffNome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il nome è obbligatorio"},staffCognome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il cognome è obbligatorio"},staffEmail:{required:!0,type:"email",requiredMessage:"L'email è obbligatoria"}}),e.addEventListener("submit",async r=>{if(r.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per aggiungere staff.",{type:"error"});return}const t=this.validateForm(e,{staffNome:{required:!0,minLength:1,maxLength:100},staffCognome:{required:!0,minLength:1,maxLength:100},staffEmail:{required:!0,type:"email"}});if(!t.valid){const a=Object.values(t.errors)[0];this.showToast(a,{type:"error"});const c=Object.keys(t.errors)[0],d=e.querySelector(`#${c}`);d&&d.focus();return}const o=this.qs("#staffNome").value.trim(),s=this.qs("#staffCognome").value.trim(),i=this.qs("#staffEmail").value.trim().toLowerCase(),n=this.qs("#staffRuolo")?.value||"CR";if(this.checkDuplicateStaffEmail(i)){this.showToast("Un membro staff con questa email esiste già",{type:"error"}),this.qs("#staffEmail").focus();return}const f=e.querySelector('button[type="submit"]'),l=f?.textContent;this.setButtonLoading(f,!0,l);try{await DATA.addStaff({nome:o,cognome:s,email:i,ruolo:n},this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Staff aggiunto con successo"),e.reset(),e.querySelectorAll(".valid, .invalid").forEach(a=>{a.classList.remove("valid","invalid")}),e.querySelectorAll(".has-error, .is-valid").forEach(a=>{a.classList.remove("has-error","is-valid")}),e.querySelectorAll(".field-error").forEach(a=>{a.textContent=""})}catch(a){console.error("Errore aggiunta staff:",a),this.showToast("Errore durante l'aggiunta: "+(a.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(f,!1,l)}}))};UI.renderStaff=function(){const e=this.qs("#staffList");if(!e)return;const r=[...this.state.staff||[]].sort((t,o)=>t.nome.localeCompare(o.nome)||t.cognome.localeCompare(o.cognome));this.renderInBatches({container:e,items:r,batchSize:200,onComplete:()=>{if(this.currentUser&&"ontouchstart"in window&&this.setupSwipeDelete(e,t=>{this.confirmDeleteStaff(t)},".swipeable-item","data-id"),"ontouchstart"in window&&e.querySelectorAll(".swipeable-item").forEach(o=>{const s=o.getAttribute("data-id"),i=this.state.staff?.find(n=>n.id===s);i&&this.setupLongPress(o,(n,f)=>{const l=[{label:"Copia nome",icon:"📋",action:async()=>{const a=`${i.nome} ${i.cognome}`.trim();try{await navigator.clipboard.writeText(a),this.showToast("Nome copiato",{type:"success",duration:1500})}catch(c){console.error("Errore copia:",c)}}},{label:"Copia email",icon:"📧",action:async()=>{if(i.email)try{await navigator.clipboard.writeText(i.email),this.showToast("Email copiata",{type:"success",duration:1500})}catch(a){console.error("Errore copia:",a)}}}];this.currentUser&&l.push({label:"Modifica",icon:"✏️",action:()=>{this.openEditStaffModal(s)}},{label:"Elimina",icon:"🗑️",danger:!0,action:()=>{this.confirmDeleteStaff(s)}}),this.showContextMenu(n,l)})}),"ontouchstart"in window){const t=e.closest(".bg-gray-50")||e.parentElement;t&&this.setupPullToRefresh(t,async()=>{this.showLoadingOverlay("Aggiornamento dati...");try{this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Dati aggiornati",{type:"success"})}catch(o){console.error("Errore refresh:",o),this.showToast("Errore durante l'aggiornamento",{type:"error"})}finally{this.hideLoadingOverlay()}})}},renderItem:t=>{const o={CR:"bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",VCR:"bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",SiSR:"bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",RiS:"bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"}[t.ruolo]||"bg-gray-100 text-gray-600",s=t.ruolo||"—";return`
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${t.id}" data-item-id="${t.id}">
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-medium text-gray-900">${t.nome} ${t.cognome}</h4>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${o}">${s}</span>
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
    `}})};UI.openEditStaffModal=function(e){if(!this.currentUser){this.showToast("Devi essere loggato per modificare staff.",{type:"error"});return}const r=(this.state.staff||[]).find(o=>o.id===e);if(!r)return;this.qs("#editStaffId").value=r.id,this.qs("#editStaffNome").value=r.nome||"",this.qs("#editStaffCognome").value=r.cognome||"",this.qs("#editStaffEmail").value=r.email||"";const t=this.qs("#editStaffRuolo");t&&(t.value=r.ruolo||"CR"),this.showModal("editStaffModal")};UI.confirmDeleteStaff=function(e){if(!this.currentUser){this.showToast("Devi essere loggato per eliminare staff.",{type:"error"});return}const r=(this.state.staff||[]).find(o=>o.id===e);if(!r)return;this.staffToDeleteId=e;const t=this.qs("#staffNameToDelete");t&&(t.textContent=`${r.nome} ${r.cognome}`),this.showModal("confirmDeleteStaffModal")};document.addEventListener("DOMContentLoaded",()=>{console.log("Pagina Staff caricata")});
