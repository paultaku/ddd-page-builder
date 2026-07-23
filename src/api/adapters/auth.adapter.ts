// Adapters for the Auth API.
//
// REQUEST adapter builds + validates the login body before the network call;
// RESPONSE adapter parses the raw JSON against the response schema and returns
// the client model (a server contract breach surfaces as a zod error).
import { z } from "zod";
import {
  UserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
} from "../schemas/auth.schema";
import type { AuthMethod } from "../schemas/auth.schema";

// Client model returned to callers.
export type UserModel = z.infer<typeof UserSchema>;

// UseCase-facing input for a login. `email`/`password` accompany the "email"
// method; OAuth methods carry only the method.
export interface LoginInput {
  method: AuthMethod;
  email?: string;
  password?: string;
}

// ---- Request adapter ------------------------------------------------------

// POST /api/auth/login — build + validate the body.
export function adaptLoginRequest(input: LoginInput) {
  return LoginRequestSchema.parse({
    method: input.method,
    email: input.email,
    password: input.password,
  });
}

// ---- Response adapter -----------------------------------------------------

export function adaptLoginResponse(json: unknown): UserModel {
  return LoginResponseSchema.parse(json).user;
}
