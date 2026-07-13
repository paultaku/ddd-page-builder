import { NextRequest, NextResponse } from "next/server";
import { getMediaRepository } from "@/infrastructure/media/FileMediaRepository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await getMediaRepository().listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error listing categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a media category.
export async function POST(request: NextRequest) {
  try {
    const body: { name?: string } = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    const categories = await getMediaRepository().addCategory(name);
    return NextResponse.json({ categories }, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
