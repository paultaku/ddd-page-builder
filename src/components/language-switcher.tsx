"use client";

import { LOCALES, LOCALE_LABELS } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

// Toggle between the supported locales. Persists via useI18n (localStorage).
export function LanguageSwitcher() {
  const { locale, changeLocale } = useI18n();
  return (
    <span className="flex items-center gap-1">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">/</span>}
          <button
            onClick={() => changeLocale(l)}
            className={
              l === locale
                ? "font-semibold text-gray-800"
                : "text-gray-400 transition-colors hover:text-gray-700"
            }
          >
            {LOCALE_LABELS[l]}
          </button>
        </span>
      ))}
    </span>
  );
}
