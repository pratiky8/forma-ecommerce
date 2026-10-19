import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/context/cart-context";
import { CartItem } from "@/components/CartItem";
import { EmptyState, ErrorState, LoadingState } from "@/components/States";
import { Totals } from "@/components/OrderSummary";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Forma" },
      { name: "description", content: "Review items and totals in your Forma cart." },
      { property: "og:title", content: "Your cart — Forma" },
      { property: "og:description", content: "Review items and totals in your Forma cart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, loading, error, refresh, canUseCart, pending } = useCart();
  return (
    <div className="container-page py-12">
      <h1 className="text-5xl">Cart</h1>
      {!canUseCart ? (
        <EmptyState
          title="Sign in to see your cart"
          body="Your cart is saved to your account."
          action={
            <Link
              to="/login"
              search={{ redirect: "/cart" }}
              className="rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground"
            >
              Sign in
            </Link>
          }
        />
      ) : loading && !cart ? (
        <LoadingState label="Loading cart…" />
      ) : error ? (
        <ErrorState error={error} onRetry={refresh} title="Couldn't load your cart" />
      ) : !cart?.items.length ? (
        <EmptyState
          title="Your cart is empty"
          body="Start with something you'll use every day."
          action={
            <Link
              to="/products"
              search={{}}
              className="rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground"
            >
              Browse products
            </Link>
          }
        />
      ) : (
        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_340px]">
          <ul aria-label="Cart items" className="border-t">
            {cart.items.map((i) => (
              <CartItem key={i.id} item={i} />
            ))}
          </ul>
          <aside aria-label="Order summary" className="h-fit rounded-md bg-surface p-6">
            <h2 className="text-2xl">Summary</h2>
            <div className="mt-4">
              <Totals {...cart} estimate={cart.totals_are_estimates} />
            </div>
            <Link
              to="/checkout"
              aria-disabled={pending.size > 0}
              className={`mt-6 block rounded-md bg-ink px-4 py-3 text-center text-sm text-ink-foreground ${pending.size > 0 ? "pointer-events-none opacity-50" : ""}`}
            >
              Continue to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
