import { useMemo, useState } from 'react';
import { blockedCells, isSunk } from '../game/board';
import { SIZE, type BoardState, type Marmot as M } from '../game/types';
import { Marmot } from './Marmot';
import { PEEK, PixelSprite, STAR } from './sprites';
import { HOLE_TILE, tileFor } from './tiles';

export const COLS = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];

interface Props {
  board: BoardState;
  /** own - своё поле (сурки видны), enemy - поле соперника (видно только найденное) */
  kind: 'own' | 'enemy';
  seed?: number;
  onCell?: (r: number, c: number) => void;
  onCellContext?: (r: number, c: number) => void;
  disabled?: boolean;
  preview?: { cells: [number, number][]; valid: boolean } | null;
  onHover?: (r: number, c: number) => void;
  onLeave?: () => void;
  lastShot?: { row: number; col: number } | null;
  revealAll?: boolean;
  /** Сурки, которых нужно показать поверх (например, при расстановке) */
  marmotsOverride?: M[];
  selectedId?: number | null;
  compact?: boolean;
  label?: string;
}

export function Board({ board, kind, seed = 0, onCell, onCellContext, disabled, preview, onHover, onLeave, lastShot, revealAll, marmotsOverride, selectedId, compact, label }: Props) {
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const shotMap = useMemo(() => {
    const m = new Map<number, (typeof board.shots)[number]>();
    for (const s of board.shots) m.set(s.row * SIZE + s.col, s);
    return m;
  }, [board.shots]);
  const blocked = useMemo(() => blockedCells(board), [board]);
  const previewSet = useMemo(() => new Set(preview?.cells.map(([r, c]) => r * SIZE + c) ?? []), [preview]);

  const marmots = marmotsOverride ?? board.marmots;
  const visibleMarmots = kind === 'own' || revealAll ? marmots : marmots.filter((m) => isSunk(board, m));

  const onKey = (e: React.KeyboardEvent, r: number, c: number) => {
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[e.key]) {
      e.preventDefault();
      const nr = Math.max(0, Math.min(SIZE - 1, r + moves[e.key][0]));
      const nc = Math.max(0, Math.min(SIZE - 1, c + moves[e.key][1]));
      setFocus([nr, nc]);
      (document.querySelector(`[data-board="${label}"] [data-cell="${nr}-${nc}"]`) as HTMLElement | null)?.focus();
      onHover?.(nr, nc);
    }
  };

  return (
    <div className={`board-wrap ${compact ? 'compact' : ''}`}>
      <div className="axis axis-top">{COLS.map((l) => <span key={l}>{l}</span>)}</div>
      <div className="axis axis-left">{Array.from({ length: SIZE }, (_, i) => <span key={i}>{i + 1}</span>)}</div>
      <div className={`board ${kind} ${disabled ? 'disabled' : ''}`} onMouseLeave={onLeave} data-board={label} role="grid" aria-label={label}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const r = Math.floor(i / SIZE), c = i % SIZE;
          const shot = shotMap.get(i);
          const isBlocked = blocked.has(i);
          const inPreview = previewSet.has(i);
          const isLast = lastShot && lastShot.row === r && lastShot.col === c;
          const bg = shot?.result === 'miss' ? HOLE_TILE : tileFor(r, c, seed);
          const clickable = !!onCell && !disabled && (kind === 'own' || (!shot && !isBlocked));
          const name = `${COLS[c]}${r + 1}`;
          const stateText = shot ? (shot.result === 'miss' ? 'пусто' : shot.result === 'hit' ? 'найдена часть сурка' : 'сурок найден') : isBlocked ? 'точно пусто' : 'не проверено';
          return (
            <button
              key={i}
              type="button"
              data-cell={`${r}-${c}`}
              className={[
                'cell',
                clickable ? 'clickable' : '',
                isBlocked ? 'blocked' : '',
                inPreview ? (preview!.valid ? 'pv-ok' : 'pv-bad') : '',
                isLast ? 'last' : '',
                shot ? `shot-${shot.result}` : '',
              ].join(' ')}
              style={{ backgroundImage: bg }}
              tabIndex={focus ? (focus[0] === r && focus[1] === c ? 0 : -1) : i === 0 ? 0 : -1}
              aria-label={`${name}: ${stateText}`}
              onClick={() => clickable && onCell?.(r, c)}
              onContextMenu={(e) => { if (onCellContext) { e.preventDefault(); onCellContext(r, c); } }}
              onMouseEnter={() => onHover?.(r, c)}
              onFocus={() => { setFocus([r, c]); onHover?.(r, c); }}
              onKeyDown={(e) => onKey(e, r, c)}
            >
              {kind === 'enemy' && shot?.result === 'hit' && <PixelSprite rows={PEEK} className="peek pop" />}
              {kind === 'own' && shot && shot.result !== 'miss' && <span className="ouch pop">!</span>}
              {isBlocked && <span className="dot" />}
            </button>
          );
        })}
        <div className="overlay" aria-hidden>
          {visibleMarmots.map((m) => {
            const sunk = isSunk(board, m);
            const hidden = kind === 'enemy' && !sunk;
            return (
              <div
                key={m.id}
                className={`m-slot ${sunk ? 'found' : ''} ${hidden ? 'ghost' : ''} ${selectedId === m.id ? 'selected' : ''}`}
                style={{
                  left: `${m.col * 10}%`,
                  top: `${m.row * 10}%`,
                  width: `${(m.orientation === 'h' ? m.length : 1) * 10}%`,
                  height: `${(m.orientation === 'v' ? m.length : 1) * 10}%`,
                }}
              >
                <Marmot length={m.length} orientation={m.orientation} dim={kind === 'own' && sunk} />
                {sunk && kind === 'enemy' && <PixelSprite rows={STAR} className="star pop" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
