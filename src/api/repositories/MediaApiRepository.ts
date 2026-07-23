// Transport-owning repository for the Media Library API. Each method encapsulates
// ONE endpoint: build the request via a request adapter, perform the HTTP call,
// then map the raw response via a response adapter. URL construction, HTTP method
// and status handling live here; `http.request` throws `ApiError` on non-2xx.
//
// Note: the server exposes no `GET /api/media/{id}`, so `get(id)` reads the full
// list (real `GET /api/media`) and selects the item — no fabricated endpoint.
// `update` uses PATCH (matching the route), not PUT.
import { request } from "../http";
import {
  adaptListMediaRequest,
  adaptListMediaResponse,
  adaptUploadMediaRequest,
  adaptUploadMediaResponse,
  adaptUpdateMediaRequest,
  adaptUpdateMediaResponse,
  adaptRemoveMediaResponse,
  adaptAddCategoryRequest,
  adaptCategoriesResponse,
  type UploadMediaInput,
  type UpdateMediaInput,
  type MediaItemModel,
  type MediaListModel,
} from "../adapters/media.adapter";

export class MediaApiRepository {
  async list(): Promise<MediaListModel> {
    adaptListMediaRequest();
    const json = await request("/api/media");
    return adaptListMediaResponse(json);
  }

  // No `GET /api/media/{id}` route exists — read from the list and select.
  async get(id: string): Promise<MediaItemModel> {
    const { items } = await this.list();
    const item = items.find((i) => i.id === id);
    if (!item) {
      throw new Error(`Media not found: ${id}`);
    }
    return item;
  }

  async upload(input: UploadMediaInput): Promise<MediaItemModel> {
    const body = adaptUploadMediaRequest(input);
    const json = await request("/api/media", { method: "POST", body });
    return adaptUploadMediaResponse(json);
  }

  async update(id: string, input: UpdateMediaInput): Promise<MediaItemModel> {
    const body = adaptUpdateMediaRequest(input);
    const json = await request(`/api/media/${id}`, { method: "PATCH", body });
    return adaptUpdateMediaResponse(json);
  }

  async remove(id: string): Promise<void> {
    const json = await request(`/api/media/${id}`, { method: "DELETE" });
    adaptRemoveMediaResponse(json);
  }

  async listCategories(): Promise<string[]> {
    const json = await request("/api/media/categories");
    return adaptCategoriesResponse(json);
  }

  async addCategory(name: string): Promise<string[]> {
    const body = adaptAddCategoryRequest(name);
    const json = await request("/api/media/categories", {
      method: "POST",
      body,
    });
    return adaptCategoriesResponse(json);
  }

  async removeCategory(name: string): Promise<string[]> {
    const json = await request(
      `/api/media/categories/${encodeURIComponent(name)}`,
      { method: "DELETE" }
    );
    return adaptCategoriesResponse(json);
  }
}
