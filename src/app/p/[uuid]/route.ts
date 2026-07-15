import { NextRequest, NextResponse } from "next/server";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";
import { DEFAULT_PALETTE, paletteToCssVars } from "@/domain/site/ColorPalette";
import { injectPurchaseUrl } from "@/lib/purchaseLink";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Public, read-only render of a published page. Serves the page's own stored
// HTML + compiled CSS as a self-contained document — no editor chrome and no
// external CDN. Returns 404 when the page is missing or not published.
//
// Theme delegation: if the page belongs to a project (Site), that project's
// color palette is emitted as `:root` CSS variables *before* the page CSS, so
// styles referencing `var(--color-*)` take the project theme. Pages with no
// project fall back to the default palette (identical to the seeded look).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const page = await getPageRepository().findById(uuid);

  if (!page || !page.published) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const site = await getSiteRepository().findByPageId(uuid);
  const paletteCss = paletteToCssVars(site?.colorPalette ?? DEFAULT_PALETTE);

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title || "Published Page")}</title>
<style>${paletteCss}
${page.css}
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }</style>
</head>
<body>${injectPurchaseUrl(page.html, page.purchaseUrl)}</body>
</html>`;

  return new NextResponse(doc, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
