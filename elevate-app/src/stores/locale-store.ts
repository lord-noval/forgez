import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultLocale, LOCALE_COOKIE, type Locale } from '@/i18n/config';

interface LocaleState {
  // State
  locale: Locale;

  // Actions
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      // Initial state
      locale: defaultLocale,

      // Actions
      setLocale: (locale) => {
        // Update cookie for server-side detection
        document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000`;
        set({ locale });
      },
    }),
    {
      name: 'elevate-locale',
    }
  )
);

// Hook to sync locale store with cookie on mount
export function useLocaleSync() {
  const { locale, setLocale } = useLocaleStore();

  // This ensures the cookie matches the store state on mount
  if (typeof window !== 'undefined') {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
      ?.split('=')[1];

    if (cookieValue && cookieValue !== locale) {
      // Cookie takes precedence - sync store to cookie
      setLocale(cookieValue as Locale);
    } else if (!cookieValue) {
      // No cookie - set cookie from store
      document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000`;
    }
  }

  return { locale, setLocale };
}
