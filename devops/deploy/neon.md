# Neon Postgres

## Create project
1. Go to https://neon.tech → sign in with GitHub.
2. New Project → name `studymate-ai`, region close to you.
3. From the **Dashboard → Connection Details**, copy:
   - `DATABASE_URL` (pooled, port 6543) — for runtime queries.
   - `DIRECT_URL` (direct, port 5432) — for Prisma migrations.

## Share with Member B
Use a private channel (Discord DM, password manager). Never paste into Slack/public channels or commit to git.

## After Prisma migration
Open the Neon **Tables** view and confirm:
- `User`, `Note`, `Flashcard`, `QuizAttempt` exist
- `Flashcard.noteId` has ON DELETE CASCADE
- Seed user `test@studymate.ai` is present in `User`

## Backup
Neon free tier auto-snapshots daily. To restore, use **Branches → Restore** in the Neon UI.
