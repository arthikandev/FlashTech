import { useQuery } from "convex/react";
import { api } from "@/convex/api";
import type { Id } from "@/convex/ids";

export type ConversationRow = {
  _id: Id<"conversations">;
  visitorId: Id<"visitors">;
  businessId: Id<"businesses">;
  outcome: string;
  duration: number;
  endedAt: number;
  sentimentArc?: Array<{ turn: number; score: number }>;
  transcript?: Array<{ role: string; text: string; timestamp?: number }>;
};

export function useConversationByVisitor(visitorId: Id<"visitors"> | null) {
  const conversation = useQuery(
    api.conversations.getByVisitor,
    visitorId ? { visitorId } : "skip"
  ) as ConversationRow | null | undefined;

  return { conversation, loading: visitorId != null && conversation === undefined };
}
