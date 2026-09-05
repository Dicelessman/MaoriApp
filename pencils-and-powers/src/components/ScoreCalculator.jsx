import React from 'react';

function ScoreCalculator({ turn, monsters, treasures }) {
  const monsterPoints = monsters.reduce((sum, m) => sum + (m.defeated ? (m.points || 10) : 0), 0);
  const treasurePoints = treasures.reduce((sum, t) => {
    if (t.name === 'Oro') return sum + (t.amount || 0);
    return sum + (t.found ? (t.points || 10) : 0);
  }, 0);
  const penalty = turn > 35 ? -(turn - 35) : 0;
  const total = monsterPoints + treasurePoints + penalty;

  return (
    <div className="score-panel">
      <div className="score-title">⚜ Punteggio Finale ⚜</div>
      <div className="score-number">{total}</div>

      <div className="score-breakdown">
        <div className="score-row">
          <span>⚔️ Mostri sconfitti</span>
          <span>+{monsterPoints}</span>
        </div>
        <div className="score-row">
          <span>💰 Tesori raccolti</span>
          <span>+{treasurePoints}</span>
        </div>
        {penalty < 0 && (
          <div className="score-row penalty">
            <span>⏳ Penalità turni ({turn - 35} extra)</span>
            <span>{penalty}</span>
          </div>
        )}
        <div className="score-row" style={{ fontWeight: 700, borderTop: '1px solid var(--parchment-dark)', paddingTop: 4 }}>
          <span>TOTALE</span>
          <span style={{ color: 'var(--gold)' }}>{total}</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreCalculator;
