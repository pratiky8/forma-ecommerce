import type { Paginated, Product, ProductQuery } from "@/types";
import { PAGE_SIZE } from "@/services/config";

/** Mirrors the documented Django filters: search, category, min_price, max_price, ordering, page. */
export function queryProducts(
  all: Product[],
  q: ProductQuery,
  pageSize = PAGE_SIZE,
): Paginated<Product> {
  let rows = all.filter((p) => p.is_active);
  if (q.search) {
    const s = q.search.trim().toLowerCase();
    rows = rows.filter(
      (p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s),
    );
  }
  if (q.category) rows = rows.filter((p) => p.category?.slug === q.category);
  if (q.min_price != null) rows = rows.filter((p) => p.price >= q.min_price!);
  if (q.max_price != null) rows = rows.filter((p) => p.price <= q.max_price!);
  const o = q.ordering;
  if (o) {
    const desc = o.startsWith("-");
    const key = o.replace("-", "");
    rows = [...rows].sort((a, b) => {
      const r =
        key === "price"
          ? a.price - b.price
          : key === "name"
            ? a.name.localeCompare(b.name)
            : a.id - b.id;
      return desc ? -r : r;
    });
  }
  const page = Math.max(1, q.page ?? 1);
  const start = (page - 1) * pageSize;
  const results = rows.slice(start, start + pageSize);
  return {
    count: rows.length,
    next: start + pageSize < rows.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
}
