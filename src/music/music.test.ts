import { describe, expect, it } from 'vitest'
import { matchString } from './matchString'
import { centsBetween, frequencyToMidi, midiToFrequency, noteFromMidi, parseNote } from './notes'
import { getTuning, TUNINGS } from './tunings'

describe('notes', () => {
  it('parses scientific pitch notation', () => {
    expect(parseNote('A4')).toMatchObject({ letter: 'A', accidental: 0, octave: 4, midi: 69 })
    expect(parseNote('E2').midi).toBe(40)
    expect(parseNote('F#3').midi).toBe(54)
    expect(parseNote('Bb3').midi).toBe(58)
    expect(() => parseNote('H2')).toThrow()
  })

  it('converts between MIDI and frequency with a custom A4', () => {
    expect(midiToFrequency(69)).toBe(440)
    expect(midiToFrequency(40)).toBeCloseTo(82.407, 3)
    expect(midiToFrequency(69, 432)).toBe(432)
    expect(frequencyToMidi(110)).toBeCloseTo(45, 6)
  })

  it('spells notes with sharps or flats', () => {
    expect(noteFromMidi(61)).toMatchObject({ letter: 'C', accidental: 1, octave: 4 })
    expect(noteFromMidi(61, true)).toMatchObject({ letter: 'D', accidental: -1, octave: 4 })
    expect(noteFromMidi(59.6)).toMatchObject({ letter: 'C', octave: 4 })
  })

  it('measures cents', () => {
    expect(centsBetween(440, 440)).toBe(0)
    expect(centsBetween(880, 440)).toBeCloseTo(1200)
    expect(centsBetween(440 * 2 ** (-14 / 1200), 440)).toBeCloseTo(-14)
  })
})

describe('tunings', () => {
  it('has 6 strings for guitars and 4 for ukulele', () => {
    TUNINGS.guitar.forEach((t) => expect(t.strings).toHaveLength(6))
    TUNINGS.ukulele.forEach((t) => expect(t.strings).toHaveLength(4))
  })

  it('falls back to the first tuning for unknown ids', () => {
    expect(getTuning('electric', 'nope').id).toBe('standard')
    expect(getTuning('ukulele', 'low-g').strings[0]!.midi).toBe(55)
  })
})

describe('matchString', () => {
  const standard = getTuning('acoustic', 'standard').strings

  it('auto-detects the closest string', () => {
    const m = matchString(108.1, standard, 440)
    expect(m.index).toBe(1)
    expect(m.cents).toBeLessThan(-25)
    expect(matchString(330, standard, 440).index).toBe(5)
  })

  it('respects the reference pitch', () => {
    expect(matchString(432, getTuning('ukulele', 'standard').strings, 432).cents).toBeCloseTo(0)
  })

  it('always uses the locked string in manual mode', () => {
    const m = matchString(82.4, standard, 440, { lockedIndex: 1 })
    expect(m.index).toBe(1)
    expect(m.cents).toBeCloseTo(-500, 0)
  })

  it('keeps the previous string until another is clearly closer', () => {
    // 222 Hz: ~216 cents above G3, ~184 cents below B3 — B3 wins, but not by enough to switch.
    expect(matchString(222, standard, 440).index).toBe(4)
    expect(matchString(222, standard, 440, { previousIndex: 3 }).index).toBe(3)
    expect(matchString(240, standard, 440, { previousIndex: 3 }).index).toBe(4)
  })
})
