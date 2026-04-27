type Size = 'sm' | 'md' | 'lg' | 'xl'

interface AlamMarkProps {
  size?: Size
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

/**
 * The official Ashara Surat 1448H emblem — a green roundel with the gold-edged
 * teardrop containing the calligraphic mark. Rendered from the bundled image
 * so the typography stays accurate.
 */
export function AlamMark({
  size = 'md',
  className,
  caption,
  decorative = false,
}: AlamMarkProps) {
  const px = SIZE_PX[size]
  return (
    <div
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : `Ashara Mubaraka 1448H emblem${caption ? ` — ${caption}` : ''}`}
      className={['inline-flex flex-col items-center gap-2', className ?? ''].filter(Boolean).join(' ')}
      style={{ width: px }}
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
