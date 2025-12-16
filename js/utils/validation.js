/**
 * Validation Logic
 * @module utils/validation
 */

import { VALIDATION_RULES } from './constants.js';

/**
 * Sanitizes input string to remove potentially dangerous characters
 * @param {string} input - The input string
 * @returns {string} The sanitized string
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    // Remove scripts and potentially malicious tags basically
    return input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<[^>]+>/g, "") // Strip all tags for inputs
        .trim();
}

/**
 * Validates a single field value against a rule
 * @param {any} value - The value to validate
 * @param {Object} rule - The validation rule
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateFieldValue(value, rule) {
    if (rule.required && (value === null || value === undefined || (typeof value === 'string' && value.trim() === ''))) {
        return { valid: false, error: rule.requiredMessage || 'Campo obbligatorio' };
    }

    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return { valid: true, error: '' };
    }

    if (rule.type === 'email') {
        if (!VALIDATION_RULES.EMAIL.test(value.trim())) {
            return { valid: false, error: 'Email non valida' };
        }
    }

    if (rule.minLength && String(value).length < rule.minLength) {
        return { valid: false, error: `Minimo ${rule.minLength} caratteri` };
    }

    if (rule.maxLength && String(value).length > rule.maxLength) {
        return { valid: false, error: `Massimo ${rule.maxLength} caratteri` };
    }

    if (rule.pattern && !rule.pattern.test(value)) {
        return { valid: false, error: rule.patternMessage || 'Formato non valido' };
    }

    if (rule.validator && typeof rule.validator === 'function') {
        const result = rule.validator(value);
        if (typeof result === 'string') return { valid: false, error: result };
        if (result === false) return { valid: false, error: rule.customMessage || 'Valore non valido' };
    }

    return { valid: true, error: '' };
}

/**
 * Validates a form against a set of rules
 * @param {HTMLElement} form - The form element
 * @param {Object} rules - Map of field IDs to validation rules
 * @returns {Object} { valid: boolean, errors: Object }
 */
export function validateForm(form, rules) {
    if (!form || !rules) return { valid: true, errors: {} };
    const errors = {};
    let allValid = true;

    Object.keys(rules).forEach(fieldId => {
        const input = form.querySelector(`#${fieldId}`);
        if (!input) return;

        // Sanitize value in place if needed (optional strategy, but safer to sanitize on use)
        // const sanitizedVal = sanitizeInput(input.value); 

        const value = input.value;
        const rule = rules[fieldId];
        const validation = validateFieldValue(value, rule);

        const fieldGroup = input.closest('.field-group') || input.parentElement;
        let errorEl = fieldGroup ? fieldGroup.querySelector('.field-error') : null;

        if (!errorEl && fieldGroup) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            input.parentElement.appendChild(errorEl);
        }

        if (!validation.valid) {
            errors[fieldId] = validation.error;
            allValid = false;
            input.classList.add('invalid');
            input.classList.remove('valid');
            fieldGroup?.classList.add('has-error');
            fieldGroup?.classList.remove('is-valid');
            if (errorEl) errorEl.textContent = validation.error;
        } else {
            input.classList.add('valid');
            input.classList.remove('invalid');
            fieldGroup?.classList.add('is-valid');
            fieldGroup?.classList.remove('has-error');
            if (errorEl) errorEl.textContent = '';
        }
    });

    /**
     * Sets up real-time validation for a form
     * @param {HTMLElement} form - The form element
     * @param {Object} rules - Validation rules map
     */
    export function setupFormValidation(form, rules) {
        if (!form || !rules) return;
        Object.keys(rules).forEach(fieldId => {
            const input = form.querySelector(`#${fieldId}`);
            if (!input) return;
            const rule = rules[fieldId];
            const fieldGroup = input.closest('.field-group') || input.parentElement;
            let errorEl = fieldGroup ? fieldGroup.querySelector('.field-error') : null;

            if (!errorEl && fieldGroup) {
                errorEl = document.createElement('span');
                errorEl.className = 'field-error';
                input.parentElement.appendChild(errorEl);
            }

            const validateField = () => {
                const value = input.value; // Sanitization happens on usage or server-side? Better to use raw value for validation check.
                const validation = validateFieldValue(value, rule);

                input.classList.remove('valid', 'invalid');
                fieldGroup?.classList.remove('has-error', 'is-valid');

                if (validation.valid) {
                    input.classList.add('valid');
                    fieldGroup?.classList.add('is-valid');
                    if (errorEl) errorEl.textContent = '';
                } else {
                    input.classList.add('invalid');
                    fieldGroup?.classList.add('has-error');
                    if (errorEl) errorEl.textContent = validation.error || '';
                }
                return validation.valid;
            };

            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(validateField, 300);
            });
            input.addEventListener('blur', validateField);
            // Initial check if value exists
            if (input.value) setTimeout(validateField, 100);
        });
    }
