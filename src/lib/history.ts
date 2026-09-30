// История партий: у гостя — в браузере, у вошедшего пользователя — в базе Supabase
// (видна с любого устройства). Партии, сыгранные гостем, переносятся в аккаунт при входе.

import type { GameSummary } from '../game/engine';
import type { Difficulty } from '../game/types';
import { loadLocalHistory, saveLocalHistory, type LocalGame } from './storage';
import { supabase } from './supabase';

interface Row {
  id: string;
  user_id: string;
  difficulty: Difficulty;
  won: boolean;
  shots: number;
  hits: number;
  duration_sec: number;
  finished_at: string;
}

const toRow = (g: GameSummary, userId: string): Row => ({
  id: g.id,
  user_id: userId,
  difficulty: g.difficulty,
  won: g.won,
  shots: g.shots,
  hits: g.hits,
  duration_sec: g.durationSec,
  finished_at: new Date(g.finishedAt).toISOString(),
});

const fromRow = (r: Row): GameSummary => ({
  id: r.id,
  difficulty: r.difficulty,
  won: r.won,
  shots: r.shots,
  hits: r.hits,
  accuracy: r.shots ? r.hits / r.shots : 0,
  durationSec: r.duration_sec,
  finishedAt: new Date(r.finished_at).getTime(),
});

export async function recordGame(g: GameSummary, userId: string | null) {
  const local = loadLocalHistory();
  if (local.some((x) => x.id === g.id)) return;
  let synced = false;
  if (supabase && userId) {
    const { error } = await supabase.from('games').upsert(toRow(g, userId));
    synced = !error;
  }
  saveLocalHistory([{ ...g, synced }, ...local]);
}

/** При входе: отправляем в аккаунт партии, сыгранные без входа. */
export async function syncLocal(userId: string) {
  if (!supabase) return;
  const local = loadLocalHistory();
  const pending = local.filter((g) => !g.synced);
  if (!pending.length) return;
  const { error } = await supabase.from('games').upsert(pending.map((g) => toRow(g, userId)));
  if (!error) saveLocalHistory(local.map((g) => ({ ...g, synced: true })));
}

export async function fetchHistory(userId: string | null): Promise<{ games: GameSummary[]; source: 'cloud' | 'local'; error?: string }> {
  if (supabase && userId) {
    const { data, error } = await supabase.from('games').select('*').order('finished_at', { ascending: false }).limit(500);
    if (!error && data) return { games: (data as Row[]).map(fromRow), source: 'cloud' };
    return { games: loadLocalHistory(), source: 'local', error: error?.message };
  }
  return { games: loadLocalHistory() as LocalGame[], source: 'local' };
}

export interface Stats {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  accuracy: number;
  bestShots: number | null;
  streak: number;
  bestStreak: number;
  byDifficulty: Record<Difficulty, { total: number; wins: number }>;
}

export function computeStats(games: GameSummary[]): Stats {
  const sorted = [...games].sort((a, b) => a.finishedAt - b.finishedAt);
  let streak = 0, bestStreak = 0;
  for (const g of sorted) {
    streak = g.won ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  const wins = games.filter((g) => g.won).length;
  const shots = games.reduce((s, g) => s + g.shots, 0);
  const hits = games.reduce((s, g) => s + g.hits, 0);
  const winShots = games.filter((g) => g.won).map((g) => g.shots);
  const byDifficulty = { easy: { total: 0, wins: 0 }, normal: { total: 0, wins: 0 }, hard: { total: 0, wins: 0 } };
  for (const g of games) {
    byDifficulty[g.difficulty].total++;
    if (g.won) byDifficulty[g.difficulty].wins++;
  }
  return {
    total: games.length,
    wins,
    losses: games.length - wins,
    winRate: games.length ? wins / games.length : 0,
    accuracy: shots ? hits / shots : 0,
    bestShots: winShots.length ? Math.min(...winShots) : null,
    streak,
    bestStreak,
    byDifficulty,
  };
}
