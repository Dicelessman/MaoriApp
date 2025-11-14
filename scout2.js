// scout2.js - pagina scheda personale esploratore (versione refactored)

// Cache per i dati JSON
UI.challengesData = null;
UI.specialitaListData = null;

// Carica challenges.json
UI.loadChallenges = async function() {
  if (this.challengesData) return this.challengesData;
  try {
    const response = await fetch('challenges.json');
    this.challengesData = await response.json();
    return this.challengesData;
  } catch (e) {
    console.error('Errore caricamento challenges.json:', e);
    return {};
  }
};

// Carica specialita.json
UI.loadSpecialitaList = async function() {
  if (this.specialitaListData) return this.specialitaListData;
  try {
    const response = await fetch('specialita.json');
    this.specialitaListData = await response.json();
    return this.specialitaListData;
  } catch (e) {
    console.error('Errore caricamento specialita.json:', e);
    return [];
  }
};

// Funzione per adattare l'altezza del textarea al contenuto
UI.autoResizeTextarea = function(textarea) {
  if (!textarea) return;
  // Reset height per ottenere scrollHeight corretto
  textarea.style.height = 'auto';
  // Imposta l'altezza in base al contenuto
  textarea.style.height = textarea.scrollHeight + 'px';
};

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

  // Carica i JSON all'inizio
  await this.loadChallenges();
  await this.loadSpecialitaList();

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

  // Popola dropdown sfide e carica dati
  this.populateChallengeDropdowns();
  this.loadChallengeData(s);
  
  // Adatta l'altezza dei textarea dopo il caricamento
  setTimeout(() => {
    const direzioni = ['io', 're', 'im'];
    const passi = ['1', '2', '3'];
    passi.forEach(passo => {
      direzioni.forEach(dir => {
        const textarea = this.qs(`#pv_sfida_${dir}_${passo}_text`);
        if (textarea) this.autoResizeTextarea(textarea);
      });
    });
  }, 200);

  setVal('#pv_note', s.pv_note);
  setVal('#pv_traccia1_note', s.pv_traccia1_note);
  setVal('#pv_traccia2_note', s.pv_traccia2_note);
  setVal('#pv_traccia3_note', s.pv_traccia3_note);
  
  // Adatta l'altezza dei textarea "note" dopo il caricamento
  setTimeout(() => {
    const noteTextareas = ['pv_note', 'pv_traccia1_note', 'pv_traccia2_note', 'pv_traccia3_note', 'ev_note', 'doc_note'];
    noteTextareas.forEach(id => {
      const textarea = this.qs(`#${id}`);
      if (textarea) this.autoResizeTextarea(textarea);
    });
  }, 250);
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

// Popola i dropdown delle sfide da challenges.json
UI.populateChallengeDropdowns = function() {
  const challenges = this.challengesData;
  if (!challenges) return;

  const direzioni = ['io', 're', 'im'];
  const passi = ['1', '2', '3'];

  passi.forEach(passo => {
    direzioni.forEach(dir => {
      const selectId = `#pv_sfida_${dir}_${passo}`;
      const select = this.qs(selectId);
      if (!select) return;

      const dirUpper = dir.toUpperCase();
      const sfide = challenges[passo]?.[dirUpper] || [];
      
      // Pulisce le opzioni esistenti (mantiene la prima)
      select.innerHTML = '<option value="">Seleziona sfida...</option>';
      
      // Aggiunge le sfide
      sfide.forEach(sfida => {
        const option = document.createElement('option');
        option.value = sfida.code;
        option.textContent = sfida.code;
        select.appendChild(option);
      });

      // Event listener per mostrare il testo della sfida
      select.addEventListener('change', () => {
        const selectedCode = select.value;
        const textarea = this.qs(`#pv_sfida_${dir}_${passo}_text`);
        if (textarea) {
          const selectedSfida = sfide.find(s => s.code === selectedCode);
          textarea.value = selectedSfida ? selectedSfida.text : '';
          // Adatta l'altezza al contenuto
          this.autoResizeTextarea(textarea);
        }
      });
    });
  });
};

// Carica i dati delle sfide salvate
UI.loadChallengeData = function(s) {
  const direzioni = ['io', 're', 'im'];
  const passi = ['1', '2', '3'];

  passi.forEach(passo => {
    direzioni.forEach(dir => {
      const codeKey = `pv_sfida_${dir}_${passo}`;
      const dataKey = `pv_sfida_${dir}_${passo}_data`;
      const textKey = `pv_sfida_${dir}_${passo}_text`;

      const code = s[codeKey];
      const data = s[dataKey];
      const select = this.qs(`#pv_sfida_${dir}_${passo}`);
      const dateInput = this.qs(`#${dataKey}`);
      const textarea = this.qs(`#${textKey}`);

      if (select && code) {
        select.value = code;
        // Trigger change per aggiornare il testo
        select.dispatchEvent(new Event('change'));
        // Adatta l'altezza del textarea dopo il cambio
        setTimeout(() => {
          const textarea = this.qs(`#${textKey}`);
          if (textarea) this.autoResizeTextarea(textarea);
        }, 100);
      }
      if (dateInput && data) {
        dateInput.value = this.toYyyyMmDd(data);
      }
    });
  });
};

UI.loadSpecialita = function(specialitaArray) {
  const container = this.qs('#specialitaContainer');
  if (!container) return;
  container.innerHTML = '';
  specialitaArray.forEach((sp, index) => this.addSpecialita(sp, index));
};

// Funzione helper per applicare i colori al container della specialità
UI.applySpecialitaColors = function(containerDiv, specialita) {
  if (!containerDiv) return;
  
  // Colori di default se non specificati
  const defaultSfondo = 'white';
  const defaultBordo = 'gray';
  
  // Ottieni i colori dalla specialità o usa i default
  const sfondoColore = specialita?.sfondo_colore || defaultSfondo;
  const bordoColore = specialita?.bordo_colore || defaultBordo;
  
  // Applica gli stili inline
  containerDiv.style.backgroundColor = sfondoColore;
  containerDiv.style.border = `3px solid ${bordoColore}`;
  containerDiv.style.borderRadius = '0.5rem'; // rounded-lg
  containerDiv.style.overflow = 'hidden';
};

UI.addSpecialita = async function(data = null, index = null) {
  const container = this.qs('#specialitaContainer');
  if (!container) return;
  
  const realIndex = index !== null ? index : container.children.length;
  const spId = `sp_${realIndex}`;
  
  // Carica la lista delle specialità
  const specialitaList = await this.loadSpecialitaList();
  
  // Trova la specialità selezionata per ottenere i nomi delle prove
  const selectedSpec = data?.nome ? specialitaList.find(s => s.nome === data.nome) : null;
  const prove = selectedSpec?.prove || [
    { nome: 'Prova 1', id: 'p1' },
    { nome: 'Prova 2', id: 'p2' },
    { nome: 'Prova 3', id: 'p3' }
  ];
  
  const div = document.createElement('div');
  div.className = 'rounded-lg overflow-hidden';
  // Applica i colori dinamicamente
  this.applySpecialitaColors(div, selectedSpec);
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
        <div class="md:col-span-2">
          <label class="block text-sm">Specialità</label>
          <select id="${spId}_nome" class="input">
            <option value="">Seleziona specialità...</option>
            ${specialitaList.map(spec => `<option value="${spec.nome}" ${data?.nome === spec.nome ? 'selected' : ''}>${spec.nome}</option>`).join('')}
          </select>
        </div>
        <div class="md:col-span-2 space-y-2">
          ${prove.map((prova, idx) => `
            <div class="space-y-1">
              <div class="grid grid-cols-2 gap-2">
                <label class="block text-sm">${prova.nome}</label>
                <input id="${spId}_${prova.id}_data" type="date" class="input" value="${data?.[`${prova.id}_data`] ? this.toYyyyMmDd(data[`${prova.id}_data`]) : ''}" />
              </div>
              <textarea id="${spId}_${prova.id}_text" class="textarea text-sm textarea-auto-resize" readonly placeholder="Testo della prova...">${prova.text || ''}</textarea>
            </div>
          `).join('')}
        </div>
        <div class="md:col-span-2 grid grid-cols-2 gap-2">
          <label class="block text-sm">Prova CR</label>
          <input id="${spId}_cr_text" type="text" class="input" value="${data?.cr_text || ''}" placeholder="Testo prova CR" />
          <label class="block text-sm">Data Prova CR</label>
          <input id="${spId}_cr_data" type="date" class="input" value="${data?.cr_data ? this.toYyyyMmDd(data.cr_data) : ''}" />
        </div>
        <div class="md:col-span-2"><label class="block text-sm">Note</label><textarea id="${spId}_note" class="textarea textarea-auto-resize">${data?.note || ''}</textarea></div>
      </div>
    </div>
  `;
  container.appendChild(div);
  
  // Adatta l'altezza dei textarea delle prove dopo il rendering
  setTimeout(() => {
    prove.forEach((prova) => {
      const textarea = div.querySelector(`#${spId}_${prova.id}_text`);
      if (textarea) this.autoResizeTextarea(textarea);
    });
    // Adatta anche il textarea "note" della specialità
    const noteTextarea = div.querySelector(`#${spId}_note`);
    if (noteTextarea) this.autoResizeTextarea(noteTextarea);
  }, 50);
  
  // Event listener per rimuovere
  div.querySelector('.removeSpecialitaBtn')?.addEventListener('click', () => {
    div.remove();
    this.renumberSpecialita();
  });
  
  // Aggiorna titolo quando cambia la specialità selezionata
  const nomeSelect = div.querySelector(`#${spId}_nome`);
  const titleSpan = div.querySelector(`#${spId}_title`);
  if (nomeSelect && titleSpan) {
    nomeSelect.addEventListener('change', async () => {
      const v = nomeSelect.value || '';
      titleSpan.textContent = v || 'Specialità';
      
      // Aggiorna i nomi e i testi delle prove quando cambia la specialità
      const specialitaList = await this.loadSpecialitaList();
      const selectedSpec = specialitaList.find(s => s.nome === v);
      
      // Aggiorna i colori del container quando cambia la specialità
      this.applySpecialitaColors(div, selectedSpec);
      
      if (selectedSpec && selectedSpec.prove) {
        selectedSpec.prove.forEach((prova) => {
          // Trova il label che precede l'input della data
          const dataInput = div.querySelector(`#${spId}_${prova.id}_data`);
          if (dataInput) {
            // Il label è il sibling precedente nel grid
            let prev = dataInput.previousElementSibling;
            while (prev && prev.tagName !== 'LABEL') {
              prev = prev.previousElementSibling;
            }
            if (prev && prev.tagName === 'LABEL') {
              prev.textContent = prova.nome;
            }
          }
          // Aggiorna il testo della prova
          const textarea = div.querySelector(`#${spId}_${prova.id}_text`);
          if (textarea) {
            textarea.value = prova.text || '';
            // Adatta l'altezza al contenuto
            this.autoResizeTextarea(textarea);
          }
        });
      }
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
    const spId = div.querySelector('select[id$="_nome"]')?.id.replace('_nome', '') || '';
    const get = (suffix) => this.qs(`#${spId}${suffix}`)?.value?.trim() || '';
    
    return {
      nome: get('_nome'),
      ottenuta: !!this.qs(`#${spId}_ott_chk`)?.checked,
      data: get('_data') || null,
      p1_data: get('_p1_data') || null,
      p2_data: get('_p2_data') || null,
      p3_data: get('_p3_data') || null,
      cr_text: get('_cr_text'),
      cr_data: get('_cr_data') || null,
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
  
  const payload = {
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
    doc_quota1: get('#doc_quota1') || null, doc_quota2: get('#doc_quota2') || null,
    doc_quota3: get('#doc_quota3') || null, doc_quota4: get('#doc_quota4') || null,
    doc_iscr: get('#doc_iscr') || null, doc_san: get('#doc_san') || null,
    doc_priv: get('#doc_priv') || null, doc_note: get('#doc_note'),
  };

  // Aggiungi i dati delle sfide codificate
  const direzioni = ['io', 're', 'im'];
  const passi = ['1', '2', '3'];
  
  passi.forEach(passo => {
    direzioni.forEach(dir => {
      const codeKey = `pv_sfida_${dir}_${passo}`;
      const dataKey = `pv_sfida_${dir}_${passo}_data`;
      payload[codeKey] = get(`#pv_sfida_${dir}_${passo}`);
      payload[dataKey] = get(`#pv_sfida_${dir}_${passo}_data`) || null;
    });
  });

  return payload;
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
    
    // Non espandere se si clicca su checkbox, input, select o button
    if (e.target.type === 'checkbox' || e.target.type === 'date' || e.target.tagName === 'SELECT' || e.target.classList.contains('removeSpecialitaBtn')) {
      console.log('Click su input/button, ignorato');
      return;
    }
    
    const specialitaIndex = header.dataset.specialita;
    console.log('Toggling specialità:', specialitaIndex);
    this.toggleSpecialitaSection(specialitaIndex);
  });
  
  this._specialitaSectionsInitialized = true;
  console.log('Event delegation configurato per sezioni specialità');
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

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scheda Esploratore (scout2) caricata');
});

UI.printScoutSheet = async function() {
  try {
    const data = this.collectForm();
    // TODO: Aggiornare la funzione di stampa per le nuove strutture dati
    const pa = this.qs('#printArea');
    if (pa) pa.innerHTML = '<div class="print-section"><div class="print-title">Stampa non ancora implementata per scout2</div></div>';
    window.print();
  } catch (e) {
    console.error('Errore generazione stampa:', e);
  }
};

