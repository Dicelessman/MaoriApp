import { describe, it, expect } from 'vitest';
import {
    normalizzaUnita,
    formattaQuantitaPerSpesa,
    parseIngredienteLine,
    scalaRicetta,
    calcolaSommaNutrizionale,
    generaListaSpesa,
    generaListaStrumenti,
    verificaAllarmiAllergeni
} from '../js/utils/menu-utils.js';

describe('Menù & Cambusa - Utils', () => {
    describe('normalizzaUnita e formattaQuantitaPerSpesa', () => {
        it('converte kg in grammi e litri in ml', () => {
            expect(normalizzaUnita(2.5, 'kg')).toEqual({ quantitaNorm: 2500, unitaNorm: 'g' });
            expect(normalizzaUnita(1.5, 'l')).toEqual({ quantitaNorm: 1500, unitaNorm: 'ml' });
            expect(normalizzaUnita(3, 'hg')).toEqual({ quantitaNorm: 300, unitaNorm: 'g' });
            expect(normalizzaUnita(2, 'cucchiai')).toEqual({ quantitaNorm: 30, unitaNorm: 'g' });
        });

        it('formatta per la spesa in kg o litri se >= 1000', () => {
            expect(formattaQuantitaPerSpesa(2500, 'g')).toMatch(/2[,.]5\s*kg/);
            expect(formattaQuantitaPerSpesa(400, 'g')).toBe('400 g');
            expect(formattaQuantitaPerSpesa(1500, 'ml')).toMatch(/1[,.]5\s*l/);
            expect(formattaQuantitaPerSpesa(6, 'pz')).toBe('6 pz');
        });
    });

    describe('parseIngredienteLine', () => {
        it('effettua il parsing di righe complesse di ingredienti', () => {
            const res1 = parseIngredienteLine('500 g di petto di pollo');
            expect(res1.quantita).toBe(500);
            expect(res1.unita).toBe('g');
            expect(res1.nome).toBe('petto di pollo');

            const res2 = parseIngredienteLine('1.5 kg cipolle dorate');
            expect(res2.quantita).toBe(1.5);
            expect(res2.unita).toBe('kg');
            expect(res2.nome).toBe('cipolle dorate');

            const res3 = parseIngredienteLine('4 uova fresche (medie)');
            expect(res3.quantita).toBe(4);
            expect(res3.unita).toBe('pz');
            expect(res3.nome).toBe('uova fresche');
            expect(res3.note).toBe('medie');

            const res4 = parseIngredienteLine('1/2 litro di latte intero');
            expect(res4.quantita).toBe(0.5);
            expect(res4.unita).toBe('litro');
            expect(res4.nome).toBe('latte intero');
        });
    });

    describe('scalaRicetta', () => {
        const ricettaBase = {
            id: 'r1',
            nome: 'Pasta al Sugo',
            porzioniBase: 4,
            ingredienti: [
                { nome: 'Pasta', quantita: 400, unita: 'g', scalabile: true },
                { nome: 'Sale', quantita: 10, unita: 'g', scalabile: false }
            ],
            nutrizione: {
                perPorzione: { kcal: 400, proteine: 12, carboidrati: 70, grassi: 8 }
            }
        };

        it('scala le quantità proporzionalmente e lascia invariati gli ingredienti non scalabili', () => {
            const scalata = scalaRicetta(ricettaBase, 20); // fattore 5x
            expect(scalata.porzioniRichieste).toBe(20);
            expect(scalata.ingredienti[0].quantita).toBe(2000);
            expect(scalata.ingredienti[1].quantita).toBe(10); // non scalabile
            expect(scalata.totaleNutrizione.kcal).toBe(8000);
            expect(scalata.totaleNutrizione.proteine).toBe(240);
        });
    });

    describe('calcolaSommaNutrizionale', () => {
        it('somma le calorie e i macronutrienti di più ricette', () => {
            const r1 = {
                totaleNutrizione: { kcal: 500, proteine: 20, carboidrati: 80, grassi: 10, zuccheri: 5, saturi: 2, fibre: 4, sale: 1 }
            };
            const r2 = {
                totaleNutrizione: { kcal: 300, proteine: 15, carboidrati: 10, grassi: 20, zuccheri: 1, saturi: 3, fibre: 2, sale: 0.5 }
            };
            const somma = calcolaSommaNutrizionale([r1, r2]);
            expect(somma.kcal).toBe(800);
            expect(somma.proteine).toBe(35);
            expect(somma.carboidrati).toBe(90);
            expect(somma.grassi).toBe(30);
            expect(somma.sale).toBe(1.5);
        });
    });

    describe('generaListaSpesa con confronto Scorte', () => {
        it('aggrega gli ingredienti, conta le ricette e separa gli articoli disponibili in scorte', () => {
            const pasti = [
                {
                    ricette: [
                        {
                            nome: 'Pasta al Tonno',
                            ingredienti: [
                                { nome: 'Pasta di semola', quantita: 1000, unita: 'g', costoStimatoKg: 1.50 },
                                { nome: 'Tonno sott\'olio', quantita: 400, unita: 'g', costoStimatoKg: 10.00 }
                            ]
                        },
                        {
                            nome: 'Insalata di Pasta Estiva',
                            ingredienti: [
                                { nome: 'Pasta di semola', quantita: 1500, unita: 'g', costoStimatoKg: 1.50 },
                                { nome: 'Pomodorini', quantita: 500, unita: 'g', costoStimatoKg: 3.00 }
                            ]
                        }
                    ]
                }
            ];

            const scorte = [
                { id: 'sc_pasta', nome: 'Pasta di semola', quantita: 3, unitaMisura: 'kg' }, // 3000g > 2500g -> sufficiente
                { id: 'sc_pom', nome: 'Pomodorini', quantita: 200, unitaMisura: 'g' }       // 200g < 500g -> ne mancano 300g
            ];

            const res = generaListaSpesa(pasti, scorte);

            // Pasta di semola totale = 2500g, 2 ricette, coperta da scorte (3000g)
            expect(res.inScorteSufficienti.length).toBe(1);
            const pastaInScorte = res.inScorteSufficienti[0];
            expect(pastaInScorte.nome).toBe('Pasta di semola');
            expect(pastaInScorte.ricetteCount).toBe(2);
            expect(pastaInScorte.sufficienteInScorte).toBe(true);

            // Da acquistare: Tonno (400g) e Pomodorini (300g mancanti)
            expect(res.daAcquistare.length).toBe(2);
            const pom = res.daAcquistare.find(i => i.nome === 'Pomodorini');
            expect(pom.quantitaTotale).toBe(500);
            expect(pom.quantitaInScorte).toBe(200);
            expect(pom.quantitaDaComprare).toBe(300);
            expect(pom.ricetteCount).toBe(1);

            // Costo stimato
            expect(res.costoTotaleStimato).toBeGreaterThan(0);
        });
    });

    describe('generaListaStrumenti', () => {
        it('aggrega gli strumenti e calcola quante ricette li usano', () => {
            const pasti = [
                {
                    ricette: [
                        {
                            nome: 'Primo',
                            strumenti: [
                                { nome: 'Pentola grande', quantita: 1 },
                                { nome: 'Mestolo', quantita: 1 }
                            ]
                        },
                        {
                            nome: 'Secondo',
                            strumenti: [
                                { nome: 'Padella', quantita: 2 },
                                { nome: 'Mestolo', quantita: 1 }
                            ]
                        }
                    ]
                }
            ];

            const strumenti = generaListaStrumenti(pasti);
            const mestolo = strumenti.find(s => s.nome === 'Mestolo');
            expect(mestolo).toBeDefined();
            expect(mestolo.ricetteCount).toBe(2);
            expect(mestolo.dettaglioTesto).toContain('2 ricette');
        });
    });

    describe('verificaAllarmiAllergeni', () => {
        it('segnala avvisi se una ricetta con allergeni viene servita a partecipanti con intolleranze', () => {
            const ricette = [
                { nome: 'Pasta al Pesto', allergeni: ['glutine', 'frutta_guscio'] },
                { nome: 'Riso e Zucchine', allergeni: [] }
            ];
            const scouts = [
                { id: 's1', nome: 'Marco', cognome: 'Rossi', san_allergie: 'Celiachia (glutine)' },
                { id: 's2', nome: 'Sara', cognome: 'Verdi', san_allergie: 'Nessuna' }
            ];

            const alerts = verificaAllarmiAllergeni(ricette, scouts);
            expect(alerts.length).toBe(1);
            expect(alerts[0].nome).toBe('Marco Rossi');
            expect(alerts[0].allergia).toBe('glutine');
            expect(alerts[0].ricetteIncongruenti).toContain('Pasta al Pesto');
        });
    });
});
