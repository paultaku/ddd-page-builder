"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/use-i18n";
import type { ColorPalette } from "@/domain/site/ColorPalette";
import { updateSitePaletteUseCase } from "@/api";

const SLOTS: Array<{ key: keyof ColorPalette; labelKey: string }> = [
  { key: "primary", labelKey: "palette.primary" },
  { key: "secondary", labelKey: "palette.secondary" },
  { key: "accent", labelKey: "palette.accent" },
  { key: "background", labelKey: "palette.background" },
  { key: "text", labelKey: "palette.text" },
];

// Project-level theme editor: five color swatches that PATCH the Site's palette.
// Assigned pages delegate to these values (var(--color-*)) on their next render.
export function SitePaletteEditor({
  siteId,
  initial,
}: {
  siteId: string;
  initial: ColorPalette;
}) {
  const { t } = useI18n();
  const [palette, setPalette] = useState<ColorPalette>(initial);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof ColorPalette, value: string) =>
    setPalette((p) => ({ ...p, [key]: value }));

  const save = async () => {
    setBusy(true);
    try {
      await updateSitePaletteUseCase.execute({ siteId, colorPalette: palette });
      toast.success(t("dashboard.paletteSaved"));
    } catch {
      toast.error(t("dashboard.paletteSaveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {t("dashboard.themePalette")}
      </p>
      <div className="flex flex-wrap gap-3">
        {SLOTS.map(({ key, labelKey }) => (
          <label key={key} className="flex flex-col items-center gap-1 text-xs">
            <input
              type="color"
              value={palette[key]}
              onChange={(e) => set(key, e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
              aria-label={t(labelKey)}
            />
            <span className="text-gray-500">{t(labelKey)}</span>
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={busy}
        className="mt-3 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
      >
        {busy ? t("common.loading") : t("dashboard.savePalette")}
      </button>
    </div>
  );
}
