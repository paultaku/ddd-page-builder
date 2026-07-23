// Transport-owning repository for the Auth API. `login` encapsulates the single
// `POST /api/auth/login` endpoint: build the body via the request adapter,
// perform the call, then map the response. `http.request` throws `ApiError` on
// non-2xx (400 unsupported method, 401 invalid credentials), so the UI can
// surface the server's error message.
import { request } from "../http";
import {
  adaptLoginRequest,
  adaptLoginResponse,
  type LoginInput,
  type UserModel,
} from "../adapters/auth.adapter";

export class AuthApiRepository {
  async login(input: LoginInput): Promise<UserModel> {
    const body = adaptLoginRequest(input);
    const json = await request("/api/auth/login", { method: "POST", body });
    return adaptLoginResponse(json);
  }
}
