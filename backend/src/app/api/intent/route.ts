import { z } from "zod";
import type { Id } from "../../../../convex/_generated/dataModel";
import { checkRateLimit } from "@/lib/rateLimit";
import { runIntentPipeline } from "@/lib/pipeline";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  visitorId: z.string(),
  businessId: z.string(),
});

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`intent:${ip}`)) {
    return jsonError("Rate limit exceeded", 429);
  }

  try {
    const body = bodySchema.parse(await request.json());
    const intelligence = await runIntentPipeline(
      body.visitorId as Id<"visitors">,
      body.businessId as Id<"businesses">
    );
    return jsonSuccess(intelligence);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Intent scoring failed";
    const status = message.includes("not found") ? 404 : message.includes("JSON") ? 502 : 500;
    return jsonError(message, status);
  }
}
