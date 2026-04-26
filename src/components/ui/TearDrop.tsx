interface TearDropProps {
  size?: number
  /** Adds a soft red drop-shadow halo. Use sparingly — for large standalone marks. */
  glow?: boolean
  /** Reduces saturation for empty states / muted backgrounds. */
  muted?: boolean
  /** Renders a small gold cup/setting at the top of the drop, like the masjid frieze. */
  cup?: boolean
  className?: string
  title?: string
}

/**
 * The Ashara tear — a plump, jewel-cut red drop. Optionally suspended from a
 * small gold cup setting, matching the repeating frieze along the masjid wall.
 */
export function TearDrop({
  size = 24,
  glow = false,
  muted = false,
  cup = false,
  className,
  title,
}: TearDropProps) {
  const decorative = !title
  // viewBox is sized so the cup sits at the top — when cup is off we just hide it.
  const w = 32
  const h = cup ? 48 : 40
  const height = (size * h) / w
  const fill = muted ? '#a8475b' : 'var(--tear)'
  const stroke = muted ? '#5a1c2a' : 'var(--color-tear-red-600)'

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={title}
      className={[
        glow ? '[filter:drop-shadow(0_2px_6px_var(--tear-glow))]' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title && <title>{title}</title>}
      {cup && (
        <g>
          {/* Small gold cup that the drop hangs from. */}
          <path
            d="M10 2 Q16 -1 22 2 L20 7 L12 7 Z"
            fill="var(--alam-gold)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth={0.6}
          />
          <rect x="14" y="6" width="4" height="3" fill="var(--alam-gold)" />
        </g>
      )}
      <path
        d={
          cup
            ? // drop hangs starting at y=9
              'M16 9 C 6 18, 4 30, 16 44 C 28 30, 26 18, 16 9 Z'
            : // standalone drop starts at y=2
              'M16 2 C 6 12, 4 24, 16 38 C 28 24, 26 12, 16 2 Z'
        }
        fill={fill}
        stroke={stroke}
        strokeWidth={0.8}
      />
      {/* Glassy highlight — a small sliver on the upper-left of the drop. */}
      <path
        d={
          cup
            ? 'M12.5 14 C 10.8 18, 10 22, 11 26'
            : 'M12.5 7 C 10.8 11, 10 15, 11 19'
        }
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
