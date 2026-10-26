import{D as h,U as p,R as ee}from"./date-picker-3zVDvute.js";/* empty css              */import"./shared-CirsxLkL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";const $=[{id:"glutine",label:"Glutine",icon:"🌾"},{id:"latte",label:"Latte e Latticini",icon:"🥛"},{id:"uova",label:"Uova",icon:"🥚"},{id:"pesce",label:"Pesce",icon:"🐟"},{id:"crostacei",label:"Crostacei",icon:"🦐"},{id:"molluschi",label:"Molluschi",icon:"🦪"},{id:"frutta_guscio",label:"Frutta a guscio",icon:"🥜"},{id:"arachidi",label:"Arachidi",icon:"🥜"},{id:"soia",label:"Soia",icon:"🌱"},{id:"sedano",label:"Sedano",icon:"🥬"},{id:"senape",label:"Senape",icon:"🌭"},{id:"sesamo",label:"Sesamo",icon:"🥯"},{id:"solfiti",label:"Solfiti",icon:"🍷"},{id:"lupini",label:"Lupini",icon:"🌿"}],U=[{id:"vegetariana",label:"Vegetariana",icon:"🥦"},{id:"vegana",label:"Vegana",icon:"🥕"},{id:"senza_glutine",label:"Senza Glutine (Celiachia)",icon:"🌾🚫"},{id:"senza_lattosio",label:"Senza Lattosio",icon:"🥛🚫"},{id:"senza_maiale",label:"No Maiale",icon:"🐷🚫"},{id:"halal",label:"Halal",icon:"☪️"},{id:"kosher",label:"Kosher",icon:"✡️"},{id:"senza_pesce",label:"No Pesce/Frutti di mare",icon:"🐟🚫"}],te=["Colazione","Pranzo","Merenda","Cena","Spuntino","Gara di Cucina","Altro"];function q(n,r="g"){const e=Number(n)||0,t=(r||"g").trim().toLowerCase();switch(t){case"kg":case"chili":case"chilo":return{quantitaNorm:e*1e3,unitaNorm:"g"};case"hg":case"etti":case"etto":return{quantitaNorm:e*100,unitaNorm:"g"};case"l":case"litri":case"litro":case"lt":return{quantitaNorm:e*1e3,unitaNorm:"ml"};case"dl":return{quantitaNorm:e*100,unitaNorm:"ml"};case"cl":return{quantitaNorm:e*10,unitaNorm:"ml"};case"cucchiaio":case"cucchiai":return{quantitaNorm:e*15,unitaNorm:"g"};case"cucchiaino":case"cucchiaini":return{quantitaNorm:e*5,unitaNorm:"g"};case"bicchiere":case"bicchieri":return{quantitaNorm:e*200,unitaNorm:"ml"};case"pizzico":case"pizzichi":return{quantitaNorm:e*2,unitaNorm:"g"};case"spicchio":case"spicchi":return{quantitaNorm:e*5,unitaNorm:"g"};case"bustina":case"bustine":return{quantitaNorm:e*16,unitaNorm:"g"};case"pz":case"pezzi":case"pezzo":case"uova":case"uovo":return{quantitaNorm:e,unitaNorm:"pz"};default:return{quantitaNorm:e,unitaNorm:t}}}function A(n,r="g"){const e=Number(n)||0,t=(r||"g").toLowerCase();return t==="g"?e>=1e3?`${(e/1e3).toLocaleString("it-IT",{maximumFractionDigits:2})} kg`:`${Math.round(e)} g`:t==="ml"?e>=1e3?`${(e/1e3).toLocaleString("it-IT",{maximumFractionDigits:2})} l`:`${Math.round(e)} ml`:`${Math.round(e*100)/100} ${r}`}function ne(n){if(!n||typeof n!="string")return{nome:"",quantita:0,unita:"g"};const r=n.replace(/^[-*•]\s*/,"").trim(),e=/^(\d+\/\d+|[\d.,]+)?\s*(cucchiaini|cucchiaino|cucchiai|cucchiaio|bicchieri|bicchiere|pizzichi|pizzico|spicchi|spicchio|bustine|bustina|scatolette|scatoletta|vasetti|vasetto|fette|fetta|pezzi|pezzo|grammi|chili|chilo|litri|litro|etti|etto|uova|uovo|kg|hg|lt|ml|dl|cl|pz|g|l)?\s*(?:di\s+|d')?\s*(.+)$/i,t=r.match(e);if(!t)return{nome:r,quantita:1,unita:"pz"};let i=t[1],c=1;if(i)if(i.includes("/")){const[u,l]=i.split("/").map(Number);c=l?u/l:1}else c=parseFloat(i.replace(",","."))||1;let a=t[2]?t[2].toLowerCase():i?"pz":"",s=t[3]?t[3].trim():"";(a==="uova"||a==="uovo")&&(s=`uova ${s}`.trim(),a="pz");let d="";const g=s.match(/\((.*?)\)/);return g&&(d=g[1],s=s.replace(/\(.*?\)/,"").trim()),{nome:s,quantita:c,unita:a||"g",note:d||void 0}}function H(n,r){if(!n)return null;const e=Number(n.porzioniBase)||4,t=Number(r)||e,i=t/e,c=(n.ingredienti||[]).map(d=>{if(d.scalabile===!1)return{...d,quantitaScalata:d.quantita};const g=Number(d.quantita)||0;return{...d,quantitaOriginale:g,quantita:Math.round(g*i*10)/10,quantitaScalata:Math.round(g*i*10)/10}}),a=n.nutrizione?.perPorzione||{kcal:0,proteine:0,carboidrati:0,zuccheri:0,grassi:0,saturi:0,fibre:0,sale:0},s={kcal:Math.round((a.kcal||0)*t),proteine:Math.round((a.proteine||0)*t*10)/10,carboidrati:Math.round((a.carboidrati||0)*t*10)/10,zuccheri:Math.round((a.zuccheri||0)*t*10)/10,grassi:Math.round((a.grassi||0)*t*10)/10,saturi:Math.round((a.saturi||0)*t*10)/10,fibre:Math.round((a.fibre||0)*t*10)/10,sale:Math.round((a.sale||0)*t*100)/100};return{...n,porzioniRichieste:t,fattoreScala:i,ingredienti:c,totaleNutrizione:s}}function O(n=[]){const r={kcal:0,proteine:0,carboidrati:0,zuccheri:0,grassi:0,saturi:0,fibre:0,sale:0};return n.forEach(e=>{const t=e.totaleNutrizione||(e.nutrizione?.perPorzione?{kcal:(e.nutrizione.perPorzione.kcal||0)*(e.porzioniRichieste||e.porzioniBase||1),proteine:(e.nutrizione.perPorzione.proteine||0)*(e.porzioniRichieste||e.porzioniBase||1),carboidrati:(e.nutrizione.perPorzione.carboidrati||0)*(e.porzioniRichieste||e.porzioniBase||1),zuccheri:(e.nutrizione.perPorzione.zuccheri||0)*(e.porzioniRichieste||e.porzioniBase||1),grassi:(e.nutrizione.perPorzione.grassi||0)*(e.porzioniRichieste||e.porzioniBase||1),saturi:(e.nutrizione.perPorzione.saturi||0)*(e.porzioniRichieste||e.porzioniBase||1),fibre:(e.nutrizione.perPorzione.fibre||0)*(e.porzioniRichieste||e.porzioniBase||1),sale:(e.nutrizione.perPorzione.sale||0)*(e.porzioniRichieste||e.porzioniBase||1)}:null);t&&(r.kcal+=Number(t.kcal)||0,r.proteine+=Number(t.proteine)||0,r.carboidrati+=Number(t.carboidrati)||0,r.zuccheri+=Number(t.zuccheri)||0,r.grassi+=Number(t.grassi)||0,r.saturi+=Number(t.saturi)||0,r.fibre+=Number(t.fibre)||0,r.sale+=Number(t.sale)||0)}),{kcal:Math.round(r.kcal),proteine:Math.round(r.proteine*10)/10,carboidrati:Math.round(r.carboidrati*10)/10,zuccheri:Math.round(r.zuccheri*10)/10,grassi:Math.round(r.grassi*10)/10,saturi:Math.round(r.saturi*10)/10,fibre:Math.round(r.fibre*10)/10,sale:Math.round(r.sale*100)/100}}function re(n=[],r=[]){const e=new Map;n.forEach(a=>{(a.ricette||(a.ricetta?[a.ricetta]:[])).forEach(d=>{(d.ingredienti||[]).forEach(u=>{const{quantitaNorm:l,unitaNorm:b}=q(u.quantita,u.unita),m=(u.alimentoId||u.nome||"").toLowerCase().trim();if(!m)return;e.has(m)||e.set(m,{nome:u.nome.trim(),alimentoId:u.alimentoId||null,categoriaSpesa:u.categoriaSpesa||"Generale",quantitaTotaleNorm:0,unitaNorm:b,ricetteSet:new Set,costoStimatoKg:Number(u.costoStimatoKg||u.prezzoStimatoKg)||0});const v=e.get(m);v.quantitaTotaleNorm+=l,v.ricetteSet.add(d.nome||"Ricetta"),!v.costoStimatoKg&&(u.costoStimatoKg||u.prezzoStimatoKg)&&(v.costoStimatoKg=Number(u.costoStimatoKg||u.prezzoStimatoKg))})})});const t=[],i=[];let c=0;return e.forEach(a=>{const s=a.ricetteSet.size,d=`${s} ${s===1?"ricetta":"ricette"}`,g=a.nome,u=r.find(w=>{const B=(w.nome||"").toLowerCase(),L=g.toLowerCase();return B===L||B.includes(L)||L.includes(B)});let l=0,b=null;if(u){b=u.id;const w=q(u.quantita,u.unitaMisura);(w.unitaNorm===a.unitaNorm||w.unitaNorm==="pz"&&a.unitaNorm==="pz")&&(l=w.quantitaNorm)}const m=Math.max(0,a.quantitaTotaleNorm-l),v=l>=a.quantitaTotaleNorm;let E=0;a.costoStimatoKg>0&&(a.unitaNorm==="g"||a.unitaNorm==="ml"?E=m/1e3*a.costoStimatoKg:E=m*a.costoStimatoKg,c+=E);const I=A(a.quantitaTotaleNorm,a.unitaNorm),f=A(m,a.unitaNorm),x=A(l,a.unitaNorm),k={id:"item_"+Math.random().toString(36).slice(2,9),nome:g,categoriaSpesa:a.categoriaSpesa,quantitaTotale:a.quantitaTotaleNorm,quantitaDaComprare:m,unita:a.unitaNorm,formattedTotale:I,formattedDaComprare:f,formattedInScorte:x,ricetteCount:s,ricetteLabel:d,ricetteNomi:Array.from(a.ricetteSet),scortaId:b,quantitaInScorte:l,sufficienteInScorte:v,costoStimato:Math.round(E*100)/100,comprato:!1,dettaglioTesto:`${g}, ${f}, ${d}`};v?i.push({...k,nota:`Presente in scorte: ${x} (fabbisogno: ${I}) - NON da comprare`}):t.push(k)}),{daAcquistare:t,inScorteSufficienti:i,costoTotaleStimato:Math.round(c*100)/100}}function ie(n=[]){const r=new Map;n.forEach(t=>{const i=t.ricette||(t.ricetta?[t.ricetta]:[]),c=new Map;i.forEach(a=>{(a.strumenti||[]).forEach(d=>{const g=(d.nome||"").trim(),u=Number(d.quantita)||1;if(!g)return;const l=g.toLowerCase();c.set(l,(c.get(l)||0)+u),r.has(l)||r.set(l,{nome:g,quantitaMaxSimultanea:0,ricetteSet:new Set}),r.get(l).ricetteSet.add(a.nome||"Ricetta")})}),c.forEach((a,s)=>{const d=r.get(s);d&&a>d.quantitaMaxSimultanea&&(d.quantitaMaxSimultanea=a)})});const e=[];return r.forEach(t=>{const i=t.ricetteSet.size,c=`${i} ${i===1?"ricetta":"ricette"}`;e.push({id:"str_"+Math.random().toString(36).slice(2,9),nome:t.nome,quantita:t.quantitaMaxSimultanea||1,ricetteCount:i,ricetteLabel:c,ricetteNomi:Array.from(t.ricetteSet),dettaglioTesto:`${t.nome}, q.tà ${t.quantitaMaxSimultanea||1}, ${c}`,pronto:!1})}),e.sort((t,i)=>i.ricetteCount-t.ricetteCount)}function ae(n=[],r=[]){const e=[];return r.forEach(t=>{const i=`${t.san_allergie||""} ${t.san_intolleranze||""} ${t.san_diete||""}`.toLowerCase();if(!i.trim())return;const c=[];$.forEach(a=>{(i.includes(a.id)||i.includes(a.label.toLowerCase()))&&c.push(a.id)}),(i.includes("celiac")||i.includes("glutine"))&&(c.includes("glutine")||c.push("glutine")),i.includes("lattos")&&(c.includes("latte")||c.push("latte")),c.length!==0&&c.forEach(a=>{const s=n.filter(d=>(d.allergeni||[]).includes(a));s.length>0&&e.push({scoutId:t.id,nome:`${t.nome||t.anag_nome||""} ${t.cognome||t.anag_cognome||""}`.trim(),allergia:a,allergiaLabel:$.find(d=>d.id===a)?.label||a,ricetteIncongruenti:s.map(d=>d.nome)})})}),e}const oe={async searchAlimenti(n,r=!1){const e=(n||"").toLowerCase().trim();if(!e)return[];const t=await h.getAlimenti(),i=t.filter(c=>{const a=(c.nome||"").toLowerCase(),s=(c.marchio||"").toLowerCase(),d=(c.categoria||"").toLowerCase();return a.includes(e)||s.includes(e)||d.includes(e)});if(i.length>0&&!r)return i;if(r||i.length===0)try{const c=await fetch(`/api/ricetta-import?foodSearch=${encodeURIComponent(e)}`);if(c.ok){const a=await c.json();if(a.success&&Array.isArray(a.alimenti)){for(const d of a.alimenti)t.some(u=>(u.nome||"").toLowerCase()===(d.nome||"").toLowerCase())||await h.saveAlimento(d);const s=[...i];return a.alimenti.forEach(d=>{s.some(g=>(g.nome||"").toLowerCase()===(d.nome||"").toLowerCase())||s.push(d)}),s}}}catch(c){console.warn("[NutritionService] Ricerca online non disponibile:",c.message)}return i},async importFromUrl(n){if(!n||!n.startsWith("http"))throw new Error("URL ricetta non valido. Inserire un indirizzo http/https completo.");const r=`/api/ricetta-import?url=${encodeURIComponent(n.trim())}`,e=await fetch(r);if(!e.ok){const u=await e.json().catch(()=>({}));throw new Error(u.message||`Impossibile importare la ricetta (HTTP ${e.status})`)}const t=await e.json();if(!t.success||!t.ricetta)throw new Error("Formato ricetta non riconosciuto nella pagina indicata");const i=t.ricetta,c=await h.getAlimenti(),a=(i.ingredientiRaw||[]).map(u=>{const l=ne(u),b=c.find(m=>{const v=(m.nome||"").toLowerCase(),E=l.nome.toLowerCase();return v===E||v.includes(E)||E.includes(v)});return{nome:l.nome,quantita:l.quantita,unita:l.unita,scalabile:!0,alimentoId:b?b.id:null,categoriaSpesa:b?b.categoria:"Generale",costoStimatoKg:b&&(b.prezzoStimatoKg||b.prezzoMedioKg)||0,note:l.note}}),s=new Set;a.forEach(u=>{const l=c.find(m=>m.id===u.alimentoId);l&&Array.isArray(l.allergeni)&&l.allergeni.forEach(m=>s.add(m));const b=u.nome.toLowerCase();$.forEach(m=>{(b.includes(m.id)||b.includes(m.label.toLowerCase()))&&s.add(m.id)}),(b.includes("farina")||b.includes("pane")||b.includes("pasta"))&&s.add("glutine"),(b.includes("formaggio")||b.includes("burro")||b.includes("mozzarella")||b.includes("ricotta"))&&s.add("latte")});const d=Number(i.porzioniBase)||4,g=i.nutrizioneRaw||{kcal:0,proteine:0,carboidrati:0,grassi:0};return{nome:i.nome||"Nuova ricetta importata",categoria:"Pranzo",descrizione:i.descrizione||"",porzioniBase:d,tempoPreparazione:i.tempoPreparazione||15,tempoCottura:i.tempoCottura||25,difficolta:"Media",metodoCottura:["Fornellone"],fonte:{tipo:"url",url:n},allergeni:Array.from(s),diete:[],noteAlimentari:"",ingredienti:a,passaggi:i.passaggi||[],strumenti:[],nutrizione:{origine:i.nutrizioneRaw?.kcal?"importata":"stimata",perPorzione:{kcal:g.kcal||0,proteine:g.proteine||0,carboidrati:g.carboidrati||0,zuccheri:0,grassi:g.grassi||0,saturi:0,fibre:0,sale:0},per100g:{kcal:0,proteine:0,carboidrati:0,zuccheri:0,grassi:0,saturi:0,fibre:0,sale:0}},storicoManuale:[]}}},o={ricette:[],menus:[],scorte:[],scouts:[],activities:[],currentMenu:null,currentTab:"ricette",filterSearch:"",filterCategory:"all",filterDiet:"all"};p.renderCurrentPage=async function(){await Q(),Y(),_(),M()};document.addEventListener("DOMContentLoaded",async()=>{try{ce(),await Q(),Y(),_(),M()}catch(n){console.error("Errore inizializzazione Menù & Cambusa:",n)}});async function Q(){try{o.ricette=await h.getRicette()}catch(n){console.warn("Avviso: impossibile leggere ricette da Firestore:",n),o.ricette=[]}(!Array.isArray(o.ricette)||o.ricette.length===0)&&(o.ricette=[...ee]);try{o.menus=await h.getMenus()}catch(n){console.warn("Avviso: impossibile leggere menù da Firestore:",n),o.menus=[]}try{o.scorte=await h.getScorte()}catch(n){console.warn("Avviso: impossibile leggere scorte:",n),o.scorte=[]}try{o.activities=p.state?.activities||await h.getActivities?.()||[]}catch(n){console.warn("Avviso: impossibile leggere attività:",n),o.activities=[]}try{o.scouts=p.state?.scouts||await h.getScouts?.()||[]}catch(n){console.warn("Avviso: impossibile leggere esploratori:",n),o.scouts=[]}o.menus&&o.menus.length>0?(!o.currentMenu||!o.currentMenu.id)&&(o.currentMenu=o.menus[0]):o.currentMenu||(o.currentMenu=V())}function V(){return{id:null,titolo:"Nuovo Menù Uscita",attivitaId:"",attivitaNome:"",dataInizio:new Date().toISOString().split("T")[0],dataFine:new Date(Date.now()+864e5).toISOString().split("T")[0],partecipantiDefault:20,giorni:[{giornoIndex:1,titolo:"Giorno 1 (Sabato)",pasti:[{tipo:"Pranzo",ricette:[]},{tipo:"Merenda",ricette:[]},{tipo:"Cena",ricette:[]}]},{giornoIndex:2,titolo:"Giorno 2 (Domenica)",pasti:[{tipo:"Colazione",ricette:[]},{tipo:"Pranzo",ricette:[]}]}],totaliNutrizionali:{},costoTotaleStimato:0,stato:"bozza"}}function ce(){const n=document.getElementById("tabBtnRicette"),r=document.getElementById("tabBtnPlanner"),e=document.getElementById("tabBtnListe");n?.addEventListener("click",()=>C("ricette")),r?.addEventListener("click",()=>C("planner")),e?.addEventListener("click",()=>C("liste")),document.getElementById("recipeSearchInput")?.addEventListener("input",t=>{o.filterSearch=t.target.value.toLowerCase().trim(),z()}),document.getElementById("recipeCategoryFilter")?.addEventListener("change",t=>{o.filterCategory=t.target.value,z()}),document.getElementById("recipeDietFilter")?.addEventListener("change",t=>{o.filterDiet=t.target.value,z()}),document.getElementById("openNewRecipeBtn")?.addEventListener("click",()=>N()),document.getElementById("emptyStateNewRecipeBtn")?.addEventListener("click",()=>N()),document.getElementById("closeRecipeModalBtn")?.addEventListener("click",()=>P()),document.getElementById("cancelRecipeModalBtn")?.addEventListener("click",()=>P()),document.getElementById("recipeForm")?.addEventListener("submit",Me),document.getElementById("addIngredientRowBtn")?.addEventListener("click",()=>R()),document.getElementById("addStepRowBtn")?.addEventListener("click",()=>D()),document.getElementById("addToolRowBtn")?.addEventListener("click",()=>j()),document.getElementById("calcNutritionFromIngredientsBtn")?.addEventListener("click",Se),document.getElementById("openImportRecipeBtn")?.addEventListener("click",()=>ke()),document.getElementById("closeImportModalBtn")?.addEventListener("click",()=>F()),document.getElementById("cancelImportBtn")?.addEventListener("click",()=>F()),document.getElementById("startImportBtn")?.addEventListener("click",ze),document.getElementById("currentMenuSelect")?.addEventListener("change",de),document.getElementById("menuActivitySelect")?.addEventListener("change",le),document.getElementById("menuParticipantsInput")?.addEventListener("change",ue),document.getElementById("decrementParticipantsBtn")?.addEventListener("click",()=>K(-1)),document.getElementById("incrementParticipantsBtn")?.addEventListener("click",()=>K(1)),document.getElementById("newMenuBtn")?.addEventListener("click",J),document.getElementById("saveMenuBtn")?.addEventListener("click",X),document.getElementById("confirmAndGenerateListsBtn")?.addEventListener("click",be),document.getElementById("addDayBtn")?.addEventListener("click",ge),document.getElementById("sendToPreventivoBtn")?.addEventListener("click",ve),document.getElementById("copyWhatsAppShoppingBtn")?.addEventListener("click",xe),document.getElementById("printShoppingBtn")?.addEventListener("click",Ie),document.getElementById("copyToolsBtn")?.addEventListener("click",Ee)}function C(n){o.currentTab=n,[{id:"ricette",btn:"tabBtnRicette",content:"tabContentRicette"},{id:"planner",btn:"tabBtnPlanner",content:"tabContentPlanner"},{id:"liste",btn:"tabBtnListe",content:"tabContentListe"}].forEach(e=>{const t=document.getElementById(e.btn),i=document.getElementById(e.content);e.id===n?(t?.classList.add("border-green-600","text-green-700","dark:text-green-400"),t?.classList.remove("border-transparent","text-gray-500"),i?.classList.remove("hidden")):(t?.classList.remove("border-green-600","text-green-700","dark:text-green-400"),t?.classList.add("border-transparent","text-gray-500"),i?.classList.add("hidden"))}),_()}function _(){o.currentTab==="ricette"?z():o.currentTab==="planner"?G():o.currentTab==="liste"&&fe()}function M(){const n=o.ricette.length,r=o.menus.length,e=o.currentMenu?.costoTotaleStimato||0,t=document.getElementById("statTotalRecipes"),i=document.getElementById("statTotalMenus"),c=document.getElementById("statEstimatedCost");t&&(t.textContent=n),i&&(i.textContent=r),c&&(c.textContent=`${e.toFixed(2).replace(".",",")} €`),h.getAlimenti().then(a=>{const s=document.getElementById("statTotalFoods");s&&(s.textContent=a.length)}).catch(()=>{})}function z(){const n=document.getElementById("recipesGrid"),r=document.getElementById("recipesEmptyState");if(!n)return;let e=[...o.ricette];if(o.filterSearch&&(e=e.filter(t=>{const i=(t.nome||"").toLowerCase(),c=(t.descrizione||"").toLowerCase(),a=(t.ingredienti||[]).map(s=>s.nome.toLowerCase()).join(" ");return i.includes(o.filterSearch)||c.includes(o.filterSearch)||a.includes(o.filterSearch)})),o.filterCategory!=="all"&&(e=e.filter(t=>t.categoria===o.filterCategory)),o.filterDiet!=="all"&&(e=e.filter(t=>(t.diete||[]).includes(o.filterDiet))),e.length===0){n.innerHTML="",r?.classList.remove("hidden");return}r?.classList.add("hidden"),n.innerHTML=e.map(t=>{const i=t.porzioniBase||4,c=t.nutrizione?.perPorzione?.kcal||0,a=t.nutrizione?.perPorzione?.proteine||0,s=t.nutrizione?.perPorzione?.carboidrati||0,d=t.nutrizione?.perPorzione?.grassi||0,g=(t.allergeni||[]).map(m=>{const v=$.find(f=>f.id===m),E=v?.icon||"⚠️",I=v?.label||m;return`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300" title="Contiene ${I}">${E} ${I}</span>`}).join(""),u=(t.diete||[]).slice(0,3).map(m=>`<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">${U.find(I=>I.id===m)?.label||m}</span>`).join(""),l=(t.storicoManuale||[]).length,b=l>0?`<span class="text-[11px] text-gray-500 dark:text-gray-400" title="Preparata in ${l} attività passate">⛺ Preparata ${l} ${l===1?"volta":"volte"}</span>`:"";return`
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                <div class="p-5 space-y-3">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <span class="inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300">
                                ${t.categoria||"Pasto"}
                            </span>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">
                                ${y(t.nome)}
                            </h3>
                        </div>
                        <div class="text-right text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                            <div>⏱️ ${(t.tempoPreparazione||0)+(t.tempoCottura||0)} min</div>
                            <div>👥 ${i} porz. base</div>
                        </div>
                    </div>

                    ${t.descrizione?`<p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">${y(t.descrizione)}</p>`:""}

                    <!-- Allergeni & Dieta -->
                    <div class="flex flex-wrap gap-1.5 pt-1">
                        ${g||'<span class="text-[11px] text-gray-400 dark:text-gray-500">Nessun allergene dichiarato</span>'}
                    </div>
                    ${u?`<div class="flex flex-wrap gap-1 pt-0.5">${u}</div>`:""}

                    <!-- Macroni e Nutrizione -->
                    <div class="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60 grid grid-cols-4 gap-1 text-center text-xs">
                        <div>
                            <div class="font-extrabold text-gray-900 dark:text-white">${c}</div>
                            <div class="text-[10px] text-gray-500">Kcal/porz</div>
                        </div>
                        <div>
                            <div class="font-bold text-blue-600 dark:text-blue-400">${a}g</div>
                            <div class="text-[10px] text-gray-500">Proteine</div>
                        </div>
                        <div>
                            <div class="font-bold text-amber-600 dark:text-amber-400">${s}g</div>
                            <div class="text-[10px] text-gray-500">Carbo</div>
                        </div>
                        <div>
                            <div class="font-bold text-rose-600 dark:text-rose-400">${d}g</div>
                            <div class="text-[10px] text-gray-500">Grassi</div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                        <span>🥕 ${(t.ingredienti||[]).length} ingredienti</span>
                        ${b}
                    </div>
                </div>

                <!-- Footer Card con Bottoni -->
                <div class="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                    <button type="button" class="btn-edit-recipe text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700" data-recipe-id="${t.id}">
                        ✏️ Dettagli
                    </button>
                    <div class="flex items-center gap-1.5">
                        <button type="button" class="btn-add-to-menu text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-1" data-recipe-id="${t.id}">
                            ➕ Al Menù
                        </button>
                        <button type="button" class="btn-delete-recipe text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg" data-recipe-id="${t.id}" title="Elimina ricetta">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `}).join(""),n.querySelectorAll(".btn-edit-recipe").forEach(t=>{t.addEventListener("click",i=>{const c=i.currentTarget.getAttribute("data-recipe-id"),a=o.ricette.find(s=>s.id===c);a&&N(a)})}),n.querySelectorAll(".btn-add-to-menu").forEach(t=>{t.addEventListener("click",i=>{const c=i.currentTarget.getAttribute("data-recipe-id");se(c)})}),n.querySelectorAll(".btn-delete-recipe").forEach(t=>{t.addEventListener("click",async i=>{const c=i.currentTarget.getAttribute("data-recipe-id"),a=o.ricette.find(s=>s.id===c);a&&p.showConfirmModal({title:"Elimina Ricetta",message:`Sei sicuro di voler eliminare la ricetta "${a.nome}"? L'azione non può essere annullata.`,confirmText:"Elimina",onConfirm:async()=>{await h.deleteRicetta(c,p.currentUser),o.ricette=await h.getRicette(),z(),M(),p.showToast(`Ricetta "${a.nome}" eliminata`,{type:"success"})}})})})}function se(n){const r=o.ricette.find(a=>a.id===n);if(!r)return;if(!o.currentMenu||!o.currentMenu.giorni?.length){p.showToast("Crea prima un menù nel Pianificatore",{type:"warning"});return}const e=o.currentMenu.giorni[0];let t=e.pasti.find(a=>a.tipo.toLowerCase()===(r.categoria||"").toLowerCase());if(!t&&e.pasti.length>0&&(t=e.pasti[0]),!t){p.showToast("Nessun pasto configurato nel menù attivo",{type:"warning"});return}t.ricette||(t.ricette=[]);const i=o.currentMenu.partecipantiDefault||20,c=H(r,i);t.ricette.push(c),p.showToast(`Ricetta "${r.nome}" aggiunta a ${t.tipo} (${e.titolo})`,{type:"success"}),C("planner")}function G(){W(),S(),T()}function W(){const n=document.getElementById("currentMenuSelect"),r=document.getElementById("menuActivitySelect"),e=document.getElementById("menuParticipantsInput");n&&(n.innerHTML=o.menus.map(t=>`
            <option value="${t.id}" ${o.currentMenu?.id===t.id?"selected":""}>
                ${y(t.titolo||"Menù senza titolo")} (${t.dataInizio||"N.D."})
            </option>
        `).join("")+`<option value="new_draft" ${o.currentMenu?.id?"":"selected"}>+ [Nuova Bozza Menù]</option>`),r&&(r.innerHTML='<option value="">Nessuna (Menù generico)</option>'+o.activities.map(t=>{const i=t.data?new Date(t.data).toLocaleDateString("it-IT"):"";return`<option value="${t.id}" ${o.currentMenu?.attivitaId===t.id?"selected":""}>
                    ${y(t.descrizione||t.titolo||"Attività")} ${i?`(${i})`:""}
                </option>`}).join("")),e&&o.currentMenu&&(e.value=o.currentMenu.partecipantiDefault||20)}function de(n){const r=n.target.value;if(r==="new_draft")J();else{const e=o.menus.find(t=>t.id===r);e&&(o.currentMenu=e,G(),M())}}function le(n){if(!o.currentMenu)return;const r=n.target.value,e=o.activities.find(t=>t.id===r);o.currentMenu.attivitaId=r||null,o.currentMenu.attivitaNome=e&&(e.descrizione||e.titolo)||"",T()}function ue(n){const r=Math.max(1,parseInt(n.target.value,10)||20);Z(r)}function K(n){if(!o.currentMenu)return;const r=o.currentMenu.partecipantiDefault||20;Z(Math.max(1,r+n))}function Z(n){if(!o.currentMenu)return;o.currentMenu.partecipantiDefault=n;const r=document.getElementById("menuParticipantsInput");r&&(r.value=n),(o.currentMenu.giorni||[]).forEach(e=>{(e.pasti||[]).forEach(t=>{Array.isArray(t.ricette)&&(t.ricette=t.ricette.map(i=>{const c=o.ricette.find(a=>a.id===i.id)||i;return H(c,n)}))})}),S(),p.showToast(`Partecipanti aggiornati a ${n}: ingredienti riscalati`,{type:"info",duration:2500})}function J(){o.currentMenu=V(),G(),p.showToast("Nuova bozza di Menù creata",{type:"info"})}function ge(){if(!o.currentMenu)return;o.currentMenu.giorni||(o.currentMenu.giorni=[]);const n=o.currentMenu.giorni.length+1;o.currentMenu.giorni.push({giornoIndex:n,titolo:`Giorno ${n}`,pasti:[{tipo:"Colazione",ricette:[]},{tipo:"Pranzo",ricette:[]},{tipo:"Cena",ricette:[]}]}),S()}function S(){const n=document.getElementById("menuDaysContainer");if(!n||!o.currentMenu)return;const r=o.currentMenu.giorni||[];if(r.length===0){n.innerHTML=`
            <div class="text-center py-8 text-gray-500">
                Nessun giorno nel menù. Fai clic su "Aggiungi Giorno al Menù" in basso.
            </div>
        `;return}n.innerHTML=r.map((e,t)=>{const i=[];(e.pasti||[]).forEach(d=>{(d.ricette||[]).forEach(g=>i.push(g))});const c=O(i),a=o.currentMenu.partecipantiDefault||20,s=Math.round(c.kcal/a);return`
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden" data-day-index="${t}">
                <!-- Header Giorno -->
                <div class="p-4 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">📅</span>
                        <input type="text" value="${y(e.titolo)}" class="day-title-input font-bold text-base bg-transparent border-b border-dashed border-gray-400 focus:outline-none dark:text-white" data-day-index="${t}" />
                    </div>

                    <!-- Macro Totali Giornalieri -->
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                        <span class="px-2.5 py-1 rounded-md font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                            ${c.kcal} kcal tot (${s} kcal/persona)
                        </span>
                        <span class="px-2 py-1 rounded-md font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            P: ${c.proteine}g · C: ${c.carboidrati}g · G: ${c.grassi}g
                        </span>
                        <button type="button" class="btn-remove-day text-xs text-red-500 hover:text-red-700 p-1" data-day-index="${t}" title="Elimina Giorno">
                            ✕
                        </button>
                    </div>
                </div>

                <!-- Griglia Pasti del Giorno -->
                <div class="p-4 sm:p-5 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${(e.pasti||[]).map((d,g)=>me(d,t,g)).join("")}
                    </div>

                    <!-- Aggiungi tipo pasto extra al giorno -->
                    <div class="pt-2 flex items-center gap-2">
                        <select class="add-meal-select text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" data-day-index="${t}">
                            <option value="">+ Aggiungi pasto (Merenda, Spuntino, Gara di Cucina...)</option>
                            ${te.map(d=>`<option value="${d}">${d}</option>`).join("")}
                        </select>
                    </div>
                </div>
            </div>
        `}).join(""),n.querySelectorAll(".day-title-input").forEach(e=>{e.addEventListener("change",t=>{const i=parseInt(t.target.getAttribute("data-day-index"),10);o.currentMenu.giorni[i].titolo=t.target.value.trim()})}),n.querySelectorAll(".btn-remove-day").forEach(e=>{e.addEventListener("click",t=>{const i=parseInt(t.currentTarget.getAttribute("data-day-index"),10);o.currentMenu.giorni.splice(i,1),S()})}),n.querySelectorAll(".add-meal-select").forEach(e=>{e.addEventListener("change",t=>{const i=t.target.value;if(!i)return;const c=parseInt(t.target.getAttribute("data-day-index"),10);o.currentMenu.giorni[c].pasti.push({tipo:i,ricette:[]}),S()})}),n.querySelectorAll(".btn-add-recipe-to-meal").forEach(e=>{e.addEventListener("click",t=>{const i=parseInt(t.currentTarget.getAttribute("data-day-index"),10),c=parseInt(t.currentTarget.getAttribute("data-meal-index"),10);pe(i,c)})}),n.querySelectorAll(".btn-remove-recipe-from-meal").forEach(e=>{e.addEventListener("click",t=>{const i=parseInt(t.currentTarget.getAttribute("data-day-index"),10),c=parseInt(t.currentTarget.getAttribute("data-meal-index"),10),a=parseInt(t.currentTarget.getAttribute("data-recipe-index"),10);o.currentMenu.giorni[i].pasti[c].ricette.splice(a,1),S(),T()})})}function me(n,r,e){const t=n.ricette||[],i=O(t);return`
        <div class="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/80 rounded-xl p-3.5 flex flex-col justify-between space-y-3">
            <div>
                <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <span class="text-xs font-extrabold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        🍳 ${n.tipo}
                    </span>
                    <span class="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        ${i.kcal} kcal
                    </span>
                </div>

                <!-- Lista ricette del pasto -->
                <div class="space-y-2">
                    ${t.map((c,a)=>`
                        <div class="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs flex items-center justify-between gap-2 shadow-xs">
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white">${y(c.nome)}</div>
                                <div class="text-[10px] text-gray-500">
                                    ${c.totaleNutrizione?.kcal||0} kcal · P: ${c.totaleNutrizione?.proteine||0}g · C: ${c.totaleNutrizione?.carboidrati||0}g
                                </div>
                            </div>
                            <button type="button" class="btn-remove-recipe-from-meal text-red-500 hover:text-red-700 p-1"
                                data-day-index="${r}" data-meal-index="${e}" data-recipe-index="${a}" title="Rimuovi ricetta dal pasto">
                                ✕
                            </button>
                        </div>
                    `).join("")}

                    ${t.length===0?'<div class="text-xs text-gray-400 italic text-center py-2">Nessuna ricetta selezionata</div>':""}
                </div>
            </div>

            <!-- Bottone Aggiungi Ricetta al Pasto -->
            <button type="button" class="btn-add-recipe-to-meal w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-900/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 transition-colors flex items-center justify-center gap-1"
                data-day-index="${r}" data-meal-index="${e}">
                ➕ Aggiungi Ricetta
            </button>
        </div>
    `}function pe(n,r){const e=document.createElement("div");e.className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60",e.id="recipePickerModal",e.innerHTML=`
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <h3 class="font-bold text-base text-gray-900 dark:text-white">Seleziona Ricetta da aggiungere</h3>
                <button type="button" class="btn-close-picker text-xl text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <input type="text" id="pickerSearch" placeholder="Cerca ricetta..."
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none" />
            <div id="pickerList" class="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                ${o.ricette.map(c=>`
                    <div class="picker-item py-2.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between text-xs" data-id="${c.id}">
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">${y(c.nome)}</div>
                            <div class="text-[10px] text-gray-500">${c.categoria} · ${c.nutrizione?.perPorzione?.kcal||0} kcal/porz</div>
                        </div>
                        <span class="text-green-600 font-bold">Scegli ➔</span>
                    </div>
                `).join("")}
            </div>
        </div>
    `,document.body.appendChild(e);const t=()=>e.remove();e.querySelector(".btn-close-picker")?.addEventListener("click",t),e.addEventListener("click",c=>{c.target===e&&t()}),e.querySelector("#pickerSearch")?.addEventListener("input",c=>{const a=c.target.value.toLowerCase().trim();e.querySelectorAll(".picker-item").forEach(s=>{const d=s.textContent.toLowerCase();s.style.display=d.includes(a)?"flex":"none"})}),e.querySelectorAll(".picker-item").forEach(c=>{c.addEventListener("click",()=>{const a=c.getAttribute("data-id"),s=o.ricette.find(d=>d.id===a);if(s){const d=o.currentMenu.partecipantiDefault||20,g=H(s,d);o.currentMenu.giorni[n].pasti[r].ricette.push(g),S(),T()}t()})})}function T(){const n=document.getElementById("allergenAlertBanner"),r=document.getElementById("allergenAlertContent");if(!n||!r)return;if(!o.currentMenu||!o.currentMenu.attivitaId){n.classList.add("hidden");return}const e=[];if((o.currentMenu.giorni||[]).forEach(i=>{(i.pasti||[]).forEach(c=>{(c.ricette||[]).forEach(a=>e.push(a))})}),e.length===0){n.classList.add("hidden");return}const t=ae(e,o.scouts);if(t.length===0){n.classList.add("hidden");return}n.classList.remove("hidden"),r.innerHTML=t.map(i=>`
        <div class="flex items-start gap-1.5">
            <span class="font-bold text-amber-900 dark:text-amber-100">• ${y(i.nome)}:</span>
            <span>Allergia/Intolleranza a <strong>${y(i.allergiaLabel)}</strong> presente in: <em>${y(i.ricetteIncongruenti.join(", "))}</em></span>
        </div>
    `).join("")}async function X(){if(o.currentMenu)try{const n=await h.saveMenu(o.currentMenu,p.currentUser);o.currentMenu.id=n,o.menus=await h.getMenus(),W(),M(),p.showToast("Menù salvato con successo!",{type:"success"})}catch(n){console.error("Errore salvataggio menù:",n),p.showToast("Errore durante il salvataggio del menù: "+n.message,{type:"error"})}}async function be(){await X(),C("liste")}function fe(){const n=document.getElementById("listeMenuTitle"),r=document.getElementById("listeMenuSubtitle");n&&o.currentMenu&&(n.textContent=`Liste: ${o.currentMenu.titolo||"Menù"}`),r&&o.currentMenu&&(r.textContent=`Fabbisogno calcolato per ${o.currentMenu.partecipantiDefault||20} partecipanti`);const e=[];(o.currentMenu?.giorni||[]).forEach(a=>{(a.pasti||[]).forEach(s=>{e.push({tipo:s.tipo,ricette:s.ricette||[]})})});const t=re(e,o.scorte);o.currentMenu.listaSpesaGenerata=t,o.currentMenu.costoTotaleStimato=t.costoTotaleStimato,ye(t);const i=ie(e);o.currentMenu.listaStrumentiGenerata=i,he(i);const c=document.getElementById("shoppingCostBadge");c&&(c.textContent=`Totale: ${t.costoTotaleStimato.toFixed(2).replace(".",",")} €`),M()}function ye(n){const r=document.getElementById("shoppingListTbody"),e=document.getElementById("shoppingEmptyMessage"),t=document.getElementById("scortePresentiContainer"),i=document.getElementById("scorteCountBadge");if(!r)return;const c=n.daAcquistare||[],a=n.inScorteSufficienti||[];c.length===0?(r.innerHTML="",e?.classList.remove("hidden")):(e?.classList.add("hidden"),r.innerHTML=c.map(s=>`
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="p-3 text-center">
                    <input type="checkbox" class="rounded text-green-600 focus:ring-green-500 cursor-pointer" />
                </td>
                <td class="p-3 font-semibold text-gray-900 dark:text-white">
                    <div>${y(s.nome)}</div>
                    <div class="text-[11px] text-gray-500 font-normal">
                        ${s.categoriaSpesa} · <span class="text-blue-600 dark:text-blue-400 font-medium">${s.ricetteLabel}</span>
                    </div>
                </td>
                <td class="p-3 text-right text-gray-600 dark:text-gray-300">
                    ${s.formattedTotale}
                </td>
                <td class="p-3 text-right text-amber-700 dark:text-amber-400 font-medium">
                    ${s.quantitaInScorte>0?s.formattedInScorte:"-"}
                </td>
                <td class="p-3 text-right font-bold text-gray-900 dark:text-white">
                    ${s.formattedDaComprare}
                </td>
                <td class="p-3 text-right font-semibold text-green-700 dark:text-green-400">
                    ${s.costoStimato>0?`${s.costoStimato.toFixed(2).replace(".",",")} €`:"-"}
                </td>
            </tr>
        `).join("")),t&&(i&&(i.textContent=`${a.length} articoli`),a.length===0?t.innerHTML='<div class="text-gray-500 italic col-span-2">Nessun ingrediente coperto interamente da scorte</div>':t.innerHTML=a.map(s=>`
                <div class="p-2.5 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                        <div class="font-bold text-emerald-900 dark:text-emerald-200">${y(s.nome)}</div>
                        <div class="text-[10px] text-emerald-700 dark:text-emerald-400">${s.ricetteLabel}</div>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                            ${s.formattedInScorte} in scorte
                        </span>
                    </div>
                </div>
            `).join(""))}function he(n){const r=document.getElementById("toolsListContainer"),e=document.getElementById("toolsEmptyMessage");if(r){if(n.length===0){r.innerHTML="",e?.classList.remove("hidden");return}e?.classList.add("hidden"),r.innerHTML=n.map(t=>`
        <div class="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center justify-between text-xs hover:border-gray-300 transition-colors">
            <div class="flex items-center gap-2">
                <input type="checkbox" class="rounded text-green-600 cursor-pointer" />
                <div>
                    <div class="font-bold text-gray-900 dark:text-white">${y(t.nome)}</div>
                    <div class="text-[10px] text-gray-500">${t.ricetteLabel}</div>
                </div>
            </div>
            <span class="px-2 py-0.5 rounded-md font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                q.tà ${t.quantita}
            </span>
        </div>
    `).join("")}}async function ve(){if(!o.currentMenu)return;const n=o.currentMenu.attivitaId;if(!n){p.showToast("Collega prima il Menù ad un'Attività nel Pianificatore per inviare il preventivo",{type:"warning"});return}const r=o.currentMenu.costoTotaleStimato||0;if(r<=0){p.showToast("Nessun costo da inviare al preventivo",{type:"info"});return}try{let e=null;typeof h.getBudgetByActivity=="function"&&(e=await h.getBudgetByActivity(n));const t={id:"cambusa_"+(o.currentMenu.id||"curr"),descrizione:`Viveri & Spesa Cambusa (${o.currentMenu.titolo||"Menù"})`,categoria:"Cambusa",importo:r,tipo:"uscita",note:`Generato automaticamente dal Menù per ${o.currentMenu.partecipantiDefault||20} partecipanti`,data:new Date().toISOString().split("T")[0]};let i=[];e&&Array.isArray(e.voci)?(i=e.voci.filter(c=>c.categoria!=="Cambusa"),i.push(t)):i=[t],typeof h.saveBudget=="function"&&await h.saveBudget({id:e?.id||null,attivitaId:n,voci:i,totaleSpesaCambusa:r,updatedAt:new Date().toISOString()},p.currentUser),p.showToast(`Stima cambusa di ${r.toFixed(2).replace(".",",")} € inviata al Preventivo!`,{type:"success"})}catch(e){console.error("Errore invio a preventivo:",e),p.showToast("Errore durante l'invio al preventivo: "+e.message,{type:"error"})}}function xe(){const n=o.currentMenu?.listaSpesaGenerata;if(!n)return;let r=`🛒 *LISTA DELLA SPESA CAMBUSA*
`;r+=`*Menù:* ${o.currentMenu.titolo||"Uscita"}
`,r+=`*Partecipanti:* ${o.currentMenu.partecipantiDefault||20}
`,r+=`*Stima Costo:* ${n.costoTotaleStimato.toFixed(2).replace(".",",")} €

`,r+=`*DA ACQUISTARE:*
`,n.daAcquistare.forEach(e=>{r+=`• ${e.nome}: *${e.formattedDaComprare}* (${e.ricetteLabel})
`}),n.inScorteSufficienti.length>0&&(r+=`
*DISPONIBILE IN SCORTE (NON comprare):*
`,n.inScorteSufficienti.forEach(e=>{r+=`✅ ${e.nome}: ${e.formattedInScorte}
`})),navigator.clipboard.writeText(r).then(()=>{p.showToast("Lista della spesa copiata negli appunti!",{type:"success"})}).catch(()=>{p.showToast("Impossibile copiare negli appunti",{type:"error"})})}function Ee(){const n=o.currentMenu?.listaStrumentiGenerata||[];if(n.length===0)return;let r=`🍳 *ATTREZZATURA E STRUMENTI DI CUCINA*
`;r+=`*Menù:* ${o.currentMenu.titolo||"Uscita"}

`,n.forEach(e=>{r+=`• ${e.nome}: q.tà ${e.quantita} (${e.ricetteLabel})
`}),navigator.clipboard.writeText(r).then(()=>{p.showToast("Elenco strumenti copiato negli appunti!",{type:"success"})}).catch(()=>{p.showToast("Impossibile copiare negli appunti",{type:"error"})})}function Ie(){const n=document.getElementById("printArea"),r=o.currentMenu?.listaSpesaGenerata;if(!n||!r)return;let e=`
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">LISTA DELLA SPESA - CAMBUSA SCOUT</h1>
            <div style="font-size: 13px; color: #555; margin-bottom: 16px;">
                Menù: <strong>${y(o.currentMenu.titolo||"Uscita")}</strong> |
                Partecipanti: <strong>${o.currentMenu.partecipantiDefault||20}</strong> |
                Data: ${new Date().toLocaleDateString("it-IT")} |
                Stima Costo: <strong>${r.costoTotaleStimato.toFixed(2).replace(".",",")} €</strong>
            </div>

            <h3 style="font-size: 15px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">ARTICOLI DA COMPRARE</h3>
            <table class="print-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">[ ]</th>
                        <th>Ingrediente</th>
                        <th>Categoria</th>
                        <th style="text-align: right;">Fabbisogno</th>
                        <th style="text-align: right;">In Scorte</th>
                        <th style="text-align: right;">DA COMPRARE</th>
                        <th style="text-align: right;">Stima Costo</th>
                    </tr>
                </thead>
                <tbody>
                    ${r.daAcquistare.map(t=>`
                        <tr>
                            <td style="text-align: center;">[ ]</td>
                            <td><strong>${y(t.nome)}</strong> <span style="font-size: 10px; color: #666;">(${t.ricetteLabel})</span></td>
                            <td>${y(t.categoriaSpesa)}</td>
                            <td style="text-align: right;">${t.formattedTotale}</td>
                            <td style="text-align: right;">${t.quantitaInScorte>0?t.formattedInScorte:"-"}</td>
                            <td style="text-align: right;"><strong>${t.formattedDaComprare}</strong></td>
                            <td style="text-align: right;">${t.costoStimato>0?`${t.costoStimato.toFixed(2).replace(".",",")} €`:"-"}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            ${r.inScorteSufficienti.length>0?`
                <h3 style="font-size: 14px; font-weight: bold; margin-top: 24px; margin-bottom: 6px; color: #166534;">
                    GIÀ IN SCORTE (NON DA COMPRARE)
                </h3>
                <ul style="font-size: 12px; line-height: 1.6; margin-top: 4px;">
                    ${r.inScorteSufficienti.map(t=>`
                        <li>✓ <strong>${y(t.nome)}</strong>: ${t.formattedInScorte} presenti (${t.ricetteLabel})</li>
                    `).join("")}
                </ul>
            `:""}
        </div>
    `;n.innerHTML=e,window.print()}function N(n=null){const r=document.getElementById("recipeModal"),e=document.getElementById("recipeModalTitle"),t=document.getElementById("recipeForm");if(!(!r||!t)){if(t.reset(),document.getElementById("recipeIngredientsRows").innerHTML="",document.getElementById("recipeStepsRows").innerHTML="",document.getElementById("recipeToolsRows").innerHTML="",n){e&&(e.innerHTML=`<span>✏️</span> Modifica Ricetta: ${y(n.nome)}`),document.getElementById("recipeIdInput").value=n.id||"",document.getElementById("recipeNomeInput").value=n.nome||"",document.getElementById("recipeCategoriaInput").value=n.categoria||"Pranzo",document.getElementById("recipeDescrizioneInput").value=n.descrizione||"",document.getElementById("recipePorzioniBaseInput").value=n.porzioniBase||4,document.getElementById("recipeTempoPrepInput").value=n.tempoPreparazione||15,document.getElementById("recipeTempoCotturaInput").value=n.tempoCottura||20,document.getElementById("recipeDifficoltaInput").value=n.difficolta||"Facile",document.getElementById("recipeNoteAlimentariInput").value=n.noteAlimentari||"",(n.allergeni||[]).forEach(a=>{const s=document.getElementById(`all_cb_${a}`);s&&(s.checked=!0)}),(n.diete||[]).forEach(a=>{const s=document.getElementById(`diet_cb_${a}`);s&&(s.checked=!0)}),(n.ingredienti||[]).forEach(a=>R(a)),(n.passaggi||[]).forEach(a=>D(a)),(n.strumenti||[]).forEach(a=>j(a));const i=n.nutrizione?.perPorzione||{};document.getElementById("nutrKcalPorz").value=i.kcal||"",document.getElementById("nutrProtPorz").value=i.proteine||"",document.getElementById("nutrCarbPorz").value=i.carboidrati||"",document.getElementById("nutrFatPorz").value=i.grassi||"";const c=document.getElementById("recipeHistoryContainer");c&&((n.storicoManuale||[]).length>0?c.innerHTML=n.storicoManuale.map(a=>`
                    <div>• <strong>${a.data||""}</strong>: ${y(a.note||"Preparata")}</div>
                `).join(""):c.textContent="Nessuna attività registrata in precedenza.")}else e&&(e.innerHTML="<span>➕</span> Nuova Ricetta Scout"),document.getElementById("recipeIdInput").value="",R(),D(),j();r.classList.remove("hidden"),document.body.style.overflow="hidden"}}function P(){const n=document.getElementById("recipeModal");n&&(n.classList.add("hidden"),document.body.style.overflow="")}function Y(){const n=document.getElementById("recipeAllergeniCheckboxes"),r=document.getElementById("recipeDieteCheckboxes");n&&(n.innerHTML=$.map(e=>`
            <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="all_cb_${e.id}" value="${e.id}" class="rounded text-amber-600 focus:ring-amber-500" />
                <span>${e.icon} ${e.label}</span>
            </label>
        `).join("")),r&&(r.innerHTML=U.map(e=>`
            <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="diet_cb_${e.id}" value="${e.id}" class="rounded text-green-600 focus:ring-green-500" />
                <span>${e.icon} ${e.label}</span>
            </label>
        `).join(""))}function R(n={}){const r=document.getElementById("recipeIngredientsRows");if(!r)return;const e=document.createElement("div");e.className="ingredient-row flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-xs",e.innerHTML=`
        <input type="text" placeholder="Nome ingrediente *" value="${y(n.nome||"")}" required
            class="ing-nome flex-1 min-w-[140px] px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white" />
        <input type="number" step="0.1" placeholder="Qtà" value="${n.quantita??""}" required
            class="ing-qta w-16 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-right" />
        <select class="ing-unita px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white">
            <option value="g" ${n.unita==="g"?"selected":""}>g</option>
            <option value="kg" ${n.unita==="kg"?"selected":""}>kg</option>
            <option value="ml" ${n.unita==="ml"?"selected":""}>ml</option>
            <option value="l" ${n.unita==="l"?"selected":""}>l</option>
            <option value="pz" ${n.unita==="pz"?"selected":""}>pz</option>
            <option value="cucchiai" ${n.unita==="cucchiai"?"selected":""}>cucchiai</option>
        </select>
        <input type="number" step="0.1" placeholder="€/kg" value="${n.costoStimatoKg??""}" title="Prezzo stimato al kg"
            class="ing-costo w-16 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white text-right" />
        <label class="flex items-center gap-1 text-[11px] text-gray-500" title="Riscala quantità in base al numero di partecipanti">
            <input type="checkbox" class="ing-scalabile rounded" ${n.scalabile!==!1?"checked":""} />
            Scalabile
        </label>
        <button type="button" class="btn-remove-row text-red-500 hover:text-red-700 font-bold p-1">✕</button>
    `,e.querySelector(".btn-remove-row")?.addEventListener("click",()=>e.remove()),r.appendChild(e)}function D(n=""){const r=document.getElementById("recipeStepsRows");if(!r)return;const e=document.createElement("div");e.className="step-row flex items-start gap-2",e.innerHTML=`
        <span class="text-xs font-bold text-gray-400 pt-2 step-num">${r.children.length+1}.</span>
        <textarea rows="1" placeholder="Descrivi il passaggio..." required
            class="step-text flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none">${y(n)}</textarea>
        <button type="button" class="btn-remove-row text-red-500 hover:text-red-700 font-bold p-1 pt-1.5">✕</button>
    `,e.querySelector(".btn-remove-row")?.addEventListener("click",()=>{e.remove(),we()}),r.appendChild(e)}function we(){const n=document.getElementById("recipeStepsRows");n&&Array.from(n.children).forEach((r,e)=>{const t=r.querySelector(".step-num");t&&(t.textContent=`${e+1}.`)})}function j(n={}){const r=document.getElementById("recipeToolsRows");if(!r)return;const e=document.createElement("div");e.className="tool-row flex items-center gap-2",e.innerHTML=`
        <input type="text" placeholder="Strumento (es. Pentola grande 10L)" value="${y(n.nome||"")}" required
            class="tool-nome flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white" />
        <input type="number" min="1" value="${n.quantita||1}" required
            class="tool-qta w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-right" />
        <button type="button" class="btn-remove-row text-red-500 hover:text-red-700 font-bold p-1">✕</button>
    `,e.querySelector(".btn-remove-row")?.addEventListener("click",()=>e.remove()),r.appendChild(e)}async function Se(){const n=await h.getAlimenti(),r=document.querySelectorAll("#recipeIngredientsRows .ingredient-row"),e=Number(document.getElementById("recipePorzioniBaseInput").value)||4;let t=0,i=0,c=0,a=0;r.forEach(s=>{const d=s.querySelector(".ing-nome")?.value.toLowerCase().trim()||"",g=Number(s.querySelector(".ing-qta")?.value)||0,u=s.querySelector(".ing-unita")?.value||"g",l=n.find(b=>(b.nome||"").toLowerCase().includes(d)||d.includes((b.nome||"").toLowerCase()));if(l&&l.nutrizione100g){const m=q(g,u).quantitaNorm/100;t+=(l.nutrizione100g.kcal||0)*m,i+=(l.nutrizione100g.proteine||0)*m,c+=(l.nutrizione100g.carboidrati||0)*m,a+=(l.nutrizione100g.grassi||0)*m}}),document.getElementById("nutrKcalPorz").value=Math.round(t/e)||0,document.getElementById("nutrProtPorz").value=Math.round(i/e*10)/10||0,document.getElementById("nutrCarbPorz").value=Math.round(c/e*10)/10||0,document.getElementById("nutrFatPorz").value=Math.round(a/e*10)/10||0,p.showToast("Valori nutrizionali calcolati con successo dagli alimenti!",{type:"success"})}async function Me(n){n.preventDefault();const r=document.getElementById("recipeIdInput").value||null,e=document.getElementById("recipeNomeInput").value.trim(),t=document.getElementById("recipeCategoriaInput").value,i=document.getElementById("recipeDescrizioneInput").value.trim(),c=Number(document.getElementById("recipePorzioniBaseInput").value)||4,a=Number(document.getElementById("recipeTempoPrepInput").value)||0,s=Number(document.getElementById("recipeTempoCotturaInput").value)||0,d=document.getElementById("recipeDifficoltaInput").value,g=document.getElementById("recipeNoteAlimentariInput").value.trim(),u=[];$.forEach(f=>{const x=document.getElementById(`all_cb_${f.id}`);x&&x.checked&&u.push(f.id)});const l=[];U.forEach(f=>{const x=document.getElementById(`diet_cb_${f.id}`);x&&x.checked&&l.push(f.id)});const b=[];document.querySelectorAll("#recipeIngredientsRows .ingredient-row").forEach(f=>{const x=f.querySelector(".ing-nome")?.value.trim(),k=Number(f.querySelector(".ing-qta")?.value)||0,w=f.querySelector(".ing-unita")?.value||"g",B=Number(f.querySelector(".ing-costo")?.value)||0,L=f.querySelector(".ing-scalabile")?.checked??!0;x&&b.push({nome:x,quantita:k,unita:w,costoStimatoKg:B,scalabile:L})});const m=[];document.querySelectorAll("#recipeStepsRows .step-text").forEach(f=>{const x=f.value.trim();x&&m.push(x)});const v=[];document.querySelectorAll("#recipeToolsRows .tool-row").forEach(f=>{const x=f.querySelector(".tool-nome")?.value.trim(),k=Number(f.querySelector(".tool-qta")?.value)||1;x&&v.push({nome:x,quantita:k})});const E={origine:"manuale",perPorzione:{kcal:Number(document.getElementById("nutrKcalPorz").value)||0,proteine:Number(document.getElementById("nutrProtPorz").value)||0,carboidrati:Number(document.getElementById("nutrCarbPorz").value)||0,grassi:Number(document.getElementById("nutrFatPorz").value)||0}},I={id:r,nome:e,categoria:t,descrizione:i,porzioniBase:c,tempoPreparazione:a,tempoCottura:s,difficolta:d,metodoCottura:["Fornellone"],allergeni:u,diete:l,noteAlimentari:g,ingredienti:b,passaggi:m,strumenti:v,nutrizione:E};try{r?(await h.updateRicetta(r,I,p.currentUser),p.showToast(`Ricetta "${e}" modificata!`,{type:"success"})):(await h.addRicetta(I,p.currentUser),p.showToast(`Ricetta "${e}" salvata con successo!`,{type:"success"})),o.ricette=await h.getRicette(),P(),z(),M()}catch(f){console.error("Errore salvataggio ricetta:",f),p.showToast("Errore durante il salvataggio: "+f.message,{type:"error"})}}function ke(){const n=document.getElementById("importRecipeModal"),r=document.getElementById("importStatusMessage"),e=document.getElementById("importUrlInput");n&&(e&&(e.value=""),r&&(r.className="hidden",r.textContent=""),n.classList.remove("hidden"))}function F(){const n=document.getElementById("importRecipeModal");n&&n.classList.add("hidden")}async function ze(){const n=document.getElementById("importUrlInput"),r=document.getElementById("importStatusMessage"),e=document.getElementById("startImportBtn"),t=n?.value.trim();if(!t){p.showToast("Inserisci un URL valido",{type:"warning"});return}e&&(e.disabled=!0),r&&(r.className="text-xs p-3 rounded-lg bg-blue-50 text-blue-700 block",r.textContent="Analisi della pagina e lettura degli ingredienti in corso...");try{const i=await oe.importFromUrl(t);F(),N(i),p.showToast(`Ricetta "${i.nome}" importata! Controlla e salva.`,{type:"success",duration:4e3})}catch(i){console.error("Errore import:",i),r&&(r.className="text-xs p-3 rounded-lg bg-red-50 text-red-700 block",r.textContent="Errore importazione: "+i.message),p.showToast("Impossibile importare: "+i.message,{type:"error"})}finally{e&&(e.disabled=!1)}}function y(n){return n?String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}
