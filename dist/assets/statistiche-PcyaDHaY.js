import"./date-picker-uZF_q5LC.js";import"./shared-axA01fcI.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";import"https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";UI.specialitaListData=null;UI.loadSpecialitaList=async function(){if(this.specialitaListData)return this.specialitaListData;try{const e=await fetch("specialita.json");return this.specialitaListData=await e.json(),this.specialitaListData}catch(e){return console.error("Errore caricamento specialita.json:",e),[]}};UI.toJsDate=function(e){if(!e)return null;if(e instanceof Date)return e;if(e&&e.toDate)return e.toDate();const a=new Date(e);return isNaN(a.getTime())?null:a};UI.daysBetween=function(e,a){if(!e||!a)return null;const v=this.toJsDate(e),m=this.toJsDate(a);if(!v||!m)return null;const i=Math.abs(m-v);return Math.floor(i/(1e3*60*60*24))};UI.getAnnoEsploratore=function(e){if(!e)return null;const a=this.toJsDate(e);if(!a)return null;const v=new Date;let m=v.getFullYear()-a.getFullYear();const i=v.getMonth()-a.getMonth();return(i<0||i===0&&v.getDate()<a.getDate())&&m--,m};UI.getAnnoScout=function(e){const a=this.getAnnoEsploratore(e);return a===null?null:a>=11&&a<=12?"I°":a===13?"II°":a===14?"III°":a===15?"IV°":null};UI.renderCurrentPage=function(){this.renderStatistiche()};UI.renderStatistiche=async function(){window.Chart&&window.ChartDataLabels&&window.Chart.register(window.ChartDataLabels),this.state=await DATA.loadAll(),this.rebuildPresenceIndex(),await this.loadSpecialitaList();const e=this.state.scouts||[];this.setupStatsScoutYearSelector(),this.renderKPICards(e),this.renderComposizioneStats(e),this.renderPassiStats(e),await this.renderSpecialitaStats(e),this.renderPattuglieTable(e),this.renderMonthlyTrendChart(e),this.renderScoutRankingChart(e),this.renderPresenceReport()};UI.renderMonthlyTrendChart=function(e){const a=document.getElementById("monthlyPresenceTrendChart");if(!a)return;const v=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),m=v==="all",i=new Date;i.setHours(0,0,0,0);const l=(this.state.activities||[]).filter(g=>m?!0:this.isActivityInScoutYear?this.isActivityInScoutYear(g,v):!0).filter(g=>{const u=this.toJsDate(g.data);return u&&u<=i}),h=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],c={};l.forEach(g=>{const u=this.toJsDate(g.data);if(!u)return;const n=u.toLocaleDateString("it-IT",{month:"short",year:"2-digit"}),y=u.getFullYear()*100+u.getMonth();c[n]||(c[n]={presenti:0,assenti:0,order:y});const S=h.filter(b=>b.attivitaId===g.id);c[n].presenti+=S.filter(b=>b.stato==="Presente").length,c[n].assenti+=S.filter(b=>b.stato==="Assente").length});const r=Object.entries(c).sort((g,u)=>g[1].order-u[1].order),t=r.map(g=>g[0]),o=r.map(g=>g[1].presenti),p=r.map(g=>g[1].assenti),s=r.map(g=>{const u=g[1].presenti+g[1].assenti;return u>0?Math.round(g[1].presenti/u*100):0});this._destroyChart("monthlyPresenceTrendChart");const d=new Chart(a,{type:"bar",data:{labels:t,datasets:[{label:"Presenti",data:o,backgroundColor:"rgba(22,163,74,0.75)",borderRadius:5,order:2},{label:"Assenti",data:p,backgroundColor:"rgba(220,38,38,0.5)",borderRadius:5,order:2},{label:"% Presenza",data:s,type:"line",borderColor:"#2563eb",backgroundColor:"rgba(37,99,235,0.1)",tension:.4,yAxisID:"y1",pointRadius:4,pointBackgroundColor:"#2563eb",order:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top"},tooltip:{mode:"index",intersect:!1}},scales:{y:{beginAtZero:!0,ticks:{stepSize:1},title:{display:!0,text:"N° persone"}},y1:{beginAtZero:!0,max:100,position:"right",grid:{drawOnChartArea:!1},ticks:{callback:g=>g+"%"},title:{display:!0,text:"% presenza"}}}}});this._charts=this._charts||{},this._charts.monthlyPresenceTrendChart=d};UI.renderScoutRankingChart=function(e){const a=document.getElementById("scoutRankingChart");if(!a)return;const v=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),m=v==="all",i=new Date;i.setHours(0,0,0,0);const l=(this.state.activities||[]).filter(s=>m?!0:this.isActivityInScoutYear?this.isActivityInScoutYear(s,v):!0).filter(s=>{const d=this.toJsDate(s.data);return d&&d<=i}),h=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],c=e.map(s=>{let d=0,g=0;l.forEach(y=>{const S=h.find(b=>b.esploratoreId===s.id&&b.attivitaId===y.id);S&&(S.stato==="Presente"||S.stato==="Assente")&&(g++,S.stato==="Presente"&&d++)});const u=g>0?Math.round(d/g*100):0;return{nome:(s.nome?`${s.nome} ${s.cognome||""}`:s.anag_nome?`${s.anag_nome} ${s.anag_cognome||""}`:s.id).trim(),perc:u,presenti:d,totale:g}}).filter(s=>s.totale>0).sort((s,d)=>d.perc-s.perc);if(c.length===0)return;const r=c.map(s=>s.nome),t=c.map(s=>s.perc),o=t.map(s=>s>=75?"rgba(22,163,74,0.75)":s>=60?"rgba(234,179,8,0.75)":"rgba(220,38,38,0.65)");this._destroyChart("scoutRankingChart");const p=new Chart(a,{type:"bar",data:{labels:r,datasets:[{label:"% Presenza",data:t,backgroundColor:o,borderRadius:4}]},options:{indexAxis:"y",responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:s=>{const d=c[s.dataIndex];return` ${d.perc}% (${d.presenti}/${d.totale} attività)`}}}},scales:{x:{beginAtZero:!0,max:100,ticks:{callback:s=>s+"%"}}}}});this._charts=this._charts||{},this._charts.scoutRankingChart=p};UI.setupStatsScoutYearSelector=function(){const e=document.getElementById("statsScoutYearSelect");if(!e)return;const a=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",v=this.getAllScoutYears?this.getAllScoutYears(this.state.activities):[a];this.selectedStatsScoutYear||(this.selectedStatsScoutYear=this.getSelectedScoutYear?this.getSelectedScoutYear():a),e.innerHTML="",v.forEach(l=>{const c=l===a?`${l} (In corso)`:`${l} (Archiviato)`,r=document.createElement("option");r.value=l,r.textContent=c,l===this.selectedStatsScoutYear&&(r.selected=!0),e.appendChild(r)});const m=document.createElement("option");m.value="all",m.textContent="Tutti gli anni (Globale)",this.selectedStatsScoutYear==="all"&&(m.selected=!0),e.appendChild(m);const i=document.getElementById("statsArchiveBadge");if(i){const l=this.selectedStatsScoutYear!=="all"&&this.selectedStatsScoutYear!==a;i.classList.toggle("hidden",!l)}e._bound||(e._bound=!0,e.addEventListener("change",async l=>{this.selectedStatsScoutYear=l.target.value,this.setSelectedScoutYear&&l.target.value!=="all"&&await this.setSelectedScoutYear(l.target.value),this.renderStatistiche()}))};UI.renderKPICards=function(e){const a=document.getElementById("kpiCards");if(!a)return;const v=this.state.activities||[],m=this.getDedupedPresences(),i=new Date;i.setHours(0,0,0,0);const l=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),h=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",c=l==="all",r=this.getScoutYearDateRange?this.getScoutYearDateRange(l):null,t=v.filter(b=>c?!0:this.isActivityInScoutYear?this.isActivityInScoutYear(b,l):!0).filter(b=>{if(l===h){const $=this.toJsDate(b.data);return $&&$<=i}return!0}),o=e.length,p=e.filter(b=>b.anag_sesso?.toLowerCase()==="maschio").length,s=e.filter(b=>b.anag_sesso?.toLowerCase()==="femmina").length;let d=0,g=0;e.forEach(b=>{t.forEach($=>{const f=m.find(x=>x.esploratoreId===b.id&&x.attivitaId===$.id);f&&(f.stato==="Presente"||f.stato==="Assente")&&(g++,f.stato==="Presente"&&d++)})});const u=g>0?Math.round(d/g*100):null,n=e.filter(b=>{let $=0;return t.forEach(f=>{const x=m.find(C=>C.esploratoreId===b.id&&C.attivitaId===f.id);x&&x.stato==="Assente"&&$++}),$>=3}).length;let y=0;e.forEach(b=>{b.specialita&&Array.isArray(b.specialita)&&b.specialita.forEach($=>{if($.ottenuta&&$.data){const f=this.toJsDate($.data);f&&(c||r&&f>=r.start&&f<=r.end)&&y++}})});const S=c?"Tutti gli anni":`Anno scout ${l}`;a.innerHTML=`
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 text-sm font-medium mb-1">Totale Esploratori</p>
          <p class="text-3xl font-bold">${o}</p>
          <p class="text-blue-100 text-xs mt-1">M: ${p} · F: ${s}</p>
        </div>
        <div class="text-4xl opacity-80">👥</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-sm font-medium mb-1">Presenza Media</p>
          <p class="text-3xl font-bold">${u!==null?u+"%":"—"}</p>
          <p class="text-green-100 text-xs mt-1">Anno scout ${S}</p>
        </div>
        <div class="text-4xl opacity-80">📊</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-red-100 text-sm font-medium mb-1">Esp. con ≥3 Assenze</p>
          <p class="text-3xl font-bold">${n}</p>
          <p class="text-red-100 text-xs mt-1">Anno scout ${S}</p>
        </div>
        <div class="text-4xl opacity-80">⚠️</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 text-sm font-medium mb-1">Specialità Ottenute</p>
          <p class="text-3xl font-bold">${y}</p>
          <p class="text-purple-100 text-xs mt-1">Anno scout ${S}</p>
        </div>
        <div class="text-4xl opacity-80">⭐</div>
      </div>
    </div>
  `};UI.renderComposizioneStats=function(e){const a={maschio:0,femmina:0,"non binario":0,"non registrato":0};e.forEach(t=>{const o=t.anag_sesso?t.anag_sesso.toLowerCase().trim():"non registrato";a.hasOwnProperty(o)?a[o]++:a["non registrato"]++});const v=document.getElementById("sessoChart");if(v){this._destroyChart("sessoChart");const t=["Maschio","Femmina","Non binario","Non registrato"],o=[a.maschio,a.femmina,a["non binario"],a["non registrato"]],p=new Chart(v,{type:"pie",data:{labels:t,datasets:[{data:o,backgroundColor:["#3b82f6","#ec4899","#a855f7","#9ca3af"]}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom"},datalabels:{color:"#fff",formatter:(s,d)=>{const g=d.dataset.data.reduce((n,y)=>n+y,0);return(g>0?Math.round(s/g*100):0)+"%"}}}},plugins:[window.ChartDataLabels]});this._charts=this._charts||{},this._charts.sessoChart=p}const m=document.getElementById("sessoStats");if(m){const t=e.length;a.maschio+a.femmina+a["non binario"],m.innerHTML=`
      <div>Maschio: ${a.maschio} (${t>0?Math.round(a.maschio/t*100):0}%)</div>
      <div>Femmina: ${a.femmina} (${t>0?Math.round(a.femmina/t*100):0}%)</div>
      <div>Non binario: ${a["non binario"]} (${t>0?Math.round(a["non binario"]/t*100):0}%)</div>
      ${a["non registrato"]>0?`<div>Non registrato: ${a["non registrato"]} (${t>0?Math.round(a["non registrato"]/t*100):0}%)</div>`:""}
    `}const i={};e.forEach(t=>{const o=this.getAnnoEsploratore(t.anag_dob);o!==null&&(i[o]=(i[o]||0)+1)});const l=Object.keys(i).sort((t,o)=>parseInt(t)-parseInt(o)),h=document.getElementById("annoChart");if(h){this._destroyChart("annoChart");const t=new Chart(h,{type:"bar",data:{labels:l.map(o=>`${o} anni`),datasets:[{label:"Numero esploratori",data:l.map(o=>i[o]),backgroundColor:"#16a34a"}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},datalabels:{color:"#fff",anchor:"end",align:"end"}},scales:{y:{beginAtZero:!0,ticks:{stepSize:1}}}},plugins:[window.ChartDataLabels]});this._charts=this._charts||{},this._charts.annoChart=t}const c=document.getElementById("annoStats");if(c){const t=e.length,o=l.length>0?(l.reduce((p,s)=>p+parseInt(s)*i[s],0)/t).toFixed(1):0;c.innerHTML=`
      <div>Età media: ${o} anni</div>
      <div>Range: ${l.length>0?`${l[0]}-${l[l.length-1]} anni`:"N/A"}</div>
    `}const r=document.getElementById("totaliStats");if(r){const t={};e.forEach(s=>{const d=s.pv_pattuglia||"Non assegnata";t[d]||(t[d]={m:0,f:0,altro:0,tot:0});const g=s.anag_sesso?.toLowerCase();t[d].tot++,g==="maschio"?t[d].m++:g==="femmina"?t[d].f++:t[d].altro++});const p=Object.keys(t).sort((s,d)=>s==="Non assegnata"?1:d==="Non assegnata"?-1:s.localeCompare(d)).map(s=>{const d=t[s],g=d.altro>0?` <span class="text-gray-400 text-xs">(+${d.altro})</span>`:"";return`<tr class="border-b">
        <td class="p-2 font-semibold">${s}</td>
        <td class="p-2 text-center">${d.tot}</td>
        <td class="p-2 text-center text-blue-600">${d.m}</td>
        <td class="p-2 text-center text-pink-500">${d.f}${g}</td>
      </tr>`}).join("");r.innerHTML=`
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b bg-gray-100">
              <th class="text-left p-2">Pattuglia</th>
              <th class="text-center p-2">Tot</th>
              <th class="text-center p-2 text-blue-600">M</th>
              <th class="text-center p-2 text-pink-500">F</th>
            </tr>
          </thead>
          <tbody>${p}</tbody>
        </table>
      </div>
    `}};UI.renderPassiStats=function(e){const a={0:0,1:0,2:0,3:0};e.forEach(n=>{let y=0;n.pv_traccia3?.done?y=3:n.pv_traccia2?.done?y=2:n.pv_traccia1?.done&&(y=1),a[y]++});const v=document.getElementById("passiEsploratoriChart");if(v){this._destroyChart("passiEsploratoriChart");const n=new Chart(v,{type:"pie",data:{labels:["Nessun Passo","Passo 1","Passo 2","Passo 3"],datasets:[{data:[a[0],a[1],a[2],a[3]],backgroundColor:["#9ca3af","#3b82f6","#16a34a","#eab308"]}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom"},datalabels:{color:"#fff",formatter:(y,S)=>{const b=S.dataset.data.reduce((f,x)=>f+x,0);return(b>0?Math.round(y/b*100):0)+"%"}}}},plugins:[window.ChartDataLabels]});this._charts=this._charts||{},this._charts.passiEsploratoriChart=n}const m=document.getElementById("passiEsploratoriStats");if(m){const n=e.length;m.innerHTML=`
      <div>Nessun Passo: ${a[0]} (${n>0?Math.round(a[0]/n*100):0}%)</div>
      <div>Passo 1: ${a[1]} (${n>0?Math.round(a[1]/n*100):0}%)</div>
      <div>Passo 2: ${a[2]} (${n>0?Math.round(a[2]/n*100):0}%)</div>
      <div>Passo 3: ${a[3]} (${n>0?Math.round(a[3]/n*100):0}%)</div>
    `}const i={1:0,2:0,3:0},l=["io","al","mt"];e.forEach(n=>{[1,2,3].forEach(y=>{l.forEach(S=>{const b=`pv_sfida_${S}_${y}_data`;n[b]&&i[y]++})})});const h=document.getElementById("passiSfideChart");if(h){this._destroyChart("passiSfideChart");const n=new Chart(h,{type:"bar",data:{labels:["Passo 1","Passo 2","Passo 3"],datasets:[{label:"Sfide completate",data:[i[1],i[2],i[3]],backgroundColor:["#3b82f6","#16a34a","#eab308"]}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},datalabels:{color:"#fff",anchor:"end",align:"end"}},scales:{y:{beginAtZero:!0,ticks:{stepSize:1}}}},plugins:[window.ChartDataLabels]});this._charts=this._charts||{},this._charts.passiSfideChart=n}const c=document.getElementById("passiSfideStats");if(c){const n=i[1]+i[2]+i[3];c.innerHTML=`
      <div>Passo 1: ${i[1]} sfide</div>
      <div>Passo 2: ${i[2]} sfide</div>
      <div>Passo 3: ${i[3]} sfide</div>
      <div class="font-semibold mt-2">Totale: ${n} sfide</div>
    `}const r=new Date;r.setHours(0,0,0,0);const t=new Date(r);r.getMonth()<8&&t.setFullYear(r.getFullYear()-1),t.setMonth(8),t.setDate(1),t.setHours(0,0,0,0);const o=`${t.getFullYear()}/${String(t.getFullYear()+1).slice(-2)}`;let p={1:0,2:0,3:0};e.forEach(n=>{[1,2,3].forEach(y=>{const S=n[`pv_traccia${y}`];if(S?.done&&S?.data){const b=this.toJsDate(S.data);b&&b>=t&&b<=r&&p[y]++}})});const s={1:0,2:0,3:0},d=["io","al","mt"];e.forEach(n=>{[1,2,3].forEach(y=>{d.forEach(S=>{const b=`pv_sfida_${S}_${y}_data`;if(n[b]){const $=this.toJsDate(n[b]);$&&$>=t&&$<=r&&s[y]++}})})});const g=s[1]+s[2]+s[3],u=document.getElementById("tempiPassiStats");if(u){const n=p[1]+p[2]+p[3];u.innerHTML=`
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500 mb-1">Passi superati</div>
        <div class="text-2xl font-bold text-blue-600">${n}</div>
        <div class="text-xs text-gray-400 mt-1">Anno scout ${o}</div>
        <div class="text-xs text-gray-500 mt-2">
          Passo 1: ${p[1]} &nbsp;|&nbsp;
          Passo 2: ${p[2]} &nbsp;|&nbsp;
          Passo 3: ${p[3]}
        </div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-500 mb-1">Sfide completate</div>
        <div class="text-2xl font-bold text-green-600">${g}</div>
        <div class="text-xs text-gray-400 mt-1">Anno scout ${o}</div>
        <div class="text-xs text-gray-500 mt-2">
          Passo 1: ${s[1]} &nbsp;|&nbsp;
          Passo 2: ${s[2]} &nbsp;|&nbsp;
          Passo 3: ${s[3]}
        </div>
      </div>
    `}};UI.renderSpecialitaStats=async function(e){await this.loadSpecialitaList();const a={};e.forEach(c=>{const r=this.getAnnoEsploratore(c.anag_dob),t=c.pv_pattuglia||"Non assegnata",o=`${r||"N/A"}_${t}`;a[o]||(a[o]={anno:r||"N/A",pattuglia:t,count:0}),c.specialita&&Array.isArray(c.specialita)&&(a[o].count+=c.specialita.filter(p=>p.ottenuta).length)});const v=document.getElementById("specialitaAnnoPattugliaBody");if(v){const c=Object.values(a).sort((r,t)=>r.anno==="N/A"?1:t.anno==="N/A"?-1:parseInt(r.anno)-parseInt(t.anno));v.innerHTML=c.map(r=>`
      <tr class="border-b">
        <td class="p-2">${r.anno}</td>
        <td class="p-2">${r.pattuglia}</td>
        <td class="p-2 text-right font-semibold">${r.count}</td>
      </tr>
    `).join("")}const m={};e.forEach(c=>{c.specialita&&Array.isArray(c.specialita)&&c.specialita.forEach(r=>{r.ottenuta&&r.nome&&(m[r.nome]=(m[r.nome]||0)+1)})});const i=Object.entries(m).sort((c,r)=>r[1]-c[1]).slice(0,5),l=e.filter(c=>!c.specialita||!Array.isArray(c.specialita)?!0:c.specialita.filter(r=>r.ottenuta).length===0),h=document.getElementById("tempiSpecialitaStats");if(h){const c=i.length>0?`<div class="bg-white p-4 rounded border">
          <div class="text-sm font-semibold text-gray-700 mb-2">🏅 Top 5 Specialità</div>
          <ol class="space-y-1">
            ${i.map(([t,o],p)=>`
              <li class="flex justify-between text-sm">
                <span>${p+1}. ${t}</span>
                <span class="font-bold text-purple-600">${o}</span>
              </li>`).join("")}
          </ol>
        </div>`:"",r=`<div class="bg-white p-4 rounded border">
      <div class="text-sm font-semibold text-gray-700 mb-2">Senza specialità <span class="font-bold text-red-500">${l.length}</span></div>
      ${l.length>0?`<ul class="text-xs text-gray-500 space-y-0.5 max-h-40 overflow-y-auto">${l.map(t=>`<li>${t.nome||""} ${t.cognome||""}</li>`).join("")}</ul>`:'<div class="text-xs text-green-600">Tutti hanno almeno una specialità! 🎉</div>'}
    </div>`;h.innerHTML=c+r}};UI.renderPattuglieTable=function(e){e?this._pattuglieTableScouts=e:e=this._pattuglieTableScouts||[],this._pattuglieSortState||(this._pattuglieSortState={field:"nome",direction:"asc"});const a={};e.forEach(t=>{const o=t.pv_pattuglia||"Non assegnata";a[o]||(a[o]=[]);const p=this.getAnnoScout(t.anag_dob);let s="-";t.pv_traccia3?.done?s="3":t.pv_traccia2?.done?s="2":t.pv_traccia1?.done&&(s="1");let d=0;t.specialita&&Array.isArray(t.specialita)&&(d=t.specialita.filter(u=>u.ottenuta).length);const g=t.pv_vcp_cp||"";a[o].push({nome:`${t.nome||""} ${t.cognome||""}`.trim()||"Nome non disponibile",annoScout:p||"N/A",cpVcp:g,passo:s,numSpecialita:d})});const v=this._pattuglieSortState.field,m=this._pattuglieSortState.direction;Object.keys(a).forEach(t=>{a[t].sort((o,p)=>{let s=0;if(v==="nome")s=o.nome.localeCompare(p.nome);else if(v==="annoScout"){const d={"I°":1,"II°":2,"III°":3,"IV°":4,"N/A":5},g=d[o.annoScout]||5,u=d[p.annoScout]||5;s=g-u,s===0&&(s=o.nome.localeCompare(p.nome))}return m==="asc"?s:-s})});const i=Object.keys(a).sort((t,o)=>t==="Non assegnata"?1:o==="Non assegnata"?-1:t.localeCompare(o)),l=document.getElementById("sortNomeIcon"),h=document.getElementById("sortAnnoScoutIcon");l&&(v==="nome"?l.textContent=m==="asc"?"↑":"↓":l.textContent="↕"),h&&(v==="annoScout"?h.textContent=m==="asc"?"↑":"↓":h.textContent="↕");const c=document.getElementById("pattuglieTableBody");if(!c)return;let r="";if(i.forEach(t=>{const o=a[t];o.forEach((p,s)=>{r+=`
        <tr class="border-b hover:bg-gray-50">
          ${s===0?`<td class="p-2 font-semibold" rowspan="${o.length}">${t}</td>`:""}
          <td class="p-2">${p.nome}</td>
          <td class="p-2">${p.annoScout}</td>
          <td class="p-2">${p.cpVcp}</td>
          <td class="p-2">${p.passo}</td>
          <td class="p-2">${p.numSpecialita}</td>
        </tr>
      `})}),c.innerHTML=r||'<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun esploratore trovato</td></tr>',!this._pattuglieSortListenersAdded){const t=document.getElementById("sortNome"),o=document.getElementById("sortAnnoScout");t&&t.addEventListener("click",()=>{this._pattuglieSortState.field==="nome"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="nome",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),o&&o.addEventListener("click",()=>{this._pattuglieSortState.field==="annoScout"?this._pattuglieSortState.direction=this._pattuglieSortState.direction==="asc"?"desc":"asc":(this._pattuglieSortState.field="annoScout",this._pattuglieSortState.direction="asc"),this.renderPattuglieTable()}),this._pattuglieSortListenersAdded=!0}};UI._destroyChart=function(e){if(this._charts)try{this._charts[e]&&(this._charts[e].destroy(),this._charts[e]=null)}catch(a){console.error("Errore distruzione grafico:",a)}};UI.renderPresenceReport=function(){const e=document.getElementById("presenceReportPeriod"),a=document.getElementById("customDateRange"),v=document.getElementById("customDateRangeEnd"),m=document.getElementById("generatePresenceReport"),i=document.getElementById("printPresenceReport"),l=document.getElementById("exportPresenceReportCSV");if(document.getElementById("presenceReportResults"),!e||!m)return;const h=document.getElementById("presenceReportPattuglia");if(h){const c=this.state.scouts||[];[...new Set(c.map(t=>t.pv_pattuglia).filter(Boolean))].sort().forEach(t=>{const o=document.createElement("option");o.value=t,o.textContent=t,h.appendChild(o)})}e.addEventListener("change",()=>{const c=e.value==="custom";a&&(a.style.display=c?"block":"none"),v&&(v.style.display=c?"block":"none")}),m.addEventListener("click",()=>{this.generatePresenceReport()}),i&&i.addEventListener("click",()=>{window.print()}),l&&l.addEventListener("click",()=>{this.exportPresenceReportCSV()})};UI.generatePresenceReport=function(){const e=document.getElementById("presenceReportPeriod")?.value||"current-month",a=document.getElementById("presenceReportPattuglia")?.value||"",v=document.getElementById("presenceReportStartDate"),m=document.getElementById("presenceReportEndDate"),i=new Date;i.setHours(0,0,0,0);let l,h;switch(e){case"scout-year-current":{const p=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",s=this.getScoutYearDateRange?this.getScoutYearDateRange(p):null;s?(l=s.start,h=s.end):(l=new Date(i.getFullYear(),8,1),h=new Date(i.getFullYear()+1,7,31));break}case"scout-year-prev":{const s=(this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026").split("/").map(Number),d=`${s[0]-1}/${s[1]-1}`,g=this.getScoutYearDateRange?this.getScoutYearDateRange(d):null;g?(l=g.start,h=g.end):(l=new Date(i.getFullYear()-1,8,1),h=new Date(i.getFullYear(),7,31));break}case"current-month":l=new Date(i.getFullYear(),i.getMonth(),1),h=new Date(i.getFullYear(),i.getMonth()+1,0);break;case"last-month":l=new Date(i.getFullYear(),i.getMonth()-1,1),h=new Date(i.getFullYear(),i.getMonth(),0);break;case"last-3-months":l=new Date(i.getFullYear(),i.getMonth()-3,1),h=i;break;case"current-year":l=new Date(i.getFullYear(),0,1),h=i;break;case"last-year":l=new Date(i.getFullYear()-1,0,1),h=new Date(i.getFullYear()-1,11,31);break;case"custom":if(!v||!m)return;l=new Date(v.value),h=new Date(m.value);break;default:l=new Date(i.getFullYear(),i.getMonth(),1),h=i}l.setHours(0,0,0,0),h.setHours(23,59,59,999);const c=(this.state.activities||[]).filter(p=>{const s=this.toJsDate(p.data);return s?s>=l&&s<=h:!1}).sort((p,s)=>this.toJsDate(p.data)-this.toJsDate(s.data));let r=this.state.scouts||[];a&&(r=r.filter(p=>p.pv_pattuglia===a));const t=this.getDedupedPresences(),o={byScout:{},byActivity:{},trend:[]};c.forEach(p=>{const s=this.toJsDate(p.data),d=s?s.toLocaleDateString("it-IT"):"";o.byActivity[p.id]={activity:p,date:d,presenti:0,assenti:0,totale:0},o.trend.push({date:s||new Date,dateKey:d,presenti:0,assenti:0})}),r.forEach(p=>{o.byScout[p.id]={scout:p,presenti:0,assenti:0,totale:0},c.forEach((s,d)=>{const g=t.find(u=>u.esploratoreId===p.id&&u.attivitaId===s.id);g&&(g.stato==="Presente"?(o.byScout[p.id].presenti++,o.byActivity[s.id].presenti++,o.trend[d]&&o.trend[d].presenti++):g.stato==="Assente"&&(o.byScout[p.id].assenti++,o.byActivity[s.id].assenti++,o.trend[d]&&o.trend[d].assenti++),(g.stato==="Presente"||g.stato==="Assente")&&(o.byScout[p.id].totale++,o.byActivity[s.id].totale++))})}),this.renderPresenceReportResults(o,l,h),this._currentPresenceReportStats=o,this._currentPresenceReportDates={startDate:l,endDate:h}};UI.renderPresenceReportResults=function(e,a,v){const m=document.getElementById("presenceReportResults"),i=document.getElementById("printPresenceReport"),l=document.getElementById("exportPresenceReportCSV");if(!m)return;m.style.display="block",i&&(i.style.display="inline-block"),l&&(l.style.display="inline-block");const h=document.getElementById("presenceTrendChart");if(h){this._destroyChart("presenceTrendChart");const u=new Chart(h,{type:"line",data:{labels:e.trend.map(n=>n.dateKey),datasets:[{label:"Presenti",data:e.trend.map(n=>n.presenti),borderColor:"#16a34a",backgroundColor:"rgba(22, 163, 74, 0.1)",tension:.4},{label:"Assenti",data:e.trend.map(n=>n.assenti),borderColor:"#dc2626",backgroundColor:"rgba(220, 38, 38, 0.1)",tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top"},tooltip:{mode:"index",intersect:!1}},scales:{y:{beginAtZero:!0,ticks:{stepSize:1}}}}});this._charts=this._charts||{},this._charts.presenceTrendChart=u}const c=document.getElementById("periodComparison");if(c){const u=e.trend.reduce((E,A)=>({presenti:E.presenti+A.presenti,assenti:E.assenti+A.assenti}),{presenti:0,assenti:0}),n=u.presenti+u.assenti,y=n>0?Math.round(u.presenti/n*100):0,S=Math.ceil((v-a)/(1e3*60*60*24)),b=new Date(a);b.setDate(b.getDate()-S-1);const $=new Date(a);$.setDate($.getDate()-1);const f=(this.state.activities||[]).filter(E=>{const A=this.toJsDate(E.data);return A?A>=b&&A<=$:!1}),x=this.getDedupedPresences(),C=f.reduce((E,A)=>{const _=x.filter(P=>P.attivitaId===A.id),Y=_.filter(P=>P.stato==="Presente").length,R=_.filter(P=>P.stato==="Assente").length;return{presenti:E.presenti+Y,assenti:E.assenti+R}},{presenti:0,assenti:0}),I=C.presenti+C.assenti,D=I>0?Math.round(C.presenti/I*100):0,w=y-D;c.innerHTML=`
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-600 mb-2">Periodo Corrente</div>
        <div class="text-2xl font-bold text-gray-700">${y}%</div>
        <div class="text-sm text-gray-500">${u.presenti} presenti / ${n} totali</div>
        <div class="text-xs text-gray-400 mt-1">${a.toLocaleDateString("it-IT")} - ${v.toLocaleDateString("it-IT")}</div>
      </div>
      <div class="bg-white p-4 rounded border">
        <div class="text-sm text-gray-600 mb-2">Periodo Precedente</div>
        <div class="text-2xl font-bold text-gray-700">${D}%</div>
        <div class="text-sm text-gray-500">${C.presenti} presenti / ${I} totali</div>
        <div class="text-xs text-gray-400 mt-1">${b.toLocaleDateString("it-IT")} - ${$.toLocaleDateString("it-IT")}</div>
      </div>
      <div class="bg-white p-4 rounded border col-span-2">
        <div class="text-sm text-gray-600 mb-2">Differenza</div>
        <div class="text-2xl font-bold ${w>=0?"text-green-600":"text-red-600"}">
          ${w>=0?"+":""}${w}%
        </div>
        <div class="text-sm text-gray-500">${w>=0?"Miglioramento":"Peggioramento"} rispetto al periodo precedente</div>
      </div>
    `}const r={};e.trend.forEach(u=>{if(!u.date)return;const n=u.date instanceof Date?u.date:new Date(u.date);if(isNaN(n))return;const y=n.toLocaleDateString("it-IT",{month:"short",year:"2-digit"});r[y]||(r[y]={presenti:0,assenti:0,order:n.getTime()}),r[y].presenti+=u.presenti,r[y].assenti+=u.assenti});const t=Object.entries(r).sort((u,n)=>u[1].order-n[1].order).map(u=>u[0]),o=t.map(u=>r[u].presenti),p=t.map(u=>r[u].assenti);let s=document.getElementById("presenceMonthlyTrendContainer");if(!s){const u=document.getElementById("presenceReportResults");if(u){const n=document.createElement("div");n.id="presenceMonthlyTrendContainer",n.className="bg-gray-50 p-6 rounded-lg shadow-inner mb-4",n.innerHTML='<h4 class="text-lg font-semibold text-gray-700 mb-4">📈 Trend Mensile Presenze</h4><div style="height:280px"><canvas id="presenceMonthlyChart"></canvas></div>',u.insertBefore(n,u.firstChild.nextSibling),s=n}}const d=document.getElementById("presenceMonthlyChart");if(d&&t.length>0){this._destroyChart("presenceMonthlyChart");const u=new Chart(d,{type:"bar",data:{labels:t,datasets:[{label:"Presenti",data:o,backgroundColor:"rgba(22,163,74,0.75)",borderRadius:6},{label:"Assenti",data:p,backgroundColor:"rgba(220,38,38,0.55)",borderRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top"},tooltip:{mode:"index",intersect:!1}},scales:{x:{stacked:!1},y:{beginAtZero:!0,ticks:{stepSize:1}}}}});this._charts=this._charts||{},this._charts.presenceMonthlyChart=u}const g=document.getElementById("presenceReportTableBody");if(g){const u=Object.values(e.byScout).map(n=>({...n,percentuale:n.totale>0?Math.round(n.presenti/n.totale*100):0})).sort((n,y)=>y.percentuale-n.percentuale);g.innerHTML=u.map(n=>{const y=n.scout.anag_nome||n.scout.nome||"",S=n.scout.anag_cognome||n.scout.cognome||"",b=n.scout.anag_pattuglia||n.scout.pv_pattuglia||"N/A",$=n.percentuale>=75?"text-green-600":n.percentuale>=60?"text-yellow-600":"text-red-600",f=n.percentuale<50?'<span class="ml-1 text-xs bg-red-100 text-red-700 rounded px-1 font-bold">⚠️ Bassa</span>':n.percentuale>=90?'<span class="ml-1 text-xs bg-green-100 text-green-700 rounded px-1 font-bold">⭐</span>':"",x=`<div class="flex items-center gap-2 justify-end">
        <div class="flex-1 max-w-16 bg-gray-200 rounded-full h-1.5" style="max-width:60px">
          <div class="h-1.5 rounded-full ${n.percentuale>=75?"bg-green-500":n.percentuale>=60?"bg-yellow-500":"bg-red-500"}" style="width:${n.percentuale}%"></div>
        </div>
        <span class="font-semibold ${$}">${n.percentuale}%${f}</span>
      </div>`;return`<tr class="border-b hover:bg-gray-50 transition-colors">
        <td class="p-2 font-medium">${y} ${S}</td>
        <td class="p-2 text-gray-600">${b}</td>
        <td class="p-2 text-right text-green-700 font-medium">${n.presenti}</td>
        <td class="p-2 text-right text-red-600">${n.assenti}</td>
        <td class="p-2 text-right text-gray-600">${n.totale}</td>
        <td class="p-2 text-right">${x}</td>
      </tr>`}).join("")}};UI.exportPresenceReportCSV=function(){if(!this._currentPresenceReportStats){this.showToast("Genera prima un report",{type:"error"});return}const e=this._currentPresenceReportStats,{startDate:a,endDate:v}=this._currentPresenceReportDates,m=["Esploratore","Pattuglia","Presenze","Assenze","Totale","% Presenze"],i=Object.values(e.byScout).map(t=>{const o=t.totale>0?Math.round(t.presenti/t.totale*100):0,p=t.scout.anag_nome||t.scout.nome||"",s=t.scout.anag_cognome||t.scout.cognome||"",d=t.scout.anag_pattuglia||t.scout.pv_pattuglia||"N/A";return[`${p} ${s}`,d,t.presenti,t.assenti,t.totale,o]}).sort((t,o)=>o[5]-t[5]),l=[m.join(","),...i.map(t=>t.map(o=>`"${o}"`).join(","))].join(`
`),h=new Blob([l],{type:"text/csv;charset=utf-8;"}),c=document.createElement("a"),r=URL.createObjectURL(h);c.setAttribute("href",r),c.setAttribute("download",`report-presenze-${a.toISOString().split("T")[0]}-${v.toISOString().split("T")[0]}.csv`),c.style.visibility="hidden",document.body.appendChild(c),c.click(),document.body.removeChild(c),this.showToast("Report esportato con successo",{type:"success"})};UI.printRepartoReport=function(){const e=this.state.scouts||[],a=this.state.activities||[],v=this.getDedupedPresences?this.getDedupedPresences():this.state.presences||[],m=new Date;m.setHours(0,0,0,0);const i=this.selectedStatsScoutYear||(this.getSelectedScoutYear?this.getSelectedScoutYear():"2025/2026"),l=this.getCurrentScoutYear?this.getCurrentScoutYear():"2025/2026",h=i==="all",c=this.getScoutYearDateRange?this.getScoutYearDateRange(i):null,r=h?"Tutti gli Anni":i,t=a.filter(f=>h?!0:this.isActivityInScoutYear?this.isActivityInScoutYear(f,i):!0).filter(f=>{if(i===l){const x=this.toJsDate(f.data);return x&&x<=m}return!0}),o=e.filter(f=>f.anag_sesso?.toLowerCase()==="maschio").length,p=e.filter(f=>f.anag_sesso?.toLowerCase()==="femmina").length;let s=0,d=0;e.forEach(f=>{t.forEach(x=>{const C=v.find(I=>I.esploratoreId===f.id&&I.attivitaId===x.id);C&&(C.stato==="Presente"||C.stato==="Assente")&&(d++,C.stato==="Presente"&&s++)})});const g=d>0?Math.round(s/d*100):null,u=f=>e.filter(x=>f===0?!x.pv_traccia1?.done&&!x.pv_traccia2?.done&&!x.pv_traccia3?.done:f===1?x.pv_traccia1?.done&&!x.pv_traccia2?.done:f===2?x.pv_traccia2?.done&&!x.pv_traccia3?.done:f===3?x.pv_traccia3?.done:!1).length,n={};e.forEach(f=>{const x=f.pv_pattuglia||"Senza pattuglia";n[x]||(n[x]={m:0,f:0,tot:0}),f.anag_sesso?.toLowerCase()==="maschio"?n[x].m++:f.anag_sesso?.toLowerCase()==="femmina"&&n[x].f++,n[x].tot++});const y=e.reduce((f,x)=>((x.specialita||[]).forEach(C=>{if(C.ottenuta&&C.nome){const I=this.toJsDate(C.data);I&&(h||c&&I>=c.start&&I<=c.end)&&(f[C.nome]=(f[C.nome]||0)+1)}}),f),{}),S=Object.entries(y).sort((f,x)=>x[1]-f[1]).slice(0,5),b=m.toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"});let $=`
    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #111; max-width: 700px; margin: 0 auto; padding: 20px;">

      <div style="text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px;">
        <div style="font-size: 20px; font-weight: 700; color: #16a34a;">🏕️ Report Reparto Scout Maori</div>
        <div style="font-size: 13px; color: #555; margin-top: 4px;">Anno Scout ${r} — Stampato il ${b}</div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700; color: #16a34a;">${e.length}</div>
          <div style="font-size: 11px; color: #555;">Esploratori</div>
          <div style="font-size: 10px; color: #777;">M: ${o} · F: ${p}</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700; color: #2563eb;">${g!==null?g+"%":"—"}</div>
          <div style="font-size: 11px; color: #555;">Presenza Media</div>
          <div style="font-size: 10px; color: #777;">Anno ${r}</div>
        </div>
        <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: 700; color: #d97706;">${t.length}</div>
          <div style="font-size: 11px; color: #555;">Attività Anno</div>
          <div style="font-size: 10px; color: #777;">Anno ${r}</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">Composizione per Pattuglia</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="text-align: left; padding: 5px 8px; border: 1px solid #e5e7eb;">Pattuglia</th>
              <th style="text-align: center; padding: 5px 8px; border: 1px solid #e5e7eb;">M</th>
              <th style="text-align: center; padding: 5px 8px; border: 1px solid #e5e7eb;">F</th>
              <th style="text-align: center; padding: 5px 8px; border: 1px solid #e5e7eb;">Tot</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(n).sort().map(([f,x])=>`
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #e5e7eb;">${f}</td>
                <td style="text-align: center; padding: 4px 8px; border: 1px solid #e5e7eb;">${x.m}</td>
                <td style="text-align: center; padding: 4px 8px; border: 1px solid #e5e7eb;">${x.f}</td>
                <td style="text-align: center; padding: 4px 8px; border: 1px solid #e5e7eb; font-weight: 600;">${x.tot}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">Avanzamento Passi</div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; text-align: center;">
          ${[["Ante Promessa",0],["Passo 1",1],["Passo 2",2],["Passo 3",3]].map(([f,x])=>`
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 5px; padding: 8px;">
              <div style="font-size: 18px; font-weight: 700;">${u(x)}</div>
              <div style="color: #555;">${f}</div>
            </div>
          `).join("")}
        </div>
      </div>

      ${S.length>0?`
      <div style="margin-bottom: 20px;">
        <div style="font-size: 14px; font-weight: 700; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 8px;">Top Specialità Anno ${r}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="text-align: left; padding: 5px 8px; border: 1px solid #e5e7eb;">Specialità</th>
              <th style="text-align: center; padding: 5px 8px; border: 1px solid #e5e7eb;">Esploratori</th>
            </tr>
          </thead>
          <tbody>
            ${S.map(([f,x])=>`
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #e5e7eb;">${f}</td>
                <td style="text-align: center; padding: 4px 8px; border: 1px solid #e5e7eb;">${x}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      `:""}

    </div>
  `;this._printHtmlInArea($,`Report Reparto Scout Maori — Anno ${r}`)};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("printRepartoBtn");e&&!e._bound&&(e._bound=!0,e.addEventListener("click",()=>{typeof UI<"u"&&UI.printRepartoReport&&UI.printRepartoReport()}))});
