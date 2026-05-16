# Avatar & AI Engineer — Development Plan

**Owner**: Person 1 (DevOps + Avatar)  
**Branch**: `feature/avatar-person1`  
**Tracker**: [../dev.md](../dev.md)  
**Tools**: BeyondPresence, OpenAI BYO-LLM, ElevenLabs

## Milestones

- [ ] Hour 4 — First avatar talks (generic greeting)
- [ ] Hour 10 — Personalised opener from backend pipeline
- [ ] Hour 15 — Post-call transcript → backend webhook
- [ ] Hour 24 — Emotion-aware voice + deferred avatar trigger stable

## Phase 1 — Foundation (0–4h)

- [ ] BeyondPresence account + Managed Agents API key
- [ ] Create base agent (bank persona — formal tone)
- [ ] Test iframe embed — avatar speaks generic greeting
- [ ] OpenAI account — test BYO-LLM inside BP
- [ ] ElevenLabs account — list voice IDs in `src/beyondpresence/voices.ts`
- [x] Scaffold: `package.json`, `src/`, `demo/test-page.html`, `npm run build`

## Phase 2 — Pre-conversation integration (4–10h)

- [x] Listen for `presenceiq:ready` — `src/index.ts`
- [x] Call `POST {BACKEND_URL}/api/pipeline` — `src/pipeline.ts`
- [x] Build `buildSystemPrompt(data)` from intelligence payload
- [x] Inject context via `beyondpresence/client.ts` (SDK or mock)
- [x] Voice map from `visitor.language` — `voices.ts`
- [x] **Deferred trigger** — hidden until pipeline returns
- [ ] Verify total time visitor land → first speech < 2s on prod

## Phase 3 — In-call & post-call (10–15h)

- [ ] OpenAI BYO-LLM powers real-time avatar responses (BP dashboard)
- [x] On session end → `POST /api/webhooks/beyondpresence/session` — `src/webhook.ts`
- [x] Include transcript, outcome, sentimentArc, actionItems

## Phase 4 — Demo polish (15–24h)

- [ ] Rehearse demo script steps 2–4 with Person 2 + 3
- [ ] Backup recorded video if live demo fails

## Depends on Person 2

- [x] `docs/API_CONTRACT.md` received
- [ ] Production `BACKEND_URL` confirmed
- [ ] `BP_WEBHOOK_SECRET` shared (must match `backend/.env.local` — see `docs/ENV.md`)

## Implementation

- [`src/index.ts`](src/index.ts) — main integration
- [`demo/test-page.html`](demo/test-page.html) — local E2E
- [`README.md`](README.md) — setup
- Legacy reference: [`src/beyondpresence/integration.example.ts`](src/beyondpresence/integration.example.ts)

## Blockers / notes

_(add during build)_
