# Deploy Convex

```bash
cd backend
npm install
npx convex dev          # first time: creates deployment, writes .env.local
npx convex run seed:seedDemo
npx convex deploy       # production
```

Copy `NEXT_PUBLIC_CONVEX_URL` from Convex dashboard into Vercel env vars.

Person 3 needs the same URL in `VITE_CONVEX_URL`.
