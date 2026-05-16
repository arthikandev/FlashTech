# PresenceIQ API Contract

**Base URL**: `http://localhost:3000` (dev) · `https://<vercel-app>.vercel.app` (prod)  
**Maintained by**: Person 2 (Backend)

---

## Embed

```html
<script src="{BASE_URL}/api/embed/seylan-demo" async></script>
```

**Event** (after fingerprint):

```javascript
window.addEventListener("presenceiq:ready", (e) => {
  const { visitorId, businessId, sessionId } = e.detail;
});
```

---

## POST /api/fingerprint

Register or update visitor.

**Body**:

```json
{
  "embedKey": "seylan-demo",
  "fingerprint": "abc123",
  "path": "/pricing",
  "title": "Gold vs Platinum",
  "language": "en",
  "referrer": "https://google.com"
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "visitorId": "...",
    "businessId": "...",
    "returnCount": 4,
    "isKnownVisitor": true,
    "crmId": "CRM-001"
  }
}
```

---

## POST /api/intent

Score visitor intent (GPT-4o). Requires `OPENAI_API_KEY` or returns demo fallback for seeded Sarangan.

**Body**: `{ "visitorId": "...", "businessId": "..." }`

**Response 200**:

```json
{
  "success": true,
  "data": {
    "intentScore": 96,
    "personalisedOpener": "Welcome back Sarangan — ...",
    "recommendedAction": "Offer account opening walkthrough",
    "signals": ["return_visitor", "pricing_page_x3"],
    "computedAt": 1715854321000
  }
}
```

---

## POST /api/pipeline

**Person 1** calls this after `presenceiq:ready`. Waits for CRM (optional) then scores intent.

**Body**:

```json
{
  "visitorId": "...",
  "businessId": "...",
  "waitForCrmMs": 500
}
```

**Response 200**:

```json
{
  "success": true,
  "data": {
    "intelligence": { "intentScore": 96, "personalisedOpener": "...", "recommendedAction": "...", "signals": [], "computedAt": 0 },
    "visitor": { "name": "Sarangan", "language": "en", "crmId": "CRM-001" },
    "business": { "name": "Seylan Bank", "industry": "bank", "personaTone": "formal" },
    "pipelineMs": 450
  }
}
```

---

## POST /api/webhooks/n8n/crm

**Header**: `X-Webhook-Secret: {N8N_WEBHOOK_SECRET}`

**Body**:

```json
{
  "visitorId": "...",
  "crmId": "CRM-001",
  "crmData": {
    "name": "Sarangan",
    "email": "sarangan@example.com",
    "accountType": "prospect",
    "churnRisk": "low",
    "notes": "Compared Gold and Platinum plans 3 times this week"
  }
}
```

---

## POST /api/webhooks/beyondpresence/session

**Header**: `X-BP-Webhook-Secret: {BP_WEBHOOK_SECRET}`

**Body**:

```json
{
  "visitorId": "...",
  "businessId": "...",
  "transcript": [{ "role": "user", "text": "Yes, open account", "timestamp": 0 }],
  "outcome": "converted",
  "sentimentArc": [{ "turn": 1, "score": 0.8 }],
  "actionItems": ["Send account form"],
  "duration": 45
}
```

Fires hot-lead Slack trigger when latest `intentScore > 80`.

---

## Convex queries (Person 3 dashboard)

| Query | Args | Returns |
|-------|------|---------|
| `intelligence.listLiveSessions` | `{ businessId }` | Sessions with latest scores |
| `intelligence.getSessionDetail` | `{ visitorId }` | Visitor + intelligence + conversation |
| `intelligence.getIntelligenceForAvatar` | `{ visitorId }` | Latest intelligence for Person 1 |

**Convex URL**: set `NEXT_PUBLIC_CONVEX_URL` / `VITE_CONVEX_URL`

---

## Fake CRM (n8n / Person 3)

```json
{
  "CRM-001": {
    "name": "Sarangan",
    "email": "sarangan@example.com",
    "accountType": "prospect",
    "churnRisk": "low",
    "notes": "Compared Gold and Platinum plans 3 times this week"
  }
}
```

---

## Embed keys

| Site | embedKey |
|------|----------|
| Seylan Bank | `seylan-demo` |
| CloudMetrics SaaS | `cloudmetrics-demo` |
| Coral Resort | `coral-demo` |
