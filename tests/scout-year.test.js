/**
 * Tests for Scout Year calculations, ranges, filtering and archiving
 * @module tests/scout-year
 */

import { describe, it, expect } from 'vitest';
import {
  getScoutYear,
  getScoutYearDateRange,
  getCurrentScoutYear,
  getAllScoutYears,
  isActivityInScoutYear
} from '../js/utils/utils.js';

describe('Scout Year Utilities', () => {
  describe('getScoutYear', () => {
    it('should return null for null or invalid dates', () => {
      expect(getScoutYear(null)).toBeNull();
      expect(getScoutYear(undefined)).toBeNull();
      expect(getScoutYear('invalid-date')).toBeNull();
    });

    it('should identify autumn activities as belonging to startYear/startYear+1', () => {
      // 15 October 2024 -> 2024/2025
      expect(getScoutYear('2024-10-15')).toBe('2024/2025');
      // 1 September 2024 -> 2024/2025 (boundary start)
      expect(getScoutYear('2024-09-01')).toBe('2024/2025');
    });

    it('should identify winter/spring/summer activities as belonging to year-1/year', () => {
      // 15 January 2025 -> 2024/2025
      expect(getScoutYear('2025-01-15')).toBe('2024/2025');
      // 31 August 2025 -> 2024/2025 (boundary end)
      expect(getScoutYear('2025-08-31')).toBe('2024/2025');
    });

    it('should transition to next scout year on 1st September', () => {
      // 1 September 2025 -> 2025/2026
      expect(getScoutYear('2025-09-01')).toBe('2025/2026');
      // 20 July 2026 -> 2025/2026
      expect(getScoutYear('2026-07-20')).toBe('2025/2026');
    });

    it('should handle Firestore-like Timestamp objects', () => {
      const mockTimestamp = { toDate: () => new Date('2023-11-10') };
      expect(getScoutYear(mockTimestamp)).toBe('2023/2024');
    });
  });

  describe('getScoutYearDateRange', () => {
    it('should return null for invalid inputs', () => {
      expect(getScoutYearDateRange(null)).toBeNull();
      expect(getScoutYearDateRange('')).toBeNull();
      expect(getScoutYearDateRange('invalid')).toBeNull();
    });

    it('should return correct start and end boundaries for 2024/2025', () => {
      const range = getScoutYearDateRange('2024/2025');
      expect(range).not.toBeNull();
      expect(range.start.getFullYear()).toBe(2024);
      expect(range.start.getMonth()).toBe(8); // September (0-indexed 8)
      expect(range.start.getDate()).toBe(1);

      expect(range.end.getFullYear()).toBe(2025);
      expect(range.end.getMonth()).toBe(7); // August (0-indexed 7)
      expect(range.end.getDate()).toBe(31);
    });
  });

  describe('getCurrentScoutYear', () => {
    it('should return valid scout year string', () => {
      const current = getCurrentScoutYear();
      expect(current).toMatch(/^\d{4}\/\d{4}$/);
    });

    it('should calculate current scout year given a reference date', () => {
      expect(getCurrentScoutYear(new Date('2024-11-01'))).toBe('2024/2025');
      expect(getCurrentScoutYear(new Date('2025-03-01'))).toBe('2024/2025');
      expect(getCurrentScoutYear(new Date('2025-10-01'))).toBe('2025/2026');
    });
  });

  describe('getAllScoutYears', () => {
    it('should extract unique scout years and sort them descending', () => {
      const activities = [
        { id: '1', data: '2023-10-10' }, // 2023/2024
        { id: '2', data: '2024-02-15' }, // 2023/2024
        { id: '3', data: '2024-11-20' }, // 2024/2025
        { id: '4', data: '2025-05-10' }, // 2024/2025
        { id: '5', annoScout: '2022/2023' } // explicit tag
      ];

      const years = getAllScoutYears(activities);
      expect(years).toContain('2024/2025');
      expect(years).toContain('2023/2024');
      expect(years).toContain('2022/2023');
      // Must be sorted descending
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i].localeCompare(years[i + 1])).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('isActivityInScoutYear', () => {
    const act1 = { id: '1', data: '2024-10-10' }; // 2024/2025
    const act2 = { id: '2', data: '2025-09-15' }; // 2025/2026
    const actExplicit = { id: '3', data: '2020-01-01', annoScout: '2024/2025' };

    it('should match correctly by date range', () => {
      expect(isActivityInScoutYear(act1, '2024/2025')).toBe(true);
      expect(isActivityInScoutYear(act1, '2025/2026')).toBe(false);

      expect(isActivityInScoutYear(act2, '2025/2026')).toBe(true);
      expect(isActivityInScoutYear(act2, '2024/2025')).toBe(false);
    });

    it('should match by explicit annoScout tag when present', () => {
      expect(isActivityInScoutYear(actExplicit, '2024/2025')).toBe(true);
    });

    it('should return true when scoutYear is "all"', () => {
      expect(isActivityInScoutYear(act1, 'all')).toBe(true);
      expect(isActivityInScoutYear(act2, 'all')).toBe(true);
    });

    it('should return false for invalid inputs', () => {
      expect(isActivityInScoutYear(null, '2024/2025')).toBe(false);
      expect(isActivityInScoutYear(act1, null)).toBe(false);
    });
  });
});
