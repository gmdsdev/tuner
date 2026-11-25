export interface PitchOptions {
  minFrequency: number
  maxFrequency: number
  /** YIN absolute threshold on the normalized difference function (lower = stricter). */
  threshold: number
  /** RMS below this is treated as silence. */
  minRms: number
  /** Analysis window in samples. Shorter = faster, longer = steadier low notes. */
  windowSize: number
}

export const DEFAULT_PITCH_OPTIONS: PitchOptions = {
  minFrequency: 60,
  maxFrequency: 1200,
  threshold: 0.12,
  minRms: 0.008,
  windowSize: 2048,
}

export interface PitchEstimate {
  frequency: number
  /** 0–1, how periodic the signal is (1 = pure tone). */
  clarity: number
  rms: number
}

/**
 * YIN fundamental-frequency estimator (de Cheveigné & Kawahara, 2002).
 * Work buffers are reused between calls to avoid GC churn in the audio loop.
 */
export class YinDetector {
  private diff = new Float32Array(0)
  private readonly opts: PitchOptions

  constructor(options: Partial<PitchOptions> = {}) {
    this.opts = { ...DEFAULT_PITCH_OPTIONS, ...options }
  }

  /** Minimum input length needed for a given sample rate. */
  requiredLength(sampleRate: number): number {
    return this.opts.windowSize + Math.ceil(sampleRate / this.opts.minFrequency) + 2
  }

  detect(buffer: Float32Array, sampleRate: number): PitchEstimate | null {
    const { minFrequency, maxFrequency, threshold, minRms } = this.opts

    let sumSquares = 0
    for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i]! * buffer[i]!
    const rms = Math.sqrt(sumSquares / buffer.length)
    if (rms < minRms) return null

    const tauMin = Math.max(2, Math.floor(sampleRate / maxFrequency))
    const tauMax = Math.min(Math.ceil(sampleRate / minFrequency), buffer.length - 2)
    const window = Math.min(this.opts.windowSize, buffer.length - tauMax - 1)
    if (window <= 0 || tauMax <= tauMin) return null

    if (this.diff.length < tauMax + 2) this.diff = new Float32Array(tauMax + 2)
    const d = this.diff

    // Step 2: difference function.
    for (let tau = 1; tau <= tauMax + 1; tau++) {
      let sum = 0
      for (let j = 0; j < window; j++) {
        const delta = buffer[j]! - buffer[j + tau]!
        sum += delta * delta
      }
      d[tau] = sum
    }

    // Step 3: cumulative mean normalized difference.
    d[0] = 1
    let running = 0
    for (let tau = 1; tau <= tauMax + 1; tau++) {
      running += d[tau]!
      d[tau] = running === 0 ? 1 : (d[tau]! * tau) / running
    }

    // Step 4: absolute threshold — first dip below threshold, walked to its local minimum.
    let tauEstimate = -1
    for (let tau = tauMin; tau <= tauMax; tau++) {
      if (d[tau]! < threshold) {
        while (tau + 1 <= tauMax && d[tau + 1]! < d[tau]!) tau++
        tauEstimate = tau
        break
      }
    }
    if (tauEstimate === -1) return null

    // Step 5: parabolic interpolation around the minimum.
    const x0 = d[tauEstimate - 1]!
    const x1 = d[tauEstimate]!
    const x2 = d[tauEstimate + 1]!
    const denom = x0 + x2 - 2 * x1
    const shift = denom !== 0 ? (x0 - x2) / (2 * denom) : 0
    const refined = tauEstimate + Math.max(-1, Math.min(1, shift))

    const frequency = sampleRate / refined
    if (frequency < minFrequency || frequency > maxFrequency) return null
    return { frequency, clarity: Math.max(0, Math.min(1, 1 - x1)), rms }
  }
}
