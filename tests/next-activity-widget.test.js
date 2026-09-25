import { describe, it, expect } from 'vitest';
import { findUpcomingActivity, computeActivityDashboardKPIs } from '../js/utils/utils.js';

describe('Widget Prossima Attività - Helper Functions', () => {
    const fixedToday = new Date('2026-05-10T10:00:00Z');

    describe('findUpcomingActivity', () => {
        it('dovrebbe restituire null se la lista attività è vuota o non valida', () => {
            expect(findUpcomingActivity([])).toBeNull();
            expect(findUpcomingActivity(null)).toBeNull();
            expect(findUpcomingActivity([{ data: 'invalid-date' }])).toBeNull();
        });

        it('dovrebbe identificare correttamente l\'attività di oggi', () => {
            const activities = [
                { id: 'act_past', titolo: 'Uscita Passata', data: '2026-05-01' },
                { id: 'act_today', titolo: 'Riunione Oggi', data: '2026-05-10' },
                { id: 'act_future', titolo: 'San Giorgio', data: '2026-05-20' }
            ];

            const result = findUpcomingActivity(activities, fixedToday);
            expect(result).not.toBeNull();
            expect(result.activity.id).toBe('act_today');
            expect(result.isToday).toBe(true);
            expect(result.isFuture).toBe(true);
            expect(result.diffDays).toBe(0);
            expect(result.badgeText).toBe('🔴 OGGI');
        });

        it('dovrebbe identificare correttamente l\'attività di domani', () => {
            const activities = [
                { id: 'act_past', titolo: 'Uscita Passata', data: '2026-05-01' },
                { id: 'act_tomorrow', titolo: 'Uscita Domani', data: '2026-05-11' },
                { id: 'act_future', titolo: 'Campo Estivo', data: '2026-07-20' }
            ];

            const result = findUpcomingActivity(activities, fixedToday);
            expect(result).not.toBeNull();
            expect(result.activity.id).toBe('act_tomorrow');
            expect(result.isTomorrow).toBe(true);
            expect(result.diffDays).toBe(1);
            expect(result.badgeText).toBe('⚡ DOMANI');
        });

        it('dovrebbe calcolare i giorni mancanti per una data futura', () => {
            const activities = [
                { id: 'act_future', titolo: 'Caccia al tesoro', data: '2026-05-15' }
            ];

            const result = findUpcomingActivity(activities, fixedToday);
            expect(result).not.toBeNull();
            expect(result.diffDays).toBe(5);
            expect(result.badgeText).toBe('⏳ Tra 5 giorni');
        });

        it('se non ci sono attività future, dovrebbe restituire la più recente nel passato con isPast=true', () => {
            const activities = [
                { id: 'act_old', titolo: 'Apertura', data: '2025-10-15' },
                { id: 'act_recent_past', titolo: 'Pernotto Recente', data: '2026-05-08' }
            ];

            const result = findUpcomingActivity(activities, fixedToday);
            expect(result).not.toBeNull();
            expect(result.activity.id).toBe('act_recent_past');
            expect(result.isPast).toBe(true);
            expect(result.diffDays).toBe(-2);
            expect(result.badgeText).toBe('Svolta 2 gg fa');
        });
    });

    describe('computeActivityDashboardKPIs', () => {
        const mockActivity = {
            id: 'act_101',
            titolo: 'Uscita di Primavera',
            data: '2026-05-15',
            costo: 15.0
        };

        const mockScouts = [
            {
                id: 'scout_1',
                nome: 'Marco',
                cognome: 'Rossi',
                archived: false,
                scadenzaCertificatoMedico: '2026-08-01',
                consensoPrivacy: true,
                schedaSanitariaConsegnata: true
            },
            {
                id: 'scout_2',
                nome: 'Giulia',
                cognome: 'Bianchi',
                archived: false,
                scadenzaCertificatoMedico: '2026-04-01', // Scaduto rispetto a 2026-05-15!
                consensoPrivacy: true,
                schedaSanitariaConsegnata: true
            },
            {
                id: 'scout_3',
                nome: 'Luca',
                cognome: 'Verdi',
                archived: false,
                scadenzaCertificatoMedico: '2026-09-01',
                consensoPrivacy: true,
                schedaSanitariaConsegnata: false // Scheda sanitaria mancante!
            },
            {
                id: 'scout_4',
                nome: 'Chiara',
                cognome: 'Neri',
                archived: false,
                scadenzaCertificatoMedico: '2026-10-01',
                consensoPrivacy: true,
                schedaSanitariaConsegnata: true
            },
            {
                id: 'scout_archived',
                nome: 'Ex',
                cognome: 'Scout',
                archived: true
            }
        ];

        const mockPresences = [
            { attivitaId: 'act_101', esploratoreId: 'scout_1', stato: 'Presente', pagato: true },
            { attivitaId: 'act_101', esploratoreId: 'scout_2', stato: 'Presente', pagato: false },
            { attivitaId: 'act_101', esploratoreId: 'scout_3', stato: 'Presente', pagato: false },
            { attivitaId: 'act_101', esploratoreId: 'scout_4', stato: 'Assente', pagato: false }
        ];

        it('dovrebbe calcolare accuratamente i conteggi di presenza e percentuali', () => {
            const kpis = computeActivityDashboardKPIs(mockActivity, mockScouts, mockPresences, fixedToday);
            expect(kpis).not.toBeNull();
            expect(kpis.totalActiveScouts).toBe(4); // Esclude scout_archived
            expect(kpis.presentCount).toBe(3);
            expect(kpis.absentCount).toBe(1);
            expect(kpis.unrecordedCount).toBe(0);
            expect(kpis.attendancePercentage).toBe(75); // 3 / 4 = 75%
        });

        it('dovrebbe calcolare le quote saldate e da riscuotere', () => {
            const kpis = computeActivityDashboardKPIs(mockActivity, mockScouts, mockPresences, fixedToday);
            expect(kpis.isPaidActivity).toBe(true);
            expect(kpis.cost).toBe(15.0);
            expect(kpis.paidCount).toBe(1); // Solo scout_1 ha pagato
            expect(kpis.unpaidCount).toBe(2); // scout_2 e scout_3 sono presenti ma non hanno pagato
            expect(kpis.totalCollected).toBe(15.0); // 1 * 15
            expect(kpis.totalExpected).toBe(45.0); // 3 presenti * 15
            expect(kpis.totalPending).toBe(30.0); // 2 non saldati * 15
            expect(kpis.paymentPercentage).toBe(33); // 1 / 3 ~= 33%
        });

        it('dovrebbe rilevare alert di sicurezza sanitaria tra i soli presenti', () => {
            const kpis = computeActivityDashboardKPIs(mockActivity, mockScouts, mockPresences, fixedToday);
            expect(kpis.isSafetyCompliant).toBe(false);
            expect(kpis.medicalAlerts.length).toBe(2);

            // scout_2 ha certificato scaduto
            const alertCert = kpis.medicalAlerts.find(a => a.scout.id === 'scout_2');
            expect(alertCert).toBeDefined();
            expect(alertCert.warningType).toBe('expired');

            // scout_3 ha scheda sanitaria mancante
            const alertDoc = kpis.medicalAlerts.find(a => a.scout.id === 'scout_3');
            expect(alertDoc).toBeDefined();
            expect(alertDoc.warningType).toBe('docs');
        });

        it('se tutti i presenti hanno documenti in regola, isSafetyCompliant deve essere true', () => {
            const onlyCompliantPresences = [
                { attivitaId: 'act_101', esploratoreId: 'scout_1', stato: 'Presente', pagato: true }
            ];

            const kpis = computeActivityDashboardKPIs(mockActivity, mockScouts, onlyCompliantPresences, fixedToday);
            expect(kpis.isSafetyCompliant).toBe(true);
            expect(kpis.medicalAlerts.length).toBe(0);
        });

        it('gestisce correttamente attività gratuite con costo = 0', () => {
            const freeActivity = { id: 'act_free', titolo: 'Riunione', data: '2026-05-15', costo: 0 };
            const kpis = computeActivityDashboardKPIs(freeActivity, mockScouts, mockPresences, fixedToday);
            expect(kpis.isPaidActivity).toBe(false);
            expect(kpis.cost).toBe(0);
            expect(kpis.totalExpected).toBe(0);
        });
    });
});
