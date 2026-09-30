import { useState } from 'react';
import { APP_NAME, APP_TAGLINE, OPPONENTS } from '../config';
import type { Difficulty } from '../game/types';
import { FlyingMarmots, SteppeParade } from '../ui/Scenery';
import { sfx } from '../lib/sound';
import { Portrait } from '../ui/Portrait';
import { PEEK, PHONE, PixelSprite } from '../ui/sprites';

export function Home({ canResume, onResume, onNew, onStats, onRules }: { canResume: boolean; onResume: () => void; onNew: (d: Difficulty) => void; onStats: () => void; onRules: () => void }) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="screen home">
      <FlyingMarmots />
      <div className="hero">
        <h1 className="logo">
          {['Battle', 'Marmot'].map((word, w) => (
            <span key={word} className="logo-line">
              {word.split('').map((ch, i) => (
                <span key={i} className="logo-ch" style={{ animationDelay: `${(w * 6 + i) * 0.12}s` }}>{ch}</span>
              ))}
            </span>
          ))}
          <span className="sr-only">{APP_NAME}</span>
        </h1>
        <p className="tagline">{APP_TAGLINE}</p>
        <p className="lead">Спрячь своих сурков в норках и найди всех сурков соседа первым.</p>
      </div>

      {!picking ? (
        <div className="menu">
          {canResume && <button className="btn primary big" onClick={() => { sfx.click(); onResume(); }}>▶ Продолжить</button>}
          <button className={`btn ${canResume ? 'sand' : 'primary'} big`} onClick={() => { sfx.click(); setPicking(true); }}>Новая игра</button>
          <div className="menu-row">
            <button className="btn sand" onClick={onStats}>Статистика</button>
            <button className="btn sand" onClick={onRules}>Как играть</button>
          </div>
          <ul className="features">
            <li><span className="f-icon"><PixelSprite rows={PEEK.slice(4)} /></span><b>10 сурков</b><span>спрятать и найти</span></li>
            <li><span className="f-icon"><Portrait who="hard" mood="smug" size={54} /></span><b>3 соперника</b><span>разной хитрости</span></li>
            <li><span className="f-icon"><PixelSprite rows={PHONE} /></span><b>1 аккаунт</b><span>прогресс на любом устройстве</span></li>
          </ul>
        </div>
      ) : (
        <div className="panel opponents">
          <h2>С кем играем?</h2>
          <div className="opp-list">
            {(Object.keys(OPPONENTS) as Difficulty[]).map((d) => (
              <button key={d} className={`opp opp-${d}`} onClick={() => { sfx.click(); onNew(d); }}>
                <Portrait who={d} mood={d === 'hard' ? 'smug' : d === 'normal' ? 'alert' : 'neutral'} size={84} className="idle" />
                <span className="opp-level">{OPPONENTS[d].level}</span>
                <span className="opp-name">{OPPONENTS[d].name}</span>
                <span className="opp-about">{OPPONENTS[d].about}</span>
              </button>
            ))}
          </div>
          <button className="btn ghost small" onClick={() => setPicking(false)}>Назад</button>
        </div>
      )}

      <SteppeParade />
    </div>
  );
}
