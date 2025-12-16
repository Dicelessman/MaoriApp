// esploratori.js - Logica specifica per la pagina Esploratori

// Sovrascrive la funzione renderCurrentPage
UI.renderCurrentPage = function() {
  this.renderScouts();
  this.setupScoutsEventListeners();
};

UI.setupScoutsEventListeners = function() {
  // Event listener per form aggiunta esploratore (ora nel modale)
  const form = this.qs('#addScoutForm');
  if (form && !form._bound) {
    form._bound = true;
    
    // Setup validazione real-time
    this.setupFormValidation(form, {
      scoutNome: {
        required: true,
        minLength: 1,
        maxLength: 100,
        requiredMessage: 'Il nome è obbligatorio'
      },
      scoutCognome: {
        required: true,
        minLength: 1,
        maxLength: 100,
        requiredMessage: 'Il cognome è obbligatorio'
      }
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.currentUser) { 
        this.showToast('Devi essere loggato per aggiungere esploratori.', { type: 'error' }); 
        return; 
      }
      
      // Validazione form completa
      const validation = this.validateForm(form, {
        scoutNome: { required: true, minLength: 1, maxLength: 100 },
        scoutCognome: { required: true, minLength: 1, maxLength: 100 }
      });
      
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0];
        this.showToast(firstError, { type: 'error' });
        const firstErrorField = Object.keys(validation.errors)[0];
        const input = form.querySelector(`#${firstErrorField}`);
        if (input) input.focus();
        return;
      }
      
      const nome = this.qs('#scoutNome').value.trim();
      const cognome = this.qs('#scoutCognome').value.trim();
      
      // Check duplicati scout
      if (this.checkDuplicateScout(nome, cognome)) {
        this.showToast('Un esploratore con lo stesso nome e cognome esiste già', { type: 'error' });
        this.qs('#scoutNome').focus();
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      this.setButtonLoading(submitBtn, true, originalText);
      try {
        await DATA.addScout({ nome, cognome }, this.currentUser);
        this.state = await DATA.loadAll();
        this.rebuildPresenceIndex();
        this.renderScouts();
        form.reset();
        this.closeModal('addScoutModal');
        this.showToast('Esploratore aggiunto');
        
        // Reset classi validazione
        form.querySelectorAll('.valid, .invalid').forEach(el => {
          el.classList.remove('valid', 'invalid');
        });
        form.querySelectorAll('.has-error, .is-valid').forEach(el => {
          el.classList.remove('has-error', 'is-valid');
        });
        form.querySelectorAll('.field-error').forEach(el => {
          el.textContent = '';
        });
      } catch (error) {
        console.error('Errore aggiunta esploratore:', error);
        this.showToast('Errore durante l\'aggiunta: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
      } finally {
        this.setButtonLoading(submitBtn, false, originalText);
      }
    });
  }
  // Pulsante apertura modale Aggiungi
  const openBtn = this.qs('#openAddScoutModal');
  if (openBtn && !openBtn._bound) {
    openBtn._bound = true;
    openBtn.addEventListener('click', () => this.showModal('addScoutModal'));
  }
  
  // Pulsante scansione duplicati specialità
  const scanDuplicatesBtn = this.qs('#scanDuplicatesBtn');
  if (scanDuplicatesBtn && !scanDuplicatesBtn._bound) {
    scanDuplicatesBtn._bound = true;
    scanDuplicatesBtn.addEventListener('click', () => this.scanSpecialitaDuplicates());
  }
  // Barra alfabetica
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const nav = this.qs('#alphaNav');
  if (nav && !nav._built) {
    nav._built = true;
    nav.innerHTML = [`<button type="button" class="btn-secondary px-2 py-1" data-letter="*">Tutti</button>`]
      .concat(alpha.map(l => `<button type="button" class="btn-secondary px-2 py-1" data-letter="${l}">${l}</button>`))
      .join('');
    nav.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const letter = btn.dataset.letter;
        if (letter === '*') this.renderScouts(null);
        else this.renderScouts(letter);
      });
    });
  }
};

UI.renderScouts = function(filterLetter = null) {
  const list = this.qs('#scoutsList');
  if (!list) return;
  
  let sortedScouts = [...this.state.scouts].sort((a, b) => 
    a.nome.localeCompare(b.nome) || a.cognome.localeCompare(b.cognome)
  );
  if (filterLetter) {
    const fl = filterLetter.toUpperCase();
    sortedScouts = sortedScouts.filter(s => ((s.nome || '') + '').toUpperCase().startsWith(fl));
  }

  this.renderInBatches({
    container: list,
    items: sortedScouts,
    batchSize: 200,
    onComplete: () => {
      // Setup swipe delete dopo il rendering
      if (this.currentUser && 'ontouchstart' in window) {
        this.setupSwipeDelete(list, (scoutId) => {
          this.confirmDeleteScout(scoutId);
        }, '.swipeable-item', 'data-id');
      }
      
      // Setup long press per menu contestuale
      if ('ontouchstart' in window) {
        const items = list.querySelectorAll('.swipeable-item');
        items.forEach(item => {
          const scoutId = item.getAttribute('data-id');
          const scout = this.state.scouts?.find(s => s.id === scoutId);
          if (!scout) return;
          
          this.setupLongPress(item, (element, e) => {
            const actions = [
              {
                label: `Apri scheda ${scout.nome}`,
                icon: '📄',
                action: () => {
                  window.location.href = `scout2.html?id=${scoutId}`;
                }
              },
              {
                label: 'Copia nome',
                icon: '📋',
                action: async () => {
                  const nome = `${scout.nome} ${scout.cognome}`.trim();
                  try {
                    await navigator.clipboard.writeText(nome);
                    this.showToast('Nome copiato', { type: 'success', duration: 1500 });
                  } catch (err) {
                    console.error('Errore copia:', err);
                  }
                }
              }
            ];
            
            if (this.currentUser) {
              actions.push({
                label: 'Elimina',
                icon: '🗑️',
                danger: true,
                action: () => {
                  this.confirmDeleteScout(scoutId);
                }
              });
            }
            
            this.showContextMenu(element, actions);
          });
        });
      }
      
      // Setup pull-to-refresh
      if ('ontouchstart' in window) {
        const scrollContainer = list.closest('.bg-gray-50') || list.parentElement;
        if (scrollContainer) {
          this.setupPullToRefresh(scrollContainer, async () => {
            this.showLoadingOverlay('Aggiornamento dati...');
            try {
              this.state = await DATA.loadAll();
              this.rebuildPresenceIndex();
              this.renderScouts(filterLetter);
              this.showToast('Dati aggiornati', { type: 'success' });
            } catch (error) {
              console.error('Errore refresh:', error);
              this.showToast('Errore durante l\'aggiornamento', { type: 'error' });
            } finally {
              this.hideLoadingOverlay();
            }
          });
        }
      }
    },
    renderItem: (scout) => {
      const toDate = (v) => (v && v.toDate) ? v.toDate() : (v ? new Date(v) : null);
      const fmt = (v) => { const d = toDate(v); return d && !isNaN(d) ? d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'2-digit' }) : ''; };
      const label = (abbr, val, color) => `<span class="text-${color} font-medium">${abbr}</span> <span class="text-gray-800">${val || '-'}</span>`;
      
      // Solo campi valorizzati
      const fields = [];
      
      // Pattuglia come prima informazione (prime tre lettere)
      if (scout.pv_pattuglia && scout.pv_pattuglia.trim()) {
        const pattugliaShort = scout.pv_pattuglia.trim().substring(0, 3).toUpperCase();
        fields.push(`<span class="text-orange-600 font-bold">${pattugliaShort}</span>`);
      }
     
      if (scout.pv_promessa) fields.push(label('P', '', 'blue-700'));
      if (scout.pv_traccia1?.done) fields.push(label('T1', '', 'amber-700'));
      if (scout.pv_traccia2?.done) fields.push(label('T2', '', 'purple-700'));
      if (scout.pv_traccia3?.done) fields.push(label('T3', '', 'teal-700'));
      
      // Conteggio specialità conseguite: usa i nuovi flag se disponibili, altrimenti fallback su date prove
      let specTot = 0;
      if (Array.isArray(scout.specialita)) {
        specTot = scout.specialita.filter(spec => {
          if (typeof spec === 'object' && (spec.ottenuta || spec.brevetto || spec.consegnata || (spec.data && String(spec.data).trim()))) return true;
          return (spec.p1?.data && String(spec.p1.data).trim()) || 
                 (spec.p2?.data && String(spec.p2.data).trim()) || 
                 (spec.p3?.data && String(spec.p3.data).trim()) || 
                 (spec.cr?.data && String(spec.cr.data).trim());
        }).length;
      }
      if (specTot > 0) fields.push(label('Sp', String(specTot), 'rose-700'));
      
      if (scout.pv_giglio_data) fields.push(label('GT', '', 'indigo-700'));
     
      // CP/VCP - solo il valore
      if (scout.pv_vcp_cp) fields.push(`<span class="text-green-700 font-medium">${scout.pv_vcp_cp}</span>`);
      
      // Calcolo percentuale presenze
      const acts = this.state.activities || [];
      const pres = UI.getDedupedPresences ? UI.getDedupedPresences() : (this.state.presences || []);
      const today = new Date(); today.setHours(0,0,0,0);
      let nextActivityId = null;
      const pastIds = acts.filter(a => {
        const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
        const aday = new Date(ad); aday.setHours(0,0,0,0);
        if (nextActivityId === null && aday >= today) { nextActivityId = a.id; }
        return aday < today;
      }).map(a => a.id);
      const consideredIds = nextActivityId ? [...pastIds, nextActivityId] : pastIds;

      const validActIds = consideredIds.filter(aid => {
        const pr = pres.find(p => p.esploratoreId === scout.id && p.attivitaId === aid);
        return pr && (pr.stato === 'Presente' || pr.stato === 'Assente');
      });
      const presentCount = pres.filter(p => p.esploratoreId === scout.id && p.stato === 'Presente' && validActIds.includes(p.attivitaId)).length;
      const perc = validActIds.length ? Math.round((presentCount / validActIds.length) * 100) : 0;
      
      if (perc > 0) fields.push(label('Pr', String(perc), 'emerald-700'));

      return `
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item" data-id="${scout.id}" data-item-id="${scout.id}">
          <div class="flex-1">
            <h4 class="font-medium text-gray-900"><a href="scout2.html?id=${scout.id}" class="hover:underline">${scout.nome} ${scout.cognome}</a></h4>
            <div class="text-sm flex flex-wrap gap-x-4 gap-y-1 mt-1">
              ${fields.join('')}
            </div>
          </div>
          <div class="flex gap-2">
            <a 
              href="scout2.html?id=${scout.id}"
              class="p-2 text-gray-500 hover:text-green-600 rounded-full"
              title="Apri scheda"
            >
              ✏️
            </a>
            <button 
              onclick="UI.confirmDeleteScout('${scout.id}')" 
              class="p-2 text-gray-500 hover:text-red-600 rounded-full"
              ${this.currentUser ? '' : 'disabled'}
            >
              🗑️
            </button>
          </div>
        </div>
      `;
    }
  });
};

UI.openEditScoutModal = function(id) {
  if (!this.currentUser) { 
    this.showToast('Devi essere loggato per modificare esploratori.', { type: 'error' }); 
    return; 
  }
  
  const scout = this.state.scouts.find(s => s.id === id);
  if (!scout) return;
  
  this.qs('#editScoutId').value = scout.id;
  this.qs('#editScoutNome').value = scout.nome;
  this.qs('#editScoutCognome').value = scout.cognome;
  
  this.showModal('editScoutModal');
};

UI.confirmDeleteScout = function(id) {
  if (!this.currentUser) { 
    this.showToast('Devi essere loggato per eliminare esploratori.', { type: 'error' }); 
    return; 
  }
  
  const scout = this.state.scouts.find(s => s.id === id);
  if (!scout) return;
  
  this.scoutToDeleteId = id;
  this.qs('#scoutNameToDelete').textContent = `${scout.nome} ${scout.cognome}`;
  this.showModal('confirmDeleteScoutModal');
};

// ============== Gestione Specialità Duplicate ==============

/**
 * Scansiona tutti gli scout per trovare specialità duplicate
 */
UI.scanSpecialitaDuplicates = function() {
  const resultsContainer = this.qs('#duplicatesResults');
  if (!resultsContainer) return;
  
  // Mostra loading
  resultsContainer.classList.remove('hidden');
  resultsContainer.innerHTML = '<div class="text-center py-4"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div><p class="mt-2 text-gray-600">Analisi in corso...</p></div>';
  
  // Analizza tutti gli scout
  const duplicates = [];
  const scouts = this.state.scouts || [];
  
  scouts.forEach(scout => {
    if (!scout.specialita || !Array.isArray(scout.specialita)) return;
    
    // Raggruppa per nome specialità
    const byName = {};
    scout.specialita.forEach((spec, index) => {
      const nome = spec?.nome || spec?.name || '';
      if (!nome || !nome.trim()) return; // Salta specialità senza nome
      
      const nomeKey = nome.trim().toLowerCase();
      if (!byName[nomeKey]) {
        byName[nomeKey] = [];
      }
      byName[nomeKey].push({ index, spec });
    });
    
    // Trova duplicati (più di una specialità con lo stesso nome)
    Object.entries(byName).forEach(([nomeKey, entries]) => {
      if (entries.length > 1) {
        duplicates.push({
          scoutId: scout.id,
          scoutNome: scout.nome,
          scoutCognome: scout.cognome,
          specialitaNome: entries[0].spec?.nome || entries[0].spec?.name || nomeKey,
          count: entries.length,
          indices: entries.map(e => e.index),
          specs: entries.map(e => e.spec)
        });
      }
    });
  });
  
  // Renderizza risultati
  if (duplicates.length === 0) {
    resultsContainer.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p class="text-green-800 font-medium">✅ Nessun duplicato trovato!</p>
        <p class="text-green-600 text-sm mt-1">Tutte le specialità sono uniche per ogni esploratore.</p>
      </div>
    `;
    return;
  }
  
  // Mostra tabella con duplicati
  let html = `
    <div class="bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div class="bg-yellow-100 border-b border-yellow-300 p-4">
        <h4 class="font-semibold text-gray-800">Trovati ${duplicates.length} duplicati in ${new Set(duplicates.map(d => d.scoutId)).size} esploratori</h4>
        <p class="text-sm text-gray-600 mt-1">Seleziona i duplicati da rimuovere. Verrà mantenuta la prima occorrenza di ogni specialità.</p>
      </div>
      <div class="max-h-96 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="p-2 text-left border-b border-gray-300"><input type="checkbox" id="selectAllDuplicates" /></th>
              <th class="p-2 text-left border-b border-gray-300">Esploratore</th>
              <th class="p-2 text-left border-b border-gray-300">Specialità</th>
              <th class="p-2 text-center border-b border-gray-300">Occorrenze</th>
              <th class="p-2 text-left border-b border-gray-300">Da rimuovere</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  duplicates.forEach((dup, idx) => {
    // Determina quale mantenere (la prima, preferibilmente quella più completa)
    const specsWithData = dup.specs.map((spec, i) => ({
      index: dup.indices[i],
      spec,
      hasData: !!(spec.ottenuta || spec.brevetto || spec.distintivo || spec.data || spec.p1_data || spec.p2_data || spec.p3_data || spec.cr_data || (spec.note && spec.note.trim()))
    }));
    
    // Ordina: prima quelle con dati, poi per indice
    specsWithData.sort((a, b) => {
      if (a.hasData !== b.hasData) return b.hasData ? 1 : -1;
      return a.index - b.index;
    });
    
    const toKeep = specsWithData[0].index;
    const toRemove = dup.indices.filter(i => i !== toKeep);
    
    html += `
      <tr class="border-b border-gray-200 hover:bg-gray-50">
        <td class="p-2"><input type="checkbox" class="duplicate-checkbox" data-dup-index="${idx}" checked /></td>
        <td class="p-2">
          <a href="scout2.html?id=${dup.scoutId}" class="text-green-600 hover:underline font-medium">${dup.scoutNome} ${dup.scoutCognome}</a>
        </td>
        <td class="p-2 font-medium">${dup.specialitaNome}</td>
        <td class="p-2 text-center">
          <span class="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded">${dup.count}</span>
        </td>
        <td class="p-2 text-gray-600 text-xs">
          Indici: ${toRemove.join(', ')} (mantenuto: ${toKeep})
        </td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
      <div class="bg-gray-50 p-4 border-t border-gray-300 flex justify-between items-center">
        <div>
          <span id="selectedCount" class="font-medium text-gray-700">0 selezionati</span>
        </div>
        <div class="flex gap-2">
          <button type="button" id="removeSelectedDuplicatesBtn" class="btn-primary" disabled>
            🗑️ Rimuovi Selezionati
          </button>
        </div>
      </div>
    </div>
  `;
  
  resultsContainer.innerHTML = html;
  
  // Setup event listeners
  const selectAll = this.qs('#selectAllDuplicates');
  const checkboxes = resultsContainer.querySelectorAll('.duplicate-checkbox');
  const removeBtn = this.qs('#removeSelectedDuplicatesBtn');
  const selectedCount = this.qs('#selectedCount');
  
  // Salva i dati dei duplicati nell'elemento per accesso successivo
  resultsContainer._duplicatesData = duplicates;
  
  const updateCount = () => {
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    selectedCount.textContent = `${checked} selezionati`;
    removeBtn.disabled = checked === 0;
    selectAll.checked = checked === checkboxes.length && checkboxes.length > 0;
  };
  
  selectAll?.addEventListener('change', (e) => {
    checkboxes.forEach(cb => cb.checked = e.target.checked);
    updateCount();
  });
  
  checkboxes.forEach(cb => {
    cb.addEventListener('change', updateCount);
  });
  
  removeBtn?.addEventListener('click', () => {
    this.removeSelectedDuplicates();
  });
  
  updateCount();
};

/**
 * Rimuove i duplicati selezionati
 */
UI.removeSelectedDuplicates = async function() {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per rimuovere duplicati.', { type: 'error' });
    return;
  }
  
  const resultsContainer = this.qs('#duplicatesResults');
  if (!resultsContainer || !resultsContainer._duplicatesData) return;
  
  const checkboxes = Array.from(resultsContainer.querySelectorAll('.duplicate-checkbox:checked'));
  if (checkboxes.length === 0) {
    this.showToast('Seleziona almeno un duplicato da rimuovere.', { type: 'warning' });
    return;
  }
  
  // Conferma
  if (!confirm(`Sei sicuro di voler rimuovere ${checkboxes.length} duplicato/i? Questa operazione non può essere annullata.`)) {
    return;
  }
  
  const duplicates = resultsContainer._duplicatesData;
  const toProcess = checkboxes.map(cb => duplicates[parseInt(cb.dataset.dupIndex)]);
  
  this.showLoadingOverlay(`Rimozione di ${toProcess.length} duplicati...`);
  
  try {
    let updated = 0;
    let errors = 0;
    
    // Raggruppa per scout per aggiornare ogni scout una sola volta
    const byScout = {};
    toProcess.forEach(dup => {
      if (!byScout[dup.scoutId]) {
        byScout[dup.scoutId] = [];
      }
      byScout[dup.scoutId].push(dup);
    });
    
    // Per ogni scout, rimuovi i duplicati
    for (const [scoutId, scoutDups] of Object.entries(byScout)) {
      const scout = this.state.scouts.find(s => s.id === scoutId);
      if (!scout || !scout.specialita) continue;
      
      // Determina quali indici rimuovere
      const indicesToRemove = new Set();
      scoutDups.forEach(dup => {
        // Mantieni la prima occorrenza, rimuovi le altre
        const specsWithData = dup.specs.map((spec, i) => ({
          index: dup.indices[i],
          spec,
          hasData: !!(spec.ottenuta || spec.brevetto || spec.distintivo || spec.data || spec.p1_data || spec.p2_data || spec.p3_data || spec.cr_data || (spec.note && spec.note.trim()))
        }));
        
        specsWithData.sort((a, b) => {
          if (a.hasData !== b.hasData) return b.hasData ? 1 : -1;
          return a.index - b.index;
        });
        
        const toKeep = specsWithData[0].index;
        dup.indices.forEach(idx => {
          if (idx !== toKeep) indicesToRemove.add(idx);
        });
      });
      
      // Rimuovi le specialità duplicate
      const newSpecialita = scout.specialita.filter((spec, index) => !indicesToRemove.has(index));
      
      // Prepara payload (senza id)
      const payload = { ...scout, specialita: newSpecialita };
      delete payload.id;
      
      try {
        await DATA.updateScout(scoutId, payload, this.currentUser);
        updated++;
      } catch (error) {
        console.error(`Errore aggiornamento scout ${scoutId}:`, error);
        errors++;
      }
    }
    
    // Ricarica dati
    this.state = await DATA.loadAll();
    this.rebuildPresenceIndex();
    
    this.hideLoadingOverlay();
    
    if (errors === 0) {
      this.showToast(`✅ Rimossi ${updated} duplicati con successo!`, { type: 'success', duration: 3000 });
      // Ricarica la scansione
      setTimeout(() => this.scanSpecialitaDuplicates(), 500);
    } else {
      this.showToast(`Rimossi ${updated} duplicati, ${errors} errori.`, { type: 'warning', duration: 4000 });
    }
  } catch (error) {
    console.error('Errore rimozione duplicati:', error);
    this.hideLoadingOverlay();
    this.showToast('Errore durante la rimozione: ' + (error.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
  }
};

// Inizializza la pagina esploratori
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pagina Esploratori caricata');
});