import type { Metadata } from "next";
import { AppHeader } from "./app-header";
import { Providers } from "./providers";

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
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
