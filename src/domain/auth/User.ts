// Auth (mock). A User is an authenticated account; auth is a prototype backed by
// mock data — no real OAuth or password hashing. Content ownership still uses
// ANONYMOUS_OWNER_ID (wiring ownerId to the user is deliberately out of scope).
export type AuthMethod = "github" | "google" | "email";

export interface User {
  id: string;
  name: string;
  email: string;
  provider: AuthMethod;
  avatarUrl?: string;
}
