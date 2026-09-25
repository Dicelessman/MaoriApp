import { describe, it, expect } from 'vitest';
import { generateScoutMedicalSheetHtml } from '../js/utils/utils.js';

describe('Scheda Sanitaria Personale & Cartellina di Campo', () => {
    const mockScoutCompleto = {
        id: 's_test_1',
        nome: 'Francesco',
        cognome: 'Totti',
        pv_pattuglia: 'Aironi',
        cp_vcp: 'Capo Pattuglia',
        anag_dob: '2011-09-27',
        anag_pob: 'Roma',
        anag_cf: 'TTTFNC11P27H501Z',
        anag_indirizzo: 'Via Appia Nuova 10, Roma',
        anag_telefono: '3331122334',
        ct_g1_nome: 'Lorenzo Totti',
        ct_g1_rel: 'Padre',
        ct_g1_tel: '3339988776',
        ct_g2_nome: 'Fiorella Totti',
        ct_g2_rel: 'Madre',
        ct_g2_tel: '3335544332',
        ct_med_nome: 'Dott. Mario Bianchi',
        ct_med_tel: '0612345678',
        san_gruppo: '0+',
        san_intolleranze: 'Intolleranza al lattosio (no formaggi freschi e latte vaccino)',
        san_allergie: 'Allergia grave a punture di vespe/api (adrenalina Fastjekt)',
        san_farmaci: 'Ventolin spray al bisogno per asma da sforzo; antistaminico Cetirizina 10mg la sera',
        san_vaccinazioni: 'Antitetanica valida (richiamo Giugno 2023), MPR, DTP',
        san_cert_scadenza: '2026-10-31',
        san_cert: 'Certificato medico sportivo non agonistico rilasciato da Dr. Bianchi',
        san_altro: 'Nessun limite all\'attività fisica in quota',
        doc_priv: true,
        doc_san: true
    };

    it('dovrebbe generare la scheda sanitaria con intestazione per la cartellina del campo', () => {
        const html = generateScoutMedicalSheetHtml(mockScoutCompleto);
        expect(html).toContain('Scheda Sanitaria & di Emergenza');
        expect(html).toContain('Cartellina Sanitaria Campo');
        expect(html).toContain('Riservato Capi Campo');
    });

    it('dovrebbe includere tutti i dati anagrafici e la pattuglia', () => {
        const html = generateScoutMedicalSheetHtml(mockScoutCompleto);
        expect(html).toContain('Francesco Totti');
        expect(html).toContain('Ptg. Aironi');
        expect(html).toContain('Capo Pattuglia');
        expect(html).toContain('TTTFNC11P27H501Z');
        expect(html).toContain('Via Appia Nuova 10, Roma');
    });

    it('dovrebbe evidenziare i recapiti telefonici di emergenza dei genitori in modo prioritario', () => {
        const html = generateScoutMedicalSheetHtml(mockScoutCompleto);
        expect(html).toContain('Lorenzo Totti');
        expect(html).toContain('3339988776');
        expect(html).toContain('Fiorella Totti');
        expect(html).toContain('3335544332');
        expect(html).toContain('Dott. Mario Bianchi');
    });

    it('dovrebbe riportare in evidenza il gruppo sanguigno, le allergie e le intolleranze alimentari', () => {
        const html = generateScoutMedicalSheetHtml(mockScoutCompleto);
        expect(html).toContain('0+');
        expect(html).toContain('Allergia grave a punture di vespe/api');
        expect(html).toContain('Intolleranza al lattosio');
        expect(html).toContain('Ventolin spray');
    });

    it('dovrebbe includere la griglia per il diario delle somministrazioni farmaci al campo a cura dei capi', () => {
        const html = generateScoutMedicalSheetHtml(mockScoutCompleto);
        expect(html).toContain('Registro Somministrazioni Farmaci / Interventi Sanitari al Campo');
        expect(html).toContain('Data e Ora');
        expect(html).toContain('Farmaco somministrato & Dosaggio');
        expect(html).toContain('Firma del Genitore');
        expect(html).toContain('Firma del Capo Reparto');
    });

    it('dovrebbe gestire scout con campi sanitari vuoti senza errori o crash', () => {
        const minimalScout = {
            id: 's_min',
            nome: 'Giulia',
            cognome: 'Neri'
        };

        const html = generateScoutMedicalSheetHtml(minimalScout);
        expect(html).toBeDefined();
        expect(html).toContain('Giulia Neri');
        expect(html).toContain('N.D.'); // Gruppo sanguigno non disponibile
        expect(html).toContain('Nessuna allergia nota segnalata.');
        expect(html).toContain('Nessuna esigenza alimentare specifica.');
    });
});
