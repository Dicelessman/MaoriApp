/**
 * Menù & Cambusa Utilities
 * Parsing ingredienti, calcolo porzioni, aggregazione nutrizionale, lista spesa e strumenti
 * @module utils/menu-utils
 */

/** Elenco degli allergeni comuni monitorati secondo normativa UE */
export const ALLERGENI_COMUNI = [
    { id: 'glutine', label: 'Glutine', icon: '🌾' },
    { id: 'latte', label: 'Latte e Latticini', icon: '🥛' },
    { id: 'uova', label: 'Uova', icon: '🥚' },
    { id: 'pesce', label: 'Pesce', icon: '🐟' },
    { id: 'crostacei', label: 'Crostacei', icon: '🦐' },
    { id: 'molluschi', label: 'Molluschi', icon: '🦪' },
    { id: 'frutta_guscio', label: 'Frutta a guscio', icon: '🥜' },
    { id: 'arachidi', label: 'Arachidi', icon: '🥜' },
    { id: 'soia', label: 'Soia', icon: '🌱' },
    { id: 'sedano', label: 'Sedano', icon: '🥬' },
    { id: 'senape', label: 'Senape', icon: '🌭' },
    { id: 'sesamo', label: 'Sesamo', icon: '🥯' },
    { id: 'solfiti', label: 'Solfiti', icon: '🍷' },
    { id: 'lupini', label: 'Lupini', icon: '🌿' }
];

/** Elenco delle scelte e regimi alimentari */
export const DIETE_COMUNI = [
    { id: 'vegetariana', label: 'Vegetariana', icon: '🥦' },
    { id: 'vegana', label: 'Vegana', icon: '🥕' },
    { id: 'senza_glutine', label: 'Senza Glutine (Celiachia)', icon: '🌾🚫' },
    { id: 'senza_lattosio', label: 'Senza Lattosio', icon: '🥛🚫' },
    { id: 'senza_maiale', label: 'No Maiale', icon: '🐷🚫' },
    { id: 'halal', label: 'Halal', icon: '☪️' },
    { id: 'kosher', label: 'Kosher', icon: '✡️' },
    { id: 'senza_pesce', label: 'No Pesce/Frutti di mare', icon: '🐟🚫' }
];

/** Tipi di pasto supportati */
export const TIPI_PASTO = [
    'Colazione',
    'Pranzo',
    'Merenda',
    'Cena',
    'Spuntino',
    'Gara di Cucina',
    'Altro'
];

/**
 * Converte stringhe di quantità e unità comuni in unità standard (g o ml o pz)
 * @param {number} quantita 
 * @param {string} unita 
 * @returns {{ quantitaNorm: number, unitaNorm: string }}
 */
export function normalizzaUnita(quantita, unita = 'g') {
    const q = Number(quantita) || 0;
    const u = (unita || 'g').trim().toLowerCase();

    switch (u) {
        case 'kg':
        case 'chili':
        case 'chilo':
            return { quantitaNorm: q * 1000, unitaNorm: 'g' };
        case 'hg':
        case 'etti':
        case 'etto':
            return { quantitaNorm: q * 100, unitaNorm: 'g' };
        case 'l':
        case 'litri':
        case 'litro':
        case 'lt':
            return { quantitaNorm: q * 1000, unitaNorm: 'ml' };
        case 'dl':
            return { quantitaNorm: q * 100, unitaNorm: 'ml' };
        case 'cl':
            return { quantitaNorm: q * 10, unitaNorm: 'ml' };
        case 'cucchiaio':
        case 'cucchiai':
            return { quantitaNorm: q * 15, unitaNorm: 'g' };
        case 'cucchiaino':
        case 'cucchiaini':
            return { quantitaNorm: q * 5, unitaNorm: 'g' };
        case 'bicchiere':
        case 'bicchieri':
            return { quantitaNorm: q * 200, unitaNorm: 'ml' };
        case 'pizzico':
        case 'pizzichi':
            return { quantitaNorm: q * 2, unitaNorm: 'g' };
        case 'spicchio':
        case 'spicchi':
            return { quantitaNorm: q * 5, unitaNorm: 'g' };
        case 'bustina':
        case 'bustine':
            return { quantitaNorm: q * 16, unitaNorm: 'g' };
        case 'pz':
        case 'pezzi':
        case 'pezzo':
        case 'uova':
        case 'uovo':
            return { quantitaNorm: q, unitaNorm: 'pz' };
        default:
            return { quantitaNorm: q, unitaNorm: u };
    }
}

/**
 * Converte grammatura o millilitri in formato leggibile per la spesa (es. 2500 g -> 2,5 kg)
 * @param {number} quantita 
 * @param {string} unita 
 * @returns {string}
 */
export function formattaQuantitaPerSpesa(quantita, unita = 'g') {
    const q = Number(quantita) || 0;
    const u = (unita || 'g').toLowerCase();

    if (u === 'g') {
        if (q >= 1000) {
            const kg = (q / 1000).toLocaleString('it-IT', { maximumFractionDigits: 2 });
            return `${kg} kg`;
        }
        return `${Math.round(q)} g`;
    }
    if (u === 'ml') {
        if (q >= 1000) {
            const l = (q / 1000).toLocaleString('it-IT', { maximumFractionDigits: 2 });
            return `${l} l`;
        }
        return `${Math.round(q)} ml`;
    }
    return `${Math.round(q * 100) / 100} ${unita}`;
}

/**
 * Parser per righe testuali di ingredienti (es. "500 g di petto di pollo")
 * @param {string} textLine 
 * @returns {{ nome: string, quantita: number, unita: string, note?: string }}
 */
export function parseIngredienteLine(textLine) {
    if (!textLine || typeof textLine !== 'string') {
        return { nome: '', quantita: 0, unita: 'g' };
    }
    const clean = textLine.replace(/^[-*•]\s*/, '').trim();

    // Regex per individuare quantita + unita + nome
    // Esempio: "500 g", "1.5 kg", "2 cucchiai", "1/2 litro", "4 uova"
    const regex = /^(\d+\/\d+|[\d.,]+)?\s*(cucchiaini|cucchiaino|cucchiai|cucchiaio|bicchieri|bicchiere|pizzichi|pizzico|spicchi|spicchio|bustine|bustina|scatolette|scatoletta|vasetti|vasetto|fette|fetta|pezzi|pezzo|grammi|chili|chilo|litri|litro|etti|etto|uova|uovo|kg|hg|lt|ml|dl|cl|pz|g|l)?\s*(?:di\s+|d')?\s*(.+)$/i;

    const match = clean.match(regex);
    if (!match) {
        return { nome: clean, quantita: 1, unita: 'pz' };
    }

    let rawQty = match[1];
    let qty = 1;
    if (rawQty) {
        if (rawQty.includes('/')) {
            const [num, den] = rawQty.split('/').map(Number);
            qty = den ? num / den : 1;
        } else {
            qty = parseFloat(rawQty.replace(',', '.')) || 1;
        }
    }

    let unita = match[2] ? match[2].toLowerCase() : (rawQty ? 'pz' : '');
    let nome = match[3] ? match[3].trim() : '';

    // Se l'unità trovata era 'uova'/'uovo', in italiano è il nome dell'alimento
    if (unita === 'uova' || unita === 'uovo') {
        nome = `uova ${nome}`.trim();
        unita = 'pz';
    }

    let note = '';
    const noteMatch = nome.match(/\((.*?)\)/);
    if (noteMatch) {
        note = noteMatch[1];
        nome = nome.replace(/\(.*?\)/, '').trim();
    }

    return {
        nome,
        quantita: qty,
        unita: unita || 'g',
        note: note || undefined
    };
}

/**
 * Scala gli ingredienti e la nutrizione di una ricetta da porzioniBase a targetPorzioni
 * @param {object} ricetta 
 * @param {number} targetPorzioni 
 * @returns {object} ricetta con ingredienti e valori riscalati
 */
export function scalaRicetta(ricetta, targetPorzioni) {
    if (!ricetta) return null;
    const base = Number(ricetta.porzioniBase) || 4;
    const target = Number(targetPorzioni) || base;
    const fattore = target / base;

    const ingredientiScalati = (ricetta.ingredienti || []).map(ing => {
        if (ing.scalabile === false) {
            return { ...ing, quantitaScalata: ing.quantita };
        }
        const q = Number(ing.quantita) || 0;
        return {
            ...ing,
            quantitaOriginale: q,
            quantita: Math.round((q * fattore) * 10) / 10,
            quantitaScalata: Math.round((q * fattore) * 10) / 10
        };
    });

    const perPorzione = ricetta.nutrizione?.perPorzione || {
        kcal: 0, proteine: 0, carboidrati: 0, zuccheri: 0, grassi: 0, saturi: 0, fibre: 0, sale: 0
    };

    const totaleNutrizione = {
        kcal: Math.round((perPorzione.kcal || 0) * target),
        proteine: Math.round(((perPorzione.proteine || 0) * target) * 10) / 10,
        carboidrati: Math.round(((perPorzione.carboidrati || 0) * target) * 10) / 10,
        zuccheri: Math.round(((perPorzione.zuccheri || 0) * target) * 10) / 10,
        grassi: Math.round(((perPorzione.grassi || 0) * target) * 10) / 10,
        saturi: Math.round(((perPorzione.saturi || 0) * target) * 10) / 10,
        fibre: Math.round(((perPorzione.fibre || 0) * target) * 10) / 10,
        sale: Math.round(((perPorzione.sale || 0) * target) * 100) / 100
    };

    return {
        ...ricetta,
        porzioniRichieste: target,
        fattoreScala: fattore,
        ingredienti: ingredientiScalati,
        totaleNutrizione
    };
}

/**
 * Calcola i totali nutrizionali sommando un elenco di ricette scalate
 * @param {Array<object>} ricetteScalate 
 * @returns {object} Somma totali e medie per porzione
 */
export function calcolaSommaNutrizionale(ricetteScalate = []) {
    const acc = {
        kcal: 0,
        proteine: 0,
        carboidrati: 0,
        zuccheri: 0,
        grassi: 0,
        saturi: 0,
        fibre: 0,
        sale: 0
    };

    ricetteScalate.forEach(r => {
        const nut = r.totaleNutrizione || (r.nutrizione?.perPorzione ? {
            kcal: (r.nutrizione.perPorzione.kcal || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            proteine: (r.nutrizione.perPorzione.proteine || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            carboidrati: (r.nutrizione.perPorzione.carboidrati || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            zuccheri: (r.nutrizione.perPorzione.zuccheri || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            grassi: (r.nutrizione.perPorzione.grassi || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            saturi: (r.nutrizione.perPorzione.saturi || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            fibre: (r.nutrizione.perPorzione.fibre || 0) * (r.porzioniRichieste || r.porzioniBase || 1),
            sale: (r.nutrizione.perPorzione.sale || 0) * (r.porzioniRichieste || r.porzioniBase || 1)
        } : null);

        if (nut) {
            acc.kcal += Number(nut.kcal) || 0;
            acc.proteine += Number(nut.proteine) || 0;
            acc.carboidrati += Number(nut.carboidrati) || 0;
            acc.zuccheri += Number(nut.zuccheri) || 0;
            acc.grassi += Number(nut.grassi) || 0;
            acc.saturi += Number(nut.saturi) || 0;
            acc.fibre += Number(nut.fibre) || 0;
            acc.sale += Number(nut.sale) || 0;
        }
    });

    return {
        kcal: Math.round(acc.kcal),
        proteine: Math.round(acc.proteine * 10) / 10,
        carboidrati: Math.round(acc.carboidrati * 10) / 10,
        zuccheri: Math.round(acc.zuccheri * 10) / 10,
        grassi: Math.round(acc.grassi * 10) / 10,
        saturi: Math.round(acc.saturi * 10) / 10,
        fibre: Math.round(acc.fibre * 10) / 10,
        sale: Math.round(acc.sale * 100) / 100
    };
}

/**
 * Aggrega gli ingredienti da più ricette del menù, calcola le quantità totali,
 * il conteggio delle ricette in cui compaiono ("petto di pollo, 2,5kg, 2 ricette"),
 * e confronta con le Scorte disponibili.
 * @param {Array<object>} pastiConRicette - elenco pasti con ricette scalate
 * @param {Array<object>} scorteAttuali - scorte lette da DATA.getScorte()
 * @returns {object} { daAcquistare: Array, inScorteSufficienti: Array, costoTotaleStimato: number }
 */
export function generaListaSpesa(pastiConRicette = [], scorteAttuali = []) {
    const mapIngredienti = new Map();

    // 1. Raggruppa ingredienti per nome normalizzato o alimentoId
    pastiConRicette.forEach(pasto => {
        const ricette = pasto.ricette || (pasto.ricetta ? [pasto.ricetta] : []);
        ricette.forEach(r => {
            const ingrList = r.ingredienti || [];
            ingrList.forEach(ing => {
                const { quantitaNorm, unitaNorm } = normalizzaUnita(ing.quantita, ing.unita);
                const chiave = (ing.alimentoId || ing.nome || '').toLowerCase().trim();
                if (!chiave) return;

                if (!mapIngredienti.has(chiave)) {
                    mapIngredienti.set(chiave, {
                        nome: ing.nome.trim(),
                        alimentoId: ing.alimentoId || null,
                        categoriaSpesa: ing.categoriaSpesa || 'Generale',
                        quantitaTotaleNorm: 0,
                        unitaNorm,
                        ricetteSet: new Set(),
                        costoStimatoKg: Number(ing.costoStimatoKg || ing.prezzoStimatoKg) || 0
                    });
                }

                const item = mapIngredienti.get(chiave);
                item.quantitaTotaleNorm += quantitaNorm;
                item.ricetteSet.add(r.nome || 'Ricetta');
                if (!item.costoStimatoKg && (ing.costoStimatoKg || ing.prezzoStimatoKg)) {
                    item.costoStimatoKg = Number(ing.costoStimatoKg || ing.prezzoStimatoKg);
                }
            });
        });
    });

    const daAcquistare = [];
    const inScorteSufficienti = [];
    let costoTotaleStimato = 0;

    // 2. Confronta con le scorte
    mapIngredienti.forEach(item => {
        const ricetteCount = item.ricetteSet.size;
        const ricetteLabel = `${ricetteCount} ${ricetteCount === 1 ? 'ricetta' : 'ricette'}`;
        const nomeIngrediente = item.nome;

        // Cerca matching in scorte
        const scortaMatch = scorteAttuali.find(s => {
            const nomeScorta = (s.nome || '').toLowerCase();
            const nomeIngr = nomeIngrediente.toLowerCase();
            return nomeScorta === nomeIngr || nomeScorta.includes(nomeIngr) || nomeIngr.includes(nomeScorta);
        });

        let quantitaInScorteNorm = 0;
        let scortaId = null;
        if (scortaMatch) {
            scortaId = scortaMatch.id;
            const normScorta = normalizzaUnita(scortaMatch.quantita, scortaMatch.unitaMisura);
            if (normScorta.unitaNorm === item.unitaNorm) {
                quantitaInScorteNorm = normScorta.quantitaNorm;
            } else if (normScorta.unitaNorm === 'pz' && item.unitaNorm === 'pz') {
                quantitaInScorteNorm = normScorta.quantitaNorm;
            }
        }

        const mancanteNorm = Math.max(0, item.quantitaTotaleNorm - quantitaInScorteNorm);
        const sufficiente = quantitaInScorteNorm >= item.quantitaTotaleNorm;

        // Calcolo costo stimato
        let costoItem = 0;
        if (item.costoStimatoKg > 0) {
            if (item.unitaNorm === 'g' || item.unitaNorm === 'ml') {
                costoItem = (mancanteNorm / 1000) * item.costoStimatoKg;
            } else {
                costoItem = mancanteNorm * item.costoStimatoKg;
            }
            costoTotaleStimato += costoItem;
        }

        const formattedTotale = formattaQuantitaPerSpesa(item.quantitaTotaleNorm, item.unitaNorm);
        const formattedMancante = formattaQuantitaPerSpesa(mancanteNorm, item.unitaNorm);
        const formattedInScorte = formattaQuantitaPerSpesa(quantitaInScorteNorm, item.unitaNorm);

        const listEntry = {
            id: 'item_' + Math.random().toString(36).slice(2, 9),
            nome: nomeIngrediente,
            categoriaSpesa: item.categoriaSpesa,
            quantitaTotale: item.quantitaTotaleNorm,
            quantitaDaComprare: mancanteNorm,
            unita: item.unitaNorm,
            formattedTotale,
            formattedDaComprare: formattedMancante,
            formattedInScorte,
            ricetteCount,
            ricetteLabel,
            ricetteNomi: Array.from(item.ricetteSet),
            scortaId,
            quantitaInScorte: quantitaInScorteNorm,
            sufficienteInScorte: sufficiente,
            costoStimato: Math.round(costoItem * 100) / 100,
            comprato: false,
            dettaglioTesto: `${nomeIngrediente}, ${formattedMancante}, ${ricetteLabel}`
        };

        if (sufficiente) {
            inScorteSufficienti.push({
                ...listEntry,
                nota: `Presente in scorte: ${formattedInScorte} (fabbisogno: ${formattedTotale}) - NON da comprare`
            });
        } else {
            daAcquistare.push(listEntry);
        }
    });

    return {
        daAcquistare,
        inScorteSufficienti,
        costoTotaleStimato: Math.round(costoTotaleStimato * 100) / 100
    };
}

/**
 * Aggrega gli strumenti di cucina utili da tutte le ricette del menù,
 * calcolando quante ricette li richiedono e il fabbisogno simultaneo massimo.
 * @param {Array<object>} pastiConRicette 
 * @returns {Array<object>} Lista aggregata degli strumenti
 */
export function generaListaStrumenti(pastiConRicette = []) {
    const mapStrumenti = new Map();

    pastiConRicette.forEach(pasto => {
        const ricette = pasto.ricette || (pasto.ricetta ? [pasto.ricetta] : []);
        // Strumenti richiesti per questo singolo pasto (per calcolare il picco contemporaneo)
        const strumentiPerPasto = new Map();

        ricette.forEach(r => {
            const strumenti = r.strumenti || [];
            strumenti.forEach(st => {
                const nome = (st.nome || '').trim();
                const q = Number(st.quantita) || 1;
                if (!nome) return;

                const chiave = nome.toLowerCase();
                strumentiPerPasto.set(chiave, (strumentiPerPasto.get(chiave) || 0) + q);

                if (!mapStrumenti.has(chiave)) {
                    mapStrumenti.set(chiave, {
                        nome,
                        quantitaMaxSimultanea: 0,
                        ricetteSet: new Set()
                    });
                }
                mapStrumenti.get(chiave).ricetteSet.add(r.nome || 'Ricetta');
            });
        });

        // Aggiorna la quantità massima richiesta contemporaneamente in un singolo pasto
        strumentiPerPasto.forEach((qPasto, chiave) => {
            const item = mapStrumenti.get(chiave);
            if (item && qPasto > item.quantitaMaxSimultanea) {
                item.quantitaMaxSimultanea = qPasto;
            }
        });
    });

    const lista = [];
    mapStrumenti.forEach(st => {
        const ricetteCount = st.ricetteSet.size;
        const ricetteLabel = `${ricetteCount} ${ricetteCount === 1 ? 'ricetta' : 'ricette'}`;
        lista.push({
            id: 'str_' + Math.random().toString(36).slice(2, 9),
            nome: st.nome,
            quantita: st.quantitaMaxSimultanea || 1,
            ricetteCount,
            ricetteLabel,
            ricetteNomi: Array.from(st.ricetteSet),
            dettaglioTesto: `${st.nome}, q.tà ${st.quantitaMaxSimultanea || 1}, ${ricetteLabel}`,
            pronto: false
        });
    });

    return lista.sort((a, b) => b.ricetteCount - a.ricetteCount);
}

/**
 * Confronta gli allergeni delle ricette con le schede sanitarie dei partecipanti
 * e restituisce un elenco di avvisi di sicurezza alimentare
 * @param {Array<object>} ricette 
 * @param {Array<object>} scouts 
 * @returns {Array<{ scoutId: string, nome: string, allergia: string, ricetteIncongruenti: Array<string> }>}
 */
export function verificaAllarmiAllergeni(ricette = [], scouts = []) {
    const alertList = [];

    scouts.forEach(scout => {
        const testoAllergie = `${scout.san_allergie || ''} ${scout.san_intolleranze || ''} ${scout.san_diete || ''}`.toLowerCase();
        if (!testoAllergie.trim()) return;

        const allergeniRilevati = [];

        ALLERGENI_COMUNI.forEach(all => {
            if (testoAllergie.includes(all.id) || testoAllergie.includes(all.label.toLowerCase())) {
                allergeniRilevati.push(all.id);
            }
        });

        // Controlli specifici per diete
        if (testoAllergie.includes('celiac') || testoAllergie.includes('glutine')) {
            if (!allergeniRilevati.includes('glutine')) allergeniRilevati.push('glutine');
        }
        if (testoAllergie.includes('lattos')) {
            if (!allergeniRilevati.includes('latte')) allergeniRilevati.push('latte');
        }

        if (allergeniRilevati.length === 0) return;

        allergeniRilevati.forEach(allId => {
            const ricetteIncongruenti = ricette.filter(r => (r.allergeni || []).includes(allId));
            if (ricetteIncongruenti.length > 0) {
                alertList.push({
                    scoutId: scout.id,
                    nome: `${scout.nome || scout.anag_nome || ''} ${scout.cognome || scout.anag_cognome || ''}`.trim(),
                    allergia: allId,
                    allergiaLabel: ALLERGENI_COMUNI.find(a => a.id === allId)?.label || allId,
                    ricetteIncongruenti: ricetteIncongruenti.map(r => r.nome)
                });
            }
        });
    });

    return alertList;
}
