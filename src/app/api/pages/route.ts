import { NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";

export const runtime = "nodejs";

// Lists the current (anonymous) owner's pages. Auth-scoped ownership lands later.
export async function GET() {
  try {
    const pages = await getPageRepository().listByOwner(ANONYMOUS_OWNER_ID);
    return NextResponse.json({
      pages: pages.map((p) => ({
        uuid: p.uuid,
        title: p.title,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error listing pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
