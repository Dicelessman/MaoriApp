import"./date-picker-OzOI86qq.js";/* empty css              */import"./shared-CZWINqpE.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderStaff(),this.setupStaffEventListeners()};UI.setupStaffEventListeners=function(){const e=this.qs("#addStaffForm");!e||e._bound||(e._bound=!0,this.setupFormValidation(e,{staffNome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il nome è obbligatorio"},staffCognome:{required:!0,minLength:1,maxLength:100,requiredMessage:"Il cognome è obbligatorio"},staffEmail:{required:!0,type:"email",requiredMessage:"L'email è obbligatoria"}}),e.addEventListener("submit",async i=>{if(i.preventDefault(),!this.currentUser){this.showToast("Devi essere loggato per aggiungere staff.",{type:"error"});return}const t=this.validateForm(e,{staffNome:{required:!0,minLength:1,maxLength:100},staffCognome:{required:!0,minLength:1,maxLength:100},staffEmail:{required:!0,type:"email"}});if(!t.valid){const o=Object.values(t.errors)[0];this.showToast(o,{type:"error"});const l=Object.keys(t.errors)[0],c=e.querySelector(`#${l}`);c&&c.focus();return}const a=this.qs("#staffNome").value.trim(),n=this.qs("#staffCognome").value.trim(),s=this.qs("#staffEmail").value.trim().toLowerCase();if(this.checkDuplicateStaffEmail(s)){this.showToast("Un membro staff con questa email esiste già",{type:"error"}),this.qs("#staffEmail").focus();return}const r=e.querySelector('button[type="submit"]'),f=r?.textContent;this.setButtonLoading(r,!0,f);try{await DATA.addStaff({nome:a,cognome:n,email:s},this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Staff aggiunto con successo"),e.reset(),e.querySelectorAll(".valid, .invalid").forEach(o=>{o.classList.remove("valid","invalid")}),e.querySelectorAll(".has-error, .is-valid").forEach(o=>{o.classList.remove("has-error","is-valid")}),e.querySelectorAll(".field-error").forEach(o=>{o.textContent=""})}catch(o){console.error("Errore aggiunta staff:",o),this.showToast("Errore durante l'aggiunta: "+(o.message||"Errore sconosciuto"),{type:"error",duration:4e3})}finally{this.setButtonLoading(r,!1,f)}}))};UI.renderStaff=function(){const e=this.qs("#staffList");if(!e)return;const i=[...this.state.staff||[]].sort((t,a)=>t.nome.localeCompare(a.nome)||t.cognome.localeCompare(a.cognome));this.renderInBatches({container:e,items:i,batchSize:200,onComplete:()=>{if(this.currentUser&&"ontouchstart"in window&&this.setupSwipeDelete(e,t=>{this.confirmDeleteStaff(t)},".swipeable-item","data-id"),"ontouchstart"in window&&e.querySelectorAll(".swipeable-item").forEach(a=>{const n=a.getAttribute("data-id"),s=this.state.staff?.find(r=>r.id===n);s&&this.setupLongPress(a,(r,f)=>{const o=[{label:"Copia nome",icon:"📋",action:async()=>{const l=`${s.nome} ${s.cognome}`.trim();try{await navigator.clipboard.writeText(l),this.showToast("Nome copiato",{type:"success",duration:1500})}catch(c){console.error("Errore copia:",c)}}},{label:"Copia email",icon:"📧",action:async()=>{if(s.email)try{await navigator.clipboard.writeText(s.email),this.showToast("Email copiata",{type:"success",duration:1500})}catch(l){console.error("Errore copia:",l)}}}];this.currentUser&&o.push({label:"Modifica",icon:"✏️",action:()=>{this.openEditStaffModal(n)}},{label:"Elimina",icon:"🗑️",danger:!0,action:()=>{this.confirmDeleteStaff(n)}}),this.showContextMenu(r,o)})}),"ontouchstart"in window){const t=e.closest(".bg-gray-50")||e.parentElement;t&&this.setupPullToRefresh(t,async()=>{this.showLoadingOverlay("Aggiornamento dati...");try{this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderStaff(),this.showToast("Dati aggiornati",{type:"success"})}catch(a){console.error("Errore refresh:",a),this.showToast("Errore durante l'aggiornamento",{type:"error"})}finally{this.hideLoadingOverlay()}})}},renderItem:t=>`
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${t.id}" data-item-id="${t.id}">
        <div class="flex-1">
          <h4 class="font-medium text-gray-900">${t.nome} ${t.cognome}</h4>
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
    `})};UI.openEditStaffModal=function(e){if(!this.currentUser){this.showToast("Devi essere loggato per modificare staff.",{type:"error"});return}const i=(this.state.staff||[]).find(t=>t.id===e);i&&(this.qs("#editStaffId").value=i.id,this.qs("#editStaffNome").value=i.nome||"",this.qs("#editStaffCognome").value=i.cognome||"",this.qs("#editStaffEmail").value=i.email||"",this.showModal("editStaffModal"))};UI.confirmDeleteStaff=function(e){if(!this.currentUser){this.showToast("Devi essere loggato per eliminare staff.",{type:"error"});return}const i=(this.state.staff||[]).find(a=>a.id===e);if(!i)return;this.staffToDeleteId=e;const t=this.qs("#staffNameToDelete");t&&(t.textContent=`${i.nome} ${i.cognome}`),this.showModal("confirmDeleteStaffModal")};document.addEventListener("DOMContentLoaded",()=>{console.log("Pagina Staff caricata")});
