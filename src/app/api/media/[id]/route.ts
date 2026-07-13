import { NextRequest, NextResponse } from "next/server";
import { getMediaRepository } from "@/infrastructure/media/FileMediaRepository";

export const runtime = "nodejs";

interface UpdatePayload {
  filename?: string;
  category?: string | null;
}

// Manage a media item: rename and/or reassign its category.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePayload = await request.json();
    const repo = getMediaRepository();
    const item = await repo.findItem(id);
    if (!item) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }
    if (typeof body.filename === "string" && body.filename.trim()) {
      item.filename = body.filename.trim();
    }
    if (body.category !== undefined) {
      item.category = body.category;
    }
    await repo.saveItem(item);
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await getMediaRepository().deleteItem(id);
    if (!deleted) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
