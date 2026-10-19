import { Link } from "@tanstack/react-router";
import { isFixtureMode } from "@/services";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl">Forma</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Everyday, considered. Objects for home, tech and carry — chosen to last.
          </p>
        </div>
        <nav aria-label="Shop">
          <p className="eyebrow">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/products" search={{}}>
                All products
              </Link>
            </li>
            <li>
              <Link to="/products" search={{ category: "home" }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" search={{ category: "tech" }}>
                Tech
              </Link>
            </li>
            <li>
              <Link to="/products" search={{ category: "carry" }}>
                Carry
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <p className="eyebrow">Account</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/account">Profile</Link>
            </li>
            <li>
              <Link to="/account/orders">Orders</Link>
            </li>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container-page flex flex-col gap-2 border-t py-5 text-xs text-muted-foreground md:flex-row md:justify-between">
        <p>© 2026 Forma. Portfolio frontend.</p>
        <p>
          {isFixtureMode
            ? "Running on development fixtures (demo mode)."
            : "Connected to live API."}
        </p>
      </div>
    </footer>
  );
}
