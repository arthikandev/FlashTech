# PresenceIQ — Team Integration Plan

**All members update this file at each milestone.**

## Team roster

| Person | Role | Folder | Branch |
|--------|------|--------|--------|
| Person 1 | DevOps & Avatar | `avatar/` · `devops/` | `feature/avatar-person1` |
| Person 2 | Backend & Automation | `backend/` | `feature/backend-person2` |
| Person 3 | Frontend & Demo | `frontend/` | `feature/frontend-person3` |

## Integration checkpoints

| Hour | Checkpoint | P2 backend | P1 avatar | P3 frontend | Done |
|------|------------|------------|-----------|-------------|------|
| 4 | Embed + Convex visitor | [x] | [x] | [x] | [ ] |
| 10 | Personalised Sarangan E2E | [x] | [x] | [x] | [ ] |
| 15 | Slack + dashboard | [x] | [ ] | [x] | [ ] |
| 20 | Full demo script | [x] | [ ] | [x] | [ ] |
| 24 | 10 rehearsals | [ ] | [ ] | [ ] | [ ] |

## Shared URLs (fill when deployed)

- Backend (Vercel): _ (set after `vercel deploy` — see `devops/deploy/vercel.md`)
- Convex dashboard: https://dashboard.convex.dev → adamant-puffin-769
- Frontend dashboard: http://localhost:5173 (dev) / _ (Vercel)
- n8n instance: _ (import `devops/n8n/*.workflow.json`)
- Seylan demo site: http://localhost:5173/sites/seylan/index.html#/pricing

## API contract

- [x] `docs/API_CONTRACT.md` — maintained by Person 2

## Demo script ownership

| Step | Lead |
|------|------|
| 1–2 Open site + reload | P3 |
| 3 Avatar speaks | P1 (avatar) + P2 (pipeline) |
| 4 Slack alert | P1 (n8n deploy) + P2 (triggers) |
| 5 Dashboard | P3 |
| 6 Close pitch | P3 |
