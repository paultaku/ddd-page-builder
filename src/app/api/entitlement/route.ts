import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_OWNER_ID } from "@/domain/page/Page";
import {
  canTransition,
  type EntitlementState,
} from "@/domain/module-catalog/Entitlement";
import { findModuleById } from "@/infrastructure/module-catalog/moduleCatalog";
import { getEntitlementRepository } from "@/infrastructure/module-catalog/FileEntitlementRepository";

export const runtime = "nodejs";

interface EntitlementPayload {
  moduleId: string;
  state: EntitlementState;
}

const VALID_STATES: EntitlementState[] = ["locked", "trial", "granted"];

// Sets the entitlement state for a module. Stands in for real billing/upgrade
// until auth lands — e.g. moving a paid module from `trial` to `granted`.
export async function POST(request: NextRequest) {
  try {
    const body: EntitlementPayload = await request.json();
    const module = findModuleById(body.moduleId);
    if (!module) {
      return NextResponse.json({ error: "Unknown module" }, { status: 404 });
    }
    if (!VALID_STATES.includes(body.state)) {
      return NextResponse.json(
        { error: "Invalid entitlement state" },
        { status: 400 }
      );
    }

    const repo = getEntitlementRepository();
    const current = await repo.getState(
      ANONYMOUS_OWNER_ID,
      module.id,
      module.tier
    );
    if (!canTransition(current, body.state)) {
      return NextResponse.json(
        { error: `Cannot transition ${current} -> ${body.state}` },
        { status: 400 }
      );
    }

    await repo.setState(ANONYMOUS_OWNER_ID, module.id, body.state);
    return NextResponse.json({
      success: true,
      moduleId: module.id,
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
