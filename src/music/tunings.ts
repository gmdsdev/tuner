import { parseNote, type Letter, type Note } from './notes'

export type Instrument = 'acoustic' | 'electric' | 'ukulele'
export type InstrumentFamily = 'guitar' | 'ukulele'

export const INSTRUMENTS: readonly Instrument[] = ['acoustic', 'electric', 'ukulele']

/** Keys into the `tuningNames` i18n table; `{n}` is replaced by `noteParam`. */
export type TuningNameKey = 'standard' | 'standardHigh' | 'drop' | 'halfStepDown' | 'open' | 'dadgad' | 'low' | 'baritone' | 'keyOf'

export interface Tuning {
  id: string
  nameKey: TuningNameKey
  /** Note letter injected into the localized name, e.g. "Drop {n}". */
  noteParam?: Letter
  /** Strings from lowest-numbered physical position (thickest / top) to highest. */
  strings: readonly Note[]
  /** Spell detected chromatic notes with flats. */
  preferFlats?: boolean
}

const t = (id: string, nameKey: TuningNameKey, notes: string, extra: Partial<Tuning> = {}): Tuning => ({
  id,
  nameKey,
  strings: notes.split(' ').map(parseNote),
  ...extra,
})

export const TUNINGS: Record<InstrumentFamily, readonly Tuning[]> = {
  guitar: [
    t('standard', 'standard', 'E2 A2 D3 G3 B3 E4'),
    t('drop-d', 'drop', 'D2 A2 D3 G3 B3 E4', { noteParam: 'D' }),
    t('half-down', 'halfStepDown', 'Eb2 Ab2 Db3 Gb3 Bb3 Eb4', { preferFlats: true }),
    t('open-g', 'open', 'D2 G2 D3 G3 B3 D4', { noteParam: 'G' }),
    t('open-d', 'open', 'D2 A2 D3 F#3 A3 D4', { noteParam: 'D' }),
    t('dadgad', 'dadgad', 'D2 A2 D3 G3 A3 D4'),
  ],
  ukulele: [
    t('standard', 'standardHigh', 'G4 C4 E4 A4', { noteParam: 'G' }),
    t('low-g', 'low', 'G3 C4 E4 A4', { noteParam: 'G' }),
    t('baritone', 'baritone', 'D3 G3 B3 E4'),
    t('d-tuning', 'keyOf', 'A4 D4 F#4 B4', { noteParam: 'D' }),
  ],
}

export function familyOf(instrument: Instrument): InstrumentFamily {
  return instrument === 'ukulele' ? 'ukulele' : 'guitar'
}

export function getTuning(instrument: Instrument, id: string): Tuning {
  const list = TUNINGS[familyOf(instrument)]
  return list.find((tuning) => tuning.id === id) ?? list[0]!
}
