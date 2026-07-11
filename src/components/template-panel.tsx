"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { EditorInstance } from "@/types/editor";

interface TemplateView {
  id: string;
  name: string;
  category: string;
  tier: "free" | "paid";
  source: "seed" | "user";
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

const CATEGORIES = [
  "business",
  "store",
  "product-detail",
  "company-landing",
  "one-page-product",
] as const;

// Platform + user template catalog. Importing seeds the canvas and records
// provenance (templateId). Paid seed templates are gated only at publish; user
// templates (saved from your own page) are free and owned.
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
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string>("business");

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

  // Save the current canvas as a reusable user template (T2).
  const saveAsTemplate = async () => {
    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }
    const name = newName.trim();
    if (!name) {
      toast.error("Enter a template name");
      return;
    }
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: newCategory,
          html: editor.getHtml(),
          css: editor.getCss(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      setNewName("");
      toast.success(`Saved template "${name}"`);
      load();
    } catch (error) {
      toast.error(
        `Save failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const remove = async (t: TemplateView) => {
    try {
      const res = await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Delete failed");
      }
      toast.success(`Deleted "${t.name}"`);
      load();
    } catch (error) {
      toast.error(
        `Delete failed: ${
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
          {/* Save current canvas as a user template */}
          <div className="mb-2 rounded-md border border-gray-100 bg-gray-50 p-2">
            <p className="mb-1 text-xs font-medium text-gray-600">
              Save current page as template
            </p>
            <div className="flex gap-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Template name"
                className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded border border-gray-200 px-1 py-1 text-xs"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={saveAsTemplate}
                className="rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-700"
              >
                Save
              </button>
            </div>
          </div>

          {loading ? (
            <p className="p-3 text-sm text-gray-500">Loading…</p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {templates.map((t) => (
                <li key={t.id} className="rounded-md p-2 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t.category}
                        {t.source === "user" ? " · mine" : ""}
                      </p>
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
                  <div className="mt-2 flex items-center gap-2">
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
                    {t.source === "user" && (
                      <button
                        onClick={() => remove(t)}
                        title="Delete template"
                        className="ml-auto rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
