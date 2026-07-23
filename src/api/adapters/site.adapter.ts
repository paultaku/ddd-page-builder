// Adapters for the Sites (projects) API. Same contract as page.adapter.ts:
// request adapters build+validate the outgoing body; response adapters zod-parse
// the raw JSON and return the client model.
import { z } from "zod";
import {
  SiteSchema,
  SiteSummarySchema,
  ListSitesResponseSchema,
  CreateSiteRequestSchema,
  CreateSiteResponseSchema,
  GetSiteResponseSchema,
  SiteDetailPageSchema,
  UpdateSiteRequestSchema,
  UpdateSiteResponseSchema,
  type ColorPalette,
} from "../schemas/site.schema";

// UseCase-facing inputs.
export interface CreateSiteInput {
  name: string;
  templateId: string;
  pages?: Array<{ title?: string }>;
}
export interface UpdateSiteInput {
  name?: string;
  colorPalette?: Partial<ColorPalette>;
}

// Client models.
export type SiteModel = z.infer<typeof SiteSchema>;
export type SiteSummaryModel = z.infer<typeof SiteSummarySchema>;
export type SiteDetailPageModel = z.infer<typeof SiteDetailPageSchema>;
export interface SiteDetailModel {
  site: SiteModel;
  pages: SiteDetailPageModel[];
}

// ---- Request adapters -----------------------------------------------------

// GET /api/sites has no request body/params.
export function adaptListSitesRequest(): void {
  return undefined;
}

// GET /api/sites/{id} — validate the path id (opaque string id).
export function adaptGetSiteRequest(id: string): string {
  return z.string().min(1).parse(id);
}

// POST /api/sites
export function adaptCreateSiteRequest(input: CreateSiteInput) {
  return CreateSiteRequestSchema.parse({
    name: input.name,
    templateId: input.templateId,
    pages: input.pages,
  });
}

// PATCH /api/sites/{id}
export function adaptUpdateSiteRequest(patch: UpdateSiteInput) {
  return UpdateSiteRequestSchema.parse({
    name: patch.name,
    colorPalette: patch.colorPalette,
  });
}

// ---- Response adapters ----------------------------------------------------

export function adaptListSitesResponse(json: unknown): SiteSummaryModel[] {
  return ListSitesResponseSchema.parse(json).sites;
}

export function adaptCreateSiteResponse(json: unknown): SiteModel {
  return CreateSiteResponseSchema.parse(json).site;
}

export function adaptGetSiteResponse(json: unknown): SiteDetailModel {
  const dto = GetSiteResponseSchema.parse(json);
  return { site: dto.site, pages: dto.pages };
}

export function adaptUpdateSiteResponse(json: unknown): SiteModel {
  return UpdateSiteResponseSchema.parse(json).site;
}
