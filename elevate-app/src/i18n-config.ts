// next-intl configuration file
// This file is imported by Next.js to configure internationalization
// Note: This is separate from src/i18n/index.ts which exports client-side utilities

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

// Import locale config directly to avoid circular dependency with client-side exports
const locales = ['en', 'pl'] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'en';
const LOCALE_COOKIE = 'NEXT_LOCALE';

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  // Validate and use cookie locale or fall back to default
  const locale: Locale = cookieLocale && isValidLocale(cookieLocale)
    ? cookieLocale
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./i18n/locales/${locale}/index.ts`)).default,
  };
});
