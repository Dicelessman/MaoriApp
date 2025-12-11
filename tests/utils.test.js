/**
 * Test per funzioni utility pure
 * Questi test sono indipendenti da Firebase e possono girare velocemente
 */

import { describe, it, expect } from 'vitest';

// Import delle funzioni utility (da estrarre in utils.js)
// Per ora testiamo logica pura che possiamo importare o replicare

describe('Utility Functions', () => {
  describe('Date formatting', () => {
    it('should format date to YYYY-MM-DD correctly', () => {
      const toYyyyMmDd = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
      };

      const date = new Date('2024-03-15');
      expect(toYyyyMmDd(date)).toBe('2024-03-15');
      
      expect(toYyyyMmDd('2024-03-15')).toBe('2024-03-15');
      expect(toYyyyMmDd(null)).toBe('');
      expect(toYyyyMmDd('invalid')).toBe('');
    });

    it('should convert Firestore timestamp to JS Date', () => {
      // Simula conversione timestamp
      const toJsDate = (val) => {
        if (!val) return null;
        if (val.toDate && typeof val.toDate === 'function') {
          return val.toDate();
        }
        if (val instanceof Date) return val;
        return new Date(val);
      };

      // Mock Firestore timestamp
      const mockTimestamp = {
        toDate: () => new Date('2024-03-15')
      };

      expect(toJsDate(mockTimestamp)).toBeInstanceOf(Date);
      expect(toJsDate(new Date('2024-03-15'))).toBeInstanceOf(Date);
      expect(toJsDate('2024-03-15')).toBeInstanceOf(Date);
      expect(toJsDate(null)).toBe(null);
    });
  });

  describe('String utilities', () => {
    it('should sanitize HTML to prevent XSS', () => {
      const sanitizeHtml = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      };

      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(sanitizeHtml('Hello <b>World</b>')).toBe('Hello &lt;b&gt;World&lt;/b&gt;');
      expect(sanitizeHtml('Normal text')).toBe('Normal text');
      expect(sanitizeHtml(null)).toBe('');
    });

    it('should trim and normalize whitespace', () => {
      const normalizeWhitespace = (str) => {
        return (str || '').trim().replace(/\s+/g, ' ');
      };

      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
      expect(normalizeWhitespace('hello\n\tworld')).toBe('hello world');
      expect(normalizeWhitespace(null)).toBe('');
    });
  });

  describe('Validation helpers', () => {
    it('should validate email format', () => {
      const isValidEmail = (email) => {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
      };

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });

    it('should validate date range', () => {
      const isValidDateRange = (start, end) => {
        if (!start || !end) return false;
        const startDate = new Date(start);
        const endDate = new Date(end);
        return !isNaN(startDate.getTime()) && 
               !isNaN(endDate.getTime()) && 
               startDate <= endDate;
      };

      expect(isValidDateRange('2024-01-01', '2024-12-31')).toBe(true);
      expect(isValidDateRange('2024-12-31', '2024-01-01')).toBe(false);
      expect(isValidDateRange('invalid', '2024-01-01')).toBe(false);
    });
  });
});

