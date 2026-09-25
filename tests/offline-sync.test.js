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

describe('FASE 5 - PWA Offline-First Avanzata & Sincronizzazione a due vie', () => {
    beforeEach(() => {
        localStorage.clear();
        UI.clearOfflineQueue();
        DATA.useLocal();

        document.body.innerHTML = `
            <div id="offlineBanner" class="hidden"></div>
            <div id="connectionStatus" class="hidden">
                <span class="status-dot"></span>
                <span class="status-text"></span>
            </div>
            <span id="pendingSyncBadge" class="hidden">0</span>
        `;
    });

    afterEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    describe('Offline Queue Management', () => {
        it('inizialmente la coda deve essere vuota', () => {
            expect(UI.getOfflineQueue()).toEqual([]);
            expect(UI.getPendingSyncCount()).toBe(0);
        });

        it('dovrebbe aggiungere mutazioni alla coda con id, azione e timestamp', () => {
            const item = UI.addToOfflineQueue('updatePresence', {
                scoutId: 's1',
                activityId: 'a1',
                field: 'stato',
                value: 'Presente'
            });

            expect(item).not.toBeNull();
            expect(item.action).toBe('updatePresence');
            expect(item.id).toMatch(/^sync_/);
            expect(item.timestamp).toBeDefined();

            const queue = UI.getOfflineQueue();
            expect(queue.length).toBe(1);
            expect(queue[0].data.scoutId).toBe('s1');
            expect(UI.getPendingSyncCount()).toBe(1);
        });

        it('dovrebbe aggiornare il badge delle modifiche pendenti', () => {
            UI.addToOfflineQueue('addActivity', { tipo: 'Uscita', descrizione: 'Campo S. Giorgio' });
            const badge = document.getElementById('pendingSyncBadge');
            expect(badge.classList.contains('hidden')).toBe(false);
            expect(badge.textContent).toBe('1');

            UI.addToOfflineQueue('addScorta', { nome: 'Funi 10m', quantita: 4 });
            expect(badge.textContent).toBe('2');

            UI.clearOfflineQueue();
            expect(UI.getPendingSyncCount()).toBe(0);
            expect(badge.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Sincronizzazione a due vie (syncOfflineData)', () => {
        it('dovrebbe inviare le mutazioni in coda (Push) e ricaricare i dati aggiornati (Pull)', async () => {
            // Mock calls su DATA
            const updatePresenceSpy = vi.spyOn(DATA, 'updatePresence').mockResolvedValue(true);
            const addActivitySpy = vi.spyOn(DATA, 'addActivity').mockResolvedValue('new_act_id');
            const invalidateCacheSpy = vi.spyOn(DATA.cache, 'invalidate');
            const loadAllSpy = vi.spyOn(DATA, 'loadAll').mockResolvedValue({
                scouts: [{ id: 's1', nome: 'Mario' }],
                activities: [{ id: 'a1', descrizione: 'Uscita' }],
                staff: [],
                presences: []
            });
            const renderPageSpy = vi.spyOn(UI, 'renderCurrentPage').mockImplementation(() => {});

            // Accoda due operazioni offline
            UI.addToOfflineQueue('updatePresence', { scoutId: 's1', activityId: 'a1', stato: 'Presente' });
            UI.addToOfflineQueue('addActivity', { tipo: 'Riunione', descrizione: 'Consiglio Capi' });

            expect(UI.getPendingSyncCount()).toBe(2);

            // Esegui la sincronizzazione al ritorno online
            const result = await UI.syncOfflineData();

            expect(updatePresenceSpy).toHaveBeenCalledTimes(1);
            expect(addActivitySpy).toHaveBeenCalledTimes(1);
            expect(invalidateCacheSpy).toHaveBeenCalled();
            expect(loadAllSpy).toHaveBeenCalledWith(true);
            expect(renderPageSpy).toHaveBeenCalled();

            expect(result.syncedCount).toBe(2);
            expect(result.remainingCount).toBe(0);
            expect(UI.getOfflineQueue()).toEqual([]);
        });

        it('se la coda è vuota, esegue comunque il pull per garantire l\'allineamento con il server', async () => {
            const loadAllSpy = vi.spyOn(DATA, 'loadAll').mockResolvedValue({
                scouts: [],
                activities: [],
                staff: [],
                presences: []
            });

            const result = await UI.syncOfflineData();
            expect(loadAllSpy).toHaveBeenCalledWith(true);
            expect(result.syncedCount).toBe(0);
            expect(result.remainingCount).toBe(0);
        });

        it('se una mutazione fallisce, conserva l\'operazione non riuscita nella coda per il prossimo tentativo', async () => {
            vi.spyOn(DATA, 'updatePresence').mockRejectedValue(new Error('Network error'));
            vi.spyOn(DATA, 'loadAll').mockResolvedValue({ scouts: [], activities: [], staff: [], presences: [] });

            UI.addToOfflineQueue('updatePresence', { scoutId: 's1', activityId: 'a1' });
            const result = await UI.syncOfflineData();

            expect(result.syncedCount).toBe(0);
            expect(result.remainingCount).toBe(1);
            expect(UI.getOfflineQueue().length).toBe(1);
        });
    });

    describe('Riconnessione automatica e trigger eventi', () => {
        it('dovrebbe chiamare syncOfflineData quando l\'applicazione torna online', async () => {
            const syncSpy = vi.spyOn(UI, 'syncOfflineData').mockResolvedValue({ syncedCount: 0, remainingCount: 0 });

            UI.setupOfflineDetection();

            // Simula evento online
            window.dispatchEvent(new Event('online'));

            expect(syncSpy).toHaveBeenCalled();
            expect(document.getElementById('offlineBanner').classList.contains('hidden')).toBe(true);
            expect(document.querySelector('.status-text').textContent).toBe('Online');
        });
    });
});
