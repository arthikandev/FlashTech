"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";

const SEYLAN_EMBED_KEY = "seylan-demo";

type SessionRow = {
  visitorId: string;
  fingerprint: string;
  name?: string;
  intentScore?: number;
  returnCount: number;
  lastSeenAt: number;
};

function SessionsTable({ sessions }: { sessions: SessionRow[] }) {
  if (sessions.length === 0) {
    return <p style={{ marginTop: 16 }}>No sessions yet. Load the embed on a demo site.</p>;
  }

  return (
    <table
      style={{
        marginTop: 16,
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14,
      }}
    >
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
          <th style={{ padding: 8 }}>Visitor</th>
          <th style={{ padding: 8 }}>Intent</th>
          <th style={{ padding: 8 }}>Returns</th>
          <th style={{ padding: 8 }}>Last seen</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((s) => (
          <tr key={s.visitorId} style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: 8 }}>{s.name ?? s.fingerprint}</td>
            <td style={{ padding: 8 }}>{s.intentScore ?? "—"}</td>
            <td style={{ padding: 8 }}>{s.returnCount}</td>
            <td style={{ padding: 8 }}>{new Date(s.lastSeenAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function DashboardPage() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();

  const authReady = clerkLoaded && !convexAuthLoading;
  const signedIn = Boolean(isSignedIn && isAuthenticated);

  const demoSessionsPage = useQuery(
    api.intelligence.listLiveSessionsDemo,
    authReady && !signedIn
      ? { embedKey: SEYLAN_EMBED_KEY, paginationOpts: { numItems: 50, cursor: null } }
      : "skip"
  );
  const demoSessions = demoSessionsPage?.page;

  const memberships = useQuery(
    api.businessMembers.listForCurrentUser,
    authReady && signedIn ? {} : "skip"
  );

  const seylanBusiness = useQuery(api.businesses.getByEmbedKey, {
    embedKey: SEYLAN_EMBED_KEY,
  });

  const linkCurrentUser = useMutation(api.businessMembers.linkCurrentUser);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const activeBusinessId: Id<"businesses"> | undefined =
    memberships?.[0]?.business?._id ?? seylanBusiness?._id;

  const sessionsPage = useQuery(
    api.intelligence.listLiveSessions,
    signedIn && activeBusinessId
      ? { businessId: activeBusinessId, paginationOpts: { numItems: 50, cursor: null } }
      : "skip"
  );
  const sessions = sessionsPage?.page;

  async function handleLinkSeylan() {
    if (!seylanBusiness?._id) return;
    setLinking(true);
    setLinkError(null);
    try {
      await linkCurrentUser({ businessId: seylanBusiness._id, role: "admin" });
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Failed to link business");
    } finally {
      setLinking(false);
    }
  }

  if (!authReady) {
    return (
      <main>
        <h1>Live sessions</h1>
        <p style={{ marginTop: 16 }}>Loading auth…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Live sessions</h1>
      <p style={{ color: "#666" }}>
        Convex dashboard — Clerk auth + <code>businessMembers</code>.
      </p>

      {!signedIn && (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            background: "#f0f7ff",
            borderRadius: 8,
          }}
        >
          <p>Sign in to link your account and manage businesses.</p>
          <SignInButton mode="modal">
            <button type="button" style={{ marginTop: 8 }}>
              Sign in
            </button>
          </SignInButton>
        </section>
      )}

      {!signedIn && demoSessions === undefined && (
        <p style={{ marginTop: 16 }}>Loading demo sessions…</p>
      )}

      {!signedIn && demoSessions && (
        <>
          <p style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
            Demo preview (Seylan Bank).
          </p>
          <SessionsTable sessions={demoSessions} />
        </>
      )}

      {signedIn && memberships === undefined && <p>Loading membership…</p>}

      {signedIn && memberships && memberships.length === 0 && (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            background: "#f5f5f5",
            borderRadius: 8,
          }}
        >
          <p>No business linked to your Clerk user yet.</p>
          <button
            type="button"
            onClick={handleLinkSeylan}
            disabled={linking || !seylanBusiness}
            style={{ marginTop: 8 }}
          >
            {linking ? "Linking…" : "Link me to Seylan Bank demo"}
          </button>
          {linkError && (
            <p style={{ color: "#b00020", marginTop: 8 }}>{linkError}</p>
          )}
        </section>
      )}

      {signedIn && memberships && memberships.length > 0 && (
        <ul style={{ marginTop: 16 }}>
          {memberships.map(({ business, membership }) =>
            business ? (
              <li key={membership._id}>
                {business.name} ({business.embedKey}) — {membership.role}
              </li>
            ) : null
          )}
        </ul>
      )}

      {signedIn && sessions === undefined && activeBusinessId && (
        <p style={{ marginTop: 16 }}>Loading sessions…</p>
      )}

      {signedIn && sessions && <SessionsTable sessions={sessions} />}

      <p style={{ marginTop: 24, fontSize: 14 }}>
        <a href={process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:5173"}>
          ← Open full product dashboard (frontend)
        </a>
        {" · "}
        <Link href="/?api=1">API home</Link>
      </p>
    </main>
  );
}
