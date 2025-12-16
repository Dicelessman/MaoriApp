/**
 * Type definitions per l'applicazione Maori App
 * Definizioni comuni per tipi dati utilizzati nell'applicazione
 */

// ============== Firestore Types ==============

/**
 * Timestamp Firestore (può essere Date o Timestamp Firestore)
 */
export type FirestoreTimestamp = Date | { toDate: () => Date };

// ============== Entity Types ==============

/**
 * Esploratore/Scout
 */
export interface Scout {
  id: string;
  nome: string;
  cognome: string;
  sesso?: string;
  dataNascita?: FirestoreTimestamp | string;
  pv_pattuglia?: string;
  anno_scout?: string;
  cp_vcp?: string;
  passo?: string;
  [key: string]: unknown;
}

/**
 * Membro Staff
 */
export interface Staff {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo?: string;
  [key: string]: unknown;
}

/**
 * Attività
 */
export interface Activity {
  id: string;
  tipo: 'Riunione' | 'Attività lunga' | 'Uscita' | 'Campo';
  data: FirestoreTimestamp | string;
  descrizione: string;
  costo?: number | string;
  [key: string]: unknown;
}

/**
 * Presenza
 */
export interface Presence {
  id?: string;
  esploratoreId: string;
  attivitaId: string;
  stato?: 'Presente' | 'Assente' | 'NR' | 'X';
  pagato?: boolean;
  tipoPagamento?: 'Contanti' | 'Satispay' | 'Bonifico' | string | null;
  [key: string]: unknown;
}

/**
 * Commento
 */
export interface Comment {
  id: string;
  targetType: 'activity' | 'presence' | 'scout';
  targetId: string;
  userId: string;
  userEmail: string;
  text: string;
  timestamp: FirestoreTimestamp;
  editedAt?: FirestoreTimestamp;
}

/**
 * Template Attività
 */
export interface ActivityTemplate {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  tipo: 'Riunione' | 'Attività lunga' | 'Uscita' | 'Campo';
  descrizione: string;
  costo: number;
  createdAt: FirestoreTimestamp;
}

/**
 * Notifica In-App
 */
export interface InAppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: FirestoreTimestamp;
  url?: string;
  notificationType?: string;
}

// ============== State Types ==============

/**
 * Stato completo dell'applicazione
 */
export interface AppState {
  scouts: Scout[];
  staff: Staff[];
  activities: Activity[];
  presences: Presence[];
}

// ============== Validation Types ==============

/**
 * Risultato validazione
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: unknown;
}

/**
 * Risultato validazione email
 */
export interface EmailValidationResult {
  valid: boolean;
  value: string;
  error: string | null;
}

// ============== Preference Types ==============

/**
 * Preferenze utente
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  defaultView?: string | null;
  activityOrder?: string | null;
  savedFilters?: Record<string, unknown>;
  notifications?: {
    enabled: boolean;
    activityReminders?: boolean;
    paymentReminders?: boolean;
    importantChanges?: boolean;
    birthdayReminders?: boolean;
  };
  shortcuts?: Record<string, KeyboardShortcut>;
  shortcutsEnabled?: boolean;
}

/**
 * Configurazione keyboard shortcut
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  enabled: boolean;
}

// ============== Export/Import Types ==============

/**
 * Dati per export completo
 */
export interface ExportData {
  version: string;
  exportDate: string;
  data: AppState;
}

/**
 * Risultato import
 */
export interface ImportResult {
  success: boolean;
  imported: {
    scouts: number;
    staff: number;
    activities: number;
    presences: number;
  };
  errors: string[];
  warnings: string[];
}

// ============== UI Types ==============

/**
 * Opzioni toast notification
 */
export interface ToastOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * Opzioni modale conferma
 */
export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ============== Utility Types ==============

/**
 * Helper per rendere alcuni campi opzionali
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Helper per rendere alcuni campi required
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

