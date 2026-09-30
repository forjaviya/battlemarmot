import { useEffect, useState } from 'react';
import { OPPONENTS } from '../config';
import type { GameSummary } from '../game/engine';
import type { Difficulty } from '../game/types';
import { computeStats, fetchHistory } from '../lib/history';
import { Portrait } from '../ui/Portrait';

const fmtDate = (t: number) => new Date(t).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function Stats({ userId, nickname, onBack, onLogin }: { userId: string | null; nickname: string | null; onBack: () => void; onLogin: () => void }) {
  const [games, setGames] = useState<GameSummary[] | null>(null);
  const [source, setSource] = useState<'cloud' | 'local'>('local');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let alive = true;
    fetchHistory(userId).then((r) => { if (alive) { setGames(r.games); setSource(r.source); setError(r.error); } });
    return () => { alive = false; };
  }, [userId]);

  const st = games ? computeStats(games) : null;

  return (
    <div className="screen stats">
      <div className="screen-head">
        <button className="btn ghost small" onClick={onBack}>Меню</button>
        <h2>Статистика{nickname ? `: ${nickname}` : ''}</h2>
      </div>
      <p className="hint">
        {source === 'cloud' ? 'Данные аккаунта - видны на любом устройстве.' : <>Данные этого устройства. {!userId && <button className="link" onClick={onLogin}>Войди</button>}{!userId && ', чтобы сохранять в облако.'}</>}
        {error && <span className="err"> (облако недоступно: {error})</span>}
      </p>
      {!st ? (
        <div className="panel">Загружаем…</div>
      ) : st.total === 0 ? (
        <div className="panel empty">Пока ни одной партии. Самое время сыграть первую!</div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="panel card"><b>{st.total}</b><span>партий</span></div>
            <div className="panel card"><b>{st.wins}</b><span>побед</span></div>
            <div className="panel card"><b>{Math.round(st.winRate * 100)}%</b><span>побед</span></div>
            <div className="panel card"><b>{Math.round(st.accuracy * 100)}%</b><span>точность</span></div>
            <div className="panel card"><b>{st.bestShots ?? '-'}</b><span>рекорд (норок за победу)</span></div>
            <div className="panel card"><b>{st.streak}</b><span>серия побед (лучшая {st.bestStreak})</span></div>
          </div>
          <div className="panel">
            <h3>По соперникам</h3>
            <div className="opp-cards">
              {(Object.keys(OPPONENTS) as Difficulty[]).map((d) => {
                const x = st.byDifficulty[d];
                const pct = x.total ? Math.round((x.wins / x.total) * 100) : 0;
                const mood = !x.total ? 'neutral' : pct >= 60 ? 'worried' : pct >= 40 ? 'alert' : 'smug';
                return (
                  <div key={d} className={`opp-card opp-${d}`}>
                    <Portrait who={d} mood={mood} size={64} className="idle" />
                    <div className="oc-body">
                      <span className="oc-name">{OPPONENTS[d].name}</span>
                      {x.total ? (
                        <>
                          <span className="oc-score"><b>{x.wins}</b> {x.wins === 1 ? 'победа' : x.wins >= 2 && x.wins <= 4 ? 'победы' : 'побед'} из <b>{x.total}</b></span>
                        </>
                      ) : (
                        <span className="oc-sub">ещё не играли</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel">
            <h3>История партий</h3>
            <div className="history">
              {games!.slice(0, 30).map((g) => (
                <div key={g.id} className={`h-row ${g.won ? 'w' : 'l'}`}>
                  <span className="h-res">{g.won ? 'Победа' : 'Поражение'}</span>
                  <span className="h-opp">{OPPONENTS[g.difficulty].name}</span>
                  <span className="h-shots">{g.shots} норок · {Math.round(g.accuracy * 100)}%</span>
                  <span className="h-time">{fmtTime(g.durationSec)}</span>
                  <span className="h-date">{fmtDate(g.finishedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
