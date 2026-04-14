import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  collectGold,
  fetchDashboardData,
  maybeTriggerBattle,
  upgradeIsland,
} from '../services/gameService';
import { ensurePlayerProfile } from '../services/authService';
import type { DashboardData } from '../types/game';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    const dashboardData = await fetchDashboardData();
    setData(dashboardData);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        await ensurePlayerProfile();
        await collectGold();
        const battle = await maybeTriggerBattle();
        const dashboardData = await fetchDashboardData();
        if (!mounted) return;
        setData(dashboardData);
        if (battle) {
          toast.success('A scouting fleet returned with a new battle result.');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not load your island.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCollect = useCallback(async () => {
    try {
      setActionLoading(true);
      const nextState = await collectGold();
      setData((current) => (current ? { ...current, state: nextState } : current));
      await refresh();
      toast.success('Gold collected.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not collect gold.');
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const handleUpgrade = useCallback(async () => {
    try {
      setActionLoading(true);
      const nextState = await upgradeIsland();
      setData((current) => (current ? { ...current, state: nextState } : current));
      await refresh();
      toast.success('Island upgraded.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not upgrade yet.');
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  return {
    data,
    loading,
    actionLoading,
    collect: handleCollect,
    upgrade: handleUpgrade,
    refresh,
  };
}
