/**
 * Tests for Utility Functions
 * @module tests/utils
 */

import { describe, it, expect, vi } from 'vitest';
import { escapeHtml, toJsDate, formatTimeAgo, debounceWithRateLimit } from '../js/utils/utils';

describe('Utility Functions', () => {
  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      // Note: jsdom/browser often converts " to &quot; or similar
      const escaped = escapeHtml('<script>alert("xss")</script>');
      // escapeHtml uses div.textContent then innerHTML.
      // <script> -> &lt;script&gt;
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&lt;/script&gt;');
    });

    it('should handle null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('toJsDate', () => {
    it('should convert Firestore timestamp to Date', () => {
      const mockTimestamp = { toDate: () => new Date('2024-03-15') };
      expect(toJsDate(mockTimestamp)).toBeInstanceOf(Date);
      expect(toJsDate(mockTimestamp).toISOString().startsWith('2024-03-15')).toBe(true);
    });

    it('should return Date if already Date', () => {
      const d = new Date();
      expect(toJsDate(d)).toBe(d);
    });

    it('should create Date from string', () => {
      const d = toJsDate('2024-01-01');
      expect(d).toBeInstanceOf(Date);
      expect(isNaN(d)).toBe(false);
    });
  });

  describe('formatTimeAgo', () => {
    it('should format minutes ago', () => {
      const now = new Date();
      const fiveMinsAgo = new Date(now - 5 * 60000);
      expect(formatTimeAgo(fiveMinsAgo)).toBe('5 min fa');
    });

    it('should format hours ago', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now - 120 * 60000);
      expect(formatTimeAgo(twoHoursAgo)).toBe('2 h fa');
    });

    it('should format date if long ago', () => {
      const longAgo = new Date('2020-01-01');
      // Locale might vary, just check it returns a string with 2020 or similar format
      expect(formatTimeAgo(longAgo)).toContain('2020'); // Simple check
    });
  });

  describe('debounceWithRateLimit', () => {
    it('should delay execution', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      debounceWithRateLimit('test', fn, 1000);

      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(fn).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});


