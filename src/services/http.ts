import axios, { AxiosError, type AxiosInstance } from "axios";
import { API_BASE_URL, AUTH_STRATEGY, REQUEST_TIMEOUT_MS } from "./config";
import type { Paginated } from "@/types";

/** Normalized error surfaced to every screen. */
export class ApiError extends Error {
  status: number | null;
  fieldErrors: Record<string, string[]>;
  kind: "network" | "http" | "unsupported";
  constructor(
    message: string,
    opts: {
      status?: number | null;
      fieldErrors?: Record<string, string[]>;
      kind?: ApiError["kind"];
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status ?? null;
    this.fieldErrors = opts.fieldErrors ?? {};
    this.kind = opts.kind ?? "http";
  }
}

/** Thrown in fixture mode for operations that need the real Django backend. */
export class BackendRequiredError extends ApiError {
  constructor(message: string) {
    super(message, { kind: "unsupported" });
    this.name = "BackendRequiredError";
  }
}

/* ---------- token storage (token strategy only) ----------
 * Kept in memory and mirrored to sessionStorage so a reload keeps the session
 * for this tab only. sessionStorage is readable by any script on the origin (XSS risk);
 * prefer the "session" strategy (HttpOnly cookie) in production. Passwords are never stored. */
const TOKEN_KEY = "forma.auth.token";
let memoryToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    if (typeof window === "undefined") return null;
    memoryToken = window.sessionStorage.getItem(TOKEN_KEY);
    return memoryToken;
  },
  set(token: string | null) {
    memoryToken = token;
    if (typeof window === "undefined") return;
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  },
};

let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1] ?? "") : null;
}

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: AUTH_STRATEGY === "session",
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  if (AUTH_STRATEGY === "token") {
    const t = tokenStore.get();
    if (t) config.headers.set("Authorization", `Token ${t}`);
  } else {
    const method = (config.method ?? "get").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const csrf = readCookie("csrftoken");
      if (csrf) config.headers.set("X-CSRFToken", csrf);
    }
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    throw toApiError(err);
  },
);

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return new ApiError(
        err.code === "ECONNABORTED"
          ? "The server took too long to respond."
          : "Can't reach the store server. Check your connection or that the API is running.",
        { kind: "network" },
      );
    }
    const status = err.response.status;
    if (status === 401) {
      tokenStore.set(null);
      unauthorizedHandler?.();
    }
    const data = err.response.data as unknown;
    const { message, fieldErrors } = parseDrfError(data, status);
    return new ApiError(message, { status, fieldErrors });
  }
  return new ApiError(err instanceof Error ? err.message : "Unexpected error");
}

/** DRF errors: {"detail": "..."} or {"field": ["msg"]} or {"non_field_errors": [...]} */
export function parseDrfError(data: unknown, status: number) {
  const fieldErrors: Record<string, string[]> = {};
  let message = defaultMessage(status);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    if (typeof obj["detail"] === "string") message = obj["detail"];
    for (const [k, v] of Object.entries(obj)) {
      if (k === "detail") continue;
      const arr = Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : [];
      if (arr.length) fieldErrors[k] = arr;
    }
    if (fieldErrors["non_field_errors"]?.length)
      message = fieldErrors["non_field_errors"][0] ?? message;
    else if (typeof obj["detail"] !== "string" && Object.keys(fieldErrors).length)
      message = "Please correct the highlighted fields.";
  }
  return { message, fieldErrors };
}

function defaultMessage(status: number) {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found.";
  if (status === 409) return "This conflicts with the current state. Please refresh.";
  if (status >= 500) return "The server had a problem. Please try again.";
  return "Request failed.";
}

/** Accept DRF page objects or plain lists. */
export function normalizePage<T>(data: unknown, map: (raw: unknown) => T): Paginated<T> {
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data.map(map) };
  }
  const d = (data ?? {}) as Partial<Paginated<unknown>>;
  const results = Array.isArray(d.results) ? d.results.map(map) : [];
  return {
    count: typeof d.count === "number" ? d.count : results.length,
    next: d.next ?? null,
    previous: d.previous ?? null,
    results,
  };
}

/** DRF serializes DecimalField as string — coerce safely. */
export function num(v: unknown, fallback = 0): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}
