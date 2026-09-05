// ─────────────────────────────────────────────────────────────────
//  PENCILS & POWERS: THE DREAD KNIGHT — Dati di Gioco Completi
// ─────────────────────────────────────────────────────────────────

export const MAP_ROWS = 17;
export const MAP_COLS = 15;

export const CT = {
  WALL:     'wall',
  ROOM:     'room',
  CORRIDOR: 'corridor',
  START:    'start',
  OBSTACLE: 'obstacle',
  TOMB:     'tomb',
  MYSTERY:  'mystery',
  DOOR:     'door',
};

// ── Stanze (Mappa Esatta 17x15)
export const ROOM_DEFS = [
  { id: 'r1',   name: 'Stanza 1',         rows:[12,14], cols:[1,3],   door:[13,4],  color:'#4e1010', idx:0 },
  { id: 'r2',   name: 'Stanza 2',         rows:[12,14], cols:[11,13], door:[13,10], color:'#2a1050', idx:1 },
  { id: 'r3',   name: 'Stanza 3',         rows:[7,9],   cols:[1,3],   door:[8,4],   color:'#104010', idx:2 },
  { id: 'r4',   name: 'Stanza 4',         rows:[7,9],   cols:[11,13], door:[8,10],  color:'#103040', idx:3 },
  { id: 'r5',   name: 'Stanza 5',         rows:[2,4],   cols:[1,3],   door:[3,4],   color:'#402010', idx:4 },
  { id: 'r6',   name: 'Stanza 6',         rows:[2,4],   cols:[11,13], door:[3,10],  color:'#301010', idx:5 },
  { id: 'boss', name: 'Sala del Trono',   rows:[0,2],   cols:[6,8],   door:[3,7],   color:'#0a0a0a', idx:6, locked:true },
];

// ── Costruzione griglia dungeon
const CORRIDOR_SEGS = [
  [1, 15,  0, 14], // Base open area
];

const WALL_CELLS = [
  // Outer borders are handled by just not being in corridor if we wanted, but let's carve out the corridors instead.
  // Actually, let's make everything a wall, then carve corridors.
];

// Let's explicitly define the corridor path to match the grid style
const CARVE_CORRIDORS = [
  [1, 15, 0, 0],   // Leftmost vertical
  [1, 15, 14, 14], // Rightmost vertical
  [1, 1, 0, 14],   // Top horizontal (below boss)
  [15, 15, 0, 14], // Bottom horizontal
  [5, 5, 0, 14],   // Horizontal divider 1
  [10, 10, 0, 14], // Horizontal divider 2
  [1, 15, 4, 4],   // Vertical spine 1
  [1, 15, 10, 10], // Vertical spine 2
  [1, 15, 7, 7],   // Center vertical spine
];

const OBSTACLE_CELLS = [
  [5,2], [5,12], [10,2], [10,12], // In horizontal corridors
  [7,7], [12,7], // Center spine
];

const TOMB_CELLS = [
  [1,2], [1,12], // Top corners
  [6,7], [11,7], // Center spine
  [15,2], [15,12] // Bottom corners
];

export function buildDungeon() {
  const g = Array.from({length:MAP_ROWS}, () =>
    Array.from({length:MAP_COLS}, () => ({ type: CT.WALL, roomId: null, locked: false }))
  );
  
  // Carve Corridors
  for (const [r1,r2,c1,c2] of CARVE_CORRIDORS)
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        g[r][c] = { type: CT.CORRIDOR, roomId: null, locked: false };
        
  // Add thick corridors filling the space
  for(let r=1; r<=15; r++) {
    for(let c=1; c<=13; c++) {
      if ((c>=4 && c<=10) || (r>=5 && r<=10)) {
        g[r][c] = { type: CT.CORRIDOR, roomId: null, locked: false };
      }
    }
  }

  // Rooms overwrite corridors
  for (const rm of ROOM_DEFS) {
    for (let r = rm.rows[0]; r <= rm.rows[1]; r++)
      for (let c = rm.cols[0]; c <= rm.cols[1]; c++)
        g[r][c] = { type: CT.ROOM, roomId: rm.id, locked: rm.locked||false };
  }

  // Define Start Area (bottom center)
  for (let r=14; r<=15; r++) {
    for (let c=6; c<=8; c++) {
      g[r][c] = { type: CT.START, roomId: null, locked: false };
    }
  }

  // Obstacles & Tombs & Doors (placed in corridors)
  for (const [r,c] of OBSTACLE_CELLS) {
    g[r][c] = { type: CT.OBSTACLE, roomId: null, locked: false };
  }
  for (const [r,c] of TOMB_CELLS) {
    g[r][c] = { type: CT.TOMB, roomId: null, locked: false };
  }
  for (const rm of ROOM_DEFS) {
    if (rm.door) {
      g[rm.door[0]][rm.door[1]] = { type: CT.DOOR, roomId: rm.id, locked: rm.locked };
    }
  }

  // Mystery encounter
  g[6][5] = { type: CT.MYSTERY, roomId: null, locked: false };
  g[11][9] = { type: CT.MYSTERY, roomId: null, locked: false };

  return g;
}

// ── Mostri
export const MONSTERS = [
  {
    id:'stalker', roomId:'r1', name:'Lo Stalker', icon:'👁️',
    maxHealth:5, maxAttack:4, points:10, chestIdx:0,
    power:'Ogni volta che esplori una nuova cella, lo Stalker guadagna 1 punto salute.',
    powerLabel:'Potere: Caccia Incessante',
  },
  {
    id:'phantom', roomId:'r2', name:'Il Fantasma', icon:'👻',
    maxHealth:5, maxAttack:4, points:15, chestIdx:1,
    power:'Può essere colpito SOLO con armi magiche. Senza Spade Magiche il combattimento fallisce automaticamente.',
    powerLabel:'Potere: Forma Eterea',
  },
  {
    id:'spyder', roomId:'r3', name:'Il Ragno Oscuro', icon:'🕷️',
    maxHealth:4, maxAttack:4, points:8, chestIdx:2,
    power:'Quando viene sconfitto, ogni eroe perde 1 HP (morso in punto di morte).',
    powerLabel:'Potere: Morso Mortale',
  },
  {
    id:'wraith', roomId:'r4', name:'Lo Spettro', icon:'💀',
    maxHealth:5, maxAttack:5, points:12, chestIdx:3,
    power:"All'inizio della partita e ogni volta che muore un altro mostro, questo mostro guadagna +1 attacco.",
    powerLabel:'Potere: Vincolo degli Spiriti',
  },
  {
    id:'golem', roomId:'r5', name:'Il Golem di Pietra', icon:'🗿',
    maxHealth:7, maxAttack:5, points:20, chestIdx:4,
    power:'Assorbe 1 danno da ogni attacco fallito (il danno agli eroi è ridotto di 1 se non viene sconfitto).',
    powerLabel:'Potere: Pelle di Roccia',
  },
  {
    id:'cultist', roomId:'r6', name:'Il Cultista', icon:'🧙',
    maxHealth:6, maxAttack:5, points:18, chestIdx:5,
    power:'Annulla l\'effetto del primo potere Eroe usato in combattimento contro di lui.',
    powerLabel:'Potere: Silenzio Magico',
  },
  {
    id:'dreadknight', roomId:'boss', name:'Il Cavaliere Oscuro', icon:'🏴',
    maxHealth:8, maxAttack:6, points:40, chestIdx:6, isBoss:true,
    power:'Non può essere attaccato senza la Chiave Magica (ottenuta dal forziere 6, posizione 8). Sconfiggerlo termina la partita.',
    powerLabel:'Potere BOSS: Sigillo della Cripta',
  },
];

// ── Ricompense forzieri
const R = {
  g1:  { type:'gold',   amount:1, icon:'🪙',    label:'+1 Oro' },
  g2:  { type:'gold',   amount:2, icon:'🪙🪙',  label:'+2 Oro' },
  g3:  { type:'gold',   amount:3, icon:'🪙🪙🪙',label:'+3 Oro' },
  sw:  { type:'sword',  amount:1, icon:'⚔️',    label:'Spada Magica' },
  sh:  { type:'shield', amount:1, icon:'🛡️',   label:'Scudo Magico' },
  hp:  { type:'potion', amount:1, icon:'🧪',    label:'+1 Salute' },
  key: { type:'key',    amount:1, icon:'🗝️',   label:'Chiave Magica' },
};

export const CHESTS = [
  { roomId:'r1',   squares:[R.g1, R.sw, R.g1, R.sh, R.g2, R.hp] },
  { roomId:'r2',   squares:[R.g1, R.hp, R.sw, R.g1, R.sh, R.g2] },
  { roomId:'r3',   squares:[R.g2, R.g1, R.sw, R.hp, R.g1, R.sh] },
  { roomId:'r4',   squares:[R.sw, R.g1, R.hp, R.g2, R.sh, R.g1] },
  { roomId:'r5',   squares:[R.g1, R.sh, R.g1, R.sw, R.g2, R.hp] },
  { roomId:'r6',   squares:[R.g1, R.sw, R.g1, R.hp, R.sh, R.g2, R.g1, R.key] },
  { roomId:'boss', squares:[R.sw, R.sw, R.sh, R.sh, R.g3, R.hp, R.g3, R.g3] },
];

// ── Eroi
export const HERO_DEFS = [
  {
    id:'mystic', name:'Mistico', icon:'🔮', maxHp:3, maxPower:3,
    powers:[
      { name:'Proiettile Magico', desc:'+2 al tiro di combattimento.', bonus:2, free:false },
      { name:'Cura Minore', desc:'Recupera 1 HP prima del danno nemico.', heal:1, free:false },
      { name:'Visione (FREE)', desc:'Vedi la prossima cella senza esplorarla.', free:true },
    ]
  },
  {
    id:'guardian', name:'Guardiano', icon:'🛡️', maxHp:5, maxPower:3,
    powers:[
      { name:'Scudo Totale', desc:'Assorbi tutto il danno del mostro per questo attacco.', absorbAll:true, free:false },
      { name:'Bastonata', desc:'+1 al tiro di combattimento.', bonus:1, free:false },
      { name:'Provocazione (FREE)', desc:'Tutto il danno va su di te (proteggi gli altri).', free:true },
    ]
  },
  {
    id:'sorcerer', name:'Stregone', icon:'✨', maxHp:2, maxPower:5,
    powers:[
      { name:'Palla di Fuoco', desc:'+3 al tiro di combattimento.', bonus:3, free:false },
      { name:'Scudo Energetico', desc:'Ignora 2 danni nemici.', absorb:2, free:false },
      { name:'Rinforzo (FREE)', desc:'Un altro eroe usa un potere gratis questo turno.', free:true },
    ]
  },
  {
    id:'assassin', name:'Assassino', icon:'🗡️', maxHp:3, maxPower:4,
    powers:[
      { name:'Attacco Furtivo', desc:'+2 al tiro se il mostro non è ancora stato attaccato.', bonus:2, free:false },
      { name:'Veleno', desc:'+1 al tiro e il mostro non può guadagnare salute.', bonus:1, free:false },
      { name:'Schivata', desc:'Ignora 1 danno nemico.', absorb:1, free:false },
    ]
  },
];

// ── Forme per l'Esplorazione (Tetris)
export const EXPLORE_SHAPES = {
  2: [[0,0], [0,1], [0,2]], // Linea da 3
  3: [[0,0], [0,1], [1,0]], // Angolo da 3
  4: [[0,0], [0,1], [0,2], [1,1]], // Forma a T
  5: [[0,0], [0,1], [1,0], [1,1]], // Quadrato
  6: [[0,0], [0,1], [0,2], [1,0]]  // Forma a L
};
