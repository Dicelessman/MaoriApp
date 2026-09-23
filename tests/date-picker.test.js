import { describe, it, expect, beforeEach } from 'vitest';

describe('Universal Date Picker Widget', () => {
    beforeEach(async () => {
        document.body.innerHTML = '';
        // Load date-picker module
        await import('../date-picker.js');
    });

    it('should transform an input[type="date"] into a datepicker wrapper with manual text input and calendar button', () => {
        const input = document.createElement('input');
        input.type = 'date';
        input.id = 'testDate';
        input.value = '2026-11-20';
        document.body.appendChild(input);

        // Run scanner
        window.initDatePicker();

        const wrapper = input.parentElement;
        expect(wrapper.classList.contains('dp-wrapper')).toBe(true);

        const textInput = wrapper.querySelector('.dp-text-input');
        expect(textInput).not.toBeNull();
        expect(textInput.value).toBe('20/11/2026');

        const iconBtn = wrapper.querySelector('.dp-icon-btn');
        expect(iconBtn).not.toBeNull();
        expect(iconBtn.getAttribute('aria-label')).toBe('Apri calendario');
    });

    it('should update original date input when user types manually in Italian format', () => {
        const input = document.createElement('input');
        input.type = 'date';
        document.body.appendChild(input);

        window.initDatePicker();

        const wrapper = input.parentElement;
        const textInput = wrapper.querySelector('.dp-text-input');

        // Type dd/mm/yyyy
        textInput.value = '15/04/2026';
        textInput.dispatchEvent(new Event('blur'));

        expect(input.value).toBe('2026-04-15');
        expect(textInput.classList.contains('invalid')).toBe(false);
    });

    it('should mark textInput as invalid if an impossible date is manually entered', () => {
        const input = document.createElement('input');
        input.type = 'date';
        document.body.appendChild(input);

        window.initDatePicker();

        const wrapper = input.parentElement;
        const textInput = wrapper.querySelector('.dp-text-input');

        textInput.value = '99/99/9999';
        textInput.dispatchEvent(new Event('blur'));

        expect(textInput.classList.contains('invalid')).toBe(true);
    });

    it('should update textInput when original input.value is changed programmatically', () => {
        const input = document.createElement('input');
        input.type = 'date';
        document.body.appendChild(input);

        window.initDatePicker();

        const wrapper = input.parentElement;
        const textInput = wrapper.querySelector('.dp-text-input');

        input.value = '2026-12-25';
        expect(textInput.value).toBe('25/12/2026');
    });

    it('should transfer required attribute to textInput to avoid non-focusable form validation issues', () => {
        const input = document.createElement('input');
        input.type = 'date';
        input.required = true;
        document.body.appendChild(input);

        window.initDatePicker();

        const wrapper = input.parentElement;
        const textInput = wrapper.querySelector('.dp-text-input');

        expect(textInput.required).toBe(true);
        expect(input.required).toBe(false);
        expect(input.dataset.dpRequired).toBe('1');
    });

    it('should skip elements with data-no-datepicker', () => {
        const input = document.createElement('input');
        input.type = 'date';
        input.setAttribute('data-no-datepicker', '');
        document.body.appendChild(input);

        window.initDatePicker();

        expect(input.parentElement.classList.contains('dp-wrapper')).toBe(false);
        expect(document.querySelector('.dp-text-input')).toBeNull();
    });

    it('should sync on form reset', async () => {
        const form = document.createElement('form');
        const input = document.createElement('input');
        input.type = 'date';
        input.value = '2026-06-01';
        form.appendChild(input);
        document.body.appendChild(form);

        window.initDatePicker();

        const wrapper = input.parentElement;
        const textInput = wrapper.querySelector('.dp-text-input');
        expect(textInput.value).toBe('01/06/2026');

        input.value = '';
        form.reset();

        await new Promise(r => setTimeout(r, 10));
        expect(textInput.value).toBe(input.value ? '01/06/2026' : '');
    });
});
