# PresenceIQ — Hour 20 & Hour 24 integration checklist

Run before demo. All commands from `backend/` unless noted.

## Hour 20 — Full demo script

- [ ] Backend: `npm run dev:3001` (or Vercel URL)
- [ ] Frontend: `cd frontend && npm run dev` → dashboard at http://localhost:5173
- [ ] Seylan: http://localhost:5173/sites/seylan/index.html#/pricing
- [ ] Reload pricing → Sarangan personalised opener &lt; 2s (`pipelineMs` in console)
- [ ] Intent ≥ 80 → Slack (n8n) or mock at `/slack`
- [ ] Dashboard shows session row without refresh
- [ ] `PRESENCEIQ_BACKEND_URL=http://localhost:3001 npm run test:n8n` passes

## Hour 24 — Rehearsals

- [ ] 10 consecutive demo runs (steps 1–6)
- [ ] Backup demo video recorded (avatar/)
- [ ] `npm run verify:full` exits 0 (requires n8n URLs in `.env.local`)
- [ ] All boxes in `docs/DEVELOPMENT_PLAN.md` signed off

## Cross-track API tests (P2)

- [ ] `upsertFingerprint` new + return visitor
- [ ] n8n CRM patches Sarangan name
- [ ] `/api/intent` score ≥ 90 for demo fingerprint
- [ ] `/api/pipeline` `pipelineMs` &lt; 2000
- [ ] BP webhook creates conversation + trigger
- [ ] `listLiveSessions` reactive update
