/**
 * Utility functions - Funzioni pure riutilizzabili
 * @module utils
 */

/**
 * Converte una data Firestore o JS Date in stringa formato YYYY-MM-DD
 */
export function toYyyyMmDd(date: Date | { toDate: () => Date } | string | null | undefined): string {
  if (!date) return '';
  let d: Date;
  if (date && typeof (date as any).toDate === 'function') {
    d = (date as { toDate: () => Date }).toDate();
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
 */
export function toJsDate(firestoreDate: { toDate: () => Date } | Date | string | null | undefined): Date | null {
  if (!firestoreDate) return null;
  if ((firestoreDate as any).toDate && typeof (firestoreDate as any).toDate === 'function') {
    return (firestoreDate as { toDate: () => Date }).toDate();
  }
  if (firestoreDate instanceof Date) return firestoreDate;
  const d = new Date(firestoreDate);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formatta una data in formato locale italiano
 */
export function formatDate(
  date: Date | { toDate: () => Date } | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  const d = toJsDate(date);
  if (!d) return '';
  return d.toLocaleDateString('it-IT', options);
}

/**
 * Sanitizza HTML per prevenire XSS
 */
export function sanitizeHtml(str: string | null | undefined): string {
  if (!str) return '';
  // Crea un elemento temporaneo per escape automatico
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Normalizza spazi bianchi (trim e sostituisce multiple spaces con uno)
 */
export function normalizeWhitespace(str: string | null | undefined): string {
  return (str || '').trim().replace(/\s+/g, ' ');
}

/**
 * Genera un ID univoco semplice
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function per limitare chiamate funzione
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return function executedFunction(...args: Parameters<T>) {
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
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

