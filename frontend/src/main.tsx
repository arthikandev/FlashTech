import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initRuntimeConfig } from "./lib/backendUrl";
import { initTheme } from "./lib/theme";
import "./index.css";

async function bootstrap() {
  initTheme();
  await initRuntimeConfig();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
