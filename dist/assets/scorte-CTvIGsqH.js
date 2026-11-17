import{D as w,U as x,O as X,r as O,e as b}from"./date-picker-3zVDvute.js";/* empty css              */import"./shared-CirsxLkL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";typeof window<"u"&&(window.DATA=w,window.UI=x);x.renderCurrentPage=function(){this.initScorte()};x._scorteState={items:[],lists:["Campo Estivo","Uniformi","Distintivi","Generale"],activeList:typeof localStorage<"u"&&localStorage.getItem("scorte-active-list")||"all",search:"",category:"",status:"all",sort:"categoria_nome",parsedImportItems:[],bound:!1};x.initScorte=async function(){try{this.showLoadingOverlay&&this.showLoadingOverlay("Caricamento scorte e liste...");const[t,i]=await Promise.all([w.getScorte(),w.getListeScorte()]);this._scorteState.items=t||[],this._scorteState.lists=i&&i.length>0?i:["Campo Estivo","Uniformi","Distintivi","Generale"]}catch(t){console.error("Errore caricamento scorte:",t),this._scorteState.items=[],this._scorteState.lists=["Campo Estivo","Uniformi","Distintivi","Generale"]}finally{this.hideLoadingOverlay&&this.hideLoadingOverlay()}this.setupScorteControls(),this.renderListeTabs(),this.renderScorte()};x.setupScorteControls=function(){const t=document.getElementById("scorteSearchInput"),i=document.getElementById("scorteCategoryFilter"),e=document.getElementById("scorteStatusFilter"),a=document.getElementById("scorteSortSelect"),o=document.getElementById("resetScorteFiltersBtn"),r=document.getElementById("addMaterialBtn"),m=document.getElementById("importMaterialsBtn"),c=document.getElementById("openPreventivoRiordinoBtn"),d=document.getElementById("exportCsvBtn"),n=document.getElementById("printBtn"),g=document.getElementById("kpiSottoScortaCard");if(this.populateCategoryFilter(),!this._scorteState.bound){if(this._scorteState.bound=!0,t){let u;t.addEventListener("input",l=>{clearTimeout(u),u=setTimeout(()=>{this._scorteState.search=l.target.value.trim().toLowerCase(),this.renderScorte()},150)})}i&&i.addEventListener("change",u=>{this._scorteState.category=u.target.value,this.renderScorte()}),e&&e.addEventListener("change",u=>{this._scorteState.status=u.target.value,this.renderScorte()}),a&&a.addEventListener("change",u=>{this._scorteState.sort=u.target.value,this.renderScorte()}),o&&o.addEventListener("click",()=>{this._scorteState.search="",this._scorteState.category="",this._scorteState.status="all",this._scorteState.sort="categoria_nome",t&&(t.value=""),i&&(i.value=""),e&&(e.value="all"),a&&(a.value="categoria_nome"),this.renderScorte(),this.showToast("Filtri azzerati",{type:"info"})}),g&&g.addEventListener("click",()=>{this._scorteState.status="reorder",e&&(e.value="reorder"),this.renderScorte()}),r&&r.addEventListener("click",()=>{this.openMaterialModal()}),m&&m.addEventListener("click",()=>{this.openImportModal()}),c&&c.addEventListener("click",()=>{this.openPreventivoRiordinoModal()}),d&&d.addEventListener("click",()=>{this.exportScorteCsv()}),n&&n.addEventListener("click",()=>{this.printListaSpesa()}),this.setupListManagementEvents(),this.setupMaterialModalEvents(),this.setupImportModalEvents(),this.setupPreventivoModalEvents()}};x.renderListeTabs=function(){const t=document.getElementById("listeTabsContainer");if(!t)return;const i=this._scorteState.items||[],e=this._scorteState.lists||[],a=this._scorteState.activeList,o={};e.forEach(l=>{o[l]={total:0,reorder:0}});let r=0,m=0;i.forEach(l=>{const h=(l.lista||"Generale").trim(),f=Number(l.quantita)||0,v=(Number(l.quantitaMinima)||0)>f;r++,v&&m++,o[h]||(o[h]={total:0,reorder:0}),o[h].total++,v&&o[h].reorder++});const c=Array.from(new Set([...e,...Object.keys(o)])).filter(Boolean);let d="";const n=a==="all";d+=`
    <button type="button" data-list="all" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${n?"bg-green-700 text-white shadow-sm ring-2 ring-green-600":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}">
      <span>Tutte le Liste</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] ${n?"bg-white/20 text-white":"bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}">${r}</span>
      ${m>0?`<span class="text-[10px]" title="${m} articoli sotto scorta">⚠️</span>`:""}
    </button>
  `,c.forEach(l=>{const h=a===l,f=o[l]||{total:0,reorder:0};d+=`
      <button type="button" data-list="${l}" class="list-tab-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${h?"bg-green-700 text-white shadow-sm ring-2 ring-green-600":"bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"}">
        <span>${l}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] ${h?"bg-white/20 text-white":"bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"}">${f.total}</span>
        ${f.reorder>0?`<span class="text-[10px] ${h?"text-amber-200":"text-amber-600"}" title="${f.reorder} da riordinare">⚠️ ${f.reorder}</span>`:""}
      </button>
    `}),t.innerHTML=d,t.querySelectorAll(".list-tab-btn").forEach(l=>{l.addEventListener("click",h=>{const f=l.getAttribute("data-list");this.switchActiveList(f)})});const g=document.getElementById("activeListActions"),u=document.getElementById("initOfficialDistintiviBtn");g&&(a!=="all"&&a!=="Generale"?g.classList.remove("hidden"):g.classList.add("hidden")),u&&(a==="Distintivi"?u.classList.remove("hidden"):u.classList.add("hidden"))};x.switchActiveList=function(t){this._scorteState.activeList=t;try{localStorage.setItem("scorte-active-list",t)}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()};x.setupListManagementEvents=function(){const t=document.getElementById("addListaBtn"),i=document.getElementById("renameActiveListBtn"),e=document.getElementById("deleteActiveListBtn"),a=document.getElementById("listModal"),o=document.getElementById("closeListModalBtn"),r=document.getElementById("cancelListBtn"),m=document.getElementById("listForm");t&&t.addEventListener("click",()=>{this.openListModal()}),i&&i.addEventListener("click",()=>{const d=this._scorteState.activeList;d&&d!=="all"&&this.openListModal(d)}),e&&e.addEventListener("click",()=>{const d=this._scorteState.activeList;d&&d!=="all"&&this.deleteActiveList(d)});const c=document.getElementById("initOfficialDistintiviBtn");c&&c.addEventListener("click",()=>{this.initOfficialDistintiviCatalog()}),o&&(o.onclick=()=>a?.classList.add("hidden")),r&&(r.onclick=()=>a?.classList.add("hidden")),m&&(m.onsubmit=async d=>{d.preventDefault(),await this.saveListForm()})};x.initOfficialDistintiviCatalog=async function(){const t=this._scorteState.items||[],i=new Set(t.filter(o=>(o.lista||"Generale")==="Distintivi").map(o=>(o.nome||"").trim().toLowerCase())),e=X.filter(o=>!i.has(o.nome.toLowerCase()));if(e.length===0){this.showToast("Tutti i distintivi ufficiali PO e PV sono già presenti nella lista Distintivi!",{type:"info"});return}const a=async()=>{try{this.showLoadingOverlay&&this.showLoadingOverlay("Caricamento catalogo distintivi...");const o=new Date().toISOString().split("T")[0],r=e.map(m=>({nome:m.nome,categoria:m.categoria,lista:"Distintivi",quantita:0,quantitaMinima:5,unitaMisura:"pz",prezzoUnitario:m.prezzoDefault,dataControllo:o,note:`Distintivo ufficiale ${m.tipo}`}));await w.importScorteBatch(r,!1,this.currentUser),this.showToast(`${e.length} distintivi ufficiali aggiunti al catalogo Distintivi!`),this._scorteState.items=await w.getScorte(),this._scorteState.lists=await w.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(o){console.error("Errore importazione distintivi ufficiali:",o),this.showToast("Errore durante il caricamento dei distintivi",{type:"error"})}finally{this.hideLoadingOverlay&&this.hideLoadingOverlay()}};typeof this.showConfirmModal=="function"?this.showConfirmModal({title:"Carica Distintivi Ufficiali (PO e PV)",message:`Verranno inseriti ${e.length} distintivi ufficiali CNGEI (Passi PV e Specialità PO) nella lista "Distintivi" con immagini sincronizzate. Vuoi procedere?`,confirmText:"Carica Distintivi",cancelText:"Annulla",onConfirm:a}):confirm(`Verranno inseriti ${e.length} distintivi ufficiali CNGEI nella lista Distintivi. Procedere?`)&&await a()};x.openListModal=function(t=""){const i=document.getElementById("listModal"),e=document.getElementById("listModalTitle"),a=document.getElementById("listNameInput"),o=document.getElementById("listOldName");i&&(t?(e&&(e.textContent=`Rinomina Lista "${t}"`),a&&(a.value=t),o&&(o.value=t)):(e&&(e.textContent="Nuova Lista Materiali"),a&&(a.value=""),o&&(o.value="")),i.classList.remove("hidden"),a?.focus())};x.saveListForm=async function(){const t=document.getElementById("listModal"),i=document.getElementById("listNameInput"),e=document.getElementById("listOldName"),a=i?.value.trim(),o=e?.value.trim();if(!a){this.showToast("Inserisci il nome della lista",{type:"error"});return}try{o?(await w.renameListaScorta(o,a,this.currentUser),this.showToast(`Lista rinominata in "${a}"`)):(await w.addListaScorta(a,this.currentUser),this.showToast(`Nuova lista "${a}" creata con successo!`)),t?.classList.add("hidden"),this._scorteState.lists=await w.getListeScorte(),this._scorteState.items=await w.getScorte(),this._scorteState.activeList=a;try{localStorage.setItem("scorte-active-list",a)}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(r){console.error("Errore salvataggio lista:",r),this.showToast("Errore durante il salvataggio della lista",{type:"error"})}};x.deleteActiveList=function(t){if(!t||t==="all"||t==="Generale")return;const i=(this._scorteState.items||[]).filter(a=>(a.lista||"Generale")===t).length,e=i>0?`Sei sicuro di voler eliminare la lista "${t}"? I suoi ${i} articoli NON verranno cancellati ma spostati nella lista "Generale".`:`Sei sicuro di voler eliminare la lista "${t}"?`;this.showConfirmModal({title:`Elimina Lista "${t}"`,message:e,confirmText:"Elimina Lista",cancelText:"Annulla",onConfirm:async()=>{try{await w.deleteListaScorta(t,this.currentUser),this.showToast(`Lista "${t}" eliminata`),this._scorteState.lists=await w.getListeScorte(),this._scorteState.items=await w.getScorte(),this._scorteState.activeList="all";try{localStorage.setItem("scorte-active-list","all")}catch{}this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(a){console.error("Errore eliminazione lista:",a),this.showToast("Errore durante l'eliminazione della lista",{type:"error"})}}})};x.populateCategoryFilter=function(){const t=document.getElementById("scorteCategoryFilter");if(!t)return;const i=this._scorteState.activeList;let e=this._scorteState.items||[];i!=="all"&&(e=e.filter(r=>(r.lista||"Generale")===i));const a=this._scorteState.category,o=Array.from(new Set(e.map(r=>(r.categoria||"Generale").trim()).filter(Boolean))).sort((r,m)=>r.localeCompare(m));t.innerHTML='<option value="">Tutte le categorie</option>'+o.map(r=>`<option value="${r}">${r}</option>`).join(""),t.value=a};x.renderScorte=function(){const t=this._scorteState.items||[],i=this._scorteState.activeList,e=this._scorteState.lists||[],a=Array.from(new Set([...e,...t.map(s=>(s.lista||"Generale").trim())])).filter(Boolean);a.includes("Generale")||a.push("Generale");const o=i==="all"?t:t.filter(s=>(s.lista||"Generale")===i),r=o.length,m=new Set(o.map(s=>(s.categoria||"Generale").trim()));let c=0,d=0,n=0,g=null;o.forEach(s=>{const E=Number(s.quantita)||0,$=Number(s.quantitaMinima)||0,C=Number(s.prezzoUnitario)||0,k=Math.max(0,$-E);if(k>0&&(c++,d+=k,n+=k*C),s.dataControllo){const z=new Date(s.dataControllo);!isNaN(z)&&(!g||z>g)&&(g=z)}});const u=document.getElementById("kpiTotalItems"),l=document.getElementById("kpiTotalItemsLabel"),h=document.getElementById("kpiCategoriesCount"),f=document.getElementById("kpiToRestockItems"),p=document.getElementById("kpiToRestockUnits"),v=document.getElementById("kpiRestockTotalCost"),I=document.getElementById("kpiRestockCostLabel"),S=document.getElementById("kpiRestockCostSub"),y=document.getElementById("kpiInventoryDate");l&&(l.textContent=i==="all"?"Totale Articoli a Catalogo":`Articoli in "${i}"`),u&&(u.textContent=String(r)),h&&(h.textContent=`${m.size} categorie in questa lista`),f&&(f.textContent=String(c)),p&&(p.textContent=`${d} unità mancanti per l'obiettivo`),I&&(I.textContent=i==="all"?"Preventivo Spesa Totale":`Preventivo "${i}"`),v&&(v.textContent=`€ ${n.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`),S&&(S.textContent=i==="all"?"Spesa stimata totale di riordino":`Spesa stimata per ordine ${i}`),y&&(y.textContent=g?g.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}):new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"}));let L=[...o];if(this._scorteState.search){const s=this._scorteState.search;L=L.filter(E=>(E.nome||"").toLowerCase().includes(s)||(E.note||"").toLowerCase().includes(s)||(E.categoria||"").toLowerCase().includes(s)||(E.lista||"").toLowerCase().includes(s))}this._scorteState.category&&(L=L.filter(s=>(s.categoria||"Generale").trim()===this._scorteState.category)),this._scorteState.status==="reorder"?L=L.filter(s=>(Number(s.quantitaMinima)||0)>(Number(s.quantita)||0)):this._scorteState.status==="ok"&&(L=L.filter(s=>(Number(s.quantitaMinima)||0)<=(Number(s.quantita)||0)));const B=this._scorteState.sort;L.sort((s,E)=>{const $=(s.nome||"").trim(),C=(E.nome||"").trim(),k=(s.categoria||"Generale").trim(),z=(E.categoria||"Generale").trim(),P=Number(s.quantita)||0,_=Number(E.quantita)||0,G=Math.max(0,(Number(s.quantitaMinima)||0)-P),A=Math.max(0,(Number(E.quantitaMinima)||0)-_),M=G*(Number(s.prezzoUnitario)||0),D=A*(Number(E.prezzoUnitario)||0);if(B==="categoria_nome"){const U=k.localeCompare(z,"it");return U!==0?U:$.localeCompare(C,"it")}return B==="nome_asc"?$.localeCompare(C,"it"):B==="nome_desc"?C.localeCompare($,"it"):B==="quantita_asc"?P-_||$.localeCompare(C,"it"):B==="quantita_desc"?_-P||$.localeCompare(C,"it"):B==="da_riordinare_desc"?A-G||D-M:B==="costo_riordino_desc"?D-M||A-G:0});const H=document.getElementById("scorteFilterSummary");if(H){const s=i==="all"?"Tutte le liste":`Lista: "${i}"`;H.textContent=`[${s}] Visualizzati: ${L.length} di ${r} articoli (${c} sotto scorta)`}const T=document.getElementById("scorteTableBody"),q=document.getElementById("scorteTableFoot");if(!T)return;if(L.length===0){const s=r===0&&i==="Distintivi"?`
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
      `:r===0&&i!=="all"?`Nessun articolo presente nella lista "${i}". Clicca su "+ Nuovo Articolo" o "Importa Lista" per aggiungerne.`:"Nessun articolo trovato con i filtri selezionati.";T.innerHTML=`
      <tr>
        <td colspan="10" class="p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
          ${s}
        </td>
      </tr>
    `;const E=document.getElementById("emptyInitDistintiviBtn");E&&E.addEventListener("click",()=>{this.initOfficialDistintiviCatalog()}),q&&(q.innerHTML="");return}let N=0,Q=0;if(T.innerHTML=L.map(s=>{const E=Number(s.quantita)||0,$=Number(s.quantitaMinima)||0,C=Number(s.prezzoUnitario)||0,k=s.unitaMisura||"pz",z=Math.max(0,$-E),P=z*C,_=(s.lista||"Generale").trim();N+=z,Q+=P;const G=_==="Distintivi"||i==="Distintivi",A=(s.img||"").trim(),M=O(s.nome,s.lista,s.categoria);let D="",U=s.nome,F="",Y=!1;A?(D=A,Y=!0,U=s.nome,F=M?M.type:"FOTO"):M&&(D=M.src,U=M.label||s.nome,F=M.type);let K="";if(D){const V=F==="PV",W=F==="PO",tt=F==="Distintivo"||F==="DIST";let j="bg-teal-600 text-white",R=F;V?(j="bg-blue-600 text-white",R="PV"):W?(j="bg-emerald-600 text-white",R="PO"):tt?(j="bg-purple-600 text-white",R="DIST"):Y&&!M&&(j="bg-teal-600 text-white",R="📷"),K=`
        <div class="relative group shrink-0" title="${b(U)} (${b(R)})">
          <img src="${b(D)}" 
               alt="${b(s.nome)}" 
               class="w-9 h-9 object-cover rounded-full shadow-sm bg-white dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform cursor-pointer scorte-thumbnail-zoom" 
               data-img-src="${b(D)}"
               data-img-title="${b(s.nome)}"
               onerror="this.style.display='none';" />
          <span class="absolute -bottom-1 -right-1 text-[9px] font-black px-1 py-0.2 rounded ${j} leading-none shadow-xs">
            ${R}
          </span>
        </div>
      `}else G&&(K=`
        <div class="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-sm shrink-0 shadow-xs" title="Distintivo">
          ⚜️
        </div>
      `);const J=z>0,Z=J?`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
           ⚠️ +${z} ${k}
         </span>`:`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
           ✓ In scorta
         </span>`;return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${J?"bg-amber-50/30 dark:bg-amber-950/10":""}" data-id="${b(s.id)}">
        <!-- Nome & Note -->
        <td class="p-2.5 min-w-[200px]">
          <div class="flex items-center gap-2.5">
            ${K}
            <div class="min-w-0 flex-1">
              <span class="sr-only">${b(s.nome)}</span>
              <input type="text"
                     class="inline-edit inline-nome font-bold text-gray-900 dark:text-white bg-transparent hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-500 rounded px-1.5 py-0.5 w-full text-sm focus:outline-none transition-colors"
                     value="${b(s.nome)}"
                     data-id="${b(s.id)}"
                     data-field="nome"
                     title="Nome articolo (modifica al volo)" />
              <div class="flex items-center gap-1 mt-0.5">
                <span class="text-[11px] text-gray-400">📝</span>
                <input type="text"
                       placeholder="Note / ubicazione..."
                       class="inline-edit inline-note text-xs text-gray-500 dark:text-gray-400 placeholder-gray-400 bg-transparent hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-500 rounded px-1.5 py-0.5 w-full focus:outline-none transition-colors"
                       value="${b(s.note||"")}"
                       data-id="${b(s.id)}"
                       data-field="note"
                       title="${b(s.note||"Aggiungi note o ubicazione")}" />
              </div>
            </div>
          </div>
        </td>

        <!-- Lista -->
        <td class="p-2.5 whitespace-nowrap">
          <span class="sr-only">${b(_)}</span>
          <select class="inline-edit inline-lista text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border border-blue-200 dark:border-blue-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                  data-id="${b(s.id)}"
                  data-field="lista"
                  title="Cambia lista di appartenenza">
            ${a.map(V=>`<option value="${b(V)}" ${V===_?"selected":""}>📑 ${b(V)}</option>`).join("")}
          </select>
        </td>

        <!-- Categoria -->
        <td class="p-2.5 whitespace-nowrap">
          <span class="sr-only">${b(s.categoria||"Generale")}</span>
          <input type="text"
                 list="categoriesList"
                 class="inline-edit inline-categoria text-xs font-medium bg-gray-50 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-green-500 text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 w-28 focus:outline-none transition-colors"
                 value="${b(s.categoria||"Generale")}"
                 data-id="${b(s.id)}"
                 data-field="categoria"
                 title="Categoria (seleziona o digita)" />
        </td>

        <!-- Quantità Attuale con pulsanti rapidi + e - e unità -->
        <td class="p-2.5 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-1.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
            <button type="button" class="btn-qty-minus text-gray-500 hover:text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${b(s.id)}" title="Diminuisci scorta">-</button>
            <input type="number"
                   min="0"
                   step="any"
                   class="inline-edit inline-quantita w-14 text-center font-bold text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
                   value="${E}"
                   data-id="${b(s.id)}"
                   data-field="quantita"
                   title="Quantità attuale in magazzino" />
            <button type="button" class="btn-qty-plus text-gray-500 hover:text-green-600 font-bold px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-id="${b(s.id)}" title="Aumenta scorta">+</button>
            <select class="inline-edit inline-unita text-xs text-gray-500 dark:text-gray-400 bg-transparent border-0 cursor-pointer focus:outline-none ml-0.5"
                    data-id="${b(s.id)}"
                    data-field="unitaMisura"
                    title="Unità di misura">
              <option value="pz" ${k==="pz"?"selected":""}>pz</option>
              <option value="m" ${k==="m"?"selected":""}>m</option>
              <option value="rotoli" ${k==="rotoli"?"selected":""}>rotoli</option>
              <option value="confezioni" ${k==="confezioni"?"selected":""}>conf.</option>
              <option value="kg" ${k==="kg"?"selected":""}>kg</option>
              <option value="litri" ${k==="litri"?"selected":""}>litri</option>
              <option value="scatole" ${k==="scatole"?"selected":""}>scatole</option>
            </select>
          </div>
        </td>

        <!-- Scorta Minima -->
        <td class="p-2.5 text-center whitespace-nowrap">
          <div class="inline-flex items-center justify-center gap-1">
            <input type="number"
                   min="0"
                   step="any"
                   class="inline-edit inline-min w-14 text-center font-semibold text-xs bg-gray-50 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-green-500 rounded px-1.5 py-1 text-gray-800 dark:text-gray-200 focus:outline-none transition-colors"
                   value="${$}"
                   data-id="${b(s.id)}"
                   data-field="quantitaMinima"
                   title="Soglia minima per riordino" />
            <span class="row-unita-label text-xs text-gray-400">${b(k)}</span>
          </div>
        </td>

        <!-- Da Riordinare -->
        <td class="p-2.5 text-center whitespace-nowrap">
          <div class="row-status-container">${Z}</div>
        </td>

        <!-- Prezzo Unitario -->
        <td class="p-2.5 text-right whitespace-nowrap">
          <div class="inline-flex items-center justify-end gap-1 font-mono">
            <span class="text-xs text-gray-400">€</span>
            <input type="number"
                   min="0"
                   step="0.01"
                   class="inline-edit inline-prezzo w-16 text-right font-mono text-xs bg-gray-50 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-green-500 rounded px-1.5 py-1 text-gray-800 dark:text-gray-200 focus:outline-none transition-colors"
                   value="${C.toFixed(2)}"
                   data-id="${b(s.id)}"
                   data-field="prezzoUnitario"
                   title="Prezzo unitario stimato (€)" />
          </div>
        </td>

        <!-- Preventivo Riordino -->
        <td class="p-2.5 text-right whitespace-nowrap">
          <span class="row-costo-badge font-mono font-bold ${J?"text-amber-700 dark:text-amber-400":"text-gray-400"}">
            € ${P.toFixed(2)}
          </span>
        </td>

        <!-- Data Controllo -->
        <td class="p-2.5 text-center whitespace-nowrap text-xs">
          <input type="date"
                 class="inline-edit inline-data text-xs text-gray-600 dark:text-gray-300 bg-transparent hover:bg-white dark:hover:bg-gray-700 focus:bg-white dark:focus:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-green-500 rounded px-1 py-0.5 focus:outline-none cursor-pointer transition-colors"
                 value="${s.dataControllo||""}"
                 data-id="${b(s.id)}"
                 data-field="dataControllo"
                 title="Data ultimo controllo inventario" />
        </td>

        <!-- Azioni -->
        <td class="p-2.5 text-center whitespace-nowrap">
          <div class="inline-flex items-center gap-1">
            <button type="button" class="btn-edit-item p-1 text-blue-600 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors" data-id="${b(s.id)}" title="Modifica completa e foto articolo">
              ✏️
            </button>
            <button type="button" class="btn-delete-item p-1 text-red-600 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors" data-id="${b(s.id)}" title="Elimina articolo">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `}).join(""),q){const s=i==="all"?"Tutte le liste":`Lista "${i}"`;q.innerHTML=`
      <tr>
        <td colspan="5" class="p-3 text-right text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
          Totale Preventivo Riordino (${s}):
        </td>
        <td class="p-3 text-center text-amber-700 dark:text-amber-300 font-extrabold" id="scorteFootTotalUnits">
          ${N>0?`+${N} unità`:"0"}
        </td>
        <td></td>
        <td class="p-3 text-right font-mono font-extrabold text-green-700 dark:text-green-300 text-base" id="scorteFootTotalCost">
          € ${Q.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}
        </td>
        <td colspan="2"></td>
      </tr>
    `}T.querySelectorAll(".btn-qty-plus").forEach(s=>{s.addEventListener("click",()=>{this.adjustItemQuantity(s.getAttribute("data-id"),1)})}),T.querySelectorAll(".btn-qty-minus").forEach(s=>{s.addEventListener("click",()=>{this.adjustItemQuantity(s.getAttribute("data-id"),-1)})}),T.querySelectorAll(".btn-edit-item").forEach(s=>{s.addEventListener("click",()=>{this.openMaterialModal(s.getAttribute("data-id"))})}),T.querySelectorAll(".btn-delete-item").forEach(s=>{s.addEventListener("click",()=>{this.deleteMaterial(s.getAttribute("data-id"))})}),T.querySelectorAll(".scorte-thumbnail-zoom").forEach(s=>{s.addEventListener("click",E=>{E.stopPropagation();const $=s.getAttribute("data-img-src"),C=s.getAttribute("data-img-title");$&&this.openImageLightbox($,C)})}),T.querySelectorAll(".inline-edit").forEach(s=>{s.addEventListener("change",()=>{this.handleInlineEdit(s)}),s.addEventListener("keydown",E=>{E.key==="Enter"&&s.blur()}),(s.classList.contains("inline-quantita")||s.classList.contains("inline-min")||s.classList.contains("inline-prezzo")||s.classList.contains("inline-unita"))&&s.addEventListener("input",()=>{const E=s.closest("tr"),$=s.dataset.id,C=(this._scorteState.items||[]).find(k=>k.id===$);E&&C&&(this.updateRowCalculations(E,C),this.updateKpiAndTotals())})})};x.openImageLightbox=function(t,i){const e=document.getElementById("imageLightboxModal"),a=document.getElementById("lightboxModalImg"),o=document.getElementById("lightboxModalTitle"),r=document.getElementById("closeLightboxBtn");if(!e||!a)return;a.src=t,o&&(o.textContent=i||"Foto Articolo"),e.classList.remove("hidden");const m=()=>{e.classList.add("hidden"),a.src=""};r&&(r.onclick=m),e.onclick=c=>{c.target===e&&m()}};x.compressImageFile=function(t,i=400,e=.82){return new Promise((a,o)=>{if(!t||!t.type.startsWith("image/"))return o(new Error("Il file selezionato non è un'immagine valida"));const r=new FileReader;r.onerror=()=>o(new Error("Errore durante la lettura del file")),r.onload=m=>{const c=new Image;c.onerror=()=>o(new Error("Impossibile caricare l'immagine selezionata")),c.onload=()=>{try{const d=document.createElement("canvas");let n=c.width,g=c.height;n>g?n>i&&(g=Math.round(g*i/n),n=i):g>i&&(n=Math.round(n*i/g),g=i),d.width=n,d.height=g,d.getContext("2d").drawImage(c,0,0,n,g);const l=d.toDataURL("image/jpeg",e);a(l)}catch(d){o(d)}},c.src=m.target.result},r.readAsDataURL(t)})};x.updateRowCalculations=function(t,i){if(!t||!i)return;const e=t.querySelector(".inline-quantita"),a=t.querySelector(".inline-min"),o=t.querySelector(".inline-prezzo"),r=t.querySelector(".inline-unita"),m=e?parseFloat(e.value)||0:Number(i.quantita)||0,c=a?parseFloat(a.value)||0:Number(i.quantitaMinima)||0,d=o?parseFloat(o.value)||0:Number(i.prezzoUnitario)||0,n=r?r.value:i.unitaMisura||"pz",g=Math.max(0,c-m),u=g*d,l=g>0,h=t.querySelector(".row-status-container");h&&(h.innerHTML=l?`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
           ⚠️ +${g} <span class="row-unita-label">${b(n)}</span>
         </span>`:`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
           ✓ In scorta
         </span>`);const f=t.querySelector(".row-costo-badge");if(f&&(f.textContent=`€ ${u.toFixed(2)}`,f.className=`row-costo-badge font-mono font-bold ${l?"text-amber-700 dark:text-amber-400":"text-gray-400"}`),t.querySelectorAll(".row-unita-label").forEach(v=>{v.textContent=n}),l?t.classList.add("bg-amber-50/30","dark:bg-amber-950/10"):t.classList.remove("bg-amber-50/30","dark:bg-amber-950/10"),!(i.img||"").trim()){const v=O(i.nome,i.lista,i.categoria),I=t.querySelector(".scorte-thumbnail-zoom");v&&I&&(I.src=v.src,I.alt=i.nome,I.setAttribute("data-img-src",v.src),I.setAttribute("data-img-title",i.nome))}};x.updateKpiAndTotals=function(){const t=this._scorteState.items||[],i=this._scorteState.activeList,e=i==="all"?t:t.filter(l=>(l.lista||"Generale")===i);let a=0,o=0,r=0;e.forEach(l=>{const h=document.querySelector(`tr[data-id="${l.id}"]`);let f=Number(l.quantita)||0,p=Number(l.quantitaMinima)||0,v=Number(l.prezzoUnitario)||0;if(h){const S=h.querySelector(".inline-quantita"),y=h.querySelector(".inline-min"),L=h.querySelector(".inline-prezzo");S&&(f=parseFloat(S.value)||0),y&&(p=parseFloat(y.value)||0),L&&(v=parseFloat(L.value)||0)}const I=Math.max(0,p-f);I>0&&(a++,o+=I,r+=I*v)});const m=document.getElementById("kpiToRestockItems"),c=document.getElementById("kpiToRestockUnits"),d=document.getElementById("kpiRestockTotalCost");m&&(m.textContent=String(a)),c&&(c.textContent=`${o} unità mancanti per l'obiettivo`),d&&(d.textContent=`€ ${r.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`);const n=document.getElementById("scorteFootTotalUnits"),g=document.getElementById("scorteFootTotalCost");n&&(n.textContent=o>0?`+${o} unità`:"0"),g&&(g.textContent=`€ ${r.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`);const u=document.getElementById("scorteFilterSummary");if(u){const l=i==="all"?"Tutte le liste":`Lista: "${i}"`,h=document.querySelectorAll("#scorteTableBody tr[data-id]").length;u.textContent=`[${l}] Visualizzati: ${h} di ${e.length} articoli (${a} sotto scorta)`}};x.handleInlineEdit=async function(t){const i=t.dataset.id,e=t.dataset.field;if(!i||!e)return;const a=(this._scorteState.items||[]).find(d=>d.id===i);if(!a)return;let o=t.value,r=o;if(e==="quantita"||e==="quantitaMinima")r=Math.max(0,parseFloat(o)||0),t.value=r;else if(e==="prezzoUnitario")r=Math.max(0,parseFloat(o)||0),t.value=r.toFixed(2);else if((e==="nome"||e==="categoria"||e==="lista"||e==="note")&&(r=o.trim(),e==="nome"&&!r)){this.showToast("Il nome dell'articolo non può essere vuoto",{type:"warning"}),t.value=a.nome;return}if(a[e]===r)return;const m=new Date().toISOString().split("T")[0],c={[e]:r};if(e==="quantita"||e==="quantitaMinima"){c.dataControllo=m,a.dataControllo=m;const n=t.closest("tr")?.querySelector(".inline-data");n&&(n.value=m)}try{const d=this.currentUser||w.adapter?.auth?.currentUser;await w.updateScorta(i,c,d),a[e]=r;const n=t.closest("tr");if(n){n.classList.add("bg-green-50/70","dark:bg-green-950/40"),setTimeout(()=>{n.classList.remove("bg-green-50/70","dark:bg-green-950/40")},700);const g=n.querySelector(".sr-only");g&&e==="nome"&&(g.textContent=r)}if(e==="lista"){this.renderListeTabs(),this.populateCategoryFilter(),this._scorteState.activeList!=="all"&&r!==this._scorteState.activeList?this.renderScorte():(this.updateRowCalculations(n,a),this.updateKpiAndTotals()),this.showToast(`Lista aggiornata: "${r}"`);return}e==="categoria"&&(this.populateCategoryFilter(),this.showToast(`Categoria aggiornata: "${r}"`)),this.updateRowCalculations(n,a),this.updateKpiAndTotals(),this.renderListeTabs()}catch(d){console.error("Errore salvataggio inline:",d),this.showToast("Errore durante il salvataggio: "+(d?.message||"riprova"),{type:"error"}),t.value=a[e]??""}};x.adjustItemQuantity=async function(t,i){const e=(this._scorteState.items||[]).find(m=>m.id===t);if(!e)return;const a=Number(e.quantita)||0,o=Math.max(0,a+i);if(o===a)return;const r=new Date().toISOString().split("T")[0];try{const m=this.currentUser||w.adapter?.auth?.currentUser;await w.updateScorta(t,{quantita:o,dataControllo:r},m),e.quantita=o,e.dataControllo=r;const c=document.querySelector(`tr[data-id="${t}"]`);if(c){const d=c.querySelector(".inline-quantita");d&&(d.value=o);const n=c.querySelector(".inline-data");n&&(n.value=r),this.updateRowCalculations(c,e),this.updateKpiAndTotals(),this.renderListeTabs()}else this.renderListeTabs(),this.renderScorte()}catch(m){console.error("Errore aggiornamento rapido quantità:",m),this.showToast("Errore durante l'aggiornamento",{type:"error"})}};x.setupMaterialModalEvents=function(){const t=document.getElementById("materialModal"),i=document.getElementById("closeMaterialModalBtn"),e=document.getElementById("cancelMaterialBtn"),a=document.getElementById("materialForm"),o=document.getElementById("materialNome"),r=document.getElementById("materialLista"),m=document.getElementById("triggerImageUploadBtn"),c=document.getElementById("materialImageFile"),d=document.getElementById("materialImgData"),n=document.getElementById("materialImgUrl"),g=document.getElementById("removeCustomImageBtn"),u=document.getElementById("materialImagePreviewImg");i&&(i.onclick=()=>t?.classList.add("hidden")),e&&(e.onclick=()=>t?.classList.add("hidden")),t&&t.addEventListener("click",l=>{l.target===t&&t.classList.add("hidden")}),m&&c&&m.addEventListener("click",()=>{c.click()}),c&&c.addEventListener("change",async l=>{const h=l.target.files&&l.target.files[0];if(h)try{const f=await this.compressImageFile(h,400,.82);d&&(d.value=f),n&&(n.value=""),this.updateCustomImagePreview(),this.showToast("Foto caricata e ottimizzata con successo!",{type:"success"})}catch(f){console.error("Errore compressione immagine:",f),this.showToast(f.message||"Errore durante il caricamento dell'immagine",{type:"error"})}finally{c.value=""}}),n&&n.addEventListener("input",()=>{n.value.trim()&&d&&(d.value=""),this.updateCustomImagePreview()}),g&&g.addEventListener("click",()=>{d&&(d.value=""),n&&(n.value=""),c&&(c.value=""),this.updateCustomImagePreview(),this.showToast("Immagine personalizzata rimossa")}),u&&u.addEventListener("click",()=>{const l=u.src,h=document.getElementById("materialNome")?.value||"Foto Articolo";l&&this.openImageLightbox(l,h)}),o&&(o.addEventListener("input",()=>{this.updateMaterialBadgePreview()}),o.addEventListener("change",()=>{const l=(o.value||"").trim(),h=X.find(f=>f.nome.toLowerCase()===l.toLowerCase());if(h){const f=document.getElementById("materialCategoria"),p=document.getElementById("materialLista"),v=document.getElementById("materialPrezzo");f&&(!f.value||f.value==="Campeggio"||f.value==="Generale")&&(f.value=h.categoria),p&&(!p.value||p.value==="Generale")&&(p.value="Distintivi"),v&&(!v.value||Number(v.value)===0)&&(v.value=h.prezzoDefault.toFixed(2))}this.updateMaterialBadgePreview()})),r&&r.addEventListener("change",()=>{this.updateMaterialBadgePreview()}),a&&(a.onsubmit=async l=>{l.preventDefault(),await this.saveMaterialForm()})};x.updateCustomImagePreview=function(){const t=document.getElementById("materialImgData"),i=document.getElementById("materialImgUrl"),e=document.getElementById("materialImagePreviewContainer"),a=document.getElementById("materialImagePreviewImg"),o=document.getElementById("materialImagePreviewName"),r=document.getElementById("materialImagePreviewSize"),m=document.getElementById("removeCustomImageBtn"),c=document.getElementById("customImageStatusBadge"),d=(t?.value||"").trim(),n=(i?.value||"").trim(),g=d||n;if(g){if(a&&(a.src=g),e&&(e.classList.remove("hidden"),e.classList.add("flex")),m&&(m.classList.remove("hidden"),m.classList.add("inline-flex")),c&&c.classList.remove("hidden"),o)if(d.startsWith("data:")){o.textContent="Foto caricata da dispositivo";const u=Math.max(1,Math.round(d.length*3/4/1024));r&&(r.textContent=`Immagine ottimizzata (~${u} KB)`)}else o.textContent="Immagine da URL web",r&&(r.textContent=n.length>40?n.substring(0,37)+"...":n)}else a&&(a.src=""),e&&(e.classList.add("hidden"),e.classList.remove("flex")),m&&(m.classList.add("hidden"),m.classList.remove("inline-flex")),c&&c.classList.add("hidden")};x.updateMaterialBadgePreview=function(){const t=document.getElementById("materialNome")?.value||"",i=document.getElementById("materialLista")?.value||"",e=document.getElementById("materialCategoria")?.value||"",a=document.getElementById("materialBadgePreviewContainer"),o=document.getElementById("materialBadgePreviewImg"),r=document.getElementById("materialBadgePreviewLabel"),m=document.getElementById("materialBadgePreviewType");if(!a||!o||!r||!m)return;const c=O(t,i,e);if(c){o.src=c.src,r.textContent=c.label||t;const d=c.type==="PV",n=c.type==="PO";m.textContent=d?"Progressione Verticale (PV)":n?"Specialità (PO)":"Distintivo Associativo / Reparto",m.className=`text-[10px] font-black px-1.5 py-0.2 rounded shrink-0 shadow-xs ${d?"bg-blue-600 text-white":n?"bg-emerald-600 text-white":"bg-purple-600 text-white"}`,a.classList.remove("hidden"),a.classList.add("flex")}else a.classList.add("hidden"),a.classList.remove("flex")};x.openMaterialModal=function(t=null){const i=document.getElementById("materialModal"),e=document.getElementById("materialModalTitle"),a=document.getElementById("materialId"),o=document.getElementById("materialNome"),r=document.getElementById("materialLista"),m=document.getElementById("listeScorteDataList"),c=document.getElementById("distintiviSuggestions"),d=document.getElementById("materialCategoria"),n=document.getElementById("materialUnita"),g=document.getElementById("materialQuantita"),u=document.getElementById("materialQuantitaMinima"),l=document.getElementById("materialPrezzo"),h=document.getElementById("materialDataControllo"),f=document.getElementById("materialNote"),p=document.getElementById("materialImgData"),v=document.getElementById("materialImgUrl");if(!i)return;const I=new Date().toISOString().split("T")[0];if(m){const y=this._scorteState.lists||["Campo Estivo","Uniformi","Distintivi","Generale"];m.innerHTML=y.map(L=>`<option value="${L}"></option>`).join("")}c&&(c.innerHTML=X.map(y=>`<option value="${b(y.nome)}">${b(y.tipo)}: ${b(y.categoria)}</option>`).join(""));const S=this._scorteState.activeList!=="all"?this._scorteState.activeList:"Generale";if(t){const y=(this._scorteState.items||[]).find(B=>B.id===t);if(!y)return;e&&(e.textContent="Modifica Articolo Scorte"),a&&(a.value=y.id),o&&(o.value=y.nome||""),r&&(r.value=y.lista||S),d&&(d.value=y.categoria||"Generale"),n&&(n.value=y.unitaMisura||"pz"),g&&(g.value=y.quantita!==void 0?y.quantita:0),u&&(u.value=y.quantitaMinima!==void 0?y.quantitaMinima:0),l&&(l.value=y.prezzoUnitario!==void 0?y.prezzoUnitario:0),h&&(h.value=y.dataControllo||I),f&&(f.value=y.note||"");const L=(y.img||"").trim();L.startsWith("data:")?(p&&(p.value=L),v&&(v.value="")):(p&&(p.value=""),v&&(v.value=L))}else{const y=S==="Distintivi";e&&(e.textContent=y?"Nuovo Distintivo in Inventario":"Nuovo Articolo Scorte"),a&&(a.value=""),o&&(o.value=""),r&&(r.value=S),d&&(d.value=y?"Distintivi":this._scorteState.category||"Campeggio"),n&&(n.value="pz"),g&&(g.value="0"),u&&(u.value=y?"5":"10"),l&&(l.value=y?"2.50":"0.00"),h&&(h.value=I),f&&(f.value=""),p&&(p.value=""),v&&(v.value="")}this.updateMaterialBadgePreview(),this.updateCustomImagePreview(),i.classList.remove("hidden"),o?.focus()};x.saveMaterialForm=async function(){const t=document.getElementById("materialModal"),i=document.getElementById("materialId")?.value,e=document.getElementById("materialNome")?.value.trim(),a=document.getElementById("materialLista")?.value.trim()||"Generale",o=document.getElementById("materialCategoria")?.value.trim()||"Generale",r=document.getElementById("materialUnita")?.value||"pz",m=Number(document.getElementById("materialQuantita")?.value)||0,c=Number(document.getElementById("materialQuantitaMinima")?.value)||0,d=Number(document.getElementById("materialPrezzo")?.value)||0,n=document.getElementById("materialDataControllo")?.value||new Date().toISOString().split("T")[0],g=document.getElementById("materialNote")?.value.trim(),u=document.getElementById("materialImgData")?.value?.trim()||"",l=document.getElementById("materialImgUrl")?.value?.trim()||"",h=u||l||"";if(!e){this.showToast("Il nome dell'articolo è obbligatorio",{type:"error"});return}const f={nome:e,lista:a,categoria:o,unitaMisura:r,quantita:m,quantitaMinima:c,prezzoUnitario:d,dataControllo:n,note:g,img:h},p=this.currentUser||w.adapter?.auth?.currentUser;try{a&&!this._scorteState.lists.includes(a)&&(await w.addListaScorta(a,p),this._scorteState.lists.push(a)),i?(await w.updateScorta(i,f,p),this.showToast(`Articolo "${e}" aggiornato con successo`)):(await w.addScorta(f,p),this.showToast(`Articolo "${e}" aggiunto alla lista "${a}"`)),t?.classList.add("hidden"),this._scorteState.items=await w.getScorte(),this._scorteState.lists=await w.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(v){console.error("Errore salvataggio scorta:",v),this.showToast("Errore durante il salvataggio",{type:"error"})}};x.deleteMaterial=function(t){const i=(this._scorteState.items||[]).find(a=>a.id===t);if(!i)return;const e=`Sei sicuro di voler eliminare l'articolo "${i.nome}" (${i.categoria||"Generale"} - Lista: ${i.lista||"Generale"}) dall'inventario scorte?`;this.showConfirmModal({title:"Conferma Eliminazione Articolo",message:e,confirmText:"Elimina Articolo",cancelText:"Annulla",onConfirm:async()=>{try{await w.deleteScorta(t,this.currentUser),this.showToast(`Articolo "${i.nome}" eliminato`),this._scorteState.items=await w.getScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(a){console.error("Errore cancellazione scorta:",a),this.showToast("Errore durante l'eliminazione",{type:"error"})}}})};x.setupImportModalEvents=function(){const t=document.getElementById("importModal"),i=document.getElementById("closeImportModalBtn"),e=document.getElementById("cancelImportBtn"),a=document.getElementById("importFileInput"),o=document.getElementById("parseImportBtn"),r=document.getElementById("confirmImportBtn");i&&(i.onclick=()=>t?.classList.add("hidden")),e&&(e.onclick=()=>t?.classList.add("hidden")),a&&a.addEventListener("change",m=>{const c=m.target.files?.[0];if(!c)return;const d=new FileReader;d.onload=n=>{const g=n.target?.result,u=document.getElementById("importTextarea");u&&typeof g=="string"&&(u.value=g,x.processImportText(g))},d.readAsText(c)}),o&&(o.onclick=()=>{const c=document.getElementById("importTextarea")?.value||"";x.processImportText(c)}),r&&(r.onclick=()=>{x.confirmImport()})};x.openImportModal=function(){const t=document.getElementById("importModal"),i=document.getElementById("importPreviewContainer"),e=document.getElementById("confirmImportBtn"),a=document.getElementById("importTextarea"),o=document.getElementById("importFileInput"),r=document.getElementById("importTargetList");if(t){if(a&&(a.value=""),o&&(o.value=""),i&&i.classList.add("hidden"),e&&(e.disabled=!0),this._scorteState.parsedImportItems=[],r){const m=this._scorteState.lists||["Campo Estivo","Uniformi","Distintivi","Generale"],c=this._scorteState.activeList;let d='<option value="auto">Usa colonna Lista dal file (o lista attiva)</option>';m.forEach(n=>{d+=`<option value="${n}" ${c===n?"selected":""}>${n}</option>`}),r.innerHTML=d}t.classList.remove("hidden")}};x.processImportText=function(t){if(!t||!t.trim()){this.showToast("Inserisci o seleziona dei dati da importare",{type:"warning"});return}const i=document.getElementById("importTargetList"),e=i&&i.value!=="auto"?i.value:null,a=this._scorteState.activeList!=="all"?this._scorteState.activeList:"Generale",o=t.split(/\r?\n/).map(u=>u.trim()).filter(Boolean),r=[],m=new Date().toISOString().split("T")[0];o.forEach((u,l)=>{const h=u.toLowerCase();if(l===0&&(h.includes("nome")||h.includes("categoria")||h.includes("quantit")))return;let f=null;if(u.includes(",")||u.includes(";")){const p=u.includes(";")?";":",",v=u.split(p).map(I=>I.trim().replace(/^["']|["']$/g,""));v.length>=1&&v[0]&&(f={nome:v[0],categoria:v[1]||"Generale",quantita:Number(v[2])||0,quantitaMinima:Number(v[3])||0,prezzoUnitario:Number(v[4])||0,unitaMisura:v[5]||"pz",note:v[6]||"",lista:e||v[7]||a,img:v[8]||"",dataControllo:m})}else if(u.includes("-")){const p=u.split("-").map(v=>v.trim());p.length>=1&&p[0]&&(f={nome:p[0],categoria:p[1]||"Generale",quantita:Number(p[2])||0,quantitaMinima:Number(p[3])||10,prezzoUnitario:0,unitaMisura:"pz",note:"",lista:e||a,img:"",dataControllo:m})}else f={nome:u,categoria:"Generale",quantita:0,quantitaMinima:10,prezzoUnitario:0,unitaMisura:"pz",note:"",lista:e||a,img:"",dataControllo:m};f&&f.nome&&r.push(f)}),this._scorteState.parsedImportItems=r;const c=document.getElementById("importPreviewContainer"),d=document.getElementById("importParsedCount"),n=document.getElementById("importPreviewTableBody"),g=document.getElementById("confirmImportBtn");if(r.length===0){this.showToast("Nessun dato valido riconosciuto",{type:"warning"}),g&&(g.disabled=!0),c&&c.classList.add("hidden");return}c&&c.classList.remove("hidden"),d&&(d.textContent=String(r.length)),g&&(g.disabled=!1),n&&(n.innerHTML=r.slice(0,50).map(u=>{const l=(u.img||"").trim(),h=O(u.nome,u.lista,u.categoria),f=l||(h?h.src:"");return`
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td class="p-2 font-medium">
          <div class="flex items-center gap-2">
            ${f?`<img src="${b(f)}" alt="${b(u.nome)}" class="w-5 h-5 object-cover rounded-full shadow-xs bg-white p-0.5 border border-gray-200 shrink-0" onerror="this.style.display='none';" />`:""}
            <span>${b(u.nome)}</span>
          </div>
        </td>
        <td class="p-2"><span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${b(u.lista)}</span></td>
        <td class="p-2">${b(u.categoria)}</td>
        <td class="p-2 text-center">${Number(u.quantita)||0} ${b(u.unitaMisura)}</td>
        <td class="p-2 text-center">${Number(u.quantitaMinima)||0}</td>
        <td class="p-2 text-right">€ ${Number(u.prezzoUnitario).toFixed(2)}</td>
      </tr>
    `}).join("")),this.showToast(`${r.length} articoli riconosciuti. Verifica e conferma l'importazione.`)};x.confirmImport=async function(){const t=this._scorteState.parsedImportItems||[];if(t.length===0)return;const e=document.querySelector('input[name="importMode"]:checked')?.value==="replace",a=this.currentUser||w.adapter?.auth?.currentUser;if((w.adapter?.constructor?.name==="FirestoreAdapter"||!!w.adapter?.db)&&!a){this.showToast("Accesso richiesto: effettua il login con un account staff per salvare su Firestore, oppure usa la modalità Demo Locale.",{type:"warning"}),this.showModal&&this.showModal("loginModal");return}try{await w.importScorteBatch(t,e,a),this.showToast(`Importazione completata con successo (${t.length} articoli)`,{type:"success"}),document.getElementById("importModal")?.classList.add("hidden"),this._scorteState.items=await w.getScorte(),this._scorteState.lists=await w.getListeScorte(),this.renderListeTabs(),this.populateCategoryFilter(),this.renderScorte()}catch(r){console.error("Errore importazione scorte:",r),r?.code==="permission-denied"||String(r?.message||"").toLowerCase().includes("permission")?this.showToast('Errore permessi Firestore: le regole di sicurezza per la collezione "scorte" non sono ancora attive sul database Firebase in Cloud.',{type:"error"}):this.showToast("Errore durante l'importazione: "+(r?.message||"controlla i dati"),{type:"error"})}};x.setupPreventivoModalEvents=function(){const t=document.getElementById("preventivoRiordinoModal"),i=document.getElementById("closePreventivoModalBtn"),e=document.getElementById("closePreventivoModalFooterBtn"),a=document.getElementById("exportRiordinoCsvBtn"),o=document.getElementById("printRiordinoBtn");i&&(i.onclick=()=>t?.classList.add("hidden")),e&&(e.onclick=()=>t?.classList.add("hidden")),a&&(a.onclick=()=>{x.exportRiordinoCsv()}),o&&(o.onclick=()=>{this.printListaSpesa()})};x.openPreventivoRiordinoModal=function(){const t=document.getElementById("preventivoRiordinoModal"),i=this._scorteState.items||[],e=this._scorteState.activeList,o=(e==="all"?i:i.filter(p=>(p.lista||"Generale")===e)).filter(p=>{const v=Number(p.quantita)||0;return(Number(p.quantitaMinima)||0)>v}),r=document.getElementById("modalPreventivoTitle"),m=document.getElementById("modalPreventivoListBadge"),c=document.getElementById("modalPreventivoSubtitle"),d=document.getElementById("modalPreventivoTotalAmount"),n=document.getElementById("modalPreventivoStats"),g=document.getElementById("modalPreventivoCategories"),u=document.getElementById("modalPreventivoTableBody");r&&(r.textContent=e==="all"?"Preventivo e Lista di Riordino Completo":`Preventivo e Riordino: ${e}`),m&&(e!=="all"?(m.textContent=`Lista: ${e}`,m.classList.remove("hidden")):(m.textContent="Tutte le Liste",m.classList.remove("hidden"))),c&&(c.textContent=e==="all"?"Elenco di tutti gli articoli con scorte inferiori alla soglia minima prefissata":`Elenco specifico degli articoli da ordinare per "${e}" (esclusi gli altri materiali)`);let l=0,h=0;const f={};if(o.forEach(p=>{const v=Number(p.quantita)||0,I=Number(p.quantitaMinima)||0,S=Number(p.prezzoUnitario)||0,y=I-v,L=y*S;l+=L,h+=y;const B=(p.categoria||"Generale").trim();f[B]||(f[B]={cost:0,units:0,items:0}),f[B].cost+=L,f[B].units+=y,f[B].items+=1}),d&&(d.textContent=`€ ${l.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}`),n){const p=e==="all"?"in totale":`per ${e}`;n.textContent=`${o.length} articoli da riordinare (${h} unità totali) ${p}`}if(g){const p=Object.entries(f);p.length===0?g.innerHTML='<p class="text-green-700 dark:text-green-400 font-medium">Tutti gli articoli di questa lista sono in scorta sufficiente! Nessun riordino necessario.</p>':g.innerHTML=p.map(([v,I])=>`
        <div class="bg-white dark:bg-gray-700 p-3 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div class="font-bold text-gray-800 dark:text-gray-100 truncate">${v}</div>
          <div class="text-amber-800 dark:text-amber-300 font-extrabold text-sm mt-0.5">€ ${I.cost.toFixed(2)}</div>
          <div class="text-[11px] text-gray-500 dark:text-gray-400">${I.items} articoli (${I.units} unità)</div>
        </div>
      `).join("")}u&&(o.length===0?u.innerHTML=`
        <tr>
          <td colspan="8" class="p-8 text-center text-green-700 dark:text-green-400 font-medium">
            🎉 Nessun articolo da riordinare per ${e==="all"?"l'intero inventario":`la lista "${e}"`}! Le scorte sono tutte al di sopra della soglia minima.
          </td>
        </tr>
      `:(u.innerHTML=o.map(p=>{const v=Number(p.quantita)||0,I=Number(p.quantitaMinima)||0,S=Number(p.prezzoUnitario)||0,y=I-v,L=y*S,B=p.unitaMisura||"pz",H=(p.lista||"Generale").trim(),T=(p.img||"").trim(),q=O(p.nome,p.lista,p.categoria),N=T||(q?q.src:""),Q=q&&q.label||p.nome;return`
          <tr class="hover:bg-amber-50/50 dark:hover:bg-amber-950/20">
            <td class="p-2.5 font-bold text-gray-800 dark:text-gray-100">
              <div class="flex items-center gap-2">
                ${N?`
          <img src="${b(N)}" 
               alt="${b(Q)}" 
               class="w-6 h-6 object-cover rounded-full shadow-xs bg-white dark:bg-gray-800 p-0.5 border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer hover:scale-110 transition-transform scorte-thumbnail-zoom" 
               data-img-src="${b(N)}"
               data-img-title="${b(p.nome)}"
               onerror="this.style.display='none';" />
        `:""}
                <span>${b(p.nome)}</span>
              </div>
            </td>
            <td class="p-2.5 whitespace-nowrap"><span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">${H}</span></td>
            <td class="p-2.5">${p.categoria||"Generale"}</td>
            <td class="p-2.5 text-center">${v} ${B}</td>
            <td class="p-2.5 text-center">${I} ${B}</td>
            <td class="p-2.5 text-center font-bold text-amber-800 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30 rounded">
              +${y} ${B}
            </td>
            <td class="p-2.5 text-right font-mono">€ ${S.toFixed(2)}</td>
            <td class="p-2.5 text-right font-mono font-bold text-amber-900 dark:text-amber-200">€ ${L.toFixed(2)}</td>
          </tr>
        `}).join(""),u.querySelectorAll(".scorte-thumbnail-zoom").forEach(p=>{p.addEventListener("click",v=>{v.stopPropagation();const I=p.getAttribute("data-img-src"),S=p.getAttribute("data-img-title");I&&this.openImageLightbox(I,S)})}))),t?.classList.remove("hidden")};x.printListaSpesa=function(t=null){const i=t||this._scorteState.activeList,e=this._scorteState.items||[],o=(i==="all"?e:e.filter(n=>(n.lista||"Generale")===i)).filter(n=>{const g=Number(n.quantita)||0;return(Number(n.quantitaMinima)||0)>g});if(o.length===0){this.showToast("Nessun articolo sotto scorta da acquistare per questa lista.",{type:"info"});return}o.sort((n,g)=>{const u=(n.categoria||"Generale").toLowerCase(),l=(g.categoria||"Generale").toLowerCase();return u!==l?u.localeCompare(l):(n.nome||"").localeCompare(g.nome||"")});const r=i==="all"?"Tutte le Liste":i,m=new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"});let c=0;o.forEach(n=>{const g=Number(n.quantita)||0,u=Number(n.quantitaMinima)||0,l=Number(n.prezzoUnitario)||0,h=u-g;c+=h*l});const d=document.getElementById("printArea");d&&(d.innerHTML=`
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
            Lista: <span style="color: #15803d;">${b(r)}</span>
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
          ${o.map(n=>{const g=Number(n.quantita)||0,u=Number(n.quantitaMinima)||0,l=Number(n.prezzoUnitario)||0,h=u-g,f=h*l,p=n.unitaMisura||"pz",v=(n.categoria||"Generale").trim(),I=(n.note||"").trim(),S=(n.img||"").trim(),y=O(n.nome,n.lista,n.categoria),L=S||(y?y.src:"");return`
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #4b5563; padding: 7px 6px; vertical-align: middle;">
                  <div style="font-weight: 700; font-size: 12px; color: #111; display: flex; align-items: center; gap: 6px;">
                    ${L?`
              <img src="${b(L)}" alt="${b(n.nome)}" style="width: 22px; height: 22px; object-fit: cover; border-radius: 9999px; flex-shrink: 0; vertical-align: middle; border: 1px solid #d1d5db;" onerror="this.style.display='none';" />
            `:""}
                    <span>${b(n.nome)}</span>
                  </div>
                  <div style="font-size: 9.5px; color: #555; margin-top: 1px;">
                    ${b(v)}${i==="all"&&n.lista?` &bull; ${b(n.lista)}`:""}
                  </div>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: center; vertical-align: middle;">
                  <span style="font-weight: 800; font-size: 12.5px; color: #111;">${h} ${b(p)}</span>
                </td>
                <td style="border: 1px solid #4b5563; padding: 7px 6px; text-align: right; vertical-align: middle; white-space: nowrap;">
                  <div style="font-weight: 700; font-size: 12px; color: #111;">€ ${f.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                  ${l>0?`<div style="font-size: 9px; color: #666;">(${l.toFixed(2)} €/${b(p)})</div>`:""}
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
                  ${I?`<div style="font-size: 9.5px; color: #222; margin-bottom: 2px;">${b(I)}</div>`:""}
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
              € ${c.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </td>
            <td colspan="3" style="border: 1.5px solid #374151; background: #f3f4f6;"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,window.print())};x.exportScorteCsv=function(){const t=this._scorteState.activeList;let i=this._scorteState.items||[];if(t!=="all"&&(i=i.filter(n=>(n.lista||"Generale")===t)),i.length===0){this.showToast("Nessun articolo da esportare",{type:"warning"});return}const a=[["Nome","Lista","Categoria","Quantita","ScortaMinima","Unita","PrezzoUnitario","DaRiordinare","PreventivoRiordino","DataControllo","Note"].join(",")];i.forEach(n=>{const g=Number(n.quantita)||0,u=Number(n.quantitaMinima)||0,l=Number(n.prezzoUnitario)||0,h=Math.max(0,u-g),f=h*l,p=[`"${(n.nome||"").replace(/"/g,'""')}"`,`"${(n.lista||"Generale").replace(/"/g,'""')}"`,`"${(n.categoria||"Generale").replace(/"/g,'""')}"`,g,u,`"${n.unitaMisura||"pz"}"`,l.toFixed(2),h,f.toFixed(2),`"${n.dataControllo||""}"`,`"${(n.note||"").replace(/"/g,'""')}"`];a.push(p.join(","))});const o="\uFEFF"+a.join(`\r
`),r=new Blob([o],{type:"text/csv;charset=utf-8;"}),m=URL.createObjectURL(r),c=document.createElement("a");c.setAttribute("href",m);const d=t!=="all"?t.replace(/\s+/g,"_"):"Tutte";c.setAttribute("download",`Inventario_${d}_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(m),this.showToast(`Inventario (${d}) esportato in formato CSV`)};x.exportRiordinoCsv=function(){const t=this._scorteState.activeList;let i=this._scorteState.items||[];t!=="all"&&(i=i.filter(l=>(l.lista||"Generale")===t));const e=i.filter(l=>(Number(l.quantitaMinima)||0)>(Number(l.quantita)||0));if(e.length===0){this.showToast("Nessun articolo da riordinare in questa lista",{type:"info"});return}const o=[["Articolo","Lista","Categoria","QuantitaAttuale","ScortaObiettivo","QuantitaDaOrdinare","Unita","PrezzoUnitario","CostoTotale","Note"].join(",")];let r=0;e.forEach(l=>{const h=Number(l.quantita)||0,f=Number(l.quantitaMinima)||0,p=Number(l.prezzoUnitario)||0,v=f-h,I=v*p;r+=I;const S=[`"${(l.nome||"").replace(/"/g,'""')}"`,`"${(l.lista||"Generale").replace(/"/g,'""')}"`,`"${(l.categoria||"Generale").replace(/"/g,'""')}"`,h,f,v,`"${l.unitaMisura||"pz"}"`,p.toFixed(2),I.toFixed(2),`"${(l.note||"").replace(/"/g,'""')}"`];o.push(S.join(","))});const m=t!=="all"?`TOTALE PREVENTIVO (${t})`:"TOTALE PREVENTIVO";o.push([`"${m}"`,'""','""','""','""','""','""','""',r.toFixed(2),'""'].join(","));const c="\uFEFF"+o.join(`\r
`),d=new Blob([c],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(d),g=document.createElement("a");g.setAttribute("href",n);const u=t!=="all"?t.replace(/\s+/g,"_"):"Tutte";g.setAttribute("download",`Ordine_Riordino_${u}_${new Date().toISOString().split("T")[0]}.csv`),document.body.appendChild(g),g.click(),document.body.removeChild(g),URL.revokeObjectURL(n),this.showToast(`Lista riordino (${u}) esportata in formato CSV`)};
