import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "@/services/api-url";

describe("API origin configuration", () => {
  it("keeps the local development default", () => {
    expect(resolveApiBaseUrl(undefined, false)).toBe("http://localhost:8000");
    expect(resolveApiBaseUrl("http://127.0.0.1:8000", false)).toBe("http://127.0.0.1:8000");
  });
  it("normalizes the configured public backend origin", () => {
    expect(resolveApiBaseUrl(" https://api.example.com/ ", true)).toBe("https://api.example.com");
  });
  it.each([
    undefined,
    "",
    "http://api.example.com",
    "http://localhost:8000",
    "https://localhost",
    "https://localhost.",
    "https://sub.localhost",
    "https://127.0.0.1",
    "https://127.1",
    "https://[::1]",
    "https://0.0.0.0",
  ])("rejects unsafe production origins: %s", (value) => {
    expect(() => resolveApiBaseUrl(value, true)).toThrow();
  });
  it.each([
    "not-a-url",
    "ftp://api.example.com",
    "https://user:password@api.example.com",
    "https://api.example.com/api",
    "https://api.example.com/?key=value",
    "https://api.example.com/#fragment",
  ])("rejects malformed origins: %s", (value) => {
    expect(() => resolveApiBaseUrl(value, false)).toThrow();
  });
});
