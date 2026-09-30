// Локальное сохранение: текущая партия (можно продолжить после обновления страницы),
// последняя расстановка и история для гостя.

import type { GameSummary } from '../game/engine';
import type { GameState, Marmot } from '../game/types';

const K_GAME = 'battlemarmot.game.v1';
const K_LAYOUT = 'battlemarmot.layout.v1';
const K_HISTORY = 'battlemarmot.history.v1';

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, v: unknown) {
  try {
    if (v === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch { /* приватный режим и т.п. - игра работает и без сохранения */ }
}

export const loadGame = () => {
  const g = read<GameState>(K_GAME);
  return g && g.version === 1 ? g : null;
};
export const saveGame = (g: GameState | null) => write(K_GAME, g);

export const loadLayout = () => read<Marmot[]>(K_LAYOUT);
export const saveLayout = (m: Marmot[]) => write(K_LAYOUT, m);

export type LocalGame = GameSummary & { synced?: boolean };
export const loadLocalHistory = () => read<LocalGame[]>(K_HISTORY) ?? [];
export const saveLocalHistory = (h: LocalGame[]) => write(K_HISTORY, h.slice(0, 200));
