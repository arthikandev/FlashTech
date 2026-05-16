import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PresenceIQ Backend",
  description: "Pre-conversation customer intelligence API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
