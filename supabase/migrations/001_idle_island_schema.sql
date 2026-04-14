create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[A-Za-z0-9_]{3,18}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.player_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  gold integer not null default 500 check (gold >= 0),
  level integer not null default 1 check (level >= 1),
  army_power integer not null default 100 check (army_power >= 0),
  island_stage integer not null default 1 check (island_stage between 1 and 4),
  gold_generation_rate integer not null default 10 check (gold_generation_rate >= 0),
  last_collected_at timestamptz not null default now(),
  last_battle_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.battle_logs (
  id uuid primary key default gen_random_uuid(),
  attacker_user_id uuid not null references public.profiles(id) on delete cascade,
  defender_user_id uuid not null references public.profiles(id) on delete cascade,
  winner_user_id uuid not null references public.profiles(id) on delete cascade,
  attacker_score integer not null,
  defender_score integer not null,
  gold_reward integer not null default 50,
  created_at timestamptz not null default now(),
  check (attacker_user_id <> defender_user_id)
);

create index if not exists idx_player_state_leaderboard
  on public.player_state (army_power desc, level desc, user_id);

create index if not exists idx_battle_logs_attacker_created
  on public.battle_logs (attacker_user_id, created_at desc);

create index if not exists idx_battle_logs_defender_created
  on public.battle_logs (defender_user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_player_state_updated_at on public.player_state;
create trigger set_player_state_updated_at
before update on public.player_state
for each row execute function public.set_updated_at();

create or replace function public.calculate_island_stage(next_level integer)
returns integer
language sql
immutable
as $$
  select case
    when next_level >= 15 then 4
    when next_level >= 10 then 3
    when next_level >= 5 then 2
    else 1
  end;
$$;

create or replace view public.leaderboard_view as
select
  ps.user_id,
  p.username,
  ps.gold,
  ps.level,
  ps.army_power,
  ps.island_stage,
  p.created_at
from public.player_state ps
join public.profiles p on p.id = ps.user_id;

create or replace view public.battle_log_view as
select
  bl.id,
  bl.attacker_user_id,
  bl.defender_user_id,
  bl.winner_user_id,
  bl.attacker_score,
  bl.defender_score,
  bl.gold_reward,
  bl.created_at,
  attacker.username as attacker_username,
  defender.username as defender_username,
  winner.username as winner_username
from public.battle_logs bl
join public.profiles attacker on attacker.id = bl.attacker_user_id
join public.profiles defender on defender.id = bl.defender_user_id
join public.profiles winner on winner.id = bl.winner_user_id
where bl.attacker_user_id = auth.uid()
   or bl.defender_user_id = auth.uid();

alter table public.profiles enable row level security;
alter table public.player_state enable row level security;
alter table public.battle_logs enable row level security;

drop policy if exists "profiles are readable by signed in users" on public.profiles;
create policy "profiles are readable by signed in users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "players can update their own profile" on public.profiles;
create policy "players can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "players can read own state" on public.player_state;
create policy "players can read own state"
on public.player_state for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "players can update own state" on public.player_state;
create policy "players can update own state"
on public.player_state for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "players can read own battle logs" on public.battle_logs;
create policy "players can read own battle logs"
on public.battle_logs for select
to authenticated
using (attacker_user_id = auth.uid() or defender_user_id = auth.uid());

create or replace function public.create_player_profile(requested_username text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  clean_username text := trim(requested_username);
  profile_row public.profiles;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if clean_username !~ '^[A-Za-z0-9_]{3,18}$' then
    raise exception 'Username must use 3-18 letters, numbers, or underscores';
  end if;

  select * into profile_row
  from public.profiles
  where id = current_user_id;

  if found then
    return profile_row;
  end if;

  insert into public.profiles (id, username)
  values (current_user_id, clean_username)
  returning * into profile_row;

  insert into public.player_state (user_id)
  values (current_user_id);

  return profile_row;
end;
$$;

create or replace function public.collect_passive_gold()
returns public.player_state
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  state_row public.player_state;
  earned_gold integer;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into state_row
  from public.player_state
  where user_id = current_user_id
  for update;

  if not found then
    raise exception 'Player state not found';
  end if;

  earned_gold := floor(
    greatest(0, extract(epoch from (now() - state_row.last_collected_at)) / 60)
    * state_row.gold_generation_rate
  )::integer;

  update public.player_state
  set
    gold = gold + earned_gold,
    last_collected_at = now()
  where user_id = current_user_id
  returning * into state_row;

  return state_row;
end;
$$;

create or replace function public.upgrade_island()
returns public.player_state
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  state_row public.player_state;
  earned_gold integer;
  upgrade_cost integer;
  next_level integer;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into state_row
  from public.player_state
  where user_id = current_user_id
  for update;

  if not found then
    raise exception 'Player state not found';
  end if;

  earned_gold := floor(
    greatest(0, extract(epoch from (now() - state_row.last_collected_at)) / 60)
    * state_row.gold_generation_rate
  )::integer;

  state_row.gold := state_row.gold + earned_gold;
  upgrade_cost := 100 * state_row.level;

  if state_row.gold < upgrade_cost then
    raise exception 'Not enough gold';
  end if;

  next_level := state_row.level + 1;

  update public.player_state
  set
    gold = state_row.gold - upgrade_cost,
    level = next_level,
    army_power = state_row.army_power + 20,
    gold_generation_rate = state_row.gold_generation_rate + 5,
    island_stage = public.calculate_island_stage(next_level),
    last_collected_at = now()
  where user_id = current_user_id
  returning * into state_row;

  return state_row;
end;
$$;

create or replace function public.maybe_trigger_auto_battle()
returns public.battle_log_view
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  attacker_state public.player_state;
  defender_state public.player_state;
  battle_id uuid;
  attacker_final integer;
  defender_final integer;
  winner_id uuid;
  result_row public.battle_log_view;
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into attacker_state
  from public.player_state
  where user_id = current_user_id
  for update;

  if not found then
    raise exception 'Player state not found';
  end if;

  if attacker_state.last_battle_at is not null
     and attacker_state.last_battle_at > now() - interval '30 minutes' then
    return null;
  end if;

  select * into defender_state
  from public.player_state
  where user_id <> current_user_id
  order by random()
  limit 1;

  if not found then
    update public.player_state
    set last_battle_at = now()
    where user_id = current_user_id;
    return null;
  end if;

  attacker_final := attacker_state.army_power + floor(random() * 31)::integer;
  defender_final := defender_state.army_power + floor(random() * 31)::integer;
  winner_id := case
    when attacker_final >= defender_final then current_user_id
    else defender_state.user_id
  end;

  insert into public.battle_logs (
    attacker_user_id,
    defender_user_id,
    winner_user_id,
    attacker_score,
    defender_score,
    gold_reward
  )
  values (
    current_user_id,
    defender_state.user_id,
    winner_id,
    attacker_final,
    defender_final,
    50
  )
  returning id into battle_id;

  update public.player_state
  set gold = gold + 50
  where user_id = winner_id;

  update public.player_state
  set last_battle_at = now()
  where user_id = current_user_id;

  select * into result_row
  from public.battle_log_view
  where id = battle_id;

  return result_row;
end;
$$;

grant usage on schema public to anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.player_state from anon, authenticated;
revoke all on public.battle_logs from anon, authenticated;
grant select on public.leaderboard_view to authenticated;
grant select on public.battle_log_view to authenticated;
grant select on public.profiles to authenticated;
grant update (username) on public.profiles to authenticated;
grant select on public.player_state to authenticated;
grant select on public.battle_logs to authenticated;
grant execute on function public.create_player_profile(text) to authenticated;
grant execute on function public.collect_passive_gold() to authenticated;
grant execute on function public.upgrade_island() to authenticated;
grant execute on function public.maybe_trigger_auto_battle() to authenticated;
