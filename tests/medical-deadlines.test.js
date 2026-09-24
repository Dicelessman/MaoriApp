import { describe, it, expect } from 'vitest';
import {
    getScoutMedicalStatus,
    generateWhatsAppReminderUrl,
    getAllScoutYearDeadlines
} from '../js/utils/utils.js';

describe('Documenti & Scadenze Medico-Sanitarie', () => {
    const refDate = new Date(2026, 3, 15); // 15 Aprile 2026

    describe('getScoutMedicalStatus', () => {
        it('dovrebbe segnalare certificato mancante se non specificato', () => {
            const scout = { id: 's0', nome: 'Luigi', cognome: 'Neri' };
            const status = getScoutMedicalStatus(scout, refDate);

            expect(status.certStatus).toBe('missing');
            expect(status.color).toBe('red');
            expect(status.isCompliant).toBe(false);
            expect(status.missingDocuments).toContain('Certificato Medico');
            expect(status.missingDocuments).toContain('Consenso Privacy');
            expect(status.missingDocuments).toContain('Scheda Sanitaria');
        });

        it('dovrebbe segnalare certificato valido con oltre 30 giorni rimanenti', () => {
            const scout = {
                id: 's1',
                nome: 'Mario',
                cognome: 'Rossi',
                san_cert_scadenza: '2026-09-30', // ~5.5 mesi dopo
                doc_priv: true,
                doc_san: true
            };
            const status = getScoutMedicalStatus(scout, refDate);

            expect(status.certStatus).toBe('valid');
            expect(status.color).toBe('green');
            expect(status.daysRemaining).toBeGreaterThan(30);
            expect(status.isCompliant).toBe(true);
            expect(status.missingDocuments.length).toBe(0);
        });

        it('dovrebbe segnalare certificato in scadenza entro 30 giorni', () => {
            const scout = {
                id: 's2',
                nome: 'Luisa',
                cognome: 'Bianchi',
                san_cert_scadenza: '2026-04-30', // 15 giorni dopo il 15 aprile
                doc_priv: true,
                doc_san: true
            };
            const status = getScoutMedicalStatus(scout, refDate);

            expect(status.certStatus).toBe('expiring');
            expect(status.color).toBe('yellow');
            expect(status.daysRemaining).toBe(15);
            expect(status.isCompliant).toBe(false); // In scadenza -> attenzione
            expect(status.statusLabel).toContain('15 gg');
        });

        it('dovrebbe segnalare certificato scaduto', () => {
            const scout = {
                id: 's3',
                nome: 'Andrea',
                cognome: 'Verdi',
                san_cert_scadenza: '2026-03-25', // scaduto da 21 giorni
                doc_priv: false,
                doc_san: true
            };
            const status = getScoutMedicalStatus(scout, refDate);

            expect(status.certStatus).toBe('expired');
            expect(status.color).toBe('red');
            expect(status.daysRemaining).toBeLessThan(0);
            expect(status.isCompliant).toBe(false);
            expect(status.missingDocuments).toContain('Rinnovo Certificato Medico');
            expect(status.missingDocuments).toContain('Consenso Privacy');
            expect(status.missingDocuments).not.toContain('Scheda Sanitaria');
        });
    });

    describe('generateWhatsAppReminderUrl', () => {
        it('dovrebbe formattare correttamente il numero di cellulare italiano a 10 cifre', () => {
            const res = generateWhatsAppReminderUrl({
                scoutNome: 'Mario Rossi',
                scadenzaStr: '30/04/2026',
                telGenitore: '340 1234567',
                certStatus: 'expiring'
            });

            expect(res.phone).toBe('393401234567');
            expect(res.url).toContain('https://wa.me/393401234567');
            expect(res.url).toContain(encodeURIComponent('Mario Rossi'));
            expect(res.message).toContain('Mario Rossi');
            expect(res.message).toContain('30/04/2026');
        });

        it('dovrebbe comporre messaggio di allarme per certificato scaduto', () => {
            const res = generateWhatsAppReminderUrl({
                scoutNome: 'Andrea Verdi',
                scadenzaStr: '25/03/2026',
                telGenitore: '+39 347 9876543',
                certStatus: 'expired',
                missingDocs: ['Rinnovo Certificato Medico', 'Consenso Privacy']
            });

            expect(res.phone).toBe('393479876543');
            expect(res.message).toContain('scaduto');
            expect(res.message).toContain('Consenso Privacy');
            expect(res.message).toContain('Buona Caccia!');
        });

        it('dovrebbe consentire condivisione senza telefono specificato (fallback link universale)', () => {
            const res = generateWhatsAppReminderUrl({
                scoutNome: 'Luigi Neri',
                certStatus: 'missing'
            });

            expect(res.phone).toBe('');
            expect(res.url.startsWith('https://wa.me/?text=')).toBe(true);
        });
    });

    describe('getAllScoutYearDeadlines con Scadenze Mediche', () => {
        it('dovrebbe includere scadenze certificati medici attivi o in scadenza', () => {
            const scouts = [
                {
                    id: 's1',
                    nome: 'Mario',
                    cognome: 'Rossi',
                    san_cert_scadenza: '2026-06-30',
                    doc_priv: true,
                    doc_san: true
                },
                {
                    id: 's2',
                    nome: 'Luisa',
                    cognome: 'Bianchi',
                    san_cert_scadenza: '2026-04-30',
                    doc_priv: true,
                    doc_san: true
                },
                {
                    id: 's3',
                    nome: 'Andrea',
                    cognome: 'Verdi',
                    san_cert_scadenza: '2026-03-25',
                    doc_priv: false,
                    doc_san: false
                }
            ];

            const results = getAllScoutYearDeadlines({
                scoutYear: '2025/2026',
                activities: [],
                presences: [],
                scouts,
                customDeadlines: [],
                refDate
            });

            const medicalDeadlines = results.filter(d => d.type === 'medical');
            expect(medicalDeadlines.length).toBe(3);

            const s2Med = medicalDeadlines.find(d => d.scoutId === 's2');
            expect(s2Med).toBeDefined();
            expect(s2Med.daysUntil).toBe(15);
            expect(s2Med.status).toBe('imminente');
            expect(s2Med.categoria).toBe('Certificati & Documenti');

            const s3Med = medicalDeadlines.find(d => d.scoutId === 's3');
            expect(s3Med).toBeDefined();
            expect(s3Med.status).toBe('scaduta');
            expect(s3Med.descrizione).toContain('Manca Privacy');
            expect(s3Med.descrizione).toContain('Manca Scheda Sanitaria');
        });
    });
});
