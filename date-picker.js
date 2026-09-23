/**
 * date-picker.js — Widget calendario universale
 * Si inizializza automaticamente su tutti gli input[type="date"].
 * Mantiene l'input originale nascosto e aggiornato.
 * Aggiungere l'attributo [data-no-datepicker] per escludere un campo.
 */
(function () {
  'use strict';

  /* ── Stili ────────────────────────────────────────────────── */
  const CSS = `
  .dp-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 100%;
  }
  .dp-text-input {
    flex: 1;
    min-width: 0;
    font-family: inherit;
    font-size: inherit;
    color: var(--text, #111827);
    background: var(--card-bg, #fff);
    border: 1px solid var(--border, #d1d5db);
    border-radius: var(--radius, 8px);
    padding: 0.45rem 2.4rem 0.45rem 0.65rem;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    box-sizing: border-box;
    width: 100%;
    letter-spacing: .5px;
  }
  .dp-text-input:focus {
    border-color: var(--brand, #16a34a);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand, #16a34a) 20%, transparent);
  }
  .dp-text-input.invalid {
    border-color: #ef4444;
  }
  .dp-icon-btn {
    position: absolute;
    right: 0.45rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 4px;
    display: flex;
    align-items: center;
    color: var(--muted, #6b7280);
    border-radius: 4px;
    transition: color .15s, background .15s;
    line-height: 1;
    font-size: 1rem;
  }
  .dp-icon-btn:hover {
    color: var(--brand, #16a34a);
    background: color-mix(in srgb, var(--brand, #16a34a) 10%, transparent);
  }
  .dp-popup {
    position: fixed;
    z-index: 9999;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0,0,0,.18);
    padding: 14px;
    min-width: 270px;
    user-select: none;
    animation: dpFadeIn .12s ease;
  }
  @keyframes dpFadeIn {
    from { opacity: 0; transform: translateY(-6px) scale(.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .dp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .dp-nav-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text, #111827);
    font-size: 1.15rem;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background .15s;
    line-height: 1;
  }
  .dp-nav-btn:hover {
    background: color-mix(in srgb, var(--brand, #16a34a) 12%, transparent);
    color: var(--brand, #16a34a);
  }
  .dp-month-year {
    font-weight: 700;
    font-size: .95rem;
    color: var(--text, #111827);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background .15s;
  }
  .dp-month-year:hover {
    background: var(--hover-overlay, rgba(0,0,0,.05));
  }
  .dp-month-year.no-click {
    cursor: default;
    pointer-events: none;
  }
  .dp-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .dp-day-name {
    text-align: center;
    font-size: .72rem;
    font-weight: 600;
    color: var(--muted, #6b7280);
    padding: 4px 0 6px;
    text-transform: uppercase;
    letter-spacing: .3px;
  }
  .dp-day {
    text-align: center;
    font-size: .85rem;
    padding: 7px 4px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text, #111827);
    transition: background .12s, color .12s;
    line-height: 1;
    border: none;
    background: none;
    font-family: inherit;
  }
  .dp-day:not(.dp-empty):hover {
    background: color-mix(in srgb, var(--brand, #16a34a) 14%, transparent);
    color: var(--brand, #16a34a);
  }
  .dp-day.dp-today {
    font-weight: 700;
    color: var(--brand, #16a34a);
    background: color-mix(in srgb, var(--brand, #16a34a) 10%, transparent);
  }
  .dp-day.dp-selected {
    background: var(--brand, #16a34a) !important;
    color: #fff !important;
    font-weight: 700;
  }
  .dp-day.dp-other-month {
    color: var(--muted, #9ca3af);
    opacity: .5;
  }
  .dp-day.dp-empty {
    cursor: default;
  }
  .dp-today-btn {
    display: block;
    width: 100%;
    margin-top: 10px;
    padding: 6px;
    font-size: .8rem;
    font-family: inherit;
    font-weight: 600;
    color: var(--brand, #16a34a);
    background: color-mix(in srgb, var(--brand, #16a34a) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--brand, #16a34a) 30%, transparent);
    border-radius: 8px;
    cursor: pointer;
    transition: background .15s;
    text-align: center;
  }
  .dp-today-btn:hover {
    background: color-mix(in srgb, var(--brand, #16a34a) 20%, transparent);
  }
  .dp-ym-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    max-height: 200px;
    overflow-y: auto;
  }
  .dp-ym-item {
    padding: 6px 2px;
    text-align: center;
    font-size: .83rem;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text, #111827);
    transition: background .12s;
    border: none;
    background: none;
    font-family: inherit;
  }
  .dp-ym-item:hover {
    background: color-mix(in srgb, var(--brand, #16a34a) 14%, transparent);
    color: var(--brand, #16a34a);
  }
  .dp-ym-item.dp-ym-active {
    background: var(--brand, #16a34a);
    color: #fff;
    font-weight: 700;
  }
  .dp-section-label {
    margin: 10px 0 6px;
    font-size: .8rem;
    font-weight: 600;
    color: var(--muted, #6b7280);
    text-transform: uppercase;
    letter-spacing: .3px;
  }
  `;

  /* ── Iniezione stili ────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('dp-styles')) return;
    const style = document.createElement('style');
    style.id = 'dp-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Utility date ───────────────────────────────────────────── */
  function toYMD(d)  { return d ? d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) : ''; }
  function toDMY(d)  { return d ? pad(d.getDate()) + '/' + pad(d.getMonth()+1) + '/' + d.getFullYear() : ''; }
  function pad(n)    { return String(n).padStart(2, '0'); }

  function parseYMD(s) {
    if (!s) return null;
    const parts = s.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  function parseDMY(s) {
    if (!s) return null;
    const parts = s.split(/[\/\-\.]/);
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10), m = parseInt(parts[1], 10), y = parseInt(parts[2], 10);
    if (!d || !m || !y || y < 1900 || y > 2100) return null;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  const MONTHS_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
                     'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const DAYS_IT   = ['Lu','Ma','Me','Gi','Ve','Sa','Do'];

  /* ── Stato globale popup ────────────────────────────────────── */
  let activePopup = null;

  function closeActivePopup() {
    if (activePopup) {
      activePopup.remove();
      activePopup = null;
    }
  }

  document.addEventListener('mousedown', function (e) {
    if (!activePopup) return;
    const wrapper = activePopup._wrapper;
    if (!activePopup.contains(e.target) && (!wrapper || !wrapper.contains(e.target))) {
      closeActivePopup();
    }
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeActivePopup();
  });

  /* ── Creazione popup ────────────────────────────────────────── */
  function createPopup(wrapper, hiddenInput, textInput) {
    closeActivePopup();

    const popup = document.createElement('div');
    popup.className = 'dp-popup';
    popup._wrapper = wrapper;
    activePopup = popup;

    let currentDate = parseYMD(hiddenInput.value) || new Date();
    let viewYear  = currentDate.getFullYear();
    let viewMonth = currentDate.getMonth();
    let showingYearMonth = false;

    function render() {
      popup.innerHTML = '';
      showingYearMonth ? renderYearMonth() : renderCalendar();
    }

    function renderCalendar() {
      const selectedDate = parseYMD(hiddenInput.value);
      const today = new Date();

      const header = document.createElement('div');
      header.className = 'dp-header';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button'; prevBtn.className = 'dp-nav-btn'; prevBtn.innerHTML = '&#8592;';
      prevBtn.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });

      const monthYearLabel = document.createElement('span');
      monthYearLabel.className = 'dp-month-year';
      monthYearLabel.textContent = MONTHS_IT[viewMonth] + ' ' + viewYear;
      monthYearLabel.title = 'Clicca per scegliere anno/mese';
      monthYearLabel.addEventListener('click', () => { showingYearMonth = true; render(); });

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button'; nextBtn.className = 'dp-nav-btn'; nextBtn.innerHTML = '&#8594;';
      nextBtn.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });

      header.appendChild(prevBtn); header.appendChild(monthYearLabel); header.appendChild(nextBtn);
      popup.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'dp-grid';

      DAYS_IT.forEach(name => {
        const cell = document.createElement('div');
        cell.className = 'dp-day-name'; cell.textContent = name;
        grid.appendChild(cell);
      });

      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

      for (let i = startOffset - 1; i >= 0; i--) {
        const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
        const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
        const dayNum = daysInPrevMonth - i;
        const dt = new Date(prevY, prevM, dayNum);
        const btn = makeDay(dayNum, 'dp-day dp-other-month', dt, selectedDate, today);
        grid.appendChild(btn);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(viewYear, viewMonth, d);
        const btn = makeDay(d, 'dp-day', dt, selectedDate, today);
        grid.appendChild(btn);
      }

      const total = startOffset + daysInMonth;
      const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
      for (let d = 1; d <= remaining; d++) {
        const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
        const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
        const dt = new Date(nextY, nextM, d);
        const btn = makeDay(d, 'dp-day dp-other-month', dt, selectedDate, today);
        grid.appendChild(btn);
      }

      popup.appendChild(grid);

      const todayBtn = document.createElement('button');
      todayBtn.type = 'button'; todayBtn.className = 'dp-today-btn'; todayBtn.textContent = 'Oggi';
      todayBtn.addEventListener('click', () => selectDate(new Date()));
      popup.appendChild(todayBtn);
    }

    function makeDay(num, cls, dt, selectedDate, today) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = cls; btn.textContent = num;
      const y = dt.getFullYear(), mo = dt.getMonth(), d = dt.getDate();
      if (today.getFullYear()===y && today.getMonth()===mo && today.getDate()===d) btn.classList.add('dp-today');
      if (selectedDate && selectedDate.getFullYear()===y && selectedDate.getMonth()===mo && selectedDate.getDate()===d) btn.classList.add('dp-selected');
      btn.addEventListener('click', () => selectDate(dt));
      return btn;
    }

    function renderYearMonth() {
      const header = document.createElement('div');
      header.className = 'dp-header';

      const backBtn = document.createElement('button');
      backBtn.type = 'button'; backBtn.className = 'dp-nav-btn'; backBtn.textContent = '← Torna';
      backBtn.addEventListener('click', () => { showingYearMonth = false; render(); });

      const title = document.createElement('span');
      title.className = 'dp-month-year no-click'; title.textContent = 'Anno e Mese';

      header.appendChild(backBtn); header.appendChild(title);
      popup.appendChild(header);

      const yearLabel = document.createElement('p'); yearLabel.className = 'dp-section-label'; yearLabel.textContent = 'Anno';
      popup.appendChild(yearLabel);

      const yearGrid = document.createElement('div'); yearGrid.className = 'dp-ym-grid';
      const startYear = Math.max(1950, viewYear - 20), endYear = viewYear + 15;
      for (let y = endYear; y >= startYear; y--) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'dp-ym-item' + (y === viewYear ? ' dp-ym-active' : '');
        btn.textContent = y;
        btn.addEventListener('click', () => { viewYear = y; showingYearMonth = false; render(); });
        yearGrid.appendChild(btn);
      }
      popup.appendChild(yearGrid);

      const monthLabel = document.createElement('p'); monthLabel.className = 'dp-section-label'; monthLabel.textContent = 'Mese';
      popup.appendChild(monthLabel);

      const monthGrid = document.createElement('div'); monthGrid.className = 'dp-ym-grid';
      MONTHS_IT.forEach((name, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'dp-ym-item' + (idx === viewMonth ? ' dp-ym-active' : '');
        btn.textContent = name.slice(0, 3);
        btn.addEventListener('click', () => { viewMonth = idx; showingYearMonth = false; render(); });
        monthGrid.appendChild(btn);
      });
      popup.appendChild(monthGrid);
    }

    function selectDate(dt) {
      const ymd = toYMD(dt);
      hiddenInput.value = ymd;
      textInput.value = toDMY(dt);
      textInput.classList.remove('invalid');
      hiddenInput.dispatchEvent(new Event('input',  { bubbles: true }));
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      closeActivePopup();
    }

    render();
    document.body.appendChild(popup);
    positionPopup(popup, wrapper);
  }

  function positionPopup(popup, anchor) {
    const rect   = anchor.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const popH = popup.offsetHeight || 320;
    const popW = popup.offsetWidth  || 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    let top = spaceBelow >= popH + 8 || spaceBelow >= 200
      ? rect.bottom + scrollY + 4
      : rect.top  + scrollY - popH - 4;
    let left = rect.left + scrollX;
    if (left + popW > window.innerWidth + scrollX - 8) left = window.innerWidth + scrollX - popW - 8;
    if (left < 8) left = 8;
    popup.style.top  = top  + 'px';
    popup.style.left = left + 'px';
  }

  /* ── Inizializzazione singolo input ─────────────────────────── */
  function initDateInput(input) {
    if (input.dataset.dpInit !== undefined) return;
    if (input.hasAttribute('data-no-datepicker')) return;
    if (input.type !== 'date') return;
    input.dataset.dpInit = '1';

    // Nascondi l'input originale
    input.style.cssText = 'position:absolute;opacity:0;width:0;height:0;padding:0;border:0;pointer-events:none;';

    // Wrapper inline-flex
    const wrapper = document.createElement('span');
    wrapper.className = 'dp-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Replica width dal parent se presente
    const parentStyle = window.getComputedStyle(input.parentNode);
    if (parentStyle.display === 'block' || parentStyle.display === 'flex') {
      wrapper.style.display = 'flex';
    }

    // Text input visibile
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'dp-text-input';
    textInput.placeholder = 'gg/mm/aaaa';
    textInput.autocomplete = 'off';
    textInput.setAttribute('spellcheck', 'false');
    if (input.required) {
      textInput.required = true;
      input.removeAttribute('required');
      input.dataset.dpRequired = '1';
    }
    if (input.disabled) textInput.disabled = true;
    if (input.getAttribute('aria-label')) textInput.setAttribute('aria-label', input.getAttribute('aria-label'));

    // Sync valore iniziale
    const initDate = parseYMD(input.value);
    if (initDate) textInput.value = toDMY(initDate);

    // Icona SVG calendario
    const iconBtn = document.createElement('button');
    iconBtn.type = 'button';
    iconBtn.className = 'dp-icon-btn';
    iconBtn.setAttribute('aria-label', 'Apri calendario');
    iconBtn.setAttribute('tabindex', '-1');
    iconBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1zm1-1V3a1 1 0 0 1 1-1h1v.5a.5.5 0 0 0 1 0V2h6v.5a.5.5 0 0 0 1 0V2h1a1 1 0 0 1 1 1v.5H1V3z"/></svg>';

    wrapper.appendChild(textInput);
    wrapper.appendChild(iconBtn);

    /* ── Input manuale: autoformat gg/mm/aaaa ─────────── */
    textInput.addEventListener('input', function () {
      const old = textInput.value;
      const digits = old.replace(/\D/g, '').slice(0, 8);
      let formatted = digits;
      if (digits.length > 4) {
        formatted = digits.slice(0,2) + '/' + digits.slice(2,4) + '/' + digits.slice(4);
      } else if (digits.length > 2) {
        formatted = digits.slice(0,2) + '/' + digits.slice(2);
      }
      if (formatted !== old) {
        const pos = textInput.selectionStart;
        textInput.value = formatted;
        const diff = formatted.length - old.length;
        try { textInput.setSelectionRange(pos + diff, pos + diff); } catch(e) {}
      }
    });

    textInput.addEventListener('blur', function () {
      const val = textInput.value.trim();
      if (!val) {
        input.value = '';
        textInput.classList.remove('invalid');
        fireEvents(input);
        return;
      }
      const dt = parseDMY(val);
      if (dt) {
        input.value = toYMD(dt);
        textInput.value = toDMY(dt);
        textInput.classList.remove('invalid');
        fireEvents(input);
      } else {
        textInput.classList.add('invalid');
      }
    });

    /* ── Apri popup con icona ─────────────────────────── */
    iconBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (activePopup && activePopup._wrapper === wrapper) {
        closeActivePopup();
      } else {
        createPopup(wrapper, input, textInput);
      }
    });

    /* ── Apri popup con Enter o Freccia Giù sull'input testo ── */
    textInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); createPopup(wrapper, input, textInput); }
      if (e.key === 'ArrowDown') { e.preventDefault(); createPopup(wrapper, input, textInput); }
    });

    /* ── Form reset handler ───────────────────────────── */
    if (input.form) {
      input.form.addEventListener('reset', function () {
        setTimeout(function () {
          const dt = parseYMD(input.value);
          textInput.value = dt ? toDMY(dt) : '';
          textInput.classList.remove('invalid');
        }, 0);
      });
    }

    /* ── Sync da assegnazione JS: input.value = '...' ── */
    const nativeValueDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(input, 'value', {
      configurable: true,
      get() {
        return nativeValueDesc ? nativeValueDesc.get.call(this) : (this.getAttribute('value') || '');
      },
      set(v) {
        if (nativeValueDesc) {
          nativeValueDesc.set.call(this, v);
        } else {
          this.setAttribute('value', v);
        }
        const dt = parseYMD(v);
        textInput.value = dt ? toDMY(dt) : '';
        textInput.classList.remove('invalid');
      }
    });
  }

  function fireEvents(el) {
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* ── Scansione iniziale ─────────────────────────────────────── */
  function scanAndInit() {
    document.querySelectorAll('input[type="date"]').forEach(initDateInput);
  }

  /* ── MutationObserver per input aggiunti via JS ─────────────── */
  function watchDOM() {
    const observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        const added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          const node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.tagName === 'INPUT' && node.type === 'date') initDateInput(node);
          if (node.querySelectorAll) node.querySelectorAll('input[type="date"]').forEach(initDateInput);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Esponi per chiamate manuali se necessario
  window.initDatePicker = scanAndInit;
  window.initSingleDatePicker = initDateInput;

  /* ── Bootstrap ──────────────────────────────────────────────── */
  function init() {
    injectStyles();
    scanAndInit();
    watchDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
