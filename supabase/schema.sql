-- Схема базы для «Суыр». Выполнить один раз в Supabase → SQL Editor → New query → Run.

create table if not exists public.games (
  id           text primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  difficulty   text not null check (difficulty in ('easy', 'normal', 'hard')),
  won          boolean not null,
  shots        int not null check (shots >= 0),
  hits         int not null check (hits >= 0),
  duration_sec int not null check (duration_sec >= 0),
  finished_at  timestamptz not null default now()
);

create index if not exists games_user_finished_idx on public.games (user_id, finished_at desc);

-- Row Level Security: каждый видит и пишет только свои партии
alter table public.games enable row level security;

drop policy if exists "own games: read" on public.games;
create policy "own games: read" on public.games
  for select using (auth.uid() = user_id);

drop policy if exists "own games: insert" on public.games;
create policy "own games: insert" on public.games
  for insert with check (auth.uid() = user_id);

drop policy if exists "own games: update" on public.games;
create policy "own games: update" on public.games
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
