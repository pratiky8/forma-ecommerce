import { isFixtureMode } from "@/services";

/** Thin, always-visible strip while fixture mode is active. */
export function ModeBanner() {
  if (!isFixtureMode) return null;
  return (
    <div className="bg-ink text-ink-foreground">
      <p className="container-page py-1.5 text-center text-xs tracking-wide">
        <span className="mr-2 rounded-sm bg-primary px-1.5 py-0.5 font-medium text-primary-foreground">
          DEMO
        </span>
        Development fixtures — no real backend, orders or payments. Connect Django to go live.
      </p>
    </div>
  );
}

export function DemoTag({ children = "Demo data" }: { children?: string }) {
  if (!isFixtureMode) return null;
  return (
    <span className="inline-flex items-center rounded-sm border border-primary/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
      {children}
    </span>
  );
}
