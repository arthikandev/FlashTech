import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getFrontendUrl } from "@/lib/frontendUrl";

/**
 * Browser visits to `/` on the API server should land on the Vite product UI.
 * Add `?api=1` to stay on the API index (docs + health links).
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  if (request.nextUrl.searchParams.get("api") === "1") {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/html")) {
    return NextResponse.next();
  }

  const frontend = getFrontendUrl();
  if (!frontend) return NextResponse.next();

  return NextResponse.redirect(frontend);
}

export const config = {
  matcher: "/",
};
