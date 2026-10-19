import { beforeEach, describe, expect, it, vi } from "vitest";
import { queryProducts } from "@/fixtures/query";
import { fixtureProducts } from "@/fixtures/data";
import { fixtureBackend } from "@/fixtures/fixtureBackend";
import {
  ApiError,
  BackendRequiredError,
  http,
  normalizePage,
  parseDrfError,
  toApiError,
} from "@/services/http";
import { liveBackend } from "@/services/live/liveBackend";
import { formatINR } from "@/lib/format";

describe("fixture catalogue queries", () => {
  it("searches name and description", () => {
    const r = queryProducts(fixtureProducts, { search: "mug" });
    expect(r.results.map((p) => p.name)).toEqual(["Stoneware Mug"]);
  });
  it("filters by category and price range", () => {
    const r = queryProducts(fixtureProducts, {
      category: "tech",
      min_price: 3000,
      max_price: 8000,
    });
    expect(r.results.map((p) => p.id).sort()).toEqual([4, 5]);
  });
  it("sorts by price descending", () => {
    const r = queryProducts(fixtureProducts, { ordering: "-price" }, 100);
    expect(r.results[0]?.name).toBe("Field Watch");
  });
  it("paginates 8 per page with DRF-style next/previous", () => {
    const p1 = queryProducts(fixtureProducts, {});
    const p2 = queryProducts(fixtureProducts, { page: 2 });
    expect(p1.count).toBe(12);
    expect(p1.results).toHaveLength(8);
    expect(p1.next).not.toBeNull();
    expect(p2.results).toHaveLength(4);
    expect(p2.next).toBeNull();
    expect(p2.previous).not.toBeNull();
  });
});

describe("fixture cart", () => {
  beforeEach(() => window.localStorage.clear());
  it("ignores malformed stored lines instead of breaking the cart", async () => {
    window.localStorage.setItem(
      "forma.demo.cart",
      JSON.stringify([null, {}, { id: 1, product_id: 1, quantity: -1 }]),
    );
    expect((await fixtureBackend.cart.get()).items).toEqual([]);
  });
  it("adds, updates and removes lines with recomputed estimated totals", async () => {
    let cart = await fixtureBackend.cart.add(1, 2);
    expect(cart.total).toBe(1780 + 99);
    expect(cart.totals_are_estimates).toBe(true);
    const id = cart.items[0]!.id;
    cart = await fixtureBackend.cart.update(id, 3);
    expect(cart.subtotal).toBe(2670);
    expect(cart.shipping).toBe(0);
    cart = await fixtureBackend.cart.remove(id);
    expect(cart.items).toHaveLength(0);
  });
  it("rejects quantities above stock and out-of-stock items", async () => {
    await expect(fixtureBackend.cart.add(6, 4)).rejects.toThrow(/Only 3/);
    await expect(fixtureBackend.cart.add(3, 1)).rejects.toThrow(/out of stock/);
  });
  it("rejects invalid increments even when the resulting quantity would be valid", async () => {
    await fixtureBackend.cart.add(1, 3);
    for (const quantity of [-1, 0, 1.5, NaN, Infinity]) {
      await expect(fixtureBackend.cart.add(1, quantity)).rejects.toMatchObject({ status: 400 });
    }
    expect((await fixtureBackend.cart.get()).items[0]?.quantity).toBe(3);
  });
});

describe("fixture checkout", () => {
  it("refuses to create orders", async () => {
    const p = fixtureBackend.orders.create({
      client_reference: "x",
      payment_method: "cod",
      shipping_address: {
        full_name: "a",
        phone: "1",
        line1: "l",
        city: "c",
        state: "s",
        postal_code: "111111",
        country: "IN",
      },
    });
    await expect(p).rejects.toBeInstanceOf(BackendRequiredError);
  });
  it("labels every sample order as an example", async () => {
    window.sessionStorage.clear();
    await fixtureBackend.auth.startDemo!(false);
    const orders = await fixtureBackend.orders.list();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.every((o) => o.is_example)).toBe(true);
  });
  it("blocks admin calls without a demo staff session", async () => {
    window.sessionStorage.clear();
    await fixtureBackend.auth.startDemo!(false);
    await expect(fixtureBackend.admin.listProducts()).rejects.toMatchObject({ status: 403 });
  });
});

describe("fixture category edits", () => {
  it("updates product category names and slugs alongside the category", async () => {
    window.sessionStorage.clear();
    await fixtureBackend.auth.startDemo!(true);
    const original = { ...(await fixtureBackend.categories.list())[0]! };
    try {
      await fixtureBackend.admin.updateCategory(original.id, { name: "Renamed", slug: "renamed" });
      const page = await fixtureBackend.products.list({ category: "renamed" });
      expect(page.count).toBeGreaterThan(0);
      expect(page.results.every((p) => p.category?.name === "Renamed")).toBe(true);
      expect((await fixtureBackend.products.list({ category: original.slug })).count).toBe(0);
    } finally {
      await fixtureBackend.admin.updateCategory(original.id, original);
      window.sessionStorage.clear();
    }
  });
});

describe("API normalization", () => {
  it("accepts DRF pages and plain lists", () => {
    expect(normalizePage([1, 2], (x) => x).count).toBe(2);
    const page = normalizePage({ count: 30, next: "n", previous: null, results: [1] }, (x) => x);
    expect(page.count).toBe(30);
    expect(page.next).toBe("n");
  });
  it("parses DRF detail and field errors", () => {
    expect(parseDrfError({ detail: "Nope" }, 403).message).toBe("Nope");
    const r = parseDrfError({ email: ["Taken."] }, 400);
    expect(r.fieldErrors["email"]).toEqual(["Taken."]);
  });
  it("formats INR with en-IN grouping", () => {
    expect(formatINR(123456)).toBe("₹1,23,456");
  });
});

describe("live API failure handling", () => {
  it("does not accept a missing order number as a confirmed order", async () => {
    const request = vi.spyOn(http, "post").mockResolvedValue({ data: { id: 42 } });
    try {
      await expect(
        liveBackend.orders.create({
          client_reference: "test",
          payment_method: "cod",
          shipping_address: {
            full_name: "A",
            phone: "1234567890",
            line1: "Street",
            city: "City",
            state: "State",
            postal_code: "123456",
            country: "IN",
          },
        }),
      ).rejects.toThrow("did not confirm an order");
    } finally {
      request.mockRestore();
    }
  });
  it("surfaces an unreachable server as a network ApiError (no fixture fallback)", async () => {
    const original = http.defaults.baseURL;
    try {
      http.defaults.baseURL = "http://127.0.0.1:9";
      const err = await liveBackend.products.list({}).catch((e) => e);
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).kind).toBe("network");
    } finally {
      if (original === undefined) delete http.defaults.baseURL;
      else http.defaults.baseURL = original;
    }
  });
  it("maps a 500 to a retryable message", () => {
    const e = toApiError(
      Object.assign(new Error("x"), { isAxiosError: true, response: { status: 500, data: {} } }),
    );
    expect(e.status).toBe(500);
    expect(e.message).toMatch(/server had a problem/);
  });
});
