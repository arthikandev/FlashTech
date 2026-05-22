# PresenceIQ — DevOps & Avatar (Person 1)

Personal execution tracker. Supplements [`avatar/DEVELOPMENT_PLAN.md`](avatar/DEVELOPMENT_PLAN.md) and [`devops/DEVELOPMENT_PLAN.md`](devops/DEVELOPMENT_PLAN.md).

---

## 1. Role & boundaries

| In scope | Out of scope |
|----------|--------------|
| [`devops/`](devops/) deploy guides, n8n import, integration scripts | `backend/src/**` API implementation |
| [`avatar/`](avatar/) BeyondPresence + pipeline + post-call webhook | `frontend/src/**` React UI |
| This file + posting URLs in README | Changing `docs/API_CONTRACT.md` |

**Branch:** `feature/avatar-person1`

### Windows quick start (PowerShell script policy)

If `npx` / `npm` fail with *running scripts is disabled*, use **Command Prompt** or `.cmd` shims:

```bat
cd backend
copy .env.example .env.local
npx.cmd convex dev
```

Second terminal:

```bat
cd backend
npm.cmd run dev
```

Demo:

```bat
cd avatar\demo
npx.cmd serve . -p 5174
```

Open http://localhost:5174/test-page.html

---

## 2. Part summary

Deploy Convex + Vercel backend, configure n8n (CRM fetch, hot-lead Slack), align secrets across tracks, and own the BeyondPresence agent: `presenceiq:ready` → `/api/pipeline` → personalised opener (&lt;2s) → post-call transcript webhook.

**Success:** Demo step 3 (“Welcome back Sarangan…”), step 4 Slack on hot lead, production URLs unblock P2/P3.

---

## 3. Shared URLs

| Service | URL | Status |
|---------|-----|--------|
| Backend (Vercel) | https://backend-blond-theta-13.vercel.app | [x] |
| Convex dashboard | https://adamant-puffin-769.convex.cloud | [x] |
| Frontend dashboard | https://frontend-nu-neon-44.vercel.app/dashboard | [x] |
| n8n instance | Import workflows — [devops/n8n/PRODUCTION.md](devops/n8n/PRODUCTION.md) | [ ] |
| Avatar test page | `avatar/demo/test-page.html` (local) | [x] |
| CloudMetrics demo site | https://frontend-nu-neon-44.vercel.app/sites/cloudmetrics/index.html#/pricing | [x] |

Also update [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) and root [`README.md`](README.md).

---

## 4. Environment matrix

| Variable | Set by | Dev | Prod | Must match |
|----------|--------|-----|------|------------|
| `NEXT_PUBLIC_CONVEX_URL` | You (D1) | `backend/.env.local` | Vercel | P3 `VITE_CONVEX_URL` |
| `BP_WEBHOOK_SECRET` | You (D0) | backend + avatar | Vercel + avatar | **critical** |
| `N8N_WEBHOOK_SECRET` | You (D0) | backend + n8n | Vercel + n8n | — |
| `NEXT_PUBLIC_APP_URL` | You (D2) | `http://localhost:3000` | Vercel URL | avatar `BACKEND_URL` |
| `N8N_WEBHOOK_*` | You (D3) | backend | Vercel | n8n workflow URLs |
| `BEYONDPRESENCE_API_KEY` | You | `avatar/.env.local` | BP dashboard | — |
| `PRESENCEIQ_BACKEND_URL` | You (D2) | n8n | n8n | Vercel URL |

Generate secrets: `node devops/scripts/generate-secrets.js` → copies to `devops/.secrets.local` (gitignored). Share with P2 immediately.

---

## 5. Backend dependency (read-only)

| When | API | Notes |
|------|-----|-------|
| After embed | `presenceiq:ready` event | `visitorId`, `businessId`, `sessionId` |
| Pre-call | `POST /api/pipeline` | Body: `{ visitorId, businessId, waitForCrmMs: 500 }` |
| Post-call | `POST /api/webhooks/beyondpresence/session` | Header `X-BP-Webhook-Secret` |

Contract: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)

**Demo:** `embedKey=cloudmetrics-demo`, `localStorage.setItem('piq_fp','demo-sarangan-fp')`, expected opener mentions Sarangan.

---

## 6. Frontend dependency (read-only)

| P3 delivers | You need |
|-------------|----------|
| CloudMetrics + embed script | `BACKEND_URL` after D2 |
| `#presenceiq-avatar` container | You control visibility (deferred trigger) |
| Dashboard | `VITE_CONVEX_URL` from D1 |

**Unblocker:** [`avatar/demo/test-page.html`](avatar/demo/test-page.html) — do not wait for P3.

---

## 7. Parallel hour timeline

| Hour | DevOps | Avatar |
|------|--------|--------|
| 0–1 | D0 secrets → [`devops/scripts/generate-secrets.js`](devops/scripts/generate-secrets.js) | A0 scaffold + test page |
| 1–4 | D1 Convex deploy + seed | A1 BP agent + generic greeting |
| 4–10 | D2 Vercel + smoke curl | A2 pipeline + deferred trigger |
| 10–15 | D3 n8n → [`devops/n8n/SETUP.md`](devops/n8n/SETUP.md) | A3 post-call webhook |
| 15–20 | D4 frontend deploy → [`devops/deploy/frontend.md`](devops/deploy/frontend.md) | Rehearse demo |
| 18–20 | Integration script → [`devops/scripts/integration-test.ps1`](devops/scripts/integration-test.ps1) | E2E on prod |
| 20–24 | Document env; CI in [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml) | 10 rehearsals + backup video |

---

## 8. DevOps checklist

### D0 — Secrets
- [x] `devops/scripts/generate-secrets.js`
- [x] Run script → `devops/.secrets.local` (gitignored); share with P2
- [ ] `cp avatar/.env.example avatar/.env.local` (optional; demo uses `demo/config.js`)

### D1 — Convex
- [ ] `cd backend && npm install`
- [ ] Set `CONVEX_DEPLOY_KEY` in `backend/.env.local`
- [ ] `npx convex deploy` && `npx convex run seed:seedDemo`
- [ ] Post Convex URL in section 3 above

### D2 — Vercel backend
- [ ] Import repo; root directory `backend`
- [ ] All env vars from section 4
- [ ] `curl $BACKEND_URL/api/health`
- [ ] Pipeline curl with Sarangan visitor ids

### D3 — n8n
- [ ] Follow [`devops/n8n/SETUP.md`](devops/n8n/SETUP.md)
- [ ] Wire `N8N_WEBHOOK_*` into Vercel; redeploy

### D4 — Frontend deploy
- [ ] Follow [`devops/deploy/frontend.md`](devops/deploy/frontend.md) when P3 ready

### D5 — Stretch
- [x] GitHub Actions backend CI
- [x] Frontend deploy doc

---

## 9. Avatar checklist

### A0 — Scaffold
- [x] `avatar/package.json`, `tsconfig.json`, `src/*`
- [x] `npm run build` → `demo/presenceiq-avatar.js`
- [x] `demo/test-page.html`

### A1 — Foundation
- [ ] BeyondPresence account + `BEYONDPRESENCE_API_KEY` in `.env.local`
- [ ] Create CloudMetrics bank agent; set `bpAgentId` in `demo/config.js`
- [ ] Generic greeting on test page (or mock mode without key)

### A2 — Pipeline
- [x] `presenceiq:ready` handler in [`avatar/src/index.ts`](avatar/src/index.ts)
- [x] Deferred trigger on `#presenceiq-avatar`
- [ ] E2E: Sarangan opener on prod

### A3 — Post-call
- [x] [`avatar/src/webhook.ts`](avatar/src/webhook.ts) + session end hook in client
- [ ] Verify Convex `conversations` row + Slack on hot lead

### A4 — Polish
- [ ] 10 rehearsals; backup video
- [ ] PR from `feature/avatar-person1`

**Run locally:** see [`avatar/README.md`](avatar/README.md)

---

## 10. Avatar file tree

```
avatar/
├── package.json
├── tsconfig.json
├── README.md
├── demo/
│   ├── test-page.html
│   ├── config.example.js
│   └── presenceiq-avatar.js    # npm run build
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── pipeline.ts
│   ├── webhook.ts
│   └── beyondpresence/
│       ├── client.ts
│       └── voices.ts
└── DEVELOPMENT_PLAN.md
```

---

## 11. Integration test playbook (hour 20)

Set `$env:BACKEND_URL` (PowerShell) or `BACKEND_URL` (bash), then:

```powershell
.\devops\scripts\integration-test.ps1
```

| # | Test | Pass |
|---|------|------|
| 1 | GET /api/health | status ok |
| 2 | GET /api/embed/cloudmetrics-demo | JS body |
| 3 | POST /api/fingerprint | visitorId |
| 4 | POST /api/pipeline | Sarangan opener, pipelineMs &lt; 2000 |
| 5 | POST /api/webhooks/n8n/crm | 200 |
| 6 | Live reload test page | personalised speech |
| 7 | POST /api/webhooks/beyondpresence/session | 200 |
| 8 | Slack | message (n8n) |
| 9 | P3 dashboard | session visible |

Record results in section 16 below.

---

## 12. Demo script — your steps

| Step | Lead | You |
|------|------|-----|
| 1–2 | P3 | Confirm embed on prod URL |
| **3** | **You + P2** | Avatar speaks within 2s |
| **4** | P2/n8n | Verify post-call + Slack |
| 5–6 | P3 | Convex URL from D1 |

---

## 13. Handoff templates

**To P2 (after D0):**

> Add to `backend/.env.local` and Vercel:
> `BP_WEBHOOK_SECRET` and `N8N_WEBHOOK_SECRET` from `devops/.secrets.local` (run generate-secrets script).

**To P3 (after D2):**

> Backend: `https://<app>.vercel.app`
> Embed: `<script src="https://<app>.vercel.app/api/embed/cloudmetrics-demo" async></script>`
> Convex: `<url>` → `VITE_CONVEX_URL`
> Add `<motion id="presenceiq-avatar"></motion>` — avatar script controls visibility.

**To team (after D1):**

> Convex URL ready; `seed:seedDemo` run. P3 can wire dashboard.

---

## 14. Risk register

| Risk | Mitigation |
|------|------------|
| P3 frontend late | `avatar/demo/test-page.html` |
| Pipeline &gt; 2s | Lower `waitForCrmMs`; test prod early |
| BP outage | Mock client + backup video |
| Secret mismatch | Single D0 generate; curl webhook test |
| n8n down | Manual CRM webhook curl |

---

## 15. Definition of done

| Milestone | DevOps | Avatar |
|-----------|--------|--------|
| Hour 4 | Convex URL shared | Generic greeting / mock |
| Hour 10 | Vercel + pipeline curl | Sarangan opener E2E |
| Hour 15 | n8n CRM + Slack | Post-call saved |
| Hour 20 | 9 integration tests | Full demo steps 2–4 |
| Hour 24 | Env documented here | 10 rehearsals + video |

---

## 16. Blockers log

| Time | Blocker | Owner | Resolution |
|------|---------|-------|------------|
| | | | |

---

## 17. Demo polish (hour 24)

- [ ] 10 full demo rehearsals with P2 + P3
- [ ] Record backup demo video (BP outage fallback)
- [ ] Open PR from `feature/avatar-person1` (only `avatar/`, `devops/`, `dev.md`, `.github/`)

---

## 18. Integration test results (hour 20)

| # | Pass | Notes |
|---|------|-------|
| 1 | [ ] | |
| 2 | [ ] | |
| 3 | [ ] | |
| 4 | [ ] | |
| 5 | [ ] | |
| 6 | [ ] | |
| 7 | [ ] | |
| 8 | [ ] | |
| 9 | [ ] | |
