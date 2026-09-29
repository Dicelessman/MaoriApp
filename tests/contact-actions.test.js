import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../js/core/firebase.js', () => ({
    db: {},
    auth: {},
    messaging: null,
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    updateDoc: vi.fn(),
    getDoc: vi.fn(),
    query: vi.fn(),
    limit: vi.fn(),
    startAfter: vi.fn(),
    orderBy: vi.fn(),
    where: vi.fn(),
    Timestamp: { now: () => new Date(), fromDate: (d) => d },
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    setPersistence: vi.fn(),
    browserLocalPersistence: {},
    getToken: vi.fn(),
    onMessage: vi.fn()
}));

import { formatTelUri, formatWhatsAppUri, formatMailtoUri } from '../js/utils/utils.js';
import { UI } from '../js/ui/ui.js';

describe('Contact Actions Utility & UI Integration', () => {
    describe('formatTelUri', () => {
        it('dovrebbe formattare correttamente un numero telefonico con spazi o trattini', () => {
            expect(formatTelUri('340 123 4567')).toBe('3401234567');
            expect(formatTelUri('06-1234567')).toBe('061234567');
            expect(formatTelUri('(06) 123.456')).toBe('06123456');
        });

        it('dovrebbe preservare il prefisso internazionale con il +', () => {
            expect(formatTelUri('+39 340 1234567')).toBe('+393401234567');
            expect(formatTelUri('+44 20 7946 0958')).toBe('+442079460958');
        });

        it('dovrebbe restituire stringa vuota per input vuoto o solo spazi', () => {
            expect(formatTelUri('')).toBe('');
            expect(formatTelUri('   ')).toBe('');
            expect(formatTelUri(null)).toBe('');
            expect(formatTelUri(undefined)).toBe('');
        });
    });

    describe('formatWhatsAppUri', () => {
        it('dovrebbe aggiungere il prefisso 39 per numeri cellulari italiani a 10 cifre che iniziano per 3', () => {
            expect(formatWhatsAppUri('3401234567')).toBe('https://wa.me/393401234567');
            expect(formatWhatsAppUri('333 9876543')).toBe('https://wa.me/393339876543');
        });

        it('dovrebbe gestire numeri con prefisso internazionale +39 rimuovendo il +', () => {
            expect(formatWhatsAppUri('+39 340 1234567')).toBe('https://wa.me/393401234567');
        });

        it('dovrebbe codificare correttamente il testo predefinito se fornito', () => {
            const url = formatWhatsAppUri('3401234567', 'Ciao! Ti scriviamo dai capi.');
            expect(url).toContain('https://wa.me/393401234567?text=');
            expect(url).toContain(encodeURIComponent('Ciao! Ti scriviamo dai capi.'));
        });

        it('dovrebbe gestire input vuoti senza errori', () => {
            expect(formatWhatsAppUri('')).toBe('');
            expect(formatWhatsAppUri(null)).toBe('');
        });
    });

    describe('formatMailtoUri', () => {
        it('dovrebbe generare un link mailto valido', () => {
            expect(formatMailtoUri('mario.rossi@email.it')).toBe('mailto:mario.rossi%40email.it');
        });

        it('dovrebbe includere oggetto e corpo opzionali', () => {
            const url = formatMailtoUri('staff@scout.it', 'Info Reparto', 'Buongiorno capi');
            expect(url).toContain('mailto:staff%40scout.it?');
            expect(url).toContain('subject=Info+Reparto');
            expect(url).toContain('body=Buongiorno+capi');
        });

        it('dovrebbe restituire stringa vuota se l\'email è vuota', () => {
            expect(formatMailtoUri('')).toBe('');
            expect(formatMailtoUri('   ')).toBe('');
            expect(formatMailtoUri(null)).toBe('');
        });
    });

    describe('UI Contact Action Methods', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div class="contact-input-group">
                    <input id="testTel" type="tel" value="340 1234567" />
                    <button id="btnCall" data-contact-action="call" data-for="#testTel">Call</button>
                    <button id="btnWa" data-contact-action="whatsapp" data-for="#testTel">WhatsApp</button>
                </div>
                <div class="contact-input-group">
                    <input id="testEmail" type="email" value="scout@test.it" />
                    <button id="btnEmail" data-contact-action="email" data-for="#testEmail">Email</button>
                </div>
            `;
            UI.showToast = vi.fn();
            vi.spyOn(window, 'open').mockImplementation(() => null);
        });

        it('UI.callPhoneNumber dovrebbe mostrare toast di avviso se il campo è vuoto', () => {
            const res = UI.callPhoneNumber('');
            expect(res).toBe(false);
            expect(UI.showToast).toHaveBeenCalledWith(
                expect.stringContaining('numero telefonico'),
                expect.objectContaining({ type: 'warning' })
            );
        });

        it('UI.callPhoneNumber dovrebbe leggere il valore dal selettore o input element', () => {
            const res = UI.callPhoneNumber('#testTel');
            expect(res).toBe(true);
        });

        it('UI.openWhatsAppChat dovrebbe aprire WhatsApp in una nuova finestra con il numero formattato', () => {
            const res = UI.openWhatsAppChat('#testTel');
            expect(res).toBe(true);
            expect(window.open).toHaveBeenCalledWith(
                'https://wa.me/393401234567',
                '_blank',
                'noopener,noreferrer'
            );
        });

        it('UI.openWhatsAppChat dovrebbe mostrare toast di avviso se vuoto', () => {
            const res = UI.openWhatsAppChat('');
            expect(res).toBe(false);
            expect(UI.showToast).toHaveBeenCalledWith(
                expect.stringContaining('numero di telefono'),
                expect.objectContaining({ type: 'warning' })
            );
        });

        it('UI.sendEmail dovrebbe mostrare toast di avviso se il campo email è vuoto', () => {
            const res = UI.sendEmail('');
            expect(res).toBe(false);
            expect(UI.showToast).toHaveBeenCalledWith(
                expect.stringContaining('indirizzo email'),
                expect.objectContaining({ type: 'warning' })
            );
        });

        it('UI.sendEmail dovrebbe eseguire correttamente con un valore valido', () => {
            const res = UI.sendEmail('#testEmail');
            expect(res).toBe(true);
        });

        it('Event delegation per click su pulsanti con data-contact-action', () => {
            UI.initContactActionListeners();
            vi.spyOn(UI, 'callPhoneNumber');
            vi.spyOn(UI, 'openWhatsAppChat');
            vi.spyOn(UI, 'sendEmail');

            document.getElementById('btnCall').click();
            expect(UI.callPhoneNumber).toHaveBeenCalled();

            document.getElementById('btnWa').click();
            expect(UI.openWhatsAppChat).toHaveBeenCalled();

            document.getElementById('btnEmail').click();
            expect(UI.sendEmail).toHaveBeenCalled();
        });
    });
});
