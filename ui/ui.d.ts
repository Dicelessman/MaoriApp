/**
 * UI Controller - Gestore interfaccia utente
 * @module ui/ui
 */
import { escapeHtml, toJsDate, formatTimeAgo } from '../utils/utils.js';
import { setupFormValidation, validateForm, validateFieldValue } from '../utils/validation.js';
export declare const UI: {
    appVersion: string;
    selectedStaffId: null;
    staffToDeleteId: null;
    scoutToDeleteId: null;
    activityToDeleteId: null;
    state: {
        scouts: never[];
        staff: never[];
        activities: never[];
        presences: never[];
    };
    currentUser: null;
    qs(selector: any): any;
    qsa(selector: any): NodeListOf<any>;
    showToast(message: any, opts?: {}): void;
    showLoadingOverlay(message?: string): void;
    hideLoadingOverlay(): void;
    setButtonLoading(button: any, isLoading: any, originalText?: null): void;
    createSkeletonLoader(type: any, count?: number, options?: {}): string;
    renderInBatches({ container, items, batchSize, renderItem, onComplete }: {
        container: any;
        items: any;
        batchSize?: number | undefined;
        renderItem: any;
        onComplete: any;
    }): void;
    init(): Promise<void>;
    loadSharedComponents(): Promise<void>;
    setupEventListeners(): void;
    showModal(id: any): void;
    closeModal(id: any): void;
    showConfirmModal({ title, message, confirmText, cancelText, onConfirm, onCancel }: {
        title: any;
        message: any;
        confirmText?: string | undefined;
        cancelText?: string | undefined;
        onConfirm: any;
        onCancel: any;
    }): void;
    setupModalEventListeners(): void;
    getSystemTheme(): "light" | "dark";
    getCurrentTheme(): "light" | "dark";
    applyTheme(theme: any): void;
    saveTheme(theme: any): void;
    toggleTheme(): void;
    setupTheme(): void;
    loadUserPreferences(): any;
    saveUserPreferences(preferences: any): Promise<void>;
    syncUserPreferences(): Promise<void>;
    loadComments(targetType: any, targetId: any): Promise<any>;
    addComment(targetType: any, targetId: any, text: any): Promise<void>;
    renderCommentsList(comments: any, container: any): void;
    setupCommentsForTarget(targetType: any, targetId: any, selectors: any): Promise<void>;
    initializeFCM(): Promise<void>;
    saveFCMToken(token: any): Promise<void>;
    handleForegroundNotification(payload: any): Promise<void>;
    checkActivityReminders(): Promise<void>;
    checkBirthdayReminders(): Promise<void>;
    checkPaymentReminders(): Promise<void>;
    notifyImportantChange({ type, title, body, url }: {
        type: any;
        title: any;
        body: any;
        url: any;
    }): void;
    saveInAppNotification(n: any): Promise<void>;
    loadInAppNotifications(limitCount?: number): Promise<any>;
    markAllNotificationsAsRead(): Promise<void>;
    updateNotificationsBadge(): Promise<void>;
    renderNotificationsList(): Promise<void>;
    markNotificationAsRead(id: any): Promise<void>;
    setupInAppNotifications(): void;
    escapeHtml: typeof escapeHtml;
    toJsDate: typeof toJsDate;
    formatTimeAgo: typeof formatTimeAgo;
    setupFormValidation: typeof setupFormValidation;
    validateForm: typeof validateForm;
    validateFieldValue: typeof validateFieldValue;
    debounceWithRateLimit(key: string, fn: () => void, delay: number): void;
    rebuildPresenceIndex(): void;
    getDedupedPresences(): unknown[];
    countPresencesForScout(id: any): number;
    countPresencesForActivity(id: any): number;
    checkDuplicateScout(n: any, c: any, xId: any): boolean;
    checkDuplicateStaffEmail(e: any, xId: any): boolean;
    setupInstallPrompt(): void;
    setupKeyboardShortcuts(): void;
    exportAllData(): {
        version: string;
        exportDate: string;
        data: {
            scouts: never[];
            staff: never[];
            activities: never[];
            presences: never[];
        };
    };
    downloadJSONExport(): void;
    setupSwipeDelete(container: any, onDelete: any, itemSelector?: string, itemIdAttr?: string): void;
    setupLongPress(elements: any, handler: any, duration?: number): void;
    showContextMenu(target: any, actions: any): void;
    setupPullToRefresh(container: any, onRefresh: any): void;
    logNetworkInfo(): void;
    runConnectivityProbe(): void;
    updateConnectionStatus(online: any): void;
    renderCurrentPage(): void;
    renderStaffSelectionList(): void;
    selectStaff(id: any): void;
    checkRateLimit(key: any): boolean;
};
//# sourceMappingURL=ui.d.ts.map