import { useCallback, useEffect, useRef, useState } from 'react';
import { newGame, startBattle, summarize } from './game/engine';
import type { Difficulty, GameState } from './game/types';
import { loadGame, saveGame, saveLayout } from './lib/storage';
import { recordGame } from './lib/history';
import { signOut, useAuth } from './lib/auth';
import { isMuted, setMuted, sfx } from './lib/sound';
import { APP_NAME } from './config';
import { Home } from './screens/Home';
import { Setup } from './screens/Setup';
import { Battle } from './screens/Battle';
import { Result } from './screens/Result';
import { Stats } from './screens/Stats';
import { Rules } from './screens/Rules';
import { AuthModal } from './screens/AuthModal';

type Screen = 'home' | 'setup' | 'battle' | 'result' | 'stats' | 'rules';

export default function App() {
  const [game, setGameState] = useState<GameState | null>(() => loadGame());
  const [screen, setScreen] = useState<Screen>('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const { user, nickname, enabled: authEnabled } = useAuth();
  const recorded = useRef<string | null>(null);

  // Каждое изменение партии сохраняется локально → после обновления страницы можно продолжить
  const setGame = useCallback((g: GameState | null) => {
    setGameState(g);
    saveGame(g && g.phase !== 'over' ? g : null);
  }, []);

  // Завершённую партию записываем в историю (один раз)
  useEffect(() => {
    if (game?.phase === 'over' && recorded.current !== game.id) {
      recorded.current = game.id;
      void recordGame(summarize(game), user?.id ?? null);
      const t = setTimeout(() => setScreen('result'), 900);
      return () => clearTimeout(t);
    }
  }, [game, user]);

  useEffect(() => {
    document.title = screen === 'battle' ? `${APP_NAME} — партия` : `${APP_NAME} — прятки сурков`;
    window.scrollTo({ top: 0 });
  }, [screen]);

  const start = (d: Difficulty) => {
    setGame(newGame(d));
    setScreen('setup');
  };

  const canResume = !!game && game.phase === 'battle';

  return (
    <div className="app">
      <div className="sky" aria-hidden>
        <div className="sun" />
        <div className="cloud c1" />
        <div className="cloud c2" />
        <div className="hills" />
      </div>
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')}>{APP_NAME}</button>
        <div className="top-actions">
          <button
            className="icon-btn"
            aria-label={muted ? 'Включить звук' : 'Выключить звук'}
            onClick={() => { setMuted(!muted); setMutedState(!muted); if (muted) sfx.click(); }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {authEnabled && (user ? (
            <div className="user">
              <span className="nick">👤 {nickname}</span>
              <button className="btn ghost small" onClick={() => signOut()}>Выйти</button>
            </div>
          ) : (
            <button className="btn small" onClick={() => setAuthOpen(true)}>Войти</button>
          ))}
        </div>
      </header>

      <main>
        {screen === 'home' && (
          <Home canResume={canResume} onResume={() => setScreen('battle')} onNew={start} onStats={() => setScreen('stats')} onRules={() => setScreen('rules')} />
        )}
        {screen === 'setup' && game && (
          <Setup
            difficulty={game.difficulty}
            onBack={() => setScreen('home')}
            onStart={(marmots) => {
              saveLayout(marmots);
              setGame(startBattle(game, marmots));
              setScreen('battle');
            }}
          />
        )}
        {screen === 'battle' && game && <Battle game={game} setGame={setGame} onExit={() => setScreen('home')} />}
        {screen === 'result' && game && (
          <Result game={game} loggedIn={!!user || !authEnabled} onLogin={() => setAuthOpen(true)} onAgain={() => start(game.difficulty)} onMenu={() => setScreen('home')} />
        )}
        {screen === 'stats' && <Stats userId={user?.id ?? null} nickname={nickname} onBack={() => setScreen('home')} onLogin={() => setAuthOpen(true)} />}
        {screen === 'rules' && <Rules onBack={() => setScreen('home')} />}
      </main>

      <footer className="foot">
        {APP_NAME} · прятки сурков · сделано для Narxoz Incubator 2026
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
