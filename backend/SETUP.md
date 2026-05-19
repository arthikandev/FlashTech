# PresenceIQ Backend — Setup Guide

Complete setup for the backend track: Next.js API + Convex (`adamant-puffin-769`) + OpenAI + webhooks.

## 1. Copy environment file

```bash
cd backend
cp .env.example .env.local
```

Never commit `.env.local`. Only put real secrets there.

## 2. Fill API keys

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | [Convex dashboard](https://dashboard.convex.dev) → **adamant-puffin-769** → Settings → URL |
| `CONVEX_DEPLOYMENT` | Yes | Same project → `dev:adamant-puffin-769` |
| `OPENAI_API_KEY` | Yes | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` for local dev |
| `INBOUND_WEBHOOK_SECRET` | Recommended | Random string — automation must send `X-Webhook-Secret` to `/api/webhooks/crm-ingest` |
| `N8N_WEBHOOK_SECRET` | Legacy alias | Same value as `INBOUND_WEBHOOK_SECRET` if you still use the old name |
| `BEYONDPRESENCE_API_KEY` | Avatar sync | [app.bey.chat/settings](https://app.bey.chat/settings) — backend only, not avatar |
| `BP_WEBHOOK_SECRET` | Recommended | Any random string |
| `WEBHOOK_CRM_FETCH_TRIGGER` | Optional | HTTPS URL — CRM enrichment trigger (legacy: `N8N_WEBHOOK_CRM_FETCH`) |
| `WEBHOOK_CRM_PUSH` | Optional | Post-call CRM log URL (legacy: `N8N_WEBHOOK_CRM_PUSH`) |
| `WEBHOOK_SLACK_HOT_LEAD` | Optional | Hot-lead Slack relay URL (legacy: `N8N_WEBHOOK_SLACK`) |
| `WEBHOOK_CHURN_RISK` | Optional | Churn workflow URL (legacy: `N8N_WEBHOOK_CHURN`) |
| `CONVEX_DEPLOY_KEY` | CI only | Convex dashboard → Deploy Key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Canvas auth | [Clerk → API keys](https://dashboard.clerk.com/last-active?path=api-keys) |
| `CLERK_SECRET_KEY` | Canvas auth | Same page (secret key) |

### Clerk + Convex Auth

1. Create a Clerk app and enable the [Convex integration](https://dashboard.clerk.com/apps/setup/convex).
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`.
3. Set the issuer on the Convex deployment (not `.env.local`):

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-APP.clerk.accounts.dev
npx convex dev --once
```

Users create their workspace via the frontend onboarding flow (`/onboard` / `/client/setup`); no manual seed step is required.

Quickstart: [Clerk Next.js](https://clerk.com/docs/nextjs/getting-started/quickstart)

## 3. Verify keys

```bash
npm run check:env
```

All required keys should show `✓ configured`.

### Onboarding API (create a business + embed snippet)

```bash
curl -s -X POST http://localhost:3001/api/businesses/onboard \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","industry":"saas","personaTone":"friendly"}' | jq
```

Returns `embedKey`, `embedSnippet`, and `embedUrl`. Use the frontend wizard at `http://localhost:5173/onboard` for the same flow.

## 4. Start Convex + frontend onboarding

**Important:** All commands below must run from the `backend/` folder (where `package.json` lives), not the repo root `FlashTech/`.

Terminal 1:

```bash
cd backend
npx convex dev
```

Terminal 2:

```bash
cd backend
npm install
npx convex run categories:seedCategories
npm run dev
```

`categories:seedCategories` inserts the six industry rows (`hotel` → `HOTELS_TOURISM`, etc.) required by `clients:createAccount`. `createAccount` also auto-seeds if missing, but run this once on new Convex deployments.

Once the dev server is running, complete onboarding in the frontend (`/register` → `/client/setup`) to create your first business.

If port 3000 is busy: `npm run dev:3001`

## 5. Beyond Presence (live avatar)

Full guide: [../docs/BEYOND_PRESENCE.md](../docs/BEYOND_PRESENCE.md)

1. Add to `backend/.env.local` (never commit):

```bash
BEYONDPRESENCE_API_KEY=sk-your-key-from-bey-dashboard
```

2. Verify:

```bash
curl http://localhost:3000/api/beyondpresence/status
```

Expect `"verified": true` and a list of agents.

3. Create an agent in [Beyond Presence dashboard](https://app.bey.chat), copy the agent ID, and set it on your business via the canvas Settings page (Avatar tab) or via the onboarding wizard.

4. Each `POST /api/pipeline` call will `PATCH` that agent with intent score, system prompt, and personalised greeting.

## 6. Outbound webhook automation

Guide: [../devops/AUTOMATION_WEBHOOKS.md](../devops/AUTOMATION_WEBHOOKS.md)

1. Paste HTTPS webhook URLs into `.env.local` (`WEBHOOK_*` keys; legacy `N8N_WEBHOOK_*` still work).
2. Set `INBOUND_WEBHOOK_SECRET` so your enrichment tool can call `POST /api/webhooks/crm-ingest` with `X-Webhook-Secret`.
3. Restart `npm run dev`

Test:

```bash
npm run test:webhooks
# or: bash ../devops/scripts/test-automation-flow.sh
```

Automation fires on:
- **Fingerprint** → CRM-fetch webhook (when configured)
- **Pipeline** → hot-lead Slack when intent ≥ 80
- **Post-call webhook** → CRM push + Convex triggers

## 7. Verify all layers

**Quick (CI / no outbound webhooks required):**

```bash
npm run verify:all
npm run status
```

**Full stack (outbound webhook URLs required in `.env.local`):**

1. Set `WEBHOOK_CRM_FETCH_TRIGGER`, `WEBHOOK_SLACK_HOT_LEAD`, `WEBHOOK_CRM_PUSH` (or legacy `N8N_*` equivalents).
2. Run:

```bash
npm run check:env:full
npm run verify:full
npm run validate:webhooks
```

| Command | What it checks |
|---------|----------------|
| `npm run verify:all` | Env (required keys) + build + Convex |
| `npm run verify:full` | Above + valid HTTPS webhook URLs + smoke POST |
| `npm run check:env:full` | Env only, fails if required outbound webhook URLs missing |
| `npm run validate:webhooks` | POST ping to each webhook URL |
| `npm run status` | One-screen integration summary from `.env.local` |
| `npm run test:webhooks` | E2E API flow (dev server must be running) |

## 8. Test endpoints

```bash
# Health — should show openai + convex + beyondPresence configured
curl http://localhost:3000/api/health
curl http://localhost:3000/api/beyondpresence/status

# Embed SDK (substitute your real embedKey from onboarding)
curl http://localhost:3000/api/embed/<embedKey>

# Fingerprint
curl -X POST http://localhost:3000/api/fingerprint \
  -H "Content-Type: application/json" \
  -d '{"embedKey":"<embedKey>","fingerprint":"<fp>","path":"/pricing","language":"en"}'
```

Save `visitorId` and `businessId` from the response, then:

```bash
curl -X POST http://localhost:3000/api/pipeline \
  -H "Content-Type: application/json" \
  -d '{"visitorId":"PASTE_VISITOR_ID","businessId":"PASTE_BUSINESS_ID","waitForCrmMs":500}'
```

Response should include `beyondPresence.synced: true` when `BEYONDPRESENCE_API_KEY` and `bpAgentId` are set.

## 9. View database

Open [Convex dashboard](https://dashboard.convex.dev) → **adamant-puffin-769** → **Data**.

Tables: `businesses`, `visitors`, `intelligence`, `conversations`, `triggers`, `businessMembers`.

## Security

If a real `OPENAI_API_KEY` was ever committed to `.env.example`, rotate it at OpenAI and use `.env.local` only.

## Troubleshooting

### `cd: no such file or directory: backend`

Your prompt already shows `backend %` — you are **inside** `backend/`. Do **not** run `cd backend` again. Run commands directly:

```bash
npm run check:env
npm run dev
```

### `Invalid project directory ... backend/#`

`next dev` received `#` as an argument. Run `npm run dev` alone — do not put shell comments in `package.json` scripts or on the same line as the command.

### Port 3000 shows wrong app

Another process owns port 3000:

```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

Or use port 3001:

```bash
npm run dev:3001
curl http://localhost:3001/api/health
```

Health must return JSON with `"service":"presenceiq-backend"`, not HTML 404.

### `OPENAI_API_KEY` missing

Add your key to `.env.local`. Without it, intent scoring falls back to a heuristic; for production set a real key.

### `[CONVEX Q(businessMembers:listForCurrentUser)] Unauthorized`

1. **Clerk keys empty in `.env.local`** — add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from [Clerk API keys](https://dashboard.clerk.com/last-active?path=api-keys), then restart `npm run dev`.

2. **Not signed in** — open the canvas workspace, sign in, then refresh.

3. **Wrong Convex issuer** — `CLERK_JWT_ISSUER_DOMAIN` was set to a placeholder. Use your real Frontend API URL from Clerk → Convex integration:

```bash
cd backend
npx convex env get CLERK_JWT_ISSUER_DOMAIN
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://actual-name-12.clerk.accounts.dev
npx convex dev --once
```

## More docs

- [README.md](README.md) — quick reference
- [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md) — full request/response schemas
- [../docs/BEYOND_PRESENCE.md](../docs/BEYOND_PRESENCE.md) — avatar integration deep-dive
