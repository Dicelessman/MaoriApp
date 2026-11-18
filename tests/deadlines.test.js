import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/core/firebase.js', () => ({
  db: {},
  auth: {},
  messaging: null,
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  Timestamp: { now: () => new Date(), fromDate: (d) => d },
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn(),
  browserLocalPersistence: {},
  getToken: vi.fn(),
  onMessage: vi.fn()
}));

import {
    getAllScoutYearDeadlines,
    generateDeadlineShareText,
    generateDeadlinesDigestText,
    generateGoogleCalendarUrl,
    generateDeadlinesIcs
} from '../js/utils/utils.js';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';
import { scadenzeController, ScadenzeController } from '../scadenze.js';

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

    describe('ScadenzeController - Ordinamento e separazione scadenze passate', () => {
        let controller;

        beforeEach(() => {
            controller = new ScadenzeController();
            controller.allDeadlines = [
                {
                    id: 'past-old',
                    type: 'activity',
                    titolo: 'Uscita Autunno',
                    descrizione: 'Attività passata',
                    categoria: 'Attività',
                    dataScadenza: '2025-10-12',
                    daysUntil: -60,
                    completata: true,
                    isCustom: false,
                    url: 'attivita.html'
                },
                {
                    id: 'past-overdue',
                    type: 'payment',
                    titolo: 'Quota Tesseramento Scaduta',
                    descrizione: 'Quota non ancora saldata',
                    categoria: 'Quote',
                    dataScadenza: '2025-11-20',
                    daysUntil: -20,
                    completata: false,
                    isCustom: false,
                    url: 'pagamenti.html'
                },
                {
                    id: 'future-far',
                    type: 'custom',
                    titolo: 'Campo Estivo',
                    descrizione: 'Preparazione materiali',
                    categoria: 'Logistica',
                    dataScadenza: '2026-06-15',
                    daysUntil: 45,
                    completata: false,
                    isCustom: true,
                    priorita: 'Media'
                },
                {
                    id: 'future-completed',
                    type: 'custom',
                    titolo: 'Prenotazione Pulmino',
                    descrizione: 'Già confermata in anticipo',
                    categoria: 'Logistica',
                    dataScadenza: '2026-05-20',
                    daysUntil: 19,
                    completata: true,
                    isCustom: true,
                    priorita: 'Bassa'
                },
                {
                    id: 'imminent-soon',
                    type: 'activity',
                    titolo: 'Uscita di Pasqua',
                    descrizione: 'Prossima attività',
                    categoria: 'Attività',
                    dataScadenza: '2026-05-05',
                    daysUntil: 4,
                    completata: false,
                    isCustom: false,
                    url: 'attivita.html'
                }
            ];
            document.body.innerHTML = `
                <div id="deadlinesListContainer"></div>
                <div id="emptyStateContainer" class="hidden"></div>
            `;
        });

        it('dovrebbe esportare istanza scadenzeController e classe ScadenzeController', () => {
            expect(scadenzeController).toBeInstanceOf(ScadenzeController);
        });

        it('dovrebbe mettere sempre le scadenze ancora da venire o imminenti prima di quelle passate e completate', () => {
            controller.currentSort = 'date-asc';
            const sorted = controller.getFilteredAndSortedDeadlines();

            expect(sorted.map(d => d.id)).toEqual([
                'imminent-soon',
                'future-far',
                'future-completed',
                'past-overdue',
                'past-old'
            ]);

            // Anche con ordinamento alfabetico o data decrescente, le imminenti/future restano prima delle passate
            controller.currentSort = 'title-asc';
            const sortedAlpha = controller.getFilteredAndSortedDeadlines();
            expect(sortedAlpha.slice(0, 2).map(d => d.id)).toEqual(['future-far', 'imminent-soon']);
        });

        it('dovrebbe separare le scadenze passate e completate dentro #pastDeadlinesSection lasciando le imminenti in alto', () => {
            controller.renderList();

            const container = document.getElementById('deadlinesListContainer');
            const pastSection = document.getElementById('pastDeadlinesSection');
            const pastList = document.getElementById('pastDeadlinesList');

            expect(pastSection).not.toBeNull();
            expect(pastSection.hasAttribute('open')).toBe(false);
            expect(pastList).not.toBeNull();

            // Le scadenze da venire devono comparire nella parte principale (fuori da #pastDeadlinesSection)
            const directCardsHtml = Array.from(container.children)
                .filter(el => el.id !== 'pastDeadlinesSection')
                .map(el => el.textContent)
                .join(' ');
            expect(directCardsHtml).toContain('Uscita di Pasqua');
            expect(directCardsHtml).toContain('Campo Estivo');
            expect(directCardsHtml).not.toContain('Uscita Autunno');
            expect(directCardsHtml).not.toContain('Quota Tesseramento Scaduta');
            expect(directCardsHtml).not.toContain('Prenotazione Pulmino');

            // Le passate e completate devono stare in #pastDeadlinesSection
            expect(pastSection.textContent).toContain('Scadenze Passate e Completate (3)');
            expect(pastSection.textContent).toContain('1 da verificare');
            expect(pastList.textContent).toContain('Uscita Autunno');
            expect(pastList.textContent).toContain('Quota Tesseramento Scaduta');
            expect(pastList.textContent).toContain('Prenotazione Pulmino');
        });

        it('dovrebbe mostrare avviso informativo e sezione passate quando non ci sono scadenze future', () => {
            controller.allDeadlines = controller.allDeadlines.filter(d => controller.isPastOrCompleted(d));
            controller.renderList();

            const container = document.getElementById('deadlinesListContainer');
            const pastSection = document.getElementById('pastDeadlinesSection');
            expect(container.textContent).toContain('Nessuna scadenza imminente o futura');
            expect(pastSection).not.toBeNull();
        });

        it('dovrebbe mostrare elenco diretto senza collassare quando si filtra per overdue o completed', () => {
            controller.currentFilterStatus = 'overdue';
            controller.renderList();
            expect(document.getElementById('pastDeadlinesSection')).toBeNull();
            expect(document.getElementById('deadlinesListContainer').textContent).toContain('Quota Tesseramento Scaduta');

            controller.currentFilterStatus = 'completed';
            controller.renderList();
            expect(document.getElementById('pastDeadlinesSection')).toBeNull();
            expect(document.getElementById('deadlinesListContainer').textContent).toContain('Uscita Autunno');
        });

        it('dovrebbe renderizzare azioni rapide multi-canale sulle card (notify-push, share-whatsapp, add-gcal)', () => {
            controller.allDeadlines.push({
                id: 'med_s1',
                type: 'medical',
                scoutId: 's1',
                titolo: 'Certificato Medico: Marco Rossi',
                descrizione: 'In scadenza',
                categoria: 'Certificati & Documenti',
                dataScadenza: '2026-05-06',
                daysUntil: 5,
                completata: false,
                isCustom: false,
                medStatus: { certStatus: 'expiring', formattedDate: '06/05/2026', missingDocuments: [] },
                scout: { id: 's1', nome: 'Marco', cognome: 'Rossi', ct_g1_tel: '3331234567' }
            });
            controller.renderList();

            const container = document.getElementById('deadlinesListContainer');
            expect(container.querySelector('[data-action="notify-push"][data-id="imminent-soon"]')).not.toBeNull();
            expect(container.querySelector('[data-action="share-whatsapp"][data-id="imminent-soon"]')).not.toBeNull();
            expect(container.querySelector('[data-action="add-gcal"][data-id="imminent-soon"]')).not.toBeNull();

            // Le card medical hanno già il link WhatsApp genitore dedicato, quindi non duplicano share-whatsapp
            expect(container.querySelector('[data-action="notify-push"][data-id="med_s1"]')).not.toBeNull();
            expect(container.querySelector('[data-action="add-gcal"][data-id="med_s1"]')).not.toBeNull();
            expect(container.querySelector('[data-action="share-whatsapp"][data-id="med_s1"]')).toBeNull();
        });
    });

    describe('Scadenze Multi-Canale - Share, Google Calendar e iCalendar (.ics)', () => {
        const sampleItem = {
            id: 'scad_1',
            titolo: 'Consegna Moduli Campo Estivo',
            categoria: 'Documenti / Burocrazia',
            dataScadenza: '2026-07-10',
            daysUntil: 3,
            descrizione: 'Portare firme di entrambi i genitori',
            completata: false
        };

        it('generateDeadlineShareText dovrebbe formattare correttamente il promemoria singolo', () => {
            const text = generateDeadlineShareText(sampleItem, 'Reparto Maori');
            expect(text).toContain('Reparto Maori');
            expect(text).toContain('Consegna Moduli Campo Estivo');
            expect(text).toContain('10/07/2026');
            expect(text).toContain('tra 3 giorni');
            expect(text).toContain('Portare firme di entrambi i genitori');
        });

        it('generateDeadlinesDigestText dovrebbe generare un bollettino escludendo le scadenze completate', () => {
            const list = [
                sampleItem,
                { id: 'done_1', titolo: 'Già Fatta', dataScadenza: '2026-07-08', daysUntil: 1, completata: true },
                { id: 'over_1', titolo: 'Quota Scaduta', dataScadenza: '2026-07-05', daysUntil: -2, completata: false }
            ];
            const digest = generateDeadlinesDigestText(list, 'Reparto Maori');
            expect(digest).toContain('Riepilogo Scadenze Imminenti');
            expect(digest).toContain('Consegna Moduli Campo Estivo');
            expect(digest).toContain('Quota Scaduta');
            expect(digest).toContain('scaduta da 2 giorni');
            expect(digest).not.toContain('Già Fatta');
        });

        it('generateGoogleCalendarUrl dovrebbe creare link calendar valido con data inizio/fine all-day', () => {
            const url = generateGoogleCalendarUrl(sampleItem);
            expect(url).toContain('https://calendar.google.com/calendar/render?');
            expect(url).toContain('action=TEMPLATE');
            expect(url).toContain('dates=20260710%2F20260711');
            expect(url).toContain('Consegna+Moduli+Campo+Estivo');
        });

        it('generateDeadlinesIcs dovrebbe generare calendario RFC 5545 con VEVENT e doppia sveglia VALARM', () => {
            const ics = generateDeadlinesIcs([sampleItem], 'Scadenze Reparto Maori');
            expect(ics).toContain('BEGIN:VCALENDAR');
            expect(ics).toContain('VERSION:2.0');
            expect(ics).toContain('BEGIN:VEVENT');
            expect(ics).toContain('UID:scad_1@maori.scout');
            expect(ics).toContain('DTSTART;VALUE=DATE:20260710');
            expect(ics).toContain('DTEND;VALUE=DATE:20260711');
            expect(ics).toContain('SUMMARY:Consegna Moduli Campo Estivo');
            expect(ics).toContain('BEGIN:VALARM');
            expect(ics).toContain('TRIGGER:-P3D');
            expect(ics).toContain('TRIGGER:-P1D');
            expect(ics).toContain('END:VCALENDAR');
        });
    });
});

