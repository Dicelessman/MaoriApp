/**
 * Tests for Monthly Calendar View Logic
 * @module tests/calendar-month-view
 */

import { describe, it, expect } from 'vitest';

// Replica della logica pura usata in calendario.js
function getActivityColorHex(type) {
  switch (type) {
    case 'Riunione':
      return '#16a34a';
    case 'Uscita':
      return '#2563eb';
    case 'Campo':
      return '#dc2626';
    case 'Evento Adulti':
      return '#7c3aed';
    case 'Riunione Adulti':
      return '#475569';
    case 'Eventi con esterni':
      return '#d97706';
    default:
      return '#16a34a';
  }
}

function computeMonthGrid(year, month, activities = []) {
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Lunedì = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthCells = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dNum);
    const dayKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    prevMonthCells.push({ dayNum: dNum, dayKey, isOtherMonth: true });
  }

  const currentMonthCells = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    currentMonthCells.push({ dayNum: d, dayKey, isOtherMonth: false });
  }

  const totalRendered = startDay + daysInMonth;
  const targetCells = totalRendered > 35 ? 42 : 35;
  const nextMonthDays = targetCells - totalRendered;
  const nextMonthCells = [];
  for (let d = 1; d <= nextMonthDays; d++) {
    const nextDate = new Date(year, month + 1, d);
    const dayKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    nextMonthCells.push({ dayNum: d, dayKey, isOtherMonth: true });
  }

  // Mappa attività per giorno
  const actByDay = {};
  activities.forEach(a => {
    if (!a.data) return;
    const startD = new Date(a.data);
    if (isNaN(startD.getTime())) return;
    const endD = a.dataFine ? new Date(a.dataFine) : startD;
    const validEnd = (isNaN(endD.getTime()) || endD < startD) ? startD : endD;

    const cur = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate());
    const limit = new Date(validEnd.getFullYear(), validEnd.getMonth(), validEnd.getDate());
    let safety = 0;
    while (cur <= limit && safety < 31) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      if (!actByDay[key]) actByDay[key] = [];
      actByDay[key].push(a);
      cur.setDate(cur.getDate() + 1);
      safety++;
    }
  });

  return {
    startDay,
    daysInMonth,
    daysInPrevMonth,
    totalCells: prevMonthCells.length + currentMonthCells.length + nextMonthCells.length,
    cells: [...prevMonthCells, ...currentMonthCells, ...nextMonthCells],
    actByDay
  };
}

describe('Calendar Month View Logic', () => {
  describe('getActivityColorHex', () => {
    it('should map each activity type to its signature color', () => {
      expect(getActivityColorHex('Riunione')).toBe('#16a34a');
      expect(getActivityColorHex('Uscita')).toBe('#2563eb');
      expect(getActivityColorHex('Campo')).toBe('#dc2626');
      expect(getActivityColorHex('Evento Adulti')).toBe('#7c3aed');
      expect(getActivityColorHex('Riunione Adulti')).toBe('#475569');
      expect(getActivityColorHex('Eventi con esterni')).toBe('#d97706');
      expect(getActivityColorHex('Altro')).toBe('#16a34a');
    });
  });

  describe('computeMonthGrid', () => {
    it('should compute correct grid size (multiple of 7, 35 or 42 cells)', () => {
      // Ottobre 2024 (1 Ottobre 2024 è martedì -> startDay = 1, 31 giorni -> 1+31=32 <= 35)
      const oct2024 = computeMonthGrid(2024, 9);
      expect(oct2024.startDay).toBe(1); // Martedì
      expect(oct2024.daysInMonth).toBe(31);
      expect(oct2024.totalCells).toBe(35);
      expect(oct2024.totalCells % 7).toBe(0);

      // Marzo 2025 (1 Marzo 2025 è sabato -> startDay = 5, 31 giorni -> 5+31=36 > 35 -> 42 cells)
      const mar2025 = computeMonthGrid(2025, 2);
      expect(mar2025.startDay).toBe(5); // Sabato
      expect(mar2025.daysInMonth).toBe(31);
      expect(mar2025.totalCells).toBe(42);
      expect(mar2025.totalCells % 7).toBe(0);
    });

    it('should correctly mark days from other months', () => {
      const grid = computeMonthGrid(2024, 9); // Ottobre 2024
      const otherMonthCells = grid.cells.filter(c => c.isOtherMonth);
      const currentMonthCells = grid.cells.filter(c => !c.isOtherMonth);

      expect(currentMonthCells.length).toBe(31);
      expect(otherMonthCells.length).toBe(4); // 1 prima (30 Settembre) + 3 dopo (1, 2, 3 Novembre)
      expect(grid.cells[0].dayKey).toBe('2024-09-30');
      expect(grid.cells[0].isOtherMonth).toBe(true);
    });

    it('should correctly map multi-day activities across all covered days', () => {
      const activities = [
        {
          id: 'act1',
          tipo: 'Campo',
          descrizione: 'Campo Invernale',
          data: '2024-12-27',
          dataFine: '2024-12-29'
        },
        {
          id: 'act2',
          tipo: 'Riunione',
          descrizione: 'Riunione Reparto',
          data: '2024-12-21'
        }
      ];

      const grid = computeMonthGrid(2024, 11, activities); // Dicembre 2024

      // Il campo copre 27, 28, 29 dicembre
      expect(grid.actByDay['2024-12-27']).toHaveLength(1);
      expect(grid.actByDay['2024-12-27'][0].id).toBe('act1');
      expect(grid.actByDay['2024-12-28']).toHaveLength(1);
      expect(grid.actByDay['2024-12-28'][0].id).toBe('act1');
      expect(grid.actByDay['2024-12-29']).toHaveLength(1);
      expect(grid.actByDay['2024-12-29'][0].id).toBe('act1');

      // 30 dicembre non ha attività
      expect(grid.actByDay['2024-12-30']).toBeUndefined();

      // Riunione solo il 21 dicembre
      expect(grid.actByDay['2024-12-21']).toHaveLength(1);
      expect(grid.actByDay['2024-12-21'][0].id).toBe('act2');
    });
  });
});
