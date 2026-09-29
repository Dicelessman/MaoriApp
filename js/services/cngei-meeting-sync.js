/**
 * cngei-meeting-sync.js - Modulo per la sincronizzazione di riunioni, uscite e presenze con il Portale CNGEI (Passo 4)
 * @module services/cngei-meeting-sync
 */

/**
 * Converte date string, Date object o Firestore timestamp in oggetto Date valido
 */
function toDateObj(val) {
  if (!val) return new Date();
  if (val && typeof val.toDate === 'function') return val.toDate();
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Formatta una data nel formato ISO string richiesto dalle API CNGEI (YYYY-MM-DDTHH:mm:ss)
 */
function toIsoDateTime(date, defaultTime = '15:00:00') {
  const d = toDateObj(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  // Se l'input originale aveva già l'orario
  if (d.getHours() !== 0 || d.getMinutes() !== 0) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  return `${year}-${month}-${day}T${defaultTime}`;
}

/**
 * Prepara il payload per POST /meetings conforme a MeetingCreateModel
 */
export function prepareMeetingPayload(activity, compagineId) {
  if (!activity) throw new Error('Attività non valida');
  if (!compagineId) throw new Error('compagineId obbligatorio');

  const tipo = activity.tipo || 'Attività';
  const desc = (activity.descrizione || '').trim();
  const title = desc ? `${tipo} — ${desc}` : tipo;

  const isUscitaOCampo = tipo.toLowerCase().includes('uscita') || tipo.toLowerCase().includes('campo');
  const defaultStartTime = isUscitaOCampo ? '14:30:00' : '15:30:00';
  const defaultEndTime = isUscitaOCampo ? '18:00:00' : '18:30:00';

  const startDateTime = toIsoDateTime(activity.data, defaultStartTime);
  const endDate = activity.dataFine || activity.data;
  const endDateTime = toIsoDateTime(endDate, defaultEndTime);

  return {
    idCompagine: compagineId,
    title,
    description: desc || tipo,
    startDateTime,
    endDateTime,
    adultOnly: false
  };
}

/**
 * Mappa le presenze degli esploratori per la riunione
 */
export function prepareAttendancePayload(activityId, presences = [], scouts = []) {
  const actPresences = (presences || []).filter(p => p.attivitaId === activityId);
  const scoutMap = new Map((scouts || []).map(s => [s.id, s]));

  const presentIds = [];
  const absentIds = [];
  const unlinkedScouts = [];

  actPresences.forEach(p => {
    const scout = scoutMap.get(p.esploratoreId);
    if (!scout) return;

    if (scout.idCngei) {
      if (p.stato === 'Presente') {
        presentIds.push(scout.idCngei);
      } else if (p.stato === 'Assente') {
        absentIds.push(scout.idCngei);
      }
    } else {
      if (p.stato === 'Presente' || p.stato === 'Assente') {
        unlinkedScouts.push(scout);
      }
    }
  });

  return {
    presentIds,
    absentIds,
    unlinkedScouts
  };
}

/**
 * Sincronizza l'attività e le sue presenze con il Portale CNGEI
 */
export function findMatchingMeeting(activity, existingMeetings = []) {
  if (!Array.isArray(existingMeetings) || existingMeetings.length === 0) return null;

  const actDateStr = toIsoDateTime(activity.data).split('T')[0];
  const actDesc = (activity.descrizione || '').toLowerCase().trim();
  const actTipo = (activity.tipo || '').toLowerCase().trim();

  return existingMeetings.find(m => {
    const mDateStr = (m.startDateTime || '').split('T')[0];
    if (mDateStr !== actDateStr) return false;

    const mTitle = (m.title || '').toLowerCase();
    if (actDesc && mTitle.includes(actDesc)) return true;
    if (actTipo && mTitle.includes(actTipo)) return true;
    return true; // Stessa data per la stessa compagine
  });
}

/**
 * Sincronizza l'attività e le relative presenze
 */
export async function syncActivityToCngei(activity, presences, scouts, compagineId, cngeiServiceInstance) {
  let meetingId = activity.idMeetingCngei;

  // Se non abbiamo ancora un idMeetingCngei salvato, verifichiamo se esiste già su CNGEI
  if (!meetingId) {
    try {
      const existing = await cngeiServiceInstance.getMeetings();
      const match = findMatchingMeeting(activity, existing);
      if (match) {
        meetingId = match.id;
      }
    } catch (e) {
      console.warn('[CNGEI Meeting Sync] Impossibile verificare riunioni esistenti:', e.message);
    }
  }

  // Se ancora non esiste, creiamo la riunione
  if (!meetingId) {
    const createPayload = prepareMeetingPayload(activity, compagineId);
    const created = await cngeiServiceInstance.createMeeting(createPayload);
    meetingId = created?.id;
    if (!meetingId) {
      throw new Error('La creazione della riunione sul portale CNGEI non ha restituito un identificativo valido.');
    }
  }

  // Prepara e invia presenze
  const { presentIds, absentIds, unlinkedScouts } = prepareAttendancePayload(activity.id, presences, scouts);
  await cngeiServiceInstance.setMeetingAttendance(meetingId, presentIds, absentIds);

  return {
    meetingId,
    presentCount: presentIds.length,
    absentCount: absentIds.length,
    unlinkedCount: unlinkedScouts.length,
    unlinkedScouts
  };
}
