# External API providers

Index of every third-party service used in the PresenceIQ monorepo: what it does, where keys live, and which backend routes touch it.

See also: [ENV.md](ENV.md) · [API_CONTRACT.md](API_CONTRACT.md) · [backend/SETUP.md](../backend/SETUP.md)

---

## Summary

| Provider | Role | Env / config | Backend touchpoints |
|----------|------|--------------|---------------------|
| [Beyond Presence](#beyond-presence) | Live video avatar + calls | `BEYONDPRESENCE_API_KEY`, `BP_WEBHOOK_SECRET`, `bpAgentId` in Convex | `/api/pipeline`, `/api/beyondpresence/status`, session webhook |
| [OpenAI](#openai) | Pre-call intent (GPT-4o) | `OPENAI_API_KEY` | `src/lib/openai.ts`, `/api/intent`, `/api/pipeline` |
| [Seylan sandbox](#seylan-sandbox) | Hackathon CRM enrichment | `SEYLAN_API_*` | `src/lib/seylanApi.ts`, fingerprint, `/api/seylan/account-inquiry` |
| [n8n](#n8n) | CRM fetch, Slack, churn email | `N8N_WEBHOOK_*`, `N8N_WEBHOOK_SECRET` | fingerprint, automation, `/api/webhooks/n8n/crm` |
| [Convex](#convex) | Database + realtime | `NEXT_PUBLIC_CONVEX_URL`, deploy keys | All API routes |
| [Clerk](#clerk) | Dashboard sign-in | Clerk keys + `CLERK_JWT_ISSUER_DOMAIN` on Convex | middleware, Convex auth |
| [ElevenLabs](#elevenlabs) | TTS (avatar app) | `avatar/.env.local` only | Person 1 — not proxied by backend |

---

## Beyond Presence

**Purpose:** Managed conversational video agents; PresenceIQ syncs intent and opener before each call.

| Item | Detail |
|------|--------|
| Docs | [docs.bey.dev](https://docs.bey.dev/get-started/api) · [BEYOND_PRESENCE.md](BEYOND_PRESENCE.md) |
| Auth | `x-api-key` header |
| Base URL | `https://api.bey.dev` (override: `BEYONDPRESENCE_API_BASE_URL`) |
| Keys | `backend/.env.local` only — **not** `avatar/.env.local` |
| Agent ID | `businesses.avatarConfig.bpAgentId` in Convex |

**Key endpoints used:**

- `GET /v1/auth/verify` — health check
- `PATCH /v1/agents/{id}` — `system_prompt`, `greeting` after pipeline
- Webhook → `POST /api/webhooks/beyondpresence/session`

---

## OpenAI

**Purpose:** Score visitor intent and generate personalised opener (GPT-4o, JSON mode).

| Item | Detail |
|------|--------|
| Docs | [platform.openai.com/docs](https://platform.openai.com/docs) |
| Env | `OPENAI_API_KEY` in `backend/.env.local` |
| Model | `gpt-4o` in [`backend/src/lib/openai.ts`](../backend/src/lib/openai.ts) |
| Fallback | Demo scores for seeded Sarangan when key missing |

**Routes:** `POST /api/intent`, `POST /api/pipeline` (via `runIntentPipeline`).

---

## Seylan sandbox

**Purpose:** Hackathon Team 8 bank sandbox for CRM lookup on fingerprint (not production Seylan).

| Item | Detail |
|------|--------|
| Env | `SEYLAN_API_BASE_URL`, `SEYLAN_API_KEY`, `SEYLAN_CUSTOMER_LOOKUP_PATH`, `SEYLAN_DEMO_ACCOUNT_NUMBER` |
| Auth | `x-api-key` on every request |
| Default base | `http://34.21.206.87:3000` |
| Client | [`backend/src/lib/seylanApi.ts`](../backend/src/lib/seylanApi.ts) |

**Priority on fingerprint:** n8n CRM fetch → Seylan sandbox → built-in demo mock.

**Routes:** `GET` / `POST /api/seylan/account-inquiry` (server-side proxy).

---

## n8n

**Purpose:** Workflow automation — CRM enrichment, hot-lead Slack, post-call CRM push, churn email.

| Item | Detail |
|------|--------|
| Env | `N8N_WEBHOOK_CRM_FETCH`, `N8N_WEBHOOK_SLACK`, `N8N_WEBHOOK_CRM_PUSH`, `N8N_WEBHOOK_CHURN` |
| Secret | `N8N_WEBHOOK_SECRET` — header `X-Webhook-Secret` on inbound CRM webhook |
| Workflows | [`devops/n8n/`](../devops/n8n/) |

**Inbound:** `POST /api/webhooks/n8n/crm` (n8n pushes CRM data to Convex).

**Outbound:** fire-and-forget `fetch` from [`backend/src/lib/pipeline.ts`](../backend/src/lib/pipeline.ts) and [`backend/src/lib/automation.ts`](../backend/src/lib/automation.ts).

---

## Convex

**Purpose:** Multi-tenant data — businesses, visitors, intelligence, conversations, triggers.

| Item | Detail |
|------|--------|
| Dashboard | [dashboard.convex.dev](https://dashboard.convex.dev) |
| Env | `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT` in backend; `VITE_CONVEX_URL` in frontend (same URL) |
| Schema | [`backend/convex/schema.ts`](../backend/convex/schema.ts) |
| Seed | `npx convex run seed:seedDemo` from `backend/` |

**Auth:** Clerk JWT via `CLERK_JWT_ISSUER_DOMAIN` on the Convex deployment.

---

## Clerk

**Purpose:** Sign-in for the operator dashboard (Person 3 frontend + backend `/dashboard`).

| Item | Detail |
|------|--------|
| Docs | [clerk.com/docs](https://clerk.com/docs) · [Convex + Clerk](https://docs.convex.dev/auth/clerk) |
| Backend env | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Frontend env | `VITE_CLERK_PUBLISHABLE_KEY` |
| Convex | `npx convex env set CLERK_JWT_ISSUER_DOMAIN https://....clerk.accounts.dev` |

Middleware protects non-API pages; `/api/*` routes are public for embed and webhooks.

---

## ElevenLabs

**Purpose:** Text-to-speech for the avatar track (optional; not used by backend API).

| Item | Detail |
|------|--------|
| Env | `ELEVENLABS_API_KEY` in `avatar/.env.local` |
| Template | [`avatar/.env.example`](../avatar/.env.example) |

Configure on Person 1’s machine only. No backend proxy in v1.

---

## Quick verification commands

```bash
cd backend
npm run check:env
curl http://localhost:3000/api/health
curl http://localhost:3000/api/beyondpresence/status
curl http://localhost:3000/api/seylan/account-inquiry   # if Seylan configured
```
