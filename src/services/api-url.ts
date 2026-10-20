/** Shared by runtime configuration and the production build preflight. */
export function resolveApiBaseUrl(value: string | undefined, production: boolean): string {
  const configured = value?.trim();
  if (!configured && !production) return "http://localhost:8000";
  if (!configured) {
    throw new Error(
      "Set VITE_API_BASE_URL to your publicly hosted Django HTTPS origin before building for production.",
    );
  }
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("VITE_API_BASE_URL must be an absolute HTTP(S) origin.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "VITE_API_BASE_URL must be an HTTP(S) origin without credentials, paths, query parameters or fragments.",
    );
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const loopback =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "[::1]" ||
    host === "0.0.0.0" ||
    /^127\./.test(host);
  if (production && (url.protocol !== "https:" || loopback)) {
    throw new Error(
      "Production VITE_API_BASE_URL must use HTTPS and must not point to localhost or a loopback address.",
    );
  }
  return url.origin;
}
