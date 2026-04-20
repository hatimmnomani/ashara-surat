import { describe, it, expect } from 'vitest'
import { formatAnnouncementLabel } from '../../src/routes/announcements'

describe('formatAnnouncementLabel', () => {
  it('marks pinned announcements', () => {
    expect(formatAnnouncementLabel({ pinned: true, category: undefined })).toBe('📌 Pinned')
  })
  it('uses category when not pinned', () => {
    expect(formatAnnouncementLabel({ pinned: false, category: 'Transport' })).toBe('Transport')
  })
  it('falls back to General when no category', () => {
    expect(formatAnnouncementLabel({ pinned: false, category: undefined })).toBe('General')
  })
})
