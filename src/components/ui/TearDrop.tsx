import { useId } from 'react'

interface TearDropProps {
  size?: number
  glow?: boolean
  muted?: boolean
  className?: string
  title?: string
}

export function TearDrop({
  size = 24,
  glow = false,
  muted = false,
  className,
  title,
}: TearDropProps) {
  const gradId = useId()
  const glowId = useId()
  const decorative = !title
  const height = (size * 32) / 24

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 24 32"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={title}
      className={[glow ? 'tear-pulse' : '', className ?? ''].filter(Boolean).join(' ')}
    >
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={gradId} cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor={muted ? '#f5d6d0' : '#ffd4c0'} stopOpacity={muted ? 0.85 : 1} />
          <stop offset="55%" stopColor="var(--tear)" />
          <stop offset="100%" stopColor="var(--color-tear-red-600)" />
        </radialGradient>
        {glow && (
          <filter id={glowId} x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <path
        d="M12 2 C 6 12, 3 18, 12 30 C 21 18, 18 12, 12 2 Z"
        fill={`url(#${gradId})`}
        filter={glow ? `url(#${glowId})` : undefined}
        opacity={muted ? 0.75 : 1}
      />
      <path
        d="M10.2 7 C 8.8 10, 7.8 13, 8.2 16"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
