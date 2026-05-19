# PresenceIQ — Frontend (Person 3)

**Role:** Frontend & Demo Lead  
**Branch:** `feature/frontend-person3`  
**Stack:** Vite, React, TypeScript, Tailwind, Convex React client

## Start here

1. [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) — how to work, env, embed, Convex, E2E checks  
2. [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) — milestones and task checklist  

## What I deliver

- Three embed demo sites (CloudMetrics, CloudMetrics, Coral)
- PresenceIQ embed on each demo page (`presenceiq:ready`)
- Live operator dashboard (reactive Convex sessions + detail)
- Second-screen layout for investor demo
- Pitch deck + rehearsal script (steps 1–2, 5–6 of team demo)

## Quick start

```bash
# Terminal 1 — Person 2 (you only run this locally; do not edit backend/)
cd backend && npm install && npm run dev
# optional: npm run convex:dev && npm run seed

# Terminal 2 — you
cd frontend
cp .env.example .env.local   # set VITE_CONVEX_URL to match backend
npm install
npm run dev
```

Open http://localhost:5173 — cinematic landing at `/`; dashboard and demos on their routes. Convex connects **only** on `/dashboard` (copy `.env.local` first).

## Frontend pages (5 routes)

| Route | Page |
|-------|------|
| `/` | Marketing landing — Hero, About, demo selector, Features, infinite-scroll testimonials, cinematic footer |
| `/canvas` | Live Convex operator workspace |
| `/sites/cloudmetrics/index.html` | CloudMetrics static embed demo |
| `/sites/cloudmetrics/index.html` | CloudMetrics SaaS static embed demo |
| `/sites/coral/index.html` | Coral Resort static embed demo |

UI components live in `src/components/ui/` (shadcn-style: `motion-footer`, `testimonials-columns-1`).

## Live URLs (fill when deployed)

| Service | URL |
|---------|-----|
| Frontend dashboard | _ |
| CloudMetrics demo | _ |
| CloudMetrics demo | _ |
| Coral demo | _ |

Backend and Convex URLs are owned by Person 2; use their values in `.env.local` only.

## Do not edit

- `backend/` — APIs, Convex schema, embed SDK source
- `avatar/` — BeyondPresence
- `devops/` — deploy scripts, automation webhook notes
- `docs/` — shared team docs (read and link only)
