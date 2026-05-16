import { NextRequest } from "next/server";

export function verifyWebhookSecret(
  request: NextRequest,
  headerName: string,
  expectedSecret: string | undefined
): boolean {
  if (!expectedSecret) {
    return process.env.NODE_ENV !== "production";
  }
  const provided = request.headers.get(headerName);
  return provided === expectedSecret;
}
