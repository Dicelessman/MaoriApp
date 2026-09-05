import React, { useState, useMemo } from 'react';
import { HERO_DEFS } from '../data/gameData';

function CombatModal({ target, targetIdx, onResolve, onClose, heroes, setHeroes, treasures, setTreasures }) {
  const [combatDie, setCombatDie] = useState(null);
  const [rolling, setRolling] = useState(false);
  
  // Per i poteri usati in questo combattimento:
  const [activePowers, setActivePowers] = useState([]); // Array di { heroIdx, pidx, bonus }
  
  // Se la sconfitta è attiva, gestiamo i danni da subire:
  const [damageToDistribute, setDamageToDistribute] = useState(0);
  const [damageAssigned, setDamageAssigned] = useState([0,0,0,0]);

  // Inventario per armatura/armi
  const magicSwords = treasures.find(t => t.name === 'Spada Magica')?.found ? 1 : 0;
  const magicShields = treasures.find(t => t.name === 'Scudo Magico')?.found ? 1 : 0;
  const gold = treasures.find(t => t.name === 'Oro')?.amount || 0;

  const targetHealth = target.maxHealth + (target.upgrades?.health || 0);
  const targetAttack = target.maxAttack + (target.upgrades?.attack || 0);

  const rollDie = () => {
    setRolling(true);
    setTimeout(() => {
      setCombatDie(Math.floor(Math.random() * 6) + 1);
      setRolling(false);
    }, 600);
  };

  const handleReroll = () => {
    if (gold < 1) return;
    setTreasures(prev => prev.map(t => t.name === 'Oro' ? { ...t, amount: t.amount - 1 } : t));
    rollDie();
  };

  const togglePower = (hIdx, pIdx, pDef) => {
    // Solo i poteri con bonus al combattimento (ignoriamo cura/scudo/free out of combat per ora in questo MVP)
    if (!pDef.bonus && !pDef.absorbAll && !pDef.absorb) return; 
    
    // Controlla se l'eroe ha potere sufficiente
    if (heroes[hIdx].power < 1 && !pDef.free) return;

    setActivePowers(prev => {
      const existing = prev.findIndex(p => p.heroIdx === hIdx && p.pidx === pIdx);
      if (existing >= 0) {
        // Rimuovi
        if (!pDef.free) {
          setHeroes(h => h.map((hero, i) => i === hIdx ? { ...hero, power: hero.power + 1 } : hero));
        }
        return prev.filter((_, i) => i !== existing);
      } else {
        // Aggiungi
        if (!pDef.free) {
          setHeroes(h => h.map((hero, i) => i === hIdx ? { ...hero, power: hero.power - 1 } : hero));
        }
        return [...prev, { heroIdx: hIdx, pidx: pIdx, bonus: pDef.bonus || 0, absorb: pDef.absorb || 0, absorbAll: pDef.absorbAll }];
      }
    });
  };

  const isPowerActive = (hIdx, pIdx) => activePowers.some(p => p.heroIdx === hIdx && p.pidx === pIdx);

  const totalAttack = useMemo(() => {
    if (!combatDie) return 0;
    const powerBonus = activePowers.reduce((sum, p) => sum + (p.bonus || 0), 0);
    // Phantom logic: "Può essere colpito SOLO con armi magiche"
    if (target.id === 'phantom' && magicSwords === 0) return 0; // Fallimento automatico
    return combatDie + magicSwords + powerBonus;
  }, [combatDie, activePowers, magicSwords, target.id]);

  const handleResolve = () => {
    if (totalAttack >= targetHealth) {
      // VITTORIA
      onResolve(targetIdx, true); // true = sconfitto
      onClose();
    } else {
      // SCONFITTA - Calcola danni mitigati
      let dmg = targetAttack;
      
      // Assorbi da scudi
      dmg -= magicShields; // Max 1 shield in the MVP since only 1 shield exists
      
      // Assorbi da poteri
      for (const p of activePowers) {
        if (p.absorbAll) dmg = 0;
        if (p.absorb) dmg -= p.absorb;
      }
      
      if (dmg <= 0) {
        onClose(); // Nessun danno da distribuire
      } else {
        setDamageToDistribute(dmg);
      }
    }
  };

  const handleAssignDmg = (hIdx, delta) => {
    const currentAssigned = damageAssigned[hIdx];
    const newAssigned = currentAssigned + delta;
    if (newAssigned < 0 || newAssigned > heroes[hIdx].hp) return;
    
    // Controlla il limite totale
    const totalDmgAssigned = damageAssigned.reduce((a,b)=>a+b, 0);
    if (delta > 0 && totalDmgAssigned >= damageToDistribute) return; // Non assegnare più del dovuto

    setDamageAssigned(prev => {
      const next = [...prev];
      next[hIdx] = newAssigned;
      return next;
    });
  };

  const confirmDamage = () => {
    setHeroes(prev => prev.map((h, i) => ({ ...h, hp: h.hp - damageAssigned[i] })));
    // Golem rule: Assorbe 1 danno da ogni attacco fallito
    if (target.id === 'golem') {
       // Aggiungiamo 1 alle hits in onResolve
       onResolve(targetIdx, false, 1); 
    } else {
       onResolve(targetIdx, false);
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1210', border: '2px solid var(--crimson)', padding: 24, borderRadius: 8, width: 400, maxWidth: '100%', color: '#e8dcba' }}>
        
        <h2 style={{ color: 'var(--crimson)', marginTop: 0, textAlign: 'center' }}>Combattimento contro {target.name}</h2>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          Salute: <strong>{targetHealth}</strong> | Attacco: <strong>{targetAttack}</strong>
        </div>

        {damageToDistribute > 0 ? (
          <div>
            <h3 style={{ color: '#d00', textAlign: 'center' }}>Attacco Fallito! Subisci {damageToDistribute} danni</h3>
            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: '#aaa' }}>Distribuisci il danno residuo tra gli eroi (Scudi e Poteri di mitigazione già applicati).</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '20px 0' }}>
              {heroes.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, background: 'rgba(0,0,0,0.3)' }}>
                  <span style={{ opacity: h.hp === 0 ? 0.3 : 1 }}>{h.icon} {h.name} (HP: {h.hp})</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => handleAssignDmg(i, -1)} disabled={damageAssigned[i] === 0}>-</button>
                    <span style={{ width: 20, textAlign: 'center' }}>{damageAssigned[i]}</span>
                    <button onClick={() => handleAssignDmg(i, 1)} disabled={h.hp === 0 || damageAssigned.reduce((a,b)=>a+b,0) >= damageToDistribute || damageAssigned[i] >= h.hp}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn-roll" 
              style={{ width: '100%', background: 'var(--crimson)' }}
              disabled={damageAssigned.reduce((a,b)=>a+b,0) !== damageToDistribute && damageAssigned.reduce((a,b)=>a+b,0) !== heroes.reduce((sum,h)=>sum+h.hp,0)}
              onClick={confirmDamage}
            >
              Conferma Danni
            </button>
          </div>
        ) : (
          <div>
            {/* Lancia Dado */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {!combatDie && !rolling ? (
                <button className="btn-roll" onClick={rollDie}>🎲 Tira Dado Combattimento</button>
              ) : (
                <div style={{ fontSize: '3rem', margin: '10px 0' }} className={rolling ? 'rolling' : ''}>
                  {combatDie ? ['','⚀','⚁','⚂','⚃','⚄','⚅'][combatDie] : '🎲'}
                </div>
              )}
              {combatDie && gold > 0 && (
                <button style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }} onClick={handleReroll}>
                  Ritira (1 Oro)
                </button>
              )}
            </div>

            {/* Riepilogo Bonus */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 4, fontSize: '0.9rem' }}>
              <div>Dado: {combatDie || '?'}</div>
              <div>Armi Magiche: +{magicSwords}</div>
              <div>Poteri Eroe: +{activePowers.reduce((s, p) => s + (p.bonus || 0), 0)}</div>
              <div style={{ borderTop: '1px solid #444', marginTop: 4, paddingTop: 4, fontWeight: 'bold' }}>
                TOTALE: {totalAttack} / {targetHealth}
              </div>
            </div>

            {/* Poteri */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: 8 }}>Poteri di Combattimento (clicca per usare):</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {heroes.map((h, hIdx) => {
                  if (h.hp === 0) return null;
                  return HERO_DEFS[hIdx].powers.map((p, pIdx) => {
                    if (!p.bonus && !p.absorbAll && !p.absorb) return null; // Solo poteri di combat
                    const active = isPowerActive(hIdx, pIdx);
                    const canAfford = h.power > 0 || p.free;
                    return (
                      <button 
                        key={`${hIdx}-${pIdx}`}
                        disabled={!active && !canAfford}
                        onClick={() => togglePower(hIdx, pIdx, p)}
                        style={{
                          fontSize: '0.7rem', padding: '4px 6px', textAlign: 'left',
                          background: active ? '#3a6e8a' : (canAfford ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'),
                          color: active ? '#fff' : (canAfford ? '#ddd' : '#555'),
                          border: active ? '1px solid #6ae' : '1px solid #333'
                        }}
                      >
                        {h.icon} {p.name}
                      </button>
                    )
                  });
                })}
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={onClose} style={{ padding: '6px 12px', background: 'transparent', color: '#aaa', border: '1px solid #555', borderRadius: 4 }}>Fuggi (Annulla)</button>
              <button 
                disabled={!combatDie} 
                onClick={handleResolve}
                style={{ padding: '6px 16px', background: totalAttack >= targetHealth ? '#2a5a2a' : 'var(--crimson)', color: '#fff', border: 'none', borderRadius: 4 }}
              >
                {totalAttack >= targetHealth ? 'Sconfiggi!' : 'Subisci Danni'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CombatModal;
