# PresenceIQ Backend — Setup Guide (Person 2)

Complete setup for your track: Next.js API + Convex (`adamant-puffin-769`) + OpenAI + webhooks.

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
| `N8N_WEBHOOK_SECRET` | Recommended | Any random string (`openssl rand -hex 16`) |
| `BP_WEBHOOK_SECRET` | Recommended | Any random string (share with Person 1) |
| `SEYLAN_API_BASE_URL` | Recommended | Hackathon sandbox: `http://34.21.206.87:3000` |
| `SEYLAN_API_KEY` | Recommended | Team 8 key — header `x-api-key` on every request |
| `SEYLAN_CUSTOMER_LOOKUP_PATH` | Optional | From Seylan Web API Manual; default `/api/accounts/{accountNumber}` |
| `SEYLAN_DEMO_ACCOUNT_NUMBER` | Optional | Default `064000012548001` for Sarangan demo |
| `N8N_WEBHOOK_CRM_FETCH` | Optional | n8n webhook — if empty, uses **Seylan sandbox** then demo mock |
| `N8N_WEBHOOK_CRM_PUSH` | Optional | n8n post-call webhook |
| `N8N_WEBHOOK_SLACK` | Optional | n8n Slack hot-lead webhook |
| `CONVEX_DEPLOY_KEY` | CI only | Convex dashboard → Deploy Key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Dashboard | [Clerk → API keys](https://dashboard.clerk.com/last-active?path=api-keys) |
| `CLERK_SECRET_KEY` | Dashboard | Same page (secret key) |

### Clerk + Convex Auth

1. Create a Clerk app and enable the [Convex integration](https://dashboard.clerk.com/apps/setup/convex).
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`.
3. Set the issuer on the Convex deployment (not `.env.local`):

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-APP.clerk.accounts.dev
npx convex dev --once
```

4. After first sign-in on the backend (`/dashboard`), link your user:

```bash
npx convex run seed:seedDemo '{"clerkUserId":"user_..."}'
```

Use your real Clerk user id from Dashboard → Users (not the literal `user_...`).

Quickstart: [Clerk Next.js](https://clerk.com/docs/nextjs/getting-started/quickstart)

## 3. Verify keys

```bash
npm run check:env
```

All required keys should show `✓ configured`.

## 4. Start Convex + seed database

**Important:** All commands below must run from the `backend/` folder (where `package.json` lives), not the repo root `FlashTech/`.

```bash
cd backend
```

Terminal 1:

```bash
cd backend
npx convex dev
```

Terminal 2:

```bash
cd backend
npm install
npx convex run seed:seedDemo
npm run dev
```

Run **one command per line**. Do not put shell comments on the same line as `npm run dev` (e.g. `npm run dev # comment` breaks Next.js with a `backend/#` error).

If port 3000 is busy: `npm run dev:3001`

## 5. Seylan Bank sandbox (Team 8)

CRM enrichment priority: **n8n** → **Seylan sandbox** → **demo mock**.

Add to `.env.local` (see hackathon handout — never commit real keys to git):

```bash
SEYLAN_API_BASE_URL=http://34.21.206.87:3000
SEYLAN_API_KEY=your-team-api-key
SEYLAN_CUSTOMER_LOOKUP_PATH=/api/accounts/{accountNumber}
SEYLAN_DEMO_ACCOUNT_NUMBER=064000012548001
```

- Every request must include header: `x-api-key: <SEYLAN_API_KEY>`
- Rate limit: **100 requests / 15 minutes** per team
- Test accounts: source `064000012548001`, internal `001213437904100`

Test lookup (server-side, key not exposed to browser):

```bash
curl http://localhost:3000/api/seylan/account-inquiry
curl -X POST http://localhost:3000/api/seylan/account-inquiry \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"064000012548001"}'
```

If sandbox paths differ, set `SEYLAN_CUSTOMER_LOOKUP_PATH` from the **Seylan Web API Manual**. Fingerprint still works via demo mock when sandbox is down.

## 6. Test endpoints

```bash
# Health — should show openai + convex configured
curl http://localhost:3000/api/health

# Embed SDK
curl http://localhost:3000/api/embed/seylan-demo

# Fingerprint (demo visitor)
curl -X POST http://localhost:3000/api/fingerprint \
  -H "Content-Type: application/json" \
  -d '{"embedKey":"seylan-demo","fingerprint":"demo-sarangan-fp","path":"/pricing","language":"en"}'
```

Save `visitorId` and `businessId` from the response, then:

```bash
curl -X POST http://localhost:3000/api/pipeline \
  -H "Content-Type: application/json" \
  -d '{"visitorId":"PASTE_VISITOR_ID","businessId":"PASTE_BUSINESS_ID","waitForCrmMs":500}'
```

Expected opener mentions **Sarangan** and **Gold and Platinum plans**.

## 7. View database

Open [Convex dashboard](https://dashboard.convex.dev) → **adamant-puffin-769** → **Data**.

Tables: `businesses`, `visitors`, `intelligence`, `conversations`, `triggers`, `businessMembers`.

## Demo credentials

| Field | Value |
|-------|-------|
| embedKey | `seylan-demo` |
| fingerprint | `demo-sarangan-fp` (or set `localStorage.piq_fp`) |
| CRM ID | `CRM-001` |

## Security

If a real `OPENAI_API_KEY` was ever committed to `.env.example`, rotate it at OpenAI and use `.env.local` only.

## Troubleshooting

### `cd: no such file or directory: backend`

Your prompt already shows `backend %` — you are **inside** `backend/`. Do **not** run `cd backend` again. Run commands directly:

```bash
npm run check:env
npm run dev
```

From repo root `FlashTech %` only, run once:

```bash
cd backend
```

### `Unable to read package.json` / convex from `FlashTech/`

Convex must run where `package.json` exists:

```bash
cd /Users/venomxtechnology/Downloads/FlashTech/backend
npx convex run seed:seedDemo
```

Never paste two commands on one line (`npx convex run ...` then `npm run check:env` without Enter between them).

### `Invalid project directory ... backend/#`

`next dev` received `#` as an argument. Run `npm run dev` alone — do not put shell comments in `package.json` scripts or on the same line as the command.

### Port 3000 shows wrong app (e.g. Boardroom Ghost AI)

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

Add your key to `.env.local`. `npm run check:env` allows empty OpenAI for local demo (Sarangan fallback). Production needs a real key.

### `[CONVEX Q(businessMembers:listForCurrentUser)] Unauthorized`

Three causes (fix all that apply):

1. **Clerk keys empty in `.env.local`** — add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from [Clerk API keys](https://dashboard.clerk.com/last-active?path=api-keys), then restart `npm run dev`.

2. **Not signed in** — open `/dashboard`, click **Sign in** in the header, then refresh.

3. **Wrong Convex issuer** — you ran `CLERK_JWT_ISSUER_DOMAIN=https://YOUR-REAL-APP.clerk.accounts.dev` (placeholder). Use your real Frontend API URL from Clerk → Convex integration:

```bash
cd backend
npx convex env get CLERK_JWT_ISSUER_DOMAIN
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://actual-name-12.clerk.accounts.dev
npx convex dev --once
```

4. **Seed used fake user id** — `user_YOUR_REAL_ID` does not match your signed-in user. After sign-in, copy your user id from Clerk → Users, then:

```bash
npx convex run seed:seedDemo '{"clerkUserId":"user_2abcRealIdFromClerk"}'
```

**API-only demo (no dashboard):** use `/api/health`, embed, fingerprint, pipeline — no Clerk required.

### Clerk dashboard auth

Current issuer is a placeholder if `npx convex env get CLERK_JWT_ISSUER_DOMAIN` shows `your-app.clerk.accounts.dev` or `configure-me.clerk.accounts.dev`. Replace it:

```bash
npx convex env get CLERK_JWT_ISSUER_DOMAIN
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://YOUR-REAL-APP.clerk.accounts.dev
npx convex dev --once
```

Use your real Clerk user id from the dashboard (not `user_...`):

```bash
npx convex run seed:seedDemo '{"clerkUserId":"user_2abc..."}'
```

## More docs

- [README.md](README.md) — quick reference
- [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md) — all endpoints
- [../docs/ENV.md](../docs/ENV.md) — env index for all teammates
