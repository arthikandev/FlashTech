# Avatar & AI Engineer — Development Plan

**Owner**: Person 1 (DevOps + Avatar)  
**Branch**: `feature/avatar-person1`  
**Tracker**: [../dev.md](../dev.md)  
**Package**: `avatar/src/` — BeyondPresence, OpenAI BYO-LLM, ElevenLabs

## Milestones

- [x] Hour 4 — Module scaffold + generic greeting path
- [x] Hour 10 — `presenceiq:ready` → `POST /api/pipeline` + deferred avatar
- [x] Hour 15 — Post-call webhook client
- [ ] Hour 24 — 10 rehearsals (BP agent + voice selection)

## Implemented modules

- [x] `src/index.ts` — `bootstrap` + pipeline on `presenceiq:ready`
- [x] `src/beyondpresence/client.ts` — BP SDK / mock + voice map
- [x] `src/pipeline.ts` — fetch pipeline + `buildSystemPrompt`
- [x] `src/webhook.ts` — post-call session payload
- [x] `src/elevenlabs/selectVoice.ts` — industry + language → voice_id (legacy map)
- [x] `demo/test-page.html` — local E2E

## Remaining (Person 1 / ops)

- [x] `BEYONDPRESENCE_API_KEY` on backend + `bpAgentId` in seed
- [ ] OpenAI BYO-LLM inside Beyond Presence agent (BP dashboard)
- [ ] Verify visitor land → first speech < 2s on prod
- [ ] Backup recorded demo video

## Depends on Person 2

- [x] `docs/API_CONTRACT.md`
- [ ] Production `BACKEND_URL` / ngrok for n8n
- [x] `BP_WEBHOOK_SECRET` (embed script injects `window.__piq_bp_webhook_secret`)

## Implementation

- [`src/index.ts`](src/index.ts) — main integration
- [`demo/test-page.html`](demo/test-page.html) — local E2E
- [`README.md`](README.md) — setup
- Legacy: [`src/beyondpresence/integration.example.ts`](src/beyondpresence/integration.example.ts)
