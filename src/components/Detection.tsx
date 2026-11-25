import type { MicStatus } from '../audio/useMicrophonePitch'
import { useI18n } from '../i18n/context'
import { format } from '../i18n/messages'
import type { Note } from '../music/notes'
import type { TunerView } from '../tuner/useTuner'
import { Gauge, type GaugeTone } from './Gauge'
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, MicIcon } from './icons'

interface DetectionProps {
  view: TunerView
  /** Target of the locked or last-detected string, shown while idle. */
  idleTarget: Note
  idleTargetHz: number
  status: MicStatus
  onStart: () => void
  onResume: () => void
}

export function Detection({ view, idleTarget, idleTargetHz, status, onStart, onResume }: DetectionProps) {
  const { t, letterName, accidentalSymbol, noteLabel, noteSpoken, formatCents, formatNumber } = useI18n()
  const { match, inTune } = view
  const active = status === 'listening' && match
  const tone: GaugeTone = !active ? 'idle' : inTune ? 'ok' : 'off'
  const note = active ? match.note : null
  const name = note ? letterName(note.letter) : '–'
  const longName = name.length > 2

  return (
    <section className="detection" aria-labelledby="detection-title">
      <h2 id="detection-title" className="sr-only">
        {t.detection}
      </h2>

      <p className="sr-only">{note ? format(t.detectedNote, noteSpoken(note)) : t.noSignal}</p>
      <div className={`note${note ? '' : ' note--empty'}${longName ? ' note--long' : ''}`} aria-hidden="true">
        <span className="note__name">{name}</span>
        <span className="note__side">
          <span className="note__acc">{note ? accidentalSymbol(note) : ''}</span>
          <span className="note__oct">{note ? note.octave : ''}</span>
        </span>
      </div>

      <Gauge cents={active ? match.cents : null} tone={tone} />

      <div className="status">
        {status === 'listening' ? (
          <>
            <p className={`status__main status__main--${tone}`}>
              {active ? (
                inTune ? <CheckIcon /> : match.cents < 0 ? <ArrowUpIcon /> : <ArrowDownIcon />
              ) : null}
              <span>{active ? (inTune ? t.inTune : match.cents < 0 ? t.tooLow : t.tooHigh) : t.playString}</span>
            </p>
            <p className="status__detail">
              {active
                ? `${formatCents(match.cents)} ${t.cents} · ${formatNumber(match.frequency, 1)} Hz`
                : `${t.target} ${noteLabel(idleTarget)}${idleTarget.octave} · ${formatNumber(idleTargetHz, 1)} Hz`}
            </p>
            {active && Math.abs(match.cents) > 50 ? (
              <p className="status__hint">{format(t.hearing, `${noteLabel(match.heard)}${match.heard.octave}`)}</p>
            ) : null}
          </>
        ) : (
          <MicPrompt status={status} onStart={onStart} onResume={onResume} />
        )}
      </div>
    </section>
  )
}

function MicPrompt({ status, onStart, onResume }: { status: MicStatus; onStart: () => void; onResume: () => void }) {
  const { t } = useI18n()

  if (status === 'paused') {
    return (
      <button type="button" className="primary-button" onClick={onResume}>
        <MicIcon />
        <span>{t.resume}</span>
      </button>
    )
  }

  if (status === 'unsupported') {
    return (
      <div className="mic-message" role="alert">
        <p className="mic-message__title">{t.unsupported}</p>
        <p className="mic-message__hint">{t.unsupportedHint}</p>
      </div>
    )
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className="mic-message" role="alert">
        <p className="mic-message__title">{status === 'denied' ? t.denied : t.error}</p>
        {status === 'denied' ? <p className="mic-message__hint">{t.deniedHint}</p> : null}
        <button type="button" className="primary-button" onClick={onStart}>
          <MicIcon />
          <span>{t.tryAgain}</span>
        </button>
      </div>
    )
  }

  const starting = status === 'starting'
  return (
    <div className="mic-message">
      <button type="button" className="primary-button" onClick={onStart} disabled={starting} aria-describedby="mic-hint">
        <MicIcon />
        <span>{starting ? t.starting : t.start}</span>
      </button>
      <p id="mic-hint" className="mic-message__hint">
        {t.startHint}
      </p>
    </div>
  )
}
