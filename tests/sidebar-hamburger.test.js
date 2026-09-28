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

describe('Hamburger Navigation Menu (Web & Mobile)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="shared-header">
                <header>
                    <button id="sidebarToggle" aria-label="Menu di navigazione">
                        <span>☰</span>
                    </button>
                </header>
                <div id="sidebarOverlay" class="hidden"></div>
                <aside id="mainSidebar" class="active">
                    <div class="header">
                        <button id="closeSidebar">✕</button>
                    </div>
                    <nav>
                        <a href="index.html" class="nav-item">Home</a>
                        <a href="presenze.html" class="nav-item">Presenze</a>
                    </nav>
                </aside>
            </div>
            <div id="main-content"></div>
        `;
    });

    it('dovrebbe inizializzare la sidebar chiusa e overlay nascosto sia su web (desktop) sia su mobile', () => {
        // Simula viewport desktop (es. 1200px)
        window.innerWidth = 1200;

        UI.setupSidebar();

        const sidebar = document.querySelector('#mainSidebar');
        const overlay = document.querySelector('#sidebarOverlay');
        const toggleBtn = document.querySelector('#sidebarToggle');

        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('hidden')).toBe(true);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('dovrebbe aprire la sidebar e mostrare l\'overlay al click su sidebarToggle su desktop', () => {
        window.innerWidth = 1200;
        UI.setupSidebar();

        const toggleBtn = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#mainSidebar');
        const overlay = document.querySelector('#sidebarOverlay');

        toggleBtn.click();

        expect(sidebar.classList.contains('active')).toBe(true);
        expect(overlay.classList.contains('hidden')).toBe(false);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
    });

    it('dovrebbe chiudere la sidebar al secondo click su sidebarToggle', () => {
        window.innerWidth = 1024;
        UI.setupSidebar();

        const toggleBtn = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#mainSidebar');
        const overlay = document.querySelector('#sidebarOverlay');

        toggleBtn.click();
        expect(sidebar.classList.contains('active')).toBe(true);

        toggleBtn.click();
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('hidden')).toBe(true);
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
    });

    it('dovrebbe chiudere la sidebar cliccando il pulsante closeSidebar (✕)', () => {
        window.innerWidth = 1024;
        UI.setupSidebar();

        const toggleBtn = document.querySelector('#sidebarToggle');
        const closeBtn = document.querySelector('#closeSidebar');
        const sidebar = document.querySelector('#mainSidebar');
        const overlay = document.querySelector('#sidebarOverlay');

        toggleBtn.click();
        expect(sidebar.classList.contains('active')).toBe(true);

        closeBtn.click();
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('hidden')).toBe(true);
    });

    it('dovrebbe chiudere la sidebar cliccando sull\'overlay', () => {
        window.innerWidth = 1440;
        UI.setupSidebar();

        const toggleBtn = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#mainSidebar');
        const overlay = document.querySelector('#sidebarOverlay');

        toggleBtn.click();
        expect(sidebar.classList.contains('active')).toBe(true);

        overlay.click();
        expect(sidebar.classList.contains('active')).toBe(false);
        expect(overlay.classList.contains('hidden')).toBe(true);
    });

    it('dovrebbe chiudere la sidebar premendo ESC', () => {
        window.innerWidth = 1440;
        UI.setupSidebar();

        const toggleBtn = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#mainSidebar');

        toggleBtn.click();
        expect(sidebar.classList.contains('active')).toBe(true);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(sidebar.classList.contains('active')).toBe(false);
    });

    it('dovrebbe gestire correttamente le classi Tailwind translate-x-0 e -translate-x-full', () => {
        UI.setupSidebar();
        const toggleBtn = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#mainSidebar');

        expect(sidebar.classList.contains('-translate-x-full')).toBe(true);
        expect(sidebar.classList.contains('translate-x-0')).toBe(false);

        toggleBtn.click();
        expect(sidebar.classList.contains('translate-x-0')).toBe(true);
        expect(sidebar.classList.contains('-translate-x-full')).toBe(false);

        toggleBtn.click();
        expect(sidebar.classList.contains('-translate-x-full')).toBe(true);
        expect(sidebar.classList.contains('translate-x-0')).toBe(false);
    });

    it('dovrebbe funzionare correttamente anche se setupSidebar viene invocato più volte (idempotenza)', () => {
        UI.setupSidebar();
        UI.setupSidebar(); // Seconda chiamata non deve causare doppi listener che togglano immediatamente avanti e indietro

        const toggleBtn = document.querySelector('#sidebarToggle');
        const sidebar = document.querySelector('#mainSidebar');

        toggleBtn.click();
        expect(sidebar.classList.contains('active')).toBe(true);
        expect(sidebar.classList.contains('translate-x-0')).toBe(true);
    });
});

