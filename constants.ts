/**
 * Constants - Configurazioni e costanti dell'applicazione
 * @module constants
 */

/**
 * Stati presenza validi
 */
export const PRESENCE_STATES = ['Presente', 'Assente', 'NR', 'X'] as const;
export type PresenceState = typeof PRESENCE_STATES[number];

/**
 * Tipi pagamento validi
 */
export const PAYMENT_TYPES = ['Contanti', 'Satispay', 'Bonifico'] as const;
export type PaymentType = typeof PAYMENT_TYPES[number];

/**
 * Tipi attività validi
 */
export const ACTIVITY_TYPES = ['Riunione', 'Attività lunga', 'Uscita', 'Campo'] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

/**
 * Limiti validazione
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
} as const;

/**
 * Configurazione cache
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minuti
  STALE_WHILE_REVALIDATE: true
} as const;

/**
 * Configurazione rendering batch
 */
export const RENDER_CONFIG = {
  DEFAULT_BATCH_SIZE: 100,
  LARGE_LIST_THRESHOLD: 200,
  DEBOUNCE_DELAY: 300
} as const;

/**
 * Configurazione toast
 */
export const TOAST_CONFIG = {
  DEFAULT_DURATION: 2500,
  SUCCESS_DURATION: 2000,
  ERROR_DURATION: 4000,
  WARNING_DURATION: 3000
} as const;

/**
 * Configurazione date
 */
export const DATE_CONFIG = {
  LOCALE: 'it-IT',
  DEFAULT_FORMAT: { day: '2-digit' as const, month: '2-digit' as const, year: 'numeric' as const },
  LONG_FORMAT: { day: '2-digit' as const, month: 'long' as const, year: 'numeric' as const }
} as const;

/**
 * Colori tema
 */
export const THEME_COLORS = {
  PRIMARY: '#16a34a',
  PRIMARY_STRONG: '#15803d',
  ERROR: '#dc2626',
  WARNING: '#eab308',
  INFO: '#374151',
  SUCCESS: '#16a34a'
} as const;

/**
 * Nomi collezioni Firestore
 */
export const FIRESTORE_COLLECTIONS = {
  SCOUTS: 'scouts',
  STAFF: 'staff',
  ACTIVITIES: 'activities',
  PRESENCES: 'presences',
  AUDIT_LOGS: 'audit-logs',
  COMMENTS: 'comments',
  ACTIVITY_TEMPLATES: 'activity-templates',
  IN_APP_NOTIFICATIONS: 'in-app-notifications'
} as const;

/**
 * Chiavi localStorage
 */
export const STORAGE_KEYS = {
  STATE: 'presenziario-state',
  PATTUGLIE: 'pattuglie',
  PREFERENCES: 'app-preferences',
  THEME: 'app-theme',
  CALENDAR_VIEW_MODE: 'calendarViewMode',
  CALENDAR_CURRENT_MONTH: 'calendarCurrentMonth'
} as const;

/**
 * Versioning
 */
export const VERSION = {
  APP: 'v3',
  API: '1.0.0'
} as const;

