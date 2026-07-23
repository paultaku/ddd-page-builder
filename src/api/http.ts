// Shared client-side transport for the API layer.
//
// Every repository call funnels through `request()`: it prefixes a base URL,
// serializes JSON bodies, tolerates empty responses, and turns any non-2xx into
// a typed `ApiError` that carries the parsed error payload. Response *shape*
// validation is intentionally NOT done here — that is the response adapter's job
// (zod). This keeps the transport dumb and the contract enforcement in one place.

export interface RequestOptions {
  method?: string;
  // Plain JSON-serializable body. When present, Content-Type is set to JSON.
  body?: unknown;
  // Overrides the base URL for this call. Defaults to the resolved base (browser
  // relative "" or the `API_BASE_URL` env for the Node contract-proof script).
  baseUrl?: string;
}

// Thrown on any non-2xx response. `status` is the HTTP status; `payload` is the
// parsed JSON error body (or raw text when the body was not JSON), so callers —
// e.g. the publish 403 handler — can recover `blockedModules`/`blockedTemplate`.
export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    super(ApiError.messageFrom(status, payload));
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    // Restore prototype chain for `instanceof` across transpile targets.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  private static messageFrom(status: number, payload: unknown): string {
    if (
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
    ) {
      return (payload as { error: string }).error;
    }
    if (typeof payload === "string" && payload.trim()) return payload;
    return `Request failed with status ${status}`;
  }
}

// Resolve the base URL: explicit override wins, then an optional `API_BASE_URL`
// env (used only by the Node proof script / future SSR), else "" (browser
// relative). Guarded so it is safe in both the browser and Node.
function resolveBaseUrl(explicit?: string): string {
  if (explicit !== undefined) return explicit;
  if (
    typeof process !== "undefined" &&
    process.env &&
    typeof process.env.API_BASE_URL === "string" &&
    process.env.API_BASE_URL.length > 0
  ) {
    return process.env.API_BASE_URL;
  }
  return "";
}

// Perform a request and return the raw parsed JSON (unknown). The adapter layer
// validates the shape. Throws `ApiError` on non-2xx.
export async function request(
  path: string,
  options: RequestOptions = {}
): Promise<unknown> {
  const { method = "GET", body, baseUrl } = options;
  const url = `${resolveBaseUrl(baseUrl)}${path}`;

  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  // Tolerate empty bodies (e.g. 204). Prefer JSON; fall back to raw text.
  const raw = await res.text();
  let parsed: unknown = undefined;
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, parsed);
  }

  return parsed;
}
