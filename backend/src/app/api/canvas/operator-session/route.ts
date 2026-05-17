import { z } from "zod";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import { checkRateLimit } from "@/lib/rateLimit";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  embedKey: z.string().min(1),
});

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`canvas-operator:${ip}`)) {
    return jsonError("Rate limit exceeded", 429);
  }

  try {
    const body = bodySchema.parse(await request.json());
    const convex = getConvexClient();

    const business = await convex.query(api.businesses.getByEmbedKey, {
      embedKey: body.embedKey,
    });
    if (!business) {
      return jsonError("Unknown embedKey", 404);
    }

    const fingerprint = `canvas-operator-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const result = await convex.mutation(api.visitors.upsertFingerprint, {
      embedKey: body.embedKey,
      fingerprint,
      path: "/canvas",
      title: "Canvas operator session",
      language: "en",
    });

    return jsonSuccess({
      visitorId: result.visitorId as Id<"visitors">,
      businessId: result.businessId as Id<"businesses">,
      fingerprint,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Operator session failed";
    return jsonError(message, 400);
  }
}
