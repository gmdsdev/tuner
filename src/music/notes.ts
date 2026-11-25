export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = -1 | 0 | 1

export interface Note {
  letter: Letter
  accidental: Accidental
  octave: number
  /** MIDI note number (A4 = 69). */
  midi: number
}

const LETTER_SEMITONES: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

const SHARP_SPELLING: ReadonlyArray<[Letter, Accidental]> = [
  ['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0],
  ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0],
]
const FLAT_SPELLING: ReadonlyArray<[Letter, Accidental]> = [
  ['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0],
  ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0],
]

const NOTE_RE = /^([A-G])([#b]?)(-?\d)$/

/** Parses scientific pitch notation such as "E2", "F#3" or "Bb3". */
export function parseNote(input: string): Note {
  const match = NOTE_RE.exec(input)
  if (!match) throw new Error(`Invalid note: ${input}`)
  const letter = match[1] as Letter
  const accidental: Accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0
  const octave = Number(match[3])
  return { letter, accidental, octave, midi: (octave + 1) * 12 + LETTER_SEMITONES[letter] + accidental }
}

export function noteFromMidi(midi: number, preferFlats = false): Note {
  const rounded = Math.round(midi)
  const pc = ((rounded % 12) + 12) % 12
  const [letter, accidental] = (preferFlats ? FLAT_SPELLING : SHARP_SPELLING)[pc]!
  // Octave follows the letter, so Cb/B# edge cases never occur with these spellings.
  return { letter, accidental, octave: Math.floor(rounded / 12) - 1, midi: rounded }
}

export function midiToFrequency(midi: number, a4 = 440): number {
  return a4 * 2 ** ((midi - 69) / 12)
}

/** Fractional MIDI number for a frequency. */
export function frequencyToMidi(frequency: number, a4 = 440): number {
  return 69 + 12 * Math.log2(frequency / a4)
}

/** Distance in cents from `target` to `frequency` (negative = flat). */
export function centsBetween(frequency: number, target: number): number {
  return 1200 * Math.log2(frequency / target)
}
