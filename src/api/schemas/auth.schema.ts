// Zod contract for the Auth API (src/app/api/auth/login/route.ts).
//
// Single source of truth for the login request/response shape; mirrors the
// server route handler verbatim. Client model TYPES are derived via `z.infer`.
//
// Wire facts mirrored from the route:
// - POST /api/auth/login -> { user: User }
//   400 for an unsupported method; 401 for invalid credentials (via ApiError).
//
// Session persistence is client-side (localStorage); this endpoint only
// authenticates and sets no cookie.
import { z } from "zod";

export const AuthMethodSchema = z.enum(["github", "google", "email"]);
export type AuthMethod = z.infer<typeof AuthMethodSchema>;

// An authenticated account (domain/auth/User.ts). `avatarUrl` is optional.
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  provider: AuthMethodSchema,
  avatarUrl: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

// POST /api/auth/login — `method` is required; `email`/`password` accompany the
// "email" method. The server validates against seeded mock accounts.
export const LoginRequestSchema = z.object({
  method: AuthMethodSchema,
  email: z.string().optional(),
  password: z.string().optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
