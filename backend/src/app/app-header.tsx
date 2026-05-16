"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

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
      }}
    >
      <Link href="/" style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
        PresenceIQ
      </Link>
      <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>
        Dashboard
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
