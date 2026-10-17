const encoder = new TextEncoder();

function encodeBase64Url(value: Uint8Array) {
  let binary = "";
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signAdminToken(secret: string, expiresAt: number) {
  const header = encodeBase64Url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = encodeBase64Url(encoder.encode(JSON.stringify({ sub: "admin", exp: expiresAt })));
  const content = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("HMAC", await getSigningKey(secret), encoder.encode(content));
  return `${content}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminToken(token: string, secret: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0]))) as { alg?: unknown; typ?: unknown };
    if (header.alg !== "HS256" || header.typ !== "JWT") return false;

    const signatureValid = await crypto.subtle.verify(
      "HMAC",
      await getSigningKey(secret),
      decodeBase64Url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!signatureValid) return false;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1]))) as { sub?: unknown; exp?: unknown };
    return payload.sub === "admin" && typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
