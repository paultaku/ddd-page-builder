import { NextRequest, NextResponse } from "next/server";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";

export const runtime = "nodejs";

interface PublishPayload {
  published: boolean;
}

// Toggles a page's published state. This is the single explicit, interceptable
// publish action; Proposal C's trial gate attaches here.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const body: PublishPayload = await request.json();

    const repo = getPageRepository();
    const page = await repo.findById(uuid);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const publish = !!body.published;
    const now = new Date().toISOString();
    await repo.save({
      ...page,
      published: publish,
      publishedAt: publish ? page.publishedAt ?? now : page.publishedAt,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      published: publish,
      url: `/p/${uuid}`,
    });
  } catch (error) {
    console.error("Error publishing page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
