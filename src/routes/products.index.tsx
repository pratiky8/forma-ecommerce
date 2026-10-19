import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { categoryService, productService } from "@/services";
import { PAGE_SIZE } from "@/services/config";
import { useAsync } from "@/hooks/useAsync";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState, GridSkeleton } from "@/components/States";
import type { Ordering } from "@/types";

interface ProductSearch {
  search?: string | undefined;
  category?: string | undefined;
  min_price?: number | undefined;
  max_price?: number | undefined;
  ordering?: Ordering | undefined;
  page?: number | undefined;
}

const ORDERINGS: { value: Ordering; label: string }[] = [
  { value: "", label: "Recommended" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
  { value: "-created_at", label: "Newest" },
];

const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): ProductSearch => ({
    search: typeof s["search"] === "string" && s["search"] ? s["search"] : undefined,
    category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined,
    min_price: toNum(s["min_price"]),
    max_price: toNum(s["max_price"]),
    ordering:
      ORDERINGS.some((o) => o.value === s["ordering"]) && s["ordering"]
        ? (s["ordering"] as Ordering)
        : undefined,
    page: toNum(s["page"]) && toNum(s["page"])! >= 1 ? Math.floor(toNum(s["page"])!) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all — Forma" },
      {
        name: "description",
        content: "Browse home, tech, carry and accessories at Forma. Filter by category and price.",
      },
      { property: "og:title", content: "Shop all — Forma" },
      { property: "og:description", content: "Browse home, tech, carry and accessories at Forma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const q = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const cats = useAsync(() => categoryService.list(), []);
  const list = useAsync(() => productService.list(q), [JSON.stringify(q)]);
  const [min, setMin] = useState(q.min_price?.toString() ?? "");
  const [max, setMax] = useState(q.max_price?.toString() ?? "");
  const [priceError, setPriceError] = useState<string | null>(null);
  useEffect(() => {
    setMin(q.min_price?.toString() ?? "");
    setMax(q.max_price?.toString() ?? "");
  }, [q.min_price, q.max_price]);

  const set = (patch: Partial<ProductSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch, page: patch.page }) });

  function applyPrice(e: FormEvent) {
    e.preventDefault();
    const a = toNum(min),
      b = toNum(max);
    if ((min && a === undefined) || (max && b === undefined))
      return setPriceError("Enter valid amounts.");
    if (a != null && b != null && a > b) return setPriceError("Minimum must be below maximum.");
    setPriceError(null);
    set({ min_price: a, max_price: b });
  }

  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.count / PAGE_SIZE)) : 1;
  const page = q.page ?? 1;
  const activeCat = cats.data?.find((c) => c.slug === q.category);

  return (
    <div className="container-page py-12">
      <p className="eyebrow">{activeCat ? "Category" : "Catalogue"}</p>
      <h1 className="mt-2 text-5xl">
        {activeCat?.name ?? (q.search ? `“${q.search}”` : "Shop all")}
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filters" className="space-y-8">
          <div>
            <label htmlFor="f-search" className="eyebrow">
              Search
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                set({
                  search: (new FormData(e.currentTarget).get("s") as string).trim() || undefined,
                });
              }}
            >
              <input
                id="f-search"
                name="s"
                defaultValue={q.search ?? ""}
                key={q.search ?? ""}
                className="mt-2 h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                placeholder="Mug, lamp…"
              />
            </form>
          </div>
          <fieldset>
            <legend className="eyebrow">Category</legend>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => set({ category: undefined })}
                  aria-pressed={!q.category}
                  className={`py-1 ${!q.category ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All
                </button>
              </li>
              {cats.error && (
                <li>
                  <button
                    type="button"
                    onClick={cats.reload}
                    className="text-xs text-destructive underline"
                  >
                    Categories failed — retry
                  </button>
                </li>
              )}
              {cats.data?.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => set({ category: c.slug })}
                    aria-pressed={q.category === c.slug}
                    className={`py-1 ${q.category === c.slug ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </fieldset>
          <form onSubmit={applyPrice} aria-labelledby="price-legend">
            <p id="price-legend" className="eyebrow">
              Price (₹)
            </p>
            <div className="mt-3 flex items-center gap-2">
              <label className="sr-only" htmlFor="min">
                Minimum price
              </label>
              <input
                id="min"
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                placeholder="Min"
                className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
              />
              <span aria-hidden>–</span>
              <label className="sr-only" htmlFor="max">
                Maximum price
              </label>
              <input
                id="max"
                inputMode="numeric"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="Max"
                className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
              />
            </div>
            {priceError && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {priceError}
              </p>
            )}
            <button
              type="submit"
              className="mt-3 h-8 rounded-md border px-3 text-xs hover:bg-accent"
            >
              Apply
            </button>
          </form>
          {(q.search || q.category || q.min_price != null || q.max_price != null) && (
            <Link to="/products" search={{}} className="block text-sm underline underline-offset-4">
              Clear all filters
            </Link>
          )}
        </aside>

        <section aria-label="Results">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {list.data
                ? `${list.data.count} product${list.data.count === 1 ? "" : "s"}`
                : "\u00a0"}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort</span>
              <select
                value={q.ordering ?? ""}
                onChange={(e) =>
                  set({ ordering: (e.target.value || undefined) as Ordering | undefined })
                }
                className="h-9 rounded-md border border-input bg-card px-2 text-sm"
              >
                {ORDERINGS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {list.loading ? (
            <GridSkeleton />
          ) : list.error ? (
            <ErrorState error={list.error} onRetry={list.reload} title="Couldn't load products" />
          ) : !list.data?.results.length ? (
            <EmptyState
              title="No matches"
              body="Try a different search or widen the price range."
              action={
                <Link
                  to="/products"
                  search={{}}
                  className="rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground"
                >
                  Clear filters
                </Link>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                {list.data.results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {totalPages > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    disabled={!list.data.previous}
                    onClick={() => set({ page: page - 1 > 1 ? page - 1 : undefined })}
                    className="h-9 rounded-md border px-3 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-current={page === i + 1 ? "page" : undefined}
                      onClick={() => set({ page: i + 1 > 1 ? i + 1 : undefined })}
                      className={`h-9 w-9 rounded-md text-sm ${page === i + 1 ? "bg-ink text-ink-foreground" : "border hover:bg-accent"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!list.data.next}
                    onClick={() => set({ page: page + 1 })}
                    className="h-9 rounded-md border px-3 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
