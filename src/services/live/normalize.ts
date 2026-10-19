import type { Cart, CartItem, Category, Order, OrderItem, Product, User } from "@/types";
import { num } from "../http";
import { API_BASE_URL } from "../config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = any;
const o = (v: unknown): R => (v && typeof v === "object" ? (v as R) : {});

function absUrl(u: unknown): string | null {
  if (typeof u !== "string" || !u) return null;
  if (/^https?:\/\//.test(u)) return u;
  return API_BASE_URL.replace(/\/$/, "") + (u.startsWith("/") ? u : `/${u}`);
}

export function toCategory(raw: unknown): Category {
  const r = o(raw);
  return {
    id: num(r.id),
    name: String(r.name ?? ""),
    slug: String(r.slug ?? r.id ?? ""),
    description: typeof r.description === "string" ? r.description : undefined,
  };
}

export function toProduct(raw: unknown): Product {
  const r = o(raw);
  const imgs: string[] = [];
  if (Array.isArray(r.images)) {
    for (const i of r.images) {
      const u = absUrl(typeof i === "string" ? i : (o(i).image ?? o(i).url));
      if (u) imgs.push(u);
    }
  }
  const single = absUrl(r.image);
  if (single && !imgs.length) imgs.push(single);
  const cat = r.category;
  return {
    id: num(r.id),
    name: String(r.name ?? ""),
    slug: String(r.slug ?? r.id ?? ""),
    description: String(r.description ?? ""),
    price: num(r.price),
    category: cat && typeof cat === "object" ? toCategory(cat) : null,
    stock: num(r.stock),
    images: imgs,
    is_featured: Boolean(r.is_featured),
    is_trending: Boolean(r.is_trending),
    is_active: r.is_active === undefined ? true : Boolean(r.is_active),
  };
}

export function toCart(raw: unknown): Cart {
  const r = o(raw);
  const items: CartItem[] = (Array.isArray(r.items) ? r.items : []).map((it: unknown) => {
    const i = o(it);
    return {
      id: num(i.id),
      product: toProduct(i.product),
      quantity: num(i.quantity),
      unit_price: num(i.unit_price),
      line_total: num(i.line_total),
    };
  });
  return {
    id: (r.id as number) ?? "server",
    items,
    item_count: num(
      r.item_count,
      items.reduce((s, i) => s + i.quantity, 0),
    ),
    subtotal: num(r.subtotal),
    shipping: num(r.shipping),
    tax: num(r.tax),
    total: num(r.total),
    totals_are_estimates: false,
  };
}

export function toUser(raw: unknown): User {
  const r = o(raw);
  return {
    id: (r.id as number) ?? "",
    email: String(r.email ?? ""),
    first_name: String(r.first_name ?? ""),
    last_name: String(r.last_name ?? ""),
    is_staff: r.is_staff === true,
  };
}

export function toOrder(raw: unknown): Order {
  const r = o(raw);
  const items: OrderItem[] = (Array.isArray(r.items) ? r.items : []).map((it: unknown) => {
    const i = o(it);
    return {
      id: num(i.id),
      product_id: num(i.product_id ?? i.product),
      product_name: String(i.product_name ?? ""),
      quantity: num(i.quantity),
      unit_price: num(i.unit_price),
      line_total: num(i.line_total),
    };
  });
  const a = o(r.shipping_address);
  return {
    id: num(r.id),
    number: String(r.number ?? r.id ?? ""),
    status: (r.status as Order["status"]) ?? "pending",
    payment_method: (r.payment_method as Order["payment_method"]) ?? "cod",
    payment_status: (r.payment_status as Order["payment_status"]) ?? "unpaid",
    created_at: String(r.created_at ?? ""),
    shipping_address: {
      full_name: String(a.full_name ?? ""),
      phone: String(a.phone ?? ""),
      line1: String(a.line1 ?? ""),
      line2: typeof a.line2 === "string" ? a.line2 : "",
      city: String(a.city ?? ""),
      state: String(a.state ?? ""),
      postal_code: String(a.postal_code ?? ""),
      country: String(a.country ?? "IN"),
    },
    items,
    subtotal: num(r.subtotal),
    shipping: num(r.shipping),
    tax: num(r.tax),
    total: num(r.total),
    customer_email: typeof r.customer_email === "string" ? r.customer_email : undefined,
  };
}
