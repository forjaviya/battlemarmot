import { HOLE, PAL } from './sprites';

// Фоновые тайлы степи, генерируются как SVG data-URI (без картинок-файлов).

function toDataUri(rows: string[]): string {
  const w = rows[0].length, h = rows.length;
  let rects = '';
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || !PAL[ch]) continue;
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[ch]}"/>`;
    }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function grass(marks: [number, number, string][]): string[] {
  const g = Array.from({ length: 16 }, () => Array(16).fill('G'));
  for (const [x, y, ch] of marks) g[y][x] = ch;
  return g.map((r) => r.join(''));
}

const TUFT: [number, number, string][] = [[3, 11, 'g'], [4, 10, 'g'], [5, 11, 'g'], [4, 11, 'g'], [11, 4, 'g'], [12, 3, 'g'], [12, 4, 'g'], [13, 4, 'g']];
const DOTS: [number, number, string][] = [[2, 3, 'g'], [9, 6, 'g'], [13, 12, 'g'], [6, 14, 'g'], [14, 1, 'g']];
const TULIP: [number, number, string][] = [
  [7, 4, 'r'], [9, 4, 'r'], [7, 5, 'r'], [8, 5, 'r'], [9, 5, 'r'], [7, 6, 'r'], [8, 6, 'r'], [9, 6, 'r'],
  [8, 7, 'g'], [8, 8, 'g'], [8, 9, 'g'], [7, 9, 'g'], [9, 10, 'g'], [8, 10, 'g'], [2, 13, 'g'], [13, 2, 'g'],
];
const FLOWER: [number, number, string][] = [[4, 5, 'y'], [3, 5, 't'], [5, 5, 't'], [4, 4, 't'], [4, 6, 't'], [4, 7, 'g'], [4, 8, 'g'], [12, 12, 'g'], [11, 11, 'g']];

export const GRASS_TILES = [grass(DOTS), grass(TUFT), grass([...DOTS.slice(0, 2)]), grass(TULIP), grass(FLOWER), grass([])].map(toDataUri);
export const HOLE_TILE = toDataUri(HOLE.map((r, y) => [...r].map((ch, x) => (ch === '.' ? (y * 7 + x * 3) % 11 === 0 ? 'g' : 'G' : ch)).join('')));

/** Детерминированный «шум», чтобы у каждой клетки была своя травка. */
export function tileFor(r: number, c: number, seed = 0): string {
  const h = ((r * 73856093) ^ (c * 19349663) ^ (seed * 83492791)) >>> 0;
  const v = h % 100;
  // тюльпаны и цветочки реже
  if (v < 6) return GRASS_TILES[3];
  if (v < 12) return GRASS_TILES[4];
  if (v < 40) return GRASS_TILES[1];
  if (v < 70) return GRASS_TILES[0];
  if (v < 85) return GRASS_TILES[2];
  return GRASS_TILES[5];
}
