import { useState } from 'react';
import { APP_NAME, APP_TAGLINE, OPPONENTS } from '../config';
import type { Difficulty } from '../game/types';
import { Marmot } from '../ui/Marmot';
import { sfx } from '../lib/sound';

export function Home({ canResume, onResume, onNew, onStats, onRules }: { canResume: boolean; onResume: () => void; onNew: (d: Difficulty) => void; onStats: () => void; onRules: () => void }) {
  const [picking, setPicking] = useState(false);
  return (
    <div className="screen home">
      <div className="hero">
        <div className="hero-marmots" aria-hidden>
          <Marmot length={1} orientation="v" className="bob d2" />
          <Marmot length={3} orientation="v" className="bob" />
          <Marmot length={2} orientation="v" className="bob d1" />
        </div>
        <h1 className="logo">{APP_NAME}</h1>
        <p className="tagline">{APP_TAGLINE}</p>
        <p className="lead">Спрячь своих сурков в норках, найди всех сурков соседа первым. Партия — минут пять, как раз на перемену.</p>
      </div>

      {!picking ? (
        <div className="menu">
          {canResume && <button className="btn primary big" onClick={() => { sfx.click(); onResume(); }}>▶ Продолжить партию</button>}
          <button className={`btn ${canResume ? '' : 'primary'} big`} onClick={() => { sfx.click(); setPicking(true); }}>Новая игра</button>
          <div className="menu-row">
            <button className="btn" onClick={onStats}>📊 Статистика</button>
            <button className="btn" onClick={onRules}>❓ Как играть</button>
          </div>
        </div>
      ) : (
        <div className="panel opponents">
          <h2>С кем играем?</h2>
          <div className="opp-list">
            {(Object.keys(OPPONENTS) as Difficulty[]).map((d) => (
              <button key={d} className={`opp opp-${d}`} onClick={() => { sfx.click(); onNew(d); }}>
                <span className="opp-level">{OPPONENTS[d].level}</span>
                <span className="opp-name">{OPPONENTS[d].name}</span>
                <span className="opp-about">{OPPONENTS[d].about}</span>
              </button>
            ))}
          </div>
          <button className="btn ghost small" onClick={() => setPicking(false)}>← Назад</button>
        </div>
      )}
    </div>
  );
}
