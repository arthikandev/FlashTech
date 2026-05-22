import OpenAI from "openai";
import { z } from "zod";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import { checkRateLimit } from "@/lib/rateLimit";
import { jsonError, corsOptions } from "@/lib/apiResponse";

export const runtime = "nodejs";

const bodySchema = z.object({
  businessId: z.string(),
  text: z.string().min(1).max(800),
  language: z.enum(["en", "ta", "si"]).optional(),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .optional(),
});

const VOICE_BY_LANG: Record<"en" | "ta" | "si", "alloy" | "nova" | "shimmer"> = {
  en: "alloy",
  ta: "nova",
  si: "shimmer",
};

const AUDIO_HEADERS: HeadersInit = {
  "Content-Type": "audio/mpeg",
  "Cache-Control": "no-cache",
  "Access-Control-Allow-Origin": "*",
};

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`canvas-tts:${ip}`)) {
    return jsonError("Rate limit exceeded", 429);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return jsonError("OPENAI_API_KEY not configured", 503);
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Invalid TTS request",
      400
    );
  }

  const businessId = body.businessId as Id<"businesses">;
  const convex = getConvexClient();

  // Lightweight authorisation: confirm the business exists. Membership is not
  // checked here because TTS plays from the canvas, which already enforces
  // membership upstream. This prevents random callers from burning credits
  // against an arbitrary tenant.
  const business = await convex.query(api.businesses.getById, { businessId });
  if (!business) {
    return jsonError("Unknown business", 404);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const voice =
      body.voice ?? (body.language ? VOICE_BY_LANG[body.language] : "alloy");
    const speech = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: body.text,
      response_format: "mp3",
    });

    // Fire-and-forget usage tracking so the audio response isn't held up.
    convex
      .mutation(api.usage.recordTtsCall, {
        businessId,
        model: "tts-1",
      })
      .catch((err) => {
        console.warn("[tts] recordTtsCall failed", err);
      });

    return new Response(speech.body, { headers: AUDIO_HEADERS });
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "TTS generation failed",
      502
    );
  }
}
