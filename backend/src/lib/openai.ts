import { createHash } from "node:crypto";
import OpenAI from "openai";
import { z } from "zod";
import type { Id } from "../../convex/_generated/dataModel";
import { api, getConvexClient } from "./convex";
import type {
  IntelligenceResult,
  IntelligenceSignal,
  PostCallAnalysis,
} from "./types";

const INTENT_MODEL = "gpt-4o-mini";
const INTENT_MAX_TOKENS = 300;
const OPENAI_TIMEOUT_MS = 4_000;
const SCORE_CACHE_TTL_MS = 60_000;

function operatorHash(operatorMessage?: string): string {
  const trimmed = operatorMessage?.trim() ?? "";
  if (!trimmed) return "none";
  return createHash("sha1").update(trimmed).digest("hex").slice(0, 12);
}

type OperatorCacheEntry = { result: IntelligenceResult; expiresAt: number };
const operatorScoreCache = new Map<string, OperatorCacheEntry>();

function operatorCacheKey(visitorId: Id<"visitors">, hash: string): string {
  return `${visitorId}::${hash}`;
}

function readOperatorCache(
  visitorId: Id<"visitors">,
  hash: string
): IntelligenceResult | null {
  const key = operatorCacheKey(visitorId, hash);
  const entry = operatorScoreCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    operatorScoreCache.delete(key);
    return null;
  }
  return {
    ...entry.result,
    signals: [...entry.result.signals, "cached"],
  };
}

function writeOperatorCache(
  visitorId: Id<"visitors">,
  hash: string,
  result: IntelligenceResult
): void {
  operatorScoreCache.set(operatorCacheKey(visitorId, hash), {
    result,
    expiresAt: Date.now() + SCORE_CACHE_TTL_MS,
  });
}

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
- The "personalisedOpener" MUST be written in the language code given by the "Language" field of the user prompt:
  • "en" → English.
  • "ta" → Tamil (write in Tamil script — தமிழ்).
  • "si" → Sinhala (write in Sinhala script — සිංහල).
  Any other code → English.
- "recommendedAction" and "signals" stay in English regardless.
- For bank industry: formal, trustworthy tone.
- If pricing page visited 3+ times: mention plan comparison explicitly.
- intentScore > 80 means hot lead.`;

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

function countPricingHits(
  pageHistory?: Array<{ path: string; title?: string }>
): number {
  if (!pageHistory?.length) return 0;
  let n = 0;
  for (const p of pageHistory) {
    if (p.path?.toLowerCase().includes("pricing")) n += 1;
  }
  return n;
}

type HeuristicTopic = {
  signal: IntelligenceSignal;
  keywords: string[];
  opener: (name: string | undefined, formal: boolean) => string;
  action: string;
  boost: number;
};

const HEURISTIC_TOPICS: HeuristicTopic[] = [
  {
    signal: "pricing_interest",
    keywords: ["pricing", "price", "plan", "tier", "cost", "compare"],
    opener: (name) =>
      name
        ? `Welcome back ${name} — I noticed you've been comparing plans. Want me to walk you through the differences?`
        : "I see you've been comparing plans — happy to walk you through what fits your team best.",
    action: "Compare plan options with visitor",
    boost: 10,
  },
  {
    signal: "trial_interest",
    keywords: ["trial", "free", "evaluate", "demo"],
    opener: (name) =>
      name
        ? `${name}, on day six of your trial — most teams start their first report around now. Should I help you set that up?`
        : "Looks like you're mid-trial — most teams start their first report around day six. Want me to help you set that up?",
    action: "Offer trial-to-paid onboarding",
    boost: 8,
  },
  {
    signal: "booking_interest",
    keywords: ["book", "booking", "reservation", "stay", "room"],
    opener: (name) =>
      name
        ? `Welcome back ${name} — same suite as last time, or shall I show you our new packages?`
        : "Looking at a booking? I can check live availability and pull together the best package for your dates.",
    action: "Offer booking assistance and upsell",
    boost: 10,
  },
  {
    signal: "appointment_interest",
    keywords: ["appointment", "doctor", "consult", "schedule"],
    opener: (name) =>
      name
        ? `Welcome back ${name} — are you booking for yourself or a family member? I'll route you to the right specialist.`
        : "Welcome — are you booking for yourself or a family member? I can route you to the right specialist.",
    action: "Capture appointment intent (specialty + language)",
    boost: 10,
  },
  {
    signal: "cart_interest",
    keywords: ["cart", "checkout", "abandon", "buy"],
    opener: (name) =>
      name
        ? `Hi ${name} — your cart from earlier is still saved. Want me to check stock or apply a returning-customer code?`
        : "Your cart is still saved — want me to check stock or apply a returning-customer code?",
    action: "Recover cart and offer time-limited incentive",
    boost: 12,
  },
  {
    signal: "loan_interest",
    keywords: ["loan", "mortgage", "emi", "lending", "borrow"],
    opener: (name) =>
      name
        ? `Welcome back ${name} — I can pre-check eligibility before you speak with our loan officer. Shall we start?`
        : "Looking at our loan options? I can pre-check eligibility before you speak with our officer.",
    action: "Pre-qualify loan inquiry and route to officer",
    boost: 10,
  },
  {
    signal: "candidate_interest",
    keywords: ["role", "job", "interview", "cv", "resume", "candidate"],
    opener: (name) =>
      name
        ? `Welcome back ${name} — I've shortlisted two roles that match your background. Want a quick walk-through?`
        : "I can match your background to our open roles — would you like a quick walk-through?",
    action: "Surface matching roles and offer screening slot",
    boost: 8,
  },
  {
    signal: "churn_interest",
    keywords: ["cancel", "leave", "close", "downgrade", "complaint"],
    opener: (name) =>
      name
        ? `${name}, thanks for staying with us — I'd like to understand what's not working before we make any changes.`
        : "Thanks for being a customer — I'd like to understand what's not working before we make any changes.",
    action: "De-escalate; route to retention specialist",
    boost: 15,
  },
];

function matchTopic(
  text: string | undefined
): HeuristicTopic | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const topic of HEURISTIC_TOPICS) {
    if (topic.keywords.some((k) => lower.includes(k))) return topic;
  }
  return null;
}

function pageHistoryText(
  pageHistory?: Array<{ path: string; title?: string }>
): string {
  if (!pageHistory?.length) return "";
  return pageHistory.map((p) => `${p.path} ${p.title ?? ""}`).join(" ");
}

export function heuristicIntentFallback(context: {
  visitorName?: string;
  returnCount: number;
  industry?: string;
  pageHistory?: Array<{ path: string; title?: string }>;
  operatorMessage?: string;
}): IntelligenceResult {
  const pricingHits = countPricingHits(context.pageHistory);
  const formal = context.industry?.toLowerCase().includes("bank") ?? false;

  const haystack = [
    context.operatorMessage,
    pageHistoryText(context.pageHistory),
  ]
    .filter(Boolean)
    .join(" ");

  const topic = matchTopic(haystack);

  const signals: IntelligenceSignal[] = ["heuristic_fallback"];
  let score = Math.min(70 + context.returnCount * 5 + pricingHits * 5, 95);
  let opener: string;
  let action: string;

  if (topic) {
    signals.push(topic.signal);
    score = Math.min(score + topic.boost, 98);
    opener = topic.opener(context.visitorName, formal);
    action = topic.action;
  } else if (context.operatorMessage?.trim()) {
    // Generic scenario — echo it back so the user sees their input reflected.
    const sentence = context.operatorMessage.trim().replace(/[.!?]+$/, "");
    opener = context.visitorName
      ? `Welcome back ${context.visitorName} — I see ${sentence.toLowerCase()}. How can I help?`
      : `Welcome — I see ${sentence.toLowerCase()}. How can I help?`;
    action = "Continue conversation based on operator scenario";
  } else {
    const mention = pricingHits > 0 ? " I can walk you through our plan options." : "";
    const greeting = formal ? "how may I assist you today?" : "how can I help you today?";
    opener = context.visitorName
      ? `Welcome back ${context.visitorName} — ${greeting}${mention}`
      : `Welcome — ${greeting}${mention}`;
    action = pricingHits > 0
      ? "Compare plan options with visitor"
      : "Continue conversation";
    if (pricingHits > 0) signals.push("pricing_interest");
  }

  return {
    intentScore: score,
    personalisedOpener: opener,
    recommendedAction: action,
    signals,
    computedAt: Date.now(),
  };
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
      pageHistory: context.pageHistory,
      operatorMessage: context.operatorMessage,
    });
  }

  const openai = new OpenAI({ apiKey });
  const model =
    context.model === "gpt-4o" || context.model === "gpt-4o-mini"
      ? context.model
      : INTENT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const completion = await openai.chat.completions.create(
      {
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
      },
      { signal: controller.signal }
    );

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = intentSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error("OpenAI returned invalid intent JSON");
    }

    return {
      ...parsed.data,
      computedAt: Date.now(),
    };
  } finally {
    clearTimeout(timer);
  }
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
  operatorMessage?: string;
  model?: string;
}): Promise<IntelligenceResult> {
  const opHash = operatorHash(context.operatorMessage);

  if (context.visitorId) {
    if (opHash === "none") {
      const cached = await getCachedIntelligence(context.visitorId);
      if (cached) return cached;
    } else {
      const cached = readOperatorCache(context.visitorId, opHash);
      if (cached) return cached;
    }
  }

  try {
    const result = await callOpenAIIntent(context);
    if (context.visitorId && opHash !== "none") {
      writeOperatorCache(context.visitorId, opHash, result);
    }
    return result;
  } catch (err) {
    console.warn("[openai] scoreIntent fallback", err);
    return heuristicIntentFallback({
      visitorName: context.visitorName,
      returnCount: context.returnCount,
      industry: context.industry,
      pageHistory: context.pageHistory,
      operatorMessage: context.operatorMessage,
    });
  }
}

export type IntentStreamEvent =
  | { type: "token"; text: string }
  | { type: "final"; intelligence: IntelligenceResult }
  | { type: "fallback"; intelligence: IntelligenceResult; reason: string };

/**
 * Stream intent scoring as token deltas, then a final structured payload.
 * Useful for SSE endpoints that want to fill the opener bubble as text arrives.
 * Always emits a `final` (or `fallback`) event at the end.
 */
export async function* streamIntent(context: {
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
  operatorMessage?: string;
  model?: string;
}): AsyncGenerator<IntentStreamEvent, void, void> {
  const opHash = operatorHash(context.operatorMessage);

  if (context.visitorId) {
    if (opHash === "none") {
      const cached = await getCachedIntelligence(context.visitorId);
      if (cached) {
        yield { type: "token", text: cached.personalisedOpener };
        yield { type: "final", intelligence: cached };
        return;
      }
    } else {
      const cached = readOperatorCache(context.visitorId, opHash);
      if (cached) {
        yield { type: "token", text: cached.personalisedOpener };
        yield { type: "final", intelligence: cached };
        return;
      }
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    const fb = heuristicIntentFallback({
      visitorName: context.visitorName,
      returnCount: context.returnCount,
      industry: context.industry,
      pageHistory: context.pageHistory,
      operatorMessage: context.operatorMessage,
    });
    yield { type: "token", text: fb.personalisedOpener };
    yield { type: "fallback", intelligence: fb, reason: "OPENAI_API_KEY unset" };
    return;
  }

  const openai = new OpenAI({ apiKey });
  const model =
    context.model === "gpt-4o" || context.model === "gpt-4o-mini"
      ? context.model
      : INTENT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  let buffer = "";
  try {
    const stream = await openai.chat.completions.create(
      {
        model,
        stream: true,
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
      },
      { signal: controller.signal }
    );

    let lastEmittedOpener = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (!delta) continue;
      buffer += delta;

      // Best-effort progressive parse: extract the personalisedOpener field
      // as it grows so the bubble fills before the final JSON closes.
      const match = buffer.match(/"personalisedOpener"\s*:\s*"((?:[^"\\]|\\.)*)/);
      if (match) {
        const partial = match[1]
          // Decode the small set of JSON escapes that may appear mid-stream.
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        if (partial.length > lastEmittedOpener.length) {
          const diff = partial.slice(lastEmittedOpener.length);
          lastEmittedOpener = partial;
          yield { type: "token", text: diff };
        }
      }
    }

    const parsed = intentSchema.safeParse(JSON.parse(buffer || "{}"));
    if (!parsed.success) {
      throw new Error("OpenAI streamed invalid intent JSON");
    }
    const result: IntelligenceResult = { ...parsed.data, computedAt: Date.now() };
    if (context.visitorId && opHash !== "none") {
      writeOperatorCache(context.visitorId, opHash, result);
    }
    yield { type: "final", intelligence: result };
  } catch (err) {
    console.warn("[openai] streamIntent fallback", err);
    const fb = heuristicIntentFallback({
      visitorName: context.visitorName,
      returnCount: context.returnCount,
      industry: context.industry,
      pageHistory: context.pageHistory,
      operatorMessage: context.operatorMessage,
    });
    yield { type: "token", text: fb.personalisedOpener };
    yield {
      type: "fallback",
      intelligence: fb,
      reason: err instanceof Error ? err.message : "OpenAI stream failed",
    };
  } finally {
    clearTimeout(timer);
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
      outcome: parsed.data.outcome,
      summary: parsed.data.summary,
      actionItems: parsed.data.actionItems,
      sentimentArc: parsed.data.sentimentArc,
    };
  } catch {
    return null;
  }
}
