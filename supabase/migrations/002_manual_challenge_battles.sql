create or replace function public.challenge_player_battle(defender_user_id uuid)
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

  if defender_user_id is null then
    raise exception 'Choose a player to challenge';
  end if;

  if defender_user_id = current_user_id then
    raise exception 'You cannot challenge your own island';
  end if;

  select * into attacker_state
  from public.player_state
  where user_id = current_user_id
  for update;

  if not found then
    raise exception 'Player state not found';
  end if;

  select * into defender_state
  from public.player_state
  where user_id = defender_user_id;

  if not found then
    raise exception 'That rival island is no longer available';
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
    75
  )
  returning id into battle_id;

  update public.player_state
  set gold = gold + 75
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

grant execute on function public.challenge_player_battle(uuid) to authenticated;

notify pgrst, 'reload schema';
