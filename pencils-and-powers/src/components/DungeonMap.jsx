import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { buildDungeon, CT, ROOM_DEFS, MAP_ROWS, MAP_COLS, EXPLORE_SHAPES } from '../data/gameData';

const BASE_GRID = buildDungeon();

const key = (r,c) => `${r},${c}`;

const getRotatedShape = (shapePts, rot) => {
  let pts = shapePts.map(([r,c]) => {
    if(rot===0) return [r,c];
    if(rot===1) return [c,-r];
    if(rot===2) return [-r,-c];
    if(rot===3) return [-c,r];
    return [r,c];
  });
  let minR = Math.min(...pts.map(p=>p[0]));
  let minC = Math.min(...pts.map(p=>p[1]));
  return pts.map(([r,c]) => [r - minR, c - minC]);
};

function DungeonMap({ exploreValue, shadedCells, onShadeUpdate, accessibleRooms }) {
  const [exploring, setExploring] = useState(false);
  const [shapeDie, setShapeDie] = useState(null);
  const [anchor, setAnchor] = useState(null); // [r,c]
  const [rotation, setRotation] = useState(0); // 0,1,2,3

  // Reset exploration if exploreValue changes
  useEffect(() => {
    setExploring(false);
    setShapeDie(null);
    setAnchor(null);
    setRotation(0);
  }, [exploreValue]);

  const activeShapeId = exploreValue === 1 ? shapeDie : exploreValue;
  const activeShapePts = activeShapeId && EXPLORE_SHAPES[activeShapeId] ? getRotatedShape(EXPLORE_SHAPES[activeShapeId], rotation) : [];

  const handleRollShapeDie = () => {
    setShapeDie(Math.floor(Math.random() * 5) + 2); // 2 to 6
    setAnchor(null);
  };

  const projectedCells = useMemo(() => {
    if (!anchor || activeShapePts.length === 0) return [];
    return activeShapePts.map(([dr, dc]) => [anchor[0] + dr, anchor[1] + dc]);
  }, [anchor, activeShapePts]);

  const isValidPlacement = useMemo(() => {
    if (projectedCells.length === 0) return false;
    let touchCount = 0;

    for (const [r, c] of projectedCells) {
      if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) return false;
      const cellType = BASE_GRID[r][c].type;
      if (cellType !== CT.CORRIDOR && cellType !== CT.MYSTERY && cellType !== CT.DOOR) return false;
      if (shadedCells.has(key(r, c))) return false;

      // Inner collision check (if shape self-intersects, though Tetris shapes don't)
      // Check neighbors for touches
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) continue;
        // Ignore touches between cells of the shape itself
        if (projectedCells.some(([pr, pc]) => pr === nr && pc === nc)) continue;

        if (shadedCells.has(key(nr, nc)) || BASE_GRID[nr][nc].type === CT.START) {
          touchCount++;
        }
      }
    }
    return touchCount === 1;
  }, [projectedCells, shadedCells]);

  const handleCellClick = (r, c) => {
    if (!exploring || !activeShapeId) return;
    const cellType = BASE_GRID[r][c].type;
    if (cellType === CT.CORRIDOR || cellType === CT.MYSTERY || cellType === CT.DOOR) {
      setAnchor([r, c]);
    }
  };

  const confirmExplore = () => {
    if (!isValidPlacement) return;
    const newShaded = new Set(shadedCells);
    let mysteryHit = false;
    for (const [r, c] of projectedCells) {
      newShaded.add(key(r, c));
      if (BASE_GRID[r][c].type === CT.MYSTERY) mysteryHit = true;
    }
    onShadeUpdate(newShaded);
    setExploring(false);
    setAnchor(null);
    if (mysteryHit) {
      setTimeout(() => alert('⚠️ Incontro Misterioso!\nTira il tuo dado personale e consulta la tabella degli incontri sul foglio di avventura.'), 50);
    }
  };

  const cancelExplore = () => {
    setExploring(false);
    setAnchor(null);
  };

  const isCellProjected = (r, c) => projectedCells.some(([pr, pc]) => pr === r && pc === c);

  return (
    <div className="dungeon-wrapper">
      {/* Controls bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8, alignItems: 'center' }}>
        <div className="explore-badge">🗺️ Dado: <strong>{exploreValue ?? '—'}</strong></div>
        
        {!exploring && exploreValue !== null && (
          <button className="btn-roll" style={{ padding: '5px 14px', fontSize: '0.78rem' }}
            onClick={() => setExploring(true)}>
            Inizia Esplorazione
          </button>
        )}

        {exploring && exploreValue === 1 && !shapeDie && (
          <button className="btn-roll" style={{ padding: '5px 12px', fontSize: '0.78rem', background: '#3a6e8a' }}
            onClick={handleRollShapeDie}>
            🎲 Tira Dado Forma
          </button>
        )}

        {exploring && activeShapeId && (
          <>
            <span className="explore-badge" style={{ borderColor: 'var(--gold)' }}>
              Forma: <strong>{activeShapeId}</strong>
            </span>
            <button className="btn-roll" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(100,100,30,0.7)' }}
              onClick={() => setRotation(r => (r + 1) % 4)}>
              🔄 Ruota
            </button>
            <button className="btn-roll" style={{ padding: '5px 12px', fontSize: '0.78rem', background: isValidPlacement ? 'rgba(30,100,30,0.7)' : 'rgba(50,50,50,0.7)' }}
              onClick={confirmExplore} disabled={!isValidPlacement}>
              ✓ Conferma
            </button>
            <button className="btn-roll" style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'rgba(100,20,20,0.7)' }}
              onClick={cancelExplore}>✕ Annulla</button>
          </>
        )}
      </div>

      {exploring && activeShapeId && (
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-light)', textAlign: 'center', marginTop: 0, marginBottom: 8, fontStyle: 'italic' }}>
          {anchor ? (
            isValidPlacement 
              ? 'Posizione valida! Clicca Conferma.' 
              : 'Posizione non valida. La forma deve toccare ESATTAMENTE un bordo esplorato.'
          ) : 'Clicca sulla griglia per posizionare la forma.'}
        </p>
      )}

      {/* Room legend */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
        {ROOM_DEFS.map(rm => {
          const acc = accessibleRooms.has(rm.id);
          return (
            <span key={rm.id} style={{
              fontSize: '0.65rem', padding: '2px 6px', borderRadius: 3,
              fontFamily: 'var(--font-title)', letterSpacing: '0.06em',
              background: rm.locked ? 'rgba(0,0,0,0.3)' : (acc ? 'rgba(184,136,42,0.2)' : 'rgba(0,0,0,0.15)'),
              border: acc ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
              color: acc ? 'var(--gold)' : 'rgba(240,230,200,0.5)',
            }}>
              {rm.locked ? '🔒' : (acc ? '✅' : '🚪')} {rm.name}
            </span>
          );
        })}
      </div>

      {/* Shape Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 6 }}>
        <span style={{ fontSize: '0.75rem', color: '#aaa', alignSelf: 'center', marginRight: 8 }}>Forme:</span>
        {[2,3,4,5,6].map(n => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--gold)', marginBottom: 2 }}>{n}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 8px)', gap: 1 }}>
              {Array.from({length: 6}).map((_, i) => {
                const r = Math.floor(i / 3);
                const c = i % 3;
                const isShape = EXPLORE_SHAPES[n].some(([sr, sc]) => sr === r && sc === c);
                return <div key={i} style={{ width: 8, height: 8, background: isShape ? '#e8dcba' : 'transparent', border: isShape ? '1px solid #111' : 'none', opacity: isShape ? 1 : 0 }} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* THE GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)`,
        gap: '1px',
        background: '#111',
        border: '4px solid #000',
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
      }}>
        {BASE_GRID.map((row, r) =>
          row.map((cell, c) => {
            const k = key(r, c);
            const isShaded = shadedCells.has(k);
            const isProj = isCellProjected(r, c);
            const rmDef = ROOM_DEFS.find(rm => rm.id === cell.roomId);
            const roomAcc = cell.roomId && accessibleRooms.has(cell.roomId);

            let bg = '#eee'; // Default paper look for walls
            switch (cell.type) {
              case CT.ROOM: bg = roomAcc ? '#dcd2c6' : '#d2c8bc'; break;
              case CT.CORRIDOR:
              case CT.MYSTERY: 
              case CT.DOOR: bg = isShaded ? '#111' : '#f0eed8'; break;
              case CT.START: bg = '#4a7a4a'; break; // Make start very obvious green
              case CT.OBSTACLE: bg = '#111'; break;
              case CT.TOMB: bg = '#ddd'; break;
              case CT.WALL: bg = '#333'; break;
              default: bg = '#fff';
            }

            if (isProj) {
              bg = isValidPlacement ? 'rgba(50,200,50,0.6)' : 'rgba(200,50,50,0.6)';
            } else if (exploring && activeShapeId && !isShaded && (cell.type === CT.CORRIDOR || cell.type === CT.MYSTERY || cell.type === CT.DOOR)) {
              // Highlight valid anchor areas lightly
            }

            const canClick = (cell.type === CT.CORRIDOR || cell.type === CT.MYSTERY || cell.type === CT.DOOR) && exploring && activeShapeId;

            return (
              <div key={k}
                onClick={() => handleCellClick(r, c)}
                style={{
                  aspectRatio: '1',
                  background: bg,
                  cursor: canClick ? 'crosshair' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.1s',
                  boxSizing: 'border-box',
                }}
              >
                {/* Pencil cross-hatch for shaded corridor */}
                {isShaded && (cell.type === CT.CORRIDOR || cell.type === CT.MYSTERY || cell.type === CT.DOOR) && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'repeating-linear-gradient(47deg,transparent,transparent 2px,rgba(255,255,255,0.4) 2px,rgba(255,255,255,0.4) 3px),repeating-linear-gradient(-47deg,transparent,transparent 2px,rgba(0,0,0,0.8) 2px,rgba(0,0,0,0.8) 3px)',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Projected piece border */}
                {isProj && (
                  <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.8)', pointerEvents: 'none' }} />
                )}

                {/* Room accessible glow / indicator */}
                {cell.type === CT.ROOM && roomAcc && (
                  <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(0,0,0,0.2)', pointerEvents: 'none' }} />
                )}

                {/* Obstacle (pillar) */}
                {cell.type === CT.OBSTACLE && (
                  <div style={{ position: 'absolute', inset: '20%', background: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                )}

                {/* Tomb */}
                {cell.type === CT.TOMB && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#111', fontWeight: 900, pointerEvents: 'none' }}>✝</div>
                )}

                {/* Start marker */}
                {cell.type === CT.START && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontFamily: 'var(--font-title)', fontWeight: 900, color: '#fff', pointerEvents: 'none', letterSpacing: '0.03em' }}>S</div>
                )}

                {/* Door Marker */}
                {cell.type === CT.DOOR && !isShaded && (
                  <div style={{ position: 'absolute', inset: '10%', border: '2px solid rgba(184,136,42,0.8)', background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }} />
                )}

                {/* Mystery ? */}
                {cell.type === CT.MYSTERY && !isShaded && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#8b1a1a', fontWeight: 900, pointerEvents: 'none' }}>?</div>
                )}

                {/* Boss lock */}
                {cell.type === CT.ROOM && cell.locked && !roomAcc && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#111', pointerEvents: 'none' }}>🔒</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DungeonMap;
