// Transport-owning repository for the Module Catalog API. `list` encapsulates
// the single `GET /api/modules` endpoint: perform the call, then map the raw
// response via the response adapter. `http.request` throws `ApiError` on non-2xx.
import { request } from "../http";
import {
  adaptListModulesRequest,
  adaptListModulesResponse,
  type ModuleSummaryModel,
} from "../adapters/module.adapter";

export class ModuleApiRepository {
  async list(): Promise<ModuleSummaryModel[]> {
    adaptListModulesRequest();
    const json = await request("/api/modules");
    return adaptListModulesResponse(json);
  }
}
