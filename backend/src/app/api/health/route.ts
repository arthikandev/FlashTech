import { NextRequest, NextResponse } from "next/server";
import { checkEnv, getDemoEmbedKeys, getIntegrationsStatus } from "@/lib/env";
import {
  probeBeyondPresence,
  probeConvex,
  probeOpenAI,
} from "@/lib/healthProbes";

export async function GET(request: NextRequest) {
  const env = checkEnv();
  const runProbes = request.nextUrl.searchParams.get("probes") === "1";

  const body: Record<string, unknown> = {
    status: env.ok ? "ok" : "degraded",
    service: "presenceiq-backend",
    checks: env.checks,
    integrations: getIntegrationsStatus(),
    embedKeys: getDemoEmbedKeys(),
    warnings: env.warnings.length > 0 ? env.warnings : undefined,
    missing: env.missing.length > 0 ? env.missing : undefined,
    timestamp: Date.now(),
  };

  if (runProbes) {
    const [convex, openai, beyondPresence] = await Promise.all([
      probeConvex(),
      probeOpenAI(),
      probeBeyondPresence(),
    ]);

    const slow =
      convex.latencyMs > 500 ||
      openai.latencyMs > 2000 ||
      beyondPresence.latencyMs > 2000;

    body.latencyProbes = { convex, openai, beyondPresence };
    if (slow) {
      body.status = "degraded";
    }
  }

  return NextResponse.json(body);
}
