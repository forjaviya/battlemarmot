import { chooseShot } from './ai';
import { allSunk, fire, publicView, randomFleet, remainingLengths } from './board';
import type { Difficulty, GameState, Marmot, ShotResult } from './types';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function newGame(difficulty: Difficulty): GameState {
  return {
    version: 1,
    id: uid(),
    difficulty,
    phase: 'setup',
    player: { marmots: [], shots: [] },
    ai: { marmots: randomFleet(), shots: [] },
    turn: 'player',
    winner: null,
    startedAt: Date.now(),
    finishedAt: null,
    log: [],
  };
}

export function startBattle(state: GameState, marmots: Marmot[]): GameState {
  return { ...state, phase: 'battle', player: { marmots, shots: [] }, turn: 'player', startedAt: Date.now() };
}

/**
 * Ход игрока. По классическим правилам после попадания ход остаётся у того же игрока.
 * Возвращает null, если ход недопустим (не его очередь, клетка уже открыта).
 */
export function playerShoot(state: GameState, r: number, c: number): { state: GameState; result: ShotResult } | null {
  if (state.phase !== 'battle' || state.turn !== 'player') return null;
  const res = fire(state.ai, r, c);
  if (!res) return null;
  let next: GameState = { ...state, ai: res.board, log: [...state.log, { by: 'player', row: r, col: c, result: res.result }] };
  if (allSunk(next.ai)) next = { ...next, phase: 'over', winner: 'player', finishedAt: Date.now() };
  else if (res.result === 'miss') next = { ...next, turn: 'ai' };
  return { state: next, result: res.result };
}

/** Ход компьютера: он видит только publicView поля игрока. */
export function aiShoot(state: GameState): { state: GameState; result: ShotResult; row: number; col: number } | null {
  if (state.phase !== 'battle' || state.turn !== 'ai') return null;
  const view = publicView(state.player);
  const [r, c] = chooseShot(view, remainingLengths(state.player), state.difficulty);
  const res = fire(state.player, r, c);
  if (!res) return null;
  let next: GameState = { ...state, player: res.board, log: [...state.log, { by: 'ai', row: r, col: c, result: res.result }] };
  if (allSunk(next.player)) next = { ...next, phase: 'over', winner: 'ai', finishedAt: Date.now() };
  else if (res.result === 'miss') next = { ...next, turn: 'player' };
  return { state: next, result: res.result, row: r, col: c };
}

export interface GameSummary {
  id: string;
  difficulty: Difficulty;
  won: boolean;
  shots: number;
  hits: number;
  accuracy: number; // 0..1
  durationSec: number;
  finishedAt: number;
}

export function summarize(state: GameState): GameSummary {
  const mine = state.log.filter((l) => l.by === 'player');
  const hits = mine.filter((l) => l.result !== 'miss').length;
  return {
    id: state.id,
    difficulty: state.difficulty,
    won: state.winner === 'player',
    shots: mine.length,
    hits,
    accuracy: mine.length ? hits / mine.length : 0,
    durationSec: Math.round(((state.finishedAt ?? Date.now()) - state.startedAt) / 1000),
    finishedAt: state.finishedAt ?? Date.now(),
  };
}
