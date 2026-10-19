import { Link } from "@tanstack/react-router";
import type { Product } from "@/types";
import { formatINR } from "@/lib/format";

export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string | undefined;
  alt: string;
  className?: string | undefined;
}) {
  return src ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={816}
      height={816}
      className={`aspect-square w-full rounded-md bg-surface object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex aspect-square w-full items-center justify-center rounded-md bg-surface text-xs text-muted-foreground ${className}`}
    >
      No image
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const out = product.stock <= 0;
  return (
    <article className="group">
      <Link to="/products/$id" params={{ id: String(product.id) }} className="block rounded-md">
        <div className="relative overflow-hidden rounded-md">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            className="transition-opacity group-hover:opacity-90"
          />
          {out && (
            <span className="absolute left-3 top-3 rounded-sm bg-background px-2 py-1 text-[11px] uppercase tracking-wider">
              Sold out
            </span>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-sans text-sm font-medium">{product.name}</h3>
            {product.category && (
              <p className="mt-0.5 text-xs text-muted-foreground">{product.category.name}</p>
            )}
          </div>
          <p className="text-sm tabular-nums">{formatINR(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
