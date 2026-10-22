/**
 * Nutrition & Recipe Import Service
 * Gestione ricerca alimenti, caching su Firebase/localStorage e importazione ricette web
 * @module services/nutrition-service
 */

import { DATA } from '../data/data-facade.js';
import { parseIngredienteLine, ALLERGENI_COMUNI } from '../utils/menu-utils.js';

export const NutritionService = {
    /**
     * Cerca alimenti nel database locale/remoto e facoltativamente su Open Food Facts
     * @param {string} query 
     * @param {boolean} onlineSearch 
     * @returns {Promise<Array<object>>}
     */
    async searchAlimenti(query, onlineSearch = false) {
        const q = (query || '').toLowerCase().trim();
        if (!q) return [];

        const localAlimenti = await DATA.getAlimenti();
        const localMatches = localAlimenti.filter(a => {
            const nome = (a.nome || '').toLowerCase();
            const marchio = (a.marchio || '').toLowerCase();
            const cat = (a.categoria || '').toLowerCase();
            return nome.includes(q) || marchio.includes(q) || cat.includes(q);
        });

        // Se abbiamo match locali e non è richiesta esplicitamente la ricerca online, restituisci subito
        if (localMatches.length > 0 && !onlineSearch) {
            return localMatches;
        }

        // Se onlineSearch è attivo o non ci sono match locali
        if (onlineSearch || localMatches.length === 0) {
            try {
                const response = await fetch(`/api/ricetta-import?foodSearch=${encodeURIComponent(q)}`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && Array.isArray(result.alimenti)) {
                        // Salva nel database locale/Firebase per arricchire il DB progressivamente
                        for (const onlineItem of result.alimenti) {
                            const alreadyExists = localAlimenti.some(l => (l.nome || '').toLowerCase() === (onlineItem.nome || '').toLowerCase());
                            if (!alreadyExists) {
                                await DATA.saveAlimento(onlineItem);
                            }
                        }
                        // Unisci i risultati locali e quelli trovati online evitando duplicati
                        const merged = [...localMatches];
                        result.alimenti.forEach(item => {
                            if (!merged.some(m => (m.nome || '').toLowerCase() === (item.nome || '').toLowerCase())) {
                                merged.push(item);
                            }
                        });
                        return merged;
                    }
                }
            } catch (err) {
                console.warn('[NutritionService] Ricerca online non disponibile:', err.message);
            }
        }

        return localMatches;
    },

    /**
     * Importa una ricetta da un URL web tramite endpoint serverless
     * @param {string} url 
     * @returns {Promise<object>} Ricetta strutturata
     */
    async importFromUrl(url) {
        if (!url || !url.startsWith('http')) {
            throw new Error('URL ricetta non valido. Inserire un indirizzo http/https completo.');
        }

        const endpoint = `/api/ricetta-import?url=${encodeURIComponent(url.trim())}`;
        const res = await fetch(endpoint);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `Impossibile importare la ricetta (HTTP ${res.status})`);
        }

        const data = await res.json();
        if (!data.success || !data.ricetta) {
            throw new Error('Formato ricetta non riconosciuto nella pagina indicata');
        }

        const raw = data.ricetta;
        const allAlimenti = await DATA.getAlimenti();

        // Trasforma gli ingredienti raw in oggetti strutturati
        const ingredienti = (raw.ingredientiRaw || []).map(line => {
            const parsed = parseIngredienteLine(line);
            // Prova a fare matching con alimenti esistenti
            const matchAlim = allAlimenti.find(a => {
                const alimNome = (a.nome || '').toLowerCase();
                const ingNome = parsed.nome.toLowerCase();
                return alimNome === ingNome || alimNome.includes(ingNome) || ingNome.includes(alimNome);
            });

            return {
                nome: parsed.nome,
                quantita: parsed.quantita,
                unita: parsed.unita,
                scalabile: true,
                alimentoId: matchAlim ? matchAlim.id : null,
                categoriaSpesa: matchAlim ? matchAlim.categoria : 'Generale',
                costoStimatoKg: matchAlim ? (matchAlim.prezzoStimatoKg || matchAlim.prezzoMedioKg || 0) : 0,
                note: parsed.note
            };
        });

        // Rileva allergeni dagli ingredienti
        const allergeniRilevati = new Set();
        ingredienti.forEach(ing => {
            const match = allAlimenti.find(a => a.id === ing.alimentoId);
            if (match && Array.isArray(match.allergeni)) {
                match.allergeni.forEach(all => allergeniRilevati.add(all));
            }
            // Controllo euristico sul nome dell'ingrediente
            const lowerNome = ing.nome.toLowerCase();
            ALLERGENI_COMUNI.forEach(all => {
                if (lowerNome.includes(all.id) || lowerNome.includes(all.label.toLowerCase())) {
                    allergeniRilevati.add(all.id);
                }
            });
            if (lowerNome.includes('farina') || lowerNome.includes('pane') || lowerNome.includes('pasta')) {
                allergeniRilevati.add('glutine');
            }
            if (lowerNome.includes('formaggio') || lowerNome.includes('burro') || lowerNome.includes('mozzarella') || lowerNome.includes('ricotta')) {
                allergeniRilevati.add('latte');
            }
        });

        const porzioni = Number(raw.porzioniBase) || 4;
        const perPorzione = raw.nutrizioneRaw || { kcal: 0, proteine: 0, carboidrati: 0, grassi: 0 };

        return {
            nome: raw.nome || 'Nuova ricetta importata',
            categoria: 'Pranzo',
            descrizione: raw.descrizione || '',
            porzioniBase: porzioni,
            tempoPreparazione: raw.tempoPreparazione || 15,
            tempoCottura: raw.tempoCottura || 25,
            difficolta: 'Media',
            metodoCottura: ['Fornellone'],
            fonte: { tipo: 'url', url },
            allergeni: Array.from(allergeniRilevati),
            diete: [],
            noteAlimentari: '',
            ingredienti,
            passaggi: raw.passaggi || [],
            strumenti: [],
            nutrizione: {
                origine: raw.nutrizioneRaw?.kcal ? 'importata' : 'stimata',
                perPorzione: {
                    kcal: perPorzione.kcal || 0,
                    proteine: perPorzione.proteine || 0,
                    carboidrati: perPorzione.carboidrati || 0,
                    zuccheri: 0,
                    grassi: perPorzione.grassi || 0,
                    saturi: 0,
                    fibre: 0,
                    sale: 0
                },
                per100g: {
                    kcal: 0,
                    proteine: 0,
                    carboidrati: 0,
                    zuccheri: 0,
                    grassi: 0,
                    saturi: 0,
                    fibre: 0,
                    sale: 0
                }
            },
            storicoManuale: []
        };
    }
};
