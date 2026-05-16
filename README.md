# StudyMate AI

AI-powered study assistant: take notes, generate flashcards and quizzes, track progress.

## Team
| Member | Role | Branch |
|--------|------|--------|
| Member A | Frontend Lead | `feature/frontend-member-a` |
| Member B | Backend Lead | `feature/backend-member-b` |
| Member C | DB & DevOps Lead | `feature/devops-member-c` |

## Stack
- **Frontend**: Vite + React + Tailwind + React Router + Axios + Recharts
- **Backend**: Express + Prisma + PostgreSQL (Neon) + OpenAI + JWT
- **Hosting**: Netlify (frontend) + Render (backend) + Neon (database)

## Local development

### Backend
```bash
cd backend
cp .env.example .env       # fill in DATABASE_URL, DIRECT_URL, OPENAI_API_KEY, JWT_SECRET
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed               # optional: creates a test user + sample data
npm run dev                # http://localhost:3000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:3000
npm install
npm run dev                # http://localhost:5173
```

## Workflow
1. Pull `dev`.
2. Checkout your `feature/*` branch.
3. Pick an Issue from the [project board](../../issues) assigned to you.
4. Commit, push, open PR → `dev`.
5. After review, merge to `dev`. End of day: `dev` → `main`.

## Deploy
- **Backend → Render**: root `/backend`, build `npm install && npx prisma generate && npx prisma migrate deploy`, start `node src/server.js`.
- **Frontend → Netlify**: base `/frontend`, build `npm run build`, publish `dist`. Set `VITE_API_URL` to the Render URL.
- **Database → Neon**: copy `DATABASE_URL` and `DIRECT_URL` into Render env.

## Live URLs
- Frontend: _add after Netlify deploy_
- Backend: _add after Render deploy_
