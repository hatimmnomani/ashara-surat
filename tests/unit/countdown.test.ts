import { describe, it, expect, vi } from 'vitest'
import { getDaysUntil } from '../../src/components/ui/CountdownTimer'

describe('getDaysUntil', () => {
  it('returns 0 on the event date', () => {
    vi.setSystemTime(new Date('2026-09-01'))
    expect(getDaysUntil(new Date('2026-09-01'))).toBe(0)
    vi.useRealTimers()
  })
  it('returns correct days before event', () => {
    vi.setSystemTime(new Date('2026-08-01'))
    expect(getDaysUntil(new Date('2026-09-01'))).toBe(31)
    vi.useRealTimers()
  })
})
