import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import { findUsedModules } from "@/domain/module-catalog/Module";
import { isPublishable } from "@/domain/module-catalog/Entitlement";
import { templateEntitlementKey } from "@/domain/template/Template";
import { getPageRepository } from "@/infrastructure/page/FilePageRepository";
import { getModuleCatalog } from "@/infrastructure/module-catalog/moduleCatalog";
import { getTemplateRepository } from "@/infrastructure/template/SeededTemplateRepository";
import { getEntitlementRepository } from "@/infrastructure/module-catalog/FileEntitlementRepository";

export const runtime = "nodejs";

interface PublishPayload {
  published: boolean;
}

// Toggles a page's published state. This is the single explicit, interceptable
// publish action; Proposal C's trial gate attaches here.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const body: PublishPayload = await request.json();

    const repo = getPageRepository();
    const page = await repo.findById(uuid);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const publish = !!body.published;

    // Trial gate: block publishing a page that uses any module not `granted`.
    // Placement/preview are never gated — only this explicit publish action.
    if (publish) {
      const used = findUsedModules(page.html, getModuleCatalog());
      const entitlements = getEntitlementRepository();
      const blockedModules: Array<{ id: string; name: string }> = [];
      for (const module of used) {
        const state = await entitlements.getState(
          ANONYMOUS_OWNER_ID,
          module.id,
          module.tier
        );
        if (!isPublishable(state)) {
          blockedModules.push({ id: module.id, name: module.name });
        }
      }
      // Also gate the page's source template if it is paid and not granted.
      let blockedTemplate: { id: string; name: string } | undefined;
      if (page.templateId) {
        const template = await getTemplateRepository().findById(page.templateId);
        if (template) {
          const state = await entitlements.getState(
            ANONYMOUS_OWNER_ID,
            templateEntitlementKey(template.id),
            template.tier
          );
          if (!isPublishable(state)) {
            blockedTemplate = { id: template.id, name: template.name };
          }
        }
      }

      if (blockedModules.length > 0 || blockedTemplate) {
        return NextResponse.json(
          { error: "Upgrade required to publish", blockedModules, blockedTemplate },
          { status: 403 }
        );
      }
    }

    const now = new Date().toISOString();
    await repo.save({
      ...page,
      published: publish,
      publishedAt: publish ? page.publishedAt ?? now : page.publishedAt,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      published: publish,
      url: `/p/${uuid}`,
    });
  } catch (error) {
    console.error("Error publishing page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
