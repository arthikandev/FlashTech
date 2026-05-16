import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";

export type TriggerRow = {
  _id: Id<"triggers">;
  businessId: Id<"businesses">;
  condition: string;
  threshold?: number;
  action: string;
  webhookUrl: string;
  isActive: boolean;
  lastFiredAt?: number;
};

export function useTriggers(businessId: Id<"businesses"> | undefined) {
  const triggers = useQuery(
    api.triggers.listByBusiness,
    businessId ? { businessId } : "skip"
  ) as TriggerRow[] | undefined;

  return { triggers, loading: triggers === undefined };
}
