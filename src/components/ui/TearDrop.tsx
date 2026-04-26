import React from 'react'

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
 * The Ashara tear — pointed at the top, rounded semicircle at the bottom.
 * Optionally suspended from a small gold cup setting.
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
  const w = 32
  const h = cup ? 48 : 40
  const height = (size * h) / w
  const fill = muted ? '#a8475b' : 'var(--tear)'
  const stroke = muted ? '#5a1c2a' : 'var(--color-tear-red-600)'

  // Drop geometry: pointed top, semicircle bottom.
  const tipY = cup ? 9 : 2
  const arcY = cup ? 36 : 28 // y of arc start (left & right shoulders) and circle center y
  const arcR = cup ? 8 : 12 // semicircle radius — half the drop's max width
  const cx = 16

  const dropPath = [
    `M ${cx} ${tipY}`,
    // Left side: tapers from point out to the circle's left shoulder.
    `C ${cx - arcR / 2} ${tipY + (arcY - tipY) * 0.35}, ${cx - arcR} ${tipY + (arcY - tipY) * 0.65}, ${cx - arcR} ${arcY}`,
    // Bottom semicircle. Switched sweep flag from 1 to 0 so it bulges down instead of folding up.
    `A ${arcR} ${arcR} 0 0 0 ${cx + arcR} ${arcY}`,
    // Right side back to the point.
    `C ${cx + arcR} ${tipY + (arcY - tipY) * 0.65}, ${cx + arcR / 2} ${tipY + (arcY - tipY) * 0.35}, ${cx} ${tipY}`,
    'Z',
  ].join(' ')

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
          <path
            d="M10 2 Q16 -1 22 2 L20 7 L12 7 Z"
            fill="var(--alam-gold)"
            stroke="var(--color-alam-gold-700)"
            strokeWidth={0.6}
          />
          <rect x="14" y="6" width="4" height="3" fill="var(--alam-gold)" />
        </g>
      )}
      <path d={dropPath} fill={fill} stroke={stroke} strokeWidth={0.8} />
      {/* Glassy highlight on the upper-left curve */}
      <path
        d={`M ${cx - arcR / 2} ${tipY + (arcY - tipY) * 0.4}
            C ${cx - arcR + 1} ${tipY + (arcY - tipY) * 0.6}, ${cx - arcR + 0.5} ${arcY - 2}, ${cx - arcR + 1} ${arcY + 1}`}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
