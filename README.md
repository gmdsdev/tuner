# Tuner

Guitar (acoustic / electric) and ukulele tuner that runs entirely in the browser. Mic audio is analysed locally with the Web Audio API — nothing is uploaded.

## Features

- Auto-detects the note and the string being played; shows the offset in cents on an arc gauge (±50¢, in tune = ±5¢).
- Manual mode: tap a string to lock onto it, tap **Auto** to go back.
- Tunings — guitar: Standard, Drop D, Half-step down, Open G, Open D, DADGAD · ukulele: Standard (high G), Low G, Baritone, D tuning.
- Adjustable reference pitch (A4 = 430–450 Hz), optional sound + vibration cue when a string settles in tune.
- i18n: English, Português (Brasil), Español, Français — detected from the browser, switchable in Settings. Note names as letters (C D E) or solfège (Dó Ré Mi), localized number formatting.
- Mobile-first dark UI with a two-column layout on desktop and landscape phones.

## Scripts

```bash
npm install
npm run dev        # http://localhost:5173 (mic requires localhost or HTTPS)
npm test           # unit + component + axe tests
npm run lint       # oxlint incl. jsx-a11y
npm run typecheck
npm run build      # static output in dist/
```

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/audio/yin.ts` | YIN pitch detector (no dependencies, reusable buffers) |
| `src/audio/PitchEngine.ts` | Mic stream, high-pass → analyser graph, 30 fps detection loop, median smoothing, note hold, cue tone |
| `src/audio/useMicrophonePitch.ts` | React hook: permission states (`idle / starting / listening / paused / denied / unsupported / error`) |
| `src/music/*` | Note math, tuning presets, closest-string matching with hysteresis |
| `src/tuner/useTuner.ts` | Combines pitch + tuning into a view model; tracks strings that settled in tune |
| `src/i18n/*` | Typed message catalogs, locale detection, note naming |
| `src/settings/useSettings.ts` | Validated, persisted settings (localStorage) |
| `src/components/*` | UI |

Mic constraints disable echo cancellation, noise suppression and auto gain — those voice filters distort sustained notes.

## Accessibility

Targets WCAG 2.2 AA:

- Native `<dialog>` for sheets (focus trap, Escape, inert background) with focus returned to the trigger.
- Gauge exposed as `role="meter"` with localized `aria-valuetext` ("14 cents flat"); a polite live region announces note/status changes only once they settle (no chatter while the pitch wobbles).
- Real buttons, radios and a switch; `aria-pressed` for instrument, strings and Auto; explicit names where stacked text would merge.
- Contrast ≥ 4.5:1 for all text (asserted in `src/test/contrast.test.ts`), state never conveyed by color alone, 44 px minimum targets, visible focus ring.
- Respects `prefers-reduced-motion` and Windows forced-colors mode; rem-based sizing for text zoom.
- `axe-core` runs in the component tests; `jsx-a11y` runs in lint.

## Deploy

Static site — on Vercel, import the repo with the Vite preset (build `npm run build`, output `dist`). HTTPS is required for microphone access.
