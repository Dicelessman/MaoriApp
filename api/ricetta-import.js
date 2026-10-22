// api/ricetta-import.js - Vercel Serverless Function
// Importa ricette da URL (estrae schema.org/Recipe JSON-LD) e cerca alimenti su Open Food Facts

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Effettua una richiesta GET HTTP/HTTPS seguendo i redirect (fino a 5)
 */
function fetchUrl(targetUrl, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) {
            return reject(new Error('Troppi redirect'));
        }

        let parsed;
        try {
            parsed = new URL(targetUrl);
        } catch (e) {
            return reject(new Error('URL non valido: ' + targetUrl));
        }

        const client = parsed.protocol === 'http:' ? http : https;
        const req = client.get(parsed, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MaoriApp/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
                'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redirectUrl = new URL(res.headers.location, parsed).toString();
                return resolve(fetchUrl(redirectUrl, maxRedirects - 1));
            }

            if (res.statusCode !== 200) {
                return reject(new Error(`Richiesta fallita con status ${res.statusCode}`));
            }

            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve(data));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout durante il recupero della risorsa'));
        });

        req.on('error', err => reject(err));
    });
}

/**
 * Cerca un oggetto schema.org/Recipe ricorsivamente dentro i blocchi JSON-LD
 */
function findRecipeInJsonLd(obj) {
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const found = findRecipeInJsonLd(item);
            if (found) return found;
        }
        return null;
    }

    const type = obj['@type'];
    if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
        return obj;
    }

    if (obj['@graph'] && Array.isArray(obj['@graph'])) {
        for (const item of obj['@graph']) {
            const found = findRecipeInJsonLd(item);
            if (found) return found;
        }
    }

    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
            const found = findRecipeInJsonLd(obj[key]);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Estrae una ricetta schema.org/Recipe dall'HTML
 */
function parseRecipeFromHtml(html, sourceUrl) {
    // 1. Cerca blocchi script JSON-LD
    const jsonLdRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let recipeObj = null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
            const parsed = JSON.parse(match[1]);
            const found = findRecipeInJsonLd(parsed);
            if (found) {
                recipeObj = found;
                break;
            }
        } catch (e) {
            // Script JSON-LD non valido, continua la scansione
        }
    }

    if (recipeObj) {
        // Estrai nome
        const nome = recipeObj.name || '';
        const descrizione = recipeObj.description || '';

        // Estrai porzioni
        let porzioni = 4;
        if (recipeObj.recipeYield) {
            const y = Array.isArray(recipeObj.recipeYield) ? recipeObj.recipeYield[0] : recipeObj.recipeYield;
            const parsedY = parseInt(String(y).match(/\d+/)?.[0] || '4', 10);
            if (parsedY > 0) porzioni = parsedY;
        }

        // Estrai ingredienti grezzi
        const rawIngredients = recipeObj.recipeIngredient || recipeObj.ingredients || [];
        const ingredienti = (Array.isArray(rawIngredients) ? rawIngredients : [rawIngredients])
            .map(ing => String(ing).trim())
            .filter(Boolean);

        // Estrai passaggi
        let passaggi = [];
        const instructions = recipeObj.recipeInstructions;
        if (Array.isArray(instructions)) {
            instructions.forEach(inst => {
                if (typeof inst === 'string') passaggi.push(inst.trim());
                else if (inst && inst.text) passaggi.push(String(inst.text).trim());
            });
        } else if (typeof instructions === 'string') {
            passaggi = instructions.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        }

        // Estrai nutrizione se presente
        const nut = recipeObj.nutrition || {};
        const calories = parseFloat(String(nut.calories || '').replace(/[^\d.]/g, '')) || 0;
        const protein = parseFloat(String(nut.proteinContent || '').replace(/[^\d.]/g, '')) || 0;
        const carbs = parseFloat(String(nut.carbohydrateContent || '').replace(/[^\d.]/g, '')) || 0;
        const fat = parseFloat(String(nut.fatContent || '').replace(/[^\d.]/g, '')) || 0;

        return {
            success: true,
            tipo: 'json-ld',
            ricetta: {
                nome: nome.trim() || 'Ricetta importata',
                descrizione: descrizione.trim(),
                porzioniBase: porzioni,
                tempoPreparazione: parseInt(String(recipeObj.prepTime || '').match(/\d+/)?.[0] || '15', 10),
                tempoCottura: parseInt(String(recipeObj.cookTime || '').match(/\d+/)?.[0] || '20', 10),
                fonte: { tipo: 'url', url: sourceUrl },
                ingredientiRaw: ingredienti,
                passaggi,
                nutrizioneRaw: {
                    kcal: calories,
                    proteine: protein,
                    carboidrati: carbs,
                    grassi: fat
                }
            }
        };
    }

    // 2. Fallback su OpenGraph e tag HTML comuni
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
                       html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);

    return {
        success: true,
        tipo: 'fallback',
        ricetta: {
            nome: (titleMatch ? titleMatch[1] : 'Ricetta importata').trim(),
            descrizione: (descMatch ? descMatch[1] : '').trim(),
            porzioniBase: 4,
            tempoPreparazione: 15,
            tempoCottura: 25,
            fonte: { tipo: 'url', url: sourceUrl },
            ingredientiRaw: [],
            passaggi: []
        }
    };
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const targetUrl = req.query?.url || req.body?.url;
    const foodSearch = req.query?.foodSearch || req.body?.foodSearch;

    // Caso 1: Ricerca alimento su Open Food Facts
    if (foodSearch) {
        try {
            const queryClean = encodeURIComponent(String(foodSearch).trim());
            const offUrl = `https://it.openfoodfacts.org/cgi/search.pl?search_terms=${queryClean}&search_simple=1&action=process&json=1&page_size=8`;
            const jsonText = await fetchUrl(offUrl);
            const data = JSON.parse(jsonText);
            const products = (data.products || []).slice(0, 8).map(p => {
                const nut = p.nutriments || {};
                return {
                    id: 'off_' + (p.code || Math.random().toString(36).slice(2, 8)),
                    nome: p.product_name_it || p.product_name || foodSearch,
                    marchio: p.brands || '',
                    categoria: p.categories_hierarchy?.[0]?.replace(/^.*?:/, '') || 'Generale',
                    allergeni: (p.allergens_tags || []).map(a => a.replace(/^.*?:/, '')),
                    nutrizione100g: {
                        kcal: Math.round(Number(nut['energy-kcal_100g'] || nut['energy-kcal'] || 0)),
                        proteine: Math.round((Number(nut.proteins_100g || 0)) * 10) / 10,
                        carboidrati: Math.round((Number(nut.carbohydrates_100g || 0)) * 10) / 10,
                        zuccheri: Math.round((Number(nut.sugars_100g || 0)) * 10) / 10,
                        grassi: Math.round((Number(nut.fat_100g || 0)) * 10) / 10,
                        saturi: Math.round((Number(nut['saturated-fat_100g'] || 0)) * 10) / 10,
                        fibre: Math.round((Number(nut.fiber_100g || 0)) * 10) / 10,
                        sale: Math.round((Number(nut.salt_100g || 0)) * 100) / 100
                    },
                    fonte: 'openfoodfacts',
                    codiceABarre: p.code || null
                };
            });

            res.status(200).json({ success: true, count: products.length, alimenti: products });
            return;
        } catch (err) {
            console.error('Errore ricerca Open Food Facts:', err);
            res.status(500).json({ success: false, error: 'OFF_SEARCH_FAILED', message: err.message });
            return;
        }
    }

    // Caso 2: Import ricetta da URL
    if (!targetUrl) {
        res.status(400).json({ success: false, error: 'PARAM_REQUIRED', message: 'Fornire url o foodSearch' });
        return;
    }

    try {
        const html = await fetchUrl(targetUrl);
        const result = parseRecipeFromHtml(html, targetUrl);
        res.status(200).json(result);
    } catch (err) {
        console.error('Errore importazione ricetta:', err);
        res.status(500).json({ success: false, error: 'FETCH_FAILED', message: err.message });
    }
};
