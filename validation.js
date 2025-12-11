/**
 * Validation functions - Funzioni di validazione input
 * @module validation
 */

/**
 * Valida formato email
 * @param {string} email - Email da validare
 * @returns {boolean} true se email valida
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida che una data sia valida
 * @param {Date|string} date - Data da validare
 * @returns {boolean} true se data valida
 */
export function isValidDate(date) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Valida che una data sia nel futuro
 * @param {Date|string} date - Data da validare
 * @param {boolean} allowToday - Se true, permette anche oggi
 * @returns {boolean} true se data è futura
 */
export function isFutureDate(date, allowToday = true) {
  if (!isValidDate(date)) return false;
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  
  return allowToday ? checkDate >= today : checkDate > today;
}

/**
 * Valida che una data sia nel passato
 * @param {Date|string} date - Data da validare
 * @param {boolean} allowToday - Se true, permette anche oggi
 * @returns {boolean} true se data è passata
 */
export function isPastDate(date, allowToday = true) {
  if (!isValidDate(date)) return false;
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(d);
  checkDate.setHours(0, 0, 0, 0);
  
  return allowToday ? checkDate <= today : checkDate < today;
}

/**
 * Valida che due date siano in range corretto (start <= end)
 * @param {Date|string} startDate - Data inizio
 * @param {Date|string} endDate - Data fine
 * @returns {boolean} true se range valido
 */
export function isValidDateRange(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  return start <= end;
}

/**
 * Valida campo required (non vuoto dopo trim)
 * @param {*} value - Valore da validare
 * @returns {boolean} true se campo ha valore
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  return true;
}

/**
 * Valida lunghezza stringa
 * @param {string} value - Stringa da validare
 * @param {number} min - Lunghezza minima
 * @param {number} max - Lunghezza massima
 * @returns {boolean} true se lunghezza valida
 */
export function validateLength(value, min, max) {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Valida stato presenza
 * @param {string} state - Stato da validare
 * @returns {boolean} true se stato valido
 */
export function isValidPresenceState(state) {
  const validStates = ['Presente', 'Assente', 'NR', 'X'];
  return validStates.includes(state);
}

/**
 * Valida tipo pagamento
 * @param {string} type - Tipo da validare
 * @returns {boolean} true se tipo valido
 */
export function isValidPaymentType(type) {
  const validTypes = ['Contanti', 'Satispay', 'Bonifico', ''];
  return validTypes.includes(type);
}

/**
 * Valida tipo attività
 * @param {string} type - Tipo da validare
 * @returns {boolean} true se tipo valido
 */
export function isValidActivityType(type) {
  const validTypes = ['Riunione', 'Attività lunga', 'Uscita', 'Campo'];
  return validTypes.includes(type);
}

/**
 * Valida numero positivo
 * @param {*} value - Valore da validare
 * @returns {boolean} true se numero positivo valido
 */
export function isValidPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Valida anno (range ragionevole)
 * @param {*} year - Anno da validare
 * @returns {boolean} true se anno valido
 */
export function isValidYear(year) {
  const num = Number(year);
  return !isNaN(num) && num >= 2000 && num <= 2100;
}

/**
 * Sanitizza input rimuovendo caratteri pericolosi
 * @param {string} input - Input da sanitizzare
 * @returns {string} Input sanitizzato
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  // Rimuove caratteri di controllo eccetto \n, \r, \t
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Valida e sanitizza email
 * @param {string} email - Email da validare e sanitizzare
 * @returns {object} { valid: boolean, value: string, error: string }
 */
export function validateAndSanitizeEmail(email) {
  const trimmed = (email || '').trim();
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
 * @param {object} scout - Oggetto scout da validare
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateScout(scout) {
  const errors = [];
  
  if (!isRequired(scout.nome)) {
    errors.push('Nome obbligatorio');
  } else if (!validateLength(scout.nome, 1, 100)) {
    errors.push('Nome deve essere tra 1 e 100 caratteri');
  }
  
  if (!isRequired(scout.cognome)) {
    errors.push('Cognome obbligatorio');
  } else if (!validateLength(scout.cognome, 1, 100)) {
    errors.push('Cognome deve essere tra 1 e 100 caratteri');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida oggetto staff
 * @param {object} staff - Oggetto staff da validare
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateStaff(staff) {
  const errors = [];
  
  if (!isRequired(staff.nome)) {
    errors.push('Nome obbligatorio');
  } else if (!validateLength(staff.nome, 1, 100)) {
    errors.push('Nome deve essere tra 1 e 100 caratteri');
  }
  
  if (!isRequired(staff.cognome)) {
    errors.push('Cognome obbligatorio');
  } else if (!validateLength(staff.cognome, 1, 100)) {
    errors.push('Cognome deve essere tra 1 e 100 caratteri');
  }
  
  const emailValidation = validateAndSanitizeEmail(staff.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: emailValidation.valid ? { ...staff, email: emailValidation.value } : staff
  };
}

/**
 * Valida oggetto attività
 * @param {object} activity - Oggetto attività da validare
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateActivity(activity) {
  const errors = [];
  
  if (!isValidActivityType(activity.tipo)) {
    errors.push('Tipo attività non valido');
  }
  
  if (!isValidDate(activity.data)) {
    errors.push('Data attività non valida');
  }
  
  if (!isRequired(activity.descrizione)) {
    errors.push('Descrizione obbligatoria');
  } else if (!validateLength(activity.descrizione, 1, 500)) {
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

