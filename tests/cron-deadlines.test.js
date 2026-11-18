import { describe, it, expect, beforeAll, vi } from 'vitest';
import crypto from 'crypto';
import cronHandler from '../api/cron-deadlines.js';

const {
  parseFirestoreDoc,
  toFirestoreFields,
  evaluateDeadlinesForPush,
  isAuthorizedRequest
} = cronHandler;

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      this.ended = true;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };
}

describe('Vercel Cron Deadlines & FCM Push Endpoint (/api/cron-deadlines)', () => {
  let testPrivateKeyPem = '';

  beforeAll(() => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' }
    });
    testPrivateKeyPem = privateKey;
  });

  describe('Firestore REST conversion helpers', () => {
    it('toFirestoreFields e parseFirestoreDoc convertono correttamente tutti i tipi', () => {
      const date = new Date('2026-11-18T08:30:00.000Z');
      const fields = toFirestoreFields({
        titolo: 'Consegna Moduli',
        preavvisoGiorni: 5,
        costo: 12.5,
        completata: false,
        createdAt: date,
        tags: ['urgent', 'campo'],
        meta: { unit: 'Maori' }
      });

      const doc = parseFirestoreDoc({
        name: 'projects/presenziariomaori/databases/(default)/documents/scadenze/doc_123',
        fields
      });

      expect(doc).toEqual({
        id: 'doc_123',
        titolo: 'Consegna Moduli',
        preavvisoGiorni: 5,
        costo: 12.5,
        completata: false,
        createdAt: '2026-11-18T08:30:00.000Z',
        tags: ['urgent', 'campo'],
        meta: { unit: 'Maori' }
      });
    });
  });

  describe('evaluateDeadlinesForPush', () => {
    const refDate = new Date('2026-11-18T08:00:00.000Z');

    it('valuta scadenze custom con preavvisoGiorni, scadute, certificati medici, attività e compleanni', () => {
      const notifications = evaluateDeadlinesForPush({
        refDate,
        scadenze: [
          { id: 'd_ok', titolo: 'Prenota pullman', dataScadenza: '2026-11-24', preavvisoGiorni: 7, completata: false, categoria: 'Logistica' },
          { id: 'd_far', titolo: 'Campo Invernale', dataScadenza: '2026-11-28', preavvisoGiorni: 3, completata: false },
          { id: 'd_done', titolo: 'Fatta', dataScadenza: '2026-11-19', completata: true },
          { id: 'd_past_notify', titolo: 'Quota scaduta', dataScadenza: '2026-11-15', completata: false, notificaScaduta: true },
          { id: 'd_past_silent', titolo: 'Vecchia ignorata', dataScadenza: '2026-11-14', completata: false, notificaScaduta: false }
        ],
        scouts: [
          { id: 's_exp', nome: 'Luca', cognome: 'Bianchi', san_cert_scadenza: '2026-11-21', anag_dob: '2012-11-20' },
          { id: 's_arch', nome: 'Ex', cognome: 'Scout', archived: true, san_cert_scadenza: '2026-11-18', anag_dob: '2011-11-18' },
          { id: 's_far_med', nome: 'Anna', cognome: 'Verdi', san_cert_scadenza: '2027-02-01', anag_dob: '2012-03-10' }
        ],
        activities: [
          { id: 'act1', tipo: 'Uscita', descrizione: 'Uscita Autunno', data: '2026-11-20', costo: 15 },
          { id: 'act2', tipo: 'Campo', descrizione: 'Troppo Lontana', data: '2026-12-01' }
        ]
      });

      const keys = notifications.map((n) => n.reminderKey);
      expect(keys).toContain('deadline_d_ok_2026-11-18');
      expect(keys).toContain('deadline_d_past_notify_2026-11-18');
      expect(keys).not.toContain('deadline_d_far_2026-11-18');
      expect(keys).not.toContain('deadline_d_done_2026-11-18');
      expect(keys).not.toContain('deadline_d_past_silent_2026-11-18');

      expect(keys).toContain('med_deadline_s_exp_2026-11-18');
      expect(keys).not.toContain('med_deadline_s_arch_2026-11-18');
      expect(keys).not.toContain('med_deadline_s_far_med_2026-11-18');

      expect(keys).toContain('activity_act1_2026-11-18');
      expect(keys).not.toContain('activity_act2_2026-11-18');

      expect(keys).toContain('birthday_s_exp_2026');
      expect(keys).not.toContain('birthday_s_arch_2026');
    });
  });

  describe('isAuthorizedRequest', () => {
    it('gestisce autorizzazione con o senza CRON_SECRET', () => {
      expect(isAuthorizedRequest({ method: 'GET', headers: {} }, {})).toBe(true);
      expect(isAuthorizedRequest({ method: 'GET', headers: {} }, { CRON_SECRET: 'segreto123' })).toBe(false);
      expect(isAuthorizedRequest({ method: 'GET', headers: { authorization: 'Bearer wrong' } }, { CRON_SECRET: 'segreto123' })).toBe(false);
      expect(isAuthorizedRequest({ method: 'GET', headers: { authorization: 'Bearer segreto123' } }, { CRON_SECRET: 'segreto123' })).toBe(true);
      expect(isAuthorizedRequest({ method: 'GET', headers: { 'x-cron-secret': 'segreto123' } }, { CRON_SECRET: 'segreto123' })).toBe(true);
    });
  });

  describe('HTTP Handler GET & POST', () => {
    it('risponde unconfigured senza errore HTTP 500 se mancano le credenziali Service Account', async () => {
      const req = { method: 'GET', headers: {} };
      const res = createMockRes();

      await cronHandler(req, res, { env: {} });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        status: 'unconfigured',
        configured: false
      });
    });

    it('rifiuta GET con 401 se CRON_SECRET è configurato e header mancante', async () => {
      const req = { method: 'GET', headers: {} };
      const res = createMockRes();

      await cronHandler(req, res, { env: { CRON_SECRET: 'top-secret' } });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'UNAUTHORIZED' });
    });

    it('esegue GET cron completo: legge Firestore, deduplica e invia push FCM', async () => {
      const fcmCalls = [];
      const createdInApp = [];

      const transport = vi.fn(async ({ url, method, body }) => {
        if (url === 'https://oauth2.googleapis.com/token') {
          return { ok: true, status: 200, data: { access_token: 'mock-oauth-token' } };
        }
        if (method === 'GET' && url.includes('/documents/fcm-tokens')) {
          return {
            ok: true,
            status: 200,
            data: {
              documents: [
                {
                  name: 'projects/presenziariomaori/databases/(default)/documents/fcm-tokens/uid_staff_1',
                  fields: toFirestoreFields({
                    userId: 'uid_staff_1',
                    token: 'tok_a',
                    tokens: ['tok_a', 'tok_b']
                  })
                }
              ]
            }
          };
        }
        if (method === 'GET' && url.includes('/documents/scadenze')) {
          return {
            ok: true,
            status: 200,
            data: {
              documents: [
                {
                  name: 'projects/presenziariomaori/databases/(default)/documents/scadenze/scad_new',
                  fields: toFirestoreFields({ titolo: 'Nuova Scadenza', dataScadenza: '2026-11-19', completata: false })
                },
                {
                  name: 'projects/presenziariomaori/databases/(default)/documents/scadenze/scad_dup',
                  fields: toFirestoreFields({ titolo: 'Già Notificata', dataScadenza: '2026-11-19', completata: false })
                }
              ]
            }
          };
        }
        if (method === 'GET' && (url.includes('/documents/scouts') || url.includes('/documents/activities'))) {
          return { ok: true, status: 200, data: { documents: [] } };
        }
        if (method === 'GET' && url.includes('/documents/in-app-notifications')) {
          return {
            ok: true,
            status: 200,
            data: {
              documents: [
                {
                  name: 'projects/presenziariomaori/databases/(default)/documents/in-app-notifications/existing_1',
                  fields: toFirestoreFields({
                    userId: 'uid_staff_1',
                    reminderKey: 'deadline_scad_dup_2026-11-18'
                  })
                }
              ]
            }
          };
        }
        if (method === 'POST' && url.includes('/messages:send')) {
          fcmCalls.push(body);
          return { ok: true, status: 200, data: { name: 'projects/presenziariomaori/messages/m1' } };
        }
        if (method === 'POST' && url.includes('/documents/in-app-notifications')) {
          createdInApp.push(body);
          return { ok: true, status: 200, data: { name: 'projects/presenziariomaori/databases/(default)/documents/in-app-notifications/new_1', fields: body.fields } };
        }
        return { ok: false, status: 404, data: {} };
      });

      const env = {
        CRON_SECRET: 'cron_123',
        FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
          project_id: 'presenziariomaori',
          client_email: 'firebase-adminsdk@presenziariomaori.iam.gserviceaccount.com',
          private_key: testPrivateKeyPem
        })
      };

      const req = { method: 'GET', headers: { authorization: 'Bearer cron_123' } };
      const res = createMockRes();

      await cronHandler(req, res, {
        env,
        transport,
        refDate: new Date('2026-11-18T08:00:00.000Z')
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        action: 'run_check',
        evaluated: 2,
        usersTargeted: 1,
        fcmSent: 2,
        fcmFailed: 0,
        inAppCreated: 1,
        skippedDuplicates: 1
      });
      expect(fcmCalls).toHaveLength(2);
      expect(fcmCalls.map((c) => c.message.token)).toEqual(['tok_a', 'tok_b']);
      expect(fcmCalls[0].message.notification.title).toContain('Nuova Scadenza');
      expect(createdInApp).toHaveLength(1);
    });

    it('supporta POST action send_single per invio push immediato ai token registrati', async () => {
      const fcmCalls = [];
      const transport = vi.fn(async ({ url, method, body }) => {
        if (url === 'https://oauth2.googleapis.com/token') {
          return { ok: true, status: 200, data: { access_token: 'mock-oauth-token' } };
        }
        if (method === 'GET' && url.includes('/documents/fcm-tokens')) {
          return {
            ok: true,
            status: 200,
            data: {
              documents: [
                {
                  name: 'projects/presenziariomaori/databases/(default)/documents/fcm-tokens/uid_1',
                  fields: toFirestoreFields({ userId: 'uid_1', token: 'tok_1' })
                },
                {
                  name: 'projects/presenziariomaori/databases/(default)/documents/fcm-tokens/uid_2',
                  fields: toFirestoreFields({ userId: 'uid_2', token: 'tok_2' })
                }
              ]
            }
          };
        }
        if (method === 'POST' && url.includes('/messages:send')) {
          fcmCalls.push(body);
          return { ok: true, status: 200, data: { name: 'msg_ok' } };
        }
        return { ok: false, status: 404, data: {} };
      });

      const env = {
        FIREBASE_PROJECT_ID: 'presenziariomaori',
        FIREBASE_CLIENT_EMAIL: 'bot@presenziariomaori.iam.gserviceaccount.com',
        FIREBASE_PRIVATE_KEY: testPrivateKeyPem
      };

      const req = {
        method: 'POST',
        headers: {},
        body: {
          action: 'send_single',
          item: {
            id: 'scad_immediata',
            titolo: '⏰ Convocazione Urgente',
            body: 'Confermare presenze entro stasera',
            url: '/scadenze.html'
          }
        }
      };
      const res = createMockRes();

      await cronHandler(req, res, { env, transport });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        action: 'send_single',
        tokensTargeted: 2,
        fcmSent: 2,
        fcmFailed: 0
      });
      expect(fcmCalls).toHaveLength(2);
      expect(fcmCalls[0].message.notification).toEqual({
        title: '⏰ Convocazione Urgente',
        body: 'Confermare presenze entro stasera'
      });
    });
  });
});
