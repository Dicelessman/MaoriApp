import React, { useState } from 'react';

const DICE_ICONS = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const CATEGORIES = [
  { key: 'esplora', label: 'Esplora',  icon: '🗺️' },
  { key: 'tesoro',  label: 'Tesoro',   icon: '💰' },
  { key: 'mostro',  label: 'Mostro',   icon: '⚔️' },
];

function DiceManager({ dice, assignments, rollDice, assignDie, turn }) {
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    rollDice();
    setTimeout(() => setRolling(false), 600);
  };

  const assignedIndices = Object.values(assignments)
    .filter(v => v !== null)
    .map(v => dice.indexOf(v));

  const turnPct = Math.min(100, (turn / 35) * 100);

  return (
    <div className="dice-section">
      <h3>Lancio dei Dadi</h3>

      {/* Dice display */}
      <div className="dice-row">
        {dice.map((d, i) => (
          <div
            key={i}
            className={`die ${rolling ? 'rolling' : ''} ${assignedIndices.includes(i) ? 'assigned' : ''} ${d === null ? 'empty' : ''}`}
            draggable={d !== null && !assignedIndices.includes(i)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', i.toString());
            }}
          >
            {d !== null ? DICE_ICONS[d] : '?'}
          </div>
        ))}
      </div>

      <button id="btn-roll-dice" className="btn-roll" onClick={handleRoll}>
        🎲 Lancia Dadi
      </button>

      {/* Assignments */}
      <div className="assignment-grid">
        {CATEGORIES.map(({ key, label, icon }) => {
          const val = assignments[key];
          return (
            <div key={key} 
                 className={`assignment-row ${val !== null ? 'active' : ''}`}
                 onDragOver={(e) => e.preventDefault()}
                 onDrop={(e) => {
                   e.preventDefault();
                   const dieIdx = e.dataTransfer.getData('text/plain');
                   if (dieIdx !== '') assignDie(Number(dieIdx), key);
                 }}
            >
              <span className="assignment-icon">{icon}</span>
              <select
                className="assignment-select"
                value={val !== null ? String(dice.indexOf(val)) : ''}
                onChange={e => e.target.value !== '' && assignDie(Number(e.target.value), key)}
              >
                <option value="">{label} — assegna dado</option>
                {dice.map((d, i) => d !== null && (
                  <option key={i} value={i}>Dado {i + 1}  ({d})</option>
                ))}
              </select>
              <span className="assignment-value">{val !== null ? val : ''}</span>
            </div>
          );
        })}
      </div>

      {/* Turn tracker */}
      <div className="turn-tracker">
        <span className="turn-label">Turno</span>
        <span className={`turn-number ${turn > 35 ? 'danger' : ''}`}>{turn}</span>
        <span className="turn-label">/&nbsp;35</span>
      </div>
      <div className="turn-bar">
        <div className="turn-bar-fill" style={{ width: `${turnPct}%` }} />
      </div>
      {turn > 35 && (
        <p style={{ fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--crimson)', textAlign: 'center', marginTop: 6, letterSpacing: '0.06em' }}>
          ⚠️ Penalità attiva: -{turn - 35} punti
        </p>
      )}
    </div>
  );
}

export default DiceManager;
