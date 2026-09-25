import"./date-picker-DdNAYcTb.js";import"./shared-Dm_IxfHL.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.renderCurrentPage=function(){this.renderAuditLogs()};UI.loadAuditLogs=async function(r=100){try{return typeof DATA<"u"&&typeof DATA.getAuditLogs=="function"?await DATA.getAuditLogs(r):[]}catch(e){return console.error("Errore nel recupero dei log da DATA:",e),[]}};UI.renderAuditLogs=async function(){const r=this.qs("#auditLogsContent");if(r){r.innerHTML=`
    <div class="text-center text-gray-500">
      <p>Caricamento log di audit...</p>
    </div>
  `;try{const e=await this.loadAuditLogs();if(!e||e.length===0){r.innerHTML=`
        <div class="text-center text-gray-500">
          <p>Nessun log disponibile.</p>
        </div>
      `;return}e.sort((t,s)=>{const o=this.toJsDate(t.timestamp);return this.toJsDate(s.timestamp)-o});const n=t=>{if(t==null)return"";const s=String(t),o=document.createElement("div");return o.textContent=s,o.innerHTML},i=e.map(t=>{const s=this.toJsDate(t.timestamp),o=isNaN(s)?"":s.toLocaleString("it-IT"),a=(this.state.staff||[]).find(c=>(c.email||"").toLowerCase()===(t.userEmail||"").toLowerCase()),d=a?`${a.nome} ${a.cognome}`:"";return`
        <tr class="border-b last:border-0">
          <td class="p-2 whitespace-nowrap">${n(o)}</td>
          <td class="p-2 font-medium">${n(t.action)}</td>
          <td class="p-2">${n(d)}</td>
          <td class="p-2 text-gray-600 text-sm">${n(JSON.stringify(t.changes||{}))}</td>
        </tr>
      `}).join("");r.innerHTML=`
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="p-2">Data</th>
              <th class="p-2">Azione</th>
              <th class="p-2">Chi</th>
              <th class="p-2">Cosa</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${i}
          </tbody>
        </table>
      </div>
    `}catch(e){console.error("Errore caricamento audit logs:",e),r.innerHTML=`
      <div class="text-center text-red-600">
        <p>Errore nel caricamento dei log.</p>
      </div>
    `}}};document.addEventListener("DOMContentLoaded",()=>{console.log("Pagina Log Audit caricata")});
