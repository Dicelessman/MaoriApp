/**
 * Validation functions - Funzioni di validazione input
 * @module validation
 */

import type { Scout, Staff, Activity, ValidationResult, EmailValidationResult } from './types.js';

/**
 * Valida formato email
 */
export function isValidEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida che una data sia valida
 */
export function isValidDate(date: unknown): boolean {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date as string);
  return !isNaN(d.getTime());
}

/**
 * Valida che una data sia nel futuro
 */
export function isFutureDate(date: unknown, allowToday: boolean = true): boolean {
  if (!isValidDate(date)) return false;
  const d = date instanceof Date ? date : new Date(date as string);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  
  return allowToday ? checkDate >= today : checkDate > today;
}

/**
 * Valida che una data sia nel passato
 */
export function isPastDate(date: unknown, allowToday: boolean = true): boolean {
  if (!isValidDate(date)) return false;
  const d = date instanceof Date ? date : new Date(date as string);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  
  return allowToday ? checkDate <= today : checkDate < today;
}

/**
 * Valida che due date siano in range corretto (start <= end)
 */
export function isValidDateRange(startDate: unknown, endDate: unknown): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  const start = startDate instanceof Date ? startDate : new Date(startDate as string);
  const end = endDate instanceof Date ? endDate : new Date(endDate as string);
  return start <= end;
}

/**
 * Valida campo required (non vuoto dopo trim)
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  return true;
}

/**
 * Valida lunghezza stringa
 */
export function validateLength(value: unknown, min: number, max: number): boolean {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Valida stato presenza
 */
export function isValidPresenceState(state: unknown): boolean {
  const validStates = ['Presente', 'Assente', 'NR', 'X'];
  return typeof state === 'string' && validStates.includes(state);
}

/**
 * Valida tipo pagamento
 */
export function isValidPaymentType(type: unknown): boolean {
  const validTypes = ['Contanti', 'Satispay', 'Bonifico', ''];
  return type === null || (typeof type === 'string' && validTypes.includes(type));
}

/**
 * Valida tipo attività
 */
export function isValidActivityType(type: unknown): type is Activity['tipo'] {
  const validTypes: Activity['tipo'][] = ['Riunione', 'Attività lunga', 'Uscita', 'Campo'];
  return typeof type === 'string' && validTypes.includes(type as Activity['tipo']);
}

/**
 * Valida numero positivo
 */
export function isValidPositiveNumber(value: unknown): boolean {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Valida anno (range ragionevole)
 */
export function isValidYear(year: unknown): boolean {
  const num = Number(year);
  return !isNaN(num) && num >= 2000 && num <= 2100;
}

/**
 * Sanitizza input rimuovendo caratteri pericolosi
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  // Rimuove caratteri di controllo eccetto \n, \r, \t
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Valida e sanitizza email
 */
export function validateAndSanitizeEmail(email: unknown): EmailValidationResult {
  const trimmed = (typeof email === 'string' ? email : '').trim();
  if (!trimmed) {
    return { valid: false, value: '', error: 'Email obbligatoria' };
  }
  if (!isValidEmail(trimmed)) {
    return { valid: false, value: trimmed, error: 'Formato email non valido' };
  }
  return { valid: true, value: trimmed.toLowerCase(), error: null };
}

/**
 * Valida oggetto scout
 */
export function validateScout(scout: Partial<Scout>): ValidationResult {
  const errors: string[] = [];
  
  if (!isRequired(scout.nome)) {
    errors.push('Nome obbligatorio');
  } else if (scout.nome && !validateLength(scout.nome, 1, 100)) {
    errors.push('Nome deve essere tra 1 e 100 caratteri');
  }
  
  if (!isRequired(scout.cognome)) {
    errors.push('Cognome obbligatorio');
  } else if (scout.cognome && !validateLength(scout.cognome, 1, 100)) {
    errors.push('Cognome deve essere tra 1 e 100 caratteri');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida oggetto staff
 */
export function validateStaff(staff: Partial<Staff>): ValidationResult & { sanitized?: Staff } {
  const errors: string[] = [];
  
  if (!isRequired(staff.nome)) {
    errors.push('Nome obbligatorio');
  } else if (staff.nome && !validateLength(staff.nome, 1, 100)) {
    errors.push('Nome deve essere tra 1 e 100 caratteri');
  }
  
  if (!isRequired(staff.cognome)) {
    errors.push('Cognome obbligatorio');
  } else if (staff.cognome && !validateLength(staff.cognome, 1, 100)) {
    errors.push('Cognome deve essere tra 1 e 100 caratteri');
  }
  
  const emailValidation = validateAndSanitizeEmail(staff.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error || 'Email non valida');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: emailValidation.valid && staff.nome && staff.cognome ? {
      ...staff as Staff,
      email: emailValidation.value
    } : undefined
  };
}

/**
 * Valida oggetto attività
 */
export function validateActivity(activity: Partial<Activity>): ValidationResult {
  const errors: string[] = [];
  
  if (!isValidActivityType(activity.tipo)) {
    errors.push('Tipo attività non valido');
  }
  
  if (!isValidDate(activity.data)) {
    errors.push('Data attività non valida');
  }
  
  if (!isRequired(activity.descrizione)) {
    errors.push('Descrizione obbligatoria');
  } else if (activity.descrizione && !validateLength(activity.descrizione, 1, 500)) {
    errors.push('Descrizione deve essere tra 1 e 500 caratteri');
  }
  
  if (activity.costo !== undefined && activity.costo !== null && activity.costo !== '') {
    if (!isValidPositiveNumber(activity.costo)) {
      errors.push('Costo deve essere un numero positivo');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

