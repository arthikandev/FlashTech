import { useEffect } from "react";
import { goToBackendDashboard } from "@/lib/backendUrl";

/** Sends users to the backend app (friend's dashboard UI). */
export function BackendRedirect() {
  useEffect(() => {
    goToBackendDashboard();
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground text-sm">
      Opening dashboard…
    </div>
  );
}
