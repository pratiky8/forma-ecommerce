import type { ReactNode } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/services/http";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center py-20 text-sm text-muted-foreground"
    >
      <span
        className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
        aria-hidden
      />
      {label}
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square rounded-md bg-surface" />
          <div className="mt-4 h-3 w-2/3 rounded bg-surface" />
          <div className="mt-2 h-3 w-1/3 rounded bg-surface" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  title = "Something went wrong",
}: {
  error: ApiError | Error | null;
  onRetry?: (() => void) | undefined;
  title?: string | undefined;
}) {
  return (
    <div role="alert" className="mx-auto max-w-md py-16 text-center">
      <AlertCircle className="mx-auto h-6 w-6 text-destructive" aria-hidden />
      <h2 className="mt-3 text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error?.message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-3xl">{title}</h2>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error";
  children: ReactNode;
}) {
  const cls =
    tone === "error"
      ? "border-destructive/40 bg-destructive/5 text-destructive"
      : tone === "warn"
        ? "border-warning-foreground/20 bg-warning text-warning-foreground"
        : "border-border bg-surface text-foreground";
  return (
    <div
      role={tone === "error" ? "alert" : "note"}
      className={`rounded-md border px-4 py-3 text-sm ${cls}`}
    >
      {children}
    </div>
  );
}
