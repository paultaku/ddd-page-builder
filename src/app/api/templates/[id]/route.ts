import { NextRequest, NextResponse } from "next/server";
import { getTemplateRepository } from "@/infrastructure/template/SeededTemplateRepository";

export const runtime = "nodejs";

// Full template (html + css) for importing into the editor canvas.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await getTemplateRepository().findById(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ template });
  } catch (error) {
    console.error("Error loading template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
