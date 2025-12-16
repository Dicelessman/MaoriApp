/**
 * Utility Functions
 * @module utils/utils
 */
/**
 * Escapes HTML characters to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
/**
 * Escapes HTML characters to prevent XSS
 * @param str - The string to escape
 * @returns The escaped string
 */
export function escapeHtml(str) {
    if (str == null)
        return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
/**
 * Converts a Firestore Timestamp or Date string to a JS Date object
 * @param value - The value to convert
 * @returns The JS Date object
 */
export function toJsDate(value) {
    if (value instanceof Date)
        return value;
    if (value && typeof value.toDate === 'function') {
        return value.toDate();
    }
    return new Date(value);
}
/**
 * Formats a date relative to now (e.g., "5 min ago")
 * @param date - The date to format
 * @returns The formatted string
 */
export function formatTimeAgo(date) {
    if (!date)
        return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 60)
        return `${min} min fa`;
    if (min < 1440)
        return `${Math.floor(min / 60)} h fa`;
    return date.toLocaleDateString();
}
const debounceTimers = {};
/**
 * Debounces a function with rate limiting
 * @param key - Unique key for the rate limit
 * @param fn - Function to execute
 * @param delay - Delay in milliseconds
 */
export function debounceWithRateLimit(key, fn, delay) {
    if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
    }
    debounceTimers[key] = window.setTimeout(() => {
        delete debounceTimers[key];
        fn();
    }, delay);
}
//# sourceMappingURL=utils.js.map