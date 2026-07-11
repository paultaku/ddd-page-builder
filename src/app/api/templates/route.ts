import { NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { templateEntitlementKey } from "@/domain/template/Template";
import { getTemplateRepository } from "@/infrastructure/template/SeededTemplateRepository";
import { getEntitlementRepository } from "@/infrastructure/module-catalog/FileEntitlementRepository";

export const runtime = "nodejs";

// Template catalog for the editor: metadata + current entitlement per template.
// Full html/css is fetched per-template on import (GET /api/templates/[id]).
export async function GET() {
  try {
    const templates = await getTemplateRepository().findAll();
    const entitlements = getEntitlementRepository();
    const list = await Promise.all(
      templates.map(async (t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        tier: t.tier,
        thumbnail: t.thumbnail,
        entitlement: await entitlements.getState(
          ANONYMOUS_OWNER_ID,
          templateEntitlementKey(t.id),
          t.tier
        ),
      }))
    );
    return NextResponse.json({ templates: list });
  } catch (error) {
    console.error("Error listing templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
