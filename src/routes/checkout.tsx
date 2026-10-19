import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { useCart } from "@/context/cart-context";
import { isFixtureMode, orderService } from "@/services";
import { BackendRequiredError, type ApiError } from "@/services/http";
import { RequireAuth } from "@/components/Guards";
import { EmptyState, ErrorState, LoadingState, Notice } from "@/components/States";
import { Field } from "@/components/Field";
import { Totals } from "@/components/OrderSummary";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import type { PaymentMethod, ShippingAddress } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Forma" },
      { name: "description", content: "Enter shipping details and choose a payment method." },
      { property: "og:title", content: "Checkout — Forma" },
      {
        property: "og:description",
        content: "Enter shipping details and choose a payment method.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Checkout />
    </RequireAuth>
  ),
});

const PAYMENTS: { value: PaymentMethod; label: string; note: string }[] = [
  {
    value: "upi",
    label: "UPI",
    note: "You'll be redirected to the payment provider by the server.",
  },
  {
    value: "card",
    label: "Card",
    note: "Handled by the server's payment provider. Card details are never entered here.",
  },
  { value: "cod", label: "Cash on delivery", note: "Pay when your order arrives." },
];

function Checkout() {
  const { cart, loading, error, refresh } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const ref = useRef<string>(crypto.randomUUID());

  if (loading && !cart) return <LoadingState label="Loading checkout…" />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;
  if (!cart?.items.length)
    return (
      <EmptyState
        title="Nothing to check out"
        body="Your cart is empty."
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
    );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return; // block double submits
    const fd = new FormData(e.currentTarget);
    const address: ShippingAddress = {
      full_name: String(fd.get("full_name")).trim(),
      phone: String(fd.get("phone")).trim(),
      line1: String(fd.get("line1")).trim(),
      line2: String(fd.get("line2") ?? "").trim(),
      city: String(fd.get("city")).trim(),
      state: String(fd.get("state")).trim(),
      postal_code: String(fd.get("postal_code")).trim(),
      country: "IN",
    };
    setSubmitting(true);
    setErr(null);
    try {
      const order = await orderService.create({
        shipping_address: address,
        payment_method: payment,
        client_reference: ref.current,
      });
      await refresh();
      navigate({
        to: "/account/orders/$id",
        params: { id: String(order.id) },
        search: { placed: true },
      });
    } catch (e) {
      setErr(e as ApiError);
      if ((e as ApiError).status === 409 || (e as ApiError).status === 400) void refresh(); // stock/price may have changed
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-5xl">Checkout</h1>
      {isFixtureMode && (
        <div className="mt-6">
          <Notice tone="warn">
            <strong>Demo mode:</strong> you can fill in this form, but orders can't be placed and no
            payment is taken. Placing an order requires the Django backend.
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="mt-8 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <fieldset className="space-y-4" disabled={submitting}>
            <legend className="text-2xl font-display">Shipping address</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                name="full_name"
                autoComplete="name"
                required
                errors={err?.fieldErrors["shipping_address.full_name"]}
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                pattern="[0-9+ ]{10,15}"
                title="10–15 digits"
              />
              <Field
                label="Address line 1"
                name="line1"
                autoComplete="address-line1"
                required
                className="sm:col-span-2"
              />
              <Field
                label="Address line 2"
                name="line2"
                autoComplete="address-line2"
                className="sm:col-span-2"
              />
              <Field label="City" name="city" autoComplete="address-level2" required />
              <Field label="State" name="state" autoComplete="address-level1" required />
              <Field
                label="PIN code"
                name="postal_code"
                autoComplete="postal-code"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                title="6-digit PIN code"
              />
            </div>
          </fieldset>
          <fieldset disabled={submitting}>
            <legend className="font-display text-2xl">Payment</legend>
            <div className="mt-4 space-y-2">
              {PAYMENTS.map((p) => (
                <label
                  key={p.value}
                  className={`flex cursor-pointer gap-3 rounded-md border p-4 ${payment === p.value ? "border-primary bg-card" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={p.value}
                    checked={payment === p.value}
                    onChange={() => setPayment(p.value)}
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block text-sm font-medium">{p.label}</span>
                    <span className="text-xs text-muted-foreground">{p.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <aside aria-label="Order summary" className="h-fit rounded-md bg-surface p-6">
          <h2 className="text-2xl">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span>
                  {i.product.name} × {i.quantity}
                </span>
                <span className="tabular-nums">{formatINR(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t pt-4">
            <Totals {...cart} estimate={cart.totals_are_estimates} />
          </div>
          {err && (
            <div className="mt-4">
              <Notice tone={err instanceof BackendRequiredError ? "warn" : "error"}>
                {err.message}
              </Notice>
            </div>
          )}
          <Button type="submit" disabled={submitting} className="mt-6 h-11 w-full">
            {submitting ? "Placing order…" : "Place order"}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            The server confirms the final total, stock and payment. Nothing is charged by this page.
          </p>
        </aside>
      </form>
    </div>
  );
}
