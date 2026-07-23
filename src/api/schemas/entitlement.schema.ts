// Zod contract for the Entitlement API (src/app/api/entitlement/route.ts).
//
// Single source of truth for the entitlement request/response shape; mirrors the
// server route handler verbatim.
//
// Wire facts mirrored from the route:
// - POST /api/entitlement -> { success: true, state, moduleId? | templateId? }
//
// The server echoes back exactly ONE of `moduleId`/`templateId` (whichever the
// request targeted), so both are optional in the response. There is NO
// `GET /api/entitlement` route: entitlement STATE is read via the modules /
// templates list responses (which each embed the current `entitlement`).
import { z } from "zod";

export const EntitlementStateSchema = z.enum(["locked", "trial", "granted"]);
export type EntitlementState = z.infer<typeof EntitlementStateSchema>;

// POST /api/entitlement — set the entitlement state for a module OR a template.
// Exactly one of `moduleId`/`templateId` identifies the target.
export const SetEntitlementRequestSchema = z.object({
  moduleId: z.string().optional(),
  templateId: z.string().optional(),
  state: EntitlementStateSchema,
});
export type SetEntitlementRequest = z.infer<typeof SetEntitlementRequestSchema>;

export const SetEntitlementResponseSchema = z.object({
  success: z.literal(true),
  state: EntitlementStateSchema,
  moduleId: z.string().optional(),
  templateId: z.string().optional(),
});
export type SetEntitlementResponse = z.infer<
  typeof SetEntitlementResponseSchema
>;
