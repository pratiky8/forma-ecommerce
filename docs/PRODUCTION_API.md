# Connect the Vercel frontend to Django

The frontend is https://forma-ecommerce.vercel.app. Django currently runs only
locally. There is no public backend URL yet, so production connectivity is not
fixed or verified end to end. A visitor's localhost points to that visitor's
computer, not your development machine. CORS changes alone cannot host Django.

## Frontend configuration

`src/services/config.ts` reads `VITE_API_BASE_URL`. All live authentication,
catalogue, cart, order, staff and image-normalization code uses that origin
through the centralized services. No separate localhost URL was found in these
callers. The development default remains `http://localhost:8000`.

Production configuration requires an absolute HTTPS origin without credentials,
query strings or a path. Use `https://your-backend-host`, not an `/api` URL: the
endpoint map already includes `/api/`. The build and runtime reject localhost
and loopback origins in production rather than silently sending requests there.

After your backend is deployed, add these Vercel environment variables for
Production (and Preview only if it should use that same backend):

```text
VITE_API_BASE_URL=https://YOUR-ACTUAL-BACKEND-HOST
VITE_USE_DEV_FIXTURES=false
VITE_ENABLE_DEMO=false
VITE_AUTH_STRATEGY=token
```

The host above is a placeholder, not an existing service. Keep using the current
token authentication strategy; no authentication logic was changed. Redeploy
after setting the values: Vite embeds them at build time. No backend password,
database URL, Django secret key or private token belongs in a `VITE_` variable.

Existing local `.env` files were preserved. `npm run dev` can continue using the
local backend. `npm run build` will now deliberately fail if its effective API
origin is localhost; supply the actual deployed HTTPS API origin for a release.

## Backend hosting still required

Choose hosting that supports Python/Django, a production WSGI server, HTTPS and
a reachable MySQL database. No hosting service was created or deployed here.

1. Deploy `backend/` and install its `requirements.txt` in a clean virtualenv.
   Install/configure the hosting platform's production WSGI runner separately.
   For a Linux Gunicorn deployment, after installing Gunicorn, the entry point
   from `backend` is `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`.
   Use the platform's assigned port; do not use Django's development runserver.
2. Provision MySQL reachable from the hosted Django service. Configure `DB_NAME`,
   `DB_USER`, `DB_PASSWORD`, `DB_HOST` and `DB_PORT` as backend-only environment
   values. The Windows localhost MySQL instance and its data are not automatically
   available to a cloud service. Plan any data transfer separately.
3. Set `DJANGO_DEBUG=false`, a private generated `DJANGO_SECRET_KEY`, and
   `DJANGO_ALLOWED_HOSTS=YOUR-ACTUAL-BACKEND-HOST` (hostname only, no scheme/path).
4. After reviewing the target database and permissions, apply Django migrations
   there with `python manage.py migrate`. This was not run against any hosted DB.
5. The code explicitly allows `https://forma-ecommerce.vercel.app` and the four
   existing local development origins. Extra exact origins can be supplied with
   comma-separated `CORS_ALLOWED_ORIGINS`; these extend the explicit allowlist.
   No wildcard or allow-all setting is enabled. Deploy/restart the backend to
   apply the settings. Additional Vercel preview origins need explicit entries.
6. Configure persistent product-media storage and serve its URLs over HTTPS.
   Django's current development `/media/` serving is disabled with DEBUG=false;
   use the platform's media server or object storage. For sample seeding, the
   command also needs the existing `src/assets` files available at its expected
   repository-relative location. Do not assume ignored local media is deployed.
7. Configure the platform's HTTPS proxy/security settings, logging and backups,
   and run `python manage.py check --deploy` as part of deployment validation.
8. Confirm public API responses before entering the real origin in Vercel.

## Public verification after hosting

Replace YOUR-ACTUAL-BACKEND-HOST in these commands:

```powershell
curl.exe -i -H "Origin: https://forma-ecommerce.vercel.app" https://YOUR-ACTUAL-BACKEND-HOST/api/products/
curl.exe -i -H "Origin: https://forma-ecommerce.vercel.app" https://YOUR-ACTUAL-BACKEND-HOST/api/categories/
curl.exe -i -X OPTIONS -H "Origin: https://forma-ecommerce.vercel.app" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: authorization,content-type,idempotency-key" https://YOUR-ACTUAL-BACKEND-HOST/api/orders/
```

Expect 200 catalogue responses and a successful preflight with
`Access-Control-Allow-Origin: https://forma-ecommerce.vercel.app` and permitted
authorization/content-type/idempotency-key headers. A GET of `/api/auth/me/`
without a token should return 401 with the same CORS origin header.

After Vercel redeployment, inspect the browser Network panel: API calls must use
your public backend HTTPS host, never localhost. Verify login and authorized
cart/order requests there before claiming end-to-end production success.

## Local verification performed

- Production builds reject localhost with an actionable configuration error.
- A valid-origin build was tested using `https://api.example.com` only as an
  explicitly nonfunctional example; it does not prove a hosted API exists.
- Automated URL validation covers missing/invalid values, embedded credentials,
  non-HTTPS production URLs, loopback spellings and development compatibility.
- Django tests and actual local HTTP requests verify allowed production/local
  origins, rejection of untrusted origins, authenticated-endpoint error headers
  and preflight authorization/idempotency headers.
- No live end-to-end test is possible until the backend is publicly hosted.

Final check results: 40 frontend tests passed, all 28 MySQL backend tests passed,
TypeScript and lint passed, and Django checks reported no issues. The valid-HTTPS
example build passed; the existing localhost configuration was rejected during
the production build preflight as intended. Actual local HTTP checks returned
200 for products/categories and OPTIONS, and the expected 401 for anonymous
`/api/auth/me/`, all with the exact Vercel CORS origin. Local development remained
allowed; an untrusted origin received no CORS permission. Existing credential
files and authentication logic were not changed.
