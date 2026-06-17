const SECRET = process.env.ADMIN_SECRET || "crown-coffee-dev-secret-change-me";
export const SESSION_COOKIE = "crown_admin";

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/** Deterministic session token derived from the secret. Good enough for a
 * single-admin dashboard guarding non-sensitive content edits. */
export async function getSessionToken() {
  const encoder = new TextEncoder();
  const data = encoder.encode(SECRET + ":crown-coffee-admin");
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidSession(token) {
  if (!token) return false;
  const expected = await getSessionToken();
  return timingSafeEqual(token, expected);
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "crown-admin";
  if (!password) return false;
  return timingSafeEqual(password, expected);
}
