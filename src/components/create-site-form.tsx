"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createSiteUseCase, listTemplatesUseCase } from "@/api";

interface TemplateOption {
  id: string;
  name: string;
  category: string;
}

// Minimal "create a site from a template" form. Generates one page per
// comma-separated title (MVP: independent copies of the template).
export function CreateSiteForm() {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [pageTitles, setPageTitles] = useState("Home, About, Contact");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listTemplatesUseCase
      .execute()
      .then((list) => {
        setTemplates(list);
        if (list[0]) setTemplateId(list[0].id);
      })
      .catch(() => toast.error("Failed to load templates"));
  }, []);

  const create = async () => {
    if (!name.trim()) {
      toast.error("Enter a site name");
      return;
    }
    if (!templateId) {
      toast.error("Pick a template");
      return;
    }
    const pages = pageTitles
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title) => ({ title }));
    setBusy(true);
    try {
      await createSiteUseCase.execute({ name: name.trim(), templateId, pages });
      toast.success("Site created");
      window.location.reload();
    } catch (error) {
      toast.error(
        `Create failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        Create a site from a template
      </h2>
      <div className="grid gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Site name"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.category})
            </option>
          ))}
        </select>
        <input
          type="text"
          value={pageTitles}
          onChange={(e) => setPageTitles(e.target.value)}
          placeholder="Page titles, comma-separated"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          onClick={create}
          disabled={busy}
          className="justify-self-start rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create site"}
        </button>
      </div>
    </div>
  );
}
