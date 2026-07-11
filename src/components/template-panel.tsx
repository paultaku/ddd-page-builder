"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import type { EditorInstance } from "@/types/editor";

interface TemplateView {
  id: string;
  name: string;
  category: string;
  tier: "free" | "paid";
  thumbnail?: string;
  entitlement: "locked" | "trial" | "granted";
}

interface FullTemplate {
  id: string;
  name: string;
  html: string;
  css: string;
}

const ENTITLEMENT_LABEL: Record<TemplateView["entitlement"], string> = {
  locked: "Locked",
  trial: "Trial",
  granted: "Unlocked",
};

// Platform-owned template catalog. Importing a template seeds the canvas as a
// starting point and records provenance (templateId). Paid templates import and
// preview freely under `trial`; they are gated only at publish.
export function TemplatePanel({
  editor,
  onTemplateApplied,
}: {
  editor: EditorInstance | null;
  onTemplateApplied: (templateId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateView[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch {
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const use = async (t: TemplateView) => {
    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }
    try {
      const res = await fetch(`/api/templates/${t.id}`);
      if (!res.ok) throw new Error("Template not found");
      const { template } = (await res.json()) as { template: FullTemplate };
      // Import replaces canvas content — the template is a starting point.
      editor.setComponents(template.html);
      if (template.css) editor.setStyle(template.css);
      onTemplateApplied(template.id);
      setOpen(false);
      toast.success(`Imported "${template.name}"`);
    } catch (error) {
      toast.error(
        `Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const unlock = async (t: TemplateView) => {
    try {
      const res = await fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: t.id, state: "granted" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upgrade failed");
      }
      toast.success(`${t.name} unlocked`);
      load();
    } catch (error) {
      toast.error(
        `Upgrade failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={toggle}
        variant="outline"
        className="flex items-center gap-2"
      >
        <LayoutTemplate className="w-4 h-4" />
        Templates
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          {loading ? (
            <p className="p-3 text-sm text-gray-500">Loading…</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {templates.map((t) => (
                <li key={t.id} className="rounded-md p-2 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.category}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          t.tier === "paid"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.tier === "paid" ? "Paid" : "Free"}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          t.entitlement === "granted"
                            ? "bg-green-100 text-green-700"
                            : t.entitlement === "trial"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ENTITLEMENT_LABEL[t.entitlement]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => use(t)}
                      className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      Use template
                    </button>
                    {t.tier === "paid" && t.entitlement !== "granted" && (
                      <button
                        onClick={() => unlock(t)}
                        className="rounded border border-amber-300 px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50"
                      >
                        Unlock to publish
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
