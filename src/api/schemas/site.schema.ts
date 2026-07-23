// Zod contract for the Sites (projects) API (Site Management routes).
//
// Mirrors src/app/api/sites/**. The ColorPalette shape matches
// domain/site/ColorPalette.ts (five hex strings). Types via `z.infer`.
import { z } from "zod";

// Project theme: five named hex color slots. The server sanitizes these to hex,
// but the wire contract is just five strings.
export const ColorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
});
export type ColorPalette = z.infer<typeof ColorPaletteSchema>;

// GET /api/sites — summary rows (no pageIds; a derived pageCount instead).
export const SiteSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  pageCount: z.number(),
  colorPalette: ColorPaletteSchema,
  updatedAt: z.string(),
});
export type SiteSummary = z.infer<typeof SiteSummarySchema>;

export const ListSitesResponseSchema = z.object({
  sites: z.array(SiteSummarySchema),
});
export type ListSitesResponse = z.infer<typeof ListSitesResponseSchema>;

// The full Site aggregate (domain/site/Site.ts), returned by create/get/update.
export const SiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  templateId: z.string(),
  pageIds: z.array(z.string()),
  colorPalette: ColorPaletteSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  published: z.boolean(),
});
export type Site = z.infer<typeof SiteSchema>;

// POST /api/sites — create a Site from a template. `pages` seeds one page per
// entry (defaults to a single page named after the site when omitted).
export const CreateSiteRequestSchema = z.object({
  name: z.string().min(1),
  templateId: z.string().min(1),
  pages: z
    .array(
      z.object({
        title: z.string().optional(),
      })
    )
    .optional(),
});
export type CreateSiteRequest = z.infer<typeof CreateSiteRequestSchema>;

export const CreateSiteResponseSchema = z.object({
  site: SiteSchema,
});
export type CreateSiteResponse = z.infer<typeof CreateSiteResponseSchema>;

// GET /api/sites/{id} — the Site plus its member page summaries.
export const SiteDetailPageSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  published: z.boolean(),
});
export type SiteDetailPage = z.infer<typeof SiteDetailPageSchema>;

export const GetSiteResponseSchema = z.object({
  site: SiteSchema,
  pages: z.array(SiteDetailPageSchema),
});
export type GetSiteResponse = z.infer<typeof GetSiteResponseSchema>;

// PATCH /api/sites/{id} — update the name and/or a partial palette.
export const UpdateSiteRequestSchema = z.object({
  name: z.string().optional(),
  colorPalette: ColorPaletteSchema.partial().optional(),
});
export type UpdateSiteRequest = z.infer<typeof UpdateSiteRequestSchema>;

export const UpdateSiteResponseSchema = z.object({
  site: SiteSchema,
});
export type UpdateSiteResponse = z.infer<typeof UpdateSiteResponseSchema>;
