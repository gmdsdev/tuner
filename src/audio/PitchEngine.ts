import { YinDetector } from './yin'

export interface PitchReading {
  frequency: number
  clarity: number
}

export type EngineError = 'denied' | 'unsupported' | 'error'

const DETECT_INTERVAL_MS = 1000 / 30
/** Keep showing the last pitch this long after the note fades, so it can be read. */
const HOLD_MS = 450
const MEDIAN_SIZE = 5
const MIN_CLARITY = 0.85

type AudioContextCtor = typeof AudioContext

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === 'undefined') return undefined
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
}

export function isMicrophoneSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && !!getAudioContextCtor()
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]!
}

/**
 * Owns the microphone stream, Web Audio graph and detection loop.
 * Everything runs locally; no audio leaves the device.
 */
export class PitchEngine {
  private ctx: AudioContext | null = null
  private stream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private buffer: Float32Array<ArrayBuffer> = new Float32Array(0)
  private readonly detector = new YinDetector()
  private frame = 0
  private lastDetect = 0
  private lastHeard = 0
  private mutedUntil = 0
  private history: number[] = []
  private current: PitchReading | null = null

  private readonly onReading: (reading: PitchReading | null) => void

  constructor(onReading: (reading: PitchReading | null) => void) {
    this.onReading = onReading
  }

  get running(): boolean {
    return this.ctx?.state === 'running'
  }

  async start(): Promise<void> {
    const Ctor = getAudioContextCtor()
    if (!Ctor || !navigator.mediaDevices?.getUserMedia) throw 'unsupported' satisfies EngineError

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Processing meant for voice calls distorts pitch and kills sustained notes.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      throw (name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error') satisfies EngineError
    }

    const ctx = new Ctor()
    this.ctx = ctx
    if (ctx.state === 'suspended') await ctx.resume()

    const source = ctx.createMediaStreamSource(this.stream)
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 50
    const analyser = ctx.createAnalyser()
    let size = 1024
    while (size < this.detector.requiredLength(ctx.sampleRate)) size *= 2
    analyser.fftSize = Math.min(size, 32768)
    source.connect(highpass).connect(analyser)
    this.analyser = analyser
    this.buffer = new Float32Array(analyser.fftSize)

    this.loop()
  }

  async pause(): Promise<void> {
    cancelAnimationFrame(this.frame)
    await this.ctx?.suspend()
    this.emit(null)
  }

  async resume(): Promise<void> {
    if (!this.ctx) return
    await this.ctx.resume()
    this.loop()
  }

  stop(): void {
    cancelAnimationFrame(this.frame)
    this.stream?.getTracks().forEach((track) => track.stop())
    void this.ctx?.close()
    this.ctx = null
    this.stream = null
    this.analyser = null
  }

  /** Short, soft confirmation tone. Detection is muted briefly so the tone isn't picked up. */
  playCue(): void {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running') return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 1760
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)
    this.mutedUntil = performance.now() + 320
  }

  private loop = (): void => {
    this.frame = requestAnimationFrame(this.loop)
    const now = performance.now()
    if (now - this.lastDetect < DETECT_INTERVAL_MS || !this.analyser || !this.ctx) return
    this.lastDetect = now
    if (now < this.mutedUntil) return

    this.analyser.getFloatTimeDomainData(this.buffer)
    const estimate = this.detector.detect(this.buffer, this.ctx.sampleRate)

    if (estimate && estimate.clarity >= MIN_CLARITY) {
      this.lastHeard = now
      const last = this.history.length ? median(this.history) : null
      // A jump of more than ~a semitone means a new note: drop the old history.
      if (last && Math.abs(1200 * Math.log2(estimate.frequency / last)) > 90) this.history = []
      this.history.push(estimate.frequency)
      if (this.history.length > MEDIAN_SIZE) this.history.shift()
      this.emit({ frequency: median(this.history), clarity: estimate.clarity })
    } else if (now - this.lastHeard > HOLD_MS) {
      this.history = []
      this.emit(null)
    }
  }

  private emit(reading: PitchReading | null): void {
    if (reading === null && this.current === null) return
    this.current = reading
    this.onReading(reading)
  }
}
