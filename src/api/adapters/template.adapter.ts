// Adapters for the Templates API.
//
// REQUEST adapters build + validate the request body/params before any network
// call; RESPONSE adapters parse raw JSON against the response schema and return
// the client model (a server contract breach surfaces as a zod error).
import { z } from "zod";
import {
  TemplateSummarySchema,
  FullTemplateSchema,
  ListTemplatesResponseSchema,
  GetTemplateResponseSchema,
  CreateTemplateRequestSchema,
  CreateTemplateResponseSchema,
  RemoveTemplateResponseSchema,
} from "../schemas/template.schema";

// Client models returned to callers.
export type TemplateSummaryModel = z.infer<typeof TemplateSummarySchema>;
export type FullTemplateModel = z.infer<typeof FullTemplateSchema>;

// UseCase-facing input for saving the current canvas as a user template.
export interface CreateTemplateInput {
  name: string;
  category?: string;
  html: string;
  css?: string;
}

// ---- Request adapters -----------------------------------------------------

// GET /api/templates has no request body/params.
export function adaptListTemplatesRequest(): void {
  return undefined;
}

// GET /api/templates/{id} — validate the path id.
export function adaptGetTemplateRequest(id: string): string {
  return z.string().min(1).parse(id);
}

// POST /api/templates — build + validate the create body.
export function adaptCreateTemplateRequest(input: CreateTemplateInput) {
  return CreateTemplateRequestSchema.parse({
    name: input.name,
    category: input.category,
    html: input.html,
    css: input.css,
  });
}

// DELETE /api/templates/{id} — validate the path id.
export function adaptRemoveTemplateRequest(id: string): string {
  return z.string().min(1).parse(id);
}

// ---- Response adapters ----------------------------------------------------

export function adaptListTemplatesResponse(
  json: unknown
): TemplateSummaryModel[] {
  return ListTemplatesResponseSchema.parse(json).templates;
}

export function adaptGetTemplateResponse(json: unknown): FullTemplateModel {
  return GetTemplateResponseSchema.parse(json).template;
}

export function adaptCreateTemplateResponse(json: unknown): FullTemplateModel {
  return CreateTemplateResponseSchema.parse(json).template;
}

export function adaptRemoveTemplateResponse(json: unknown): void {
  RemoveTemplateResponseSchema.parse(json);
}
