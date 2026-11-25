import { describe, expect, it } from 'vitest'
import { detectLocale } from '../i18n/messages'
import { loadSettings } from './useSettings'

describe('loadSettings', () => {
  it('returns defaults for missing or corrupt data', () => {
    expect(loadSettings(null).a4).toBe(440)
    expect(loadSettings('{not json').instrument).toBe('acoustic')
  })

  it('validates each field', () => {
    const s = loadSettings(JSON.stringify({ locale: 'xx', a4: 999, cue: 'yes', instrument: 'banjo', naming: 'solfege' }))
    expect(s.a4).toBe(440)
    expect(s.cue).toBe(true)
    expect(s.instrument).toBe('acoustic')
    expect(s.naming).toBe('solfege')
  })
})

describe('detectLocale', () => {
  it('maps browser languages to supported locales', () => {
    expect(detectLocale(['pt-PT'])).toBe('pt-BR')
    expect(detectLocale(['de-DE', 'es-MX'])).toBe('es')
    expect(detectLocale(['fr-CA'])).toBe('fr')
    expect(detectLocale(['ja'])).toBe('en')
  })
})
