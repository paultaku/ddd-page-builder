// User settings (mock, client-side). Persisted in localStorage alongside the
// mock session. No server component — matches the auth design.
export interface UserSettings {
  displayName: string;
  emailNotifications: boolean;
  productUpdates: boolean;
}

const STORAGE_KEY = "userSettings";

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: "",
  emailNotifications: true,
  productUpdates: false,
};

export function readSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<UserSettings>) }
      : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
