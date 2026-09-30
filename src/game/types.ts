// Базовые типы игровой логики. Логика не знает ничего об интерфейсе (React, DOM).

export const SIZE = 10;

/** Состав «флота»: 1 сурок длиной 4, 2 — длиной 3, 3 — длиной 2, 4 — длиной 1 (классические правила). */
export const FLEET: number[] = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

export type Orientation = 'h' | 'v';

export interface Marmot {
  id: number;
  length: number;
  row: number;
  col: number;
  orientation: Orientation;
}

/** Результат одного «заглядывания в норку». */
export type ShotResult = 'miss' | 'hit' | 'sunk';

export interface Shot {
  row: number;
  col: number;
  result: ShotResult;
  /** id сурка, если попали */
  marmotId?: number;
}

export interface BoardState {
  marmots: Marmot[];
  /** Все выстрелы по этому полю (по порядку). */
  shots: Shot[];
}

/** То, что видит стреляющий о чужом поле: без скрытых позиций сурков. */
export type CellView = 'unknown' | 'miss' | 'hit' | 'sunk' | 'blocked';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type Turn = 'player' | 'ai';

export interface GameState {
  version: 1;
  id: string;
  difficulty: Difficulty;
  phase: 'setup' | 'battle' | 'over';
  player: BoardState;
  ai: BoardState;
  turn: Turn;
  winner: Turn | null;
  startedAt: number;
  finishedAt: number | null;
  /** Лог событий для истории/разбора: чей ход и куда. */
  log: { by: Turn; row: number; col: number; result: ShotResult }[];
}
