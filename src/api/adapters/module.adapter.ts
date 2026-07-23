// Adapters for the Module Catalog API.
//
// REQUEST adapter validates the (empty) request; RESPONSE adapter parses the raw
// JSON against the response schema and returns the client model list (a server
// contract breach surfaces as a zod error, never a silent `undefined`).
import { z } from "zod";
import {
  ModuleSummarySchema,
  ListModulesResponseSchema,
} from "../schemas/module.schema";

// Client model returned to callers.
export type ModuleSummaryModel = z.infer<typeof ModuleSummarySchema>;

// ---- Request adapter ------------------------------------------------------

// GET /api/modules has no request body/params.
export function adaptListModulesRequest(): void {
  return undefined;
}

// ---- Response adapter -----------------------------------------------------

export function adaptListModulesResponse(json: unknown): ModuleSummaryModel[] {
  return ListModulesResponseSchema.parse(json).modules;
}
