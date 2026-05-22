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
        You are on the <strong>API server</strong> (Next.js). The marketing site
        and canvas workspace run on the <strong>frontend app</strong>.
      </p>

      <h1 style={{ marginTop: 0 }}>PresenceIQ API</h1>
      <p style={{ color: "#555" }}>Pre-conversation intelligence</p>

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
          Product UI (landing, canvas workspace)
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
            <a href={frontendPath("/canvas")} style={{ color: "#93c5fd" }}>
              Canvas workspace
            </a>{" "}
            — live sessions, KPIs, analytics
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
          <code>GET /api/embed/&lt;embedKey&gt;</code> — embed SDK
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
        Docs: <code>docs/API_CONTRACT.md</code>
      </p>
    </main>
  );
}
