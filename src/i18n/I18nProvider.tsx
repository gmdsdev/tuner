import { useEffect, useMemo, type ReactNode } from 'react'
import type { Letter, Note } from '../music/notes'
import { I18nContext, SOLFEGE, type I18n, type NoteNaming } from './context'
import { format, MESSAGES, type Locale } from './messages'

export function I18nProvider({ locale, naming, children }: { locale: Locale; naming: NoteNaming; children: ReactNode }) {
  const value = useMemo<I18n>(() => {
    const t = MESSAGES[locale]
    const letterName = (letter: Letter) => (naming === 'solfege' ? SOLFEGE[locale][letter] : letter)
    const accidentalSymbol = (note: Note) => (note.accidental === 1 ? '♯' : note.accidental === -1 ? '♭' : '')
    const numberFormats = new Map<number, Intl.NumberFormat>()
    const formatNumber = (value: number, fractionDigits = 0) => {
      let nf = numberFormats.get(fractionDigits)
      if (!nf) {
        nf = new Intl.NumberFormat(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
        numberFormats.set(fractionDigits, nf)
      }
      return nf.format(value)
    }
    return {
      locale,
      naming,
      t,
      letterName,
      accidentalSymbol,
      noteLabel: (note) => letterName(note.letter) + accidentalSymbol(note),
      noteSpoken: (note) =>
        [letterName(note.letter), note.accidental === 1 ? t.sharpWord : note.accidental === -1 ? t.flatWord : '', note.octave]
          .filter((part) => part !== '')
          .join(' '),
      tuningName: (tuning) => format(t.tuningNames[tuning.nameKey], tuning.noteParam ? letterName(tuning.noteParam) : ''),
      formatNumber,
      formatCents: (cents) => {
        const rounded = Math.round(cents)
        const abs = formatNumber(Math.abs(rounded))
        return rounded > 0 ? `+${abs}` : rounded < 0 ? `−${abs}` : abs
      },
    }
  }, [locale, naming])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = value.t.appTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', value.t.appDescription)
  }, [locale, value])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

