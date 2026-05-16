"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

const frontendUrl =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, "") ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://frontend-nu-neon-44.vercel.app");

export function AppHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: "1px solid #e5e5e5",
        flexWrap: "wrap",
      }}
    >
      <Link href="/" style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
        PresenceIQ API
      </Link>
      <a
        href={`${frontendUrl}/dashboard`}
        style={{ color: "#0369a1", textDecoration: "none", fontWeight: 500 }}
      >
        Product dashboard →
      </a>
      <Link href="/dashboard" style={{ color: "#666", textDecoration: "none", fontSize: 14 }}>
        API sessions
      </Link>
      <div style={{ flex: 1 }} />
      <Show when="signed-out">
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </header>
  );
}
