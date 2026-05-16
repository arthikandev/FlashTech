# PresenceIQ Backend

Next.js API + Convex + OpenAI intent scoring.

## Environment

```bash
cp .env.example .env.local
```

Edit `backend/.env.local` only (Next.js does **not** load env from the repo root).

| Variable | Example |
|----------|---------|
| `CONVEX_DEPLOYMENT` | `dev:adamant-puffin-769` |
| `NEXT_PUBLIC_CONVEX_URL` | `https://adamant-puffin-769.convex.cloud` |
| `CONVEX_DEPLOY_KEY` | From Convex Dashboard → Deploy Key (for deploy/CI) |

The `dev:slug\|eyJ...` string from `npx convex dev` is a **dev session token** — let `convex dev` write it; do not paste it as `CONVEX_DEPLOY_KEY`.

Full list: [`.env.example`](.env.example) · [../docs/ENV.md](../docs/ENV.md)

## Setup

```bash
npm install
npx convex dev    # terminal 1 — sync schema, updates .env.local
npm run dev       # terminal 2 — http://localhost:3000
npx convex run seed:seedDemo
```

## Key routes

| Route | Description |
|-------|-------------|
| `GET /api/embed/seylan-demo` | Embed SDK for demo sites |
| `POST /api/fingerprint` | Visitor fingerprint upsert |
| `POST /api/pipeline` | Full pre-conversation pipeline |
| `POST /api/intent` | Intent score only |

See [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md).

## Demo

Use fingerprint `demo-sarangan-fp` in localStorage key `piq_fp`, or run seed and reload embed on a page with `seylan-demo` embed key.
