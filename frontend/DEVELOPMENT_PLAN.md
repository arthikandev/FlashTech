# Frontend & Demo Lead — Development Plan

**Owner:** Person 3  
**Branch:** `feature/frontend-person3`  
**Tools:** React, Vite, TypeScript, Tailwind, Convex React client  
**Guide:** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

---

## Team checkpoints (your column)

Aligned with [docs/DEVELOPMENT_PLAN.md](../docs/DEVELOPMENT_PLAN.md) — do not edit that file; update checkboxes here.

| Hour | Checkpoint | Done |
|------|------------|------|
| 4 | Embed + visitor on Seylan demo | [ ] |
| 10 | Reload shows visitor in dashboard (Sarangan E2E) | [ ] |
| 15 | Live dashboard with intent scores (reactive) | [ ] |
| 20 | Full demo script ready | [ ] |
| 24 | 3 demo sites + pitch + 10 rehearsals | [ ] |

---

## Repo layout (frontend only)

```
frontend/
  README.md
  DEVELOPMENT_GUIDE.md
  DEVELOPMENT_PLAN.md          ← this file
  .env.example / .env.local
  package.json
  vite.config.ts
  tailwind.config.js
  index.html
  src/
    main.tsx
    App.tsx
    index.css
    lib/convex.tsx             # ConvexProvider
    convex/
      api.ts                   # Client query refs (paths match backend)
      types.ts                 # Response shapes for dashboard
    components/
      EmbedScript.tsx
      Layout.tsx
    dashboard/
      LiveSessions.tsx
      SessionDetail.tsx
      DashboardPage.tsx
    demos/
      SeylanPage.tsx
      CloudMetricsPage.tsx
      CoralPage.tsx
      DemoLayout.tsx
  public/
    fake-crm.json
```

Convex queries: `src/convex/api.ts` (client shim). ID types: `backend/convex/_generated/dataModel` (types only).

---

## Phase 0 — Setup (0–1h)

- [x] `README.md` + `DEVELOPMENT_GUIDE.md`
- [x] Scaffold Vite + React + TypeScript + Tailwind
- [x] `ConvexProvider` + `VITE_CONVEX_URL`
- [x] React Router: home, dashboard, three demos
- [ ] Copy `.env.example` → `.env.local` on your machine

---

## Phase 1 — Foundation (1–4h) → Hour 4

- [x] Fake Seylan Bank page (pricing prominent)
- [x] `EmbedScript` using `VITE_BACKEND_URL`
- [x] `public/fake-crm.json` (seed CRM)
- [ ] Second-screen layout polish (dashboard full-width for demo)
- [ ] Verify `presenceiq:ready` with backend running

---

## Phase 2 — Demo sites (4–10h) → Hour 10

- [x] Seylan — `embedKey: seylan-demo`
- [x] CloudMetrics — `embedKey: cloudmetrics-demo`
- [x] Coral — `embedKey: coral-demo`
- [ ] Reload test: same browser → dashboard updates without refresh
- [ ] Record demo URLs in README live table

---

## Phase 3 — Live dashboard (10–18h) → Hour 15

- [x] `businesses.getByEmbedKey` → `businessId` selector
- [x] `intelligence.listLiveSessions` — session table
- [x] `intelligence.getSessionDetail` — detail panel
- [ ] Intent scores visible after P1+P2 pipeline run
- [ ] UI polish: intent badge, opener, recommended action

---

## Phase 4 — Demo polish (18–24h) → Hour 20–24

- [ ] Pitch deck assets in `frontend/` (or linked deck)
- [ ] Rehearsal script (steps 1–2, 5–6)
- [ ] Frontend deploy (Vercel/Netlify) — env: `VITE_BACKEND_URL`, `VITE_CONVEX_URL`
- [ ] 10 rehearsals logged
- [ ] Live URLs filled in README

---

## Depends on Person 2 (request via Slack; no backend edits)

- [x] API contract + query names — [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md)
- [ ] Production `VITE_BACKEND_URL` (Vercel backend URL for embed `src`)
- [ ] Confirmed `VITE_CONVEX_URL` (dev + prod after `convex deploy`)

---

## Embed snippet

```html
<script src="http://localhost:3000/api/embed/seylan-demo" async></script>
```

In React, use `EmbedScript` with `embedKey="seylan-demo"` and `import.meta.env.VITE_BACKEND_URL`.

---

## Blockers / notes

_(add during build)_
