/**
 * Tests for Calendar Activity Time & Export (ICS, HTML, Adapter)
 * @module tests/calendar-export
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { LocalAdapter } from '../js/data/adapters/local-adapter.js';

describe('Calendar Time Fields & External Calendar Export', () => {
  describe('HTML Form Controls in calendario.html', () => {
    it('should include oraInizio and oraFine input fields in addActivityForm and cal_editActivityForm', () => {
      const htmlPath = resolve(__dirname, '../calendario.html');
      const html = readFileSync(htmlPath, 'utf-8');

      // Add form
      expect(html).toContain('id="activityOraInizio"');
      expect(html).toContain('id="activityOraFine"');
      expect(html).toContain('type="time"');

      // Edit form
      expect(html).toContain('id="cal_editActivityOraInizio"');
      expect(html).toContain('id="cal_editActivityOraFine"');
    });
  });

  describe('LocalAdapter Activity Persistence with Times', () => {
    let adapter;

    beforeEach(() => {
      adapter = new LocalAdapter();
      adapter.state.activities = [];
    });

    it('should persist oraInizio and oraFine on addActivity', async () => {
      const actId = await adapter.addActivity({
        tipo: 'Riunione',
        data: new Date('2026-10-24'),
        descrizione: 'Riunione Reparto',
        costo: 0,
        oraInizio: '15:30',
        oraFine: '18:00'
      }, { email: 'capo@scoutmaori.it' });

      const saved = adapter.state.activities.find(a => a.id === actId);
      expect(saved).toBeDefined();
      expect(saved.oraInizio).toBe('15:30');
      expect(saved.oraFine).toBe('18:00');
    });

    it('should update oraInizio and oraFine on updateActivity', async () => {
      const actId = await adapter.addActivity({
        tipo: 'Uscita',
        data: new Date('2026-11-07'),
        dataFine: new Date('2026-11-08'),
        descrizione: 'Uscita San Giorgio',
        costo: 15,
        oraInizio: '08:30',
        oraFine: '17:00'
      }, { email: 'capo@scoutmaori.it' });

      await adapter.updateActivity({
        id: actId,
        oraInizio: '09:00',
        oraFine: '16:30'
      }, { email: 'capo@scoutmaori.it' });

      const updated = adapter.state.activities.find(a => a.id === actId);
      expect(updated.oraInizio).toBe('09:00');
      expect(updated.oraFine).toBe('16:30');
    });
  });

  describe('ICS Export Logic with RFC 5545 Timed & All-Day Events', () => {
    function generateICS(activities) {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Reparto Maori//Calendario Attività//IT',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Reparto Maori - Attività',
        'X-WR-TIMEZONE:Europe/Rome',
        'BEGIN:VTIMEZONE',
        'TZID:Europe/Rome',
        'X-LIC-LOCATION:Europe/Rome',
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:+0100',
        'TZOFFSETTO:+0200',
        'TZNAME:CEST',
        'DTSTART:19700329T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:+0200',
        'TZOFFSETTO:+0100',
        'TZNAME:CET',
        'DTSTART:19701025T030000',
        'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
        'END:STANDARD',
        'END:VTIMEZONE'
      ];

      const formatICSDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
      };

      const formatICSDateTime = (date, hours = 0, minutes = 0) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        return `${year}${month}${day}T${hh}${mm}00`;
      };

      const escapeICS = (str) => {
        if (!str) return '';
        return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
      };

      activities.forEach(activity => {
        const startDate = new Date(activity.data);
        if (isNaN(startDate)) return;

        const uid = `${activity.id}@repartomaori.it`;
        const summary = escapeICS(`${activity.tipo}: ${activity.descrizione}`);

        let orarioInfo = '';
        if (activity.oraInizio && activity.oraFine) {
          orarioInfo = ` - Orario: ${activity.oraInizio} - ${activity.oraFine}`;
        } else if (activity.oraInizio) {
          orarioInfo = ` - Inizio: ${activity.oraInizio}`;
        } else if (activity.oraFine) {
          orarioInfo = ` - Fine/Uscita: ${activity.oraFine}`;
        }

        const description = escapeICS(activity.descrizione + orarioInfo + (activity.costo ? ` - Costo: €${activity.costo}` : ''));
        const hasTime = !!(activity.oraInizio || activity.oraFine);

        let dtstartLine, dtendLine;

        if (!hasTime) {
          const endDate = activity.dataFine ? new Date(activity.dataFine) : new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          dtstartLine = `DTSTART;VALUE=DATE:${formatICSDate(startDate)}`;
          dtendLine = `DTEND;VALUE=DATE:${formatICSDate(endDate)}`;
        } else {
          let sh = 9, sm = 0;
          if (activity.oraInizio) {
            const parts = activity.oraInizio.split(':').map(Number);
            if (!isNaN(parts[0])) sh = parts[0];
            if (!isNaN(parts[1])) sm = parts[1];
          } else if (activity.oraFine) {
            const parts = activity.oraFine.split(':').map(Number);
            const eh = !isNaN(parts[0]) ? parts[0] : 18;
            const em = !isNaN(parts[1]) ? parts[1] : 0;
            sh = Math.max(0, eh - 2);
            sm = em;
          }

          const endDate = activity.dataFine ? new Date(activity.dataFine) : new Date(startDate);
          let eh, em;
          if (activity.oraFine) {
            const parts = activity.oraFine.split(':').map(Number);
            eh = !isNaN(parts[0]) ? parts[0] : (sh + 2);
            em = !isNaN(parts[1]) ? parts[1] : sm;
          } else {
            eh = sh + 2;
            em = sm;
            if (eh >= 24) {
              eh = 23;
              em = 59;
            }
          }

          const isSingleDay = !activity.dataFine || formatICSDate(startDate) === formatICSDate(endDate);
          if (isSingleDay && (eh < sh || (eh === sh && em <= sm))) {
            eh = Math.min(23, sh + 2);
          }

          dtstartLine = `DTSTART;TZID=Europe/Rome:${formatICSDateTime(startDate, sh, sm)}`;
          dtendLine = `DTEND;TZID=Europe/Rome:${formatICSDateTime(endDate, eh, em)}`;
        }

        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          dtstartLine,
          dtendLine,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          'END:VEVENT'
        );
      });

      icsContent.push('END:VCALENDAR');
      return icsContent.join('\r\n');
    }

    it('should generate all-day VEVENT when times are omitted', () => {
      const ics = generateICS([{
        id: 'act_all_day',
        tipo: 'Campo',
        data: '2026-07-20',
        dataFine: '2026-07-25',
        descrizione: 'Campo Estivo'
      }]);

      expect(ics).toContain('DTSTART;VALUE=DATE:20260720');
      expect(ics).toContain('DTEND;VALUE=DATE:20260726'); // Exclusive +1
      expect(ics).toContain('SUMMARY:Campo: Campo Estivo');
    });

    it('should generate timed VEVENT with TZID=Europe/Rome when start and end times are present', () => {
      const ics = generateICS([{
        id: 'act_meeting',
        tipo: 'Riunione',
        data: '2026-10-24',
        oraInizio: '15:30',
        oraFine: '18:00',
        descrizione: 'Riunione Settimanale'
      }]);

      expect(ics).toContain('DTSTART;TZID=Europe/Rome:20261024T153000');
      expect(ics).toContain('DTEND;TZID=Europe/Rome:20261024T180000');
      expect(ics).toContain('Orario: 15:30 - 18:00');
      expect(ics).toContain('TZID:Europe/Rome');
    });

    it('should generate timed VEVENT across days with multi-day start and end times', () => {
      const ics = generateICS([{
        id: 'act_hike',
        tipo: 'Uscita',
        data: '2026-11-14',
        dataFine: '2026-11-15',
        oraInizio: '08:00',
        oraFine: '17:00',
        descrizione: 'Uscita alle Gole'
      }]);

      expect(ics).toContain('DTSTART;TZID=Europe/Rome:20261114T080000');
      expect(ics).toContain('DTEND;TZID=Europe/Rome:20261115T170000');
    });

    it('should calculate end time gracefully if only oraInizio is provided', () => {
      const ics = generateICS([{
        id: 'act_only_start',
        tipo: 'Riunione',
        data: '2026-10-31',
        oraInizio: '16:00',
        descrizione: 'Attività speciale'
      }]);

      expect(ics).toContain('DTSTART;TZID=Europe/Rome:20261031T160000');
      expect(ics).toContain('DTEND;TZID=Europe/Rome:20261031T180000'); // +2 hours default
    });
  });
});
