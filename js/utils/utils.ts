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
export function escapeHtml(str: string | null | undefined): string {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Converts a Firestore Timestamp or Date string to a JS Date object
 * @param value - The value to convert
 * @returns The JS Date object
 */
export function toJsDate(value: any): Date {
    if (value instanceof Date) return value;
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
export function formatTimeAgo(date: Date | null | undefined): string {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const min = Math.floor(diffMs / 60000);

    if (min < 60) return `${min} min fa`;
    if (min < 1440) return `${Math.floor(min / 60)} h fa`;
    return date.toLocaleDateString();
}

const debounceTimers: Record<string, number> = {};

/**
 * Debounces a function with rate limiting
 * @param key - Unique key for the rate limit
 * @param fn - Function to execute
 * @param delay - Delay in milliseconds
 */
export function debounceWithRateLimit(key: string, fn: () => void, delay: number): void {
    if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
    }
    debounceTimers[key] = window.setTimeout(() => {
        delete debounceTimers[key];
        fn();
    }, delay);
}

/**
 * Formats a Date object to YYYY-MM-DD string for input[type=date]
 */
export function toYyyyMmDd(date: any): string {
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
 */
export function generateScoutSentieroHtml(scout: any, challenges: Record<string, any> = {}, specialitaList: any[] = []): string {
    if (!scout) return '';

    const fmtDate = (d: any) => {
        if (!d) return '';
        try {
            const date = d && typeof d.toDate === 'function' ? d.toDate() : (d instanceof Date ? d : new Date(d));
            return isNaN(date.getTime()) ? '' : date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return '';
        }
    };

    const isCheckDone = (v: any) => {
        if (!v) return false;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'object' && v.done) return true;
        if (typeof v === 'string' && v.trim() !== '') return true;
        return false;
    };

    const getTracciaDate = (v: any) => {
        if (!v) return '';
        if (typeof v === 'object' && v.date) return fmtDate(v.date);
        if (typeof v === 'string') return fmtDate(v);
        return '';
    };

    const nomeCompleto = `${scout.nome || ''} ${scout.cognome || ''}`.trim() || 'Esploratore';
    const pattuglia = scout.pv_pattuglia ? `Pattuglia ${scout.pv_pattuglia}` : '';

    let ruoloPattuglia = '';
    const vcpVal = (scout.pv_vcp_cp || '').trim().toUpperCase();
    if (vcpVal === 'CP' || vcpVal === 'CAPO PATTUGLIA') {
        ruoloPattuglia = 'Capo Pattuglia';
    } else if (vcpVal === 'VCP' || vcpVal === 'VICE CAPO PATTUGLIA') {
        ruoloPattuglia = 'Vice Capo Pattuglia';
    } else if (scout.pv_vcp_cp && scout.pv_vcp_cp.trim()) {
        ruoloPattuglia = scout.pv_vcp_cp.trim();
    }

    const isT1 = isCheckDone(scout.pv_traccia1);
    const isT2 = isCheckDone(scout.pv_traccia2);
    const isT3 = isCheckDone(scout.pv_traccia3);

    let passoRaggiunto = 0;
    let prossimoPasso: number | null = 1;

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

    const direzioniLabels: Record<string, string> = { io: 'IO', al: 'Gli Altri', mt: 'La Mia Traccia' };

    const getSfidaText = (passo: number, dir: string, code: string) => {
        if (!code || !challenges) return '';
        const dirUpper = dir.toUpperCase();
        const sfide = challenges[String(passo)]?.[dirUpper] || [];
        const sfida = sfide.find((s: any) => s.code === code);
        return sfida ? sfida.text : '';
    };

    // Gestione Specialità (Progressione Orizzontale)
    const specialitaListArray = Array.isArray(scout.specialita) ? scout.specialita : [];
    const isSpecOttenuta = (sp: any) => {
        if (!sp) return false;
        if (typeof sp === 'string') return false;
        return !!(sp.ottenuta || sp.brevetto || sp.consegnata || (!('ottenuta' in sp) && sp.data));
    };
    const getSpecName = (sp: any) => typeof sp === 'string' ? sp : (sp?.nome || '');
    const getSpecData = (sp: any) => {
        if (!sp) return null;
        return sp.data || null;
    };

    const getSpecTime = (sp: any): number => {
        if (!sp || typeof sp === 'string') return 0;
        const raw = sp.data || sp.dataConseguimento || sp.p3_data || sp.cr_data || sp.p2_data || sp.p1_data;
        if (!raw) return 0;
        try {
            const d = raw && typeof raw.toDate === 'function' ? raw.toDate() : (raw instanceof Date ? raw : new Date(raw));
            return isNaN(d.getTime()) ? 0 : d.getTime();
        } catch {
            return 0;
        }
    };

    const specialitaOttenute = specialitaListArray.filter((sp: any) => getSpecName(sp) && isSpecOttenuta(sp));
    const specialitaDaOttenere = specialitaListArray.filter((sp: any) => getSpecName(sp) && !isSpecOttenuta(sp));

    // Metti le specialità conseguite in ordine di conseguimento (cronologico crescente)
    specialitaOttenute.sort((a: any, b: any) => {
        const timeA = getSpecTime(a);
        const timeB = getSpecTime(b);
        if (timeA && timeB) return timeA - timeB;
        if (timeA) return -1;
        if (timeB) return 1;
        return getSpecName(a).localeCompare(getSpecName(b));
    });

    const getSpecialitaColors = (spName: string) => {
        const specDef = (specialitaList || []).find((s: any) => s && s.nome && s.nome.trim().toLowerCase() === spName.trim().toLowerCase());
        return {
            bordo: specDef?.bordo_colore || '#15803d',
            sfondo: specDef?.sfondo_colore || '#ffffff'
        };
    };

    const renderSpecSquares = (spName: string) => {
        const colors = getSpecialitaColors(spName);
        const bordoColore = colors.bordo;
        const sfondoColore = colors.sfondo;

        return `<span style="display: inline-flex; align-items: center; gap: 3px; vertical-align: middle; margin-right: 4px;"><span style="display: inline-block; width: 10px; height: 10px; border: 2px solid ${bordoColore}; background: transparent; border-radius: 2px; box-sizing: border-box;" title="Bordo: ${bordoColore}"></span><span style="display: inline-block; width: 10px; height: 10px; background-color: ${sfondoColore}; border: 1px solid ${sfondoColore === 'white' ? '#9ca3af' : sfondoColore}; border-radius: 2px; box-sizing: border-box;" title="Sfondo: ${sfondoColore}"></span></span>`;
    };

    let html = `
      <div class="sentiero-sheet-page" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.35; padding: 10px 14px; background: #ffffff; max-height: 278mm; page-break-inside: avoid; break-inside: avoid;">
        <!-- Header Scheda Compatto -->
        <div style="border-bottom: 2px solid #15803d; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #15803d;">Reparto Maori · Scheda di Progressione</div>
            <h1 style="font-size: 20px; font-weight: 800; margin: 2px 0 0 0; color: #111827; line-height: 1.2;">
              Il sentiero di ${scout.nome || nomeCompleto}
              ${ruoloPattuglia ? `<span style="font-size: 13px; font-weight: 600; color: #1e40af; margin-left: 6px;">(${ruoloPattuglia})</span>` : ''}
            </h1>
          </div>
          <div style="text-align: right;">
            <div style="display: flex; gap: 4px; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
              ${pattuglia ? `<span style="display: inline-block; background: #fef3c7; color: #92400e; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 9999px; border: 1px solid #fde68a;">${pattuglia}</span>` : ''}
              ${ruoloPattuglia ? `<span style="display: inline-block; background: #dbeafe; color: #1e40af; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 9999px; border: 1px solid #bfdbfe;">${ruoloPattuglia}</span>` : ''}
            </div>
            <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">Data: ${new Date().toLocaleDateString('it-IT')}</div>
          </div>
        </div>

        <!-- PROGRESSIONE VERTICALE (striscia orizzontale a tutta larghezza) -->
        <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; background: #f9fafb;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
            <div style="font-size: 11px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em;">
              Progressione Verticale
            </div>
            ${versoCosa ? `
              <div style="font-size: 11px; font-weight: 700; color: #1e40af;">
                Stai camminando verso: <span style="text-decoration: underline;">${versoCosa}</span>
              </div>
            ` : (passoRaggiunto === 3 ? `
              <div style="font-size: 11px; font-weight: 700; color: #15803d;">
                Tutti i 3 Passi sono stati completati con successo!
              </div>
            ` : '')}
          </div>

          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; font-size: 10.5px;">
            <div style="padding: 4px 5px; background: white; border-radius: 4px; border: 1px solid ${scout.pv_promessa ? '#bbf7d0' : '#e5e7eb'};">
              <strong>Promessa:</strong><br>${scout.pv_promessa ? `☑ Fatta il ${fmtDate(scout.pv_promessa)}` : '☐ Da fare'}
            </div>
            <div style="padding: 4px 5px; background: white; border-radius: 4px; border: 1px solid ${isT1 ? '#bbf7d0' : '#e5e7eb'};">
              <strong>1° Passo:</strong><br>${isT1 ? `☑ Raggiunto ${getTracciaDate(scout.pv_traccia1)}` : '☐ Da raggiungere'}
            </div>
            <div style="padding: 4px 5px; background: white; border-radius: 4px; border: 1px solid ${isT2 ? '#bbf7d0' : '#e5e7eb'};">
              <strong>2° Passo:</strong><br>${isT2 ? `☑ Raggiunto ${getTracciaDate(scout.pv_traccia2)}` : '☐ Da raggiungere'}
            </div>
            <div style="padding: 4px 5px; background: white; border-radius: 4px; border: 1px solid ${isT3 ? '#bbf7d0' : '#e5e7eb'};">
              <strong>3° Passo:</strong><br>${isT3 ? `☑ Raggiunto ${getTracciaDate(scout.pv_traccia3)}` : '☐ Da raggiungere'}
            </div>
            <div style="padding: 4px 5px; background: white; border-radius: 4px; border: 1px solid ${scout.pv_giglio_data ? '#bbf7d0' : '#e5e7eb'};">
              <strong>Giglio e Trifoglio:</strong><br>${scout.pv_giglio_data ? `☑ Conseguito il ${fmtDate(scout.pv_giglio_data)}${scout.pv_giglio_note ? ' (' + scout.pv_giglio_note + ')' : ''}` : '☐ Non conseguito'}
            </div>
          </div>
        </div>

        <!-- GRIGLIA A 2 COLONNE: SFIDE (A SINISTRA) & SPECIALITÀ (A DESTRA) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: start;">
          
          <!-- COLONNA SINISTRA: SFIDE DA SUPERARE -->
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #ffffff;">
            <div style="font-size: 11.5px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; border-bottom: 1px solid #fef3c7; padding-bottom: 4px;">
              Sfide da Superare ${prossimoPasso ? `(per il ${prossimoPasso}° Passo)` : ''}
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
                  <div style="margin-bottom: 6px; padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 4px; background: ${isCompl ? '#f0fdf4' : '#fafafa'}; display: flex; align-items: flex-start; gap: 8px;">
                    <div style="font-size: 15px; line-height: 1; min-width: 18px; color: ${isCompl ? '#16a34a' : '#6b7280'};">${isCompl ? '☑' : '☐'}</div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 11px; color: #111827;">${direzioniLabels[dir]} — Codice: ${code}</div>
                      <div style="font-size: 10.5px; color: #374151; line-height: 1.35; margin-top: 1px;">${sfidaText || 'Nessuna descrizione'}</div>
                      ${dataSfida ? `<div style="font-size: 9.5px; color: #15803d; font-weight: 600; margin-top: 2px;">Completata il: ${fmtDate(dataSfida)}</div>` : ''}
                    </div>
                  </div>
                `;
            }
        });

        const sfidaBianca = scout[`pv_sfida_bianca_${prossimoPasso}`];
        if (sfidaBianca) {
            hasSfide = true;
            html += `
              <div style="margin-bottom: 6px; padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 4px; background: #fafafa; display: flex; align-items: flex-start; gap: 8px;">
                <div style="font-size: 15px; line-height: 1; min-width: 18px; color: #6b7280;">☐</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 700; font-size: 11px; color: #111827;">Sfida Bianca (Personale)</div>
                  <div style="font-size: 10.5px; color: #374151; line-height: 1.35; margin-top: 1px;">${sfidaBianca}</div>
                </div>
              </div>
            `;
        }

        if (!hasSfide) {
            html += `<div style="color: #6b7280; font-style: italic; font-size: 11px; padding: 4px 0;">Nessuna sfida ancora selezionata per questo passo.</div>`;
        }
    } else {
        html += `<div style="color: #15803d; font-weight: 600; font-size: 12px; padding: 6px 0;">Tutti i 3 Passi sono stati completati con successo!</div>`;
    }

    html += `
          </div>

          <!-- COLONNA DESTRA: SPECIALITÀ (PROGRESSIONE ORIZZONTALE) -->
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; background: #ffffff;">
            <div style="font-size: 11.5px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; border-bottom: 1px solid #e0e7ff; padding-bottom: 4px;">
              Progressione Orizzontale (Specialità)
            </div>

            <!-- SOTTOSEZIONE: SPECIALITÀ GIÀ CONQUISTATE -->
            <div style="margin-bottom: 8px; padding: 6px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
              <div style="font-size: 10.5px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
                <span>SPECIALITÀ GIÀ CONQUISTATE</span>
                <span style="font-size: 10px; color: #15803d; font-weight: 700;">${specialitaOttenute.length}</span>
              </div>
              ${specialitaOttenute.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${specialitaOttenute.map((sp: any) => {
                      const spName = getSpecName(sp);
                      const spDate = getSpecData(sp);
                      return `
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: #ffffff; border: 1px solid #86efac; color: #14532d; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                          ${renderSpecSquares(spName)}
                          <span>${spName}</span>
                          ${spDate ? `<span style="font-size: 9.5px; font-weight: 600; color: #15803d;">(${fmtDate(spDate)})</span>` : ''}
                        </div>
                      `;
                  }).join('')}
                </div>
                ${specialitaOttenute.some((sp: any) => sp.note) ? `
                  <div style="font-size: 9.5px; color: #4b5563; background: #ffffff; padding: 4px 6px; border-radius: 4px; border: 1px solid #dcfce7; margin-top: 5px;">
                    ${specialitaOttenute.filter((sp: any) => sp.note).map((sp: any) => `<div><strong>${getSpecName(sp)}:</strong> ${sp.note}</div>`).join('')}
                  </div>
                ` : ''}
              ` : `
                <div style="font-size: 10.5px; color: #6b7280; font-style: italic;">Nessuna specialità ancora conquistata.</div>
              `}
            </div>

            <!-- SOTTOSEZIONE: SPECIALITÀ IN CORSO E PROVE DA SUPERARE -->
            <div>
              <div style="font-size: 10.5px; font-weight: 700; color: #374151; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.03em;">
                SPECIALITÀ IN CORSO E PROVE DA SUPERARE:
              </div>
              ${specialitaDaOttenere.length > 0 ? `
                <div style="display: grid; gap: 6px;">
                  ${specialitaDaOttenere.map((sp: any) => {
                      const spName = getSpecName(sp);
                      const specDef = (specialitaList || []).find(s => s && s.nome === spName);
                      const prove = specDef?.prove || [
                          { nome: 'Prova 1', id: 'p1' },
                          { nome: 'Prova 2', id: 'p2' },
                          { nome: 'Prova 3', id: 'p3' }
                      ];

                      return `
                        <div style="border: 1px solid #e5e7eb; border-radius: 5px; padding: 6px 8px; background: #fafafa;">
                          <div style="font-weight: 700; font-size: 11px; color: #1f2937; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="display: inline-flex; align-items: center;">
                              ${renderSpecSquares(spName)}
                              <span>${spName}</span>
                            </span>
                            ${sp.note ? `<span style="font-size: 9.5px; font-weight: normal; color: #6b7280; font-style: italic;">Note: ${sp.note}</span>` : ''}
                          </div>
                          <div style="display: grid; gap: 3px;">
                            ${prove.map((prova: any) => {
                                const pData = sp[`${prova.id}_data`];
                                const pDone = isCheckDone(pData);
                                return `
                                  <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 10px; background: white; padding: 3px 5px; border-radius: 3px; border: 1px solid #f3f4f6;">
                                    <span style="font-size: 12px; line-height: 1; color: ${pDone ? '#16a34a' : '#9ca3af'};">${pDone ? '☑' : '☐'}</span>
                                    <div style="flex: 1; min-width: 0; line-height: 1.25;">
                                      <strong style="color: #374151;">${prova.nome}:</strong> ${prova.text || ''}
                                      ${pData ? `<span style="color: #15803d; font-weight: 600; margin-left: 4px;">(Superata il: ${fmtDate(pData)})</span>` : ''}
                                    </div>
                                  </div>
                                `;
                            }).join('')}
                            ${(sp.cr_text || sp.cr_data) ? `
                              <div style="display: flex; align-items: flex-start; gap: 6px; font-size: 10px; background: white; padding: 3px 5px; border-radius: 3px; border: 1px solid #f3f4f6;">
                                <span style="font-size: 12px; line-height: 1; color: ${sp.cr_data ? '#16a34a' : '#9ca3af'};">${sp.cr_data ? '☑' : '☐'}</span>
                                <div style="flex: 1; min-width: 0; line-height: 1.25;">
                                  <strong style="color: #374151;">Prova stabilita dal Consiglio di Reparto:</strong> ${sp.cr_text || ''}
                                  ${sp.cr_data ? `<span style="color: #15803d; font-weight: 600; margin-left: 4px;">(${fmtDate(sp.cr_data)})</span>` : ''}
                                </div>
                              </div>
                            ` : ''}
                          </div>
                        </div>
                      `;
                  }).join('')}
                </div>
              ` : `
                <div style="font-size: 10.5px; color: #6b7280; font-style: italic;">Nessuna specialità attualmente in corso di svolgimento.</div>
              `}
            </div>
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
export function getScoutYear(date: any): string | null {
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
export function getScoutYearDateRange(scoutYearStr: string): { start: Date; end: Date } | null {
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
export function getCurrentScoutYear(refDate: any = new Date()): string {
    return getScoutYear(refDate) || '2025/2026';
}

/**
 * Extracts and returns all unique scout years from activities, sorted descending
 */
export function getAllScoutYears(activities: any[] = []): string[] {
    const yearsSet = new Set<string>();
    const currentYear = getCurrentScoutYear();
    yearsSet.add(currentYear);

    if (Array.isArray(activities)) {
        activities.forEach((act: any) => {
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
export function isActivityInScoutYear(activity: any, scoutYearStr: string): boolean {
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
export function getUpcomingActivities(activities: any[] = [], daysAhead: number = 3, refDate: any = new Date()): any[] {
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
export function getPendingPaymentsByActivity(activities: any[] = [], presences: any[] = []): Array<{ activity: any; pendingPresences: any[]; pendingCount: number; totalAmount: number }> {
    if (!Array.isArray(activities) || !Array.isArray(presences)) return [];

    const results: Array<{ activity: any; pendingPresences: any[]; pendingCount: number; totalAmount: number }> = [];

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
export function getUpcomingBirthdays(scouts: any[] = [], daysAhead: number = 3, refDate: any = new Date()): Array<{ scout: any; daysUntil: number; birthdayDate: Date; turningAge?: number }> {
    if (!Array.isArray(scouts)) return [];
    const base = toJsDate(refDate);
    if (!base || isNaN(base.getTime())) return [];

    const currentYear = base.getFullYear();
    const today = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);

    const results: Array<{ scout: any; daysUntil: number; birthdayDate: Date; turningAge?: number }> = [];

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
 * Medical & Health document status
 */
export interface ScoutMedicalStatus {
    certStatus: 'valid' | 'expiring' | 'expired' | 'missing';
    statusLabel: string;
    color: 'green' | 'yellow' | 'red';
    daysRemaining: number | null;
    rawDate: string;
    formattedDate: string;
    docPriv: boolean;
    docSan: boolean;
    isCompliant: boolean;
    missingDocuments: string[];
    badgeClass: string;
}

/**
 * Item in the unified deadlines list
 */
export interface ScoutDeadline {
    id: string;
    originalId: string;
    type: 'activity' | 'payment' | 'birthday' | 'custom' | 'medical';
    titolo: string;
    dataScadenza: string;
    dueDate: Date | null;
    daysUntil: number;
    categoria: string;
    descrizione: string;
    status: 'scaduta' | 'oggi' | 'imminente' | 'futura' | 'completata';
    isCustom: boolean;
    completata: boolean;
    priorita?: 'Bassa' | 'Media' | 'Alta';
    url?: string;
    costo?: number;
    luogo?: string;
    pendingCount?: number;
    totalAmount?: number;
    turningAge?: number;
    customData?: any;
    scoutId?: string;
    scout?: any;
    medStatus?: ScoutMedicalStatus;
}

/**
 * Extracts and aggregates all deadlines for a given scout year:
 * - Activities in the scout year
 * - Unpaid dues on activities with costo > 0
 * - Scout birthdays in the scout year
 * - Custom deadlines created by users
 */
export function getAllScoutYearDeadlines(options: {
    scoutYear: string;
    activities?: any[];
    presences?: any[];
    scouts?: any[];
    customDeadlines?: any[];
    refDate?: any;
}): ScoutDeadline[] {
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

    const deadlines: ScoutDeadline[] = [];

    const getDaysDiff = (targetDate: Date | null): number => {
        if (!targetDate || isNaN(targetDate.getTime())) return 0;
        const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
        return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getStatus = (days: number, completed: boolean): 'scaduta' | 'oggi' | 'imminente' | 'futura' | 'completata' => {
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
export function getScoutMedicalStatus(scout: any, refDate: any = new Date()): ScoutMedicalStatus {
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

    const certDate = scout.san_cert_scadenza ? toJsDate(scout.san_cert_scadenza) : null;
    let daysRemaining: number | null = null;
    let rawDate = '';
    let formattedDate = '';
    let certStatus: 'valid' | 'expiring' | 'expired' | 'missing' = 'missing';
    let statusLabel = 'Mancante';
    let color: 'green' | 'yellow' | 'red' = 'red';
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

    const docPriv = Boolean(scout.doc_priv);
    const docSan = Boolean(scout.doc_san);
    const missingDocuments: string[] = [];

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
export function generateWhatsAppReminderUrl(options: {
    scoutNome?: string;
    scadenzaStr?: string;
    telGenitore?: string;
    certStatus?: string;
    missingDocs?: string[];
} = {}): { url: string; message: string; phone: string } {
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


