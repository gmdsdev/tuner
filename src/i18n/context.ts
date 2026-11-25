import { createContext, useContext } from 'react'
import type { Letter, Note } from '../music/notes'
import type { Tuning } from '../music/tunings'
import type { Locale, Messages } from './messages'

export type NoteNaming = 'letters' | 'solfege'

export const SOLFEGE: Record<Locale, Record<Letter, string>> = {
  en: { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' },
  'pt-BR': { C: 'Dó', D: 'Ré', E: 'Mi', F: 'Fá', G: 'Sol', A: 'Lá', B: 'Si' },
  es: { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' },
  fr: { C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' },
}

export function defaultNaming(locale: Locale): NoteNaming {
  return locale === 'en' ? 'letters' : 'solfege'
}

export interface I18n {
  locale: Locale
  naming: NoteNaming
  t: Messages
  /** Letter or syllable, without accidental. */
  letterName: (letter: Letter) => string
  /** "♯", "♭" or "". */
  accidentalSymbol: (note: Note) => string
  /** Short visual label, e.g. "A♯" or "La♯" (no octave). */
  noteLabel: (note: Note) => string
  /** Screen-reader friendly, e.g. "A sharp 2" / "Lá sustenido 2". */
  noteSpoken: (note: Note) => string
  tuningName: (tuning: Tuning) => string
  formatNumber: (value: number, fractionDigits?: number) => string
  /** Signed cents with a true minus sign, e.g. "−14". */
  formatCents: (cents: number) => string
}

export const I18nContext = createContext<I18n | null>(null)

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
