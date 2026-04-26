import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface HeroSlide {
  src: string
  alt: string
  caption?: string
  /** Optional credit/byline shown small under the caption. */
  credit?: string
}

interface HeroCarouselProps {
  slides: HeroSlide[]
  /** Auto-advance interval in ms. Default 6000. Set 0 to disable. */
  intervalMs?: number
  className?: string
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduce(m.matches)
    setReduce(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])
  return reduce
}

/**
 * Accessible auto-rotating image carousel. Pauses on hover and on keyboard
 * focus, respects prefers-reduced-motion, and silently drops slides whose
 * image fails to load (so missing files don't break the page).
 */
export function HeroCarousel({ slides, intervalMs = 6000, className }: HeroCarouselProps) {
  const [available, setAvailable] = useState(slides)
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = usePrefersReducedMotion()
  const liveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAvailable(slides)
    setIdx(0)
  }, [slides])

  useEffect(() => {
    if (paused || reduce || available.length <= 1 || intervalMs === 0) return
    const id = window.setInterval(
      () => setIdx(i => (i + 1) % available.length),
      intervalMs,
    )
    return () => window.clearInterval(id)
  }, [paused, reduce, available.length, intervalMs])

  function go(delta: number) {
    setIdx(i => (i + delta + available.length) % available.length)
  }

  function handleImgError(slide: HeroSlide) {
    setAvailable(prev => {
      const next = prev.filter(s => s.src !== slide.src)
      // Keep idx in range.
      setIdx(curr => (next.length === 0 ? 0 : curr % next.length))
      return next
    })
  }

  if (available.length === 0) return null
  const current = available[idx]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Ashara Surat highlights"
      className={[
        'relative overflow-hidden rounded-2xl border border-[var(--alam-gold)]/40',
        'shadow-[0_24px_60px_rgba(10,58,43,0.25)]',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={liveRef}
        aria-live="polite"
        className="relative aspect-[16/9] w-full bg-[var(--alam-green-deep)]"
      >
        {available.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            loading={i === 0 ? 'eager' : 'lazy'}
            onError={() => handleImgError(slide)}
            className={[
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
              i === idx ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            aria-hidden={i !== idx}
          />
        ))}
        {/* Bottom gradient for caption legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent"
        />
        {(current.caption || current.credit) && (
          <div className="absolute inset-x-0 bottom-0 px-5 pb-4 text-ivory">
            {current.caption && <p className="font-serif text-lg sm:text-xl">{current.caption}</p>}
            {current.credit && (
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ivory/75">
                {current.credit}
              </p>
            )}
          </div>
        )}
      </div>

      {available.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-ivory backdrop-blur-sm hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alam-gold)]"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-ivory backdrop-blur-sm hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--alam-gold)]"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          <div role="tablist" aria-label="Choose slide" className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {available.map((s, i) => (
              <button
                key={s.src}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Slide ${i + 1}: ${s.alt}`}
                onClick={() => setIdx(i)}
                className={[
                  'h-1.5 rounded-full transition-all',
                  i === idx ? 'w-6 bg-[var(--alam-gold)]' : 'w-3 bg-ivory/55 hover:bg-ivory/80',
                ].join(' ')}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
