import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import {
  canTransition,
  type EntitlementState,
} from "@/domain/module-catalog/Entitlement";
import type { ModuleTier } from "@/domain/module-catalog/Module";
import { findModuleById } from "@/infrastructure/module-catalog/moduleCatalog";
import { templateEntitlementKey } from "@/domain/template/Template";
import { getTemplateRepository } from "@/infrastructure/template/SeededTemplateRepository";
import { getEntitlementRepository } from "@/infrastructure/module-catalog/FileEntitlementRepository";

export const runtime = "nodejs";

interface EntitlementPayload {
  moduleId?: string;
  templateId?: string;
  state: EntitlementState;
}

const VALID_STATES: EntitlementState[] = ["locked", "trial", "granted"];

// Resolve the (entitlement key, tier, echo-id) for either a module or a template.
async function resolveTarget(
  body: EntitlementPayload
): Promise<{ key: string; tier: ModuleTier; echo: Record<string, string> } | null> {
  if (body.templateId) {
    const template = await getTemplateRepository().findById(body.templateId);
    if (!template) return null;
    return {
      key: templateEntitlementKey(template.id),
      tier: template.tier,
      echo: { templateId: template.id },
    };
  }
  if (body.moduleId) {
    const module = findModuleById(body.moduleId);
    if (!module) return null;
    return { key: module.id, tier: module.tier, echo: { moduleId: module.id } };
  }
  return null;
}

// Sets the entitlement state for a module or template. Stands in for real
// billing/upgrade until auth lands — e.g. moving a paid item trial -> granted.
export async function POST(request: NextRequest) {
  try {
    const body: EntitlementPayload = await request.json();
    if (!VALID_STATES.includes(body.state)) {
      return NextResponse.json(
        { error: "Invalid entitlement state" },
        { status: 400 }
      );
    }

    const target = await resolveTarget(body);
    if (!target) {
      return NextResponse.json(
        { error: "Unknown module or template" },
        { status: 404 }
      );
    }

    const repo = getEntitlementRepository();
    const current = await repo.getState(
      ANONYMOUS_OWNER_ID,
      target.key,
      target.tier
    );
    if (!canTransition(current, body.state)) {
      return NextResponse.json(
        { error: `Cannot transition ${current} -> ${body.state}` },
        { status: 400 }
      );
    }

    await repo.setState(ANONYMOUS_OWNER_ID, target.key, body.state);
    return NextResponse.json({
      success: true,
      ...target.echo,
      state: body.state,
    });
  } catch (error) {
    console.error("Error updating entitlement:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
