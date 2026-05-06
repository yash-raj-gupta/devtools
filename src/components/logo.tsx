export function Logo({
  size = 32,
  withWordmark = true,
}: {
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden
        className="drop-shadow-[0_2px_2px_var(--shadow-soft)]"
      >
        <defs>
          <linearGradient id="tb-brass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-hi)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-deep)" />
          </linearGradient>
          <linearGradient id="tb-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,245,215,0.7)" />
            <stop offset="100%" stopColor="rgba(40,25,5,0.45)" />
          </linearGradient>
          <radialGradient id="tb-shine" cx="0.3" cy="0.25" r="0.7">
            <stop offset="0%" stopColor="rgba(255,250,225,0.55)" />
            <stop offset="60%" stopColor="rgba(255,250,225,0)" />
          </radialGradient>
        </defs>

        {/* Outer beveled brass plaque */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="12"
          fill="url(#tb-rim)"
        />
        <rect
          x="5"
          y="5"
          width="54"
          height="54"
          rx="10"
          fill="url(#tb-brass)"
        />
        {/* Inner recessed area */}
        <rect
          x="9"
          y="9"
          width="46"
          height="46"
          rx="7"
          fill="var(--accent-deep)"
          opacity="0.35"
        />
        <rect
          x="10"
          y="10"
          width="44"
          height="44"
          rx="6"
          fill="url(#tb-brass)"
        />
        {/* Engraved "T" — done as two crossing bars with deboss */}
        <g
          fill="var(--accent-deep)"
          style={{
            filter:
              "drop-shadow(0 -1px 0 rgba(255,250,225,0.45)) drop-shadow(0 1px 0 rgba(40,25,5,0.55))",
          }}
        >
          {/* top crossbar */}
          <rect x="16" y="18" width="32" height="7" rx="1.5" />
          {/* vertical stem */}
          <rect x="28.5" y="18" width="7" height="30" rx="1.5" />
        </g>
        {/* Glossy highlight */}
        <rect
          x="5"
          y="5"
          width="54"
          height="54"
          rx="10"
          fill="url(#tb-shine)"
        />
        {/* Tiny rivets at corners */}
        {[
          [11, 11],
          [53, 11],
          [11, 53],
          [53, 53],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="2.1" fill="var(--accent-deep)" />
            <circle
              cx={cx - 0.5}
              cy={cy - 0.5}
              r="0.8"
              fill="rgba(255,250,225,0.65)"
            />
          </g>
        ))}
      </svg>
      {withWordmark && (
        <span className="serif font-semibold tracking-tight text-[1.05rem] skeuo-emboss">
          Toolbench
        </span>
      )}
    </span>
  );
}
