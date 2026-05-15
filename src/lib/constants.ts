export const LANGUAGES = {
  en: { code: 'en', name: 'English', locale: 'en-US', flag: '🇬🇧' },
  de: { code: 'de', name: 'Deutsch', locale: 'de-DE', flag: '🇩🇪' },
  es: { code: 'es', name: 'Español', locale: 'es-ES', flag: '🇪🇸' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const CONVERSATION_MODES = {
  free_talk: { id: 'free_talk', label: 'Free Talk' },
  scenario: { id: 'scenario', label: 'Scenario' },
} as const;

export type ConversationMode = keyof typeof CONVERSATION_MODES;

export const CONVERSATION_STATES = {
  IDLE: 'IDLE',
  LISTENING: 'LISTENING',
  PROCESSING: 'PROCESSING',
  SPEAKING: 'SPEAKING',
} as const;

export type ConversationState = (typeof CONVERSATION_STATES)[keyof typeof CONVERSATION_STATES];

export const MAX_CONTEXT_MESSAGES = 20;
export const TTS_SENTENCE_REGEX = /[^.!?]+[.!?]+/g;
