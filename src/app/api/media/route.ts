import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { ANONYMOUS_OWNER_ID, type MediaItem } from "@/domain/media/MediaItem";
import { getMediaRepository } from "@/infrastructure/media/FileMediaRepository";

export const runtime = "nodejs";

// Cap the inline data URL so JSON records stay sane (mock storage).
const MAX_DATA_URL_LENGTH = 8_000_000; // ~6MB file after base64

interface UploadPayload {
  filename?: string;
  mimeType?: string;
  size?: number;
  dataUrl?: string;
  category?: string | null;
}

export async function GET() {
  try {
    const repo = getMediaRepository();
    const [items, categories] = await Promise.all([
      repo.listItems(ANONYMOUS_OWNER_ID),
      repo.listCategories(),
    ]);
    return NextResponse.json({ items, categories });
  } catch (error) {
    console.error("Error listing media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadPayload = await request.json();
    const filename = body.filename?.trim();
    if (!filename || !body.mimeType || !body.dataUrl) {
      return NextResponse.json(
        { error: "filename, mimeType and dataUrl are required" },
        { status: 400 }
      );
    }
    if (!body.dataUrl.startsWith("data:")) {
      return NextResponse.json(
        { error: "dataUrl must be a data: URL" },
        { status: 400 }
      );
    }
    if (body.dataUrl.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json(
        { error: "File too large" },
        { status: 413 }
      );
    }

    const item: MediaItem = {
      id: randomUUID(),
      filename,
      mimeType: body.mimeType,
      size: typeof body.size === "number" ? body.size : 0,
      dataUrl: body.dataUrl,
      category: body.category ?? null,
      ownerId: ANONYMOUS_OWNER_ID,
      uploadedAt: new Date().toISOString(),
    };
    await getMediaRepository().saveItem(item);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
