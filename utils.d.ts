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
export declare function escapeHtml(str: string | null | undefined): string;
/**
 * Converts a Firestore Timestamp or Date string to a JS Date object
 * @param value - The value to convert
 * @returns The JS Date object
 */
export declare function toJsDate(value: any): Date;
/**
 * Formats a date relative to now (e.g., "5 min ago")
 * @param date - The date to format
 * @returns The formatted string
 */
export declare function formatTimeAgo(date: Date | null | undefined): string;
/**
 * Debounces a function with rate limiting
 * @param key - Unique key for the rate limit
 * @param fn - Function to execute
 * @param delay - Delay in milliseconds
 */
export declare function debounceWithRateLimit(key: string, fn: () => void, delay: number): void;
//# sourceMappingURL=utils.d.ts.map