// pagamenti.js - Logica specifica per la pagina Pagamenti

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function() {
  this.renderPaymentsPerActivity();
};

UI.renderPaymentsPerActivity = function() {
  const container = this.qs('#paymentsList');
  if (!container) return;
  const scouts = this.state.scouts || [];
  const activities = (this.state.activities || []).slice();
  const presences = this.getDedupedPresences();

  const toDate = (v) => (v && v.toDate) ? v.toDate() : new Date(v);
  
  // Filtra solo attività con costo
  const paidActivities = activities.filter(a => parseFloat(a.costo || '0') > 0);
  
  // Ordina per data decrescente (dal più recente al più vecchio)
  paidActivities.sort((a, b) => toDate(b.data) - toDate(a.data));

  if (paidActivities.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Nessuna attività con costo.</p>';
    return;
  }

  // Verifica se l'utente può modificare (deve essere loggato e avere staff selezionato)
  const canEdit = !!(this.currentUser && this.selectedStaffId);
  const disabled = canEdit ? '' : 'disabled';

  const rows = paidActivities.map(a => {
    const costo = parseFloat(a.costo || '0') || 0;
    const payers = scouts.map(s => {
      const p = presences.find(x => x.esploratoreId === s.id && x.attivitaId === a.id);
      const stato = p?.stato || 'NR';
      // Include solo gli esploratori con stato "Presente" per i pagamenti
      const eligibleForPayment = (stato === 'Presente');
      return { 
        scout: s, 
        paid: !!p?.pagato, 
        method: p?.tipoPagamento || null, 
        stato, 
        eligibleForPayment,
        presence: p
      };
    });
    
    // Filtra solo quelli presenti (stato === 'Presente')
    const eligible = payers.filter(x => x.eligibleForPayment);
    const whoPaid = eligible.filter(x => x.paid).sort((a, b) => {
      const nomeA = (a.scout.nome || '').trim().toLowerCase();
      const nomeB = (b.scout.nome || '').trim().toLowerCase();
      return nomeA.localeCompare(nomeB, 'it');
    });
    const whoNotPaid = eligible.filter(x => !x.paid).sort((a, b) => {
      const nomeA = (a.scout.nome || '').trim().toLowerCase();
      const nomeB = (b.scout.nome || '').trim().toLowerCase();
      return nomeA.localeCompare(nomeB, 'it');
    });
    
    const expected = costo * eligible.length;
    const collected = whoPaid.length * costo;
    const d = toDate(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day:'2-digit', month:'2-digit', year:'2-digit' });

    // Lista di chi ha pagato con dropdown per modificare
    const listPaid = whoPaid.map(x => {
      const presence = x.presence || { pagato: false, tipoPagamento: null };
      return `
        <li class="flex justify-between items-center gap-2 py-1">
          <span>${x.scout.nome} ${x.scout.cognome}</span>
          <select class="payment-select text-sm border border-gray-300 rounded px-2 py-1" ${disabled}
            onchange="UI.updatePaymentCombined({value:this.value, scoutId:'${x.scout.id}', activityId:'${a.id}'})">
            <option value="" ${!presence.pagato?'selected':''}>Non Pagato</option>
            <option value="Contanti" ${(presence.pagato && presence.tipoPagamento==='Contanti')?'selected':''}>Contanti</option>
            <option value="Satispay" ${(presence.pagato && presence.tipoPagamento==='Satispay')?'selected':''}>Satispay</option>
            <option value="Bonifico" ${(presence.pagato && presence.tipoPagamento==='Bonifico')?'selected':''}>Bonifico</option>
          </select>
        </li>`;
    }).join('');
    
    // Lista di chi non ha pagato con dropdown per segnare il pagamento
    const listNotPaid = whoNotPaid.map(x => {
      const presence = x.presence || { pagato: false, tipoPagamento: null };
      return `
        <li class="flex justify-between items-center gap-2 py-1">
          <span>${x.scout.nome} ${x.scout.cognome}</span>
          <select class="payment-select text-sm border border-gray-300 rounded px-2 py-1" ${disabled}
            onchange="UI.updatePaymentCombined({value:this.value, scoutId:'${x.scout.id}', activityId:'${a.id}'})">
            <option value="" ${!presence.pagato?'selected':''}>Non Pagato</option>
            <option value="Contanti" ${(presence.pagato && presence.tipoPagamento==='Contanti')?'selected':''}>Contanti</option>
            <option value="Satispay" ${(presence.pagato && presence.tipoPagamento==='Satispay')?'selected':''}>Satispay</option>
            <option value="Bonifico" ${(presence.pagato && presence.tipoPagamento==='Bonifico')?'selected':''}>Bonifico</option>
          </select>
        </li>`;
    }).join('');

    return `
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="font-semibold text-gray-800">${a.tipo}${a.descrizione ? ' — ' + a.descrizione : ''}</p>
            <p class="text-sm text-gray-600">${ds} • Costo: € ${costo.toFixed(2)}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Incasso atteso</p>
            <p class="text-lg font-semibold">€ ${(expected).toFixed(2)}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">Totale incassato</p>
            <p class="text-lg font-semibold">€ ${(collected).toFixed(2)}</p>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Hanno pagato (${whoPaid.length})</h4>
            <ul class="space-y-1">
              ${listPaid || '<li class="text-gray-500">Nessuno</li>'}
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-gray-700 mb-2">Non hanno pagato (${whoNotPaid.length})</h4>
            <ul class="space-y-1">
              ${listNotPaid || '<li class="text-gray-500">Nessuno</li>'}
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = rows;
};

