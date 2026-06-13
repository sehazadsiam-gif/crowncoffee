import crypto from "crypto";

const SECRET = process.env.ADMIN_SECRET || "crown-coffee-dev-secret-change-me";
export const SESSION_COOKIE = "crown_admin";

/** Deterministic session token derived from the secret. Good enough for a
 * single-admin dashboard guarding non-sensitive content edits. */
export function getSessionToken() {
  return crypto.createHmac("sha256", SECRET).update("crown-coffee-admin").digest("hex");
}

export function isValidSession(token) {
  if (!token) return false;
  const expected = getSessionToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "crown-admin";
  if (!password || password.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}
