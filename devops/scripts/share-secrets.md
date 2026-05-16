# Sharing secrets safely

## Rules
1. **Never** put real values in any file inside the repo, even `.env.example`.
2. **Never** paste secrets into Slack/Discord public channels, PR descriptions, or issue comments.
3. **Never** screenshot a terminal that shows secrets.
4. Rotate immediately if a secret is exposed (Neon → Reset password; OpenAI → Revoke key).

## Distribution channels (in order of preference)
1. **1Password / Bitwarden** shared vault — best for long-lived secrets.
2. **Discord DM** (1-to-1) — acceptable for hackathon speed.
3. **Encrypted message** (Signal) — for very sensitive values.

## What each member needs

| Secret | Owner | Goes to |
|--------|-------|---------|
| `DATABASE_URL` | Member C | Member B |
| `DIRECT_URL` | Member C | Member B |
| `OPENAI_API_KEY` | Member C | Member B |
| `JWT_SECRET` | Member B generates | nobody — backend only |
| Seed login (`test@studymate.ai / password123`) | Member C | All members |

## What to do if a secret leaks
1. **OpenAI key**: https://platform.openai.com/api-keys → revoke immediately, generate new.
2. **Neon DB**: Neon dashboard → Roles → reset password → update Render env.
3. **JWT secret**: regenerate, redeploy backend, all users get logged out (expected).
