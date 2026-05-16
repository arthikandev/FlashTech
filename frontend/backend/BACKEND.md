# PresenceIQ Backend — Analysis Summary

**Purpose:** Read-only reference for frontend developers analyzing Person 2’s backend.  
**Source of truth:** `backend/`, `docs/API_CONTRACT.md`, `docs/ARCHITECTURE.md`, `docs/BACKEND_CONTRIBUTION.md`  
**Do not edit:** `backend/` implementation (Person 2 owns it).

---

## 1. How to work with the backend (local)

### Prerequisites

| Requirement | Notes |
|-------------|--------|
| Node.js | Same as monorepo |
| Convex account | Dev deployment URL shared with frontend |
| OpenAI key (optional) | Without it, demo fingerprint still returns Sarangan opener; others get heuristic fallback |
| n8n (optional) | CRM fetch / Slack only if `N8N_WEBHOOK_*` URLs are set |

### Environment

- Env files live **only** in `backend/.env.local` (not repo root).
- Copy `backend/.env.example` → `backend/.env.local`.
- Frontend must use the **same** Convex URL: `VITE_CONVEX_URL` = backend `NEXT_PUBLIC_CONVEX_URL`.

Key variables:

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex HTTP client (API routes + dashboard) |
| `NEXT_PUBLIC_APP_URL` | Base URL baked into embed SDK (`http://localhost:3000` dev) |
| `OPENAI_API_KEY` | GPT-4o intent scoring |
| `N8N_WEBHOOK_SECRET` | Validates inbound n8n → `POST /api/webhooks/n8n/crm` |
| `BP_WEBHOOK_SECRET` | Validates avatar → `POST /api/webhooks/beyondpresence/session` |
| `N8N_WEBHOOK_CRM_FETCH` | Outbound: fingerprint triggers async CRM lookup |
| `N8N_WEBHOOK_SLACK` / `N8N_WEBHOOK_CRM_PUSH` | Outbound after session ends |

### Commands (two terminals)

```bash
# Terminal 1 — Convex schema, functions, generates _generated/
cd backend && npm install
npx convex dev

# Terminal 2 — Next.js API on :3000
cd backend && npm run dev

# Once — seed demo tenants + Sarangan visitor
cd backend && npm run seed
# equivalent: npx convex run seed:seedDemo
```

### Default URLs

| Service | Dev URL |
|---------|---------|
| Backend API | `http://localhost:3000` |
| Embed script | `GET http://localhost:3000/api/embed/{embedKey}` |
| Frontend (Vite) | `http://localhost:5173` (separate process) |

### Demo credentials (rehearsal)

| Field | Value |
|-------|--------|
| embedKey (bank) | `seylan-demo` |
| Other embed keys | `cloudmetrics-demo`, `coral-demo` |
| Fingerprint | `demo-sarangan-fp` in `localStorage` key `piq_fp` |
| CRM ID | `CRM-001` |
| Expected opener | “Welcome back Sarangan — … Gold and Platinum plans …” |

### What frontend consumes (read-only)

| Integration | How |
|-------------|-----|
| Embed on demo pages | `<script src="{VITE_BACKEND_URL}/api/embed/seylan-demo" async>` |
| After load | Listen for `presenceiq:ready` → `visitorId`, `businessId`, `sessionId` |
| Dashboard | Convex React client + shim `frontend/src/convex/api.ts` (paths must match backend queries) |
| Types | `import type { Id } from "../../backend/convex/_generated/dataModel"` (types only — do not import `api.js` in Vite) |

---

## 2. Backend layers

Stack: **Next.js 15 App Router (API)** + **Convex (database + realtime queries)** + **OpenAI GPT-4o** + **n8n (automation, external)**.

```
┌─────────────────────────────────────────────────────────────────┐
│  L4 — Clients & integrations                                     │
│  Demo sites (embed), Avatar (Person 1), Dashboard (frontend), n8n │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / Convex subscriptions
┌────────────────────────────▼────────────────────────────────────┐
│  L3 — Next.js API routes (backend/src/app/api/)                  │
│  REST: fingerprint, intent, pipeline, embed SDK, webhooks, health │
│  Cross-cutting: Zod validation, rate limit, CORS, webhook auth   │
└────────────────────────────┬────────────────────────────────────┘
                             │ getConvexClient() mutations/queries
┌────────────────────────────▼────────────────────────────────────┐
│  L2 — Domain services (backend/src/lib/)                         │
│  pipeline.ts — orchestration, CRM wait, n8n outbound             │
│  openai.ts     — intent scoring (GPT-4o JSON)                      │
│  convex.ts     — Convex HTTP client                                │
│  auth.ts, rateLimit.ts, apiResponse.ts, types.ts                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  L1 — Convex data layer (backend/convex/)                          │
│  schema, visitors, intelligence, conversations, triggers, seed   │
│  Realtime queries for dashboard (listLiveSessions, getSessionDetail)│
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  L0 — External services                                            │
│  OpenAI API, n8n workflows, BeyondPresence (via avatar webhook)    │
└─────────────────────────────────────────────────────────────────┘
```

### Folder map

| Path | Layer | Responsibility |
|------|-------|----------------|
| `src/app/api/embed/[embedKey]/route.ts` | L3 | Serves inline embed JS (fingerprint + `presenceiq:ready`) |
| `src/app/api/fingerprint/route.ts` | L3 | Visitor upsert; triggers n8n CRM fetch |
| `src/app/api/intent/route.ts` | L3 | Intent-only scoring |
| `src/app/api/pipeline/route.ts` | L3 | Full pre-conversation pipeline |
| `src/app/api/webhooks/n8n/crm/route.ts` | L3 | Inbound CRM enrichment |
| `src/app/api/webhooks/beyondpresence/session/route.ts` | L3 | Post-call transcript + triggers |
| `src/lib/pipeline.ts` | L2 | `runIntentPipeline`, `waitForCrmData`, n8n fire helpers |
| `src/lib/openai.ts` | L2 | `scoreIntent()` — GPT-4o or demo/fallback |
| `convex/schema.ts` | L1 | 5 tables + indexes |
| `convex/visitors.ts` | L1 | Fingerprint upsert, CRM patch, time on site |
| `convex/intelligence.ts` | L1 | Save/query scores; dashboard queries |
| `convex/conversations.ts` | L1 | Post-call storage |
| `convex/triggers.ts` | L1 | Rule evaluation (intent > threshold, churn) |
| `convex/seed.ts` | L1 | Demo businesses + Sarangan |
| `public/presenceiq-embed.js` | — | Static copy (route serves dynamic SDK) |
| `devops/n8n/*.workflow.json` | L0 | CRM fetch, Slack hot-lead, CRM push (not in backend/) |

---

## 3. Workflows

### WF-A — Page load & fingerprint (embed)

**Trigger:** Demo site loads embed script.  
**Goal:** Identify visitor, store page history, notify frontend/avatar via event.

1. Browser loads `GET /api/embed/{embedKey}` → IIFE runs.
2. SDK reads/creates `localStorage.piq_fp` fingerprint.
3. `POST /api/fingerprint` with `embedKey`, `path`, `title`, `language`, `referrer`.
4. Convex `visitors.upsertFingerprint` → resolve `business` by `embedKey`, insert or patch visitor.
5. If `returnCount > 1` or `crmId` exists → async `triggerN8nCrmFetch` (optional).
6. SDK dispatches `presenceiq:ready` with `{ visitorId, businessId, sessionId, returnCount, isKnownVisitor }`.

**Target latency:** Fingerprint response fast; CRM is async.

---

### WF-B — Pre-conversation pipeline (avatar / Person 1)

**Trigger:** `presenceiq:ready` then avatar calls `POST /api/pipeline`.  
**Goal:** Enriched visitor + intent score + personalised opener in **&lt; 2s** (`pipelineMs` logged).

1. Rate limit check (`pipeline:{ip}`, 30/min).
2. Parse body: `visitorId`, `businessId`, `waitForCrmMs` (default 500).
3. **`waitForCrmData`:** Poll Convex every 100ms until `crmData.name` or deadline.
4. **`runIntentPipeline`:**
   - Load visitor + business from Convex.
   - `scoreIntent()` (OpenAI or Sarangan demo / no-key fallback).
   - `intelligence.saveIntelligence` mutation.
5. Return `intelligence`, slim `visitor`/`business`, `pipelineMs`.

---

### WF-C — CRM enrichment (n8n, async)

**Trigger:** Returning visitor or known `crmId` on fingerprint.  
**Goal:** Patch visitor with CRM name/notes before or during pipeline wait.

1. Backend `POST` → `N8N_WEBHOOK_CRM_FETCH` (n8n workflow).
2. n8n looks up fake/real CRM (e.g. `CRM-001` → Sarangan).
3. n8n `POST /api/webhooks/n8n/crm` with `X-Webhook-Secret`.
4. Convex `visitors.patchCrmData`.
5. Pipeline poll in WF-B sees `crmData.name` and proceeds with rich context.

---

### WF-D — Intent-only (debug / partial)

**Trigger:** `POST /api/intent` with `visitorId`, `businessId`.  
**Goal:** Score and save intelligence via `runIntentPipeline` only — **no** `waitForCrmMs` poll (use `/api/pipeline` when CRM enrichment must land first).

---

### WF-E — Post-call session (BeyondPresence webhook)

**Trigger:** Avatar ends session → `POST /api/webhooks/beyondpresence/session`.  
**Goal:** Persist transcript; fire hot-lead automation.

1. Verify `X-BP-Webhook-Secret`.
2. `conversations.saveConversation`.
3. Load latest intelligence + visitor.
4. `triggers.evaluateAndFire` (e.g. `intent_score_above` ≥ 80).
5. If `intentScore > 80` → `fireSlackWebhook` (n8n → Slack).
6. `forwardCrmPush` (n8n → CRM update).

---

### WF-F — Dashboard (frontend, Convex client)

**Trigger:** User opens `/dashboard` with `VITE_CONVEX_URL` set.  
**Goal:** Live sessions and session detail (no Next.js API required for reads).

| Query | Use |
|-------|-----|
| `intelligence.listLiveSessions({ businessId })` | Live session list |
| `intelligence.getSessionDetail({ visitorId })` | Visitor + intelligence + conversation |
| `intelligence.getIntelligenceForAvatar({ visitorId })` | Avatar refresh (Person 1) |

Frontend shim: `frontend/src/convex/api.ts` — string paths must stay in sync with backend Convex function names.

---

## 4. Integrated workflow & algorithm

### End-to-end sequence (happy path — Sarangan demo)

```
Demo page          Embed SDK          Next API           Convex           n8n           OpenAI         Avatar
    |                  |                  |                 |               |              |              |
    |-- load script -->|                  |                 |               |              |              |
    |                  |-- POST fingerprint ------------->| upsert visitor |              |              |
    |                  |                  |-- trigger CRM ---------------->| fetch CRM    |              |
    |                  |-- presenceiq:ready ------------->|                 |              |              |
    |                  |                  |                 |               |-- PATCH crm->|              |
    |                  |                  |                 |<-- patch CRM -|              |              |
    |                  |                  |<-- POST pipeline (avatar) ------|              |              |
    |                  |                  | wait CRM 500ms->| poll visitor  |              |              |
    |                  |                  |-- scoreIntent -------------------------------->| GPT-4o       |
    |                  |                  |-- save intelligence ---------->|              |              |
    |                  |                  |-- response opener + score ---->|              |              |
    |                  |                  |                 |               |              |-- speak ---->|
    |                  |                  |<-- POST session webhook -----------------------|              |
    |                  |                  | save conversation + Slack if hot              |              |
```

### Algorithm — `POST /api/pipeline` (pseudocode)

```
INPUT: visitorId, businessId, waitForCrmMs = 500
START timer

IF rate_limit_exceeded(client_ip) THEN RETURN 429

PARSE body with Zod
deadline = now() + waitForCrmMs

WHILE now() < deadline:
  visitor = Convex.query(visitors.getById, visitorId)
  IF visitor.crmData.name IS SET THEN BREAK
  SLEEP 100ms

visitor = Convex.query(visitors.getById, visitorId)
business = Convex.query(businesses.getById, businessId)
IF NOT visitor OR NOT business THEN RETURN 404

// Intent scoring (openai.scoreIntent)
IF fingerprint == "demo-sarangan-fp" OR visitor.name == "sarangan":
  intelligence = DEMO_SARANGAN_INTELLIGENCE
ELSE IF OPENAI_API_KEY missing:
  intelligence = heuristic_fallback(returnCount, visitor.name)
ELSE:
  prompt = buildUserPrompt(industry, pages, CRM notes, churn, time on site)
  intelligence = GPT-4o.chat(JSON schema: intentScore, opener, action, signals)

Convex.mutation(intelligence.saveIntelligence, intelligence)

RETURN 200 {
  intelligence,
  visitor: { name, language, crmId, returnCount, fingerprint },
  business: { name, industry, personaTone },
  pipelineMs: elapsed(timer)
}
```

### Algorithm — `scoreIntent` decision tree

```
1. IF fingerprint == "demo-sarangan-fp" OR name lowercases to "sarangan"
     → RETURN fixed demo (intentScore 96, Gold/Platinum opener)

2. ELSE IF OPENAI_API_KEY is empty
     → RETURN fallback (score ~ 70 + 5*returnCount, generic opener)

3. ELSE
     → CALL GPT-4o with system prompt (industry tone, pricing-page rules)
     → PARSE JSON with Zod
     → RETURN structured IntelligenceResult + computedAt
```

### Algorithm — fingerprint upsert (Convex)

```
1. LOOKUP business WHERE embedKey = args.embedKey
2. LOOKUP visitor WHERE fingerprint + businessId
3. IF exists:
     APPEND page to pageHistory (cap 50)
     INCREMENT returnCount
     PATCH lastSeenAt, language
4. ELSE:
     INSERT new visitor (returnCount = 1)
5. RETURN { visitorId, businessId, returnCount, isKnownVisitor, crmId, sessionId }
```

### Hot-lead rule (post-call)

```
intentScore = latest intelligence for visitor OR 0
evaluate triggers WHERE businessId AND isActive:
  IF condition == intent_score_above AND intentScore >= threshold → mark fired
  IF condition == churn_risk_detected AND visitor.crmData.churnRisk == "high" → mark fired
IF intentScore > 80 → POST N8N_WEBHOOK_SLACK (async)
ALWAYS → POST N8N_WEBHOOK_CRM_PUSH with transcript metadata (async)
```

---

## 5. Data model (Convex tables)

| Table | Purpose | Key indexes |
|-------|---------|-------------|
| `businesses` | Tenant config, `embedKey`, avatar persona, knowledge chunks, webhook URLs | `by_embedKey` |
| `visitors` | Fingerprint, `pageHistory[]`, `crmData`, `returnCount`, `timeOnSite` | `by_fingerprint_and_business`, `by_business` |
| `intelligence` | `intentScore`, `personalisedOpener`, `recommendedAction`, `signals` | `by_visitor`, `by_business` |
| `conversations` | Post-call `transcript`, `outcome`, `sentimentArc`, `actionItems` | `by_visitor`, `by_business` |
| `triggers` | Rules: intent threshold, churn → slack / crm_push / email | `by_business` |

Industries on `businesses`: `bank` | `saas` | `hotel` | `hospital` | `ecommerce` | `hr`.

---

## 6. HTTP API quick reference

| Method | Path | Caller | Description |
|--------|------|--------|-------------|
| GET | `/api/health` | DevOps | Health + Convex connectivity |
| GET | `/api/embed/:embedKey` | Demo sites | Embed SDK JavaScript |
| POST | `/api/fingerprint` | Embed SDK | Upsert visitor; may trigger n8n |
| POST | `/api/intent` | Avatar/debug | Score intent only |
| POST | `/api/pipeline` | Avatar | CRM wait + score + save |
| POST | `/api/webhooks/n8n/crm` | n8n | Patch CRM data on visitor |
| POST | `/api/webhooks/beyondpresence/session` | Avatar | Save conversation + automations |

Full request/response shapes: [`docs/API_CONTRACT.md`](../../docs/API_CONTRACT.md).

---

## 7. Security & limits (analysis)

| Control | Where |
|---------|--------|
| Webhook secrets | `X-Webhook-Secret`, `X-BP-Webhook-Secret` vs env |
| Rate limit | 30 req/min on `/api/intent` and `/api/pipeline` |
| Validation | Zod on all POST bodies |
| OpenAI | Server-side only; never exposed to browser |
| CORS | `corsOptions()` on API routes for embed origins |

---

## 8. Frontend checklist (analysis only)

- [ ] `VITE_BACKEND_URL` points to running Next backend (`:3000` dev).
- [ ] `VITE_CONVEX_URL` matches backend `NEXT_PUBLIC_CONVEX_URL`.
- [ ] Backend seeded (`npm run seed` in `backend/`).
- [ ] Demo pages use correct `embedKey` per tenant.
- [ ] `presenceiq:ready` received before avatar calls `/api/pipeline`.
- [ ] Dashboard uses `src/convex/api.ts` shim, not `backend/convex/_generated/api.js`.
- [ ] `frontend/public/fake-crm.json` aligns with n8n lookup shape (`CRM-001`).

---

## 9. Related docs (repo)

| Document | Location |
|----------|----------|
| API contract | `docs/API_CONTRACT.md` |
| Architecture diagram | `docs/ARCHITECTURE.md` |
| Backend contribution / ownership | `docs/BACKEND_CONTRIBUTION.md` |
| Env index | `docs/ENV.md` |
| Backend README | `backend/README.md` |
| n8n setup | `devops/n8n/SETUP.md` |
| Frontend dev guide (read-only backend section) | `frontend/DEVELOPMENT_GUIDE.md` |

---

*Last updated from codebase analysis — frontend reference only; verify against `backend/` if APIs change.*
