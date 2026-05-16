import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";
import {
  fetchCrmForVisitor,
  getSeylanDemoAccountNumber,
  isSeylanApiConfigured,
  pingSeylanSandbox,
} from "@/lib/seylanApi";

const bodySchema = z.object({
  accountNumber: z.string().optional(),
  crmId: z.string().optional(),
});

export async function OPTIONS() {
  return corsOptions();
}

/** Test Seylan sandbox CRM lookup (keeps API key server-side). */
export async function POST(request: Request) {
  if (!isSeylanApiConfigured()) {
    return jsonError("SEYLAN_API_BASE_URL and SEYLAN_API_KEY required", 503);
  }

  try {
    const body = bodySchema.parse(await request.json().catch(() => ({})));
    const accountNumber = body.accountNumber ?? getSeylanDemoAccountNumber();
    const result = await fetchCrmForVisitor({
      accountNumber,
      crmId: body.crmId,
    });

    if (!result) {
      return jsonError(
        "Seylan sandbox lookup failed — check SEYLAN_CUSTOMER_LOOKUP_PATH or use demo CRM",
        502
      );
    }

    return jsonSuccess({
      accountNumber,
      ...result,
      sandboxReachable: await pingSeylanSandbox(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seylan inquiry failed";
    return jsonError(message, 400);
  }
}

export async function GET() {
  if (!isSeylanApiConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "Set SEYLAN_API_BASE_URL and SEYLAN_API_KEY in .env.local",
    });
  }

  const reachable = await pingSeylanSandbox();
  return NextResponse.json({
    configured: true,
    sandbox: process.env.SEYLAN_API_BASE_URL,
    demoAccount: getSeylanDemoAccountNumber(),
    lookupPath:
      process.env.SEYLAN_CUSTOMER_LOOKUP_PATH?.trim() ||
      "/api/accounts/{accountNumber}",
    reachable,
  });
}
