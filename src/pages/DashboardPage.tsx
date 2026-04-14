import { LogOut, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BattleArena } from '../components/BattleArena';
import { BattleLogPanel } from '../components/BattleLogPanel';
import { IslandVisual } from '../components/IslandVisual';
import { LeaderboardPanel } from '../components/LeaderboardPanel';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { StatsBar } from '../components/StatsBar';
import { calculatePassiveIncome, formatGold, getUpgradeCost } from '../lib/gameMath';
import { signOut } from '../services/authService';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const {
    data,
    loading,
    actionLoading,
    challengeLoadingId,
    latestBattle,
    collect,
    upgrade,
    challenge,
    refresh,
  } = useDashboard();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  async function handleRefresh() {
    try {
      await refresh();
      toast.success('Island report refreshed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not refresh.');
    }
  }

  if (loading || !data) {
    return <main className="screen-center">Charting the island...</main>;
  }

  const pendingIncome = calculatePassiveIncome(
    data.state.gold,
    data.state.gold_generation_rate,
    data.state.last_collected_at,
  );
  const upgradeCost = getUpgradeCost(data.state.level);
  const canUpgrade = data.state.gold >= upgradeCost;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Idle Island</span>
          <h1>{data.profile.username}'s base</h1>
        </div>
        <div className="header-actions">
          <button className="ghost-button" onClick={handleRefresh} type="button">
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button className="ghost-button" onClick={handleSignOut} type="button">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <StatsBar state={data.state} />

      <section className="dashboard-grid">
        <section className="island-card">
          <IslandVisual stage={data.state.island_stage} />
          <div className="action-strip">
            <div>
              <span>Waiting to collect</span>
              <strong>{formatGold(pendingIncome.earnedGold)} gold</strong>
            </div>
            <button disabled={actionLoading || pendingIncome.earnedGold <= 0} onClick={collect} type="button">
              {actionLoading ? 'Working...' : 'Collect gold'}
            </button>
          </div>
          <div className="upgrade-box">
            <div>
              <span>Next upgrade</span>
              <strong>{formatGold(upgradeCost)} gold</strong>
              <small>+20 army power, +5 gold per minute</small>
            </div>
            <button disabled={actionLoading || !canUpgrade} onClick={upgrade} type="button">
              {canUpgrade ? 'Upgrade island' : 'Need more gold'}
            </button>
          </div>
        </section>

        <aside className="side-panels">
          <BattleArena latestBattle={latestBattle} profile={data.profile} state={data.state} />
          <BattleLogPanel currentUserId={data.profile.id} logs={data.battleLogs} />
          <LeaderboardPanel
            challengeLoadingId={challengeLoadingId}
            currentUserId={data.profile.id}
            onChallenge={challenge}
            rows={data.leaderboard}
          />
        </aside>
      </section>
    </main>
  );
}
