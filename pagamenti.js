// pagamenti.js - Logica specifica per la pagina Pagamenti
import { UI } from './js/ui/ui.js';
import { DATA } from './js/data/data-facade.js';
import { getCurrentScoutYear, isActivityInScoutYear, getAllScoutYears } from './js/utils/utils.js';

// Assicura disponibilità globale per compatibilità legacy ed inline handlers
window.UI = UI;
window.DATA = DATA;

// Sovrascrive la funzione per il rendering della pagina corrente
UI.renderCurrentPage = function () {
  this.renderPaymentsPerActivity();
};

UI.setupPaymentsScoutYearFilter = function () {
  const select = this.qs('#paymentScoutYearFilter');
  const badge = this.qs('#currentYearBadge');
  const currentYear = (typeof this.getCurrentScoutYear === 'function' ? this.getCurrentScoutYear() : getCurrentScoutYear()) || '2025/2026';

  if (badge) {
    badge.textContent = currentYear;
  }

  if (!this.paymentScoutYearFilter) {
    this.paymentScoutYearFilter = currentYear;
  }

  if (select) {
    const allActivities = this.state?.activities || [];
    const getYearsFn = this.getAllScoutYears || getAllScoutYears;
    const years = getYearsFn(allActivities);

    select.innerHTML = '';
    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y === currentYear ? `${y} (In corso)` : y;
      if (y === this.paymentScoutYearFilter) opt.selected = true;
      select.appendChild(opt);
    });

    const optAll = document.createElement('option');
    optAll.value = 'all';
    optAll.textContent = 'Tutti gli anni';
    if (this.paymentScoutYearFilter === 'all') optAll.selected = true;
    select.appendChild(optAll);

    if (!select._bound) {
      select._bound = true;
      select.addEventListener('change', (e) => {
        this.paymentScoutYearFilter = e.target.value;
        this.renderPaymentsPerActivity();
      });
    }
  }
};

UI.renderPaymentsPerActivity = function () {
  const container = this.qs('#paymentsList');
  if (!container) return;

  this.setupPaymentsScoutYearFilter();

  const currentYear = (typeof this.getCurrentScoutYear === 'function' ? this.getCurrentScoutYear() : getCurrentScoutYear()) || '2025/2026';
  const selectedYear = this.paymentScoutYearFilter || currentYear;

  const scouts = (this.state?.scouts || []).filter(s => !s.archived);
  const activities = (this.state?.activities || []).slice();
  let presences = (typeof this.getDedupedPresences === 'function') ? this.getDedupedPresences() : [];
  if (!presences || presences.length === 0) {
    presences = this.state?.presences || [];
  }

  const toDateFn = (v) => (v && v.toDate) ? v.toDate() : (v instanceof Date ? v : new Date(v));

  // Filtra per anno scout: mostra solo l'anno in corso per impostazione predefinita
  const isYearMatch = (act) => {
    if (selectedYear === 'all') return true;
    const checkFn = this.isActivityInScoutYear || isActivityInScoutYear;
    return checkFn(act, selectedYear);
  };

  // Filtra solo attività con costo appartenenti all'anno scout
  const paidActivities = activities
    .filter(isYearMatch)
    .filter(a => parseFloat(a.costo || '0') > 0);

  // Ordina per data decrescente (dal più recente al più vecchio)
  paidActivities.sort((a, b) => toDateFn(b.data) - toDateFn(a.data));

  const kpiContainer = this.qs('#paymentSummaryKpis');

  if (paidActivities.length === 0) {
    if (kpiContainer) kpiContainer.innerHTML = '';
    const yearLabel = selectedYear === 'all' ? 'qualsiasi anno' : `l'anno scout ${selectedYear}`;
    container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
        <div class="text-4xl mb-3">💳</div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Nessuna attività con quota</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Non ci sono attività con quota di partecipazione registrate per ${yearLabel}.
        </p>
      </div>
    `;
    return;
  }

  // Verifica se l'utente può modificare (deve essere loggato e avere staff selezionato)
  const canEdit = !!(this.currentUser && this.selectedStaffId);
  const disabled = canEdit ? '' : 'disabled';

  let grandExpected = 0;
  let grandCollected = 0;
  let grandDebt = 0;

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
    const whoPaid = eligible.filter(x => x.paid).sort((x1, x2) => {
      const nomeA = (x1.scout.nome || '').trim().toLowerCase();
      const nomeB = (x2.scout.nome || '').trim().toLowerCase();
      return nomeA.localeCompare(nomeB, 'it');
    });
    const whoNotPaid = eligible.filter(x => !x.paid).sort((x1, x2) => {
      const nomeA = (x1.scout.nome || '').trim().toLowerCase();
      const nomeB = (x2.scout.nome || '').trim().toLowerCase();
      return nomeA.localeCompare(nomeB, 'it');
    });

    const expected = costo * eligible.length;
    const collected = whoPaid.length * costo;
    const debt = whoNotPaid.length * costo;

    grandExpected += expected;
    grandCollected += collected;
    grandDebt += debt;

    const d = toDateFn(a.data);
    const ds = isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Lista di chi ha pagato con dropdown per modificare
    const listPaid = whoPaid.map(x => {
      const presence = x.presence || { pagato: false, tipoPagamento: null };
      return `
        <li class="flex justify-between items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${x.scout.nome} ${x.scout.cognome}</span>
          <select class="payment-select text-xs font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-green-500 shadow-sm" ${disabled}
            onchange="UI.updatePaymentCombined({value:this.value, scoutId:'${x.scout.id}', activityId:'${a.id}'})">
            <option value="" ${!presence.pagato ? 'selected' : ''}>Non Pagato</option>
            <option value="Contanti" ${(presence.pagato && presence.tipoPagamento === 'Contanti') ? 'selected' : ''}>Contanti</option>
            <option value="Satispay" ${(presence.pagato && presence.tipoPagamento === 'Satispay') ? 'selected' : ''}>Satispay</option>
            <option value="Bonifico" ${(presence.pagato && presence.tipoPagamento === 'Bonifico') ? 'selected' : ''}>Bonifico</option>
          </select>
        </li>`;
    }).join('');

    // Lista di chi non ha pagato con dropdown per segnare il pagamento
    const listNotPaid = whoNotPaid.map(x => {
      const presence = x.presence || { pagato: false, tipoPagamento: null };
      return `
        <li class="flex justify-between items-center gap-2 py-1.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${x.scout.nome} ${x.scout.cognome}</span>
          <select class="payment-select text-xs font-semibold border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-green-500 shadow-sm" ${disabled}
            onchange="UI.updatePaymentCombined({value:this.value, scoutId:'${x.scout.id}', activityId:'${a.id}'})">
            <option value="" ${!presence.pagato ? 'selected' : ''}>Non Pagato</option>
            <option value="Contanti" ${(presence.pagato && presence.tipoPagamento === 'Contanti') ? 'selected' : ''}>Contanti</option>
            <option value="Satispay" ${(presence.pagato && presence.tipoPagamento === 'Satispay') ? 'selected' : ''}>Satispay</option>
            <option value="Bonifico" ${(presence.pagato && presence.tipoPagamento === 'Bonifico') ? 'selected' : ''}>Bonifico</option>
          </select>
        </li>`;
    }).join('');

    const pct = expected > 0 ? Math.round((collected / expected) * 100) : 0;

    return `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition hover:shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-gray-900 dark:text-gray-100">${a.tipo}${a.descrizione ? ' — ' + a.descrizione : ''}</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                ${pct}% incassato
              </span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${ds} • Quota: € ${costo.toFixed(2)}/persona</p>
          </div>
          <div class="flex items-center gap-4 text-right">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Incasso atteso</p>
              <p class="text-base font-bold text-gray-700 dark:text-gray-300">€ ${expected.toFixed(2)}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Totale incassato</p>
              <p class="text-base font-bold text-emerald-600 dark:text-emerald-400">€ ${collected.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6 mt-4">
          <div class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3.5 border border-gray-100 dark:border-gray-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center justify-between">
              <span>Hanno pagato</span>
              <span class="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[11px]">${whoPaid.length}</span>
            </h4>
            <ul class="space-y-0.5">
              ${listPaid || '<li class="text-xs text-gray-400 py-1">Nessun pagamento registrato</li>'}
            </ul>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3.5 border border-gray-100 dark:border-gray-800">
            <h4 class="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2 flex items-center justify-between">
              <span>Da saldare</span>
              <span class="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full text-[11px]">${whoNotPaid.length}</span>
            </h4>
            <ul class="space-y-0.5">
              ${listNotPaid || '<li class="text-xs text-emerald-600 dark:text-emerald-400 py-1">Tutti i presenti sono in regola! 🎉</li>'}
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Attività con Quota</span>
        <div class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">${paidActivities.length}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Incasso Atteso</span>
        <div class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">€ ${grandExpected.toFixed(2)}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Totale Incassato</span>
        <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">€ ${grandCollected.toFixed(2)}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Da Riscuotere</span>
        <div class="text-xl font-bold ${grandDebt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'} mt-1">€ ${grandDebt.toFixed(2)}</div>
      </div>
    `;
  }

  container.innerHTML = rows;
};

// Fallback di resilienza per updatePaymentCombined se invocato dalla pagina pagamenti
if (typeof UI.updatePaymentCombined !== 'function') {
  UI.updatePaymentCombined = async function ({ value, scoutId, activityId }) {
    if (!this.currentUser) {
      this.showToast('Devi essere autenticato per modificare i pagamenti.', { type: 'error' });
      return;
    }
    const isPaid = !!value;
    const method = value || null;

    try {
      await DATA.updatePresence(
        { field: 'pagato', value: isPaid, scoutId, activityId },
        this.currentUser
      );
      if (isPaid) {
        await DATA.updatePresence(
          { field: 'tipoPagamento', value: method, scoutId, activityId },
          this.currentUser
        );
      }
      const key = `${scoutId}_${activityId}`;
      if (this.presenceIndex) {
        let p = this.presenceIndex.get(key);
        if (p) {
          p.pagato = isPaid;
          p.tipoPagamento = method;
          this.presenceIndex.set(key, p);
        }
      }
      if (this.state && Array.isArray(this.state.presences)) {
        const match = this.state.presences.find(x => x.esploratoreId === scoutId && x.attivitaId === activityId);
        if (match) {
          match.pagato = isPaid;
          match.tipoPagamento = method;
        }
      }
      this.showToast(isPaid ? `Pagamento registrato (${method})` : 'Pagamento rimosso', { type: 'success', duration: 2000 });
      this.renderPaymentsPerActivity();
    } catch (error) {
      console.error('Errore updatePaymentCombined:', error);
      this.showToast('Errore salvataggio pagamento: ' + (error.message || ''), { type: 'error' });
    }
  };
}
