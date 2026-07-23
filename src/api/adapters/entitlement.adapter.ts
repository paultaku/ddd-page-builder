// Adapters for the Entitlement API.
//
// REQUEST adapter builds + validates the POST body before the network call;
// RESPONSE adapter parses the raw JSON against the response schema and returns
// the client model. Exactly one of `moduleId`/`templateId` targets the change.
import { z } from "zod";
import {
  SetEntitlementRequestSchema,
  SetEntitlementResponseSchema,
} from "../schemas/entitlement.schema";
import type { EntitlementState } from "../schemas/entitlement.schema";

// Client model returned to callers.
export interface SetEntitlementResultModel {
  success: true;
  state: EntitlementState;
  moduleId?: string;
  templateId?: string;
}

// UseCase-facing input: target a module OR a template and the desired state.
export type SetEntitlementInput =
  | { moduleId: string; state: EntitlementState }
  | { templateId: string; state: EntitlementState };

// ---- Request adapter ------------------------------------------------------

// POST /api/entitlement — build + validate the body.
export function adaptSetEntitlementRequest(input: SetEntitlementInput) {
  return SetEntitlementRequestSchema.parse(input);
}

// ---- Response adapter -----------------------------------------------------

export function adaptSetEntitlementResponse(
  json: unknown
): SetEntitlementResultModel {
  const dto = SetEntitlementResponseSchema.parse(json);
  return {
    success: dto.success,
    state: dto.state,
    moduleId: dto.moduleId,
    templateId: dto.templateId,
  };
}
