// Zod contract for the Pages API (Page Composition + publish/project routes).
//
// These schemas are the single source of truth for the request/response shapes
// and mirror the server route handlers verbatim (src/app/api/page*/**). Client
// model TYPES are derived via `z.infer` so schema and type never drift.
//
// zod v4: string formats are top-level factories (`z.uuid()`), not `.uuid()`
// methods; validation issues live on `err.issues`.
import { z } from "zod";

// GET /api/pages — one row per owned page, carrying its owning project id.
export const PageSummarySchema = z.object({
  uuid: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  projectId: z.string().nullable(),
});
export type PageSummary = z.infer<typeof PageSummarySchema>;

export const ListPagesResponseSchema = z.object({
  pages: z.array(PageSummarySchema),
});
export type ListPagesResponse = z.infer<typeof ListPagesResponseSchema>;

// GET /api/page/{uuid} — the full stored Page aggregate (domain/page/Page.ts).
export const StoredPageSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  html: z.string(),
  css: z.string(),
  ownerId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  published: z.boolean(),
  publishedAt: z.string().optional(),
  slug: z.string().optional(),
  templateId: z.string().optional(),
  purchaseUrl: z.string().optional(),
});
export type StoredPage = z.infer<typeof StoredPageSchema>;

export const GetPageResponseSchema = z.object({
  page: StoredPageSchema,
});
export type GetPageResponse = z.infer<typeof GetPageResponseSchema>;

// POST /api/page/{uuid} — save (upsert) payload. `html` is required non-empty;
// server rejects an empty html with 400.
export const SavePageRequestSchema = z.object({
  uuid: z.uuid(),
  html: z.string().min(1),
  css: z.string().optional(),
  templateId: z.string().optional(),
  purchaseUrl: z.string().optional(),
  metadata: z
    .object({
      pageTitle: z.string().optional(),
    })
    .optional(),
});
export type SavePageRequest = z.infer<typeof SavePageRequestSchema>;

export const SavePageResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  uuid: z.string(),
  savedAt: z.string(),
});
export type SavePageResponse = z.infer<typeof SavePageResponseSchema>;

// POST /api/page/{uuid}/publish
export const PublishRequestSchema = z.object({
  published: z.boolean(),
});
export type PublishRequest = z.infer<typeof PublishRequestSchema>;

export const PublishResponseSchema = z.object({
  success: z.literal(true),
  published: z.boolean(),
  url: z.string(),
});
export type PublishResponse = z.infer<typeof PublishResponseSchema>;

// A gated module/template reference in the 403 publish-blocked payload.
export const BlockedRefSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type BlockedRef = z.infer<typeof BlockedRefSchema>;

// 403 body when publishing is blocked by a trial entitlement. Both lists are
// optional; either (or both) may be present.
export const PublishBlockedPayloadSchema = z.object({
  error: z.string(),
  blockedModules: z.array(BlockedRefSchema).optional(),
  blockedTemplate: BlockedRefSchema.optional(),
});
export type PublishBlockedPayload = z.infer<typeof PublishBlockedPayloadSchema>;

// PUT /api/page/{uuid}/project — assign to a project (Site) or detach (null).
export const AssignProjectRequestSchema = z.object({
  siteId: z.string().nullable(),
});
export type AssignProjectRequest = z.infer<typeof AssignProjectRequestSchema>;

export const AssignProjectResponseSchema = z.object({
  siteId: z.string().nullable(),
});
export type AssignProjectResponse = z.infer<typeof AssignProjectResponseSchema>;
