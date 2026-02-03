// Message loader utility
// Loads all translation messages for a given locale

import type { Locale } from './config';

export async function getMessages(locale: Locale) {
  return (await import(`./locales/${locale}/index.ts`)).default;
}

// Synchronous version for client-side use (requires pre-loaded messages)
export function getMessagesSync(locale: Locale) {
  // This will be used with NextIntlClientProvider which receives pre-loaded messages
  // The actual loading happens in the root layout
  return {};
}
