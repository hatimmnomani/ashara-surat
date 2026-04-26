import { useId } from 'react'

interface TeardropFriezeProps {
  /** Band height in px. Default 56. */
  height?: number
  /** Width of one repeating unit in px. Default 240. */
  unit?: number
  className?: string
  title?: string
}

/**
 * Fatimid-inspired ornamental band: a single central red teardrop framed by
 * mirrored gold half-palmettes and a flowing arabesque vine on a cream ground.
 * Built as an SVG <pattern> at userSpaceOnUse so it tiles in pixel space —
 * no viewBox stretching, scrollwork detail stays crisp at every screen width.
 */
export function TeardropFrieze({
  height = 56,
  unit = 240,
  className,
  title,
}: TeardropFriezeProps) {
  const patternId = useId()
  const halfId = useId()
  const decorative = !title
  const cx = unit / 2
  const cy = height / 2

  // Vertical offsets relative to the centre line — scale gracefully with band height.
  const k = height / 60
  const dropTop = cy - 20 * k
  const dropBot = cy + 20 * k
  const dropHalfW = 16 * k
  const dropMid = 13 * k

  return (
    <svg
      width="100%"
      height={height}
      preserveAspectRatio="none"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={title}
      className={className}
    >
      {title && <title>{title}</title>}
      <defs>
        {/* Left half of the arabesque flourish — drawn once, mirrored for the right. */}
        <g id={halfId}>
          {/* Outer terminal scroll */}
          <circle cx="6" cy={cy} r={2.4 * k} fill="none" stroke="var(--alam-gold)" strokeWidth="1" />
          <circle cx="6" cy={cy} r={0.9 * k} fill="var(--alam-gold)" />

          {/* Primary undulating vine connecting outer terminal to drop */}
          <path
            d={`M 8 ${cy}
                C 18 ${cy - 12 * k}, 32 ${cy - 14 * k}, 44 ${cy - 6 * k}
                C 56 ${cy + 2 * k}, 70 ${cy + 6 * k}, 82 ${cy - 4 * k}
                C 92 ${cy - 12 * k}, 102 ${cy - 8 * k}, ${cx - 14} ${cy}`}
            fill="none"
            stroke="var(--alam-gold)"
            strokeWidth={1.4 * k}
            strokeLinecap="round"
          />
          {/* Mirror vine (below) */}
          <path
            d={`M 8 ${cy}
                C 18 ${cy + 12 * k}, 32 ${cy + 14 * k}, 44 ${cy + 6 * k}
                C 56 ${cy - 2 * k}, 70 ${cy - 6 * k}, 82 ${cy + 4 * k}
                C 92 ${cy + 12 * k}, 102 ${cy + 8 * k}, ${cx - 14} ${cy}`}
            fill="none"
            stroke="var(--alam-gold)"
            strokeWidth={1.4 * k}
            strokeLinecap="round"
          />

          {/* Outer half-palmettes (filled) */}
          <path
            d={`M 24 ${cy - 14 * k}
                C 32 ${cy - 18 * k}, 42 ${cy - 14 * k}, 40 ${cy - 6 * k}
                C 36 ${cy - 4 * k}, 30 ${cy - 6 * k}, 24 ${cy - 14 * k} Z`}
            fill="var(--alam-gold)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.4"
          />
          <path
            d={`M 24 ${cy + 14 * k}
                C 32 ${cy + 18 * k}, 42 ${cy + 14 * k}, 40 ${cy + 6 * k}
                C 36 ${cy + 4 * k}, 30 ${cy + 6 * k}, 24 ${cy + 14 * k} Z`}
            fill="var(--alam-gold)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.4"
          />

          {/* Mid leaves (lighter gold) */}
          <path
            d={`M 60 ${cy - 10 * k}
                C 66 ${cy - 14 * k}, 76 ${cy - 10 * k}, 74 ${cy - 4 * k}
                C 70 ${cy - 2 * k}, 64 ${cy - 4 * k}, 60 ${cy - 10 * k} Z`}
            fill="var(--color-alam-gold-300)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.4"
          />
          <path
            d={`M 60 ${cy + 10 * k}
                C 66 ${cy + 14 * k}, 76 ${cy + 10 * k}, 74 ${cy + 4 * k}
                C 70 ${cy + 2 * k}, 64 ${cy + 4 * k}, 60 ${cy + 10 * k} Z`}
            fill="var(--color-alam-gold-300)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.4"
          />

          {/* Large inner half-palmette adjacent to the central drop */}
          <path
            d={`M ${cx - 24} ${cy - 16 * k}
                C ${cx - 12} ${cy - 18 * k}, ${cx - 8} ${cy - 10 * k}, ${cx - 14} ${cy}
                C ${cx - 8} ${cy + 10 * k}, ${cx - 12} ${cy + 18 * k}, ${cx - 24} ${cy + 16 * k}
                C ${cx - 28} ${cy + 8 * k}, ${cx - 28} ${cy - 8 * k}, ${cx - 24} ${cy - 16 * k} Z`}
            fill="var(--alam-gold)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.5"
          />
          <path
            d={`M ${cx - 22} ${cy - 8 * k}
                Q ${cx - 18} ${cy}, ${cx - 22} ${cy + 8 * k}`}
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.6"
            fill="none"
          />

          {/* Accent dots in gaps */}
          <circle cx="50" cy={cy} r={1.1 * k} fill="var(--alam-gold)" />
          <circle cx="86" cy={cy} r={0.9 * k} fill="var(--color-alam-gold-700)" />
        </g>

        <pattern
          id={patternId}
          x="0"
          y="0"
          width={unit}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          {/* Cream/beige ground */}
          <rect width={unit} height={height} fill="#e7d8b6" />

          {/* Top + bottom gold edge bands */}
          <rect width={unit} height={2 * k} fill="var(--alam-gold)" />
          <rect y={height - 2 * k} width={unit} height={2 * k} fill="var(--alam-gold)" />
          <rect y={3.5 * k} width={unit} height={0.6 * k} fill="var(--color-alam-gold-700)" opacity="0.55" />
          <rect y={height - 4.1 * k} width={unit} height={0.6 * k} fill="var(--color-alam-gold-700)" opacity="0.55" />

          {/* Left half */}
          <use href={`#${halfId}`} />
          {/* Right half — mirrored */}
          <use href={`#${halfId}`} transform={`translate(${unit},0) scale(-1,1)`} />

          {/* Central red plump teardrop */}
          <path
            d={`M ${cx} ${dropTop}
                C ${cx - dropHalfW} ${cy - 8 * k}, ${cx - dropMid} ${cy + 6 * k}, ${cx} ${dropBot}
                C ${cx + dropMid} ${cy + 6 * k}, ${cx + dropHalfW} ${cy - 8 * k}, ${cx} ${dropTop} Z`}
            fill="var(--tear)"
            stroke="var(--alam-gold)"
            strokeWidth={1.2 * k}
          />
          {/* Inner gold rim */}
          <path
            d={`M ${cx} ${dropTop + 3 * k}
                C ${cx - dropHalfW + 2} ${cy - 6 * k}, ${cx - dropMid + 2} ${cy + 5 * k}, ${cx} ${dropBot - 3 * k}
                C ${cx + dropMid - 2} ${cy + 5 * k}, ${cx + dropHalfW - 2} ${cy - 6 * k}, ${cx} ${dropTop + 3 * k} Z`}
            fill="none"
            stroke="var(--color-alam-gold-300)"
            strokeWidth="0.5"
            opacity="0.85"
          />
          {/* White highlight */}
          <path
            d={`M ${cx - 6} ${cy - 12 * k}
                C ${cx - 8} ${cy - 4 * k}, ${cx - 8} ${cy + 4 * k}, ${cx - 6} ${cy + 12 * k}`}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#${patternId})`} />
    </svg>
  )
}
