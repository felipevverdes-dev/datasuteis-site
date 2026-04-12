import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { createBusinessDayApiRouter } from "./server/business-days-api";
import { createConnectionToolRouter } from "./server/connection-tools";
import { createExternalDataRouter } from "./server/external-data";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "datasuteis-widgets-api",
      configureServer(server) {
        server.middlewares.use(createBusinessDayApiRouter());
        server.middlewares.use(createConnectionToolRouter());
        server.middlewares.use(createExternalDataRouter());
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    cssCodeSplit: true,
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "client", "index.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("react") ||
            id.includes("scheduler") ||
            id.includes("wouter")
          ) {
            return "vendor-react";
          }

          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
