/**
 * Utility Functions
 * @module utils/utils
 */

/**
 * Escapes HTML characters to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Converts a Firestore Timestamp or Date string to a JS Date object
 * @param {Object|string} value - The value to convert
 * @returns {Date} The JS Date object
 */
export function toJsDate(value) {
    if (value instanceof Date) return value;
    if (value && typeof value.toDate === 'function') {
        return value.toDate();
    }
    return new Date(value);
}

/**
 * Formats a date relative to now (e.g., "5 min ago")
 * @param {Date} date - The date to format
 * @returns {string} The formatted string
 */
export function formatTimeAgo(date) {
    if (!date) return '';
    const min = Math.floor((new Date() - date) / 60000);
    if (min < 60) return `${min} min fa`;
    if (min < 1440) return `${Math.floor(min / 60)} h fa`;
    return date.toLocaleDateString();
}

/**
 * Debounces a function with rate limiting
 * @param {string} key - Unique key for the rate limit
 * @param {Function} fn - Function to execute
 * @param {number} ms - Delay in milliseconds
 */
export function debounceWithRateLimit(key, fn, ms) {
    // Simple simplified version for now, real rate limiting logic relies on state
    setTimeout(fn, ms);
}
