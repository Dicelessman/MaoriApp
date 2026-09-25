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

import { UI } from '../js/ui/ui.js';
import '../home.js';

describe('Home Page Controller & Widgets', () => {
    let mockLocalStorage = {};

    beforeEach(() => {
        mockLocalStorage = {};
        global.localStorage = {
            getItem: vi.fn(key => mockLocalStorage[key] || null),
            setItem: vi.fn((key, val) => { mockLocalStorage[key] = String(val); }),
            removeItem: vi.fn(key => { delete mockLocalStorage[key]; }),
            clear: vi.fn(() => { mockLocalStorage = {}; })
        };

        // Reset DOM container
        document.body.innerHTML = `
            <div id="homeHeroBanner"></div>
            <div id="homeNextActivityContainer"></div>
            <div id="homeFollowingActivitiesContainer"></div>
            <div id="homeDeadlinesContainer"></div>
            <div id="homeExternalLinksContainer"></div>
            <div id="homeLinkModal" class="hidden">
                <input id="homeLinkId" />
                <input id="homeLinkTitle" />
                <input id="homeLinkUrl" />
                <input id="homeLinkIcon" />
                <input id="homeLinkDesc" />
                <h3 id="homeLinkModalTitle"></h3>
                <form id="homeLinkModalForm"></form>
            </div>
            <button id="addExternalLinkBtn"></button>
            <button id="resetExternalLinksBtn"></button>
        `;

        UI.state = {
            activities: [
                { id: 'act_1', tipo: 'Attività lunga', descrizione: 'Uscita Parco Naturale', data: '2026-10-15', costo: 0 },
                { id: 'act_2', tipo: 'Riunione', descrizione: 'Pianificazione Impresa', data: '2026-10-22', costo: 0 },
                { id: 'act_3', tipo: 'Uscita', descrizione: 'Bivacco in rifugio', data: '2026-11-05', dataFine: '2026-11-06', costo: 15 },
                { id: 'act_4', tipo: 'Campo', descrizione: 'Campo Invernale', data: '2026-12-27', costo: 80 }
            ],
            scouts: [
                { id: 's1', nome: 'Marco', cognome: 'Rossi', pv_pattuglia: 'Aironi', anag_dob: '2012-10-20', san_cert_scadenza: '2026-10-30', doc_priv: true, doc_san: true },
                { id: 's2', nome: 'Lucia', cognome: 'Bianchi', pv_pattuglia: 'Marmotte', anag_dob: '2013-05-12', san_cert_scadenza: '2026-09-01', doc_priv: false, doc_san: true }
            ],
            presences: [
                { esploratoreId: 's1', attivitaId: 'act_1', stato: 'Presente', pagato: true },
                { esploratoreId: 's2', attivitaId: 'act_1', stato: 'Assente', pagato: false }
            ],
            scadenze: [
                { id: 'c1', titolo: 'Prenotazione pulmino', dataScadenza: '2026-10-10', completata: false, categoria: 'Logistica' },
                { id: 'c2', titolo: 'Acquisto materiale cambusa', dataScadenza: '2026-10-12', completata: false, categoria: 'Cambusa' }
            ]
        };
    });

    describe('Widget Prossima Attività (Home)', () => {
        it('dovrebbe renderizzare la prossima attività con KPI e pulsante Gestisci Presenze', () => {
            UI.renderNextActivityWidgetHome();

            const container = document.getElementById('homeNextActivityContainer');
            expect(container.innerHTML).toContain('Uscita Parco Naturale');
            expect(container.innerHTML).toContain('ATTIVITÀ LUNGA');
            expect(container.innerHTML).toContain('Gestisci Presenze');
            expect(container.innerHTML).toContain('Presenze Confermate');
            expect(container.innerHTML).toContain('Quote di Partecipazione');
        });

        it('NON deve includere la sezione di allarme medico/sanitario (come da richiesta)', () => {
            UI.renderNextActivityWidgetHome();

            const container = document.getElementById('homeNextActivityContainer');
            // Non deve esserci il box allarme medico
            expect(container.innerHTML).not.toContain('Allarme Sicurezza Sanitaria');
            expect(container.innerHTML).not.toContain('toggleMedicalAlertListBtn');
            expect(container.innerHTML).not.toContain('WhatsApp Genitore');
        });
    });

    describe('Due Attività Oltre la Prossima (Stile Calendario)', () => {
        it('dovrebbe renderizzare le due attività successive (act_2 e act_3), escludendo la prima (act_1)', () => {
            UI.renderUpcomingNextTwoActivities();

            const container = document.getElementById('homeFollowingActivitiesContainer');
            // act_1 è la prima e deve essere esclusa
            expect(container.innerHTML).not.toContain('Uscita Parco Naturale');

            // act_2 e act_3 devono essere presenti
            expect(container.innerHTML).toContain('Pianificazione Impresa');
            expect(container.innerHTML).toContain('Bivacco in rifugio');
            expect(container.innerHTML).toContain('Riunione');
            expect(container.innerHTML).toContain('Uscita');

            // act_4 (la quarta) non deve essere inclusa (solo due oltre la prossima)
            expect(container.innerHTML).not.toContain('Campo Invernale');
        });

        it('dovrebbe mostrare messaggio di cortesia se non ci sono attività future', () => {
            UI.state.activities = [];
            UI.renderUpcomingNextTwoActivities();

            const container = document.getElementById('homeFollowingActivitiesContainer');
            expect(container.innerHTML).toContain('Nessuna ulteriore attività programmata');
        });
    });

    describe('Finestra Inline Prossime 5 Scadenze', () => {
        it('dovrebbe calcolare ed estrarre al massimo 5 scadenze imminenti/attive con link a scadenze.html', () => {
            UI.renderUpcomingDeadlinesWidget();

            const container = document.getElementById('homeDeadlinesContainer');
            expect(container.innerHTML).toContain('Prenotazione pulmino');
            expect(container.innerHTML).toContain('Acquisto materiale cambusa');

            // Deve contenere elementi con link verso scadenze o dettagli
            const links = container.querySelectorAll('a');
            expect(links.length).toBeGreaterThan(0);
            expect(links.length).toBeLessThanOrEqual(5);
        });
    });

    describe('Link Esterni Configurabili', () => {
        it('dovrebbe caricare i link predefiniti (Google Drive, CNGEI, ecc.)', () => {
            const links = UI.getExternalLinks();
            expect(links.length).toBeGreaterThanOrEqual(4);
            expect(links.some(l => l.title.includes('Google Drive'))).toBe(true);
            expect(links.some(l => l.title.includes('CNGEI'))).toBe(true);
        });

        it('dovrebbe renderizzare le card dei link esterni con attributo target=_blank', () => {
            UI.renderExternalLinksWidget();

            const container = document.getElementById('homeExternalLinksContainer');
            expect(container.innerHTML).toContain('Google Drive di Reparto');
            expect(container.innerHTML).toContain('target="_blank"');
            expect(container.innerHTML).toContain('rel="noopener noreferrer"');
        });

        it('dovrebbe consentire l\'aggiunta e la persistenza di un nuovo link esterno', async () => {
            const current = UI.getExternalLinks();
            const newLink = {
                id: 'custom_link_1',
                title: 'Canale Telegram Genitori',
                url: 'https://t.me/scoutmaori',
                icon: '📢',
                description: 'Comunicazioni rapide'
            };

            await UI.saveExternalLinks([...current, newLink]);

            const updated = UI.getExternalLinks();
            expect(updated.some(l => l.id === 'custom_link_1')).toBe(true);
            expect(global.localStorage.setItem).toHaveBeenCalled();
        });

        it('dovrebbe eliminare un link esterno', async () => {
            const list = [
                { id: 'l1', title: 'Link 1', url: 'https://test1.com' },
                { id: 'l2', title: 'Link 2', url: 'https://test2.com' }
            ];
            await UI.saveExternalLinks(list);

            UI.showConfirmModal = vi.fn(({ onConfirm }) => onConfirm());
            await UI.deleteExternalLink('l1');

            const remaining = UI.getExternalLinks();
            expect(remaining.length).toBe(1);
            expect(remaining[0].id).toBe('l2');
        });
    });
});
