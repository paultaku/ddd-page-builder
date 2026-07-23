// Zod contract for the Module Catalog API (src/app/api/modules/route.ts).
//
// Single source of truth for the modules response shape; mirrors the server
// route handler verbatim. Client model TYPES are derived via `z.infer`.
//
// Wire facts mirrored from the route:
// - GET /api/modules -> { modules: ModuleSummary[] }
//   each module: metadata + tier + current entitlement + block HTML to insert.
//
// Enum-typed `tier`/`entitlement` mirror the domain unions so the inferred
// client type matches the component's expected literal unions exactly.
import { z } from "zod";

export const ModuleTierSchema = z.enum(["free", "paid"]);
export const EntitlementStateSchema = z.enum(["locked", "trial", "granted"]);

export const ModuleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  tier: ModuleTierSchema,
  blockHtml: z.string(),
  entitlement: EntitlementStateSchema,
});
export type ModuleSummary = z.infer<typeof ModuleSummarySchema>;

export const ListModulesResponseSchema = z.object({
  modules: z.array(ModuleSummarySchema),
});
export type ListModulesResponse = z.infer<typeof ListModulesResponseSchema>;
