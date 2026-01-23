// esploratori.js - Logica specifica per la pagina Esploratori

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

      // Calcolo percentuale presenze
      const acts = this.state.activities || [];
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
            </button>
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

// Inizializza la pagina esploratori
document.addEventListener('DOMContentLoaded', () => {
  console.log('Pagina Esploratori caricata');
});