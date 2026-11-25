import type { Instrument, TuningNameKey } from '../music/tunings'

export const LOCALES = ['en', 'pt-BR', 'es', 'fr'] as const
export type Locale = (typeof LOCALES)[number]

/** Native names: each option is labelled in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  'pt-BR': 'Português (Brasil)',
  es: 'Español',
  fr: 'Français',
}

/** `{n}` placeholders are filled with `format()`. */
export interface Messages {
  appTitle: string
  appDescription: string
  listening: string
  paused: string
  pauseAction: string
  resumeAction: string
  resume: string
  settings: string
  close: string
  instrument: string
  instruments: Record<Instrument, string>
  tuning: string
  tuningsTitle: { guitar: string; ukulele: string }
  tuningNames: Record<TuningNameKey, string>
  detection: string
  meterLabel: string
  strings: string
  stringNumber: string
  tuned: string
  detected: string
  auto: string
  autoHint: string
  lockedHint: string
  playString: string
  inTune: string
  tooLow: string
  tooHigh: string
  flatBy: string
  sharpBy: string
  cents: string
  noSignal: string
  detectedNote: string
  hearing: string
  target: string
  language: string
  noteNames: string
  letters: string
  solfege: string
  reference: string
  decrease: string
  increase: string
  cue: string
  cueHint: string
  start: string
  startHint: string
  starting: string
  denied: string
  deniedHint: string
  unsupported: string
  unsupportedHint: string
  error: string
  tryAgain: string
  sharpWord: string
  flatWord: string
}

const en: Messages = {
  appTitle: 'Tuner',
  appDescription: 'Free guitar and ukulele tuner that runs entirely in your browser.',
  listening: 'Listening',
  paused: 'Paused',
  pauseAction: 'pause',
  resumeAction: 'resume',
  resume: 'Resume',
  settings: 'Settings',
  close: 'Close',
  instrument: 'Instrument',
  instruments: { acoustic: 'Acoustic', electric: 'Electric', ukulele: 'Ukulele' },
  tuning: 'Tuning',
  tuningsTitle: { guitar: 'Guitar tunings', ukulele: 'Ukulele tunings' },
  tuningNames: {
    standard: 'Standard', standardHigh: 'Standard (high {n})', drop: 'Drop {n}', halfStepDown: 'Half-step down',
    open: 'Open {n}', dadgad: 'DADGAD', low: 'Low {n}', baritone: 'Baritone', keyOf: '{n} tuning',
  },
  detection: 'Pitch',
  meterLabel: 'Tuning accuracy',
  strings: 'Strings',
  stringNumber: 'String {n}',
  tuned: 'tuned',
  detected: 'detected',
  auto: 'Auto',
  autoHint: 'Detects the string automatically. Tap a string to lock it.',
  lockedHint: 'Locked to string {n}. Tap Auto to detect automatically.',
  playString: 'Play a string',
  inTune: 'In tune',
  tooLow: 'Too low — tighten',
  tooHigh: 'Too high — loosen',
  flatBy: '{n} cents flat',
  sharpBy: '{n} cents sharp',
  cents: 'cents',
  noSignal: 'No sound detected',
  detectedNote: 'Target note: {n}',
  hearing: 'Hearing {n}',
  target: 'Target',
  language: 'Language',
  noteNames: 'Note names',
  letters: 'Letters (C D E)',
  solfege: 'Solfège (Do Re Mi)',
  reference: 'Reference pitch',
  decrease: 'Lower reference pitch',
  increase: 'Raise reference pitch',
  cue: 'Sound when in tune',
  cueHint: 'Plays a short tone and vibrates, where supported.',
  start: 'Start tuning',
  startHint: 'Uses your microphone. Audio is processed on this device and never uploaded.',
  starting: 'Requesting microphone…',
  denied: 'Microphone access is blocked',
  deniedHint: 'Allow microphone access for this site in your browser settings, then try again.',
  unsupported: 'This browser can’t use the microphone',
  unsupportedHint: 'Open the tuner in a recent version of Chrome, Edge, Firefox or Safari, over HTTPS.',
  error: 'Couldn’t start the microphone',
  tryAgain: 'Try again',
  sharpWord: 'sharp',
  flatWord: 'flat',
}

const ptBR: Messages = {
  appTitle: 'Afinador',
  appDescription: 'Afinador gratuito de violão, guitarra e ukulele que funciona direto no navegador.',
  listening: 'Ouvindo',
  paused: 'Pausado',
  pauseAction: 'pausar',
  resumeAction: 'retomar',
  resume: 'Retomar',
  settings: 'Configurações',
  close: 'Fechar',
  instrument: 'Instrumento',
  instruments: { acoustic: 'Violão', electric: 'Guitarra', ukulele: 'Ukulele' },
  tuning: 'Afinação',
  tuningsTitle: { guitar: 'Afinações de violão e guitarra', ukulele: 'Afinações de ukulele' },
  tuningNames: {
    standard: 'Padrão', standardHigh: 'Padrão ({n} agudo)', drop: 'Drop {n}', halfStepDown: 'Meio tom abaixo',
    open: 'Aberta em {n}', dadgad: 'DADGAD', low: '{n} grave', baritone: 'Barítono', keyOf: 'Afinação em {n}',
  },
  detection: 'Afinação',
  meterLabel: 'Precisão da afinação',
  strings: 'Cordas',
  stringNumber: 'Corda {n}',
  tuned: 'afinada',
  detected: 'detectada',
  auto: 'Auto',
  autoHint: 'Detecta a corda automaticamente. Toque numa corda para fixá-la.',
  lockedHint: 'Fixado na corda {n}. Toque em Auto para detectar automaticamente.',
  playString: 'Toque uma corda',
  inTune: 'Afinado',
  tooLow: 'Baixo — aperte',
  tooHigh: 'Alto — afrouxe',
  flatBy: '{n} cents abaixo',
  sharpBy: '{n} cents acima',
  cents: 'cents',
  noSignal: 'Nenhum som detectado',
  detectedNote: 'Nota alvo: {n}',
  hearing: 'Ouvindo {n}',
  target: 'Alvo',
  language: 'Idioma',
  noteNames: 'Nomes das notas',
  letters: 'Letras (C D E)',
  solfege: 'Solfejo (Dó Ré Mi)',
  reference: 'Afinação de referência',
  decrease: 'Diminuir afinação de referência',
  increase: 'Aumentar afinação de referência',
  cue: 'Som ao afinar',
  cueHint: 'Toca um som curto e vibra, quando disponível.',
  start: 'Começar a afinar',
  startHint: 'Usa o seu microfone. O áudio é processado neste aparelho e nunca é enviado.',
  starting: 'Solicitando o microfone…',
  denied: 'O acesso ao microfone está bloqueado',
  deniedHint: 'Permita o acesso ao microfone para este site nas configurações do navegador e tente de novo.',
  unsupported: 'Este navegador não consegue usar o microfone',
  unsupportedHint: 'Abra o afinador numa versão recente do Chrome, Edge, Firefox ou Safari, via HTTPS.',
  error: 'Não foi possível iniciar o microfone',
  tryAgain: 'Tentar de novo',
  sharpWord: 'sustenido',
  flatWord: 'bemol',
}

const es: Messages = {
  appTitle: 'Afinador',
  appDescription: 'Afinador gratuito de guitarra y ukelele que funciona por completo en tu navegador.',
  listening: 'Escuchando',
  paused: 'En pausa',
  pauseAction: 'pausar',
  resumeAction: 'reanudar',
  resume: 'Reanudar',
  settings: 'Ajustes',
  close: 'Cerrar',
  instrument: 'Instrumento',
  instruments: { acoustic: 'Acústica', electric: 'Eléctrica', ukulele: 'Ukelele' },
  tuning: 'Afinación',
  tuningsTitle: { guitar: 'Afinaciones de guitarra', ukulele: 'Afinaciones de ukelele' },
  tuningNames: {
    standard: 'Estándar', standardHigh: 'Estándar ({n} aguda)', drop: 'Drop {n}', halfStepDown: 'Medio tono abajo',
    open: 'Abierta en {n}', dadgad: 'DADGAD', low: '{n} grave', baritone: 'Barítono', keyOf: 'Afinación en {n}',
  },
  detection: 'Afinación',
  meterLabel: 'Precisión de la afinación',
  strings: 'Cuerdas',
  stringNumber: 'Cuerda {n}',
  tuned: 'afinada',
  detected: 'detectada',
  auto: 'Auto',
  autoHint: 'Detecta la cuerda automáticamente. Toca una cuerda para fijarla.',
  lockedHint: 'Fijado en la cuerda {n}. Toca Auto para detectar automáticamente.',
  playString: 'Toca una cuerda',
  inTune: 'Afinado',
  tooLow: 'Bajo — tensa la cuerda',
  tooHigh: 'Alto — afloja la cuerda',
  flatBy: '{n} cents por debajo',
  sharpBy: '{n} cents por encima',
  cents: 'cents',
  noSignal: 'No se detecta sonido',
  detectedNote: 'Nota objetivo: {n}',
  hearing: 'Se oye {n}',
  target: 'Objetivo',
  language: 'Idioma',
  noteNames: 'Nombres de las notas',
  letters: 'Letras (C D E)',
  solfege: 'Solfeo (Do Re Mi)',
  reference: 'Tono de referencia',
  decrease: 'Bajar el tono de referencia',
  increase: 'Subir el tono de referencia',
  cue: 'Sonido al afinar',
  cueHint: 'Reproduce un tono corto y vibra, si es compatible.',
  start: 'Empezar a afinar',
  startHint: 'Usa tu micrófono. El audio se procesa en este dispositivo y nunca se sube.',
  starting: 'Solicitando el micrófono…',
  denied: 'El acceso al micrófono está bloqueado',
  deniedHint: 'Permite el acceso al micrófono para este sitio en los ajustes del navegador y vuelve a intentarlo.',
  unsupported: 'Este navegador no puede usar el micrófono',
  unsupportedHint: 'Abre el afinador en una versión reciente de Chrome, Edge, Firefox o Safari, con HTTPS.',
  error: 'No se pudo iniciar el micrófono',
  tryAgain: 'Reintentar',
  sharpWord: 'sostenido',
  flatWord: 'bemol',
}

const fr: Messages = {
  appTitle: 'Accordeur',
  appDescription: 'Accordeur gratuit pour guitare et ukulélé qui fonctionne entièrement dans votre navigateur.',
  listening: 'À l’écoute',
  paused: 'En pause',
  pauseAction: 'mettre en pause',
  resumeAction: 'reprendre',
  resume: 'Reprendre',
  settings: 'Réglages',
  close: 'Fermer',
  instrument: 'Instrument',
  instruments: { acoustic: 'Acoustique', electric: 'Électrique', ukulele: 'Ukulélé' },
  tuning: 'Accordage',
  tuningsTitle: { guitar: 'Accordages guitare', ukulele: 'Accordages ukulélé' },
  tuningNames: {
    standard: 'Standard', standardHigh: 'Standard ({n} aigu)', drop: 'Drop {n}', halfStepDown: 'Un demi-ton plus bas',
    open: 'Open {n}', dadgad: 'DADGAD', low: '{n} grave', baritone: 'Baryton', keyOf: 'Accordage en {n}',
  },
  detection: 'Justesse',
  meterLabel: 'Justesse de l’accord',
  strings: 'Cordes',
  stringNumber: 'Corde {n}',
  tuned: 'accordée',
  detected: 'détectée',
  auto: 'Auto',
  autoHint: 'Détecte la corde automatiquement. Touchez une corde pour la verrouiller.',
  lockedHint: 'Verrouillé sur la corde {n}. Touchez Auto pour la détection automatique.',
  playString: 'Jouez une corde',
  inTune: 'Accordé',
  tooLow: 'Trop bas — tendez',
  tooHigh: 'Trop haut — détendez',
  flatBy: '{n} cents en dessous',
  sharpBy: '{n} cents au-dessus',
  cents: 'cents',
  noSignal: 'Aucun son détecté',
  detectedNote: 'Note cible : {n}',
  hearing: 'J’entends {n}',
  target: 'Cible',
  language: 'Langue',
  noteNames: 'Noms des notes',
  letters: 'Lettres (C D E)',
  solfege: 'Solfège (Do Ré Mi)',
  reference: 'Diapason',
  decrease: 'Baisser le diapason',
  increase: 'Monter le diapason',
  cue: 'Son quand c’est juste',
  cueHint: 'Joue un son bref et vibre, si possible.',
  start: 'Commencer à accorder',
  startHint: 'Utilise votre micro. Le son est traité sur cet appareil et n’est jamais envoyé.',
  starting: 'Demande d’accès au micro…',
  denied: 'L’accès au micro est bloqué',
  deniedHint: 'Autorisez le micro pour ce site dans les réglages du navigateur, puis réessayez.',
  unsupported: 'Ce navigateur ne peut pas utiliser le micro',
  unsupportedHint: 'Ouvrez l’accordeur dans une version récente de Chrome, Edge, Firefox ou Safari, en HTTPS.',
  error: 'Impossible de démarrer le micro',
  tryAgain: 'Réessayer',
  sharpWord: 'dièse',
  flatWord: 'bémol',
}

export const MESSAGES: Record<Locale, Messages> = { en, 'pt-BR': ptBR, es, fr }

export function format(template: string, value: string | number): string {
  return template.replaceAll('{n}', String(value))
}

export function detectLocale(languages: readonly string[] = typeof navigator !== 'undefined' ? navigator.languages : []): Locale {
  for (const tag of languages) {
    const lower = tag.toLowerCase()
    if (lower.startsWith('pt')) return 'pt-BR'
    if (lower.startsWith('es')) return 'es'
    if (lower.startsWith('fr')) return 'fr'
    if (lower.startsWith('en')) return 'en'
  }
  return 'en'
}
