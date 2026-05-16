# Avatar & AI Engineer — Development Plan

**Owner**: Person 1  
**Branch**: `feature/avatar-person1`  
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
- [ ] ElevenLabs account — list voice IDs (en, si, ta)

## Phase 2 — Pre-conversation integration (4–10h)

- [ ] Listen for `presenceiq:ready` on demo site
- [ ] Call `POST {BACKEND_URL}/api/pipeline` with visitorId
- [ ] Build `buildSystemPrompt(data)` from intelligence payload
- [ ] Inject dynamic context into BeyondPresence before show
- [ ] Select ElevenLabs voice from `visitor.language` + `business.industry`
- [ ] **Deferred trigger** — avatar hidden until pipeline returns
- [ ] Verify total time visitor land → first speech < 2s

## Phase 3 — In-call & post-call (10–15h)

- [ ] OpenAI BYO-LLM powers real-time avatar responses
- [ ] On session end → `POST /api/webhooks/beyondpresence/session`
- [ ] Include transcript, outcome, sentimentArc, actionItems

## Phase 4 — Demo polish (15–24h)

- [ ] Rehearse demo script steps 2–4 with Person 2 + 3
- [ ] Backup recorded video if live demo fails

## Depends on Person 2

- [x] `docs/API_CONTRACT.md` received
- [ ] Production `BACKEND_URL` confirmed
- [ ] `BP_WEBHOOK_SECRET` shared (must match `backend/.env.local` — see `docs/ENV.md`)

## Starter code

See [`avatar/src/beyondpresence/integration.example.ts`](src/beyondpresence/integration.example.ts) for `presenceiq:ready` + pipeline call pattern.

## Blockers / notes

_(add during build)_
