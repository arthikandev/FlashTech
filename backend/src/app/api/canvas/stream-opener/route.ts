import { z } from "zod";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { api, getConvexClient } from "@/lib/convex";
import { checkRateLimit } from "@/lib/rateLimit";
import { jsonError, corsOptions } from "@/lib/apiResponse";
import { streamIntent, type IntentStreamEvent } from "@/lib/openai";

export const runtime = "nodejs";

const bodySchema = z.object({
  visitorId: z.string(),
  businessId: z.string(),
  operatorMessage: z.string().max(2000).optional(),
  language: z.enum(["en", "ta", "si"]).optional(),
});

const SSE_HEADERS: HeadersInit = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
  "Access-Control-Allow-Origin": "*",
};

export async function OPTIONS() {
  return corsOptions();
}

function encodeEvent(payload: IntentStreamEvent): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`canvas-stream:${ip}`)) {
    return jsonError("Rate limit exceeded", 429);
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    return jsonError(
      err instanceof Error ? err.message : "Invalid stream request",
      400
    );
  }

  const visitorId = body.visitorId as Id<"visitors">;
  const businessId = body.businessId as Id<"businesses">;

  const convex = getConvexClient();
  const [visitor, business] = await Promise.all([
    convex.query(api.visitors.getById, { visitorId }),
    convex.query(api.businesses.getById, { businessId }),
  ]);

  if (!visitor || !business) {
    return jsonError("Visitor or business not found", 404);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of streamIntent({
          visitorId,
          industry: business.industry,
          businessName: business.name,
          visitorName: visitor.crmData?.name,
          returnCount: visitor.returnCount,
          language: body.language ?? visitor.language,
          timeOnSiteMs: visitor.timeOnSite,
          pageHistory: visitor.pageHistory,
          crmNotes: visitor.crmData?.notes,
          churnRisk: visitor.crmData?.churnRisk,
          operatorMessage: body.operatorMessage,
        })) {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            encodeEvent({
              type: "fallback",
              intelligence: {
                intentScore: 50,
                personalisedOpener:
                  "Welcome — happy to help, what can I do for you?",
                recommendedAction: "Continue conversation",
                signals: ["stream_error"],
                computedAt: Date.now(),
              },
              reason: err instanceof Error ? err.message : "stream failed",
            })
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
