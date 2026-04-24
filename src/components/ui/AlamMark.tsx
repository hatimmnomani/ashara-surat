import { TearDrop } from './TearDrop'

type Size = 'sm' | 'md' | 'lg'

interface AlamMarkProps {
  size?: Size
  className?: string
  /** Skip the accessible label — use when a sibling heading already names the mark. */
  decorative?: boolean
}

const SIZING: Record<Size, { box: string; tear: number; panelH: string; panelW: string }> = {
  sm: { box: 'gap-1', tear: 18, panelH: 'h-7', panelW: 'w-16' },
  md: { box: 'gap-1.5', tear: 26, panelH: 'h-10', panelW: 'w-24' },
  lg: { box: 'gap-2', tear: 44, panelH: 'h-16', panelW: 'w-40' },
}

export function AlamMark({ size = 'md', className, decorative = false }: AlamMarkProps) {
  const dims = SIZING[size]
  return (
    <div
      role={decorative ? 'presentation' : 'img'}
      aria-label={decorative ? undefined : 'Ashara Surat emblem'}
      className={['flex flex-col items-center', dims.box, className ?? ''].filter(Boolean).join(' ')}
    >
      <TearDrop size={dims.tear} glow />
      <span aria-hidden="true" className="block w-px h-2 bg-[var(--alam-gold)] opacity-70" />
      <div
        aria-hidden="true"
        className={[
          'relative overflow-hidden rounded-md border',
          dims.panelH,
          dims.panelW,
        ].join(' ')}
        style={{
          background:
            'linear-gradient(160deg, var(--alam-green), var(--alam-green-deep))',
          borderColor: 'var(--alam-gold)',
          boxShadow: '0 6px 18px rgba(6,40,32,0.35), 0 0 0 1px rgba(230,199,122,0.2) inset',
        }}
      >
        {/* Decorative gold hairline — abstract, not calligraphy. */}
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M8 20 Q 22 6, 36 20 T 64 20 T 92 20"
            stroke="var(--alam-gold-soft)"
            strokeWidth={1.1}
            fill="none"
            opacity={0.85}
          />
          <circle cx="50" cy="20" r="1.6" fill="var(--alam-gold-soft)" />
        </svg>
      </div>
    </div>
  )
}
