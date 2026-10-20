import { defineConfig, loadEnv } from "vite";
import { resolveApiBaseUrl } from "./src/services/api-url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    resolveApiBaseUrl(env["VITE_API_BASE_URL"], process.env["NODE_ENV"] !== "development");
  }
  return {
    plugins: [
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({ server: { entry: "server" } }),
      ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
      react(),
      tailwindcss(),
    ],
    css: { transformer: "lightningcss" },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});
