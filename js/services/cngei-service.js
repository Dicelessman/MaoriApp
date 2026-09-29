/**
 * CNGEI Portal Service — Client-side Integration for MaoriApp2
 * Comunica esclusivamente tramite il proxy sicuro (/api/cngei/...)
 * senza MAI esporre il token associativo al browser.
 */

export class CngeiService {
  constructor(baseUrl = '/api/cngei') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this._statusCache = null;
    this._statusCacheTime = 0;
  }

  /**
   * Helper generico per chiamate fetch verso il proxy
   */
  async _request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch {
          errData = { message: `HTTP ${response.status} ${response.statusText}` };
        }
        const error = new Error(errData.message || errData.error || `Errore richiesta CNGEI: HTTP ${response.status}`);
        error.status = response.status;
        error.data = errData;
        throw error;
      }

      // Se 204 No Content o risposta vuota
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.warn(`[CNGEI Service] Errore chiamata ${cleanEndpoint}:`, err.message);
      throw err;
    }
  }

  /**
   * Verifica lo stato di connessione con il portale CNGEI
   * e recupera i dettagli del Capo Unità, Sezione, Gruppo e Reparto.
   * @param {boolean} forceRefresh - Se forzare l'aggiornamento saltando la cache
   */
  async checkConnection(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this._statusCache && (now - this._statusCacheTime < 30000)) {
      return this._statusCache;
    }

    try {
      // 1. Profilo utente
      const me = await this._request('/persona/me');
      
      // 2. Gruppi e Unità associate all'utente
      let gruppi = [];
      try {
        gruppi = await this._request('/gruppo');
      } catch (e) {
        console.warn('[CNGEI Service] Impossibile recuperare i gruppi:', e.message);
      }

      const primoGruppo = gruppi && gruppi.length > 0 ? gruppi[0] : null;
      const unitaReparto = primoGruppo?.unita?.find(u => u.tipo === 'REPARTO') || null;

      const result = {
        connected: true,
        user: {
          alias: me?.alias || 'Capo Reparto',
          avatar: me?.avatar || null,
          brevetti: me?.brevetti || [],
          wbcr: (me?.brevetti || []).some(b => b.idTipo === 'WB_CR' || b.tipo?.toLowerCase().includes('capi reparto'))
        },
        sezione: primoGruppo?.sezione?.nome || 'TORINO',
        idSezione: primoGruppo?.idSezione || null,
        gruppo: primoGruppo?.numero ? `Gruppo ${primoGruppo.numero}` : 'Gruppo 4',
        idGruppo: primoGruppo?.id || null,
        unita: unitaReparto ? `Reparto ${primoGruppo?.numero || 4}` : 'Reparto Maori',
        idUnita: unitaReparto?.id || null,
        timestamp: new Date().toISOString()
      };

      this._statusCache = result;
      this._statusCacheTime = now;
      return result;
    } catch (err) {
      const errorResult = {
        connected: false,
        error: err.message || 'Connessione al portale CNGEI non riuscita',
        timestamp: new Date().toISOString()
      };
      this._statusCache = errorResult;
      this._statusCacheTime = now;
      return errorResult;
    }
  }

  /**
   * Recupera l'elenco dei membri registrati nel Reparto su portale CNGEI
   */
  async getMembers() {
    const list = await this._request('/persona');
    if (!Array.isArray(list)) return [];

    // Arricchisce e suddivide tra Esploratori e Staff
    return list.map(p => {
      const incarichi = (p.incarichiCorrenti || []).map(i => i.idTipoIncarico);
      const isStaff = incarichi.includes('CR') || incarichi.includes('VCR') || incarichi.includes('SISR');
      const isEsploratore = incarichi.includes('E') || (!isStaff && incarichi.length > 0);

      return {
        idCngei: p.id,
        tessera: p.tessera,
        nome: p.nome,
        cognome: p.cognome,
        alias: p.alias,
        dataNascita: p.dataNascita,
        luogoNascita: p.luogoNascita,
        codiceFiscale: p.codiceFiscale,
        sesso: p.sesso,
        indirizzo: p.indirizzo,
        comune: p.comune,
        cap: p.cap,
        provincia: p.provincia,
        telefono: p.telefono || p.telefono2,
        email: p.email || p.email2,
        // Contatti genitori
        genitore1: {
          nome: p.nomeGenitore1,
          cognome: p.cognomeGenitore1,
          telefono: p.telefonoGenitore1,
          email: p.emailGenitore1
        },
        genitore2: {
          nome: p.nomeGenitore2,
          cognome: p.cognomeGenitore2,
          telefono: p.telefonoGenitore2,
          email: p.emailGenitore2
        },
        // Consensi ufficiali portale
        consensi: {
          privacy: !!p.privacyConsentGranted,
          privacyScadenza: p.privacyConsentTokenExpiration,
          immagini: !!p.imageRightsConsentGranted,
          medico: !!p.medicalConsentGranted,
          genitoreSingolo: !!p.hasSingleParentAttachment,
          procura: !!p.hasPowerOfAttorney
        },
        incarichi: incarichi,
        isStaff,
        isEsploratore,
        raw: p
      };
    });
  }

  /**
   * Recupera i dati medici ufficiali di una persona dal portale CNGEI
   */
  async getMedicalData(idPersona) {
    if (!idPersona) throw new Error('idPersona obbligatorio');
    return await this._request(`/persona/${idPersona}/medical`);
  }

  /**
   * Recupera l'elenco delle riunioni / uscite di Reparto
   */
  async getMeetings() {
    const meetings = await this._request('/meetings');
    return Array.isArray(meetings) ? meetings : [];
  }

  /**
   * Crea una nuova riunione o uscita di Reparto su portale CNGEI
   */
  async createMeeting(meetingData) {
    return await this._request('/meetings', {
      method: 'POST',
      body: meetingData
    });
  }

  /**
   * Registra le presenze e le assenze per una riunione su portale CNGEI
   * @param {string} meetingId - ID UUID della riunione
   * @param {string[]} presentIds - Array di UUID persone presenti
   * @param {string[]} absentIds - Array di UUID persone assenti
   */
  async setMeetingAttendance(meetingId, presentIds = [], absentIds = []) {
    if (!meetingId) throw new Error('meetingId obbligatorio');
    return await this._request(`/meetings/${meetingId}/attendance`, {
      method: 'PATCH',
      body: {
        presentIds,
        absentIds
      }
    });
  }

  /**
   * Recupera tutti i tipi di progressione (Specialità PO e Tracce PV)
   */
  async getProgressioniTypes() {
    const types = await this._request('/progressioni/types');
    if (!Array.isArray(types)) return [];

    return types.filter(t => t.branca === 'E');
  }

  /**
   * Invia la convalida di una progressione o specialità al portale nazionale CNGEI
   * @param {string} idPersona - UUID dell'esploratore su CNGEI
   * @param {string} idProgressioneType - UUID della specialità o traccia
   * @param {string} obtainedAt - Data YYYY-MM-DD
   */
  async createProgressione(idPersona, idProgressioneType, obtainedAt) {
    if (!idPersona || !idProgressioneType || !obtainedAt) {
      throw new Error('Parametri idPersona, idProgressioneType e obtainedAt obbligatori');
    }
    return await this._request('/progressioni', {
      method: 'POST',
      body: {
        idPersona,
        idProgressioneType,
        obtainedAt
      }
    });
  }

  /**
   * Recupera eventi nazionali e regionali
   */
  async getEventi() {
    return await this._request('/evento');
  }
}

// Istanza singleton per uso globale nell'applicazione
export const cngeiService = new CngeiService();

if (typeof window !== 'undefined') {
  window.CNGEI = cngeiService;
}
