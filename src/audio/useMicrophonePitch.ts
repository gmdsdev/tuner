import { useCallback, useEffect, useRef, useState } from 'react'
import { isMicrophoneSupported, PitchEngine, type EngineError, type PitchReading } from './PitchEngine'

export type MicStatus = 'idle' | 'starting' | 'listening' | 'paused' | EngineError

export interface MicrophonePitch {
  status: MicStatus
  reading: PitchReading | null
  start: () => Promise<void>
  togglePause: () => Promise<void>
  playCue: () => void
}

export function useMicrophonePitch(): MicrophonePitch {
  const [status, setStatus] = useState<MicStatus>(() => (isMicrophoneSupported() ? 'idle' : 'unsupported'))
  const [reading, setReading] = useState<PitchReading | null>(null)
  const engineRef = useRef<PitchEngine | null>(null)

  useEffect(() => () => engineRef.current?.stop(), [])

  const start = useCallback(async () => {
    engineRef.current?.stop()
    const engine = new PitchEngine(setReading)
    engineRef.current = engine
    setStatus('starting')
    try {
      await engine.start()
      setStatus('listening')
    } catch (err) {
      engine.stop()
      engineRef.current = null
      setStatus(err === 'denied' || err === 'unsupported' ? err : 'error')
    }
  }, [])

  const togglePause = useCallback(async () => {
    const engine = engineRef.current
    if (!engine) return
    if (engine.running) {
      await engine.pause()
      setStatus('paused')
    } else {
      await engine.resume()
      setStatus('listening')
    }
  }, [])

  // Stop processing while the tab is hidden; pick up again when visible.
  useEffect(() => {
    const onVisibility = () => {
      const engine = engineRef.current
      if (!engine) return
      if (document.hidden && engine.running) void engine.pause()
      else if (!document.hidden && status === 'listening' && !engine.running) void engine.resume()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [status])

  const playCue = useCallback(() => engineRef.current?.playCue(), [])

  return { status, reading, start, togglePause, playCue }
}
