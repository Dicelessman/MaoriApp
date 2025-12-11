/**
 * Test per funzioni di validazione
 * Questi test verificano la logica di validazione in isolamento
 */

import { describe, it, expect } from 'vitest';

describe('Validation Functions', () => {
  describe('Email validation', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test_123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user @domain.com',
        'user@domain',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email || '')).toBe(false);
      });
    });
  });

  describe('Date validation', () => {
    it('should validate date format', () => {
      const isValidDate = (dateString) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      };

      expect(isValidDate('2024-03-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('2024-13-45')).toBe(false); // Date non valida
    });

    it('should validate date is not in the past for activities', () => {
      const isFutureDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return !isNaN(date.getTime()) && date >= today;
      };

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isFutureDate(tomorrow.toISOString().split('T')[0])).toBe(true);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isFutureDate(yesterday.toISOString().split('T')[0])).toBe(false);
    });
  });

  describe('Required field validation', () => {
    it('should validate required string fields', () => {
      const isRequired = (value) => {
        return value !== null && value !== undefined && String(value).trim() !== '';
      };

      expect(isRequired('test')).toBe(true);
      expect(isRequired('  test  ')).toBe(true);
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });

    it('should validate required number fields', () => {
      const isRequiredNumber = (value) => {
        return value !== null && value !== undefined && !isNaN(Number(value));
      };

      expect(isRequiredNumber(0)).toBe(true);
      expect(isRequiredNumber(123)).toBe(true);
      expect(isRequiredNumber('123')).toBe(true);
      expect(isRequiredNumber(null)).toBe(false);
      expect(isRequiredNumber('')).toBe(false);
      expect(isRequiredNumber('abc')).toBe(false);
    });
  });

  describe('Length validation', () => {
    it('should validate string length', () => {
      const validateLength = (value, min, max) => {
        const length = (value || '').trim().length;
        return length >= min && length <= max;
      };

      expect(validateLength('test', 1, 10)).toBe(true);
      expect(validateLength('', 1, 10)).toBe(false);
      expect(validateLength('a'.repeat(100), 1, 50)).toBe(false);
      expect(validateLength('hello', 5, 5)).toBe(true);
    });
  });

  describe('Presence state validation', () => {
    it('should validate presence state values', () => {
      const validStates = ['Presente', 'Assente', 'NR', 'X'];
      const isValidState = (state) => validStates.includes(state);

      validStates.forEach(state => {
        expect(isValidState(state)).toBe(true);
      });

      expect(isValidState('invalid')).toBe(false);
      expect(isValidState('')).toBe(false);
      expect(isValidState(null)).toBe(false);
    });

    it('should validate payment type values', () => {
      const validTypes = ['Contanti', 'Satispay', 'Bonifico', ''];
      const isValidPaymentType = (type) => validTypes.includes(type);

      validTypes.forEach(type => {
        expect(isValidPaymentType(type)).toBe(true);
      });

      expect(isValidPaymentType('invalid')).toBe(false);
    });
  });
});

