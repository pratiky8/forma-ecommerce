import { createFileRoute, Link } from "@tanstack/react-router";
import { orderService } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { ErrorState, LoadingState, Notice } from "@/components/States";
import { ExampleBadge, StatusBadge } from "@/components/StatusBadge";
import { Totals } from "@/components/OrderSummary";
import { formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/account/orders/$id")({
  validateSearch: (s: Record<string, unknown>): { placed?: boolean | undefined } => ({
    placed: s["placed"] === true || s["placed"] === "true" ? true : undefined,
  }),
  component: OrderDetail,
});

const PAY_LABEL = { upi: "UPI", card: "Card", cod: "Cash on delivery" } as const;

function OrderDetail() {
  const { id } = Route.useParams();
  const { placed } = Route.useSearch();
  const { data: o, error, loading, reload } = useAsync(() => orderService.get(id), [id]);
  if (loading) return <LoadingState label="Loading order…" />;
  if (error)
    return (
      <ErrorState
        error={error}
        onRetry={error.status === 404 ? undefined : reload}
        title={error.status === 404 ? "Order not found" : "Couldn't load order"}
      />
    );
  if (!o) return null;
  const a = o.shipping_address;
  return (
    <div>
      <Link to="/account/orders" className="text-sm text-muted-foreground">
        ← All orders
      </Link>
      {placed && !o.is_example && (
        <div className="mt-4">
          <Notice>Order confirmed by the server.</Notice>
        </div>
      )}
      {o.is_example && (
        <div className="mt-4">
          <Notice tone="warn">
            Example order from development fixtures — not a real order, and no payment was taken.
          </Notice>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h2 className="text-4xl">Order #{o.number}</h2>
        <StatusBadge status={o.status} />
        {o.is_example && <ExampleBadge />}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed {formatDate(o.created_at)} · Payment: {PAY_LABEL[o.payment_method]} (
        {o.payment_status})
      </p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y border-y">
          {o.items.map((i) => (
            <li key={i.id} className="flex justify-between py-4 text-sm">
              <span>
                {i.product_name} × {i.quantity}
              </span>
              <span className="tabular-nums">{formatINR(i.line_total)}</span>
            </li>
          ))}
        </ul>
        <aside className="space-y-6">
          <div className="rounded-md bg-surface p-5">
            <Totals {...o} />
          </div>
          <div className="text-sm">
            <p className="eyebrow">Ship to</p>
            <address className="mt-2 not-italic leading-relaxed">
              {a.full_name}
              <br />
              {a.line1}
              {a.line2 ? <>, {a.line2}</> : null}
              <br />
              {a.city}, {a.state} {a.postal_code}
              <br />
              {a.phone}
            </address>
          </div>
        </aside>
      </div>
    </div>
  );
}
