import { ORDER_STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone =
    status === "cancelled" || status === "refunded"
      ? "bg-destructive/10 text-destructive"
      : status === "delivered" || status === "paid"
        ? "bg-success/10 text-success"
        : "bg-accent text-accent-foreground";
  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-xs font-medium ${tone}`}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function ExampleBadge() {
  return (
    <span className="inline-flex rounded-sm border border-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      Example — not a real order
    </span>
  );
}
