"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/use-auth";

// Logged-in view. Client-side guard (session is client-side): redirects to
// /login when there is no user.
export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading…
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your account</h1>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="font-medium text-gray-800">{user.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-800">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Signed in with</dt>
            <dd className="font-medium capitalize text-gray-800">
              {user.provider}
            </dd>
          </div>
        </dl>
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="mt-6 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
