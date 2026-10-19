import { verifyAdminToken } from "@/lib/admin-token";

export async function isAdminRequest(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("admin_token="))
    ?.slice("admin_token=".length);
  const secret = process.env.JWT_SECRET;

  return Boolean(
    token &&
      secret &&
      Buffer.byteLength(secret) >= 32 &&
    (await verifyAdminToken(token, secret)),
  );
}
