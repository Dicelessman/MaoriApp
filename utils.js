/**
 * Utility functions - Funzioni pure riutilizzabili
 * @module utils
 */

/**
 * Converte una data Firestore o JS Date in stringa formato YYYY-MM-DD
 * @param {Date|object|string} date - Data da convertire
 * @returns {string} Data in formato YYYY-MM-DD o stringa vuota se invalida
 */
export function toYyyyMmDd(date) {
  if (!date) return '';
  let d;
  if (date && typeof date.toDate === 'function') {
    d = date.toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Converte un valore Firestore timestamp o date in JavaScript Date
 * @param {object|Date|string} firestoreDate - Data Firestore o JS Date
 * @returns {Date|null} JavaScript Date object o null se invalida
 */
export function toJsDate(firestoreDate) {
  if (!firestoreDate) return null;
  if (firestoreDate.toDate && typeof firestoreDate.toDate === 'function') {
    return firestoreDate.toDate();
  }
  if (firestoreDate instanceof Date) return firestoreDate;
  const d = new Date(firestoreDate);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formatta una data in formato locale italiano
 * @param {Date|object|string} date - Data da formattare
 * @param {object} options - Opzioni per Intl.DateTimeFormat
 * @returns {string} Data formattata o stringa vuota se invalida
 */
export function formatDate(date, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  const d = toJsDate(date);
  if (!d) return '';
  return d.toLocaleDateString('it-IT', options);
}

/**
 * Sanitizza HTML per prevenire XSS
 * @param {string} str - Stringa da sanitizzare
 * @returns {string} Stringa sanitizzata
 */
export function sanitizeHtml(str) {
  if (!str) return '';
  // Crea un elemento temporaneo per escape automatico
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Normalizza spazi bianchi (trim e sostituisce multiple spaces con uno)
 * @param {string} str - Stringa da normalizzare
 * @returns {string} Stringa normalizzata
 */
export function normalizeWhitespace(str) {
  return (str || '').trim().replace(/\s+/g, ' ');
}

/**
 * Genera un ID univoco semplice
 * @returns {string} ID univoco
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function per limitare chiamate funzione
 * @param {Function} func - Funzione da debounce
 * @param {number} wait - Tempo di attesa in ms
 * @returns {Function} Funzione debounced
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function per limitare chiamate funzione
 * @param {Function} func - Funzione da throttle
 * @param {number} limit - Limite tempo in ms
 * @returns {Function} Funzione throttled
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

