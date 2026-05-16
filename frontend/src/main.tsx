import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initBackendUrl } from "./lib/backendUrl";
import { initTheme } from "./lib/theme";
import "./index.css";

async function bootstrap() {
  initTheme();
  await initBackendUrl();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
