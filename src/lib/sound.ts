// 8-битные звуки, синтезируются в браузере через Web Audio (без аудиофайлов).

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem('battlemarmot.muted') === '1';
} catch { /* ignore */ }

export const isMuted = () => muted;
export function setMuted(v: boolean) {
  muted = v;
  try { localStorage.setItem('battlemarmot.muted', v ? '1' : '0'); } catch { /* ignore */ }
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', delay = 0, vol = 0.06, slideTo?: number) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* звук необязателен */ }
}

export const sfx = {
  click: () => tone(660, 0.05, 'square', 0, 0.03),
  place: () => { tone(440, 0.06); tone(660, 0.06, 'square', 0.05); },
  bad: () => tone(160, 0.15, 'sawtooth', 0, 0.04),
  miss: () => tone(220, 0.12, 'triangle', 0, 0.08, 110),
  hit: () => { tone(880, 0.07); tone(1175, 0.09, 'square', 0.06); },
  found: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, 'square', i * 0.07)),
  win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, 'square', i * 0.11, 0.05)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.2, 'triangle', i * 0.16, 0.08)),
};
