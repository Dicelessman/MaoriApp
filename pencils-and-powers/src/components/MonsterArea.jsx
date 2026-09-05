import React from 'react';
import { MONSTERS } from '../data/gameData';

function MonsterArea({ monsters, setMonsters, monsterDieStart, assignedDie, consumeDie, accessibleRooms, onAttack }) {
  const getDieFace = (idx) => {
    if (!monsterDieStart || MONSTERS[idx].isBoss) return null;
    return ((monsterDieStart - 1 + idx) % 6) + 1;
  };

  const canUpgrade = (m, type, dieFace) => {
    if (assignedDie === null || assignedDie !== dieFace || m.defeated) return false;
    const currentH = (m.upgrades?.health || 0);
    const currentA = (m.upgrades?.attack || 0);
    if (type === 'health' && currentH - currentA >= 2) return false;
    if (type === 'attack' && currentA - currentH >= 2) return false;
    return true;
  };

  const handleUpgrade = (mi, type) => {
    setMonsters(prev => prev.map((m, i) => {
      if (i !== mi) return m;
      const upg = m.upgrades || { health: 0, attack: 0 };
      return { ...m, upgrades: { ...upg, [type]: upg[type] + 1 } };
    }));
    consumeDie();
  };

  // Manual defeat removed as combat is now handled via CombatModal

  return (
    <div className="monster-area">
      <div className="section-divider"><span>⚔ Mostri</span></div>
      
      {assignedDie && (
        <div style={{ background: 'rgba(184,136,42,0.1)', border: '1px solid var(--gold)', padding: 6, borderRadius: 4, marginBottom: 8, fontSize: '0.8rem', textAlign: 'center', color: 'var(--gold)' }}>
          Hai assegnato un <strong>{assignedDie}</strong> ai Mostri. Scegli un potenziamento!
        </div>
      )}

      {monsters.map((m, mi) => {
        const dieFace = getDieFace(mi);
        const uH = m.upgrades?.health || 0;
        const uA = m.upgrades?.attack || 0;
        const effHealth = m.maxHealth + uH;
        const effAttack = m.maxAttack + uA;
        const isTarget = assignedDie !== null && assignedDie === dieFace && !m.defeated;

        return (
          <div key={m.id} className={`monster-card ${m.defeated ? 'defeated' : ''} ${isTarget ? 'highlight-target' : ''}`}>
            <div className="monster-header">
              <span className="monster-name">
                {dieFace && <span className="die-badge">{dieFace}</span>}
                {m.icon} {m.name}
              </span>
              {!m.defeated && accessibleRooms.has(m.roomId) && (
                <button className="btn-roll" style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'var(--crimson)' }} onClick={() => onAttack(mi)}>
                  ⚔️ Attacca
                </button>
              )}
              {m.defeated && <span style={{ color: '#2a5a2a', fontWeight: 'bold', fontSize: '0.8rem' }}>Sconfitto</span>}
            </div>
            
            <div className="monster-stats" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="monster-stat">❤️ {effHealth}</span>
                {isTarget && (
                  <button 
                    disabled={!canUpgrade(m, 'health', dieFace)} 
                    onClick={() => handleUpgrade(mi, 'health')}
                    title="Potenzia Salute (Max +2 rispetto ad Attacco)"
                    style={{ padding: '2px 6px', fontSize: '0.7rem', background: canUpgrade(m, 'health', dieFace) ? 'var(--crimson)' : '#333' }}>
                    +
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="monster-stat">⚔️ {effAttack}</span>
                {isTarget && (
                  <button 
                    disabled={!canUpgrade(m, 'attack', dieFace)} 
                    onClick={() => handleUpgrade(mi, 'attack')}
                    title="Potenzia Attacco (Max +2 rispetto a Salute)"
                    style={{ padding: '2px 6px', fontSize: '0.7rem', background: canUpgrade(m, 'attack', dieFace) ? '#3a6e8a' : '#333' }}>
                    +
                  </button>
                )}
              </div>
              <span className="monster-stat" style={{ marginLeft: 'auto' }}>🏆 {m.points}pt</span>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'rgba(200,200,200,0.6)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.2 }}>
              {m.powerLabel}: {m.power}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MonsterArea;
