// presenze.js - Logica specifica per la pagina Presenze

// Sovrascrive la funzione renderCurrentPage
UI.renderCurrentPage = function() {
  this.renderPresenceTable();
  this.setupPresenceEventListeners();
};

// UI.setupPresenceEventListeners = function() {
  // Event listeners specifici per le presenze (mobile nav)
  //const prev = this.qs('#mobileActivityPrev');
  //const next = this.qs('#mobileActivityNext');
  //const picker = this.qs('#mobileActivityPicker');
  //if (prev) prev.addEventListener('click', () => {
    //if (!picker) return;
    //const idx = Math.max(0, picker.selectedIndex - 1);
    //picker.selectedIndex = idx;
    //UI.scrollToActivityIndex(idx);
  //});
  //if (next) next.addEventListener('click', () => {
    //if (!picker) return;
    //const max = Math.max(0, (picker.options.length || 1) - 1);
    //const idx = Math.min(max, picker.selectedIndex + 1);
    //picker.selectedIndex = idx;
    //UI.scrollToActivityIndex(idx);
  //});
  //if (picker && !picker._bound) {
    //picker._bound = true;
    //picker.addEventListener('change', () => UI.scrollToActivityIndex(picker.selectedIndex));
    //}

  // Toggle Oggi/Prossima
  //const jumpBtn = this.qs('#jumpToggle');
  //if (jumpBtn && !jumpBtn._bound) {
    //jumpBtn._bound = true;
    //jumpBtn.addEventListener('click', () => {
      //const acts = UI.getActivitiesSorted();
      //if (!acts.length) return;
      //const { todayIndex, nextIndex } = UI._getTodayAndNextIndexes(acts);
      // Se il bottone dice "Vai a Prossima" -> vai a nextIndex, altrimenti vai a todayIndex
      //const target = jumpBtn.dataset.mode === 'next' ? todayIndex : nextIndex;
      //if (target >= 0) {
        //UI.scrollToActivityIndex(target);
        //const picker = UI.qs('#mobileActivityPicker');
        //if (picker) picker.selectedIndex = target;
      //}
      // toggle label e mode
      //if (jumpBtn.dataset.mode === 'next') {
        //jumpBtn.textContent = 'Vai a Prossima';
        //jumpBtn.dataset.mode = 'today';
      //} else {
        //jumpBtn.textContent = 'Vai a Oggi';
        //jumpBtn.dataset.mode = 'next';
      //}
    //});
  //}
//};

UI._getTodayAndNextIndexes = function(acts) {
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  const today = new Date(); today.setHours(0,0,0,0);
  let todayIndex = -1; let nextIndex = -1;
  acts.forEach((a, idx) => {
    const d = toDate(a.data); const dd = new Date(d); dd.setHours(0,0,0,0);
    if (dd.getTime() === today.getTime()) todayIndex = idx;
    if (nextIndex === -1 && dd >= today) nextIndex = idx;
  });
  return { todayIndex, nextIndex };
};

UI.getActivitiesSorted = function() {
  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  return [...(this.state.activities || [])].sort((a, b) => toDate(a.data) - toDate(b.data));
};

UI.getPresence = function(scoutId, activityId) {
  const key = `${scoutId}_${activityId}`;
  return this.presenceIndex?.get(key) || null;
};

UI.getDedupedPresences = function() {
  return Array.from(this.presenceIndex?.values() || []);
};

UI.formatDisplayDate = function(value) {
  const d = value && value.toDate ? value.toDate() : new Date(value);
  if (isNaN(d)) return '';
  const giorni = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
  const giorno = giorni[d.getDay()];
  const data = d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'2-digit' });
  return `${giorno} ${data}`;
};

UI._scoutSortDir = UI._scoutSortDir || 'asc';
UI._presenceTableScrollLeft = UI._presenceTableScrollLeft || 0;

UI.scrollToActivityIndex = function(index) {
  const container = this.qs('#presenceTableContainer');
  const thDates = this.qs('#tableHeaderDates');
  if (!container || !thDates) return;
  // +1 per saltare la prima colonna "Esploratore"
  const targetTh = thDates.children[index + 1];
  if (!targetTh) return;
  const left = targetTh.offsetLeft - 16; // piccolo padding
  container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
};

UI.renderPresenceTable = function() {
  const body = this.qs('#presenceTableBody');
  const thDates = this.qs('#tableHeaderDates');
  const thNames = this.qs('#tableHeaderNames');
  if (!body || !thDates || !thNames) return;

  const container = this.qs('#presenceTableContainer');
  // Nessun auto-scroll iniziale: lasciamo solo scroll manuale

  body.innerHTML = '';
  thDates.innerHTML = '<th id="thScoutName" rowspan="2" class="cursor-pointer select-none sticky left-0 !bg-green-800 !text-white !p-4 !border-r !border-white/50 text-left" title="Ordina per Esploratore">Esploratore</th>';
  thNames.innerHTML = '';

  const totalScouts = (this.state.scouts || []).length;
  const acts = this.getActivitiesSorted();

  // Calcola la prossima attività (>= oggi)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextActivityId = null;
  let nextActivityIndex = -1;
  acts.forEach((a, idx) => {
    const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
    const aday = new Date(ad); aday.setHours(0,0,0,0);
    if (nextActivityId === null && aday >= today) { nextActivityId = a.id; nextActivityIndex = idx; }
  });

  // Popola picker mobile
 // const picker = this.qs('#mobileActivityPicker');
 // if (picker) {
   // picker.innerHTML = '';
   // acts.forEach((a, idx) => {
      //const opt = document.createElement('option');
      //opt.value = a.id;
      //opt.textContent = UI.formatDisplayDate(a.data);
      //opt.dataset.index = String(idx);
      //picker.appendChild(opt);
    //});
    //picker.selectedIndex = nextActivityIndex >= 0 ? nextActivityIndex : 0;
  //}

  // Header
  acts.forEach(a => {
    const allPresences = this.getDedupedPresences();
    const activityPresences = allPresences.filter(p => p.attivitaId === a.id);
    // Escludi gli esploratori con stato "X" dal totale atteso
    const expectedCount = activityPresences.filter(p => p.stato !== 'X').length;
    const presentCount = activityPresences.filter(p => p.stato === 'Presente').length;
    const perc = expectedCount ? Math.round((presentCount / expectedCount) * 100) : 0;
    const displayDate = this.formatDisplayDate(a.data);
    const isNext = a.id === nextActivityId;
    const thDateClasses = isNext ? 'bg-green-900' : 'bg-green-800';
    const thNameClasses = isNext ? 'bg-green-900' : 'bg-green-800';
    thDates.insertAdjacentHTML('beforeend', `<th class="p-2 border-b-2 border-gray-200 ${thDateClasses} text-white font-semibold sticky top-0 border-r border-white/40"><a href="#" data-activity-id="${a.id}" class="activity-header-link text-white hover:underline cursor-pointer" title="Apri dettaglio attività">${displayDate}${isNext ? ' <span class=\"text-xs\">(Prossima)</span>' : ''}</a></th>`);
    thNames.insertAdjacentHTML('beforeend', `<th class="p-2 border-b-2 border-gray-200 ${thNameClasses} text-white font-semibold sticky top-0 border-r border-white/40"><a href="#" data-activity-id="${a.id}" class="activity-header-link text-white hover:underline cursor-pointer" title="Apri dettaglio attività">${a.tipo}</a><div class="text-xs font-normal text-white/90">${perc}% (${presentCount}/${expectedCount})</div></th>`);
  });

  // Event listeners per i link delle intestazioni
  const headerLinks = document.querySelectorAll('.activity-header-link');
  headerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const activityId = link.getAttribute('data-activity-id');
      if (activityId) {
        this.showActivityDetailModal(activityId);
      }
    });
  });

  // Sort handler su intestazione Esploratore
  const thScout = this.qs('#thScoutName');
  if (thScout && !thScout._sortBound) {
    thScout._sortBound = true;
    thScout.addEventListener('click', () => {
      this._scoutSortDir = this._scoutSortDir === 'asc' ? 'desc' : 'asc';
      this.renderPresenceTable();
    });
  }

  // Righe
  let sortedScouts = [...(this.state.scouts || [])].sort((a, b) => {
    const an = `${a.nome} ${a.cognome}`.toLowerCase();
    const bn = `${b.nome} ${b.cognome}`.toLowerCase();
    return an.localeCompare(bn);
  });
  if (this._scoutSortDir === 'desc') sortedScouts.reverse();

  sortedScouts.forEach(s => {
    // Calcola il set di attività considerate: tutte le già svolte (< oggi) + la prossima in programma
    const today = new Date(); today.setHours(0,0,0,0);
    const pastIds = acts.filter(a => {
      const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
      const aday = new Date(ad); aday.setHours(0,0,0,0);
      return aday < today;
    }).map(a => a.id);
    const consideredIds = nextActivityId ? [...pastIds, nextActivityId] : pastIds;

    const allPresences = this.getDedupedPresences();
    const validActIds = consideredIds.filter(aid => {
      const pr = allPresences.find(p => p.esploratoreId === s.id && p.attivitaId === aid);
      return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
    });
    const totalActsConsidered = validActIds.length;
    const presentCount = allPresences.filter(p => p.esploratoreId === s.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
    const perc = totalActsConsidered ? Math.round((presentCount / totalActsConsidered) * 100) : 0;
    let row = `<tr><td class=\"p-4 border-r-2 border-gray-200 bg-gray-50 font-semibold text-left sticky left-0\">${s.nome} ${s.cognome}
      <div class=\"text-xs font-normal text-gray-500\">${presentCount} / ${totalActsConsidered} (${perc}%)</div>
    </td>`;

    acts.forEach(a => {
      const presence = this.getPresence(s.id, a.id) || { stato:'NR', pagato:false, tipoPagamento:null };
      const disabled = (this.selectedStaffId && this.currentUser) ? '' : 'disabled';
      const needsPayment = parseFloat(a.costo || '0') > 0;
      const isNext = a.id === nextActivityId;
      const cellClass = isNext ? ' next-col' : '';

      row += `<td class=\"p-2 border-r border-b border-gray-200${cellClass}\">
        <div class=\"flex flex-col items-center gap-1\">
          <select class=\"presence-select\" data-selected=\"${presence.stato}\" ${disabled}
            onchange=\"UI.updatePresenceCell({field:'stato', value:this.value, scoutId:'${s.id}', activityId:'${a.id}'})\">
            <option value=\"Presente\" ${presence.stato==='Presente'?'selected':''}>P</option>
            <option value=\"Assente\" ${presence.stato==='Assente'?'selected':''}>A</option>
            <option value=\"NR\" ${presence.stato==='NR'?'selected':''}>NR</option>
            <option value=\"X\" ${presence.stato==='X'?'selected':''}>X</option>
          </select>
          ${needsPayment ? `
          <div class=\"payment-section\">
            <select class=\"payment-select mt-1\" data-selected=\"${presence.pagato ? (presence.tipoPagamento || 'Pagato') : ''}\" ${disabled}
              onchange=\"UI.updatePaymentCombined({value:this.value, scoutId:'${s.id}', activityId:'${a.id}'})\">
              <option value=\"\" ${!presence.pagato?'selected':''}>Non Pagato</option>
              <option value=\"Contanti\" ${(presence.pagato && presence.tipoPagamento==='Contanti')?'selected':''}>Contanti</option>
              <option value=\"Satispay\" ${(presence.pagato && presence.tipoPagamento==='Satispay')?'selected':''}>Satispay</option>
              <option value=\"Bonifico\" ${(presence.pagato && presence.tipoPagamento==='Bonifico')?'selected':''}>Bonifico</option>
            </select>
          </div>` : ''}
        </div>
      </td>`;
    });

    row += `</tr>`;
    body.insertAdjacentHTML('beforeend', row);
  });

  // Nessuno scroll automatico qui: l'utente usa picker/prev/next o il toggle
};

UI.showActivityDetailModal = function(activityId) {
  const activity = (this.state.activities || []).find(a => a.id === activityId);
  if (!activity) return;

  // Header
  const d = this.toJsDate(activity.data);
  const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'numeric' });
  const titleEl = this.qs('#activityDetailTitle');
  const metaEl = this.qs('#activityDetailMeta');
  if (titleEl) titleEl.textContent = `${activity.tipo || 'Attività'}${activity.descrizione ? ' — ' + activity.descrizione : ''}`;
  if (metaEl) metaEl.textContent = `${ds}${activity.costo ? ` — Costo: €${activity.costo}` : ''}`;

  // Prepara indici
  const presenze = this.getDedupedPresences().filter(p => p.attivitaId === activityId);

  // Utility: format DOB
  const fmtDob = (s) => {
    const raw = s?.anag_dob;
    if (!raw) return '';
    const date = this.toJsDate(raw);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('it-IT');
  };

  // Separa presenti/assenti
  const presenti = [];
  const assenti = [];
  const pagamenti = [];

  (this.state.scouts || []).forEach(s => {
    const p = presenze.find(x => x.esploratoreId === s.id);
    const nome = `${s.nome || ''} ${s.cognome || ''}`.trim();
    const dob = fmtDob(s);
    if (p && p.stato === 'Presente') {
      presenti.push({ nome, dob });
    } else if (p && p.stato === 'Assente') {
      assenti.push({ nome, dob });
    }
    if (p && p.pagato) {
      pagamenti.push({ nome, metodo: p.tipoPagamento || 'Pagato' });
    }
  });

  // Render liste e contatori
  const mkLi = (t) => `<li>${t}</li>`;
  const presentiList = this.qs('#presentiModalList');
  const assentiList = this.qs('#assentiModalList');
  const pagamentiList = this.qs('#pagamentiModalList');
  const presentiCount = this.qs('#presentiModalCount');
  const assentiCount = this.qs('#assentiModalCount');
  const pagamentiCount = this.qs('#pagamentiModalCount');

  if (presentiList) presentiList.innerHTML = presenti
    .sort((a,b)=>a.nome.localeCompare(b.nome))
    .map(x => mkLi(`${x.nome}${x.dob ? ' — ' + x.dob : ''}`)).join('');
  if (presentiCount) presentiCount.textContent = `${presenti.length} elementi`;

  if (assentiList) assentiList.innerHTML = assenti
    .sort((a,b)=>a.nome.localeCompare(b.nome))
    .map(x => mkLi(`${x.nome}${x.dob ? ' — ' + x.dob : ''}`)).join('');
  if (assentiCount) assentiCount.textContent = `${assenti.length} elementi`;

  if (pagamentiList) pagamentiList.innerHTML = pagamenti
    .sort((a,b)=>a.nome.localeCompare(b.nome))
    .map(x => mkLi(`${x.nome} — ${x.metodo}`)).join('');
  if (pagamentiCount) pagamentiCount.textContent = `${pagamenti.length} pagamenti`;

  // Bottoni copia
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiato negli appunti');
    } catch (e) {
      console.error('Clipboard error:', e);
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Copiato negli appunti');
    }
  };

  const copyPresentiBtn = this.qs('#copyPresentiModalBtn');
  const copyAssentiBtn = this.qs('#copyAssentiModalBtn');
  const copyPagamentiBtn = this.qs('#copyPagamentiModalBtn');

  const joinLines = (arr, mapFn) => arr
    .sort((a,b)=>a.nome.localeCompare(b.nome))
    .map(mapFn)
    .join('\n');

  if (copyPresentiBtn) {
    copyPresentiBtn.onclick = () => {
      const txt = joinLines(presenti, x => `${x.nome}${x.dob ? ' — ' + x.dob : ''}`);
      copy(txt);
    };
  }
  if (copyAssentiBtn) {
    copyAssentiBtn.onclick = () => {
      const txt = joinLines(assenti, x => `${x.nome}${x.dob ? ' — ' + x.dob : ''}`);
      copy(txt);
    };
  }
  if (copyPagamentiBtn) {
    copyPagamentiBtn.onclick = () => {
      const txt = joinLines(pagamenti, x => `${x.nome} — ${x.metodo}`);
      copy(txt);
    };
  }

  // Mostra il modale
  this.showModal('activityDetailModal');
  
  // Chiudi modale quando si clicca sul backdrop
  const modal = this.qs('#activityDetailModal');
  if (modal && !modal._backdropBound) {
    modal._backdropBound = true;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal('activityDetailModal');
      }
    });
  }
};

// Inizializza la pagina presenze
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pagina Presenze caricata');
});
