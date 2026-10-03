import { Marmot } from '../ui/Marmot';
import { HOLE, PEEK, PixelSprite, STAR } from '../ui/sprites';
import { useI18n } from '../i18n';
import type { Difficulty } from '../game/types';

export function Rules({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const R = t.rules;
  return (
    <div className="screen rules">
      <div className="screen-head">
        <button className="btn ghost small" onClick={onBack}>{t.menu}</button>
        <h2>{R.title}</h2>
      </div>
      <div className="panel prose">
        <p>{R.intro}</p>
        <h3>{R.h1}</h3>
        <p>{R.fleet}</p>
        <ul className="fleet-legend">
          {[4, 3, 2, 1].map((len, i) => (
            <li key={len}>
              <span className="legend-sprite" style={{ width: `${len * 22}px` }}><Marmot length={len} orientation="h" /></span>
              {R.fleetItem(t.marmots[len], len, i + 1)}
            </li>
          ))}
        </ul>
        <p>{R.straight}</p>
        <h3>{R.h2}</h3>
        <ul className="legend">
          <li><PixelSprite rows={HOLE} size={28} /> <span><b>{R.miss[0]}</b>{R.miss[1]}</span></li>
          <li><PixelSprite rows={PEEK} size={28} /> <span><b>{R.hit[0]}</b>{R.hit[1]}</span></li>
          <li><PixelSprite rows={STAR} className="legend-star" /> <span><b>{R.sunk[0]}</b>{R.sunk[1]}</span></li>
        </ul>
        <p>{R.win}</p>
        <h3>{R.h3}</h3>
        <ul>
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
            <li key={d}><b>{t.opp[d].name}</b> {R.opps[d]}</li>
          ))}
        </ul>
        <p>{R.fair}</p>
        <h3>{R.h4}</h3>
        <p>{R.save}</p>
        <p className="kbd-hint">{R.keys}</p>
      </div>
    </div>
  );
}
