import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { CartItem as CartItemT } from "@/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/cart-context";
import { QuantityInput } from "./QuantityInput";
import { ProductImage } from "./ProductCard";

export function CartItem({ item }: { item: CartItemT }) {
  const { update, remove, pending } = useCart();
  const [err, setErr] = useState<string | null>(null);
  const busy = pending.has(item.id);

  async function run(op: () => Promise<void>) {
    setErr(null);
    try {
      await op();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <li className="flex gap-4 border-b py-6 sm:gap-6" aria-busy={busy}>
      <Link
        to="/products/$id"
        params={{ id: String(item.product.id) }}
        className="w-24 shrink-0 sm:w-28"
      >
        <ProductImage src={item.product.images[0]} alt={item.product.name} />
      </Link>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to="/products/$id"
              params={{ id: String(item.product.id) }}
              className="font-medium"
            >
              {item.product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{formatINR(item.unit_price)} each</p>
            {item.product.stock < 5 && item.product.stock > 0 && (
              <p className="text-xs text-primary">Only {item.product.stock} left</p>
            )}
          </div>
          <p className="tabular-nums">{formatINR(item.line_total)}</p>
        </div>
        <div className="flex items-center gap-4">
          <QuantityInput
            label={`Quantity for ${item.product.name}`}
            value={item.quantity}
            max={item.product.stock}
            disabled={busy || item.product.stock <= 0}
            onChange={(q) => q !== item.quantity && run(() => update(item.id, q))}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => remove(item.id))}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
          {busy && (
            <span className="text-xs text-muted-foreground" role="status">
              Updating…
            </span>
          )}
        </div>
        {err && (
          <p role="alert" className="text-sm text-destructive">
            {err}
          </p>
        )}
      </div>
    </li>
  );
}
