// scout.js - pagina scheda personale esploratore

UI.renderCurrentPage = function() {
  this.renderScoutPage();
};

UI.renderScoutPage = async function() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (!id) {
    this.qs('#scoutTitle').textContent = 'Scheda Esploratore — ID mancante';
    return;
  }
  this.qs('#scoutId').value = id;

  // Assicura stato caricato
  if (!this.state.scouts || this.state.scouts.length === 0) {
    this.state = await DATA.loadAll();
    this.rebuildPresenceIndex();
  }
  const s = (this.state.scouts || []).find(x => x.id === id);
  if (!s) {
    this.qs('#scoutTitle').textContent = 'Scheda Esploratore — non trovato';
    return;
  }
  this.qs('#scoutTitle').textContent = `Scheda — ${s.nome || ''} ${s.cognome || ''}`;

  // Riempie i campi se presenti
  const setVal = (sel, val) => { const el = this.qs(sel); if (el) el.value = val ?? ''; };
  setVal('#anag_nome', s.nome);
  setVal('#anag_cognome', s.cognome);
  setVal('#anag_dob', this.toYyyyMmDd(s.anag_dob));
  setVal('#anag_cf', s.anag_cf);
  setVal('#anag_indirizzo', s.anag_indirizzo);
  setVal('#anag_citta', s.anag_citta);
  setVal('#anag_email', s.anag_email);
  setVal('#anag_telefono', s.anag_telefono);

  setVal('#ct_g1_nome', s.ct_g1_nome);
  setVal('#ct_g1_tel', s.ct_g1_tel);
  setVal('#ct_g1_email', s.ct_g1_email);
  setVal('#ct_g2_nome', s.ct_g2_nome);
  setVal('#ct_g2_tel', s.ct_g2_tel);
  setVal('#ct_g2_email', s.ct_g2_email);

  setVal('#san_gruppo', s.san_gruppo);
  setVal('#san_intolleranze', s.san_intolleranze);
  setVal('#san_allergie', s.san_allergie);
  setVal('#san_farmaci', s.san_farmaci);
  setVal('#san_vaccinazioni', s.san_vaccinazioni);
  setVal('#san_cert', s.san_cert);
  setVal('#san_altro', s.san_altro);

  setVal('#pv_promessa', this.toYyyyMmDd(s.pv_promessa));
  const vcp = this.qs(`input[name="pv_vcp_cp"][value="${s.pv_vcp_cp}"]`);
  if (vcp) vcp.checked = true;
  setVal('#pv_giglio_data', this.toYyyyMmDd(s.pv_giglio_data));
  setVal('#pv_giglio_note', s.pv_giglio_note);
  setVal('#pv_pattuglia', s.pv_pattuglia);

  // Tracce principali (flag + data)
  this.setCheckDate('pv_traccia1', s.pv_traccia1);
  this.setCheckDate('pv_traccia2', s.pv_traccia2);
  this.setCheckDate('pv_traccia3', s.pv_traccia3);
  // Popola i nuovi select IO/RE/IM per ogni traccia (1..3) leggendo i campi legacy e i nuovi
  const setLevel = (cat, track, vals) => {
    const sel = this.qs(`#pv_${cat}_${track}_sel`);
    const dt = this.qs(`#pv_${cat}_${track}_dt`);
    if (!sel || !dt) return;
    const getData = (obj) => (obj?.data ? this.toYyyyMmDd(obj.data) : this.toYyyyMmDd(obj));
    
    // Prima controlla se ci sono dati nei nuovi campi pv_selected
    const newData = s.pv_selected?.[String(track)]?.[cat.toUpperCase()];
    if (newData && newData.code) {
      // Estrae il livello dal codice (es: "IO-1.3" -> "3")
      const levelMatch = newData.code.match(/\.(\d+)$/);
      if (levelMatch) {
        sel.value = levelMatch[1];
        dt.value = newData.data ? this.toYyyyMmDd(newData.data) : '';
        return;
      }
    }
    
    // Fallback: usa i campi legacy (priorità livello più alto disponibile)
    const level = vals.find(v => !!(v.obj?.done || v.obj?.data || v.obj))?.lvl || '';
    sel.value = level ? String(level) : '';
    const chosen = vals.find(v => String(v.lvl) === String(sel.value));
    dt.value = chosen ? (getData(chosen.obj) || '') : '';
  };
  setLevel('io', 1, [
    { lvl: 4, obj: s.pv_io_14 }, { lvl: 3, obj: s.pv_io_13 }, { lvl: 2, obj: s.pv_io_12 }, { lvl: 1, obj: s.pv_io_11 }
  ]);
  setLevel('re', 1, [
    { lvl: 4, obj: s.pv_re_14 }, { lvl: 3, obj: s.pv_re_13 }, { lvl: 2, obj: s.pv_re_12 }, { lvl: 1, obj: s.pv_re_11 }
  ]);
  setLevel('im', 1, [
    { lvl: 4, obj: s.pv_im_14 }, { lvl: 3, obj: s.pv_im_13 }, { lvl: 2, obj: s.pv_im_12 }, { lvl: 1, obj: s.pv_im_11 }
  ]);
  setLevel('io', 2, [
    { lvl: 4, obj: s.pv_io_24 }, { lvl: 3, obj: s.pv_io_23 }, { lvl: 2, obj: s.pv_io_22 }, { lvl: 1, obj: s.pv_io_21 }
  ]);
  setLevel('re', 2, [
    { lvl: 4, obj: s.pv_re_24 }, { lvl: 3, obj: s.pv_re_23 }, { lvl: 2, obj: s.pv_re_22 }, { lvl: 1, obj: s.pv_re_21 }
  ]);
  setLevel('im', 2, [
    { lvl: 4, obj: s.pv_im_24 }, { lvl: 3, obj: s.pv_im_23 }, { lvl: 2, obj: s.pv_im_22 }, { lvl: 1, obj: s.pv_im_21 }
  ]);
  setLevel('io', 3, [
    { lvl: 4, obj: s.pv_io_34 }, { lvl: 3, obj: s.pv_io_33 }, { lvl: 2, obj: s.pv_io_32 }, { lvl: 1, obj: s.pv_io_31 }
  ]);
  setLevel('re', 3, [
    { lvl: 4, obj: s.pv_re_34 }, { lvl: 3, obj: s.pv_re_33 }, { lvl: 2, obj: s.pv_re_32 }, { lvl: 1, obj: s.pv_re_31 }
  ]);
  setLevel('im', 3, [
    { lvl: 4, obj: s.pv_im_34 }, { lvl: 3, obj: s.pv_im_33 }, { lvl: 2, obj: s.pv_im_32 }, { lvl: 1, obj: s.pv_im_31 }
  ]);
  setVal('#pv_note', s.pv_note);
  setVal('#pv_traccia1_note', s.pv_traccia1_note);
  setVal('#pv_traccia2_note', s.pv_traccia2_note);
  setVal('#pv_traccia3_note', s.pv_traccia3_note);
  setVal('#pv_sfida_bianca_1', s.pv_sfida_bianca_1);
  setVal('#pv_sfida_bianca_2', s.pv_sfida_bianca_2);
  setVal('#pv_sfida_bianca_3', s.pv_sfida_bianca_3);

  // Carica specialità multiple
  this.loadSpecialita(s.specialita || []);

  this.setPair('#ev_ce1', s.ev_ce1);
  this.setPair('#ev_ce2', s.ev_ce2);
  this.setPair('#ev_ce3', s.ev_ce3);
  this.setPair('#ev_ce4', s.ev_ce4);
  this.setPair('#ev_ccp', s.ev_ccp);
  this.setPair('#ev_tc1', s.ev_tc1);
  this.setPair('#ev_tc2', s.ev_tc2);
  this.setPair('#ev_tc3', s.ev_tc3);
  this.setPair('#ev_tc4', s.ev_tc4);
  this.setPair('#ev_jam', s.ev_jam);
  setVal('#ev_note', s.ev_note);

  setVal('#doc_quota1', this.toYyyyMmDd(s.doc_quota1));
  setVal('#doc_quota2', this.toYyyyMmDd(s.doc_quota2));
  setVal('#doc_quota3', this.toYyyyMmDd(s.doc_quota3));
  setVal('#doc_quota4', this.toYyyyMmDd(s.doc_quota4));
  setVal('#doc_iscr', this.toYyyyMmDd(s.doc_iscr));
  setVal('#doc_san', this.toYyyyMmDd(s.doc_san));
  setVal('#doc_priv', this.toYyyyMmDd(s.doc_priv));
  setVal('#doc_note', this.toYyyyMmDd(s.doc_note));

  const form = this.qs('#scoutForm');
  if (form && !form._bound) {
    form._bound = true;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.currentUser) { alert('Devi essere loggato per salvare.'); return; }
      const payload = this.collectForm();
      await DATA.updateScout(id, payload, this.currentUser);
      this.state = await DATA.loadAll();
      this.rebuildPresenceIndex();
      UI.showToast('Scheda salvata');
    });
    this.qs('#btnAnnulla')?.addEventListener('click', () => history.back());
    
  // Gestione specialità multiple
  this.qs('#addSpecialitaBtn')?.addEventListener('click', () => this.addSpecialita());
  }
  
  // Stampa scheda / Esporta PDF
  this.qs('#printScoutBtn')?.addEventListener('click', async () => {
    await UI.printScoutSheet();
  });

  // Inizializza gestione pattuglie (sempre, non solo se il form è bound)
  this.initPattugliaManagement();
  
  // Inizializza gestione sezioni tracce espandibili
  this.initTracciaSections();
  
  // Inizializza gestione sezioni specialità espandibili
  this.initSpecialitaSections();
};

UI.loadSpecialita = function(specialitaArray) {
  const container = this.qs('#specialitaContainer');
  if (!container) return;
  container.innerHTML = '';
  specialitaArray.forEach((sp, index) => this.addSpecialita(sp, index));
};

UI.addSpecialita = function(data = null, index = null) {
  const container = this.qs('#specialitaContainer');
  if (!container) return;
  
  const realIndex = index !== null ? index : container.children.length;
  const spId = `sp_${realIndex}`;
  
  const div = document.createElement('div');
  div.className = 'bg-white rounded-lg border border-gray-200 overflow-hidden';
  div.innerHTML = `
    <!-- Header compatto -->
    <div class="specialita-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-specialita="${realIndex}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h4 class="font-semibold text-lg"><span id="${spId}_title">${(data?.nome && String(data.nome).trim()) || 'Specialità'}</span></h4>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="${spId}_ott_chk" ${data?.ottenuta ? 'checked' : ''} />
            <span>Ottenuta</span>
          </label>
          <input id="${spId}_data" type="date" class="input" value="${data?.data ? this.toYyyyMmDd(data.data) : ''}" placeholder="Data" />
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="removeSpecialitaBtn text-red-600 hover:text-red-800" data-index="${realIndex}">🗑️</button>
          <span class="expand-icon text-xl">▼</span>
        </div>
      </div>
    </div>
    <!-- Contenuto espandibile -->
    <div class="specialita-content p-4 pt-0 space-y-2">
      <div class="grid md:grid-cols-2 gap-4">
        <div class="md:col-span-2"><label class="block text-sm">Specialità</label><input id="${spId}_nome" class="input" value="${data?.nome || ''}" /></div>
        <div class="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 items-center">
          <label class="flex items-center gap-2"><input type="checkbox" id="${spId}_brev_chk" ${data?.brevetto ? 'checked' : ''} /> Brevetto</label>
          <label class="flex items-center gap-2"><input type="checkbox" id="${spId}_cons_chk" ${data?.consegnata ? 'checked' : ''} /> Consegnata</label>
        </div>
        <div class="md:col-span-2 grid grid-cols-2 gap-2">
          <label><input type="checkbox" id="${spId}_p1_chk" ${data?.p1?.done ? 'checked' : ''} /> Prova 1</label><input id="${spId}_p1_dt" type="date" class="input" value="${data?.p1?.data ? this.toYyyyMmDd(data.p1.data) : ''}" />
          <label><input type="checkbox" id="${spId}_p2_chk" ${data?.p2?.done ? 'checked' : ''} /> Prova 2</label><input id="${spId}_p2_dt" type="date" class="input" value="${data?.p2?.data ? this.toYyyyMmDd(data.p2.data) : ''}" />
          <label><input type="checkbox" id="${spId}_p3_chk" ${data?.p3?.done ? 'checked' : ''} /> Prova 3</label><input id="${spId}_p3_dt" type="date" class="input" value="${data?.p3?.data ? this.toYyyyMmDd(data.p3.data) : ''}" />
          <label><input type="checkbox" id="${spId}_cr_chk" ${data?.cr?.done ? 'checked' : ''} /> Prova CR</label><input id="${spId}_cr_dt" type="date" class="input" value="${data?.cr?.data ? this.toYyyyMmDd(data.cr.data) : ''}" />
        </div>
        <div class="md:col-span-2"><label class="block text-sm">Note</label><textarea id="${spId}_note" class="textarea">${data?.note || ''}</textarea></div>
      </div>
    </div>
  `;
  container.appendChild(div);
  
  // Event listener per rimuovere
  div.querySelector('.removeSpecialitaBtn')?.addEventListener('click', () => {
    div.remove();
    this.renumberSpecialita();
  });
  // Aggiorna titolo in grassetto con il testo digitato
  const nomeInput = div.querySelector(`#${spId}_nome`);
  const titleSpan = div.querySelector(`#${spId}_title`);
  if (nomeInput && titleSpan) {
    nomeInput.addEventListener('input', () => {
      const v = (nomeInput.value || '').trim();
      titleSpan.textContent = v || 'Specialità';
    });
  }
};

UI.renumberSpecialita = function() {
  const container = this.qs('#specialitaContainer');
  if (!container) return;
  Array.from(container.children).forEach((div, index) => {
    const btn = div.querySelector('.removeSpecialitaBtn');
    const header = div.querySelector('.specialita-header');
    if (btn) btn.dataset.index = index;
    if (header) header.dataset.specialita = index;
  });
};

UI.collectSpecialita = function() {
  const container = this.qs('#specialitaContainer');
  if (!container) return [];
  
  return Array.from(container.children).map(div => {
    const spId = div.querySelector('input[id$="_nome"]')?.id.replace('_nome', '') || '';
    const get = (suffix) => this.qs(`#${spId}${suffix}`)?.value?.trim() || '';
    const getChk = (suffix) => !!this.qs(`#${spId}${suffix}`)?.checked;
    const cd = (suffix) => ({ done: getChk(suffix), data: get(suffix) || null });
    
    return {
      nome: get('_nome'),
      ottenuta: getChk('_ott_chk'),
      brevetto: getChk('_brev_chk'),
      consegnata: getChk('_cons_chk'),
      data: get('_data') || null,
      p1: cd('_p1'),
      p2: cd('_p2'),
      p3: cd('_p3'),
      cr: cd('_cr'),
      note: get('_note')
    };
  });
};

UI.setCheckDate = function(prefix, val) {
  const data = val?.data ? this.toYyyyMmDd(val.data) : this.toYyyyMmDd(val);
  const done = val?.done ?? (val && typeof val === 'object' ? false : !!val);
  const chk = this.qs(`#${prefix}_chk`);
  const dt = this.qs(`#${prefix}_dt`);
  if (chk) chk.checked = !!done;
  if (dt) dt.value = data || '';
};

UI.setPair = function(prefix, val) {
  const dt = this.qs(`${prefix}_dt`);
  const tx = this.qs(`${prefix}_tx`);
  if (dt) dt.value = this.toYyyyMmDd(val?.data || val) || '';
  if (tx) tx.value = val?.testo || '';
};

UI.toYyyyMmDd = function(x) {
  if (!x) return '';
  const d = this.toJsDate(x);
  return isNaN(d) ? '' : d.toISOString().split('T')[0];
};

UI.collectForm = function() {
  const get = (sel) => this.qs(sel)?.value?.trim() || '';
  const getNum = (sel) => this.qs(sel)?.value || '';
  const getChk = (sel) => !!this.qs(sel)?.checked;
  const pair = (p) => ({ data: get(`${p}_dt`) || null, testo: get(`${p}_tx`) || '' });
  const cd = (p) => ({ done: getChk(`#${p}_chk`), data: get(`#${p}_dt`) || null });
  const lv = (cat, track) => ({
    level: get(`#pv_${cat}_${track}_sel`) || '',
    data: get(`#pv_${cat}_${track}_dt`) || null
  });
  const expand = (cat, track) => {
    const v = lv(cat, track);
    const payload = {};
    if (!v.level) return payload; // Non inviare nulla: non sovrascrivere valori esistenti
    const key = `pv_${cat}_${track}${String(v.level)}`;
    payload[key] = { done: true, data: v.data };
    return payload;
  };
  return {
    nome: get('#anag_nome'),
    cognome: get('#anag_cognome'),
    anag_dob: get('#anag_dob') || null,
    anag_cf: get('#anag_cf'),
    anag_indirizzo: get('#anag_indirizzo'),
    anag_citta: get('#anag_citta'),
    anag_email: get('#anag_email'),
    anag_telefono: getNum('#anag_telefono') || '',
    ct_g1_nome: get('#ct_g1_nome'),
    ct_g1_tel: getNum('#ct_g1_tel') || '',
    ct_g1_email: get('#ct_g1_email'),
    ct_g2_nome: get('#ct_g2_nome'),
    ct_g2_tel: getNum('#ct_g2_tel') || '',
    ct_g2_email: get('#ct_g2_email'),
    san_gruppo: get('#san_gruppo'),
    san_intolleranze: get('#san_intolleranze'),
    san_allergie: get('#san_allergie'),
    san_farmaci: get('#san_farmaci'),
    san_vaccinazioni: get('#san_vaccinazioni'),
    san_cert: get('#san_cert'),
    san_altro: get('#san_altro'),
    pv_promessa: get('#pv_promessa') || null,
    pv_vcp_cp: this.qs('input[name="pv_vcp_cp"]:checked')?.value || '',
    pv_giglio_data: get('#pv_giglio_data') || null,
    pv_giglio_note: get('#pv_giglio_note'),
    pv_pattuglia: get('#pv_pattuglia'),
    // Espansione nuovi selettori su campi legacy per compatibilità
    ...expand('io', 1),
    ...expand('re', 1),
    ...expand('im', 1),
    ...expand('io', 2),
    ...expand('re', 2),
    ...expand('im', 2),
    ...expand('io', 3),
    ...expand('re', 3),
    ...expand('im', 3),
    pv_note: get('#pv_note'),
    pv_traccia1_note: get('#pv_traccia1_note'),
    pv_traccia2_note: get('#pv_traccia2_note'),
    pv_traccia3_note: get('#pv_traccia3_note'),
    pv_sfida_bianca_1: get('#pv_sfida_bianca_1'),
    pv_sfida_bianca_2: get('#pv_sfida_bianca_2'),
    pv_sfida_bianca_3: get('#pv_sfida_bianca_3'),
    specialita: this.collectSpecialita(),
    ev_ce1: pair('#ev_ce1'), ev_ce2: pair('#ev_ce2'), ev_ce3: pair('#ev_ce3'), ev_ce4: pair('#ev_ce4'),
    ev_ccp: pair('#ev_ccp'), ev_tc1: pair('#ev_tc1'), ev_tc2: pair('#ev_tc2'), ev_tc3: pair('#ev_tc3'), ev_tc4: pair('#ev_tc4'),
    ev_jam: pair('#ev_jam'), ev_note: get('#ev_note'),
    pv_traccia1: cd('pv_traccia1'), pv_traccia2: cd('pv_traccia2'), pv_traccia3: cd('pv_traccia3'),
    // Selezioni esplicite per progressione verticale (traccia, codice, data)
    pv_selected: {
      '1': {
        IO: (() => { const v = lv('io', 1); return { track: 1, code: v.level ? `IO-1.${v.level}` : null, data: v.data || null }; })(),
        RE: (() => { const v = lv('re', 1); return { track: 1, code: v.level ? `RE-1.${v.level}` : null, data: v.data || null }; })(),
        IM: (() => { const v = lv('im', 1); return { track: 1, code: v.level ? `IM-1.${v.level}` : null, data: v.data || null }; })(),
      },
      '2': {
        IO: (() => { const v = lv('io', 2); return { track: 2, code: v.level ? `IO-2.${v.level}` : null, data: v.data || null }; })(),
        RE: (() => { const v = lv('re', 2); return { track: 2, code: v.level ? `RE-2.${v.level}` : null, data: v.data || null }; })(),
        IM: (() => { const v = lv('im', 2); return { track: 2, code: v.level ? `IM-2.${v.level}` : null, data: v.data || null }; })(),
      },
      '3': {
        IO: (() => { const v = lv('io', 3); return { track: 3, code: v.level ? `IO-3.${v.level}` : null, data: v.data || null }; })(),
        RE: (() => { const v = lv('re', 3); return { track: 3, code: v.level ? `RE-3.${v.level}` : null, data: v.data || null }; })(),
        IM: (() => { const v = lv('im', 3); return { track: 3, code: v.level ? `IM-3.${v.level}` : null, data: v.data || null }; })(),
      },
    },
    doc_quota1: get('#doc_quota1') || null, doc_quota2: get('#doc_quota2') || null,
    doc_quota3: get('#doc_quota3') || null, doc_quota4: get('#doc_quota4') || null,
    doc_iscr: get('#doc_iscr') || null, doc_san: get('#doc_san') || null,
    doc_priv: get('#doc_priv') || null, doc_note: get('#doc_note'),
  };
};

// ============== Gestione Pattuglie ==============
UI.initPattugliaManagement = function() {
  console.log('Inizializzazione gestione pattuglie...');
  // Carica le pattuglie dal localStorage o usa quelle di default
  this.pattuglie = JSON.parse(localStorage.getItem('pattuglie') || '["Aironi", "Marmotte"]');
  this.updatePattugliaSelect();
  
  // Event listeners per il modal
  this.qs('#managePattugliaBtn')?.addEventListener('click', () => this.openPattugliaModal());
  this.qs('#closePattugliaModal')?.addEventListener('click', () => this.closePattugliaModal());
  this.qs('#cancelPattugliaBtn')?.addEventListener('click', () => this.closePattugliaModal());
  this.qs('#savePattugliaBtn')?.addEventListener('click', () => this.savePattuglie());
  this.qs('#addPattugliaBtn')?.addEventListener('click', () => this.addPattuglia());
  
  // Chiudi modal cliccando fuori
  this.qs('#pattugliaModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'pattugliaModal') this.closePattugliaModal();
  });
};

UI.updatePattugliaSelect = function() {
  const select = this.qs('#pv_pattuglia');
  if (!select) return;
  
  // Salva il valore attuale
  const currentValue = select.value;
  
  // Pulisce le opzioni (mantiene la prima "Seleziona...")
  select.innerHTML = '<option value="">Seleziona pattuglia...</option>';
  
  // Aggiunge le pattuglie
  this.pattuglie.forEach(pattuglia => {
    const option = document.createElement('option');
    option.value = pattuglia;
    option.textContent = pattuglia;
    select.appendChild(option);
  });
  
  // Ripristina il valore selezionato
  if (currentValue && this.pattuglie.includes(currentValue)) {
    select.value = currentValue;
  }
};

UI.openPattugliaModal = function() {
  console.log('Apertura modal pattuglie...');
  this.renderPattugliaList();
  const modal = this.qs('#pattugliaModal');
  console.log('Modal trovato:', modal);
  if (modal) {
    modal.classList.add('show');
    console.log('Classe show aggiunta');
  }
};

UI.closePattugliaModal = function() {
  this.qs('#pattugliaModal').classList.remove('show');
  this.qs('#newPattugliaInput').value = '';
};

UI.renderPattugliaList = function() {
  const container = this.qs('#pattugliaList');
  if (!container) return;
  
  container.innerHTML = '';
  
  this.pattuglie.forEach((pattuglia, index) => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between p-2 bg-gray-50 rounded border';
    div.innerHTML = `
      <input type="text" value="${pattuglia}" class="input flex-1 mr-2" data-index="${index}" />
      <button type="button" class="btn-secondary px-2 py-1 text-red-600 hover:text-red-800" onclick="UI.removePattuglia(${index})">
        🗑️
      </button>
    `;
    container.appendChild(div);
  });
};

UI.addPattuglia = function() {
  const input = this.qs('#newPattugliaInput');
  const nome = input.value.trim();
  
  if (!nome) {
    alert('Inserisci un nome per la pattuglia');
    return;
  }
  
  if (this.pattuglie.includes(nome)) {
    alert('Questa pattuglia esiste già');
    return;
  }
  
  this.pattuglie.push(nome);
  this.renderPattugliaList();
  input.value = '';
};

UI.removePattuglia = function(index) {
  if (this.pattuglie.length <= 1) {
    alert('Deve rimanere almeno una pattuglia');
    return;
  }
  
  if (confirm('Sei sicuro di voler rimuovere questa pattuglia?')) {
    this.pattuglie.splice(index, 1);
    this.renderPattugliaList();
  }
};

UI.savePattuglie = function() {
  // Aggiorna le pattuglie con i valori modificati
  const inputs = this.qs('#pattugliaList').querySelectorAll('input[type="text"]');
  const newPattuglie = [];
  
  inputs.forEach(input => {
    const value = input.value.trim();
    if (value && !newPattuglie.includes(value)) {
      newPattuglie.push(value);
    }
  });
  
  if (newPattuglie.length === 0) {
    alert('Deve rimanere almeno una pattuglia');
    return;
  }
  
  this.pattuglie = newPattuglie;
  localStorage.setItem('pattuglie', JSON.stringify(this.pattuglie));
  this.updatePattugliaSelect();
  this.closePattugliaModal();
  alert('Pattuglie salvate con successo!');
};

// ============== Gestione Sezioni Tracce Espandibili ==============
UI.initTracciaSections = function() {
  console.log('Inizializzazione sezioni tracce espandibili...');
  
  // Evita di aggiungere più event listener
  if (this._tracciaSectionsInitialized) {
    console.log('Sezioni tracce già inizializzate');
    return;
  }
  
  // Usa event delegation per gestire i click sui header tracce
  const container = document.querySelector('#scoutForm') || document.body;
  
  container.addEventListener('click', (e) => {
    // Verifica se il click è su un header traccia
    const header = e.target.closest('.traccia-header');
    if (!header) return;
    
    console.log('Click su header traccia:', header.dataset.traccia);
    
    // Non espandere se si clicca su checkbox o input
    if (e.target.type === 'checkbox' || e.target.type === 'date') {
      console.log('Click su input, ignorato');
      return;
    }
    
    const tracciaNum = header.dataset.traccia;
    console.log('Toggling traccia:', tracciaNum);
    this.toggleTracciaSection(tracciaNum);
  });
  
  this._tracciaSectionsInitialized = true;
  console.log('Event delegation configurato per sezioni tracce');
  
  // Test: verifica che gli elementi esistano
  const headers = document.querySelectorAll('.traccia-header');
  console.log('Header tracce trovati:', headers.length);
  headers.forEach((h, i) => {
    console.log(`Header ${i + 1}:`, h.dataset.traccia, h);
  });
  
  // Test manuale: espandi la prima traccia per verificare che funzioni
  console.log('Test manuale: espandendo Traccia 1...');
  setTimeout(() => {
    const testContent = document.querySelector('.traccia-content');
    if (testContent) {
      console.log('Test: aggiungendo classe expanded...');
      testContent.classList.add('expanded');
      console.log('Classi dopo test:', testContent.className);
    } else {
      console.log('Test: nessun contenuto traccia trovato');
    }
  }, 500);
};

// ============== Gestione Sezioni Specialità Espandibili ==============
UI.initSpecialitaSections = function() {
  console.log('Inizializzazione sezioni specialità espandibili...');
  
  // Evita di aggiungere più event listener
  if (this._specialitaSectionsInitialized) {
    console.log('Sezioni specialità già inizializzate');
    return;
  }
  
  // Usa event delegation per gestire i click sui header delle specialità
  const container = document.querySelector('#specialitaContainer') || document.body;
  
  container.addEventListener('click', (e) => {
    // Verifica se il click è su un header specialità
    const header = e.target.closest('.specialita-header');
    if (!header) return;
    
    console.log('Click su header specialità:', header.dataset.specialita);
    
    // Non espandere se si clicca su checkbox, input o button
    if (e.target.type === 'checkbox' || e.target.type === 'date' || e.target.classList.contains('removeSpecialitaBtn')) {
      console.log('Click su input/button, ignorato');
      return;
    }
    
    const specialitaIndex = header.dataset.specialita;
    console.log('Toggling specialità:', specialitaIndex);
    this.toggleSpecialitaSection(specialitaIndex);
  });
  
  this._specialitaSectionsInitialized = true;
  console.log('Event delegation configurato per sezioni specialità');
  
  // Test: verifica che gli elementi esistano
  const headers = document.querySelectorAll('.specialita-header');
  console.log('Header specialità trovati:', headers.length);
  headers.forEach((h, i) => {
    console.log(`Header specialità ${i + 1}:`, h.dataset.specialita, h);
  });
};

UI.toggleSpecialitaSection = function(specialitaIndex) {
  console.log('toggleSpecialitaSection chiamata per specialità:', specialitaIndex);
  
  const header = document.querySelector(`.specialita-header[data-specialita="${specialitaIndex}"]`);
  const content = header?.nextElementSibling;
  const icon = header?.querySelector('.expand-icon');
  
  console.log('Elementi trovati:', { header: !!header, content: !!content, icon: !!icon });
  
  if (!header || !content || !icon) {
    console.error('Elementi non trovati per specialità:', specialitaIndex);
    return;
  }
  
  const isExpanded = content.classList.contains('expanded');
  console.log('Stato attuale - espanso:', isExpanded);
  
  if (isExpanded) {
    // Contrai
    console.log('Contraendo sezione specialità...');
    content.classList.remove('expanded');
    icon.classList.remove('rotated');
  } else {
    // Espandi
    console.log('Espandendo sezione specialità...');
    content.classList.add('expanded');
    icon.classList.add('rotated');
  }
  
  console.log('Classi finali content:', content.className);
  console.log('Classi finali icon:', icon.className);
};

UI.toggleTracciaSection = function(tracciaNum) {
  console.log('toggleTracciaSection chiamata per traccia:', tracciaNum);
  
  const header = document.querySelector(`.traccia-header[data-traccia="${tracciaNum}"]`);
  const content = header?.nextElementSibling;
  const icon = header?.querySelector('.expand-icon');
  
  console.log('Elementi trovati:', { header: !!header, content: !!content, icon: !!icon });
  
  if (!header || !content || !icon) {
    console.error('Elementi non trovati per traccia:', tracciaNum);
    return;
  }
  
  const isExpanded = content.classList.contains('expanded');
  console.log('Stato attuale - espanso:', isExpanded);
  
  if (isExpanded) {
    // Contrai
    console.log('Contraendo sezione...');
    content.classList.remove('expanded');
    icon.classList.remove('rotated');
  } else {
    // Espandi
    console.log('Espandendo sezione...');
    content.classList.add('expanded');
    icon.classList.add('rotated');
  }
  
  console.log('Classi finali content:', content.className);
  console.log('Classi finali icon:', icon.className);
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scheda Esploratore caricata');
});

UI.printScoutSheet = async function() {
  try {
    const data = this.collectForm();
    const tracks = [
      { n: 1, done: this.qs('#pv_traccia1_chk')?.checked, ioSel: '#pv_io_1_sel', ioDt: '#pv_io_1_dt', reSel: '#pv_re_1_sel', reDt: '#pv_re_1_dt', imSel: '#pv_im_1_sel', imDt: '#pv_im_1_dt' },
      { n: 2, done: this.qs('#pv_traccia2_chk')?.checked, ioSel: '#pv_io_2_sel', ioDt: '#pv_io_2_dt', reSel: '#pv_re_2_sel', reDt: '#pv_re_2_dt', imSel: '#pv_im_2_sel', imDt: '#pv_im_2_dt' },
      { n: 3, done: this.qs('#pv_traccia3_chk')?.checked, ioSel: '#pv_io_3_sel', ioDt: '#pv_io_3_dt', reSel: '#pv_re_3_sel', reDt: '#pv_re_3_dt', imSel: '#pv_im_3_sel', imDt: '#pv_im_3_dt' }
    ];
    const read = (sel) => (this.qs(sel)?.value || '').trim();
    const nextTrack = tracks.find(t => !t.done) || tracks[tracks.length - 1];
    const trackModel = {
      n: nextTrack.n,
      IO: { level: read(nextTrack.ioSel), data: read(nextTrack.ioDt) },
      RE: { level: read(nextTrack.reSel), data: read(nextTrack.reDt) },
      IM: { level: read(nextTrack.imSel), data: read(nextTrack.imDt) },
    };
    const allSpecs = data.specialita || [];
    const specsObtained = allSpecs.filter(sp => sp.ottenuta);
    const specsInProgress = allSpecs.filter(sp => !sp.ottenuta);

    let desc = { progressioni: {}, specialita: {} };
    try {
      const res = await fetch('descriptions.json', { cache: 'no-store' });
      desc = await res.json();
    } catch (e) {
      console.warn('Impossibile caricare descriptions.json', e);
    }
    const getTrackTheme = (trackNum) => {
      const ioBranch = desc.progressioni?.IO?.[String(trackNum)];
      return (typeof ioBranch === 'object' && ioBranch?.tema) ? ioBranch.tema : '';
    };
    const getDirectionChallenge = (abbr, trackNum, level) => {
      if (!level) return null;
      const key = String(abbr || '').toUpperCase();
      const branch = desc.progressioni?.[key]?.[String(trackNum)];
      const code = `${key}-${trackNum}.${level}`;
      const sfide = Array.isArray(branch?.sfide) ? branch.sfide : [];
      const found = sfide.find(s => String(s.codice || '').toUpperCase() === code);
      return found ? { code, direzione: found.direzione || '', testo: found.testo || '' } : { code, direzione: '', testo: '' };
    };
    const getSpecText = (nome, provaKey) => {
      const norm = (s) => (s || '').toString().trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
      const target = norm(nome);
      // Match diretto
      let spec = desc.specialita?.[nome];
      if (!spec) {
        // Match case-insensitive + accent/whitespace tolerant
        const entry = Object.entries(desc.specialita || {}).find(([k]) => norm(k) === target);
        if (!entry) {
          // fallback: include/startsWith for nomi parziali
          const entry2 = Object.entries(desc.specialita || {}).find(([k]) => norm(k).includes(target) || target.includes(norm(k)));
          if (entry2) spec = entry2[1];
        } else {
          spec = entry[1];
        }
      }
      return (spec?.[provaKey] || '');
    };

    const lines = [];
    lines.push(`<div class="print-section"><div class="print-title"><strong>Il Sentiero di ${data.nome || ''} ${data.cognome || ''}</strong></div></div>`);
    const theme = getTrackTheme(trackModel.n);
    lines.push(`<div class="print-section"><div class="print-subtitle"><strong>STAI PERCORRENDO LA ${trackModel.n} TRACCIA</strong></div>`);
    if (theme) lines.push(`<div class="print-box" style="margin-bottom:8px"><em>${theme}</em></div>`);
    ['IO','RE','IM'].forEach(key => {
      const lv = trackModel[key].level || '';
      if (!lv) return;
      const dt = trackModel[key].data ? new Date(trackModel[key].data).toLocaleDateString('it-IT') : '';
      const ch = getDirectionChallenge(key, trackModel.n, lv);
      lines.push(`<div class="print-box" style="margin-bottom:8px">`);
      // Codice con direzione sulla stessa riga
      lines.push(`<div><strong>${ch?.code || (key + '-' + trackModel.n + '.' + lv)}</strong> — ${ch?.direzione || ''}${dt ? ' — ' + dt : ''}</div>`);
      // Testo sulla riga sotto
      if (ch?.testo) lines.push(`<div>${ch.testo}</div>`);
      lines.push(`</div>`);
    });
    lines.push(`</div>`);

    // Specialità ottenute
    lines.push(`<div class="print-section"><div class="print-subtitle"><strong>SPECIALITA' OTTENUTE</strong></div>`);
    if (!specsObtained.length) {
      lines.push(`<div class="print-box">Nessuna</div>`);
    } else {
      const obtainedNames = specsObtained.map(sp => sp.nome || 'Specialità').join(', ');
      lines.push(`<div class="print-box">${obtainedNames}</div>`);
    }
    lines.push(`</div>`);

    // Specialità in conseguimento
    lines.push(`<div class="print-section"><div class="print-subtitle"><strong>SPECIALITA' DA CONQUISTARE</strong></div>`);
    if (!specsInProgress.length) {
      lines.push(`<div class="print-box">Nessuna</div>`);
    } else {
      specsInProgress.forEach(sp => {
        lines.push(`<div class="print-box" style="margin-bottom:12px"><strong>${sp.nome || 'Specialità'}</strong>`);
        const parts = [];
        ['p1','p2','p3'].forEach(k => { // Rimossi PS e CR
          const prova = sp[k] || {};
          if (!prova.done) {
            const d = prova.data ? new Date(prova.data).toLocaleDateString('it-IT') : '';
            const t = getSpecText(sp.nome || '', k);
            // Codice prova con data sulla stessa riga
            parts.push(`<div><strong>${k.toUpperCase()}</strong>${d ? ' — ' + d : ''}</div>`);
            // Descrizione della prova sulla riga sotto
            if (t) parts.push(`<div style="margin-left: 10px; margin-bottom: 8px;">${t}</div>`);
          }
        });
        lines.push(parts.join('') || '<div>Tutte le prove completate.</div>');
        lines.push(`</div>`);
      });
    }
    lines.push(`</div>`);

    const pa = this.qs('#printArea');
    if (pa) pa.innerHTML = lines.join('');
    window.print();
  } catch (e) {
    console.error('Errore generazione stampa:', e);
  }
};