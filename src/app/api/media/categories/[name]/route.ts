import { NextRequest, NextResponse } from "next/server";
import { getMediaRepository } from "@/infrastructure/media/FileMediaRepository";

export const runtime = "nodejs";

// Remove a media category (and unassign it from any items).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const categories = await getMediaRepository().removeCategory(
      decodeURIComponent(name)
    );
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error removing category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
