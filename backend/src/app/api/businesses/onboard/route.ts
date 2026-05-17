import { z } from "zod";
import { envSlackHotLeadUrl } from "@/lib/automationEnv";
import { api, getConvexClient } from "@/lib/convex";
import { jsonError, jsonSuccess, corsOptions } from "@/lib/apiResponse";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  industry: z.enum([
    "bank",
    "saas",
    "hotel",
    "hospital",
    "ecommerce",
    "hr",
  ]),
  personaTone: z.string().optional(),
  defaultLanguage: z.string().optional(),
  embedKey: z.string().regex(/^[a-z0-9-]+$/).optional(),
  bpAgentId: z.string().max(200).optional(),
});

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3001"
  );
}

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const convex = getConvexClient();

    const { businessId, embedKey } = await convex.mutation(
      api.businesses.createBusiness,
      {
        name: body.name,
        industry: body.industry,
        personaTone: body.personaTone,
        defaultLanguage: body.defaultLanguage,
        embedKey: body.embedKey,
        bpAgentId: body.bpAgentId?.trim() || undefined,
      }
    );

    const slackWebhook = envSlackHotLeadUrl();
    if (slackWebhook) {
      try {
        await convex.mutation(api.triggers.seedTriggers, {
          businessId,
          slackWebhookUrl: slackWebhook,
        });
      } catch (seedErr) {
        console.warn("[onboard] seedTriggers skipped:", seedErr);
      }
    }

    const base = appBaseUrl();
    const embedSnippet = `<script src="${base}/api/embed/${embedKey}" async></script>`;

    return jsonSuccess({
      businessId,
      embedKey,
      embedSnippet,
      embedUrl: `${base}/api/embed/${embedKey}`,
      dashboardHint:
        "Link your Clerk user: npx convex run seed:seedDemo '{\"clerkUserId\":\"user_...\",\"embedKey\":\"" +
        embedKey +
        "\"}'",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return jsonError(err.message, 400);
    }
    console.error("[onboard]", err);
    return jsonError("Onboarding failed", 500);
  }
}
