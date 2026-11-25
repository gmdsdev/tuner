import { useId } from 'react'
import { useI18n, type NoteNaming } from '../i18n/context'
import { LOCALE_NAMES, LOCALES, type Locale } from '../i18n/messages'
import { A4_MAX, A4_MIN, type Settings } from '../settings/useSettings'
import { Dialog } from './Dialog'

interface SettingsDialogProps {
  open: boolean
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onClose: () => void
}

export function SettingsDialog({ open, settings, onChange, onClose }: SettingsDialogProps) {
  const { t, naming, letterName, formatNumber } = useI18n()
  const refLabel = useId()
  const cueLabel = useId()
  const cueHint = useId()
  const namings: [NoteNaming, string][] = [
    ['letters', t.letters],
    ['solfege', t.solfege],
  ]

  return (
    <Dialog open={open} onClose={onClose} title={t.settings}>
      <div className="settings">
        <fieldset className="radio-group">
          <legend className="eyebrow">{t.language}</legend>
          {LOCALES.map((locale: Locale) => (
            <label key={locale} className="radio" lang={locale}>
              <input
                type="radio"
                name="locale"
                value={locale}
                checked={settings.locale === locale}
                onChange={() => onChange({ locale })}
              />
              <span>{LOCALE_NAMES[locale]}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="radio-group">
          <legend className="eyebrow">{t.noteNames}</legend>
          {namings.map(([value, label]) => (
            <label key={value} className="radio">
              <input type="radio" name="naming" value={value} checked={naming === value} onChange={() => onChange({ naming: value })} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <div className="setting-row">
          <span id={refLabel}>{t.reference}</span>
          <div className="stepper" role="group" aria-labelledby={refLabel}>
            <button
              type="button"
              className="stepper__button"
              aria-label={t.decrease}
              // aria-disabled (not disabled) keeps focus on the button at the limit.
              aria-disabled={settings.a4 <= A4_MIN}
              onClick={() => settings.a4 > A4_MIN && onChange({ a4: settings.a4 - 1 })}
            >
              −
            </button>
            <output className="stepper__value" aria-live="polite">
              {letterName('A')}4 = {formatNumber(settings.a4)} Hz
            </output>
            <button
              type="button"
              className="stepper__button"
              aria-label={t.increase}
              aria-disabled={settings.a4 >= A4_MAX}
              onClick={() => settings.a4 < A4_MAX && onChange({ a4: settings.a4 + 1 })}
            >
              +
            </button>
          </div>
        </div>

        <div className="setting-row">
          <span className="setting-row__text">
            <span id={cueLabel}>{t.cue}</span>
            <span id={cueHint} className="setting-row__hint">
              {t.cueHint}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={settings.cue}
            aria-labelledby={cueLabel}
            aria-describedby={cueHint}
            onClick={() => onChange({ cue: !settings.cue })}
          >
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
          </button>
        </div>
      </div>
    </Dialog>
  )
}
