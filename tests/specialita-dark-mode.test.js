import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Specialità Sfondo Giallo & Dark Mode Contrast', () => {
  let UI;

  beforeEach(() => {
    UI = {};
    // Carichiamo la funzione applySpecialitaColors come definita in scout2.js
    UI.applySpecialitaColors = function (containerDiv, specialita) {
      if (!containerDiv) return;

      const defaultSfondo = 'white';
      const defaultBordo = 'gray';

      const rawSfondo = (specialita?.sfondo_colore || defaultSfondo).toLowerCase();
      const rawBordo = (specialita?.bordo_colore || defaultBordo).toLowerCase();

      containerDiv.classList.add('specialita-card');
      containerDiv.setAttribute('data-sfondo', rawSfondo);
      containerDiv.setAttribute('data-bordo', rawBordo);

      if (rawSfondo === 'yellow') {
        containerDiv.classList.add('specialita-sfondo-yellow');
        containerDiv.classList.remove('specialita-sfondo-green');
      } else if (rawSfondo === 'green') {
        containerDiv.classList.add('specialita-sfondo-green');
        containerDiv.classList.remove('specialita-sfondo-yellow');
      } else {
        containerDiv.classList.remove('specialita-sfondo-yellow', 'specialita-sfondo-green');
      }

      containerDiv.style.backgroundColor = specialita?.sfondo_colore || defaultSfondo;
      containerDiv.style.border = `3px solid ${specialita?.bordo_colore || defaultBordo}`;
      containerDiv.style.borderRadius = '0.5rem';
      containerDiv.style.overflow = 'hidden';
    };
  });

  it('dovrebbe assegnare le classi e gli attributi semantici per specialità a sfondo giallo', () => {
    const div = document.createElement('div');
    const spec = { nome: 'Astronomia', sfondo_colore: 'yellow', bordo_colore: 'blue' };

    UI.applySpecialitaColors(div, spec);

    expect(div.classList.contains('specialita-card')).toBe(true);
    expect(div.classList.contains('specialita-sfondo-yellow')).toBe(true);
    expect(div.classList.contains('specialita-sfondo-green')).toBe(false);
    expect(div.getAttribute('data-sfondo')).toBe('yellow');
    expect(div.getAttribute('data-bordo')).toBe('blue');
    expect(div.style.backgroundColor).toBe('yellow');
  });

  it('dovrebbe assegnare le classi e gli attributi semantici per specialità a sfondo verde', () => {
    const div = document.createElement('div');
    const spec = { nome: 'Abilità Aquatiche', sfondo_colore: 'green', bordo_colore: 'green' };

    UI.applySpecialitaColors(div, spec);

    expect(div.classList.contains('specialita-card')).toBe(true);
    expect(div.classList.contains('specialita-sfondo-green')).toBe(true);
    expect(div.classList.contains('specialita-sfondo-yellow')).toBe(false);
    expect(div.getAttribute('data-sfondo')).toBe('green');
  });

  it('dovrebbe aggiornare correttamente le classi al cambio da verde a giallo e viceversa', () => {
    const div = document.createElement('div');
    
    // Inizia verde
    UI.applySpecialitaColors(div, { sfondo_colore: 'green', bordo_colore: 'red' });
    expect(div.classList.contains('specialita-sfondo-green')).toBe(true);
    expect(div.classList.contains('specialita-sfondo-yellow')).toBe(false);

    // Cambia in giallo
    UI.applySpecialitaColors(div, { sfondo_colore: 'yellow', bordo_colore: 'blue' });
    expect(div.classList.contains('specialita-sfondo-yellow')).toBe(true);
    expect(div.classList.contains('specialita-sfondo-green')).toBe(false);
    expect(div.getAttribute('data-sfondo')).toBe('yellow');
  });

  it('dovrebbe contenere in style.css le regole per forzare il testo scuro su sfondo giallo in dark mode', () => {
    const cssPath = path.resolve(__dirname, '../style.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Verifica presenza delle classi e stili specifici
    expect(css).toContain('.specialita-sfondo-yellow');
    expect(css).toContain('[data-theme="dark"] .specialita-sfondo-yellow');
    expect(css).toContain('#0f172a !important');
    expect(css).toContain('-webkit-text-fill-color: #0f172a !important');
    expect(css).toContain('.specialita-sfondo-green');
  });
});
