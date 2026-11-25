import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MicrophonePitch } from './audio/useMicrophonePitch'
import App from './App'

const mic: MicrophonePitch = {
  status: 'idle',
  reading: null,
  start: vi.fn(async () => {}),
  togglePause: vi.fn(async () => {}),
  playCue: vi.fn(),
}

vi.mock('./audio/useMicrophonePitch', () => ({ useMicrophonePitch: () => mic }))

async function expectNoAxeViolations(container: Element) {
  // jsdom can't compute colors; contrast is covered by contrast.test.ts.
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([])
}

beforeEach(() => {
  mic.status = 'idle'
  mic.reading = null
  vi.mocked(mic.playCue).mockClear()
  Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true })
})

describe('App', () => {
  it('shows the start prompt and has no a11y violations', async () => {
    const { container } = render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Tuner' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Start tuning' }))
    expect(mic.start).toHaveBeenCalled()
    await expectNoAxeViolations(container)
  })

  it('shows the detected string and how far it is from pitch', async () => {
    mic.status = 'listening'
    mic.reading = { frequency: 110 * 2 ** (-14 / 1200), clarity: 0.98 }
    const { container } = render(<App />)

    const meter = screen.getByRole('meter', { name: 'Tuning accuracy' })
    expect(meter.getAttribute('aria-valuenow')).toBe('-14')
    expect(meter.getAttribute('aria-valuetext')).toBe('14 cents flat')
    expect(screen.getByText('Too low — tighten')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'String 5, A 2, detected' })).toBeTruthy()
    await expectNoAxeViolations(container)
  })

  it('switches instrument and locks a string manually', async () => {
    mic.status = 'listening'
    mic.reading = { frequency: 392, clarity: 0.98 }
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Ukulele' }))
    expect(screen.getByRole('button', { name: 'Ukulele' }).getAttribute('aria-pressed')).toBe('true')
    const strings = within(screen.getByRole('group', { name: 'Strings' })).getAllByRole('button')
    expect(strings).toHaveLength(4)

    await userEvent.click(screen.getByRole('button', { name: /^String 1, A 4/ }))
    expect(screen.getByRole('button', { name: /^String 1, A 4/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Auto' }).getAttribute('aria-pressed')).toBe('false')
    // G4 played against a locked A4 is 200 cents flat.
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('-50')
  })

  it('marks a string tuned and plays the cue after it settles', async () => {
    vi.useFakeTimers({ toFake: ['performance', 'setTimeout', 'clearTimeout'] })
    mic.status = 'listening'
    mic.reading = { frequency: 82.41, clarity: 0.99 }
    const { rerender } = render(<App />)
    await act(async () => vi.advanceTimersByTime(400))
    mic.reading = { frequency: 82.42, clarity: 0.99 }
    rerender(<App />)
    expect(mic.playCue).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: /^String 6, E 2, tuned/ })).toBeTruthy()
    vi.useRealTimers()
  })

  it('switches language, note names and reference pitch from settings', async () => {
    const { container } = render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    const dialog = screen.getByRole('dialog', { name: 'Settings' })
    await expectNoAxeViolations(container)

    await userEvent.click(within(dialog).getByRole('radio', { name: 'Português (Brasil)' }))
    expect(document.documentElement.lang).toBe('pt-BR')
    expect(screen.getByRole('heading', { level: 1, name: 'Afinador' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Violão' })).toBeTruthy()
    // Solfège is the default for Portuguese.
    expect(within(dialog).getByRole('radio', { name: 'Solfejo (Dó Ré Mi)' })).toHaveProperty('checked', true)

    await userEvent.click(within(dialog).getByRole('button', { name: 'Aumentar afinação de referência' }))
    expect(within(dialog).getByText(/Lá4 = 441 Hz/)).toBeTruthy()

    await userEvent.click(within(dialog).getByRole('switch', { name: 'Som ao afinar' }))
    expect(within(dialog).getByRole('switch').getAttribute('aria-checked')).toBe('false')

    expect(JSON.parse(localStorage.getItem('tuner:settings:v1')!)).toMatchObject({ locale: 'pt-BR', a4: 441, cue: false })
  })

  it('picks a tuning from the tunings dialog', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /^Tuning: Standard/ }))
    const dialog = screen.getByRole('dialog', { name: 'Guitar tunings' })
    await userEvent.click(within(dialog).getByRole('button', { name: /^Drop D,/ }))
    expect(screen.getByRole('button', { name: /^Tuning: Drop D/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /^String 6, D 2/ })).toBeTruthy()
  })

  it('explains a blocked microphone', () => {
    mic.status = 'denied'
    render(<App />)
    expect(screen.getByRole('alert').textContent).toContain('Microphone access is blocked')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
  })
})
