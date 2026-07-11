import { NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { getModuleCatalog } from "@/infrastructure/module-catalog/moduleCatalog";
import { getEntitlementRepository } from "@/infrastructure/module-catalog/FileEntitlementRepository";

export const runtime = "nodejs";

// Catalog for the editor: each module with its tier, current entitlement, and
// the block HTML to insert when placed.
export async function GET() {
  try {
    const catalog = getModuleCatalog();
    const repo = getEntitlementRepository();
    const modules = await Promise.all(
      catalog.map(async (m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        tier: m.tier,
        blockHtml: m.blockHtml,
        entitlement: await repo.getState(ANONYMOUS_OWNER_ID, m.id, m.tier),
      }))
    );
    return NextResponse.json({ modules });
  } catch (error) {
    console.error("Error listing modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
