/**
 * Tests for Scout Sentiero Sheet Generation & Reporting
 * @module tests/sentiero-report
 */

import { describe, it, expect } from 'vitest';
import { generateScoutSentieroHtml } from '../js/utils/utils.js';

describe('generateScoutSentieroHtml', () => {
  const mockChallenges = {
    "1": {
      "IO": [
        { "code": "1-IO-1", "text": "Attività fisica per tre mesi in autonomia." }
      ],
      "AL": [
        { "code": "1-AL-1", "text": "Scelgo 3 articoli della legge portando esempi." }
      ],
      "MT": [
        { "code": "1-MT-1", "text": "Realizzo una carta topografica della zona." }
      ]
    },
    "2": {
      "IO": [
        { "code": "2-IO-1", "text": "Guidare un momento di riflessione." }
      ],
      "AL": [],
      "MT": []
    }
  };

  const mockSpecialitaList = [
    {
      nome: 'Alpinista',
      prove: [
        { id: 'p1', nome: 'Prova 1', text: 'Conoscere i nodi di cordata e sicurezza.' },
        { id: 'p2', nome: 'Prova 2', text: 'Effettuare un\'escursione in montagna con dislivello.' },
        { id: 'p3', nome: 'Prova 3', text: 'Preparare lo zaino per 2 giorni.' }
      ]
    }
  ];

  it('should return empty string if scout is null or undefined', () => {
    expect(generateScoutSentieroHtml(null)).toBe('');
    expect(generateScoutSentieroHtml(undefined)).toBe('');
  });

  it('should render header with scout name and pattuglia', () => {
    const scout = {
      nome: 'Marco',
      cognome: 'Rossi',
      pv_pattuglia: 'Aquile'
    };

    const html = generateScoutSentieroHtml(scout, mockChallenges, mockSpecialitaList);

    expect(html).toContain('Il sentiero di Marco');
    expect(html).toContain('Pattuglia Aquile');
    expect(html).toContain('Reparto Maori · Scheda di Progressione');
  });

  it('should render Promessa status and date correctly', () => {
    const scout = {
      nome: 'Giulia',
      cognome: 'Bianchi',
      pv_promessa: '2024-04-23'
    };

    const html = generateScoutSentieroHtml(scout, mockChallenges, mockSpecialitaList);

    expect(html).toContain('Promessa:');
    expect(html).toContain('23/04/2024');
  });

  it('should indicate current step reached and next step target', () => {
    const scout = {
      nome: 'Luca',
      cognome: 'Verdi',
      pv_promessa: '2023-04-23',
      pv_traccia1: { done: true, date: '2024-06-10' },
      pv_traccia2: false,
      pv_traccia3: false
    };

    const html = generateScoutSentieroHtml(scout, mockChallenges, mockSpecialitaList);

    expect(html).toContain('1° Passo:');
    expect(html).toContain('10/06/2024');
    expect(html).toContain('Stai camminando verso:');
    expect(html).toContain('il secondo Passo');
  });

  it('should display selected challenges with description and completion status', () => {
    const scout = {
      nome: 'Sara',
      cognome: 'Neri',
      pv_promessa: '2023-01-01',
      pv_traccia1: false, // next is passo 1
      pv_sfida_io_1: '1-IO-1',
      pv_sfida_io_1_data: '2024-05-15', // completed
      pv_sfida_al_1: '1-AL-1',
      pv_sfida_al_1_data: '', // not completed
      pv_sfida_bianca_1: 'Imparare a suonare 3 canzoni alla chitarra'
    };

    const html = generateScoutSentieroHtml(scout, mockChallenges, mockSpecialitaList);

    // Completed challenge check
    expect(html).toContain('1-IO-1');
    expect(html).toContain('Attività fisica per tre mesi in autonomia.');
    expect(html).toContain('Completata il: 15/05/2024');
    expect(html).toContain('☑');

    // Incomplete challenge check
    expect(html).toContain('1-AL-1');
    expect(html).toContain('Scelgo 3 articoli della legge portando esempi.');
    expect(html).toContain('☐');

    // Sfida bianca
    expect(html).toContain('Sfida Bianca (Personale)');
    expect(html).toContain('Imparare a suonare 3 canzoni alla chitarra');
  });

  it('should render message when all 3 steps are completed', () => {
    const scout = {
      nome: 'Elena',
      cognome: 'Gialli',
      pv_promessa: '2022-04-23',
      pv_traccia1: true,
      pv_traccia2: true,
      pv_traccia3: true
    };

    const html = generateScoutSentieroHtml(scout, mockChallenges, mockSpecialitaList);

    expect(html).toContain('Tutti i 3 Passi sono stati completati con successo');
  });

  it('should render specialità ottenute and in corso with test proofs', () => {
    const scout = {
      nome: 'Davide',
      cognome: 'Ferrari',
      specialita: [
        {
          nome: 'Pioniere',
          ottenuta: true,
          data: '2023-11-20',
          note: 'Ottima costruzione torretta'
        },
        {
          nome: 'Alpinista',
          ottenuta: false,
          p1_data: '2024-03-10',
          p2_data: '',
          p3_data: null,
          cr_text: 'Organizzare una salita con la squadriglia',
          cr_data: '2024-04-01'
        }
      ]
    };

    const html = generateScoutSentieroHtml(scout, mockChallenges, mockSpecialitaList);

    // Specialita ottenuta
    expect(html).toContain('Pioniere');
    expect(html).toContain('20/11/2023');
    expect(html).toContain('Ottima costruzione torretta');

    // Specialita in corso
    expect(html).toContain('Alpinista');
    expect(html).toContain('Conoscere i nodi di cordata e sicurezza.');
    expect(html).toContain('Superata il: 10/03/2024');
    expect(html).toContain('Organizzare una salita con la squadriglia');
    expect(html).toContain('01/04/2024');
  });

  it('should gracefully handle empty or missing challenges and specialità list', () => {
    const scout = {
      nome: 'Mario',
      cognome: 'Rossi'
    };

    const html = generateScoutSentieroHtml(scout, {}, []);
    expect(html).toContain('Il sentiero di Mario');
    expect(html).toContain('Nessuna sfida ancora selezionata per questo passo.');
    expect(html).toContain('Nessuna specialità ancora conquistata.');
    expect(html).toContain('Nessuna specialità attualmente in corso di svolgimento.');
  });
});
