import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import mug from "@/assets/p-mug.jpg";
import earbuds from "@/assets/p-earbuds.jpg";
import backpack from "@/assets/p-backpack.jpg";
import wallet from "@/assets/p-wallet.jpg";
import { productService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { ProductCard } from "@/components/ProductCard";
import { ErrorState, GridSkeleton, EmptyState } from "@/components/States";
import type { Product } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forma — Everyday, considered." },
      {
        name: "description",
        content: "Considered objects for home, tech, carry and everyday accessories.",
      },
      { property: "og:title", content: "Forma — Everyday, considered." },
      {
        property: "og:description",
        content: "Considered objects for home, tech, carry and everyday accessories.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const cats = [
  { slug: "home", name: "Home", img: mug },
  { slug: "tech", name: "Tech", img: earbuds },
  { slug: "carry", name: "Carry", img: backpack },
  { slug: "accessories", name: "Accessories", img: wallet },
];

function Home() {
  const featured = useAsync(() => productService.featured(), []);
  const trending = useAsync(() => productService.trending(), []);
  return (
    <>
      <section className="relative">
        <img
          src={hero}
          alt="Stoneware mug, leather wallet and linen tote on an oak side table"
          width={1600}
          height={1008}
          className="h-[68vh] min-h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="container-page pb-10 md:pb-0">
            <div className="max-w-md">
              <p className="eyebrow">Autumn edit · 2026</p>
              <h1 className="mt-3 text-5xl leading-[1.02] md:text-7xl">
                Everyday,
                <br />
                considered.
              </h1>
              <p className="mt-4 text-muted-foreground">
                Fewer, better things for home, desk and the daily route.
              </p>
              <div className="mt-7 flex gap-3">
                <Link
                  to="/products"
                  search={{}}
                  className="rounded-md bg-ink px-5 py-3 text-sm text-ink-foreground hover:bg-ink/90"
                >
                  Shop the collection
                </Link>
                <Link
                  to="/products"
                  search={{ ordering: "-created_at" }}
                  className="rounded-md border border-ink/20 bg-background/60 px-5 py-3 text-sm hover:bg-background"
                >
                  New in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="cat-h">
        <div className="flex items-end justify-between">
          <h2 id="cat-h" className="text-4xl">
            Shop by category
          </h2>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {cats.map((c) => (
            <li key={c.slug}>
              <Link to="/products" search={{ category: c.slug }} className="group block">
                <img
                  src={c.img}
                  alt=""
                  loading="lazy"
                  width={816}
                  height={816}
                  className="aspect-[4/5] w-full rounded-md object-cover"
                />
                <p className="mt-3 flex items-center justify-between text-sm font-medium">
                  {c.name}
                  <span aria-hidden className="text-muted-foreground group-hover:text-primary">
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ProductRow title="Featured" eyebrow="Chosen by the studio" state={featured} />
      <ProductRow title="Trending now" eyebrow="What people are carrying" state={trending} />
    </>
  );
}

function ProductRow({
  title,
  eyebrow,
  state,
}: {
  title: string;
  eyebrow: string;
  state: ReturnType<typeof useAsync<Product[]>>;
}) {
  return (
    <section className="container-page pb-20" aria-label={title}>
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-2 flex items-end justify-between">
        <h2 className="text-4xl">{title}</h2>
        <Link to="/products" search={{}} className="text-sm underline-offset-4 hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-8">
        {state.loading ? (
          <GridSkeleton count={4} />
        ) : state.error ? (
          <ErrorState error={state.error} onRetry={state.reload} title="Couldn't load products" />
        ) : !state.data?.length ? (
          <EmptyState title="Nothing here yet" body="Check back soon." />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {state.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
