# Member B — Backend Lead Contribution

**PresenceIQ** | Next.js API, Convex, OpenAI GPT-4o, n8n webhooks

## Owned modules

| Area | Files / responsibility |
|------|------------------------|
| Convex schema | `convex/schema.ts` — 6 tables (incl. `businessMembers`) |
| Auth | `convex/auth.config.ts`, `convex/lib/auth.ts`, `convex/businessMembers.ts` |
| Visitors | `convex/visitors.ts` — fingerprint upsert, CRM patch |
| Intelligence | `convex/intelligence.ts` — scoring storage, dashboard queries |
| Conversations | `convex/conversations.ts` — post-call transcripts |
| Triggers | `convex/triggers.ts` — hot-lead evaluation |
| Seed | `convex/seed.ts` — CloudMetrics demo data |
| Embed SDK | `src/app/api/embed/[embedKey]/route.ts` |
| Intent API | `src/app/api/intent/route.ts`, `src/lib/openai.ts` |
| Pipeline | `src/app/api/pipeline/route.ts`, `src/lib/pipeline.ts` |
| Webhooks | `src/app/api/webhooks/n8n/crm`, `beyondpresence/session` |
| n8n exports | `devops/n8n/*.workflow.json` |

## Architecture

```
Demo site embed
    → GET /api/embed/:embedKey (JS SDK)
    → POST /api/fingerprint
    → Convex visitors table
    → n8n CRM fetch → POST /api/webhooks/n8n/crm
Person 1: presenceiq:ready → POST /api/pipeline
    → OpenAI GPT-4o intent score
    → Convex intelligence table
    → BeyondPresence personalised opener
Post-call: POST /api/webhooks/beyondpresence/session
    → Convex conversations + Slack trigger
```

## API summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/embed/:embedKey` | Fingerprint embed SDK |
| POST | `/api/fingerprint` | Upsert visitor |
| POST | `/api/intent` | Score intent (GPT-4o) |
| POST | `/api/pipeline` | Full pre-conversation pipeline |
| POST | `/api/webhooks/n8n/crm` | CRM enrichment from n8n |
| POST | `/api/webhooks/beyondpresence/session` | Post-call transcript |

## Security

- **Dashboard auth:** Clerk JWT via Convex Auth; `listLiveSessions`, `getSessionDetail`, and `listByBusiness` require `businessMembers` access
- Webhook secrets: `X-Webhook-Secret`, `X-BP-Webhook-Secret`
- Rate limit: 30 req/min on intent + pipeline
- Zod validation on all POST bodies
- OpenAI calls server-side only
- Embed / fingerprint / pipeline / avatar queries remain public for demo flows

## How to run locally

```bash
cd backend
cp .env.example .env.local   # see docs/ENV.md — env lives only in backend/
npm install
npx convex dev          # terminal 1
npm run dev             # terminal 2 — http://localhost:3000
npx convex run seed:seedDemo
# optional: link your Clerk user to cloudmetrics-demo
npx convex run seed:seedDemo '{"clerkUserId":"user_..."}'
```

Configure Clerk on Convex: `npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-app.clerk.accounts.dev` — see [ENV.md](../docs/ENV.md).

## Demo credentials

| Field | Value |
|-------|-------|
| embedKey | `cloudmetrics-demo` |
| demo fingerprint | `demo-sarangan-fp` (set in localStorage `piq_fp`) |
| CRM ID | `CRM-001` |
| Expected opener | Welcome back Sarangan — Gold and Platinum plans |

## Convex queries for teammates

- `intelligence.listLiveSessions({ businessId })` — requires Clerk + membership
- `intelligence.getSessionDetail({ visitorId })` — requires Clerk + membership
- `intelligence.getIntelligenceForAvatar({ visitorId })` — public (Person 1)
- `businessMembers.listForCurrentUser()` — list accessible businesses
- `businessMembers.linkCurrentUser({ businessId })` — self-serve demo onboarding
