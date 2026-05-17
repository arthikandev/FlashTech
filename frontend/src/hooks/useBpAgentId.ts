import { useMemo } from "react";
import { DEMO_AGENT_ID } from "@/components/BeyondPresenceFrame";
import type { Business } from "@/convex/types";
import { useTenant } from "@/tenant/TenantContext";

const envDemoAgentId =
  typeof import.meta.env.VITE_BP_DEMO_AGENT_ID === "string"
    ? import.meta.env.VITE_BP_DEMO_AGENT_ID.trim()
    : "";

/** Tenant bpAgentId → env demo → built-in demo fallback. */
export function resolveBpAgentId(business?: Business | null | undefined): string {
  const fromBusiness = business?.avatarConfig?.bpAgentId?.trim();
  if (fromBusiness) return fromBusiness;
  return envDemoAgentId || DEMO_AGENT_ID;
}

/**
 * Resolves Beyond Presence agent id for the current canvas tenant.
 */
export function useBpAgentId(): string {
  const { business, signedIn, hasMembershipForEmbed } = useTenant();

  return useMemo(() => {
    const fromBusiness = business?.avatarConfig?.bpAgentId?.trim();
    if (fromBusiness) return fromBusiness;
    if (signedIn && hasMembershipForEmbed) {
      if (import.meta.env.DEV) {
        console.warn(
          "[PresenceIQ] No bpAgentId on workspace. Set it in Canvas → Settings or seed Convex."
        );
      }
      return "";
    }
    return resolveBpAgentId(business);
  }, [business, signedIn, hasMembershipForEmbed]);
}
