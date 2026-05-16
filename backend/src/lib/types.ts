export interface IntelligenceResult {
  intentScore: number;
  personalisedOpener: string;
  recommendedAction: string;
  signals: string[];
  computedAt: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}
