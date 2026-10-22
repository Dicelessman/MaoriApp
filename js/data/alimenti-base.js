// js/data/alimenti-base.js - Database base ingredienti e nutrizione (per 100g)
export const ALIMENTI_BASE = [
  {
    id: "alim_pasta",
    nome: "Pasta di semola",
    categoria: "Primi",
    per100g: { kcal: 353, proteine: 12.5, carboidrati: 72.0, zuccheri: 3.0, grassi: 1.5, saturi: 0.3, fibre: 3.0, sale: 0.005 },
    allergeni: ["glutine"],
    diete: ["vegetariana", "vegana", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.60
  },
  {
    id: "alim_riso",
    nome: "Riso",
    categoria: "Primi",
    per100g: { kcal: 360, proteine: 7.0, carboidrati: 80.0, zuccheri: 0.2, grassi: 0.6, saturi: 0.1, fibre: 1.0, sale: 0.002 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 2.20
  },
  {
    id: "alim_passata",
    nome: "Passata di pomodoro",
    categoria: "Condimenti",
    per100g: { kcal: 24, proteine: 1.3, carboidrati: 4.0, zuccheri: 3.8, grassi: 0.2, saturi: 0.0, fibre: 1.2, sale: 0.3 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.40
  },
  {
    id: "alim_olio_evo",
    nome: "Olio extravergine di oliva",
    categoria: "Condimenti",
    per100g: { kcal: 884, proteine: 0.0, carboidrati: 0.0, zuccheri: 0.0, grassi: 100.0, saturi: 14.0, fibre: 0.0, sale: 0.0 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 9.50
  },
  {
    id: "alim_petto_pollo",
    nome: "Petto di pollo",
    categoria: "Carne",
    per100g: { kcal: 110, proteine: 23.0, carboidrati: 0.0, zuccheri: 0.0, grassi: 1.5, saturi: 0.4, fibre: 0.0, sale: 0.12 },
    allergeni: [],
    diete: ["senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 8.50
  },
  {
    id: "alim_macinato_bovino",
    nome: "Carne macinata di bovino",
    categoria: "Carne",
    per100g: { kcal: 215, proteine: 19.5, carboidrati: 0.0, zuccheri: 0.0, grassi: 15.0, saturi: 6.2, fibre: 0.0, sale: 0.15 },
    allergeni: [],
    diete: ["senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 10.00
  },
  {
    id: "alim_uova",
    nome: "Uova",
    categoria: "Proteine",
    pesoUnitarioG: 55,
    per100g: { kcal: 143, proteine: 12.6, carboidrati: 0.7, zuccheri: 0.4, grassi: 9.5, saturi: 3.1, fibre: 0.0, sale: 0.35 },
    allergeni: ["uova"],
    diete: ["vegetariana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 4.50
  },
  {
    id: "alim_fagioli_borlotti",
    nome: "Fagioli borlotti in scatola",
    categoria: "Legumi",
    per100g: { kcal: 85, proteine: 5.5, carboidrati: 12.0, zuccheri: 1.0, grassi: 0.6, saturi: 0.1, fibre: 5.0, sale: 0.6 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 2.20
  },
  {
    id: "alim_ceci",
    nome: "Ceci in scatola",
    categoria: "Legumi",
    per100g: { kcal: 120, proteine: 7.0, carboidrati: 16.0, zuccheri: 1.2, grassi: 2.2, saturi: 0.3, fibre: 4.8, sale: 0.6 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 2.30
  },
  {
    id: "alim_tonno_olio",
    nome: "Tonno sott'olio",
    categoria: "Pesce",
    per100g: { kcal: 190, proteine: 24.0, carboidrati: 0.0, zuccheri: 0.0, grassi: 10.5, saturi: 1.8, fibre: 0.0, sale: 1.1 },
    allergeni: ["pesce"],
    diete: ["senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 14.00
  },
  {
    id: "alim_parmigiano",
    nome: "Parmigiano Reggiano / Grana",
    categoria: "Latticini",
    per100g: { kcal: 392, proteine: 33.0, carboidrati: 0.0, zuccheri: 0.0, grassi: 28.5, saturi: 19.0, fibre: 0.0, sale: 1.6 },
    allergeni: ["latte"],
    diete: ["vegetariana", "senza glutine", "senza maiale", "halal"],
    prezzoMedioKg: 18.00
  },
  {
    id: "alim_mozzarella",
    nome: "Mozzarella",
    categoria: "Latticini",
    pesoUnitarioG: 125,
    per100g: { kcal: 250, proteine: 18.0, carboidrati: 1.0, zuccheri: 1.0, grassi: 19.5, saturi: 13.0, fibre: 0.0, sale: 0.7 },
    allergeni: ["latte"],
    diete: ["vegetariana", "senza glutine", "senza maiale", "halal"],
    prezzoMedioKg: 9.00
  },
  {
    id: "alim_latte_intero",
    nome: "Latte intero",
    categoria: "Latticini",
    per100g: { kcal: 64, proteine: 3.3, carboidrati: 4.8, zuccheri: 4.8, grassi: 3.6, saturi: 2.4, fibre: 0.0, sale: 0.1 },
    allergeni: ["latte"],
    diete: ["vegetariana", "senza glutine", "senza maiale", "halal"],
    prezzoMedioKg: 1.30
  },
  {
    "id": "alim_pane",
    nome: "Pane comune",
    categoria: "Prodotti da forno",
    per100g: { kcal: 265, proteine: 8.5, carboidrati: 52.0, zuccheri: 2.5, grassi: 1.5, saturi: 0.3, fibre: 3.5, sale: 1.2 },
    allergeni: ["glutine"],
    diete: ["vegetariana", "vegana", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 3.00
  },
  {
    id: "alim_biscotti",
    nome: "Biscotti secchi",
    categoria: "Colazione",
    per100g: { kcal: 420, proteine: 7.5, carboidrati: 72.0, zuccheri: 22.0, grassi: 11.0, saturi: 4.5, fibre: 2.8, sale: 0.6 },
    allergeni: ["glutine", "latte", "uova"],
    diete: ["vegetariana", "senza maiale", "halal"],
    prezzoMedioKg: 3.50
  },
  {
    id: "alim_marmellata",
    nome: "Confettura / Marmellata",
    categoria: "Colazione",
    per100g: { kcal: 240, proteine: 0.5, carboidrati: 58.0, zuccheri: 55.0, grassi: 0.1, saturi: 0.0, fibre: 1.5, sale: 0.02 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 5.00
  },
  {
    id: "alim_patate",
    nome: "Patate",
    categoria: "Verdure",
    per100g: { kcal: 77, proteine: 2.0, carboidrati: 17.5, zuccheri: 0.8, grassi: 0.1, saturi: 0.0, fibre: 2.1, sale: 0.01 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.20
  },
  {
    id: "alim_carote",
    nome: "Carote",
    categoria: "Verdure",
    per100g: { kcal: 41, proteine: 0.9, carboidrati: 9.5, zuccheri: 4.7, grassi: 0.2, saturi: 0.0, fibre: 2.8, sale: 0.07 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.30
  },
  {
    id: "alim_cipolle",
    nome: "Cipolle",
    categoria: "Verdure",
    per100g: { kcal: 40, proteine: 1.1, carboidrati: 9.0, zuccheri: 4.2, grassi: 0.1, saturi: 0.0, fibre: 1.7, sale: 0.01 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.20
  },
  {
    id: "alim_zucchine",
    nome: "Zucchine",
    categoria: "Verdure",
    per100g: { kcal: 17, proteine: 1.2, carboidrati: 3.1, zuccheri: 2.5, grassi: 0.3, saturi: 0.1, fibre: 1.0, sale: 0.01 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.80
  },
  {
    id: "alim_mele",
    nome: "Mele",
    categoria: "Frutta",
    pesoUnitarioG: 180,
    per100g: { kcal: 52, proteine: 0.3, carboidrati: 13.8, zuccheri: 10.4, grassi: 0.2, saturi: 0.0, fibre: 2.4, sale: 0.001 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.90
  },
  {
    id: "alim_banane",
    nome: "Banane",
    categoria: "Frutta",
    pesoUnitarioG: 150,
    per100g: { kcal: 89, proteine: 1.1, carboidrati: 22.8, zuccheri: 12.2, grassi: 0.3, saturi: 0.1, fibre: 2.6, sale: 0.001 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.80
  },
  {
    id: "alim_cioccolato_fondente",
    nome: "Cioccolato fondente",
    categoria: "Dolci",
    per100g: { kcal: 546, proteine: 5.0, carboidrati: 60.0, zuccheri: 48.0, grassi: 31.0, saturi: 18.5, fibre: 7.0, sale: 0.02 },
    allergeni: ["soia"],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 8.00
  },
  {
    id: "alim_farina_00",
    nome: "Farina di grano tenero tipo 00",
    categoria: "Dispensa",
    per100g: { kcal: 364, proteine: 10.0, carboidrati: 76.0, zuccheri: 1.0, grassi: 1.0, saturi: 0.2, fibre: 2.5, sale: 0.002 },
    allergeni: ["glutine"],
    diete: ["vegetariana", "vegana", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.10
  },
  {
    id: "alim_zucchero",
    nome: "Zucchero semolato",
    categoria: "Dispensa",
    per100g: { kcal: 387, proteine: 0.0, carboidrati: 100.0, zuccheri: 100.0, grassi: 0.0, saturi: 0.0, fibre: 0.0, sale: 0.0 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 1.30
  },
  {
    id: "alim_sale",
    nome: "Sale fino",
    categoria: "Condimenti",
    per100g: { kcal: 0, proteine: 0.0, carboidrati: 0.0, zuccheri: 0.0, grassi: 0.0, saturi: 0.0, fibre: 0.0, sale: 100.0 },
    allergeni: [],
    diete: ["vegetariana", "vegana", "senza glutine", "senza lattosio", "senza maiale", "halal"],
    prezzoMedioKg: 0.50
  }
];
