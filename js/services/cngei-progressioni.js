/**
 * cngei-progressioni.js - Modulo per la sincronizzazione delle progressioni personali (Specialità e Tracce) con il Portale CNGEI (Passo 5)
 * @module services/cngei-progressioni
 */

import { normalizeString } from './cngei-sync.js';

/**
 * Converte date string o Timestamp in formato data YYYY-MM-DD
 */
function toDateStr(val) {
  if (!val) return new Date().toISOString().split('T')[0];
  if (val && typeof val.toDate === 'function') {
    return val.toDate().toISOString().split('T')[0];
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? new Date().toISOString().split('T')[0] : val.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
}

/**
 * Trova il tipo di progressione corrispondente su CNGEI
 */
export function matchProgressioneType(nomeOrKind, progressioniTypes = []) {
  if (!nomeOrKind || !Array.isArray(progressioniTypes)) return null;

  const target = normalizeString(nomeOrKind);

  // 1. Match esatto normalizzato
  const exact = progressioniTypes.find(t => normalizeString(t.name) === target);
  if (exact) return exact;

  // 2. Match flessibile per Tracce
  if (target.includes('traccia 1') || target === 't1') {
    return progressioniTypes.find(t => normalizeString(t.name).includes('traccia 1')) || null;
  }
  if (target.includes('traccia 2') || target === 't2') {
    return progressioniTypes.find(t => normalizeString(t.name).includes('traccia 2')) || null;
  }
  if (target.includes('traccia 3') || target === 't3') {
    return progressioniTypes.find(t => normalizeString(t.name).includes('traccia 3')) || null;
  }

  // 3. Match euristico per nome Specialità (es. maschile/femminile)
  return progressioniTypes.find(t => {
    const tName = normalizeString(t.name);
    return tName.startsWith(target.slice(0, -1)) || target.startsWith(tName.slice(0, -1));
  }) || null;
}

/**
 * Identifica le progressioni personali conseguite ma non ancora trasmesse a portale
 */
export function collectPendingProgressioni(scout, progressioniTypes = []) {
  if (!scout) return [];
  const pending = [];

  // 1. Specialità conseguite
  const specialitaList = Array.isArray(scout.specialita) ? scout.specialita : [];
  specialitaList.forEach((spec, index) => {
    const isCompleted = spec.ottenuta || spec.brevetto || (spec.data && String(spec.data).trim().length > 0);
    if (!isCompleted) return;

    // Già sincronizzata
    if (spec.idProgressioneCngei) return;

    const matchedType = matchProgressioneType(spec.nome, progressioniTypes);
    if (matchedType) {
      pending.push({
        category: 'Specialità (PO)',
        name: spec.nome,
        typeId: matchedType.id,
        obtainedAt: toDateStr(spec.data),
        indexInArray: index
      });
    }
  });

  // 2. Tracce conseguite (PV)
  if (scout.pv_traccia1?.done && !scout.cngei_traccia1_id) {
    const t1 = matchProgressioneType('Traccia 1', progressioniTypes);
    if (t1) {
      pending.push({
        category: 'Traccia (PV)',
        name: 'Traccia 1',
        typeId: t1.id,
        obtainedAt: toDateStr(scout.pv_traccia1.data),
        tracciaKey: 'pv_traccia1'
      });
    }
  }

  if (scout.pv_traccia2?.done && !scout.cngei_traccia2_id) {
    const t2 = matchProgressioneType('Traccia 2', progressioniTypes);
    if (t2) {
      pending.push({
        category: 'Traccia (PV)',
        name: 'Traccia 2',
        typeId: t2.id,
        obtainedAt: toDateStr(scout.pv_traccia2.data),
        tracciaKey: 'pv_traccia2'
      });
    }
  }

  if (scout.pv_traccia3?.done && !scout.cngei_traccia3_id) {
    const t3 = matchProgressioneType('Traccia 3', progressioniTypes);
    if (t3) {
      pending.push({
        category: 'Traccia (PV)',
        name: 'Traccia 3',
        typeId: t3.id,
        obtainedAt: toDateStr(scout.pv_traccia3.data),
        tracciaKey: 'pv_traccia3'
      });
    }
  }

  return pending;
}

/**
 * Identifica le progressioni personali già convalidate su portale CNGEI
 */
export function collectSyncedProgressioni(scout, progressioniTypes = []) {
  if (!scout) return [];
  const synced = [];

  const specialitaList = Array.isArray(scout.specialita) ? scout.specialita : [];
  specialitaList.forEach((spec, index) => {
    if (spec.idProgressioneCngei) {
      synced.push({
        category: 'Specialità (PO)',
        name: spec.nome,
        obtainedAt: toDateStr(spec.data),
        cngeiId: spec.idProgressioneCngei,
        indexInArray: index
      });
    }
  });

  if (scout.cngei_traccia1_id) {
    synced.push({
      category: 'Traccia (PV)',
      name: 'Traccia 1',
      obtainedAt: toDateStr(scout.pv_traccia1?.data),
      cngeiId: scout.cngei_traccia1_id
    });
  }
  if (scout.cngei_traccia2_id) {
    synced.push({
      category: 'Traccia (PV)',
      name: 'Traccia 2',
      obtainedAt: toDateStr(scout.pv_traccia2?.data),
      cngeiId: scout.cngei_traccia2_id
    });
  }
  if (scout.cngei_traccia3_id) {
    synced.push({
      category: 'Traccia (PV)',
      name: 'Traccia 3',
      obtainedAt: toDateStr(scout.pv_traccia3?.data),
      cngeiId: scout.cngei_traccia3_id
    });
  }

  return synced;
}

/**
 * Riconcilia lo scout locale con i brevetti/progressioni già registrati a portale CNGEI
 * Identifica le progressioni già presenti sul portale e ne memorizza gli ID di convalida
 */
export function reconcileWithCngeiBrevetti(scout, portalBrevetti = []) {
  if (!scout || !Array.isArray(portalBrevetti)) return { scout, changed: false };

  let changed = false;
  const specialitaList = Array.isArray(scout.specialita) ? [...scout.specialita] : [];

  portalBrevetti.forEach(b => {
    const typeName = b.progressioneType?.name || b.tipo || '';
    if (!typeName) return;
    const normTypeName = normalizeString(typeName);
    const kind = b.progressioneType?.kind || '';

    if (normTypeName.includes('traccia 1') || typeName === 'Traccia 1') {
      if (scout.cngei_traccia1_id !== b.id) {
        scout.cngei_traccia1_id = b.id;
        changed = true;
      }
      if (!scout.pv_traccia1 || !scout.pv_traccia1.done) {
        scout.pv_traccia1 = { ...(scout.pv_traccia1 || {}), done: true, data: b.obtainedAt || scout.pv_traccia1?.data };
        changed = true;
      }
    } else if (normTypeName.includes('traccia 2') || typeName === 'Traccia 2') {
      if (scout.cngei_traccia2_id !== b.id) {
        scout.cngei_traccia2_id = b.id;
        changed = true;
      }
      if (!scout.pv_traccia2 || !scout.pv_traccia2.done) {
        scout.pv_traccia2 = { ...(scout.pv_traccia2 || {}), done: true, data: b.obtainedAt || scout.pv_traccia2?.data };
        changed = true;
      }
    } else if (normTypeName.includes('traccia 3') || typeName === 'Traccia 3') {
      if (scout.cngei_traccia3_id !== b.id) {
        scout.cngei_traccia3_id = b.id;
        changed = true;
      }
      if (!scout.pv_traccia3 || !scout.pv_traccia3.done) {
        scout.pv_traccia3 = { ...(scout.pv_traccia3 || {}), done: true, data: b.obtainedAt || scout.pv_traccia3?.data };
        changed = true;
      }
    } else {
      // Specialità (PO) o altro brevetto
      const existingIndex = specialitaList.findIndex(s => normalizeString(s.nome) === normTypeName);
      if (existingIndex >= 0) {
        const existing = specialitaList[existingIndex];
        if (existing.idProgressioneCngei !== b.id || !existing.ottenuta) {
          existing.idProgressioneCngei = b.id;
          existing.ottenuta = true;
          if (!existing.data && b.obtainedAt) existing.data = b.obtainedAt;
          changed = true;
        }
      } else if (b.progressioneType?.branca === 'E' || kind === 'PO') {
        // Se a portale è presente una specialità non ancora censita in locale, la integriamo
        specialitaList.push({
          nome: typeName,
          ottenuta: true,
          brevetto: true,
          data: b.obtainedAt,
          idProgressioneCngei: b.id
        });
        changed = true;
      }
    }
  });

  scout.specialita = specialitaList;
  return { scout, changed };
}

/**
 * Invia una progressione conseguita al portale CNGEI
 * Gestisce in modo trasparente il caso di 409 Conflict (Check failed),
 * che indica che la progressione è già registrata sul portale per questa persona.
 */
export async function sendProgressioneToCngei(idPersona, idProgressioneType, obtainedAt, cngeiServiceInstance) {
  if (!idPersona) throw new Error('Identificativo persona CNGEI mancante');
  if (!idProgressioneType) throw new Error('Identificativo tipo progressione mancante');

  try {
    return await cngeiServiceInstance.createProgressione(
      idPersona,
      idProgressioneType,
      obtainedAt
    );
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    // 409 Conflict o Check failed = già registrata su portale per questo esploratore
    if (msg.includes('409') || msg.includes('conflict') || msg.includes('check failed')) {
      return {
        id: 'cngei_existing_' + idProgressioneType,
        alreadyExisted: true,
        message: 'Progressione già convalidata sul portale CNGEI'
      };
    }
    throw err;
  }
}


