import OpenAI from "openai";
import { z } from "zod";
import type { Id } from "../../convex/_generated/dataModel";
import { api, getConvexClient } from "./convex";
import type { IntelligenceResult, PostCallAnalysis, SessionOutcome } from "./types";

const INTENT_MODEL = "gpt-4o-mini";
const INTENT_MAX_TOKENS = 300;
const OPENAI_TIMEOUT_MS = 1200;
const SCORE_CACHE_TTL_MS = 60_000;

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
  operatorMessage?: string;
}): string {
  const lines = [
    `Industry: ${context.industry}`,
    `Business: ${context.businessName}`,
    `Visitor name: ${context.visitorName ?? "unknown"}`,
    `Return visits: ${context.returnCount}`,
    `Language: ${context.language}`,
    `Time on site (seconds): ${context.timeOnSiteSeconds}`,
    `Pages visited: ${context.pagesSummary}`,
    `CRM notes: ${context.crmNotes ?? "none"}`,
    `Churn risk: ${context.churnRisk ?? "unknown"}`,
  ];
  if (context.operatorMessage?.trim()) {
    lines.push(
      `Operator test prompt (incorporate into personalisedOpener when relevant): ${context.operatorMessage.trim()}`
    );
  }
  return lines.join("\n");
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

export function heuristicIntentFallback(context: {
  visitorName?: string;
  returnCount: number;
  industry?: string;
}): IntelligenceResult {
  const score = Math.min(70 + context.returnCount * 5, 95);
  const formal = context.industry?.toLowerCase().includes("bank");
  const opener = context.visitorName
    ? formal
      ? `Welcome back ${context.visitorName} — how may I assist you today?`
      : `Welcome back ${context.visitorName} — how can I help you today?`
    : formal
      ? "Welcome — how may I assist you today?"
      : "Welcome — how can I help you today?";

  return {
    intentScore: score,
    personalisedOpener: opener,
    recommendedAction: "Continue conversation",
    signals: ["heuristic_fallback"],
    computedAt: Date.now(),
  };
}

function timeoutReject(ms: number, label: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(label)), ms);
  });
}

export async function getCachedIntelligence(
  visitorId: Id<"visitors">,
  ttlMs = SCORE_CACHE_TTL_MS
): Promise<IntelligenceResult | null> {
  const convex = getConvexClient();
  const row = await convex.query(api.intelligence.getLatestByVisitor, { visitorId });
  if (!row) return null;

  const age = Date.now() - row.computedAt;
  if (age > ttlMs) return null;

  return {
    intentScore: row.intentScore,
    personalisedOpener: row.personalisedOpener,
    recommendedAction: row.recommendedAction,
    signals: [...(row.signals ?? []), "cached"],
    computedAt: row.computedAt,
  };
}

async function callOpenAIIntent(context: {
  industry: string;
  businessName: string;
  visitorName?: string;
  returnCount: number;
  language: string;
  timeOnSiteMs: number;
  pageHistory: Array<{ path: string; title?: string }>;
  crmNotes?: string;
  churnRisk?: string;
  operatorMessage?: string;
  model?: string;
}): Promise<IntelligenceResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("OPENAI_API_KEY is required in production");
    }
    return heuristicIntentFallback({
      visitorName: context.visitorName,
      returnCount: context.returnCount,
      industry: context.industry,
    });
  }

  const openai = new OpenAI({ apiKey });
  const model =
    context.model === "gpt-4o" || context.model === "gpt-4o-mini"
      ? context.model
      : INTENT_MODEL;
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    max_tokens: INTENT_MAX_TOKENS,
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
          operatorMessage: context.operatorMessage,
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

export async function scoreIntent(context: {
  visitorId?: Id<"visitors">;
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
  operatorMessage?: string;
  model?: string;
}): Promise<IntelligenceResult> {
  if (
    context.fingerprint === "demo-sarangan-fp" ||
    context.visitorName?.toLowerCase() === "sarangan"
  ) {
    return { ...DEMO_SARANGAN_INTELLIGENCE, computedAt: Date.now() };
  }

  if (context.visitorId && !context.operatorMessage?.trim()) {
    const cached = await getCachedIntelligence(context.visitorId);
    if (cached) return cached;
  }

  try {
    const result = await Promise.race([
      callOpenAIIntent(context),
      timeoutReject(OPENAI_TIMEOUT_MS, "OPENAI_TIMEOUT"),
    ]);
    return result;
  } catch (err) {
    console.warn("[openai] scoreIntent fallback", err);
    return heuristicIntentFallback({
      visitorName: context.visitorName,
      returnCount: context.returnCount,
      industry: context.industry,
    });
  }
}

const postCallSchema = z.object({
  outcome: z.enum(["converted", "escalated", "abandoned", "informational"]),
  summary: z.string(),
  actionItems: z.array(z.string()),
  sentimentArc: z.array(
    z.object({
      turn: z.number(),
      score: z.number().min(0).max(1),
    })
  ),
});

/** POST-call: summarise transcript and extract outcome / action items. */
export async function analyzePostCallSession(args: {
  transcript: Array<{ role: string; text: string }>;
  preIntentScore: number;
  visitorName?: string;
  businessName: string;
}): Promise<PostCallAnalysis | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || args.transcript.length === 0) return null;

  const openai = new OpenAI({ apiKey });
  const transcriptText = args.transcript
    .map((t) => `${t.role}: ${t.text}`)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You analyse a short avatar sales conversation. Output JSON only:
{ "outcome": "converted"|"escalated"|"abandoned"|"informational",
  "summary": "<one sentence>",
  "actionItems": ["<tasks for sales team>"],
  "sentimentArc": [{ "turn": 1, "score": 0.0-1.0 }] }
Pre-call intent was ${args.preIntentScore}/100. Use "converted" if they agreed to open account, book, or buy.`,
        },
        {
          role: "user",
          content: `Business: ${args.businessName}\nVisitor: ${args.visitorName ?? "guest"}\n\nTranscript:\n${transcriptText}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = postCallSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    return {
      outcome: parsed.data.outcome as SessionOutcome,
      summary: parsed.data.summary,
      actionItems: parsed.data.actionItems,
      sentimentArc: parsed.data.sentimentArc,
    };
  } catch {
    return null;
  }
}
