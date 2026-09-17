import { NextResponse } from "next/server";

export const runtime = "nodejs";
import {
  authCookieOptions,
  createAuthCookieValue,
  isValidPin,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const pin = String(body.pin ?? "");

  if (!isValidPin(pin)) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("net-worth-auth", createAuthCookieValue(), authCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("net-worth-auth");
  return response;
}
