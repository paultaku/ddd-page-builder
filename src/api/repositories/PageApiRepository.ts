// Transport-owning repository for the Pages API. Each method encapsulates ONE
// endpoint: build the request via a request adapter, perform the HTTP call, then
// map the raw response via a response adapter. URL construction, HTTP method and
// status handling live here; `http.request` throws `ApiError` on non-2xx, so the
// publish 403 (with `blockedModules`/`blockedTemplate`) propagates untouched for
// the UseCase to interpret.
import { request } from "../http";
import {
  adaptListPagesRequest,
  adaptListPagesResponse,
  adaptGetPageRequest,
  adaptGetPageResponse,
  adaptSavePageRequest,
  adaptSavePageResponse,
  adaptPublishRequest,
  adaptPublishResponse,
  adaptAssignProjectRequest,
  adaptAssignProjectResponse,
  type SavePageInput,
  type PageSummaryModel,
  type StoredPageModel,
  type SavePageResultModel,
  type PublishResultModel,
  type AssignProjectResultModel,
} from "../adapters/page.adapter";

export class PageApiRepository {
  async list(): Promise<PageSummaryModel[]> {
    adaptListPagesRequest();
    const json = await request("/api/pages");
    return adaptListPagesResponse(json);
  }

  async get(uuid: string): Promise<StoredPageModel> {
    const id = adaptGetPageRequest(uuid);
    const json = await request(`/api/page/${id}`);
    return adaptGetPageResponse(json);
  }

  async save(input: SavePageInput): Promise<SavePageResultModel> {
    const body = adaptSavePageRequest(input);
    const json = await request(`/api/page/${body.uuid}`, {
      method: "POST",
      body,
    });
    return adaptSavePageResponse(json);
  }

  async publish(uuid: string, published: boolean): Promise<PublishResultModel> {
    const id = adaptGetPageRequest(uuid);
    const body = adaptPublishRequest(published);
    const json = await request(`/api/page/${id}/publish`, {
      method: "POST",
      body,
    });
    return adaptPublishResponse(json);
  }

  async assignProject(
    uuid: string,
    siteId: string | null
  ): Promise<AssignProjectResultModel> {
    const id = adaptGetPageRequest(uuid);
    const body = adaptAssignProjectRequest(siteId);
    const json = await request(`/api/page/${id}/project`, {
      method: "PUT",
      body,
    });
    return adaptAssignProjectResponse(json);
  }
}
