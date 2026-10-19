import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { productService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useCart } from "@/context/cart-context";
import { ErrorState, LoadingState, Notice } from "@/components/States";
import { QuantityInput } from "@/components/QuantityInput";
import { ProductImage } from "@/components/ProductCard";
import { DemoTag } from "@/components/DemoBadge";
import { formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product — Forma" },
      { name: "description", content: "Product details, stock and pricing at Forma." },
      { property: "og:title", content: "Product — Forma" },
      { property: "og:description", content: "Product details, stock and pricing at Forma." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductRoute,
});

function ProductRoute() {
  const { id } = Route.useParams();
  return <ProductPage key={id} />;
}

function ProductPage() {
  const { id } = Route.useParams();
  const { data: p, error, loading, reload } = useAsync(() => productService.get(id), [id]);
  const { add, pending, canUseCart } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  if (loading) return <LoadingState label="Loading product…" />;
  if (error)
    return (
      <ErrorState
        error={error}
        onRetry={error.status === 404 ? undefined : reload}
        title={error.status === 404 ? "Product not found" : "Couldn't load product"}
      />
    );
  if (!p) return null;

  const busy = pending.has(`p${p.id}`);
  const out = p.stock <= 0;

  async function onAdd() {
    if (!p) return;
    if (!canUseCart) {
      navigate({ to: "/login", search: { redirect: `/products/${p.id}` } });
      return;
    }
    setMsg(null);
    try {
      await add(p.id, qty);
      setMsg({ tone: "info", text: `Added ${qty} × ${p.name} to your cart.` });
    } catch (e) {
      setMsg({ tone: "error", text: (e as Error).message });
    }
  }

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/products" search={{}}>
          Shop
        </Link>
        {p.category && (
          <>
            {" "}
            /{" "}
            <Link to="/products" search={{ category: p.category.slug }}>
              {p.category.name}
            </Link>
          </>
        )}
      </nav>
      <div className="mt-6 grid gap-10 md:grid-cols-2 lg:gap-16">
        <div>
          <ProductImage src={p.images[img]} alt={p.name} />
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-3" role="group" aria-label="Product images">
              {p.images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={img === i}
                  onClick={() => setImg(i)}
                  className={`w-20 rounded-md border-2 ${img === i ? "border-primary" : "border-transparent"}`}
                >
                  <ProductImage src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:pt-6">
          <div className="flex items-center gap-2">
            <p className="eyebrow">{p.category?.name}</p>
            <DemoTag />
          </div>
          <h1 className="mt-2 text-5xl">{p.name}</h1>
          <p className="mt-4 text-2xl tabular-nums">{formatINR(p.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Inclusive of taxes. Final price confirmed at checkout.
          </p>
          <p className="mt-6 max-w-prose leading-relaxed text-muted-foreground">{p.description}</p>
          <p
            className={`mt-6 text-sm ${out ? "text-destructive" : p.stock < 5 ? "text-primary" : "text-success"}`}
          >
            {out ? "Out of stock" : p.stock < 5 ? `Only ${p.stock} left` : "In stock"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <QuantityInput
              value={qty}
              onChange={setQty}
              max={Math.max(1, p.stock)}
              disabled={out || busy}
            />
            <Button size="lg" onClick={onAdd} disabled={out || busy} className="h-10">
              {busy ? "Adding…" : out ? "Sold out" : canUseCart ? "Add to cart" : "Sign in to add"}
            </Button>
          </div>
          {msg && (
            <div className="mt-4">
              <Notice tone={msg.tone}>
                {msg.text}{" "}
                {msg.tone === "info" && (
                  <Link to="/cart" className="underline underline-offset-4">
                    View cart
                  </Link>
                )}
              </Notice>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
