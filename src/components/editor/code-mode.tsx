"use client";

import { useEffect, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { css as cssLang } from "@codemirror/lang-css";
import { toast } from "sonner";
import { injectPurchaseUrl } from "@/lib/purchaseLink";

// Code mode: raw HTML + CSS editing with a live, sandboxed preview.
//
// This component is loaded via `next/dynamic({ ssr: false })` from the editor
// page — CodeMirror touches `document`/`window` and would crash prerender, and
// dynamic import keeps its (sizable) chunk out of `/editor`'s initial First
// Load JS. Do NOT import this module eagerly from a server-rendered path.
//
// The preview here renders the TYPED code verbatim. It deliberately does NOT
// round-trip through GrapeJS, so what you see is exactly the HTML/CSS that will
// be saved from code mode — unlike the Visual canvas, which normalizes markup.

type CodePane = "html" | "css";

const PREVIEW_DEBOUNCE_MS = 300;

export function CodeMode({
  html,
  css,
  onHtmlChange,
  onCssChange,
  purchaseUrl,
}: {
  html: string;
  css: string;
  onHtmlChange: (value: string) => void;
  onCssChange: (value: string) => void;
  purchaseUrl: string;
}) {
  const [pane, setPane] = useState<CodePane>("html");
  // True while a Format run (dynamic import + prettier.format) is in flight. The
  // first click pays the lazy Prettier chunk fetch, so we disable the button and
  // show a transient label rather than let it be re-triggered mid-flight.
  const [isFormatting, setIsFormatting] = useState(false);

  // Pretty-print the ACTIVE pane only (HTML on the HTML tab, CSS on the CSS tab).
  //
  // Prettier is imported DYNAMICALLY here on purpose: it must never enter the
  // initial /editor chunk or the CodeMirror chunk. It fetches its own lazy chunk
  // only on the first Format click. A parse failure throws — we catch it, toast,
  // and leave the buffer untouched (never blank the user's code).
  async function formatActive() {
    if (isFormatting) return;
    setIsFormatting(true);
    try {
      const prettier = await import("prettier/standalone");
      const plugin = await import(
        pane === "html" ? "prettier/plugins/html" : "prettier/plugins/postcss"
      );
      const out = await prettier.format(pane === "html" ? html : css, {
        parser: pane === "html" ? "html" : "css",
        plugins: [(plugin as unknown as { default?: unknown }).default ?? plugin],
      });
      if (pane === "html") {
        onHtmlChange(out);
      } else {
        onCssChange(out);
      }
    } catch (err) {
      toast.error(
        `Could not format ${pane.toUpperCase()}: ${
          err instanceof Error ? err.message : "invalid syntax"
        }`
      );
    } finally {
      setIsFormatting(false);
    }
  }

  // Debounce the preview so fast keystrokes don't thrash the iframe. We debounce
  // on the raw html/css and rebuild srcDoc from the settled values.
  const [debouncedHtml, setDebouncedHtml] = useState(html);
  const [debouncedCss, setDebouncedCss] = useState(css);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedHtml(html);
      setDebouncedCss(css);
    }, PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [html, css]);

  // Sandboxed preview document. `sandbox=""` (no scripts, no same-origin) is
  // mandatory — this is untrusted user HTML. Reuses `injectPurchaseUrl` so the
  // buy CTA resolves exactly as it will on the published page.
  const srcDoc = useMemo(
    () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${debouncedCss}
body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }</style>
</head>
<body>${injectPurchaseUrl(debouncedHtml, purchaseUrl)}</body>
</html>`,
    [debouncedHtml, debouncedCss, purchaseUrl]
  );

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Code column: tabbed HTML / CSS editors */}
      <div className="flex h-1/2 min-h-0 w-full flex-col border-b border-gray-200 md:h-full md:w-1/2 md:border-b-0 md:border-r">
        <div
          role="tablist"
          aria-label="Code panes"
          className="flex shrink-0 items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={pane === "html"}
            onClick={() => setPane("html")}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              pane === "html"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            HTML
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={pane === "css"}
            onClick={() => setPane("css")}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              pane === "css"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            CSS
          </button>
          <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-400">
            {pane === "html" ? "Page.html" : "Page.css"}
          </span>
          {/* Formats the ACTIVE pane only. Prettier loads lazily on first click
              (dynamic import in formatActive) — it is not in the initial chunk. */}
          <button
            type="button"
            onClick={formatActive}
            disabled={isFormatting}
            title={`Format ${pane === "html" ? "HTML" : "CSS"} with Prettier`}
            className="ml-auto rounded px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200 transition-colors hover:bg-white hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
          >
            {isFormatting ? "Formatting…" : "Format"}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {/* Both editors stay mounted; the inactive one is hidden so cursor and
              scroll position survive tab switches. */}
          <div className={pane === "html" ? "h-full" : "hidden"}>
            <CodeMirror
              value={html}
              onChange={onHtmlChange}
              extensions={[htmlLang()]}
              height="100%"
              className="h-full text-sm"
              aria-label="HTML editor"
            />
          </div>
          <div className={pane === "css" ? "h-full" : "hidden"}>
            <CodeMirror
              value={css}
              onChange={onCssChange}
              extensions={[cssLang()]}
              height="100%"
              className="h-full text-sm"
              aria-label="CSS editor"
            />
          </div>
        </div>
      </div>

      {/* Live preview column */}
      <div className="flex h-1/2 min-h-0 w-full flex-col md:h-full md:w-1/2">
        <div className="flex shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Live Preview
          </span>
        </div>
        <div className="min-h-0 flex-1 bg-white">
          <iframe
            title="Code preview"
            sandbox=""
            srcDoc={srcDoc}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
