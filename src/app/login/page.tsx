"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import type { AuthMethod } from "@/domain/auth/User";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const doLogin = async (
    method: AuthMethod,
    payload?: { email: string; password: string }
  ) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.user);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">
          Mock authentication — no real accounts.
        </p>

        <div className="space-y-2">
          <button
            onClick={() => doLogin("github")}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>
          <button
            onClick={() => doLogin("google")}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <span className="font-bold text-blue-600">G</span>
            Continue with Google
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          or
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            doLogin("email", { email, password });
          }}
          className="space-y-3"
        >
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
          >
            Sign in with email
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="mt-6 rounded-md bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">
          Demo login — email:{" "}
          <span className="font-mono text-gray-700">demo@example.com</span> /
          password:{" "}
          <span className="font-mono text-gray-700">password123</span>
        </p>
      </div>
    </main>
  );
}
