"use client";

import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { useLocaleStore } from "@/stores/locale-store";
import { Flag } from "@/components/ui/flags";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  className?: string;
}

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const router = useRouter();
  const { locale, setLocale } = useLocaleStore();

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    router.refresh();
  };

  return (
    <div className={cn("flex gap-1", className)}>
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleChange(loc)}
          className={cn(
            "p-1.5 rounded transition-all",
            locale === loc
              ? "bg-[var(--primary-muted)] ring-1 ring-[var(--primary)]"
              : "opacity-60 hover:opacity-100 hover:bg-[var(--background-tertiary)]"
          )}
          aria-label={loc === "en" ? "English" : "Polski"}
          aria-current={locale === loc ? "true" : undefined}
        >
          <Flag locale={loc} className="w-6 h-4" />
        </button>
      ))}
    </div>
  );
}
