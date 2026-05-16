/**
 * Client-safe API references (paths match backend/convex).
 * Do not import backend/convex/_generated/api.js — it pulls in convex/server.
 */
import type { FunctionReference } from "convex/server";

function queryRef<Args extends Record<string, unknown>, Result>(
  name: string
): FunctionReference<"query", "public", Args, Result> {
  return name as unknown as FunctionReference<"query", "public", Args, Result>;
}

export const api = {
  intelligence: {
    listLiveSessions: queryRef<{ businessId: string }, unknown>(
      "intelligence:listLiveSessions"
    ),
    getSessionDetail: queryRef<{ visitorId: string }, unknown>(
      "intelligence:getSessionDetail"
    ),
  },
  businesses: {
    getByEmbedKey: queryRef<{ embedKey: string }, unknown>(
      "businesses:getByEmbedKey"
    ),
  },
};
