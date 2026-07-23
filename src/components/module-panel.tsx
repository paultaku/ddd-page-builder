"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Blocks } from "lucide-react";
import { toast } from "sonner";
import type { EditorInstance } from "@/types/editor";
import {
  listModulesUseCase,
  setEntitlementUseCase,
  type ModuleSummaryModel,
} from "@/api";

type ModuleView = ModuleSummaryModel;

const ENTITLEMENT_LABEL: Record<ModuleView["entitlement"], string> = {
  locked: "Locked",
  trial: "Trial",
  granted: "Unlocked",
};

// Platform-owned catalog surface. Paid modules can be placed and previewed
// while in `trial`; they are gated only at publish. The "Unlock" action stands
// in for a real upgrade/billing flow until auth lands.
export function ModulePanel({ editor }: { editor: EditorInstance | null }) {
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState<ModuleView[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setModules(await listModulesUseCase.execute());
    } catch {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const insert = (m: ModuleView) => {
    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }
    // Append the module's block to the canvas. Never gated — the paywall lives
    // at publish, not at placement.
    editor.getComponents().add(m.blockHtml);
    toast.success(`Inserted ${m.name}`);
  };

  const unlock = async (m: ModuleView) => {
    try {
      await setEntitlementUseCase.execute({ moduleId: m.id, state: "granted" });
      toast.success(`${m.name} unlocked`);
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
        <Blocks className="w-4 h-4" />
        Modules
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          {loading ? (
            <p className="p-3 text-sm text-gray-500">Loading…</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {modules.map((m) => (
                <li
                  key={m.id}
                  className="rounded-md p-2 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-400">{m.category}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          m.tier === "paid"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.tier === "paid" ? "Paid" : "Free"}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                          m.entitlement === "granted"
                            ? "bg-green-100 text-green-700"
                            : m.entitlement === "trial"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ENTITLEMENT_LABEL[m.entitlement]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => insert(m)}
                      className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      Insert
                    </button>
                    {m.tier === "paid" && m.entitlement !== "granted" && (
                      <button
                        onClick={() => unlock(m)}
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
