# Backend setup report

## Changes

All new files are inside `backend/`. SHA-256 comparison verified 142 existing
frontend/project files unchanged. No frontend dependencies were installed.

- `config/`: MySQL settings, local CORS, token authentication, routing, WSGI,
  and explicitly separate SQLite test settings.
- `shop/models.py`, `serializers.py`, `views.py`: catalogue, staff catalogue
  management, email/password auth, user carts, COD orders and staff status updates.
- `shop/migrations/`: initial schema and cart price snapshots.
- `shop/test_catalogue.py`: nine catalogue, validation, staff and CORS tests.
- `shop/test_commerce.py`: twelve auth, ownership, cart, order, replay, rollback
  and price-change tests.
- `shop/test_concurrency.py`: two real-MySQL concurrency tests.
- `shop/management/commands/checkdb.py`: credential-safe connection check.
- `scripts/setup_mysql.py`: approved provisioning with login-path or local password
  prompt; no administrator password saved or printed.
- `scripts/verify_frontend.py`: compare existing frontend files with baseline.
- `.gitignore`, `.env.example`, `requirements.txt`, `manage.py`, `README.md`.
- Ignored local environment, secret key, and frontend baseline files.

## Environment and commands

Detected Python 3.13.7 and existing Django 6.0.5. No DRF, mysqlclient or CORS
package was available in that interpreter. Created a `--system-site-packages`
virtualenv to reuse Django, then installed only:

```text
djangorestframework==3.18.3
django-cors-headers==4.9.0
mysqlclient==2.3.0
```

The first pip request was sandbox-blocked; the approved retry succeeded. The
environment was moved to `backend/node_modules/.venv` and refreshed with
`python -m venv --system-site-packages` so the unchanged root ESLint command
ignores the packages' third-party JavaScript assets.

Commands executed (Django commands run from `backend`):

```powershell
python -m pip show Django djangorestframework mysqlclient django-cors-headers
python -m venv --system-site-packages backend/.venv
# Installed the three missing packages with that environment's python -m pip.
python -m venv --system-site-packages backend/node_modules/.venv
node_modules\.venv\Scripts\python.exe -m pip check
node_modules\.venv\Scripts\python.exe manage.py check
node_modules\.venv\Scripts\python.exe manage.py makemigrations shop --settings=config.test_settings
node_modules\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run --settings=config.test_settings
node_modules\.venv\Scripts\python.exe manage.py test shop --settings=config.test_settings
node_modules\.venv\Scripts\python.exe scripts\verify_frontend.py
node_modules\.venv\Scripts\python.exe manage.py checkdb
mysql --login-path=e_com_p --connect-timeout=5 --batch --skip-column-names -e "SELECT VERSION(), CURRENT_USER(), @@port;"
mysql_config_editor print --all # output filtered to login-path names only
node_modules\.venv\Scripts\python.exe scripts\setup_mysql.py --login-path=e_com_p
node_modules\.venv\Scripts\python.exe manage.py check --database default
node_modules\.venv\Scripts\python.exe manage.py migrate --noinput
node_modules\.venv\Scripts\python.exe manage.py test shop --keepdb --noinput --verbosity 1
node_modules\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
node_modules\.venv\Scripts\python.exe manage.py migrate --check
```

Root `npm run lint` and `npm test` also passed. An exploratory root ESLint scan
was stopped before moving the virtualenv; the standard lint command passed
afterward. An unlabeled Django test command from the frontend directory found
zero tests; the corrected `test shop` command ran the full suite below.

## Verified results

| Check | Result |
| --- | --- |
| Django system checks | No issues |
| Missing migrations | None |
| Python dependency consistency | No broken requirements |
| Portable backend suite | 21 passed, two MySQL-only tests skipped |
| Existing frontend lint | Passed, no warnings |
| Existing frontend tests | 21 passed; expected refused-connection test log |
| Existing file comparison | 142 unchanged |
| MySQL connection | Verified using configured application credentials |
| MySQL provisioning | Owner reported successful local direct-password setup |
| MySQL migrations | All applied; migrate --check passed |
| MySQL API/concurrency suite | All 23 passed in 24.982 seconds; zero skipped |

The initial login-path attempt stopped before administration SQL ran. The owner
then completed the direct-password setup locally. Application connectivity,
migrations and the full suite were subsequently verified against MySQL. Tests
used the separate test database and `--keepdb` preserved it afterward.

## Remaining scope

- Replace sample inventory with real catalogue information before deployment.
  The idempotent seed command has loaded 12 sample products across four categories;
  see SEED_CATALOGUE.md. Frontend configuration remains unchanged.
- Payment provider sessions and verified webhooks, optional session authentication,
  image uploads, confirmed shipping/tax policies and production hardening.

Implemented endpoints were tested with DRF's API client against MySQL, including
separate-connection stock locking and idempotency races. Local HTTP and Chrome
catalogue integration now pass; details are in BROWSER_INTEGRATION.md. No real
payment is simulated.
