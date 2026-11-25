import { useI18n } from '../i18n/context'
import { format } from '../i18n/messages'
import type { Tuning } from '../music/tunings'
import { CheckIcon, LockIcon } from './icons'

interface StringsPanelProps {
  tuning: Tuning
  /** String currently being detected (auto) or locked (manual). */
  activeIndex: number | null
  lockedIndex: number | null
  tuned: ReadonlySet<number>
  tone: 'idle' | 'off' | 'ok'
  onLock: (index: number | null) => void
}

export function StringsPanel({ tuning, activeIndex, lockedIndex, tuned, tone, onLock }: StringsPanelProps) {
  const { t, noteLabel, noteSpoken } = useI18n()
  const count = tuning.strings.length
  const auto = lockedIndex == null

  return (
    <section className="strings" aria-labelledby="strings-title">
      <div className="strings__header">
        <h2 id="strings-title" className="eyebrow">
          {t.strings}
        </h2>
        <button type="button" className="chip" aria-pressed={auto} aria-describedby="strings-hint" onClick={() => onLock(null)}>
          {t.auto}
        </button>
      </div>
      <div className="strings__row" role="group" aria-labelledby="strings-title" style={{ ['--count' as string]: count }}>
        {tuning.strings.map((note, index) => {
          const number = count - index
          const isActive = index === activeIndex
          const isLocked = index === lockedIndex
          const isTuned = tuned.has(index)
          const label = [format(t.stringNumber, number), noteSpoken(note), isTuned ? t.tuned : '', isActive && auto && tone !== 'idle' ? t.detected : '']
            .filter(Boolean)
            .join(', ')
          return (
            <button
              key={`${tuning.id}-${index}`}
              type="button"
              className={`string${isActive ? ` string--active string--${tone}` : ''}`}
              aria-label={label}
              aria-pressed={isLocked}
              onClick={() => onLock(isLocked ? null : index)}
            >
              <span className="string__note">{noteLabel(note)}</span>
              <span className="string__number">{number}</span>
              {isTuned ? (
                <span className="string__tuned">
                  <CheckIcon size={12} />
                </span>
              ) : null}
              {isLocked ? (
                <span className="string__lock">
                  <LockIcon />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      <p id="strings-hint" className="strings__hint">
        {auto ? t.autoHint : format(t.lockedHint, count - lockedIndex)}
      </p>
    </section>
  )
}
