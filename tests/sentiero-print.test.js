import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
import { DATA } from '../js/data/data-facade.js';

describe('UI Sentiero Printing (Single & Batch)', () => {
    const mockScouts = [
        { id: 's1', nome: 'Marco', cognome: 'Rossi', pv_pattuglia: 'Aquile', pv_promessa: '2024-01-01' },
        { id: 's2', nome: 'Giulia', cognome: 'Bianchi', pv_pattuglia: 'Volpi', pv_promessa: '2024-02-01' }
    ];

    beforeEach(() => {
        document.body.innerHTML = '<div id="printArea" style="display:none;"></div>';
        UI.state = { scouts: [...mockScouts], allScouts: [...mockScouts] };
        UI.challengesData = { "1": { "IO": [], "AL": [], "MT": [] } };
        UI.specialitaListData = [];
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    describe('printSentieroBatch', () => {
        it('dovrebbe essere definita su UI', () => {
            expect(typeof UI.printSentieroBatch).toBe('function');
        });

        it('dovrebbe mostrare un avviso se nessun ID è fornito', async () => {
            const toastSpy = vi.spyOn(UI, 'showToast').mockImplementation(() => {});
            await UI.printSentieroBatch([]);
            expect(toastSpy).toHaveBeenCalledWith('Nessun esploratore selezionato', { type: 'warning' });
        });

        it('dovrebbe generare le schede per tutti gli esploratori e chiamare _printHtmlInArea con interruzioni di pagina', async () => {
            const printSpy = vi.spyOn(UI, '_printHtmlInArea').mockImplementation(() => {});

            await UI.printSentieroBatch(['s1', 's2'], 'Schede Sentiero — Reparto');

            expect(printSpy).toHaveBeenCalled();
            const [printedHtml, printedTitle] = printSpy.mock.calls[0];

            expect(printedTitle).toBe('Schede Sentiero — Reparto');
            expect(printedHtml).toContain('Il sentiero di Marco');
            expect(printedHtml).toContain('Il sentiero di Giulia');
            expect(printedHtml).toContain('page-break-after: always');
        });

        it('dovrebbe gestire il caso di esploratori non trovati', async () => {
            const toastSpy = vi.spyOn(UI, 'showToast').mockImplementation(() => {});
            await UI.printSentieroBatch(['s_non_esiste']);
            expect(toastSpy).toHaveBeenCalledWith('Nessun esploratore trovato', { type: 'warning' });
        });
    });

    describe('printSentieroSingle', () => {
        it('dovrebbe essere definita su UI', () => {
            expect(typeof UI.printSentieroSingle).toBe('function');
        });

        it('dovrebbe mostrare un errore se scoutId non è fornito', async () => {
            const toastSpy = vi.spyOn(UI, 'showToast').mockImplementation(() => {});
            await UI.printSentieroSingle(null);
            expect(toastSpy).toHaveBeenCalledWith('ID esploratore mancante', { type: 'error' });
        });

        it('dovrebbe stampare la scheda del singolo esploratore', async () => {
            const printSpy = vi.spyOn(UI, '_printHtmlInArea').mockImplementation(() => {});

            await UI.printSentieroSingle('s1');

            expect(printSpy).toHaveBeenCalled();
            const [printedHtml, printedTitle] = printSpy.mock.calls[0];

            expect(printedTitle).toBe('Il Sentiero di Marco');
            expect(printedHtml).toContain('Il sentiero di Marco');
            expect(printedHtml).toContain('Pattuglia Aquile');
        });
    });

    describe('executePrintSchede (esploratori.js integration)', () => {
        beforeEach(async () => {
            // Import esploratori.js to attach UI.executePrintSchede
            await import('../esploratori.js');
        });

        it('dovrebbe stampare le schede di tutto il reparto se nessuna pattuglia è selezionata', async () => {
            document.body.innerHTML = `
                <div id="printArea" style="display:none;"></div>
                <div id="printSchedeModal" class="modal"></div>
                <select id="printPattugliaSelect">
                    <option value="" selected>Tutto il Reparto</option>
                    <option value="Aquile">Aquile</option>
                </select>
            `;
            const batchSpy = vi.spyOn(UI, 'printSentieroBatch').mockImplementation(async () => {});
            const closeSpy = vi.spyOn(UI, 'closeModal').mockImplementation(() => {});

            await UI.executePrintSchede();

            expect(closeSpy).toHaveBeenCalledWith('printSchedeModal');
            expect(batchSpy).toHaveBeenCalledWith(['s1', 's2'], 'Schede Sentiero — Tutto il Reparto');
        });

        it('dovrebbe stampare solo le schede della pattuglia selezionata', async () => {
            document.body.innerHTML = `
                <div id="printArea" style="display:none;"></div>
                <div id="printSchedeModal" class="modal"></div>
                <select id="printPattugliaSelect">
                    <option value="">Tutto il Reparto</option>
                    <option value="Aquile" selected>Aquile</option>
                </select>
            `;
            const batchSpy = vi.spyOn(UI, 'printSentieroBatch').mockImplementation(async () => {});

            await UI.executePrintSchede();

            expect(batchSpy).toHaveBeenCalledWith(['s1'], 'Schede Sentiero — Pattuglia Aquile');
        });
    });
});
