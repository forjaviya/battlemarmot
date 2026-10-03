import { useState } from 'react';
import { APP_NAME } from '../config';
import { useI18n } from '../i18n';
import type { Difficulty } from '../game/types';
import { FlyingMarmots, SteppeParade } from '../ui/Scenery';
import { sfx } from '../lib/sound';
import { Portrait } from '../ui/Portrait';
import { PEEK, PHONE, PixelSprite } from '../ui/sprites';

export function Home({ canResume, onResume, onNew, onStats, onRules }: { canResume: boolean; onResume: () => void; onNew: (d: Difficulty) => void; onStats: () => void; onRules: () => void }) {
  const [picking, setPicking] = useState(false);
  const { t } = useI18n();
  const f = t.home.features;
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
        <p className="tagline" style={{ ['--chars' as string]: t.tagline.length }}>{t.tagline}</p>
        <p className="lead">{t.home.lead}</p>
      </div>

      {!picking ? (
        <div className="menu">
          {canResume && <button className="btn primary big" onClick={() => { sfx.click(); onResume(); }}><span className="px-play" aria-hidden />{t.home.resume}</button>}
          <button className={`btn ${canResume ? 'sand' : 'primary'} big`} onClick={() => { sfx.click(); setPicking(true); }}>{t.home.newGame}</button>
          <div className="menu-row">
            <button className="btn sand" onClick={onStats}>{t.home.stats}</button>
            <button className="btn sand" onClick={onRules}>{t.home.rules}</button>
          </div>
          <ul className="features">
            <li><span className="f-icon"><PixelSprite rows={PEEK.slice(4)} /></span><b>{f[0][0]}</b><span>{f[0][1]}</span></li>
            <li><span className="f-icon"><Portrait who="hard" mood="smug" size={46} /></span><b>{f[1][0]}</b><span>{f[1][1]}</span></li>
            <li><span className="f-icon"><PixelSprite rows={PHONE} /></span><b>{f[2][0]}</b><span>{f[2][1]}</span></li>
          </ul>
        </div>
      ) : (
        <div className="panel opponents">
          <h2>{t.home.pick}</h2>
          <div className="opp-list">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} className={`opp opp-${d}`} onClick={() => { sfx.click(); onNew(d); }}>
                <Portrait who={d} mood={d === 'hard' ? 'smug' : d === 'normal' ? 'alert' : 'neutral'} size={84} className="idle" />
                <span className="opp-level">{t.opp[d].level}</span>
                <span className="opp-name">{t.opp[d].name}</span>
                <span className="opp-about">{t.opp[d].about}</span>
              </button>
            ))}
          </div>
          <button className="btn ghost small" onClick={() => setPicking(false)}>{t.back}</button>
        </div>
      )}

      <SteppeParade />
    </div>
  );
}
