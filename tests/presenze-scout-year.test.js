/**
 * Tests for Scout Year presence scoping and historical presence calculations
 * @module tests/presenze-scout-year
 */

import { describe, it, expect } from 'vitest';
import {
  getCurrentScoutYear,
  isActivityInScoutYear,
  getScoutYearDateRange
} from '../js/utils/utils.js';

describe('Scout Year Presence Register and Statistics Scoping', () => {
  const currentScoutYear = getCurrentScoutYear();
  const range = getScoutYearDateRange(currentScoutYear);

  // Attività di test: due nell'anno scout in corso, due nell'anno precedente
  const actsCurrentYear = [
    { id: 'act_curr_1', tipo: 'Riunione', data: new Date(range.start.getTime() + 1000 * 60 * 60 * 24 * 10) },
    { id: 'act_curr_2', tipo: 'Uscita', data: new Date(range.start.getTime() + 1000 * 60 * 60 * 24 * 20) }
  ];

  const prevYearParts = currentScoutYear.split('/').map(Number);
  const prevScoutYear = `${prevYearParts[0] - 1}/${prevYearParts[1] - 1}`;
  const prevRange = getScoutYearDateRange(prevScoutYear);

  const actsPrevYear = [
    { id: 'act_prev_1', tipo: 'Riunione', data: new Date(prevRange.start.getTime() + 1000 * 60 * 60 * 24 * 10) },
    { id: 'act_prev_2', tipo: 'Campo', data: new Date(prevRange.start.getTime() + 1000 * 60 * 60 * 24 * 30) }
  ];

  const allActivities = [...actsCurrentYear, ...actsPrevYear];

  const scouts = [
    { id: 's1', nome: 'Mario', cognome: 'Rossi', pv_pattuglia: 'Aquile' },
    { id: 's2', nome: 'Luigi', cognome: 'Verdi', pv_pattuglia: 'Lupi' }
  ];

  // Presenze: Mario presente a 2/2 nell'anno in corso, ma a 0/2 nell'anno precedente
  const presences = [
    { esploratoreId: 's1', attivitaId: 'act_curr_1', stato: 'Presente' },
    { esploratoreId: 's1', attivitaId: 'act_curr_2', stato: 'Presente' },
    { esploratoreId: 's1', attivitaId: 'act_prev_1', stato: 'Assente' },
    { esploratoreId: 's1', attivitaId: 'act_prev_2', stato: 'Assente' },
    // Luigi presente a 1/2 nell'anno in corso, e a 2/2 nell'anno precedente
    { esploratoreId: 's2', attivitaId: 'act_curr_1', stato: 'Presente' },
    { esploratoreId: 's2', attivitaId: 'act_curr_2', stato: 'Assente' },
    { esploratoreId: 's2', attivitaId: 'act_prev_1', stato: 'Presente' },
    { esploratoreId: 's2', attivitaId: 'act_prev_2', stato: 'Presente' }
  ];

  it('dovrebbe filtrare le attività del registro presenze solo per l\'anno scout in corso', () => {
    const currentYearActs = allActivities.filter(a => isActivityInScoutYear(a, currentScoutYear));
    expect(currentYearActs.length).toBe(2);
    expect(currentYearActs.map(a => a.id)).toEqual(['act_curr_1', 'act_curr_2']);
  });

  it('dovrebbe calcolare le statistiche di presenza solo relative all\'anno scout in corso', () => {
    const currentYearActs = allActivities.filter(a => isActivityInScoutYear(a, currentScoutYear));
    const currActIds = currentYearActs.map(a => a.id);

    // Calcolo per Mario (s1) nell'anno in corso: 2 presenti su 2 -> 100%
    const s1CurrPres = presences.filter(p => p.esploratoreId === 's1' && currActIds.includes(p.attivitaId));
    const s1Presenti = s1CurrPres.filter(p => p.stato === 'Presente').length;
    const s1Total = s1CurrPres.filter(p => p.stato === 'Presente' || p.stato === 'Assente').length;
    const s1Perc = s1Total > 0 ? Math.round((s1Presenti / s1Total) * 100) : 0;

    expect(s1Presenti).toBe(2);
    expect(s1Total).toBe(2);
    expect(s1Perc).toBe(100);

    // Se fosse globale includendo anni precedenti, Mario avrebbe 2/4 (50%)
    const s1AllPres = presences.filter(p => p.esploratoreId === 's1');
    const s1GlobalPresenti = s1AllPres.filter(p => p.stato === 'Presente').length;
    expect(s1GlobalPresenti / s1AllPres.length).toBe(0.5); // verifica che la limitazione cambi il risultato
  });

  it('dovrebbe calcolare correttamente le statistiche per gli anni precedenti separatamente nello storico', () => {
    const prevYearActs = allActivities.filter(a => isActivityInScoutYear(a, prevScoutYear));
    const prevActIds = prevYearActs.map(a => a.id);
    expect(prevYearActs.length).toBe(2);

    // Calcolo per Mario nell'anno precedente: 0 presenti su 2 -> 0%
    const s1PrevPres = presences.filter(p => p.esploratoreId === 's1' && prevActIds.includes(p.attivitaId));
    const s1PrevPresenti = s1PrevPres.filter(p => p.stato === 'Presente').length;
    expect(s1PrevPresenti).toBe(0);

    // Calcolo per Luigi (s2) nell'anno precedente: 2 presenti su 2 -> 100%
    const s2PrevPres = presences.filter(p => p.esploratoreId === 's2' && prevActIds.includes(p.attivitaId));
    const s2PrevPresenti = s2PrevPres.filter(p => p.stato === 'Presente').length;
    expect(s2PrevPresenti).toBe(2);
  });
});
