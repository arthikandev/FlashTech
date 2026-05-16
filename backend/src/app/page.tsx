import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>PresenceIQ Backend</h1>
      <p>Pre-conversation intelligence API — Cursor Colombo 2026</p>
      <p>
        <Link href="/dashboard">Open live dashboard</Link> (requires sign-in)
      </p>
      <ul>
        <li>
          <a href="/api/health">GET /api/health</a>
        </li>
        <li>
          <code>GET /api/embed/seylan-demo</code> — embed SDK
        </li>
        <li>
          <code>POST /api/pipeline</code> — full intel pipeline
        </li>
      </ul>
      <p>
        Docs: see repo <code>docs/API_CONTRACT.md</code>
      </p>
    </main>
  );
}
