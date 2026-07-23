// Transport-owning repository for the Entitlement API. `set` encapsulates the
// single `POST /api/entitlement` endpoint: build the body via the request
// adapter, perform the call, then map the response. `http.request` throws
// `ApiError` on non-2xx (e.g. 400 for an invalid transition, 404 for an unknown
// target).
//
// Note: the server exposes no `GET /api/entitlement` route. Entitlement STATE is
// read via the modules / templates list responses (each embeds the current
// `entitlement`), so this repository intentionally has no `get` — adding one
// would fabricate a nonexistent endpoint.
import { request } from "../http";
import {
  adaptSetEntitlementRequest,
  adaptSetEntitlementResponse,
  type SetEntitlementInput,
  type SetEntitlementResultModel,
} from "../adapters/entitlement.adapter";

export class EntitlementApiRepository {
  async set(input: SetEntitlementInput): Promise<SetEntitlementResultModel> {
    const body = adaptSetEntitlementRequest(input);
    const json = await request("/api/entitlement", { method: "POST", body });
    return adaptSetEntitlementResponse(json);
  }
}
