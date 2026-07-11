import { NextRequest, NextResponse } from "next/server";
import { getTemplateRepository } from "@/infrastructure/template/templateRepository";
import { getUserTemplateRepository } from "@/infrastructure/template/FileTemplateRepository";

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

// Delete a user-authored template. Seeded templates are not deletable.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await getTemplateRepository().findById(id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    if (template.source !== "user") {
      return NextResponse.json(
        { error: "Seeded templates cannot be deleted" },
        { status: 403 }
      );
    }
    await getUserTemplateRepository().delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
