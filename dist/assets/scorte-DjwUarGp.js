import{D as I,U as b,O as Q,r as V,e as x}from"./date-picker-3zVDvute.js";/* empty css              */import"./shared-CirsxLkL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";typeof window<"u"&&(window.DATA=I,window.UI=b);b.renderCurrentPage=function(){this.initScorte()};b._scorteState={items:[],lists:["Campo Estivo","Uniformi","Distintivi","Generale"],activeList:typeof localStorage<"u"&&localStorage.getItem("scorte-active-list")||"all",search:"",category:"",status:"all",sort:"categoria_nome",parsedImportItems:[],bound:!1};b.initScorte=async function(){try{this.showLoadingOverlay&&this.showLoadingOverlay("Caricamento scorte e liste...");const[e,i]=await Promise.all([I.getScorte(),I.getListeScorte()]);this._scorteState.items=e||[],this._scorteState.lists=i&&i.length>0?i:["Campo Estivo","Uniformi","Distintivi","Generale"]}catch(e){console.error("Errore caricamento scorte:",e),this._scorteState.items=[],this._scorteState.lists=["Campo Estivo","Uniformi","Distintivi","Generale"]}finally{this.hideLoadingOverlay&&this.hideLoadingOverlay()}this.setupScorteControls(),this.renderListeTabs(),this.renderScorte()};b.setupScorteControls=function(){const e=document.getElementById("scorteSearchInput"),i=document.getElementById("scorteCategoryFilter"),t=document.getElementById("scorteStatusFilter"),a=document.getElementById("scorteSortSelect"),o=document.getElementById("resetScorteFiltersBtn"),r=document.getElementById("addMaterialBtn"),m=document.getElementById("importMaterialsBtn"),g=document.getElementById("openPreventivoRiordinoBtn"),u=document.getElementById("exportCsvBtn"),n=document.getElementById("printBtn"),p=document.getElementById("kpiSottoScortaCard");if(this.populateCategoryFilter(),!this._scorteState.bound){if(this._scorteState.bound=!0,e){let l;e.addEventListener("input",c=>{clearTimeout(l),l=setTimeout(()=>{this._scorteState.search=c.target.value.trim().toLowerCase(),this.renderScorte()},150)})}i&&i.addEventListener("change",l=>{this._scorteState.category=l.target.value,this.renderScorte()}),t&&t.addEventListener("change",l=>{this._scorteState.status=l.target.value,this.renderScorte()}),a&&a.addEventListener("change",l=>{this._scorteState.sort=l.target.value,this.renderScorte()}),o&&o.addEventListener("click",()=>{this._scorteState.search="",this._scorteState.category="",this._scorteState.status="all",this._scorteState.sort="categoria_nome",e&&(e.value=""),i&&(i.value=""),t&&(t.value="all"),a&&(a.value="categoria_nome"),this.renderScorte(),this.showToast("Filtri azzerati",{type:"info"})}),p&&p.addEventListener("click",()=>{this._scorteState.status="reorder",t&&(t.value="reorder"),this.renderScorte()}),r&&r.addEventListener("click",()=>{this.openMaterialModal()}),m&&m.addEventListener("click",()=>{this.openImportModal()}),g&&g.addEventListener("click",()=>{this.openPreventivoRiordinoModal()}),u&&u.addEventListener("click",()=>{this.exportScorteCsv()}),n&&n.addEventListener("click",()=>{this.printListaSpesa()}),this.setupListManagementEvents(),this.setupMaterialModalEvents(),this.setupImportModalEvents(),this.setupPreventivoModalEvents()}};b.renderListeTabs=function(){const e=document.getElementById("listeTabsContainer");if(!e)return;const i=this._scorteState.items||[],t=this._scorteState.lists||[],a=this._scorteState.activeList,o={};t.forEach(c=>{o[c]={total:0,reorder:0}});let r=0,m=0;i.forEach(c=>{const h=(c.lista||"Generale").trim(),f=Number(c.quantita)||0,v=(Number(c.quantitaMinima)||0)>f;r++,v&&m++,o[h]||(o[h]={total:0,reorder:0}),o[h].total++,v&&o[h].reorder++});const g=Array.from(new Set([...t,...Object.keys(o)])).filter(Boolean);let u="";const n=a==="all";u+=`
    <button type="button" data-list="all" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${n?"bg-green-700 text-white shadow-sm ring-2 ring-green-600":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}">
      <span>Tutte le Liste</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] ${n?"bg-white/20 text-white":"bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}">${r}</span>
      ${m>0?`<span class="text-[10px]" title="${m} articoli sotto scorta">⚠️</span>`:""}
    </button>
  `,g.forEach(c=>{const h=a===c,f=o[c]||{total:0,reorder:0};u+=`
      <button type="button" data-list="${c}" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${h?"bg-green-700 text-white shadow-sm ring-2 ring-green-600":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}">
        <span>${c}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] ${h?"bg-white/20 text-white":"bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}">${f.total}</span>
        ${f.reorder>0?`<span class="text-[10px] ${h?"text-amber-200":"text-amber-600"}" title="${f.reorder} da riordinare">⚠️ ${f.reorder}</span>`:""}
      </button>
    `}),e.innerHTML=u,e.querySelectorAll(".list-tab-btn").forEach(c=>{c.addEventListener("click",h=>{const f=c.getAttribute("data-list");this.switchActiveList(f)})});const p=document.getElementById("activeListActions"),l=document.getElementById("initOfficialDistintiviBtn");p&&(a!=="all"&&a!=="Generale"?p.classList.remove("hidden"):p.classList.add("hidden")),l&&(a==="Distintivi"?l.classList.remove("hidden"):l.classList.add("hidden"))};b.switchActiveList=function(e){this._scorteState.activeList=e;try{localStorage.setItem("scorte-active-list",e)}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()};b.setupListManagementEvents=function(){const e=document.getElementById("addListaBtn"),i=document.getElementById("renameActiveListBtn"),t=document.getElementById("deleteActiveListBtn"),a=document.getElementById("listModal"),o=document.getElementById("closeListModalBtn"),r=document.getElementById("cancelListBtn"),m=document.getElementById("listForm");e&&e.addEventListener("click",()=>{this.openListModal()}),i&&i.addEventListener("click",()=>{const u=this._scorteState.activeList;u&&u!=="all"&&this.openListModal(u)}),t&&t.addEventListener("click",()=>{const u=this._scorteState.activeList;u&&u!=="all"&&this.deleteActiveList(u)});const g=document.getElementById("initOfficialDistintiviBtn");g&&g.addEventListener("click",()=>{this.initOfficialDistintiviCatalog()}),o&&(o.onclick=()=>a?.classList.add("hidden")),r&&(r.onclick=()=>a?.classList.add("hidden")),m&&(m.onsubmit=async u=>{u.preventDefault(),await this.saveListForm()})};b.initOfficialDistintiviCatalog=async function(){const e=this._scorteState.items||[],i=new Set(e.filter(o=>(o.lista||"Generale")==="Distintivi").map(o=>(o.nome||"").trim().toLowerCase())),t=Q.filter(o=>!i.has(o.nome.toLowerCase()));if(t.length===0){this.showToast("Tutti i distintivi ufficiali PO e PV sono già presenti nella lista Distintivi!",{type:"info"});return}const a=async()=>{try{this.showLoadingOverlay&&this.showLoadingOverlay("Caricamento catalogo distintivi...");const o=new Date().toISOString().split("T")[0],r=t.map(m=>({nome:m.nome,categoria:m.categoria,lista:"Distintivi",quantita:0,quantitaMinima:5,unitaMisura:"pz",prezzoUnitario:m.prezzoDefault,dataControllo:o,note:`Distintivo ufficiale ${m.tipo}`}));await I.importScorteBatch(r,!1,this.currentUser),this.showToast(`${t.length} distintivi ufficiali aggiunti al catalogo Distintivi!`),this._scorteState.items=await I.getScorte(),this._scorteState.lists=await I.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(o){console.error("Errore importazione distintivi ufficiali:",o),this.showToast("Errore durante il caricamento dei distintivi",{type:"error"})}finally{this.hideLoadingOverlay&&this.hideLoadingOverlay()}};typeof this.showConfirmModal=="function"?this.showConfirmModal({title:"Carica Distintivi Ufficiali (PO e PV)",message:`Verranno inseriti ${t.length} distintivi ufficiali CNGEI (Passi PV e Specialità PO) nella lista "Distintivi" con immagini sincronizzate. Vuoi procedere?`,confirmText:"Carica Distintivi",cancelText:"Annulla",onConfirm:a}):confirm(`Verranno inseriti ${t.length} distintivi ufficiali CNGEI nella lista Distintivi. Procedere?`)&&await a()};b.openListModal=function(e=""){const i=document.getElementById("listModal"),t=document.getElementById("listModalTitle"),a=document.getElementById("listNameInput"),o=document.getElementById("listOldName");i&&(e?(t&&(t.textContent=`Rinomina Lista "${e}"`),a&&(a.value=e),o&&(o.value=e)):(t&&(t.textContent="Nuova Lista Materiali"),a&&(a.value=""),o&&(o.value="")),i.classList.remove("hidden"),a?.focus())};b.saveListForm=async function(){const e=document.getElementById("listModal"),i=document.getElementById("listNameInput"),t=document.getElementById("listOldName"),a=i?.value.trim(),o=t?.value.trim();if(!a){this.showToast("Inserisci il nome della lista",{type:"error"});return}try{o?(await I.renameListaScorta(o,a,this.currentUser),this.showToast(`Lista rinominata in "${a}"`)):(await I.addListaScorta(a,this.currentUser),this.showToast(`Nuova lista "${a}" creata con successo!`)),e?.classList.add("hidden"),this._scorteState.lists=await I.getListeScorte(),this._scorteState.items=await I.getScorte(),this._scorteState.activeList=a;try{localStorage.setItem("scorte-active-list",a)}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(r){console.error("Errore salvataggio lista:",r),this.showToast("Errore durante il salvataggio della lista",{type:"error"})}};b.deleteActiveList=function(e){if(!e||e==="all"||e==="Generale")return;const i=(this._scorteState.items||[]).filter(a=>(a.lista||"Generale")===e).length,t=i>0?`Sei sicuro di voler eliminare la lista "${e}"? I suoi ${i} articoli NON verranno cancellati ma spostati nella lista "Generale".`:`Sei sicuro di voler eliminare la lista "${e}"?`;this.showConfirmModal({title:`Elimina Lista "${e}"`,message:t,confirmText:"Elimina Lista",cancelText:"Annulla",onConfirm:async()=>{try{await I.deleteListaScorta(e,this.currentUser),this.showToast(`Lista "${e}" eliminata`),this._scorteState.lists=await I.getListeScorte(),this._scorteState.items=await I.getScorte(),this._scorteState.activeList="all";try{localStorage.setItem("scorte-active-list","all")}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(a){console.error("Errore eliminazione lista:",a),this.showToast("Errore durante l'eliminazione della lista",{type:"error"})}}})};b.populateCategoryFilter=function(){const e=document.getElementById("scorteCategoryFilter");if(!e)return;const i=this._scorteState.activeList;let t=this._scorteState.items||[];i!=="all"&&(t=t.filter(r=>(r.lista||"Generale")===i));const a=this._scorteState.category,o=Array.from(new Set(t.map(r=>(r.categoria||"Generale").trim()).filter(Boolean))).sort((r,m)=>r.localeCompare(m));e.innerHTML='<option value="">Tutte le categorie</option>'+o.map(r=>`<option value="${r}">${r}</option>`).join(""),e.value=a};b.renderScorte=function(){const e=this._scorteState.items||[],i=this._scorteState.activeList,t=i==="all"?e:e.filter(s=>(s.lista||"Generale")===i),a=t.length,o=new Set(t.map(s=>(s.categoria||"Generale").trim()));let r=0,m=0,g=0,u=null;t.forEach(s=>{const w=Number(s.quantita)||0,$=Number(s.quantitaMinima)||0,C=Number(s.prezzoUnitario)||0,M=Math.max(0,$-w);if(M>0&&(r++,m+=M,g+=M*C),s.dataControllo){const k=new Date(s.dataControllo);!isNaN(k)&&(!u||k>u)&&(u=k)}});const n=document.getElementById("kpiTotalItems"),p=document.getElementById("kpiTotalItemsLabel"),l=document.getElementById("kpiCategoriesCount"),c=document.getElementById("kpiToRestockItems"),h=document.getElementById("kpiToRestockUnits"),f=document.getElementById("kpiRestockTotalCost"),d=document.getElementById("kpiRestockCostLabel"),v=document.getElementById("kpiRestockCostSub"),E=document.getElementById("kpiInventoryDate");p&&(p.textContent=i==="all"?"Totale Articoli a Catalogo":`Articoli in "${i}"`),n&&(n.textContent=String(a)),l&&(l.textContent=`${o.size} categorie in questa lista`),c&&(c.textContent=String(r)),h&&(h.textContent=`${m} unità mancanti per l'obiettivo`),d&&(d.textContent=i==="all"?"Preventivo Spesa Totale":`Preventivo "${i}"`),f&&(f.textContent=`€ ${g.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`),v&&(v.textContent=i==="all"?"Spesa stimata totale di riordino":`Spesa stimata per ordine ${i}`),E&&(E.textContent=u?u.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}):new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}));let L=[...t];if(this._scorteState.search){const s=this._scorteState.search;L=L.filter(w=>(w.nome||"").toLowerCase().includes(s)||(w.note||"").toLowerCase().includes(s)||(w.categoria||"").toLowerCase().includes(s)||(w.lista||"").toLowerCase().includes(s))}this._scorteState.category&&(L=L.filter(s=>(s.categoria||"Generale").trim()===this._scorteState.category)),this._scorteState.status==="reorder"?L=L.filter(s=>(Number(s.quantitaMinima)||0)>(Number(s.quantita)||0)):this._scorteState.status==="ok"&&(L=L.filter(s=>(Number(s.quantitaMinima)||0)<=(Number(s.quantita)||0)));const y=this._scorteState.sort;L.sort((s,w)=>{const $=(s.nome||"").trim(),C=(w.nome||"").trim(),M=(s.categoria||"Generale").trim(),k=(w.categoria||"Generale").trim(),N=Number(s.quantita)||0,q=Number(w.quantita)||0,O=Math.max(0,(Number(s.quantitaMinima)||0)-N),A=Math.max(0,(Number(w.quantitaMinima)||0)-q),T=O*(Number(s.prezzoUnitario)||0),z=A*(Number(w.prezzoUnitario)||0);if(y==="categoria_nome"){const F=M.localeCompare(k,"it");return F!==0?F:$.localeCompare(C,"it")}return y==="nome_asc"?$.localeCompare(C,"it"):y==="nome_desc"?C.localeCompare($,"it"):y==="quantita_asc"?N-q||$.localeCompare(C,"it"):y==="quantita_desc"?q-N||$.localeCompare(C,"it"):y==="da_riordinare_desc"?A-O||z-T:y==="costo_riordino_desc"?z-T||A-O:0});const S=document.getElementById("scorteFilterSummary");if(S){const s=i==="all"?"Tutte le liste":`Lista: "${i}"`;S.textContent=`[${s}] Visualizzati: ${L.length} di ${a} articoli (${r} sotto scorta)`}const B=document.getElementById("scorteTableBody"),_=document.getElementById("scorteTableFoot");if(!B)return;if(L.length===0){const s=a===0&&i==="Distintivi"?`
        <div class="py-4 text-center">
          <div class="text-3xl mb-2">⚜️</div>
          <p class="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Nessun distintivo presente nel catalogo</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
            La lista Distintivi è vuota. Puoi inserire i singoli distintivi oppure caricare subito l'intero catalogo ufficiale dei distintivi PO (Specialità) e PV (Passi) con le rispettive immagini sincronizzate.
          </p>
          <button type="button" id="emptyInitDistintiviBtn" class="btn-primary text-xs px-4 py-2 inline-flex items-center gap-2 shadow-sm cursor-pointer">
            <span>⚜️</span><span>Carica Catalogo Distintivi Ufficiali (PO e PV)</span>
          </button>
        </div>
      `:a===0&&i!=="all"?`Nessun articolo presente nella lista "${i}". Clicca su "+ Nuovo Articolo" o "Importa Lista" per aggiungerne.`:"Nessun articolo trovato con i filtri selezionati.";B.innerHTML=`
      <tr>
        <td colspan="10" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          ${s}
        </td>
      </tr>
    `;const w=document.getElementById("emptyInitDistintiviBtn");w&&w.addEventListener("click",()=>{this.initOfficialDistintiviCatalog()}),_&&(_.innerHTML="");return}let R=0,D=0;if(B.innerHTML=L.map(s=>{const w=Number(s.quantita)||0,$=Number(s.quantitaMinima)||0,C=Number(s.prezzoUnitario)||0,M=s.unitaMisura||"pz",k=Math.max(0,$-w),N=k*C,q=(s.lista||"Generale").trim();R+=k,D+=N;const O=q==="Distintivi"||i==="Distintivi",A=(s.img||"").trim(),T=V(s.nome,s.lista,s.categoria);let z="",F=s.nome,P="",K=!1;A?(z=A,K=!0,F=s.nome,P=T?T.type:"FOTO"):T&&(z=T.src,F=T.label||s.nome,P=T.type);let j="";if(z){const X=P==="PV",Y=P==="PO",Z=P==="Distintivo"||P==="DIST";let G="bg-teal-600 text-white",U=P;X?(G="bg-blue-600 text-white",U="PV"):Y?(G="bg-emerald-600 text-white",U="PO"):Z?(G="bg-purple-600 text-white",U="DIST"):K&&!T&&(G="bg-teal-600 text-white",U="📷"),j=`
        <div class="relative group shrink-0" title="${x(F)} (${x(U)})">
          <img src="${x(z)}" 
               alt="${x(s.nome)}" 
               class="w-9 h-9 object-cover rounded-full shadow-sm bg-white dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform cursor-pointer scorte-thumbnail-zoom" 
               data-img-src="${x(z)}"
               data-img-title="${x(s.nome)}"
               onerror="this.style.display='none';" />
          <span class="absolute -bottom-1 -right-1 text-[9px] font-black px-1 py-0.2 rounded ${G} leading-none shadow-xs">
            ${U}
          </span>
        </div>
      `}else O&&(j=`
        <div class="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-sm shrink-0 shadow-xs" title="Distintivo">
          ⚜️
        </div>
      `);const H=k>0,J=H?`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
           ⚠️ +${k} ${M}
         </span>`:`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
           ✓ In scorta
         </span>`;return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${H?"bg-amber-50/30 dark:bg-amber-950/10":""}" data-id="${x(s.id)}">
        <!-- Nome & Note -->
        <td class="p-3">
          <div class="flex items-center gap-3">
            ${j}
            <div class="min-w-0">
              <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>${x(s.nome)}</span>
              </div>
              ${s.note?`<div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5" title="${x(s.note)}">📝 ${x(s.note)}</div>`:""}
            </div>
          </div>
        </td>

        <!-- Lista -->
        <td class="p-3 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            📑 ${x(q)}
          </span>
        </td>

        <!-- Categoria -->
        <td class="p-3 whitespace-nowrap">
          <span class="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            🏷️ ${x(s.categoria||"Generale")}
          </span>
        </td>

        <!-- Quantità Attuale con pulsanti rapidi + e - -->
        <td class="p-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
            <button type="button" class="btn-qty-minus text-gray-500 hover:text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${s.id}" title="Diminuisci scorta">-</button>
            <span class="font-bold text-sm w-8 text-center text-gray-800 dark:text-gray-200">${w}</span>
            <button type="button" class="btn-qty-plus text-gray-500 hover:text-green-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${s.id}" title="Aumenta scorta">+</button>
            <span class="text-xs text-gray-400 ml-0.5">${M}</span>
          </div>
        </td>

        <!-- Scorta Minima -->
        <td class="p-3 text-center whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
          ${$} <span class="text-xs text-gray-400">${M}</span>
        </td>

        <!-- Da Riordinare -->
        <td class="p-3 text-center whitespace-nowrap">
          ${J}
        </td>

        <!-- Prezzo Unitario -->
        <td class="p-3 text-right whitespace-nowrap font-mono text-gray-700 dark:text-gray-300">
          € ${C.toFixed(2)}
        </td>

        <!-- Preventivo Riordino -->
        <td class="p-3 text-right whitespace-nowrap font-mono font-bold ${H?"text-amber-700 dark:text-amber-400":"text-gray-400"}">
          € ${N.toFixed(2)}
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
    `}).join(""),_){const s=i==="all"?"Tutte le liste":`Lista "${i}"`;_.innerHTML=`
      <tr>
        <td colspan="5" class="p-3 text-right text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
          Totale Preventivo Riordino (${s}):
        </td>
        <td class="p-3 text-center text-amber-700 dark:text-amber-300 font-extrabold">
          ${R>0?`+${R} unità`:"0"}
        </td>
        <td></td>
        <td class="p-3 text-right font-mono font-extrabold text-green-700 dark:text-green-300 text-base">
          € ${D.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}
        </td>
        <td colspan="2"></td>
      </tr>
    `}B.querySelectorAll(".btn-qty-plus").forEach(s=>{s.addEventListener("click",()=>{this.adjustItemQuantity(s.getAttribute("data-id"),1)})}),B.querySelectorAll(".btn-qty-minus").forEach(s=>{s.addEventListener("click",()=>{this.adjustItemQuantity(s.getAttribute("data-id"),-1)})}),B.querySelectorAll(".btn-edit-item").forEach(s=>{s.addEventListener("click",()=>{this.openMaterialModal(s.getAttribute("data-id"))})}),B.querySelectorAll(".btn-delete-item").forEach(s=>{s.addEventListener("click",()=>{this.deleteMaterial(s.getAttribute("data-id"))})}),B.querySelectorAll(".scorte-thumbnail-zoom").forEach(s=>{s.addEventListener("click",w=>{w.stopPropagation();const $=s.getAttribute("data-img-src"),C=s.getAttribute("data-img-title");$&&this.openImageLightbox($,C)})})};b.openImageLightbox=function(e,i){const t=document.getElementById("imageLightboxModal"),a=document.getElementById("lightboxModalImg"),o=document.getElementById("lightboxModalTitle"),r=document.getElementById("closeLightboxBtn");if(!t||!a)return;a.src=e,o&&(o.textContent=i||"Foto Articolo"),t.classList.remove("hidden");const m=()=>{t.classList.add("hidden"),a.src=""};r&&(r.onclick=m),t.onclick=g=>{g.target===t&&m()}};b.compressImageFile=function(e,i=400,t=.82){return new Promise((a,o)=>{if(!e||!e.type.startsWith("image/"))return o(new Error("Il file selezionato non è un'immagine valida"));const r=new FileReader;r.onerror=()=>o(new Error("Errore durante la lettura del file")),r.onload=m=>{const g=new Image;g.onerror=()=>o(new Error("Impossibile caricare l'immagine selezionata")),g.onload=()=>{try{const u=document.createElement("canvas");let n=g.width,p=g.height;n>p?n>i&&(p=Math.round(p*i/n),n=i):p>i&&(n=Math.round(n*i/p),p=i),u.width=n,u.height=p,u.getContext("2d").drawImage(g,0,0,n,p);const c=u.toDataURL("image/jpeg",t);a(c)}catch(u){o(u)}},g.src=m.target.result},r.readAsDataURL(e)})};b.adjustItemQuantity=async function(e,i){const t=(this._scorteState.items||[]).find(m=>m.id===e);if(!t)return;const a=Number(t.quantita)||0,o=Math.max(0,a+i);if(o===a)return;const r=new Date().toISOString().split("T")[0];try{await I.updateScorta(e,{quantita:o,dataControllo:r},this.currentUser),t.quantita=o,t.dataControllo=r,this.renderListeTabs(),this.renderScorte()}catch(m){console.error("Errore aggiornamento rapido quantità:",m),this.showToast("Errore durante l'aggiornamento",{type:"error"})}};b.setupMaterialModalEvents=function(){const e=document.getElementById("materialModal"),i=document.getElementById("closeMaterialModalBtn"),t=document.getElementById("cancelMaterialBtn"),a=document.getElementById("materialForm"),o=document.getElementById("materialNome"),r=document.getElementById("materialLista"),m=document.getElementById("triggerImageUploadBtn"),g=document.getElementById("materialImageFile"),u=document.getElementById("materialImgData"),n=document.getElementById("materialImgUrl"),p=document.getElementById("removeCustomImageBtn"),l=document.getElementById("materialImagePreviewImg");i&&(i.onclick=()=>e?.classList.add("hidden")),t&&(t.onclick=()=>e?.classList.add("hidden")),e&&e.addEventListener("click",c=>{c.target===e&&e.classList.add("hidden")}),m&&g&&m.addEventListener("click",()=>{g.click()}),g&&g.addEventListener("change",async c=>{const h=c.target.files&&c.target.files[0];if(h)try{const f=await this.compressImageFile(h,400,.82);u&&(u.value=f),n&&(n.value=""),this.updateCustomImagePreview(),this.showToast("Foto caricata e ottimizzata con successo!",{type:"success"})}catch(f){console.error("Errore compressione immagine:",f),this.showToast(f.message||"Errore durante il caricamento dell'immagine",{type:"error"})}finally{g.value=""}}),n&&n.addEventListener("input",()=>{n.value.trim()&&u&&(u.value=""),this.updateCustomImagePreview()}),p&&p.addEventListener("click",()=>{u&&(u.value=""),n&&(n.value=""),g&&(g.value=""),this.updateCustomImagePreview(),this.showToast("Immagine personalizzata rimossa")}),l&&l.addEventListener("click",()=>{const c=l.src,h=document.getElementById("materialNome")?.value||"Foto Articolo";c&&this.openImageLightbox(c,h)}),o&&(o.addEventListener("input",()=>{this.updateMaterialBadgePreview()}),o.addEventListener("change",()=>{const c=(o.value||"").trim(),h=Q.find(f=>f.nome.toLowerCase()===c.toLowerCase());if(h){const f=document.getElementById("materialCategoria"),d=document.getElementById("materialLista"),v=document.getElementById("materialPrezzo");f&&(!f.value||f.value==="Campeggio"||f.value==="Generale")&&(f.value=h.categoria),d&&(!d.value||d.value==="Generale")&&(d.value="Distintivi"),v&&(!v.value||Number(v.value)===0)&&(v.value=h.prezzoDefault.toFixed(2))}this.updateMaterialBadgePreview()})),r&&r.addEventListener("change",()=>{this.updateMaterialBadgePreview()}),a&&(a.onsubmit=async c=>{c.preventDefault(),await this.saveMaterialForm()})};b.updateCustomImagePreview=function(){const e=document.getElementById("materialImgData"),i=document.getElementById("materialImgUrl"),t=document.getElementById("materialImagePreviewContainer"),a=document.getElementById("materialImagePreviewImg"),o=document.getElementById("materialImagePreviewName"),r=document.getElementById("materialImagePreviewSize"),m=document.getElementById("removeCustomImageBtn"),g=document.getElementById("customImageStatusBadge"),u=(e?.value||"").trim(),n=(i?.value||"").trim(),p=u||n;if(p){if(a&&(a.src=p),t&&(t.classList.remove("hidden"),t.classList.add("flex")),m&&(m.classList.remove("hidden"),m.classList.add("inline-flex")),g&&g.classList.remove("hidden"),o)if(u.startsWith("data:")){o.textContent="Foto caricata da dispositivo";const l=Math.max(1,Math.round(u.length*3/4/1024));r&&(r.textContent=`Immagine ottimizzata (~${l} KB)`)}else o.textContent="Immagine da URL web",r&&(r.textContent=n.length>40?n.substring(0,37)+"...":n)}else a&&(a.src=""),t&&(t.classList.add("hidden"),t.classList.remove("flex")),m&&(m.classList.add("hidden"),m.classList.remove("inline-flex")),g&&g.classList.add("hidden")};b.updateMaterialBadgePreview=function(){const e=document.getElementById("materialNome")?.value||"",i=document.getElementById("materialLista")?.value||"",t=document.getElementById("materialCategoria")?.value||"",a=document.getElementById("materialBadgePreviewContainer"),o=document.getElementById("materialBadgePreviewImg"),r=document.getElementById("materialBadgePreviewLabel"),m=document.getElementById("materialBadgePreviewType");if(!a||!o||!r||!m)return;const g=V(e,i,t);if(g){o.src=g.src,r.textContent=g.label||e;const u=g.type==="PV",n=g.type==="PO";m.textContent=u?"Progressione Verticale (PV)":n?"Specialità (PO)":"Distintivo Associativo / Reparto",m.className=`text-[10px] font-black px-1.5 py-0.2 rounded shrink-0 shadow-xs ${u?"bg-blue-600 text-white":n?"bg-emerald-600 text-white":"bg-purple-600 text-white"}`,a.classList.remove("hidden"),a.classList.add("flex")}else a.classList.add("hidden"),a.classList.remove("flex")};b.openMaterialModal=function(e=null){const i=document.getElementById("materialModal"),t=document.getElementById("materialModalTitle"),a=document.getElementById("materialId"),o=document.getElementById("materialNome"),r=document.getElementById("materialLista"),m=document.getElementById("listeScorteDataList"),g=document.getElementById("distintiviSuggestions"),u=document.getElementById("materialCategoria"),n=document.getElementById("materialUnita"),p=document.getElementById("materialQuantita"),l=document.getElementById("materialQuantitaMinima"),c=document.getElementById("materialPrezzo"),h=document.getElementById("materialDataControllo"),f=document.getElementById("materialNote"),d=document.getElementById("materialImgData"),v=document.getElementById("materialImgUrl");if(!i)return;const E=new Date().toISOString().split("T")[0];if(m){const y=this._scorteState.lists||["Campo Estivo","Uniformi","Distintivi","Generale"];m.innerHTML=y.map(S=>`<option value="${S}"></option>`).join("")}g&&(g.innerHTML=Q.map(y=>`<option value="${x(y.nome)}">${x(y.tipo)}: ${x(y.categoria)}</option>`).join(""));const L=this._scorteState.activeList!=="all"?this._scorteState.activeList:"Generale";if(e){const y=(this._scorteState.items||[]).find(B=>B.id===e);if(!y)return;t&&(t.textContent="Modifica Articolo Scorte"),a&&(a.value=y.id),o&&(o.value=y.nome||""),r&&(r.value=y.lista||L),u&&(u.value=y.categoria||"Generale"),n&&(n.value=y.unitaMisura||"pz"),p&&(p.value=y.quantita!==void 0?y.quantita:0),l&&(l.value=y.quantitaMinima!==void 0?y.quantitaMinima:0),c&&(c.value=y.prezzoUnitario!==void 0?y.prezzoUnitario:0),h&&(h.value=y.dataControllo||E),f&&(f.value=y.note||"");const S=(y.img||"").trim();S.startsWith("data:")?(d&&(d.value=S),v&&(v.value="")):(d&&(d.value=""),v&&(v.value=S))}else{const y=L==="Distintivi";t&&(t.textContent=y?"Nuovo Distintivo in Inventario":"Nuovo Articolo Scorte"),a&&(a.value=""),o&&(o.value=""),r&&(r.value=L),u&&(u.value=y?"Distintivi":this._scorteState.category||"Campeggio"),n&&(n.value="pz"),p&&(p.value="0"),l&&(l.value=y?"5":"10"),c&&(c.value=y?"2.50":"0.00"),h&&(h.value=E),f&&(f.value=""),d&&(d.value=""),v&&(v.value="")}this.updateMaterialBadgePreview(),this.updateCustomImagePreview(),i.classList.remove("hidden"),o?.focus()};b.saveMaterialForm=async function(){const e=document.getElementById("materialModal"),i=document.getElementById("materialId")?.value,t=document.getElementById("materialNome")?.value.trim(),a=document.getElementById("materialLista")?.value.trim()||"Generale",o=document.getElementById("materialCategoria")?.value.trim()||"Generale",r=document.getElementById("materialUnita")?.value||"pz",m=Number(document.getElementById("materialQuantita")?.value)||0,g=Number(document.getElementById("materialQuantitaMinima")?.value)||0,u=Number(document.getElementById("materialPrezzo")?.value)||0,n=document.getElementById("materialDataControllo")?.value||new Date().toISOString().split("T")[0],p=document.getElementById("materialNote")?.value.trim(),l=document.getElementById("materialImgData")?.value?.trim()||"",c=document.getElementById("materialImgUrl")?.value?.trim()||"",h=l||c||"";if(!t){this.showToast("Il nome dell'articolo è obbligatorio",{type:"error"});return}const f={nome:t,lista:a,categoria:o,unitaMisura:r,quantita:m,quantitaMinima:g,prezzoUnitario:u,dataControllo:n,note:p,img:h},d=this.currentUser||I.adapter?.auth?.currentUser;try{a&&!this._scorteState.lists.includes(a)&&(await I.addListaScorta(a,d),this._scorteState.lists.push(a)),i?(await I.updateScorta(i,f,d),this.showToast(`Articolo "${t}" aggiornato con successo`)):(await I.addScorta(f,d),this.showToast(`Articolo "${t}" aggiunto alla lista "${a}"`)),e?.classList.add("hidden"),this._scorteState.items=await I.getScorte(),this._scorteState.lists=await I.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(v){console.error("Errore salvataggio scorta:",v),this.showToast("Errore durante il salvataggio",{type:"error"})}};b.deleteMaterial=function(e){const i=(this._scorteState.items||[]).find(a=>a.id===e);if(!i)return;const t=`Sei sicuro di voler eliminare l'articolo "${i.nome}" (${i.categoria||"Generale"} - Lista: ${i.lista||"Generale"}) dall'inventario scorte?`;this.showConfirmModal({title:"Conferma Eliminazione Articolo",message:t,confirmText:"Elimina Articolo",cancelText:"Annulla",onConfirm:async()=>{try{await I.deleteScorta(e,this.currentUser),this.showToast(`Articolo "${i.nome}" eliminato`),this._scorteState.items=await I.getScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(a){console.error("Errore cancellazione scorta:",a),this.showToast("Errore durante l'eliminazione",{type:"error"})}}})};b.setupImportModalEvents=function(){const e=document.getElementById("importModal"),i=document.getElementById("closeImportModalBtn"),t=document.getElementById("cancelImportBtn"),a=document.getElementById("importFileInput"),o=document.getElementById("parseImportBtn"),r=document.getElementById("confirmImportBtn");i&&(i.onclick=()=>e?.classList.add("hidden")),t&&(t.onclick=()=>e?.classList.add("hidden")),a&&a.addEventListener("change",m=>{const g=m.target.files?.[0];if(!g)return;const u=new FileReader;u.onload=n=>{const p=n.target?.result,l=document.getElementById("importTextarea");l&&typeof p=="string"&&(l.value=p,b.processImportText(p))},u.readAsText(g)}),o&&(o.onclick=()=>{const g=document.getElementById("importTextarea")?.value||"";b.processImportText(g)}),r&&(r.onclick=()=>{b.confirmImport()})};b.openImportModal=function(){const e=document.getElementById("importModal"),i=document.getElementById("importPreviewContainer"),t=document.getElementById("confirmImportBtn"),a=document.getElementById("importTextarea"),o=document.getElementById("importFileInput"),r=document.getElementById("importTargetList");if(e){if(a&&(a.value=""),o&&(o.value=""),i&&i.classList.add("hidden"),t&&(t.disabled=!0),this._scorteState.parsedImportItems=[],r){const m=this._scorteState.lists||["Campo Estivo","Uniformi","Distintivi","Generale"],g=this._scorteState.activeList;let u='<option value="auto">Usa colonna Lista dal file (o lista attiva)</option>';m.forEach(n=>{u+=`<option value="${n}" ${g===n?"selected":""}>${n}</option>`}),r.innerHTML=u}e.classList.remove("hidden")}};b.processImportText=function(e){if(!e||!e.trim()){this.showToast("Inserisci o seleziona dei dati da importare",{type:"warning"});return}const i=document.getElementById("importTargetList"),t=i&&i.value!=="auto"?i.value:null,a=this._scorteState.activeList!=="all"?this._scorteState.activeList:"Generale",o=e.split(/\r?\n/).map(l=>l.trim()).filter(Boolean),r=[],m=new Date().toISOString().split("T")[0];o.forEach((l,c)=>{const h=l.toLowerCase();if(c===0&&(h.includes("nome")||h.includes("categoria")||h.includes("quantit")))return;let f=null;if(l.includes(",")||l.includes(";")){const d=l.includes(";")?";":",",v=l.split(d).map(E=>E.trim().replace(/^["']|["']$/g,""));v.length>=1&&v[0]&&(f={nome:v[0],categoria:v[1]||"Generale",quantita:Number(v[2])||0,quantitaMinima:Number(v[3])||0,prezzoUnitario:Number(v[4])||0,unitaMisura:v[5]||"pz",note:v[6]||"",lista:t||v[7]||a,img:v[8]||"",dataControllo:m})}else if(l.includes("-")){const d=l.split("-").map(v=>v.trim());d.length>=1&&d[0]&&(f={nome:d[0],categoria:d[1]||"Generale",quantita:Number(d[2])||0,quantitaMinima:Number(d[3])||10,prezzoUnitario:0,unitaMisura:"pz",note:"",lista:t||a,img:"",dataControllo:m})}else f={nome:l,categoria:"Generale",quantita:0,quantitaMinima:10,prezzoUnitario:0,unitaMisura:"pz",note:"",lista:t||a,img:"",dataControllo:m};f&&f.nome&&r.push(f)}),this._scorteState.parsedImportItems=r;const g=document.getElementById("importPreviewContainer"),u=document.getElementById("importParsedCount"),n=document.getElementById("importPreviewTableBody"),p=document.getElementById("confirmImportBtn");if(r.length===0){this.showToast("Nessun dato valido riconosciuto",{type:"warning"}),p&&(p.disabled=!0),g&&g.classList.add("hidden");return}g&&g.classList.remove("hidden"),u&&(u.textContent=String(r.length)),p&&(p.disabled=!1),n&&(n.innerHTML=r.slice(0,50).map(l=>{const c=(l.img||"").trim(),h=V(l.nome,l.lista,l.categoria),f=c||(h?h.src:"");return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td class="p-2 font-medium">
          <div class="flex items-center gap-2">
            ${f?`<img src="${x(f)}" alt="${x(l.nome)}" class="w-5 h-5 object-cover rounded-full shadow-xs bg-white p-0.5 border border-gray-200 shrink-0" onerror="this.style.display='none';" />`:""}
            <span>${x(l.nome)}</span>
          </div>
        </td>
        <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${x(l.lista)}</span></td>
        <td class="p-2">${x(l.categoria)}</td>
        <td class="p-2 text-center">${Number(l.quantita)||0} ${x(l.unitaMisura)}</td>
        <td class="p-2 text-center">${Number(l.quantitaMinima)||0}</td>
        <td class="p-2 text-right">€ ${Number(l.prezzoUnitario).toFixed(2)}</td>
      </tr>
    `}).join("")),this.showToast(`${r.length} articoli riconosciuti. Verifica e conferma l'importazione.`)};b.confirmImport=async function(){const e=this._scorteState.parsedImportItems||[];if(e.length===0)return;const t=document.querySelector('input[name="importMode"]:checked')?.value==="replace",a=this.currentUser||I.adapter?.auth?.currentUser;if((I.adapter?.constructor?.name==="FirestoreAdapter"||!!I.adapter?.db)&&!a){this.showToast("Accesso richiesto: effettua il login con un account staff per salvare su Firestore, oppure usa la modalità Demo Locale.",{type:"warning"}),this.showModal&&this.showModal("loginModal");return}try{await I.importScorteBatch(e,t,a),this.showToast(`Importazione completata con successo (${e.length} articoli)`,{type:"success"}),document.getElementById("importModal")?.classList.add("hidden"),this._scorteState.items=await I.getScorte(),this._scorteState.lists=await I.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(r){console.error("Errore importazione scorte:",r),r?.code==="permission-denied"||String(r?.message||"").toLowerCase().includes("permission")?this.showToast('Errore permessi Firestore: le regole di sicurezza per la collezione "scorte" non sono ancora attive sul database Firebase in Cloud.',{type:"error"}):this.showToast("Errore durante l'importazione: "+(r?.message||"controlla i dati"),{type:"error"})}};b.setupPreventivoModalEvents=function(){const e=document.getElementById("preventivoRiordinoModal"),i=document.getElementById("closePreventivoModalBtn"),t=document.getElementById("closePreventivoModalFooterBtn"),a=document.getElementById("exportRiordinoCsvBtn"),o=document.getElementById("printRiordinoBtn");i&&(i.onclick=()=>e?.classList.add("hidden")),t&&(t.onclick=()=>e?.classList.add("hidden")),a&&(a.onclick=()=>{b.exportRiordinoCsv()}),o&&(o.onclick=()=>{this.printListaSpesa()})};b.openPreventivoRiordinoModal=function(){const e=document.getElementById("preventivoRiordinoModal"),i=this._scorteState.items||[],t=this._scorteState.activeList,o=(t==="all"?i:i.filter(d=>(d.lista||"Generale")===t)).filter(d=>{const v=Number(d.quantita)||0;return(Number(d.quantitaMinima)||0)>v}),r=document.getElementById("modalPreventivoTitle"),m=document.getElementById("modalPreventivoListBadge"),g=document.getElementById("modalPreventivoSubtitle"),u=document.getElementById("modalPreventivoTotalAmount"),n=document.getElementById("modalPreventivoStats"),p=document.getElementById("modalPreventivoCategories"),l=document.getElementById("modalPreventivoTableBody");r&&(r.textContent=t==="all"?"Preventivo e Lista di Riordino Completo":`Preventivo e Riordino: ${t}`),m&&(t!=="all"?(m.textContent=`Lista: ${t}`,m.classList.remove("hidden")):(m.textContent="Tutte le Liste",m.classList.remove("hidden"))),g&&(g.textContent=t==="all"?"Elenco di tutti gli articoli con scorte inferiori alla soglia minima prefissata":`Elenco specifico degli articoli da ordinare per "${t}" (esclusi gli altri materiali)`);let c=0,h=0;const f={};if(o.forEach(d=>{const v=Number(d.quantita)||0,E=Number(d.quantitaMinima)||0,L=Number(d.prezzoUnitario)||0,y=E-v,S=y*L;c+=S,h+=y;const B=(d.categoria||"Generale").trim();f[B]||(f[B]={cost:0,units:0,items:0}),f[B].cost+=S,f[B].units+=y,f[B].items+=1}),u&&(u.textContent=`€ ${c.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`),n){const d=t==="all"?"in totale":`per ${t}`;n.textContent=`${o.length} articoli da riordinare (${h} unità totali) ${d}`}if(p){const d=Object.entries(f);d.length===0?p.innerHTML='<p class="text-green-700 dark:text-green-400 font-medium">Tutti gli articoli di questa lista sono in scorta sufficiente! Nessun riordino necessario.</p>':p.innerHTML=d.map(([v,E])=>`
        <div class="bg-white dark:bg-gray-700 p-3 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div class="font-bold text-gray-800 dark:text-gray-100 truncate">${v}</div>
          <div class="text-amber-800 dark:text-amber-300 font-extrabold text-sm mt-0.5">€ ${E.cost.toFixed(2)}</div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400">${E.items} articoli (${E.units} unità)</div>
        </div>
      `).join("")}l&&(o.length===0?l.innerHTML=`
        <tr>
          <td colspan="8" class="p-8 text-center text-green-700 dark:text-green-400 font-medium">
            🎉 Nessun articolo da riordinare per ${t==="all"?"l'intero inventario":`la lista "${t}"`}! Le scorte sono tutte al di sopra della soglia minima.
          </td>
        </tr>
      `:(l.innerHTML=o.map(d=>{const v=Number(d.quantita)||0,E=Number(d.quantitaMinima)||0,L=Number(d.prezzoUnitario)||0,y=E-v,S=y*L,B=d.unitaMisura||"pz",_=(d.lista||"Generale").trim(),R=(d.img||"").trim(),D=V(d.nome,d.lista,d.categoria),s=R||(D?D.src:""),w=D&&D.label||d.nome;return`
          <tr class="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
            <td class="p-2.5 font-bold text-gray-800 dark:text-gray-100">
              <div class="flex items-center gap-2">
                ${s?`
          <img src="${x(s)}" 
               alt="${x(w)}" 
               class="w-6 h-6 object-cover rounded-full shadow-xs bg-white dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer hover:scale-110 transition-transform scorte-thumbnail-zoom" 
               data-img-src="${x(s)}"
               data-img-title="${x(d.nome)}"
               onerror="this.style.display='none';" />
        `:""}
                <span>${x(d.nome)}</span>
              </div>
            </td>
            <td class="p-2.5 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${_}</span></td>
            <td class="p-2.5">${d.categoria||"Generale"}</td>
            <td class="p-2.5 text-center">${v} ${B}</td>
            <td class="p-2.5 text-center">${E} ${B}</td>
            <td class="p-2.5 text-center font-bold text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 rounded">
              +${y} ${B}
            </td>
            <td class="p-2.5 text-right font-mono">€ ${L.toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-bold text-amber-900 dark:text-amber-200">€ ${S.toFixed(2)}</td>
          </tr>
        `}).join(""),l.querySelectorAll(".scorte-thumbnail-zoom").forEach(d=>{d.addEventListener("click",v=>{v.stopPropagation();const E=d.getAttribute("data-img-src"),L=d.getAttribute("data-img-title");E&&this.openImageLightbox(E,L)})}))),e?.classList.remove("hidden")};b.printListaSpesa=function(e=null){const i=e||this._scorteState.activeList,t=this._scorteState.items||[],o=(i==="all"?t:t.filter(n=>(n.lista||"Generale")===i)).filter(n=>{const p=Number(n.quantita)||0;return(Number(n.quantitaMinima)||0)>p});if(o.length===0){this.showToast("Nessun articolo sotto scorta da acquistare per questa lista.",{type:"info"});return}o.sort((n,p)=>{const l=(n.categoria||"Generale").toLowerCase(),c=(p.categoria||"Generale").toLowerCase();return l!==c?l.localeCompare(c):(n.nome||"").localeCompare(p.nome||"")});const r=i==="all"?"Tutte le Liste":i,m=new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"});let g=0;o.forEach(n=>{const p=Number(n.quantita)||0,l=Number(n.quantitaMinima)||0,c=Number(n.prezzoUnitario)||0,h=l-p;g+=h*c});const u=document.getElementById("printArea");u&&(u.innerHTML=`
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
            Lista: <span style="color: #15803d;">${x(r)}</span>
          </div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #4b5563; line-height: 1.5;">
          <div>Data stampa: <strong>${m}</strong></div>
          <div>Articoli da acquistare: <strong>${o.length}</strong></div>
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
          ${o.map(n=>{const p=Number(n.quantita)||0,l=Number(n.quantitaMinima)||0,c=Number(n.prezzoUnitario)||0,h=l-p,f=h*c,d=n.unitaMisura||"pz",v=(n.categoria||"Generale").trim(),E=(n.note||"").trim(),L=(n.img||"").trim(),y=V(n.nome,n.lista,n.categoria),S=L||(y?y.src:"");return`
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #4b5563; padding: 7px 6px; vertical-align: middle;">
                  <div style="font-weight: 700; font-size: 12px; color: #111; display: flex; align-items: center; gap: 6px;">
                    ${S?`
              <img src="${x(S)}" alt="${x(n.nome)}" style="width: 22px; height: 22px; object-fit: cover; border-radius: 9999px; flex-shrink: 0; vertical-align: middle; border: 1px solid #d1d5db;" onerror="this.style.display='none';" />
            `:""}
                    <span>${x(n.nome)}</span>
                  </div>
                  <div style="font-size: 9.5px; color: #555; margin-top: 1px;">
                    ${x(v)}${i==="all"&&n.lista?` &bull; ${x(n.lista)}`:""}
                  </div>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: center; vertical-align: middle;">
                  <span style="font-weight: 800; font-size: 12.5px; color: #111;">${h} ${x(d)}</span>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: right; vertical-align: middle; white-space: nowrap;">
                  <div style="font-weight: 700; font-size: 12px; color: #111;">€ ${f.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  ${c>0?`<div style="font-size: 9px; color: #666;">(${c.toFixed(2)} €/${x(d)})</div>`:""}
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
                  ${E?`<div style="font-size: 9.5px; color: #222; margin-bottom: 2px;">${x(E)}</div>`:""}
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
              € ${g.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td colspan="3" style="border: 1.5px solid #374151; background: #f3f4f6;"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,window.print())};b.exportScorteCsv=function(){const e=this._scorteState.activeList;let i=this._scorteState.items||[];if(e!=="all"&&(i=i.filter(n=>(n.lista||"Generale")===e)),i.length===0){this.showToast("Nessun articolo da esportare",{type:"warning"});return}const a=[["Nome","Lista","Categoria","Quantita","ScortaMinima","Unita","PrezzoUnitario","DaRiordinare","PreventivoRiordino","DataControllo","Note"].join(",")];i.forEach(n=>{const p=Number(n.quantita)||0,l=Number(n.quantitaMinima)||0,c=Number(n.prezzoUnitario)||0,h=Math.max(0,l-p),f=h*c,d=[`"${(n.nome||"").replace(/"/g,'""')}"`,`"${(n.lista||"Generale").replace(/"/g,'""')}"`,`"${(n.categoria||"Generale").replace(/"/g,'""')}"`,p,l,`"${n.unitaMisura||"pz"}"`,c.toFixed(2),h,f.toFixed(2),`"${n.dataControllo||""}"`,`"${(n.note||"").replace(/"/g,'""')}"`];a.push(d.join(","))});const o="\uFEFF"+a.join(`\r
`),r=new Blob([o],{type:"text/csv;charset=utf-8;"}),m=URL.createObjectURL(r),g=document.createElement("a");g.setAttribute("href",m);const u=e!=="all"?e.replace(/\s+/g,"_"):"Tutte";g.setAttribute("download",`Inventario_${u}_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(g),g.click(),document.body.removeChild(g),URL.revokeObjectURL(m),this.showToast(`Inventario (${u}) esportato in formato CSV`)};b.exportRiordinoCsv=function(){const e=this._scorteState.activeList;let i=this._scorteState.items||[];e!=="all"&&(i=i.filter(c=>(c.lista||"Generale")===e));const t=i.filter(c=>(Number(c.quantitaMinima)||0)>(Number(c.quantita)||0));if(t.length===0){this.showToast("Nessun articolo da riordinare in questa lista",{type:"info"});return}const o=[["Articolo","Lista","Categoria","QuantitaAttuale","ScortaObiettivo","QuantitaDaOrdinare","Unita","PrezzoUnitario","CostoTotale","Note"].join(",")];let r=0;t.forEach(c=>{const h=Number(c.quantita)||0,f=Number(c.quantitaMinima)||0,d=Number(c.prezzoUnitario)||0,v=f-h,E=v*d;r+=E;const L=[`"${(c.nome||"").replace(/"/g,'""')}"`,`"${(c.lista||"Generale").replace(/"/g,'""')}"`,`"${(c.categoria||"Generale").replace(/"/g,'""')}"`,h,f,v,`"${c.unitaMisura||"pz"}"`,d.toFixed(2),E.toFixed(2),`"${(c.note||"").replace(/"/g,'""')}"`];o.push(L.join(","))});const m=e!=="all"?`TOTALE PREVENTIVO (${e})`:"TOTALE PREVENTIVO";o.push([`"${m}"`,'""','""','""','""','""','""','""',r.toFixed(2),'""'].join(","));const g="\uFEFF"+o.join(`\r
`),u=new Blob([g],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(u),p=document.createElement("a");p.setAttribute("href",n);const l=e!=="all"?e.replace(/\s+/g,"_"):"Tutte";p.setAttribute("download",`Ordine_Riordino_${l}_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(p),p.click(),document.body.removeChild(p),URL.revokeObjectURL(n),this.showToast(`Lista riordino (${l}) esportata in formato CSV`)};
