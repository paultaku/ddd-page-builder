import type { AuthMethod, User } from "@/domain/auth/User";

// Mock accounts. Passwords are stored in plaintext ON PURPOSE — this is a
// prototype backed by mock data, kept server-side (never shipped to the client
// bundle). Do not model real auth on this.
interface EmailAccount {
  email: string;
  password: string;
  user: User;
}

const EMAIL_ACCOUNTS: EmailAccount[] = [
  {
    email: "demo@example.com",
    password: "password123",
    user: {
      id: "u-email-1",
      name: "Demo User",
      email: "demo@example.com",
      provider: "email",
    },
  },
];

// OAuth providers are mocked: "logging in" returns a canned account instantly.
const OAUTH_USERS: Record<Exclude<AuthMethod, "email">, User> = {
  github: {
    id: "u-github-1",
    name: "Octo Cat",
    email: "octocat@github.com",
    provider: "github",
  },
  google: {
    id: "u-google-1",
    name: "Google User",
    email: "guser@gmail.com",
    provider: "google",
  },
};

// Public demo hint (safe to show): the email credentials the login page suggests.
export const DEMO_EMAIL = EMAIL_ACCOUNTS[0].email;
export const DEMO_PASSWORD = EMAIL_ACCOUNTS[0].password;

// Resolve a User for a login attempt, or null if it fails.
export function authenticate(
  method: AuthMethod,
  email?: string,
  password?: string
): User | null {
  if (method === "github" || method === "google") {
    return OAUTH_USERS[method];
  }
  if (method === "email") {
    const account = EMAIL_ACCOUNTS.find(
      (a) => a.email === email?.trim().toLowerCase() && a.password === password
    );
    return account ? account.user : null;
  }
  return null;
}
