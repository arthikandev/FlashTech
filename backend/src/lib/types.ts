export interface IntelligenceResult {
  intentScore: number;
  personalisedOpener: string;
  recommendedAction: string;
  signals: string[];
  computedAt: number;
}

export type SessionOutcome =
  | "converted"
  | "escalated"
  | "abandoned"
  | "informational";

export interface PostCallAnalysis {
  outcome: SessionOutcome;
  sentimentArc: Array<{ turn: number; score: number }>;
  actionItems: string[];
  summary: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}
