/**
 * Client-safe API references (paths match backend/convex).
 */
import type { FunctionReference } from "convex/server";

function queryRef<Args extends Record<string, unknown>, Result>(
  name: string
): FunctionReference<"query", "public", Args, Result> {
  return name as unknown as FunctionReference<"query", "public", Args, Result>;
}

function mutationRef<Args extends Record<string, unknown>, Result>(
  name: string
): FunctionReference<"mutation", "public", Args, Result> {
  return name as unknown as FunctionReference<"mutation", "public", Args, Result>;
}

export const api = {
  intelligence: {
    listLiveSessions: queryRef<{ businessId: string }, unknown>(
      "intelligence:listLiveSessions"
    ),
    listLiveSessionsDemo: queryRef<{ embedKey: string }, unknown>(
      "intelligence:listLiveSessionsDemo"
    ),
    getSessionDetail: queryRef<{ visitorId: string }, unknown>(
      "intelligence:getSessionDetail"
    ),
    getSessionDetailDemo: queryRef<{ embedKey: string; visitorId: string }, unknown>(
      "intelligence:getSessionDetailDemo"
    ),
    listByBusiness: queryRef<{ businessId: string }, unknown>(
      "intelligence:listByBusiness"
    ),
  },
  conversations: {
    getByVisitor: queryRef<{ visitorId: string }, unknown>(
      "conversations:getByVisitor"
    ),
  },
  triggers: {
    listByBusiness: queryRef<{ businessId: string }, unknown>(
      "triggers:listByBusiness"
    ),
  },
  businesses: {
    getByEmbedKey: queryRef<{ embedKey: string }, unknown>(
      "businesses:getByEmbedKey"
    ),
  },
  businessMembers: {
    listForCurrentUser: queryRef<Record<string, never>, unknown>(
      "businessMembers:listForCurrentUser"
    ),
    linkCurrentUser: mutationRef<
      { businessId: string; role?: "admin" | "viewer" },
      unknown
    >("businessMembers:linkCurrentUser"),
  },
};

export const clerkEnabled = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim()
);
