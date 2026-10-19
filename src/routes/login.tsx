import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { isFixtureMode } from "@/services";
import { Notice } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import type { ApiError } from "@/services/http";

const safeRedirect = (r: unknown) =>
  typeof r === "string" && r.startsWith("/") && !r.startsWith("//") ? r : undefined;

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: safeRedirect(s["redirect"]),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Forma" },
      { name: "description", content: "Sign in to your Forma account." },
      { property: "og:title", content: "Sign in — Forma" },
      { property: "og:description", content: "Sign in to your Forma account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, startDemo, sessionExpired, user } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);

  const go = () => navigate({ to: redirect ?? "/account", replace: true });

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      await login({ email: String(fd.get("email")), password: String(fd.get("password")) });
      go();
    } catch (e) {
      setErr(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  async function demo(staff: boolean) {
    if (!startDemo || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await startDemo(staff);
      await navigate({ to: staff ? "/admin" : (redirect ?? "/account"), replace: true });
    } catch (e) {
      setErr(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-5xl">Sign in</h1>
      {sessionExpired && (
        <div className="mt-4">
          <Notice tone="warn">Your session expired. Please sign in again.</Notice>
        </div>
      )}
      {user && (
        <div className="mt-4">
          <Notice>
            You're signed in as {user.email}.{" "}
            <Link to="/account" className="underline">
              Go to account
            </Link>
          </Notice>
        </div>
      )}

      {isFixtureMode && (
        <div className="mt-6 rounded-md border border-primary/30 p-4">
          <p className="text-sm font-medium">Demo mode</p>
          <p className="mt-1 text-xs text-muted-foreground">
            No real accounts exist. A demo session is temporary, held only in this tab, and is not
            real authentication. Passwords are ignored and never stored.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => demo(false)}>
              Start demo shopper session
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => demo(true)}>
              Start demo staff session
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate={false}>
        {err && <Notice tone="error">{err.message}</Notice>}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          errors={err?.fieldErrors["email"]}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={isFixtureMode ? 0 : 1}
          errors={err?.fieldErrors["password"]}
        />
        <Button type="submit" disabled={busy} className="h-10 w-full">
          {busy ? "Signing in…" : isFixtureMode ? "Sign in (demo session)" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link
          to="/register"
          search={{ redirect }}
          className="text-foreground underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
