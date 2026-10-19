# Forma — Everyday, considered.

A portfolio e-commerce **frontend** for home, tech, carry and everyday accessories. It is designed to talk to a **separately developed Django REST Framework + MySQL backend**.

> **The Django/MySQL backend is NOT included and is not implemented here.** Everything that needs a server (real accounts, server carts, orders, payments, staff writes) needs that backend. Until it exists, the app runs in a clearly labeled **development fixture (demo) mode**.

## ⚠️ Router constraint: TanStack Router, not React Router

The brief asked for React Router. This project is generated on a **TanStack Start** scaffold, which ships its own file-based router (`@tanstack/react-router`). Adding `react-router-dom` on top would create two competing routers and break SSR and routing. So the app uses **TanStack Router** with the same features React Router would give you:

| React Router concept | Used here |
| --- | --- |
| `<Route path>` table | One file per page in `src/routes/` (e.g. `products.$id.tsx` → `/products/:id`) |
| `useSearchParams` | Typed `validateSearch` + `Route.useSearch()` (`/products?search=&category=&min_price=&max_price=&ordering=&page=`) |
| `<Navigate>` / protected routes | `RequireAuth` / `RequireStaff` in `src/components/Guards.tsx` |
| `<Link>` / `useNavigate` | `@tanstack/react-router` `Link` / `useNavigate` |

Because of this scaffold, page components live in `src/routes/`, not in `src/pages/`. Moving to plain Vite + React Router means moving each route component into a `pages/` file. The services, context, hooks, types and fixtures need no changes.

## Stack

React 19 · TypeScript (strict) · TanStack Router/Start · Axios · Tailwind CSS v4 · Vitest · Vite.

## Run locally

```bash
npm install
cp .env.example .env          # then edit flags (see below)
npm run dev                   # http://localhost:5173 (Vite default)
npm run build                 # production build
npm test                      # unit tests (vitest)
```

## Environment & mode switching

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Django origin. All requests go through the single Axios client. |
| `VITE_USE_DEV_FIXTURES` | `false` | Request fixture mode. |
| `VITE_ENABLE_DEMO` | `false` | Allow fixture mode outside `vite dev` (e.g. a hosted demo/preview build). |
| `VITE_AUTH_STRATEGY` | `token` | `token` = DRF `Authorization: Token …`; `session` = HttpOnly Django session cookie + CSRF. |

**Fixture mode is on only when** `VITE_USE_DEV_FIXTURES=true` **and** (the app runs under `vite dev` **or** `VITE_ENABLE_DEMO=true`). In every other case the app runs in **live API mode**, which is the default.

- **Hosted demo:** the committed `.env` sets both flags to `true`, so the preview shows sample products. A "DEMO" strip appears on every page.
- **Going live:** set `VITE_USE_DEV_FIXTURES=false` (or remove it) and point `VITE_API_BASE_URL` at Django. In live mode the fixture adapter is never called. A failed API request shows an error with a retry button and **never falls back to fixtures**.

### What demo mode does and doesn't do

- Catalogue: 12 sample products in 4 categories, with working search, category and price filters, sorting and pagination (8 per page).
- Cart: kept in `localStorage`. Totals are **browser estimates** and labeled as such.
- Auth: "Start demo shopper/staff session" creates a **temporary, labeled demo session** in `sessionStorage`. It is not real authentication. Passwords are ignored and never stored.
- Orders: only rows marked **"Example — not a real order"**. **Checkout refuses to place orders** and explains that the Django backend is required. No payment is ever simulated.
- Admin: edits change in-memory data for the current tab only (a banner says so) and disappear on reload. Example order statuses can't be changed.

## Architecture

```text
src/
  services/
    config.ts          env flags + mode decision (only place that reads import.meta.env)
    endpoints.ts       configurable endpoint map (no URLs in components)
    http.ts            Axios client, auth header/CSRF, ApiError, DRF error + pagination normalisers
    backend.ts         Backend interface every adapter implements
    live/              Django adapter + response normalisers
    index.ts           picks exactly one adapter; exports productService, cartService, …
  fixtures/            data.ts, query.ts (filter/sort/paginate), fixtureBackend.ts (demo adapter)
  context/             AuthContext, CartContext (cart always replaced by adapter response)
  hooks/useAsync.ts    load / error / retry helper
  components/          Navbar, Footer, ProductCard, SearchBar, CartItem, QuantityInput, Guards,
                       States (loading/empty/error/notice), Field, OrderSummary, StatusBadge, DemoBadge
  routes/              pages: / , /products, /products/$id, /cart, /checkout, /login, /register,
                       /account, /account/orders, /account/orders/$id, /admin
  types/               shared domain types
docs/API_CONTRACT.md   proposed Django contract
```

## Security model

- **Client gates are only for the user interface.** `RequireAuth` and `RequireStaff` hide screens, but Django must enforce `IsAuthenticated` and `IsAdminUser` (or object ownership) on every endpoint. A user can always call the API directly.
- **No passwords or secrets in code or storage.** Passwords go only in the login and register request bodies.
- **Token strategy:** the DRF token is kept in memory and copied to `sessionStorage` (per tab), so any script running on the page could read it (an XSS risk). Keep CSP strict and tokens short-lived. A 401 response clears the token and shows "session expired".
- **Session strategy (recommended for production):** HttpOnly, Secure, SameSite cookie; `withCredentials` is on, and unsafe methods send `X-CSRFToken` from the `csrftoken` cookie.
- **Server totals are authoritative.** In live mode the cart, checkout and order pages show only totals returned by the server. Checkout sends an `Idempotency-Key`, disables double submits, and shows success **only** after the server returns a valid order.
- **No card data is collected.** Payment is chosen as a method only; the server hands off to its payment provider.

## Verification done

- `tsgo --noEmit` clean under strict settings (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- `vite build` succeeds.
- `src/test/store.test.ts`: tests for search, filters, sorting, pagination, cart add/update/remove with stock limits, the checkout refusal, example-order labels, the demo staff gate, DRF page and error parsing, INR formatting, and a live-mode network failure surfacing as an `ApiError`.
- Browser run (Playwright): filters, sort and pagination; quantity +1 recalculates totals; remove leads to the empty cart; `/account`, `/admin` and `/checkout` redirect to `/login?redirect=…` when signed out; a demo shopper is refused at `/admin`; demo checkout shows the "Django backend required" message.

## Limitations

- No backend in this repo. Live mode is only as correct as the Django side's adherence to `docs/API_CONTRACT.md`. Paths marked PROPOSED need alignment.
- Product image upload in admin is not implemented. Image URLs come from the API.
- Data loading uses a small `useAsync` hook on the client (no SSR data prefetch), so pages show loading states first.
