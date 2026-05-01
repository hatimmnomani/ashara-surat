import React from 'react'

interface TearDropProps {
  size?: number
  /** Adds a soft red drop-shadow halo. Use sparingly — for large standalone marks. */
  glow?: boolean
  /** Reduces opacity for empty states / muted backgrounds. */
  muted?: boolean
  /** Unused — retained for API compatibility. */
  cup?: boolean
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
  const style: React.CSSProperties = {
    width: size,
    height: 'auto',
    opacity: muted ? 0.45 : 1,
    filter: glow ? 'drop-shadow(0 2px 6px var(--tear-glow))' : undefined,
  }

  return (
    <img
      src="/Aansu.png"
      alt={title ?? ''}
      aria-hidden={!title || undefined}
      width={size}
      style={style}
      className={className}
    />
  )
}
