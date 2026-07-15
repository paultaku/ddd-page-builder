import { NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";

export const runtime = "nodejs";

// Lists the current (anonymous) owner's pages. Auth-scoped ownership lands later.
// Each page carries its `projectId` (the Site it belongs to, if any) so the UI
// can show and change project assignment.
export async function GET() {
  try {
    const pages = await getPageRepository().listByOwner(ANONYMOUS_OWNER_ID);
    const sites = await getSiteRepository().listByOwner(ANONYMOUS_OWNER_ID);
    // pageId -> owning site id (single-project membership).
    const projectOf = new Map<string, string>();
    for (const site of sites) {
      for (const pageId of site.pageIds) projectOf.set(pageId, site.id);
    }
    return NextResponse.json({
      pages: pages.map((p) => ({
        uuid: p.uuid,
        title: p.title,
        updatedAt: p.updatedAt,
        projectId: projectOf.get(p.uuid) ?? null,
      })),
    });
  } catch (error) {
    console.error("Error listing pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
