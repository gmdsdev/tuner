import { describe, expect, it } from 'vitest'
import { YinDetector } from './yin'
import { centsBetween } from '../music/notes'

const SR = 48000

function tone(freq: number, length: number, { harmonics = [1], noise = 0 } = {}): Float32Array {
  const out = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    let v = 0
    harmonics.forEach((amp, h) => (v += amp * Math.sin((2 * Math.PI * freq * (h + 1) * i) / SR)))
    out[i] = 0.3 * v + noise * (Math.random() * 2 - 1)
  }
  return out
}

describe('YinDetector', () => {
  const yin = new YinDetector()
  const len = 4096

  it.each([82.41, 110, 146.83, 196, 246.94, 329.63, 261.63, 392, 440, 493.88, 880])('detects %f Hz within 2 cents', (f) => {
    const result = yin.detect(tone(f, len), SR)
    expect(result).not.toBeNull()
    expect(Math.abs(centsBetween(result!.frequency, f))).toBeLessThan(2)
  })

  it('finds the fundamental of a harmonic-rich low E with noise', () => {
    // Plucked strings often have a 2nd harmonic louder than the fundamental.
    const result = yin.detect(tone(82.41, len, { harmonics: [0.6, 1, 0.7, 0.4, 0.3], noise: 0.02 }), SR)
    expect(result).not.toBeNull()
    expect(Math.abs(centsBetween(result!.frequency, 82.41))).toBeLessThan(5)
  })

  it('detects slightly detuned notes accurately', () => {
    const f = 110 * 2 ** (-14 / 1200)
    const result = yin.detect(tone(f, len, { harmonics: [1, 0.5, 0.3] }), SR)
    expect(centsBetween(result!.frequency, 110)).toBeCloseTo(-14, 0)
  })

  it('returns null for silence and for noise', () => {
    expect(yin.detect(new Float32Array(len), SR)).toBeNull()
    const noise = new Float32Array(len).map(() => (Math.random() * 2 - 1) * 0.3)
    const r = yin.detect(noise, SR)
    expect(r === null || r.clarity < 0.85).toBe(true)
  })

  it('runs fast enough for a 30 fps loop', () => {
    const buf = tone(110, len)
    const t0 = performance.now()
    for (let i = 0; i < 30; i++) yin.detect(buf, SR)
    expect((performance.now() - t0) / 30).toBeLessThan(15)
  })
})
