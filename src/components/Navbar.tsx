import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { SearchBar } from "./SearchBar";
import { DemoTag } from "./DemoBadge";
import { Notice } from "./States";

const categoryLinks = [
  { slug: "home", label: "Home" },
  { slug: "tech", label: "Tech" },
  { slug: "carry", label: "Carry" },
  { slug: "accessories", label: "Accessories" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const count = cart?.item_count ?? 0;

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout();
      setOpen(false);
      await navigate({ to: "/", replace: true });
    } catch (e) {
      setLogoutError((e as Error).message);
    }
  }

  return (
    <header className="border-b bg-background">
      {logoutError && (
        <Notice tone="error">Server sign-out could not be confirmed: {logoutError}</Notice>
      )}
      <div className="container-page flex h-16 items-center gap-6">
        <button
          type="button"
          className="-ml-2 p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link
          to="/"
          className="font-display text-2xl leading-none tracking-tight"
          aria-label="Forma home"
        >
          Forma
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-5 text-sm md:flex">
          <Link
            to="/products"
            search={{}}
            className="hover:text-primary"
            activeOptions={{ exact: true, includeSearch: false }}
          >
            Shop all
          </Link>
          {categoryLinks.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ category: c.slug }}
              className="text-muted-foreground hover:text-foreground"
            >
              {c.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden w-56 lg:block">
          <SearchBar />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          {user?.is_staff && (
            <Link
              to="/admin"
              className="hidden rounded-md px-3 py-2 text-sm hover:bg-accent md:inline-block"
            >
              Admin
            </Link>
          )}
          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <UserIcon className="h-4 w-4" aria-hidden /> {user.first_name || "Account"}
                {user.is_demo && <DemoTag>Demo</DemoTag>}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-2 text-sm hover:bg-accent md:inline-block"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/cart"
            className="relative rounded-md p-2 hover:bg-accent"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t md:hidden">
          <div className="container-page space-y-4 py-5">
            <SearchBar id="mobile-search" onSubmitted={() => setOpen(false)} />
            <nav aria-label="Mobile" className="flex flex-col text-base">
              <Link to="/products" search={{}} onClick={() => setOpen(false)} className="py-2">
                Shop all
              </Link>
              {categoryLinks.map((c) => (
                <Link
                  key={c.slug}
                  to="/products"
                  search={{ category: c.slug }}
                  onClick={() => setOpen(false)}
                  className="py-2 text-muted-foreground"
                >
                  {c.label}
                </Link>
              ))}
              <hr className="my-2" />
              {user ? (
                <>
                  <Link to="/account" onClick={() => setOpen(false)} className="py-2">
                    Account
                  </Link>
                  <Link to="/account/orders" onClick={() => setOpen(false)} className="py-2">
                    Orders
                  </Link>
                  {user.is_staff && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="py-2">
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-2 text-left text-muted-foreground"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="py-2">
                    Sign in
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="py-2">
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
