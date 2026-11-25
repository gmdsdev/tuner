import { useI18n } from '../i18n/context'
import { familyOf, TUNINGS, type Instrument, type Tuning } from '../music/tunings'
import { Dialog } from './Dialog'
import { CheckIcon } from './icons'

interface TuningsDialogProps {
  open: boolean
  instrument: Instrument
  selected: Tuning
  onSelect: (tuning: Tuning) => void
  onClose: () => void
}

export function TuningsDialog({ open, instrument, selected, onSelect, onClose }: TuningsDialogProps) {
  const { t, tuningName, noteLabel } = useI18n()
  const family = familyOf(instrument)
  return (
    <Dialog open={open} onClose={onClose} title={t.tuningsTitle[family]}>
      <ul className="option-list">
        {TUNINGS[family].map((tuning) => {
          const isSelected = tuning.id === selected.id
          const notes = tuning.strings.map(noteLabel).join(' ')
          return (
            <li key={tuning.id}>
              <button
                type="button"
                className="option"
                aria-pressed={isSelected}
                aria-label={`${tuningName(tuning)}, ${notes}`}
                onClick={() => onSelect(tuning)}
              >
                <span className="option__text">
                  <span className="option__title">{tuningName(tuning)}</span>
                  <span className="option__sub">{notes}</span>
                </span>
                {isSelected ? (
                  <span className="option__check">
                    <CheckIcon />
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </Dialog>
  )
}
