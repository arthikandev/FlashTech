# D1 — Convex deploy checklist (Person 1)

```bash
cd backend
cp .env.example .env.local
# Set CONVEX_DEPLOY_KEY from Convex Dashboard → Settings → Deploy Key
npm install
npx convex deploy
npx convex run seed:seedDemo
```

Record `NEXT_PUBLIC_CONVEX_URL` from `.env.local` in:

- [root README.md](../../README.md)
- [docs/DEVELOPMENT_PLAN.md](../../docs/DEVELOPMENT_PLAN.md) Shared URLs
- [dev.md](../../dev.md) section 3

Notify Person 3: `VITE_CONVEX_URL` = same URL.
