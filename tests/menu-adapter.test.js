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
    Timestamp: { now: () => new Date(), fromDate: (d) => d }
}));

import { LocalAdapter } from '../js/data/adapters/local-adapter.js';
import { DATA } from '../js/data/data-facade.js';

describe('Menù & Cambusa Adapter & Facade', () => {
    let adapter;

    beforeEach(() => {
        localStorage.clear();
        DATA.useLocal();
    });

    it('inizializza con le ricette e gli alimenti base', async () => {
        const ricette = await DATA.getRicette();
        expect(ricette.length).toBeGreaterThanOrEqual(3);
        const pasta = ricette.find(r => r.nome.includes('Pasta al Pomodoro'));
        expect(pasta).toBeDefined();
        expect(pasta.ingredienti.length).toBeGreaterThan(0);
        expect(pasta.nutrizione.perPorzione.kcal).toBeGreaterThan(0);

        const alimenti = await DATA.getAlimenti();
        expect(alimenti.length).toBeGreaterThanOrEqual(20);
        const riso = alimenti.find(a => a.nome.toLowerCase() === 'riso');
        expect(riso).toBeDefined();
        expect(riso.nutrizione100g.kcal).toBeGreaterThan(300);
    });

    it('permette di aggiungere, modificare ed eliminare una ricetta', async () => {
        const newRecipe = {
            nome: 'Frittata di Campagna',
            categoria: 'Cena',
            descrizione: 'Frittata veloce con verdure miste',
            porzioniBase: 4,
            tempoPreparazione: 10,
            tempoCottura: 15,
            difficolta: 'Facile',
            allergeni: ['uova'],
            diete: ['vegetariana', 'senza glutine'],
            ingredienti: [
                { nome: 'Uova', quantita: 8, unita: 'pz', scalabile: true }
            ],
            passaggi: ['Sbattere le uova', 'Cuocere in padella']
        };

        const id = await DATA.addRicetta(newRecipe);
        expect(id).toBeDefined();

        let fetched = await DATA.getRicetta(id);
        expect(fetched.nome).toBe('Frittata di Campagna');
        expect(fetched.porzioniBase).toBe(4);

        await DATA.updateRicetta(id, { porzioniBase: 6, noteAlimentari: 'Uova fresche' });
        fetched = await DATA.getRicetta(id);
        expect(fetched.porzioniBase).toBe(6);
        expect(fetched.noteAlimentari).toBe('Uova fresche');

        await DATA.deleteRicetta(id);
        fetched = await DATA.getRicetta(id);
        expect(fetched).toBeNull();
    });

    it('permette di creare e gestire un piano menù', async () => {
        const menuData = {
            titolo: 'Uscita di San Giorgio 2026',
            attivitaId: 'act_sg2026',
            attivitaNome: 'San Giorgio',
            dataInizio: '2026-04-25',
            dataFine: '2026-04-26',
            partecipantiDefault: 24,
            giorni: [
                {
                    data: '2026-04-25',
                    pasti: [
                        {
                            tipo: 'Pranzo',
                            ricettaId: 'rec_pasta_pomodoro',
                            ricettaNome: 'Pasta al Pomodoro e Basilico',
                            porzioni: 24
                        }
                    ]
                }
            ],
            costoTotaleStimato: 45.50
        };

        const menuId = await DATA.saveMenu(menuData);
        expect(menuId).toBeDefined();

        const allMenus = await DATA.getMenus();
        expect(allMenus.some(m => m.id === menuId)).toBe(true);

        const actMenus = await DATA.getMenus('act_sg2026');
        expect(actMenus.length).toBe(1);
        expect(actMenus[0].titolo).toBe('Uscita di San Giorgio 2026');

        await DATA.deleteMenu(menuId);
        const deleted = await DATA.getMenu(menuId);
        expect(deleted).toBeNull();
    });

    it('permette di salvare ed aggiornare gli alimenti nel database nutrizionale', async () => {
        const newFood = {
            nome: 'Lenticchie secche',
            categoria: 'Legumi',
            unitaDefault: 'g',
            prezzoStimatoKg: 3.20,
            allergeni: [],
            dieteCompatibili: ['vegetariana', 'vegana', 'senza glutine', 'halal'],
            nutrizione100g: {
                kcal: 350,
                proteine: 24.5,
                carboidrati: 60,
                zuccheri: 2,
                grassi: 1,
                saturi: 0.2,
                fibre: 15,
                sale: 0.01
            }
        };

        const foodId = await DATA.saveAlimento(newFood);
        expect(foodId).toBeDefined();

        const fetched = await DATA.getAlimento(foodId);
        expect(fetched.nome).toBe('Lenticchie secche');
        expect(fetched.nutrizione100g.proteine).toBe(24.5);
    });
});
