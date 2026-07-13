"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  translate,
  type Locale,
} from "@/i18n/messages";

// Locale lives in localStorage (like the mock session). A window event keeps
// every consumer in sync. Initial render uses DEFAULT_LOCALE (matches SSR) and
// updates after mount — no hydration mismatch.
const STORAGE_KEY = "locale";
const LOCALE_EVENT = "locale-changed";

export function readLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && (LOCALES as string[]).includes(v) ? (v as Locale) : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function writeLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(readLocale());
    const sync = () => setLocale(readLocale());
    window.addEventListener(LOCALE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LOCALE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const changeLocale = useCallback((l: Locale) => writeLocale(l), []);

  return { locale, t, changeLocale };
}
