import { formatINR } from "@/lib/format";

export function Totals({
  subtotal,
  shipping,
  tax,
  total,
  estimate,
}: {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  estimate?: boolean;
}) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="tabular-nums">{formatINR(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="tabular-nums">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
      </div>
      {tax > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="tabular-nums">{formatINR(tax)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t pt-3 text-base font-medium">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatINR(total)}</dd>
      </div>
      {estimate && (
        <p className="pt-1 text-xs text-muted-foreground">
          Demo estimate computed in the browser. In live mode totals come from the server.
        </p>
      )}
    </dl>
  );
}
