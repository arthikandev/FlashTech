# PresenceIQ Architecture

## Pre-conversation pipeline (< 2s)

```mermaid
sequenceDiagram
    participant Site as DemoWebsite
    participant Embed as EmbedSDK
    participant API as NextJS_API
    participant Convex as Convex
    participant OpenAI as GPT4o
    participant n8n as n8n
    participant Avatar as BeyondPresence

    Site->>Embed: page load
    Embed->>API: POST fingerprint
    API->>Convex: upsert visitor
    API->>n8n: CRM fetch async
    n8n->>API: POST webhooks/n8n/crm
    Embed->>Site: presenceiq:ready
    Avatar->>API: POST pipeline
    API->>OpenAI: intent score
    API->>Convex: save intelligence
    API->>Avatar: opener plus score
    Avatar->>Site: personalised greeting
```

## Data model

- **businesses** — tenant config, embedKey, knowledge
- **visitors** — fingerprint, pageHistory, crmData
- **intelligence** — intentScore, personalisedOpener
- **conversations** — post-call transcript
- **triggers** — hot-lead Slack, CRM push rules

## Monorepo

| Folder | Stack |
|--------|-------|
| `backend/` | Next.js 15, Convex, OpenAI |
| `avatar/` | BeyondPresence, ElevenLabs |
| `frontend/` | Vite/React, Convex client |
| `devops/` | n8n workflows, deploy guides |
