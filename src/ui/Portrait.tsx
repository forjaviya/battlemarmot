// Пиксельные портреты соперников (оригинальные) с настроением.
// Голова рисуется из базового спрайта, а глаза/брови/рот - отдельными слоями,
// поэтому выражение меняется по ходу партии, а глаза могут моргать.

import type { Difficulty } from '../game/types';

const mirror = (half: string[]) => half.map((row) => row + [...row].reverse().join(''));

const COLORS: Record<string, string> = {
  o: '#3d2413', k: '#1b1410', w: '#ffffff', p: '#f4a3a3', n: '#2a1a0d', r: '#c0392b', u: '#6fc3ff',
  // жаворонок
  B: '#a0784a', D: '#6b4a2a', L: '#ecd9b0', Y: '#f0a830',
  // лиса
  F: '#e07a2a', W: '#fff6e8', G: '#b85a18',
  // беркут
  E: '#5a3a1e', A: '#c89a3a', H: '#f2c14e',
  K: '#7a4a22', J: '#5a3416', Z: '#e0b04a',
};

const LARK = mirror([
  '.......o',
  '......oD',
  '....ooBB',
  '...oBDBB',
  '..oBBBBB',
  '.oBBBBBB',
  '.oBBBBBB',
  '.oBBBBBB',
  'oBBBBBBY',
  'oLLBBBYY',
  'oLLLLBBY',
  'oLLDLLLL',
  'oLLLLDLL',
  '.oLLLLLL',
  '..ooLLLL',
  '....oooo',
]);

const FOX = mirror([
  '.o......',
  '.oo.....',
  '.oGo....',
  '.oGFo...',
  '.oFFFooo',
  '.oFFFFFF',
  'oFFFFFFF',
  'oFFFFFFF',
  'oFFFFFFF',
  'oWWFFFFF',
  '.oWWWWFF',
  '..oWWWWW',
  '...oWWWn',
  '....oWWW',
  '.....ooo',
  '........',
]);

const EAGLE = mirror([
  '........',
  '...ooooo',
  '..oAAAAA',
  '.oAAAAAA',
  '.oEAAAAA',
  'oEEEEAAA',
  'oEAAAAEE',
  'oEAAAAEE',
  'oEEAAEEH',
  'oEEEEEHH',
  '.oEEEEHH',
  '.oEEEEEo',
  '..oEEEEE',
  '..oEEEEE',
  '...ooooo',
  '........',
]);

export type Mood = 'neutral' | 'alert' | 'worried' | 'panic' | 'smug' | 'happy' | 'focus' | 'sad';

type Px = [number, number, string];
// Координаты - для левого глаза (x от 2 до 5, y от 4 до 8); правый зеркалится.
const EYES: Record<Mood, Px[]> = {
  neutral: [[3, 6, 'k'], [4, 6, 'k'], [3, 7, 'k'], [4, 7, 'w']],
  alert: [[3, 5, 'w'], [4, 5, 'w'], [3, 6, 'k'], [4, 6, 'w'], [3, 7, 'k'], [4, 7, 'k']],
  worried: [[4, 4, 'k'], [3, 5, 'k'], [3, 6, 'k'], [4, 6, 'k'], [3, 7, 'k'], [4, 7, 'w']],
  panic: [[4, 3, 'k'], [3, 4, 'k'], [2, 5, 'w'], [3, 5, 'w'], [4, 5, 'w'], [2, 6, 'w'], [3, 6, 'k'], [4, 6, 'w'], [2, 7, 'w'], [3, 7, 'w'], [4, 7, 'w']],
  smug: [[2, 5, 'k'], [3, 5, 'k'], [4, 5, 'k'], [3, 7, 'k'], [4, 7, 'k']],
  happy: [[2, 7, 'k'], [3, 6, 'k'], [4, 7, 'k']],
  focus: [[2, 5, 'k'], [5, 6, 'k'], [3, 7, 'k'], [4, 7, 'k']],
  sad: [[2, 5, 'k'], [3, 6, 'k'], [3, 7, 'k'], [4, 7, 'k'], [4, 8, 'u']],
};

// Рот/клюв: координаты левой половины у центра (x = 7 - левый из двух центральных пикселей)
const MOUTH: Record<Difficulty, Partial<Record<Mood, Px[]>>> = {
  easy: {
    panic: [[6, 10, 'n'], [7, 10, 'n'], [7, 11, 'r']],
    happy: [[6, 10, 'o']],
    smug: [[7, 10, 'o']],
    sad: [[6, 11, 'o']],
  },
  normal: {
    neutral: [[6, 13, 'o']],
    alert: [[7, 13, 'o']],
    worried: [[6, 13, 'o'], [7, 13, 'o']],
    panic: [[6, 13, 'n'], [7, 13, 'n'], [7, 14, 'r']],
    smug: [[5, 12, 'o'], [6, 13, 'o']],
    happy: [[5, 12, 'o'], [6, 13, 'o'], [7, 13, 'r']],
    focus: [[6, 13, 'o'], [7, 13, 'o']],
    sad: [[6, 13, 'o'], [5, 14, 'o']],
  },
  hard: {
    panic: [[6, 11, 'n'], [7, 12, 'n']],
    happy: [[6, 11, 'o']],
    sad: [[6, 12, 'o']],
  },
};

const BASES: Record<Difficulty, string[]> = { easy: LARK, normal: FOX, hard: EAGLE };

function Rects({ px, cls }: { px: Px[]; cls?: string }) {
  const all: Px[] = [];
  for (const [x, y, c] of px) {
    all.push([x, y, c]);
    all.push([15 - x, y, c]);
  }
  return (
    <g className={cls}>
      {all.map(([x, y, c], i) => <rect key={i} x={x} y={y} width={1} height={1} fill={COLORS[c]} />)}
    </g>
  );
}

export function Portrait({ who, mood = 'neutral', size = 64, className, thinking, shades }: { who: Difficulty; mood?: Mood; size?: number; className?: string; thinking?: boolean; shades?: boolean }) {
  const base = BASES[who];
  const rects = [];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const c = base[y][x];
      if (c !== '.') rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[c]} />);
    }
  const sweat = mood === 'worried' || mood === 'panic';
  return (
    <div className={`portrait p-${who} mood-${mood} ${className ?? ''}`} style={{ width: size, height: size }}>
      <svg viewBox="-1 -3 18 20" width={size} height={size} shapeRendering="crispEdges" aria-hidden>
        {rects}
        {shades ? (
          <g>
            <rect x={1} y={5} width={14} height={1} fill="#111" />
            <rect x={2} y={6} width={5} height={2} fill="#111" />
            <rect x={9} y={6} width={5} height={2} fill="#111" />
            <rect x={3} y={6} width={1} height={1} fill="#6f8fbf" />
            <rect x={10} y={6} width={1} height={1} fill="#6f8fbf" />
            <rect x={3} y={8} width={3} height={1} fill="#111" />
            <rect x={10} y={8} width={3} height={1} fill="#111" />
          </g>
        ) : (
          <Rects px={EYES[mood]} cls="eyes" />
        )}
        <Rects px={MOUTH[who][mood] ?? []} />
        {sweat && (
          <g className="sweat">
            <rect x={14} y={2} width={1} height={1} fill={COLORS.u} />
            <rect x={14} y={3} width={2} height={2} fill={COLORS.u} />
            {mood === 'panic' && <><rect x={0} y={1} width={1} height={1} fill={COLORS.u} /><rect x={-1} y={2} width={2} height={2} fill={COLORS.u} /></>}
          </g>
        )}
      </svg>
      {thinking && <span className="think"><i /><i /><i /></span>}
    </div>
  );
}

/** Настроение соперника по ходу партии. */
export function moodFor(opts: { playerFound: number; aiFound: number; turn: 'player' | 'ai'; lastAiHit: boolean; over: boolean; playerWon: boolean }): Mood {
  const { playerFound, aiFound, turn, lastAiHit, over, playerWon } = opts;
  if (over) return playerWon ? 'sad' : 'happy';
  if (turn === 'ai') return lastAiHit ? 'happy' : 'focus';
  const p = playerFound / 20, q = aiFound / 20;
  if (p >= 0.75 || p - q > 0.3) return 'panic';
  if (p - q > 0.1) return 'worried';
  if (q - p > 0.15) return 'smug';
  return playerFound > 0 ? 'alert' : 'neutral';
}
