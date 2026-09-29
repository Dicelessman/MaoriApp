// esploratori.js - Logica specifica per la pagina Esploratori
import { UI } from './js/ui/ui.js';
import { DATA } from './js/data/data-facade.js';
import { generateScoutSentieroHtml } from './js/utils/utils.js';
import { cngeiService } from './js/services/cngei-service.js';
import {
  matchMember,
  computeScoutDiff,
  buildImportPayload,
  toTitleCase
} from './js/services/cngei-sync.js';

// Assicura che UI e DATA siano disponibili globalmente per compatibilità legacy ed inline handlers
window.UI = UI;
window.DATA = DATA;

// Sovrascrive la funzione renderCurrentPage
UI.renderCurrentPage = function () {
  this.renderScouts();
  this.setupScoutsEventListeners();
};

UI.setupScoutsEventListeners = function () {
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
      const tel = this.qs('#scoutTelefono')?.value.trim() || '';
      const certScadenza = this.qs('#scoutCertScadenza')?.value || null;
      const docPriv = this.qs('#scoutDocPriv')?.checked ? true : null;
      const docSan = this.qs('#scoutDocSan')?.checked ? true : null;

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
        await DATA.addScout({
          nome,
          cognome,
          anag_telefono: tel,
          ct_g1_tel: tel,
          san_cert_scadenza: certScadenza,
          doc_priv: docPriv,
          doc_san: docSan
        }, this.currentUser);
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

  // Pulsante esporta CSV
  const exportCsvBtn = this.qs('#exportCsvBtn');
  if (exportCsvBtn && !exportCsvBtn._bound) {
    exportCsvBtn._bound = true;
    exportCsvBtn.addEventListener('click', () => this.exportScoutsCsv());
  }

  // Pulsante stampa schede
  const printSchedeBtn = this.qs('#printSchedeBtn');
  if (printSchedeBtn && !printSchedeBtn._bound) {
    printSchedeBtn._bound = true;
    printSchedeBtn.addEventListener('click', () => this.openPrintSchedeModal());
  }

  // Pulsante sincronizzazione CNGEI
  const openCngeiBtn = this.qs('#openCngeiSyncBtn');
  if (openCngeiBtn && !openCngeiBtn._bound) {
    openCngeiBtn._bound = true;
    openCngeiBtn.addEventListener('click', () => this.openCngeiSyncModal());
  }

  // Conferma stampa schede
  const confirmPrintSchede = this.qs('#confirmPrintSchede');
  if (confirmPrintSchede && !confirmPrintSchede._bound) {
    confirmPrintSchede._bound = true;
    confirmPrintSchede.addEventListener('click', () => this.executePrintSchede());
  }
  // Filtri Documenti e Sanità
  const filterBtns = [
    { id: 'filterAllScouts', mode: 'all' },
    { id: 'filterNonInRegola', mode: 'nonInRegola' },
    { id: 'filterCertScaduti', mode: 'certScaduti' }
  ];

  filterBtns.forEach(({ id, mode }) => {
    const btn = this.qs(`#${id}`);
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', () => {
        this.currentMedicalFilter = mode;
        document.querySelectorAll('.scout-filter-btn').forEach(b => {
          b.classList.remove('bg-green-600', 'text-white', 'shadow-sm');
          b.classList.add('text-gray-600');
        });
        btn.classList.remove('text-gray-600');
        btn.classList.add('bg-green-600', 'text-white', 'shadow-sm');
        this.renderScouts(this._currentAlphaLetter || null);
      });
    }
  });

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

UI.renderScouts = function (filterLetter = null) {
  this._currentAlphaLetter = filterLetter;
  const list = this.qs('#scoutsList');
  if (!list) return;

  const allScouts = this.state.scouts || [];
  let nonInRegolaCount = 0;
  let certScadutiCount = 0;
  let validCount = 0;

  allScouts.forEach(s => {
    const st = this.getScoutMedicalStatus ? this.getScoutMedicalStatus(s) : { certStatus: 'missing', isCompliant: false };
    if (!st.isCompliant) nonInRegolaCount++;
    if (st.certStatus === 'expired' || st.certStatus === 'expiring') certScadutiCount++;
    if (st.isCompliant) validCount++;
  });

  const countAllEl = this.qs('#countAllScouts');
  const countNonInRegolaEl = this.qs('#countNonInRegola');
  const countCertScadutiEl = this.qs('#countCertScaduti');
  const medSummaryEl = this.qs('#medicalOverviewSummary');

  if (countAllEl) countAllEl.textContent = allScouts.length;
  if (countNonInRegolaEl) countNonInRegolaEl.textContent = nonInRegolaCount;
  if (countCertScadutiEl) countCertScadutiEl.textContent = certScadutiCount;
  if (medSummaryEl) {
    medSummaryEl.innerHTML = `🟢 <b>${validCount}</b> in regola • 🚨 <b>${nonInRegolaCount}</b> da regolarizzare`;
  }

  let sortedScouts = [...allScouts].sort((a, b) =>
    a.nome.localeCompare(b.nome) || a.cognome.localeCompare(b.cognome)
  );

  // Filtro Alfabetico
  if (filterLetter) {
    const fl = filterLetter.toUpperCase();
    sortedScouts = sortedScouts.filter(s => ((s.nome || '') + '').toUpperCase().startsWith(fl));
  }

  // Filtro Documentale
  if (this.currentMedicalFilter === 'nonInRegola') {
    sortedScouts = sortedScouts.filter(s => {
      const st = this.getScoutMedicalStatus ? this.getScoutMedicalStatus(s) : { isCompliant: false };
      return !st.isCompliant;
    });
  } else if (this.currentMedicalFilter === 'certScaduti') {
    sortedScouts = sortedScouts.filter(s => {
      const st = this.getScoutMedicalStatus ? this.getScoutMedicalStatus(s) : { certStatus: 'missing' };
      return st.certStatus === 'expired' || st.certStatus === 'expiring';
    });
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

              actions.push({
                label: 'Archivia',
                icon: '🗂️',
                danger: true, // Visual warning style
                action: () => {
                  this.confirmArchiveScout(scoutId);
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
      const fmt = (v) => { const d = toDate(v); return d && !isNaN(d) ? d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''; };
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

      // Calcolo percentuale presenze (solo anno scout in corso)
      const currentScoutYear = UI.getCurrentScoutYear ? UI.getCurrentScoutYear() : '2025/2026';
      const allActs = this.state.activities || [];
      const acts = allActs.filter(a => UI.isActivityInScoutYear ? UI.isActivityInScoutYear(a, currentScoutYear) : true);
      const pres = UI.getDedupedPresences ? UI.getDedupedPresences() : (this.state.presences || []);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      let nextActivityId = null;
      const pastIds = acts.filter(a => {
        const ad = (a.data && a.data.toDate) ? a.data.toDate() : new Date(a.data);
        const aday = new Date(ad); aday.setHours(0, 0, 0, 0);
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

      // Stato Medico e Documentale
      const med = this.getScoutMedicalStatus ? this.getScoutMedicalStatus(scout) : null;
      let medBadge = '';
      if (med) {
        medBadge = `
          <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${med.badgeClass}" title="Certificato Medico">
              🩺 ${med.statusLabel}
            </span>
            ${!med.docPriv ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">Manca Privacy</span>' : ''}
            ${!med.docSan ? '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">Manca Scheda Sanitaria</span>' : ''}
          </div>
        `;
      }

      return `
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center swipeable-item hover:shadow transition" data-id="${scout.id}" data-item-id="${scout.id}">
          <div class="flex-1 min-w-0 pr-3">
            <div class="flex items-baseline gap-2 flex-wrap">
              <h4 class="font-medium text-gray-900 truncate">
                <a href="scout2.html?id=${scout.id}" class="hover:underline">${scout.nome} ${scout.cognome}</a>
              </h4>
              ${scout.tesseraCngei ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200" title="Censito Portale Nazionale CNGEI">CNGEI #${scout.tesseraCngei}</span>` : ''}
            </div>
            <div class="text-sm flex flex-wrap gap-x-4 gap-y-1 mt-1">
              ${fields.join('')}
            </div>
            ${medBadge}
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onclick="UI.sendMedicalWhatsAppReminder('${scout.id}')"
              class="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition"
              title="Invia promemoria WhatsApp al genitore per i documenti"
            >
              💬
            </button>
            <button
              onclick="UI.printSentieroSingle('${scout.id}')"
              class="p-2 text-gray-500 hover:text-blue-600 rounded-full"
              title="Stampa scheda sentiero"
            >
              📄
            </button>
            <a 
              href="scout2.html?id=${scout.id}"
              class="p-2 text-gray-500 hover:text-green-600 rounded-full"
              title="Apri scheda"
            >
              ✏️
            </a>
            <button 
              onclick="UI.confirmArchiveScout('${scout.id}')" 
              class="p-2 text-gray-500 hover:text-orange-600 rounded-full"
              title="Archivia"
              ${this.currentUser ? '' : 'disabled'}
            >
              🗂️
            </button>
          </div>
        </div>
      `;
    }
  });
};

UI.sendMedicalWhatsAppReminder = function (scoutId) {
  const scout = (this.state.scouts || []).find(s => s.id === scoutId);
  if (!scout) {
    this.showToast('Esploratore non trovato', { type: 'error' });
    return;
  }

  const med = this.getScoutMedicalStatus ? this.getScoutMedicalStatus(scout) : null;
  const tel = scout.ct_g1_tel || scout.anag_telefono || scout.ct_g2_tel || '';

  const wa = this.generateWhatsAppReminderUrl ? this.generateWhatsAppReminderUrl({
    scoutNome: `${scout.nome || ''} ${scout.cognome || ''}`.trim(),
    scadenzaStr: med?.formattedDate || scout.san_cert_scadenza || '',
    telGenitore: tel,
    certStatus: med?.certStatus || 'expiring',
    missingDocs: med?.missingDocuments || []
  }) : null;

  if (wa && wa.url) {
    window.open(wa.url, '_blank');
  }
};

UI.openEditScoutModal = function (id) {
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

UI.confirmDeleteScout = function (id) {
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

UI.confirmArchiveScout = function (id) {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per archiviare esploratori.', { type: 'error' });
    return;
  }

  const scout = this.state.scouts.find(s => s.id === id);
  if (!scout) return;

  if (confirm(`Sei sicuro di voler archiviare ${scout.nome} ${scout.cognome}? Non apparirà più nelle liste attive ma sarà spostato in Archivio.`)) {
    this.archiveScout(id);
  }
};

UI.archiveScout = async function (id) {
  this.showLoadingOverlay('Archiviazione in corso...');
  try {
    await DATA.updateScout(id, { archived: true }, this.currentUser);
    this.showToast('Esploratore archiviato');
    // Reload data to reflect changes (filtered out)
    this.state = await DATA.loadAll(true); // Force refresh
    this.rebuildPresenceIndex();
    this.renderScouts();
  } catch (error) {
    console.error('Errore archiviazione:', error);
    this.showToast('Errore durante l\'archiviazione', { type: 'error' });
  } finally {
    this.hideLoadingOverlay();
  }
};

UI.exportScoutsCsv = async function () {
  if (!this.currentUser) {
    this.showToast('Devi essere loggato per esportare.', { type: 'error' });
    return;
  }
  
  try {
    const btn = this.qs('#exportCsvBtn');
    if (btn) btn.textContent = 'Esportazione...';
    
    // Assicurarsi di avere i dati aggiornati
    this.state = await DATA.loadAll();
    const scouts = this.state.scouts || [];
    
    if (scouts.length === 0) {
      this.showToast('Nessun esploratore da esportare', { type: 'warning' });
      return;
    }
    
    // 1. Raccogli tutte le chiavi possibili
    const allKeysSet = new Set();
    scouts.forEach(s => {
      Object.keys(s).forEach(k => {
        if (k !== 'specialita' && k !== 'archived') { 
          allKeysSet.add(k); 
        }
      });
    });
    
    const headers = Array.from(allKeysSet).sort();
    // Aggiungi specialità alla fine
    headers.push('specialita_testo');
    
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '';
      // Se è data (oggetto firebase Timestamp o Date nativo)
      if (val && typeof val.toDate === 'function') {
        val = val.toDate();
      }
      if (val instanceof Date) {
        val = val.toLocaleDateString('it-IT');
      } else if (typeof val === 'object') {
        // Altri oggetti generici (ev_ce1 ecc che sono {data, testo})
        if (val.data || val.testo) {
          let dt = val.data || '';
          if (dt && typeof dt.toDate === 'function') dt = dt.toDate().toLocaleDateString('it-IT');
          else if (dt instanceof Date) dt = dt.toLocaleDateString('it-IT');
          val = `${dt} ${val.testo || ''}`.trim();
        } else {
          val = JSON.stringify(val);
        }
      }
      
      let str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };
    
    // Intestazione
    let csvContent = headers.join(',') + '\n';
    
    // Righe
    scouts.forEach(s => {
      const row = headers.map(h => {
        if (h === 'specialita_testo') {
          // Flatten specialità
          if (Array.isArray(s.specialita)) {
            const spArr = s.specialita.map(sp => {
                let txt = sp.nome || 'Sconosciuta';
                let stats = [];
                if (sp.ottenuta) stats.push('ott');
                if (sp.brevetto) stats.push('brv');
                if (sp.distintivo) stats.push('dst');
                if (stats.length > 0) txt += ' (' + stats.join(',') + ')';
                return txt;
            });
            return escapeCsv(spArr.join(', '));
          }
          return '';
        }
        return escapeCsv(s[h]);
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Add BOM for Excel utf-8 recognition
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esploratori_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    this.showToast('Esportazione completata', { type: 'success' });
  } catch(e) {
    console.error('Errore esportazione:', e);
    this.showToast('Errore esportazione: ' + e.message, { type: 'error' });
  } finally {
    const btn = this.qs('#exportCsvBtn');
    if (btn) btn.textContent = 'Esporta CSV';
  }
};

// Inizializza la pagina esploratori
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pagina Esploratori caricata');
});

// Apre il modale di stampa schede sentiero e popola il select pattuglie
UI.openPrintSchedeModal = function () {
  const select = this.qs('#printPattugliaSelect');
  if (!select) return;

  // Ricostruisce le opzioni
  select.innerHTML = '<option value="">Tutto il Reparto</option>';
  const scouts = this.state?.scouts || [];
  const pattuglie = [...new Set(scouts.map(s => s.pv_pattuglia).filter(Boolean))].sort();
  pattuglie.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    select.appendChild(opt);
  });

  this.showModal('printSchedeModal');
};

// Fallback di resilienza per la stampa schede sentiero se non già definite sul modulo UI
if (typeof UI.loadChallenges !== 'function') {
  UI.loadChallenges = async function () {
    if (this.challengesData) return this.challengesData;
    if (!this._jsonLoadPromises) this._jsonLoadPromises = {};
    if (this._jsonLoadPromises.challenges) return await this._jsonLoadPromises.challenges;
    try {
      this._jsonLoadPromises.challenges = fetch('challenges.json')
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => { this.challengesData = data; delete this._jsonLoadPromises.challenges; return data; });
      return await this._jsonLoadPromises.challenges;
    } catch (e) {
      console.error('Errore caricamento challenges.json:', e);
      if (this._jsonLoadPromises) delete this._jsonLoadPromises.challenges;
      return {};
    }
  };
}

if (typeof UI.loadSpecialitaList !== 'function') {
  UI.loadSpecialitaList = async function () {
    if (this.specialitaListData) return this.specialitaListData;
    if (!this._jsonLoadPromises) this._jsonLoadPromises = {};
    if (this._jsonLoadPromises.specialita) return await this._jsonLoadPromises.specialita;
    try {
      this._jsonLoadPromises.specialita = fetch('specialita.json')
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => { this.specialitaListData = data; delete this._jsonLoadPromises.specialita; return data; });
      return await this._jsonLoadPromises.specialita;
    } catch (e) {
      console.error('Errore caricamento specialita.json:', e);
      if (this._jsonLoadPromises) delete this._jsonLoadPromises.specialita;
      return [];
    }
  };
}

if (typeof UI.printSentieroBatch !== 'function') {
  UI.printSentieroBatch = async function (scoutIds, title = 'Schede Sentiero Reparto') {
    try {
      if (!scoutIds || scoutIds.length === 0) {
        this.showToast('Nessun esploratore selezionato', { type: 'warning' });
        return;
      }

      if (typeof this.showLoadingOverlay === 'function') {
        this.showLoadingOverlay(`Preparazione ${scoutIds.length} schede...`);
      }

      if (!this.state || !this.state.scouts || this.state.scouts.length === 0) {
        this.state = await DATA.loadAll();
      }

      if (!this.challengesData && typeof this.loadChallenges === 'function') await this.loadChallenges();
      if (!this.specialitaListData && typeof this.loadSpecialitaList === 'function') await this.loadSpecialitaList();

      const allScouts = this.state.allScouts || this.state.scouts || [];
      const htmlParts = [];

      scoutIds.forEach((scoutId, i) => {
        const scout = allScouts.find(s => s.id === scoutId);
        if (!scout) return;
        let cardHtml = (this.generateScoutSentieroHtml || generateScoutSentieroHtml)(scout, this.challengesData, this.specialitaListData);
        if (i < scoutIds.length - 1) {
          cardHtml += `<div style="page-break-after: always; height: 0; line-height: 0;"></div>`;
        }
        htmlParts.push(cardHtml);
      });

      if (htmlParts.length === 0) {
        if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
        this.showToast('Nessun esploratore trovato', { type: 'warning' });
        return;
      }

      if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
      const batchHtml = htmlParts.join('\n');
      this._printHtmlInArea(batchHtml, title);
    } catch (e) {
      if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
      console.error('Errore stampa batch:', e);
      this.showToast('Errore stampa batch: ' + e.message, { type: 'error', duration: 4000 });
    }
  };
}

if (typeof UI.printSentieroSingle !== 'function') {
  UI.printSentieroSingle = async function (scoutId) {
    try {
      if (!scoutId) {
        this.showToast('ID esploratore mancante', { type: 'error' });
        return;
      }

      if (typeof this.showLoadingOverlay === 'function') {
        this.showLoadingOverlay('Preparazione stampa...');
      }

      if (!this.state || !this.state.scouts || this.state.scouts.length === 0) {
        this.state = await DATA.loadAll();
      }

      const scout = (this.state.allScouts || this.state.scouts || []).find(s => s.id === scoutId);
      if (!scout) {
        if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
        this.showToast('Esploratore non trovato', { type: 'error' });
        return;
      }

      if (!this.challengesData && typeof this.loadChallenges === 'function') await this.loadChallenges();
      if (!this.specialitaListData && typeof this.loadSpecialitaList === 'function') await this.loadSpecialitaList();

      const html = (this.generateScoutSentieroHtml || generateScoutSentieroHtml)(scout, this.challengesData, this.specialitaListData);
      if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
      this._printHtmlInArea(html, `Il Sentiero di ${scout.nome || ''}`);
    } catch (e) {
      if (typeof this.hideLoadingOverlay === 'function') this.hideLoadingOverlay();
      console.error('Errore stampa singola:', e);
      this.showToast('Errore stampa: ' + e.message, { type: 'error', duration: 4000 });
    }
  };
}

// Esegue la stampa batch in base alla pattuglia selezionata
UI.executePrintSchede = async function () {
  const select = this.qs('#printPattugliaSelect');
  const pattuglia = select?.value || '';
  const scouts = this.state?.scouts || [];

  let targets = scouts;
  if (pattuglia) {
    targets = scouts.filter(s => s.pv_pattuglia === pattuglia);
  }

  const scoutIds = targets.map(s => s.id);
  const title = pattuglia
    ? `Schede Sentiero — Pattuglia ${pattuglia}`
    : 'Schede Sentiero — Tutto il Reparto';

  this.closeModal('printSchedeModal');

  const printFn = (typeof this.printSentieroBatch === 'function')
    ? this.printSentieroBatch.bind(this)
    : (typeof UI.printSentieroBatch === 'function'
      ? UI.printSentieroBatch.bind(UI)
      : (typeof window.UI?.printSentieroBatch === 'function' ? window.UI.printSentieroBatch.bind(window.UI) : null));

  if (printFn) {
    await printFn(scoutIds, title);
  } else {
    console.error('printSentieroBatch non disponibile');
    this.showToast('Funzione di stampa schede non disponibile.', { type: 'error' });
  }
};

// ==========================================
// SINCRONIZZAZIONE PORTALE CNGEI (PASSO 2 E 3)
// ==========================================

UI.openCngeiSyncModal = async function () {
  if (!this.currentUser) {
    this.showToast('Devi essere autenticato per sincronizzare con il portale CNGEI.', { type: 'error' });
    return;
  }
  this.showModal('cngeiSyncModal');
  await this.loadCngeiSyncData();
};

UI.setupCngeiSyncModalEvents = function () {
  const modal = this.qs('#cngeiSyncModal');
  if (!modal || modal._syncEventsBound) return;
  modal._syncEventsBound = true;

  // Tabs
  modal.querySelectorAll('.cngei-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (!this._cngeiSyncState || this._cngeiSyncState.activeTab === tab) return;
      this._cngeiSyncState.activeTab = tab;

      modal.querySelectorAll('.cngei-tab-btn').forEach(b => {
        b.classList.remove('bg-white', 'text-emerald-800', 'shadow-sm');
        b.classList.add('text-gray-600');
      });
      btn.classList.add('bg-white', 'text-emerald-800', 'shadow-sm');
      btn.classList.remove('text-gray-600');

      // Mostra l'avviso frequenze solo nella scheda "Da Importare"
      const noticeEl = this.qs('#cngeiImportNotice');
      if (noticeEl) {
        noticeEl.classList.toggle('hidden', tab !== 'toImport');
      }

      this.renderCngeiSyncList();
    });
  });

  // Ricerca
  const searchInput = this.qs('#cngeiSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (!this._cngeiSyncState) return;
      this._cngeiSyncState.searchQuery = (e.target.value || '').trim().toLowerCase();
      this.renderCngeiSyncList();
    });
  }

  // Seleziona / Deseleziona tutti nel tab corrente
  this.qs('#cngeiSelectAllBtn')?.addEventListener('click', () => this.toggleAllCngeiCurrentTab(true));
  this.qs('#cngeiDeselectAllBtn')?.addEventListener('click', () => this.toggleAllCngeiCurrentTab(false));

  // Riprova su errore
  this.qs('#cngeiSyncRetryBtn')?.addEventListener('click', () => this.loadCngeiSyncData());

  // Conferma sincronizzazione
  this.qs('#cngeiConfirmSyncBtn')?.addEventListener('click', () => this.executeCngeiSync());
};

UI.loadCngeiSyncData = async function () {
  const loadingEl = this.qs('#cngeiSyncLoading');
  const errorEl = this.qs('#cngeiSyncError');
  const contentEl = this.qs('#cngeiSyncContent');
  const loadingText = this.qs('#cngeiSyncLoadingText');

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (errorEl) errorEl.classList.add('hidden');
  if (contentEl) contentEl.classList.add('hidden');

  try {
    if (loadingText) loadingText.textContent = 'Connessione al portale CNGEI e recupero censiti...';
    const allMembers = await cngeiService.getMembers();
    const scoutMembers = allMembers.filter(m => m.isEsploratore);

    if (loadingText) loadingText.textContent = `Analisi schede sanitarie e consensi di ${scoutMembers.length} censiti...`;

    // Fetch dati medici in parallelo per tutti i censiti
    const medicalResults = await Promise.allSettled(
      scoutMembers.map(s => cngeiService.getMedicalData(s.idCngei))
    );

    const medicalMap = new Map();
    scoutMembers.forEach((s, idx) => {
      const res = medicalResults[idx];
      medicalMap.set(s.idCngei, res.status === 'fulfilled' ? res.value : null);
    });

    // Recupera esploratori locali attuali
    const allData = await DATA.loadAll(true);
    const localScouts = allData.allScouts || allData.scouts || [];

    const toImport = [];
    const toUpdate = [];
    const synced = [];

    scoutMembers.forEach(member => {
      const matched = matchMember(member, localScouts);
      const medical = medicalMap.get(member.idCngei) || null;

      if (!matched) {
        toImport.push({
          member,
          medical,
          selected: false // Default: deselezionato per scegliere solo i frequentanti reali
        });
      } else {
        const diffResult = computeScoutDiff(member, matched, medical);
        if (diffResult.hasChanges) {
          toUpdate.push({
            member,
            localScout: matched,
            medical,
            diffResult,
            selected: true // Default: selezionato per applicare le integrazioni
          });
        } else {
          synced.push({
            member,
            localScout: matched,
            medical,
            diffResult,
            selected: false
          });
        }
      }
    });

    this._cngeiSyncState = {
      toImport,
      toUpdate,
      synced,
      activeTab: toImport.length > 0 ? 'toImport' : (toUpdate.length > 0 ? 'toUpdate' : 'synced'),
      searchQuery: ''
    };

    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');

    this.setupCngeiSyncModalEvents();

    // Aggiorna classe tab iniziale attiva
    const activeTab = this._cngeiSyncState.activeTab;
    modalBtnActive: {
      const modal = this.qs('#cngeiSyncModal');
      if (!modal) break modalBtnActive;
      modal.querySelectorAll('.cngei-tab-btn').forEach(b => {
        const isCur = b.dataset.tab === activeTab;
        b.classList.toggle('bg-white', isCur);
        b.classList.toggle('text-emerald-800', isCur);
        b.classList.toggle('shadow-sm', isCur);
        b.classList.toggle('text-gray-600', !isCur);
      });
      const noticeEl = this.qs('#cngeiImportNotice');
      if (noticeEl) noticeEl.classList.toggle('hidden', activeTab !== 'toImport');
    }

    this.updateCngeiSyncCounters();
    this.renderCngeiSyncList();
  } catch (err) {
    console.error('Errore caricamento dati CNGEI:', err);
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) {
      errorEl.classList.remove('hidden');
      const msg = this.qs('#cngeiSyncErrorMessage');
      if (msg) msg.textContent = err.message || 'Errore di connessione al portale CNGEI';
    }
  }
};

UI.updateCngeiSyncCounters = function () {
  const state = this._cngeiSyncState;
  if (!state) return;

  const badgeImport = this.qs('#cngeiBadgeImport');
  const badgeUpdate = this.qs('#cngeiBadgeUpdate');
  const badgeSynced = this.qs('#cngeiBadgeSynced');
  const summaryLabel = this.qs('#cngeiSelectedCountLabel');
  const confirmBtn = this.qs('#cngeiConfirmSyncBtn');

  if (badgeImport) badgeImport.textContent = state.toImport.length;
  if (badgeUpdate) badgeUpdate.textContent = state.toUpdate.length;
  if (badgeSynced) badgeSynced.textContent = state.synced.length;

  const importSel = state.toImport.filter(x => x.selected).length;
  const updateSel = state.toUpdate.filter(x => x.selected).length;
  const total = importSel + updateSel;

  if (summaryLabel) {
    if (total === 0) {
      summaryLabel.textContent = 'Nessun esploratore selezionato';
    } else {
      summaryLabel.innerHTML = `Selezionati: <b>${importSel}</b> da importare • <b>${updateSel}</b> da aggiornare`;
    }
  }

  if (confirmBtn) {
    confirmBtn.disabled = total === 0;
  }
};

UI.toggleAllCngeiCurrentTab = function (select) {
  const state = this._cngeiSyncState;
  if (!state) return;

  const currentList = state[state.activeTab] || [];
  const q = state.searchQuery;

  currentList.forEach(item => {
    if (q) {
      const m = item.member;
      const haystack = `${m.nome} ${m.cognome} ${m.tessera || ''} ${m.codiceFiscale || ''}`.toLowerCase();
      if (!haystack.includes(q)) return;
    }
    item.selected = select;
  });

  this.updateCngeiSyncCounters();
  this.renderCngeiSyncList();
};

UI.toggleCngeiItemSelection = function (tab, index, isChecked) {
  const state = this._cngeiSyncState;
  if (!state || !state[tab] || !state[tab][index]) return;

  state[tab][index].selected = isChecked;
  this.updateCngeiSyncCounters();
};

UI.renderCngeiSyncList = function () {
  const listEl = this.qs('#cngeiSyncList');
  const state = this._cngeiSyncState;
  if (!listEl || !state) return;

  const tab = state.activeTab;
  const rawItems = state[tab] || [];
  const q = state.searchQuery;

  const items = rawItems.map((item, idx) => ({ ...item, originalIndex: idx })).filter(item => {
    if (!q) return true;
    const m = item.member;
    const haystack = `${m.nome} ${m.cognome} ${m.tessera || ''} ${m.codiceFiscale || ''}`.toLowerCase();
    return haystack.includes(q);
  });

  if (items.length === 0) {
    let emptyMsg = 'Nessun elemento presente in questa sezione.';
    if (q) emptyMsg = `Nessun risultato trovato per "${q}".`;
    else if (tab === 'toImport') emptyMsg = 'Tutti i censiti CNGEI risultano già registrati nell\'app!';
    else if (tab === 'toUpdate') emptyMsg = 'Nessun esploratore locale necessita di aggiornamenti dai dati del portale.';
    else if (tab === 'synced') emptyMsg = 'Nessun esploratore è ancora completamente allineato.';

    listEl.innerHTML = `
      <div class="py-12 text-center text-gray-500">
        <div class="text-3xl mb-2">🔍</div>
        <p class="text-sm font-medium">${emptyMsg}</p>
      </div>
    `;
    return;
  }

  let html = '';

  if (tab === 'toImport') {
    items.forEach(item => {
      const m = item.member;
      const med = item.medical;
      const idx = item.originalIndex;
      const g1 = [m.genitore1?.nome, m.genitore1?.cognome].filter(Boolean).map(toTitleCase).join(' ');
      const g2 = [m.genitore2?.nome, m.genitore2?.cognome].filter(Boolean).map(toTitleCase).join(' ');

      // Consensi badge
      const privBadge = m.consensi?.privacy
        ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800" title="Consenso privacy firmato">🔒 Privacy firmata</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">🔒 Privacy assente</span>';

      const imgBadge = m.consensi?.immagini
        ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800" title="Liberatoria immagini concessa">📸 Liberatoria foto</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">📸 No foto</span>';

      const medBadge = m.consensi?.medico
        ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800" title="Consenso medico registrato">🩺 Consenso medico</span>'
        : '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">🩺 No consenso medico</span>';

      // Info mediche (se presenti)
      let medDetails = '';
      const allergies = [...(med?.allergies || []), med?.otherAllergies].filter(x => x && x.toUpperCase() !== 'NESSUNA');
      const foods = [...(med?.foodPreferences || []), med?.otherFoodPreferences].filter(x => x && x.toUpperCase() !== 'NESSUNA');

      if (allergies.length > 0 || foods.length > 0 || med?.notes) {
        medDetails = `
          <div class="mt-2 p-2 rounded bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
            ${allergies.length > 0 ? `<div>⚠️ <b>Allergie:</b> ${allergies.join(', ')}</div>` : ''}
            ${foods.length > 0 ? `<div>🍽️ <b>Intolleranze/Dieta:</b> ${foods.join(', ')}</div>` : ''}
            ${med?.notes ? `<div>📝 <b>Note mediche:</b> ${med.notes}</div>` : ''}
          </div>
        `;
      }

      html += `
        <div class="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-emerald-300 transition flex items-start gap-3.5">
          <input type="checkbox" id="cngei_import_${idx}" ${item.selected ? 'checked' : ''} onchange="UI.toggleCngeiItemSelection('toImport', ${idx}, this.checked)" class="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer" />
          <label for="cngei_import_${idx}" class="flex-1 min-w-0 cursor-pointer">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-gray-900">${toTitleCase(m.nome)} ${toTitleCase(m.cognome)}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">Tessera #${m.tessera || '—'}</span>
              </div>
              <div class="text-xs text-gray-500 font-mono">CF: ${m.codiceFiscale || '—'}</div>
            </div>

            <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
              ${m.dataNascita ? `<span>🎂 Nato il ${m.dataNascita}</span>` : ''}
              ${m.comune ? `<span>📍 ${m.comune}</span>` : ''}
              ${g1 ? `<span>👨‍👩‍👦 ${g1}${m.genitore1?.telefono ? ` (${m.genitore1.telefono})` : ''}</span>` : ''}
              ${g2 ? `<span>👨‍👩‍👦 ${g2}${m.genitore2?.telefono ? ` (${m.genitore2.telefono})` : ''}</span>` : ''}
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-1.5">
              ${privBadge}
              ${imgBadge}
              ${medBadge}
            </div>

            ${medDetails}
          </label>
        </div>
      `;
    });
  } else if (tab === 'toUpdate') {
    items.forEach(item => {
      const m = item.member;
      const s = item.localScout;
      const diffs = item.diffResult?.diffs || [];
      const idx = item.originalIndex;

      let diffRows = '';
      diffs.forEach(d => {
        diffRows += `
          <div class="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
            <span class="font-medium text-gray-700">${d.label}:</span>
            <div class="flex items-center gap-2">
              <span class="text-gray-400 line-through">${d.oldValue}</span>
              <span class="text-emerald-500 font-bold">➔</span>
              <span class="text-emerald-700 font-semibold">${d.newValue}</span>
            </div>
          </div>
        `;
      });

      html += `
        <div class="p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-emerald-300 transition flex items-start gap-3.5">
          <input type="checkbox" id="cngei_update_${idx}" ${item.selected ? 'checked' : ''} onchange="UI.toggleCngeiItemSelection('toUpdate', ${idx}, this.checked)" class="mt-1 w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer" />
          <label for="cngei_update_${idx}" class="flex-1 min-w-0 cursor-pointer">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base font-bold text-gray-900">${s.nome} ${s.cognome}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">${diffs.length} aggiornamenti</span>
              </div>
              <div class="text-xs text-gray-500 font-mono">Tessera #${m.tessera || '—'}</div>
            </div>

            <div class="mt-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-200 space-y-0.5">
              ${diffRows}
            </div>
          </label>
        </div>
      `;
    });
  } else if (tab === 'synced') {
    items.forEach(item => {
      const s = item.localScout;
      const m = item.member;

      html += `
        <div class="p-3 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <div class="font-bold text-gray-900 text-sm">${s.nome} ${s.cognome}</div>
              <div class="text-xs text-gray-500">Tessera CNGEI #${m.tessera || s.tesseraCngei || '—'} • Dati completi e allineati</div>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Allineato ✅
          </span>
        </div>
      `;
    });
  }

  listEl.innerHTML = html;
};

UI.executeCngeiSync = async function () {
  if (!this.currentUser) return;
  const state = this._cngeiSyncState;
  if (!state) return;

  const importSelected = state.toImport.filter(x => x.selected);
  const updateSelected = state.toUpdate.filter(x => x.selected);
  const total = importSelected.length + updateSelected.length;

  if (total === 0) {
    this.showToast('Nessun esploratore selezionato per la sincronizzazione.', { type: 'warning' });
    return;
  }

  const confirmBtn = this.qs('#cngeiConfirmSyncBtn');
  const originalText = confirmBtn?.textContent;
  this.setButtonLoading(confirmBtn, true, 'Sincronizzazione in corso...');

  let addedCount = 0;
  let updatedCount = 0;
  const errors = [];

  try {
    // 1. Importa nuovi esploratori selezionati
    for (const item of importSelected) {
      try {
        const payload = buildImportPayload(item.member, item.medical);
        await DATA.addScout(payload, this.currentUser);
        addedCount++;
      } catch (e) {
        console.error('Errore import scout', item.member.nome, e);
        errors.push(`${item.member.nome}: ${e.message}`);
      }
    }

    // 2. Aggiorna esploratori esistenti selezionati
    for (const item of updateSelected) {
      try {
        const payload = item.diffResult.payload;
        await DATA.updateScout(item.localScout.id, payload, this.currentUser);
        updatedCount++;
      } catch (e) {
        console.error('Errore update scout', item.localScout.nome, e);
        errors.push(`${item.localScout.nome}: ${e.message}`);
      }
    }

    // Ricarica stato globale e rinfresca UI
    this.state = await DATA.loadAll(true);
    this.rebuildPresenceIndex();
    this.renderScouts();
    this.closeModal('cngeiSyncModal');

    if (errors.length > 0) {
      this.showToast(`Sincronizzati ${addedCount + updatedCount} esploratori (${errors.length} errori)`, { type: 'warning', duration: 4000 });
    } else {
      this.showToast(`Sincronizzazione completata: ${addedCount} importati, ${updatedCount} aggiornati!`, { type: 'success', duration: 4000 });
    }
  } catch (err) {
    console.error('Errore fatale sincronizzazione:', err);
    this.showToast('Errore durante la sincronizzazione: ' + (err.message || 'Errore sconosciuto'), { type: 'error', duration: 4000 });
  } finally {
    this.setButtonLoading(confirmBtn, false, originalText || 'Applica Sincronizzazione');
  }
};
