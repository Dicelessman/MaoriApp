import { describe, it, expect } from 'vitest';

describe('Infrastructure Setup', () => {
    it('should run tests with Vitest', () => {
        expect(true).toBe(true);
    });

    it('should have DOM environment (jsdom)', () => {
        const element = document.createElement('div');
        element.innerHTML = 'Hello World';
        expect(element.textContent).toBe('Hello World');
        expect(window).toBeDefined();
        expect(document).toBeDefined();
    });
});
