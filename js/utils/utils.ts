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
            const date = d && typeof d.toDate === 'function' ? d.toDate() : new Date(d);
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
    const specialitaOttenute = specialitaListArray.filter((sp: any) => sp && sp.nome && sp.ottenuta);
    const specialitaDaOttenere = specialitaListArray.filter((sp: any) => sp && sp.nome && !sp.ottenuta);

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
              ${specialitaOttenute.map((sp: any) => `
                <span style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-weight: 600; font-size: 12px; padding: 3px 8px; border-radius: 6px;">
                  🏅 ${sp.nome} ${sp.data ? `(${fmtDate(sp.data)})` : ''}
                </span>
              `).join('')}
            </div>
            ${specialitaOttenute.some((sp: any) => sp.note) ? `
              <div style="font-size: 11px; color: #4b5563; background: #f9fafb; padding: 6px 10px; border-radius: 6px; border: 1px solid #f3f4f6; margin-top: 4px;">
                ${specialitaOttenute.filter((sp: any) => sp.note).map((sp: any) => `<div><em>${sp.nome}:</em> ${sp.note}</div>`).join('')}
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
              ${specialitaDaOttenere.map((sp: any) => {
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
                        ${prove.map((prova: any) => {
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
