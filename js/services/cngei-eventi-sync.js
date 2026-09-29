/**
 * cngei-eventi-sync.js - Sincronizzazione campi ed eventi nazionali registrati dal Portale CNGEI (Passo 6)
 * @module services/cngei-eventi-sync
 */

import { normalizeString } from './cngei-sync.js';

/**
 * Classifica il tipo di attività MaoriApp2 appropriato in base alle informazioni dell'evento CNGEI
 * @param {Object} evento - Oggetto evento da API CNGEI
 * @returns {string} - Uno dei tipi: 'Campo', 'Evento Adulti', 'Uscita', 'Eventi con esterni', 'Attività lunga'
 */
export function classifyCngeiEventType(evento) {
  if (!evento) return 'Eventi con esterni';

  const nome = (evento.nome || '').toLowerCase();
  const tipo = (evento.tipo || '').toUpperCase();

  // Se è specificamente un campo o jamboree
  if (nome.includes('campo') || nome.includes('jamboree') || nome.includes('san giorgio')) {
    return 'Campo';
  }

  // Se è specificamente per adulti
  if (tipo === 'ADULTI' || nome.includes('formazione') || nome.includes('setup') || nome.includes('cmt') || nome.includes('ist')) {
    return 'Evento Adulti';
  }

  // Se include escursione o uscita
  if (nome.includes('uscita') || nome.includes('escursione') || nome.includes('bivacco')) {
    return 'Uscita';
  }

  // Default per eventi associativi / nazionali per giovani
  return 'Eventi con esterni';
}

/**
 * Verifica se un evento CNGEI è già stato importato tra le attività esistenti
 * @param {Object} evento
 * @param {Array} existingActivities
 * @returns {Object|null} L'attività corrispondente se trovata, altrimenti null
 */
export function findMatchingExistingActivity(evento, existingActivities = []) {
  if (!evento || !Array.isArray(existingActivities)) return null;

  // 1. Verifica per idEventoCngei
  if (evento.id) {
    const byId = existingActivities.find(a => a.idEventoCngei === evento.id);
    if (byId) return byId;
  }

  // 2. Verifica per data inizio e nome analogo
  const normNome = normalizeString(evento.nome || '');
  const byNameAndDate = existingActivities.find(a => {
    if (a.data !== evento.inizioEvento) return false;
    const aNorm = normalizeString(a.descrizione || '');
    return aNorm.includes(normNome) || normNome.includes(aNorm);
  });

  return byNameAndDate || null;
}

/**
 * Prepara il payload per DATA.addActivity da un evento CNGEI
 * @param {Object} evento
 * @returns {Object} Payload pronto per addActivity
 */
export function prepareEventActivityPayload(evento) {
  if (!evento) throw new Error('Evento non specificato');

  const tipo = classifyCngeiEventType(evento);
  const data = evento.inizioEvento || new Date().toISOString().split('T')[0];
  const dataFine = evento.fineEvento && evento.fineEvento !== data ? evento.fineEvento : null;
  const descrizione = evento.nome || 'Evento Nazionale CNGEI';

  return {
    tipo,
    data,
    dataFine,
    descrizione,
    costo: 0,
    idEventoCngei: evento.id || null,
    note: (evento.descrizione || '').trim()
  };
}

/**
 * Filtra e ordina gli eventi CNGEI
 * @param {Array} eventi
 * @param {Object} [options]
 * @param {'ALL'|'GIOVANI'|'ADULTI'} [options.tipoFilter='ALL']
 * @param {boolean} [options.onlyFuture=false]
 * @returns {Array}
 */
export function filterAndSortCngeiEvents(eventi = [], options = {}) {
  if (!Array.isArray(eventi)) return [];

  const { tipoFilter = 'ALL', onlyFuture = false } = options;
  const todayStr = new Date().toISOString().split('T')[0];

  return eventi
    .filter(ev => {
      if (tipoFilter !== 'ALL' && ev.tipo !== tipoFilter) {
        return false;
      }
      if (onlyFuture && ev.fineEvento && ev.fineEvento < todayStr) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.inizioEvento || '';
      const dateB = b.inizioEvento || '';
      return dateA.localeCompare(dateB);
    });
}
