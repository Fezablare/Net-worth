import { cookies } from "next/headers";

export const AUTH_COOKIE = "net-worth-auth";
const TOKEN_VALUE = "authenticated";

export function getPin(): string {
  return process.env.NET_WORTH_PIN ?? "1234";
}

export function isValidPin(pin: string): boolean {
  return pin === getPin();
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === TOKEN_VALUE;
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function createAuthCookieValue(): string {
  return TOKEN_VALUE;
}
