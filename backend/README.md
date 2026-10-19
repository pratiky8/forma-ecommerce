# Forma backend

All implementation and configuration live in this directory. The React project
is preserved. This API targets its existing `src/services/endpoints.ts` and
`docs/API_CONTRACT.md` contract.

## Environment

The Python environment lives under `backend/node_modules/.venv` so the existing
frontend ESLint command ignores third-party JavaScript bundled with DRF. This
requires no changes to frontend lint configuration and uses no npm packages.

The local `node_modules/.venv` was created with `--system-site-packages` to reuse installed
Django 6.0.5. Only missing backend packages were installed locally. For a clean
environment on another machine, use `python -m venv node_modules/.venv` and then
`node_modules\.venv\Scripts\python.exe -m pip install -r requirements.txt`.

Commands below run from `backend` in PowerShell. Activation is optional.

```powershell
# Database administration: execute only with the database owner's approval.
node_modules\.venv\Scripts\python.exe scripts\setup_mysql.py --login-path=e_com_p
# Or prompt directly for a local administrator password:
node_modules\.venv\Scripts\python.exe scripts\setup_mysql.py --admin-user=root

# Once backend/.env contains valid application credentials:
node_modules\.venv\Scripts\python.exe manage.py checkdb
node_modules\.venv\Scripts\python.exe manage.py check --database default
node_modules\.venv\Scripts\python.exe manage.py migrate
node_modules\.venv\Scripts\python.exe manage.py test shop --keepdb
node_modules\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

The setup script uses the existing MySQL login path without printing passwords.
It creates `forma`, `test_forma`, and `forma_app`@`localhost` only when missing;
it never resets an existing user's password. Newly generated application
credentials go in ignored `backend/.env`. If the user already exists, supply its
existing password locally in that file; do not put credentials in chat or React.
Privileges are granted only on the two named databases. Existing broader grants
are not silently revoked. The development application user can run migrations
and tests; use separately scoped migration/runtime users in production.

MySQL tests use `test_forma` and clear its application tables. Keep that database
exclusively for testing. `--keepdb` retains the test database afterward.

Portable tests are explicitly selected and never substituted on MySQL failures:

```powershell
node_modules\.venv\Scripts\python.exe manage.py test shop --settings=config.test_settings
node_modules\.venv\Scripts\python.exe scripts\verify_frontend.py
```

These SQLite tests cover API contracts, permissions and business rules. They do
not establish MySQL compatibility or verify row-lock concurrency. Run the MySQL
suite and concurrency tests before deployment.

## API behavior

- Public: `GET /api/categories/`, `/api/products/`, `/api/products/{id}/`.
  Products include nested categories, decimal strings and image URL strings;
  public queries exclude inactive products. Pagination is eight per page.
- Token auth: register/login return `{token, user}`; logout revokes the token.
  `/api/auth/me/` supports GET/PATCH. Email is case normalized and unique;
  passwords use Django hashing and password validators. Staff flags cannot be
  assigned through registration or profile updates.
- Authenticated cart: GET, add, PATCH quantity and DELETE return the full cart
  and server totals. Each user can access only their own items.
- Orders: server cart only, transactional stock locks, snapshots, stock deduction
  and cart clearing. `Idempotency-Key` must match `client_reference`; replay
  returns the original order, and a changed payload returns 409.
- Cash on delivery is implemented. UPI/card requests return 400 until a real
  provider and verified webhook are implemented; no payment is simulated.
- Staff endpoints match `/api/admin/products/`, `/categories/` and `/orders/`.
  Product deletion is soft deletion; referenced categories return 409.
  Order transitions are validated; cancellation restores stock once.

Shipping is currently INR 99 below INR 2500 and free above, with zero configured
tax, matching the demo policy. Confirm the business shipping/tax rules before
accepting live orders. Staff may provide image URLs; development also serves
copied sample photos through `/media/`. There is no image upload service yet.
The optional [sample catalogue command](SEED_CATALOGUE.md) creates 12 database
products without creating orders. It has been run locally; repeat runs preserve
existing inventory edits.

## Frontend integration and remaining work

Token auth matches the frontend's default strategy. Session auth and
`/api/auth/csrf/` are not implemented in this increment. Local CORS permits
localhost and 127.0.0.1 on ports 5173 and 8080, including the idempotency header;
override with `CORS_ALLOWED_ORIGINS` for your actual development URL.

The React environment was not changed: if it currently enables fixtures, it
will continue showing fixtures until the owner switches to live mode. The
frontend already knows the API URL `http://localhost:8000`.

The full 23-test suite has passed against local MySQL, including both
multi-connection checkout concurrency tests. All migrations are applied.

Before deployment: configure DEBUG=false, DJANGO_SECRET_KEY, ALLOWED_HOSTS,
HTTPS/security headers, shared throttling infrastructure, database least
privileges and backups, actual shipping/tax policies, payment integration,
and deployment validation. The current token API uses DRF
tokens without automatic expiry; do not expose development HTTP publicly.

Local HTTP and Chrome catalogue integration have passed. See
[BROWSER_INTEGRATION.md](BROWSER_INTEGRATION.md) for exact commands, URLs,
results, and remaining browser coverage. The frontend environment is preserved;
use the documented process overrides to run React in live mode.
