import { MousePointer2, Swords } from 'lucide-react';
import { KeyboardEvent, PointerEvent, useCallback, useEffect, useState } from 'react';
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
  const [heroX, setHeroX] = useState(18);
  const [heroAction, setHeroAction] = useState<'idle' | 'walk' | 'attack' | 'guard'>('idle');
  const won = latestBattle?.winner_user_id === profile.id;
  const opponentName =
    latestBattle?.attacker_user_id === profile.id
      ? latestBattle?.defender_username
      : latestBattle?.attacker_username;
  const yourScore =
    latestBattle?.attacker_user_id === profile.id ? latestBattle?.attacker_score : latestBattle?.defender_score;
  const theirScore =
    latestBattle?.attacker_user_id === profile.id ? latestBattle?.defender_score : latestBattle?.attacker_score;

  const moveHero = useCallback((direction: -1 | 1) => {
    setHeroX((current) => Math.min(68, Math.max(10, current + direction * 8)));
    setHeroAction('walk');
    window.setTimeout(() => setHeroAction('idle'), 260);
  }, []);

  const attack = useCallback(() => {
    setHeroAction('attack');
    window.setTimeout(() => setHeroAction('idle'), 360);
  }, []);

  const guard = useCallback(() => {
    setHeroAction('guard');
    window.setTimeout(() => setHeroAction('idle'), 420);
  }, []);

  const handleControlKey = useCallback((key: string) => {
    if (key === 'ArrowLeft' || key.toLowerCase() === 'a') moveHero(-1);
    if (key === 'ArrowRight' || key.toLowerCase() === 'd') moveHero(1);
    if (key === ' ' || key === 'Enter') attack();
    if (key.toLowerCase() === 's' || key === 'ArrowDown') guard();
  }, [attack, guard, moveHero]);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', ' ', 'Enter'].includes(event.key)) {
        event.preventDefault();
      }
      handleControlKey(event.key);
    }

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [handleControlKey]);

  function handleArenaPointerDown(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickPercent = ((event.clientX - bounds.left) / bounds.width) * 100;
    const nextX = Math.min(68, Math.max(10, clickPercent));

    setHeroX(nextX);
    setHeroAction(Math.abs(nextX - heroX) < 8 ? 'attack' : 'walk');
    window.setTimeout(() => setHeroAction('idle'), 360);
  }

  function handleArenaKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
    }
    handleControlKey(event.key);
  }

  return (
    <section className="battle-arena">
      <div className="arena-heading">
        <div>
          <span className="eyebrow">Manual Battles</span>
          <h2>Challenge arena</h2>
        </div>
        <Swords size={22} />
      </div>

      <div
        aria-label="Interactive battle arena. Use A and D or arrow keys to move. Press space to attack."
        className={`arena-stage ${latestBattle ? 'is-battling' : ''}`}
        key={latestBattle?.id ?? 'idle-arena'}
        onKeyDown={handleArenaKeyDown}
        onPointerDown={handleArenaPointerDown}
        role="application"
        tabIndex={0}
      >
        <div className={`fighter fighter-left action-${heroAction}`} style={{ left: `${heroX}%` }}>
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

      <div className="arena-controls" aria-label="Battle controls">
        <button onClick={() => moveHero(-1)} type="button">Left</button>
        <button onClick={attack} type="button">Attack</button>
        <button onClick={guard} type="button">Guard</button>
        <button onClick={() => moveHero(1)} type="button">Right</button>
      </div>

      <p className="arena-help">
        <MousePointer2 size={14} />
        Click the arena to move. Use A/D or arrows, Space/Enter to attack, S/Down to guard.
      </p>
    </section>
  );
}
