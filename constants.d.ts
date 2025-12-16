/**
 * Constants and Configuration
 * @module utils/constants
 */
export declare const APP_VERSION = "v3";
export declare const THEME: {
    readonly LIGHT: "light";
    readonly DARK: "dark";
    readonly SYSTEM: "system";
};
export type Theme = typeof THEME[keyof typeof THEME];
export declare const COLLECTIONS: {
    readonly SCOUTS: "scouts";
    readonly STAFF: "staff";
    readonly ACTIVITIES: "activities";
    readonly PRESENCES: "presences";
    readonly COMMENTS: "comments";
    readonly USER_PREFERENCES: "user-preferences";
    readonly FCM_TOKENS: "fcm-tokens";
    readonly NOTIFICATIONS: "in-app-notifications";
    readonly AUDIT_LOGS: "audit-logs";
};
export declare const NOTIFICATION_TYPES: {
    readonly INFO: "info";
    readonly WARNING: "warning";
    readonly ERROR: "error";
    readonly SUCCESS: "success";
    readonly IMPORTANT: "important";
    readonly ACTIVITY: "activity";
};
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export declare const DEFAULT_PREFERENCES: {
    theme: "system";
    notifications: {
        enabled: boolean;
        activityReminders: boolean;
        paymentReminders: boolean;
        importantChanges: boolean;
        birthdayReminders: boolean;
    };
};
export type AppPreferences = typeof DEFAULT_PREFERENCES;
export declare const FCM_VAPID_Key = "BBKeE0VbFbvT_BWU78Ddtbt1EhP6-vHYTI_WwQsrBOiki5RvsyBTwkI4X6HFEW0GaVf018JNosFE1eVdb6b62N0";
export declare const VALIDATION_RULES: {
    EMAIL: RegExp;
};
//# sourceMappingURL=constants.d.ts.map