import { supabase } from '../lib/supabase';
import type { BattleLog, DashboardData, LeaderboardEntry, PlayerState, Profile } from '../types/game';

export async function fetchDashboardData(): Promise<DashboardData> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('You need to log in first.');

  const [profileResult, stateResult, battlesResult, leaderboardResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('player_state').select('*').eq('user_id', user.id).single(),
    supabase.from('battle_log_view').select('*').order('created_at', { ascending: false }).limit(5),
    supabase
      .from('leaderboard_view')
      .select('*')
      .order('army_power', { ascending: false })
      .order('level', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (stateResult.error) throw stateResult.error;
  if (battlesResult.error) throw battlesResult.error;
  if (leaderboardResult.error) throw leaderboardResult.error;

  return {
    profile: profileResult.data as Profile,
    state: stateResult.data as PlayerState,
    battleLogs: (battlesResult.data ?? []) as BattleLog[],
    leaderboard: (leaderboardResult.data ?? []) as LeaderboardEntry[],
  };
}

export async function collectGold(): Promise<PlayerState> {
  const { data, error } = await supabase.rpc('collect_passive_gold');
  if (error) throw error;
  return data as PlayerState;
}

export async function upgradeIsland(): Promise<PlayerState> {
  const { data, error } = await supabase.rpc('upgrade_island');
  if (error) throw error;
  return data as PlayerState;
}

export async function maybeTriggerBattle(): Promise<BattleLog | null> {
  const { data, error } = await supabase.rpc('maybe_trigger_auto_battle');
  if (error) throw error;
  return data as BattleLog | null;
}
