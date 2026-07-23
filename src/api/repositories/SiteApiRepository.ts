// Transport-owning repository for the Sites (projects) API. One method per
// endpoint; same build-via-adapter → http → map-via-adapter pipeline as
// PageApiRepository. `http.request` throws `ApiError` on non-2xx.
import { request } from "../http";
import {
  adaptListSitesRequest,
  adaptListSitesResponse,
  adaptCreateSiteRequest,
  adaptCreateSiteResponse,
  adaptGetSiteRequest,
  adaptGetSiteResponse,
  adaptUpdateSiteRequest,
  adaptUpdateSiteResponse,
  type CreateSiteInput,
  type UpdateSiteInput,
  type SiteModel,
  type SiteSummaryModel,
  type SiteDetailModel,
} from "../adapters/site.adapter";

export class SiteApiRepository {
  async list(): Promise<SiteSummaryModel[]> {
    adaptListSitesRequest();
    const json = await request("/api/sites");
    return adaptListSitesResponse(json);
  }

  async create(input: CreateSiteInput): Promise<SiteModel> {
    const body = adaptCreateSiteRequest(input);
    const json = await request("/api/sites", { method: "POST", body });
    return adaptCreateSiteResponse(json);
  }

  async get(id: string): Promise<SiteDetailModel> {
    const siteId = adaptGetSiteRequest(id);
    const json = await request(`/api/sites/${siteId}`);
    return adaptGetSiteResponse(json);
  }

  async update(id: string, patch: UpdateSiteInput): Promise<SiteModel> {
    const siteId = adaptGetSiteRequest(id);
    const body = adaptUpdateSiteRequest(patch);
    const json = await request(`/api/sites/${siteId}`, {
      method: "PATCH",
      body,
    });
    return adaptUpdateSiteResponse(json);
  }
}
