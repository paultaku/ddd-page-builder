"use client";

import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/i18n/use-i18n";

// Compact auth state for the footer: a Sign in link when logged out, or the
// user's name + Sign out when logged in.
export function AuthWidget() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login" className="transition-colors hover:text-gray-800">
        {t("nav.signIn")}
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="text-gray-700 transition-colors hover:text-gray-900 hover:underline"
      >
        {user.name}
      </Link>
      <button
        onClick={logout}
        className="text-gray-400 transition-colors hover:text-gray-800"
      >
        {t("nav.signOut")}
      </button>
    </span>
  );
}
