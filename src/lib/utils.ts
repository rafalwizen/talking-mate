export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getLocaleForLanguage(lang: string): string {
  const map: Record<string, string> = {
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
  };
  return map[lang] ?? lang;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  if (!matches) return [text];
  return matches.map((s) => s.trim()).filter(Boolean);
}
