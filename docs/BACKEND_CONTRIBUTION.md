# Member B — Backend Lead Contribution

**StudyMate AI** | Express REST API, JWT auth, OpenAI integration, Prisma ORM

## Owned modules

| Area | Files / responsibility |
|------|------------------------|
| Authentication | `auth.service.js`, `auth.controller.js`, `auth.middleware.js`, `auth.validator.js` |
| Notes CRUD | `notes.controller.js`, `notes.routes.js` |
| AI features | `ai.service.js`, `ai.controller.js`, `ai.routes.js`, `ai.validator.js` |
| Progress tracking | `progress.controller.js`, `progress.routes.js` |
| Cross-cutting | `apiResponse.js`, `asyncHandler.js`, `errorHandler.js`, `rateLimiter.js`, `validate.js` |
| Database | `prisma/schema.prisma`, `prisma/seed.js`, `prisma/migrations/` |

## Architecture

```
Client (React + Axios)
    → Express routes (/api/auth, /api/notes, /api/ai, /api/progress)
    → Middleware (CORS, JSON body, JWT protect, Zod validate, rate limit)
    → Controllers (thin request/response)
    → Services (business logic, Prisma, OpenAI)
    → Neon PostgreSQL
```

## Security

- **Passwords**: bcrypt (10 rounds) before storage; never returned in API responses.
- **Sessions**: Stateless JWT in `Authorization: Bearer` header; `protect` middleware on all private routes.
- **CORS**: Restricted to `FRONTEND_URL` from environment.
- **Payload limits**: JSON body capped at 10kb.
- **AI rate limiting**: 5 requests per 15 minutes per IP on `/api/ai/*`.
- **Validation**: Zod schemas on auth, notes, and AI request bodies.
- **Errors**: Standard envelope with `success`, `message`, and `error` (alias for frontend compatibility).

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register; returns JWT |
| POST | `/api/auth/login` | — | Login; returns JWT |
| GET | `/api/auth/me` | ✓ | Current user profile |
| GET | `/api/notes` | ✓ | List user's notes |
| POST | `/api/notes` | ✓ | Create note |
| GET | `/api/notes/:id` | ✓ | Get single note |
| PUT | `/api/notes/:id` | ✓ | Update note |
| DELETE | `/api/notes/:id` | ✓ | Delete note (cascades flashcards) |
| POST | `/api/ai/summarize` | ✓ + RL | Body `{ noteId }` → AI summary saved on note |
| POST | `/api/ai/flashcards` | ✓ + RL | Body `{ noteId }` → 8 flashcards persisted |
| POST | `/api/ai/quiz` | ✓ + RL | Body `{ noteId }` → 5 multiple-choice questions |
| POST | `/api/progress/save` | ✓ | Body `{ noteId, score, total }` |
| GET | `/api/progress` | ✓ | `{ attempts, avgScore }` |
| GET | `/health` | — | Health check for Render |

RL = rate limited.

## How to run locally

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, DIRECT_URL, JWT_SECRET, OPENAI_API_KEY
npm install
npx prisma generate
npx prisma migrate deploy   # or migrate dev for local dev
npm run seed
npm run dev
```

Server: `http://localhost:3000`

## Demo credentials (seed)

| Field | Value |
|-------|-------|
| Email | `test@studymate.ai` |
| Password | `password123` |

Seed also creates sample notes, flashcards, and quiz attempts for the Progress dashboard.

## Git workflow

- Feature branch: `feature/backend-member-b`
- Merged to `dev` via PR #1
- Commits include: Express app structure, Prisma schema, OpenAI service, JWT auth, rate limiting, API contract alignment
