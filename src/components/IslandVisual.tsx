type IslandVisualProps = {
  stage: number;
};

const stageCopy: Record<number, { title: string; detail: string; icon: string }> = {
  1: { title: 'Tiny Shore', detail: 'A warm hut and a brave little dock.', icon: 'Hut' },
  2: { title: 'Watchtower Cove', detail: 'The island grows taller and busier.', icon: 'Tower' },
  3: { title: 'Fortified Reef', detail: 'Stone walls keep the banners flying.', icon: 'Fort' },
  4: { title: 'Sky Harbor', detail: 'A thriving base ready for legends.', icon: 'Citadel' },
};

export function IslandVisual({ stage }: IslandVisualProps) {
  const current = stageCopy[stage] ?? stageCopy[1];

  return (
    <div className={`island-visual stage-${stage}`} aria-label={`${current.title} island stage`}>
      <svg viewBox="0 0 520 300" role="img" className="island-svg">
        <defs>
          <linearGradient id="water" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#79d6d0" />
            <stop offset="1" stopColor="#4b9bd5" />
          </linearGradient>
          <linearGradient id="grass" x1="0" x2="1">
            <stop stopColor="#74c365" />
            <stop offset="1" stopColor="#2f9b72" />
          </linearGradient>
        </defs>
        <rect width="520" height="300" rx="8" fill="url(#water)" />
        <path d="M56 230 C130 205 158 228 222 212 C290 194 350 210 466 224" fill="none" stroke="#d6fbff" strokeWidth="8" opacity="0.65" />
        <ellipse cx="260" cy="210" rx={stage >= 3 ? 150 : 125} ry="42" fill="#d8ad62" />
        <ellipse cx="260" cy="190" rx={stage >= 3 ? 132 : 105} ry="38" fill="url(#grass)" />
        <rect x="238" y="128" width="46" height="54" rx="4" fill={stage >= 3 ? '#9e6154' : '#d98248'} />
        <path d="M231 130 L261 92 L291 130 Z" fill="#e85c4a" />
        {stage >= 2 && (
          <>
            <rect x="315" y="93" width="38" height="88" rx="4" fill="#6f7176" />
            <path d="M304 96 L334 65 L364 96 Z" fill="#f6c44f" />
            <rect x="326" y="124" width="16" height="24" rx="2" fill="#fff5bf" />
          </>
        )}
        {stage >= 3 && (
          <>
            <path d="M153 177 L367 177 L382 196 L135 196 Z" fill="#777d81" />
            <rect x="172" y="151" width="28" height="34" fill="#777d81" />
            <rect x="320" y="151" width="28" height="34" fill="#777d81" />
          </>
        )}
        {stage >= 4 && (
          <>
            <path d="M190 91 C222 46 296 45 330 91 L330 177 L190 177 Z" fill="#edf2f7" />
            <path d="M205 92 C236 68 284 68 315 92" fill="none" stroke="#43a985" strokeWidth="10" />
            <circle cx="260" cy="124" r="18" fill="#4b9bd5" />
          </>
        )}
        <g className="island-avatars">
          <circle cx="210" cy="178" r="8" fill="#243033" />
          <rect x="204" y="186" width="12" height="18" rx="5" fill="#f0b33a" />
          <circle cx="300" cy="176" r="8" fill="#243033" />
          <rect x="294" y="184" width="12" height="18" rx="5" fill="#d74f3f" />
          {stage >= 3 && (
            <>
              <circle cx="350" cy="184" r="7" fill="#243033" />
              <rect x="345" y="191" width="10" height="16" rx="5" fill="#edf2f7" />
            </>
          )}
        </g>
        <circle cx="112" cy="63" r="30" fill="#ffd66b" />
      </svg>
      <div className="island-caption">
        <span>{current.icon}</span>
        <strong>{current.title}</strong>
        <small>{current.detail}</small>
      </div>
    </div>
  );
}
