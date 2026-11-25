import { centsBetween, midiToFrequency, type Note } from './notes'

export interface StringMatch {
  index: number
  /** Deviation from the string's target pitch, in cents (negative = flat). */
  cents: number
  targetFrequency: number
}

/** Extra cents a new string must win by before auto-detect switches away from the current one. */
const HYSTERESIS_CENTS = 40

/**
 * Picks the string whose target pitch is closest to `frequency`.
 * When `lockedIndex` is set, the match is always that string (manual mode).
 * `previousIndex` adds hysteresis so the highlight doesn't flicker between
 * strings that are close together (e.g. G3/B3 on a detuned guitar).
 */
export function matchString(
  frequency: number,
  strings: readonly Note[],
  a4: number,
  options: { lockedIndex?: number | null; previousIndex?: number | null } = {},
): StringMatch {
  const candidates = strings.map((note, index) => {
    const targetFrequency = midiToFrequency(note.midi, a4)
    return { index, targetFrequency, cents: centsBetween(frequency, targetFrequency) }
  })

  const { lockedIndex, previousIndex } = options
  if (lockedIndex != null && candidates[lockedIndex]) return candidates[lockedIndex]

  let best = candidates[0]!
  for (const c of candidates) if (Math.abs(c.cents) < Math.abs(best.cents)) best = c

  const previous = previousIndex != null ? candidates[previousIndex] : undefined
  if (previous && previous.index !== best.index && Math.abs(previous.cents) < Math.abs(best.cents) + HYSTERESIS_CENTS) {
    return previous
  }
  return best
}
