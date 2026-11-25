import { useCallback, useState } from 'react'
import { useMicrophonePitch } from './audio/useMicrophonePitch'
import { Controls } from './components/Controls'
import { Detection } from './components/Detection'
import { SlidersIcon } from './components/icons'
import { LiveAnnouncer } from './components/LiveAnnouncer'
import { SettingsDialog } from './components/SettingsDialog'
import { StringsPanel } from './components/StringsPanel'
import { TuningsDialog } from './components/TuningsDialog'
import { defaultNaming, useI18n } from './i18n/context'
import { I18nProvider } from './i18n/I18nProvider'
import { midiToFrequency } from './music/notes'
import { getTuning, type Instrument } from './music/tunings'
import { useSettings, type Settings } from './settings/useSettings'
import { useTuner } from './tuner/useTuner'

export default function App() {
  const [settings, update] = useSettings()
  return (
    <I18nProvider locale={settings.locale} naming={settings.naming ?? defaultNaming(settings.locale)}>
      <Tuner settings={settings} update={update} />
    </I18nProvider>
  )
}

type Sheet = 'tunings' | 'settings' | null

function Tuner({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => void }) {
  const { t, noteSpoken, formatNumber, letterName } = useI18n()
  const mic = useMicrophonePitch()
  const [sheet, setSheet] = useState<Sheet>(null)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)

  const instrument = settings.instrument
  const tuning = getTuning(instrument, settings.tuningByInstrument[instrument])

  const { playCue } = mic
  const onSettled = useCallback(() => {
    if (!settings.cue) return
    playCue()
    navigator.vibrate?.(40)
  }, [settings.cue, playCue])

  const view = useTuner(mic.status === 'listening' ? mic.reading : null, tuning, settings.a4, lockedIndex, onSettled)
  const { match, inTune } = view
  const tone = !match ? 'idle' : inTune ? 'ok' : 'off'

  const idleIndex = lockedIndex ?? 0
  const idleTarget = tuning.strings[idleIndex]!
  const activeIndex = match?.index ?? lockedIndex

  const selectInstrument = (next: Instrument) => {
    setLockedIndex(null)
    update({ instrument: next })
  }

  const statusLabel = mic.status === 'paused' ? t.paused : t.listening
  const showMicToggle = mic.status === 'listening' || mic.status === 'paused'
  const announcement =
    mic.status !== 'listening'
      ? ''
      : match
        ? `${noteSpoken(match.note)}, ${inTune ? t.inTune : match.cents < 0 ? t.tooLow : t.tooHigh}`
        : t.playString

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="topbar__title">{t.appTitle}</h1>
        <div className="topbar__actions">
          {showMicToggle ? (
            <button type="button" className={`mic-toggle mic-toggle--${mic.status}`} onClick={() => void mic.togglePause()}>
              <span className="mic-toggle__dot" aria-hidden="true" />
              <span>{statusLabel}</span>
              <span className="sr-only">, {mic.status === 'paused' ? t.resumeAction : t.pauseAction}</span>
            </button>
          ) : null}
          <span className="topbar__ref">
            {letterName('A')}4 = {formatNumber(settings.a4)} Hz
          </span>
          <button
            type="button"
            className="icon-button"
            aria-label={t.settings}
            aria-haspopup="dialog"
            onClick={() => setSheet('settings')}
          >
            <SlidersIcon />
          </button>
        </div>
      </header>

      <main className="layout">
        <Controls instrument={instrument} tuning={tuning} onInstrument={selectInstrument} onOpenTunings={() => setSheet('tunings')} />

        <Detection
          view={view}
          idleTarget={idleTarget}
          idleTargetHz={midiToFrequency(idleTarget.midi, settings.a4)}
          status={mic.status}
          onStart={() => void mic.start()}
          onResume={() => void mic.togglePause()}
        />

        <StringsPanel
          tuning={tuning}
          activeIndex={activeIndex}
          lockedIndex={lockedIndex}
          tuned={view.tuned}
          tone={tone}
          onLock={setLockedIndex}
        />
      </main>

      <LiveAnnouncer message={announcement} />

      <TuningsDialog
        open={sheet === 'tunings'}
        instrument={instrument}
        selected={tuning}
        onClose={() => setSheet(null)}
        onSelect={(next) => {
          setLockedIndex(null)
          update({ tuningByInstrument: { ...settings.tuningByInstrument, [instrument]: next.id } })
          setSheet(null)
        }}
      />
      <SettingsDialog open={sheet === 'settings'} settings={settings} onChange={update} onClose={() => setSheet(null)} />
    </div>
  )
}
