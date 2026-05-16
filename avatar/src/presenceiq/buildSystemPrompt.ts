export type PipelineIntelligence = {
  intentScore: number;
  personalisedOpener: string;
  recommendedAction: string;
  signals?: string[];
};

export type PipelineVisitor = {
  name?: string;
  language?: string;
  crmId?: string;
  returnCount?: number;
};

export type PipelineBusiness = {
  name: string;
  industry: string;
  personaTone?: string;
};

export function buildSystemPrompt(
  intelligence: PipelineIntelligence,
  visitor: PipelineVisitor,
  business: PipelineBusiness
): string {
  const name = visitor.name ?? "the visitor";
  const signals = intelligence.signals?.join(", ") ?? "general interest";
  return [
    `You are a ${business.personaTone ?? "professional"} AI assistant for ${business.name} (${business.industry}).`,
    `Visitor: ${name}. Language: ${visitor.language ?? "en"}. Return visits: ${visitor.returnCount ?? 1}.`,
    `Intent score: ${intelligence.intentScore}/100. Signals: ${signals}.`,
    `Recommended action: ${intelligence.recommendedAction}.`,
    `Open with this personalised line (then continue naturally): "${intelligence.personalisedOpener}"`,
    "Be concise, helpful, and enterprise-appropriate. Do not mention internal scores or CRM systems.",
  ].join("\n");
}
