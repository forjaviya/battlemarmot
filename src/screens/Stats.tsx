import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import type { GameSummary } from '../game/engine';
import type { Difficulty } from '../game/types';
import { computeStats, fetchHistory } from '../lib/history';
import { Portrait } from '../ui/Portrait';

const fmtDate = (t: number, locale: string) => new Date(t).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function Stats({ userId, nickname, onBack, onLogin }: { userId: string | null; nickname: string | null; onBack: () => void; onLogin: () => void }) {
  const { t } = useI18n();
  const T = t.stats;
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
        <button className="btn ghost small" onClick={onBack}>{t.menu}</button>
        <h2>{T.title}{nickname ? `: ${nickname}` : ''}</h2>
      </div>
      <p className="hint">
        {source === 'cloud' ? T.cloud : <>{T.local} {!userId && <button className="link" onClick={onLogin}>{T.loginLink}</button>}{!userId && T.loginTail}</>}
        {error && <span className="err">{T.cloudError(error)}</span>}
      </p>
      {!st ? (
        <div className="panel">{T.loading}</div>
      ) : st.total === 0 ? (
        <div className="panel empty">{T.empty}</div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="panel card"><b>{st.total}</b><span>{T.games}</span></div>
            <div className="panel card"><b>{st.wins}</b><span>{T.wins}</span></div>
            <div className="panel card"><b>{Math.round(st.winRate * 100)}%</b><span>{T.winRate}</span></div>
            <div className="panel card"><b>{Math.round(st.accuracy * 100)}%</b><span>{T.accuracy}</span></div>
            <div className="panel card"><b>{st.bestShots ?? '-'}</b><span>{T.record}</span></div>
            <div className="panel card"><b>{st.streak}</b><span>{T.streak(st.bestStreak)}</span></div>
          </div>
          <div className="panel">
            <h3>{T.byOpp}</h3>
            <div className="opp-cards">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => {
                const x = st.byDifficulty[d];
                const pct = x.total ? Math.round((x.wins / x.total) * 100) : 0;
                const mood = !x.total ? 'neutral' : pct >= 60 ? 'worried' : pct >= 40 ? 'alert' : 'smug';
                return (
                  <div key={d} className={`opp-card opp-${d}`}>
                    <Portrait who={d} mood={mood} size={64} className="idle" />
                    <div className="oc-body">
                      <span className="oc-name">{t.opp[d].name}</span>
                      {x.total ? (
                        <>
                          <span className="oc-score"><b>{x.wins}</b> {T.score(x.wins)} {T.of} <b>{x.total}</b></span>
                        </>
                      ) : (
                        <span className="oc-sub">{T.notPlayed}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel">
            <h3>{T.history}</h3>
            <div className="history">
              {games!.slice(0, 30).map((g) => (
                <div key={g.id} className={`h-row ${g.won ? 'w' : 'l'}`}>
                  <span className="h-res">{g.won ? T.win : T.loss}</span>
                  <span className="h-opp">{t.opp[g.difficulty].name}</span>
                  <span className="h-shots">{T.burrows(g.shots)} · {Math.round(g.accuracy * 100)}%</span>
                  <span className="h-time">{fmtTime(g.durationSec)}</span>
                  <span className="h-date">{fmtDate(g.finishedAt, t.dateLocale)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
