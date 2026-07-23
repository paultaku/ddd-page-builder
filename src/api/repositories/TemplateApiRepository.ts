// Transport-owning repository for the Templates API. Each method encapsulates
// ONE endpoint: build the request via a request adapter, perform the HTTP call,
// then map the raw response via a response adapter. `http.request` throws
// `ApiError` on non-2xx (e.g. 403 when deleting a seeded template).
import { request } from "../http";
import {
  adaptListTemplatesRequest,
  adaptListTemplatesResponse,
  adaptGetTemplateRequest,
  adaptGetTemplateResponse,
  adaptCreateTemplateRequest,
  adaptCreateTemplateResponse,
  adaptRemoveTemplateRequest,
  adaptRemoveTemplateResponse,
  type CreateTemplateInput,
  type TemplateSummaryModel,
  type FullTemplateModel,
} from "../adapters/template.adapter";

export class TemplateApiRepository {
  async list(): Promise<TemplateSummaryModel[]> {
    adaptListTemplatesRequest();
    const json = await request("/api/templates");
    return adaptListTemplatesResponse(json);
  }

  async get(id: string): Promise<FullTemplateModel> {
    const templateId = adaptGetTemplateRequest(id);
    const json = await request(`/api/templates/${templateId}`);
    return adaptGetTemplateResponse(json);
  }

  async create(input: CreateTemplateInput): Promise<FullTemplateModel> {
    const body = adaptCreateTemplateRequest(input);
    const json = await request("/api/templates", { method: "POST", body });
    return adaptCreateTemplateResponse(json);
  }

  async remove(id: string): Promise<void> {
    const templateId = adaptRemoveTemplateRequest(id);
    const json = await request(`/api/templates/${templateId}`, {
      method: "DELETE",
    });
    adaptRemoveTemplateResponse(json);
  }
}
