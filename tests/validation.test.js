import { describe, it, expect } from 'vitest';
import { validateFieldValue, sanitizeInput } from '../js/utils/validation';


describe('Validation Functions', () => {
  describe('Email validation', () => {
    it('should accept valid emails', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
      validEmails.forEach(email => {
        expect(validateFieldValue(email, { type: 'email' }).valid).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = ['notanemail', '@domain.com', 'user@'];
      invalidEmails.forEach(email => {
        // Required check comes first if empty, assuming required=false by default unless specified
        // But validateFieldValue logic: "if !value return valid/true".
        // So we need to check non-empty invalid strings.
        if (email) expect(validateFieldValue(email, { type: 'email' }).valid).toBe(false);
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
      expect(validateFieldValue('test', { required: true }).valid).toBe(true);
      expect(validateFieldValue('', { required: true }).valid).toBe(false);
      expect(validateFieldValue(null, { required: true }).valid).toBe(false);
    });

    it('should validate required number fields', () => {
      expect(validateFieldValue(0, { required: true }).valid).toBe(true);
      expect(validateFieldValue(123, { required: true }).valid).toBe(true);
      expect(validateFieldValue('', { required: true }).valid).toBe(false);
    });
  });

  describe('Length validation', () => {
    it('should validate string length', () => {
      expect(validateFieldValue('test', { minLength: 1, maxLength: 10 }).valid).toBe(true);
      expect(validateFieldValue('', { minLength: 1 }).valid).toBe(true); // Valid if not required
      expect(validateFieldValue('hello', { minLength: 5 }).valid).toBe(true);
      expect(validateFieldValue('hi', { minLength: 5 }).valid).toBe(false);
    });
  });

  describe('Pattern validation', () => {
    it('should validate against regex pattern', () => {
      const rule = { pattern: /^[A-Z]+$/ };
      expect(validateFieldValue('ABC', rule).valid).toBe(true);
      expect(validateFieldValue('abc', rule).valid).toBe(false);
      expect(validateFieldValue('123', rule).valid).toBe(false);
    });
  });

  describe('Custom validator', () => {
    it('should use custom validator function', () => {
      const isEven = (val) => Number(val) % 2 === 0;
      const rule = { validator: isEven, customMessage: 'Must be even' };

      expect(validateFieldValue(2, rule).valid).toBe(true);
      expect(validateFieldValue(3, rule).valid).toBe(false);
      expect(validateFieldValue(3, rule).error).toBe('Must be even');
    });

    it('should handle custom validator returning string error', () => {
      const rule = { validator: (val) => val === 'secret' ? true : 'Wrong secret' };
      expect(validateFieldValue('secret', rule).valid).toBe(true);
      expect(validateFieldValue('wrong', rule).valid).toBe(false);
      expect(validateFieldValue('wrong', rule).error).toBe('Wrong secret');
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

  describe('Sanitization', () => {
    it('should strip script tags', () => {
      const input = 'Hello <script>alert("XSS")</script> World';
      expect(sanitizeInput(input)).toBe('Hello  World');
    });

    it('should strip html tags', () => {
      const input = '<p>Hello <b>World</b></p>';
      expect(sanitizeInput(input)).toBe('Hello World');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
    });
  });
});
