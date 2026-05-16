import type { Id } from "../../../backend/convex/_generated/dataModel";

export type Business = {
  _id: Id<"businesses">;
  name: string;
  embedKey: string;
};

export type SessionDetailResult = {
  visitor: {
    _id: Id<"visitors">;
    fingerprint: string;
    returnCount: number;
    crmData?: { name?: string };
  };
  intelligence: {
    intentScore?: number;
    personalisedOpener?: string;
    recommendedAction?: string;
  } | null;
  conversation: {
    outcome?: string;
    actionItems?: string[];
    transcript?: Array<{ role: string; text: string }>;
  } | null;
};
