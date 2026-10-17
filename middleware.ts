import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const secret = process.env.JWT_SECRET;

  if (token && secret && Buffer.byteLength(secret) >= 32 && await verifyAdminToken(token, secret)) {
    return NextResponse.next();
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  if (token) {
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
