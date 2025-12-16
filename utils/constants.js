/**
 * Constants and Configuration
 * @module utils/constants
 */
export const APP_VERSION = 'v3';
// Defines the theme options
export const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};
export const COLLECTIONS = {
    SCOUTS: 'scouts',
    STAFF: 'staff',
    ACTIVITIES: 'activities',
    PRESENCES: 'presences',
    COMMENTS: 'comments',
    USER_PREFERENCES: 'user-preferences',
    FCM_TOKENS: 'fcm-tokens',
    NOTIFICATIONS: 'in-app-notifications',
    AUDIT_LOGS: 'audit-logs'
};
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
    IMPORTANT: 'important',
    ACTIVITY: 'activity'
};
export const DEFAULT_PREFERENCES = {
    theme: THEME.SYSTEM,
    notifications: {
        enabled: false,
        activityReminders: true,
        paymentReminders: true,
        importantChanges: true,
        birthdayReminders: true
    }
};
export const FCM_VAPID_Key = 'BBKeE0VbFbvT_BWU78Ddtbt1EhP6-vHYTI_WwQsrBOiki5RvsyBTwkI4X6HFEW0GaVf018JNosFE1eVdb6b62N0';
export const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // Aggiungere altre regex comuni qui
};
//# sourceMappingURL=constants.js.map