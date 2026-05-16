import { NextResponse } from "next/server";
import { corsOptions } from "@/lib/apiResponse";
import {
  isBeyondPresenceConfigured,
  listAgents,
  verifyBeyondPresenceKey,
} from "@/lib/beyondPresenceApi";

export async function OPTIONS() {
  return corsOptions();
}

/** Verify Beyond Presence API key and list agents (setup/debug). */
export async function GET() {
  if (!isBeyondPresenceConfigured()) {
    return NextResponse.json({
      configured: false,
      verified: false,
      message: "Set BEYONDPRESENCE_API_KEY in backend/.env.local",
    });
  }

  const verified = await verifyBeyondPresenceKey();
  const agents = verified ? await listAgents() : [];

  return NextResponse.json({
    configured: true,
    verified,
    agentCount: agents.length,
    agents: agents.map((a) => ({ id: a.id, name: a.name })),
  });
}
