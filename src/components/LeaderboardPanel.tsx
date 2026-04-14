import type { LeaderboardEntry } from '../types/game';

type LeaderboardPanelProps = {
  rows: LeaderboardEntry[];
  currentUserId: string;
};

export function LeaderboardPanel({ rows, currentUserId }: LeaderboardPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Leaderboard</h2>
        <span>Top 10</span>
      </div>
      {rows.length === 0 ? (
        <p className="empty-state">The seas are quiet. First captain up gets the crown.</p>
      ) : (
        <ol className="leaderboard">
          {rows.map((row, index) => (
            <li className={row.user_id === currentUserId ? 'is-current' : ''} key={row.user_id}>
              <span className="rank">#{index + 1}</span>
              <strong>{row.username}</strong>
              <span>{row.army_power} power</span>
              <small>Lv {row.level}</small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
