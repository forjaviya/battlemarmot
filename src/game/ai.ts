import { SIZE, type CellView, type Difficulty } from './types';

/**
 * Компьютерный соперник. ВАЖНО: получает только публичный вид поля (view) -
 * где уже искал и что нашёл, - и длины ещё не найденных сурков.
 * Скрытое расположение сурков игрока ему недоступно.
 */

type Cell = [number, number];
const DIRS: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const inB = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

function unknownCells(view: CellView[][]): Cell[] {
  const res: Cell[] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (view[r][c] === 'unknown') res.push([r, c]);
  return res;
}

function hitCells(view: CellView[][]): Cell[] {
  const res: Cell[] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (view[r][c] === 'hit') res.push([r, c]);
  return res;
}

const pick = <T,>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];

/** «Добивание»: клетки рядом с найденными частями сурка (по линии, если частей ≥ 2). */
function targetCandidates(view: CellView[][]): Cell[] {
  const hits = hitCells(view);
  if (hits.length === 0) return [];
  // группируем соседние попадания в одного сурка
  const key = (r: number, c: number) => r * SIZE + c;
  const hitSet = new Set(hits.map(([r, c]) => key(r, c)));
  const seen = new Set<number>();
  const groups: Cell[][] = [];
  for (const h of hits) {
    if (seen.has(key(...h))) continue;
    const stack = [h];
    const g: Cell[] = [];
    seen.add(key(...h));
    while (stack.length) {
      const [r, c] = stack.pop()!;
      g.push([r, c]);
      for (const [dr, dc] of DIRS) {
        const k = key(r + dr, c + dc);
        if (hitSet.has(k) && !seen.has(k)) { seen.add(k); stack.push([r + dr, c + dc]); }
      }
    }
    groups.push(g);
  }
  const cands: Cell[] = [];
  for (const g of groups) {
    if (g.length >= 2) {
      const horizontal = g[0][0] === g[1][0];
      const sorted = [...g].sort((a, b) => (horizontal ? a[1] - b[1] : a[0] - b[0]));
      const first = sorted[0], last = sorted[sorted.length - 1];
      const ends: Cell[] = horizontal
        ? [[first[0], first[1] - 1], [last[0], last[1] + 1]]
        : [[first[0] - 1, first[1]], [last[0] + 1, last[1]]];
      for (const [r, c] of ends) if (inB(r, c) && view[r][c] === 'unknown') cands.push([r, c]);
    } else {
      const [r, c] = g[0];
      for (const [dr, dc] of DIRS) if (inB(r + dr, c + dc) && view[r + dr][c + dc] === 'unknown') cands.push([r + dr, c + dc]);
    }
  }
  return cands;
}

/**
 * Карта вероятностей: перебираем все возможные положения оставшихся сурков,
 * совместимые с тем, что уже известно, и считаем, сколько раз каждая клетка
 * оказывается занятой. Положения, покрывающие найденные части, весят сильно больше.
 */
export function probabilityMap(view: CellView[][], remaining: number[]): number[][] {
  const heat = Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
  const hits = hitCells(view);
  const hitKey = new Set(hits.map(([r, c]) => r * SIZE + c));
  const lengths = [...new Set(remaining)];
  for (const L of lengths) {
    const count = remaining.filter((x) => x === L).length;
    for (const o of ['h', 'v'] as const) {
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++) {
          const cells: Cell[] = [];
          let ok = true;
          for (let i = 0; i < L; i++) {
            const rr = o === 'h' ? r : r + i, cc = o === 'h' ? c + i : c;
            if (!inB(rr, cc)) { ok = false; break; }
            const v = view[rr][cc];
            if (v !== 'unknown' && v !== 'hit') { ok = false; break; }
            cells.push([rr, cc]);
          }
          if (!ok) continue;
          const inside = new Set(cells.map(([a, b]) => a * SIZE + b));
          // Правило «сурки не касаются»: рядом с положением не может быть чужих найденных частей
          let covered = 0;
          for (const [a, b] of cells) if (hitKey.has(a * SIZE + b)) covered++;
          let touches = false;
          for (const [a, b] of cells) {
            for (let dr = -1; dr <= 1 && !touches; dr++)
              for (let dc = -1; dc <= 1; dc++) {
                const k = (a + dr) * SIZE + (b + dc);
                if (inB(a + dr, b + dc) && hitKey.has(k) && !inside.has(k)) { touches = true; break; }
              }
          }
          if (touches) continue;
          if (hits.length > 0 && covered === 0) continue; // сначала добиваем найденного
          const w = count * (hits.length > 0 ? Math.pow(30, covered) : 1);
          for (const [a, b] of cells) if (view[a][b] === 'unknown') heat[a][b] += w;
        }
    }
  }
  return heat;
}

export function chooseShot(view: CellView[][], remaining: number[], difficulty: Difficulty, rng: () => number = Math.random): Cell {
  const unknown = unknownCells(view);
  if (unknown.length === 0) throw new Error('Некуда ходить');

  if (difficulty === 'easy') {
    // «Жаворонок»: в основном ищет наугад, но иногда вспоминает, где уже нашёл
    const t = targetCandidates(view);
    if (t.length && rng() < 0.3) return pick(t, rng);
    return pick(unknown, rng);
  }

  if (difficulty === 'normal') {
    // «Лиса»: охота по шахматному узору + добивание вокруг попаданий
    const t = targetCandidates(view);
    if (t.length) return pick(t, rng);
    const minLen = Math.min(...remaining);
    const parity = unknown.filter(([r, c]) => (r + c) % Math.max(2, minLen) === 0);
    return pick(parity.length ? parity : unknown, rng);
  }

  // «Беркут»: карта вероятностей
  const heat = probabilityMap(view, remaining);
  let best = -1;
  let bestCells: Cell[] = [];
  for (const [r, c] of unknown) {
    if (heat[r][c] > best) { best = heat[r][c]; bestCells = [[r, c]]; }
    else if (heat[r][c] === best) bestCells.push([r, c]);
  }
  return pick(bestCells.length ? bestCells : unknown, rng);
}
