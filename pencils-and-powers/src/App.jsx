import React, { useState, useEffect, useMemo } from 'react';
import './index.css';
import DiceManager     from './components/DiceManager';
import HeroDashboard   from './components/HeroDashboard';
import DungeonMap      from './components/DungeonMap';
import MonsterArea     from './components/MonsterArea';
import TreasureArea    from './components/TreasureArea';
import ScoreCalculator from './components/ScoreCalculator';
import SetupModal      from './components/SetupModal';
import CombatModal     from './components/CombatModal';
import { MONSTERS, HERO_DEFS, ROOM_DEFS } from './data/gameData';

/* ---- LocalStorage Hook ---- */
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Special case for sets/arrays
        const parsed = JSON.parse(item);
        if (key === 'pp_shaded' && Array.isArray(parsed)) return new Set(parsed);
        return parsed;
      }
      return initialValue();
    } catch (error) {
      console.warn("Error reading localStorage", error);
      return initialValue();
    }
  });

  useEffect(() => {
    try {
      let serialized = value;
      if (value instanceof Set) serialized = Array.from(value);
      window.localStorage.setItem(key, JSON.stringify(serialized));
    } catch (error) {
      console.warn("Error setting localStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
}

/* ---- Initial state factories ---- */
const makeMonsters  = () => MONSTERS.map(m => ({ ...m, hits: 0, defeated: false }));
const makeTreasures = () => [
  { name: 'Spada Magica',       icon: '⚔️',  found: false, points: 12 },
  { name: 'Scudo Magico',       icon: '🛡️',  found: false, points: 10 },
  { name: "Pietra dell'Anima",  icon: '💎',  found: false, points: 15 },
  { name: 'Amuleto Antico',     icon: '📿',  found: false, points:  8 },
  { name: 'Chiave Magica',      icon: '🗝️',  found: false, points:  0 },
  { name: 'Oro',                icon: '🪙',  amount: 0 },
];
const makeHeroes = () => HERO_DEFS.map(h => ({ ...h, hp: h.maxHp, power: 0 }));

function App() {
  const [turn,        setTurn]        = useLocalStorage('pp_turn', () => 1);
  const [dice,        setDice]        = useLocalStorage('pp_dice', () => [null, null, null]);
  const [assignments, setAssignments] = useLocalStorage('pp_assign', () => ({ esplora: null, tesoro: null, mostro: null }));
  const [monsters,    setMonsters]    = useLocalStorage('pp_monsters', makeMonsters);
  const [treasures,   setTreasures]   = useLocalStorage('pp_treasures', makeTreasures);
  const [heroes,      setHeroes]      = useLocalStorage('pp_heroes', makeHeroes);
  const [shadedCells, setShadedCells] = useLocalStorage('pp_shaded', () => new Set());
  const [chestsProgress, setChestsProgress] = useLocalStorage('pp_chests_prog', () => [0,0,0,0,0,0,0]);
  const [gamePhase,   setGamePhase]   = useLocalStorage('pp_phase', () => 'SETUP');
  const [dieMapping,  setDieMapping]  = useLocalStorage('pp_mapping', () => ({ monster: null, treasure: null }));
  const [combatTarget, setCombatTarget] = useState(null); // Transient state per il modale combattimento
  
  // App no longer strictly needs resetKey for most components since they are controlled,
  // but keeping it doesn't hurt if we need to force remount animations.

  const rollDice = () => {
    setDice([
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ]);
    setAssignments({ esplora: null, tesoro: null, mostro: null });
    setTurn(t => t + 1);
  };

  const assignDie = (dieIndex, category) => {
    setAssignments(prev => ({ ...prev, [category]: dice[Number(dieIndex)] }));
  };

  const newGame = () => {
    if (!window.confirm('Iniziare una nuova partita? Tutti i progressi andranno persi.')) return;
    setTurn(1);
    setDice([null, null, null]);
    setAssignments({ esplora: null, tesoro: null, mostro: null });
    setMonsters(makeMonsters());
    setTreasures(makeTreasures());
    setHeroes(makeHeroes());
    setShadedCells(new Set());
    setChestsProgress([0,0,0,0,0,0,0]);
    setGamePhase('SETUP');
    setDieMapping({ monster: null, treasure: null });
  };

  const handleSetupComplete = (assignments) => {
    setTreasures(prev => prev.map(t => t.name === 'Oro' ? { ...t, amount: assignments.gold } : t));
    setDieMapping({ monster: assignments.monster, treasure: assignments.treasure });
    setGamePhase('PLAY');
  };

  const handleCombatResolve = (monsterIdx, isWin, extraHits = 0) => {
    setMonsters(prev => prev.map((m, i) => {
      if (i !== monsterIdx) return m;
      if (isWin) {
        return { ...m, defeated: true, hits: m.maxHealth + (m.upgrades?.health || 0) };
      } else {
        return { ...m, hits: m.hits + extraHits };
      }
    }));
  };

  const accessibleRooms = useMemo(() => {
    const acc = new Set();
    const hasKey = treasures.some(t => t.name === 'Chiave Magica' && t.found);
    
    for (const rm of ROOM_DEFS) {
      if (rm.id === 'boss' && !hasKey) continue;
      // Il mostro è accessibile se la porta è colorata (shaded)
      if (rm.door && shadedCells.has(`${rm.door[0]},${rm.door[1]}`)) {
         acc.add(rm.id);
      }
    }
    return acc;
  }, [shadedCells, treasures]);

  return (
    <>
      {gamePhase === 'SETUP' && <SetupModal onComplete={handleSetupComplete} />}
      
      {combatTarget !== null && (
        <CombatModal 
          target={monsters[combatTarget]} 
          targetIdx={combatTarget}
          onResolve={handleCombatResolve} 
          onClose={() => setCombatTarget(null)} 
          heroes={heroes} 
          setHeroes={setHeroes} 
          treasures={treasures} 
          setTreasures={setTreasures} 
        />
      )}

      {/* ── Title bar ── */}
      <header style={{
        background: 'linear-gradient(90deg, #1a1008 0%, #2a1a08 50%, #1a1008 100%)',
        borderBottom: '1px solid #b8882a',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      }}>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: '1rem', letterSpacing: '0.2em',
          color: '#b8882a', textTransform: 'uppercase',
        }}>
          ⚜ Pencils &amp; Powers
        </span>
        <span style={{
          fontFamily: 'var(--font-title)', fontSize: '0.75rem', letterSpacing: '0.14em',
          color: 'rgba(184,136,42,0.6)', textTransform: 'uppercase',
        }}>
          A1 — The Dread Knight
        </span>
        <button
          id="btn-new-game"
          onClick={newGame}
          style={{
            fontFamily: 'var(--font-title)', fontSize: '0.72rem', letterSpacing: '0.1em',
            textTransform: 'uppercase', padding: '5px 14px',
            background: 'transparent', border: '1px solid rgba(184,136,42,0.5)',
            borderRadius: '4px', color: 'rgba(240,230,200,0.7)', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#b8882a'; e.target.style.color = '#b8882a'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(184,136,42,0.5)'; e.target.style.color = 'rgba(240,230,200,0.7)'; }}
        >
          ↺ Nuova Partita
        </button>
      </header>

      {/* ── Main layout ── */}
      <div className="app-container">
        {/* LEFT */}
        <div className="panel left-sidebar">
          <div className="panel-title">Dadi &amp; Eroi</div>
          <DiceManager
            dice={dice}
            assignments={assignments}
            rollDice={rollDice}
            assignDie={assignDie}
            turn={turn}
          />
          <HeroDashboard 
            heroes={heroes} 
            setHeroes={setHeroes} 
            treasures={treasures}
            setTreasures={setTreasures}
          />
        </div>

        {/* CENTER */}
        <div className="panel main-area">
          <div className="main-panel-title">⚔ The Dread Knight ⚔</div>
          <DungeonMap 
            exploreValue={assignments.esplora} 
            shadedCells={shadedCells} 
            onShadeUpdate={setShadedCells}
            accessibleRooms={accessibleRooms} 
          />
        </div>

        {/* RIGHT */}
        <div className="panel right-sidebar">
          <div className="panel-title">Mostri &amp; Tesori</div>
          <MonsterArea  
            monsters={monsters}   
            setMonsters={setMonsters}   
            monsterDieStart={dieMapping.monster}
            assignedDie={assignments.mostro}
            consumeDie={() => setAssignments(p => ({...p, mostro: null}))}
            accessibleRooms={accessibleRooms}
            onAttack={setCombatTarget}
          />
          <TreasureArea 
            treasures={treasures} 
            setTreasures={setTreasures} 
            chestsProgress={chestsProgress}
            setChestsProgress={setChestsProgress}
            treasureDieStart={dieMapping.treasure}
            assignedDie={assignments.tesoro}
            consumeDie={() => setAssignments(p => ({...p, tesoro: null}))}
            monsters={monsters}
          />
          <ScoreCalculator turn={turn} monsters={monsters} treasures={treasures} />
        </div>
      </div>
    </>
  );
}

export default App;
