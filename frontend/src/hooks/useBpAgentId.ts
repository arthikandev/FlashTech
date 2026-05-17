import { useMemo } from "react";
import { DEMO_AGENT_ID } from "@/components/BeyondPresenceFrame";
import { CANONICAL_BP_AGENT_ID } from "@/lib/bpAgentDefaults";
import type { Business } from "@/convex/types";
import { useTenant } from "@/tenant/TenantContext";

const envDemoAgentId =
  typeof import.meta.env.VITE_BP_DEMO_AGENT_ID === "string"
    ? import.meta.env.VITE_BP_DEMO_AGENT_ID.trim()
    : "";

function isPlaceholderAgentId(id: string | undefined): boolean {
  const t = id?.trim();
  if (!t) return true;
  return t === CANONICAL_BP_AGENT_ID || t === DEMO_AGENT_ID;
}

/** Tenant bpAgentId → env demo → built-in demo fallback (anonymous / demo only). */
export function resolveBpAgentId(business?: Business | null | undefined): string {
  const fromBusiness = business?.avatarConfig?.bpAgentId?.trim();
  if (fromBusiness && !isPlaceholderAgentId(fromBusiness)) return fromBusiness;
  return envDemoAgentId || DEMO_AGENT_ID;
}

export type BpAgentResolve = {
  /** Agent id passed to Bey.chat / pipeline (empty = show setup UI). */
  agentId: string;
  /** User must set their own agent in workspace settings. */
  needsSetup: boolean;
};

/**
 * Resolves Beyond Presence agent id for the current canvas tenant.
 * Signed-in workspaces with only the shared placeholder id are treated as unset.
 */
export function useBpAgentId(): string {
  const resolved = useBpAgentResolve();
  return resolved.agentId;
}

export function useBpAgentResolve(): BpAgentResolve {
  const { business, signedIn, hasMembershipForEmbed } = useTenant();

  return useMemo(() => {
    const fromBusiness = business?.avatarConfig?.bpAgentId?.trim();
    const isMember = signedIn && hasMembershipForEmbed;

    if (fromBusiness && !isPlaceholderAgentId(fromBusiness)) {
      return { agentId: fromBusiness, needsSetup: false };
    }

    if (isMember) {
      if (envDemoAgentId) {
        return { agentId: envDemoAgentId, needsSetup: false };
      }
      if (fromBusiness && isPlaceholderAgentId(fromBusiness)) {
        return { agentId: "", needsSetup: true };
      }
      return { agentId: "", needsSetup: true };
    }

    return { agentId: resolveBpAgentId(business), needsSetup: false };
  }, [business, signedIn, hasMembershipForEmbed]);
}
