// Оригинальные пиксельные спрайты (нарисованы для этого проекта).
// Симметричные спрайты описаны левой половиной (8 px) и зеркалятся.

import type { CSSProperties } from 'react';

const mirror = (half: string[]) => half.map((row) => row + [...row].reverse().join(''));

export const PAL: Record<string, string> = {
  o: '#3d2413', // контур
  b: '#c68b4e', // шёрстка
  d: '#8e5a2b', // тёмная шёрстка / лапки
  l: '#f0cf95', // светлое пузико
  k: '#1b1410', // глаз
  w: '#ffffff', // блик
  p: '#f4a3a3', // щёчки/ушки
  n: '#5a2f1a', // нос
  t: '#fffaf0', // зубки
  g: '#6f9a3c', // трава тёмная
  G: '#a9c96a', // трава
  r: '#e0413b', // тюльпан
  y: '#ffd23f', // звёздочка
  h: '#4a2e17', // нора
  e: '#8a6238', // земля
  x: '#2a1a0d', // глубина норы
  s: '#d44e00', // фирменный оранжевый
  S: '#9c3900',
  q: '#e7c27d', // песок
  Q: '#c9964f', // песок тёмный
};

export const BALLOON = mirror([
  '...ooo',
  '.oorrr',
  'orrrrr',
  'orwrrr',
  'orwrrr',
  'orrrrr',
  'orrrrr',
  '.orrrr',
  '..orrr',
  '...oor',
  '....oo',
  '.....o',
  '.....o',
  '.....o',
]);

export const STAR = mirror([
  '...o',
  '..oy',
  '..oy',
  'oooy',
  'oyyy',
  '.oyy',
  '..oy',
  '.oyy',
  '.oyo',
  'oyo.',
  'oo..',
]);

export const CLOCK = mirror([
  '...ooo',
  '.oottt',
  '.otttt',
  'ottttd',
  'ottttd',
  'ottttd',
  'otttdd',
  'oltttt',
  'oltttt',
  '.ollll',
  '.oolll',
  '...ooo',
]);

export const PHONE = mirror([
  '.oooo',
  'oosss',
  'olqqq',
  'olqqq',
  'olqqq',
  'olqqq',
  'olqqq',
  'olqqq',
  'olqqq',
  'olqqq',
  'ooooo',
  'ooooy',
  '.oooo',
]);

export const SPEAKER = [
  '....oo....',
  '...oto....',
  'oooott..o.',
  'otttot.o.o',
  'otttot.o.o',
  'otttot.o.o',
  'oooott..o.',
  '...oto....',
  '....oo....',
];
export const SPEAKER_OFF = [
  '....oo....',
  '...oto....',
  'oooott....',
  'otttot.o.o',
  'otttot..o.',
  'otttot.o.o',
  'oooott....',
  '...oto....',
  '....oo....',
];


export const HEAD = mirror([
  '........',
  '...oo...',
  '..opbo..',
  '..obbooo',
  '.obbbbbb',
  '.obbbbbb',
  'obbkkbbb',
  'obbkwbbb',
  'obbbbbbb',
  'obpbblll',
  'obbbllln',
  'obbbllol',
  'obbblllt',
  'obbbllll',
  '.obbblll',
  '.obbblll',
]);

export const BODY = mirror(Array(16).fill('.obbblll'));

export const BODY_PAWS = mirror([
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbbbdd',
  '.obbbdod',
  '.obbbddl',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
]);

export const FEET = mirror([
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbblll',
  '.obbbbll',
  '.obbbbbl',
  '.obbbbbb',
  '..obbbbb',
  '..obbbbb',
  '.oddddob',
  '.ooooood',
  '......od',
  '.......o',
  '........',
  '........',
]);

export const BABY = mirror([
  '........',
  '........',
  '...oo...',
  '..opoooo',
  '..obbbbb',
  '.obkkbbb',
  '.obkwbbb',
  '.opbblll',
  '.obbllln',
  '.obblllt',
  '..obllll',
  '..obblll',
  '..obddll',
  '..obbbbb',
  '...ooooo',
  '........',
]);

// --- Лежащий сурок (горизонтальный): голова слева, спинка сверху, пузико снизу ---
export const H_HEAD = [...HEAD.slice(0, 14), ...mirror(['..obbbbb', '...ooooo'])];

const hb = (bottom: string[]) => [
  '................',
  '................',
  'oooooooooooooooo',
  'dddddddddddddddd',
  'bdbbbbdbbbbbdbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'llllllllllllllll',
  'llllllllllllllll',
  'llllllllllllllll',
  ...bottom,
];
export const H_BODY = hb(['oooooooooooooooo', '................', '................']);
export const H_BODY_PAWS = hb(['oooooooooooooooo', '..oddo....oddo..', '..oooo....oooo..']);
export const H_TAIL = [
  '................',
  '................',
  'oooooooooooo....',
  'ddddddddddddo...',
  'bdbbbbdbbbbbbo..',
  'bbbbbbbbbbbbbo..',
  'bbbbbbbbbbbbbooo',
  'bbbbbbbbbbbbbddo',
  'bbbbbbbbbbbbbooo',
  'bbbbbbbbbbbbbo..',
  'llllllllllllbo..',
  'lllllllllllbo...',
  'llllllllllbbo...',
  'oooooooooooo....',
  '..oddo..oddo....',
  '..oooo..oooo....',
];

export function marmotSegmentsH(n: number): string[][] {
  if (n === 1) return [BABY];
  if (n === 2) return [H_HEAD, H_TAIL];
  if (n === 3) return [H_HEAD, H_BODY_PAWS, H_TAIL];
  return [H_HEAD, H_BODY_PAWS, H_BODY, H_TAIL];
}

/** Ушки, выглядывающие из норы (найдена часть сурка). */
export const PEEK = mirror([
  '........',
  '........',
  '........',
  '........',
  '...oo...',
  '..opbo..',
  '..obbooo',
  '.obbbbbb',
  '.obkkbbb',
  '.obkwbbb',
  'eeeeeeee',
  'ehhhhhhh',
  'ehxxxxxx',
  'ehxxxxxx',
  '.ehhhhhh',
  '..eeeeee',
]);

/** Пустая норка (промах). */
export const HOLE = mirror([
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
  '........',
  '....eeee',
  '..eeeeee',
  '.eehhhhh',
  '.ehhxxxx',
  '.ehxxxxx',
  '.eehhxxx',
  '..eeehhh',
  '....eeee',
  '........',
]);

export function PixelSprite({ rows, size = 16, style, className, pal }: { rows: string[]; size?: number; style?: CSSProperties; className?: string; pal?: Record<string, string> }) {
  const P = pal ? { ...PAL, ...pal } : PAL;
  const w = rows[0].length;
  const h = rows.length;
  const rects = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || !P[ch]) continue;
      // сливаем горизонтальные отрезки одного цвета — меньше DOM-узлов
      let len = 1;
      while (x + len < w && rows[y][x + len] === ch) len++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={len} height={1} fill={P[ch]} />);
      x += len - 1;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * h) / w}
      shapeRendering="crispEdges"
      style={style}
      className={className}
      aria-hidden
    >
      {rects}
    </svg>
  );
}

/** Сегменты вертикального (стоящего столбиком) сурка длины n. */
export function marmotSegments(n: number): string[][] {
  if (n === 1) return [BABY];
  if (n === 2) return [HEAD, FEET];
  if (n === 3) return [HEAD, BODY_PAWS, FEET];
  return [HEAD, BODY_PAWS, BODY, FEET];
}

export const MARMOT_NAMES: Record<number, string> = {
  1: 'Сурчонок',
  2: 'Сурок',
  3: 'Большой сурок',
  4: 'Длинносурок',
};
