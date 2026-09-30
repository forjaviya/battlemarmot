import { HOLE } from './sprites';

// Тайлы светлой степи для игрового поля. Генерируются как SVG data-URI (без файлов-картинок).
// Детали: весенние тюльпаны (красные - Грейга, жёлтые - Шренка), ковыль, полынь, камешки, следы лапок.

const P: Record<string, string> = {
  '.': '#f7eed8', // светлый песок
  ',': '#eee0c0', // крапинки
  s: '#cdbf9a', // сухой стебель ковыля
  S: '#e2d8b8', // пушистая метёлка ковыля
  a: '#9fae86', // полынь
  A: '#7f9068', // полынь тёмная
  r: '#e0413b', // тюльпан красный
  y: '#f2c230', // тюльпан жёлтый
  g: '#6f9a3c', // стебель
  c: '#b9ae9a', // камешек
  C: '#968a74',
  f: '#d8c49c', // след лапки
  e: '#8a6238', h: '#4a2e17', x: '#2a1a0d', // норка
};

function toDataUri(rows: string[]): string {
  let rects = '';
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const ch = rows[y][x];
      if (ch === '.') continue;
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${P[ch]}"/>`;
    }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="${P['.']}"/>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function tile(marks: [number, number, string][]): string[] {
  const g = Array.from({ length: 16 }, () => Array(16).fill('.'));
  for (const [x, y, ch] of marks) if (x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = ch;
  return g.map((r) => r.join(''));
}

const SPECK: [number, number, string][] = [[2, 3, ','], [9, 6, ','], [13, 12, ','], [6, 13, ','], [14, 1, ','], [4, 9, ',']];
const KOVYL: [number, number, string][] = [
  [4, 13, 's'], [4, 12, 's'], [5, 11, 's'], [5, 10, 'S'], [6, 9, 'S'], [6, 8, 'S'], [7, 7, 'S'],
  [6, 13, 's'], [7, 12, 's'], [8, 11, 's'], [9, 10, 'S'], [10, 9, 'S'], [11, 9, 'S'],
  [3, 12, 's'], [2, 11, 'S'], [1, 10, 'S'], [12, 3, ','],
];
const POLYN: [number, number, string][] = [
  [9, 11, 'a'], [10, 10, 'a'], [11, 11, 'a'], [10, 11, 'A'], [9, 12, 'A'], [11, 12, 'A'], [10, 12, 'A'], [8, 10, 'a'], [12, 10, 'a'],
  [3, 4, ','], [13, 3, ','],
];
const tulip = (col: string): [number, number, string][] => [
  [7, 4, col], [9, 4, col], [7, 5, col], [8, 5, col], [9, 5, col], [7, 6, col], [8, 6, col], [9, 6, col],
  [8, 7, 'g'], [8, 8, 'g'], [8, 9, 'g'], [7, 9, 'g'], [9, 10, 'g'], [8, 10, 'g'], [2, 13, ','], [13, 2, ','],
];
const STONES: [number, number, string][] = [[4, 10, 'c'], [5, 10, 'c'], [4, 11, 'C'], [5, 11, 'C'], [11, 5, 'c'], [11, 6, 'C'], [9, 13, ',']];
const PAWS: [number, number, string][] = [
  [3, 11, 'f'], [4, 11, 'f'], [3, 12, 'f'], [4, 12, 'f'], [2, 10, 'f'], [5, 10, 'f'],
  [10, 5, 'f'], [11, 5, 'f'], [10, 6, 'f'], [11, 6, 'f'], [9, 4, 'f'], [12, 4, 'f'],
];

const T = {
  plain: toDataUri(tile(SPECK)),
  plain2: toDataUri(tile(SPECK.slice(0, 3))),
  kovyl: toDataUri(tile(KOVYL)),
  polyn: toDataUri(tile(POLYN)),
  red: toDataUri(tile(tulip('r'))),
  yellow: toDataUri(tile(tulip('y'))),
  stones: toDataUri(tile(STONES)),
  paws: toDataUri(tile(PAWS)),
};

export const HOLE_TILE = toDataUri(HOLE.map((r, y) => [...r].map((ch, x) => (ch === '.' ? ((y * 7 + x * 3) % 13 === 0 ? ',' : '.') : ch)).join('')));

/** Детерминированный «шум», чтобы у каждой клетки была своя деталь степи. */
export function tileFor(r: number, c: number, seed = 0): string {
  const h = ((r * 73856093) ^ (c * 19349663) ^ (seed * 83492791)) >>> 0;
  const v = h % 100;
  if (v < 5) return T.red;
  if (v < 8) return T.yellow;
  if (v < 20) return T.kovyl;
  if (v < 29) return T.polyn;
  if (v < 34) return T.stones;
  if (v < 37) return T.paws;
  if (v < 70) return T.plain;
  return T.plain2;
}
