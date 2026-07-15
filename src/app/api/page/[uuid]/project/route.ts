import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";

export const runtime = "nodejs";

interface AssignPayload {
  // Target project (Site) id, or null/"" to detach the page from any project.
  siteId?: string | null;
}

// Assign a page to a project (Site), or detach it. Membership is single-project:
// the page is removed from every other Site first, so it delegates to exactly
// one palette. Returns the resulting project id (null when detached).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const page = await getPageRepository().findById(uuid);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body: AssignPayload = await request.json();
    const targetId = body.siteId?.trim() || null;

    const siteRepo = getSiteRepository();
    const sites = await siteRepo.listByOwner(ANONYMOUS_OWNER_ID);

    let target = null;
    if (targetId) {
      target = sites.find((s) => s.id === targetId) ?? null;
      if (!target) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    const now = new Date().toISOString();
    // Detach from any other project so membership stays single-project.
    for (const site of sites) {
      if (site.id === targetId) continue;
      if (site.pageIds.includes(uuid)) {
        site.pageIds = site.pageIds.filter((id) => id !== uuid);
        site.updatedAt = now;
        await siteRepo.save(site);
      }
    }
    // Attach to the target (idempotent).
    if (target && !target.pageIds.includes(uuid)) {
      target.pageIds = [...target.pageIds, uuid];
      target.updatedAt = now;
      await siteRepo.save(target);
    }

    return NextResponse.json({ siteId: targetId });
  } catch (error) {
    console.error("Error assigning page to project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
