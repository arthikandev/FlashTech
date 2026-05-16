import { NextResponse } from "next/server";

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export function corsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Webhook-Secret, X-BP-Webhook-Secret",
    },
  });
}
