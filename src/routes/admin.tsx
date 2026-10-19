import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { RequireStaff } from "@/components/Guards";
import { adminService, categoryService, isFixtureMode } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { ErrorState, LoadingState, Notice } from "@/components/States";
import { ExampleBadge, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import type { Category, Product } from "@/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Staff admin — Forma" },
      {
        name: "description",
        content: "Staff management for products, categories, inventory and orders.",
      },
      { property: "og:title", content: "Staff admin — Forma" },
      { property: "og:description", content: "Staff management screens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireStaff>
      <Admin />
    </RequireStaff>
  ),
});

type Tab = "products" | "inventory" | "categories" | "orders";

function Admin() {
  const [tab, setTab] = useState<Tab>("products");
  return (
    <div className="container-page py-12">
      <h1 className="text-5xl">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Access here is a UI convenience; the server must enforce staff permissions on every request.
      </p>
      {isFixtureMode && (
        <div className="mt-4">
          <Notice tone="warn">
            Demo mode: edits are local to this tab and vanish on reload. Nothing is saved to a
            server.
          </Notice>
        </div>
      )}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="mt-6 flex flex-wrap gap-2 border-b pb-3"
      >
        {(["products", "inventory", "categories", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-2 text-sm capitalize ${tab === t ? "bg-accent" : "text-muted-foreground hover:bg-accent"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8" role="tabpanel">
        {tab === "products" && <Products />}
        {tab === "inventory" && <Inventory />}
        {tab === "categories" && <Categories />}
        {tab === "orders" && <Orders />}
      </div>
    </div>
  );
}

function Products() {
  const s = useAsync(() => adminService.listProducts(), []);
  const cats = useAsync(() => categoryService.list(), []);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (s.loading) return <LoadingState />;
  if (s.error) return <ErrorState error={s.error} onRetry={s.reload} />;
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = e.currentTarget;
    const fd = new FormData(f);
    setBusy(true);
    setErr(null);
    try {
      await adminService.createProduct({
        name: String(fd.get("name")),
        description: String(fd.get("description") ?? ""),
        price: Number(fd.get("price")),
        stock: Number(fd.get("stock")),
        category_id: Number(fd.get("category")) || null,
        images: [],
        is_featured: false,
        is_trending: false,
        is_active: true,
      });
      f.reset();
      s.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function del(id: number) {
    setErr(null);
    try {
      await adminService.deleteProduct(id);
      s.reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <div className="space-y-8">
      <form
        onSubmit={create}
        className="grid gap-3 rounded-md bg-surface p-4 sm:grid-cols-5"
        aria-label="New product"
      >
        <input
          name="name"
          required
          placeholder="Name"
          aria-label="Name"
          className="h-9 rounded-md border bg-card px-2 text-sm sm:col-span-2"
        />
        <input
          name="price"
          required
          type="number"
          min="0"
          step="1"
          placeholder="Price ₹"
          aria-label="Price"
          className="h-9 rounded-md border bg-card px-2 text-sm"
        />
        <input
          name="stock"
          required
          type="number"
          min="0"
          placeholder="Stock"
          aria-label="Stock"
          className="h-9 rounded-md border bg-card px-2 text-sm"
        />
        <select
          name="category"
          aria-label="Category"
          className="h-9 rounded-md border bg-card px-2 text-sm"
        >
          {cats.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="description"
          placeholder="Description"
          aria-label="Description"
          className="h-9 rounded-md border bg-card px-2 text-sm sm:col-span-4"
        />
        <Button type="submit" disabled={busy}>
          Add product
        </Button>
      </form>
      {err && <Notice tone="error">{err}</Notice>}
      {!s.data?.length && (
        <p className="text-sm text-muted-foreground">No products yet. Add one above.</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Flags</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {s.data?.map((p) => (
              <ProductRow
                key={p.id}
                p={p}
                cats={cats.data ?? []}
                onChanged={s.reload}
                onError={setErr}
                onDelete={() => del(p.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Inventory() {
  const s = useAsync(() => adminService.listProducts(), []);
  const [err, setErr] = useState<string | null>(null);
  if (s.loading) return <LoadingState />;
  if (s.error) return <ErrorState error={s.error} onRetry={s.reload} />;
  async function save(id: number, stock: number) {
    setErr(null);
    if (!Number.isInteger(stock) || stock < 0) return setErr("Stock must be a whole number ≥ 0.");
    try {
      await adminService.updateProduct(id, { stock });
      s.reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <div>
      {err && <Notice tone="error">{err}</Notice>}
      <ul className="divide-y">
        {s.data?.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-3 text-sm">
            <span>
              {p.name}{" "}
              {p.stock === 0 ? (
                <span className="text-destructive">· out</span>
              ) : p.stock < 5 ? (
                <span className="text-primary">· low</span>
              ) : null}
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save(p.id, Number(new FormData(e.currentTarget).get("stock")));
              }}
              className="flex gap-2"
            >
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={p.stock}
                aria-label={`Stock for ${p.name}`}
                className="h-8 w-20 rounded-md border bg-card px-2"
              />
              <Button size="sm" variant="outline" type="submit">
                Save
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Categories() {
  const s = useAsync(() => categoryService.list(), []);
  const [err, setErr] = useState<string | null>(null);
  if (s.loading) return <LoadingState />;
  if (s.error) return <ErrorState error={s.error} onRetry={s.reload} />;
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const name = String(new FormData(f).get("name")).trim();
    setErr(null);
    try {
      await adminService.createCategory({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      });
      f.reset();
      s.reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  async function del(id: number) {
    setErr(null);
    try {
      await adminService.deleteCategory(id);
      s.reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <div className="max-w-lg space-y-6">
      <form onSubmit={create} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="New category"
          aria-label="Category name"
          className="h-9 flex-1 rounded-md border bg-card px-2 text-sm"
        />
        <Button type="submit">Add</Button>
      </form>
      {err && <Notice tone="error">{err}</Notice>}
      {!s.data?.length ? (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="divide-y">
          {s.data.map((c) => (
            <CategoryRow
              key={c.id}
              c={c}
              onDelete={() => del(c.id)}
              onChanged={s.reload}
              onError={setErr}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Orders() {
  const s = useAsync(() => adminService.listOrders(), []);
  const [err, setErr] = useState<string | null>(null);
  if (s.loading) return <LoadingState />;
  if (s.error) return <ErrorState error={s.error} onRetry={s.reload} />;
  if (!s.data?.length) return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  return (
    <div>
      {err && <Notice tone="warn">{err}</Notice>}
      <ul className="divide-y">
        {s.data?.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span>
              #{o.number} {o.is_example && <ExampleBadge />} · {o.customer_email}
            </span>
            <span className="flex items-center gap-3">
              <StatusBadge status={o.status} />
              {formatINR(o.total)}
              <select
                aria-label={`Status for ${o.number}`}
                defaultValue={o.status}
                onChange={async (e) => {
                  setErr(null);
                  try {
                    await adminService.updateOrderStatus(o.id, e.target.value as typeof o.status);
                    s.reload();
                  } catch (x) {
                    setErr((x as Error).message);
                  }
                }}
                className="h-8 rounded-md border bg-card px-2"
              >
                {["pending", "processing", "shipped", "delivered", "cancelled"].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductRow({
  p,
  cats,
  onChanged,
  onError,
  onDelete,
}: {
  p: Product;
  cats: Category[];
  onChanged: () => void;
  onError: (m: string | null) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const price = Number(fd.get("price"));
    if (!(price >= 0)) return onError("Price must be 0 or more.");
    setBusy(true);
    onError(null);
    try {
      await adminService.updateProduct(p.id, {
        name: String(fd.get("name")).trim(),
        price,
        category_id: Number(fd.get("category")) || null,
        is_featured: fd.get("featured") === "on",
        is_trending: fd.get("trending") === "on",
        is_active: fd.get("active") === "on",
      });
      setEditing(false);
      onChanged();
    } catch (x) {
      onError((x as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!editing)
    return (
      <tr>
        <td className="py-2">{p.name}</td>
        <td>{p.category?.name ?? "—"}</td>
        <td className="tabular-nums">{formatINR(p.price)}</td>
        <td>{p.stock}</td>
        <td className="text-xs text-muted-foreground">
          {[p.is_featured && "featured", p.is_trending && "trending", !p.is_active && "hidden"]
            .filter(Boolean)
            .join(", ") || "—"}
        </td>
        <td className="space-x-3 text-right">
          <button onClick={() => setEditing(true)} className="underline-offset-4 hover:underline">
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-destructive underline-offset-4 hover:underline"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  return (
    <tr>
      <td colSpan={6} className="py-2">
        <form
          onSubmit={save}
          className="flex flex-wrap items-center gap-2"
          aria-label={`Edit ${p.name}`}
        >
          <input
            name="name"
            defaultValue={p.name}
            required
            aria-label="Name"
            className="h-8 rounded-md border bg-card px-2"
          />
          <input
            name="price"
            type="number"
            min="0"
            defaultValue={p.price}
            aria-label="Price"
            className="h-8 w-24 rounded-md border bg-card px-2"
          />
          <select
            name="category"
            defaultValue={p.category?.id ?? ""}
            aria-label="Category"
            className="h-8 rounded-md border bg-card px-2"
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="text-xs">
            <input type="checkbox" name="featured" defaultChecked={p.is_featured} /> Featured
          </label>
          <label className="text-xs">
            <input type="checkbox" name="trending" defaultChecked={p.is_trending} /> Trending
          </label>
          <label className="text-xs">
            <input type="checkbox" name="active" defaultChecked={p.is_active} /> Visible
          </label>
          <Button size="sm" type="submit" disabled={busy}>
            Save
          </Button>
          <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </form>
      </td>
    </tr>
  );
}

function CategoryRow({
  c,
  onDelete,
  onChanged,
  onError,
}: {
  c: Category;
  onDelete: () => void;
  onChanged: () => void;
  onError: (m: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onError(null);
    try {
      await adminService.updateCategory(c.id, {
        name: String(fd.get("name")).trim(),
        slug: String(fd.get("slug")).trim(),
        description: String(fd.get("description") ?? ""),
      });
      setEditing(false);
      onChanged();
    } catch (x) {
      onError((x as Error).message);
    }
  }
  if (!editing)
    return (
      <li className="flex items-center justify-between py-3 text-sm">
        <span>
          {c.name} <span className="text-muted-foreground">/{c.slug}</span>
        </span>
        <span className="space-x-3">
          <button onClick={() => setEditing(true)}>Edit</button>
          <button onClick={onDelete} className="text-destructive">
            Delete
          </button>
        </span>
      </li>
    );
  return (
    <li className="py-3">
      <form onSubmit={save} className="flex flex-wrap gap-2" aria-label={`Edit ${c.name}`}>
        <input
          name="name"
          defaultValue={c.name}
          required
          aria-label="Category name"
          className="h-8 rounded-md border bg-card px-2 text-sm"
        />
        <input
          name="slug"
          defaultValue={c.slug}
          required
          pattern="[a-z0-9-]+"
          aria-label="Slug"
          className="h-8 rounded-md border bg-card px-2 text-sm"
        />
        <input
          name="description"
          defaultValue={c.description ?? ""}
          aria-label="Description"
          className="h-8 flex-1 rounded-md border bg-card px-2 text-sm"
        />
        <Button size="sm" type="submit">
          Save
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </form>
    </li>
  );
}
