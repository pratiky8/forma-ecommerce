# Local browser integration results

Verified on 19 October 2026 with isolated headless Chrome against the actual
React development server and Django/MySQL API. No frontend files or design were
changed. No payment processing was added.

## Running URLs and configuration

- React: http://127.0.0.1:5173/ and http://127.0.0.1:5173/products
- Django API: http://localhost:8000/api/products/ and
  http://localhost:8000/api/categories/
- Django listens on 127.0.0.1:8000; the frontend base URL is localhost:8000.
- Django allows the exact React origin `http://127.0.0.1:5173`. Actual HTTP
  responses returned that value in `Access-Control-Allow-Origin`.
- Existing frontend `.env` enables fixtures. This React process overrides
  `VITE_USE_DEV_FIXTURES=false` and `VITE_ENABLE_DEMO=false`; browser inspection
  confirmed the selected adapter is `live`. A normal start without these
  overrides still uses the preserved fixture configuration.

## Exact server commands

Run each in its own PowerShell terminal from the project root:

```powershell
backend/node_modules/.venv/Scripts/python.exe backend/manage.py runserver 127.0.0.1:8000 --noreload
```

```powershell
$env:VITE_USE_DEV_FIXTURES='false'
$env:VITE_ENABLE_DEMO='false'
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort
```

Both servers were left running after verification.

## Browser automation commands

No browser testing package was installed. The Node script uses Chrome's local
debugging protocol and Node's built-in WebSocket. Chrome was launched with an
isolated profile, without opening the user's normal browser profile:

```powershell
$browserProfile = Join-Path (Get-Location).Path 'backend\node_modules\browser-profile'
$browserProcess = Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9222',('--user-data-dir="' + $browserProfile + '"'),'about:blank') -WindowStyle Hidden -PassThru

backend/node_modules/.venv/Scripts/python.exe backend/scripts/integration_catalogue.py create
try {
    node backend/scripts/browser-integration.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Browser verification failed' }
} finally {
    backend/node_modules/.venv/Scripts/python.exe backend/scripts/integration_catalogue.py cleanup
}
node backend/scripts/browser-integration.mjs --empty
```

The browser session was closed after testing. To repeat the browser commands,
launch Chrome again. A first automation attempt hit a JavaScript expression
syntax issue in the test harness; the harness was corrected and both final
browser runs passed. No application-code fix was needed.

## Results

| Check | Result |
| --- | --- |
| Actual HTTP product and category endpoints | 200, valid JSON, matching CORS origin |
| Live adapter selection in browser | Confirmed |
| Product list and INR price | MySQL record rendered correctly |
| React category service | Returned the MySQL category |
| Product card navigation and detail | Passed; detail API 200 |
| Category and search filters | Correct MySQL product returned |
| Featured/trending home page | MySQL product rendered; APIs 200 |
| Populated catalogue browser console/exceptions | Zero |
| Populated catalogue failed requests | Zero |
| Empty catalogue after cleanup | No matches displayed; both APIs 200 |
| Empty catalogue console/errors/failed requests | Zero |
| Django checks and MySQL connection check | Passed |
| MySQL backend suite | All 23 passed, no skips, 31.590 seconds |
| Frontend suite | All 21 passed; expected network-failure test log |
| Frontend lint | Passed with no errors/warnings |
| Frontend file comparison | All 142 baseline files unchanged |

Two clearly labeled temporary product/category pairs were created and removed
while developing and rerunning the browser harness. Cleanup targets only IDs
and slugs recorded in the ignored manifest. No test products remain, and no
accounts, orders or payments were created in the application database.

Final browser network evidence, console results and screenshots are saved under
ignored `backend/node_modules/`:

- `browser-integration-result.json`, `browser-integration.png`
- `browser-empty-result.json`, `browser-empty.png`

## Validation commands

These commands ran from the project root:

```powershell
npm run lint
npm test
backend/node_modules/.venv/Scripts/python.exe backend/manage.py test shop --keepdb --noinput --verbosity 1
node node_modules/eslint/bin/eslint.js backend/scripts/browser-integration.mjs
backend/node_modules/.venv/Scripts/python.exe backend/manage.py check
backend/node_modules/.venv/Scripts/python.exe backend/manage.py checkdb
backend/node_modules/.venv/Scripts/python.exe backend/scripts/verify_frontend.py
```

The browser script was formatted with:

```powershell
node node_modules/prettier/bin/prettier.cjs --write backend/scripts/browser-integration.mjs
```

## Remaining limitations

- The catalogue was empty during the original integration pass. It has since
  been populated with 12 sample database products using the repeatable command
  documented in SEED_CATALOGUE.md; refresh the live React app to view them.
- Login, registration, cart and COD order behavior are covered by backend API
  tests; this browser pass focused on the requested public catalogue integration.
- The normal frontend launch remains in fixture mode unless the live overrides
  above are used. No frontend environment file was changed.
- Real card/UPI processing, session authentication and deployment work remain
  outside this browser integration task.
