/**
 * Tests for Scorte and Inventory management, reorder budgeting, and separate lists (Campo Estivo, Uniformi, Distintivi)
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
    it('dovrebbe contenere subito 3 elementi di test con categorie, liste e valori corretti', async () => {
      const scorte = await adapter.getScorte();
      expect(scorte).toBeInstanceOf(Array);
      expect(scorte.length).toBe(3);

      const picchetti = scorte.find(s => s.nome.includes('Picchetti'));
      expect(picchetti).toBeDefined();
      expect(picchetti.categoria).toBe('Campeggio');
      expect(picchetti.lista).toBe('Campo Estivo');
      expect(picchetti.quantita).toBe(24);
      expect(picchetti.quantitaMinima).toBe(50);
      expect(picchetti.prezzoUnitario).toBe(1.20);
      expect(picchetti.unitaMisura).toBe('pz');

      const cordino = scorte.find(s => s.nome.includes('Cordino'));
      expect(cordino).toBeDefined();
      expect(cordino.categoria).toBe('Pionieristica');
      expect(cordino.lista).toBe('Campo Estivo');
      expect(cordino.quantita).toBe(4);
      expect(cordino.quantitaMinima).toBe(10);
      expect(cordino.prezzoUnitario).toBe(8.50);

      const disinfettante = scorte.find(s => s.nome.includes('Disinfettante'));
      expect(disinfettante).toBeDefined();
      expect(disinfettante.categoria).toBe('Pronto Soccorso');
      expect(disinfettante.lista).toBe('Generale');
      expect(disinfettante.quantita).toBe(5);
      expect(disinfettante.quantitaMinima).toBe(5);
      expect(disinfettante.prezzoUnitario).toBe(4.80);
    });

    it('dovrebbe includere le liste predefinite per Campo Estivo, Uniformi, Distintivi e Generale', async () => {
      const liste = await adapter.getListeScorte();
      expect(liste).toContain('Campo Estivo');
      expect(liste).toContain('Uniformi');
      expect(liste).toContain('Distintivi');
      expect(liste).toContain('Generale');
    });
  });

  describe('Gestione Liste Separate (Campo Estivo, Uniformi, Distintivi)', () => {
    it('dovrebbe permettere di creare una nuova lista personalizzata', async () => {
      await adapter.addListaScorta('San Giorgio 2026', { email: 'staff@test.it' });
      const liste = await adapter.getListeScorte();
      expect(liste).toContain('San Giorgio 2026');
    });

    it('dovrebbe permettere di rinominare una lista e aggiornare gli articoli associati', async () => {
      // Aggiungi un articolo nella lista Uniformi
      const itemId = await adapter.addScorta({
        nome: 'Camicia Scout tg M',
        categoria: 'Abbigliamento',
        lista: 'Uniformi',
        quantita: 2,
        quantitaMinima: 10,
        prezzoUnitario: 28.00
      }, { email: 'staff@test.it' });

      // Rinomina lista Uniformi in Vestiario Reparto
      await adapter.renameListaScorta('Uniformi', 'Vestiario Reparto', { email: 'staff@test.it' });

      const liste = await adapter.getListeScorte();
      expect(liste).toContain('Vestiario Reparto');
      expect(liste).not.toContain('Uniformi');

      const scorte = await adapter.getScorte();
      const updatedItem = scorte.find(s => s.id === itemId);
      expect(updatedItem.lista).toBe('Vestiario Reparto');
    });

    it('dovrebbe eliminare una lista e spostare i suoi materiali su Generale', async () => {
      const itemId = await adapter.addScorta({
        nome: 'Distintivo Pattuglia Aquile',
        categoria: 'Distintivi',
        lista: 'Distintivi',
        quantita: 1,
        quantitaMinima: 12,
        prezzoUnitario: 1.50
      }, { email: 'staff@test.it' });

      await adapter.deleteListaScorta('Distintivi', { email: 'staff@test.it' });

      const liste = await adapter.getListeScorte();
      expect(liste).not.toContain('Distintivi');

      const scorte = await adapter.getScorte();
      const movedItem = scorte.find(s => s.id === itemId);
      expect(movedItem.lista).toBe('Generale');
    });
  });

  describe('Calcolo Preventivo di Riordino Isolato per Singola Lista', () => {
    it('dovrebbe calcolare il preventivo isolato solo per il Campo Estivo senza includere altre liste', async () => {
      // Aggiungi articoli ad altre liste per verificare che non vengano inclusi
      await adapter.addScorta({
        nome: 'Camicia Scout Taglia L',
        categoria: 'Uniformi',
        lista: 'Uniformi',
        quantita: 1,
        quantitaMinima: 5,
        prezzoUnitario: 30.00 // da ordinare: 4 * 30 = 120 €
      });

      await adapter.addScorta({
        nome: 'Distintivo Lupetto',
        categoria: 'Distintivi',
        lista: 'Distintivi',
        quantita: 0,
        quantitaMinima: 10,
        prezzoUnitario: 2.00 // da ordinare: 10 * 2 = 20 €
      });

      const scorte = await adapter.getScorte();

      // Filtra solo gli articoli di Campo Estivo
      const campoEstivoItems = scorte.filter(s => s.lista === 'Campo Estivo');
      expect(campoEstivoItems.length).toBe(2); // Picchetti e Cordino

      let totalCampoEstivoCost = 0;
      let totalCampoEstivoUnits = 0;

      campoEstivoItems.forEach(item => {
        const diff = Math.max(0, item.quantitaMinima - item.quantita);
        if (diff > 0) {
          totalCampoEstivoUnits += diff;
          totalCampoEstivoCost += diff * item.prezzoUnitario;
        }
      });

      // Picchetti: (50 - 24) * 1.20 = 26 * 1.20 = 31.20 €
      // Cordino: (10 - 4) * 8.50 = 6 * 8.50 = 51.00 €
      expect(totalCampoEstivoUnits).toBe(32);
      expect(totalCampoEstivoCost).toBeCloseTo(82.20, 2);

      // Preventivo per Uniformi
      const uniformiItems = scorte.filter(s => s.lista === 'Uniformi');
      let uniformiCost = 0;
      uniformiItems.forEach(i => {
        const diff = Math.max(0, i.quantitaMinima - i.quantita);
        uniformiCost += diff * i.prezzoUnitario;
      });
      expect(uniformiCost).toBeCloseTo(120.00, 2);
    });
  });

  describe('Operazioni CRUD Individuali', () => {
    it('dovrebbe aggiungere un nuovo articolo individualmente con categoria e lista', async () => {
      const newItem = {
        nome: 'Torcia da testa LED',
        categoria: 'Illuminazione',
        lista: 'Campo Estivo',
        quantita: 2,
        quantitaMinima: 8,
        unitaMisura: 'pz',
        prezzoUnitario: 12.50,
        note: 'Per capi pattuglia'
      };

      const id = await adapter.addScorta(newItem, { email: 'staff@test.it' });
      expect(id).toMatch(/^sc_/);

      const scorte = await adapter.getScorte();
      expect(scorte.length).toBe(4);

      const added = scorte.find(s => s.id === id);
      expect(added.nome).toBe('Torcia da testa LED');
      expect(added.categoria).toBe('Illuminazione');
      expect(added.lista).toBe('Campo Estivo');
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
        lista: 'Campo Estivo',
        note: 'Rinnovati picchetti'
      }, { email: 'staff@test.it' });

      const updatedScorte = await adapter.getScorte();
      const updated = updatedScorte.find(s => s.id === target.id);
      expect(updated.quantita).toBe(48);
      expect(updated.prezzoUnitario).toBe(1.30);
      expect(updated.note).toBe('Rinnovati picchetti');
      expect(updated.categoria).toBe(target.categoria);
      expect(updated.lista).toBe('Campo Estivo');
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
    it('dovrebbe importare articoli in modalità append assegnandoli a liste specifiche', async () => {
      const itemsToImport = [
        { nome: 'Bussola Silva', categoria: 'Orientamento', lista: 'Campo Estivo', quantita: 6, quantitaMinima: 12, prezzoUnitario: 15.00, unitaMisura: 'pz' },
        { nome: 'Fazzolettone Gruppo', categoria: 'Uniformi', lista: 'Uniformi', quantita: 5, quantitaMinima: 15, prezzoUnitario: 6.50, unitaMisura: 'pz' }
      ];

      const count = await adapter.importScorteBatch(itemsToImport, false);
      expect(count).toBe(2);

      const all = await adapter.getScorte();
      expect(all.length).toBe(5); // 3 originali + 2 nuovi
      const bussola = all.find(s => s.nome === 'Bussola Silva');
      expect(bussola).toBeDefined();
      expect(bussola.lista).toBe('Campo Estivo');

      const fazzolettone = all.find(s => s.nome === 'Fazzolettone Gruppo');
      expect(fazzolettone).toBeDefined();
      expect(fazzolettone.lista).toBe('Uniformi');
    });

    it('dovrebbe importare articoli in modalità replace', async () => {
      const itemsToImport = [
        { nome: 'Ghirlanda nodi', categoria: 'Pionieristica', lista: 'Campo Estivo', quantita: 1, quantitaMinima: 2, prezzoUnitario: 5.00, unitaMisura: 'pz' }
      ];

      const count = await adapter.importScorteBatch(itemsToImport, true);
      expect(count).toBe(1);

      const all = await adapter.getScorte();
      expect(all.length).toBe(1);
      expect(all[0].nome).toBe('Ghirlanda nodi');
      expect(all[0].lista).toBe('Campo Estivo');
    });
  });
});
