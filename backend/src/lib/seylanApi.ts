/**
 * Seylan Bank hackathon sandbox client (Team 8).
 * All requests use x-api-key; base URL is never production Seylan.
 */

export type SeylanCrmData = {
  name: string;
  email?: string;
  accountType?: string;
  churnRisk?: string;
  notes?: string;
};

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;

let rateLimitTimestamps: number[] = [];

function getConfig() {
  const baseUrl = process.env.SEYLAN_API_BASE_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.SEYLAN_API_KEY?.trim();
  const lookupPath =
    process.env.SEYLAN_CUSTOMER_LOOKUP_PATH?.trim() ||
    "/api/accounts/{accountNumber}";
  const demoAccount =
    process.env.SEYLAN_DEMO_ACCOUNT_NUMBER?.trim() || "064000012548001";

  return { baseUrl, apiKey, lookupPath, demoAccount };
}

export function isSeylanApiConfigured(): boolean {
  const { baseUrl, apiKey } = getConfig();
  return Boolean(baseUrl && apiKey);
}

function checkRateLimit(): void {
  const now = Date.now();
  rateLimitTimestamps = rateLimitTimestamps.filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (rateLimitTimestamps.length >= RATE_LIMIT_MAX) {
    throw new Error(
      `Seylan sandbox rate limit exceeded (${RATE_LIMIT_MAX} requests per 15 minutes)`
    );
  }
  rateLimitTimestamps.push(now);
}

export async function seylanFetch(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const { baseUrl, apiKey } = getConfig();
  if (!baseUrl || !apiKey) {
    return { ok: false, status: 0, data: null };
  }

  checkRateLimit();

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        ...(options.headers as Record<string, string>),
      },
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("[seylan] fetch failed", path, err);
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timeout);
  }
}

/** Map sandbox JSON to PresenceIQ visitor crmData shape */
export function mapSeylanResponseToCrm(data: unknown): SeylanCrmData | null {
  if (!data || typeof data !== "object") return null;

  const o = data as Record<string, unknown>;
  const nested =
    (o.data as Record<string, unknown>) ||
    (o.account as Record<string, unknown>) ||
    (o.customer as Record<string, unknown>) ||
    o;

  const name = pickString(nested, [
    "customerName",
    "accountHolderName",
    "holderName",
    "name",
    "fullName",
  ]);
  if (!name) return null;

  const accountType = pickString(nested, [
    "accountType",
    "type",
    "productType",
    "accountCategory",
  ]);
  const email = pickString(nested, ["email", "emailAddress"]);
  const notes = pickString(nested, [
    "notes",
    "description",
    "remarks",
    "accountStatus",
    "status",
  ]);
  const balance = nested.availableBalance ?? nested.balance ?? nested.ledgerBalance;

  return {
    name,
    email: email ?? undefined,
    accountType: accountType ?? "sandbox",
    churnRisk: "low",
    notes:
      notes ??
      (balance != null
        ? `Seylan sandbox account — balance ${String(balance)}`
        : "Seylan sandbox CRM enrichment"),
  };
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function resolveLookupPath(template: string, accountNumber: string): string {
  return template
    .replace("{accountNumber}", encodeURIComponent(accountNumber))
    .replace("{account}", encodeURIComponent(accountNumber));
}

const FALLBACK_PATHS = [
  "/api/accounts/{accountNumber}",
  "/accounts/{accountNumber}",
  "/api/v1/accounts/{accountNumber}",
];

/**
 * Fetch CRM profile from Seylan sandbox for an account number.
 * Tries configured path then fallbacks. Returns null on failure (use demoCrm).
 */
export async function fetchCrmForVisitor(args: {
  accountNumber?: string;
  crmId?: string;
}): Promise<{ crmId: string; crmData: SeylanCrmData } | null> {
  if (!isSeylanApiConfigured()) return null;

  const { lookupPath, demoAccount } = getConfig();
  const accountNumber = args.accountNumber ?? demoAccount;
  const crmId = args.crmId ?? `ACCT-${accountNumber}`;

  const pathsToTry = [
    resolveLookupPath(lookupPath, accountNumber),
    ...FALLBACK_PATHS.filter(
      (p) => resolveLookupPath(p, accountNumber) !== resolveLookupPath(lookupPath, accountNumber)
    ).map((p) => resolveLookupPath(p, accountNumber)),
  ];

  for (const path of pathsToTry) {
    const { ok, status, data } = await seylanFetch(path, { method: "GET" });
    if (ok) {
      const crmData = mapSeylanResponseToCrm(data);
      if (crmData) return { crmId, crmData };
    } else if (status !== 404 && status !== 0) {
      console.warn("[seylan] lookup non-ok", path, status);
    }
  }

  return null;
}

/** Ping sandbox for health checks (short timeout). */
export async function pingSeylanSandbox(): Promise<"reachable" | "unreachable" | "not_configured"> {
  if (!isSeylanApiConfigured()) return "not_configured";
  const { ok } = await seylanFetch("/", { method: "GET" });
  if (ok) return "reachable";
  const { status } = await seylanFetch("/health", { method: "GET" });
  if (status > 0 && status < 500) return "reachable";
  return "unreachable";
}

export function getSeylanDemoAccountNumber(): string {
  return getConfig().demoAccount;
}
