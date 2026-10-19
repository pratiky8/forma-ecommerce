# Sample catalogue

The `seed_catalogue` management command stores 12 sample products in MySQL,
across Home, Tech, Carry and Accessories (three per category). These are sample
inventory records, not real stock. It never creates users, carts, orders or
payments and does not use the React fixture adapter.

From the project root in PowerShell:

```powershell
# Preview with database rollback and no image copies:
backend/node_modules/.venv/Scripts/python.exe backend/manage.py seed_catalogue --dry-run

# Populate the catalogue; safe to repeat:
backend/node_modules/.venv/Scripts/python.exe backend/manage.py seed_catalogue
```

Categories are matched by unique slug, and sample products by unique
`sample-...` slug. Existing rows are reused without changing names, descriptions,
prices, stock, visibility or images. Unrelated inventory is not touched. Repeating
the command does not restore edited inventory values or reset sold stock.
Missing source photos abort the command before database changes. Database writes
are transactional. No schema migration is required.

The command copies the existing `src/assets/p-*.jpg` files to ignored
`backend/media/sample-products/`. It does not modify frontend assets or files.
Images are returned as `/media/sample-products/p-mug.jpg`, for example; the
existing React API client resolves them against `http://localhost:8000`.
Existing copied images are preserved on repeat runs.

Django serves `/media/` only in development (`DEBUG=true`). Configure a media
server for production. Restart a previously running `--noreload` Django server
once to load the new media URL route.

## Browser verification

The live React and Django servers were left running at:

- http://127.0.0.1:5173/products — refresh to see the first eight products.
- http://127.0.0.1:5173/products?category=tech — three technology products.
- http://127.0.0.1:5173/ — four featured and four trending products.
- http://localhost:8000/api/products/ — paginated JSON with `count: 12`.
- http://localhost:8000/api/products/?page=2 — the remaining four products.
- http://localhost:8000/api/categories/ — four category records.
- http://localhost:8000/api/products/?category=tech — three matching records.

If starting the servers yourself, run these commands in separate terminals
from the project root:

```powershell
backend/node_modules/.venv/Scripts/python.exe backend/manage.py runserver 127.0.0.1:8000 --noreload
```

```powershell
$env:VITE_USE_DEV_FIXTURES='false'
$env:VITE_ENABLE_DEMO='false'
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort
```

The existing `.env` is preserved and enables fixtures; keep the live process
overrides when starting React to see database products.

## Tests

```powershell
backend/node_modules/.venv/Scripts/python.exe backend/manage.py test shop.test_seed_catalogue shop.test_catalogue --keepdb --noinput
backend/node_modules/.venv/Scripts/python.exe backend/manage.py test shop --keepdb --noinput
```

Added tests verify idempotency, preservation of edits and unrelated records,
dry-run rollback without image writes, API shape, eight/four pagination, category
filters, featured/trending counts and photo copies. Existing catalogue tests
continue to cover permissions, visibility and input validation.

Verified locally: all 27 backend tests passed against MySQL (no skips), Django
checks passed, and no migration changes were detected. The live product,
category and Tech-filter endpoints returned HTTP 200 with counts 12, four and
three respectively. All eight first-page photo URLs returned valid JPEGs.
The first seed run created four categories and 12 products; the second created
zero records. All 142 existing frontend/project files remained unchanged.
