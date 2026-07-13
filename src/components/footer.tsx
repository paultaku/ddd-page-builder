"use client";

import Link from "next/link";
import { AuthWidget } from "@/components/auth-widget";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/i18n/use-i18n";

// Site-wide footer with quick navigation + language switcher.
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-gray-500">
        <span>© Page Builder</span>
        <nav className="flex items-center gap-6">
          <Link href="/" className="transition-colors hover:text-gray-800">
            {t("nav.home")}
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-gray-800">
            {t("nav.pricing")}
          </Link>
          <Link href="/contact" className="transition-colors hover:text-gray-800">
            {t("nav.contact")}
          </Link>
          <Link href="/media" className="transition-colors hover:text-gray-800">
            {t("nav.media")}
          </Link>
          <AuthWidget />
          <LanguageSwitcher />
        </nav>
      </div>
    </footer>
  );
}
