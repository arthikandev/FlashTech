import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loadRuntimeConfigFile } from "./lib/runtimeConfig";
import { initTheme } from "./lib/theme";
import "./index.css";

async function bootstrap() {
  initTheme();
  await loadRuntimeConfigFile();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
