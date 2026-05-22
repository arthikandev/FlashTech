import { NextRequest, NextResponse } from "next/server";
import { checkEnv, getIntegrationsStatus } from "@/lib/env";
import {
  probeBeyondPresence,
  probeConvex,
  probeElevenLabs,
  probeOpenAI,
} from "@/lib/healthProbes";
import { corsOptions } from "@/lib/apiResponse";

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  const env = checkEnv();
  const runProbes = request.nextUrl.searchParams.get("probes") === "1";

  const body: Record<string, unknown> = {
    status: env.ok ? "ok" : "degraded",
    service: "presenceiq-backend",
    checks: env.checks,
    integrations: getIntegrationsStatus(),
    warnings: env.warnings.length > 0 ? env.warnings : undefined,
    missing:
      env.missing.filter((k) => k !== "ELEVENLABS_API_KEY").length > 0
        ? env.missing.filter((k) => k !== "ELEVENLABS_API_KEY")
        : undefined,
    timestamp: Date.now(),
  };

  if (runProbes) {
    const [convex, openai, beyondPresence, elevenLabs] = await Promise.all([
      probeConvex(),
      probeOpenAI(),
      probeBeyondPresence(),
      probeElevenLabs(),
    ]);

    const slow =
      convex.latencyMs > 500 ||
      openai.latencyMs > 2000 ||
      beyondPresence.latencyMs > 2000 ||
      elevenLabs.latencyMs > 2000;

    body.probes = {
      convex: convex.ok,
      openai: openai.ok,
      beyondPresence: beyondPresence.ok,
      elevenLabs: elevenLabs.ok,
    };
    body.probeDetails = {
      convex: { ok: convex.ok, reason: convex.detail },
      openai: { ok: openai.ok, reason: openai.detail },
      beyondPresence: { ok: beyondPresence.ok, reason: beyondPresence.detail },
      elevenLabs: { ok: elevenLabs.ok, reason: elevenLabs.detail },
    };
    body.latencyProbes = { convex, openai, beyondPresence, elevenLabs };
    if (slow) {
      body.status = "degraded";
    }
  }

  return NextResponse.json(body);
}
