"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/i18n/use-i18n";
import { CreateSiteForm } from "@/components/create-site-form";
import { SitePaletteEditor } from "@/components/site-palette-editor";
import type { ColorPalette } from "@/domain/site/ColorPalette";
import {
  listPagesUseCase,
  listSitesUseCase,
  assignPageToProjectUseCase,
} from "@/api";
import {
  DEFAULT_SETTINGS,
  readSettings,
  saveSettings,
  type UserSettings,
} from "@/lib/settings";

interface PageSummary {
  uuid: string;
  title: string;
  updatedAt: string;
  projectId: string | null;
}

interface SiteSummary {
  id: string;
  name: string;
  pageCount: number;
  colorPalette: ColorPalette;
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
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [sites, setSites] = useState<SiteSummary[]>([]);

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
      loadPages();
      loadSites();
    }
  }, [loading, user, router]);

  // My Pages + My Sites (both APIs return newest-first).
  const loadPages = () =>
    listPagesUseCase
      .execute()
      .then((p) => setPages(p))
      .catch(() => setPages([]));
  const loadSites = () =>
    listSitesUseCase
      .execute()
      .then((s) => setSites(s))
      .catch(() => setSites([]));

  // Assign a page to a project (or detach with ""). Single-project membership is
  // enforced server-side; refresh both lists so counts and selection stay true.
  const assignProject = async (uuid: string, siteId: string) => {
    await assignPageToProjectUseCase
      .execute({ uuid, siteId: siteId || null })
      .catch(() => {});
    await Promise.all([loadPages(), loadSites()]);
  };

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

        {/* My Pages */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {t("dashboard.myPages")}
            </h2>
            <Link
              href="/editor"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              + {t("dashboard.newPage")}
            </Link>
          </div>
          {pages.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t("dashboard.noPages")}{" "}
              <Link href="/editor" className="text-blue-600 hover:underline">
                {t("dashboard.createOne")}
              </Link>
              .
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {pages.map((page) => (
                <li
                  key={page.uuid}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <Link
                    href={`/editor?uuid=${page.uuid}`}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 transition-colors hover:bg-gray-50"
                  >
                    <span className="truncate text-sm font-medium text-gray-800">
                      {page.title || "Untitled Page"}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                  <select
                    value={page.projectId ?? ""}
                    onChange={(e) => assignProject(page.uuid, e.target.value)}
                    aria-label={t("dashboard.project")}
                    className="shrink-0 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                  >
                    <option value="">{t("dashboard.noProject")}</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* My Sites */}
        <section className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {t("dashboard.mySites")}
          </h2>
          {sites.length === 0 ? (
            <p className="mb-4 text-sm text-gray-500">
              {t("dashboard.noSites")}
            </p>
          ) : (
            <ul className="mb-4 divide-y divide-gray-100">
              {sites.map((site) => (
                <li key={site.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="min-w-0 truncate text-sm font-medium text-gray-800">
                      {site.name}{" "}
                      <span className="text-xs text-gray-400">
                        ({site.pageCount})
                      </span>
                    </span>
                    <a
                      href={`/s/${site.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 shrink-0 text-sm font-medium text-blue-600 hover:underline"
                    >
                      {t("dashboard.viewSite")}
                    </a>
                  </div>
                  <SitePaletteEditor
                    siteId={site.id}
                    initial={site.colorPalette}
                  />
                </li>
              ))}
            </ul>
          )}
          <CreateSiteForm />
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
