import OpenAI from "openai";
import { z } from "zod";
import type { IntelligenceResult } from "./types";

const intentSchema = z.object({
  intentScore: z.number().min(0).max(100),
  personalisedOpener: z.string(),
  recommendedAction: z.string(),
  signals: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are PresenceIQ, an enterprise pre-conversation intelligence engine.
Given a visitor's behaviour and CRM data, output a JSON object ONLY:
{
  "intentScore": <number 0-100>,
  "personalisedOpener": "<one sentence the avatar speaks first — use visitor name if known>",
  "recommendedAction": "<internal action for sales team>",
  "signals": ["<short tags>"]
}
Rules:
- Opener must be specific to pages visited and CRM notes, never generic.
- For bank industry: formal, trustworthy tone.
- If pricing page visited 3+ times: mention plan comparison explicitly.
- intentScore > 80 means hot lead.`;

export const DEMO_SARANGAN_INTELLIGENCE: IntelligenceResult = {
  intentScore: 96,
  personalisedOpener:
    "Welcome back Sarangan — I see you have been comparing our Gold and Platinum plans. Shall I walk you through the key difference?",
  recommendedAction: "Offer account opening walkthrough",
  signals: ["return_visitor", "pricing_page_x3", "high_engagement"],
  computedAt: Date.now(),
};

function buildUserPrompt(context: {
  industry: string;
  businessName: string;
  visitorName?: string;
  returnCount: number;
  language: string;
  timeOnSiteSeconds: number;
  pagesSummary: string;
  crmNotes?: string;
  churnRisk?: string;
}): string {
  return [
    `Industry: ${context.industry}`,
    `Business: ${context.businessName}`,
    `Visitor name: ${context.visitorName ?? "unknown"}`,
    `Return visits: ${context.returnCount}`,
    `Language: ${context.language}`,
    `Time on site (seconds): ${context.timeOnSiteSeconds}`,
    `Pages visited: ${context.pagesSummary}`,
    `CRM notes: ${context.crmNotes ?? "none"}`,
    `Churn risk: ${context.churnRisk ?? "unknown"}`,
  ].join("\n");
}

function summarizePages(
  pageHistory: Array<{ path: string; title?: string }>
): string {
  const counts = new Map<string, number>();
  for (const p of pageHistory) {
    counts.set(p.path, (counts.get(p.path) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([path, n]) => (n > 1 ? `${path} (x${n})` : path))
    .join(", ");
}

export async function scoreIntent(context: {
  industry: string;
  businessName: string;
  visitorName?: string;
  returnCount: number;
  language: string;
  timeOnSiteMs: number;
  pageHistory: Array<{ path: string; title?: string }>;
  crmNotes?: string;
  churnRisk?: string;
  fingerprint?: string;
}): Promise<IntelligenceResult> {
  if (
    context.fingerprint === "demo-sarangan-fp" ||
    context.visitorName?.toLowerCase() === "sarangan"
  ) {
    return { ...DEMO_SARANGAN_INTELLIGENCE, computedAt: Date.now() };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      intentScore: Math.min(70 + context.returnCount * 5, 95),
      personalisedOpener: context.visitorName
        ? `Welcome back ${context.visitorName} — how can I help you today?`
        : "Welcome — how can I help you today?",
      recommendedAction: "Continue conversation",
      signals: ["no_openai_key_fallback"],
      computedAt: Date.now(),
    };
  }

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.3,
    max_tokens: 400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt({
          industry: context.industry,
          businessName: context.businessName,
          visitorName: context.visitorName,
          returnCount: context.returnCount,
          language: context.language,
          timeOnSiteSeconds: Math.round(context.timeOnSiteMs / 1000),
          pagesSummary: summarizePages(context.pageHistory),
          crmNotes: context.crmNotes,
          churnRisk: context.churnRisk,
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
  const parsed = intentSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error("OpenAI returned invalid intent JSON");
  }

  return {
    ...parsed.data,
    computedAt: Date.now(),
  };
}
