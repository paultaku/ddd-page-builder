import { NextRequest, NextResponse } from "next/server";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getSiteRepository } from "@/infrastructure/site/FileSiteRepository";

export const runtime = "nodejs";

// Site with its member page summaries.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await getSiteRepository().findById(id);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    const pageRepo = getPageRepository();
    const pages = [];
    for (const uuid of site.pageIds) {
      const page = await pageRepo.findById(uuid);
      if (page) {
        pages.push({
          uuid: page.uuid,
          title: page.title,
          published: page.published,
        });
      }
    }
    return NextResponse.json({ site, pages });
  } catch (error) {
    console.error("Error loading site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
