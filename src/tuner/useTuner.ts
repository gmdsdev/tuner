import { useEffect, useMemo, useRef, useState } from 'react'
import type { PitchReading } from '../audio/PitchEngine'
import { matchString, type StringMatch } from '../music/matchString'
import { frequencyToMidi, noteFromMidi, type Note } from '../music/notes'
import type { Tuning } from '../music/tunings'

/** ±cents counted as "in tune". */
export const IN_TUNE_CENTS = 5
/** How long a string must stay in tune before it's marked tuned (and the cue plays). */
export const SETTLE_MS = 350
/** Leaving tune by this much re-arms the cue for that string. */
const REARM_CENTS = 12

export interface TunerMatch extends StringMatch {
  /** Target note of the matched string. */
  note: Note
  frequency: number
  /** Nearest chromatic note to what's actually being played. */
  heard: Note
}

export interface TunerView {
  match: TunerMatch | null
  inTune: boolean
  tuned: ReadonlySet<number>
}

interface Settle {
  key: string
  since: number
  fired: boolean
}

export function useTuner(
  reading: PitchReading | null,
  tuning: Tuning,
  a4: number,
  lockedIndex: number | null,
  onSettled: () => void,
): TunerView {
  // Derived-from-previous-render state (React's recommended alternative to refs read in render).
  const [seenTuning, setSeenTuning] = useState(tuning)
  const [sticky, setSticky] = useState<number | null>(null)
  const [tuned, setTuned] = useState<ReadonlySet<number>>(() => new Set())

  if (seenTuning !== tuning) {
    setSeenTuning(tuning)
    setSticky(null)
    setTuned(new Set())
  }

  const match = useMemo<TunerMatch | null>(() => {
    if (!reading) return null
    const m = matchString(reading.frequency, tuning.strings, a4, { lockedIndex, previousIndex: sticky })
    return {
      ...m,
      note: tuning.strings[m.index]!,
      frequency: reading.frequency,
      heard: noteFromMidi(frequencyToMidi(reading.frequency, a4), tuning.preferFlats),
    }
  }, [reading, tuning, a4, lockedIndex, sticky])

  if (match && match.index !== sticky) setSticky(match.index)

  const inTune = !!match && Math.abs(match.cents) <= IN_TUNE_CENTS

  const onSettledRef = useRef(onSettled)
  const settle = useRef<Settle | null>(null)
  useEffect(() => {
    onSettledRef.current = onSettled
  }, [onSettled])

  // Time-based: a string counts as tuned once it has held within tolerance for SETTLE_MS.
  useEffect(() => {
    if (!match) return
    const now = performance.now()
    const key = `${tuning.id}:${match.index}`
    const s = settle.current
    if (!s || s.key !== key || Math.abs(match.cents) > REARM_CENTS) {
      settle.current = { key, since: now, fired: false }
      return
    }
    if (!inTune) {
      s.since = now
      return
    }
    if (!s.fired && now - s.since >= SETTLE_MS) {
      s.fired = true
      const index = match.index
      setTuned((prev) => (prev.has(index) ? prev : new Set(prev).add(index)))
      onSettledRef.current()
    }
  }, [match, inTune, tuning.id])

  return { match, inTune, tuned }
}
