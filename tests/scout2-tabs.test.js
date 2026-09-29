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
globalThis.UI = UI;
window.UI = UI;

await import('../scout2.js');

describe('Scheda Esploratore (scout2) - Navigazione a Schede (Tabs)', () => {
    beforeEach(() => {
        window.location.hash = '';
        document.body.innerHTML = `
            <div id="scoutHeaderContainer">
                <div id="scoutHeader">
                    <h2 id="scoutTitle">Andrea Livorno</h2>
                    <a href="esploratori.html">Torna alla lista</a>
                    <button type="submit" form="scoutForm">Salva</button>
                    <button type="button" id="printScoutBtn">Stampa</button>
                    <button type="button" id="printMedicalBtn">Scheda Sanitaria</button>
                </div>
                <nav id="sectionNav">
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="anagrafici">Anagrafici</button>
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="contatti">Contatti</button>
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="sanitarie">Sanitarie</button>
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="progressione">Progressione</button>
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="specialita">Specialità</button>
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="eventi">Eventi</button>
                    <button type="button" class="tab-nav-btn section-nav-link" data-tab="documenti">Documenti</button>
                    <button type="button" id="scrollTopBtn">↑ Torna su</button>
                </nav>
            </div>
            <form id="scoutForm">
                <section id="section-anagrafici" class="scout-tab-pane tab-pane">
                    <input id="anag_nome" value="Andrea" />
                    <button type="button" data-tab-nav="contatti">Contatti →</button>
                </section>
                <section id="section-contatti" class="scout-tab-pane tab-pane hidden">
                    <input id="ct_g1_nome" value="Marco" />
                    <button type="button" data-tab-nav="sanitarie">Sanitarie →</button>
                </section>
                <section id="section-sanitarie" class="scout-tab-pane tab-pane hidden">
                    <input id="san_gruppo" value="0+" />
                </section>
                <section id="section-progressione" class="scout-tab-pane tab-pane hidden">
                    <input id="pv_pattuglia" value="Aironi" />
                </section>
                <section id="section-specialita" class="scout-tab-pane tab-pane hidden">
                    <div id="specialitaContainer"></div>
                </section>
                <section id="section-eventi" class="scout-tab-pane tab-pane hidden">
                    <input id="ev_ce1_tx" value="Campo Alpi" />
                </section>
                <section id="section-documenti" class="scout-tab-pane tab-pane hidden">
                    <input id="doc_quota1" value="2025" />
                    <button type="button" id="btnAnnulla">Torna alla Lista</button>
                </section>
            </form>
        `;
    });

    it('dovrebbe inizializzare le schede mostrando solo anagrafici e nascondendo le altre', () => {
        UI.initSectionNavigation();

        const anagraficiSec = document.getElementById('section-anagrafici');
        const contattiSec = document.getElementById('section-contatti');
        const sanitarieSec = document.getElementById('section-sanitarie');

        expect(anagraficiSec.classList.contains('hidden')).toBe(false);
        expect(anagraficiSec.classList.contains('active')).toBe(true);
        expect(contattiSec.classList.contains('hidden')).toBe(true);
        expect(sanitarieSec.classList.contains('hidden')).toBe(true);

        const activeBtn = document.querySelector('.tab-nav-btn[data-tab="anagrafici"]');
        expect(activeBtn.classList.contains('active')).toBe(true);
    });

    it('dovrebbe cambiare scheda correttamente con switchTab', () => {
        UI.initSectionNavigation();
        UI.switchTab('contatti');

        const anagraficiSec = document.getElementById('section-anagrafici');
        const contattiSec = document.getElementById('section-contatti');
        const contattiBtn = document.querySelector('.tab-nav-btn[data-tab="contatti"]');
        const anagraficiBtn = document.querySelector('.tab-nav-btn[data-tab="anagrafici"]');

        expect(anagraficiSec.classList.contains('hidden')).toBe(true);
        expect(contattiSec.classList.contains('hidden')).toBe(false);
        expect(contattiSec.classList.contains('active')).toBe(true);

        expect(contattiBtn.classList.contains('active')).toBe(true);
        expect(anagraficiBtn.classList.contains('active')).toBe(false);
    });

    it('dovrebbe passare alla scheda successiva tramite bottone data-tab-nav', () => {
        UI.initSectionNavigation();

        const nextBtn = document.querySelector('#section-anagrafici [data-tab-nav="contatti"]');
        expect(nextBtn).toBeTruthy();

        nextBtn.click();

        const contattiSec = document.getElementById('section-contatti');
        expect(contattiSec.classList.contains('hidden')).toBe(false);
        expect(UI.currentTab).toBe('contatti');
    });

    it('dovrebbe aprire la scheda indicata dall hash URL se presente', () => {
        window.location.hash = '#sanitarie';
        UI.initSectionNavigation();

        const sanitarieSec = document.getElementById('section-sanitarie');
        const anagraficiSec = document.getElementById('section-anagrafici');

        expect(sanitarieSec.classList.contains('hidden')).toBe(false);
        expect(anagraficiSec.classList.contains('hidden')).toBe(true);
        expect(UI.currentTab).toBe('sanitarie');
    });
});
