// Zod contract for the Media Library API (src/app/api/media/**).
//
// These schemas are the single source of truth for the media request/response
// shapes and mirror the server route handlers verbatim. Client model TYPES are
// derived via `z.infer` so schema and type never drift.
//
// Wire facts mirrored from the routes:
// - GET  /api/media                    -> { items: MediaItem[], categories: string[] }
// - POST /api/media                    -> { item: MediaItem }            (201)
// - PATCH  /api/media/{id}             -> { item: MediaItem }            (rename / recategorize)
// - DELETE /api/media/{id}             -> { success: true }
// - GET  /api/media/categories         -> { categories: string[] }
// - POST /api/media/categories         -> { categories: string[] }      (201)
// - DELETE /api/media/categories/{name}-> { categories: string[] }
//
// Note: there is NO `GET /api/media/{id}` route — a single item is read from the
// list. `update` uses PATCH (not PUT).
//
// zod v4: string formats are top-level factories (`z.uuid()`), not `.uuid()`
// methods; validation issues live on `err.issues`.
import { z } from "zod";

// A stored media file (domain/media/MediaItem.ts). `dataUrl` is a base64 data
// URL (prototype storage); `category` is nullable.
export const MediaItemSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  dataUrl: z.string(),
  category: z.string().nullable(),
  ownerId: z.string(),
  uploadedAt: z.string(),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

// GET /api/media
export const ListMediaResponseSchema = z.object({
  items: z.array(MediaItemSchema),
  categories: z.array(z.string()),
});
export type ListMediaResponse = z.infer<typeof ListMediaResponseSchema>;

// POST /api/media — upload body. `filename`, `mimeType`, `dataUrl` are required
// by the server (400 otherwise); `dataUrl` must be a `data:` URL.
export const UploadMediaRequestSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().optional(),
  dataUrl: z.string().startsWith("data:"),
  category: z.string().nullable().optional(),
});
export type UploadMediaRequest = z.infer<typeof UploadMediaRequestSchema>;

// POST /api/media -> { item }
export const UploadMediaResponseSchema = z.object({
  item: MediaItemSchema,
});
export type UploadMediaResponse = z.infer<typeof UploadMediaResponseSchema>;

// PATCH /api/media/{id} — rename and/or reassign category. Both optional; the
// server applies whichever is present.
export const UpdateMediaRequestSchema = z.object({
  filename: z.string().optional(),
  category: z.string().nullable().optional(),
});
export type UpdateMediaRequest = z.infer<typeof UpdateMediaRequestSchema>;

// PATCH /api/media/{id} -> { item }
export const UpdateMediaResponseSchema = z.object({
  item: MediaItemSchema,
});
export type UpdateMediaResponse = z.infer<typeof UpdateMediaResponseSchema>;

// DELETE /api/media/{id}
export const RemoveMediaResponseSchema = z.object({
  success: z.literal(true),
});
export type RemoveMediaResponse = z.infer<typeof RemoveMediaResponseSchema>;

// GET /api/media/categories, POST /api/media/categories,
// DELETE /api/media/categories/{name} — all return the full category list.
export const CategoriesResponseSchema = z.object({
  categories: z.array(z.string()),
});
export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;

// POST /api/media/categories — add a category by name (server trims; 400 empty).
export const AddCategoryRequestSchema = z.object({
  name: z.string().min(1),
});
export type AddCategoryRequest = z.infer<typeof AddCategoryRequestSchema>;
