import { NextResponse } from "next/server";
import { checkEnv, getDemoEmbedKeys } from "@/lib/env";

export async function GET() {
  const env = checkEnv();

  return NextResponse.json({
    status: env.ok ? "ok" : "degraded",
    service: "presenceiq-backend",
    checks: env.checks,
    embedKeys: getDemoEmbedKeys(),
    warnings: env.warnings.length > 0 ? env.warnings : undefined,
    missing: env.missing.length > 0 ? env.missing : undefined,
    timestamp: Date.now(),
  });
}
