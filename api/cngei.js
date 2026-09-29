// api/cngei.js - Vercel Serverless Function Proxy
// Inoltra le richieste verso https://api.cngei.it iniettando il token lato server

const https = require('https');

module.exports = async function handler(req, res) {
  // Configura CORS per consentire chiamate dalla nostra stessa applicazione
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Token segreto memorizzato nelle variabili d'ambiente di Vercel
  const token = process.env.CNGEI_API_TOKEN;
  if (!token) {
    res.status(500).json({
      error: 'CNGEI_API_TOKEN_MISSING',
      message: 'Il token CNGEI non è stato configurato nelle variabili d\'ambiente del server.'
    });
    return;
  }

  try {
    // Determina il subpath di destinazione
    let subPath = '';
    if (req.query && req.query.path) {
      subPath = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
    } else {
      const url = req.url || '';
      const cleanUrl = url.split('?')[0];
      subPath = cleanUrl.replace(/^\/api\/cngei\/?/, '');
    }

    if (!subPath.startsWith('/')) {
      subPath = '/' + subPath;
    }

    // Ricostruisci parametri di query string (escludendo 'path')
    const queryParams = new URLSearchParams();
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (key !== 'path') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        }
      }
    }
    const queryString = queryParams.toString();
    const targetPath = subPath + (queryString ? `?${queryString}` : '');

    // Headers per api.cngei.it
    const headers = {
      'X-Api-Token': token,
      'Accept': req.headers['accept'] || 'application/json',
      'User-Agent': 'MaoriApp-CNGEI-Proxy/1.0'
    };

    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }

    const options = {
      hostname: 'api.cngei.it',
      port: 443,
      path: targetPath,
      method: req.method || 'GET',
      headers: headers
    };

    const proxyReq = https.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode || 200);

      // Inoltra header importanti
      if (proxyRes.headers['content-type']) {
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
      }

      if (typeof res.pipe === 'function' && typeof res.once === 'function') {
        proxyRes.pipe(res);
      } else {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          const bodyBuffer = Buffer.concat(chunks);
          res.end(bodyBuffer);
        });
      }
    });

    proxyReq.on('error', (err) => {
      console.error('[CNGEI Proxy Error]:', err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'BAD_GATEWAY',
          message: 'Errore di connessione a api.cngei.it: ' + err.message
        });
      }
    });

    // Inoltra eventuale body
    if (req.body) {
      if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        proxyReq.write(req.body);
      } else {
        proxyReq.write(JSON.stringify(req.body));
      }
    }

    proxyReq.end();
  } catch (error) {
    console.error('[CNGEI Proxy Exception]:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'PROXY_INTERNAL_ERROR',
        message: error.message || 'Errore interno nel proxy'
      });
    }
  }
};
