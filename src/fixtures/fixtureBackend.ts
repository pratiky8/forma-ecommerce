/**
 * DEVELOPMENT FIXTURE ADAPTER. Selected only when USE_FIXTURES is true (see services/config).
 * - Catalogue reads are served from local data.
 * - Cart persists in localStorage with browser-ESTIMATED totals (flagged).
 * - Auth is a transient, labeled demo session (no password is read or stored).
 * - Orders: only labeled example rows; creating an order is refused (Django required).
 * - Admin edits mutate in-memory data for this tab only.
 */
import type { Backend } from "@/services/backend";
import { ApiError, BackendRequiredError } from "@/services/http";
import type { Cart, Category, Product, User } from "@/types";
import { exampleOrders, fixtureCategories, fixtureProducts } from "./data";
import { queryProducts } from "./query";

let products: Product[] = fixtureProducts.map((p) => ({ ...p }));
let categories: Category[] = fixtureCategories.map((c) => ({ ...c }));

const CART_KEY = "forma.demo.cart";
const DEMO_USER_KEY = "forma.demo.session";
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

type StoredLine = { id: number; product_id: number; quantity: number };

function readLines(): StoredLine[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]");
    return Array.isArray(v)
      ? v.filter(
          (line): line is StoredLine =>
            line !== null &&
            typeof line === "object" &&
            Number.isSafeInteger(line.id) &&
            Number.isSafeInteger(line.product_id) &&
            Number.isSafeInteger(line.quantity) &&
            line.quantity > 0,
        )
      : [];
  } catch {
    return [];
  }
}
function writeLines(lines: StoredLine[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

export function estimateShipping(subtotal: number) {
  return subtotal === 0 || subtotal >= 2500 ? 0 : 99;
}

function buildCart(): Cart {
  const items = readLines()
    .map((l) => {
      const product = products.find((p) => p.id === l.product_id);
      if (!product) return null;
      return {
        id: l.id,
        product,
        quantity: l.quantity,
        unit_price: product.price,
        line_total: product.price * l.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const subtotal = items.reduce((s, i) => s + i.line_total, 0);
  const shipping = estimateShipping(subtotal);
  return {
    id: "demo",
    items,
    item_count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shipping,
    tax: 0,
    total: subtotal + shipping,
    totals_are_estimates: true,
  };
}

function checkStock(productId: number, qty: number) {
  const p = products.find((x) => x.id === productId);
  if (!p) throw new ApiError("Product not found.", { status: 404 });
  if (!Number.isSafeInteger(qty) || qty < 1)
    throw new ApiError("Quantity must be a positive whole number.", {
      status: 400,
      fieldErrors: { quantity: ["Must be a positive whole number."] },
    });
  if (qty > p.stock)
    throw new ApiError(
      p.stock === 0 ? `${p.name} is out of stock.` : `Only ${p.stock} of ${p.name} available.`,
      {
        status: 400,
        fieldErrors: { quantity: [`Max ${p.stock}.`] },
      },
    );
}

function readDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(DEMO_USER_KEY) ?? "null");
  } catch {
    return null;
  }
}
function demoUser(
  email: string,
  staff: boolean,
  first = "Demo",
  last = staff ? "Staff" : "Shopper",
): User {
  const u: User = {
    id: "demo",
    email,
    first_name: first,
    last_name: last,
    is_staff: staff,
    is_demo: true,
  };
  window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(u));
  return u;
}
function requireDemoStaff() {
  if (!readDemoUser()?.is_staff) throw new ApiError("Staff permission required.", { status: 403 });
}

const DJANGO_REQUIRED =
  "Order placement needs the Django backend. Demo mode does not create orders or take payments.";

export const fixtureBackend: Backend = {
  mode: "fixture",
  products: {
    async list(q) {
      await delay();
      return queryProducts(products, q);
    },
    async get(id) {
      await delay(150);
      const p = products.find((x) => String(x.id) === String(id) && x.is_active);
      if (!p) throw new ApiError("Product not found.", { status: 404 });
      return p;
    },
    async featured() {
      await delay();
      return products.filter((p) => p.is_featured && p.is_active).slice(0, 4);
    },
    async trending() {
      await delay();
      return products.filter((p) => p.is_trending && p.is_active).slice(0, 4);
    },
  },
  categories: {
    async list() {
      await delay(120);
      return categories;
    },
  },
  auth: {
    async login({ email }) {
      await delay();
      return demoUser(email || "demo@forma.invalid", false);
    },
    async register({ email, first_name, last_name }) {
      await delay();
      return demoUser(
        email || "demo@forma.invalid",
        false,
        first_name || "Demo",
        last_name || "Shopper",
      );
    },
    async startDemo(asStaff) {
      await delay(100);
      return demoUser(asStaff ? "staff@demo.invalid" : "shopper@demo.invalid", asStaff);
    },
    async logout() {
      window.sessionStorage.removeItem(DEMO_USER_KEY);
    },
    async me() {
      return readDemoUser();
    },
    async updateMe(patch) {
      const u = readDemoUser();
      if (!u) throw new ApiError("Not signed in.", { status: 401 });
      const next = { ...u, ...patch };
      window.sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(next));
      return next;
    },
  },
  cart: {
    async get() {
      return buildCart();
    },
    async add(productId, quantity) {
      await delay(150);
      checkStock(productId, quantity);
      const lines = readLines();
      const existing = lines.find((l) => l.product_id === productId);
      const nextQty = (existing?.quantity ?? 0) + quantity;
      checkStock(productId, nextQty);
      if (existing) existing.quantity = nextQty;
      else lines.push({ id: Date.now(), product_id: productId, quantity });
      writeLines(lines);
      return buildCart();
    },
    async update(itemId, quantity) {
      await delay(120);
      const lines = readLines();
      const line = lines.find((l) => l.id === itemId);
      if (!line) throw new ApiError("Cart item not found.", { status: 404 });
      checkStock(line.product_id, quantity);
      line.quantity = quantity;
      writeLines(lines);
      return buildCart();
    },
    async remove(itemId) {
      await delay(120);
      writeLines(readLines().filter((l) => l.id !== itemId));
      return buildCart();
    },
  },
  orders: {
    async list() {
      await delay();
      return readDemoUser() ? exampleOrders : [];
    },
    async get(id) {
      await delay();
      const o = exampleOrders.find((x) => String(x.id) === String(id));
      if (!o) throw new ApiError("Order not found.", { status: 404 });
      return o;
    },
    async create() {
      await delay(300);
      throw new BackendRequiredError(DJANGO_REQUIRED);
    },
  },
  admin: {
    async listProducts() {
      requireDemoStaff();
      await delay();
      return products;
    },
    async createProduct(input) {
      requireDemoStaff();
      const cat = categories.find((c) => c.id === input.category_id) ?? null;
      const p: Product = {
        id: Math.max(0, ...products.map((x) => x.id)) + 1,
        slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        ...input,
        category: cat,
      };
      products = [...products, p];
      return p;
    },
    async updateProduct(id, patch) {
      requireDemoStaff();
      const idx = products.findIndex((x) => x.id === id);
      if (idx < 0) throw new ApiError("Not found.", { status: 404 });
      const { category_id, ...rest } = patch;
      const next = { ...products[idx], ...rest } as Product;
      if (category_id !== undefined)
        next.category = categories.find((c) => c.id === category_id) ?? null;
      products = products.map((x, i) => (i === idx ? next : x));
      return next;
    },
    async deleteProduct(id) {
      requireDemoStaff();
      products = products.filter((x) => x.id !== id);
    },
    async createCategory(input) {
      requireDemoStaff();
      const cat = { id: Math.max(0, ...categories.map((c) => c.id)) + 1, ...input };
      categories = [...categories, cat];
      return cat;
    },
    async updateCategory(id, patch) {
      requireDemoStaff();
      const current = categories.find((c) => c.id === id);
      if (!current) throw new ApiError("Category not found.", { status: 404 });
      const updated = { ...current, ...patch };
      categories = categories.map((c) => (c.id === id ? updated : c));
      products = products.map((p) => (p.category?.id === id ? { ...p, category: updated } : p));
      return updated;
    },
    async deleteCategory(id) {
      requireDemoStaff();
      if (products.some((p) => p.category?.id === id))
        throw new ApiError("Category still has products. Reassign them first.", { status: 409 });
      categories = categories.filter((c) => c.id !== id);
    },
    async listOrders() {
      requireDemoStaff();
      await delay();
      return exampleOrders;
    },
    async updateOrderStatus() {
      requireDemoStaff();
      throw new BackendRequiredError(
        "Example orders can't be changed. Order status updates need the Django backend.",
      );
    },
  },
};
