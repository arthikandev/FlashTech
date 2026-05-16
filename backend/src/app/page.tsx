import Link from "next/link";
import { frontendPath, getFrontendUrl } from "@/lib/frontendUrl";

export default function HomePage() {
  const frontend = getFrontendUrl();

  return (
    <main style={{ maxWidth: 640, lineHeight: 1.5 }}>
      <p
        style={{
          margin: "0 0 16px",
          padding: "12px 16px",
          background: "#fff8e6",
          border: "1px solid #f0d78c",
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        You are on the <strong>API server</strong> (Next.js). The marketing site,
        dashboard, and demos run on the <strong>frontend app</strong>.
      </p>

      <h1 style={{ marginTop: 0 }}>PresenceIQ API</h1>
      <p style={{ color: "#555" }}>
        Pre-conversation intelligence — Cursor Colombo 2026
      </p>

      <section
        style={{
          margin: "24px 0",
          padding: 20,
          background: "#0f172a",
          color: "#f8fafc",
          borderRadius: 12,
        }}
      >
        <p style={{ margin: "0 0 12px", fontSize: 14, opacity: 0.85 }}>
          Product UI (landing, dashboard, avatar demos)
        </p>
        <a
          href={frontend}
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "#E1E0CC",
            color: "#0f172a",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Open PresenceIQ app →
        </a>
        <ul style={{ margin: "16px 0 0", paddingLeft: 20, fontSize: 14 }}>
          <li>
            <a href={frontendPath("/dashboard")} style={{ color: "#93c5fd" }}>
              Dashboard
            </a>{" "}
            — live sessions, KPIs, analytics
          </li>
          <li>
            <a href={frontendPath("/demos/seylan")} style={{ color: "#93c5fd" }}>
              Seylan demo
            </a>{" "}
            — avatar + embed
          </li>
          <li>
            <a href={frontendPath("/demos/cloudmetrics")} style={{ color: "#93c5fd" }}>
              CloudMetrics demo
            </a>
          </li>
          <li>
            <a href={frontendPath("/demos/coral")} style={{ color: "#93c5fd" }}>
              Coral demo
            </a>
          </li>
        </ul>
      </section>

      <h2 style={{ fontSize: 16, marginBottom: 8 }}>API routes (this server)</h2>
      <ul style={{ fontSize: 14 }}>
        <li>
          <a href="/api/health">GET /api/health</a>
          {" · "}
          <a href="/api/health?probes=1">with latency probes</a>
        </li>
        <li>
          <code>GET /api/embed/seylan-demo</code> — embed SDK
        </li>
        <li>
          <code>POST /api/pipeline</code> — intent pipeline
        </li>
      </ul>

      <p style={{ fontSize: 13, color: "#666", marginTop: 24 }}>
        Local dev: run <code>cd frontend && npm run dev</code> then open{" "}
        <a href={frontend}>{frontend}</a>. API stays on this port (
        <code>npm run dev</code> / <code>dev:3001</code>).
      </p>

      <p style={{ fontSize: 13, color: "#666" }}>
        <Link href="/dashboard">Legacy API dashboard</Link> (basic table) · Docs:{" "}
        <code>docs/API_CONTRACT.md</code>
      </p>
    </main>
  );
}
