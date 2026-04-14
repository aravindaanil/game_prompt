import { Swords } from 'lucide-react';
import type { BattleLog, PlayerState, Profile } from '../types/game';

type BattleArenaProps = {
  profile: Profile;
  state: PlayerState;
  latestBattle: BattleLog | null;
};

function getAvatarClass(stage: number) {
  if (stage >= 4) return 'avatar-archmage';
  if (stage >= 3) return 'avatar-knight';
  if (stage >= 2) return 'avatar-ranger';
  return 'avatar-scout';
}

export function BattleArena({ profile, state, latestBattle }: BattleArenaProps) {
  const won = latestBattle?.winner_user_id === profile.id;
  const opponentName =
    latestBattle?.attacker_user_id === profile.id
      ? latestBattle?.defender_username
      : latestBattle?.attacker_username;
  const yourScore =
    latestBattle?.attacker_user_id === profile.id ? latestBattle?.attacker_score : latestBattle?.defender_score;
  const theirScore =
    latestBattle?.attacker_user_id === profile.id ? latestBattle?.defender_score : latestBattle?.attacker_score;

  return (
    <section className="battle-arena">
      <div className="arena-heading">
        <div>
          <span className="eyebrow">Manual Battles</span>
          <h2>Challenge arena</h2>
        </div>
        <Swords size={22} />
      </div>

      <div className={`arena-stage ${latestBattle ? 'is-battling' : ''}`} key={latestBattle?.id ?? 'idle-arena'}>
        <div className="fighter fighter-left">
          <div className={`fighter-avatar ${getAvatarClass(state.island_stage)}`}>
            <span />
          </div>
          <strong>{profile.username}</strong>
          <small>{state.army_power} power</small>
        </div>

        <div className="arena-center">
          <div className="slash slash-one" />
          <div className="slash slash-two" />
          <strong>VS</strong>
        </div>

        <div className="fighter fighter-right">
          <div className="fighter-avatar avatar-rival">
            <span />
          </div>
          <strong>{opponentName ?? 'Choose rival'}</strong>
          <small>{theirScore ? `${theirScore} last score` : 'Use the leaderboard'}</small>
        </div>
      </div>

      <div className="arena-result">
        {latestBattle ? (
          <>
            <strong>{won ? 'Victory claimed' : 'A close defeat'}</strong>
            <span>
              {profile.username} scored {yourScore}. {opponentName} scored {theirScore}.
            </span>
          </>
        ) : (
          <>
            <strong>Pick a captain to challenge</strong>
            <span>Manual battles resolve instantly, reward the winner, and keep the loser safe.</span>
          </>
        )}
      </div>
    </section>
  );
}
