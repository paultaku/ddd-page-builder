import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID, type Page } from "@/domain/page/Page";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";

// Filesystem persistence requires the Node.js runtime, not edge.
export const runtime = "nodejs";

// Interface for the save payload
interface SavePagePayload {
  uuid: string;
  html: string;
  css?: string;
  templateId?: string;
  purchaseUrl?: string;
  metadata?: {
    pageTitle?: string;
  };
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const body: SavePagePayload = await request.json();
    const { uuid } = await params;

    if (!body.html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { error: "Invalid UUID format" },
        { status: 400 }
      );
    }

    // Upsert: preserve identity/ownership/createdAt across repeated saves.
    const repo = getPageRepository();
    const existing = await repo.findById(uuid);
    const now = new Date().toISOString();
    const page: Page = {
      uuid,
      title: body.metadata?.pageTitle || existing?.title || "Untitled Page",
      html: body.html,
      css: body.css ?? existing?.css ?? "",
      ownerId: existing?.ownerId ?? ANONYMOUS_OWNER_ID,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      published: existing?.published ?? false,
      publishedAt: existing?.publishedAt,
      slug: existing?.slug,
      templateId: body.templateId ?? existing?.templateId,
      purchaseUrl: body.purchaseUrl ?? existing?.purchaseUrl,
    };
    await repo.save(page);

    return NextResponse.json({
      success: true,
      message: "Page saved successfully",
      uuid,
      savedAt: page.updatedAt,
    });
  } catch (error) {
    console.error("Error saving page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { error: "Invalid UUID format" },
        { status: 400 }
      );
    }

    const page = await getPageRepository().findById(uuid);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Error loading page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
