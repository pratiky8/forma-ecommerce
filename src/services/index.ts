/**
 * Public service API used by every screen. Exactly one adapter is chosen at build time.
 * In live mode the fixture adapter is never consulted — no silent fallback on errors.
 */
import type { Backend } from "./backend";
import { USE_FIXTURES } from "./config";
import { liveBackend } from "./live/liveBackend";
import { fixtureBackend } from "@/fixtures/fixtureBackend";

export const backend: Backend = USE_FIXTURES ? fixtureBackend : liveBackend;

export const productService = backend.products;
export const categoryService = backend.categories;
export const authService = backend.auth;
export const cartService = backend.cart;
export const orderService = backend.orders;
export const adminService = backend.admin;
export const isFixtureMode = backend.mode === "fixture";

export { ApiError, BackendRequiredError } from "./http";
