import { useCallback, useEffect, useState } from 'react'
import { detectLocale, LOCALES, type Locale } from '../i18n/messages'
import type { NoteNaming } from '../i18n/context'
import { INSTRUMENTS, type Instrument } from '../music/tunings'

export interface Settings {
  locale: Locale
  /** null = follow the language default. */
  naming: NoteNaming | null
  a4: number
  cue: boolean
  instrument: Instrument
  tuningByInstrument: Record<Instrument, string>
}

export const A4_MIN = 430
export const A4_MAX = 450

const STORAGE_KEY = 'tuner:settings:v1'

function defaults(): Settings {
  return {
    locale: detectLocale(),
    naming: null,
    a4: 440,
    cue: true,
    instrument: 'acoustic',
    tuningByInstrument: { acoustic: 'standard', electric: 'standard', ukulele: 'standard' },
  }
}

/** Validates stored data field by field so a corrupt or old entry never breaks the app. */
export function loadSettings(raw: string | null): Settings {
  const base = defaults()
  if (!raw) return base
  try {
    const data = JSON.parse(raw) as Partial<Settings>
    return {
      locale: LOCALES.includes(data.locale as Locale) ? (data.locale as Locale) : base.locale,
      naming: data.naming === 'letters' || data.naming === 'solfege' ? data.naming : null,
      a4: typeof data.a4 === 'number' && data.a4 >= A4_MIN && data.a4 <= A4_MAX ? Math.round(data.a4) : base.a4,
      cue: typeof data.cue === 'boolean' ? data.cue : base.cue,
      instrument: INSTRUMENTS.includes(data.instrument as Instrument) ? (data.instrument as Instrument) : base.instrument,
      tuningByInstrument: { ...base.tuningByInstrument, ...(typeof data.tuningByInstrument === 'object' ? data.tuningByInstrument : {}) },
    }
  } catch {
    return base
  }
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings(readStorage()))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Private mode or storage full: settings just won't persist.
    }
  }, [settings])

  const update = useCallback((patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch })), [])

  return [settings, update] as const
}
