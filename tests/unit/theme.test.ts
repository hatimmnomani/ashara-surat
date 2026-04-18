import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('design tokens', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf-8')

  it('defines ivory color token', () => {
    expect(css).toContain('--color-ivory: #fdf6ec')
  })

  it('defines burgundy-700 color token', () => {
    expect(css).toContain('--color-burgundy-700: #7c2d42')
  })

  it('defines burgundy-400 color token', () => {
    expect(css).toContain('--color-burgundy-400: #ec7589')
  })

  it('defines burgundy-800 color token', () => {
    expect(css).toContain('--color-burgundy-800: #6b1f35')
  })

  it('defines burgundy-50 color token', () => {
    expect(css).toContain('--color-burgundy-50: #fdf2f4')
  })

  it('defines serif font family', () => {
    expect(css).toContain('--font-serif: Georgia, serif')
  })

  it('has no leftover teal template colors', () => {
    // These are hex values from the original template palette
    expect(css).not.toContain('#246f76')
    expect(css).not.toContain('#7ed3bf')
    expect(css).not.toContain('79, 184, 178')  // rgba teal
    expect(css).not.toContain('47, 106, 74')   // rgba green
    expect(css).not.toContain('50, 143, 151')  // rgba teal
  })
})
