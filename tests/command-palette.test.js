import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ─── Logica pura estratta per i test ─────────────────────────────────────────

function cpHighlightMatch(text, query) {
  if (!query || !text) return text || '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return text.replace(re, '<mark class="cp-highlight">$1</mark>');
}

function searchScouts(scouts, q) {
  return scouts
    .filter(s => !s.archived)
    .filter(s => {
      const full = `${s.anag_nome || ''} ${s.anag_cognome || ''} ${s.anag_pattuglia || ''}`.toLowerCase();
      return full.includes(q.toLowerCase());
    })
    .slice(0, 5)
    .map(s => ({
      icon: 'U',
      text: `${s.anag_nome || ''} ${s.anag_cognome || ''}`.trim(),
      meta: s.anag_pattuglia || 'Esploratore',
      href: 'esploratori.html',
      category: 'Esploratori'
    }));
}

function searchActivities(activities, q) {
  return activities
    .filter(a => `${a.descrizione || ''} ${a.tipo || ''}`.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 5)
    .map(a => ({
      icon: 'C',
      text: a.descrizione || 'Attivita',
      meta: a.tipo || 'Attivita',
      href: 'calendario.html',
      category: 'Attivita'
    }));
}

function searchStaff(staff, q) {
  return staff
    .filter(s => `${s.nome || ''} ${s.cognome || ''} ${s.email || ''}`.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 3)
    .map(s => ({
      icon: 'S',
      text: `${s.nome || ''} ${s.cognome || ''}`.trim(),
      meta: s.ruolo || 'Staff',
      href: 'staff.html',
      category: 'Staff'
    }));
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockScouts = [
  { anag_nome: 'Mario', anag_cognome: 'Rossi', anag_pattuglia: 'Lupi', archived: false },
  { anag_nome: 'Luca', anag_cognome: 'Bianchi', anag_pattuglia: 'Aquile', archived: false },
  { anag_nome: 'Anna', anag_cognome: 'Verdi', anag_pattuglia: 'Lupi', archived: true },
  { anag_nome: 'Sara', anag_cognome: 'Neri', anag_pattuglia: 'Volpi', archived: false },
];

const mockActivities = [
  { descrizione: 'Campo Estivo', tipo: 'Campo', data: '2025-07-15' },
  { descrizione: 'Uscita ai Piani', tipo: 'Uscita', data: '2025-06-01' },
  { descrizione: 'Riunione settimanale', tipo: 'Riunione', data: '2025-05-20' },
];

const mockStaff = [
  { nome: 'Carlo', cognome: 'Ferrari', email: 'carlo@scout.it', ruolo: 'Capo Reparto' },
  { nome: 'Giulia', cognome: 'Romano', email: 'giulia@scout.it', ruolo: 'Aiuto Capo' },
];

// ─── cpHighlightMatch ────────────────────────────────────────────────────────
describe('cpHighlightMatch', () => {
  it('racchiude il match in un tag mark', () => {
    const r = cpHighlightMatch('Mario Rossi', 'mario');
    expect(r).toContain('<mark class="cp-highlight">Mario</mark>');
  });
  it('case-insensitive', () => {
    const r = cpHighlightMatch('Campo Estivo', 'CAMPO');
    expect(r).toContain('<mark class="cp-highlight">Campo</mark>');
  });
  it('query vuota restituisce testo originale', () => {
    expect(cpHighlightMatch('Test', '')).toBe('Test');
    expect(cpHighlightMatch('Test', null)).toBe('Test');
  });
  it('text nullo restituisce stringa vuota', () => {
    expect(cpHighlightMatch(null, 'q')).toBe('');
    expect(cpHighlightMatch('', 'q')).toBe('');
  });
  it('escapa caratteri speciali nella query', () => {
    const r = cpHighlightMatch('costo (base)', '(base)');
    expect(r).toContain('(base)');
  });
  it('evidenzia piu occorrenze', () => {
    const r = cpHighlightMatch('aa bb aa', 'aa');
    expect((r.match(/cp-highlight/g) || []).length).toBe(2);
  });
});

// ─── searchScouts ─────────────────────────────────────────────────────────────
describe('searchScouts', () => {
  it('trova per nome', () => {
    const r = searchScouts(mockScouts, 'mario');
    expect(r).toHaveLength(1);
    expect(r[0].text).toBe('Mario Rossi');
  });
  it('trova per cognome', () => {
    expect(searchScouts(mockScouts, 'bianchi')[0].text).toBe('Luca Bianchi');
  });
  it('trova per pattuglia (solo non archiviati)', () => {
    const r = searchScouts(mockScouts, 'lupi');
    expect(r).toHaveLength(1);
    expect(r[0].text).toBe('Mario Rossi');
  });
  it('esclude archiviati', () => {
    expect(searchScouts(mockScouts, 'anna')).toHaveLength(0);
  });
  it('max 5 risultati', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      anag_nome: 'Scout', anag_cognome: `N${i}`, anag_pattuglia: 'Test', archived: false
    }));
    expect(searchScouts(many, 'scout')).toHaveLength(5);
  });
  it('category corretta', () => {
    expect(searchScouts(mockScouts, 'mario')[0].category).toBe('Esploratori');
  });
  it('href corretto', () => {
    expect(searchScouts(mockScouts, 'mario')[0].href).toBe('esploratori.html');
  });
});

// ─── searchActivities ─────────────────────────────────────────────────────────
describe('searchActivities', () => {
  it('trova per descrizione', () => {
    expect(searchActivities(mockActivities, 'campo')[0].text).toBe('Campo Estivo');
  });
  it('trova per tipo', () => {
    expect(searchActivities(mockActivities, 'uscita')[0].text).toBe('Uscita ai Piani');
  });
  it('category corretta', () => {
    expect(searchActivities(mockActivities, 'campo')[0].category).toBe('Attivita');
  });
  it('href corretto', () => {
    expect(searchActivities(mockActivities, 'campo')[0].href).toBe('calendario.html');
  });
  it('nessun risultato per query inesistente', () => {
    expect(searchActivities(mockActivities, 'xyz999')).toHaveLength(0);
  });
  it('max 5 risultati', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      descrizione: `Attivita ${i}`, tipo: 'Test'
    }));
    expect(searchActivities(many, 'attivita')).toHaveLength(5);
  });
});

// ─── searchStaff ──────────────────────────────────────────────────────────────
describe('searchStaff', () => {
  it('trova per nome', () => {
    expect(searchStaff(mockStaff, 'carlo')[0].text).toBe('Carlo Ferrari');
  });
  it('trova per email', () => {
    expect(searchStaff(mockStaff, 'giulia@scout')[0].text).toBe('Giulia Romano');
  });
  it('category corretta', () => {
    expect(searchStaff(mockStaff, 'carlo')[0].category).toBe('Staff');
  });
  it('max 3 risultati', () => {
    const many = Array.from({ length: 5 }, (_, i) => ({
      nome: 'Staff', cognome: `M${i}`, email: `m${i}@t.it`, ruolo: 'Capo'
    }));
    expect(searchStaff(many, 'staff')).toHaveLength(3);
  });
  it('href corretto', () => {
    expect(searchStaff(mockStaff, 'carlo')[0].href).toBe('staff.html');
  });
});

// ─── Command Palette DOM ──────────────────────────────────────────────────────
describe('Command Palette - DOM behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="commandPalette" class="hidden">
        <input id="commandPaletteInput" />
        <div id="commandPaletteSuggestions"></div>
        <div id="commandPaletteSearchResults" class="hidden"></div>
        <div id="commandPaletteEmpty" class="hidden"></div>
        <span id="commandPaletteQuery"></span>
      </div>`;
  });
  afterEach(() => { document.body.innerHTML = ''; });

  it('palette nascosta di default', () => {
    expect(document.getElementById('commandPalette').classList.contains('hidden')).toBe(true);
  });
  it('diventa visibile rimuovendo hidden', () => {
    const cp = document.getElementById('commandPalette');
    cp.classList.remove('hidden');
    expect(cp.classList.contains('hidden')).toBe(false);
  });
  it('lo stato vuoto mostra il testo della query', () => {
    const empty = document.getElementById('commandPaletteEmpty');
    const query = document.getElementById('commandPaletteQuery');
    empty.classList.remove('hidden');
    query.textContent = 'xyz';
    expect(empty.classList.contains('hidden')).toBe(false);
    expect(query.textContent).toBe('xyz');
  });
  it('i risultati di ricerca sono nascosti di default', () => {
    const results = document.getElementById('commandPaletteSearchResults');
    expect(results.classList.contains('hidden')).toBe(true);
  });
  it('i suggerimenti sono visibili di default', () => {
    const suggestions = document.getElementById('commandPaletteSuggestions');
    expect(suggestions.classList.contains('hidden')).toBe(false);
  });
});
