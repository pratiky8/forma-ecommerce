import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { isFixtureMode } from "@/services";
import { Notice } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import type { ApiError } from "@/services/http";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect:
      typeof s["redirect"] === "string" &&
      s["redirect"].startsWith("/") &&
      !s["redirect"].startsWith("//")
        ? s["redirect"]
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create account — Forma" },
      { name: "description", content: "Create a Forma account to save your cart and orders." },
      { property: "og:title", content: "Create account — Forma" },
      {
        property: "og:description",
        content: "Create a Forma account to save your cart and orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    if (password !== String(fd.get("confirm"))) return setLocalErr("Passwords don't match.");
    if (!isFixtureMode && password.length < 8) return setLocalErr("Use at least 8 characters.");
    setLocalErr(null);
    setBusy(true);
    setErr(null);
    try {
      await register({
        email: String(fd.get("email")),
        password,
        first_name: String(fd.get("first_name")),
        last_name: String(fd.get("last_name")),
      });
      navigate({ to: redirect ?? "/account", replace: true });
    } catch (e) {
      setErr(e as ApiError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page max-w-md py-16">
      <h1 className="text-5xl">Create account</h1>
      {isFixtureMode && (
        <div className="mt-6">
          <Notice tone="warn">
            Demo mode: no account is created. Submitting starts a temporary demo session in this tab
            only. Your password is not stored or sent anywhere.
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="mt-8 space-y-4">
        {err && <Notice tone="error">{err.message}</Notice>}
        {localErr && <Notice tone="error">{localErr}</Notice>}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name"
            name="first_name"
            autoComplete="given-name"
            required
            errors={err?.fieldErrors["first_name"]}
          />
          <Field
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            errors={err?.fieldErrors["last_name"]}
          />
        </div>
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
          autoComplete="new-password"
          required
          errors={err?.fieldErrors["password"]}
          hint="At least 8 characters."
        />
        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
        />
        <Button type="submit" disabled={busy} className="h-10 w-full">
          {busy ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have one?{" "}
        <Link
          to="/login"
          search={{ redirect }}
          className="text-foreground underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
