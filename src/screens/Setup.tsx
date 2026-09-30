import { useEffect, useMemo, useState } from 'react';
import { canPlace, marmotAt, marmotCells, randomFleet } from '../game/board';
import { FLEET, type Marmot as M, type Orientation } from '../game/types';
import { Board } from '../ui/Board';
import { Marmot } from '../ui/Marmot';
import { MARMOT_NAMES } from '../ui/sprites';
import { sfx } from '../lib/sound';
import { loadLayout } from '../lib/storage';
import { OPPONENTS } from '../config';
import type { Difficulty } from '../game/types';

/** Какие id из FLEET ещё не расставлены. */
const unplacedIds = (placed: M[]) => FLEET.map((_, id) => id).filter((id) => !placed.some((m) => m.id === id));

export function Setup({ difficulty, onStart, onBack }: { difficulty: Difficulty; onStart: (m: M[]) => void; onBack: () => void }) {
  const [placed, setPlaced] = useState<M[]>([]);
  const [orientation, setOrientation] = useState<Orientation>('h');
  const [selected, setSelected] = useState<number | null>(0);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [shake, setShake] = useState(false);
  const lastLayout = useMemo(() => loadLayout(), []);

  const remaining = unplacedIds(placed);
  const selId = selected !== null && remaining.includes(selected) ? selected : remaining[0] ?? null;
  const selLen = selId !== null ? FLEET[selId] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К' || e.key === ' ') {
        if (e.key === ' ' && (e.target as HTMLElement)?.tagName === 'BUTTON' && (e.target as HTMLElement).dataset.cell === undefined) return;
        e.preventDefault();
        setOrientation((o) => (o === 'h' ? 'v' : 'h'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const preview = useMemo(() => {
    if (!hover || selId === null || selLen === null) return null;
    const cand = { id: selId, length: selLen, row: hover[0], col: hover[1], orientation };
    const cells = marmotCells(cand).filter(([r, c]) => r < 10 && c < 10);
    return { cells, valid: canPlace(placed, cand) };
  }, [hover, selId, selLen, orientation, placed]);

  const place = (r: number, c: number) => {
    const existing = marmotAt({ marmots: placed, shots: [] }, r, c);
    if (existing) {
      // подобрать сурка обратно
      setPlaced(placed.filter((m) => m.id !== existing.id));
      setSelected(existing.id);
      setOrientation(existing.orientation);
      sfx.click();
      return;
    }
    if (selId === null || selLen === null) return;
    const cand = { id: selId, length: selLen, row: r, col: c, orientation };
    if (!canPlace(placed, cand)) {
      sfx.bad();
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }
    const next = [...placed, cand];
    setPlaced(next);
    sfx.place();
    const rest = unplacedIds(next);
    setSelected(rest[0] ?? null);
  };

  const rotateAt = (r: number, c: number) => {
    const existing = marmotAt({ marmots: placed, shots: [] }, r, c);
    if (!existing) { setOrientation((o) => (o === 'h' ? 'v' : 'h')); return; }
    const rotated = { ...existing, orientation: (existing.orientation === 'h' ? 'v' : 'h') as Orientation };
    if (canPlace(placed, rotated, existing.id)) {
      setPlaced(placed.map((m) => (m.id === existing.id ? rotated : m)));
      sfx.click();
    } else sfx.bad();
  };

  const grouped = [4, 3, 2, 1].map((len) => ({ len, ids: remaining.filter((id) => FLEET[id] === len) }));
  const done = remaining.length === 0;

  return (
    <div className="screen setup">
      <div className="screen-head">
        <button className="btn ghost small" onClick={onBack}>← Меню</button>
        <h2>Спрячь своих сурков</h2>
        <span className="vs">против: <b>{OPPONENTS[difficulty].name}</b></span>
      </div>
      <p className="hint">
        Выбери сурка и нажми на клетку. Сурки не могут стоять вплотную друг к другу — даже углами.
        Нажми на уже поставленного, чтобы поднять его. <span className="desk-only">Правый клик или клавиша R — повернуть.</span>
      </p>

      <div className="setup-grid">
        <div className={shake ? 'shake' : ''}>
          <div className="setup-toolbar">
            <span className="now">
              {done ? 'Готово!' : <>Ставим: <b>{selLen ? MARMOT_NAMES[selLen] : ''}</b></>}
            </span>
            <button className="btn small" onClick={() => { setOrientation((o) => (o === 'h' ? 'v' : 'h')); sfx.click(); }} disabled={done}>
              Повернуть: {orientation === 'h' ? 'лёжа' : 'столбиком'}
            </button>
            <button className="btn small" onClick={() => { setPlaced(randomFleet()); setSelected(null); sfx.place(); }}>Случайно</button>
          </div>
          <Board
            board={{ marmots: placed, shots: [] }}
            kind="own"
            label="Твоё поле"
            onCell={place}
            onCellContext={rotateAt}
            onHover={(r, c) => setHover([r, c])}
            onLeave={() => setHover(null)}
            preview={preview}
            seed={1}
          />
        </div>

        <div className="panel dock">
          <div className="dock-head">
            <span>{done ? 'Все сурки спрятаны!' : `Осталось спрятать: ${remaining.length}`}</span>
          </div>
          <div className="dock-list">
            {grouped.map(({ len, ids }) => (
              <button
                key={len}
                className={`dock-item ${selLen === len && !done ? 'active' : ''}`}
                disabled={ids.length === 0}
                onClick={() => { setSelected(ids[0]); sfx.click(); }}
              >
                <div className="dock-sprite" style={{ width: `${len * 22}px`, height: '22px' }}>
                  <Marmot length={len} orientation="h" />
                </div>
                <span className="dock-name">{MARMOT_NAMES[len]}</span>
                <span className="dock-count">×{ids.length}</span>
              </button>
            ))}
          </div>
          <div className="dock-actions">
            {lastLayout && lastLayout.length === FLEET.length && (
              <button className="btn" onClick={() => { setPlaced(lastLayout); sfx.place(); }}>Как в прошлый раз</button>
            )}
            <button className="btn ghost" onClick={() => { setPlaced([]); setSelected(0); }} disabled={!placed.length}>Очистить</button>
          </div>
          <button className="btn primary big" disabled={!done} onClick={() => { sfx.found(); onStart(placed); }}>
            Начать прятки!
          </button>
        </div>
      </div>
    </div>
  );
}
