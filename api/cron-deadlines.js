// api/cron-deadlines.js - Vercel Cron & Serverless Endpoint per Notifiche Push FCM Scadenze
// Controlla scadenze, certificati medici, attività e compleanni su Firestore e invia push tramite FCM HTTP v1 API.

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Esegue una richiesta HTTPS e restituisce { ok, status, data }.
 * Usata come transport di default in assenza di mock nei test.
 */
function defaultTransport({ url, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqHeaders = { ...headers };
    let payloadStr = null;

    if (body !== null && body !== undefined) {
      payloadStr = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
      if (!reqHeaders['Content-Length'] && !reqHeaders['content-length']) {
        reqHeaders['Content-Length'] = Buffer.byteLength(payloadStr);
      }
    }

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers: reqHeaders,
        timeout: 15000
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let data = raw;
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch (_) {
            // Mantieni testo grezzo se non è JSON
          }
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode || 500,
            data
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('HTTP timeout'));
    });
    req.on('error', reject);

    if (payloadStr !== null) {
      req.write(payloadStr);
    }
    req.end();
  });
}

/**
 * Legge opzionalmente una variabile da .env.local o .env in ambiente di sviluppo.
 */
function readEnvFallback(key) {
  try {
    const candidates = [
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../.env.local'),
      path.resolve(__dirname, '../.env')
    ];
    const regex = new RegExp(`^\\s*${key}\\s*=\\s*([^\\r\\n]+)`, 'm');
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(regex);
        if (match && match[1]) {
          return match[1].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  } catch (_) {
    // Ignora errori di lettura in ambienti serverless readonly
  }
  return '';
}

/**
 * Carica la configurazione del Service Account Firebase dalle variabili d'ambiente.
 */
function loadServiceAccountConfig(env = process.env) {
  const saRaw = env?.FIREBASE_SERVICE_ACCOUNT_JSON || (env === process.env ? readEnvFallback('FIREBASE_SERVICE_ACCOUNT_JSON') : '');

  if (saRaw) {
    try {
      let jsonStr = String(saRaw).trim();
      if (!jsonStr.startsWith('{')) {
        jsonStr = Buffer.from(jsonStr, 'base64').toString('utf8').trim();
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed.client_email && parsed.private_key) {
        return {
          configured: true,
          projectId: parsed.project_id || env?.FIREBASE_PROJECT_ID || 'presenziariomaori',
          clientEmail: parsed.client_email,
          privateKey: String(parsed.private_key).replace(/\\n/g, '\n')
        };
      }
    } catch (_) {
      // Fallback alle singole variabili
    }
  }

  const clientEmail = env?.FIREBASE_CLIENT_EMAIL || (env === process.env ? readEnvFallback('FIREBASE_CLIENT_EMAIL') : '');
  const privateKeyRaw = env?.FIREBASE_PRIVATE_KEY || (env === process.env ? readEnvFallback('FIREBASE_PRIVATE_KEY') : '');
  const projectId = env?.FIREBASE_PROJECT_ID || (env === process.env ? readEnvFallback('FIREBASE_PROJECT_ID') : '') || 'presenziariomaori';

  if (clientEmail && privateKeyRaw) {
    return {
      configured: true,
      projectId,
      clientEmail,
      privateKey: String(privateKeyRaw).replace(/\\n/g, '\n')
    };
  }

  return { configured: false, projectId };
}

/**
 * Verifica l'autorizzazione Cron su richieste GET usando CRON_SECRET se configurato.
 */
function isAuthorizedRequest(req, env = process.env) {
  const secret = env?.CRON_SECRET;
  if (!secret) return true;

  const method = String(req?.method || 'GET').toUpperCase();
  const headers = req?.headers || {};
  const auth = headers.authorization || headers.Authorization || '';
  const cronHeader = headers['x-cron-secret'] || headers['X-Cron-Secret'] || '';
  const hasValidSecret = auth === `Bearer ${secret}` || cronHeader === secret;

  if (method === 'GET') {
    return hasValidSecret;
  }

  return true;
}

/**
 * Converte un singolo valore Firestore REST v1 in valore JavaScript nativo.
 */
function parseFirestoreValue(val) {
  if (!val || typeof val !== 'object') return val;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('stringValue' in val) return String(val.stringValue);
  if ('timestampValue' in val) return String(val.timestampValue);
  if ('referenceValue' in val) return String(val.referenceValue);
  if ('arrayValue' in val) {
    const arr = val.arrayValue?.values || [];
    return arr.map(parseFirestoreValue);
  }
  if ('mapValue' in val) {
    const mapFields = val.mapValue?.fields || {};
    const out = {};
    for (const [k, v] of Object.entries(mapFields)) {
      out[k] = parseFirestoreValue(v);
    }
    return out;
  }
  return val;
}

/**
 * Converte un documento Firestore REST v1 (`{ name, fields }`) in oggetto JS piano con `id`.
 */
function parseFirestoreDoc(doc) {
  if (!doc || typeof doc !== 'object') return null;
  const docId = doc.name ? String(doc.name).split('/').pop() : undefined;
  const fields = doc.fields || {};
  const result = {};
  for (const [k, v] of Object.entries(fields)) {
    result[k] = parseFirestoreValue(v);
  }
  if (docId) {
    result.id = docId;
  }
  return result;
}

/**
 * Converte un valore JavaScript nel formato tipizzato Firestore REST v1.
 */
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.filter((item) => item !== undefined).map(toFirestoreValue)
      }
    };
  }
  if (typeof val === 'object') {
    return {
      mapValue: {
        fields: toFirestoreFields(val)
      }
    };
  }
  return { stringValue: String(val) };
}

/**
 * Converte un oggetto JS piano in mappa `fields` per Firestore REST v1.
 */
function toFirestoreFields(obj = {}) {
  const fields = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (value === undefined) continue;
    fields[key] = toFirestoreValue(value);
  }
  return fields;
}

function _base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Genera e scambia un JWT firmato RS256 per ottenere un access token OAuth2 Google.
 */
async function getGoogleAccessToken(serviceAccount, transport = defaultTransport) {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = _base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = _base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.clientEmail,
      scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging',
      aud: 'https://oauth2.googleapis.com/token',
      iat: nowSec,
      exp: nowSec + 3600
    })
  );

  const unsignedJwt = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  signer.end();
  const signature = _base64UrlEncode(signer.sign(serviceAccount.privateKey));
  const assertion = `${unsignedJwt}.${signature}`;

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  }).toString();

  const res = await transport({
    url: 'https://oauth2.googleapis.com/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok || !res.data?.access_token) {
    throw new Error(`Impossibile ottenere token OAuth2 Google (status ${res.status})`);
  }
  return res.data.access_token;
}

/**
 * Carica tutti i documenti di una collezione Firestore tramite REST API v1.
 */
async function firestoreListCollection(projectId, accessToken, collectionName, transport = defaultTransport) {
  const docs = [];
  let pageToken = '';
  let pages = 0;

  do {
    const qs = new URLSearchParams({ pageSize: '300' });
    if (pageToken) qs.set('pageToken', pageToken);
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collectionName)}?${qs.toString()}`;
    const res = await transport({
      url,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      throw new Error(`Firestore GET ${collectionName} fallita (${res.status})`);
    }

    const list = Array.isArray(res.data?.documents) ? res.data.documents : [];
    for (const rawDoc of list) {
      const parsed = parseFirestoreDoc(rawDoc);
      if (parsed) docs.push(parsed);
    }

    pageToken = res.data?.nextPageToken || '';
    pages++;
  } while (pageToken && pages < 10);

  return docs;
}

/**
 * Crea un documento in Firestore tramite REST API v1.
 */
async function firestoreCreateDocument(projectId, accessToken, collectionName, payload, transport = defaultTransport) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collectionName)}`;
  const res = await transport({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: { fields: toFirestoreFields(payload) }
  });

  if (!res.ok) {
    throw new Error(`Firestore POST ${collectionName} fallita (${res.status})`);
  }
  return parseFirestoreDoc(res.data);
}

/**
 * Normalizza qualsiasi data (Date, ISO string, YYYY-MM-DD, Timestamp) a mezzanotte UTC.
 */
function _toUtcMidnight(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymdMatch) {
      const d = new Date(Date.UTC(Number(ymdMatch[1]), Number(ymdMatch[2]) - 1, Number(ymdMatch[3])));
      return isNaN(d.getTime()) ? null : d;
    }
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return null;
    return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
  }
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  if (typeof value === 'object' && ('seconds' in value || '_seconds' in value)) {
    const sec = Number(value.seconds ?? value._seconds);
    if (!Number.isFinite(sec)) return null;
    const d = new Date(sec * 1000);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  return null;
}

function _formatItDate(utcDate) {
  if (!utcDate) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(utcDate.getUTCDate())}/${pad(utcDate.getUTCMonth() + 1)}/${utcDate.getUTCFullYear()}`;
}

/**
 * Logica pura di valutazione scadenze, certificati medici, attività e compleanni per generare notifiche push.
 */
function evaluateDeadlinesForPush({ scadenze = [], scouts = [], activities = [], refDate = new Date(), force = false } = {}) {
  const today = _toUtcMidnight(refDate) || _toUtcMidnight(new Date());
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`;
  const currentYear = today.getUTCFullYear();
  const notifications = [];

  // 1. Scadenze personalizzate
  for (const d of scadenze || []) {
    if (!d || d.completata || !d.dataScadenza) continue;
    const target = _toUtcMidnight(d.dataScadenza);
    if (!target) continue;

    const daysDiff = Math.round((target - today) / 86400000);
    const hasCustomPreavviso =
      d.preavvisoGiorni !== undefined &&
      d.preavvisoGiorni !== null &&
      d.preavvisoGiorni !== '' &&
      Number.isFinite(Number(d.preavvisoGiorni));
    const maxDays = hasCustomPreavviso ? Number(d.preavvisoGiorni) : 3;

    const isUpcoming = daysDiff >= 0 && daysDiff <= maxDays;
    const isOverdue = daysDiff < 0 && (Boolean(d.notificaScaduta) || Boolean(force));
    if (!isUpcoming && !isOverdue) continue;

    const catPrefix = d.categoria ? `[${d.categoria}] ` : '';
    let title;
    let body;

    if (daysDiff < 0) {
      const ago = Math.abs(daysDiff);
      title = `🚨 Scadenza superata: ${d.titolo || 'Scadenza'}`;
      body = `${catPrefix}Scaduta da ${ago} ${ago === 1 ? 'giorno' : 'giorni'}`;
    } else {
      const when = daysDiff === 0 ? 'oggi!' : daysDiff === 1 ? 'domani!' : `tra ${daysDiff} giorni`;
      title = `⏰ Scadenza imminente: ${d.titolo || 'Scadenza'}`;
      body = `${catPrefix}Scade ${when}`;
    }

    notifications.push({
      reminderKey: `deadline_${d.id}_${todayStr}`,
      type: 'deadline_reminder',
      title,
      body,
      url: '/scadenze.html',
      notificationType: 'warning'
    });
  }

  // 2. Certificati medici in scadenza (<= 7 gg) o scaduti
  for (const scout of scouts || []) {
    if (!scout || scout.archived || !scout.san_cert_scadenza) continue;
    const target = _toUtcMidnight(scout.san_cert_scadenza);
    if (!target) continue;

    const daysDiff = Math.round((target - today) / 86400000);
    if (daysDiff > 7) continue;

    const fullName = `${scout.nome || ''} ${scout.cognome || ''}`.trim() || 'Esploratore';
    let statusLabel;
    if (daysDiff < 0) {
      statusLabel = `Scaduto (${Math.abs(daysDiff)} gg fa)`;
    } else {
      statusLabel = `In scadenza (${daysDiff === 0 ? 'Oggi' : daysDiff === 1 ? 'Domani' : `tra ${daysDiff} gg`})`;
    }

    notifications.push({
      reminderKey: `med_deadline_${scout.id}_${todayStr}`,
      type: 'deadline_reminder',
      title: `🩺 Certificato Medico: ${fullName}`,
      body: statusLabel,
      url: '/scadenze.html',
      notificationType: 'warning'
    });
  }

  // 3. Attività imminenti (prossimi 3 giorni)
  for (const act of activities || []) {
    if (!act || !act.data) continue;
    const target = _toUtcMidnight(act.data);
    if (!target) continue;

    const daysDiff = Math.round((target - today) / 86400000);
    if (daysDiff < 0 || daysDiff > 3) continue;

    const dateStr = _formatItDate(target);
    const costNum = parseFloat(act.costo || '0');
    const costText = costNum > 0 ? ` (Costo: €${costNum})` : '';

    notifications.push({
      reminderKey: `activity_${act.id}_${todayStr}`,
      type: 'activity_reminder',
      title: `📅 Attività imminente: ${act.descrizione || act.tipo || 'Attività'}`,
      body: `${act.tipo || 'Attività'} in programma il ${dateStr}${costText}.`,
      url: '/calendario.html',
      notificationType: 'reminder'
    });
  }

  // 4. Compleanni esploratori (prossimi 3 giorni)
  for (const scout of scouts || []) {
    if (!scout || scout.archived) continue;
    const dobRaw = scout.anag_dob || scout.dataNascita;
    const dob = _toUtcMidnight(dobRaw);
    if (!dob) continue;

    let bdayYear = currentYear;
    let bday = new Date(Date.UTC(bdayYear, dob.getUTCMonth(), dob.getUTCDate()));
    if (bday < today) {
      bdayYear += 1;
      bday = new Date(Date.UTC(bdayYear, dob.getUTCMonth(), dob.getUTCDate()));
    }

    const daysDiff = Math.round((bday - today) / 86400000);
    if (daysDiff < 0 || daysDiff > 3) continue;

    const turningAge = bdayYear - dob.getUTCFullYear();
    const when = daysDiff === 0 ? 'oggi!' : daysDiff === 1 ? 'domani!' : `tra ${daysDiff} giorni!`;
    const ageText = turningAge > 0 ? ` Compie ${turningAge} anni.` : '';
    const fullName = `${scout.nome || ''} ${scout.cognome || ''}`.trim();

    notifications.push({
      reminderKey: `birthday_${scout.id}_${bdayYear}`,
      type: 'birthday_reminder',
      title: `🎂 Compleanno di ${fullName}`,
      body: `${scout.nome || "L'esploratore"} festeggia il compleanno ${when}${ageText}`,
      url: '/esploratori.html',
      notificationType: 'info'
    });
  }

  return notifications;
}

/**
 * Invia una notifica Web Push tramite FCM HTTP v1 API.
 */
async function sendFcmPushMessage({ projectId, accessToken, token, notification, transport = defaultTransport }) {
  const url = `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/messages:send`;
  const tag = String(notification?.reminderKey || notification?.type || 'maori-notification');
  const link = notification?.url || '/scadenze.html';
  const title = String(notification?.title || 'Reparto Maori');
  const body = String(notification?.body || '');

  const message = {
    token,
    notification: { title, body },
    webpush: {
      notification: {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag
      },
      fcm_options: {
        link
      }
    },
    data: {
      url: link,
      tag,
      type: String(notification?.type || 'deadline_reminder'),
      title,
      body
    }
  };

  return await transport({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: { message }
  });
}

function _extractTokenTargets(fcmDocs = []) {
  const byUser = new Map();
  for (const doc of fcmDocs) {
    const userId = doc.userId || doc.id;
    if (!userId) continue;
    const rawTokens = [];
    if (doc.token) rawTokens.push(doc.token);
    if (Array.isArray(doc.tokens)) rawTokens.push(...doc.tokens);
    const uniqueTokens = Array.from(new Set(rawTokens.map((t) => String(t || '').trim()).filter(Boolean)));
    if (uniqueTokens.length === 0) continue;

    const existing = byUser.get(userId) || [];
    byUser.set(userId, Array.from(new Set([...existing, ...uniqueTokens])));
  }
  return byUser;
}

async function _parseBody(req) {
  if (req?.body && typeof req.body === 'object') return req.body;
  if (typeof req?.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return {};
}

/**
 * Handler HTTP Vercel per /api/cron-deadlines (GET Cron giornaliero + POST invio immediato).
 */
async function handler(req, res, options = {}) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Cron-Secret');

  const method = String(req?.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method !== 'GET' && method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const env = options.env || process.env;
  const transport = options.transport || defaultTransport;

  if (!isAuthorizedRequest(req, env)) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  const serviceAccount = loadServiceAccountConfig(env);
  if (!serviceAccount.configured) {
    res.status(200).json({
      ok: true,
      status: 'unconfigured',
      configured: false,
      message: 'FIREBASE_SERVICE_ACCOUNT_JSON non configurato nelle variabili ambiente del server.'
    });
    return;
  }

  try {
    const accessToken = await getGoogleAccessToken(serviceAccount, transport);
    const projectId = serviceAccount.projectId;
    const body = method === 'POST' ? await _parseBody(req) : {};
    const fcmDocs = await firestoreListCollection(projectId, accessToken, 'fcm-tokens', transport);
    const userTokenMap = _extractTokenTargets(fcmDocs);

    // Modalità POST singola notifica immediata
    if (method === 'POST' && body.action === 'send_single' && body.item) {
      const item = body.item;
      const singleNotification = {
        reminderKey: item.tag || `manual_deadline_${item.id || Date.now()}`,
        type: item.type || 'deadline_reminder',
        title: item.titolo || item.title || '⏰ Scadenza Reparto',
        body: item.body || item.descrizione || 'Promemoria scadenza',
        url: item.url || '/scadenze.html',
        notificationType: 'warning'
      };

      const sentTokens = new Set();
      let fcmSent = 0;
      let fcmFailed = 0;

      for (const tokens of userTokenMap.values()) {
        for (const token of tokens) {
          if (sentTokens.has(token)) continue;
          sentTokens.add(token);
          const pushRes = await sendFcmPushMessage({
            projectId,
            accessToken,
            token,
            notification: singleNotification,
            transport
          }).catch(() => ({ ok: false }));
          if (pushRes?.ok) fcmSent++;
          else fcmFailed++;
        }
      }

      res.status(200).json({
        ok: true,
        action: 'send_single',
        tokensTargeted: sentTokens.size,
        fcmSent,
        fcmFailed
      });
      return;
    }

    // Modalità GET (Cron) o POST (run_check)
    const [scadenze, scouts, activities, existingNotifications] = await Promise.all([
      firestoreListCollection(projectId, accessToken, 'scadenze', transport),
      firestoreListCollection(projectId, accessToken, 'scouts', transport),
      firestoreListCollection(projectId, accessToken, 'activities', transport),
      firestoreListCollection(projectId, accessToken, 'in-app-notifications', transport)
    ]);

    const refDate = options.refDate || new Date();
    const candidates = evaluateDeadlinesForPush({
      scadenze,
      scouts,
      activities,
      refDate,
      force: Boolean(body?.force)
    });

    const alreadySentKeys = new Set(
      existingNotifications
        .filter((n) => n && n.reminderKey)
        .map((n) => `${n.userId || ''}::${n.reminderKey}`)
    );

    let fcmSent = 0;
    let fcmFailed = 0;
    let inAppCreated = 0;
    let skippedDuplicates = 0;

    for (const notif of candidates) {
      const sentTokensForNotif = new Set();
      for (const [userId, tokens] of userTokenMap.entries()) {
        const dedupKey = `${userId}::${notif.reminderKey}`;
        if (alreadySentKeys.has(dedupKey)) {
          skippedDuplicates++;
          continue;
        }
        alreadySentKeys.add(dedupKey);

        for (const token of tokens) {
          if (sentTokensForNotif.has(token)) continue;
          sentTokensForNotif.add(token);
          const pushRes = await sendFcmPushMessage({
            projectId,
            accessToken,
            token,
            notification: notif,
            transport
          }).catch(() => ({ ok: false }));
          if (pushRes?.ok) fcmSent++;
          else fcmFailed++;
        }

        await firestoreCreateDocument(
          projectId,
          accessToken,
          'in-app-notifications',
          {
            ...notif,
            userId,
            read: false,
            createdAt: refDate instanceof Date ? refDate : new Date()
          },
          transport
        ).catch(() => null);
        inAppCreated++;
      }
    }

    res.status(200).json({
      ok: true,
      action: 'run_check',
      evaluated: candidates.length,
      usersTargeted: userTokenMap.size,
      fcmSent,
      fcmFailed,
      inAppCreated,
      skippedDuplicates
    });
  } catch (err) {
    console.error('[CronDeadlines] Errore:', err);
    res.status(500).json({
      ok: false,
      error: 'CRON_EXECUTION_ERROR',
      message: err?.message || String(err)
    });
  }
}

handler.loadServiceAccountConfig = loadServiceAccountConfig;
handler.isAuthorizedRequest = isAuthorizedRequest;
handler.parseFirestoreValue = parseFirestoreValue;
handler.parseFirestoreDoc = parseFirestoreDoc;
handler.toFirestoreValue = toFirestoreValue;
handler.toFirestoreFields = toFirestoreFields;
handler.getGoogleAccessToken = getGoogleAccessToken;
handler.firestoreListCollection = firestoreListCollection;
handler.firestoreCreateDocument = firestoreCreateDocument;
handler.evaluateDeadlinesForPush = evaluateDeadlinesForPush;
handler.sendFcmPushMessage = sendFcmPushMessage;

module.exports = handler;
