// lib/presence.js
const globalPresence = globalThis;
if (!globalPresence.activeSessions) {
  globalPresence.activeSessions = new Map();
}

export function updateSession(sessionId) {
  globalPresence.activeSessions.set(sessionId, Date.now());
  cleanupSessions();
}

export function getActiveCount() {
  cleanupSessions();
  return globalPresence.activeSessions.size;
}

function cleanupSessions() {
  const now = Date.now();
  for (const [sessionId, lastSeen] of globalPresence.activeSessions.entries()) {
    if (now - lastSeen > 15000) { // 15 seconds timeout
      globalPresence.activeSessions.delete(sessionId);
    }
  }
}
