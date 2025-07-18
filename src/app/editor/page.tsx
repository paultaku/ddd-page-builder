"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Save, Eye, RotateCcw, Download, Upload } from "lucide-react";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { EditorInstance, SaveData, SaveStatus } from "@/types/editor";
import "./editor.css";

export default function EditorPage() {
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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

  // Save functionality - saves current page to localStorage
  const handleSave = async () => {
    if (!editor) return;

    setIsLoading(true);
    setSaveStatus("saving");

    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const components = editor.getComponents();
      const styles = editor.getStyle();

      // Create save data object
      const saveData: SaveData = {
        html,
        css,
        components: components.toJSON(),
        styles: styles.toJSON(),
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage (can also save to server)
      localStorage.setItem("pageEditorData", JSON.stringify(saveData));

      console.log("Page saved:", saveData);
      setSaveStatus("saved");

      // Reset status after 3 seconds
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
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
            <title>Page Preview</title>
            <script src="https://cdn.tailwindcss.com"></script>
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
      localStorage.removeItem("pageEditorData");
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
    <title>Exported Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>${css}</style>
</head>
<body>${html}</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `page-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            } else {
              // If it's an HTML file, try to parse it
              const parser = new DOMParser();
              const doc = parser.parseFromString(content, "text/html");
              const bodyContent = doc.body.innerHTML;
              if (editor && bodyContent) {
                editor.setComponents(bodyContent);
              }
            }
          } catch (error) {
            console.error("Import failed:", error);
            alert("Import failed, please check the file format");
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

    // Load saved data if available
    const savedData = localStorage.getItem("pageEditorData");
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        editor.load(data);
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Page Editor</h1>
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
    </div>
  );
}
