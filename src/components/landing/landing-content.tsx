"use client";

import Link from "next/link";
import { Edit3, LayoutTemplate, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";
import {
  VersatilityReel,
  type ShowcaseSlide,
} from "@/components/landing/versatility-reel";

// The landing page's client half. `page.tsx` stays a server component so it can
// read the seeded template catalog (infrastructure) without shipping it to the
// browser; everything below needs `useI18n`, so it lives here.
export function LandingContent({ slides }: { slides: ShowcaseSlide[] }) {
  const { t } = useI18n();

  const features = [
    { Icon: Edit3, title: t("home.f1.title"), desc: t("home.f1.desc") },
    { Icon: LayoutTemplate, title: t("home.f2.title"), desc: t("home.f2.desc") },
    { Icon: Rocket, title: t("home.f3.title"), desc: t("home.f3.desc") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">DDD Page Builder</h1>
          <Button asChild>
            <Link href="/editor">
              <Edit3 className="mr-2 h-4 w-4" />
              {t("home.openEditor")}
            </Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            {t("home.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/editor">
                <Edit3 className="mr-2 h-5 w-5" />
                {t("home.openEditor")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">{t("home.viewPricing")}</Link>
            </Button>
          </div>
        </div>

        {/* Versatility reel — the real seeded catalog, each slide themed by the
            real palette delegation. Evidence for the "every purpose" claim. */}
        <section className="mb-16">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-gray-400">
            {t("home.reel.eyebrow")}
          </p>
          <VersatilityReel slides={slides} />
        </section>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="landing-reveal rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
