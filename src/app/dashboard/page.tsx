"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/i18n/use-i18n";
import {
  DEFAULT_SETTINGS,
  readSettings,
  saveSettings,
  type UserSettings,
} from "@/lib/settings";

interface RecentPage {
  uuid: string;
  title: string;
  updatedAt: string;
}

// Dashboard: combines the authenticated user's account details with editable
// settings in one place. Client-side guard (client-side session).
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      const stored = readSettings();
      setSettings({
        ...stored,
        displayName: stored.displayName || user.name,
      });
      // Ten most recent pages (the API already returns them newest-first).
      fetch("/api/pages")
        .then((r) => r.json())
        .then((d) => setRecentPages((d.pages ?? []).slice(0, 10)))
        .catch(() => setRecentPages([]));
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        {t("common.loading")}
      </main>
    );
  }

  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const onSave = () => {
    saveSettings(settings);
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("dashboard.title")}
          </h1>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {t("dashboard.signOut")}
          </button>
        </div>

        {/* Recent pages */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("dashboard.recentPages")}
            </h2>
            <Link
              href="/pages"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {t("dashboard.viewAll")}
            </Link>
          </div>
          {recentPages.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t("dashboard.noPages")}{" "}
              <Link href="/editor" className="text-blue-600 hover:underline">
                {t("dashboard.createOne")}
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPages.map((page) => (
                <li key={page.uuid}>
                  <Link
                    href={`/editor?uuid=${page.uuid}`}
                    className="flex items-center justify-between py-2 transition-colors hover:bg-gray-50"
                  >
                    <span className="truncate text-sm font-medium text-gray-800">
                      {page.title || "Untitled Page"}
                    </span>
                    <span className="ml-4 shrink-0 text-xs text-gray-400">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Account */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {t("dashboard.account")}
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">{t("dashboard.name")}</dt>
              <dd className="font-medium text-gray-800">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t("dashboard.email")}</dt>
              <dd className="font-medium text-gray-800">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t("dashboard.signedInWith")}</dt>
              <dd className="font-medium capitalize text-gray-800">
                {user.provider}
              </dd>
            </div>
          </dl>
        </section>

        {/* Settings */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {t("dashboard.settings")}
          </h2>

          <div className="mb-4">
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("dashboard.displayName")}
            </label>
            <input
              id="displayName"
              type="text"
              value={settings.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <label className="mb-3 flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {t("dashboard.emailNotifications")}
            </span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => update("emailNotifications", e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <label className="mb-5 flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {t("dashboard.productUpdates")}
            </span>
            <input
              type="checkbox"
              checked={settings.productUpdates}
              onChange={(e) => update("productUpdates", e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              {t("dashboard.save")}
            </button>
            {saved && (
              <span className="text-sm text-green-600">
                {t("dashboard.saved")}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
