import { useEffect, useRef, useState } from 'react';
import { aiShoot, playerShoot } from '../game/engine';
import { isSunk } from '../game/board';
import { Board } from '../ui/Board';
import { Marmot } from '../ui/Marmot';
import type { BoardState, GameState, ShotResult } from '../game/types';
import { useI18n, type Dict } from '../i18n';
import { sfx } from '../lib/sound';
import { Portrait, moodFor } from '../ui/Portrait';

const AI_DELAY = 750;

function FleetLeft({ board, title }: { board: BoardState; title: string }) {
  const sorted = [...board.marmots].sort((a, b) => b.length - a.length);
  return (
    <div className="fleet-left">
      <span className="fl-title">{title}</span>
      <div className="fl-items">
        {sorted.map((m) => (
          <div key={m.id} className={`fl-item ${isSunk(board, m) ? 'gone' : ''}`} style={{ width: `${m.length * 14}px` }}>
            <Marmot length={m.length} orientation="h" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Случайная фраза; индекс выбирается один раз, а текст берётся на текущем языке. */
const pick = (r: ShotResult) => {
  const k = Math.floor(Math.random() * 1000);
  return (t: Dict) => t.battle.phrases[r][k % t.battle.phrases[r].length];
};
type Msg = (t: Dict) => string;
const cellName = (t: Dict, r: number, c: number) => `${t.cols[c]}${r + 1}`;

export function Battle({ game, setGame, onExit }: { game: GameState; setGame: (g: GameState) => void; onExit: () => void }) {
  const { t } = useI18n();
  const opp = t.opp[game.difficulty];
  const [msg, setMsg] = useState<Msg>(() => (game.turn === 'player' ? (tt: Dict) => tt.battle.yourTurn : (tt: Dict) => tt.battle.searching(tt.opp[game.difficulty].name)));
  const [lastPlayer, setLastPlayer] = useState<{ row: number; col: number } | null>(null);
  const [lastAi, setLastAi] = useState<{ row: number; col: number } | null>(null);
  const [mobileView, setMobileView] = useState<'enemy' | 'own'>('enemy');
  const gameRef = useRef(game);
  gameRef.current = game;

  // Ход компьютера (с задержкой, чтобы было видно, что он «думает»)
  useEffect(() => {
    if (game.phase !== 'battle' || game.turn !== 'ai') return;
    const d = game.difficulty;
    setMsg(() => (tt: Dict) => tt.battle.searching(tt.opp[d].name));
    const timer = setTimeout(() => {
      const res = aiShoot(gameRef.current);
      if (!res) return;
      setLastAi({ row: res.row, col: res.col });
      const { row, col } = res;
      if (res.result === 'miss') { sfx.miss(); setMsg(() => (tt: Dict) => tt.battle.aiMiss(cellName(tt, row, col))); }
      else if (res.result === 'hit') { sfx.hit(); setMsg(() => (tt: Dict) => tt.battle.aiHit(cellName(tt, row, col), tt.opp[d].fem)); setMobileView('own'); }
      else { sfx.found(); setMsg(() => (tt: Dict) => tt.battle.aiSunk(cellName(tt, row, col), tt.opp[d].fem)); setMobileView('own'); }
      setGame(res.state);
    }, game.log[game.log.length - 1]?.by === 'ai' && game.log[game.log.length - 1]?.result === 'sunk' ? AI_DELAY + 1000 : AI_DELAY);
    return () => clearTimeout(timer);
  }, [game, setGame]);

  // На телефоне: когда ход вернулся к игроку - через секунду показываем поле соперника
  useEffect(() => {
    if (game.turn !== 'player' || game.phase !== 'battle') return;
    const t = setTimeout(() => setMobileView('enemy'), 1100);
    return () => clearTimeout(t);
  }, [game.turn, game.phase]);

  const shoot = (r: number, c: number) => {
    const res = playerShoot(game, r, c);
    if (!res) return;
    setLastPlayer({ row: r, col: c });
    const p = pick(res.result);
    if (res.result === 'miss') { sfx.miss(); setMsg(() => (tt: Dict) => tt.battle.playerMiss(cellName(tt, r, c), p(tt))); }
    else if (res.result === 'hit') { sfx.hit(); setMsg(() => (tt: Dict) => tt.battle.playerHit(cellName(tt, r, c), p(tt))); }
    else { sfx.found(); setMsg(() => (tt: Dict) => tt.battle.playerSunk(p(tt))); }
    setGame(res.state);
  };

  const myTurn = game.turn === 'player' && game.phase === 'battle';
  const playerFound = game.log.filter((l) => l.by === 'player' && l.result !== 'miss').length;
  const aiFound = game.log.filter((l) => l.by === 'ai' && l.result !== 'miss').length;
  const lastAiLog = [...game.log].reverse().find((l) => l.by === 'ai');
  const lastAiHit = !!lastAiLog && lastAiLog.result !== 'miss' && game.log[game.log.length - 1]?.by === 'ai';
  const mood = moodFor({ playerFound, aiFound, turn: game.turn, lastAiHit, over: game.phase === 'over', playerWon: game.winner === 'player' });

  return (
    <div className="screen battle">
      <div className="screen-head">
        <button className="btn ghost small" onClick={onExit}>{t.menu}</button>
      </div>
      <div className="msg panel" aria-live="polite">
        <Portrait who={game.difficulty} mood={mood} size={64} thinking={game.turn === 'ai' && game.phase === 'battle'} className="idle" />
        <div className="msg-text">
          <span>{msg(t)}</span>
        </div>
      </div>

      <div className="mobile-tabs">
        <button className={mobileView === 'enemy' ? 'on' : ''} onClick={() => setMobileView('enemy')}>{t.battle.tabEnemy}</button>
        <button className={mobileView === 'own' ? 'on' : ''} onClick={() => setMobileView('own')}>{t.battle.tabOwn}</button>
      </div>

      <div className={`battle-grid show-${mobileView}`}>
        <section className="side enemy-side">
          <h3>{t.battle.enemyTitle} <small>({opp.name}, {opp.level.toLowerCase()})</small></h3>
          <Board board={game.ai} kind="enemy" label={t.battle.enemyField} onCell={shoot} disabled={!myTurn} lastShot={lastPlayer} seed={7} />
          <FleetLeft board={game.ai} title={t.battle.stillHiding} />
        </section>
        <section className="side own-side">
          <h3>{t.battle.ownTitle}</h3>
          <Board board={game.player} kind="own" label={t.setup.yourField} lastShot={lastAi} seed={1} compact />
          <FleetLeft board={game.player} title={t.battle.notFound} />
        </section>
      </div>
    </div>
  );
}
