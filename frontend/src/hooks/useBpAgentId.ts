import { useMemo } from "react";
import { useTenant } from "@/tenant/TenantContext";

export type BpAgentResolve = {
  /** Agent id passed to Bey.chat / pipeline (empty = show setup UI). */
  agentId: string;
  /** User must set their own agent in workspace settings. */
  needsSetup: boolean;
};

/** Resolves Beyond Presence agent id for the current canvas tenant. */
export function useBpAgentResolve(): BpAgentResolve {
  const { business } = useTenant();

  return useMemo(() => {
    const raw = business?.avatarConfig?.bpAgentId?.trim() ?? "";
    return raw === ""
      ? { agentId: "", needsSetup: true }
      : { agentId: raw, needsSetup: false };
  }, [business?.avatarConfig?.bpAgentId]);
}

export function useBpAgentId(): string {
  return useBpAgentResolve().agentId;
}
