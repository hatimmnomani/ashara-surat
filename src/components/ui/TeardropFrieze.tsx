import { useId } from 'react'

interface TeardropFriezeProps {
  /** Band height in px. Default 56. */
  height?: number
  /** Width of one repeating unit in px — controls density. Default 56. */
  unit?: number
  className?: string
  /** Optional accessible label; otherwise treated as decoration. */
  title?: string
}

/**
 * A horizontal frieze of red teardrops suspended from gold cups along a beige
 * band, with small gold diamonds between cups. Built as an SVG <pattern> so it
 * tiles seamlessly across any width (use width="100%" via parent).
 *
 * Inspired by the repeating teardrop band that runs along the masjid walls.
 */
export function TeardropFrieze({
  height = 56,
  unit = 56,
  className,
  title,
}: TeardropFriezeProps) {
  const patternId = useId()
  const decorative = !title

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${unit} ${unit}`}
      preserveAspectRatio="xMidYMid slice"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={title}
      className={className}
    >
      {title && <title>{title}</title>}
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={unit}
          height={unit}
          patternUnits="userSpaceOnUse"
        >
          {/* Beige base band */}
          <rect width={unit} height={unit} fill="#e7d8b6" />

          {/* Top + bottom gold hairlines */}
          <rect x="0" y="0" width={unit} height="3" fill="var(--alam-gold)" />
          <rect x="0" y={unit - 1.2} width={unit} height="1.2" fill="var(--color-alam-gold-700)" opacity="0.7" />
          <rect x="0" y="3.4" width={unit} height="0.6" fill="var(--color-alam-gold-700)" opacity="0.5" />

          {/* Connector strap from gold band down to cup */}
          <rect x={unit / 2 - 2} y="3" width="4" height="5" fill="var(--alam-gold)" />

          {/* Gold cup */}
          <path
            d={`M${unit / 2 - 7} 8 Q${unit / 2} 4 ${unit / 2 + 7} 8 L${unit / 2 + 5} 13 L${unit / 2 - 5} 13 Z`}
            fill="var(--alam-gold)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth="0.6"
          />
          <ellipse cx={unit / 2} cy="8.6" rx="4.5" ry="0.8" fill="var(--color-alam-gold-300)" opacity="0.7" />

          {/* Red teardrop hanging from the cup */}
          <path
            d={`M${unit / 2} 13 C ${unit / 2 - 9} 22, ${unit / 2 - 11} 34, ${unit / 2} ${unit - 7} C ${unit / 2 + 11} 34, ${unit / 2 + 9} 22, ${unit / 2} 13 Z`}
            fill="var(--tear)"
            stroke="var(--color-tear-red-600)"
            strokeWidth="0.7"
          />
          {/* Drop highlight */}
          <path
            d={`M${unit / 2 - 4.5} 18 C ${unit / 2 - 6} 23, ${unit / 2 - 6.5} 28, ${unit / 2 - 5.5} 33`}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
          />

          {/* Small gold diamond accents at the unit edges (between drops) */}
          <path
            d={`M0 ${unit / 2} L4 ${unit / 2 - 4} L8 ${unit / 2} L4 ${unit / 2 + 4} Z`}
            fill="var(--alam-gold)"
            opacity="0.8"
          />
          <path
            d={`M${unit - 8} ${unit / 2} L${unit - 4} ${unit / 2 - 4} L${unit} ${unit / 2} L${unit - 4} ${unit / 2 + 4} Z`}
            fill="var(--alam-gold)"
            opacity="0.8"
          />
          {/* Tiny gold dots on either side */}
          <circle cx="14" cy={unit / 2} r="0.9" fill="var(--color-alam-gold-700)" />
          <circle cx={unit - 14} cy={unit / 2} r="0.9" fill="var(--color-alam-gold-700)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}
