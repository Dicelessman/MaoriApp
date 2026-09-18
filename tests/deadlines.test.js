import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAllScoutYearDeadlines } from '../js/utils/utils.js';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';

describe('Scout Year Deadlines - Utility & Adapter', () => {
    describe('getAllScoutYearDeadlines', () => {
        const refDate = new Date(2025, 9, 15); // 15 Ottobre 2025 (Anno scout 2025/2026)

        const sampleActivities = [
            // In scout year 2025/2026
            { id: 'act1', tipo: 'Uscita', data: '2025-10-18', descrizione: 'Uscita ai Colli', costo: '12' },
            { id: 'act2', tipo: 'Riunione', data: '2025-10-15', descrizione: 'Riunione Reparto', costo: '0' },
            { id: 'act3', tipo: 'San Giorgio', data: '2026-04-25', descrizione: 'Campo San Giorgio', costo: '30' },
            // Past activity in scout year 2025/2026
            { id: 'act4', tipo: 'Apertura', data: '2025-10-05', descrizione: 'Cerimonia Apertura', costo: '5' },
            // Activity in different scout year (2024/2025)
            { id: 'act_old', tipo: 'Campo Estivo', data: '2025-07-20', descrizione: 'Campo Estivo 2025', costo: '150' }
        ];

        const samplePresences = [
            // act1 (12€): 2 present, 1 paid, 1 unpaid
            { esploratoreId: 'scout1', attivitaId: 'act1', stato: 'Presente', pagato: true },
            { esploratoreId: 'scout2', attivitaId: 'act1', stato: 'Presente', pagato: false },
            { esploratoreId: 'scout3', attivitaId: 'act1', stato: 'Assente', pagato: false },
            // act4 (5€): 1 present unpaid
            { esploratoreId: 'scout1', attivitaId: 'act4', stato: 'Presente', pagato: false }
        ];

        const sampleScouts = [
            { id: 'scout1', nome: 'Akela', cognome: 'Test', anag_dob: '2012-10-20', pv_pattuglia: 'Aironi' },
            { id: 'scout2', nome: 'Baloo', cognome: 'Test', anag_dob: '2011-03-10', pv_pattuglia: 'Lupi' },
            { id: 'scout_arch', nome: 'Archived', cognome: 'User', anag_dob: '2012-10-25', archived: true }
        ];

        const sampleCustomDeadlines = [
            {
                id: 'cd1',
                titolo: 'Consegna autorizzazioni San Giorgio',
                dataScadenza: '2026-04-10',
                categoria: 'Documenti / Burocrazia',
                note: 'Raccogliere moduli firmati da entrambi i genitori',
                completata: false,
                priorita: 'Alta',
                annoScout: '2025/2026'
            },
            {
                id: 'cd2',
                titolo: 'Acquisto materiale cambusa',
                dataScadenza: '2025-10-10',
                categoria: 'Logistica / Sede',
                completata: true,
                annoScout: '2025/2026'
            }
        ];

        it('should aggregate activities, payments, birthdays and custom deadlines for the scout year', () => {
            const results = getAllScoutYearDeadlines({
                scoutYear: '2025/2026',
                activities: sampleActivities,
                presences: samplePresences,
                scouts: sampleScouts,
                customDeadlines: sampleCustomDeadlines,
                refDate
            });

            expect(results.length).toBeGreaterThan(0);

            // Should contain activities in 2025/2026 but NOT act_old (from 2024/2025)
            const activityIds = results.filter(r => r.type === 'activity').map(r => r.originalId);
            expect(activityIds).toContain('act1');
            expect(activityIds).toContain('act2');
            expect(activityIds).toContain('act3');
            expect(activityIds).toContain('act4');
            expect(activityIds).not.toContain('act_old');

            // Should contain payment deadlines for act1 and act4
            const paymentItems = results.filter(r => r.type === 'payment');
            expect(paymentItems.length).toBe(2);
            const act1Pay = paymentItems.find(p => p.originalId === 'act1');
            expect(act1Pay).toBeDefined();
            expect(act1Pay.pendingCount).toBe(1);
            expect(act1Pay.totalAmount).toBe(12);

            // Should contain birthdays for active scouts only
            const bdays = results.filter(r => r.type === 'birthday');
            expect(bdays.length).toBe(2);
            expect(bdays.map(b => b.originalId)).not.toContain('scout_arch');
            const s1Bday = bdays.find(b => b.originalId === 'scout1');
            expect(s1Bday.turningAge).toBe(13); // 2025 - 2012 = 13
            expect(s1Bday.daysUntil).toBe(5); // 15 Oct -> 20 Oct = 5 days

            // Should contain custom deadlines
            const customItems = results.filter(r => r.isCustom);
            expect(customItems.length).toBe(2);
            const cd1 = customItems.find(c => c.originalId === 'cd1');
            expect(cd1.status).toBe('futura');
            const cd2 = customItems.find(c => c.originalId === 'cd2');
            expect(cd2.completata).toBe(true);
            expect(cd2.status).toBe('completata');
        });

        it('should correctly determine status (scaduta, oggi, imminente, futura, completata)', () => {
            const results = getAllScoutYearDeadlines({
                scoutYear: '2025/2026',
                activities: sampleActivities,
                presences: [],
                scouts: [],
                customDeadlines: [],
                refDate
            });

            // act2 is on 2025-10-15 (today)
            const act2 = results.find(r => r.originalId === 'act2');
            expect(act2.daysUntil).toBe(0);
            expect(act2.status).toBe('oggi');

            // act1 is on 2025-10-18 (in 3 days -> imminente)
            const act1 = results.find(r => r.originalId === 'act1');
            expect(act1.daysUntil).toBe(3);
            expect(act1.status).toBe('imminente');

            // act4 is on 2025-10-05 (past -> scaduta / completata for activities)
            const act4 = results.find(r => r.originalId === 'act4');
            expect(act4.daysUntil).toBeLessThan(0);
            expect(act4.completata).toBe(true);

            // act3 is on 2026-04-25 (> 7 days -> futura)
            const act3 = results.find(r => r.originalId === 'act3');
            expect(act3.daysUntil).toBeGreaterThan(7);
            expect(act3.status).toBe('futura');
        });
    });

    describe('LocalAdapter custom deadlines CRUD', () => {
        let adapter;

        beforeEach(() => {
            const mockStorage = {};
            global.localStorage = {
                getItem: vi.fn(key => mockStorage[key] || null),
                setItem: vi.fn((key, val) => { mockStorage[key] = val; }),
                removeItem: vi.fn(key => { delete mockStorage[key]; }),
                clear: vi.fn(() => { for (const k in mockStorage) delete mockStorage[k]; })
            };
            adapter = new LocalAdapter();
        });

        it('should perform add, read, update, and delete on custom deadlines', async () => {
            const user = { email: 'staff@test.it' };

            // 1. Initial list
            let list = await adapter.getCustomDeadlines();
            expect(list).toEqual([]);

            // 2. Add
            const newId = await adapter.addCustomDeadline({
                titolo: 'Rinnovo Assicurazione Sede',
                dataScadenza: '2026-01-15',
                categoria: 'Documenti / Burocrazia',
                note: 'Polizza annuale',
                priorita: 'Alta',
                annoScout: '2025/2026'
            }, user);

            expect(newId).toBeDefined();
            list = await adapter.getCustomDeadlines();
            expect(list.length).toBe(1);
            expect(list[0].titolo).toBe('Rinnovo Assicurazione Sede');
            expect(list[0].createdBy).toBe('staff@test.it');
            expect(list[0].completata).toBe(false);

            // 3. Update
            await adapter.updateCustomDeadline(newId, {
                completata: true,
                note: 'Polizza pagata e archiviata'
            }, user);

            list = await adapter.getCustomDeadlines();
            expect(list[0].completata).toBe(true);
            expect(list[0].note).toBe('Polizza pagata e archiviata');
            expect(list[0].updatedAt).toBeDefined();

            // 4. Delete
            await adapter.deleteCustomDeadline(newId, user);
            list = await adapter.getCustomDeadlines();
            expect(list.length).toBe(0);
        });

        it('should persist custom deadlines across multiple adapter instances', async () => {
            const user = { email: 'staff@test.it' };
            await adapter.addCustomDeadline({
                titolo: 'Revisione cambusa',
                dataScadenza: '2026-03-01',
                categoria: 'Logistica / Sede',
                annoScout: '2025/2026'
            }, user);

            // Create a new adapter instance reading from the same mockStorage
            const newAdapter = new LocalAdapter();
            const list = await newAdapter.getCustomDeadlines();
            expect(list.length).toBe(1);
            expect(list[0].titolo).toBe('Revisione cambusa');
        });
    });
});

