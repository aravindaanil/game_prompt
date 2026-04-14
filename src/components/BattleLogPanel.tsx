import type { BattleLog } from '../types/game';
import { formatRelativeTime } from '../lib/gameMath';

type BattleLogPanelProps = {
  logs: BattleLog[];
  currentUserId: string;
};

export function BattleLogPanel({ logs, currentUserId }: BattleLogPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Recent Battles</h2>
        <span>Last 5</span>
      </div>
      {logs.length === 0 ? (
        <p className="empty-state">No ships have crossed paths yet. Check back after your first patrol.</p>
      ) : (
        <div className="battle-list">
          {logs.map((log) => {
            const won = log.winner_user_id === currentUserId;
            return (
              <article className="battle-row" key={log.id}>
                <div>
                  <strong>{won ? 'Victory' : 'Skirmish'}</strong>
                  <span>
                    {log.attacker_username} {log.attacker_score} vs {log.defender_username} {log.defender_score}
                  </span>
                </div>
                <small>{formatRelativeTime(log.created_at)}</small>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
