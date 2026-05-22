export interface PipelineIntelligence {
  intentScore: number;
  personalisedOpener: string;
  recommendedAction: string;
  signals: string[];
  computedAt: number;
}

export interface PipelineVisitor {
  name?: string;
  language: string;
  crmId?: string;
}

export interface PipelineBusiness {
  name: string;
  industry: string;
  personaTone?: string;
}

export interface PipelineBeyondPresence {
  synced: boolean;
  reason?: string;
}

export interface PipelineData {
  intelligence: PipelineIntelligence;
  visitor: PipelineVisitor;
  business: PipelineBusiness;
  pipelineMs: number;
  beyondPresence?: PipelineBeyondPresence;
  syncStatus?: "complete" | "pending" | "failed";
}

export async function fetchPipeline(
  backendUrl: string,
  visitorId: string,
  businessId: string,
  waitForCrmMs = 200,
  operatorMessage?: string
): Promise<PipelineData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${backendUrl}/api/pipeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        businessId,
        waitForCrmMs,
        ...(operatorMessage?.trim() ? { operatorMessage: operatorMessage.trim() } : {}),
      }),
      signal: controller.signal,
    });

    const json = (await res.json()) as {
      success?: boolean;
      data?: PipelineData & {
        beyondPresence?: PipelineBeyondPresence;
        syncStatus?: "complete" | "pending" | "failed";
      };
      message?: string;
      error?: string;
    };

    if (!res.ok || !json.success || !json.data) {
      throw new Error(
        json.message ?? json.error ?? `Pipeline failed (${res.status})`
      );
    }

    if (json.data.pipelineMs > 1800) {
      console.warn(
        `[PresenceIQ] pipelineMs ${json.data.pipelineMs} exceeds 1800ms target`
      );
    }

    return json.data;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildSystemPrompt(data: PipelineData): string {
  const { intelligence, visitor, business } = data;
  const signals =
    intelligence.signals?.length > 0
      ? `Signals: ${intelligence.signals.join(", ")}.`
      : "";

  const tone = business.personaTone ?? "professional";
  return [
    `You are a ${tone} assistant for ${business.name} (${business.industry}).`,
    `Visitor: ${visitor.name ?? "guest"} (language: ${visitor.language}).`,
    `Intent score: ${intelligence.intentScore}/100.`,
    `Recommended action: ${intelligence.recommendedAction}.`,
    signals,
    `Open with exactly: "${intelligence.personalisedOpener}"`,
  ]
    .filter(Boolean)
    .join("\n");
}
