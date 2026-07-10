// lib/manager-auth.js — PIN-based auth for the Manager portal
// Separate from the main admin auth so managers don't need the full admin password.

export const MANAGER_PIN = process.env.MANAGER_PIN || "456456";
export const MANAGER_COOKIE = "crown_manager";

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function checkManagerPin(pin) {
  if (!pin) return false;
  return timingSafeEqual(String(pin), MANAGER_PIN);
}

export async function getManagerToken() {
  const encoder = new TextEncoder();
  const data = encoder.encode(MANAGER_PIN + ":crown-manager-session");
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidManagerSession(token) {
  if (!token) return false;
  const expected = await getManagerToken();
  return timingSafeEqual(token, expected);
}
