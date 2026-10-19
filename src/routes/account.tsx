import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/Guards";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — Forma" },
      { name: "description", content: "Manage your Forma profile and orders." },
      { property: "og:title", content: "Your account — Forma" },
      { property: "og:description", content: "Manage your Forma profile and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const cls =
    "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent data-[status=active]:bg-accent data-[status=active]:text-foreground";
  return (
    <RequireAuth>
      <div className="container-page py-12">
        <h1 className="text-5xl">Account</h1>
        <nav aria-label="Account" className="mt-6 flex gap-2 border-b pb-3">
          <Link to="/account" activeOptions={{ exact: true }} className={cls}>
            Profile
          </Link>
          <Link to="/account/orders" className={cls}>
            Orders
          </Link>
        </nav>
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  );
}
