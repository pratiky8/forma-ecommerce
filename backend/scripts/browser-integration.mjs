import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const origin = "http://127.0.0.1:5173";
const empty = process.argv.includes("--empty");
const record = empty
  ? null
  : JSON.parse(
      await fs.readFile(
        new URL("../node_modules/integration-catalogue.json", import.meta.url),
        "utf8",
      ),
    );
const target = await (
  await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" })
).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
let sequence = 0;
const pending = new Map();
const consoleErrors = [];
const exceptions = [];
const failures = [];
const responses = [];
const urls = new Map();
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }
  const p = message.params;
  if (message.method === "Runtime.consoleAPICalled" && p.type === "error")
    consoleErrors.push(p.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
  if (message.method === "Runtime.exceptionThrown")
    exceptions.push(p.exceptionDetails.exception?.description ?? p.exceptionDetails.text);
  if (message.method === "Network.requestWillBeSent") urls.set(p.requestId, p.request.url);
  if (message.method === "Network.loadingFailed")
    failures.push({
      url: urls.get(p.requestId),
      error: p.errorText,
      canceled: p.canceled ?? false,
    });
  if (message.method === "Network.responseReceived" && p.response.url.includes(":8000/api/"))
    responses.push({ url: p.response.url, status: p.response.status });
};
function call(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await call("Runtime.evaluate", {
    expression: `(async () => (${expression}))()`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(expression, label) {
  const end = Date.now() + 60000;
  while (Date.now() < end) {
    if (await evaluate(expression)) return;
    await delay(250);
  }
  throw new Error("Timed out: " + label);
}
const checks = [];
try {
  await call("Runtime.enable");
  await call("Network.enable");
  await call("Page.enable");
  await call("Page.navigate", { url: origin + "/products" });
  if (empty) {
    await waitFor(
      "document.body?.innerText.includes('No matches')",
      "empty MySQL catalogue rendered",
    );
    assert.equal(await evaluate("(await import('/src/services/index.ts')).backend.mode"), "live");
    checks.push("Empty MySQL catalogue renders No matches in live mode after test-data cleanup");
    await delay(1000);
  } else {
    await waitFor(
      `document.body?.innerText.includes(${JSON.stringify(record.name)})`,
      "MySQL product rendered",
    );
    assert.equal(await evaluate(`(await import('/src/services/index.ts')).backend.mode`), "live");
    checks.push("Live backend adapter selected without frontend file changes");
    assert.equal(await evaluate(`document.body.innerText.includes('123.45')`), true);
    checks.push("Product name and INR price rendered from Django/MySQL");
    const categories = await evaluate(
      `(await import('/src/services/index.ts')).categoryService.list()`,
    );
    assert.ok(
      categories.some(
        (category) => category.id === record.category_id && category.slug === record.slug,
      ),
    );
    checks.push("React category service retrieves the MySQL category");
    await evaluate(`document.querySelector('a[href="/products/${record.product_id}"]').click()`);
    await waitFor(
      `location.pathname === '/products/${record.product_id}' && document.body.innerText.includes('Temporary browser verification record')`,
      "product detail navigation",
    );
    checks.push("Product card navigation and MySQL product detail render");
    await call("Page.navigate", {
      url: origin + "/products?category=" + record.slug + "&search=Integration",
    });
    await waitFor(
      `document.body?.innerText.includes(${JSON.stringify(record.name)})`,
      "filtered product list",
    );
    checks.push("Category and search filters retrieve the matching MySQL product");
    await call("Page.navigate", { url: origin + "/" });
    await waitFor(
      `document.body?.innerText.includes(${JSON.stringify(record.name)})`,
      "featured or trending products on home",
    );
    await delay(1500);
    checks.push("Home page renders the MySQL featured/trending product");
  }
  assert.ok(
    responses.some(
      (response) => response.url.includes("/api/products/") && response.status === 200,
    ),
  );
  assert.ok(
    responses.some(
      (response) => response.url.includes("/api/categories/") && response.status === 200,
    ),
  );
  assert.deepEqual(
    responses.filter((response) => response.status >= 400),
    [],
  );
  assert.deepEqual(
    failures.filter((failure) => failure.url?.includes(":8000/api/") && !failure.canceled),
    [],
  );
  assert.deepEqual(exceptions, []);
  assert.deepEqual(consoleErrors, []);
  checks.push("No browser console errors, uncaught exceptions, or failed API responses");
  await call("Page.captureScreenshot", { format: "png" }).then((result) =>
    fs.writeFile(
      new URL(
        empty ? "../node_modules/browser-empty.png" : "../node_modules/browser-integration.png",
        import.meta.url,
      ),
      Buffer.from(result.data, "base64"),
    ),
  );
} finally {
  const report = { checks, responses, consoleErrors, exceptions, failures };
  await fs.writeFile(
    new URL(
      empty
        ? "../node_modules/browser-empty-result.json"
        : "../node_modules/browser-integration-result.json",
      import.meta.url,
    ),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await call("Page.close");
  socket.close();
}
