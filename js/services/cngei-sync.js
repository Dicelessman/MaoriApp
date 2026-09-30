/**
 * cngei-sync.js - Modulo di sincronizzazione, diffing e importazione tra Portale CNGEI e MaoriApp2
 * @module services/cngei-sync
 */

/**
 * Converte una stringa in Title Case rispettando caratteri speciali e accentati italiani.
 * Es. "NORA PEYRACHIA" -> "Nora Peyrachia"
 * Es. "DANILO POLITANÒ" -> "Danilo Politanò"
 */
export function toTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(/([\s\-'])/)
    .map(token => {
      if (/^[\s\-']$/.test(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1);
    })
    .join('');
}

/**
 * Normalizza una stringa per confronti robusti (rimuove accenti, spazi multipli, lowercase)
 */
export function normalizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Rimuove accenti
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Cerca un esploratore locale corrispondente a un membro CNGEI
 */
export function matchMember(cngeiMember, localScouts = []) {
  if (!cngeiMember || !Array.isArray(localScouts)) return null;

  // 1. Match diretto per idCngei già registrato
  if (cngeiMember.idCngei) {
    const byId = localScouts.find(s => s.idCngei && s.idCngei === cngeiMember.idCngei);
    if (byId) return byId;
  }

  // 2. Match per numero di tessera CNGEI
  if (cngeiMember.tessera) {
    const byTessera = localScouts.find(s =>
      (s.tesseraCngei && String(s.tesseraCngei).trim() === String(cngeiMember.tessera).trim()) ||
      (s.tessera && String(s.tessera).trim() === String(cngeiMember.tessera).trim())
    );
    if (byTessera) return byTessera;
  }

  // 3. Match per Codice Fiscale
  if (cngeiMember.codiceFiscale) {
    const cfTarget = normalizeString(cngeiMember.codiceFiscale);
    const byCf = localScouts.find(s => s.anag_cf && normalizeString(s.anag_cf) === cfTarget);
    if (byCf) return byCf;
  }

  // 4. Match per Nome e Cognome normalizzati
  const normNome = normalizeString(cngeiMember.nome);
  const normCognome = normalizeString(cngeiMember.cognome);

  if (normNome && normCognome) {
    const byFullName = localScouts.find(s =>
      normalizeString(s.nome) === normNome && normalizeString(s.cognome) === normCognome
    );
    if (byFullName) return byFullName;

    // 5. Match euristico per nomi composti (es. "Thomas Pietro" vs "Thomas")
    const byFirstToken = localScouts.find(s => {
      const sNome = normalizeString(s.nome);
      const sCognome = normalizeString(s.cognome);
      if (sCognome !== normCognome) return false;
      const cngeiTokens = normNome.split(' ');
      const localTokens = sNome.split(' ');
      return cngeiTokens[0] === localTokens[0];
    });
    if (byFirstToken) return byFirstToken;
  }

  return null;
}

/**
 * Unisce in modo conservativo e non distruttivo un campo medico (allergie, intolleranze)
 */
export function mergeMedicalField(existingText = '', portalItems = []) {
  const current = (existingText || '').trim();
  const validPortalItems = (Array.isArray(portalItems) ? portalItems : [portalItems])
    .filter(Boolean)
    .map(x => String(x).trim())
    .filter(x => x.length > 0 && x.toUpperCase() !== 'NESSUNA');

  if (validPortalItems.length === 0) return current;

  const currentLower = current.toLowerCase();
  const toAdd = validPortalItems.filter(item => !currentLower.includes(item.toLowerCase()));

  if (toAdd.length === 0) return current;

  const newPart = toAdd.join(', ');
  if (!current) return newPart;
  return `${current}; ${newPart}`;
}

/**
 * Normalizza il sesso per il formato MaoriApp2 ('maschio' / 'femmina')
 */
export function normalizeSesso(sesso) {
  if (!sesso) return null;
  const s = String(sesso).trim().toUpperCase();
  if (s === 'M' || s === 'MASCHIO') return 'maschio';
  if (s === 'F' || s === 'FEMMINA') return 'femmina';
  return s.toLowerCase();
}

/**
 * Estrae e formatta i dati medici dal record del portale
 */
export function parseMedicalData(medical) {
  if (!medical) {
    return { allergies: [], otherAllergies: '', foodPreferences: [], otherFoodPreferences: '', notes: '', chronicConditions: [], hasDisability: false, disabilityNotes: '', doctorName: '', doctorPhone: '' };
  }
  return {
    allergies: Array.isArray(medical.allergies) ? medical.allergies : [],
    otherAllergies: medical.otherAllergies || '',
    foodPreferences: Array.isArray(medical.foodPreferences) ? medical.foodPreferences : [],
    otherFoodPreferences: medical.otherFoodPreferences || '',
    notes: medical.notes || '',
    // Nuovi campi CNGEI portale
    chronicConditions: Array.isArray(medical.chronicConditions) ? medical.chronicConditions
      : (medical.chronicCondition ? [medical.chronicCondition] : []),
    hasDisability: !!(medical.hasDisability || medical.isDisabled || medical.bse),
    disabilityNotes: medical.disabilityNotes || medical.bseNotes || '',
    doctorName: medical.doctorName || medical.medicoCurante || '',
    doctorPhone: medical.doctorPhone || medical.telefonoMedico || ''
  };
}

/**
 * Calcola le differenze tra un membro CNGEI e un esploratore locale
 */
export function computeScoutDiff(cngeiMember, localScout, rawMedical = null) {
  const diffs = [];
  const payload = {};
  const med = parseMedicalData(rawMedical);

  // Link CNGEI invarianti
  if (localScout.idCngei !== cngeiMember.idCngei) {
    payload.idCngei = cngeiMember.idCngei;
    diffs.push({ field: 'idCngei', label: 'ID Portale CNGEI', oldValue: localScout.idCngei || '—', newValue: cngeiMember.idCngei, category: 'sistema' });
  }

  if (cngeiMember.tessera && localScout.tesseraCngei !== cngeiMember.tessera) {
    payload.tesseraCngei = cngeiMember.tessera;
    diffs.push({ field: 'tesseraCngei', label: 'Tessera CNGEI', oldValue: localScout.tesseraCngei || '—', newValue: cngeiMember.tessera, category: 'anagrafica' });
  }

  // Codice Fiscale
  if (cngeiMember.codiceFiscale && (!localScout.anag_cf || normalizeString(localScout.anag_cf) !== normalizeString(cngeiMember.codiceFiscale))) {
    payload.anag_cf = cngeiMember.codiceFiscale.toUpperCase().trim();
    diffs.push({ field: 'anag_cf', label: 'Codice Fiscale', oldValue: localScout.anag_cf || '—', newValue: payload.anag_cf, category: 'anagrafica' });
  }

  // Data di Nascita
  if (cngeiMember.dataNascita && localScout.anag_dob !== cngeiMember.dataNascita) {
    payload.anag_dob = cngeiMember.dataNascita;
    diffs.push({ field: 'anag_dob', label: 'Data di Nascita', oldValue: localScout.anag_dob || '—', newValue: cngeiMember.dataNascita, category: 'anagrafica' });
  }

  // Sesso
  const sessoNorm = normalizeSesso(cngeiMember.sesso);
  if (sessoNorm && localScout.anag_sesso !== sessoNorm) {
    payload.anag_sesso = sessoNorm;
    diffs.push({ field: 'anag_sesso', label: 'Sesso', oldValue: localScout.anag_sesso || '—', newValue: sessoNorm, category: 'anagrafica' });
  }

  // Indirizzo & Comune
  if (cngeiMember.indirizzo && localScout.anag_indirizzo !== cngeiMember.indirizzo) {
    payload.anag_indirizzo = cngeiMember.indirizzo;
    diffs.push({ field: 'anag_indirizzo', label: 'Indirizzo', oldValue: localScout.anag_indirizzo || '—', newValue: cngeiMember.indirizzo, category: 'contatti' });
  }
  if (cngeiMember.comune && localScout.anag_citta !== cngeiMember.comune) {
    payload.anag_citta = cngeiMember.comune;
    diffs.push({ field: 'anag_citta', label: 'Comune / Città', oldValue: localScout.anag_citta || '—', newValue: cngeiMember.comune, category: 'contatti' });
  }

  // Telefono ed Email Esploratore
  if (cngeiMember.telefono && localScout.anag_telefono !== cngeiMember.telefono) {
    payload.anag_telefono = cngeiMember.telefono;
    diffs.push({ field: 'anag_telefono', label: 'Telefono Esploratore', oldValue: localScout.anag_telefono || '—', newValue: cngeiMember.telefono, category: 'contatti' });
  }
  if (cngeiMember.email && localScout.anag_email !== cngeiMember.email) {
    payload.anag_email = cngeiMember.email;
    diffs.push({ field: 'anag_email', label: 'Email Esploratore', oldValue: localScout.anag_email || '—', newValue: cngeiMember.email, category: 'contatti' });
  }

  // Genitore 1
  const g1Nome = [cngeiMember.genitore1?.nome, cngeiMember.genitore1?.cognome].filter(Boolean).map(toTitleCase).join(' ');
  if (g1Nome && localScout.ct_g1_nome !== g1Nome) {
    payload.ct_g1_nome = g1Nome;
    diffs.push({ field: 'ct_g1_nome', label: 'Genitore 1 (Nome)', oldValue: localScout.ct_g1_nome || '—', newValue: g1Nome, category: 'contatti' });
  }
  if (cngeiMember.genitore1?.telefono && localScout.ct_g1_tel !== cngeiMember.genitore1.telefono) {
    payload.ct_g1_tel = cngeiMember.genitore1.telefono;
    diffs.push({ field: 'ct_g1_tel', label: 'Genitore 1 (Tel)', oldValue: localScout.ct_g1_tel || '—', newValue: cngeiMember.genitore1.telefono, category: 'contatti' });
  }
  if (cngeiMember.genitore1?.email && localScout.ct_g1_email !== cngeiMember.genitore1.email) {
    payload.ct_g1_email = cngeiMember.genitore1.email;
    diffs.push({ field: 'ct_g1_email', label: 'Genitore 1 (Email)', oldValue: localScout.ct_g1_email || '—', newValue: cngeiMember.genitore1.email, category: 'contatti' });
  }

  // Genitore 2
  const g2Nome = [cngeiMember.genitore2?.nome, cngeiMember.genitore2?.cognome].filter(Boolean).map(toTitleCase).join(' ');
  if (g2Nome && localScout.ct_g2_nome !== g2Nome) {
    payload.ct_g2_nome = g2Nome;
    diffs.push({ field: 'ct_g2_nome', label: 'Genitore 2 (Nome)', oldValue: localScout.ct_g2_nome || '—', newValue: g2Nome, category: 'contatti' });
  }
  if (cngeiMember.genitore2?.telefono && localScout.ct_g2_tel !== cngeiMember.genitore2.telefono) {
    payload.ct_g2_tel = cngeiMember.genitore2.telefono;
    diffs.push({ field: 'ct_g2_tel', label: 'Genitore 2 (Tel)', oldValue: localScout.ct_g2_tel || '—', newValue: cngeiMember.genitore2.telefono, category: 'contatti' });
  }
  if (cngeiMember.genitore2?.email && localScout.ct_g2_email !== cngeiMember.genitore2.email) {
    payload.ct_g2_email = cngeiMember.genitore2.email;
    diffs.push({ field: 'ct_g2_email', label: 'Genitore 2 (Email)', oldValue: localScout.ct_g2_email || '—', newValue: cngeiMember.genitore2.email, category: 'contatti' });
  }

  // Consensi & Documenti (Passo 3)
  if (cngeiMember.consensi?.privacy && !localScout.doc_priv) {
    payload.doc_priv = true;
    diffs.push({ field: 'doc_priv', label: 'Consenso Privacy Portale', oldValue: 'Non registrato', newValue: 'Firmato ✅', category: 'documenti' });
  }
  if (cngeiMember.consensi?.medico && !localScout.doc_san) {
    payload.doc_san = true;
    diffs.push({ field: 'doc_san', label: 'Consenso Medico Portale', oldValue: 'Non registrato', newValue: 'Rilasciato ✅', category: 'documenti' });
  }
  if (cngeiMember.consensi?.immagini && !localScout.doc_liberatoria) {
    payload.doc_liberatoria = true;
    diffs.push({ field: 'doc_liberatoria', label: 'Liberatoria Immagini Portale', oldValue: 'Non registrato', newValue: 'Rilasciata ✅', category: 'documenti' });
  }
  payload.cngei_consensi = cngeiMember.consensi || null;

  // Dati Medici integrati non-distruttivamente (Passo 3)
  const allergiesList = [...med.allergies, med.otherAllergies];
  const mergedAllergie = mergeMedicalField(localScout.san_allergie, allergiesList);
  if (mergedAllergie !== (localScout.san_allergie || '')) {
    payload.san_allergie = mergedAllergie;
    diffs.push({ field: 'san_allergie', label: 'Allergie (integrate dal portale)', oldValue: localScout.san_allergie || '—', newValue: mergedAllergie, category: 'medico' });
  }

  const foodList = [...med.foodPreferences, med.otherFoodPreferences];
  const mergedIntolleranze = mergeMedicalField(localScout.san_intolleranze, foodList);
  if (mergedIntolleranze !== (localScout.san_intolleranze || '')) {
    payload.san_intolleranze = mergedIntolleranze;
    diffs.push({ field: 'san_intolleranze', label: 'Intolleranze Alimentari (integrate)', oldValue: localScout.san_intolleranze || '—', newValue: mergedIntolleranze, category: 'medico' });
  }

  if (med.notes) {
    const mergedNotes = mergeMedicalField(localScout.san_altro, [med.notes]);
    if (mergedNotes !== (localScout.san_altro || '')) {
      payload.san_altro = mergedNotes;
      diffs.push({ field: 'san_altro', label: 'Note Mediche Portale', oldValue: localScout.san_altro || '—', newValue: mergedNotes, category: 'medico' });
    }
  }

  // Patologie croniche (merge non-distruttivo)
  if (med.chronicConditions && med.chronicConditions.length > 0) {
    const mergedPatologie = mergeMedicalField(localScout.san_patologie, med.chronicConditions);
    if (mergedPatologie !== (localScout.san_patologie || '')) {
      payload.san_patologie = mergedPatologie;
      diffs.push({ field: 'san_patologie', label: 'Patologie Croniche (integrate)', oldValue: localScout.san_patologie || '—', newValue: mergedPatologie, category: 'medico' });
    }
  }

  // BSE / Disabilità
  if (med.hasDisability && !localScout.san_disabilita) {
    payload.san_disabilita = true;
    diffs.push({ field: 'san_disabilita', label: 'BSE / Disabilità Portale', oldValue: 'No', newValue: 'Sì ✅', category: 'medico' });
  }
  if (med.disabilityNotes) {
    const mergedDisNote = mergeMedicalField(localScout.san_disabilita_note, [med.disabilityNotes]);
    if (mergedDisNote !== (localScout.san_disabilita_note || '')) {
      payload.san_disabilita_note = mergedDisNote;
      diffs.push({ field: 'san_disabilita_note', label: 'Note BSE/Disabilità Portale', oldValue: localScout.san_disabilita_note || '—', newValue: mergedDisNote, category: 'medico' });
    }
  }

  // Medico Curante (solo se non già presente localmente)
  if (med.doctorName && !localScout.ct_med_nome) {
    payload.ct_med_nome = med.doctorName;
    diffs.push({ field: 'ct_med_nome', label: 'Medico Curante (dal portale)', oldValue: '—', newValue: med.doctorName, category: 'medico' });
  }
  if (med.doctorPhone && !localScout.ct_med_tel) {
    payload.ct_med_tel = med.doctorPhone;
    diffs.push({ field: 'ct_med_tel', label: 'Tel. Medico Curante (dal portale)', oldValue: '—', newValue: med.doctorPhone, category: 'medico' });
  }

  payload.cngei_medico = med;
  payload.cngei_sync_date = new Date().toISOString();

  return {
    hasChanges: diffs.length > 0,
    diffs,
    payload
  };
}

/**
 * Costruisce l'oggetto completo per un nuovo scout da censimento CNGEI (Passo 2 e 3)
 */
export function buildImportPayload(cngeiMember, rawMedical = null) {
  const med = parseMedicalData(rawMedical);

  const allergiesList = [...med.allergies, med.otherAllergies];
  const foodList = [...med.foodPreferences, med.otherFoodPreferences];

  const san_allergie = mergeMedicalField('', allergiesList) || null;
  const san_intolleranze = mergeMedicalField('', foodList) || null;
  const san_patologie = mergeMedicalField('', med.chronicConditions) || null;
  const san_altro = med.notes ? med.notes.trim() : null;
  const san_disabilita = med.hasDisability || false;
  const san_disabilita_note = med.disabilityNotes || null;
  const ct_med_nome = med.doctorName || null;
  const ct_med_tel = med.doctorPhone || null;

  const g1Nome = [cngeiMember.genitore1?.nome, cngeiMember.genitore1?.cognome].filter(Boolean).map(toTitleCase).join(' ') || null;
  const g2Nome = [cngeiMember.genitore2?.nome, cngeiMember.genitore2?.cognome].filter(Boolean).map(toTitleCase).join(' ') || null;

  return {
    nome: toTitleCase(cngeiMember.nome),
    cognome: toTitleCase(cngeiMember.cognome),
    idCngei: cngeiMember.idCngei,
    tesseraCngei: cngeiMember.tessera || null,
    anag_cf: cngeiMember.codiceFiscale ? cngeiMember.codiceFiscale.toUpperCase().trim() : null,
    anag_dob: cngeiMember.dataNascita || null,
    anag_sesso: normalizeSesso(cngeiMember.sesso),
    anag_indirizzo: cngeiMember.indirizzo || null,
    anag_citta: cngeiMember.comune || null,
    anag_telefono: cngeiMember.telefono || null,
    anag_email: cngeiMember.email || null,
    // Genitore 1
    ct_g1_nome: g1Nome,
    ct_g1_tel: cngeiMember.genitore1?.telefono || cngeiMember.telefono || null,
    ct_g1_email: cngeiMember.genitore1?.email || null,
    // Genitore 2
    ct_g2_nome: g2Nome,
    ct_g2_tel: cngeiMember.genitore2?.telefono || null,
    ct_g2_email: cngeiMember.genitore2?.email || null,
    // Medico curante
    ct_med_nome,
    ct_med_tel,
    // Consensi e Documenti
    doc_priv: cngeiMember.consensi?.privacy ? true : null,
    doc_san: cngeiMember.consensi?.medico ? true : null,
    doc_liberatoria: cngeiMember.consensi?.immagini ? true : null,
    cngei_consensi: cngeiMember.consensi || null,
    // Dati Medici integrati
    san_allergie,
    san_intolleranze,
    san_patologie,
    san_disabilita,
    san_disabilita_note,
    san_altro,
    cngei_medico: med,
    cngei_sync_date: new Date().toISOString()
  };
}
