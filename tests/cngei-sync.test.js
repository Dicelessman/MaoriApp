import { describe, it, expect } from 'vitest';
import {
  toTitleCase,
  normalizeString,
  matchMember,
  computeScoutDiff,
  buildImportPayload,
  mergeMedicalField
} from '../js/services/cngei-sync.js';

describe('CNGEI Sync & Diff Logic (Passo 2 e 3)', () => {
  it('toTitleCase dovrebbe formattare correttamente nomi in MAIUSCOLO preservando lettere accentate', () => {
    expect(toTitleCase('NORA')).toBe('Nora');
    expect(toTitleCase('PEYRACHIA')).toBe('Peyrachia');
    expect(toTitleCase('DANILO POLITANÒ')).toBe('Danilo Politanò');
    expect(toTitleCase('THOMAS PIETRO')).toBe('Thomas Pietro');
  });

  it('normalizeString dovrebbe rimuovere accenti, spazi superflui e normalizzare il testo', () => {
    expect(normalizeString('  Danilo   Politanò ')).toBe('danilo politano');
    expect(normalizeString('MATTÌA')).toBe('mattia');
  });

  it('matchMember dovrebbe trovare la corrispondenza per idCngei, tessera, CF o nome/cognome', () => {
    const localScouts = [
      { id: 's1', nome: 'Nora', cognome: 'Peyrachia', anag_cf: 'PYRNRO13H41D205L', tesseraCngei: '72467' },
      { id: 's2', nome: 'Leo', cognome: 'Ferrari', anag_cf: 'FRRLEO12L09F335X' },
      { id: 's3', nome: 'Andrea', cognome: 'Livorno', idCngei: 'cngei-andrea-uuid' }
    ];

    // Corrispondenza per idCngei
    const matchId = matchMember({ idCngei: 'cngei-andrea-uuid', nome: 'Andrea', cognome: 'Livorno' }, localScouts);
    expect(matchId?.id).toBe('s3');

    // Corrispondenza per tessera
    const matchTessera = matchMember({ tessera: '72467', nome: 'NORA', cognome: 'PEYRACHIA' }, localScouts);
    expect(matchTessera?.id).toBe('s1');

    // Corrispondenza per codice fiscale
    const matchCf = matchMember({ codiceFiscale: 'FRRLEO12L09F335X', nome: 'LEO', cognome: 'FERRARI' }, localScouts);
    expect(matchCf?.id).toBe('s2');

    // Corrispondenza per nome/cognome normalizzato
    const matchName = matchMember({ nome: 'LEO', cognome: 'FERRARI', codiceFiscale: 'UNKNOWN' }, localScouts);
    expect(matchName?.id).toBe('s2');

    // Nessuna corrispondenza
    const noMatch = matchMember({ nome: 'Chiara', cognome: 'Gialli' }, localScouts);
    expect(noMatch).toBeNull();
  });

  it('mergeMedicalField dovrebbe unire in modo conservativo e non distruttivo i dati medici', () => {
    // Esistente vuoto, portale con dato
    expect(mergeMedicalField('', ['Polline', 'Graminacee'])).toBe('Polline, Graminacee');

    // Esistente con dato, portale con nuovo dato
    expect(mergeMedicalField('Asma da sforzo', ['Polline'])).toBe('Asma da sforzo; Polline');

    // Ignora stringhe 'NESSUNA' o vuote dal portale
    expect(mergeMedicalField('Asma da sforzo', ['NESSUNA'])).toBe('Asma da sforzo');

    // Deduplica se già presente
    expect(mergeMedicalField('Allergia al pelo di gatto', ['Pelo di gatto'])).toBe('Allergia al pelo di gatto');
  });

  it('computeScoutDiff dovrebbe calcolare correttamente le differenze e i consensi', () => {
    const local = {
      id: 's2',
      nome: 'Leo',
      cognome: 'Ferrari',
      anag_cf: 'FRRLEO12L09F335X',
      doc_priv: false,
      doc_san: false,
      san_allergie: 'Polline'
    };

    const cngei = {
      idCngei: 'uuid-leo',
      tessera: '71589',
      nome: 'LEO',
      cognome: 'FERRARI',
      codiceFiscale: 'FRRLEO12L09F335X',
      telefono: '3331112233',
      genitore1: { nome: 'Marco', cognome: 'Ferrari', telefono: '3491234567' },
      consensi: { privacy: true, immagini: true, medico: true }
    };

    const medical = {
      allergies: [],
      otherAllergies: 'Pelo di gatto',
      foodPreferences: [],
      otherFoodPreferences: ''
    };

    const diffResult = computeScoutDiff(cngei, local, medical);

    expect(diffResult.hasChanges).toBe(true);
    expect(diffResult.diffs.length).toBeGreaterThan(0);

    // Verifica campi calcolati
    expect(diffResult.payload.tesseraCngei).toBe('71589');
    expect(diffResult.payload.idCngei).toBe('uuid-leo');
    expect(diffResult.payload.anag_telefono).toBe('3331112233');
    expect(diffResult.payload.ct_g1_tel).toBe('3491234567');
    expect(diffResult.payload.doc_priv).toBe(true);
    expect(diffResult.payload.doc_san).toBe(true);
    expect(diffResult.payload.doc_liberatoria).toBe(true);
    expect(diffResult.payload.san_allergie).toContain('Polline');
    expect(diffResult.payload.san_allergie).toContain('Pelo di gatto');
  });

  it('buildImportPayload dovrebbe costruire il record completo per un nuovo scout da censimento CNGEI', () => {
    const cngei = {
      idCngei: 'uuid-nora',
      tessera: '72467',
      nome: 'NORA',
      cognome: 'PEYRACHIA',
      codiceFiscale: 'PYRNRO13H41D205L',
      dataNascita: '2013-06-01',
      sesso: 'F',
      indirizzo: 'Via Roma 10',
      comune: 'Torino',
      telefono: '3330001122',
      email: 'nora@scout.it',
      genitore1: { nome: 'Paolo', cognome: 'Peyrachia', telefono: '3481112233', email: 'paolo@test.it' },
      genitore2: { nome: 'Elena', cognome: 'Bianchi', telefono: '3472223344', email: 'elena@test.it' },
      consensi: { privacy: true, immagini: true, medico: true }
    };

    const medical = {
      allergies: ['NESSUNA'],
      otherAllergies: '',
      foodPreferences: ['SENZA GLUTINE'],
      otherFoodPreferences: '',
      notes: 'Porta sempre autoiniettore'
    };

    const payload = buildImportPayload(cngei, medical);

    expect(payload.nome).toBe('Nora');
    expect(payload.cognome).toBe('Peyrachia');
    expect(payload.tesseraCngei).toBe('72467');
    expect(payload.idCngei).toBe('uuid-nora');
    expect(payload.anag_cf).toBe('PYRNRO13H41D205L');
    expect(payload.anag_dob).toBe('2013-06-01');
    expect(payload.anag_sesso).toBe('femmina');
    expect(payload.anag_citta).toBe('Torino');
    expect(payload.ct_g1_nome).toBe('Paolo Peyrachia');
    expect(payload.ct_g1_tel).toBe('3481112233');
    expect(payload.doc_priv).toBe(true);
    expect(payload.doc_san).toBe(true);
    expect(payload.doc_liberatoria).toBe(true);
    expect(payload.san_intolleranze).toBe('SENZA GLUTINE');
    expect(payload.san_altro).toBe('Porta sempre autoiniettore');
  });
});
