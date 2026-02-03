// i18n Configuration
// Defines supported locales and default locale

export const locales = ['en', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Locale metadata for UI display
export const localeNames: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
};

// Locale flags for UI (emoji)
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pl: '🇵🇱',
};

// Cookie name for storing locale preference
export const LOCALE_COOKIE = 'NEXT_LOCALE';

// Validate if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
