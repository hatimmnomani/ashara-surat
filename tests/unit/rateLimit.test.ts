import { describe, it, expect } from 'vitest'
import { isRateLimited, incrementMessageCount } from '../../src/lib/rateLimit'

describe('isRateLimited', () => {
  it('allows messages under the limit', () => {
    const s = { message_count: 3, window_started_at: new Date().toISOString() }
    expect(isRateLimited(s, 5)).toBe(false)
  })
  it('blocks when limit is reached', () => {
    const s = { message_count: 5, window_started_at: new Date().toISOString() }
    expect(isRateLimited(s, 5)).toBe(true)
  })
  it('resets after the 1-hour window expires', () => {
    const old = new Date(Date.now() - 61 * 60 * 1000).toISOString()
    const s = { message_count: 5, window_started_at: old }
    expect(isRateLimited(s, 5)).toBe(false)
  })
})

describe('incrementMessageCount', () => {
  it('increments count within window', () => {
    const s = { message_count: 2, window_started_at: new Date().toISOString() }
    expect(incrementMessageCount(s).message_count).toBe(3)
  })
  it('resets count when window has expired', () => {
    const old = new Date(Date.now() - 61 * 60 * 1000).toISOString()
    const s = { message_count: 5, window_started_at: old }
    expect(incrementMessageCount(s).message_count).toBe(1)
  })
})
