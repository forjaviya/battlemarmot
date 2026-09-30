import { useEffect } from 'react';
import { summarize } from '../game/engine';
import type { GameState } from '../game/types';
import { OPPONENTS } from '../config';
import { Board } from '../ui/Board';
import { Marmot } from '../ui/Marmot';
import { sfx } from '../lib/sound';

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function Result({ game, onAgain, onMenu, loggedIn, onLogin }: { game: GameState; onAgain: () => void; onMenu: () => void; loggedIn: boolean; onLogin: () => void }) {
  const s = summarize(game);
  const opp = OPPONENTS[game.difficulty];
  useEffect(() => { (s.won ? sfx.win : sfx.lose)(); }, [s.won]);

  return (
    <div className="screen result">
      <div className={`panel result-card ${s.won ? 'won' : 'lost'}`}>
        <div className="result-marmots">
          <Marmot length={1} orientation="v" className={s.won ? 'jump' : ''} />
          <Marmot length={2} orientation="v" className={s.won ? 'jump d1' : ''} />
          <Marmot length={1} orientation="v" className={s.won ? 'jump d2' : ''} />
        </div>
        <h2>{s.won ? 'Все сурки найдены!' : `${opp.name} оказался быстрее`}</h2>
        <p className="sub">{s.won ? `Ты перехитрил(а) соперника «${opp.name}»` : 'Сурки соседа ещё прячутся — но реванш всегда возможен'}</p>
        <div className="stat-row">
          <div><b>{s.shots}</b><span>норок проверено</span></div>
          <div><b>{Math.round(s.accuracy * 100)}%</b><span>точность</span></div>
          <div><b>{fmtTime(s.durationSec)}</b><span>время</span></div>
        </div>
        <div className="result-actions">
          <button className="btn primary big" onClick={onAgain} autoFocus>Давай ещё одну!</button>
          <button className="btn" onClick={onMenu}>В меню</button>
        </div>
        {!loggedIn && (
          <p className="save-hint">
            Результат сохранён на этом устройстве. <button className="link" onClick={onLogin}>Войди</button>, чтобы видеть статистику с телефона и компьютера.
          </p>
        )}
      </div>
      {!s.won && (
        <div className="reveal">
          <h3>Где прятались сурки соседа</h3>
          <Board board={game.ai} kind="enemy" revealAll seed={7} compact label="Поле соперника (открыто)" />
        </div>
      )}
    </div>
  );
}
