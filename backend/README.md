# StudyMate Backend

Express + Prisma + Postgres (Neon) + OpenAI.

## Setup
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | nodemon, hot reload |
| `npm start` | production entry |
| `npm run seed` | seed test user + sample data |
| `npm run prisma:migrate` | create migration |
| `npm run prisma:generate` | regenerate client |

## Folder structure
```
src/
  server.js           entry point
  app.js              express config + middleware
  config/             database + openai clients
  routes/             route definitions
  controllers/        request handlers
  services/           business logic + db access
  middleware/         auth, validation, rate limit, errors
  validators/         Zod schemas
  utils/              response + async wrappers
prisma/
  schema.prisma
  seed.js
```

## API routes
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/auth/register | – | create user, return JWT |
| POST | /api/auth/login | – | login, return JWT |
| GET  | /api/auth/me | ✓ | current user |
| GET  | /api/notes | ✓ | list notes |
| POST | /api/notes | ✓ | create note |
| GET  | /api/notes/:id | ✓ | get note |
| PUT  | /api/notes/:id | ✓ | update note |
| DELETE | /api/notes/:id | ✓ | delete note (cascades flashcards) |
| POST | /api/ai/summarize | ✓ + RL | body `{ noteId }` → `{ summary }` |
| POST | /api/ai/flashcards | ✓ + RL | body `{ noteId }` → 8 flashcards |
| POST | /api/ai/quiz | ✓ + RL | body `{ noteId }` → 5 MCQs |
| POST | /api/progress/save | ✓ | body `{ noteId, score, total }` |
| GET  | /api/progress | ✓ | `{ attempts, avgScore }` |

RL = rate limited (5 req / 15 min / IP).

## Response shape
```json
{ "success": true, "data": {...}, "message": "..." }
{ "success": false, "error": "...", "details": [...] }
```

## Member B contribution (Backend Lead)

### Owned modules
- **Auth**: registration, login, JWT issue/verify, `protect` middleware (`auth.service`, `auth.controller`, `auth.middleware`)
- **Notes**: full CRUD scoped to authenticated user
- **AI**: OpenAI summarize, flashcard generation, quiz generation (`ai.service`, rate-limited routes)
- **Progress**: quiz attempt persistence and aggregated stats
- **Infrastructure**: Zod validators, standard `apiResponse` envelope, global error handler, CORS, body size limit

### Architecture
```
Routes → protect / validate / rateLimit → Controllers → Services → Prisma | OpenAI
```

### Security
| Control | Implementation |
|---------|----------------|
| Password storage | bcrypt, 10 salt rounds |
| API auth | JWT Bearer token, `protect` on private routes |
| CORS | Whitelist `FRONTEND_URL` only |
| Request size | JSON body limit 10kb |
| AI abuse | 5 requests / 15 min / IP on `/api/ai/*` |
| Input validation | Zod on auth, notes, AI bodies |
| Error responses | `{ success, message, error }` — `error` mirrors `message` for frontend |

### Demo credentials (seed)
```
Email:    test@studymate.ai
Password: password123
```
Run `npm run seed` after migrations to create the test user, sample notes, flashcards, and quiz attempts.

### Health check
`GET /health` — use for Render deploy health checks.

See also: [`docs/BACKEND_CONTRIBUTION.md`](../docs/BACKEND_CONTRIBUTION.md) and [`docs/PRESENTATION.md`](../docs/PRESENTATION.md).

## Deploy (Render)
1. New Web Service → connect GitHub repo.
2. Root directory: `backend`.
3. Build: `npm install && npx prisma generate && npx prisma migrate deploy`.
4. Start: `node src/server.js`.
5. Env vars: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `NODE_ENV=production`, `FRONTEND_URL`.
