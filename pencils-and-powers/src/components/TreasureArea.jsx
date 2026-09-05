import React from 'react';
import { CHESTS, ROOM_DEFS } from '../data/gameData';

function TreasureArea({ treasures, setTreasures, chestsProgress, setChestsProgress, treasureDieStart, assignedDie, consumeDie, monsters }) {
  const getDieFace = (idx) => {
    if (!treasureDieStart || idx >= 6) return null; // Boss (idx 6) ha no die
    return ((treasureDieStart - 1 + idx) % 6) + 1;
  };

  const isRoomBossDead = (roomId) => {
    const m = monsters.find(x => x.roomId === roomId);
    return m ? m.defeated : false;
  };

  const handleFillSquare = (chestIdx) => {
    setChestsProgress(prev => {
      const next = [...prev];
      if (next[chestIdx] < CHESTS[chestIdx].squares.length) {
        next[chestIdx] += 1;
      }
      return next;
    });
    consumeDie();
  };

  const collectReward = (reward) => {
    setTreasures(prev => prev.map(t => {
      if (reward.type === 'gold' && t.name === 'Oro') return { ...t, amount: t.amount + reward.amount };
      if (reward.type === 'sword' && t.name === 'Spada Magica') return { ...t, found: true };
      if (reward.type === 'shield' && t.name === 'Scudo Magico') return { ...t, found: true };
      if (reward.type === 'potion') alert('Usa la pozione per curare un eroe!'); // simplified
      if (reward.type === 'key' && t.name === 'Chiave Magica') return { ...t, found: true };
      return t;
    }));
  };

  // Funzione temporanea per simulare lo sblocco manuale se il mostro è morto
  const claimChestRewards = (chestIdx) => {
    if (!isRoomBossDead(CHESTS[chestIdx].roomId)) {
      alert("Devi prima sconfiggere il mostro di questa stanza!");
      return;
    }
    const prog = chestsProgress[chestIdx];
    const sqs = CHESTS[chestIdx].squares.slice(0, prog);
    sqs.forEach(sq => collectReward(sq));
    alert("Ricompense collezionate!");
    // Ideally we track which ones are claimed, but let's keep it simple: player triggers it once.
  };

  return (
    <div className="treasure-area">
      <div className="section-divider"><span>💰 Tesori & Inventario</span></div>
      
      {/* Inventario Globale */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 6 }}>
        {treasures.map((t, i) => (
          <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: t.found || t.name==='Oro' ? 1 : 0.4 }}>
            <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
            {t.name === 'Oro' ? (
              <strong style={{ color: 'var(--gold)' }}>{t.amount}</strong>
            ) : null}
          </div>
        ))}
      </div>

      {assignedDie && (
        <div style={{ background: 'rgba(184,136,42,0.1)', border: '1px solid var(--gold)', padding: 6, borderRadius: 4, marginBottom: 8, fontSize: '0.8rem', textAlign: 'center', color: 'var(--gold)' }}>
          Hai assegnato un <strong>{assignedDie}</strong> ai Tesori. Riempi la casella!
        </div>
      )}

      {/* Forzieri delle Stanze */}
      {CHESTS.map((chest, ci) => {
        const dieFace = getDieFace(ci);
        const isTarget = assignedDie !== null && assignedDie === dieFace;
        const prog = chestsProgress[ci] || 0;
        const max = chest.squares.length;
        const roomName = ROOM_DEFS.find(r => r.id === chest.roomId)?.name;

        return (
          <div key={ci} className={`treasure-card ${isTarget ? 'highlight-target' : ''}`} style={{ marginBottom: 12, padding: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>
                {dieFace && <span className="die-badge">{dieFace}</span>}
                Stanza: {roomName}
              </span>
              {isTarget && prog < max && (
                <button className="btn-roll" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => handleFillSquare(ci)}>
                  + Riempi
                </button>
              )}
              {prog > 0 && isRoomBossDead(chest.roomId) && (
                <button style={{ background: '#2a5a2a', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => claimChestRewards(ci)}>
                  Sblocca
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {chest.squares.map((sq, si) => (
                <div key={si} style={{
                  width: 24, height: 24, border: '1px solid #555', borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: si < prog ? 'rgba(184,136,42,0.4)' : 'transparent',
                  fontSize: '0.8rem', opacity: si < prog ? 1 : 0.3
                }}>
                  {sq.icon}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TreasureArea;
