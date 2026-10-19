import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { Field } from "@/components/Field";
import { Notice } from "@/components/States";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/")({ component: Profile });

function Profile() {
  const { user, updateMe } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  if (!user) return null;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setMsg(null);
    try {
      await updateMe({
        first_name: String(fd.get("first_name")),
        last_name: String(fd.get("last_name")),
      });
      setMsg({
        tone: "info",
        text: user?.is_demo ? "Updated for this demo session only." : "Profile saved.",
      });
    } catch (e) {
      setMsg({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md">
      {user.is_demo && (
        <div className="mb-6">
          <Notice tone="warn">
            This is a temporary demo session, not a real account. It ends when you close the tab or
            sign out.
          </Notice>
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" name="first_name" defaultValue={user.first_name} />
          <Field label="Last name" name="last_name" defaultValue={user.last_name} />
        </div>
        <Field
          label="Email"
          name="email"
          defaultValue={user.email}
          disabled
          hint="Contact support to change your email."
        />
        <p className="text-sm text-muted-foreground">
          Role: {user.is_staff ? "Staff" : "Customer"}
        </p>
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
