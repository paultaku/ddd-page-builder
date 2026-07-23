// Adapters for the Media Library API.
//
// REQUEST adapters: turn a UseCase input into a validated request body (or a
// validated path param). `Schema.parse(...)` throws on invalid client input
// BEFORE any network call. RESPONSE adapters: parse raw JSON against the
// response schema (a server contract breach surfaces as a zod error, never a
// silent `undefined`) and return the client model.
import { z } from "zod";
import {
  MediaItemSchema,
  ListMediaResponseSchema,
  UploadMediaRequestSchema,
  UploadMediaResponseSchema,
  UpdateMediaRequestSchema,
  UpdateMediaResponseSchema,
  RemoveMediaResponseSchema,
  CategoriesResponseSchema,
  AddCategoryRequestSchema,
} from "../schemas/media.schema";

// Client models returned to callers.
export type MediaItemModel = z.infer<typeof MediaItemSchema>;
export interface MediaListModel {
  items: MediaItemModel[];
  categories: string[];
}

// UseCase-facing input for an upload.
export interface UploadMediaInput {
  filename: string;
  mimeType: string;
  size?: number;
  dataUrl: string;
  category?: string | null;
}

// UseCase-facing input for a media update (rename and/or recategorize).
export interface UpdateMediaInput {
  filename?: string;
  category?: string | null;
}

// ---- Request adapters -----------------------------------------------------

// GET /api/media has no request body/params.
export function adaptListMediaRequest(): void {
  return undefined;
}

// POST /api/media — build + validate the upload body.
export function adaptUploadMediaRequest(input: UploadMediaInput) {
  return UploadMediaRequestSchema.parse({
    filename: input.filename,
    mimeType: input.mimeType,
    size: input.size,
    dataUrl: input.dataUrl,
    category: input.category,
  });
}

// PATCH /api/media/{id} — build + validate the update body.
export function adaptUpdateMediaRequest(input: UpdateMediaInput) {
  return UpdateMediaRequestSchema.parse({
    filename: input.filename,
    category: input.category,
  });
}

// POST /api/media/categories — validate the new category name.
export function adaptAddCategoryRequest(name: string) {
  return AddCategoryRequestSchema.parse({ name });
}

// ---- Response adapters ----------------------------------------------------

export function adaptListMediaResponse(json: unknown): MediaListModel {
  const dto = ListMediaResponseSchema.parse(json);
  return { items: dto.items, categories: dto.categories };
}

export function adaptUploadMediaResponse(json: unknown): MediaItemModel {
  return UploadMediaResponseSchema.parse(json).item;
}

export function adaptUpdateMediaResponse(json: unknown): MediaItemModel {
  return UpdateMediaResponseSchema.parse(json).item;
}

export function adaptRemoveMediaResponse(json: unknown): void {
  RemoveMediaResponseSchema.parse(json);
}

export function adaptCategoriesResponse(json: unknown): string[] {
  return CategoriesResponseSchema.parse(json).categories;
}
