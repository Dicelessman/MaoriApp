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
import { getCurrentScoutYear } from '../js/utils/utils.js';
import '../pagamenti.js';

describe('Pagamenti per Attività - Filtro Anno Scout in Corso', () => {
    const currentYear = getCurrentScoutYear(); // es. '2025/2026'

    const mockScouts = [
        { id: 's1', nome: 'Mario', cognome: 'Rossi', pv_pattuglia: 'Aquile', archived: false },
        { id: 's2', nome: 'Luigi', cognome: 'Verdi', pv_pattuglia: 'Volpi', archived: false },
        { id: 's3', nome: 'Anna', cognome: 'Bianchi', pv_pattuglia: 'Aquile', archived: false }
    ];

    // Attività nell'anno in corso e in anni precedenti
    const mockActivities = [
        {
            id: 'act_curr_1',
            tipo: 'Uscita',
            descrizione: 'Uscita Autunnale In Corso',
            data: '2025-10-15',
            annoScout: currentYear,
            costo: '15'
        },
        {
            id: 'act_curr_2',
            tipo: 'Riunione',
            descrizione: 'Riunione Ordinaria Gratuita',
            data: '2025-11-05',
            annoScout: currentYear,
            costo: '0'
        },
        {
            id: 'act_past_1',
            tipo: 'Campo',
            descrizione: 'Campo Estivo Anno Precedente',
            data: '2024-07-20',
            annoScout: '2023/2024',
            costo: '120'
        }
    ];

    const mockPresences = [
        // act_curr_1: s1 presente pagato, s2 presente non pagato, s3 assente
        { id: 's1_act_curr_1', esploratoreId: 's1', attivitaId: 'act_curr_1', stato: 'Presente', pagato: true, tipoPagamento: 'Contanti' },
        { id: 's2_act_curr_1', esploratoreId: 's2', attivitaId: 'act_curr_1', stato: 'Presente', pagato: false, tipoPagamento: null },
        { id: 's3_act_curr_1', esploratoreId: 's3', attivitaId: 'act_curr_1', stato: 'Assente', pagato: false, tipoPagamento: null },
        // act_past_1: s1 presente pagato
        { id: 's1_act_past_1', esploratoreId: 's1', attivitaId: 'act_past_1', stato: 'Presente', pagato: true, tipoPagamento: 'Bonifico' }
    ];

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="app">
                <span id="currentYearBadge"></span>
                <select id="paymentScoutYearFilter"></select>
                <div id="paymentSummaryKpis"></div>
                <div id="paymentsList"></div>
            </div>
        `;

        UI.state = {
            scouts: [...mockScouts],
            activities: [...mockActivities],
            presences: [...mockPresences]
        };
        UI.paymentScoutYearFilter = null;
        UI.currentUser = { uid: 'u1', email: 'capo@scoutmaori.it' };
        UI.selectedStaffId = 'st1';
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('dovrebbe configurare il selettore con l\'anno scout in corso selezionato per default', () => {
        UI.setupPaymentsScoutYearFilter();

        const badge = document.getElementById('currentYearBadge');
        const select = document.getElementById('paymentScoutYearFilter');

        expect(badge.textContent).toBe(currentYear);
        expect(select.value).toBe(currentYear);
        expect(UI.paymentScoutYearFilter).toBe(currentYear);

        // Deve contenere l'anno in corso, gli anni passati e l'opzione 'all'
        const optionValues = Array.from(select.options).map(o => o.value);
        expect(optionValues).toContain(currentYear);
        expect(optionValues).toContain('2023/2024');
        expect(optionValues).toContain('all');
    });

    it('dovrebbe mostrare SOLO le attività con quota dell\'anno scout in corso per default', () => {
        UI.renderPaymentsPerActivity();

        const container = document.getElementById('paymentsList');
        const renderedText = container.textContent;

        // L'uscita dell'anno in corso deve essere presente
        expect(renderedText).toContain('Uscita Autunnale In Corso');

        // L'attività gratuita dell'anno in corso non deve essere mostrata (costo 0)
        expect(renderedText).not.toContain('Riunione Ordinaria Gratuita');

        // L'attività dell'anno precedente NON deve essere mostrata
        expect(renderedText).not.toContain('Campo Estivo Anno Precedente');
    });

    it('dovrebbe calcolare correttamente i KPI per l\'anno scout in corso', () => {
        UI.renderPaymentsPerActivity();

        const kpis = document.getElementById('paymentSummaryKpis');
        expect(kpis).not.toBeNull();

        // 1 attività con quota (act_curr_1: costo 15)
        // Presenti eligibili: s1 e s2 (2 ragazzi)
        // Incasso Atteso: 2 * 15 = € 30.00
        // Totale Incassato: s1 ha pagato = € 15.00
        // Da Riscuotere: s2 non ha pagato = € 15.00
        expect(kpis.textContent).toContain('€ 30.00'); // Atteso
        expect(kpis.textContent).toContain('€ 15.00'); // Incassato
        expect(kpis.textContent).toContain('1'); // 1 attività con quota
    });

    it('dovrebbe aggiornare la vista quando si seleziona un altro anno scout', () => {
        UI.renderPaymentsPerActivity();

        const select = document.getElementById('paymentScoutYearFilter');
        select.value = '2023/2024';
        select.dispatchEvent(new Event('change'));

        const container = document.getElementById('paymentsList');
        expect(container.textContent).toContain('Campo Estivo Anno Precedente');
        expect(container.textContent).not.toContain('Uscita Autunnale In Corso');
    });

    it('dovrebbe mostrare tutte le attività se si seleziona "Tutti gli anni"', () => {
        UI.renderPaymentsPerActivity();

        const select = document.getElementById('paymentScoutYearFilter');
        select.value = 'all';
        select.dispatchEvent(new Event('change'));

        const container = document.getElementById('paymentsList');
        expect(container.textContent).toContain('Campo Estivo Anno Precedente');
        expect(container.textContent).toContain('Uscita Autunnale In Corso');
    });

    it('dovrebbe mostrare un messaggio informativo elegante se non ci sono attività con quota per l\'anno scelto', () => {
        UI.state.activities = [
            { id: 'act_free', tipo: 'Riunione', data: '2025-10-01', annoScout: currentYear, costo: '0' }
        ];

        UI.renderPaymentsPerActivity();

        const container = document.getElementById('paymentsList');
        expect(container.textContent).toContain('Nessuna attività con quota');
        expect(container.textContent).toContain(currentYear);
    });

    it('dovrebbe aggiornare il pagamento tramite updatePaymentCombined', async () => {
        const updateSpy = vi.spyOn(DATA, 'updatePresence').mockResolvedValue(true);
        const toastSpy = vi.spyOn(UI, 'showToast').mockImplementation(() => {});

        await UI.updatePaymentCombined({ value: 'Satispay', scoutId: 's2', activityId: 'act_curr_1' });

        expect(updateSpy).toHaveBeenCalledWith(
            { field: 'pagato', value: true, scoutId: 's2', activityId: 'act_curr_1' },
            UI.currentUser
        );
        expect(updateSpy).toHaveBeenCalledWith(
            { field: 'tipoPagamento', value: 'Satispay', scoutId: 's2', activityId: 'act_curr_1' },
            UI.currentUser
        );
        expect(toastSpy).toHaveBeenCalledWith('Pagamento registrato (Satispay)', expect.anything());
    });
});
