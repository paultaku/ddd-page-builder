"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";

// Compact auth state for the footer: a Sign in link when logged out, or the
// user's name + Sign out when logged in.
export function AuthWidget() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login" className="transition-colors hover:text-gray-800">
        Sign in
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-gray-700">{user.name}</span>
      <button
        onClick={logout}
        className="text-gray-400 transition-colors hover:text-gray-800"
      >
        Sign out
      </button>
    </span>
  );
}
