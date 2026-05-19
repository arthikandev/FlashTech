# PresenceIQ Backend

Next.js API + Convex + OpenAI intent scoring.

**Full setup:** [SETUP.md](SETUP.md) — API keys, Convex, test commands.

## Quick start

```bash
cp .env.example .env.local   # add OPENAI_API_KEY in .env.local only
npm install
npm run check:env
npx convex dev               # terminal 1
npm run dev                  # terminal 2 — http://localhost:3000
# If port 3000 is another app: npm run dev:3001
```

## API keys (`.env.local`)

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes |
| `OPENAI_API_KEY` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes |
| `BEYONDPRESENCE_API_KEY` | Recommended (avatar agent sync) |
| `INBOUND_WEBHOOK_SECRET` / `BP_WEBHOOK_SECRET` | Recommended (webhook verification) |
| `WEBHOOK_*` outbound URLs | Optional (CRM fetch / Slack / churn webhooks); legacy `N8N_WEBHOOK_*` still supported |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Canvas workspace auth |
| `CLERK_SECRET_KEY` | Canvas workspace auth |

Convex deployment: `dev:adamant-puffin-769` · `https://adamant-puffin-769.convex.cloud`

## Clerk + Convex Auth (dashboard)

- **Next.js:** `@clerk/nextjs` in `src/middleware.ts` — pages require sign-in; `/api/*` stays public.
- **Convex:** JWT validation in `convex/auth.config.ts`; data queries use `ctx.auth.getUserIdentity()`.

```bash
# .env.local — Clerk API keys from dashboard.clerk.com
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-APP.clerk.accounts.dev
npx convex dev --once
```

Open `/dashboard` after sign-in. See [SETUP.md](SETUP.md).

## Key routes

| Route | Description |
|-------|-------------|
| `GET /api/health` | Config status + automation integration flags |
| `GET /api/beyondpresence/status` | Verify BP API key + list agents |
| `GET /api/embed/<embedKey>` | Embed SDK for a business |
| `POST /api/fingerprint` | Visitor fingerprint upsert |
| `POST /api/pipeline` | Full pre-conversation pipeline |
| `POST /api/intent` | Intent score only |

See [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md) · [../docs/BEYOND_PRESENCE.md](../docs/BEYOND_PRESENCE.md) · [../docs/API_PROVIDERS.md](../docs/API_PROVIDERS.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js on port 3000 |
| `npm run dev:3001` | Start Next.js when port 3000 is busy |
| `npm run check:env` | Validate `.env.local` |
| `npm run check:env:full` | Env + required outbound webhook URLs |
| `npm run verify:all` | Env + build + Convex (all layers) |
| `npm run verify:full` | Full stack + webhook URL validation + smoke POST |
| `npm run validate:webhooks` | POST ping outbound webhook URLs |
| `npm run status` | Integration summary from `.env.local` |
| `npm run test:webhooks` | E2E integration test (dev server required) |
| `npm run validate:n8n` | Alias → `validate:webhooks` |
| `npm run test:n8n` | Alias → `test:webhooks` |
| `npm run convex:dev` | Start Convex sync |
