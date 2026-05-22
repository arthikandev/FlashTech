import { NextRequest } from "next/server";
import { corsOptions } from "@/lib/apiResponse";
import { handleInboundCrmIngest } from "@/lib/crmIngestWebhook";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: NextRequest) {
  return handleInboundCrmIngest(request);
}
