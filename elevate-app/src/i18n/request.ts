// next-intl server configuration
// Provides locale detection from cookies for server components

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, isValidLocale, LOCALE_COOKIE, type Locale } from './config';

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
    messages: (await import(`./locales/${locale}/index.ts`)).default,
  };
});
