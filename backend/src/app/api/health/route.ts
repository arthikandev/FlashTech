import { NextResponse } from "next/server";

export async function GET() {
  const convexConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  return NextResponse.json({
    status: "ok",
    service: "presenceiq-backend",
    convex: convexConfigured ? "configured" : "missing NEXT_PUBLIC_CONVEX_URL",
    timestamp: Date.now(),
  });
}
