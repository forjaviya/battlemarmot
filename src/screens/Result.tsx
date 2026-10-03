import { useEffect } from 'react';
import { summarize } from '../game/engine';
import type { GameState } from '../game/types';
import { useI18n } from '../i18n';
import { Board } from '../ui/Board';
import { Marmot } from '../ui/Marmot';
import { sfx } from '../lib/sound';
import { Portrait } from '../ui/Portrait';

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function Result({ game, onAgain, onMenu, loggedIn, onLogin }: { game: GameState; onAgain: () => void; onMenu: () => void; loggedIn: boolean; onLogin: () => void }) {
  const s = summarize(game);
  const { t } = useI18n();
  const R = t.result;
  const opp = t.opp[game.difficulty];
  useEffect(() => { (s.won ? sfx.win : sfx.lose)(); }, [s.won]);

  return (
    <div className="screen result">
      <div className={`panel result-card ${s.won ? 'won' : 'lost'}`}>
        <div className="result-marmots">
          <Marmot length={1} orientation="v" className={s.won ? 'jump' : ''} />
          <Marmot length={2} orientation="v" className={s.won ? 'jump d1' : ''} />
          <span className="result-vs">vs</span>
          <Portrait who={game.difficulty} mood={s.won ? 'sad' : 'happy'} size={72} className="idle" />
        </div>
        <h2>{s.won ? R.won : R.lost(opp.name, opp.fem)}</h2>
        <p className="sub">{s.won ? R.subWon(opp.name) : R.subLost}</p>
        <div className="stat-row">
          <div><b>{s.shots}</b><span>{R.checked}</span></div>
          <div><b>{Math.round(s.accuracy * 100)}%</b><span>{R.accuracy}</span></div>
          <div><b>{fmtTime(s.durationSec)}</b><span>{R.time}</span></div>
        </div>
        <div className="result-actions">
          <button className="btn primary big" onClick={onAgain} autoFocus>{R.again}</button>
          <button className="btn" onClick={onMenu}>{R.toMenu}</button>
        </div>
        {!loggedIn && (
          <p className="save-hint">
            {R.saveA}<button className="link" onClick={onLogin}>{R.saveLink}</button>{R.saveB}
          </p>
        )}
      </div>
      {!s.won && (
        <div className="reveal">
          <h3>{R.reveal}</h3>
          <Board board={game.ai} kind="enemy" revealAll seed={7} compact label={R.revealLabel} />
        </div>
      )}
    </div>
  );
}
