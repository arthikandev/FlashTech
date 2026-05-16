# PresenceIQ Backend

Next.js API + Convex + OpenAI intent scoring.

**Full setup:** [SETUP.md](SETUP.md) — API keys, Convex, seed, test commands.

## Quick start

```bash
cp .env.example .env.local   # add OPENAI_API_KEY in .env.local only
npm install
npm run check:env
npx convex dev               # terminal 1
npx convex run seed:seedDemo # terminal 2
npm run dev                  # terminal 2 — http://localhost:3000
# If port 3000 is another app: npm run dev:3001
```

## API keys (`.env.local`)

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes |
| `OPENAI_API_KEY` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes |
| `N8N_WEBHOOK_SECRET` / `BP_WEBHOOK_SECRET` | Recommended |
| `SEYLAN_API_*` | Recommended (hackathon sandbox CRM) |
| `N8N_WEBHOOK_*` | Optional (else Seylan → demo mock) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Dashboard (`/dashboard`) |
| `CLERK_SECRET_KEY` | Dashboard |

Convex deployment: `dev:adamant-puffin-769` · `https://adamant-puffin-769.convex.cloud`

## Clerk + Convex Auth (dashboard)

- **Next.js:** `@clerk/nextjs` in `src/proxy.ts` — pages require sign-in; `/api/*` stays public.
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
| `/dashboard` | Live sessions (Clerk + Convex; sign-in required) |
| `GET /api/health` | Config status for convex, openai, n8n |
| `GET /api/embed/seylan-demo` | Embed SDK for demo sites |
| `POST /api/fingerprint` | Visitor fingerprint upsert |
| `POST /api/pipeline` | Full pre-conversation pipeline |
| `GET/POST /api/seylan/account-inquiry` | Test Seylan sandbox CRM lookup |
| `POST /api/intent` | Intent score only |

See [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js on port 3000 |
| `npm run dev:3001` | Start Next.js when port 3000 is busy |
| `npm run check:env` | Validate `.env.local` |
| `npm run seed` | Seed Seylan Bank demo data |
| `npm run convex:dev` | Start Convex sync |
