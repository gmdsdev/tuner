import { describe, expect, it } from 'vitest'

// WCAG 2.x relative luminance / contrast ratio.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

const BACKGROUNDS = { bg: '#0b0d10', surface: '#13161b', surface2: '#15181d', surface3: '#1c2027', raised: '#262b33' }

describe('color contrast (WCAG AA)', () => {
  it.each([
    ['text', '#e8eaed'],
    ['text-2', '#c9ced4'],
    ['muted', '#a3aab3'],
    ['ok', '#3ddc97'],
    ['off', '#f5a524'],
  ])('%s passes 4.5:1 on every surface', (_, fg) => {
    for (const bg of Object.values(BACKGROUNDS)) expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('gauge labels, disabled stepper and primary button pass', () => {
    expect(ratio('#959ca6', BACKGROUNDS.bg)).toBeGreaterThanOrEqual(4.5)
    expect(ratio('#959ca6', BACKGROUNDS.surface)).toBeGreaterThanOrEqual(4.5)
    expect(ratio('#06140e', '#3ddc97')).toBeGreaterThanOrEqual(4.5)
  })

  it('focus ring and needle meet 3:1 for non-text UI', () => {
    for (const c of ['#8ec9ff', '#3ddc97', '#f5a524']) {
      expect(ratio(c, BACKGROUNDS.bg)).toBeGreaterThanOrEqual(3)
      expect(ratio(c, BACKGROUNDS.surface3)).toBeGreaterThanOrEqual(3)
    }
  })
})
