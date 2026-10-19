/**
 * Runtime configuration. All env access lives here.
 *
 * Fixture mode is ONLY active when VITE_USE_DEV_FIXTURES=true AND
 * (the app runs in Vite development OR VITE_ENABLE_DEMO=true is set explicitly).
 * Anything else → live API mode (the default).
 */
const env = import.meta.env;

export const API_BASE_URL: string =
  (env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8000";

const wantsFixtures = env["VITE_USE_DEV_FIXTURES"] === "true";
const demoAllowed = env.DEV === true || env["VITE_ENABLE_DEMO"] === "true";

export const USE_FIXTURES: boolean = wantsFixtures && demoAllowed;

/** "token": DRF TokenAuthentication header. "session": Django session cookie + CSRF. */
export type AuthStrategy = "token" | "session";
export const AUTH_STRATEGY: AuthStrategy =
  env["VITE_AUTH_STRATEGY"] === "session" ? "session" : "token";

export const PAGE_SIZE = 8;
export const REQUEST_TIMEOUT_MS = 15000;
