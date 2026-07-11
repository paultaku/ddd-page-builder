import { NextRequest, NextResponse } from "next/server";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Public site index: lists the site's published member pages, each linking to
// its own public page (/p/[uuid]). 404 when the site is unknown.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const site = await getSiteRepository().findById(siteId);
  if (!site) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const pageRepo = getPageRepository();
  const items: string[] = [];
  for (const uuid of site.pageIds) {
    const page = await pageRepo.findById(uuid);
    if (page && page.published) {
      items.push(
        `<li><a href="/p/${page.uuid}">${escapeHtml(page.title || "Untitled Page")}</a></li>`
      );
    }
  }

  const body =
    items.length > 0
      ? `<ul>${items.join("")}</ul>`
      : `<p>No published pages yet.</p>`;

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(site.name)}</title>
<style>
body { margin: 0; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; }
h1 { color: #1f2937; }
ul { list-style: none; padding: 0; }
li { padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb; }
a { color: #2563eb; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>
</head>
<body>
<h1>${escapeHtml(site.name)}</h1>
${body}
</body>
</html>`;

  return new NextResponse(doc, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
