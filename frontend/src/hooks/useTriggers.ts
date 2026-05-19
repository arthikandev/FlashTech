import { useConvexAuth, useQuery } from "convex/react";
import { api, clerkEnabled } from "@/convex/api";
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
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const convexReady = !clerkEnabled || (isAuthenticated && !convexAuthLoading);

  const triggers = useQuery(
    api.triggers.listByBusiness,
    convexReady && businessId ? { businessId } : "skip"
  ) as TriggerRow[] | undefined;

  return { triggers, loading: triggers === undefined };
}
