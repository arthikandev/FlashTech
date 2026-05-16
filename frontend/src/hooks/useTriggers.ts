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

type Options = {
  embedKey: string;
  useAuthQueries: boolean;
};

export function useTriggers(
  businessId: Id<"businesses"> | undefined,
  { embedKey, useAuthQueries }: Options
) {
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const convexReady = !clerkEnabled || (isAuthenticated && !convexAuthLoading);
  const useAuth = useAuthQueries && convexReady;

  const authTriggers = useQuery(
    api.triggers.listByBusiness,
    useAuth && businessId ? { businessId } : "skip"
  ) as TriggerRow[] | undefined;

  const previewTriggers = useQuery(
    api.triggers.listByBusinessDemo,
    !useAuth && embedKey ? { embedKey } : "skip"
  ) as TriggerRow[] | undefined;

  const triggers = useAuth ? authTriggers : previewTriggers;

  return { triggers, loading: triggers === undefined };
}
