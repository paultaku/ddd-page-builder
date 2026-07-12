import { NextRequest, NextResponse } from "next/server";
import type { AuthMethod } from "@/domain/auth/User";
import { authenticate } from "@/infrastructure/auth/mockUsers";

export const runtime = "nodejs";

interface LoginPayload {
  method?: AuthMethod;
  email?: string;
  password?: string;
}

const METHODS: AuthMethod[] = ["github", "google", "email"];

// Mock login. Validates against seeded mock accounts and returns the User.
// Session persistence is client-side (localStorage) per the chosen design, so
// this endpoint only authenticates — it sets no cookie.
export async function POST(request: NextRequest) {
  try {
    const body: LoginPayload = await request.json();
    if (!body.method || !METHODS.includes(body.method)) {
      return NextResponse.json(
        { error: "Unsupported login method" },
        { status: 400 }
      );
    }

    const user = authenticate(body.method, body.email, body.password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
