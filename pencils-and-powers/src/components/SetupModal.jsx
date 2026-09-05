import React, { useState } from 'react';

function SetupModal({ onComplete }) {
  const [dice, setDice] = useState([]);
  const [assignments, setAssignments] = useState({ gold: null, monster: null, treasure: null });

  const rollDice = () => {
    let newDice;
    while (true) {
      newDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      // Reroll until all three dice have different numbers
      if (new Set(newDice).size === 3) break;
    }
    setDice(newDice);
    setAssignments({ gold: null, monster: null, treasure: null });
  };

  const assignDie = (dieIndex, category) => {
    setAssignments(prev => ({ ...prev, [category]: dice[dieIndex] }));
  };

  const isComplete = assignments.gold !== null && assignments.monster !== null && assignments.treasure !== null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1210', border: '2px solid var(--gold)',
        padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '100%',
        color: '#e8dcba', fontFamily: 'var(--font-body)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--gold)', textAlign: 'center', marginTop: 0 }}>Fase di Setup</h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(232,220,186,0.8)', textAlign: 'center' }}>
          Tira 3 dadi (con risultati diversi) e assegnali per determinare l'oro iniziale e la mappatura dei dadi per Mostri e Tesori.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, margin: '20px 0' }}>
          {dice.length === 0 ? (
            <div style={{ padding: '20px', border: '1px dashed rgba(184,136,42,0.5)', borderRadius: 8, width: '100%', textAlign: 'center' }}>
              <button className="btn-roll" onClick={rollDice}>🎲 Tira i Dadi Iniziali</button>
            </div>
          ) : (
            dice.map((d, i) => {
              const isAssigned = Object.values(assignments).includes(d);
              return (
                <div key={i} className={`die ${isAssigned ? 'assigned' : ''}`} style={{ width: 48, height: 48, fontSize: '1.5rem' }}>
                  {['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][d]}
                </div>
              );
            })
          )}
        </div>

        {dice.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: 'treasure', label: 'Mappatura Tesori (primo in alto)', icon: '💰' },
              { key: 'monster', label: 'Mappatura Mostri (primo in alto)', icon: '⚔️' },
              { key: 'gold', label: 'Oro Iniziale', icon: '🪙' }
            ].map(({ key, label, icon }) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 4 }}>
                <span>{icon} {label}</span>
                <select 
                  value={assignments[key] ? dice.indexOf(assignments[key]) : ''}
                  onChange={e => e.target.value !== '' && assignDie(Number(e.target.value), key)}
                  style={{ background: '#0a0805', color: 'var(--gold)', border: '1px solid rgba(184,136,42,0.4)', padding: '4px 8px', borderRadius: 4 }}
                >
                  <option value="">-- Seleziona --</option>
                  {dice.map((d, i) => (
                    <option key={i} value={i} disabled={Object.values(assignments).includes(d) && assignments[key] !== d}>Dado {d}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button 
            className="btn-roll" 
            style={{ background: isComplete ? 'rgba(30,100,30,0.8)' : 'rgba(100,100,100,0.5)', opacity: isComplete ? 1 : 0.5, pointerEvents: isComplete ? 'auto' : 'none' }}
            onClick={() => onComplete(assignments)}
          >
            Inizia Avventura
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupModal;
