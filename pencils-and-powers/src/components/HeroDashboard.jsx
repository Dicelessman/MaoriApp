import React from 'react';
import { HERO_DEFS } from '../data/gameData';

function HeroDashboard({ heroes, setHeroes, treasures, setTreasures }) {
  const gold = treasures.find(t => t.name === 'Oro')?.amount || 0;

  const toggleHp = (heroIdx, pipIdx) => {
    setHeroes(prev => prev.map((h, i) => {
      if (i !== heroIdx) return h;
      const newHp = h.hp === pipIdx + 1 ? pipIdx : pipIdx + 1;
      const maxHp = h.maxHp + (h.level || 0);
      return { ...h, hp: Math.max(0, Math.min(maxHp, newHp)) };
    }));
  };

  const togglePower = (heroIdx, pipIdx) => {
    setHeroes(prev => prev.map((h, i) => {
      if (i !== heroIdx) return h;
      const newPower = h.power === pipIdx + 1 ? pipIdx : pipIdx + 1;
      const maxPwr = h.maxPower + (h.level || 0);
      return { ...h, power: Math.max(0, Math.min(maxPwr, newPower)) };
    }));
  };

  const handleLevelUp = (heroIdx) => {
    setHeroes(prev => {
      const hero = prev[heroIdx];
      const targetLevel = (hero.level || 0) + 1;
      if (targetLevel > 3) return prev;
      const cost = 5 + targetLevel;
      if (gold < cost) {
        alert("Non hai abbastanza oro per questo Level Up!");
        return prev;
      }
      
      // Spend gold
      setTreasures(tp => tp.map(t => t.name === 'Oro' ? { ...t, amount: t.amount - cost } : t));
      
      // Upgrade hero and fully heal/restore power
      return prev.map((h, i) => {
        if (i !== heroIdx) return h;
        return { 
          ...h, 
          level: targetLevel, 
          hp: h.maxHp + targetLevel, 
          power: h.maxPower + targetLevel 
        };
      });
    });
  };

  const handleRevive = (heroIdx) => {
    // "Raise Dead: A dead hero that is not at max level (3) may be brought back by paying for a Level Up"
    setHeroes(prev => {
      const hero = prev[heroIdx];
      if (hero.hp > 0) return prev;
      const targetLevel = (hero.level || 0) + 1;
      if (targetLevel > 3) {
        alert("L'eroe è al livello massimo e non può essere resuscitato.");
        return prev;
      }
      const cost = 5 + targetLevel;
      if (gold < cost) {
        alert("Non hai abbastanza oro per resuscitare l'eroe!");
        return prev;
      }

      setTreasures(tp => tp.map(t => t.name === 'Oro' ? { ...t, amount: t.amount - cost } : t));
      return prev.map((h, i) => {
        if (i !== heroIdx) return h;
        return { 
          ...h, 
          level: targetLevel, 
          hp: h.maxHp + targetLevel, 
          power: h.maxPower + targetLevel 
        };
      });
    });
  };

  return (
    <div className="hero-dashboard">
      <div className="section-divider"><span>⚔ Eroi</span></div>
      {heroes.map((hero, hi) => {
        const lvl = hero.level || 0;
        const currentMaxHp = hero.maxHp + lvl;
        const currentMaxPwr = hero.maxPower + lvl;
        const isDead = hero.hp === 0;

        return (
          <div key={hero.name} className={`hero-card ${isDead ? 'dead' : ''}`}>
            <div className="hero-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{hero.icon} {hero.name}</span>
              <span className="hero-level" style={{ display: 'flex', gap: 4 }}>
                <span style={{ color: lvl>=1 ? 'var(--gold)' : '#555' }}>I</span>
                <span style={{ color: lvl>=2 ? 'var(--gold)' : '#555' }}>II</span>
                <span style={{ color: lvl>=3 ? 'var(--gold)' : '#555' }}>III</span>
              </span>
            </div>

            {/* Azioni Level Up / Revive */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              {isDead ? (
                <button 
                  onClick={() => handleRevive(hi)} 
                  disabled={lvl >= 3 || gold < 5 + lvl + 1}
                  style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#5a2a2a', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 3 }}
                >
                  ✝ Resuscita ({5 + lvl + 1}g)
                </button>
              ) : (
                <button 
                  onClick={() => handleLevelUp(hi)} 
                  disabled={lvl >= 3 || gold < 5 + lvl + 1}
                  style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: 3 }}
                >
                  ⬆ Level Up ({lvl < 3 ? `${5 + lvl + 1}g` : 'Max'})
                </button>
              )}
            </div>

            {/* HP pips */}
            <div className="hero-stat">
              <span className="hero-stat-label">❤️ Salute</span>
              <div className="hp-pips">
                {Array.from({ length: currentMaxHp }, (_, pi) => (
                  <div
                    key={pi}
                    className={`hp-pip ${pi < hero.hp ? 'filled' : ''}`}
                    onClick={() => toggleHp(hi, pi)}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginLeft: 4 }}>
                {hero.hp}/{currentMaxHp}
              </span>
            </div>

            {/* Power pips */}
            <div className="hero-stat">
              <span className="hero-stat-label">⚡ Potere</span>
              <div className="power-pips">
                {Array.from({ length: currentMaxPwr }, (_, pi) => (
                  <div
                    key={pi}
                    className={`power-pip ${pi < hero.power ? 'filled' : ''}`}
                    onClick={() => togglePower(hi, pi)}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)', marginLeft: 4 }}>
                {hero.power}/{currentMaxPwr}
              </span>
            </div>
            
            {/* Poteri Testo */}
            <div style={{ fontSize: '0.65rem', color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.2 }}>
              {HERO_DEFS[hi].powers.map((p, pidx) => (
                <div key={pidx}><strong>{p.name}:</strong> {p.desc}</div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default HeroDashboard;
