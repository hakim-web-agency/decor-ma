import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/admin-token";

export const runtime = "nodejs";

const cookieName = "admin_token";
const sessionDurationSeconds = 60 * 60 * 8;

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  if (!adminPassword || !jwtSecret || Buffer.byteLength(jwtSecret) < 32) {
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (typeof body !== "object" || body === null || !("password" in body) || typeof body.password !== "string" || body.password.length > 256) {
    return NextResponse.json({ error: "Enter a valid password." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const submittedPassword = Buffer.from(body.password);
  const expectedPassword = Buffer.from(adminPassword);
  const passwordMatches = submittedPassword.length === expectedPassword.length
    && timingSafeEqual(submittedPassword, expectedPassword);

  if (!passwordMatches) {
    return NextResponse.json({ error: "The password you entered is incorrect." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const token = await signAdminToken(jwtSecret, expiresAt);
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
  return response;
}
