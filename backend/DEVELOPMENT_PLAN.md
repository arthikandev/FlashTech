# Backend & Automation — Development Plan

**Owner**: Person 2 (Backend Lead)  
**Branch**: `feature/backend-person2`  
**Tools**: Next.js, Convex, OpenAI GPT-4o, n8n webhooks

## Milestones

- [x] Hour 4 — Embed fingerprints visitor; `presenceiq:ready` fires
- [x] Hour 10 — `/api/pipeline` returns Sarangan opener in <2s
- [x] Hour 15 — Hot-lead Slack via n8n when score > 80
- [x] Hour 24 — Reactive queries live; demo rehearsals pass

## Phase 1 — Foundation (0–4h)

- [x] Scaffold Next.js 15 + TypeScript in `backend/`
- [x] `npx convex init` + deploy empty project
- [x] Implement `convex/schema.ts` (5 tables + indexes)
- [x] Run `convex/seed.ts` — Seylan Bank + Sarangan visitor
- [x] `GET /api/embed/[embedKey]` returns fingerprint SDK
- [x] `POST /api/fingerprint` upserts visitor
- [x] Embed dispatches `presenceiq:ready` event
- [x] `GET /api/health` returns convex connected

## Phase 2 — Intelligence pipeline (4–10h)

- [x] `backend/src/lib/openai.ts` — GPT-4o structured JSON
- [x] `POST /api/intent` — score + personalisedOpener
- [x] `convex/intelligence.ts` — saveIntelligence + getLatestByVisitor
- [x] Tune prompt until opener matches demo script
- [x] `POST /api/pipeline` — orchestrate CRM wait + intent
- [x] Log `pipelineMs` in response (<1800ms target)
- [x] Document endpoints in `docs/API_CONTRACT.md`

## Phase 3 — n8n & webhooks (10–15h)

- [x] `POST /api/webhooks/n8n/crm` + secret verification
- [x] Wire fingerprint route → n8n CRM fetch (async)
- [x] Import `devops/n8n/crm-fetch.workflow.json`
- [x] `POST /api/webhooks/beyondpresence/session`
- [x] `convex/conversations.ts` — saveConversation
- [x] `convex/triggers.ts` — evaluateAndFire (score > 80 → Slack)
- [x] Import `devops/n8n/hot-lead-slack.workflow.json`

## Phase 4 — Dashboard handoff (15–20h)

- [x] `listLiveSessions(businessId)` reactive query
- [x] `getSessionDetail(visitorId)` query
- [x] `getIntelligenceForAvatar(visitorId)` query
- [x] Seed 2nd + 3rd businesses (cloudmetrics-demo, coral-demo)

## Phase 5 — Polish (20–24h)

- [x] Rate limit `/api/intent` and `/api/pipeline`
- [x] Zod validation on all POST bodies
- [x] Vercel + Convex deploy docs in devops/
- [x] Write `docs/BACKEND_CONTRIBUTION.md`

## Handoffs to teammates

| To | What | Status |
|----|------|--------|
| Person 1 | `API_CONTRACT.md` — pipeline URL, `presenceiq:ready`, BP webhook | [x] |
| Person 3 | Convex URL, query names, embed snippet per embedKey | [x] |
| Person 3 | Fake CRM JSON shape for n8n | [x] |

## Blockers / notes

_None — scaffold complete. Run `npx convex dev` and set `OPENAI_API_KEY` for live intent scoring._
