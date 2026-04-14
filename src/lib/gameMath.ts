import type { PassiveIncomeResult } from '../types/game';

export function calculatePassiveIncome(
  currentGold: number,
  goldGenerationRate: number,
  lastCollectedAt: string,
  now = new Date(),
): PassiveIncomeResult {
  const lastCollectedTime = new Date(lastCollectedAt).getTime();
  const nowTime = now.getTime();
  const elapsedMs = Math.max(0, nowTime - lastCollectedTime);
  const elapsedMinutes = elapsedMs / 60000;
  const earnedGold = Math.floor(elapsedMinutes * goldGenerationRate);

  return {
    elapsedMinutes,
    earnedGold,
    totalGold: currentGold + earnedGold,
  };
}

export function getUpgradeCost(level: number): number {
  return 100 * level;
}

export function getIslandStage(level: number): number {
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

export function formatGold(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h ago`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d ago`;
}
