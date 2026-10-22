// js/data/ricette-base.js - Ricette scout predefinite
export const RICETTE_BASE = [
  {
    id: "rec_pasta_pomodoro",
    nome: "Pasta al Pomodoro e Basilico",
    categoria: "Pranzo",
    descrizione: "Classico primo piatto da campo scout, veloce ed economico.",
    porzioniBase: 4,
    tempoPreparazione: 10,
    tempoCottura: 20,
    difficolta: "Facile",
    metodoCottura: ["Fornellone"],
    fonte: { tipo: "manuale" },
    allergeni: ["glutine"],
    diete: ["vegetariana", "vegana", "senza lattosio", "senza maiale", "halal"],
    noteAlimentari: "Prevedere pasta senza glutine cotta a parte per celiaci.",
    ingredienti: [
      { nome: "Pasta di semola", quantita: 360, unita: "g", scalabile: true, alimentoId: "alim_pasta", categoriaSpesa: "Primi", costoStimatoKg: 1.60 },
      { nome: "Passata di pomodoro", quantita: 400, unita: "g", scalabile: true, alimentoId: "alim_passata", categoriaSpesa: "Condimenti", costoStimatoKg: 1.40 },
      { nome: "Olio extravergine di oliva", quantita: 30, unita: "g", scalabile: true, alimentoId: "alim_olio_evo", categoriaSpesa: "Condimenti", costoStimatoKg: 9.50 },
      { nome: "Cipolle", quantita: 60, unita: "g", scalabile: true, alimentoId: "alim_cipolle", categoriaSpesa: "Verdure", costoStimatoKg: 1.20 },
      { nome: "Sale fino", quantita: 10, unita: "g", scalabile: true, alimentoId: "alim_sale", categoriaSpesa: "Condimenti", costoStimatoKg: 0.50 }
    ],
    passaggi: [
      "Mettere a bollire abbondante acqua salata sul fornellone.",
      "Tritare la cipolla e farla imbiondire con l'olio in casseruola.",
      "Aggiungere la passata di pomodoro, un pizzico di sale e cuocere a fuoco lento per 15 minuti.",
      "Calare la pasta, scolarla al dente e mantecare col sugo."
    ],
    strumenti: [
      { nome: "Pentola grande per pasta", quantita: 1 },
      { nome: "Casseruola media", quantita: 1 },
      { nome: "Scolapasta", quantita: 1 },
      { nome: "Mestolo", quantita: 1 }
    ],
    nutrizione: {
      origine: "calcolata",
      perPorzione: { kcal: 405, proteine: 12.8, carboidrati: 69.5, zuccheri: 6.8, grassi: 8.0, saturi: 1.3, fibre: 4.2, sale: 0.8 },
      per100g: { kcal: 190, proteine: 6.0, carboidrati: 32.5, zuccheri: 3.2, grassi: 3.7, saturi: 0.6, fibre: 2.0, sale: 0.4 }
    },
    storicoManuale: [
      { attivitaId: "act_passata", data: "2025-10-18", note: "Uscita d'Autunno - porzioni perfette" }
    ]
  },
  {
    id: "rec_risotto_zucchine",
    nome: "Risotto alle Zucchine e Parmigiano",
    categoria: "Cena",
    descrizione: "Piatto caldo e digeribile ideale per la prima sera d'uscita.",
    porzioniBase: 4,
    tempoPreparazione: 15,
    tempoCottura: 25,
    difficolta: "Media",
    metodoCottura: ["Fornellone"],
    fonte: { tipo: "manuale" },
    allergeni: ["latte"],
    diete: ["vegetariana", "senza glutine", "senza maiale", "halal"],
    noteAlimentari: "Senza glutine naturale. Per intolleranti al lattosio o vegani omettere il parmigiano a fine cottura.",
    ingredienti: [
      { nome: "Riso", quantita: 320, unita: "g", scalabile: true, alimentoId: "alim_riso", categoriaSpesa: "Primi", costoStimatoKg: 2.20 },
      { nome: "Zucchine", quantita: 300, unita: "g", scalabile: true, alimentoId: "alim_zucchine", categoriaSpesa: "Verdure", costoStimatoKg: 1.80 },
      { nome: "Cipolle", quantita: 50, unita: "g", scalabile: true, alimentoId: "alim_cipolle", categoriaSpesa: "Verdure", costoStimatoKg: 1.20 },
      { nome: "Olio extravergine di oliva", quantita: 30, unita: "g", scalabile: true, alimentoId: "alim_olio_evo", categoriaSpesa: "Condimenti", costoStimatoKg: 9.50 },
      { nome: "Parmigiano Reggiano / Grana", quantita: 40, unita: "g", scalabile: true, alimentoId: "alim_parmigiano", categoriaSpesa: "Latticini", costoStimatoKg: 18.00 },
      { nome: "Sale fino", quantita: 10, unita: "g", scalabile: true, alimentoId: "alim_sale", categoriaSpesa: "Condimenti", costoStimatoKg: 0.50 }
    ],
    passaggi: [
      "Preparare circa 1 litro d'acqua calda salata o brodo.",
      "Lavare e tagliare le zucchine a rondelle o dadini fini.",
      "Tritare la cipolla, rosolarla in casseruola con l'olio e unire le zucchine per 5 minuti.",
      "Aggiungere il riso, tostarlo per 2 minuti e proseguire la cottura aggiungendo acqua calda gradualmente per 16-18 minuti mescolando.",
      "A fuoco spento mantecare con il parmigiano grattugiato."
    ],
    strumenti: [
      { nome: "Casseruola capiente per risotto", quantita: 1 },
      { nome: "Pentolino per acqua calda", quantita: 1 },
      { nome: "Mestolo di legno", quantita: 1 },
      { nome: "Grattugia", quantita: 1 }
    ],
    nutrizione: {
      origine: "calcolata",
      perPorzione: { kcal: 415, proteine: 10.5, carboidrati: 67.0, zuccheri: 3.0, grassi: 11.0, saturi: 3.2, fibre: 2.2, sale: 0.9 },
      per100g: { kcal: 210, proteine: 5.3, carboidrati: 34.0, zuccheri: 1.5, grassi: 5.6, saturi: 1.6, fibre: 1.1, sale: 0.5 }
    },
    storicoManuale: []
  },
  {
    id: "rec_pollo_curry_riso",
    nome: "Straccetti di Pollo con Riso e Carote",
    categoria: "Cena",
    descrizione: "Secondo ricco e proteico con contorno, amato dai ragazzi dopo camminate impegnative.",
    porzioniBase: 4,
    tempoPreparazione: 20,
    tempoCottura: 25,
    difficolta: "Facile",
    metodoCottura: ["Fornellone"],
    fonte: { tipo: "manuale" },
    allergeni: [],
    diete: ["senza glutine", "senza lattosio", "senza maiale", "halal"],
    noteAlimentari: "Piatto naturalmente privo di glutine e lattosio. Per opzione vegetariana/vegana sostituire pollo con ceci.",
    ingredienti: [
      { nome: "Petto di pollo", quantita: 500, unita: "g", scalabile: true, alimentoId: "alim_petto_pollo", categoriaSpesa: "Carne", costoStimatoKg: 8.50 },
      { nome: "Riso", quantita: 240, unita: "g", scalabile: true, alimentoId: "alim_riso", categoriaSpesa: "Primi", costoStimatoKg: 2.20 },
      { nome: "Carote", quantita: 200, unita: "g", scalabile: true, alimentoId: "alim_carote", categoriaSpesa: "Verdure", costoStimatoKg: 1.30 },
      { nome: "Olio extravergine di oliva", quantita: 30, unita: "g", scalabile: true, alimentoId: "alim_olio_evo", categoriaSpesa: "Condimenti", costoStimatoKg: 9.50 },
      { nome: "Sale fino", quantita: 8, unita: "g", scalabile: true, alimentoId: "alim_sale", categoriaSpesa: "Condimenti", costoStimatoKg: 0.50 }
    ],
    passaggi: [
      "Bollire il riso in acqua salata, scolarlo e tenerlo da parte condito con un filo d'olio.",
      "Tagliare il petto di pollo a bocconcini o straccetti.",
      "Pelare le carote e tagliarle a rondelle sottili.",
      "In padella capiente scaldare l'olio, saltare le carote per 5 minuti, poi unire il pollo a fiamma viva fino a doratura completa.",
      "Aggiustare di sale e servire gli straccetti caldi adagiati sul riso."
    ],
    strumenti: [
      { nome: "Padella grande o wok da campo", quantita: 1 },
      { nome: "Pentola media per riso", quantita: 1 },
      { nome: "Tagliere e coltello per carne", quantita: 1 },
      { nome: "Mestolo", quantita: 1 }
    ],
    nutrizione: {
      origine: "calcolata",
      perPorzione: { kcal: 430, proteine: 33.5, carboidrati: 53.0, zuccheri: 2.8, grassi: 9.5, saturi: 1.8, fibre: 2.2, sale: 0.9 },
      per100g: { kcal: 175, proteine: 13.6, carboidrati: 21.5, zuccheri: 1.1, grassi: 3.8, saturi: 0.7, fibre: 0.9, sale: 0.4 }
    },
    storicoManuale: []
  }
];

export default RICETTE_BASE;
