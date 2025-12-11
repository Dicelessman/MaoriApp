/**
 * Constants - Configurazioni e costanti dell'applicazione
 * @module constants
 */

/**
 * Stati presenza validi
 * @type {string[]}
 */
export const PRESENCE_STATES = ['Presente', 'Assente', 'NR', 'X'];

/**
 * Tipi pagamento validi
 * @type {string[]}
 */
export const PAYMENT_TYPES = ['Contanti', 'Satispay', 'Bonifico'];

/**
 * Tipi attività validi
 * @type {string[]}
 */
export const ACTIVITY_TYPES = ['Riunione', 'Attività lunga', 'Uscita', 'Campo'];

/**
 * Limiti validazione
 * @type {object}
 */
export const VALIDATION_LIMITS = {
  NOME_MIN: 1,
  NOME_MAX: 100,
  COGNOME_MIN: 1,
  COGNOME_MAX: 100,
  DESCRIZIONE_MIN: 1,
  DESCRIZIONE_MAX: 500,
  EMAIL_MAX: 255,
  ANNO_MIN: 2000,
  ANNO_MAX: 2100
};

/**
 * Configurazione cache
 * @type {object}
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minuti
  STALE_WHILE_REVALIDATE: true
};

/**
 * Configurazione rendering batch
 * @type {object}
 */
export const RENDER_CONFIG = {
  DEFAULT_BATCH_SIZE: 100,
  LARGE_LIST_THRESHOLD: 200,
  DEBOUNCE_DELAY: 300
};

/**
 * Configurazione toast
 * @type {object}
 */
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 2500,
  SUCCESS_DURATION: 2000,
  ERROR_DURATION: 4000,
  WARNING_DURATION: 3000
};

/**
 * Configurazione date
 * @type {object}
 */
export const DATE_CONFIG = {
  LOCALE: 'it-IT',
  DEFAULT_FORMAT: { day: '2-digit', month: '2-digit', year: 'numeric' },
  LONG_FORMAT: { day: '2-digit', month: 'long', year: 'numeric' }
};

/**
 * Colori tema
 * @type {object}
 */
export const THEME_COLORS = {
  PRIMARY: '#16a34a',
  PRIMARY_STRONG: '#15803d',
  ERROR: '#dc2626',
  WARNING: '#eab308',
  INFO: '#374151',
  SUCCESS: '#16a34a'
};

/**
 * Nomi collezioni Firestore
 * @type {object}
 */
export const FIRESTORE_COLLECTIONS = {
  SCOUTS: 'scouts',
  STAFF: 'staff',
  ACTIVITIES: 'activities',
  PRESENCES: 'presences',
  AUDIT_LOGS: 'audit-logs'
};

/**
 * Chiavi localStorage
 * @type {object}
 */
export const STORAGE_KEYS = {
  STATE: 'presenziario-state',
  PATTUGLIE: 'pattuglie',
  PREFERENCES: 'app-preferences'
};

/**
 * Versioning
 * @type {object}
 */
export const VERSION = {
  APP: 'v3',
  API: '1.0.0'
};

