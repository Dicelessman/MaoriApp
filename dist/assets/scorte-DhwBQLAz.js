import{D as y,U as x,e as L}from"./date-picker-OzOI86qq.js";/* empty css              */import"./shared-CZWINqpE.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";typeof window<"u"&&(window.DATA=y,window.UI=x);x.renderCurrentPage=function(){this.initScorte()};x._scorteState={items:[],lists:["Campo Estivo","Uniformi","Distintivi","Generale"],activeList:typeof localStorage<"u"&&localStorage.getItem("scorte-active-list")||"all",search:"",category:"",status:"all",sort:"categoria_nome",parsedImportItems:[],bound:!1};x.initScorte=async function(){try{this.showLoadingOverlay&&this.showLoadingOverlay("Caricamento scorte e liste...");const[t,e]=await Promise.all([y.getScorte(),y.getListeScorte()]);this._scorteState.items=t||[],this._scorteState.lists=e&&e.length>0?e:["Campo Estivo","Uniformi","Distintivi","Generale"]}catch(t){console.error("Errore caricamento scorte:",t),this._scorteState.items=[],this._scorteState.lists=["Campo Estivo","Uniformi","Distintivi","Generale"]}finally{this.hideLoadingOverlay&&this.hideLoadingOverlay()}this.setupScorteControls(),this.renderListeTabs(),this.renderScorte()};x.setupScorteControls=function(){const t=document.getElementById("scorteSearchInput"),e=document.getElementById("scorteCategoryFilter"),o=document.getElementById("scorteStatusFilter"),i=document.getElementById("scorteSortSelect"),n=document.getElementById("resetScorteFiltersBtn"),l=document.getElementById("addMaterialBtn"),p=document.getElementById("importMaterialsBtn"),d=document.getElementById("openPreventivoRiordinoBtn"),f=document.getElementById("exportCsvBtn"),r=document.getElementById("printBtn"),m=document.getElementById("kpiSottoScortaCard");if(this.populateCategoryFilter(),!this._scorteState.bound){if(this._scorteState.bound=!0,t){let a;t.addEventListener("input",c=>{clearTimeout(a),a=setTimeout(()=>{this._scorteState.search=c.target.value.trim().toLowerCase(),this.renderScorte()},150)})}e&&e.addEventListener("change",a=>{this._scorteState.category=a.target.value,this.renderScorte()}),o&&o.addEventListener("change",a=>{this._scorteState.status=a.target.value,this.renderScorte()}),i&&i.addEventListener("change",a=>{this._scorteState.sort=a.target.value,this.renderScorte()}),n&&n.addEventListener("click",()=>{this._scorteState.search="",this._scorteState.category="",this._scorteState.status="all",this._scorteState.sort="categoria_nome",t&&(t.value=""),e&&(e.value=""),o&&(o.value="all"),i&&(i.value="categoria_nome"),this.renderScorte(),this.showToast("Filtri azzerati",{type:"info"})}),m&&m.addEventListener("click",()=>{this._scorteState.status="reorder",o&&(o.value="reorder"),this.renderScorte()}),l&&l.addEventListener("click",()=>{this.openMaterialModal()}),p&&p.addEventListener("click",()=>{this.openImportModal()}),d&&d.addEventListener("click",()=>{this.openPreventivoRiordinoModal()}),f&&f.addEventListener("click",()=>{this.exportScorteCsv()}),r&&r.addEventListener("click",()=>{this.printListaSpesa()}),this.setupListManagementEvents(),this.setupMaterialModalEvents(),this.setupImportModalEvents(),this.setupPreventivoModalEvents()}};x.renderListeTabs=function(){const t=document.getElementById("listeTabsContainer");if(!t)return;const e=this._scorteState.items||[],o=this._scorteState.lists||[],i=this._scorteState.activeList,n={};o.forEach(a=>{n[a]={total:0,reorder:0}});let l=0,p=0;e.forEach(a=>{const c=(a.lista||"Generale").trim(),h=Number(a.quantita)||0,u=(Number(a.quantitaMinima)||0)>h;l++,u&&p++,n[c]||(n[c]={total:0,reorder:0}),n[c].total++,u&&n[c].reorder++});const d=Array.from(new Set([...o,...Object.keys(n)])).filter(Boolean);let f="";const r=i==="all";f+=`
    <button type="button" data-list="all" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${r?"bg-green-700 text-white shadow-sm ring-2 ring-green-600":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}">
      <span>Tutte le Liste</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] ${r?"bg-white/20 text-white":"bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}">${l}</span>
      ${p>0?`<span class="text-[10px]" title="${p} articoli sotto scorta">⚠️</span>`:""}
    </button>
  `,d.forEach(a=>{const c=i===a,h=n[a]||{total:0,reorder:0};f+=`
      <button type="button" data-list="${a}" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${c?"bg-green-700 text-white shadow-sm ring-2 ring-green-600":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}">
        <span>${a}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] ${c?"bg-white/20 text-white":"bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}">${h.total}</span>
        ${h.reorder>0?`<span class="text-[10px] ${c?"text-amber-200":"text-amber-600"}" title="${h.reorder} da riordinare">⚠️ ${h.reorder}</span>`:""}
      </button>
    `}),t.innerHTML=f,t.querySelectorAll(".list-tab-btn").forEach(a=>{a.addEventListener("click",c=>{const h=a.getAttribute("data-list");this.switchActiveList(h)})});const m=document.getElementById("activeListActions");m&&(i!=="all"&&i!=="Generale"?m.classList.remove("hidden"):m.classList.add("hidden"))};x.switchActiveList=function(t){this._scorteState.activeList=t;try{localStorage.setItem("scorte-active-list",t)}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()};x.setupListManagementEvents=function(){const t=document.getElementById("addListaBtn"),e=document.getElementById("renameActiveListBtn"),o=document.getElementById("deleteActiveListBtn"),i=document.getElementById("listModal"),n=document.getElementById("closeListModalBtn"),l=document.getElementById("cancelListBtn"),p=document.getElementById("listForm");t&&t.addEventListener("click",()=>{this.openListModal()}),e&&e.addEventListener("click",()=>{const d=this._scorteState.activeList;d&&d!=="all"&&this.openListModal(d)}),o&&o.addEventListener("click",()=>{const d=this._scorteState.activeList;d&&d!=="all"&&this.deleteActiveList(d)}),n&&(n.onclick=()=>i?.classList.add("hidden")),l&&(l.onclick=()=>i?.classList.add("hidden")),p&&(p.onsubmit=async d=>{d.preventDefault(),await this.saveListForm()})};x.openListModal=function(t=""){const e=document.getElementById("listModal"),o=document.getElementById("listModalTitle"),i=document.getElementById("listNameInput"),n=document.getElementById("listOldName");e&&(t?(o&&(o.textContent=`Rinomina Lista "${t}"`),i&&(i.value=t),n&&(n.value=t)):(o&&(o.textContent="Nuova Lista Materiali"),i&&(i.value=""),n&&(n.value="")),e.classList.remove("hidden"),i?.focus())};x.saveListForm=async function(){const t=document.getElementById("listModal"),e=document.getElementById("listNameInput"),o=document.getElementById("listOldName"),i=e?.value.trim(),n=o?.value.trim();if(!i){this.showToast("Inserisci il nome della lista",{type:"error"});return}try{n?(await y.renameListaScorta(n,i,this.currentUser),this.showToast(`Lista rinominata in "${i}"`)):(await y.addListaScorta(i,this.currentUser),this.showToast(`Nuova lista "${i}" creata con successo!`)),t?.classList.add("hidden"),this._scorteState.lists=await y.getListeScorte(),this._scorteState.items=await y.getScorte(),this._scorteState.activeList=i;try{localStorage.setItem("scorte-active-list",i)}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(l){console.error("Errore salvataggio lista:",l),this.showToast("Errore durante il salvataggio della lista",{type:"error"})}};x.deleteActiveList=function(t){if(!t||t==="all"||t==="Generale")return;const e=(this._scorteState.items||[]).filter(i=>(i.lista||"Generale")===t).length,o=e>0?`Sei sicuro di voler eliminare la lista "${t}"? I suoi ${e} articoli NON verranno cancellati ma spostati nella lista "Generale".`:`Sei sicuro di voler eliminare la lista "${t}"?`;this.showConfirmModal({title:`Elimina Lista "${t}"`,message:o,confirmText:"Elimina Lista",cancelText:"Annulla",onConfirm:async()=>{try{await y.deleteListaScorta(t,this.currentUser),this.showToast(`Lista "${t}" eliminata`),this._scorteState.lists=await y.getListeScorte(),this._scorteState.items=await y.getScorte(),this._scorteState.activeList="all";try{localStorage.setItem("scorte-active-list","all")}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(i){console.error("Errore eliminazione lista:",i),this.showToast("Errore durante l'eliminazione della lista",{type:"error"})}}})};x.populateCategoryFilter=function(){const t=document.getElementById("scorteCategoryFilter");if(!t)return;const e=this._scorteState.activeList;let o=this._scorteState.items||[];e!=="all"&&(o=o.filter(l=>(l.lista||"Generale")===e));const i=this._scorteState.category,n=Array.from(new Set(o.map(l=>(l.categoria||"Generale").trim()).filter(Boolean))).sort((l,p)=>l.localeCompare(p));t.innerHTML='<option value="">Tutte le categorie</option>'+n.map(l=>`<option value="${l}">${l}</option>`).join(""),t.value=i};x.renderScorte=function(){const t=this._scorteState.items||[],e=this._scorteState.activeList,o=e==="all"?t:t.filter(s=>(s.lista||"Generale")===e),i=o.length,n=new Set(o.map(s=>(s.categoria||"Generale").trim()));let l=0,p=0,d=0,f=null;o.forEach(s=>{const E=Number(s.quantita)||0,B=Number(s.quantitaMinima)||0,$=Number(s.prezzoUnitario)||0,T=Math.max(0,B-E);if(T>0&&(l++,p+=T,d+=T*$),s.dataControllo){const k=new Date(s.dataControllo);!isNaN(k)&&(!f||k>f)&&(f=k)}});const r=document.getElementById("kpiTotalItems"),m=document.getElementById("kpiTotalItemsLabel"),a=document.getElementById("kpiCategoriesCount"),c=document.getElementById("kpiToRestockItems"),h=document.getElementById("kpiToRestockUnits"),v=document.getElementById("kpiRestockTotalCost"),u=document.getElementById("kpiRestockCostLabel"),g=document.getElementById("kpiRestockCostSub"),b=document.getElementById("kpiInventoryDate");m&&(m.textContent=e==="all"?"Totale Articoli a Catalogo":`Articoli in "${e}"`),r&&(r.textContent=String(i)),a&&(a.textContent=`${n.size} categorie in questa lista`),c&&(c.textContent=String(l)),h&&(h.textContent=`${p} unità mancanti per l'obiettivo`),u&&(u.textContent=e==="all"?"Preventivo Spesa Totale":`Preventivo "${e}"`),v&&(v.textContent=`€ ${d.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`),g&&(g.textContent=e==="all"?"Spesa stimata totale di riordino":`Spesa stimata per ordine ${e}`),b&&(b.textContent=f?f.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}):new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}));let S=[...o];if(this._scorteState.search){const s=this._scorteState.search;S=S.filter(E=>(E.nome||"").toLowerCase().includes(s)||(E.note||"").toLowerCase().includes(s)||(E.categoria||"").toLowerCase().includes(s)||(E.lista||"").toLowerCase().includes(s))}this._scorteState.category&&(S=S.filter(s=>(s.categoria||"Generale").trim()===this._scorteState.category)),this._scorteState.status==="reorder"?S=S.filter(s=>(Number(s.quantitaMinima)||0)>(Number(s.quantita)||0)):this._scorteState.status==="ok"&&(S=S.filter(s=>(Number(s.quantitaMinima)||0)<=(Number(s.quantita)||0)));const w=this._scorteState.sort;S.sort((s,E)=>{const B=(s.nome||"").trim(),$=(E.nome||"").trim(),T=(s.categoria||"Generale").trim(),k=(E.categoria||"Generale").trim(),_=Number(s.quantita)||0,q=Number(E.quantita)||0,M=Math.max(0,(Number(s.quantitaMinima)||0)-_),N=Math.max(0,(Number(E.quantitaMinima)||0)-q),F=M*(Number(s.prezzoUnitario)||0),D=N*(Number(E.prezzoUnitario)||0);if(w==="categoria_nome"){const R=T.localeCompare(k,"it");return R!==0?R:B.localeCompare($,"it")}return w==="nome_asc"?B.localeCompare($,"it"):w==="nome_desc"?$.localeCompare(B,"it"):w==="quantita_asc"?_-q||B.localeCompare($,"it"):w==="quantita_desc"?q-_||B.localeCompare($,"it"):w==="da_riordinare_desc"?N-M||D-F:w==="costo_riordino_desc"?D-F||N-M:0});const C=document.getElementById("scorteFilterSummary");if(C){const s=e==="all"?"Tutte le liste":`Lista: "${e}"`;C.textContent=`[${s}] Visualizzati: ${S.length} di ${i} articoli (${l} sotto scorta)`}const I=document.getElementById("scorteTableBody"),z=document.getElementById("scorteTableFoot");if(!I)return;if(S.length===0){const s=i===0&&e!=="all"?`Nessun articolo presente nella lista "${e}". Clicca su "+ Nuovo Articolo" o "Importa Lista" per aggiungerne.`:"Nessun articolo trovato con i filtri selezionati.";I.innerHTML=`
      <tr>
        <td colspan="10" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          ${s}
        </td>
      </tr>
    `,z&&(z.innerHTML="");return}let A=0,U=0;if(I.innerHTML=S.map(s=>{const E=Number(s.quantita)||0,B=Number(s.quantitaMinima)||0,$=Number(s.prezzoUnitario)||0,T=s.unitaMisura||"pz",k=Math.max(0,B-E),_=k*$,q=(s.lista||"Generale").trim();A+=k,U+=_;const M=k>0,N=M?`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
           ⚠️ +${k} ${T}
         </span>`:`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
           ✓ In scorta
         </span>`;return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${M?"bg-amber-50/30 dark:bg-amber-950/10":""}" data-id="${L(s.id)}">
        <!-- Nome & Note -->
        <td class="p-3">
          <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>${L(s.nome)}</span>
          </div>
          ${s.note?`<div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5" title="${L(s.note)}">📝 ${L(s.note)}</div>`:""}
        </td>

        <!-- Lista -->
        <td class="p-3 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            📑 ${L(q)}
          </span>
        </td>

        <!-- Categoria -->
        <td class="p-3 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            🏷️ ${L(s.categoria||"Generale")}
          </span>
        </td>

        <!-- Quantità Attuale con pulsanti rapidi + e - -->
        <td class="p-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
            <button type="button" class="btn-qty-minus text-gray-500 hover:text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${s.id}" title="Diminuisci scorta">-</button>
            <span class="font-bold text-sm w-8 text-center text-gray-800 dark:text-gray-200">${E}</span>
            <button type="button" class="btn-qty-plus text-gray-500 hover:text-green-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${s.id}" title="Aumenta scorta">+</button>
            <span class="text-xs text-gray-400 ml-0.5">${T}</span>
          </div>
        </td>

        <!-- Scorta Minima -->
        <td class="p-3 text-center whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
          ${B} <span class="text-xs text-gray-400">${T}</span>
        </td>

        <!-- Da Riordinare -->
        <td class="p-3 text-center whitespace-nowrap">
          ${N}
        </td>

        <!-- Prezzo Unitario -->
        <td class="p-3 text-right whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
          € ${$.toFixed(2)}
        </td>

        <!-- Preventivo Riordino -->
        <td class="p-3 text-right whitespace-nowrap font-mono font-bold ${M?"text-amber-700 dark:text-amber-400":"text-gray-400"}">
          € ${_.toFixed(2)}
        </td>

        <!-- Data Controllo -->
        <td class="p-3 text-center whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
          ${s.dataControllo?new Date(s.dataControllo).toLocaleDateString("it-IT"):"-"}
        </td>

        <!-- Azioni -->
        <td class="p-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <button type="button" class="btn-edit-item p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors" data-id="${s.id}" title="Modifica articolo">
              ✏️
            </button>
            <button type="button" class="btn-delete-item p-1 text-red-600 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors" data-id="${s.id}" title="Elimina articolo">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `}).join(""),z){const s=e==="all"?"Tutte le liste":`Lista "${e}"`;z.innerHTML=`
      <tr>
        <td colspan="5" class="p-3 text-right text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
          Totale Preventivo Riordino (${s}):
        </td>
        <td class="p-3 text-center text-amber-700 dark:text-amber-300 font-extrabold">
          ${A>0?`+${A} unità`:"0"}
        </td>
        <td></td>
        <td class="p-3 text-right font-mono font-extrabold text-green-700 dark:text-green-300 text-base">
          € ${U.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}
        </td>
        <td colspan="2"></td>
      </tr>
    `}I.querySelectorAll(".btn-qty-plus").forEach(s=>{s.addEventListener("click",()=>{this.adjustItemQuantity(s.getAttribute("data-id"),1)})}),I.querySelectorAll(".btn-qty-minus").forEach(s=>{s.addEventListener("click",()=>{this.adjustItemQuantity(s.getAttribute("data-id"),-1)})}),I.querySelectorAll(".btn-edit-item").forEach(s=>{s.addEventListener("click",()=>{this.openMaterialModal(s.getAttribute("data-id"))})}),I.querySelectorAll(".btn-delete-item").forEach(s=>{s.addEventListener("click",()=>{this.deleteMaterial(s.getAttribute("data-id"))})})};x.adjustItemQuantity=async function(t,e){const o=(this._scorteState.items||[]).find(p=>p.id===t);if(!o)return;const i=Number(o.quantita)||0,n=Math.max(0,i+e);if(n===i)return;const l=new Date().toISOString().split("T")[0];try{await y.updateScorta(t,{quantita:n,dataControllo:l},this.currentUser),o.quantita=n,o.dataControllo=l,this.renderListeTabs(),this.renderScorte()}catch(p){console.error("Errore aggiornamento rapido quantità:",p),this.showToast("Errore durante l'aggiornamento",{type:"error"})}};x.setupMaterialModalEvents=function(){const t=document.getElementById("materialModal"),e=document.getElementById("closeMaterialModalBtn"),o=document.getElementById("cancelMaterialBtn"),i=document.getElementById("materialForm");e&&(e.onclick=()=>t?.classList.add("hidden")),o&&(o.onclick=()=>t?.classList.add("hidden")),t&&t.addEventListener("click",n=>{n.target===t&&t.classList.add("hidden")}),i&&(i.onsubmit=async n=>{n.preventDefault(),await this.saveMaterialForm()})};x.openMaterialModal=function(t=null){const e=document.getElementById("materialModal"),o=document.getElementById("materialModalTitle"),i=document.getElementById("materialId"),n=document.getElementById("materialNome"),l=document.getElementById("materialLista"),p=document.getElementById("listeScorteDataList"),d=document.getElementById("materialCategoria"),f=document.getElementById("materialUnita"),r=document.getElementById("materialQuantita"),m=document.getElementById("materialQuantitaMinima"),a=document.getElementById("materialPrezzo"),c=document.getElementById("materialDataControllo"),h=document.getElementById("materialNote");if(!e)return;const v=new Date().toISOString().split("T")[0];if(p){const g=this._scorteState.lists||["Campo Estivo","Uniformi","Distintivi","Generale"];p.innerHTML=g.map(b=>`<option value="${b}"></option>`).join("")}const u=this._scorteState.activeList!=="all"?this._scorteState.activeList:"Generale";if(t){const g=(this._scorteState.items||[]).find(b=>b.id===t);if(!g)return;o&&(o.textContent="Modifica Articolo Scorte"),i&&(i.value=g.id),n&&(n.value=g.nome||""),l&&(l.value=g.lista||u),d&&(d.value=g.categoria||"Generale"),f&&(f.value=g.unitaMisura||"pz"),r&&(r.value=g.quantita!==void 0?g.quantita:0),m&&(m.value=g.quantitaMinima!==void 0?g.quantitaMinima:0),a&&(a.value=g.prezzoUnitario!==void 0?g.prezzoUnitario:0),c&&(c.value=g.dataControllo||v),h&&(h.value=g.note||"")}else o&&(o.textContent="Nuovo Articolo Scorte"),i&&(i.value=""),n&&(n.value=""),l&&(l.value=u),d&&(d.value=this._scorteState.category||"Campeggio"),f&&(f.value="pz"),r&&(r.value="0"),m&&(m.value="10"),a&&(a.value="0.00"),c&&(c.value=v),h&&(h.value="");e.classList.remove("hidden"),n?.focus()};x.saveMaterialForm=async function(){const t=document.getElementById("materialModal"),e=document.getElementById("materialId")?.value,o=document.getElementById("materialNome")?.value.trim(),i=document.getElementById("materialLista")?.value.trim()||"Generale",n=document.getElementById("materialCategoria")?.value.trim()||"Generale",l=document.getElementById("materialUnita")?.value||"pz",p=Number(document.getElementById("materialQuantita")?.value)||0,d=Number(document.getElementById("materialQuantitaMinima")?.value)||0,f=Number(document.getElementById("materialPrezzo")?.value)||0,r=document.getElementById("materialDataControllo")?.value||new Date().toISOString().split("T")[0],m=document.getElementById("materialNote")?.value.trim();if(!o){this.showToast("Il nome dell'articolo è obbligatorio",{type:"error"});return}const a={nome:o,lista:i,categoria:n,unitaMisura:l,quantita:p,quantitaMinima:d,prezzoUnitario:f,dataControllo:r,note:m},c=this.currentUser||y.adapter?.auth?.currentUser;try{i&&!this._scorteState.lists.includes(i)&&(await y.addListaScorta(i,c),this._scorteState.lists.push(i)),e?(await y.updateScorta(e,a,c),this.showToast(`Articolo "${o}" aggiornato con successo`)):(await y.addScorta(a,c),this.showToast(`Articolo "${o}" aggiunto alla lista "${i}"`)),t?.classList.add("hidden"),this._scorteState.items=await y.getScorte(),this._scorteState.lists=await y.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(h){console.error("Errore salvataggio scorta:",h),this.showToast("Errore durante il salvataggio",{type:"error"})}};x.deleteMaterial=function(t){const e=(this._scorteState.items||[]).find(i=>i.id===t);if(!e)return;const o=`Sei sicuro di voler eliminare l'articolo "${e.nome}" (${e.categoria||"Generale"} - Lista: ${e.lista||"Generale"}) dall'inventario scorte?`;this.showConfirmModal({title:"Conferma Eliminazione Articolo",message:o,confirmText:"Elimina Articolo",cancelText:"Annulla",onConfirm:async()=>{try{await y.deleteScorta(t,this.currentUser),this.showToast(`Articolo "${e.nome}" eliminato`),this._scorteState.items=await y.getScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(i){console.error("Errore cancellazione scorta:",i),this.showToast("Errore durante l'eliminazione",{type:"error"})}}})};x.setupImportModalEvents=function(){const t=document.getElementById("importModal"),e=document.getElementById("closeImportModalBtn"),o=document.getElementById("cancelImportBtn"),i=document.getElementById("importFileInput"),n=document.getElementById("parseImportBtn"),l=document.getElementById("confirmImportBtn");e&&(e.onclick=()=>t?.classList.add("hidden")),o&&(o.onclick=()=>t?.classList.add("hidden")),i&&i.addEventListener("change",p=>{const d=p.target.files?.[0];if(!d)return;const f=new FileReader;f.onload=r=>{const m=r.target?.result,a=document.getElementById("importTextarea");a&&typeof m=="string"&&(a.value=m,x.processImportText(m))},f.readAsText(d)}),n&&(n.onclick=()=>{const d=document.getElementById("importTextarea")?.value||"";x.processImportText(d)}),l&&(l.onclick=()=>{x.confirmImport()})};x.openImportModal=function(){const t=document.getElementById("importModal"),e=document.getElementById("importPreviewContainer"),o=document.getElementById("confirmImportBtn"),i=document.getElementById("importTextarea"),n=document.getElementById("importFileInput"),l=document.getElementById("importTargetList");if(t){if(i&&(i.value=""),n&&(n.value=""),e&&e.classList.add("hidden"),o&&(o.disabled=!0),this._scorteState.parsedImportItems=[],l){const p=this._scorteState.lists||["Campo Estivo","Uniformi","Distintivi","Generale"],d=this._scorteState.activeList;let f='<option value="auto">Usa colonna Lista dal file (o lista attiva)</option>';p.forEach(r=>{f+=`<option value="${r}" ${d===r?"selected":""}>${r}</option>`}),l.innerHTML=f}t.classList.remove("hidden")}};x.processImportText=function(t){if(!t||!t.trim()){this.showToast("Inserisci o seleziona dei dati da importare",{type:"warning"});return}const e=document.getElementById("importTargetList"),o=e&&e.value!=="auto"?e.value:null,i=this._scorteState.activeList!=="all"?this._scorteState.activeList:"Generale",n=t.split(/\r?\n/).map(a=>a.trim()).filter(Boolean),l=[],p=new Date().toISOString().split("T")[0];n.forEach((a,c)=>{const h=a.toLowerCase();if(c===0&&(h.includes("nome")||h.includes("categoria")||h.includes("quantit")))return;let v=null;if(a.includes(",")||a.includes(";")){const u=a.includes(";")?";":",",g=a.split(u).map(b=>b.trim().replace(/^["']|["']$/g,""));g.length>=1&&g[0]&&(v={nome:g[0],categoria:g[1]||"Generale",quantita:Number(g[2])||0,quantitaMinima:Number(g[3])||0,prezzoUnitario:Number(g[4])||0,unitaMisura:g[5]||"pz",note:g[6]||"",lista:o||g[7]||i,dataControllo:p})}else if(a.includes("-")){const u=a.split("-").map(g=>g.trim());u.length>=1&&u[0]&&(v={nome:u[0],categoria:u[1]||"Generale",quantita:Number(u[2])||0,quantitaMinima:Number(u[3])||10,prezzoUnitario:0,unitaMisura:"pz",note:"",lista:o||i,dataControllo:p})}else v={nome:a,categoria:"Generale",quantita:0,quantitaMinima:10,prezzoUnitario:0,unitaMisura:"pz",note:"",lista:o||i,dataControllo:p};v&&v.nome&&l.push(v)}),this._scorteState.parsedImportItems=l;const d=document.getElementById("importPreviewContainer"),f=document.getElementById("importParsedCount"),r=document.getElementById("importPreviewTableBody"),m=document.getElementById("confirmImportBtn");if(l.length===0){this.showToast("Nessun dato valido riconosciuto",{type:"warning"}),m&&(m.disabled=!0),d&&d.classList.add("hidden");return}d&&d.classList.remove("hidden"),f&&(f.textContent=String(l.length)),m&&(m.disabled=!1),r&&(r.innerHTML=l.slice(0,50).map(a=>`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td class="p-2 font-medium">${L(a.nome)}</td>
        <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${L(a.lista)}</span></td>
        <td class="p-2">${L(a.categoria)}</td>
        <td class="p-2 text-center">${Number(a.quantita)||0} ${L(a.unitaMisura)}</td>
        <td class="p-2 text-center">${Number(a.quantitaMinima)||0}</td>
        <td class="p-2 text-right">€ ${Number(a.prezzoUnitario).toFixed(2)}</td>
      </tr>
    `).join("")),this.showToast(`${l.length} articoli riconosciuti. Verifica e conferma l'importazione.`)};x.confirmImport=async function(){const t=this._scorteState.parsedImportItems||[];if(t.length===0)return;const o=document.querySelector('input[name="importMode"]:checked')?.value==="replace",i=this.currentUser||y.adapter?.auth?.currentUser;if((y.adapter?.constructor?.name==="FirestoreAdapter"||!!y.adapter?.db)&&!i){this.showToast("Accesso richiesto: effettua il login con un account staff per salvare su Firestore, oppure usa la modalità Demo Locale.",{type:"warning"}),this.showModal&&this.showModal("loginModal");return}try{await y.importScorteBatch(t,o,i),this.showToast(`Importazione completata con successo (${t.length} articoli)`,{type:"success"}),document.getElementById("importModal")?.classList.add("hidden"),this._scorteState.items=await y.getScorte(),this._scorteState.lists=await y.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(l){console.error("Errore importazione scorte:",l),l?.code==="permission-denied"||String(l?.message||"").toLowerCase().includes("permission")?this.showToast('Errore permessi Firestore: le regole di sicurezza per la collezione "scorte" non sono ancora attive sul database Firebase in Cloud.',{type:"error"}):this.showToast("Errore durante l'importazione: "+(l?.message||"controlla i dati"),{type:"error"})}};x.setupPreventivoModalEvents=function(){const t=document.getElementById("preventivoRiordinoModal"),e=document.getElementById("closePreventivoModalBtn"),o=document.getElementById("closePreventivoModalFooterBtn"),i=document.getElementById("exportRiordinoCsvBtn"),n=document.getElementById("printRiordinoBtn");e&&(e.onclick=()=>t?.classList.add("hidden")),o&&(o.onclick=()=>t?.classList.add("hidden")),i&&(i.onclick=()=>{x.exportRiordinoCsv()}),n&&(n.onclick=()=>{this.printListaSpesa()})};x.openPreventivoRiordinoModal=function(){const t=document.getElementById("preventivoRiordinoModal"),e=this._scorteState.items||[],o=this._scorteState.activeList,n=(o==="all"?e:e.filter(u=>(u.lista||"Generale")===o)).filter(u=>{const g=Number(u.quantita)||0;return(Number(u.quantitaMinima)||0)>g}),l=document.getElementById("modalPreventivoTitle"),p=document.getElementById("modalPreventivoListBadge"),d=document.getElementById("modalPreventivoSubtitle"),f=document.getElementById("modalPreventivoTotalAmount"),r=document.getElementById("modalPreventivoStats"),m=document.getElementById("modalPreventivoCategories"),a=document.getElementById("modalPreventivoTableBody");l&&(l.textContent=o==="all"?"Preventivo e Lista di Riordino Completo":`Preventivo e Riordino: ${o}`),p&&(o!=="all"?(p.textContent=`Lista: ${o}`,p.classList.remove("hidden")):(p.textContent="Tutte le Liste",p.classList.remove("hidden"))),d&&(d.textContent=o==="all"?"Elenco di tutti gli articoli con scorte inferiori alla soglia minima prefissata":`Elenco specifico degli articoli da ordinare per "${o}" (esclusi gli altri materiali)`);let c=0,h=0;const v={};if(n.forEach(u=>{const g=Number(u.quantita)||0,b=Number(u.quantitaMinima)||0,S=Number(u.prezzoUnitario)||0,w=b-g,C=w*S;c+=C,h+=w;const I=(u.categoria||"Generale").trim();v[I]||(v[I]={cost:0,units:0,items:0}),v[I].cost+=C,v[I].units+=w,v[I].items+=1}),f&&(f.textContent=`€ ${c.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`),r){const u=o==="all"?"in totale":`per ${o}`;r.textContent=`${n.length} articoli da riordinare (${h} unità totali) ${u}`}if(m){const u=Object.entries(v);u.length===0?m.innerHTML='<p class="text-green-700 dark:text-green-400 font-medium">Tutti gli articoli di questa lista sono in scorta sufficiente! Nessun riordino necessario.</p>':m.innerHTML=u.map(([g,b])=>`
        <div class="bg-white dark:bg-gray-700 p-3 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div class="font-bold text-gray-800 dark:text-gray-100 truncate">${g}</div>
          <div class="text-amber-800 dark:text-amber-300 font-extrabold text-sm mt-0.5">€ ${b.cost.toFixed(2)}</div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400">${b.items} articoli (${b.units} unità)</div>
        </div>
      `).join("")}a&&(n.length===0?a.innerHTML=`
        <tr>
          <td colspan="8" class="p-8 text-center text-green-700 dark:text-green-400 font-medium">
            🎉 Nessun articolo da riordinare per ${o==="all"?"l'intero inventario":`la lista "${o}"`}! Le scorte sono tutte al di sopra della soglia minima.
          </td>
        </tr>
      `:a.innerHTML=n.map(u=>{const g=Number(u.quantita)||0,b=Number(u.quantitaMinima)||0,S=Number(u.prezzoUnitario)||0,w=b-g,C=w*S,I=u.unitaMisura||"pz",z=(u.lista||"Generale").trim();return`
          <tr class="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
            <td class="p-2.5 font-bold text-gray-800 dark:text-gray-100">${u.nome}</td>
            <td class="p-2.5 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${z}</span></td>
            <td class="p-2.5">${u.categoria||"Generale"}</td>
            <td class="p-2.5 text-center">${g} ${I}</td>
            <td class="p-2.5 text-center">${b} ${I}</td>
            <td class="p-2.5 text-center font-bold text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 rounded">
              +${w} ${I}
            </td>
            <td class="p-2.5 text-right font-mono">€ ${S.toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-bold text-amber-900 dark:text-amber-200">€ ${C.toFixed(2)}</td>
          </tr>
        `}).join("")),t?.classList.remove("hidden")};x.printListaSpesa=function(t=null){const e=t||this._scorteState.activeList,o=this._scorteState.items||[],n=(e==="all"?o:o.filter(r=>(r.lista||"Generale")===e)).filter(r=>{const m=Number(r.quantita)||0;return(Number(r.quantitaMinima)||0)>m});if(n.length===0){this.showToast("Nessun articolo sotto scorta da acquistare per questa lista.",{type:"info"});return}n.sort((r,m)=>{const a=(r.categoria||"Generale").toLowerCase(),c=(m.categoria||"Generale").toLowerCase();return a!==c?a.localeCompare(c):(r.nome||"").localeCompare(m.nome||"")});const l=e==="all"?"Tutte le Liste":e,p=new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"});let d=0;n.forEach(r=>{const m=Number(r.quantita)||0,a=Number(r.quantitaMinima)||0,c=Number(r.prezzoUnitario)||0,h=a-m;d+=h*c});const f=document.getElementById("printArea");f&&(f.innerHTML=`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #000; padding: 0; margin: 0;">
      <!-- Intestazione Lista Spesa -->
      <div style="border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #15803d; letter-spacing: 0.05em; margin-bottom: 2px;">
            ⚜️ Reparto Scout Maori
          </div>
          <h1 style="font-size: 20px; font-weight: 900; margin: 0; line-height: 1.2; color: #111;">
            LISTA DELLA SPESA / RIORDINO
          </h1>
          <div style="font-size: 13px; font-weight: 700; color: #374151; margin-top: 4px;">
            Lista: <span style="color: #15803d;">${L(l)}</span>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #4b5563; line-height: 1.5;">
          <div>Data stampa: <strong>${p}</strong></div>
          <div>Articoli da acquistare: <strong>${n.length}</strong></div>
        </div>
      </div>

      <!-- Tabella Formato Spesa -->
      <table class="print-shopping-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr>
            <th style="width: 27%; text-align: left; background: #f3f4f6; border: 1.5px solid #374151; padding: 8px 6px; font-weight: 700; text-transform: uppercase;">Materiale</th>
            <th style="width: 13%; text-align: center; background: #f3f4f6; border: 1.5px solid #374151; padding: 8px 6px; font-weight: 700; text-transform: uppercase;">Acquistare</th>
            <th style="width: 16%; text-align: right; background: #f3f4f6; border: 1.5px solid #374151; padding: 8px 6px; font-weight: 700; text-transform: uppercase;">Preventivo Spesa</th>
            <th style="width: 14%; text-align: center; background: #f3f4f6; border: 1.5px solid #374151; padding: 8px 6px; font-weight: 700; text-transform: uppercase;">Prezzo Reale</th>
            <th style="width: 15%; text-align: center; background: #f3f4f6; border: 1.5px solid #374151; padding: 8px 6px; font-weight: 700; text-transform: uppercase;">Totale Materiale</th>
            <th style="width: 15%; text-align: left; background: #f3f4f6; border: 1.5px solid #374151; padding: 8px 6px; font-weight: 700; text-transform: uppercase;">Note</th>
          </tr>
        </thead>
        <tbody>
          ${n.map(r=>{const m=Number(r.quantita)||0,a=Number(r.quantitaMinima)||0,c=Number(r.prezzoUnitario)||0,h=a-m,v=h*c,u=r.unitaMisura||"pz",g=(r.categoria||"Generale").trim(),b=(r.note||"").trim();return`
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #4b5563; padding: 7px 6px; vertical-align: middle;">
                  <div style="font-weight: 700; font-size: 12px; color: #111;">${L(r.nome)}</div>
                  <div style="font-size: 9.5px; color: #555; margin-top: 1px;">
                    ${L(g)}${e==="all"&&r.lista?` &bull; ${L(r.lista)}`:""}
                  </div>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: center; vertical-align: middle;">
                  <span style="font-weight: 800; font-size: 12.5px; color: #111;">${h} ${L(u)}</span>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: right; vertical-align: middle; white-space: nowrap;">
                  <div style="font-weight: 700; font-size: 12px; color: #111;">€ ${v.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  ${c>0?`<div style="font-size: 9px; color: #666;">(${c.toFixed(2)} €/${L(u)})</div>`:""}
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: center; vertical-align: middle;">
                  <div class="write-box" style="border: 1.5px solid #374151; border-radius: 4px; height: 28px; width: 68px; margin: 0 auto; display: flex; align-items: center; padding-left: 5px; font-size: 11px; color: #4b5563; background: #fff;">
                    €&nbsp;
                  </div>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: center; vertical-align: middle;">
                  <div class="write-box" style="border: 1.5px solid #374151; border-radius: 4px; height: 28px; width: 75px; margin: 0 auto; display: flex; align-items: center; padding-left: 5px; font-size: 11px; color: #4b5563; background: #fff;">
                    €&nbsp;
                  </div>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; vertical-align: middle;">
                  ${b?`<div style="font-size: 9.5px; color: #222; margin-bottom: 2px;">${L(b)}</div>`:""}
                  <div style="border-bottom: 1px dashed #9ca3af; height: 12px;"></div>
                </td>
              </tr>
            `}).join("")}
        </tbody>
        <tfoot>
          <tr style="border-top: 2px solid #000; background: #f3f4f6; page-break-inside: avoid;">
            <td colspan="2" style="border: 1.5px solid #374151; padding: 10px 8px; text-align: right; font-weight: 800; font-size: 12px; text-transform: uppercase;">
              TOTALE PREVENTIVO ATTESO:
            </td>
            <td style="border: 1.5px solid #374151; padding: 10px 8px; text-align: right; font-weight: 900; font-size: 13.5px; white-space: nowrap; color: #000;">
              € ${d.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td colspan="3" style="border: 1.5px solid #374151; background: #f3f4f6;"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,window.print())};x.exportScorteCsv=function(){const t=this._scorteState.activeList;let e=this._scorteState.items||[];if(t!=="all"&&(e=e.filter(r=>(r.lista||"Generale")===t)),e.length===0){this.showToast("Nessun articolo da esportare",{type:"warning"});return}const i=[["Nome","Lista","Categoria","Quantita","ScortaMinima","Unita","PrezzoUnitario","DaRiordinare","PreventivoRiordino","DataControllo","Note"].join(",")];e.forEach(r=>{const m=Number(r.quantita)||0,a=Number(r.quantitaMinima)||0,c=Number(r.prezzoUnitario)||0,h=Math.max(0,a-m),v=h*c,u=[`"${(r.nome||"").replace(/"/g,'""')}"`,`"${(r.lista||"Generale").replace(/"/g,'""')}"`,`"${(r.categoria||"Generale").replace(/"/g,'""')}"`,m,a,`"${r.unitaMisura||"pz"}"`,c.toFixed(2),h,v.toFixed(2),`"${r.dataControllo||""}"`,`"${(r.note||"").replace(/"/g,'""')}"`];i.push(u.join(","))});const n="\uFEFF"+i.join(`\r
`),l=new Blob([n],{type:"text/csv;charset=utf-8;"}),p=URL.createObjectURL(l),d=document.createElement("a");d.setAttribute("href",p);const f=t!=="all"?t.replace(/\s+/g,"_"):"Tutte";d.setAttribute("download",`Inventario_${f}_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(p),this.showToast(`Inventario (${f}) esportato in formato CSV`)};x.exportRiordinoCsv=function(){const t=this._scorteState.activeList;let e=this._scorteState.items||[];t!=="all"&&(e=e.filter(c=>(c.lista||"Generale")===t));const o=e.filter(c=>(Number(c.quantitaMinima)||0)>(Number(c.quantita)||0));if(o.length===0){this.showToast("Nessun articolo da riordinare in questa lista",{type:"info"});return}const n=[["Articolo","Lista","Categoria","QuantitaAttuale","ScortaObiettivo","QuantitaDaOrdinare","Unita","PrezzoUnitario","CostoTotale","Note"].join(",")];let l=0;o.forEach(c=>{const h=Number(c.quantita)||0,v=Number(c.quantitaMinima)||0,u=Number(c.prezzoUnitario)||0,g=v-h,b=g*u;l+=b;const S=[`"${(c.nome||"").replace(/"/g,'""')}"`,`"${(c.lista||"Generale").replace(/"/g,'""')}"`,`"${(c.categoria||"Generale").replace(/"/g,'""')}"`,h,v,g,`"${c.unitaMisura||"pz"}"`,u.toFixed(2),b.toFixed(2),`"${(c.note||"").replace(/"/g,'""')}"`];n.push(S.join(","))});const p=t!=="all"?`TOTALE PREVENTIVO (${t})`:"TOTALE PREVENTIVO";n.push([`"${p}"`,'""','""','""','""','""','""','""',l.toFixed(2),'""'].join(","));const d="\uFEFF"+n.join(`\r
`),f=new Blob([d],{type:"text/csv;charset=utf-8;"}),r=URL.createObjectURL(f),m=document.createElement("a");m.setAttribute("href",r);const a=t!=="all"?t.replace(/\s+/g,"_"):"Tutte";m.setAttribute("download",`Ordine_Riordino_${a}_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(m),m.click(),document.body.removeChild(m),URL.revokeObjectURL(r),this.showToast(`Lista riordino (${a}) esportata in formato CSV`)};
