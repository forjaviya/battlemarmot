import { useState } from 'react';
import { BABY, BALLOON, HEAD, PixelSprite } from './sprites';
import { Marmot } from './Marmot';
import { sfx } from '../lib/sound';

/** Пиксельные холмы-барханы: синусоида, округлённая до «ступенек» по 4 px. */
function PixelHills({ color, amp, period, phase, base, height = 90, className }: { color: string; amp: number; period: number; phase: number; base: number; height?: number; className?: string }) {
  const W = 480, step = 4;
  let d = `M0 ${height}`;
  for (let x = 0; x <= W; x += step) {
    const y = Math.round((base + amp * Math.sin((x / period) * Math.PI * 2 + phase) + (amp / 2) * Math.sin((x / (period * 0.43)) * Math.PI * 2)) / step) * step;
    d += ` L${x} ${y} L${x + step} ${y}`;
  }
  d += ` L${W} ${height} Z`;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden>
      <path d={d} fill={color} />
    </svg>
  );
}

/** Общий фон всех экранов: тёплое небо, пиксельное солнце, облака и песчаные барханы. */
export function Backdrop() {
  return (
    <div className="sky" aria-hidden>
      <div className="px-sun" />
      <div className="px-cloud c1" />
      <div className="px-cloud c2" />
      <div className="px-cloud c3" />
      <div className="dunes">
        <PixelHills className="dune d3" color="#f0d49b" amp={10} period={260} phase={0.5} base={40} />
        <PixelHills className="dune d2" color="#e3bb73" amp={9} period={190} phase={2} base={55} />
        <PixelHills className="dune d1" color="#d4a25a" amp={6} period={140} phase={4} base={70} />
      </div>
    </div>
  );
}

const BALLOONS = [
  { top: 1, dur: 34, delay: -6, size: 1, color: '#e0413b' },
  { top: 12, dur: 44, delay: -18, size: 1.15, color: '#d44e00' },
  { top: 4, dur: 58, delay: -40, size: 0.7, color: '#f6e7c8' },
  { top: 20, dur: 40, delay: -31, size: 0.85, color: '#ffd23f' },
  { top: 8, dur: 66, delay: -52, size: 0.6, color: '#8fd06a' },
];

/** Сурки на воздушных шариках пролетают над степью. */
export function FlyingMarmots() {
  return (
    <div className="flyers" aria-hidden>
      {BALLOONS.map((b, i) => (
        <div key={i} className="flyer" style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, ['--s' as string]: b.size }}>
          <div className="flyer-bob" style={{ animationDelay: `${-i * 0.7}s` }}>
            <PixelSprite rows={BALLOON} pal={{ r: b.color }} className="balloon" />
            <PixelSprite rows={BABY} className="hanger" />
          </div>
        </div>
      ))}
    </div>
  );
}

const MOUND = [
  '....qqqqqqqq....',
  '..qqQQQQQQQQqq..',
  '.qQQhhhhhhhhQQq.',
  'qQQhxxxxxxxxhQQq',
  'qQhxxxxxxxxxxhQq',
  '.qQhhhhhhhhhhQq.',
  '..qqQQQQQQQQqq..',
  '....qqqqqqqq....',
];

/** Нижняя «степная» сцена главной: норки, из которых выглядывают сурки. Сурков можно тыкать. */
export function SteppeParade() {
  const [hopping, setHopping] = useState<number | null>(null);
  const hop = (i: number) => {
    setHopping(i);
    sfx.hit();
    setTimeout(() => setHopping(null), 500);
  };
  const burrows = [0, 1, 2, 3, 4];
  return (
    <div className="parade">
      <div className="lookout" onClick={() => hop(99)}>
        <div className={hopping === 99 ? 'hop' : ''}><Marmot length={4} orientation="v" /></div>
      </div>
      {burrows.map((i) => (
        <button key={i} className={`burrow b${i}`} onClick={() => hop(i)} aria-label="Сурок в норке">
          <div className="burrow-win">
            <div className={`peeker ${hopping === i ? 'hop' : ''}`} style={{ animationDelay: `${-i * 1.7}s` }}>
              <PixelSprite rows={i % 2 ? HEAD : BABY} />
            </div>
          </div>
          <PixelSprite rows={MOUND} className="mound" />
        </button>
      ))}
      <div className="sleeper" onClick={() => hop(98)}>
        <span className="zzz">z<span>z</span><span>z</span></span>
        <div className={hopping === 98 ? 'hop' : ''}><Marmot length={4} orientation="h" /></div>
      </div>
    </div>
  );
}
