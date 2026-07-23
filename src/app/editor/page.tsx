"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Eye,
  RotateCcw,
  Download,
  Upload,
  Rocket,
  ChevronUp,
  ChevronDown,
  Layout,
  Code2,
} from "lucide-react";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import {
  EditorInstance,
  SaveData,
  SaveStatus,
  PageSaveData,
  ApiResponse,
  StoredPage,
} from "@/types/editor";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ModulePanel } from "@/components/module-panel";
import { TemplatePanel } from "@/components/template-panel";
import { injectPurchaseUrl } from "@/lib/purchaseLink";
import "./editor.css";

// Which editing surface is active. "visual" = the GrapeJS canvas; "code" = raw
// HTML/CSS editing with a live preview.
type EditorMode = "visual" | "code";

// CodeMode carries CodeMirror, which touches document/window and must not run
// at prerender — hence `ssr: false`. Loading it dynamically also keeps the
// CodeMirror bundle in a lazily-fetched chunk instead of /editor's initial
// First Load JS, so the route stays statically prerenderable and lean.
const CodeMode = dynamic(
  () => import("@/components/editor/code-mode").then((m) => m.CodeMode),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 text-sm text-gray-400">Loading code editor…</div>
    ),
  }
);

// A labeled cluster of related toolbar controls. The uppercase caption makes the
// "grouped by purpose" structure legible at a glance.
function ToolGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function EditorPage() {
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [pageTitle, setPageTitle] = useState("");
  // Stable page identity: generated once, reused across saves so that saving
  // is an update, not a fresh create. Cleared only on reset.
  const [pageUuid, setPageUuid] = useState<string>("");
  // Provenance: which template this page was created from (T1). Undefined for a
  // blank page. Persisted with the page and re-checked at publish (paid gate).
  const [templateId, setTemplateId] = useState<string | undefined>(undefined);
  // Commerce (T4): outbound purchase link injected into the page's buy CTA.
  const [purchaseUrl, setPurchaseUrl] = useState<string>("");
  // Collapsible action toolbar: the grouped second row can be hidden to give the
  // canvas more height. Persisted so the choice survives reloads.
  const [actionsCollapsed, setActionsCollapsed] = useState(false);
  // Active editing surface. "code" holds its own HTML/CSS buffers, edited
  // directly and rendered verbatim in the preview (no GrapeJS normalization).
  const [mode, setMode] = useState<EditorMode>("visual");
  const [codeHtml, setCodeHtml] = useState("");
  const [codeCss, setCodeCss] = useState("");
  const editorRef = useRef<EditorInstance | null>(null);
  // Guards the one-time seeding of the code buffers when the session is
  // restored directly into code mode (see the seed effect below).
  const codeSeededRef = useRef(false);

  // Restore the toolbar collapse preference on mount.
  useEffect(() => {
    setActionsCollapsed(
      localStorage.getItem("editorActionsCollapsed") === "1"
    );
  }, []);

  // Restore the editor mode preference on mount (mirrors actionsCollapsed).
  // Defaults to "visual" when nothing is stored.
  useEffect(() => {
    const saved = localStorage.getItem("editorMode");
    if (saved === "code" || saved === "visual") {
      setMode(saved);
    }
  }, []);

  // If the session was restored directly into code mode, the code buffers start
  // empty. Seed them once from the editor after it has initialized (and after
  // any ?uuid= page has loaded, best-effort) so the preview isn't blank. Runs a
  // single time; user edits afterward are never clobbered.
  useEffect(() => {
    if (mode === "code" && editor && !codeSeededRef.current) {
      codeSeededRef.current = true;
      setCodeHtml(editor.getHtml());
      setCodeCss(editor.getCss());
    }
  }, [mode, editor]);

  const toggleActions = () => {
    setActionsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("editorActionsCollapsed", next ? "1" : "0");
      return next;
    });
  };

  // Switch editing surface, carrying content across in both directions.
  const switchMode = (next: EditorMode) => {
    if (next === mode) return;
    if (next === "code") {
      // Visual -> Code: snapshot the canvas into the code buffers so code mode
      // opens on the current page.
      if (editor) {
        setCodeHtml(editor.getHtml());
        setCodeCss(editor.getCss());
      }
      // Any subsequent mount-restore seeding is now moot.
      codeSeededRef.current = true;
    } else {
      // Code -> Visual: push the edited code back into the canvas.
      //
      // INTENTIONAL LOSSY ROUND-TRIP (accepted trade-off, plan §2.2): GrapeJS
      // re-parses and normalizes on setComponents/setStyle — it may add wrapper
      // nodes, reorder attributes, and drop markup it doesn't recognize. A
      // Visual -> Code -> Visual trip is therefore NOT guaranteed byte-identical.
      // This is a deliberate design decision, not a bug: the shared {html, css}
      // is the source of truth and GrapeJS re-normalizes on re-entry.
      if (editor) {
        editor.setComponents(codeHtml);
        editor.setStyle(codeCss);
      }
    }
    setMode(next);
    localStorage.setItem("editorMode", next);
  };

  // The current page content regardless of which surface is active. THIS is the
  // decoupling that lets Save/Publish/Preview/Export persist whatever the active
  // mode shows, instead of always reading the GrapeJS canvas.
  const getCurrentContent = (): { html: string; css: string } => {
    if (mode === "code") return { html: codeHtml, css: codeCss };
    if (editor) return { html: editor.getHtml(), css: editor.getCss() };
    return { html: "", css: "" };
  };

  // Default content for the editor
  const defaultComponents = `
    <div class="container mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Welcome to Page Editor</h1>
        <p class="text-gray-600 mb-4">This is a page editor built with GrapeJS and TailwindCSS.</p>
        <div class="flex gap-4">
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
            Start Editing
          </button>
          <button class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  `;

  // Default styles for TailwindCSS compatibility
  const defaultStyle = `
    .container { max-width: 1200px; margin: 0 auto; }
    .bg-white { background-color: #ffffff; }
    .rounded-lg { border-radius: 0.5rem; }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .p-6 { padding: 1.5rem; }
    .text-3xl { font-size: 1.875rem; }
    .font-bold { font-weight: 700; }
    .text-gray-800 { color: #1f2937; }
    .mb-4 { margin-bottom: 1rem; }
    .text-gray-600 { color: #4b5563; }
    .flex { display: flex; }
    .gap-4 { gap: 1rem; }
    .bg-blue-500 { background-color: #3b82f6; }
    .hover\\:bg-blue-600:hover { background-color: #2563eb; }
    .text-white { color: #ffffff; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; }
    .bg-gray-500 { background-color: #6b7280; }
    .hover\\:bg-gray-600:hover { background-color: #4b5563; }
  `;

  // Enhanced save functionality with UUID and API call
  const handleSave = async () => {
    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }

    setIsLoading(true);
    setSaveStatus("saving");

    try {
      // Reuse the stable page identity; only mint one the first time.
      let uuid = pageUuid;
      if (!uuid) {
        uuid = uuidv4();
        setPageUuid(uuid);
      }

      // Source content from the active mode (code buffers in code mode,
      // GrapeJS canvas in visual mode) — not from `editor` directly.
      const { html, css } = getCurrentContent();

      // Create save data with metadata
      const saveData: PageSaveData = {
        uuid,
        html,
        css,
        templateId,
        purchaseUrl,
        metadata: {
          pageTitle: pageTitle || "Untitled Page",
        },
      };

      // Emit custom event
      if (editor.trigger) {
        editor.trigger("page:save", saveData);
        console.log("Page save event emitted:", saveData);
      }

      // Call REST API
      const response = await fetch(`/api/page/${uuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveData),
      });

      const result: ApiResponse = await response.json();

      if (response.ok && result.success) {
        setSaveStatus("saved");
        // The page is now persisted server-side under this stable UUID and can
        // be reopened via /editor?uuid=... or from the My Pages list.
        toast.success(`Page saved. UUID: ${uuid}`);

        // Also save to localStorage as backup. html/css reflect the active mode;
        // components/styles are GrapeJS's structured backup of the canvas.
        const localSaveData: SaveData = {
          html,
          css,
          components: editor.getComponents().toJSON(),
          styles: editor.getStyle().toJSON(),
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("pageEditorData", JSON.stringify(localSaveData));

        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
      toast.error(
        `Save failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Publish functionality - persists the latest content, then serves it at a
  // public, shareable URL. This is the explicit gate the trial entitlement
  // check (Proposal C) hooks into.
  const handlePublish = async () => {
    if (!editor) {
      toast.error("Editor not initialized");
      return;
    }

    let uuid = pageUuid;
    if (!uuid) {
      uuid = uuidv4();
      setPageUuid(uuid);
    }

    setIsLoading(true);
    try {
      // Persist current content first so the published page is up to date.
      // Source from the active mode, not the GrapeJS canvas directly.
      const { html, css } = getCurrentContent();
      const saveResponse = await fetch(`/api/page/${uuid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          html,
          css,
          templateId,
          purchaseUrl,
          metadata: { pageTitle: pageTitle || "Untitled Page" },
        }),
      });
      if (!saveResponse.ok) {
        throw new Error("Failed to save before publishing");
      }

      const publishResponse = await fetch(`/api/page/${uuid}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true }),
      });
      const publishResult = await publishResponse.json();
      if (!publishResponse.ok || !publishResult.success) {
        // Surface a gated-publish (module and/or template) or any other failure.
        const blockedNames: string[] = [
          ...((publishResult.blockedModules as Array<{ name: string }>) ?? []).map(
            (m) => m.name
          ),
          ...(publishResult.blockedTemplate
            ? [publishResult.blockedTemplate.name]
            : []),
        ];
        if (blockedNames.length) {
          throw new Error(`Upgrade required for: ${blockedNames.join(", ")}`);
        }
        throw new Error(publishResult.error || "Publish failed");
      }

      const publicUrl = `${window.location.origin}${publishResult.url}`;
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast.success(`Published! URL copied: ${publicUrl}`);
      } catch {
        toast.success(`Published at ${publicUrl}`);
      }
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error(
        `Publish failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Preview functionality - opens page in new window
  const handlePreview = () => {
    // Preview whatever the active mode currently shows.
    const { html, css } = getCurrentContent();

    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${pageTitle || "Page Preview"}</title>
            <style>
              ${css}
              body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            </style>
          </head>
          <body>${injectPurchaseUrl(html, purchaseUrl)}</body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  // Reset functionality - clears editor content
  const handleReset = () => {
    if (!editor) return;

    if (
      confirm(
        "Are you sure you want to reset the editor? This will clear all content."
      )
    ) {
      editor.DomComponents.clear();
      editor.CssComposer.clear();
      editor.setComponents(defaultComponents);
      editor.setStyle(defaultStyle);
      setPageTitle("");
      setPageUuid("");
      setTemplateId(undefined);
      setPurchaseUrl("");
      localStorage.removeItem("pageEditorData");
      toast.info("Editor reset successfully");
    }
  };

  // Export functionality - downloads page as HTML file
  const handleExport = () => {
    // Export whatever the active mode currently shows.
    const { html, css } = getCurrentContent();

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${pageTitle || "Exported Page"}</title>
    <style>${css}</style>
</head>
<body>${injectPurchaseUrl(html, purchaseUrl)}</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageTitle || "page"}-${
      new Date().toISOString().split("T")[0]
    }.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Page exported successfully");
  };

  // Import functionality - loads HTML or JSON files
  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html,.json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);

            if (editor && data.components && data.styles) {
              editor.load(data);
              toast.success("Page imported successfully");
            } else {
              // If it's an HTML file, try to parse it
              const parser = new DOMParser();
              const doc = parser.parseFromString(content, "text/html");
              const bodyContent = doc.body.innerHTML;
              if (editor && bodyContent) {
                editor.setComponents(bodyContent);
                toast.success("HTML imported successfully");
              }
            }
          } catch (error) {
            console.error("Import failed:", error);
            toast.error("Import failed, please check the file format");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Handle editor initialization
  const handleEditorInit = (editorInstance: any) => {
    const editor = editorInstance as EditorInstance;
    setEditor(editor);
    editorRef.current = editor;

    // Set default content
    editor.setComponents(defaultComponents);
    editor.setStyle(defaultStyle);

    // If opened as /editor?uuid=..., hydrate from the server-stored page and
    // adopt its stable identity so the next save is an update.
    const uuidParam = new URLSearchParams(window.location.search).get("uuid");
    if (uuidParam) {
      fetch(`/api/page/${uuidParam}`)
        .then(async (res) => (res.ok ? ((await res.json()) as { page: StoredPage }) : null))
        .then((data) => {
          if (!data?.page) {
            toast.error("Page not found");
            return;
          }
          const { page } = data;
          editor.setComponents(page.html);
          if (page.css) editor.setStyle(page.css);
          setPageUuid(page.uuid);
          setPageTitle(page.title === "Untitled Page" ? "" : page.title);
          setTemplateId(page.templateId);
          setPurchaseUrl(page.purchaseUrl ?? "");
          toast.info("Loaded saved page");
        })
        .catch((error) => {
          console.error("Failed to load page:", error);
          toast.error("Failed to load page");
        });
      return;
    }

    // Otherwise restore the last browser-local session if present.
    const savedData = localStorage.getItem("pageEditorData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        editor.load(data);
        toast.info("Previous session restored");
      } catch (error) {
        console.error("Failed to load saved data:", error);
        toast.error("Failed to restore previous session");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Nav row — always visible: identity, navigation, page title, primary
          actions, and the toggle for the collapsible action row. */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-lg font-semibold text-gray-800 shrink-0">
            Page Editor
          </h1>

          <nav className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Dashboard
            </Link>
            <a
              href="/media"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Media Library
            </a>
          </nav>

          <div className="h-5 w-px bg-gray-200 shrink-0" aria-hidden="true" />

          {/* Page Title Input */}
          <div className="flex items-center gap-2 min-w-0">
            <label
              htmlFor="pageTitle"
              className="text-sm font-medium text-gray-700 shrink-0"
            >
              Page Title:
            </label>
            <Input
              id="pageTitle"
              type="text"
              placeholder="Enter page title..."
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-56"
            />
          </div>

          {/* Save Status */}
          {saveStatus === "saving" && (
            <span className="text-sm text-blue-600 shrink-0">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-sm text-green-600 shrink-0">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600 shrink-0">Save failed</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleSave}
            variant="default"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            onClick={handlePublish}
            variant="default"
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Rocket className="w-4 h-4" />
            Publish
          </Button>
          <div className="h-5 w-px bg-gray-200" aria-hidden="true" />
          <Button
            onClick={toggleActions}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-600"
            aria-expanded={!actionsCollapsed}
            aria-controls="editor-action-bar"
            title={actionsCollapsed ? "Show tools" : "Hide tools"}
          >
            {actionsCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
            Tools
          </Button>
        </div>
      </div>

      {/* Collapsible action row — controls grouped by purpose. */}
      {!actionsCollapsed && (
        <div
          id="editor-action-bar"
          className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-4 flex-wrap"
        >
          <ToolGroup label="View">
            {/* Editing surface switch: Visual (GrapeJS) vs Code (HTML+CSS).
                Relocated here from the always-visible nav row — when the Tools
                row is collapsed this switch is hidden; expand Tools to change
                modes. The Format button lives in the code pane, so it stays
                reachable in Code mode regardless of collapse state. */}
            <div
              role="tablist"
              aria-label="Editor mode"
              className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "visual"}
                onClick={() => switchMode("visual")}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
                  mode === "visual"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Layout className="h-3.5 w-3.5" />
                Visual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "code"}
                onClick={() => switchMode("code")}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
                  mode === "code"
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                Code
              </button>
            </div>
          </ToolGroup>

          <div className="h-5 w-px bg-gray-200" aria-hidden="true" />

          <ToolGroup label="Insert">
            {/* Insert writes to the GrapeJS canvas (editor.setComponents), which
                has no meaning against the code buffers — disable it in code mode
                to prevent silent canvas/code divergence. */}
            <div
              className={`flex items-center gap-2 ${
                mode === "code" ? "pointer-events-none opacity-50" : ""
              }`}
              aria-disabled={mode === "code"}
              title={
                mode === "code"
                  ? "Switch to Visual to insert templates or modules"
                  : undefined
              }
            >
              <TemplatePanel
                editor={editor}
                onTemplateApplied={(id) => setTemplateId(id)}
              />
              <ModulePanel editor={editor} />
            </div>
          </ToolGroup>

          <div className="h-5 w-px bg-gray-200" aria-hidden="true" />

          <ToolGroup label="Page">
            <div className="flex items-center gap-2">
              <label htmlFor="purchaseUrl" className="sr-only">
                Purchase link
              </label>
              <Input
                id="purchaseUrl"
                type="url"
                placeholder="Purchase link https://…/buy"
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                className="w-56"
              />
            </div>
          </ToolGroup>

          <div className="h-5 w-px bg-gray-200" aria-hidden="true" />

          <ToolGroup label="Share">
            <Button
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={handleImport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </ToolGroup>

          <div className="h-5 w-px bg-gray-200" aria-hidden="true" />

          <ToolGroup label="Danger">
            <Button
              onClick={handleReset}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </ToolGroup>
        </div>
      )}

      {/* Editor container */}
      <div className="flex-1 overflow-hidden">
        {/* GrapeJS stays MOUNTED (only visually hidden) in code mode. Unmounting
            would destroy the instance and re-run handleEditorInit on remount,
            which re-reads ?uuid= and re-fetches/resets the page. Keeping it
            mounted preserves the instance, its content, and undo history. */}
        <div className={mode === "visual" ? "h-full" : "hidden"}>
          <StudioEditor onEditor={handleEditorInit} />
        </div>
        {mode === "code" && (
          <CodeMode
            html={codeHtml}
            css={codeCss}
            onHtmlChange={setCodeHtml}
            onCssChange={setCodeCss}
            purchaseUrl={purchaseUrl}
          />
        )}
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
