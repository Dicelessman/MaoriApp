/**
 * Tests for Scorte and Inventory management, reorder budgeting, and import/export
 * @module tests/scorte
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';

describe('Scorte & Materiali Inventory Module', () => {
  let adapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalAdapter();
  });

  describe('Inizializzazione e Dati di Test', () => {
    it('dovrebbe contenere subito 3 elementi di test con categorie e valori corretti', async () => {
      const scorte = await adapter.getScorte();
      expect(scorte).toBeInstanceOf(Array);
      expect(scorte.length).toBe(3);

      const picchetti = scorte.find(s => s.nome.includes('Picchetti'));
      expect(picchetti).toBeDefined();
      expect(picchetti.categoria).toBe('Campeggio');
      expect(picchetti.quantita).toBe(24);
      expect(picchetti.quantitaMinima).toBe(50);
      expect(picchetti.prezzoUnitario).toBe(1.20);
      expect(picchetti.unitaMisura).toBe('pz');

      const cordino = scorte.find(s => s.nome.includes('Cordino'));
      expect(cordino).toBeDefined();
      expect(cordino.categoria).toBe('Pionieristica');
      expect(cordino.quantita).toBe(4);
      expect(cordino.quantitaMinima).toBe(10);
      expect(cordino.prezzoUnitario).toBe(8.50);

      const disinfettante = scorte.find(s => s.nome.includes('Disinfettante'));
      expect(disinfettante).toBeDefined();
      expect(disinfettante.categoria).toBe('Pronto Soccorso');
      expect(disinfettante.quantita).toBe(5);
      expect(disinfettante.quantitaMinima).toBe(5);
      expect(disinfettante.prezzoUnitario).toBe(4.80);
    });
  });

  describe('Operazioni CRUD Individuali', () => {
    it('dovrebbe aggiungere un nuovo articolo individualmente con categoria', async () => {
      const newItem = {
        nome: 'Torcia da testa LED',
        categoria: 'Illuminazione',
        quantita: 2,
        quantitaMinima: 8,
        unitaMisura: 'pz',
        prezzoUnitario: 12.50,
        note: 'Per capi squadriglia'
      };

      const id = await adapter.addScorta(newItem, { email: 'staff@test.it' });
      expect(id).toMatch(/^sc_/);

      const scorte = await adapter.getScorte();
      expect(scorte.length).toBe(4);

      const added = scorte.find(s => s.id === id);
      expect(added.nome).toBe('Torcia da testa LED');
      expect(added.categoria).toBe('Illuminazione');
      expect(added.quantita).toBe(2);
      expect(added.quantitaMinima).toBe(8);
      expect(added.prezzoUnitario).toBe(12.50);
    });

    it('dovrebbe modificare un articolo esistente', async () => {
      const scorte = await adapter.getScorte();
      const target = scorte[0];

      await adapter.updateScorta(target.id, {
        quantita: 48,
        prezzoUnitario: 1.30,
        note: 'Rinnovati picchetti'
      }, { email: 'staff@test.it' });

      const updatedScorte = await adapter.getScorte();
      const updated = updatedScorte.find(s => s.id === target.id);
      expect(updated.quantita).toBe(48);
      expect(updated.prezzoUnitario).toBe(1.30);
      expect(updated.note).toBe('Rinnovati picchetti');
      expect(updated.categoria).toBe(target.categoria);
    });

    it('dovrebbe cancellare un articolo', async () => {
      const scorte = await adapter.getScorte();
      const idToDelete = scorte[0].id;

      await adapter.deleteScorta(idToDelete, { email: 'staff@test.it' });

      const updated = await adapter.getScorte();
      expect(updated.length).toBe(2);
      expect(updated.find(s => s.id === idToDelete)).toBeUndefined();
    });
  });

  describe('Calcolo Preventivo di Riordino', () => {
    it('dovrebbe calcolare correttamente il preventivo di riordino per gli articoli sotto scorta', async () => {
      const scorte = await adapter.getScorte();

      // Test items default:
      // 1. Picchetti: quantita 24, min 50 -> da ordinare: 26 * 1.20 = 31.20
      // 2. Cordino: quantita 4, min 10 -> da ordinare: 6 * 8.50 = 51.00
      // 3. Disinfettante: quantita 5, min 5 -> da ordinare: 0 * 4.80 = 0.00
      let totalToOrderCount = 0;
      let totalCost = 0;

      scorte.forEach(item => {
        const diff = Math.max(0, item.quantitaMinima - item.quantita);
        if (diff > 0) {
          totalToOrderCount += diff;
          totalCost += diff * item.prezzoUnitario;
        }
      });

      expect(totalToOrderCount).toBe(26 + 6); // 32 unità
      expect(totalCost).toBeCloseTo(31.20 + 51.00, 2); // 82.20 €
    });
  });

  describe('Ordinamento Articoli', () => {
    it('dovrebbe ordinare per nome (A-Z e Z-A)', async () => {
      const scorte = await adapter.getScorte();
      const sortedAsc = [...scorte].sort((a, b) => a.nome.localeCompare(b.nome));
      const sortedDesc = [...scorte].sort((a, b) => b.nome.localeCompare(a.nome));

      expect(sortedAsc[0].nome).toBe('Cordino canapa 6mm (matassa 50m)');
      expect(sortedDesc[0].nome).toBe('Picchetti tenda a V (20 cm)');
    });

    it('dovrebbe ordinare per categoria (prima categoria e poi nome)', async () => {
      const scorte = await adapter.getScorte();
      const sorted = [...scorte].sort((a, b) => {
        const cmpCat = a.categoria.localeCompare(b.categoria);
        return cmpCat !== 0 ? cmpCat : a.nome.localeCompare(b.nome);
      });

      expect(sorted[0].categoria).toBe('Campeggio');
      expect(sorted[1].categoria).toBe('Pionieristica');
      expect(sorted[2].categoria).toBe('Pronto Soccorso');
    });

    it('dovrebbe ordinare per quantità', async () => {
      const scorte = await adapter.getScorte();
      const sortedByQty = [...scorte].sort((a, b) => a.quantita - b.quantita);

      expect(sortedByQty[0].quantita).toBe(4); // Cordino
      expect(sortedByQty[1].quantita).toBe(5); // Disinfettante
      expect(sortedByQty[2].quantita).toBe(24); // Picchetti
    });
  });

  describe('Importazione Batch Liste (CSV / Testo)', () => {
    it('dovrebbe importare articoli in modalità append', async () => {
      const itemsToImport = [
        { nome: 'Bussola Silva', categoria: 'Orientamento', quantita: 6, quantitaMinima: 12, prezzoUnitario: 15.00, unitaMisura: 'pz' },
        { nome: 'Fornello a gas camping', categoria: 'Cucina', quantita: 2, quantitaMinima: 4, prezzoUnitario: 22.00, unitaMisura: 'pz' }
      ];

      const count = await adapter.importScorteBatch(itemsToImport, false);
      expect(count).toBe(2);

      const all = await adapter.getScorte();
      expect(all.length).toBe(5); // 3 originali + 2 nuovi
      expect(all.find(s => s.nome === 'Bussola Silva')).toBeDefined();
    });

    it('dovrebbe importare articoli in modalità replace', async () => {
      const itemsToImport = [
        { nome: 'Ghirlanda nodi', categoria: 'Pionieristica', quantita: 1, quantitaMinima: 2, prezzoUnitario: 5.00, unitaMisura: 'pz' }
      ];

      const count = await adapter.importScorteBatch(itemsToImport, true);
      expect(count).toBe(1);

      const all = await adapter.getScorte();
      expect(all.length).toBe(1);
      expect(all[0].nome).toBe('Ghirlanda nodi');
    });
  });
});
