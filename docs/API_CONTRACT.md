# Forma ↔ Django REST API contract (proposal)

Status: **proposal**. Endpoints from the original brief are marked **[agreed]**. Everything else is marked **[PROPOSED]** and must be confirmed with the Django team. Every path is configurable in `src/services/endpoints.ts`, and every response shape is normalised in `src/services/live/normalize.ts`.

Base URL: `VITE_API_BASE_URL` (e.g. `http://localhost:8000`). JSON in and out. Money is a DRF `DecimalField` serialised as a string (`"890.00"`) in INR. The frontend parses it to a number for display only.

## Conventions

### Pagination
List endpoints may return a DRF page **or** a plain array. Both are accepted.
```json
{ "count": 12, "next": "http://localhost:8000/api/products/?page=2", "previous": null, "results": [ ... ] }
```
Default page size is 8 (the frontend pagination math assumes `PAGE_SIZE = 8`; keep these aligned or expose `page_size`).

### Errors
```json
{ "detail": "Authentication credentials were not provided." }        // 401/403/404
{ "email": ["A user with that email already exists."] }              // 400 field errors
{ "non_field_errors": ["Unable to log in with provided credentials."] }
{ "quantity": ["Only 3 available."] }                                 // stock errors (400)
```
| Status | Frontend behaviour |
| --- | --- |
| 400 | Field errors appear under the matching inputs; `non_field_errors`/`detail` appears as a banner |
| 401 | Token cleared, user signed out, "session expired" shown on login |
| 403 | "You don't have permission" |
| 404 | Not-found state (no retry) |
| 409 | Conflict banner; checkout reloads the cart (stock or price changed) |
| 5xx / network / timeout (15 s) | Error state with **Try again**; never falls back to fixtures |

## Auth

Two strategies, selected by `VITE_AUTH_STRATEGY`:

- **token** (default): `Authorization: Token <key>` (DRF `TokenAuthentication`). The token is held in memory and copied to `sessionStorage`. If you use expiring tokens (e.g. `knox`), return 401 on expiry.
- **session** (recommended for production): Django session cookie (HttpOnly, Secure, SameSite=Lax) plus CSRF. The frontend calls `GET /api/auth/csrf/` before login/register and sends `X-CSRFToken` on unsafe methods.

### POST /api/auth/register/ [agreed]
```json
// request
{ "email": "a@b.in", "password": "••••••••", "first_name": "Asha", "last_name": "Rao" }
// 201 (token)                              // 201 (session)
{ "token": "9f…", "user": { ...User } }    { "user": { ...User } }
```
### POST /api/auth/login/ [agreed]
Request `{ "email", "password" }`. Response as for register. Wrong credentials: `400 {"non_field_errors": [...]}`.
### POST /api/auth/logout/ [PROPOSED]
Deletes the token or flushes the session. `204`. The client clears local state even if this call fails.
### GET /api/auth/me/ · PATCH /api/auth/me/ [PROPOSED]
```json
{ "id": 7, "email": "a@b.in", "first_name": "Asha", "last_name": "Rao", "is_staff": false }
```
PATCH accepts `first_name` and `last_name`. `is_staff` is read-only, and the server is the only source of truth for it. Returns 401 when the user isn't authenticated.
### GET /api/auth/csrf/ [PROPOSED, session only]
Uses `ensure_csrf_cookie`; sets the `csrftoken` cookie. `204`.

## Catalogue (public)

### GET /api/categories/ [agreed]
```json
[{ "id": 1, "name": "Home", "slug": "home", "description": "…" }]
```
### GET /api/products/ [agreed]
Query parameters (use `django-filter` + `SearchFilter` + `OrderingFilter`):

| Param | Example | Semantics |
| --- | --- | --- |
| `search` | `mug` | icontains on name/description |
| `category` | `home` | category **slug** |
| `min_price` / `max_price` | `1000` | inclusive, INR |
| `ordering` | `price`, `-price`, `name`, `-name`, `-created_at` | |
| `page` | `2` | 1-based |
| `is_featured` / `is_trending` | `true` | used by the home page |

Only `is_active=true` products are returned publicly.
```json
{
  "count": 12, "next": null, "previous": null,
  "results": [{
    "id": 1, "name": "Stoneware Mug", "slug": "stoneware-mug",
    "description": "…", "price": "890.00", "stock": 42,
    "category": { "id": 1, "name": "Home", "slug": "home" },
    "images": ["https://cdn…/mug-1.jpg", "/media/products/mug-2.jpg"],
    "is_featured": true, "is_trending": false, "is_active": true
  }]
}
```
`images` may be strings or `{ "image": url }`. A single `image` field is also accepted. Relative URLs are resolved against `VITE_API_BASE_URL`.
### GET /api/products/{id}/ [agreed]
Single product (as above). Returns 404 when the product is missing or inactive.

## Cart (authenticated)

Every cart response returns the **full cart with server-computed totals**. The client never computes authoritative totals.
```json
{
  "id": 3,
  "items": [{ "id": 11, "product": { ...Product }, "quantity": 2, "unit_price": "890.00", "line_total": "1780.00" }],
  "item_count": 2,
  "subtotal": "1780.00", "shipping": "99.00", "tax": "0.00", "total": "1879.00"
}
```
- **GET /api/cart/** [agreed]: the current user's cart (create one lazily).
- **POST /api/cart/items/** [agreed]: `{ "product_id": 1, "quantity": 2 }` adds to an existing line. `400 {"quantity": ["Only 3 available."]}` when stock is too low. Returns the cart.
- **PATCH /api/cart/items/{id}/** [PROPOSED]: `{ "quantity": 3 }` sets the absolute quantity (≥1, ≤ stock). Returns the cart.
- **DELETE /api/cart/items/{id}/** [PROPOSED]: returns the cart (200), or 204, after which the client refetches.

Ownership: an item id must belong to `request.user`'s cart; otherwise return 404.

## Orders (authenticated)

### POST /api/orders/ [agreed]
Creates an order from the **server-side cart** (the client sends no prices or items).
```http
Idempotency-Key: 5b0c…uuid
```
```json
{
  "shipping_address": { "full_name": "Asha Rao", "phone": "9876543210", "line1": "12 MG Road", "line2": "",
                        "city": "Bengaluru", "state": "Karnataka", "postal_code": "560001", "country": "IN" },
  "payment_method": "upi",               // "upi" | "card" | "cod"
  "client_reference": "5b0c…uuid"
}
```
Server must, in one transaction: re-validate stock (`select_for_update`), recompute totals, decrement stock, empty the cart, and treat a repeated `Idempotency-Key` as returning the original order.
```json
// 201
{ "id": 42, "number": "FRM-000042", "status": "awaiting_payment", "payment_method": "upi", "payment_status": "pending",
  "created_at": "2026-10-19T08:00:00Z", "shipping_address": { … },
  "items": [{ "id": 1, "product_id": 1, "product_name": "Stoneware Mug", "quantity": 2, "unit_price": "890.00", "line_total": "1780.00" }],
  "subtotal": "1780.00", "shipping": "99.00", "tax": "0.00", "total": "1879.00",
  "payment": { "redirect_url": "https://provider…/pay/…" } }
```
Errors: `400` (address fields, empty cart), `409` (stock or price changed; the client reloads the cart). The frontend shows success **only** when the response has `id` and `number`.

**Payment handling:** the frontend never collects card or UPI credentials and never marks an order paid. For `upi`/`card`, the backend creates a provider session (and may return `payment.redirect_url`; redirect support is a planned frontend extension). `payment_status` changes only through a verified provider webhook on the server. `cod` orders start as `pending`/`unpaid`.

**Order statuses:** `pending`, `awaiting_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`. **Payment statuses:** `unpaid`, `pending`, `paid`, `failed`, `refunded`.

### GET /api/orders/ [agreed]
The current user's orders only (paginated or a list), newest first.
### GET /api/orders/{id}/ [PROPOSED]
Returns 404 if the order doesn't belong to `request.user`.

## Staff endpoints [PROPOSED]
All require `IsAdminUser` (`is_staff=True`) **on the server**. Non-staff users get `403`.

| Method & path | Body | Response |
| --- | --- | --- |
| GET `/api/admin/products/` | – | all products incl. inactive |
| POST `/api/admin/products/` | `{name, description, price, category_id, stock, is_featured, is_trending, is_active, images}` | 201 Product |
| PATCH `/api/admin/products/{id}/` | any subset (e.g. `{stock: 10}` for inventory) | Product |
| DELETE `/api/admin/products/{id}/` | – | 204 (consider soft-delete if referenced by orders) |
| POST `/api/admin/categories/` | `{name, slug, description?}` | 201 Category |
| PATCH `/api/admin/categories/{id}/` | subset | Category |
| DELETE `/api/admin/categories/{id}/` | – | 204, or 409 if products still reference it |
| GET `/api/admin/orders/` | – | all orders, incl. `customer_email` |
| PATCH `/api/admin/orders/{id}/` | `{status}` | Order; reject illegal transitions with 400 |

Reads stay public at `/api/categories/`. Staff writes go only through `/api/admin/...`.

## CORS & CSRF setup (Django)

```python
INSTALLED_APPS += ["corsheaders", "rest_framework", "rest_framework.authtoken", "django_filters"]
MIDDLEWARE.insert(0, "corsheaders.middleware.CorsMiddleware")
CORS_ALLOWED_ORIGINS = ["http://localhost:8080", "http://localhost:5173", "https://your-frontend.example"]
CORS_ALLOW_HEADERS = [*default_headers, "idempotency-key"]  # from corsheaders.defaults import default_headers

# token strategy
REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.TokenAuthentication"],
  "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination", "PAGE_SIZE": 8,
  "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend",
                              "rest_framework.filters.SearchFilter", "rest_framework.filters.OrderingFilter"],
}

# session strategy (instead): SessionAuthentication, plus
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["https://your-frontend.example"]
SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "Lax"   # use "None" + Secure only if frontend and API are on different sites
CSRF_COOKIE_HTTPONLY = False      # the SPA must read csrftoken to send X-CSRFToken
```
With cross-site deployments, prefer serving the API under the same site (e.g. `api.example.com` and `shop.example.com`) so that SameSite=Lax cookies work.

## Switching from fixtures to live
1. Implement the endpoints above (or edit `src/services/endpoints.ts` to match yours).
2. `.env`: `VITE_USE_DEV_FIXTURES=false`, `VITE_API_BASE_URL=https://api…`, choose `VITE_AUTH_STRATEGY`.
3. Rebuild. The fixture adapter is no longer used.
