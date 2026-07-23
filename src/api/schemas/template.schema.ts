// Zod contract for the Templates API (src/app/api/templates/**).
//
// Single source of truth for the template request/response shapes; mirrors the
// server route handlers verbatim. Client model TYPES are derived via `z.infer`.
//
// Wire facts mirrored from the routes:
// - GET    /api/templates       -> { templates: TemplateSummary[] } (metadata + entitlement)
// - POST   /api/templates       -> { template: FullTemplate }       (201, user template)
// - GET    /api/templates/{id}  -> { template: FullTemplate }        (html + css for import)
// - DELETE /api/templates/{id}  -> { success: true }
//
// Enum-typed fields (`tier`, `source`, `entitlement`) mirror the domain unions
// (domain/template/Template.ts, domain/module-catalog) so inferred client types
// match the components' expected literal unions exactly.
import { z } from "zod";

export const TemplateTierSchema = z.enum(["free", "paid"]);
export const TemplateSourceSchema = z.enum(["seed", "user"]);
export const EntitlementStateSchema = z.enum(["locked", "trial", "granted"]);

// GET /api/templates — one summary per template: metadata + current entitlement.
// `thumbnail` is optional (omitted from JSON when absent). Full html/css is
// fetched per-template on import.
export const TemplateSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  tier: TemplateTierSchema,
  source: TemplateSourceSchema,
  thumbnail: z.string().optional(),
  entitlement: EntitlementStateSchema,
});
export type TemplateSummary = z.infer<typeof TemplateSummarySchema>;

export const ListTemplatesResponseSchema = z.object({
  templates: z.array(TemplateSummarySchema),
});
export type ListTemplatesResponse = z.infer<typeof ListTemplatesResponseSchema>;

// The full stored Template aggregate (domain/template/Template.ts). Returned by
// GET /api/templates/{id} and POST /api/templates.
export const FullTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  tier: TemplateTierSchema,
  source: TemplateSourceSchema,
  ownerId: z.string().optional(),
  thumbnail: z.string().optional(),
  html: z.string(),
  css: z.string(),
});
export type FullTemplate = z.infer<typeof FullTemplateSchema>;

// GET /api/templates/{id}
export const GetTemplateResponseSchema = z.object({
  template: FullTemplateSchema,
});
export type GetTemplateResponse = z.infer<typeof GetTemplateResponseSchema>;

// POST /api/templates — save the current canvas as a user template. `name` and
// `html` are required by the server (400 otherwise); `category` defaults to
// "business" server-side when unknown.
export const CreateTemplateRequestSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  html: z.string().min(1),
  css: z.string().optional(),
});
export type CreateTemplateRequest = z.infer<typeof CreateTemplateRequestSchema>;

// POST /api/templates -> { template }
export const CreateTemplateResponseSchema = z.object({
  template: FullTemplateSchema,
});
export type CreateTemplateResponse = z.infer<
  typeof CreateTemplateResponseSchema
>;

// DELETE /api/templates/{id}
export const RemoveTemplateResponseSchema = z.object({
  success: z.literal(true),
});
export type RemoveTemplateResponse = z.infer<
  typeof RemoveTemplateResponseSchema
>;
