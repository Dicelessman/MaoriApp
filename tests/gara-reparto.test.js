import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';

describe('Gara di Reparto - Data Layer & Classifica', () => {
    let adapter;

    beforeEach(() => {
        localStorage.clear();
        adapter = new LocalAdapter();
    });

    describe('Categorie di Punteggio Personalizzabili Anno per Anno', () => {
        it('dovrebbe inizializzare le categorie predefinite della Gara di Reparto', async () => {
            const categories = await adapter.getGaraCategories();
            expect(categories).toBeDefined();
            expect(Array.isArray(categories)).toBe(true);
            expect(categories.length).toBeGreaterThanOrEqual(8);

            const catNames = categories.map(c => c.nome);
            expect(catNames).toContain('Puntualità & Presenze');
            expect(catNames).toContain('Uniforme & Tenuta');
            expect(catNames).toContain('Cucina & Cambusa');
            expect(catNames).toContain('Giochi & Grandi Giochi');
            expect(catNames).toContain('Spirito di Pattuglia & Stile');
        });

        it('dovrebbe consentire di aggiungere una nuova categoria personalizzata', async () => {
            const newCat = {
                nome: 'Costruzioni da Campo & Sopraelevate',
                descrizione: 'Solidità, sicurezza e rifinitura delle costruzioni al campo estivo',
                icona: '🔨',
                puntiDefault: 35,
                annoScout: '2025/2026'
            };

            const id = await adapter.addGaraCategory(newCat, { email: 'capo@scoutmaori.it' });
            expect(id).toMatch(/^cat_/);

            const allCats = await adapter.getGaraCategories('2025/2026');
            const found = allCats.find(c => c.id === id);
            expect(found).toBeDefined();
            expect(found.nome).toBe('Costruzioni da Campo & Sopraelevate');
            expect(found.puntiDefault).toBe(35);
            expect(found.icona).toBe('🔨');
            expect(found.createdBy).toBe('capo@scoutmaori.it');
        });

        it('dovrebbe filtrare le categorie per anno scout (incluse quelle con annoScout="all")', async () => {
            // Aggiungi una categoria specifica per 2026/2027
            await adapter.addGaraCategory({
                nome: 'Speciale Centenario',
                puntiDefault: 50,
                annoScout: '2026/2027'
            });

            const catsCurrent = await adapter.getGaraCategories('2025/2026');
            expect(catsCurrent.some(c => c.nome === 'Speciale Centenario')).toBe(false);

            const catsFuture = await adapter.getGaraCategories('2026/2027');
            expect(catsFuture.some(c => c.nome === 'Speciale Centenario')).toBe(true);
            // Include anche le categorie globali "all"
            expect(catsFuture.some(c => c.nome === 'Puntualità & Presenze')).toBe(true);
        });

        it('dovrebbe aggiornare una categoria esistente', async () => {
            const categories = await adapter.getGaraCategories();
            const first = categories[0];

            await adapter.updateGaraCategory(first.id, {
                puntiDefault: 25,
                descrizione: 'Descrizione aggiornata'
            }, { email: 'capo@scoutmaori.it' });

            const updatedList = await adapter.getGaraCategories();
            const updated = updatedList.find(c => c.id === first.id);
            expect(updated.puntiDefault).toBe(25);
            expect(updated.descrizione).toBe('Descrizione aggiornata');
        });

        it('dovrebbe eliminare una categoria di punteggio', async () => {
            const id = await adapter.addGaraCategory({
                nome: 'Categoria Temporanea',
                puntiDefault: 10
            });

            await adapter.deleteGaraCategory(id);

            const all = await adapter.getGaraCategories();
            expect(all.some(c => c.id === id)).toBe(false);
        });
    });

    describe('Assegnazione Punti e Storico per Attività', () => {
        it('dovrebbe registrare una singola assegnazione punti con motivazione e attività', async () => {
            const entry = {
                squadriglia: 'Aironi',
                attivitaId: 'a1',
                attivitaNome: 'Uscita al Lago',
                categoriaId: 'cat_6',
                categoriaNome: 'Giochi & Grandi Giochi',
                punti: 20,
                motivazione: 'Vittoria al gioco notturno',
                data: '2025-10-15',
                annoScout: '2025/2026'
            };

            const id = await adapter.addGaraPunti(entry, { email: 'staff@scoutmaori.it' });
            expect(id).toMatch(/^gp_/);

            const puntiList = await adapter.getGaraPunti('2025/2026');
            const found = puntiList.find(p => p.id === id);
            expect(found).toBeDefined();
            expect(found.squadriglia).toBe('Aironi');
            expect(found.punti).toBe(20);
            expect(found.motivazione).toBe('Vittoria al gioco notturno');
            expect(found.assegnatoDa).toBe('staff@scoutmaori.it');
        });

        it('dovrebbe consentire assegnazione batch simultanea a tutte le squadriglie', async () => {
            const batch = [
                {
                    squadriglia: 'Aironi',
                    categoriaId: 'cat_1',
                    categoriaNome: 'Puntualità',
                    punti: 10,
                    motivazione: 'Inizio attività in orario',
                    annoScout: '2025/2026'
                },
                {
                    squadriglia: 'Marmotte',
                    categoriaId: 'cat_1',
                    categoriaNome: 'Puntualità',
                    punti: 10,
                    motivazione: 'Inizio attività in orario',
                    annoScout: '2025/2026'
                }
            ];

            const ids = await adapter.addGaraPunti(batch, { email: 'staff@scoutmaori.it' });
            expect(Array.isArray(ids)).toBe(true);
            expect(ids.length).toBe(2);

            const punti = await adapter.getGaraPunti('2025/2026');
            expect(punti.some(p => p.id === ids[0])).toBe(true);
            expect(punti.some(p => p.id === ids[1])).toBe(true);
        });

        it('dovrebbe consentire di modificare o eliminare un punteggio registrato', async () => {
            const id = await adapter.addGaraPunti({
                squadriglia: 'Marmotte',
                punti: 5,
                motivazione: 'Bozza',
                annoScout: '2025/2026'
            });

            // Modifica punteggio
            await adapter.updateGaraPunti(id, { punti: 15, motivazione: 'Confermata vittoria' });
            let punti = await adapter.getGaraPunti('2025/2026');
            let found = punti.find(p => p.id === id);
            expect(found.punti).toBe(15);
            expect(found.motivazione).toBe('Confermata vittoria');

            // Elimina punteggio
            await adapter.deleteGaraPunti(id);
            punti = await adapter.getGaraPunti('2025/2026');
            expect(punti.some(p => p.id === id)).toBe(false);
        });
    });

    describe('Calcolo Classifica Tabellone in Tempo Reale', () => {
        it('dovrebbe calcolare correttamente il totale punti e ordinamento delle squadriglie', () => {
            const patrols = ['Aironi', 'Marmotte', 'Volpi'];
            const categories = [
                { id: 'c1', nome: 'Puntualità' },
                { id: 'c2', nome: 'Cucina' }
            ];
            const punti = [
                { squadriglia: 'Aironi', categoriaId: 'c1', punti: 10 },
                { squadriglia: 'Aironi', categoriaId: 'c2', punti: 20 },
                { squadriglia: 'Marmotte', categoriaId: 'c1', punti: 15 },
                { squadriglia: 'Marmotte', categoriaId: 'c2', punti: 25 },
                { squadriglia: 'Volpi', categoriaId: 'c1', punti: 5 }
            ];

            // Simula logica calculateGaraLeaderboard
            const rankingMap = {};
            patrols.forEach(p => {
                rankingMap[p] = { squadriglia: p, totalePunti: 0, eventiCount: 0, puntiPerCategoria: {} };
            });
            punti.forEach(entry => {
                rankingMap[entry.squadriglia].totalePunti += entry.punti;
                rankingMap[entry.squadriglia].eventiCount += 1;
                rankingMap[entry.squadriglia].puntiPerCategoria[entry.categoriaId] =
                    (rankingMap[entry.squadriglia].puntiPerCategoria[entry.categoriaId] || 0) + entry.punti;
            });

            const sorted = Object.values(rankingMap).sort((a, b) => b.totalePunti - a.totalePunti);

            // 1° Marmotte con 40 punti (15 + 25)
            expect(sorted[0].squadriglia).toBe('Marmotte');
            expect(sorted[0].totalePunti).toBe(40);
            expect(sorted[0].puntiPerCategoria['c2']).toBe(25);

            // 2° Aironi con 30 punti (10 + 20)
            expect(sorted[1].squadriglia).toBe('Aironi');
            expect(sorted[1].totalePunti).toBe(30);

            // 3° Volpi con 5 punti
            expect(sorted[2].squadriglia).toBe('Volpi');
            expect(sorted[2].totalePunti).toBe(5);
        });
    });
});
