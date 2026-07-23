// Adapters for the Pages API.
//
// REQUEST adapters: turn a UseCase input into a validated request body (or a
// validated path param). `Schema.parse(...)` throws on invalid client input
// BEFORE any network call. RESPONSE adapters: parse raw JSON against the
// response schema (a server contract breach surfaces as a zod error, never a
// silent `undefined`) and return the client model.
import { z } from "zod";
import {
  PageSummarySchema,
  ListPagesResponseSchema,
  StoredPageSchema,
  GetPageResponseSchema,
  SavePageRequestSchema,
  SavePageResponseSchema,
  PublishRequestSchema,
  PublishResponseSchema,
  AssignProjectRequestSchema,
  AssignProjectResponseSchema,
} from "../schemas/page.schema";

// A validated page uuid path param.
const UuidSchema = z.uuid();

// UseCase-facing input for a save operation. `pageTitle` is wrapped into the
// server's `metadata.pageTitle` shape by the request adapter.
export interface SavePageInput {
  uuid: string;
  html: string;
  css?: string;
  templateId?: string;
  purchaseUrl?: string;
  pageTitle?: string;
}

// Client models returned to callers.
export type PageSummaryModel = z.infer<typeof PageSummarySchema>;
export type StoredPageModel = z.infer<typeof StoredPageSchema>;
export interface SavePageResultModel {
  uuid: string;
  savedAt: string;
}
export interface PublishResultModel {
  published: boolean;
  url: string;
}
export interface AssignProjectResultModel {
  siteId: string | null;
}

// ---- Request adapters -----------------------------------------------------

// GET /api/pages has no request body/params.
export function adaptListPagesRequest(): void {
  return undefined;
}

// GET /api/page/{uuid} — validate the path uuid.
export function adaptGetPageRequest(uuid: string): string {
  return UuidSchema.parse(uuid);
}

// POST /api/page/{uuid} — build + validate the save body.
export function adaptSavePageRequest(input: SavePageInput) {
  const body = {
    uuid: input.uuid,
    html: input.html,
    css: input.css,
    templateId: input.templateId,
    purchaseUrl: input.purchaseUrl,
    metadata:
      input.pageTitle !== undefined
        ? { pageTitle: input.pageTitle }
        : undefined,
  };
  return SavePageRequestSchema.parse(body);
}

// POST /api/page/{uuid}/publish
export function adaptPublishRequest(published: boolean) {
  return PublishRequestSchema.parse({ published });
}

// PUT /api/page/{uuid}/project
export function adaptAssignProjectRequest(siteId: string | null) {
  return AssignProjectRequestSchema.parse({ siteId });
}

// ---- Response adapters ----------------------------------------------------

export function adaptListPagesResponse(json: unknown): PageSummaryModel[] {
  return ListPagesResponseSchema.parse(json).pages;
}

export function adaptGetPageResponse(json: unknown): StoredPageModel {
  return GetPageResponseSchema.parse(json).page;
}

export function adaptSavePageResponse(json: unknown): SavePageResultModel {
  const dto = SavePageResponseSchema.parse(json);
  return { uuid: dto.uuid, savedAt: dto.savedAt };
}

export function adaptPublishResponse(json: unknown): PublishResultModel {
  const dto = PublishResponseSchema.parse(json);
  return { published: dto.published, url: dto.url };
}

export function adaptAssignProjectResponse(
  json: unknown
): AssignProjectResultModel {
  const dto = AssignProjectResponseSchema.parse(json);
  return { siteId: dto.siteId };
}
