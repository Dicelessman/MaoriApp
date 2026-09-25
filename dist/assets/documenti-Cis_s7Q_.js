import"./date-picker-DdNAYcTb.js";import"./shared-Dm_IxfHL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderDocumentiMatrix()};UI.renderDocumentiMatrix=function(){const i=this.qs("#documentiMatrix");if(!i)return;const p=(this.state.scouts||[]).slice(),c=e=>e&&e.toDate?e.toDate():new Date(e),a=e=>{if(!e)return"";const l=this.toJsDate?this.toJsDate(e):e&&e.toDate?e.toDate():new Date(e);return isNaN(l.getTime())?"":l.toISOString().split("T")[0]};p.sort((e,l)=>{const m=`${e.nome||""} ${e.cognome||""}`.trim(),h=`${l.nome||""} ${l.cognome||""}`.trim();return m.localeCompare(h,"it")});const n=[{key:"doc_quota1",label:"Quota anno",type:"year"},{key:"doc_quota2",label:"Quota anno",type:"year"},{key:"doc_quota3",label:"Quota anno",type:"year"},{key:"doc_quota4",label:"Quota anno",type:"year"},{key:"san_cert_scadenza",label:"Certificato Medico",type:"cert_date"},{key:"doc_iscr",label:"Iscrizione",type:"checkbox"},{key:"doc_priv",label:"Privacy",type:"checkbox"},{key:"doc_san",label:"Dati medici",type:"checkbox"},{key:"doc_liberatoria",label:"Liberatoria immagini",type:"checkbox"},{key:"reminder_actions",label:"Promemoria",type:"actions"}],s=!!(this.currentUser&&this.selectedStaffId);let t=`
    <table class="min-w-full border-collapse border border-gray-300 text-sm">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 text-left font-semibold sticky left-0 bg-gray-100 z-10 min-w-[200px]">Esploratore</th>
          ${n.map(e=>`<th class="border border-gray-300 p-2 text-center font-semibold min-w-[120px]">${e.label}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
  `;p.forEach((e,l)=>{const m=`${e.nome||""} ${e.cognome||""}`.trim(),h=l%2===0?"bg-white":"bg-gray-50";t+=`
      <tr class="${h}">
        <td class="border border-gray-300 p-2 font-medium sticky left-0 ${h} z-10">
          <a href="scout2.html?id=${e.id}" class="text-blue-600 hover:text-blue-800 hover:underline">${m||"Senza nome"}</a>
        </td>
    `,n.forEach(o=>{const d=e[o.key];if(o.type==="actions")t+=`
          <td class="border border-gray-300 p-1.5 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onclick="UI.sendMedicalWhatsAppReminder('${e.id}')"
                class="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded shadow-sm inline-flex items-center gap-1 transition"
                title="Invia promemoria WhatsApp al genitore"
              >
                <span>💬</span> <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onclick="UI.printMedicalSingle('${e.id}')"
                class="px-2 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded shadow-sm inline-flex items-center gap-1 transition"
                title="Stampa Scheda Sanitaria Campo per ${m}"
              >
                <span>🏥</span> <span>Scheda</span>
              </button>
            </div>
          </td>
        `;else if(o.type==="cert_date"){const r=this.getScoutMedicalStatus?this.getScoutMedicalStatus(e):null,y=a(d);let b="";r&&(b=`<span class="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.badgeClass}">${r.statusLabel}</span>`),s?t+=`
            <td class="border border-gray-300 p-1.5 text-center min-w-[150px]">
              <input 
                type="date" 
                class="text-xs border border-gray-300 rounded px-1.5 py-0.5 w-full text-center"
                value="${y}"
                data-scout-id="${e.id}"
                data-field="${o.key}"
                onchange="UI.updateDocumentoDate({scoutId:'${e.id}', field:'${o.key}', value:this.value})"
              />
              <div class="mt-1">${b}</div>
            </td>
          `:t+=`
            <td class="border border-gray-300 p-2 text-center">
              <div>${r?.formattedDate||'<span class="text-gray-400">-</span>'}</div>
              ${b?`<div class="mt-0.5">${b}</div>`:""}
            </td>
          `}else if(o.type==="checkbox"){const r=!!d;s?t+=`
            <td class="border border-gray-300 p-2 text-center">
              <input 
                type="checkbox" 
                class="w-4 h-4" 
                ${r?"checked":""}
                data-scout-id="${e.id}"
                data-field="${o.key}"
                onchange="UI.updateDocumento({scoutId:'${e.id}', field:'${o.key}', value:this.checked})"
              />
            </td>
          `:t+=`
            <td class="border border-gray-300 p-2 text-center">
              ${r?"✓":'<span class="text-gray-400">-</span>'}
            </td>
          `}else if(o.type==="year"){let r="";if(d){const y=c(d);isNaN(y.getTime())?typeof d=="string"&&d.length===4&&/^\d{4}$/.test(d)&&(r=d):r=y.getFullYear().toString()}s?t+=`
            <td class="border border-gray-300 p-1">
              <input 
                type="number" 
                min="2022" 
                max="2100" 
                step="1" 
                class="w-full text-xs border border-gray-300 rounded px-1 py-0.5 text-center" 
                value="${r}"
                data-scout-id="${e.id}"
                data-field="${o.key}"
                onchange="UI.updateDocumentoYear({scoutId:'${e.id}', field:'${o.key}', value:this.value})"
              />
            </td>
          `:t+=`
            <td class="border border-gray-300 p-2 text-center">
              ${r||'<span class="text-gray-400">-</span>'}
            </td>
          `}}),t+="</tr>"}),t+=`
      </tbody>
    </table>
  `,i.innerHTML=t;const u=this.qs("#printCartellinaSanitariaBtn");u&&!u._bound&&(u._bound=!0,u.addEventListener("click",async()=>{typeof UI.printMedicalBatch=="function"?await UI.printMedicalBatch(null,"Cartellina Sanitaria Campo Reparto"):UI.showToast("Funzionalità di stampa in caricamento...",{type:"info"})}))};UI.updateDocumento=async function({scoutId:i,field:p,value:c}){if(!this.currentUser){this.showToast("Devi essere loggato per modificare i documenti.",{type:"error"});return}if(!this.selectedStaffId){this.showToast("Seleziona uno Staff per abilitare le modifiche.",{type:"warning"});return}try{const a=(this.state.scouts||[]).find(s=>s.id===i);if(!a){this.showToast("Esploratore non trovato",{type:"error"});return}const n={...a,[p]:c?!0:null};delete n.id,await DATA.updateScout(i,n,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderDocumentiMatrix(),this.showToast("Documento aggiornato")}catch(a){console.error("Errore aggiornamento documento:",a),this.showToast("Errore durante l'aggiornamento: "+a.message,{type:"error",duration:4e3})}};UI.updateDocumentoYear=async function({scoutId:i,field:p,value:c}){if(!this.currentUser){this.showToast("Devi essere loggato per modificare i documenti.",{type:"error"});return}if(!this.selectedStaffId){this.showToast("Seleziona uno Staff per abilitare le modifiche.",{type:"warning"});return}try{const a=(this.state.scouts||[]).find(t=>t.id===i);if(!a){this.showToast("Esploratore non trovato",{type:"error"});return}let n=null;if(c&&c.trim()!==""){const t=parseInt(c);!isNaN(t)&&t>=2022&&t<=2100&&(n=`${t}-01-01`)}const s={...a,[p]:n};delete s.id,await DATA.updateScout(i,s,this.currentUser),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),this.renderDocumentiMatrix(),this.showToast("Documento aggiornato")}catch(a){console.error("Errore aggiornamento documento:",a),this.showToast("Errore durante l'aggiornamento: "+a.message,{type:"error",duration:4e3})}};
