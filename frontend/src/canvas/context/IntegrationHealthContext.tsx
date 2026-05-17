import { createContext, useContext, type ReactNode } from "react";
import {
  useIntegrationHealth,
  type IntegrationHealth,
} from "../hooks/useIntegrationHealth";

const IntegrationHealthContext = createContext<IntegrationHealth | null>(null);

export function IntegrationHealthProvider({ children }: { children: ReactNode }) {
  const health = useIntegrationHealth();
  return (
    <IntegrationHealthContext.Provider value={health}>
      {children}
    </IntegrationHealthContext.Provider>
  );
}

/** Shared health from Canvas shell — one `/api/health?probes=1` poll per canvas session. */
export function useCanvasIntegrationHealth(): IntegrationHealth {
  const ctx = useContext(IntegrationHealthContext);
  if (!ctx) {
    throw new Error("useCanvasIntegrationHealth must be used within IntegrationHealthProvider");
  }
  return ctx;
}
