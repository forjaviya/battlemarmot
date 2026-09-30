import { useEffect, useRef, useState } from 'react';
import { aiShoot, playerShoot } from '../game/engine';
import { isSunk } from '../game/board';
import { COLS, Board } from '../ui/Board';
import { Marmot } from '../ui/Marmot';
import type { BoardState, GameState, ShotResult } from '../game/types';
import { OPPONENTS } from '../config';
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

const PHRASES: Record<ShotResult, string[]> = {
  miss: ['Пусто!', 'Только ветер…', 'Тут никого', 'Мимо норки'],
  hit: ['Попался!', 'Ой, чей-то хвостик!', 'Кто-то тут есть!'],
  sunk: ['Сурок найден!', 'Вот он, пушистый!', 'Попался целиком!'],
};
const say = (r: ShotResult) => PHRASES[r][Math.floor(Math.random() * PHRASES[r].length)];

export function Battle({ game, setGame, onExit }: { game: GameState; setGame: (g: GameState) => void; onExit: () => void }) {
  const opp = OPPONENTS[game.difficulty];
  const [msg, setMsg] = useState<string>(game.turn === 'player' ? 'Твой ход — загляни в норку соседа' : `${opp.name} ищет…`);
  const [lastPlayer, setLastPlayer] = useState<{ row: number; col: number } | null>(null);
  const [lastAi, setLastAi] = useState<{ row: number; col: number } | null>(null);
  const [mobileView, setMobileView] = useState<'enemy' | 'own'>('enemy');
  const gameRef = useRef(game);
  gameRef.current = game;

  // Ход компьютера (с задержкой, чтобы было видно, что он «думает»)
  useEffect(() => {
    if (game.phase !== 'battle' || game.turn !== 'ai') return;
    setMsg(`${opp.name} ищет…`);
    const t = setTimeout(() => {
      const res = aiShoot(gameRef.current);
      if (!res) return;
      setLastAi({ row: res.row, col: res.col });
      const where = `${COLS[res.col]}${res.row + 1}`;
      if (res.result === 'miss') { sfx.miss(); setMsg(`${where} — пусто. Твой ход!`); }
      else if (res.result === 'hit') { sfx.hit(); setMsg(`${opp.fem ? 'Нашла' : 'Нашёл'} хвостик на ${where}!`); setMobileView('own'); }
      else { sfx.found(); setMsg(`${opp.fem ? 'Нашла' : 'Нашёл'} твоего сурка на ${where}!`); setMobileView('own'); }
      setGame(res.state);
    }, game.log[game.log.length - 1]?.by === 'ai' && game.log[game.log.length - 1]?.result === 'sunk' ? AI_DELAY + 1000 : AI_DELAY);
    return () => clearTimeout(t);
  }, [game, opp.name, setGame]);

  // На телефоне: когда ход вернулся к игроку — через секунду показываем поле соседа
  useEffect(() => {
    if (game.turn !== 'player' || game.phase !== 'battle') return;
    const t = setTimeout(() => setMobileView('enemy'), 1100);
    return () => clearTimeout(t);
  }, [game.turn, game.phase]);

  const shoot = (r: number, c: number) => {
    const res = playerShoot(game, r, c);
    if (!res) return;
    setLastPlayer({ row: r, col: c });
    if (res.result === 'miss') { sfx.miss(); setMsg(`${COLS[c]}${r + 1}: ${say('miss')}`); }
    else if (res.result === 'hit') { sfx.hit(); setMsg(`${COLS[c]}${r + 1}: ${say('hit')} Ищи рядом — ходи ещё.`); }
    else { sfx.found(); setMsg(`${say('sunk')} Ходи ещё.`); }
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
        <button className="btn ghost small" onClick={onExit}>Меню</button>
      </div>
      <div className="msg panel" aria-live="polite">
        <Portrait who={game.difficulty} mood={mood} size={64} thinking={game.turn === 'ai' && game.phase === 'battle'} className="idle" />
        <div className="msg-text">
          <span>{msg}</span>
        </div>
      </div>

      <div className="mobile-tabs">
        <button className={mobileView === 'enemy' ? 'on' : ''} onClick={() => setMobileView('enemy')}>Поле соседа</button>
        <button className={mobileView === 'own' ? 'on' : ''} onClick={() => setMobileView('own')}>Мои сурки</button>
      </div>

      <div className={`battle-grid show-${mobileView}`}>
        <section className="side enemy-side">
          <h3>Норки соперника <small>({opp.name}, {opp.level.toLowerCase()})</small></h3>
          <Board board={game.ai} kind="enemy" label="Поле соперника" onCell={shoot} disabled={!myTurn} lastShot={lastPlayer} seed={7} />
          <FleetLeft board={game.ai} title="Ещё прячутся:" />
        </section>
        <section className="side own-side">
          <h3>Мои сурки</h3>
          <Board board={game.player} kind="own" label="Твоё поле" lastShot={lastAi} seed={1} compact />
          <FleetLeft board={game.player} title="Не найдены:" />
        </section>
      </div>
    </div>
  );
}
