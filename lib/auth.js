const SECRET = process.env.ADMIN_SECRET || "crown-coffee-dev-secret-change-me";
export const SESSION_COOKIE = "crown_admin";

/** Deterministic session token derived from the secret. Good enough for a
 * single-admin dashboard guarding non-sensitive content edits. */
export async function getSessionToken() {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("crown-coffee-admin")
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSession(token) {
  if (!token) return false;
  const expected = await getSessionToken();
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "crown-admin";
  if (!password || password.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < password.length; i++) {
    diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
