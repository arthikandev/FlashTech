# StudyMate AI — 5-Minute Demo Script

## Setup (before presenting)

1. Open **incognito** browser window.
2. Confirm Render backend and Netlify frontend are live (or use local: backend `:3000`, frontend `:5173`).
3. Log in with seed user: `test@studymate.ai` / `password123`.
4. Have a note ready on a familiar topic (e.g. Photosynthesis from seed data).

---

## Demo flow (~5 minutes)

| Step | Action | Backend talking points (Member B) |
|------|--------|-----------------------------------|
| 1 | **Login** | "Passwords are hashed with bcrypt; the API returns a JWT. Every protected route checks the Bearer token in middleware." |
| 2 | **Dashboard** | "Notes are scoped per user via Prisma — `userId` on every query." |
| 3 | **Open / create note** | "Standard REST CRUD on `/api/notes`; Zod validates title and content." |
| 4 | **Summarize** | "Express calls OpenAI gpt-4o-mini; the summary is saved back on the note row." |
| 5 | **Flashcards** | "AI generates 8 cards; we delete old cards and persist new ones with cascade delete on the note." |
| 6 | **Quiz** | "Five MCQs returned as JSON; rate limit is 5 AI calls per 15 minutes per IP." |
| 7 | **Submit quiz** | "Score posts to `/api/progress/save` and creates a `QuizAttempt` row." |
| 8 | **Progress page** | "Dashboard aggregates attempts and average score via Prisma." |
| 9 | **Architecture slide** | "REST API on Render, React on Netlify, Neon PostgreSQL — stateless JWT, no server sessions." |
| 10 | **Git** | Show `feature/backend-member-b` → `dev` PR merged; three-member branch workflow. |

---

## Backup plan

Record a **2-minute screen recording** of the full flow before presentation day. If live demo fails (network, OpenAI quota), play the recording.

---

## Test plan

### Automated smoke test (when `backend/.env` has valid `DATABASE_URL`)

```bash
cd backend
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

In another terminal:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@studymate.ai","password":"password123"}' \
  | jq -r '.data.token')

# 2. List notes
curl -s http://localhost:3000/api/notes -H "Authorization: Bearer $TOKEN" | jq .

# 3. Create note (capture id)
NOTE=$(curl -s -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Smoke Test","content":"Test content for API smoke test."}')
NOTE_ID=$(echo $NOTE | jq -r '.data.id')

# 4. Summarize (requires OPENAI_API_KEY)
curl -s -X POST http://localhost:3000/api/ai/summarize \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"noteId\":\"$NOTE_ID\"}" | jq .

# 5. Flashcards
curl -s -X POST http://localhost:3000/api/ai/flashcards \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"noteId\":\"$NOTE_ID\"}" | jq .

# 6. Quiz
curl -s -X POST http://localhost:3000/api/ai/quiz \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"noteId\":\"$NOTE_ID\"}" | jq .

# 7. Save progress
curl -s -X POST http://localhost:3000/api/progress/save \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"noteId\":\"$NOTE_ID\",\"score\":4,\"total\":5}" | jq .

# 8. Get progress
curl -s http://localhost:3000/api/progress -H "Authorization: Bearer $TOKEN" | jq .
```

### Manual browser test (no backend env)

1. Start backend with filled `.env` and frontend with `VITE_API_URL`.
2. Register or login with seed credentials.
3. Create a note → open detail → **Summarize**.
4. Go to **Flashcards** → flip cards.
5. Go to **Quiz** → answer questions → submit.
6. Open **Progress** → confirm chart shows attempts.

### Smoke test status (this wrap-up)

| Check | Status |
|-------|--------|
| API contract (`ai.api.js`, `apiResponse.error`) | Fixed in code |
| Prisma init migration committed | `backend/prisma/migrations/20260516120000_init/` |
| Live E2E with database | **Blocked** — no `backend/.env` with `DATABASE_URL` in repo; run manual steps above after configuring Neon |

---

## Environment checklist (Render)

See `devops/deploy/env-vars.md`:

- `DATABASE_URL`, `DIRECT_URL`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `FRONTEND_URL` (Netlify URL)
- `NODE_ENV=production`
