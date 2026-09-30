import { FLEET, SIZE, type BoardState, type CellView, type Marmot, type Orientation, type Shot, type ShotResult } from './types';

export const inBounds = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export function marmotCells(m: Pick<Marmot, 'row' | 'col' | 'length' | 'orientation'>): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < m.length; i++) {
    cells.push(m.orientation === 'h' ? [m.row, m.col + i] : [m.row + i, m.col]);
  }
  return cells;
}

/** Клетки вокруг сурка (включая диагонали) - там по правилам не может быть других сурков. */
export function haloCells(m: Pick<Marmot, 'row' | 'col' | 'length' | 'orientation'>): [number, number][] {
  const own = new Set(marmotCells(m).map(([r, c]) => r * SIZE + c));
  const res: [number, number][] = [];
  const seen = new Set<number>();
  for (const [r, c] of marmotCells(m)) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc, k = rr * SIZE + cc;
        if (inBounds(rr, cc) && !own.has(k) && !seen.has(k)) {
          seen.add(k);
          res.push([rr, cc]);
        }
      }
  }
  return res;
}

/**
 * Можно ли поставить сурка: внутри поля, не пересекается и не касается других
 * (даже по диагонали - классическое правило).
 */
export function canPlace(
  marmots: Marmot[],
  cand: Pick<Marmot, 'row' | 'col' | 'length' | 'orientation'>,
  ignoreId?: number,
): boolean {
  const cells = marmotCells(cand);
  if (!cells.every(([r, c]) => inBounds(r, c))) return false;
  const occupied = new Set<number>();
  for (const m of marmots) {
    if (m.id === ignoreId) continue;
    for (const [r, c] of marmotCells(m)) occupied.add(r * SIZE + c);
    for (const [r, c] of haloCells(m)) occupied.add(r * SIZE + c);
  }
  return cells.every(([r, c]) => !occupied.has(r * SIZE + c));
}

/** Случайная корректная расстановка всего «флота». */
export function randomFleet(rng: () => number = Math.random): Marmot[] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const marmots: Marmot[] = [];
    let ok = true;
    FLEET.forEach((length, id) => {
      if (!ok) return;
      for (let tries = 0; tries < 500; tries++) {
        const orientation: Orientation = rng() < 0.5 ? 'h' : 'v';
        const row = Math.floor(rng() * SIZE);
        const col = Math.floor(rng() * SIZE);
        const cand = { id, length, row, col, orientation };
        if (canPlace(marmots, cand)) {
          marmots.push(cand);
          return;
        }
      }
      ok = false;
    });
    if (ok) return marmots;
  }
  throw new Error('Не удалось расставить сурков');
}

export function isFleetComplete(marmots: Marmot[]): boolean {
  return marmots.length === FLEET.length;
}

export function marmotAt(board: BoardState, r: number, c: number): Marmot | undefined {
  return board.marmots.find((m) => marmotCells(m).some(([rr, cc]) => rr === r && cc === c));
}

export function shotAt(board: BoardState, r: number, c: number): Shot | undefined {
  return board.shots.find((s) => s.row === r && s.col === c);
}

export function isSunk(board: BoardState, m: Marmot): boolean {
  return marmotCells(m).every(([r, c]) => board.shots.some((s) => s.row === r && s.col === c));
}

export function allSunk(board: BoardState): boolean {
  return board.marmots.length > 0 && board.marmots.every((m) => isSunk(board, m));
}

/**
 * Выстрел по полю. Возвращает новое состояние поля и результат.
 * Повторный выстрел в ту же клетку запрещён - возвращает null.
 */
export function fire(board: BoardState, r: number, c: number): { board: BoardState; result: ShotResult; marmot?: Marmot } | null {
  if (!inBounds(r, c) || shotAt(board, r, c)) return null;
  // Нельзя стрелять в клетку, которая точно пустая (вокруг найденного сурка) - она уже помечена
  if (blockedCells(board).has(r * SIZE + c)) return null;
  const m = marmotAt(board, r, c);
  if (!m) {
    return { board: { ...board, shots: [...board.shots, { row: r, col: c, result: 'miss' }] }, result: 'miss' };
  }
  const next: BoardState = { ...board, shots: [...board.shots, { row: r, col: c, result: 'hit', marmotId: m.id }] };
  if (isSunk(next, m)) {
    // помечаем все клетки сурка как «sunk»
    next.shots = next.shots.map((s) => (s.marmotId === m.id ? { ...s, result: 'sunk' } : s));
    return { board: next, result: 'sunk', marmot: m };
  }
  return { board: next, result: 'hit', marmot: m };
}

/** Клетки вокруг полностью найденных сурков - там гарантированно пусто. */
export function blockedCells(board: BoardState): Set<number> {
  const set = new Set<number>();
  for (const m of board.marmots) {
    if (!board.shots.some((s) => s.marmotId === m.id && s.result === 'sunk')) continue;
    for (const [r, c] of haloCells(m)) set.add(r * SIZE + c);
  }
  for (const s of board.shots) set.delete(s.row * SIZE + s.col);
  return set;
}

/** Публичный вид поля для того, кто по нему ищет: без скрытых позиций. */
export function publicView(board: BoardState): CellView[][] {
  const grid: CellView[][] = Array.from({ length: SIZE }, () => Array<CellView>(SIZE).fill('unknown'));
  for (const s of board.shots) grid[s.row][s.col] = s.result;
  for (const k of blockedCells(board)) grid[Math.floor(k / SIZE)][k % SIZE] = 'blocked';
  return grid;
}

/** Длины ещё не найденных сурков (это публичная информация: найденный сурок «вылезает»). */
export function remainingLengths(board: BoardState): number[] {
  return board.marmots.filter((m) => !isSunk(board, m)).map((m) => m.length);
}
