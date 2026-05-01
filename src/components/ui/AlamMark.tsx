type Size = 'sm' | 'md' | 'lg' | 'xl'

interface AlamMarkProps {
  size?: Size
  /** Full-width on mobile, capped at size px on sm+. */
  fluid?: boolean
  className?: string
  caption?: string
  decorative?: boolean
}

const SIZE_PX: Record<Size, number> = {
  sm: 56,
  md: 96,
  lg: 168,
  xl: 240,
}

export function AlamMark({
  size = 'md',
  fluid = false,
  className,
  caption,
  decorative = false,
}: AlamMarkProps) {
  const px = SIZE_PX[size]
  return (
    <div
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : `Ashara Mubaraka 1448H emblem${caption ? ` — ${caption}` : ''}`}
      className={[
        'flex flex-col items-center gap-2',
        fluid ? 'w-full' : '',
        className ?? '',
      ].filter(Boolean).join(' ')}
      style={fluid ? { maxWidth: px } : { width: px }}
    >
      <img
        src="/logo2.png"
        alt=""
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
      {caption && (
        <span className="rounded-full border border-[var(--alam-gold)] bg-[var(--alam-green-deep)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-alam-gold-300)]">
          {caption}
        </span>
      )}
    </div>
  )
}
