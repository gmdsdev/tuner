import { useI18n } from '../i18n/context'
import { INSTRUMENTS, type Instrument, type Tuning } from '../music/tunings'
import { ChevronDownIcon } from './icons'

export function InstrumentPicker({ value, onChange }: { value: Instrument; onChange: (instrument: Instrument) => void }) {
  const { t } = useI18n()
  return (
    <div className="segmented" role="group" aria-label={t.instrument}>
      {INSTRUMENTS.map((instrument) => (
        <button
          key={instrument}
          type="button"
          className="segmented__item"
          aria-pressed={instrument === value}
          onClick={() => onChange(instrument)}
        >
          {t.instruments[instrument]}
        </button>
      ))}
    </div>
  )
}

export function TuningButton({ tuning, onOpen }: { tuning: Tuning; onOpen: () => void }) {
  const { t, tuningName, noteLabel } = useI18n()
  const notes = tuning.strings.map(noteLabel).join(' ')
  return (
    // Explicit label so screen readers get separators between the stacked texts.
    <button
      type="button"
      className="tuning-button"
      aria-haspopup="dialog"
      aria-label={`${t.tuning}: ${tuningName(tuning)}, ${notes}`}
      onClick={onOpen}
    >
      <span className="tuning-button__text">
        <span className="eyebrow">{t.tuning}</span>
        <span className="tuning-button__name">{tuningName(tuning)}</span>
      </span>
      <span className="tuning-button__notes">
        <span>{notes}</span>
        <ChevronDownIcon />
      </span>
    </button>
  )
}

interface ControlsProps {
  instrument: Instrument
  tuning: Tuning
  onInstrument: (instrument: Instrument) => void
  onOpenTunings: () => void
}

export function Controls({ instrument, tuning, onInstrument, onOpenTunings }: ControlsProps) {
  return (
    <div className="controls">
      <InstrumentPicker value={instrument} onChange={onInstrument} />
      <TuningButton tuning={tuning} onOpen={onOpenTunings} />
    </div>
  )
}
