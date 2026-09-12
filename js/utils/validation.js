/**
 * Validation Logic
 * @module utils/validation
 */
import { VALIDATION_RULES } from './constants.js';
/**
 * Sanitizes input string to remove potentially dangerous characters
 * @param input - The input string
 * @returns The sanitized string
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string')
        return input;
    // Remove scripts and potentially malicious tags basically
    return input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/<[^>]+>/g, "") // Strip all tags for inputs
        .trim();
}
/**
 * Validates a single field value against a rule
 * @param value - The value to validate
 * @param rule - The validation rule
 * @returns { valid: boolean, error: string }
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
        if (typeof result === 'string')
            return { valid: false, error: result };
        if (result === false)
            return { valid: false, error: rule.customMessage || 'Valore non valido' };
    }
    return { valid: true, error: '' };
}
/**
 * Validates a form against a set of rules
 * @param form - The form element
 * @param rules - Map of field IDs to validation rules
 * @returns { valid: boolean, errors: Object }
 */
export function validateForm(form, rules) {
    if (!form || !rules)
        return { valid: true, errors: {} };
    const errors = {};
    let allValid = true;
    Object.keys(rules).forEach(fieldId => {
        const input = form.querySelector(`#${fieldId}`);
        if (!input)
            return;
        const value = input.value;
        const rule = rules[fieldId];
        const validation = validateFieldValue(value, rule);
        const fieldGroup = input.closest('.field-group') || input.parentElement;
        let errorEl = fieldGroup ? fieldGroup.querySelector('.field-error') : null;
        if (!errorEl && fieldGroup) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            input.parentElement?.appendChild(errorEl);
        }
        if (!validation.valid) {
            errors[fieldId] = validation.error;
            allValid = false;
            input.classList.add('invalid');
            input.classList.remove('valid');
            fieldGroup?.classList.add('has-error');
            fieldGroup?.classList.remove('is-valid');
            if (errorEl)
                errorEl.textContent = validation.error;
        }
        else {
            input.classList.add('valid');
            input.classList.remove('invalid');
            fieldGroup?.classList.add('is-valid');
            fieldGroup?.classList.remove('has-error');
            if (errorEl)
                errorEl.textContent = '';
        }
    });
    return { valid: allValid, errors };
}
/**
 * Sets up real-time validation for a form
 * @param form - The form element
 * @param rules - Validation rules map
 */
export function setupFormValidation(form, rules) {
    if (!form || !rules)
        return;
    Object.keys(rules).forEach(fieldId => {
        const input = form.querySelector(`#${fieldId}`);
        if (!input)
            return;
        const rule = rules[fieldId];
        const fieldGroup = input.closest('.field-group') || input.parentElement;
        let errorEl = fieldGroup ? fieldGroup.querySelector('.field-error') : null;
        if (!errorEl && fieldGroup) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            input.parentElement?.appendChild(errorEl);
        }
        const validateField = () => {
            const value = input.value;
            const validation = validateFieldValue(value, rule);
            input.classList.remove('valid', 'invalid');
            fieldGroup?.classList.remove('has-error', 'is-valid');
            if (validation.valid) {
                input.classList.add('valid');
                fieldGroup?.classList.add('is-valid');
                if (errorEl)
                    errorEl.textContent = '';
            }
            else {
                input.classList.add('invalid');
                fieldGroup?.classList.add('has-error');
                if (errorEl)
                    errorEl.textContent = validation.error || '';
            }
            return validation.valid;
        };
        let timeout;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = window.setTimeout(validateField, 300);
        });
        input.addEventListener('blur', validateField);
        // Initial check if value exists
        if (input.value)
            setTimeout(validateField, 100);
    });
}

/**
 * Checks data integrity across scouts, activities, presences, and staff
 * @param {Object} state - Application state
 * @returns {Object} Integrity report with status and issues summary
 */
export function checkDataIntegrity(state) {
    if (!state) {
        return {
            isValid: true,
            summary: {
                totalIssues: 0,
                totalOrphanPresences: 0,
                orphanPresencesNoScout: [],
                orphanPresencesNoActivity: [],
                duplicateScouts: [],
                duplicateStaffEmails: [],
                invalidDateActivities: []
            }
        };
    }

    const scouts = state.scouts || [];
    const activities = state.activities || [];
    const presences = state.presences || [];
    const staff = state.staff || [];

    const scoutIdSet = new Set(scouts.map(s => String(s.id)));
    const activityIdSet = new Set(activities.map(a => String(a.id)));

    // 1. Orphan Presences
    const orphanPresencesNoScout = [];
    const orphanPresencesNoActivity = [];

    presences.forEach(p => {
        const hasScout = scoutIdSet.has(String(p.esploratoreId));
        const hasActivity = activityIdSet.has(String(p.attivitaId));

        if (!hasScout) {
            orphanPresencesNoScout.push(p);
        }
        if (!hasActivity) {
            orphanPresencesNoActivity.push(p);
        }
    });

    // 2. Duplicate Scouts (same nome + cognome lowercase)
    const duplicateScouts = [];
    const scoutMap = new Map();
    scouts.forEach(s => {
        const key = `${(s.nome || '').trim().toLowerCase()}_${(s.cognome || '').trim().toLowerCase()}`;
        if (key !== '_') {
            if (!scoutMap.has(key)) {
                scoutMap.set(key, [s]);
            } else {
                scoutMap.get(key).push(s);
            }
        }
    });
    for (const [key, group] of scoutMap.entries()) {
        if (group.length > 1) {
            duplicateScouts.push({
                key,
                count: group.length,
                scouts: group.map(s => ({ id: s.id, nome: s.nome, cognome: s.cognome, pv_pattuglia: s.pv_pattuglia }))
            });
        }
    }

    // 3. Duplicate Staff Emails
    const duplicateStaffEmails = [];
    const staffMap = new Map();
    staff.forEach(m => {
        const email = (m.email || '').trim().toLowerCase();
        if (email) {
            if (!staffMap.has(email)) {
                staffMap.set(email, [m]);
            } else {
                staffMap.get(email).push(m);
            }
        }
    });
    for (const [email, group] of staffMap.entries()) {
        if (group.length > 1) {
            duplicateStaffEmails.push({
                email,
                count: group.length,
                staff: group.map(m => ({ id: m.id, nome: m.nome, cognome: m.cognome, email: m.email }))
            });
        }
    }

    // 4. Invalid Date Activities
    const invalidDateActivities = [];
    activities.forEach(a => {
        const d = a.data && typeof a.data.toDate === 'function' ? a.data.toDate() : (a.data ? new Date(a.data) : null);
        if (!d || isNaN(d.getTime())) {
            invalidDateActivities.push({
                id: a.id,
                descrizione: a.descrizione || 'Senza descrizione',
                tipo: a.tipo || 'Attività',
                data: a.data
            });
        }
    });

    const uniqueOrphanPresenceIds = new Set([
        ...orphanPresencesNoScout.map(p => p.id || `${p.esploratoreId}_${p.attivitaId}`),
        ...orphanPresencesNoActivity.map(p => p.id || `${p.esploratoreId}_${p.attivitaId}`)
    ]);

    const totalIssues = uniqueOrphanPresenceIds.size +
        duplicateScouts.length +
        duplicateStaffEmails.length +
        invalidDateActivities.length;

    return {
        isValid: totalIssues === 0,
        summary: {
            totalIssues,
            totalOrphanPresences: uniqueOrphanPresenceIds.size,
            orphanPresencesNoScout,
            orphanPresencesNoActivity,
            duplicateScouts,
            duplicateStaffEmails,
            invalidDateActivities
        }
    };
}
