# PresenceIQ Avatar (Person 1)

BeyondPresence integration: `presenceiq:ready` → `/api/pipeline` → personalised opener → post-call webhook.

## Setup

```bash
cd avatar
cp .env.example .env.local          # server-side keys (optional for local)
cp demo/config.example.js demo/config.js
npm install
npm run build
```

Edit `demo/config.js`:

- `backendUrl` — `http://localhost:3000` or Vercel URL
- `bpWebhookSecret` — must match `backend/.env.local`
- `beyondPresenceApiKey` + `bpAgentId` — from BeyondPresence dashboard (or leave empty for mock mode)

## Run test page

1. Start backend: `cd backend && npx convex dev` + `npm run dev`
2. Seed: `npx convex run seed:seedDemo`
3. Serve demo folder (any static server), e.g. `npx serve demo`
4. Open `test-page.html`, click **Use Sarangan fingerprint**, reload
5. Avatar should show personalised opener (mock UI without BP keys)

## Build

```bash
npm run build   # → demo/, frontend/public/, backend/public/presenceiq-avatar.js
```

Session-end webhooks resolve visitor/business from module state at flush time (not the first
`presenceiq:ready` closure). Run one visible avatar call per embed instance at a time; a new
`presenceiq:ready` clears the prior visible call context.

## Embed on Person 3 site

```html
<div id="presenceiq-avatar"></div>
<script>
  window.__PRESENCEIQ_CONFIG__ = {
    backendUrl: "https://YOUR_VERCEL_APP.vercel.app",
    bpWebhookSecret: "YOUR_BP_SECRET",
    beyondPresenceApiKey: "…",
    bpAgentId: "…",
    mockMode: false,
  };
</script>
<script src="https://YOUR_VERCEL_APP.vercel.app/api/embed/seylan-demo" async></script>
<script src="/path/to/presenceiq-avatar.js"></script>
```

## BYO-LLM (OpenAI in BeyondPresence)

Configure in BP dashboard with the same `OPENAI_API_KEY` as backend.

## Docs

- [../dev.md](../dev.md) — full DevOps + Avatar tracker
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)
