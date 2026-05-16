import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command }) => {
  if (command === "build") {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, "src/index.ts"),
          name: "PresenceIQAvatar",
          fileName: "presenceiq-avatar",
          formats: ["iife"],
        },
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
          output: {
            entryFileNames: "presenceiq-avatar.js",
          },
        },
      },
      envPrefix: "VITE_",
    };
  }

  return {
    root: resolve(__dirname, "dev"),
    envDir: resolve(__dirname),
    server: {
      port: 5174,
    },
  };
});
