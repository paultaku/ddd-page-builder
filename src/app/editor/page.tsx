"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Eye, RotateCcw, Download, Upload, Rocket } from "lucide-react";
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
import "./editor.css";

export default function EditorPage() {
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [pageTitle, setPageTitle] = useState("");
  // Stable page identity: generated once, reused across saves so that saving
  // is an update, not a fresh create. Cleared only on reset.
  const [pageUuid, setPageUuid] = useState<string>("");
  const editorRef = useRef<EditorInstance | null>(null);

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

      // Get HTML + compiled CSS from GrapeJS
      const html = editor.getHtml();
      const css = editor.getCss();

      // Create save data with metadata
      const saveData: PageSaveData = {
        uuid,
        html,
        css,
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

        // Also save to localStorage as backup
        const localSaveData: SaveData = {
          html,
          css: editor.getCss(),
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
      const saveResponse = await fetch(`/api/page/${uuid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          html: editor.getHtml(),
          css: editor.getCss(),
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
        // Surface a gated-publish (Proposal C) or any other failure honestly.
        const blocked: Array<{ name: string }> | undefined =
          publishResult.blockedModules;
        if (blocked?.length) {
          throw new Error(
            `Upgrade required for: ${blocked.map((m) => m.name).join(", ")}`
          );
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
    if (!editor) return;

    const html = editor.getHtml();
    const css = editor.getCss();

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
          <body>${html}</body>
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
      localStorage.removeItem("pageEditorData");
      toast.info("Editor reset successfully");
    }
  };

  // Export functionality - downloads page as HTML file
  const handleExport = () => {
    if (!editor) return;

    const html = editor.getHtml();
    const css = editor.getCss();

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${pageTitle || "Exported Page"}</title>
    <style>${css}</style>
</head>
<body>${html}</body>
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
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Page Editor</h1>

          <Link
            href="/pages"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            My Pages
          </Link>

          {/* Page Title Input */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="pageTitle"
              className="text-sm font-medium text-gray-700"
            >
              Page Title:
            </label>
            <Input
              id="pageTitle"
              type="text"
              placeholder="Enter page title..."
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-64"
            />
          </div>

          {/* Save Status */}
          {saveStatus === "saving" && (
            <span className="text-sm text-blue-600">Saving...</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-sm text-green-600">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">Save failed</span>
          )}
        </div>

        <div className="flex gap-2">
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
          <Button
            onClick={handlePreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleImport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button
            onClick={handleReset}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Editor container */}
      <div className="flex-1 overflow-hidden">
        <StudioEditor onEditor={handleEditorInit} />
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
