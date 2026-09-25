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
export function escapeHtml(str) {
    if (str == null)
        return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
/**
 * Converts a Firestore Timestamp or Date string to a JS Date object
 * @param value - The value to convert
 * @returns The JS Date object
 */
export function toJsDate(value) {
    if (value instanceof Date)
        return value;
    if (value && typeof value.toDate === 'function') {
        return value.toDate();
    }
    return new Date(value);
}
/**
 * Formats a date relative to now (e.g., "5 min ago")
 * @param date - The date to format
 * @returns The formatted string
 */
export function formatTimeAgo(date) {
    if (!date)
        return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 60)
        return `${min} min fa`;
    if (min < 1440)
        return `${Math.floor(min / 60)} h fa`;
    return date.toLocaleDateString();
}
const debounceTimers = {};
/**
 * Debounces a function with rate limiting
 * @param key - Unique key for the rate limit
 * @param fn - Function to execute
 * @param delay - Delay in milliseconds
 */
export function debounceWithRateLimit(key, fn, delay) {
    debounceTimers[key] = window.setTimeout(() => {
        delete debounceTimers[key];
        fn();
    }, delay);
}

/**
 * Formats a Date object to YYYY-MM-DD string for input[type=date]
 * @param date - The Date object or timestamp
 * @returns The formatted string or empty string
 */
export function toYyyyMmDd(date) {
    if (!date) return '';
    try {
        const d = toJsDate(date);
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
}

/**
 * Generates printable HTML for a scout's Sentiero sheet
 * @param {Object} scout - The scout object
 * @param {Object} challenges - Challenges definition dictionary
 * @param {Array} specialitaList - Specialita definition list
 * @returns {string} HTML string
 */
export function generateScoutSentieroHtml(scout, challenges = {}, specialitaList = []) {
    if (!scout) return '';

    const fmtDate = (d) => {
        if (!d) return '';
        try {
            const date = d && typeof d.toDate === 'function' ? d.toDate() : new Date(d);
            return isNaN(date.getTime()) ? '' : date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return '';
        }
    };

    const isCheckDone = (v) => {
        if (!v) return false;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'object' && v.done) return true;
        if (typeof v === 'string' && v.trim() !== '') return true;
        return false;
    };

    const getTracciaDate = (v) => {
        if (!v) return '';
        if (typeof v === 'object' && v.date) return fmtDate(v.date);
        if (typeof v === 'string') return fmtDate(v);
        return '';
    };

    const nomeCompleto = `${scout.nome || ''} ${scout.cognome || ''}`.trim() || 'Esploratore';
    const pattuglia = scout.pv_pattuglia ? `Pattuglia ${scout.pv_pattuglia}` : '';

    const isT1 = isCheckDone(scout.pv_traccia1);
    const isT2 = isCheckDone(scout.pv_traccia2);
    const isT3 = isCheckDone(scout.pv_traccia3);

    let passoRaggiunto = 0;
    let prossimoPasso = 1;

    if (isT3) {
        passoRaggiunto = 3;
        prossimoPasso = null;
    } else if (isT2) {
        passoRaggiunto = 2;
        prossimoPasso = 3;
    } else if (isT1) {
        passoRaggiunto = 1;
        prossimoPasso = 2;
    } else {
        passoRaggiunto = 0;
        prossimoPasso = 1;
    }

    let versoCosa = '';
    if (!scout.pv_promessa && passoRaggiunto === 0) {
        versoCosa = 'la Promessa';
    } else if (prossimoPasso === 1) {
        versoCosa = 'il primo Passo';
    } else if (prossimoPasso === 2) {
        versoCosa = 'il secondo Passo';
    } else if (prossimoPasso === 3) {
        versoCosa = 'il terzo Passo';
    }

    const direzioniLabels = { io: 'IO', al: 'Gli Altri', mt: 'La Mia Traccia' };

    const getSfidaText = (passo, dir, code) => {
        if (!code || !challenges) return '';
        const dirUpper = dir.toUpperCase();
        const sfide = challenges[String(passo)]?.[dirUpper] || [];
        const sfida = sfide.find(s => s.code === code);
        return sfida ? sfida.text : '';
    };

    let html = `
      <div class="sentiero-sheet-page" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; padding: 24px; background: #ffffff;">
        <!-- Header Scheda -->
        <div style="border-bottom: 3px solid #15803d; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #15803d;">Reparto Maori · Scheda di Progressione</div>
            <h1 style="font-size: 26px; font-weight: 800; margin: 4px 0 0 0; color: #111827;">Il sentiero di ${scout.nome || nomeCompleto}</h1>
          </div>
          <div style="text-align: right;">
            ${pattuglia ? `<span style="display: inline-block; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 13px; padding: 3px 10px; border-radius: 9999px; border: 1px solid #fde68a;">${pattuglia}</span>` : ''}
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Data: ${new Date().toLocaleDateString('it-IT')}</div>
          </div>
        </div>

        <!-- PROGRESSIONE VERTICALE -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 18px; background: #f9fafb;">
          <div style="font-size: 14px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
            👣 Progressione Verticale
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px; font-size: 12px;">
            <div style="padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <strong>Promessa:</strong> ${scout.pv_promessa ? `☑ Fatta il ${fmtDate(scout.pv_promessa)}` : '☐ Da fare'}
            </div>
            <div style="padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <strong>1° Passo:</strong> ${isT1 ? `☑ Raggiunto ${getTracciaDate(scout.pv_traccia1)}` : '☐ Da raggiungere'}
            </div>
            <div style="padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <strong>2° Passo:</strong> ${isT2 ? `☑ Raggiunto ${getTracciaDate(scout.pv_traccia2)}` : '☐ Da raggiungere'}
            </div>
            <div style="padding: 6px 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
              <strong>3° Passo:</strong> ${isT3 ? `☑ Raggiunto ${getTracciaDate(scout.pv_traccia3)}` : '☐ Da raggiungere'}
            </div>
          </div>

          ${versoCosa ? `
            <div style="font-size: 13px; font-weight: 600; color: #1e3a8a; background: #eff6ff; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              ➔ Stai camminando verso: <span style="text-decoration: underline;">${versoCosa}</span>
            </div>
          ` : ''}
        </div>

        <!-- SFIDE DA SUPERARE PER RAGGIUNGERE IL PROSSIMO PASSO -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 18px; background: #ffffff;">
          <div style="font-size: 14px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #fef3c7; padding-bottom: 6px;">
            🎯 Sfide da Superare ${prossimoPasso ? `(per il ${prossimoPasso}° Passo)` : ''}
          </div>
    `;

    if (prossimoPasso) {
        const direzioni = ['io', 'al', 'mt'];
        let hasSfide = false;

        direzioni.forEach(dir => {
            const code = scout[`pv_sfida_${dir}_${prossimoPasso}`];
            const dataSfida = scout[`pv_sfida_${dir}_${prossimoPasso}_data`];
            if (code) {
                hasSfide = true;
                const isCompl = isCheckDone(dataSfida);
                const sfidaText = getSfidaText(prossimoPasso, dir, code);
                html += `
                  <div style="margin-bottom: 8px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: ${isCompl ? '#f0fdf4' : '#fafafa'}; display: flex; align-items: flex-start; gap: 10px;">
                    <div style="font-size: 18px; line-height: 1; min-width: 22px; color: ${isCompl ? '#16a34a' : '#6b7280'};">${isCompl ? '☑' : '☐'}</div>
                    <div style="flex: 1;">
                      <div style="font-weight: 700; font-size: 13px; color: #111827; margin-bottom: 2px;">${direzioniLabels[dir]} — Codice: ${code}</div>
                      <div style="font-size: 12px; color: #374151; line-height: 1.4;">${sfidaText || 'Nessuna descrizione'}</div>
                      ${dataSfida ? `<div style="font-size: 11px; color: #15803d; font-weight: 600; margin-top: 4px;">Completata il: ${fmtDate(dataSfida)}</div>` : ''}
                    </div>
                  </div>
                `;
            }
        });

        const sfidaBianca = scout[`pv_sfida_bianca_${prossimoPasso}`];
        if (sfidaBianca) {
            hasSfide = true;
            html += `
              <div style="margin-bottom: 8px; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fafafa; display: flex; align-items: flex-start; gap: 10px;">
                <div style="font-size: 18px; line-height: 1; min-width: 22px; color: #6b7280;">☐</div>
                <div style="flex: 1;">
                  <div style="font-weight: 700; font-size: 13px; color: #111827; margin-bottom: 2px;">Sfida Bianca (Personale)</div>
                  <div style="font-size: 12px; color: #374151; line-height: 1.4;">${sfidaBianca}</div>
                </div>
              </div>
            `;
        }

        if (!hasSfide) {
            html += `<div style="color: #6b7280; font-style: italic; font-size: 12px; padding: 8px 0;">Nessuna sfida ancora selezionata per questo passo.</div>`;
        }
    } else {
        html += `<div style="color: #15803d; font-weight: 600; font-size: 13px; padding: 8px 0;">🎉 Tutti i 3 Passi sono stati completati con successo!</div>`;
    }

    html += `</div>`;

    // SPECIALITÀ
    const specialitaListArray = Array.isArray(scout.specialita) ? scout.specialita : [];
    const specialitaOttenute = specialitaListArray.filter(sp => sp && sp.nome && sp.ottenuta);
    const specialitaDaOttenere = specialitaListArray.filter(sp => sp && sp.nome && !sp.ottenuta);

    html += `
      <!-- SPECIALITÀ -->
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #ffffff;">
        <div style="font-size: 14px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 1px solid #e0e7ff; padding-bottom: 6px;">
          ⭐ Progressione Orizzontale (Specialità)
        </div>

        <!-- Specialità Ottenute -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 6px;">SPECIALITÀ GIÀ CONQUISTATE:</div>
          ${specialitaOttenute.length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
              ${specialitaOttenute.map(sp => `
                <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-weight: 600; font-size: 12px; padding: 3px 8px; border-radius: 6px;">
                  🏅 ${sp.nome} ${sp.data ? `(${fmtDate(sp.data)})` : ''}
                </span>
              `).join('')}
            </div>
            ${specialitaOttenute.some(sp => sp.note) ? `
              <div style="font-size: 11px; color: #4b5563; background: #f9fafb; padding: 6px 10px; border-radius: 6px; border: 1px solid #f3f4f6; margin-top: 4px;">
                ${specialitaOttenute.filter(sp => sp.note).map(sp => `<div><em>${sp.nome}:</em> ${sp.note}</div>`).join('')}
              </div>
            ` : ''}
          ` : `
            <div style="font-size: 12px; color: #6b7280; font-style: italic;">Nessuna specialità ancora conquistata.</div>
          `}
        </div>

        <!-- Specialità Da Ottenere (con prove) -->
        <div>
          <div style="font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 8px;">SPECIALITÀ IN CORSO E PROVE DA SUPERARE:</div>
          ${specialitaDaOttenere.length > 0 ? `
            <div style="display: grid; gap: 12px;">
              ${specialitaDaOttenere.map(sp => {
                  const specDef = (specialitaList || []).find(s => s && s.nome === sp.nome);
                  const prove = specDef?.prove || [
                      { nome: 'Prova 1', id: 'p1' },
                      { nome: 'Prova 2', id: 'p2' },
                      { nome: 'Prova 3', id: 'p3' }
                  ];

                  return `
                    <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #fafafa;">
                      <div style="font-weight: 700; font-size: 13px; color: #1f2937; margin-bottom: 6px; display: flex; justify-content: space-between;">
                        <span>🎯 ${sp.nome}</span>
                        ${sp.note ? `<span style="font-size: 11px; font-weight: normal; color: #6b7280;">Note: ${sp.note}</span>` : ''}
                      </div>
                      <div style="display: grid; gap: 4px;">
                        ${prove.map(prova => {
                            const pData = sp[`${prova.id}_data`];
                            const pDone = isCheckDone(pData);
                            return `
                              <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; background: white; padding: 5px 8px; border-radius: 4px; border: 1px solid #f3f4f6;">
                                <span style="font-size: 14px; line-height: 1; color: ${pDone ? '#16a34a' : '#9ca3af'};">${pDone ? '☑' : '☐'}</span>
                                <div style="flex: 1;">
                                  <strong style="color: #374151;">${prova.nome}:</strong> ${prova.text || ''}
                                  ${pData ? `<span style="color: #15803d; font-weight: 600; margin-left: 6px;">(Superata il: ${fmtDate(pData)})</span>` : ''}
                                </div>
                              </div>
                            `;
                        }).join('')}
                        ${(sp.cr_text || sp.cr_data) ? `
                          <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; background: white; padding: 5px 8px; border-radius: 4px; border: 1px solid #f3f4f6;">
                            <span style="font-size: 14px; line-height: 1; color: ${sp.cr_data ? '#16a34a' : '#9ca3af'};">${sp.cr_data ? '☑' : '☐'}</span>
                            <div style="flex: 1;">
                              <strong style="color: #374151;">Prova stabilita dal Consiglio di Reparto:</strong> ${sp.cr_text || ''}
                              ${sp.cr_data ? `<span style="color: #15803d; font-weight: 600; margin-left: 6px;">(${fmtDate(sp.cr_data)})</span>` : ''}
                            </div>
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  `;
              }).join('')}
            </div>
          ` : `
            <div style="font-size: 12px; color: #6b7280; font-style: italic;">Nessuna specialità attualmente in corso di svolgimento.</div>
          `}
        </div>
      </div>
    </div>
    `;

    return html;
}

/**
 * Returns the Scout Year string for a given date (e.g. "2024/2025")
 * Scout year runs from September 1st (month index 8) to August 31st (month index 7)
 */
export function getScoutYear(date) {
    if (!date) return null;
    try {
        const d = toJsDate(date);
        if (!d || isNaN(d.getTime())) return null;
        const year = d.getFullYear();
        const month = d.getMonth();
        if (month >= 8) {
            return `${year}/${year + 1}`;
        } else {
            return `${year - 1}/${year}`;
        }
    } catch {
        return null;
    }
}

/**
 * Returns the start and end Date range for a scout year string (e.g. "2024/2025")
 */
export function getScoutYearDateRange(scoutYearStr) {
    if (!scoutYearStr || typeof scoutYearStr !== 'string' || !scoutYearStr.includes('/')) return null;
    const parts = scoutYearStr.trim().split('/');
    const startYear = parseInt(parts[0], 10);
    const endYear = parseInt(parts[1], 10);
    if (isNaN(startYear) || isNaN(endYear)) return null;

    const start = new Date(startYear, 8, 1, 0, 0, 0, 0); // 1 Sept
    const end = new Date(endYear, 7, 31, 23, 59, 59, 999); // 31 Aug
    return { start, end };
}

/**
 * Returns current scout year based on reference date or today
 */
export function getCurrentScoutYear(refDate = new Date()) {
    return getScoutYear(refDate) || '2025/2026';
}

/**
 * Extracts and returns all unique scout years from activities, sorted descending
 */
export function getAllScoutYears(activities = []) {
    const yearsSet = new Set();
    const currentYear = getCurrentScoutYear();
    yearsSet.add(currentYear);

    if (Array.isArray(activities)) {
        activities.forEach(act => {
            if (!act) return;
            if (act.annoScout && typeof act.annoScout === 'string' && act.annoScout.includes('/')) {
                yearsSet.add(act.annoScout.trim());
            } else if (act.data) {
                const sy = getScoutYear(act.data);
                if (sy) yearsSet.add(sy);
            }
        });
    }

    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
}

/**
 * Checks if an activity belongs to a specific scout year
 */
export function isActivityInScoutYear(activity, scoutYearStr) {
    if (!activity || !scoutYearStr) return false;
    if (scoutYearStr === 'all') return true;

    if (activity.annoScout && activity.annoScout.trim() === scoutYearStr.trim()) {
        return true;
    }

    const range = getScoutYearDateRange(scoutYearStr);
    if (!range) return false;

    const d = toJsDate(activity.data);
    if (!d || isNaN(d.getTime())) return false;

    return d >= range.start && d <= range.end;
}

/**
 * Returns activities taking place within the next `daysAhead` days (from start of refDate).
 */
export function getUpcomingActivities(activities = [], daysAhead = 3, refDate = new Date()) {
    if (!Array.isArray(activities)) return [];
    const base = toJsDate(refDate);
    if (!base || isNaN(base.getTime())) return [];

    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + daysAhead);
    end.setHours(23, 59, 59, 999);

    return activities
        .filter(act => {
            if (!act || !act.data) return false;
            const d = toJsDate(act.data);
            return d && !isNaN(d.getTime()) && d >= start && d <= end;
        })
        .sort((a, b) => toJsDate(a.data).getTime() - toJsDate(b.data).getTime());
}

/**
 * Finds activities with a cost > 0 that have present scouts who have not yet paid.
 */
export function getPendingPaymentsByActivity(activities = [], presences = []) {
    if (!Array.isArray(activities) || !Array.isArray(presences)) return [];

    const results = [];

    activities.forEach(act => {
        if (!act) return;
        const cost = parseFloat(act.costo || '0');
        if (isNaN(cost) || cost <= 0) return;

        const pending = presences.filter(p =>
            p &&
            String(p.attivitaId) === String(act.id) &&
            p.stato === 'Presente' &&
            !p.pagato
        );

        if (pending.length > 0) {
            results.push({
                activity: act,
                pendingPresences: pending,
                pendingCount: pending.length,
                totalAmount: Math.round(pending.length * cost * 100) / 100
            });
        }
    });

    return results;
}

/**
 * Finds scouts whose birthday falls within the next `daysAhead` days.
 */
export function getUpcomingBirthdays(scouts = [], daysAhead = 3, refDate = new Date()) {
    if (!Array.isArray(scouts)) return [];
    const base = toJsDate(refDate);
    if (!base || isNaN(base.getTime())) return [];

    const currentYear = base.getFullYear();
    const today = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);

    const results = [];

    scouts.forEach(scout => {
        if (!scout || scout.archived || !scout.anag_dob) return;
        const dob = toJsDate(scout.anag_dob);
        if (!dob || isNaN(dob.getTime())) return;

        for (const yr of [currentYear, currentYear + 1]) {
            const bdayThisYear = new Date(yr, dob.getMonth(), dob.getDate(), 0, 0, 0, 0);
            const diffTime = bdayThisYear.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays <= daysAhead) {
                const turningAge = yr - dob.getFullYear();
                results.push({
                    scout,
                    daysUntil: diffDays,
                    birthdayDate: bdayThisYear,
                    turningAge: turningAge > 0 ? turningAge : undefined
                });
                break;
            }
        }
    });

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Extracts and aggregates all deadlines for a given scout year:
 * - Activities in the scout year
 * - Unpaid dues on activities with costo > 0
 * - Scout birthdays in the scout year
 * - Custom deadlines created by users
 */
export function getAllScoutYearDeadlines(options) {
    const {
        scoutYear,
        activities = [],
        presences = [],
        scouts = [],
        customDeadlines = [],
        refDate = new Date()
    } = options || {};

    const base = toJsDate(refDate) || new Date();
    const today = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
    const range = getScoutYearDateRange(scoutYear) || {
        start: new Date(today.getFullYear(), 9, 1),
        end: new Date(today.getFullYear() + 1, 8, 30, 23, 59, 59, 999)
    };

    const deadlines = [];

    const getDaysDiff = (targetDate) => {
        if (!targetDate || isNaN(targetDate.getTime())) return 0;
        const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
        return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getStatus = (days, completed) => {
        if (completed) return 'completata';
        if (days < 0) return 'scaduta';
        if (days === 0) return 'oggi';
        if (days <= 7) return 'imminente';
        return 'futura';
    };

    // 1. Attività nell'anno scout
    activities.forEach(act => {
        if (!act || !isActivityInScoutYear(act, scoutYear)) return;
        const d = toJsDate(act.data);
        if (!d || isNaN(d.getTime())) return;
        const dateStr = d.toISOString().split('T')[0];
        const days = getDaysDiff(d);
        const isPast = days < 0;

        deadlines.push({
            id: `act_${act.id}`,
            originalId: String(act.id),
            type: 'activity',
            titolo: `${act.tipo || 'Attività'}${act.descrizione ? ' - ' + act.descrizione : ''}`,
            dataScadenza: dateStr,
            dueDate: d,
            daysUntil: days,
            categoria: 'Attività',
            descrizione: act.descrizione || (act.tipo || 'Attività'),
            status: getStatus(days, isPast),
            isCustom: false,
            completata: isPast,
            costo: parseFloat(act.costo || '0'),
            luogo: act.luogo || '',
            url: 'calendario.html'
        });
    });

    // 2. Quote da saldare per attività con costo > 0
    activities.forEach(act => {
        if (!act || !isActivityInScoutYear(act, scoutYear)) return;
        const cost = parseFloat(act.costo || '0');
        if (isNaN(cost) || cost <= 0) return;

        const d = toJsDate(act.data);
        if (!d || isNaN(d.getTime())) return;
        const dateStr = d.toISOString().split('T')[0];
        const days = getDaysDiff(d);

        const pending = presences.filter(p =>
            p &&
            String(p.attivitaId) === String(act.id) &&
            p.stato === 'Presente' &&
            !p.pagato
        );

        if (pending.length > 0) {
            const tot = Math.round(pending.length * cost * 100) / 100;
            deadlines.push({
                id: `pay_${act.id}`,
                originalId: String(act.id),
                type: 'payment',
                titolo: `Saldo quote: ${act.tipo || 'Attività'}${act.descrizione ? ' (' + act.descrizione + ')' : ''}`,
                dataScadenza: dateStr,
                dueDate: d,
                daysUntil: days,
                categoria: 'Quote & Pagamenti',
                descrizione: `${pending.length} ${pending.length === 1 ? 'esploratore presente non ha' : 'esploratori presenti non hanno'} ancora saldato la quota (€${tot} in sospeso).`,
                status: getStatus(days, false),
                isCustom: false,
                completata: false,
                pendingCount: pending.length,
                totalAmount: tot,
                costo: cost,
                url: 'pagamenti.html'
            });
        }
    });

    // 3. Compleanni degli esploratori nell'anno scout
    scouts.forEach(scout => {
        if (!scout || scout.archived || !scout.anag_dob) return;
        const dob = toJsDate(scout.anag_dob);
        if (!dob || isNaN(dob.getTime())) return;

        const bdayYear = dob.getMonth() >= 9 ? range.start.getFullYear() : range.end.getFullYear();
        const bdayDate = new Date(bdayYear, dob.getMonth(), dob.getDate(), 0, 0, 0, 0);
        const dateStr = bdayDate.toISOString().split('T')[0];
        const days = getDaysDiff(bdayDate);
        const turningAge = bdayYear - dob.getFullYear();
        const isPast = days < 0;

        deadlines.push({
            id: `bday_${scout.id}_${bdayYear}`,
            originalId: String(scout.id),
            type: 'birthday',
            titolo: `🎂 Compleanno di ${scout.nome || ''} ${scout.cognome || ''}`.trim(),
            dataScadenza: dateStr,
            dueDate: bdayDate,
            daysUntil: days,
            categoria: 'Compleanni',
            descrizione: `Compie ${turningAge} anni${scout.pv_pattuglia ? ' (Pattuglia ' + scout.pv_pattuglia + ')' : ''}`,
            status: getStatus(days, isPast),
            isCustom: false,
            completata: isPast,
            turningAge: turningAge > 0 ? turningAge : undefined,
            url: 'esploratori.html'
        });
    });

    // 4. Scadenze Personalizzate
    customDeadlines.forEach(cd => {
        if (!cd) return;
        const cdDate = toJsDate(cd.dataScadenza);
        if (cd.annoScout) {
            if (cd.annoScout !== scoutYear) return;
        } else if (cdDate) {
            if (cdDate < range.start || cdDate > range.end) return;
        }

        const dateStr = cdDate ? cdDate.toISOString().split('T')[0] : (cd.dataScadenza || '');
        const days = getDaysDiff(cdDate);
        const isCompleted = Boolean(cd.completata);

        deadlines.push({
            id: String(cd.id),
            originalId: String(cd.id),
            type: 'custom',
            titolo: cd.titolo || 'Scadenza senza titolo',
            dataScadenza: dateStr,
            dueDate: cdDate,
            daysUntil: days,
            categoria: cd.categoria || 'Altro',
            descrizione: cd.note || '',
            status: getStatus(days, isCompleted),
            isCustom: true,
            completata: isCompleted,
            priorita: cd.priorita || 'Media',
            customData: cd
        });
    });

    // 5. Certificati Medici & Documenti Sanitari
    scouts.forEach(scout => {
        if (!scout || scout.archived) return;
        if (!scout.san_cert_scadenza) return;

        const med = getScoutMedicalStatus(scout, base);
        const certDate = toJsDate(scout.san_cert_scadenza);
        if (!certDate || isNaN(certDate.getTime())) return;

        const inYear = certDate >= range.start && certDate <= range.end;
        const needsAttention = med.certStatus === 'expired' || med.certStatus === 'expiring';

        if (inYear || needsAttention) {
            const dateStr = certDate.toISOString().split('T')[0];
            const days = getDaysDiff(certDate);

            deadlines.push({
                id: `med_${scout.id}`,
                originalId: String(scout.id),
                scoutId: String(scout.id),
                type: 'medical',
                titolo: `🩺 Certificato Medico: ${scout.nome || ''} ${scout.cognome || ''}`.trim(),
                dataScadenza: dateStr,
                dueDate: certDate,
                daysUntil: days,
                categoria: 'Certificati & Documenti',
                descrizione: `Certificato medico ${med.statusLabel.toLowerCase()}${!med.docPriv ? ' • Manca Privacy' : ''}${!med.docSan ? ' • Manca Scheda Sanitaria' : ''}`,
                status: med.certStatus === 'expired' ? 'scaduta' : (med.certStatus === 'expiring' ? 'imminente' : (days === 0 ? 'oggi' : 'futura')),
                isCustom: false,
                completata: false,
                scout: scout,
                medStatus: med,
                url: `scout2.html?id=${scout.id}`
            });
        }
    });

    // Ordina per dataScadenza crescente
    return deadlines.sort((a, b) => {
        if (a.dataScadenza < b.dataScadenza) return -1;
        if (a.dataScadenza > b.dataScadenza) return 1;
        return a.titolo.localeCompare(b.titolo);
    });
}

/**
 * Calculates health & medical documents status for a scout:
 * - Medical certificate expiration (valid > 30d, expiring <= 30d, expired < 0d, or missing)
 * - Privacy consent (doc_priv)
 * - Medical information form (doc_san)
 */
export function getScoutMedicalStatus(scout, refDate = new Date()) {
    if (!scout) {
        return {
            certStatus: 'missing',
            statusLabel: 'Mancante',
            color: 'red',
            daysRemaining: null,
            rawDate: '',
            formattedDate: '',
            docPriv: false,
            docSan: false,
            isCompliant: false,
            missingDocuments: ['Certificato Medico', 'Consenso Privacy', 'Scheda Sanitaria'],
            badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300'
        };
    }

    const todayDate = toJsDate(refDate) || new Date();
    const today = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);

    const certRaw = scout.san_cert_scadenza || scout.scadenzaCertificatoMedico;
    const certDate = certRaw ? toJsDate(certRaw) : null;
    let daysRemaining = null;
    let rawDate = '';
    let formattedDate = '';
    let certStatus = 'missing';
    let statusLabel = 'Mancante';
    let color = 'red';
    let badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300';

    if (certDate && !isNaN(certDate.getTime())) {
        const certTarget = new Date(certDate.getFullYear(), certDate.getMonth(), certDate.getDate(), 0, 0, 0, 0);
        daysRemaining = Math.round((certTarget.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        rawDate = certTarget.toISOString().split('T')[0];
        formattedDate = certTarget.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

        if (daysRemaining < 0) {
            certStatus = 'expired';
            statusLabel = `Scaduto (${Math.abs(daysRemaining)} gg fa)`;
            color = 'red';
            badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300';
        } else if (daysRemaining <= 30) {
            certStatus = 'expiring';
            statusLabel = `In scadenza (${daysRemaining === 0 ? 'Oggi' : daysRemaining === 1 ? 'Domani' : 'tra ' + daysRemaining + ' gg'})`;
            color = 'yellow';
            badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300';
        } else {
            certStatus = 'valid';
            statusLabel = `Valido (fino al ${formattedDate})`;
            color = 'green';
            badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300';
        }
    }

    const docPriv = Boolean(scout.doc_priv ?? scout.consensoPrivacy);
    const docSan = Boolean(scout.doc_san ?? scout.schedaSanitariaConsegnata);
    const missingDocuments = [];

    if (certStatus !== 'valid') {
        missingDocuments.push(certStatus === 'expired' ? 'Rinnovo Certificato Medico' : 'Certificato Medico');
    }
    if (!docPriv) missingDocuments.push('Consenso Privacy');
    if (!docSan) missingDocuments.push('Scheda Sanitaria');

    const isCompliant = certStatus === 'valid' && docPriv && docSan;

    return {
        certStatus,
        statusLabel,
        color,
        daysRemaining,
        rawDate,
        formattedDate,
        docPriv,
        docSan,
        isCompliant,
        missingDocuments,
        badgeClass
    };
}

/**
 * Generates direct WhatsApp click-to-chat URL with prefilled message
 */
export function generateWhatsAppReminderUrl(options = {}) {
    const {
        scoutNome = '',
        scadenzaStr = '',
        telGenitore = '',
        certStatus = 'expiring',
        missingDocs = []
    } = options;

    let cleanPhone = String(telGenitore || '').replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1);
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
        cleanPhone = '39' + cleanPhone;
    }

    let message = '';
    const nome = scoutNome.trim() || 'tuo figlio/a';

    if (certStatus === 'expired') {
        message = `Ciao! Ti scriviamo dai capi del Reparto Scout Maori. Ti ricordiamo che il certificato medico di ${nome} è scaduto${scadenzaStr ? ' il ' + scadenzaStr : ''}. Per poter partecipare regolarmente alle prossime uscite e attività di Reparto è necessario rinnovarlo al più presto.`;
    } else if (certStatus === 'expiring') {
        message = `Ciao! Ti scriviamo dai capi del Reparto Scout Maori. Ti ricordiamo che il certificato medico di ${nome} scadrà a breve${scadenzaStr ? ' (il ' + scadenzaStr + ')' : ''}. Ti invitiamo a prenotare la visita per il rinnovo in modo da non avere interruzioni nelle attività scout.`;
    } else if (certStatus === 'missing') {
        message = `Ciao! Ti scriviamo dai capi del Reparto Scout Maori. Ti segnaliamo che siamo ancora in attesa della consegna del certificato medico di ${nome} per l'anno scout in corso.`;
    } else {
        message = `Ciao! Ti scriviamo dai capi del Reparto Scout Maori riguardo la documentazione di ${nome}.`;
    }

    const otherDocs = missingDocs.filter(d => !d.toLowerCase().includes('certificato'));
    if (otherDocs.length > 0) {
        message += ` Vi ricordiamo inoltre di consegnare: ${otherDocs.join(', ')}.`;
    }

    message += ` Grazie mille per la collaborazione e Buona Caccia! ⚜️`;

    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

    return {
        url,
        message,
        phone: cleanPhone
    };
}

/**
 * Genera il layout compatto stampabile della Scheda Sanitaria Personale
 * ad uso dei capi per la cartellina medica di campo
 */
export function generateScoutMedicalSheetHtml(data) {
    const d = data || {};
    const nomeCompleto = `${d.nome || ''} ${d.cognome || ''}`.trim() || 'Esploratore';
    const pattuglia = d.pv_pattuglia || 'Reparto';
    const ruolo = d.cp_vcp || 'Esploratore';

    const dobVal = d.anag_dob || d.dataNascita;
    let dobStr = 'Non indicata';
    let etaStr = '';
    if (dobVal) {
        const dob = toJsDate(dobVal);
        if (!isNaN(dob.getTime())) {
            dobStr = dob.toLocaleDateString('it-IT');
            const diffMs = Date.now() - dob.getTime();
            const ageDate = new Date(diffMs);
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age >= 0 && age < 100) {
                etaStr = ` (${age} anni)`;
            }
        }
    }

    const pobStr = d.anag_pob || '-';
    const cfStr = d.anag_cf ? d.anag_cf.toUpperCase() : '-';
    const indirizzoStr = d.anag_indirizzo || '-';

    const g1Nome = d.ct_g1_nome || 'Genitore 1';
    const g1Rel = d.ct_g1_rel ? ` (${d.ct_g1_rel})` : '';
    const g1Tel = d.ct_g1_tel || d.anag_telefono || 'Non specificato';

    const g2Nome = d.ct_g2_nome || 'Genitore 2';
    const g2Rel = d.ct_g2_rel ? ` (${d.ct_g2_rel})` : '';
    const g2Tel = d.ct_g2_tel || '-';

    const medNome = d.ct_med_nome || '-';
    const medTel = d.ct_med_tel || '-';

    const gruppoSangue = d.san_gruppo || 'N.D.';
    const intolleranze = (d.san_intolleranze || '').trim();
    const allergie = (d.san_allergie || '').trim();
    const farmaci = (d.san_farmaci || '').trim();
    const vaccinazioni = (d.san_vaccinazioni || '').trim();
    const certScadenza = d.san_cert_scadenza ? toJsDate(d.san_cert_scadenza).toLocaleDateString('it-IT') : 'Non specificata';
    const certNote = (d.san_cert || '').trim();
    const altro = (d.san_altro || '').trim();

    const medStatus = getScoutMedicalStatus(d);
    const certStatusLabel = medStatus ? medStatus.statusLabel : (d.san_cert_scadenza ? 'Registrato' : 'Mancante');
    const certColor = medStatus && medStatus.color === 'green' ? '#16a34a' : (medStatus && medStatus.color === 'yellow' ? '#d97706' : '#dc2626');

    const privacyOk = !!d.doc_priv;
    const schedaFirmataOk = !!d.doc_san;
    const currentYear = getCurrentScoutYear();

    return `
        <div class="medical-sheet-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 18px 22px; color: #111827; background: #ffffff; box-sizing: border-box; line-height: 1.35; font-size: 12px;">
          <div style="border-bottom: 2.5px solid #b91c1c; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #b91c1c;">
                ⚜️ AGESCI • Reparto Maori • Cartellina Sanitaria Campo
              </div>
              <h1 style="font-size: 22px; font-weight: 900; margin: 2px 0 0 0; color: #111827; text-transform: uppercase; letter-spacing: -0.5px;">
                Scheda Sanitaria & di Emergenza
              </h1>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; font-size: 11px; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; border: 1.5px solid #f87171; text-transform: uppercase;">
                Riservato Capi Campo
              </span>
              <div style="font-size: 10px; color: #4b5563; font-weight: 600; margin-top: 3px;">
                Anno Scout ${currentYear}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px;">
            <div>
              <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Esploratore / Guida</div>
              <div style="font-size: 18px; font-weight: 900; color: #111827; text-transform: uppercase;">
                ${nomeCompleto}
              </div>
              <div style="margin-top: 4px; font-size: 11px; color: #374151;">
                <strong>Nato il:</strong> ${dobStr}${etaStr} &nbsp;•&nbsp; <strong>A:</strong> ${pobStr}
              </div>
              <div style="font-size: 11px; color: #374151; margin-top: 2px;">
                <strong>C.F.:</strong> <span style="font-family: monospace; font-weight: bold;">${cfStr}</span> &nbsp;•&nbsp; <strong>Residenza:</strong> ${indirizzoStr}
              </div>
            </div>

            <div style="text-align: right; border-left: 1.5px solid #e5e7eb; padding-left: 12px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
              <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Pattuglia & Ruolo</div>
              <div style="font-size: 16px; font-weight: 800; color: #15803d;">
                Ptg. ${pattuglia}
              </div>
              <span style="display: inline-block; margin-top: 3px; font-size: 10px; font-weight: 700; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px;">
                ${ruolo}
              </span>
            </div>
          </div>

          <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
            <div style="background: #f1f5f9; padding: 6px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155; border-bottom: 1.5px solid #cbd5e1; display: flex; align-items: center; gap: 6px;">
              <span>🚨</span> Recapiti Telefonici di Emergenza (Genitori / Tutori)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; padding: 10px 12px; font-size: 11px;">
              <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Primo Contatto</div>
                <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${g1Nome}${g1Rel}</div>
                <div style="font-size: 14px; font-weight: 900; color: #b91c1c; margin-top: 2px; font-family: monospace;">
                  📞 ${g1Tel}
                </div>
              </div>
              <div style="border-right: 1px dashed #cbd5e1; padding-right: 8px;">
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Secondo Contatto</div>
                <div style="font-weight: 800; font-size: 12px; color: #0f172a;">${g2Nome}${g2Rel}</div>
                <div style="font-size: 13px; font-weight: 800; color: #334155; margin-top: 2px; font-family: monospace;">
                  📞 ${g2Tel}
                </div>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Medico Curante / Pediatra</div>
                <div style="font-weight: 700; color: #0f172a;">${medNome}</div>
                <div style="font-size: 11px; color: #475569; margin-top: 1px;">
                  📞 ${medTel}
                </div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 120px 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="border: 2px solid #b91c1c; border-radius: 8px; background: #fff5f5; padding: 8px; text-align: center; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #991b1b;">Gruppo Sangue</div>
              <div style="font-size: 26px; font-weight: 900; color: #b91c1c; line-height: 1.1; margin-top: 2px;">
                ${gruppoSangue}
              </div>
            </div>

            <div style="border: 1.5px solid ${allergie ? '#ef4444' : '#e5e7eb'}; background: ${allergie ? '#fef2f2' : '#ffffff'}; border-radius: 8px; padding: 8px 12px;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${allergie ? '#b91c1c' : '#4b5563'}; display: flex; items-center; justify-content: space-between;">
                <span>⚠️ Allergie (Farmaci/Cibo/Insetti)</span>
                ${allergie ? '<span style="color:#dc2626; font-weight:900;">ATTENZIONE</span>' : ''}
              </div>
              <div style="font-size: 12px; font-weight: ${allergie ? '700' : '400'}; color: ${allergie ? '#991b1b' : '#6b7280'}; margin-top: 4px; min-height: 38px;">
                ${allergie || 'Nessuna allergia nota segnalata.'}
              </div>
            </div>

            <div style="border: 1.5px solid ${intolleranze ? '#f59e0b' : '#e5e7eb'}; background: ${intolleranze ? '#fffbeb' : '#ffffff'}; border-radius: 8px; padding: 8px 12px;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${intolleranze ? '#b45309' : '#4b5563'}; display: flex; items-center; justify-content: space-between;">
                <span>🍽️ Intolleranze & Dieta</span>
                ${intolleranze ? '<span style="color:#d97706; font-weight:800;">DIETA SPECIFICA</span>' : ''}
              </div>
              <div style="font-size: 12px; font-weight: ${intolleranze ? '700' : '400'}; color: ${intolleranze ? '#92400e' : '#6b7280'}; margin-top: 4px; min-height: 38px;">
                ${intolleranze || 'Nessuna esigenza alimentare specifica.'}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
                💊 Terapie Farmacologiche in Corso & Modalità Assunzione
              </div>
              <div style="font-size: 11px; color: ${farmaci ? '#0f172a' : '#64748b'}; font-weight: ${farmaci ? '600' : '400'}; min-height: 36px;">
                ${farmaci || 'Nessuna terapia farmacologica continuativa indicata.'}
              </div>
            </div>

            <div style="border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #ffffff;">
              <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; margin-bottom: 4px;">
                💉 Vaccinazioni & Richiamo Antitetanica
              </div>
              <div style="font-size: 11px; color: #0f172a; min-height: 36px;">
                ${vaccinazioni || 'Regolari secondo calendario vaccinale nazionale.'}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
            <div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Certificato Medico Non Agonistico</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                <span style="font-weight: 800; font-size: 12px; color: ${certColor};">
                  ● ${certStatusLabel}
                </span>
                <span style="color: #475569;">(Scadenza: <strong>${certScadenza}</strong>)</span>
              </div>
              ${certNote ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">Note: ${certNote}</div>` : ''}
            </div>

            <div>
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b;">Consensi e Altre Indicazioni</div>
              <div style="display: flex; gap: 12px; margin-top: 2px; font-size: 11px;">
                <span>Privacy: <strong>${privacyOk ? '✅ Depositata' : '❌ Mancante'}</strong></span>
                <span>Scheda Firmata: <strong>${schedaFirmataOk ? '✅ Depositata' : '❌ Mancante'}</strong></span>
              </div>
              ${altro ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;">Altro: ${altro}</div>` : ''}
            </div>
          </div>

          <div style="border: 1.5px solid #94a3b8; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
            <div style="background: #f1f5f9; padding: 4px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #94a3b8; display: flex; justify-content: space-between;">
              <span>📋 Registro Somministrazioni Farmaci / Interventi Sanitari al Campo (A cura dei Capi)</span>
              <span style="font-weight: normal; color: #64748b;">Compilare ad ogni evento</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; color: #475569;">
                  <th style="padding: 4px 6px; text-align: left; width: 85px; border-right: 1px solid #e2e8f0;">Data e Ora</th>
                  <th style="padding: 4px 6px; text-align: left; width: 140px; border-right: 1px solid #e2e8f0;">Sintomo / Malessere</th>
                  <th style="padding: 4px 6px; text-align: left; border-right: 1px solid #e2e8f0;">Farmaco somministrato & Dosaggio</th>
                  <th style="padding: 4px 6px; text-align: left; width: 100px; border-right: 1px solid #e2e8f0;">Capo Resp.</th>
                  <th style="padding: 4px 6px; text-align: left; width: 70px;">Firma</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0; height: 22px;">
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td></td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0; height: 22px;">
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td></td>
                </tr>
                <tr style="height: 22px;">
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td style="border-right: 1px solid #e2e8f0;"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #475569;">
            <div>
              <div>Firma del Genitore / Esercente potestà:</div>
              <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-top: 2px;"></div>
            </div>
            <div style="text-align: right;">
              <div>Firma del Capo Reparto / Capocampo:</div>
              <div style="border-bottom: 1px solid #94a3b8; height: 26px; margin-top: 2px;"></div>
            </div>
          </div>

        </div>
    `;
}

/**
 * Trova l'attività imminente o più rilevante rispetto a una data di riferimento
 * @param {Array} activities - Elenco attività
 * @param {Date|string} refDate - Data di riferimento (default: now)
 * @returns {Object|null} Oggetto riassuntivo attività imminente e countdown
 */
export function findUpcomingActivity(activities = [], refDate = new Date()) {
    if (!Array.isArray(activities) || activities.length === 0) return null;
    const ref = toJsDate(refDate);
    if (!ref || isNaN(ref.getTime())) return null;

    const startOfRef = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);

    const validActivities = activities
        .filter(a => a && a.data)
        .map(a => {
            const d = toJsDate(a.data);
            const dEnd = a.dataFine ? toJsDate(a.dataFine) : d;
            return {
                raw: a,
                startDate: d,
                endDate: dEnd,
                valid: d && !isNaN(d.getTime())
            };
        })
        .filter(a => a.valid)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (validActivities.length === 0) return null;

    const upcoming = validActivities.filter(a => {
        const checkEnd = new Date(a.endDate);
        checkEnd.setHours(23, 59, 59, 999);
        return checkEnd.getTime() >= startOfRef.getTime();
    });

    let chosen = null;
    let isPast = false;

    if (upcoming.length > 0) {
        chosen = upcoming[0];
    } else {
        chosen = validActivities[validActivities.length - 1];
        isPast = true;
    }

    const actDay = new Date(chosen.startDate.getFullYear(), chosen.startDate.getMonth(), chosen.startDate.getDate(), 0, 0, 0, 0);
    const diffTime = actDay.getTime() - startOfRef.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;
    const isTomorrow = diffDays === 1;
    const isFuture = diffDays >= 0;

    let countdownText = '';
    let badgeText = '';
    let badgeClass = '';

    if (isToday) {
        countdownText = "L'attività si svolge oggi!";
        badgeText = '🔴 OGGI';
        badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 animate-pulse';
    } else if (isTomorrow) {
        countdownText = "Manca 1 giorno all'attività";
        badgeText = '⚡ DOMANI';
        badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300';
    } else if (diffDays > 1) {
        countdownText = `Mancano ${diffDays} giorni all'attività`;
        badgeText = `⏳ Tra ${diffDays} giorni`;
        badgeClass = 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300';
    } else {
        const absDays = Math.abs(diffDays);
        countdownText = `Svolta ${absDays === 1 ? 'ieri' : `${absDays} giorni fa`}`;
        badgeText = `Svolta ${absDays} gg fa`;
        badgeClass = 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300';
    }

    return {
        activity: chosen.raw,
        startDate: chosen.startDate,
        endDate: chosen.endDate,
        isFuture,
        isPast,
        isToday,
        isTomorrow,
        diffDays,
        countdownText,
        badgeText,
        badgeClass
    };
}

/**
 * Calcola i KPI operativi, finanziari e di sicurezza sanitaria per una determinata attività
 * @param {Object} activity - Oggetto attività
 * @param {Array} scouts - Tutti gli esploratori
 * @param {Array} presences - Tutte le presenze
 * @param {Date|string} refDate - Data di riferimento
 * @returns {Object} Riepilogo completo di presenze, quote e conformità medica
 */
export function computeActivityDashboardKPIs(activity, scouts = [], presences = [], refDate = new Date()) {
    if (!activity) return null;

    const activeScouts = (Array.isArray(scouts) ? scouts : []).filter(s => !s.archived);
    const totalActiveScouts = activeScouts.length;
    const actId = activity.id;
    const actDate = toJsDate(activity.data) || toJsDate(refDate);

    const actPresences = (Array.isArray(presences) ? presences : []).filter(p => p.attivitaId === actId);
    const presenceMap = new Map();
    actPresences.forEach(p => {
        presenceMap.set(p.esploratoreId, p);
    });

    const presentScouts = [];
    const absentScouts = [];
    const unrecordedScouts = [];

    activeScouts.forEach(s => {
        const p = presenceMap.get(s.id);
        if (!p || p.stato === 'NR' || !p.stato) {
            unrecordedScouts.push(s);
        } else if (p.stato === 'Presente') {
            presentScouts.push({ ...s, presence: p });
        } else if (p.stato === 'Assente') {
            absentScouts.push({ ...s, presence: p });
        } else {
            unrecordedScouts.push(s);
        }
    });

    const presentCount = presentScouts.length;
    const absentCount = absentScouts.length;
    const unrecordedCount = unrecordedScouts.length;
    const attendancePercentage = totalActiveScouts > 0 ? Math.round((presentCount / totalActiveScouts) * 100) : 0;

    const cost = Number(activity.costo) || 0;
    const isPaidActivity = cost > 0;
    const paidScouts = presentScouts.filter(s => s.presence && s.presence.pagato);
    const unpaidScouts = presentScouts.filter(s => !s.presence || !s.presence.pagato);
    const paidCount = paidScouts.length;
    const unpaidCount = unpaidScouts.length;
    const paymentPercentage = presentCount > 0 ? Math.round((paidCount / presentCount) * 100) : 0;
    const totalCollected = Math.round(paidCount * cost * 100) / 100;
    const totalExpected = Math.round(presentCount * cost * 100) / 100;
    const totalPending = Math.round(unpaidCount * cost * 100) / 100;

    const checkDate = actDate && !isNaN(actDate.getTime()) ? actDate : new Date();
    const medicalAlerts = [];

    presentScouts.forEach(s => {
        const med = getScoutMedicalStatus(s, checkDate);
        if (!med.isCompliant) {
            let warningType = 'docs';
            let label = 'Documenti mancanti';
            if (med.certStatus === 'expired') {
                warningType = 'expired';
                label = `Certificato scaduto (${Math.abs(med.daysRemaining || 0)} gg prima dell'attività)`;
            } else if (med.certStatus === 'missing') {
                warningType = 'missing_cert';
                label = 'Certificato medico mai consegnato';
            } else if (med.certStatus === 'expiring') {
                warningType = 'expiring';
                label = `Certificato in scadenza (${med.daysRemaining} gg rimanenti)`;
            }

            medicalAlerts.push({
                scout: s,
                medicalStatus: med,
                warningType,
                label,
                missingDocuments: med.missingDocuments
            });
        }
    });

    const isSafetyCompliant = medicalAlerts.length === 0;

    return {
        activity,
        totalActiveScouts,
        presentCount,
        absentCount,
        unrecordedCount,
        attendancePercentage,
        presentScouts,
        absentScouts,
        unrecordedScouts,
        cost,
        isPaidActivity,
        paidCount,
        unpaidCount,
        paymentPercentage,
        totalCollected,
        totalExpected,
        totalPending,
        unpaidScouts,
        medicalAlerts,
        isSafetyCompliant
    };
}
