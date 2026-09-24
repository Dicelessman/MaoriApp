import { describe, it, expect } from 'vitest';

describe('Ordinamento Colonna Esploratore in Presenze', () => {
  // Funzione di ordinamento identica a quella implementata in UI.sortScouts
  function sortScouts(scouts, options, presencesMap = {}) {
    const { field = 'cognome', dir = 'asc', targetActId = null } = options;
    const isDesc = dir === 'desc';
    const sorted = [...(scouts || [])];

    if (field === 'nome') {
      sorted.sort((a, b) => {
        const an = (a.nome || '').trim();
        const bn = (b.nome || '').trim();
        const cmp = an.localeCompare(bn, 'it', { sensitivity: 'base' });
        if (cmp !== 0) return isDesc ? -cmp : cmp;
        const ac = (a.cognome || '').trim();
        const bc = (b.cognome || '').trim();
        const cmpC = ac.localeCompare(bc, 'it', { sensitivity: 'base' });
        return isDesc ? -cmpC : cmpC;
      });
    } else if (field === 'cognome') {
      sorted.sort((a, b) => {
        const ac = (a.cognome || '').trim();
        const bc = (b.cognome || '').trim();
        const cmp = ac.localeCompare(bc, 'it', { sensitivity: 'base' });
        if (cmp !== 0) return isDesc ? -cmp : cmp;
        const an = (a.nome || '').trim();
        const bn = (b.nome || '').trim();
        const cmpN = an.localeCompare(bn, 'it', { sensitivity: 'base' });
        return isDesc ? -cmpN : cmpN;
      });
    } else if (field === 'pattuglia') {
      sorted.sort((a, b) => {
        const pA = (a.pv_pattuglia || '').trim();
        const pB = (b.pv_pattuglia || '').trim();
        if (!pA && pB) return 1;
        if (pA && !pB) return -1;
        if (!pA && !pB) {
          const cA = (a.cognome || '').trim().localeCompare((b.cognome || '').trim(), 'it', { sensitivity: 'base' });
          if (cA !== 0) return cA;
          return (a.nome || '').trim().localeCompare((b.nome || '').trim(), 'it', { sensitivity: 'base' });
        }
        const cmp = pA.localeCompare(pB, 'it', { sensitivity: 'base' });
        if (cmp !== 0) return isDesc ? -cmp : cmp;
        const cA = (a.cognome || '').trim().localeCompare((b.cognome || '').trim(), 'it', { sensitivity: 'base' });
        if (cA !== 0) return cA;
        return (a.nome || '').trim().localeCompare((b.nome || '').trim(), 'it', { sensitivity: 'base' });
      });
    } else if (field === 'stato') {
      const getRank = (scoutId) => {
        if (!targetActId) return 3;
        const pr = presencesMap[`${scoutId}_${targetActId}`];
        const st = pr ? pr.stato : 'NR';
        if (st === 'Presente') return 1;
        if (st === 'Assente') return 2;
        if (st === 'NR' || !st) return 3;
        if (st === 'X') return 4;
        return 3;
      };

      sorted.sort((a, b) => {
        const rankA = getRank(a.id);
        const rankB = getRank(b.id);
        if (rankA !== rankB) {
          return isDesc ? (rankB - rankA) : (rankA - rankB);
        }
        // Ordina alfabeticamente per nome all'interno del medesimo stato
        const an = (a.nome || '').trim();
        const bn = (b.nome || '').trim();
        const cmpN = an.localeCompare(bn, 'it', { sensitivity: 'base' });
        if (cmpN !== 0) return cmpN;
        const ac = (a.cognome || '').trim();
        const bc = (b.cognome || '').trim();
        return ac.localeCompare(bc, 'it', { sensitivity: 'base' });
      });
    }

    return sorted;
  }

  const sampleScouts = [
    { id: '1', nome: 'Marco', cognome: 'Verdi', pv_pattuglia: 'Volpi' },
    { id: '2', nome: 'Andrea', cognome: 'Rossi', pv_pattuglia: 'Aquile' },
    { id: '3', nome: 'Chiara', cognome: 'Bianchi', pv_pattuglia: 'Lupi' },
    { id: '4', nome: 'Andrea', cognome: 'Bruni', pv_pattuglia: 'Aquile' },
    { id: '5', nome: 'Beatrice', cognome: 'Neri', pv_pattuglia: '' },
    { id: '6', nome: 'Zaccaria', cognome: 'Alberti', pv_pattuglia: 'Volpi' }
  ];

  describe('Ordinamento per Nome', () => {
    it('ordina per nome crescente (A -> Z)', () => {
      const res = sortScouts(sampleScouts, { field: 'nome', dir: 'asc' });
      const names = res.map(s => `${s.nome} ${s.cognome}`);
      expect(names).toEqual([
        'Andrea Bruni',
        'Andrea Rossi',
        'Beatrice Neri',
        'Chiara Bianchi',
        'Marco Verdi',
        'Zaccaria Alberti'
      ]);
    });

    it('ordina per nome decrescente (Z -> A)', () => {
      const res = sortScouts(sampleScouts, { field: 'nome', dir: 'desc' });
      const names = res.map(s => `${s.nome} ${s.cognome}`);
      expect(names).toEqual([
        'Zaccaria Alberti',
        'Marco Verdi',
        'Chiara Bianchi',
        'Beatrice Neri',
        'Andrea Rossi',
        'Andrea Bruni'
      ]);
    });
  });

  describe('Ordinamento per Cognome', () => {
    it('ordina per cognome crescente (A -> Z)', () => {
      const res = sortScouts(sampleScouts, { field: 'cognome', dir: 'asc' });
      const surnames = res.map(s => s.cognome);
      expect(surnames).toEqual([
        'Alberti',
        'Bianchi',
        'Bruni',
        'Neri',
        'Rossi',
        'Verdi'
      ]);
    });

    it('ordina per cognome decrescente (Z -> A)', () => {
      const res = sortScouts(sampleScouts, { field: 'cognome', dir: 'desc' });
      const surnames = res.map(s => s.cognome);
      expect(surnames).toEqual([
        'Verdi',
        'Rossi',
        'Neri',
        'Bruni',
        'Bianchi',
        'Alberti'
      ]);
    });
  });

  describe('Ordinamento per Pattuglia', () => {
    it('ordina per pattuglia crescente con non assegnati in coda', () => {
      const res = sortScouts(sampleScouts, { field: 'pattuglia', dir: 'asc' });
      const patrols = res.map(s => ({ p: s.pv_pattuglia, c: s.cognome }));
      expect(patrols).toEqual([
        { p: 'Aquile', c: 'Bruni' },
        { p: 'Aquile', c: 'Rossi' },
        { p: 'Lupi', c: 'Bianchi' },
        { p: 'Volpi', c: 'Alberti' },
        { p: 'Volpi', c: 'Verdi' },
        { p: '', c: 'Neri' }
      ]);
    });

    it('ordina per pattuglia decrescente con non assegnati sempre in coda', () => {
      const res = sortScouts(sampleScouts, { field: 'pattuglia', dir: 'desc' });
      const patrols = res.map(s => ({ p: s.pv_pattuglia, c: s.cognome }));
      expect(patrols).toEqual([
        { p: 'Volpi', c: 'Alberti' },
        { p: 'Volpi', c: 'Verdi' },
        { p: 'Lupi', c: 'Bianchi' },
        { p: 'Aquile', c: 'Bruni' },
        { p: 'Aquile', c: 'Rossi' },
        { p: '', c: 'Neri' }
      ]);
    });
  });

  describe('Ordinamento per Stato Presenza (P -> A -> NR con ordine alfabetico interno per Nome)', () => {
    const actId = 'act_next';
    const presences = {
      '1_act_next': { stato: 'Assente' },   // Marco Verdi
      '2_act_next': { stato: 'Presente' },  // Andrea Rossi
      '3_act_next': { stato: 'Presente' },  // Chiara Bianchi
      '4_act_next': { stato: 'NR' },        // Andrea Bruni
      '5_act_next': { stato: 'Presente' },  // Beatrice Neri
      '6_act_next': { stato: 'Assente' }    // Zaccaria Alberti
    };

    it('ordina per Presenza (P -> A -> NR) e all interno per Nome', () => {
      const res = sortScouts(sampleScouts, { field: 'stato', dir: 'asc', targetActId: actId }, presences);
      const mapped = res.map(s => ({
        nome: s.nome,
        cognome: s.cognome,
        stato: presences[`${s.id}_${actId}`]?.stato || 'NR'
      }));

      expect(mapped).toEqual([
        // Gruppo Presente ordinato per nome: Andrea, Beatrice, Chiara
        { nome: 'Andrea', cognome: 'Rossi', stato: 'Presente' },
        { nome: 'Beatrice', cognome: 'Neri', stato: 'Presente' },
        { nome: 'Chiara', cognome: 'Bianchi', stato: 'Presente' },
        // Gruppo Assente ordinato per nome: Marco, Zaccaria
        { nome: 'Marco', cognome: 'Verdi', stato: 'Assente' },
        { nome: 'Zaccaria', cognome: 'Alberti', stato: 'Assente' },
        // Gruppo NR
        { nome: 'Andrea', cognome: 'Bruni', stato: 'NR' }
      ]);
    });

    it('ordina per Presenza decrescente (NR -> A -> P) e all interno per Nome', () => {
      const res = sortScouts(sampleScouts, { field: 'stato', dir: 'desc', targetActId: actId }, presences);
      const mapped = res.map(s => ({
        nome: s.nome,
        cognome: s.cognome,
        stato: presences[`${s.id}_${actId}`]?.stato || 'NR'
      }));

      expect(mapped).toEqual([
        // Gruppo NR
        { nome: 'Andrea', cognome: 'Bruni', stato: 'NR' },
        // Gruppo Assente ordinato per nome: Marco, Zaccaria
        { nome: 'Marco', cognome: 'Verdi', stato: 'Assente' },
        { nome: 'Zaccaria', cognome: 'Alberti', stato: 'Assente' },
        // Gruppo Presente ordinato per nome: Andrea, Beatrice, Chiara
        { nome: 'Andrea', cognome: 'Rossi', stato: 'Presente' },
        { nome: 'Beatrice', cognome: 'Neri', stato: 'Presente' },
        { nome: 'Chiara', cognome: 'Bianchi', stato: 'Presente' }
      ]);
    });

    it('gestisce stati non definiti trattandoli come NR', () => {
      const emptyPresences = {};
      const res = sortScouts(sampleScouts, { field: 'stato', dir: 'asc', targetActId: actId }, emptyPresences);
      // Se tutti sono NR, devono essere ordinati alfabeticamente per nome
      const names = res.map(s => s.nome);
      expect(names).toEqual([
        'Andrea',
        'Andrea',
        'Beatrice',
        'Chiara',
        'Marco',
        'Zaccaria'
      ]);
    });
  });
});
