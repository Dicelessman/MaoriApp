// @ts-nocheck
/**
 * UI Controller - Gestore interfaccia utente
 * @module ui/ui
 */
import { DATA } from '../data/data-facade.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, getToken, onMessage, collection, doc, getDocs, addDoc, setDoc, updateDoc, getDoc, query, limit, orderBy, where, Timestamp } from '../core/firebase.js';
import { APP_VERSION, THEME } from '../utils/constants.js';
import {
    escapeHtml, toJsDate, formatTimeAgo, debounceWithRateLimit,
    getScoutYear, getScoutYearDateRange, getCurrentScoutYear, getAllScoutYears, isActivityInScoutYear,
    getUpcomingActivities, getPendingPaymentsByActivity, getUpcomingBirthdays,
    getScoutMedicalStatus, generateWhatsAppReminderUrl,
    findUpcomingActivity, computeActivityDashboardKPIs
} from '../utils/utils.js';
import { setupFormValidation, validateForm, validateFieldValue, checkDataIntegrity } from '../utils/validation.js';
export const UI = {
    appVersion: APP_VERSION,
    selectedStaffId: null,
    staffToDeleteId: null,
    scoutToDeleteId: null,
    activityToDeleteId: null,
    state: { scouts: [], staff: [], activities: [], presences: [] },
    currentUser: null,
    getScoutYear,
    getScoutYearDateRange,
    getCurrentScoutYear,
    getAllScoutYears,
    isActivityInScoutYear,
    getUpcomingActivities,
    getPendingPaymentsByActivity,
    getUpcomingBirthdays,
    getScoutMedicalStatus,
    generateWhatsAppReminderUrl,
    findUpcomingActivity,
    computeActivityDashboardKPIs,
    sendMedicalWhatsAppReminder(scoutId) {
        const scout = (this.state.scouts || []).find(s => s.id === scoutId);
        if (!scout) {
            this.showToast('Esploratore non trovato', { type: 'error' });
            return;
        }
        const med = this.getScoutMedicalStatus ? this.getScoutMedicalStatus(scout) : null;
        const tel = scout.ct_g1_tel || scout.anag_telefono || scout.ct_g2_tel || '';
        const wa = this.generateWhatsAppReminderUrl ? this.generateWhatsAppReminderUrl({
            scoutNome: `${scout.nome || ''} ${scout.cognome || ''}`.trim(),
            scadenzaStr: med?.formattedDate || scout.san_cert_scadenza || '',
            telGenitore: tel,
            certStatus: med?.certStatus || 'expiring',
            missingDocs: med?.missingDocuments || []
        }) : null;
        if (wa && wa.url) {
            window.open(wa.url, '_blank');
        }
    },
    _printHtmlInArea(html, pdfTitle) {
        let pa = document.getElementById('printArea');
        if (!pa) {
            pa = document.createElement('div');
            pa.id = 'printArea';
            pa.style.display = 'none';
            document.body.appendChild(pa);
        }

        pa.innerHTML = html;
        pa.style.display = 'block';

        const appContainer = document.getElementById('app');
        let originalAppStyle = '';
        if (appContainer) {
            originalAppStyle = appContainer.getAttribute('style') || '';
            appContainer.style.setProperty('display', 'none', 'important');
        }

        const originalTitle = document.title;
        document.title = pdfTitle || originalTitle;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
            pa.style.display = 'none';
            pa.innerHTML = '';
            if (appContainer) {
                if (originalAppStyle) {
                    appContainer.setAttribute('style', originalAppStyle);
                } else {
                    appContainer.removeAttribute('style');
                }
            }
        }, 1000);
    },
    generateScoutMedicalSheetHtml(data) {
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
                  <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #6b7280;">Squadriglia & Ruolo</div>
                  <div style="font-size: 16px; font-weight: 800; color: #15803d;">
                    Sq. ${pattuglia}
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
    },
    async printMedicalSingle(scoutId) {
        try {
            if (!scoutId) {
                this.showToast('ID esploratore mancante', { type: 'error' });
                return;
            }
            if (!this.state || !this.state.scouts || this.state.scouts.length === 0) {
                this.state = await DATA.loadAll();
            }
            const allScouts = this.state.allScouts || this.state.scouts || [];
            const scout = allScouts.find(s => s.id === scoutId);
            if (!scout) {
                this.showToast('Esploratore non trovato', { type: 'error' });
                return;
            }
            const html = this.generateScoutMedicalSheetHtml(scout);
            this._printHtmlInArea(html, `Scheda Sanitaria - ${scout.nome || ''} ${scout.cognome || ''}`);
        } catch (e) {
            console.error('Errore stampa scheda medica:', e);
            this.showToast('Errore stampa: ' + e.message, { type: 'error', duration: 4000 });
        }
    },
    async printMedicalBatch(scoutIds = null, title = 'Cartellina Sanitaria Campo') {
        try {
            if (!this.state || !this.state.scouts || this.state.scouts.length === 0) {
                this.state = await DATA.loadAll();
            }
            const allScouts = (this.state.allScouts || this.state.scouts || []).filter(s => !s.archived);
            const targetScouts = (scoutIds && scoutIds.length > 0)
                ? scoutIds.map(id => allScouts.find(s => s.id === id)).filter(Boolean)
                : allScouts.slice().sort((a, b) => {
                    const sqA = a.pv_pattuglia || '';
                    const sqB = b.pv_pattuglia || '';
                    if (sqA !== sqB) return sqA.localeCompare(sqB, 'it');
                    const cognomeA = a.cognome || '';
                    const cognomeB = b.cognome || '';
                    return cognomeA.localeCompare(cognomeB, 'it');
                });

            if (targetScouts.length === 0) {
                this.showToast('Nessun esploratore disponibile per la stampa', { type: 'warning' });
                return;
            }

            const htmlParts = targetScouts.map((scout, i) => {
                let card = this.generateScoutMedicalSheetHtml(scout);
                if (i < targetScouts.length - 1) {
                    card += `<div style="page-break-after: always; height: 0; line-height: 0;"></div>`;
                }
                return card;
            });

            this._printHtmlInArea(htmlParts.join('\n'), title);
        } catch (e) {
            console.error('Errore stampa cartellina sanitaria:', e);
            this.showToast('Errore stampa cartellina: ' + e.message, { type: 'error', duration: 4000 });
        }
    },
    getSelectedScoutYear() {
        const prefs = this.loadUserPreferences();
        return prefs.selectedScoutYear || this.getCurrentScoutYear();
    },
    async setSelectedScoutYear(year) {
        const prefs = this.loadUserPreferences();
        prefs.selectedScoutYear = year;
        await this.saveUserPreferences(prefs);
    },
    qs(selector) { return document.querySelector(selector); },
    qsa(selector) { return document.querySelectorAll(selector); },
    // Notifiche non bloccanti
    showToast(message, opts = {}) {
        const { type = 'success', duration = 2500 } = opts || {};
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.position = 'fixed';
            container.style.right = '1rem';
            container.style.bottom = '1rem';
            container.style.zIndex = '2000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '.5rem';
            container.style.pointerEvents = 'none';
            document.body.appendChild(container);
        }
        const bg = type === 'error' ? '#dc2626' : (type === 'info' ? '#374151' : (type === 'warning' ? '#eab308' : '#16a34a'));
        // Icone SVG
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7071 5.29289C17.0976 5.68342 17.0976 6.31658 16.7071 6.70711L8.70711 14.7071C8.31658 15.0976 7.68342 15.0976 7.29289 14.7071L3.29289 10.7071C2.90237 10.3166 2.90237 9.68342 3.29289 9.29289C3.68342 8.90237 4.31658 8.90237 4.70711 9.29289L8 12.5858L15.2929 5.29289C15.6834 4.90237 16.3166 4.90237 16.7071 5.29289Z" fill="currentColor"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 11C9.44772 11 9 10.5523 9 10V6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6V10C11 10.5523 10.5523 11 10 11ZM10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15Z" fill="currentColor"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14C11 14.5523 10.5523 15 10 15ZM10 11C9.44772 11 9 10.5523 9 10V6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6V10C11 10.5523 10.5523 11 10 11Z" fill="currentColor"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L2 18H18L10 2ZM10 8C10.5523 8 11 8.44772 11 9V13C11 13.5523 10.5523 14 10 14C9.44772 14 9 13.5523 9 13V9C9 8.44772 9.44772 8 10 8ZM10 16C9.44772 16 9 15.5523 9 15C9 14.4477 9.44772 14 10 14C10.5523 14 11 14.4477 11 15C11 15.5523 10.5523 16 10 16Z" fill="currentColor"/></svg>'
        };
        const toast = document.createElement('div');
        toast.style.background = bg;
        toast.style.color = 'white';
        toast.style.padding = '.75rem 1rem';
        toast.style.borderRadius = '.5rem';
        toast.style.boxShadow = '0 6px 18px rgba(0,0,0,.16)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(6px)';
        toast.style.transition = 'opacity .2s ease, transform .2s ease';
        toast.style.pointerEvents = 'auto';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '.75rem';
        toast.style.minWidth = '280px';
        toast.innerHTML = `
      <span style="display: flex; align-items: center; flex-shrink: 0;">
        ${icons[type] || icons.success}
      </span>
      <span style="flex: 1;">${message}</span>
    `;
        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });
        const remove = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(6px)';
            setTimeout(() => toast.remove(), 200);
        };
        setTimeout(remove, Math.max(1000, duration));
        toast.addEventListener('click', remove);
    },
    showLoadingOverlay(message = 'Caricamento...') {
        let overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const msgEl = overlay.querySelector('.loading-message');
            if (msgEl)
                msgEl.textContent = message;
            overlay.style.display = 'flex';
            return;
        }
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.webkitBackdropFilter = 'blur(4px)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.flexDirection = 'column';
        overlay.style.gap = '1rem';
        overlay.innerHTML = `
      <div class="loading-spinner" style="
        width: 48px;
        height: 48px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <div class="loading-message" style="
        color: white;
        font-size: 1rem;
        font-weight: 500;
      ">${message}</div>
    `;
        if (!document.getElementById('loading-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'loading-spinner-style';
            style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
        document.body.appendChild(overlay);
    },
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay)
            overlay.style.display = 'none';
    },
    setButtonLoading(button, isLoading, originalText = null) {
        if (!button)
            return;
        if (isLoading) {
            button._originalText = originalText || button.textContent;
            button.disabled = true;
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
            button.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <span style="
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid currentColor;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          "></span>
          ${button._originalText}
        </span>
      `;
        }
        else {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = '';
            button.textContent = button._originalText || originalText || '';
            delete button._originalText;
        }
    },
    createSkeletonLoader(type, count = 1, options = {}) {
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            if (type === 'table-row') {
                const colCount = options.cols || 4;
                const cols = Array(colCount).fill(0).map(() => `<td class="p-4"><div class="skeleton skeleton-text short"></div></td>`).join('');
                skeletons.push(`<tr class="skeleton-row"><td class="p-4 sticky left-0 bg-white"><div class="skeleton skeleton-text"></div></td>${cols}</tr>`);
            }
            else if (type === 'card') {
                skeletons.push(`
          <div class="skeleton bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4" style="height: ${options.height || 120}px;">
            <div class="skeleton skeleton-text mb-2"></div>
            <div class="skeleton skeleton-text short mb-2"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
          </div>
        `);
            }
            else if (type === 'list-item') {
                skeletons.push(`
          <div class="skeleton bg-white p-3 rounded border mb-2" style="height: ${options.height || 60}px;">
            <div class="skeleton skeleton-text"></div>
          </div>
        `);
            }
        }
        return skeletons.join('');
    },
    renderInBatches({ container, items, batchSize = 50, renderItem, onComplete }) {
        if (!container)
            return;
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-gray-500">Nessun elemento</div>';
            if (onComplete)
                onComplete();
            return;
        }
        // Create a unique ID for this render request
        const renderId = Symbol('renderBatch');
        container._currentRenderId = renderId;
        let index = 0;
        const total = items.length;
        const processBatch = () => {
            // Check if this render process is still the active one
            if (container._currentRenderId !== renderId)
                return;
            const end = Math.min(index + batchSize, total);
            const fragment = document.createDocumentFragment();
            for (let i = index; i < end; i++) {
                const item = items[i];
                const html = renderItem(item);
                if (typeof html === 'string') {
                    const temp = document.createElement('div');
                    temp.innerHTML = html.trim();
                    if (temp.firstElementChild) {
                        fragment.appendChild(temp.firstElementChild);
                    }
                }
                else if (html instanceof Node) {
                    fragment.appendChild(html);
                }
            }
            // Append only if we are still valid
            if (container._currentRenderId !== renderId)
                return;
            container.appendChild(fragment);
            index = end;
            if (index < total) {
                requestAnimationFrame(processBatch);
            }
            else {
                if (onComplete)
                    onComplete();
            }
        };
        requestAnimationFrame(processBatch);
    },
    async init() {
        try {
            this.setupTheme();
            DATA.useFirestore();
            console.log('UI.init: Initializing...');
            this.runConnectivityProbe();
            await this.loadSharedComponents();
            try {
                const links = ['presenze.html', 'storico-presenze.html', 'dashboard.html', 'calendario.html', 'esploratori.html', 'staff.html', 'audit-logs.html', 'preventivo.html', 'scadenze.html', 'scorte.html'];
                links.forEach(href => {
                    const l = document.createElement('link');
                    l.rel = 'prefetch';
                    l.href = href;
                    document.head.appendChild(l);
                });
            }
            catch { }
            const loginModal = this.qs('#loginModal');
            if (loginModal)
                loginModal.classList.remove('show');
            this.setupEventListeners();
            try {
                await setPersistence(DATA.adapter.auth, browserLocalPersistence);
            }
            catch (e) {
                console.warn('Auth persistence set failed:', e);
            }
            onAuthStateChanged(DATA.adapter.auth, async (user) => {
                this.currentUser = user;
                if (user) {
                    const emailEl = this.qs('#loggedInUserEmail');
                    if (emailEl) {
                        emailEl.textContent = '';
                        try {
                            emailEl.style.display = 'none';
                        }
                        catch { }
                    }
                    const logoutBtn = this.qs('#logoutButton');
                    if (logoutBtn)
                        logoutBtn.style.display = 'block';
                    this.closeModal('loginModal');
                    this.showLoadingOverlay('Caricamento dati...');
                    try {
                        this.state = await DATA.loadAll();
                        this.rebuildPresenceIndex();
                        await this.syncUserPreferences();
                        if (this.loadUserPreferences().notifications.enabled !== false) {
                            await this.initializeFCM();
                        }
                        setTimeout(() => {
                            this.checkActivityReminders();
                            this.checkPaymentReminders();
                            this.checkBirthdayReminders();
                        }, 3000);
                        const match = (this.state.staff || []).find(s => (s.email || '').toLowerCase() === (user.email || '').toLowerCase());
                        if (match) {
                            this.selectStaff(match.id);
                        }
                        else {
                            this.renderStaffSelectionList();
                            if (this.showModal)
                                this.showModal('staffSelectionModal');
                        }
                        if (typeof this.renderCurrentPage === 'function') {
                            this.renderCurrentPage();
                        }
                    }
                    finally {
                        this.hideLoadingOverlay();
                    }
                }
                else {
                    const emailEl = this.qs('#loggedInUserEmail');
                    if (emailEl) {
                        emailEl.textContent = '';
                        try {
                            emailEl.style.display = 'none';
                        }
                        catch { }
                    }
                    const logoutBtn = this.qs('#logoutButton');
                    if (logoutBtn)
                        logoutBtn.style.display = 'none';
                    this.showModal('loginModal');
                }
            });
            this.setupInstallPrompt();
            this.setupKeyboardShortcuts();
            this.setupOfflineDetection();
        }
        catch (error) {
            console.error('UI.init error:', error);
        }
    },
    async loadSharedComponents() {
        try {
            const headerResponse = await fetch('shared.html');
            const headerHtml = await headerResponse.text();
            const sharedHeader = this.qs('#shared-header');
            if (sharedHeader)
                sharedHeader.innerHTML = headerHtml;
            const modalsResponse = await fetch('modals.html');
            const modalsHtml = await modalsResponse.text();
            const sharedModals = this.qs('#shared-modals');
            if (sharedModals)
                sharedModals.innerHTML = modalsHtml;
            // Aggiorna il titolo dell'header con il nome dell'unità personalizzato
            this.updateUnitName();
            // Inizializza la sidebar
            this.setupSidebar();
            this.highlightActiveNavItem();
        }
        catch (error) {
            console.error('Errore nel caricamento componenti condivisi:', error);
        }
    },
    setupSidebar() {
        const toggleBtn = this.qs('#sidebarToggle');
        const sidebar = this.qs('#mainSidebar');
        const overlay = this.qs('#sidebarOverlay');
        const closeBtn = this.qs('#closeSidebar');
        if (!toggleBtn || !sidebar)
            return;
        // Stato iniziale: su mobile deve essere chiusa (rimuovi 'active' se presente)
        if (window.innerWidth < 768) {
            sidebar.classList.remove('active');
            if (overlay)
                overlay.classList.add('hidden');
        }
        else {
            // Su desktop per default la teniamo aperta (aggiungi 'active')
            sidebar.classList.add('active');
            if (overlay)
                overlay.classList.add('hidden');
        }
        const toggleSidebar = () => {
            const isActive = sidebar.classList.toggle('active');
            // L'overlay serve solo su mobile e solo quando la sidebar è attiva
            if (window.innerWidth < 768) {
                if (overlay) {
                    overlay.classList.toggle('hidden', !isActive);
                }
            }
            else {
                // Su desktop l'overlay non serve mai
                if (overlay)
                    overlay.classList.add('hidden');
            }
        };
        toggleBtn.addEventListener('click', toggleSidebar);
        if (overlay)
            overlay.addEventListener('click', toggleSidebar);
        if (closeBtn)
            closeBtn.addEventListener('click', toggleSidebar);
    },
    highlightActiveNavItem() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        const navItems = document.querySelectorAll('.nav-item');
        const labels = {
            'presenze.html': 'Presenze',
            'storico-presenze.html': 'Storico Presenze',
            'esploratori.html': 'Esploratori',
            'calendario.html': 'Calendario',
            'staff.html': 'Staff',
            'dashboard.html': 'Dashboard',
            'pagamenti.html': 'Pagamenti',
            'documenti.html': 'Documenti',
            'statistiche.html': 'Statistiche',
            'preferenze.html': 'Preferenze',
            'preventivo.html': 'Preventivo',
            'scadenze.html': 'Scadenze',
            'scorte.html': 'Scorte'
        };
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === page) {
                item.classList.add('active');
                // Aggiorna etichetta pagina nell'header
                const pageLabel = this.qs('#current-page-label');
                if (pageLabel && labels[page]) {
                    pageLabel.textContent = labels[page];
                }
            }
            else {
                item.classList.remove('active');
            }
        });
    },
    updateUnitName() {
        try {
            const unitType = localStorage.getItem('unitType') || 'Reparto';
            const unitName = localStorage.getItem('unitName') || 'Maori';
            const fullName = `${unitType} ${unitName}`;
            const headerTitle = this.qs('header h1');
            if (headerTitle) {
                headerTitle.textContent = fullName;
            }
        }
        catch (error) {
            console.error('Errore aggiornamento nome unità:', error);
        }
    },
    setupEventListeners() {
        const logoutBtn = this.qs('#logoutButton');
        if (logoutBtn)
            logoutBtn.addEventListener('click', async () => {
                try {
                    await signOut(DATA.adapter.auth);
                }
                catch (error) {
                    console.error('Logout error:', error);
                }
            });
        const hamburgerIcon = this.qs('.hamburger-icon');
        const navLinks = this.qs('.nav-links');
        if (hamburgerIcon && navLinks) {
            hamburgerIcon.addEventListener('click', () => {
                const isActive = navLinks.classList.toggle('active');
                hamburgerIcon.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                hamburgerIcon.setAttribute('aria-label', isActive ? 'Chiudi menu di navigazione' : 'Apri menu di navigazione');
            });
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('active') && !hamburgerIcon.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    hamburgerIcon.setAttribute('aria-expanded', 'false');
                }
            });
        }
        const loginForm = this.qs('#loginForm');
        if (loginForm && !loginForm._bound) {
            loginForm._bound = true;
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = this.qs('#loginEmail').value.trim();
                const password = this.qs('#loginPassword').value;
                const loginError = this.qs('#loginError');
                loginError.textContent = '';
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn?.textContent;
                this.setButtonLoading(submitBtn, true, originalText);
                try {
                    await signInWithEmailAndPassword(DATA.adapter.auth, email, password);
                }
                catch (error) {
                    console.error('Login error:', error.code, error.message);
                    let msg = 'Accesso non riuscito.';
                    if (error.code === 'auth/invalid-email')
                        msg = 'Email non valida.';
                    else if (error.code === 'auth/user-disabled')
                        msg = 'Utente disabilitato.';
                    else if (error.code === 'auth/user-not-found')
                        msg = 'Utente non trovato.';
                    else if (error.code === 'auth/wrong-password')
                        msg = 'Password errata.';
                    else if (error.code === 'auth/too-many-requests')
                        msg = 'Troppi tentativi, riprova più tardi.';
                    loginError.textContent = msg;
                    this.showToast(msg, { type: 'error' });
                }
                finally {
                    this.setButtonLoading(submitBtn, false, originalText);
                }
            });
        }
        const demoLoginBtn = this.qs('#demoLoginBtn');
        if (demoLoginBtn && !demoLoginBtn._bound) {
            demoLoginBtn._bound = true;
            demoLoginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                this.closeModal('loginModal');
                this.currentUser = { email: 'demo@scoutmaori.it', uid: 'demo_user', displayName: 'Staff Demo' };
                DATA.useLocal();
                this.showLoadingOverlay('Caricamento dati demo...');
                try {
                    this.state = await DATA.loadAll();
                    this.rebuildPresenceIndex();
                    const staffMatch = (this.state.staff || [])[0];
                    if (staffMatch) {
                        this.selectStaff(staffMatch.id);
                    }
                    if (typeof this.renderCurrentPage === 'function') {
                        this.renderCurrentPage();
                    }
                    this.showToast('Accesso effettuato in modalità Demo Locale', { type: 'success' });
                } finally {
                    this.hideLoadingOverlay();
                }
            });
        }
        this.setupModalEventListeners();
        if (this.currentUser?.uid) {
            this.setupInAppNotifications();
        }
        if (this.qs('#markAllReadBtn')) {
            this.qs('#markAllReadBtn').addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.markAllNotificationsAsRead();
            });
        }
    },
    showModal(id) {
        const m = document.getElementById(id);
        if (m) {
            m.classList.add('show');
            m.classList.remove('hidden');
            m.setAttribute('aria-hidden', 'false');
            const input = m.querySelector('input, button');
            if (input)
                input.focus();
        }
    },
    openModal(id) {
        this.showModal(id);
    },
    closeModal(id) {
        const m = document.getElementById(id);
        if (m) {
            m.classList.remove('show');
            m.classList.add('hidden');
            m.setAttribute('aria-hidden', 'true');
        }
    },
    showConfirmModal({ title, message, confirmText = 'Conferma', cancelText = 'Annulla', onConfirm, onCancel }) {
        const modal = this.qs('#confirmModal');
        if (!modal)
            return;
        const titleEl = this.qs('#confirmModalTitle');
        const messageEl = this.qs('#confirmModalMessage');
        const confirmBtn = this.qs('#confirmModalConfirm');
        const cancelBtn = this.qs('#confirmModalCancel');
        if (titleEl)
            titleEl.textContent = title || 'Conferma';
        if (messageEl)
            messageEl.textContent = message || 'Sei sicuro?';
        if (confirmBtn)
            confirmBtn.textContent = confirmText;
        if (cancelBtn)
            cancelBtn.textContent = cancelText;
        const newConfirmBtn = confirmBtn?.cloneNode(true);
        const newCancelBtn = cancelBtn?.cloneNode(true);
        if (confirmBtn && newConfirmBtn)
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        if (cancelBtn && newCancelBtn)
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        const finalConfirmBtn = this.qs('#confirmModalConfirm');
        const finalCancelBtn = this.qs('#confirmModalCancel');
        if (finalConfirmBtn)
            finalConfirmBtn.addEventListener('click', () => {
                this.closeModal('confirmModal');
                if (onConfirm)
                    onConfirm();
            });
        if (finalCancelBtn)
            finalCancelBtn.addEventListener('click', () => {
                this.closeModal('confirmModal');
                if (onCancel)
                    onCancel();
            });
        const closeOnOutside = (e) => {
            if (e.target === modal) {
                this.closeModal('confirmModal');
                modal.removeEventListener('click', closeOnOutside);
                if (onCancel)
                    onCancel();
            }
        };
        modal.addEventListener('click', closeOnOutside);
        this.showModal('confirmModal');
    },
    setupModalEventListeners() {
        const confirmDeleteStaffButton = this.qs('#confirmDeleteStaffButton');
        if (confirmDeleteStaffButton && !confirmDeleteStaffButton._bound) {
            confirmDeleteStaffButton._bound = true;
            confirmDeleteStaffButton.addEventListener('click', async () => {
                if (!this.currentUser) {
                    this.showToast('Devi essere loggato per eliminare staff.', { type: 'error' });
                    return;
                }
                if (!this.staffToDeleteId)
                    return;
                await DATA.deleteStaff(this.staffToDeleteId, this.currentUser);
                this.staffToDeleteId = null;
                this.closeModal('confirmDeleteStaffModal');
                this.state = await DATA.loadAll();
                this.renderCurrentPage();
                this.showToast('Staff eliminato con successo');
            });
        }
        const editStaffForm = this.qs('#editStaffForm');
        if (editStaffForm && !editStaffForm._bound) {
            editStaffForm._bound = true;
            this.setupFormValidation(editStaffForm, {
                editStaffNome: { required: true, minLength: 1, maxLength: 100 },
                editStaffCognome: { required: true, minLength: 1, maxLength: 100 },
                editStaffEmail: { required: true, type: 'email' }
            });
            editStaffForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!this.currentUser) {
                    this.showToast('Devi essere loggato.', { type: 'error' });
                    return;
                }
                const validation = this.validateForm(editStaffForm, {
                    editStaffNome: { required: true, minLength: 1, maxLength: 100 },
                    editStaffCognome: { required: true, minLength: 1, maxLength: 100 },
                    editStaffEmail: { required: true, type: 'email' }
                });
                if (!validation.valid) {
                    this.showToast(Object.values(validation.errors)[0], { type: 'error' });
                    return;
                }
                const id = this.qs('#editStaffId').value;
                const nome = this.qs('#editStaffNome').value.trim();
                const cognome = this.qs('#editStaffCognome').value.trim();
                const email = this.qs('#editStaffEmail').value.trim().toLowerCase();
                if (this.checkDuplicateStaffEmail(email, id)) {
                    this.showToast('Email già in uso.', { type: 'error' });
                    return;
                }
                const submitBtn = editStaffForm.querySelector('button[type="submit"]');
                const originalText = submitBtn?.textContent;
                this.setButtonLoading(submitBtn, true, originalText);
                try {
                    await DATA.updateStaff(id, { id, nome, cognome, email }, this.currentUser);
                    this.closeModal('editStaffModal');
                    this.state = await DATA.loadAll();
                    this.renderCurrentPage();
                    this.showToast('Staff modificato con successo');
                }
                catch (error) {
                    console.error(error);
                    this.showToast('Errore durante la modifica', { type: 'error' });
                }
                finally {
                    this.setButtonLoading(submitBtn, false, originalText);
                }
            });
        }
        const editScoutForm = this.qs('#editScoutForm');
        if (editScoutForm && !editScoutForm._bound) {
            editScoutForm._bound = true;
            this.setupFormValidation(editScoutForm, {
                editScoutNome: { required: true, minLength: 1, maxLength: 100 },
                editScoutCognome: { required: true, minLength: 1, maxLength: 100 }
            });
            editScoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!this.currentUser)
                    return;
                const validation = this.validateForm(editScoutForm, {
                    editScoutNome: { required: true, minLength: 1, maxLength: 100 },
                    editScoutCognome: { required: true, minLength: 1, maxLength: 100 }
                });
                if (!validation.valid) {
                    this.showToast(Object.values(validation.errors)[0], { type: 'error' });
                    return;
                }
                const id = this.qs('#editScoutId').value;
                const nome = this.qs('#editScoutNome').value.trim();
                const cognome = this.qs('#editScoutCognome').value.trim();
                if (this.checkDuplicateScout(nome, cognome, id)) {
                    this.showToast('Esploratore già esistente.', { type: 'error' });
                    return;
                }
                const submitBtn = editScoutForm.querySelector('button[type="submit"]');
                const originalText = submitBtn?.textContent;
                this.setButtonLoading(submitBtn, true, originalText);
                try {
                    await DATA.updateScout(id, { id, nome, cognome }, this.currentUser);
                    this.closeModal('editScoutModal');
                    this.state = await DATA.loadAll();
                    this.rebuildPresenceIndex();
                    this.renderCurrentPage();
                    this.showToast('Esploratore modificato');
                }
                catch (error) {
                    console.error(error);
                    this.showToast('Errore', { type: 'error' });
                }
                finally {
                    this.setButtonLoading(submitBtn, false, originalText);
                }
            });
        }
        const confirmDeleteScoutButton = this.qs('#confirmDeleteScoutButton');
        if (confirmDeleteScoutButton && !confirmDeleteScoutButton._bound) {
            confirmDeleteScoutButton._bound = true;
            confirmDeleteScoutButton.addEventListener('click', async () => {
                if (!this.currentUser)
                    return;
                if (!this.scoutToDeleteId)
                    return;
                const presencesCount = this.countPresencesForScout(this.scoutToDeleteId);
                if (presencesCount > 0) {
                    const confirmed = await new Promise(resolve => {
                        this.showConfirmModal({
                            title: 'Conferma',
                            message: `L'esploratore ha ${presencesCount} presenze. Eliminare tutto?`,
                            confirmText: 'Elimina tutto',
                            onConfirm: () => resolve(true),
                            onCancel: () => resolve(false)
                        });
                    });
                    if (!confirmed)
                        return;
                }
                const originalText = confirmDeleteScoutButton.textContent;
                this.setButtonLoading(confirmDeleteScoutButton, true, originalText);
                try {
                    await DATA.deleteScout(this.scoutToDeleteId, this.currentUser);
                    this.scoutToDeleteId = null;
                    this.closeModal('confirmDeleteScoutModal');
                    this.state = await DATA.loadAll();
                    this.rebuildPresenceIndex();
                    this.renderCurrentPage();
                    this.showToast('Esploratore eliminato');
                }
                catch (e) {
                    console.error(e);
                    this.showToast('Errore', { type: 'error' });
                }
                finally {
                    this.setButtonLoading(confirmDeleteScoutButton, false, originalText);
                }
            });
        }
        // EDIT ACTIVITY FORM: Logica spostata in calendario.js
        // Rimosso da ui.js per evitare conflitti e doppia gestione.
        /*
         * La gestione è ora in calendario.js:UI.setupCalendarEvents
         */
        const confirmDeleteActivityButton = this.qs('#confirmDeleteActivityButton');
        if (confirmDeleteActivityButton && !confirmDeleteActivityButton._bound) {
            confirmDeleteActivityButton._bound = true;
            confirmDeleteActivityButton.addEventListener('click', async () => {
                if (!this.currentUser)
                    return;
                if (!this.activityToDeleteId)
                    return;
                const presencesCount = this.countPresencesForActivity(this.activityToDeleteId);
                if (presencesCount > 0) {
                    const confirmed = await new Promise(resolve => {
                        this.showConfirmModal({
                            title: 'Conferma',
                            message: `L'attività ha ${presencesCount} presenze. Eliminare tutto?`,
                            confirmText: 'Elimina tutto',
                            onConfirm: () => resolve(true),
                            onCancel: () => resolve(false)
                        });
                    });
                    if (!confirmed)
                        return;
                }
                try {
                    await DATA.deleteActivity(this.activityToDeleteId, this.currentUser);
                    this.activityToDeleteId = null;
                    this.closeModal('confirmDeleteActivityModal');
                    this.state = await DATA.loadAll();
                    this.rebuildPresenceIndex();
                    this.renderCurrentPage();
                    this.showToast('Attività eliminata');
                    this.notifyImportantChange({ type: 'activity_deleted', title: 'Attività Cancellata', body: 'Attività cancellata' });
                }
                catch (e) {
                    console.error(e);
                    this.showToast('Errore', { type: 'error' });
                }
            });
        }
    },
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            return THEME.DARK;
        return THEME.LIGHT;
    },
    getCurrentTheme() {
        try {
            const saved = localStorage.getItem('app-theme');
            if (saved === THEME.DARK || saved === THEME.LIGHT)
                return saved;
        }
        catch (e) { }
        return this.getSystemTheme();
    },
    applyTheme(theme) {
        if (theme === THEME.DARK) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.documentElement.classList.remove('dark');
        }
        setTimeout(() => {
            const toggle = this.qs('#themeToggle');
            if (toggle) {
                const icon = toggle.querySelector('.theme-toggle-icon');
                if (icon)
                    icon.textContent = theme === THEME.DARK ? '☀️' : '🌙';
            }
        }, 50);
    },
    saveTheme(theme) {
        localStorage.setItem('app-theme', theme);
    },
    toggleTheme() {
        const current = this.getCurrentTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);
    },
    setupTheme() {
        const theme = this.getCurrentTheme();
        this.applyTheme(theme);
        if (window.matchMedia && !localStorage.getItem('app-theme')) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                this.applyTheme(e.matches ? 'dark' : 'light');
            });
        }
        setTimeout(() => {
            const toggle = this.qs('#themeToggle');
            if (toggle && !toggle._bound) {
                toggle._bound = true;
                toggle.addEventListener('click', () => this.toggleTheme());
            }
        }, 200);
    },
    loadUserPreferences() {
        try {
            const local = localStorage.getItem('app-preferences');
            if (local)
                return JSON.parse(local);
        }
        catch (e) { }
        return { theme: this.getCurrentTheme(), notifications: { activityReminders: true, paymentReminders: true, importantChanges: true, birthdayReminders: true, enabled: false } };
    },
    async saveUserPreferences(preferences) {
        try {
            localStorage.setItem('app-preferences', JSON.stringify(preferences));
            if (this.currentUser?.uid) {
                await setDoc(doc(DATA.adapter.db, 'user-preferences', this.currentUser.uid), { ...preferences, updatedAt: new Date() }, { merge: true });
            }
        }
        catch (e) { }
    },
    async syncUserPreferences() {
        if (!this.currentUser?.uid)
            return;
        try {
            const snap = await getDoc(doc(DATA.adapter.db, 'user-preferences', this.currentUser.uid));
            if (snap.exists()) {
                const merged = { ...snap.data(), ...this.loadUserPreferences() };
                delete merged.updatedAt;
                if (merged.theme)
                    this.applyTheme(merged.theme);
                localStorage.setItem('app-preferences', JSON.stringify(merged));
            }
        }
        catch (e) { }
    },
    async loadComments(targetType, targetId) {
        try {
            const q = query(collection(DATA.adapter.db, 'comments'), where('targetType', '==', targetType), where('targetId', '==', targetId));
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate() || new Date() })).sort((a, b) => b.timestamp - a.timestamp);
        }
        catch (e) {
            console.error(e);
            return [];
        }
    },
    async addComment(targetType, targetId, text) {
        if (!this.currentUser)
            return;
        await addDoc(collection(DATA.adapter.db, 'comments'), {
            targetType, targetId, userId: this.currentUser.uid, userEmail: this.currentUser.email, text: text.trim(), timestamp: Timestamp.now()
        });
    },
    renderCommentsList(comments, container) {
        if (!container)
            return;
        if (!comments.length) {
            container.innerHTML = '<p class="text-sm text-gray-500">Nessun commento.</p>';
            return;
        }
        container.innerHTML = comments.map(c => `
      <div class="border-b py-2"><div class="flex justify-between"><span class="text-xs text-gray-500">${this.escapeHtml(c.userEmail)}</span><span class="text-xs text-gray-400">${c.timestamp.toLocaleString()}</span></div><p class="text-sm mt-1">${this.escapeHtml(c.text)}</p></div>
    `).join('');
    },
    async setupCommentsForTarget(targetType, targetId, selectors) {
        const list = this.qs(selectors.listSelector);
        const form = this.qs(selectors.formSelector);
        const textarea = this.qs(selectors.textareaSelector);
        if (!list || !form || !textarea)
            return;
        const loadAndRender = async () => { const c = await this.loadComments(targetType, targetId); this.renderCommentsList(c, list); };
        await loadAndRender();
        if (!form._bound) {
            form._bound = true;
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!this.currentUser)
                    return;
                await this.addComment(targetType, targetId, textarea.value);
                textarea.value = '';
                await loadAndRender();
            });
        }
    },
    async initializeFCM() {
        if (!('serviceWorker' in navigator) || !('Notification' in window))
            return;
        try {
            const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
                const token = await getToken(DATA.adapter.messaging, { vapidKey: 'BBKeE0VbFbvT_BWU78Ddtbt1EhP6-vHYTI_WwQsrBOiki5RvsyBTwkI4X6HFEW0GaVf018JNosFE1eVdb6b62N0', serviceWorkerRegistration: reg });
                if (token) {
                    await this.saveFCMToken(token);
                    onMessage(DATA.adapter.messaging, payload => this.handleForegroundNotification(payload));
                }
            }
        }
        catch (e) {
            console.error(e);
        }
    },
    async saveFCMToken(token) {
        if (this.currentUser?.uid)
            await setDoc(doc(DATA.adapter.db, 'fcm-tokens', this.currentUser.uid), { token, userId: this.currentUser.uid, updatedAt: new Date() }, { merge: true });
    },
    async handleForegroundNotification(payload) {
        const title = payload.notification?.title || 'Notifica';
        const body = payload.notification?.body || '';
        await this.saveInAppNotification({ type: 'info', title, body, notificationType: 'info' });
        this.showToast(`${title}: ${body}`, { type: 'info' });
    },
    async checkActivityReminders(force = false) {
        if (!this.currentUser)
            return 0;
        const prefs = this.loadUserPreferences();
        if (!force && prefs.notifications?.activityReminders === false)
            return 0;

        const upcoming = getUpcomingActivities(this.state?.activities || [], 3);
        let createdCount = 0;

        for (const act of upcoming) {
            const dateStr = this.formatDisplayDate ? this.formatDisplayDate(act.data) : (act.data?.toDate ? act.data.toDate().toLocaleDateString('it-IT') : new Date(act.data).toLocaleDateString('it-IT'));
            const todayStr = new Date().toISOString().split('T')[0];
            const reminderKey = `activity_${act.id}_${todayStr}`;

            const costNum = parseFloat(act.costo || '0');
            const costText = costNum > 0 ? ` (Costo: €${costNum})` : '';
            const title = `📅 Attività imminente: ${act.descrizione || act.tipo || 'Attività'}`;
            const body = `${act.tipo || 'Attività'} in programma il ${dateStr}${costText}.`;

            const res = await this.saveInAppNotification({
                type: 'activity_reminder',
                title,
                body,
                url: 'calendario.html',
                notificationType: 'reminder',
                reminderKey
            });
            if (res) createdCount++;
        }
        return createdCount;
    },
    async checkPaymentReminders(force = false) {
        if (!this.currentUser)
            return 0;
        const prefs = this.loadUserPreferences();
        if (!force && prefs.notifications?.paymentReminders === false)
            return 0;

        const pendingList = getPendingPaymentsByActivity(this.state?.activities || [], this.state?.presences || []);
        let createdCount = 0;

        for (const item of pendingList) {
            const act = item.activity;
            const todayStr = new Date().toISOString().split('T')[0];
            const reminderKey = `payment_${act.id}_${todayStr}`;

            const title = `💶 Quote da saldare: ${act.descrizione || act.tipo || 'Attività'}`;
            const body = `${item.pendingCount} esplorator${item.pendingCount === 1 ? 'e presente non ha' : 'i presenti non hanno'} ancora saldato la quota (€${item.totalAmount} in sospeso).`;

            const res = await this.saveInAppNotification({
                type: 'payment_reminder',
                title,
                body,
                url: 'presenze.html',
                notificationType: 'warning',
                reminderKey
            });
            if (res) createdCount++;
        }
        return createdCount;
    },
    async checkBirthdayReminders(force = false) {
        if (!this.currentUser)
            return 0;
        const prefs = this.loadUserPreferences();
        if (!force && prefs.notifications?.birthdayReminders === false)
            return 0;

        const bdays = getUpcomingBirthdays(this.state?.scouts || [], 3);
        let createdCount = 0;

        for (const item of bdays) {
            const scout = item.scout;
            const currentYear = new Date().getFullYear();
            const reminderKey = `birthday_${scout.id}_${currentYear}`;

            let when = 'oggi!';
            if (item.daysUntil === 1) when = 'domani!';
            else if (item.daysUntil > 1) when = `tra ${item.daysUntil} giorni!`;

            const ageText = item.turningAge ? ` Compie ${item.turningAge} anni.` : '';
            const title = `🎂 Compleanno di ${scout.nome || ''} ${scout.cognome || ''}`;
            const body = `${scout.nome || 'L\'esploratore'} festeggia il compleanno ${when}${ageText}`;

            const res = await this.saveInAppNotification({
                type: 'birthday_reminder',
                title,
                body,
                url: 'esploratori.html',
                notificationType: 'info',
                reminderKey
            });
            if (res) createdCount++;
        }
        return createdCount;
    },
    async runAllRemindersCheck(force = false) {
        const a = await this.checkActivityReminders(force);
        const p = await this.checkPaymentReminders(force);
        const b = await this.checkBirthdayReminders(force);
        this.updateNotificationsBadge();
        return { activities: a, payments: p, birthdays: b, total: a + p + b };
    },
    notifyImportantChange({ type, title, body, url = null }) {
        this.saveInAppNotification({ type, title, body, url, notificationType: 'important' });
    },
    async saveInAppNotification(n) {
        if (this.currentUser?.uid) {
            if (n.reminderKey) {
                const todayKey = new Date().toISOString().split('T')[0];
                const storageKey = `sent_reminders_${this.currentUser.uid}_${todayKey}`;
                let sentKeys = [];
                try {
                    sentKeys = JSON.parse(localStorage.getItem(storageKey) || '[]');
                } catch { }

                if (sentKeys.includes(n.reminderKey)) {
                    return null;
                }

                sentKeys.push(n.reminderKey);
                try {
                    localStorage.setItem(storageKey, JSON.stringify(sentKeys));
                } catch { }
            }

            const docRef = await addDoc(collection(DATA.adapter.db, 'in-app-notifications'), { ...n, userId: this.currentUser.uid, read: false, createdAt: Timestamp.now() });
            this.updateNotificationsBadge();
            return docRef;
        }
        return null;
    },
    async loadInAppNotifications(limitCount = 50) {
        if (!this.currentUser?.uid)
            return [];
        const q = query(collection(DATA.adapter.db, 'in-app-notifications'), where('userId', '==', this.currentUser.uid), orderBy('createdAt', 'desc'), limit(limitCount));
        const s = await getDocs(q);
        return s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() }));
    },
    async markAllNotificationsAsRead() {
        if (!this.currentUser)
            return;
        const unread = (await this.loadInAppNotifications(100)).filter(n => !n.read);
        for (const n of unread)
            await updateDoc(doc(DATA.adapter.db, 'in-app-notifications', n.id), { read: true });
        this.updateNotificationsBadge();
        this.renderNotificationsList();
    },
    async updateNotificationsBadge() {
        if (!this.currentUser)
            return;
        const unread = (await this.loadInAppNotifications(100)).filter(n => !n.read).length;
        const badge = this.qs('#notificationsBadge');
        if (badge) {
            badge.textContent = unread > 99 ? '99+' : unread;
            badge.style.display = unread > 0 ? 'flex' : 'none';
        }
    },
    async handleNotificationClick(id, url) {
        await this.markNotificationAsRead(id);
        if (url && url !== '#' && !window.location.pathname.endsWith(url)) {
            window.location.href = url;
        }
    },
    async renderNotificationsList() {
        const container = this.qs('#notificationsList');
        const emptyEl = this.qs('#notificationsEmpty');
        if (!container)
            return;
        const notes = await this.loadInAppNotifications(20);
        if (!notes.length) {
            container.innerHTML = '';
            if (emptyEl) emptyEl.style.display = 'block';
            return;
        }
        if (emptyEl) emptyEl.style.display = 'none';

        const getIcon = (type) => {
            if (type === 'activity_reminder') return '📅';
            if (type === 'payment_reminder') return '💶';
            if (type === 'birthday_reminder') return '🎂';
            if (type === 'important') return '⚠️';
            return '🔔';
        };

        container.innerHTML = notes.map(n => `
        <div class="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/70 dark:bg-blue-900/20 font-medium' : ''}" onclick="UI.handleNotificationClick('${n.id}', '${n.url || ''}')">
            <div class="flex items-start gap-2">
                <span class="text-base flex-shrink-0">${getIcon(n.type)}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-800 dark:text-gray-200 leading-snug">${this.escapeHtml(n.title)}</p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">${this.escapeHtml(n.body)}</p>
                    <span class="text-[9px] text-gray-400 mt-1 block">${this.formatTimeAgo ? this.formatTimeAgo(n.createdAt) : ''}</span>
                </div>
                ${!n.read ? '<span class="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></span>' : ''}
            </div>
        </div>
    `).join('');
    },
    async markNotificationAsRead(id) {
        if (this.currentUser) {
            await updateDoc(doc(DATA.adapter.db, 'in-app-notifications', id), { read: true });
            this.updateNotificationsBadge();
            this.renderNotificationsList();
        }
    },
    setupInAppNotifications() {
        if (!this.currentUser)
            return;
        const bell = this.qs('#notificationsBell');
        const drop = this.qs('#notificationsDropdown');
        if (bell && drop) {
            bell.addEventListener('click', e => {
                e.stopPropagation();
                drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
                if (drop.style.display === 'block')
                    this.renderNotificationsList();
            });
            document.addEventListener('click', e => {
                if (!bell.contains(e.target) && !drop.contains(e.target))
                    drop.style.display = 'none';
            });
        }
        this.updateNotificationsBadge();
    },
    // ... (rest of the file methods)
    // Re-export imported utilities for compatibility if needed, or just let them be used internally.
    // However, existing code might call UI.escapeHtml.
    escapeHtml,
    toJsDate,
    formatTimeAgo,
    setupFormValidation,
    validateForm,
    validateFieldValue,
    debounceWithRateLimit,
    // ... (other methods)
    rebuildPresenceIndex() {
        this.presenceIndex = new Map();
        (this.state.presences || []).forEach(p => this.presenceIndex.set(`${p.esploratoreId}_${p.attivitaId}`, p));
    },
    getDedupedPresences() { return Array.from(this.presenceIndex?.values() || []); },
    countPresencesForScout(id) { return (this.state.presences || []).filter(p => p.esploratoreId === id).length; },
    countPresencesForActivity(id) { return (this.state.presences || []).filter(p => p.attivitaId === id).length; },
    checkDuplicateScout(n, c, xId) { return (this.state.scouts || []).some(s => s.id !== xId && s.nome.toLowerCase() === n.toLowerCase() && s.cognome.toLowerCase() === c.toLowerCase()); },
    checkDuplicateStaffEmail(e, xId) { return (this.state.staff || []).some(s => s.id !== xId && s.email.toLowerCase() === e.toLowerCase()); },
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = this.qs('#installAppBtn');
            if (btn) {
                btn.style.display = 'block';
                btn.addEventListener('click', () => {
                    this.deferredPrompt.prompt();
                    this.deferredPrompt.userChoice.then((choice) => {
                        if (choice.outcome === 'accepted') {
                            console.log('App installata');
                        }
                        this.deferredPrompt = null;
                    });
                });
            }
        });
    },
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Chiudi modali con Escape
            if (e.key === 'Escape') {
                // Prima chiudi la command palette se aperta
                const cp = document.getElementById('commandPalette');
                if (cp && !cp.classList.contains('hidden')) {
                    this.closeCommandPalette();
                    return;
                }
                const modals = document.querySelectorAll('.modal.show');
                modals.forEach(m => this.closeModal(m.id));
            }
            // Ctrl+K / Cmd+K – apri Command Palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const cp = document.getElementById('commandPalette');
                if (cp && cp.classList.contains('hidden')) {
                    this.openCommandPalette();
                } else {
                    this.closeCommandPalette();
                }
            }
            // Ctrl+S / Cmd+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
            }
        });
    },

    // ── Command Palette ──────────────────────────────────────────────────────

    /** Apre la command palette e mette il focus sull'input */
    openCommandPalette() {
        const cp = document.getElementById('commandPalette');
        const input = document.getElementById('commandPaletteInput');
        if (!cp) return;
        cp.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 50);
        }
        // Mostra suggerimenti iniziali, nasconde risultati
        const suggestions = document.getElementById('commandPaletteSuggestions');
        const results = document.getElementById('commandPaletteSearchResults');
        const empty = document.getElementById('commandPaletteEmpty');
        if (suggestions) suggestions.classList.remove('hidden');
        if (results) results.classList.add('hidden');
        if (empty) empty.classList.add('hidden');
        // Listener: chiudi cliccando overlay
        cp._overlayHandler = (e) => {
            if (e.target === cp) this.closeCommandPalette();
        };
        cp.addEventListener('click', cp._overlayHandler);
        // Listener: input ricerca
        if (input && !input._cpBound) {
            input._cpBound = true;
            input.addEventListener('input', () => this.searchCommandPalette(input.value));
            input.addEventListener('keydown', (e) => this.commandPaletteKeyNav(e));
        }
    },

    /** Chiude la command palette e ripristina lo scroll */
    closeCommandPalette() {
        const cp = document.getElementById('commandPalette');
        if (!cp) return;
        cp.classList.add('hidden');
        document.body.style.overflow = '';
        if (cp._overlayHandler) {
            cp.removeEventListener('click', cp._overlayHandler);
            cp._overlayHandler = null;
        }
        // Reset active item
        this._cpActiveIndex = -1;
    },

    /** Indice dell'elemento attivo nella keyboard navigation */
    _cpActiveIndex: -1,

    /**
     * Esegue la ricerca su esploratori, attività e staff.
     * @param {string} query - Testo inserito dall'utente
     */
    searchCommandPalette(query) {
        const suggestions = document.getElementById('commandPaletteSuggestions');
        const resultsContainer = document.getElementById('commandPaletteSearchResults');
        const empty = document.getElementById('commandPaletteEmpty');
        const queryEl = document.getElementById('commandPaletteQuery');
        this._cpActiveIndex = -1;

        const q = (query || '').trim().toLowerCase();

        if (!q) {
            // Nessuna query: mostra suggerimenti iniziali
            if (suggestions) suggestions.classList.remove('hidden');
            if (resultsContainer) resultsContainer.classList.add('hidden');
            if (empty) empty.classList.add('hidden');
            return;
        }

        if (suggestions) suggestions.classList.add('hidden');

        const scouts = (this.state?.scouts || []).filter(s => !s.archived);
        const activities = this.state?.activities || [];
        const staff = this.state?.staff || [];
        const scorte = this.state?.scorte || [];
        const scadenze = this.state?.scadenze || [];

        // Ricerca esploratori
        const scoutResults = scouts
            .filter(s => {
                const full = `${s.anag_nome || s.nome || ''} ${s.anag_cognome || s.cognome || ''} ${s.anag_pattuglia || s.pattuglia || s.pv_pattuglia || ''}`.toLowerCase();
                return full.includes(q);
            })
            .slice(0, 5)
            .map(s => ({
                icon: '👤',
                text: `${s.anag_nome || s.nome || ''} ${s.anag_cognome || s.cognome || ''}`.trim(),
                meta: s.anag_pattuglia || s.pattuglia || s.pv_pattuglia || 'Esploratore',
                href: `esploratori.html`,
                category: 'Esploratori'
            }));

        // Ricerca attività
        const activityResults = activities
            .filter(a => {
                const text = `${a.descrizione || a.titolo || ''} ${a.tipo || ''}`.toLowerCase();
                return text.includes(q);
            })
            .slice(0, 5)
            .map(a => {
                const dateStr = a.data ? (a.data.toDate ? a.data.toDate() : new Date(a.data)).toLocaleDateString('it-IT') : '';
                return {
                    icon: '📅',
                    text: a.descrizione || a.titolo || 'Attività',
                    meta: dateStr || a.tipo || 'Attività',
                    href: 'calendario.html',
                    category: 'Attività'
                };
            });

        // Ricerca staff
        const staffResults = staff
            .filter(s => {
                const full = `${s.nome || ''} ${s.cognome || ''} ${s.email || ''}`.toLowerCase();
                return full.includes(q);
            })
            .slice(0, 3)
            .map(s => ({
                icon: '👔',
                text: `${s.nome || ''} ${s.cognome || ''}`.trim(),
                meta: s.ruolo || 'Staff',
                href: 'staff.html',
                category: 'Staff'
            }));

        // Ricerca Scorte & Materiali
        const scorteResults = scorte
            .filter(sc => {
                const full = `${sc.nome || ''} ${sc.categoria || ''} ${sc.lista || ''} ${sc.note || ''}`.toLowerCase();
                return full.includes(q);
            })
            .slice(0, 5)
            .map(sc => ({
                icon: '📦',
                text: sc.nome || 'Materiale',
                meta: `${sc.quantita ?? 0} ${sc.unitaMisura || 'pz'} · ${sc.categoria || 'Generale'}${sc.lista ? ` (${sc.lista})` : ''}`,
                href: 'scorte.html',
                category: 'Materiali & Scorte'
            }));

        // Ricerca Scadenze
        const scadenzeResults = scadenze
            .filter(scad => {
                const full = `${scad.titolo || ''} ${scad.descrizione || ''} ${scad.categoria || ''} ${scad.annoScout || ''}`.toLowerCase();
                return full.includes(q);
            })
            .slice(0, 5)
            .map(scad => {
                const d = scad.dataScadenza ? new Date(scad.dataScadenza).toLocaleDateString('it-IT') : '';
                return {
                    icon: '⏰',
                    text: scad.titolo || scad.descrizione || 'Scadenza',
                    meta: `${d ? `${d} · ` : ''}${scad.categoria || 'Scadenza'}${scad.completata ? ' (Completata)' : ''}`,
                    href: 'scadenze.html',
                    category: 'Scadenze'
                };
            });

        const allResults = [...scoutResults, ...activityResults, ...staffResults, ...scorteResults, ...scadenzeResults];

        if (allResults.length === 0) {
            if (resultsContainer) resultsContainer.classList.add('hidden');
            if (empty) {
                empty.classList.remove('hidden');
                if (queryEl) queryEl.textContent = query;
            }
            return;
        }

        if (empty) empty.classList.add('hidden');
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');
            resultsContainer.innerHTML = this.renderCommandPaletteResults(allResults, q);
        }
    },

    /**
     * Genera l'HTML dei risultati raggruppati per categoria.
     * @param {Array} results
     * @param {string} query
     * @returns {string}
     */
    renderCommandPaletteResults(results, query) {
        const byCategory = {};
        results.forEach(r => {
            if (!byCategory[r.category]) byCategory[r.category] = [];
            byCategory[r.category].push(r);
        });
        let html = '';
        Object.entries(byCategory).forEach(([cat, items]) => {
            html += `<div class="command-palette-section-label">${cat}</div>`;
            items.forEach(item => {
                const highlightedText = this.cpHighlightMatch(item.text, query);
                html += `
                  <a class="command-palette-item" href="${item.href}" role="option">
                    <span class="cp-item-icon">${item.icon}</span>
                    <span class="cp-item-text">${highlightedText}</span>
                    <span class="cp-item-meta">${item.meta}</span>
                  </a>`;
            });
        });
        return html;
    },

    /**
     * Evidenzia la query nel testo con la classe .cp-highlight.
     * @param {string} text
     * @param {string} query
     * @returns {string}
     */
    cpHighlightMatch(text, query) {
        if (!query || !text) return text || '';
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(${escaped})`, 'gi');
        return text.replace(re, '<mark class="cp-highlight">$1</mark>');
    },

    /**
     * Gestisce la navigazione da tastiera dentro la command palette.
     * @param {KeyboardEvent} e
     */
    commandPaletteKeyNav(e) {
        const resultsEl = document.getElementById('commandPaletteSearchResults');
        const suggestionsEl = document.getElementById('commandPaletteSuggestions');
        const activeContainer = (resultsEl && !resultsEl.classList.contains('hidden'))
            ? resultsEl
            : (suggestionsEl && !suggestionsEl.classList.contains('hidden') ? suggestionsEl : null);
        if (!activeContainer) return;

        const items = Array.from(activeContainer.querySelectorAll('.command-palette-item'));
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this._cpActiveIndex = Math.min(this._cpActiveIndex + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this._cpActiveIndex = Math.max(this._cpActiveIndex - 1, 0);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this._cpActiveIndex >= 0 && items[this._cpActiveIndex]) {
                this.closeCommandPalette();
                window.location.href = items[this._cpActiveIndex].href;
            }
            return;
        } else {
            return;
        }

        items.forEach((item, i) => {
            item.setAttribute('data-active', i === this._cpActiveIndex ? 'true' : 'false');
        });
        if (items[this._cpActiveIndex]) {
            items[this._cpActiveIndex].scrollIntoView({ block: 'nearest' });
        }
    },
    // Export/Import Methods
    exportAllData() {
        if (!this.state)
            throw new Error('Nessun dato');
        return {
            version: this.appVersion,
            exportDate: new Date().toISOString(),
            data: {
                scouts: this.state.scouts || [],
                staff: this.state.staff || [],
                activities: this.state.activities || [],
                presences: this.state.presences || []
            }
        };
    },
    downloadJSONExport() {
        try {
            const exportData = this.exportAllData();
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `maori-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showToast('Backup scaricato', { type: 'success' });
        }
        catch (e) {
            this.showToast('Errore backup', { type: 'error' });
            console.error(e);
        }
    },
    setupDragAndDrop(container, itemSelector, onReorder, options = {}) {
        const { handle = null, disabled = null } = options;
        let draggedItem = null;
        let placeholder = null;

        const getDragItem = (target) => target.closest(itemSelector);

        container.addEventListener('dragstart', (e) => {
            const item = getDragItem(e.target);
            if (!item) return;

            if (disabled && item.matches(disabled)) {
                e.preventDefault();
                return;
            }
            if (handle && !e.target.closest(handle)) {
                e.preventDefault();
                return;
            }

            draggedItem = item;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.id || '');

            placeholder = document.createElement('div');
            placeholder.className = 'placeholder-item';
            placeholder.style.height = `${item.offsetHeight}px`;
            placeholder.style.backgroundColor = '#f3f4f6';
            placeholder.style.border = '2px dashed #d1d5db';
            placeholder.style.borderRadius = '0.5rem';
            placeholder.style.marginBottom = '0.5rem';

            setTimeout(() => {
                item.style.display = 'none';
                if (item.parentNode) item.parentNode.insertBefore(placeholder, item.nextSibling);
            }, 0);
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const target = getDragItem(e.target);
            if (!target || target === draggedItem || target === placeholder) return;

            const rect = target.getBoundingClientRect();
            const after = e.clientY > rect.top + rect.height / 2;

            if (after) {
                container.insertBefore(placeholder, target.nextSibling);
            } else {
                container.insertBefore(placeholder, target);
            }
        });

        container.addEventListener('dragend', () => {
            if (!draggedItem) return;
            draggedItem.style.display = '';
            if (placeholder && placeholder.parentNode) {
                placeholder.parentNode.insertBefore(draggedItem, placeholder);
                placeholder.remove();
            }
            placeholder = null;
            draggedItem = null;

            const newOrder = Array.from(container.querySelectorAll(itemSelector))
                .map(el => el.dataset.id)
                .filter(id => id);

            if (onReorder) onReorder(newOrder);
        });
    },
    // Gesture Support
    setupSwipeDelete(container, onDelete, itemSelector = '> div', itemIdAttr = 'data-id') {
        if (!container || typeof onDelete !== 'function')
            return;
        if (!('ontouchstart' in window || navigator.maxTouchPoints > 0))
            return;
        let touchStartX = 0;
        let touchStartY = 0;
        let currentElement = null;
        const swipeThreshold = 80;
        const deleteThreshold = 150;
        container.addEventListener('touchstart', (e) => {
            const item = e.target.closest(itemSelector);
            if (!item || item.hasAttribute('data-swipe-disabled') || e.target.closest('a, button'))
                return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            currentElement = item;
            item.style.transition = 'transform 0.1s linear';
        }, { passive: false });
        container.addEventListener('touchmove', (e) => {
            if (!currentElement)
                return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            if (Math.abs(deltaY) > Math.abs(deltaX))
                return;
            if (deltaX < 0) {
                e.preventDefault();
                currentElement.style.transform = `translateX(${deltaX}px)`;
                if (Math.abs(deltaX) > deleteThreshold)
                    currentElement.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                else
                    currentElement.style.backgroundColor = '';
            }
        }, { passive: false });
        container.addEventListener('touchend', (e) => {
            if (!currentElement)
                return;
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            if (deltaX < -swipeThreshold) {
                const id = currentElement.getAttribute(itemIdAttr);
                if (id) {
                    currentElement.style.transform = 'translateX(-100%)';
                    setTimeout(() => { onDelete(id); currentElement.style.transform = ''; currentElement.style.backgroundColor = ''; }, 200);
                }
                else {
                    currentElement.style.transform = '';
                }
            }
            else {
                currentElement.style.transform = '';
            }
            currentElement.style.backgroundColor = '';
            currentElement = null;
        }, { passive: true });
    },
    setupLongPress(elements, handler, duration = 500) {
        if (!elements || !handler)
            return;
        const els = elements instanceof NodeList ? Array.from(elements) : (Array.isArray(elements) ? elements : [elements]);
        els.forEach(el => {
            let timer;
            let startX, startY;
            el.addEventListener('touchstart', (e) => {
                if (e.target.closest('a, button'))
                    return;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                timer = setTimeout(() => {
                    if (navigator.vibrate)
                        navigator.vibrate(50);
                    e.preventDefault();
                    if (typeof handler === 'function')
                        handler(el, e);
                }, duration);
            }, { passive: false });
            el.addEventListener('touchmove', (e) => {
                if (Math.abs(e.touches[0].clientX - startX) > 10 || Math.abs(e.touches[0].clientY - startY) > 10) {
                    clearTimeout(timer);
                }
            }, { passive: true });
            el.addEventListener('touchend', () => clearTimeout(timer));
            el.addEventListener('touchcancel', () => clearTimeout(timer));
        });
    },
    showContextMenu(target, actions) {
        const existing = document.getElementById('contextMenu');
        if (existing)
            existing.remove();
        const menu = document.createElement('div');
        menu.id = 'contextMenu';
        menu.style.cssText = `position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; padding: 8px; min-width: 250px;`;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            menu.style.background = '#1f2937';
            menu.style.color = 'white';
        }
        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = `w-full text-left px-4 py-3 flex items-center gap-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${a.danger ? 'text-red-500' : ''}`;
            btn.innerHTML = `<span class="text-xl">${a.icon || ''}</span><span>${a.label}</span>`;
            btn.onclick = (e) => {
                e.stopPropagation();
                menu.remove();
                if (a.action)
                    a.action();
            };
            menu.appendChild(btn);
        });
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 9998;';
        overlay.onclick = () => { menu.remove(); overlay.remove(); };
        document.body.appendChild(overlay);
        document.body.appendChild(menu);
    },
    setupPullToRefresh(container, onRefresh) {
        if (!container || !onRefresh)
            return;
        let startY = 0;
        let pulling = false;
        container.addEventListener('touchstart', (e) => {
            if (container.scrollTop <= 0) {
                startY = e.touches[0].clientY;
                pulling = true;
            }
        }, { passive: true });
        container.addEventListener('touchmove', (e) => {
            if (!pulling)
                return;
            const split = e.touches[0].clientY - startY;
            if (split > 0 && container.scrollTop <= 0) {
                // Visual feedback could go here
            }
        }, { passive: true });
        container.addEventListener('touchend', async (e) => {
            if (!pulling)
                return;
            const split = e.changedTouches[0].clientY - startY;
            if (split > 80 && container.scrollTop <= 0) {
                await onRefresh();
            }
            pulling = false;
        }, { passive: true });
    },
    logNetworkInfo() { },
    runConnectivityProbe() {
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            this.updateConnectionStatus(false);
        }
    },
    updateConnectionStatus(online) {
        const s = this.qs('#connectionStatus');
        if (s) {
            s.textContent = online ? 'Online' : 'Offline';
            s.className = online ? 'online' : 'offline';
        }
        const banner = this.qs('#offlineBanner');
        if (banner) {
            if (online) {
                banner.classList.add('hidden');
            } else {
                banner.classList.remove('hidden');
            }
        }
        if (!online) {
            this.showToast('Sei offline: modifiche registrate localmente, sincronizzazione automatica al ritorno online.', { type: 'warning', duration: 4000 });
        } else if (this._wasOffline) {
            this.syncOfflineData();
        }
        this._wasOffline = !online;
    },
    reportError(error, context = {}) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            message: error?.message || String(error),
            stack: error?.stack || null,
            context: context || {},
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        };
        console.error('[AppError]', errorInfo);
        try {
            const raw = localStorage.getItem('app-recent-errors');
            const errors = raw ? JSON.parse(raw) : [];
            errors.unshift(errorInfo);
            if (errors.length > 10) errors.length = 10;
            localStorage.setItem('app-recent-errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('Could not save error to localStorage', e);
        }
        const userMsg = context.userMessage || 'Si è verificato un errore.';
        this.showToast(userMsg, { type: 'error', duration: 4000 });
        return errorInfo;
    },
    getRecentErrors() {
        try {
            const raw = localStorage.getItem('app-recent-errors');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },
    clearRecentErrors() {
        try {
            localStorage.removeItem('app-recent-errors');
        } catch {}
    },
    checkDataIntegrity() {
        return checkDataIntegrity(this.state);
    },
    async cleanOrphanPresences() {
        if (!this.currentUser) {
            this.showToast('Devi essere autenticato per pulire i dati orfani.', { type: 'error' });
            return { success: false, deletedCount: 0 };
        }
        const report = this.checkDataIntegrity();
        const { orphanPresencesNoScout, orphanPresencesNoActivity } = report.summary;
        const orphans = [...orphanPresencesNoScout, ...orphanPresencesNoActivity];
        if (orphans.length === 0) {
            this.showToast('Nessuna presenza orfana trovata.', { type: 'info' });
            return { success: true, deletedCount: 0 };
        }
        const orphanIds = new Set(orphans.map(p => p.id || `${p.esploratoreId}_${p.attivitaId}`));
        const initialCount = orphanIds.size;
        this.showLoadingOverlay('Pulizia presenze orfane in corso...');
        try {
            for (const p of orphans) {
                const docKey = p.id || `${p.esploratoreId}_${p.attivitaId}`;
                try {
                    await DATA.deletePresence(docKey, this.currentUser);
                } catch (err) {
                    console.warn('Delete presence warning:', docKey, err);
                }
            }
            this.state.presences = (this.state.presences || []).filter(p => {
                const key = p.id || `${p.esploratoreId}_${p.attivitaId}`;
                return !orphanIds.has(key);
            });
            if (typeof this.rebuildPresenceIndex === 'function') {
                this.rebuildPresenceIndex();
            }
            this.showToast(`Pulizia completata: ${initialCount} presenze orfane eliminate con successo.`, { type: 'success' });
            return { success: true, deletedCount: initialCount };
        } catch (err) {
            this.reportError(err, { userMessage: 'Errore durante la rimozione delle presenze orfane.' });
            return { success: false, deletedCount: 0, error: err };
        } finally {
            this.hideLoadingOverlay();
        }
    },
    renderCurrentPage() { },
    renderStaffSelectionList() {
        const c = this.qs('#staffListForSelection');
        if (c)
            c.innerHTML = (this.state.staff || []).map(s => `<button class="p-2 w-full text-left hover:bg-gray-100" onclick="UI.selectStaff('${s.id}')">${s.nome} ${s.cognome}</button>`).join('');
    },
    selectStaff(id) {
        this.selectedStaffId = id;
        const m = this.state.staff.find(s => s.id === id);
        if (this.qs('#selectedStaffName'))
            this.qs('#selectedStaffName').textContent = m ? `${m.nome} ${m.cognome}` : 'Nessuno';
        this.closeModal('staffSelectionModal');
        this.renderCurrentPage();
    },
    checkRateLimit(key) { return true; },
    debounceWithRateLimit(key, fn, ms) { setTimeout(fn, ms); },

    // ── Offline Detection & PWA ──────────────────────────────────────────────

    /**
     * Inizializza il rilevamento dello stato di connessione.
     * Mostra/nasconde il banner offline e aggiorna l'indicatore nell'header.
     * Da chiamare una volta all'avvio di ogni pagina.
     */
    // ── Offline Queue & Sincronizzazione a due vie ───────────────────────────
    _OFFLINE_QUEUE_KEY: 'maori_offline_sync_queue',

    /**
     * Recupera la coda delle operazioni salvate offline
     * @returns {Array<{id: string, action: string, data: any, timestamp: string}>}
     */
    getOfflineQueue() {
        try {
            const raw = localStorage.getItem(this._OFFLINE_QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    /**
     * Aggiunge un'operazione da sincronizzare al ritorno online
     * @param {string} action - Nome dell'operazione (es. 'updatePresence', 'addActivity')
     * @param {any} data - Payload dell'operazione
     */
    addToOfflineQueue(action, data) {
        try {
            const queue = this.getOfflineQueue();
            const item = {
                id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                action,
                data,
                timestamp: new Date().toISOString()
            };
            queue.push(item);
            localStorage.setItem(this._OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            this.updateSyncBadge();
            return item;
        } catch (e) {
            console.warn('[OfflineQueue] Impossibile salvare:', e);
            return null;
        }
    },

    /**
     * Pulisce la coda di sincronizzazione
     */
    clearOfflineQueue() {
        try {
            localStorage.removeItem(this._OFFLINE_QUEUE_KEY);
            this.updateSyncBadge();
        } catch {}
    },

    /**
     * Restituisce il numero di modifiche in attesa di sincronizzazione
     * @returns {number}
     */
    getPendingSyncCount() {
        return this.getOfflineQueue().length;
    },

    /**
     * Aggiorna eventuale badge UI delle modifiche pendenti
     */
    updateSyncBadge() {
        const count = this.getPendingSyncCount();
        const badge = document.getElementById('pendingSyncBadge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },

    /**
     * Esegue la sincronizzazione a due vie al ritorno online da uscite o campi:
     * 1. Push: Invia tutte le mutazioni accumulate offline verso Firestore/Remote Adapter
     * 2. Pull: Scarica lo stato più recente dal server per allineare la cache locale
     * 3. Rinfresca la UI corrente
     */
    async syncOfflineData() {
        const queue = this.getOfflineQueue();
        let syncedCount = 0;

        if (queue.length > 0) {
            this.showToast(`Sincronizzazione in corso (${queue.length} modifiche)...`, { type: 'info', duration: 2500 });
            const remaining = [];

            for (const item of queue) {
                try {
                    switch (item.action) {
                        case 'updatePresence':
                            await DATA.updatePresence(item.data.id || `${item.data.scoutId}_${item.data.activityId}`, item.data);
                            break;
                        case 'addActivity':
                            await DATA.addActivity(item.data, this.currentUser);
                            break;
                        case 'updateActivity':
                            await DATA.updateActivity(item.data, this.currentUser);
                            break;
                        case 'updateScout':
                            await DATA.updateScout(item.data.id, item.data, this.currentUser);
                            break;
                        case 'addScorta':
                            await DATA.addScorta(item.data, this.currentUser);
                            break;
                        case 'updateScorta':
                            await DATA.updateScorta(item.data.id, item.data, this.currentUser);
                            break;
                        case 'addCustomDeadline':
                            await DATA.addCustomDeadline(item.data, this.currentUser);
                            break;
                        case 'addGaraPunti':
                            await DATA.addGaraPunti(item.data, this.currentUser);
                            break;
                        default:
                            console.warn('[OfflineSync] Azione non riconosciuta:', item.action);
                    }
                    syncedCount++;
                } catch (err) {
                    console.error('[OfflineSync] Errore sincronizzazione item:', item, err);
                    remaining.push(item);
                }
            }

            if (remaining.length > 0) {
                localStorage.setItem(this._OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
            } else {
                this.clearOfflineQueue();
            }
        }

        // PULL: Invalida la cache locale e scarica i dati remoti aggiornati
        try {
            if (DATA.cache && typeof DATA.cache.invalidate === 'function') {
                DATA.cache.invalidate();
            }
            if (typeof DATA.loadAll === 'function') {
                const fresh = await DATA.loadAll(true);
                if (fresh) {
                    this.state = fresh;
                    if (typeof this.rebuildPresenceIndex === 'function') {
                        this.rebuildPresenceIndex();
                    }
                }
            }
        } catch (pullErr) {
            console.warn('[OfflineSync] Errore pull dati aggiornati:', pullErr);
        }

        // Aggiorna la vista se presente
        if (typeof this.renderCurrentPage === 'function') {
            this.renderCurrentPage();
        }

        if (syncedCount > 0) {
            this.showToast(`✅ Sincronizzazione completata: ${syncedCount} modifiche inviate e dati aggiornati!`, { type: 'success', duration: 4000 });
        } else {
            this.showToast('✅ Dati allineati con il server.', { type: 'success', duration: 2500 });
        }

        return { syncedCount, remainingCount: this.getPendingSyncCount() };
    },

    setupOfflineDetection() {
        this.updateConnectionIndicator(navigator.onLine);
        if (!navigator.onLine) this._showOfflineBanner();

        window.addEventListener('online', async () => {
            this._hideOfflineBanner();
            this.updateConnectionIndicator(true);
            await this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this._showOfflineBanner();
            this.updateConnectionIndicator(false);
            this.showToast('⚠️ Sei offline. Le modifiche verranno sincronizzate alla riconnessione.', { type: 'warning', duration: 4000 });
        });
    },

    /** Mostra il banner offline */
    _showOfflineBanner() {
        const banner = document.getElementById('offlineBanner');
        if (banner) {
            banner.classList.remove('hidden');
            banner.classList.add('flex');
        }
    },

    /** Nasconde il banner offline */
    _hideOfflineBanner() {
        const banner = document.getElementById('offlineBanner');
        if (banner) {
            banner.classList.add('hidden');
            banner.classList.remove('flex');
        }
    },

    /**
     * Aggiorna l'indicatore visivo di connessione nell'header.
     * @param {boolean} isOnline - true se online, false se offline
     */
    updateConnectionIndicator(isOnline) {
        const indicator = document.getElementById('connectionStatus');
        if (!indicator) return;
        const dot = indicator.querySelector('.status-dot');
        const label = indicator.querySelector('.status-text');

        indicator.classList.remove('hidden');
        indicator.classList.add('flex');

        if (isOnline) {
            indicator.style.backgroundColor = 'rgba(22, 163, 74, 0.25)';
            indicator.style.color = '#dcfce7';
            if (dot) { dot.style.backgroundColor = '#4ade80'; dot.style.animation = ''; }
            if (label) label.textContent = 'Online';
        } else {
            indicator.style.backgroundColor = 'rgba(220, 38, 38, 0.3)';
            indicator.style.color = '#fee2e2';
            if (dot) { dot.style.backgroundColor = '#f87171'; dot.style.animation = 'pulse 1.5s infinite'; }
            if (label) label.textContent = 'Offline';
        }
    },
};

