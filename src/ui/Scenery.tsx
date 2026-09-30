import { useState } from 'react';
import { BABY, BALLOON, HEAD, PixelSprite } from './sprites';
import { Marmot } from './Marmot';
import { Portrait } from './Portrait';
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
  { top: 0, dur: 34, delay: -6, size: 1, color: '#e0413b', who: 'marmot' as const },
  { top: 4, dur: 44, delay: -18, size: 1.15, color: '#d44e00', who: 'normal' as const },
  { top: 2, dur: 58, delay: -40, size: 0.7, color: '#f6e7c8', who: 'easy' as const },
  { top: 7, dur: 40, delay: -31, size: 0.85, color: '#ffd23f', who: 'hard' as const },
  { top: 5, dur: 66, delay: -52, size: 0.6, color: '#8fd06a', who: 'marmot' as const },
];

/** Сурки на воздушных шариках пролетают над степью. */
export function FlyingMarmots() {
  return (
    <div className="flyers" aria-hidden>
      {BALLOONS.map((b, i) => (
        <div key={i} className="flyer" style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, ['--s' as string]: b.size }}>
          <div className="flyer-bob" style={{ animationDelay: `${-i * 0.7}s` }}>
            <PixelSprite rows={BALLOON} pal={{ r: b.color }} className="balloon" />
            {b.who === 'marmot' ? <PixelSprite rows={BABY} className="hanger" /> : <Portrait who={b.who} mood={b.who === 'hard' ? 'smug' : 'happy'} size={52} className="hanger" />}
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

const MOUND_BACK = MOUND.slice(0, 4);
const MOUND_FRONT = MOUND.slice(4);
const SPLASH = [[-34, -26], [-22, -40], [-8, -48], [10, -46], [24, -38], [36, -24], [-30, -10], [32, -8]];

type Act = 'hop' | 'tall' | null;

/** Нижняя «степная» сцена главной: сурки вылезают прямо из норок. Их можно тыкать. */
export function SteppeParade() {
  const [act, setAct] = useState<Record<number, Act>>({});
  const [splash, setSplash] = useState<Record<number, number>>({});
  const [awake, setAwake] = useState(false);

  const poke = (i: number) => {
    if (act[i]) return;
    const kind: Act = Math.random() < 0.55 ? 'tall' : 'hop';
    setAct((a) => ({ ...a, [i]: kind }));
    sfx.hit();
    if (kind === 'tall') {
      // вытянулся столбиком → нырнул в норку → песок в стороны
      setTimeout(() => { setSplash((s) => ({ ...s, [i]: Date.now() })); sfx.miss(); }, 750);
      setTimeout(() => setSplash((s) => ({ ...s, [i]: 0 })), 1400);
      setTimeout(() => setAct((a) => ({ ...a, [i]: null })), 2600);
    } else {
      setTimeout(() => setAct((a) => ({ ...a, [i]: null })), 550);
    }
  };

  const wake = () => {
    if (awake) return;
    setAwake(true);
    sfx.bad();
    setTimeout(() => setAwake(false), 1800);
  };

  return (
    <div className="parade">
      <div className="lookout" onClick={() => poke(99)}>
        <div className={act[99] ? 'hop' : ''}><Marmot length={4} orientation="v" /></div>
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <button key={i} className="burrow" onClick={() => poke(i)} aria-label="Сурок в норке">
          <PixelSprite rows={MOUND_BACK} className="mound-back" />
          <div className="burrow-win">
            {act[i] === 'tall' ? (
              <div className="peeker tall"><Marmot length={3} orientation="v" /></div>
            ) : (
              <div className={`peeker ${act[i] === 'hop' ? 'hop' : ''}`} style={{ animationDelay: `${-i * 1.7}s` }}>
                <PixelSprite rows={i % 2 ? HEAD : BABY} />
              </div>
            )}
          </div>
          <PixelSprite rows={MOUND_FRONT} className="mound-front" />
          {!!splash[i] && (
            <span className="splash" key={splash[i]}>
              {SPLASH.map(([dx, dy], k) => <i key={k} style={{ ['--dx' as string]: `${dx}px`, ['--dy' as string]: `${dy}px` }} />)}
            </span>
          )}
        </button>
      ))}
      <div className="sleeper" onClick={wake}>
        {awake ? <span className="grr">хмф!</span> : <span className="zzz">z<span>z</span><span>z</span></span>}
        <div className={awake ? 'hop' : ''}><Marmot length={4} orientation="h" face={awake ? 'grumpy' : 'sleep'} /></div>
      </div>
    </div>
  );
}
