"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@/domain/auth/User";

// Client-side session (per chosen design): the logged-in User lives in
// localStorage. A window event keeps every useAuth() consumer in sync without a
// context provider.
const STORAGE_KEY = "authUser";
const AUTH_EVENT = "auth-changed";

export function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStoredUser());
    setLoading(false);
    const sync = () => setUser(readStoredUser());
    window.addEventListener(AUTH_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUTH_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const login = useCallback((u: User) => writeStoredUser(u), []);
  const logout = useCallback(() => writeStoredUser(null), []);

  return { user, loading, login, logout };
}
