import { Coins, Shield, TrendingUp, Trees } from 'lucide-react';
import type { PlayerState } from '../types/game';
import { formatGold, formatRelativeTime } from '../lib/gameMath';

type StatsBarProps = {
  state: PlayerState;
};

export function StatsBar({ state }: StatsBarProps) {
  return (
    <section className="stats-bar" aria-label="Island stats">
      <article>
        <Coins size={18} />
        <span>Gold</span>
        <strong>{formatGold(state.gold)}</strong>
      </article>
      <article>
        <TrendingUp size={18} />
        <span>Level</span>
        <strong>{state.level}</strong>
      </article>
      <article>
        <Shield size={18} />
        <span>Power</span>
        <strong>{state.army_power}</strong>
      </article>
      <article>
        <Trees size={18} />
        <span>Stage</span>
        <strong>{state.island_stage}</strong>
      </article>
      <article>
        <Coins size={18} />
        <span>Rate</span>
        <strong>{state.gold_generation_rate}/min</strong>
      </article>
      <article>
        <span>Collected</span>
        <strong>{formatRelativeTime(state.last_collected_at)}</strong>
      </article>
    </section>
  );
}
