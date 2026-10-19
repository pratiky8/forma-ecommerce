import { createFileRoute, Link } from "@tanstack/react-router";
import { orderService, isFixtureMode } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { EmptyState, ErrorState, LoadingState, Notice } from "@/components/States";
import { ExampleBadge, StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatINR } from "@/lib/format";

export const Route = createFileRoute("/account/orders/")({ component: Orders });

function Orders() {
  const { data, error, loading, reload } = useAsync(() => orderService.list(), []);
  if (loading) return <LoadingState label="Loading orders…" />;
  if (error) return <ErrorState error={error} onRetry={reload} title="Couldn't load orders" />;
  if (!data?.length)
    return (
      <EmptyState
        title="No orders yet"
        body="When you place an order it will appear here."
        action={
          <Link
            to="/products"
            search={{}}
            className="rounded-md bg-ink px-4 py-2 text-sm text-ink-foreground"
          >
            Start shopping
          </Link>
        }
      />
    );
  return (
    <div>
      {isFixtureMode && (
        <div className="mb-6">
          <Notice tone="warn">
            These rows are illustrative examples from development fixtures. They are not real
            orders.
          </Notice>
        </div>
      )}
      <ul className="divide-y border-y">
        {data.map((o) => (
          <li key={o.id}>
            <Link
              to="/account/orders/$id"
              params={{ id: String(o.id) }}
              search={{}}
              className="flex flex-wrap items-center justify-between gap-3 py-5 hover:bg-card"
            >
              <div>
                <p className="font-medium">
                  #{o.number} {o.is_example && <ExampleBadge />}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(o.created_at)} · {o.items.length} item
                  {o.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={o.status} />
                <span className="tabular-nums">{formatINR(o.total)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
