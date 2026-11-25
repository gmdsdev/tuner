import { memo } from 'react'
import { useI18n } from '../i18n/context'
import { format } from '../i18n/messages'
import { IN_TUNE_CENTS } from '../tuner/useTuner'

const CX = 160
const CY = 172
const R = 148
const RANGE = 50
const DEG_PER_CENT = 90 / RANGE

function polar(cents: number, radius: number): [number, number] {
  const a = (cents * DEG_PER_CENT * Math.PI) / 180
  return [CX + radius * Math.sin(a), CY - radius * Math.cos(a)]
}

function ticks(major: boolean): string {
  let d = ''
  for (let c = -RANGE; c <= RANGE; c += 5) {
    const isMajor = c % 25 === 0
    if (isMajor !== major) continue
    const [x0, y0] = polar(c, isMajor ? 128 : 138)
    const [x1, y1] = polar(c, R)
    d += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  return d
}

const MINOR_TICKS = ticks(false)
const MAJOR_TICKS = ticks(true)
const [ZL_X, ZL_Y] = polar(-IN_TUNE_CENTS, R)
const [ZR_X, ZR_Y] = polar(IN_TUNE_CENTS, R)
const ZONE = `M${ZL_X.toFixed(2)} ${ZL_Y.toFixed(2)}A${R} ${R} 0 0 1 ${ZR_X.toFixed(2)} ${ZR_Y.toFixed(2)}`
const LABELS = [-50, -25, 0, 25, 50].map((c) => {
  const [x, y] = polar(c, 112)
  return { c, x, y }
})

export type GaugeTone = 'idle' | 'off' | 'ok'

interface GaugeProps {
  /** null = no signal. */
  cents: number | null
  tone: GaugeTone
}

export const Gauge = memo(function Gauge({ cents, tone }: GaugeProps) {
  const { t, formatCents } = useI18n()
  const shown = cents == null ? 0 : Math.max(-RANGE, Math.min(RANGE, cents))
  const rounded = cents == null ? 0 : Math.round(cents)
  const valueText =
    cents == null
      ? t.noSignal
      : Math.abs(cents) <= IN_TUNE_CENTS
        ? t.inTune
        : format(cents < 0 ? t.flatBy : t.sharpBy, Math.abs(rounded))

  return (
    <div
      className={`gauge gauge--${tone}`}
      role="meter"
      aria-label={t.meterLabel}
      aria-valuemin={-RANGE}
      aria-valuemax={RANGE}
      aria-valuenow={Math.max(-RANGE, Math.min(RANGE, rounded))}
      aria-valuetext={valueText}
    >
      <svg viewBox="0 0 320 190" aria-hidden="true" focusable="false">
        <path className="gauge__track" d={`M${CX - R} ${CY}A${R} ${R} 0 0 1 ${CX + R} ${CY}`} />
        <path className="gauge__zone" d={ZONE} />
        <path className="gauge__minor" d={MINOR_TICKS} />
        <path className="gauge__major" d={MAJOR_TICKS} />
        {LABELS.map(({ c, x, y }) => (
          <text key={c} className="gauge__label" x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            {c === 0 ? '0' : formatCents(c)}
          </text>
        ))}
        <g className="gauge__needle" style={{ transform: `rotate(${(shown * DEG_PER_CENT).toFixed(2)}deg)` }}>
          <line x1={CX} y1={CY} x2={CX} y2={34} />
        </g>
        <circle className="gauge__hub" cx={CX} cy={CY} r={8} />
      </svg>
    </div>
  )
})
