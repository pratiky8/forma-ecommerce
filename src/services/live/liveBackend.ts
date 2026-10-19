import type { Backend } from "../backend";
import { endpoints as ep } from "../endpoints";
import { AUTH_STRATEGY } from "../config";
import { ApiError, http, normalizePage, tokenStore } from "../http";
import { toCart, toCategory, toOrder, toProduct, toUser } from "./normalize";
import type { ProductQuery } from "@/types";

function queryParams(q: ProductQuery) {
  const p: { [k: string]: string | number } = {};
  if (q.search) p["search"] = q.search;
  if (q.category) p["category"] = q.category;
  if (q.min_price != null) p["min_price"] = q.min_price;
  if (q.max_price != null) p["max_price"] = q.max_price;
  if (q.ordering) p["ordering"] = q.ordering;
  if (q.page && q.page > 1) p["page"] = q.page;
  return p;
}

async function ensureCsrf() {
  if (AUTH_STRATEGY === "session") await http.get(ep.csrf);
}

/** Login/register responses: {token, user} (token strategy) or {user} / user (session). */
function handleAuthResponse(data: unknown) {
  const d = (data ?? {}) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (AUTH_STRATEGY === "token") {
    const token = typeof d.token === "string" ? d.token : typeof d.key === "string" ? d.key : null;
    if (!token) throw new ApiError("Login response did not include a token.");
    tokenStore.set(token);
  }
  return toUser(d.user ?? d);
}

/** Live Django adapter — the only adapter used outside explicit fixture mode. */
export const liveBackend: Backend = {
  mode: "live",
  products: {
    async list(q) {
      const { data } = await http.get(ep.products, { params: queryParams(q) });
      return normalizePage(data, toProduct);
    },
    async get(id) {
      const { data } = await http.get(ep.product(id));
      return toProduct(data);
    },
    async featured() {
      const { data } = await http.get(ep.products, { params: { is_featured: "true" } });
      return normalizePage(data, toProduct).results.slice(0, 4);
    },
    async trending() {
      const { data } = await http.get(ep.products, { params: { is_trending: "true" } });
      return normalizePage(data, toProduct).results.slice(0, 4);
    },
  },
  categories: {
    async list() {
      const { data } = await http.get(ep.categories);
      return normalizePage(data, toCategory).results;
    },
  },
  auth: {
    async login(c) {
      await ensureCsrf();
      const { data } = await http.post(ep.login, c);
      return handleAuthResponse(data);
    },
    async register(r) {
      await ensureCsrf();
      const { data } = await http.post(ep.register, r);
      return handleAuthResponse(data);
    },
    async logout() {
      try {
        await http.post(ep.logout);
      } finally {
        tokenStore.set(null);
      }
    },
    async me() {
      if (AUTH_STRATEGY === "token" && !tokenStore.get()) return null;
      try {
        const { data } = await http.get(ep.me);
        return toUser(data);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
        throw e;
      }
    },
    async updateMe(patch) {
      const { data } = await http.patch(ep.me, patch);
      return toUser(data);
    },
  },
  cart: {
    async get() {
      const { data } = await http.get(ep.cart);
      return toCart(data);
    },
    async add(product_id, quantity) {
      const { data } = await http.post(ep.cartItems, { product_id, quantity });
      return toCart(data);
    },
    async update(itemId, quantity) {
      const { data } = await http.patch(ep.cartItem(itemId), { quantity });
      return toCart(data);
    },
    async remove(itemId) {
      const { data } = await http.delete(ep.cartItem(itemId));
      // Contract: returns updated cart; tolerate 204 by refetching.
      if (!data) return toCart((await http.get(ep.cart)).data);
      return toCart(data);
    },
  },
  orders: {
    async list() {
      const { data } = await http.get(ep.orders);
      return normalizePage(data, toOrder).results;
    },
    async get(id) {
      const { data } = await http.get(ep.order(id));
      return toOrder(data);
    },
    async create(p) {
      const { data } = await http.post(ep.orders, p, {
        headers: { "Idempotency-Key": p.client_reference },
      });
      const order = toOrder(data);
      if (!order.id || typeof data?.number !== "string" || !data.number.trim())
        throw new ApiError("The server response did not confirm an order.");
      return order;
    },
  },
  admin: {
    async listProducts() {
      const { data } = await http.get(ep.adminProducts);
      return normalizePage(data, toProduct).results;
    },
    async createProduct(p) {
      return toProduct((await http.post(ep.adminProducts, p)).data);
    },
    async updateProduct(id, p) {
      return toProduct((await http.patch(ep.adminProduct(id), p)).data);
    },
    async deleteProduct(id) {
      await http.delete(ep.adminProduct(id));
    },
    async createCategory(c) {
      return toCategory((await http.post(ep.adminCategories, c)).data);
    },
    async updateCategory(id, c) {
      return toCategory((await http.patch(ep.adminCategory(id), c)).data);
    },
    async deleteCategory(id) {
      await http.delete(ep.adminCategory(id));
    },
    async listOrders() {
      const { data } = await http.get(ep.adminOrders);
      return normalizePage(data, toOrder).results;
    },
    async updateOrderStatus(id, status) {
      return toOrder((await http.patch(ep.adminOrder(id), { status })).data);
    },
  },
};
