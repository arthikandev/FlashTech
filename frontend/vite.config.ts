import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const backendTarget =
    env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:3001";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
    server: {
      port: 5173,
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
      proxy: {
        "/app": {
          target: backendTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/app/, ""),
        },
      },
    },
  };
});
