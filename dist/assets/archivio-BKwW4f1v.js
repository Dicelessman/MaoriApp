import"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";(function(){const i=()=>{const r=typeof window<"u"?window.UI:typeof UI<"u"?UI:null;r?(r.renderCurrentPage=function(){this.renderArchive()},n(r)):setTimeout(i,10)};i()})();function n(i){i.renderArchive=async function(){const r=this.qs("#archiveList");if(r){this.showLoadingOverlay("Caricamento archivio...");try{const t=await DATA.loadArchived();if(!t||t.length===0){r.innerHTML=`
                    <div class="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                        <div class="text-4xl mb-3">🗂️</div>
                        <h3 class="text-lg font-medium text-gray-900">Archivio vuoto</h3>
                        <p class="text-gray-500">Nessun esploratore archiviato trovato.</p>
                    </div>
                `;return}t.sort((e,o)=>(e.cognome||"").localeCompare(o.cognome||"")||(e.nome||"").localeCompare(o.nome||"")),r.innerHTML=t.map(e=>`
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                            ${(e.nome||"?")[0]}${(e.cognome||"?")[0]}
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">${e.nome} ${e.cognome}</h4>
                            <div class="text-xs text-gray-500">
                                ${e.pv_pattuglia?`<span class="mr-2">🦅 ${e.pv_pattuglia}</span>`:""}
                                ${e.totem?`<span>🗿 ${e.totem}</span>`:""}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                        <a 
                            href="scout2.html?id=${e.id}"
                            class="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            title="Vedi scheda"
                        >
                            <span>📄</span> Vedi
                        </a>
                        <button 
                            onclick="UI.confirmRestoreScout('${e.id}', '${e.nome.replace(/'/g,"\\'")}', '${e.cognome.replace(/'/g,"\\'")}')"
                            class="px-3 py-1.5 bg-white border border-green-600 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
                            title="Ripristina nei frequentanti"
                        >
                            <span>↩️</span> Ripristina
                        </button>
                    </div>
                </div>
            `).join("")}catch(t){console.error("Errore caricamento archivio:",t),r.innerHTML=`<div class="text-red-500 text-center py-4">Errore durante il caricamento dell'archivio.</div>`}finally{this.hideLoadingOverlay()}}},i.confirmRestoreScout=function(r,t,e){confirm(`Sei sicuro di voler ripristinare ${t} ${e} tra gli esploratori attivi?`)&&this.restoreScout(r)},i.restoreScout=async function(r){if(!this.currentUser){this.showToast("Devi essere loggato per eseguire questa operazione",{type:"error"});return}this.showLoadingOverlay("Ripristino in corso...");try{await DATA.updateScout(r,{archived:!1},this.currentUser),this.showToast("Esploratore ripristinato con successo",{type:"success"}),this.renderArchive()}catch(t){console.error("Errore ripristino:",t),this.showToast("Errore durante il ripristino",{type:"error"})}finally{this.hideLoadingOverlay()}}}
