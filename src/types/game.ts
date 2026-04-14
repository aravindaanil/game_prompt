export type Profile = {
  id: string;
  username: string;
  created_at: string;
};

export type PlayerState = {
  user_id: string;
  gold: number;
  level: number;
  army_power: number;
  island_stage: number;
  gold_generation_rate: number;
  last_collected_at: string;
  last_battle_at: string | null;
  updated_at: string;
};

export type BattleLog = {
  id: string;
  attacker_user_id: string;
  defender_user_id: string;
  winner_user_id: string;
  attacker_score: number;
  defender_score: number;
  gold_reward: number;
  created_at: string;
  attacker_username: string;
  defender_username: string;
  winner_username: string;
};

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  gold: number;
  level: number;
  army_power: number;
  island_stage: number;
  created_at: string;
};

export type DashboardData = {
  profile: Profile;
  state: PlayerState;
  battleLogs: BattleLog[];
  leaderboard: LeaderboardEntry[];
};

export type PassiveIncomeResult = {
  elapsedMinutes: number;
  earnedGold: number;
  totalGold: number;
};
