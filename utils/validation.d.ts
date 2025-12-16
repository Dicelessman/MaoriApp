/**
 * Validation Logic
 * @module utils/validation
 */
export interface ValidationResult {
    valid: boolean;
    error: string;
}
export interface ValidationRule {
    required?: boolean;
    requiredMessage?: string;
    type?: 'email' | 'text' | 'number' | 'date';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    validator?: (value: any) => boolean | string;
    customMessage?: string;
}
/**
 * Sanitizes input string to remove potentially dangerous characters
 * @param input - The input string
 * @returns The sanitized string
 */
export declare function sanitizeInput(input: any): any;
/**
 * Validates a single field value against a rule
 * @param value - The value to validate
 * @param rule - The validation rule
 * @returns { valid: boolean, error: string }
 */
export declare function validateFieldValue(value: any, rule: ValidationRule): ValidationResult;
export interface FormValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}
/**
 * Validates a form against a set of rules
 * @param form - The form element
 * @param rules - Map of field IDs to validation rules
 * @returns { valid: boolean, errors: Object }
 */
export declare function validateForm(form: HTMLElement | null, rules: Record<string, ValidationRule>): FormValidationResult;
/**
 * Sets up real-time validation for a form
 * @param form - The form element
 * @param rules - Validation rules map
 */
export declare function setupFormValidation(form: HTMLElement | null, rules: Record<string, ValidationRule>): void;
//# sourceMappingURL=validation.d.ts.map