import { useEffect, useRef, useState } from 'react';
import { BABY, BABY_ANGRY, BALLOON, H_HEAD_GRUMPY, H_HEAD_SLEEP, HEAD, HEAD_ANGRY, PixelSprite } from './sprites';
import { Marmot } from './Marmot';
import { Portrait } from './Portrait';
import { sfx } from '../lib/sound';
import { useI18n } from '../i18n';

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
  { top: 5, dur: 48, delay: -30, size: 0.75, color: '#f3e3c3', who: 'marmot' as const },
  { top: 3, dur: 60, delay: -44, size: 0.65, color: '#ffd23f', who: 'marmot' as const },
  // соперники пролетают редко: пересекают экран за первую треть цикла, потом долго «за кадром»
  { top: 2, dur: 80, delay: -20, size: 0.8, color: '#f3e3c3', who: 'easy' as const, rare: true },
];

/** Сурки на воздушных шариках пролетают над степью. */
export function FlyingMarmots() {
  return (
    <div className="flyers" aria-hidden>
      {BALLOONS.map((b, i) => (
        <div key={i} className={`flyer ${'rare' in b ? 'rare' : ''}`} style={{ top: `${b.top}%`, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s`, ['--s' as string]: b.size }}>
          <div className="flyer-bob" style={{ animationDelay: `${-i * 0.7}s` }}>
            <PixelSprite rows={BALLOON} pal={{ r: b.color }} className="balloon" />
            {b.who === 'marmot' ? <PixelSprite rows={BABY} className="hanger" /> : <Portrait who={b.who} mood="alert" size={52} className="hanger sway" />}
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

const MOUND_BACK = MOUND;
// передний край норки: те же размеры, но верхние ряды пустые - без швов
const MOUND_FRONT = MOUND.map((row, y) => (y < 5 ? '.'.repeat(16) : row));
const SPLASH = [[-34, -26], [-22, -40], [-8, -48], [10, -46], [24, -38], [36, -24], [-30, -10], [32, -8]];

type Burrow = { up: boolean; mode: 'idle' | 'hop' | 'angry' | 'tall' };
const BIG = (i: number) => i % 2 === 1;

/** Нижняя «степная» сцена главной: сурки сами выглядывают из норок. Их можно тыкать:
 *  спрятавшегося - выманить наружу; толстый - подпрыгнет или вытянется столбиком и нырнёт;
 *  маленький - рассердится и нырнёт в норку, подняв песок. */
export function SteppeParade() {
  const { t } = useI18n();
  const [burrows, setBurrows] = useState<Burrow[]>(() => [0, 1, 2, 3, 4].map((i) => ({ up: i % 2 === 0, mode: 'idle' })));
  const [splash, setSplash] = useState<Record<number, number>>({});
  const [awake, setAwake] = useState(false);
  const timers = useRef<Record<number, number>>({});

  const patch = (i: number, b: Partial<Burrow>) => setBurrows((all) => all.map((x, k) => (k === i ? { ...x, ...b } : x)));

  // собственный ритм каждой норки: то вылезет, то спрячется
  const schedule = (i: number, delay: number) => {
    window.clearTimeout(timers.current[i]);
    timers.current[i] = window.setTimeout(() => {
      setBurrows((all) => {
        const b = all[i];
        if (b.mode !== 'idle') return all;
        return all.map((x, k) => (k === i ? { ...x, up: !x.up } : x));
      });
      schedule(i, 1800 + Math.random() * 2600);
    }, delay);
  };
  useEffect(() => {
    [0, 1, 2, 3, 4].forEach((i) => schedule(i, 800 + i * 700));
    const t = timers.current;
    return () => Object.values(t).forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const puff = (i: number) => {
    setSplash((s) => ({ ...s, [i]: Date.now() }));
    sfx.miss();
    setTimeout(() => setSplash((s) => ({ ...s, [i]: 0 })), 650);
  };

  const poke = (i: number) => {
    const b = burrows[i];
    if (b.mode !== 'idle') return;
    if (!b.up) { patch(i, { up: true }); sfx.click(); schedule(i, 2500); return; }
    if (BIG(i)) {
      // толстый всегда вытягивается высоким столбиком и ныряет обратно с песком
      patch(i, { mode: 'tall' }); sfx.hit();
      setTimeout(() => puff(i), 820);
      setTimeout(() => patch(i, { mode: 'idle', up: false }), 1000);
      schedule(i, 3200);
    } else {
      patch(i, { mode: 'angry' }); sfx.bad();
      setTimeout(() => { patch(i, { mode: 'idle', up: false }); puff(i); }, 650);
      schedule(i, 3000);
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
      {burrows.map((b, i) => (
        <button key={i} className="burrow" onClick={() => poke(i)} aria-label={t.home.burrow}>
          <PixelSprite rows={MOUND_BACK} className="mound-back" />
          <div className="burrow-win">
            {b.mode === 'tall' ? (
              <div className="peeker tall"><Marmot length={3} orientation="v" /></div>
            ) : (
              <div className={`peeker ${b.up ? 'up' : ''} ${b.mode === 'hop' ? 'hop' : ''}`}>
                <PixelSprite rows={BIG(i) ? (b.mode === 'angry' ? HEAD_ANGRY : HEAD) : b.mode === 'angry' ? BABY_ANGRY : BABY} />
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
        {awake ? <span className="grr">#!&amp;</span> : <span className="zzz">z<span>z</span><span>z</span></span>}
        <div className={awake ? 'hop' : ''}>
          <Marmot length={4} orientation="h" face={awake ? 'grumpy' : 'sleep'} className="sleeper-full" />
          <PixelSprite rows={awake ? H_HEAD_GRUMPY : H_HEAD_SLEEP} className="sleeper-head" />
        </div>
      </div>
    </div>
  );
}
